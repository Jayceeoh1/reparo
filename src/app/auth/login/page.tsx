'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Email sau parolă incorectă')
      setLoading(false)
      return
    }

    if (!data.user) {
      toast.error('Eroare la autentificare')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    toast.success('Bine ai revenit!')

    setTimeout(() => {
      const role = (profile as any)?.role
      if (role === 'service') {
        window.location.href = '/dashboard/service'
      } else {
        window.location.href = '/home'
      }
    }, 800)

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-tight">
            <span className="w-9 h-9 bg-[#4A90D9] rounded-xl flex items-center justify-center text-lg font-black">R</span>
            Reparo
          </Link>
          <p className="text-white/50 text-sm mt-2">Intră în contul tău</p>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ion@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Parolă</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A90D9] bg-gray-50"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-[#4A90D9] text-white font-bold rounded-xl text-sm hover:bg-[#3378c0] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Se verifică...' : 'Intră în cont'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Nu ai cont?{' '}
            <Link href="/auth/register" className="text-[#4A90D9] font-semibold hover:underline">
              Înregistrează-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
