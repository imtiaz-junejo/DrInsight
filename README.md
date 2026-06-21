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
├── shared/            Shared TypeScript types/interfaces
├── docker-compose.yml PostgreSQL · Redis · all services
└── *.html             Original static HTML reference (pre-migration)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL & Redis)
- Python 3.12+ (optional, for AI service)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/DrInsight.git
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

### 3. Backend setup

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
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
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Demo Accounts

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

**Never commit real `.env` files.** Only `.env.example` templates are tracked.

## Docker (full stack)

```bash
docker compose up --build
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
