// @ts-nocheck
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',
}

const inp = {width:'100%',padding:'12px 16px',border:`1.5px solid ${S.border}`,borderRadius:12,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',transition:'border-color .2s',boxSizing:'border-box'}

const ROLE_OPTIONS = [
  {key:'user',icon:'🚗',title:'Șofer / Proprietar auto',desc:'Caut service-uri, cer oferte și programez reparații.'},
  {key:'service',icon:'🔧',title:'Service auto',desc:'Ofer servicii auto și vreau să primesc cereri de la clienți.'},
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [form, setForm] = useState({full_name:'',email:'',password:'',confirm_password:'',city:'',phone:''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleRegister(e) {
    e.preventDefault()
    if (form.password !== form.confirm_password) { setError('Parolele nu coincid.'); return }
    if (form.password.length < 6) { setError('Parola trebuie să aibă minim 6 caractere.'); return }
    setLoading(true); setError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role, city: form.city, phone: form.phone } }
    })

    if (error) { setError(error.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, full_name: form.full_name, role, city: form.city, phone: form.phone
      })
      if (role === 'service') {
        await supabase.from('services').insert({
          owner_id: data.user.id, name: form.full_name || 'Service-ul meu',
          city: form.city || 'București', is_active: true, plan: 'free'
        })
      }
    }

    setLoading(false)
    setDone(true)
    setTimeout(() => {
      if (role === 'service') window.location.href = '/dashboard/service'
      else window.location.href = '/home'
    }, 2000)
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#eaf3ff 0%,#f8fbff 60%,#fff8ed 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .auth-inp:focus{border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        .role-card:hover{border-color:#1a56db!important;background:#eaf3ff!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease both}
      `}</style>

      <div style={{width:'100%',maxWidth:480}}>
        {/* Logo */}
        <div className="fade-up" style={{textAlign:'center',marginBottom:28}}>
          <a href="/home" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{width:44,height:44,background:S.blue,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:'#fff',boxShadow:'0 4px 16px rgba(26,86,219,0.3)'}}>R</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,letterSpacing:-0.5}}>Reparo</span>
          </a>
          <div style={{fontSize:13,color:S.muted}}>Creează contul tău gratuit</div>
        </div>

        {/* Progress */}
        <div className="fade-up" style={{display:'flex',alignItems:'center',gap:0,marginBottom:24,animationDelay:'.05s'}}>
          {[1,2].map((s,i)=>(
            <div key={s} style={{display:'flex',alignItems:'center',flex:1}}>
              <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif",background:step>=s?S.blue:'#e5e7eb',color:step>=s?'#fff':S.muted,flexShrink:0,transition:'all .3s'}}>
                {step>s?'✓':s}
              </div>
              <div style={{flex:1,height:2,background:step>s?S.blue:'#e5e7eb',transition:'all .3s'}}/>
            </div>
          ))}
          <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif",background:step>=2?S.blue:'#e5e7eb',color:step>=2?'#fff':S.muted,flexShrink:0}}>2</div>
        </div>

        {/* Card */}
        <div className="fade-up" style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,boxShadow:'0 8px 40px rgba(10,31,68,0.1)',padding:32,animationDelay:'.1s'}}>

          {done?(
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:64,marginBottom:16}}>🎉</div>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:8}}>Cont creat cu succes!</h2>
              <p style={{fontSize:14,color:S.muted}}>Te redirecționăm acum...</p>
            </div>
          ):step===1?(
            <>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:4,textAlign:'center'}}>Cum vrei să folosești Reparo?</h1>
              <p style={{fontSize:13,color:S.muted,textAlign:'center',marginBottom:24}}>Alege tipul de cont potrivit pentru tine</p>

              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
                {ROLE_OPTIONS.map(r=>(
                  <button key={r.key} onClick={()=>setRole(r.key)} className="role-card"
                    style={{display:'flex',alignItems:'center',gap:14,padding:'18px 16px',borderRadius:14,border:`1.5px solid ${role===r.key?S.blue:S.border}`,background:role===r.key?'#eaf3ff':S.white,cursor:'pointer',textAlign:'left',transition:'all .2s'}}>
                    <div style={{width:52,height:52,background:role===r.key?S.blue:'#f0f6ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,transition:'all .2s'}}>
                      {r.icon}
                    </div>
                    <div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:3}}>{r.title}</div>
                      <div style={{fontSize:12,color:S.muted,lineHeight:1.5}}>{r.desc}</div>
                    </div>
                    {role===r.key&&(
                      <div style={{marginLeft:'auto',width:22,height:22,borderRadius:'50%',background:S.blue,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{color:'#fff',fontSize:12,fontWeight:700}}>✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={()=>setStep(2)} disabled={!role}
                style={{width:'100%',padding:'13px',background:role?S.blue:'#e5e7eb',color:role?'#fff':S.muted,border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:role?'pointer':'not-allowed',fontFamily:"'Sora',sans-serif",boxShadow:role?'0 4px 16px rgba(26,86,219,0.25)':'none',transition:'all .2s'}}>
                Continuă →
              </button>
            </>
          ):(
            <>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <button onClick={()=>setStep(1)} style={{background:S.bg,border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',color:S.muted}}>←</button>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>
                    {role==='service'?'Date service':'Date personale'}
                  </h1>
                  <p style={{fontSize:12,color:S.muted,margin:0}}>Completează informațiile contului</p>
                </div>
              </div>

              {error&&(
                <div style={{background:'#fee2e2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red,marginBottom:16}}>⚠️ {error}</div>
              )}

              <form onSubmit={handleRegister}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>
                      {role==='service'?'Numele service-ului *':'Numele complet *'}
                    </label>
                    <input className="auth-inp" type="text" required value={form.full_name} onChange={e=>setForm(p=>({...p,full_name:e.target.value}))}
                      placeholder={role==='service'?'AutoPro Service SRL':'Ion Popescu'} style={inp}/>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Email *</label>
                    <input className="auth-inp" type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                      placeholder="ion@exemplu.ro" style={inp}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Telefon</label>
                    <input className="auth-inp" type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
                      placeholder="07xx xxx xxx" style={inp}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Oraș</label>
                    <input className="auth-inp" type="text" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}
                      placeholder="București" style={inp}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Parolă *</label>
                    <input className="auth-inp" type="password" required value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                      placeholder="minim 6 caractere" style={inp}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Confirmă parola *</label>
                    <input className="auth-inp" type="password" required value={form.confirm_password} onChange={e=>setForm(p=>({...p,confirm_password:e.target.value}))}
                      placeholder="••••••••" style={inp}/>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{width:'100%',padding:'13px',background:loading?'#93c5fd':S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'all .2s',marginBottom:14}}>
                  {loading?'Se creează contul...':'🎉 Creează contul gratuit'}
                </button>

                <p style={{textAlign:'center',fontSize:12,color:S.muted,lineHeight:1.5}}>
                  Prin înregistrare, ești de acord cu{' '}
                  <a href="/termeni" style={{color:S.blue,textDecoration:'none',fontWeight:600}}>Termenii și Condițiile</a>
                </p>
              </form>
            </>
          )}
        </div>

        <div className="fade-up" style={{textAlign:'center',marginTop:16,fontSize:13,color:S.muted,animationDelay:'.2s'}}>
          Ai deja cont?{' '}
          <a href="/auth/login" style={{color:S.blue,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Intră în cont</a>
        </div>
      </div>
    </div>
  )
}
