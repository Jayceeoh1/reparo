// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

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

const EXCLUDED = ['/auth/login', '/auth/register', '/dashboard/service']

export default function GlobalLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cityDropdown, setCityDropdown] = useState(false)
  const [city, setCity] = useState('București')
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const supabase = createClient()

  const isExcluded = EXCLUDED.some(p => pathname?.startsWith(p))

  const CITIES = [
    'Toate orașele', 'Alba Iulia', 'Alexandria', 'Arad', 'Bacău', 'Baia Mare',
    'Bistrița', 'Botoșani', 'Brăila', 'Brașov', 'București', 'Buzău',
    'Cluj-Napoca', 'Constanța', 'Craiova', 'Deva', 'Focșani', 'Galați',
    'Iași', 'Miercurea Ciuc', 'Oradea', 'Piatra Neamț', 'Pitești', 'Ploiești',
    'Râmnicu Vâlcea', 'Satu Mare', 'Sibiu', 'Slatina', 'Slobozia', 'Suceava',
    'Târgoviște', 'Târgu Jiu', 'Târgu Mureș', 'Timișoara', 'Tulcea', 'Zalău',
  ]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!cityDropdown) return
    function handleClick(e) {
      const el = document.getElementById('city-dropdown-wrapper')
      if (el && !el.contains(e.target)) setCityDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [cityDropdown])

  if (isExcluded) return <>{children}</>

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .nav-scrollbar::-webkit-scrollbar { display: none; }
        .nav-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hide-desktop { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>

        {/* ═══ TOPBAR ═══ */}
        <div style={{ background: '#1a2332', position: 'sticky', top: 0, zIndex: 100 }}>

          {/* Row 1: Logo + Search + Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', maxWidth: 1280, margin: '0 auto' }}>

            {/* Logo */}
            <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, background: '#4A90D9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: '#fff' }}>R</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.8 }} className="hide-mobile">Reparo</span>
            </a>

            {/* Search bar — hidden on mobile (shown below) */}
            <div style={{ flex: 1, display: 'flex', maxWidth: 640 }} className="hide-mobile">
              <div id="city-dropdown-wrapper" style={{ position: 'relative' }}>
                <div onClick={() => setCityDropdown(o => !o)}
                  style={{ padding: '0 10px', background: '#fff', fontSize: 12, color: '#444', display: 'flex', alignItems: 'center', gap: 4, borderRadius: '9px 0 0 9px', borderRight: '1px solid #e5e5e5', minWidth: 110, height: 40, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  📍 {city.length > 12 ? city.substring(0, 12) + '...' : city}
                  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ marginLeft: 'auto', transform: cityDropdown ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                    <path d="M1 1L4 4L7 1" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                {cityDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', borderRadius: '0 0 12px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 200, minWidth: 190, maxHeight: 260, overflowY: 'auto', border: '0.5px solid #e5e5e5' }}>
                    {CITIES.map(c => (
                      <div key={c} onClick={() => { setCity(c); setCityDropdown(false) }}
                        style={{ padding: '9px 14px', fontSize: 13, color: c === city ? '#4A90D9' : '#333', cursor: 'pointer', fontWeight: c === city ? 600 : 400, background: c === city ? '#E6F0FB' : 'transparent', borderBottom: '0.5px solid #f5f5f5' }}
                        onMouseEnter={e => { if (c !== city) e.currentTarget.style.background = '#f8f8f8' }}
                        onMouseLeave={e => { if (c !== city) e.currentTarget.style.background = 'transparent' }}>
                        {c === 'Toate orașele' ? '🇷🇴 Toate orașele' : `📍 ${c}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Caută service, piesă, lucrare auto..."
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery) window.location.href = `/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}` }}
                style={{ flex: 1, padding: '0 12px', border: 'none', fontSize: 13, color: '#1a1a1a', outline: 'none', background: '#fff', height: 40, minWidth: 0 }}/>
              <button onClick={() => window.location.href = `/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`}
                style={{ padding: '0 16px', background: '#4A90D9', border: 'none', borderRadius: '0 9px 9px 0', cursor: 'pointer', height: 40, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#fff" strokeWidth="1.6"/><path d="M10.5 10.5L14 14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Desktop buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 'auto' }} className="hide-mobile">
              {user ? (
                <>
                  <a href="/account" style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>Contul meu</a>
                  <a href="/oferte" style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ofertele mele</a>
                  {profile?.role === 'service' && (
                    <a href="/dashboard/service" style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: '#4A90D9', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>Dashboard</a>
                  )}
                  <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/home' }}
                    style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    Ieși
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth/register" style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Înreg. service</a>
                  <a href="/auth/login" style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: '#4A90D9', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>Intră în cont</a>
                </>
              )}
              <a href="/home" onClick={e => { e.preventDefault(); window.location.href = '/home#cerere' }}
                style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#FF6B35', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                + Cerere ofertă
              </a>
            </div>

            {/* Mobile: Cerere + Hamburger */}
            <div style={{ display: 'none', alignItems: 'center', gap: 8, marginLeft: 'auto' }} className="show-mobile">
              <a href="/home" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#FF6B35', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Cerere ofertă
              </a>
              <button onClick={() => setDrawerOpen(o => !o)}
                style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
                <span style={{ display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2, transition: 'all .3s', transform: drawerOpen ? 'rotate(45deg) translate(3px,3px)' : 'none' }}/>
                <span style={{ display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2, opacity: drawerOpen ? 0 : 1 }}/>
                <span style={{ display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2, transition: 'all .3s', transform: drawerOpen ? 'rotate(-45deg) translate(3px,-3px)' : 'none' }}/>
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="show-mobile" style={{ padding: '0 12px 10px', display: 'none' }}>
            <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden' }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Caută service, piesă..."
                onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/search?q=${encodeURIComponent(searchQuery)}` }}
                style={{ flex: 1, padding: '10px 12px', border: 'none', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}/>
              <button onClick={() => window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`}
                style={{ padding: '0 14px', background: '#4A90D9', border: 'none', cursor: 'pointer' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.5"/><path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="nav-scrollbar" style={{ display: 'flex', padding: '0 16px', maxWidth: 1280, margin: '0 auto', overflowX: 'auto' }}>
            {NAV_TABS.map(t => (
              <a key={t.label} href={t.href}
                style={{ padding: '8px 14px', fontSize: 13, color: pathname === t.href || pathname?.startsWith(t.href.split('?')[0]) && t.href !== '/home' ? '#fff' : 'rgba(255,255,255,0.6)', background: 'none', border: 'none', borderBottom: pathname === t.href ? '2px solid #4A90D9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: pathname === t.href ? 600 : 400, fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block', flexShrink: 0 }}>
                {t.label}
              </a>
            ))}
          </div>

          {/* Mobile drawer */}
          {drawerOpen && (
            <div style={{ background: '#1a2332', borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
              {NAV_TABS.map(t => (
                <a key={t.label} href={t.href} onClick={() => setDrawerOpen(false)}
                  style={{ display: 'block', padding: '12px 20px', fontSize: 15, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderLeft: pathname?.startsWith(t.href.split('?')[0]) ? '3px solid #4A90D9' : '3px solid transparent' }}>
                  {t.label}
                </a>
              ))}
              <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', margin: '8px 0 4px' }}/>
              {user ? (
                <>
                  <a href="/account" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '12px 20px', fontSize: 15, color: '#4A90D9', textDecoration: 'none', fontWeight: 600 }}>Contul meu</a>
                  <a href="/oferte" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '12px 20px', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Ofertele mele</a>
                  {profile?.role === 'service' && <a href="/dashboard/service" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '12px 20px', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Dashboard service</a>}
                  <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/home' }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px', fontSize: 15, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Ieși din cont
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth/register" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '12px 20px', fontSize: 15, color: '#4A90D9', textDecoration: 'none', fontWeight: 600 }}>Înregistrează service-ul</a>
                  <a href="/auth/login" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '12px 20px', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Intră în cont</a>
                </>
              )}
            </div>
          )}
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1 }}>
          {children}
        </div>

        {/* Mobile bottom nav */}
        <div className="show-mobile" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid #e5e5e5', zIndex: 99, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { href: '/home', icon: '🏠', label: 'Acasă' },
              { href: '/search', icon: '🔍', label: 'Caută' },
              { href: '/listing', icon: '📦', label: 'Piese' },
              { href: '/itp-rca', icon: '🛡️', label: 'ITP & RCA' },
              { href: user ? '/account' : '/auth/login', icon: '👤', label: user ? 'Contul meu' : 'Cont' },
            ].map(item => (
              <a key={item.href} href={item.href}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 6px', textDecoration: 'none', flex: 1, color: pathname === item.href ? '#4A90D9' : '#888' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
