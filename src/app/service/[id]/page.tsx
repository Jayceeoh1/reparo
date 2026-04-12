// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',amber:'#d97706',amberBg:'#fef3c7',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const pill = (bg,color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})

export default function ServiceProfilePage({ params }: { params: { id: string } }) {
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [gallery, setGallery] = useState([])
  const [offerings, setOfferings] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [conversationCreating, setConversationCreating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: svc } = await supabase.from('services').select('*').eq('id', params.id).single()
      setService(svc)
      const { data: revs } = await supabase.from('reviews').select('*, profiles(full_name)').eq('service_id', params.id).order('created_at', { ascending: false })
      setReviews(revs || [])
      const { data: gal } = await supabase.from('service_gallery').select('*').eq('service_id', params.id).order('sort_order')
      setGallery(gal || [])
      const { data: offs } = await supabase.from('service_offerings').select('*').eq('service_id', params.id).eq('is_active', true).order('price_from', {ascending:true})
      setOfferings(offs || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  async function submitReview() {
    if (!user) { window.location.href = '/auth/login'; return }
    setSubmittingReview(true)
    const { data } = await supabase.from('reviews').insert({
      service_id: params.id, user_id: user.id,
      rating: reviewForm.rating, title: reviewForm.title, body: reviewForm.body,
    }).select('*, profiles(full_name)').single()
    if (data) setReviews(prev => [data, ...prev])
    setShowReviewForm(false)
    setReviewForm({ rating: 5, title: '', body: '' })
    setSubmittingReview(false)
  }

  async function startConversation() {
    if (!user) { window.location.href = '/auth/login'; return }
    setConversationCreating(true)
    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('client_id', user.id).eq('service_id', params.id).single()
    if (existing) { window.location.href = '/messages'; return }
    await supabase.from('conversations').insert({
      client_id: user.id, service_id: params.id,
      service_owner_id: service.owner_id,
    })
    setConversationCreating(false)
    window.location.href = '/messages'
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!service) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:12}}>🔍</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:8}}>Service negăsit</div>
        <a href="/search" style={{color:S.blue,textDecoration:'none',fontWeight:600}}>← Înapoi la căutare</a>
      </div>
    </div>
  )

  const DAYS = ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică']

  return (
    <div style={{background:S.bg,minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.inp:focus{border-color:#1a56db!important;outline:none!important}`}</style>

      {/* Cover */}
      <div style={{height:240,background:service.cover_image_url?`url(${service.cover_image_url}) center/cover`:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'rgba(10,31,68,0.4)'}}/>
        <a href="/search" style={{position:'absolute',top:16,left:20,color:'#fff',textDecoration:'none',fontSize:13,fontWeight:600,background:'rgba(255,255,255,0.15)',padding:'6px 14px',borderRadius:50,backdropFilter:'blur(4px)'}}>← Înapoi</a>
      </div>

      <div style={{maxWidth:1000,margin:'-60px auto 0',padding:'0 20px 60px',position:'relative'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start'}}>

          {/* Main col */}
          <div>
            {/* Header card */}
            <div style={card({marginBottom:16})}>
              <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                <div style={{width:72,height:72,background:service.logo_url?'transparent':'#eaf3ff',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0,overflow:'hidden',border:`2px solid ${S.white}`,boxShadow:'0 4px 16px rgba(10,31,68,0.1)'}}>
                  {service.logo_url?<img src={service.logo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'🔧'}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6}}>
                    <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,margin:0}}>{service.name}</h1>
                    {service.is_verified && <span style={pill('#eaf3ff',S.blue)}>✓ Verificat</span>}
                    {service.plan==='pro' && <span style={pill(S.amberBg,S.amber)}>⭐ Pro</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:16,color:s<=Math.round(service.rating_avg||0)?S.yellow:'#ddd'}}>★</span>)}</div>
                    <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>{service.rating_avg||'0'}</span>
                    <span style={{fontSize:13,color:S.muted}}>({service.rating_count||0} recenzii)</span>
                  </div>
                  <div style={{fontSize:13,color:S.muted}}>📍 {service.city}{service.address?` · ${service.address}`:''}</div>
                </div>
              </div>
              {service.description && <p style={{fontSize:14,color:'#374151',lineHeight:1.7,marginTop:16,paddingTop:16,borderTop:`1px solid ${S.border}`}}>{service.description}</p>}
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12}}>
                {service.has_itp && <span style={pill('#eaf3ff',S.blue)}>🛡️ ITP pe loc</span>}
                {service.is_authorized_rar && <span style={pill('#eaf3ff',S.blue)}>✅ Autorizat RAR</span>}
                {service.warranty_months>0 && <span style={pill(S.greenBg,S.green)}>🛡️ Garanție {service.warranty_months} luni</span>}
              </div>
            </div>

            {/* Galerie */}
            {gallery.length>0 && (
              <div style={card({marginBottom:16})}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:14}}>📸 Galerie lucrări</h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {gallery.map(img=>(
                    <div key={img.id} style={{height:120,borderRadius:12,overflow:'hidden',background:'#eaf3ff'}}>
                      <img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servicii oferite */}
            {offerings.length>0 && (
              <div style={card({marginBottom:16})}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:14}}>🔧 Servicii & prețuri</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {offerings.map(o=>(
                    <div key={o.id} style={{background:S.bg,borderRadius:12,padding:'14px 16px',border:`1px solid ${S.border}`}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>{o.name}</div>
                      {o.description&&<div style={{fontSize:12,color:S.muted,marginBottom:6,lineHeight:1.5}}>{o.description}</div>}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        {(o.price_from||o.price_to)&&(
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.blue}}>
                            {o.price_from&&o.price_to ? `${o.price_from} – ${o.price_to} RON` : o.price_from ? `de la ${o.price_from} RON` : `până la ${o.price_to} RON`}
                          </div>
                        )}
                        {o.duration_min&&<div style={{fontSize:11,color:S.muted}}>⏱️ ~{o.duration_min} min</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recenzii */}
            <div style={card()}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,margin:0}}>⭐ Recenzii ({reviews.length})</h2>
                <button onClick={()=>setShowReviewForm(!showReviewForm)}
                  style={{padding:'8px 16px',background:showReviewForm?S.bg:S.blue,color:showReviewForm?S.muted:'#fff',border:`1px solid ${showReviewForm?S.border:'none'}`,borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                  {showReviewForm?'Anulează':'Lasă recenzie'}
                </button>
              </div>

              {showReviewForm && (
                <div style={{background:S.bg,borderRadius:14,padding:16,marginBottom:16}}>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Rating</div>
                    <div style={{display:'flex',gap:4}}>
                      {[1,2,3,4,5].map(s=>(
                        <button key={s} onClick={()=>setReviewForm(p=>({...p,rating:s}))}
                          style={{fontSize:24,background:'none',border:'none',cursor:'pointer',color:s<=reviewForm.rating?S.yellow:'#ddd',transition:'color .15s'}}>★</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Titlu (opțional)</div>
                    <input className="inp" value={reviewForm.title} onChange={e=>setReviewForm(p=>({...p,title:e.target.value}))} placeholder="Rezumă experiența ta"
                      style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Recenzie</div>
                    <textarea className="inp" value={reviewForm.body} onChange={e=>setReviewForm(p=>({...p,body:e.target.value}))} placeholder="Descrie experiența ta cu acest service..." rows={4}
                      style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none',boxSizing:'border-box'}}/>
                  </div>
                  <button onClick={submitReview} disabled={submittingReview||!reviewForm.body}
                    style={{padding:'10px 24px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",opacity:!reviewForm.body?.5:1}}>
                    {submittingReview?'Se trimite...':'Trimite recenzia'}
                  </button>
                </div>
              )}

              {reviews.length===0 ? (
                <div style={{textAlign:'center',padding:'32px 0',color:S.muted,fontSize:14}}>
                  Nicio recenzie încă. Fii primul!
                </div>
              ) : reviews.map(r=>(
                <div key={r.id} style={{padding:'14px 0',borderBottom:`1px solid ${S.border}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <div>
                      <div style={{display:'flex',gap:1,marginBottom:3}}>
                        {[1,2,3,4,5].map(s=><span key={s} style={{fontSize:14,color:s<=r.rating?S.yellow:'#ddd'}}>★</span>)}
                      </div>
                      {r.title && <div style={{fontWeight:700,fontSize:14,color:S.navy,marginBottom:3}}>{r.title}</div>}
                    </div>
                    <div style={{fontSize:11,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO')}</div>
                  </div>
                  <p style={{fontSize:13,color:'#374151',lineHeight:1.6,marginBottom:r.service_reply?8:0}}>{r.body}</p>
                  {r.service_reply && (
                    <div style={{background:'#eaf3ff',borderRadius:10,padding:'10px 12px',borderLeft:`3px solid ${S.blue}`}}>
                      <div style={{fontSize:11,fontWeight:700,color:S.blue,marginBottom:4}}>Răspuns service</div>
                      <p style={{fontSize:13,color:S.navy,margin:0}}>{r.service_reply}</p>
                    </div>
                  )}
                  <div style={{fontSize:12,color:S.muted,marginTop:6}}>— {r.profiles?.full_name||'Utilizator'}{r.is_verified&&' ✓ Verificat'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar actiuni */}
          <div style={{position:'sticky',top:20}}>
            <div style={card({marginBottom:14})}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:16}}>Contactează service-ul</h3>
              <button onClick={()=>window.dispatchEvent(new CustomEvent('open-quote-modal'))}
                style={{width:'100%',padding:'13px',background:S.yellow,color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(245,158,11,0.25)',marginBottom:10}}>
                ✦ Cere ofertă gratuită
              </button>
              <button onClick={startConversation} disabled={conversationCreating}
                style={{width:'100%',padding:'11px',background:'transparent',color:S.blue,border:`1.5px solid ${S.blue}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>
                {conversationCreating?'Se creează..':'💬 Trimite mesaj'}
              </button>
              {service.phone && (
                <a href={`tel:${service.phone}`} style={{display:'block',width:'100%',padding:'11px',background:S.bg,color:S.navy,border:`1px solid ${S.border}`,borderRadius:50,fontSize:14,fontWeight:600,textDecoration:'none',textAlign:'center',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}>
                  📞 {service.phone}
                </a>
              )}
            </div>

            {/* Program */}
            {service.working_hours && (
              <div style={card({marginBottom:14})}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:12}}>🕐 Program</h3>
                {DAYS.map((day,i)=>{
                  const wh = service.working_hours?.[i]
                  return (
                    <div key={day} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<6?`1px solid ${S.border}`:'none',fontSize:13}}>
                      <span style={{color:S.muted}}>{day}</span>
                      <span style={{fontWeight:600,color:wh?.open?S.navy:S.red}}>{wh?.open?`${wh.start} - ${wh.end}`:'Închis'}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Harta */}
            {service.address && (
              <div style={card()}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:12}}>📍 Locație</h3>
                <div style={{borderRadius:12,overflow:'hidden',marginBottom:10}}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((service.address||'')+' '+( service.city||''))}&output=embed&z=15`}
                    width="100%" height="160" style={{border:'none',display:'block'}} loading="lazy"/>
                </div>
                <div style={{fontSize:13,color:S.muted}}>{service.address}, {service.city}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
