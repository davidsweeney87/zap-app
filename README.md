# Zap — ADHD Brain Trainer

A warm, mobile-first PWA for ADHD-friendly routines, habits, focus sprints, reminders, and chat with **Spark**, your AI copilot.

## Setup

```bash
npm install
cp .env.example .env   # then edit .env and paste your Anthropic API key
```

The chat uses a Vercel serverless function (`api/chat.js`) that holds the key server-side, so local dev needs the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Open the URL printed by `vercel dev` (usually http://localhost:3000). `npm run dev` still works for everything except chat (no serverless runtime).

## Deploy

Push to GitHub. On Vercel, import the repo and add `ANTHROPIC_API_KEY` as an environment variable. Every push to `main` redeploys.

## Build

```bash
npm run build
npm run preview
```

## Notes

- The Anthropic key lives only on the server (`ANTHROPIC_API_KEY`). The browser calls `/api/chat`, which proxies to Anthropic — the key is never shipped to the client.
- All UI state is saved to `localStorage`.
- Service worker caches the shell for offline use; chat still requires network.
