const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const store = require('../store');

// POST /api/jobs  — company posts a job
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ error: 'Only companies can post jobs' });
  }

  const { title, description, requiredLanguages, location } = req.body;
  if (!title || !requiredLanguages) {
    return res.status(400).json({ error: 'Title and required languages are needed' });
  }

  const job = {
    id: store.nextId('jobs'),
    companyId: req.user.id,
    companyName: store.users.find(u => u.id === req.user.id)?.name,
    title,
    description,
    requiredLanguages, // array e.g. ['JavaScript', 'Python']
    location: location || 'Remote',
    createdAt: new Date().toISOString()
  };

  store.jobs.push(job);
  res.status(201).json(job);
});

// GET /api/jobs  — all developers can see all jobs
router.get('/', authMiddleware, (req, res) => {
  res.json(store.jobs);
});

// GET /api/jobs/mine  — company sees their own postings
router.get('/mine', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ error: 'Companies only' });
  }
  const myJobs = store.jobs.filter(j => j.companyId === req.user.id);
  res.json(myJobs);
});

// DELETE /api/jobs/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = store.jobs.find(j => j.id === jobId);

  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.companyId !== req.user.id) return res.status(403).json({ error: 'Not your job' });

  store.jobs = store.jobs.filter(j => j.id !== jobId);
  res.json({ message: 'Job deleted' });
});

module.exports = router;