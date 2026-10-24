# Reddit Nest applications

This Nest workspace runs an API gateway and two domain applications:
`community-service` and `content-service`. Community and content features are
grouped into those applications, with user/profile endpoints included in the
content application. The gateway is the default Nest project.

## Development

From the repository root:

```sh
npm ci --prefix project-name
npm --prefix project-name run start:dev
```

Start the gateway and the two domain applications in separate terminals:

```sh
npm --prefix project-name run start:dev
npm --prefix project-name run start:community:dev
npm --prefix project-name run start:content:dev
```

Run the Next.js frontend separately with `npm run dev`.

The API gateway listens on port `4000` by default. Set
`NEXT_PUBLIC_API_URL=http://localhost:4000` in the frontend's `.env.local` to
route browser and server-side API requests, including Better Auth, through the
gateway. The gateway forwards Better Auth requests to the Next.js auth route;
set `NEXT_AUTH_URL` to the internal Next.js origin when it is not
`http://localhost:3000`. Configure `API_GATEWAY_PORT` to change the gateway
port. The community and content applications default to ports `3003` and
`3005`; configure `COMMUNITY_SERVICE_PORT`,
`CONTENT_SERVICE_PORT`, `COMMUNITY_SERVICE_URL`, and `CONTENT_SERVICE_URL` when
those defaults do not fit your environment.

## Structure

- `apps/api-gateway/src/`: gateway HTTP bootstrap and API proxy controllers.
- `apps/community-service/src/`: bootstrap that composes the communities,
  membership, and bans feature modules.
- `apps/content-service/src/`: bootstrap that composes posts, comments,
  profiles, rate limiting, and Redis-backed view-count modules.
- `apps/communities-service/`, `apps/community-members/`, `apps/bans-service/`,
  `apps/post-service/`, `apps/comments-service/`, and `apps/user-service/`:
  feature modules and their tests; these are no longer independent Nest apps.
- `lib/`: shared authentication, database, Redis, environment, and request helpers.

The gateway forwards community, member, and ban routes to `community-service`;
post, comment, and profile routes go to `content-service`. Rate limiting and
Redis view counts are shared infrastructure modules used by the content app,
not standalone applications. `reputation-worker` and `outbox-worker` remain
configuration placeholders only.

## Configuration

Both domain applications currently use the shared `DATABASE_URL` and
`REDIS_URL` from the backend package environment configuration. This setup
allows regular SQL joins and transactions across the grouped features, but it
is still one shared database, not one database per domain. Existing process
environment variables take precedence over values loaded from env files.

Each domain application's root module imports the global `DatabaseModule` once.
Services and repositories inject `DATABASE_POOL` and import the `DatabasePool`
type from `lib/database/database.module.ts`. Feature modules do not import
`DatabaseModule`. The provider uses the shared pool from `lib/db.ts`, so services,
repositories, backend Better Auth, and legacy database helpers use the same pool
within each process. The pool closes on application shutdown.

`DB_POOL_MAX` caps the shared pool's connections per process (default: `10`, must
be a positive integer). Idle connections close after 30 seconds, and acquiring a
connection times out after 5 seconds. All services use the same `DATABASE_URL`.
Separate application processes and replicas each have their own pool connected
to that database, so budget the total across processes.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/reddit
DB_POOL_MAX=10
BETTER_AUTH_SECRET=YOUR_EXISTING_SHARED_SECRET
BETTER_AUTH_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
COMMUNITY_SERVICE_PORT=3003
CONTENT_SERVICE_PORT=3005
COMMUNITY_SERVICE_URL=http://localhost:3003
CONTENT_SERVICE_URL=http://localhost:3005
API_GATEWAY_PORT=4000
FRONTEND_URL=http://localhost:3000
```

Keep the existing Google, GitHub, Resend, and UploadThing settings. Better Auth
is implemented by the Next.js route and reached through the API gateway proxy.

## Checks and production

```sh
npm --prefix project-name run build
npm --prefix project-name run typecheck
npm --prefix project-name test -- --runInBand
npm --prefix project-name run test:e2e -- --runInBand
npm --prefix project-name run test:cov -- --runInBand
npm --prefix project-name run start:prod
```

## Testing

Tests live beside the application code in each app's `src/` directory:

- `*.service.spec.ts` tests service business rules. Repository, database,
  Redis, and neighboring-service dependencies are mocked so the test stays
  isolated and does not need running infrastructure.
- `*.controller.spec.ts` tests that HTTP controller methods pass route/body
  values and the authenticated user to the right service method. Calling a
  controller method directly does not execute Nest guards or pipes.
- `apps/api-gateway/test/app.e2e-spec.ts` starts a Nest HTTP app and calls its
  root route with Supertest. The auth and outbound HTTP modules are mocked so
  this smoke test doesn't require Better Auth or the downstream apps.
- `test/setup.ts` applies the common Better Auth mock to unit tests to avoid
  loading its ESM runtime during unrelated tests.

Run all unit tests, one spec, the HTTP smoke test, or coverage from the
repository root:

```sh
npm --prefix project-name test -- --runInBand
npm --prefix project-name test -- --runInBand apps/post-service/src/post-service.service.spec.ts
npm --prefix project-name run test:e2e -- --runInBand
npm --prefix project-name run test:cov -- --runInBand
```

Use `npm --prefix project-name run test:watch` while iterating. A unit spec
arranges mock return values, invokes one service/controller behavior, then
asserts the result and dependency calls; this keeps the test deterministic and
fast without a real database or Redis server.

Build all three applications with:

```sh
cd project-name
npx nest build api-gateway
npx nest build community-service
npx nest build content-service
```

Production entry points are in `dist/apps/api-gateway`, `dist/apps/community-service`,
and `dist/apps/content-service`. Start the gateway with the package's `start:prod` script; start the domain apps
with `npm --prefix project-name run start:community:prod` and
`npm --prefix project-name run start:content:prod`.
