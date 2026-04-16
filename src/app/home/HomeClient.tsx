// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import './homepage.css'
import { CAR_BRANDS, CAR_MODELS, CITIES, FUEL_TYPES } from '@/lib/carData'

type Service = { id: string; name: string; city: string | null; rating_avg: number; rating_count: number; description: string | null; address: string | null; plan: string; is_verified: boolean; has_itp: boolean; is_authorized_rar: boolean; warranty_months: number }

// Categorii actualizate: Frâne & discuri → Detailing auto, adăugat Dezmembrări
const CATEGORIES = [
  { label: 'Schimb ulei & filtre', icon: '🚗', color: '#E6F0FB', key: 'schimb_ulei' },
  { label: 'Geometrie & echilibrare', icon: '⚙️', color: '#FEF3E2', key: 'geometrie' },
  { label: 'Detailing auto', icon: '✨', color: '#FEEEEB', key: 'detailing' },
  { label: 'Diagnoză electronică', icon: '💻', color: '#EAF3DE', key: 'diagnoza' },
  { label: 'Vopsitorie & caroserie', icon: '🎨', color: '#F5EEFB', key: 'vopsitorie' },
  { label: 'ITP', icon: '🛡️', color: '#E6F0FB', key: 'itp' },
  { label: 'Dezmembrări', icon: '🔩', color: '#FEF9E2', key: 'dezmembrari' },
  { label: 'Toate categoriile', icon: '➕', color: '#F1EFE8', key: 'toate' },
]

const FILTERS = ['Toate', 'Deschis acum', 'Sub 5 km', 'Sub 10 km', 'Sub 25 km', 'Recenzii 4+', 'Diesel', 'Benzină', 'Hybrid / Electric', 'Service autorizat', 'Garanție lucrări']

