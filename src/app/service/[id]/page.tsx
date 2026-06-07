// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  amber:'#d97706',amberBg:'#fef3c7',purple:'#7c3aed',purpleBg:'#ede9fe',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const pill = (bg,color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const btn = (v='primary') => ({display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 18px',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",border:'none',transition:'all .15s',textDecoration:'none',
  ...(v==='primary'?{background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}
    :v==='yellow'?{background:S.yellow,color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}
    :v==='green'?{background:S.green,color:'#fff'}
    :{background:S.white,color:S.navy,border:`1.5px solid ${S.border}`})
})

const DAYS = ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică']

export default function ServiceProfilePage({ params }: { params: { id: string } }) {
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [gallery, setGallery] = useState([])
  const [offerings, setOfferings] = useState([])
  const [dezmParts, setDezmParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('despre')
  const [user, setUser] = useState(null)
  const [isFav, setIsFav] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({rating:5,title:'',body:''})
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [conversationCreating, setConversationCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{data:{user}}, {data:svc}, {data:revs}, {data:gal}, {data:offs}] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('services').select('*').eq('id', params.id).single(),
        supabase.from('reviews').select('*, profiles(full_name)').eq('service_id', params.id).order('created_at',{ascending:false}),
        supabase.from('service_media').select('*').eq('service_id', params.id).order('sort_order'),
        supabase.from('service_offerings').select('*').eq('service_id', params.id).eq('is_active', true),
      ])
      setUser(user); setService(svc); setReviews(revs||[]); setGallery(gal||[]); setOfferings(offs||[])
      if (user) {
        const {data:own} = await supabase.from('services').select('id').eq('id',params.id).eq('owner_id',user.id).maybeSingle()
        setIsOwner(!!own)
        const {data:fav} = await supabase.from('favorites').select('id').eq('user_id',user.id).eq('service_id',params.id).eq('type','service').maybeSingle()
        setIsFav(!!fav)
        setHasReviewed((revs||[]).some(r=>r.user_id===user.id))
      }
      // Load dezmembrari parts if applicable
      if (svc?.business_type==='dezmembrari'||svc?.business_type==='mixt') {
        const {data:cars} = await supabase.from('dezmembrari_cars').select('*, dezmembrari_parts(*)').eq('service_id',params.id).eq('is_active',true)
        setDezmParts(cars||[])
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  async function toggleFav() {
    if (!user) { window.location.href = `/auth/login`; return }
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id',user.id).eq('service_id',params.id).eq('type','service')
    } else {
      await supabase.from('favorites').insert({user_id:user.id, service_id:params.id, type:'service'})
    }
    setIsFav(!isFav)
  }

  async function submitReview() {
    if (!user) { window.location.href='/auth/login'; return }
    if (hasReviewed) { alert('Ai lăsat deja o recenzie.'); return }
    if (!reviewForm.body.trim()) return
    setSubmittingReview(true)
    const {data,error} = await supabase.from('reviews').insert({
      service_id:params.id, user_id:user.id,
      rating:reviewForm.rating, title:reviewForm.title, body:reviewForm.body,
    }).select('*, profiles(full_name)').single()
    if (error) { alert('Eroare: '+error.message); setSubmittingReview(false); return }
    if (data) { setReviews(prev=>[data,...prev]); setHasReviewed(true) }
    setShowReviewForm(false); setReviewForm({rating:5,title:'',body:''}); setSubmittingReview(false)
  }

  async function submitReply(reviewId) {
    if (!replyText.trim()) return
    await supabase.from('reviews').update({service_reply:replyText, replied_at:new Date().toISOString()}).eq('id',reviewId)
    setReviews(prev=>prev.map(r=>r.id===reviewId?{...r,service_reply:replyText}:r))
    setReplyingTo(null); setReplyText('')
  }

  async function startConversation() {
    if (!user) { window.location.href='/auth/login'; return }
    setConversationCreating(true)
    const {data:existing} = await supabase.from('conversations').select('id').eq('client_id',user.id).eq('service_id',params.id).maybeSingle()
    if (existing) { window.location.href='/messages'; return }
    await supabase.from('conversations').insert({client_id:user.id, service_id:params.id, service_owner_id:service.owner_id})
    setConversationCreating(false)
    window.location.href='/messages'
  }

  function share(platform) {
    const url = typeof window!=='undefined'?window.location.href:''
    const text = `${service?.name} — service auto în ${service?.city}. Vezi pe Serviceclub:`
    if (platform==='whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`)
    if (platform==='facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
    if (platform==='copy') { navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!service) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg,flexDirection:'column',gap:12}}>
      <div style={{fontSize:48}}>🔍</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy}}>Service negăsit</div>
      <a href="/search" style={{...btn(),textDecoration:'none'}}>← Caută service-uri</a>
    </div>
  )

  const ratingDist = [5,4,3,2,1].map(r=>({star:r,count:reviews.filter(rv=>rv.rating===r).length}))
  const tabs = [
    {k:'despre',l:'Despre'},
    {k:'servicii',l:`Servicii (${offerings.length})`},
    ...(dezmParts.length>0?[{k:'piese',l:'Piese disponibile'}]:[]),
    {k:'recenzii',l:`Recenzii (${reviews.length})`},
    ...(gallery.length>0?[{k:'galerie',l:'Galerie'}]:[]),
  ]

  return (
    <div style={{background:S.bg,minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .inp:focus{border-color:${S.blue}!important;outline:none!important}
        .svc-tab{padding:9px 18px;border-radius:50px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap}
        .svc-tab.active{background:${S.blue};color:#fff}
        .svc-tab:not(.active){background:transparent;color:${S.muted}}
        .svc-tab:not(.active):hover{background:${S.bg};color:${S.navy}}
        .svc-share-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;background:${S.white};border:1px solid ${S.border};border-radius:12px;cursor:pointer;font-size:11px;color:${S.muted};transition:all .15s}
        .svc-share-btn:hover{background:${S.bg};border-color:${S.blue}}
        .off-item:hover{border-color:${S.blue}!important}
        .fav-btn{transition:transform .15s}
        .fav-btn:hover{transform:scale(1.15)}

        @media(max-width:768px){
          .svc-layout{flex-direction:column!important}
          .svc-sidebar{position:static!important;width:100%!important;top:0!important}
          .svc-cover{height:120px!important}
          .svc-header-row{flex-direction:column!important;gap:10px!important}
          .svc-cta-btns{flex-direction:column!important}
          .svc-cta-btns a,.svc-cta-btns button{width:100%!important}
          .svc-tabs{overflow-x:auto!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
          .svc-tabs::-webkit-scrollbar{display:none!important}
          .svc-share-row{flex-wrap:wrap!important}
          .off-grid{grid-template-columns:1fr!important}
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important}
          .info-grid{grid-template-columns:1fr!important}
          .rating-summary{flex-direction:column!important;gap:12px!important}
          .svc-main-pad{padding:0 12px 40px!important}
          
        }

        @media(max-width:480px){
          .svc-tab{padding:8px 12px!important;font-size:12px!important}
          .svc-share-btn{padding:6px 8px!important;font-size:10px!important}
        }
      `}</style>

      {/* ── COVER ── */}
      <div className="svc-cover" style={{height:service.cover_image_url?280:120,background:service.cover_image_url?'transparent':`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 60%,${S.blue} 100%)`,position:'relative',overflow:'hidden'}}>
        {service.cover_image_url&&<img src={service.cover_image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:.8}}/>}
        {!service.cover_image_url&&(
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.06}} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        )}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(10,31,68,0.05),rgba(10,31,68,0.45))'}}/>
        <div style={{position:'absolute',top:12,left:12,right:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/search" style={{color:'#fff',textDecoration:'none',fontSize:12,fontWeight:600,background:'rgba(255,255,255,0.15)',padding:'6px 14px',borderRadius:50,backdropFilter:'blur(8px)',border:'0.5px solid rgba(255,255,255,0.25)',display:'flex',alignItems:'center',gap:5}}>← Înapoi</a>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {isOwner&&(
              <label style={{color:'#fff',fontSize:12,fontWeight:600,background:'rgba(255,255,255,0.15)',padding:'6px 14px',borderRadius:50,backdropFilter:'blur(8px)',border:'0.5px solid rgba(255,255,255,0.25)',display:'flex',alignItems:'center',gap:5,cursor:'pointer'}}>
                ↑ {service.cover_image_url?'Schimbă cover':'Adaugă cover'}
                <input type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
                  const file=e.target.files?.[0]; if(!file) return
                  const ext=file.name.split('.').pop()
                  const path=`${service.id}/cover-${Date.now()}.${ext}`
                  const {error}=await supabase.storage.from('service-media').upload(path,file,{upsert:true})
                  if(!error){const {data:{publicUrl}}=supabase.storage.from('service-media').getPublicUrl(path);await supabase.from('services').update({cover_image_url:publicUrl}).eq('id',service.id);window.location.reload()}
                }}/>
              </label>
            )}
            <button onClick={toggleFav} style={{width:34,height:34,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',border:'0.5px solid rgba(255,255,255,0.25)',borderRadius:'50%',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {isFav?'❤️':'🤍'}
            </button>
          </div>
        </div>
      </div>

      <div className="svc-main-pad" style={{maxWidth:1060,margin:'0 auto',padding:'0 16px 60px'}}>

        {/* ── HERO CARD ── */}
        <div className="svc-hero-pull" style={{marginTop:-16,marginBottom:16}}>
          <div style={{...card(),padding:20}}>
            {/* Logo + Share row */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
              <div style={{width:60,height:60,background:S.bg,borderRadius:14,border:`3px solid ${S.white}`,boxShadow:'0 2px 12px rgba(10,31,68,0.12)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,marginTop:-42,position:'relative',zIndex:1}}>
                {service.logo_url?<img src={service.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:'🔧'}
              </div>
              <div className="svc-share-row" style={{display:'flex',gap:6,flexShrink:0}}>
                {[{icon:'💬',l:'WhatsApp',p:'whatsapp'},{icon:'📘',l:'Facebook',p:'facebook'},{icon:copied?'✅':'🔗',l:copied?'Copiat!':'Link',p:'copy'}].map(s=>(
                  <button key={s.p} onClick={()=>share(s.p)} className="svc-share-btn">
                    <span style={{fontSize:16}}>{s.icon}</span>{s.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,margin:'0 0 8px'}}>{service.name}</h1>

            {/* Badges */}
            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:10}}>
              {service.is_verified&&<span style={pill(S.greenBg,S.green)}>✓ Verificat</span>}
              {service.plan==='pro'&&<span style={pill(S.amberBg,S.amber)}>⭐ Pro</span>}
              {service.plan==='elite'&&<span style={pill('#1e1b4b','#a5b4fc')}>💎 Elite</span>}
              {service.has_itp&&<span style={pill('#eaf3ff',S.blue)}>ITP</span>}
              {service.is_authorized_rar&&<span style={pill(S.amberBg,S.amber)}>RAR</span>}
              {service.business_type==='dezmembrari'&&<span style={pill(S.purpleBg,S.purple)}>🚗 Dezmembrări</span>}
              {service.business_type==='magazin_piese'&&<span style={pill(S.greenBg,S.green)}>📦 Piese noi</span>}
              {service.is_multibrand&&<span style={pill(S.bg,S.muted)}>Multimarcă</span>}
            </div>

            {/* Rating + city */}
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:3}}>
                {[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(service.rating_avg||0)?S.yellow:'#e5e7eb',fontSize:16}}>★</span>)}
                <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy,marginLeft:4}}>{(service.rating_avg||0).toFixed(1)}</span>
                <span style={{fontSize:12,color:S.muted}}>({service.rating_count||0} recenzii)</span>
              </div>
              <span style={{color:S.border}}>·</span>
              <span style={{fontSize:13,color:S.muted}}>📍 {service.city}{service.county?`, ${service.county}`:''}</span>
              {service.warranty_months>0&&<span style={{fontSize:12,color:S.green}}>🛡️ Garanție {service.warranty_months} luni</span>}
            </div>

            {/* CTA buttons */}
            <div className="svc-cta-btns" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button onClick={()=>window.dispatchEvent(new CustomEvent('open-quote-modal',{detail:{service_id:service.id}}))}
                style={{...btn('yellow'),flex:'1 1 auto'}}>✦ Cere ofertă gratuită</button>
              <button onClick={startConversation} disabled={conversationCreating}
                style={{...btn('primary'),flex:'1 1 auto'}}>{conversationCreating?'Se creează...':'💬 Trimite mesaj'}</button>
              {service.phone&&<a href={`tel:${service.phone}`} style={{...btn('ghost'),flex:'1 1 auto',textDecoration:'none'}}>📞 {service.phone}</a>}
            </div>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="svc-layout" style={{display:'flex',gap:20,alignItems:'flex-start'}}>

          {/* Main */}
          <div style={{flex:1,minWidth:0}}>

            {/* Tabs */}
            <div className="svc-tabs" style={{display:'flex',gap:3,background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:18}}>
              {tabs.map(({k,l})=>(
                <button key={k} onClick={()=>setTab(k)} className={`svc-tab${tab===k?' active':''}`}>{l}</button>
              ))}
            </div>

            {/* ── TAB: Despre ── */}
            {tab==='despre'&&(
              <div style={{display:'flex',flexDirection:'column',gap:14,animation:'fadeIn .3s ease'}}>
                {service.description&&(
                  <div style={card()}>
                    <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:10}}>📝 Despre service</h2>
                    <p style={{fontSize:14,color:S.text,lineHeight:1.7,margin:0}}>{service.description}</p>
                  </div>
                )}
                {/* Info grid - redesigned */}
                <div style={card()}>
                  <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>ℹ️ Informații</h2>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:`1px solid ${S.border}`,borderRadius:12,overflow:'hidden'}}>
                    {[
                      {icon:'📍',l:'Adresă',v:service.address||`${service.city}${service.county?`, ${service.county}`:''}` },
                      {icon:'📞',l:'Telefon',v:service.phone||'—'},
                      {icon:'✉️',l:'Email',v:service.email||'—'},
                      {icon:'🌐',l:'Website',v:service.website||'—'},
                      {icon:'🔧',l:'Tip service',v:service.is_multibrand?'Multimarcă':'Specializat'},
                      {icon:'🛡️',l:'Garanție',v:service.warranty_months>0?`${service.warranty_months} luni`:'—'},
                    ].map(({icon,l,v},i)=>(
                      <div key={l} style={{padding:'12px 16px',borderBottom:i<4?`1px solid ${S.border}`:'none',borderRight:i%2===0?`1px solid ${S.border}`:'none',background:S.white}}>
                        <div style={{fontSize:10,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>{icon} {l}</div>
                        <div style={{fontSize:13,fontWeight:600,color:v==='—'?S.muted:S.navy,wordBreak:'break-word'}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Brands */}
                {service.brands_accepted?.length>0&&(
                  <div style={card()}>
                    <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:10}}>🚗 Mărci acceptate</h2>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {service.brands_accepted.map(b=><span key={b} style={{background:S.bg,color:S.navy,fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:50,border:`1px solid ${S.border}`}}>{b}</span>)}
                    </div>
                  </div>
                )}
                {/* Map */}
                {service.address&&(
                  <div style={card({padding:0,overflow:'hidden'})}>
                    <div style={{padding:'14px 18px',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>📍 Locație</div>
                    <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent((service.address||'')+' '+(service.city||''))}&output=embed&z=15`}
                      width="100%" height="220" style={{border:0,display:'block'}} allowFullScreen loading="lazy"/>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Servicii ── */}
            {tab==='servicii'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {offerings.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:48,marginBottom:12}}>🔧</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy}}>Niciun serviciu listat încă</div>
                  </div>
                ):(
                  <div className="off-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
                    {offerings.map(o=>(
                      <div key={o.id} className="off-item" style={{...card({padding:16}),transition:'border-color .15s'}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:3}}>{o.name}</div>
                        <div style={{fontSize:11,color:S.muted,marginBottom:o.description?6:0}}>{o.category}</div>
                        {o.description&&<p style={{fontSize:12,color:S.text,lineHeight:1.5,margin:'0 0 8px'}}>{o.description}</p>}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'auto'}}>
                          {(o.price_from||o.price_to)&&(
                            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy}}>
                              {o.price_from&&o.price_to?`${o.price_from}–${o.price_to} RON`:o.price_from?`de la ${o.price_from} RON`:`până la ${o.price_to} RON`}
                            </div>
                          )}
                          {o.duration_min&&<div style={{fontSize:11,color:S.muted}}>⏱ {o.duration_min} min</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Piese dezmembrari ── */}
            {tab==='piese'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {dezmParts.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:48,marginBottom:12}}>📦</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy}}>Nicio piesă listată momentan</div>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    {dezmParts.map(car=>{
                      const availParts = car.dezmembrari_parts?.filter(p=>p.is_available)||[]
                      if (!availParts.length) return null
                      return (
                        <div key={car.id} style={card()}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:4}}>
                            🚗 {car.brand} {car.model} {car.year?`(${car.year})`:''}
                          </div>
                          <div style={{fontSize:12,color:S.muted,marginBottom:12}}>
                            {car.fuel_type} {car.engine_cc?`· ${car.engine_cc}cc`:''} {car.km?`· ${car.km.toLocaleString()} km`:''}
                          </div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                            {availParts.map(p=>(
                              <div key={p.id} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:10,padding:'8px 12px',display:'flex',flexDirection:'column',gap:2}}>
                                <div style={{fontSize:13,fontWeight:600,color:S.navy}}>{p.name}</div>
                                <div style={{display:'flex',alignItems:'center',gap:6}}>
                                  {p.price&&<div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.blue}}>{p.price} RON</div>}
                                  <span style={{fontSize:10,background:p.condition==='excelenta'?S.greenBg:p.condition==='buna'?'#eaf3ff':S.amberBg,color:p.condition==='excelenta'?S.green:p.condition==='buna'?S.blue:S.amber,padding:'2px 6px',borderRadius:50,fontWeight:600}}>
                                    {p.condition==='excelenta'?'Excelentă':p.condition==='buna'?'Bună':'Acceptabilă'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={()=>window.dispatchEvent(new CustomEvent('open-quote-modal',{detail:{service_id:service.id}}))}
                            style={{...btn('primary'),marginTop:14,fontSize:12,padding:'8px 16px'}}>
                            Cere ofertă pentru piesă →
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Recenzii ── */}
            {tab==='recenzii'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {/* Rating summary */}
                {reviews.length>0&&(
                  <div style={{...card(),marginBottom:14}}>
                    <div className="rating-summary" style={{display:'flex',gap:20,alignItems:'center'}}>
                      <div style={{textAlign:'center',flexShrink:0}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:52,color:S.navy,lineHeight:1}}>{(service.rating_avg||0).toFixed(1)}</div>
                        <div style={{display:'flex',gap:2,justifyContent:'center',margin:'6px 0'}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(service.rating_avg||0)?S.yellow:'#e5e7eb',fontSize:18}}>★</span>)}</div>
                        <div style={{fontSize:12,color:S.muted}}>{reviews.length} recenzii</div>
                      </div>
                      <div style={{flex:1,minWidth:120}}>
                        {ratingDist.map(({star,count})=>(
                          <div key={star} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                            <span style={{fontSize:12,color:S.muted,width:8}}>{star}</span>
                            <span style={{color:S.yellow,fontSize:12}}>★</span>
                            <div style={{flex:1,background:S.bg,borderRadius:50,height:8,overflow:'hidden'}}>
                              <div style={{width:`${reviews.length>0?count/reviews.length*100:0}%`,height:'100%',background:S.yellow,borderRadius:50,transition:'width .4s'}}/>
                            </div>
                            <span style={{fontSize:11,color:S.muted,width:16,textAlign:'right'}}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Review form trigger */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>Recenzii ({reviews.length})</div>
                  {user&&!isOwner&&!hasReviewed&&(
                    <button onClick={()=>setShowReviewForm(!showReviewForm)}
                      style={{...btn(showReviewForm?'ghost':'primary'),padding:'8px 16px',fontSize:12}}>
                      {showReviewForm?'Anulează':'⭐ Lasă recenzie'}
                    </button>
                  )}
                  {!user&&<a href="/auth/login" style={{...btn('primary'),padding:'8px 16px',fontSize:12,textDecoration:'none'}}>Conectează-te pentru recenzie</a>}
                  {hasReviewed&&<span style={{fontSize:12,color:S.green,fontWeight:600}}>✅ Ai lăsat o recenzie</span>}
                </div>

                {showReviewForm&&(
                  <div style={{...card({marginBottom:14}),background:'#f8faff',border:`1.5px solid ${S.blue}30`}}>
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:6}}>Rating *</div>
                      <div style={{display:'flex',gap:4}}>
                        {[1,2,3,4,5].map(s=>(
                          <button key={s} onClick={()=>setReviewForm(p=>({...p,rating:s}))}
                            style={{fontSize:26,background:'none',border:'none',cursor:'pointer',color:s<=reviewForm.rating?S.yellow:'#ddd',transition:'color .15s'}}>★</button>
                        ))}
                      </div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Titlu (opțional)</div>
                      <input className="inp" value={reviewForm.title} onChange={e=>setReviewForm(p=>({...p,title:e.target.value}))} placeholder="Rezumă experiența ta"
                        style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                    </div>
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Recenzie *</div>
                      <textarea className="inp" value={reviewForm.body} onChange={e=>setReviewForm(p=>({...p,body:e.target.value}))} rows={4}
                        placeholder="Descrie experiența ta cu acest service..."
                        style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'vertical',boxSizing:'border-box'}}/>
                    </div>
                    <button onClick={submitReview} disabled={submittingReview||!reviewForm.body.trim()}
                      style={{...btn('primary'),opacity:!reviewForm.body.trim()?.5:1}}>
                      {submittingReview?'Se trimite...':'Publică recenzia'}
                    </button>
                  </div>
                )}

                {reviews.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'50px 20px'}}>
                    <div style={{fontSize:40,marginBottom:10}}>⭐</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:4}}>Nicio recenzie încă</div>
                    <p style={{fontSize:13,color:S.muted}}>Fii primul care lasă o recenzie!</p>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:0}}>
                    {reviews.map((r,i)=>(
                      <div key={r.id} style={{...card({borderRadius:0,border:'none',borderBottom:i<reviews.length-1?`1px solid ${S.border}`:'none',boxShadow:'none'}),opacity:r.is_reported?.65:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,flexWrap:'wrap',gap:6}}>
                          <div>
                            <div style={{display:'flex',gap:1,marginBottom:3}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=r.rating?S.yellow:'#ddd',fontSize:15}}>★</span>)}</div>
                            {r.title&&<div style={{fontWeight:700,fontSize:14,color:S.navy}}>{r.title}</div>}
                          </div>
                          <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                            <span style={{fontSize:11,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'short',year:'numeric'})}</span>
                            {isOwner&&!r.service_reply&&(
                              <button onClick={()=>{setReplyingTo(r.id);setReplyText('')}}
                                style={{fontSize:11,padding:'4px 10px',borderRadius:50,border:`1px solid ${S.blue}`,background:'#eaf3ff',color:S.blue,cursor:'pointer',fontWeight:600}}>
                                💬 Răspunde
                              </button>
                            )}
                            {r.is_reported&&<span style={{fontSize:11,color:S.amber,fontWeight:600}}>⚠️ Raportat</span>}
                          </div>
                        </div>
                        {r.body&&<p style={{fontSize:13,color:S.text,lineHeight:1.6,margin:'0 0 6px'}}>{r.body}</p>}
                        <div style={{fontSize:12,color:S.muted}}>— {r.profiles?.full_name||'Utilizator'}</div>
                        {r.service_reply&&(
                          <div style={{marginTop:10,background:'#eaf3ff',borderRadius:10,padding:'10px 14px',borderLeft:`3px solid ${S.blue}`}}>
                            <div style={{fontSize:11,fontWeight:700,color:S.blue,marginBottom:4}}>Răspuns service</div>
                            <p style={{fontSize:13,color:S.navy,margin:0}}>{r.service_reply}</p>
                          </div>
                        )}
                        {replyingTo===r.id&&(
                          <div style={{marginTop:10,background:S.bg,borderRadius:10,padding:12}}>
                            <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} rows={3}
                              placeholder="Răspunsul tău..." className="inp"
                              style={{width:'100%',padding:'8px 12px',border:`1.5px solid ${S.border}`,borderRadius:8,fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none',boxSizing:'border-box',marginBottom:8}}/>
                            <div style={{display:'flex',gap:8}}>
                              <button onClick={()=>submitReply(r.id)} disabled={!replyText.trim()}
                                style={{...btn('primary'),padding:'7px 16px',fontSize:12,opacity:!replyText.trim()?.5:1}}>Publică</button>
                              <button onClick={()=>setReplyingTo(null)}
                                style={{...btn('ghost'),padding:'7px 12px',fontSize:12}}>Anulează</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Galerie ── */}
            {tab==='galerie'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {gallery.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:48,marginBottom:12}}>📸</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy}}>Nicio fotografie</div>
                  </div>
                ):(
                  <div className="gallery-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {gallery.map(img=>(
                      <div key={img.id} onClick={()=>window.open(img.url,'_blank')}
                        style={{aspectRatio:'1',borderRadius:12,overflow:'hidden',cursor:'pointer',background:S.bg}}>
                        <img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .2s'}}
                          onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                          onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="svc-sidebar" style={{width:290,flexShrink:0,position:'sticky',top:20,display:'flex',flexDirection:'column',gap:14}}>

            {/* Contact rapid */}
            <div style={card()}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>Contact rapid</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <button onClick={()=>window.dispatchEvent(new CustomEvent('open-quote-modal',{detail:{service_id:service.id}}))}
                  style={{...btn('yellow'),width:'100%'}}>✦ Cere ofertă gratuită</button>
                <button onClick={startConversation} disabled={conversationCreating}
                  style={{...btn('primary'),width:'100%'}}>{conversationCreating?'Se creează...':'💬 Trimite mesaj'}</button>
                {service.phone&&<a href={`tel:${service.phone}`} style={{...btn('ghost'),width:'100%',textDecoration:'none'}}>📞 {service.phone}</a>}
                {service.email&&<a href={`mailto:${service.email}`} style={{...btn('ghost'),width:'100%',textDecoration:'none'}}>✉️ Email</a>}
                {service.website&&<a href={service.website} target="_blank" rel="noreferrer" style={{...btn('ghost'),width:'100%',textDecoration:'none'}}>🌐 Website</a>}
              </div>
            </div>

            {/* Program */}
            {service.working_hours&&(
              <div style={card()}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:12}}>🕐 Program</div>
                {DAYS.map((day,i)=>{
                  const wh = service.working_hours?.[i]
                  return (
                    <div key={day} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<6?`1px solid ${S.border}`:'none',fontSize:12}}>
                      <span style={{color:S.muted}}>{day}</span>
                      <span style={{fontWeight:600,color:wh?.open?S.navy:S.red}}>{wh?.open?`${wh.start}–${wh.end}`:'Închis'}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Stats */}
            <div style={card()}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {icon:'⭐',l:'Rating',v:`${(service.rating_avg||0).toFixed(1)}/5`,c:S.yellow},
                  {icon:'💬',l:'Recenzii',v:service.rating_count||0,c:S.blue},
                  {icon:'📅',l:'Plan',v:service.plan==='pro'?'Pro':'Free',c:service.plan==='pro'?S.amber:S.muted},
                  {icon:'✓',l:'Status',v:service.is_active?'Activ':'Inactiv',c:service.is_active?S.green:S.red},
                ].map(({icon,l,v,c})=>(
                  <div key={l} style={{background:S.bg,borderRadius:10,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:16,marginBottom:4}}>{icon}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:S.muted}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hartă */}
            {service.address&&(
              <div style={card({padding:0,overflow:'hidden'})}>
                <div style={{padding:'12px 16px',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>📍 Locație</div>
                <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent((service.address||'')+' '+(service.city||''))}&output=embed&z=15`}
                  width="100%" height="160" style={{border:0,display:'block'}} loading="lazy"/>
                <div style={{padding:'8px 16px',fontSize:12,color:S.muted}}>{service.address}, {service.city}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
