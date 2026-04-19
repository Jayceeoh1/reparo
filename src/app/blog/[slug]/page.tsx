// @ts-nocheck
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const POSTS = {
  'cum-alegi-service-auto': {
    title: 'Cum alegi un service auto de încredere în 2026',
    description: '5 lucruri esențiale pe care trebuie să le verifici înainte să lași mașina la service. Ghid complet pentru șoferii din România.',
    category: 'Ghiduri', date: '5 aprilie 2026', readTime: '4 min',
    content: [
      { type:'lead', text:'Alegerea unui service auto de încredere poate fi dificilă, mai ales dacă nu te pricepi la mașini. Iată ce trebuie să verifici înainte să iei o decizie.' },
      { type:'h2', text:'1. Verifică autorizațiile și certificările' },
      { type:'p', text:'Un service serios trebuie să aibă autorizație RAR (Registrul Auto Român) dacă efectuează ITP sau reparații la sistemele de siguranță. Cere să vezi documentele sau verifică pe reparo.ro dacă service-ul are badge-ul "Autorizat RAR".' },
      { type:'h2', text:'2. Citește recenziile verificate' },
      { type:'p', text:'Recenziile de pe platforme neutre, unde clienții au confirmarea că au folosit serviciul, sunt mult mai valoroase decât cele de pe site-ul service-ului. Pe Reparo, recenziile sunt lăsate doar de clienți care au interacționat real cu service-ul.' },
      { type:'h2', text:'3. Cere deviz înainte de lucru' },
      { type:'p', text:'Orice service serios îți va oferi un deviz detaliat înainte să înceapă lucrările. Dacă refuză sau nu poate estima costurile, e un semnal de alarmă. Folosește Reparo pentru a cere oferte multiple și a compara prețurile.' },
      { type:'h2', text:'4. Verifică garanția lucrărilor' },
      { type:'p', text:'Service-urile serioase oferă garanție pentru manoperă — de obicei 3-12 luni. Întreabă explicit despre garanție și cere-o în scris pe factură sau deviz.' },
      { type:'h2', text:'5. Evită service-urile care cer plata în avans' },
      { type:'p', text:'Un service de încredere nu va cere plata integrală înainte de a-ți repara mașina. Maxim un avans de 30-50% pentru piese speciale care trebuie comandate este acceptabil.' },
      { type:'h2', text:'Concluzie' },
      { type:'p', text:'Cel mai sigur mod de a găsi un service de încredere este prin recomandări verificate și transparența prețurilor. Reparo îți permite să compari oferte de la mai multe service-uri din zona ta, să citești recenzii reale și să programezi online — totul gratuit.' },
    ]
  },
  'itp-2026-ghid-complet': {
    title: 'ITP 2026 — Ghid complet: prețuri, documente, ce se verifică',
    description: 'Tot ce trebuie să știi despre ITP în 2026: prețuri actualizate, documente necesare, ce se verifică la inspecție și cum te pregătești.',
    category: 'ITP & RCA', date: '3 aprilie 2026', readTime: '6 min',
    content: [
      { type:'lead', text:'Inspecția Tehnică Periodică (ITP) este obligatorie pentru toate vehiculele înmatriculate în România. Iată tot ce trebuie să știi pentru 2026.' },
      { type:'h2', text:'Cât costă ITP în 2026?' },
      { type:'bullets', items:['Autoturisme (până la 3,5t): 100-200 RON','Motociclete: 60-120 RON','Autoutilitare (3,5-7,5t): 200-350 RON','Autobuze / camioane: 300-500 RON'] },
      { type:'p', text:'Prețurile pot varia semnificativ între stații, deci merită să compari ofertele pe Reparo.' },
      { type:'h2', text:'Ce documente ai nevoie?' },
      { type:'bullets', items:['Cartea de identitate a vehiculului (talonul)','Asigurarea RCA în vigoare','Actul de identitate al proprietarului sau mandatar','Dovada achitării taxelor (dacă e cazul)'] },
      { type:'h2', text:'Ce se verifică la ITP?' },
      { type:'bullets', items:['Sistemul de frânare — eficiența frânelor față și spate, frâna de mână','Sistemul de direcție — jocul volanului, starea articulațiilor','Iluminarea — faruri, lămpi stop, semnalizatoare','Emisii noxe — CO, HC, opacitate fum (diesel)','Caroseria — coroziune, integritatea structurală','Roți și pneuri — uzura benzii de rulare (min. 1,6mm)'] },
      { type:'h2', text:'Cum te pregătești pentru ITP?' },
      { type:'p', text:'Cu 1-2 săptămâni înainte de ITP verifică presiunea pneurilor, testează toate luminile, verifică lichidul de frână și cel de spălare parbriz, curăță mașina și verifică centura de siguranță.' },
      { type:'h2', text:'Cât timp durează ITP?' },
      { type:'p', text:'O inspecție normală durează 30-60 de minute. La stațiile aglomerate, așteptarea poate fi mai lungă. Programarea online prin Reparo îți permite să alegi o oră convenabilă.' },
    ]
  },
  'rca-vs-casco': {
    title: 'RCA vs CASCO — Care e diferența și de care ai nevoie?',
    description: 'Explicăm simplu diferența dintre RCA și CASCO, ce acoperă fiecare și când merită să iei ambele asigurări.',
    category: 'Asigurări', date: '1 aprilie 2026', readTime: '5 min',
    content: [
      { type:'lead', text:'Confuzia dintre RCA și CASCO este foarte comună în rândul șoferilor din România. Iată o explicație clară a diferențelor.' },
      { type:'h2', text:'RCA — Asigurarea obligatorie' },
      { type:'p', text:'RCA (Răspundere Civilă Auto) este obligatorie prin lege pentru toate vehiculele înmatriculate. Aceasta acoperă daunele produse ALTOR persoane și vehicule în cazul unui accident în care tu ești vinovat.' },
      { type:'h2', text:'Ce acoperă RCA' },
      { type:'bullets', items:['Daunele materiale ale vehiculului celeilalte părți','Vătămările corporale ale altor persoane','Pagubele produse altor bunuri (garduri, clădiri, etc.)'] },
      { type:'h2', text:'CASCO — Asigurarea facultativă' },
      { type:'p', text:'CASCO este voluntară și acoperă propriul tău vehicul, indiferent de cine e vinovat.' },
      { type:'h2', text:'Ce acoperă CASCO' },
      { type:'bullets', items:['Daune produse propriului vehicul în accidente','Furt total sau parțial','Calamități naturale (grindină, inundații, copaci căzuți)','Vandalism și avarii accidentale'] },
      { type:'h2', text:'Când merită CASCO?' },
      { type:'bullets', items:['Mașina ta are o valoare de piață de peste 15.000 EUR','Ai un credit auto și banca îl impune','Locuiești într-o zonă cu risc ridicat de furt','Ești la început de drum și ai mai multe șanse de accidente'] },
      { type:'p', text:'Nu merită CASCO dacă mașina ta valorează sub 5.000 EUR sau ai experiență îndelungată cu un istoric de daune curat.' },
    ]
  },
  'economiseste-service-auto': {
    title: '10 moduri să economisești la service auto fără să compromiți siguranța',
    description: 'Sfaturi practice testate pentru a reduce costurile de întreținere a mașinii fără a risca siguranța ta sau a mașinii.',
    category: 'Economie', date: '28 martie 2026', readTime: '7 min',
    content: [
      { type:'lead', text:'Costurile de întreținere auto pot fi semnificative, dar există modalități inteligente de a le reduce fără a pune în pericol siguranța.' },
      { type:'h2', text:'1. Cere oferte comparative' },
      { type:'p', text:'Înainte de orice lucrare mai mare, cere oferte de la 3-5 service-uri. Diferențele de preț pot fi de 20-40% pentru aceeași lucrare. Reparo îți permite să faci asta în câteva minute.' },
      { type:'h2', text:'2. Nu amâna schimbul de ulei' },
      { type:'p', text:'Un schimb de ulei la timp (100-200 RON) poate preveni o reparație a motorului (2.000-10.000 RON). Respectă intervalele din cartea de service.' },
      { type:'h2', text:'3. Verifică presiunea pneurilor lunar' },
      { type:'p', text:'Pneurile subumflate consumă cu 3-5% mai mult combustibil și se uzează neuniform. Verificarea presiunii este gratuită la benzinărie.' },
      { type:'h2', text:'4. Condus preventiv' },
      { type:'p', text:'Frânarea bruscă și accelerarea agresivă uzează frânele, pneurile și motorul mult mai rapid. Condusul preventiv poate dubla durata de viață a componentelor.' },
      { type:'h2', text:'5. Cumpără piese originale alternative (OEM)' },
      { type:'p', text:'Piesele OEM au aceeași calitate ca piesele originale, la 30-50% din preț. Service-urile partenere Reparo lucrează cu furnizori de calitate verificată.' },
      { type:'h2', text:'6-10. Alte sfaturi practice' },
      { type:'bullets', items:['Fă revizia în sezon mort (primăvara/toamna) pentru prețuri mai bune','Întreabă de abonamente de întreținere anuală — sunt mai ieftine','Curățenia regulată previne coroziunea și deprecierea','Verifică singur nivelul de ulei, lichidul de răcire, starea ștergătoarelor','Construiește o relație cu un service de încredere pe termen lung'] },
    ]
  },
  'electrice-hybrid-service': {
    title: 'Service pentru mașini electrice și hybrid — ce trebuie să știi',
    description: 'Cerințele speciale de service pentru EV și hybrid, ce diferă față de mașinile clasice și cum găsești un service specializat.',
    category: 'Electric', date: '25 martie 2026', readTime: '5 min',
    content: [
      { type:'lead', text:'Mașinile electrice și hybrid aduc cerințe speciale de service și întreținere față de mașinile cu motor termic clasic.' },
      { type:'h2', text:'Ce lipsește la un EV față de o mașină clasică?' },
      { type:'bullets', items:['Schimb de ulei de motor','Filtru de ulei și combustibil','Curea de distribuție','Ambreiaj (la EV-uri pure)','Sistem de evacuare și catalizator'] },
      { type:'h2', text:'Ce există în plus la un EV?' },
      { type:'bullets', items:['Bateria de înaltă tensiune (componenta principală)','Sistemul de management al bateriei (BMS)','Motorul electric și invertorul','Sistemul de încărcare onboard','Frânare regenerativă'] },
      { type:'h2', text:'Sfaturi pentru protejarea bateriei' },
      { type:'bullets', items:['Menține încărcarea între 20-80% pentru uz zilnic','Evită descărcarea completă sub 10%','Limitează încărcarea rapidă DC la uz ocazional','Parcheaz la umbră vara — temperaturile extreme afectează bateria'] },
      { type:'h2', text:'Ce service verifică la un EV?' },
      { type:'bullets', items:['Starea bateriei (capacity check, cell balancing)','Sistemul de răcire al bateriei','Frânele (se uzează mai puțin datorită frânării regenerative)','Lichidul de frână','Sistemul de climatizare','Pneurile (EV-urile sunt mai grele, uzură mai mare)'] },
      { type:'h2', text:'Cum găsești un service specializat?' },
      { type:'p', text:'Nu orice service clasic poate lucra pe mașini electrice. E nevoie de certificare pentru lucrul cu sisteme de înaltă tensiune și echipamente speciale. Pe Reparo poți filtra service-urile după specializare.' },
    ]
  },
  'geometrie-echilibrare': {
    title: 'Geometria roților — când e necesară și de ce nu trebuie ignorată',
    description: 'Semnele că ai nevoie de geometrie, cât costă, ce presupune procedura și ce se întâmplă dacă o ignori.',
    category: 'Intretinere', date: '22 martie 2026', readTime: '4 min',
    content: [
      { type:'lead', text:'Geometria roților este una dintre cele mai ignorate operațiuni de întreținere, deși are impact direct asupra siguranței și costurilor.' },
      { type:'h2', text:'Ce este geometria roților?' },
      { type:'p', text:'Geometria roților se referă la unghiurile precise în care roțile sunt poziționate față de caroserie și față de sol: convergența (toe), căderea (camber) și caster-ul.' },
      { type:'h2', text:'Semnele că ai nevoie de geometrie' },
      { type:'bullets', items:['Mașina trage într-o parte la mers în linie dreaptă','Uzura inegală a pneurilor — mai uzate pe interior sau exterior','Volanul nu e drept când mergi drept înainte','Mașina e instabilă la viteze mari','Consum crescut de combustibil inexplicabil'] },
      { type:'h2', text:'Când e recomandat să faci geometrie?' },
      { type:'bullets', items:['La fiecare 10.000-15.000 km sau anual','Dacă ai lovit o bordură sau groapă adâncă','La schimbarea pneurilor sau pieselor de suspensie','Dacă observi oricare din semnele de mai sus'] },
      { type:'h2', text:'Cât costă geometria roților?' },
      { type:'bullets', items:['Geometrie 2D (convergență): 50-100 RON','Geometrie 3D (full): 150-300 RON'] },
      { type:'h2', text:'Ce se întâmplă dacă ignori geometria?' },
      { type:'bullets', items:['Uzura accelerată a pneurilor — pierzi 20.000-30.000 km din durata de viață','Consum crescut de combustibil (1-3%)','Uzura prematură a componentelor de direcție și suspensie','Risc de siguranță — mașina devine imprevizibilă'] },
    ]
  },
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = POSTS[params.slug]
  if (!post) return { title: 'Articol negasit — Reparo Blog' }
  return {
    title: `${post.title} — Blog Reparo`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article' },
    keywords: `${post.category}, service auto, Romania, ${post.title}`,
  }
}

