// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Service = { id: string; name: string; city: string | null; rating_avg: number; rating_count: number; is_verified: boolean; has_itp: boolean; address: string | null; plan: string; description: string | null }

const CATEGORIES = [
  { label: 'Schimb ulei & filtre', icon: '🚗', color: '#E6F0FB', key: 'schimb_ulei' },
  { label: 'Geometrie & echilibrare', icon: '⚙️', color: '#FEF3E2', key: 'geometrie' },
  { label: 'Frâne & discuri', icon: '🔴', color: '#FEEEEB', key: 'frane' },
  { label: 'Diagnoză electronică', icon: '💻', color: '#EAF3DE', key: 'diagnoza' },
  { label: 'Vopsitorie & caroserie', icon: '🎨', color: '#F5EEFB', key: 'vopsitorie' },
  { label: 'ITP & RAR', icon: '🛡️', color: '#E6F0FB', key: 'itp' },
  { label: 'Climatizare & AC', icon: '❄️', color: '#FEF3E2', key: 'climatizare' },
  { label: 'Toate categoriile', icon: '➕', color: '#F1EFE8', key: 'toate' },
]

const FILTERS = ['Toate', 'Deschis acum', '± 5 km', '± 10 km', '± 25 km', 'Recenzii 4+', 'Diesel', 'Benzină', 'Hybrid / Electric', 'Service autorizat', 'Garanție lucrări']

const NAV_TABS = [
  { label: 'Acasă', href: '/home' },
  { label: 'Service-uri', href: '/search' },
  { label: 'Anunțuri piese', href: '/listing' },
  { label: 'ITP & RCA', href: '/itp-rca' },
  { label: 'Vopsitorie', href: '/search?category=vopsitorie' },
  { label: 'Electrice & Diagnoză', href: '/search?category=electrica' },
  { label: 'Anvelope', href: '/search?category=anvelope' },
  { label: 'Tractări', href: '/search?category=tractari' },
]

const URGENCY_LABELS: Record<string, string> = { 'u-green': 'Flexibil', 'u-amber': 'Săptămâna asta', 'u-red': 'Urgent' }

