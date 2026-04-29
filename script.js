const ROWS = 3;
const COLS = 5;
const BONUS_GUARANTEE_SPINS = 10;

const STARTING_BALANCE = 250000;
const BET_LEVELS = [500, 1000, 2500, 5000, 10000, 25000, 50000];
const DEFAULT_BET_INDEX = 2;

const SYMBOLS = [
  { id: "seven", label: "Lucky 7", short: "7", image: "assets/images/seven.jpg", pays: { 3: 8, 4: 20, 5: 50 } },
  { id: "gem", label: "Diamond", short: "DIA", image: "assets/images/diamond.jpg", pays: { 3: 6, 4: 15, 5: 38 } },
  { id: "coin", label: "Gold Coin", short: "COIN", image: "assets/images/coin.jpg", pays: { 3: 5, 4: 12, 5: 30 } },
  { id: "cherry", label: "Cherry", short: "CH", image: "assets/images/cherry.jpg", pays: { 3: 3, 4: 8, 5: 20 } },
  { id: "clover", label: "Clover", short: "CLV", image: "assets/images/clover.jpg", pays: { 3: 4, 4: 10, 5: 24 } },
  { id: "star", label: "Lucky Star", short: "STAR", image: "assets/images/star.jpg", pays: { 3: 5, 4: 12, 5: 28 } },
  { id: "bonus", label: "Bonus", short: "BONUS", image: "assets/images/bonus.jpg", isBonus: true },
  { id: "bell", label: "Bell", short: "BELL", image: "assets/images/bell.jpg", pays: { 3: 4, 4: 10, 5: 25 } },
  { id: "bar", label: "Bar", short: "BAR", image: "assets/images/bar.jpg", pays: { 3: 6, 4: 15, 5: 35 } },
  { id: "orange", label: "Orange", short: "OR", image: "assets/images/orange.jpg", pays: { 3: 3, 4: 8, 5: 18 } },
];

const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((symbol) => [symbol.id, symbol]));
const SYMBOL_FOCAL_POINTS = {
  seven: "50% 50%",
  gem: "50% 52%",
  coin: "50% 54%",
  cherry: "50% 56%",
  clover: "50% 56%",
  star: "50% 55%",
  bonus: "50% 58%",
  bell: "50% 56%",
  bar: "50% 54%",
  orange: "50% 56%",
};
const BASE_SYMBOL_WEIGHTS = {
  seven: 8,
  gem: 10,
  coin: 12,
  cherry: 14,
  clover: 12,
  star: 10,
  bonus: 4,
  bell: 11,
  bar: 9,
  orange: 13,
};

const GAME_PACKS = [
  {
    id: "starlight",
    name: "Lynne's Starlight Jackpot",
    subtitle: "High-energy Vegas floor with stronger wheel spikes",
    palette: { bg: "#080d16", bgSoft: "#111b2d", gold: "#f1c66d", blue: "#6ad9ff", red: "#ff664d" },
    weightTuning: { seven: 1, gem: 1, coin: 1, cherry: 1, clover: 1, star: 1, bonus: 1 },
    jackpotSeed: { mini: 240000, major: 920000, grand: 2800000 },
    jackpotOdds: { mini: 0.014, major: 0.003, grand: 0.00055 },
    bonusModes: ["wheel", "pick", "freespins"],
    bonusDescriptions: [
      "Power Wheel: 8 segments from 8x to 60x bet.",
      "Treasure Pick: 4 picks from 12 hidden cards.",
      "Free Spins Burst: 5 free spins with 2x line wins.",
    ],
  },
  {
    id: "velvet-gold",
    name: "Velvet Gold Palace",
    subtitle: "Smoother wins and frequent medium payouts",
    palette: { bg: "#150f09", bgSoft: "#2a1f11", gold: "#f5cc79", blue: "#8acfff", red: "#f27b45" },
    weightTuning: { seven: 1, gem: 1, coin: 1.1, cherry: 1.15, clover: 1.05, star: 1, bonus: 1.1 },
    jackpotSeed: { mini: 260000, major: 860000, grand: 2400000 },
    jackpotOdds: { mini: 0.015, major: 0.0028, grand: 0.0005 },
    bonusModes: ["pick", "freespins", "wheel"],
    bonusDescriptions: [
      "Treasure Pick: tighter card pool with steadier rewards.",
      "Free Spins Burst: repeat line chances at 2x value.",
      "Power Wheel: balanced middle segments.",
    ],
  },
  {
    id: "emerald-night",
    name: "Emerald Night Lounge",
    subtitle: "Bigger swings with heavier jackpot growth",
    palette: { bg: "#07130f", bgSoft: "#10261f", gold: "#dfc17a", blue: "#78f0cf", red: "#ff7a65" },
    weightTuning: { seven: 0.95, gem: 0.95, coin: 1, cherry: 1.2, clover: 1.05, star: 0.95, bonus: 0.95 },
    jackpotSeed: { mini: 230000, major: 980000, grand: 3200000 },
    jackpotOdds: { mini: 0.012, major: 0.0026, grand: 0.00065 },
    bonusModes: ["freespins", "wheel", "pick"],
    bonusDescriptions: [
      "Free Spins Burst: high-variance 2x spin set.",
      "Power Wheel: stronger high-end top segment.",
      "Treasure Pick: wider spread card values.",
    ],
  },
];

const BONUS_BANNERS = {
  pick: "assets/images/bonus-pick.jpg",
  wheel: "assets/images/bonus-wheel.jpg",
  freespins: "assets/images/bonus-match.jpg",
};
const MEGA_777_IMAGE = "assets/images/777-slot.png";

