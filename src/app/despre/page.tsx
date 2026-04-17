// @ts-nocheck
const S = {navy:'#0a1f44',blue:'#1a56db',blueLight:'#3b82f6',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a'}

export default function DesprePage() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap')`}</style>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'80px 24px',textAlign:'center'}}>
        <div style={{display:'inline-block',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:16,fontFamily:"'Sora',sans-serif"}}>Despre noi</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(28px,4vw,48px)',color:'#fff',marginBottom:16,letterSpacing:-0.5}}>Construim viitorul<br/>serviciilor auto din România</h1>
        <p style={{fontSize:17,color:'rgba(255,255,255,0.6)',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>Reparo a luat naștere din frustrarea de a găsi un service auto de încredere. Acum suntem platforma care face asta simplu pentru milioane de șoferi.</p>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'60px 24px'}}>
        {/* Misiune */}
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:'40px',marginBottom:20,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,marginBottom:16}}>Misiunea noastră</h2>
          <p style={{fontSize:16,color:'#374151',lineHeight:1.8,marginBottom:12}}>Vrem ca fiecare șofer din România să poată găsi rapid un service auto de calitate, la un preț corect, fără stres și fără surprize neplăcute.</p>
          <p style={{fontSize:16,color:'#374151',lineHeight:1.8}}>Și vrem ca fiecare service auto serios să aibă acces la uneltele digitale care să îi aducă mai mulți clienți și să îi ajute să crească.</p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:14,marginBottom:20}}>
          {[['2026','Anul fondării'],['2.400+','Service-uri'],['48.000+','Cereri trimise'],['4.8★','Rating mediu']].map(([v,l])=>(
            <div key={l} style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:'24px 16px',textAlign:'center',boxShadow:'0 2px 8px rgba(10,31,68,0.04)'}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:28,color:S.blue,marginBottom:4}}>{v}</div>
              <div style={{fontSize:13,color:S.muted}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Valori */}
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:'40px',marginBottom:20,boxShadow:'0 2px 12px rgba(10,31,68,0.06)'}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:S.navy,marginBottom:24}}>Valorile noastre</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            {[
              {icon:'🎯',title:'Transparență totală',desc:'Prețuri clare, fără comisioane ascunse. Ce vezi este ce plătești.'},
              {icon:'🤝',title:'Parteneriat real',desc:'Succesul service-urilor partenere este succesul nostru.'},
              {icon:'⭐',title:'Calitate verificată',desc:'Recenzii reale de la clienți reali. Nicio recenzie falsă.'},
              {icon:'🚀',title:'Inovație continuă',desc:'Îmbunătățim platforma în fiecare săptămână pe baza feedback-ului.'},
            ].map(v=>(
              <div key={v.title} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:44,height:44,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{v.icon}</div>
                <div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:4}}>{v.title}</div>
                  <div style={{fontSize:13,color:S.muted,lineHeight:1.6}}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,borderRadius:20,padding:'40px',textAlign:'center'}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:'#fff',marginBottom:12}}>Vrei să faci parte din echipă?</h2>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:15,marginBottom:24}}>Construim ceva mare și căutăm oameni pasionați.</p>
          <a href="/cariere" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 28px',background:S.yellow,color:'#fff',textDecoration:'none',borderRadius:50,fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>
            Vezi pozițiile deschise →
          </a>
        </div>
      </div>
    </div>
  )
}
