// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',amber:'#d97706',amberBg:'#fef3c7',
  purple:'#7c3aed',purpleBg:'#ede9fe',
}
const card = (extra={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra})
const pill = (bg,color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white}
const btnP = (bg=S.blue,shadow='rgba(26,86,219,0.2)') => ({display:'inline-flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',fontFamily:"'DM Sans',sans-serif",background:bg,color:'#fff',boxShadow:`0 2px 8px ${shadow}`,transition:'all .15s'})

const ITP_PRICES = [
  {category:'Autoturism până în 1600cc',price:'90 – 120 lei',duration:'~30 min'},
  {category:'Autoturism 1600 – 2000cc',price:'110 – 140 lei',duration:'~30 min'},
  {category:'Autoturism peste 2000cc',price:'130 – 160 lei',duration:'~30 min'},
  {category:'SUV / Off-road',price:'140 – 180 lei',duration:'~45 min'},
  {category:'Autoutilitară ușoară',price:'160 – 220 lei',duration:'~45 min'},
]

const RCA_TIPS = [
  {icon:'📅',title:'Compară înainte de expirare',desc:'Cu 30 de zile înainte primești cele mai bune oferte.'},
  {icon:'🚗',title:'Puterea motorului contează',desc:'Un motor mai mare = primă RCA mai mare.'},
  {icon:'📍',title:'Județul de înmatriculare',desc:'Județele cu risc mare au prime mai mari.'},
  {icon:'⭐',title:'Clasa bonus-malus',desc:'Fără accidente = reduceri de până la 50% la RCA.'},
]

