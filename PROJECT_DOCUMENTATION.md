# BrandWriter - Complete Project Documentation

## 🎯 Project Overview
**BrandWriter** is an AI-powered content generation platform designed for social media creators, marketers, and businesses. It helps users generate, schedule, and manage content across multiple platforms while tracking performance and managing leads.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.6
- **Styling**: Tailwind CSS with gradient backgrounds
- **Icons**: Lucide React
- **Port**: 3002 (localhost:3002)
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Main API**: FastAPI (Python) - Port 8000
- **Email API**: Flask/FastAPI (Python) - Port 5000
- **Database**: SQLite (for email backend)
- **ORM**: None (direct database queries)
- **Authentication**: Basic (to be implemented)
- **Email Service**: Gmail SMTP

### Development
- **Node Package Manager**: npm
- **Python Version**: 3.8+
- **Additional Libraries**: smtplib, email.mime, threading

---

## 📁 Project Structure

```
BrandWriter-main/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main app component with sidebar & routing
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Global styles
│   │   ├── App.css                    # App-specific styles
│   │   ├── api/                       # API integration modules
│   │   ├── assets/                    # Static assets
│   │   ├── components/                # Reusable React components
│   │   ├── generate/                  # Content generation pages
│   │   │   ├── linkedin.jsx           # LinkedIn post generator
│   │   │   ├── instagram.jsx          # Instagram content generator
│   │   │   ├── youtube.jsx            # YouTube content generator
│   │   │   └── medium.jsx             # Medium article generator
│   │   ├── linkedin/                  # LinkedIn-specific features
│   │   │   └── lead-discovery.jsx     # Lead discovery dashboard
│   │   ├── main-email/                # Email outreach system
│   │   │   └── email.jsx              # Email outreach interface
│   │   ├── pages/                     # Main application pages
│   │   │   ├── basket.jsx             # Content basket management
│   │   │   ├── drafts.jsx             # Draft content storage
│   │   │   ├── history.jsx            # Content history tracking
│   │   │   ├── schedule.jsx           # Content scheduling
│   │   │   ├── templates.jsx          # Template management
│   │   │   ├── brand_voice.jsx        # Brand voice configuration
│   │   │   └── generator.jsx          # Quick generation shortcuts
│   │   ├── previews/                  # Content preview components
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js                 # Vite configuration with proxies
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI main application
│   │   ├── api/                       # API routes
│   │   │   ├── admin.py
│   │   │   ├── leads.py
│   │   │   └── ...
│   │   ├── auth/                      # Authentication
│   │   │   ├── auth_routes.py
│   │   │   └── utils.py
│   │   ├── basket/                    # Basket management module
│   │   ├── brand/                     # Brand management module
│   │   ├── core/                      # Core functionality
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── scheduler.py
│   │   │   ├── collect_emails_job.py
│   │   │   └── send_daily_job.py
│   │   ├── db/                        # Database setup
│   │   │   ├── database.py
│   │   │   ├── session.py
│   │   │   └── create_tables.py
│   │   ├── draft/                     # Draft management
│   │   ├── generation/                # Content generation
│   │   ├── history/                   # History tracking
│   │   ├── leads/                     # Lead management
│   │   ├── main-email/                # Email outreach system
│   │   │   ├── api.py                 # Email API endpoints
│   │   │   ├── database.py            # Email database
│   │   │   ├── email_sender.py        # SMTP email sender
│   │   │   ├── email_validator.py     # Email validation
│   │   │   ├── scraper.py             # Email scraper
│   │   │   └── requirements.txt
│   │   ├── models/                    # Database models
│   │   ├── schemas/                   # Data validation schemas
│   │   ├── services/                  # Business logic
│   │   ├── utils/                     # Utility functions
│   │   ├── workers/                   # Background workers
│   │   └── writers/                   # Content writers/AI
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── ...
│
├── Insta-App/                         # Instagram integration (separate)
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── alembic/                           # Database migrations
│   └── versions/
│
└── README.md
```

