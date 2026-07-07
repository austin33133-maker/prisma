# Dazi — activity buddy app (client)

Cross-platform mobile client (iOS / Android / Web) built with Expo SDK 57, React Native and expo-router. English-first UI for international release.

Phase 1 (activity-buddy MVP) screens are implemented against an in-memory mock store (`src/lib/store.tsx`); replacing it with a real API client is the next step. See `docs/momo-chat/CURSOR_DEV_GUIDE.md` at the repo root for the full product spec, roadmap and backend data model.

## Screens

- **Onboarding** — Apple / Google / email sign-in (mocked)
- **Explore** — nearby activities feed with category filter
- **Activity detail** — info, host, members, join → auto-creates group chat
- **Create** — post a new activity (category, time, place, group size)
- **Chats** — direct + group threads
- **Chat room** — bubbles, group sender names, mock auto-replies
- **Profile** — stats, interests, settings menu, sign out

Dark mode is supported throughout via `src/lib/theme.ts`.

## Run

```sh
npm install
npm start        # Expo dev server (scan QR with Expo Go)
npm run web      # run in browser
npx tsc --noEmit # typecheck
```

## Structure

```
src/app/          expo-router routes (file-based navigation)
src/components/   shared UI (Avatar)
src/lib/          theme, types, mock data, store, formatting
```
