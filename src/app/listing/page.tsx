// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { key: 'piese', label: 'Piese auto', icon: '🔧' },
  { key: 'anvelope', label: 'Anvelope & jante', icon: '⭕' },
  { key: 'accesorii', label: 'Accesorii', icon: '🎯' },
  { key: 'electronice', label: 'Electronice auto', icon: '💡' },
  { key: 'caroserie', label: 'Caroserie', icon: '🚘' },
  { key: 'motoare', label: 'Motoare & transmisii', icon: '⚙️' },
  { key: 'unelte', label: 'Unelte & echipamente', icon: '🛠️' },
  { key: 'altele', label: 'Altele', icon: '📦' },
]

const CONDITIONS = [
  { key: 'nou', label: 'Nou', color: '#EAF3DE', text: '#3B6D11' },
  { key: 'folosit', label: 'Folosit', color: '#E6F0FB', text: '#1a5fa8' },
  { key: 'reconditionat', label: 'Recondiționat', color: '#FEF3E2', text: '#854F0B' },
]

function ListingsContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddListing, setShowAddListing] = useState(false)
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'toate')
  const [sortBy, setSortBy] = useState('recent')
  const [query, setQuery] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [listingForm, setListingForm] = useState({
    title: '', description: '', price: '', category: 'piese', condition: 'folosit',
    compatible_brands: '', city: '', phone_contact: ''
  })
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    loadListings()
  }, [activeCategory, sortBy])

  async function loadListings() {
    setLoading(true)
    let q = supabase.from('listings').select('*').eq('status', 'activ')
    if (activeCategory !== 'toate') q = q.eq('category', activeCategory)
    if (sortBy === 'pret_asc') q = q.order('price', { ascending: true })
    else if (sortBy === 'pret_desc') q = q.order('price', { ascending: false })
    else q = q.order('created_at', { ascending: false })
    const { data } = await q.limit(40)
    let results = data || []
    if (query) results = results.filter(l => l.title.toLowerCase().includes(query.toLowerCase()))
    setListings(results)
    setLoading(false)
  }

  async function addListing() {
    if (!user) { window.location.href = '/auth/login'; return }
    setSaving(true)
    const { data } = await supabase.from('listings').insert({
      user_id: user.id,
      title: listingForm.title,
      description: listingForm.description,
      price: listingForm.price ? parseFloat(listingForm.price) : null,
      category: listingForm.category,
      condition: listingForm.condition,
      city: listingForm.city,
      status: 'activ',
      compatible_brands: listingForm.compatible_brands ? listingForm.compatible_brands.split(',').map(s => s.trim()) : null,
    }).select().single()
    if (data) setListings(prev => [data, ...prev])
    setShowAddListing(false)
    setSaving(false)
    setListingForm({ title: '', description: '', price: '', category: 'piese', condition: 'folosit', compatible_brands: '', city: '', phone_contact: '' })
  }

  function handleSearch(e) { e.preventDefault(); loadListings() }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a2332] px-6 h-14 flex items-center gap-4 sticky top-0 z-50">
        <a href="/home" className="flex items-center gap-2 text-white font-black text-lg no-underline flex-shrink-0">
          <span className="w-7 h-7 bg-[#4A90D9] rounded-lg flex items-center justify-center font-black text-sm">R</span>
          <span className="hidden sm:block">Reparo</span>
        </a>
        <form onSubmit={handleSearch} className="flex flex-1 max-w-xl">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Caută piese, anvelope, accesorii..."
            className="flex-1 px-4 py-2 text-sm rounded-l-xl border-none outline-none"/>
          <button type="submit" className="px-5 bg-[#4A90D9] text-white rounded-r-xl border-none cursor-pointer font-semibold text-sm">Caută</button>
        </form>
        <button onClick={() => user ? setShowAddListing(true) : window.location.href = '/auth/login'}
          className="px-4 py-2 bg-[#FF6B35] text-white font-bold rounded-xl text-sm border-none cursor-pointer flex-shrink-0">
          + Adaugă anunț
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Categorii */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button onClick={() => setActiveCategory('toate')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${activeCategory === 'toate' ? 'bg-[#4A90D9] text-white border-[#4A90D9]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#4A90D9]'}`}>
            📦 Toate
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setActiveCategory(c.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${activeCategory === c.key ? 'bg-[#4A90D9] text-white border-[#4A90D9]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#4A90D9]'}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">{loading ? 'Se caută...' : `${listings.length} anunțuri`}</div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#4A90D9]">
            <option value="recent">Cele mai recente</option>
            <option value="pret_asc">Preț crescător</option>
            <option value="pret_desc">Preț descrescător</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-white rounded-2xl h-60 animate-pulse border border-gray-100"/>)}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-gray-600 font-semibold mb-2">Niciun anunț în această categorie</div>
            <button onClick={() => setShowAddListing(true)} className="mt-3 px-6 py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm">
              Fii primul care adaugă un anunț
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.map(l => {
              const cond = CONDITIONS.find(c => c.key === l.condition)
              const daysAgo = Math.floor((new Date() - new Date(l.created_at)) / (1000 * 60 * 60 * 24))
              return (
                <div key={l.id} onClick={() => setSelectedListing(l)}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:border-[#4A90D9] transition-all">
                  <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl relative">
                    {CATEGORIES.find(c => c.key === l.category)?.icon || '📦'}
                    {l.is_promoted && (
                      <span className="absolute top-2 left-2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-0.5 rounded-lg">TOP</span>
                    )}
                    {cond && (
                      <span style={{ background: cond.color, color: cond.text }} className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-lg">{cond.label}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-black text-base text-gray-900 mb-1">
                      {l.price ? `${l.price.toLocaleString()} lei` : 'Preț negociabil'}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 mb-2">{l.title}</div>
                    <div className="text-xs text-gray-400 flex items-center justify-between">
                      <span>📍 {l.city || 'Locație'}</span>
                      <span>{daysAgo === 0 ? 'Azi' : `${daysAgo}z`}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal detalii anunț */}
      {selectedListing && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelectedListing(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedListing.title}</h2>
                <div className="text-sm text-gray-400 mt-1">📍 {selectedListing.city}</div>
              </div>
              <button onClick={() => setSelectedListing(null)} className="text-gray-400 text-xl border-none bg-transparent cursor-pointer ml-4">✕</button>
            </div>
            <div className="bg-gray-50 rounded-2xl h-48 flex items-center justify-center text-6xl mb-4">
              {CATEGORIES.find(c => c.key === selectedListing.category)?.icon || '📦'}
            </div>
            <div className="text-3xl font-black text-gray-900 mb-4">
              {selectedListing.price ? `${selectedListing.price.toLocaleString()} lei` : 'Preț negociabil'}
            </div>
            {selectedListing.description && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Descriere</div>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedListing.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {selectedListing.condition && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Stare</div>
                  <div className="font-bold text-sm">{CONDITIONS.find(c => c.key === selectedListing.condition)?.label}</div>
                </div>
              )}
              {selectedListing.compatible_brands && selectedListing.compatible_brands.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Compatibil cu</div>
                  <div className="font-bold text-sm">{selectedListing.compatible_brands.join(', ')}</div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <a href={`tel:${selectedListing.phone_contact || ''}`}
                className="flex-1 py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm text-center no-underline">
                📞 Contactează vânzătorul
              </a>
              <button onClick={() => setSelectedListing(null)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal adaugă anunț */}
      {showAddListing && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowAddListing(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,30,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Adaugă anunț</h3>
              <button onClick={() => setShowAddListing(false)} className="text-gray-400 text-xl border-none bg-transparent cursor-pointer">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Titlu anunț *</label>
                <input value={listingForm.title} onChange={e => setListingForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="ex: Plăcuțe frână față Brembo BMW E90"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Categorie</label>
                <select value={listingForm.category} onChange={e => setListingForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50">
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stare</label>
                <div className="flex gap-2">
                  {CONDITIONS.map(c => (
                    <button key={c.key} onClick={() => setListingForm(p => ({ ...p, condition: c.key }))}
                      style={{ background: listingForm.condition === c.key ? c.color : '#f8f8f8', color: listingForm.condition === c.key ? c.text : '#888', borderColor: listingForm.condition === c.key ? c.text : '#e0e0e0' }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer">
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preț (lei)</label>
                  <input type="number" value={listingForm.price} onChange={e => setListingForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Oraș</label>
                  <input value={listingForm.city} onChange={e => setListingForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="București"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Compatibil cu (mărci, separat cu virgulă)</label>
                <input value={listingForm.compatible_brands} onChange={e => setListingForm(p => ({ ...p, compatible_brands: e.target.value }))}
                  placeholder="BMW, Audi, Mercedes"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descriere</label>
                <textarea value={listingForm.description} onChange={e => setListingForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Descrie piesa în detaliu..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50 resize-none"/>
              </div>
              <button onClick={addListing} disabled={saving || !listingForm.title}
                className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors disabled:opacity-50">
                {saving ? 'Se publică...' : '📢 Publică anunțul gratuit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ListingsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin"/></div>}>
    <ListingsContent/>
  </Suspense>
}
