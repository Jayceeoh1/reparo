// @ts-nocheck
const S = {navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',greenBg:'#dcfce7'}

const JOBS = [
  {title:'Full-Stack Developer',dept:'Engineering',type:'Full-time · Remote',desc:'Construiești funcții noi pe platforma Reparo — Next.js, TypeScript, Supabase.',tags:['React','TypeScript','Supabase','Node.js']},
  {title:'Product Designer',dept:'Design',type:'Full-time · Hibrid',desc:'Creezi experiențe intuitive și frumoase pentru șoferi și service-uri.',tags:['Figma','Design System','UX Research']},
  {title:'Sales & Partnerships Manager',dept:'Business',type:'Full-time · București',desc:'Atragi service-uri auto pe platformă și construiești relații de durată.',tags:['B2B Sales','Partnerships','CRM']},
  {title:'Customer Success',dept:'Operations',type:'Full-time · Hibrid',desc:'Ajuți service-urile partenere să obțină maximum din platformă.',tags:['Support','Onboarding','Training']},
]

export default function CarierePage() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');.job-card:hover{border-color:#1a56db!important;box-shadow:0 4px 20px rgba(26,86,219,0.1)!important}`}</style>

      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'70px 24px',textAlign:'center'}}>
        <div style={{display:'inline-block',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:16,fontFamily:"'Sora',sans-serif"}}>Cariere</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(26px,4vw,44px)',color:'#fff',marginBottom:12,letterSpacing:-0.5}}>Construiește cu noi viitorul<br/>mobilității din România</h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:16,maxWidth:480,margin:'0 auto'}}>Suntem o echipă mică, ambițioasă, care construiește produse folosite de mii de oameni. Caută-ți locul printre noi.</p>
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:'48px 24px'}}>
        {/* Beneficii */}
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:'32px',marginBottom:24,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:S.navy,marginBottom:20}}>De ce Reparo?</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
            {[
              {icon:'🏠',title:'Remote-first',desc:'Lucrezi de oriunde din România'},
              {icon:'📈',title:'Stock options',desc:'Ești co-proprietar al succesului'},
              {icon:'🎓',title:'Learning budget',desc:'1.000 RON/an pentru cursuri'},
              {icon:'⚕️',title:'Asigurare medicală',desc:'Pachet complet Regina Maria'},
              {icon:'💻',title:'Echipament top',desc:'MacBook sau laptop la alegere'},
              {icon:'🍕',title:'Team events',desc:'Întâlniri trimestriale în echipă'},
            ].map(b=>(
              <div key={b.title} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{fontSize:20}}>{b.icon}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:14,color:S.navy,marginBottom:2}}>{b.title}</div>
                  <div style={{fontSize:12,color:S.muted}}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pozitii */}
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:S.navy,marginBottom:16}}>Poziții deschise</h2>
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
          {JOBS.map(job=>(
            <div key={job.title} className="job-card" style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:'20px 24px',cursor:'pointer',transition:'all .2s',boxShadow:'0 2px 8px rgba(10,31,68,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:3}}>{job.title}</div>
                  <div style={{fontSize:12,color:S.muted}}>{job.dept} · {job.type}</div>
                </div>
                <a href={`mailto:jobs@reparo.ro?subject=Aplicatie: ${job.title}`} style={{padding:'8px 16px',background:S.blue,color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif",flexShrink:0,marginLeft:12}}>
                  Aplică
                </a>
              </div>
              <p style={{fontSize:13,color:S.muted,lineHeight:1.6,marginBottom:10}}>{job.desc}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {job.tags.map(t=><span key={t} style={{background:'#eaf3ff',color:S.blue,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:50}}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div style={{background:S.greenBg,borderRadius:16,border:`1px solid ${S.green}30`,padding:'20px 24px',textAlign:'center'}}>
          <div style={{fontSize:14,color:S.green,fontWeight:600,marginBottom:4}}>Nu găsești poziția potrivită?</div>
          <div style={{fontSize:13,color:S.green,opacity:.8}}>Trimite CV-ul la <a href="mailto:jobs@reparo.ro" style={{color:S.green,fontWeight:700}}>jobs@reparo.ro</a> și te ținem în vedere pentru viitoare oportunități.</div>
        </div>
      </div>
    </div>
  )
}
