// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',
}

const PACKAGES = [
  {
    key:'start', label:'START', emoji:'🟢', price:19,
    color:'#16a34a', bg:'#dcfce7', borderColor:'#16a34a',
    features:['Promovare în listă 3 zile','1 reactualizare (urcare în top)','Vizibilitate standard'],
    badge:null,
  },
  {
    key:'boost', label:'BOOST', emoji:'🔵', price:49,
    color:S.blue, bg:'#eaf3ff', borderColor:S.blue,
    features:['Promovare în listă 7 zile','3 reactualizări','Vizibilitate crescută în căutări','Badge BOOST pe anunț'],
    badge:'CEL MAI ALES ⭐',
  },
  {
    key:'pro', label:'PRO', emoji:'🟠', price:99,
    color:'#ea580c', bg:'#fff7ed', borderColor:'#ea580c',
    features:['Promovare în listă 30 zile','10 reactualizări','Promovare pe prima pagină 5 zile','Vizibilitate maximă','Badge PRO pe anunț'],
    badge:null,
  },
]

function PromoContent() {
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing_id')
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState('boost')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      if (listingId) {
        const { data } = await supabase.from('listings').select('*').eq('id', listingId).single()
        setListing(data)
      }
      setLoading(false)
    }
    load()
  }, [listingId])

  async function handlePay() {
    setPaying(true)
    const pkg = PACKAGES.find(p=>p.key===selected)
    const days = selected==='start'?3:selected==='boost'?7:30
    const refreshes = selected==='start'?1:selected==='boost'?3:10
    // În producție → Stripe checkout. Acum simulăm aprobarea
    if (listingId) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + days)
      await supabase.from('listings').update({
        is_promoted: true,
        promoted_until: expiresAt.toISOString(),
        promotion_package: selected,
        promotion_refreshes_left: refreshes,
      }).eq('id', listingId)
    }
    setTimeout(() => { setPaying(false); setDone(true) }, 1500)
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (done) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{textAlign:'center',padding:40}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,marginBottom:8}}>Anunțul tău este promovat!</div>
        <p style={{fontSize:15,color:S.muted,marginBottom:24}}>Pachetul {PACKAGES.find(p=>p.key===selected)?.label} a fost activat.</p>
        <a href="/anunturile-mele" style={{display:'inline-flex',padding:'12px 28px',background:S.blue,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Vezi anunțurile mele →</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:800,margin:'0 auto',padding:'32px 16px'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'inline-block',background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:12,fontFamily:"'Sora',sans-serif"}}>Promovare anunț</div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(22px,4vw,34px)',color:S.navy,marginBottom:8}}>Alege pachetul de promovare</h1>
          <p style={{fontSize:15,color:S.muted}}>Crește vizibilitatea anunțului tău și vinde mai rapid.</p>
        </div>

        {/* Listing preview */}
        {listing && (
          <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:'14px 18px',marginBottom:28,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📦</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{listing.title}</div>
              <div style={{fontSize:12,color:S.muted}}>{listing.price?`${listing.price.toLocaleString()} lei`:'Preț negociabil'} · {listing.city}</div>
            </div>
            {listing.is_promoted&&<span style={{background:S.greenBg,color:S.green,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50}}>Deja promovat</span>}
          </div>
        )}

        {/* Packages */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:28}}>
          {PACKAGES.map(pkg=>(
            <div key={pkg.key} onClick={()=>setSelected(pkg.key)}
              style={{background:selected===pkg.key?pkg.bg:S.white,borderRadius:20,border:`2px solid ${selected===pkg.key?pkg.borderColor:S.border}`,padding:24,cursor:'pointer',position:'relative',transition:'all .2s',transform:selected===pkg.key?'scale(1.02)':'scale(1)'}}>
              {pkg.badge&&(
                <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',background:pkg.color,color:'#fff',fontSize:10,fontWeight:700,padding:'4px 14px',borderRadius:'0 0 12px 12px',whiteSpace:'nowrap',fontFamily:"'Sora',sans-serif"}}>
                  {pkg.badge}
                </div>
              )}
              <div style={{textAlign:'center',marginBottom:16,marginTop:pkg.badge?12:0}}>
                <div style={{fontSize:32,marginBottom:6}}>{pkg.emoji}</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:S.navy,marginBottom:4}}>{pkg.label}</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:32,color:pkg.color}}>{pkg.price} <span style={{fontSize:16,fontWeight:600}}>RON</span></div>
              </div>
              {pkg.features.map(f=>(
                <div key={f} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:8,fontSize:13,color:S.muted}}>
                  <span style={{color:pkg.color,fontWeight:700,flexShrink:0}}>✓</span>{f}
                </div>
              ))}
              <div style={{marginTop:16,padding:'10px',borderRadius:50,textAlign:'center',background:selected===pkg.key?pkg.color:'transparent',border:`2px solid ${selected===pkg.key?pkg.color:S.border}`,color:selected===pkg.key?'#fff':S.muted,fontWeight:700,fontSize:13,transition:'all .2s'}}>
                {selected===pkg.key?'✓ Selectat':'Selectează'}
              </div>
            </div>
          ))}
        </div>

        {/* Pay button */}
        <div style={{textAlign:'center'}}>
          <button onClick={handlePay} disabled={paying}
            style={{display:'inline-flex',alignItems:'center',gap:10,padding:'15px 40px',background:paying?S.muted:S.yellow,color:'#fff',border:'none',borderRadius:50,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 8px 24px rgba(245,158,11,0.3)',transition:'all .2s'}}>
            {paying?'Se procesează...':'💳 Plătește '+PACKAGES.find(p=>p.key===selected)?.price+' RON →'}
          </button>
          <div style={{fontSize:12,color:S.muted,marginTop:10}}>Plată securizată prin Stripe · Anulezi oricând</div>
        </div>

      </div>
    </div>
  )
}

export default function PromoveazaPage() {
  return <Suspense><PromoContent/></Suspense>
}
