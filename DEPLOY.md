# Deploy: GitHub + Railway

**This project’s repo:** [github.com/Mikedahlin/ma-s_slot_game](https://github.com/Mikedahlin/ma-s_slot_game)

This app is a **static frontend** (`index.html`, `styles.css`, `script.js`, `config.deploy.js`) plus a **Node API** (`server.js`) for OpenAI-backed story/theme routes.

You can deploy **everything on Railway** (simplest — one URL, no CORS fuss), or use **GitHub Pages for the UI** and **Railway for the API only** (requires `config.deploy.js` + `ALLOWED_ORIGINS`).

---

## 1. Push the project to GitHub

If you already created [Mikedahlin/ma-s_slot_game](https://github.com/Mikedahlin/ma-s_slot_game), connect your local folder and push:

```bash
git remote add origin https://github.com/Mikedahlin/ma-s_slot_game.git
# If origin exists: git remote set-url origin https://github.com/Mikedahlin/ma-s_slot_game.git
git branch -M main
git push -u origin main
```

New repo (empty) setup:

```bash
git init
git add .
git commit -m "Initial commit: Lynne's AI Slot Deluxe"
git branch -M main
git remote add origin https://github.com/Mikedahlin/ma-s_slot_game.git
git push -u origin main
```

3. **Never commit `.env`** — it is listed in `.gitignore`. Use `.env.example` as a template locally.

---

## 2. Deploy on Railway (recommended: full stack)

Railway runs `npm start` → `node server.js`, which serves the static files **and** `/api/ai/*`.

1. Go to [railway.app](https://railway.app) and sign in (GitHub login is fine).
2. **New project** → **Deploy from GitHub repo** → select this repository.
3. Railway detects Node and uses the `start` script automatically.
4. **Variables** (project → service → **Variables**):

   | Name | Value |
   |------|--------|
   | `OPENAI_API_KEY` | Your OpenAI API key (required for live AI; optional for fallback-only mode) |
   | `OPENAI_TEXT_MODEL` | Optional, e.g. `gpt-5-mini` |
   | `OPENAI_IMAGE_CONTROLLER_MODEL` | Optional, e.g. `gpt-5` |

   Railway injects **`PORT`** — do not set it manually unless you know what you’re doing.

5. **Generate domain**: Settings → **Networking** → **Generate domain**. Open that URL — the game and API share the same origin, so **`config.deploy.js` can stay with an empty `__API_BASE__`**.

6. **Health check** (optional): `GET https://YOUR_DOMAIN/health` should return `{"ok":true,...}`.

### If OpenAI is missing

The server still runs; theme/story endpoints fall back to built-in logic (similar to the browser offline mode).

---

## 3. Optional: GitHub Pages (static) + Railway (API only)

Use this if you want the site on `*.github.io` but keep secrets on Railway.

1. Deploy the **same repo** on Railway as in §2 and copy the **public HTTPS URL** (e.g. `https://your-app.up.railway.app`).
2. In **`config.deploy.js`** (committed to the repo), set:

   ```js
   window.__API_BASE__ = "https://your-app.up.railway.app";
   ```

3. On **Railway Variables**, add (replace with your real GitHub Pages URL if different):

   ```text
   ALLOWED_ORIGINS=https://mikedahlin.github.io,https://mikedahlin.github.io/ma-s_slot_game
   ```

   Use the exact origins your browser uses (with or without trailing path — match how you open the Pages site). Multiple origins: comma-separated, no spaces unless intentional.

4. **GitHub Pages**: Repo → **Settings** → **Pages** → Source: **Deploy from branch** → branch `main`, folder **`/` (root)** → Save.

5. After build, open `https://mikedahlin.github.io/ma-s_slot_game/` (or your user/org Pages URL) and test **Generate AI Theme** / **Ask Lucky Guide** — they should hit Railway with CORS allowed.

If API calls fail, check browser **Network** tab for CORS errors and adjust `ALLOWED_ORIGINS` to match the exact `Origin` header.

---

## 4. Local development

```bash
npm install
cp .env.example .env
# Edit .env — add OPENAI_API_KEY at minimum
npm run dev
```

Open `http://localhost:3000`. The dev server uses `node --watch server.js`.

---

## 5. Security checklist

- Rotate any API key that was ever committed or pasted into chat.
- Keep **only** Railway (or another server) holding `OPENAI_API_KEY` — never put it in client-side JS.
- `.env` is gitignored; use Railway Variables for production.

---

## 6. Troubleshooting

| Issue | What to try |
|--------|-------------|
| Railway build fails | Ensure `package.json` has `"start": "node server.js"` and Node ≥ 20. |
| 404 on `/` | Confirm `index.html` is in the repo root (same folder as `server.js`). |
| AI buttons do nothing on Pages | Set `window.__API_BASE__` in `config.deploy.js` and `ALLOWED_ORIGINS` on Railway. |
| CORS error | Origin in browser must exactly match an entry in `ALLOWED_ORIGINS`. |
| OpenAI errors | Check Railway logs; verify key and model names in Variables. |
