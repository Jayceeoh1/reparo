// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',amber:'#d97706',amberBg:'#fef3c7',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  purple:'#7c3aed',purpleBg:'#ede9fe',
}

const CATEGORIES = ['Toate','Motor & transmisie','Caroserie','Suspensie & direcție','Frâne','Electrică & electronice','Interior','Combustibil & evacuare','Anvelope & jante','Accesorii']
const CONDITIONS = [{k:'',l:'Toate stările'},{k:'noua',l:'🟢 Nouă'},{k:'ca_noua',l:'🔵 Ca nouă'},{k:'buna',l:'🟡 Bună'},{k:'acceptabila',l:'🟠 Acceptabilă'},{k:'second_hand',l:'🔩 Second-hand'}]
const TYPES = [{k:'',l:'Toate tipurile'},{k:'oem',l:'OEM Original'},{k:'aftermarket',l:'Aftermarket'},{k:'second_hand',l:'Second-hand'}]

export default function PiesePage() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [partType, setPartType] = useState('')
  const [city, setCity] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [source, setSource] = useState('') // 'magazin' | 'dezmembrari' | ''
  const [page, setPage] = useState(0)
  const [selectedPart, setSelectedPart] = useState(null)
  const PER_PAGE = 24
  const supabase = createClient()

  useEffect(() => { load() }, [search, category, condition, partType, city, maxPrice, source, page])

  async function load() {
    setLoading(true)

    // Load from service_parts (magazin piese noi)
    let q1 = supabase.from('service_parts')
      .select('*, services(id,name,city,logo_url,phone,rating_avg,business_type)')
      .eq('is_active', true)
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

    if (search) q1 = q1.ilike('name', `%${search}%`)
    if (category && category !== 'Toate') q1 = q1.eq('category', category)
    if (condition) q1 = q1.eq('condition', condition)
    if (partType) q1 = q1.eq('part_type', partType)
    if (maxPrice) q1 = q1.lte('price', parseFloat(maxPrice))

    // Load from dezmembrari_parts (piese SH)
    let q2 = supabase.from('dezmembrari_parts')
      .select('*, dezmembrari_cars(brand,model,year,fuel_type), services(id,name,city,logo_url,phone,rating_avg,business_type)')
      .eq('is_available', true)
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

    if (search) q2 = q2.ilike('name', `%${search}%`)
    if (category && category !== 'Toate') q2 = q2.eq('category', category)
    if (condition) q2 = q2.eq('condition', condition)
    if (maxPrice) q2 = q2.lte('price', parseFloat(maxPrice))

    const results = []

    if (!source || source === 'magazin') {
      const { data } = await q1
      if (data) results.push(...data.map(p => ({ ...p, _source: 'magazin' })))
    }

    if (!source || source === 'dezmembrari') {
      const { data } = await q2
      if (data) results.push(...data.map(p => ({ ...p, _source: 'dezmembrari' })))
    }

    // Filter by city if needed
    const filtered = city
      ? results.filter(p => p.services?.city?.toLowerCase().includes(city.toLowerCase()))
      : results

    // Sort: promoted services first, then by price
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0))

    setParts(filtered)
    setLoading(false)
  }

  const condLabel = (k) => CONDITIONS.find(c => c.k === k)?.l || k

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .part-card{background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;transition:all .15s;cursor:pointer}
        .part-card:hover{box-shadow:0 4px 20px rgba(26,86,219,0.1);border-color:#1a56db;transform:translateY(-2px)}
        .filter-inp:focus{border-color:#1a56db!important;outline:none!important}
        .filter-select:focus{border-color:#1a56db!important;outline:none!important}
        @media(max-width:768px){
          .piese-layout{flex-direction:column!important}
          .piese-sidebar{width:100%!important;position:static!important}
          .piese-grid{grid-template-columns:repeat(2,1fr)!important}
          .hero-search{flex-direction:column!important}
        }
        @media(max-width:480px){
          .piese-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg,${S.navy},#1a3a6b)`, padding: '32px 16px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3vw,32px)', color: '#fff', marginBottom: 6 }}>
            🔩 Piese auto — noi și second-hand
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>
            Caută piese de la magazine și parcuri de dezmembrări verificate
          </p>
          {/* Search bar */}
          <div className="hero-search" style={{ display: 'flex', gap: 10 }}>
            <input className="filter-inp" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="🔍 Caută piesă... ex: alternator, bară față, disc frână"
              style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
            <input className="filter-inp" value={city} onChange={e => { setCity(e.target.value); setPage(0) }}
              placeholder="📍 Oraș"
              style={{ width: 140, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
            <button onClick={load}
              style={{ padding: '12px 24px', background: S.yellow, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
              Caută
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
        <div className="piese-layout" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Sidebar filtre */}
          <div className="piese-sidebar" style={{ width: 240, flexShrink: 0, position: 'sticky', top: 20 }}>
            <div style={{ background: S.white, borderRadius: 14, border: `1px solid ${S.border}`, padding: 16 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: S.navy, marginBottom: 14 }}>🔧 Filtre</div>

              {/* Sursa */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Sursă</div>
                {[{k:'',l:'Toate sursele'},{k:'magazin',l:'📦 Magazin piese noi'},{k:'dezmembrari',l:'🚗 Dezmembrări SH'}].map(s => (
                  <label key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13, color: source === s.k ? S.blue : S.text, fontWeight: source === s.k ? 600 : 400 }}>
                    <input type="radio" name="source" checked={source === s.k} onChange={() => { setSource(s.k); setPage(0) }} style={{ accentColor: S.blue }} />
                    {s.l}
                  </label>
                ))}
              </div>

              {/* Categorie */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Categorie</div>
                <select className="filter-select" value={category} onChange={e => { setCategory(e.target.value); setPage(0) }}
                  style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${S.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: '#fff' }}>
                  {CATEGORIES.map(c => <option key={c} value={c === 'Toate' ? '' : c}>{c}</option>)}
                </select>
              </div>

              {/* Stare */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Stare piesă</div>
                <select className="filter-select" value={condition} onChange={e => { setCondition(e.target.value); setPage(0) }}
                  style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${S.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: '#fff' }}>
                  {CONDITIONS.map(c => <option key={c.k} value={c.k}>{c.l}</option>)}
                </select>
              </div>

              {/* Tip */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Tip piesă</div>
                <select className="filter-select" value={partType} onChange={e => { setPartType(e.target.value); setPage(0) }}
                  style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${S.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: '#fff' }}>
                  {TYPES.map(t => <option key={t.k} value={t.k}>{t.l}</option>)}
                </select>
              </div>

              {/* Pret max */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Preț maxim (RON)</div>
                <input className="filter-inp" type="number" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(0) }}
                  placeholder="Ex: 500"
                  style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${S.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
              </div>

              <button onClick={() => { setSearch(''); setCategory(''); setCondition(''); setPartType(''); setCity(''); setMaxPrice(''); setSource(''); setPage(0) }}
                style={{ width: '100%', padding: '8px', background: S.bg, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 12, color: S.muted, cursor: 'pointer' }}>
                ✕ Resetează filtrele
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, color: S.muted }}>
                {loading ? 'Se încarcă...' : `${parts.length} piese găsite`}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {search && <span style={{ background: '#eaf3ff', color: S.blue, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>🔍 {search}</span>}
                {category && <span style={{ background: '#eaf3ff', color: S.blue, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>{category}</span>}
                {city && <span style={{ background: '#eaf3ff', color: S.blue, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>📍 {city}</span>}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${S.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              </div>
            ) : parts.length === 0 ? (
              <div style={{ background: S.white, borderRadius: 16, border: `1px solid ${S.border}`, textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🔩</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navy, marginBottom: 8 }}>Nicio piesă găsită</div>
                <p style={{ fontSize: 14, color: S.muted, marginBottom: 20 }}>Încearcă alte filtre sau cere o piesă specific.</p>
                <a href="/cereri-piese" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: S.yellow, color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  ⚡ Cere piesa dorită →
                </a>
              </div>
            ) : (
              <>
                <div className="piese-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, animation: 'fadeIn .3s ease' }}>
                  {parts.map((p, i) => {
                    const isSH = p._source === 'dezmembrari'
                    const car = p.dezmembrari_cars
                    return (
                      <div key={`${p._source}-${p.id}`} className="part-card" onClick={() => setSelectedPart(p)}>
                        {/* Image */}
                        <div style={{ height: 130, background: S.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 40 }}>🔩</span>
                          }
                          <div style={{ position: 'absolute', top: 8, left: 8, background: isSH ? S.amberBg : S.greenBg, color: isSH ? S.amber : S.green, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50 }}>
                            {isSH ? '🔩 SH' : '📦 Nou'}
                          </div>
                        </div>
                        {/* Info */}
                        <div style={{ padding: '12px 12px 14px' }}>
                          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: S.navy, marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>{p.category}</div>
                          {car && <div style={{ fontSize: 11, color: S.purple, marginBottom: 4, fontWeight: 600 }}>🚗 {car.brand} {car.model} {car.year ? `(${car.year})` : ''}</div>}
                          {p.brand_compat?.length > 0 && <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>Compat: {p.brand_compat.slice(0, 3).join(', ')}</div>}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: p.price ? S.navy : S.muted }}>
                              {p.price ? `${p.price.toLocaleString()} RON` : 'Negociabil'}
                            </div>
                            <div style={{ fontSize: 10, color: S.muted }}>📍 {p.services?.city || '—'}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                  {page > 0 && <button onClick={() => setPage(p => p - 1)} style={{ padding: '8px 18px', background: S.white, border: `1px solid ${S.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Anterior</button>}
                  {parts.length === PER_PAGE && <button onClick={() => setPage(p => p + 1)} style={{ padding: '8px 18px', background: S.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Următor →</button>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,31,68,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setSelectedPart(null)}>
          <div style={{ background: S.white, borderRadius: 20, padding: 24, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: S.navy, margin: 0 }}>{selectedPart.name}</h2>
              <button onClick={() => setSelectedPart(null)} style={{ background: S.bg, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: S.muted }}>✕</button>
            </div>

            {selectedPart.images?.[0] && (
              <img src={selectedPart.images[0]} alt={selectedPart.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { l: 'Categorie', v: selectedPart.category },
                { l: 'Stare', v: condLabel(selectedPart.condition) },
                { l: 'Tip', v: selectedPart.part_type === 'oem' ? 'OEM Original' : selectedPart.part_type === 'aftermarket' ? 'Aftermarket' : 'Second-hand' },
                { l: 'Cantitate', v: selectedPart.quantity || 1 },
                { l: 'Nr. OEM', v: selectedPart.part_number || '—' },
                { l: 'Stoc', v: selectedPart.quantity > 0 ? '✅ Disponibil' : '❌ Epuizat' },
              ].map(({ l, v }) => (
                <div key={l} style={{ background: S.bg, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: S.muted, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>{v}</div>
                </div>
              ))}
            </div>

            {selectedPart.dezmembrari_cars && (
              <div style={{ background: S.purpleBg, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.purple, marginBottom: 4 }}>DIN MAȘINA</div>
                <div style={{ fontSize: 13, color: S.purple, fontWeight: 600 }}>
                  {selectedPart.dezmembrari_cars.brand} {selectedPart.dezmembrari_cars.model} {selectedPart.dezmembrari_cars.year ? `(${selectedPart.dezmembrari_cars.year})` : ''}
                  {selectedPart.dezmembrari_cars.fuel_type ? ` · ${selectedPart.dezmembrari_cars.fuel_type}` : ''}
                </div>
              </div>
            )}

            {selectedPart.brand_compat?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, marginBottom: 6 }}>MĂRCI COMPATIBILE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedPart.brand_compat.map(b => (
                    <span key={b} style={{ background: S.bg, color: S.navy, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 50, border: `1px solid ${S.border}` }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedPart.description && (
              <p style={{ fontSize: 13, color: S.text, background: S.bg, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>{selectedPart.description}</p>
            )}

            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: S.navy, marginBottom: 16 }}>
              {selectedPart.price ? `${selectedPart.price.toLocaleString()} RON` : 'Preț negociabil'}
            </div>

            {/* Seller info */}
            <div style={{ background: S.bg, borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, marginBottom: 8 }}>VÂNZĂTOR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, background: '#eaf3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden' }}>
                  {selectedPart.services?.logo_url ? <img src={selectedPart.services.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '🏪'}
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: S.navy }}>{selectedPart.services?.name}</div>
                  <div style={{ fontSize: 12, color: S.muted }}>📍 {selectedPart.services?.city} · ⭐ {selectedPart.services?.rating_avg?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedPart.services?.phone && (
                <a href={`tel:${selectedPart.services.phone}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: S.green, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  📞 Sună acum — {selectedPart.services.phone}
                </a>
              )}
              <a href={`/service/${selectedPart.services?.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: S.blue, color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                🏪 Vezi profilul vânzătorului
              </a>
              <a href="/cereri-piese"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: S.white, color: S.navy, border: `1.5px solid ${S.border}`, borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                ⚡ Cere oferte de la mai mulți vânzători
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
