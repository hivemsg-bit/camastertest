import './App.css'
import { Link } from 'react-router-dom'

function App() {
  return (
    <>
      <h1>CA Test Series</h1>
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link to="/login">Student Login</Link>
        <Link to="/papers">Browse Papers</Link>
        <Link to="/admin/login">Admin Login</Link>
      </nav>
    </>
  )
}

export default App
