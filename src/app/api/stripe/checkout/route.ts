// @ts-nocheck
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe nu este configurat. Adaugă STRIPE_SECRET_KEY în variabilele de mediu.' }, { status: 503 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, plan, service_id, listing_id, promo_type } = body
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const PLANS = {
      basic: { price: 9900, name: 'Reparo Basic' },
      pro:   { price: 19900, name: 'Reparo Pro' },
    }
    const PROMOS = {
      service_top_7:  { price: 4900,  name: 'Promovare service 7 zile' },
      service_top_30: { price: 14900, name: 'Promovare service 30 zile' },
      listing_top_7:  { price: 1900,  name: 'Promovare anunț 7 zile' },
      listing_top_30: { price: 4900,  name: 'Promovare anunț 30 zile' },
    }

    if (type === 'subscription') {
      const planConfig = PLANS[plan]
      if (!planConfig) return NextResponse.json({ error: 'Plan invalid' }, { status: 400 })
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'ron', product_data: { name: planConfig.name }, unit_amount: planConfig.price, recurring: { interval: 'month' } }, quantity: 1 }],
        metadata: { user_id: user.id, service_id: service_id || '', plan, type: 'subscription' },
        success_url: `${siteUrl}/dashboard/service?payment=success&plan=${plan}`,
        cancel_url: `${siteUrl}/dashboard/service?payment=cancelled`,
        customer_email: user.email,
      })
      return NextResponse.json({ url: session.url })
    }

    if (type === 'promotion') {
      const promoConfig = PROMOS[promo_type]
      if (!promoConfig) return NextResponse.json({ error: 'Promo tip invalid' }, { status: 400 })
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'ron', product_data: { name: promoConfig.name }, unit_amount: promoConfig.price }, quantity: 1 }],
        metadata: { user_id: user.id, service_id: service_id || '', listing_id: listing_id || '', promo_type, type: 'promotion' },
        success_url: `${siteUrl}/dashboard/service?payment=success`,
        cancel_url: `${siteUrl}/dashboard/service?payment=cancelled`,
        customer_email: user.email,
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Tip invalid' }, { status: 400 })
  } catch (err: any) {
    console.error('Stripe error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
