# CA Test Series – Full Stack App

Monorepo with `frontend` (React + Vite) and `backend` (Node.js + Express + MongoDB + Firebase Storage). Students sign in via Firebase Phone OTP to download papers. Admins use email/password to upload/manage papers.

## Tech Stack
- Frontend: React (Vite), Firebase Client (Phone OTP), Axios, React Router
- Backend: Express, MongoDB (Atlas via Mongoose), Firebase Admin SDK (auth verify + Storage), Multer, JWT for admin
- Storage: Firebase Storage (Google Cloud Storage bucket)
- Deploy: Frontend on Vercel, Backend on Render

## Folder Structure
- `frontend/` – Student and Admin UI
- `backend/` – API server, DB models, file storage integration

## Prerequisites
- Node.js 18+
- Firebase project with Phone Authentication enabled
- Firebase Storage bucket
- MongoDB Atlas cluster

## Local Setup

1) Clone and install
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2) Configure environment files
- Copy `backend/.env.example` to `backend/.env` and fill values:
  - `MONGODB_URI`: your MongoDB Atlas connection string
  - `ADMIN_JWT_SECRET`: long random string
  - `ADMIN_BOOTSTRAP_SECRET`: temp secret to create first admin via endpoint
  - `FIREBASE_SERVICE_ACCOUNT_JSON`: JSON string of service account (escape newlines in private key)
  - `FIREBASE_STORAGE_BUCKET`: like `your-project-id.appspot.com`
  - `CORS_ORIGIN`: `http://localhost:5173`
- Copy `frontend/.env.example` to `frontend/.env` and fill Firebase web config + `VITE_API_BASE` (e.g. `http://localhost:8080`).

3) Run backend
```bash
cd backend
npm run dev
# API: http://localhost:8080
```

4) Run frontend
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

## Bootstrap Admin User
Use a one-time endpoint to create the first admin, then delete/change `ADMIN_BOOTSTRAP_SECRET`.
```bash
curl -X POST http://localhost:8080/api/auth/admin/bootstrap \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"admin@example.com",
    "password":"ChangeMeStrong",
    "secret":"<ADMIN_BOOTSTRAP_SECRET>"
  }'
```
Then login in UI at `/admin`.

## Student Flow
- Open `/login`, enter phone number in E.164 (e.g. `+91...`), receive and verify OTP.
- Browse `/papers` list. To download, you must be logged in; the frontend fetches a time-limited signed URL from the backend and opens the file.

## Admin Flow
- Login at `/admin`.
- Upload PDF/DOC/DOCX, set title/description.
- Manage: activate/deactivate, delete papers.

## Deployment

### Backend on Render
Create a new Web Service from this repo or use Blueprint.

`render.yaml` example (placed at repo root):
```yaml
services:
  - type: web
    name: ca-test-series-backend
    env: node
    plan: free
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: PORT
        value: 8080
      - key: MONGODB_URI
        sync: false
      - key: ADMIN_JWT_SECRET
        sync: false
      - key: ADMIN_BOOTSTRAP_SECRET
        sync: false
      - key: FIREBASE_SERVICE_ACCOUNT_JSON
        sync: false
      - key: FIREBASE_STORAGE_BUCKET
        sync: false
      - key: CORS_ORIGIN
        value: https://<your-vercel-domain>
```
Set the `envVars` values in Render dashboard (those with `sync: false`).

### Frontend on Vercel
- Import the repo into Vercel, set project root to `frontend`.
- Framework preset: Vite.
- Environment Variables:
  - `VITE_API_BASE`: `https://<your-render-backend>.onrender.com`
  - Firebase web config variables from your Firebase Console
- Build command: `npm run build`
- Output directory: `dist`

### Firebase Configuration
- In Firebase Console:
  - Enable Phone Authentication under Authentication → Sign-in method.
  - Add your Vercel domain and localhost to the Authorized domains.
  - Ensure Firebase Storage is enabled. Note the bucket name for backend `FIREBASE_STORAGE_BUCKET`.
- Service Account for backend:
  - Create a service account key (JSON) with Storage Admin access.
  - Put the JSON content (stringified) into `FIREBASE_SERVICE_ACCOUNT_JSON`.

## API Overview
- `GET /health` – health check
- `POST /api/auth/admin/login` – admin login (email/password) → `{ token }`
- `POST /api/auth/admin/bootstrap` – create first admin (requires `ADMIN_BOOTSTRAP_SECRET`)
- `GET /api/papers` – public list of active papers (no URLs)
- `POST /api/papers/download/:id` – student-only, returns `{ url }` signed URL
- `POST /api/admin/papers` – admin upload (multipart: `file`, fields: `title`, `description`)
- `GET /api/admin/papers` – admin list
- `PATCH /api/admin/papers/:id` – admin update (`isActive`, optional `title`, `description`)
- `DELETE /api/admin/papers/:id` – admin delete

## Security Notes
- Student downloads require a valid Firebase ID token containing `phone_number`.
- Admin JWT is signed with `ADMIN_JWT_SECRET`.
- Signed download URLs expire quickly (default 5 minutes).

## License
MIT