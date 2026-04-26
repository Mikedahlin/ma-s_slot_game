const REEL_COUNT = 5;
const STARTING_BALANCE = 250000;
const BET_LEVELS = [500, 1000, 2500, 5000, 10000, 25000, 50000];
const DEFAULT_BET_INDEX = 2;
const BONUS_TRIGGER_COUNT = 3;
const MEGA_JACKPOT_CHANCE = 0.00035; // 0.035% per spin
const MEGA_JACKPOT_PITY_STEP = 0.00003; // adds 0.003% per losing spin
const MEGA_JACKPOT_CHANCE_CAP = 0.004; // cap at 0.4%
const MEGA_JACKPOT_BASE_MIN = 1500000;
const MEGA_JACKPOT_BASE_MAX = 12000000;
const SYMBOLS = [
  { id: "seven", icon: "7️⃣", label: "Lucky 7", payout: 2800 },
  { id: "gem", icon: "💎", label: "Diamond", payout: 2200 },
  { id: "coin", icon: "🪙", label: "Gold Coin", payout: 1800 },
  { id: "cherry", icon: "🍒", label: "Cherry", payout: 1400 },
  { id: "clover", icon: "🍀", label: "Clover", payout: 1600 },
  { id: "star", icon: "⭐", label: "Super Star", payout: 2400 },
  { id: "bonus", icon: "🎁", label: "BONUS", payout: 0, isBonus: true },
];
const BONUS_SYMBOL_WEIGHT = 1.7;

const FALLBACK_THEMES = [
  {
    id: "neon-nights",
    title: "Lynne's Neon Nights",
    subtitle: "Electric reels and glowing jackpots",
    palette: { background: "#0f0928", primary: "#8f4dff", secondary: "#ff4fd9", accent: "#ffd549", glow: "#63f7ff" },
    symbolFlavorText: "Neon fortune symbols",
    bonusNames: ["Gift Grab", "Lucky Wheel", "Match Party"],
    celebrationMessages: ["Jackpot thunder!", "Big win for Lynne!", "Coins everywhere!"],
  },
  {
    id: "sunset-gold",
    title: "Sunset Gold Spins",
    subtitle: "Warm lights and rich rewards",
    palette: { background: "#251127", primary: "#ff8462", secondary: "#f4518a", accent: "#ffd166", glow: "#ffe08f" },
    symbolFlavorText: "Golden dusk symbols",
    bonusNames: ["Treasure Pick", "Sun Wheel", "Gem Match"],
    celebrationMessages: ["Golden win!", "Huge sunset payout!", "Treasure unlocked!"],
  },
  {
    id: "aqua-party",
    title: "Aqua Party Slots",
    subtitle: "Cool glow with high-energy bonuses",
    palette: { background: "#081a2f", primary: "#00c2ff", secondary: "#00f5d4", accent: "#ffed66", glow: "#7fffd4" },
    symbolFlavorText: "Ocean sparkle symbols",
    bonusNames: ["Splash Pick", "Tide Wheel", "Coral Match"],
    celebrationMessages: ["Wave of coins!", "Mega splash win!", "Bonus tide incoming!"],
  },
];

const BONUS_GAME_TYPES = ["pick", "wheel", "match"];

const dom = {
  themeTitle: document.getElementById("themeTitle"),
  themeSubtitle: document.getElementById("themeSubtitle"),
  balanceValue: document.getElementById("balanceValue"),
  betValue: document.getElementById("betValue"),
  lastWinValue: document.getElementById("lastWinValue"),
  jackpotValue: document.getElementById("jackpotValue"),
  dailyStreakValue: document.getElementById("dailyStreakValue"),
  muteBtn: document.getElementById("muteBtn"),
  volumeSlider: document.getElementById("volumeSlider"),
  spinBtn: document.getElementById("spinBtn"),
  betDownBtn: document.getElementById("betDownBtn"),
  betUpBtn: document.getElementById("betUpBtn"),
  reelStrip: document.getElementById("reelStrip"),
  slotMessage: document.getElementById("slotMessage"),
  bonusOverlay: document.getElementById("bonusOverlay"),
  bonusTitle: document.getElementById("bonusTitle"),
  bonusIntro: document.getElementById("bonusIntro"),
  bonusBody: document.getElementById("bonusBody"),
  bonusContinueBtn: document.getElementById("bonusContinueBtn"),
  fxLayer: document.getElementById("fxLayer"),
  payoutTable: document.getElementById("payoutTable"),
  bonusRoundList: document.getElementById("bonusRoundList"),
  cabinet: document.querySelector(".cabinet"),
};

