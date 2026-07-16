# CollabBoard

**AI-Assisted Real-Time Collaborative Whiteboard**

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

CollabBoard is a full-stack, production-style web app that lets teams create rooms and draw together on a shared whiteboard in real time - plus a couple of genuinely useful AI features (auto-generated sticky notes and structured meeting summaries) layered on top. It was built as a portfolio project to be **resume-worthy and easy to explain in a technical interview**: every architectural decision below has a one-sentence justification, and the codebase deliberately avoids unnecessary complexity (no Redis, no CRDTs, no microservices) in favor of patterns that are simple to reason about and simple to talk through.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup (Local Development)](#setup-local-development)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Project Overview

A user registers, creates or joins a room via a short shareable code, and draws on a canvas with a collaborator in real time - cursors, strokes, and clears all sync live over WebSockets. The board auto-saves to MongoDB every 10 seconds (and on demand via a Save button), keeps a short restoreable history, and reloads exactly where it left off the next time the room is opened. On top of that, a lightweight AI panel can turn a one-line prompt like *"Generate sprint tasks for login module"* into draggable sticky notes, or turn a room's sticky notes into a structured meeting recap (summary, action items, decisions, open questions).

This repo was built incrementally across five milestones:
1. **Auth & Dashboard** - JWT auth, protected routes, dashboard shell
2. **Rooms & Local Canvas** - room create/join, pen/eraser/undo/redo drawing (local only)
3. **Real-Time Collaboration** - Socket.io rooms, live cursors, participant count, reconnect handling
4. **Persistence & AI** - MongoDB-backed board saves/history, room rename/delete, AI sticky notes + meeting summaries
5. **Production Polish** - toasts, centralized error handling, input validation, Docker, deployment docs *(this milestone)*

---

## Architecture

![Architecture diagram](docs/architecture.svg)

**Request flow, in one paragraph:** the React SPA talks to Express over two channels - REST for everything CRUD-shaped (auth, rooms, board saves, sticky notes, AI) and a single persistent Socket.io connection for anything that needs to feel instant (live strokes, cursor positions, participant counts). Both are authenticated with the same JWT. Express talks to MongoDB via Mongoose for all persistence, and to an OpenAI-compatible chat completions endpoint (OpenAI or Groq, swappable via one env var) for the two AI features.

A few deliberate simplicity tradeoffs, worth knowing going in:
- **Whiteboard content is a raster snapshot, not a stroke log.** The canvas is persisted as a full `data:image/png` snapshot rather than a list of individual draw operations. This makes save/restore trivial (draw an image) at the cost of not supporting fine-grained replay - a reasonable tradeoff for a whiteboard, not a design tool.
- **Real-time conflict resolution is Last-Write-Wins by timestamp**, not a CRDT or Operational Transform. Every full-board sync carries a timestamp; the server only accepts a newer one. Simple to implement, simple to explain, and correct enough for a whiteboard where "the last thing drawn wins" matches user intuition.
- **Socket.io room state lives in-memory** in the Node process (a `Map`, not Redis). This means it doesn't horizontally scale past one server instance as-is - a known, intentional limitation for this project's scope (see [Future Improvements](#future-improvements)).

---

## Screenshots

> Add screenshots here after your first deploy - a few from `/dashboard`, the whiteboard in `/room/:id` with two cursors visible, and the AI panel open are the most useful ones to include. Suggested path: `docs/screenshots/`.

| Dashboard | Whiteboard | AI Panel |
|---|---|---|
| _add screenshot_ | _add screenshot_ | _add screenshot_ |

---

## Features

**Auth**
- Register / login with JWT, bcrypt-hashed passwords, protected routes
- Session persists across refresh; expired/invalid tokens are handled centrally (auto-logout + toast)

**Rooms**
- Create a room (gets a random 6-character shareable code) or join one by code
- Rename / delete a room (owner-only, enforced server-side)
- Dashboard lists your rooms, most recently updated first, with a skeleton loading state

**Whiteboard**
- Pen + eraser tools, adjustable brush size, color picker, clear board
- Undo/redo (local, snapshot-based)
- Auto-saves every 10 seconds (only if something changed) + manual Save button
- Short version history with one-click restore
- Board reloads automatically when a room is reopened

**Real-time collaboration**
- Every room is a Socket.io room; strokes, clears, and cursor positions broadcast live
- Live participant count + connection status indicator
- Automatic reconnect handling - a dropped connection re-syncs against the server's canonical state with no special-case code
- Last-Write-Wins conflict resolution for the persisted board state

**AI**
- **Sticky Notes**: type a prompt, get back a handful of draggable sticky notes on the board
- **Meeting Summary**: turns a room's sticky notes into a structured recap (Summary / Action Items / Decisions Taken / Open Questions), shown in a side panel and stored in MongoDB
- Works with either OpenAI or Groq - same code, one env var (`OPENAI_BASE_URL`) to switch

**Production polish**
- Toast notifications for key actions (save, generate, rename, delete, session expiry, network errors)
- Centralized error handling on both ends: a single Express error-handling middleware (with production-safe message sanitization for unexpected errors) and a single axios response interceptor on the frontend
- Zod-validated request bodies + explicit ObjectId route-param validation
- Responsive layout, including a full-screen AI panel overlay on mobile instead of a squeezed sidebar
- Dockerized (with a health check), `docker compose up` runs the whole stack locally

---

## Tech Stack

**Frontend:** React 18 (Vite), Tailwind CSS, React Router, Axios, Socket.io Client, react-hot-toast
**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.io, JWT, bcryptjs, Zod, OpenAI SDK
**Infra:** Docker + Docker Compose, MongoDB Atlas, Vercel (frontend), Render (backend)

---

## Project Structure

```
collabboard/
├── backend/
│   └── src/
│       ├── config/          # DB connection
│       ├── controllers/     # Route handlers (auth, rooms, board, sticky notes, AI)
│       ├── middleware/      # auth, validation, ObjectId checks, centralized error handler
│       ├── models/          # Mongoose schemas (User, Room, Board, StickyNote, MeetingSummary)
│       ├── routes/          # Express routers
│       ├── services/        # aiService.js - the OpenAI-compatible AI wrapper
│       ├── socket/          # Socket.io wiring, in-memory room state, LWW logic
│       ├── utils/           # ApiError, asyncHandler, JWT helper, room code generator
│       └── validators/      # Zod schemas
│
├── frontend/
│   └── src/
│       ├── api/              # Axios calls, one file per resource
│       ├── components/       # Reusable UI (dialogs, PageLoader, Skeleton, Navbar...)
│       │   └── whiteboard/   # Toolbar, Whiteboard canvas, StickyNoteItem, AiPanel...
│       ├── constants/        # Shared constants (canvas size, storage keys)
│       ├── context/          # AuthContext
│       ├── hooks/            # useRoomSocket, useBoardPersistence, useStickyNotes...
│       ├── pages/             # Login, Register, Dashboard, Room, NotFound
│       ├── routes/           # ProtectedRoute
│       └── socket/           # Shared Socket.io client instance
│
├── docs/
│   └── architecture.svg
├── docker-compose.yml
├── .env.example               # for docker compose
└── README.md
```

---

## Setup (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- (Optional, for AI features) An [OpenAI](https://platform.openai.com) or [Groq](https://console.groq.com) API key

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/collabboard
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional - AI features return a clear 503 if left blank
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=gpt-4o-mini
```

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000`. Verify with `curl http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Try it

Open two browser windows (or one normal + one incognito), register two accounts, create a room in one, join it by code from the other, and draw.

---

## Running with Docker

From the project root:

```bash
cp .env.example .env   # sets JWT_SECRET and (optionally) AI keys for docker compose
docker compose up --build
```

This starts three containers:
- `mongo` on port `27017`
- `backend` (with a built-in health check hitting `/api/health`) on port `5000`
- `frontend` (served via Nginx) on port `5173`

```bash
docker compose down       # stop
docker compose down -v    # stop and wipe the Mongo volume
```

---

## Deployment

The app is designed to deploy as three independent pieces, each reading configuration entirely from environment variables - no code changes needed between local dev and production.

### 1. Database - MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user (Database Access) and note the username/password.
3. Under Network Access, allow access from anywhere (`0.0.0.0/0`) - simplest option since Render's free tier uses dynamic IPs.
4. Copy the connection string (Connect → Drivers) - this is your `MONGO_URI`.

### 2. Backend - Render
1. Create a new **Web Service**, pointing at this repo, with **Root Directory** set to `backend`.
2. Build command: `npm install`. Start command: `npm start`.
3. Set environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<a long random string>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=<your Vercel frontend URL, added after step 3>
   OPENAI_API_KEY=<your key, optional>
   OPENAI_BASE_URL=<blank for OpenAI, or Groq's endpoint>
   OPENAI_MODEL=gpt-4o-mini
   ```
4. Deploy. Note the resulting URL (e.g. `https://collabboard-api.onrender.com`).

> **Known limitation:** Render's free tier spins the service down after inactivity, so the first request after a while sleeping has a ~30-60s cold start. Worth mentioning proactively in an interview rather than letting someone discover it.

### 3. Frontend - Vercel
1. Import this repo into [Vercel](https://vercel.com), with **Root Directory** set to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Set environment variables:
   ```
   VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api
   VITE_SOCKET_URL=https://<your-render-backend>.onrender.com
   ```
4. Deploy. Then go back to Render and set `CLIENT_URL` to this Vercel URL (needed for CORS on both the REST API and Socket.io) and redeploy the backend.

### Post-deploy checklist
- [ ] `CLIENT_URL` on Render exactly matches the Vercel URL (including `https://`, no trailing slash)
- [ ] `VITE_API_BASE_URL` / `VITE_SOCKET_URL` on Vercel point at the Render URL
- [ ] MongoDB Atlas network access allows Render's IPs
- [ ] Register a test account and confirm the whiteboard syncs between two tabs

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| GET | `/health` | — | Service + DB health check |
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| GET | `/auth/me` | Yes | Current user |
| POST | `/rooms` | Yes | Create room |
| POST | `/rooms/join` | Yes | Join room by code |
| GET | `/rooms` | Yes | List my rooms |
| GET | `/rooms/:id` | Yes | Room details |
| PATCH | `/rooms/:id` | Owner | Rename room |
| DELETE | `/rooms/:id` | Owner | Delete room (cascades) |
| GET | `/rooms/:id/board` | Yes | Load persisted board + history |
| POST | `/rooms/:id/board` | Yes | Save board (auto-save & manual save) |
| GET | `/rooms/:id/sticky-notes` | Yes | List sticky notes |
| POST | `/rooms/:id/sticky-notes/generate` | Yes | AI-generate sticky notes from a prompt |
| PATCH | `/rooms/:id/sticky-notes/:noteId` | Yes | Update note position |
| DELETE | `/rooms/:id/sticky-notes/:noteId` | Yes | Delete a note |
| GET | `/rooms/:id/ai/summary` | Yes | Latest meeting summary |
| POST | `/rooms/:id/ai/summary` | Yes | Generate a new summary from sticky notes |

**Socket.io events** (see `backend/src/socket/index.js` for the full contract): `join-room`, `draw`, `clear-board`, `canvas-sync`, `cursor-move`, `leave-room` (client to server); `board-state`, `participants-update`, `draw`, `clear-board`, `canvas-sync`, `cursor-move`, `cursor-leave` (server to clients).

---

## Future Improvements

Realistic next steps, roughly in priority order - good material for an interview "what would you do next" question:

- **Real-time sticky note sync** - currently sticky notes only load on room open; broadcasting create/move/delete over the existing socket connection would make them feel as live as the whiteboard.
- **Horizontal scaling for Socket.io** - swap the in-memory room state `Map` for Redis (via the `socket.io-redis-adapter`) so the backend can run more than one instance.
- **True conflict-free collaboration** - replace Last-Write-Wins with an Operational Transform or CRDT (e.g. Yjs) if concurrent editing on the exact same region becomes a real problem at scale.
- **Automated tests** - a Jest/Supertest suite for the REST API and a Playwright suite for the two-browser real-time flows; this milestone was verified with hand-written integration scripts rather than a committed test suite.
- **CI/CD** - a GitHub Actions workflow to run lint/tests on PRs and auto-deploy on merge to `main`.
- **Rate limiting** - particularly on the AI endpoints, to control cost and abuse.
- **Refresh tokens** - the current JWT is long-lived with no rotation; short-lived access tokens + refresh tokens would be the standard production upgrade.
- **Board asset storage** - move canvas snapshots out of MongoDB documents and into object storage (S3-compatible), storing just a URL - keeps documents small as boards get more detailed.

---

## License

MIT - see [LICENSE](LICENSE).
