# Bantuan Bencana - Sistem Distribusi

Sistem Penyaluran Bantuan Bencana dengan optimasi rute menggunakan algoritma Dijkstra.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon for production)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Maps**: Leaflet.js + React-Leaflet
- **Algorithm**: Dijkstra (TypeScript, server-side)
- **Containers**: Docker Compose

## Local Development

```bash
# 1. Copy environment variables
cp .env.example .env.local

# 2. Start PostgreSQL with Docker
docker compose up -d db

# 3. Install dependencies
npm install

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed the database
npx prisma db seed

# 6. Start development server
npm run dev
```

Visit http://localhost:3000

## Docker (Full Stack)

```bash
# Build and start all services
docker compose up --build

# Visit http://localhost:3000
```

## Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@bantuan.id | password123 | Admin |
| operator@bantuan.id | password123 | Operator |
| koordinator@bantuan.id | password123 | Koordinator Lapangan |

## Vercel Deployment

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project → copy the `DATABASE_URL`
3. Push this repo to GitHub
4. Import the repo in [vercel.com](https://vercel.com) → New Project
5. Add environment variables:
   - `DATABASE_URL` = (from Neon)
   - `NEXTAUTH_SECRET` = (run: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = `https://your-project.vercel.app`
6. Set Vercel build command to: `npm run vercel-build`
7. Deploy
8. Run seed via Neon SQL console or access `/api/seed` (admin-protected) to seed the database

## Features

- **Dashboard**: Real-time statistics, distribution summary, efficiency metrics, and map overview
- **Map**: Interactive map with all aid points, Dijkstra route planner, vehicle assignment
- **Laporan**: Distribution reports with filters, CSV export, status management
- **Monitoring**: Real-time monitoring of active aid points with status updates
- **Authentication**: Role-based access control (Admin, Operator, Koordinator Lapangan)
- **Dijkstra Algorithm**: Optimal route calculation between graph nodes

## Project Structure

```
src/
├── app/
│   ├── (protected)/     ← Authenticated pages with sidebar
│   │   ├── dashboard/
│   │   ├── map/
│   │   ├── laporan/
│   │   └── monitoring/
│   ├── login/
│   └── api/
│       ├── auth/
│       ├── titik-bantuan/
│       ├── kendaraan/
│       ├── distribusi/
│       ├── rute/
│       └── dashboard/stats/
├── components/
├── lib/
└── types/
```
