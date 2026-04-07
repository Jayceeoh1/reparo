// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Offer = {
  id: string
  request_id: string
  price_total: number | null
  price_parts: number | null
  price_labor: number | null
  description: string | null
  warranty_months: number
  available_date: string | null
  available_time: string | null
  status: string
  created_at: string
  services?: { id: string; name: string; city: string | null; rating_avg: number; rating_count: number; phone: string | null }
}

type QuoteRequest = {
  id: string
  car_brand: string | null
  car_model: string | null
  car_year: number | null
  services: string[] | null
  status: string
  created_at: string
  city: string | null
}

export default function OfertePage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [offers, setOffers] = useState<Record<string, Offer[]>>({})
  const [selectedReq, setSelectedReq] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [accepted, setAccepted] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: reqs } = await supabase
        .from('quote_requests').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setRequests(reqs || [])

      if (reqs && reqs.length > 0) {
        setSelectedReq(reqs[0].id)
        for (const req of reqs) {
          const { data: offs } = await supabase
            .from('offers').select('*, services(id,name,city,rating_avg,rating_count,phone)')
            .eq('request_id', req.id).order('price_total', { ascending: true })
          if (offs) setOffers(prev => ({ ...prev, [req.id]: offs }))
        }
      }
      setLoading(false)
    }
    load()

    // Realtime — oferta noua
    const channel = supabase.channel('new-offers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, async payload => {
        const offer = payload.new as Offer
        const { data: svc } = await supabase.from('services').select('id,name,city,rating_avg,rating_count,phone').eq('id', offer.service_id).single()
        setOffers(prev => ({ ...prev, [offer.request_id]: [{ ...offer, services: svc }, ...(prev[offer.request_id] || [])] }))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function acceptOffer(offerId: string, requestId: string, serviceId: string) {
    setAccepting(offerId)
    // Accepta oferta
    await supabase.from('offers').update({ status: 'acceptata' }).eq('id', offerId)
    // Refuza celelalte
    await supabase.from('offers').update({ status: 'refuzata' }).eq('request_id', requestId).neq('id', offerId)
    // Actualizeaza cererea
    await supabase.from('quote_requests').update({ status: 'in_progres' }).eq('id', requestId)
    // Creeaza programare
    const offer = offers[requestId]?.find(o => o.id === offerId)
    if (offer) {
      await supabase.from('appointments').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        service_id: serviceId,
        offer_id: offerId,
        scheduled_date: offer.available_date || new Date().toISOString().split('T')[0],
        scheduled_time: offer.available_time || '09:00-12:00',
        status: 'confirmata',
      })
    }
    setAccepted(offerId)
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'in_progres' } : r))
    setOffers(prev => ({ ...prev, [requestId]: (prev[requestId] || []).map(o => ({ ...o, status: o.id === offerId ? 'acceptata' : 'refuzata' })) }))
    setAccepting(null)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const currentOffers = selectedReq ? (offers[selectedReq] || []) : []
  const currentReq = requests.find(r => r.id === selectedReq)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-[#1a2332] px-6 py-0 h-14 flex items-center justify-between sticky top-0 z-50">
        <a href="/home" className="flex items-center gap-2 text-white font-black text-lg tracking-tight no-underline">
          <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
          Reparo
        </a>
        <div className="flex gap-3">
          <a href="/account" className="text-white/60 hover:text-white text-sm transition-colors">Contul meu</a>
          <a href="/home" className="text-white/60 hover:text-white text-sm transition-colors">Acasă</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Ofertele mele</h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-gray-600 font-semibold text-lg mb-2">Nu ai nicio cerere de ofertă</div>
            <p className="text-gray-400 text-sm mb-6">Trimite o cerere și vei primi oferte de la service-urile din zona ta în 24h.</p>
            <a href="/home" className="inline-block px-6 py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors no-underline">
              Cere ofertă acum →
            </a>
          </div>
        ) : (
          <div className="flex gap-5">
            {/* Cereri sidebar */}
            <div className="w-72 flex-shrink-0 space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Cererile tale</div>
              {requests.map(r => (
                <button key={r.id} onClick={() => setSelectedReq(r.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedReq === r.id ? 'border-[#4A90D9] bg-[#E6F0FB]' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                  <div className="font-bold text-sm text-gray-900 mb-1">{r.car_brand} {r.car_model} {r.car_year ? `(${r.car_year})` : ''}</div>
                  <div className="text-xs text-gray-500 mb-2">{r.services?.slice(0,2).join(', ')}{(r.services?.length || 0) > 2 ? '...' : ''}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      r.status === 'activa' ? 'bg-blue-100 text-blue-700' :
                      r.status === 'in_progres' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{r.status === 'activa' ? 'Activă' : r.status === 'in_progres' ? 'În progres' : r.status}</span>
                    <span className="text-xs text-gray-400">{(offers[r.id] || []).length} oferte</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Oferte */}
            <div className="flex-1 min-w-0">
              {currentReq && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">Cerere pentru</span>
                    <div className="font-bold text-gray-900">{currentReq.car_brand} {currentReq.car_model} · {currentReq.services?.join(', ')}</div>
                  </div>
                  <div className="text-sm text-gray-500">{currentReq.city}</div>
                </div>
              )}

              {currentOffers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <div className="text-4xl mb-3">⏳</div>
                  <div className="text-gray-600 font-semibold mb-2">Așteptăm oferte</div>
                  <p className="text-gray-400 text-sm">Service-urile din zona ta vor trimite oferte în curând.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentOffers.map(o => (
                    <div key={o.id} className={`bg-white rounded-2xl border p-5 transition-all ${o.status === 'acceptata' ? 'border-green-300 shadow-sm' : o.status === 'refuzata' ? 'border-gray-100 opacity-60' : 'border-gray-100'}`}>
                      {/* Service info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-[#E6F0FB] rounded-xl flex items-center justify-center text-xl">🔧</div>
                          <div>
                            <div className="font-bold text-gray-900">{(o.services as any)?.name || 'Service auto'}</div>
                            <div className="text-xs text-gray-400">
                              {'⭐'.repeat(Math.round((o.services as any)?.rating_avg || 0))} ({(o.services as any)?.rating_count || 0} recenzii) · {(o.services as any)?.city}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                          o.status === 'acceptata' ? 'bg-green-100 text-green-700' :
                          o.status === 'refuzata' ? 'bg-gray-100 text-gray-400' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {o.status === 'acceptata' ? '✅ Acceptată' : o.status === 'refuzata' ? 'Refuzată' : '🆕 Nouă'}
                        </span>
                      </div>

                      {/* Preturi */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Total', value: o.price_total, highlight: true },
                          { label: 'Piese', value: o.price_parts, highlight: false },
                          { label: 'Manoperă', value: o.price_labor, highlight: false },
                        ].map(p => (
                          <div key={p.label} className={`rounded-xl p-3 text-center ${p.highlight ? 'bg-[#1a2332]' : 'bg-gray-50'}`}>
                            <div className={`text-xs mb-1 ${p.highlight ? 'text-white/50' : 'text-gray-400'}`}>{p.label}</div>
                            <div className={`font-black text-lg ${p.highlight ? 'text-white' : 'text-gray-800'}`}>
                              {p.value ? `${p.value.toLocaleString()} RON` : '—'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Detalii */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        {o.available_date && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-xs text-gray-400 mb-1">Data disponibilă</div>
                            <div className="font-semibold text-gray-800">📅 {new Date(o.available_date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} · {o.available_time}</div>
                          </div>
                        )}
                        {o.warranty_months > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-xs text-gray-400 mb-1">Garanție lucrare</div>
                            <div className="font-semibold text-gray-800">🛡️ {o.warranty_months} luni</div>
                          </div>
                        )}
                      </div>

                      {o.description && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                          <div className="text-xs font-bold text-amber-700 mb-1">Detalii ofertă</div>
                          <p className="text-sm text-amber-800">{o.description}</p>
                        </div>
                      )}

                      {/* Butoane actiune */}
                      {o.status === 'trimisa' && (
                        <div className="flex gap-3">
                          <button onClick={() => acceptOffer(o.id, o.request_id, (o.services as any)?.id)}
                            disabled={accepting === o.id}
                            className="flex-1 py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors disabled:opacity-50">
                            {accepting === o.id ? 'Se procesează...' : '✅ Acceptă oferta & Programează'}
                          </button>
                          {(o.services as any)?.phone && (
                            <a href={`tel:${(o.services as any).phone}`}
                              className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors no-underline flex items-center gap-2">
                              📞 Sună
                            </a>
                          )}
                        </div>
                      )}
                      {o.status === 'acceptata' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                          <div className="text-green-700 font-bold text-sm">✅ Ai acceptat această ofertă!</div>
                          <div className="text-green-600 text-xs mt-1">Programarea a fost confirmată. Service-ul te va contacta în curând.</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
