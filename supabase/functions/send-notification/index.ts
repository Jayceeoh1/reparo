// Supabase Edge Function: send-notification
// Deploy: supabase functions deploy send-notification
// Folosește Resend sau Supabase SMTP built-in

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'noreply@reparo.ro'

interface EmailPayload {
  to: string
  type: 'offer_received' | 'appointment_confirmed' | 'itp_reminder' | 'new_message'
  data: Record<string, any>
}

const templates = {
  offer_received: (d: any) => ({
    subject: `🎉 Ai primit o ofertă nouă pentru ${d.car_brand} ${d.car_model}!`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#f0f6ff;padding:24px">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb">
          <div style="text-align:center;margin-bottom:24px">
            <div style="width:56px;height:56px;background:#1a56db;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-weight:800;font-size:24px;color:#fff">R</div>
            <h1 style="font-family:'Sora',sans-serif;font-weight:800;font-size:22px;color:#0a1f44;margin:12px 0 4px">Ofertă nouă primită!</h1>
            <p style="color:#6b7280;font-size:14px;margin:0">${d.service_name} a trimis o ofertă pentru cererea ta</p>
          </div>
          <div style="background:#eaf3ff;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Preț total estimat</div>
            <div style="font-family:'Sora',sans-serif;font-weight:800;font-size:32px;color:#0a1f44">${d.price_total ? d.price_total.toLocaleString() + ' RON' : 'Negociabil'}</div>
          </div>
          <div style="margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Mașina</span>
              <span style="font-weight:600;font-size:13px;color:#111827">${d.car_brand} ${d.car_model} ${d.car_year || ''}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Service</span>
              <span style="font-weight:600;font-size:13px;color:#111827">${d.service_name}</span>
            </div>
            ${d.available_date ? `<div style="display:flex;justify-content:space-between;padding:10px 0">
              <span style="color:#6b7280;font-size:13px">Disponibil</span>
              <span style="font-weight:600;font-size:13px;color:#111827">${d.available_date} · ${d.available_time}</span>
            </div>` : ''}
          </div>
          <a href="${Deno.env.get('SITE_URL')}/oferte" style="display:block;text-align:center;background:#f59e0b;color:#fff;padding:14px;border-radius:50px;text-decoration:none;font-family:'Sora',sans-serif;font-weight:700;font-size:15px">
            ✦ Vezi și acceptă oferta
          </a>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px">Reparo · Platforma de servicii auto din România</p>
        </div>
      </div>
    `
  }),

  appointment_confirmed: (d: any) => ({
    subject: `✅ Programarea ta a fost confirmată — ${d.service_name}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#f0f6ff;padding:24px">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:48px;margin-bottom:12px">📅</div>
            <h1 style="font-family:'Sora',sans-serif;font-weight:800;font-size:22px;color:#0a1f44;margin:0 0 4px">Programare confirmată!</h1>
            <p style="color:#6b7280;font-size:14px;margin:0">Adaugă în calendar — nu uita!</p>
          </div>
          <div style="background:#dcfce7;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #86efac">
            <div style="text-align:center">
              <div style="font-family:'Sora',sans-serif;font-weight:800;font-size:24px;color:#166534">${d.scheduled_date}</div>
              <div style="font-size:14px;color:#16a34a;margin-top:4px">⏰ ${d.scheduled_time}</div>
            </div>
          </div>
          <div style="margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Service</span>
              <span style="font-weight:600;font-size:13px;color:#111827">${d.service_name}</span>
            </div>
            ${d.service_address ? `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Adresa</span>
              <span style="font-weight:600;font-size:13px;color:#111827">${d.service_address}</span>
            </div>` : ''}
            ${d.service_phone ? `<div style="display:flex;justify-content:space-between;padding:10px 0">
              <span style="color:#6b7280;font-size:13px">Telefon</span>
              <a href="tel:${d.service_phone}" style="font-weight:600;font-size:13px;color:#1a56db">${d.service_phone}</a>
            </div>` : ''}
          </div>
          <a href="${Deno.env.get('SITE_URL')}/account" style="display:block;text-align:center;background:#1a56db;color:#fff;padding:14px;border-radius:50px;text-decoration:none;font-family:'Sora',sans-serif;font-weight:700;font-size:15px">
            Vezi programările mele
          </a>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px">Reparo · Platforma de servicii auto din România</p>
        </div>
      </div>
    `
  }),

  itp_reminder: (d: any) => ({
    subject: `⚠️ ${d.doc_type.toUpperCase()} expiră în ${d.days_left} zile — ${d.car_brand} ${d.car_model}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#f0f6ff;padding:24px">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:48px;margin-bottom:12px">${d.doc_type === 'itp' ? '🛡️' : '📄'}</div>
            <h1 style="font-family:'Sora',sans-serif;font-weight:800;font-size:22px;color:#0a1f44;margin:0 0 4px">Reminder ${d.doc_type.toUpperCase()}</h1>
            <p style="color:#6b7280;font-size:14px;margin:0">${d.car_brand} ${d.car_model}${d.plate_number ? ` · ${d.plate_number}` : ''}</p>
          </div>
          <div style="background:#fef3c7;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #fcd34d;text-align:center">
            <div style="font-family:'Sora',sans-serif;font-weight:800;font-size:28px;color:#92400e">⏰ ${d.days_left} zile</div>
            <div style="font-size:13px;color:#d97706;margin-top:4px">Expiră pe ${d.expires_at}</div>
          </div>
          <a href="${Deno.env.get('SITE_URL')}/itp-rca" style="display:block;text-align:center;background:#1a56db;color:#fff;padding:14px;border-radius:50px;text-decoration:none;font-family:'Sora',sans-serif;font-weight:700;font-size:15px">
            Găsește service-uri ${d.doc_type.toUpperCase()} →
          </a>
        </div>
      </div>
    `
  }),

  new_message: (d: any) => ({
    subject: `💬 Mesaj nou de la ${d.sender_name} — Reparo`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#f0f6ff;padding:24px">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb">
          <h1 style="font-family:'Sora',sans-serif;font-weight:800;font-size:20px;color:#0a1f44;margin:0 0 20px;text-align:center">💬 Mesaj nou</h1>
          <div style="background:#f0f6ff;border-radius:12px;padding:16px;margin-bottom:20px;border-left:4px solid #1a56db">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px">De la ${d.sender_name}</div>
            <div style="font-size:14px;color:#111827;line-height:1.6">${d.message_preview}</div>
          </div>
          <a href="${Deno.env.get('SITE_URL')}/messages" style="display:block;text-align:center;background:#1a56db;color:#fff;padding:14px;border-radius:50px;text-decoration:none;font-family:'Sora',sans-serif;font-weight:700;font-size:15px">
            Răspunde mesajului
          </a>
        </div>
      </div>
    `
  }),
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  
  try {
    const { to, type, data }: EmailPayload = await req.json()
    const template = templates[type]?.(data)
    if (!template) return new Response('Unknown template', { status: 400 })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject: template.subject, html: template.html }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
