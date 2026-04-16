import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://reparo-omega.vercel.app'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/home`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/listing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/piese-oferta`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/itp-rca`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/despre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/termeni`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/confidentialitate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/dezmembrari-abonamente`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  try {
    const supabase = createClient()
    const { data: services } = await supabase
      .from('services')
      .select('id, updated_at')
      .eq('is_active', true)
      .limit(500)

    const serviceRoutes: MetadataRoute.Sitemap = ((services || []) as any[]).map(s => ({
      url: `${base}/service/${s.id}`,
      lastModified: new Date(s.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...serviceRoutes]
  } catch {
    return staticRoutes
  }
}
