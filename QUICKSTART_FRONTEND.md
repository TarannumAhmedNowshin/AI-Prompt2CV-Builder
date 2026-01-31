# 🚀 Quick Start Guide - AI Prompt2CV Builder

## Getting Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Start the Application

**Option A - Easy Way (Windows):**
Double-click `start_fullstack.bat` - This opens both servers automatically!

**Option B - Manual Way:**

Terminal 1 (Backend):
```bash
python -m backend.main
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 3: Open Your Browser

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Step 4: Create Your First CV

1. Click "Sign Up" on the homepage
2. Create your account (email, username, password)
3. Login with your credentials
4. Click "Create New CV" on your dashboard
5. Fill in your details or use the AI assistant!

---

## What's Included

### Frontend Features ✨
- **Landing Page** - Professional homepage with features
- **Authentication** - Secure login/register
- **Dashboard** - Manage all your CVs
- **CV Builder** - Create and edit CVs with AI assistance
- **Export** - Download as PDF (coming soon)

### Backend Features 🔧
- **REST API** - Full authentication system
- **JWT Tokens** - Secure token-based auth
- **Database** - SQLite for easy setup
- **Documentation** - Auto-generated API docs

---

## URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend | http://localhost:8000 | API server |
| Swagger UI | http://localhost:8000/docs | Interactive API docs |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |

---

## Default Ports

- **Frontend:** 3000
- **Backend:** 8000

If these ports are in use, you can change them:
- Frontend: Edit `package.json` scripts (`-p 3000` to `-p YOUR_PORT`)
- Backend: Edit `.env` file (`PORT=8000` to `PORT=YOUR_PORT`)

---

## First-Time Setup Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register a new account
- [ ] Can login successfully

---

## Common Issues & Solutions

### Issue: "Port already in use"
**Solution:** Kill the process using the port or change the port in config

### Issue: "Module not found" (Backend)
**Solution:** Make sure you're in the project root and run `pip install -r requirements.txt`

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Cannot connect to backend"
**Solution:** 
1. Check backend is running on http://localhost:8000
2. Check `.env.local` in frontend has correct `NEXT_PUBLIC_API_URL`

---

## Next Steps

After you've set up the application:

1. **Explore the Dashboard** - See your CV management interface
2. **Create a CV** - Try the CV builder with different sections
3. **Test AI Assistant** - Use the AI prompt feature (UI ready, backend integration coming)
4. **Check API Docs** - Visit http://localhost:8000/docs to see all endpoints
5. **Customize** - Modify the code to fit your needs

---

## Documentation

- **Main README:** [README.md](README.md)
- **Backend Docs:** [backend/README.md](backend/README.md)
- **Frontend Docs:** [frontend/README.md](frontend/README.md)
- **Progress Tracker:** [PROGRESS.md](PROGRESS.md)

---

## Need Help?

1. Check the documentation files
2. Review the API docs at http://localhost:8000/docs
3. Check console logs for errors
4. Verify all dependencies are installed

---

**You're all set! Start building amazing CVs! 🎉**
