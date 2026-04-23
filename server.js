import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { chromium } from "playwright-core";

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(function (origin) {
    return origin.trim();
  })
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(function (request, response, next) {
    const requestOrigin = request.headers.origin;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.setHeader("Access-Control-Allow-Origin", requestOrigin);
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }
    next();
  });
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function summarizeAiError(error) {
  const status = error?.status || "unknown";
  const code = error?.code || error?.type || "unknown_error";
  return "status:" + status + ",code:" + code;
}

function normalizeModelChoice(value, fallback) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return fallback;
  }

  const lowered = rawValue.toLowerCase().replace(/\s+/g, "");

  if (
    lowered === "gpt-3.5" ||
    lowered === "gpt-3.5-turbo" ||
    lowered === "gpt3.5" ||
    lowered === "gpt3.5-turbo" ||
    lowered === "gpt-5.0-mini" ||
    lowered === "gpt5.0-mini" ||
    lowered === "gpt-5.0-minis" ||
    lowered === "gpt5.0-minis" ||
    lowered === "gpt-5-" ||
    lowered === "gpt5-"
  ) {
    return fallback;
  }

  if (lowered === "gpt-5mini" || lowered === "gpt5mini") {
    return "gpt-5-mini";
  }

  if (lowered === "gpt-5.0" || lowered === "gpt5.0") {
    return "gpt-5";
  }

  return rawValue.trim();
}

const textModel = normalizeModelChoice(process.env.OPENAI_TEXT_MODEL, "gpt-5-mini");

function normalizeImageModelChoice(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "gpt-image-1";
  }

  const lowered = rawValue.toLowerCase().replace(/\s+/g, "");

  // Common typo seen in env vars; route to a known-good image model.
  if (lowered === "gpt-40-mini" || lowered === "gpt40mini") {
    return "gpt-image-1";
  }

  return rawValue;
}

const imageControllerModel = normalizeImageModelChoice(
  process.env.OPENAI_IMAGE_MODEL || process.env.OPENAI_IMAGE_CONTROLLER_MODEL
);

const steelWebsocketEndpoint = String(process.env.STEEL_WS_ENDPOINT || "wss://connect.steel.dev").trim();
const steelApiKey = String(process.env.STEEL_API_KEY || "").trim();
const steelProjectId = String(process.env.STEEL_PROJECT_ID || "").trim();

function buildSteelConnectUrl(sessionOptions = {}) {
  if (!steelApiKey) {
    throw new Error("Steel is not configured. Set STEEL_API_KEY.");
  }

  const wsUrl = new URL(steelWebsocketEndpoint);
  wsUrl.searchParams.set("apiKey", steelApiKey);

  if (steelProjectId) {
    wsUrl.searchParams.set("projectId", steelProjectId);
  }

  if (Number.isFinite(sessionOptions.timeoutMs) && sessionOptions.timeoutMs > 0) {
    wsUrl.searchParams.set("sessionTimeout", String(Math.floor(sessionOptions.timeoutMs)));
  }

  return wsUrl.toString();
}

async function runSteelNavigation({ targetUrl, timeoutMs = 45000, waitUntil = "domcontentloaded", captureScreenshot = false }) {
  const connectUrl = buildSteelConnectUrl({ timeoutMs });
  const browser = await chromium.connectOverCDP(connectUrl);

  try {
    const context = browser.contexts()[0] || (await browser.newContext());
    const page = await context.newPage();

    await page.goto(targetUrl, { waitUntil, timeout: timeoutMs });
    await page.waitForTimeout(500);

    const title = await page.title();
    const finalUrl = page.url();
    const pageText = await page
      .locator("body")
      .innerText()
      .then((text) => text.slice(0, 1000))
      .catch(() => "");

    let screenshotBase64 = null;
    if (captureScreenshot) {
      const screenshot = await page.screenshot({ type: "png", fullPage: true });
      screenshotBase64 = screenshot.toString("base64");
    }

    await page.close();

    return {
      ok: true,
      title,
      finalUrl,
      textPreview: pageText,
      screenshotBase64,
    };
  } finally {
    await browser.close();
  }
}

