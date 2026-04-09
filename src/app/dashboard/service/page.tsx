// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUS_COLORS = {
  in_asteptare: 'bg-yellow-100 text-yellow-700',
  confirmata: 'bg-blue-100 text-blue-700',
  in_lucru: 'bg-purple-100 text-purple-700',
  finalizata: 'bg-green-100 text-green-700',
  anulata: 'bg-red-100 text-red-700',
}

const URGENCY_COLORS = {
  flexibil: 'bg-green-100 text-green-700',
  saptamana: 'bg-yellow-100 text-yellow-700',
  urgent: 'bg-red-100 text-red-700',
}

const ALL_SERVICES = [
  'Schimb ulei & filtre', 'Frâne & discuri', 'Geometrie roți', 'Echilibrare roți',
  'Diagnoză electronică', 'Suspensie', 'Transmisie & cutie viteze', 'Vopsitorie',
  'Caroserie', 'Climatizare & AC', 'Electrică auto', 'Motor', 'ITP', 'RAR',
  'Anvelope & jante', 'Injecție & turbo', 'Polishing & detailing', 'Tractare',
  'Instalare accesorii', 'Verificare pre-cumpărare', 'Recondiționare faruri',
  'Folie auto', 'Detailing interior', 'Recondiționare jante', 'Sisteme audio',
]

const ALL_BRANDS = [
  'Toate mărcile', 'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Chrysler',
  'Citroën', 'Dacia', 'DS', 'Ferrari', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus',
  'Maserati', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Opel',
  'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Smart', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
]

const COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj',
  'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj',
  'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți',
  'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava',
  'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea',
]

