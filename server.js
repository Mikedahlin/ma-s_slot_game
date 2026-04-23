import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import {
  buildRuntimeConfig,
  getAiProviderStatus,
  getRuntimeSnapshot,
} from "./lib/runtimeConfig.js";

dotenv.config();

const runtimeConfig = buildRuntimeConfig(process.env);
const runtimeSnapshot = getRuntimeSnapshot(runtimeConfig);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openaiClient = runtimeConfig.ai.openAiApiKey
  ? new OpenAI({ apiKey: runtimeConfig.ai.openAiApiKey })
  : null;
const geminiClient = runtimeConfig.ai.geminiApiKey
  ? new GoogleGenAI({ apiKey: runtimeConfig.ai.geminiApiKey })
  : null;

function debugLog(...args) {
  if (runtimeConfig.ai.debug) {
    console.log("[ai-debug]", ...args);
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
app.use((request, response, next) => {
  const allowedOrigins = runtimeConfig.cors.allowedOrigins;
  if (allowedOrigins.length === 0) {
    next();
    return;
  }

  const origin = request.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }

  if (request.method === "OPTIONS") {
    response.status(204).send();
    return;
  }

  next();
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

function buildGroundedStoryPrompt(payload, braveContext) {
  if (!braveContext) {
    return buildStoryPrompt(payload);
  }

  return [
    buildStoryPrompt(payload),
    "",
    "Optional web grounding context (use only if relevant):",
    braveContext,
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

function parseBraveSnippets(bravePayload) {
  const genericGrounding = bravePayload?.grounding?.generic;
  if (!Array.isArray(genericGrounding)) {
    return "";
  }

  const snippets = [];
  for (const entry of genericGrounding.slice(0, runtimeConfig.ai.braveGroundingMaxUrls)) {
    const entrySnippets = Array.isArray(entry?.snippets) ? entry.snippets : [];
    for (const snippet of entrySnippets.slice(0, 2)) {
      snippets.push(`- ${snippet}`);
    }
  }

  return snippets.join("\n").trim();
}

async function fetchBraveGrounding(queryText) {
  const providerStatus = getAiProviderStatus(runtimeConfig);
  if (!providerStatus.braveGroundingActive) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: queryText,
      search_lang: runtimeConfig.ai.braveSearchLanguage,
      country: runtimeConfig.ai.braveSearchCountry,
      maximum_number_of_urls: String(runtimeConfig.ai.braveGroundingMaxUrls),
      maximum_number_of_tokens: String(runtimeConfig.ai.braveGroundingMaxTokens),
    });

    const response = await fetch(
      `https://api.search.brave.com/res/v1/llm/context?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": runtimeConfig.ai.braveSearchApiKey,
        },
      }
    );

    if (!response.ok) {
      debugLog("Brave grounding request failed", response.status);
      return null;
    }

    const payload = await response.json();
    const snippets = parseBraveSnippets(payload);
    return snippets || null;
  } catch (error) {
    debugLog("Brave grounding request error", error);
    return null;
  }
}

function parseGeminiJsonObject(rawText) {
  if (!rawText) {
    return null;
  }
  return extractJsonObject(rawText);
}

function extractGeminiImageData(response) {
  const candidates = Array.isArray(response?.candidates) ? response.candidates : [];
  for (const candidate of candidates) {
    const parts = Array.isArray(candidate?.content?.parts)
      ? candidate.content.parts
      : [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }
  return null;
}

async function runGeminiText(prompt, model) {
  if (!geminiClient) {
    throw new Error("Gemini client is not configured");
  }
  const response = await geminiClient.models.generateContent({
    model,
    contents: prompt,
  });
  return response?.text?.trim() || "";
}

async function runGeminiImage(prompt, model) {
  if (!geminiClient) {
    throw new Error("Gemini client is not configured");
  }
  const response = await geminiClient.models.generateContent({
    model,
    contents: prompt,
  });
  return extractGeminiImageData(response);
}

async function generateThemeMetadata(payload, fallbackTheme) {
  const providerStatus = getAiProviderStatus(runtimeConfig);
  if (runtimeConfig.ai.disabled || !runtimeConfig.ai.enableTheme) {
    return fallbackTheme;
  }

  const prompt = buildThemeMetadataPrompt(payload);

  try {
    if (providerStatus.effectiveProvider === "gemini") {
      const text = await runGeminiText(prompt, runtimeConfig.ai.textModel);
      const parsed = parseGeminiJsonObject(text);
      if (!parsed) {
        return fallbackTheme;
      }
      return {
        ...fallbackTheme,
        source: "gemini-text",
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
      };
    }

    if (providerStatus.effectiveProvider === "openai" && openaiClient) {
      const response = await openaiClient.responses.create({
        model: runtimeConfig.ai.textModel,
        input: prompt,
      });

      const parsed = extractJsonObject(response.output_text);
      if (!parsed) {
        return fallbackTheme;
      }

      return {
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
      };
    }

    return fallbackTheme;
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
  const providerStatus = getAiProviderStatus(runtimeConfig);
  if (runtimeConfig.ai.disabled || !runtimeConfig.ai.enableStory) {
    return {
      source: "fallback",
      message: buildFallbackStory(payload),
      fallbackReason: "status:missing_key,code:openai_not_configured",
    };
  }

  try {
    const grounding = await fetchBraveGrounding(
      `${payload.themeName} ${payload.eventType} slot game guidance`
    );
    const prompt = buildGroundedStoryPrompt(payload, grounding);

    if (providerStatus.effectiveProvider === "gemini") {
      const message = await runGeminiText(prompt, runtimeConfig.ai.textModel);
      return {
        source: "gemini",
        message: message || buildFallbackStory(payload),
      };
    }

    if (providerStatus.effectiveProvider === "openai" && openaiClient) {
      const response = await openaiClient.responses.create({
        model: runtimeConfig.ai.textModel,
        input: prompt,
      });

      return {
        source: "openai",
        message: response.output_text?.trim() || buildFallbackStory(payload),
      };
    }

    return {
      source: "fallback",
      message: buildFallbackStory(payload),
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
  const themedResult = await generateThemeMetadata(payload, fallbackTheme);
  const providerStatus = getAiProviderStatus(runtimeConfig);

  if (runtimeConfig.ai.disabled || !runtimeConfig.ai.enableTheme) {
    return themedResult;
  }

  try {
    const imagePrompt = buildThemeImagePrompt(payload);
    let imageData = null;
    let source = themedResult.source;

    if (providerStatus.effectiveProvider === "gemini") {
      imageData = await runGeminiImage(
        imagePrompt,
        runtimeConfig.ai.imageControllerModel
      );
      source = imageData ? "gemini-image" : themedResult.source;
    } else if (
      providerStatus.effectiveProvider === "openai" &&
      openaiClient
    ) {
      const response = await openaiClient.responses.create({
        model: runtimeConfig.ai.imageControllerModel,
        input: imagePrompt,
        tools: [{ type: "image_generation", action: "generate" }],
      });

      const outputItems = Array.isArray(response.output) ? response.output : [];
      const generatedImage = outputItems.find(
        (item) => item.type === "image_generation_call" && item.result
      );
      imageData = generatedImage?.result || null;
      source = imageData ? "openai-image" : themedResult.source;
    }

    return {
      ...themedResult,
      source,
      caption: imageData
        ? "Live AI art is active. The world is evolving into a richer, dreamier bonus lounge for Lynne."
        : themedResult.caption,
      backgroundImageDataUrl: imageData ? "data:image/png;base64," + imageData : null,
    };
  } catch (error) {
    console.error("AI theme generation failed:", error);
    return {
      ...themedResult,
      fallbackReason: summarizeAiError(error),
    };
  }
}

app.get("/health", (request, response) => {
  response.json({
    ok: true,
    app: "lynnes-ai-slot-deluxe",
    now: new Date().toISOString(),
    ai: {
      provider: runtimeSnapshot.ai.provider,
      effectiveProvider: runtimeSnapshot.ai.effectiveProvider,
      mode: runtimeSnapshot.ai.effectiveMode,
      storyEnabled: runtimeSnapshot.ai.enableStory,
      themeEnabled: runtimeSnapshot.ai.enableTheme,
      braveGroundingEnabled: runtimeSnapshot.ai.braveGroundingEnabled,
      braveGroundingActive: runtimeSnapshot.ai.braveGroundingActive,
    },
  });
});

app.get("/api/runtime-config", (request, response) => {
  response.json(runtimeSnapshot);
});

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

app.use((request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(runtimeConfig.server.port, () => {
  console.log(
    "Lynne's AI slot game is running at http://localhost:" +
      runtimeConfig.server.port
  );
  console.log("AI provider:", runtimeSnapshot.ai.provider);
  console.log("Effective AI mode:", runtimeSnapshot.ai.effectiveMode);
  console.log("Text model:", runtimeSnapshot.ai.textModel);
  console.log("Image controller model:", runtimeSnapshot.ai.imageControllerModel);
});