const fallbackThemePrompts = [
  "velvet starlight lounge",
  "rose-gold moon garden casino",
  "cozy lantern jackpot nook",
  "sunset ribbon dream hall",
  "diamond cloud celebration room",
];

app.use(express.json({ limit: "2mb" }));

app.get("/health", function (request, response) {
  response.json({ ok: true, service: "lynnes-ai-slot-deluxe" });
});

app.get("/api/config/models", function (request, response) {
  response.json({
    ok: true,
    ai: {
      provider: "openai",
      textModel,
      imageModel: imageControllerModel,
      hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
      expectedEnvVars: ["OPENAI_API_KEY", "OPENAI_TEXT_MODEL", "OPENAI_IMAGE_CONTROLLER_MODEL"],
    },
    steel: {
      configured: Boolean(steelApiKey),
      websocketEndpoint: steelWebsocketEndpoint,
      hasProjectId: Boolean(steelProjectId),
    },
  });
});

app.use(express.static(__dirname));

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function buildPalette(stage) {
  const palettes = [
    {
      accent: "#ffcf63",
      accentSoft: "#ffe7ae",
      glow: "#54e7ff",
      glowSoft: "#aef5ff",
      shadow: "#4a2a78",
      surface: "#241636",
    },
    {
      accent: "#ffb36c",
      accentSoft: "#ffe1bb",
      glow: "#72d2ff",
      glowSoft: "#b8ebff",
      shadow: "#6a245a",
      surface: "#2c193c",
    },
    {
      accent: "#ff9cc6",
      accentSoft: "#ffd8ea",
      glow: "#8dffdd",
      glowSoft: "#cafef1",
      shadow: "#44276e",
      surface: "#26193a",
    },
    {
      accent: "#ffd36f",
      accentSoft: "#fff0c8",
      glow: "#8fd8ff",
      glowSoft: "#d4f1ff",
      shadow: "#7a2e46",
      surface: "#311b3b",
    },
    {
      accent: "#ffffff",
      accentSoft: "#fff9da",
      glow: "#8ffff5",
      glowSoft: "#d9fffb",
      shadow: "#69367e",
      surface: "#261634",
    },
  ];

  return palettes[clamp(stage, 1, palettes.length) - 1];
}

function pickThemeDirection({ themePrompt, worldStage, currentTheme, reason }) {
  const cleanedPrompt = String(themePrompt || "").trim();
  if (cleanedPrompt.length > 0) {
    return cleanedPrompt;
  }

  const enhancers = [
    "moonlit velvet accents",
    "sparkling ribbon details",
    "golden lantern reflections",
    "diamond mist highlights",
    "rose-gold shimmer trails",
    "starlight glass textures",
  ];

  const basePrompt = fallbackThemePrompts[(worldStage - 1) % fallbackThemePrompts.length];
  const current = String(currentTheme || "").toLowerCase();
  const reasonText = String(reason || "").toLowerCase();
  const basis = Date.now() + current.length + reasonText.length * 7 + worldStage * 11;
  const enhancer = enhancers[Math.abs(basis) % enhancers.length];

  return basePrompt + ", " + enhancer;
}

function buildFallbackTheme({ themePrompt, worldStage, reason, currentTheme }) {
  const palette = buildPalette(worldStage);
  const sourcePrompt = pickThemeDirection({ themePrompt, worldStage, currentTheme, reason });

  return {
    source: "fallback",
    themeName: "Lynne's " + titleCase(sourcePrompt),
    caption:
      "Local cozy mode is active. The world is shifting toward " +
      sourcePrompt +
      " while we wait for live AI art.",
    storyWhisper:
      "The room is still changing for you, Lynne. Even in local mode, the " +
      sourcePrompt +
      " world is waking up.",
    promptUsed:
      "Premium cozy slot lounge, " +
      sourcePrompt +
      ", warm velvet lights, sparkling bonus-room mood, evolving fantasy details, no text",
    palette,
    backgroundImageDataUrl: null,
    reason,
    musicProfile: buildFallbackMusicProfile(themePrompt, worldStage),
  };
}