export default function HomeClient() {
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [activeFilter, setActiveFilter] = useState('Toate')
  const [activeTab, setActiveTab] = useState('Acasă')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [city, setCity] = useState('București')
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  // Form state
  const [form, setForm] = useState({
    car_brand: '', car_model: '', car_year: '', car_fuel: '', car_km: '', car_plate: '', city: 'București',
    services: [] as string[], urgency: 'u-amber', preferred_date: '', preferred_time: '09:00-12:00',
    description: '', preferred_brand: 'Orice brand',
    contact_name: '', contact_phone: '', char_count: 0,
  })
  const [submitDone, setSubmitDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    supabase.from('services').select('*').eq('is_active', true).order('rating_avg', { ascending: false }).limit(6)
      .then(({ data }) => setServices(data || []))
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
      user_id: user?.id || null,
      car_brand: form.car_brand, car_model: form.car_model,
      car_year: form.car_year ? parseInt(form.car_year) : null,
      car_fuel: form.car_fuel, car_km: form.car_km ? parseInt(form.car_km) : null,
      car_plate: form.car_plate, city: form.city,
      services: form.services, description: form.description,
      preferred_brand: form.preferred_brand, urgency: URGENCY_LABELS[form.urgency] === 'Flexibil' ? 'flexibil' : URGENCY_LABELS[form.urgency] === 'Urgent' ? 'urgent' : 'saptamana',
      preferred_date: form.preferred_date || null, preferred_time: form.preferred_time,
      contact_name: form.contact_name, contact_phone: form.contact_phone, status: 'activa',
    })
    setSubmitting(false)
    setSubmitDone(true)
  }

  const STEP_LABELS = ['Mașina', 'Servicii', 'Detalii', 'Confirmare']
  const SVC_LIST = ['Schimb ulei & filtre', 'Frâne & discuri', 'Geometrie roți', 'Echilibrare roți', 'Diagnoză electronică', 'Suspensie', 'Transmisie & cutie viteze', 'Vopsitorie & caroserie', 'Climatizare & AC', 'Electrică auto', 'Motor', 'ITP', 'Anvelope & jante', 'Injecție & turbo', 'Polishing & detailing', 'Altele']
  const BRANDS_PIESE = ['Orice brand', 'OEM Original', 'Bosch', 'Brembo', 'SKF', 'Febi', 'TRW', 'Valeo']

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>

      {/* ══════════════ TOPBAR ══════════════ */}
      <div style={{ background: '#1a2332', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', maxWidth: 1280, margin: '0 auto' }}>
          {/* Logo */}
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: '#4A90D9', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#fff' }}>R</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>Reparo</span>
          </a>

          {/* Search bar */}
          <div style={{ flex: 1, display: 'flex', maxWidth: 680 }}>
            <div style={{ padding: '0 12px', background: '#fff', fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 5, borderRadius: '10px 0 0 10px', borderRight: '1px solid #e5e5e5', minWidth: 120, height: 44, cursor: 'pointer' }}>
              📍 {city}
              <svg width="9" height="5" viewBox="0 0 9 5" fill="none"><path d="M1 1L4.5 4.5L8 1" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Caută service, piesă, lucrare auto..."
              style={{ flex: 1, padding: '11px 14px', border: 'none', fontSize: 14, color: '#1a1a1a', outline: 'none', background: '#fff', height: 44, minWidth: 0 }}
              onKeyDown={e => { if (e.key === 'Enter' && searchQuery) window.location.href = `/search?q=${encodeURIComponent(searchQuery)}` }}
            />
            <button onClick={() => searchQuery && (window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`)}
              style={{ padding: '0 20px', background: '#4A90D9', border: 'none', borderRadius: '0 10px 10px 0', cursor: 'pointer', height: 44, display: 'flex', alignItems: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#fff" strokeWidth="1.7"/><path d="M11 11L15 15" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {user ? (
              <>
                <a href="/account" style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', cursor: 'pointer' }}>Contul meu</a>
                <a href="/oferte" style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', cursor: 'pointer' }}>Ofertele mele</a>
                <a href="/dashboard/service" style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: '#4A90D9', color: '#fff', textDecoration: 'none', cursor: 'pointer' }}>Dashboard</a>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}
                  style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                  Ieși
                </button>
              </>
            ) : (
              <>
                <a href="/auth/register" style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', textDecoration: 'none', cursor: 'pointer' }}>Înregistrează service</a>
                <a href="/auth/login" style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: '#4A90D9', color: '#fff', textDecoration: 'none', cursor: 'pointer' }}>Intră în cont</a>
              </>
            )}
            <button onClick={() => { setModalOpen(true); setModalStep(0); setSubmitDone(false) }}
              style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: '#FF6B35', color: '#fff', border: 'none', cursor: 'pointer' }}>
              + Cerere ofertă
            </button>
          </div>

          {/* Hamburger mobile */}
          <button onClick={() => setDrawerOpen(o => !o)} style={{ display: 'none', flexDirection: 'column', gap: 4, cursor: 'pointer', padding: 4, background: 'none', border: 'none' }} className="mob-hamburger">
            <span style={{ display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 }}/>
            <span style={{ display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 }}/>
            <span style={{ display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 }}/>
          </button>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', padding: '0 24px', maxWidth: 1280, margin: '0 auto', overflowX: 'auto' }}>
          {NAV_TABS.map(t => (
            <a key={t.label} href={t.href}
              style={{ padding: '9px 16px', fontSize: 13, color: t.href === '/home' ? '#fff' : 'rgba(255,255,255,0.65)', background: 'none', border: 'none', borderBottom: t.href === '/home' ? '2px solid #4A90D9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: t.href === '/home' ? 600 : 400, fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block' }}>
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* ══════════════ HERO ══════════════ */}
      <div style={{ background: '#1a2332', padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: -0.5, lineHeight: 1.2 }}>
            Găsește cel mai bun service auto din zona ta
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 20, lineHeight: 1.6 }}>
            Cere oferte gratuite, compară prețuri și rezervă programarea online — totul într-un singur loc.
          </p>
          <button onClick={() => { setModalOpen(true); setModalStep(0); setSubmitDone(false) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ⭐ Cere ofertă
          </button>
          <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Gratuit · Fără cont · Răspuns în 24h
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {[['2.400+', 'Service-uri partenere'], ['48.000+', 'Oferte trimise'], ['4.8 / 5', 'Rating mediu'], ['Gratuit', 'Cerere ofertă']].map(([v, l]) => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                <strong style={{ color: '#fff', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 1 }}>{v}</strong>{l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN ══════════════ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Categorii */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>Categorii servicii</h2>
          <a href="/search" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>Vezi toate →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 8, marginBottom: 28 }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => window.location.href = `/search?category=${c.key}`}
              style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', padding: '14px 6px 12px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A90D9')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.color, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: '#444', fontWeight: 500, lineHeight: 1.3 }}>{c.label}</div>
            </button>
          ))}
        </div>

        {/* Filtre */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Filtrează:</span>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: '7px 13px', borderRadius: 20, fontSize: 13, border: activeFilter === f ? '0.5px solid #4A90D9' : '0.5px solid #ddd', color: activeFilter === f ? '#1a5fa8' : '#444', background: activeFilter === f ? '#E6F0FB' : '#fff', fontWeight: activeFilter === f ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Service-uri recomandate */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>Service-uri recomandate</h2>
          <a href="/search" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>Vezi toate →</a>
        </div>

        {services.length === 0 ? (
          // Placeholder servicii (pana se incarca din Supabase)
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { name: 'AutoPro Service SRL', city: 'Sector 2', dist: '2.3 km', rating: 4.9, reviews: 124, desc: 'Schimb ulei, frâne, geometrie, diagnoză. Autorizat BMW & Mercedes.', tags: ['Autorizat RAR', 'Garanție 12 luni'], color: '#E6F0FB' },
              { name: 'GreenMech Auto', city: 'Sector 6', dist: '4.1 km', rating: 4.3, reviews: 87, desc: 'Specializat VW Group. ITP pe loc, diagnoză VCDS, DSG.', tags: ['Specializat VW', 'ITP pe loc'], color: '#EAF3DE' },
              { name: 'FastFix Caroserie', city: 'Sector 4', dist: '5.8 km', rating: 4.1, reviews: 56, desc: 'Vopsitorie, caroserie, polishing. Estimare gratuită pe loc.', tags: ['Vopsitorie', 'Estimare gratuită'], color: '#FEEEEB' },
            ].map(s => <ServiceCard key={s.name} {...s} onFav={() => {}} isFav={false} onClick={() => {}}/>)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14, marginBottom: 28 }}>
            {services.map(s => (
              <ServiceCard key={s.id}
                name={s.name} city={s.city || ''} dist="" rating={s.rating_avg} reviews={s.rating_count}
                desc={s.description || 'Service auto profesional'} tags={[s.is_verified ? 'Verificat' : '', s.has_itp ? 'ITP pe loc' : ''].filter(Boolean)} color="#E6F0FB"
                isFav={favorites.has(s.id)} onFav={() => toggleFav(s.id)} onClick={() => window.location.href = `/service/${s.id}`}/>
            ))}
          </div>
        )}

        {/* Promo ITP/RCA */}
        <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, background: '#E6F0FB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>Ai RCA sau ITP care expiră curând?</div>
              <div style={{ fontSize: 13, color: '#666' }}>Reparo îți trimite reminder automat și găsește cele mai bune oferte din zona ta.</div>
            </div>
          </div>
          <a href="/auth/register" style={{ padding: '10px 20px', background: '#4A90D9', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Verifică acum →
          </a>
        </div>

        {/* Anunturi recente */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>Anunțuri recente — Piese & Accesorii</h2>
          <a href="/listing" style={{ fontSize: 13, color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>Vezi toate →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { title: 'Set plăcuțe față Brembo BMW E90 — Originale, sigilate', price: '320 lei', city: 'Sector 3', badge: 'TOP', badgeColor: '#FF6B35', bg: '#dce8f5' },
            { title: 'Jante aliaj 17" 5x120 BMW — Toate 4, fără defecte', price: '1.800 lei', city: 'Ilfov', badge: null, bg: '#ebebeb' },
            { title: 'Senzor parcare Bosch — Universal, sigilat, garanție 2 ani', price: '450 lei', city: 'Sector 1', badge: 'NOU', badgeColor: '#639922', bg: '#e4ede4' },
            { title: 'Far stânga LED Audi A4 B9 — Original, 15.000 km', price: '2.200 lei', city: 'Cluj-Napoca', badge: null, bg: '#ede4f0' },
          ].map((l, i) => (
            <div key={i} onClick={() => window.location.href = '/listing'}
              style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', overflow: 'hidden', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A90D9')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}>
              <div style={{ background: l.bg, height: 120, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                🔧
                {l.badge && <span style={{ position: 'absolute', top: 8, left: 8, background: l.badgeColor, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{l.badge}</span>}
                <button onClick={e => { e.stopPropagation(); toggleFav(`listing-${i}`) }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, background: 'rgba(255,255,255,0.92)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {favorites.has(`listing-${i}`) ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{l.price}</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 7, lineHeight: 1.4 }}>{l.title}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>📍 {l.city}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>De ce să alegi Reparo?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: '🛡️', title: 'Oferte gratuite', desc: 'Trimite o cerere și primești oferte de la mai multe service-uri fără niciun cost.' },
            { icon: '📅', title: 'Programare online', desc: 'Alege data și intervalul orar direct din platformă. Fără telefon.' },
            { icon: '✅', title: 'Service-uri verificate', desc: 'Toți partenerii sunt verificați și evaluați de clienți reali.' },
            { icon: '⭐', title: 'Recenzii reale', desc: 'Recenzii verificate de la clienți reali pentru fiecare service.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Service */}
        <div style={{ background: '#1a2332', borderRadius: 16, padding: '30px 32px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 7, letterSpacing: -0.3 }}>Ești proprietar de service auto?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 500 }}>Înregistrează-te pe Reparo și primești cereri de ofertă direct de la clienți din zona ta.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <a href="/auth/register" style={{ padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#fff', color: '#1a2332', textDecoration: 'none', cursor: 'pointer' }}>Înregistrează service-ul →</a>
            <button style={{ padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: 'inherit' }}>Află mai mult</button>
          </div>
        </div>
      </div>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: '#1a2332', padding: '36px 24px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 36, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 26, height: 26, background: '#4A90D9', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>R</div>
              Reparo
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Platforma care conectează șoferii cu cele mai bune service-uri auto din România.</div>
          </div>
          {[
            { title: 'Platformă', links: ['Cum funcționează', 'Caută service', 'Cerere de ofertă', 'ITP & RCA', 'Piese auto'] },
            { title: 'Service-uri', links: ['Înregistrare service', 'Panou de control', 'Planuri și tarife', 'Promovare anunțuri', 'Suport parteneri'] },
            { title: 'Companie', links: ['Despre Reparo', 'Blog auto', 'Cariere', 'Contact', 'Presă'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>{col.title}</h4>
              {col.links.map(l => <a key={l} href="#" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: 7 }}>{l}</a>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: 18, maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>© 2026 Reparo. Toate drepturile rezervate.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Termeni și condiții', 'Confidențialitate', 'Cookie-uri'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>{l}</a>)}
          </div>
        </div>
      </footer>

      {/* ══════════════ MODAL CERERE OFERTA ══════════════ */}
      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px 40px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 660, margin: 'auto' }}>
            {/* Header */}
            <div style={{ background: '#1a2332', padding: '20px 24px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Cerere de ofertă</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Completează datele și primești oferte în max. 24h</div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Steps */}
            {!submitDone && (
              <div style={{ display: 'flex', background: '#f8f8f8', borderBottom: '0.5px solid #eee' }}>
                {STEP_LABELS.map((s, i) => (
                  <div key={s} style={{ flex: 1, padding: '13px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: i === modalStep ? '#1a2332' : i < modalStep ? '#34C759' : '#bbb', borderBottom: i === modalStep ? '2px solid #4A90D9' : '2px solid transparent', cursor: i < modalStep ? 'pointer' : 'default' }}
                    onClick={() => i < modalStep && setModalStep(i)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: i === modalStep ? '#4A90D9' : i < modalStep ? '#34C759' : '#e0e0e0', color: i <= modalStep ? '#fff' : '#999', fontSize: 11, fontWeight: 700, marginRight: 6 }}>
                      {i < modalStep ? '✓' : i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: 24 }}>
              {submitDone ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 64, height: 64, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✅</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Cererea a fost trimisă!</div>
                  <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 24px' }}>Service-urile din zona ta au primit cererea și vor reveni cu oferte în maxim 24 de ore.</p>
                  <button onClick={() => setModalOpen(false)} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#4A90D9', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Închide</button>
                </div>
              ) : modalStep === 0 ? (
                // STEP 1: MASINA
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { key: 'car_brand', label: 'Marcă', type: 'select', opts: ['', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Dacia', 'Renault', 'Ford', 'Opel', 'Peugeot', 'Skoda', 'Hyundai', 'Kia', 'Volvo'] },
                      { key: 'car_model', label: 'Model', type: 'text', placeholder: 'ex: Seria 3, Golf...' },
                      { key: 'car_year', label: 'An fabricație', type: 'select', opts: ['', ...Array.from({length: 25}, (_, i) => String(2024 - i))] },
                      { key: 'car_fuel', label: 'Combustibil', type: 'select', opts: ['', 'Benzină', 'Diesel', 'Hybrid', 'Electric', 'GPL'] },
                      { key: 'car_km', label: 'Kilometraj', type: 'number', placeholder: 'ex: 87500' },
                      { key: 'car_plate', label: 'Nr. înmatriculare (opț.)', type: 'text', placeholder: 'B-11-XYZ' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{f.label}</label>
                        {f.type === 'select' ? (
                          <select value={form[f.key as keyof typeof form] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}>
                            {f.opts?.map(o => <option key={o} value={o}>{o || 'Selectează'}</option>)}
                          </select>
                        ) : (
                          <input type={f.type} value={form[f.key as keyof typeof form] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}/>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Oraș</label>
                    <select value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}>
                      {['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Craiova', 'Galați', 'Ploiești', 'Oradea', 'Sibiu', 'Pitești'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ) : modalStep === 1 ? (
                // STEP 2: SERVICII
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Ce servicii ai nevoie?</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {SVC_LIST.map(s => (
                        <button key={s} onClick={() => toggleSvc(s)}
                          style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, border: form.services.includes(s) ? '0.5px solid #4A90D9' : '0.5px solid #ddd', color: form.services.includes(s) ? '#1a5fa8' : '#555', background: form.services.includes(s) ? '#E6F0FB' : '#fafafa', fontWeight: form.services.includes(s) ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Urgență</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {[['u-green', 'Flexibil', 'Oricând în 2+ săpt.', '#EAF3DE', '#3B6D11'], ['u-amber', 'Săptămâna asta', 'În 7 zile', '#FAEEDA', '#854F0B'], ['u-red', 'Urgent', '1–2 zile', '#FCEBEB', '#A32D2D']].map(([key, label, sub, bg, color]) => (
                        <button key={key} onClick={() => setForm(prev => ({ ...prev, urgency: key }))}
                          style={{ padding: '12px 10px', borderRadius: 12, border: `0.5px solid ${form.urgency === key ? color : '#ddd'}`, cursor: 'pointer', textAlign: 'center', background: form.urgency === key ? bg : '#fafafa', fontFamily: 'inherit' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: form.urgency === key ? color : '#555' }}>{label}</div>
                          <div style={{ fontSize: 11, color: form.urgency === key ? color : '#bbb', marginTop: 2 }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Data preferată</label>
                      <input type="date" value={form.preferred_date} onChange={e => setForm(prev => ({ ...prev, preferred_date: e.target.value }))}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}/>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Interval orar</label>
                      <select value={form.preferred_time} onChange={e => setForm(prev => ({ ...prev, preferred_time: e.target.value }))}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}>
                        {['08:00-10:00', '09:00-12:00', '10:00-13:00', '12:00-15:00', '14:00-17:00', '15:00-18:00'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ) : modalStep === 2 ? (
                // STEP 3: DETALII
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Descrie problema</label>
                    <textarea value={form.description} maxLength={500}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value, char_count: e.target.value.length }))}
                      rows={4} placeholder="Ex: Zgomot la frânare față, suspectez plăcuțe uzate..."
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}/>
                    <div style={{ fontSize: 11, color: '#ccc', textAlign: 'right', marginTop: 4 }}>{form.char_count} / 500</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Preferință piese</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {BRANDS_PIESE.map(b => (
                        <button key={b} onClick={() => setForm(prev => ({ ...prev, preferred_brand: b }))}
                          style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, border: form.preferred_brand === b ? '0.5px solid #4A90D9' : '0.5px solid #ddd', color: form.preferred_brand === b ? '#1a5fa8' : '#555', background: form.preferred_brand === b ? '#E6F0FB' : '#fafafa', fontWeight: form.preferred_brand === b ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Numele tău</label>
                      <input value={form.contact_name} onChange={e => setForm(prev => ({ ...prev, contact_name: e.target.value }))}
                        placeholder="Ion Popescu"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}/>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Telefon</label>
                      <input value={form.contact_phone} onChange={e => setForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="07xx xxx xxx" type="tel"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit' }}/>
                    </div>
                  </div>
                </div>
              ) : (
                // STEP 4: CONFIRMARE
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>Verifică datele înainte de trimitere</div>
                  <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16, border: '0.5px solid #eee', marginBottom: 16 }}>
                    {[
                      ['Mașina', `${form.car_brand} ${form.car_model} ${form.car_year}`],
                      ['Combustibil', form.car_fuel || '—'],
                      ['Kilometraj', form.car_km ? `${parseInt(form.car_km).toLocaleString()} km` : '—'],
                      ['Oraș', form.city],
                      ['Servicii', form.services.length > 0 ? form.services.join(', ') : 'Nespecificat'],
                      ['Urgență', URGENCY_LABELS[form.urgency]],
                      ['Data', form.preferred_date ? `${form.preferred_date} · ${form.preferred_time}` : '—'],
                      ['Contact', `${form.contact_name || '—'} · ${form.contact_phone || '—'}`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #eee', fontSize: 13 }}>
                        <span style={{ color: '#888' }}>{label}</span>
                        <span style={{ fontWeight: 500, color: '#1a1a1a', textAlign: 'right', maxWidth: 300 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#FAEEDA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#854F0B', marginBottom: 0 }}>
                    ⚠️ Cererea va fi trimisă la service-urile din zona ta. Vei fi contactat în maxim 24 de ore.
                  </div>
                </div>
              )}
            </div>

            {/* Footer butoane */}
            {!submitDone && (
              <div style={{ padding: '16px 24px', borderTop: '0.5px solid #eee', display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#bbb' }}>Pasul {modalStep + 1} din 4</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {modalStep > 0 && (
                    <button onClick={() => setModalStep(s => s - 1)}
                      style={{ padding: '11px 20px', borderRadius: 10, border: '0.5px solid #ddd', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: 'inherit' }}>
                      ← Înapoi
                    </button>
                  )}
                  {modalStep < 3 ? (
                    <button onClick={() => setModalStep(s => s + 1)}
                      style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: '#4A90D9', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Continuă →
                    </button>
                  ) : (
                    <button onClick={submitRequest} disabled={submitting}
                      style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: '#FF6B35', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Se trimite...' : 'Trimite cererea →'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceCard({ name, city, dist, rating, reviews, desc, tags, color, isFav, onFav, onClick }: any) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e8e8e8', padding: 18, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A90D9')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}>
      <div style={{ width: 50, height: 50, background: color, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🚗</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{name}</div>
        <div style={{ display: 'flex', gap: 1, marginBottom: 4 }}>
          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12, color: s <= Math.round(rating) ? '#F5A623' : '#ddd' }}>★</span>)}
          <span style={{ fontSize: 11, color: '#aaa', marginLeft: 3 }}>({reviews})</span>
        </div>
        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4, marginBottom: 6 }}>{desc}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {tags.map((t: string) => <span key={t} style={{ background: '#E6F0FB', color: '#1a5fa8', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>{t}</span>)}
        </div>
        <div style={{ fontSize: 11, color: '#4A90D9', fontWeight: 500 }}>📍 {city}{dist ? ` · ${dist}` : ''}</div>
      </div>
    </div>
  )
}