const state = {
  balance: STARTING_BALANCE,
  betIndex: DEFAULT_BET_INDEX,
  lastWin: 0,
  reels: Array.from({ length: REEL_COUNT }, () => SYMBOLS[0]),
  spinInProgress: false,
  muted: false,
  currentThemeIndex: 0,
  spinCount: 0,
  totalWagered: 0,
  activeBonus: null,
  controlsLocked: false,
  dailyStreak: 1,
  jackpotPool: 2400000,
  jackpotChanceBoost: 0,
};

class AudioManager {
  constructor() {
    this.muted = false;
    this.players = new Map();
    this.volume = 0.8;
    this.lastPlayedAt = new Map();
    this.audioContext = null;
    this.filesByEvent = {
      spinStart: ["assets/audio/reel-spin.wav"],
      reelStop: ["assets/audio/bonus-round-4.wav"],
      win: ["assets/audio/casino-win.wav"],
      bigWin: [
        "assets/audio/casino-win.wav",
        "assets/audio/jackpot.wav",
        "assets/audio/ma-s_slot_music.wav",
        "assets/audio/mas_slot_music.wav",
        "assets/audio/moms-slot-music.wav",
      ],
      bonus: [
        "assets/audio/bonus-round-1.wav",
        "assets/audio/bonus-round-2.wav",
        "assets/audio/bonus-round-3.wav",
        "assets/audio/bonus-round-6.wav",
        "assets/audio/bonus-round-7.wav",
      ],
      button: ["assets/audio/bonus-round-5.wav"],
    };
  }

  async preload() {
    const allPaths = new Set(Object.values(this.filesByEvent).flat());
    for (const path of allPaths) {
      const probe = new Audio(path);
      probe.preload = "auto";
      probe.volume = this.volume;
      this.players.set(path, probe);
    }
  }

  setMuted(nextMuted) {
    this.muted = nextMuted;
    if (this.muted) {
      this.players.forEach((player) => {
        try {
          player.pause();
          player.currentTime = 0;
        } catch {
          // ignore
        }
      });
    }
  }

  setVolume(nextVolume) {
    const clamped = Math.max(0, Math.min(1, nextVolume));
    // Curve the slider so changes are finer at lower volumes.
    this.volume = clamped * clamped;
    this.players.forEach((player) => {
      player.volume = this.volume;
    });
  }

  async play(eventName) {
    if (this.muted) return;
    const now = Date.now();
    const minIntervalMsByEvent = { reelStop: 160, button: 80 };
    const minInterval = minIntervalMsByEvent[eventName] || 0;
    const lastAt = this.lastPlayedAt.get(eventName) || 0;
    if (minInterval > 0 && now - lastAt < minInterval) {
      return;
    }
    this.lastPlayedAt.set(eventName, now);
    const paths = this.filesByEvent[eventName] || [];
    let played = false;

    if (paths.length > 0) {
      const path = paths[Math.floor(Math.random() * paths.length)];
      let player = this.players.get(path);
      if (!player) {
        player = new Audio(path);
        this.players.set(path, player);
      }
      try {
        player.currentTime = 0;
        player.volume = this.volume;
        await player.play();
        played = true;
      } catch {
        // Fall through to synthesized backup sound.
      }
    }

    if (!played && eventName === "bigWin") {
      // Never synth fallback for jackpot/big-win moments.
      return;
    }
    if (!played) {
      this.playFallbackTone(eventName);
    }
  }

  getContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioContext) {
      this.audioContext = new AudioContextClass();
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  playFallbackTone(eventName) {
    const ctx = this.getContext();
    if (!ctx) return;

    const patterns = {
      button: [420],
      spinStart: [180, 220],
      reelStop: [260],
      win: [440, 560],
      bigWin: [520, 660, 840],
      bonus: [330, 440, 550],
    };
    const frequencies = patterns[eventName] || [300];
    frequencies.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.08;
      osc.type = eventName === "bigWin" ? "sawtooth" : "triangle";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.12 * this.volume), start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.22);
    });
  }
}

