# Zap — ADHD Brain Trainer

A warm, mobile-first PWA for ADHD-friendly routines, habits, focus sprints, reminders, and chat with **Spark**, your AI copilot.

## Setup

```bash
npm install
cp .env.example .env   # then edit .env and paste your Anthropic API key
npm run dev
```

Open http://localhost:5173 on your phone (same Wi-Fi) or desktop.

## Build

```bash
npm run build
npm run preview
```

## Notes

- API key is read from `VITE_ANTHROPIC_API_KEY` and used directly from the browser via `anthropic-dangerous-direct-browser-access`. Don't ship this in production without a backend proxy — your key would be exposed.
- All state is saved to `localStorage`.
- Service worker caches the shell for offline use; chat still requires network.
