import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reparo — Servicii Auto România',
  description: 'Găsește cel mai bun service auto din zona ta. Cereri de ofertă gratuite, comparare prețuri, programări online.',
  keywords: 'service auto, reparatii auto, ITP, RCA, piese auto, Romania',
  authors: [{ name: 'Reparo' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Reparo',
  },
  openGraph: {
    title: 'Reparo — Servicii Auto România',
    description: 'Găsește cel mai bun service auto din zona ta.',
    type: 'website',
    locale: 'ro_RO',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a1f44',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="Reparo"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="msapplication-TileImage" content="/icons/icon-144.png"/>
        <meta name="msapplication-TileColor" content="#0a1f44"/>
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('SW registered');
              }).catch(function(err) {
                console.log('SW failed:', err);
              });
            });
          }
        `}}/>
      </body>
    </html>
  )
}
