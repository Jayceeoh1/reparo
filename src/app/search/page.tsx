// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',amber:'#d97706',amberBg:'#fef3c7',
}

const pill = (bg,color,text) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const card = (extra={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white}
const btn = (primary=true) => ({display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s',border:primary?'none':`1.5px solid ${S.border}`,background:primary?S.blue:'transparent',color:primary?'#fff':S.muted,boxShadow:primary?'0 2px 8px rgba(26,86,219,0.2)':'none'})

const CATEGORIES = ['Schimb ulei','Frâne','Geometrie','Diagnoză','Vopsitorie','ITP','Climatizare','Suspensie','Motor','Electrică']
const CITIES = ['Toate orașele','Alba Iulia','Arad','Bacău','Baia Mare','Brașov','București','Cluj-Napoca','Constanța','Craiova','Galați','Iași','Oradea','Pitești','Ploiești','Sibiu','Suceava','Târgu Mureș','Timișoara']

function SearchContent() {
  const searchParams = useSearchParams()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q')||'')
  const [city, setCity] = useState('Toate orașele')
  const [sortBy, setSortBy] = useState('rating')
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterITP, setFilterITP] = useState(false)
  const [filterRAR, setFilterRAR] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const supabase = createClient()

  useEffect(() => { loadServices() }, [city, sortBy, filterVerified, filterITP, filterRAR, minRating])

  async function loadServices() {
    setLoading(true)
    let q = supabase.from('services').select('*').eq('is_active', true)
    if (city!=='Toate orașele') q = q.eq('city', city)
    if (filterVerified) q = q.eq('is_verified', true)
    if (filterITP) q = q.eq('has_itp', true)
    if (filterRAR) q = q.eq('is_authorized_rar', true)
    if (minRating>0) q = q.gte('rating_avg', minRating)
    if (sortBy==='rating') q = q.order('rating_avg', {ascending:false})
    else if (sortBy==='reviews') q = q.order('rating_count', {ascending:false})
    const {data} = await q.limit(30)
    let results = data||[]
    if (query) results = results.filter(s=>s.name.toLowerCase().includes(query.toLowerCase())||s.description?.toLowerCase().includes(query.toLowerCase())||s.city?.toLowerCase().includes(query.toLowerCase()))
    setServices(results)
    setLoading(false)
  }

  function handleSearch(e) { e.preventDefault(); loadServices() }
  function reset() { setQuery(''); setCity('Toate orașele'); setFilterVerified(false); setFilterITP(false); setFilterRAR(false); setMinRating(0) }

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.svc-card:hover{border-color:${S.blue}!important;box-shadow:0 4px 20px rgba(26,86,219,0.1)!important}.filter-check:hover{background:#eaf3ff!important}`}</style>

      {/* Search subheader */}
      <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'12px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <form onSubmit={handleSearch} style={{display:'flex',gap:0,maxWidth:600}}>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Caută service, lucrare, specialist auto..."
              style={{...inp,borderRadius:'50px 0 0 50px',borderRight:'none',padding:'10px 18px'}}/>
            <button type="submit" style={{padding:'0 20px',background:S.blue,border:'none',borderRadius:'0 50px 50px 0',cursor:'pointer'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#fff" strokeWidth="1.8"/><path d="M10.5 10.5L14 14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .search-layout{flex-direction:column!important}
          .search-sidebar{width:100%!important;display:flex!important;overflow-x:auto!important;gap:10px!important;padding-bottom:4px!important;scrollbar-width:none!important}
          .search-sidebar::-webkit-scrollbar{display:none}
          .search-sidebar>div{flex-shrink:0!important;min-width:220px!important;margin-bottom:0!important}
        }
      `}</style>
      <div className="search-layout" style={{maxWidth:1100,margin:'0 auto',padding:'16px',display:'flex',gap:16}}>

        {/* Sidebar filtre */}
        <div className="search-sidebar" style={{width:240,flexShrink:0,display:'flex',flexDirection:'column',gap:12}}>

          <style>{`
            @media(max-width:768px){
              .search-sidebar{display:block!important}
              .search-sidebar-inner{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
              .search-sidebar-inner::-webkit-scrollbar{display:none}
              .search-sidebar-inner>div{flex-shrink:0;min-width:200px}
            }
            @media(min-width:769px){
              .search-sidebar-inner{display:block}
              .search-sidebar-inner>div{margin-bottom:12px}
            }
          `}</style>
          <div className="search-sidebar-inner">
          <div style={card({})}>
            <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>Oraș</div>
            <select value={city} onChange={e=>setCity(e.target.value)} style={{...inp,borderRadius:10}}>
              {CITIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={card()}>
            <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>Sortare</div>
            {[['rating','Rating (cel mai bun)'],['reviews','Cele mai multe recenzii'],['name','Nume (A-Z)']].map(([val,label])=>(
              <label key={val} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',cursor:'pointer'}}>
                <input type="radio" name="sort" checked={sortBy===val} onChange={()=>setSortBy(val)} style={{accentColor:S.blue}}/>
                <span style={{fontSize:13,color:sortBy===val?S.navy:S.muted,fontWeight:sortBy===val?600:400}}>{label}</span>
              </label>
            ))}
          </div>

          <div style={card()}>
            <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>Filtre</div>
            {[['Verificat Reparo',filterVerified,setFilterVerified],['ITP pe loc',filterITP,setFilterITP],['Autorizat RAR',filterRAR,setFilterRAR]].map(([label,val,set])=>(
              <label key={label} className="filter-check" style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,cursor:'pointer',marginBottom:4,transition:'background .15s'}}>
                <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} style={{accentColor:S.blue,width:15,height:15}}/>
                <span style={{fontSize:13,color:val?S.navy:S.muted,fontWeight:val?600:400}}>{label}</span>
              </label>
            ))}
            <div style={{marginTop:10}}>
              <div style={{fontSize:12,color:S.muted,marginBottom:6}}>Rating minim: {minRating>0?`${minRating}★`:'Oricare'}</div>
              <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e=>setMinRating(parseFloat(e.target.value))}
                style={{width:'100%',accentColor:S.blue}}/>
            </div>
          </div>

          <div style={card()}>
            <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>Categorii</div>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setQuery(c)}
                style={{display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:10,border:'none',background:'transparent',fontSize:13,color:S.muted,cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif",marginBottom:2}}
                onMouseEnter={e=>{e.currentTarget.style.background='#eaf3ff';e.currentTarget.style.color=S.blue}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=S.muted}}>
                {c}
              </button>
            ))}
          </div>
          </div>{/* end sidebar-inner */}
        </div>

        {/* Rezultate */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{fontSize:14,color:S.muted}}>
              {loading?'Se caută...':<><span style={{fontWeight:700,color:S.navy}}>{services.length}</span> service-uri găsite{query&&<> pentru „<strong style={{color:S.navy}}>{query}</strong>"</>}</>}
            </div>
            <button onClick={reset} style={{fontSize:12,color:S.blue,background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Resetează filtrele</button>
          </div>

          {loading?(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[1,2,3].map(i=><div key={i} style={{...card({height:120}),animation:'pulse 1.5s ease-in-out infinite'}}/>)}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
            </div>
          ):services.length===0?(
            <div style={{...card(),textAlign:'center',padding:'80px 20px'}}>
              <div style={{fontSize:56,marginBottom:14}}>🔍</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Niciun service găsit</div>
              <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Încearcă alte filtre sau un alt oraș.</p>
              <button onClick={reset} style={btn(true)}>Resetează filtrele</button>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {services.map(s=>(
                <a key={s.id} href={`/service/${s.id}`} className="svc-card"
                  style={{...card({padding:14}),display:'flex',gap:12,alignItems:'flex-start',textDecoration:'none',transition:'all .2s',cursor:'pointer',flexWrap:'wrap'}}>
                  <div style={{width:56,height:56,background:'#eaf3ff',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>🔧</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6,flexWrap:'wrap',gap:6}}>
                      <div>
                        <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy}}>{s.name}</span>
                        {s.is_verified&&<span style={{...pill('#eaf3ff',S.blue,''),marginLeft:8}}>✓ Verificat</span>}
                        {s.plan==='pro'&&<span style={{...pill(S.amberBg,S.amber,''),marginLeft:6}}>⭐ Pro</span>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                        {[1,2,3,4,5].map(star=><span key={star} style={{fontSize:14,color:star<=Math.round(s.rating_avg)?S.yellow:'#e5e7eb'}}>★</span>)}
                        <span style={{fontSize:12,color:S.muted,marginLeft:3}}>({s.rating_count})</span>
                      </div>
                    </div>
                    {s.description&&<p style={{fontSize:13,color:S.muted,marginBottom:8,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{s.description}</p>}
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                      {s.has_itp&&<span style={pill('#eaf3ff',S.blue,'')}>ITP pe loc</span>}
                      {s.is_authorized_rar&&<span style={pill('#eaf3ff',S.blue,'')}>Autorizat RAR</span>}
                      {s.warranty_months>0&&<span style={pill(S.greenBg,S.green,'')}>Garanție {s.warranty_months} luni</span>}
                    </div>
                    <div style={{fontSize:12,color:S.blue,fontWeight:500}}>📍 {s.city}{s.address?` · ${s.address}`:''}</div>
                  </div>
                  <div style={{flexShrink:0,marginLeft:'auto'}}>
                    <span style={{display:'inline-flex',padding:'7px 14px',borderRadius:50,background:'#eaf3ff',color:S.blue,fontSize:12,fontWeight:700}}>Vezi profil →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f6ff'}}><div style={{width:36,height:36,border:'3px solid #1a56db',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <SearchContent/>
    </Suspense>
  )
}
