import { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export default function AdminDashboard() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [papers, setPapers] = useState([])

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null

  const load = async () => {
    try {
      const r = await api.get('/papers/admin/list', { headers: { Authorization: `Bearer ${token}` } })
      setPapers(r.data)
    } catch (e) {
      setStatus('Failed to load papers. Please login.')
    }
  }

  useEffect(() => { load() }, [])

  const upload = async () => {
    if (!file) return setStatus('Select a file')
    setStatus('Uploading...')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('subject', subject)
      await api.post('/papers/upload', fd, { headers: { Authorization: `Bearer ${token}` } })
      setStatus('Uploaded')
      setTitle(''); setDescription(''); setSubject(''); setFile(null)
      await load()
    } catch (e) {
      setStatus('Upload failed')
    }
  }

  const toggle = async (id) => {
    await api.patch(`/papers/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } })
    await load()
  }

  const remove = async (id) => {
    await api.delete(`/papers/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    await load()
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
        <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button onClick={upload}>Upload Paper</button>
      </div>
      <p>{status}</p>
      <h3>All Papers</h3>
      <ul>
        {papers.map(p => (
          <li key={p._id}>
            <strong>{p.title}</strong> - {p.fileType} - {p.isActive ? 'Active' : 'Inactive'}
            <button onClick={() => toggle(p._id)} style={{ marginLeft: 8 }}>Toggle</button>
            <button onClick={() => remove(p._id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

