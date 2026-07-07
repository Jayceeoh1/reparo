// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { subject, message, category } = body

  if (!subject || !message) {
    return NextResponse.json({ error: 'Subiect și mesaj obligatorii' }, { status: 400 })
  }

  // Salvăm ticket-ul în DB
  const { data: svc } = await supabase.from('services')
    .select('id, plan, name').eq('owner_id', user.id).single()

  const isPriority = svc?.plan && ['pro', 'elite', 'business_pro', 'business_elite'].includes(svc.plan)

  const { data: ticket } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    service_id: svc?.id || null,
    subject,
    message,
    category: category || 'general',
    priority: isPriority ? 'high' : 'normal',
    status: 'open',
  }).select().single()

  // Trimitem email la support (dacă RESEND_KEY există)
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (RESEND_KEY) {
    const planLabel = svc?.plan ? `[${svc.plan.toUpperCase()}]` : '[FREE]'
    const priorityLabel = isPriority ? '🔴 PRIORITAR' : '⚪ Normal'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Serviceclub Support <noreply@serviceclub.ro>',
        to: 'support@serviceclub.ro',
        subject: `${priorityLabel} ${planLabel} #${ticket?.id?.slice(0,8)} — ${subject}`,
        html: `
          <h2>Ticket nou #${ticket?.id?.slice(0,8)}</h2>
          <p><strong>Plan:</strong> ${svc?.plan || 'free'} ${isPriority ? '⭐' : ''}</p>
          <p><strong>Service:</strong> ${svc?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Categorie:</strong> ${category}</p>
          <hr/>
          <p><strong>Subiect:</strong> ${subject}</p>
          <p><strong>Mesaj:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      }),
    })

    // Confirmăm utilizatorului
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Serviceclub Support <noreply@serviceclub.ro>',
        to: user.email,
        subject: `Am primit mesajul tău — #${ticket?.id?.slice(0,8)}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#0a1f44;">Am primit mesajul tău!</h2>
            <p>Îți mulțumim că ne-ai contactat. Echipa noastră va răspunde în:</p>
            <ul>
              <li>${isPriority ? '<strong>Club Pro/Elite: maxim 4 ore</strong>' : 'Plan Free/Starter: maxim 24-48 ore'}</li>
            </ul>
            <p><strong>Subiect:</strong> ${subject}</p>
            <p><strong>Nr. ticket:</strong> #${ticket?.id?.slice(0,8)}</p>
          </div>
        `,
      }),
    })
  }

  return NextResponse.json({ ok: true, ticket_id: ticket?.id?.slice(0,8) })
}
