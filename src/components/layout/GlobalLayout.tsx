// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

const NAV_TABS = [
  { label: 'Acasă', href: '/home' },
  { label: 'Service-uri', href: '/search' },
  { label: 'Anunțuri piese', href: '/listing' },
  { label: 'ITP & RCA', href: '/itp-rca' },
  { label: 'Vopsitorie', href: '/search?category=vopsitorie' },
  { label: 'Electrice', href: '/search?category=electrica' },
  { label: 'Anvelope', href: '/search?category=anvelope' },
  { label: 'Tractări', href: '/search?category=tractari' },
]
const EXCLUDED = ['/auth/login', '/auth/register', '/dashboard/service']
const CITIES = ['Toate orașele','Alba Iulia','Alexandria','Arad','Bacău','Baia Mare','Bistrița','Botoșani','Brăila','Brașov','București','Buzău','Cluj-Napoca','Constanța','Craiova','Deva','Focșani','Galați','Iași','Miercurea Ciuc','Oradea','Piatra Neamț','Pitești','Ploiești','Râmnicu Vâlcea','Satu Mare','Sibiu','Slatina','Slobozia','Suceava','Târgoviște','Târgu Jiu','Târgu Mureș','Timișoara','Tulcea','Zalău']

export default function GlobalLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cityDropdown, setCityDropdown] = useState(false)
  const [city, setCity] = useState('București')
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const supabase = createClient()
  const isExcluded = EXCLUDED.some(p => pathname?.startsWith(p))
  const isActive = (href) => pathname === href || (href !== '/home' && pathname?.startsWith(href.split('?')[0]))

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) supabase.from('profiles').select('role,full_name').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!cityDropdown) return
    const h = (e) => { if (!document.getElementById('city-dd')?.contains(e.target)) setCityDropdown(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [cityDropdown])

  if (isExcluded) return <>{children}</>

  return (
    <>


      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>

        {/* NAV */}
        <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,0.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--border)'}}>
          
          {/* Main row */}
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'0 32px',height:68,maxWidth:1280,margin:'0 auto'}}>
            
            {/* Logo */}
            <a href="/home" style={{textDecoration:'none',flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:36,height:36,background:'var(--blue)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.3)'}}>R</div>
              <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:21,color:'var(--navy)',letterSpacing:-0.5}} className="hide-mob">Reparo</span>
            </a>

            {/* Nav divider + tag — desktop */}
            <div className="hide-mob" style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:1,height:24,background:'var(--border)'}}/>
              <span style={{fontFamily:"'Sora',sans-serif",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)'}}>SERVICII <span style={{color:'var(--blue)'}}>AUTO</span></span>
            </div>

            {/* Search — desktop */}
            <div className="hide-mob" style={{flex:1,display:'flex',maxWidth:580,marginLeft:8}}>
              <div id="city-dd" style={{position:'relative'}}>
                <button onClick={()=>setCityDropdown(o=>!o)}
                  style={{height:44,padding:'0 14px',background:'var(--bg)',border:'1.5px solid var(--border)',borderRight:'none',borderRadius:'50px 0 0 50px',fontSize:13,color:'var(--text)',cursor:'pointer',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',fontFamily:"'DM Sans',sans-serif",minWidth:128,fontWeight:500}}>
                  📍 {city.length>12?city.slice(0,12)+'…':city}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{marginLeft:'auto',transform:cityDropdown?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}><path d="M1 1L5 5L9 1" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                {cityDropdown&&(
                  <div style={{position:'absolute',top:'110%',left:0,background:'#fff',borderRadius:16,boxShadow:'0 8px 32px rgba(10,31,68,0.12)',zIndex:200,minWidth:200,maxHeight:280,overflowY:'auto',border:'1px solid var(--border)'}}>
                    {CITIES.map(c=>(
                      <div key={c} onClick={()=>{setCity(c);setCityDropdown(false)}}
                        style={{padding:'10px 16px',fontSize:13,color:c===city?'var(--blue)':'var(--text)',cursor:'pointer',fontWeight:c===city?600:400,background:c===city?'#eaf3ff':'transparent',borderBottom:'1px solid #f5f5f5'}}
                        onMouseEnter={e=>{if(c!==city)e.currentTarget.style.background='#f8faff'}}
                        onMouseLeave={e=>{if(c!==city)e.currentTarget.style.background='transparent'}}>
                        {c==='Toate orașele'?'🇷🇴 '+c:'📍 '+c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Caută service, piesă, lucrare auto..."
                onKeyDown={e=>{if(e.key==='Enter')window.location.href=`/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`}}
                style={{flex:1,height:44,padding:'0 16px',border:'1.5px solid var(--border)',borderLeft:'none',borderRight:'none',fontSize:14,color:'var(--text)',outline:'none',background:'#fff',fontFamily:"'DM Sans',sans-serif"}}/>
              <button onClick={()=>window.location.href=`/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`}
                style={{height:44,padding:'0 20px',background:'var(--blue)',border:'none',borderRadius:'0 50px 50px 0',cursor:'pointer',display:'flex',alignItems:'center',transition:'background .2s,transform .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#1741b0'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--blue)'}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#fff" strokeWidth="1.8"/><path d="M10.5 10.5L14 14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Desktop auth buttons */}
            <div className="hide-mob" style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto',flexShrink:0}}>
              {user?(
                <>
                  <a href="/account" style={{padding:'8px 14px',borderRadius:50,fontSize:13,fontWeight:600,color:'var(--navy)',textDecoration:'none',fontFamily:"'Sora',sans-serif",transition:'color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--blue)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--navy)'}>Contul meu</a>
                  <a href="/oferte" style={{padding:'8px 14px',borderRadius:50,fontSize:13,fontWeight:600,color:'var(--navy)',textDecoration:'none',fontFamily:"'Sora',sans-serif"}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--blue)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--navy)'}>Oferte</a>
                  {profile?.role==='service'&&(
                    <a href="/dashboard/service" style={{padding:'8px 16px',borderRadius:50,fontSize:13,fontWeight:600,background:'var(--bg)',color:'var(--blue)',textDecoration:'none',border:'1.5px solid var(--blue)',fontFamily:"'Sora',sans-serif"}}>Dashboard</a>
                  )}
                  <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/home'}}
                    style={{padding:'8px 14px',borderRadius:50,fontSize:13,fontWeight:500,background:'none',color:'var(--muted)',border:'1.5px solid var(--border)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    Ieși
                  </button>
                </>
              ):(
                <>
                  <a href="/auth/login" style={{padding:'8px 16px',borderRadius:50,fontSize:13,fontWeight:600,color:'var(--blue)',textDecoration:'none',border:'1.5px solid var(--blue)',fontFamily:"'Sora',sans-serif"}}>Intră în cont</a>
                  <a href="/auth/register" style={{padding:'8px 16px',borderRadius:50,fontSize:13,fontWeight:600,color:'var(--muted)',textDecoration:'none',border:'1.5px solid var(--border)',fontFamily:"'Sora',sans-serif"}}>Înreg. service</a>
                </>
              )}
              <a href="/home" onClick={e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('open-quote-modal'))}}
                style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:50,fontSize:13,fontWeight:700,background:'var(--blue)',color:'#fff',textDecoration:'none',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'background .2s,transform .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#1741b0';e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--blue)';e.currentTarget.style.transform='none'}}>
                ✦ Cere ofertă
              </a>
            </div>

            {/* Mobile: oferta + hamburger */}
            <div className="mob-only" style={{display:'none',alignItems:'center',gap:8,marginLeft:'auto'}}>
              <a href="/home" onClick={e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('open-quote-modal'))}}
                style={{padding:'8px 14px',borderRadius:50,fontSize:12,fontWeight:700,background:'var(--blue)',color:'#fff',textDecoration:'none',fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}}>
                ✦ Ofertă
              </a>
              <button onClick={()=>setDrawerOpen(o=>!o)}
                style={{display:'flex',flexDirection:'column',gap:5,cursor:'pointer',padding:6,background:'none',border:'none'}}>
                {[0,1,2].map(i=>(
                  <span key={i} style={{display:'block',width:22,height:2,background:'var(--navy)',borderRadius:2,transition:'all .3s',
                    transform:drawerOpen?(i===0?'rotate(45deg) translate(5px,5px)':i===2?'rotate(-45deg) translate(5px,-5px)':'none'):'none',
                    opacity:drawerOpen&&i===1?0:1}}/>
                ))}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="mob-only" style={{display:'none',padding:'0 16px 12px'}}>
            <div style={{display:'flex',borderRadius:50,overflow:'hidden',border:'1.5px solid var(--border)',background:'#fff'}}>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Caută service, piesă..."
                onKeyDown={e=>{if(e.key==='Enter')window.location.href=`/search?q=${encodeURIComponent(searchQuery)}`}}
                style={{flex:1,padding:'11px 16px',border:'none',fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'transparent',color:'var(--text)'}}/>
              <button onClick={()=>window.location.href=`/search?q=${encodeURIComponent(searchQuery)}`}
                style={{padding:'0 18px',background:'var(--blue)',border:'none',cursor:'pointer'}}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.6"/><path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>

          {/* Nav tabs — desktop */}
          <div className="nav-scroll hide-mob" style={{display:'flex',padding:'0 32px',maxWidth:1280,margin:'0 auto',overflowX:'auto',borderTop:'1px solid var(--border)'}}>
            {NAV_TABS.map(t=>(
              <a key={t.label} href={t.href}
                style={{padding:'10px 16px',fontSize:13,fontWeight:isActive(t.href)?700:500,color:isActive(t.href)?'var(--blue)':'var(--muted)',textDecoration:'none',whiteSpace:'nowrap',borderBottom:isActive(t.href)?'2px solid var(--blue)':'2px solid transparent',fontFamily:"'Sora',sans-serif",display:'inline-block',transition:'color .15s'}}
                onMouseEnter={e=>{if(!isActive(t.href))e.currentTarget.style.color='var(--navy)'}}
                onMouseLeave={e=>{if(!isActive(t.href))e.currentTarget.style.color='var(--muted)'}}>
                {t.label}
              </a>
            ))}
          </div>

          {/* Mobile drawer */}
          {drawerOpen&&(
            <div style={{background:'#fff',borderTop:'1px solid var(--border)',paddingBottom:8}}>
              {NAV_TABS.map(t=>(
                <a key={t.label} href={t.href} onClick={()=>setDrawerOpen(false)}
                  style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:isActive(t.href)?700:600,color:isActive(t.href)?'var(--blue)':'var(--navy)',textDecoration:'none',fontFamily:"'Sora',sans-serif",borderLeft:isActive(t.href)?'3px solid var(--blue)':'3px solid transparent'}}>
                  {t.label}
                </a>
              ))}
              <div style={{borderTop:'1px solid var(--border)',margin:'8px 0'}}/>
              {user?(
                <>
                  <a href="/account" onClick={()=>setDrawerOpen(false)} style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:600,color:'var(--blue)',textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Contul meu</a>
                  <a href="/oferte" onClick={()=>setDrawerOpen(false)} style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:500,color:'var(--navy)',textDecoration:'none',fontFamily:"'DM Sans',sans-serif"}}>Ofertele mele</a>
                  {profile?.role==='service'&&<a href="/dashboard/service" onClick={()=>setDrawerOpen(false)} style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:500,color:'var(--navy)',textDecoration:'none'}}>Dashboard service</a>}
                  <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/home'}}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'13px 24px',fontSize:15,color:'var(--muted)',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    Ieși din cont
                  </button>
                </>
              ):(
                <>
                  <a href="/auth/register" onClick={()=>setDrawerOpen(false)} style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:600,color:'var(--blue)',textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Înregistrează service-ul</a>
                  <a href="/auth/login" onClick={()=>setDrawerOpen(false)} style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:500,color:'var(--navy)',textDecoration:'none'}}>Intră în cont</a>
                </>
              )}
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div style={{flex:1}}>{children}</div>

        {/* Mobile bottom nav */}
        <div className="mob-bottom" style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(12px)',borderTop:'1px solid var(--border)',zIndex:99,paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
          <div style={{display:'flex',maxWidth:500,margin:'0 auto'}}>
            {[
              {href:'/home',icon:'🏠',label:'Acasă'},
              {href:'/search',icon:'🔍',label:'Caută'},
              {href:'/listing',icon:'📦',label:'Piese'},
              {href:'/itp-rca',icon:'🛡️',label:'ITP & RCA'},
              {href:user?'/account':'/auth/login',icon:'👤',label:user?'Contul meu':'Cont'},
            ].map(item=>(
              <a key={item.href} href={item.href}
                style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'8px 4px',textDecoration:'none',color:pathname===item.href?'var(--blue)':'var(--muted)',fontFamily:"'DM Sans',sans-serif",transition:'color .15s'}}>
                <span style={{fontSize:20}}>{item.icon}</span>
                <span style={{fontSize:10,fontWeight:pathname===item.href?700:500}}>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
