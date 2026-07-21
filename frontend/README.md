# DrInsight Frontend

Next.js 16 app for the DrInsight healthcare platform — public site, patient dashboard, doctor dashboard, and admin panel.

## Prerequisites

- Node.js 20+ (see root `.nvmrc`)
- Backend API running on http://localhost:4000

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Environment

Copy `.env.example` to `.env.local`. Key variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend REST API (default: `http://localhost:4000/api/v1`) |
| `NEXT_PUBLIC_WS_URL` | Socket.IO server (default: `http://localhost:4000`) |
| `JWT_ACCESS_SECRET` | Must match `JWT_ACCESS_SECRET` in `backend/.env` |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- TanStack Query · Zustand · Socket.IO client
- Radix UI / shadcn-style components

See the [root README](../README.md) for full project setup.