---

## 🚀 Frontend Pages & Components

### 1. **Dashboard** (`pages/dashboard`)
- **Purpose**: Main landing page showing performance overview
- **Features**:
  - Platform statistics cards (LinkedIn, Instagram, YouTube, Medium, Email)
  - Auto-generated content feed
  - Quick actions grid
  - Today's schedule widget
  - Content pipeline progress bars
  - System status indicator

### 2. **Quick Generate** (`pages/generator.jsx`)
- **Purpose**: Quick content generation with shortcuts
- **Features**:
  - Pre-set templates for different content types
  - Instant generation buttons
  - Platform selection

### 3. **LinkedIn Generator** (`generate/linkedin.jsx`)
- **Purpose**: Generate LinkedIn posts
- **Features**:
  - Post editor with rich formatting
  - Tone selector (Professional, Casual, Inspirational)
  - Hashtag generator
  - Preview pane
  - Save to drafts/basket
  - Schedule posting

### 4. **Instagram Generator** (`generate/instagram.jsx`)
- **Purpose**: Generate Instagram captions and content
- **Features**:
  - Caption editor
  - Emoji suggestions
  - Hashtag optimization
  - Story/Reel content templates
  - Visual preview

### 5. **YouTube Generator** (`generate/youtube.jsx`)
- **Purpose**: Generate YouTube video descriptions and titles
- **Features**:
  - Title generator
  - Description templates
  - SEO optimization
  - Tag suggestions
  - Thumbnail text recommendations

### 6. **Medium Generator** (`generate/medium.jsx`)
- **Purpose**: Generate Medium articles and blog posts
- **Features**:
  - Article outline builder
  - Content sections editor
  - SEO metadata optimization
  - Publication guidelines checker

### 7. **Lead Discovery** (`linkedin/lead-discovery.jsx`)
- **Purpose**: Find and manage potential LinkedIn leads
- **Features**:
  - Search filters (industry, role, company size)
  - Lead list with contact info
  - Lead scoring
  - Email collection
  - Export functionality

### 8. **Email Outreach** (`main-email/email.jsx`)
- **Purpose**: Cold email campaigns and outreach
- **Features**:
  - Email template editor
  - Recipient list management
  - Gmail configuration
  - Test email sender (to any email)
  - Campaign status tracking
  - Email verification
  - Activity logs
  - CSV export

### 9. **Drafts** (`pages/drafts.jsx`)
- **Purpose**: Manage draft content
- **Features**:
  - Draft list view
  - Edit/delete options
  - Move to basket/schedule
  - Auto-save functionality
  - Platform filtering

### 10. **Basket** (`pages/basket.jsx`)
- **Purpose**: Queue and organize content
- **Features**:
  - Drag-and-drop reordering
  - Batch operations
  - Platform-specific organization
  - Publish/schedule from basket

### 11. **History** (`pages/history.jsx`)
- **Purpose**: Track published content performance
- **Features**:
  - Published content list
  - Engagement metrics
  - Platform performance comparison
  - Content analytics

### 12. **Schedule** (`pages/schedule.jsx`)
- **Purpose**: Manage content scheduling
- **Features**:
  - Calendar view
  - Scheduled posts list
  - Edit/reschedule options
  - Time zone support
  - Bulk scheduling

### 13. **Templates** (`pages/templates.jsx`)
- **Purpose**: Manage reusable content templates
- **Features**:
  - Template CRUD operations
  - Category organization
  - Template preview
  - Quick apply to new content

### 14. **Brand Voice** (`pages/brand_voice.jsx`)
- **Purpose**: Configure brand personality and tone
- **Features**:
  - Tone preference settings
  - Brand guidelines editor
  - Keyword manager
  - Voice consistency checker

---

## 🔌 API Endpoints

### Main Backend (Port 8000)
**Base URL**: `http://localhost:8000/api`

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Brands
- `GET /brands` - List all brands
- `POST /brands` - Create brand
- `PUT /brands/{id}` - Update brand
- `DELETE /brands/{id}` - Delete brand