const PAYLINES = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
];

const dom = {
  themeTitle: document.getElementById("themeTitle"),
  themeSubtitle: document.getElementById("themeSubtitle"),
  aiGuideText: document.getElementById("aiGuideText"),
  gameSelect: document.getElementById("gameSelect"),
  balanceValue: document.getElementById("balanceValue"),
  betValue: document.getElementById("betValue"),
  lastWinValue: document.getElementById("lastWinValue"),
  miniJackpotValue: document.getElementById("miniJackpotValue"),
  majorJackpotValue: document.getElementById("majorJackpotValue"),
  grandJackpotValue: document.getElementById("grandJackpotValue"),
  dailyStreakValue: document.getElementById("dailyStreakValue"),
  bonusMeterValue: document.getElementById("bonusMeterValue"),
  muteBtn: document.getElementById("muteBtn"),
  volumeSlider: document.getElementById("volumeSlider"),
  betDownBtn: document.getElementById("betDownBtn"),
  betUpBtn: document.getElementById("betUpBtn"),
  spinBtn: document.getElementById("spinBtn"),
  slotMessage: document.getElementById("slotMessage"),
  reelStrip: document.getElementById("reelStrip"),
  payoutTable: document.getElementById("payoutTable"),
  bonusRoundList: document.getElementById("bonusRoundList"),
  bonusOverlay: document.getElementById("bonusOverlay"),
  bonusTitle: document.getElementById("bonusTitle"),
  bonusIntro: document.getElementById("bonusIntro"),
  bonusBody: document.getElementById("bonusBody"),
  bonusContinueBtn: document.getElementById("bonusContinueBtn"),
  fxLayer: document.getElementById("fxLayer"),
  cabinet: document.querySelector(".cabinet"),
};

const state = {
  balance: STARTING_BALANCE,
  betIndex: DEFAULT_BET_INDEX,
  lastWin: 0,
  currentGameIndex: 0,
  spinInProgress: false,
  controlsLocked: false,
  activeBonus: null,
  muted: false,
  spinCount: 0,
  spinsSinceBonus: 0,
  totalWagered: 0,
  dailyStreak: 1,
  jackpots: { mini: 0, major: 0, grand: 0 },
  grandPitySpins: 0,
  grid: [],
  reelViews: [],
};

class AudioManager {
  constructor() {
    this.muted = false;
    this.players = new Map();
    this.volume = 0.85;
    this.lastPlayedAt = new Map();
    this.audioContext = null;
    this.filesByEvent = {
      spinStart: ["assets/audio/reel-spin.wav"],
      reelStop: ["assets/audio/bonus-round-4.wav"],
      button: ["assets/audio/bonus-round-5.wav"],
      win: ["assets/audio/casino-win.wav"],
      bigWin: ["assets/audio/casino-win.wav", "assets/audio/bonus-round-7.wav"],
      jackpot: ["assets/audio/jackpot.wav"],
      bonusStart: ["assets/audio/bonus-round-1.wav"],
      bonusReveal: ["assets/audio/bonus-round-2.wav"],
      bonusSpin: ["assets/audio/bonus-round-3.wav"],
      bonusMiss: ["assets/audio/bonus-round-6.wav"],
      bonusEnd: ["assets/audio/bonus-round-7.wav"],
    };
  }

