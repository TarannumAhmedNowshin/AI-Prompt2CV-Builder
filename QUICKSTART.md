# 🚀 Quick Start Guide - CV Builder Backend

## ⚡ Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start the Server
```bash
python start_backend.py
```
Or simply:
```bash
python -m backend.main
```

### Step 3: Test It!
Open your browser:
- **API Docs**: http://localhost:8000/docs
- **Test Script**: `python test_auth.py`

---

## 🧪 Try It Now!

### Using Swagger UI (Easiest!)

1. Go to http://localhost:8000/docs
2. Expand `POST /api/auth/register`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "email": "test@example.com",
     "username": "testuser",
     "password": "password123",
     "full_name": "Test User"
   }
   ```
5. Click "Execute"
6. Now try `POST /api/auth/login` with same credentials
7. Copy the `access_token` from response
8. Click "Authorize" button (top right)
9. Enter: `Bearer YOUR_TOKEN_HERE`
10. Try `GET /api/auth/me` - it works! 🎉

---

## 📝 Quick Examples

### Register a User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myuser",
    "password": "securepass123",
    "full_name": "My Name"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "myuser",
    "password": "securepass123"
  }'
```

### Get Current User (Protected)
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📚 Documentation

- **Full Backend Docs**: [backend/README.md](backend/README.md)
- **Project Progress**: [PROGRESS.md](PROGRESS.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Main README**: [README.md](README.md)

---

## ✅ What's Working

- [x] User Registration
- [x] User Login
- [x] JWT Tokens (Access + Refresh)
- [x] Protected Routes
- [x] Password Hashing
- [x] Token Refresh
- [x] User Logout
- [x] API Documentation
- [x] Automated Tests

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Check Python version (needs 3.8+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Database errors?
```bash
# Delete the database and restart
rm cv_builder.db
python -m backend.main
```

### Import errors?
```bash
# Make sure you're in the project root
cd "c:\Program Files\Project\ideal codebase"
python -m backend.main
```

---

## 🎯 Next Steps

1. **Test the current system** - Use test_auth.py or Swagger UI
2. **Choose your path**:
   - Option A: Build frontend authentication (Login/Register pages)
   - Option B: Continue with backend CV builder features

See [PROGRESS.md](PROGRESS.md) for the complete roadmap!

---

## 💡 Pro Tips

- Use Swagger UI for interactive testing: http://localhost:8000/docs
- Check logs in terminal for debugging
- Access token expires in 30 minutes - use refresh token to get new one
- All passwords are securely hashed with bcrypt
- Database is SQLite by default (cv_builder.db file)

---

**Need Help?** Check [backend/README.md](backend/README.md) for detailed examples!

Happy coding! 🎉
