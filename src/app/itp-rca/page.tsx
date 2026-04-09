// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ITP_PRICES = [
  { category: 'Autoturism până în 1600cc', price: '90 - 120 lei', duration: '~30 min' },
  { category: 'Autoturism 1600cc - 2000cc', price: '110 - 140 lei', duration: '~30 min' },
  { category: 'Autoturism peste 2000cc', price: '130 - 160 lei', duration: '~30 min' },
  { category: 'SUV / Off-road', price: '140 - 180 lei', duration: '~45 min' },
  { category: 'Autoutilitară ușoară', price: '160 - 220 lei', duration: '~45 min' },
]

const RCA_TIPS = [
  { icon: '📅', title: 'Compară înainte de expirare', desc: 'Cu 30 de zile înainte primești cele mai bune oferte.' },
  { icon: '🚗', title: 'Puterea motorului contează', desc: 'Un motor mai mare = primă RCA mai mare. Verifică CP-ul mașinii.' },
  { icon: '📍', title: 'Județul de înmatriculare', desc: 'Județul influențează prețul. Județele cu risc mare au prime mai mari.' },
  { icon: '⭐', title: 'Clasa bonus-malus', desc: 'Fără accidente înseamnă reduceri de până la 50% la RCA.' },
]

export default function ItpRcaPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('itp')
  const [city, setCity] = useState('București')
  const [carCC, setCarCC] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState(null)
  const [user, setUser] = useState(null)
  const [docForm, setDocForm] = useState({ type: 'itp', expires_at: '', car_id: '' })
  const [cars, setCars] = useState([])
  const [docSaved, setDocSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: carsData } = await supabase.from('cars').select('*').eq('user_id', user.id)
        setCars(carsData || [])
      }
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('has_itp', true)
        .eq('is_active', true)
        .order('rating_avg', { ascending: false })
        .limit(10)
      setServices(data || [])
      setLoading(false)
    }
    load()
  }, [])

  function calcEstimate() {
    const cc = parseInt(carCC)
    if (!cc) return
    const base = cc < 1600 ? 105 : cc < 2000 ? 125 : 145
    setEstimatedPrice({ min: base - 15, max: base + 25 })
  }

  async function saveDoc() {
    if (!user || !docForm.expires_at) return
    await supabase.from('car_documents').insert({ ...docForm, user_id: user.id, car_id: docForm.car_id || null })
    setDocSaved(true)
    setTimeout(() => setDocSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1a2332] px-6 py-10 text-center">
        <h1 className="text-3xl font-black text-white mb-3">ITP & RCA — Simplu și rapid</h1>
        <p className="text-white/55 text-base max-w-xl mx-auto mb-6">
          Găsește service-uri ITP în zona ta, calculează costul estimativ și salvează datele de expirare pentru remindere automate.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('itp')}
            className={`px-6 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition-all ${activeTab === 'itp' ? 'bg-[#4A90D9] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            🛡️ ITP
          </button>
          <button
            onClick={() => setActiveTab('rca')}
            className={`px-6 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition-all ${activeTab === 'rca' ? 'bg-[#4A90D9] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            📄 RCA
          </button>
          <button
            onClick={() => setActiveTab('reminder')}
            className={`px-6 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition-all ${activeTab === 'reminder' ? 'bg-[#FF6B35] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            🔔 Setează reminder
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ═══ ITP ═══ */}
        {activeTab === 'itp' && (
          <div>
            {/* Calculator ITP */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-1">Calculator preț ITP</h2>
              <p className="text-sm text-gray-400 mb-4">Estimare orientativă — prețul final depinde de service.</p>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Capacitate cilindrică (cc)</label>
                  <input
                    type="number"
                    value={carCC}
                    onChange={e => setCarCC(e.target.value)}
                    placeholder="ex: 1995"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
                  />
                </div>
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Orașul tău</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
                  >
                    {['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Craiova'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={calcEstimate}
                    className="px-6 py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm border-none cursor-pointer"
                  >
                    Calculează
                  </button>
                </div>
              </div>
              {estimatedPrice && (
                <div className="mt-4 bg-[#E6F0FB] rounded-xl p-4 flex items-center gap-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <div className="font-black text-2xl text-[#1a5fa8]">
                      {estimatedPrice.min} – {estimatedPrice.max} lei
                    </div>
                    <div className="text-sm text-[#4A90D9]">Estimare pentru {city} · Durată ~30 minute</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tarife orientative */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Tarife orientative ITP 2026</h2>
              <div className="space-y-2">
                {ITP_PRICES.map(p => (
                  <div key={p.category} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-none">
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{p.category}</div>
                      <div className="text-xs text-gray-400">{p.duration}</div>
                    </div>
                    <div className="font-black text-gray-900">{p.price}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                ⚠️ Prețurile sunt orientative. Tarifele finale variază în funcție de service și de starea mașinii.
              </div>
            </div>

            {/* Service-uri ITP */}
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service-uri ITP autorizate în {city}</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">🛡️</div>
                Niciun service ITP înregistrat momentan. Înregistrează-ți service-ul!
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(s => (
                  <a
                    key={s.id}
                    href={`/service/${s.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#4A90D9] transition-all no-underline block"
                  >
                    <div className="w-12 h-12 bg-[#E6F0FB] rounded-xl flex items-center justify-center text-xl flex-shrink-0">🛡️</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-sm text-gray-400">📍 {s.city}{s.address ? ` · ${s.address}` : ''}</div>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-sm ${star <= Math.round(s.rating_avg) ? 'text-yellow-400' : 'text-gray-200'}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-xs text-gray-400 ml-1">({s.rating_count})</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">ITP autorizat</span>
                      <div className="text-sm font-bold text-[#4A90D9]">Vezi profil →</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ RCA ═══ */}
        {activeTab === 'rca' && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-2">Cum funcționează RCA?</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                RCA (Răspundere Civilă Auto) este obligatoriu în România. Asigurarea acoperă daunele produse altor persoane în cazul unui accident din vina ta. Prețul variază în funcție de mai mulți factori.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {RCA_TIPS.map(tip => (
                  <div key={tip.title} className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl mb-2">{tip.icon}</div>
                    <div className="font-bold text-sm text-gray-900 mb-1">{tip.title}</div>
                    <div className="text-xs text-gray-500">{tip.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a2332] rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">📄</div>
              <h2 className="text-xl font-black text-white mb-2">Compară oferte RCA</h2>
              <p className="text-white/50 text-sm mb-5 max-w-md mx-auto">
                Integrarea cu brokeri RCA vine în curând. Te vom notifica când poți compara oferte direct din Reparo.
              </p>
              <button
                onClick={() => setActiveTab('reminder')}
                className="px-6 py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm border-none cursor-pointer"
              >
                🔔 Setează reminder expirare RCA
              </button>
            </div>
          </div>
        )}

        {/* ═══ REMINDER ═══ */}
        {activeTab === 'reminder' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-2">Setează reminder</h2>
              <p className="text-sm text-gray-400 mb-5">Vei primi notificări cu 30 de zile înainte de expirare.</p>

              {!user ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🔔</div>
                  <div className="text-gray-600 font-semibold mb-2">Trebuie să fii conectat</div>
                  <p className="text-gray-400 text-sm mb-4">Creează un cont gratuit pentru a seta remindere.</p>
                  <a
                    href="/auth/register"
                    className="inline-block px-6 py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm no-underline"
                  >
                    Creează cont gratuit →
                  </a>
                </div>
              ) : docSaved ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <div className="text-green-700 font-bold text-lg">Reminder setat cu succes!</div>
                  <p className="text-gray-400 text-sm mt-2">Vei fi notificat cu 30 de zile înainte de expirare.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tip document</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'itp', label: '🛡️ ITP' },
                        { key: 'rca', label: '📄 RCA' },
                        { key: 'rovinieta', label: '🛣️ Rovinietă' },
                        { key: 'casco', label: '🔒 CASCO' },
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={() => setDocForm(p => ({ ...p, type: t.key }))}
                          className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${docForm.type === t.key ? 'bg-[#E6F0FB] border-[#4A90D9] text-[#1a5fa8]' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {cars.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mașina (opțional)</label>
                      <select
                        value={docForm.car_id}
                        onChange={e => setDocForm(p => ({ ...p, car_id: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
                      >
                        <option value="">Selectează mașina</option>
                        {cars.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.brand} {c.model} {c.plate_number ? `· ${c.plate_number}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Data expirării</label>
                    <input
                      type="date"
                      value={docForm.expires_at}
                      onChange={e => setDocForm(p => ({ ...p, expires_at: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={saveDoc}
                    disabled={!docForm.expires_at}
                    className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors disabled:opacity-50"
                  >
                    🔔 Setează reminder gratuit
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Poți gestiona toate documentele din secțiunea{' '}
                    <a href="/account" className="text-[#4A90D9]">
                      Contul meu
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
