// @ts-nocheck
import { NextResponse } from 'next/server'

/**
 * API Public Serviceclub — doar pentru planurile Pro si Elite
 * Header: X-API-Key: <cheia din dashboard>
 * GET /api/public/services?city=Cluj&category=mecanica&limit=20
 */
export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key')
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key lipsa. Adauga header-ul X-API-Key.' },
      { status: 401 }
    )
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const { data: keyData } = await supabase
      .from('api_keys')
      .select('id, service_id, is_active, services(plan, name)')
      .eq('key', apiKey)
      .single()

    if (!keyData?.is_active) {
      return NextResponse.json({ error: 'API key invalid sau dezactivat.' }, { status: 401 })
    }

    const plan = keyData.services?.plan
    if (!['pro', 'elite', 'business_pro', 'business_elite'].includes(plan)) {
      return NextResponse.json(
        { error: 'API-ul necesita planul Club Pro sau Elite.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    let q = supabase
      .from('services')
      .select('id,name,city,rating_avg,rating_count,is_verified,plan,description,phone,business_type')
      .eq('is_active', true)
      .order('search_boost', { ascending: false })
      .order('rating_avg', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (city) q = q.ilike('city', `%${city}%`)
    if (category) q = q.ilike('description', `%${category}%`)

    const { data: services } = await q

    // Log usage (fire and forget)
    supabase.from('api_key_logs').insert({
      api_key_id: keyData.id,
      endpoint: '/api/public/services',
      params: { city, category, limit },
    }).then(() => {})

    return NextResponse.json({
      data: services || [],
      meta: { count: services?.length || 0, service: keyData.services?.name }
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
