// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const now = new Date()
  const results = { relisted: 0, errors: [] }

  const RELIST_INTERVALS = {
    starter:15, basic:1440, pro:10, elite:5,
    business:20, business_pro:10, business_elite:5,
  }

  const WEEKLY_LIMITS = {
    starter:5000, basic:5000, pro:10000, elite:50000,
    business:5000, business_pro:10000, business_elite:50000,
  }

  try {
    const { data: services } = await supabase
      .from('services')
      .select('id, owner_id, plan, last_relist_at')
      .in('plan', Object.keys(RELIST_INTERVALS))
      .eq('is_active', true)

    if (!services?.length) return NextResponse.json({ ok: true, relisted: 0 })

    for (const svc of services) {
      const intervalMs = RELIST_INTERVALS[svc.plan] * 60 * 1000
      const lastRelist = svc.last_relist_at ? new Date(svc.last_relist_at) : new Date(0)
      if (now.getTime() - lastRelist.getTime() < intervalMs) continue

      const { data: listings } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', svc.owner_id)
        .eq('status', 'activ')
        .limit(WEEKLY_LIMITS[svc.plan] || 1000)

      if (!listings?.length) continue

      await supabase.from('listings')
        .update({ created_at: now.toISOString() })
        .in('id', listings.map(l => l.id))

      await supabase.from('services')
        .update({ last_relist_at: now.toISOString() })
        .eq('id', svc.id)

      results.relisted += listings.length
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
