# Private Notes Application - Full Stack Setup Guide

A secure, private note-taking application with authentication, built with React, TypeScript, Node.js, Express, and Supabase.

## Features Implemented

### ✅ Core Requirements
- **Authentication**: Email/Password + Google OAuth via Supabase Auth
- **Data Ownership**: Row-Level Security ensures users only access their own notes
- **Notes CRUD**: Create, Read, Update, Delete notes
- **Clean UI**: Modern, distraction-free interface with Tailwind CSS + shadcn/ui

### ✅ Bonus Features
- **Edit Notes**: Full editing capability with live updates
- **Auto-save**: Notes automatically save while typing (2-second debounce)
- **Smooth Transitions**: Fade-in and slide animations throughout
- **Mobile-Friendly**: Fully responsive design for all screen sizes
- **Search**: Real-time note search functionality
- **Visual Feedback**: Loading states, save indicators, and smooth transitions

### ✅ UX Excellence
- Private, focused, distraction-free design
- Clear visual hierarchy
- Instant feedback on all actions
- Minimal, intentional interface
- Professional color scheme with dark mode support

---

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier works)
- **Git** for cloning

---

## Part 1: Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - **Name**: private-notes
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
5. Wait for project creation (~2 minutes)

### 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Enable **Email provider** (should be enabled by default)
3. Enable **Google provider**:
   - Follow Supabase's Google OAuth setup guide
   - Add authorized redirect URLs:
     - `http://localhost:5173` (development)
     - Your production URL (when deployed)

### 3. Set Up Database

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy and paste the entire SQL setup code from `Supabase - Database Setup SQL`
4. Click **Run** to execute
5. Verify the `notes` table is created under **Table Editor**

### 4. Get API Keys

1. Go to **Settings > API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## Part 2: Backend Setup

### 1. Create Backend Directory

```bash
mkdir notes-backend
cd notes-backend
```

### 2. Initialize Project

```bash
npm init -y
```

### 3. Install Dependencies

```bash
npm install express @supabase/supabase-js cors dotenv helmet express-rate-limit
npm install -D typescript @types/express @types/cors @types/node tsx
```

### 4. Create Project Structure

```bash
mkdir -p src/config src/middleware src/routes
```

### 5. Copy Files

Create these files from the artifacts provided:
- `package.json` → Root directory
- `tsconfig.json` → Root directory
- `.env` → Root directory (create from `.env.example`)
- `src/config/supabase.ts`
- `src/middleware/auth.ts`
- `src/routes/notes.ts`
- `src/server.ts`

### 6. Configure Environment Variables

Create `.env` file in backend root:

```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=development
```

Replace the values with your Supabase credentials from Step 1.4.

### 7. Start Backend Server

```bash
npm run dev
```

You should see: `Server running on port 3001`

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

---

## Part 3: Frontend Setup

### 1. Create Frontend Directory

In a **new terminal** (keep backend running):

```bash
cd ..
npm create vite@latest notes-frontend -- --template react-ts
cd notes-frontend
```

### 2. Install Dependencies

```bash
npm install
npm install react-router-dom @supabase/supabase-js axios lucide-react class-variance-authority clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

### 3. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

### 4. Create Project Structure

```bash
mkdir -p src/components/ui src/contexts src/lib src/pages
```

### 5. Copy Files

Create these files from the artifacts:
- `tailwind.config.js` → Root directory (replace existing)
- `vite.config.ts` → Root directory (replace existing)
- `tsconfig.json` → Root directory (replace existing)
- `.env` → Root directory (create from `.env.example`)
- `index.html` → Root directory (replace existing)
- `src/index.css` → (replace existing)
- `src/main.tsx` → (replace existing)
- `src/App.tsx` → (replace existing)
- `src/lib/utils.ts`
- `src/lib/supabase.ts`
- `src/lib/api.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/card.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/NoteEditor.tsx`
- `src/pages/Login.tsx`
- `src/pages/Notes.tsx`

### 6. Configure Environment Variables

Create `.env` file in frontend root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

Replace with your Supabase credentials.

### 7. Start Frontend

```bash
npm run dev
```

The app should open at `http://localhost:5173`

