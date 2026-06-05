// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f4f6f9',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',yellow:'#f59e0b',
}

const CITIES = ['Toate orașele','București','Cluj-Napoca','Timișoara','Iași','Constanța','Craiova','Brașov','Galați','Ploiești','Oradea','Sibiu','Bacău','Pitești','Arad','Târgu Mureș','Baia Mare','Buzău','Rm. Vâlcea','Drobeta-Turnu Severin']


const CATEGORY_MAP = {
  'schimb-ulei': ['schimb ulei', 'ulei', 'filtre ulei', 'schimb ulei si filtre'],
  'geometrie': ['geometrie', 'echilibrare', 'geometrie roti', 'echilibrare roti', 'unghi'],
  'detailing': ['detailing', 'polish', 'curățare tapițerie', 'curățare tapiterie', 'protecție ceramică', 'protectie ceramica', 'ppf', 'folii geamuri', 'detailing exterior', 'detailing interior', 'polish auto'],
  'diagnoza': ['diagnoză', 'diagnoza', 'diagnosticare', 'probleme bord', 'martori', 'diagnoză electrică', 'diagnoza electrica', 'diagnoza sistem'],
  'vopsitorie': ['vopsitorie', 'caroserie', 'îndreptare caroserie', 'indreptare caroserie', 'reparații daune', 'reparatii daune', 'tinichigerie', 'lacatuserie'],
  'itp': ['itp', 'inspecție', 'inspectie', 'itp autoturisme', 'itp autoutilitare'],
  'dezmembrari': ['dezmembrare', 'dezmembrări', 'piese second', 'dezmembrari'],
  'electrica': ['electric', 'electrică', 'instalație electrică', 'instalatie electrica', 'reparații instalație electrică', 'alternator', 'electromotor', 'codări', 'codari', 'remap', 'actualizări software', 'actualizari software', 'programare chei', 'chei auto'],
  'anvelope': ['anvelope', 'jante', 'montaj anvelope', 'demontaj anvelope', 'schimb anvelope'],
  'tractari': ['tractare', 'tractări', 'asistență rutieră', 'asistenta rutiera', 'pornire baterie', 'depanare'],
  'ac': ['aer condiționat', 'aer conditionat', 'freon', 'încărcare freon', 'incarcare freon', 'ac auto', 'climatizare', 'curățare instalație ac', 'curatare instalatie ac', 'reparații compresor'],
  'frane': ['frân', 'fran', 'aerisire sistem frânare', 'aerisire sistem franare', 'diagnoză sistem frânare', 'recondiționare etrieri', 'reconditionare etrieri', 'placute'],
  'motor': ['motor', 'reparații motor', 'reparatii motor', 'rectificare motor', 'garnitură chiulasă', 'garnitura chiulasa', 'injectoare', 'curățare injectoare', 'sistem alimentare'],
  'cutie-viteze': ['cutie', 'ambreiaj', 'cutie automată', 'cutie manuala', 'cutie automata', 'reparații cutie', 'planetare'],
  'suspensie': ['suspensie', 'direcție', 'directie', 'bielete', 'capete bară', 'capete bara', 'amortizoare'],
}

