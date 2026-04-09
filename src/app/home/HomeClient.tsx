// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Service = { id: string; name: string; city: string | null; rating_avg: number; rating_count: number; description: string | null; is_verified: boolean; has_itp: boolean; is_authorized_rar: boolean }

const CATEGORIES = [
  { label: 'Schimb ulei', icon: '🛢️', color: '#E6F0FB', key: 'schimb_ulei' },
  { label: 'Geometrie', icon: '⚙️', color: '#FEF3E2', key: 'geometrie' },
  { label: 'Frâne', icon: '🔴', color: '#FEEEEB', key: 'frane' },
  { label: 'Diagnoză', icon: '💻', color: '#EAF3DE', key: 'diagnoza' },
  { label: 'Vopsitorie', icon: '🎨', color: '#F5EEFB', key: 'vopsitorie' },
  { label: 'ITP & RAR', icon: '🛡️', color: '#E6F0FB', key: 'itp' },
  { label: 'Climatizare', icon: '❄️', color: '#FEF3E2', key: 'climatizare' },
  { label: 'Suspensie', icon: '🔩', color: '#FEEEEB', key: 'suspensie' },
  { label: 'Motor', icon: '⚡', color: '#EAF3DE', key: 'motor' },
  { label: 'Electrică', icon: '🔋', color: '#F5EEFB', key: 'electrica' },
  { label: 'Anvelope', icon: '⭕', color: '#FEF3E2', key: 'anvelope' },
  { label: 'Toate', icon: '➕', color: '#F1EFE8', key: 'toate' },
]

const FILTERS = ['Toate', 'Deschis acum', 'Sub 5 km', 'Sub 10 km', 'Sub 25 km', 'Recenzii 4+', 'Diesel', 'Benzină', 'Hybrid / Electric', 'Service autorizat', 'Garanție lucrări']

const SVC_LIST = ['Schimb ulei & filtre', 'Frâne & discuri', 'Geometrie roți', 'Echilibrare roți', 'Diagnoză electronică', 'Suspensie', 'Transmisie', 'Vopsitorie', 'Climatizare & AC', 'Electrică auto', 'Motor', 'ITP', 'Anvelope & jante', 'Polishing', 'Altele']
const BRANDS_PIESE = ['Orice brand', 'OEM Original', 'Bosch', 'Brembo', 'SKF', 'Febi', 'TRW', 'Valeo']
const STEP_LABELS = ['Mașina', 'Servicii', 'Detalii', 'Confirmare']
const URGENCY_LABELS: Record<string, string> = { 'u-green': 'Flexibil', 'u-amber': 'Săptămâna asta', 'u-red': 'Urgent' }

