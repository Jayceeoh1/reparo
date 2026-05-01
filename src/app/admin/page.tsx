// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44', blue:'#1a56db', bg:'#f0f6ff', white:'#fff',
  text:'#111827', muted:'#6b7280', border:'#e5e7eb',
  green:'#16a34a', greenBg:'#dcfce7', red:'#dc2626', redBg:'#fee2e2',
  yellow:'#f59e0b', yellowBg:'#fef3c7', purple:'#7c3aed', purpleBg:'#ede9fe',
}

const TABS = ['Dashboard', 'Verificări', 'Service-uri', 'Utilizatori', 'Recenzii raportate', 'Notificări', 'Statistici']

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verRequests, setVerRequests] = useState([])
  const [services, setServices] = useState([])
  const [reportedReviews, setReportedReviews] = useState([])
  const [stats, setStats] = useState({})
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [users, setUsers] = useState([])
  const [activityFeed, setActivityFeed] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcastTarget, setBroadcastTarget] = useState('all')
  const [broadcastSending, setBroadcastSending] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState(null)
  const [tab, setTab] = useState('Dashboard')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)

      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'admin') {
        setIsAdmin(false); setLoading(false); return
      }
      setIsAdmin(true)
      await loadAll()
      setLoading(false)
    }
    load()
  }, [])

  async function loadAll() {
    const [
      { data: vr },
      { data: svcs },
      { data: rr },
      { data: usersData },
      { data: activity },
      { data: payments },
      { count: totalServices },
      { count: totalUsers },
      { count: totalRequests },
      { count: pendingVerif },
      { count: verifiedServices },
    ] = await Promise.all([
      supabase.from('verification_requests').select('*, services(id,name,city,logo_url,owner_id)').order('submitted_at', { ascending: false }),
      supabase.from('services').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('reviews').select('*, profiles:user_id(full_name), services(name)').eq('is_reported', true).order('reported_at', { ascending: false }),
      supabase.from('profiles').select('id,full_name,role,created_at,is_banned').order('created_at', { ascending: false }).limit(100),
      supabase.from('quote_requests').select('id,car_brand,car_model,city,created_at,status').order('created_at', { ascending: false }).limit(20),
      supabase.from('payments').select('amount,created_at,plan,service_id').order('created_at', { ascending: false }).limit(90).catch(() => ({ data: [] })),
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    ])

    setVerRequests(vr || [])
    setServices(svcs || [])
    setReportedReviews(rr || [])
    setUsers(usersData || [])
    setActivityFeed(activity || [])

    // Build revenue data from payments (last 30 days)
    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })
    const payArr = payments || []
    const revenueByDay = days.map(day => ({
      day: day.slice(5), // MM-DD
      total: payArr.filter(p => p.created_at?.startsWith(day)).reduce((sum, p) => sum + (p.amount || 0), 0),
      count: payArr.filter(p => p.created_at?.startsWith(day)).length,
    }))
    setRevenueData(revenueByDay)

    // MRR estimate from active subscriptions
    const proCount = (svcs || []).filter(s => s.plan === 'pro').length
    const basicCount = (svcs || []).filter(s => s.plan === 'basic').length
    const estimatedMRR = proCount * 99 + basicCount * 49

    setStats({ totalServices, totalUsers, totalRequests, pendingVerif, verifiedServices, proCount, basicCount, estimatedMRR })
  }

  async function approveVerification(req) {
    setActionLoading(req.id)
    // Update verification request
    await supabase.from('verification_requests').update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq('id', req.id)

    // Update service
    await supabase.from('services').update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    }).eq('id', req.service_id)

    setVerRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r))
    setActionLoading('')
  }

  async function rejectVerification(req) {
    if (!rejectReason.trim()) { alert('Adaugă motivul respingerii!'); return }
    setActionLoading(req.id)
    await supabase.from('verification_requests').update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: rejectReason,
    }).eq('id', req.id)
    setVerRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected', rejection_reason: rejectReason } : r))
    setRejectingId(null)
    setRejectReason('')
    setActionLoading('')
  }

  async function toggleVerified(svc) {
    setActionLoading(svc.id)
    await supabase.from('services').update({
      is_verified: !svc.is_verified,
      verified_at: !svc.is_verified ? new Date().toISOString() : null,
    }).eq('id', svc.id)
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_verified: !s.is_verified } : s))
    setActionLoading('')
  }

  async function deleteReview(reviewId) {
    if (!confirm('Ștergi această recenzie?')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    setReportedReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  async function dismissReport(reviewId) {
    await supabase.from('reviews').update({ is_reported: false }).eq('id', reviewId)
    setReportedReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  async function banUser(userId, isBanned) {
    setActionLoading(userId)
    await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !isBanned } : u))
    setActionLoading('')
  }

  async function changeUserRole(userId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  async function sendBroadcast() {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) { alert('Completează titlul și mesajul!'); return }
    setBroadcastSending(true)
    setBroadcastResult(null)
    try {
      let targets = []
      if (broadcastTarget === 'all') {
        const { data } = await supabase.from('services').select('owner_id').eq('is_active', true)
        targets = (data || []).map(s => s.owner_id)
      } else if (broadcastTarget === 'pro') {
        const { data } = await supabase.from('services').select('owner_id').eq('plan', 'pro')
        targets = (data || []).map(s => s.owner_id)
      } else if (broadcastTarget === 'unverified') {
        const { data } = await supabase.from('services').select('owner_id').eq('is_verified', false)
        targets = (data || []).map(s => s.owner_id)
      } else if (broadcastTarget === 'free') {
        const { data } = await supabase.from('services').select('owner_id').eq('plan', 'free')
        targets = (data || []).map(s => s.owner_id)
      }

      // Insert notification for each target
      const notifications = targets.map(uid => ({
        user_id: uid,
        type: 'broadcast',
        title: broadcastTitle,
        body: broadcastBody,
        is_read: false,
        created_at: new Date().toISOString(),
      }))

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }

      // Try push notifications
      let pushSent = 0
      for (const uid of targets.slice(0, 50)) {
        try {
          const res = await fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uid, title: broadcastTitle, body: broadcastBody, url: '/dashboard/service' })
          })
          const data = await res.json()
          pushSent += data.sent || 0
        } catch(e) {}
      }

      setBroadcastResult({ success: true, total: notifications.length, pushSent })
      setBroadcastTitle('')
      setBroadcastBody('')
    } catch(e) {
      setBroadcastResult({ error: e.message })
    }
    setBroadcastSending(false)
  }

  function statusBadge(status) {
    const map = {
      pending: { bg: S.yellowBg, color: S.yellow, label: '⏳ În așteptare' },
      in_review: { bg: '#dbeafe', color: '#1d4ed8', label: '🔍 În analiză' },
      approved: { bg: S.greenBg, color: S.green, label: '✅ Aprobat' },
      rejected: { bg: S.redBg, color: S.red, label: '❌ Respins' },
    }
    const s = map[status] || map.pending
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
        {s.label}
      </span>
    )
  }

  function card(children, style = {}) {
    return (
      <div style={{ background: S.white, borderRadius: 14, border: `1px solid ${S.border}`, padding: 20, ...style }}>
        {children}
      </div>
    )
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${S.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!isAdmin) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 20, color: S.navy }}>Acces interzis</div>
      <div style={{ color: S.muted }}>Trebuie să fii admin pentru a accesa această pagină.</div>
      <a href="/home" style={{ color: S.blue, textDecoration: 'none', fontWeight: 600 }}>← Înapoi acasă</a>
    </div>
  )

  const pending = verRequests.filter(r => r.status === 'pending')
  const inReview = verRequests.filter(r => r.status === 'in_review')
  const approved = verRequests.filter(r => r.status === 'approved')
  const rejected = verRequests.filter(r => r.status === 'rejected')

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.admin-tab:hover{background:#eaf3ff!important}.admin-row:hover{background:#f8faff!important}`}</style>

      {/* Header */}
      <div style={{ background: S.navy, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="/home" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>← Site</a>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>
          🛡️ Admin Panel — Reparo
        </div>
        {stats.pendingVerif > 0 && (
          <div style={{ background: S.red, color: '#fff', borderRadius: 50, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
            {stats.pendingVerif} verificări noi
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Stats overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Service-uri', value: stats.totalServices || 0, icon: '🏪', color: S.blue },
            { label: 'Utilizatori', value: stats.totalUsers || 0, icon: '👥', color: S.purple },
            { label: 'Cereri ofertă', value: stats.totalRequests || 0, icon: '📋', color: S.green },
            { label: 'Verificate', value: stats.verifiedServices || 0, icon: '✅', color: S.green },
            { label: 'Verificări noi', value: stats.pendingVerif || 0, icon: '⏳', color: S.yellow },
            { label: 'Raportate', value: reportedReviews.length, icon: '🚨', color: S.red },
            { label: 'MRR estimat', value: `${stats.estimatedMRR || 0} RON`, icon: '💰', color: S.green },
          ].map(s => (
            <div key={s.label} style={{ background: S.white, borderRadius: 12, padding: '16px', border: `1px solid ${S.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: S.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: S.white, borderRadius: 12, padding: 4, border: `1px solid ${S.border}`, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className="admin-tab"
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: tab === t ? S.blue : 'transparent', color: tab === t ? '#fff' : S.muted, transition: 'all .15s', position: 'relative' }}>
              {t}
              {t === 'Verificări' && pending.length > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: S.red }} />
              )}
              {t === 'Recenzii raportate' && reportedReviews.length > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: S.red }} />
              )}
            </button>
          ))}
        </div>

        {/* ══ VERIFICĂRI ══ */}
        {tab === 'Verificări' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>
              Cereri de verificare {pending.length > 0 && <span style={{ background: S.red, color: '#fff', borderRadius: 50, padding: '2px 8px', fontSize: 12 }}>{pending.length} noi</span>}
            </h2>

            {verRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: S.muted }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <div>Nicio cerere de verificare</div>
              </div>
            ) : verRequests.map(req => (
              <div key={req.id} className="admin-row"
                style={{ background: S.white, border: `1px solid ${req.status === 'pending' ? S.yellow : S.border}`, borderRadius: 14, padding: 20, marginBottom: 12, transition: 'background .15s' }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {/* Service info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, background: '#eaf3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {req.services?.logo_url ? <img src={req.services.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '🔧'}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: S.navy }}>{req.services?.name || 'Service necunoscut'}</div>
                        <div style={{ fontSize: 12, color: S.muted }}>{req.services?.city} · {new Date(req.submitted_at).toLocaleDateString('ro-RO')}</div>
                      </div>
                    </div>
                    {statusBadge(req.status)}
                    {req.rejection_reason && (
                      <div style={{ marginTop: 8, fontSize: 12, color: S.red, background: S.redBg, borderRadius: 8, padding: '6px 10px' }}>
                        Motiv: {req.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Documente */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Documente uploadate</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {req.doc_cui ? (
                        <a href={req.doc_cui} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>
                          📄 CUI / Certificat fiscal →
                        </a>
                      ) : <div style={{ fontSize: 12, color: S.muted }}>📄 CUI — lipsă</div>}
                      {req.doc_rar ? (
                        <a href={req.doc_rar} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>
                          🏢 Certificat RAR →
                        </a>
                      ) : <div style={{ fontSize: 12, color: S.muted }}>🏢 RAR — nu a furnizat</div>}
                      {req.doc_foto ? (
                        <a href={req.doc_foto} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>
                          🖼️ Foto sediu →
                        </a>
                      ) : <div style={{ fontSize: 12, color: S.muted }}>🖼️ Foto — lipsă</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                      <button onClick={() => approveVerification(req)}
                        disabled={actionLoading === req.id}
                        style={{ padding: '10px 20px', background: S.green, color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: actionLoading === req.id ? .6 : 1 }}>
                        ✅ Aprobă
                      </button>
                      {rejectingId === req.id ? (
                        <div>
                          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            placeholder="Motivul respingerii..."
                            style={{ width: '100%', padding: 8, borderRadius: 8, border: `1px solid ${S.border}`, fontSize: 12, marginBottom: 6, resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }} />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => rejectVerification(req)}
                              style={{ flex: 1, padding: '8px', background: S.red, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              Trimite
                            </button>
                            <button onClick={() => { setRejectingId(null); setRejectReason('') }}
                              style={{ padding: '8px 12px', background: '#f3f4f6', color: S.muted, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRejectingId(req.id)}
                          style={{ padding: '10px 20px', background: S.redBg, color: S.red, border: `1px solid ${S.red}`, borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          ❌ Respinge
                        </button>
                      )}
                      <a href={`/service/${req.service_id}`} target="_blank" rel="noreferrer"
                        style={{ textAlign: 'center', fontSize: 12, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>
                        👁️ Vezi profil →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ SERVICE-URI ══ */}
        {tab === 'Service-uri' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>
              Toate service-urile ({services.length})
            </h2>
            <div style={{ background: S.white, borderRadius: 14, border: `1px solid ${S.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faff', borderBottom: `1px solid ${S.border}` }}>
                    {['Service', 'Oraș', 'Plan', 'Verificat', 'Activ', 'Acțiuni'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc.id} className="admin-row" style={{ borderBottom: `1px solid ${S.border}`, transition: 'background .15s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: S.navy }}>{svc.name}</div>
                        <div style={{ fontSize: 11, color: S.muted }}>{svc.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: S.muted }}>{svc.city}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: svc.plan === 'pro' ? S.purpleBg : svc.plan === 'basic' ? '#dbeafe' : '#f3f4f6', color: svc.plan === 'pro' ? S.purple : svc.plan === 'basic' ? '#1d4ed8' : S.muted, padding: '2px 8px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                          {svc.plan || 'free'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => toggleVerified(svc)}
                          disabled={actionLoading === svc.id}
                          style={{ padding: '4px 12px', background: svc.is_verified ? S.greenBg : S.redBg, color: svc.is_verified ? S.green : S.red, border: 'none', borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          {svc.is_verified ? '✅ Da' : '❌ Nu'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, color: svc.is_active ? S.green : S.red }}>
                          {svc.is_active ? '● Activ' : '● Inactiv'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <a href={`/service/${svc.id}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>
                          Vezi →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ RECENZII RAPORTATE ══ */}
        {tab === 'Recenzii raportate' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>
              Recenzii raportate ({reportedReviews.length})
            </h2>
            {reportedReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: S.muted }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <div>Nicio recenzie raportată</div>
              </div>
            ) : reportedReviews.map(rev => (
              <div key={rev.id} style={{ background: S.white, border: `1px solid ${S.red}`, borderRadius: 14, padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: S.navy }}>{rev.profiles?.full_name || 'Anonim'}</span>
                      <span style={{ fontSize: 11, color: S.muted }}>→ {rev.services?.name}</span>
                      <span style={{ fontSize: 14, color: S.yellow }}>{'★'.repeat(rev.rating || 5)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: S.text, lineHeight: 1.6, margin: 0, background: '#f8faff', borderRadius: 8, padding: '10px 12px' }}>
                      {rev.body}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => dismissReport(rev.id)}
                      style={{ padding: '8px 14px', background: S.greenBg, color: S.green, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      ✓ Ignoră
                    </button>
                    <button onClick={() => deleteReview(rev.id)}
                      style={{ padding: '8px 14px', background: S.redBg, color: S.red, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      🗑️ Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ STATISTICI ══ */}
        {/* ══ DASHBOARD ══ */}
        {tab === 'Dashboard' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>Dashboard</h2>

            {/* Revenue Chart */}
            <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: S.navy }}>Revenue estimat</div>
                  <div style={{ fontSize: 12, color: S.muted }}>Bazat pe abonamente active</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, color: S.green }}>{(stats.estimatedMRR || 0).toLocaleString()} RON</div>
                  <div style={{ fontSize: 11, color: S.muted }}>MRR estimat · Pro: {stats.proCount || 0} · Basic: {stats.basicCount || 0}</div>
                </div>
              </div>

              {/* Bar chart revenue ultimi 30 zile */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, padding: '0 4px' }}>
                {revenueData.map((d, i) => {
                  const maxVal = Math.max(...revenueData.map(x => x.total), 1)
                  const h = d.total > 0 ? Math.max((d.total / maxVal) * 72, 4) : 2
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div title={`${d.day}: ${d.total} RON`}
                        style={{ width: '100%', height: h, background: d.total > 0 ? S.blue : S.border, borderRadius: 3, transition: 'height .3s', cursor: d.total > 0 ? 'pointer' : 'default' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: S.muted }}>30 zile în urmă</span>
                <span style={{ fontSize: 10, color: S.muted }}>Azi</span>
              </div>
            </div>

            {/* Plan breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Plan Free', count: (services.filter(s => !s.plan || s.plan === 'free').length), color: S.muted, revenue: 0 },
                { label: 'Plan Basic', count: stats.basicCount || 0, color: S.blue, revenue: (stats.basicCount || 0) * 49 },
                { label: 'Plan Pro', count: stats.proCount || 0, color: S.purple, revenue: (stats.proCount || 0) * 99 },
              ].map(p => (
                <div key={p.label} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: p.color, fontFamily: "'Sora',sans-serif" }}>{p.count}</div>
                  <div style={{ fontSize: 12, color: S.muted, marginBottom: 4 }}>{p.label}</div>
                  {p.revenue > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: S.green }}>{p.revenue} RON/lună</div>}
                </div>
              ))}
            </div>

            {/* Activity feed */}
            <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: S.navy, marginBottom: 14 }}>
                🔴 Activity feed live
              </div>
              {activityFeed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: S.muted, fontSize: 13 }}>Nicio activitate recentă</div>
              ) : activityFeed.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < activityFeed.length - 1 ? `1px solid ${S.border}` : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eaf3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📋</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>Cerere nouă: {item.car_brand} {item.car_model}</div>
                    <div style={{ fontSize: 11, color: S.muted }}>{item.city} · {new Date(item.created_at).toLocaleString('ro-RO')}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: item.status === 'open' ? '#eaf3ff' : S.greenBg, color: item.status === 'open' ? S.blue : S.green, fontWeight: 700 }}>
                    {item.status === 'open' ? 'Deschis' : 'Rezolvat'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ UTILIZATORI ══ */}
        {tab === 'Utilizatori' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>
              Utilizatori ({users.length})
            </h2>
            <div style={{ background: S.white, borderRadius: 14, border: `1px solid ${S.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: '#f8faff', borderBottom: `1px solid ${S.border}` }}>
                    {['Utilizator', 'Rol', 'Data înregistrare', 'Status', 'Acțiuni'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="admin-row" style={{ borderBottom: `1px solid ${S.border}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: u.is_banned ? S.muted : S.navy, textDecoration: u.is_banned ? 'line-through' : 'none' }}>
                          {u.full_name || 'Fără nume'}
                        </div>
                        <div style={{ fontSize: 11, color: S.muted, fontFamily: 'monospace' }}>{u.id.slice(0,8)}...</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select value={u.role || 'client'} onChange={e => changeUserRole(u.id, e.target.value)}
                          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: `1px solid ${S.border}`, background: S.white, color: S.navy, cursor: 'pointer' }}>
                          <option value="client">Client</option>
                          <option value="service">Service</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: S.muted }}>
                        {new Date(u.created_at).toLocaleDateString('ro-RO')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: u.is_banned ? S.redBg : S.greenBg, color: u.is_banned ? S.red : S.green }}>
                          {u.is_banned ? 'Banat' : 'Activ'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => banUser(u.id, u.is_banned)}
                          disabled={actionLoading === u.id}
                          style={{ padding: '5px 12px', background: u.is_banned ? S.greenBg : S.redBg, color: u.is_banned ? S.green : S.red, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          {actionLoading === u.id ? '...' : u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ NOTIFICĂRI BROADCAST ══ */}
        {tab === 'Notificări' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>Broadcast notificări</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Formular */}
              <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: S.navy, marginBottom: 16 }}>📣 Trimite notificare</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, display: 'block', marginBottom: 6 }}>Target</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { value: 'all', label: '🌍 Toate service-urile', count: services.length },
                      { value: 'pro', label: '⭐ Plan Pro', count: stats.proCount || 0 },
                      { value: 'free', label: '🔓 Plan Free', count: services.filter(s => !s.plan || s.plan === 'free').length },
                      { value: 'unverified', label: '🛡️ Neverificate', count: services.filter(s => !s.is_verified).length },
                    ].map(t => (
                      <button key={t.value} onClick={() => setBroadcastTarget(t.value)}
                        style={{ padding: '10px 12px', border: `1.5px solid ${broadcastTarget === t.value ? S.blue : S.border}`, borderRadius: 10, background: broadcastTarget === t.value ? '#eaf3ff' : S.white, cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: broadcastTarget === t.value ? S.blue : S.navy }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: S.muted }}>{t.count} destinatari</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, display: 'block', marginBottom: 6 }}>Titlu *</label>
                  <input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="Ex: Funcție nouă disponibilă!"
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${S.border}`, borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, display: 'block', marginBottom: 6 }}>Mesaj *</label>
                  <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)}
                    placeholder="Descrie ce vrei să comunici service-urilor..."
                    rows={4}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${S.border}`, borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <button onClick={sendBroadcast} disabled={broadcastSending || !broadcastTitle.trim() || !broadcastBody.trim()}
                  style={{ width: '100%', padding: '13px', background: broadcastTitle && broadcastBody ? S.blue : '#e5e7eb', color: broadcastTitle && broadcastBody ? '#fff' : S.muted, border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: broadcastTitle && broadcastBody ? 'pointer' : 'not-allowed', opacity: broadcastSending ? .6 : 1 }}>
                  {broadcastSending ? '⏳ Se trimite...' : '📣 Trimite notificarea'}
                </button>

                {broadcastResult?.success && (
                  <div style={{ marginTop: 12, background: S.greenBg, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: S.green, marginBottom: 4 }}>✅ Trimis cu succes!</div>
                    <div style={{ fontSize: 12, color: '#047857' }}>{broadcastResult.total} notificări în baza de date · {broadcastResult.pushSent} push trimise</div>
                  </div>
                )}
                {broadcastResult?.error && (
                  <div style={{ marginTop: 12, background: S.redBg, borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: S.red }}>❌ Eroare: {broadcastResult.error}</div>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: S.navy, marginBottom: 16 }}>👁️ Preview notificare</div>
                <div style={{ background: S.navy, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, background: S.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Sora',sans-serif" }}>R</div>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>Reparo</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 'auto' }}>acum</span>
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{broadcastTitle || 'Titlul notificării'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5 }}>{broadcastBody || 'Mesajul tău va apărea aici...'}</div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Canale de trimitere</div>
                {[
                  { icon: '🔔', label: 'Push notification', desc: 'Pe telefon/browser (dacă au activat)', active: true },
                  { icon: '📩', label: 'In-app notification', desc: 'Apare în dashboard la clopoțel', active: true },
                  { icon: '📧', label: 'Email', desc: 'Necesită RESEND_API_KEY activ', active: false },
                ].map(c => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: S.muted }}>{c.desc}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.active ? S.green : S.muted }}>{c.active ? '✓ Activ' : '○ Inactiv'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

                {tab === 'Statistici' && (
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 16 }}>Statistici platformă</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
              {card(
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12 }}>Verificări</div>
                  {[
                    { label: 'În așteptare', value: pending.length, color: S.yellow },
                    { label: 'În analiză', value: inReview.length, color: S.blue },
                    { label: 'Aprobate', value: approved.length, color: S.green },
                    { label: 'Respinse', value: rejected.length, color: S.red },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                      <span style={{ fontSize: 13, color: S.text }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </>
              )}
              {card(
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12 }}>Platformă</div>
                  {[
                    { label: 'Total service-uri', value: stats.totalServices || 0 },
                    { label: 'Service-uri verificate', value: stats.verifiedServices || 0 },
                    { label: 'Total utilizatori', value: stats.totalUsers || 0 },
                    { label: 'Total cereri ofertă', value: stats.totalRequests || 0 },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                      <span style={{ fontSize: 13, color: S.text }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: S.navy }}>{item.value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