function buildFallbackMusicProfile(themePrompt, worldStage) {
  const text = String(themePrompt || "").toLowerCase();
  const pulseHz = 0.1 + clamp(worldStage, 1, 5) * 0.015;

  if (/moon|night|velvet|midnight|noir/.test(text)) {
    return {
      name: "Midnight Velvet Drift",
      wave: "sine",
      pulseHz,
      brightness: 0.9,
      freqs: [130.81, 155.56, 196.0],
    };
  }
  if (/gold|sun|amber|lantern|honey/.test(text)) {
    return {
      name: "Golden Lantern Waltz",
      wave: "triangle",
      pulseHz: pulseHz + 0.03,
      brightness: 1.05,
      freqs: [146.83, 185.0, 220.0],
    };
  }
  if (/ocean|aqua|blue|teal|tide/.test(text)) {
    return {
      name: "Tidal Glass Echo",
      wave: "sine",
      pulseHz: pulseHz + 0.02,
      brightness: 0.95,
      freqs: [110.0, 146.83, 174.61],
    };
  }
  if (/garden|rose|flower|bloom|petal/.test(text)) {
    return {
      name: "Rose Garden Lilt",
      wave: "triangle",
      pulseHz: pulseHz + 0.04,
      brightness: 1.1,
      freqs: [174.61, 220.0, 261.63],
    };
  }

  return {
    name: "Velvet Night Flow",
    wave: "sine",
    pulseHz,
    brightness: 0.95,
    freqs: [130.81, 164.81, 196.0],
  };
}