export default function ItpRcaPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('itp')
  const [carCC, setCarCC] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState(null)
  const [user, setUser] = useState(null)
  const [cars, setCars] = useState([])
  const [docForm, setDocForm] = useState({type:'itp',expires_at:'',car_id:''})
  const [docSaved, setDocSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const {data:{user}} = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const {data:carsData} = await supabase.from('cars').select('*').eq('user_id',user.id)
        setCars(carsData||[])
      }
      const {data} = await supabase.from('services').select('*').eq('has_itp',true).eq('is_active',true).order('rating_avg',{ascending:false}).limit(10)
      setServices(data||[])
      setLoading(false)
    }
    load()
  }, [])

  function calcEstimate() {
    const cc = parseInt(carCC)
    if (!cc) return
    const base = cc<1600?105:cc<2000?125:145
    setEstimatedPrice({min:base-15,max:base+25})
  }

  async function saveDoc() {
    if (!user||!docForm.expires_at) return
    await supabase.from('car_documents').insert({...docForm,user_id:user.id,car_id:docForm.car_id||null})
    setDocSaved(true)
    setTimeout(()=>setDocSaved(false),3000)
  }

  const TABS = [
    {key:'itp',label:'🛡️ ITP'},
    {key:'rca',label:'📄 RCA'},
    {key:'reminder',label:'🔔 Setează reminder'},
  ]

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.svc-row:hover{border-color:${S.blue}!important;box-shadow:0 4px 20px rgba(26,86,219,0.08)!important}`}</style>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'48px 24px 44px',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 12px',borderRadius:50,marginBottom:16,fontFamily:"'Sora',sans-serif"}}>
          🛡️ Documente auto
        </div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(26px,4vw,42px)',color:'#fff',marginBottom:12,letterSpacing:-0.5,lineHeight:1.15}}>
          ITP & RCA — Simplu și rapid
        </h1>
        <p style={{color:'rgba(255,255,255,0.55)',fontSize:'clamp(14px,2vw,16px)',maxWidth:520,margin:'0 auto 28px',lineHeight:1.7}}>
          Găsește service-uri ITP autorizate, calculează costul estimativ și salvează remindere automate.
        </p>
        {/* Tab buttons */}
        <div style={{display:'flex',justifyContent:'center',gap:8,flexWrap:'wrap'}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{padding:'10px 22px',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',fontFamily:"'Sora',sans-serif",background:activeTab===t.key?S.white:'rgba(255,255,255,0.1)',color:activeTab===t.key?S.navy:'rgba(255,255,255,0.8)',boxShadow:activeTab===t.key?'0 4px 16px rgba(0,0,0,0.15)':'none',transition:'all .2s'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'32px 16px'}}>

        {/* ══ ITP ══ */}
        {activeTab==='itp'&&(
          <div>
            {/* Calculator */}
            <div style={card({marginBottom:20})}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:4}}>Calculator preț ITP</h2>
              <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Estimare orientativă — prețul final depinde de service.</p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
                <div style={{flex:1,minWidth:180}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Capacitate cilindrică (cc)</label>
                  <input type="number" value={carCC} onChange={e=>setCarCC(e.target.value)} placeholder="ex: 1995" style={inp}/>
                </div>
                <button onClick={calcEstimate} style={btnP()}>Calculează</button>
              </div>
              {estimatedPrice&&(
                <div style={{marginTop:16,background:'#eaf3ff',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
                  <div style={{fontSize:36}}>💰</div>
                  <div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:28,color:S.blue}}>{estimatedPrice.min} – {estimatedPrice.max} lei</div>
                    <div style={{fontSize:13,color:S.blue,opacity:.7}}>Estimare orientativă · Durată ~30 minute</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tarife */}
            <div style={card({marginBottom:20})}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:16}}>Tarife orientative ITP 2026</h2>
              <div>
                {ITP_PRICES.map((p,i)=>(
                  <div key={p.category} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:i<ITP_PRICES.length-1?`1px solid ${S.border}`:'none'}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14,color:S.navy,marginBottom:2}}>{p.category}</div>
                      <div style={{fontSize:12,color:S.muted}}>⏱️ {p.duration}</div>
                    </div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy}}>{p.price}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,background:S.amberBg,borderRadius:10,padding:'10px 14px',fontSize:12,color:S.amber}}>
                ⚠️ Prețurile sunt orientative și variază în funcție de service și starea mașinii.
              </div>
            </div>

            {/* Service-uri ITP */}
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:14}}>Service-uri ITP autorizate</h2>
            {loading?(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[1,2,3].map(i=><div key={i} style={{...card({height:80}),animation:'pulse 1.5s infinite'}}/>)}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
              </div>
            ):services.length===0?(
              <div style={{...card(),textAlign:'center',padding:'40px 20px',color:S.muted}}>
                <div style={{fontSize:40,marginBottom:10}}>🛡️</div>
                Niciun service ITP înregistrat momentan.
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {services.map(s=>(
                  <a key={s.id} href={`/service/${s.id}`} className="svc-row"
                    style={{...card({padding:16}),display:'flex',alignItems:'center',gap:14,textDecoration:'none',transition:'all .2s'}}>
                    <div style={{width:48,height:48,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🛡️</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{s.name}</div>
                      <div style={{fontSize:12,color:S.muted,marginBottom:5}}>📍 {s.city}{s.address?` · ${s.address}`:''}</div>
                      <div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(star=><span key={star} style={{fontSize:13,color:star<=Math.round(s.rating_avg)?S.yellow:'#e5e7eb'}}>★</span>)}<span style={{fontSize:11,color:S.muted,marginLeft:4}}>({s.rating_count})</span></div>
                    </div>
                    <div style={{flexShrink:0,textAlign:'right'}}>
                      <span style={{...pill('#eaf3ff',S.blue),marginBottom:8,display:'block'}}>ITP autorizat</span>
                      <span style={{fontSize:12,fontWeight:600,color:S.blue}}>Vezi profil →</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ RCA ══ */}
        {activeTab==='rca'&&(
          <div>
            {/* Info RCA */}
            <div style={card({marginBottom:20})}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:8}}>Ce este RCA?</h2>
              <p style={{fontSize:13,color:S.muted,lineHeight:1.7,marginBottom:20}}>
                RCA (Răspundere Civilă Auto) este obligatoriu în România. Acoperă daunele produse altor persoane în caz de accident din vina ta.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:20}}>
                {RCA_TIPS.map(tip=>(
                  <div key={tip.title} style={{background:S.bg,borderRadius:14,padding:16}}>
                    <div style={{fontSize:28,marginBottom:10}}>{tip.icon}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>{tip.title}</div>
                    <div style={{fontSize:12,color:S.muted,lineHeight:1.5}}>{tip.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Redirect broker RCA */}
            <div style={{background:`linear-gradient(135deg,${S.green} 0%,#15803d 100%)`,borderRadius:20,padding:'36px 32px',textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:48,marginBottom:12}}>📄</div>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:'#fff',marginBottom:8,letterSpacing:-0.5}}>
                Compară oferte RCA
              </h2>
              <p style={{color:'rgba(255,255,255,0.7)',fontSize:15,marginBottom:24,maxWidth:440,margin:'0 auto 24px',lineHeight:1.7}}>
                Găsești cea mai bună ofertă RCA în câteva minute. Compară prețuri de la toate asigurătoarele autorizate din România.
              </p>
              <a href="https://www.iasig.ro/?ref=reparo" target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:10,padding:'15px 36px',background:'#fff',color:S.green,borderRadius:50,fontSize:16,fontWeight:800,textDecoration:'none',fontFamily:"'Sora',sans-serif",boxShadow:'0 8px 32px rgba(0,0,0,0.15)',transition:'all .2s'}}>
                Compară oferte RCA →
              </a>
              <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginTop:14}}>
                Ești redirecționat către un partener autorizat ASF
              </div>
            </div>

            {/* Reminder RCA */}
            <div style={{...card(),display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <div style={{width:48,height:48,background:S.amberBg,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🔔</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:3}}>Setează reminder expirare RCA</div>
                <div style={{fontSize:13,color:S.muted}}>Vei fi notificat cu 30 de zile înainte. Gestionezi din contul tău.</div>
              </div>
              <button onClick={()=>setActiveTab('reminder')}
                style={{...btnP(S.amber,'rgba(245,158,11,0.2)'),flexShrink:0}}>
                Setează reminder →
              </button>
            </div>
          </div>
        )}

        {/* ══ REMINDER ══ */}
        {activeTab==='reminder'&&(
          <div style={{maxWidth:480,margin:'0 auto'}}>
            <div style={card()}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:S.navy,marginBottom:6}}>Setează reminder</h2>
              <p style={{fontSize:13,color:S.muted,marginBottom:20}}>Vei fi notificat cu 30 de zile înainte de expirare.</p>

              {!user?(
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <div style={{fontSize:44,marginBottom:12}}>🔔</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Trebuie să fii conectat</div>
                  <p style={{fontSize:13,color:S.muted,marginBottom:16}}>Creează un cont gratuit pentru a seta remindere.</p>
                  <a href="/auth/register" style={{...btnP(),textDecoration:'none',display:'inline-flex'}}>Creează cont gratuit →</a>
                </div>
              ):docSaved?(
                <div style={{textAlign:'center',padding:'32px 0'}}>
                  <div style={{fontSize:56,marginBottom:12}}>✅</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.green,fontSize:16,marginBottom:4}}>Reminder setat cu succes!</div>
                  <p style={{fontSize:13,color:S.muted}}>Vei fi notificat cu 30 de zile înainte de expirare.</p>
                </div>
              ):(
                <div>
                  {/* Tip doc */}
                  <div style={{marginBottom:16}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontFamily:"'Sora',sans-serif"}}>Tip document</label>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[{key:'itp',l:'🛡️ ITP',bg:'#eaf3ff',color:S.blue},{key:'rca',l:'📄 RCA',bg:S.greenBg,color:S.green},{key:'rovinieta',l:'🛣️ Rovinietă',bg:S.amberBg,color:S.amber},{key:'casco',l:'🔒 CASCO',bg:S.purpleBg,color:S.purple}].map(t=>(
                        <button key={t.key} onClick={()=>setDocForm(p=>({...p,type:t.key}))}
                          style={{padding:'12px',borderRadius:12,border:`1.5px solid ${docForm.type===t.key?t.color:S.border}`,background:docForm.type===t.key?t.bg:S.white,cursor:'pointer',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:docForm.type===t.key?t.color:S.muted,transition:'all .15s'}}>
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cars.length>0&&(
                    <div style={{marginBottom:14}}>
                      <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Mașina (opțional)</label>
                      <select value={docForm.car_id} onChange={e=>setDocForm(p=>({...p,car_id:e.target.value}))} style={inp}>
                        <option value="">Selectează mașina</option>
                        {cars.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model}{c.plate_number?` · ${c.plate_number}`:''}</option>)}
                      </select>
                    </div>
                  )}

                  <div style={{marginBottom:20}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Data expirării</label>
                    <input type="date" value={docForm.expires_at} onChange={e=>setDocForm(p=>({...p,expires_at:e.target.value}))} style={inp}/>
                  </div>

                  <button onClick={saveDoc} disabled={!docForm.expires_at}
                    style={{...btnP(S.yellow,'rgba(245,158,11,0.2)'),width:'100%',justifyContent:'center',padding:'13px',fontSize:14,opacity:!docForm.expires_at?.5:1}}>
                    🔔 Setează reminder gratuit
                  </button>
                  <p style={{fontSize:12,color:S.muted,textAlign:'center',marginTop:12}}>
                    Poți gestiona documentele din <a href="/account" style={{color:S.blue,fontWeight:600,textDecoration:'none'}}>Contul meu</a>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
