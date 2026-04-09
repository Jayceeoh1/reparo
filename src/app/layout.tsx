// @ts-nocheck
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import GlobalLayout from '@/components/layout/GlobalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reparo — Platforma de servicii auto',
  description: 'Găsește cel mai bun service auto din zona ta. Cere oferte gratuite, compară prețuri și rezervă programarea online.',
  keywords: 'service auto, reparatii auto, schimb ulei, oferta service, ITP, RCA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <GlobalLayout>
          {children}
        </GlobalLayout>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#1a2332', color: '#fff', borderRadius: '10px', fontSize: '14px' },
            success: { iconTheme: { primary: '#34C759', secondary: '#fff' } },
            error: { iconTheme: { primary: '#FF3B30', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
