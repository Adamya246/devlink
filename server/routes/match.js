const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const store = require('../store');

// ── The Matching Algorithm ──
// Scores a developer against a job posting on 3 signals:
//   1. Language overlap  (weight: 50%) — how many required langs the dev knows
//   2. Project count     (weight: 30%) — more public repos = higher score (capped at 15)
//   3. Activity recency  (weight: 20%) — how recently they pushed code (0 after 12 months)

function scoreMatch(developer, job) {
  const githubData = developer.githubData;
  if (!githubData) return 0;

  const devLanguages = githubData.languages.map(l => l.toLowerCase());
  const jobLanguages = (job.requiredLanguages || []).map(l => l.toLowerCase());

  // 1. Language overlap
  const matched = jobLanguages.filter(l => devLanguages.includes(l)).length;
  const languageScore = jobLanguages.length > 0 ? matched / jobLanguages.length : 0;

  // 2. Project count (15 repos = full score)
  const projectScore = Math.min(githubData.repoCount / 15, 1);

  // 3. Activity recency
  const lastActive = new Date(githubData.lastActive || 0);
  const monthsAgo = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const activityScore = Math.max(0, 1 - monthsAgo / 12);

  const total = (languageScore * 0.5) + (projectScore * 0.3) + (activityScore * 0.2);
  return Math.round(total * 100); // return as 0-100
}

// GET /api/match/jobs  — developer sees ranked job list
router.get('/jobs', authMiddleware, (req, res) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Developers only' });
  }

  const profile = store.profiles.find(p => p.userId === req.user.id);
  if (!profile?.githubData) {
    return res.status(400).json({ error: 'Connect your GitHub first' });
  }

  const scoredJobs = store.jobs.map(job => ({
    ...job,
    matchScore: scoreMatch(profile, job)
  }));

  // Sort by score descending
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  res.json(scoredJobs);
});

// GET /api/match/candidates/:jobId  — company sees ranked developer list for a job
router.get('/candidates/:jobId', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ error: 'Companies only' });
  }

  const job = store.jobs.find(j => j.id === parseInt(req.params.jobId));
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.companyId !== parseInt(req.user.id)) return res.status(403).json({ error: 'Not your job' });

  const developers = store.users.filter(u => u.role === 'developer');

  const candidates = developers.map(dev => {
    const profile = store.profiles.find(p => p.userId === dev.id);
    return {
      id: dev.id,
      name: dev.name,
      email: dev.email,
      githubData: profile?.githubData || null,
      matchScore: scoreMatch(profile || {}, job)
    };
  }).filter(c => c.githubData); // only show devs who connected GitHub

  candidates.sort((a, b) => b.matchScore - a.matchScore);
  res.json(candidates);
});

// POST /api/match/apply/:jobId  — developer applies to a job
router.post('/apply/:jobId', authMiddleware, (req, res) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Developers only' });
  }

  const jobId = parseInt(req.params.jobId);
  const alreadyApplied = store.applications.find(
    a => a.jobId === jobId && a.developerId === req.user.id
  );

  if (alreadyApplied) return res.status(409).json({ error: 'Already applied' });

  const job = store.jobs.find(j => j.id === jobId);
  const profile = store.profiles.find(p => p.userId === req.user.id);

  const application = {
    id: store.nextId('applications'),
    jobId,
    developerId: req.user.id,
    score: scoreMatch(profile || {}, job),
    status: 'pending',
    appliedAt: new Date().toISOString()
  };

  store.applications.push(application);
  res.status(201).json(application);
});

// GET /api/match/applications  — developer sees their applications
router.get('/applications', authMiddleware, (req, res) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Developers only' });
  }

  const apps = store.applications
    .filter(a => a.developerId === req.user.id)
    .map(a => ({
      ...a,
      job: store.jobs.find(j => j.id === a.jobId)
    }));

  res.json(apps);
});

module.exports = router;