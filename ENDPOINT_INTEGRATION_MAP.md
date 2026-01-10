# BrandWriter - Complete Endpoint Integration Map
**Last Updated:** January 10, 2026  
**Status:** ✅ Both Backend & Frontend Running

---

## 🚀 Server Status

| Server | Port | Status | URL |
|--------|------|--------|-----|
| **Main Backend (FastAPI)** | 8000 | ✅ Running | http://localhost:8000 |
| **Frontend (Vite React)** | 3002 | ✅ Running | http://localhost:3002 |
| **Email Backend (Flask)** | 5000 | ⏸ On-demand | http://localhost:5000 |
| **Insta-App Backend** | 8001 | ⏸ On-demand | http://localhost:8001 |

---

## 🔌 Frontend Proxy Configuration (vite.config.js)

```javascript
/api → http://localhost:8000           // Main backend (v1 endpoints)
/email-api → http://localhost:5000     // Email outreach backend
/insta-api → http://localhost:8001     // Instagram app backend
```

---

## 📡 Backend API Routes

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/auth/register` | Register new user | ✅ Implemented |
| POST | `/auth/login` | User login | ✅ Implemented |
| POST | `/auth/logout` | User logout | ✅ Implemented |
| DELETE | `/auth/delete-account` | Delete user account | ✅ Implemented |
| GET | `/auth/me` | Get current user | ✅ Implemented |

### Brands Routes (`/api/v1/brands`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/brands` | Create brand | ✅ Implemented |
| GET | `/brands` | List all brands (paginated) | ✅ Implemented |
| GET | `/brands/active` | Get active brand | ✅ Implemented |
| GET | `/brands/{brand_id}` | Get specific brand | ✅ Implemented |
| PUT | `/brands/{brand_id}` | Update brand | ✅ Implemented |
| DELETE | `/brands/{brand_id}` | Delete brand | ✅ Implemented |

### Drafts Routes (`/api/v1/drafts`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/drafts` | Create draft | ✅ Implemented |
| GET | `/drafts` | List drafts (filtered, paginated) | ✅ Implemented |
| GET | `/drafts/{draft_id}` | Get specific draft | ✅ Implemented |
| GET | `/drafts/category/{category}` | Get drafts by category | ✅ Implemented |
| GET | `/drafts/stats` | Get draft statistics | ✅ Implemented |
| PUT | `/drafts/{draft_id}` | Update draft | ✅ Implemented |
| DELETE | `/drafts/{draft_id}` | Delete draft | ✅ Implemented |

### Basket Routes (`/api/v1/basket`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/basket` | Create basket item | ✅ Implemented |
| GET | `/basket` | List basket items | ✅ Implemented |
| GET | `/basket/{basket_id}` | Get specific basket item | ✅ Implemented |
| POST | `/basket/from-draft` | Create basket from draft | ✅ Implemented |
| PUT | `/basket/{basket_id}` | Update basket item | ✅ Implemented |
| DELETE | `/basket/{basket_id}` | Delete basket item | ✅ Implemented |

### Schedule Routes (`/api/v1/schedules`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/schedules` | Create schedule | ✅ Implemented |
| GET | `/schedules` | List schedules | ✅ Implemented |
| GET | `/schedules/{schedule_id}` | Get specific schedule | ✅ Implemented |
| POST | `/schedules/from-basket` | Create schedule from basket | ✅ Implemented |
| GET | `/schedules/calendar` | Get calendar view | ✅ Implemented |
| PUT | `/schedules/{schedule_id}` | Update schedule | ✅ Implemented |
| DELETE | `/schedules/{schedule_id}` | Cancel schedule | ✅ Implemented |

### Generations Routes (`/api/v1/generations`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/generations/generate` | Generate content | ✅ Implemented |
| GET | `/generations` | List generations | ✅ Implemented |
| GET | `/generations/{generation_id}` | Get specific generation | ✅ Implemented |
| POST | `/generations/batch` | Batch generate | ✅ Implemented |
| POST | `/generations/{generation_id}/feedback` | Submit feedback | ✅ Implemented |

### History Routes (`/api/v1/history`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/history` | Create history entry | ✅ Implemented |
| GET | `/history` | List history (filtered) | ✅ Implemented |
| GET | `/history/{history_id}` | Get specific entry | ✅ Implemented |
| GET | `/history/published` | Get published content | ✅ Implemented |
| GET | `/history/performance` | Get content performance | ✅ Implemented |
| PATCH | `/history/{history_id}/metrics` | Update engagement metrics | ✅ Implemented |

### Templates Routes (`/api/v1/templates`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/templates` | List templates | ✅ Implemented |
| POST | `/templates` | Create template | ✅ Implemented |
| GET | `/templates/{template_id}` | Get specific template | ✅ Implemented |
| PUT | `/templates/{template_id}` | Update template | ✅ Implemented |
| DELETE | `/templates/{template_id}` | Delete template | ✅ Implemented |

