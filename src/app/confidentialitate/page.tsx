// @ts-nocheck
const S = {navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb'}

export default function ConfidentialitatePage() {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap')`}</style>
      <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{background:S.white,borderRadius:20,border:`1px solid ${S.border}`,padding:'40px 48px',boxShadow:'0 2px 20px rgba(10,31,68,0.06)'}}>
          <div style={{marginBottom:32}}>
            <a href="/" style={{fontSize:13,color:S.blue,textDecoration:'none',fontWeight:600}}>← Înapoi la Reparo</a>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:32,color:S.navy,margin:'16px 0 8px',letterSpacing:-0.5}}>Politica de Confidențialitate</h1>
            <p style={{fontSize:13,color:S.muted}}>Ultima actualizare: 1 aprilie 2026</p>
          </div>
          {[
            {title:'1. Cine suntem',body:`Reparo SRL este operatorul datelor tale personale colectate prin intermediul platformei reparo.ro. Ne angajăm să protejăm confidențialitatea datelor tale și să respectăm Regulamentul General privind Protecția Datelor (GDPR).`},
            {title:'2. Ce date colectăm',body:`Date de identificare: nume, adresă de email, număr de telefon.\nDate despre vehicul: marca, modelul, anul de fabricație, numărul de înmatriculare.\nDate de utilizare: istoricul cererilor de ofertă, programărilor și conversațiilor.\nDate tehnice: adresă IP, tipul dispozitivului, browserul utilizat.\nDate de plată: procesate securizat prin Stripe (nu stocăm datele cardului).`},
            {title:'3. Cum folosim datele',body:`Furnizarea serviciilor platformei (cereri de ofertă, programări, mesagerie).\nComunicări despre serviciile tale (oferte, confirmări, remindere).\nÎmbunătățirea platformei și personalizarea experienței.\nConformitatea cu obligațiile legale.\nPrevenirea fraudei și asigurarea securității.`},
            {title:'4. Temeiul legal',body:`Executarea contractului: pentru furnizarea serviciilor platformei.\nInteresul legitim: pentru îmbunătățirea serviciilor și prevenirea fraudei.\nConsimțământul: pentru comunicări de marketing (poți retrage oricând).\nObligația legală: pentru conformitatea cu legislația aplicabilă.`},
            {title:'5. Cu cine împărtășim datele',body:`Service-urile partenere: primesc datele necesare pentru a răspunde cererilor tale.\nFurnizori de servicii: Supabase (hosting), Stripe (plăți), Resend (email) — cu garanții adecvate de protecție.\nAutorități: doar când suntem obligați legal.\nNu vindem și nu închiriem datele tale terților.`},
            {title:'6. Cât timp păstrăm datele',body:`Datele contului: pe durata existenței contului + 30 de zile după ștergere.\nIstoricul tranzacțiilor: 5 ani (obligație legală).\nJurnale tehnice: 90 de zile.\nComunicări de marketing: până la retragerea consimțământului.`},
            {title:'7. Drepturile tale',body:`Dreptul de acces: poți solicita o copie a datelor tale.\nDreptul la rectificare: poți corecta datele inexacte.\nDreptul la ștergere: poți solicita ștergerea datelor ("dreptul de a fi uitat").\nDreptul la portabilitate: poți primi datele într-un format structurat.\nDreptul de opoziție: poți refuza prelucrarea în anumite cazuri.\nPentru a-ți exercita drepturile: privacy@reparo.ro`},
            {title:'8. Securitate',body:`Utilizăm criptare SSL/TLS pentru toate comunicările. Datele sunt stocate pe servere securizate în UE. Accesul intern este restricționat pe principiul necesității. Efectuăm audituri de securitate periodice.`},
            {title:'9. Cookie-uri',body:`Folosim cookie-uri esențiale pentru funcționarea platformei și cookie-uri analitice (cu consimțământul tău). Poți gestiona preferințele de cookie-uri din setările browserului. Pentru detalii, consultă Politica noastră de Cookie-uri.`},
            {title:'10. Contact DPO',body:`Pentru orice întrebări legate de protecția datelor:\nEmail: privacy@reparo.ro\nPoți depune plângere la ANSPDCP (Autoritatea Națională de Supraveghere) dacă consideri că drepturile tale nu au fost respectate.`},
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
