/**
 * Optional API base for split hosting (e.g. GitHub Pages + Railway).
 * Leave empty when the game and API share the same origin (full Railway deploy).
 *
 * Example after deploying only the API to Railway:
 *   window.__API_BASE__ = "https://your-service.up.railway.app";
 */
window.__API_BASE__ = window.__API_BASE__ || "";
