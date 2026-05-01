export type WinTier = "none" | "small" | "big" | "mega";

export interface LynneArtInput {
  winTier?: WinTier;
  winAmount?: number;
  missionProgress?: number;
  missionTarget?: number;
  event?: string;
}

export interface LynneArtOutput {
  imageDataUrl: string;
  caption: string;
  promptUsed: string;
  provider: "openai" | "google" | "fallback";
}

function safeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildScene(input: LynneArtInput): string {
  if (input.event === "bonus_trigger") {
    return "a bonus round celebration with Lynne in front of sparkling reels and raining lights";
  }
  if (input.winTier === "mega") return "a grand jackpot celebration with warm golden lights";
  if (input.winTier === "big") return "a bright win moment with elegant pink and blue casino glow";
  if (input.winTier === "small") return "a cozy little win with sparkles and soft lights";
  if (input.event === "mission_progress") return "a focused mission progress moment with lucky charm details";
  return "a classy lounge scene before the next spin";
}

function buildPrompt(input: LynneArtInput): string {
  const missionProgress = safeNumber(input.missionProgress, 0);
  const missionTarget = safeNumber(input.missionTarget, 20);
  const winAmount = safeNumber(input.winAmount, 0);
  const scene = buildScene(input);

  return [
    "Create a polished digital illustration for a social slot game called Lynne's Luxe Lights.",
    "Main character: Lynne, joyful, stylish, kind, around a glowing slot machine.",
    `Scene: ${scene}.`,
    `Recent win amount: ${winAmount} coins.`,
    `Mission progress: ${missionProgress} of ${missionTarget}.`,
    "Style direction: cinematic, family-friendly, clean composition, no text overlay, no logos, no watermark.",
    "Focus on warm gold, deep navy, and magenta highlights.",
    "Single image, portrait framing, game UI friendly."
  ].join(" ");
}

function buildCaption(input: LynneArtInput): string {
  const missionProgress = safeNumber(input.missionProgress, 0);
  const missionTarget = safeNumber(input.missionTarget, 20);
  if (input.winTier === "mega") return "Lynne hit a mega moment. The whole lounge is glowing.";
  if (input.winTier === "big") return "Big win energy. Lynne is on a hot streak.";
  if (input.winTier === "small") return "Nice little win. Lynne keeps building momentum.";
  return `Lynne is chasing her mission: ${missionProgress}/${missionTarget} spins done.`;
}

function buildFallbackImageDataUrl(caption: string): string {
  const escapedCaption = caption
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1024" viewBox="0 0 720 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1637"/>
      <stop offset="55%" stop-color="#2e1457"/>
      <stop offset="100%" stop-color="#0b0d1f"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffd976"/>
      <stop offset="100%" stop-color="#ff9e2c"/>
    </linearGradient>
  </defs>
  <rect width="720" height="1024" fill="url(#bg)"/>
  <circle cx="130" cy="130" r="92" fill="#ffcf5a" opacity="0.22"/>
  <circle cx="580" cy="220" r="120" fill="#ff4bc7" opacity="0.18"/>
  <rect x="78" y="120" width="564" height="784" rx="30" fill="#111525" stroke="#3f4a7a" stroke-width="3"/>
  <rect x="114" y="164" width="492" height="292" rx="22" fill="url(#card)"/>
  <text x="360" y="254" text-anchor="middle" font-size="42" font-family="Verdana, Arial, sans-serif" fill="#332100" font-weight="700">
    Lynne's Luxe Lights
  </text>
  <text x="360" y="312" text-anchor="middle" font-size="22" font-family="Verdana, Arial, sans-serif" fill="#332100">
    AI art is ready when your API key is set
  </text>
  <text x="360" y="386" text-anchor="middle" font-size="18" font-family="Verdana, Arial, sans-serif" fill="#332100">
    Add OPENAI_API_KEY or GOOGLE_API_KEY in backend env
  </text>
  <rect x="114" y="510" width="492" height="312" rx="18" fill="#1a2140" stroke="#41508e" stroke-width="2"/>
  <text x="360" y="566" text-anchor="middle" font-size="30" font-family="Verdana, Arial, sans-serif" fill="#ffda83" font-weight="700">
    Story Beat
  </text>
  <foreignObject x="142" y="592" width="436" height="208">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="font-family: Verdana, Arial, sans-serif; font-size: 22px; line-height: 1.45; color: #e8edff; text-align: center;">
      ${escapedCaption}
    </div>
  </foreignObject>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function generateOpenAiImage(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "low"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OPENAI_IMAGE_ERROR: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OPENAI_IMAGE_ERROR: missing image bytes");
  return `data:image/png;base64,${b64}`;
}

async function generateGoogleImage(prompt: string, apiKey: string): Promise<string> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    "gemini-2.5-flash-image:generateContent?key=" +
    encodeURIComponent(apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GOOGLE_IMAGE_ERROR: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
    }>;
  };

  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  const b64 = imagePart?.inlineData?.data;
  const mimeType = imagePart?.inlineData?.mimeType ?? "image/png";

  if (!b64) throw new Error("GOOGLE_IMAGE_ERROR: missing image bytes");
  return `data:${mimeType};base64,${b64}`;
}

export async function generateLynneArt(input: LynneArtInput): Promise<LynneArtOutput> {
  const promptUsed = buildPrompt(input);
  const caption = buildCaption(input);
  const openAiKey = process.env.OPENAI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  if (openAiKey) {
    try {
      const imageDataUrl = await generateOpenAiImage(promptUsed, openAiKey);
      return { imageDataUrl, caption, promptUsed, provider: "openai" };
    } catch (error) {
      // Fall through to other providers/fallback.
      console.error(error);
    }
  }

  if (googleKey) {
    try {
      const imageDataUrl = await generateGoogleImage(promptUsed, googleKey);
      return { imageDataUrl, caption, promptUsed, provider: "google" };
    } catch (error) {
      // Fall through to fallback.
      console.error(error);
    }
  }

  return {
    imageDataUrl: buildFallbackImageDataUrl(caption),
    caption,
    promptUsed,
    provider: "fallback"
  };
}
