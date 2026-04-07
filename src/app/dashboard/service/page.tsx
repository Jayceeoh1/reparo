'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = { id: string; full_name: string | null; city: string | null; role: string }
type Service = { id: string; name: string; city: string | null; rating_avg: number; rating_count: number; is_verified: boolean; plan: string; phone: string | null; address: string | null }
type QuoteRequest = { id: string; car_brand: string | null; car_model: string | null; car_year: number | null; car_fuel: string | null; car_km: number | null; services: string[] | null; description: string | null; urgency: string; preferred_date: string | null; preferred_time: string | null; contact_name: string | null; contact_phone: string | null; created_at: string; offers_count: number }
type Appointment = { id: string; scheduled_date: string; scheduled_time: string; status: string; notes: string | null; user_id: string }
type Review = { id: string; rating: number; comment: string | null; created_at: string; reply_text: string | null }
type Offer = { id: string; request_id: string; price_total: number | null; status: string; created_at: string }

const TABS = ['Acasă', 'Cereri', 'Programări', 'Oferte trimise', 'Recenzii', 'Profil']
const URGENCY_COLOR: Record<string, string> = { flexibil: 'bg-green-100 text-green-700', saptamana: 'bg-yellow-100 text-yellow-700', urgent: 'bg-red-100 text-red-700' }
const STATUS_COLOR: Record<string, string> = { in_asteptare: 'bg-yellow-100 text-yellow-700', confirmata: 'bg-blue-100 text-blue-700', in_lucru: 'bg-purple-100 text-purple-700', finalizata: 'bg-green-100 text-green-700', anulata: 'bg-red-100 text-red-700' }

