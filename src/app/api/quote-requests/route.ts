import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('quote_requests').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // 1. Inserează cererea
  // @ts-ignore
  const { data, error } = await supabase.from('quote_requests')
    .insert({ ...body, user_id: user.id }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 2. Dacă e o cerere pentru un service specific, notifică doar acel service
  if (body.target_service_id) {
    const { data: svc } = await supabase
      .from('services')
      .select('owner_id, name')
      .eq('id', body.target_service_id)
      .single() as { data: { owner_id: string; name: string } | null }

    if (svc && svc.owner_id) {
      await supabase.from('notifications').insert({
        user_id: svc.owner_id,
        type: 'new_request',
        title: '📋 Cerere nouă de ofertă!',
        body: `${body.car_brand} ${body.car_model} — ${(body.services||[]).slice(0,2).join(', ')}`,
        data: { request_id: data.id }
      })
    }
  } else {
    // 3. Notifică toate service-urile din același oraș
    const city = body.city
    if (city) {
      const { data: services } = await supabase
        .from('services')
        .select('owner_id')
        .eq('city', city)
        .eq('is_active', true)
        .limit(50)

      if (services && services.length > 0) {
        const notifInserts = services
          .filter(s => s.owner_id && s.owner_id !== user.id)
          .map(s => ({
            user_id: s.owner_id,
            type: 'new_request',
            title: '📋 Cerere nouă în orașul tău!',
            body: `${body.car_brand} ${body.car_model} — ${(body.services||[]).slice(0,2).join(', ')}`,
            data: { request_id: data.id }
          }))

        if (notifInserts.length > 0) {
          await supabase.from('notifications').insert(notifInserts)
        }
      }
    }
  }

  return NextResponse.json(data, { status: 201 })
}
