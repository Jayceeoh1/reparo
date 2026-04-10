// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',amber:'#d97706',amberBg:'#fef3c7',
}
const inp = {width:'100%',padding:'12px 16px',border:`1.5px solid ${S.border}`,borderRadius:12,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',transition:'border-color .2s',boxSizing:'border-box'}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [strength, setStrength] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Supabase handles the session from URL hash automatically
  }, [])

  function checkStrength(p) {
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    setStrength(s)
  }

  async function handleReset(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Parolele nu coincid.'); return }
    if (password.length < 6) { setError('Parola trebuie să aibă minim 6 caractere.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Link-ul a expirat sau e invalid. Încearcă din nou.'); setLoading(false); return }
    setDone(true); setLoading(false)
    setTimeout(() => window.location.href = '/auth/login', 3000)
  }

  const strengthLabels = ['','Foarte slabă','Slabă','Medie','Bună','Excelentă']
  const strengthColors = ['','#dc2626','#d97706','#ca8a04','#16a34a','#1a56db']

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#eaf3ff 0%,#f8fbff 60%,#fff8ed 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .auth-inp:focus{border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease both}
      `}</style>

      <div style={{width:'100%',maxWidth:420}}>
        {/* Logo */}
        <div className="fade-up" style={{textAlign:'center',marginBottom:28}}>
          <a href="/home" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:10}}>
            <div style={{width:44,height:44,background:S.blue,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:'#fff',boxShadow:'0 4px 16px rgba(26,86,219,0.3)'}}>R</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,letterSpacing:-0.5}}>Reparo</span>
          </a>
        </div>

        <div className="fade-up" style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,boxShadow:'0 8px 40px rgba(10,31,68,0.1)',padding:32,animationDelay:'.1s'}}>
          {done ? (
            <div style={{textAlign:'center',padding:'10px 0'}}>
              <div style={{width:64,height:64,background:S.greenBg,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 16px'}}>✅</div>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:8}}>Parolă schimbată!</h2>
              <p style={{fontSize:14,color:S.muted,marginBottom:8}}>Parola ta a fost actualizată cu succes.</p>
              <p style={{fontSize:13,color:S.muted}}>Te redirecționăm spre login în câteva secunde...</p>
            </div>
          ) : (
            <>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{width:56,height:56,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 12px'}}>🔒</div>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:6}}>Resetează parola</h1>
                <p style={{fontSize:13,color:S.muted}}>Alege o parolă nouă și sigură pentru contul tău.</p>
              </div>

              {error && (
                <div style={{background:'#fee2e2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red,marginBottom:16}}>⚠️ {error}</div>
              )}

              <form onSubmit={handleReset}>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Parolă nouă</label>
                  <input className="auth-inp" type="password" required value={password}
                    onChange={e=>{setPassword(e.target.value);checkStrength(e.target.value)}}
                    placeholder="minim 6 caractere" style={inp}/>
                  {password.length > 0 && (
                    <div style={{marginTop:8}}>
                      <div style={{display:'flex',gap:3,marginBottom:4}}>
                        {[1,2,3,4,5].map(i=>(
                          <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=strength?strengthColors[strength]:'#e5e7eb',transition:'all .3s'}}/>
                        ))}
                      </div>
                      <div style={{fontSize:11,color:strengthColors[strength],fontWeight:600}}>{strengthLabels[strength]}</div>
                    </div>
                  )}
                </div>

                <div style={{marginBottom:8}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Confirmă parola nouă</label>
                  <input className="auth-inp" type="password" required value={confirm}
                    onChange={e=>setConfirm(e.target.value)}
                    placeholder="repetă parola" style={{...inp,borderColor:confirm&&confirm!==password?S.red:S.border}}/>
                  {confirm && confirm !== password && (
                    <div style={{fontSize:12,color:S.red,marginTop:4}}>⚠️ Parolele nu coincid</div>
                  )}
                  {confirm && confirm === password && (
                    <div style={{fontSize:12,color:S.green,marginTop:4}}>✅ Parolele coincid</div>
                  )}
                </div>

                {/* Sfaturi parola */}
                <div style={{background:S.amberBg,borderRadius:10,padding:'10px 14px',marginBottom:20,marginTop:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:S.amber,marginBottom:4}}>SFATURI PAROLĂ SIGURĂ</div>
                  {[['Minim 6 caractere',password.length>=6],['Cel puțin o cifră',/[0-9]/.test(password)],['Cel puțin o literă mare',/[A-Z]/.test(password)]].map(([tip,ok])=>(
                    <div key={tip} style={{fontSize:12,color:ok?S.green:S.amber,display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                      <span>{ok?'✓':'○'}</span>{tip}
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading||password!==confirm||password.length<6}
                  style={{width:'100%',padding:'13px',background:loading||password!==confirm||password.length<6?'#93c5fd':S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:loading||password!==confirm||password.length<6?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'all .2s'}}>
                  {loading?'Se actualizează...':'🔒 Salvează parola nouă'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
