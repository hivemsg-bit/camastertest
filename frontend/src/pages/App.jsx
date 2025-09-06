import { Routes, Route, Link, Navigate } from 'react-router-dom';
import StudentLogin from './StudentLogin.jsx';
import Papers from './Papers.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <header style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #eee' }}>
        <Link to="/">Home</Link>
        <Link to="/login">Student Login</Link>
        <Link to="/papers">Papers</Link>
        <Link to="/admin">Admin</Link>
      </header>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/papers" replace />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

