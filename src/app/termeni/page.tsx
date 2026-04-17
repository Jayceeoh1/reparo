// @ts-nocheck
const S = {navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb'}

export default function TermeniPage() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap')`}</style>
      <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:'clamp(20px,4vw,40px) clamp(16px,4vw,48px)',boxShadow:'0 2px 20px rgba(10,31,68,0.06)'}}>
          <div style={{marginBottom:32}}>
            <a href="/" style={{fontSize:13,color:S.blue,textDecoration:'none',fontWeight:600}}>← Înapoi la Reparo</a>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:32,color:S.navy,margin:'16px 0 8px',letterSpacing:-0.5}}>Termeni și Condiții</h1>
            <p style={{fontSize:13,color:S.muted}}>Ultima actualizare: 1 aprilie 2026</p>
          </div>
          {[
            {title:'1. Introducere',body:`Bine ai venit pe Reparo ("Platforma"), o platformă digitală care conectează proprietarii de autovehicule cu service-uri auto din România. Prin accesarea sau utilizarea Platformei, ești de acord cu acești Termeni și Condiții. Te rugăm să îi citești cu atenție.`},
            {title:'2. Definiții',body:`"Utilizator" înseamnă orice persoană care accesează Platforma.\n"Service" înseamnă orice companie sau persoană fizică autorizată care oferă servicii auto prin intermediul Platformei.\n"Cerere de ofertă" înseamnă solicitarea trimisă de un utilizator către service-uri.\n"Ofertă" înseamnă răspunsul unui service la o cerere de ofertă.`},
            {title:'3. Condiții de utilizare',body:`Trebuie să ai cel puțin 18 ani pentru a utiliza Platforma. Te angajezi să furnizezi informații corecte și complete la înregistrare. Nu vei utiliza Platforma în scopuri ilegale sau frauduloase. Nu vei distribui conținut ofensator, fals sau înșelător.`},
            {title:'4. Serviciile Reparo',body:`Reparo acționează exclusiv ca intermediar între utilizatori și service-uri. Reparo nu este parte a contractului dintre utilizator și service. Reparo nu garantează calitatea serviciilor oferite de service-urile partenere. Reparo nu este responsabil pentru disputele dintre utilizatori și service-uri.`},
            {title:'5. Responsabilitatea service-urilor',body:`Service-urile înregistrate pe Platformă sunt responsabile pentru exactitatea informațiilor din profil, respectarea legislației aplicabile, calitatea serviciilor oferite și onorararea ofertelor trimise prin Platformă.`},
            {title:'6. Plăți și abonamente',body:`Planurile de abonament (Free, Basic, Pro) sunt descrise pe pagina de prețuri. Plățile sunt procesate securizat prin Stripe. Abonamentele pot fi anulate oricând, fără penalități. Rambursările se procesează conform politicii Reparo.`},
            {title:'7. Proprietate intelectuală',body:`Tot conținutul Platformei (logo, design, cod, texte) este proprietatea Reparo SRL. Este interzisă copierea sau reproducerea fără acordul scris al Reparo. Utilizatorii păstrează drepturile asupra conținutului pe care îl publică pe Platformă.`},
            {title:'8. Limitarea răspunderii',body:`Reparo nu este responsabil pentru pierderi indirecte sau consecvente. Răspunderea maximă a Reparo este limitată la suma plătită de utilizator în ultimele 3 luni. Platforma este furnizată "ca atare", fără garanții implicite.`},
            {title:'9. Modificări',body:`Reparo își rezervă dreptul de a modifica acești Termeni în orice moment. Utilizatorii vor fi notificați prin email cu 30 de zile înainte de intrarea în vigoare a modificărilor. Continuarea utilizării Platformei după modificări constituie acceptarea acestora.`},
            {title:'10. Contact',body:`Pentru întrebări legate de acești Termeni, ne poți contacta la:\nEmail: legal@reparo.ro\nAdresă: București, România`},
          ].map(section => (
            <div key={section.title} style={{marginBottom:28}}>
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
