import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/account',
          '/messages',
          '/oferte',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://reparo-omega.vercel.app/sitemap.xml',
  }
}