  preload() {
    const allFiles = new Set(Object.values(this.filesByEvent).flat());
    allFiles.forEach((path) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.volume = this.volume;
      this.players.set(path, audio);
    });
  }

  setMuted(nextMuted) {
    this.muted = nextMuted;
    if (!nextMuted) return;
    this.players.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
    });
  }

  setVolume(nextVolume) {
    const clamped = Math.max(0, Math.min(1, nextVolume));
    this.volume = clamped * clamped;
    this.players.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  async play(eventName) {
    if (this.muted) return;
    const minSpacingByEvent = { reelStop: 110, button: 70 };
    const now = Date.now();
    const lastAt = this.lastPlayedAt.get(eventName) || 0;
    const minSpacing = minSpacingByEvent[eventName] || 0;
    if (minSpacing > 0 && now - lastAt < minSpacing) return;
    this.lastPlayedAt.set(eventName, now);

    const files = this.filesByEvent[eventName] || [];
    if (!files.length) {
      this.playFallbackTone(eventName);
      return;
    }

    const file = files[Math.floor(Math.random() * files.length)];
    const player = this.players.get(file) || new Audio(file);
    this.players.set(file, player);

    try {
      player.currentTime = 0;
      player.volume = this.volume;
      await player.play();
    } catch {
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
    const context = this.getContext();
    if (!context) return;
    const tones = {
      button: [360],
      spinStart: [180, 220],
      reelStop: [250],
      win: [520, 700],
      bigWin: [520, 760, 960],
      jackpot: [420, 560, 860, 1180],
      bonusStart: [340, 460],
      bonusReveal: [500, 700],
      bonusSpin: [270, 380, 490],
      bonusMiss: [180],
      bonusEnd: [560, 820],
    };
    const notes = tones[eventName] || [300];
    notes.forEach((note, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.06;
      osc.frequency.value = note;
      osc.type = eventName === "jackpot" ? "sawtooth" : "triangle";
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, this.volume * 0.12), start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }
}

const audioManager = new AudioManager();
const moneyFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function formatCash(value) {
  return `$${moneyFormatter.format(Math.max(0, Math.round(value)))}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundTo100(value) {
  return Math.round(value / 100) * 100;
}

function setMessage(text) {
  dom.slotMessage.textContent = text;
}

function getCurrentPack() {
  return GAME_PACKS[state.currentGameIndex];
}

function getCurrentBet() {
  return BET_LEVELS[state.betIndex];
}

function toIsoDateString(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function daysBetweenIso(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function applyPackTheme(pack) {
  document.documentElement.style.setProperty("--bg", pack.palette.bg);
  document.documentElement.style.setProperty("--bg-soft", pack.palette.bgSoft);
  document.documentElement.style.setProperty("--gold", pack.palette.gold);
  document.documentElement.style.setProperty("--blue", pack.palette.blue);
  document.documentElement.style.setProperty("--red", pack.palette.red);
  dom.themeTitle.textContent = pack.name;
  dom.themeSubtitle.textContent = pack.subtitle;
}

function applyThemeImage(backgroundImageDataUrl) {
  const hasImage = Boolean(backgroundImageDataUrl);
  document.body.classList.toggle("has-theme-image", hasImage);
  document.documentElement.style.setProperty("--theme-image", hasImage ? `url("${backgroundImageDataUrl}")` : "none");
}

function populateGameSelector() {
  dom.gameSelect.innerHTML = "";
  GAME_PACKS.forEach((pack, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = pack.name;
    dom.gameSelect.appendChild(option);
  });
  dom.gameSelect.value = String(state.currentGameIndex);
}

function resetJackpotsForPack() {
  const pack = getCurrentPack();
  state.jackpots = {
    mini: pack.jackpotSeed.mini,
    major: pack.jackpotSeed.major,
    grand: pack.jackpotSeed.grand,
  };
  state.grandPitySpins = 0;
}

function getSymbolWeight(symbolId) {
  const pack = getCurrentPack();
  const base = BASE_SYMBOL_WEIGHTS[symbolId] || 0;
  const tuning = pack.weightTuning[symbolId] || 1;
  return Math.max(0.1, base * tuning);
}

function weightedRandomSymbolId({ includeBonus = true } = {}) {
  const eligible = SYMBOLS.filter((symbol) => includeBonus || !symbol.isBonus);
  const weighted = eligible.map((symbol) => ({
    id: symbol.id,
    weight: symbol.isBonus && !includeBonus ? 0 : getSymbolWeight(symbol.id),
  }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return weighted[weighted.length - 1].id;
}

function createRandomGrid({ forceBonus = false, includeBonus = true } = {}) {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => weightedRandomSymbolId({ includeBonus })));
  if (forceBonus) {
    const indices = Array.from({ length: ROWS * COLS }, (_, idx) => idx).sort(() => Math.random() - 0.5).slice(0, 3);
    indices.forEach((flat) => {
      const row = Math.floor(flat / COLS);
      const col = flat % COLS;
      grid[row][col] = "bonus";
    });
  }
  return grid;
}

function getColumnSymbols(grid, colIndex) {
  return Array.from({ length: ROWS }, (_, row) => grid[row][colIndex]);
}

function createSymbolVisual(symbolId, { compact = false } = {}) {
  const symbol = SYMBOL_BY_ID[symbolId] || SYMBOL_BY_ID.star;
  
  // Create image element for user's paid downloaded images
  const img = document.createElement("img");
  img.className = "symbol-art";
  img.src = symbol.image;
  img.alt = symbol.label;
  img.loading = "eager";
  img.decoding = "async";
  img.style.width = compact ? "36px" : "92%";
  img.style.height = compact ? "36px" : "92%";
  img.style.objectFit = "cover";
  img.style.objectPosition = SYMBOL_FOCAL_POINTS[symbolId] || "50% 52%";
  img.style.borderRadius = "4px";
  img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

  // Simple text fallback if image fails to load
  const fallback = document.createElement("div");
  fallback.className = "symbol-fallback";
  fallback.textContent = symbol.short;
  fallback.style.fontSize = compact ? "16px" : "24px";
  fallback.style.fontWeight = "bold";
  fallback.style.color = "#FFD700";
  fallback.style.display = "flex";
  fallback.style.alignItems = "center";
  fallback.style.justifyContent = "center";
  fallback.style.width = compact ? "36px" : "100%";
  fallback.style.height = compact ? "36px" : "100%";
  fallback.style.textShadow = "0 2px 4px rgba(0,0,0,0.5)";
  fallback.style.border = "2px solid #FFD700";
  fallback.style.borderRadius = "4px";
  fallback.style.background = "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)";

  img.addEventListener("error", () => {
    img.replaceWith(fallback);
  });
  
  return img;
}

function createSymbolCell(symbolId, height) {
  const cell = document.createElement("div");
  cell.className = "symbol-cell";
  cell.style.height = `${height}px`;
  cell.appendChild(createSymbolVisual(symbolId));
  return cell;
}

function buildReelBoard() {
  dom.reelStrip.innerHTML = "";
  state.reelViews = [];

  for (let col = 0; col < COLS; col += 1) {
    const column = document.createElement("article");
    column.className = "reel-column";

    const windowEl = document.createElement("div");
    windowEl.className = "reel-window";

    const track = document.createElement("div");
    track.className = "reel-track";
    windowEl.appendChild(track);
    column.appendChild(windowEl);
    dom.reelStrip.appendChild(column);

    state.reelViews.push({ column, windowEl, track });
  }
}

function renderStaticBoard() {
  state.reelViews.forEach((view, col) => {
    const rowHeight = Math.max(54, Math.floor((view.windowEl.clientHeight || 330) / ROWS));
    const columnSymbols = getColumnSymbols(state.grid, col);
    view.track.innerHTML = "";
    columnSymbols.forEach((symbolId) => {
      view.track.appendChild(createSymbolCell(symbolId, rowHeight));
    });
    view.track.style.transition = "none";
    view.track.style.transform = "translateY(0px)";
    view.column.classList.toggle("bonus-hit", columnSymbols.includes("bonus"));
  });
}

async function animateColumnStop(colIndex, finalSymbols) {
  const view = state.reelViews[colIndex];
  const rowHeight = Math.max(54, Math.floor((view.windowEl.clientHeight || 330) / ROWS));
  const rollLength = 18 + colIndex * 3 + Math.floor(Math.random() * 3);
  const sequence = Array.from({ length: rollLength }, () => weightedRandomSymbolId());
  finalSymbols.forEach((symbol) => sequence.push(symbol));

  view.column.classList.add("spinning");
  view.track.innerHTML = "";
  sequence.forEach((symbolId) => {
    view.track.appendChild(createSymbolCell(symbolId, rowHeight));
  });

  view.track.style.transition = "none";
  view.track.style.transform = "translateY(0px)";
  await nextFrame();
  await nextFrame();

  const duration = 1180 + Math.floor(Math.random() * 180);
  view.track.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.8, 0.2, 1)`;
  view.track.style.transform = `translateY(-${rollLength * rowHeight}px)`;
  await delay(duration + 30);

  view.column.classList.remove("spinning");
  view.track.innerHTML = "";
  finalSymbols.forEach((symbolId) => {
    view.track.appendChild(createSymbolCell(symbolId, rowHeight));
  });
  view.track.style.transition = "none";
  view.track.style.transform = "translateY(0px)";
  view.column.classList.toggle("bonus-hit", finalSymbols.includes("bonus"));
}

async function spinAllReels(grid, { staggerMs = 120 } = {}) {
  const jobs = [];
  for (let col = 0; col < COLS; col += 1) {
    jobs.push(
      (async () => {
        await delay(col * staggerMs);
        await animateColumnStop(col, getColumnSymbols(grid, col));
        audioManager.play("reelStop");
      })()
    );
  }
  await Promise.all(jobs);
}

function renderPayoutTable() {
  dom.payoutTable.innerHTML = "";
  const bet = getCurrentBet();
  SYMBOLS.filter((symbol) => !symbol.isBonus).forEach((symbol) => {
    const li = document.createElement("li");
    const pay3 = formatCash(bet * symbol.pays[3]);
    const pay4 = formatCash(bet * symbol.pays[4]);
    const pay5 = formatCash(bet * symbol.pays[5]);
    li.textContent = `${symbol.label}: 3-of-kind ${pay3}, 4-of-kind ${pay4}, 5-of-kind ${pay5}`;
    dom.payoutTable.appendChild(li);
  });
  const bonusLine = document.createElement("li");
  bonusLine.textContent = `3+ BONUS symbols trigger a bonus game. Guaranteed at least once every ${BONUS_GUARANTEE_SPINS} spins.`;
  dom.payoutTable.appendChild(bonusLine);
}

function renderBonusList() {
  dom.bonusRoundList.innerHTML = "";
  getCurrentPack().bonusDescriptions.forEach((description) => {
    const li = document.createElement("li");
    li.textContent = description;
    dom.bonusRoundList.appendChild(li);
  });
}

function evaluateGrid(grid) {
  const bet = getCurrentBet();
  let totalLineWin = 0;
  const lineDetails = [];
  let mega777Hit = false;

  PAYLINES.forEach((line, lineIndex) => {
    const firstSymbolId = grid[line[0]][0];
    const firstSymbol = SYMBOL_BY_ID[firstSymbolId];
    if (!firstSymbol || firstSymbol.isBonus) return;

    let count = 1;
    for (let col = 1; col < COLS; col += 1) {
      const symbolId = grid[line[col]][col];
      if (symbolId === firstSymbolId) count += 1;
      else break;
    }

    if (count >= 3) {
      const mult = firstSymbol.pays[count];
      const win = bet * mult;
      totalLineWin += win;
      lineDetails.push(`Line ${lineIndex + 1}: ${firstSymbol.label} x${count}`);
      if (firstSymbol.id === "seven" && count === 5) {
        mega777Hit = true;
      }
    }
  });

  const bonusCount = grid.flat().filter((id) => id === "bonus").length;
  return { totalLineWin, lineDetails, bonusCount, mega777Hit };
}

function maybeLaunchCoinBurst(count = 14) {
  for (let i = 0; i < count; i += 1) {
    const coin = document.createElement("span");
    coin.className = "fx-coin";
    coin.textContent = Math.random() > 0.2 ? "COIN" : "WIN";
    coin.style.left = `${Math.random() * 100}%`;
    coin.style.animationDuration = `${1 + Math.random() * 1.4}s`;
    dom.fxLayer.appendChild(coin);
    setTimeout(() => coin.remove(), 2300);
  }
}

function triggerCelebration(tier) {
  if (!dom.cabinet) return;
  dom.cabinet.classList.remove("celebrate-small", "celebrate-big", "celebrate-mega");
  dom.cabinet.classList.add(
    tier === "mega" ? "celebrate-mega" : tier === "big" ? "celebrate-big" : "celebrate-small"
  );
  setTimeout(() => dom.cabinet.classList.remove("celebrate-small", "celebrate-big", "celebrate-mega"), 2100);
}

function contributeToJackpots(spinCost) {
  state.jackpots.mini += Math.floor(spinCost * 0.08);
  state.jackpots.major += Math.floor(spinCost * 0.15);
  state.jackpots.grand += Math.floor(spinCost * 0.22);
}

function maybeHitJackpot() {
  const odds = getCurrentPack().jackpotOdds;
  const grandBoost = Math.min(0.0035, state.grandPitySpins * 0.00003);
  const grandChance = odds.grand + grandBoost;
  const roll = Math.random();

  if (roll < grandChance) {
    state.grandPitySpins = 0;
    const payout = roundTo100(state.jackpots.grand * (0.9 + Math.random() * 0.18));
    state.jackpots.grand = getCurrentPack().jackpotSeed.grand;
    return { tier: "grand", payout };
  }

  if (roll < grandChance + odds.major) {
    state.grandPitySpins += 1;
    const payout = roundTo100(state.jackpots.major * (0.88 + Math.random() * 0.2));
    state.jackpots.major = getCurrentPack().jackpotSeed.major;
    return { tier: "major", payout };
  }

  if (roll < grandChance + odds.major + odds.mini) {
    state.grandPitySpins += 1;
    const payout = roundTo100(state.jackpots.mini * (0.85 + Math.random() * 0.22));
    state.jackpots.mini = getCurrentPack().jackpotSeed.mini;
    return { tier: "mini", payout };
  }

  state.grandPitySpins += 1;
  return null;
}

function openBonusOverlay(title, intro) {
  state.activeBonus = title;
  state.controlsLocked = true;
  dom.bonusTitle.textContent = title;
  dom.bonusIntro.textContent = intro;
  dom.bonusBody.innerHTML = "";
  dom.bonusContinueBtn.classList.add("hidden");
  dom.bonusOverlay.classList.remove("hidden");
  dom.bonusOverlay.setAttribute("aria-hidden", "false");
  updateHUD();
}

function closeBonusOverlay() {
  dom.bonusOverlay.classList.add("hidden");
  dom.bonusOverlay.setAttribute("aria-hidden", "true");
  dom.bonusOverlay.classList.remove("mega-777-mode");
  dom.bonusBody.innerHTML = "";
  state.activeBonus = null;
  state.controlsLocked = false;
  updateHUD();
  setMessage("Bonus complete. Spin again.");
}

function closeMega777Overlay() {
  dom.bonusOverlay.classList.add("hidden");
  dom.bonusOverlay.setAttribute("aria-hidden", "true");
  dom.bonusOverlay.classList.remove("mega-777-mode");
  dom.bonusBody.innerHTML = "";
  dom.bonusContinueBtn.classList.add("hidden");
  state.activeBonus = null;
  state.controlsLocked = false;
  updateHUD();
}

function showMega777Overlay(payout) {
  return new Promise((resolve) => {
    openBonusOverlay("777 MEGA BONUS!", `You hit the biggest bonus! ${formatCash(payout)}`);
    dom.bonusOverlay.classList.add("mega-777-mode");
    dom.bonusBody.innerHTML = "";

    const hero = document.createElement("img");
    hero.className = "mega-777-image";
    hero.src = MEGA_777_IMAGE;
    hero.alt = "777 mega jackpot celebration";
    hero.loading = "eager";
    hero.decoding = "async";
    dom.bonusBody.appendChild(hero);

    const caption = document.createElement("div");
    caption.className = "mega-777-caption";
    caption.textContent = `MEGA 777 JACKPOT ${formatCash(payout)}`;
    dom.bonusBody.appendChild(caption);

    dom.bonusContinueBtn.classList.remove("hidden");
    dom.bonusContinueBtn.textContent = "Continue";
    dom.bonusContinueBtn.onclick = () => {
      closeMega777Overlay();
      resolve();
    };
  });
}

function finishBonus(baseReward, summaryText) {
  const loyalty = 1 + Math.min(1.2, state.spinCount / 200 + state.totalWagered / 250000);
  const reward = roundTo100(baseReward * loyalty);
  state.balance += reward;
  state.lastWin = reward;
  state.jackpots.grand += Math.floor(getCurrentBet() * 0.35);
  updateHUD();
  maybeLaunchCoinBurst(26);
  triggerCelebration(reward >= getCurrentBet() * 25 ? "mega" : "big");
  audioManager.play("bonusEnd");
  dom.bonusIntro.textContent = `${summaryText} Bonus payout: ${formatCash(reward)}.`;
  dom.bonusContinueBtn.classList.remove("hidden");
  dom.bonusContinueBtn.onclick = closeBonusOverlay;
}

function createBonusBanner(mode) {
  const banner = document.createElement("img");
  banner.className = "bonus-banner";
  banner.src = BONUS_BANNERS[mode] || BONUS_BANNERS.pick;
  banner.alt = `${mode} bonus art`;
  banner.loading = "eager";
  banner.decoding = "async";
  banner.addEventListener("error", () => {
    const fallback = document.createElement("div");
    fallback.className = "symbol-fallback";
    fallback.style.width = "100%";
    fallback.style.minHeight = "130px";
    fallback.style.height = "130px";
    fallback.textContent = "BONUS";
    banner.replaceWith(fallback);
  });
  return banner;
}

function launchPickBonus() {
  const bet = getCurrentBet();
  const cards = [6, 8, 10, 12, 14, 16, 18, 22, 26, 30, 40, 50].sort(() => Math.random() - 0.5);
  let picks = 0;
  let total = 0;

  openBonusOverlay("Treasure Pick Bonus", "Pick 4 cards. Every pick pays instantly.");
  dom.bonusBody.appendChild(createBonusBanner("pick"));

  const grid = document.createElement("div");
  grid.className = "pick-grid";

  cards.forEach((mult) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick-card";
    btn.textContent = "PICK";
    btn.onclick = async () => {
      if (btn.disabled || picks >= 4) return;
      picks += 1;
      btn.disabled = true;
      const reward = roundTo100(bet * mult);
      total += reward;
      btn.innerHTML = "";
      btn.appendChild(createSymbolVisual("bonus", { compact: true }));
      const label = document.createElement("strong");
      label.textContent = `+${formatCash(reward)}`;
      btn.appendChild(label);
      await audioManager.play("bonusReveal");
      if (picks >= 4) {
        finishBonus(total, "Treasure chest complete.");
      }
    };
    grid.appendChild(btn);
  });

  dom.bonusBody.appendChild(grid);
}

function launchWheelBonus() {
  const bet = getCurrentBet();
  const segments = [8, 10, 12, 15, 20, 30, 40, 60];

  openBonusOverlay("Power Wheel Bonus", "Press SPIN WHEEL and land your multiplier.");
  dom.bonusBody.appendChild(createBonusBanner("wheel"));

  const shell = document.createElement("div");
  shell.className = "wheel-shell";
  const pointer = document.createElement("div");
  pointer.className = "wheel-pointer";
  const wheel = document.createElement("div");
  wheel.className = "wheel";
  const center = document.createElement("div");
  center.className = "wheel-center";
  center.textContent = "BONUS";

  segments.forEach((mult, index) => {
    const marker = document.createElement("span");
    marker.className = "wheel-label";
    marker.style.setProperty("--i", String(index));
    marker.appendChild(createSymbolVisual("coin", { compact: true }));
    const txt = document.createElement("small");
    txt.textContent = `${mult}x`;
    marker.appendChild(txt);
    wheel.appendChild(marker);
  });

  wheel.appendChild(center);
  shell.appendChild(pointer);
  shell.appendChild(wheel);
  dom.bonusBody.appendChild(shell);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "wheel-spin-btn";
  btn.textContent = "SPIN WHEEL";
  btn.onclick = async () => {
    btn.disabled = true;
    audioManager.play("bonusSpin");
    const index = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    const targetOffset = (360 - index * segmentAngle) % 360;
    const totalRotation = 360 * (6 + Math.floor(Math.random() * 2)) + targetOffset;
    const duration = 3300;
    const start = performance.now();
    let lastBucket = -1;

    const animate = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - progress) ** 3;
      const angle = totalRotation * eased;
      wheel.style.transform = `rotate(${angle}deg)`;
      const bucket = Math.floor(angle / (segmentAngle / 2));
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        pointer.classList.remove("tick");
        void pointer.offsetWidth;
        pointer.classList.add("tick");
        audioManager.play("reelStop");
      }
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    await delay(duration + 130);
    finishBonus(roundTo100(bet * segments[index]), `Wheel landed on ${segments[index]}x`);
  };
  dom.bonusBody.appendChild(btn);
}

