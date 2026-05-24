// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const btn = (v='primary') => ({display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'9px 20px',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",textDecoration:'none',border:'none',
  ...(v==='primary'?{background:S.blue,color:'#fff'}:v==='ghost'?{background:'transparent',color:S.muted,border:`1px solid ${S.border}`}:{background:S.white,color:S.red,border:`1px solid ${S.border}`})
})

export default function FavoritePage() {
  const [tab, setTab] = useState('servicii')
  const [favServices, setFavServices] = useState([])
  const [favListings, setFavListings] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      // ── 1. Favorite SERVICE-URI ──────────────────────────────
      const { data: favSvcRows } = await supabase
        .from('favorites')
        .select('id, service_id, created_at')
        .eq('user_id', user.id)
        .eq('type', 'service')
        .not('service_id', 'is', null)
        .order('created_at', { ascending: false })

      if (favSvcRows?.length) {
        const svcIds = favSvcRows.map(f => f.service_id)
        const { data: svcs } = await supabase
          .from('services')
          .select('id, name, city, rating_avg, rating_count, description, is_verified, logo_url')
          .in('id', svcIds)
        const svcMap = {}
        svcs?.forEach(s => { svcMap[s.id] = s })
        setFavServices(favSvcRows.map(f => ({ ...f, service: svcMap[f.service_id] })).filter(f => f.service))
      }

      // ── 2. Favorite ANUNȚURI ────────────────────────────────
      const { data: favListRows } = await supabase
        .from('favorites')
        .select('id, listing_id, created_at')
        .eq('user_id', user.id)
        .eq('type', 'listing')
        .not('listing_id', 'is', null)
        .order('created_at', { ascending: false })

      if (favListRows?.length) {
        const listIds = favListRows.map(f => f.listing_id)
        // Query listings direct — ocolim join-ul cu FK
        const { data: listings, error: listErr } = await supabase
          .from('listings')
          .select('id, title, price, city, created_at, status')
          .in('id', listIds)

        // Query media separat
        const { data: media } = await supabase
          .from('listing_media')
          .select('listing_id, url, is_cover')
          .in('listing_id', listIds)

        const mediaMap = {}
        media?.forEach(m => {
          if (!mediaMap[m.listing_id]) mediaMap[m.listing_id] = []
          mediaMap[m.listing_id].push(m)
        })

        const listMap = {}
        listings?.forEach(l => { listMap[l.id] = { ...l, media: mediaMap[l.id] || [] } })

        // Dacă listings nu le găsim prin RLS, afișăm oricum rândul cu info parțiale
        setFavListings(favListRows.map(f => ({
          ...f,
          listing: listMap[f.listing_id] || { id: f.listing_id, title: 'Anunț indisponibil', price: null, city: null, media: [] }
        })))
      }

      setLoading(false)
    }
    load()
  }, [])

  async function removeFav(favId, type) {
    await supabase.from('favorites').delete().eq('id', favId)
    if (type === 'service') setFavServices(p => p.filter(f => f.id !== favId))
    else setFavListings(p => p.filter(f => f.id !== favId))
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .fav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
        @media(max-width:480px){.fav-grid{grid-template-columns:repeat(2,1fr);gap:10px}}
      `}</style>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>❤️ Favorite</h1>
        <p style={{color:S.muted,fontSize:13,marginBottom:20}}>Service-uri și anunțuri salvate de tine.</p>

        {/* Tabs */}
        <div style={{display:'flex',background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:24,width:'fit-content',gap:4}}>
          {[['servicii','🔧 Service-uri',favServices.length],['anunturi','📦 Anunțuri',favListings.length]].map(([key,label,count])=>(
            <button key={key} onClick={()=>setTab(key)}
              style={{padding:'8px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',
                background:tab===key?S.blue:'transparent',color:tab===key?'#fff':S.muted,
                fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:6,transition:'all .15s'}}>
              {label}
              <span style={{background:tab===key?'rgba(255,255,255,0.25)':'#eaf3ff',color:tab===key?'#fff':S.blue,
                fontSize:11,fontWeight:700,padding:'1px 7px',borderRadius:50,minWidth:18,textAlign:'center'}}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── SERVICE-URI ── */}
        {tab==='servicii'&&(
          favServices.length===0 ? (
            <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>🔧</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Niciun service salvat</div>
              <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Apasă ❤️ pe un service pentru a-l salva.</p>
              <a href="/search" style={{...btn(),display:'inline-flex'}}>Caută service-uri →</a>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {favServices.map(f => {
                const s = f.service
                return (
                  <div key={f.id} style={{...card(),display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:52,height:52,background:'#eaf3ff',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,overflow:'hidden'}}>
                      {s.logo_url ? <img src={s.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : '🔧'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:2}}>{s.name}</div>
                      <div style={{fontSize:12,color:S.muted}}>📍 {s.city} · ⭐ {s.rating_avg?.toFixed(1)||'N/A'} ({s.rating_count||0} recenzii)</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
                      <a href={`/service/${s.id}`} style={{...btn(),padding:'8px 16px',fontSize:12}}>Vezi profil</a>
                      <button onClick={()=>removeFav(f.id,'service')} style={{...btn('remove'),padding:'7px 12px',fontSize:12}}>❌ Elimină</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ── ANUNȚURI ── */}
        {tab==='anunturi'&&(
          favListings.length===0 ? (
            <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>📦</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Niciun anunț salvat</div>
              <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Apasă ❤️ pe un anunț pentru a-l salva.</p>
              <a href="/listing" style={{...btn(),display:'inline-flex'}}>Caută anunțuri →</a>
            </div>
          ) : (
            <div className="fav-grid">
              {favListings.map(f => {
                const l = f.listing
                const cover = l.media?.find(m=>m.is_cover)?.url || l.media?.[0]?.url
                const daysAgo = l.created_at ? Math.floor((Date.now()-new Date(l.created_at).getTime())/(86400000)) : null
                const unavailable = l.title === 'Anunț indisponibil'
                return (
                  <div key={f.id} style={{background:S.white,borderRadius:14,border:`1px solid ${S.border}`,overflow:'hidden',position:'relative',opacity:unavailable?.6:1}}>
                    {/* Buton elimină */}
                    <button onClick={()=>removeFav(f.id,'listing')}
                      style={{position:'absolute',top:8,right:8,width:28,height:28,background:'rgba(255,255,255,0.92)',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,boxShadow:'0 1px 4px rgba(0,0,0,0.15)'}}>
                      ❌
                    </button>
                    {/* Imagine */}
                    <div style={{height:130,background:'#eaf3ff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {cover
                        ? <img src={cover} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <span style={{fontSize:40}}>📦</span>
                      }
                    </div>
                    {/* Info */}
                    <div style={{padding:'10px 12px 14px'}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:S.navy,marginBottom:3}}>
                        {l.price ? `${Number(l.price).toLocaleString('ro-RO')} lei` : 'Preț negociabil'}
                      </div>
                      <div style={{fontSize:12,color:S.muted,marginBottom:6,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                      <div style={{fontSize:11,color:'#bbb',display:'flex',justifyContent:'space-between',marginBottom:10}}>
                        <span>{l.city ? `📍 ${l.city}` : ''}</span>
                        <span>{daysAgo===0?'Azi':daysAgo===1?'Ieri':daysAgo?`${daysAgo}z`:''}</span>
                      </div>
                      {unavailable
                        ? <div style={{textAlign:'center',fontSize:11,color:S.muted,padding:'6px',background:S.bg,borderRadius:8}}>Anunț indisponibil</div>
                        : <a href={`/listing/${l.id}`} style={{...btn(),display:'block',textAlign:'center',padding:'8px',fontSize:12}}>Vezi anunțul</a>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
