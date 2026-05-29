# AI CV Builder

Full-stack CV/resume builder with AI-powered content generation, job matching, and document parsing.

## Tech Stack

- **Backend:** FastAPI (Python 3.x) + SQLAlchemy 2.0 + SQLite (swappable to PostgreSQL via `DATABASE_URL`)
- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **AI:** Azure OpenAI (GPT-4o) for content generation and job suggestions
- **Auth:** JWT (access token 30min + refresh token 7 days), bcrypt password hashing

## Project Structure

```
backend/
  api/           # FastAPI route handlers (auth.py, cv.py, cv_schemas.py)
  models/        # SQLAlchemy models (user.py, cv.py, cv_version.py)
  services/      # Business logic (auth_service.py, ai_service.py, document_parser.py)
  database/      # DB config and session management
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
      cv/        # CV editor sections, templates (Modern, Classic, Executive, Minimal)
      ui/        # Reusable UI components (Button, Card, Input)
    contexts/    # AuthContext (global auth state)
    lib/         # API client (Axios w/ interceptors), auth service
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
- `DATABASE_URL` - Default: `sqlite:///./cv_builder.db`
- `SECRET_KEY` - JWT signing key
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)

Frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend URL (default: `http://localhost:8001`)

## API Structure

All API routes are prefixed with `/api/`:
- `/api/auth/` - Registration, login, token refresh, logout
- `/api/cv/` - CRUD operations on CVs
- `/api/cv/generate-content` - AI content generation from natural language
- `/api/cv/{id}/job-suggestions` - Job match analysis with scoring
- `/api/cv/parse-document` - PDF/DOCX/TXT resume parsing
- `/api/cv/{id}/versions` - Version history (create, list, restore)

Swagger docs available at `http://localhost:8001/docs`.

## Architecture Notes

- Frontend uses Axios interceptors for automatic JWT token refresh on 401 responses
- Tokens stored in localStorage (`access_token`, `refresh_token`)
- CV updates auto-create version snapshots (Google Docs-style history)
- Document parser uses regex/pattern matching (no LLM needed) with confidence scoring
- AI service uses singleton pattern for Azure OpenAI client reuse
- 4 CV templates: Modern (tech), Classic (traditional), Executive, Minimal
- TypeScript path alias: `@/*` maps to `src/*`

## Code Conventions

- Backend uses Pydantic models for request/response validation (see `api/cv_schemas.py`)
- Frontend forms use React Hook Form
- Toast notifications via react-hot-toast
- PDF export via jsPDF + html2canvas
- Tailwind config extends with custom colors (primary blues), fonts (Inter, Source Serif 4), and animations
