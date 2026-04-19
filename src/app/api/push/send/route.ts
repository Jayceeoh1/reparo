// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = 'mailto:contact@reparo.ro'

async function sendPushToSubscription(sub: any, payload: object) {
  if (!VAPID_PRIVATE || !VAPID_PUBLIC) return { error: 'VAPID not configured' }

  try {
    // Web Push protocol - build the request manually
    const payloadStr = JSON.stringify(payload)
    
    // Use the web-push compatible approach via fetch
    const response = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
        'Urgency': 'high',
      },
      body: payloadStr,
    })
    
    if (response.status === 410 || response.status === 404) {
      return { expired: true }
    }
    return { ok: true, status: response.status }
  } catch (e) {
    console.error('[push] send failed:', e)
    return { error: String(e) }
  }
}

// POST /api/push/send — trimite push la un user_id
export async function POST(request: Request) {
  // Verificare internă — nu e expusă publicului
  const authHeader = request.headers.get('x-cron-secret')
  const cronSecret = process.env.CRON_SECRET
  
  // Permite și apeluri autentificate din dashboard
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && authHeader !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user_id, title, body, url, icon } = await request.json()
  
  const targetUserId = user_id || user?.id
  if (!targetUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  // Obține toate subscription-urile userului
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', targetUserId)

  if (error || !subs?.length) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No subscriptions found' })
  }

  const payload = {
    title: title || 'Reparo',
    body: body || 'Ai o notificare nouă',
    url: url || '/dashboard/service',
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    timestamp: Date.now(),
  }

  const results = await Promise.allSettled(
    subs.map(sub => sendPushToSubscription(sub, payload))
  )

  // Șterge subscription-urile expirate
  const expired = results
    .map((r, i) => r.status === 'fulfilled' && (r.value as any)?.expired ? subs[i].endpoint : null)
    .filter(Boolean)
  
  if (expired.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expired)
  }

  const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.ok).length
  return NextResponse.json({ ok: true, sent, total: subs.length })
}
