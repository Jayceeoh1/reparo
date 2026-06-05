// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('title, price, city, description')
    .eq('id', params.id)
    .single() as { data: { title: string, price: number|null, city: string|null, description: string|null } | null, error: any }

  if (!listing) return { title: 'Anunț piese — Serviceclub' }

  const title = `${listing.title} — ${listing.price ? listing.price + ' RON' : 'Preț negociabil'} | Serviceclub`
  const description = listing.description
    ? listing.description.slice(0, 155)
    : `${listing.title} de vânzare în ${listing.city||'România'}. Vezi detalii și contactează vânzătorul pe Serviceclub.`
  const url = `https://serviceclub.ro/listing/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Serviceclub — Piese Auto România',
      type: 'website',
      locale: 'ro_RO',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: url },
  }
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
