// @ts-nocheck
const RESEND_KEY = process.env.RESEND_API_KEY
const FROM = 'Reparo <noreply@reparo.ro>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://reparo-omega.vercel.app'

function layout(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,0.1);">
  <div style="background:#0a1f44;padding:24px 32px;text-align:center;">
    <span style="display:inline-block;width:36px;height:36px;background:#1a56db;border-radius:9px;line-height:36px;font-size:18px;font-weight:900;color:#fff;">R</span>
    <span style="font-size:18px;font-weight:800;color:#fff;margin-left:8px;vertical-align:middle;">Reparo</span>
  </div>
  <div style="padding:28px 32px;">${content}</div>
  <div style="background:#f8faff;padding:14px 32px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="font-size:11px;color:#9ca3af;margin:0;">© 2026 Reparo · <a href="${BASE_URL}/confidentialitate" style="color:#9ca3af;">Confidențialitate</a></p>
  </div>
</div></body></html>`
}

function cta(text: string, href: string) {
  return `<div style="text-align:center;margin-top:24px;">
    <a href="${href}" style="display:inline-block;padding:13px 28px;background:#f59e0b;color:#fff;border-radius:50px;font-size:14px;font-weight:700;text-decoration:none;">
      ${text}
    </a>
  </div>`
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.log('[email] RESEND_API_KEY missing — skipping email to', to)
    return
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!r.ok) console.error('[email] Resend error:', await r.text())
  } catch (e) {
    console.error('[email] fetch failed:', e)
  }
}

export function emailNewRequest(data: {
  car_brand: string; car_model: string; car_year?: string
  services: string[]; city: string; urgency?: string
}) {
  const urgColor = data.urgency === 'urgent' ? '#dc2626' : data.urgency === 'saptamana' ? '#d97706' : '#16a34a'
  const urgLabel = data.urgency === 'urgent' ? '🚨 Urgent' : data.urgency === 'saptamana' ? '📅 Săptămâna aceasta' : '😌 Flexibil'

  const content = `
    <div style="background:#eaf3ff;border-radius:10px;padding:10px 16px;margin-bottom:18px;display:inline-block;">
      <span style="font-size:12px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;">📋 Cerere nouă de ofertă</span>
    </div>
    <h1 style="font-size:20px;font-weight:800;color:#0a1f44;margin:0 0 8px;">Ai primit o cerere nouă!</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6;">Un client din zona ta caută un service. Răspunde rapid!</p>
    <div style="background:#f8faff;border-radius:12px;padding:18px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Detalii cerere</div>
      <div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">🚗 Mașina: </span><span style="font-weight:700;color:#0a1f44;font-size:13px;">${data.car_brand} ${data.car_model}${data.car_year ? ` (${data.car_year})` : ''}</span></div>
      <div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">🔧 Servicii: </span><span style="font-weight:600;color:#0a1f44;font-size:13px;">${data.services.join(', ')}</span></div>
      <div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">📍 Oraș: </span><span style="font-weight:600;color:#0a1f44;font-size:13px;">${data.city}</span></div>
      ${data.urgency ? `<div><span style="color:#6b7280;font-size:13px;">⚡ Urgență: </span><span style="font-weight:700;color:${urgColor};font-size:13px;">${urgLabel}</span></div>` : ''}
    </div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">Clienții aleg de obicei primul service care răspunde.</p>
    ${cta('Trimite oferta acum →', `${BASE_URL}/dashboard/service?tab=Cereri`)}
  `
  return {
    subject: `📋 Cerere nouă: ${data.car_brand} ${data.car_model} — ${data.city}`,
    html: layout(content)
  }
}

export function emailOfferAccepted(data: {
  serviceName: string; car_brand: string; car_model: string
  price_total?: number; scheduled_date?: string
}) {
  const content = `
    <div style="background:#dcfce7;border-radius:10px;padding:10px 16px;margin-bottom:18px;display:inline-block;">
      <span style="font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">✅ Ofertă acceptată!</span>
    </div>
    <h1 style="font-size:20px;font-weight:800;color:#0a1f44;margin:0 0 8px;">Felicitări! Clientul a acceptat oferta ta.</h1>
    <div style="background:#f8faff;border-radius:12px;padding:18px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">🚗 Mașina: </span><span style="font-weight:700;color:#0a1f44;font-size:13px;">${data.car_brand} ${data.car_model}</span></div>
      ${data.price_total ? `<div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">💰 Valoare ofertă: </span><span style="font-weight:700;color:#16a34a;font-size:13px;">${data.price_total} RON</span></div>` : ''}
      ${data.scheduled_date ? `<div><span style="color:#6b7280;font-size:13px;">📅 Data programată: </span><span style="font-weight:600;color:#0a1f44;font-size:13px;">${new Date(data.scheduled_date).toLocaleDateString('ro-RO', {weekday:'long',day:'numeric',month:'long'})}</span></div>` : ''}
    </div>
    ${cta('Vezi programarea →', `${BASE_URL}/dashboard/service?tab=Programări`)}
  `
  return {
    subject: `✅ Ofertă acceptată — ${data.car_brand} ${data.car_model}`,
    html: layout(content)
  }
}

export function emailNewReview(data: {
  serviceName: string; rating: number; reviewerName: string; body: string
}) {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
  const content = `
    <div style="background:#fef3c7;border-radius:10px;padding:10px 16px;margin-bottom:18px;display:inline-block;">
      <span style="font-size:12px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:1px;">⭐ Recenzie nouă</span>
    </div>
    <h1 style="font-size:20px;font-weight:800;color:#0a1f44;margin:0 0 8px;">${data.reviewerName} a lăsat o recenzie!</h1>
    <div style="background:#f8faff;border-radius:12px;padding:18px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <div style="font-size:20px;color:#f59e0b;margin-bottom:8px;">${stars}</div>
      <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;font-style:italic;">"${data.body}"</p>
    </div>
    ${cta('Răspunde recenziei →', `${BASE_URL}/dashboard/service?tab=Recenzii`)}
  `
  return {
    subject: `⭐ Recenzie nouă ${stars} de la ${data.reviewerName}`,
    html: layout(content)
  }
}

export function emailITPReminder(data: {
  userName: string; carName: string; expiryDate: string; daysLeft: number
}) {
  const urgency = data.daysLeft <= 7 ? '#dc2626' : data.daysLeft <= 30 ? '#d97706' : '#16a34a'
  const content = `
    <div style="background:#fee2e2;border-radius:10px;padding:10px 16px;margin-bottom:18px;display:inline-block;">
      <span style="font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">⚠️ Reminder ITP</span>
    </div>
    <h1 style="font-size:20px;font-weight:800;color:#0a1f44;margin:0 0 8px;">ITP-ul expiră în curând!</h1>
    <div style="background:#f8faff;border-radius:12px;padding:18px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">🚗 Mașina: </span><span style="font-weight:700;color:#0a1f44;font-size:13px;">${data.carName}</span></div>
      <div style="margin-bottom:6px;"><span style="color:#6b7280;font-size:13px;">📅 Expiră la: </span><span style="font-weight:700;color:${urgency};font-size:13px;">${data.expiryDate}</span></div>
      <div><span style="color:#6b7280;font-size:13px;">⏰ Timp rămas: </span><span style="font-weight:700;color:${urgency};font-size:13px;">${data.daysLeft} zile</span></div>
    </div>
    ${cta('Programează ITP acum →', `${BASE_URL}/home?service=ITP`)}
  `
  return {
    subject: `⚠️ ITP-ul mașinii ${data.carName} expiră în ${data.daysLeft} zile!`,
    html: layout(content)
  }
}
