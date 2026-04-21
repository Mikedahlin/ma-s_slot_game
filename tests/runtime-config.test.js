import test from "node:test";
import assert from "node:assert/strict";

import {
  parseRuntimeConfig,
  getAiProviderStatus,
  withDefaultRuntimeConfig,
} from "../lib/runtimeConfig.js";

test("parseRuntimeConfig applies defaults when env is empty", () => {
  const config = parseRuntimeConfig({});
  const status = getAiProviderStatus(config);

  assert.equal(config.ai.provider, "gemini");
  assert.equal(status.effectiveProvider, "local");
  assert.equal(status.reason, "missing_gemini_api_key");
  assert.equal(config.ai.enableStory, true);
  assert.equal(config.ai.enableTheme, true);

  assert.equal(config.clientDefaults.soundEnabled, true);
  assert.equal(config.clientDefaults.musicEnabled, false);
  assert.equal(config.clientDefaults.voiceGuideEnabled, false);
  assert.equal(config.clientDefaults.animationsEnabled, true);
  assert.equal(config.clientDefaults.bonusVideoEnabled, true);
});

test("parseRuntimeConfig supports explicit Gemini+Brave setup", () => {
  const config = parseRuntimeConfig({
    AI_PROVIDER: "gemini",
    GEMINI_API_KEY: "key",
    BRAVE_SEARCH_API_KEY: "brave-key",
    DEFAULT_SOUND_ENABLED: "false",
    DEFAULT_MUSIC_ENABLED: "true",
    DEFAULT_VOICE_GUIDE_ENABLED: "true",
    DEFAULT_ANIMATIONS_ENABLED: "false",
    DEFAULT_BONUS_VIDEO_ENABLED: "false",
  });
  const status = getAiProviderStatus(config);

  assert.equal(config.ai.provider, "gemini");
  assert.equal(config.ai.geminiApiKey.length > 0, true);
  assert.equal(config.ai.braveSearchApiKey.length > 0, true);
  assert.equal(status.effectiveProvider, "gemini");
  assert.equal(status.braveGroundingActive, true);
  assert.equal(config.clientDefaults.soundEnabled, false);
  assert.equal(config.clientDefaults.musicEnabled, true);
  assert.equal(config.clientDefaults.voiceGuideEnabled, true);
  assert.equal(config.clientDefaults.animationsEnabled, false);
  assert.equal(config.clientDefaults.bonusVideoEnabled, false);
});

test("getAiProviderStatus disables unavailable remote providers", () => {
  const missingGemini = parseRuntimeConfig({ AI_PROVIDER: "gemini" });
  assert.equal(getAiProviderStatus(missingGemini).effectiveProvider, "local");
  assert.equal(getAiProviderStatus(missingGemini).reason, "missing_gemini_api_key");

  const missingOpenAi = parseRuntimeConfig({ AI_PROVIDER: "openai" });
  assert.equal(getAiProviderStatus(missingOpenAi).effectiveProvider, "local");
  assert.equal(getAiProviderStatus(missingOpenAi).reason, "missing_openai_api_key");
});

test("withDefaultRuntimeConfig uses fallback value when not set", () => {
  const base = parseRuntimeConfig({});

  assert.equal(withDefaultRuntimeConfig(base, "missing.path", "fallback"), "fallback");
  assert.equal(withDefaultRuntimeConfig(base, "ai.provider", "fallback"), "gemini");
});
