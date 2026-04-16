// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',greenBg:'#dcfce7',
  red:'#dc2626',redBg:'#fee2e2',amber:'#d97706',amberBg:'#fef3c7',
}

const inp = {width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white,boxSizing:'border-box',transition:'border-color .2s'}
const lbl = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}

const CATEGORIES = [
  {key:'piese_motor',label:'Piese motor',icon:'⚙️'},
  {key:'caroserie',label:'Caroserie & vopsitorie',icon:'🚘'},
  {key:'frane',label:'Frâne & suspensie',icon:'🔴'},
  {key:'anvelope',label:'Anvelope & jante',icon:'⭕'},
  {key:'electricitate',label:'Electricitate & electronice',icon:'⚡'},
  {key:'interior',label:'Interior & accesorii',icon:'🪑'},
  {key:'unelte',label:'Unelte & echipamente',icon:'🛠️'},
  {key:'altele',label:'Altele',icon:'📦'},
]

const CONDITIONS = [
  {key:'nou',label:'Nou — niciodată folosit',color:S.green,bg:S.greenBg},
  {key:'ca_nou',label:'Ca nou — folosit puțin',color:S.blue,bg:'#eaf3ff'},
  {key:'bun',label:'Stare bună — uzură normală',color:S.amber,bg:S.amberBg},
  {key:'acceptabil',label:'Acceptabil — uzură vizibilă',color:S.muted,bg:S.bg},
]

