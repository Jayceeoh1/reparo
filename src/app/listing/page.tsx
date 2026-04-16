// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  amber:'#d97706',amberBg:'#fef3c7',purple:'#7c3aed',purpleBg:'#ede9fe',
}

const card = (extra={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra})
const pill = (bg,color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white}
const btnPrimary = {display:'inline-flex',alignItems:'center',gap:6,padding:'10px 20px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',fontFamily:"'DM Sans',sans-serif",background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)',transition:'all .15s'}

const CATEGORIES = [
  {key:'toate',label:'Toate',icon:'📦'},
  {key:'piese',label:'Piese auto',icon:'🔧'},
  {key:'anvelope',label:'Anvelope & jante',icon:'⭕'},
  {key:'accesorii',label:'Accesorii',icon:'🎯'},
  {key:'electronice',label:'Electronice',icon:'💡'},
  {key:'caroserie',label:'Caroserie',icon:'🚘'},
  {key:'motoare',label:'Motoare',icon:'⚙️'},
  {key:'unelte',label:'Unelte',icon:'🛠️'},
  {key:'altele',label:'Altele',icon:'📦'},
]

const CONDITIONS = [
  {key:'nou',label:'Nou',bg:S.greenBg,color:S.green},
  {key:'folosit',label:'Folosit',bg:'#eaf3ff',color:S.blue},
  {key:'reconditionat',label:'Recondiționat',bg:S.amberBg,color:S.amber},
]

function ListingsContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [activeCategory, setActiveCategory] = useState('toate')
  const [sortBy, setSortBy] = useState('recent')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [form, setForm] = useState({title:'',description:'',price:'',category:'piese',condition:'folosit',compatible_brands:'',city:'',phone_contact:''})
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}})=>setUser(user))
    loadListings()
  }, [activeCategory, sortBy])

  async function loadListings() {
    setLoading(true)
    let q = supabase.from('listings').select('id, title, price, city, category, condition, created_at, is_promoted, negotiable, listing_media(url, is_cover)').eq('status','activ')
    if (activeCategory!=='toate') q = q.eq('category', activeCategory)
    if (sortBy==='pret_asc') q = q.order('price',{ascending:true})
    else if (sortBy==='pret_desc') q = q.order('price',{ascending:false})
    else q = q.order('is_promoted',{ascending:false}).order('created_at',{ascending:false})
    const {data} = await q.limit(40)
    let results = data||[]
    if (query) results = results.filter(l=>l.title.toLowerCase().includes(query.toLowerCase()))
    setListings(results)
    setLoading(false)
  }

  async function handleFileUpload(files) {
    if (!user||!files.length) return
    setUploadingFiles(true)
    const urls = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const {error} = await supabase.storage.from('listing-media').upload(path, file)
      if (!error) {
        const {data:{publicUrl}} = supabase.storage.from('listing-media').getPublicUrl(path)
        urls.push(publicUrl)
      }
    }
    setUploadedFiles(prev=>[...prev,...urls])
    setUploadingFiles(false)
  }

  async function addListing() {
    if (!user) { window.location.href='/auth/login'; return }
    setSaving(true)
    const {data} = await supabase.from('listings').insert({
      user_id:user.id,title:form.title,description:form.description,
      price:form.price?parseFloat(form.price):null,category:form.category,
      condition:form.condition,city:form.city,status:'activ',
      compatible_brands:form.compatible_brands?form.compatible_brands.split(',').map(s=>s.trim()):null,
    }).select().single()
    if (data&&uploadedFiles.length>0) {
      await supabase.from('listing_media').insert(uploadedFiles.map((url,i)=>({listing_id:data.id,url,is_cover:i===0,sort_order:i})))
      data.listing_media = uploadedFiles.map((url,i)=>({url,is_cover:i===0}))
    }
    if (data) setListings(prev=>[data,...prev])
    setShowAdd(false); setSaving(false); setUploadedFiles([])
    setForm({title:'',description:'',price:'',category:'piese',condition:'folosit',compatible_brands:'',city:'',phone_contact:''})
  }

  function handleSearch(e) { e.preventDefault(); loadListings() }
  function toggleFav(id) { setFavorites(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n}) }

  const Modal = ({title,onClose,children}) => (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:S.white,borderRadius:20,width:'100%',maxWidth:540,padding:24,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:S.muted,fontSize:20}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.listing-card{text-decoration:none!important;color:inherit!important}.listing-card:hover{border-color:${S.blue}!important;box-shadow:0 4px 20px rgba(26,86,219,0.1)!important}.listing-card *{text-decoration:none!important}.cat-btn:hover{border-color:${S.blue}!important;color:${S.blue}!important}
        @media(max-width:768px){
          .listings-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
          .listing-card{border-radius:12px!important}
          .listing-card-img{height:110px!important}
          .listing-card-body{padding:10px!important}
          .listing-search-bar{flex-direction:row!important}
          .cat-pills{gap:6px!important}
          .cat-pill{padding:6px 12px!important;font-size:11px!important}
          .sort-bar{flex-wrap:wrap!important;gap:8px!important}
        }
        @media(max-width:380px){
          .listings-grid{grid-template-columns:1fr 1fr!important}
        }`}</style>



      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>

        {/* Search + Add button */}
        <div style={{display:'flex',gap:10,marginBottom:20,alignItems:'center'}}>
          <form onSubmit={handleSearch} style={{display:'flex',flex:1,maxWidth:560}}>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Caută piese, anvelope, accesorii..."
              style={{...inp,borderRadius:'50px 0 0 50px',borderRight:'none',padding:'10px 18px',flex:1}}/>
            <button type="submit" style={{padding:'0 18px',background:S.blue,border:'none',borderRadius:'0 50px 50px 0',cursor:'pointer',height:44}}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.6"/><path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </form>

        </div>

        {/* Categorii */}
        <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
          {CATEGORIES.map(c=>(
            <button key={c.key} onClick={()=>setActiveCategory(c.key)} className="cat-btn"
              style={{flexShrink:0,padding:'8px 16px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:`1.5px solid ${activeCategory===c.key?S.blue:S.border}`,background:activeCategory===c.key?'#eaf3ff':S.white,color:activeCategory===c.key?S.blue:S.muted,fontFamily:"'DM Sans',sans-serif",transition:'all .15s',display:'flex',alignItems:'center',gap:6}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{fontSize:14,color:S.muted}}>
            {loading?'Se caută...':<><span style={{fontWeight:700,color:S.navy}}>{listings.length}</span> anunțuri</>}
          </div>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{padding:'8px 14px',borderRadius:50,border:`1.5px solid ${S.border}`,fontSize:13,background:S.white,color:S.navy,fontFamily:"'DM Sans',sans-serif",outline:'none',cursor:'pointer'}}>
            <option value="recent">Cele mai recente</option>
            <option value="pret_asc">Preț crescător</option>
            <option value="pret_desc">Preț descrescător</option>
          </select>
        </div>

        {/* Grid */}
        {loading?(
          <div className="listings-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {[1,2,3,4,5,6].map(i=><div key={i} style={{...card({height:240}),animation:'pulse 1.5s infinite'}}/>)}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
          </div>
        ):listings.length===0?(
          <div style={{...card(),textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:56,marginBottom:14}}>🔍</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Niciun anunț în această categorie</div>
            <button onClick={()=>user?setShowAdd(true):window.location.href='/auth/login'}
              style={{...btnPrimary,background:S.yellow,boxShadow:'0 2px 8px rgba(245,158,11,0.2)',marginTop:8}}>
              Fii primul care adaugă un anunț
            </button>
          </div>
        ):(
          <div className="listings-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {listings.map(l=>{
              const coverImg = l.listing_media?.find(m=>m.is_cover)?.url||l.listing_media?.[0]?.url
              const cond = CONDITIONS.find(c=>c.key===l.condition)
              const daysAgo = Math.floor((new Date().getTime()-new Date(l.created_at).getTime())/(1000*60*60*24))
              return (
                <a key={l.id} href={`/listing/${l.id}`} className="listing-card"
                  style={{background:S.white,borderRadius:14,border:`1px solid ${S.border}`,overflow:'hidden',cursor:'pointer',transition:'all .2s',textDecoration:'none',color:'inherit',display:'block',boxShadow:'0 2px 8px rgba(10,31,68,0.04)'}}>
                  {/* Image */}
                  <div style={{height:150,background:'#eaf3ff',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    {coverImg?(
                      <img src={coverImg} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    ):(
                      <span style={{fontSize:44}}>{CATEGORIES.find(c=>c.key===l.category)?.icon||'📦'}</span>
                    )}
                    {l.is_promoted&&<span style={{position:'absolute',top:8,left:8,background:S.yellow,color:'#fff',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:6,fontFamily:"'Sora',sans-serif"}}>TOP</span>}
                    {cond&&<span style={{...pill(cond.bg,cond.color),position:'absolute',top:8,right:8,fontSize:10}}>{cond.label}</span>}
                    <button onClick={e=>{e.stopPropagation();toggleFav(l.id)}}
                      style={{position:'absolute',bottom:8,right:8,width:30,height:30,background:'rgba(255,255,255,0.92)',borderRadius:'50%',border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'}}>
                      {favorites.has(l.id)?'❤️':'🤍'}
                    </button>
                  </div>
                  <div style={{padding:'12px 14px 14px'}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:S.navy,marginBottom:4}}>
                      {l.price?`${l.price.toLocaleString('ro-RO')} lei`:'Preț negociabil'}
                    </div>
                    <div style={{fontSize:12,color:S.muted,marginBottom:6,lineHeight:1.4,textDecoration:'none',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{l.title}</div>
                    <div style={{fontSize:11,color:S.muted,display:'flex',justifyContent:'space-between'}}>
                      <span>📍 {l.city||'Locație'}</span>
                      <span>{daysAgo===0?'Azi':daysAgo===1?'Ieri':`${daysAgo}z`}</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal detalii anunț */}
      {selected&&(
        <Modal title={selected.title} onClose={()=>setSelected(null)}>
          <div style={{height:200,background:'#eaf3ff',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,overflow:'hidden'}}>
            {selected.listing_media?.[0]?.url?(
              <img src={selected.listing_media[0].url} alt={selected.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            ):<span style={{fontSize:64}}>{CATEGORIES.find(c=>c.key===selected.category)?.icon||'📦'}</span>}
          </div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:28,color:S.navy,marginBottom:16}}>
            {selected.price?`${selected.price.toLocaleString()} lei`:'Preț negociabil'}
          </div>
          {selected.description&&(
            <div style={{background:S.bg,borderRadius:12,padding:'12px 16px',marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Descriere</div>
              <p style={{fontSize:13,color:S.text,lineHeight:1.6}}>{selected.description}</p>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            {selected.condition&&<div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Stare</div>
              <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{CONDITIONS.find(c=>c.key===selected.condition)?.label}</div>
            </div>}
            {selected.city&&<div style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Locație</div>
              <div style={{fontWeight:600,fontSize:13,color:S.navy}}>📍 {selected.city}</div>
            </div>}
            {selected.compatible_brands?.length>0&&<div style={{background:S.bg,borderRadius:10,padding:'10px 12px',gridColumn:'1/-1'}}>
              <div style={{fontSize:10,color:S.muted,marginBottom:2}}>Compatibil cu</div>
              <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{selected.compatible_brands.join(', ')}</div>
            </div>}
          </div>
          <div style={{display:'flex',gap:10}}>
            <a href={`tel:${selected.phone_contact||''}`} style={{...btnPrimary,flex:1,justifyContent:'center',textDecoration:'none',fontSize:14}}>📞 Contactează vânzătorul</a>
            <button onClick={()=>setSelected(null)} style={{padding:'10px 18px',borderRadius:50,border:`1.5px solid ${S.border}`,background:S.white,color:S.muted,cursor:'pointer',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Închide</button>
          </div>
        </Modal>
      )}

      {/* Modal adaugă anunț */}
      {showAdd&&(
        <Modal title="Publică anunț nou" onClose={()=>setShowAdd(false)}>
          <div>
            <div style={{marginBottom:12}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Titlu anunț *</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="ex: Plăcuțe frână față Brembo BMW E90" style={inp}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Categorie</label>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={inp}>
                  {CATEGORIES.filter(c=>c.key!=='toate').map(c=><option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Stare</label>
                <div style={{display:'flex',gap:6}}>
                  {CONDITIONS.map(c=>(
                    <button key={c.key} onClick={()=>setForm(p=>({...p,condition:c.key}))}
                      style={{flex:1,padding:'8px 4px',borderRadius:10,border:`1.5px solid ${form.condition===c.key?c.color:S.border}`,background:form.condition===c.key?c.bg:S.white,color:form.condition===c.key?c.color:S.muted,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif"}}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Preț (lei)</label>
                <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" style={inp}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Oraș</label>
                <input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="București" style={inp}/>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Compatibil cu (mărci, virgulă)</label>
              <input value={form.compatible_brands} onChange={e=>setForm(p=>({...p,compatible_brands:e.target.value}))} placeholder="BMW, Audi, Mercedes" style={inp}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Descriere</label>
              <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Descrie piesa în detaliu..." style={{...inp,resize:'none'}}/>
            </div>
            {/* Upload poze */}
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Fotografii produs</label>
              <div onClick={()=>document.getElementById('listing-photos').click()}
                style={{border:`2px dashed ${S.border}`,borderRadius:12,padding:'20px',textAlign:'center',cursor:'pointer',transition:'border-color .15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                <div style={{fontSize:28,marginBottom:6}}>📷</div>
                <div style={{fontSize:13,color:S.muted}}>{uploadingFiles?'Se încarcă...':'Click pentru a adăuga poze'}</div>
                <div style={{fontSize:11,color:S.muted,marginTop:2}}>JPG, PNG · max 5MB</div>
                <input id="listing-photos" type="file" multiple accept="image/*" style={{display:'none'}} onChange={e=>handleFileUpload(e.target.files)}/>
              </div>
              {uploadedFiles.length>0&&(
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                  {uploadedFiles.map((url,i)=>(
                    <div key={i} style={{position:'relative'}}>
                      <img src={url} alt="" style={{width:60,height:60,objectFit:'cover',borderRadius:10,border:`1px solid ${S.border}`}}/>
                      {i===0&&<span style={{position:'absolute',top:-4,left:-4,background:S.blue,color:'#fff',fontSize:8,padding:'1px 5px',borderRadius:4,fontWeight:700}}>Cover</span>}
                      <button onClick={()=>setUploadedFiles(prev=>prev.filter((_,j)=>j!==i))}
                        style={{position:'absolute',top:-4,right:-4,width:16,height:16,background:S.red,color:'#fff',borderRadius:'50%',fontSize:10,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={addListing} disabled={saving||!form.title}
              style={{...btnPrimary,background:S.yellow,boxShadow:'0 2px 8px rgba(245,158,11,0.2)',width:'100%',justifyContent:'center',padding:'12px',fontSize:14,opacity:!form.title?.5:1}}>
              {saving?'Se publică...':'📢 Publică anunțul gratuit'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f6ff'}}><div style={{width:36,height:36,border:'3px solid #1a56db',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <ListingsContent/>
    </Suspense>
  )
}