#### Content Generation
- `POST /generate/linkedin` - Generate LinkedIn post
- `POST /generate/instagram` - Generate Instagram content
- `POST /generate/youtube` - Generate YouTube content
- `POST /generate/medium` - Generate Medium article

#### Drafts
- `GET /drafts` - List all drafts
- `POST /drafts` - Create draft
- `PUT /drafts/{id}` - Update draft
- `DELETE /drafts/{id}` - Delete draft

#### Basket
- `GET /basket` - List basket items
- `POST /basket` - Add to basket
- `DELETE /basket/{id}` - Remove from basket

#### Scheduling
- `POST /schedule` - Schedule content
- `GET /schedule` - Get scheduled items
- `PUT /schedule/{id}` - Update schedule

#### History
- `GET /history` - Get published content
- `GET /history/{id}/analytics` - Get content analytics

#### Leads
- `GET /leads` - List leads
- `POST /leads/import` - Import leads
- `POST /leads/{id}/contact` - Send contact

### Email Backend (Port 5000)
**Base URL**: `http://localhost:5000/api` (proxied via `/email-api`)

#### Health & Status
- `GET /api/health` - Check API status
- `GET /api/stats` - Get email statistics
- `GET /api/scan-status` - Get scan progress

#### Email Management
- `GET /api/emails` - List collected emails
- `DELETE /api/emails/{id}` - Delete email
- `POST /api/verify-email/{id}` - Verify email

#### Email Operations
- `POST /api/start-scan` - Start email collection scan
- `POST /api/send-email` - Send single test email
- `POST /api/send-campaign` - Start email campaign

---

## 🎨 UI Components & Design

### Color Scheme
- **Primary**: Violet/Fuchsia gradients
- **Background**: Gray-950, Gray-900, Black
- **Accent**: Emerald, Teal, Blue, Red
- **Text**: White, Gray-300, Gray-400

### Key UI Patterns
- **Sidebar**: Slide-out navigation (closed by default)
- **Hamburger Menu**: Toggle sidebar visibility
- **Tabs**: Material-style tab navigation
- **Cards**: Gradient backgrounds with backdrop blur
- **Buttons**: Gradient fills with hover effects
- **Alerts**: Color-coded (Success=Green, Error=Red, Info=Blue)
- **Modals**: Overlay with backdrop blur
- **Tables**: Dark themed with hover effects
- **Forms**: Slate-colored inputs with focus rings

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Sidebar hidden on mobile
- Full-width content on small screens
- Adaptive grid layouts

---

## 📊 Key Features

### Content Generation
- Multi-platform content creation (LinkedIn, Instagram, YouTube, Medium)
- AI-powered suggestions
- Tone/style customization
- Template-based generation
- Bulk content generation

### Content Management
- Draft storage and editing
- Content basket/queue
- Scheduling system
- Performance history tracking
- Template library

### Email Outreach
- Cold email campaigns
- Email verification
- Gmail SMTP integration
- Recipient list management
- Campaign analytics
- Test email functionality
- CSV export

### Lead Management
- LinkedIn lead discovery
- Lead scoring
- Contact information collection
- Lead segmentation
- Email collection from leads

### Analytics & Tracking
- Content performance metrics
- Engagement tracking
- Platform-specific analytics
- Schedule adherence tracking
- Lead conversion metrics

---

## 🔐 Authentication & Security

### Current State
- Basic authentication structure
- Session management (to be implemented)
- Gmail app password for email (user-managed)

### To Implement
- JWT token authentication
- OAuth 2.0 for Gmail (instead of app passwords)
- User role-based access control (RBAC)
- API key management
- Rate limiting

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- pip package manager
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3002
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

### Email Backend Setup
```bash
cd backend/app/main-email
pip install -r requirements.txt
python api.py
# Runs on http://localhost:5000
```

