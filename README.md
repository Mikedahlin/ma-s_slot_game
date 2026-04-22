# Lynne's AI Slot Deluxe

Browser slot game with bonus rounds, optional OpenAI-powered story/theme APIs (server-side), and offline fallbacks.

**Repository:** [github.com/Mikedahlin/ma-s_slot_game](https://github.com/Mikedahlin/ma-s_slot_game)

**Deploy to GitHub + Railway:** see **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions, environment variables, and GitHub Pages + split API setup.

```bash
npm install
cp .env.example .env   # add OPENAI_API_KEY for local AI
npm run dev              # http://localhost:3000
```

## Desktop App (Downloadable Windows App)

This project can now be packaged as a desktop app using Electron.

### Run as Desktop App (local)

```bash
npm install
npm run desktop
```

### Build a Windows Installer (.exe)

```bash
npm install
npm run dist:win
```

Build output is written to:

- `desktop-dist/` (installer and packaged app artifacts)
