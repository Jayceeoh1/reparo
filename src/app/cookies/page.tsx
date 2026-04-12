// @ts-nocheck
const S = {navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',amber:'#d97706',amberBg:'#fef3c7',green:'#16a34a',greenBg:'#dcfce7'}

const COOKIE_TYPES = [
  {name:'Esențiale',icon:'🔒',color:S.green,bg:S.greenBg,required:true,desc:'Necesare pentru funcționarea de bază a platformei. Nu pot fi dezactivate.',examples:['Sesiunea de autentificare','Preferințele de limbă','Securitate CSRF']},
  {name:'Funcționale',icon:'⚙️',color:S.blue,bg:'#eaf3ff',required:false,desc:'Îmbunătățesc experiența ta pe platformă.',examples:['Memorarea orașului selectat','Preferințele de notificări','Setările de afișare']},
  {name:'Analitice',icon:'📊',color:S.amber,bg:S.amberBg,required:false,desc:'Ne ajută să înțelegem cum este folosită platforma.',examples:['Paginile vizitate','Durata sesiunii','Erori tehnice']},
  {name:'Marketing',icon:'📢',color:'#7c3aed',bg:'#ede9fe',required:false,desc:'Folosite pentru publicitate relevantă (dezactivate implicit).',examples:['Reclame personalizate','Retargeting','Partajare rețele sociale']},
]

export default function CookiesPage() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap')`}</style>
      <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:'40px 48px',boxShadow:'0 2px 20px rgba(10,31,68,0.06)'}}>
          <div style={{marginBottom:32}}>
            <a href="/" style={{fontSize:13,color:S.blue,textDecoration:'none',fontWeight:600}}>← Înapoi la Reparo</a>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:32,color:S.navy,margin:'16px 0 8px',letterSpacing:-0.5}}>Politica de Cookie-uri</h1>
            <p style={{fontSize:13,color:S.muted}}>Ultima actualizare: 1 aprilie 2026</p>
          </div>

          <div style={{background:'#eaf3ff',borderRadius:14,padding:'16px 20px',marginBottom:28,border:'1px solid rgba(26,86,219,0.15)'}}>
            <p style={{fontSize:14,color:S.blue,margin:0,lineHeight:1.6}}>
              🍪 Reparo folosește cookie-uri pentru a-ți oferi cea mai bună experiență pe platformă. Poți gestiona preferințele tale mai jos.
            </p>
          </div>

          <div style={{marginBottom:28}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:10}}>Ce sunt cookie-urile?</h2>
            <p style={{fontSize:15,color:'#374151',lineHeight:1.75}}>Cookie-urile sunt fișiere mici de text stocate pe dispozitivul tău când vizitezi un site web. Ele permit site-ului să îți recunoască dispozitivul și să rețină informații despre vizita ta (preferințe, setări, stare de autentificare).</p>
          </div>

          <div style={{marginBottom:28}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:16}}>Tipurile de cookie-uri pe care le folosim</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {COOKIE_TYPES.map(ct => (
                <div key={ct.name} style={{background:ct.bg,borderRadius:14,padding:'16px 20px',border:`1px solid ${ct.color}20`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:20}}>{ct.icon}</span>
                      <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>{ct.name}</span>
                      {ct.required && <span style={{background:ct.color,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:50}}>Obligatorii</span>}
                    </div>
                    {!ct.required && (
                      <div style={{width:44,height:24,background:'#e5e7eb',borderRadius:12,position:'relative',cursor:'pointer'}}>
                        <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',position:'absolute',top:2,left:2,transition:'left .2s'}}/>
                      </div>
                    )}
                  </div>
                  <p style={{fontSize:13,color:'#374151',marginBottom:8,lineHeight:1.6}}>{ct.desc}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {ct.examples.map(ex => (
                      <span key={ex} style={{background:'rgba(255,255,255,0.7)',border:`1px solid ${ct.color}30`,borderRadius:50,padding:'3px 10px',fontSize:11,color:ct.color,fontWeight:600}}>{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {[
            {title:'Cookie-uri terțe',body:`Unii parteneri ai noștri pot seta cookie-uri proprii:\nStripe: pentru procesarea securizată a plăților.\nSupabase: pentru gestionarea autentificării.\nAcești parteneri au propriile politici de confidențialitate.`},
            {title:'Cum poți gestiona cookie-urile',body:`Prin setările browserului tău poți bloca sau șterge cookie-urile oricând. Reține că dezactivarea cookie-urilor esențiale poate afecta funcționarea platformei.\nChrome: Setări → Confidențialitate → Cookie-uri\nFirefox: Setări → Confidențialitate → Cookie-uri\nSafari: Preferințe → Confidențialitate`},
            {title:'Durata cookie-urilor',body:`Cookie-uri de sesiune: se șterg când închizi browserul.\nCookie-uri persistente: rămân până la data de expirare (maxim 12 luni).\nCookie-uri de autentificare: 30 de zile de la ultima activitate.`},
            {title:'Contact',body:`Pentru întrebări despre cookie-uri: privacy@reparo.ro`},
          ].map(section => (
            <div key={section.title} style={{marginBottom:24}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:10}}>{section.title}</h2>
              {section.body.split('\n').map((para,i) => (
                <p key={i} style={{fontSize:15,color:'#374151',lineHeight:1.75,marginBottom:6}}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
