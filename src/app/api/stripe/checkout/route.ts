// @ts-nocheck
// src/app/api/stripe/checkout/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PLANS = {
  basic: { price: 9900, name: 'Reparo Basic', interval: 'month' as const },
  pro:   { price: 19900, name: 'Reparo Pro',   interval: 'month' as const },
}

const PROMO_PRICES = {
  service_top_7:    { price: 4900,  name: 'Promovare service 7 zile' },
  service_top_30:   { price: 14900, name: 'Promovare service 30 zile' },
  listing_top_7:    { price: 1900,  name: 'Promovare anunț 7 zile' },
  listing_top_30:   { price: 4900,  name: 'Promovare anunț 30 zile' },
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, plan, service_id, listing_id } = body

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    if (type === 'subscription') {
      // Abonament lunar
      const planConfig = PLANS[plan as keyof typeof PLANS]
      if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'ron',
            product_data: { name: planConfig.name },
            unit_amount: planConfig.price,
            recurring: { interval: planConfig.interval },
          },
          quantity: 1,
        }],
        metadata: { user_id: user.id, service_id: service_id || '', plan, type: 'subscription' },
        success_url: `${siteUrl}/dashboard/service?payment=success&plan=${plan}`,
        cancel_url: `${siteUrl}/dashboard/service?payment=cancelled`,
        customer_email: user.email,
      })
      return NextResponse.json({ url: session.url })

    } else if (type === 'promotion') {
      // Promovare service sau anunț
      const promoKey = body.promo_type as keyof typeof PROMO_PRICES
      const promoConfig = PROMO_PRICES[promoKey]
      if (!promoConfig) return NextResponse.json({ error: 'Invalid promo type' }, { status: 400 })

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'ron',
            product_data: { name: promoConfig.name },
            unit_amount: promoConfig.price,
          },
          quantity: 1,
        }],
        metadata: {
          user_id: user.id,
          service_id: service_id || '',
          listing_id: listing_id || '',
          promo_type: promoKey,
          type: 'promotion',
        },
        success_url: `${siteUrl}/dashboard/service?payment=success&promo=${promoKey}`,
        cancel_url: `${siteUrl}/dashboard/service?payment=cancelled`,
        customer_email: user.email,
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
