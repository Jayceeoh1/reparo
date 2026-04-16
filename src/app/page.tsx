// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import './landing.css'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',
}

const FEATURES = [
  {icon:'📋',title:'Cereri de ofertă directe',desc:'Primești cereri de la șoferi din zona ta, direct pe telefon sau email. Zero efort de marketing.'},
  {icon:'💰',title:'Ofertezi prețul tău',desc:'Tu decizi cât ceri. Trimiti oferta în 2 minute și câștigi clientul.'},
  {icon:'📅',title:'Calendar programări',desc:'Gestionezi toate programările dintr-un singur loc. Nu mai pierzi clienți.'},
  {icon:'⭐',title:'Recenzii verificate',desc:'Clienții reali lasă recenzii. Îți construiești reputația online automat.'},
  {icon:'🔍',title:'Apari în căutări',desc:'Profilul tău apare când cineva caută service în orașul tău. SEO inclus.'},
  {icon:'📱',title:'Funcționează pe mobil',desc:'Totul funcționează de pe telefon. Răspunde la cereri oricând, oriunde.'},
]

const STEPS = [
  {nr:'01',title:'Creezi contul gratuit',desc:'5 minute. Adaugi numele, adresa, serviciile oferite și ești live.'},
  {nr:'02',title:'Primești cereri de ofertă',desc:'Șoferii din zona ta îți trimit cereri. Tu primești notificare instant.'},
  {nr:'03',title:'Trimiți oferta',desc:'Completezi prețul și data disponibilă. Clientul acceptă direct din aplicație.'},
  {nr:'04',title:'Câștigi clienți fideli',desc:'Lucrezi bine, primești recenzii, apari mai sus în căutări. Crești.'},
]

const PLANS = [
  {name:'Free',price:'0',period:'',features:['Profil public complet','Până la 10 cereri/lună','Calendar programări','Recenzii clienți','Suport email'],cta:'Începe gratuit',primary:false},
  {name:'Basic',price:'99',period:'/lună',features:['Tot din Free','Cereri nelimitate','Notificări instant SMS','Badge verificat Reparo','Statistici detaliate'],cta:'Alege Basic',primary:false},
  {name:'Pro',price:'199',period:'/lună',features:['Tot din Basic','Poziție prioritară în căutări','Anunțuri promovate','Mesagerie internă','Manager de cont dedicat'],cta:'Alege Pro',primary:true},
]

const STATS_DEFAULT = [
  {value:'—',label:'Service-uri înregistrate'},
  {value:'—',label:'Cereri trimise'},
  {value:'—',label:'Rating mediu platformă'},
  {value:'—',label:'Rata de răspuns'},
]

