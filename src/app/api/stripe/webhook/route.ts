// @ts-nocheck
import { NextResponse } from 'next/server'

// IMPORTANT: bodyParser trebuie dezactivat pentru verificarea semnăturii Stripe
export const config = { api: { bodyParser: false } }

// Map price ID → plan name
const PRICE_TO_PLAN: Record<string, string> = {
  'price_1TfNjoIvesVwLgCkFtblds9u': 'starter',
  'price_1TfNlCIvesVwLgCkP7CQEUiB': 'pro',
  'price_1TfO9RIvesVwLgCkrc6QaXfo': 'elite',
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const { createClient } = await import('@/lib/supabase/server')

  // Citim body-ul ca raw buffer pentru verificarea semnăturii
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  let event: any
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook signature invalid: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient()
  console.log('[webhook] Event received:', event.type)

  try {
    switch (event.type) {

      // ── 1. CHECKOUT COMPLETAT ─────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object
        const meta = session.metadata || {}
        const { user_id, service_id, plan, type: payType, promo_type, listing_id } = meta

        if (payType === 'subscription' && plan && service_id) {
          // Activează planul pe service
          await supabase.from('services').update({
            plan,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            plan_started_at: new Date().toISOString(),
            plan_expires_at: null, // subscription — fără expirare fixă
          }).eq('id', service_id)

          // Notificare in-app
          if (user_id) {
            await supabase.from('notifications').insert({
              user_id,
              type: 'plan_activated',
              title: `✅ Planul ${plan.charAt(0).toUpperCase() + plan.slice(1)} activat!`,
              body: `Abonamentul tău Club ${plan.charAt(0).toUpperCase() + plan.slice(1)} este acum activ. Bucură-te de toate beneficiile!`,
              data: { plan, service_id },
            })
          }

          console.log(`[webhook] Plan ${plan} activat pentru service ${service_id}`)
        }

        if (payType === 'promotion' && promo_type) {
          const days = promo_type.includes('30') ? 30 : 7
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + days)

          if (promo_type.startsWith('service_') && service_id) {
            await supabase.from('services').update({
              is_promoted: true,
              promoted_until: expiresAt.toISOString(),
            }).eq('id', service_id)
            console.log(`[webhook] Service ${service_id} promovat ${days} zile`)
          }

          if (promo_type.startsWith('listing_') && listing_id) {
            await supabase.from('listings').update({
              is_promoted: true,
              promoted_until: expiresAt.toISOString(),
            }).eq('id', listing_id)
            console.log(`[webhook] Listing ${listing_id} promovat ${days} zile`)
          }

          if (user_id) {
            await supabase.from('notifications').insert({
              user_id,
              type: 'promotion_activated',
              title: `🚀 Promovare activată ${days} zile!`,
              body: `Apari acum în primele rezultate în căutări pentru ${days} zile.`,
              data: { promo_type, service_id, listing_id },
            })
          }
        }
        break
      }

      // ── 2. SUBSCRIPTION REÎNNOIT ──────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        if (invoice.billing_reason !== 'subscription_cycle') break

        const subscriptionId = invoice.subscription
        if (!subscriptionId) break

        // Găsim service-ul după subscription ID
        const { data: svc } = await supabase
          .from('services')
          .select('id, owner_id, plan')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (svc) {
          // Reînnoire — resetăm plan_expires_at
          await supabase.from('services').update({
            plan_expires_at: null,
            is_active: true,
          }).eq('id', svc.id)

          if (svc.owner_id) {
            await supabase.from('notifications').insert({
              user_id: svc.owner_id,
              type: 'subscription_renewed',
              title: '🔄 Abonament reînnoit',
              body: `Abonamentul Club ${svc.plan} a fost reînnoit cu succes pentru luna aceasta.`,
              data: { plan: svc.plan },
            })
          }
          console.log(`[webhook] Subscription reînnoit pentru service ${svc.id}`)
        }
        break
      }

      // ── 3. PLATĂ EȘUATĂ ───────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription
        if (!subscriptionId) break

        const { data: svc } = await supabase
          .from('services')
          .select('id, owner_id, plan')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (svc?.owner_id) {
          await supabase.from('notifications').insert({
            user_id: svc.owner_id,
            type: 'payment_failed',
            title: '⚠️ Plată eșuată',
            body: 'Nu am putut procesa plata abonamentului tău. Verifică metoda de plată pentru a nu pierde accesul.',
            data: { plan: svc.plan },
          })
          console.log(`[webhook] Plată eșuată pentru service ${svc.id}`)
        }
        break
      }

      // ── 4. SUBSCRIPTION ANULAT / EXPIRAT ─────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const subscriptionId = subscription.id

        const { data: svc } = await supabase
          .from('services')
          .select('id, owner_id, plan')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (svc) {
          // Downgrade la free
          await supabase.from('services').update({
            plan: 'free',
            stripe_subscription_id: null,
            plan_expires_at: new Date().toISOString(),
          }).eq('id', svc.id)

          if (svc.owner_id) {
            await supabase.from('notifications').insert({
              user_id: svc.owner_id,
              type: 'subscription_cancelled',
              title: '❌ Abonament anulat',
              body: 'Abonamentul tău a expirat. Profilul tău a fost trecut pe planul Free. Poți reactiva oricând din dashboard.',
              data: { previous_plan: svc.plan },
            })
          }
          console.log(`[webhook] Subscription anulat — service ${svc.id} → free`)
        }
        break
      }

      // ── 5. SUBSCRIPTION ACTUALIZAT (upgrade/downgrade) ────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const subscriptionId = subscription.id
        const priceId = subscription.items?.data?.[0]?.price?.id
        const newPlan = priceId ? PRICE_TO_PLAN[priceId] : null

        if (!newPlan) break

        const { data: svc } = await supabase
          .from('services')
          .select('id, owner_id, plan')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (svc && svc.plan !== newPlan) {
          await supabase.from('services').update({ plan: newPlan }).eq('id', svc.id)

          if (svc.owner_id) {
            await supabase.from('notifications').insert({
              user_id: svc.owner_id,
              type: 'plan_changed',
              title: `🔄 Plan schimbat → ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}`,
              body: `Abonamentul tău a fost actualizat la Club ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}.`,
              data: { plan: newPlan, previous_plan: svc.plan },
            })
          }
          console.log(`[webhook] Plan actualizat ${svc.plan} → ${newPlan} pentru service ${svc.id}`)
        }
        break
      }

      default:
        console.log(`[webhook] Event ignorat: ${event.type}`)
    }

    return NextResponse.json({ received: true, type: event.type })

  } catch (err: any) {
    console.error('[webhook] Handler error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