async function launchFreeSpinsBonus() {
  const freeSpins = 5;
  const bonusMultiplier = 2;
  let total = 0;

  openBonusOverlay("Free Spins Burst", `You get ${freeSpins} free spins. Line wins pay ${bonusMultiplier}x.`);
  dom.bonusBody.appendChild(createBonusBanner("freespins"));

  const detail = document.createElement("p");
  detail.textContent = "Starting free spins...";
  dom.bonusBody.appendChild(detail);
  await delay(550);

  for (let spinIndex = 1; spinIndex <= freeSpins; spinIndex += 1) {
    detail.textContent = `Free spin ${spinIndex} of ${freeSpins}`;
    const grid = createRandomGrid({ includeBonus: false });
    await spinAllReels(grid, { staggerMs: 100 });
    state.grid = grid;
    renderStaticBoard();
    const outcome = evaluateGrid(grid);
    const win = roundTo100(outcome.totalLineWin * bonusMultiplier);
    if (win > 0) {
      total += win;
      detail.textContent = `Free spin ${spinIndex}: won ${formatCash(win)}`;
      audioManager.play("bonusReveal");
    } else {
      detail.textContent = `Free spin ${spinIndex}: no line win`;
      audioManager.play("bonusMiss");
    }
    await delay(420);
  }

  finishBonus(total, "Free spins finished.");
}

