import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '12px', width: '380px', border: '1px solid #2a2a4a' },
  title: { color: '#7c6af7', fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', marginBottom: '14px', background: '#0f0f1a', border: '1px solid #2a2a4a', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  link: { color: '#7c6af7', textDecoration: 'none' },
  error: { color: '#ff4444', fontSize: '13px', marginBottom: '12px' }
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate(data.user.role === 'developer' ? '/developer' : '/company');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>DevLink</h2>
        <input style={s.input} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p style={s.error}>{error}</p>}
        <button style={s.btn} onClick={handleSubmit}>Login</button>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          New here? <Link to="/register" style={s.link}>Create account</Link>
        </p>
      </div>
    </div>
  );
}