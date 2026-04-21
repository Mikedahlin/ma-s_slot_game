const BOOLEAN_TRUE = new Set(["1", "true", "yes", "on"]);
const BOOLEAN_FALSE = new Set(["0", "false", "no", "off"]);

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (BOOLEAN_TRUE.has(normalized)) {
    return true;
  }
  if (BOOLEAN_FALSE.has(normalized)) {
    return false;
  }
  return fallback;
}

function clampNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, parsed));
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAiProvider(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "gemini" || normalized === "openai" || normalized === "local") {
    return normalized;
  }
  return "gemini";
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

export function buildRuntimeConfig(env = process.env) {
  const aiProvider = normalizeAiProvider(env.AI_PROVIDER);
  const textModel = normalizeModelChoice(
    env.OPENAI_TEXT_MODEL || env.GEMINI_TEXT_MODEL,
    aiProvider === "gemini" ? "gemini-2.5-flash-lite" : "gpt-5-mini"
  );
  const imageControllerModel = normalizeModelChoice(
    env.OPENAI_IMAGE_CONTROLLER_MODEL || env.GEMINI_IMAGE_MODEL,
    aiProvider === "gemini" ? "gemini-2.5-flash-image-preview" : "gpt-5"
  );

  return {
    ai: {
      provider: aiProvider,
      textModel,
      imageControllerModel,
      enableStory: parseBoolean(env.AI_ENABLE_STORY, true),
      enableTheme: parseBoolean(env.AI_ENABLE_THEME, true),
      openAiApiKey: String(env.OPENAI_API_KEY || "").trim(),
      geminiApiKey: String(env.GEMINI_API_KEY || "").trim(),
      braveSearchApiKey: String(env.BRAVE_SEARCH_API_KEY || "").trim(),
      braveGroundingEnabled: parseBoolean(env.BRAVE_GROUNDING_ENABLED, true),
      braveGroundingMaxTokens: clampNumber(
        env.BRAVE_GROUNDING_MAX_TOKENS,
        4096,
        1024,
        32768
      ),
      braveGroundingMaxUrls: clampNumber(
        env.BRAVE_GROUNDING_MAX_URLS,
        8,
        1,
        50
      ),
      braveSearchLanguage: String(env.BRAVE_SEARCH_LANG || "en").trim() || "en",
      braveSearchCountry: String(env.BRAVE_COUNTRY || "us").trim() || "us",
      disabled: parseBoolean(env.AI_DISABLED, false),
      fallbackMode: String(env.AI_FALLBACK_MODE || "local").trim() || "local",
      debug: parseBoolean(env.AI_DEBUG, false),
    },
    cors: {
      allowedOrigins: parseCsv(env.ALLOWED_ORIGINS),
    },
    clientDefaults: {
      soundEnabled: parseBoolean(env.DEFAULT_SOUND_ENABLED, true),
      musicEnabled: parseBoolean(env.DEFAULT_MUSIC_ENABLED, false),
      voiceGuideEnabled: parseBoolean(env.DEFAULT_VOICE_GUIDE_ENABLED, false),
      animationsEnabled: parseBoolean(env.DEFAULT_ANIMATIONS_ENABLED, true),
      bonusVideoEnabled: parseBoolean(env.DEFAULT_BONUS_VIDEO_ENABLED, true),
      bonusVideoUrlWebm: String(env.BONUS_VIDEO_URL_WEBM || "").trim(),
      bonusVideoUrlMp4: String(env.BONUS_VIDEO_URL_MP4 || "").trim(),
      reduceMotionHonored: parseBoolean(env.HONOR_PREFERS_REDUCED_MOTION, true),
    },
    server: {
      port: clampNumber(env.PORT || "3000", 3000, 1, 65535),
      nodeEnv: String(env.NODE_ENV || "development"),
    },
  };
}

export function parseRuntimeConfig(env = process.env) {
  return buildRuntimeConfig(env);
}

export function withDefaultRuntimeConfig(config, path, fallbackValue) {
  const pathParts = String(path || "")
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
  if (pathParts.length === 0) {
    return fallbackValue;
  }
  let currentValue = config;
  for (const part of pathParts) {
    if (
      currentValue === null ||
      currentValue === undefined ||
      typeof currentValue !== "object" ||
      !(part in currentValue)
    ) {
      return fallbackValue;
    }
    currentValue = currentValue[part];
  }
  return currentValue;
}

export function getAiProviderStatus(config) {
  if (config.ai.disabled) {
    return {
      effectiveProvider: "local",
      reason: "ai_disabled",
      isConfigured: false,
      braveGroundingActive: false,
    };
  }

  if (config.ai.provider === "local") {
    return {
      effectiveProvider: "local",
      reason: "local_provider",
      isConfigured: true,
      braveGroundingActive: false,
    };
  }

  if (config.ai.provider === "gemini") {
    if (!config.ai.geminiApiKey) {
      return {
        effectiveProvider: "local",
        reason: "missing_gemini_api_key",
        isConfigured: false,
        braveGroundingActive: false,
      };
    }
    return {
      effectiveProvider: "gemini",
      reason: "configured",
      isConfigured: true,
      braveGroundingActive: Boolean(
        config.ai.braveGroundingEnabled && config.ai.braveSearchApiKey
      ),
    };
  }

  if (!config.ai.openAiApiKey) {
    return {
      effectiveProvider: "local",
      reason: "missing_openai_api_key",
      isConfigured: false,
      braveGroundingActive: false,
    };
  }

  return {
    effectiveProvider: "openai",
    reason: "configured",
    isConfigured: true,
    braveGroundingActive: Boolean(
      config.ai.braveGroundingEnabled && config.ai.braveSearchApiKey
    ),
  };
}

export function getRuntimeSnapshot(config) {
  const hasOpenAi = config.ai.openAiApiKey.length > 0;
  const hasGemini = config.ai.geminiApiKey.length > 0;
  const hasBrave = config.ai.braveSearchApiKey.length > 0;
  const providerStatus = getAiProviderStatus(config);

  return {
    ai: {
      provider: config.ai.provider,
      effectiveProvider: providerStatus.effectiveProvider,
      providerReason: providerStatus.reason,
      textModel: config.ai.textModel,
      imageControllerModel: config.ai.imageControllerModel,
      enableStory: config.ai.enableStory,
      enableTheme: config.ai.enableTheme,
      disabled: config.ai.disabled,
      fallbackMode: config.ai.fallbackMode,
      hasOpenAiApiKey: hasOpenAi,
      hasGeminiApiKey: hasGemini,
      hasBraveSearchApiKey: hasBrave,
      braveGroundingEnabled: config.ai.braveGroundingEnabled,
      braveGroundingActive: providerStatus.braveGroundingActive,
      activeProviderConfigured: providerStatus.isConfigured,
      effectiveMode: providerStatus.effectiveProvider === "local" ? "fallback" : "live",
    },
    defaults: {
      soundEnabled: config.clientDefaults.soundEnabled,
      musicEnabled: config.clientDefaults.musicEnabled,
      voiceGuideEnabled: config.clientDefaults.voiceGuideEnabled,
      animationsEnabled: config.clientDefaults.animationsEnabled,
      bonusVideoEnabled: config.clientDefaults.bonusVideoEnabled,
      bonusVideoUrlWebm: config.clientDefaults.bonusVideoUrlWebm,
      bonusVideoUrlMp4: config.clientDefaults.bonusVideoUrlMp4,
      reduceMotionHonored: config.clientDefaults.reduceMotionHonored,
    },
  };
}
