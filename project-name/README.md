# Reddit API

This Nest application owns community, membership, moderation, post, comment, vote,
and profile data. Its imports and compiled output stay inside `project-name`.
Next.js serves the UI, Better Auth routes, and uploads. Existing Next form actions
are HTTP adapters: they forward the session cookie to Nest and refresh or redirect
the UI after a successful response. They do not query the application database.

## Development

From the repository root, run these in separate terminals:

```sh
npm run dev
npm --prefix project-name run start:dev
```

The UI defaults to `http://localhost:3000`, and Nest defaults to
`http://localhost:3001`. Restart any Nest watcher started before the folders moved.
Use the same hostname for both applications so the browser sends the session cookie.

Install backend dependencies with `npm ci --prefix project-name`.

## Configuration

Next reads the root `.env.local`. Nest first reads `project-name/.env.local`, then
`project-name/.env`, and falls back to the root `.env.local` for the existing local
setup. Environment variables already set by the process take precedence.

```dotenv
# Both applications: same database, secret, and public auth URL
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/reddit
BETTER_AUTH_SECRET=YOUR_EXISTING_SHARED_SECRET
BETTER_AUTH_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001
# Optional internal address for requests from Next's server
API_URL=http://localhost:3001

# Nest
API_PORT=3001
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

Keep the existing Google, GitHub, Resend, and UploadThing settings in the root
configuration. The backend uses the same Better Auth configuration to validate
sessions, without Next's cookie plugin. No database migrations are required by this
move. PostgreSQL and Redis must be running; Redis backs post rate limits and views.
Personalized post pages are fetched fresh to avoid mixing users' votes or cursors.

## Validation and production

```sh
npm --prefix project-name run build
npm --prefix project-name test -- --runInBand
npm --prefix project-name run test:e2e -- --runInBand
npm --prefix project-name run start:prod
```

The compiled backend entry point is `project-name/dist/src/main.js`. Node 24 is
recommended to match this workspace and its installed ESM dependencies. Endpoint
tests exercise the complete Nest module graph with mocked database, Redis, and
session boundaries; they do not modify real application data.

## API routes used by Next

- Communities: `GET/POST /communities`, `GET /communities/:id`, membership status,
  and existing join/leave routes.
- Members: `/communities/:id/members` for the owner's member list, role lookup,
  member removal, and moderator promotion/demotion.
- Bans: `GET/PUT/DELETE /communities/:id/bans/:userId`.
- Posts: feed, community pagination, post detail/creation/editing, likes, deletion,
  and `PATCH/DELETE /posts/:id/pin`.
- Comments: `GET/POST /comments/post/:postId`, comment likes, and deletion.
- Profiles: `GET/PATCH /users/:id` and `PATCH /users/:id/display-name`.

Nest derives the acting user from the authenticated cookie. Owner operations,
author edits, profile updates, and ban permissions are checked in the backend.
Community, post, and comment IDs are validated as UUIDs before SQL queries.
