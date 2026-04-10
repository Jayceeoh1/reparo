// @ts-nocheck
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',
}
const inp = {width:'100%',padding:'12px 16px',border:`1.5px solid ${S.border}`,borderRadius:12,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',transition:'border-color .2s',boxSizing:'border-box'}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { setError('A apărut o eroare. Verifică emailul și încearcă din nou.'); setLoading(false); return }
    setSent(true); setLoading(false)
  }

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
          <a href="/home" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{width:44,height:44,background:S.blue,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:'#fff',boxShadow:'0 4px 16px rgba(26,86,219,0.3)'}}>R</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,letterSpacing:-0.5}}>Reparo</span>
          </a>
        </div>

        <div className="fade-up" style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,boxShadow:'0 8px 40px rgba(10,31,68,0.1)',padding:32,animationDelay:'.1s'}}>
          {sent ? (
            <div style={{textAlign:'center',padding:'10px 0'}}>
              <div style={{width:64,height:64,background:S.greenBg,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 16px'}}>✉️</div>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:8}}>Email trimis!</h2>
              <p style={{fontSize:14,color:S.muted,lineHeight:1.6,marginBottom:20}}>
                Am trimis un link de resetare la <strong style={{color:S.navy}}>{email}</strong>. Verifică și inbox-ul și folderul Spam.
              </p>
              <div style={{background:S.greenBg,border:`1px solid ${S.green}30`,borderRadius:12,padding:'12px 16px',marginBottom:20}}>
                <p style={{fontSize:13,color:S.green,margin:0}}>✅ Link-ul expiră în 60 de minute.</p>
              </div>
              <a href="/auth/login" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:50,fontSize:13,fontWeight:700,background:S.blue,color:'#fff',textDecoration:'none',fontFamily:"'Sora',sans-serif",boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}}>
                ← Înapoi la login
              </a>
            </div>
          ) : (
            <>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{width:56,height:56,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 12px'}}>🔑</div>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,marginBottom:6}}>Ai uitat parola?</h1>
                <p style={{fontSize:13,color:S.muted,lineHeight:1.5}}>Introdu emailul contului tău și îți trimitem un link pentru resetarea parolei.</p>
              </div>

              {error && (
                <div style={{background:'#fee2e2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red,marginBottom:16}}>⚠️ {error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{marginBottom:20}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Email</label>
                  <input className="auth-inp" type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="ion@exemplu.ro" style={inp}/>
                </div>
                <button type="submit" disabled={loading}
                  style={{width:'100%',padding:'13px',background:loading?'#93c5fd':S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'all .2s',marginBottom:14}}>
                  {loading?'Se trimite...':'Trimite link de resetare'}
                </button>
              </form>

              <p style={{textAlign:'center',fontSize:13,color:S.muted}}>
                Ți-ai amintit parola?{' '}
                <a href="/auth/login" style={{color:S.blue,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Intră în cont</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
