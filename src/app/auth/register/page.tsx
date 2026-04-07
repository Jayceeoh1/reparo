'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<'user' | 'service'>('user')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role, phone: form.phone, city: form.city },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14L11 20L23 8" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifică email-ul!</h2>
        <p className="text-gray-500 text-sm">Ti-am trimis un link de confirmare la <strong>{form.email}</strong>. Apasă linkul din email pentru a activa contul.</p>
        <Link href="/auth/login" className="block mt-6 text-[#4A90D9] font-semibold text-sm hover:underline">Înapoi la login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-tight">
            <span className="w-9 h-9 bg-[#4A90D9] rounded-xl flex items-center justify-center text-lg font-black">R</span>
            Reparo
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8">
          {step === 'role' ? (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Bine ai venit!</h2>
              <p className="text-sm text-gray-500 mb-6">Ce tip de cont vrei să creezi?</p>
              <div className="space-y-3 mb-6">
                {[
                  { val: 'user', label: 'Sunt șofer / proprietar auto', desc: 'Caut service-uri, cer oferte, fac programări', icon: '🚗' },
                  { val: 'service', label: 'Dețin un service auto', desc: 'Primesc cereri, trimit oferte, gestionez programări', icon: '🔧' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setRole(opt.val as 'user'|'service')}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${role === opt.val ? 'border-[#4A90D9] bg-[#E6F0FB]' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">{opt.icon} {opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('form')}
                className="w-full py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm hover:bg-[#3378c0] transition-colors">
                Continuă →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep('role')} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Înapoi
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {role === 'service' ? '🔧 Cont service auto' : '🚗 Cont șofer'}
              </h2>
              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { key: 'full_name', label: role === 'service' ? 'Numele service-ului' : 'Numele tău', placeholder: role === 'service' ? 'AutoPro Service SRL' : 'Ion Popescu', type: 'text' },
                  { key: 'email', label: 'Email', placeholder: 'ion@example.com', type: 'email' },
                  { key: 'password', label: 'Parolă (minim 8 caractere)', placeholder: '••••••••', type: 'password' },
                  { key: 'phone', label: 'Telefon', placeholder: '07xx xxx xxx', type: 'tel' },
                  { key: 'city', label: 'Oraș', placeholder: 'București', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
                    <input
                      type={field.type} required={field.key !== 'phone'} placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
                    />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl text-sm hover:bg-[#e55a26] transition-colors disabled:opacity-50 mt-2">
                  {loading ? 'Se creează contul...' : 'Creează contul gratuit'}
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">
                Prin înregistrare ești de acord cu{' '}
                <Link href="/termeni" className="text-[#4A90D9] hover:underline">Termenii și condițiile</Link>
              </p>
            </>
          )}
          <p className="text-center text-sm text-gray-500 mt-4">
            Ai deja cont?{' '}
            <Link href="/auth/login" className="text-[#4A90D9] font-semibold hover:underline">Intră în cont</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
