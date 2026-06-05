import type { Metadata, Viewport } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
const GlobalLayout = dynamic(() => import('@/components/layout/GlobalLayout'), { ssr: false })

const APP_URL = 'https://serviceclub.ro'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Serviceclub — Servicii Auto România | Cereri ofertă gratuite',
    template: '%s | Serviceclub',
  },
  description: 'Găsește cel mai bun service auto din zona ta. Cere oferte gratuite, compară prețuri și rezervă programarea online. ITP, RCA, piese auto, dezmembrări — totul într-un singur loc.',
  keywords: [
    'service auto', 'reparatii auto', 'ITP Romania', 'RCA ieftin', 'piese auto',
    'dezmembrari auto', 'oferta service auto', 'programare service', 'mecanica auto',
    'vopsitorie auto', 'geometrie roti', 'schimb ulei', 'diagnoza auto', 'service Bucuresti',
    'service Cluj', 'service Timisoara', 'service Iasi', 'service Brasov',
  ],
  authors: [{ name: 'Serviceclub', url: APP_URL }],
  creator: 'Serviceclub',
  publisher: 'Serviceclub',
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
    title: 'Serviceclub',
  },
  openGraph: {
    title: 'Serviceclub — Servicii Auto România',
    description: 'Găsește cel mai bun service auto din zona ta. Cereri de ofertă gratuite, ITP, RCA, piese auto.',
    url: APP_URL,
    siteName: 'Serviceclub',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Serviceclub — Platformă servicii auto România',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serviceclub — Servicii Auto România',
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
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <link rel="icon" type="image/svg+xml" href="/icon.svg"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="Serviceclub"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Serviceclub',
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
      <body suppressHydrationWarning>
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  )
}
