// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy: '#0a1f44', blue: '#1a56db', blueLight: '#3b82f6', yellow: '#f59e0b',
  bg: '#f0f6ff', white: '#fff', text: '#111827', muted: '#6b7280', border: '#e5e7eb',
  green: '#16a34a', greenBg: '#dcfce7', red: '#dc2626', redBg: '#fee2e2',
  amber: '#d97706', amberBg: '#fef3c7', purple: '#7c3aed', purpleBg: '#ede9fe',
}

const pill = (bg, color, text) => ({
  display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,
  background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"
})

const btn = (variant='primary') => ({
  display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',
  borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',
  fontFamily:"'DM Sans',sans-serif",transition:'all .15s',
  ...(variant==='primary'?{background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}:
    variant==='outline'?{background:'transparent',color:S.blue,border:`1.5px solid ${S.blue}`}:
    variant==='ghost'?{background:'transparent',color:S.muted,border:`1.5px solid ${S.border}`}:
    {background:S.yellow,color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.25)'})
})

const card = (extra={}) => ({
  background:S.white,borderRadius:16,border:`1px solid ${S.border}`,
  boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra
})

const input = {
  width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,
  fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white
}

const label = {display:'block',fontSize:11,fontWeight:700,color:S.muted,
  textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}

const ALL_SERVICES = ['Schimb ulei & filtre','Frâne & discuri','Geometrie roți','Echilibrare roți','Diagnoză electronică','Suspensie','Transmisie & cutie viteze','Vopsitorie','Caroserie','Climatizare & AC','Electrică auto','Motor','ITP','RAR','Anvelope & jante','Injecție & turbo','Polishing & detailing','Tractare','Verificare pre-cumpărare','Recondiționare faruri','Folie auto','Detailing interior']
const ALL_BRANDS = ['Toate mărcile','Alfa Romeo','Audi','BMW','Chevrolet','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Jaguar','Jeep','Kia','Land Rover','Lexus','Mazda','Mercedes-Benz','Mini','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat','Skoda','Subaru','Suzuki','Tesla','Toyota','Volkswagen','Volvo']
const COUNTIES = ['Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila','Brașov','București','Buzău','Călărași','Caraș-Severin','Cluj','Constanța','Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara','Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt','Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea','Vâlcea','Vaslui','Vrancea']
const APT_STATUS = {in_asteptare:{label:'Așteptare',bg:S.amberBg,color:S.amber},confirmata:{label:'Confirmată',bg:'#dbeafe',color:S.blue},in_lucru:{label:'În lucru',bg:S.purpleBg,color:S.purple},finalizata:{label:'Finalizată',bg:S.greenBg,color:S.green},anulata:{label:'Anulată',bg:S.redBg,color:S.red}}

export default function ServiceDashboard() {
  const [tab, setTab] = useState('Acasă')
  const [service, setService] = useState(null)
  const [requests, setRequests] = useState([])
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])
  const [offers, setOffers] = useState([])
  const [offerings, setOfferings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReq, setSelectedReq] = useState(null)
  const [offerForm, setOfferForm] = useState({price_total:'',price_parts:'',price_labor:'',description:'',available_date:'',available_time:'09:00-12:00',warranty_months:'6'})
  const [offerSent, setOfferSent] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())
  const [aptStatuses, setAptStatuses] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [newOffering, setNewOffering] = useState({name:'',price_from:'',price_to:'',duration_min:'',description:''})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pf, setPf] = useState({name:'',description:'',phone:'',email:'',website:'',facebook_url:'',address:'',city:'',county:'',postal_code:'',brands_accepted:[],fuel_types:[],min_year_accepted:'',is_authorized_rar:false,has_itp:false,warranty_months:'0',opening_hours:{Lu:'08:00-18:00',Ma:'08:00-18:00',Mi:'08:00-18:00',Jo:'08:00-18:00',Vi:'08:00-18:00',Sâ:'09:00-14:00',Du:'Închis'}})
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      let { data: svc } = await supabase.from('services').select('*').eq('owner_id', user.id).single()
      if (!svc) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const { data: newSvc } = await supabase.from('services').insert({owner_id:user.id,name:prof?.full_name||'Service-ul meu',city:prof?.city||'București',is_active:true,plan:'free'}).select().single()
        svc = newSvc
      }
      setService(svc)
      if (svc) {
        setPf(p => ({...p,name:svc.name||'',description:svc.description||'',phone:svc.phone||'',email:svc.email||'',website:svc.website||'',facebook_url:svc.facebook_url||'',address:svc.address||'',city:svc.city||'',county:svc.county||'',postal_code:svc.postal_code||'',brands_accepted:svc.brands_accepted||[],fuel_types:svc.fuel_types||[],is_authorized_rar:svc.is_authorized_rar||false,has_itp:svc.has_itp||false,warranty_months:svc.warranty_months?.toString()||'0'}))
        const [reqs,apts,revs,offs,offrs] = await Promise.all([
          supabase.from('quote_requests').select('*').eq('city',svc.city||'').eq('status','activa').order('created_at',{ascending:false}).limit(50),
          supabase.from('appointments').select('*').eq('service_id',svc.id).order('scheduled_date',{ascending:true}),
          supabase.from('reviews').select('*').eq('service_id',svc.id).order('created_at',{ascending:false}),
          supabase.from('offers').select('*').eq('service_id',svc.id).order('created_at',{ascending:false}),
          supabase.from('service_offerings').select('*').eq('service_id',svc.id),
        ])
        setRequests(reqs.data||[])
        setAppointments(apts.data||[])
        const sm={}; (apts.data||[]).forEach(a=>sm[a.id]=a.status); setAptStatuses(sm)
        setReviews(revs.data||[])
        setOffers(offs.data||[])
        setOfferings(offrs.data||[])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile() {
    if (!service) return
    setProfileSaving(true)
    await supabase.from('services').update({name:pf.name,description:pf.description,phone:pf.phone,email:pf.email,website:pf.website,facebook_url:pf.facebook_url,address:pf.address,city:pf.city,county:pf.county,postal_code:pf.postal_code,brands_accepted:pf.brands_accepted.length?pf.brands_accepted:null,fuel_types:pf.fuel_types.length?pf.fuel_types:null,min_year_accepted:pf.min_year_accepted?parseInt(pf.min_year_accepted):null,is_authorized_rar:pf.is_authorized_rar,has_itp:pf.has_itp,warranty_months:parseInt(pf.warranty_months)||0,is_active:true}).eq('id',service.id)
    setProfileSaving(false); setProfileSaved(true)
    setTimeout(()=>setProfileSaved(false),2500)
  }

  async function sendOffer() {
    if (!service||!selectedReq) return
    await supabase.from('offers').insert({request_id:selectedReq.id,service_id:service.id,price_total:offerForm.price_total?parseFloat(offerForm.price_total):null,price_parts:offerForm.price_parts?parseFloat(offerForm.price_parts):null,price_labor:offerForm.price_labor?parseFloat(offerForm.price_labor):null,description:offerForm.description,available_date:offerForm.available_date||null,available_time:offerForm.available_time,warranty_months:parseInt(offerForm.warranty_months),status:'trimisa'})
    setOfferSent(true)
    setRequests(prev=>prev.filter(r=>r.id!==selectedReq.id))
    setTimeout(()=>{setSelectedReq(null);setOfferSent(false);setOfferForm({price_total:'',price_parts:'',price_labor:'',description:'',available_date:'',available_time:'09:00-12:00',warranty_months:'6'})},1800)
  }

  async function updateAptStatus(id, status) {
    await supabase.from('appointments').update({status}).eq('id',id)
    setAptStatuses(p=>({...p,[id]:status}))
  }

  async function sendReply(reviewId) {
    await supabase.from('reviews').update({reply_text:replyText,reply_at:new Date().toISOString()}).eq('id',reviewId)
    setReviews(prev=>prev.map(r=>r.id===reviewId?{...r,reply_text:replyText}:r))
    setReplyingTo(null); setReplyText('')
  }

  async function addOffering() {
    if (!service||!newOffering.name) return
    const {data} = await supabase.from('service_offerings').insert({...newOffering,service_id:service.id,price_from:newOffering.price_from?parseFloat(newOffering.price_from):null,price_to:newOffering.price_to?parseFloat(newOffering.price_to):null,duration_min:newOffering.duration_min?parseInt(newOffering.duration_min):null,is_active:true}).select().single()
    if (data) setOfferings(prev=>[data,...prev])
    setNewOffering({name:'',price_from:'',price_to:'',duration_min:'',description:''})
  }

  async function deleteOffering(id) {
    await supabase.from('service_offerings').delete().eq('id',id)
    setOfferings(prev=>prev.filter(o=>o.id!==id))
  }

  const firstDay = (() => { const d=new Date(calMonth.getFullYear(),calMonth.getMonth(),1).getDay(); return d===0?6:d-1 })()
  const daysInMonth = new Date(calMonth.getFullYear(),calMonth.getMonth()+1,0).getDate()
  const aptsForDay = (day) => { const ds=`${calMonth.getFullYear()}-${String(calMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; return appointments.filter(a=>a.scheduled_date===ds) }

  const TABS = [
    {name:'Acasă',icon:'🏠',badge:null},
    {name:'Profil public',icon:'🏪',badge:(!pf.description||!pf.phone||!pf.address)?'!':null},
    {name:'Servicii oferite',icon:'🔧',badge:offerings.length||null},
    {name:'Cereri',icon:'📋',badge:requests.length||null},
    {name:'Programări',icon:'📅',badge:appointments.filter(a=>['in_asteptare','confirmata','in_lucru'].includes(aptStatuses[a.id]||a.status)).length||null},
    {name:'Oferte trimise',icon:'💬',badge:offers.filter(o=>o.status==='trimisa').length||null},
    {name:'Recenzii',icon:'⭐',badge:reviews.length||null},
    {name:'Setări',icon:'⚙️',badge:null},
  ]

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
        <div style={{color:S.muted,fontSize:14}}>Se încarcă...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .dash-input:focus{border-color:${S.blue}!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        .tab-btn:hover{background:${S.bg}!important;color:${S.navy}!important}
        .tab-btn.active{background:#eaf3ff!important;color:${S.blue}!important}
        .nav-link:hover{color:${S.navy}!important}
        .card-hover:hover{border-color:${S.blueLight}!important;box-shadow:0 4px 20px rgba(26,86,219,0.1)!important}
        .apt-btn:hover{border-color:${S.blue}!important;color:${S.blue}!important}
        @media(max-width:768px){
          .dash-sidebar{transform:translateX(-100%);position:fixed!important;z-index:200!important;height:100vh!important;top:0!important}
          .dash-sidebar.open{transform:translateX(0)}
          .dash-overlay{display:block!important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{background:S.navy,height:56,display:'flex',alignItems:'center',padding:'0 24px',position:'sticky',top:0,zIndex:100,gap:12}}>
        <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
          {[0,1,2].map(i=><span key={i} style={{display:'block',width:18,height:2,background:'rgba(255,255,255,0.7)',borderRadius:2}}/>)}
        </button>
        <a href="/home" style={{display:'flex',alignItems:'center',gap:7,textDecoration:'none',flexShrink:0}}>
          <div style={{width:28,height:28,background:S.blue,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'#fff',fontFamily:"'Sora',sans-serif"}}>R</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:'#fff'}}>Reparo</span>
        </a>
        <div style={{width:1,height:20,background:'rgba(255,255,255,0.15)'}}/>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontFamily:"'Sora',sans-serif",fontWeight:600,letterSpacing:0.5}}>DASHBOARD SERVICE</span>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:12}}>
          {service?.id && <a href={`/service/${service.id}`} target="_blank" style={{fontSize:12,color:'rgba(255,255,255,0.5)',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>👁️ <span style={{display:'none'}}>Profil public</span></a>}
          <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/home'}} style={{fontSize:12,color:'rgba(255,255,255,0.4)',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Ieși</button>
        </div>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden',position:'relative'}}>

        {/* SIDEBAR */}
        <aside className={`dash-sidebar${sidebarOpen?' open':''}`}
          style={{width:220,background:S.white,borderRight:`1px solid ${S.border}`,display:'flex',flexDirection:'column',flexShrink:0,transition:'transform .25s',overflow:'hidden auto'}}>
          
          {/* Service info */}
          <div style={{padding:'20px 16px 14px',borderBottom:`1px solid ${S.border}`}}>
            <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:10}}>🔧</div>
            <div style={{fontSize:11,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,fontFamily:"'Sora',sans-serif",marginBottom:3}}>Service</div>
            <div style={{fontSize:14,fontWeight:700,color:S.navy,fontFamily:"'Sora',sans-serif",marginBottom:2}}>{service?.name||'—'}</div>
            <div style={{fontSize:12,color:S.muted,marginBottom:8}}>{service?.city}</div>
            <span style={pill(service?.plan==='pro'?S.amberBg:'#f1f5f9',service?.plan==='pro'?S.amber:S.muted,'')}>{service?.plan==='pro'?'⭐ Pro':'🔓 Free'}</span>
          </div>

          {/* Nav */}
          <nav style={{padding:'8px 8px',flex:1}}>
            {TABS.map(t=>(
              <button key={t.name} className={`tab-btn${tab===t.name?' active':''}`}
                onClick={()=>{setTab(t.name);setSidebarOpen(false)}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',background:tab===t.name?'#eaf3ff':'transparent',color:tab===t.name?S.blue:S.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:tab===t.name?600:500,marginBottom:2,transition:'all .15s'}}>
                <span style={{fontSize:16}}>{t.icon}</span>
                <span style={{flex:1,textAlign:'left'}}>{t.name}</span>
                {t.badge&&<span style={{...pill(tab===t.name?S.blue:'#e5e7eb',tab===t.name?'#fff':S.muted,''),padding:'2px 7px',fontSize:10}}>{t.badge}</span>}
              </button>
            ))}
          </nav>

          <div style={{padding:'8px',borderTop:`1px solid ${S.border}`}}>
            <a href="/home" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:10,color:S.muted,textDecoration:'none',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>🏠 Înapoi la site</a>
          </div>
        </aside>

        {/* Overlay mobile */}
        {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.4)',zIndex:199,display:'none'}} className="dash-overlay"/>}

        {/* MAIN */}
        <main style={{flex:1,overflowY:'auto',padding:'24px',minWidth:0}}>

          {/* ══ ACASĂ ══ */}
          {tab==='Acasă'&&(
            <div>
              <div style={{marginBottom:24}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,marginBottom:4}}>Bună ziua, {service?.name}! 👋</h1>
                <p style={{color:S.muted,fontSize:14}}>{new Date().toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
              </div>

              {(!pf.description||!pf.phone||!pf.address)&&(
                <div style={{background:S.amberBg,border:`1px solid ${S.amber}40`,borderRadius:14,padding:16,marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:24}}>⚠️</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:S.amber,fontSize:14,fontFamily:"'Sora',sans-serif",marginBottom:3}}>Profilul tău e incomplet</div>
                    <div style={{color:S.amber,fontSize:13,opacity:.8}}>Adaugă descriere, telefon și adresă pentru a apărea în căutări.</div>
                  </div>
                  <button onClick={()=>setTab('Profil public')} style={{...btn('primary'),background:S.amber,boxShadow:'none',flexShrink:0}}>Completează →</button>
                </div>
              )}

              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                {[
                  {label:'Cereri noi',value:requests.length,icon:'📋',bg:'#eaf3ff',color:S.blue,tab:'Cereri'},
                  {label:'Programări azi',value:appointments.filter(a=>a.scheduled_date===today).length,icon:'📅',bg:S.greenBg,color:S.green,tab:'Programări'},
                  {label:'Oferte active',value:offers.filter(o=>o.status==='trimisa').length,icon:'💬',bg:S.purpleBg,color:S.purple,tab:'Oferte trimise'},
                  {label:'Rating',value:service?.rating_avg>0?service.rating_avg.toFixed(1)+' ⭐':'Nou',icon:'⭐',bg:S.amberBg,color:S.amber,tab:'Recenzii'},
                ].map(s=>(
                  <button key={s.label} onClick={()=>setTab(s.tab)}
                    style={{background:s.bg,borderRadius:16,padding:'18px 16px',border:`1px solid ${s.color}20`,cursor:'pointer',textAlign:'left',transition:'transform .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                    <div style={{fontSize:24,marginBottom:10}}>{s.icon}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:s.color,marginBottom:2}}>{s.value}</div>
                    <div style={{fontSize:12,color:s.color,opacity:.7}}>{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Cereri recente */}
              <div style={card({marginBottom:16})}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>Cereri noi în {service?.city}</h2>
                  <button onClick={()=>setTab('Cereri')} style={{...btn('ghost'),padding:'6px 12px',fontSize:12}}>Vezi toate →</button>
                </div>
                {requests.length===0?<div style={{textAlign:'center',padding:'20px 0',color:S.muted,fontSize:14}}>Nicio cerere activă momentan.</div>:
                  requests.slice(0,3).map(r=>(
                    <div key={r.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:S.bg,borderRadius:12,marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:S.navy,marginBottom:2}}>{r.car_brand} {r.car_model} {r.car_year?`· ${r.car_year}`:''}</div>
                        <div style={{fontSize:12,color:S.muted}}>{r.services?.join(', ')}</div>
                      </div>
                      <button onClick={()=>{setSelectedReq(r);setTab('Cereri')}} style={{...btn('primary'),padding:'7px 14px',fontSize:12}}>Trimite ofertă</button>
                    </div>
                  ))
                }
              </div>

              {/* Programari azi */}
              <div style={card()}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>Programări azi</h2>
                  <button onClick={()=>setTab('Programări')} style={{...btn('ghost'),padding:'6px 12px',fontSize:12}}>Calendar →</button>
                </div>
                {appointments.filter(a=>a.scheduled_date===today).length===0?<div style={{textAlign:'center',padding:'20px 0',color:S.muted,fontSize:14}}>Nicio programare astăzi.</div>:
                  appointments.filter(a=>a.scheduled_date===today).map(a=>(
                    <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:S.bg,borderRadius:12,marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:S.navy}}>{a.scheduled_time}</div>
                        <div style={{fontSize:12,color:S.muted}}>{a.notes||'Programare'}</div>
                      </div>
                      <span style={pill((APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).bg,(APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).color,'')}>{(APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).label}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ══ PROFIL PUBLIC ══ */}
          {tab==='Profil public'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>Profilul public</h1>
                  <p style={{color:S.muted,fontSize:13}}>Aceste informații apar pe pagina ta publică și în căutări.</p>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {service?.id&&<a href={`/service/${service.id}`} target="_blank" style={{...btn('ghost'),textDecoration:'none',fontSize:12}}>👁️ Previzualizează</a>}
                  <button onClick={saveProfile} disabled={profileSaving}
                    style={{...btn('primary'),background:profileSaved?S.green:S.blue,opacity:profileSaving?.6:1}}>
                    {profileSaved?'✅ Salvat!':profileSaving?'Se salvează...':'Salvează profilul'}
                  </button>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {/* Informatii baza */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>📋 Informații de bază</h3>
                  {[{k:'name',l:'Numele service-ului *',p:'AutoPro Service SRL',t:'text'},{k:'phone',l:'Telefon *',p:'07xx xxx xxx',t:'tel'},{k:'email',l:'Email contact',p:'contact@service.ro',t:'email'},{k:'website',l:'Website',p:'https://...',t:'url'},{k:'facebook_url',l:'Pagină Facebook',p:'https://facebook.com/...',t:'url'}].map(f=>(
                    <div key={f.k} style={{marginBottom:12}}>
                      <label style={label}>{f.l}</label>
                      <input className="dash-input" type={f.t} value={pf[f.k]} onChange={e=>setPf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={input}/>
                    </div>
                  ))}
                  <div style={{marginBottom:12}}>
                    <label style={label}>Descriere service *</label>
                    <textarea className="dash-input" value={pf.description} onChange={e=>setPf(p=>({...p,description:e.target.value}))} rows={4} placeholder="Descrie service-ul tău: specializări, echipamente, experiență..."
                      style={{...input,resize:'none'}}/>
                  </div>
                </div>

                {/* Locatie */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>📍 Locație</h3>
                  <div style={{marginBottom:12}}>
                    <label style={label}>Adresa completă *</label>
                    <input className="dash-input" value={pf.address} onChange={e=>setPf(p=>({...p,address:e.target.value}))} placeholder="Str. Exemplu nr. 10" style={input}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                    <div>
                      <label style={label}>Oraș *</label>
                      <input className="dash-input" value={pf.city} onChange={e=>setPf(p=>({...p,city:e.target.value}))} placeholder="București" style={input}/>
                    </div>
                    <div>
                      <label style={label}>Județ</label>
                      <select className="dash-input" value={pf.county} onChange={e=>setPf(p=>({...p,county:e.target.value}))} style={input}>
                        <option value="">Selectează</option>
                        {COUNTIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {pf.address&&pf.city&&(
                    <div>
                      <label style={label}>Hartă</label>
                      <div style={{borderRadius:12,overflow:'hidden',border:`1px solid ${S.border}`}}>
                        <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(pf.address+', '+pf.city+', Romania')}&output=embed&z=15`} width="100%" height="180" style={{border:0,display:'block'}} allowFullScreen loading="lazy"/>
                      </div>
                      <a href={`https://maps.google.com/maps?q=${encodeURIComponent(pf.address+', '+pf.city)}`} target="_blank" style={{fontSize:12,color:S.blue,textDecoration:'none',display:'block',marginTop:6}}>🗺️ Verifică pe Google Maps →</a>
                    </div>
                  )}

                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,margin:'20px 0 12px'}}>🕐 Program lucru</h3>
                  {Object.entries(pf.opening_hours).map(([day,hours])=>(
                    <div key={day} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:S.navy,width:24,fontFamily:"'Sora',sans-serif"}}>{day}</span>
                      <input className="dash-input" value={hours} onChange={e=>setPf(p=>({...p,opening_hours:{...p.opening_hours,[day]:e.target.value}}))} placeholder="08:00-18:00 sau Închis" style={{...input,padding:'8px 12px',fontSize:12}}/>
                    </div>
                  ))}
                </div>

                {/* Specializari */}
                <div style={{...card(),gridColumn:'1/-1'}}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>🚗 Specializări & certificări</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
                    <div>
                      <label style={label}>Combustibil acceptat</label>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {['Benzină','Diesel','Hybrid','Electric','GPL'].map(f=>(
                          <button key={f} onClick={()=>setPf(p=>({...p,fuel_types:p.fuel_types.includes(f)?p.fuel_types.filter(x=>x!==f):[...p.fuel_types,f]}))}
                            style={{padding:'6px 12px',borderRadius:50,border:`1.5px solid ${pf.fuel_types.includes(f)?S.blue:S.border}`,background:pf.fuel_types.includes(f)?'#eaf3ff':S.white,color:pf.fuel_types.includes(f)?S.blue:S.muted,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={label}>Garanție lucrări</label>
                      <select className="dash-input" value={pf.warranty_months} onChange={e=>setPf(p=>({...p,warranty_months:e.target.value}))} style={input}>
                        {['0','3','6','12','24','36'].map(m=><option key={m} value={m}>{m==='0'?'Fără garanție':`${m} luni`}</option>)}
                      </select>
                      <div style={{marginTop:10}}>
                        <label style={label}>An minim acceptat</label>
                        <input className="dash-input" type="number" value={pf.min_year_accepted} onChange={e=>setPf(p=>({...p,min_year_accepted:e.target.value}))} placeholder="ex: 2005" style={input}/>
                      </div>
                    </div>
                    <div>
                      <label style={label}>Certificări</label>
                      {[{k:'is_authorized_rar',l:'🛡️ Autorizat RAR'},{k:'has_itp',l:'✅ ITP pe loc'}].map(opt=>(
                        <label key={opt.k} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:pf[opt.k]?'#eaf3ff':S.bg,borderRadius:10,cursor:'pointer',marginBottom:8,border:`1.5px solid ${pf[opt.k]?S.blue:S.border}`}}>
                          <input type="checkbox" checked={pf[opt.k]} onChange={e=>setPf(p=>({...p,[opt.k]:e.target.checked}))} style={{accentColor:S.blue,width:16,height:16}}/>
                          <span style={{fontSize:13,fontWeight:600,color:pf[opt.k]?S.blue:S.navy}}>{opt.l}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{marginTop:16}}>
                    <label style={label}>Mărci acceptate ({pf.brands_accepted.length===0?'toate':pf.brands_accepted.length+' selectate'})</label>
                    <div style={{maxHeight:120,overflowY:'auto',border:`1px solid ${S.border}`,borderRadius:10,padding:10,display:'flex',flexWrap:'wrap',gap:6,background:S.bg}}>
                      <button onClick={()=>setPf(p=>({...p,brands_accepted:[]}))}
                        style={{padding:'4px 10px',borderRadius:50,border:`1.5px solid ${pf.brands_accepted.length===0?S.blue:S.border}`,background:pf.brands_accepted.length===0?S.blue:'#fff',color:pf.brands_accepted.length===0?'#fff':S.muted,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                        Toate
                      </button>
                      {ALL_BRANDS.filter(b=>b!=='Toate mărcile').map(brand=>(
                        <button key={brand} onClick={()=>setPf(p=>({...p,brands_accepted:p.brands_accepted.includes(brand)?p.brands_accepted.filter(b=>b!==brand):[...p.brands_accepted,brand]}))}
                          style={{padding:'4px 10px',borderRadius:50,border:`1.5px solid ${pf.brands_accepted.includes(brand)?S.blue:S.border}`,background:pf.brands_accepted.includes(brand)?'#eaf3ff':'#fff',color:pf.brands_accepted.includes(brand)?S.blue:S.muted,fontSize:11,fontWeight:pf.brands_accepted.includes(brand)?700:400,cursor:'pointer'}}>
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
                <button onClick={saveProfile} disabled={profileSaving}
                  style={{...btn('primary'),padding:'12px 28px',fontSize:14,background:profileSaved?S.green:S.blue}}>
                  {profileSaved?'✅ Profil salvat!':profileSaving?'Se salvează...':'Salvează toate modificările →'}
                </button>
              </div>
            </div>
          )}

          {/* ══ SERVICII OFERITE ══ */}
          {tab==='Servicii oferite'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>Servicii oferite</h1>
              <p style={{color:S.muted,fontSize:13,marginBottom:20}}>Adaugă serviciile cu prețuri — clienții le văd pe profilul tău.</p>

              <div style={card({marginBottom:16})}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>+ Adaugă serviciu nou</h3>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <label style={label}>Serviciu *</label>
                    <select className="dash-input" value={newOffering.name} onChange={e=>setNewOffering(p=>({...p,name:e.target.value}))} style={input}>
                      <option value="">Selectează serviciul</option>
                      {ALL_SERVICES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Preț de la (RON)</label>
                    <input className="dash-input" type="number" value={newOffering.price_from} onChange={e=>setNewOffering(p=>({...p,price_from:e.target.value}))} placeholder="100" style={input}/>
                  </div>
                  <div>
                    <label style={label}>Preț până la (RON)</label>
                    <input className="dash-input" type="number" value={newOffering.price_to} onChange={e=>setNewOffering(p=>({...p,price_to:e.target.value}))} placeholder="250" style={input}/>
                  </div>
                  <div>
                    <label style={label}>Durată (min)</label>
                    <input className="dash-input" type="number" value={newOffering.duration_min} onChange={e=>setNewOffering(p=>({...p,duration_min:e.target.value}))} placeholder="60" style={input}/>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={label}>Detalii suplimentare</label>
                  <input className="dash-input" value={newOffering.description} onChange={e=>setNewOffering(p=>({...p,description:e.target.value}))} placeholder="ex: include filtrul de ulei, verificare nivel lichide..." style={input}/>
                </div>
                <button onClick={addOffering} disabled={!newOffering.name} style={{...btn('primary'),opacity:!newOffering.name?.5:1}}>+ Adaugă serviciu</button>
              </div>

              {offerings.length===0?<div style={{...card(),textAlign:'center',padding:'40px 20px',color:S.muted}}>
                <div style={{fontSize:40,marginBottom:12}}>🔧</div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>Niciun serviciu adăugat</div>
                <div style={{fontSize:13}}>Adaugă serviciile pentru a apărea mai bine în căutări.</div>
              </div>:
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {offerings.map(o=>(
                    <div key={o.id} className="card-hover" style={{...card({padding:'14px 16px'}),display:'flex',alignItems:'center',gap:14}}>
                      <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🔧</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,color:S.navy}}>{o.name}</div>
                        {o.description&&<div style={{fontSize:12,color:S.muted,marginTop:2}}>{o.description}</div>}
                        {o.duration_min&&<div style={{fontSize:12,color:S.muted}}>⏱️ ~{o.duration_min} min</div>}
                      </div>
                      <div style={{textAlign:'right',marginRight:12}}>
                        {(o.price_from||o.price_to)&&<div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy}}>{o.price_from&&o.price_to?`${o.price_from} – ${o.price_to} RON`:o.price_from?`de la ${o.price_from} RON`:`până la ${o.price_to} RON`}</div>}
                      </div>
                      <button onClick={()=>deleteOffering(o.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#fca5a5',fontSize:18,padding:4}}>🗑️</button>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ══ CERERI ══ */}
          {tab==='Cereri'&&(
            <div style={{display:'flex',gap:16}}>
              <div style={{width:300,flexShrink:0}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:16}}>Cereri în {service?.city}</h1>
                {requests.length===0?<div style={{...card(),textAlign:'center',padding:'40px 16px',color:S.muted}}>
                  <div style={{fontSize:36,marginBottom:10}}>📭</div>
                  <div style={{fontWeight:600,marginBottom:4}}>Nicio cerere activă</div>
                  <div style={{fontSize:12}}>Vei fi notificat când apar cereri noi.</div>
                </div>:
                  requests.map(r=>(
                    <button key={r.id} onClick={()=>setSelectedReq(r)} className="card-hover"
                      style={{...card({padding:14,marginBottom:8}),width:'100%',textAlign:'left',cursor:'pointer',border:`1.5px solid ${selectedReq?.id===r.id?S.blue:S.border}`,background:selectedReq?.id===r.id?'#eaf3ff':S.white}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:S.navy}}>{r.car_brand} {r.car_model} {r.car_year?`(${r.car_year})`:''}</div>
                          <div style={{fontSize:11,color:S.muted,marginTop:1}}>{r.car_fuel}{r.car_km?` · ${r.car_km.toLocaleString()} km`:''}</div>
                        </div>
                        <span style={pill(r.urgency==='urgent'?S.redBg:r.urgency==='saptamana'?S.amberBg:S.greenBg,r.urgency==='urgent'?S.red:r.urgency==='saptamana'?S.amber:S.green,'')}>{r.urgency}</span>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:6}}>
                        {r.services?.slice(0,3).map(s=><span key={s} style={pill('#eaf3ff',S.blue,'')}>{s}</span>)}
                        {(r.services?.length||0)>3&&<span style={pill(S.bg,S.muted,'')}>+{r.services.length-3}</span>}
                      </div>
                      <div style={{fontSize:11,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO')}</div>
                    </button>
                  ))
                }
              </div>

              {selectedReq&&(
                <div style={{flex:1,minWidth:0}}>
                  <div style={card({marginBottom:12})}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                      <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy}}>Detalii cerere</h2>
                      <button onClick={()=>setSelectedReq(null)} style={{background:'none',border:'none',cursor:'pointer',color:S.muted,fontSize:18}}>✕</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                      {[['Mașina',`${selectedReq.car_brand} ${selectedReq.car_model} ${selectedReq.car_year||''}`],['Combustibil',selectedReq.car_fuel||'—'],['Kilometraj',selectedReq.car_km?`${selectedReq.car_km.toLocaleString()} km`:'—'],['Urgență',selectedReq.urgency],['Data preferată',selectedReq.preferred_date||'—'],['Interval',selectedReq.preferred_time||'—']].map(([l,v])=>(
                        <div key={l} style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
                          <div style={{fontSize:10,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{l}</div>
                          <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {selectedReq.services?.length>0&&<div style={{marginBottom:12}}>
                      <div style={{fontSize:11,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:6}}>Servicii cerute</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{selectedReq.services.map(s=><span key={s} style={pill('#eaf3ff',S.blue,'')}>{s}</span>)}</div>
                    </div>}
                    {selectedReq.description&&<div style={{background:S.amberBg,borderRadius:10,padding:'10px 12px',border:`1px solid ${S.amber}30`}}>
                      <div style={{fontSize:10,color:S.amber,fontWeight:700,marginBottom:4}}>DESCRIERE PROBLEMĂ</div>
                      <p style={{fontSize:13,color:S.amber}}>{selectedReq.description}</p>
                    </div>}
                  </div>

                  <div style={card()}>
                    <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:16}}>Trimite ofertă</h2>
                    {offerSent?<div style={{textAlign:'center',padding:'32px 0'}}>
                      <div style={{fontSize:48,marginBottom:12}}>✅</div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.green,fontSize:16}}>Oferta a fost trimisă!</div>
                    </div>:(
                      <div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                          {[['price_total','Preț total (RON)'],['price_parts','Piese (RON)'],['price_labor','Manoperă (RON)']].map(([k,l])=>(
                            <div key={k}>
                              <label style={label}>{l}</label>
                              <input className="dash-input" type="number" value={offerForm[k]} onChange={e=>setOfferForm(p=>({...p,[k]:e.target.value}))} placeholder="0" style={input}/>
                            </div>
                          ))}
                        </div>
                        <div style={{marginBottom:12}}>
                          <label style={label}>Descriere ofertă</label>
                          <textarea className="dash-input" value={offerForm.description} onChange={e=>setOfferForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Detalii despre lucrare, piese incluse..." style={{...input,resize:'none'}}/>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
                          <div>
                            <label style={label}>Data disponibilă</label>
                            <input className="dash-input" type="date" value={offerForm.available_date} onChange={e=>setOfferForm(p=>({...p,available_date:e.target.value}))} style={input}/>
                          </div>
                          <div>
                            <label style={label}>Interval orar</label>
                            <select className="dash-input" value={offerForm.available_time} onChange={e=>setOfferForm(p=>({...p,available_time:e.target.value}))} style={input}>
                              {['08:00-10:00','09:00-12:00','10:00-13:00','12:00-15:00','14:00-17:00','15:00-18:00'].map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={label}>Garanție (luni)</label>
                            <select className="dash-input" value={offerForm.warranty_months} onChange={e=>setOfferForm(p=>({...p,warranty_months:e.target.value}))} style={input}>
                              {['0','3','6','12','24'].map(m=><option key={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <button onClick={sendOffer} style={{...btn('yellow'),width:'100%',justifyContent:'center',padding:'12px',fontSize:14}}>✉️ Trimite oferta</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ PROGRAMARI ══ */}
          {tab==='Programări'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:20}}>Calendar programări</h1>
              <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
                <div style={card()}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                    <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                    <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy}}>{calMonth.toLocaleDateString('ro-RO',{month:'long',year:'numeric'})}</span>
                    <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
                    {['L','M','M','J','V','S','D'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:11,fontWeight:700,color:S.muted,padding:'4px 0'}}>{d}</div>)}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
                    {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                    {Array.from({length:daysInMonth}).map((_,i)=>{
                      const day=i+1
                      const apts=aptsForDay(day)
                      const isToday=day===new Date().getDate()&&calMonth.getMonth()===new Date().getMonth()&&calMonth.getFullYear()===new Date().getFullYear()
                      return <div key={day} style={{textAlign:'center',padding:'5px 2px',borderRadius:8,background:isToday?S.blue:'transparent',cursor:'default'}}>
                        <div style={{fontSize:12,color:isToday?'#fff':S.text}}>{day}</div>
                        {apts.length>0&&<div style={{width:4,height:4,borderRadius:'50%',background:isToday?'#fff':S.yellow,margin:'2px auto 0'}}/>}
                      </div>
                    })}
                  </div>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {appointments.length===0?<div style={{...card(),textAlign:'center',padding:'40px 20px',color:S.muted}}>
                    <div style={{fontSize:40,marginBottom:10}}>📅</div>Nicio programare
                  </div>:appointments.map(a=>(
                    <div key={a.id} style={card({padding:16})}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:S.navy,marginBottom:2}}>
                            {new Date(a.scheduled_date).toLocaleDateString('ro-RO',{weekday:'short',day:'numeric',month:'short'})} · {a.scheduled_time}
                          </div>
                          {a.notes&&<div style={{fontSize:12,color:S.muted}}>{a.notes}</div>}
                        </div>
                        <span style={pill((APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).bg,(APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).color,'')}>{(APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).label}</span>
                      </div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {[{s:'in_asteptare',l:'⏳ Așteptare'},{s:'confirmata',l:'✅ Confirmată'},{s:'in_lucru',l:'🔧 În lucru'},{s:'finalizata',l:'🏁 Finalizată'}].map(opt=>(
                          <button key={opt.s} onClick={()=>updateAptStatus(a.id,opt.s)} className="apt-btn"
                            style={{padding:'6px 12px',borderRadius:50,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${(aptStatuses[a.id]||a.status)===opt.s?S.blue:S.border}`,background:(aptStatuses[a.id]||a.status)===opt.s?'#eaf3ff':S.white,color:(aptStatuses[a.id]||a.status)===opt.s?S.blue:S.muted,transition:'all .15s'}}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ OFERTE TRIMISE ══ */}
          {tab==='Oferte trimise'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:20}}>Oferte trimise</h1>
              {offers.length===0?<div style={{...card(),textAlign:'center',padding:'60px 20px',color:S.muted}}>
                <div style={{fontSize:48,marginBottom:12}}>💬</div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:8}}>Nicio ofertă trimisă</div>
                <button onClick={()=>setTab('Cereri')} style={btn('primary')}>Vezi cererile disponibile →</button>
              </div>:
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {offers.map(o=>(
                    <div key={o.id} style={{...card({padding:'14px 16px'}),display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{o.price_total?`${o.price_total.toLocaleString()} RON`:'Preț negociabil'}</div>
                        <div style={{fontSize:12,color:S.muted}}>{new Date(o.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                        {o.description&&<div style={{fontSize:12,color:S.muted,marginTop:3}}>{o.description.substring(0,60)}{o.description.length>60?'...':''}</div>}
                      </div>
                      <span style={pill(o.status==='acceptata'?S.greenBg:o.status==='refuzata'?S.redBg:o.status==='trimisa'?'#eaf3ff':S.bg,o.status==='acceptata'?S.green:o.status==='refuzata'?S.red:o.status==='trimisa'?S.blue:S.muted,'')}>
                        {o.status==='trimisa'?'🆕 Trimisă':o.status==='acceptata'?'✅ Acceptată':o.status==='refuzata'?'❌ Refuzată':'⏰ Expirată'}
                      </span>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ══ RECENZII ══ */}
          {tab==='Recenzii'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy}}>Recenzii</h1>
                {service?.rating_count>0&&<div style={{display:'flex',alignItems:'center',gap:8,background:S.amberBg,border:`1px solid ${S.amber}30`,padding:'8px 16px',borderRadius:50}}>
                  <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.amber}}>{service.rating_avg.toFixed(1)}</span>
                  <div><div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:12,color:s<=Math.round(service.rating_avg)?S.yellow:'#ddd'}}>★</span>)}</div><div style={{fontSize:10,color:S.muted}}>{service.rating_count} recenzii</div></div>
                </div>}
              </div>
              {reviews.length===0?<div style={{...card(),textAlign:'center',padding:'60px 20px',color:S.muted}}><div style={{fontSize:48,marginBottom:10}}>⭐</div>Nicio recenzie încă.</div>:
                reviews.map(r=>(
                  <div key={r.id} style={{...card({marginBottom:10})}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                      <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:16,color:s<=r.rating?S.yellow:'#e5e7eb'}}>★</span>)}</div>
                      <span style={{fontSize:12,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO')}</span>
                    </div>
                    {r.comment&&<p style={{fontSize:14,color:S.text,marginBottom:12,lineHeight:1.6}}>{r.comment}</p>}
                    {r.reply_text?<div style={{background:'#eaf3ff',borderRadius:10,padding:'10px 12px',border:`1px solid ${S.blue}20`}}>
                      <div style={{fontSize:10,fontWeight:700,color:S.blue,marginBottom:4}}>RĂSPUNSUL TĂU</div>
                      <p style={{fontSize:13,color:S.blue}}>{r.reply_text}</p>
                    </div>:replyingTo===r.id?(
                      <div>
                        <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} rows={2} placeholder="Răspunsul tău..." style={{...input,resize:'none',marginBottom:8}}/>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>sendReply(r.id)} style={btn('primary')}>Trimite</button>
                          <button onClick={()=>setReplyingTo(null)} style={btn('ghost')}>Anulează</button>
                        </div>
                      </div>
                    ):<button onClick={()=>setReplyingTo(r.id)} style={{...btn('ghost'),fontSize:12,padding:'6px 12px'}}>+ Răspunde la recenzie</button>}
                  </div>
                ))
              }
            </div>
          )}

          {/* ══ SETARI ══ */}
          {tab==='Setări'&&(
            <div style={{maxWidth:560}}>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:20}}>Setări cont</h1>
              <div style={{...card({marginBottom:16})}}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:12}}>Plan abonament</h3>
                <div style={{background:service?.plan==='pro'?S.amberBg:S.bg,borderRadius:12,padding:16,marginBottom:14,border:`1px solid ${service?.plan==='pro'?S.amber:S.border}`}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:service?.plan==='pro'?S.amber:S.navy,marginBottom:4}}>{service?.plan==='pro'?'⭐ Plan Pro':'🔓 Plan Free'}</div>
                  <div style={{fontSize:13,color:S.muted}}>{service?.plan==='free'?'Treci la Pro pentru vizibilitate crescută și funcții avansate.':'Ai acces la toate funcțiile platformei.'}</div>
                </div>
                {service?.plan==='free'&&(
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[{plan:'Basic',price:'99 RON/lună',features:['Profil complet','Cereri din oraș','Calendar programări']},{plan:'Pro',price:'199 RON/lună',features:['Tot din Basic','Anunțuri promovate','Statistici avansate','Badge Pro','Prioritate în căutări']}].map(p=>(
                      <div key={p.plan} style={{padding:16,borderRadius:12,border:`1.5px solid ${p.plan==='Pro'?S.blue:S.border}`,background:p.plan==='Pro'?'#eaf3ff':S.white}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>{p.plan}</div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.blue,marginBottom:10}}>{p.price}</div>
                        {p.features.map(f=><div key={f} style={{fontSize:12,color:S.muted,marginBottom:3}}>✓ {f}</div>)}
                        <button style={{...btn(p.plan==='Pro'?'primary':'ghost'),width:'100%',justifyContent:'center',marginTop:12,fontSize:12}}>Alege {p.plan}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{background:S.redBg,border:`1px solid ${S.red}20`,borderRadius:16,padding:16}}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.red,marginBottom:6}}>Zona periculoasă</h3>
                <p style={{fontSize:13,color:S.red,opacity:.8,marginBottom:10}}>Dezactivează profilul temporar.</p>
                <button onClick={async()=>{await supabase.from('services').update({is_active:false}).eq('id',service?.id);alert('Profilul a fost dezactivat.')}}
                  style={{padding:'8px 16px',border:`1.5px solid ${S.red}`,borderRadius:50,color:S.red,background:S.white,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
                  Dezactivează profilul
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