### Vite Configuration
- Frontend proxy routes to backends
- `/api` → `localhost:8000` (main backend)
- `/email-api` → `localhost:5000` (email backend)
- `/health` → `localhost:8000` (health check)

---

## 📦 Dependencies

### Frontend (package.json)
- react@19.2.0
- react-dom@19.2.0
- vite@7.2.6
- @vitejs/plugin-react
- tailwindcss
- lucide-react
- axios (for API calls)

### Backend (requirements.txt)
- fastapi
- uvicorn
- sqlalchemy
- pydantic
- python-dotenv
- cors support
- alembic (migrations)

### Email Backend (main-email/requirements.txt)
- fastapi
- uvicorn
- pydantic
- sqlalchemy
- smtplib (built-in)
- email (built-in)
- requests (for web scraping)
- beautifulsoup4 (for scraping)

---

## 🔄 Data Flow

### Content Generation Flow
1. User navigates to platform generator (e.g., LinkedIn)
2. User inputs content parameters
3. Frontend sends request to `/api/generate/{platform}`
4. Backend uses AI to generate content
5. Content returned to frontend
6. User previews and edits
7. User saves to drafts or basket
8. User schedules or publishes

### Email Campaign Flow
1. User configures Gmail credentials in Settings
2. User creates email template
3. User enters recipient email(s)
4. Frontend sends email request to `/email-api/send-email`
5. Email backend connects to Gmail SMTP
6. Email sent to recipient(s)
7. Logs recorded in activity feed
8. Campaign status tracked

### Lead Discovery Flow
1. User navigates to Lead Discovery
2. Sets search filters (industry, role, etc.)
3. Backend scrapes/queries lead sources
4. Leads displayed with contact info
5. User can send emails directly
6. Emails collected in email database
7. Campaign can be launched to leads

---

## ⚙️ Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_EMAIL_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./brand_writer.db
SECRET_KEY=your-secret-key
DEBUG=True
```

### Email Backend (.env)
```
DATABASE_URL=sqlite:///./emails.db
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

---

## 🚨 Known Issues & Improvements

### Current Limitations
1. No authentication system implemented (UI only)
2. Email backend uses user-managed Gmail passwords (should use OAuth)
3. No API rate limiting
4. Limited error handling
5. No real AI integration (UI ready)

### Improvements Needed
1. Implement proper authentication
2. Add OAuth 2.0 for Gmail
3. Database migration system (Alembic)
4. Error logging and monitoring
5. Unit tests
6. E2E tests
7. Documentation
8. API versioning

---

## 📝 File Dependencies

### Key Imports
- `App.jsx` imports all page components
- Pages import components and utilities
- Components use Lucide icons and Tailwind classes
- API calls through frontend proxy to backends
- Email backend standalone (port 5000)

### Component Structure
```
App.jsx (Main)
├── Sidebar (Navigation)
├── Top Bar (Menu, Status)
└── Main Content Area
    ├── Dashboard
    ├── Generate Pages (LinkedIn, Instagram, etc.)
    ├── Management Pages (Drafts, Basket, etc.)
    ├── Email Outreach
    └── Lead Discovery
```

---

## 🎯 Next Steps for Development

1. **Authentication**: Implement JWT + OAuth
2. **Database**: Set up proper PostgreSQL database
3. **AI Integration**: Connect to OpenAI/Claude API
4. **Email Scraping**: Implement web scraper for leads
5. **Scheduling**: Set up APScheduler for scheduled tasks
6. **Analytics**: Build analytics dashboard
7. **Multi-user**: Support multiple user accounts
8. **Mobile App**: React Native mobile version
9. **Deployment**: Docker containerization + CI/CD
10. **Documentation**: API documentation (Swagger/OpenAPI)

---

## 📞 Support & Maintenance

- Regular dependency updates
- Security patches
- Performance optimization
- Feature enhancement
- Bug fixes
- User feedback integration

---

**Last Updated**: January 8, 2026
**Project Status**: Active Development
**Version**: 1.0.0 (Beta)
