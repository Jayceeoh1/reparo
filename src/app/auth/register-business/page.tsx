// @ts-nocheck
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
}
const inp = {width:'100%',padding:'11px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',boxSizing:'border-box',transition:'border-color .2s'}
const label = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5,fontFamily:"'Sora',sans-serif"}

const BUSINESS_TYPES = [
  {
    key:'magazin_piese',
    icon:'📦',
    title:'Magazin piese noi',
    desc:'Vinzi piese auto noi — OEM, aftermarket sau accesorii auto.',
    color:'#16a34a',
    bg:'#dcfce7',
    features:['Cereri de piese','Catalog produse','Oferte & comenzi','Promovare anunțuri'],
  },
  {
    key:'dezmembrari',
    icon:'🚗',
    title:'Parc dezmembrări',
    desc:'Oferi piese second-hand din mașini dezmembrate.',
    color:'#d97706',
    bg:'#fef3c7',
    features:['Cereri piese SH','Mașini dezmembrate','Piese listate','Oferte clienți'],
  },
  {
    key:'mixt',
    icon:'⚡',
    title:'Cont mixt',
    desc:'Faci atât service auto cât și vinzi piese. Modulele se activează separat.',
    color:'#7c3aed',
    bg:'#ede9fe',
    features:['Toate modulele incluse','Service + piese','Gestionare separată','Un singur cont'],
  },
]

const STEPS = ['Tip business','Date firmă','Cont','Confirmare']

