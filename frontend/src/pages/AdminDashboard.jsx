import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function AdminDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [papers, setPapers] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('adminToken');
  const axiosAuth = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  const refresh = async () => {
    try {
      const { data } = await axiosAuth.get(`${API_BASE}/api/admin/papers`);
      setPapers(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const upload = async () => {
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('file', file);
      await axiosAuth.post(`${API_BASE}/api/admin/papers`, form);
      setTitle('');
      setDescription('');
      setFile(null);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const setActive = async (id, active) => {
    try {
      await axiosAuth.patch(`${API_BASE}/api/admin/papers/${id}`, { isActive: active });
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const remove = async (id) => {
    try {
      await axiosAuth.delete(`${API_BASE}/api/admin/papers/${id}`);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <section style={{ marginBottom: 24 }}>
        <h3>Upload Paper</h3>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ display: 'block', marginBottom: 8 }} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ display: 'block', marginBottom: 8, width: 320, height: 80 }} />
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div style={{ marginTop: 8 }}>
          <button onClick={upload} disabled={!title || !file}>Upload</button>
        </div>
      </section>
      <section>
        <h3>Papers</h3>
        <ul>
          {papers.map((p) => (
            <li key={p._id} style={{ marginBottom: 12 }}>
              <strong>{p.title}</strong> — {p.isActive ? 'Active' : 'Inactive'}
              <div>
                <button onClick={() => setActive(p._id, !p.isActive)}>{p.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => remove(p._id)} style={{ marginLeft: 8 }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

