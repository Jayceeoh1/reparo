// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',
  white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',amber:'#d97706',amberBg:'#fef3c7',
}

const PLAN_BOOST = { elite:3, business_elite:3, pro:2, business_pro:2, starter:1, basic:1, business:1, free:0 }

export default function SearchPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 12
  const supabase = createClient()

  useEffect(() => { load() }, [search, city, category, page])

  async function load() {
    setLoading(true)
    let q = supabase.from('services')
      .select('id,name,city,logo_url,cover_image_url,rating_avg,rating_count,is_verified,plan,is_promoted,promoted_until,description,phone,business_type')
      .eq('is_active', true)
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

    if (search) q = q.ilike('name', `%${search}%`)
    if (city) q = q.ilike('city', `%${city}%`)

    const { data } = await q
    
    // Sort by: is_promoted first, then plan boost, then rating
    const sorted = (data || []).sort((a, b) => {
      const aPromoted = a.is_promoted && (!a.promoted_until || new Date(a.promoted_until) > new Date())
      const bPromoted = b.is_promoted && (!b.promoted_until || new Date(b.promoted_until) > new Date())
      if (aPromoted && !bPromoted) return -1
      if (!aPromoted && bPromoted) return 1
      const aBoost = PLAN_BOOST[a.plan] || 0
      const bBoost = PLAN_BOOST[b.plan] || 0
      if (aBoost !== bBoost) return bBoost - aBoost
      return (b.rating_avg || 0) - (a.rating_avg || 0)
    })

    setServices(sorted)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        .svc-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;cursor:pointer;transition:all .15s}
        .svc-card:hover{box-shadow:0 4px 20px rgba(26,86,219,0.1);border-color:#1a56db;transform:translateY(-2px)}
        .search-inp:focus{border-color:#1a56db!important;outline:none!important}
        @media(max-width:768px){.search-row{flex-direction:column!important}.svc-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Header */}
      <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'20px 16px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:14}}>Caută service-uri auto</h1>
          <div className="search-row" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <input className="search-inp" value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}}
              placeholder="🔍 Nume service..."
              style={{flex:'2 1 200px',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>
            <input className="search-inp" value={city} onChange={e=>{setCity(e.target.value);setPage(0)}}
              placeholder="📍 Oraș..."
              style={{flex:'1 1 140px',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>
            <button onClick={load} style={{padding:'11px 20px',background:S.blue,color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif"}}>
              Caută
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'20px 16px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:60}}>
            <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/>
          </div>
        ) : services.length === 0 ? (
          <div style={{textAlign:'center',padding:80,background:S.white,borderRadius:16,border:`1px solid ${S.border}`}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy}}>Niciun service găsit</div>
            <p style={{fontSize:14,color:S.muted,marginTop:8}}>Încearcă alt oraș sau termen de căutare</p>
          </div>
        ) : (
          <>
            <div style={{fontSize:13,color:S.muted,marginBottom:14}}>{services.length} service-uri găsite</div>
            <div className="svc-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
              {services.map(svc => {
                const isPromoted = svc.is_promoted && (!svc.promoted_until || new Date(svc.promoted_until) > new Date())
                const boost = PLAN_BOOST[svc.plan] || 0
                return (
                  <a key={svc.id} href={`/service/${svc.id}`} className="svc-card" style={{textDecoration:'none',border:`1px solid ${isPromoted?S.yellow:boost>1?S.blue:S.border}`}}>
                    {/* Cover */}
                    <div style={{height:140,background:`linear-gradient(135deg,${S.navy},#1a3a6b)`,position:'relative',overflow:'hidden'}}>
                      {svc.cover_image_url&&<img src={svc.cover_image_url} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.7}} alt=""/>}
                      {isPromoted&&<div style={{position:'absolute',top:8,left:8,background:S.yellow,color:'#fff',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:50}}>⭐ PROMOVAT</div>}
                      {boost>=2&&!isPromoted&&<div style={{position:'absolute',top:8,left:8,background:S.blue,color:'#fff',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:50}}>{boost>=3?'💎 ELITE':'⭐ PRO'}</div>}
                      <div style={{position:'absolute',bottom:-16,left:14,width:44,height:44,background:S.white,borderRadius:10,border:`2px solid ${S.white}`,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
                        {svc.logo_url?<img src={svc.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:'🔧'}
                      </div>
                    </div>
                    {/* Info */}
                    <div style={{padding:'22px 14px 14px'}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>{svc.name}</div>
                        {svc.is_verified&&<span style={{fontSize:10,background:S.greenBg,color:S.green,padding:'2px 7px',borderRadius:50,fontWeight:700,flexShrink:0}}>✓ Verificat</span>}
                      </div>
                      <div style={{fontSize:12,color:S.muted,marginBottom:8}}>📍 {svc.city}</div>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        {[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(svc.rating_avg||0)?S.yellow:'#e5e7eb',fontSize:14}}>★</span>)}
                        <span style={{fontSize:12,color:S.muted,marginLeft:4}}>({svc.rating_count||0})</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
            {/* Pagination */}
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:24}}>
              {page>0&&<button onClick={()=>setPage(p=>p-1)} style={{padding:'8px 16px',background:S.white,border:`1px solid ${S.border}`,borderRadius:8,cursor:'pointer'}}>← Anterior</button>}
              {services.length===PER_PAGE&&<button onClick={()=>setPage(p=>p+1)} style={{padding:'8px 16px',background:S.blue,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Următor →</button>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
