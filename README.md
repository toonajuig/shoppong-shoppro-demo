# Shoppong Shoppro Demo

Presentation-only copy of the original Shoppong Shoppro viewer UI.

## What is copied

The demo reuses the original React view structure and styling for:

- Dashboard
- Page and project navigation
- Project switcher
- Content, characters, and calendar tabs
- Story and scene detail views
- Content and studio modal layouts

## What is disabled

- The content layer uses sample data instead of reading the original repository.
- API calls are replaced with local no-op responses.
- Facebook publishing and scheduling are simulated only.
- Google Flow, browser automation, filesystem writes, uploads, and credentials are disabled.
- State is kept in memory for the current tab and is not persisted.

The `DEMO ONLY` label in the top bar is intentional. This build is safe to deploy as a public presentation demo, while the original repository can remain private.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
```

## Deploy to Vercel

Import this folder as a Vite project. Use the default settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