function launchBonusGame() {
  const modes = getCurrentPack().bonusModes;
  const mode = modes[Math.floor(Math.random() * modes.length)];
  audioManager.play("bonusStart");
  if (mode === "pick") return launchPickBonus();
  if (mode === "wheel") return launchWheelBonus();
  return launchFreeSpinsBonus();
}

function updateHUD() {
  dom.balanceValue.textContent = formatCash(state.balance);
  dom.betValue.textContent = formatCash(getCurrentBet());
  dom.lastWinValue.textContent = formatCash(state.lastWin);
  dom.miniJackpotValue.textContent = formatCash(state.jackpots.mini);
  dom.majorJackpotValue.textContent = formatCash(state.jackpots.major);
  dom.grandJackpotValue.textContent = formatCash(state.jackpots.grand);
  dom.dailyStreakValue.textContent = `Day ${state.dailyStreak}`;
  dom.bonusMeterValue.textContent = `${state.spinsSinceBonus} / ${BONUS_GUARANTEE_SPINS}`;
  dom.muteBtn.textContent = state.muted ? "Sound: Off" : "Sound: On";
  dom.muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
  dom.volumeSlider.value = String(Math.round(Math.sqrt(audioManager.volume) * 100));

  const locked = state.controlsLocked || state.activeBonus !== null;
  dom.betDownBtn.disabled = locked || state.betIndex === 0;
  dom.betUpBtn.disabled = locked || state.betIndex === BET_LEVELS.length - 1;
  dom.spinBtn.disabled = locked || state.spinInProgress;
  dom.gameSelect.disabled = locked || state.spinInProgress;
}

