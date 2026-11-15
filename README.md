# AI Slot Deluxe

A browser-based slot game prototype with bonus rounds, optional server-side OpenAI integrations, offline fallbacks, and an Electron desktop build.

## Overview

This project explores interactive game presentation, stateful gameplay flows, generated content, and deployment across browser and desktop environments.

## Technical focus

- Browser-based slot gameplay and bonus-round logic
- Server-side API routes with offline fallback behavior
- Optional OpenAI-powered story and theme generation
- Railway Steel browser integration for agent workflows
- Electron packaging for Windows

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The local development server runs at [http://localhost:3000](http://localhost:3000). Add the required environment variables from `.env.example` only when using the optional integrations.

## Desktop build

Run the desktop application locally:

```bash
npm run desktop
```

Build a Windows installer:

```bash
npm run dist:win
```

Build output is written to `desktop-dist/`.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the current deployment architecture, environment variables, and hosting instructions.