export default function RegisterBusinessPage() {
  const [step, setStep] = useState(1)
  const [businessType, setBusinessType] = useState('')
  const [firm, setFirm] = useState({name:'',cui:'',address:'',city:'',phone:'',website:''})
  const [account, setAccount] = useState({email:'',password:'',confirm_password:''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const selectedType = BUSINESS_TYPES.find(b => b.key === businessType)

  async function handleRegister() {
    if (account.password !== account.confirm_password) { setError('Parolele nu coincid.'); return }
    if (account.password.length < 6) { setError('Parola trebuie să aibă minim 6 caractere.'); return }
    if (!firm.name || !firm.city || !firm.phone) { setError('Completează toate câmpurile obligatorii.'); return }
    setLoading(true); setError('')

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          full_name: firm.name,
          role: 'service',
          business_type: businessType,
          city: firm.city,
          phone: firm.phone,
        }
      }
    })

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: firm.name,
        role: 'service',
        city: firm.city,
        phone: firm.phone,
      })
      await supabase.from('services').insert({
        owner_id: data.user.id,
        name: firm.name,
        city: firm.city,
        phone: firm.phone,
        website: firm.website || null,
        cui: firm.cui || null,
        address: firm.address || null,
        business_type: businessType,
        is_active: true,
        plan: 'free',
      })
    }

    setLoading(false)
    setDone(true)
    setTimeout(() => { window.location.href = '/dashboard/service' }, 2500)
  }

  if (done) return (
    <div style={{minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:'center',background:S.white,borderRadius:20,padding:'48px 32px',maxWidth:400,width:'100%',boxShadow:'0 8px 40px rgba(10,31,68,0.1)'}}>
        <div style={{fontSize:72,marginBottom:16}}>🎉</div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,marginBottom:8}}>Contul a fost creat!</h2>
        <p style={{fontSize:14,color:S.muted,marginBottom:6}}>Bine ai venit pe Reparo, <strong>{firm.name}</strong>!</p>
        <p style={{fontSize:13,color:S.muted}}>Te redirecționăm către dashboard...</p>
        <div style={{marginTop:20,width:40,height:40,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'20px auto 0'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#eaf3ff 0%,#f8fbff 60%,#fff8ed 100%)',fontFamily:"'DM Sans',sans-serif",padding:'24px 16px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .auth-inp:focus{border-color:#1a56db!important}
        .btype-card{transition:all .2s;cursor:pointer;border:1.5px solid #e5e7eb;border-radius:16px;padding:18px;background:#fff;text-align:left;width:100%}
        .btype-card:hover{border-color:#1a56db;box-shadow:0 4px 16px rgba(26,86,219,0.1)}
        .btype-card.selected{box-shadow:0 4px 20px rgba(26,86,219,0.15)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .35s ease forwards}
        @media(max-width:600px){.type-grid{grid-template-columns:1fr!important}.form-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{maxWidth:600,margin:'0 auto'}}>

        {/* Logo */}
        <div className="fade-up" style={{textAlign:'center',marginBottom:24}}>
          <a href="/home" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:10,marginBottom:4}}>
            <div style={{width:40,height:40,background:S.blue,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:'#fff',boxShadow:'0 4px 14px rgba(26,86,219,0.3)'}}>R</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy}}>Reparo</span>
          </a>
          <div style={{fontSize:13,color:S.muted}}>Înregistrare cont business</div>
        </div>

        {/* Progress */}
        <div className="fade-up" style={{display:'flex',alignItems:'center',marginBottom:24,animationDelay:'.05s'}}>
          {STEPS.map((s, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <div key={s} style={{display:'flex',alignItems:'center',flex:i < STEPS.length-1 ? 1 : 0}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,fontFamily:"'Sora',sans-serif",background:done||active?S.blue:'#e5e7eb',color:done||active?'#fff':S.muted,flexShrink:0,transition:'all .3s'}}>
                    {done ? '✓' : n}
                  </div>
                  <div style={{fontSize:9,color:active?S.blue:S.muted,fontWeight:active?700:400,whiteSpace:'nowrap',fontFamily:"'Sora',sans-serif"}}>{s}</div>
                </div>
                {i < STEPS.length-1 && <div style={{flex:1,height:2,background:step>n?S.blue:'#e5e7eb',margin:'0 4px',marginBottom:14,transition:'all .3s'}}/>}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="fade-up" style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,boxShadow:'0 8px 40px rgba(10,31,68,0.1)',padding:28,animationDelay:'.1s'}}>

          {/* ── STEP 1: Tip business ── */}
          {step === 1 && (
            <>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:4,textAlign:'center'}}>Ce tip de business ai?</h1>
              <p style={{fontSize:13,color:S.muted,textAlign:'center',marginBottom:20}}>Alege profilul potrivit — poți schimba mai târziu din setări</p>

              <div className="type-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                {BUSINESS_TYPES.map(b => {
                  const isSelected = businessType === b.key
                  return (
                    <button key={b.key} onClick={() => setBusinessType(b.key)} className={`btype-card${isSelected?' selected':''}`}
                      style={{border:`1.5px solid ${isSelected?b.color:S.border}`,background:isSelected?b.bg:'#fff'}}>
                      <div style={{fontSize:32,marginBottom:8}}>{b.icon}</div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>{b.title}</div>
                      <div style={{fontSize:11,color:S.muted,lineHeight:1.5,marginBottom:10}}>{b.desc}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:3}}>
                        {b.features.map(f => (
                          <div key={f} style={{fontSize:11,color:isSelected?b.color:S.muted,display:'flex',alignItems:'center',gap:4}}>
                            <span style={{color:isSelected?b.color:S.border,fontWeight:700}}>✓</span> {f}
                          </div>
                        ))}
                      </div>
                      {isSelected && (
                        <div style={{marginTop:10,display:'flex',alignItems:'center',gap:4,color:b.color,fontSize:12,fontWeight:700}}>
                          <div style={{width:18,height:18,borderRadius:'50%',background:b.color,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <span style={{color:'#fff',fontSize:10}}>✓</span>
                          </div>
                          Selectat
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <button onClick={() => setStep(2)} disabled={!businessType}
                style={{width:'100%',padding:'13px',background:businessType?S.blue:'#e5e7eb',color:businessType?'#fff':S.muted,border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:businessType?'pointer':'not-allowed',fontFamily:"'Sora',sans-serif",boxShadow:businessType?'0 4px 16px rgba(26,86,219,0.25)':'none',transition:'all .2s'}}>
                Continuă → {selectedType ? selectedType.title : ''}
              </button>
            </>
          )}

          {/* ── STEP 2: Date firmă ── */}
          {step === 2 && (
            <>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <button onClick={() => setStep(1)} style={{background:S.bg,border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',color:S.muted,flexShrink:0}}>←</button>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>Date firmă</h1>
                  <div style={{fontSize:12,color:S.muted,display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                    <span style={{fontSize:16}}>{selectedType?.icon}</span> {selectedType?.title}
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={label}>Numele firmei / business-ului *</label>
                  <input className="auth-inp" type="text" required value={firm.name}
                    onChange={e => setFirm(p => ({...p, name:e.target.value}))}
                    placeholder={businessType==='service'?'Auto Pro SRL':businessType==='magazin_piese'?'Piese Auto SRL':'Dezmembrări Nord SRL'}
                    style={inp}/>
                </div>
                <div>
                  <label style={label}>CUI / CIF</label>
                  <input className="auth-inp" type="text" value={firm.cui}
                    onChange={e => setFirm(p => ({...p, cui:e.target.value}))}
                    placeholder="RO12345678" style={inp}/>
                </div>
                <div>
                  <label style={label}>Telefon *</label>
                  <input className="auth-inp" type="tel" required value={firm.phone}
                    onChange={e => setFirm(p => ({...p, phone:e.target.value}))}
                    placeholder="07xx xxx xxx" style={inp}/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={label}>Adresă</label>
                  <input className="auth-inp" type="text" value={firm.address}
                    onChange={e => setFirm(p => ({...p, address:e.target.value}))}
                    placeholder="Str. Exemplu nr. 10" style={inp}/>
                </div>
                <div>
                  <label style={label}>Oraș *</label>
                  <input className="auth-inp" type="text" required value={firm.city}
                    onChange={e => setFirm(p => ({...p, city:e.target.value}))}
                    placeholder="București" style={inp}/>
                </div>
                <div>
                  <label style={label}>Website</label>
                  <input className="auth-inp" type="url" value={firm.website}
                    onChange={e => setFirm(p => ({...p, website:e.target.value}))}
                    placeholder="www.firma.ro" style={inp}/>
                </div>
              </div>

              <button onClick={() => {
                if (!firm.name || !firm.city || !firm.phone) { setError('Completează câmpurile obligatorii *'); return }
                setError(''); setStep(3)
              }} style={{width:'100%',padding:'13px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'all .2s'}}>
                Continuă →
              </button>
              {error && <div style={{marginTop:10,background:S.redBg,border:`1px solid ${S.red}30`,borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red}}>⚠️ {error}</div>}
            </>
          )}

          {/* ── STEP 3: Date cont ── */}
          {step === 3 && (
            <>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <button onClick={() => setStep(2)} style={{background:S.bg,border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',color:S.muted,flexShrink:0}}>←</button>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>Date de autentificare</h1>
                  <p style={{fontSize:12,color:S.muted,margin:0}}>Email și parolă pentru contul tău</p>
                </div>
              </div>

              {error && <div style={{background:S.redBg,border:`1px solid ${S.red}30`,borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red,marginBottom:14}}>⚠️ {error}</div>}

              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
                <div>
                  <label style={label}>Email *</label>
                  <input className="auth-inp" type="email" required value={account.email}
                    onChange={e => setAccount(p => ({...p, email:e.target.value}))}
                    placeholder="contact@firma.ro" style={inp}/>
                </div>
                <div>
                  <label style={label}>Parolă *</label>
                  <input className="auth-inp" type="password" required value={account.password}
                    onChange={e => setAccount(p => ({...p, password:e.target.value}))}
                    placeholder="minim 6 caractere" style={inp}/>
                </div>
                <div>
                  <label style={label}>Confirmă parola *</label>
                  <input className="auth-inp" type="password" required value={account.confirm_password}
                    onChange={e => setAccount(p => ({...p, confirm_password:e.target.value}))}
                    placeholder="••••••••" style={inp}/>
                  {account.password && account.confirm_password && account.password !== account.confirm_password && (
                    <div style={{fontSize:11,color:S.red,marginTop:4}}>⚠️ Parolele nu coincid</div>
                  )}
                  {account.password && account.confirm_password && account.password === account.confirm_password && (
                    <div style={{fontSize:11,color:S.green,marginTop:4}}>✓ Parolele coincid</div>
                  )}
                </div>
              </div>

              <button onClick={() => {
                if (!account.email || !account.password) { setError('Completează emailul și parola.'); return }
                if (account.password !== account.confirm_password) { setError('Parolele nu coincid.'); return }
                if (account.password.length < 6) { setError('Parola prea scurtă.'); return }
                setError(''); setStep(4)
              }} style={{width:'100%',padding:'13px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)'}}>
                Continuă →
              </button>
            </>
          )}

          {/* ── STEP 4: Confirmare ── */}
          {step === 4 && (
            <>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <button onClick={() => setStep(3)} style={{background:S.bg,border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',color:S.muted,flexShrink:0}}>←</button>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>Confirmă datele</h1>
                  <p style={{fontSize:12,color:S.muted,margin:0}}>Verifică înainte să creezi contul</p>
                </div>
              </div>

              {/* Summary card */}
              <div style={{background:S.bg,borderRadius:14,padding:16,marginBottom:20}}>
                {/* Business type */}
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${S.border}`,marginBottom:10}}>
                  <div style={{width:44,height:44,background:selectedType?.bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                    {selectedType?.icon}
                  </div>
                  <div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{selectedType?.title}</div>
                    <div style={{fontSize:11,color:S.muted}}>Tip business selectat</div>
                  </div>
                </div>
                {/* Details */}
                {[
                  {label:'Firmă',value:firm.name},
                  {label:'CUI',value:firm.cui||'—'},
                  {label:'Oraș',value:firm.city},
                  {label:'Telefon',value:firm.phone},
                  {label:'Adresă',value:firm.address||'—'},
                  {label:'Website',value:firm.website||'—'},
                  {label:'Email cont',value:account.email},
                ].map(({label:l,value:v}) => (
                  <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid ${S.border}`}}>
                    <span style={{fontSize:12,color:S.muted}}>{l}</span>
                    <span style={{fontSize:13,fontWeight:600,color:S.navy,textAlign:'right',maxWidth:'60%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</span>
                  </div>
                ))}
              </div>

              {error && <div style={{background:S.redBg,border:`1px solid ${S.red}30`,borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red,marginBottom:14}}>⚠️ {error}</div>}

              <button onClick={handleRegister} disabled={loading}
                style={{width:'100%',padding:'14px',background:loading?'#93c5fd':S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'all .2s',marginBottom:12}}>
                {loading ? 'Se creează contul...' : '🎉 Creează contul business gratuit'}
              </button>

              <p style={{textAlign:'center',fontSize:12,color:S.muted,lineHeight:1.6}}>
                Prin înregistrare ești de acord cu{' '}
                <a href="/termeni" style={{color:S.blue,textDecoration:'none',fontWeight:600}}>Termenii și Condițiile</a>
                {' '}și{' '}
                <a href="/confidentialitate" style={{color:S.blue,textDecoration:'none',fontWeight:600}}>Politica de Confidențialitate</a>
              </p>
            </>
          )}
        </div>

        {/* Footer links */}
        <div className="fade-up" style={{textAlign:'center',marginTop:16,fontSize:13,color:S.muted,animationDelay:'.2s'}}>
          Ești client?{' '}
          <a href="/auth/register" style={{color:S.blue,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Înregistrare cont personal</a>
          {' · '}
          <a href="/auth/login" style={{color:S.blue,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Intră în cont</a>
        </div>
      </div>
    </div>
  )
}
