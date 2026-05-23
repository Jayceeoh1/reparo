// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',
  bg:'#f4f6f9',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  amber:'#d97706',amberBg:'#fef3c7',
}

const CATEGORIES = [
  {key:'toate',label:'Toate categoriile',icon:'📦'},
  {key:'piese-noi',label:'Piese noi',icon:'🔵'},
  {key:'dezmembrari',label:'Dezmembrări',icon:'♻️'},
  {key:'anvelope',label:'Anvelope & jante',icon:'⭕'},
  {key:'accesorii',label:'Accesorii',icon:'🎯'},
  {key:'electronice',label:'Electronice auto',icon:'💡'},
  {key:'caroserie',label:'Caroserie',icon:'🚘'},
  {key:'motoare',label:'Motoare & cutii',icon:'⚙️'},
  {key:'unelte',label:'Unelte & utilaje',icon:'🛠️'},
  {key:'altele',label:'Altele',icon:'📦'},
]

const CONDITIONS = [
  {key:'nou',label:'Nou',bg:'#dcfce7',color:'#16a34a'},
  {key:'folosit',label:'Folosit',bg:'#eaf3ff',color:'#1a56db'},
  {key:'reconditionat',label:'Recondiționat',bg:'#fef3c7',color:'#d97706'},
]

const JUDETE = ['Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila','Brașov','București','Buzău','Călărași','Caraș-Severin','Cluj','Constanța','Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara','Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt','Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea','Vâlcea','Vaslui','Vrancea']

