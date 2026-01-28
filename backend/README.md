# CV Builder - Backend Setup & Testing

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

The `.env` file is already configured with default settings. For production, update:
- `SECRET_KEY` - Use a long, random string
- `DATABASE_URL` - Change to PostgreSQL if needed

### 3. Run the Backend

```bash
# From the project root directory
python -m backend.main
```

Or:

```bash
uvicorn backend.main:app --reload
```

The API will be available at: **http://localhost:8000**

### 4. Access API Documentation

Open your browser and go to:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📝 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get tokens | No |
| POST | `/api/auth/token` | OAuth2 login (for Swagger) | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

---

## 🧪 Testing the API

### Using cURL

#### 1. Register a New User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "securepassword123",
    "full_name": "Test User"
  }'
```

#### 2. Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### 3. Get Current User (Protected Route)

```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Refresh Token

```bash
curl -X POST "http://localhost:8000/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### Using Python Requests

```python
import requests

BASE_URL = "http://localhost:8000"

# Register
response = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": "test@example.com",
    "username": "testuser",
    "password": "securepassword123",
    "full_name": "Test User"
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username_or_email": "testuser",
    "password": "securepassword123"
})
tokens = response.json()
access_token = tokens["access_token"]

# Get current user
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
print(response.json())
```

### Using Swagger UI

1. Go to http://localhost:8000/docs
2. Click on "Authorize" button (top right)
3. Register a user using `/api/auth/register`
4. Login using `/api/auth/token` with your credentials
5. Copy the `access_token` from the response
6. Click "Authorize" again and paste: `Bearer YOUR_ACCESS_TOKEN`
7. Now you can test all protected endpoints!

---

## 🗄️ Database

By default, the app uses SQLite (`cv_builder.db` file). The database is automatically created when you start the server.

### Switch to PostgreSQL

1. Install PostgreSQL
2. Create a database: `CREATE DATABASE cv_builder;`
3. Update `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost/cv_builder
   ```

---

## 🔐 Security Notes

- Access tokens expire in 30 minutes (default)
- Refresh tokens expire in 7 days (default)
- Passwords are hashed using bcrypt
- JWT tokens are signed with HS256

---

## 📊 Project Structure

```
backend/
├── api/
│   ├── __init__.py
│   ├── auth.py          # Authentication routes
│   └── schemas.py       # Pydantic models
├── database/
│   ├── __init__.py
│   ├── base.py          # Database setup
│   └── config.py        # Settings/configuration
├── models/
│   ├── __init__.py
│   └── user.py          # User database model
├── services/
│   ├── __init__.py
│   └── auth_service.py  # Business logic
├── utils/
│   ├── __init__.py
│   └── auth.py          # JWT & password utilities
└── main.py              # FastAPI app entry point
```

---

## ✅ What's Implemented

- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ Access & refresh tokens
- ✅ Protected routes with authentication
- ✅ Get current user endpoint
- ✅ Token refresh mechanism
- ✅ SQLite database (easy switch to PostgreSQL)
- ✅ CORS configuration
- ✅ API documentation (Swagger/ReDoc)

---

## 🚧 What's Next

Check [PROGRESS.md](../PROGRESS.md) for the complete roadmap!

Next steps:
- Build the CV/Resume data models
- Create CV CRUD operations
- Add profile photo upload
- Frontend authentication pages