function SearchContent() {
  const [query, setQuery] = useState('')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  // Filtre
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [city, setCity] = useState('Toate orașele')
  const [sortBy, setSortBy] = useState('rating')
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterITP, setFilterITP] = useState(false)
  const [filterRAR, setFilterRAR] = useState(false)
  const [filterRatingMin, setFilterRatingMin] = useState(0)
  const [activeCategory, setActiveCategory] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}})=>{
      setUser(user)
      if (user) {
        supabase.from('favorites').select('service_id').eq('user_id',user.id).eq('type','service')
          .then(({data})=>setFavorites(new Set((data||[]).map(f=>f.service_id))))
      }
    })
    // Read URL params
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('q')) setQuery(p.get('q'))
      if (p.get('city')) setCity(p.get('city'))
      if (p.get('category')) {
        setActiveCategory(p.get('category'))
      }
    }
    loadServices()
  }, [])

  useEffect(() => { loadServices() }, [city, sortBy, filterVerified, filterITP, filterRAR, filterRatingMin, activeCategory, query])

  async function loadServices() {
    setLoading(true)

    // If filtering by category, get service IDs that have that offering
    let serviceIdsForCategory = null
    if (activeCategory && activeCategory !== '' && activeCategory !== 'toate') {
      const keywords = CATEGORY_MAP[activeCategory] || [activeCategory.toLowerCase()]
      // Get all offerings matching the category keywords
      const { data: offsData } = await supabase
        .from('service_offerings')
        .select('service_id, name, category')
        .eq('is_active', true)
      
      if (offsData?.length) {
        serviceIdsForCategory = new Set(
          offsData
            .filter(o => {
              const name = (o.name || '').toLowerCase()
              // category is null in DB, filter only by name
              return keywords.some(kw => {
                const kwLow = kw.toLowerCase()
                return name.includes(kwLow) || kwLow.includes(name)
              })
            })
            .map(o => o.service_id)
        )
        // Also include services with matching fields (has_itp etc)
        if (activeCategory === 'itp') {
          // will also include has_itp=true services below
        }
      }

      // Fallback: if no offerings found, filter by service fields
      if (!serviceIdsForCategory || serviceIdsForCategory.size === 0) {
        serviceIdsForCategory = null // will use field filters below
      }
    }

    let q = supabase.from('services').select('*').eq('is_active', true)
    if (city && city !== 'Toate orașele') q = q.eq('city', city)
    if (filterVerified) q = q.eq('is_verified', true)
    if (filterRAR) q = q.eq('is_authorized_rar', true)
    if (filterRatingMin > 0) q = q.gte('rating_avg', filterRatingMin)
    // ITP filter — use field OR category
    if (filterITP || activeCategory === 'itp') q = q.eq('has_itp', true)
    if (sortBy === 'rating') q = q.order('rating_avg', {ascending:false})
    else if (sortBy === 'reviews') q = q.order('rating_count', {ascending:false})
    else q = q.order('name', {ascending:true})
    const {data} = await q.limit(200)
    let results = data || []

    // Filter by category offerings
    if (serviceIdsForCategory && serviceIdsForCategory.size > 0) {
      results = results.filter(s => serviceIdsForCategory.has(s.id))
    }

    // Text search
    if (query.trim()) {
      const qLow = query.toLowerCase()
      results = results.filter(s =>
        s.name?.toLowerCase().includes(qLow) ||
        s.description?.toLowerCase().includes(qLow) ||
        s.city?.toLowerCase().includes(qLow)
      )
    }

    setServices(results)
    setLoading(false)
  }

  async function toggleFav(serviceId) {
    if (!user) { window.location.href = '/auth/login'; return }
    const isFav = favorites.has(serviceId)
    setFavorites(prev => { const n=new Set(prev); isFav?n.delete(serviceId):n.add(serviceId); return n })
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id',user.id).eq('service_id',serviceId)
    } else {
      await supabase.from('favorites').upsert({user_id:user.id,service_id:serviceId,type:'service'})
    }
  }

  function handleSearch(e) { e.preventDefault(); loadServices() }
  function resetFilters() { setCity('Toate orașele');setFilterVerified(false);setFilterITP(false);setFilterRAR(false);setFilterRatingMin(0);setSortBy('rating');setActiveCategory('') }
  const activeFilters = [filterVerified&&'Verificat',filterITP&&'ITP',filterRAR&&'RAR',filterRatingMin>0&&`Rating ≥${filterRatingMin}`].filter(Boolean)

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .svc-card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:16px;display:flex;gap:14px;align-items:flex-start;text-decoration:none;color:inherit;transition:box-shadow .15s;cursor:pointer}
        .svc-card:hover{box-shadow:0 4px 16px rgba(26,86,219,0.1);border-color:#1a56db}
        .filter-section{overflow:hidden;transition:max-height .3s ease}
        @media(max-width:768px){.search-layout{flex-direction:column!important}}
      `}</style>

      {/* Search bar sticky */}
      <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'12px 0',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'0 16px',display:'flex',gap:10,alignItems:'center'}}>
          <form onSubmit={handleSearch} style={{display:'flex',flex:1}}>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Caută service, lucrare, specialist auto..."
              style={{flex:1,padding:'11px 18px',border:`1.5px solid ${S.border}`,borderRadius:'50px 0 0 50px',fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
            <button type="submit" style={{padding:'0 20px',background:S.blue,border:'none',borderRadius:'0 50px 50px 0',cursor:'pointer',height:44}}>
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.6"/><path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </form>
          {/* Buton filtre */}
          <button onClick={()=>setFiltersOpen(o=>!o)}
            style={{display:'flex',alignItems:'center',gap:7,padding:'10px 16px',border:`1.5px solid ${filtersOpen||activeFilters.length>0?S.blue:S.border}`,borderRadius:50,background:filtersOpen||activeFilters.length>0?'#eaf3ff':S.white,cursor:'pointer',fontSize:13,fontWeight:600,color:filtersOpen||activeFilters.length>0?S.blue:S.navy,fontFamily:"'DM Sans',sans-serif",flexShrink:0,transition:'all .15s'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 3h14M3 8h10M6 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Filtre
            {activeFilters.length>0&&<span style={{background:S.blue,color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{activeFilters.length}</span>}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{transform:filtersOpen?'rotate(180deg)':'none',transition:'transform .2s'}}><path d="M2 3l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length>0&&(
        <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'8px 0'}}>
          <div style={{maxWidth:960,margin:'0 auto',padding:'0 16px',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:S.muted}}>Filtre active:</span>
            {activeFilters.map(f=>(
              <span key={f} style={{background:'#eaf3ff',color:S.blue,fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:50,display:'inline-flex',alignItems:'center',gap:4}}>
                {f}
              </span>
            ))}
            <button onClick={resetFilters} style={{fontSize:12,color:S.muted,background:'none',border:'none',cursor:'pointer',textDecoration:'underline',marginLeft:4}}>Resetează tot</button>
          </div>
        </div>
      )}

      {/* Filters panel — collapsible */}
      <div style={{maxHeight:filtersOpen?500:0,overflow:'hidden',transition:'max-height .3s ease',background:S.white,borderBottom:filtersOpen?`1px solid ${S.border}`:'none'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'16px 16px 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
            {/* Oras */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Oraș</div>
              <select value={city} onChange={e=>setCity(e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,outline:'none',background:S.white}}>
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Sortare */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Sortare</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {[
                  {value:'rating',label:'Rating (cel mai bun)'},
                  {value:'reviews',label:'Cele mai multe recenzii'},
                  {value:'name',label:'Nume (A-Z)'},
                ].map(opt=>(
                  <label key={opt.value} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:S.text}}>
                    <input type="radio" name="sort" checked={sortBy===opt.value} onChange={()=>setSortBy(opt.value)}
                      style={{accentColor:S.blue,width:16,height:16}}/>
                    <span style={{fontWeight:sortBy===opt.value?700:400}}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtre */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Filtre</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[
                  {val:filterVerified,set:setFilterVerified,label:'✓ Verificat Serviceclub'},
                  {val:filterITP,set:setFilterITP,label:'🔍 ITP pe loc'},
                  {val:filterRAR,set:setFilterRAR,label:'🏢 Autorizat RAR'},
                ].map(f=>(
                  <label key={f.label} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:S.text}}>
                    <input type="checkbox" checked={f.val} onChange={e=>f.set(e.target.checked)}
                      style={{accentColor:S.blue,width:16,height:16}}/>
                    <span style={{fontWeight:f.val?700:400}}>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating minim */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
                Rating minim: {filterRatingMin>0?`${filterRatingMin}★`:'Oricare'}
              </div>
              <input type="range" min={0} max={5} step={0.5} value={filterRatingMin}
                onChange={e=>setFilterRatingMin(parseFloat(e.target.value))}
                style={{width:'100%',accentColor:S.blue}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:S.muted,marginTop:4}}>
                <span>Oricare</span><span>5★</span>
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button onClick={()=>setFiltersOpen(false)}
              style={{padding:'9px 22px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer'}}>
              Aplică ({services.length} rezultate)
            </button>
            {activeFilters.length>0&&<button onClick={resetFilters}
              style={{padding:'9px 18px',background:'transparent',color:S.muted,border:`1.5px solid ${S.border}`,borderRadius:50,fontSize:13,cursor:'pointer'}}>
              Resetează
            </button>}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{maxWidth:960,margin:'0 auto',padding:'16px'}}>
        <div style={{fontSize:14,color:S.muted,marginBottom:14}}>
          {loading?'Se caută...':(
            <>
              <span style={{fontWeight:700,color:S.navy}}>{services.length}</span> service-uri
              {activeCategory&&activeCategory!=='toate'&&<span> cu <strong style={{color:S.blue}}>{activeCategory.replace(/-/g,' ')}</strong></span>}
              {city!=='Toate orașele'&&<span> în <strong>{city}</strong></span>}
              {activeCategory&&<button onClick={()=>setActiveCategory('')} style={{marginLeft:8,fontSize:11,color:S.muted,background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>✕ Resetează categoria</button>}
            </>
          )}
        </div>

        {loading?(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[1,2,3,4].map(i=>(
              <div key={i} style={{background:S.white,borderRadius:12,height:100,border:`1px solid ${S.border}`,animation:'pulse 1.5s infinite'}}/>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
          </div>
        ):services.length===0?(
          <div style={{background:S.white,borderRadius:12,border:`1px solid ${S.border}`,textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Niciun service găsit</div>
            <p style={{fontSize:13,color:S.muted}}>Încearcă alte filtre sau un alt oraș.</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {services.map(svc=>(
              <a key={svc.id} href={`/service/${svc.id}`} className="svc-card">
                {/* Logo */}
                <div style={{width:56,height:56,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,overflow:'hidden'}}>
                  {svc.logo_url?<img src={svc.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:'🔧'}
                </div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:4}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                      {svc.name}
                      {svc.is_verified&&<span style={{fontSize:10,background:S.greenBg,color:S.green,padding:'1px 6px',borderRadius:50,fontWeight:700}}>✓ Verificat</span>}
                      {svc.plan==='pro'&&<span style={{fontSize:10,background:'#ede9fe',color:'#7c3aed',padding:'1px 6px',borderRadius:50,fontWeight:700}}>⭐ Pro</span>}
                    </div>
                    <button onClick={e=>{e.preventDefault();e.stopPropagation();toggleFav(svc.id)}}
                      style={{background:'none',border:'none',cursor:'pointer',fontSize:18,flexShrink:0,padding:0}}>
                      {favorites.has(svc.id)?'❤️':'🤍'}
                    </button>
                  </div>
                  <div style={{fontSize:12,color:S.muted,marginBottom:6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                    {svc.description||'Service auto profesional'}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    {svc.rating_avg>0&&(
                      <span style={{fontSize:12,fontWeight:700,color:S.navy,display:'flex',alignItems:'center',gap:3}}>
                        <span style={{color:S.yellow}}>★</span>{svc.rating_avg.toFixed(1)}
                        <span style={{color:S.muted,fontWeight:400}}>({svc.rating_count})</span>
                      </span>
                    )}
                    <span style={{fontSize:12,color:S.muted}}>📍 {svc.city||'România'}</span>
                    {svc.has_itp&&<span style={{fontSize:10,background:'#f3e8ff',color:'#7c3aed',padding:'1px 6px',borderRadius:50,fontWeight:600}}>ITP</span>}
                    {svc.is_authorized_rar&&<span style={{fontSize:10,background:'#dbeafe',color:'#1d4ed8',padding:'1px 6px',borderRadius:50,fontWeight:600}}>RAR</span>}
                  </div>
                </div>
                {/* CTA */}
                <div style={{flexShrink:0,display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                  <span style={{display:'inline-block',padding:'8px 14px',background:S.blue,color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>
                    Cere ofertă →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense><SearchContent/></Suspense>
}
