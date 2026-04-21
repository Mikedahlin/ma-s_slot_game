# Lynne's AI Slot Deluxe

Browser slot game with bonus rounds, free-first AI backend routing, optional Brave grounding, and offline fallbacks.

**Repository:** [github.com/Mikedahlin/ma-s_slot_game](https://github.com/Mikedahlin/ma-s_slot_game)

## Quick start

```bash
npm install
cp .env.example .env
npm run dev # http://localhost:3000
```

## AI setup (free-first recommended)

This app now supports three AI modes:

- `AI_PROVIDER=gemini` (recommended for free-tier usage)
- `AI_PROVIDER=openai`
- `AI_PROVIDER=local` (always fallback/offline AI)

When credentials are missing or a provider fails, the app automatically falls back to local mode.

### Recommended free setup

- Set `AI_PROVIDER=gemini`
- Set `GEMINI_API_KEY=...`
- Optionally set `BRAVE_SEARCH_API_KEY=...` for grounded story prompts

## Exact environment variables

### Server / runtime

- `PORT` - server port (default `3000`)
- `NODE_ENV` - Node environment label (default `development`)
- `ALLOWED_ORIGINS` - comma-separated CORS allowlist for API routes

### AI provider routing

- `AI_PROVIDER` - `gemini` | `openai` | `local` (default `gemini`)
- `AI_DISABLED` - disable all remote AI (`true|false`, default `false`)
- `AI_FALLBACK_MODE` - fallback label (`local` by default)
- `AI_DEBUG` - extra backend AI logs (`true|false`, default `false`)
- `AI_ENABLE_STORY` - enable `/api/ai/story` remote generation (`true|false`, default `true`)
- `AI_ENABLE_THEME` - enable `/api/ai/theme` remote generation (`true|false`, default `true`)

### Gemini provider

- `GEMINI_API_KEY` - Gemini API key
- `GEMINI_TEXT_MODEL` - text model (default `gemini-2.5-flash-lite`)
- `GEMINI_IMAGE_MODEL` - image-capable model (default `gemini-2.5-flash-image-preview`)

### OpenAI provider

- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_TEXT_MODEL` - text model (default `gpt-5-mini`)
- `OPENAI_IMAGE_CONTROLLER_MODEL` - image controller model (default `gpt-5`)

### Brave grounding (optional)

- `BRAVE_SEARCH_API_KEY` - Brave Search API key
- `BRAVE_GROUNDING_ENABLED` - enable Brave grounding pipeline (`true|false`, default `true`)
- `BRAVE_GROUNDING_MAX_TOKENS` - max grounding token budget per request (default `4096`)
- `BRAVE_GROUNDING_MAX_URLS` - max URLs to ingest per request (default `8`)
- `BRAVE_SEARCH_LANG` - Brave search language (default `en`)
- `BRAVE_COUNTRY` - Brave country code (default `us`)

### Client runtime defaults (sound/music/animations/video)

These control default UX behavior for first load:

- `DEFAULT_SOUND_ENABLED` - default SFX toggle (`true|false`, default `true`)
- `DEFAULT_MUSIC_ENABLED` - default ambient music toggle (`true|false`, default `false`)
- `DEFAULT_VOICE_GUIDE_ENABLED` - default browser speech toggle (`true|false`, default `false`)
- `DEFAULT_ANIMATIONS_ENABLED` - default animated effects (`true|false`, default `true`)
- `DEFAULT_BONUS_VIDEO_ENABLED` - default bonus overlay video visibility (`true|false`, default `true`)
- `BONUS_VIDEO_URL_WEBM` - custom bonus background webm URL
- `BONUS_VIDEO_URL_MP4` - custom bonus background mp4 URL
- `HONOR_PREFERS_REDUCED_MOTION` - if `true`, disables animations/video when user prefers reduced motion (default `true`)

### Runtime diagnostics

- `GET /health` returns provider and effective mode (`live` vs `fallback`)
- `GET /api/runtime-config` returns safe client defaults + provider status (no secrets)