const audioManager = new AudioManager();
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCash(value) {
  return `$${Math.max(0, Math.round(value))}`;
}

function setMessage(text) {
  dom.slotMessage.textContent = text;
}

function updateHUD() {
  dom.balanceValue.textContent = formatCash(state.balance);
  dom.betValue.textContent = formatCash(BET_LEVELS[state.betIndex]);
  dom.lastWinValue.textContent = formatCash(state.lastWin);
  if (dom.jackpotValue) {
    dom.jackpotValue.textContent = formatCash(state.jackpotPool);
  }
  if (dom.dailyStreakValue) {
    dom.dailyStreakValue.textContent = `Day ${state.dailyStreak}`;
  }
  dom.muteBtn.textContent = state.muted ? "Sound: Off" : "Sound: On";
  dom.muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
  if (dom.volumeSlider) {
    dom.volumeSlider.value = String(Math.round(Math.sqrt(audioManager.volume) * 100));
  }
  dom.betDownBtn.disabled = state.controlsLocked || state.betIndex === 0;
  dom.betUpBtn.disabled = state.controlsLocked || state.betIndex === BET_LEVELS.length - 1;
}

function toIsoDateString(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function daysBetweenIso(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

function applyDailyLoginReward() {
  const today = toIsoDateString(new Date());
  const savedLastClaim = localStorage.getItem("momSlot:lastDailyClaim");
  const savedStreak = Number(localStorage.getItem("momSlot:dailyStreak") || "1");
  let streak = Math.max(1, savedStreak);

  if (!savedLastClaim) {
    streak = 1;
  } else {
    const gapDays = daysBetweenIso(savedLastClaim, today);
    if (gapDays === 0) {
      state.dailyStreak = streak;
      return;
    }
    if (gapDays === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  const cappedStreak = Math.min(streak, 30);
  const reward = 25000 + cappedStreak * 8000;
  state.balance += reward;
  state.dailyStreak = cappedStreak;
  state.lastWin = reward;
  localStorage.setItem("momSlot:lastDailyClaim", today);
  localStorage.setItem("momSlot:dailyStreak", String(cappedStreak));
  maybeLaunchCoinBurst(Math.min(18 + cappedStreak, 42));
  triggerWinCelebration(cappedStreak >= 7 ? "big" : "small");
  setMessage(`Daily Love Bonus: ${formatCash(reward)}! Streak Day ${cappedStreak}. Come back tomorrow for more.`);
}

function renderReels({ spinningIndexes = [] } = {}) {
  dom.reelStrip.innerHTML = "";
  const chainIndexes = getLongestBonusChainIndexes(state.reels);
  const chainSet = new Set(chainIndexes);

  state.reels.forEach((symbol, index) => {
    const cell = document.createElement("article");
    cell.className = `reel-cell reel-cell--${symbol.id}`;
    if (spinningIndexes.includes(index)) cell.classList.add("spinning");
    if (symbol.isBonus) {
      cell.classList.add("bonus-hit");
      if (chainSet.has(index)) cell.classList.add("bonus-chain");
      if (chainSet.has(index) && chainSet.has(index + 1)) {
        cell.classList.add("bonus-link-right");
      }
    }
    const symbolAsset = getSymbolAsset(symbol.id);
    cell.innerHTML = `
      <div class="symbol-bg"></div>
      <div class="symbol-art">
        <div class="symbol-icon" data-fallback="${symbol.icon}">
          <img class="symbol-img" src="${symbolAsset}" alt="${symbol.label}" loading="eager"
            onerror="this.style.display='none'; this.parentElement.classList.add('img-fallback');" />
        </div>
      </div>
      <div class="symbol-name">${symbol.label}</div>
    `;
    dom.reelStrip.appendChild(cell);
  });
}

function getSymbolAsset(symbolId) {
  const assets = {
    seven: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/0037-fe0f-20e3.svg",
    gem: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f48e.svg",
    coin: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa99.svg",
    cherry: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f352.svg",
    clover: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f340.svg",
    star: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2b50.svg",
    bonus: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f381.svg",
  };
  return assets[symbolId] || assets.star;
}

function randomSymbol() {
  const weightedSymbols = SYMBOLS.flatMap((symbol) => {
    if (symbol.isBonus) {
      const bonusCopies = Math.max(1, Math.round(BONUS_SYMBOL_WEIGHT));
      return Array.from({ length: bonusCopies }, () => symbol);
    }
    return [symbol];
  });
  return weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
}

function calcWinPayout(reels) {
  const counts = reels.reduce((acc, symbol) => {
    acc[symbol.id] = (acc[symbol.id] || 0) + 1;
    return acc;
  }, {});

  let payout = 0;
  const betMultiplier = BET_LEVELS[state.betIndex] / BET_LEVELS[0];
  for (const symbol of SYMBOLS) {
    if (symbol.isBonus) continue;
    const count = counts[symbol.id] || 0;
    if (count >= 3) payout += symbol.payout * (count - 2) * betMultiplier;
  }

  const maxCount = Math.max(...Object.values(counts));
  const isBigWin = payout >= BET_LEVELS[state.betIndex] * 4 || maxCount >= 6;
  return { payout, isBigWin };
}

function maybeHitMegaJackpot() {
  const effectiveChance = Math.min(MEGA_JACKPOT_CHANCE + state.jackpotChanceBoost, MEGA_JACKPOT_CHANCE_CAP);
  if (Math.random() >= effectiveChance) {
    state.jackpotChanceBoost = Math.min(state.jackpotChanceBoost + MEGA_JACKPOT_PITY_STEP, MEGA_JACKPOT_CHANCE_CAP - MEGA_JACKPOT_CHANCE);
    return null;
  }
  const betMultiplier = BET_LEVELS[state.betIndex] / BET_LEVELS[0];
  const rawPayout = state.jackpotPool * (0.92 + Math.random() * 0.16) * betMultiplier;
  state.jackpotChanceBoost = 0;
  return Math.floor(rawPayout);
}


function maybeLaunchCoinBurst(count = 16) {
  for (let i = 0; i < count; i += 1) {
    const coin = document.createElement("span");
    coin.className = "fx-coin";
    coin.textContent = Math.random() > 0.2 ? "🪙" : "💰";
    coin.style.left = `${Math.random() * 100}%`;
    coin.style.animationDuration = `${1.1 + Math.random() * 1.2}s`;
    dom.fxLayer.appendChild(coin);
    setTimeout(() => coin.remove(), 2300);
  }
}

function triggerWinCelebration(tier) {
  if (!dom.cabinet) return;
  dom.cabinet.classList.remove("celebrate-small", "celebrate-big", "celebrate-mega");
  const className = tier === "mega" ? "celebrate-mega" : tier === "big" ? "celebrate-big" : "celebrate-small";
  dom.cabinet.classList.add(className);
  setTimeout(() => dom.cabinet?.classList.remove(className), tier === "mega" ? 2200 : 1400);
}

async function popStoppedReel(reelIndex) {
  const cells = Array.from(dom.reelStrip.querySelectorAll(".reel-cell"));
  const target = cells[reelIndex];
  if (!target) return;
  target.classList.add("stop-pop");
  await delay(120);
  target.classList.remove("stop-pop");
}

function applyTheme(theme) {
  document.documentElement.style.setProperty("--bg", theme.palette.background);
  document.documentElement.style.setProperty("--primary", theme.palette.primary);
  document.documentElement.style.setProperty("--secondary", theme.palette.secondary);
  document.documentElement.style.setProperty("--accent", theme.palette.accent);
  document.documentElement.style.setProperty("--glow", theme.palette.glow);
  const hasThemeImage = Boolean(theme.backgroundImageDataUrl);
  document.body.classList.toggle("has-theme-image", hasThemeImage);
  if (hasThemeImage) {
    document.documentElement.style.setProperty("--theme-image", `url("${theme.backgroundImageDataUrl}")`);
  } else {
    document.documentElement.style.setProperty("--theme-image", "none");
  }
  dom.themeTitle.textContent = theme.title;
  dom.themeSubtitle.textContent = theme.subtitle;
}

function renderPayoutTable() {
  dom.payoutTable.innerHTML = "";
  const betMultiplier = BET_LEVELS[state.betIndex] / BET_LEVELS[0];
  SYMBOLS.filter((symbol) => !symbol.isBonus).forEach((symbol) => {
    const li = document.createElement("li");
    li.textContent = `${symbol.icon} ${symbol.label}: 3+ match pays ${formatCash(symbol.payout * betMultiplier)} base`;
    dom.payoutTable.appendChild(li);
  });
}

function getLongestConnectedBonusChain(reels) {
  let best = 0;
  let streak = 0;
  reels.forEach((symbol) => {
    if (symbol.isBonus) {
      streak += 1;
      if (streak > best) best = streak;
    } else {
      streak = 0;
    }
  });
  return best;
}

function getBonusCount(reels) {
  return reels.reduce((count, symbol) => count + (symbol.isBonus ? 1 : 0), 0);
}

function getLongestBonusChainIndexes(reels) {
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  reels.forEach((symbol, index) => {
    if (symbol.isBonus) {
      if (currentStart === -1) currentStart = index;
      currentLength += 1;
      if (currentLength > bestLength) {
        bestLength = currentLength;
        bestStart = currentStart;
      }
    } else {
      currentStart = -1;
      currentLength = 0;
    }
  });

  if (bestStart === -1 || bestLength === 0) return [];
  return Array.from({ length: bestLength }, (_, i) => bestStart + i);
}

async function animateBonusLinePulse(indexes) {
  if (!indexes.length) return;
  const cells = Array.from(dom.reelStrip.querySelectorAll(".reel-cell"));
  indexes.forEach((index) => {
    if (cells[index]) cells[index].classList.add("pulse-bonus");
  });
  await delay(950);
  indexes.forEach((index) => {
    if (cells[index]) cells[index].classList.remove("pulse-bonus");
  });
}

async function getNextTheme() {
  const nextIndex = (state.currentThemeIndex + 1) % FALLBACK_THEMES.length;
  const fallbackTheme = FALLBACK_THEMES[nextIndex];

  try {
    const response = await fetch("/api/ai/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worldStage: (state.spinCount % 5) + 1,
        reason: "spin-cycle-update",
        currentTheme: fallbackTheme.title,
      }),
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload && payload.palette && payload.themeName) {
        state.currentThemeIndex = nextIndex;
        return {
          ...fallbackTheme,
          title: payload.themeName,
          subtitle: payload.caption || fallbackTheme.subtitle,
          backgroundImageDataUrl: payload.backgroundImageDataUrl || null,
          palette: {
            background: payload.palette.surface || fallbackTheme.palette.background,
            primary: payload.palette.shadow || fallbackTheme.palette.primary,
            secondary: payload.palette.glow || fallbackTheme.palette.secondary,
            accent: payload.palette.accent || fallbackTheme.palette.accent,
            glow: payload.palette.glowSoft || payload.palette.glow || fallbackTheme.palette.glow,
          },
        };
      }
    }
  } catch {
    // No backend configured in this static project, fallback below.
  }

  state.currentThemeIndex = nextIndex;
  return fallbackTheme;
}

function openBonusOverlay(title, intro) {
  dom.bonusTitle.textContent = title;
  dom.bonusIntro.textContent = intro;
  dom.bonusBody.innerHTML = "";
  dom.bonusContinueBtn.classList.add("hidden");
  dom.bonusOverlay.classList.remove("hidden");
  dom.bonusOverlay.setAttribute("aria-hidden", "false");
}

function closeBonusOverlay() {
  dom.bonusOverlay.classList.add("hidden");
  dom.bonusOverlay.setAttribute("aria-hidden", "true");
  state.activeBonus = null;
  setMessage("Bonus completed. Spin again!");
}

function finishBonus(reward) {
  const betMultiplier = BET_LEVELS[state.betIndex] / BET_LEVELS[0];
  const loyaltyMultiplier = 1 + Math.min(2.5, state.totalWagered / 2000 + state.spinCount / 120);
  const scaledReward = reward * betMultiplier * loyaltyMultiplier * 3.2;
  state.balance += scaledReward;
  state.jackpotPool += Math.floor(BET_LEVELS[state.betIndex] * 0.7);
  state.lastWin = scaledReward;
  updateHUD();
  maybeLaunchCoinBurst(24);
  dom.bonusContinueBtn.classList.remove("hidden");
  dom.bonusContinueBtn.onclick = closeBonusOverlay;
}

function startPickBonus() {
  openBonusOverlay("Pick-a-Prize Bonus", "Pick 2 gift boxes to reveal your reward.");
  const rewards = [12000, 18000, 25000, 35000, 55000, 80000, 120000, 250000].sort(() => Math.random() - 0.5);
  const picksAllowed = 2;
  let picks = 0;
  let total = 0;

  const grid = document.createElement("div");
  grid.className = "pick-grid";

  rewards.forEach((reward) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pick-item";
    button.textContent = "🎁 Pick";
    button.onclick = async () => {
      if (button.disabled || picks >= picksAllowed) return;
      picks += 1;
      total += reward;
      button.disabled = true;
      button.textContent = `+${formatCash(reward)}`;
      await audioManager.play("button");
      if (picks >= picksAllowed) {
        dom.bonusIntro.textContent = `Great picks! Total bonus: ${formatCash(total)}`;
        finishBonus(total);
      }
    };
    grid.appendChild(button);
  });

  dom.bonusBody.appendChild(grid);
}