export default function ServiceDashboard() {
  const [tab, setTab] = useState('Acasă')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null)
  const [offerForm, setOfferForm] = useState({ price_total: '', price_parts: '', price_labor: '', description: '', available_date: '', available_time: '09:00-12:00', warranty_months: '6' })
  const [offerLoading, setOfferLoading] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [calMonth, setCalMonth] = useState(new Date())
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', city: '', description: '', website: '', facebook_url: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [appointmentStatus, setAppointmentStatus] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: svc } = await supabase.from('services').select('*').eq('owner_id', user.id).single()
      if (svc) {
        setService(svc)
        setProfileForm({ name: svc.name || '', phone: svc.phone || '', address: svc.address || '', city: svc.city || '', description: svc.description || '', website: svc.website || '', facebook_url: svc.facebook_url || '' })

        // Cereri din oras
        const { data: reqs } = await supabase.from('quote_requests').select('*').eq('city', svc.city || '').eq('status', 'activa').order('created_at', { ascending: false }).limit(50)
        setRequests(reqs || [])

        // Programari
        const { data: apts } = await supabase.from('appointments').select('*').eq('service_id', svc.id).order('scheduled_date', { ascending: true })
        setAppointments(apts || [])
        const statusMap: Record<string, string> = {}
        apts?.forEach(a => { statusMap[a.id] = a.status })
        setAppointmentStatus(statusMap)

        // Recenzii
        const { data: revs } = await supabase.from('reviews').select('*').eq('service_id', svc.id).order('created_at', { ascending: false })
        setReviews(revs || [])

        // Oferte trimise
        const { data: offs } = await supabase.from('offers').select('*').eq('service_id', svc.id).order('created_at', { ascending: false })
        setOffers(offs || [])

        // Notificari necitite
        const { count } = await supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_read', false)
        setNotifCount(count || 0)
      } else {
        // Nu are service creat inca — cream unul default
        const { data: newSvc } = await supabase.from('services').insert({ owner_id: user.id, name: prof?.full_name || 'Service-ul meu', city: prof?.city || 'Bucuresti', is_active: true, plan: 'free' }).select().single()
        setService(newSvc)
        if (newSvc) setProfileForm(f => ({ ...f, name: newSvc.name, city: newSvc.city || '' }))
      }
      setLoading(false)
    }
    load()

    // Realtime: cereri noi
    const channel = supabase.channel('new-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quote_requests' }, payload => {
        setRequests(prev => [payload.new as QuoteRequest, ...prev])
        setNotifCount(c => c + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function sendOffer() {
    if (!service || !selectedRequest) return
    setOfferLoading(true)
    const { error } = await supabase.from('offers').insert({
      request_id: selectedRequest.id,
      service_id: service.id,
      price_total: offerForm.price_total ? parseFloat(offerForm.price_total) : null,
      price_parts: offerForm.price_parts ? parseFloat(offerForm.price_parts) : null,
      price_labor: offerForm.price_labor ? parseFloat(offerForm.price_labor) : null,
      description: offerForm.description,
      available_date: offerForm.available_date || null,
      available_time: offerForm.available_time,
      warranty_months: parseInt(offerForm.warranty_months),
      status: 'trimisa',
    })
    if (!error) {
      setOfferSent(true)
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id))
      setTimeout(() => { setSelectedRequest(null); setOfferSent(false); setOfferForm({ price_total: '', price_parts: '', price_labor: '', description: '', available_date: '', available_time: '09:00-12:00', warranty_months: '6' }) }, 1500)
    }
    setOfferLoading(false)
  }

  async function updateAppointmentStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointmentStatus(prev => ({ ...prev, [id]: status }))
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    // Adauga work update
    if (service) {
      await supabase.from('work_updates').insert({ appointment_id: id, service_id: service.id, status, message: `Statusul a fost actualizat la: ${status}` })
    }
  }

  async function sendReply(reviewId: string) {
    await supabase.from('reviews').update({ reply_text: replyText, reply_at: new Date().toISOString() }).eq('id', reviewId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply_text: replyText } : r))
    setReplyingTo(null)
    setReplyText('')
  }

  async function saveProfile() {
    if (!service) return
    setProfileSaving(true)
    await supabase.from('services').update({ name: profileForm.name, phone: profileForm.phone, address: profileForm.address, city: profileForm.city, description: profileForm.description, website: profileForm.website, facebook_url: profileForm.facebook_url }).eq('id', service.id)
    setService(s => s ? { ...s, ...profileForm, name: profileForm.name } : s)
    setProfileSaving(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/home'
  }

  // Calendar helpers
  function getDaysInMonth(date: Date) {
    const year = date.getFullYear(), month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay: firstDay === 0 ? 6 : firstDay - 1, daysInMonth }
  }

  function getAppointmentsForDay(day: number) {
    const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.filter(a => a.scheduled_date === dateStr)
  }

  const { firstDay, daysInMonth } = getDaysInMonth(calMonth)
  const today = new Date()

  const stats = {
    cereriNoi: requests.length,
    programariAzi: appointments.filter(a => a.scheduled_date === today.toISOString().split('T')[0]).length,
    oferteActive: offers.filter(o => o.status === 'trimisa').length,
    rating: service?.rating_avg || 0,
    reviews: service?.rating_count || 0,
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-400 text-sm">Se încarcă dashboard-ul...</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOPBAR */}
      <div className="bg-[#1a2332] px-4 md:px-8 py-0 flex items-center justify-between h-14 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(o => !o)} className="md:hidden text-white/60 hover:text-white mr-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <a href="/home" className="flex items-center gap-2 text-white font-black text-lg tracking-tight">
            <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
            <span className="hidden sm:block">Reparo</span>
          </a>
          <span className="text-white/20 hidden md:block">|</span>
          <span className="text-white/50 text-xs hidden md:block">Dashboard Service</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notificari */}
          <div className="relative cursor-pointer" onClick={() => setNotifCount(0)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C7.2 2 5 4.2 5 7V11L3.5 13H16.5L15 11V7C15 4.2 12.8 2 10 2Z" stroke="white" strokeWidth="1.4" fill="none"/><path d="M8 15C8 16.1 8.9 17 10 17C11.1 17 12 16.1 12 15" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
            {notifCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">{notifCount}</span>}
          </div>
          <div className="w-7 h-7 bg-[#4A90D9] rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer" title={profile?.full_name || ''}>
            {profile?.full_name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <button onClick={signOut} className="text-white/40 hover:text-white/80 text-xs hidden md:block transition-colors">Ieși</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 md:z-auto w-56 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-56px)] top-14 md:top-0 transition-transform duration-200`}>
          <div className="p-4 border-b border-gray-50">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Service</div>
            <div className="text-sm font-bold text-gray-800 truncate">{service?.name || 'Numele service-ului'}</div>
            <div className="text-xs text-gray-400">{service?.city || 'Oraș'}</div>
            <div className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${service?.plan === 'pro' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
              {service?.plan === 'pro' ? '⭐ Pro' : '🔓 Free'}
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {[
              { name: 'Acasă', icon: 'M3 9.5L10 3L17 9.5V18H13V13H7V18H3V9.5Z' },
              { name: 'Cereri', icon: 'M4 4H16V14H4V4ZM4 4L10 10L16 4', badge: requests.length },
              { name: 'Programări', icon: 'M3 5H17V17H3V5ZM7 3V5M13 3V5M3 9H17', badge: appointments.filter(a => ['in_asteptare', 'confirmata', 'in_lucru'].includes(a.status)).length },
              { name: 'Oferte trimise', icon: 'M2 4L10 9L18 4M2 4H18V16H2V4Z', badge: offers.filter(o => o.status === 'trimisa').length },
              { name: 'Recenzii', icon: 'M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z', badge: reviews.length },
              { name: 'Profil', icon: 'M10 10C12.2 10 14 8.2 14 6C14 3.8 12.2 2 10 2C7.8 2 6 3.8 6 6C6 8.2 7.8 10 10 10ZM2 18C2 14.7 5.6 12 10 12C14.4 12 18 14.7 18 18' },
            ].map(item => (
              <button key={item.name} onClick={() => { setTab(item.name); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${tab === item.name ? 'bg-[#E6F0FB] text-[#4A90D9]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === item.name ? 'bg-[#4A90D9] text-white' : 'bg-gray-200 text-gray-600'}`}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-50">
            <a href="/home" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 10L10 3L17 10M5 8V17H9V13H11V17H15V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Vezi site-ul public
            </a>
          </div>
        </div>

        {/* Overlay mobile sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ═══════════════════════════════════════════ ACASA ═══ */}
          {tab === 'Acasă' && (
            <div>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Bună ziua, {service?.name}! 👋</h1>
                <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Cereri noi', value: stats.cereriNoi, icon: '📋', color: 'bg-blue-50 border-blue-100 text-blue-700', action: () => setTab('Cereri') },
                  { label: 'Programări azi', value: stats.programariAzi, icon: '📅', color: 'bg-green-50 border-green-100 text-green-700', action: () => setTab('Programări') },
                  { label: 'Oferte active', value: stats.oferteActive, icon: '💬', color: 'bg-purple-50 border-purple-100 text-purple-700', action: () => setTab('Oferte trimise') },
                  { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) + ' ⭐' : 'Nou', icon: '⭐', color: 'bg-yellow-50 border-yellow-100 text-yellow-700', action: () => setTab('Recenzii') },
                ].map(s => (
                  <button key={s.label} onClick={s.action} className={`${s.color} border rounded-2xl p-4 text-left hover:shadow-sm transition-all`}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-black mb-0.5">{s.value}</div>
                    <div className="text-xs font-medium opacity-70">{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Cereri recente */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Cereri recente în {service?.city}</h2>
                  <button onClick={() => setTab('Cereri')} className="text-xs text-[#4A90D9] font-semibold hover:underline">Vezi toate →</button>
                </div>
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Nu există cereri active în zona ta momentan.</div>
                ) : (
                  <div className="space-y-3">
                    {requests.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{r.car_brand} {r.car_model} {r.car_year ? `· ${r.car_year}` : ''}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{r.services?.join(', ') || 'Serviciu nespecificat'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${URGENCY_COLOR[r.urgency] || 'bg-gray-100 text-gray-600'}`}>{r.urgency}</span>
                          <button onClick={() => { setSelectedRequest(r); setTab('Cereri') }} className="text-xs bg-[#4A90D9] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#3378c0] transition-colors">
                            Trimite ofertă
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Programari azi */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Programări azi</h2>
                  <button onClick={() => setTab('Programări')} className="text-xs text-[#4A90D9] font-semibold hover:underline">Calendar →</button>
                </div>
                {appointments.filter(a => a.scheduled_date === today.toISOString().split('T')[0]).length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">Nicio programare pentru astăzi.</div>
                ) : (
                  appointments.filter(a => a.scheduled_date === today.toISOString().split('T')[0]).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{a.scheduled_time}</div>
                        <div className="text-xs text-gray-400">{a.notes || 'Programare confirmat'}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status.replace('_', ' ')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ CERERI ═══ */}
          {tab === 'Cereri' && (
            <div className="flex gap-4 h-full">
              {/* Lista cereri */}
              <div className={`${selectedRequest ? 'hidden md:block md:w-80' : 'w-full'} flex-shrink-0`}>
                <h1 className="text-xl font-bold text-gray-900 mb-4">Cereri de ofertă în {service?.city}</h1>
                {requests.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="text-gray-500 font-medium">Nicio cerere activă momentan</div>
                    <div className="text-gray-400 text-sm mt-1">Vei fi notificat când apar cereri noi în zona ta.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map(r => (
                      <button key={r.id} onClick={() => setSelectedRequest(r)}
                        className={`w-full text-left bg-white rounded-2xl border p-4 hover:border-[#4A90D9] transition-all ${selectedRequest?.id === r.id ? 'border-[#4A90D9] shadow-sm' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{r.car_brand} {r.car_model} {r.car_year ? `(${r.car_year})` : ''}</div>
                            <div className="text-xs text-gray-400">{r.car_fuel} {r.car_km ? `· ${r.car_km.toLocaleString()} km` : ''}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${URGENCY_COLOR[r.urgency] || 'bg-gray-100 text-gray-600'}`}>{r.urgency}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {r.services?.map(s => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>)}
                        </div>
                        {r.description && <p className="text-xs text-gray-500 line-clamp-2">{r.description}</p>}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('ro-RO')}</span>
                          {r.preferred_date && <span className="text-xs text-gray-500">📅 {r.preferred_date} · {r.preferred_time}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detalii cerere + formular oferta */}
              {selectedRequest && (
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-900">Detalii cerere</h2>
                      <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 md:hidden">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      {[
                        { label: 'Mașina', value: `${selectedRequest.car_brand} ${selectedRequest.car_model} ${selectedRequest.car_year || ''}` },
                        { label: 'Combustibil', value: selectedRequest.car_fuel || '—' },
                        { label: 'Kilometraj', value: selectedRequest.car_km ? `${selectedRequest.car_km.toLocaleString()} km` : '—' },
                        { label: 'Urgență', value: selectedRequest.urgency },
                        { label: 'Data preferată', value: selectedRequest.preferred_date || '—' },
                        { label: 'Interval orar', value: selectedRequest.preferred_time || '—' },
                        { label: 'Contact', value: selectedRequest.contact_name || '—' },
                        { label: 'Telefon', value: selectedRequest.contact_phone || '—' },
                      ].map(f => (
                        <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                          <div className="font-semibold text-gray-800 text-sm">{f.value}</div>
                        </div>
                      ))}
                    </div>
                    {selectedRequest.services && selectedRequest.services.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-1.5">Servicii cerute</div>
                        <div className="flex flex-wrap gap-1.5">{selectedRequest.services.map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>)}</div>
                      </div>
                    )}
                    {selectedRequest.description && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="text-xs font-semibold text-amber-700 mb-1">Descriere problemă</div>
                        <p className="text-sm text-amber-800">{selectedRequest.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Formular oferta */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Trimite ofertă</h2>
                    {offerSent ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">✅</div>
                        <div className="font-bold text-green-700">Oferta a fost trimisă!</div>
                        <div className="text-sm text-gray-400 mt-1">Clientul va fi notificat imediat.</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'price_total', label: 'Preț total (RON)' },
                            { key: 'price_parts', label: 'Piese (RON)' },
                            { key: 'price_labor', label: 'Manoperă (RON)' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                              <input type="number" value={offerForm[f.key as keyof typeof offerForm]}
                                onChange={e => setOfferForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                placeholder="0"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descriere ofertă</label>
                          <textarea value={offerForm.description} onChange={e => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3} placeholder="Detalii despre lucrare, piese folosite, garanție..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50 resize-none"/>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Data disponibilă</label>
                            <input type="date" value={offerForm.available_date} onChange={e => setOfferForm(prev => ({ ...prev, available_date: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interval orar</label>
                            <select value={offerForm.available_time} onChange={e => setOfferForm(prev => ({ ...prev, available_time: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                              {['08:00-10:00', '09:00-12:00', '10:00-13:00', '12:00-15:00', '14:00-17:00', '15:00-18:00'].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Garanție (luni)</label>
                            <select value={offerForm.warranty_months} onChange={e => setOfferForm(prev => ({ ...prev, warranty_months: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                              {['0', '3', '6', '12', '24'].map(m => <option key={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <button onClick={sendOffer} disabled={offerLoading}
                          className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors disabled:opacity-50">
                          {offerLoading ? 'Se trimite...' : '✉️ Trimite oferta către client'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ PROGRAMARI ═══ */}
          {tab === 'Programări' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">Calendar programări</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Calendar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                    <span className="font-bold text-gray-900 text-sm">
                      {calMonth.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'].map(d => (
                      <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`}/>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const apts = getAppointmentsForDay(day)
                      const isToday = day === today.getDate() && calMonth.getMonth() === today.getMonth() && calMonth.getFullYear() === today.getFullYear()
                      return (
                        <div key={day} className={`text-center py-1.5 rounded-lg cursor-pointer transition-colors ${isToday ? 'bg-[#4A90D9] text-white font-bold' : apts.length > 0 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                          <div className={`text-xs ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</div>
                          {apts.length > 0 && <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${isToday ? 'bg-white' : 'bg-[#FF6B35]'}`}/>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Lista programari */}
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                      <div className="text-4xl mb-3">📅</div>
                      <div className="text-gray-500 font-medium">Nicio programare încă</div>
                    </div>
                  ) : (
                    appointments.map(a => (
                      <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {new Date(a.scheduled_date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })} · {a.scheduled_time}
                            </div>
                            {a.notes && <div className="text-xs text-gray-400 mt-0.5">{a.notes}</div>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[appointmentStatus[a.id] || a.status] || 'bg-gray-100 text-gray-600'}`}>
                            {(appointmentStatus[a.id] || a.status).replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { s: 'in_asteptare', label: '⏳ Așteptare' },
                            { s: 'confirmata', label: '✅ Confirmată' },
                            { s: 'in_lucru', label: '🔧 În lucru' },
                            { s: 'finalizata', label: '🏁 Finalizată' },
                          ].map(opt => (
                            <button key={opt.s} onClick={() => updateAppointmentStatus(a.id, opt.s)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${(appointmentStatus[a.id] || a.status) === opt.s ? 'bg-[#4A90D9] text-white border-[#4A90D9]' : 'border-gray-200 text-gray-500 hover:border-[#4A90D9] hover:text-[#4A90D9]'}`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ OFERTE ═══ */}
          {tab === 'Oferte trimise' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">Oferte trimise</h1>
              {offers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="text-gray-500 font-medium">Nu ai trimis nicio ofertă încă</div>
                  <button onClick={() => setTab('Cereri')} className="mt-3 text-sm text-[#4A90D9] font-semibold hover:underline">
                    Vezi cererile disponibile →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map(o => (
                    <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {o.price_total ? `${o.price_total.toLocaleString()} RON` : 'Preț negociabil'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(o.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        o.status === 'acceptata' ? 'bg-green-100 text-green-700' :
                        o.status === 'refuzata' ? 'bg-red-100 text-red-700' :
                        o.status === 'expirata' ? 'bg-gray-100 text-gray-500' :
                        'bg-blue-100 text-blue-700'
                      }`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ RECENZII ═══ */}
          {tab === 'Recenzii' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Recenzii</h1>
                {service && service.rating_count > 0 && (
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
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div className="text-4xl mb-3">⭐</div>
                  <div className="text-gray-500 font-medium">Nicio recenzie încă</div>
                  <div className="text-gray-400 text-sm mt-1">Recenziile apar după finalizarea lucrărilor.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('ro-RO')}</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-700 mb-3">{r.comment}</p>}
                      {r.reply_text ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <div className="text-xs font-bold text-blue-700 mb-1">Răspunsul tău</div>
                          <p className="text-sm text-blue-800">{r.reply_text}</p>
                        </div>
                      ) : (
                        replyingTo === r.id ? (
                          <div>
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} placeholder="Scrie un răspuns..."
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] resize-none mb-2"/>
                            <div className="flex gap-2">
                              <button onClick={() => sendReply(r.id)} className="px-4 py-1.5 bg-[#4A90D9] text-white text-xs font-bold rounded-lg hover:bg-[#3378c0] transition-colors">Trimite</button>
                              <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">Anulează</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyingTo(r.id)} className="text-xs text-[#4A90D9] font-semibold hover:underline">
                            + Răspunde la recenzie
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ PROFIL ═══ */}
          {tab === 'Profil' && (
            <div className="max-w-2xl">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Profilul service-ului</h1>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="space-y-4">
                  {[
                    { key: 'name', label: 'Numele service-ului', placeholder: 'AutoPro Service SRL', type: 'text' },
                    { key: 'phone', label: 'Telefon', placeholder: '07xx xxx xxx', type: 'tel' },
                    { key: 'address', label: 'Adresă', placeholder: 'Str. Exemplu nr. 10', type: 'text' },
                    { key: 'city', label: 'Oraș', placeholder: 'București', type: 'text' },
                    { key: 'website', label: 'Website (opțional)', placeholder: 'https://service-ul-meu.ro', type: 'url' },
                    { key: 'facebook_url', label: 'Facebook (opțional)', placeholder: 'https://facebook.com/...', type: 'url' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                      <input type={f.type} value={profileForm[f.key as keyof typeof profileForm]}
                        onChange={e => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descriere service</label>
                    <textarea value={profileForm.description} onChange={e => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4} placeholder="Descrie service-ul tău, specializările și avantajele față de concurență..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50 resize-none"/>
                  </div>

                  <button onClick={saveProfile} disabled={profileSaving}
                    className={`w-full py-3 font-bold rounded-xl text-sm transition-colors ${profileSaved ? 'bg-green-500 text-white' : 'bg-[#4A90D9] text-white hover:bg-[#3378c0]'} disabled:opacity-50`}>
                    {profileSaved ? '✅ Salvat cu succes!' : profileSaving ? 'Se salvează...' : 'Salvează profilul'}
                  </button>
                </div>
              </div>

              {/* Plan */}
              <div className="bg-[#1a2332] rounded-2xl p-5 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold mb-1">Plan curent: {service?.plan === 'pro' ? '⭐ Pro' : '🔓 Free'}</div>
                    <div className="text-white/50 text-xs">
                      {service?.plan === 'free' ? 'Treci la Pro pentru mai multe funcții și vizibilitate crescută.' : 'Ai acces la toate funcțiile platformei.'}
                    </div>
                  </div>
                  {service?.plan === 'free' && (
                    <button className="px-4 py-2 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors flex-shrink-0">
                      Upgrade Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
