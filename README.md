# AI-Prompt2CV Builder

> Transform natural language prompts into professional, ATS-optimized CVs using GPT-4o.

A production-ready CV builder that lets users describe their background in plain English and generates polished, job-ready resumes. Built with FastAPI + Next.js 14.

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## Why This Exists

Writing CVs sucks. Most people stare at a blank page, struggle with wording, and end up with something that doesn't pass ATS filters. This tool fixes that:

1. **Describe yourself naturally** → AI generates professional CV content
2. **Paste a job description** → Get a match score and specific improvement suggestions  
3. **Every edit auto-saves** → Full version history, restore anytime

No more "responsible for managing..." bullet points. No more guessing what recruiters want.

---

## Quick Start

```bash
# Clone and setup
git clone https://github.com/TarannumAhmedNowshin/AI-Prompt2CV-Builder.git
cd AI-Prompt2CV-Builder

# Backend (Terminal 1)
pip install -r requirements.txt
python -m backend.main
# → http://localhost:8000

# Frontend (Terminal 2)
cd frontend && npm install && npm run dev
# → http://localhost:3000
```

Or just run `start_fullstack.bat` on Windows.

### Environment Variables

Create `.env` in root:
```env
SECRET_KEY=your-jwt-secret-change-in-production
DATABASE_URL=sqlite:///./cv_builder.db
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
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

**Backend** handles auth, CV CRUD, AI orchestration, and version management.  
**Frontend** is a React SPA with real-time preview, drag-drop editing, and template rendering.

---

## Core Features

### AI Content Generation
```
POST /api/cv/generate-content
Body: { "prompt": "Software engineer with 5 years Python experience..." }
Returns: Structured CV data (summary, experience, skills, education)
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
  "keywords_to_add": ["microservices", "CI/CD"],
  "recommendations": [...]
}
```

Paste any job posting, get actionable feedback on how to tailor your CV.

### Version History
Every save creates an automatic snapshot. Restore any previous version with one click. Also supports named checkpoints for major milestones.

### Templates
- **Modern**: Blue header, icon-based contact info, suited for tech
- **Classic**: Traditional serif layout for finance/consulting

Both templates parse the same data structure, so switching is instant.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT tokens |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/auth/refresh` | Refresh access token |

### CV Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cv/` | List all user CVs |
| POST | `/api/cv/` | Create new CV |
| GET | `/api/cv/{id}` | Get CV by ID |
| PUT | `/api/cv/{id}` | Update CV |
| DELETE | `/api/cv/{id}` | Delete CV |
| POST | `/api/cv/generate-content` | AI content generation |
| POST | `/api/cv/{id}/job-suggestions` | Job match analysis |

### Versions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cv/{id}/versions` | List versions |
| POST | `/api/cv/{id}/versions` | Create named version |
| POST | `/api/cv/{id}/versions/{vid}/restore` | Restore version |

Full OpenAPI docs at `http://localhost:8000/docs`

---

## Project Structure

```
backend/
├── api/
│   ├── auth.py          # JWT auth endpoints
│   ├── cv.py            # CV CRUD + AI endpoints
│   └── cv_schemas.py    # Pydantic models
├── models/
│   ├── user.py          # User table
│   ├── cv.py            # CV table
│   └── cv_version.py    # Version snapshots
├── services/
│   ├── auth_service.py  # Password hashing, user lookup
│   └── ai_service.py    # Azure OpenAI wrapper
└── main.py              # FastAPI app, CORS, routes

frontend/src/
├── app/
│   ├── dashboard/       # CV list, create/edit/delete
│   ├── cv/new/          # Create flow
│   └── cv/[id]/         # Edit flow
├── components/cv/
│   ├── CVEditor.tsx     # Main editor with all sections
│   ├── ModernTemplate.tsx
│   ├── ClassicTemplate.tsx
│   ├── JobSuggestions.tsx
│   └── VersionHistory.tsx
├── contexts/
│   └── AuthContext.tsx  # JWT state, auto-refresh
└── lib/
    ├── api-client.ts    # Axios instance with interceptors
    └── auth-service.ts  # Login/register/logout
```

---

## Tech Decisions

| Choice | Why |
|--------|-----|
| **FastAPI** | Async, auto-docs, Pydantic validation. Best Python web framework for APIs. |
| **Next.js 14 App Router** | Server components, better SEO potential, clean routing. |
| **SQLite default** | Zero config for dev. Swap to Postgres via env var for prod. |
| **JWT with refresh** | Stateless auth. 30min access, 7 day refresh. Standard pattern. |
| **Azure OpenAI** | Enterprise-grade, better rate limits than consumer API. |
| **@hello-pangea/dnd** | Maintained fork of react-beautiful-dnd. Smooth drag-drop. |

---

## Development Status

| Phase | Status |
|-------|--------|
| Authentication | ✅ Done |
| CV CRUD | ✅ Done |
| AI Generation | ✅ Done |
| Templates | ✅ Done |
| FlowCV-style Editor | ✅ Done |
| Job Matching | ✅ Done |
| Version History | ✅ Done |
| PDF Export | 🚧 Next |
| Public Sharing | 📋 Planned |

---

## Running Tests

```bash
# Auth flow integration test
python test_auth.py

# Manual API testing
# Visit http://localhost:8000/docs (Swagger UI)
```

---

## Known Limitations

- PDF export not yet implemented (HTML-to-PDF planned with WeasyPrint)
- No email verification (auth is email+password only)
- Single-user editing (no real-time collaboration)
- Templates are code-defined, not user-customizable

---

## License

TBD

---

## Contributing

Check [PROGRESS.md](PROGRESS.md) for the roadmap. PRs welcome for Phase 4 (Export) and beyond.

