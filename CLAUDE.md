# AI CV Builder

Full-stack CV/resume builder with AI-powered content generation, job matching, CV review, and document parsing.

## Tech Stack

- **Backend:** FastAPI (Python 3.x) + SQLAlchemy 2.0 + SQLite (swappable to PostgreSQL via `DATABASE_URL`)
- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **AI:** Azure OpenAI (GPT-4o) for content generation, job suggestions, and CV review
- **Auth:** JWT (access token 30min + refresh token 7 days), bcrypt password hashing, account lockout
- **Security:** SlowAPI rate limiting, prompt injection defense, bleach HTML sanitization, security headers

## Project Structure

```
backend/
  api/           # FastAPI route handlers (auth.py, cv.py, cv_schemas.py, schemas.py)
  models/        # SQLAlchemy models (user.py, cv.py, cv_version.py)
  services/      # Business logic (auth_service.py, ai_service.py, document_parser.py)
  database/      # DB config (config.py, base.py) and session management
  utils/         # Auth utilities (JWT, dependencies)
  main.py        # App entry point

frontend/
  src/
    app/         # Next.js App Router pages
      cv/[id]/   # Edit CV page
      cv/new/    # Create CV page
      dashboard/ # User dashboard
      login/     # Login page
      register/  # Registration page
    components/
      auth/      # ProtectedRoute
      cv/        # CV editor sections, templates, features
      layout/    # Layout wrapper
      ui/        # Reusable UI components (Button, Card, Input)
    contexts/    # AuthContext (global auth state)
    lib/         # API client, auth service, data mappers, PDF export
```

## Running the Project

```bash
# Backend
pip install -r requirements.txt
python start_backend.py              # Runs on http://localhost:8001

# Frontend
cd frontend && npm install && npm run dev   # Runs on http://localhost:3001

# Full stack (Windows)
start_fullstack.bat
```

## Key Commands

```bash
# Backend
python -m backend.main               # Alternative backend start
python test_auth.py                   # Run auth integration tests

# Frontend
cd frontend && npm run build          # Production build
cd frontend && npm start              # Production server
cd frontend && npm run lint           # Lint check
```

## Environment Variables

Backend (`.env` at project root):
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` - AI integration
- `AZURE_OPENAI_API_VERSION` - API version (default: `2024-08-01-preview`)
- `DATABASE_URL` - Default: `sqlite:///./cv_builder.db`
- `SECRET_KEY` - JWT signing key
- `ALGORITHM` - JWT algorithm (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Access token expiry (default: `30`)
- `REFRESH_TOKEN_EXPIRE_DAYS` - Refresh token expiry (default: `7`)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)
- `APP_NAME`, `APP_VERSION`, `DEBUG` - App metadata

Frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend URL (default: `http://localhost:8001`)

## API Structure

All API routes are prefixed with `/api/`:
- `/api/auth/` - Registration, login, token refresh, logout, current user
- `/api/cv/` - CRUD operations on CVs
- `/api/cv/generate-content` - AI content generation from natural language
- `/api/cv/{id}/job-suggestions` - Job match analysis with scoring
- `/api/cv/{id}/review` - AI-powered CV review (recruiter perspective)
- `/api/cv/parse-document` - PDF/DOCX/TXT resume parsing (10MB limit)
- `/api/cv/{id}/versions` - Version history (create, list, get, restore, delete)

Swagger docs available at `http://localhost:8001/docs` (only when `DEBUG=True`).

## Security

- **Rate Limiting:** SlowAPI — login/token 5/min, register 3/min, AI endpoints 5/min, document parse 10/min, default 60/min
- **Prompt Injection:** User inputs sanitized via regex pattern matching (role injection, instruction override) and wrapped in `<user_input>` delimiters before AI calls; system prompts include explicit ignore-embedded-instructions directives
- **CORS:** Restricted to specific methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) and headers (`Authorization`, `Content-Type`, `Accept`)
- **Error Handling:** Global exception handler returns generic messages; no stack traces or internal details exposed to clients
- **Input Validation:** All CV schema fields have `max_length` constraints; password requires uppercase, lowercase, and digit
- **File Upload:** Extension whitelist + magic byte validation (PDF `%PDF`, DOCX `PK`, TXT UTF-8 check) + filename sanitization
- **Account Lockout:** 5 failed login attempts → 15-minute lockout; auto-resets on expiry or successful login
- **Security Headers:** X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, HSTS
- **Logging:** Python `logging` module (no `print()` statements); no secrets or stack traces logged; `watchfiles` logger suppressed to WARNING
- **DEBUG:** Defaults to `False`; Swagger docs and redoc disabled when `DEBUG=False`

## Architecture Notes

- Frontend uses Axios interceptors for automatic JWT token refresh on 401 responses
- Tokens stored in localStorage (`access_token`, `refresh_token`)
- CV updates auto-create version snapshots (Google Docs-style history)
- Document parser uses regex/pattern matching (no LLM needed) with confidence scoring; AI fallback available
- AI service uses singleton pattern for Azure OpenAI client reuse with exponential backoff retry
- AI inputs sanitized for prompt injection before every API call (see `sanitize_user_input` in `ai_service.py`)
- 4 CV templates: Modern (fully functional), Classic (fully functional), Executive (partial), Minimal (partial)
- TypeScript path alias: `@/*` maps to `src/*`
- CV model includes projects and research sections (JSON fields)
- User model includes `failed_login_attempts` and `locked_until` for account lockout
- FlowCV-inspired editor with collapsible accordion sections, drag-drop reordering, and modal editing
- PDF export via jsPDF + html2canvas (client-side, multi-page support)
- Data mappers handle API snake_case ↔ UI camelCase conversion and legacy format migration
- Backend uses Python `logging` module throughout (no `print()` statements)
- Frontend has no `console.log`/`console.error` statements (cleaned for production)

## Code Conventions

- Backend uses Pydantic models for request/response validation (see `api/cv_schemas.py`, `api/schemas.py`)
- Frontend forms use React Hook Form
- Toast notifications via react-hot-toast
- PDF export via jsPDF + html2canvas
- Drag-and-drop via @hello-pangea/dnd (maintained fork of react-beautiful-dnd)
- Icons via Lucide React
- Tailwind config extends with custom colors (primary sky blues), fonts (Inter, Source Serif 4), shadows, and animations
- Base CVSection component provides common accordion pattern for all editor sections
