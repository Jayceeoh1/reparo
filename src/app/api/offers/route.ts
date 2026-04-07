import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: service } = await supabase
    .from('services').select('id').eq('owner_id', user.id).single()
  if (!service) return NextResponse.json({ error: 'No service' }, { status: 403 })

  const body = await request.json()

  // @ts-ignore
  const { data, error } = await supabase.from('offers')
    .insert({ ...body, service_id: (service as any).id })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // @ts-ignore
  const { data: qr } = await supabase.from('quote_requests')
    .select('user_id, car_brand, car_model').eq('id', body.request_id).single()

  if ((qr as any)?.user_id) {
    // @ts-ignore
    await supabase.from('notifications').insert({
      user_id: (qr as any).user_id,
      type: 'offer_received',
      title: 'Ai primit o ofertă nouă!',
      body: `Un service a trimis o ofertă pentru ${(qr as any).car_brand}`,
      data: { offer_id: (data as any).id, request_id: body.request_id },
    })
  }

  return NextResponse.json(data, { status: 201 })
}
