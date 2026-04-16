import type { Metadata, Viewport } from 'next'
import './globals.css'
import GlobalLayout from '@/components/layout/GlobalLayout'

const APP_URL = 'https://reparo-omega.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Reparo — Servicii Auto România | Cereri ofertă gratuite',
    template: '%s | Reparo Auto',
  },
  description: 'Găsește cel mai bun service auto din zona ta. Cere oferte gratuite, compară prețuri și rezervă programarea online. ITP, RCA, piese auto, dezmembrări — totul într-un singur loc.',
  keywords: [
    'service auto', 'reparatii auto', 'ITP Romania', 'RCA ieftin', 'piese auto',
    'dezmembrari auto', 'oferta service auto', 'programare service', 'mecanica auto',
    'vopsitorie auto', 'geometrie roti', 'schimb ulei', 'diagnoza auto', 'service Bucuresti',
    'service Cluj', 'service Timisoara', 'service Iasi', 'service Brasov',
  ],
  authors: [{ name: 'Reparo', url: APP_URL }],
  creator: 'Reparo',
  publisher: 'Reparo',
  category: 'Automotive',
  manifest: '/manifest.json',
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Reparo Auto',
  },
  openGraph: {
    title: 'Reparo — Servicii Auto România',
    description: 'Găsește cel mai bun service auto din zona ta. Cereri de ofertă gratuite, ITP, RCA, piese auto.',
    url: APP_URL,
    siteName: 'Reparo',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Reparo — Platformă servicii auto România',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reparo — Servicii Auto România',
    description: 'Găsește cel mai bun service auto. Cereri gratuite, ITP, RCA, piese.',
    images: [`${APP_URL}/og-image.png`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a1f44',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <link rel="icon" type="image/svg+xml" href="/icon.svg"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="Reparo"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Reparo',
              url: APP_URL,
              description: 'Platformă de conectare service-uri auto cu clienții din România',
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${APP_URL}/search?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  )
}
