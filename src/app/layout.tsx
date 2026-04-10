// @ts-nocheck
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import GlobalLayout from '@/components/layout/GlobalLayout'

export const metadata: Metadata = {
  title: 'Reparo — Platforma de servicii auto',
  description: 'Găsește cel mai bun service auto din zona ta. Cere oferte gratuite, compară prețuri și rezervă programarea online.',
  keywords: 'service auto, reparatii auto, schimb ulei, oferta service, ITP, RCA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <GlobalLayout>{children}</GlobalLayout>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#0a1f44', color: '#fff', borderRadius: '50px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" },
            success: { iconTheme: { primary: '#34C759', secondary: '#fff' } },
            error: { iconTheme: { primary: '#FF3B30', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
