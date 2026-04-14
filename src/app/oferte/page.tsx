// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  amber:'#d97706',amberBg:'#fef3c7',
}

const pill = (bg, color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const card = (extra={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra})
const btn = (variant='primary') => ({display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s',
  ...(variant==='primary'?{background:S.blue,color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}:
     variant==='yellow'?{background:S.yellow,color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}:
     {background:'transparent',color:S.muted,border:`1.5px solid ${S.border}`})
})

export default function OfertePage() {
  const [requests, setRequests] = useState([])
  const [offers, setOffers] = useState({})
  const [selectedReq, setSelectedReq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: reqs } = await supabase.from('quote_requests').select('*').eq('user_id', user.id).order('created_at', {ascending:false})
      setRequests(reqs||[])

      if (reqs?.length) {
        setSelectedReq(reqs[0].id)
        for (const req of reqs) {
          const { data: offs } = await supabase.from('offers').select('*, services(id,name,city,rating_avg,rating_count,phone)').eq('request_id', req.id).order('price_total', {ascending:true})
          if (offs) setOffers(prev=>({...prev,[req.id]:offs}))
        }
      }
      setLoading(false)
    }
    load()

    const channel = supabase.channel('new-offers')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'offers'},async payload=>{
        const offer = payload.new
        const {data:svc} = await supabase.from('services').select('id,name,city,rating_avg,rating_count,phone').eq('id',offer.service_id).single()
        setOffers(prev=>({...prev,[offer.request_id]:[{...offer,services:svc},...(prev[offer.request_id]||[])]}))
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function acceptOffer(offerId, requestId, serviceId) {
    setAccepting(offerId)
    await supabase.from('offers').update({status:'acceptata'}).eq('id',offerId)
    await supabase.from('offers').update({status:'refuzata'}).eq('request_id',requestId).neq('id',offerId)
    await supabase.from('quote_requests').update({status:'in_progres'}).eq('id',requestId)
    const offer = offers[requestId]?.find(o=>o.id===offerId)
    if (offer) {
      const {data:{user}} = await supabase.auth.getUser()
      await supabase.from('appointments').insert({user_id:user.id,service_id:serviceId,offer_id:offerId,scheduled_date:offer.available_date||new Date().toISOString().split('T')[0],scheduled_time:offer.available_time||'09:00-12:00',status:'confirmata'})
    }
    setRequests(prev=>prev.map(r=>r.id===requestId?{...r,status:'in_progres'}:r))
    setOffers(prev=>({...prev,[requestId]:(prev[requestId]||[]).map(o=>({...o,status:o.id===offerId?'acceptata':'refuzata'}))}))
    setAccepting(null)
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const currentOffers = selectedReq?(offers[selectedReq]||[]):[]
  const currentReq = requests.find(r=>r.id===selectedReq)

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .req-card:hover{border-color:${S.blue}!important}
        .oferte-layout{display:flex;gap:20px;}
        .oferte-sidebar{width:280px;flex-shrink:0;}
        .oferte-prices{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;}
        .oferte-details{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        @media(max-width:700px){
          .oferte-layout{flex-direction:column!important;gap:0!important;}
          .oferte-sidebar{width:100%!important;margin-bottom:16px!important;}
          .oferte-sidebar-inner{display:flex!important;overflow-x:auto!important;gap:8px!important;padding-bottom:8px!important;}
          .oferte-sidebar-inner > button{min-width:200px!important;flex-shrink:0!important;}
          .oferte-prices{grid-template-columns:repeat(3,1fr)!important;}
          .oferte-details{grid-template-columns:1fr!important;}
        }
        @media(max-width:420px){
          .oferte-prices{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:6}}>Ofertele mele</h1>
        <p style={{color:S.muted,fontSize:13,marginBottom:24}}>Gestionează cererile trimise și ofertele primite de la service-uri.</p>

        {requests.length===0?(
          <div style={{...card(),textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:64,marginBottom:16}}>📭</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:8}}>Nu ai nicio cerere de ofertă</div>
            <p style={{fontSize:14,color:S.muted,marginBottom:24,maxWidth:360,margin:'0 auto 24px'}}>Trimite o cerere și vei primi oferte de la service-urile din zona ta în 24h.</p>
            <a href="/home" style={{...btn('yellow'),textDecoration:'none',display:'inline-flex'}}>✦ Cere ofertă acum →</a>
          </div>
        ):(
          <div className="oferte-layout">

            {/* Cereri sidebar */}
            <div className="oferte-sidebar"><div className="oferte-sidebar-inner" style={{display:'flex',flexDirection:'column'}}>
              <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>Cererile tale</div>
              {requests.map(r=>(
                <button key={r.id} onClick={()=>setSelectedReq(r.id)} className="req-card"
                  style={{...card({padding:14,marginBottom:8}),width:'100%',textAlign:'left',cursor:'pointer',border:`1.5px solid ${selectedReq===r.id?S.blue:S.border}`,background:selectedReq===r.id?'#eaf3ff':S.white}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy,marginBottom:3}}>
                    {r.car_brand} {r.car_model} {r.car_year?`(${r.car_year})`:''}
                  </div>
                  <div style={{fontSize:11,color:S.muted,marginBottom:8}}>{r.services?.slice(0,2).join(', ')}{(r.services?.length||0)>2?'...':''}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={pill(r.status==='activa'?'#eaf3ff':r.status==='in_progres'?S.greenBg:S.bg,r.status==='activa'?S.blue:r.status==='in_progres'?S.green:S.muted)}>
                      {r.status==='activa'?'Activă':r.status==='in_progres'?'În progres':r.status}
                    </span>
                    <span style={{fontSize:11,color:S.muted}}>{(offers[r.id]||[]).length} oferte</span>
                  </div>
                </button>
              ))}
            </div></div>

            {/* Oferte */}
            <div style={{flex:1,minWidth:0}}>
              {currentReq&&(
                <div style={{...card({marginBottom:14,padding:'14px 18px'}),display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:11,color:S.muted,marginBottom:2}}>Cerere pentru</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{currentReq.car_brand} {currentReq.car_model} · {currentReq.services?.join(', ')}</div>
                  </div>
                  <span style={{fontSize:13,color:S.muted}}>{currentReq.city}</span>
                </div>
              )}

              {currentOffers.length===0?(
                <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                  <div style={{fontSize:48,marginBottom:12}}>⏳</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Așteptăm oferte</div>
                  <p style={{fontSize:13,color:S.muted}}>Service-urile din zona ta vor trimite oferte în curând.</p>
                </div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {currentOffers.map(o=>{
                    const svc = o.services
                    const isAccepted = o.status==='acceptata'
                    const isRefused = o.status==='refuzata'
                    return (
                      <div key={o.id} style={{...card(),border:`1.5px solid ${isAccepted?S.green:isRefused?S.border:S.border}`,opacity:isRefused?.65:1}}>

                        {/* Service info */}
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🔧</div>
                            <div>
                              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:2}}>{svc?.name||'Service auto'}</div>
                              <div style={{fontSize:12,color:S.muted}}>
                                {'⭐'.repeat(Math.round(svc?.rating_avg||0))} ({svc?.rating_count||0} recenzii) · {svc?.city}
                              </div>
                            </div>
                          </div>
                          <span style={pill(isAccepted?S.greenBg:isRefused?S.bg:o.status==='trimisa'?'#eaf3ff':S.bg,isAccepted?S.green:isRefused?S.muted:S.blue)}>
                            {isAccepted?'✅ Acceptată':isRefused?'Refuzată':'🆕 Nouă'}
                          </span>
                        </div>

                        {/* Preturi */}
                        <div className="oferte-prices">
                          {[['Total',o.price_total,true],['Piese',o.price_parts,false],['Manoperă',o.price_labor,false]].map(([l,v,highlight])=>(
                            <div key={l} style={{borderRadius:12,padding:'12px 14px',textAlign:'center',background:highlight?S.navy:S.bg}}>
                              <div style={{fontSize:11,color:highlight?'rgba(255,255,255,0.5)':S.muted,marginBottom:4}}>{l}</div>
                              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:highlight?'#fff':S.navy}}>
                                {v?`${v.toLocaleString()} RON`:'—'}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Detalii */}
                        <div className="oferte-details" style={{marginBottom:14}}>
                          {o.available_date&&(
                            <div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
                              <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Data disponibilă</div>
                              <div style={{fontWeight:600,fontSize:13,color:S.navy}}>📅 {new Date(o.available_date).toLocaleDateString('ro-RO',{day:'numeric',month:'long'})} · {o.available_time}</div>
                            </div>
                          )}
                          {o.warranty_months>0&&(
                            <div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
                              <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Garanție lucrare</div>
                              <div style={{fontWeight:600,fontSize:13,color:S.navy}}>🛡️ {o.warranty_months} luni</div>
                            </div>
                          )}
                        </div>

                        {o.description&&(
                          <div style={{background:S.amberBg,border:`1px solid ${S.amber}30`,borderRadius:10,padding:'10px 14px',marginTop:12,marginBottom:14}}>
                            <div style={{fontSize:10,fontWeight:700,color:S.amber,marginBottom:4}}>DETALII OFERTĂ</div>
                            <p style={{fontSize:13,color:S.amber,lineHeight:1.6}}>{o.description}</p>
                          </div>
                        )}

                        {/* Actiuni */}
                        {o.status==='trimisa'&&(
                          <div style={{display:'flex',gap:10,marginTop:14}}>
                            <button onClick={()=>acceptOffer(o.id,o.request_id,svc?.id)} disabled={accepting===o.id}
                              style={{...btn('yellow'),flex:1,justifyContent:'center',padding:'12px',fontSize:14,opacity:accepting===o.id?.6:1}}>
                              {accepting===o.id?'Se procesează...':'✅ Acceptă oferta & Programează'}
                            </button>
                            {svc?.phone&&(
                              <a href={`tel:${svc.phone}`} style={{...btn('outline'),textDecoration:'none',flexShrink:0}}>📞 Sună</a>
                            )}
                          </div>
                        )}

                        {isAccepted&&(
                          <div style={{background:S.greenBg,border:`1px solid ${S.green}30`,borderRadius:10,padding:'12px 16px',marginTop:14,textAlign:'center'}}>
                            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.green,fontSize:14}}>✅ Ai acceptat această ofertă!</div>
                            <div style={{fontSize:12,color:S.green,opacity:.8,marginTop:3}}>Programarea a fost confirmată. Service-ul te va contacta în curând.</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
