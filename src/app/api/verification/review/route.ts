// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

// POST /api/verification/review — admin aproba sau respinge
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verifică că e admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { request_id, action, rejection_reason } = await request.json()
  if (!request_id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Obține cererea
  const { data: req } = await supabase
    .from('verification_requests')
    .select('*, services(id, name, owner_id)')
    .eq('id', request_id)
    .single()

  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  if (action === 'approve') {
    // Update cerere
    await supabase.from('verification_requests').update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq('id', request_id)

    // Update service — is_verified = true
    await supabase.from('services').update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    }).eq('id', req.service_id)

    // Email notificare
    const { data: owner } = await supabase.auth.admin.getUserById(req.owner_id)
    if (owner?.user?.email) {
      await sendEmail(
        owner.user.email,
        '✅ Service-ul tău a fost verificat pe Reparo!',
        `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f0f6ff;padding:32px">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px">
          <h1 style="color:#0a1f44;font-size:22px">🎉 Felicitări! Service-ul tău e acum verificat!</h1>
          <p style="color:#374151;font-size:15px;line-height:1.7">
            <strong>${req.services?.name}</strong> a primit badge-ul <strong>✓ Verificat Reparo</strong>.
          </p>
          <p style="color:#374151;font-size:14px;line-height:1.7">
            Acum apari mai sus în căutări și clienții vor vedea că ești un service de încredere verificat.
          </p>
          <a href="https://reparo-omega.vercel.app/dashboard/service" 
            style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;margin-top:16px">
            Vezi profilul tău →
          </a>
        </div></body></html>`
      )
    }

    return NextResponse.json({ ok: true, action: 'approved' })
  }

  if (action === 'reject') {
    await supabase.from('verification_requests').update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: rejection_reason || 'Documentele nu au putut fi validate.',
    }).eq('id', request_id)

    // Email respingere
    const { data: owner } = await supabase.auth.admin.getUserById(req.owner_id)
    if (owner?.user?.email) {
      await sendEmail(
        owner.user.email,
        '❌ Cererea de verificare necesită documente suplimentare',
        `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f0f6ff;padding:32px">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px">
          <h1 style="color:#0a1f44;font-size:20px">Cererea de verificare pentru ${req.services?.name}</h1>
          <p style="color:#374151;font-size:15px;line-height:1.7">
            Din păcate, cererea ta de verificare nu a putut fi procesată cu documentele actuale.
          </p>
          <div style="background:#fee2e2;border-radius:10px;padding:14px 18px;margin:16px 0">
            <strong style="color:#991b1b">Motivul:</strong>
            <p style="color:#b91c1c;margin:4px 0 0">${rejection_reason || 'Documentele nu au putut fi validate.'}</p>
          </div>
          <p style="color:#374151;font-size:14px">Poți reîncarca documentele din dashboard-ul tău.</p>
          <a href="https://reparo-omega.vercel.app/dashboard/service?tab=Profil public" 
            style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;margin-top:16px">
            Reîncarcă documente →
          </a>
        </div></body></html>`
      )
    }

    return NextResponse.json({ ok: true, action: 'rejected' })
  }

  if (action === 'in_review') {
    await supabase.from('verification_requests').update({
      status: 'in_review',
      reviewed_by: user.id,
    }).eq('id', request_id)
    return NextResponse.json({ ok: true, action: 'in_review' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// GET /api/verification/review — admin vede toate cererile
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const { data: requests } = await supabase
    .from('verification_requests')
    .select('*, services(id, name, city, logo_url)')
    .eq('status', status)
    .order('submitted_at', { ascending: false })

  return NextResponse.json({ requests: requests || [] })
}
