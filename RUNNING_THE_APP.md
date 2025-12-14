# BrandWriter - Running the Application

This application consists of **two backend services** and a **frontend**. Follow these instructions to run the complete application.

## Architecture Overview

```
Frontend (React/Vite) → Port 3000
    ├── /api/*        → Main Backend (Port 8000)
    └── /insta-api/*  → Insta-App Backend (Port 8001)
```

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (for database)

## 1. Main Backend Setup (Port 8000)

The main backend handles:
- Brand management
- Content generation
- Drafts, Basket, Schedule management
- Templates
- User authentication

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/brandwriter
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-key
```

### Run the Main Backend

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API Documentation: http://localhost:8000/docs

---

## 2. Insta-App Backend Setup (Port 8001)

The Insta-App backend handles:
- Instagram account management
- Post scheduling
- Media registration
- Direct Instagram posting

### Installation

```bash
cd Insta-App
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the `Insta-App` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/instaapp
INSTA_SERVICE_API_KEY=your-insta-api-key-here
```

### Run the Insta-App Backend

```bash
cd Insta-App
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

API Documentation: http://localhost:8001/docs

---

## 3. Frontend Setup (Port 3000)

The frontend is a React application built with Vite.

### Installation

```bash
cd frontend
npm install
```

### Run the Frontend

```bash
cd frontend
npm run dev
```

The application will be available at: http://localhost:3000

---

## API Endpoints Reference

### Main Backend (`/api/*`)

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth | POST `/api/auth/register` | Register new user |
| Auth | POST `/api/auth/login` | Login user |
| Auth | POST `/api/auth/logout` | Logout user |
| Auth | DELETE `/api/auth/delete-account` | Delete user account |
| Auth | GET `/api/auth/me` | Get current user |
| Brands | GET `/api/v1/brands` | List all brands |
| Brands | POST `/api/v1/brands` | Create brand |
| Brands | GET `/api/v1/brands/active` | Get active brand |
| Drafts | GET `/api/v1/drafts` | List drafts |
| Drafts | POST `/api/v1/drafts` | Create draft |
| Basket | GET `/api/v1/basket` | List basket items |
| Schedule | GET `/api/v1/schedules` | List schedules |
| Generations | GET `/api/v1/generations` | List generations |
| Templates | GET `/api/v1/templates` | List templates |

### Insta-App Backend (`/insta-api/*`)

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth | POST `/insta-api/auth/create_account` | Create Instagram account |
| Posts | POST `/insta-api/posts/schedule` | Schedule a post |
| Posts | POST `/insta-api/posts/post-now` | Post immediately |
| Media | POST `/insta-api/media/register` | Register media item |

---

## Running All Services

For convenience, you can use a process manager or run in separate terminals:

### Terminal 1 - Main Backend
```bash
cd backend && uvicorn app.main:app --port 8000 --reload
```

### Terminal 2 - Insta-App Backend
```bash
cd Insta-App && uvicorn main:app --port 8001 --reload
```

### Terminal 3 - Frontend
```bash
cd frontend && npm run dev
```

---

## Frontend API Client Usage

The frontend uses a centralized API client located at `frontend/src/api/client.js`:

```javascript
import { mainApi, instaApi } from '../api/client';

// Main backend calls
const brands = await mainApi.brands.list();
const drafts = await mainApi.drafts.list(brandId);

// Insta-App backend calls
await instaApi.posts.postNow(username, caption, type, mediaIds);
await instaApi.posts.schedule(username, caption, type, mediaIds, scheduledAt);
```

---

## Troubleshooting

### CORS Issues
Both backends have CORS configured to allow all origins in development. For production, update the `allow_origins` in both `main.py` files.

### Database Connection
Ensure PostgreSQL is running and the connection strings in `.env` files are correct.

### Port Conflicts
If ports 8000, 8001, or 3000 are in use, you can change them:
- Backend: Add `--port XXXX` to the uvicorn command
- Frontend: Update `vite.config.js` server.port and proxy targets