const FAQS_DATA = [
  {q:'Cât costă înregistrarea?',a:'Înregistrarea și planul Free sunt 100% gratuite. Nu ai nevoie de card bancar pentru a începe.'},
  {q:'Cât durează să apară profilul meu?',a:'Imediat după înregistrare. Completezi datele și apari instantaneu în căutările din orașul tău.'},
  {q:'Ce tip de service-uri pot să se înregistreze?',a:'Orice tip — mecanică, vopsitorie, electrice, ITP, anvelope, detailing. Dacă lucrezi pe mașini, ești bine venit.'},
  {q:'Cum primesc cererile de ofertă?',a:'Prin notificări în aplicație și prin email. Dacă ai planul Basic sau Pro, și prin SMS.'},
  {q:'Pot să anulez oricând abonamentul?',a:'Da, oricând. Fără penalități, fără perioadă minimă de contract.'},
  {q:'Reparo verifică service-urile?',a:'Da. Service-urile pot solicita badge-ul "Verificat Reparo" după un audit simplu. Crește încrederea clienților.'},
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState(STATS_DEFAULT)

  useEffect(() => {
    // Fetch real stats from Supabase
    async function loadStats() {
      try {
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const [svcsRes, reqsRes, ratingsRes, responseRes] = await Promise.all([
          supabase.from('services').select('id', {count:'exact',head:true}).eq('is_active',true),
          supabase.from('quote_requests').select('id', {count:'exact',head:true}),
          supabase.from('services').select('rating_avg').eq('is_active',true).gt('rating_count',0),
          supabase.from('offers').select('id', {count:'exact',head:true}),
        ])
        const totalServices = svcsRes.count || 0
        const totalRequests = reqsRes.count || 0
        const totalOffers = responseRes.count || 0

        // Rating mediu
        const ratings = ratingsRes.data || []
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, s) => sum + (s.rating_avg || 0), 0) / ratings.length).toFixed(1)
          : '—'

        // Rata de răspuns = oferte / cereri * 100
        const responseRate = totalRequests > 0
          ? Math.min(Math.round((totalOffers / totalRequests) * 100), 100)
          : 0

        const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1).replace('.0','')}K+` : n > 0 ? `${n}+` : '—'

        setStats([
          {value: fmt(totalServices), label:'Service-uri înregistrate'},
          {value: fmt(totalRequests), label:'Cereri trimise'},
          {value: avgRating !== '—' ? `${avgRating}/5` : '—', label:'Rating mediu platformă'},
          {value: responseRate > 0 ? `${responseRate}%` : '—', label:'Rata de răspuns'},
        ])
      } catch(e) {
        console.error('Stats load failed:', e)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.white,overflowX:'hidden'}}>

      {/* ── NAV ── */}
      <nav className={`lp-nav${scrolled?' scrolled':''}`}>
        <a href="/home" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:36,height:36,background:S.blue,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:'#fff'}}>R</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:'#fff',letterSpacing:-0.5}}>Reparo</span>
        </a>

        <div className="lp-nav-links">
          {[['Funcții','#funcții'],['Cum funcționează','#cum-functioneaza'],['Prețuri','#prețuri'],['FAQ','#faq'],['Contact','/contact']].map(([item,href])=>(
            <a key={item} href={href} style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,0.8)',textDecoration:'none'}}>{item}</a>
          ))}
          <a href="/auth/login" style={{fontSize:14,fontWeight:600,color:'#fff',textDecoration:'none',border:'1.5px solid rgba(255,255,255,0.35)',padding:'8px 16px',borderRadius:50}}>
            Intră în cont
          </a>
          <a href="/auth/register" style={{fontSize:14,fontWeight:700,background:S.yellow,color:'#fff',textDecoration:'none',padding:'10px 20px',borderRadius:50,boxShadow:'0 4px 16px rgba(245,158,11,0.3)',fontFamily:"'Sora',sans-serif"}}>
            Înregistrează-te →
          </a>
        </div>

        {/* Hamburger */}
        <div className="lp-hamburger" onClick={()=>setMenuOpen(!menuOpen)}>
          <span style={{transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
          <span style={{opacity:menuOpen?0:1}}/>
          <span style={{transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lp-mobile-menu${menuOpen?' open':''}`}>
        {[['Funcții','#funcții'],['Cum funcționează','#cum-functioneaza'],['Prețuri','#prețuri'],['FAQ','#faq'],['Contact','/contact']].map(([item,href])=>(
          <a key={item} href={href} onClick={()=>setMenuOpen(false)}>{item}</a>
        ))}
        <a href="/auth/login" onClick={()=>setMenuOpen(false)} style={{color:'rgba(255,255,255,0.6)'}}>Intră în cont</a>
        <a href="/auth/register" className="lp-mobile-cta" onClick={()=>setMenuOpen(false)}>
          ✦ Înregistrează-te gratuit
        </a>
      </div>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div style={{position:'absolute',top:-100,right:-100,width:500,height:500,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.05)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-200,left:-100,width:600,height:600,borderRadius:'50%',background:'rgba(26,86,219,0.1)',pointerEvents:'none'}}/>

        <div className="lp-hero-grid">
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'6px 14px',borderRadius:50,marginBottom:24,fontFamily:"'Sora',sans-serif"}}>
              🚀 Platforma #1 pentru service-uri auto din România
            </div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(28px,5vw,52px)',color:'#fff',lineHeight:1.1,marginBottom:20,letterSpacing:-1}}>
              Mai mulți clienți.<br/>
              <span style={{color:S.blueLight}}>Mai puțin efort.</span><br/>
              Creați mai repede.
            </h1>
            <p style={{fontSize:'clamp(14px,2vw,17px)',color:'rgba(255,255,255,0.6)',lineHeight:1.7,marginBottom:32,maxWidth:480}}>
              Reparo conectează service-urile auto cu șoferii care au nevoie de reparații. Tu primești cereri de ofertă, trimiți prețul tău și câștigi clienți fideli.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:32}}>
              <a href="/auth/register" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 28px',background:S.yellow,color:'#fff',textDecoration:'none',borderRadius:50,fontSize:'clamp(14px,2vw,16px)',fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:'0 8px 24px rgba(245,158,11,0.4)'}}>
                ✦ Înregistrează-te gratuit
              </a>
              <a href="#cum-functioneaza" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 24px',color:'rgba(255,255,255,0.8)',textDecoration:'none',borderRadius:50,fontSize:15,fontWeight:600,border:'1.5px solid rgba(255,255,255,0.2)'}}>
                Cum funcționează? →
              </a>
            </div>
            <div className="lp-trust">
              {[['✓','Gratuit să începi'],['✓','Fără comisioane'],['✓','Suport 24/7']].map(([check,label])=>(
                <div key={label} style={{fontSize:13,color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:4}}>
                  <span style={{color:S.yellow}}>{check}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="lp-stats-card">
            <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:2,marginBottom:20,fontFamily:"'Sora',sans-serif"}}>Platforma în cifre</div>
            <div className="lp-stats-grid">
              {stats.map(s=>(
                <div key={s.label} style={{background:'rgba(255,255,255,0.05)',borderRadius:14,padding:'16px 14px'}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(20px,4vw,28px)',color:S.yellow,marginBottom:4}}>{s.value}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',lineHeight:1.4}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,padding:'14px 16px',background:S.greenBg,borderRadius:12,border:`1px solid ${S.green}30`}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:16,flexShrink:0}}>⭐</span>
                <div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.green}}>Service-uri câștigă în medie 23 clienți noi/lună</div>
                  <div style={{fontSize:11,color:S.green,opacity:.7}}>din cereri venite prin Reparo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcții" className="lp-section" style={{background:S.bg}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{display:'inline-block',background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif"}}>Tot ce ai nevoie</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,3vw,40px)',color:S.navy,marginBottom:12,letterSpacing:-0.5}}>O platformă completă pentru service-ul tău</h2>
            <p style={{fontSize:16,color:S.muted,maxWidth:500,margin:'0 auto',lineHeight:1.7}}>Tot ce ai nevoie pentru a atrage și gestiona clienți — într-un singur loc.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map(f=>(
              <div key={f.title} className="feat-card" style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:'24px 20px',transition:'all .2s',cursor:'default'}}>
                <div style={{width:48,height:48,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:14}}>{f.icon}</div>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:14,color:S.muted,lineHeight:1.6,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cum-functioneaza" className="lp-section" style={{background:S.white}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{display:'inline-block',background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif"}}>Simplu de folosit</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,3vw,40px)',color:S.navy,letterSpacing:-0.5}}>Cum funcționează Reparo</h2>
          </div>
          <div className="lp-steps-grid">
            {STEPS.map((step,i)=>(
              <div key={step.nr} style={{textAlign:'center',position:'relative'}}>
                {i < STEPS.length-1 && (
                  <div className="step-connector" style={{position:'absolute',top:30,left:'60%',width:'80%',height:1,background:`linear-gradient(90deg,${S.blue},${S.border})`,zIndex:0}}/>
                )}
                <div style={{width:60,height:60,background:S.white,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.blue,margin:'0 auto 16px',border:`2px solid ${S.border}`,position:'relative',zIndex:1}}>
                  {step.nr}
                </div>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:8}}>{step.title}</h3>
                <p style={{fontSize:13,color:S.muted,lineHeight:1.6,margin:0}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="prețuri" className="lp-section" style={{background:S.bg}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{display:'inline-block',background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif"}}>Transparent</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,3vw,40px)',color:S.navy,marginBottom:12,letterSpacing:-0.5}}>Prețuri simple, fără surprize</h2>
            <p style={{fontSize:16,color:S.muted}}>Nicio comision per client. Plătești fix pe lună.</p>
          </div>
          <div className="lp-plans-grid">
            {PLANS.map(plan=>(
              <div key={plan.name} className="plan-card"
                style={{background:plan.primary?S.navy:S.white,borderRadius:20,border:`1.5px solid ${plan.primary?S.navy:S.border}`,padding:28,transition:'all .25s',cursor:'default',position:'relative',overflow:'hidden'}}>
                {plan.primary && (
                  <div style={{position:'absolute',top:0,right:0,background:S.yellow,color:'#fff',fontSize:10,fontWeight:700,padding:'6px 16px 6px 20px',borderBottomLeftRadius:12,fontFamily:"'Sora',sans-serif"}}>POPULAR</div>
                )}
                <div style={{marginBottom:20}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:plan.primary?'rgba(255,255,255,0.6)':S.muted,marginBottom:4}}>{plan.name}</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:4,flexWrap:'wrap'}}>
                    <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(28px,4vw,36px)',color:plan.primary?'#fff':S.navy}}>{plan.price} RON</span>
                    <span style={{fontSize:14,color:plan.primary?'rgba(255,255,255,0.4)':S.muted}}>{plan.period}</span>
                  </div>
                </div>
                <div style={{marginBottom:24}}>
                  {plan.features.map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${plan.primary?'rgba(255,255,255,0.08)':S.border}`}}>
                      <span style={{color:S.yellow,fontSize:14,flexShrink:0}}>✓</span>
                      <span style={{fontSize:13,color:plan.primary?'rgba(255,255,255,0.8)':S.muted}}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/auth/register"
                  style={{display:'block',textAlign:'center',padding:'13px',borderRadius:50,fontSize:14,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif",background:plan.primary?S.yellow:'transparent',color:plan.primary?'#fff':S.blue,border:`1.5px solid ${plan.primary?S.yellow:S.blue}`}}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Banner dezmembrari */}
          <div style={{marginTop:24,background:'#fef3c7',borderRadius:16,border:'1px solid rgba(217,119,6,0.2)',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:32}}>🔩</span>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:'#92400e',marginBottom:3}}>Ești parc de dezmembrări?</div>
                <div style={{fontSize:13,color:'#b45309'}}>Avem planuri speciale pentru tine — publică piese, primești cereri de ofertă direct.</div>
              </div>
            </div>
            <a href="/dezmembrari-abonamente"
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'11px 22px',background:'#d97706',color:'#fff',borderRadius:50,fontSize:13,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap',boxShadow:'0 4px 12px rgba(217,119,6,0.3)',flexShrink:0}}>
              Vezi abonamente dezmembrări →
            </a>
          </div>
        </div>
      </section>
      <section id="faq" className="lp-section" style={{background:S.white}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,3vw,36px)',color:S.navy,letterSpacing:-0.5}}>Întrebări frecvente</h2>
          </div>
          {FAQS_DATA.map((faq,i)=>(
            <div key={i} onClick={()=>setOpenFaq(openFaq===i?null:i)}
              style={{border:`1px solid ${S.border}`,borderRadius:14,padding:'18px 20px',marginBottom:10,cursor:'pointer',transition:'all .2s',background:openFaq===i?'#f8faff':S.white}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:'clamp(13px,2vw,15px)',color:S.navy,paddingRight:12}}>{faq.q}</div>
                <div style={{color:S.blue,fontSize:20,fontWeight:300,flexShrink:0,transition:'transform .2s',transform:openFaq===i?'rotate(45deg)':'none'}}>+</div>
              </div>
              {openFaq===i && <p style={{fontSize:14,color:S.muted,lineHeight:1.7,margin:'12px 0 0',paddingTop:12,borderTop:`1px solid ${S.border}`}}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="lp-section" style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,textAlign:'center'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div style={{display:'inline-block',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:20,fontFamily:"'Sora',sans-serif"}}>
            Fii printre primii
          </div>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,4vw,44px)',color:'#fff',marginBottom:16,letterSpacing:-0.5}}>
            Gata să câștigi mai mulți clienți?
          </h2>
          <p style={{fontSize:'clamp(14px,2vw,16px)',color:'rgba(255,255,255,0.55)',marginBottom:32,lineHeight:1.7}}>
            Alătură-te celor {stats[0].value !== '—' ? stats[0].value : 'mii de'} service-uri care folosesc deja Reparo. Înregistrarea e gratuită și durează 5 minute.
          </p>
          <a href="/auth/register"
            style={{display:'inline-flex',alignItems:'center',gap:10,padding:'16px 32px',background:S.yellow,color:'#fff',textDecoration:'none',borderRadius:50,fontSize:'clamp(14px,2vw,17px)',fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:'0 8px 32px rgba(245,158,11,0.4)'}}>
            ✦ Înregistrează service-ul gratuit →
          </a>
          <div className="lp-final-badges">
            {['✓ Gratuit să începi','✓ Fără card bancar','✓ Anulezi oricând'].map(t=>(
              <div key={t} style={{fontSize:13,color:'rgba(255,255,255,0.45)'}}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,background:S.blue,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'#fff',fontFamily:"'Sora',sans-serif"}}>R</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:'#fff'}}>Reparo</span>
        </div>
        <div className="lp-footer-links">
          {[['Termeni și condiții','/termeni'],['Confidențialitate','/confidentialitate'],['Contact','/contact']].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:13,color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>{l}</a>
          ))}
        </div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>© 2026 Reparo. Toate drepturile rezervate.</div>
      </footer>
    </div>
  )
}