export default function HomeClient() {
  const [services, setServices] = useState<Service[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('Toate')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(0)
  const [submitDone, setSubmitDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingListings, setLoadingListings] = useState(true)
  const [form, setForm] = useState({
    car_brand: '', car_model: '', car_year: '', car_fuel: '', car_km: '', car_plate: '', city: 'București',
    services: [] as string[], urgency: 'u-amber', preferred_date: '', preferred_time: '09:00-12:00',
    description: '', preferred_brand: 'Orice brand', contact_name: '', contact_phone: '', char_count: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('rating_avg', { ascending: false }).limit(6)
      .then(({ data }) => setServices(data || []))
    supabase.from('listings').select('*, listing_media(url, is_cover)').eq('status', 'activ')
      .order('is_promoted', { ascending: false }).order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => { setListings(data || []); setLoadingListings(false) })
  }, [])

  function toggleSvc(svc: string) {
    setForm(f => ({ ...f, services: f.services.includes(svc) ? f.services.filter(s => s !== svc) : [...f.services, svc] }))
  }
  function toggleFav(id: string) {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  async function submitRequest() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('quote_requests').insert({
      user_id: user?.id || null, car_brand: form.car_brand, car_model: form.car_model,
      car_year: form.car_year ? parseInt(form.car_year) : null, car_fuel: form.car_fuel,
      car_km: form.car_km ? parseInt(form.car_km) : null, city: form.city,
      services: form.services, description: form.description, preferred_brand: form.preferred_brand,
      urgency: form.urgency === 'u-green' ? 'flexibil' : form.urgency === 'u-red' ? 'urgent' : 'saptamana',
      preferred_date: form.preferred_date || null, preferred_time: form.preferred_time,
      contact_name: form.contact_name, contact_phone: form.contact_phone, status: 'activa',
    })
    setSubmitting(false); setSubmitDone(true)
  }

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          body { padding-bottom: 60px; }
          .desktop-only { display: none !important; }
          .cat-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
          .cat-item { padding: 10px 4px 8px !important; }
          .cat-icon { width: 36px !important; height: 36px !important; font-size: 18px !important; }
          .cat-label { font-size: 10px !important; }
          .filter-scroll { flex-wrap: nowrap !important; overflow-x: auto !important; padding-bottom: 4px; scrollbar-width: none; }
          .filter-scroll::-webkit-scrollbar { display: none; }
          .svc-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .listing-card-img { height: 110px !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .service-card { flex-direction: column !important; }
          .promo-row { flex-direction: column !important; gap: 12px !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
          .hero-stats { gap: 16px !important; flex-wrap: wrap; }
          .hero-stat strong { font-size: 13px !important; }
          .cta-section { padding: 20px !important; }
          .cta-btns { flex-direction: column !important; }
          .cta-btn { width: 100% !important; text-align: center; }
        }
        @media (max-width: 400px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', background: '#f5f5f5', minHeight: '100vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

        {/* ══ HERO ══ */}
        <div style={{ background: '#1a2332', padding: '28px 20px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: -0.5, lineHeight: 1.2 }}>
              Găsește cel mai bun service auto din zona ta
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.55)', marginBottom: 20, lineHeight: 1.6 }}>
              Cere oferte gratuite, compară prețuri și rezervă programarea online.
            </p>
            <button onClick={() => { setModalOpen(true); setModalStep(0); setSubmitDone(false) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 14, fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', width: '100%', maxWidth: 360, justifyContent: 'center' }}>
              ⭐ Cere ofertă gratuită
            </button>
            <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Gratuit · Fără cont · Răspuns în 24h
            </p>
            <div className="hero-stats" style={{ display: 'flex', gap: 24, marginTop: 18 }}>
              {[['2.400+', 'Service-uri'], ['48.000+', 'Oferte trimise'], ['4.8/5', 'Rating mediu'], ['Gratuit', 'Cerere ofertă']].map(([v, l]) => (
                <div key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
                  <strong className="hero-stat" style={{ color: '#fff', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 1 }}>{v}</strong>{l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ MAIN ══ */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 60px' }}>

          {/* Categorii */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Categorii servicii</h2>
            <a href="/search" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>Vezi toate →</a>
          </div>
          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => window.location.href = `/search?category=${c.key}`}
                className="cat-item"
                style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', padding: '12px 6px 10px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#4A90D9'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}>
                <div className="cat-icon" style={{ width: 40, height: 40, borderRadius: '50%', background: c.color, margin: '0 auto 7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{c.icon}</div>
                <div className="cat-label" style={{ fontSize: 11, color: '#444', fontWeight: 500, lineHeight: 1.3 }}>{c.label}</div>
              </button>
            ))}
          </div>

          {/* Filtre */}
          <div className="filter-scroll" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#666', fontWeight: 500, flexShrink: 0 }} className="desktop-only">Filtrează:</span>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ padding: '7px 12px', borderRadius: 20, fontSize: 12, border: activeFilter === f ? '0.5px solid #4A90D9' : '0.5px solid #ddd', color: activeFilter === f ? '#1a5fa8' : '#444', background: activeFilter === f ? '#E6F0FB' : '#fff', fontWeight: activeFilter === f ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {f}
              </button>
            ))}
          </div>

          {/* Service-uri */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Service-uri recomandate</h2>
            <a href="/search" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>Vezi toate →</a>
          </div>

          {services.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: '32px 20px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔧</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 6 }}>Niciun service înregistrat momentan</div>
              <a href="/auth/register" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 600 }}>Înregistrează-ți service-ul gratuit →</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {services.map(s => (
                <button key={s.id} onClick={() => window.location.href = `/service/${s.id}`}
                  className="service-card"
                  style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: 16, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#4A90D9'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}>
                  <div style={{ width: 48, height: 48, background: '#E6F0FB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔧</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{s.name}</span>
                      {s.is_verified && <span style={{ fontSize: 10, background: '#EAF3DE', color: '#3B6D11', padding: '1px 6px', borderRadius: 6, fontWeight: 600 }}>✓ Verificat</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 1, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(star => <span key={star} style={{ fontSize: 13, color: star <= Math.round(s.rating_avg) ? '#F5A623' : '#ddd' }}>★</span>)}
                      <span style={{ fontSize: 11, color: '#aaa', marginLeft: 3 }}>({s.rating_count})</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4, marginBottom: 6 }}>{s.description || 'Service auto profesional'}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {s.is_verified && <span style={{ background: '#E6F0FB', color: '#1a5fa8', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>Verificat</span>}
                      {s.has_itp && <span style={{ background: '#E6F0FB', color: '#1a5fa8', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>ITP pe loc</span>}
                      {s.is_authorized_rar && <span style={{ background: '#E6F0FB', color: '#1a5fa8', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>Autorizat RAR</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#4A90D9', fontWeight: 500, marginTop: 6 }}>📍 {s.city}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Promo ITP/RCA */}
          <div className="promo-row" style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: '16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: '#E6F0FB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>Ai RCA sau ITP care expiră curând?</div>
                <div style={{ fontSize: 12, color: '#666' }}>Reparo îți trimite reminder și găsește oferte din zona ta.</div>
              </div>
            </div>
            <a href="/itp-rca" style={{ padding: '10px 16px', background: '#4A90D9', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Verifică →
            </a>
          </div>

          {/* Anunturi */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Anunțuri — Piese & Accesorii</h2>
            <a href="/listing" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>Vezi toate →</a>
          </div>
          {loadingListings ? (
            <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ background: '#fff', borderRadius: 12, height: 180, border: '0.5px solid #e8e8e8', opacity: 0.4 }}/>)}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: '32px 20px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 6 }}>Niciun anunț publicat încă</div>
              <a href="/listing" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 600 }}>Adaugă primul anunț →</a>
            </div>
          ) : (
            <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {listings.map(l => {
                const coverImg = l.listing_media?.find(m => m.is_cover)?.url || l.listing_media?.[0]?.url
                const daysAgo = Math.floor((new Date().getTime() - new Date(l.created_at).getTime()) / (1000*60*60*24))
                return (
                  <div key={l.id} onClick={() => window.location.href = '/listing'}
                    style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', overflow: 'hidden', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4A90D9'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}>
                    <div className="listing-card-img" style={{ height: 130, background: '#f0f0f0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {coverImg ? (
                        <img src={coverImg} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : <span style={{ fontSize: 32 }}>📦</span>}
                      {l.is_promoted && <span style={{ position: 'absolute', top: 6, left: 6, background: '#FF6B35', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5 }}>TOP</span>}
                      {l.condition === 'nou' && <span style={{ position: 'absolute', top: 6, right: 6, background: '#639922', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5 }}>NOU</span>}
                      <button onClick={e => { e.stopPropagation(); toggleFav(l.id) }}
                        style={{ position: 'absolute', bottom: 6, right: 6, width: 26, height: 26, background: 'rgba(255,255,255,0.92)', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {favorites.has(l.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 3 }}>
                        {l.price ? `${l.price.toLocaleString('ro-RO')} lei` : 'Negociabil'}
                      </div>
                      <div style={{ fontSize: 11, color: '#555', marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.title}</div>
                      <div style={{ fontSize: 10, color: '#bbb', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📍 {l.city || '—'}</span>
                        <span>{daysAgo === 0 ? 'Azi' : daysAgo === 1 ? 'Ieri' : `${daysAgo}z`}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* De ce Reparo */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>De ce să alegi Reparo?</h2>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { icon: '🛡️', title: 'Oferte gratuite', desc: 'Trimite o cerere și primești oferte fără niciun cost.' },
              { icon: '📅', title: 'Programare online', desc: 'Alege data și ora direct din platformă.' },
              { icon: '✅', title: 'Service-uri verificate', desc: 'Toți partenerii sunt evaluați de clienți reali.' },
              { icon: '⭐', title: 'Recenzii reale', desc: 'Recenzii verificate de la clienți reali.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA Service */}
          <div className="cta-section" style={{ background: '#1a2332', borderRadius: 16, padding: '28px 24px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Ești proprietar de service auto?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>Primești cereri de ofertă direct de la clienți din zona ta.</p>
            <div className="cta-btns" style={{ display: 'flex', gap: 10 }}>
              <a href="/auth/register" className="cta-btn" style={{ padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#fff', color: '#1a2332', textDecoration: 'none', display: 'inline-block' }}>Înregistrează service-ul →</a>
              <a href="/auth/register" className="cta-btn" style={{ padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block' }}>Află mai mult</a>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ background: '#1a2332', borderRadius: 16, padding: '28px 20px 20px', marginBottom: 0 }}>
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 28, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 22, height: 22, background: '#4A90D9', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>R</span>
                  Reparo
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Platforma care conectează șoferii cu cele mai bune service-uri auto din România.</div>
              </div>
              {[
                { title: 'Platformă', links: ['Cum funcționează', 'Caută service', 'Cerere ofertă', 'ITP & RCA', 'Piese auto'] },
                { title: 'Service-uri', links: ['Înregistrare', 'Dashboard', 'Planuri', 'Promovare', 'Suport'] },
                { title: 'Companie', links: ['Despre Reparo', 'Blog auto', 'Cariere', 'Contact', 'Presă'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{col.title}</h4>
                  {col.links.map(l => <a key={l} href="#" style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: 5 }}>{l}</a>)}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>© 2026 Reparo. Toate drepturile rezervate.</div>
              <div style={{ display: 'flex', gap: 14 }}>
                {['Termeni', 'Confidențialitate', 'Cookie-uri'].map(l => <a key={l} href="#" style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>{l}</a>)}
              </div>
            </div>
          </footer>
        </div>

        {/* ══ MODAL CERERE OFERTA ══ */}
        {modalOpen && (
          <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
            <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 660, maxHeight: '92vh', overflowY: 'auto' }}>

              {/* Header modal */}
              <div style={{ background: '#1a2332', padding: '18px 20px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Cerere de ofertă</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Pasul {modalStep + 1} din 4 — {STEP_LABELS[modalStep]}</div>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Progress bar */}
              {!submitDone && (
                <div style={{ height: 3, background: '#e0e0e0' }}>
                  <div style={{ height: '100%', background: '#4A90D9', width: `${((modalStep + 1) / 4) * 100}%`, transition: 'width 0.3s' }}/>
                </div>
              )}

              <div style={{ padding: '20px 16px' }}>
                {submitDone ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Cererea a fost trimisă!</div>
                    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>Service-urile din zona ta vor reveni cu oferte în maxim 24 de ore.</p>
                    <button onClick={() => setModalOpen(false)} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#4A90D9', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>Închide</button>
                  </div>
                ) : modalStep === 0 ? (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>🚗 Despre mașina ta</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { key: 'car_brand', label: 'Marcă', type: 'select', opts: ['', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Dacia', 'Renault', 'Ford', 'Opel', 'Peugeot', 'Skoda', 'Hyundai', 'Kia', 'Volvo', 'Mazda'] },
                        { key: 'car_model', label: 'Model', type: 'text', placeholder: 'ex: Seria 3' },
                        { key: 'car_year', label: 'An fabricație', type: 'select', opts: ['', ...Array.from({length: 25}, (_, i) => String(2024 - i))] },
                        { key: 'car_fuel', label: 'Combustibil', type: 'select', opts: ['', 'Benzină', 'Diesel', 'Hybrid', 'Electric', 'GPL'] },
                        { key: 'car_km', label: 'Kilometraj', type: 'number', placeholder: 'ex: 87500' },
                        { key: 'city', label: 'Orașul tău', type: 'select', opts: ['', 'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Craiova', 'Galați', 'Ploiești', 'Oradea', 'Sibiu'] },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>{f.label}</label>
                          {f.type === 'select' ? (
                            <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}>
                              {f.opts?.map(o => <option key={o} value={o}>{o || 'Selectează'}</option>)}
                            </select>
                          ) : (
                            <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                              placeholder={f.placeholder}
                              style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : modalStep === 1 ? (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>🔧 Ce servicii ai nevoie?</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {SVC_LIST.map(s => (
                        <button key={s} onClick={() => toggleSvc(s)}
                          style={{ padding: '9px 14px', borderRadius: 20, fontSize: 13, border: form.services.includes(s) ? '0.5px solid #4A90D9' : '0.5px solid #ddd', color: form.services.includes(s) ? '#1a5fa8' : '#555', background: form.services.includes(s) ? '#E6F0FB' : '#fafafa', fontWeight: form.services.includes(s) ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>Urgență</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                      {[['u-green','Flexibil','Oricând','#EAF3DE','#3B6D11'],['u-amber','Săptămâna asta','7 zile','#FAEEDA','#854F0B'],['u-red','Urgent','1-2 zile','#FCEBEB','#A32D2D']].map(([key,label,sub,bg,color]) => (
                        <button key={key} onClick={() => setForm(p => ({ ...p, urgency: key }))}
                          style={{ padding: '10px 8px', borderRadius: 12, border: `0.5px solid ${form.urgency === key ? color : '#ddd'}`, cursor: 'pointer', textAlign: 'center', background: form.urgency === key ? bg : '#fafafa', fontFamily: 'inherit' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: form.urgency === key ? color : '#555' }}>{label}</div>
                          <div style={{ fontSize: 10, color: form.urgency === key ? color : '#bbb', marginTop: 2 }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Data preferată</label>
                        <input type="date" value={form.preferred_date} onChange={e => setForm(p => ({ ...p, preferred_date: e.target.value }))}
                          style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Interval</label>
                        <select value={form.preferred_time} onChange={e => setForm(p => ({ ...p, preferred_time: e.target.value }))}
                          style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}>
                          {['08:00-10:00','09:00-12:00','10:00-13:00','12:00-15:00','14:00-17:00','15:00-18:00'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : modalStep === 2 ? (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>📝 Detalii suplimentare</div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Descrie problema</label>
                      <textarea value={form.description} maxLength={500}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value, char_count: e.target.value.length }))}
                        rows={4} placeholder="Ex: Zgomot la frânare față, suspectez plăcuțe uzate..."
                        style={{ width: '100%', padding: '12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}/>
                      <div style={{ fontSize: 11, color: '#ccc', textAlign: 'right', marginTop: 4 }}>{form.char_count}/500</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Preferință piese</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {BRANDS_PIESE.map(b => (
                          <button key={b} onClick={() => setForm(p => ({ ...p, preferred_brand: b }))}
                            style={{ padding: '8px 12px', borderRadius: 20, fontSize: 12, border: form.preferred_brand === b ? '0.5px solid #4A90D9' : '0.5px solid #ddd', color: form.preferred_brand === b ? '#1a5fa8' : '#555', background: form.preferred_brand === b ? '#E6F0FB' : '#fafafa', fontWeight: form.preferred_brand === b ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Numele tău</label>
                        <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Ion Popescu"
                          style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Telefon</label>
                        <input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="07xx xxx xxx" type="tel"
                          style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>✅ Verifică și trimite</div>
                    <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16, border: '0.5px solid #eee', marginBottom: 14 }}>
                      {[
                        ['Mașina', `${form.car_brand} ${form.car_model} ${form.car_year}`],
                        ['Combustibil', form.car_fuel || '—'],
                        ['Km', form.car_km ? `${parseInt(form.car_km).toLocaleString()} km` : '—'],
                        ['Oraș', form.city],
                        ['Servicii', form.services.length > 0 ? form.services.join(', ') : 'Nespecificat'],
                        ['Urgență', URGENCY_LABELS[form.urgency]],
                        ['Data', form.preferred_date || '—'],
                        ['Contact', `${form.contact_name || '—'} · ${form.contact_phone || '—'}`],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #eee', fontSize: 13 }}>
                          <span style={{ color: '#888' }}>{label}</span>
                          <span style={{ fontWeight: 500, color: '#1a1a1a', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#FAEEDA', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#854F0B' }}>
                      ⚠️ Cererea va fi trimisă service-urilor din zona ta. Vei fi contactat în max. 24h.
                    </div>
                  </div>
                )}
              </div>

              {/* Footer modal */}
              {!submitDone && (
                <div style={{ padding: '12px 16px 24px', borderTop: '0.5px solid #eee', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: '#fff' }}>
                  {modalStep > 0 && (
                    <button onClick={() => setModalStep(s => s - 1)}
                      style={{ padding: '13px 20px', borderRadius: 12, border: '0.5px solid #ddd', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: 'inherit' }}>
                      ← Înapoi
                    </button>
                  )}
                  {modalStep < 3 ? (
                    <button onClick={() => setModalStep(s => s + 1)}
                      style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: '#4A90D9', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Continuă →
                    </button>
                  ) : (
                    <button onClick={submitRequest} disabled={submitting}
                      style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: '#FF6B35', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Se trimite...' : 'Trimite cererea →'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
