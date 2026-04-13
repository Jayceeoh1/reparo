// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',greenBg:'#dcfce7',
  red:'#dc2626',redBg:'#fee2e2',amber:'#d97706',amberBg:'#fef3c7',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const pill = (bg,color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white,boxSizing:'border-box'}

const CONDITIONS = {nou:'Nou',ca_nou:'Ca nou',bun:'Stare bună',acceptabil:'Acceptabil',folosit:'Folosit',reconditionat:'Recondiționat'}
const CATEGORIES = {piese_motor:'⚙️ Piese motor',caroserie:'🚘 Caroserie',frane:'🔴 Frâne',anvelope:'⭕ Anvelope',electricitate:'⚡ Electricitate',interior:'🪑 Interior',unelte:'🛠️ Unelte',altele:'📦 Altele'}

function EditModal({ listing, onClose, onSave }) {
  const [form, setForm] = useState({
    title: listing.title || '',
    price: listing.price || '',
    description: listing.description || '',
    city: listing.city || '',
    condition: listing.condition || '',
    category: listing.category || '',
    negotiable: listing.negotiable || false,
    phone_contact: listing.phone_contact || '',
    status: listing.status || 'activ',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('listings').update({
      title: form.title,
      price: form.price ? parseFloat(form.price) : null,
      description: form.description,
      city: form.city,
      condition: form.condition,
      category: form.category,
      negotiable: form.negotiable,
      phone_contact: form.phone_contact,
      status: form.status,
    }).eq('id', listing.id)
    setSaving(false)
    if (!error) onSave({ ...listing, ...form })
  }

  return (
    <style>{`
      @media(max-width:768px){
        .my-listings-header{flex-direction:column!important;align-items:flex-start!important;gap:10px!important}
        .my-listings-header a{width:100%!important;justify-content:center!important}
        .my-listings-stats{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
        .listing-row{flex-direction:row!important}
        .listing-row-photo{width:100px!important;height:90px!important;flex-shrink:0!important}
        .listing-row-info{flex:1!important;min-width:0!important}
        .listing-row-title{font-size:13px!important}
        .listing-row-actions{flex-wrap:wrap!important;gap:6px!important}
        .listing-row-action-btn{padding:5px 10px!important;font-size:11px!important}
      }
      @media(max-width:420px){
        .listing-row{flex-direction:column!important}
        .listing-row-photo{width:100%!important;height:140px!important}
      }`}</style>
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:S.white,borderRadius:20,width:'100%',maxWidth:560,padding:28,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy}}>Editează anunțul</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:S.muted}}>✕</button>
        </div>

        <div style={{display:'grid',gap:12}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Titlu *</label>
            <input className="edit-inp" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={inp}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Preț (RON)</label>
              <input className="edit-inp" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" style={inp}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Oraș</label>
              <input className="edit-inp" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="București" style={inp}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Stare</label>
              <select className="edit-inp" value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))} style={inp}>
                <option value="">Selectează</option>
                {Object.entries(CONDITIONS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Categorie</label>
              <select className="edit-inp" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={inp}>
                <option value="">Selectează</option>
                {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Telefon contact</label>
            <input className="edit-inp" value={form.phone_contact} onChange={e=>setForm(p=>({...p,phone_contact:e.target.value}))} placeholder="07xx xxx xxx" style={inp}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Descriere</label>
            <textarea className="edit-inp" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={4} style={{...inp,resize:'vertical'}}/>
          </div>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
              <input type="checkbox" checked={form.negotiable} onChange={e=>setForm(p=>({...p,negotiable:e.target.checked}))} style={{accentColor:S.blue,width:16,height:16}}/>
              <span style={{color:S.navy,fontWeight:500}}>Preț negociabil</span>
            </label>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
              <input type="checkbox" checked={form.status==='activ'} onChange={e=>setForm(p=>({...p,status:e.target.checked?'activ':'inactiv'}))} style={{accentColor:S.green,width:16,height:16}}/>
              <span style={{color:S.navy,fontWeight:500}}>Anunț activ</span>
            </label>
          </div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={onClose} style={{flex:1,padding:'11px',background:S.bg,color:S.muted,border:`1px solid ${S.border}`,borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer'}}>Anulează</button>
          <button onClick={save} disabled={saving||!form.title}
            style={{flex:2,padding:'11px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",opacity:saving?.6:1}}>
            {saving?'Se salvează...':'✅ Salvează modificările'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyListingsPage() {
  const [user, setUser] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingListing, setEditingListing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('toate')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      const { data } = await supabase.from('listings')
        .select('*, listing_media(url, is_cover)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setListings(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function deleteListing(id) {
    if (!confirm('Ești sigur că vrei să ștergi acest anunț? Acțiunea nu poate fi anulată.')) return
    setDeleting(id)
    await supabase.from('listing_media').delete().eq('listing_id', id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  async function toggleStatus(listing) {
    const newStatus = listing.status === 'activ' ? 'inactiv' : 'activ'
    await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l))
  }

  function onSaved(updated) {
    setListings(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
    setEditingListing(null)
  }

  const filtered = filter === 'toate' ? listings : listings.filter(l => l.status === filter)

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'activ').length,
    inactive: listings.filter(l => l.status !== 'activ').length,
    views: listings.reduce((s, l) => s + (l.views || 0), 0),
  }

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.edit-inp:focus{border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}.lst-row:hover{border-color:#1a56db!important}`}</style>

      <div style={{maxWidth:900,margin:'0 auto',padding:'28px 16px'}}>

        {/* Header */}
        <div className="my-listings-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,gap:12}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,marginBottom:4}}>Anunțurile mele</h1>
            <p style={{fontSize:14,color:S.muted}}>Gestionează, editează și șterge anunțurile tale.</p>
          </div>
          <a href="/listing/create"
            style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',background:S.yellow,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(245,158,11,0.3)'}}>
            + Adaugă anunț nou
          </a>
        </div>

        {/* Stats */}
        <div className="my-listings-stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total anunțuri',value:stats.total,icon:'📋',color:S.blue,bg:'#eaf3ff'},
            {label:'Active',value:stats.active,icon:'✅',color:S.green,bg:S.greenBg},
            {label:'Inactive',value:stats.inactive,icon:'⏸️',color:S.muted,bg:S.bg},
            {label:'Vizualizări totale',value:stats.views,icon:'👁️',color:S.amber,bg:S.amberBg},
          ].map(s=>(
            <div key={s.label} style={card()}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:40,height:40,background:s.bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
                <div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:11,color:S.muted}}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex',background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:16,gap:4,width:'fit-content'}}>
          {[['toate','Toate'],['activ','Active'],['inactiv','Inactive']].map(([val,label])=>(
            <button key={val} onClick={()=>setFilter(val)}
              style={{padding:'8px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:filter===val?S.blue:'transparent',color:filter===val?'#fff':S.muted,fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
              {label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {filtered.length === 0 ? (
          <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:56,marginBottom:14}}>📭</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:8}}>
              {listings.length === 0 ? 'Nu ai niciun anunț publicat' : 'Niciun anunț în această categorie'}
            </div>
            <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Publică primul tău anunț gratuit pe Reparo.</p>
            <a href="/listing/create" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',background:S.yellow,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>
              + Adaugă primul anunț
            </a>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map(l => {
              const coverImg = l.listing_media?.find(m => m.is_cover)?.url || l.listing_media?.[0]?.url
              const daysAgo = Math.floor((new Date().getTime() - new Date(l.created_at).getTime()) / (1000*60*60*24))
              const isActive = l.status === 'activ'
              return (
                <div key={l.id} className="lst-row"
                  style={{...card({padding:0}),overflow:'hidden',border:`1.5px solid ${isActive?S.border:S.border}`,opacity:isActive?1:0.75,transition:'all .2s'}}>
                  <div style={{display:'flex',gap:0}}>
                    {/* Photo */}
                    <div className="listing-row-photo" style={{width:140,height:120,background:'#eaf3ff',flexShrink:0,position:'relative',overflow:'hidden'}}>
                      {coverImg
                        ? <img src={coverImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>
                            {CATEGORIES[l.category]?.split(' ')[0]||'📦'}
                          </div>
                      }
                      {!isActive && (
                        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <span style={{color:'#fff',fontSize:11,fontWeight:700,background:'rgba(0,0,0,0.5)',padding:'3px 8px',borderRadius:6}}>INACTIV</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{flex:1,padding:'14px 16px',display:'flex',flexDirection:'column',justifyContent:'space-between',minWidth:0}}>
                      <div>
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:6}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                              {l.condition&&<span style={pill('#eaf3ff',S.blue)}>{CONDITIONS[l.condition]||l.condition}</span>}
                              {l.category&&<span style={pill(S.bg,S.muted)}>{CATEGORIES[l.category]||l.category}</span>}
                              <span style={pill(isActive?S.greenBg:S.redBg,isActive?S.green:S.red)}>
                                {isActive?'● Activ':'● Inactiv'}
                              </span>
                            </div>
                          </div>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,flexShrink:0}}>
                            {l.price ? `${l.price.toLocaleString('ro-RO')} lei` : 'Negociabil'}
                          </div>
                        </div>
                        {l.description&&<p style={{fontSize:12,color:S.muted,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden',margin:'4px 0'}}>{l.description}</p>}
                        <div style={{fontSize:12,color:S.muted,display:'flex',gap:12,marginTop:4}}>
                          <span>📍 {l.city||'Locație'}</span>
                          <span>👁️ {l.views||0} vizualizări</span>
                          <span>📅 {daysAgo===0?'Azi':daysAgo===1?'Ieri':`${daysAgo}z`}</span>
                          <span>📸 {l.listing_media?.length||0} poze</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="listing-row-actions" style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                        <a href={`/listing/${l.id}`} target="_blank"
                          style={{padding:'7px 14px',background:S.bg,color:S.navy,border:`1px solid ${S.border}`,borderRadius:50,fontSize:12,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                          👁️ Previzualizează
                        </a>
                        <button onClick={()=>setEditingListing(l)}
                          style={{padding:'7px 14px',background:'#eaf3ff',color:S.blue,border:`1px solid rgba(26,86,219,0.2)`,borderRadius:50,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                          ✏️ Editează
                        </button>
                        <button onClick={()=>toggleStatus(l)}
                          style={{padding:'7px 14px',background:isActive?S.amberBg:S.greenBg,color:isActive?S.amber:S.green,border:`1px solid ${isActive?S.amber+'30':S.green+'30'}`,borderRadius:50,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                          {isActive?'⏸️ Dezactivează':'▶️ Activează'}
                        </button>
                        <button onClick={()=>deleteListing(l.id)} disabled={deleting===l.id}
                          style={{padding:'7px 14px',background:S.redBg,color:S.red,border:`1px solid ${S.red}20`,borderRadius:50,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginLeft:'auto',opacity:deleting===l.id?.6:1}}>
                          {deleting===l.id?'Se șterge...':'🗑️ Șterge'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editingListing && (
        <EditModal listing={editingListing} onClose={()=>setEditingListing(null)} onSave={onSaved}/>
      )}
    </div>
  )
}
