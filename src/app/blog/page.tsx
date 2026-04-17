// @ts-nocheck
const S = {navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb'}

const POSTS = [
  {slug:'cum-alegi-service-auto',title:'Cum alegi un service auto de încredere',excerpt:'5 lucruri pe care trebuie să le verifici înainte să lași mașina la service. Ghid complet pentru șoferii din România.',category:'Ghiduri',date:'5 apr 2026',readTime:'4 min',icon:'🔧'},
  {slug:'itp-2026-ghid-complet',title:'ITP 2026 — Tot ce trebuie să știi',excerpt:'Prețuri, documente necesare, ce se verifică și cum te pregătești. Ghidul complet pentru ITP în 2026.',category:'ITP & RCA',date:'3 apr 2026',readTime:'6 min',icon:'🛡️'},
  {slug:'rca-vs-casco',title:'RCA vs CASCO — Care e diferența?',excerpt:'Mulți șoferi nu știu exact ce acoperă fiecare asigurare. Explicăm simplu și clar tot ce trebuie să știi.',category:'Asigurări',date:'1 apr 2026',readTime:'5 min',icon:'📄'},
  {slug:'economiseste-service-auto',title:'10 moduri să economisești la service auto',excerpt:'De la schimbul de ulei la piese de schimb — sfaturi practice pentru a reduce costurile fără a compromite calitatea.',category:'Economie',date:'28 mar 2026',readTime:'7 min',icon:'💰'},
  {slug:'electrice-hybrid-service',title:'Service pentru mașini electrice și hybrid',excerpt:'Mașinile electrice și hybrid au cerințe speciale de service. Iată ce trebuie să știi și cum găsești un service specializat.',category:'Electric',date:'25 mar 2026',readTime:'5 min',icon:'⚡'},
  {slug:'geometrie-echilibrare',title:'Geometria roților — când și de ce e necesară',subtitle:'',excerpt:'Semnele că ai nevoie de geometrie, cât costă și de ce nu trebuie ignorată. Tot ce trebuie să știi.',category:'Întreținere',date:'22 mar 2026',readTime:'4 min',icon:'⚙️'},
]

const CATEGORIES = ['Toate','Ghiduri','ITP & RCA','Asigurări','Economie','Electric','Întreținere']

export default function BlogPage() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');.post-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(26,86,219,0.1)!important}`}</style>

      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'60px 24px',textAlign:'center'}}>
        <div style={{display:'inline-block',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:S.yellow,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'5px 14px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif"}}>Blog auto</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(26px,4vw,42px)',color:'#fff',marginBottom:10,letterSpacing:-0.5}}>Sfaturi și ghiduri auto</h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:16,maxWidth:480,margin:'0 auto'}}>Tot ce trebuie să știi despre întreținerea mașinii, ITP, asigurări și service auto din România.</p>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'40px 24px'}}>
        {/* Categories */}
        <div style={{display:'flex',gap:8,marginBottom:32,overflowX:'auto',paddingBottom:4}}>
          {CATEGORIES.map((cat,i)=>(
            <button key={cat} style={{flexShrink:0,padding:'8px 18px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:`1.5px solid ${i===0?S.blue:S.border}`,background:i===0?'#eaf3ff':S.white,color:i===0?S.blue:S.muted,fontFamily:"'DM Sans',sans-serif"}}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        <div className="post-card" style={{background:S.navy,borderRadius:20,padding:'36px',marginBottom:24,cursor:'pointer',transition:'all .2s',display:'grid',gridTemplateColumns:'1fr',gap:24,alignItems:'center'}}>
          <div>
            <div style={{display:'inline-block',background:'rgba(245,158,11,0.2)',color:S.yellow,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:50,marginBottom:12,fontFamily:"'Sora',sans-serif"}}>📌 Articol recomandat</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:'#fff',marginBottom:10,letterSpacing:-0.3}}>{POSTS[0].title}</h2>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.6)',lineHeight:1.7,marginBottom:16}}>{POSTS[0].excerpt}</p>
            <div style={{display:'flex',gap:16,fontSize:12,color:'rgba(255,255,255,0.4)'}}>
              <span>{POSTS[0].date}</span><span>·</span><span>{POSTS[0].readTime} citire</span>
            </div>
          </div>
          <div style={{width:80,height:80,background:'rgba(255,255,255,0.1)',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,flexShrink:0}}>{POSTS[0].icon}</div>
        </div>

        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
          {POSTS.slice(1).map(post=>(
            <div key={post.slug} className="post-card" style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,cursor:'pointer',transition:'all .2s',boxShadow:'0 2px 8px rgba(10,31,68,0.04)'}}>
              <div style={{width:48,height:48,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:14}}>{post.icon}</div>
              <div style={{display:'inline-block',background:'#eaf3ff',color:S.blue,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:50,marginBottom:10,fontFamily:"'Sora',sans-serif"}}>{post.category}</div>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:8,lineHeight:1.4}}>{post.title}</h3>
              <p style={{fontSize:12,color:S.muted,lineHeight:1.6,marginBottom:12}}>{post.excerpt.substring(0,90)}...</p>
              <div style={{fontSize:11,color:S.muted,display:'flex',gap:10}}>
                <span>{post.date}</span><span>·</span><span>{post.readTime} citire</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:32,color:S.muted,fontSize:14}}>
          Mai multe articole în curând. 📝
        </div>
      </div>
    </div>
  )
}
