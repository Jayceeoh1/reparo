import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/offers — service trimite oferta
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verifica ca userul are un service
  const { data: service } = await supabase
    .from('services').select('id').eq('owner_id', user.id).single()
  if (!service) return NextResponse.json({ error: 'No service found' }, { status: 403 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('offers')
    .insert({ ...body, service_id: service.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notifica clientul
  const { data: qr } = await supabase
    .from('quote_requests').select('user_id, car_brand, car_model').eq('id', body.request_id).single()
  if (qr?.user_id) {
    await supabase.from('notifications').insert({
      user_id: qr.user_id,
      type: 'offer_received',
      title: 'Ai primit o ofertă nouă!',
      body: `${service.id} a trimis o ofertă pentru ${qr.car_brand} ${qr.car_model}`,
      data: { offer_id: data.id, request_id: body.request_id },
    })
  }

  return NextResponse.json(data, { status: 201 })
}
