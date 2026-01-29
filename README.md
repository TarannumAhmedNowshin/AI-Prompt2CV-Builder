# 📝 AI CV Builder

A full-stack AI-powered CV/Resume building website with authentication, AI content generation, and export functionality.

## 🚀 Project Status

✅ **Phase 1 - Backend Authentication: COMPLETED**  
✅ **Phase 2 - Frontend Application: COMPLETED**

See [PROGRESS.md](PROGRESS.md) for the complete roadmap and status.

---

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (default) / PostgreSQL
- **Authentication**: JWT tokens with refresh mechanism
- **Password**: Bcrypt hashing
- **ORM**: SQLAlchemy

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with Lucide icons

---

## 📦 Installation & Setup

### Prerequisites
- **Backend**: Python 3.8+, pip
- **Frontend**: Node.js 18+, npm

### Quick Start (Full Stack)

**Option 1: Use the startup script (Windows)**
```bash
start_fullstack.bat
```

**Option 2: Manual setup**

1. **Start Backend** (Terminal 1):
```bash
cd "c:\Program Files\Project\ideal codebase"
pip install -r requirements.txt
python -m backend.main
```
Backend will run at: **http://localhost:8000**

2. **Start Frontend** (Terminal 2):
```bash
cd "c:\Program Files\Project\ideal codebase\frontend"
npm install
npm run dev
```
Frontend will run at: **http://localhost:3000**

### Individual Setup

#### Backend Only
```bash
pip install -r requirements.txt
python -m backend.main
```

#### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

### Configuration

**Backend** (`.env` in root):
- `SECRET_KEY` - JWT secret (update for production)
- `DATABASE_URL` - Database connection string

**Frontend** (`.env.local` in frontend/):
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

---

## 🧪 Testing

### Quick Test
```bash
python test_auth.py
```

### Manual Testing
Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

#### Example: Register and Login
1. Go to http://localhost:8000/docs
2. Use `/api/auth/register` to create an account
3. Use `/api/auth/login` to get your tokens
4. Click "Authorize" and enter: `Bearer YOUR_ACCESS_TOKEN`
5. Test protected endpoints like `/api/auth/me`
                    # FastAPI Backend
│   ├── api/                   # API routes and schemas
│   ├── database/              # Database config and connection
│   ├── models/                # SQLAlchemy models
│   ├── services/              # Business logic
│   ├── utils/                 # Utilities (JWT, passwords)
│   └── main.py                # FastAPI app entry
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js pages (App Router)
│   │   │   ├── page.tsx     # Landing page
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Registration page
│   │   │   ├── dashboard/   # User dashboard
│   │   │   └── cv/          # CV builder
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── auth/        # Auth components
│   │   │   └── layout/      # Layout components
│   │   ├── contexts/         # React contexts
│   │   └── lib/             # API client & services
│   ├── package.json
│   └── README.md
├── start_frontend.bat         # Frontend startup script
├── start_fullstack.bat        # Start both servers
├── PROGRESS.md                # Development progress tracker
├── requirements.txt           # Python dependencies
├── test_auth.py              # Authentication test script
└── README.md     ation Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login & get tokens | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/refresh` | POST | Refresh access token | No |
| `/api/auth/logout` | POST | Logout | Yes |

---

## 📁 Project Structure

```
.
├── backend/
│   Backend
- ✅ User registration with email validation
- ✅ Secure password hashing (bcrypt)
- ✅ JWT access & refresh tokens
- ✅ Protected routes with authentication
- ✅ Token refresh mechanism
- ✅ User profile endpoint
- ✅ Complete API documentation
- ✅ Test suite

### Frontend
- ✅ Modern Next.js 14 application with TypeScript
- ✅ Responsive UI with Tailwind CSS
- ✅ User authentication (Login/Register)
- ✅ Protected routes and auth context
- ✅ Token management with auto-refresh
- ✅ User dashboard
- ✅ CV creation interface
- ✅ AI prompt assistant UI
- ✅ Professional landing page
- ✅ Toast notifications
- ✅ Reusable UI components

---

## 🚧 Coming Next

See [PROGRESS.md](PROGRESS.md) for the complete roadmap.

**Next Priority:**
1. Backend CV data models and CRUD API
2. AI integration for content generation
3. CV template system
4. PDF export functionality
5. CV preview feature routes with authentication
- ✅ Token refresh mechanism
- ✅ User profile endpoint
- ✅ Complete API documentation
- ✅ Test suite

---

## 🚧 Coming Next

See [PROGRESS.md](PROGRESS.md) for the complete roadmap.

**Next Priority:**
1. Frontend authentication pages (Login/Register)
2. CV data models and CRUD operations
3. CV builder interface
4. Template system
5. PDF export

---

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Access tokens expire in 30 minutes
- Refresh tokens expire in 7 days
- CORS configured for security

---

## 🤝 Contributing

This is a development project. Progress is tracked in [PROGRESS.md](PROGRESS.md).

---

## 📄 License

TBD

---

## 📞 Support

For issues or questions, refer to the documentation in:
- [PROGRESS.md](PROGRESS.md) - Development roadmap
- [backend/README.md](backend/README.md) - Backend setup & testing

---

**Happy Building! 🎉**