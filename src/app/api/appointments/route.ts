import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  try {
    if (body.offer_id) {
      // @ts-ignore
      await supabase.from('offers').update({ status: 'acceptata' }).eq('id', body.offer_id)
      // @ts-ignore
      const { data: offer } = await supabase.from('offers').select('request_id').eq('id', body.offer_id).single()
      if (offer) {
        // @ts-ignore
        await supabase.from('offers').update({ status: 'refuzata' }).eq('request_id', (offer as any).request_id).neq('id', body.offer_id)
        // @ts-ignore
        await supabase.from('quote_requests').update({ status: 'in_progres' }).eq('id', (offer as any).request_id)
      }
    }
  } catch (e) { console.error(e) }

  const { service_owner_id, ...appointmentData } = body
  const { data, error } = await supabase.from('appointments').insert({ ...appointmentData, user_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (service_owner_id) {
    // @ts-ignore
    await supabase.from('notifications').insert({ user_id: service_owner_id, type: 'appointment_confirmed', title: 'Programare nouă!', body: `Programare pe ${body.scheduled_date}`, data: { appointment_id: data.id } })
  }

  return NextResponse.json(data, { status: 201 })
}