function fallbackGuideMessage(eventType) {
  const messages = {
    welcome: [
      "Lynne, welcome back. Let's find your rhythm and open a bonus round.",
      "Lynne, your machine is live. Start with steady spins and build momentum.",
    ],
    spin: [
      "Lynne, keep your pace steady. Bonus symbols love hot streaks.",
      "Lynne, one clean line hit can wake up this whole board.",
    ],
    win: [
      "Lynne, beautiful hit. Stay calm and let the next one come.",
      "Lynne, that was strong. Your next bonus chance just improved.",
    ],
    jackpot: [
      "Lynne, jackpot energy is active. Keep this run alive.",
      "Lynne, huge moment. This cabinet is paying right now.",
    ],
    bonus: [
      "Lynne, bonus round incoming. Trust your first instinct.",
      "Lynne, this is your feature run. Take the big choices.",
    ],
    miss: [
      "Lynne, no line win this spin. The bonus meter is still climbing.",
      "Lynne, dry spin. Next spin can still open the feature.",
    ],
  };
  const pool = messages[eventType] || messages.spin;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function updateAiGuide(eventType = "spin", recentOutcome = "steady") {
  const fallback = fallbackGuideMessage(eventType);
  
  // Always show fallback immediately for better UX
  dom.aiGuideText.textContent = fallback;
  
  // Try AI with timeout and error handling
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch("/api/ai/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: eventType === "bonus" ? "diamond_bonus" : eventType === "jackpot" ? "big_win" : "guide",
        themeName: getCurrentPack().name,
        balance: state.balance,
        bet: getCurrentBet(),
        bonusRound: state.activeBonus,
        worldStage: (state.spinCount % 5) + 1,
        recentOutcome,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return; // Keep fallback message
    }
    
    const payload = await response.json();
    const message = String(payload?.message || "").trim();
    
    if (message.length) {
      const formattedMessage = message.includes("Lynne") ? message : `Lynne, ${message}`;
      // Smooth transition to new message
      dom.aiGuideText.style.opacity = "0";
      setTimeout(() => {
        dom.aiGuideText.textContent = formattedMessage;
        dom.aiGuideText.style.opacity = "1";
      }, 200);
    }
  } catch (error) {
    // Keep fallback message - already set above
    console.log("AI guide update failed, using fallback:", error.message);
  }
}

