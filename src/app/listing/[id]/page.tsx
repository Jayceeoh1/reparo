// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',greenBg:'#dcfce7',
  red:'#dc2626',amber:'#d97706',amberBg:'#fef3c7',
}

const CONDITIONS = {
  nou:{label:'Nou',color:S.green,bg:S.greenBg},
  ca_nou:{label:'Ca nou',color:S.blue,bg:'#eaf3ff'},
  bun:{label:'Stare bună',color:S.amber,bg:S.amberBg},
  acceptabil:{label:'Acceptabil',color:S.muted,bg:S.bg},
  folosit:{label:'Folosit',color:S.muted,bg:S.bg},
  reconditionat:{label:'Recondiționat',color:S.amber,bg:S.amberBg},
}

const CATEGORIES = {
  piese_motor:'⚙️ Piese motor',caroserie:'🚘 Caroserie',frane:'🔴 Frâne',
  anvelope:'⭕ Anvelope & jante',electricitate:'⚡ Electricitate',
  interior:'🪑 Interior',unelte:'🛠️ Unelte',piese:'🔧 Piese auto',altele:'📦 Altele',
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState(null)
  const [photos, setPhotos] = useState([])
  const [seller, setSeller] = useState(null)
  const [related, setRelated] = useState([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase.from('listings').select('*').eq('id', params.id).single()
      if (!l) { setLoading(false); return }
      setListing(l)

      // Increment views
      await supabase.from('listings').update({ views: (l.views || 0) + 1 }).eq('id', params.id)

      // Photos
      const { data: ph } = await supabase.from('listing_media').select('*').eq('listing_id', params.id).order('sort_order')
      setPhotos(ph || [])

      // Seller profile
      if (l.user_id) {
        const { data: prof } = await supabase.from('profiles').select('full_name, avatar_url, city, created_at').eq('id', l.user_id).single()
        setSeller(prof)
      }

      // Related listings
      const { data: rel } = await supabase.from('listings').select('id,title,price,city,condition')
        .eq('category', l.category).eq('status','activ').neq('id', params.id).limit(4)
      setRelated(rel || [])

      setLoading(false)
    }
    load()
  }, [params.id])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
      @media(max-width:768px){
        .listing-detail-grid{grid-template-columns:1fr!important}
        .listing-detail-sidebar{position:relative!important;top:0!important}
        .listing-related{grid-template-columns:repeat(2,1fr)!important}
        .listing-details-grid{grid-template-columns:1fr 1fr!important}
        .listing-contact-btns{flex-direction:column!important}
        .listing-compat-brands{flex-wrap:wrap!important}
      }
      @media(max-width:480px){
        .listing-related{grid-template-columns:1fr 1fr!important}
        .listing-details-grid{grid-template-columns:1fr!important}
      }`}</style>
    </div>
  )

  if (!listing) return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:12}}>🔍</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:8}}>Anunț negăsit</div>
        <a href="/listing" style={{color:S.blue,textDecoration:'none',fontWeight:600}}>← Înapoi la anunțuri</a>
      </div>
    </div>
  )

  const cond = CONDITIONS[listing.condition] || CONDITIONS.folosit
  const daysAgo = Math.floor((new Date().getTime() - new Date(listing.created_at).getTime()) / (1000*60*60*24))

  return (
    <div style={{background:S.bg,minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.photo-thumb:hover{border-color:#1a56db!important;opacity:1!important}.rel-card:hover{border-color:#1a56db!important;box-shadow:0 4px 16px rgba(26,86,219,0.1)!important}`}</style>

      {/* Breadcrumb */}
      <div style={{background:S.white,borderBottom:`1px solid ${S.border}`,padding:'10px 24px',fontSize:12,color:S.muted}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',gap:6}}>
          <a href="/home" style={{color:S.muted,textDecoration:'none'}}>Acasă</a>
          <span>›</span>
          <a href="/listing" style={{color:S.muted,textDecoration:'none'}}>Anunțuri piese</a>
          <span>›</span>
          <span style={{color:S.navy,fontWeight:500}}>{listing.title?.slice(0,40)}{listing.title?.length>40?'...':''}</span>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>
        <style>{`
          @media(max-width:768px){
            .listing-detail-grid{grid-template-columns:1fr!important}
            .listing-detail-sidebar{position:relative!important;top:0!important}
          }
        `}</style>
        <div className="listing-detail-grid" style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20,alignItems:'start'}}>

          {/* LEFT COL */}
          <div>
            {/* Photo gallery */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,overflow:'hidden',marginBottom:16,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
              {/* Main photo */}
              <div style={{height:'min(400px,60vw)',background:'#eaf3ff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
                {photos.length>0 ? (
                  <>
                    <img src={photos[activePhoto]?.url} alt={listing.title}
                      style={{width:'100%',height:'100%',objectFit:'contain',background:'#f8faff'}}/>
                    {photos.length>1&&(
                      <>
                        <button onClick={()=>setActivePhoto(p=>Math.max(0,p-1))} disabled={activePhoto===0}
                          style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)',opacity:activePhoto===0?0.3:1}}>‹</button>
                        <button onClick={()=>setActivePhoto(p=>Math.min(photos.length-1,p+1))} disabled={activePhoto===photos.length-1}
                          style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)',opacity:activePhoto===photos.length-1?0.3:1}}>›</button>
                        <div style={{position:'absolute',bottom:12,right:12,background:'rgba(10,31,68,0.6)',color:'#fff',fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:20}}>
                          {activePhoto+1}/{photos.length}
                        </div>
                      </>
                    )}
                  </>
                ):(
                  <div style={{textAlign:'center',color:S.muted}}>
                    <div style={{fontSize:64,marginBottom:8}}>📦</div>
                    <div style={{fontSize:14}}>Fără fotografii</div>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {photos.length>1&&(
                <div style={{display:'flex',gap:8,padding:'12px',overflowX:'auto'}}>
                  {photos.map((ph,i)=>(
                    <img key={ph.id||i} src={ph.url} alt="" onClick={()=>setActivePhoto(i)}
                      className="photo-thumb"
                      style={{width:72,height:72,objectFit:'cover',borderRadius:8,cursor:'pointer',border:`2px solid ${i===activePhoto?S.blue:S.border}`,opacity:i===activePhoto?1:0.65,transition:'all .15s',flexShrink:0}}/>
                  ))}
                </div>
              )}
            </div>

            {/* Title & price */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12,gap:12}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,lineHeight:1.3,flex:1}}>{listing.title}</h1>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:28,color:S.navy}}>
                    {listing.price ? `${listing.price.toLocaleString('ro-RO')} lei` : 'Preț negociabil'}
                  </div>
                  {listing.negotiable&&<div style={{fontSize:12,color:S.green,fontWeight:600}}>✓ Negociabil</div>}
                </div>
              </div>

              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
                {listing.condition&&<span style={{background:cond.bg,color:cond.color,fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:50,fontFamily:"'Sora',sans-serif"}}>{cond.label}</span>}
                {listing.category&&<span style={{background:'#eaf3ff',color:S.blue,fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:50}}>{CATEGORIES[listing.category]||listing.category}</span>}
                {listing.delivery&&<span style={{background:S.bg,color:S.muted,fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:50}}>🚚 Livrare {listing.delivery_price?`${listing.delivery_price} RON`:'gratuită'}</span>}
              </div>

              <div style={{display:'flex',gap:16,fontSize:12,color:S.muted}}>
                <span>📍 {listing.city||'Locație nespecificată'}</span>
                <span>👁️ {listing.views||1} vizualizări</span>
                <span>📅 {daysAgo===0?'Azi':daysAgo===1?'Ieri':`${daysAgo} zile în urmă`}</span>
              </div>
            </div>

            {/* Description */}
            {listing.description&&(
              <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:12}}>📝 Descriere</h2>
                <p style={{fontSize:14,color:'#374151',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{listing.description}</p>
              </div>
            )}

            {/* Details grid */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>📋 Detalii produs</h2>
              <div className="listing-details-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  ['Stare',cond.label],
                  ['Categorie',CATEGORIES[listing.category]||listing.category],
                  ['Locație',listing.city],
                  listing.part_number&&['Cod piesă',listing.part_number],
                  listing.delivery!==null&&['Livrare',listing.delivery?`Da${listing.delivery_price?` — ${listing.delivery_price} RON`:', gratuită'}`:'Nu'],
                  listing.negotiable!==null&&['Preț negociabil',listing.negotiable?'Da':'Nu'],
                ].filter(Boolean).map(([label,value])=>(
                  <div key={label} style={{background:S.bg,borderRadius:10,padding:'10px 14px'}}>
                    <div style={{fontSize:11,color:S.muted,marginBottom:3,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{label}</div>
                    <div style={{fontSize:14,color:S.navy,fontWeight:500}}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Compatibilitate */}
              {(listing.compatible_brands?.length>0||listing.compatible_models?.length>0)&&(
                <div style={{marginTop:12,background:'#eaf3ff',borderRadius:10,padding:'12px 14px',border:'1px solid rgba(26,86,219,0.15)'}}>
                  <div style={{fontSize:11,color:S.blue,marginBottom:6,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>🚗 Compatibil cu</div>
                  {listing.compatible_brands?.length>0&&(
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
                      {listing.compatible_brands.map(b=><span key={b} style={{background:S.white,border:'1px solid rgba(26,86,219,0.2)',borderRadius:50,padding:'3px 10px',fontSize:12,color:S.blue,fontWeight:600}}>{b}</span>)}
                    </div>
                  )}
                  {listing.compatible_models?.length>0&&(
                    <div style={{fontSize:13,color:S.navy}}>{listing.compatible_models.join(', ')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Related */}
            {related.length>0&&(
              <div>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:12}}>Anunțuri similare</h2>
                <div className="listing-related" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                  {related.map(r=>(
                    <a key={r.id} href={`/listing/${r.id}`} className="rel-card"
                      style={{background:S.white,borderRadius:12,border:`1px solid ${S.border}`,padding:12,textDecoration:'none',transition:'all .2s',display:'block'}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>{r.price?`${r.price.toLocaleString()} lei`:'Negociabil'}</div>
                      <div style={{fontSize:12,color:S.muted,lineHeight:1.4,marginBottom:6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{r.title}</div>
                      <div style={{fontSize:11,color:S.muted}}>📍 {r.city}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COL — sticky */}
          <div className="listing-detail-sidebar" style={{position:'sticky',top:90}}>

            {/* Contact card */}
            <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:14,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:S.navy,marginBottom:4}}>
                {listing.price ? `${listing.price.toLocaleString('ro-RO')} lei` : 'Preț negociabil'}
              </div>
              {listing.negotiable&&<div style={{fontSize:13,color:S.green,fontWeight:600,marginBottom:14}}>✓ Prețul este negociabil</div>}

              {listing.phone_contact?(
                <button onClick={()=>setShowPhone(!showPhone)}
                  style={{width:'100%',padding:'13px',background:showPhone?S.green:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",boxShadow:`0 4px 16px ${showPhone?'rgba(22,163,74,0.25)':'rgba(26,86,219,0.25)'}`,marginBottom:10,transition:'all .2s'}}>
                  {showPhone?`📞 ${listing.phone_contact}`:'📞 Afișează numărul'}
                </button>
              ):(
                <div style={{background:S.bg,borderRadius:12,padding:'12px 16px',textAlign:'center',marginBottom:10,fontSize:13,color:S.muted}}>
                  Vânzătorul nu a adăugat un număr de telefon.
                </div>
              )}

              {/* Trimite mesaj */}
              <a href={`/messages`}
                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'12px',background:'transparent',color:S.blue,border:`1.5px solid ${S.blue}`,borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",textDecoration:'none',marginBottom:10,boxSizing:'border-box',transition:'all .2s'}}>
                💬 Trimite mesaj vânzătorului
              </a>

              {/* Cere oferta piese similare */}
              <a href={`/piese-oferta`}
                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'12px',background:S.amberBg,color:'#92400e',border:'1.5px solid rgba(217,119,6,0.3)',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textDecoration:'none',marginBottom:10,boxSizing:'border-box'}}>
                🔩 Caută piese similare la alte service-uri
              </a>

              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setFavorite(!favorite)}
                  style={{flex:1,padding:'10px',background:favorite?'#fee2e2':S.bg,color:favorite?S.red:S.muted,border:`1px solid ${favorite?'#fecaca':S.border}`,borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s'}}>
                  {favorite?'❤️ Salvat':'🤍 Salvează'}
                </button>
                <button onClick={copyLink}
                  style={{flex:1,padding:'10px',background:copied?S.greenBg:S.bg,color:copied?S.green:S.muted,border:`1px solid ${copied?S.green+'30':S.border}`,borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s'}}>
                  {copied?'✅ Copiat!':'🔗 Distribuie'}
                </button>
              </div>
            </div>

            {/* Seller card */}
            {seller&&(
              <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:16,marginBottom:14,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:12}}>Vânzător</h3>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:S.blue,fontFamily:"'Sora',sans-serif",overflow:'hidden',flexShrink:0}}>
                    {seller.avatar_url?<img src={seller.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:seller.full_name?.charAt(0)?.toUpperCase()||'U'}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:S.navy,marginBottom:2}}>{seller.full_name||'Utilizator Reparo'}</div>
                    <div style={{fontSize:12,color:S.muted}}>📍 {seller.city||listing.city}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:S.muted,background:S.bg,borderRadius:8,padding:'8px 12px'}}>
                  Membru din {new Date(seller.created_at).toLocaleDateString('ro-RO',{month:'long',year:'numeric'})}
                </div>
              </div>
            )}

            {/* Safety tips */}
            <div style={{background:S.amberBg,borderRadius:16,border:'1px solid rgba(217,119,6,0.2)',padding:16}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.amber,marginBottom:8}}>⚠️ Sfaturi siguranță</div>
              {['Nu plăti în avans fără a vedea produsul','Verifică produsul înainte de tranzacție','Preferă întâlniri în locuri publice','Reparo nu garantează tranzacțiile'].map(tip=>(
                <div key={tip} style={{fontSize:12,color:S.amber,marginBottom:4,display:'flex',gap:5}}>
                  <span>•</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
