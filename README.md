# CSSB Quest Enhanced

Mobile-first browser game for teaching MDMP, staff synchronization, staff-section roles, and CSSB sustainment math.

## Play

GitHub Pages build target:

`https://bergetson.github.io/cssb-quest-enhanced/`

## What Is In The Game

- 10 mission campaign from receipt of mission through final MDMP qualification.
- S1, S2, S3, S4, S6, SPO, XO, CSM, and commander teaching moments.
- Commodity calculators and quizzes for Class I, water, fuel, ammunition, PACE, LOGSTAT, COA comparison, FRAGORDs, and OPORDs.
- Difficulty-weighted scoring, perfect-mission badges, mini-games, achievements, store items, and Easter eggs.
- Leaderboard screen with static/offline fallback plus shared API support.

## Shared Leaderboard API

The app automatically uses `/api/leaderboard` when hosted with the included Node server. Static hosts such as GitHub Pages cannot receive player score submissions by themselves, so the board saves locally there and will sync if `VITE_LEADERBOARD_API_URL` points at a deployed API.

Server endpoints:

- `GET /api/leaderboard`
- `POST /api/leaderboard`

Persistent file path defaults to `data/leaderboard.json` and can be changed with `CSSB_LEADERBOARD_FILE`.

## Local Development

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run check
pnpm run build:static
```
