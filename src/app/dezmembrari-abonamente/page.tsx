// @ts-nocheck
'use client'
import { useState } from 'react'

const S = {
  navy:'#0a1f44', blue:'#1a56db', yellow:'#f59e0b',
  bg:'#f0f6ff', white:'#fff', muted:'#6b7280', border:'#e5e7eb',
  green:'#16a34a', orange:'#ea580c',
}

const CHECK = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}>
    <circle cx="8" cy="8" r="8" fill="#16a34a" opacity="0.15"/>
    <polyline points="4.5,8 6.8,10.5 11.5,5.5" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DASH = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}>
    <circle cx="8" cy="8" r="8" fill="#e5e7eb" opacity="0.5"/>
    <line x1="5" y1="8" x2="11" y2="8" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const PLANS = {
  basic: [
    {
      key:'b1', name:'Basic P1', price:30, popular:false, color:S.muted, accent:'#6b7280',
      features:[
        {label:'Nr. maxim de anunțuri', value:'300'},
        {label:'Relistare anunțuri săptămânal', value:'50'},
        {label:'Nr. oferte gratuite la cereri', value:'100'},
        {label:'Generator anunțuri dezmembrări', value:false},
        {label:'Relistare automată anunțuri', value:false},
        {label:'Import produse (CSV, XML)', value:false},
        {label:'Poziționare în căutări', value:'Secundară'},
        {label:'Pagină personalizată de firmă', value:false},
        {label:'Valabilitate', value:'30 zile'},
      ]
    },
    {
      key:'b2', name:'Basic P2', price:50, popular:true, color:S.blue, accent:S.blue,
      features:[
        {label:'Nr. maxim de anunțuri', value:'3.000'},
        {label:'Relistare anunțuri săptămânal', value:'1.000'},
        {label:'Nr. oferte gratuite la cereri', value:'1.000'},
        {label:'Generator anunțuri dezmembrări', value:false},
        {label:'Relistare automată anunțuri', value:false},
        {label:'Import produse (CSV, XML)', value:false},
        {label:'Poziționare în căutări', value:'Secundară'},
        {label:'Pagină personalizată de firmă', value:false},
        {label:'Valabilitate', value:'30 zile'},
      ]
    },
    {
      key:'b3', name:'Basic Gold', price:100, popular:false, color:'#b45309', accent:'#b45309',
      badge:'GOLD ⭐',
      features:[
        {label:'Nr. maxim de anunțuri', value:'100.000'},
        {label:'Relistare anunțuri săptămânal', value:'5.000'},
        {label:'Nr. oferte gratuite la cereri', value:'Nelimitat'},
        {label:'Generator anunțuri dezmembrări', value:'1 mașină / cont'},
        {label:'Relistare automată anunțuri', value:'1 anunț la 20 min'},
        {label:'Import produse (CSV, XML)', value:true},
        {label:'Poziționare în căutări', value:'Avantaj Gold'},
        {label:'Pagină personalizată de firmă', value:false},
        {label:'Valabilitate', value:'30 zile'},
      ]
    },
  ],
  business: [
    {
      key:'bg', name:'Gold', price:30, popular:false, color:'#b45309', accent:'#b45309',
      badge:'G',
      features:[
        {label:'Afișare prioritară în căutări', value:true},
        {label:'Afișare prioritară în catalog firme', value:false},
        {label:'Anunțuri consecutive în căutări', value:'1 anunț relevant'},
        {label:'Ofertare la cereri piese', value:'Nelimitat'},
        {label:'Nr. maxim de anunțuri', value:'100.000'},
        {label:'Generator anunțuri dezmembrări', value:'1 mașină / cont'},
        {label:'Relistare automată anunțuri', value:'1 la 20 min'},
        {label:'Relistare automată extra', value:'5.000 / săptămână'},
        {label:'Pagină personalizată de firmă', value:true},
        {label:'Căutare doar în anunțurile firmei', value:true},
        {label:'Import produse (CSV, XML)', value:true},
        {label:'Valabilitate', value:'30 zile'},
      ]
    },
    {
      key:'bp', name:'Premium', price:50, popular:true, color:'#7c3aed', accent:'#7c3aed',
      badge:'P',
      features:[
        {label:'Afișare prioritară în căutări', value:true},
        {label:'Afișare prioritară în catalog firme', value:false},
        {label:'Anunțuri consecutive în căutări', value:'2 anunțuri relevante'},
        {label:'Ofertare la cereri piese', value:'Nelimitat'},
        {label:'Nr. maxim de anunțuri', value:'1.000.000'},
        {label:'Generator anunțuri dezmembrări', value:'Nelimitat'},
        {label:'Relistare automată anunțuri', value:'1 la 10 min'},
        {label:'Relistare automată extra', value:'10.000 / săptămână'},
        {label:'Pagină personalizată de firmă', value:true},
        {label:'Căutare doar în anunțurile firmei', value:true},
        {label:'Import produse (CSV, XML)', value:true},
        {label:'Valabilitate', value:'30 zile'},
      ]
    },
    {
      key:'bpl', name:'Platinum', price:100, popular:false, color:'#0891b2', accent:'#0891b2',
      badge:'Z',
      features:[
        {label:'Afișare prioritară în căutări', value:'1 anunț relevant / căutare'},
        {label:'Afișare prioritară în catalog firme', value:true},
        {label:'Anunțuri consecutive în căutări', value:'2 anunțuri relevante'},
        {label:'Ofertare la cereri piese', value:'Nelimitat'},
        {label:'Nr. maxim de anunțuri', value:'1.000.000'},
        {label:'Generator anunțuri dezmembrări', value:'Nelimitat'},
        {label:'Relistare automată anunțuri', value:'1 la 10 min'},
        {label:'Relistare automată extra', value:'10.000 / săptămână'},
        {label:'Pagină personalizată de firmă', value:true},
        {label:'Căutare doar în anunțurile firmei', value:true},
        {label:'Import produse (CSV, XML)', value:true},
        {label:'Valabilitate', value:'30 zile'},
      ]
    },
  ]
}

