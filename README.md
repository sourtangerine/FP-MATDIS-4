# Bantuan Bencana - Sistem Distribusi

Sistem Penyaluran Bantuan Bencana dengan optimasi rute menggunakan algoritma Dijkstra.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon for production)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Maps**: Leaflet.js + React-Leaflet + OSRM (road routing)
- **Algorithm**: Dijkstra (TypeScript, server-side)
- **Containers**: Docker Compose

## Local Development

```bash
# 1. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual credentials (see CREDENTIALS.md.gpg)

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
docker compose up --build
```

## Credentials

Login credentials and secrets are stored in an encrypted file: **`CREDENTIALS.md.gpg`**

To decrypt:
```bash
gpg --decrypt CREDENTIALS.md.gpg
```

Contact the project maintainer for the decryption passphrase.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT signing key |
| `NEXTAUTH_URL` | Public app URL |

> ⚠️ Actual values are in the encrypted credentials file. Never commit secrets to source control.

## Vercel Deployment

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project → copy the `DATABASE_URL`
3. Push this repo to GitHub
4. Import the repo in [vercel.com](https://vercel.com) → New Project
5. Add environment variables in Vercel's **Settings → Environment Variables**
6. Set Vercel build command to: `npm run vercel-build`
7. Deploy
8. Seed the database via Neon SQL console or the `/api/seed` endpoint (admin-protected)

## Security Notes

- All passwords in the database are **bcrypt-hashed** (cost factor 10).
- JWT tokens are signed with `NEXTAUTH_SECRET` — rotate periodically.
- The `/api/seed` endpoint requires ADMIN role authentication.
- API routes validate sessions; unauthorized requests return 401/403.
- Role-based access control restricts page and API access per user role.

## Features

- **Dashboard**: Real-time statistics, distribution summary, efficiency metrics, and map overview
- **Map**: Interactive map with all aid points, Dijkstra route planner, vehicle assignment
- **Laporan**: Distribution reports with filters, CSV export, status management
- **Monitoring**: Real-time monitoring of active aid points with status updates
- **Authentication**: Role-based access control (Admin, Operator, Koordinator Lapangan)
- **Dijkstra Algorithm**: Optimal route calculation between graph nodes
- **OSRM Routing**: Real road-following routes (no straight-line cuts)

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
