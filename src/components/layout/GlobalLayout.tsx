// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'

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
const EXCLUDED = ['/auth/login', '/auth/register', '/dashboard/service', '/despre', '/blog', '/cariere', '/contact', '/termeni', '/confidentialitate', '/cookies']
const CITIES = ['Toate orașele','Alba Iulia','Alexandria','Arad','Bacău','Baia Mare','Bistrița','Botoșani','Brăila','Brașov','București','Buzău','Cluj-Napoca','Constanța','Craiova','Deva','Focșani','Galați','Iași','Miercurea Ciuc','Oradea','Piatra Neamț','Pitești','Ploiești','Râmnicu Vâlcea','Satu Mare','Sibiu','Slatina','Slobozia','Suceava','Târgoviște','Târgu Jiu','Târgu Mureș','Timișoara','Tulcea','Zalău']

const CAR_BRANDS = [
  'Alfa Romeo','Audi','BMW','Chevrolet','Chrysler','Citroen','Dacia','Daewoo',
  'Dodge','Fiat','Ford','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia',
  'Lada','Lamborghini','Land Rover','Lexus','Maserati','Mazda','Mercedes-Benz',
  'Mini','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat',
  'Skoda','Smart','Ssangyong','Subaru','Suzuki','Tesla','Toyota','Volkswagen','Volvo'
]

const CAR_MODELS: Record<string, string[]> = {
  'Alfa Romeo': ['147','156','159','166','Giulia','Giulietta','Mito','Stelvio','Tonale'],
  'Audi': ['A1','A2','A3','A4','A5','A6','A7','A8','Q2','Q3','Q5','Q7','Q8','TT','R8','e-tron'],
  'BMW': ['Seria 1','Seria 2','Seria 3','Seria 4','Seria 5','Seria 6','Seria 7','Seria 8','X1','X2','X3','X4','X5','X6','X7','Z4','M3','M5'],
  'Chevrolet': ['Aveo','Captiva','Cruze','Epica','Lacetti','Malibu','Spark','Trax'],
  'Citroen': ['Berlingo','C1','C2','C3','C4','C5','C6','Jumper','Jumpy','Picasso','Spacetourer','Xsara'],
  'Dacia': ['Dokker','Duster','Jogger','Logan','Lodgy','Sandero','Spring'],
  'Daewoo': ['Cielo','Espero','Kalos','Lacetti','Matiz','Nubira'],
  'Fiat': ['500','Bravo','Doblo','Ducato','Grande Punto','Linea','Panda','Punto','Scudo','Stilo','Tipo'],
  'Ford': ['B-Max','C-Max','EcoSport','Edge','Explorer','Fiesta','Focus','Galaxy','Ka','Kuga','Mondeo','Mustang','Puma','Ranger','S-Max','Transit'],
  'Honda': ['Accord','City','Civic','CR-V','HR-V','Jazz','Legend'],
  'Hyundai': ['Accent','Elantra','i10','i20','i30','i40','ix20','ix35','Kona','Santa Fe','Sonata','Tucson','Ioniq'],
  'Jaguar': ['E-Pace','F-Pace','F-Type','S-Type','X-Type','XE','XF','XJ'],
  'Jeep': ['Cherokee','Commander','Compass','Grand Cherokee','Renegade','Wrangler'],
  'Kia': ['Ceed','EV6','Niro','Optima','Picanto','Rio','Sorento','Soul','Sportage','Stinger','Stonic','Xceed'],
  'Lada': ['Granta','Kalina','Niva','Priora','Vesta'],
  'Land Rover': ['Defender','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar'],
  'Lexus': ['CT','ES','GS','IS','LC','LS','LX','NX','RX','UX'],
  'Mazda': ['2','3','5','6','CX-3','CX-5','CX-30','MX-5','RX-8'],
  'Mercedes-Benz': ['A-Class','B-Class','C-Class','CLA','CLS','E-Class','G-Class','GLA','GLB','GLC','GLE','GLK','GLS','ML','S-Class','SL','SLK','Sprinter','Vito','EQC'],
  'Mini': ['Clubman','Cooper','Countryman','Paceman'],
  'Mitsubishi': ['ASX','Colt','Eclipse Cross','Galant','L200','Lancer','Outlander','Pajero','Space Star'],
  'Nissan': ['350Z','370Z','Ariya','Juke','Leaf','Micra','Murano','Navara','Note','Pathfinder','Patrol','Pulsar','Qashqai','Sentra','Terrano','Tiida','X-Trail'],
  'Opel': ['Adam','Agila','Astra','Cascada','Corsa','Crossland','Grandland','Insignia','Meriva','Mokka','Omega','Signum','Vectra','Vivaro','Zafira'],
  'Peugeot': ['107','108','2008','206','207','208','3008','306','307','308','4008','406','407','408','5008','508','Boxer','Expert','Partner','Rifter'],
  'Porsche': ['718','911','Cayenne','Macan','Panamera','Taycan'],
  'Renault': ['Arkana','Captur','Clio','Duster','Espace','Fluence','Kadjar','Kangoo','Koleos','Laguna','Latitude','Logan','Master','Megane','Modus','Sandero','Scenic','Symbol','Trafic','Twingo','Zoe'],
  'Seat': ['Alhambra','Altea','Arona','Ateca','Cordoba','Exeo','Ibiza','Leon','Mii','Tarraco','Toledo'],
  'Skoda': ['Citigo','Fabia','Kamiq','Karoq','Kodiaq','Octavia','Rapid','Roomster','Scala','Superb','Yeti'],
  'Smart': ['Forfour','Fortwo'],
  'Subaru': ['Forester','Impreza','Legacy','Outback','XV'],
  'Suzuki': ['Alto','Baleno','Grand Vitara','Ignis','Jimny','Splash','Swift','SX4','Vitara'],
  'Tesla': ['Model 3','Model S','Model X','Model Y'],
  'Toyota': ['Auris','Avensis','Aygo','C-HR','Camry','Corolla','Hilux','Land Cruiser','Prius','ProAce','RAV4','Supra','Urban Cruiser','Verso','Yaris'],
  'Volkswagen': ['Amarok','Arteon','Caddy','Caravelle','CC','Crafter','Golf','ID.3','ID.4','Jetta','Multivan','Passat','Phaeton','Polo','Scirocco','Sharan','T-Cross','T-Roc','Tiguan','Touareg','Touran','Transporter','Up'],
  'Volvo': ['C30','S40','S60','S80','S90','V40','V50','V60','V70','V90','XC40','XC60','XC70','XC90'],
}

