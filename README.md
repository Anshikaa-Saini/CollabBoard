# CollabBoard – AI-Assisted Real-Time Collaborative Whiteboard

CollabBoard is a full-stack, production-style web application that lets teams create rooms and collaborate on a shared whiteboard in real time. This repository currently implements **Milestone 1: Authentication & Dashboard Shell** — the foundation on top of which real-time whiteboarding, rooms, and AI features will be built in later milestones.

> **Scope note:** Only Milestone 1 is implemented here (auth + protected dashboard shell). Whiteboard/room functionality is intentionally stubbed out for now.

---

## Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- React Router v6
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Zod (request validation)

**Infra**
- Docker + Docker Compose
- Environment-based configuration

---

## Monorepo Structure

```
collabboard/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers (business logic)
│   │   ├── middleware/      # auth, validation, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # ApiError, asyncHandler, JWT helper
│   │   ├── validators/      # Zod schemas
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # App entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + API calls
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── pages/           # Login, Register, Dashboard, NotFound
│   │   ├── routes/          # ProtectedRoute wrapper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Features Implemented (Milestone 1)

### Backend
- Express server with centralized configuration
- MongoDB connection via Mongoose
- `User` model with hashed passwords (bcrypt pre-save hook)
- JWT-based authentication (7-day expiry, configurable)
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate + receive token
- `GET /api/auth/me` — fetch current user (protected)
- `protect` middleware for route-level authentication
- Zod-based request validation middleware
- Centralized error handling (validation errors, duplicate keys, cast errors, 404s)
- `GET /api/health` — service + DB health check

### Frontend
- Login & Register pages with client-side validation and server error display
- `AuthContext` for global auth state, session persistence, and rehydration on refresh
- Axios instance with request/response interceptors (auto-attach JWT, auto-clear on 401)
- `ProtectedRoute` wrapper guarding the dashboard
- Dashboard shell with:
  - Create Room card (stubbed for Milestone 2)
  - Join Room card (stubbed for Milestone 2)
  - Recent Rooms section with "No whiteboard yet." empty state
- Logout flow
- Modern, minimal, responsive UI — white background, blue accent, rounded cards

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)
- npm

### 1. Clone & install

```bash
git clone <your-repo-url> collabboard
cd collabboard
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env and set MONGO_URI / JWT_SECRET as needed
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. Verify

- Health check: `GET http://localhost:5000/api/health`
- Open `http://localhost:5173` → Register → Login → Dashboard

---

## Running with Docker

From the project root:

```bash
docker compose up --build
```

This starts:
- `mongo` on port `27017`
- `backend` on port `5000`
- `frontend` (served via Nginx) on port `5173`

Stop everything with:

```bash
docker compose down
```

To also wipe the database volume:

```bash
docker compose down -v
```

---

## API Reference (Milestone 1)

| Method | Endpoint             | Auth Required | Description                     |
|--------|-----------------------|:--------------:|----------------------------------|
| GET    | `/api/health`         | No             | Service + DB health check       |
| POST   | `/api/auth/register`  | No             | Register a new user             |
| POST   | `/api/auth/login`     | No             | Login and receive a JWT         |
| GET    | `/api/auth/me`        | Yes            | Get the current authenticated user |

**Example — Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

**Example — Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

**Example — Authenticated request**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable         | Description                          | Example                                   |
|------------------|---------------------------------------|--------------------------------------------|
| `PORT`           | Backend server port                   | `5000`                                     |
| `NODE_ENV`       | Environment                           | `development`                              |
| `MONGO_URI`      | MongoDB connection string             | `mongodb://localhost:27017/collabboard`    |
| `JWT_SECRET`     | Secret used to sign JWTs              | *(long random string)*                     |
| `JWT_EXPIRES_IN` | JWT expiry duration                   | `7d`                                        |
| `CLIENT_URL`     | Allowed CORS origin                   | `http://localhost:5173`                    |

### Frontend (`frontend/.env`)
| Variable            | Description               | Example                          |
|---------------------|----------------------------|------------------------------------|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000/api`      |

---

## Roadmap

- ✅ **Milestone 1** — Authentication, protected dashboard shell (this repo)
- ⏳ **Milestone 2** — Room creation/joining, Socket.IO real-time canvas
- ⏳ **Milestone 3** — Whiteboard drawing tools, persistence, cursors
- ⏳ **Milestone 4** — AI-assisted features (shape recognition, summarization, etc.)

*(Only Milestone 1 is implemented in this codebase.)*

---

## License

MIT
