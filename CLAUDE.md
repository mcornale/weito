# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000 (uses default Firebase project)
npm run build        # Build for staging
npm run build:production  # Build for production
npm run lint         # Check formatting (prettier) and lint (eslint)
npm run lint:fix     # Auto-fix eslint issues
npm run format       # Auto-format with prettier
npm run check        # Svelte type checking
npm run check:watch  # Svelte type checking in watch mode
```

There is no test runner configured.

## Environment Variables

Firebase config is loaded from `VITE_FIREBASE_*` env vars (see `src/lib/firebase.ts`). Create a `.env` file with the Firebase project credentials before running.

## Architecture

**Stack**: SvelteKit (static adapter, SPA mode) + Svelte 5 + TypeScript + Firebase + TanStack Query + Valibot

### Route Structure

- `src/routes/+layout.svelte` — Root layout
- `src/routes/login/` — Public login page (Google sign-in)
- `src/routes/(app)/` — Auth-protected routes; `+layout.ts` redirects unauthenticated users to `/login` and initializes a `QueryClient`
- `src/routes/(app)/+page.svelte` — Home/programs overview
- `src/routes/(app)/[routineId]/+page.svelte` — Routine detail (exercises list)

### Entity Organization

Each domain entity lives under `src/lib/entities/<entity>/` and follows a consistent structure:
- `types.ts` — TypeScript type definitions
- `schema.ts` — Valibot validation schemas with parse functions
- `queries.ts` — TanStack Query `queryOptions` wrappers over Firestore reads
- `mutations.ts` — Firestore write operations
- `components/` — Entity-specific Svelte components

Entities: `programs`, `routines`, `exercises`, `logs`

### Firestore Data Model

```
users/{uid}/programs/{programId}/routines/{routineId}/exercises/{exerciseId}
users/{uid}/programs/{programId}/routines/{routineId}/logs/{logId}
```

### Key Patterns

**Auth**: `src/lib/features/auth.ts` — Google sign-in via Firebase. Use `requireCurrentUser()` (throws if unauthenticated) in mutations/queries, `getCurrentUser()` (async, listens to auth state) in loaders.

**TanStack Query**: Configured with `staleTime: Infinity` and `gcTime: Infinity` — data never goes stale automatically. Mutations must manually invalidate or update the cache.

**Validation**: All Firestore reads are parsed through Valibot schemas (e.g., `parseExercise()`). Add a schema whenever adding a new entity or field.

**Portals**: `src/lib/attachments.ts` exports `portalToAppHeader` and `portalToMainTop` — Svelte attachments that teleport DOM elements into fixed UI slots (`#app-header` and `#main-top` in the app layout). Use these to render page-specific headers/actions from child routes.

**Svelte Attachments**: The codebase uses Svelte 5's `{@attach ...}` syntax for reusable DOM behaviors (portals, swipe gestures). See `src/lib/attachments.ts`.

**Svelte 5 Runes**: All components use `$props()`, `$state()`, `$derived()`, `$effect()`. Do not use Svelte 4 syntax.

**Notifier**: Error toasts are shown via `getNotifierContext()` from `src/lib/features/notifier/context.ts`. Call `notifyError(message)` inside components to surface errors to the user.
