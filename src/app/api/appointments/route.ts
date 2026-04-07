import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/appointments — creeaza programare dupa acceptarea ofertei
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Actualizeaza oferta ca acceptata
  if (body.offer_id) {
    await supabase.from('offers').update({ status: 'acceptata' }).eq('id', body.offer_id)
    // Respinge celelalte oferte ale aceleiasi cereri
    const { data: offer } = await supabase.from('offers').select('request_id').eq('id', body.offer_id).single()
    if (offer) {
      await supabase.from('offers').update({ status: 'refuzata' })
        .eq('request_id', offer.request_id).neq('id', body.offer_id)
      await supabase.from('quote_requests').update({ status: 'in_progres' }).eq('id', offer.request_id)
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notifica service-ul
  await supabase.from('notifications').insert({
    user_id: body.service_owner_id,
    type: 'appointment_confirmed',
    title: 'Programare nouă confirmată!',
    body: `Programare pe ${body.scheduled_date} la ${body.scheduled_time}`,
    data: { appointment_id: data.id },
  })

  return NextResponse.json(data, { status: 201 })
}
