// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TABS = ['Mașinile mele', 'Programări', 'Istoric lucrări', 'Documente', 'Oferte primite', 'Setări cont']

const FUEL_TYPES = ['Benzină', 'Diesel', 'Hybrid', 'Electric', 'GPL']
const BRANDS = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Dacia', 'Renault', 'Ford', 'Opel', 'Peugeot', 'Skoda', 'Hyundai', 'Kia', 'Volvo', 'Mazda', 'Honda', 'Nissan', 'Fiat', 'Seat', 'Alfa Romeo']
const DOC_TYPES = [
  { key: 'itp', label: 'ITP', icon: '🛡️', color: '#E6F0FB', textColor: '#1a5fa8' },
  { key: 'rca', label: 'RCA', icon: '📄', color: '#EAF3DE', textColor: '#3B6D11' },
  { key: 'rovinieta', label: 'Rovinietă', icon: '🛣️', color: '#FEF3E2', textColor: '#854F0B' },
  { key: 'casco', label: 'CASCO', icon: '🔒', color: '#F5EEFB', textColor: '#6B3FA0' },
]

export default function AccountPage() {
  const [tab, setTab] = useState('Mașinile mele')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cars, setCars] = useState([])
  const [appointments, setAppointments] = useState([])
  const [history, setHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [offers, setOffers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddCar, setShowAddCar] = useState(false)
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [addDocCar, setAddDocCar] = useState('')
  const [editProfile, setEditProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [carForm, setCarForm] = useState({ brand: '', model: '', year: '', fuel_type: '', engine_cc: '', horsepower: '', plate_number: '', color: '', current_km: '' })
  const [docForm, setDocForm] = useState({ type: 'itp', expires_at: '', car_id: '' })
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', city: '' })

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)

      const [prof, carsData, aptsData, histData, docsData, reqsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('cars').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
        supabase.from('appointments').select('*, services(name, city, phone)').eq('user_id', user.id).order('scheduled_date', { ascending: false }),
        supabase.from('service_history').select('*').eq('user_id', user.id).order('date_done', { ascending: false }),
        supabase.from('car_documents').select('*, cars(brand, model, plate_number)').eq('user_id', user.id).order('expires_at', { ascending: true }),
        supabase.from('quote_requests').select('*, offers(id, price_total, status, services(name))').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      setProfile(prof.data)
      setProfileForm({ full_name: prof.data?.full_name || '', phone: prof.data?.phone || '', city: prof.data?.city || '' })
      setCars(carsData.data || [])
      setAppointments(aptsData.data || [])
      setHistory(histData.data || [])
      setDocuments(docsData.data || [])
      setRequests(reqsData.data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function addCar() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const isFirst = cars.length === 0
    const { data } = await supabase.from('cars').insert({ ...carForm, user_id: user.id, year: carForm.year ? parseInt(carForm.year) : null, horsepower: carForm.horsepower ? parseInt(carForm.horsepower) : null, current_km: carForm.current_km ? parseInt(carForm.current_km) : null, is_default: isFirst }).select().single()
    if (data) setCars(prev => [...prev, data])
    setCarForm({ brand: '', model: '', year: '', fuel_type: '', engine_cc: '', horsepower: '', plate_number: '', color: '', current_km: '' })
    setShowAddCar(false)
    setSaving(false)
  }

  async function deleteCar(id) {
    await supabase.from('cars').delete().eq('id', id)
    setCars(prev => prev.filter(c => c.id !== id))
  }

  async function setDefaultCar(id) {
    await supabase.from('cars').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('cars').update({ is_default: true }).eq('id', id)
    setCars(prev => prev.map(c => ({ ...c, is_default: c.id === id })))
  }

  async function addDocument() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('car_documents').insert({ ...docForm, user_id: user.id, car_id: docForm.car_id || cars[0]?.id }).select('*, cars(brand, model, plate_number)').single()
    if (data) setDocuments(prev => [...prev, data])
    setDocForm({ type: 'itp', expires_at: '', car_id: '' })
    setShowAddDoc(false)
    setSaving(false)
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update(profileForm).eq('id', user.id)
    setProfile(prev => ({ ...prev, ...profileForm }))
    setEditProfile(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function getDaysUntil(dateStr) {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  function getDocStatus(expiresAt) {
    const days = getDaysUntil(expiresAt)
    if (days < 0) return { label: 'Expirat', color: '#FCEBEB', text: '#A32D2D' }
    if (days <= 30) return { label: `Expiră în ${days} zile`, color: '#FAEEDA', text: '#854F0B' }
    return { label: `Valid ${days} zile`, color: '#EAF3DE', text: '#3B6D11' }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-[#1a2332] px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-50">
        <a href="/home" className="flex items-center gap-2 text-white font-black text-lg no-underline">
          <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
          <span className="hidden sm:block">Reparo</span>
        </a>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4A90D9] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-white/70 text-sm hidden md:block">{profile?.full_name}</span>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/home' }}
            className="text-white/40 hover:text-white text-sm transition-colors border-none bg-transparent cursor-pointer">
            Ieși
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header profil */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#E6F0FB] rounded-2xl flex items-center justify-center text-2xl font-black text-[#4A90D9] flex-shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg text-gray-900">{profile?.full_name || 'Utilizator'}</div>
            <div className="text-sm text-gray-400">{user?.email} · {profile?.city || 'Oraș nespecificat'}</div>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>🚗 {cars.length} mașini</span>
              <span>📅 {appointments.length} programări</span>
              <span>📋 {requests.length} cereri</span>
            </div>
          </div>
          <button onClick={() => { setTab('Setări cont'); setEditProfile(true) }}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors">
            ✏️ Editează
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-[#4A90D9] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ═══ MASINILE MELE ═══ */}
        {tab === 'Mașinile mele' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Mașinile mele</h2>
              <button onClick={() => setShowAddCar(true)}
                className="px-4 py-2 bg-[#4A90D9] text-white font-bold rounded-xl text-sm hover:bg-[#3378c0] transition-colors">
                + Adaugă mașină
              </button>
            </div>

            {cars.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-5xl mb-4">🚗</div>
                <div className="text-gray-600 font-semibold mb-2">Nu ai nicio mașină salvată</div>
                <p className="text-gray-400 text-sm mb-5">Adaugă mașina ta pentru a face cereri de ofertă mai rapid.</p>
                <button onClick={() => setShowAddCar(true)} className="px-6 py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm">
                  Adaugă prima mașină
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {cars.map(car => (
                  <div key={car.id} className={`bg-white rounded-2xl border p-5 ${car.is_default ? 'border-[#4A90D9]' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#E6F0FB] rounded-xl flex items-center justify-center text-2xl">🚗</div>
                        <div>
                          <div className="font-bold text-gray-900">{car.brand} {car.model}</div>
                          <div className="text-sm text-gray-400">{car.year} · {car.fuel_type} · {car.engine_cc}</div>
                        </div>
                      </div>
                      {car.is_default && <span className="text-xs bg-[#E6F0FB] text-[#4A90D9] px-2 py-0.5 rounded-full font-bold">Principală</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      {car.plate_number && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <div className="text-xs text-gray-400">Nr. înmatriculare</div>
                          <div className="font-bold text-gray-800">{car.plate_number}</div>
                        </div>
                      )}
                      {car.current_km && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <div className="text-xs text-gray-400">Kilometraj</div>
                          <div className="font-bold text-gray-800">{parseInt(car.current_km).toLocaleString()} km</div>
                        </div>
                      )}
                      {car.horsepower && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <div className="text-xs text-gray-400">Putere</div>
                          <div className="font-bold text-gray-800">{car.horsepower} CP</div>
                        </div>
                      )}
                      {car.color && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <div className="text-xs text-gray-400">Culoare</div>
                          <div className="font-bold text-gray-800">{car.color}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!car.is_default && (
                        <button onClick={() => setDefaultCar(car.id)}
                          className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:border-[#4A90D9] hover:text-[#4A90D9] transition-colors">
                          Setează principală
                        </button>
                      )}
                      <button onClick={() => window.location.href = `/home`}
                        className="flex-1 py-2 bg-[#FF6B35] text-white rounded-xl text-xs font-bold hover:bg-[#e55a26] transition-colors">
                        Cere ofertă
                      </button>
                      <button onClick={() => deleteCar(car.id)}
                        className="px-3 py-2 border border-red-100 rounded-xl text-xs font-semibold text-red-400 hover:border-red-300 hover:text-red-600 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal adaugă mașină */}
            {showAddCar && (
              <div onClick={e => { if (e.target === e.currentTarget) setShowAddCar(false) }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Adaugă mașină</h3>
                    <button onClick={() => setShowAddCar(false)} className="text-gray-400 text-xl border-none bg-transparent cursor-pointer">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'brand', label: 'Marcă', type: 'select', opts: BRANDS },
                      { key: 'model', label: 'Model', type: 'text', placeholder: 'ex: Seria 3' },
                      { key: 'year', label: 'An fabricație', type: 'number', placeholder: '2021' },
                      { key: 'fuel_type', label: 'Combustibil', type: 'select', opts: FUEL_TYPES },
                      { key: 'engine_cc', label: 'Capacitate', type: 'text', placeholder: '2.0' },
                      { key: 'horsepower', label: 'Putere (CP)', type: 'number', placeholder: '190' },
                      { key: 'plate_number', label: 'Nr. înmatriculare', type: 'text', placeholder: 'B-11-XYZ' },
                      { key: 'color', label: 'Culoare', type: 'text', placeholder: 'Negru' },
                      { key: 'current_km', label: 'Kilometraj actual', type: 'number', placeholder: '87500' },
                    ].map(f => (
                      <div key={f.key} className={f.key === 'current_km' ? 'col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        {f.type === 'select' ? (
                          <select value={carForm[f.key]} onChange={e => setCarForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                            <option value="">Selectează</option>
                            {f.opts.map(o => <option key={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={f.type} value={carForm[f.key]} onChange={e => setCarForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addCar} disabled={saving || !carForm.brand || !carForm.model}
                    className="w-full py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm mt-5 hover:bg-[#3378c0] transition-colors disabled:opacity-50">
                    {saving ? 'Se salvează...' : 'Salvează mașina'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ PROGRAMARI ═══ */}
        {tab === 'Programări' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Programările mele</h2>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-5xl mb-4">📅</div>
                <div className="text-gray-600 font-semibold mb-2">Nicio programare</div>
                <p className="text-gray-400 text-sm mb-5">Acceptă o ofertă de service pentru a crea o programare.</p>
                <a href="/oferte" className="inline-block px-6 py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm no-underline">
                  Vezi ofertele mele →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => {
                  const isPast = new Date(a.scheduled_date) < new Date()
                  const STATUS = {
                    in_asteptare: { label: 'În așteptare', color: 'bg-yellow-100 text-yellow-700' },
                    confirmata: { label: 'Confirmată', color: 'bg-blue-100 text-blue-700' },
                    in_lucru: { label: 'În lucru', color: 'bg-purple-100 text-purple-700' },
                    finalizata: { label: 'Finalizată', color: 'bg-green-100 text-green-700' },
                    anulata: { label: 'Anulată', color: 'bg-red-100 text-red-700' },
                  }
                  const st = STATUS[a.status] || { label: a.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <div key={a.id} className={`bg-white rounded-2xl border border-gray-100 p-5 ${isPast ? 'opacity-70' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900">
                            {a.services?.name || 'Service auto'}
                          </div>
                          <div className="text-sm text-gray-400">{a.services?.city}</div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400">Data</div>
                          <div className="font-bold text-gray-800 text-sm">
                            📅 {new Date(a.scheduled_date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'long' })}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400">Interval</div>
                          <div className="font-bold text-gray-800 text-sm">⏰ {a.scheduled_time}</div>
                        </div>
                      </div>
                      {a.notes && <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-3">{a.notes}</div>}
                      <div className="flex gap-2">
                        {a.services?.phone && (
                          <a href={`tel:${a.services.phone}`}
                            className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-center text-gray-600 hover:border-gray-400 transition-colors no-underline">
                            📞 Sună service-ul
                          </a>
                        )}
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(a.services?.name + ' ' + a.services?.city)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-center text-gray-600 hover:border-gray-400 transition-colors no-underline">
                          🗺️ Direcție
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ ISTORIC LUCRARI ═══ */}
        {tab === 'Istoric lucrări' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Istoricul lucrărilor</h2>
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-5xl mb-4">🔧</div>
                <div className="text-gray-600 font-semibold mb-2">Niciun istoric</div>
                <p className="text-gray-400 text-sm">Lucrările finalizate vor apărea aici automat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(h => (
                  <div key={h.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{h.intervention}</div>
                        <div className="text-sm text-gray-400">
                          {h.date_done ? new Date(h.date_done).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                          {h.km_at_service ? ` · ${h.km_at_service.toLocaleString()} km` : ''}
                        </div>
                      </div>
                      {h.price && <div className="font-black text-lg text-gray-900">{h.price.toLocaleString()} RON</div>}
                    </div>
                    {h.notes && <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{h.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ DOCUMENTE ═══ */}
        {tab === 'Documente' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Documente & expirări</h2>
              <button onClick={() => setShowAddDoc(true)}
                className="px-4 py-2 bg-[#4A90D9] text-white font-bold rounded-xl text-sm hover:bg-[#3378c0] transition-colors">
                + Adaugă document
              </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {DOC_TYPES.map(dt => {
                const doc = documents.find(d => d.type === dt.key)
                const status = doc ? getDocStatus(doc.expires_at) : null
                return (
                  <div key={dt.key} style={{ background: doc ? status.color : '#f8f8f8', border: `0.5px solid ${doc ? status.text + '30' : '#e8e8e8'}` }} className="rounded-2xl p-4">
                    <div className="text-2xl mb-2">{dt.icon}</div>
                    <div className="font-bold text-gray-900 mb-1">{dt.label}</div>
                    {doc ? (
                      <>
                        <div style={{ color: status.text }} className="text-xs font-semibold">{status.label}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(doc.expires_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400">Neadăugat</div>
                    )}
                  </div>
                )
              })}
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">📄</div>
                <div className="text-gray-600 font-semibold mb-2">Niciun document adăugat</div>
                <p className="text-gray-400 text-sm mb-5">Adaugă datele de expirare ale ITP-ului, RCA-ului etc. și vei primi remindere automate.</p>
                <button onClick={() => setShowAddDoc(true)} className="px-6 py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm">
                  Adaugă primul document
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => {
                  const dt = DOC_TYPES.find(d => d.key === doc.type)
                  const status = getDocStatus(doc.expires_at)
                  return (
                    <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div style={{ background: dt?.color || '#f0f0f0' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl">{dt?.icon || '📄'}</div>
                        <div>
                          <div className="font-bold text-gray-900">{dt?.label || doc.type}</div>
                          <div className="text-sm text-gray-400">
                            {doc.cars?.brand} {doc.cars?.model} {doc.cars?.plate_number ? `· ${doc.cars.plate_number}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: status.text }} className="text-sm font-bold">{status.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Expiră: {new Date(doc.expires_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Modal adaugă document */}
            {showAddDoc && (
              <div onClick={e => { if (e.target === e.currentTarget) setShowAddDoc(false) }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <div className="bg-white rounded-2xl w-full max-w-md p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Adaugă document</h3>
                    <button onClick={() => setShowAddDoc(false)} className="text-gray-400 text-xl border-none bg-transparent cursor-pointer">✕</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tip document</label>
                      <div className="grid grid-cols-4 gap-2">
                        {DOC_TYPES.map(dt => (
                          <button key={dt.key} onClick={() => setDocForm(p => ({ ...p, type: dt.key }))}
                            style={{ background: docForm.type === dt.key ? dt.color : '#f8f8f8', borderColor: docForm.type === dt.key ? dt.textColor : '#e0e0e0' }}
                            className="py-3 rounded-xl border text-center cursor-pointer transition-all">
                            <div className="text-xl">{dt.icon}</div>
                            <div style={{ color: docForm.type === dt.key ? dt.textColor : '#888' }} className="text-xs font-bold mt-1">{dt.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mașina</label>
                      <select value={docForm.car_id} onChange={e => setDocForm(p => ({ ...p, car_id: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                        <option value="">Selectează mașina</option>
                        {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} {c.plate_number ? `· ${c.plate_number}` : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Data expirării</label>
                      <input type="date" value={docForm.expires_at} onChange={e => setDocForm(p => ({ ...p, expires_at: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                    </div>
                    <button onClick={addDocument} disabled={saving || !docForm.expires_at}
                      className="w-full py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm hover:bg-[#3378c0] transition-colors disabled:opacity-50">
                      {saving ? 'Se salvează...' : 'Salvează documentul'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ OFERTE PRIMITE ═══ */}
        {tab === 'Oferte primite' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cererile și ofertele mele</h2>
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-5xl mb-4">📋</div>
                <div className="text-gray-600 font-semibold mb-2">Nicio cerere</div>
                <a href="/home" className="inline-block mt-3 px-6 py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm no-underline">
                  Cere ofertă acum →
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{req.car_brand} {req.car_model} {req.car_year ? `(${req.car_year})` : ''}</div>
                        <div className="text-sm text-gray-400">{req.services?.join(', ')}</div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${req.status === 'activa' ? 'bg-blue-100 text-blue-700' : req.status === 'in_progres' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {req.status === 'activa' ? 'Activă' : req.status === 'in_progres' ? 'În progres' : req.status}
                      </span>
                    </div>
                    {req.offers && req.offers.length > 0 ? (
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{req.offers.length} oferte primite</div>
                        <div className="space-y-2">
                          {req.offers.map(o => (
                            <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                              <div>
                                <div className="font-semibold text-sm text-gray-800">{o.services?.name}</div>
                                <div className="text-xs text-gray-400">
                                  {o.price_total ? `${o.price_total.toLocaleString()} RON` : 'Preț negociabil'}
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${o.status === 'acceptata' ? 'bg-green-100 text-green-700' : o.status === 'refuzata' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-700'}`}>
                                {o.status}
                              </span>
                            </div>
                          ))}
                        </div>
                        <a href="/oferte" className="block mt-3 text-center text-sm text-[#4A90D9] font-semibold hover:underline no-underline">
                          Gestionează ofertele →
                        </a>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
                        ⏳ Așteptăm oferte de la service-uri...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ SETARI CONT ═══ */}
        {tab === 'Setări cont' && (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Setările contului</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-4">Date personale</h3>
              <div className="space-y-4">
                {[
                  { key: 'full_name', label: 'Numele complet', placeholder: 'Ion Popescu', type: 'text' },
                  { key: 'phone', label: 'Telefon', placeholder: '07xx xxx xxx', type: 'tel' },
                  { key: 'city', label: 'Oraș', placeholder: 'București', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                    <input type={f.type} value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                  <input type="email" value={user?.email || ''} disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 text-sm bg-gray-100 text-gray-400 cursor-not-allowed"/>
                  <p className="text-xs text-gray-400 mt-1">Emailul nu poate fi modificat.</p>
                </div>
                <button onClick={saveProfile} disabled={saving}
                  className={`w-full py-3 font-bold rounded-xl text-sm transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-[#4A90D9] text-white hover:bg-[#3378c0]'} disabled:opacity-50`}>
                  {saved ? '✅ Salvat!' : saving ? 'Se salvează...' : 'Salvează modificările'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Notificări</h3>
              {[
                { label: 'Oferte primite', desc: 'Notificare când primești o ofertă nouă', default: true },
                { label: 'Reminder programări', desc: 'Cu 24h înainte de programare', default: true },
                { label: 'Expirare ITP/RCA', desc: 'Cu 30 zile înainte de expirare', default: true },
                { label: 'Noutăți Reparo', desc: 'Funcții noi și oferte speciale', default: false },
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
              <p className="text-sm text-red-500 mb-3">Odată șters, contul nu mai poate fi recuperat.</p>
              <button className="px-4 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
                Șterge contul
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
