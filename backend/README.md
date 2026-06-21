# DrInsight Backend API

NestJS REST API for the **DrInsight** healthcare platform — doctor consultations, patient management, real-time chat, appointments, blogs, prescriptions, and AI integrations.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | NestJS 11 (TypeScript) |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Cache / Pub-Sub | Redis (ioredis) |
| Real-time | Socket.IO (`/realtime` namespace) |
| Auth | JWT + refresh tokens, bcrypt, RBAC |
| API Docs | Swagger OpenAPI |
| Storage | Cloudinary (default) / AWS S3 (optional) |
| Video | WebRTC / Agora / Twilio / Daily.co (swappable) |

## Prerequisites

- **Node.js** 20+ (22 recommended)
- **npm** 10+
- **PostgreSQL** 16+ (local or Docker)
- **Redis** 7+ (local or Docker)

## Quick Start

### 1. Start infrastructure (from repo root)

```bash
docker compose up -d postgres redis
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL and secrets. **Never commit `.env` to Git.**

### 4. Database setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (development)
npm run prisma:migrate

# Seed demo accounts + sample blog post
npx ts-node prisma/seed.ts
# or
npx prisma db seed
```

### 5. Run the API

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

| Service | URL |
|---------|-----|
| API base | http://localhost:4000/api/v1 |
| Swagger docs | http://localhost:4000/api/docs |
| Socket.IO | http://localhost:4000/realtime |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database models & enums
│   ├── migrations/         # Version-controlled SQL migrations
│   └── seed.ts             # Demo data seeder
├── prisma.config.ts        # Prisma 7 config (datasource URL)
├── src/
│   ├── auth/               # JWT auth, register, login, refresh
│   ├── users/              # User profile management
│   ├── doctors/            # Doctor directory & profiles
│   ├── appointments/       # Booking & status updates
│   ├── blog/               # Articles & categories
│   ├── chat/               # Conversations & messages
│   ├── notifications/      # In-app notifications
│   ├── reviews/            # Doctor ratings
│   ├── prescriptions/      # Prescription records
│   ├── storage/            # File uploads (Cloudinary/S3)
│   ├── video/              # Video call token generation
│   ├── ai/                 # Proxy to FastAPI AI service
│   ├── gateway/            # Socket.IO real-time gateway
│   ├── redis/              # Redis pub/sub service
│   ├── prisma/             # PrismaService + client factory
│   └── common/             # Guards, decorators, filters
├── Dockerfile
├── .env.example
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection URL |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret (32+ chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret (32+ chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | Default: `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Default: `7d` |
| `PORT` | No | Default: `4000` |
| `NODE_ENV` | No | `development` \| `production` |
| `CORS_ORIGIN` | No | Frontend URL(s), comma-separated |
| `STORAGE_PROVIDER` | No | `CLOUDINARY` or `S3` |
| `CLOUDINARY_*` | If Cloudinary | Cloud name, API key, secret |
| `AWS_*` | If S3 | Bucket, region, credentials |
| `VIDEO_PROVIDER` | No | `WEBRTC`, `AGORA`, `TWILIO`, `DAILY` |
| `AGORA_*` / `TWILIO_*` / `DAILY_*` | If using provider | Video SDK credentials |
| `AI_SERVICE_URL` | No | FastAPI service URL (default: `http://localhost:8000`) |

---

## Database (Prisma 7)

Prisma 7 moves the database URL from `schema.prisma` to `prisma.config.ts`. The client requires a **driver adapter**:

```typescript
// src/prisma/create-prisma-client.ts
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

### Common commands

```bash
npm run prisma:generate    # Regenerate client after schema changes
npm run prisma:migrate     # Create & apply migration (dev)
npm run prisma:deploy      # Apply migrations (production/CI)
npm run prisma:studio      # Visual database browser
npx prisma db seed         # Run seed script
```

### Schema overview

| Model | Purpose |
|-------|---------|
| `User` | Accounts with roles: ADMIN, DOCTOR, PATIENT |
| `DoctorProfile` | Specialty, fees, availability, ratings |
| `PatientProfile` | Medical history, allergies, emergency contact |
| `Appointment` | Scheduled consultations (video/audio/chat/in-person) |
| `BlogPost` / `BlogCategory` | Medical articles |
| `Conversation` / `Message` | Doctor–patient chat |
| `Notification` | Real-time alerts |
| `Review` | Patient feedback on doctors |
| `Prescription` | Post-consultation prescriptions |
| `RefreshToken` | JWT refresh token rotation |
| `AskDoctorQuestion` | Public Q&A submissions |

---

## API Modules

All REST routes are prefixed with `/api/v1`.

### Authentication (`/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | Public | Register patient or doctor |
| POST | `/auth/login` | Public | Login, returns tokens + user |
| POST | `/auth/refresh` | Public | Rotate access token |
| POST | `/auth/logout` | Bearer | Revoke refresh token |
| GET | `/auth/me` | Bearer | Current user profile |

### Doctors (`/doctors`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/doctors` | Public | List doctors (filter, paginate) |
| GET | `/doctors/specialties` | Public | Specialty list with counts |
| GET | `/doctors/:id` | Public | Doctor profile + reviews |
| PATCH | `/doctors/profile` | Doctor | Update own profile |

### Appointments (`/appointments`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/appointments` | Patient | Book consultation |
| GET | `/appointments` | Bearer | List own appointments |
| PATCH | `/appointments/:id/status` | Bearer | Update status |

### Blog (`/blog`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/blog` | Public | List published posts |
| GET | `/blog/categories` | Public | Categories |
| GET | `/blog/:slug` | Public | Single article |
| POST | `/blog` | Admin/Doctor | Create post |

### Chat (`/chat`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/chat/conversations` | Bearer | List conversations |
| POST | `/chat/conversations` | Patient | Start conversation |
| GET | `/chat/conversations/:id/messages` | Bearer | Message history |
| POST | `/chat/conversations/:id/messages` | Bearer | Send message |

### Other modules

- **Notifications** — `/notifications`
- **Reviews** — `/reviews`
- **Prescriptions** — `/prescriptions` (doctor create, both roles read)
- **Storage** — `/storage/upload` (multipart file upload)
- **Video** — `/video/token` (call room token)
- **AI** — `/ai/symptom-checker`, `/ai/medical-chat`, etc.

Full interactive docs: **http://localhost:4000/api/docs**

---

## Authentication & Roles

### Roles

| Role | Access |
|------|--------|
| `PATIENT` | Book appointments, chat, reviews, own dashboard |
| `DOCTOR` | Manage appointments, prescriptions, chat, blog posts |
| `ADMIN` | Full platform access |

### JWT flow

1. Login → receive `accessToken` (15 min) + `refreshToken` (7 days)
2. Send `Authorization: Bearer <accessToken>` on protected routes
3. On 401 → POST `/auth/refresh` with refresh token
4. Logout → POST `/auth/logout` revokes refresh token

### Future auth providers

The `AuthProvider` interface in `src/auth/interfaces/` supports swapping JWT for **Clerk** or **Auth.js** without rewriting modules.

---

## Real-Time (Socket.IO)

**Namespace:** `/realtime`  
**Auth:** Pass JWT in handshake: `{ auth: { token: '<accessToken>' } }`

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_conversation` | Client → Server | Join chat room |
| `leave_conversation` | Client → Server | Leave chat room |
| `send_message` | Client → Server | Send chat message |
| `new_message` | Server → Client | Incoming message |
| `typing_start` / `typing_stop` | Both | Typing indicators |
| `user_online` / `user_offline` | Server → All | Presence |
| `notification` | Server → User | Push notification |
| `appointment_update` | Server → User | Appointment changes |

Redis pub/sub scales events across multiple server instances.

---

## Seed Data

After running the seed script:

| Email | Password | Role |
|-------|----------|------|
| admin@drinsight.com | Password123! | ADMIN |
| doctor@drinsight.com | Password123! | DOCTOR |
| patient@drinsight.com | Password123! | PATIENT |

Also creates a sample Cardiology blog post.

---

## Docker

Build and run the backend container (from repo root):

```bash
docker compose up -d backend
```

The backend Dockerfile runs `prisma migrate deploy` before starting.

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled production build |
| `npm run lint` | ESLint with auto-fix |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Dev migrations |
| `npm run prisma:deploy` | Production migrations |
| `npm run prisma:studio` | Database GUI |

---

## Troubleshooting

### `datasource.url property is required`

Ensure `prisma.config.ts` has `datasource.url` and `.env` contains `DATABASE_URL`. The config loads `.env` via `import "dotenv/config"`.

### `PrismaClient needs to be constructed with valid PrismaClientOptions`

Prisma 7 requires a driver adapter. Use `createPrismaClient()` from `src/prisma/create-prisma-client.ts` — do not call `new PrismaClient()` without options.

### Database connection refused

```bash
# Verify Postgres is running
docker compose ps postgres
docker compose logs postgres
```

### Redis connection errors

Real-time features need Redis. Start it with `docker compose up -d redis` or update `REDIS_URL`.

### CORS errors from frontend

Set `CORS_ORIGIN=http://localhost:3000` in `.env` (match your frontend URL).

---

## Security Notes for Production

- Generate strong random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Use HTTPS in production
- Set `NODE_ENV=production`
- Restrict `CORS_ORIGIN` to your domain only
- Never commit `.env` files — only `.env.example`
- Rotate refresh tokens on use (already implemented)

---

## License

UNLICENSED — Private project. See repository root for license terms.