// ══ MODAL ADD LISTING — componentă separată ca să nu piardă focus-ul ══
function AddListingModal({ onClose, onAdd, user, supabase }) {
  const [form, setForm] = useState({title:'',description:'',price:'',category:'piese-noi',condition:'folosit',compatible_brands:'',city:'',parts_type:'oem'})
  const [saving, setSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  async function handleFileUpload(files) {
    if (!user||!files.length) return
    setUploadingFiles(true)
    const urls = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const {error} = await supabase.storage.from('listing-media').upload(path,file)
      if (!error) {
        const {data:{publicUrl}} = supabase.storage.from('listing-media').getPublicUrl(path)
        urls.push(publicUrl)
      }
    }
    setUploadedFiles(prev=>[...prev,...urls])
    setUploadingFiles(false)
  }

  async function handleSubmit() {
    if (!user) { window.location.href='/auth/login'; return }
    setSaving(true)
    const {data} = await supabase.from('listings').insert({
      user_id:user.id,title:form.title,description:form.description,
      price:form.price?parseFloat(form.price):null,category:form.category,
      condition:form.condition,city:form.city,status:'activ',parts_type:form.parts_type,
      compatible_brands:form.compatible_brands?form.compatible_brands.split(',').map(s=>s.trim()):null,
    }).select().single()
    if (data&&uploadedFiles.length>0) {
      await supabase.from('listing_media').insert(uploadedFiles.map((url,i)=>({listing_id:data.id,url,is_cover:i===0,sort_order:i})))
    }
    setSaving(false)
    if (data) onAdd(data)
    onClose()
  }

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:520,padding:24,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:'#0a1f44',margin:0}}>Publică anunț nou</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#6b7280',lineHeight:1}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Titlu */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Titlu anunț *</label>
            <input
              value={form.title}
              onChange={e=>setForm(p=>({...p,title:e.target.value}))}
              placeholder="Ex: Faruri BMW Seria 3 E46 2003"
              autoFocus
              style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:"'DM Sans',sans-serif"}}/>
          </div>

          {/* Categorie */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Categorie *</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
              style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:"'DM Sans',sans-serif"}}>
              {CATEGORIES.filter(c=>c.key!=='toate').map(c=>(
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Pret + Oras */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Preț (LEI)</label>
              <input value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" type="number"
                style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Oraș *</label>
              <input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="București"
                style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:"'DM Sans',sans-serif"}}/>
            </div>
          </div>

          {/* Stare */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Stare</label>
            <div style={{display:'flex',gap:8}}>
              {['nou','folosit','reconditionat'].map(c=>(
                <button key={c} type="button" onClick={()=>setForm(p=>({...p,condition:c}))}
                  style={{flex:1,padding:'9px 8px',border:`1.5px solid ${form.condition===c?'#16a34a':'#e5e7eb'}`,borderRadius:10,background:form.condition===c?'#dcfce7':'#fff',cursor:'pointer',fontSize:12,fontWeight:form.condition===c?700:400,color:form.condition===c?'#16a34a':'#374151',fontFamily:"'DM Sans',sans-serif",textTransform:'capitalize'}}>
                  {c==='nou'?'Nou':c==='folosit'?'Folosit':'Recondiționat'}
                </button>
              ))}
            </div>
          </div>

          {/* Tip piesa */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Tip piesă</label>
            <div style={{display:'flex',gap:8}}>
              {[{v:'oem',l:'🔵 OEM'},{v:'aftermarket',l:'🟡 Aftermarket'},{v:'both',l:'Ambele'}].map(t=>(
                <button key={t.v} type="button" onClick={()=>setForm(p=>({...p,parts_type:t.v}))}
                  style={{flex:1,padding:'9px 6px',border:`1.5px solid ${form.parts_type===t.v?'#1a56db':'#e5e7eb'}`,borderRadius:10,background:form.parts_type===t.v?'#eaf3ff':'#fff',cursor:'pointer',fontSize:12,fontWeight:form.parts_type===t.v?700:400,color:form.parts_type===t.v?'#1a56db':'#374151',fontFamily:"'DM Sans',sans-serif"}}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          {/* Marci compatibile */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Compatibil cu (mărci, virgulă)</label>
            <input value={form.compatible_brands} onChange={e=>setForm(p=>({...p,compatible_brands:e.target.value}))}
              placeholder="BMW, Audi, Mercedes"
              style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:"'DM Sans',sans-serif"}}/>
          </div>

          {/* Descriere */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Descriere</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3}
              placeholder="Descrie piesa în detaliu..."
              style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',resize:'vertical',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
          </div>

          {/* Fotografii */}
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Fotografii produs</label>
            <label style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'20px',border:'2px dashed #e5e7eb',borderRadius:10,cursor:'pointer',textAlign:'center'}}>
              <span style={{fontSize:28}}>📷</span>
              <span style={{fontSize:13,color:'#6b7280'}}>{uploadingFiles?'Se încarcă...':uploadedFiles.length>0?`${uploadedFiles.length} foto adăugate`:'Click pentru a adăuga poze'}</span>
              <span style={{fontSize:11,color:'#9ca3af'}}>JPG, PNG · max 5MB</span>
              <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handleFileUpload(e.target.files)} disabled={uploadingFiles}/>
            </label>
            {uploadedFiles.length>0&&(
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                {uploadedFiles.map((url,i)=>(
                  <div key={i} style={{position:'relative',width:56,height:56}}>
                    <img src={url} style={{width:56,height:56,objectFit:'cover',borderRadius:8,border:'1px solid #e5e7eb'}} alt=""/>
                    {i===0&&<span style={{position:'absolute',bottom:0,left:0,right:0,textAlign:'center',fontSize:8,fontWeight:700,background:'rgba(26,86,219,0.85)',color:'#fff',borderRadius:'0 0 7px 7px',padding:'1px 0'}}>Cover</span>}
                    <button onClick={()=>setUploadedFiles(prev=>prev.filter((_,idx)=>idx!==i))}
                      style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'#dc2626',color:'#fff',border:'none',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={saving||!form.title.trim()||!form.city.trim()}
            style={{padding:'13px',background:form.title&&form.city?'#f59e0b':'#e5e7eb',color:form.title&&form.city?'#fff':'#9ca3af',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:form.title&&form.city?'pointer':'not-allowed',fontFamily:"'Sora',sans-serif",marginTop:4}}>
            {saving?'Se publică...':'📣 Publică anunțul gratuit'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ListingsContent() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeCategory, setActiveCategory] = useState('toate')
  const [sortBy, setSortBy] = useState('recent')
  const [query, setQuery] = useState('')
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  const [filterPretMin, setFilterPretMin] = useState('')
  const [filterPretMax, setFilterPretMax] = useState('')
  const [filterJudet, setFilterJudet] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterPartsType, setFilterPartsType] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}})=>setUser(user))
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('categorie')) setActiveCategory(p.get('categorie'))
    }
  }, [])

  useEffect(() => { loadListings() }, [activeCategory, sortBy])

  async function loadListings() {
    setLoading(true)
    let q = supabase.from('listings')
      .select('id,title,price,city,category,condition,created_at,is_promoted,promoted_until,negotiable,parts_type,listing_media(url,is_cover)')
      .eq('status','activ')
    if (activeCategory !== 'toate') q = q.eq('category', activeCategory)
    if (sortBy === 'pret_asc') q = q.order('price',{ascending:true})
    else if (sortBy === 'pret_desc') q = q.order('price',{ascending:false})
    else q = q.order('is_promoted',{ascending:false}).order('created_at',{ascending:false})
    const {data} = await q.limit(80)
    let results = data||[]
    const now = new Date()
    results = results.map(l=>({...l,is_promoted:l.is_promoted&&(!l.promoted_until||new Date(l.promoted_until)>now)}))
    if (query) results = results.filter(l=>l.title.toLowerCase().includes(query.toLowerCase()))
    if (filterCondition) results = results.filter(l=>l.condition===filterCondition)
    if (filterPartsType) results = results.filter(l=>l.parts_type===filterPartsType)
    if (filterJudet) results = results.filter(l=>l.city?.toLowerCase().includes(filterJudet.toLowerCase()))
    if (filterPretMin) results = results.filter(l=>l.price>=parseFloat(filterPretMin))
    if (filterPretMax) results = results.filter(l=>!filterPretMax||l.price<=parseFloat(filterPretMax))
    results.sort((a,b)=>{
      if (a.is_promoted&&!b.is_promoted) return -1
      if (!a.is_promoted&&b.is_promoted) return 1
      if (sortBy==='pret_asc') return (a.price||0)-(b.price||0)
      if (sortBy==='pret_desc') return (b.price||0)-(a.price||0)
      return new Date(b.created_at)-new Date(a.created_at)
    })
    setListings(results)
    setLoading(false)
  }

  function applyFilters() { loadListings(); setShowFilters(false) }
  function resetFilters() { setFilterPretMin('');setFilterPretMax('');setFilterJudet('');setFilterCondition('');setFilterPartsType('');setActiveCategory('toate') }


  const activeFiltersCount = [filterPretMin,filterPretMax,filterJudet,filterCondition,filterPartsType].filter(Boolean).length

  return (
    <div style={{minHeight:'100vh',background:'#f4f6f9',fontFamily:"'DM Sans',sans-serif"}}>
      <style dangerouslySetInnerHTML={{__html:`
        .lst-card{text-decoration:none;color:inherit;display:block;background:#fff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;transition:box-shadow .15s}
        .lst-card:hover{box-shadow:0 4px 16px rgba(26,86,219,0.1);border-color:#1a56db}
        .lst-promoted{border:2px solid #f59e0b!important;box-shadow:0 2px 12px rgba(245,158,11,0.15)!important}
        .cat-item{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:13px;color:#6b7280;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}
        .cat-item:hover,.cat-item.active{background:#eaf3ff;color:#1a56db}
        .cat-item.active{font-weight:700}
        @media(max-width:768px){.lst-layout{flex-direction:column!important}.lst-sidebar{display:none!important}.lst-grid{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}}
      `}}/>

      {/* TOP BAR */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'12px 0',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px',display:'flex',gap:10,alignItems:'center'}}>
          <form onSubmit={e=>{e.preventDefault();loadListings()}} style={{display:'flex',flex:1,maxWidth:560}}>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Caută piese, anvelope, accesorii..."
              style={{flex:1,padding:'10px 16px',border:'1.5px solid #e5e7eb',borderRadius:'50px 0 0 50px',fontSize:13,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
            <button type="submit" style={{padding:'0 18px',background:'#1a56db',border:'none',borderRadius:'0 50px 50px 0',cursor:'pointer',height:42}}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.6"/><path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </form>
          <button onClick={()=>setShowFilters(o=>!o)}
            style={{display:'flex',alignItems:'center',gap:7,padding:'10px 16px',border:`1.5px solid \${activeFiltersCount>0?'#1a56db':'#e5e7eb'}`,borderRadius:50,background:activeFiltersCount>0?'#eaf3ff':'#fff',cursor:'pointer',fontSize:13,fontWeight:600,color:activeFiltersCount>0?'#1a56db':'#0a1f44',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 3h14M3 8h10M6 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Filtre {activeFiltersCount>0&&<span style={{background:'#1a56db',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{activeFiltersCount}</span>}
          </button>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{padding:'9px 14px',border:'1.5px solid #e5e7eb',borderRadius:50,fontSize:13,background:'#fff',color:'#0a1f44',fontFamily:"'DM Sans',sans-serif",outline:'none',cursor:'pointer',flexShrink:0}}>
            <option value="recent">Cele mai recente</option>
            <option value="pret_asc">Preț ↑</option>
            <option value="pret_desc">Preț ↓</option>
          </select>
          <button onClick={()=>user?setShowAdd(true):window.location.href='/auth/login'}
            style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',background:'#f59e0b',color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap',flexShrink:0}}>
            + Adaugă anunț
          </button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      {showFilters&&(
        <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'16px 0',boxShadow:'0 4px 16px rgba(10,31,68,0.08)'}}>
          <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:12}}>
              {[
                {label:'Preț minim (RON)',val:filterPretMin,set:setFilterPretMin,type:'number',ph:'0'},
                {label:'Preț maxim (RON)',val:filterPretMax,set:setFilterPretMax,type:'number',ph:'Orice'},
              ].map(f=>(
                <div key={f.label}>
                  <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>{f.label}</label>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} type={f.type}
                    style={{width:'100%',padding:'8px 12px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Județ</label>
                <select value={filterJudet} onChange={e=>setFilterJudet(e.target.value)}
                  style={{width:'100%',padding:'8px 12px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box'}}>
                  <option value="">Toată România</option>
                  {JUDETE.map(j=><option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Stare</label>
                <select value={filterCondition} onChange={e=>setFilterCondition(e.target.value)}
                  style={{width:'100%',padding:'8px 12px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box'}}>
                  <option value="">Toate</option>
                  <option value="nou">Nouă</option>
                  <option value="folosit">Folosită</option>
                  <option value="reconditionat">Recondiționată</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:6}}>Tip piesă</label>
                <select value={filterPartsType} onChange={e=>setFilterPartsType(e.target.value)}
                  style={{width:'100%',padding:'8px 12px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box'}}>
                  <option value="">Toate</option>
                  <option value="oem">OEM (Originale)</option>
                  <option value="aftermarket">Aftermarket</option>
                  <option value="both">Ambele</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={applyFilters} style={{padding:'9px 22px',background:'#1a56db',color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer'}}>Aplică filtrele</button>
              {activeFiltersCount>0&&<button onClick={()=>{resetFilters();setShowFilters(false)}} style={{padding:'9px 18px',background:'transparent',color:'#6b7280',border:'1.5px solid #e5e7eb',borderRadius:50,fontSize:13,cursor:'pointer'}}>Resetează</button>}
              <button onClick={()=>setShowFilters(false)} style={{padding:'9px 18px',background:'transparent',color:'#6b7280',border:'none',borderRadius:50,fontSize:13,cursor:'pointer',marginLeft:'auto'}}>✕ Închide</button>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:1200,margin:'0 auto',padding:'16px',display:'flex',gap:16,alignItems:'flex-start'}} className="lst-layout">
        {/* SIDEBAR */}
        <div className="lst-sidebar" style={{width:210,flexShrink:0,background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'10px 6px',position:'sticky',top:70}}>
          <div style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,padding:'4px 12px 8px'}}>Categorii</div>
          {CATEGORIES.map(c=>(
            <button key={c.key} onClick={()=>setActiveCategory(c.key)} className={`cat-item\${activeCategory===c.key?' active':''}`}>
              <span style={{fontSize:15}}>{c.icon}</span><span>{c.label}</span>
            </button>
          ))}
          <div style={{height:1,background:'#e5e7eb',margin:'8px 8px'}}/>
          <a href="/piese-oferta" style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderRadius:8,fontSize:13,color:'#d97706',fontWeight:700,textDecoration:'none',background:'#fef3c7'}}>
            🔩 Cere ofertă piese
          </a>
        </div>

        {/* LISTINGS */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:14,color:'#6b7280'}}>
              {loading?'Se caută...':<><span style={{fontWeight:700,color:'#0a1f44'}}>{listings.length}</span> anunțuri</>}
            </div>
            {activeFiltersCount>0&&<button onClick={resetFilters} style={{fontSize:12,color:'#dc2626',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Resetează filtrele ({activeFiltersCount})</button>}
          </div>

          {loading?(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}} className="lst-grid">
              {[1,2,3,4,5,6,7,8].map(i=><div key={i} style={{background:'#fff',borderRadius:8,height:240,border:'1px solid #e5e7eb',animation:'pulse 1.5s infinite'}}/>)}
              <style dangerouslySetInnerHTML={{__html:'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}'}}/>
            </div>
          ):listings.length===0?(
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:'#0a1f44',marginBottom:6}}>Niciun anunț găsit</div>
              <button onClick={()=>user?setShowAdd(true):window.location.href='/auth/login'} style={{padding:'10px 24px',background:'#f59e0b',color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',marginTop:8}}>+ Adaugă anunț</button>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}} className="lst-grid">
              {listings.map(l=>{
                const cover = l.listing_media?.find(m=>m.is_cover)?.url||l.listing_media?.[0]?.url
                const cond = CONDITIONS.find(c=>c.key===l.condition)
                const promoted = l.is_promoted
                const daysAgo = Math.floor((Date.now()-new Date(l.created_at))/(86400000))
                return (
                  <a key={l.id} href={`/listing/\${l.id}`} className={`lst-card\${promoted?' lst-promoted':''}`}>
                    {promoted&&(
                      <div style={{background:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',gap:4,padding:'3px 0'}}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="white"><path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5l-2.6 1.4.5-2.9-2.1-2 2.9-.4z"/></svg>
                        <span style={{fontSize:9,fontWeight:700,color:'#fff',letterSpacing:1}}>PROMOVAT</span>
                      </div>
                    )}
                    <div style={{height:150,background:'#f4f6f9',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {cover?<img src={cover} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:36}}>{CATEGORIES.find(c=>c.key===l.category)?.icon||'📦'}</span>}
                      {cond&&<span style={{position:'absolute',top:6,left:6,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:50,background:cond.bg,color:cond.color}}>{cond.label}</span>}
                      <button onClick={e=>{e.preventDefault();e.stopPropagation();setFavorites(prev=>{const n=new Set(prev);n.has(l.id)?n.delete(l.id):n.add(l.id);return n})}}
                        style={{position:'absolute',top:6,right:6,width:28,height:28,background:'rgba(255,255,255,0.92)',borderRadius:'50%',border:'none',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {favorites.has(l.id)?'❤️':'🤍'}
                      </button>
                    </div>
                    <div style={{padding:'10px 10px 12px'}}>
                      <div style={{fontWeight:800,fontSize:15,color:'#0a1f44',marginBottom:3}}>
                        {l.price?`\${l.price.toLocaleString('ro-RO')} lei`:<span style={{color:'#6b7280',fontSize:13,fontWeight:400}}>Negociabil</span>}
                      </div>
                      <div style={{fontSize:12,color:'#111827',lineHeight:1.4,marginBottom:6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{l.title}</div>
                      <div style={{fontSize:11,color:'#6b7280',display:'flex',justifyContent:'space-between'}}>
                        <span>📍 {l.city||'România'}</span>
                        <span>{daysAgo===0?'Azi':daysAgo===1?'Ieri':`\${daysAgo}z`}</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAdd&&<AddListingModal
        onClose={()=>setShowAdd(false)}
        onAdd={(data)=>setListings(prev=>[{...data,listing_media:[]},  ...prev])}
        user={user}
        supabase={supabase}
      />}
    </div>
  )
}

export default function ListingPage() {
  return <Suspense><ListingsContent/></Suspense>
}
