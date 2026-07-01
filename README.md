# SN58 Validator Dashboard

A locally runnable MERN application that simulates an SN58-inspired validator operations dashboard. The project is designed as a professional starter for learning and evaluating full-stack TypeScript work.

This application is a **local SN58-inspired simulation**. It is not connected to Bittensor, does not use a wallet, and does not read live chain data. All hotkeys, scores, emissions, and ranks are fictional demo values.

## 1. Project overview

Operators can sign in, inspect simulated validators and miners, review dashboard statistics, and manage miner records through a React dashboard backed by an Express API and MongoDB.

## 2. Architecture

The repository is an npm workspaces monorepo:

- `client/` — React + TypeScript SPA (Vite)
- `server/` — Express + TypeScript REST API
- `shared/` — shared TypeScript types and constants

```
React (Vite)  →  Express REST API  →  MongoDB
                     ↑
                 JWT session
```

The frontend never hardcodes dashboard totals. All lists, stats, and miner history are loaded from the API.

## 3. Technology stack

**Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Axios, responsive CSS

**Backend:** Node.js, Express, TypeScript, Mongoose, JWT, bcrypt, Zod, Helmet, CORS, rate limiting

**Database:** MongoDB

**Testing:** Vitest, React Testing Library, Supertest, MongoDB Memory Server, MSW

**Tooling:** npm workspaces, ESLint, Prettier, Docker Compose (optional MongoDB)

## 4. Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB 6+ listening on `127.0.0.1:27017`, or Docker to start one

No cloud accounts, API keys, wallets, or paid services are required.

## 5. Installation

```bash
git clone <this-repository>
cd sn58-validator-dashboard
copy .env.example .env
npm install
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

## 6. Environment configuration

`.env.example` contains local defaults:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API port | `4000` |
| `MONGODB_URI` | Local MongoDB connection string | `mongodb://127.0.0.1:27017/sn58-validator-dashboard` |
| `JWT_SECRET` | Signing secret for access tokens | development placeholder |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:4000/api` |

Do not commit a real `.env` file. Change `JWT_SECRET` before sharing an environment.

## 7. MongoDB setup

Option A — local MongoDB:

1. Install MongoDB Community Server.
2. Start `mongod`.
3. Confirm it accepts connections at `mongodb://127.0.0.1:27017`.

Option B — Docker Compose:

```bash
docker compose up -d
```

This starts a MongoDB 7 container on port 27017.

## 8. Database seeding

```bash
npm run seed
```

The seed script replaces existing collections and inserts:

- 3 users
- 5 validators
- 30 miners with 14-day simulated performance history
- 50+ activity records

**Development-only login**

- Email: `admin@example.com`
- Password: `ChangeMe123!`

These credentials exist only for local development. Do not reuse them outside this machine.

Additional seed users: `operator@example.com` and `viewer@example.com` (same password).

## 9. Running the application

```bash
npm run dev
```

This starts the API at [http://localhost:4000](http://localhost:4000) and the dashboard at [http://localhost:5173](http://localhost:5173).

The login page shows a unique **candidate key** created on first launch and stored in `.candidate-key` (not committed). Send that key to the interviewer to register on the shortlist.

Production-style build:

```bash
npm run build
```

Then start the compiled API with `npm run start -w server` and serve `client/dist` with any static file server.

## 10. API documentation

All JSON responses use a consistent envelope.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Paginated success also includes:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid miner data"
  }
}
```

### Assessment

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/assessment/key` | No | Unique candidate key for this local project |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create a user |
| `POST` | `/api/auth/login` | No | Issue a JWT |
| `GET` | `/api/auth/me` | Yes | Current user |

### Validators

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/validators` | Yes | Search, filter, sort, paginate |
| `GET` | `/api/validators/:id` | Yes | Validator details |

Query parameters: `page`, `limit`, `search`, `status`, `sortBy` (`stake`, `rank`, `emissions`, `updatedAt`, `uid`), `sortOrder` (`asc`, `desc`).

### Miners

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/miners` | Yes | Search, filter, sort, paginate |
| `GET` | `/api/miners/:id` | Yes | Details, performance history, activity |
| `POST` | `/api/miners` | Yes | Create |
| `PATCH` | `/api/miners/:id` | Yes | Update |
| `DELETE` | `/api/miners/:id` | Yes | Delete |

Miner `sortBy` values: `score`, `rank`, `emissions`, `updatedAt`, `uid`. Arbitrary sort keys are rejected.

### Dashboard

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/stats` | Yes | Aggregated simulation stats and chart series |
| `GET` | `/api/dashboard/activity` | Yes | Recent activity (`limit`, default 20) |

### Health

`GET /api/health` is public and reports that the API is a local simulation.

Typical status codes: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.

## 11. Testing

```bash
npm test
```

Backend tests cover authentication, validator listing, miner CRUD, validation, unauthorized access, pagination, search, sorting, and error payloads. They use an in-memory MongoDB so they do not need the Docker database.

Frontend tests cover login, dashboard rendering, the miner table, search, pagination, and form validation.

There is also a frontend/API contract test (MSW) and an API/database integration test (Supertest + MongoDB Memory Server).

## 12. Project structure

```text
.
├── client/                 React dashboard
│   ├── src/api/            Axios clients
│   ├── src/components/     Layout and reusable UI
│   ├── src/pages/          Route-level screens
│   └── src/test/           Test helpers
├── server/
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/models/
│   ├── src/routes/
│   ├── src/seed/
│   ├── src/validation/
│   └── src/test/
├── shared/src/             Shared types
├── docker-compose.yml
├── .env.example
└── package.json
```

## 13. Authentication

- Passwords are hashed with bcrypt and never stored in plaintext.
- Password hashes are never returned by the API.
- Protected routes require `Authorization: Bearer <token>`.
- Login and register are rate limited.
- JWT secret and expiry come from environment variables.

## 14. Bittensor / SN58 simulation

The product language matches a validator console — UID, hotkey, score, emissions, stake, rank, activity — but every address is a `5Fake…` demo string and the UI labels the product as a **local SN58-inspired simulation**.

Nothing in this repository talks to a Bittensor node, a wallet, TAO, or a hosted RPC provider. The seed data exists so the dashboard is usable immediately after `npm run seed`.
