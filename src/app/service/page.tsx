// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',amber:'#d97706',amberBg:'#fef3c7',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const btn = (v='primary') => ({display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 20px',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",textDecoration:'none',border:'none',transition:'all .15s',
  ...(v==='primary'?{background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}
    :v==='yellow'?{background:S.yellow,color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}
    :v==='green'?{background:S.green,color:'#fff'}
    :{background:S.white,color:S.navy,border:`1.5px solid ${S.border}`})
})

export default function ServicePage({ params }: { params: { id: string } }) {
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [offerings, setOfferings] = useState([])
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('despre')
  const [modalOpen, setModalOpen] = useState(false)
  const [appointDate, setAppointDate] = useState('')
  const [appointTime, setAppointTime] = useState('09:00-12:00')
  const [appointNote, setAppointNote] = useState('')
  const [bookingDone, setBookingDone] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: svc }, { data: revs }, { data: offs }, { data: med }, { data: { user } }] = await Promise.all([
        supabase.from('services').select('*').eq('id', params.id).single(),
        supabase.from('reviews').select('*').eq('service_id', params.id).eq('is_visible', true).order('created_at', { ascending: false }),
        supabase.from('service_offerings').select('*').eq('service_id', params.id).eq('is_active', true),
        supabase.from('service_media').select('*').eq('service_id', params.id).order('sort_order'),
        supabase.auth.getUser(),
      ])
      setService(svc); setReviews(revs||[]); setOfferings(offs||[]); setMedia(med||[]); setUser(user)
      if (user) {
        const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('service_id', params.id).eq('type', 'service').maybeSingle()
        setIsFav(!!fav)
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  async function toggleFav() {
    if (!user) { window.location.href = `/auth/login`; return }
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('service_id', params.id).eq('type', 'service')
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, service_id: params.id, type: 'service' })
    }
    setIsFav(!isFav)
  }

  async function makeAppointment() {
    if (!user) { window.location.href = `/auth/login?redirectTo=/service/${params.id}`; return }
    if (!appointDate) return
    await supabase.from('appointments').insert({ user_id: user.id, service_id: params.id, scheduled_date: appointDate, scheduled_time: appointTime, notes: appointNote, status: 'in_asteptare' })
    setBookingDone(true)
  }

  function share(platform) {
    const url = window.location.href
    const text = `${service.name} — service auto în ${service.city}. Vezi pe Reparo:`
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`)
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
    if (platform === 'copy') { navigator.clipboard.writeText(url); alert('Link copiat!') }
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
      <a href="/search" style={{...btn(),textDecoration:'none'}}>Caută alte service-uri</a>
    </div>
  )

  const ratingDist = [5,4,3,2,1].map(r => ({ star:r, count:reviews.filter(rv=>rv.rating===r).length }))
  const coverImg = service.cover_image_url || media[0]?.url
  const galleryImgs = media.filter(m => !m.is_cover).slice(0, 6)

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn{padding:10px 20px;border-radius:50px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap}
        .tab-btn.active{background:${S.blue};color:#fff;box-shadow:0 2px 8px rgba(26,86,219,0.2)}
        .tab-btn:not(.active){background:transparent;color:${S.muted}}
        .tab-btn:not(.active):hover{background:${S.bg};color:${S.navy}}
        .off-card:hover{border-color:${S.blue}!important;box-shadow:0 4px 16px rgba(26,86,219,0.1)!important}
        .rev-card:hover{border-color:${S.border}!important}
        .share-btn:hover{background:${S.bg}!important}
        .fav-btn:hover{transform:scale(1.1)}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        @media(max-width:768px){
          .svc-layout{flex-direction:column!important}
          .svc-sidebar{width:100%!important;position:static!important}
          .svc-cover{height:220px!important}
          .svc-hero-row{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}
          .svc-btns{flex-direction:column!important;width:100%!important}
          .svc-btns a,.svc-btns button{width:100%!important}
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important}
          .info-grid{grid-template-columns:1fr!important}
          .svc-btns a,.svc-btns button{font-size:13px!important;padding:9px 14px!important}
          .tabs-scroll{overflow-x:auto!important;scrollbar-width:none!important}
          .tabs-scroll::-webkit-scrollbar{display:none!important}
        }
      `}</style>

      {/* Cover */}
      <div className="svc-cover" style={{height:300,background:`linear-gradient(135deg,${S.navy},#1a3a6e)`,position:'relative',overflow:'hidden'}}>
        {coverImg && <img src={coverImg} alt={service.name} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.7}}/>}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(10,31,68,0.2),rgba(10,31,68,0.6))'}}/>
        {/* Back button */}
        <button onClick={()=>window.history.back()} style={{position:'absolute',top:16,left:16,width:36,height:36,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',border:'none',borderRadius:'50%',cursor:'pointer',color:'#fff',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        {/* Fav button */}
        <button onClick={toggleFav} className="fav-btn" style={{position:'absolute',top:16,right:16,width:36,height:36,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',transition:'transform .15s'}}>
          {isFav ? '❤️' : '🤍'}
        </button>
        {/* Logo */}
        <div style={{position:'absolute',bottom:-28,left:24,width:72,height:72,background:S.white,borderRadius:16,border:`3px solid ${S.white}`,boxShadow:'0 4px 16px rgba(10,31,68,0.15)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>
          {service.logo_url ? <img src={service.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : '🔧'}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 16px'}}>

        {/* Hero info */}
        <div style={{marginTop:40,marginBottom:20}}>
          <div className="svc-hero-row" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,margin:0}}>{service.name}</h1>
                {service.is_verified && <span style={{background:S.greenBg,color:S.green,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50}}>✓ Verificat</span>}
                {service.has_itp && <span style={{background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50}}>ITP</span>}
                {service.is_authorized_rar && <span style={{background:S.amberBg,color:S.amber,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50}}>RAR</span>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  {[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(service.rating_avg||0)?S.yellow:'#e5e7eb',fontSize:16}}>★</span>)}
                  <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginLeft:4}}>{(service.rating_avg||0).toFixed(1)}</span>
                  <span style={{fontSize:13,color:S.muted}}>({service.rating_count||0} recenzii)</span>
                </div>
                <span style={{fontSize:13,color:S.muted}}>📍 {service.city}{service.county?`, ${service.county}`:''}</span>
                {service.warranty_months>0 && <span style={{fontSize:13,color:S.green}}>🛡️ Garanție {service.warranty_months} luni</span>}
              </div>
            </div>

            {/* Share buttons */}
            <div style={{display:'flex',gap:8}}>
              {[{icon:'💬',label:'WhatsApp',p:'whatsapp'},{icon:'📘',label:'Facebook',p:'facebook'},{icon:'🔗',label:'Copiază',p:'copy'}].map(s=>(
                <button key={s.p} onClick={()=>share(s.p)} className="share-btn"
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'8px 12px',background:S.white,border:`1px solid ${S.border}`,borderRadius:12,cursor:'pointer',fontSize:11,color:S.muted,transition:'all .15s'}}>
                  <span style={{fontSize:18}}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="svc-btns" style={{display:'flex',gap:10,marginTop:16,flexWrap:'wrap'}}>
            <a href={`/home?service=${service.id}`} style={{...btn('yellow'),textDecoration:'none',flex:'1 1 auto'}}>✦ Cere ofertă</a>
            <button onClick={()=>setModalOpen(true)} style={{...btn('primary'),flex:'1 1 auto'}}>📅 Programează</button>
            {service.phone && <a href={`tel:${service.phone}`} style={{...btn('ghost'),textDecoration:'none',flex:'1 1 auto'}}>📞 {service.phone}</a>}
          </div>
        </div>

        <div className="svc-layout" style={{display:'flex',gap:20,alignItems:'flex-start'}}>

          {/* Main content */}
          <div style={{flex:1,minWidth:0}}>

            {/* Tabs */}
            <div className="tabs-scroll" style={{display:'flex',gap:4,background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:20,overflowX:'auto'}}>
              {[['despre','Despre'],['servicii',`Servicii (${offerings.length})`],['recenzii',`Recenzii (${reviews.length})`],['galerie','Galerie']].map(([k,l])=>(
                <button key={k} onClick={()=>setTab(k)} className={`tab-btn${tab===k?' active':''}`}>{l}</button>
              ))}
            </div>

            {/* ── Tab: Despre ── */}
            {tab==='despre'&&(
              <div style={{display:'flex',flexDirection:'column',gap:16,animation:'fadeIn .3s ease'}}>
                {service.description&&(
                  <div style={card()}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:10}}>📝 Despre service</div>
                    <p style={{fontSize:14,color:S.text,lineHeight:1.7,margin:0}}>{service.description}</p>
                  </div>
                )}

                {/* Info grid */}
                <div style={card()} className="info-grid">
                  {[
                    {icon:'📍',label:'Adresă',value:service.address||`${service.city}${service.county?`, ${service.county}`:''}` },
                    {icon:'📞',label:'Telefon',value:service.phone||'—'},
                    {icon:'✉️',label:'Email',value:service.email||'—'},
                    {icon:'🌐',label:'Website',value:service.website||'—'},
                    {icon:'🔧',label:'Tip',value:service.is_multibrand?'Multimarcă':'Specializat'},
                    {icon:'🛡️',label:'Garanție',value:service.warranty_months>0?`${service.warranty_months} luni`:'—'},
                  ].map(({icon,label,value})=>(
                    <div key={label} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                      <div>
                        <div style={{fontSize:11,color:S.muted,marginBottom:2}}>{label}</div>
                        <div style={{fontSize:13,fontWeight:600,color:S.navy,wordBreak:'break-word'}}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Brands */}
                {service.brands_accepted?.length>0&&(
                  <div style={card()}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:10}}>🚗 Mărci acceptate</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {service.brands_accepted.map(b=><span key={b} style={{background:S.bg,color:S.navy,fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:50,border:`1px solid ${S.border}`}}>{b}</span>)}
                    </div>
                  </div>
                )}

                {/* Map */}
                {service.address&&(
                  <div style={card({padding:0,overflow:'hidden'})}>
                    <div style={{padding:'14px 18px',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>🗺️ Locație</div>
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent((service.address||'')+' '+( service.city||''))}&output=embed&z=15`}
                      width="100%" height="220" style={{border:0,display:'block'}} allowFullScreen loading="lazy"/>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Servicii ── */}
            {tab==='servicii'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {offerings.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:48,marginBottom:12}}>🔧</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Niciun serviciu listat</div>
                    <p style={{fontSize:13,color:S.muted}}>Service-ul nu a adăugat încă servicii specifice.</p>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {offerings.map(o=>(
                      <div key={o.id} className="off-card" style={{...card(),transition:'all .15s',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{o.name}</div>
                          <div style={{fontSize:12,color:S.muted,marginBottom:o.description?6:0}}>{o.category}</div>
                          {o.description&&<p style={{fontSize:13,color:S.text,lineHeight:1.5,margin:0}}>{o.description}</p>}
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          {(o.price_from||o.price_to)&&(
                            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:S.navy}}>
                              {o.price_from&&o.price_to ? `${o.price_from}–${o.price_to} RON` : o.price_from ? `de la ${o.price_from} RON` : `până la ${o.price_to} RON`}
                            </div>
                          )}
                          {o.duration_min&&<div style={{fontSize:11,color:S.muted,marginTop:2}}>⏱ ~{o.duration_min} min</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Recenzii ── */}
            {tab==='recenzii'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {/* Rating summary */}
                {reviews.length>0&&(
                  <div style={{...card(),marginBottom:16,display:'flex',gap:24,flexWrap:'wrap'}}>
                    <div style={{textAlign:'center',flexShrink:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:48,color:S.navy,lineHeight:1}}>{(service.rating_avg||0).toFixed(1)}</div>
                      <div style={{display:'flex',gap:2,justifyContent:'center',margin:'4px 0'}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(service.rating_avg||0)?S.yellow:'#e5e7eb',fontSize:18}}>★</span>)}</div>
                      <div style={{fontSize:12,color:S.muted}}>{reviews.length} recenzii</div>
                    </div>
                    <div style={{flex:1,minWidth:140}}>
                      {ratingDist.map(({star,count})=>(
                        <div key={star} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <span style={{fontSize:12,color:S.muted,width:8}}>{star}</span>
                          <span style={{color:S.yellow,fontSize:12}}>★</span>
                          <div style={{flex:1,background:S.bg,borderRadius:50,height:8,overflow:'hidden'}}>
                            <div style={{width:`${reviews.length>0?count/reviews.length*100:0}%`,height:'100%',background:S.yellow,borderRadius:50,transition:'width .4s'}}/>
                          </div>
                          <span style={{fontSize:12,color:S.muted,width:16,textAlign:'right'}}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {reviews.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:48,marginBottom:12}}>⭐</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Nicio recenzie încă</div>
                    <p style={{fontSize:13,color:S.muted}}>Fii primul care lasă o recenzie!</p>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {reviews.map(r=>(
                      <div key={r.id} className="rev-card" style={card()}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:8}}>
                          <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=r.rating?S.yellow:'#e5e7eb',fontSize:16}}>★</span>)}</div>
                          <span style={{fontSize:11,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'})}</span>
                        </div>
                        {r.comment&&<p style={{fontSize:14,color:S.text,lineHeight:1.6,margin:0}}>{r.comment}</p>}
                        {r.reply_text&&(
                          <div style={{marginTop:12,background:S.bg,borderRadius:10,padding:'10px 14px',borderLeft:`3px solid ${S.blue}`}}>
                            <div style={{fontSize:11,fontWeight:700,color:S.blue,marginBottom:4}}>Răspuns service</div>
                            <p style={{fontSize:13,color:S.text,margin:0}}>{r.reply_text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Galerie ── */}
            {tab==='galerie'&&(
              <div style={{animation:'fadeIn .3s ease'}}>
                {media.length===0?(
                  <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:48,marginBottom:12}}>📸</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy}}>Nicio fotografie</div>
                  </div>
                ):(
                  <div className="gallery-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {media.map(m=>(
                      <div key={m.id} onClick={()=>window.open(m.url,'_blank')} style={{aspectRatio:'1',borderRadius:12,overflow:'hidden',cursor:'pointer',background:S.bg}}>
                        <img src={m.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .2s'}}
                          onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                          onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="svc-sidebar" style={{width:300,flexShrink:0,position:'sticky',top:20,display:'flex',flexDirection:'column',gap:14}}>

            {/* Quick contact card */}
            <div style={card()}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>Contact rapid</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href={`/home?service=${service.id}`} style={{...btn('yellow'),width:'100%'}}>✦ Cere ofertă gratuită</a>
                <button onClick={()=>setModalOpen(true)} style={{...btn('primary'),width:'100%'}}>📅 Programează acum</button>
                {service.phone&&<a href={`tel:${service.phone}`} style={{...btn('ghost'),width:'100%',textDecoration:'none'}}>📞 {service.phone}</a>}
                {service.email&&<a href={`mailto:${service.email}`} style={{...btn('ghost'),width:'100%',textDecoration:'none'}}>✉️ Trimite email</a>}
                {service.website&&<a href={service.website} target="_blank" rel="noreferrer" style={{...btn('ghost'),width:'100%',textDecoration:'none'}}>🌐 Website</a>}
              </div>
            </div>

            {/* Stats */}
            <div style={card()}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {icon:'⭐',label:'Rating',value:`${(service.rating_avg||0).toFixed(1)}/5`},
                  {icon:'💬',label:'Recenzii',value:service.rating_count||0},
                  {icon:'📅',label:'Plan',value:service.plan==='premium'?'Premium':'Free'},
                  {icon:'✓',label:'Status',value:service.is_active?'Activ':'Inactiv'},
                ].map(({icon,label,value})=>(
                  <div key={label} style={{background:S.bg,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                    <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{value}</div>
                    <div style={{fontSize:11,color:S.muted}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar services teaser */}
            <div style={card()}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:10}}>🔍 Compară oferte</div>
              <p style={{fontSize:13,color:S.muted,marginBottom:12,lineHeight:1.5}}>Trimite o cerere și primești oferte de la mai multe service-uri din {service.city}.</p>
              <a href="/home" style={{...btn('primary'),width:'100%',textDecoration:'none'}}>Cere oferte →</a>
            </div>
          </div>
        </div>
      </div>

      {/* Programare Modal */}
      {modalOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
          <div style={{...card({padding:28}),maxWidth:440,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            {bookingDone?(
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:64,marginBottom:16}}>✅</div>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:8}}>Programare trimisă!</h2>
                <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Service-ul te va contacta în curând pentru confirmare.</p>
                <button onClick={()=>{setModalOpen(false);setBookingDone(false)}} style={{...btn('primary')}}>Închide</button>
              </div>
            ):(
              <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                  <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,margin:0}}>📅 Programează vizita</h2>
                  <button onClick={()=>setModalOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:S.muted}}>✕</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Data *</label>
                    <input type="date" value={appointDate} onChange={e=>setAppointDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Interval orar</label>
                    <select value={appointTime} onChange={e=>setAppointTime(e.target.value)}
                      style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box',background:'#fff'}}>
                      {['08:00-10:00','09:00-11:00','10:00-12:00','11:00-13:00','12:00-14:00','13:00-15:00','14:00-16:00','15:00-17:00','16:00-18:00'].map(t=>(
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Detalii / Notițe</label>
                    <textarea value={appointNote} onChange={e=>setAppointNote(e.target.value)}
                      placeholder="Ex: Schimb ulei + filtru, Dacia Logan 2018..."
                      rows={3} style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",resize:'vertical',boxSizing:'border-box'}}/>
                  </div>
                  <button onClick={makeAppointment} disabled={!appointDate}
                    style={{...btn(appointDate?'primary':'ghost'),width:'100%',padding:'13px',fontSize:15,opacity:appointDate?1:.6}}>
                    ✅ Confirmă programarea
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
