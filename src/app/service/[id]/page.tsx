// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Service = { id: string; name: string; city: string | null; county: string | null; address: string | null; phone: string | null; email: string | null; website: string | null; facebook_url: string | null; description: string | null; cover_image_url: string | null; logo_url: string | null; rating_avg: number; rating_count: number; is_verified: boolean; has_itp: boolean; is_authorized_rar: boolean; warranty_months: number; plan: string; brands_accepted: string[] | null; fuel_types: string[] | null }
type Review = { id: string; rating: number; comment: string | null; created_at: string; reply_text: string | null }
type Offering = { id: string; name: string; category: string; price_from: number | null; price_to: number | null; duration_min: number | null; description: string | null }

export default function ServiceProfilePage({ params }: { params: { id: string } }) {
  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('despre')
  const [modalOpen, setModalOpen] = useState(false)
  const [appointDate, setAppointDate] = useState('')
  const [appointTime, setAppointTime] = useState('09:00-12:00')
  const [appointNote, setAppointNote] = useState('')
  const [bookingDone, setBookingDone] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: svc } = await supabase.from('services').select('*').eq('id', params.id).single()
      setService(svc)
      const { data: revs } = await supabase.from('reviews').select('*').eq('service_id', params.id).eq('is_visible', true).order('created_at', { ascending: false })
      setReviews(revs || [])
      const { data: offs } = await supabase.from('service_offerings').select('*').eq('service_id', params.id).eq('is_active', true)
      setOfferings(offs || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  async function makeAppointment() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = `/auth/login?redirectTo=/service/${params.id}`; return }
    await supabase.from('appointments').insert({ user_id: user.id, service_id: params.id, scheduled_date: appointDate, scheduled_time: appointTime, notes: appointNote, status: 'in_asteptare' })
    setBookingDone(true)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"/></div>
  if (!service) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Service negăsit.</div></div>

  const ratingDist = [5,4,3,2,1].map(r => ({ star: r, count: reviews.filter(rev => rev.rating === r).length }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-[#1a2332] px-6 h-14 flex items-center gap-4 sticky top-0 z-50">
        <a href="/home" className="flex items-center gap-2 text-white font-black text-lg no-underline flex-shrink-0">
          <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
          <span className="hidden sm:block">Reparo</span>
        </a>
        <a href="/search" className="text-white/50 hover:text-white text-sm no-underline">← Înapoi la căutare</a>
      </div>

      {/* Cover */}
      <div className="bg-[#1a2332] h-48 relative">
        {service.cover_image_url && <img src={service.cover_image_url} alt="" className="w-full h-full object-cover opacity-40"/>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] to-transparent"/>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 -mt-8 relative z-10 mb-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-[#E6F0FB] rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 -mt-2 border-4 border-white shadow">🔧</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 mb-1">{service.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                    <span>📍 {service.city}{service.address ? `, ${service.address}` : ''}</span>
                    {service.phone && <a href={`tel:${service.phone}`} className="text-[#4A90D9] no-underline font-medium">📞 {service.phone}</a>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {service.is_verified && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">✓ Verificat</span>}
                  {service.is_authorized_rar && <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">RAR</span>}
                  {service.has_itp && <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">ITP</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= Math.round(service.rating_avg) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                  <span className="font-black text-gray-900 ml-1">{service.rating_avg.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({service.rating_count} recenzii)</span>
                </div>
                {service.warranty_months > 0 && <span className="text-sm text-green-600 font-medium">🛡️ Garanție {service.warranty_months} luni</span>}
              </div>
            </div>

            <button onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors flex-shrink-0">
              📅 Programează acum
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 p-1">
          {[['despre', 'Despre'], ['servicii', `Servicii (${offerings.length})`], ['recenzii', `Recenzii (${reviews.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === key ? 'bg-[#4A90D9] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'despre' && (
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <div className="md:col-span-2 space-y-4">
              {service.description && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="font-bold text-gray-900 mb-3">Despre service</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              )}
              {service.brands_accepted && service.brands_accepted.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="font-bold text-gray-900 mb-3">Mărci acceptate</h2>
                  <div className="flex flex-wrap gap-2">{service.brands_accepted.map(b => <span key={b} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{b}</span>)}</div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Contact</h3>
                <div className="space-y-2 text-sm">
                  {service.phone && <div className="flex items-center gap-2"><span className="text-gray-400">📞</span><a href={`tel:${service.phone}`} className="text-[#4A90D9] no-underline">{service.phone}</a></div>}
                  {service.email && <div className="flex items-center gap-2"><span className="text-gray-400">✉️</span><a href={`mailto:${service.email}`} className="text-[#4A90D9] no-underline">{service.email}</a></div>}
                  {service.website && <div className="flex items-center gap-2"><span className="text-gray-400">🌐</span><a href={service.website} target="_blank" rel="noopener noreferrer" className="text-[#4A90D9] no-underline">Website</a></div>}
                  {service.facebook_url && <div className="flex items-center gap-2"><span className="text-gray-400">📘</span><a href={service.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#4A90D9] no-underline">Facebook</a></div>}
                  {service.city && <div className="flex items-center gap-2"><span className="text-gray-400">📍</span><span className="text-gray-600">{service.city}{service.address ? `, ${service.address}` : ''}</span></div>}
                </div>
              </div>
              <button onClick={() => setModalOpen(true)} className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors">
                📅 Programează-te acum
              </button>
            </div>
          </div>
        )}

        {activeTab === 'servicii' && (
          <div className="space-y-3 mb-8">
            {offerings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">🔧</div>
                Service-ul nu a adăugat încă serviciile oferite.
              </div>
            ) : offerings.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{o.name}</div>
                  {o.description && <div className="text-sm text-gray-500 mt-1">{o.description}</div>}
                  {o.duration_min && <div className="text-xs text-gray-400 mt-1">⏱️ ~{o.duration_min} minute</div>}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  {(o.price_from || o.price_to) && (
                    <div className="font-black text-lg text-gray-900">
                      {o.price_from && o.price_to ? `${o.price_from} – ${o.price_to} RON` : o.price_from ? `de la ${o.price_from} RON` : `până la ${o.price_to} RON`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recenzii' && (
          <div className="mb-8">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">⭐</div>
                Nicio recenzie încă. Fii primul care lasă o recenzie!
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {/* Rating summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-black text-gray-900">{service.rating_avg.toFixed(1)}</div>
                    <div className="flex justify-center gap-0.5 my-2">{[1,2,3,4,5].map(s => <span key={s} className={`text-xl ${s <= Math.round(service.rating_avg) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                    <div className="text-sm text-gray-400">{service.rating_count} recenzii</div>
                  </div>
                  {ratingDist.map(r => (
                    <div key={r.star} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-gray-500 w-4">{r.star}★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: reviews.length > 0 ? `${(r.count / reviews.length) * 100}%` : '0%' }}/>
                      </div>
                      <span className="text-xs text-gray-400 w-4">{r.count}</span>
                    </div>
                  ))}
                </div>

                {/* Reviews list */}
                <div className="md:col-span-2 space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-base ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-700 mb-3">{r.comment}</p>}
                      {r.reply_text && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                          <div className="text-xs font-bold text-blue-700 mb-1">Răspuns service</div>
                          <p className="text-sm text-blue-800">{r.reply_text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal programare */}
      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Programare la {service.name}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl border-none bg-none cursor-pointer">✕</button>
            </div>
            {bookingDone ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <div className="font-bold text-green-700 text-lg mb-2">Programare trimisă!</div>
                <p className="text-gray-500 text-sm mb-5">Service-ul te va contacta pentru confirmare.</p>
                <button onClick={() => { setModalOpen(false); setBookingDone(false) }} className="px-6 py-2.5 bg-[#4A90D9] text-white font-bold rounded-xl text-sm">Închide</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Data dorită</label>
                  <input type="date" value={appointDate} onChange={e => setAppointDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Interval orar</label>
                  <select value={appointTime} onChange={e => setAppointTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                    {['08:00-10:00','09:00-12:00','10:00-13:00','12:00-15:00','14:00-17:00','15:00-18:00'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notițe (opțional)</label>
                  <textarea value={appointNote} onChange={e => setAppointNote(e.target.value)} rows={3}
                    placeholder="Descrie pe scurt ce ai nevoie..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50 resize-none"/>
                </div>
                <button onClick={makeAppointment} disabled={!appointDate}
                  className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors disabled:opacity-50">
                  Confirmă programarea →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