function startWheelBonus() {
  openBonusOverlay("Wheel Spin Bonus", "Push SPIN to launch the wheel. Watch the pointer click as it slows.");
  const segments = [25000, 50000, 80000, 120000, 180000, 250000, 400000, 900000];
  const labels = ["🍒", "💎", "7️⃣", "💰", "⭐", "🎁", "🍀", "🪙"];
  const wheelShell = document.createElement("div");
  wheelShell.className = "wheel-shell";
  const pointer = document.createElement("div");
  pointer.className = "wheel-pointer";
  const wheel = document.createElement("div");
  wheel.className = "wheel";
  const wheelCenter = document.createElement("div");
  wheelCenter.className = "wheel-center";
  wheelCenter.textContent = "SPIN";
  labels.forEach((label, index) => {
    const item = document.createElement("span");
    item.className = "wheel-label";
    item.style.setProperty("--i", String(index));
    item.textContent = label;
    wheel.appendChild(item);
  });
  wheel.appendChild(wheelCenter);
  wheelShell.appendChild(pointer);
  wheelShell.appendChild(wheel);
  const spinButton = document.createElement("button");
  spinButton.type = "button";
  spinButton.className = "wheel-spin-btn";
  spinButton.textContent = "Spin Bonus Wheel";

  spinButton.onclick = async () => {
    spinButton.disabled = true;
    await audioManager.play("button");
    const index = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    // Labels are positioned from top-center, so segment center must use the same frame.
    const targetCenterAngle = ((-90 + index * segmentAngle + segmentAngle / 2) + 360) % 360;
    const pointerAngle = 270; // top-center in CSS transform angle space
    const turns = 5 + Math.floor(Math.random() * 3);
    const totalRotation = turns * 360 + (pointerAngle - targetCenterAngle + 360) % 360;

    const durationMs = 3300;
    const start = performance.now();
    let lastTickBucket = -1;
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const angle = totalRotation * eased;
      wheel.style.transform = `rotate(${angle}deg)`;

      const bucket = Math.floor(angle / (segmentAngle / 2));
      if (bucket !== lastTickBucket) {
        lastTickBucket = bucket;
        audioManager.play("reelStop");
        pointer.classList.remove("tick");
        void pointer.offsetWidth;
        pointer.classList.add("tick");
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
    await delay(durationMs + 120);
    const reward = segments[index];
    dom.bonusIntro.textContent = `Wheel reward: ${formatCash(reward)}!`;
    finishBonus(reward);
  };

  dom.bonusBody.appendChild(wheelShell);
  dom.bonusBody.appendChild(spinButton);
}

function startMatchBonus() {
  openBonusOverlay("Match Game Bonus", "Clear 2 rounds. Match symbols to build streak multipliers.");
  const roundConfigs = [
    { pairs: [12000, 22000, 45000, 90000], label: "Round 1/2" },
    { pairs: [25000, 55000, 120000, 250000, 600000], label: "Round 2/2" },
  ];
  const cardIcons = ["🍒", "💎", "7️⃣", "🪙", "⭐", "🍀", "🎁"];
  let roundIndex = 0;
  let total = 0;
  let streak = 0;
  let missesLeft = 4;

  const grid = document.createElement("div");
  grid.className = "match-grid";
  const meta = document.createElement("div");
  meta.className = "match-meta";
  dom.bonusBody.appendChild(meta);
  dom.bonusBody.appendChild(grid);

  const startRound = () => {
    const round = roundConfigs[roundIndex];
    const deck = [...round.pairs, ...round.pairs]
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({
        id,
        value,
        icon: cardIcons[round.pairs.indexOf(value)] || "⭐",
        revealed: true,
        matched: false,
      }));
    const picks = [];
    let lock = false;

    const render = () => {
      meta.textContent = `${round.label} · Streak x${Math.max(1, streak)} · Misses: ${missesLeft} · Pot: ${formatCash(total)}`;
      grid.innerHTML = "";
      deck.forEach((card) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "match-card";
        if (card.revealed || card.matched) btn.classList.add("revealed");
        btn.innerHTML = `
          <span class="card-face card-front">❓</span>
          <span class="card-face card-back">${card.icon}<small>${formatCash(card.value)}</small></span>
        `;
        btn.disabled = lock || card.revealed || card.matched;
        btn.onclick = async () => {
          if (lock || card.revealed || card.matched) return;
          card.revealed = true;
          picks.push(card);
          await audioManager.play("button");
          render();
          if (picks.length === 2) {
            lock = true;
            await delay(580);
            const [a, b] = picks;
            if (a.value === b.value) {
              a.matched = true;
              b.matched = true;
              streak += 1;
              const won = a.value * Math.max(1, streak);
              total += won;
              dom.bonusIntro.textContent = `MATCH! ${a.icon} paid ${formatCash(won)} (streak x${streak}).`;
            } else {
              streak = 0;
              a.revealed = false;
              b.revealed = false;
              missesLeft -= 1;
              dom.bonusIntro.textContent = missesLeft > 0 ? "No match. Try again." : "Out of misses! Cashing out.";
            }
            picks.length = 0;
            lock = false;
            render();
            if (missesLeft <= 0) {
              finishBonus(Math.max(40000, total));
              return;
            }
            const allMatched = deck.every((entry) => entry.matched);
            if (allMatched) {
              if (roundIndex < roundConfigs.length - 1) {
                roundIndex += 1;
                dom.bonusIntro.textContent = "Round cleared! Final round begins!";
                await delay(700);
                startRound();
              } else {
                finishBonus(Math.max(120000, total));
              }
            }
          }
        };
        grid.appendChild(btn);
      });
    };

    render();
    setTimeout(() => {
      deck.forEach((card) => {
        if (!card.matched) card.revealed = false;
      });
      render();
    }, 1100);
  };

  startRound();
}

