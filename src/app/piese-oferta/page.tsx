// @ts-nocheck
'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CAR_BRANDS, CAR_MODELS, FUEL_TYPES, CITIES } from '@/lib/carData'

const S = {
  navy:'#0a1f44', blue:'#1a56db', yellow:'#f59e0b',
  bg:'#f0f6ff', white:'#fff', muted:'#6b7280', border:'#e5e7eb',
  green:'#16a34a', greenBg:'#dcfce7', red:'#dc2626',
}
const inp = {width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,color:S.navy,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white,boxSizing:'border-box' as const}
const lbl = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase' as const,letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}

const CONDITII = ['Nouă — origine','Nouă — aftermarket','Second-hand (SH)','Recondiționată','Orice stare']
const LIVRARE = ['Ridicare personală','Livrare curier','Ambele variante']

type Piesa = {
  id: number
  descriere: string
  cod: string
  poze: string[]
}

export default function PieseOfertaPage() {
  const [user, setUser] = useState(null)
  const [piese, setPiese] = useState<Piesa[]>([{id:1, descriere:'', cod:'', poze:[]}])
  const [masina, setMasina] = useState({brand:'', model:'', year:'', fuel:'', varianta:'', motorizare:'', vin:''})
  const [conditie, setConditie] = useState('')
  const [oras, setOras] = useState('București')
  const [sector, setSector] = useState('')
  const [contact, setContact] = useState({name:'', phone:'', email:''})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [uploading, setUploading] = useState<number|null>(null)
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrands, setShowBrands] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [showOras, setShowOras] = useState(false)
  const fileRefs = useRef<{[key:number]: HTMLInputElement|null}>({})
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('full_name,phone').eq('id',user.id).single()
          .then(({data}) => {
            if (data) setContact(p => ({...p, name:data.full_name||'', phone:data.phone||'', email:user.email||''}))
          })
      }
    })
  }, [])

  function addPiesa() {
    setPiese(p => [...p, {id: Date.now(), descriere:'', cod:'', poze:[]}])
  }

  function removePiesa(id: number) {
    if (piese.length === 1) return
    setPiese(p => p.filter(x => x.id !== id))
  }

  function updatePiesa(id: number, field: string, val: string) {
    setPiese(p => p.map(x => x.id === id ? {...x, [field]: val} : x))
  }

  async function uploadPoza(id: number, file: File) {
    if (!file) return
    setUploading(id)
    const path = `piese-oferta/${Date.now()}-${file.name}`
    const {error} = await supabase.storage.from('avatars').upload(path, file, {upsert:true})
    if (!error) {
      const {data:{publicUrl}} = supabase.storage.from('avatars').getPublicUrl(path)
      setPiese(p => p.map(x => x.id === id ? {...x, poze:[...x.poze, publicUrl]} : x))
    }
    setUploading(null)
  }

  async function submit() {
    if (!piese[0].descriere || !masina.brand || !masina.model || !contact.phone) return
    setSubmitting(true)
    try {
      const {data:{user:u}} = await supabase.auth.getUser()
      await supabase.from('piese_requests').insert({
        user_id: u?.id || null,
        piese: piese.map(p => ({descriere:p.descriere, cod:p.cod, poze:p.poze})),
        car_brand: masina.brand,
        car_model: masina.model,
        car_year: masina.year || null,
        car_fuel: masina.fuel || null,
        car_varianta: masina.varianta || null,
        car_motorizare: masina.motorizare || null,
        car_vin: masina.vin || null,
        conditie: conditie || 'Orice stare',
        city: oras,
        sector: sector || null,
        livrare: LIVRARE[0],
        contact_name: contact.name,
        contact_phone: contact.phone,
        contact_email: contact.email || null,
        status: 'activa',
      })
      setDone(true)
    } catch(e) { console.error(e) }
    setSubmitting(false)
  }

  const canSubmit = piese[0].descriere && masina.brand && masina.model && contact.phone

  if (done) return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg,padding:24}}>
      <div style={{textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:S.navy,marginBottom:10}}>Cererea ta a fost trimisă!</h1>
        <p style={{fontSize:15,color:S.muted,marginBottom:28,lineHeight:1.7}}>
          Parcurile de dezmembrări și furnizorii de piese din zona ta vor răspunde în scurt timp.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/home" style={{padding:'12px 28px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Înapoi acasă</a>
          <button onClick={()=>{setDone(false);setPiese([{id:1,descriere:'',cod:'',poze:[]}]);setMasina({brand:'',model:'',year:'',fuel:'',varianta:'',motorizare:'',vin:''})}}
            style={{padding:'12px 28px',background:'transparent',color:S.blue,border:`1.5px solid ${S.blue}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer'}}>
            Trimite altă cerere
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif",paddingBottom:80}}>
      <style>{`
        .pi-inp:focus{border-color:${S.blue}!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        .ac-item:hover{background:#eaf3ff!important}
        @media(max-width:640px){
          .pi-grid-3{grid-template-columns:1fr!important}
          .pi-grid-2{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'40px 24px 36px',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif"}}>
          🔩 Piese auto & Dezmembrări
        </div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,4vw,36px)',color:'#fff',marginBottom:10,letterSpacing:-0.5}}>
          Cere ofertă piese auto
        </h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:15,maxWidth:500,margin:'0 auto',lineHeight:1.7}}>
          Completează formularul și primești oferte de la parcuri de dezmembrări și furnizori de piese din zona ta.
        </p>
      </div>

      <div style={{maxWidth:720,margin:'0 auto',padding:'28px 16px'}}>

        {/* ── PIESE ── */}
        <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:24,marginBottom:16}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:4}}>Ce piesă cauți?</h2>
          <p style={{fontSize:13,color:S.muted,marginBottom:20}}>Poți adăuga mai multe piese în aceeași cerere.</p>

          {piese.map((piesa, idx) => (
            <div key={piesa.id} style={{marginBottom:20,paddingBottom:20,borderBottom:idx<piese.length-1?`1px solid ${S.border}`:'none'}}>
              {piese.length > 1 && (
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:700,color:S.blue,fontFamily:"'Sora',sans-serif"}}>Piesa #{idx+1}</span>
                  <button onClick={()=>removePiesa(piesa.id)} style={{background:'none',border:'none',cursor:'pointer',color:S.red,fontSize:13,fontWeight:600}}>✕ Elimină</button>
                </div>
              )}

              {/* Descriere */}
              <div style={{marginBottom:12}}>
                <label style={lbl}>Descriere piesă *</label>
                <input className="pi-inp" value={piesa.descriere} onChange={e=>updatePiesa(piesa.id,'descriere',e.target.value)}
                  placeholder="Ex: Bară față Dacia Logan 2005 roșie" style={inp}/>
              </div>

              {/* Cod + Poze */}
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'flex-start'}}>
                <div>
                  <label style={lbl}>Cod piesă sau alte detalii (opțional)</label>
                  <textarea className="pi-inp" value={piesa.cod} onChange={e=>updatePiesa(piesa.id,'cod',e.target.value)}
                    rows={2} placeholder="Codul piesei, număr OEM, alte specificații..."
                    style={{...inp,resize:'none'}}/>
                </div>
                <div>
                  <label style={lbl}>Adaugă poze</label>
                  <button onClick={()=>fileRefs.current[piesa.id]?.click()}
                    style={{padding:'10px 16px',border:`1.5px dashed ${S.border}`,borderRadius:10,background:S.bg,cursor:'pointer',fontSize:13,color:S.muted,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>
                    {uploading===piesa.id ? '⏳' : '📷'} {piesa.poze.length>0?`${piesa.poze.length} poze`:'Adaugă'}
                  </button>
                  <input type="file" accept="image/*" multiple style={{display:'none'}}
                    ref={el=>fileRefs.current[piesa.id]=el}
                    onChange={e=>{Array.from(e.target.files||[]).forEach(f=>uploadPoza(piesa.id,f)); e.target.value=''}}/>
                  {piesa.poze.length>0&&(
                    <div style={{display:'flex',gap:4,marginTop:6,flexWrap:'wrap'}}>
                      {piesa.poze.map((url,i)=>(
                        <img key={i} src={url} alt="" style={{width:40,height:40,borderRadius:6,objectFit:'cover',border:`1px solid ${S.border}`}}/>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button onClick={addPiesa}
            style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',border:`1.5px dashed ${S.blue}`,borderRadius:50,background:'#eaf3ff',color:S.blue,cursor:'pointer',fontSize:13,fontWeight:600}}>
            + Adaugă încă o piesă
          </button>
        </div>

        {/* ── MAȘINA ── */}
        <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:24,marginBottom:16}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:20}}>Mașina</h2>

          <div className="pi-grid-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
            {/* Brand */}
            <div style={{position:'relative'}}>
              <label style={lbl}>Marcă *</label>
              <input className="pi-inp" value={masina.brand}
                onChange={e=>{setMasina(p=>({...p,brand:e.target.value,model:''}));setShowBrands(true)}}
                onFocus={()=>setShowBrands(true)}
                placeholder="ex: Dacia, BMW..."
                style={inp}/>
              {showBrands&&masina.brand.length>=1&&!CAR_BRANDS.some(b=>b.toLowerCase()===masina.brand.toLowerCase())&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',borderRadius:10,zIndex:50,maxHeight:180,overflowY:'auto',border:`1px solid ${S.border}`,boxShadow:'0 4px 16px rgba(10,31,68,0.1)',marginTop:4}}>
                  {CAR_BRANDS.filter(b=>b.toLowerCase().includes(masina.brand.toLowerCase())).slice(0,8).map(b=>(
                    <div key={b} className="ac-item" onClick={()=>{setMasina(p=>({...p,brand:b,model:''}));setShowBrands(false)}}
                      style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:S.navy,borderBottom:`1px solid ${S.border}`}}>
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Model */}
            <div style={{position:'relative'}}>
              <label style={lbl}>Model *</label>
              <input className="pi-inp" value={masina.model}
                onChange={e=>{setMasina(p=>({...p,model:e.target.value}));setShowModels(true)}}
                onFocus={()=>setShowModels(true)}
                placeholder={masina.brand&&CAR_MODELS[masina.brand]?`ex: ${CAR_MODELS[masina.brand][0]}`:'Selectează marca'}
                disabled={!masina.brand}
                style={{...inp,opacity:masina.brand?1:0.5}}/>
              {showModels&&masina.brand&&masina.model.length>=1&&CAR_MODELS[masina.brand]&&!CAR_MODELS[masina.brand].includes(masina.model)&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',borderRadius:10,zIndex:50,maxHeight:180,overflowY:'auto',border:`1px solid ${S.border}`,boxShadow:'0 4px 16px rgba(10,31,68,0.1)',marginTop:4}}>
                  {(CAR_MODELS[masina.brand]||[]).filter(m=>m.toLowerCase().includes(masina.model.toLowerCase())).slice(0,8).map(m=>(
                    <div key={m} className="ac-item" onClick={()=>{setMasina(p=>({...p,model:m}));setShowModels(false)}}
                      style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:S.navy,borderBottom:`1px solid ${S.border}`}}>
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* An */}
            <div>
              <label style={lbl}>An fabricație</label>
              <select className="pi-inp" value={masina.year} onChange={e=>setMasina(p=>({...p,year:e.target.value}))} style={inp}>
                <option value="">-- alege --</option>
                {Array.from({length:35},(_,i)=>new Date().getFullYear()-i).map(y=>(
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pi-grid-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <label style={lbl}>Variantă caroserie</label>
              <input className="pi-inp" value={masina.varianta} onChange={e=>setMasina(p=>({...p,varianta:e.target.value}))}
                placeholder="Ex: Hatchback, Break..." style={inp}/>
            </div>
            <div>
              <label style={lbl}>Motorizare</label>
              <input className="pi-inp" value={masina.motorizare} onChange={e=>setMasina(p=>({...p,motorizare:e.target.value}))}
                placeholder="Ex: 1.5 dCi, 2.0 TDI..." style={inp}/>
            </div>
            <div>
              <label style={lbl}>Serie șasiu (VIN)</label>
              <input className="pi-inp" value={masina.vin} onChange={e=>setMasina(p=>({...p,vin:e.target.value.toUpperCase()}))}
                placeholder="17 caractere" style={{...inp,letterSpacing:1,textTransform:'uppercase'}}/>
            </div>
          </div>
        </div>

        {/* ── CONDITIE + ZONA ── */}
        <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:24,marginBottom:16}}>
          <div className="pi-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

            <div>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>Piesă nouă sau SH?</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {CONDITII.map(c=>(
                  <label key={c} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:`1.5px solid ${conditie===c?S.blue:S.border}`,borderRadius:10,cursor:'pointer',background:conditie===c?'#eaf3ff':S.white,transition:'all .15s'}}>
                    <input type="radio" name="conditie" value={c} checked={conditie===c} onChange={()=>setConditie(c)} style={{accentColor:S.blue,width:16,height:16}}/>
                    <span style={{fontSize:13,fontWeight:conditie===c?600:400,color:conditie===c?S.blue:S.navy}}>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>Zona de livrare</h3>
              <div style={{marginBottom:12,position:'relative'}}>
                <label style={lbl}>Oraș *</label>
                <input className="pi-inp" value={oras} onChange={e=>{setOras(e.target.value);setShowOras(true)}}
                  onFocus={()=>setShowOras(true)} style={inp}/>
                {showOras&&oras.length>=2&&!CITIES.some(c=>c.toLowerCase()===oras.toLowerCase())&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',borderRadius:10,zIndex:50,maxHeight:160,overflowY:'auto',border:`1px solid ${S.border}`,boxShadow:'0 4px 16px rgba(10,31,68,0.1)',marginTop:4}}>
                    {CITIES.filter(c=>c.toLowerCase().includes(oras.toLowerCase())).slice(0,6).map(c=>(
                      <div key={c} className="ac-item" onClick={()=>{setOras(c);setShowOras(false)}}
                        style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:S.navy,borderBottom:`1px solid ${S.border}`}}>
                        📍 {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {oras==='București'&&(
                <div>
                  <label style={lbl}>Sector (opțional)</label>
                  <select className="pi-inp" value={sector} onChange={e=>setSector(e.target.value)} style={inp}>
                    <option value="">-- orice sector --</option>
                    {['Sector 1','Sector 2','Sector 3','Sector 4','Sector 5','Sector 6'].map(s=>(
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:24,marginBottom:24}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:20}}>Date contact</h2>
          <div className="pi-grid-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <div>
              <label style={lbl}>Numele tău</label>
              <input className="pi-inp" value={contact.name} onChange={e=>setContact(p=>({...p,name:e.target.value}))}
                placeholder="Ion Popescu" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Telefon *</label>
              <input className="pi-inp" type="tel" value={contact.phone} onChange={e=>setContact(p=>({...p,phone:e.target.value}))}
                placeholder="07xx xxx xxx" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Email (opțional)</label>
              <input className="pi-inp" type="email" value={contact.email} onChange={e=>setContact(p=>({...p,email:e.target.value}))}
                placeholder="email@exemplu.ro" style={inp}/>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={submitting||!canSubmit}
          style={{width:'100%',padding:'16px',background:canSubmit?S.yellow:'#e5e7eb',color:canSubmit?'#fff':S.muted,border:'none',borderRadius:50,fontSize:16,fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',fontFamily:"'Sora',sans-serif",boxShadow:canSubmit?'0 8px 24px rgba(245,158,11,0.35)':'none',transition:'all .2s'}}>
          {submitting ? 'Se trimite...' : '🔩 Cere ofertă acum!'}
        </button>

        {!canSubmit&&(
          <p style={{textAlign:'center',fontSize:12,color:S.muted,marginTop:10}}>
            Completează: descrierea piesei, marca, modelul și telefonul
          </p>
        )}

      </div>
    </div>
  )
}
