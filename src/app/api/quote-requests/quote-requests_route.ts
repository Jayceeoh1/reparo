// @ts-nocheck
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

async function sendEmailNotification(to: string, subject: string, html: string) {
  // Folosim Supabase Edge Functions sau Resend pentru email
  // Dacă nu ai Resend configurat, notificările in-app funcționează oricum
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return // Email opțional — in-app notifs funcționează

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Reparo <noreply@reparo.ro>',
        to,
        subject,
        html,
      }),
    })
  } catch (e) {
    console.error('Email send failed:', e)
  }
}

function buildEmailHtml(body: any, requestId: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f0f6ff;font-family:'DM Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,0.1);">
        <!-- Header -->
        <div style="background:#0a1f44;padding:28px 32px;text-align:center;">
          <div style="display:inline-block;width:40px;height:40px;background:#1a56db;border-radius:10px;line-height:40px;font-size:20px;font-weight:900;color:#fff;margin-bottom:10px;">R</div>
          <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Reparo</div>
        </div>
        <!-- Body -->
        <div style="padding:32px;">
          <div style="background:#eaf3ff;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:inline-block;">
            <span style="font-size:13px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;">📋 Cerere nouă de ofertă</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;color:#0a1f44;margin:0 0 8px;letter-spacing:-0.5px;">
            Ai primit o cerere nouă!
          </h1>
          <p style="font-size:15px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
            Un client din zona ta caută un service. Trimite oferta rapid pentru a câștiga clientul.
          </p>
          <!-- Detalii cerere -->
          <div style="background:#f8faff;border-radius:14px;padding:20px;margin-bottom:24px;border:1px solid #e5e7eb;">
            <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Detalii cerere</div>
            <div style="margin-bottom:8px;">
              <span style="font-size:13px;color:#6b7280;">🚗 Mașina: </span>
              <span style="font-size:13px;font-weight:700;color:#0a1f44;">${body.car_brand} ${body.car_model}${body.car_year ? ` (${body.car_year})` : ''}</span>
            </div>
            ${body.car_fuel ? `<div style="margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">⛽ Combustibil: </span><span style="font-size:13px;font-weight:600;color:#0a1f44;">${body.car_fuel}</span></div>` : ''}
            <div style="margin-bottom:8px;">
              <span style="font-size:13px;color:#6b7280;">🔧 Servicii: </span>
              <span style="font-size:13px;font-weight:600;color:#0a1f44;">${(body.services || []).join(', ')}</span>
            </div>
            <div style="margin-bottom:8px;">
              <span style="font-size:13px;color:#6b7280;">📍 Oraș: </span>
              <span style="font-size:13px;font-weight:600;color:#0a1f44;">${body.city}</span>
            </div>
            ${body.urgency ? `<div><span style="font-size:13px;color:#6b7280;">⚡ Urgență: </span><span style="font-size:13px;font-weight:600;color:${body.urgency === 'urgent' ? '#dc2626' : body.urgency === 'saptamana' ? '#d97706' : '#16a34a'};">${body.urgency === 'urgent' ? '🚨 Urgent' : body.urgency === 'saptamana' ? '📅 Săptămâna aceasta' : '😌 Flexibil'}</span></div>` : ''}
          </div>
          <!-- CTA -->
          <div style="text-align:center;">
            <a href="https://reparo-omega.vercel.app/dashboard/service"
              style="display:inline-block;padding:14px 32px;background:#f59e0b;color:#fff;border-radius:50px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,0.3);">
              Trimite oferta acum →
            </a>
          </div>
          <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;line-height:1.6;">
            Răspunde rapid — clienții aleg de obicei primul service care trimite oferta.<br>
            Accesează <a href="https://reparo-omega.vercel.app/dashboard/service" style="color:#1a56db;">dashboard-ul tău</a> pentru a vedea toate cererile.
          </p>
        </div>
        <!-- Footer -->
        <div style="background:#f8faff;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">
            © 2026 Reparo · <a href="https://reparo-omega.vercel.app/confidentialitate" style="color:#9ca3af;">Confidențialitate</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // 1. Inserează cererea
  const { data, error } = await supabase.from('quote_requests')
    .insert({ ...body, user_id: user.id }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const emailHtml = buildEmailHtml(body, data.id)
  const emailSubject = `📋 Cerere nouă: ${body.car_brand} ${body.car_model} — ${body.city}`

  // 2. Service specific
  if (body.target_service_id) {
    const { data: svc } = await supabase
      .from('services')
      .select('owner_id, name, email')
      .eq('id', body.target_service_id)
      .single()

    if (svc?.owner_id) {
      // Notificare in-app
      await supabase.from('notifications').insert({
        user_id: svc.owner_id,
        type: 'new_request',
        title: '📋 Cerere nouă de ofertă!',
        body: `${body.car_brand} ${body.car_model} — ${(body.services||[]).slice(0,2).join(', ')}`,
        data: { request_id: data.id }
      })
      // Email
      if (svc.email) {
        await sendEmailNotification(svc.email, emailSubject, emailHtml)
      } else {
        // Caută emailul owner-ului din profiles
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('email:id')
          .eq('id', svc.owner_id)
          .single()
        // Emailul e în auth.users, nu profiles — folosim service email dacă există
      }
    }
  } else {
    // 3. Toate service-urile din același oraș
    const city = body.city
    if (city) {
      const { data: services } = await supabase
        .from('services')
        .select('owner_id, email')
        .eq('city', city)
        .eq('is_active', true)
        .limit(50)

      if (services && services.length > 0) {
        const eligible = services.filter(s => s.owner_id && s.owner_id !== user.id)

        // Notificări in-app (batch)
        if (eligible.length > 0) {
          await supabase.from('notifications').insert(
            eligible.map(s => ({
              user_id: s.owner_id,
              type: 'new_request',
              title: '📋 Cerere nouă în orașul tău!',
              body: `${body.car_brand} ${body.car_model} — ${(body.services||[]).slice(0,2).join(', ')}`,
              data: { request_id: data.id }
            }))
          )
        }

        // Email-uri (cu rate limiting — max 20 emailuri per cerere)
        const emailTargets = eligible.filter(s => s.email).slice(0, 20)
        await Promise.allSettled(
          emailTargets.map(s =>
            sendEmailNotification(s.email, emailSubject, emailHtml)
          )
        )
      }
    }
  }

  return NextResponse.json(data, { status: 201 })
}
