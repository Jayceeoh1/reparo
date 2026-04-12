// @ts-nocheck
// src/app/api/stripe/webhook/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const meta = session.metadata || {}

      if (meta.type === 'subscription') {
        // Activează abonamentul
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)
        
        await supabase.from('services').update({
          plan: meta.plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan_expires_at: expiresAt.toISOString(),
        }).eq('id', meta.service_id)

        await supabase.from('payments').insert({
          service_id: meta.service_id,
          user_id: meta.user_id,
          stripe_session_id: session.id,
          amount: session.amount_total,
          type: 'subscription',
          plan: meta.plan,
          status: 'paid',
        })

      } else if (meta.type === 'promotion') {
        // Activează promovarea
        const days = meta.promo_type.includes('30') ? 30 : 7
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + days)

        if (meta.service_id) {
          await supabase.from('services').update({
            is_promoted: true,
            promoted_until: expiresAt.toISOString(),
          }).eq('id', meta.service_id)
        }

        if (meta.listing_id) {
          await supabase.from('listings').update({ is_promoted: true }).eq('id', meta.listing_id)
          await supabase.from('listing_promotions').insert({
            listing_id: meta.listing_id,
            user_id: meta.user_id,
            type: 'top',
            expires_at: expiresAt.toISOString(),
          })
        }

        await supabase.from('payments').insert({
          service_id: meta.service_id || null,
          user_id: meta.user_id,
          stripe_session_id: session.id,
          amount: session.amount_total,
          type: 'promotion',
          status: 'paid',
          metadata: { promo_type: meta.promo_type, days },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      // Abonament anulat — downgrade la free
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('services').update({
        plan: 'free',
        stripe_subscription_id: null,
        plan_expires_at: null,
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      // Plată eșuată — notifică service-ul
      const invoice = event.data.object as Stripe.Invoice
      console.log('Payment failed for subscription:', invoice.subscription)
      break
    }
  }

  return NextResponse.json({ received: true })
}
