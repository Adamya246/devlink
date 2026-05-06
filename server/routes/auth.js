const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../store');

const JWT_SECRET = 'devlink_secret_key';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (!['developer', 'company'].includes(role)) {
    return res.status(400).json({ error: 'Role must be developer or company' });
  }

  const exists = store.users.find(u => u.email === email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: store.nextId('users'),
    name, email, passwordHash, role
  };

  store.users.push(user);

  // Create empty profile for developers
  if (role === 'developer') {
    store.profiles.push({ userId: user.id, bio: '', githubUsername: '', githubData: null });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user: { id: user.id, name, email, role } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = store.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

module.exports = router;