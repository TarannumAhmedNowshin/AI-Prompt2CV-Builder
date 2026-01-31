# AI Prompt2CV Builder - Frontend

Next.js frontend for the AI Prompt2CV Builder application.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
# .env.local is already configured with defaults
# For production, update NEXT_PUBLIC_API_URL
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx         # Home/Landing page
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── dashboard/       # User dashboard
│   │   └── cv/             # CV creation/editing
│   ├── components/          # React components
│   │   ├── auth/           # Auth-related components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   └── lib/                # Utilities and services
│       ├── api-client.ts   # Axios API client
│       └── auth-service.ts # Auth service
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Features

### Authentication
- User registration with validation
- Login with username or email
- JWT token management with automatic refresh
- Protected routes
- Logout functionality

### CV Builder
- Create new CVs
- AI-powered content generation
- Edit existing CVs
- Export to PDF
- Dashboard to manage multiple CVs

### UI Components
- Responsive design with Tailwind CSS
- Custom Button, Input, and Card components
- Loading states and error handling
- Toast notifications
- Modern, professional interface

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the FastAPI backend through:

- **Base URL**: `http://localhost:8000`
- **Auth Endpoints**:
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - Login
  - GET `/api/auth/me` - Get current user
  - POST `/api/auth/refresh` - Refresh token
  - POST `/api/auth/logout` - Logout

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Development Notes

### Token Management
- Access tokens stored in localStorage
- Automatic token refresh on 401 errors
- Tokens cleared on logout

### Protected Routes
- Use `<ProtectedRoute>` wrapper for authenticated pages
- Automatic redirect to login if not authenticated

### Styling
- Tailwind CSS for utility-first styling
- Custom color palette (primary blue theme)
- Responsive breakpoints for mobile/tablet/desktop

## Production Deployment

1. Update environment variables:
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

2. Build the application:
```bash
npm run build
```

3. Start production server:
```bash
npm run start
```

Or deploy to Vercel, Netlify, or your preferred hosting platform.

## Future Enhancements

- [ ] Real AI integration for content generation
- [ ] Multiple CV templates
- [ ] PDF export with custom styling
- [ ] CV preview before export
- [ ] Share CV with unique link
- [ ] CV analytics and tracking
