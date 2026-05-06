const router = require('express').Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const store = require('../store');

// Fetch GitHub data and store on developer profile
// POST /api/github/connect
router.post('/connect', authMiddleware, async (req, res) => {
  const { githubUsername } = req.body;

  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Only developers can connect GitHub' });
  }

  try {
    const headers = { 'User-Agent': 'DevLink-App' };

    // 1. Basic user info
    const { data: ghUser } = await axios.get(
      `https://api.github.com/users/${githubUsername}`, { headers }
    );

    // 2. Repos (up to 100, sorted by latest push)
    const { data: repos } = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=pushed`, { headers }
    );

    // 3. Aggregate languages across all repos
    const languageCount = {};
    for (const repo of repos.slice(0, 20)) { // check top 20 repos only (API rate limit friendly)
      try {
        const { data: langs } = await axios.get(repo.languages_url, { headers });
        Object.keys(langs).forEach(lang => {
          languageCount[lang] = (languageCount[lang] || 0) + langs[lang];
        });
      } catch {
        // skip repos that fail
      }
    }

    // Sort languages by bytes of code, return top 8
    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([lang]) => lang);

    const githubData = {
      username: githubUsername,
      name: ghUser.name,
      avatar: ghUser.avatar_url,
      bio: ghUser.bio,
      repoCount: ghUser.public_repos,
      followers: ghUser.followers,
      languages: topLanguages,
      lastActive: repos[0]?.pushed_at || ghUser.updated_at // most recent push
    };

    // Save to profile
    const profile = store.profiles.find(p => p.userId === req.user.id);
    if (profile) {
      profile.githubUsername = githubUsername;
      profile.githubData = githubData;
    }

    res.json({ githubData });

  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

// GET /api/github/profile  — get current developer's profile
router.get('/profile', authMiddleware, (req, res) => {
  const profile = store.profiles.find(p => p.userId === req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

module.exports = router;