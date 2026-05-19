# Core Frontend

This is the frontend application built with [Next.js](https://nextjs.org) for the core analyzer project.

## Project Purpose

The frontend provides the user interface for the TRiNETRA analyzer and communicates with the backend via secured API routes.

### Key pages
- `/analyzer` — upload media, text, or URL input for analysis
- `/analyzer/recents` — view recent analysis results for the authenticated user
- `/analyzer/results/[analysisId]` — display detailed analysis result data
- `/login` — user login
- `/signup` — user registration

## Architecture

- Client-side pages are located in `app/`.
- Shared UI and session logic is in `components/`.
- The sidebar and recents feed load recent analysis data from the backend API.
- Analysis actions do not access the database directly. All data comes from backend API endpoints.

## Backend Integration

This frontend is tightly coupled with the TRiNETRA backend running in the `core` repository.

### Backend APIs used
- `POST /api/uploads` — upload media files
- `POST /api/inputs` — submit text or URL input
- `POST /api/analyze/{uploadId}` — start analysis for the upload
- `GET /api/analysis-results?limit=...` — fetch recent analysis records
- `GET /api/analysis-results/{analysisId}` — fetch a single stored result

### Current behavior implemented
- After successful analysis, the frontend dispatches a browser event `recents:update` to refresh the recents list immediately.
- The sidebar listens for `recents:update` and reloads the top recent items.
- The recents page listens for the same event and reloads its full list.
- The frontend uses `fetch(..., { cache: 'no-store' })` for recent and result calls to avoid stale caching in the browser or proxies.

## Running the Frontend

```bash
cd "C:\Users\Asus\OneDrive\Desktop\Trinetra_frontend"
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Connection to Backend

The frontend expects the backend to be running separately on `http://127.0.0.1:8000` or the configured backend origin.

If you need the backend documentation and architecture, see the core backend README at `../core/README.md`.

### Deployment configuration

`next.config.mjs` proxies `/api/*` to the gateway and core services.

Set these env vars for non-local deployments:

```bash
GATEWAY_BASE_URL=https://your-gateway.example.com
CORE_BASE_URL=https://your-core.example.com
```

## Notes

- The frontend does not directly connect to MongoDB or Redis.
- Recents and result state are loaded through backend APIs only.
- Redis is optional in the backend and is not required for the frontend to function.
