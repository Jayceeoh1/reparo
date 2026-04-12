// @ts-nocheck
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe nu este configurat' }, { status: 503 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
    const { createClient } = await import('@/lib/supabase/server')

    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    const supabase = createClient()

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const meta = session.metadata || {}

      if (meta.type === 'subscription') {
        const exp = new Date(); exp.setMonth(exp.getMonth() + 1)
        await supabase.from('services').update({ plan: meta.plan, stripe_customer_id: session.customer, stripe_subscription_id: session.subscription, plan_expires_at: exp.toISOString() }).eq('id', meta.service_id)
        await supabase.from('payments').insert({ service_id: meta.service_id, user_id: meta.user_id, stripe_session_id: session.id, amount: session.amount_total, type: 'subscription', plan: meta.plan, status: 'paid' })
      }

      if (meta.type === 'promotion') {
        const days = meta.promo_type?.includes('30') ? 30 : 7
        const exp = new Date(); exp.setDate(exp.getDate() + days)
        if (meta.service_id) await supabase.from('services').update({ is_promoted: true, promoted_until: exp.toISOString() }).eq('id', meta.service_id)
        if (meta.listing_id) { await supabase.from('listings').update({ is_promoted: true }).eq('id', meta.listing_id); await supabase.from('listing_promotions').insert({ listing_id: meta.listing_id, user_id: meta.user_id, type: 'top', expires_at: exp.toISOString() }) }
        await supabase.from('payments').insert({ service_id: meta.service_id||null, user_id: meta.user_id, stripe_session_id: session.id, amount: session.amount_total, type: 'promotion', status: 'paid', metadata: { promo_type: meta.promo_type } })
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any
      await supabase.from('services').update({ plan: 'free', stripe_subscription_id: null, plan_expires_at: null }).eq('stripe_subscription_id', sub.id)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
