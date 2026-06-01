import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: service } = await supabase
    .from('services')
    .select('name, city, description, logo_url, cover_image_url, rating_avg, rating_count, is_verified')
    .eq('id', params.id)
    .single()

  if (!service) return { title: 'Service auto — Reparo' }

  const title = `${service.name} — Service auto în ${service.city} | Reparo`
  const description = service.description
    ? `${service.description.slice(0, 155)}...`
    : `${service.name} — service auto în ${service.city}. Rating ${(service.rating_avg||0).toFixed(1)}/5 din ${service.rating_count||0} recenzii. Cere ofertă gratuită pe Reparo.`
  const image = service.cover_image_url || service.logo_url || 'https://reparo-omega.vercel.app/og-default.png'
  const url = `https://reparo-omega.vercel.app/service/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Reparo — Servicii Auto România',
      images: [{ url: image, width: 1200, height: 630, alt: service.name }],
      type: 'website',
      locale: 'ro_RO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
    other: {
      'og:rating': String(service.rating_avg || 0),
      'og:rating_count': String(service.rating_count || 0),
    }
  }
}

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
