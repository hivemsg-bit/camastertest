import { useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const login = async () => {
    setStatus('Logging in...')
    try {
      const r = await api.post('/auth/admin/login', { email, password })
      localStorage.setItem('adminToken', r.data.token)
      setStatus('Logged in')
      window.location.href = '/admin'
    } catch (e) {
      setStatus('Invalid credentials')
    }
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <p>{status}</p>
    </div>
  )
}

