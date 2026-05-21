![GitHub stars](https://img.shields.io/github/stars/Adamya246/devlink?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/Adamya246/devlink?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/Adamya246/devlink?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/Adamya246/devlink?style=for-the-badge)

# 🚀 DevLink

AI-powered developer hiring and job matching platform built with React, Node.js, Express, JWT authentication, and GitHub API integration.

DevLink helps companies discover developers based on real GitHub activity, programming languages, and project experience using a custom matching algorithm.

---

# ✨ Features

## 👨‍💻 Developer Features
- Register and login authentication
- Connect GitHub profile
- Automatic GitHub repository analysis
- Programming language extraction
- Personalized job match scoring
- Apply to jobs
- Track submitted applications

## 🏢 Company Features
- Register and login authentication
- Post developer jobs
- Define required technologies/languages
- View ranked developer candidates
- Automatic compatibility scoring
- Manage and delete job postings

---

# 🧠 Matching Algorithm

DevLink includes a custom developer-job ranking algorithm.

Each developer is scored against a job using:

| Signal | Weight |
|---|---|
| Language overlap | 50% |
| Repository/project count | 30% |
| GitHub activity recency | 20% |

### Example
If a company posts:
```text
JavaScript, React, Node.js
```

And a developer’s GitHub profile shows:
- JavaScript projects
- React repositories
- Recent commits
- High repo count

The system generates a high compatibility score automatically.

---

# 🌐 Live Demo

🚀 Live Application:  
https://devlink-taupe-five.vercel.app/login



# 🛠 Tech Stack

## Frontend
- React
- React Router DOM
- Axios
- Context API

## Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- GitHub REST API

## Data Storage
- In-memory storage (upgradeable to PostgreSQL or MongoDB)

---

# ⚙️ System Architecture

## Authentication Flow
1. User registers or logs in
2. JWT token is generated
3. Token stored in localStorage
4. Protected routes verify token
5. Backend middleware authenticates requests

---

## GitHub Integration Flow
1. Developer enters GitHub username
2. Backend fetches:
   - user profile
   - repositories
   - repository languages
3. Languages are aggregated
4. Developer profile is enriched automatically

---

## Job Matching Flow
1. Company posts a job
2. Required languages are stored
3. Matching algorithm compares:
   - developer languages
   - activity
   - repository count
4. Match percentage is generated
5. Candidates/jobs are ranked automatically

---

# 📁 Project Structure

```bash
devlink/
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── github.js
│   │   ├── jobs.js
│   │   └── match.js
│   ├── store.js
│   └── index.js
│
└── client/
    └── src/
        ├── components/
        ├── context/
        ├── api.js
        └── App.jsx
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/Adamya246/devlink.git
cd devlink
```

---

# 🔧 Backend Setup

```bash
cd server
npm install
node index.js
```

Backend runs on:
```text
http://localhost:5000
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm start
```

Frontend runs on:
```text
http://localhost:3000
```

---

# 📌 API Routes

## Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

## GitHub
- `POST /api/github/connect`
- `GET /api/github/profile`

## Jobs
- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/mine`
- `DELETE /api/jobs/:id`

## Matching
- `GET /api/match/jobs`
- `GET /api/match/candidates/:jobId`
- `POST /api/match/apply/:jobId`
- `GET /api/match/applications`

---

# 🔮 Future Improvements

- PostgreSQL integration
- OAuth GitHub authentication
- Resume upload and parsing
- Real-time chat system
- AI-powered recommendations
- Docker deployment
- Email notifications
- Advanced analytics dashboard

---

# 📷 Demo Workflow

## Developer
1. Register as developer
2. Connect GitHub profile
3. Browse ranked jobs
4. Apply to jobs

## Company
1. Register as company
2. Post jobs
3. View ranked candidates
4. Review developer profiles

---

# 🔐 Security

- Password hashing using bcryptjs
- JWT-based authentication
- Protected API routes
- Role-based authorization

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed by Adamya.
