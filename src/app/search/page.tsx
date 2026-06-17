// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',
  white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',purple:'#7c3aed',purpleBg:'#ede9fe',
}

const PLAN_BOOST = { elite:3, business_elite:3, pro:2, business_pro:2, starter:1, basic:1, business:1, free:0 }

const FILTERS = [
  { key:'all', label:'Toate' },
  { key:'verified', label:'✓ Verificate' },
  { key:'itp', label:'ITP' },
  { key:'multibrand', label:'Multimarcă' },
  { key:'dezmembrari', label:'Dezmembrări' },
  { key:'magazin', label:'Piese noi' },
]

export default function SearchPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const PER_PAGE = 16
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category') || ''
    const verified = params.get('verified')
    if (cat === 'itp') setFilter('itp')
    else if (cat === 'dezmembrari') setFilter('dezmembrari')
    else if (verified === '1') setFilter('verified')
  }, [])

  useEffect(() => { load() }, [search, city, page])

  async function load() {
    setLoading(true)
    let q = supabase.from('services')
      .select('id,name,city,logo_url,cover_image_url,rating_avg,rating_count,is_verified,plan,is_promoted,promoted_until,description,phone,business_type,has_itp,is_multibrand')
      .eq('is_active', true)
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

    if (search) q = q.ilike('name', `%${search}%`)
    if (city) q = q.ilike('city', `%${city}%`)

    const { data } = await q

    const sorted = (data || []).sort((a, b) => {
      const aP = a.is_promoted && (!a.promoted_until || new Date(a.promoted_until) > new Date())
      const bP = b.is_promoted && (!b.promoted_until || new Date(b.promoted_until) > new Date())
      if (aP && !bP) return -1
      if (!aP && bP) return 1
      const aB = PLAN_BOOST[a.plan] || 0
      const bB = PLAN_BOOST[b.plan] || 0
      if (aB !== bB) return bB - aB
      return (b.rating_avg || 0) - (a.rating_avg || 0)
    })

    setServices(sorted)
    setLoading(false)
  }

  const filtered = services.filter(s => {
    if (filter === 'verified') return s.is_verified
    if (filter === 'itp') return s.has_itp
    if (filter === 'multibrand') return s.is_multibrand
    if (filter === 'dezmembrari') return s.business_type === 'dezmembrari'
    if (filter === 'magazin') return s.business_type === 'magazin_piese'
    return true
  })

  function planBadge(svc) {
    const isPromoted = svc.is_promoted && (!svc.promoted_until || new Date(svc.promoted_until) > new Date())
    if (isPromoted) return { label: '⭐ PROMOVAT', bg: S.yellow }
    if (svc.plan === 'elite' || svc.plan === 'business_elite') return { label: '💎 Elite', bg: S.purple }
    if (svc.plan === 'pro' || svc.plan === 'business_pro') return { label: '⭐ Pro', bg: S.yellow }
    return null
  }

  function coverBg(svc) {
    if (svc.plan === 'elite' || svc.plan === 'business_elite') return 'linear-gradient(135deg,#1e1b4b,#4c1d95)'
    if (svc.plan === 'pro' || svc.plan === 'business_pro') return `linear-gradient(135deg,${S.navy},#1a56db)`
    return `linear-gradient(135deg,${S.navy},#1a3a6b)`
  }

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .sc-card{background:#fff;border-radius:12px;border:0.5px solid #e5e7eb;overflow:hidden;cursor:pointer;transition:all .15s;text-decoration:none;display:block;animation:fadeIn .2s ease}
        .sc-card:hover{border-color:#1a56db;transform:translateY(-2px);box-shadow:0 4px 16px rgba(26,86,219,0.08)}
        .sc-card.promoted{border-color:#f59e0b}
        .sc-filter-btn{padding:5px 12px;border-radius:50px;border:0.5px solid #e5e7eb;background:#fff;color:#6b7280;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap}
        .sc-filter-btn:hover{border-color:#1a56db;color:#1a56db}
        .sc-filter-btn.active{background:#eaf3ff;color:#1a56db;border-color:#1a56db;font-weight:600}
        .sc-inp{padding:9px 12px;border:0.5px solid #e5e7eb;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#111827;outline:none;transition:border-color .15s}
        .sc-inp:focus{border-color:#1a56db}
        @media(max-width:900px){.sc-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:560px){.sc-grid{grid-template-columns:1fr!important}.sc-filter-row{overflow-x:auto;padding-bottom:4px}}
      `}</style>

      {/* Search header */}
      <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'16px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:12}}>
            Caută service-uri auto
          </h1>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            <input className="sc-inp" value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}}
              placeholder="🔍 Nume service, lucrare..."
              style={{flex:'2 1 180px'}}/>
            <input className="sc-inp" value={city} onChange={e=>{setCity(e.target.value);setPage(0)}}
              placeholder="📍 Oraș..."
              style={{flex:'1 1 120px'}}/>
            <button onClick={load}
              style={{padding:'9px 18px',background:S.blue,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",flexShrink:0}}>
              Caută
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'16px'}}>

        {/* Filters + count row */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:14,flexWrap:'wrap'}}>
          <span style={{fontSize:12,color:S.muted,flexShrink:0}}>{filtered.length} service-uri găsite</span>
          <div className="sc-filter-row" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {FILTERS.map(f=>(
              <button key={f.key} onClick={()=>setFilter(f.key)}
                className={`sc-filter-btn${filter===f.key?' active':''}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:60}}>
            <div style={{width:32,height:32,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:64,background:S.white,borderRadius:16,border:`1px solid ${S.border}`}}>
            <div style={{fontSize:40,marginBottom:10}}>🔍</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy}}>Niciun service găsit</div>
            <p style={{fontSize:13,color:S.muted,marginTop:6}}>Încearcă alt oraș sau termen de căutare</p>
          </div>
        ) : (
          <>
            {/* Grid 4 coloane */}
            <div className="sc-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {filtered.map(svc => {
                const badge = planBadge(svc)
                const isPromoted = svc.is_promoted && (!svc.promoted_until || new Date(svc.promoted_until) > new Date())
                return (
                  <a key={svc.id} href={`/service/${svc.id}`}
                    className={`sc-card${isPromoted?' promoted':''}`}>

                    {/* Cover */}
                    <div style={{height:80,background:svc.cover_image_url?'#000':coverBg(svc),position:'relative',overflow:'hidden'}}>
                      {svc.cover_image_url && (
                        <img src={svc.cover_image_url} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.75}} alt=""/>
                      )}
                      {!svc.cover_image_url && (
                        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.06}} xmlns="http://www.w3.org/2000/svg">
                          <defs><pattern id={`g-${svc.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
                          <rect width="100%" height="100%" fill={`url(#g-${svc.id})`}/>
                        </svg>
                      )}

                      {/* Plan badge */}
                      {badge && (
                        <div style={{position:'absolute',top:6,left:6,background:badge.bg,color:'#fff',fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,lineHeight:1.4}}>
                          {badge.label}
                        </div>
                      )}

                      {/* Verified badge */}
                      {svc.is_verified && (
                        <div style={{position:'absolute',bottom:5,right:6,fontSize:9,fontWeight:600,color:'#16a34a',background:'rgba(220,252,231,.9)',padding:'2px 5px',borderRadius:4}}>
                          ✓ Verificat
                        </div>
                      )}

                      {/* Logo */}
                      <div style={{position:'absolute',bottom:-12,left:10,width:28,height:28,background:S.white,borderRadius:7,border:`2px solid ${S.white}`,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:'0 1px 4px rgba(0,0,0,.12)'}}>
                        {svc.logo_url
                          ? <img src={svc.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                          : '🔧'}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{padding:'16px 10px 8px'}}>
                      <p style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:12,color:S.navy,margin:'0 0 3px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {svc.name}
                      </p>
                      <p style={{fontSize:11,color:S.muted,margin:'0 0 7px',display:'flex',alignItems:'center',gap:2}}>
                        📍 {svc.city}
                      </p>
                      <div style={{display:'flex',alignItems:'center',gap:2}}>
                        {[1,2,3,4,5].map(s=>(
                          <span key={s} style={{color:s<=Math.round(svc.rating_avg||0)?S.yellow:'#e5e7eb',fontSize:10}}>★</span>
                        ))}
                        <span style={{fontSize:10,color:S.muted,marginLeft:2}}>
                          {svc.rating_avg?(svc.rating_avg).toFixed(1):''} ({svc.rating_count||0})
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{padding:'6px 10px',borderTop:`0.5px solid ${S.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:10,color:S.muted}}>
                        {svc.business_type==='dezmembrari'?'Dezmembrări':svc.business_type==='magazin_piese'?'Piese noi':svc.is_multibrand?'Multimarcă':'Specializat'}
                        {svc.has_itp?' · ITP':''}
                      </span>
                      <span style={{fontSize:10,fontWeight:600,color:
                        (svc.plan==='elite'||svc.plan==='business_elite')?S.purple:
                        (svc.plan==='pro'||svc.plan==='business_pro')?S.yellow:
                        S.muted}}>
                        {svc.plan==='elite'||svc.plan==='business_elite'?'Elite':
                         svc.plan==='pro'||svc.plan==='business_pro'?'Pro':
                         svc.plan==='starter'||svc.plan==='basic'?'Starter':'Free'}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Pagination */}
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>
              {page>0&&(
                <button onClick={()=>setPage(p=>p-1)}
                  style={{padding:'8px 16px',background:S.white,border:`1px solid ${S.border}`,borderRadius:8,cursor:'pointer',fontSize:13}}>
                  ← Anterior
                </button>
              )}
              {services.length===PER_PAGE&&(
                <button onClick={()=>setPage(p=>p+1)}
                  style={{padding:'8px 16px',background:S.blue,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:13}}>
                  Următor →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