### Leads Routes (`/api/leads`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/leads/fetch` | Fetch leads from provider | ✅ Implemented |
| POST | `/leads/{lead_id}/email` | Generate email for lead | ✅ Implemented |
| POST | `/leads/{lead_id}/dm` | Generate DM for lead | ✅ Implemented |
| GET | `/leads` | List leads | ✅ Implemented |

### Workers/Scheduler Routes (`/workers`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/workers/run/{schedule_id}` | Manually trigger schedule | ✅ Implemented |
| GET | `/workers/status/{schedule_id}` | Get schedule status | ✅ Implemented |

### Observability Routes (`/logs`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/logs/posting/{schedule_id}` | Get posting logs | ✅ Implemented |
| GET | `/logs/platform/{platform}` | Get platform logs | ✅ Implemented |
| GET | `/logs/health` | Health check | ✅ Implemented |

### Admin Routes (`/admin`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/admin/collect` | Manually trigger email collection | ✅ Implemented |
| POST | `/admin/send` | Manually trigger daily email job | ✅ Implemented |

### Seed Routes (`/seed`)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/seed/load/{brand_id}` | Load seed corpus for brand | ✅ Implemented |

---

## 🎯 Frontend Page to Backend Route Mapping

### Dashboard (`/src/components/DashboardV2.jsx`)
- **Platform Stats Cards**: Calls `/api/v1/generations` (GET)
- **Recent Content**: Calls `/api/v1/history` (GET)
- **Today's Schedule**: Calls `/api/v1/schedules` (GET)
- **Quick Actions**: Navigation only (no API calls)

### LinkedIn Generator (`/src/generate/linkedin.jsx`)
- **Generate**: POST `/api/v1/generations/generate`
- **Improve**: POST `/api/v1/generations/{id}/feedback`

### Drafts Page (`/src/pages/drafts.jsx`)
- **List Drafts**: GET `/api/v1/drafts`
- **Create Draft**: POST `/api/v1/drafts`
- **Update Draft**: PUT `/api/v1/drafts/{id}`
- **Delete Draft**: DELETE `/api/v1/drafts/{id}`

### Basket Page (`/src/pages/basket.jsx`)
- **List Items**: GET `/api/v1/basket`
- **Add from Draft**: POST `/api/v1/basket/from-draft`
- **Remove Item**: DELETE `/api/v1/basket/{id}`

### Schedule Page (`/src/pages/schedule.jsx`)
- **List Schedules**: GET `/api/v1/schedules`
- **Create Schedule**: POST `/api/v1/schedules`
- **From Basket**: POST `/api/v1/schedules/from-basket`
- **Update**: PUT `/api/v1/schedules/{id}`
- **Delete**: DELETE `/api/v1/schedules/{id}`

### History Page (`/src/pages/history.jsx`)
- **List History**: GET `/api/v1/history`
- **Performance**: GET `/api/v1/history/performance`
- **Published**: GET `/api/v1/history/published`

### Lead Discovery (`/src/linkedin/lead-discovery.jsx`)
- **Fetch Leads**: POST `/api/leads/fetch`
- **Generate Email**: POST `/api/leads/{id}/email`
- **Generate DM**: POST `/api/leads/{id}/dm`

### Email Manager (`/src/main-email/email.jsx`)
- **Send Email**: POST `/api/send-email`
- **Test Email**: POST `/email-api/send-email`

---

## ✅ Integration Checklist

- [x] Backend API routes defined in `app/main.py`
- [x] All route modules imported and registered with correct prefixes
- [x] Frontend proxy configured in `vite.config.js`
- [x] API client (`src/api/client.js`) set up with base URLs
- [x] CORS enabled on backend
- [x] Database connections established
- [x] Async scheduler initialized
- [x] Frontend pages mapped to backend endpoints
- [x] Both servers running on correct ports

---

## 🧪 Quick Test Commands

### Test Backend Connectivity
```bash
curl http://localhost:8000/docs  # Swagger UI
curl http://localhost:8000/api/v1/brands  # Test endpoint
```

### Test Frontend
```
http://localhost:3002  # Open in browser
```

### Test Proxy
```bash
curl http://localhost:3002/api/v1/brands  # Frontend proxy to backend
```

---

## 📝 Notes

- All backend routes are prefixed with `/api/v1` (except auth which uses `/api/auth`)
- Frontend proxies frontend requests transparently to backend
- Email backend runs on port 5000 when needed
- Insta-App backend runs on port 8001 when needed
- MongoDB connection attempted but non-critical (PostgreSQL primary)
- All async operations use AsyncSession from SQLAlchemy

---

## 🔗 Useful Resources

- **Backend Docs**: http://localhost:8000/docs (Swagger UI)
- **Backend Redoc**: http://localhost:8000/redoc (ReDoc UI)
- **Frontend**: http://localhost:3002
- **Project Docs**: See `PROJECT_DOCUMENTATION.md` and `RUNNING_THE_APP.md`
