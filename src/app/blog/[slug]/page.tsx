// @ts-nocheck
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const POSTS = {
  'cum-alegi-service-auto': {
    title: 'Cum alegi un service auto de încredere în 2026',
    description: '5 lucruri esențiale pe care trebuie să le verifici înainte să lași mașina la service. Ghid complet pentru șoferii din România.',
    category: 'Ghiduri', date: '5 aprilie 2026', readTime: '4 min',
    content: [
      { type:'lead', text:"Alegerea unui service auto de încredere poate fi dificilă, mai ales dacă nu te pricepi la mașini. Iată ce trebuie să verifici înainte să iei o decizie." },
      { type:'h2', text:"1. Verifică autorizațiile și certificările" },
      { type:'p', text:"Un service serios trebuie să aibă autorizație RAR (Registrul Auto Român) dacă efectuează ITP sau reparații la sistemele de siguranță. Cere să vezi documentele sau verifică pe reparo.ro dacă service-ul are badge-ul \"Autorizat RAR\"." },
      { type:'h2', text:'2. Citește recenziile verificate' },
      { type:'p', text:"Recenziile de pe platforme neutre, unde clienții au confirmarea că au folosit serviciul, sunt mult mai valoroase decât cele de pe site-ul service-ului. Pe Serviceclub, recenziile sunt lăsate doar de clienți care au interacționat real cu service-ul." },
      { type:'h2', text:"3. Cere deviz înainte de lucru" },
      { type:'p', text:"Orice service serios îți va oferi un deviz detaliat înainte să înceapă lucrările. Dacă refuză sau nu poate estima costurile, e un semnal de alarmă. Folosește Serviceclub pentru a cere oferte multiple și a compara prețurile." },
      { type:'h2', text:"4. Verifică garanția lucrărilor" },
      { type:'p', text:"Service-urile serioase oferă garanție pentru manoperă — de obicei 3-12 luni. Întreabă explicit despre garanție și cere-o în scris pe factură sau deviz." },
      { type:'h2', text:"5. Evită service-urile care cer plata în avans" },
      { type:'p', text:"Un service de încredere nu va cere plata integrală înainte de a-ți repara mașina. Maxim un avans de 30-50% pentru piese speciale care trebuie comandate este acceptabil." },
      { type:'h2', text:'Concluzie' },
      { type:'p', text:"Cel mai sigur mod de a găsi un service de încredere este prin recomandări verificate și transparența prețurilor. Serviceclub îți permite să compari oferte de la mai multe service-uri din zona ta, să citești recenzii reale și să programezi online — totul gratuit." },
    ]
  },
  'itp-2026-ghid-complet': {
    title: 'ITP 2026 — Ghid complet: prețuri, documente, ce se verifică',
    description: 'Tot ce trebuie să știi despre ITP în 2026: prețuri actualizate, documente necesare, ce se verifică la inspecție și cum te pregătești.',
    category: 'ITP & RCA', date: '3 aprilie 2026', readTime: '6 min',
    content: [
      { type:'lead', text:"Inspecția Tehnică Periodică (ITP) este obligatorie pentru toate vehiculele înmatriculate în România. Iată tot ce trebuie să știi pentru 2026." },
      { type:'h2', text:"Cât costă ITP în 2026?" },
      { type:'bullets', items:['Autoturisme (până la 3,5t): 100-200 RON','Motociclete: 60-120 RON','Autoutilitare (3,5-7,5t): 200-350 RON','Autobuze / camioane: 300-500 RON'] },
      { type:'p', text:"Prețurile pot varia semnificativ între stații, deci merită să compari ofertele pe Serviceclub." },
      { type:'h2', text:'Ce documente ai nevoie?' },
      { type:'bullets', items:['Cartea de identitate a vehiculului (talonul)','Asigurarea RCA în vigoare','Actul de identitate al proprietarului sau mandatar','Dovada achitării taxelor (dacă e cazul)'] },
      { type:'h2', text:'Ce se verifică la ITP?' },
      { type:'bullets', items:['Sistemul de frânare — eficiența frânelor față și spate, frâna de mână','Sistemul de direcție — jocul volanului, starea articulațiilor','Iluminarea — faruri, lămpi stop, semnalizatoare','Emisii noxe — CO, HC, opacitate fum (diesel)','Caroseria — coroziune, integritatea structurală','Roți și pneuri — uzura benzii de rulare (min. 1,6mm)'] },
      { type:'h2', text:'Cum te pregătești pentru ITP?' },
      { type:'p', text:"Cu 1-2 săptămâni înainte de ITP verifică presiunea pneurilor, testează toate luminile, verifică lichidul de frână și cel de spălare parbriz, curăță mașina și verifică centura de siguranță." },
      { type:'h2', text:'Cât timp durează ITP?' },
      { type:'p', text:"O inspecție normală durează 30-60 de minute. La stațiile aglomerate, așteptarea poate fi mai lungă. Programarea online prin Serviceclub îți permite să alegi o oră convenabilă." },
    ]
  },
  'rca-vs-casco': {
    title: 'RCA vs CASCO — Care e diferența și de care ai nevoie?',
    description: 'Explicăm simplu diferența dintre RCA și CASCO, ce acoperă fiecare și când merită să iei ambele asigurări.',
    category: 'Asigurări', date: '1 aprilie 2026', readTime: '5 min',
    content: [
      { type:'lead', text:"Confuzia dintre RCA și CASCO este foarte comună în rândul șoferilor din România. Iată o explicație clară a diferențelor." },
      { type:'h2', text:'RCA — Asigurarea obligatorie' },
      { type:'p', text:"RCA (Răspundere Civilă Auto) este obligatorie prin lege pentru toate vehiculele înmatriculate. Aceasta acoperă daunele produse ALTOR persoane și vehicule în cazul unui accident în care tu ești vinovat." },
      { type:'h2', text:'Ce acoperă RCA' },
      { type:'bullets', items:['Daunele materiale ale vehiculului celeilalte părți','Vătămările corporale ale altor persoane','Pagubele produse altor bunuri (garduri, clădiri, etc.)'] },
      { type:'h2', text:'CASCO — Asigurarea facultativă' },
      { type:'p', text:"CASCO este voluntară și acoperă propriul tău vehicul, indiferent de cine e vinovat." },
      { type:'h2', text:'Ce acoperă CASCO' },
      { type:'bullets', items:['Daune produse propriului vehicul în accidente','Furt total sau parțial','Calamități naturale (grindină, inundații, copaci căzuți)','Vandalism și avarii accidentale'] },
      { type:'h2', text:'Când merită CASCO?' },
      { type:'bullets', items:['Mașina ta are o valoare de piață de peste 15.000 EUR','Ai un credit auto și banca îl impune','Locuiești într-o zonă cu risc ridicat de furt','Ești la început de drum și ai mai multe șanse de accidente'] },
      { type:'p', text:"Nu merită CASCO dacă mașina ta valorează sub 5.000 EUR sau ai experiență îndelungată cu un istoric de daune curat." },
    ]
  },
  'economiseste-service-auto': {
    title: '10 moduri să economisești la service auto fără să compromiți siguranța',
    description: 'Sfaturi practice testate pentru a reduce costurile de întreținere a mașinii fără a risca siguranța ta sau a mașinii.',
    category: 'Economie', date: '28 martie 2026', readTime: '7 min',
    content: [
      { type:'lead', text:"Costurile de întreținere auto pot fi semnificative, dar există modalități inteligente de a le reduce fără a pune în pericol siguranța." },
      { type:'h2', text:'1. Cere oferte comparative' },
      { type:'p', text:"Înainte de orice lucrare mai mare, cere oferte de la 3-5 service-uri. Diferențele de preț pot fi de 20-40% pentru aceeași lucrare. Serviceclub îți permite să faci asta în câteva minute." },
      { type:'h2', text:'2. Nu amâna schimbul de ulei' },
      { type:'p', text:"Un schimb de ulei la timp (100-200 RON) poate preveni o reparație a motorului (2.000-10.000 RON). Respectă intervalele din cartea de service." },
      { type:'h2', text:'3. Verifică presiunea pneurilor lunar' },
      { type:'p', text:"Pneurile subumflate consumă cu 3-5% mai mult combustibil și se uzează neuniform. Verificarea presiunii este gratuită la benzinărie." },
      { type:'h2', text:'4. Condus preventiv' },
      { type:'p', text:"Frânarea bruscă și accelerarea agresivă uzează frânele, pneurile și motorul mult mai rapid. Condusul preventiv poate dubla durata de viață a componentelor." },
      { type:'h2', text:'5. Cumpără piese originale alternative (OEM)' },
      { type:'p', text:"Piesele OEM au aceeași calitate ca piesele originale, la 30-50% din preț. Service-urile partenere Serviceclub lucrează cu furnizori de calitate verificată." },
      { type:'h2', text:'6-10. Alte sfaturi practice' },
      { type:'bullets', items:['Fă revizia în sezon mort (primăvara/toamna) pentru prețuri mai bune','Întreabă de abonamente de întreținere anuală — sunt mai ieftine','Curățenia regulată previne coroziunea și deprecierea','Verifică singur nivelul de ulei, lichidul de răcire, starea ștergătoarelor','Construiește o relație cu un service de încredere pe termen lung'] },
    ]
  },
  'electrice-hybrid-service': {
    title: 'Service pentru mașini electrice și hybrid — ce trebuie să știi',
    description: 'Cerințele speciale de service pentru EV și hybrid, ce diferă față de mașinile clasice și cum găsești un service specializat.',
    category: 'Electric', date: '25 martie 2026', readTime: '5 min',
    content: [
      { type:'lead', text:"Mașinile electrice și hybrid aduc cerințe speciale de service și întreținere față de mașinile cu motor termic clasic." },
      { type:'h2', text:"Ce lipsește la un EV față de o mașină clasică?" },
      { type:'bullets', items:['Schimb de ulei de motor','Filtru de ulei și combustibil','Curea de distribuție','Ambreiaj (la EV-uri pure)','Sistem de evacuare și catalizator'] },
      { type:'h2', text:"Ce există în plus la un EV?" },
      { type:'bullets', items:['Bateria de înaltă tensiune (componenta principală)','Sistemul de management al bateriei (BMS)','Motorul electric și invertorul','Sistemul de încărcare onboard','Frânare regenerativă'] },
      { type:'h2', text:'Sfaturi pentru protejarea bateriei' },
      { type:'bullets', items:['Menține încărcarea între 20-80% pentru uz zilnic','Evită descărcarea completă sub 10%','Limitează încărcarea rapidă DC la uz ocazional','Parcheaz la umbră vara — temperaturile extreme afectează bateria'] },
      { type:'h2', text:'Ce service verifică la un EV?' },
      { type:'bullets', items:['Starea bateriei (capacity check, cell balancing)','Sistemul de răcire al bateriei','Frânele (se uzează mai puțin datorită frânării regenerative)','Lichidul de frână','Sistemul de climatizare','Pneurile (EV-urile sunt mai grele, uzură mai mare)'] },
      { type:'h2', text:'Cum găsești un service specializat?' },
      { type:'p', text:"Nu orice service clasic poate lucra pe mașini electrice. E nevoie de certificare pentru lucrul cu sisteme de înaltă tensiune și echipamente speciale. Pe Serviceclub poți filtra service-urile după specializare." },
    ]
  },
  'geometrie-echilibrare': {
    title: 'Geometria roților — când e necesară și de ce nu trebuie ignorată',
    description: 'Semnele că ai nevoie de geometrie, cât costă, ce presupune procedura și ce se întâmplă dacă o ignori.',
    category: 'Intretinere', date: '22 martie 2026', readTime: '4 min',
    content: [
      { type:'lead', text:"Geometria roților este una dintre cele mai ignorate operațiuni de întreținere, deși are impact direct asupra siguranței și costurilor." },
      { type:'h2', text:"Ce este geometria roților?" },
      { type:'p', text:"Geometria roților se referă la unghiurile precise în care roțile sunt poziționate față de caroserie și față de sol: convergența (toe), căderea (camber) și caster-ul." },
      { type:'h2', text:'Semnele că ai nevoie de geometrie' },
      { type:'bullets', items:['Mașina trage într-o parte la mers în linie dreaptă','Uzura inegală a pneurilor — mai uzate pe interior sau exterior','Volanul nu e drept când mergi drept înainte','Mașina e instabilă la viteze mari','Consum crescut de combustibil inexplicabil'] },
      { type:'h2', text:'Când e recomandat să faci geometrie?' },
      { type:'bullets', items:['La fiecare 10.000-15.000 km sau anual','Dacă ai lovit o bordură sau groapă adâncă','La schimbarea pneurilor sau pieselor de suspensie','Dacă observi oricare din semnele de mai sus'] },
      { type:'h2', text:"Cât costă geometria roților?" },
      { type:'bullets', items:['Geometrie 2D (convergență): 50-100 RON','Geometrie 3D (full): 150-300 RON'] },
      { type:'h2', text:"Ce se întâmplă dacă ignori geometria?" },
      { type:'bullets', items:['Uzura accelerată a pneurilor — pierzi 20.000-30.000 km din durata de viață','Consum crescut de combustibil (1-3%)','Uzura prematură a componentelor de direcție și suspensie','Risc de siguranță — mașina devine imprevizibilă'] },
    ]
  },
  'schimb-ulei-ghid': {
    title: 'Schimb de ulei — cât de des și ce ulei alegi pentru mașina ta',
    description: 'Intervalele recomandate de schimb de ulei, diferența dintre uleiurile minerale, semisintetice și sintetice și cum alegi viscozitatea corectă.',
    category: 'Întreținere', date: '19 martie 2026', readTime: '5 min',
    content: [
      { type:'lead', text:"Schimbul de ulei este cea mai importantă operațiune de întreținere a motorului. Un ulei degradat accelerează uzura și poate duce la avarii costisitoare." },
      { type:'h2', text:'Cât de des trebuie schimbat uleiul?' },
      { type:'p', text:"Intervalul depinde de tipul de ulei și de condițiile de utilizare. Ca regulă generală, dacă manualul mașinii spune 15.000-20.000 km pentru ulei sintetic, în trafic urban intens reduce intervalul cu 25-30%." },
      { type:'bullets', items:['Ulei mineral: 5.000-7.500 km sau anual','Ulei semisintetic: 7.500-10.000 km','Ulei sintetic: 10.000-15.000 km','Ulei sintetic Long Life (VAG, BMW): 20.000-30.000 km (sau conform OBC)'] },
      { type:'h2', text:'Diferența dintre tipurile de ulei' },
      { type:'bullets', items:['Mineral — baza rafinată din petrol brut, protecție standard, ieftin. Recomandat motoarelor vechi sau clasice.','Semisintetic — amestec de ulei mineral și aditivi sintetici. Raport bun calitate/preț pentru mașini obișnuite.','Sintetic — produs prin sinteză chimică, performanță superioară la temperaturi extreme, protecție mai bună și interval de schimb mai lung.','Full synthetic Long Life — pentru mașinile moderne cu interval variabil determinat de senzori (OBC).'] },
      { type:'h2', text:'Cum alegi viscozitatea corectă?' },
      { type:'p', text:"Viscozitatea (de exemplu 5W-40 sau 0W-30) indică comportamentul uleiului la temperaturi scăzute (primul număr) și înalte (al doilea). Respectă întotdeauna specificațiile din manualul mașinii sau de pe capacul motorului." },
      { type:'bullets', items:['5W-30 sau 0W-30 — pentru motoare moderne, consum redus de carburant','5W-40 — versatil, potrivit pentru majority mașinilor europene','10W-40 — pentru mașini mai vechi sau în climate calde','Atenție: un ulei prea fluid poate crește consumul, unul prea vâscos forțează pompa de ulei'] },
      { type:'h2', text:"Ce se întâmplă dacă nu schimbi uleiul la timp?" },
      { type:'bullets', items:['Uleiul se oxidează și pierde proprietățile de lubrifiere','Depuneri de nămol în motor (sludge) — costisitoare de curățat','Uzura accelerată a lagărelor, pistoanelor și arborelui cu came','În cazuri extreme: griparea motorului — avarie totală'] },
      { type:'h2', text:'Schimb de ulei la Serviceclub' },
      { type:'p', text:"Pe Serviceclub poți cere oferte pentru schimb de ulei de la service-uri din zona ta și compara prețurile în timp real. Mulți operatori includ și filtrul de ulei în preț — verifică devizul detaliat înainte să confirmi."} },
    ]
  },
  'service-auto-bucuresti': {
    title: 'Cum găsești un service auto de încredere în București în 2026',
    description: 'Ghid complet pentru alegerea unui service auto bun în București: cartiere, prețuri medii, ce să eviți și cum să compari ofertele eficient.',
    category: 'Ghiduri', date: '16 martie 2026', readTime: '6 min',
    content: [
      { type:'lead', text:"București are sute de service-uri auto, de la ateliere de cartier la dealeri autorizați. Cum alegi pe cel mai bun pentru mașina și bugetul tău?" },
      { type:'h2', text:"Tipuri de service-uri în București" },
      { type:'bullets', items:['Dealeri autorizați (ex. BMW, Mercedes, Volkswagen) — garanție și piese originale, prețuri mai ridicate','Service-uri multimarcă — prețuri competitive, personal calificat, flexibilitate mai mare','Service-uri specializate pe marcă (ex. numai BMW sau numai Dacia) — expertiză aprofundată, piese de specialitate','Ateliere de cartier — prețuri scăzute, calitate variabilă, verifică recenziile'] },
      { type:'h2', text:"Prețuri orientative pentru servicii comune în București (2026)" },
      { type:'bullets', items:['Schimb ulei + filtru: 150-350 RON (depinde de tip ulei)','Schimb plăcuțe față: 200-400 RON manoperă + piese','ITP autoturism: 120-200 RON','Diagnoză electronică: 50-150 RON','Kit distribuție (manoperă): 400-900 RON','Geometrie 3D: 150-280 RON'] },
      { type:'h2', text:'Cartierele cu cele mai multe service-uri de calitate' },
      { type:'p', text:"Concentrări mari de service-uri sunt în Militari, Colentina, Pantelimon, Pipera și Berceni. Autostrada Soarelui (DN3) și zona Ilfov au service-uri specializate pentru reparații mai complexe." },
      { type:'h2', text:"Ce să eviți la un service auto din București" },
      { type:'bullets', items:['Service-uri fără adresă fizică clară sau număr de telefon verificat','Prețuri suspicioasă de mici (pot ascunde piese contrafăcute)','Refuzul de a da deviz scris înainte de lucrare','Presiunea de a aproba lucrări suplimentare pe loc, fără timp de gândire','Plata doar cash, fără chitanță sau factură'] },
      { type:'h2', text:"Cum folosești Serviceclub pentru a găsi service în București" },
      { type:'p', text:"Serviceclub listează service-uri verificate din București, cu recenzii reale de la clienți confirmați. Poți trimite o cerere de ofertă și primi prețuri de la mai multe service-uri din cartierul tău în câteva ore — fără a fi nevoit să suni pe rând la fiecare."} },
    ]
  },
  'intretinere-preventiva': {
    title: 'Întreținerea preventivă a mașinii — lista completă de verificări',
    description: 'Ce trebuie să verifici la mașina ta lunar, anual și la fiecare 10.000 km. Ghid practic pentru întreținerea preventivă în România.',
    category: 'Întreținere', date: '13 martie 2026', readTime: '7 min',
    content: [
      { type:'lead', text:"Întreținerea preventivă costă mult mai puțin decât reparațiile. Iată o listă completă cu ce trebuie verificat și când." },
      { type:'h2', text:"Verificări lunare (poți face singur)" },
      { type:'bullets', items:['Nivelul uleiului de motor — verifica pe rece, pe suprafata plata','Nivelul lichidului de răcire (antigel) — între MIN și MAX pe vas','Nivelul lichidului de frână — rezervorul transparent de pe motor','Nivelul lichidului de spălare parbriz','Presiunea pneurilor — verifica la rece (28-35 psi, conform manual)','Funcționarea tuturor luminilor (faruri, stop, semnalizatoare)'] },
      { type:'h2', text:'Verificări la 10.000 km sau anual' },
      { type:'bullets', items:['Schimb ulei motor + filtru ulei','Filtru habitaclu (filtru polen) — important pentru aer curat în mașină','Verificare sistem de frânare — plăcuțe, discuri, cabluri frână de mână','Verificare suspensie — amortizoare, articulații, cauciucuri','Verificare sistem de evacuare — coroziune, scăpări de gaze','Verificare stare baterie — mai ales toamna înainte de iarnă'] },
      { type:'h2', text:'Verificări la 20.000-30.000 km' },
      { type:'bullets', items:['Filtru aer motor','Lichidul de frână (se degradează în 2 ani chiar dacă nu e consumat)','Lichid de transmisie (la cutie automată: 40.000-60.000 km)','Bujii (convenționale: 30.000 km, iridiu/platină: 60.000-100.000 km)','Filtru combustibil (la multe mașini e în rezervor, verifică manualul)'] },
      { type:'h2', text:'Verificări la 60.000-100.000 km' },
      { type:'bullets', items:['Kit distribuție (curea sau lanț) — una din cele mai importante intervenții','Curea accesorii (alternator, AC, servo)','Ambreiaj (la mașinile cu cutie manuală) — uzura depinde mult de stilul de condus','Antigel — se schimbă complet la 3-5 ani indiferent de km'] },
      { type:'h2', text:"Pregătirea mașinii pentru iarnă" },
      { type:'bullets', items:['Montaj anvelope iarnă (sub 7°C)','Verificare antigel — să reziste la cel puțin -25°C','Test baterie — bateriile slabe cedează la frig','Verificare sistem de încălzire și dezaburire','Stergătoare de iarnă și lichid omologat pentru temperaturi negative'] },
      { type:'h2', text:'Folosește Serviceclub pentru programare' },
      { type:'p', text:"Programează toate aceste verificări la service-uri din zona ta prin Serviceclub. Primești oferte comparative și poți alege cel mai bun raport calitate/preț — fără telefoane și așteptare."} },
    ]
  },
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = POSTS[params.slug]
  if (!post) return { title: 'Articol negasit — Serviceclub Blog' }
  return {
    title: `${post.title} — Blog Serviceclub`,
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
