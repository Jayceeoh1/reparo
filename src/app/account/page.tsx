// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CAR_BRANDS, CAR_MODELS, FUEL_TYPES } from '@/lib/carData'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  amber:'#d97706',amberBg:'#fef3c7',purple:'#7c3aed',purpleBg:'#ede9fe',
}

const pill = (bg, color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const card = (extra={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white}
const lbl = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}
const btn = (primary=true) => ({display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:primary?'none':`1.5px solid ${S.border}`,fontFamily:"'DM Sans',sans-serif",background:primary?S.blue:'transparent',color:primary?'#fff':S.muted,boxShadow:primary?'0 2px 8px rgba(26,86,219,0.2)':'none',transition:'all .15s'})

const TABS = ['Mașinile mele','Programări','Istoric lucrări','Documente & ITP/RCA','Oferte primite','Setări cont']
const DOC_TYPES = [{key:'itp',label:'ITP',icon:'🛡️',color:S.blue,bg:'#eaf3ff'},{key:'rca',label:'RCA',icon:'📄',color:S.green,bg:S.greenBg},{key:'rovinieta',label:'Rovinietă',icon:'🛣️',color:S.amber,bg:S.amberBg},{key:'casco',label:'CASCO',icon:'🔒',color:S.purple,bg:S.purpleBg}]

function Modal({title, onClose, children}) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:520,padding:24,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:'#0a1f44'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:20}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AccountPage() {
  const [tab, setTab] = useState('Mașinile mele')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cars, setCars] = useState([])
  const [appointments, setAppointments] = useState([])
  const [history, setHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddCar, setShowAddCar] = useState(false)
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [carForm, setCarForm] = useState({brand:'',model:'',year:'',fuel_type:'',engine_cc:'',horsepower:'',plate_number:'',color:'',current_km:'',chassis_number:'',talon_url:''})
  const [docForm, setDocForm] = useState({type:'itp',expires_at:'',car_id:''})
  const [profileForm, setProfileForm] = useState({full_name:'',phone:'',city:''})
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      const [prof, carsData, aptsData, histData, docsData, reqsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('cars').select('*').eq('user_id', user.id).order('is_default', {ascending:false}),
        supabase.from('appointments').select('*, services(name, city, phone)').eq('user_id', user.id).order('scheduled_date', {ascending:false}),
        supabase.from('service_history').select('*').eq('user_id', user.id).order('date_done', {ascending:false}),
        supabase.from('car_documents').select('*, cars(brand, model, plate_number)').eq('user_id', user.id).order('expires_at', {ascending:true}),
        supabase.from('quote_requests').select('*, offers(id, price_total, status, services(name))').eq('user_id', user.id).order('created_at', {ascending:false}),
      ])
      setProfile(prof.data)
      setProfileForm({full_name:prof.data?.full_name||'',phone:prof.data?.phone||'',city:prof.data?.city||''})
      setCars(carsData.data||[])
      setAppointments(aptsData.data||[])
      setHistory(histData.data||[])
      setDocuments(docsData.data||[])
      setRequests(reqsData.data||[])
      setLoading(false)
    }
    load()
  }, [])

  async function addCar() {
    if (!carForm.brand || !carForm.model) return
    setSaving(true)
    const isFirst = cars.length === 0
    const { data, error } = await supabase.from('cars').insert({
      brand: carForm.brand,
      model: carForm.model,
      year: carForm.year ? parseInt(carForm.year) : null,
      fuel_type: carForm.fuel_type || null,
      engine_cc: carForm.engine_cc || null,
      horsepower: carForm.horsepower ? parseInt(carForm.horsepower) : null,
      plate_number: carForm.plate_number || null,
      color: carForm.color || null,
      current_km: carForm.current_km ? parseInt(carForm.current_km) : null,
      chassis_number: carForm.chassis_number || null,
      talon_url: carForm.talon_url || null,
      is_default: isFirst,
      user_id: user.id
    }).select().single()
    if (error) {
      alert('Eroare la salvare: ' + error.message + '\nAsigurați-vă că ați rulat cars_sql.sql în Supabase!')
      setSaving(false)
      return
    }
    if (data) setCars(prev=>[...prev,data])
    setCarForm({brand:'',model:'',year:'',fuel_type:'',engine_cc:'',horsepower:'',plate_number:'',color:'',current_km:'',chassis_number:'',talon_url:''})
    setShowAddCar(false)
    setSaving(false)
  }

  async function deleteCar(id) {
    await supabase.from('cars').delete().eq('id', id)
    setCars(prev=>prev.filter(c=>c.id!==id))
  }

  async function setDefaultCar(id) {
    await supabase.from('cars').update({is_default:false}).eq('user_id',user.id)
    await supabase.from('cars').update({is_default:true}).eq('id',id)
    setCars(prev=>prev.map(c=>({...c,is_default:c.id===id})))
  }

  async function addDocument() {
    if (!docForm.expires_at) return
    setSaving(true)
    const insertData = {
      type: docForm.type,
      expires_at: docForm.expires_at,
      user_id: user.id,
      car_id: docForm.car_id || null,  // null dacă nu e selectată nicio mașină
    }
    const { data, error } = await supabase
      .from('car_documents')
      .insert(insertData)
      .select('*, cars(brand, model, plate_number)')
      .single()
    if (error) {
      alert('Eroare la salvare: ' + error.message)
      setSaving(false)
      return
    }
    if (data) setDocuments(prev=>[...prev,data])
    setDocForm({type:'itp',expires_at:'',car_id:''})
    setShowAddDoc(false)
    setSaving(false)
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update(profileForm).eq('id', user.id)
    setProfile(prev=>({...prev,...profileForm}))
    setSaving(false); setProfileSaved(true)
    setTimeout(()=>setProfileSaved(false),2500)
  }

  function getDaysUntil(dateStr) { return Math.ceil((new Date(dateStr).getTime()-new Date().getTime())/(1000*60*60*24)) }
  function getDocStatus(expiresAt) {
    const days = getDaysUntil(expiresAt)
    if (days<0) return {label:'Expirat',bg:S.redBg,color:S.red}
    if (days<=30) return {label:`Expiră în ${days} zile`,bg:S.amberBg,color:S.amber}
    return {label:`Valid ${days} zile`,bg:S.greenBg,color:S.green}
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )



  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .acc-input:focus{border-color:${S.blue}!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        .tab-acc:hover{background:#eaf3ff!important;color:${S.blue}!important}
        .doc-types-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
        .doc-modal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
        .acc-tabs{display:flex;background:#fff;border-radius:50px;border:1px solid #e5e7eb;padding:4px;margin-bottom:20px;overflow-x:auto;gap:2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
        @media(max-width:640px){
          .doc-types-grid{grid-template-columns:repeat(2,1fr)!important;}
          .doc-modal-grid{grid-template-columns:repeat(2,1fr)!important;}
          .acc-profile-header{flex-direction:column!important;align-items:flex-start!important;gap:12px!important;}
          .acc-profile-stats{flex-wrap:wrap!important;gap:10px!important;}
        }
      `}</style>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>

        {/* Profile header */}
        <div style={{...card({marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'})}}>
          <div style={{position:'relative',flexShrink:0}}>
            <div onClick={()=>document.getElementById('avatar-upload').click()}
              style={{width:64,height:64,background:'#eaf3ff',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.blue,cursor:'pointer',overflow:'hidden',border:`2px solid ${S.border}`}}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : profile?.full_name?.charAt(0)?.toUpperCase()||'U'}
            </div>
            <div onClick={()=>document.getElementById('avatar-upload').click()}
              style={{position:'absolute',bottom:-4,right:-4,width:22,height:22,background:S.blue,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:11,color:'#fff',border:'2px solid #fff'}}>✏️</div>
            <input id="avatar-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
              const file = e.target.files?.[0]; if(!file||!user) return
              const ext = file.name.split('.').pop()
              const path = `avatars/${user.id}.${ext}`
              const supabaseClient = createClient()
              const {error} = await supabaseClient.storage.from('avatars').upload(path, file, {upsert:true})
              if(!error){
                const {data:{publicUrl}} = supabaseClient.storage.from('avatars').getPublicUrl(path)
                await supabaseClient.from('profiles').update({avatar_url:publicUrl}).eq('id',user.id)
                setProfile(p=>({...p,avatar_url:publicUrl}))
              }
            }}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:2}}>{profile?.full_name||'Utilizator'}</div>
            <div style={{fontSize:13,color:S.muted,marginBottom:8}}>{user?.email} · {profile?.city||'Oraș nespecificat'}</div>
            <div style={{display:'flex',gap:16,fontSize:12,color:S.muted}}>
              <span>🚗 {cars.length} mașini</span>
              <span>📅 {appointments.length} programări</span>
              <span>📋 {requests.length} cereri</span>
            </div>
          </div>
          <button onClick={()=>setTab('Setări cont')} style={btn(false)}>✏️ Editează</button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:20,overflowX:'auto',gap:2,scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={tab===t?'':'tab-acc'}
              style={{flexShrink:0,padding:'8px 16px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:tab===t?S.blue:'transparent',color:tab===t?'#fff':S.muted,fontFamily:"'DM Sans',sans-serif",transition:'all .15s',whiteSpace:'nowrap'}}>
              {t}
            </button>
          ))}
        </div>

        {/* ══ MASINI ══ */}
        {tab==='Mașinile mele'&&(
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy}}>Mașinile mele</h2>
              <button onClick={()=>setShowAddCar(true)} style={btn(true)}>+ Adaugă mașină</button>
            </div>
            {cars.length===0?(
              <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:56,marginBottom:14}}>🚗</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Nu ai nicio mașină salvată</div>
                <p style={{fontSize:13,color:S.muted,marginBottom:20}}>Adaugă mașina ta pentru a face cereri mai rapid.</p>
                <button onClick={()=>setShowAddCar(true)} style={btn(true)}>Adaugă prima mașină</button>
              </div>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(300px,100%),1fr))',gap:14}}>
                {cars.map(car=>(
                  <div key={car.id} style={{...card(),border:`1.5px solid ${car.is_default?S.blue:S.border}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                      <div style={{width:48,height:48,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🚗</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{car.brand} {car.model}</div>
                        <div style={{fontSize:12,color:S.muted}}>{car.year} · {car.fuel_type} · {car.engine_cc}</div>
                      </div>
                      {car.is_default&&<span style={pill('#eaf3ff',S.blue)}>Principală</span>}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                      {[['Nr. înmatriculare',car.plate_number],['Kilometraj',car.current_km?`${parseInt(car.current_km).toLocaleString()} km`:null],['Putere',car.horsepower?`${car.horsepower} CP`:null],['Culoare',car.color]].filter(([,v])=>v).map(([l,v])=>(
                        <div key={l} style={{background:S.bg,borderRadius:10,padding:'8px 10px'}}>
                          <div style={{fontSize:10,color:S.muted,marginBottom:2}}>{l}</div>
                          <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      {!car.is_default&&<button onClick={()=>setDefaultCar(car.id)} style={{...btn(false),flex:1,justifyContent:'center',fontSize:12,padding:'7px 10px'}}>Setează principală</button>}
                      <button onClick={()=>{window.location.href='/home'}} style={{...btn(true),flex:1,justifyContent:'center',fontSize:12,padding:'7px 10px',background:S.yellow,boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}}>Cere ofertă</button>
                      <button onClick={()=>deleteCar(car.id)} style={{padding:'7px 10px',borderRadius:50,border:`1.5px solid ${S.redBg}`,background:S.white,color:'#fca5a5',cursor:'pointer',fontSize:13}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddCar&&(
              <Modal title="Adaugă mașină" onClose={()=>setShowAddCar(false)}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>

                  {/* Brand autocomplete */}
                  <div style={{gridColumn:'1/-1',position:'relative'}}>
                    <label style={lbl}>Marcă *</label>
                    <input className="acc-input" value={carForm.brand}
                      onChange={e=>setCarForm(p=>({...p,brand:e.target.value,model:''}))}
                      placeholder="ex: BMW, Dacia, Volkswagen..."
                      style={inp}/>
                    {carForm.brand.length>=1&&!CAR_BRANDS.some(b=>b.toLowerCase()===carForm.brand.toLowerCase())&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',borderRadius:10,zIndex:50,maxHeight:180,overflowY:'auto',border:`1px solid ${S.border}`,boxShadow:'0 4px 16px rgba(10,31,68,0.1)',marginTop:4}}>
                        {CAR_BRANDS.filter(b=>b.toLowerCase().includes(carForm.brand.toLowerCase())).slice(0,8).map(b=>(
                          <div key={b} onClick={()=>setCarForm(p=>({...p,brand:b,model:''}))}
                            style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:S.navy,borderBottom:`1px solid ${S.border}`}}
                            onMouseEnter={e=>e.currentTarget.style.background='#eaf3ff'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {b}
                          </div>
                        ))}
                        {CAR_BRANDS.filter(b=>b.toLowerCase().includes(carForm.brand.toLowerCase())).length===0&&(
                          <div style={{padding:'9px 14px',fontSize:12,color:S.muted,fontStyle:'italic'}}>Scrie manual marca</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Model autocomplete */}
                  <div style={{gridColumn:'1/-1',position:'relative'}}>
                    <label style={lbl}>Model *</label>
                    <input className="acc-input" value={carForm.model}
                      onChange={e=>setCarForm(p=>({...p,model:e.target.value}))}
                      placeholder={carForm.brand&&CAR_MODELS[carForm.brand]?`ex: ${CAR_MODELS[carForm.brand][0]}`:'Selectează mai întâi marca'}
                      disabled={!carForm.brand}
                      style={{...inp,opacity:carForm.brand?1:0.5}}/>
                    {carForm.brand&&carForm.model.length>=1&&CAR_MODELS[carForm.brand]&&!CAR_MODELS[carForm.brand].includes(carForm.model)&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',borderRadius:10,zIndex:50,maxHeight:180,overflowY:'auto',border:`1px solid ${S.border}`,boxShadow:'0 4px 16px rgba(10,31,68,0.1)',marginTop:4}}>
                        {(CAR_MODELS[carForm.brand]||[]).filter(m=>m.toLowerCase().includes(carForm.model.toLowerCase())).slice(0,8).map(m=>(
                          <div key={m} onClick={()=>setCarForm(p=>({...p,model:m}))}
                            style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:S.navy,borderBottom:`1px solid ${S.border}`}}
                            onMouseEnter={e=>e.currentTarget.style.background='#eaf3ff'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {m}
                          </div>
                        ))}
                        {(CAR_MODELS[carForm.brand]||[]).filter(m=>m.toLowerCase().includes(carForm.model.toLowerCase())).length===0&&(
                          <div style={{padding:'9px 14px',fontSize:12,color:S.muted,fontStyle:'italic'}}>Scrie manual modelul</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* An */}
                  <div>
                    <label style={lbl}>An fabricație</label>
                    <select className="acc-input" value={carForm.year} onChange={e=>setCarForm(p=>({...p,year:e.target.value}))} style={inp}>
                      <option value="">Selectează</option>
                      {Array.from({length:35},(_,i)=>new Date().getFullYear()-i).map(y=>(
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Combustibil */}
                  <div>
                    <label style={lbl}>Combustibil</label>
                    <select className="acc-input" value={carForm.fuel_type} onChange={e=>setCarForm(p=>({...p,fuel_type:e.target.value}))} style={inp}>
                      <option value="">Selectează</option>
                      {FUEL_TYPES.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  {/* Capacitate */}
                  <div>
                    <label style={lbl}>Capacitate</label>
                    <input className="acc-input" value={carForm.engine_cc} onChange={e=>setCarForm(p=>({...p,engine_cc:e.target.value}))} placeholder="ex: 2.0" style={inp}/>
                  </div>

                  {/* Putere */}
                  <div>
                    <label style={lbl}>Putere (CP)</label>
                    <input className="acc-input" type="number" value={carForm.horsepower} onChange={e=>setCarForm(p=>({...p,horsepower:e.target.value}))} placeholder="190" style={inp}/>
                  </div>

                  {/* Nr inmatriculare */}
                  <div>
                    <label style={lbl}>Nr. înmatriculare</label>
                    <input className="acc-input" value={carForm.plate_number} onChange={e=>setCarForm(p=>({...p,plate_number:e.target.value}))} placeholder="B-11-XYZ" style={inp}/>
                  </div>

                  {/* Culoare */}
                  <div>
                    <label style={lbl}>Culoare</label>
                    <input className="acc-input" value={carForm.color} onChange={e=>setCarForm(p=>({...p,color:e.target.value}))} placeholder="Negru" style={inp}/>
                  </div>
                   <div style={{gridColumn:'1/-1'}}>
                    <label style={lbl}>Kilometraj actual</label>
                    <input className="acc-input" type="number" value={carForm.current_km} onChange={e=>setCarForm(p=>({...p,current_km:e.target.value}))} placeholder="87500" style={inp}/>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={lbl}>Serie șasiu (VIN) — opțional</label>
                    <input className="acc-input" value={carForm.chassis_number} onChange={e=>setCarForm(p=>({...p,chassis_number:e.target.value}))} placeholder="ex: WBAWL71080P070281" style={{...inp,letterSpacing:1,textTransform:'uppercase'}}/>
                    <p style={{fontSize:11,color:S.muted,marginTop:4}}>17 caractere · O găsești pe talon sau pe geamul față</p>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={lbl}>Poză talon (opțional)</label>
                    <div style={{border:`1.5px dashed ${S.border}`,borderRadius:12,padding:'16px',textAlign:'center',background:S.bg,cursor:'pointer'}}
                      onClick={()=>document.getElementById('talon-upload')?.click()}>
                      {carForm.talon_url ? (
                        <div>
                          <img src={carForm.talon_url} alt="Talon" style={{maxHeight:120,borderRadius:8,marginBottom:8}}/>
                          <div style={{fontSize:12,color:S.green,fontWeight:600}}>✅ Talon încărcat</div>
                        </div>
                      ):(
                        <div>
                          <div style={{fontSize:32,marginBottom:6}}>📋</div>
                          <div style={{fontSize:13,color:S.muted}}>Click pentru a adăuga poza talonului</div>
                          <div style={{fontSize:11,color:S.muted,marginTop:3}}>JPG, PNG · Max 5MB</div>
                        </div>
                      )}
                    </div>
                    <input id="talon-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
                      const file=e.target.files?.[0]; if(!file) return
                      const supabaseClient=createClient()
                      const path=`talonuri/${user.id}/${Date.now()}.${file.name.split('.').pop()}`
                      const {error}=await supabaseClient.storage.from('avatars').upload(path,file,{upsert:true})
                      if(!error){
                        const {data:{publicUrl}}=supabaseClient.storage.from('avatars').getPublicUrl(path)
                        setCarForm(p=>({...p,talon_url:publicUrl}))
                      }
                    }}/>
                  </div>
                 </div>
                <button onClick={addCar} disabled={saving||!carForm.brand||!carForm.model} style={{...btn(true),width:'100%',justifyContent:'center',marginTop:16,padding:'12px',fontSize:14,opacity:(!carForm.brand||!carForm.model)?.5:1}}>
                  {saving?'Se salvează...':'Salvează mașina'}
                </button>
              </Modal>
            )}
          </div>
        )}

        {/* ══ PROGRAMARI ══ */}
        {tab==='Programări'&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:16}}>Programările mele</h2>
            {appointments.length===0?(
              <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:48,marginBottom:12}}>📅</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Nicio programare</div>
                <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Acceptă o ofertă de service pentru a crea o programare.</p>
                <a href="/oferte" style={{...btn(true),textDecoration:'none',display:'inline-flex'}}>Vezi ofertele mele →</a>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {appointments.map(a=>{
                  const isPast = new Date(a.scheduled_date)<new Date()
                  const STATUS = {in_asteptare:{label:'În așteptare',bg:S.amberBg,color:S.amber},confirmata:{label:'Confirmată',bg:'#dbeafe',color:S.blue},in_lucru:{label:'În lucru',bg:S.purpleBg,color:S.purple},finalizata:{label:'Finalizată',bg:S.greenBg,color:S.green},anulata:{label:'Anulată',bg:S.redBg,color:S.red}}
                  const st = STATUS[a.status]||{label:a.status,bg:S.bg,color:S.muted}
                  return (
                    <div key={a.id} style={{...card(),opacity:isPast?.7:1}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                        <div>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{a.services?.name||'Service auto'}</div>
                          <div style={{fontSize:13,color:S.muted}}>{a.services?.city}</div>
                        </div>
                        <span style={pill(st.bg,st.color)}>{st.label}</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                        <div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
                          <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Data</div>
                          <div style={{fontWeight:600,fontSize:13,color:S.navy}}>📅 {new Date(a.scheduled_date).toLocaleDateString('ro-RO',{weekday:'short',day:'numeric',month:'long'})}</div>
                        </div>
                        <div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
                          <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Interval</div>
                          <div style={{fontWeight:600,fontSize:13,color:S.navy}}>⏰ {a.scheduled_time}</div>
                        </div>
                      </div>
                      {a.notes&&<div style={{fontSize:13,color:S.muted,background:S.bg,borderRadius:10,padding:'10px 12px',marginBottom:12}}>{a.notes}</div>}
                      <div style={{display:'flex',gap:8}}>
                        {a.services?.phone&&<a href={`tel:${a.services.phone}`} style={{...btn(false),flex:1,justifyContent:'center',textDecoration:'none',fontSize:12}}>📞 Sună</a>}
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent((a.services?.name||'')+' '+(a.services?.city||''))}`} target="_blank" style={{...btn(false),flex:1,justifyContent:'center',textDecoration:'none',fontSize:12}}>🗺️ Direcție</a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ ISTORIC ══ */}
        {tab==='Istoric lucrări'&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:16}}>Istoricul lucrărilor</h2>
            {history.length===0?(
              <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:48,marginBottom:12}}>🔧</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.navy,marginBottom:6}}>Niciun istoric</div>
                <p style={{fontSize:13,color:S.muted}}>Lucrările finalizate vor apărea aici automat.</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {history.map(h=>(
                  <div key={h.id} style={card()}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                      <div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:3}}>{h.intervention}</div>
                        <div style={{fontSize:12,color:S.muted}}>
                          {h.date_done?new Date(h.date_done).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}):''}
                          {h.km_at_service?` · ${h.km_at_service.toLocaleString()} km`:''}
                        </div>
                      </div>
                      {h.price&&<div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy}}>{h.price.toLocaleString()} RON</div>}
                    </div>
                    {h.notes&&<p style={{fontSize:13,color:S.muted,background:S.bg,borderRadius:10,padding:'10px 12px'}}>{h.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DOCUMENTE ══ */}
        {tab==='Documente & ITP/RCA'&&(
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy}}>Documente & ITP/RCA</h2>
              <div style={{display:'flex',gap:8}}>
                <a href="/itp-rca?tab=rca" target="_blank"
                  style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:'#dcfce7',color:S.green,borderRadius:50,textDecoration:'none',fontSize:12,fontWeight:700,border:`1px solid ${S.green}30`}}>
                  📄 Compară RCA →
                </a>
                <button onClick={()=>setShowAddDoc(true)} style={btn(true)}>+ Adaugă document</button>
              </div>
            </div>
            <div className="doc-types-grid">
              {DOC_TYPES.map(dt=>{
                const doc = documents.find(d=>d.type===dt.key)
                const status = doc?getDocStatus(doc.expires_at):null
                return (
                  <div key={dt.key} style={{background:doc?status.bg:'#f8f8f8',borderRadius:16,padding:16,border:`1px solid ${doc?dt.color+'30':S.border}`}}>
                    <div style={{fontSize:28,marginBottom:8}}>{dt.icon}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>{dt.label}</div>
                    {doc?(
                      <>
                        <div style={{fontSize:12,fontWeight:700,color:status.color}}>{status.label}</div>
                        <div style={{fontSize:11,color:S.muted,marginTop:2}}>{new Date(doc.expires_at).toLocaleDateString('ro-RO',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </>
                    ):<div style={{fontSize:12,color:S.muted}}>Neadăugat</div>}
                  </div>
                )
              })}
            </div>
            {documents.length===0?(
              <div style={{...card(),textAlign:'center',padding:'40px 20px'}}>
                <div style={{fontSize:48,marginBottom:12}}>📄</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.navy,marginBottom:6}}>Niciun document adăugat</div>
                <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Adaugă datele de expirare pentru remindere automate.</p>
                <button onClick={()=>setShowAddDoc(true)} style={btn(true)}>Adaugă primul document</button>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {documents.map(doc=>{
                  const dt = DOC_TYPES.find(d=>d.key===doc.type)
                  const status = getDocStatus(doc.expires_at)
                  return (
                    <div key={doc.id} style={{...card(),display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',gap:14}}>
                        <div style={{width:44,height:44,background:dt?.bg||S.bg,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{dt?.icon||'📄'}</div>
                        <div>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{dt?.label||doc.type}</div>
                          <div style={{fontSize:12,color:S.muted,marginTop:2}}>{doc.cars?.brand} {doc.cars?.model}{doc.cars?.plate_number?` · ${doc.cars.plate_number}`:''}</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:700,fontSize:13,color:status.color}}>{status.label}</div>
                        <div style={{fontSize:11,color:S.muted,marginTop:2}}>Expiră: {new Date(doc.expires_at).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'})}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {showAddDoc&&(
              <Modal title="Adaugă document" onClose={()=>setShowAddDoc(false)}>
                <div>
                  <label style={lbl}>Tip document</label>
                  <div className="doc-modal-grid">
                    {DOC_TYPES.map(dt=>(
                      <button key={dt.key} onClick={()=>setDocForm(p=>({...p,type:dt.key}))}
                        style={{padding:'12px 6px',borderRadius:12,border:`1.5px solid ${docForm.type===dt.key?dt.color:S.border}`,background:docForm.type===dt.key?dt.bg:S.white,cursor:'pointer',textAlign:'center'}}>
                        <div style={{fontSize:22}}>{dt.icon}</div>
                        <div style={{fontSize:11,fontWeight:700,color:docForm.type===dt.key?dt.color:S.muted,marginTop:4}}>{dt.label}</div>
                      </button>
                    ))}
                  </div>
                  {cars.length>0&&(
                    <div style={{marginBottom:14}}>
                      <label style={lbl}>Mașina</label>
                      <select className="acc-input" value={docForm.car_id} onChange={e=>setDocForm(p=>({...p,car_id:e.target.value}))} style={inp}>
                        <option value="">Selectează mașina</option>
                        {cars.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model}{c.plate_number?` · ${c.plate_number}`:''}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{marginBottom:16}}>
                    <label style={lbl}>Data expirării</label>
                    <input className="acc-input" type="date" value={docForm.expires_at} onChange={e=>setDocForm(p=>({...p,expires_at:e.target.value}))} style={inp}/>
                  </div>
                  <button onClick={addDocument} disabled={saving||!docForm.expires_at} style={{...btn(true),width:'100%',justifyContent:'center',padding:'12px',fontSize:14,opacity:!docForm.expires_at?.5:1}}>
                    {saving?'Se salvează...':'Salvează documentul'}
                  </button>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* ══ OFERTE PRIMITE ══ */}
        {tab==='Oferte primite'&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:16}}>Cererile și ofertele mele</h2>
            {requests.length===0?(
              <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:48,marginBottom:12}}>📋</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.navy,marginBottom:6}}>Nicio cerere</div>
                <a href="/home" style={{...btn(true),textDecoration:'none',display:'inline-flex',background:S.yellow,boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}}>Cere ofertă acum →</a>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {requests.map(req=>(
                  <div key={req.id} style={card()}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{req.car_brand} {req.car_model}{req.car_year?` (${req.car_year})`:''}</div>
                        <div style={{fontSize:13,color:S.muted}}>{req.services?.join(', ')}</div>
                      </div>
                      <span style={pill(req.status==='activa'?'#eaf3ff':req.status==='in_progres'?S.greenBg:S.bg,req.status==='activa'?S.blue:req.status==='in_progres'?S.green:S.muted)}>
                        {req.status==='activa'?'Activă':req.status==='in_progres'?'În progres':req.status}
                      </span>
                    </div>
                    {req.offers&&req.offers.length>0?(
                      <div>
                        <div style={{fontSize:11,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>{req.offers.length} oferte primite</div>
                        {req.offers.map(o=>(
                          <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:S.bg,borderRadius:10,padding:'10px 12px',marginBottom:6}}>
                            <div>
                              <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{o.services?.name}</div>
                              <div style={{fontSize:12,color:S.muted,marginTop:2}}>{o.price_total?`${o.price_total.toLocaleString()} RON`:'Preț negociabil'}</div>
                            </div>
                            <span style={pill(o.status==='acceptata'?S.greenBg:o.status==='refuzata'?S.redBg:'#eaf3ff',o.status==='acceptata'?S.green:o.status==='refuzata'?S.red:S.blue)}>{o.status}</span>
                          </div>
                        ))}
                        <a href="/oferte" style={{fontSize:13,color:S.blue,fontWeight:600,textDecoration:'none',display:'block',marginTop:8}}>Gestionează ofertele →</a>
                      </div>
                    ):(
                      <div style={{fontSize:13,color:S.muted,background:S.bg,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>⏳ Așteptăm oferte de la service-uri...</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ANUNTURILE MELE ══ */}
        {/* ══ SETARI ══ */}
        {tab==='Setări cont'&&(
          <div style={{maxWidth:520}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:16}}>Setările contului</h2>
            <div style={{...card({marginBottom:14})}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>Date personale</h3>
              {[{k:'full_name',l:'Numele complet',p:'Ion Popescu',t:'text'},{k:'phone',l:'Telefon',p:'07xx xxx xxx',t:'tel'},{k:'city',l:'Oraș',p:'București',t:'text'}].map(f=>(
                <div key={f.k} style={{marginBottom:12}}>
                  <label style={lbl}>{f.l}</label>
                  <input className="acc-input" type={f.t} value={profileForm[f.k]} onChange={e=>setProfileForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={inp}/>
                </div>
              ))}
              <div style={{marginBottom:16}}>
                <label style={lbl}>Email</label>
                <input type="email" value={user?.email||''} disabled style={{...inp,background:'#f5f5f5',color:S.muted,cursor:'not-allowed'}}/>
                <p style={{fontSize:11,color:S.muted,marginTop:4}}>Emailul nu poate fi modificat.</p>
              </div>
              <button onClick={saveProfile} disabled={saving} style={{...btn(true),background:profileSaved?S.green:S.blue,opacity:saving?.6:1}}>
                {profileSaved?'✅ Salvat!':saving?'Se salvează...':'Salvează modificările'}
              </button>
            </div>

            <div style={{background:S.redBg,border:`1px solid ${S.red}20`,borderRadius:16,padding:16}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.red,marginBottom:6}}>Zona periculoasă</h3>
              <p style={{fontSize:13,color:S.red,opacity:.8,marginBottom:10}}>Odată șters, contul nu mai poate fi recuperat.</p>
              <button style={{padding:'8px 16px',border:`1.5px solid ${S.red}`,borderRadius:50,color:S.red,background:S.white,cursor:'pointer',fontSize:13,fontWeight:600}}>Șterge contul</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
