import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: 'sans-serif' },
  nav: { background: '#1a1a2e', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a4a' },
  logo: { color: '#7c6af7', fontWeight: 'bold', fontSize: '1.3rem' },
  tabs: { display: 'flex', gap: '8px', padding: '20px 32px' },
  tab: (a) => ({ padding: '8px 20px', background: a ? '#7c6af7' : '#1a1a2e', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }),
  content: { padding: '0 32px 32px' },
  card: { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '10px', padding: '20px', marginBottom: '14px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', background: '#0f0f1a', border: '1px solid #2a2a4a', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' },
  btn: { padding: '10px 20px', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tag: { display: 'inline-block', background: '#2a2a4a', borderRadius: '12px', padding: '3px 10px', fontSize: '12px', marginRight: '6px', marginTop: '4px' },
  score: (n) => ({ background: n >= 70 ? '#1a4a2e' : n >= 40 ? '#4a3a1a' : '#2a1a1a', color: n >= 70 ? '#4cff91' : n >= 40 ? '#ffc84c' : '#ff6b6b', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', display: 'inline-block' })
};

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('post');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', requiredLanguages: '', location: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { if (tab === 'jobs') loadJobs(); }, [tab]);

  const loadJobs = async () => {
    const { data } = await api.get('/jobs/mine');
    setJobs(data);
  };

  const postJob = async () => {
    if (!form.title || !form.requiredLanguages) return setMsg('❌ Title and languages required');
    try {
      await api.post('/jobs', {
        ...form,
        requiredLanguages: form.requiredLanguages.split(',').map(l => l.trim())
      });
      setMsg('✅ Job posted!');
      setForm({ title: '', description: '', requiredLanguages: '', location: '' });
      loadJobs();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    }
  };

  const viewCandidates = async (job) => {
    setSelectedJob(job);
    const { data } = await api.get(`/match/candidates/${job.id}`);
    setCandidates(data);
    setTab('candidates');
  };

  const deleteJob = async (id) => {
    await api.delete(`/jobs/${id}`);
    loadJobs();
  };

  return (
    <div style={s.page}>
      <div style={s.nav}>
        <span style={s.logo}>DevLink</span>
        <span style={{ color: '#aaa' }}>🏢 {user.name}</span>
        <button onClick={logout} style={{ ...s.btn, background: '#2a2a4a', fontSize: '13px' }}>Logout</button>
      </div>

      <div style={s.tabs}>
        {['post', 'jobs', ...(selectedJob ? ['candidates'] : [])].map(t => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'candidates' ? `Candidates: ${selectedJob?.title}` : t.charAt(0).toUpperCase() + t.slice(1) + (t === 'post' ? ' Job' : 's')}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {msg && <p style={{ color: msg.startsWith('✅') ? '#4cff91' : '#ff6b6b', marginBottom: '12px' }}>{msg}</p>}

        {/* Post Job */}
        {tab === 'post' && (
          <div style={s.card}>
            <h3 style={{ marginTop: 0, color: '#7c6af7' }}>Post a New Job</h3>
            <input style={s.input} placeholder="Job title e.g. Frontend Developer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} placeholder="Job description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input style={s.input} placeholder="Required languages (comma-separated): JavaScript, Python, React" value={form.requiredLanguages} onChange={e => setForm({ ...form, requiredLanguages: e.target.value })} />
            <input style={s.input} placeholder="Location e.g. Bengaluru / Remote" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <button style={s.btn} onClick={postJob}>Post Job</button>
          </div>
        )}

        {/* My Jobs */}
        {tab === 'jobs' && (
          <div>
            {jobs.length === 0
              ? <p style={{ color: '#888' }}>No jobs posted yet.</p>
              : jobs.map(job => (
                <div key={job.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px' }}>{job.title}</h3>
                      <p style={{ color: '#888', fontSize: '13px', margin: '0 0 8px' }}>{job.location}</p>
                      {job.requiredLanguages.map(l => <span key={l} style={s.tag}>{l}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...s.btn, fontSize: '13px' }} onClick={() => viewCandidates(job)}>View Candidates</button>
                      <button style={{ ...s.btn, background: '#4a1a1a', fontSize: '13px' }} onClick={() => deleteJob(job.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Candidates */}
        {tab === 'candidates' && (
          <div>
            {candidates.length === 0
              ? <p style={{ color: '#888' }}>No developers have connected GitHub yet.</p>
              : candidates.map(c => (
                <div key={c.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <img src={c.githubData.avatar} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                      <div>
                        <h4 style={{ margin: '0 0 2px' }}>{c.name}</h4>
                        <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px' }}>
                          📦 {c.githubData.repoCount} repos · github.com/{c.githubData.username}
                        </p>
                        {c.githubData.languages.slice(0, 5).map(l => <span key={l} style={s.tag}>{l}</span>)}
                      </div>
                    </div>
                    <div style={s.score(c.matchScore)}>{c.matchScore}% match</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}