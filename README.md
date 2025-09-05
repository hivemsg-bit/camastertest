# CA Test Series
This monorepo contains frontend (React) and backend (Node/Express).

## Tech & Hosting
- Frontend: React (Vite), deployed on Vercel
- Backend: Node.js + Express, deployed on Render
- Database: MongoDB Atlas
- Storage: Firebase Storage
- Auth: Firebase Phone OTP (students), Email/Password JWT (admin)

## Local Setup
1) Backend
```
cd backend
cp .env.example .env
# Fill MONGO_URI, JWT_SECRET, Firebase Admin creds (escaped private key), and storage bucket
npm install
npm run dev
```

2) Frontend
```
cd frontend
cp .env.example .env
# Fill VITE_API_BASE_URL (Render URL in prod, http://localhost:4000 locally) and Firebase client config
npm install
npm run dev
```

## API Overview
- GET /api/health
- POST /api/auth/student/verify { idToken }
- POST /api/auth/admin/register { email, password, name } (one-time)
  - Guarded by `ENABLE_ADMIN_REGISTER=true`. Prefer CLI seeding below.
- POST /api/auth/admin/login { email, password }
- GET /api/papers
- POST /api/papers/upload (admin, multipart file+title/subject)
- GET /api/papers/:id/download (student, Firebase ID token)
- GET /api/papers/admin/list (admin)
- PATCH /api/papers/:id/toggle (admin)
- DELETE /api/papers/:id (admin)

## Deployment
1) MongoDB Atlas: Create cluster, get connection string -> set `MONGO_URI` in Render backend env
2) Firebase:
   - Enable Phone Auth
   - Create Web App -> copy client config to frontend `.env`
   - Create Service Account key -> set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in Render.
   - Set `FIREBASE_STORAGE_BUCKET` (e.g. project-id.appspot.com)
3) Render (Backend):
   - New Web Service: connect repo, root `/backend`, build command `npm install`, start `npm start`
   - Add env vars from `.env.example` and set `PORT=10000` is not needed; Render sets PORT automatically and we read `process.env.PORT`
4) Vercel (Frontend):
   - New Project from repo, root `/frontend`
   - Build command `npm run build`, output `dist`
   - Add env vars from `.env.example` (especially `VITE_API_BASE_URL` pointing to Render URL)

## Seed Admin via CLI (preferred)
```
cd backend
cp .env.example .env
# Fill Mongo + JWT + Firebase
export SEED_ADMIN_EMAIL=admin@example.com
export SEED_ADMIN_PASSWORD=StrongP@ssw0rd
npm run seed
```
To temporarily allow HTTP register endpoint, set `ENABLE_ADMIN_REGISTER=true` in backend env and redeploy. Turn it off after use.

## Notes
- Only verified students (via Firebase phone OTP) can generate signed download URLs to access files.
- Admin can upload PDF/Word files; they are stored in Firebase Storage and referenced in MongoDB.
