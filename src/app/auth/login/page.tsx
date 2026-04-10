// @ts-nocheck
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',red:'#dc2626',
}

const inp = {width:'100%',padding:'12px 16px',border:`1.5px solid ${S.border}`,borderRadius:12,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',transition:'border-color .2s',boxSizing:'border-box'}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email sau parolă incorectă.'); setLoading(false); return }
    if (!data.user) { setError('Eroare la autentificare.'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    setTimeout(() => {
      if (profile?.role === 'service') window.location.href = '/dashboard/service'
      else window.location.href = '/home'
    }, 300)
  }

  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(135deg,#eaf3ff 0%,#f8fbff 60%,#fff8ed 100%)`,display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .auth-inp:focus{border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease both}
      `}</style>

      <div style={{width:'100%',maxWidth:440}}>
        {/* Logo */}
        <div className="fade-up" style={{textAlign:'center',marginBottom:32}}>
          <a href="/home" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:44,height:44,background:S.blue,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:'#fff',boxShadow:'0 4px 16px rgba(26,86,219,0.3)'}}>R</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,letterSpacing:-0.5}}>Reparo</span>
          </a>
          <div style={{fontSize:13,color:S.muted,marginTop:4}}>Platforma de servicii auto din România</div>
        </div>

        {/* Card */}
        <div className="fade-up" style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,boxShadow:'0 8px 40px rgba(10,31,68,0.1)',padding:32,animationDelay:'.1s'}}>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:6,textAlign:'center'}}>Bine ai revenit!</h1>
          <p style={{fontSize:13,color:S.muted,textAlign:'center',marginBottom:24}}>Intră în contul tău Reparo</p>

          {error&&(
            <div style={{background:'#fee2e2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:13,color:S.red,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Email</label>
              <input className="auth-inp" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="ion@exemplu.ro" style={inp}/>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                <label style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,fontFamily:"'Sora',sans-serif"}}>Parolă</label>
                <a href="/auth/forgot-password" style={{fontSize:12,color:S.blue,textDecoration:'none',fontWeight:600}}>Ai uitat parola?</a>
              </div>
              <input className="auth-inp" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'13px',background:loading?'#93c5fd':S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)',transition:'all .2s',letterSpacing:0.2}}>
              {loading?'Se verifică...':'Intră în cont'}
            </button>
          </form>

          <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
            <div style={{flex:1,height:1,background:S.border}}/>
            <span style={{fontSize:12,color:S.muted}}>sau</span>
            <div style={{flex:1,height:1,background:S.border}}/>
          </div>

          <p style={{textAlign:'center',fontSize:14,color:S.muted}}>
            Nu ai cont?{' '}
            <a href="/auth/register" style={{color:S.blue,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>Înregistrează-te gratuit</a>
          </p>
        </div>

        {/* Footer links */}
        <div className="fade-up" style={{textAlign:'center',marginTop:20,fontSize:12,color:S.muted,animationDelay:'.2s'}}>
          <a href="/home" style={{color:S.muted,textDecoration:'none',marginRight:16}}>← Înapoi la site</a>
          <a href="/auth/register" style={{color:S.muted,textDecoration:'none'}}>Înregistrare service</a>
        </div>
      </div>
    </div>
  )
}
