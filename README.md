# AI-Prompt2CV Builder

> Transform natural language prompts into professional, ATS-optimized CVs using GPT-4o.

A production-ready CV builder that lets users describe their background in plain English and generates polished, job-ready resumes. Built with FastAPI + Next.js 14.

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## Why This Exists

Writing CVs sucks. Most people stare at a blank page, struggle with wording, and end up with something that doesn't pass ATS filters. This tool fixes that:

1. **Describe yourself naturally** → AI generates professional CV content
2. **Paste a job description** → Get a match score and specific improvement suggestions  
3. **Get a recruiter-perspective review** → ATS optimization and achievement analysis
4. **Every edit auto-saves** → Full version history, restore anytime

No more "responsible for managing..." bullet points. No more guessing what recruiters want.

---

## Quick Start

```bash
# Clone and setup
git clone https://github.com/TarannumAhmedNowshin/AI-Prompt2CV-Builder.git
cd AI-Prompt2CV-Builder

# Backend (Terminal 1)
pip install -r requirements.txt
python start_backend.py
# → http://localhost:8001

# Frontend (Terminal 2)
cd frontend && npm install && npm run dev
# → http://localhost:3001
```

Or just run `start_fullstack.bat` on Windows.

### Environment Variables

Create `.env` in root:
```env
SECRET_KEY=your-jwt-secret-change-in-production
DATABASE_URL=sqlite:///./cv_builder.db
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 14    │────▶│    FastAPI      │────▶│  Azure OpenAI   │
│   (Frontend)    │     │    (Backend)    │     │    (GPT-4o)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        └──────────────▶│    SQLite/      │
                        │   PostgreSQL    │
                        └─────────────────┘
```

**Backend** handles auth, CV CRUD, AI orchestration, document parsing, and version management.  
**Frontend** is a React SPA with real-time preview, drag-drop editing, and template rendering.

---

## Core Features

### AI Content Generation
```
POST /api/cv/generate-content
Body: { "prompt": "Software engineer with 5 years Python experience..." }
Returns: Structured CV data (summary, experience, skills, education, projects, research)
```

The AI parses natural language and outputs properly formatted, ATS-friendly content. No more manually wordsmithing bullet points.

### Job Match Analysis
```
POST /api/cv/{id}/job-suggestions
Body: { "job_description": "Looking for a senior backend developer..." }
Returns: {
  "match_score": 78,
  "strengths": ["Strong Python background", "API experience"],
  "gaps": ["Missing Kubernetes experience"],
  "skills_to_add": ["microservices", "CI/CD"],
  "recommendations": [...]
}
```

Paste any job posting, get actionable feedback on how to tailor your CV.

### CV Review (Recruiter Perspective)
```
POST /api/cv/{id}/review
Returns: {
  "overall_score": 82,
  "ats_optimization": {...},
  "achievement_quantification": {...},
  "tailoring": {...}
}
```

Get a recruiter-perspective analysis with ATS optimization tips, achievement scoring, and tailoring advice.

### Version History
Every save creates an automatic snapshot. Restore any previous version with one click. Also supports named checkpoints for major milestones. Restoring a version saves the current state first, so you can always undo.

### Templates
- **Modern**: Blue header, icon-based contact info, suited for tech roles
- **Classic**: Traditional serif layout for finance/consulting
- **Executive**: Professional layout (in progress)
- **Minimal**: Clean, simple design (in progress)

All templates parse the same data structure, so switching is instant.

### Document Import & Auto-Fill
```
POST /api/cv/parse-document
Body: multipart/form-data with file (max 10MB)
Returns: {
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "location": "San Francisco, CA",
  "linkedin": "linkedin.com/in/johndoe",
  "skills": [
    {"name": "Python", "category": "Programming Languages"},
    {"name": "React", "category": "Web Development"}
  ],
  "experience": [...],
  "education": [...],
  "confidence_scores": {...}
}
```

Drag and drop your existing resume (PDF, DOCX, or TXT) to automatically extract:
- **Contact Information**: Name, email, phone, location, LinkedIn
- **Skills**: 150+ tech skills across 8 categories (Programming, Web, Database, Cloud, Data Science, Tools, Mobile, Testing)
- **Experience & Education**: Structured extraction with dates and descriptions
- **Confidence Scoring**: Visual indicators show extraction reliability

No LLM required—pure regex and pattern matching for fast, reliable extraction. AI fallback available for complex documents.

### PDF Export
Export your CV as a professionally formatted PDF directly from the browser. Supports multi-page documents with print-optimized styling.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT tokens |
| POST | `/api/auth/token` | OAuth2-compatible login (Swagger UI) |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### CV Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cv/` | List all user CVs |
| POST | `/api/cv/` | Create new CV |
| GET | `/api/cv/{id}` | Get CV by ID |
| PUT | `/api/cv/{id}` | Update CV (auto-creates version snapshot) |
| DELETE | `/api/cv/{id}` | Delete CV |
| POST | `/api/cv/generate-content` | AI content generation |
| POST | `/api/cv/parse-document` | Parse uploaded resume (PDF/DOCX/TXT) |
| POST | `/api/cv/{id}/job-suggestions` | Job match analysis |
| POST | `/api/cv/{id}/review` | CV review (recruiter perspective) |

### Versions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cv/{id}/versions` | List versions |
| GET | `/api/cv/{id}/versions/{vid}` | Get version details |
| POST | `/api/cv/{id}/versions` | Create named version |
| POST | `/api/cv/{id}/versions/{vid}/restore` | Restore version |
| DELETE | `/api/cv/{id}/versions/{vid}` | Delete version |

Full OpenAPI docs at `http://localhost:8001/docs` (requires `DEBUG=True` in `.env`)

---

## Project Structure

