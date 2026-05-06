import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: 'sans-serif' },
  nav: { background: '#1a1a2e', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a4a' },
  logo: { color: '#7c6af7', fontWeight: 'bold', fontSize: '1.3rem' },
  tabs: { display: 'flex', gap: '8px', padding: '20px 32px' },
  tab: (active) => ({ padding: '8px 20px', background: active ? '#7c6af7' : '#1a1a2e', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }),
  content: { padding: '0 32px 32px' },
  card: { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '10px', padding: '20px', marginBottom: '14px' },
  input: { padding: '10px', background: '#0f0f1a', border: '1px solid #2a2a4a', borderRadius: '8px', color: '#fff', width: '260px', marginRight: '10px' },
  btn: { padding: '10px 20px', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tag: { display: 'inline-block', background: '#2a2a4a', borderRadius: '12px', padding: '3px 10px', fontSize: '12px', marginRight: '6px', marginTop: '4px' },
  score: (n) => ({ background: n >= 70 ? '#1a4a2e' : n >= 40 ? '#4a3a1a' : '#2a1a1a', color: n >= 70 ? '#4cff91' : n >= 40 ? '#ffc84c' : '#ff6b6b', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px' })
};

export default function DevDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [githubInput, setGithubInput] = useState('');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (tab === 'jobs') loadJobs();
    if (tab === 'applications') loadApplications();
  }, [tab]);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/github/profile');
      setProfile(data);
      setGithubInput(data.githubUsername || '');
    } catch {}
  };

  const connectGitHub = async () => {
    if (!githubInput.trim()) return;
    setLoading(true);
    setMsg('');
    try {
      await api.post('/github/connect', { githubUsername: githubInput });
      setMsg('✅ GitHub connected!');
      loadProfile();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    }
    setLoading(false);
  };

  const loadJobs = async () => {
    try {
      const { data } = await api.get('/match/jobs');
      setJobs(data);
    } catch {}
  };

  const loadApplications = async () => {
    try {
      const { data } = await api.get('/match/applications');
      setApplications(data);
    } catch {}
  };

  const applyToJob = async (jobId) => {
    try {
      await api.post(`/match/apply/${jobId}`);
      setMsg('✅ Applied!');
      loadJobs();
      loadApplications();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    }
  };

  const alreadyApplied = (jobId) => applications.some(a => a.jobId === jobId);

  return (
    <div style={s.page}>
      <div style={s.nav}>
        <span style={s.logo}>DevLink</span>
        <span style={{ color: '#aaa' }}>👋 {user.name}</span>
        <button onClick={logout} style={{ ...s.btn, background: '#2a2a4a', fontSize: '13px' }}>Logout</button>
      </div>

      <div style={s.tabs}>
        {['profile', 'jobs', 'applications'].map(t => (
          <button key={t} style={s.tab(tab === t)} onClick={() => { setTab(t); setMsg(''); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {msg && <p style={{ color: msg.startsWith('✅') ? '#4cff91' : '#ff6b6b', marginBottom: '12px' }}>{msg}</p>}

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <div>
            <div style={s.card}>
              <h3 style={{ marginTop: 0, color: '#7c6af7' }}>Connect GitHub</h3>
              <input style={s.input} placeholder="GitHub username" value={githubInput} onChange={e => setGithubInput(e.target.value)} />
              <button style={s.btn} onClick={connectGitHub} disabled={loading}>
                {loading ? 'Loading...' : 'Connect'}
              </button>
            </div>

            {profile?.githubData && (
              <div style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img src={profile.githubData.avatar} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                  <div>
                    <h3 style={{ margin: 0 }}>{profile.githubData.name || profile.githubData.username}</h3>
                    <p style={{ margin: '4px 0', color: '#888', fontSize: '13px' }}>{profile.githubData.bio}</p>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '13px' }}>
                      📦 {profile.githubData.repoCount} repos &nbsp;|&nbsp; ⭐ {profile.githubData.followers} followers
                    </p>
                  </div>
                </div>
                <div>
                  <p style={{ color: '#aaa', marginBottom: '6px', fontSize: '13px' }}>Top Languages:</p>
                  {profile.githubData.languages.map(lang => (
                    <span key={lang} style={s.tag}>{lang}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Jobs Tab ── */}
        {tab === 'jobs' && (
          <div>
            {jobs.length === 0
              ? <p style={{ color: '#888' }}>No jobs yet. Connect your GitHub first for match scores.</p>
              : jobs.map(job => (
                <div key={job.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: '#fff' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 8px', color: '#888', fontSize: '13px' }}>{job.companyName} · {job.location}</p>
                      <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#ccc' }}>{job.description}</p>
                      {job.requiredLanguages.map(l => <span key={l} style={s.tag}>{l}</span>)}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={s.score(job.matchScore)}>{job.matchScore}% match</div>
                      <button
                        style={{ ...s.btn, marginTop: '10px', fontSize: '13px', opacity: alreadyApplied(job.id) ? 0.5 : 1 }}
                        onClick={() => applyToJob(job.id)}
                        disabled={alreadyApplied(job.id)}
                      >
                        {alreadyApplied(job.id) ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── Applications Tab ── */}
        {tab === 'applications' && (
          <div>
            {applications.length === 0
              ? <p style={{ color: '#888' }}>No applications yet.</p>
              : applications.map(app => (
                <div key={app.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px' }}>{app.job?.title}</h3>
                      <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{app.job?.companyName} · {app.job?.location}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={s.score(app.score)}>{app.score}% match</div>
                      <span style={{ color: '#888', fontSize: '12px' }}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
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