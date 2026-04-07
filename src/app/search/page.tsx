// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Service = { id: string; name: string; city: string | null; rating_avg: number; rating_count: number; description: string | null; address: string | null; is_verified: boolean; has_itp: boolean; phone: string | null; plan: string; is_authorized_rar: boolean; warranty_months: number }

const CATEGORIES = [
  { label: 'Schimb ulei', key: 'schimb_ulei' }, { label: 'Frâne', key: 'frane' },
  { label: 'Geometrie', key: 'geometrie' }, { label: 'Diagnoză', key: 'diagnoza' },
  { label: 'Vopsitorie', key: 'vopsitorie' }, { label: 'ITP', key: 'itp' },
  { label: 'Climatizare', key: 'climatizare' }, { label: 'Suspensie', key: 'suspensie' },
  { label: 'Motor', key: 'motor' }, { label: 'Electrică', key: 'electrica' },
]

const CITIES = ['Toate orașele', 'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Craiova', 'Galați', 'Ploiești', 'Oradea', 'Sibiu']

function SearchContent() {
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState('Toate orașele')
  const [sortBy, setSortBy] = useState('rating')
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterITP, setFilterITP] = useState(false)
  const [filterRAR, setFilterRAR] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const supabase = createClient()

  useEffect(() => { loadServices() }, [city, sortBy, filterVerified, filterITP, filterRAR, minRating])

  async function loadServices() {
    setLoading(true)
    let q = supabase.from('services').select('*').eq('is_active', true)
    if (city !== 'Toate orașele') q = q.eq('city', city)
    if (filterVerified) q = q.eq('is_verified', true)
    if (filterITP) q = q.eq('has_itp', true)
    if (filterRAR) q = q.eq('is_authorized_rar', true)
    if (minRating > 0) q = q.gte('rating_avg', minRating)
    if (sortBy === 'rating') q = q.order('rating_avg', { ascending: false })
    else if (sortBy === 'reviews') q = q.order('rating_count', { ascending: false })
    const { data } = await q.limit(30)
    let results = data || []
    if (query) results = results.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.description?.toLowerCase().includes(query.toLowerCase()) || s.city?.toLowerCase().includes(query.toLowerCase()))
    setServices(results)
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) { e.preventDefault(); loadServices() }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-[#1a2332] px-6 h-14 flex items-center gap-4 sticky top-0 z-50">
        <a href="/home" className="flex items-center gap-2 text-white font-black text-lg no-underline flex-shrink-0">
          <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
          <span className="hidden sm:block">Reparo</span>
        </a>
        <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Caută service, piesă, lucrare..."
            className="flex-1 px-4 py-2 text-sm rounded-l-xl border-none outline-none"/>
          <button type="submit" className="px-5 bg-[#4A90D9] text-white rounded-r-xl border-none cursor-pointer font-semibold text-sm">
            Caută
          </button>
        </form>
        <a href="/home" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block no-underline">Acasă</a>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-5">
        {/* Filters sidebar */}
        <div className="w-60 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Oraș</div>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sortare</div>
            {[['rating', 'Rating (cel mai bun)'], ['reviews', 'Cele mai multe recenzii'], ['name', 'Nume (A-Z)']].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 py-1.5 cursor-pointer">
                <input type="radio" name="sort" checked={sortBy === val} onChange={() => setSortBy(val)} className="accent-[#4A90D9]"/>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Filtre</div>
            {[
              { label: 'Verificat Reparo', val: filterVerified, set: setFilterVerified },
              { label: 'ITP pe loc', val: filterITP, set: setFilterITP },
              { label: 'Autorizat RAR', val: filterRAR, set: setFilterRAR },
            ].map(f => (
              <label key={f.label} className="flex items-center gap-2 py-1.5 cursor-pointer">
                <input type="checkbox" checked={f.val} onChange={e => f.set(e.target.checked)} className="accent-[#4A90D9]"/>
                <span className="text-sm text-gray-700">{f.label}</span>
              </label>
            ))}
            <div className="mt-3">
              <div className="text-xs text-gray-400 mb-2">Rating minim: {minRating > 0 ? `${minRating}★` : 'Oricare'}</div>
              <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))}
                className="w-full accent-[#4A90D9]"/>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Categorii</div>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setQuery(c.label)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#4A90D9] transition-colors">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              {loading ? 'Se caută...' : `${services.length} service-uri găsite`}
              {query && <span className="font-semibold text-gray-800"> pentru "{query}"</span>}
            </div>
            <button onClick={() => { setQuery(''); setCity('Toate orașele'); setFilterVerified(false); setFilterITP(false); setFilterRAR(false); setMinRating(0) }}
              className="text-xs text-[#4A90D9] hover:underline">Resetează filtrele</button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse"/>)}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-gray-600 font-semibold mb-2">Niciun service găsit</div>
              <p className="text-gray-400 text-sm">Încearcă alte filtre sau un alt oraș.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map(s => (
                <a key={s.id} href={`/service/${s.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#4A90D9] transition-all no-underline"
                  style={{ display: 'block' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#E6F0FB] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔧</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-bold text-gray-900 text-base">{s.name}</span>
                          {s.is_verified && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Verificat</span>}
                          {s.plan === 'pro' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">⭐ Pro</span>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-yellow-400 text-sm">{'★'.repeat(Math.round(s.rating_avg))}</span>
                          <span className="text-gray-400 text-xs">({s.rating_count})</span>
                        </div>
                      </div>
                      {s.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{s.description}</p>}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {s.has_itp && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">ITP pe loc</span>}
                        {s.is_authorized_rar && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Autorizat RAR</span>}
                        {s.warranty_months > 0 && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Garanție {s.warranty_months} luni</span>}
                      </div>
                      <div className="text-xs text-[#4A90D9] font-medium">📍 {s.city}{s.address ? ` · ${s.address}` : ''}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="px-4 py-2 bg-[#4A90D9] text-white text-sm font-bold rounded-xl">Vezi profil →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"/></div>}>
    <SearchContent />
  </Suspense>
}