```
backend/
├── api/
│   ├── auth.py            # JWT auth endpoints
│   ├── cv.py              # CV CRUD + AI + parsing + review endpoints
│   ├── cv_schemas.py      # CV Pydantic models
│   └── schemas.py         # Auth Pydantic models
├── models/
│   ├── user.py            # User table
│   ├── cv.py              # CV table (incl. projects, research)
│   └── cv_version.py      # Version snapshots
├── services/
│   ├── auth_service.py    # Password hashing, user lookup
│   ├── ai_service.py      # Azure OpenAI wrapper (singleton, retry)
│   └── document_parser.py # Resume parsing (PDF/DOCX/TXT)
├── database/
│   ├── config.py          # Settings (pydantic_settings)
│   └── base.py            # SQLAlchemy setup
├── utils/
│   └── auth.py            # JWT + password utilities
└── main.py                # FastAPI app, CORS, routes

frontend/src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # CV list, create/edit/delete
│   ├── cv/new/            # Create flow
│   └── cv/[id]/           # Edit flow
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── cv/
│   │   ├── CVEditor.tsx             # Main editor (all sections)
│   │   ├── CVSection.tsx            # Base accordion component
│   │   ├── PersonalInfoSection.tsx
│   │   ├── SummarySection.tsx
│   │   ├── ExperienceSection.tsx    # Drag-drop + modals
│   │   ├── EducationSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── SkillsSection.tsx        # Tag-based drag-drop
│   │   ├── ResearchSection.tsx
│   │   ├── ModernTemplate.tsx       # Blue header design
│   │   ├── ClassicTemplate.tsx      # Traditional serif design
│   │   ├── ExecutiveTemplate.tsx    # (In progress)
│   │   ├── MinimalTemplate.tsx      # (In progress)
│   │   ├── TemplateSelector.tsx     # Template picker
│   │   ├── JobSuggestions.tsx       # Job matching UI
│   │   ├── VersionHistory.tsx       # Google Docs-style panel
│   │   ├── DocumentDropzone.tsx     # File upload UI
│   │   ├── ParsedDataPreview.tsx    # Import preview modal
│   │   ├── CVReviewer.tsx           # CV review feature
│   │   └── templateUtils.ts        # Helper functions
│   ├── layout/
│   │   └── Layout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── contexts/
│   └── AuthContext.tsx     # JWT state, auto-refresh
└── lib/
    ├── api-client.ts       # Axios instance with interceptors
    ├── auth-service.ts     # Login/register/logout
    ├── cv-data-mapper.ts   # API ↔ UI data conversion
    ├── ai-content-mapper.ts # AI response mapping
    └── pdf-export.ts       # HTML-to-PDF export
```

---

## Tech Decisions

| Choice | Why |
|--------|-----|
| **FastAPI** | Async, auto-docs, Pydantic validation. Best Python web framework for APIs. |
| **Next.js 14 App Router** | Server components, better SEO potential, clean routing. |
| **SQLite default** | Zero config for dev. Swap to Postgres via env var for prod. |
| **JWT with refresh** | Stateless auth. 30min access, 7 day refresh. Account lockout after 5 failures. |
| **Azure OpenAI** | Enterprise-grade, better rate limits than consumer API. |
| **@hello-pangea/dnd** | Maintained fork of react-beautiful-dnd. Smooth drag-drop. |
| **jsPDF + html2canvas** | Client-side PDF export without server dependencies. |
| **Lucide React** | Lightweight, consistent icon library. |
| **SlowAPI** | Rate limiting on auth and AI endpoints to prevent abuse. |

---

## Development Status

| Phase | Status |
|-------|--------|
| Authentication | Done |
| CV CRUD | Done |
| AI Generation | Done |
| Templates (Modern, Classic) | Done |
| Templates (Executive, Minimal) | In Progress |
| FlowCV-style Editor | Done |
| Job Matching | Done |
| CV Review (Recruiter Perspective) | Done |
| Version History | Done |
| Document Import | Done |
| PDF Export | Done |
| Projects & Research Sections | Done |
| Security Hardening | Done |
| Public Sharing | Planned |
| Email Verification | Planned |
| Password Reset | Planned |

---

## Security

The application includes multiple layers of security hardening:

| Feature | Details |
|---------|---------|
| **Rate Limiting** | SlowAPI — login 5/min, register 3/min, AI endpoints 5/min, default 60/min |
| **Prompt Injection Defense** | Regex-based input sanitization, `<user_input>` delimiters, system prompt hardening |
| **CORS** | Restricted methods and headers (no wildcards) |
| **Error Handling** | Global exception handler; generic error messages returned to clients |
| **Input Validation** | `max_length` on all CV fields; password complexity (uppercase + lowercase + digit) |
| **File Upload** | Extension whitelist + magic byte validation + filename sanitization |
| **Account Lockout** | 5 failed logins → 15-minute lockout; auto-resets |
| **Security Headers** | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS |
| **Logging** | Structured Python `logging`; no secrets or stack traces leaked; no `console.log` in frontend |

---

## Running Tests

```bash
# Auth flow integration test
python test_auth.py

# Manual API testing
# Visit http://localhost:8001/docs (Swagger UI)
```

---

## Known Limitations

- No email verification (auth is email+password only)
- No password reset flow
- Single-user editing (no real-time collaboration)
- Executive and Minimal templates are partially implemented
- PDF export is client-side (browser-dependent rendering)
- Photo upload is placeholder only (not functional)
- Tokens stored in localStorage (httpOnly cookies would be more secure)
- No automated test suite beyond auth integration tests

---

## License

TBD

---

## Contributing

Check [PROGRESS.md](PROGRESS.md) for the roadmap. PRs welcome for planned features and template completion.
