// @ts-nocheck
'use client'
import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy: '#0a1f44', blue: '#1a56db', blueLight: '#3b82f6', yellow: '#f59e0b',
  bg: '#f0f6ff', white: '#fff', text: '#111827', muted: '#6b7280', border: '#e5e7eb',
  green: '#16a34a', greenBg: '#dcfce7', red: '#dc2626', redBg: '#fee2e2',
  amber: '#d97706', amberBg: '#fef3c7', purple: '#7c3aed', purpleBg: '#ede9fe',
}

const pill = (bg, color, text) => ({
  display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,
  background:bg,color,fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"
})

const btn = (variant='primary') => ({
  display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',
  borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',
  fontFamily:"'DM Sans',sans-serif",transition:'all .15s',
  ...(variant==='primary'?{background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}:
    variant==='outline'?{background:'transparent',color:S.blue,border:`1.5px solid ${S.blue}`}:
    variant==='ghost'?{background:'transparent',color:S.muted,border:`1.5px solid ${S.border}`}:
    {background:S.yellow,color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.25)'})
})

const card = (extra={}) => ({
  background:S.white,borderRadius:16,border:`1px solid ${S.border}`,
  boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...extra
})

const input = {
  width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,
  fontSize:13,color:S.text,outline:'none',fontFamily:"'DM Sans',sans-serif",background:S.white
}

const label = {display:'block',fontSize:11,fontWeight:700,color:S.muted,
  textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:"'Sora',sans-serif"}

const SERVICE_CATEGORIES = [
  { cat:'🔧 Revizie & Mentenanță', items:['Schimb ulei motor','Schimb filtre (aer, polen, combustibil)','Verificare generală','Schimb lichid frână','Schimb lichid răcire (antigel)','Schimb lichid servo','Schimb bujii / bujii incandescente'] },
  { cat:'🛑 Frâne', items:['Schimb plăcuțe frână','Schimb discuri frână','Schimb etrieri','Recondiționare etrieri','Aerisire sistem frânare','Diagnoză sistem frânare'] },
  { cat:'⚙️ Mecanică generală', items:['Suspensie (amortizoare, arcuri)','Direcție (bielete, capete bară)','Planetare','Rulmenți roată','Sistem evacuare','Reparații motor generale','Reparații cutie viteze','Revizie cutie viteze'] },
  { cat:'🔥 Distribuție & Motor', items:['Schimb kit distribuție','Schimb curea accesorii','Reparații motor','Garnitură chiulasă','Rectificare motor'] },
  { cat:'⚡ Electrică auto', items:['Diagnoză electrică','Reparații instalație electrică','Alternator','Electromotor','Senzori','Probleme bord / martori'] },
  { cat:'💻 Diagnoză electronică', items:['Scanare erori','Resetare erori','Codări / adaptări','Actualizări software'] },
  { cat:'❄️ Climatizare & AC', items:['Încărcare freon','Verificare instalație AC','Reparații compresor','Curățare instalație AC'] },
  { cat:'🎨 Vopsitorie & Caroserie', items:['Vopsitorie element','Vopsitorie integrală','Tinichigerie','Îndreptare caroserie','Polish auto','Reparații daune'] },
  { cat:'🛞 Anvelope & Roți', items:['Montaj anvelope','Demontaj anvelope','Echilibrare roți','Geometrie roți','Vulcanizare'] },
  { cat:'🚗 ITP', items:['ITP autoturisme','ITP autoutilitare'] },
  { cat:'🔋 Baterii & Electric Hibrid', items:['Schimb baterie','Test baterie','Sisteme hibride / electrice'] },
  { cat:'⛽ Sistem combustibil', items:['Reparații injectoare','Curățare injectoare','Reparații pompă combustibil','Reparații sistem alimentare'] },
  { cat:'🚘 Transmisie', items:['Ambreiaj','Volantă','Cutie manuală','Cutie automată','Schimb ulei cutie'] },
  { cat:'🚨 Tractări & Asistență', items:['Tractare auto','Asistență rutieră','Pornire baterie','Transport auto'] },
  { cat:'🧼 Detailing & Estetică', items:['Spălare auto','Detailing interior','Detailing exterior','Polish','Protecție ceramică','Curățare tapițerie'] },
  { cat:'🛡️ Accesorii & Protecții', items:['Folii geamuri','PPF (protecție vopsea)','Montaj accesorii'] },
  { cat:'🔑 Chei & Închideri', items:['Chei auto','Programare chei','Reparații închideri'] },
  { cat:'🔥 Tuning & Performance', items:['Remap ECU','Stage 1','Stage 2','Tuning motor'] },
]
const ALL_SERVICES = SERVICE_CATEGORIES.flatMap(c=>c.items)
const ALL_BRANDS = [
  'Alfa Romeo','Aston Martin','Audi','BMW','Bentley','Bugatti','Buick',
  'Cadillac','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Daewoo',
  'Dodge','DS','Ferrari','Fiat','Ford','Genesis','GMC','Honda','Hummer',
  'Hyundai','Infiniti','Jaguar','Jeep','Kia','Lada','Lamborghini',
  'Land Rover','Lexus','Lincoln','Lotus','Maserati','Mazda','McLaren',
  'Mercedes-Benz','Mini','Mitsubishi','Nissan','Oldsmobile','Opel',
  'Peugeot','Pontiac','Porsche','Ram','Renault','Rolls-Royce','Saab',
  'Seat','Skoda','Smart','SsangYong','Subaru','Suzuki','Tesla','Toyota',
  'Volkswagen','Volvo','Zastava','Daihatsu','Isuzu','Acura','Infiniti',
]
const COUNTIES = ['Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila','Brașov','București','Buzău','Călărași','Caraș-Severin','Cluj','Constanța','Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara','Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt','Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea','Vâlcea','Vaslui','Vrancea']
const APT_STATUS = {in_asteptare:{label:'Așteptare',bg:S.amberBg,color:S.amber},confirmata:{label:'Confirmată',bg:'#dbeafe',color:S.blue},in_lucru:{label:'În lucru',bg:S.purpleBg,color:S.purple},finalizata:{label:'Finalizată',bg:S.greenBg,color:S.green},anulata:{label:'Anulată',bg:S.redBg,color:S.red}}


// ══ MapPicker Component — Click pe hartă = adresă automată ══
function MapPicker({ address, city, onAddressChange }) {
  const [search, setSearch] = useState(address || '')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [pinLat, setPinLat] = useState(null)
  const [pinLon, setPinLon] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const mapRef = React.useRef(null)
  const leafletMapRef = React.useRef(null)
  const markerRef = React.useRef(null)

  const S2 = { navy:'#0a1f44', blue:'#1a56db', bg:'#f0f6ff', white:'#fff', muted:'#6b7280', border:'#e5e7eb', green:'#16a34a' }

  // Load Leaflet
  React.useEffect(() => {
    if (typeof window === 'undefined' || leafletMapRef.current) return

    const linkEl = document.createElement('link')
    linkEl.rel = 'stylesheet'
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(linkEl)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)

    return () => {}
  }, [])

  function initMap() {
    if (!mapRef.current || leafletMapRef.current) return
    const L = window.L
    if (!L) return

    // Initial coordinates — Bucharest default
    const initLat = pinLat || 44.4268
    const initLon = pinLon || 26.1025

    const map = L.map(mapRef.current, { zoomControl: true }).setView([initLat, initLon], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map)

    // Custom pin icon
    const icon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#1a56db;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: ''
    })

    // If we already have address, geocode it first
    if (address && city) {
      geocodeAndCenter(address, city, map, icon)
    }

    // Click on map
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      setPinLat(lat)
      setPinLon(lng)

      // Place/move marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
        markerRef.current.on('dragend', async (ev) => {
          const pos = ev.target.getLatLng()
          await reverseGeocode(pos.lat, pos.lng)
        })
      }

      await reverseGeocode(lat, lng)
    })

    leafletMapRef.current = map
  }

  async function geocodeAndCenter(addr, cty, map, icon) {
    try {
      const q = encodeURIComponent(addr + ', ' + cty + ', Romania')
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, { headers: {'Accept-Language':'ro'} })
      const data = await res.json()
      if (data[0]) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        map.setView([lat, lon], 16)
        setPinLat(lat); setPinLon(lon)
        const L = window.L
        if (markerRef.current) markerRef.current.setLatLng([lat, lon])
        else {
          const ic = L.divIcon({ html:`<div style="width:32px;height:32px;background:#1a56db;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`, iconSize:[32,32], iconAnchor:[16,32], className:'' })
          markerRef.current = L.marker([lat, lon], { icon: ic, draggable: true }).addTo(map)
          markerRef.current.on('dragend', async (ev) => {
            const pos = ev.target.getLatLng()
            await reverseGeocode(pos.lat, pos.lng)
          })
        }
      }
    } catch(e) { console.error(e) }
  }

  async function reverseGeocode(lat, lon) {
    setLoading(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, { headers: {'Accept-Language':'ro'} })
      const data = await res.json()
      if (data && data.address) {
        const a = data.address
        const road = a.road || a.pedestrian || a.footway || ''
        const nr = a.house_number || ''
        const streetAddr = [road, nr].filter(Boolean).join(' ')
        const cityName = a.city || a.town || a.village || a.municipality || a.county || city || ''
        setSearch(streetAddr)
        onAddressChange(streetAddr, cityName)
      }
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  async function searchAddress() {
    if (!search.trim()) return
    setSearching(true)
    setResults([])
    try {
      const q = encodeURIComponent(search + ', ' + (city||'') + ', Romania')
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&addressdetails=1`, { headers:{'Accept-Language':'ro'} })
      const data = await res.json()
      setResults(data||[])
    } catch(e) { console.error(e) }
    setSearching(false)
  }

  function selectResult(r) {
    const lat = parseFloat(r.lat)
    const lon = parseFloat(r.lon)
    const a = r.address || {}
    const road = a.road || a.pedestrian || ''
    const nr = a.house_number || ''
    const streetAddr = [road, nr].filter(Boolean).join(' ') || r.display_name.split(',')[0]
    const cityName = a.city || a.town || a.village || city || ''

    setSearch(streetAddr)
    setPinLat(lat); setPinLon(lon)
    setResults([])
    onAddressChange(streetAddr, cityName)

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lon], 17)
      const L = window.L
      const icon = L.divIcon({ html:`<div style="width:32px;height:32px;background:#1a56db;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`, iconSize:[32,32], iconAnchor:[16,32], className:'' })
      if (markerRef.current) markerRef.current.setLatLng([lat, lon])
      else {
        markerRef.current = L.marker([lat, lon], { icon, draggable: true }).addTo(leafletMapRef.current)
        markerRef.current.on('dragend', async (ev) => {
          const pos = ev.target.getLatLng()
          await reverseGeocode(pos.lat, pos.lng)
        })
      }
    }
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }



  return (
    <div>
      {/* Search */}
      <div style={{ display:'flex', gap:8, marginBottom:8, position:'relative' }}>
        <div style={{ flex:1, position:'relative' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&searchAddress()}
            placeholder="Caută adresa sau dă click direct pe hartă..."
            style={{ width:'100%', padding:'10px 14px', border:`1.5px solid ${S2.border}`, borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' }}/>
          {results.length>0&&(
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:S2.white, border:`1px solid ${S2.border}`, borderRadius:10, zIndex:9999, boxShadow:'0 4px 20px rgba(10,31,68,0.15)', maxHeight:220, overflowY:'auto', marginTop:4 }}>
              {results.map((r,i)=>(
                <div key={i} onClick={()=>selectResult(r)}
                  style={{ padding:'10px 14px', cursor:'pointer', fontSize:12, color:S2.navy, borderBottom:i<results.length-1?`1px solid ${S2.border}`:'none', lineHeight:1.5 }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f0f6ff'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  📍 {r.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={searchAddress} disabled={searching}
          style={{ padding:'10px 18px', background:S2.blue, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0, opacity:searching?.6:1 }}>
          {searching?'...':'🔍 Caută'}
        </button>
      </div>

      {/* Hint */}
      <div style={{ fontSize:12, color:S2.muted, marginBottom:8, display:'flex', alignItems:'center', gap:4 }}>
        👆 Dă click pe hartă pentru a plasa pinul · Pinul se poate trage
        {loading&&<span style={{ marginLeft:8, color:S2.blue }}>Se detectează adresa...</span>}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height:280, borderRadius:14, overflow:'hidden', border:`1.5px solid ${S2.border}`, marginBottom:10 }}/>

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <button onClick={handleSave}
          style={{ padding:'9px 20px', background:saved?S2.green:S2.blue, color:'#fff', border:'none', borderRadius:50, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'background .2s' }}>
          {saved?'✅ Locație confirmată!':'📍 Confirmă locația'}
        </button>
        {pinLat&&pinLon&&(
          <a href={`https://maps.google.com/maps?q=${pinLat},${pinLon}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:12, color:S2.blue, textDecoration:'none', fontWeight:600 }}>
            🗺️ Deschide în Google Maps →
          </a>
        )}
        {search&&<div style={{ fontSize:12, color:S2.muted, background:S2.bg, borderRadius:8, padding:'6px 12px', flex:1 }}>📍 {search}</div>}
      </div>
    </div>
  )
}

export default function ServiceDashboard() {
  const [tab, setTab] = useState('Acasă')
  const [service, setService] = useState(null)
  const [requests, setRequests] = useState([])
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])
  const [offers, setOffers] = useState([])
  const [offerings, setOfferings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReq, setSelectedReq] = useState(null)
  const [offerForm, setOfferForm] = useState({price_total:'',price_parts:'',price_labor:'',description:'',available_date:'',available_time:'09:00-12:00',warranty_months:'6'})
  const [offerSent, setOfferSent] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())
  const [aptStatuses, setAptStatuses] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [newOffering, setNewOffering] = useState({name:'',price_from:'',price_to:'',duration_min:'',description:''})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddApt, setShowAddApt] = useState(false)
  const [newApt, setNewApt] = useState({client_name:'',car_info:'',scheduled_date:'',scheduled_time:'',duration_min:'60',work_description:'',notes:''})
  const [addingApt, setAddingApt] = useState(false)
  const [pf, setPf] = useState({name:'',description:'',phone:'',email:'',website:'',facebook_url:'',address:'',city:'',county:'',postal_code:'',brands_accepted:[],fuel_types:[],min_year_accepted:'',is_authorized_rar:false,has_itp:false,warranty_months:'0',is_multibrand:true,is_dismantling:false,opening_hours:{Lu:'08:00-18:00',Ma:'08:00-18:00',Mi:'08:00-18:00',Jo:'08:00-18:00',Vi:'08:00-18:00',Sâ:'09:00-14:00',Du:'Închis'}})
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // Sync tab from URL query param (reads ?tab= on mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const t = params.get('tab')
      if (t) setTab(t)
    }
  }, [])

  // Listen for mobile hamburger from GlobalLayout bottom nav
  useEffect(() => {
    const handler = () => setSidebarOpen(o => !o)
    window.addEventListener('dash-open-sidebar', handler)
    return () => window.removeEventListener('dash-open-sidebar', handler)
  }, [])

  async function addManualAppointment() {
    if (!newApt.scheduled_date||!newApt.scheduled_time) return
    setAddingApt(true)
    const {data,error} = await supabase.from('appointments').insert({
      service_id:service.id,
      scheduled_date:newApt.scheduled_date,
      scheduled_time:newApt.scheduled_time,
      duration_min:newApt.duration_min?parseInt(newApt.duration_min):null,
      client_name:newApt.client_name||null,
      car_info:newApt.car_info||null,
      work_description:newApt.work_description||null,
      notes:newApt.notes||null,
      status:'confirmata',
    }).select().single()
    if (!error&&data) {
      setAppointments(prev=>[...prev,data].sort((a,b)=>a.scheduled_date.localeCompare(b.scheduled_date)))
      setAptStatuses(prev=>({...prev,[data.id]:'confirmata'}))
      setNewApt({client_name:'',car_info:'',scheduled_date:'',scheduled_time:'',duration_min:'60',work_description:'',notes:''})
      setShowAddApt(false)
    }
    setAddingApt(false)
  }
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      // Verifică rolul — doar service_owner poate accesa dashboard-ul
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof?.role === 'user') { window.location.href = '/home'; return }
      let { data: svc } = await supabase.from('services').select('*').eq('owner_id', user.id).single()
      if (!svc) {
        // Creează service doar dacă userul are rol de service_owner
        const { data: newSvc } = await supabase.from('services').insert({owner_id:user.id,name:prof?.full_name||'Service-ul meu',city:prof?.city||'București',is_active:true,plan:'free'}).select().single()
        svc = newSvc
      }
      setService(svc)
      if (svc) {
        setPf(p => ({...p,name:svc.name||'',description:svc.description||'',phone:svc.phone||'',email:svc.email||'',website:svc.website||'',facebook_url:svc.facebook_url||'',address:svc.address||'',city:svc.city||'',county:svc.county||'',postal_code:svc.postal_code||'',brands_accepted:svc.brands_accepted||[],fuel_types:svc.fuel_types||[],is_authorized_rar:svc.is_authorized_rar||false,has_itp:svc.has_itp||false,warranty_months:svc.warranty_months?.toString()||'0',is_multibrand:svc.is_multibrand!==false,is_dismantling:svc.is_dismantling||false}))
        const [reqs,apts,revs,offs,offrs] = await Promise.all([
          supabase.from('quote_requests').select('*').eq('status','activa').order('created_at',{ascending:false}).limit(50),
          supabase.from('appointments').select('*').eq('service_id',svc.id).order('scheduled_date',{ascending:true}),
          supabase.from('reviews').select('*').eq('service_id',svc.id).order('created_at',{ascending:false}),
          supabase.from('offers').select('*').eq('service_id',svc.id).order('created_at',{ascending:false}),
          supabase.from('service_offerings').select('*').eq('service_id',svc.id),
        ])
        const allReqs = reqs.data||[]
        // Show requests targeted to this service OR from same city
        const filteredReqs = allReqs.filter(r => 
          r.target_service_id === svc.id || 
          (r.city||'').toLowerCase().trim() === (svc.city||'').toLowerCase().trim() ||
          (!r.target_service_id && !r.city)
        )
        setRequests(filteredReqs)
        setAppointments(apts.data||[])
        const sm={}; (apts.data||[]).forEach(a=>sm[a.id]=a.status); setAptStatuses(sm)
        setReviews(revs.data||[])
        setOffers(offs.data||[])
        setOfferings(offrs.error ? [] : (offrs.data||[]))
        if (offrs.error) console.warn('service_offerings table missing - run SQL fix:', offrs.error.message)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile() {
    if (!service) return
    setProfileSaving(true)
    await supabase.from('services').update({name:pf.name,description:pf.description,phone:pf.phone,email:pf.email,website:pf.website,facebook_url:pf.facebook_url,address:pf.address,city:pf.city,county:pf.county,postal_code:pf.postal_code,brands_accepted:pf.brands_accepted.length?pf.brands_accepted:null,fuel_types:pf.fuel_types.length?pf.fuel_types:null,min_year_accepted:pf.min_year_accepted?parseInt(pf.min_year_accepted):null,is_authorized_rar:pf.is_authorized_rar,has_itp:pf.has_itp,warranty_months:parseInt(pf.warranty_months)||0,is_multibrand:pf.is_multibrand,is_dismantling:pf.is_dismantling,is_active:true}).eq('id',service.id)
    setProfileSaving(false); setProfileSaved(true)
    setTimeout(()=>setProfileSaved(false),2500)
  }

  async function sendOffer() {
    if (!service||!selectedReq) return
    const {data} = await supabase.from('offers').insert({request_id:selectedReq.id,service_id:service.id,price_total:offerForm.price_total?parseFloat(offerForm.price_total):null,price_parts:offerForm.price_parts?parseFloat(offerForm.price_parts):null,price_labor:offerForm.price_labor?parseFloat(offerForm.price_labor):null,description:offerForm.description,available_date:offerForm.available_date||null,available_time:offerForm.available_time,warranty_months:parseInt(offerForm.warranty_months),status:'trimisa'}).select().single()
    setOfferSent(true)
    // Add to offers list immediately
    if (data) setOffers(prev=>[data,...prev])
    setRequests(prev=>prev.filter(r=>r.id!==selectedReq.id))
    setTimeout(()=>{setSelectedReq(null);setOfferSent(false);setOfferForm({price_total:'',price_parts:'',price_labor:'',description:'',available_date:'',available_time:'09:00-12:00',warranty_months:'6'})},1800)
  }

  async function updateAptStatus(id, status) {
    await supabase.from('appointments').update({status}).eq('id',id)
    setAptStatuses(p=>({...p,[id]:status}))
  }

  async function sendReply(reviewId) {
    await supabase.from('reviews').update({reply_text:replyText,reply_at:new Date().toISOString()}).eq('id',reviewId)
    setReviews(prev=>prev.map(r=>r.id===reviewId?{...r,reply_text:replyText}:r))
    setReplyingTo(null); setReplyText('')
  }

  async function addOffering() {
    if (!service||!newOffering.name) return
    const {data, error} = await supabase.from('service_offerings').insert({
      name: newOffering.name,
      description: newOffering.description,
      price_from: newOffering.price_from ? parseFloat(newOffering.price_from) : null,
      price_to: newOffering.price_to ? parseFloat(newOffering.price_to) : null,
      duration_min: newOffering.duration_min ? parseInt(newOffering.duration_min) : null,
      service_id: service.id,
      is_active: true
    }).select().single()
    if (error) { alert('Eroare: ' + error.message + '\nRuleaza SQL-ul din service_offerings_fix.sql in Supabase!'); return }
    if (data) setOfferings(prev=>[data,...prev])
    setNewOffering({name:'',price_from:'',price_to:'',duration_min:'',description:''})
  }

  async function addWholeCategory(catItems) {
    if (!service) return
    const existing = offerings.map(o=>o.name)
    const toAdd = catItems.filter(s=>!existing.includes(s))
    if (toAdd.length===0) {
      alert('Toate serviciile din această categorie sunt deja adăugate.')
      return
    }
    const inserts = toAdd.map(name=>({name, service_id:service.id, is_active:true}))
    const {data, error} = await supabase.from('service_offerings').insert(inserts).select()
    if (error) { alert('Eroare: ' + error.message); return }
    if (data) setOfferings(prev=>[...data,...prev])
  }

  async function deleteOffering(id) {
    await supabase.from('service_offerings').delete().eq('id',id)
    setOfferings(prev=>prev.filter(o=>o.id!==id))
  }

  const TABS = [
    {name:'Acasă',badge:null},
    {name:'Profil public',badge:(!pf.description||!pf.phone||!pf.address)?'!':null},
    {name:'Servicii oferite',badge:offerings.length||null},
    {name:'Cereri',badge:requests.length||null},
    {name:'Programări',badge:appointments.filter(a=>['in_asteptare','confirmata','in_lucru'].includes(aptStatuses[a.id]||a.status)).length||null},
    {name:'Oferte trimise',badge:offers.filter(o=>o.status==='trimisa').length||null},
    {name:'Anunțuri',badge:null},
    {name:'Recenzii',badge:reviews.length||null},
    {name:'Setări',badge:null},
  ]

  const firstDay = (() => { const d=new Date(calMonth.getFullYear(),calMonth.getMonth(),1).getDay(); return d===0?6:d-1 })()
  const daysInMonth = new Date(calMonth.getFullYear(),calMonth.getMonth()+1,0).getDate()
  const aptsForDay = (day) => { const ds=`${calMonth.getFullYear()}-${String(calMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; return appointments.filter(a=>a.scheduled_date===ds) }



  return (
    <div style={{minHeight:'100vh',background:S.bg,fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column'}}>
      {loading&&(
        <div style={{position:'fixed',inset:0,background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{textAlign:'center'}}>
            <div style={{width:40,height:40,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
            <div style={{color:S.muted,fontSize:14}}>Se încarcă...</div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .dash-input:focus{border-color:${S.blue}!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}
        .tab-btn:hover{background:rgba(255,255,255,0.08)!important;color:#fff!important}
        .tab-btn.active{background:rgba(26,86,219,0.25)!important;color:#fff!important}
        .nav-link:hover{color:${S.navy}!important}
        .card-hover:hover{border-color:${S.blueLight}!important;box-shadow:0 4px 20px rgba(26,86,219,0.1)!important}
        .apt-btn:hover{border-color:${S.blue}!important;color:${S.blue}!important}
        @media(max-width:768px){
          .dash-sidebar{transform:translateX(-100%);position:fixed!important;z-index:200!important;height:100vh!important;top:0!important;width:260px!important;transition:transform .25s ease!important}
          .dash-sidebar.open{transform:translateX(0)!important}
          .dash-overlay{display:block!important}
          .dash-main{padding:14px 12px!important;padding-bottom:92px!important}
          .dash-hamburger{display:none!important}
          .dash-hero{padding:16px!important;border-radius:14px!important}
          .dash-hero h1{font-size:18px!important}
          .dash-stats{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
          .dash-stat{padding:12px!important}
          .dash-stat-val{font-size:20px!important}
          .dash-card{padding:14px!important}
          .dash-grid-2{grid-template-columns:1fr!important}
          .dash-grid-3{grid-template-columns:1fr!important}
          .profile-grid{grid-template-columns:1fr!important}
          .offering-row{flex-direction:column!important}
          .settings-plans{grid-template-columns:1fr!important}
          .map-picker-row{flex-direction:column!important}
          .program-row{flex-direction:column!important;gap:6px!important}
          .request-row{flex-direction:column!important;gap:8px!important}
          .appointment-row{flex-direction:column!important;gap:8px!important}
          .offer-actions{flex-direction:column!important;gap:6px!important}
          .review-row{flex-direction:column!important;gap:8px!important}
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important}
          .req-modal-overlay{display:flex!important}
        }
        @media(max-width:480px){
          .dash-stats{grid-template-columns:1fr 1fr!important}
          .dash-hero-btns{flex-direction:column!important;gap:8px!important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{background:S.navy,height:56,display:'flex',alignItems:'center',padding:'0 24px',position:'sticky',top:0,zIndex:100,gap:12}}>
        <button onClick={()=>setSidebarOpen(o=>!o)} className="dash-hamburger" style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
          {[0,1,2].map(i=><span key={i} style={{display:'block',width:18,height:2,background:'rgba(255,255,255,0.7)',borderRadius:2}}/>)}
        </button>
        <a href="/home" style={{display:'flex',alignItems:'center',gap:7,textDecoration:'none',flexShrink:0}}>
          <div style={{width:28,height:28,background:S.blue,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'#fff',fontFamily:"'Sora',sans-serif"}}>R</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:'#fff'}}>Reparo</span>
        </a>
        <div style={{width:1,height:20,background:'rgba(255,255,255,0.15)'}}/>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontFamily:"'Sora',sans-serif",fontWeight:600,letterSpacing:0.5}}>DASHBOARD SERVICE</span>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:12}}>
          {service?.id && <a href={`/service/${service.id}`} target="_blank" style={{fontSize:12,color:'rgba(255,255,255,0.5)',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>👁️ <span style={{display:'none'}}>Profil public</span></a>}
          <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/home'}} style={{fontSize:12,color:'rgba(255,255,255,0.4)',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Ieși</button>
        </div>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden',position:'relative'}}>

        {/* SIDEBAR — Dark Navy */}
        <aside className={`dash-sidebar${sidebarOpen?' open':''}`}
          style={{width:220,background:'#0a1f44',display:'flex',flexDirection:'column',flexShrink:0,transition:'transform .25s',overflow:'hidden auto'}}>
          
          {/* Service info */}
          <div style={{padding:'20px 16px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{width:44,height:44,background:'rgba(26,86,219,0.3)',border:'1.5px solid rgba(26,86,219,0.5)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:12}}>🔧</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,fontFamily:"'Sora',sans-serif",marginBottom:4}}>Service</div>
            <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:"'Sora',sans-serif",marginBottom:2}}>{service?.name||'—'}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',marginBottom:10}}>{service?.city}</div>
            <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:50,background:service?.plan==='pro'?'rgba(245,158,11,0.2)':'rgba(255,255,255,0.08)',color:service?.plan==='pro'?S.yellow:'rgba(255,255,255,0.45)',fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>
              {service?.plan==='pro'?'⭐ Pro':'🔓 Free'}
            </span>
          </div>

          {/* Nav */}
          <nav style={{padding:'10px 10px',flex:1}}>
            {TABS.map(t=>(
              <button key={t.name}
                onClick={()=>{setTab(t.name);setSidebarOpen(false)}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,transition:'all .15s',
                  background:tab===t.name?'rgba(26,86,219,0.25)':'transparent',
                  color:tab===t.name?'#fff':'rgba(255,255,255,0.5)',
                  fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:tab===t.name?600:400,
                  borderRight:tab===t.name?`2px solid ${S.blue}`:'2px solid transparent'}}>
                <span style={{fontSize:15}}>{t.icon}</span>
                <span style={{flex:1,textAlign:'left'}}>{t.name}</span>
                {t.badge&&<span style={{background:tab===t.name?S.blue:'rgba(255,255,255,0.15)',color:'#fff',borderRadius:50,padding:'2px 7px',fontSize:10,fontWeight:700}}>{t.badge}</span>}
              </button>
            ))}
          </nav>

          <div style={{padding:'10px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <a href="/home" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:10,color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>🏠 Înapoi la site</a>
          </div>
        </aside>

        {/* Overlay mobile */}
        {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(10,31,68,0.4)',zIndex:199}} className="dash-overlay"/>}

        {/* MAIN */}
        <main className="dash-main" style={{flex:1,overflowY:'auto',padding:'24px',minWidth:0}}>

          {/* ══ ACASĂ ══ */}
          {tab==='Acasă'&&(
            <div>
              {/* Hero gradient card */}
              <div style={{background:'linear-gradient(135deg,#1a56db 0%,#0a1f44 100%)',borderRadius:20,padding:'24px 28px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none'}}/>
                <div style={{position:'absolute',bottom:-60,right:60,width:240,height:240,borderRadius:'50%',background:'rgba(255,255,255,0.03)',pointerEvents:'none'}}/>
                <div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:"'Sora',sans-serif"}}>
                    {new Date().toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                  </div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:'#fff',marginBottom:6}}>Bună ziua, {service?.name}! 👋</h1>
                  <p style={{color:'rgba(255,255,255,0.55)',fontSize:13}}>
                    {requests.length > 0 ? `Ai ${requests.length} cereri noi care te așteaptă.` : 'Profilul tău este activ și vizibil în căutări.'}
                  </p>
                </div>
                <div style={{display:'flex',gap:10,flexShrink:0}}>
                  <button onClick={()=>setTab('Cereri')}
                    style={{background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.2)',borderRadius:50,padding:'9px 18px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",backdropFilter:'blur(4px)'}}>
                    📋 Cereri noi
                  </button>
                  <button onClick={()=>setTab('Profil public')}
                    style={{background:S.yellow,color:'#fff',border:'none',borderRadius:50,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(245,158,11,0.35)'}}>
                    ✦ Promovare
                  </button>
                </div>
              </div>

              {(!pf.description||!pf.phone||!pf.address)&&(
                <div style={{background:S.amberBg,border:`1px solid ${S.amber}40`,borderRadius:14,padding:16,marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:24}}>⚠️</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:S.amber,fontSize:14,fontFamily:"'Sora',sans-serif",marginBottom:3}}>Profilul tău e incomplet</div>
                    <div style={{color:S.amber,fontSize:13,opacity:.8}}>Adaugă descriere, telefon și adresă pentru a apărea în căutări.</div>
                  </div>
                  <button onClick={()=>setTab('Profil public')} style={{...btn('primary'),background:S.amber,boxShadow:'none',flexShrink:0}}>Completează →</button>
                </div>
              )}

              {/* Stats */}
              <div className="dash-stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                {[
                  {label:'Cereri noi',value:requests.length,icon:'📋',accent:S.blue,accentBg:'#eaf3ff',tab:'Cereri'},
                  {label:'Programări azi',value:appointments.filter(a=>a.scheduled_date===today).length,icon:'📅',accent:S.green,accentBg:S.greenBg,tab:'Programări'},
                  {label:'Oferte active',value:offers.filter(o=>o.status==='trimisa').length,icon:'💬',accent:S.purple,accentBg:S.purpleBg,tab:'Oferte trimise'},
                  {label:'Rating',value:service?.rating_avg>0?service.rating_avg.toFixed(1):null,icon:'⭐',accent:S.amber,accentBg:S.amberBg,tab:'Recenzii'},
                ].map(s=>(
                  <button key={s.label} onClick={()=>setTab(s.tab)}
                    style={{background:S.white,borderRadius:16,padding:'16px',border:`1px solid ${S.border}`,cursor:'pointer',textAlign:'left',transition:'all .15s',boxShadow:'0 2px 8px rgba(10,31,68,0.04)'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=s.accent;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 4px 16px rgba(10,31,68,0.1)`}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=S.border;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 8px rgba(10,31,68,0.04)'}}>
                    <div style={{width:36,height:36,background:s.accentBg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,marginBottom:12}}>{s.icon}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:s.value!==null&&s.value!==undefined?s.accent:'#d97706',marginBottom:2}}>
                      {s.value!==null&&s.value!==undefined?s.value:'Nou'}
                    </div>
                    <div style={{fontSize:11,color:S.muted,textTransform:'uppercase',letterSpacing:0.5}}>{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Cereri recente */}
              <div style={card({marginBottom:16})}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>Cereri noi în {service?.city}</h2>
                  <button onClick={()=>setTab('Cereri')} style={{...btn('ghost'),padding:'6px 12px',fontSize:12}}>Vezi toate →</button>
                </div>
                {requests.length===0?<div style={{textAlign:'center',padding:'20px 0',color:S.muted,fontSize:14}}>Nicio cerere activă momentan.</div>:
                  requests.slice(0,3).map(r=>(
                    <div key={r.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:S.bg,borderRadius:12,marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:S.navy,marginBottom:2}}>{r.car_brand} {r.car_model} {r.car_year?`· ${r.car_year}`:''}</div>
                        <div style={{fontSize:12,color:S.muted}}>{r.services?.join(', ')}</div>
                      </div>
                      <button onClick={()=>{setSelectedReq(r);setTab('Cereri')}} style={{...btn('primary'),padding:'7px 14px',fontSize:12}}>Trimite ofertă</button>
                    </div>
                  ))
                }
              </div>

              {/* Programari azi */}
              <div style={card()}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>Programări azi</h2>
                  <button onClick={()=>setTab('Programări')} style={{...btn('ghost'),padding:'6px 12px',fontSize:12}}>Calendar →</button>
                </div>
                {appointments.filter(a=>a.scheduled_date===today).length===0?<div style={{textAlign:'center',padding:'20px 0',color:S.muted,fontSize:14}}>Nicio programare astăzi.</div>:
                  appointments.filter(a=>a.scheduled_date===today).map(a=>(
                    <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:S.bg,borderRadius:12,marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:S.navy}}>{a.scheduled_time}</div>
                        <div style={{fontSize:12,color:S.muted}}>{a.notes||'Programare'}</div>
                      </div>
                      <span style={pill((APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).bg,(APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).color,'')}>{(APT_STATUS[aptStatuses[a.id]||a.status]||APT_STATUS.in_asteptare).label}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ══ PROFIL PUBLIC ══ */}
          {tab==='Profil public'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>Profilul public</h1>
                  <p style={{color:S.muted,fontSize:13}}>Aceste informații apar pe pagina ta publică și în căutări.</p>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {service?.id&&<a href={`/service/${service.id}`} target="_blank" style={{...btn('ghost'),textDecoration:'none',fontSize:12}}>👁️ Previzualizează</a>}
                  <button onClick={saveProfile} disabled={profileSaving}
                    style={{...btn('primary'),background:profileSaved?S.green:S.blue,opacity:profileSaving?.6:1}}>
                    {profileSaved?'✅ Salvat!':profileSaving?'Se salvează...':'Salvează profilul'}
                  </button>
                </div>
              </div>

              {/* Logo & Cover Upload */}
              <div style={{...card({marginBottom:16,gridColumn:'1/-1'})}}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>📸 Fotografii profil</h3>
                <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:16,alignItems:'start'}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontFamily:"'Sora',sans-serif"}}>Logo</div>
                    <div onClick={()=>document.getElementById('logo-upload').click()}
                      style={{width:120,height:120,background:service?.logo_url?'transparent':'#eaf3ff',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',border:`2px dashed ${S.border}`}}>
                      {service?.logo_url?<img src={service.logo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{textAlign:'center',color:S.muted}}><div style={{fontSize:32,marginBottom:4}}>🔧</div><div style={{fontSize:10}}>Click pentru logo</div></div>}
                    </div>
                    <input id="logo-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
                      const file=e.target.files?.[0]; if(!file||!service) return
                      const path=`${service.id}/logo-${Date.now()}.${file.name.split('.').pop()}`
                      const {error}=await supabase.storage.from('service-media').upload(path,file,{upsert:true})
                      if(!error){const {data:{publicUrl}}=supabase.storage.from('service-media').getPublicUrl(path);await supabase.from('services').update({logo_url:publicUrl}).eq('id',service.id);setService(p=>({...p,logo_url:publicUrl}))}
                    }}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontFamily:"'Sora',sans-serif"}}>Banner / Cover</div>
                    <div onClick={()=>document.getElementById('cover-upload').click()}
                      style={{width:'100%',height:120,background:service?.cover_image_url?'transparent':'#eaf3ff',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',border:`2px dashed ${S.border}`}}>
                      {service?.cover_image_url?<img src={service.cover_image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{textAlign:'center',color:S.muted}}><div style={{fontSize:28,marginBottom:4}}>🖼️</div><div style={{fontSize:11}}>Click pentru banner</div><div style={{fontSize:10,marginTop:2}}>Recomandat: 1200×400px</div></div>}
                    </div>
                    <input id="cover-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
                      const file=e.target.files?.[0]; if(!file||!service) return
                      const path=`${service.id}/cover-${Date.now()}.${file.name.split('.').pop()}`
                      const {error}=await supabase.storage.from('service-media').upload(path,file,{upsert:true})
                      if(!error){const {data:{publicUrl}}=supabase.storage.from('service-media').getPublicUrl(path);await supabase.from('services').update({cover_image_url:publicUrl}).eq('id',service.id);setService(p=>({...p,cover_image_url:publicUrl}))}
                    }}/>
                  </div>
                </div>
              </div>

              <div className="profile-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {/* Informatii baza */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>📋 Informații de bază</h3>
                  {[{k:'name',l:'Numele service-ului *',p:'AutoPro Service SRL',t:'text'},{k:'phone',l:'Telefon *',p:'07xx xxx xxx',t:'tel'},{k:'email',l:'Email contact',p:'contact@service.ro',t:'email'},{k:'website',l:'Website',p:'https://...',t:'url'},{k:'facebook_url',l:'Pagină Facebook',p:'https://facebook.com/...',t:'url'}].map(f=>(
                    <div key={f.k} style={{marginBottom:12}}>
                      <label style={label}>{f.l}</label>
                      <input className="dash-input" type={f.t} value={pf[f.k]} onChange={e=>setPf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={input}/>
                    </div>
                  ))}
                  <div style={{marginBottom:12}}>
                    <label style={label}>Descriere service *</label>
                    <textarea className="dash-input" value={pf.description} onChange={e=>setPf(p=>({...p,description:e.target.value}))} rows={4} placeholder="Descrie service-ul tău: specializări, echipamente, experiență..."
                      style={{...input,resize:'none'}}/>
                  </div>
                </div>

                {/* Locatie */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>📍 Locație</h3>
                  <div style={{marginBottom:12}}>
                    <label style={label}>Adresa completă *</label>
                    <input className="dash-input" value={pf.address} onChange={e=>setPf(p=>({...p,address:e.target.value}))} placeholder="Str. Exemplu nr. 10" style={input}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                    <div>
                      <label style={label}>Oraș *</label>
                      <input className="dash-input" value={pf.city} onChange={e=>setPf(p=>({...p,city:e.target.value}))} placeholder="București" style={input}/>
                    </div>
                    <div>
                      <label style={label}>Județ</label>
                      <select className="dash-input" value={pf.county} onChange={e=>setPf(p=>({...p,county:e.target.value}))} style={input}>
                        <option value="">Selectează</option>
                        {COUNTIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Hartă interactivă cu search */}
                  <div>
                    <label style={label}>Hartă & locație</label>
                    <MapPicker
                      address={pf.address}
                      city={pf.city}
                      onAddressChange={(addr, city) => setPf(p => ({...p, address: addr, city: city||p.city}))}
                    />
                  </div>

                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,margin:'20px 0 12px'}}>🕐 Program lucru</h3>
                  {Object.entries(pf.opening_hours).map(([day,hours])=>(
                    <div key={day} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:S.navy,width:24,fontFamily:"'Sora',sans-serif"}}>{day}</span>
                      <input className="dash-input" value={hours} onChange={e=>setPf(p=>({...p,opening_hours:{...p.opening_hours,[day]:e.target.value}}))} placeholder="08:00-18:00 sau Închis" style={{...input,padding:'8px 12px',fontSize:12}}/>
                    </div>
                  ))}
                </div>

                {/* Specializari */}
                <div style={{...card(),gridColumn:'1/-1'}}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>🚗 Specializări & certificări</h3>

                  {/* Tip service */}
                  <div style={{marginBottom:20}}>
                    <label style={label}>Tip service</label>
                    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                      {[{val:true,icon:'🌐',label:'Multimarcă',desc:'Repară orice marcă'},{val:false,icon:'🎯',label:'Unimarcă',desc:'Mărci specifice'}].map(opt=>(
                        <button key={String(opt.val)} onClick={()=>setPf(p=>({...p,is_multibrand:opt.val,brands_accepted:opt.val?[]:p.brands_accepted}))}
                          style={{flex:1,padding:'14px 16px',borderRadius:14,border:`2px solid ${pf.is_multibrand===opt.val?S.blue:S.border}`,background:pf.is_multibrand===opt.val?'#eaf3ff':S.white,cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                          <div style={{fontSize:20,marginBottom:4}}>{opt.icon}</div>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:pf.is_multibrand===opt.val?S.blue:S.navy,marginBottom:2}}>{opt.label}</div>
                          <div style={{fontSize:11,color:S.muted}}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parc dezmembrari */}
                  <div style={{marginBottom:20}}>
                    <label style={label}>Tip unitate</label>
                    <button onClick={()=>setPf(p=>({...p,is_dismantling:!p.is_dismantling}))}
                      style={{display:'flex',alignItems:'center',gap:14,width:'100%',padding:'16px',borderRadius:14,border:`2px solid ${pf.is_dismantling?'#d97706':S.border}`,background:pf.is_dismantling?'#fef3c7':S.white,cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                      <div style={{width:48,height:48,background:pf.is_dismantling?'#fef3c7':'#f0f0f0',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🔩</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:pf.is_dismantling?'#d97706':S.navy,marginBottom:2}}>
                          {pf.is_dismantling ? '✅ Parc dezmembrări activ' : 'Activează Parc dezmembrări'}
                        </div>
                        <div style={{fontSize:12,color:S.muted}}>Poți adăuga piese dezmembrate și vehicule pentru dezmembrare</div>
                      </div>
                      <div style={{width:44,height:24,borderRadius:12,background:pf.is_dismantling?'#d97706':'#e5e7eb',position:'relative',transition:'background .2s',flexShrink:0}}>
                        <div style={{position:'absolute',top:2,left:pf.is_dismantling?20:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
                      </div>
                    </button>
                    {pf.is_dismantling&&(
                      <div style={{marginTop:8,padding:'12px 14px',background:'#fef3c7',borderRadius:10,border:'1px solid #d9770620',fontSize:12,color:'#92400e'}}>
                        <div style={{marginBottom:8}}>🔩 Ca parc dezmembrări, poți adăuga piese și vehicule în secțiunea <strong>Anunțuri</strong>. Profilul tău va apărea în categoria Dezmembrări.</div>
                        <a href="/dezmembrari-abonamente" target="_blank"
                          style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',background:'#d97706',color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif"}}>
                          📦 Vezi abonamente speciale pentru dezmembrări →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Mărci acceptate — afișat întotdeauna, cu buton Toate mai proeminent */}
                  <div style={{marginBottom:20}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                      <label style={label}>
                        {pf.is_multibrand ? 'Mărci acceptate (toate implicit)' : 'Mărci specializate *'}
                      </label>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>setPf(p=>({...p,brands_accepted:[]}))}
                          style={{padding:'4px 12px',borderRadius:50,border:`1.5px solid ${pf.brands_accepted.length===0?S.blue:S.border}`,background:pf.brands_accepted.length===0?S.blue:'#fff',color:pf.brands_accepted.length===0?'#fff':S.muted,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                          ✓ Toate
                        </button>
                        <button onClick={()=>setPf(p=>({...p,brands_accepted:[...ALL_BRANDS]}))}
                          style={{padding:'4px 12px',borderRadius:50,border:`1.5px solid ${S.border}`,background:'#fff',color:S.muted,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                          Selectează toate
                        </button>
                      </div>
                    </div>
                    <div style={{border:`1px solid ${S.border}`,borderRadius:12,padding:12,background:S.bg,maxHeight:160,overflowY:'auto',display:'flex',flexWrap:'wrap',gap:6}}>
                      {ALL_BRANDS.map(brand=>(
                        <button key={brand} onClick={()=>setPf(p=>({...p,brands_accepted:p.brands_accepted.includes(brand)?p.brands_accepted.filter(b=>b!==brand):[...p.brands_accepted,brand]}))}
                          style={{padding:'5px 12px',borderRadius:50,border:`1.5px solid ${pf.brands_accepted.includes(brand)?S.blue:S.border}`,background:pf.brands_accepted.includes(brand)?'#eaf3ff':'#fff',color:pf.brands_accepted.includes(brand)?S.blue:S.muted,fontSize:11,fontWeight:pf.brands_accepted.includes(brand)?700:400,cursor:'pointer',transition:'all .1s'}}>
                          {brand}
                        </button>
                      ))}
                    </div>
                    {pf.brands_accepted.length>0&&(
                      <div style={{fontSize:12,color:S.blue,marginTop:6,fontWeight:600}}>
                        {pf.brands_accepted.length} mărci selectate
                      </div>
                    )}
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
                    {/* Combustibil */}
                    <div>
                      <label style={label}>Combustibil acceptat</label>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {[['Benzină','⛽'],['Diesel','🛢️'],['Hybrid','🔋'],['Electric','⚡'],['GPL','🟢']].map(([f,icon])=>(
                          <button key={f} onClick={()=>setPf(p=>({...p,fuel_types:p.fuel_types.includes(f)?p.fuel_types.filter(x=>x!==f):[...p.fuel_types,f]}))}
                            style={{padding:'7px 14px',borderRadius:50,border:`1.5px solid ${pf.fuel_types.includes(f)?S.blue:S.border}`,background:pf.fuel_types.includes(f)?'#eaf3ff':S.white,color:pf.fuel_types.includes(f)?S.blue:S.muted,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s',display:'flex',alignItems:'center',gap:4}}>
                            {icon} {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Garantie + An minim */}
                    <div>
                      <label style={label}>Garanție lucrări</label>
                      <select className="dash-input" value={pf.warranty_months} onChange={e=>setPf(p=>({...p,warranty_months:e.target.value}))} style={input}>
                        {['0','3','6','12','24','36'].map(m=><option key={m} value={m}>{m==='0'?'Fără garanție':`${m} luni`}</option>)}
                      </select>
                      <div style={{marginTop:10}}>
                        <label style={label}>An minim acceptat</label>
                        <input className="dash-input" type="number" value={pf.min_year_accepted} onChange={e=>setPf(p=>({...p,min_year_accepted:e.target.value}))} placeholder="ex: 2005" style={input}/>
                      </div>
                    </div>

                    {/* Certificări */}
                    <div>
                      <label style={label}>Certificări</label>
                      {[{k:'is_authorized_rar',l:'🛡️ Autorizat RAR'},{k:'has_itp',l:'✅ ITP pe loc'}].map(opt=>(
                        <label key={opt.k} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:pf[opt.k]?'#eaf3ff':S.bg,borderRadius:10,cursor:'pointer',marginBottom:8,border:`1.5px solid ${pf[opt.k]?S.blue:S.border}`}}>
                          <input type="checkbox" checked={pf[opt.k]} onChange={e=>setPf(p=>({...p,[opt.k]:e.target.checked}))} style={{accentColor:S.blue,width:16,height:16}}/>
                          <span style={{fontSize:13,fontWeight:600,color:pf[opt.k]?S.blue:S.navy}}>{opt.l}</span>
                        </label>
                      ))}
                    </div>
                  </div>{/* end grid 1fr 1fr 1fr */}
                </div>{/* end card Specializari */}
              </div>{/* end profile grid */}

              <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
                <button onClick={saveProfile} disabled={profileSaving}
                  style={{...btn('primary'),padding:'12px 28px',fontSize:14,background:profileSaved?S.green:S.blue}}>
                  {profileSaved?'✅ Profil salvat!':profileSaving?'Se salvează...':'Salvează toate modificările →'}
                </button>
              </div>
            </div>
          )}

          {/* ══ SERVICII OFERITE ══ */}
          {tab==='Servicii oferite'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>Servicii oferite</h1>
              <p style={{color:S.muted,fontSize:13,marginBottom:20}}>Adaugă serviciile cu prețuri — clienții le văd pe profilul tău.</p>

              <div style={card({marginBottom:16})}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:14}}>+ Adaugă serviciu nou</h3>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <label style={label}>Serviciu *</label>
                    <div style={{position:'relative'}}>
                      <select className="dash-input" value={newOffering.name} onChange={e=>setNewOffering(p=>({...p,name:e.target.value}))} style={input}>
                        <option value="">Selectează serviciul</option>
                        {SERVICE_CATEGORIES.map(cat=>(
                          <optgroup key={cat.cat} label={cat.cat}>
                            {cat.items.map(s=><option key={s} value={s}>{s}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={label}>Preț de la (RON)</label>
                    <input className="dash-input" type="number" value={newOffering.price_from} onChange={e=>setNewOffering(p=>({...p,price_from:e.target.value}))} placeholder="100" style={input}/>
                  </div>
                  <div>
                    <label style={label}>Preț până la (RON)</label>
                    <input className="dash-input" type="number" value={newOffering.price_to} onChange={e=>setNewOffering(p=>({...p,price_to:e.target.value}))} placeholder="250" style={input}/>
                  </div>
                  <div>
                    <label style={label}>Durată (min)</label>
                    <input className="dash-input" type="number" value={newOffering.duration_min} onChange={e=>setNewOffering(p=>({...p,duration_min:e.target.value}))} placeholder="60" style={input}/>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={label}>Detalii suplimentare</label>
                  <input className="dash-input" value={newOffering.description} onChange={e=>setNewOffering(p=>({...p,description:e.target.value}))} placeholder="ex: include filtrul de ulei, verificare nivel lichide..." style={input}/>
                </div>
                <button onClick={addOffering} disabled={!newOffering.name} style={{...btn('primary'),opacity:!newOffering.name?.5:1}}>+ Adaugă serviciu</button>
              </div>

              {/* Adaugă rapid pe categorii */}
              <div style={card({marginBottom:16})}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:4}}>⚡ Adaugă rapid pe categorii</h3>
                <p style={{fontSize:12,color:S.muted,marginBottom:14}}>Click pe o categorie pentru a adăuga toate serviciile din ea dintr-o dată.</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {SERVICE_CATEGORIES.map(cat=>{
                    const allAdded = cat.items.every(s=>offerings.some(o=>o.name===s))
                    const addedCount = cat.items.filter(s=>offerings.some(o=>o.name===s)).length
                    return (
                      <button key={cat.cat} onClick={()=>addWholeCategory(cat.items)}
                        style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:50,border:`1.5px solid ${allAdded?S.green+'50':'#1a56db30'}`,background:allAdded?S.greenBg:'#eaf3ff',color:allAdded?S.green:S.blue,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                        {allAdded?'✓ ':''}{cat.cat}
                        <span style={{background:allAdded?S.green:S.blue,color:'#fff',borderRadius:50,padding:'1px 7px',fontSize:10,fontWeight:700}}>
                          {addedCount}/{cat.items.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {offerings.length===0?<div style={{...card(),textAlign:'center',padding:'40px 20px',color:S.muted}}>
                <div style={{fontSize:40,marginBottom:12}}>🔧</div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>Niciun serviciu adăugat</div>
                <div style={{fontSize:13}}>Adaugă serviciile pentru a apărea mai bine în căutări.</div>
              </div>:
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {offerings.map(o=>(
                    <div key={o.id} className="card-hover" style={{...card({padding:'14px 16px'}),display:'flex',alignItems:'center',gap:14}}>
                      <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🔧</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,color:S.navy}}>{o.name}</div>
                        {o.description&&<div style={{fontSize:12,color:S.muted,marginTop:2}}>{o.description}</div>}
                        {o.duration_min&&<div style={{fontSize:12,color:S.muted}}>⏱️ ~{o.duration_min} min</div>}
                      </div>
                      <div style={{textAlign:'right',marginRight:12}}>
                        {(o.price_from||o.price_to)&&<div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy}}>{o.price_from&&o.price_to?`${o.price_from} – ${o.price_to} RON`:o.price_from?`de la ${o.price_from} RON`:`până la ${o.price_to} RON`}</div>}
                      </div>
                      <button onClick={()=>deleteOffering(o.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#fca5a5',fontSize:18,padding:4}}>🗑️</button>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ══ CERERI ══ */}
          {tab==='Cereri'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,marginBottom:16}}>Cereri în {service?.city}</h1>

              {/* Modal detalii cerere */}
              {selectedReq&&(
                <div onClick={e=>{if(e.target===e.currentTarget)setSelectedReq(null)}}
                  style={{position:'fixed',inset:0,background:'rgba(10,18,30,0.5)',zIndex:500,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                  <div style={{background:'#fff',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto',padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                      <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:'#0a1f44',margin:0}}>Detalii cerere</h2>
                      <button onClick={()=>setSelectedReq(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#6b7280',lineHeight:1}}>✕</button>
                    </div>
                  <div style={card({marginBottom:12})}>
                    {/* Contact client */}
                    <div style={{background:'#eaf3ff',borderRadius:12,padding:'12px 16px',marginBottom:14,border:'1px solid rgba(26,86,219,0.15)'}}>
                      <div style={{fontSize:11,color:S.blue,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>👤 Date contact client</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:18}}>👤</span>
                          <div>
                            <div style={{fontSize:10,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Nume</div>
                            <div style={{fontWeight:700,fontSize:14,color:S.navy}}>{selectedReq.contact_name||'—'}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:18}}>📞</span>
                          <div>
                            <div style={{fontSize:10,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Telefon</div>
                            {selectedReq.contact_phone?(
                              <a href={`tel:${selectedReq.contact_phone}`} style={{fontWeight:700,fontSize:14,color:S.blue,textDecoration:'none'}}>{selectedReq.contact_phone}</a>
                            ):<div style={{fontWeight:700,fontSize:14,color:S.muted}}>—</div>}
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:18}}>📍</span>
                          <div>
                            <div style={{fontSize:10,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Oraș</div>
                            <div style={{fontWeight:700,fontSize:14,color:S.navy}}>{selectedReq.city||'—'}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:18}}>📅</span>
                          <div>
                            <div style={{fontSize:10,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Data cererii</div>
                            <div style={{fontWeight:700,fontSize:14,color:S.navy}}>{new Date(selectedReq.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'})}</div>
                          </div>
                        </div>
                      </div>
                      {selectedReq.contact_phone&&(
                        <a href={`tel:${selectedReq.contact_phone}`}
                          style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:10,padding:'10px',background:S.blue,color:'#fff',borderRadius:10,textDecoration:'none',fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>
                          📞 Sună clientul acum
                        </a>
                      )}
                    </div>

                    {/* Detalii masina */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                      {[['Mașina',`${selectedReq.car_brand} ${selectedReq.car_model} ${selectedReq.car_year||''}`],['Combustibil',selectedReq.car_fuel||'—'],['Kilometraj',selectedReq.car_km?`${Number(selectedReq.car_km).toLocaleString()} km`:'—'],['Urgență',selectedReq.urgency||'—'],['Data preferată',selectedReq.preferred_date||'—'],['Interval',selectedReq.preferred_time||'—']].map(([l,v])=>(
                        <div key={l} style={{background:S.bg,borderRadius:10,padding:'10px 12px'}}>
                          <div style={{fontSize:10,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{l}</div>
                          <div style={{fontWeight:600,fontSize:13,color:S.navy}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {selectedReq.services?.length>0&&<div style={{marginBottom:12}}>
                      <div style={{fontSize:11,color:S.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:6}}>Servicii cerute</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{selectedReq.services.map(s=><span key={s} style={pill('#eaf3ff',S.blue,'')}>{s}</span>)}</div>
                    </div>}
                    {selectedReq.description&&<div style={{background:S.amberBg,borderRadius:10,padding:'10px 12px',border:`1px solid ${S.amber}30`}}>
                      <div style={{fontSize:10,color:S.amber,fontWeight:700,marginBottom:4}}>DESCRIERE PROBLEMĂ</div>
                      <p style={{fontSize:13,color:S.amber}}>{selectedReq.description}</p>
                    </div>}
                  </div>

                  <div style={card()}>
                    <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:16}}>Trimite ofertă</h2>
                    {offerSent?<div style={{textAlign:'center',padding:'32px 0'}}>
                      <div style={{fontSize:48,marginBottom:12}}>✅</div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:S.green,fontSize:16}}>Oferta a fost trimisă!</div>
                    </div>:(
                      <div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                          {[['price_total','Preț total (RON)'],['price_parts','Piese (RON)'],['price_labor','Manoperă (RON)']].map(([k,l])=>(
                            <div key={k}>
                              <label style={label}>{l}</label>
                              <input className="dash-input" type="number" value={offerForm[k]} onChange={e=>setOfferForm(p=>({...p,[k]:e.target.value}))} placeholder="0" style={input}/>
                            </div>
                          ))}
                        </div>
                        <div style={{marginBottom:12}}>
                          <label style={label}>Descriere ofertă</label>
                          <textarea className="dash-input" value={offerForm.description} onChange={e=>setOfferForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Detalii despre lucrare, piese incluse..." style={{...input,resize:'none'}}/>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
                          <div>
                            <label style={label}>Data disponibilă</label>
                            <input className="dash-input" type="date" value={offerForm.available_date} onChange={e=>setOfferForm(p=>({...p,available_date:e.target.value}))} style={input}/>
                          </div>
                          <div>
                            <label style={label}>Interval orar</label>
                            <select className="dash-input" value={offerForm.available_time} onChange={e=>setOfferForm(p=>({...p,available_time:e.target.value}))} style={input}>
                              {['08:00-10:00','09:00-12:00','10:00-13:00','12:00-15:00','14:00-17:00','15:00-18:00'].map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={label}>Garanție (luni)</label>
                            <select className="dash-input" value={offerForm.warranty_months} onChange={e=>setOfferForm(p=>({...p,warranty_months:e.target.value}))} style={input}>
                              {['0','3','6','12','24'].map(m=><option key={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <button onClick={sendOffer} style={{...btn('yellow'),width:'100%',justifyContent:'center',padding:'12px',fontSize:14}}>✉️ Trimite oferta</button>
                      </div>
                    )}

                  </div>
                </div>
                </div>
              )}

              {/* Lista cereri */}
              {requests.length===0
                ?<div style={{...card(),textAlign:'center',padding:'40px 16px',color:S.muted}}>
                  <div style={{fontSize:36,marginBottom:10}}>📭</div>
                  <div style={{fontWeight:600,marginBottom:4}}>Nicio cerere activă</div>
                  <div style={{fontSize:12}}>Vei fi notificat când apar cereri noi.</div>
                </div>
                :<>{requests.map(r=>(
                  <button key={r.id} onClick={()=>setSelectedReq(r)} className="card-hover"
                    style={{...card({padding:14,marginBottom:8}),width:'100%',textAlign:'left',cursor:'pointer',border:`1.5px solid ${selectedReq?.id===r.id?S.blue:S.border}`,background:selectedReq?.id===r.id?'#eaf3ff':S.white}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:S.navy}}>{r.car_brand} {r.car_model} {r.car_year?`(${r.car_year})`:''}</div>
                        <div style={{fontSize:12,color:S.muted,marginTop:2}}>{r.car_fuel}{r.car_km?` · ${r.car_km.toLocaleString()} km`:''}</div>
                      </div>
                      <span style={pill(r.urgency==='urgent'?S.redBg:r.urgency==='saptamana'?S.amberBg:S.greenBg,r.urgency==='urgent'?S.red:r.urgency==='saptamana'?S.amber:S.green,'')}>{r.urgency}</span>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:6}}>
                      {r.services?.slice(0,3).map(s=><span key={s} style={pill('#eaf3ff',S.blue,'')}>{s}</span>)}
                      {(r.services?.length||0)>3&&<span style={pill(S.bg,S.muted,'')}>+{r.services.length-3}</span>}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontSize:11,color:S.muted}}>{new Date(r.created_at).toLocaleDateString('ro-RO')}</div>
                      {r.contact_name&&<div style={{fontSize:12,fontWeight:600,color:S.blue}}>👤 {r.contact_name}</div>}
                    </div>
                  </button>
                ))}</>
              }
            </div>
          )}
          {tab==='Programări'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy}}>Calendar programări</h1>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:13,color:S.muted}}>{appointments.filter(a=>a.scheduled_date===today).length} programări azi</span>
                  <button onClick={()=>setShowAddApt(true)}
                    style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',background:S.blue,color:'#fff',border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif"}}>
                    + Adaugă programare
                  </button>
                </div>
              </div>

              {/* Modal adaugare programare manuala */}
              {showAddApt&&(
                <div onClick={e=>{if(e.target===e.currentTarget)setShowAddApt(false)}}
                  style={{position:'fixed',inset:0,background:'rgba(10,18,30,0.6)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
                  <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:500,padding:28,maxHeight:'90vh',overflowY:'auto'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                      <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:S.navy}}>Adaugă programare</h3>
                      <button onClick={()=>setShowAddApt(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:S.muted}}>✕</button>
                    </div>
                    <div style={{display:'grid',gap:12}}>
                      {/* Data + Ora */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                        <div>
                          <label style={label}>Data *</label>
                          <input type="date" value={newApt.scheduled_date} onChange={e=>setNewApt(p=>({...p,scheduled_date:e.target.value}))} min={today} style={input}/>
                        </div>
                        <div>
                          <label style={label}>Ora *</label>
                          <select value={newApt.scheduled_time} onChange={e=>setNewApt(p=>({...p,scheduled_time:e.target.value}))} style={input}>
                            {Array.from({length:22},(_, i)=>{
                              const h = Math.floor(i/2)+8
                              const m = i%2===0?'00':'30'
                              const t = `${String(h).padStart(2,'0')}:${m}`
                              return <option key={t} value={t}>{t}</option>
                            })}
                          </select>
                        </div>
                      </div>
                      {/* Durata */}
                      <div>
                        <label style={label}>Durată estimată</label>
                        <select value={newApt.duration_min} onChange={e=>setNewApt(p=>({...p,duration_min:e.target.value}))} style={input}>
                          {[['30','30 minute'],['60','1 oră'],['90','1h 30min'],['120','2 ore'],['180','3 ore'],['240','4 ore'],['480','Toată ziua']].map(([v,l])=>(
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                      {/* Client */}
                      <div>
                        <label style={label}>Numele clientului</label>
                        <input value={newApt.client_name} onChange={e=>setNewApt(p=>({...p,client_name:e.target.value}))} placeholder="Ion Popescu" style={input}/>
                      </div>
                      {/* Masina */}
                      <div>
                        <label style={label}>Mașina</label>
                        <input value={newApt.car_info} onChange={e=>setNewApt(p=>({...p,car_info:e.target.value}))} placeholder="ex: BMW Seria 3, B-11-XYZ" style={input}/>
                      </div>
                      {/* Lucrare */}
                      <div>
                        <label style={label}>Lucrare / Descriere</label>
                        <textarea value={newApt.work_description} onChange={e=>setNewApt(p=>({...p,work_description:e.target.value}))} rows={2}
                          placeholder="ex: Schimb ulei + filtre, Frâne față..." style={{...input,resize:'none'}}/>
                      </div>
                      {/* Note */}
                      <div>
                        <label style={label}>Note interne (opțional)</label>
                        <input value={newApt.notes} onChange={e=>setNewApt(p=>({...p,notes:e.target.value}))} placeholder="ex: Client fidel, aduce piese proprii" style={input}/>
                      </div>
                    </div>
                    <button onClick={addManualAppointment} disabled={addingApt||!newApt.scheduled_date||!newApt.scheduled_time}
                      style={{...btn('primary'),width:'100%',justifyContent:'center',marginTop:16,padding:'12px',fontSize:14,opacity:(!newApt.scheduled_date||!newApt.scheduled_time)?.5:1}}>
                      {addingApt?'Se salvează...':'✅ Salvează programarea'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
                {/* Mini calendar */}
                <div>
                  <div style={card({marginBottom:12})}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                      <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                      <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy}}>{calMonth.toLocaleDateString('ro-RO',{month:'long',year:'numeric'})}</span>
                      <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
                      {['L','M','M','J','V','S','D'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:11,fontWeight:700,color:S.muted,padding:'4px 0'}}>{d}</div>)}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
                      {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                      {Array.from({length:daysInMonth}).map((_,i)=>{
                        const day=i+1
                        const apts=aptsForDay(day)
                        const isToday=day===new Date().getDate()&&calMonth.getMonth()===new Date().getMonth()&&calMonth.getFullYear()===new Date().getFullYear()
                        return (
                          <div key={day} style={{textAlign:'center',padding:'5px 2px',borderRadius:8,background:isToday?S.blue:apts.length>0?'#eaf3ff':'transparent',cursor:'default'}}>
                            <div style={{fontSize:12,fontWeight:isToday?700:400,color:isToday?'#fff':apts.length>0?S.blue:S.text}}>{day}</div>
                            {apts.length>0&&<div style={{fontSize:9,color:isToday?'rgba(255,255,255,0.8)':S.blue,fontWeight:700}}>{apts.length}</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Rezumat rapid */}
                  <div style={card()}>
                    <div style={{fontSize:12,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Rezumat</div>
                    {[
                      {label:'Azi',count:appointments.filter(a=>a.scheduled_date===today).length,color:S.blue,bg:'#eaf3ff'},
                      {label:'Această săptămână',count:appointments.filter(a=>{const d=new Date(a.scheduled_date);const now=new Date();const wk=new Date(now);wk.setDate(now.getDate()+7);return d>=now&&d<=wk}).length,color:S.green,bg:S.greenBg},
                      {label:'În așteptare',count:appointments.filter(a=>(aptStatuses[a.id]||a.status)==='in_asteptare').length,color:S.amber,bg:S.amberBg},
                    ].map(r=>(
                      <div key={r.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:r.bg,borderRadius:10,marginBottom:6}}>
                        <span style={{fontSize:12,color:r.color,fontWeight:600}}>{r.label}</span>
                        <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:r.color}}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lista programări */}
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {appointments.length===0
                    ?<div style={{...card(),textAlign:'center',padding:'60px 20px',color:S.muted}}>
                      <div style={{fontSize:48,marginBottom:12}}>📅</div>
                      <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>Nicio programare</div>
                      <div style={{fontSize:13}}>Programările apar automat când clienții acceptă ofertele.</div>
                    </div>
                    :appointments.map(a=>{
                      const status = aptStatuses[a.id]||a.status
                      const st = APT_STATUS[status]||APT_STATUS.in_asteptare
                      const isToday2 = a.scheduled_date===today
                      return (
                        <div key={a.id} style={{...card({padding:16}),border:`1.5px solid ${isToday2?S.blue:S.border}`}}>
                          {/* Header */}
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                            <div>
                              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                                {isToday2&&<span style={{background:S.blue,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:50,fontFamily:"'Sora',sans-serif"}}>AZI</span>}
                                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>
                                  {new Date(a.scheduled_date).toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'})}
                                </div>
                              </div>
                              <div style={{display:'flex',alignItems:'center',gap:12,fontSize:13,color:S.muted}}>
                                <span>⏰ {a.scheduled_time||'Oră nespecificată'}</span>
                                {a.duration_min&&<span>⏱️ ~{a.duration_min} min</span>}
                              </div>
                            </div>
                            <span style={pill(st.bg,st.color,'')}>{st.label}</span>
                          </div>

                          {/* Lucrare + client */}
                          {(a.work_description||a.client_name||a.car_info)&&(
                            <div style={{background:S.bg,borderRadius:10,padding:'10px 12px',marginBottom:12}}>
                              {a.car_info&&<div style={{fontSize:12,color:S.navy,fontWeight:600,marginBottom:4}}>🚗 {a.car_info}</div>}
                              {a.client_name&&<div style={{fontSize:12,color:S.muted,marginBottom:4}}>👤 {a.client_name}</div>}
                              {a.work_description&&<div style={{fontSize:13,color:S.text,lineHeight:1.5}}>{a.work_description}</div>}
                            </div>
                          )}

                          {/* Note */}
                          {a.notes&&<div style={{fontSize:13,color:S.muted,background:'#fffbf0',border:`1px solid ${S.amber}30`,borderRadius:8,padding:'8px 12px',marginBottom:12}}>📝 {a.notes}</div>}

                          {/* Butoane status */}
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            {[
                              {s:'in_asteptare',l:'⏳ Așteptare'},
                              {s:'confirmata',l:'✅ Confirmată'},
                              {s:'in_lucru',l:'🔧 În lucru'},
                              {s:'finalizata',l:'🏁 Finalizată'},
                              {s:'anulata',l:'❌ Anulată'},
                            ].map(opt=>(
                              <button key={opt.s} onClick={()=>updateAptStatus(a.id,opt.s)}
                                style={{padding:'6px 12px',borderRadius:50,fontSize:11,fontWeight:600,cursor:'pointer',border:`1.5px solid ${status===opt.s?S.blue:S.border}`,background:status===opt.s?'#eaf3ff':S.white,color:status===opt.s?S.blue:S.muted,transition:'all .15s'}}>
                                {opt.l}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
                </div>
            </div>
          )}


          {/* ══ OFERTE TRIMISE ══ */}
          {tab==='Oferte trimise'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:20}}>Oferte trimise</h1>
              {offers.length===0?<div style={{...card(),textAlign:'center',padding:'60px 20px',color:S.muted}}>
                <div style={{fontSize:48,marginBottom:12}}>💬</div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:8}}>Nicio ofertă trimisă</div>
                <button onClick={()=>setTab('Cereri')} style={btn('primary')}>Vezi cererile disponibile →</button>
              </div>:
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {offers.map(o=>(
                    <div key={o.id} style={{...card({padding:16})}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12,gap:12}}>
                        <div style={{flex:1}}>
                          {/* Status badge */}
                          <div style={{marginBottom:8}}>
                            <span style={{...pill(o.status==='acceptata'?S.greenBg:o.status==='refuzata'?S.redBg:o.status==='trimisa'?'#eaf3ff':S.bg,o.status==='acceptata'?S.green:o.status==='refuzata'?S.red:o.status==='trimisa'?S.blue:S.muted,''),fontSize:12,padding:'4px 12px'}}>
                              {o.status==='trimisa'?'🆕 Trimisă — Așteptăm răspuns':o.status==='acceptata'?'✅ Acceptată de client':o.status==='refuzata'?'❌ Refuzată de client':'⏰ Expirată'}
                            </span>
                          </div>
                          {/* Pret */}
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:o.status==='acceptata'?S.green:S.navy,marginBottom:4}}>
                            {o.price_total?`${o.price_total.toLocaleString()} RON`:'Preț negociabil'}
                          </div>
                          {/* Detalii pret */}
                          {(o.price_parts||o.price_labor)&&(
                            <div style={{fontSize:12,color:S.muted,marginBottom:4}}>
                              {o.price_parts&&`Piese: ${o.price_parts} RON`}{o.price_parts&&o.price_labor&&' · '}{o.price_labor&&`Manoperă: ${o.price_labor} RON`}
                            </div>
                          )}
                          {o.description&&<p style={{fontSize:13,color:S.muted,marginBottom:6,lineHeight:1.5}}>{o.description}</p>}
                        </div>
                        <div style={{fontSize:12,color:S.muted,flexShrink:0,textAlign:'right'}}>
                          {new Date(o.created_at).toLocaleDateString('ro-RO',{day:'numeric',month:'short'})}
                          <br/>{new Date(o.created_at).toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </div>
                      {/* Detalii extra */}
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:10,borderTop:`1px solid ${S.border}`}}>
                        {o.available_date&&<span style={{fontSize:11,color:S.muted,background:S.bg,borderRadius:6,padding:'3px 8px'}}>📅 {new Date(o.available_date).toLocaleDateString('ro-RO')}</span>}
                        {o.available_time&&<span style={{fontSize:11,color:S.muted,background:S.bg,borderRadius:6,padding:'3px 8px'}}>⏰ {o.available_time}</span>}
                        {o.warranty_months>0&&<span style={{fontSize:11,color:S.muted,background:S.bg,borderRadius:6,padding:'3px 8px'}}>🛡️ Garanție {o.warranty_months} luni</span>}
                        {o.status==='acceptata'&&(
                          <span style={{fontSize:11,color:S.green,fontWeight:700,marginLeft:'auto'}}>
                            🎉 Clientul a acceptat oferta ta!
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ══ RECENZII ══ */}
          {/* ══ ANUNTURI ══ */}
          {tab==='Anunțuri'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
                <div>
                  <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>Anunțurile mele</h1>
                  <p style={{color:S.muted,fontSize:13}}>Piese, accesorii sau alte produse auto pe care le vinzi.</p>
                </div>
                <a href="/listing/create" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',background:S.yellow,color:'#fff',borderRadius:50,textDecoration:'none',fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:'0 4px 16px rgba(245,158,11,0.3)'}}>
                  + Adaugă anunț
                </a>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14,marginBottom:20}}>

                {/* Generator dezmembrari */}
                <div style={card()}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <div style={{width:40,height:40,background:'#fef3c7',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🔩</div>
                    <div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>Generator dezmembrări</div>
                      <div style={{fontSize:12,color:S.muted}}>Generează automat anunțuri pentru toate piesele</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    {[{k:'gen_brand',l:'Marcă',p:'ex: BMW'},{k:'gen_model',l:'Model',p:'ex: Seria 5'},{k:'gen_year',l:'An',p:'2015'},{k:'gen_vin',l:'VIN (opț.)',p:'17 caractere'}].map(f=>(
                      <div key={f.k}>
                        <label style={label}>{f.l}</label>
                        <input className="dash-input" value={pf[f.k]||''} onChange={e=>setPf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={{...input,fontSize:12}}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={async()=>{
                    if(!pf.gen_brand||!pf.gen_model){alert('Completează marca și modelul!');return}
                    if(!service||!user) return
                    const piese=[
                      'Motor complet','Cutie viteze manuală','Alternator','Electromotor',
                      'Compresor AC','Radiator apă','Radiator AC','Pompă apă','Turbină',
                      'Injectoare set','Pompă injecție','Calculator motor',
                      'Ușă față stânga','Ușă față dreapta','Ușă spate stânga','Ușă spate dreapta',
                      'Capotă față','Portbagaj','Bară față','Bară spate',
                      'Aripă față stânga','Aripă față dreapta',
                      'Far față stânga','Far față dreapta','Stop spate stânga','Stop spate dreapta',
                      'Planetară stânga','Planetară dreapta','Amortizor față stânga','Amortizor față dreapta',
                      'Fuzetă față stânga','Fuzetă față dreapta',
                      'Volan','Airbag volan','Airbag pasager','Centuri siguranță set',
                      'Bloc instrumente bord','Radio original','Geam față','Geam spate',
                    ]
                    const inserts=piese.map(p=>({
                      user_id:user.id,
                      title:`${p} ${pf.gen_brand} ${pf.gen_model}${pf.gen_year?' '+pf.gen_year:''}`,
                      description:`${p} demontat de pe ${pf.gen_brand} ${pf.gen_model}${pf.gen_year?' ('+pf.gen_year+')':''}${pf.gen_vin?' · VIN: '+pf.gen_vin:''}. Piesă originală testată, în stare bună de funcționare.`,
                      category:'piese',condition:'folosit',
                      city:service.city||'București',
                      status:'activ',
                    }))
                    const{error}=await supabase.from('listings').insert(inserts)
                    if(error){alert('Eroare: '+error.message);return}
                    alert(`✅ ${piese.length} anunțuri generate! Editează prețurile din "Gestionează anunțuri".`)
                    setPf(p=>({...p,gen_brand:'',gen_model:'',gen_year:'',gen_vin:''}))
                  }} style={{...btn('primary'),width:'100%',justifyContent:'center',background:'#d97706',boxShadow:'0 2px 8px rgba(217,119,6,0.3)',fontSize:13}}>
                    ⚡ Generează 40 anunțuri automat
                  </button>
                </div>

                {/* Import CSV */}
                <div style={card()}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📊</div>
                    <div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>Import CSV / XML</div>
                      <div style={{fontSize:12,color:S.muted}}>Importă stocul din fișier direct pe platformă</div>
                    </div>
                  </div>
                  <div style={{background:S.bg,borderRadius:10,padding:'10px 12px',marginBottom:10,fontSize:11,color:S.muted,lineHeight:1.7}}>
                    <div style={{fontWeight:700,color:S.navy,marginBottom:4}}>Format CSV acceptat:</div>
                    <code style={{fontSize:10,color:S.blue}}>titlu, pret, categorie, oras, stare, descriere</code>
                    <div style={{marginTop:4}}>Prima linie = antet. Câmpurile opționale pot fi goale.</div>
                  </div>
                  <input type="file" accept=".csv,.txt" id="csv-upload" style={{display:'none'}}
                    onChange={async(e)=>{
                      const file=e.target.files?.[0]; if(!file||!service||!user) return
                      const text=await file.text()
                      const lines=text.split('\n').filter(l=>l.trim())
                      const headers=lines[0].split(',').map(h=>h.trim().toLowerCase().replace(/"/g,''))
                      const rows=lines.slice(1)
                      const inserts=rows.map(row=>{
                        const cols=row.split(',').map(c=>c.trim().replace(/"/g,''))
                        const get=(name)=>cols[headers.indexOf(name)]||''
                        return {
                          user_id:user.id,
                          title:get('titlu')||get('title')||get('denumire')||cols[0]||'Piesă auto',
                          price:parseFloat(get('pret')||get('price'))||null,
                          category:get('categorie')||get('category')||'piese',
                          city:get('oras')||get('city')||service.city||'București',
                          condition:get('stare')||get('condition')||'folosit',
                          description:get('descriere')||get('description')||'',
                          status:'activ',
                        }
                      }).filter(r=>r.title&&r.title.length>1)
                      if(inserts.length===0){alert('Nu s-au găsit rânduri valide.');return}
                      const{error}=await supabase.from('listings').insert(inserts)
                      if(error){alert('Eroare import: '+error.message);return}
                      alert(`✅ ${inserts.length} anunțuri importate!`)
                      e.target.value=''
                    }}/>
                  <button onClick={()=>document.getElementById('csv-upload')?.click()}
                    style={{...btn('ghost'),width:'100%',justifyContent:'center',marginBottom:8,fontSize:13}}>
                    📂 Alege fișier CSV
                  </button>
                  <a href={'data:text/csv;charset=utf-8,titlu%2Cpret%2Ccategorie%2Coras%2Cstare%2Cdescriere%0AUsa%20fata%20stanga%20BMW%20E60%2C850%2Cpiese%2CBucuresti%2Cfolosit%2CPiesa%20originala'}
                    download="model_import_reparo.csv"
                    style={{display:'block',textAlign:'center',fontSize:12,color:S.blue,textDecoration:'none',fontWeight:600}}>
                    ⬇ Descarcă model CSV
                  </a>
                </div>

                {/* Relistare automata */}
                <div style={card()}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <div style={{width:40,height:40,background:'#dcfce7',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🔄</div>
                    <div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>Relistare automată</div>
                      <div style={{fontSize:12,color:S.muted}}>Anunțurile urcă automat în top</div>
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    {[
                      {plan:'free',label:'Plan Free',interval:'Indisponibil',active:false,has:false},
                      {plan:'basic',label:'Plan Basic',interval:'La 24 ore',active:service?.plan==='basic',has:service?.plan==='basic'||service?.plan==='pro'},
                      {plan:'pro',label:'Plan Pro',interval:'La 6 ore',active:service?.plan==='pro',has:service?.plan==='pro'},
                    ].map(p=>(
                      <div key={p.plan} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,background:p.active?'#dcfce7':S.bg,marginBottom:6,border:`1px solid ${p.active?S.green:S.border}`}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:S.navy}}>{p.label}</div>
                          <div style={{fontSize:11,color:S.muted}}>{p.interval}</div>
                        </div>
                        {p.active?<span style={{fontSize:11,fontWeight:700,color:S.green}}>✅ Activ</span>
                          :p.has?<span style={{fontSize:11,color:S.blue}}>Inclus</span>
                          :<span style={{fontSize:11,color:S.muted}}>—</span>}
                      </div>
                    ))}
                  </div>
                  {service?.plan==='free'?(
                    <button onClick={async()=>{
                      const res=await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'subscription',plan:'basic',service_id:service?.id})})
                      const{url}=await res.json()
                      if(url) window.location.href=url
                    }} style={{...btn('primary'),width:'100%',justifyContent:'center',fontSize:13}}>
                      Upgrade pentru relistare →
                    </button>
                  ):(
                    <div style={{background:'#dcfce7',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#166534',fontWeight:600}}>
                      ✅ Relistarea automată este activă
                    </div>
                  )}
                </div>

              </div>

              <a href="/anunturile-mele"
                style={{display:'flex',alignItems:'center',gap:16,padding:20,background:S.white,borderRadius:16,border:`1.5px solid ${S.border}`,textDecoration:'none',transition:'border-color .2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                <div style={{width:52,height:52,background:'#eaf3ff',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>📋</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:4}}>Gestionează toate anunțurile</div>
                  <div style={{fontSize:13,color:S.muted}}>Editează prețuri, activează/dezactivează, șterge.</div>
                </div>
                <div style={{color:S.blue,fontSize:20,fontWeight:300}}>→</div>
              </a>
            </div>
          )}

          {tab==='Recenzii'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
                <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy}}>Recenzii</h1>
                {service?.rating_count>0&&<div style={{display:'flex',alignItems:'center',gap:8,background:S.amberBg,border:`1px solid ${S.amber}30`,padding:'8px 16px',borderRadius:50}}>
                  <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.amber}}>{service.rating_avg.toFixed(1)}</span>
                  <div><div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:12,color:s<=Math.round(service.rating_avg)?S.yellow:'#ddd'}}>★</span>)}</div><div style={{fontSize:10,color:S.muted}}>{service.rating_count} recenzii</div></div>
                </div>}
              </div>

              {/* Rating breakdown */}
              {reviews.length>0&&(
                <div style={{...card({marginBottom:16})}}>
                  <div style={{fontSize:12,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Distribuție rating</div>
                  {[5,4,3,2,1].map(star=>{
                    const count = reviews.filter(r=>r.rating===star).length
                    const pct = reviews.length?Math.round(count/reviews.length*100):0
                    return (
                      <div key={star} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <span style={{fontSize:12,color:S.muted,width:12}}>{star}</span>
                        <span style={{color:S.yellow,fontSize:12}}>★</span>
                        <div style={{flex:1,height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${pct}%`,height:'100%',background:S.yellow,borderRadius:3,transition:'width .5s'}}/>
                        </div>
                        <span style={{fontSize:11,color:S.muted,width:28,textAlign:'right'}}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {reviews.length===0
                ?<div style={{...card(),textAlign:'center',padding:'60px 20px',color:S.muted}}><div style={{fontSize:48,marginBottom:10}}>⭐</div>Nicio recenzie încă.</div>
                :reviews.map(r=>(
                  <div key={r.id} style={{...card({marginBottom:10})}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                      <div>
                        <div style={{display:'flex',gap:2,marginBottom:4}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:16,color:s<=r.rating?S.yellow:'#e5e7eb'}}>★</span>)}</div>
                        <div style={{fontSize:12,color:S.muted}}>{r.client_name||'Client anonim'} · {new Date(r.created_at).toLocaleDateString('ro-RO')}</div>
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        {!r.reply_text&&<button onClick={()=>setReplyingTo(r.id)} style={{...btn('ghost'),fontSize:11,padding:'5px 10px'}}>💬 Răspunde</button>}
                        <button onClick={async()=>{
                          if(!confirm('Raportezi această recenzie ca falsă?')) return
                          await supabase.from('reviews').update({is_reported:true,reported_at:new Date().toISOString()}).eq('id',r.id)
                          setReviews(prev=>prev.map(rv=>rv.id===r.id?{...rv,is_reported:true}:rv))
                          alert('Recenzia a fost raportată. O vom analiza în 24h.')
                        }} style={{...btn('ghost'),fontSize:11,padding:'5px 10px',color:r.is_reported?S.muted:S.red,opacity:r.is_reported?.5:1}}
                          disabled={r.is_reported}>
                          {r.is_reported?'⚠️ Raportat':'🚨 Raportează'}
                        </button>
                      </div>
                    </div>
                    {r.comment&&<p style={{fontSize:14,color:S.text,marginBottom:12,lineHeight:1.6,background:'#f8faff',borderRadius:10,padding:'10px 12px'}}>{r.comment}</p>}
                    {r.reply_text
                      ?<div style={{background:'#eaf3ff',borderRadius:10,padding:'10px 12px',border:`1px solid ${S.blue}20`}}>
                        <div style={{fontSize:10,fontWeight:700,color:S.blue,marginBottom:4}}>RĂSPUNSUL TĂU</div>
                        <p style={{fontSize:13,color:S.blue,margin:0}}>{r.reply_text}</p>
                        <button onClick={()=>{setReplyingTo(r.id);setReplyText(r.reply_text)}} style={{fontSize:11,color:S.blue,background:'none',border:'none',cursor:'pointer',marginTop:6,padding:0}}>✏️ Editează</button>
                      </div>
                      :replyingTo===r.id?(
                        <div>
                          <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} rows={3}
                            placeholder="Răspunsul tău public la această recenzie..."
                            style={{...input,resize:'none',marginBottom:8}}/>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={()=>sendReply(r.id)} style={btn('primary')}>Publică răspunsul</button>
                            <button onClick={()=>{setReplyingTo(null);setReplyText('')}} style={btn('ghost')}>Anulează</button>
                          </div>
                        </div>
                      ):null
                    }
                  </div>
                ))
              }
            </div>
          )}

          {/* ══ SETARI ══ */}
          {tab==='Setări'&&(
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:6}}>Setări cont</h1>
              <p style={{fontSize:14,color:S.muted,marginBottom:24}}>Gestionează abonamentul, notificările și securitatea contului tău.</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>


                {/* Plan curent */}
                <div style={{...card(),gridColumn:'1/-1'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                    <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy}}>💳 Plan abonament</h3>
                    {service?.plan_expires_at&&<div style={{fontSize:12,color:S.muted}}>Expiră: {new Date(service.plan_expires_at).toLocaleDateString('ro-RO')}</div>}
                  </div>
                  <div className="settings-plans" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                    {[
                      {plan:'free',label:'Free',price:'0',period:'',color:S.muted,features:['Profil public basic','Cereri limitate','Notificări in-app','Fără badge verificat','Statistici de bază']},
                      {plan:'basic',label:'Basic',price:'99',period:'/lună',color:S.blue,features:['Cereri nelimitate','Notificări instant + email','Badge ✓ Verificat','Statistici avansate','Prioritate medie în căutări','Suport prin email']},
                      {plan:'pro',label:'Pro',price:'199',period:'/lună',color:S.amber,features:['Tot din Basic','Prioritate maximă în căutări','Badge Pro ⭐','Promovare inclusă 7 zile/lună','Statistici complete','Suport dedicat prioritar','API integrare externe']},
                    ].map(p=>(
                      <div key={p.plan} style={{borderRadius:14,padding:16,border:`2px solid ${service?.plan===p.plan?p.color:S.border}`,background:service?.plan===p.plan?p.plan==='pro'?S.amberBg:p.plan==='basic'?'#eaf3ff':S.bg:S.white,position:'relative',transition:'all .2s'}}>
                        {service?.plan===p.plan&&<div style={{position:'absolute',top:-1,right:12,background:p.color,color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:'0 0 8px 8px',fontFamily:"'Sora',sans-serif"}}>ACTIV</div>}
                        {p.plan==='pro'&&service?.plan!=='pro'&&<div style={{position:'absolute',top:-1,left:12,background:'#7c3aed',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:'0 0 8px 8px',fontFamily:"'Sora',sans-serif"}}>RECOMANDAT</div>}
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:S.navy,marginBottom:6}}>{p.label}</div>
                        <div style={{display:'flex',alignItems:'baseline',gap:3,marginBottom:12}}>
                          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:p.color}}>{p.price} RON</span>
                          <span style={{fontSize:12,color:S.muted}}>{p.period}</span>
                        </div>
                        {p.features.map(f=>(
                          <div key={f} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,fontSize:12,color:S.muted}}>
                            <span style={{color:p.color,fontWeight:700}}>✓</span>{f}
                          </div>
                        ))}
                        {service?.plan!==p.plan&&p.plan!=='free'&&(
                          <button
                            onClick={async()=>{
                              const res = await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'subscription',plan:p.plan,service_id:service?.id})})
                              const {url,error} = await res.json()
                              if(url) window.location.href=url
                              else alert(error||'Stripe nu este configurat încă. Adaugă STRIPE_SECRET_KEY în Vercel.')
                            }}
                            style={{...btn('primary'),width:'100%',justifyContent:'center',marginTop:12,fontSize:12,background:p.color,boxShadow:`0 2px 8px ${p.color}40`}}>
                            Upgrade la {p.label} →
                          </button>
                        )}
                        {service?.plan===p.plan&&p.plan==='free'&&(
                          <div style={{marginTop:12,fontSize:11,color:S.muted,textAlign:'center',lineHeight:1.5}}>Upgrade pentru mai multe funcții</div>
                        )}
                        {service?.plan===p.plan&&p.plan!=='free'&&(
                          <div style={{marginTop:12,fontSize:12,color:p.color,fontWeight:600,textAlign:'center'}}>✅ Planul tău curent</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banner Dezmembrari — mereu vizibil */}
                <div style={{...card(),background:'#fef3c7',border:'1px solid rgba(217,119,6,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:28}}>🔩</span>
                    <div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13,color:'#92400e',marginBottom:2}}>Ești parc de dezmembrări?</div>
                      <div style={{fontSize:12,color:'#b45309',lineHeight:1.5}}>Avem abonamente speciale cu funcții dedicate: generator piese, relistare automată, ofertare nelimitată.</div>
                    </div>
                  </div>
                  <a href="/dezmembrari-abonamente" target="_blank"
                    style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',background:'#d97706',color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',fontFamily:"'Sora',sans-serif",whiteSpace:'nowrap',flexShrink:0}}>
                    Vezi abonamente →
                  </a>
                </div>

                {/* Promovare */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:12}}>🚀 Promovare service</h3>
                  <p style={{fontSize:13,color:S.muted,marginBottom:14,lineHeight:1.6}}>Apari primul în căutări din orașul tău. Vizibilitate maximă, mai mulți clienți.</p>
                  {service?.is_promoted&&service?.promoted_until?(
                    <div style={{background:S.amberBg,borderRadius:10,padding:'10px 14px',marginBottom:12,border:`1px solid ${S.amber}30`}}>
                      <div style={{fontWeight:700,fontSize:13,color:S.amber}}>⭐ Promovare activă</div>
                      <div style={{fontSize:12,color:S.amber,opacity:.8}}>Până pe {new Date(service.promoted_until).toLocaleDateString('ro-RO')}</div>
                    </div>
                  ):(
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                      {[{label:'7 zile',price:'49 RON',key:'service_top_7'},{label:'30 zile',price:'149 RON',key:'service_top_30'}].map(opt=>(
                        <button key={opt.key}
                          onClick={async()=>{
                            const res = await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'promotion',promo_type:opt.key,service_id:service?.id})})
                            const {url} = await res.json()
                            if(url) window.location.href=url
                          }}
                          style={{padding:'12px',borderRadius:12,border:`1.5px solid ${S.border}`,background:S.bg,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=S.blue;e.currentTarget.style.background='#eaf3ff'}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=S.border;e.currentTarget.style.background=S.bg}}>
                          <div style={{fontWeight:700,fontSize:13,color:S.navy,marginBottom:3}}>{opt.label}</div>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.blue}}>{opt.price}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:11,color:S.muted}}>💡 Serviciile promovate primesc în medie 3x mai multe cereri.</div>
                </div>

                {/* Notificări */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>🔔 Notificări</h3>
                  {[
                    {label:'Cerere ofertă nouă',desc:'Când un client trimite o cerere în orașul tău',key:'notif_requests',default:true},
                    {label:'Programare confirmată',desc:'Când un client acceptă oferta ta',key:'notif_appointments',default:true},
                    {label:'Recenzie nouă',desc:'Când primești o recenzie de la un client',key:'notif_reviews',default:true},
                    {label:'Mesaj nou',desc:'Când primești un mesaj de la un client',key:'notif_messages',default:true},
                  ].map((n,i)=>(
                    <div key={n.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<3?`1px solid ${S.border}`:'none'}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:S.navy,marginBottom:2}}>{n.label}</div>
                        <div style={{fontSize:11,color:S.muted}}>{n.desc}</div>
                      </div>
                      <div style={{width:44,height:24,background:S.green,borderRadius:12,position:'relative',cursor:'pointer',flexShrink:0}}>
                        <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',position:'absolute',top:2,right:2,transition:'left .2s'}}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Securitate */}
                <div style={card()}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:14}}>🔒 Securitate cont</h3>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    <a href="/auth/forgot-password" style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:S.bg,borderRadius:12,textDecoration:'none',border:`1px solid ${S.border}`,transition:'border-color .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                      <div style={{width:36,height:36,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔑</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:S.navy}}>Schimbă parola</div>
                        <div style={{fontSize:11,color:S.muted}}>Trimite email de resetare</div>
                      </div>
                      <span style={{marginLeft:'auto',color:S.blue,fontSize:14}}>→</span>
                    </a>
                    <a href="/messages" style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:S.bg,borderRadius:12,textDecoration:'none',border:`1px solid ${S.border}`,transition:'border-color .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                      <div style={{width:36,height:36,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>💬</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:S.navy}}>Mesaje clienți</div>
                        <div style={{fontSize:11,color:S.muted}}>Deschide inbox-ul</div>
                      </div>
                      <span style={{marginLeft:'auto',color:S.blue,fontSize:14}}>→</span>
                    </a>
                    {service?.id&&(
                      <a href={`/service/${service.id}`} target="_blank" style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:S.bg,borderRadius:12,textDecoration:'none',border:`1px solid ${S.border}`,transition:'border-color .15s'}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                        <div style={{width:36,height:36,background:'#eaf3ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>👁️</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:S.navy}}>Profilul public</div>
                          <div style={{fontSize:11,color:S.muted}}>Cum te văd clienții</div>
                        </div>
                        <span style={{marginLeft:'auto',color:S.blue,fontSize:14}}>↗</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Zona periculoasa */}
                <div style={{background:S.redBg,border:`1px solid ${S.red}20`,borderRadius:16,padding:20,gridColumn:'1/-1'}}>
                  <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.red,marginBottom:6}}>⚠️ Zona periculoasă</h3>
                  <p style={{fontSize:13,color:S.red,opacity:.8,marginBottom:14,lineHeight:1.6}}>Aceste acțiuni sunt ireversibile sau pot afecta vizibilitatea profilului tău.</p>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <button onClick={async()=>{
                        if(!confirm('Ești sigur că vrei să dezactivezi profilul? Clienții nu te vor mai putea găsi în căutări.')) return
                        await supabase.from('services').update({is_active:!service?.is_active}).eq('id',service?.id)
                        window.location.reload()
                      }}
                      style={{padding:'9px 18px',border:`1.5px solid ${S.red}`,borderRadius:50,color:S.red,background:S.white,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
                      {service?.is_active?'Dezactivează profilul temporar':'Reactivează profilul'}
                    </button>
                    <button onClick={async()=>{
                        await supabase.auth.signOut()
                        window.location.href='/home'
                      }}
                      style={{padding:'9px 18px',border:`1.5px solid ${S.border}`,borderRadius:50,color:S.muted,background:S.white,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
                      Deconectează-te
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
