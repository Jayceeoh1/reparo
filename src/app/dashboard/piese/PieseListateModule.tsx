// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',amber:'#d97706',amberBg:'#fef3c7',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  purple:'#7c3aed',purpleBg:'#ede9fe',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const btn = (v='primary') => ({display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",border:'none',transition:'all .15s',
  ...(v==='primary'?{background:S.blue,color:'#fff'}:v==='yellow'?{background:S.yellow,color:'#fff'}:v==='red'?{background:S.redBg,color:S.red,border:`1px solid ${S.red}30`}:{background:S.bg,color:S.navy,border:`1px solid ${S.border}`})
})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',boxSizing:'border-box'}
const lbl = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5,fontFamily:"'Sora',sans-serif"}

const CATEGORIES = ['Motor & transmisie','Caroserie','Suspensie & direcție','Frâne','Electrică & electronice','Interior','Combustibil & evacuare','Anvelope & jante','Accesorii','Altele']
const CONDITIONS = [{k:'noua',l:'🟢 Nouă',d:'Piesă nouă, în ambalaj original'},{k:'ca_noua',l:'🔵 Ca nouă',d:'Folosită, stare excelentă'},{k:'buna',l:'🟡 Bună',d:'Stare bună, uzură normală'},{k:'acceptabila',l:'🟠 Acceptabilă',d:'Uzată dar funcțională'}]
const PART_TYPES = [{k:'oem',l:'OEM (Original)'},{k:'aftermarket',l:'Aftermarket'},{k:'second_hand',l:'Second-hand'}]

