# Sahay – Community Health Clinic Directory

Context for Claude Code. MERN app: React 18 (CRA 5) + Express + Mongoose + MongoDB Atlas.
A shared directory of community health clinics, kept current by NGO field teams.

## Run it locally

```bash
cd server && npm install && cd ../client && npm install && cd ..
cd server && npm start     # -> :5000, needs server/.env, connects to Atlas
cd client && npm start     # -> :3000  (BROWSER=none to skip auto-open)
```

Root `npm run dev` runs both together. Node 24, npm 11.

### server/.env (NOT in git — gitignored)

Holds the real Atlas password + JWT secret. Recreate from `server/.env.example`:
`MONGO_URI`, `JWT_SECRET`, `PORT=5000`, `ALLOWED_ORIGINS`. The server **exits on
startup** if `MONGO_URI` or `JWT_SECRET` is missing. Never commit it; never print
the real Atlas password. `.gitignore` has `!.env.example` so templates stay tracked.

New machine also needs its IP added to Atlas **Network Access** allowlist.

`client/.env` is optional locally (defaults to `http://localhost:5000`).

## Working across machines

- Before starting: `git pull origin main`
- Before switching machines: commit + `git push origin main` (don't leave work uncommitted)
- Remote: github.com/Commanderadi/Sahay-Community-Health
- Commit trailer: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
- PR body trailer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

## Architecture

### Frontend (`client/src`)

- **Tailwind v3.4** (`tailwind.config.js` + `postcss.config.js` + `@tailwind` in `index.css`),
  `darkMode: 'class'`, custom `brand` emerald/teal scale. Dark class set pre-paint by an
  inline script in `public/index.html` from `localStorage.theme` / `prefers-color-scheme`.
- **framer-motion v11** for all animation. **lucide-react** icons.
- **Intro flow** (`App.js`): state machine `landing -> splash -> app`, gated by
  `sessionStorage.introSeen`. Skipped entirely if a session is already stored.
  Shown once per browser session.
  - `Landing.js` — self-drawing `BrandMark` logo, headline words sequencing in
    (blur-to-sharp), staggered feature cards, "a community initiative" framing.
  - `Splash.js` — ~1.6s branded boot screen with a progress sweep.
  - `AuroraBackground.js` — drifting mesh-gradient blobs + floating health-cross
    motes; sits behind Landing (`dense`) and AuthScreen.
  - `BrandMark.js` — shield + cross SVG; `draw` prop runs the stroke animation.
- **Auth**: `context/AuthContext.js`. Token decoded client-side (no verify) via
  `lib/token.js`; `exp` claim schedules auto-logout. `api.js` response interceptor
  dispatches `auth:unauthorized` on 401 -> logout. Login response is
  `{ token, role, email }`; JWT payload carries `userId`, `role`, `email`.
- **Toasts**: `context/ToastContext.js` -> `components/Toaster.js` (portal).
- **UI primitives**: `components/ui/` — Button, Field (Input/Select), Modal,
  ConfirmDialog (`useConfirm()` -> Promise<boolean>).
- **Dashboard** (`components/Dashboard.js`): grid/map toggle, debounced search,
  city + sort + "only mine" filters, CSV export. Entrance animation: header slides
  down, main fades up, cards cascade with a capped stagger (`index * 0.05`, max 8).
  - `ClinicCard.js` — opens the detail panel (no inline edit).
  - `ClinicDetail.js` — right-side slide-in panel, full record + OpenStreetMap link.
  - `ClinicFormModal.js` — combined add/edit, all fields.
  - `MapView.js` — Leaflet + OpenStreetMap. **react-leaflet v4 is ESM-only**;
    CRA Jest can't transform it and the Jest config is locked, so it is
    `lazy()`-loaded + `<Suspense>`, and `jest.mock`ed in `App.test.js`.
    Keep the `const MapView = lazy(...)` line BELOW all imports (eslint import/first).
  - `AdminPanel.js` — Admin-only user management modal.
- **Hooks**: `useClinics.js` (fetch/filter/sort + ownership-aware `canManage()`),
  `useDebounced.js`.
- **CSV**: `lib/csv.js` — Blob + BOM + programmatic `<a download>` click.

### Backend (`server`)

- `index.js` — Helmet, CORS (`ALLOWED_ORIGINS`), rate-limit. Sets DNS resolvers
  (8.8.8.8 / 1.1.1.1) as a `mongodb+srv` lookup fallback. Standalone scripts that
  don't load `index.js` need that DNS prefix themselves.
- **Models**: `User.js` (email, bcrypt password, role). `Clinic.js` — name, city,
  contact (required); address, services[], hours, notes, lat, lng; `addedBy`,
  `owner` (ObjectId, nullable), `ownerEmail`; timestamps.
- **Ownership model**: edit/delete a clinic if Admin OR its `owner` OR it's legacy
  (no `owner`). Enforced by `middleware/ownsClinic.js` (runs after `verifyToken`,
  sets `req.clinic`). `middleware/requireAdmin.js` gates admin routes.
- **Routes**:
  - `routes/auth.js` — register, login (JWT with userId/role/email).
  - `routes/clinic.js` — `sanitizeBody` whitelist on writes. `POST /add`
    (verifyToken, sets owner/ownerEmail), `GET /`, `GET /search`,
    `GET /:id` (public), `PUT/DELETE /:id` (verifyToken + ownsClinic).
  - `routes/users.js` — `verifyToken + requireAdmin`. List users w/ clinic counts,
    `PUT /:id/role`, `DELETE /:id`. Self role-change / self-delete return 400;
    deleting a user orphans their clinics to ownerless.

## Roles / accounts

- Roles: `NGO`, `Admin`.
- Admins: `adityasingh3499@gmail.com`,
  `gautam.21scse1011533@galgotiasuniversity.edu.in`.
- Promote via a standalone DB script (remember the DNS prefix).

## Checks before committing

```bash
cd client && CI=true npm run build && CI=true npm test
```
Build should stay ~115 kB main + a ~45 kB lazy leaflet chunk. 3 tests in `App.test.js`.

## Deployment (deferred — not blocking local work)

Frontend -> Netlify, backend -> Render, DB -> Atlas. See `DEPLOYMENT.md`.
- Render env: `MONGO_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS` — then redeploy.
- Netlify env: `REACT_APP_API_URL` = the Render URL; remove any old
  `MONGO_URI` / `JWT_SECRET` from Netlify — then redeploy.

## Outstanding work

From the "Polish & PWA" batch, still to do:
- Installable PWA + offline cache (service worker / manifest)
- Pagination or infinite scroll on the clinic list
- Favorites
- Error boundaries

Done already: CSV export, clinic detail view, map, roles/ownership, admin panel,
cinematic intro flow.
