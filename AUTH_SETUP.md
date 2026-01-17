# Authentication Setup Guide

This project implements a complete authentication system with:
- **Frontend**: Next.js with NextAuth.js and Google OAuth
- **Backend**: NestJS with JWT tokens and Supabase integration
- **Database**: Supabase PostgreSQL

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard and note down:
   - Project URL
   - Anon key
   - Service role key (from Settings > API)
3. Run the SQL schema in your Supabase SQL editor:
   ```sql
   -- Copy and paste the content from supabase-schema.sql
   ```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Add your production domain when deploying
6. Note down Client ID and Client Secret

### 3. Environment Variables

#### Backend (.env in queue-demo folder)
```env
# Application
NODE_ENV=development
PORT=3001

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Redis Configuration (if using)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### Frontend (.env.local in client folder)
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Configuration (for client-side if needed)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Running the Application

1. **Start the backend** (from queue-demo folder):
   ```bash
   pnpm install
   pnpm run start:dev
   ```

2. **Start the frontend** (from client folder):
   ```bash
   pnpm install
   pnpm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"** on the frontend
2. **NextAuth.js handles OAuth flow** with Google
3. **On successful OAuth**, NextAuth calls the backend `/auth/google` endpoint
4. **Backend checks if user exists** in Supabase:
   - If user exists: Returns JWT token
   - If new user: Creates user in Supabase, then returns JWT token
5. **JWT token is stored** in NextAuth session
6. **Protected routes** use the JWT token to authenticate API calls

### Key Components

#### Backend (NestJS)
- `AuthService`: Handles user creation, validation, and JWT generation
- `AuthController`: API endpoints for authentication
- `JwtStrategy`: Validates JWT tokens for protected routes
- `JwtAuthGuard`: Protects routes requiring authentication

#### Frontend (Next.js)
- `NextAuth.js`: Handles OAuth flow and session management
- `SignInButton`: Google sign-in component
- `useAuth` hook: Custom hook for authentication state
- `ApiClient`: HTTP client with JWT token support

### API Endpoints

- `POST /auth/google` - Handle Google OAuth login
- `POST /auth/login` - Regular login (if implementing email/password)
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile (protected)
- `GET /auth/verify` - Verify JWT token (protected)

### Database Schema

The `users` table includes:
- `id`: UUID primary key
- `email`: Unique email address
- `name`: User's display name
- `google_id`: Google OAuth ID (optional)
- `avatar`: Profile picture URL
- `created_at` / `updated_at`: Timestamps

## Security Features

- **JWT tokens** with configurable expiration
- **Row Level Security (RLS)** in Supabase
- **CORS configuration** for frontend-backend communication
- **Protected routes** on both frontend and backend
- **Secure session management** with NextAuth.js

## Customization

You can extend this setup by:
- Adding more OAuth providers (GitHub, Facebook, etc.)
- Implementing email/password authentication
- Adding user roles and permissions
- Implementing refresh tokens
- Adding user profile management features

## Troubleshooting

1. **CORS errors**: Check that backend CORS is configured for your frontend URL
2. **JWT errors**: Verify JWT_SECRET is set and consistent
3. **Supabase errors**: Check your service role key has proper permissions
4. **OAuth errors**: Verify Google OAuth redirect URIs are correctly configured