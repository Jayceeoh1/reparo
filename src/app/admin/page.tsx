// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',greenBg:'#dcfce7',
  red:'#dc2626',redBg:'#fee2e2',amber:'#d97706',amberBg:'#fef3c7',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const pill = (bg,color) => ({display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:bg,color,fontSize:11,fontWeight:700})

const TABS = ['Dashboard','Service-uri','Utilizatori','Plăți','Recenzii','Setări']

export default function AdminPage() {
  const [tab, setTab] = useState('Dashboard')
  const [stats, setStats] = useState({ services:0, users:0, requests:0, revenue:0 })
  const [services, setServices] = useState([])
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'admin') { window.location.href = '/home'; return }
      setAuthorized(true)

      const [svcRes, usrRes, reqRes, payRes, revRes] = await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('quote_requests').select('id', { count: 'exact' }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*, profiles(full_name), services(name)').order('created_at', { ascending: false }),
      ])
      setServices(svcRes.data || [])
      setUsers(usrRes.data || [])
      setPayments(payRes.data || [])
      setReviews(revRes.data || [])
      const totalRevenue = (payRes.data || []).filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
      setStats({ services: svcRes.data?.length || 0, users: usrRes.data?.length || 0, requests: reqRes.count || 0, revenue: totalRevenue })
      setLoading(false)
    }
    load()
  }, [])

  async function toggleVerified(svcId, current) {
    await supabase.from('services').update({ is_verified: !current }).eq('id', svcId)
    setServices(prev => prev.map(s => s.id === svcId ? { ...s, is_verified: !current } : s))
  }

  async function toggleActive(svcId, current) {
    await supabase.from('services').update({ is_active: !current }).eq('id', svcId)
    setServices(prev => prev.map(s => s.id === svcId ? { ...s, is_active: !current } : s))
  }

  async function deleteReview(id) {
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`.tab-btn:hover{background:#eaf3ff!important;color:#1a56db!important}`}</style>

      {/* Header */}
      <div style={{background:S.navy,padding:'20px 32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,background:S.blue,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:'#fff'}}>R</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:'#fff'}}>Reparo Admin</span>
        </div>
        <a href="/home" style={{fontSize:13,color:'rgba(255,255,255,0.6)',textDecoration:'none'}}>← Înapoi la site</a>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
        {/* Tabs */}
        <div style={{display:'flex',background:S.white,borderRadius:50,border:`1px solid ${S.border}`,padding:4,marginBottom:24,gap:4,overflowX:'auto'}}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={tab===t?'':'tab-btn'}
              style={{padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:tab===t?S.blue:'transparent',color:tab===t?'#fff':S.muted,fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap',transition:'all .15s'}}>
              {t}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab==='Dashboard' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              {[
                {label:'Service-uri',value:stats.services,icon:'🔧',color:S.blue,bg:'#eaf3ff'},
                {label:'Utilizatori',value:stats.users,icon:'👤',color:S.green,bg:S.greenBg},
                {label:'Cereri ofertă',value:stats.requests,icon:'📋',color:S.amber,bg:S.amberBg},
                {label:'Venituri (RON)',value:(stats.revenue/100).toLocaleString(),icon:'💰',color:S.navy,bg:S.bg},
              ].map(s => (
                <div key={s.label} style={card()}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:48,height:48,background:s.bg,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{s.icon}</div>
                    <div>
                      <div style={{fontSize:11,color:S.muted,marginBottom:3}}>{s.label}</div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:s.color}}>{s.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div style={card()}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>Ultimele service-uri înregistrate</h3>
                {services.slice(0,5).map(s => (
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${S.border}`}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{s.name}</div>
                      <div style={{fontSize:11,color:S.muted}}>{s.city} · {new Date(s.created_at).toLocaleDateString('ro-RO')}</div>
                    </div>
                    <span style={pill(s.plan==='pro'?S.amberBg:s.plan==='basic'?'#eaf3ff':S.bg,s.plan==='pro'?S.amber:s.plan==='basic'?S.blue:S.muted)}>{s.plan}</span>
                  </div>
                ))}
              </div>
              <div style={card()}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>Ultimele plăți</h3>
                {payments.slice(0,5).map(p => (
                  <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${S.border}`}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{p.type==='subscription'?`Plan ${p.plan}`:'Promovare'}</div>
                      <div style={{fontSize:11,color:S.muted}}>{new Date(p.created_at).toLocaleDateString('ro-RO')}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:700,fontSize:13,color:S.navy}}>{((p.amount||0)/100)} RON</div>
                      <span style={pill(p.status==='paid'?S.greenBg:S.redBg,p.status==='paid'?S.green:S.red)}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service-uri */}
        {tab==='Service-uri' && (
          <div style={card()}>
            <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:16}}>Toate service-urile ({services.length})</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${S.border}`}}>
                    {['Nume','Oraș','Plan','Verificat','Activ','Rating','Acțiuni'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',textAlign:'left',fontWeight:700,color:S.muted,fontSize:11,textTransform:'uppercase',letterSpacing:0.5}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map(s=>(
                    <tr key={s.id} style={{borderBottom:`1px solid ${S.border}`}}>
                      <td style={{padding:'10px 12px',fontWeight:600,color:S.navy}}>{s.name}</td>
                      <td style={{padding:'10px 12px',color:S.muted}}>{s.city}</td>
                      <td style={{padding:'10px 12px'}}><span style={pill(s.plan==='pro'?S.amberBg:s.plan==='basic'?'#eaf3ff':S.bg,s.plan==='pro'?S.amber:s.plan==='basic'?S.blue:S.muted)}>{s.plan}</span></td>
                      <td style={{padding:'10px 12px'}}>
                        <button onClick={()=>toggleVerified(s.id,s.is_verified)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18}}>{s.is_verified?'✅':'⭕'}</button>
                      </td>
                      <td style={{padding:'10px 12px'}}>
                        <button onClick={()=>toggleActive(s.id,s.is_active)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18}}>{s.is_active?'🟢':'🔴'}</button>
                      </td>
                      <td style={{padding:'10px 12px',color:S.yellow}}>{'★'.repeat(Math.round(s.rating_avg||0))} ({s.rating_count||0})</td>
                      <td style={{padding:'10px 12px'}}>
                        <a href={`/service/${s.id}`} style={{fontSize:12,color:S.blue,textDecoration:'none',fontWeight:600}}>Vezi →</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Utilizatori */}
        {tab==='Utilizatori' && (
          <div style={card()}>
            <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:16}}>Toți utilizatorii ({users.length})</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${S.border}`}}>
                    {['Nume','Rol','Oraș','Data înregistrării'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',textAlign:'left',fontWeight:700,color:S.muted,fontSize:11,textTransform:'uppercase',letterSpacing:0.5}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id} style={{borderBottom:`1px solid ${S.border}`}}>
                      <td style={{padding:'10px 12px',fontWeight:600,color:S.navy}}>{u.full_name||'—'}</td>
                      <td style={{padding:'10px 12px'}}><span style={pill(u.role==='service'?'#eaf3ff':u.role==='admin'?S.redBg:S.bg,u.role==='service'?S.blue:u.role==='admin'?S.red:S.muted)}>{u.role||'user'}</span></td>
                      <td style={{padding:'10px 12px',color:S.muted}}>{u.city||'—'}</td>
                      <td style={{padding:'10px 12px',color:S.muted}}>{new Date(u.created_at).toLocaleDateString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plăți */}
        {tab==='Plăți' && (
          <div style={card()}>
            <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:16}}>Toate plățile ({payments.length})</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${S.border}`}}>
                    {['Tip','Plan/Promo','Sumă','Status','Data'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',textAlign:'left',fontWeight:700,color:S.muted,fontSize:11,textTransform:'uppercase',letterSpacing:0.5}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p=>(
                    <tr key={p.id} style={{borderBottom:`1px solid ${S.border}`}}>
                      <td style={{padding:'10px 12px',fontWeight:600,color:S.navy}}>{p.type==='subscription'?'Abonament':'Promovare'}</td>
                      <td style={{padding:'10px 12px',color:S.muted}}>{p.plan||p.metadata?.promo_type||'—'}</td>
                      <td style={{padding:'10px 12px',fontWeight:700,color:S.navy}}>{((p.amount||0)/100)} RON</td>
                      <td style={{padding:'10px 12px'}}><span style={pill(p.status==='paid'?S.greenBg:S.redBg,p.status==='paid'?S.green:S.red)}>{p.status}</span></td>
                      <td style={{padding:'10px 12px',color:S.muted}}>{new Date(p.created_at).toLocaleDateString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recenzii */}
        {tab==='Recenzii' && (
          <div style={card()}>
            <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:16}}>Moderare recenzii ({reviews.length})</h3>
            {reviews.map(r=>(
              <div key={r.id} style={{padding:'14px 0',borderBottom:`1px solid ${S.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:13,color:S.navy}}>{r.profiles?.full_name||'Utilizator'}</span>
                      <span style={{fontSize:11,color:S.muted}}>→</span>
                      <span style={{fontSize:13,color:S.blue,fontWeight:600}}>{r.services?.name}</span>
                      <div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:12,color:s<=r.rating?S.yellow:'#ddd'}}>★</span>)}</div>
                    </div>
                    {r.title&&<div style={{fontWeight:600,fontSize:13,color:S.navy,marginBottom:3}}>{r.title}</div>}
                    <p style={{fontSize:13,color:'#374151',lineHeight:1.5,margin:0}}>{r.body}</p>
                  </div>
                  <button onClick={()=>deleteReview(r.id)}
                    style={{padding:'6px 12px',background:S.redBg,color:S.red,border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',marginLeft:12,flexShrink:0}}>
                    Șterge
                  </button>
                </div>
                <div style={{fontSize:11,color:S.muted,marginTop:6}}>{new Date(r.created_at).toLocaleDateString('ro-RO')}</div>
              </div>
            ))}
          </div>
        )}

        {/* Setări */}
        {tab==='Setări' && (
          <div style={{maxWidth:500}}>
            <div style={card()}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:16}}>Setări platformă</h3>
              {[
                {label:'Înregistrări noi service-uri',desc:'Permite service-urilor noi să se înregistreze',enabled:true},
                {label:'Recenzii publice',desc:'Afișează recenziile pe profilurile service-urilor',enabled:true},
                {label:'Mod mentenanță',desc:'Site-ul afișează pagina de mentenanță',enabled:false},
              ].map(s=>(
                <div key={s.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:`1px solid ${S.border}`}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:S.navy,marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:12,color:S.muted}}>{s.desc}</div>
                  </div>
                  <div style={{width:44,height:24,background:s.enabled?S.green:'#e5e7eb',borderRadius:12,position:'relative',cursor:'pointer',transition:'background .2s'}}>
                    <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',position:'absolute',top:2,left:s.enabled?22:2,transition:'left .2s'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
