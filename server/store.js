// Simulates what PostgreSQL tables would hold.
// When you add PostgreSQL later, you just swap these out for DB queries.

const store = {
    users: [],       // { id, name, email, passwordHash, role: 'developer'|'company' }
    profiles: [],    // { userId, bio, githubUsername, githubData }
    jobs: [],        // { id, companyId, title, description, requiredLanguages, location, createdAt }
    applications: [] // { id, jobId, developerId, score, status, appliedAt }
  };
  
  // Simple auto-increment IDs
  store.nextId = (collection) => {
    const items = store[collection];
    return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  };
  
  module.exports = store;