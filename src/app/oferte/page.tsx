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

const pill = (bg, color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const card = (extra={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra})
const btn = (variant='primary') => ({display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s',
  ...(variant==='primary'?{background:S.blue,color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}:
     variant==='yellow'?{background:S.yellow,color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}:
     {background:'transparent',color:S.muted,border:`1.5px solid ${S.border}`})
})

function ComparatorView({ offers, onAccept, accepting }) {
  const visible = offers.slice(0, 3)
  if (visible.length < 2) return null
  const best = [...visible].sort((a,b) => (a.price_total||Infinity) - (b.price_total||Infinity))[0]

  const Row = ({ label, children }) => (
    <div style={{display:'grid',gridTemplateColumns:`160px repeat(${visible.length},1fr)`,borderBottom:`1px solid ${S.border}`,minHeight:52}}>
      <div style={{padding:'12px 14px',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,display:'flex',alignItems:'center',background:'#fafbfc',fontFamily:"'Sora',sans-serif"}}>{label}</div>
      {children}
    </div>
  )
  const Cell = ({ children, highlight }) => (
    <div style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',background:highlight?'#f0f7ff':S.white,borderLeft:`1px solid ${S.border}`}}>
      {children}
    </div>
  )

  return (
    <div style={{...card({padding:0,overflow:'hidden',marginBottom:20})}}>
      <div style={{display:'grid',gridTemplateColumns:`160px repeat(${visible.length},1fr)`,background:S.navy}}>
        <div style={{padding:'16px 14px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:1,fontFamily:"'Sora',sans-serif"}}>Comparator</div>
        {visible.map(o => {
          const svc = o.services
          const isBest = o.id === best.id
          return (
            <div key={o.id} style={{padding:'14px 16px',textAlign:'center',borderLeft:`1px solid rgba(255,255,255,0.08)`,position:'relative'}}>
              {isBest && <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',background:S.yellow,color:'#fff',fontSize:9,fontWeight:800,padding:'2px 10px',borderRadius:'0 0 8px 8px',textTransform:'uppercase',letterSpacing:1,fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap'}}>✦ Cel mai bun preț</div>}
              <div style={{width:36,height:36,background:'rgba(255,255,255,0.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,margin:'10px auto 8px',overflow:'hidden'}}>
                {svc?.logo_url?<img src={svc.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:'🔧'}
              </div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:12,color:'#fff',marginBottom:2}}>{svc?.name||'Service'}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>{svc?.city}</div>
            </div>
          )
        })}
      </div>

      <Row label="Preț total">
        {visible.map(o => {
          const isBest = o.id === best.id
          return (
            <Cell key={o.id} highlight={isBest}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:isBest?S.green:S.navy}}>
                {o.price_total ? `${o.price_total.toLocaleString()} RON` : '—'}
              </div>
            </Cell>
          )
        })}
      </Row>
      <Row label="Piese">
        {visible.map(o => <Cell key={o.id}><span style={{fontSize:13,fontWeight:600,color:S.text}}>{o.price_parts ? `${o.price_parts.toLocaleString()} RON` : '—'}</span></Cell>)}
      </Row>
      <Row label="Manoperă">
        {visible.map(o => <Cell key={o.id}><span style={{fontSize:13,fontWeight:600,color:S.text}}>{o.price_labor ? `${o.price_labor.toLocaleString()} RON` : '—'}</span></Cell>)}
      </Row>
      <Row label="Tip piese">
        {visible.map(o => (
          <Cell key={o.id}>
            <span style={pill(
              o.parts_type==='oem'?'#dbeafe':o.parts_type==='aftermarket'?S.amberBg:'#ede9fe',
              o.parts_type==='oem'?S.blue:o.parts_type==='aftermarket'?S.amber:S.purple
            )}>{o.parts_type==='oem'?'OEM':o.parts_type==='aftermarket'?'Aftermarket':'Mixt'}</span>
          </Cell>
        ))}
      </Row>
      <Row label="Garanție">
        {visible.map(o => (
          <Cell key={o.id}>
            {o.warranty_months>0 ? <span style={{fontWeight:600,fontSize:13,color:S.green}}>🛡️ {o.warranty_months} luni</span> : <span style={{color:S.muted,fontSize:13}}>—</span>}
          </Cell>
        ))}
      </Row>
      <Row label="Disponibil">
        {visible.map(o => (
          <Cell key={o.id}>
            {o.available_date ? <span style={{fontSize:12,color:S.text}}>📅 {new Date(o.available_date).toLocaleDateString('ro-RO',{day:'numeric',month:'short'})} · {o.available_time}</span> : <span style={{color:S.muted,fontSize:13}}>—</span>}
          </Cell>
        ))}
      </Row>
      <Row label="Rating">
        {visible.map(o => {
          const svc = o.services
          return (
            <Cell key={o.id}>
              {svc?.rating_count>0
                ? <span style={{fontSize:13,fontWeight:600,color:S.amber}}>{'⭐'.repeat(Math.round(svc.rating_avg||0))} <span style={{color:S.muted,fontWeight:400}}>({svc.rating_count})</span></span>
                : <span style={{color:S.muted,fontSize:12}}>Fără recenzii</span>}
            </Cell>
          )
        })}
      </Row>
      <Row label="Status">
        {visible.map(o => (
          <Cell key={o.id}>
            {o.services?.is_verified
              ? <span style={pill(S.greenBg,S.green)}>✓ Verificat</span>
              : <span style={pill(S.bg,S.muted)}>Neverificat</span>}
          </Cell>
        ))}
      </Row>

      <div style={{display:'grid',gridTemplateColumns:`160px repeat(${visible.length},1fr)`,background:S.bg,borderTop:`1px solid ${S.border}`}}>
        <div style={{padding:'16px 14px'}}/>
        {visible.map(o => (
          <div key={o.id} style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:8,alignItems:'center',borderLeft:`1px solid ${S.border}`}}>
            {o.status==='trimisa' ? (
              <>
                <button onClick={()=>onAccept(o.id,o.request_id,o.services?.id)} disabled={accepting===o.id}
                  style={{...btn('yellow'),width:'100%',justifyContent:'center',opacity:accepting===o.id?.6:1}}>
                  {accepting===o.id?'...' : '✅ Acceptă'}
                </button>
                {o.services?.phone && <a href={`tel:${o.services.phone}`} style={{...btn(),width:'100%',justifyContent:'center',textDecoration:'none',fontSize:12}}>📞 Sună</a>}
              </>
            ) : (
              <span style={pill(o.status==='acceptata'?S.greenBg:S.bg,o.status==='acceptata'?S.green:S.muted)}>
                {o.status==='acceptata'?'✅ Acceptată':'Refuzată'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function OfferCard({ o, onAccept, accepting }) {
  const svc = o.services
  const isAccepted = o.status === 'acceptata'
  const isRefused = o.status === 'refuzata'
  return (
    <div style={{...card(),border:`1.5px solid ${isAccepted?S.green:S.border}`,opacity:isRefused?.65:1}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,overflow:'hidden'}}>
            {svc?.logo_url?<img src={svc.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:'🔧'}
          </div>
          <div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:2,display:'flex',alignItems:'center',gap:6}}>
              {svc?.name||'Service auto'}
              {svc?.is_verified&&<span style={{fontSize:11,background:'#dcfce7',color:'#16a34a',padding:'1px 6px',borderRadius:50,fontWeight:700}}>✓ Verificat</span>}
            </div>
            <div style={{fontSize:12,color:S.muted}}>{'⭐'.repeat(Math.round(svc?.rating_avg||0))} ({svc?.rating_count||0}) · {svc?.city}</div>
          </div>
        </div>
        <span style={pill(isAccepted?S.greenBg:isRefused?S.bg:'#eaf3ff',isAccepted?S.green:isRefused?S.muted:S.blue)}>
          {isAccepted?'✅ Acceptată':isRefused?'Refuzată':'🆕 Nouă'}
        </span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
        {[['Total',o.price_total,true],['Piese',o.price_parts,false],['Manoperă',o.price_labor,false]].map(([l,v,h])=>(
          <div key={l} style={{borderRadius:12,padding:'12px 14px',textAlign:'center',background:h?S.navy:S.bg}}>
            <div style={{fontSize:11,color:h?'rgba(255,255,255,0.5)':S.muted,marginBottom:4}}>{l}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:h?'#fff':S.navy}}>{v?`${v.toLocaleString()} RON`:'—'}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {o.available_date&&<div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}><div style={{fontSize:10,color:S.muted,marginBottom:2}}>Data disponibilă</div><div style={{fontWeight:600,fontSize:13,color:S.navy}}>📅 {new Date(o.available_date).toLocaleDateString('ro-RO',{day:'numeric',month:'long'})} · {o.available_time}</div></div>}
        {o.warranty_months>0&&<div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}><div style={{fontSize:10,color:S.muted,marginBottom:2}}>Garanție</div><div style={{fontWeight:600,fontSize:13,color:S.navy}}>🛡️ {o.warranty_months} luni</div></div>}
        {o.parts_type&&<div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}><div style={{fontSize:10,color:S.muted,marginBottom:2}}>Tip piese</div><div style={{fontWeight:600,fontSize:13,color:S.navy}}>{o.parts_type==='oem'?'🔵 OEM':o.parts_type==='aftermarket'?'🟡 Aftermarket':'🔵+🟡 Mixt'}</div></div>}
      </div>
      {o.description&&<div style={{background:S.amberBg,border:`1px solid ${S.amber}30`,borderRadius:10,padding:'10px 14px',marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:S.amber,marginBottom:4}}>DETALII OFERTĂ</div><p style={{fontSize:13,color:S.amber,lineHeight:1.6,margin:0}}>{o.description}</p></div>}
      {o.status==='trimisa'&&(
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>onAccept(o.id,o.request_id,svc?.id)} disabled={accepting===o.id}
            style={{...btn('yellow'),flex:1,justifyContent:'center',padding:'12px',fontSize:14,opacity:accepting===o.id?.6:1}}>
            {accepting===o.id?'Se procesează...':'✅ Acceptă oferta & Programează'}
          </button>
          {svc?.phone&&<a href={`tel:${svc.phone}`} style={{...btn(),textDecoration:'none',flexShrink:0}}>📞 Sună</a>}
        </div>
      )}
      {isAccepted&&<div style={{background:S.greenBg,border:`1px solid ${S.green}30`,borderRadius:10,padding:'12px 16px',textAlign:'center',marginTop:12}}><div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.green,fontSize:14}}>✅ Ai acceptat această ofertă!</div><div style={{fontSize:12,color:S.green,opacity:.8,marginTop:3}}>Programarea a fost confirmată. Service-ul te va contacta în curând.</div></div>}
    </div>
  )
}

export default function OfertePage() {
  const [requests, setRequests] = useState([])
  const [offers, setOffers] = useState({})
  const [selectedReq, setSelectedReq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { data: reqs } = await supabase.from('quote_requests').select('*').eq('user_id', user.id).order('created_at', {ascending:false})
      setRequests(reqs||[])
      if (reqs?.length) {
        setSelectedReq(reqs[0].id)
        const { data: allOffs } = await supabase.from('offers')
          .select('*, services(id,name,city,rating_avg,rating_count,phone,logo_url,is_verified)')
          .in('request_id', reqs.map(r=>r.id)).order('price_total', {ascending:true})
        if (allOffs?.length) {
          const grouped = {}
          for (const off of allOffs) { if (!grouped[off.request_id]) grouped[off.request_id]=[]; grouped[off.request_id].push(off) }
          setOffers(grouped)
        }
      }
      setLoading(false)
    }
    load()
    const channel = supabase.channel('client-new-offers')
      .on('postgres_changes', {event:'INSERT', schema:'public', table:'offers'}, async payload => {
        const offer = payload.new
        const {data:svc} = await supabase.from('services').select('id,name,city,rating_avg,rating_count,phone,logo_url,is_verified').eq('id', offer.service_id).single()
        setOffers(prev => ({...prev,[offer.request_id]:[...(prev[offer.request_id]||[]),{...offer,services:svc}].sort((a,b)=>(a.price_total||0)-(b.price_total||0))}))
      })
      .on('postgres_changes', {event:'UPDATE', schema:'public', table:'offers'}, payload => {
        const offer = payload.new
        setOffers(prev => {if(!prev[offer.request_id])return prev;return{...prev,[offer.request_id]:prev[offer.request_id].map(o=>o.id===offer.id?{...o,...offer}:o)}})
      })
      .subscribe()
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

  async function cancelRequest(requestId) {
    if (!confirm('Sigur anulezi această cerere? Service-urile nu vor mai putea trimite oferte.')) return
    setCancelling(requestId)
    const { error } = await supabase.from('quote_requests').update({status:'anulata'}).eq('id',requestId)
    if (error) {
      alert('Nu am putut anula cererea: ' + error.message + '\n\nRulează SQL-ul din quote_requests_cancel_fix.sql în Supabase.')
      setCancelling(null)
      return
    }
    setRequests(prev=>prev.map(r=>r.id===requestId?{...r,status:'anulata'}:r))
    setCancelling(null)
  }

  if (loading) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  const currentOffers = selectedReq ? (offers[selectedReq]||[]) : []
  const currentReq = requests.find(r => r.id === selectedReq)
  const canCompare = currentOffers.filter(o=>o.status!=='expirata').length >= 2

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .req-card:hover{border-color:${S.blue}!important}
        .oferte-layout{display:flex;gap:20px;}
        .oferte-sidebar{width:280px;flex-shrink:0;}
        @media(max-width:700px){
          .oferte-layout{flex-direction:column!important;}
          .oferte-sidebar{width:100%!important;margin-bottom:16px!important;}
          .oferte-sidebar-inner{display:flex!important;overflow-x:auto!important;gap:8px!important;padding-bottom:8px!important;}
          .oferte-sidebar-inner > button{min-width:200px!important;flex-shrink:0!important;}
          .compare-scroll{overflow-x:auto!important;}
          .compare-scroll > div > div > div{min-width:500px!important;}
        }
      `}</style>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 16px'}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:6}}>Ofertele mele</h1>
        <p style={{color:S.muted,fontSize:13,marginBottom:24}}>Compară ofertele primite și alege cel mai bun raport calitate/preț.</p>

        {requests.length===0 ? (
          <div style={{...card(),textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:64,marginBottom:16}}>📭</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:8}}>Nu ai nicio cerere de ofertă</div>
            <p style={{fontSize:14,color:S.muted,marginBottom:24,maxWidth:360,margin:'0 auto 24px'}}>Trimite o cerere și vei primi oferte de la service-urile din zona ta în 24h.</p>
            <a href="/home" style={{...btn('yellow'),textDecoration:'none',display:'inline-flex'}}>✦ Cere ofertă acum →</a>
          </div>
        ) : (
          <div className="oferte-layout">
            <div className="oferte-sidebar">
              <div className="oferte-sidebar-inner" style={{display:'flex',flexDirection:'column'}}>
                <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>Cererile tale</div>
                {requests.map(r=>(
                  <button key={r.id} onClick={()=>{setSelectedReq(r.id);setViewMode('list')}} className="req-card"
                    style={{...card({padding:14,marginBottom:8}),width:'100%',textAlign:'left',cursor:'pointer',border:`1.5px solid ${selectedReq===r.id?S.blue:S.border}`,background:selectedReq===r.id?'#eaf3ff':S.white}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy,marginBottom:3}}>{r.car_brand} {r.car_model} {r.car_year?`(${r.car_year})`:''}</div>
                    <div style={{fontSize:11,color:S.muted,marginBottom:8}}>{r.services?.slice(0,2).join(', ')}{(r.services?.length||0)>2?'...':''}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={pill(
                        r.status==='activa'?'#eaf3ff':r.status==='in_progres'?S.greenBg:r.status==='anulata'?S.redBg:S.bg,
                        r.status==='activa'?S.blue:r.status==='in_progres'?S.green:r.status==='anulata'?'#dc2626':S.muted
                      )}>
                        {r.status==='activa'?'Activă':r.status==='in_progres'?'În progres':r.status==='anulata'?'Anulată':r.status}
                      </span>
                      <span style={{fontSize:11,color:S.muted}}>{(offers[r.id]||[]).length} oferte</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{flex:1,minWidth:0}}>
              {currentReq&&(
                <div style={{...card({marginBottom:14,padding:'14px 18px'}),display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                  <div>
                    <div style={{fontSize:11,color:S.muted,marginBottom:2}}>Cerere pentru</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{currentReq.car_brand} {currentReq.car_model} · {currentReq.services?.join(', ')}</div>
                  </div>
                  {canCompare&&(
                    <div style={{display:'flex',gap:4,background:S.bg,borderRadius:50,padding:3}}>
                      {[['list','☰ Listă'],['compare','⚖️ Compară']].map(([m,l])=>(
                        <button key={m} onClick={()=>setViewMode(m)}
                          style={{padding:'7px 14px',borderRadius:50,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',fontFamily:"'DM Sans',sans-serif",
                            background:viewMode===m?S.white:'transparent',color:viewMode===m?(m==='compare'?S.blue:S.navy):S.muted,
                            boxShadow:viewMode===m?'0 1px 4px rgba(10,31,68,0.1)':'none',transition:'all .15s'}}>{l}</button>
                      ))}
                    </div>
                  )}
                  {(currentReq.status==='activa'||currentReq.status==='in_progres')&&(
                    <button onClick={()=>cancelRequest(currentReq.id)} disabled={cancelling===currentReq.id}
                      style={{padding:'7px 14px',borderRadius:50,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${S.redBg}`,background:S.white,color:'#dc2626',fontFamily:"'DM Sans',sans-serif",opacity:cancelling===currentReq.id?.6:1,flexShrink:0}}>
                      {cancelling===currentReq.id?'Se anulează...':'✕ Anulează cererea'}
                    </button>
                  )}
                </div>
              )}

              {currentOffers.length===0 ? (
                <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                  <div style={{fontSize:48,marginBottom:12}}>⏳</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Așteptăm oferte</div>
                  <p style={{fontSize:13,color:S.muted}}>Service-urile din zona ta vor trimite oferte în curând.</p>
                </div>
              ) : viewMode==='compare' ? (
                <div className="compare-scroll">
                  <ComparatorView offers={currentOffers} onAccept={acceptOffer} accepting={accepting}/>
                  {currentOffers.length>3&&<p style={{fontSize:12,color:S.muted,textAlign:'center',marginTop:8}}>* Primele 3 oferte sortate după preț</p>}
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {currentOffers.map(o=><OfferCard key={o.id} o={o} onAccept={acceptOffer} accepting={accepting}/>)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