async function maybeRefreshAiTheme() {
  try {
    const response = await fetch("/api/ai/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worldStage: (state.spinCount % 5) + 1,
        reason: "live-spin-cycle",
        currentTheme: getCurrentPack().name,
      }),
    });
    if (!response.ok) return;
    const payload = await response.json();
    if (payload?.themeName) dom.themeTitle.textContent = payload.themeName;
    if (payload?.caption) dom.themeSubtitle.textContent = payload.caption;
    if (payload?.palette?.surface) {
      document.documentElement.style.setProperty("--bg", payload.palette.surface);
      document.documentElement.style.setProperty("--bg-soft", payload.palette.shadow || payload.palette.surface);
    }
    if (payload?.palette?.accent) document.documentElement.style.setProperty("--gold", payload.palette.accent);
    if (payload?.palette?.glow) document.documentElement.style.setProperty("--blue", payload.palette.glow);
    applyThemeImage(payload?.backgroundImageDataUrl || null);
  } catch {
    // silent fallback
  }
}

async function spin() {
  if (state.spinInProgress || state.controlsLocked || state.activeBonus) return;
  const bet = getCurrentBet();
  if (state.balance < bet) {
    setMessage("Not enough credits for this bet.");
    return;
  }

  state.spinInProgress = true;
  state.controlsLocked = true;
  state.lastWin = 0;
  state.balance -= bet;
  state.totalWagered += bet;
  contributeToJackpots(bet);
  updateHUD();
  setMessage("Spinning reels...");
  audioManager.play("spinStart");

  const forceBonus = state.spinsSinceBonus >= BONUS_GUARANTEE_SPINS - 1;
  const nextGrid = createRandomGrid({ forceBonus, includeBonus: true });

  try {
    await spinAllReels(nextGrid, { staggerMs: 130 });

    state.grid = nextGrid;
    renderStaticBoard();
    state.spinCount += 1;

    const result = evaluateGrid(nextGrid);
    const payout = roundTo100(result.totalLineWin);
    const bonusTriggered = result.bonusCount >= 3;
    let mega777Shown = false;

    if (payout > 0) {
      state.balance += payout;
      state.lastWin += payout;
      const tier = payout >= bet * 25 ? "mega" : payout >= bet * 10 ? "big" : "small";
      maybeLaunchCoinBurst(tier === "mega" ? 40 : tier === "big" ? 26 : 14);
      triggerCelebration(tier);
      setMessage(`Win ${formatCash(payout)}${result.lineDetails.length ? ` | ${result.lineDetails.join(", ")}` : ""}`);
      audioManager.play(tier === "small" ? "win" : "bigWin");
    } else {
      setMessage("No line win this spin.");
    }

    const jackpot = maybeHitJackpot();
    if (jackpot) {
      state.balance += jackpot.payout;
      state.lastWin += jackpot.payout;
      setMessage(`${jackpot.tier.toUpperCase()} JACKPOT! ${formatCash(jackpot.payout)}`);
      maybeLaunchCoinBurst(jackpot.tier === "grand" ? 80 : 48);
      triggerCelebration(jackpot.tier === "grand" ? "mega" : "big");
      audioManager.play("jackpot");
      if (jackpot.tier === "grand") {
        await showMega777Overlay(jackpot.payout);
        setMessage(`GRAND JACKPOT! ${formatCash(jackpot.payout)}`);
        mega777Shown = true;
      }
    }

    if (result.mega777Hit && !mega777Shown) {
      await showMega777Overlay(payout);
      setMessage(`MEGA 777 HIT! ${formatCash(payout)}`);
      mega777Shown = true;
    }

    if (bonusTriggered) {
      state.spinsSinceBonus = 0;
      setMessage(`BONUS TRIGGERED! ${result.bonusCount} bonus symbols.`);
      await delay(280);
      launchBonusGame();
    } else {
      state.spinsSinceBonus += 1;
    }

    if (state.spinCount % 4 === 0 && !state.activeBonus) {
      void maybeRefreshAiTheme();
    }

    const aiEvent = jackpot ? "jackpot" : bonusTriggered ? "bonus" : payout > 0 ? "win" : "miss";
    void updateAiGuide(aiEvent, aiEvent);
  } finally {
    state.spinInProgress = false;
    if (!state.activeBonus) state.controlsLocked = false;
    updateHUD();
  }
}