export default function PieseListateModule({ serviceId }) {
  const [piese, setPiese] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'add' | 'edit'
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const supabase = createClient()

  const emptyForm = {name:'',category:'',part_type:'oem',condition:'noua',price:'',price_negotiable:false,quantity:'1',brand_compat:[],part_number:'',description:'',images:[],is_active:true}
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadPiese() }, [serviceId])

  async function loadPiese() {
    setLoading(true)
    const { data } = await supabase.from('service_parts')
      .select('*').eq('service_id', serviceId).order('created_at', { ascending: false })
    setPiese(data || [])
    setLoading(false)
  }

  async function savePiesa() {
    if (!form.name || !form.category) return
    setSaving(true)
    const payload = {
      service_id: serviceId,
      name: form.name, category: form.category, part_type: form.part_type,
      condition: form.condition, price: form.price ? parseFloat(form.price) : null,
      price_negotiable: form.price_negotiable,
      quantity: parseInt(form.quantity) || 1,
      brand_compat: form.brand_compat,
      part_number: form.part_number || null,
      description: form.description || null,
      images: form.images, is_active: form.is_active,
    }
    if (editItem) {
      await supabase.from('service_parts').update(payload).eq('id', editItem.id)
    } else {
      await supabase.from('service_parts').insert(payload)
    }
    setSaving(false)
    setForm(emptyForm); setEditItem(null); setView('list')
    await loadPiese()
  }

  async function toggleActive(id, current) {
    await supabase.from('service_parts').update({ is_active: !current }).eq('id', id)
    setPiese(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  async function deletePiesa(id) {
    if (!confirm('Ștergi această piesă?')) return
    await supabase.from('service_parts').delete().eq('id', id)
    setPiese(prev => prev.filter(p => p.id !== id))
  }

  async function uploadImg(file) {
    if (!file) return
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `parts/${serviceId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('service-media').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('service-media').getPublicUrl(path)
      setForm(p => ({ ...p, images: [...p.images, publicUrl] }))
    }
    setUploadingImg(false)
  }

  function openEdit(piesa) {
    setForm({
      name: piesa.name, category: piesa.category, part_type: piesa.part_type || 'oem',
      condition: piesa.condition || 'noua', price: piesa.price?.toString() || '',
      price_negotiable: piesa.price_negotiable || false,
      quantity: piesa.quantity?.toString() || '1',
      brand_compat: piesa.brand_compat || [], part_number: piesa.part_number || '',
      description: piesa.description || '', images: piesa.images || [], is_active: piesa.is_active,
    })
    setEditItem(piesa); setView('add')
  }

  const filtered = piese.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCat && p.category !== filterCat) return false
    if (filterStatus === 'activa' && !p.is_active) return false
    if (filterStatus === 'inactiva' && p.is_active) return false
    return true
  })

  const condLabel = (k) => CONDITIONS.find(c=>c.k===k)?.l || k
  const typeLabel = (k) => PART_TYPES.find(t=>t.k===k)?.l || k

  // ── LIST ──────────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .piesa-row:hover{background:#f8faff!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){.piese-filters{flex-direction:column!important}.piese-header{flex-direction:column!important;gap:10px!important}}
      `}</style>

      <div className="piese-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>📦 Piese listate</h1>
          <p style={{fontSize:13,color:S.muted}}>{piese.filter(p=>p.is_active).length} active · {piese.length} total</p>
        </div>
        <button onClick={()=>{setForm(emptyForm);setEditItem(null);setView('add')}} style={btn('primary')}>+ Adaugă piesă</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {icon:'📦',l:'Total piese',v:piese.length,c:S.blue,bg:'#eaf3ff'},
          {icon:'✅',l:'Active',v:piese.filter(p=>p.is_active).length,c:S.green,bg:S.greenBg},
          {icon:'⏸️',l:'Inactive',v:piese.filter(p=>!p.is_active).length,c:S.amber,bg:S.amberBg},
          {icon:'💰',l:'Valoare stoc',v:piese.filter(p=>p.price).reduce((s,p)=>s+(p.price*(p.quantity||1)),0).toLocaleString()+' RON',c:S.purple,bg:S.purpleBg},
        ].map(({icon,l,v,c,bg})=>(
          <div key={l} style={{...card(),background:bg,border:'none',textAlign:'center',padding:14}}>
            <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:c}}>{v}</div>
            <div style={{fontSize:11,color:c,opacity:.8}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="piese-filters" style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Caută piesă..."
          style={{...inp,flex:'1 1 200px',maxWidth:300}}/>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...inp,width:'auto',background:'#fff'}}>
          <option value="">Toate categoriile</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inp,width:'auto',background:'#fff'}}>
          <option value="">Toate statusurile</option>
          <option value="activa">Active</option>
          <option value="inactiva">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:40}}><div style={{width:32,height:32,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/></div>
      ) : filtered.length === 0 ? (
        <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:56,marginBottom:12}}>📦</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:8}}>
            {piese.length===0?'Nicio piesă adăugată':'Niciun rezultat'}
          </div>
          <p style={{fontSize:14,color:S.muted,marginBottom:20}}>
            {piese.length===0?'Adaugă prima piesă din catalogul tău.':'Modifică filtrele pentru a vedea piese.'}
          </p>
          {piese.length===0&&<button onClick={()=>setView('add')} style={btn('primary')}>+ Adaugă prima piesă</button>}
        </div>
      ) : (
        <div style={card({padding:0,overflow:'hidden'})}>
          {/* Header */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px 120px',gap:10,padding:'12px 18px',background:S.bg,borderBottom:`1px solid ${S.border}`,fontSize:10,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8}}>
            <div>Piesă</div><div>Categorie</div><div>Stare / Tip</div><div>Preț</div><div>Stoc</div><div>Acțiuni</div>
          </div>
          {filtered.map((p,i) => (
            <div key={p.id} className="piesa-row" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px 120px',gap:10,padding:'14px 18px',borderBottom:i<filtered.length-1?`1px solid ${S.border}`:'none',alignItems:'center',transition:'background .15s',opacity:p.is_active?1:.6}}>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy,marginBottom:2}}>{p.name}</div>
                {p.part_number&&<div style={{fontSize:11,color:S.muted}}>Nr: {p.part_number}</div>}
                {p.images?.[0]&&<div style={{width:36,height:36,borderRadius:8,overflow:'hidden',marginTop:4}}><img src={p.images[0]} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/></div>}
              </div>
              <div style={{fontSize:12,color:S.muted}}>{p.category}</div>
              <div>
                <div style={{fontSize:11,fontWeight:600,marginBottom:2}}>{condLabel(p.condition)}</div>
                <div style={{fontSize:11,color:S.muted}}>{typeLabel(p.part_type)}</div>
              </div>
              <div>
                {p.price ? (
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:S.navy}}>{p.price.toLocaleString()} RON</div>
                ) : (
                  <div style={{fontSize:12,color:S.muted}}>Negociabil</div>
                )}
              </div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:p.quantity>0?S.green:S.red}}>{p.quantity||0}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <button onClick={()=>openEdit(p)} style={{...btn('ghost'),padding:'5px 10px',fontSize:11}}>✏️</button>
                <button onClick={()=>toggleActive(p.id,p.is_active)} style={{...btn(p.is_active?'ghost':'primary'),padding:'5px 10px',fontSize:11}}>{p.is_active?'⏸':'▶'}</button>
                <button onClick={()=>deletePiesa(p.id)} style={{...btn('red'),padding:'5px 10px',fontSize:11}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── ADD / EDIT ─────────────────────────────────────────────────────────────
  return (
    <div style={{maxWidth:680,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>{setView('list');setEditItem(null);setForm(emptyForm)}} style={{...btn('ghost'),padding:'8px 14px'}}>← Înapoi</button>
        <div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>{editItem?'Editează piesa':'Adaugă piesă nouă'}</h1>
          <p style={{fontSize:13,color:S.muted,margin:0}}>Completează detaliile piesei</p>
        </div>
      </div>

      <div style={card()}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Denumire piesă *</label>
            <input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Alternator, Bară față, Amortizor..."/>
          </div>
          <div>
            <label style={lbl}>Categorie *</label>
            <select style={{...inp,background:'#fff'}} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              <option value="">Selectează categoria</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Tip piesă</label>
            <select style={{...inp,background:'#fff'}} value={form.part_type} onChange={e=>setForm(p=>({...p,part_type:e.target.value}))}>
              {PART_TYPES.map(t=><option key={t.k} value={t.k}>{t.l}</option>)}
            </select>
          </div>

          {/* Condiție */}
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Stare piesă</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              {CONDITIONS.map(c=>(
                <button key={c.k} onClick={()=>setForm(p=>({...p,condition:c.k}))}
                  style={{padding:'10px 12px',borderRadius:10,border:`1.5px solid ${form.condition===c.k?S.blue:S.border}`,background:form.condition===c.k?'#eaf3ff':'#fff',cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:form.condition===c.k?S.blue:S.navy}}>{c.l}</div>
                  <div style={{fontSize:11,color:S.muted}}>{c.d}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Preț (RON)</label>
            <input style={inp} type="number" min="0" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="Ex: 250"/>
            <label style={{display:'flex',alignItems:'center',gap:6,marginTop:6,cursor:'pointer',fontSize:12,color:S.muted}}>
              <input type="checkbox" checked={form.price_negotiable} onChange={e=>setForm(p=>({...p,price_negotiable:e.target.checked}))}/>
              Preț negociabil
            </label>
          </div>
          <div>
            <label style={lbl}>Cantitate în stoc</label>
            <input style={inp} type="number" min="0" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} placeholder="1"/>
          </div>
          <div>
            <label style={lbl}>Număr piesă OEM</label>
            <input style={inp} value={form.part_number} onChange={e=>setForm(p=>({...p,part_number:e.target.value}))} placeholder="Ex: 06A103601P"/>
          </div>
          <div>
            <label style={lbl}>Mărci compatibile</label>
            <input style={inp} value={form.brand_compat.join(', ')} onChange={e=>setForm(p=>({...p,brand_compat:e.target.value.split(',').map(b=>b.trim()).filter(Boolean)}))} placeholder="Ex: VW, Audi, Skoda"/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Descriere</label>
            <textarea style={{...inp,resize:'vertical'}} rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Detalii suplimentare despre piesă..."/>
          </div>

          {/* Status */}
          <div style={{gridColumn:'1/-1'}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))}/>
              <span style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,color:S.navy}}>Piesă activă (vizibilă pentru clienți)</span>
            </label>
          </div>

          {/* Imagini */}
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Fotografii piesă</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {form.images.map((img,i)=>(
                <div key={i} style={{position:'relative',width:80,height:80,borderRadius:10,overflow:'hidden'}}>
                  <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                  <button onClick={()=>setForm(p=>({...p,images:p.images.filter((_,idx)=>idx!==i)}))}
                    style={{position:'absolute',top:2,right:2,width:18,height:18,borderRadius:'50%',background:'rgba(220,38,38,0.9)',border:'none',color:'#fff',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                </div>
              ))}
              <label style={{width:80,height:80,borderRadius:10,border:`2px dashed ${S.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',background:S.bg,fontSize:10,color:S.muted,gap:4}}>
                {uploadingImg?'⏳':'📷'}<span>Adaugă</span>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>uploadImg(e.target.files[0])}/>
              </label>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10,paddingTop:14,borderTop:`1px solid ${S.border}`}}>
          <button onClick={()=>{setView('list');setEditItem(null);setForm(emptyForm)}} style={{...btn('ghost'),flex:'0 0 auto'}}>Anulează</button>
          <button onClick={savePiesa} disabled={!form.name||!form.category||saving}
            style={{...btn('primary'),flex:1,opacity:(!form.name||!form.category||saving)?.6:1}}>
            {saving?'Se salvează...':editItem?'✅ Salvează modificările':'✅ Adaugă piesa în catalog'}
          </button>
        </div>
      </div>
    </div>
  )
}