function launchBonusGame() {
  const theme = FALLBACK_THEMES[state.currentThemeIndex];
  const gameType = BONUS_GAME_TYPES[Math.floor(Math.random() * BONUS_GAME_TYPES.length)];
  state.activeBonus = gameType;
  audioManager.play("bonus");
  if (gameType === "pick") return startPickBonus(theme.bonusNames[0] || "Pick Bonus");
  if (gameType === "wheel") return startWheelBonus(theme.bonusNames[1] || "Wheel Bonus");
  return startMatchBonus(theme.bonusNames[2] || "Match Bonus");
}

async function spin() {
  if (state.spinInProgress || state.activeBonus || state.controlsLocked) return;
  const spinCost = BET_LEVELS[state.betIndex];
  if (state.balance < spinCost) {
    setMessage("Not enough balance. Bonus wins can refill your credits.");
    return;
  }

  state.spinInProgress = true;
  state.controlsLocked = true;
  state.balance -= spinCost;
  state.totalWagered += spinCost;
  state.lastWin = 0;
  updateHUD();
  dom.spinBtn.disabled = true;
  setMessage("Spinning...");
  audioManager.play("spinStart");

  try {
    const spinningIndexes = Array.from({ length: REEL_COUNT }, (_, i) => i);
    renderReels({ spinningIndexes });

    const nextReels = [];
    for (let i = 0; i < REEL_COUNT; i += 1) {
      await delay(180);
      nextReels.push(randomSymbol());
      const partial = [...nextReels, ...state.reels.slice(nextReels.length)];
      state.reels = partial;
      renderReels({ spinningIndexes: spinningIndexes.slice(i + 1) });
      audioManager.play("reelStop");
      await popStoppedReel(i);
    }

    state.reels = nextReels;
    renderReels();

    const bonusChain = getLongestConnectedBonusChain(state.reels);
    const bonusCount = getBonusCount(state.reels);
    const { payout, isBigWin } = calcWinPayout(state.reels);
    state.spinCount += 1;

    if (payout > 0) {
      const tier = payout >= 420 ? "mega" : isBigWin ? "big" : "small";
      state.balance += payout;
      state.lastWin = payout;
      updateHUD();
      maybeLaunchCoinBurst(tier === "mega" ? 42 : tier === "big" ? 28 : 14);
      triggerWinCelebration(tier);
      setMessage(
        tier === "mega"
          ? `MEGA WIN!!! ${formatCash(payout)}`
          : tier === "big"
            ? `BIG WIN! ${formatCash(payout)}`
            : `Win! ${formatCash(payout)}`
      );
      audioManager.play(tier === "small" ? "win" : "bigWin");
    } else {
      setMessage("No line win. Try again!");
    }

    const megaJackpot = maybeHitMegaJackpot();
    if (megaJackpot) {
      state.balance += megaJackpot;
      state.lastWin += megaJackpot;
      state.jackpotPool = Math.floor(MEGA_JACKPOT_BASE_MIN + Math.random() * (MEGA_JACKPOT_BASE_MAX - MEGA_JACKPOT_BASE_MIN));
      updateHUD();
      maybeLaunchCoinBurst(72);
      triggerWinCelebration("mega");
      audioManager.play("bigWin");
      setMessage(`💥 ULTRA MEGA JACKPOT!!! ${formatCash(megaJackpot)} 💥`);
    } else {
      state.jackpotPool += Math.floor(spinCost * 0.22);
      updateHUD();
    }

    if (bonusCount >= BONUS_TRIGGER_COUNT) {
      if (bonusChain >= BONUS_TRIGGER_COUNT) {
        setMessage(`BONUS LINE CONNECTED (${bonusChain})! Lynne enters a bonus game.`);
      } else {
        setMessage(`BONUS TRIGGERED (${bonusCount} bonus symbols)! Lynne enters a bonus game.`);
      }
      const chainIndexes = getLongestBonusChainIndexes(state.reels);
      const pulseIndexes = chainIndexes.length ? chainIndexes : state.reels.map((symbol, index) => (symbol.isBonus ? index : -1)).filter((index) => index >= 0);
      await animateBonusLinePulse(pulseIndexes);
      await delay(160);
      launchBonusGame();
    }

    if (state.spinCount % 4 === 0 && !state.activeBonus) {
      const theme = await getNextTheme();
      applyTheme(theme);
    }
  } finally {
    state.spinInProgress = false;
    state.controlsLocked = false;
    dom.spinBtn.disabled = false;
    updateHUD();
  }
}