export function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }))
}

function renderBlock(block: any, idx: number) {
  const S = { navy:'#0a1f44', text:'#111827', muted:'#6b7280', blue:'#1a56db', border:'#e5e7eb' }
  switch (block.type) {
    case 'h2': return (
      <h2 key={idx} style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginTop:32,marginBottom:12,letterSpacing:-0.3,lineHeight:1.3}}>
        {block.text}
      </h2>
    )
    case 'lead': return (
      <p key={idx} style={{fontSize:17,color:S.muted,lineHeight:1.8,marginBottom:24,fontStyle:'italic',borderBottom:`1px solid ${S.border}`,paddingBottom:24}}>
        {block.text}
      </p>
    )
    case 'p': return (
      <p key={idx} style={{fontSize:15,color:S.text,lineHeight:1.8,marginBottom:16}}>
        {block.text}
      </p>
    )
    case 'bullets': return (
      <ul key={idx} style={{margin:'0 0 16px',paddingLeft:0,listStyle:'none'}}>
        {block.items.map((item: string, i: number) => (
          <li key={i} style={{display:'flex',gap:10,marginBottom:8,alignItems:'flex-start'}}>
            <span style={{color:S.blue,flexShrink:0,marginTop:2,fontWeight:700}}>•</span>
            <span style={{fontSize:15,color:S.text,lineHeight:1.7}}>{item}</span>
          </li>
        ))}
      </ul>
    )
    default: return null
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]
  if (!post) notFound()

  const S = { navy:'#0a1f44', blue:'#1a56db', bg:'#f0f6ff', white:'#fff', muted:'#6b7280', border:'#e5e7eb', yellow:'#f59e0b' }
  const otherPosts = Object.entries(POSTS).filter(([s]) => s !== params.slug).slice(0, 3)

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg,minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');.related-card:hover{box-shadow:0 4px 16px rgba(26,86,219,0.12)!important}`}</style>

      {/* Breadcrumb + header */}
      <div style={{background:`linear-gradient(135deg,${S.navy} 0%,#1a3a6b 100%)`,padding:'40px 24px 64px'}}>
        <div style={{maxWidth:760,margin:'0 auto'}}>
          <a href="/blog" style={{color:'rgba(255,255,255,0.55)',textDecoration:'none',fontSize:13,display:'inline-flex',alignItems:'center',gap:6,marginBottom:20}}>
            ← Blog
          </a>
          <div style={{display:'inline-block',background:'rgba(245,158,11,0.2)',color:S.yellow,fontSize:11,fontWeight:700,padding:'3px 12px',borderRadius:50,marginBottom:14,fontFamily:"'Sora',sans-serif",letterSpacing:.5}}>
            {post.category}
          </div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(20px,4vw,34px)',color:'#fff',marginBottom:16,lineHeight:1.25,letterSpacing:-0.5}}>
            {post.title}
          </h1>
          <div style={{display:'flex',gap:16,fontSize:13,color:'rgba(255,255,255,0.5)'}}>
            <span>{post.date}</span><span>·</span><span>{post.readTime} citire</span>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div style={{maxWidth:760,margin:'-28px auto 0',padding:'0 24px 60px',position:'relative'}}>
        <div style={{background:S.white,borderRadius:20,padding:'clamp(20px,4vw,40px)',boxShadow:'0 4px 24px rgba(10,31,68,0.08)',marginBottom:28}}>
          {post.content.map((block, idx) => renderBlock(block, idx))}

          {/* CTA box */}
          <div style={{background:'#eaf3ff',borderRadius:14,padding:'20px 24px',marginTop:32,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:4}}>Cauta un service de incredere</div>
              <div style={{fontSize:13,color:S.muted}}>Oferte gratuite de la service-uri verificate din zona ta</div>
            </div>
            <a href="/home" style={{display:'inline-block',padding:'11px 22px',background:S.blue,color:'#fff',borderRadius:50,fontSize:14,fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>
              Cere oferta gratuita →
            </a>
          </div>
        </div>

        {/* Related */}
        <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:14}}>Articole similare</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {otherPosts.map(([slug, p]) => (
            <a key={slug} href={`/blog/${slug}`} className="related-card"
              style={{background:S.white,borderRadius:14,padding:16,textDecoration:'none',border:`1px solid ${S.border}`,transition:'box-shadow .2s'}}>
              <div style={{fontSize:10,fontWeight:700,color:S.blue,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>{p.category}</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy,marginBottom:6,lineHeight:1.4}}>{p.title}</div>
              <div style={{fontSize:11,color:S.muted}}>{p.readTime} citire</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
