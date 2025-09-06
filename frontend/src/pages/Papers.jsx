import { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '@/lib/firebase.js';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/papers`)
      .then((res) => setPapers(res.data))
      .catch((e) => setError(e.message));
  }, []);

  const download = async (paperId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Please login to download');
      const token = await user.getIdToken();
      const res = await axios.post(`${API_BASE}/api/papers/download/${paperId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const url = res.data.url;
      window.open(url, '_blank');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Available Papers</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {papers.map((p) => (
          <li key={p._id} style={{ marginBottom: 8 }}>
            <strong>{p.title}</strong>
            <div>{p.description}</div>
            <button onClick={() => download(p._id)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