const SVC_LIST = [
  'AC & climă','Audio & alarme','Anvelope & jante','Caroserie & tinichigerie',
  'Climatizare','Cutie de viteze','Detailing auto','Diagnoză computerizată',
  'Electrică auto','Eșapamente','Frâne & discuri','Geamuri & parbriz',
  'Geometrie roți','Instalații GPL','ITP','Mecanică generală',
  'Mecanică ușoară','Motor','Recondiționare injectoare','Recondiționare pompe injecție',
  'Recondiționare turbine','Restaurare auto','Revizii & schimb ulei',
  'Suspensie','Tapițerie & interior','Transmisie','Tuning exterior','Tuning motor',
  'Vopsitorie','Altele',
]
const BRANDS_PIESE = ['Orice brand', 'OEM Original', 'Bosch', 'Brembo', 'SKF', 'Febi', 'TRW', 'Valeo']
const STEP_LABELS = ['Mașina', 'Servicii', 'Detalii', 'Confirmare']

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
    description: '', preferred_brand: 'Orice brand', contact_name: '', contact_phone: '',
  })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('rating_avg', { ascending: false }).limit(6)
      .then(({ data }) => setServices(data || []))

    supabase.from('listings').select('*, listing_media(url, is_cover)').eq('status', 'activ')
      .order('is_promoted', { ascending: false }).order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => { setListings(data || []); setLoadingListings(false) })

    const handler = (e: any) => { setModalOpen(true); setModalStep(0); setSubmitDone(false) }
    window.addEventListener('open-quote-modal', handler)
    return () => window.removeEventListener('open-quote-modal', handler)
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
      car_km: form.car_km ? parseInt(form.car_km) : null, car_plate: form.car_plate,
      city: form.city, services: form.services, description: form.description,
      preferred_brand: form.preferred_brand,
      urgency: form.urgency === 'u-green' ? 'flexibil' : form.urgency === 'u-red' ? 'urgent' : 'saptamana',
      preferred_date: form.preferred_date || null, preferred_time: form.preferred_time,
      contact_name: form.contact_name, contact_phone: form.contact_phone, status: 'activa',
    })
    setSubmitting(false)
    setSubmitDone(true)
  }

  const S = { navy:'#0a1f44', blue:'#1a56db', yellow:'#f59e0b', bg:'#f0f6ff', border:'#e5e7eb', muted:'#6b7280' }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: S.bg, minHeight: '100vh' }}>

      {/* ══ HERO ══ */}
      <div style={{ background: 'linear-gradient(135deg,#eaf3ff 0%,#f8fbff 60%,#fff8ed 100%)', padding: '40px 24px 36px', borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="fu1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(26,86,219,0.08)', border: '1px solid rgba(26,86,219,0.15)', color: S.blue, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 50, marginBottom: 16, fontFamily: "'Sora',sans-serif" }}>
            ✦ Platforma servicii auto România
          </div>
          <h1 className="fu2" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 'clamp(26px,4vw,48px)', lineHeight: 1.1, color: S.navy, marginBottom: 14, letterSpacing: -1 }}>
            Găsește cel mai bun<br /><span style={{ color: '#3b82f6' }}>service auto</span> din zona ta
          </h1>
          <p className="fu3" style={{ fontSize: 'clamp(14px,2vw,16px)', color: S.muted, lineHeight: 1.7, maxWidth: 480, marginBottom: 24 }}>
            Cere oferte gratuite, compară prețuri și rezervă programarea online — totul într-un singur loc.
          </p>
          <div className="fu4 hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => { setModalOpen(true); setModalStep(0); setSubmitDone(false) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', background: S.blue, color: '#fff', border: 'none', borderRadius: 50, fontSize: 'clamp(14px,3vw,16px)', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 8px 24px rgba(26,86,219,0.25)', transition: 'background .2s,transform .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1741b0' }}
              onMouseLeave={e => { e.currentTarget.style.background = S.blue }}>
              ✦ Cere ofertă gratuită
            </button>
            <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '13px 24px', color: S.navy, border: `1.5px solid ${S.border}`, borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: "'Sora',sans-serif", background: '#fff' }}>
              Caută service-uri →
            </a>
          </div>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Categorii */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 className="section-title" style={{ fontSize: 17, fontWeight: 700, color: S.navy, fontFamily: "'Sora',sans-serif", letterSpacing: -0.3 }}>Categorii servicii</h2>
          <a href="/search" style={{ fontSize: 13, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>Vezi toate →</a>
        </div>
        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10, marginBottom: 20 }}>
          {CATEGORIES.map(c => (
            <a key={c.key}
              href={c.key === 'dezmembrari' ? '/piese-oferta' : c.key === 'toate' ? '/search' : `/search?category=${c.key}`}
              className="cat-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 6px 12px', background: '#fff', borderRadius: 16, border: `1.5px solid ${S.border}`, cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
              <div className="cat-icon" style={{ width: 44, height: 44, background: c.color, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
              <div className="cat-label" style={{ fontSize: 11, color: S.navy, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{c.label}</div>
            </a>
          ))}
        </div>

        {/* Filtre */}
        <div className="filter-scroll" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: S.muted, alignSelf: 'center', marginRight: 4, flexShrink: 0 }}>Filtrează:</span>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: '7px 16px', borderRadius: 50, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${activeFilter === f ? S.blue : S.border}`, color: activeFilter === f ? S.blue : S.muted, background: activeFilter === f ? '#eaf3ff' : '#fff', fontWeight: activeFilter === f ? 700 : 500, fontFamily: "'DM Sans',sans-serif", flexShrink: 0, whiteSpace: 'nowrap', transition: 'all .15s' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Service-uri recomandate */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="section-title" style={{ fontSize: 17, fontWeight: 700, color: S.navy, fontFamily: "'Sora',sans-serif", letterSpacing: -0.3 }}>Service-uri recomandate</h2>
          <a href="/search" style={{ fontSize: 13, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>Vezi toate →</a>
        </div>

        {services.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${S.border}`, padding: '40px 20px', textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔧</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#666', marginBottom: 6 }}>Niciun service înregistrat momentan</div>
            <a href="/auth/register" style={{ fontSize: 13, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>Înregistrează-ți service-ul gratuit →</a>
          </div>
        ) : (
          <div className="svc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14, marginBottom: 28 }}>
            {services.map(s => (
              <ServiceCard key={s.id}
                name={s.name} city={s.city || ''} dist="" rating={s.rating_avg} reviews={s.rating_count}
                desc={s.description || 'Service auto profesional'} tags={[s.is_verified ? 'Verificat' : '', s.has_itp ? 'ITP pe loc' : '', s.is_authorized_rar ? 'Autorizat RAR' : ''].filter(Boolean)}
                isFav={favorites.has(s.id)} onFav={() => toggleFav(s.id)} onClick={() => window.location.href = `/service/${s.id}`} />
            ))}
          </div>
        )}

        {/* Banner ITP — fără RCA */}
        <div className="promo-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,#eaf3ff,#f0f6ff)', borderRadius: 16, border: `1px solid rgba(26,86,219,0.15)`, padding: '18px 22px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, background: '#1a56db', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.navy, marginBottom: 3, fontFamily: "'Sora',sans-serif" }}>ITP în zona ta</div>
              <div style={{ fontSize: 13, color: S.muted }}>Găsești rapid un service autorizat ITP din apropierea ta.</div>
            </div>
          </div>
          <a href="/itp-rca" style={{ padding: '10px 22px', background: S.blue, color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0, fontFamily: "'Sora',sans-serif", boxShadow: '0 2px 8px rgba(26,86,219,0.2)', whiteSpace: 'nowrap' }}>Caută ITP →</a>
        </div>

        {/* Anunțuri piese */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="section-title" style={{ fontSize: 17, fontWeight: 700, color: S.navy, fontFamily: "'Sora',sans-serif", letterSpacing: -0.3 }}>Anunțuri</h2>
          <a href="/listing" style={{ fontSize: 13, color: S.blue, textDecoration: 'none', fontWeight: 600 }}>Vezi toate →</a>
        </div>

        {loadingListings ? (
          <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {[1, 2, 3, 4].map(i => <div key={i} style={{ background: '#fff', borderRadius: 14, height: 220, border: `0.5px solid ${S.border}`, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${S.border}`, padding: '32px 20px', textAlign: 'center', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Niciun anunț momentan</div>
            </div>
            <a href="/listing/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: S.yellow, color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              + Adaugă anunț gratuit
            </a>
          </div>
        ) : (
          <>
            <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 12 }}>
              {listings.map(l => {
                const coverImg = l.listing_media?.find(m => m.is_cover)?.url || l.listing_media?.[0]?.url
                const daysAgo = Math.floor((new Date().getTime() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={l.id} onClick={() => window.location.href = `/listing/${l.id}`} className="listing-card"
                    style={{ background: '#fff', borderRadius: 14, border: `1px solid ${S.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 2px 8px rgba(10,31,68,0.04)' }}>
                    <div className="listing-card-img" style={{ height: 130, background: '#eaf3ff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {coverImg ? <img src={coverImg} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40 }}>📦</span>}
                      {l.is_promoted && <span style={{ position: 'absolute', top: 8, left: 8, background: S.yellow, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontFamily: "'Sora',sans-serif" }}>TOP</span>}
                      <button onClick={e => { e.stopPropagation(); toggleFav(l.id) }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(255,255,255,0.92)', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {favorites.has(l.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navy, marginBottom: 4 }}>
                        {l.price ? `${l.price.toLocaleString('ro-RO')} lei` : 'Preț negociabil'}
                      </div>
                      <div style={{ fontSize: 12, color: S.muted, marginBottom: 6, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: '#bbb', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📍 {l.city || 'Locație'}</span>
                        <span>{daysAgo === 0 ? 'Azi' : daysAgo === 1 ? 'Ieri' : `${daysAgo}z`}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Buton adaugă anunț vizibil */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <a href="/listing/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: S.yellow, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
                + Adaugă anunț gratuit
              </a>
            </div>
          </>
        )}

        {/* De ce Reparo */}
        <h2 className="section-title" style={{ fontSize: 17, fontWeight: 700, color: S.navy, fontFamily: "'Sora',sans-serif", letterSpacing: -0.3, marginBottom: 14 }}>De ce să alegi Reparo?</h2>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { icon: '🎯', title: 'Oferte gratuite', desc: 'Trimite o cerere și primești oferte de la mai multe service-uri fără niciun cost.' },
            { icon: '📅', title: 'Programare online', desc: 'Alege data și intervalul orar direct din platformă. Fără telefon.' },
            { icon: '✅', title: 'Service-uri verificate', desc: 'Toți partenerii sunt verificați și evaluați de clienți reali.' },
            { icon: '⭐', title: 'Recenzii reale', desc: 'Recenzii verificate de la clienți reali pentru fiecare service.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', borderRadius: 16, border: `1px solid ${S.border}`, padding: '18px 14px', boxShadow: '0 2px 8px rgba(10,31,68,0.04)' }}>
              <div style={{ width: 44, height: 44, background: '#eaf3ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: S.navy, marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Service */}
        <div className="cta-section" style={{ background: S.navy, borderRadius: 20, padding: '32px 36px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 8, letterSpacing: -0.3 }}>Ești proprietar de service auto?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
            Înregistrează-te pe Reparo și primești cereri de ofertă direct de la clienți din zona ta.
          </p>
          <div className="cta-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <a href="/auth/register" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: S.yellow, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
              Înregistrează service-ul →
            </a>
            <a href="/despre" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', color: 'rgba(255,255,255,0.8)', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)' }}>
              Află mai mult
            </a>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: S.navy, padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: '#1a56db', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff', fontFamily: "'Sora',sans-serif" }}>R</div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>Reparo</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 240, marginBottom: 16 }}>Platforma care conectează șoferii cu cele mai bune service-uri auto din România.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['📘', 'Facebook'], ['📷', 'Instagram'], ['💼', 'LinkedIn']].map(([icon, name]) => (
                  <div key={name} style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>{icon}</div>
                ))}
              </div>
            </div>
            {[
              { title: 'PLATFORMĂ', links: [['Cum funcționează', '/despre'], ['Caută service', '/search'], ['Cerere ofertă', '/home'], ['ITP', '/itp-rca'], ['Piese & Dezmembrări', '/listing']] },
              { title: 'SERVICE-URI', links: [['Înregistrare', '/auth/register'], ['Dashboard', '/dashboard/service'], ['Planuri', '/auth/register'], ['Promovare', '/auth/register'], ['Suport', '/contact']] },
              { title: 'COMPANIE', links: [['Despre Reparo', '/despre'], ['Blog auto', '/blog'], ['Cariere', '/cariere'], ['Contact', '/contact'], ['Presă', '/contact']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14, fontFamily: "'Sora',sans-serif" }}>{col.title}</div>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} className="footer-link" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 Reparo. Toate drepturile rezervate.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['Termeni', '/termeni'], ['Confidențialitate', '/confidentialitate'], ['Cookie-uri', '/cookies']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══ MODAL CERERE OFERTĂ ══ */}
      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: S.navy, borderRadius: 20, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {STEP_LABELS.map((l, i) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: i <= modalStep ? '#3b82f6' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {i < modalStep ? '✓' : i + 1}
                      </div>
                      {i < STEP_LABELS.length - 1 && <div style={{ width: 20, height: 1, background: i < modalStep ? '#3b82f6' : 'rgba(255,255,255,0.15)' }} />}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>
                  {submitDone ? '🎉 Cerere trimisă!' : STEP_LABELS[modalStep]}
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              {submitDone ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>Cererea ta a fost trimisă!</div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 }}>Service-urile din zona ta vor răspunde în maxim 24h.</p>
                  <button onClick={() => { setModalOpen(false); window.location.href = '/oferte' }}
                    style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                    Vezi ofertele mele →
                  </button>
                </div>
              ) : modalStep === 0 ? (
                <div>
                  {/* Brand autocomplete */}
                  <div style={{ marginBottom: 10, position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Marcă mașină *</label>
                    <input value={form.car_brand}
                      onChange={e => setForm(p => ({ ...p, car_brand: e.target.value, car_model: '' }))}
                      placeholder="ex: BMW, Dacia, Volkswagen..."
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    {form.car_brand.length >= 1 && !CAR_BRANDS.some(b => b.toLowerCase() === form.car_brand.toLowerCase()) && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a2f5e', borderRadius: 10, zIndex: 50, maxHeight: 180, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)', marginTop: 4 }}>
                        {CAR_BRANDS.filter(b => b.toLowerCase().includes(form.car_brand.toLowerCase())).slice(0, 8).map(b => (
                          <div key={b} onClick={() => setForm(p => ({ ...p, car_brand: b, car_model: '' }))}
                            style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {b}
                          </div>
                        ))}
                        {CAR_BRANDS.filter(b => b.toLowerCase().includes(form.car_brand.toLowerCase())).length === 0 && (
                          <div style={{ padding: '9px 14px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Scrie manual marca</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Model autocomplete */}
                  <div style={{ marginBottom: 10, position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Model *</label>
                    <input value={form.car_model}
                      onChange={e => setForm(p => ({ ...p, car_model: e.target.value }))}
                      placeholder={form.car_brand && CAR_MODELS[form.car_brand] ? `ex: ${CAR_MODELS[form.car_brand][0]}` : 'Selectează mai întâi marca'}
                      disabled={!form.car_brand}
                      style={{ width: '100%', padding: '10px 12px', background: form.car_brand ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', opacity: form.car_brand ? 1 : 0.5 }} />
                    {form.car_brand && form.car_model.length >= 1 && CAR_MODELS[form.car_brand] && !CAR_MODELS[form.car_brand].includes(form.car_model) && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a2f5e', borderRadius: 10, zIndex: 50, maxHeight: 180, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)', marginTop: 4 }}>
                        {(CAR_MODELS[form.car_brand] || []).filter(m => m.toLowerCase().includes(form.car_model.toLowerCase())).slice(0, 8).map(m => (
                          <div key={m} onClick={() => setForm(p => ({ ...p, car_model: m }))}
                            style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {m}
                          </div>
                        ))}
                        {(CAR_MODELS[form.car_brand] || []).filter(m => m.toLowerCase().includes(form.car_model.toLowerCase())).length === 0 && (
                          <div style={{ padding: '9px 14px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Scrie manual modelul</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {/* An fabricatie */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>An fabricație</label>
                      <select value={form.car_year} onChange={e => setForm(p => ({ ...p, car_year: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}>
                        <option value="" style={{ background: '#1a2332' }}>Selectează</option>
                        {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y} style={{ background: '#1a2332' }}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* Combustibil */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Combustibil</label>
                      <select value={form.car_fuel} onChange={e => setForm(p => ({ ...p, car_fuel: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}>
                        <option value="" style={{ background: '#1a2332' }}>Selectează</option>
                        {FUEL_TYPES.map(f => <option key={f} value={f} style={{ background: '#1a2332' }}>{f}</option>)}
                      </select>
                    </div>

                    {/* Kilometraj */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Kilometraj</label>
                      <input type="number" value={form.car_km} onChange={e => setForm(p => ({ ...p, car_km: e.target.value }))} placeholder="ex: 87000"
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    </div>

                    {/* Nr. inmatriculare */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Nr. înmatriculare (opț.)</label>
                      <input value={form.car_plate} onChange={e => setForm(p => ({ ...p, car_plate: e.target.value }))} placeholder="B-11-XYZ"
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Oras autocomplete */}
                  <div style={{ marginBottom: 10, position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Orașul tău</label>
                    <input value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="ex: București, Cluj-Napoca..."
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    {form.city.length >= 2 && !CITIES.some(c => c.toLowerCase() === form.city.toLowerCase()) && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a2f5e', borderRadius: 10, zIndex: 50, maxHeight: 160, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)', marginTop: 4 }}>
                        {CITIES.filter(c => c.toLowerCase().includes(form.city.toLowerCase())).slice(0, 6).map(c => (
                          <div key={c} onClick={() => setForm(p => ({ ...p, city: c }))}
                            style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            📍 {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => setModalStep(1)} disabled={!form.car_brand || !form.car_model}
                    style={{ width: '100%', padding: '12px', background: form.car_brand && form.car_model ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", marginTop: 6 }}>
                    Continuă →
                  </button>
                </div>
              ) : modalStep === 1 ? (
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Precizează specialitatea în care se încadrează lucrarea:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                    {SVC_LIST.map((svc, i) => (
                      <label key={svc} onClick={() => toggleSvc(svc)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: form.services.includes(svc) ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', borderBottom: i < SVC_LIST.length - 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', transition: 'background .1s' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.services.includes(svc) ? '#3b82f6' : 'rgba(255,255,255,0.3)'}`, background: form.services.includes(svc) ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .1s' }}>
                          {form.services.includes(svc) && <svg width="9" height="9" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{ fontSize: 12, color: form.services.includes(svc) ? '#93c5fd' : 'rgba(255,255,255,0.75)', fontWeight: form.services.includes(svc) ? 600 : 400, lineHeight: 1.3 }}>{svc}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setModalStep(0)} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, cursor: 'pointer' }}>← Înapoi</button>
                    <button onClick={() => setModalStep(2)} disabled={form.services.length === 0}
                      style={{ flex: 1, padding: '11px', background: form.services.length > 0 ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                      Continuă ({form.services.length} selectate) →
                    </button>
                  </div>
                </div>
              ) : modalStep === 2 ? (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Urgență</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['u-green', '😌 Flexibil'], ['u-amber', '📅 Săptămâna asta'], ['u-red', '🚨 Urgent']].map(([val, label]) => (
                        <button key={val} onClick={() => setForm(p => ({ ...p, urgency: val }))}
                          style={{ flex: 1, padding: '10px 6px', background: form.urgency === val ? '#3b82f6' : 'rgba(255,255,255,0.06)', border: `1px solid ${form.urgency === val ? '#3b82f6' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, fontSize: 11, color: '#fff', cursor: 'pointer', fontWeight: form.urgency === val ? 700 : 400 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Data preferată</label>
                      <input type="date" value={form.preferred_date} onChange={e => setForm(p => ({ ...p, preferred_date: e.target.value }))} min={new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Brand piese</label>
                      <select value={form.preferred_brand} onChange={e => setForm(p => ({ ...p, preferred_brand: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}>
                        {BRANDS_PIESE.map(b => <option key={b} style={{ background: '#1a2332' }}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Descrie problema (opțional)</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                      placeholder="Ex: Zgomot la frânare față, suspectez plăcuțe uzate..."
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', resize: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setModalStep(1)} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, cursor: 'pointer' }}>← Înapoi</button>
                    <button onClick={() => setModalStep(3)} style={{ flex: 1, padding: '11px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>Continuă →</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Numele tău</label>
                      <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Ion Popescu"
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Telefon</label>
                      <input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="07xx xxx xxx" type="tel"
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Sumar cerere</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>🚗 {form.car_brand} {form.car_model} {form.car_year}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>🔧 {form.services.slice(0, 3).join(', ')}{form.services.length > 3 ? ` +${form.services.length - 3}` : ''}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>📍 {form.city}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setModalStep(2)} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, cursor: 'pointer' }}>← Înapoi</button>
                    <button onClick={submitRequest} disabled={submitting}
                      style={{ flex: 1, padding: '11px', background: submitting ? 'rgba(255,255,255,0.1)' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                      {submitting ? 'Se trimite...' : '✦ Trimite cererea gratuit →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceCard({ name, city, dist, rating, reviews, desc, tags, isFav, onFav, onClick }: any) {
  return (
    <div onClick={onClick} className="svc-card" style={{ background: '#fff', borderRadius: 14, border: `1px solid #e5e7eb`, padding: 18, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all .2s', boxShadow: '0 2px 8px rgba(10,31,68,0.04)' }}>
      <div style={{ width: 50, height: 50, background: '#eaf3ff', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🔧</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1f44', marginBottom: 2, fontFamily: "'Sora',sans-serif" }}>{name}</div>
        <div style={{ display: 'flex', gap: 1, marginBottom: 4 }}>
          {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 12, color: s <= Math.round(rating) ? '#f59e0b' : '#ddd' }}>★</span>)}
          <span style={{ fontSize: 11, color: '#aaa', marginLeft: 3 }}>({reviews})</span>
        </div>
        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {tags.map((t: string) => <span key={t} style={{ background: '#eaf3ff', color: '#1a56db', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>{t}</span>)}
        </div>
        <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>📍 {city}{dist ? ` · ${dist}` : ''}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onFav() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, flexShrink: 0, padding: 4 }}>
        {isFav ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
