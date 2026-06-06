// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  
  if (process.env.NODE_ENV === 'production' && authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const now = new Date()
  const results = { relisted: 0, errors: [] as string[] }

  // Relist intervals per plan (in minutes)
  const RELIST_INTERVALS: Record<string, number> = {
    starter: 24 * 60,
    basic: 24 * 60,
    pro: 10,
    elite: 5,
    business: 20,
    business_pro: 10,
    business_elite: 5,
  }

  try {
    const eligiblePlans = Object.keys(RELIST_INTERVALS)
    
    const { data: services, error: svcErr } = await supabase
      .from('services')
      .select('id, owner_id, plan, last_relist_at')
      .in('plan', eligiblePlans)
      .eq('is_active', true)

    if (svcErr) throw new Error(svcErr.message)
    if (!services?.length) return NextResponse.json({ ok: true, message: 'No eligible services', ...results })

    for (const svc of services) {
      const intervalMinutes = RELIST_INTERVALS[svc.plan]
      const intervalMs = intervalMinutes * 60 * 1000
      const lastRelist = svc.last_relist_at ? new Date(svc.last_relist_at) : new Date(0)
      
      if (now.getTime() - lastRelist.getTime() < intervalMs) continue

      // Get weekly relist limit
      const WEEKLY_LIMITS: Record<string, number> = {
        starter: 5000, basic: 5000,
        pro: 10000, elite: 50000,
        business: 5000, business_pro: 10000, business_elite: 50000,
      }
      const weeklyLimit = WEEKLY_LIMITS[svc.plan] || 1000

      // Get active listings for this service
      const { data: listings, error: listErr } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', svc.owner_id)
        .eq('status', 'activ')
        .limit(weeklyLimit)

      if (listErr || !listings?.length) continue

      // Update created_at to bump to top
      const { error: updateErr } = await supabase
        .from('listings')
        .update({ created_at: now.toISOString() })
        .in('id', listings.map(l => l.id))

      if (updateErr) {
        results.errors.push(`Service ${svc.id}: ${updateErr.message}`)
        continue
      }

      // Update last_relist_at
      await supabase
        .from('services')
        .update({ last_relist_at: now.toISOString() })
        .eq('id', svc.id)

      results.relisted += listings.length
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