---

## Testing the Application

### 1. Create an Account

1. Open `http://localhost:5173`
2. Click "Don't have an account? Sign up"
3. Enter email and password (min 6 characters)
4. Click "Sign Up"
5. Check your email for verification (if required by Supabase settings)

### 2. Sign In

1. Use the email/password you created
2. Or click "Google" to sign in with Google OAuth

### 3. Create Notes

1. Click "New Note" button
2. Enter a title and content
3. Click "Create" or wait for auto-save (if editing)
4. Note appears in the sidebar

### 4. Test Features

- **Search**: Type in the search bar to filter notes
- **Edit**: Click a note, modify it, watch auto-save indicator
- **Delete**: Hover over a note, click trash icon
- **Sign Out**: Click "Sign Out" in header

---

## Security Features

### Database Level
- **Row-Level Security (RLS)**: Enforced at PostgreSQL level
- **User Isolation**: Each user can only access their own notes
- **Foreign Key Constraints**: Notes cascade delete when user is deleted

### Backend Level
- **JWT Authentication**: Every request validates bearer token
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers
- **CORS**: Restricted to frontend origin

### Frontend Level
- **Protected Routes**: Unauthenticated users redirected to login
- **Token Management**: Automatic token refresh via Supabase client
- **Secure Storage**: Auth tokens stored in httpOnly cookies by Supabase

---

## Production Deployment

### Backend (e.g., Railway, Render, Fly.io)

1. Push backend code to GitHub
2. Connect repository to hosting platform
3. Set environment variables:
   ```
   PORT=3001
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```
4. Deploy

### Frontend (e.g., Vercel, Netlify)

1. Push frontend code to GitHub
2. Connect repository to hosting platform
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variables:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_API_URL=https://your-backend-domain.com
   ```
6. Deploy

### Supabase Configuration

1. Update **Authentication > URL Configuration**:
   - Add production site URL
   - Add redirect URLs
2. Update **API Settings** if needed

---

## Troubleshooting

### Backend won't start
- Check `.env` file exists and has correct values
- Ensure port 3001 is not in use: `lsof -i :3001`
- Check Supabase credentials are valid

### Frontend won't connect
- Verify backend is running on port 3001
- Check frontend `.env` has correct API URL
- Check browser console for CORS errors

### Authentication fails
- Verify Supabase Auth is enabled
- Check email confirmation settings in Supabase
- For Google OAuth, verify redirect URLs are configured

### Notes don't save
- Check backend logs for errors
- Verify authentication token is being sent
- Check RLS policies in Supabase

### Auto-save not working
- Check browser console for errors
- Verify note ID exists (auto-save only works on existing notes)
- Check network tab for API calls

---

## Project Structure

```
notes-app/
├── notes-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   └── notes.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── notes-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── button.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── input.tsx
    │   │   │   └── textarea.tsx
    │   │   ├── NoteEditor.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── lib/
    │   │   ├── api.ts
    │   │   ├── supabase.ts
    │   │   └── utils.ts
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   └── Notes.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .env
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## API Endpoints

### Notes API

**Base URL**: `http://localhost:3001/api/notes`

All endpoints require `Authorization: Bearer <token>` header.

#### GET `/api/notes`
Get all notes for authenticated user.

**Response**: `Note[]`

#### GET `/api/notes/:id`
Get single note by ID.

**Response**: `Note`

#### POST `/api/notes`
Create a new note.

**Body**:
```json
{
  "title": "string",
  "content": "string"
}
```

**Response**: `Note`

#### PUT `/api/notes/:id`
Update existing note.

**Body**:
```json
{
  "title": "string",
  "content": "string"
}
```

**Response**: `Note`

#### DELETE `/api/notes/:id`
Delete note.

**Response**: `204 No Content`

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Supabase JS Client** - Authentication

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase JS Client** - Database & Auth
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **express-rate-limit** - Rate limiting

### Database & Auth
- **Supabase** - PostgreSQL database + Authentication
- **Row-Level Security** - Data isolation
- **JWT** - Token-based auth

---

## License

MIT

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation: https://supabase.com/docs
3. Check browser console and terminal logs

---
