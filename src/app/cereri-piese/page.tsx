// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',amber:'#d97706',amberBg:'#fef3c7',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const btn = (v='primary') => ({display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 18px',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",border:'none',transition:'all .15s',textDecoration:'none',
  ...(v==='primary'?{background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}
    :v==='yellow'?{background:S.yellow,color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.2)'}
    :{background:S.white,color:S.navy,border:`1.5px solid ${S.border}`})
})
const inp = {width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',boxSizing:'border-box',transition:'border-color .2s'}
const lbl = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5,fontFamily:"'Sora',sans-serif"}

const CATEGORIES = ['Motor & transmisie','Caroserie','Suspensie & direcție','Frâne','Electrică & electronice','Interior','Anvelope & jante','Accesorii','Altele']
const PART_TYPES = [{k:'any',l:'Oricare (OEM / Aftermarket)'},{k:'oem',l:'OEM - Original'},{k:'aftermarket',l:'Aftermarket'},{k:'second_hand',l:'Second-hand'}]
const FUELS = ['Benzină','Diesel','Hybrid','Electric','GPL']

export default function CereriPiesePage() {
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'add' | 'detail'
  const [selectedReq, setSelectedReq] = useState(null)
  const [selectedReqOffers, setSelectedReqOffers] = useState([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'all'

  const emptyForm = {car_brand:'',car_model:'',car_year:'',car_fuel:'',car_engine:'',part_name:'',part_category:'',part_type:'any',description:'',budget_max:'',city:'',images:[]}
  const [form, setForm] = useState(emptyForm)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      const { data } = await supabase.from('parts_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function submitRequest() {
    if (!form.car_brand || !form.car_model || !form.part_name) return
    setSaving(true)
    const { data } = await supabase.from('parts_requests').insert({
      user_id: user.id,
      car_brand: form.car_brand, car_model: form.car_model,
      car_year: form.car_year ? parseInt(form.car_year) : null,
      car_fuel: form.car_fuel || null, car_engine: form.car_engine || null,
      part_name: form.part_name, part_category: form.part_category || null,
      part_type: form.part_type,
      description: form.description || null,
      budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
      city: form.city || null,
      images: form.images,
    }).select().single()
    setSaving(false)
    if (data) {
      setRequests(prev => [data, ...prev])
      setForm(emptyForm)
      setView('list')
    }
  }

  async function cancelRequest(id) {
    await supabase.from('parts_requests').update({ status: 'anulata' }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'anulata' } : r))
  }

  async function openDetail(req) {
    setSelectedReq(req)
    const { data } = await supabase.from('parts_offers')
      .select('*, services(id,name,city,logo_url,rating_avg,rating_count,phone)')
      .eq('request_id', req.id).order('price', { ascending: true })
    setSelectedReqOffers(data || [])
    setView('detail')
  }

  async function acceptOffer(offerId, requestId) {
    await supabase.from('parts_offers').update({ status: 'acceptata' }).eq('id', offerId)
    await supabase.from('parts_offers').update({ status: 'refuzata' }).eq('request_id', requestId).neq('id', offerId)
    await supabase.from('parts_requests').update({ status: 'in_progres' }).eq('id', requestId)
    setSelectedReqOffers(prev => prev.map(o => ({ ...o, status: o.id === offerId ? 'acceptata' : 'refuzata' })))
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'in_progres' } : r))
  }

  const statusPill = (s) => {
    const map = {activa:['#eaf3ff',S.blue,'Activă'],in_progres:[S.amberBg,S.amber,'În progres'],rezolvata:[S.greenBg,S.green,'Rezolvată'],anulata:[S.bg,S.muted,'Anulată']}
    const [bg,c,l] = map[s] || [S.bg,S.muted,s]
    return <span style={{background:bg,color:c,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50,fontFamily:"'Sora',sans-serif"}}>{l}</span>
  }

  const filtered = requests.filter(r => activeTab === 'all' || r.status === 'activa' || r.status === 'in_progres')

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── FORM ────────────────────────────────────────────────────────────────
  if (view === 'add') return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif",padding:'24px 16px'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');.inp2:focus{border-color:${S.blue}!important}`}</style>
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <button onClick={()=>setView('list')} style={{...btn('ghost'),padding:'8px 14px'}}>← Înapoi</button>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,margin:0}}>Cere o piesă</h1>
            <p style={{fontSize:13,color:S.muted,margin:0}}>Trimite cererea și magazinele din zona ta îți trimit oferte</p>
          </div>
        </div>

        <div style={card()}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${S.border}`}}>🚗 Date mașină</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <div>
              <label style={lbl}>Marcă mașină *</label>
              <input className="inp2" style={inp} value={form.car_brand} onChange={e=>setForm(p=>({...p,car_brand:e.target.value}))} placeholder="Ex: Volkswagen, BMW, Dacia"/>
            </div>
            <div>
              <label style={lbl}>Model *</label>
              <input className="inp2" style={inp} value={form.car_model} onChange={e=>setForm(p=>({...p,car_model:e.target.value}))} placeholder="Ex: Golf, Logan, Seria 3"/>
            </div>
            <div>
              <label style={lbl}>An fabricație</label>
              <input className="inp2" style={inp} type="number" min="1980" max="2025" value={form.car_year} onChange={e=>setForm(p=>({...p,car_year:e.target.value}))} placeholder="Ex: 2018"/>
            </div>
            <div>
              <label style={lbl}>Combustibil</label>
              <select className="inp2" style={{...inp,background:'#fff'}} value={form.car_fuel} onChange={e=>setForm(p=>({...p,car_fuel:e.target.value}))}>
                <option value="">Selectează</option>
                {FUELS.map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Motor (cc / kW)</label>
              <input className="inp2" style={inp} value={form.car_engine} onChange={e=>setForm(p=>({...p,car_engine:e.target.value}))} placeholder="Ex: 1600 TDI, 2000 TFSI"/>
            </div>
            <div>
              <label style={lbl}>Orașul tău</label>
              <input className="inp2" style={inp} value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="Ex: București"/>
            </div>
          </div>

          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${S.border}`,paddingTop:10,borderTop:`1px solid ${S.border}`}}>📦 Piesa căutată</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>Denumire piesă *</label>
              <input className="inp2" style={inp} value={form.part_name} onChange={e=>setForm(p=>({...p,part_name:e.target.value}))} placeholder="Ex: Alternator, Bară față, Disc frână față..."/>
            </div>
            <div>
              <label style={lbl}>Categorie</label>
              <select className="inp2" style={{...inp,background:'#fff'}} value={form.part_category} onChange={e=>setForm(p=>({...p,part_category:e.target.value}))}>
                <option value="">Selectează categoria</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Tip piesă acceptat</label>
              <select className="inp2" style={{...inp,background:'#fff'}} value={form.part_type} onChange={e=>setForm(p=>({...p,part_type:e.target.value}))}>
                {PART_TYPES.map(t=><option key={t.k} value={t.k}>{t.l}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Buget maxim (RON)</label>
              <input className="inp2" style={inp} type="number" min="0" value={form.budget_max} onChange={e=>setForm(p=>({...p,budget_max:e.target.value}))} placeholder="Opțional"/>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>Detalii suplimentare</label>
              <textarea className="inp2" style={{...inp,resize:'vertical'}} rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Ex: Am nevoie urgentă, piesa să fie OEM, număr șasiu: ..."/>
            </div>
          </div>

          <div style={{background:'#eaf3ff',borderRadius:12,padding:'12px 16px',marginBottom:16,fontSize:13,color:S.blue}}>
            ℹ️ Cererea ta va fi trimisă tuturor magazinelor și parcurilor de dezmembrări din zona ta. Vei primi oferte în maxim 24h.
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setView('list')} style={{...btn('ghost'),flex:'0 0 auto'}}>Anulează</button>
            <button onClick={submitRequest} disabled={!form.car_brand||!form.car_model||!form.part_name||saving}
              style={{...btn('yellow'),flex:1,opacity:(!form.car_brand||!form.car_model||!form.part_name||saving)?.6:1}}>
              {saving?'Se trimite...':'⚡ Trimite cererea gratuit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── DETAIL ───────────────────────────────────────────────────────────────
  if (view === 'detail' && selectedReq) return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif",padding:'24px 16px'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{maxWidth:760,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={()=>setView('list')} style={{...btn('ghost'),padding:'8px 14px'}}>← Înapoi</button>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>{selectedReq.part_name}</h1>
            <p style={{fontSize:12,color:S.muted,margin:0}}>pentru {selectedReq.car_brand} {selectedReq.car_model} {selectedReq.car_year?`(${selectedReq.car_year})`:''}</p>
          </div>
          {statusPill(selectedReq.status)}
        </div>

        {/* Info cerere */}
        <div style={{...card(),marginBottom:16,display:'flex',gap:12,flexWrap:'wrap'}}> 
          {[
            {l:'Piesă',v:selectedReq.part_name},
            {l:'Categorie',v:selectedReq.part_category||'—'},
            {l:'Tip acceptat',v:PART_TYPES.find(t=>t.k===selectedReq.part_type)?.l||'Oricare'},
            {l:'Buget max',v:selectedReq.budget_max?`${selectedReq.budget_max} RON`:'Nedeclarat'},
            {l:'Oraș',v:selectedReq.city||'—'},
          ].map(({l,v})=>(
            <div key={l} style={{background:S.bg,borderRadius:10,padding:'10px 14px',flex:'1 1 120px'}}>
              <div style={{fontSize:10,color:S.muted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:13,fontWeight:600,color:S.navy}}>{v}</div>
            </div>
          ))}
        </div>

        {selectedReq.description&&(
          <div style={{...card({marginBottom:16}),background:S.amberBg,border:`1px solid ${S.amber}30`}}>
            <div style={{fontSize:11,fontWeight:700,color:S.amber,marginBottom:4}}>DETALII CERERE</div>
            <p style={{fontSize:13,color:S.amber,margin:0}}>{selectedReq.description}</p>
          </div>
        )}

        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:12}}>
          Oferte primite ({selectedReqOffers.length})
        </h2>

        {selectedReqOffers.length===0?(
          <div style={{...card(),textAlign:'center',padding:'50px 20px'}}>
            <div style={{fontSize:40,marginBottom:10}}>⏳</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:4}}>Așteptăm oferte</div>
            <p style={{fontSize:13,color:S.muted}}>Magazinele din zona ta vor trimite oferte în curând.</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {selectedReqOffers.map(o=>{
              const svc = o.services
              const isAccepted = o.status==='acceptata'
              const isRefused = o.status==='refuzata'
              return (
                <div key={o.id} style={{...card(),border:`1.5px solid ${isAccepted?S.green:S.border}`,opacity:isRefused?.65:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                    <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,overflow:'hidden',flexShrink:0}}>
                      {svc?.logo_url?<img src={svc.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:'📦'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{svc?.name}</div>
                      <div style={{fontSize:12,color:S.muted}}>📍 {svc?.city} · ⭐ {svc?.rating_avg?.toFixed(1)||'N/A'} ({svc?.rating_count||0})</div>
                    </div>
                    {isAccepted&&<span style={{background:S.greenBg,color:S.green,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50}}>✅ Acceptată</span>}
                    {isRefused&&<span style={{background:S.bg,color:S.muted,fontSize:11,padding:'3px 10px',borderRadius:50}}>Refuzată</span>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
                    {[
                      ['Preț',o.price?`${o.price.toLocaleString()} RON`:'Negociabil',true],
                      ['Tip',o.part_type||'—',false],
                      ['Stare',o.condition||'—',false],
                      ['Livrare',o.delivery_days?`${o.delivery_days} zile`:'—',false],
                      ['Garanție',o.warranty_months>0?`${o.warranty_months} luni`:'—',false],
                    ].slice(0,3).map(([l,v,h])=>(
                      <div key={l} style={{borderRadius:10,padding:'10px',textAlign:'center',background:h?S.navy:S.bg}}>
                        <div style={{fontSize:10,color:h?'rgba(255,255,255,0.5)':S.muted,marginBottom:3}}>{l}</div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:h?'#fff':S.navy}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {o.description&&<p style={{fontSize:13,color:S.text,background:S.bg,padding:'10px 12px',borderRadius:10,margin:'0 0 12px'}}>{o.description}</p>}
                  {o.status==='trimisa'&&(
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>acceptOffer(o.id,selectedReq.id)}
                        style={{...btn('yellow'),flex:1}}>✅ Acceptă oferta</button>
                      {svc?.phone&&<a href={`tel:${svc.phone}`} style={{...btn('ghost'),textDecoration:'none'}}>📞 Sună</a>}
                    </div>
                  )}
                  {isAccepted&&<div style={{background:S.greenBg,borderRadius:10,padding:'10px 14px',textAlign:'center',fontSize:13,color:S.green,fontWeight:600}}>✅ Ai acceptat această ofertă!</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── LIST ─────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>🔍 Cereri piese</h1>
            <p style={{fontSize:13,color:S.muted}}>Caută piese auto și primește oferte de la magazinele din zona ta</p>
          </div>
          <button onClick={()=>setView('add')} style={btn('yellow')}>⚡ Cere o piesă</button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:20,width:'fit-content'}}>
          {[['active','Active'],['all','Toate']].map(([k,l])=>(
            <button key={k} onClick={()=>setActiveTab(k)}
              style={{padding:'7px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',
                background:activeTab===k?S.blue:'transparent',color:activeTab===k?'#fff':S.muted,
                fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
              {l}
            </button>
          ))}
        </div>

        {loading?(
          <div style={{textAlign:'center',padding:40}}><div style={{width:32,height:32,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/></div>
        ):filtered.length===0?(
          <div style={{...card(),textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:72,marginBottom:16}}>🔍</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:8}}>Nicio cerere activă</h2>
            <p style={{fontSize:14,color:S.muted,marginBottom:24,maxWidth:400,margin:'0 auto 24px'}}>Trimite o cerere de piesă și primești oferte de la magazinele din zona ta în câteva ore.</p>
            <button onClick={()=>setView('add')} style={btn('yellow')}>⚡ Cere prima piesă</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map(r=>(
              <div key={r.id} style={{...card(),cursor:'pointer'}} onClick={()=>openDetail(r)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:4}}>{r.part_name}</div>
                    <div style={{fontSize:13,color:S.muted,marginBottom:8}}>🚗 {r.car_brand} {r.car_model} {r.car_year?`(${r.car_year})`:''} · 📍 {r.city||'Oriunde'}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {r.part_category&&<span style={{background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:50}}>{r.part_category}</span>}
                      {r.part_type&&r.part_type!=='any'&&<span style={{background:S.bg,color:S.muted,fontSize:11,padding:'2px 8px',borderRadius:50}}>{PART_TYPES.find(t=>t.k===r.part_type)?.l}</span>}
                      {r.budget_max&&<span style={{background:S.amberBg,color:S.amber,fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:50}}>Max {r.budget_max} RON</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8,flexShrink:0}}>
                    {statusPill(r.status)}
                    <div style={{fontSize:11,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'short'})}</div>
                    {r.status==='activa'&&<button onClick={e=>{e.stopPropagation();cancelRequest(r.id)}} style={{fontSize:11,color:S.red,background:'none',border:'none',cursor:'pointer',padding:0}}>Anulează</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