export default function GlobalLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const { notifications, unreadCount, markAllRead } = useNotifications(user?.id)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteStep, setQuoteStep] = useState(0)
  const [quoteDone, setQuoteDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [qForm, setQForm] = useState({car_brand:'',car_model:'',car_year:'',car_fuel:'',car_km:'',city:'',services:[],urgency:'',description:'',contact_name:'',contact_phone:'',target_service_id:''})
  const [cityDropdown, setCityDropdown] = useState(false)
  const [city, setCity] = useState('București')
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const supabase = createClient()
  const isExcluded = pathname === '/' || EXCLUDED.some(p => pathname?.startsWith(p))
  const isActive = (href) => pathname === href || (href !== '/home' && pathname?.startsWith(href.split('?')[0]))

  useEffect(() => {
    const handler = (e:any) => { 
      setQuoteOpen(true); setQuoteStep(0); setQuoteDone(false)
      if(e?.detail?.service_id) setQForm(p=>({...p,target_service_id:e.detail.service_id}))
    }
    window.addEventListener('open-quote-modal', handler)
    return () => window.removeEventListener('open-quote-modal', handler)
  }, [])

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

  useEffect(() => {
    if (!notifOpen) return
    const h = (e) => { if (!notifRef.current?.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [notifOpen])

  // Toast pentru notificări noi
  const [toast, setToast] = useState(null)
  const prevCount = useRef(0)
  useEffect(() => {
    if (unreadCount > prevCount.current && prevCount.current >= 0) {
      const newest = notifications[0]
      if (newest) {
        setToast(newest)
        setTimeout(() => setToast(null), 4000)
      }
    }
    prevCount.current = unreadCount
  }, [unreadCount])

  if (isExcluded) return <>{children}</>

  return (
    <>


      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>

        {/* NAV */}
        <style>{`
          .hide-mob { display: flex; }
          .mob-only { display: none; }
          .mob-bottom { display: none; }
          @media (max-width: 768px) {
            .hide-mob { display: none !important; }
            .mob-only { display: flex !important; }
            .mob-bottom { display: block !important; }
            body { padding-bottom: 88px; }
          }
        `}</style>
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
              {user&&(
                <div ref={notifRef} style={{position:'relative'}}>
                  <button onClick={()=>{setNotifOpen(o=>!o);if(!notifOpen)markAllRead()}}
                    style={{position:'relative',width:38,height:38,borderRadius:10,background:'#f0f6ff',border:'1.5px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#dbeafe'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f0f6ff'}>
                    🔔
                    {unreadCount>0&&(
                      <div style={{position:'absolute',top:-4,right:-4,width:18,height:18,background:'#ef4444',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',border:'2px solid #fff',fontFamily:"'Sora',sans-serif"}}>
                        {unreadCount>9?'9+':unreadCount}
                      </div>
                    )}
                  </button>
                  {notifOpen&&(
                    <div style={{position:'absolute',top:'110%',right:0,width:320,background:'#fff',borderRadius:16,boxShadow:'0 8px 32px rgba(10,31,68,0.15)',border:'1px solid var(--border)',zIndex:300,overflow:'hidden'}}>
                      <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:'var(--navy)'}}>Notificări</div>
                        {unreadCount>0&&<button onClick={markAllRead} style={{fontSize:11,color:'var(--blue)',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Marchează citite</button>}
                      </div>
                      <div style={{maxHeight:320,overflowY:'auto'}}>
                        {notifications.length===0?(
                          <div style={{padding:'32px 16px',textAlign:'center',color:'var(--muted)',fontSize:13}}>
                            <div style={{fontSize:32,marginBottom:8}}>🔔</div>
                            Nicio notificare
                          </div>
                        ):notifications.map(n=>(
                          <div key={n.id} style={{padding:'12px 16px',borderBottom:'1px solid #f5f5f5',background:n.is_read?'#fff':'#f0f6ff',cursor:'pointer',transition:'background .15s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                            onMouseLeave={e=>e.currentTarget.style.background=n.is_read?'#fff':'#f0f6ff'}>
                            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                              <div style={{fontSize:20,flexShrink:0}}>
                                {n.type==='new_offer'?'💰':n.type==='new_request'?'📋':n.type==='appointment_confirmed'?'📅':n.type==='offer_accepted'?'✅':'🔔'}
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,color:'var(--navy)',marginBottom:2}}>{n.title}</div>
                                {n.body&&<div style={{fontSize:12,color:'var(--muted)',lineHeight:1.4}}>{n.body}</div>}
                                <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>{new Date(n.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                              </div>
                              {!n.is_read&&<div style={{width:8,height:8,borderRadius:'50%',background:'var(--blue)',flexShrink:0,marginTop:4}}/>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{padding:'10px 16px',borderTop:'1px solid var(--border)',textAlign:'center'}}>
                        <a href="/oferte" style={{fontSize:12,color:'var(--blue)',fontWeight:600,textDecoration:'none'}}>Vezi toate ofertele →</a>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {user?(
                <>
                  <a href="/account" style={{padding:'8px 14px',borderRadius:50,fontSize:13,fontWeight:600,color:'var(--navy)',textDecoration:'none',fontFamily:"'Sora',sans-serif",transition:'color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--blue)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--navy)'}>Contul meu</a>
                  <a href="/messages" title="Mesaje"
                    style={{width:36,height:36,borderRadius:10,background:'#f0f6ff',border:'1.5px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,textDecoration:'none',transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#dbeafe'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f0f6ff'}>
                    💬
                  </a>
                  <a href="/oferte" style={{padding:'8px 14px',borderRadius:50,fontSize:13,fontWeight:600,color:'var(--navy)',textDecoration:'none',fontFamily:"'Sora',sans-serif"}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--blue)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--navy)'}>Oferte</a>
                  {profile?.role==='service'&&(
                    <a href="/dashboard/service" style={{padding:'8px 16px',borderRadius:50,fontSize:13,fontWeight:600,background:'var(--bg)',color:'var(--blue)',textDecoration:'none',border:'1.5px solid var(--blue)',fontFamily:"'Sora',sans-serif"}}>Dashboard</a>
                  )}
                  <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/home'}}
                    style={{padding:'9px 18px',borderRadius:10,fontSize:13,fontWeight:600,background:'#f1f5f9',color:'#475569',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>
                    Ieși
                  </button>
                </>
              ):(
                <>
                  <a href="/auth/login" style={{padding:'9px 20px',borderRadius:10,fontSize:13,fontWeight:600,color:'var(--navy)',textDecoration:'none',fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.1px'}}>Intră în cont</a>
                  <a href="/auth/register" style={{padding:'9px 20px',borderRadius:10,fontSize:13,fontWeight:700,color:'#fff',textDecoration:'none',background:'var(--navy)',fontFamily:"'Sora',sans-serif",letterSpacing:'-0.1px'}}>Înregistrare</a>
                </>
              )}
              <a href="/listing/create"
                style={{display:'inline-flex',alignItems:'center',gap:5,padding:'9px 18px',borderRadius:10,fontSize:13,fontWeight:600,background:'#f0f6ff',color:'var(--blue)',textDecoration:'none',fontFamily:"'DM Sans',sans-serif",transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#dbeafe'}
                onMouseLeave={e=>e.currentTarget.style.background='#f0f6ff'}>
                + Adaugă anunț
              </a>
              <a href="/home" onClick={e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('open-quote-modal'))}}
                style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 20px',borderRadius:10,fontSize:13,fontWeight:700,background:'var(--navy)',color:'#fff',textDecoration:'none',fontFamily:"'Sora',sans-serif",transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#1a3a6b'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--navy)'}>
                + Cere ofertă
              </a>
            </div>

            {/* Mobile: oferta + notif + hamburger */}
            <div className="mob-only" style={{alignItems:'center',gap:8,marginLeft:'auto'}}>
              {user&&(
                <button onClick={()=>{setNotifOpen(o=>!o);markAllRead()}}
                  style={{position:'relative',width:34,height:34,borderRadius:8,background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                  🔔
                  {unreadCount>0&&(
                    <div style={{position:'absolute',top:-2,right:-2,width:16,height:16,background:'#ef4444',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',border:'2px solid #fff'}}>
                      {unreadCount>9?'9+':unreadCount}
                    </div>
                  )}
                </button>
              )}
              {!user&&(
                <>
                  <a href="/auth/login" style={{padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:600,color:'var(--navy)',textDecoration:'none',fontFamily:"'DM Sans',sans-serif"}}>Intră</a>
                  <a href="/auth/register" style={{padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:700,color:'#fff',background:'var(--navy)',textDecoration:'none',fontFamily:"'DM Sans',sans-serif"}}>Cont nou</a>
                </>
              )}
              {user&&(
                <a href="/home" onClick={e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('open-quote-modal'))}}
                  style={{padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:700,background:'var(--navy)',color:'#fff',textDecoration:'none',fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap'}}>
                  + Ofertă
                </a>
              )}
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
          <div className="mob-only" style={{padding:'0 16px 12px'}}>
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
                  <a href="/messages" onClick={()=>setDrawerOpen(false)} style={{display:'block',padding:'13px 24px',fontSize:15,fontWeight:500,color:'var(--navy)',textDecoration:'none'}}>💬 Mesaje</a>
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

        {/* Quote Modal — disponibil pe toate paginile */}
      {quoteOpen&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setQuoteOpen(false)}}
          style={{position:'fixed',inset:0,background:'rgba(10,18,30,0.7)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#0a1f44',borderRadius:20,width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto',position:'relative'}}>
            <div style={{padding:'20px 24px 0',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{display:'flex',gap:6,marginBottom:6}}>
                  {['Mașina ta','Servicii','Detalii','Contact'].map((l,i)=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:i<=quoteStep?'#3b82f6':'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>
                        {i<quoteStep?'✓':i+1}
                      </div>
                      {i<3&&<div style={{width:16,height:1,background:i<quoteStep?'#3b82f6':'rgba(255,255,255,0.15)'}}/>}
                    </div>
                  ))}
                </div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:'#fff'}}>
                  {quoteDone?'🎉 Cerere trimisă!':['Mașina ta','Servicii dorite','Detalii suplimentare','Date de contact'][quoteStep]}
                </div>
              </div>
              <button onClick={()=>setQuoteOpen(false)} style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'0 24px 24px'}}>
              {quoteDone?(
                <div style={{textAlign:'center',padding:'32px 0'}}>
                  <div style={{fontSize:56,marginBottom:14}}>🎉</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:'#fff',marginBottom:8}}>Cererea ta a fost trimisă!</div>
                  <p style={{color:'rgba(255,255,255,0.55)',fontSize:14,marginBottom:24}}>Service-urile din zona ta vor răspunde în maxim 24h.</p>
                  <button onClick={()=>{setQuoteOpen(false);window.location.href='/oferte'}}
                    style={{padding:'12px 28px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                    Vezi ofertele mele →
                  </button>
                </div>
              ):quoteStep===0?(
                <div>
                  {/* Brand autocomplete */}
                  <div style={{marginBottom:10,position:'relative'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Marcă mașină *</label>
                    <input value={qForm.car_brand}
                      onChange={e=>setQForm(p=>({...p,car_brand:e.target.value,car_model:''}))}
                      placeholder="Scrie marca (ex: Volkswagen, BMW...)"
                      style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                    {qForm.car_brand.length>=2&&!CAR_BRANDS.some(b=>b.toLowerCase()===qForm.car_brand.toLowerCase())&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1a2f5e',borderRadius:10,zIndex:10,maxHeight:160,overflowY:'auto',border:'1px solid rgba(255,255,255,0.15)',marginTop:4}}>
                        {CAR_BRANDS.filter(b=>b.toLowerCase().includes(qForm.car_brand.toLowerCase())).map(b=>(
                          <div key={b} onClick={()=>setQForm(p=>({...p,car_brand:b,car_model:''}))}
                            style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.08)'}}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.3)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Model autocomplete */}
                  <div style={{marginBottom:10,position:'relative'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Model *</label>
                    <input value={qForm.car_model}
                      onChange={e=>setQForm(p=>({...p,car_model:e.target.value}))}
                      placeholder={qForm.car_brand&&CAR_MODELS[qForm.car_brand]?`ex: ${CAR_MODELS[qForm.car_brand][0]}`:'Selectează mai întâi marca'}
                      disabled={!qForm.car_brand}
                      style={{width:'100%',padding:'10px 12px',background:qForm.car_brand?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box',opacity:qForm.car_brand?1:0.5}}/>
                    {qForm.car_brand&&qForm.car_model.length>=1&&CAR_MODELS[qForm.car_brand]&&!(CAR_MODELS[qForm.car_brand]||[]).includes(qForm.car_model)&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1a2f5e',borderRadius:10,zIndex:10,maxHeight:160,overflowY:'auto',border:'1px solid rgba(255,255,255,0.15)',marginTop:4}}>
                        {(CAR_MODELS[qForm.car_brand]||[]).filter(m=>m.toLowerCase().includes(qForm.car_model.toLowerCase())).map(m=>(
                          <div key={m} onClick={()=>setQForm(p=>({...p,car_model:m}))}
                            style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.08)'}}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.3)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {m}
                          </div>
                        ))}
                        <div onClick={()=>{}} style={{padding:'9px 14px',fontSize:12,color:'rgba(255,255,255,0.4)',fontStyle:'italic'}}>
                          sau scrie manual și apasă Enter
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    {[['car_year','An fabricație','2019'],['car_fuel','Combustibil','Diesel / Benzină'],['car_km','Kilometraj','87000'],['city','Orașul tău','București']].map(([key,label,ph])=>(
                      <div key={key}>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>{label}</label>
                        <input value={qForm[key]} onChange={e=>setQForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                          style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setQuoteStep(1)} disabled={!qForm.car_brand||!qForm.car_model}
                    style={{width:'100%',padding:'12px',background:qForm.car_brand&&qForm.car_model?'#3b82f6':'rgba(255,255,255,0.1)',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}}>
                    Continuă →
                  </button>
                </div>
              ):quoteStep===1?(
                <div>
                  <p style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:12}}>Precizează specialitatea în care se încadrează lucrarea:</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,marginBottom:16,border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,overflow:'hidden'}}>
                    {['AC & climă','Audio & alarme','Anvelope & jante','Caroserie & tinichigerie','Climatizare','Cutie de viteze','Detailing auto','Diagnoză computerizată','Electrică auto','Eșapamente','Frâne & discuri','Geamuri & parbriz','Geometrie roți','Instalații GPL','ITP','Mecanică generală','Mecanică ușoară','Motor','Recondiționare injectoare','Recondiționare pompe injecție','Recondiționare turbine','Restaurare auto','Revizii & schimb ulei','Suspensie','Tapițerie & interior','Transmisie','Tuning exterior','Tuning motor','Vopsitorie','Altele'].map((svc,i)=>(
                      <label key={svc} onClick={()=>setQForm(p=>({...p,services:p.services.includes(svc)?p.services.filter(s=>s!==svc):[...p.services,svc]}))}
                        style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',background:qForm.services.includes(svc)?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.03)',borderBottom:i<29?'1px solid rgba(255,255,255,0.07)':'none',borderRight:i%2===0?'1px solid rgba(255,255,255,0.07)':'none'}}>
                        <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${qForm.services.includes(svc)?'#3b82f6':'rgba(255,255,255,0.3)'}`,background:qForm.services.includes(svc)?'#3b82f6':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {qForm.services.includes(svc)&&<svg width='9' height='9' viewBox='0 0 10 10'><polyline points='1.5,5 4,7.5 8.5,2.5' fill='none' stroke='white' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>}
                        </div>
                        <span style={{fontSize:12,color:qForm.services.includes(svc)?'#93c5fd':'rgba(255,255,255,0.75)',fontWeight:qForm.services.includes(svc)?600:400,lineHeight:1.3}}>{svc}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>setQuoteStep(0)} style={{padding:'11px 20px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:50,fontSize:13,cursor:'pointer'}}>← Înapoi</button>
                    <button onClick={()=>setQuoteStep(2)} disabled={qForm.services.length===0}
                      style={{flex:1,padding:'11px',background:qForm.services.length>0?'#3b82f6':'rgba(255,255,255,0.1)',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                      Continuă ({qForm.services.length} selectate) →
                    </button>
                  </div>
                </div>
              ):quoteStep===2?(
                <div>
                  <div style={{marginBottom:10}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Urgență</label>
                    <div style={{display:'flex',gap:8}}>
                      {[['flexibil','😌 Flexibil'],['saptamana','📅 Săptămâna asta'],['urgent','🚨 Urgent']].map(([val,label])=>(
                        <button key={val} onClick={()=>setQForm(p=>({...p,urgency:val}))}
                          style={{flex:1,padding:'10px 6px',background:qForm.urgency===val?'#3b82f6':'rgba(255,255,255,0.06)',border:`1px solid ${qForm.urgency===val?'#3b82f6':'rgba(255,255,255,0.12)'}`,borderRadius:10,fontSize:11,color:'#fff',cursor:'pointer',fontWeight:qForm.urgency===val?700:400}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Descrie problema (opțional)</label>
                    <textarea value={qForm.description} onChange={e=>setQForm(p=>({...p,description:e.target.value}))} rows={3}
                      placeholder="Ex: Zgomot la frânare față, suspectez plăcuțe uzate..."
                      style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',resize:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>setQuoteStep(1)} style={{padding:'11px 20px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:50,fontSize:13,cursor:'pointer'}}>← Înapoi</button>
                    <button onClick={()=>setQuoteStep(3)} style={{flex:1,padding:'11px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>Continuă →</button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                    {[['contact_name','Numele tău','Ion Popescu'],['contact_phone','Telefon','07xx xxx xxx']].map(([key,label,ph])=>(
                      <div key={key}>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>{label}</label>
                        <input value={qForm[key]} onChange={e=>setQForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                          style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Sumar cerere</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:4}}>🚗 {qForm.car_brand} {qForm.car_model} {qForm.car_year}</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:4}}>🔧 {qForm.services.slice(0,3).join(', ')}{qForm.services.length>3?` +${qForm.services.length-3}`:''}</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>📍 {qForm.city}</div>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>setQuoteStep(2)} style={{padding:'11px 20px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:50,fontSize:13,cursor:'pointer'}}>← Înapoi</button>
                    <button onClick={async()=>{
                      if(!qForm.contact_name||!qForm.contact_phone) return
                      setSubmitting(true)
                      try {
                        const {data:userData} = await supabase.auth.getUser()
                        await supabase.from('quote_requests').insert({
                          car_brand:qForm.car_brand,car_model:qForm.car_model,car_year:qForm.car_year,
                          car_fuel:qForm.car_fuel,car_km:qForm.car_km,city:qForm.city,
                          services:qForm.services,urgency:qForm.urgency,description:qForm.description,
                          contact_name:qForm.contact_name,contact_phone:qForm.contact_phone,
                          user_id:userData?.user?.id||null,
                          target_service_id:qForm.target_service_id||null,
                          status:'activa'
                        })
                        setQuoteDone(true)
                      } catch(e){ console.error(e) }
                      setSubmitting(false)
                    }} disabled={submitting||!qForm.contact_name||!qForm.contact_phone}
                      style={{flex:1,padding:'11px',background:submitting?'rgba(255,255,255,0.1)':'#3b82f6',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                      {submitting?'Se trimite...':'✦ Trimite cererea gratuit →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav - Varianta 3: floating card */}
        <div className="mob-bottom" style={{position:'fixed',bottom:0,left:0,right:0,zIndex:99,padding:'0 12px 16px',paddingBottom:'calc(16px + env(safe-area-inset-bottom,0px))'}}>
          <div style={{background:'#fff',borderRadius:20,border:'1px solid #ebebf0',display:'flex',alignItems:'flex-end',padding:'8px 8px 10px',gap:0,boxShadow:'0 -2px 24px rgba(10,31,68,0.08)'}}>
            {[
              {href:'/home',label:'Acasă',icon:(active)=>(
                <svg width="20" height="20" viewBox="0 0 24 24" fill={active?'#1a56db':'none'} stroke={active?'none':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L2 10v11h7v-6h6v6h7V10z"/></svg>
              )},
              {href:'/favorite',label:'Favorite',icon:(active)=>(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?'#1a56db':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              )},
              {href:'__oferta__',label:'Ofertă',icon:()=>null},
              {href:'/itp-rca',label:'RCA',icon:(active)=>(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?'#1a56db':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              )},
              {href:user?'/account':'/auth/login',label:'Cont',icon:(active)=>(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?'#1a56db':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
              )},
            ].map(item=>{
              if(item.href==='__oferta__') return (
                <div key="oferta" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <button onClick={()=>window.dispatchEvent(new CustomEvent('open-quote-modal'))}
                    style={{width:56,height:56,background:'#1a56db',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginTop:-24,border:'4px solid #fff',boxShadow:'0 6px 18px rgba(26,86,219,.3)',cursor:'pointer',outline:'none',flexShrink:0}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <span style={{fontSize:10,fontWeight:700,color:'#1a56db'}}>Ofertă</span>
                </div>
              )
              const active = pathname===item.href
              return (
                <a key={item.href} href={item.href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,textDecoration:'none',padding:'4px 0'}}>
                  <div style={{width:36,height:36,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:active?'#eef3ff':'transparent'}}>
                    {item.icon(active)}
                  </div>
                  <span style={{fontSize:10,fontWeight:active?700:400,color:active?'#1a56db':'#c4cdd8'}}>{item.label}</span>
                </a>
              )
            })}
          </div>
        </div>

      </div>

      {/* Quote Modal — disponibil pe toate paginile */}
      {quoteOpen&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setQuoteOpen(false)}}
          style={{position:'fixed',inset:0,background:'rgba(10,18,30,0.7)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#0a1f44',borderRadius:20,width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto',position:'relative'}}>
            <div style={{padding:'20px 24px 0',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{display:'flex',gap:6,marginBottom:6}}>
                  {['Mașina ta','Servicii','Detalii','Contact'].map((l,i)=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:i<=quoteStep?'#3b82f6':'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>
                        {i<quoteStep?'✓':i+1}
                      </div>
                      {i<3&&<div style={{width:16,height:1,background:i<quoteStep?'#3b82f6':'rgba(255,255,255,0.15)'}}/>}
                    </div>
                  ))}
                </div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:'#fff'}}>
                  {quoteDone?'🎉 Cerere trimisă!':['Mașina ta','Servicii dorite','Detalii suplimentare','Date de contact'][quoteStep]}
                </div>
              </div>
              <button onClick={()=>setQuoteOpen(false)} style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'0 24px 24px'}}>
              {quoteDone?(
                <div style={{textAlign:'center',padding:'32px 0'}}>
                  <div style={{fontSize:56,marginBottom:14}}>🎉</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:'#fff',marginBottom:8}}>Cererea ta a fost trimisă!</div>
                  <p style={{color:'rgba(255,255,255,0.55)',fontSize:14,marginBottom:24}}>Service-urile din zona ta vor răspunde în maxim 24h.</p>
                  <button onClick={()=>{setQuoteOpen(false);window.location.href='/oferte'}}
                    style={{padding:'12px 28px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                    Vezi ofertele mele →
                  </button>
                </div>
              ):quoteStep===0?(
                <div>
                  {/* Brand autocomplete */}
                  <div style={{marginBottom:10,position:'relative'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Marcă mașină *</label>
                    <input value={qForm.car_brand}
                      onChange={e=>setQForm(p=>({...p,car_brand:e.target.value,car_model:''}))}
                      placeholder="Scrie marca (ex: Volkswagen, BMW...)"
                      style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                    {qForm.car_brand.length>=2&&!CAR_BRANDS.some(b=>b.toLowerCase()===qForm.car_brand.toLowerCase())&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1a2f5e',borderRadius:10,zIndex:10,maxHeight:160,overflowY:'auto',border:'1px solid rgba(255,255,255,0.15)',marginTop:4}}>
                        {CAR_BRANDS.filter(b=>b.toLowerCase().includes(qForm.car_brand.toLowerCase())).map(b=>(
                          <div key={b} onClick={()=>setQForm(p=>({...p,car_brand:b,car_model:''}))}
                            style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.08)'}}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.3)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Model autocomplete */}
                  <div style={{marginBottom:10,position:'relative'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Model *</label>
                    <input value={qForm.car_model}
                      onChange={e=>setQForm(p=>({...p,car_model:e.target.value}))}
                      placeholder={qForm.car_brand&&CAR_MODELS[qForm.car_brand]?`ex: ${CAR_MODELS[qForm.car_brand][0]}`:'Selectează mai întâi marca'}
                      disabled={!qForm.car_brand}
                      style={{width:'100%',padding:'10px 12px',background:qForm.car_brand?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box',opacity:qForm.car_brand?1:0.5}}/>
                    {qForm.car_brand&&qForm.car_model.length>=1&&CAR_MODELS[qForm.car_brand]&&!(CAR_MODELS[qForm.car_brand]||[]).includes(qForm.car_model)&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1a2f5e',borderRadius:10,zIndex:10,maxHeight:160,overflowY:'auto',border:'1px solid rgba(255,255,255,0.15)',marginTop:4}}>
                        {(CAR_MODELS[qForm.car_brand]||[]).filter(m=>m.toLowerCase().includes(qForm.car_model.toLowerCase())).map(m=>(
                          <div key={m} onClick={()=>setQForm(p=>({...p,car_model:m}))}
                            style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.08)'}}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.3)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {m}
                          </div>
                        ))}
                        <div onClick={()=>{}} style={{padding:'9px 14px',fontSize:12,color:'rgba(255,255,255,0.4)',fontStyle:'italic'}}>
                          sau scrie manual și apasă Enter
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    {[['car_year','An fabricație','2019'],['car_fuel','Combustibil','Diesel / Benzină'],['car_km','Kilometraj','87000'],['city','Orașul tău','București']].map(([key,label,ph])=>(
                      <div key={key}>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>{label}</label>
                        <input value={qForm[key]} onChange={e=>setQForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                          style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setQuoteStep(1)} disabled={!qForm.car_brand||!qForm.car_model}
                    style={{width:'100%',padding:'12px',background:qForm.car_brand&&qForm.car_model?'#3b82f6':'rgba(255,255,255,0.1)',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}}>
                    Continuă →
                  </button>
                </div>
              ):quoteStep===1?(
                <div>
                  <p style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:12}}>Precizează specialitatea în care se încadrează lucrarea:</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,marginBottom:16,border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,overflow:'hidden'}}>
                    {['AC & climă','Audio & alarme','Anvelope & jante','Caroserie & tinichigerie','Climatizare','Cutie de viteze','Detailing auto','Diagnoză computerizată','Electrică auto','Eșapamente','Frâne & discuri','Geamuri & parbriz','Geometrie roți','Instalații GPL','ITP','Mecanică generală','Mecanică ușoară','Motor','Recondiționare injectoare','Recondiționare pompe injecție','Recondiționare turbine','Restaurare auto','Revizii & schimb ulei','Suspensie','Tapițerie & interior','Transmisie','Tuning exterior','Tuning motor','Vopsitorie','Altele'].map((svc,i)=>(
                      <label key={svc} onClick={()=>setQForm(p=>({...p,services:p.services.includes(svc)?p.services.filter(s=>s!==svc):[...p.services,svc]}))}
                        style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',background:qForm.services.includes(svc)?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.03)',borderBottom:i<29?'1px solid rgba(255,255,255,0.07)':'none',borderRight:i%2===0?'1px solid rgba(255,255,255,0.07)':'none'}}>
                        <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${qForm.services.includes(svc)?'#3b82f6':'rgba(255,255,255,0.3)'}`,background:qForm.services.includes(svc)?'#3b82f6':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {qForm.services.includes(svc)&&<svg width='9' height='9' viewBox='0 0 10 10'><polyline points='1.5,5 4,7.5 8.5,2.5' fill='none' stroke='white' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>}
                        </div>
                        <span style={{fontSize:12,color:qForm.services.includes(svc)?'#93c5fd':'rgba(255,255,255,0.75)',fontWeight:qForm.services.includes(svc)?600:400,lineHeight:1.3}}>{svc}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>setQuoteStep(0)} style={{padding:'11px 20px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:50,fontSize:13,cursor:'pointer'}}>← Înapoi</button>
                    <button onClick={()=>setQuoteStep(2)} disabled={qForm.services.length===0}
                      style={{flex:1,padding:'11px',background:qForm.services.length>0?'#3b82f6':'rgba(255,255,255,0.1)',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                      Continuă ({qForm.services.length} selectate) →
                    </button>
                  </div>
                </div>
              ):quoteStep===2?(
                <div>
                  <div style={{marginBottom:10}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Urgență</label>
                    <div style={{display:'flex',gap:8}}>
                      {[['flexibil','😌 Flexibil'],['saptamana','📅 Săptămâna asta'],['urgent','🚨 Urgent']].map(([val,label])=>(
                        <button key={val} onClick={()=>setQForm(p=>({...p,urgency:val}))}
                          style={{flex:1,padding:'10px 6px',background:qForm.urgency===val?'#3b82f6':'rgba(255,255,255,0.06)',border:`1px solid ${qForm.urgency===val?'#3b82f6':'rgba(255,255,255,0.12)'}`,borderRadius:10,fontSize:11,color:'#fff',cursor:'pointer',fontWeight:qForm.urgency===val?700:400}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>Descrie problema (opțional)</label>
                    <textarea value={qForm.description} onChange={e=>setQForm(p=>({...p,description:e.target.value}))} rows={3}
                      placeholder="Ex: Zgomot la frânare față, suspectez plăcuțe uzate..."
                      style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',resize:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>setQuoteStep(1)} style={{padding:'11px 20px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:50,fontSize:13,cursor:'pointer'}}>← Înapoi</button>
                    <button onClick={()=>setQuoteStep(3)} style={{flex:1,padding:'11px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>Continuă →</button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                    {[['contact_name','Numele tău','Ion Popescu'],['contact_phone','Telefon','07xx xxx xxx']].map(([key,label,ph])=>(
                      <div key={key}>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>{label}</label>
                        <input value={qForm[key]} onChange={e=>setQForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                          style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,color:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Sumar cerere</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:4}}>🚗 {qForm.car_brand} {qForm.car_model} {qForm.car_year}</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:4}}>🔧 {qForm.services.slice(0,3).join(', ')}{qForm.services.length>3?` +${qForm.services.length-3}`:''}</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>📍 {qForm.city}</div>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>setQuoteStep(2)} style={{padding:'11px 20px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:50,fontSize:13,cursor:'pointer'}}>← Înapoi</button>
                    <button onClick={async()=>{
                      if(!qForm.contact_name||!qForm.contact_phone) return
                      setSubmitting(true)
                      try {
                        const {data:userData} = await supabase.auth.getUser()
                        await supabase.from('quote_requests').insert({
                          car_brand:qForm.car_brand,car_model:qForm.car_model,car_year:qForm.car_year,
                          car_fuel:qForm.car_fuel,car_km:qForm.car_km,city:qForm.city,
                          services:qForm.services,urgency:qForm.urgency,description:qForm.description,
                          contact_name:qForm.contact_name,contact_phone:qForm.contact_phone,
                          user_id:userData?.user?.id||null,
                          target_service_id:qForm.target_service_id||null,
                          status:'activa'
                        })
                        setQuoteDone(true)
                      } catch(e){ console.error(e) }
                      setSubmitting(false)
                    }} disabled={submitting||!qForm.contact_name||!qForm.contact_phone}
                      style={{flex:1,padding:'11px',background:submitting?'rgba(255,255,255,0.1)':'#3b82f6',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                      {submitting?'Se trimite...':'✦ Trimite cererea gratuit →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav - Varianta 3: floating card */}
      <div className="mob-bottom" style={{position:'fixed',bottom:0,left:0,right:0,zIndex:90,padding:'0 12px 16px',paddingBottom:'calc(16px + env(safe-area-inset-bottom,0px))'}}>
        <div style={{background:'#fff',borderRadius:20,border:'1px solid #ebebf0',display:'flex',alignItems:'flex-end',padding:'8px 8px 10px',gap:0,boxShadow:'0 -2px 24px rgba(10,31,68,0.08)'}}>
          {[
            {href:'/home',label:'Acasă',icon:(active)=>(
              <svg width="20" height="20" viewBox="0 0 24 24" fill={active?'#1a56db':'none'} stroke={active?'none':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L2 10v11h7v-6h6v6h7V10z"/></svg>
            )},
            {href:'/favorite',label:'Favorite',icon:(active)=>(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?'#1a56db':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            )},
            {href:'__oferta__',label:'Ofertă',icon:()=>null},
            {href:'/itp-rca',label:'RCA',icon:(active)=>(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?'#1a56db':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            )},
            {href:user?'/account':'/auth/login',label:'Cont',icon:(active)=>(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?'#1a56db':'#c4cdd8'} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
            )},
          ].map(item=>{
            if(item.href==='__oferta__') return (
              <div key="oferta" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <button onClick={()=>window.dispatchEvent(new CustomEvent('open-quote-modal'))}
                  style={{width:56,height:56,background:'#1a56db',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginTop:-24,border:'4px solid #fff',boxShadow:'0 6px 18px rgba(26,86,219,.3)',cursor:'pointer',outline:'none',flexShrink:0}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                <span style={{fontSize:10,fontWeight:700,color:'#1a56db'}}>Ofertă</span>
              </div>
            )
            const active = pathname===item.href
            return (
              <a key={item.href} href={item.href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,textDecoration:'none',padding:'4px 0'}}>
                <div style={{width:36,height:36,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:active?'#eef3ff':'transparent'}}>
                  {item.icon(active)}
                </div>
                <span style={{fontSize:10,fontWeight:active?700:400,color:active?'#1a56db':'#c4cdd8'}}>{item.label}</span>
              </a>
            )
          })}
        </div>
      </div>
      {/* Toast notificare */}
      {toast&&(
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:3000,background:'var(--navy)',color:'#fff',borderRadius:14,padding:'12px 18px',boxShadow:'0 8px 32px rgba(10,31,68,0.3)',display:'flex',alignItems:'center',gap:12,minWidth:280,maxWidth:'90vw',animation:'slideUp .3s ease'}}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          <div style={{fontSize:22,flexShrink:0}}>
            {toast.type==='new_offer'?'💰':toast.type==='new_request'?'📋':toast.type==='appointment_confirmed'?'📅':toast.type==='offer_accepted'?'✅':'🔔'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13}}>{toast.title}</div>
            {toast.body&&<div style={{fontSize:12,opacity:.75,marginTop:2}}>{toast.body}</div>}
          </div>
          <button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:16,padding:4}}>✕</button>
        </div>
      )}
    </>
  )
}