function init() {
  applyTheme(FALLBACK_THEMES[state.currentThemeIndex]);
  state.dailyStreak = Math.max(1, Number(localStorage.getItem("momSlot:dailyStreak") || "1"));
  applyDailyLoginReward();
  renderReels();
  updateHUD();
  renderPayoutTable();
  audioManager.preload();

  dom.spinBtn.addEventListener("click", async () => {
    audioManager.play("button");
    await spin();
  });

  dom.muteBtn.addEventListener("click", () => {
    state.muted = !state.muted;
    audioManager.setMuted(state.muted);
    updateHUD();
  });

  if (dom.volumeSlider) {
    dom.volumeSlider.addEventListener("input", () => {
      const normalized = Number(dom.volumeSlider.value) / 100;
      audioManager.setVolume(normalized);
      updateHUD();
    });
  }

  dom.betDownBtn.addEventListener("click", () => {
    if (state.betIndex > 0 && !state.controlsLocked && !state.activeBonus) {
      state.betIndex -= 1;
      updateHUD();
      renderPayoutTable();
      setMessage(`Bet set to ${formatCash(BET_LEVELS[state.betIndex])}.`);
      audioManager.play("button");
    }
  });

  dom.betUpBtn.addEventListener("click", () => {
    if (state.betIndex < BET_LEVELS.length - 1 && !state.controlsLocked && !state.activeBonus) {
      state.betIndex += 1;
      updateHUD();
      renderPayoutTable();
      setMessage(`Bet set to ${formatCash(BET_LEVELS[state.betIndex])}.`);
      audioManager.play("button");
    }
  });
}

init();
