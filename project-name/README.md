# Reddit HTTP API

This backend runs as a single Nest application at `http://localhost:3001`.
Feature modules call each other directly through dependency injection. The
existing HTTP routes, authentication, DTOs, repositories, PostgreSQL access,
and Redis helpers remain available as a starting point for a future split
into HTTP services.

## Development

From the repository root:

```sh
npm ci --prefix project-name
npm --prefix project-name run start:dev
```

Run the Next.js frontend separately with `npm run dev`. Use the same hostname
for the frontend and backend so session cookies work.

## Structure

- `apps/project-name/src/`: application module, HTTP bootstrap, CORS, and input validation.
- `apps/<service>/src/`: feature controllers, local services, DTOs, repositories,
  and unit tests for posts, comments, communities, membership, bans, users,
  rate limiting, and Redis.
- `apps/api-gateway/`: separate gateway scaffold for future development.
- `lib/`: shared authentication, database, Redis, environment, and request helpers.
- `apps/project-name/test/`: HTTP integration tests with mocked PostgreSQL, Redis, and sessions.

## Configuration

The backend reads `project-name/.env.local`, then `project-name/.env`, then the
root `.env.local`. Existing process environment variables take precedence.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/reddit
BETTER_AUTH_SECRET=YOUR_EXISTING_SHARED_SECRET
BETTER_AUTH_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
API_PORT=3001
FRONTEND_URL=http://localhost:3000
```

The frontend uses `NEXT_PUBLIC_API_URL=http://localhost:3001` and
`API_URL=http://localhost:3001`. Keep the existing Google, GitHub, Resend, and
UploadThing settings. Authentication and upload routes remain in Next.js.

## Checks and production

```sh
npm --prefix project-name run build
npm --prefix project-name run typecheck
npm --prefix project-name test -- --runInBand
npm --prefix project-name run test:e2e -- --runInBand
npm --prefix project-name run start:prod
```

The production entry point is `project-name/dist/apps/project-name/main.js`. Deploy the compiled
`dist` tree with the backend package manifest and production dependencies.