export default function ServiceDashboard() {
  const [tab, setTab] = useState('Acasă')
  const [profile, setProfile] = useState(null)
  const [service, setService] = useState(null)
  const [requests, setRequests] = useState([])
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])
  const [offers, setOffers] = useState([])
  const [offerings, setOfferings] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [offerForm, setOfferForm] = useState({ price_total: '', price_parts: '', price_labor: '', description: '', available_date: '', available_time: '09:00-12:00', warranty_months: '6' })
  const [offerSent, setOfferSent] = useState(false)
  const [offerLoading, setOfferLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())
  const [aptStatuses, setAptStatuses] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [newOffering, setNewOffering] = useState({ name: '', category: '', price_from: '', price_to: '', duration_min: '', description: '' })
  const [addingOffering, setAddingOffering] = useState(false)
  const [workUpdateText, setWorkUpdateText] = useState('')
  const [workUpdateApt, setWorkUpdateApt] = useState(null)

  // Profile form state
  const [pf, setPf] = useState({
    name: '', slug: '', description: '', phone: '', email: '', website: '',
    facebook_url: '', address: '', city: '', county: '', postal_code: '',
    brands_accepted: [], fuel_types: [], min_year_accepted: '',
    is_authorized_rar: false, has_itp: false, warranty_months: '0',
    opening_hours: { Lu: '08:00-18:00', Ma: '08:00-18:00', Mi: '08:00-18:00', Jo: '08:00-18:00', Vi: '08:00-18:00', Sâ: '09:00-14:00', Du: 'Închis' },
  })

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      let { data: svc } = await supabase.from('services').select('*').eq('owner_id', user.id).single()
      if (!svc) {
        const { data: newSvc } = await supabase.from('services').insert({ owner_id: user.id, name: prof?.full_name || 'Service-ul meu', city: prof?.city || 'București', is_active: true, plan: 'free' }).select().single()
        svc = newSvc
      }
      setService(svc)
      if (svc) {
        setPf(p => ({
          ...p,
          name: svc.name || '',
          slug: svc.slug || '',
          description: svc.description || '',
          phone: svc.phone || '',
          email: svc.email || '',
          website: svc.website || '',
          facebook_url: svc.facebook_url || '',
          address: svc.address || '',
          city: svc.city || '',
          county: svc.county || '',
          postal_code: svc.postal_code || '',
          brands_accepted: svc.brands_accepted || [],
          fuel_types: svc.fuel_types || [],
          min_year_accepted: svc.min_year_accepted || '',
          is_authorized_rar: svc.is_authorized_rar || false,
          has_itp: svc.has_itp || false,
          warranty_months: svc.warranty_months?.toString() || '0',
        }))

        const [reqs, apts, revs, offs, offrs] = await Promise.all([
          supabase.from('quote_requests').select('*').eq('city', svc.city || '').eq('status', 'activa').order('created_at', { ascending: false }).limit(50),
          supabase.from('appointments').select('*').eq('service_id', svc.id).order('scheduled_date', { ascending: true }),
          supabase.from('reviews').select('*').eq('service_id', svc.id).order('created_at', { ascending: false }),
          supabase.from('offers').select('*').eq('service_id', svc.id).order('created_at', { ascending: false }),
          supabase.from('service_offerings').select('*').eq('service_id', svc.id).order('created_at', { ascending: false }),
        ])
        setRequests(reqs.data || [])
        setAppointments(apts.data || [])
        const sm = {}; apts.data?.forEach(a => sm[a.id] = a.status); setAptStatuses(sm)
        setReviews(revs.data || [])
        setOffers(offs.data || [])
        setOfferings(offrs.data || [])
      }
      setLoading(false)
    }
    load()

    const channel = supabase.channel('new-requests-dash')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quote_requests' }, payload => {
        setRequests(prev => [payload.new, ...prev])
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function saveProfile() {
    if (!service) return
    setProfileSaving(true)
    await supabase.from('services').update({
      name: pf.name, slug: pf.slug || null, description: pf.description,
      phone: pf.phone, email: pf.email, website: pf.website, facebook_url: pf.facebook_url,
      address: pf.address, city: pf.city, county: pf.county, postal_code: pf.postal_code,
      brands_accepted: pf.brands_accepted.length > 0 ? pf.brands_accepted : null,
      fuel_types: pf.fuel_types.length > 0 ? pf.fuel_types : null,
      min_year_accepted: pf.min_year_accepted ? parseInt(pf.min_year_accepted) : null,
      is_authorized_rar: pf.is_authorized_rar, has_itp: pf.has_itp,
      warranty_months: parseInt(pf.warranty_months) || 0,
      is_active: true,
    }).eq('id', service.id)
    setService(s => ({ ...s, ...pf, name: pf.name }))
    setProfileSaving(false); setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  async function sendOffer() {
    if (!service || !selectedRequest) return
    setOfferLoading(true)
    await supabase.from('offers').insert({
      request_id: selectedRequest.id, service_id: service.id,
      price_total: offerForm.price_total ? parseFloat(offerForm.price_total) : null,
      price_parts: offerForm.price_parts ? parseFloat(offerForm.price_parts) : null,
      price_labor: offerForm.price_labor ? parseFloat(offerForm.price_labor) : null,
      description: offerForm.description, available_date: offerForm.available_date || null,
      available_time: offerForm.available_time, warranty_months: parseInt(offerForm.warranty_months),
      status: 'trimisa',
    })
    setOfferSent(true)
    setRequests(prev => prev.filter(r => r.id !== selectedRequest.id))
    setTimeout(() => { setSelectedRequest(null); setOfferSent(false); setOfferForm({ price_total: '', price_parts: '', price_labor: '', description: '', available_date: '', available_time: '09:00-12:00', warranty_months: '6' }) }, 1800)
    setOfferLoading(false)
  }

  async function updateAptStatus(id, status) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAptStatuses(p => ({ ...p, [id]: status }))
    if (service) await supabase.from('work_updates').insert({ appointment_id: id, service_id: service.id, status, message: `Status actualizat: ${status}` })
  }

  async function sendWorkUpdate(aptId) {
    if (!service || !workUpdateText) return
    await supabase.from('work_updates').insert({ appointment_id: aptId, service_id: service.id, status: aptStatuses[aptId] || 'in_lucru', message: workUpdateText })
    setWorkUpdateText(''); setWorkUpdateApt(null)
    alert('Update trimis clientului!')
  }

  async function sendReply(reviewId) {
    await supabase.from('reviews').update({ reply_text: replyText, reply_at: new Date().toISOString() }).eq('id', reviewId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply_text: replyText } : r))
    setReplyingTo(null); setReplyText('')
  }

  async function addOffering() {
    if (!service || !newOffering.name) return
    setAddingOffering(true)
    const { data } = await supabase.from('service_offerings').insert({ ...newOffering, service_id: service.id, price_from: newOffering.price_from ? parseFloat(newOffering.price_from) : null, price_to: newOffering.price_to ? parseFloat(newOffering.price_to) : null, duration_min: newOffering.duration_min ? parseInt(newOffering.duration_min) : null, is_active: true }).select().single()
    if (data) setOfferings(prev => [data, ...prev])
    setNewOffering({ name: '', category: '', price_from: '', price_to: '', duration_min: '', description: '' })
    setAddingOffering(false)
  }

  async function deleteOffering(id) {
    await supabase.from('service_offerings').delete().eq('id', id)
    setOfferings(prev => prev.filter(o => o.id !== id))
  }

  function toggleBrand(brand) {
    if (brand === 'Toate mărcile') { setPf(p => ({ ...p, brands_accepted: [] })); return }
    setPf(p => ({ ...p, brands_accepted: p.brands_accepted.includes(brand) ? p.brands_accepted.filter(b => b !== brand) : [...p.brands_accepted, brand] }))
  }

  function toggleFuel(fuel) {
    setPf(p => ({ ...p, fuel_types: p.fuel_types.includes(fuel) ? p.fuel_types.filter(f => f !== fuel) : [...p.fuel_types, fuel] }))
  }

  // Calendar
  const firstDay = (() => { const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay(); return d === 0 ? 6 : d - 1 })()
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate()
  function aptsForDay(day) {
    const ds = `${calMonth.getFullYear()}-${String(calMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return appointments.filter(a => a.scheduled_date === ds)
  }

  const stats = { cereri: requests.length, aptsAzi: appointments.filter(a => a.scheduled_date === today).length, oferteActive: offers.filter(o => o.status === 'trimisa').length, rating: service?.rating_avg || 0 }

  const SIDEBAR_ITEMS = [
    { name: 'Acasă', icon: '🏠' },
    { name: 'Profil public', icon: '🏪', badge: (!pf.description || !pf.phone || !pf.address) ? '!' : null },
    { name: 'Servicii oferite', icon: '🔧', badge: offerings.length },
    { name: 'Cereri', icon: '📋', badge: requests.length },
    { name: 'Programări', icon: '📅', badge: appointments.filter(a => ['in_asteptare','confirmata','in_lucru'].includes(aptStatuses[a.id]||a.status)).length },
    { name: 'Oferte trimise', icon: '💬', badge: offers.filter(o => o.status === 'trimisa').length },
    { name: 'Recenzii', icon: '⭐', badge: reviews.length },
    { name: 'Setări', icon: '⚙️' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"/>
        <div className="text-gray-400 text-sm">Se încarcă dashboard-ul...</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOPBAR DASHBOARD */}
      <div className="bg-[#1a2332] px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(o => !o)} className="md:hidden text-white/60 hover:text-white border-none bg-transparent cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <a href="/home" className="flex items-center gap-2 text-white font-black text-lg no-underline">
            <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
            <span className="hidden sm:block">Reparo</span>
          </a>
          <span className="text-white/20 hidden md:block">|</span>
          <span className="text-white/50 text-xs hidden md:block">Dashboard Service</span>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/service/${service?.id}`} target="_blank" className="text-white/50 hover:text-white text-xs no-underline hidden md:block transition-colors">
            👁️ Vezi profil public
          </a>
          <div className="w-7 h-7 bg-[#4A90D9] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {service?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/home' }}
            className="text-white/40 hover:text-white text-xs border-none bg-transparent cursor-pointer hidden md:block">
            Ieși
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 md:z-auto w-56 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-56px)] top-14 md:top-0 transition-transform duration-200`}>
          <div className="p-4 border-b border-gray-50">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Service</div>
            <div className="font-bold text-gray-800 text-sm truncate">{service?.name}</div>
            <div className="text-xs text-gray-400">{service?.city}</div>
            <div className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${service?.plan === 'pro' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
              {service?.plan === 'pro' ? '⭐ Pro' : '🔓 Free'}
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.name} onClick={() => { setTab(item.name); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-none cursor-pointer ${tab === item.name ? 'bg-[#E6F0FB] text-[#4A90D9]' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                <span className="text-base">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge !== null && item.badge !== undefined && (item.badge > 0 || item.badge === '!') && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${item.badge === '!' ? 'bg-red-500 text-white' : tab === item.name ? 'bg-[#4A90D9] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-50 space-y-1">
            <a href="/home" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 no-underline">
              🏠 Înapoi la site
            </a>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/home' }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 border-none bg-transparent cursor-pointer">
              🚪 Ieși din cont
            </button>
          </div>
        </div>

        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>}

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ══════ ACASA ══════ */}
          {tab === 'Acasă' && (
            <div>
              <div className="mb-5">
                <h1 className="text-xl font-bold text-gray-900">Bună ziua, {service?.name}! 👋</h1>
                <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Alert profil incomplet */}
              {(!pf.description || !pf.phone || !pf.address) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <div className="font-bold text-amber-800 text-sm">Profilul tău e incomplet</div>
                    <div className="text-amber-600 text-xs mt-0.5">Adaugă descriere, telefon și adresă pentru a apărea în căutări.</div>
                  </div>
                  <button onClick={() => setTab('Profil public')} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer">
                    Completează →
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Cereri noi', value: stats.cereri, icon: '📋', color: 'bg-blue-50 border-blue-100 text-blue-700', action: 'Cereri' },
                  { label: 'Programări azi', value: stats.aptsAzi, icon: '📅', color: 'bg-green-50 border-green-100 text-green-700', action: 'Programări' },
                  { label: 'Oferte active', value: stats.oferteActive, icon: '💬', color: 'bg-purple-50 border-purple-100 text-purple-700', action: 'Oferte trimise' },
                  { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) + ' ⭐' : 'Nou', icon: '⭐', color: 'bg-yellow-50 border-yellow-100 text-yellow-700', action: 'Recenzii' },
                ].map(s => (
                  <button key={s.label} onClick={() => setTab(s.action)} className={`${s.color} border rounded-2xl p-4 text-left hover:shadow-sm transition-all cursor-pointer`}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-black mb-0.5">{s.value}</div>
                    <div className="text-xs font-medium opacity-70">{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Cereri recente */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900">Cereri noi în {service?.city}</h2>
                  <button onClick={() => setTab('Cereri')} className="text-xs text-[#4A90D9] font-semibold border-none bg-transparent cursor-pointer">
                    Vezi toate →
                  </button>
                </div>
                {requests.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">Nicio cerere activă momentan.</div>
                ) : (
                  requests.slice(0, 3).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{r.car_brand} {r.car_model} {r.car_year ? `· ${r.car_year}` : ''}</div>
                        <div className="text-xs text-gray-400">{r.services?.join(', ')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${URGENCY_COLORS[r.urgency] || 'bg-gray-100 text-gray-600'}`}>{r.urgency}</span>
                        <button onClick={() => { setSelectedRequest(r); setTab('Cereri') }}
                          className="text-xs bg-[#4A90D9] text-white px-3 py-1.5 rounded-lg font-semibold border-none cursor-pointer hover:bg-[#3378c0]">
                          Trimite ofertă
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Programari azi */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900">Programări azi</h2>
                  <button onClick={() => setTab('Programări')} className="text-xs text-[#4A90D9] font-semibold border-none bg-transparent cursor-pointer">Calendar →</button>
                </div>
                {appointments.filter(a => a.scheduled_date === today).length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">Nicio programare astăzi.</div>
                ) : appointments.filter(a => a.scheduled_date === today).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                    <div>
                      <div className="font-semibold text-sm">{a.scheduled_time}</div>
                      <div className="text-xs text-gray-400">{a.notes || 'Programare'}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[aptStatuses[a.id]||a.status] || 'bg-gray-100 text-gray-600'}`}>
                      {(aptStatuses[a.id]||a.status)?.replace('_',' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════ PROFIL PUBLIC ══════ */}
          {tab === 'Profil public' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Profilul public al service-ului</h1>
                  <p className="text-gray-400 text-sm mt-1">Aceste informații apar pe pagina publică și în rezultatele de căutare.</p>
                </div>
                <div className="flex gap-2">
                  {service?.id && <a href={`/service/${service.id}`} target="_blank" className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 no-underline hover:border-gray-400">👁️ Previzualizează</a>}
                  <button onClick={saveProfile} disabled={profileSaving}
                    className={`px-5 py-2 font-bold rounded-xl text-sm border-none cursor-pointer ${profileSaved ? 'bg-green-500 text-white' : 'bg-[#4A90D9] text-white hover:bg-[#3378c0]'}`}>
                    {profileSaved ? '✅ Salvat!' : profileSaving ? 'Se salvează...' : 'Salvează profilul'}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Informatii de baza */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">📋 Informații de bază</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Numele service-ului *', placeholder: 'AutoPro Service SRL', type: 'text' },
                      { key: 'slug', label: 'URL personalizat (opțional)', placeholder: 'autopro-service', type: 'text', prefix: 'reparo.ro/service/' },
                      { key: 'phone', label: 'Telefon *', placeholder: '07xx xxx xxx', type: 'tel' },
                      { key: 'email', label: 'Email contact', placeholder: 'contact@service.ro', type: 'email' },
                      { key: 'website', label: 'Website', placeholder: 'https://service-ul-meu.ro', type: 'url' },
                      { key: 'facebook_url', label: 'Pagină Facebook', placeholder: 'https://facebook.com/...', type: 'url' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        {f.prefix ? (
                          <div className="flex">
                            <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs text-gray-400 flex items-center">{f.prefix}</span>
                            <input type={f.type} value={pf[f.key]} onChange={e => setPf(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                              className="flex-1 px-3 py-2.5 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                          </div>
                        ) : (
                          <input type={f.type} value={pf[f.key]} onChange={e => setPf(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descriere service *</label>
                      <textarea value={pf.description} onChange={e => setPf(p => ({...p, description: e.target.value}))} rows={4}
                        placeholder="Descrie service-ul tău: specializări, echipamente, experiență, avantaje față de concurență..."
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50 resize-none"/>
                    </div>
                  </div>
                </div>

                {/* Locatie */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">📍 Locație</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'address', label: 'Adresa completă *', placeholder: 'Str. Exemplu nr. 10, Sector 2', type: 'text' },
                      { key: 'postal_code', label: 'Cod poștal', placeholder: '021234', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        <input type={f.type} value={pf[f.key]} onChange={e => setPf(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Oraș *</label>
                        <input value={pf.city} onChange={e => setPf(p => ({...p, city: e.target.value}))} placeholder="București"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Județ</label>
                        <select value={pf.county} onChange={e => setPf(p => ({...p, county: e.target.value}))}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                          <option value="">Selectează</option>
                          {COUNTIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Google Maps embed */}
                    {pf.address && pf.city && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Previzualizare hartă</label>
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(pf.address + ', ' + pf.city + ', Romania')}&output=embed&z=16`}
                            width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy"/>
                        </div>
                        <a href={`https://maps.google.com/maps?q=${encodeURIComponent(pf.address + ', ' + pf.city)}`} target="_blank"
                          className="text-xs text-[#4A90D9] mt-1 block no-underline">
                          🗺️ Verifică locația pe Google Maps →
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Program lucru */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">🕐 Program de lucru</h3>
                  <div className="space-y-2">
                    {Object.entries(pf.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-600 w-8">{day}</span>
                        <input value={hours} onChange={e => setPf(p => ({...p, opening_hours: {...p.opening_hours, [day]: e.target.value}}))}
                          placeholder="08:00-18:00 sau Închis"
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specializari */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">🚗 Specializări & restricții</h3>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipuri combustibil acceptate</label>
                    <div className="flex flex-wrap gap-2">
                      {['Benzină', 'Diesel', 'Hybrid', 'Electric', 'GPL'].map(fuel => (
                        <button key={fuel} onClick={() => toggleFuel(fuel)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${pf.fuel_types.includes(fuel) ? 'bg-[#E6F0FB] border-[#4A90D9] text-[#1a5fa8]' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                          {fuel}
                        </button>
                      ))}
                    </div>
                    {pf.fuel_types.length === 0 && <p className="text-xs text-gray-400 mt-1">Niciun filtru = acceptă toate tipurile</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">An minim acceptat</label>
                    <input type="number" value={pf.min_year_accepted} onChange={e => setPf(p => ({...p, min_year_accepted: e.target.value}))}
                      placeholder="ex: 2005 (lasă gol pentru toate)"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Garanție lucrări (luni)</label>
                    <select value={pf.warranty_months} onChange={e => setPf(p => ({...p, warranty_months: e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                      {['0','3','6','12','24','36'].map(m => <option key={m} value={m}>{m === '0' ? 'Fără garanție' : `${m} luni`}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2 mb-4">
                    {[
                      { key: 'is_authorized_rar', label: '🛡️ Service autorizat RAR' },
                      { key: 'has_itp', label: '✅ Efectuează ITP pe loc' },
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" checked={pf[opt.key]} onChange={e => setPf(p => ({...p, [opt.key]: e.target.checked}))} className="accent-[#4A90D9] w-4 h-4"/>
                        <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Mărci acceptate ({pf.brands_accepted.length === 0 ? 'toate' : pf.brands_accepted.length + ' selectate'})
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50">
                      <button onClick={() => setPf(p => ({...p, brands_accepted: []}))}
                        className={`text-xs px-2 py-1 rounded-lg m-0.5 border cursor-pointer transition-all ${pf.brands_accepted.length === 0 ? 'bg-[#4A90D9] text-white border-[#4A90D9]' : 'bg-white border-gray-200 text-gray-500'}`}>
                        Toate mărcile
                      </button>
                      {ALL_BRANDS.filter(b => b !== 'Toate mărcile').map(brand => (
                        <button key={brand} onClick={() => toggleBrand(brand)}
                          className={`text-xs px-2 py-1 rounded-lg m-0.5 border cursor-pointer transition-all ${pf.brands_accepted.includes(brand) ? 'bg-[#E6F0FB] border-[#4A90D9] text-[#1a5fa8] font-semibold' : 'bg-white border-gray-200 text-gray-500'}`}>
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={saveProfile} disabled={profileSaving}
                  className={`px-8 py-3 font-bold rounded-xl text-sm border-none cursor-pointer ${profileSaved ? 'bg-green-500 text-white' : 'bg-[#4A90D9] text-white hover:bg-[#3378c0]'}`}>
                  {profileSaved ? '✅ Profil salvat cu succes!' : profileSaving ? 'Se salvează...' : 'Salvează toate modificările →'}
                </button>
              </div>
            </div>
          )}

          {/* ══════ SERVICII OFERITE ══════ */}
          {tab === 'Servicii oferite' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Servicii oferite</h1>
                  <p className="text-gray-400 text-sm">Adaugă serviciile cu prețuri — clienții le văd pe profilul tău.</p>
                </div>
              </div>

              {/* Adaugă serviciu */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
                <h3 className="font-bold text-gray-900 mb-4">+ Adaugă serviciu nou</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Serviciu *</label>
                    <select value={newOffering.name} onChange={e => setNewOffering(p => ({...p, name: e.target.value, category: e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                      <option value="">Selectează serviciul</option>
                      {ALL_SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Preț de la (RON)</label>
                    <input type="number" value={newOffering.price_from} onChange={e => setNewOffering(p => ({...p, price_from: e.target.value}))}
                      placeholder="100" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Preț până la (RON)</label>
                    <input type="number" value={newOffering.price_to} onChange={e => setNewOffering(p => ({...p, price_to: e.target.value}))}
                      placeholder="250" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Durată (minute)</label>
                    <input type="number" value={newOffering.duration_min} onChange={e => setNewOffering(p => ({...p, duration_min: e.target.value}))}
                      placeholder="60" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Detalii suplimentare</label>
                    <input value={newOffering.description} onChange={e => setNewOffering(p => ({...p, description: e.target.value}))}
                      placeholder="ex: include filtrul de ulei, verificare nivel lichide..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                  </div>
                </div>
                <button onClick={addOffering} disabled={!newOffering.name || addingOffering}
                  className="px-6 py-2.5 bg-[#4A90D9] text-white font-bold rounded-xl text-sm border-none cursor-pointer hover:bg-[#3378c0] disabled:opacity-50">
                  {addingOffering ? 'Se adaugă...' : '+ Adaugă serviciu'}
                </button>
              </div>

              {/* Lista servicii */}
              {offerings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">🔧</div>
                  <div className="font-medium">Niciun serviciu adăugat</div>
                  <p className="text-sm mt-1">Adaugă serviciile pentru a apărea mai bine în căutări.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {offerings.map(o => (
                    <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#E6F0FB] rounded-xl flex items-center justify-center text-lg">🔧</div>
                        <div>
                          <div className="font-semibold text-gray-900">{o.name}</div>
                          {o.description && <div className="text-xs text-gray-400 mt-0.5">{o.description}</div>}
                          {o.duration_min && <div className="text-xs text-gray-400">⏱️ ~{o.duration_min} min</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {(o.price_from || o.price_to) && (
                            <div className="font-black text-gray-900">
                              {o.price_from && o.price_to ? `${o.price_from} – ${o.price_to} RON` : o.price_from ? `de la ${o.price_from} RON` : `până la ${o.price_to} RON`}
                            </div>
                          )}
                        </div>
                        <button onClick={() => deleteOffering(o.id)} className="text-red-300 hover:text-red-500 text-lg border-none bg-transparent cursor-pointer">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════ CERERI ══════ */}
          {tab === 'Cereri' && (
            <div className="flex gap-4">
              <div className={`${selectedRequest ? 'hidden md:block md:w-80' : 'w-full'} flex-shrink-0`}>
                <h1 className="text-xl font-bold text-gray-900 mb-4">Cereri în {service?.city}</h1>
                {requests.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="text-gray-500 font-medium">Nicio cerere activă</div>
                    <p className="text-gray-400 text-sm mt-1">Vei fi notificat când apar cereri noi.</p>
                  </div>
                ) : requests.map(r => (
                  <button key={r.id} onClick={() => setSelectedRequest(r)}
                    className={`w-full text-left bg-white rounded-2xl border p-4 mb-2 hover:border-[#4A90D9] transition-all cursor-pointer ${selectedRequest?.id === r.id ? 'border-[#4A90D9] shadow-sm' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{r.car_brand} {r.car_model} {r.car_year ? `(${r.car_year})` : ''}</div>
                        <div className="text-xs text-gray-400">{r.car_fuel}{r.car_km ? ` · ${r.car_km.toLocaleString()} km` : ''}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${URGENCY_COLORS[r.urgency] || 'bg-gray-100 text-gray-600'}`}>{r.urgency}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {r.services?.map(s => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                    {r.description && <p className="text-xs text-gray-500 line-clamp-2">{r.description}</p>}
                    <div className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('ro-RO')}</div>
                  </button>
                ))}
              </div>

              {selectedRequest && (
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-900">Detalii cerere</h2>
                      <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 md:hidden border-none bg-transparent cursor-pointer text-xl">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        ['Mașina', `${selectedRequest.car_brand} ${selectedRequest.car_model} ${selectedRequest.car_year || ''}`],
                        ['Combustibil', selectedRequest.car_fuel || '—'],
                        ['Kilometraj', selectedRequest.car_km ? `${selectedRequest.car_km.toLocaleString()} km` : '—'],
                        ['Urgență', selectedRequest.urgency],
                        ['Data preferată', selectedRequest.preferred_date || '—'],
                        ['Interval orar', selectedRequest.preferred_time || '—'],
                        ['Contact', selectedRequest.contact_name || '—'],
                        ['Telefon', selectedRequest.contact_phone || '—'],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                          <div className="font-semibold text-sm text-gray-800">{v}</div>
                        </div>
                      ))}
                    </div>
                    {selectedRequest.services?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-1.5">Servicii cerute</div>
                        <div className="flex flex-wrap gap-1.5">{selectedRequest.services.map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>)}</div>
                      </div>
                    )}
                    {selectedRequest.description && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="text-xs font-bold text-amber-700 mb-1">Descriere problemă</div>
                        <p className="text-sm text-amber-800">{selectedRequest.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Trimite ofertă</h2>
                    {offerSent ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">✅</div>
                        <div className="font-bold text-green-700">Oferta a fost trimisă!</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {[['price_total','Preț total (RON)'],['price_parts','Piese (RON)'],['price_labor','Manoperă (RON)']].map(([k,l]) => (
                            <div key={k}>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{l}</label>
                              <input type="number" value={offerForm[k]} onChange={e => setOfferForm(p => ({...p, [k]: e.target.value}))} placeholder="0"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descriere ofertă</label>
                          <textarea value={offerForm.description} onChange={e => setOfferForm(p => ({...p, description: e.target.value}))} rows={3}
                            placeholder="Detalii despre lucrare, piese incluse..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50 resize-none"/>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Data disponibilă</label>
                            <input type="date" value={offerForm.available_date} onChange={e => setOfferForm(p => ({...p, available_date: e.target.value}))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interval orar</label>
                            <select value={offerForm.available_time} onChange={e => setOfferForm(p => ({...p, available_time: e.target.value}))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                              {['08:00-10:00','09:00-12:00','10:00-13:00','12:00-15:00','14:00-17:00','15:00-18:00'].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Garanție (luni)</label>
                            <select value={offerForm.warranty_months} onChange={e => setOfferForm(p => ({...p, warranty_months: e.target.value}))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                              {['0','3','6','12','24'].map(m => <option key={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <button onClick={sendOffer} disabled={offerLoading}
                          className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm border-none cursor-pointer hover:bg-[#e55a26] disabled:opacity-50">
                          {offerLoading ? 'Se trimite...' : '✉️ Trimite oferta'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ PROGRAMARI ══════ */}
          {tab === 'Programări' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">Calendar programări</h1>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth()-1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                    <span className="font-bold text-gray-900">{calMonth.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth()+1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {['Lu','Ma','Mi','Jo','Vi','Sâ','Du'].map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`}/>)}
                    {Array.from({length: daysInMonth}).map((_,i) => {
                      const day = i+1
                      const apts = aptsForDay(day)
                      const isToday = day === new Date().getDate() && calMonth.getMonth() === new Date().getMonth() && calMonth.getFullYear() === new Date().getFullYear()
                      return (
                        <div key={day} className={`text-center py-1.5 rounded-lg cursor-default ${isToday ? 'bg-[#4A90D9] text-white font-bold' : apts.length > 0 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                          <div className={`text-xs ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</div>
                          {apts.length > 0 && <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${isToday ? 'bg-white' : 'bg-[#FF6B35]'}`}/>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                      <div className="text-4xl mb-3">📅</div>Nicio programare
                    </div>
                  ) : appointments.map(a => (
                    <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-sm text-gray-900">
                            {new Date(a.scheduled_date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })} · {a.scheduled_time}
                          </div>
                          {a.notes && <div className="text-xs text-gray-400 mt-0.5">{a.notes}</div>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[aptStatuses[a.id]||a.status] || 'bg-gray-100 text-gray-600'}`}>
                          {(aptStatuses[a.id]||a.status)?.replace('_',' ')}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {[{s:'in_asteptare',l:'⏳ Așteptare'},{s:'confirmata',l:'✅ Confirmată'},{s:'in_lucru',l:'🔧 În lucru'},{s:'finalizata',l:'🏁 Finalizată'}].map(opt => (
                          <button key={opt.s} onClick={() => updateAptStatus(a.id, opt.s)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium border cursor-pointer transition-all ${(aptStatuses[a.id]||a.status) === opt.s ? 'bg-[#4A90D9] text-white border-[#4A90D9]' : 'border-gray-200 text-gray-500 hover:border-[#4A90D9] hover:text-[#4A90D9] bg-white'}`}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                      {/* Trimite update client */}
                      {workUpdateApt === a.id ? (
                        <div className="flex gap-2">
                          <input value={workUpdateText} onChange={e => setWorkUpdateText(e.target.value)} placeholder="ex: Mașina e gata, poți veni oricând..."
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9]"/>
                          <button onClick={() => sendWorkUpdate(a.id)} className="px-4 py-2 bg-[#4A90D9] text-white text-xs font-bold rounded-xl border-none cursor-pointer">Trimite</button>
                          <button onClick={() => setWorkUpdateApt(null)} className="px-3 py-2 border border-gray-200 text-xs rounded-xl border-solid cursor-pointer">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setWorkUpdateApt(a.id)} className="text-xs text-[#4A90D9] font-semibold border-none bg-transparent cursor-pointer">
                          📱 Trimite update clientului
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════ OFERTE TRIMISE ══════ */}
          {tab === 'Oferte trimise' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">Oferte trimise</h1>
              {offers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="text-gray-500 font-medium">Nicio ofertă trimisă</div>
                  <button onClick={() => setTab('Cereri')} className="mt-3 text-sm text-[#4A90D9] font-semibold border-none bg-transparent cursor-pointer">
                    Vezi cererile disponibile →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map(o => (
                    <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{o.price_total ? `${o.price_total.toLocaleString()} RON` : 'Preț negociabil'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        {o.description && <div className="text-xs text-gray-500 mt-1">{o.description.substring(0,60)}{o.description.length > 60 ? '...' : ''}</div>}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold flex-shrink-0 ${o.status === 'acceptata' ? 'bg-green-100 text-green-700' : o.status === 'refuzata' ? 'bg-red-100 text-red-500' : o.status === 'expirata' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700'}`}>
                        {o.status === 'trimisa' ? '🆕 Trimisă' : o.status === 'acceptata' ? '✅ Acceptată' : o.status === 'refuzata' ? '❌ Refuzată' : '⏰ Expirată'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════ RECENZII ══════ */}
          {tab === 'Recenzii' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Recenzii</h1>
                {service?.rating_count > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-black text-yellow-600">{service.rating_avg.toFixed(1)}</span>
                    <div>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= Math.round(service.rating_avg) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                      <div className="text-xs text-gray-400">{service.rating_count} recenzii</div>
                    </div>
                  </div>
                )}
              </div>
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">⭐</div>Nicio recenzie încă.
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('ro-RO')}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 mb-3">{r.comment}</p>}
                  {r.reply_text ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <div className="text-xs font-bold text-blue-700 mb-1">Răspunsul tău</div>
                      <p className="text-sm text-blue-800">{r.reply_text}</p>
                    </div>
                  ) : replyingTo === r.id ? (
                    <div>
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} placeholder="Răspunsul tău..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] resize-none mb-2"/>
                      <div className="flex gap-2">
                        <button onClick={() => sendReply(r.id)} className="px-4 py-1.5 bg-[#4A90D9] text-white text-xs font-bold rounded-lg border-none cursor-pointer">Trimite</button>
                        <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg cursor-pointer bg-white">Anulează</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyingTo(r.id)} className="text-xs text-[#4A90D9] font-semibold border-none bg-transparent cursor-pointer">
                      + Răspunde la recenzie
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══════ SETARI ══════ */}
          {tab === 'Setări' && (
            <div className="max-w-xl">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Setări cont</h1>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Plan abonament</h3>
                <div className={`p-4 rounded-xl mb-4 ${service?.plan === 'pro' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="font-bold text-lg">{service?.plan === 'pro' ? '⭐ Plan Pro' : '🔓 Plan Free'}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {service?.plan === 'free' ? 'Treci la Pro pentru vizibilitate crescută, anunțuri promovate și statistici detaliate.' : 'Ai acces la toate funcțiile platformei.'}
                  </div>
                </div>
                {service?.plan === 'free' && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { plan: 'Basic', price: '99 RON/lună', features: ['Profil complet', 'Cereri din oraș', 'Calendar'] },
                      { plan: 'Pro', price: '199 RON/lună', features: ['Tot din Basic', 'Anunțuri promovate', 'Statistici avansate', 'Badge Pro', 'Prioritate în căutări'] },
                    ].map(p => (
                      <div key={p.plan} className={`p-4 rounded-xl border ${p.plan === 'Pro' ? 'border-[#4A90D9] bg-[#E6F0FB]' : 'border-gray-200'}`}>
                        <div className="font-bold text-gray-900 mb-1">{p.plan}</div>
                        <div className="font-black text-lg text-[#4A90D9] mb-2">{p.price}</div>
                        {p.features.map(f => <div key={f} className="text-xs text-gray-600 mb-0.5">✓ {f}</div>)}
                        <button className={`w-full mt-3 py-2 rounded-xl text-xs font-bold border-none cursor-pointer ${p.plan === 'Pro' ? 'bg-[#4A90D9] text-white' : 'bg-gray-200 text-gray-600'}`}>
                          Alege {p.plan}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Notificări</h3>
                {[
                  { label: 'Cerere nouă în zona mea', desc: 'Primești notificare când apare o cerere în orașul tău', default: true },
                  { label: 'Programare confirmată', desc: 'Când un client acceptă oferta ta', default: true },
                  { label: 'Recenzie nouă', desc: 'Când un client lasă o recenzie', default: true },
                  { label: 'Noutăți Reparo', desc: 'Funcții noi și sfaturi pentru service', default: false },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-none">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{n.label}</div>
                      <div className="text-xs text-gray-400">{n.desc}</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: n.default ? '#4A90D9' : '#e0e0e0', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: n.default ? 22 : 2, transition: 'left 0.2s' }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <h3 className="font-bold text-red-700 mb-2">Zona periculoasă</h3>
                <p className="text-sm text-red-500 mb-3">Dezactivează profilul temporar sau șterge contul de service.</p>
                <div className="flex gap-2">
                  <button onClick={async () => { await supabase.from('services').update({ is_active: false }).eq('id', service?.id); alert('Profilul a fost dezactivat.') }}
                    className="px-4 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-xl cursor-pointer bg-white">
                    Dezactivează profilul
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
