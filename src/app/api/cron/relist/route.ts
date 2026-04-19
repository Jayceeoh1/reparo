// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/cron/relist — apelat de Vercel Cron
// Vercel Cron trimite header Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  // Verificare secret cron
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  
  if (process.env.NODE_ENV === 'production' && authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const now = new Date()
  const results = { basic: 0, pro: 0, errors: [] as string[] }

  try {
    // 1. Obține toate service-urile active cu plan Basic sau Pro
    const { data: services, error: svcErr } = await supabase
      .from('services')
      .select('id, owner_id, plan, last_relist_at')
      .in('plan', ['basic', 'pro'])
      .eq('is_active', true)

    if (svcErr) throw new Error(svcErr.message)
    if (!services?.length) return NextResponse.json({ ok: true, message: 'No eligible services', ...results })

    for (const svc of services) {
      const lastRelist = svc.last_relist_at ? new Date(svc.last_relist_at) : new Date(0)
      const hoursSinceLast = (now.getTime() - lastRelist.getTime()) / (1000 * 60 * 60)

      // Basic: relist la 24h, Pro: relist la 6h
      const intervalH = svc.plan === 'pro' ? 6 : 24
      if (hoursSinceLast < intervalH) continue // prea devreme

      // Actualizează updated_at pe toate anunțurile active ale acestui service
      const { data: listings, error: listErr } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', svc.owner_id)
        .eq('status', 'activ')

      if (listErr || !listings?.length) continue

      const listingIds = listings.map(l => l.id)
      const { error: updateErr } = await supabase
        .from('listings')
        .update({ updated_at: now.toISOString() })
        .in('id', listingIds)

      if (updateErr) {
        results.errors.push(`Service ${svc.id}: ${updateErr.message}`)
        continue
      }

      // Actualizează last_relist_at pe service
      await supabase
        .from('services')
        .update({ last_relist_at: now.toISOString() })
        .eq('id', svc.id)

      if (svc.plan === 'pro') results.pro += listingIds.length
      else results.basic += listingIds.length
    }

    console.log('[cron/relist]', results)
    return NextResponse.json({ ok: true, timestamp: now.toISOString(), ...results })

  } catch (e: any) {
    console.error('[cron/relist] Error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
