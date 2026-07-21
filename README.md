# DrInsight

Production-grade healthcare SaaS platform — medical consultations, doctor directory, real-time chat, health tools, and AI-powered features.

![Stack](https://img.shields.io/badge/Next.js-16-black)
![Stack](https://img.shields.io/badge/NestJS-11-red)
![Stack](https://img.shields.io/badge/Prisma-7-2D3748)
![Stack](https://img.shields.io/badge/PostgreSQL-16-336791)

## Repository Structure

```
DrInsigt/
├── frontend/          Next.js 16 · React · Tailwind · shadcn/ui · Zustand · TanStack Query
├── backend/           NestJS · Prisma · PostgreSQL · Redis · Socket.IO · JWT
├── ai-service/        FastAPI · symptom checker · medical chatbot · report summarization
├── docker-compose.yml PostgreSQL · Redis · optional full stack
└── docs/              Deployment guides (e.g. Coturn TURN/STUN)
```

## Getting Started

### Prerequisites

- **Node.js 20+** (22 recommended — see `.nvmrc`)
- **npm 10+**
- **Docker Desktop** (for PostgreSQL & Redis)
- **Python 3.12+** (optional, for AI service)

### 1. Clone & install

```bash
git clone https://github.com/imtiaz-junejo/DrInsight.git
cd DrInsight

# Frontend
cd frontend && npm install && cp .env.example .env.local && cd ..

# Backend
cd backend && npm install && cp .env.example .env && cd ..
```

### 2. Start database services

```bash
docker compose up -d postgres redis
```

This starts PostgreSQL (`drinsight` / `drinsight` on port 5432) and Redis (port 6379).  
The default `DATABASE_URL` in `backend/.env.example` matches these credentials.

### 3. Backend setup

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed-review
npm run start:dev
```

→ API: http://localhost:4000/api/v1  
→ Swagger: http://localhost:4000/api/docs

See **[backend/README.md](./backend/README.md)** for full backend documentation.

### 4. Frontend

```bash
cd frontend
npm run dev
```

→ App: http://localhost:3000

### 5. AI service (optional)

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Demo Accounts

After `npm run prisma:seed-review` (recommended for client review):

| Email | Password | Role |
|-------|----------|------|
| admin1@drinsight.pk | Password123! | Admin |
| doctor1@drinsight.pk | Password123! | Doctor |
| patient1@drinsight.pk | Password123! | Patient |

Basic seed (`npx prisma db seed`) also creates:

| Email | Password | Role |
|-------|----------|------|
| admin@drinsight.com | Password123! | Admin |
| doctor@drinsight.com | Password123! | Doctor |
| patient@drinsight.com | Password123! | Patient |

## Environment Files

Each service includes a `.env.example`. Copy to `.env` / `.env.local` and fill in values.

| Service | Template | Local file (gitignored) |
|---------|----------|-------------------------|
| Backend | `backend/.env.example` | `backend/.env` |
| Frontend | `frontend/.env.example` | `frontend/.env.local` |
| AI | `ai-service/.env.example` | `ai-service/.env` |

**Important:** `JWT_ACCESS_SECRET` must match between `backend/.env` and `frontend/.env.local`.

**Never commit real `.env` files.** Only `.env.example` templates are tracked.

## Docker (full stack)

Create env files first (`backend/.env`, `frontend/.env.local`, `ai-service/.env`), then:

```bash
docker compose --profile full up --build
```

For local development, only infrastructure is needed:

```bash
docker compose up -d postgres redis
```

## Features

- **Auth** — JWT + refresh tokens, role-based access (Admin / Doctor / Patient)
- **Doctors** — Searchable directory with specialties, ratings, availability
- **Appointments** — Video, audio, chat, and in-person consultations
- **Real-time chat** — Socket.IO with typing indicators and online status
- **Blog** — Dynamic medical articles with categories
- **Prescriptions & reviews** — Post-consultation workflow
- **Video calls** — Swappable WebRTC / Agora / Twilio / Daily.co
- **AI layer** — Symptom checker, medical chatbot, report summarization
- **Storage** — Cloudinary or AWS S3 for uploads

## Design

DrInsight branding with the original medical platform color palette:

- Primary blue `#1a56a0` · Dark `#0f3d7a` · Teal `#0891b2`
- Fonts: Playfair Display + DM Sans
- Shared TopBar, Navbar, and Footer across all public pages

## License

Private / UNLICENSED — All rights reserved.
