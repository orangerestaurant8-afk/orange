# Orange

Monorepo scaffold for a single-restaurant ordering website in Karachi, Pakistan.

## Prerequisites

- Node.js 20.9 or later
- npm 10 or later
- MongoDB (only needed when database-backed routes are added)

## Setup

```bash
npm install
```

Copy the backend environment example and update it when you have a MongoDB instance:

```bash
copy backend\\.env.example backend\\.env
```

## Development

Run both applications together:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:5000/api/health

Run an app separately with `npm run dev:frontend` or `npm run dev:backend`.

## Structure

- `frontend/` — Next.js 14 App Router client
- `backend/` — Express, TypeScript, and Mongoose API
