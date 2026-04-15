// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})

export default function FavoritePage() {
  const [tab, setTab] = useState<'servicii'|'anunturi'>('servicii')
  const [favServices, setFavServices] = useState([])
  const [favListings, setFavListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      const [svcs, listings] = await Promise.all([
        supabase.from('favorites').select('*, services(id,name,city,rating_avg,rating_count,description,is_verified)').eq('user_id', user.id).eq('type','service').order('created_at',{ascending:false}),
        supabase.from('favorites').select('*, listings(id,title,price,city,created_at,listing_media(url,is_cover))').eq('user_id', user.id).eq('type','listing').order('created_at',{ascending:false}),
      ])
      setFavServices(svcs.data?.filter(f=>f.services)||[])
      setFavListings(listings.data?.filter(f=>f.listings)||[])
      setLoading(false)
    }
    load()
  }, [])

  async function removeFav(id, type) {
    await supabase.from('favorites').delete().eq('id', id)
    if (type === 'service') setFavServices(p=>p.filter(f=>f.id!==id))
    else setFavListings(p=>p.filter(f=>f.id!==id))
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:6}}>❤️ Favorite</h1>
        <p style={{color:S.muted,fontSize:14,marginBottom:20}}>Service-uri și anunțuri salvate de tine.</p>

        {/* Tabs */}
        <div style={{display:'flex',background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:24,width:'fit-content',gap:4}}>
          {[['servicii','🔧 Service-uri',favServices.length],['anunturi','📦 Anunțuri',favListings.length]].map(([key,label,count])=>(
            <button key={key} onClick={()=>setTab(key as any)}
              style={{padding:'8px 20px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:tab===key?S.blue:'transparent',color:tab===key?'#fff':S.muted,fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:6}}>
              {label}
              <span style={{background:tab===key?'rgba(255,255,255,0.25)':'#eaf3ff',color:tab===key?'#fff':S.blue,fontSize:11,fontWeight:700,padding:'1px 7px',borderRadius:50}}>{count}</span>
            </button>
          ))}
        </div>

        {/* Service-uri favorite */}
        {tab==='servicii'&&(
          favServices.length===0?(
            <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>🔧</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Niciun service salvat</div>
              <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Apasă ❤️ pe un service pentru a-l salva.</p>
              <a href="/search" style={{display:'inline-flex',padding:'10px 24px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Caută service-uri →</a>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {favServices.map(f=>{
                const s = f.services
                return (
                  <div key={f.id} style={{...card(),display:'flex',alignItems:'flex-start',gap:14}}>
                    <div style={{width:52,height:52,background:'#eaf3ff',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🔧</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{s.name}</div>
                      <div style={{fontSize:12,color:S.muted,marginBottom:6}}>📍 {s.city} · ⭐ {s.rating_avg?.toFixed(1)||'N/A'} ({s.rating_count||0} recenzii)</div>
                      {s.description&&<div style={{fontSize:13,color:S.muted,lineHeight:1.5}}>{s.description.slice(0,100)}{s.description.length>100?'...':''}</div>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
                      <a href={`/service/${s.id}`} style={{padding:'8px 16px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:12,fontWeight:700,fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap'}}>Vezi profil</a>
                      <button onClick={()=>removeFav(f.id,'service')} style={{padding:'7px 12px',border:`1px solid ${S.border}`,borderRadius:50,background:'#fff',color:S.muted,fontSize:12,cursor:'pointer'}}>❌ Elimină</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Anunțuri favorite */}
        {tab==='anunturi'&&(
          favListings.length===0?(
            <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>📦</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Niciun anunț salvat</div>
              <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Apasă ❤️ pe un anunț pentru a-l salva.</p>
              <a href="/listing" style={{display:'inline-flex',padding:'10px 24px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Caută anunțuri →</a>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(260px,100%),1fr))',gap:14}}>
              {favListings.map(f=>{
                const l = f.listings
                const cover = l.listing_media?.find(m=>m.is_cover)?.url||l.listing_media?.[0]?.url
                const daysAgo = Math.floor((new Date().getTime()-new Date(l.created_at).getTime())/(1000*60*60*24))
                return (
                  <div key={f.id} style={{background:S.white,borderRadius:14,border:`1px solid ${S.border}`,overflow:'hidden',position:'relative'}}>
                    <button onClick={()=>removeFav(f.id,'listing')} style={{position:'absolute',top:8,right:8,width:28,height:28,background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>❌</button>
                    <div style={{height:130,background:'#eaf3ff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {cover?<img src={cover} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:40}}>📦</span>}
                    </div>
                    <div style={{padding:'10px 12px 14px'}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:S.navy,marginBottom:4}}>
                        {l.price?`${l.price.toLocaleString('ro-RO')} lei`:'Preț negociabil'}
                      </div>
                      <div style={{fontSize:12,color:S.muted,marginBottom:8,lineHeight:1.4}}>{l.title}</div>
                      <div style={{fontSize:11,color:'#bbb',display:'flex',justifyContent:'space-between',marginBottom:10}}>
                        <span>📍 {l.city||'Locație'}</span>
                        <span>{daysAgo===0?'Azi':daysAgo===1?'Ieri':`${daysAgo}z`}</span>
                      </div>
                      <a href={`/listing/${l.id}`} style={{display:'block',textAlign:'center',padding:'8px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:12,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Vezi anunțul</a>
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
