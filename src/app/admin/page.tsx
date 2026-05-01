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

const TABS = ['Verificări', 'Service-uri', 'Utilizatori', 'Recenzii raportate', 'Statistici']

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Verificări')
  const [verRequests, setVerRequests] = useState([])
  const [services, setServices] = useState([])
  const [users, setUsers] = useState([])
  const [reportedReviews, setReportedReviews] = useState([])
  const [stats, setStats] = useState({})
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
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
    // Verification requests
    const { data: vr } = await supabase
      .from('verification_requests')
      .select('*, services(id,name,city,logo_url,owner_id)')
      .order('submitted_at', { ascending: false })
    setVerRequests(vr || [])

    // Services
    const { data: svcs } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setServices(svcs || [])

    // Reported reviews
    const { data: rr } = await supabase
      .from('reviews')
      .select('*, profiles:user_id(full_name), services(name)')
      .eq('is_reported', true)
      .order('reported_at', { ascending: false })
    setReportedReviews(rr || [])

    // Stats
    const [
      { count: totalServices },
      { count: totalUsers },
      { count: totalRequests },
      { count: pendingVerif },
      { count: verifiedServices },
    ] = await Promise.all([
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    ])
    setStats({ totalServices, totalUsers, totalRequests, pendingVerif, verifiedServices })
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

        {tab === 'Utilizatori' && (
          <div style={{ textAlign: 'center', padding: 48, color: S.muted }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Lista utilizatori</div>
            <div style={{ fontSize: 13 }}>Necesită acces la Supabase Auth — disponibil din dashboard-ul Supabase.</div>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', marginTop: 12, color: S.blue, fontWeight: 700, textDecoration: 'none' }}>
              Deschide Supabase →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
