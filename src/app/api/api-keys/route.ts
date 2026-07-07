// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// GET — lista de chei
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: svc } = await supabase.from('services').select('id,plan').eq('owner_id', user.id).single()
  if (!svc) return NextResponse.json({ error: 'Service negasit' }, { status: 404 })

  const allowed = ['pro', 'elite', 'business_pro', 'business_elite']
  if (!allowed.includes(svc.plan)) {
    return NextResponse.json({ error: 'Plan Pro sau Elite necesar' }, { status: 403 })
  }

  const { data: keys } = await supabase.from('api_keys')
    .select('id, key, name, is_active, created_at')
    .eq('service_id', svc.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ keys: keys || [] })
}

// POST — generare cheie noua
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: svc } = await supabase.from('services').select('id,plan').eq('owner_id', user.id).single()
  if (!svc) return NextResponse.json({ error: 'Service negasit' }, { status: 404 })

  const allowed = ['pro', 'elite', 'business_pro', 'business_elite']
  if (!allowed.includes(svc.plan)) {
    return NextResponse.json({ error: 'Plan Pro sau Elite necesar' }, { status: 403 })
  }

  // Max 3 chei per service
  const { count } = await supabase.from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', svc.id)
    .eq('is_active', true)

  if ((count || 0) >= 3) {
    return NextResponse.json({ error: 'Maxim 3 chei API active.' }, { status: 400 })
  }

  const body = await request.json()
  const key = `sc_live_${crypto.randomBytes(24).toString('hex')}`

  const { data: newKey } = await supabase.from('api_keys').insert({
    service_id: svc.id,
    key,
    name: body.name || 'Cheie API',
    is_active: true,
  }).select().single()

  return NextResponse.json({ key: newKey })
}

// DELETE — dezactivare cheie
export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const { data: svc } = await supabase.from('services').select('id').eq('owner_id', user.id).single()

  await supabase.from('api_keys').update({ is_active: false })
    .eq('id', id).eq('service_id', svc?.id)

  return NextResponse.json({ ok: true })
}
