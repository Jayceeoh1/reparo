// @ts-nocheck
'use client'
import { useState } from 'react'
const S = {navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',greenBg:'#dcfce7'}
const inp = {width:'100%',padding:'12px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white,boxSizing:'border-box',transition:'border-color .2s'}

export default function ContactPage() {
  const [form, setForm] = useState({name:'',email:'',subject:'general',message:''})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r=>setTimeout(r,1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');.cnt-inp:focus{border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}`}</style>

      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'60px 24px',textAlign:'center',marginBottom:40}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(26px,4vw,42px)',color:'#fff',marginBottom:10,letterSpacing:-0.5}}>Contactează-ne</h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:16,maxWidth:400,margin:'0 auto'}}>Suntem aici să te ajutăm. Răspundem în maxim 24 de ore.</p>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'0 24px 60px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
        {/* Info */}
        <div>
          <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:28,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',marginBottom:14}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:20}}>Cum ne găsești</h2>
            {[
              {icon:'✉️',label:'Email general',value:'contact@reparo.ro'},
              {icon:'🛡️',label:'Suport tehnic',value:'suport@reparo.ro'},
              {icon:'⚖️',label:'Legal & GDPR',value:'legal@reparo.ro'},
              {icon:'📍',label:'Adresă',value:'București, România'},
            ].map(c=>(
              <div key={c.label} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:16}}>
                <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{c.icon}</div>
                <div>
                  <div style={{fontSize:11,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>{c.label}</div>
                  <div style={{fontSize:14,color:S.navy,fontWeight:500}}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'#eaf3ff',borderRadius:16,border:'1px solid rgba(26,86,219,0.15)',padding:20}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.blue,marginBottom:8}}>⏱️ Timp de răspuns</div>
            <div style={{fontSize:13,color:S.muted,lineHeight:1.7}}>Luni–Vineri: 09:00–18:00<br/>Sâmbătă: 10:00–14:00<br/>Duminică: Închis</div>
          </div>
        </div>

        {/* Form */}
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:28,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
          {sent ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:56,marginBottom:14}}>✅</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:8}}>Mesaj trimis!</div>
              <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Îți vom răspunde în maxim 24 de ore la adresa {form.email}</p>
              <button onClick={()=>setSent(false)} style={{padding:'10px 24px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Trimite alt mesaj</button>
            </div>
          ) : (
            <>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:20}}>Trimite-ne un mesaj</h2>
              <form onSubmit={handleSubmit}>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Numele tău</label>
                  <input className="cnt-inp" type="text" required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ion Popescu" style={inp}/>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Email</label>
                  <input className="cnt-inp" type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="ion@exemplu.ro" style={inp}/>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Subiect</label>
                  <select className="cnt-inp" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} style={inp}>
                    <option value="general">Întrebare generală</option>
                    <option value="suport">Suport tehnic</option>
                    <option value="parteneriat">Parteneriat</option>
                    <option value="legal">Legal / GDPR</option>
                    <option value="abuz">Raportare abuz</option>
                    <option value="altele">Altele</option>
                  </select>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>Mesaj</label>
                  <textarea className="cnt-inp" required rows={5} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="Descrie în detaliu ce ai nevoie..." style={{...inp,resize:'none'}}/>
                </div>
                <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',background:loading?'#93c5fd':S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(26,86,219,0.25)'}}>
                  {loading?'Se trimite...':'Trimite mesajul'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