export default function CreateListingPage() {
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({
    title:'', category:'', condition:'', price:'', negotiable:false,
    description:'', compatible_brands:'', compatible_models:'',
    part_number:'', city:'București', phone_contact:'',
    delivery:false, delivery_price:'',
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      // Verificăm dacă userul are un service — doar service-urile pot adăuga anunțuri
      const { data: svc } = await supabase.from('services').select('id').eq('owner_id', user.id).single()
      if (!svc) { window.location.href = '/home'; return }
    }
    load()
  }, [])

  async function uploadPhoto(file) {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const {error} = await supabase.storage.from('listing-media').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) { console.error('Storage upload error:', error.message); throw error }
    const {data:{publicUrl}} = supabase.storage.from('listing-media').getPublicUrl(path)
    console.log('Uploaded photo:', publicUrl)
    return publicUrl
  }

  async function handlePhotos(files) {
    if (!files.length) return
    setUploadingPhotos(true)
    const urls = []
    for (const file of Array.from(files).slice(0, 10)) {
      try { urls.push(await uploadPhoto(file)) } catch(e) { console.error(e) }
    }
    setPhotos(prev => [...prev, ...urls])
    setUploadingPhotos(false)
  }

  function removePhoto(idx) {
    setPhotos(prev => prev.filter((_,i) => i !== idx))
  }

  function movePhoto(from, to) {
    setPhotos(prev => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  async function publish() {
    if (!form.title || !form.category || !form.condition || !form.city) return
    setSaving(true)
    const {data, error} = await supabase.from('listings').insert({
      user_id: user.id,
      title: form.title,
      category: form.category,
      condition: form.condition,
      price: form.price ? parseFloat(form.price) : null,
      negotiable: form.negotiable,
      description: form.description,
      compatible_brands: form.compatible_brands ? form.compatible_brands.split(',').map(s=>s.trim()).filter(Boolean) : null,
      compatible_models: form.compatible_models ? form.compatible_models.split(',').map(s=>s.trim()).filter(Boolean) : null,
      part_number: form.part_number || null,
      city: form.city,
      phone_contact: form.phone_contact || null,
      delivery: form.delivery,
      delivery_price: form.delivery && form.delivery_price ? parseFloat(form.delivery_price) : null,
      status: 'activ',
    }).select().single()

    if (error) { alert('Eroare: ' + error.message); setSaving(false); return }

    if (data && photos.length > 0) {
      const { error: mediaError } = await supabase.from('listing_media').insert(
        photos.map((url, i) => ({ listing_id: data.id, url, is_cover: i === 0, sort_order: i }))
      )
      if (mediaError) console.error('listing_media error:', mediaError.message, mediaError)
    }
    setSaving(false)
    setDone(true)
  }

  if (done) return (
    <div style={{minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:S.white,borderRadius:20,padding:40,textAlign:'center',maxWidth:440,width:'100%',boxShadow:'0 8px 40px rgba(10,31,68,0.1)'}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:8}}>Anunț publicat!</h2>
        <p style={{fontSize:14,color:S.muted,marginBottom:24}}>Anunțul tău este acum vizibil pentru toți utilizatorii Reparo.</p>
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          <a href="/listing" style={{padding:'11px 22px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>
            Vezi anunțurile →
          </a>
          <button onClick={()=>{setDone(false);setStep(1);setForm({title:'',category:'',condition:'',price:'',negotiable:false,description:'',compatible_brands:'',compatible_models:'',part_number:'',city:'București',phone_contact:'',delivery:false,delivery_price:''});setPhotos([])}}
            style={{padding:'11px 22px',background:S.bg,color:S.navy,border:`1px solid ${S.border}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
            Adaugă alt anunț
          </button>
        </div>
      </div>
    </div>
  )

  const STEPS = ['Categorie','Detalii','Fotografii','Publicare']

  return (
    <div style={{minHeight:'calc(100vh - 68px)',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.lst-inp:focus{border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        @media(max-width:768px){
          .create-header{flex-direction:column!important;gap:8px!important;padding:10px 14px!important}
          .create-progress{overflow-x:auto!important;scrollbar-width:none!important}
          .create-progress::-webkit-scrollbar{display:none}
          .create-content{padding:16px 12px!important}
          .create-cat-grid{grid-template-columns:1fr 1fr!important;gap:10px!important}
          .create-details-grid{grid-template-columns:1fr!important}
          .create-photo-grid{grid-template-columns:repeat(2,1fr)!important}
          .create-preview-grid{grid-template-columns:1fr!important}
          .create-btns{flex-direction:row!important;gap:8px!important}
          .create-cat-btn{padding:12px!important}
          .create-cond-label{padding:10px 12px!important;font-size:13px!important}
        }`}</style>

      {/* Header */}
      <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'12px 24px',display:'flex',alignItems:'center',gap:16,position:'sticky',top:68,zIndex:50}}>
        <a href="/listing" style={{color:S.muted,textDecoration:'none',fontSize:13,display:'flex',alignItems:'center',gap:4}}>← Înapoi</a>
        <div style={{flex:1}}>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,margin:0}}>Adaugă anunț nou</h1>
        </div>
        {/* Progress steps */}
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {STEPS.map((s,i) => (
            <div key={s} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif",background:i+1<step?S.green:i+1===step?S.blue:'#e5e7eb',color:i+1<=step?'#fff':S.muted,transition:'all .2s',flexShrink:0}}>
                {i+1<step?'✓':i+1}
              </div>
              <span className="hide-mob" style={{fontSize:11,color:i+1===step?S.navy:S.muted,fontWeight:i+1===step?600:400}}>{s}</span>
              {i<3&&<div style={{width:16,height:1,background:i+1<step?S.green:'#e5e7eb'}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:680,margin:'0 auto',padding:'28px 16px'}}>

        {/* STEP 1 — Categorie */}
        {step===1&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Ce vinzi?</h2>
            <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Alege categoria potrivită pentru produsul tău.</p>
            <div className="create-cat-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
              {CATEGORIES.map(c=>(
                <button key={c.key} onClick={()=>setForm(p=>({...p,category:c.key}))}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'16px',borderRadius:14,border:`2px solid ${form.category===c.key?S.blue:S.border}`,background:form.category===c.key?'#eaf3ff':S.white,cursor:'pointer',transition:'all .15s',textAlign:'left'}}>
                  <span style={{fontSize:28}}>{c.icon}</span>
                  <span style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:14,color:form.category===c.key?S.blue:S.navy}}>{c.label}</span>
                  {form.category===c.key&&<span style={{marginLeft:'auto',color:S.blue,fontSize:18}}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{marginBottom:20}}>
              <label style={lbl}>Titlu anunț *</label>
              <input className="lst-inp" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                placeholder="ex: Plăcuțe frână față Brembo BMW E90 2008-2012"
                style={inp} maxLength={100}/>
              <div style={{fontSize:11,color:S.muted,marginTop:4,textAlign:'right'}}>{form.title.length}/100</div>
            </div>

            <div style={{marginBottom:24}}>
              <label style={lbl}>Stare *</label>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {CONDITIONS.map(c=>(
                  <button key={c.key} onClick={()=>setForm(p=>({...p,condition:c.key}))}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,border:`1.5px solid ${form.condition===c.key?c.color:S.border}`,background:form.condition===c.key?c.bg:S.white,cursor:'pointer',transition:'all .15s',textAlign:'left'}}>
                    <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${form.condition===c.key?c.color:S.border}`,background:form.condition===c.key?c.color:'transparent',flexShrink:0}}/>
                    <span style={{fontSize:14,color:form.condition===c.key?c.color:S.text,fontWeight:form.condition===c.key?600:400}}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={()=>setStep(2)} disabled={!form.category||!form.title||!form.condition}
              style={{width:'100%',padding:'13px',background:form.category&&form.title&&form.condition?S.blue:'#e5e7eb',color:form.category&&form.title&&form.condition?'#fff':S.muted,border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",transition:'all .2s'}}>
              Continuă →
            </button>
          </div>
        )}

        {/* STEP 2 — Detalii */}
        {step===2&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Detalii produs</h2>
            <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Cu cât mai multe detalii, cu atât mai repede vinzi.</p>

            {/* Pret */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>💰 Preț</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,alignItems:'end',marginBottom:12}}>
                <div>
                  <label style={lbl}>Preț (RON)</label>
                  <input className="lst-inp" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))}
                    placeholder="0" style={inp} min="0"/>
                </div>
                <div style={{paddingBottom:2}}>
                  <label style={{...lbl,marginBottom:10}}>Negociabil</label>
                  <button onClick={()=>setForm(p=>({...p,negotiable:!p.negotiable}))}
                    style={{width:52,height:28,background:form.negotiable?S.green:'#e5e7eb',borderRadius:14,border:'none',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                    <div style={{width:24,height:24,background:'#fff',borderRadius:'50%',position:'absolute',top:2,left:form.negotiable?26:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
                  </button>
                </div>
              </div>
              {form.negotiable&&<div style={{fontSize:12,color:S.green,background:S.greenBg,borderRadius:8,padding:'6px 12px'}}>✓ Prețul este negociabil — vei apărea și în filtrele „negociabil"</div>}
            </div>

            {/* Descriere */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>📝 Descriere</h3>
              <textarea className="lst-inp" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                placeholder="Descrie produsul în detaliu: stare reală, motivul vânzării, ce include, dacă a fost montat..." rows={5}
                style={{...inp,resize:'vertical',minHeight:120}} maxLength={2000}/>
              <div style={{fontSize:11,color:S.muted,marginTop:4,textAlign:'right'}}>{form.description.length}/2000</div>
            </div>

            {/* Compatibilitate */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>🚗 Compatibilitate</h3>
              <div style={{marginBottom:12}}>
                <label style={lbl}>Mărci compatibile (separate prin virgulă)</label>
                <input className="lst-inp" value={form.compatible_brands} onChange={e=>setForm(p=>({...p,compatible_brands:e.target.value}))}
                  placeholder="BMW, Audi, Mercedes-Benz" style={inp}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={lbl}>Modele compatibile</label>
                <input className="lst-inp" value={form.compatible_models} onChange={e=>setForm(p=>({...p,compatible_models:e.target.value}))}
                  placeholder="Seria 3 E90, A4 B8, Clasa C W204" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Cod piesă / Part number (opțional)</label>
                <input className="lst-inp" value={form.part_number} onChange={e=>setForm(p=>({...p,part_number:e.target.value}))}
                  placeholder="ex: 34116794915" style={inp}/>
              </div>
            </div>

            {/* Contact & livrare */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:20}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>📍 Contact & livrare</h3>
              <div className="create-details-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={lbl}>Oraș *</label>
                  <input className="lst-inp" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}
                    placeholder="București" style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Telefon contact</label>
                  <input className="lst-inp" type="tel" value={form.phone_contact} onChange={e=>setForm(p=>({...p,phone_contact:e.target.value}))}
                    placeholder="07xx xxx xxx" style={inp}/>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:S.bg,borderRadius:10}}>
                <button onClick={()=>setForm(p=>({...p,delivery:!p.delivery}))}
                  style={{width:44,height:24,background:form.delivery?S.blue:'#e5e7eb',borderRadius:12,border:'none',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
                  <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',position:'absolute',top:2,left:form.delivery?22:2,transition:'left .2s'}}/>
                </button>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:S.navy}}>Ofer livrare prin curier</div>
                  <div style={{fontSize:11,color:S.muted}}>Vei putea livra produsul prin Fan Courier, DPD etc.</div>
                </div>
              </div>
              {form.delivery&&(
                <div style={{marginTop:10}}>
                  <label style={lbl}>Cost livrare (RON, 0 = gratuit)</label>
                  <input className="lst-inp" type="number" value={form.delivery_price} onChange={e=>setForm(p=>({...p,delivery_price:e.target.value}))}
                    placeholder="0" style={inp} min="0"/>
                </div>
              )}
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(1)} style={{padding:'12px 22px',background:S.white,color:S.muted,border:`1px solid ${S.border}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>← Înapoi</button>
              <button onClick={()=>setStep(3)} disabled={!form.city}
                style={{flex:1,padding:'12px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif"}}>
                Continuă → Adaugă fotografii
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Fotografii */}
        {step===3&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Fotografii</h2>
            <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Adaugă până la 10 poze. Prima poză va fi imaginea principală.</p>

            {/* Upload zone */}
            <div onClick={()=>document.getElementById('photos-input').click()}
              style={{border:`2px dashed ${uploadingPhotos?S.blue:S.border}`,borderRadius:16,padding:'32px 20px',textAlign:'center',cursor:'pointer',marginBottom:16,background:uploadingPhotos?'#eaf3ff':S.white,transition:'all .2s'}}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=S.blue;e.currentTarget.style.background='#eaf3ff'}}
              onDragLeave={e=>{e.currentTarget.style.borderColor=S.border;e.currentTarget.style.background=S.white}}
              onDrop={e=>{e.preventDefault();handlePhotos(e.dataTransfer.files);e.currentTarget.style.borderColor=S.border;e.currentTarget.style.background=S.white}}>
              <div style={{fontSize:48,marginBottom:10}}>{uploadingPhotos?'⏳':'📷'}</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:4}}>
                {uploadingPhotos?'Se încarcă...':`Click sau trage pozele aici`}
              </div>
              <div style={{fontSize:13,color:S.muted}}>JPG, PNG, WebP · max 10 poze · 10MB/poză</div>
              <input id="photos-input" type="file" multiple accept="image/*" style={{display:'none'}} onChange={e=>handlePhotos(e.target.files)}/>
            </div>

            {/* Photo grid */}
            {photos.length>0&&(
              <div>
                <div style={{fontSize:12,color:S.muted,marginBottom:10}}>
                  📌 Trageți pentru a reordona · Prima poză = cover principal
                </div>
                <div className="create-photo-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                  {photos.map((url,i)=>(
                    <div key={url} style={{position:'relative',borderRadius:12,overflow:'hidden',border:`2px solid ${i===0?S.blue:S.border}`,aspectRatio:'4/3',background:'#f0f6ff'}}>
                      <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      {i===0&&<div style={{position:'absolute',top:6,left:6,background:S.blue,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:6,fontFamily:"'Sora',sans-serif"}}>COVER</div>}
                      <button onClick={()=>removePhoto(i)}
                        style={{position:'absolute',top:6,right:6,width:24,height:24,background:'rgba(220,38,38,0.9)',color:'#fff',border:'none',borderRadius:'50%',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                      {i>0&&(
                        <button onClick={()=>movePhoto(i,i-1)}
                          style={{position:'absolute',bottom:6,left:6,width:24,height:24,background:'rgba(10,31,68,0.7)',color:'#fff',border:'none',borderRadius:'50%',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
                      )}
                      {i<photos.length-1&&(
                        <button onClick={()=>movePhoto(i,i+1)}
                          style={{position:'absolute',bottom:6,right:6,width:24,height:24,background:'rgba(10,31,68,0.7)',color:'#fff',border:'none',borderRadius:'50%',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>→</button>
                      )}
                    </div>
                  ))}
                  {photos.length<10&&(
                    <div onClick={()=>document.getElementById('photos-input').click()}
                      style={{borderRadius:12,border:`2px dashed ${S.border}`,aspectRatio:'4/3',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:S.bg,transition:'border-color .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                      <div style={{textAlign:'center',color:S.muted}}>
                        <div style={{fontSize:24,marginBottom:4}}>+</div>
                        <div style={{fontSize:11}}>Adaugă</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(2)} style={{padding:'12px 22px',background:S.white,color:S.muted,border:`1px solid ${S.border}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>← Înapoi</button>
              <button onClick={()=>setStep(4)}
                style={{flex:1,padding:'12px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif"}}>
                {photos.length>0?`Continuă cu ${photos.length} poze →`:'Continuă fără poze →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Preview & Publicare */}
        {step===4&&(
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Previzualizare & Publicare</h2>
            <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Verifică anunțul înainte de a-l publica.</p>

            {/* Preview card */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,overflow:'hidden',marginBottom:20,boxShadow:'0 4px 20px rgba(10,31,68,0.08)'}}>
              {/* Cover */}
              <div style={{height:220,background:'#eaf3ff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                {photos.length>0?(
                  <img src={photos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                ):(
                  <div style={{textAlign:'center',color:S.muted}}>
                    <div style={{fontSize:48,marginBottom:8}}>{CATEGORIES.find(c=>c.key===form.category)?.icon||'📦'}</div>
                    <div style={{fontSize:12}}>Fără poze</div>
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{padding:20}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,flex:1,marginRight:12}}>{form.title}</h3>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,flexShrink:0}}>
                    {form.price?`${parseInt(form.price).toLocaleString('ro-RO')} lei`:form.negotiable?'Negociabil':'Preț negociabil'}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                  {form.category&&<span style={{background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:50}}>{CATEGORIES.find(c=>c.key===form.category)?.label}</span>}
                  {form.condition&&<span style={{background:S.greenBg,color:S.green,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:50}}>{CONDITIONS.find(c=>c.key===form.condition)?.label.split('—')[0].trim()}</span>}
                  {form.negotiable&&<span style={{background:S.amberBg,color:S.amber,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:50}}>Negociabil</span>}
                  {form.delivery&&<span style={{background:S.bg,color:S.muted,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:50}}>🚚 Livrare disponibilă</span>}
                </div>
                {form.description&&<p style={{fontSize:13,color:S.muted,lineHeight:1.6,marginBottom:12}}>{form.description.slice(0,200)}{form.description.length>200?'...':''}</p>}
                {(form.compatible_brands||form.compatible_models)&&(
                  <div style={{background:S.bg,borderRadius:10,padding:'10px 14px',marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Compatibil cu</div>
                    <div style={{fontSize:13,color:S.navy}}>{[form.compatible_brands,form.compatible_models].filter(Boolean).join(' · ')}</div>
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:S.muted}}>
                  <span>📍 {form.city}</span>
                  <span>📸 {photos.length} poze</span>
                </div>
              </div>
            </div>

            {/* Photos preview */}
            {photos.length>1&&(
              <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto'}}>
                {photos.map((url,i)=>(
                  <img key={url} src={url} alt="" style={{width:60,height:60,objectFit:'cover',borderRadius:8,border:`2px solid ${i===0?S.blue:S.border}`,flexShrink:0}}/>
                ))}
              </div>
            )}

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(3)} style={{padding:'12px 22px',background:S.white,color:S.muted,border:`1px solid ${S.border}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>← Editează</button>
              <button onClick={publish} disabled={saving}
                style={{flex:1,padding:'14px',background:saving?'#93c5fd':S.yellow,color:'#fff',border:'none',borderRadius:50,fontSize:16,fontWeight:700,cursor:saving?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(245,158,11,0.3)',transition:'all .2s'}}>
                {saving?'Se publică...':'📢 Publică anunțul gratuit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
