# 📝 CV Builder Website

A full-stack CV/Resume building website with authentication, template management, and export functionality.

## 🚀 Project Status

✅ **Phase 1 - Backend Authentication: COMPLETED**

See [PROGRESS.md](PROGRESS.md) for the complete roadmap and status.

---

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (default) / PostgreSQL
- **Authentication**: JWT tokens with refresh mechanism
- **Password**: Bcrypt hashing
- **ORM**: SQLAlchemy

### Frontend (Coming Soon)
- React / Vue / Next.js (TBD)

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- pip

### 1. Clone & Navigate
```bash
cd "c:\Program Files\Project\ideal codebase"
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
The `.env` file is already set up with defaults. For production:
- Update `SECRET_KEY` to a long, random string
- Change `DATABASE_URL` if using PostgreSQL

### 4. Run the Backend
```bash
python -m backend.main
```

The API will start at: **http://localhost:8000**

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

See [backend/README.md](backend/README.md) for detailed testing examples.

---

## 📚 API Documentation

### Live Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Authentication Endpoints

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
│   ├── api/              # API routes and schemas
│   ├── database/         # Database config and connection
│   ├── models/           # SQLAlchemy models
│   ├── services/         # Business logic
│   ├── utils/            # Utilities (JWT, passwords)
│   └── main.py           # FastAPI app entry
├── frontend/             # Frontend (Coming soon)
├── PROGRESS.md           # Development progress tracker
├── requirements.txt      # Python dependencies
├── test_auth.py          # Authentication test script
└── README.md            # This file
```

---

## ✅ Completed Features

### Authentication System
- ✅ User registration with email validation
- ✅ Secure password hashing (bcrypt)
- ✅ JWT access & refresh tokens
- ✅ Protected routes with authentication
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