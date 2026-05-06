import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '12px', width: '380px', border: '1px solid #2a2a4a' },
  title: { color: '#7c6af7', fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', marginBottom: '14px', background: '#0f0f1a', border: '1px solid #2a2a4a', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  roleRow: { display: 'flex', gap: '12px', marginBottom: '14px' },
  roleBtn: (active) => ({ flex: 1, padding: '10px', border: `1px solid ${active ? '#7c6af7' : '#2a2a4a'}`, background: active ? '#7c6af7' : 'transparent', color: '#fff', borderRadius: '8px', cursor: 'pointer' }),
  btn: { width: '100%', padding: '12px', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  link: { color: '#7c6af7', textDecoration: 'none' },
  error: { color: '#ff4444', fontSize: '13px', marginBottom: '12px' }
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate(data.user.role === 'developer' ? '/developer' : '/company');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>DevLink</h2>
        <input style={s.input} placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={s.input} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <div style={s.roleRow}>
          <button style={s.roleBtn(form.role === 'developer')} onClick={() => setForm({ ...form, role: 'developer' })}>👨‍💻 Developer</button>
          <button style={s.roleBtn(form.role === 'company')} onClick={() => setForm({ ...form, role: 'company' })}>🏢 Company</button>
        </div>
        {error && <p style={s.error}>{error}</p>}
        <button style={s.btn} onClick={handleSubmit}>Create Account</button>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}