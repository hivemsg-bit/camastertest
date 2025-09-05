import { useEffect, useState } from 'react'
import axios from 'axios'
import { getAuth } from 'firebase/auth'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export default function Papers() {
  const [papers, setPapers] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    api.get('/papers').then(r => setPapers(r.data)).catch(() => setStatus('Failed to load'))
  }, [])

  const download = async (id) => {
    setStatus('Generating link...')
    try {
      const auth = getAuth()
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : ''
      const r = await api.get(`/papers/${id}/download`, { headers: { Authorization: `Bearer ${token}` } })
      window.location.href = r.data.url
      setStatus('')
    } catch (e) {
      setStatus('You must be a verified student to download')
    }
  }

  return (
    <div>
      <h2>Available Papers</h2>
      <ul>
        {papers.map(p => (
          <li key={p.id}>
            <strong>{p.title}</strong> ({p.fileType}) - {new Date(p.createdAt).toLocaleDateString()} 
            <button onClick={() => download(p.id)} style={{ marginLeft: 8 }}>Download</button>
          </li>
        ))}
      </ul>
      <p>{status}</p>
    </div>
  )
}

