import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Reparo — Servicii Auto România'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: 'linear-gradient(135deg, #0a1f44 0%, #1a3a6b 60%, #0d2854 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, background: '#1a56db', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
          }}>R</div>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>Reparo</span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 64, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20, letterSpacing: -2 }}>
          Mai mulți clienți.<br/>
          <span style={{ color: '#f59e0b' }}>Mai puțin efort.</span>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.65)', marginBottom: 40, lineHeight: 1.5 }}>
          Platformă #1 pentru service-uri auto din România
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40 }}>
          {[['2.400+', 'Service-uri'], ['48.000+', 'Cereri trimise'], ['4.8/5', 'Rating mediu']].map(([val, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>{val}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: 'absolute', top: 40, right: 80, fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
          reparo-omega.vercel.app
        </div>
      </div>
    ),
    { ...size }
  )
}