function extractJsonObject(text) {
  const source = String(text || "").trim();
  if (!source) {
    return null;
  }

  try {
    return JSON.parse(source);
  } catch {
    const match = source.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function titleCase(value) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildFallbackStory(payload) {
  const eventType = payload.eventType || "guide";
  const themeName = payload.themeName || "Velvet Starlight Lounge";
  const bet = payload.bet || 10;

  const messages = {
    welcome:
      "Lynne, your reels are glowing softly tonight. I tucked a little extra luck into the " +
      themeName +
      ".",
    guide:
      "I would keep the bet at " +
      bet +
      " for a few spins, watch for a rhythm, and wait for the room to warm up before chasing the big sparkle.",
    big_win:
      "Oh, that one landed beautifully. The whole room just leaned toward you, and I can feel another special bonus world opening soon.",
    diamond_bonus:
      "The diamonds are awake now. Pick with your heart, because this round feels rich, dramatic, and lucky.",
    treasure_shelf:
      "The bells opened a treasure shelf just for you. Choose the shelf that feels warmest, because that one usually hides the sweetest reward.",
    free_spin_bonus:
      "Those sevens brought in a breezy little jackpot storm. Free spins are the perfect time to let the magic stretch out.",
    theme_shift:
      "The slot world is changing around you. The lights are softer, the colors are richer, and the next surprise should feel more alive.",
  };

  return messages[eventType] || messages.guide;
}

function buildStoryPrompt(payload) {
  return [
    "You are Lynne's Lucky Guide, a warm premium slot narrator.",
    "Speak directly to Lynne in a cozy, affectionate, upbeat style.",
    "Keep it under 70 words.",
    "Sound magical but grounded.",
    "Reference evolving bonus worlds, sparkle, velvet lights, or cozy casino atmosphere when appropriate.",
    "Never mention being an AI.",
    "",
    "Context:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function buildThemeImagePrompt({ themePrompt, worldStage, reason, currentTheme }) {
  const basePrompt = pickThemeDirection({ themePrompt, worldStage, currentTheme, reason });

  return [
    "Create a premium Las Vegas-style slot-game background for Lynne.",
    "Theme direction: " + basePrompt + ".",
    "Current theme name: " + (currentTheme || "Velvet Starlight Lounge") + ".",
    "Evolution stage: " + worldStage + ".",
    "Reason for evolution: " + reason + ".",
    "Art direction: rich Vegas floor glamour, neon jewel glow, cinematic jackpot lighting, polished chrome trims, velvet casino textures, premium mobile game clarity and depth.",
    "No text, no watermark, no logo, no characters in the foreground, landscape composition.",
  ].join(" ");
}

function buildThemeMetadataPrompt({ themePrompt, worldStage, reason, currentTheme }) {
  const basePrompt = pickThemeDirection({ themePrompt, worldStage, currentTheme, reason });

  return [
    "Create a premium evolving Las Vegas slot-world theme for Lynne.",
    "Return JSON only.",
    "Keys: themeName, caption, storyWhisper, accent, accentSoft, glow, glowSoft, shadow, surface, musicMood, musicWave, musicTempo, musicRoot.",
    "Use cozy, premium, warm casino fantasy language.",
    "Caption under 28 words.",
    "storyWhisper under 34 words.",
    "All colors must be valid hex codes.",
    "musicWave must be one of: sine, triangle, sawtooth.",
    "musicTempo is a number from 0.08 to 0.22 (for soft ambient pulsing).",
    "musicRoot must be one of: C, D, E, F, G, A, B.",
    "Current theme: " + (currentTheme || "Velvet Starlight Lounge") + ".",
    "New theme direction: " + basePrompt + ".",
    "World stage: " + worldStage + ".",
    "Reason: " + reason + ".",
  ].join(" ");
}

async function generateThemeMetadata(payload, fallbackTheme) {
  if (!openai) {
    return {
      theme: fallbackTheme,
      textError: "status:missing_key,code:openai_not_configured",
    };
  }

  try {
    const response = await openai.responses.create({
      model: textModel,
      input: buildThemeMetadataPrompt(payload),
    });

    const parsed = extractJsonObject(response.output_text);
    if (!parsed) {
      return fallbackTheme;
    }

    return {
      theme: {
      ...fallbackTheme,
      source: "openai-text",
      themeName: parsed.themeName || fallbackTheme.themeName,
      caption: parsed.caption || fallbackTheme.caption,
      storyWhisper: parsed.storyWhisper || fallbackTheme.storyWhisper,
      palette: {
        accent: parsed.accent || fallbackTheme.palette.accent,
        accentSoft: parsed.accentSoft || fallbackTheme.palette.accentSoft,
        glow: parsed.glow || fallbackTheme.palette.glow,
        glowSoft: parsed.glowSoft || fallbackTheme.palette.glowSoft,
        shadow: parsed.shadow || fallbackTheme.palette.shadow,
        surface: parsed.surface || fallbackTheme.palette.surface,
      },
      musicProfile: toMusicProfile({
        root: parsed.musicRoot,
        wave: parsed.musicWave,
        pulseHz: parsed.musicTempo,
        mood: parsed.musicMood,
      }, fallbackTheme.musicProfile),
      },
      textError: null,
    };
  } catch (error) {
    console.error("AI theme metadata generation failed:", error);
    return {
      theme: fallbackTheme,
      textError: summarizeAiError(error),
    };
  }
}

function toMusicProfile(rawMusic, fallbackMusic) {
  const rootMap = {
    C: [130.81, 164.81, 196.0],
    D: [146.83, 185.0, 220.0],
    E: [164.81, 207.65, 246.94],
    F: [174.61, 220.0, 261.63],
    G: [196.0, 246.94, 293.66],
    A: [220.0, 277.18, 329.63],
    B: [246.94, 311.13, 369.99],
  };

  const normalizedRoot = String(rawMusic?.root || "")
    .trim()
    .toUpperCase();
  const freqs = rootMap[normalizedRoot] || fallbackMusic.freqs;
  const wave = ["sine", "triangle", "sawtooth"].includes(rawMusic?.wave)
    ? rawMusic.wave
    : fallbackMusic.wave;
  const pulseHz = clamp(Number(rawMusic?.pulseHz) || fallbackMusic.pulseHz || 0.12, 0.08, 0.22);

  return {
    name: String(rawMusic?.mood || fallbackMusic.name || "Dream Lounge Mix").slice(0, 42),
    wave,
    pulseHz,
    brightness: fallbackMusic.brightness || 1,
    freqs,
  };
}

async function generateStory(payload) {
  if (!openai) {
    return {
      source: "fallback",
      message: buildFallbackStory(payload),
      fallbackReason: "status:missing_key,code:openai_not_configured",
    };
  }

  try {
    const response = await openai.responses.create({
      model: textModel,
      input: buildStoryPrompt(payload),
    });

    return {
      source: "openai",
      message: response.output_text?.trim() || buildFallbackStory(payload),
      fallbackReason: null,
    };
  } catch (error) {
    console.error("AI story generation failed:", error);
    return {
      source: "fallback",
      message: buildFallbackStory(payload),
      fallbackReason: summarizeAiError(error),
    };
  }
}

async function generateTheme(payload) {
  const fallbackTheme = buildFallbackTheme(payload);
  const { theme: themedResult, textError } = await generateThemeMetadata(payload, fallbackTheme);

  if (!openai) {
    return {
      ...themedResult,
      fallbackReason: textError,
    };
  }

  try {
    const response = await openai.images.generate({
      model: imageControllerModel,
      prompt: buildThemeImagePrompt(payload),
      size: "1536x1024",
    });
    const generatedImage = Array.isArray(response.data)
      ? response.data.find((item) => item.b64_json || item.url)
      : null;

    return {
      ...themedResult,
      source: generatedImage ? "openai-image" : themedResult.source,
      caption: generatedImage
        ? "Live AI art is active. The world is evolving into a richer, dreamier bonus lounge for Lynne."
        : themedResult.caption,
      backgroundImageDataUrl: generatedImage?.b64_json
        ? "data:image/png;base64," + generatedImage.b64_json
        : generatedImage?.url || null,
      fallbackReason: generatedImage ? null : (textError || "status:unknown,code:image_empty"),
    };
  } catch (error) {
    console.error("AI theme generation failed:", error);
    return {
      ...themedResult,
      fallbackReason: summarizeAiError(error),
    };
  }
}

app.post("/api/ai/story", async (request, response) => {
  const payload = {
    eventType: request.body?.eventType || "guide",
    themeName: request.body?.themeName || "Velvet Starlight Lounge",
    balance: request.body?.balance || 0,
    bet: request.body?.bet || 10,
    bonusRound: request.body?.bonusRound || null,
    worldStage: request.body?.worldStage || 1,
    recentOutcome: request.body?.recentOutcome || "settling in",
  };

  response.json(await generateStory(payload));
});

app.post("/api/ai/theme", async (request, response) => {
  const payload = {
    themePrompt: request.body?.themePrompt || "",
    worldStage: clamp(Number(request.body?.worldStage) || 1, 1, 5),
    reason: request.body?.reason || "fresh start",
    currentTheme: request.body?.currentTheme || "Velvet Starlight Lounge",
  };

  response.json(await generateTheme(payload));
});

app.get("/api/agent/steel/health", function (request, response) {
  response.json({
    ok: true,
    configured: Boolean(steelApiKey),
    websocketEndpoint: steelWebsocketEndpoint,
    hasProjectId: Boolean(steelProjectId),
  });
});

app.post("/api/agent/steel/navigate", async (request, response) => {
  const targetUrl = String(request.body?.url || "").trim();
  if (!targetUrl) {
    response.status(400).json({ ok: false, error: "Missing required body field: url" });
    return;
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    response.status(400).json({ ok: false, error: "url must start with http:// or https://" });
    return;
  }

  const waitUntil = String(request.body?.waitUntil || "domcontentloaded");
  const captureScreenshot = Boolean(request.body?.captureScreenshot);
  const timeoutMs = clamp(Number(request.body?.timeoutMs) || 45000, 5000, 120000);

  try {
    const result = await runSteelNavigation({
      targetUrl,
      timeoutMs,
      waitUntil,
      captureScreenshot,
    });
    response.json(result);
  } catch (error) {
    console.error("Steel navigate failed:", error);
    response.status(500).json({
      ok: false,
      error: String(error?.message || "Steel navigation failed"),
      detail: summarizeAiError(error),
    });
  }
});

app.use((request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log("Lynne's AI slot game is running at http://localhost:" + port);
  console.log("Text model:", textModel);
  console.log("Image controller model:", imageControllerModel);
});
