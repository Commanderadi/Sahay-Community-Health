# 🩺 Sahay – Community Health Clinic Directory

A full-stack web app for listing and managing community health clinics.
Built with React, Node.js, Express, and MongoDB.

## Features

- JWT-based authentication (register / login)
- Roles: **NGO** and **Admin**
- Add, view, search, update, and delete clinics
- Search clinics by name or city
- Live backend/database connectivity check on the dashboard

## Tech stack

**Frontend:** React 18 (Create React App), Axios
**Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, express-rate-limit
**Database:** MongoDB (Atlas or local)

## Project structure

```
sahay/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api.js          # shared Axios instance (base URL + auth header)
│   │   ├── App.js
│   │   └── components/
│   └── netlify.toml        # Netlify build config
├── server/                 # Express API
│   ├── index.js
│   ├── routes/             # auth.js, clinic.js
│   ├── models/             # User.js, Clinic.js
│   ├── middleware/auth.js  # JWT verification
│   ├── .env.example
│   └── render.yaml         # Render deploy config
└── package.json            # root dev scripts (runs client + server together)
```

## Local setup

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure the backend

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `PORT` | API port (default `5000`) |
| `ALLOWED_ORIGINS` | Comma-separated browser origins for CORS (optional locally) |

The server **exits on startup** if `MONGO_URI` or `JWT_SECRET` is missing.

### 3. Configure the frontend (optional locally)

The client defaults to `http://localhost:5000`. To point elsewhere, create
`client/.env`:

```
REACT_APP_API_URL=https://your-backend-url
```

### 4. Run

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | – | Register (`email`, `password`, `role`) |
| POST | `/api/auth/login` | – | Login → `{ token, role }` |
| GET | `/api/clinics` | – | List all clinics |
| GET | `/api/clinics/search?query=` | – | Search by name or city |
| POST | `/api/clinics/add` | Bearer | Add a clinic |
| PUT | `/api/clinics/:id` | Bearer | Update a clinic |
| DELETE | `/api/clinics/:id` | Bearer | Delete a clinic |
| GET | `/api/test` | – | Health check |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). Frontend deploys to Netlify, backend to Render,
database on MongoDB Atlas.

## License

MIT
