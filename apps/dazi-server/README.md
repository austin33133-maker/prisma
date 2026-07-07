# Dazi API server

REST API for the Dazi activity-buddy app. Express + Prisma + SQLite (swap to PostgreSQL when scale demands — see DEPLOY.md).

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | Liveness check |
| POST | `/auth/register` | – | Create user, returns bearer token |
| GET | `/me` | ✓ | Current user |
| GET | `/activities?category=` | ✓ | List activities (newest first) |
| POST | `/activities` | ✓ | Create activity (auto-joins host, creates group thread) |
| GET | `/activities/:id` | ✓ | Activity detail with members and thread id |
| POST | `/activities/:id/join` | ✓ | Join (409 when full), returns group thread id |
| GET | `/threads` | ✓ | My threads with last message |
| GET | `/threads/:id` | ✓ | Thread with full message history (participants only) |
| POST | `/threads/:id/messages` | ✓ | Send message (participants only) |

Auth: `Authorization: Bearer <token>` from `/auth/register`. Registration is intentionally password-less for the MVP demo; wire up Google/Apple OAuth before public launch.

## Develop

```sh
npm install
cp .env.example .env
npm run db:push   # create/update SQLite schema
npm run dev       # tsx watch on :3000
```

## Deploy

`docker compose up -d --build` — full walkthrough in [DEPLOY.md](./DEPLOY.md) (Chinese).
