# Reparo 🔧
Platforma de servicii auto — Next.js 14 + Supabase

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend)
- **Plati**: Stripe (faza 2)

## Structura proiect
```
src/
├── app/
│   ├── page.tsx                 # Root — redirect logic
│   ├── home/                    # Homepage public
│   ├── auth/
│   │   ├── login/               # Pagina login
│   │   ├── register/            # Pagina inregistrare (user + service)
│   │   └── callback/            # OAuth callback Supabase
│   ├── dashboard/
│   │   ├── service/             # Dashboard proprietar service
│   │   └── user/                # Dashboard utilizator
│   ├── service/[slug]/          # Profil public service
│   ├── search/                  # Rezultate cautare
│   ├── listing/                 # Anunturi piese
│   ├── account/                 # Contul meu (masini, istoric, documente)
│   └── api/
│       ├── quote-requests/      # API cereri oferta
│       ├── offers/              # API oferte
│       └── appointments/        # API programari
├── components/
│   ├── ui/                      # Button, Input, Badge, Modal etc.
│   ├── layout/                  # Navbar, Footer, Sidebar
│   ├── forms/                   # QuoteRequestForm, OfferForm etc.
│   ├── service/                 # ServiceCard, ServiceProfile etc.
│   └── listing/                 # ListingCard, ListingForm etc.
├── hooks/
│   ├── useUser.ts               # Hook autentificare
│   └── useNotifications.ts      # Hook notificari realtime
├── lib/
│   └── supabase/
│       ├── client.ts            # Client-side Supabase
│       ├── server.ts            # Server-side Supabase
│       └── middleware.ts        # Auth middleware
└── types/
    └── database.ts              # Tipuri TypeScript din schema

## Pornire rapida

### 1. Cloneaza / descarca proiectul
```bash
# Instaleaza dependentele
npm install
```

### 2. Configureaza Supabase
1. Creaza cont gratuit pe [supabase.com](https://supabase.com)
2. New Project → da un nume (reparo)
3. Settings → SQL Editor → lipeste continutul din `reparo_supabase_schema.sql` → Run
4. Settings → API → copiaza `URL` si `anon public key`

### 3. Configureaza variabilele de mediu
```bash
cp .env.example .env.local
# Editeaza .env.local cu datele tale Supabase
```

### 4. Porneste serverul
```bash
npm run dev
# Deschide http://localhost:3000
```

## Deploy pe Vercel
```bash
# Instaleaza Vercel CLI
npm i -g vercel

# Deploy
vercel

# Adauga variabilele de mediu in Vercel Dashboard
# Settings > Environment Variables
```

## Supabase — setari suplimentare
- **Authentication** > Email Templates — personalizeaza emailurile de confirmare
- **Authentication** > URL Configuration — adauga `https://reparo.ro/auth/callback`
- **Storage** — creeaza bucket-urile: avatars, car-media, service-media, quote-media, listing-media, work-media, invoices
- **Edge Functions** — pentru reminder-uri ITP/RCA (cron job zilnic)

## Monetizare (faza 2)
- Abonamente service: Stripe Subscriptions
- Promovare anunturi: Stripe Payments
- Comision per lucrare: Stripe Connect

## Roadmap
- [x] Schema baza de date completa
- [x] Autentificare (email + Google OAuth)
- [x] Homepage
- [x] Formular cerere oferta
- [ ] Profil service public
- [ ] Dashboard service
- [ ] Dashboard utilizator
- [ ] Notificari realtime
- [ ] Calendar programari
- [ ] Statusul lucrarii live
- [ ] Sistem review-uri
- [ ] Plati Stripe
- [ ] App mobila (React Native)
 