function FeatureRow({label, value}) {
  const isTrue = value === true
  const isFalse = value === false
  return (
    <div style={{padding:'10px 0',borderBottom:`1px solid ${S.border}`}}>
      <div style={{fontSize:12,color:S.muted,marginBottom:3}}>{label}</div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        {isFalse ? <DASH/> : <CHECK/>}
        <span style={{fontSize:13,fontWeight:600,color:isTrue?S.green:isFalse?'#9ca3af':S.navy}}>
          {isTrue ? 'Da' : isFalse ? '—' : value}
        </span>
      </div>
    </div>
  )
}

export default function DezmembrariAbonamente() {
  const [tab, setTab] = useState<'basic'|'business'>('basic')

  const plans = PLANS[tab]

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'40px 24px 36px',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif"}}>
          🔩 Parcuri de dezmembrări
        </div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,4vw,34px)',color:'#fff',marginBottom:10,letterSpacing:-0.5}}>
          Abonamente Dezmembrări
        </h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:15,maxWidth:520,margin:'0 auto 28px',lineHeight:1.7}}>
          Publică piese și vehicule pentru dezmembrare. Primești cereri de ofertă direct de la clienți din toată România.
        </p>

        {/* Tab switcher */}
        <div style={{display:'inline-flex',background:'rgba(255,255,255,0.1)',borderRadius:50,padding:4,gap:2}}>
          {(['basic','business'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:'10px 28px',borderRadius:50,border:'none',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",background:tab===t?'#fff':'transparent',color:tab===t?S.navy:'rgba(255,255,255,0.7)',transition:'all .2s'}}>
              ABONAMENTE {t.toUpperCase()}
            </button>
          ))}
        </div>
        {tab==='business'&&(
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginTop:10}}>ⓘ Aceste abonamente sunt pentru persoane juridice</p>
        )}
      </div>

      {/* Plans grid */}
      <div style={{maxWidth:960,margin:'0 auto',padding:'32px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,alignItems:'start'}}>
          {plans.map(plan=>(
            <div key={plan.key} style={{background:S.white,borderRadius:20,border:`2px solid ${plan.popular?plan.accent:S.border}`,overflow:'hidden',position:'relative'}}>

              {/* Popular badge */}
              {plan.popular&&(
                <div style={{position:'absolute',top:0,left:0,right:0,textAlign:'center',background:plan.accent,color:'#fff',fontSize:11,fontWeight:700,letterSpacing:1,padding:'5px 0',fontFamily:"'Sora',sans-serif"}}>
                  ⭐ CEL MAI ALES
                </div>
              )}

              {/* Plan header */}
              <div style={{padding:plan.popular?'44px 24px 20px':'24px 24px 20px',borderBottom:`1px solid ${S.border}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div>
                    <div style={{fontSize:11,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>Abonament</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:plan.accent}}>{plan.name}</div>
                  </div>
                  {plan.badge&&(
                    <div style={{width:44,height:44,borderRadius:'50%',background:plan.accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:plan.badge.length>1?11:18,fontWeight:800,flexShrink:0}}>
                      {plan.badge.length===1?plan.badge:plan.badge.split(' ')[0]}
                    </div>
                  )}
                </div>
                <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                  <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:36,color:S.navy}}>{plan.price}€</span>
                  <span style={{fontSize:13,color:S.muted}}>+ TVA / lună</span>
                </div>
              </div>

              {/* Features */}
              <div style={{padding:'8px 24px 0'}}>
                {plan.features.map(f=>(
                  <FeatureRow key={f.label} label={f.label} value={f.value}/>
                ))}
              </div>

              {/* CTA */}
              <div style={{padding:'20px 24px 24px'}}>
                <button
                  onClick={()=>alert('Integrare Stripe în curând!')}
                  style={{width:'100%',padding:'13px',background:plan.popular?plan.accent:'transparent',color:plan.popular?'#fff':plan.accent,border:`2px solid ${plan.accent}`,borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",transition:'all .2s'}}>
                  ACTIVEAZĂ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info footer */}
        <div style={{marginTop:32,background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:24}}>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:16}}>ℹ️ Informații utile</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
            {[
              {icon:'🔄',title:'Relistare automată',desc:'Anunțurile tale urcă automat în top la intervalul ales, fără intervenție manuală.'},
              {icon:'📦',title:'Generator dezmembrări',desc:'Adaugă o mașină și generăm automat anunțuri pentru toate piesele disponibile.'},
              {icon:'📩',title:'Cereri de ofertă',desc:'Primești direct cereri de la clienți care caută piese pentru mașina lor.'},
              {icon:'📊',title:'Import CSV/XML',desc:'Importă stocul din sistemul tău existent direct pe platformă în câteva clicuri.'},
            ].map(item=>(
              <div key={item.title} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <span style={{fontSize:24,flexShrink:0}}>{item.icon}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:S.navy,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>{item.title}</div>
                  <div style={{fontSize:12,color:S.muted,lineHeight:1.6}}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{textAlign:'center',fontSize:12,color:S.muted,marginTop:20}}>
          Prețurile sunt exprimate în EUR + TVA · Facturare lunară · Poți anula oricând
        </p>
      </div>
    </div>
  )
}
