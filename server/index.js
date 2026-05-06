const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/match', require('./routes/match'));

app.get('/', (req, res) => res.json({ message: 'DevLink API running ✅' }));

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ DevLink server on http://localhost:${PORT}`));