function applyDailyReward() {
  const today = toIsoDateString(new Date());
  const savedDate = localStorage.getItem("lynne-slot:last-daily-claim");
  const savedStreak = Number(localStorage.getItem("lynne-slot:daily-streak") || "1");
  let streak = Math.max(1, savedStreak);

  if (!savedDate) {
    streak = 1;
  } else {
    const gap = daysBetweenIso(savedDate, today);
    if (gap === 0) {
      state.dailyStreak = streak;
      return;
    }
    if (gap === 1) streak += 1;
    else streak = 1;
  }

  const capped = Math.min(streak, 30);
  const reward = roundTo100(22000 + capped * 7000);
  state.balance += reward;
  state.lastWin = reward;
  state.dailyStreak = capped;
  localStorage.setItem("lynne-slot:last-daily-claim", today);
  localStorage.setItem("lynne-slot:daily-streak", String(capped));
  maybeLaunchCoinBurst(Math.min(44, 16 + capped));
  triggerCelebration(capped >= 7 ? "big" : "small");
  setMessage(`Daily bonus paid: ${formatCash(reward)} (Day ${capped})`);
}

function switchGamePack(index) {
  state.currentGameIndex = clamp(Number(index) || 0, 0, GAME_PACKS.length - 1);
  dom.gameSelect.value = String(state.currentGameIndex);
  applyPackTheme(getCurrentPack());
  resetJackpotsForPack();
  state.grid = createRandomGrid({ includeBonus: true });
  renderStaticBoard();
  renderPayoutTable();
  renderBonusList();
  updateHUD();
  setMessage(`Loaded ${getCurrentPack().name}. Press SPIN.`);
}

function attachEvents() {
  dom.spinBtn.addEventListener("click", async () => {
    audioManager.play("button");
    await spin();
  });

  dom.betDownBtn.addEventListener("click", () => {
    if (state.controlsLocked || state.activeBonus || state.betIndex <= 0) return;
    state.betIndex -= 1;
    renderPayoutTable();
    updateHUD();
    setMessage(`Bet set to ${formatCash(getCurrentBet())}`);
    audioManager.play("button");
  });

  dom.betUpBtn.addEventListener("click", () => {
    if (state.controlsLocked || state.activeBonus || state.betIndex >= BET_LEVELS.length - 1) return;
    state.betIndex += 1;
    renderPayoutTable();
    updateHUD();
    setMessage(`Bet set to ${formatCash(getCurrentBet())}`);
    audioManager.play("button");
  });

  dom.gameSelect.addEventListener("change", () => {
    if (state.controlsLocked || state.spinInProgress || state.activeBonus) {
      dom.gameSelect.value = String(state.currentGameIndex);
      return;
    }
    audioManager.play("button");
    switchGamePack(dom.gameSelect.value);
    void updateAiGuide("spin", "pack-change");
  });

  dom.muteBtn.addEventListener("click", () => {
    state.muted = !state.muted;
    audioManager.setMuted(state.muted);
    updateHUD();
  });

  dom.volumeSlider.addEventListener("input", () => {
    const normalized = Number(dom.volumeSlider.value) / 100;
    audioManager.setVolume(normalized);
    updateHUD();
  });
}

function init() {
  populateGameSelector();
  buildReelBoard();
  switchGamePack(state.currentGameIndex);
  applyDailyReward();
  state.grid = createRandomGrid({ includeBonus: true });
  renderStaticBoard();
  renderPayoutTable();
  renderBonusList();
  updateHUD();
  attachEvents();
  audioManager.preload();
  void updateAiGuide("welcome", "first-load");
}

init();
