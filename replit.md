# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Puppy fan café website for a dog named Coco (코코).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (white-label)
- **Frontend**: React + Vite (Tailwind CSS, Wouter, TanStack Query)

## Artifacts

### `artifacts/puppy-fan-cafe` — 코코 팬카페 (root /)
Main fan café website with:
- Home/landing page with hero image and stats
- User community board (posts, comments, likes)
- Coco's life timeline (photo/video events)
- Owner introduction page
- User profile page
- Clerk authentication (sign-in / sign-up)

### `artifacts/api-server` — API Server (/api)
Express backend serving all API routes:
- `/api/posts` — community posts CRUD + likes
- `/api/posts/:id/comments` — comments CRUD
- `/api/timeline` — life timeline events
- `/api/profile` — owner/dog profile
- `/api/stats` — community stats

## DB Schema (lib/db/src/schema/)
- `posts` — community posts
- `comments` — post comments
- `likes` — post likes (unique per user per post)
- `timeline_events` — dog life timeline

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
