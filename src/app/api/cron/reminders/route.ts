// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, emailITPReminder } from '@/lib/email'

// GET /api/cron/reminders — rulează zilnic, trimite reminder ITP/RCA
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  
  if (process.env.NODE_ENV === 'production' && authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const now = new Date()
  let sent = 0

  try {
    // Găsește documentele ITP/RCA care expiră în 30, 14 sau 7 zile
    const targets = [7, 14, 30]

    for (const daysAhead of targets) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + daysAhead)
      const dateStr = targetDate.toISOString().split('T')[0]

      const { data: docs } = await supabase
        .from('car_documents')
        .select('*, cars(brand, model, plate_number), profiles:user_id(full_name, email:id)')
        .eq('expires_at', dateStr)
        .in('type', ['itp', 'rca'])

      if (!docs?.length) continue

      for (const doc of docs) {
        // Obține emailul userului din auth
        const { data: authUser } = await supabase.auth.admin.getUserById(doc.user_id)
        const email = authUser?.user?.email
        if (!email) continue

        const carName = doc.cars
          ? `${doc.cars.brand} ${doc.cars.model}${doc.cars.plate_number ? ` (${doc.cars.plate_number})` : ''}`
          : 'Mașina ta'

        const { subject, html } = emailITPReminder({
          userName: doc.profiles?.full_name || 'Utilizator',
          carName,
          expiryDate: new Date(doc.expires_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }),
          daysLeft: daysAhead,
        })

        await sendEmail(email, subject, html)
        sent++
      }
    }

    return NextResponse.json({ ok: true, sent, timestamp: now.toISOString() })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
