// @ts-nocheck
'use client'
import { useEffect } from 'react'

export default function UserDashboard() {
  useEffect(() => {
    window.location.href = '/account'
  }, [])
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888', fontSize: 14 }}>Se redirecționează...</div>
    </div>
  )
}
