document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const START_BALANCE = 1000;
  const DEFAULT_BET = 10;
  const BET_STEP = 10;
  const MAX_BET = 200;
  const BASE_STRIP_LENGTH = 22;
  const TWO_MATCH_MULTIPLIER = 1;
  const BIG_WIN_MULTIPLIER = 10;
  const FREE_SPIN_COUNT = 3;
  const FREE_SPIN_MULTIPLIER = 2;
  const STORY_LOG_LIMIT = 6;
  const MYSTERY_SPARK_CHANCE = 0.07;
  const SPARK_BONUS_EVERY_N_SPINS = 12;

  const symbols = [
    { id: "cherry", name: "Cherry", icon: "🍒", weight: 25, multiplier: 2 },
    { id: "lemon", name: "Lemon", icon: "🍋", weight: 20, multiplier: 3 },
    { id: "plum", name: "Plum", icon: "🟣", weight: 15, multiplier: 4 },
    { id: "orange", name: "Orange", icon: "🍊", weight: 15, multiplier: 4 },
    { id: "watermelon", name: "Watermelon", icon: "🍉", weight: 12, multiplier: 5 },
    { id: "bell", name: "Bell", icon: "🔔", weight: 10, multiplier: 8 },
    { id: "horseshoe", name: "Horseshoe", icon: "🐴", weight: 8, multiplier: 10 },
    { id: "wild", name: "WILD", icon: "WILD", weight: 5, multiplier: 15, isWild: true },
    { id: "vegas", name: "VEGAS BABY FREE SPINS", icon: "VEGAS", weight: 3, multiplier: 25, isBonus: true },
    { id: "coin", name: "Coin", icon: "�", weight: 2, multiplier: 50, isSpecial: true },
    { id: "seven", name: "Seven", icon: "7", weight: 5, multiplier: 30 },
  ];

  const localThemeStages = [
    {
      themeName: "Velvet Starlight Lounge",
      caption: "Soft gold bulbs and calm midnight velvet give the reels a rich, gentle opening glow.",
      palette: {
        accent: "#ffcf63",
        accentSoft: "#ffe6a8",
        glow: "#54e7ff",
        glowSoft: "#c3f7ff",
        shadow: "#4b2f76",
        surface: "#251837",
      },
    },
    {
      themeName: "Golden Lantern Garden",
      caption: "Warm garden lanterns and ribbon-soft lights drift around the reels like patient good luck.",
      palette: {
        accent: "#ffbb6b",
        accentSoft: "#ffe3bc",
        glow: "#76d9ff",
        glowSoft: "#c9f2ff",
        shadow: "#6f2f57",
        surface: "#2c1a3b",
      },
    },
    {
      themeName: "Rose Quartz Bonus Hall",
      caption: "The room turns softer and sweeter, with rosy shimmer and playful little jackpot sparks.",
      palette: {
        accent: "#ff98c3",
        accentSoft: "#ffd9ea",
        glow: "#85ffd9",
        glowSoft: "#d2fff2",
        shadow: "#4a2b71",
        surface: "#27193a",
      },
    },
    {
      themeName: "Sunset Ribbon Vault",
      caption: "Peach-gold ribbons, velvet shadows, and richer sparkle make each bonus feel more dramatic.",
      palette: {
        accent: "#ffd16f",
        accentSoft: "#fff0c8",
        glow: "#8fd8ff",
        glowSoft: "#dff4ff",
        shadow: "#7d2e4b",
        surface: "#301c3b",
      },
    },
    {
      themeName: "Diamond Cloud Jubilee",
      caption: "Everything opens into a brighter celebration world with cloudlike shimmer and premium glow.",
      palette: {
        accent: "#fff3cf",
        accentSoft: "#ffffff",
        glow: "#8ffff5",
        glowSoft: "#e0fffb",
        shadow: "#6b3a81",
        surface: "#261634",
      },
    },
  ];

  const symbolMap = Object.fromEntries(symbols.map(function (symbol) {
    return [symbol.id, symbol];
  }));

  const totalWeight = symbols.reduce(function (sum, symbol) {
    return sum + symbol.weight;
  }, 0);

  const state = {
    balance: START_BALANCE,
    bet: DEFAULT_BET,
    freeSpins: 0,
    freeSpinMultiplier: FREE_SPIN_MULTIPLIER,
    freeSpinLabel: "Moonlight x2",
    spinning: false,
    worldStage: 1,
    soundEnabled: true,
    musicEnabled: true,
    musicPlaying: false,
    voiceGuideEnabled: false,
    themeName: localThemeStages[0].themeName,
    currentThemeImage: "",
    themeCaption: localThemeStages[0].caption,
    themeSource: "local",
    bonusMoments: 0,
    spinCount: 0,
    musicProfile: {
      name: "Velvet Night Flow",
      wave: "sine",
      pulseHz: 0.12,
      freqs: [130.81, 164.81, 196.0],
      brightness: 0.95,
    },
  };
  let audioUnlocked = false;
  const SPIN_BUTTON_READY_HTML = "SPIN<br><span class=\"spin-sub\">VIRTUAL COINS</span>";
  const SPIN_BUTTON_SPINNING_HTML = "SPINNING...";

  const balanceEl = document.getElementById("balance");
  const betEl = document.getElementById("bet");
  const freeSpinsEl = document.getElementById("free-spins");
  const worldStageEl = document.getElementById("world-stage");
  const messageEl = document.getElementById("message");
  const machineEl = document.getElementById("machine");
  const effectsLayerEl = document.getElementById("effects-layer");
  const themeSurfaceEl = document.getElementById("theme-surface");
  const themePreviewEl = document.getElementById("theme-preview");
  const themeNameEl = document.getElementById("theme-name");
  const themeCaptionEl = document.getElementById("theme-caption");
  const storyOutputEl = document.getElementById("story-output");
  const storyLogEl = document.getElementById("story-log");
  const aiStatusEl = document.getElementById("ai-status");
  const themeSourceEl = document.getElementById("theme-source");
  const themePromptEl = document.getElementById("theme-prompt");
  const bonusOverlayEl = document.getElementById("bonus-overlay");
  const bonusKickerEl = document.getElementById("bonus-kicker");
  const bonusTitleEl = document.getElementById("bonus-title");
  const bonusDescriptionEl = document.getElementById("bonus-description");
  const bonusChoicesEl = document.getElementById("bonus-choices");
  const bonusSummaryEl = document.getElementById("bonus-summary");
  const bonusCloseButton = document.getElementById("bonus-close");
  const momLoveSignEl = document.getElementById("mom-love-sign");
  const soundButton = document.getElementById("sound-button");
  const musicButton = document.getElementById("music-button");
  const voiceGuideEl = document.getElementById("voice-guide");
  const themeButton = document.getElementById("theme-button");
  const guideButton = document.getElementById("guide-button");
  const spinButton = document.getElementById("spin-button");
  const resetButton = document.getElementById("reset-button");
  const betDownButton = document.getElementById("bet-down");
  const betUpButton = document.getElementById("bet-up");
  const paytableButton = document.getElementById("paytable-button");
  const partyCharmsButton = document.getElementById("party-charms");
  const treasureBoxButton = document.getElementById("treasure-box");
  const winAmountEl = document.getElementById("win-amount");
  const jackpotAmountEl = document.getElementById("jackpot-amount");
  const specialCoinsEl = document.getElementById("special-coins");
  const specialBonusEl = document.getElementById("special-bonus");
  const bigWinDisplayEl = document.getElementById("big-win-display");
  const bigWinNumberEl = document.getElementById("big-win-number");
  const reelEls = [
    document.getElementById("reel-0"),
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
    document.getElementById("reel-3"),
    document.getElementById("reel-4"),
  ];

  const sound = {
    context: null,
    ensureContext: function () {
      if (!state.soundEnabled) {
        return null;
      }

      if (!this.context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          return null;
        }
        this.context = new AudioContextClass();
      }

      if (this.context.state === "suspended") {
        this.context.resume().catch(function () {});
      }

      return this.context;
    },
    tone: function (frequency, duration, type, gain, delaySeconds) {
      const context = this.ensureContext();
      if (!context) {
        return;
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const startTime = context.currentTime + (delaySeconds || 0);

      oscillator.type = type || "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.value = gain || 0.06;

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    },
    click: function () {
      this.tone(340, 0.08, "triangle", 0.04, 0);
    },
    reelStop: function () {
      this.tone(150, 0.12, "sine", 0.06, 0);
    },
    smallWin: function () {
      this.tone(392, 0.14, "sine", 0.06, 0);
      this.tone(523, 0.16, "sine", 0.05, 0.08);
    },
    bigWin: function () {
      this.tone(392, 0.14, "sine", 0.06, 0);
      this.tone(523, 0.16, "sine", 0.06, 0.08);
      this.tone(659, 0.2, "sine", 0.06, 0.16);
      this.tone(783, 0.24, "triangle", 0.05, 0.24);
    },
    bonus: function () {
      this.tone(330, 0.16, "triangle", 0.05, 0);
      this.tone(494, 0.18, "triangle", 0.05, 0.08);
      this.tone(659, 0.2, "triangle", 0.05, 0.18);
    },
  };

  /** Shared AudioContext for ambient music (works even when SFX toggle is off). */
  function ensureAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    if (!sound.context) {
      sound.context = new AudioContextClass();
    }
    if (sound.context.state === "suspended") {
      sound.context.resume().catch(function () {});
    }
    return sound.context;
  }

  /** Soft sustained chord — no external files; ideal for GitHub Pages. */
  const ambientMusic = {
    nodes: [],
    start: function () {
      if (state.musicPlaying || !state.musicEnabled) {
        return;
      }
      const ctx = ensureAudioContext();
      if (!ctx) {
        return;
      }

      const profile = state.musicProfile || {
        wave: "sine",
        pulseHz: 0.12,
        freqs: [130.81, 164.81, 196.0],
        brightness: 1,
      };

      const master = ctx.createGain();
      master.gain.value = 0.022;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 900;
      lowpass.Q.value = 0.7;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -26;
      compressor.knee.value = 24;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.01;
      compressor.release.value = 0.18;
      const pulser = ctx.createOscillator();
      pulser.type = "sine";
      pulser.frequency.value = profile.pulseHz || 0.12;
      const pulseGain = ctx.createGain();
      pulseGain.gain.value = 0.0035 * (profile.brightness || 1);
      pulser.connect(pulseGain);
      pulseGain.connect(master.gain);
      pulser.start();

      const freqs = Array.isArray(profile.freqs) && profile.freqs.length >= 2
        ? profile.freqs
        : [130.81, 164.81, 196.0];

      freqs.forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        // Sawtooth pads can sound like static on mobile speakers; keep tone smooth.
        osc.type = profile.wave === "sawtooth" ? "triangle" : (profile.wave || "sine");
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = 0.003 + i * 0.0018;
        osc.connect(g);
        g.connect(master);
        osc.start();
        ambientMusic.nodes.push(osc, g);
      });
      master.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(ctx.destination);
      ambientMusic.nodes.push(master, pulser, pulseGain, lowpass, compressor);
      state.musicPlaying = true;
    },
    stop: function () {
      ambientMusic.nodes.forEach(function (node) {
        try {
          if (typeof node.stop === "function") {
            node.stop();
          }
          node.disconnect();
        } catch (error) {
          /* ignore */
        }
      });
      ambientMusic.nodes = [];
      state.musicPlaying = false;
    },
  };

  function safeStartAmbientMusic() {
    if (!state.musicEnabled || state.musicPlaying || !audioUnlocked) {
      return;
    }
    try {
      ambientMusic.start();
    } catch (error) {
      console.warn("Ambient music start blocked:", error);
    }
  }

  function restartAmbientMusic() {
    if (!state.musicEnabled || !audioUnlocked) {
      return;
    }
    try {
      ambientMusic.stop();
      ambientMusic.start();
    } catch (error) {
      console.warn("Ambient music restart blocked:", error);
    }
  }

  function formatNumber(value) {
    return value.toLocaleString("en-US");
  }

  function getReelHeight() {
    const reelHeight = getComputedStyle(document.documentElement).getPropertyValue("--reel-height").trim();
    return Number.parseFloat(reelHeight) || 124;
  }

  function chooseWeightedSymbol() {
    let randomNumber = Math.random() * totalWeight;

    for (let index = 0; index < symbols.length; index += 1) {
      randomNumber -= symbols[index].weight;
      if (randomNumber <= 0) {
        return symbols[index].id;
      }
    }

    return symbols[symbols.length - 1].id;
  }

  function buildStrip(finalSymbolId, stripLength) {
    const strip = [];

    for (let index = 0; index < stripLength - 1; index += 1) {
      strip.push(chooseWeightedSymbol());
    }

    strip.push(finalSymbolId);
    return strip;
  }

  function createSymbolElement(symbolId) {
    const symbol = symbolMap[symbolId];
    const symbolEl = document.createElement("div");
    symbolEl.className = "reel-symbol symbol--" + symbol.id;

    const cardEl = document.createElement("div");
    cardEl.className = "symbol-card";

    const iconEl = document.createElement("div");
    iconEl.className = "symbol-icon";
    iconEl.textContent = symbol.icon;

    const nameEl = document.createElement("div");
    nameEl.className = "symbol-name";
    nameEl.textContent = symbol.name;

    cardEl.appendChild(iconEl);
    cardEl.appendChild(nameEl);
    symbolEl.appendChild(cardEl);

    return symbolEl;
  }

  function renderStrip(reelEl, strip) {
    reelEl.innerHTML = "";

    strip.forEach(function (symbolId) {
      reelEl.appendChild(createSymbolElement(symbolId));
    });
  }

  function showMessage(text, styleName) {
    messageEl.textContent = text;
    messageEl.className = "message-box";

    if (styleName) {
      messageEl.classList.add(styleName);
    }
  }

  function pulseStatusCard(valueEl, tone) {
    if (!valueEl || typeof valueEl.closest !== "function") {
      return;
    }

    const statusCard = valueEl.closest(".status-card");
    if (!statusCard) {
      return;
    }

    statusCard.classList.remove("status-card--win", "status-card--loss");
    void statusCard.offsetWidth;
    statusCard.classList.add(tone === "loss" ? "status-card--loss" : "status-card--win");
  }

  function addStoryMoment(text) {
    if (!storyLogEl) {
      return;
    }

    const storyItem = document.createElement("li");
    storyItem.textContent = text;
    storyLogEl.prepend(storyItem);

    while (storyLogEl.children.length > STORY_LOG_LIMIT) {
      storyLogEl.removeChild(storyLogEl.lastElementChild);
    }
  }

  function setStoryOutput(text) {
    const collapsedText = String(text || "")
      .replace(/\s+/g, " ")
      .trim();
    const safeText =
      collapsedText.length > 320
        ? collapsedText.slice(0, 317).trimEnd() + "..."
        : collapsedText;
    if (storyOutputEl) {
      storyOutputEl.textContent = safeText;
    }
    addStoryMoment(safeText);
    if (voiceGuideEl && voiceGuideEl.checked && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const line = new SpeechSynthesisUtterance(safeText);
      line.rate = 0.96;
      line.pitch = 1.05;
      window.speechSynthesis.speak(line);
    }
  }

  function setAiStatus(text) {
    if (aiStatusEl) {
      aiStatusEl.textContent = text;
    }
  }

  function setThemeSourceLabel(source) {
    const sourceLabels = {
      "openai-image": "Visual mode: live AI art",
      "openai-text": "Visual mode: AI-designed palette",
      "local-ai": "Visual mode: offline dream AI",
      fallback: "Visual mode: local fallback",
      local: "Visual mode: local",
    };
    const prettySource = sourceLabels[source] || "Visual mode: local";
    if (themeSourceEl) {
      themeSourceEl.textContent = prettySource;
    }
  }

  function shuffle(items) {
    const nextItems = items.slice();
    for (let index = nextItems.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = nextItems[index];
      nextItems[index] = nextItems[swapIndex];
      nextItems[swapIndex] = temp;
    }
    return nextItems;
  }

  function setBonusOverlayVisible(isVisible) {
    bonusOverlayEl.classList.toggle("hidden", !isVisible);
    bonusOverlayEl.setAttribute("aria-hidden", isVisible ? "false" : "true");
  }

  function resetBonusOverlay() {
    bonusChoicesEl.innerHTML = "";
    bonusSummaryEl.textContent = "";
    bonusCloseButton.classList.add("hidden");
    bonusCloseButton.onclick = null;
  }

  function openBonusOverlay(config) {
    resetBonusOverlay();
    bonusKickerEl.textContent = config.kicker;
    bonusTitleEl.textContent = config.title;
    bonusDescriptionEl.textContent = config.description;
    bonusSummaryEl.textContent = config.summary || "";
    setBonusOverlayVisible(true);
  }

  function closeBonusOverlay() {
    setBonusOverlayVisible(false);
    resetBonusOverlay();
  }

  function waitForContinue(label) {
    return new Promise(function (resolve) {
      bonusCloseButton.textContent = label || "Continue";
      bonusCloseButton.classList.remove("hidden");
      bonusCloseButton.onclick = function () {
        sound.click();
        closeBonusOverlay();
        resolve();
      };
    });
  }

  function presentSinglePickBonus(config) {
    return new Promise(function (resolve) {
      openBonusOverlay(config);

      config.options.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bonus-choice";
        button.innerHTML =
          '<span class="bonus-choice-title">' +
          option.title +
          '</span><span class="bonus-choice-subtitle">' +
          option.subtitle +
          '</span><span class="bonus-choice-reward">Tap to reveal</span>';

        button.addEventListener("click", async function () {
          sound.click();
          config.options.forEach(function (otherOption) {
            otherOption._button.disabled = true;
            otherOption._button.classList.add("is-used");
          });

          button.classList.add("is-revealed");
          button.querySelector(".bonus-choice-reward").textContent = option.rewardText;
          bonusSummaryEl.textContent = option.summaryText;
          bonusCloseButton.classList.remove("hidden");
          bonusCloseButton.textContent = "Claim Reward";
          bonusCloseButton.onclick = function () {
            sound.click();
            closeBonusOverlay();
            resolve(option);
          };
        });

        option._button = button;
        bonusChoicesEl.appendChild(button);
      });
    });
  }

  function presentMultiPickBonus(config) {
    return new Promise(function (resolve) {
      openBonusOverlay(config);

      const picks = [];
      let pickedCount = 0;

      config.options.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bonus-choice";
        button.innerHTML =
          '<span class="bonus-choice-title">' +
          option.title +
          '</span><span class="bonus-choice-subtitle">' +
          option.subtitle +
          '</span><span class="bonus-choice-reward">Hidden reward</span>';

        button.addEventListener("click", function () {
          if (button.disabled || pickedCount >= config.pickCount) {
            return;
          }

          sound.click();
          pickedCount += 1;
          button.disabled = true;
          button.classList.add("is-revealed", "is-used");
          button.querySelector(".bonus-choice-reward").textContent = option.rewardText;
          picks.push(option);

          bonusSummaryEl.textContent =
            "Pick " +
            pickedCount +
            " of " +
            config.pickCount +
            " revealed. " +
            config.summaryBuilder(picks);

          if (pickedCount >= config.pickCount) {
            bonusCloseButton.classList.remove("hidden");
            bonusCloseButton.textContent = "Collect Vault Rewards";
            bonusCloseButton.onclick = function () {
              sound.click();
              closeBonusOverlay();
              resolve(picks);
            };
          }
        });

        bonusChoicesEl.appendChild(button);
      });
    });
  }

  function clearWinningHighlights() {
    document.querySelectorAll(".reel-symbol.is-winning").forEach(function (symbolEl) {
      symbolEl.classList.remove("is-winning");
    });
  }

  function createExplosionBurst(colors, options) {
    const opts = options || {};
    const count = Number(opts.count) || 34;
    const minDistance = Number(opts.minDistance) || 120;
    const maxDistance = Number(opts.maxDistance) || 190;
    const durationMs = Number(opts.durationMs) || 1200;
    const size = Number(opts.size) || 14;
    const centerX = 50;
    const centerY = 45;

    for (let index = 0; index < count; index += 1) {
      const particleEl = document.createElement("span");
      const angle = (Math.PI * 2 * index) / count;
      const distance = minDistance + Math.random() * Math.max(10, maxDistance - minDistance);
      const color = colors[index % colors.length];

      particleEl.className = "particle";
      particleEl.style.width = size + "px";
      particleEl.style.height = size + "px";
      particleEl.style.animationDuration = durationMs + "ms";
      particleEl.style.left = centerX + "%";
      particleEl.style.top = centerY + "%";
      particleEl.style.setProperty("--dx", Math.cos(angle) * distance + "px");
      particleEl.style.setProperty("--dy", Math.sin(angle) * distance + "px");
      particleEl.style.setProperty("--particle-color", color);

      effectsLayerEl.appendChild(particleEl);

      window.setTimeout(function () {
        particleEl.remove();
      }, durationMs + 120);
    }
  }

  function addWinFlash(level) {
    const flashEl = document.createElement("span");
    flashEl.className = "win-flash " + (level === "big" ? "win-flash--big" : "win-flash--small");
    effectsLayerEl.appendChild(flashEl);

    window.setTimeout(function () {
      flashEl.remove();
    }, level === "big" ? 1200 : 900);
  }

  function showMomLoveSign() {
    if (!momLoveSignEl) {
      return;
    }
    momLoveSignEl.classList.remove("is-visible");
    void momLoveSignEl.offsetWidth;
    momLoveSignEl.classList.add("is-visible");
    window.setTimeout(function () {
      momLoveSignEl.classList.remove("is-visible");
    }, 2600);
  }

  function playWinStinger(level) {
    if (!state.soundEnabled) {
      return;
    }

    if (level === "big") {
      sound.tone(330, 0.16, "triangle", 0.07, 0);
      sound.tone(440, 0.2, "triangle", 0.07, 0.08);
      sound.tone(554, 0.22, "sawtooth", 0.08, 0.18);
      sound.tone(659, 0.26, "sawtooth", 0.08, 0.3);
      sound.tone(880, 0.28, "triangle", 0.08, 0.44);
      return;
    }

    sound.tone(392, 0.13, "triangle", 0.06, 0);
    sound.tone(523, 0.15, "triangle", 0.06, 0.06);
    sound.tone(659, 0.18, "sine", 0.06, 0.14);
  }

  function triggerWinExplosion(level) {
    if (level === "big") {
      machineEl.classList.add("is-jackpot");
      machineEl.classList.add("is-win-celebrating");
      createExplosionBurst(["#ffe88a", "#ff4eb5", "#54e7ff", "#ffffff", "#ff8f66"], {
        count: 72,
        minDistance: 130,
        maxDistance: 250,
        durationMs: 1400,
        size: 16,
      });
      window.setTimeout(function () {
        createExplosionBurst(["#ffe88a", "#ff4eb5", "#54e7ff", "#ffffff"], {
          count: 56,
          minDistance: 90,
          maxDistance: 220,
          durationMs: 1200,
          size: 12,
        });
      }, 180);
      addWinFlash("big");
      playWinStinger("big");
      showMomLoveSign();
      window.setTimeout(function () {
        machineEl.classList.remove("is-jackpot");
        machineEl.classList.remove("is-win-celebrating");
      }, 1700);
      return;
    }

    machineEl.classList.add("is-win-celebrating");
    createExplosionBurst(["#5ff0af", "#54e7ff", "#ffcf63", "#ffffff"], {
      count: 42,
      minDistance: 95,
      maxDistance: 180,
      durationMs: 980,
      size: 12,
    });
    addWinFlash("small");
    playWinStinger("small");
    window.setTimeout(function () {
      machineEl.classList.remove("is-win-celebrating");
    }, 900);
  }

  function pulseBigWin() {
    machineEl.classList.remove("is-big-win");
    void machineEl.offsetWidth;
    machineEl.classList.add("is-big-win");

    window.setTimeout(function () {
      machineEl.classList.remove("is-big-win");
    }, 2300);
  }

  function clampBet() {
    const maxAllowedBet = Math.min(MAX_BET, state.balance);

    if (maxAllowedBet < BET_STEP) {
      state.bet = 0;
      return;
    }

    state.bet = Math.max(BET_STEP, Math.min(state.bet, maxAllowedBet));

    if (state.bet % BET_STEP !== 0) {
      state.bet = state.bet - (state.bet % BET_STEP);
    }
  }

  function updateUi() {
    balanceEl.textContent = formatNumber(state.balance);
    betEl.textContent = formatNumber(state.bet);
    freeSpinsEl.textContent =
      state.freeSpins > 0
        ? formatNumber(state.freeSpins) + " • x" + formatNumber(state.freeSpinMultiplier)
        : "0";
    if (worldStageEl) {
      worldStageEl.textContent = formatNumber(state.worldStage);
    }
    soundButton.textContent = state.soundEnabled ? "Sound: On" : "Sound: Off";
    soundButton.setAttribute("aria-pressed", state.soundEnabled ? "true" : "false");

    if (musicButton) {
      musicButton.textContent = state.musicEnabled ? "Music: On" : "Music: Off";
      musicButton.setAttribute("aria-pressed", state.musicEnabled ? "true" : "false");
    }

    const hasCreditsForSpin = state.freeSpins > 0 || state.balance >= state.bet;

    spinButton.disabled = state.spinning || state.bet <= 0 || !hasCreditsForSpin;
    spinButton.classList.toggle("is-spinning", state.spinning);
    spinButton.classList.toggle("is-ready", !state.spinning && state.bet > 0 && hasCreditsForSpin);
    spinButton.innerHTML = state.spinning ? SPIN_BUTTON_SPINNING_HTML : SPIN_BUTTON_READY_HTML;
    resetButton.disabled = state.spinning;
    themeButton.disabled = state.spinning;
    guideButton.disabled = state.spinning;
    betDownButton.disabled = state.spinning || state.bet <= BET_STEP;
    betUpButton.disabled = state.spinning || state.bet >= Math.min(MAX_BET, state.balance);
    machineEl.classList.toggle("is-spinning", state.spinning);
  }

  function buildLocalBackground(palette) {
    return (
      "radial-gradient(circle at top, " +
      palette.accent +
      "33, transparent 30%), " +
      "radial-gradient(circle at bottom right, " +
      palette.glow +
      "26, transparent 35%), " +
      "linear-gradient(180deg, " +
      palette.surface +
      ", #090b14 100%)"
    );
  }

  function buildLocalThemeImageDataUrl(themeName, palette) {
    const svg = [
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>",
      "<defs>",
      "<linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>",
      "<stop offset='0%' stop-color='" + palette.surface + "' />",
      "<stop offset='100%' stop-color='#090b14' />",
      "</linearGradient>",
      "<radialGradient id='g1' cx='20%' cy='20%' r='45%'>",
      "<stop offset='0%' stop-color='" + palette.accent + "' stop-opacity='0.45' />",
      "<stop offset='100%' stop-color='" + palette.accent + "' stop-opacity='0' />",
      "</radialGradient>",
      "<radialGradient id='g2' cx='78%' cy='72%' r='42%'>",
      "<stop offset='0%' stop-color='" + palette.glow + "' stop-opacity='0.4' />",
      "<stop offset='100%' stop-color='" + palette.glow + "' stop-opacity='0' />",
      "</radialGradient>",
      "</defs>",
      "<rect width='1600' height='900' fill='url(#bg)'/>",
      "<rect width='1600' height='900' fill='url(#g1)'/>",
      "<rect width='1600' height='900' fill='url(#g2)'/>",
      "<g opacity='0.18' fill='" + palette.accentSoft + "'>",
      "<circle cx='220' cy='170' r='6'/>",
      "<circle cx='390' cy='260' r='4'/>",
      "<circle cx='1250' cy='180' r='5'/>",
      "<circle cx='1180' cy='330' r='3'/>",
      "<circle cx='980' cy='640' r='5'/>",
      "<circle cx='420' cy='700' r='4'/>",
      "</g>",
      "<text x='50%' y='84%' text-anchor='middle' fill='" + palette.accentSoft + "' opacity='0.24' font-size='64' font-family='Trebuchet MS, Segoe UI, sans-serif'>" +
        String(themeName || "Lynne's Slot Theme").replace(/&/g, "&amp;").replace(/</g, "&lt;") +
      "</text>",
      "</svg>",
    ].join("");
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function toCssImageUrl(rawValue) {
    const value = String(rawValue || "").trim();
    if (!value) {
      return "";
    }
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\)/g, "\\)");
  }

  function applyThemeData(themeData) {
    const palette = themeData.palette || localThemeStages[state.worldStage - 1].palette;

    document.documentElement.style.setProperty("--theme-accent", palette.accent);
    document.documentElement.style.setProperty("--theme-accent-soft", palette.accentSoft);
    document.documentElement.style.setProperty("--theme-glow", palette.glow);
    document.documentElement.style.setProperty("--theme-glow-soft", palette.glowSoft);
    document.documentElement.style.setProperty("--theme-shadow", palette.shadow);
    document.documentElement.style.setProperty("--theme-surface", palette.surface);

    state.themeName = themeData.themeName || state.themeName;
    state.themeCaption = themeData.caption || state.themeCaption;
    state.themeSource = themeData.source || "local";
    state.currentThemeImage = themeData.backgroundImageDataUrl || "";

    if (themeNameEl) {
      themeNameEl.textContent = state.themeName;
    }
    if (themeCaptionEl) {
      themeCaptionEl.textContent = state.themeCaption;
    }
    setThemeSourceLabel(state.themeSource);

    const localBackground = buildLocalBackground(palette);
    if (state.currentThemeImage) {
      const safeImageUrl = toCssImageUrl(state.currentThemeImage);
      const layeredImage =
        localBackground +
        ", linear-gradient(180deg, rgba(6, 6, 12, 0.18), rgba(5, 7, 12, 0.7)), url(\"" +
        safeImageUrl +
        "\")";
      themeSurfaceEl.style.backgroundImage = layeredImage;
      if (themePreviewEl) {
        themePreviewEl.style.backgroundImage = layeredImage;
      }
    } else {
      themeSurfaceEl.style.backgroundImage = localBackground;
      if (themePreviewEl) {
        themePreviewEl.style.backgroundImage = localBackground;
      }
    }
  }

  function getLocalThemeData() {
    const localTheme = localThemeStages[state.worldStage - 1];
    return {
      source: "local",
      themeName: localTheme.themeName,
      caption: localTheme.caption,
      palette: localTheme.palette,
      backgroundImageDataUrl: buildLocalThemeImageDataUrl(localTheme.themeName, localTheme.palette),
    };
  }

  /**
   * Offline “AI” theme: interprets the dream prompt with keyword moods (no network).
   * When a real backend exists at /api/ai/theme, that route takes precedence.
   */
  function localEvolveThemeFromPrompt(prompt) {
    const text = (prompt || "").toLowerCase();
    const base = getLocalThemeData();
    let themeName = base.themeName;
    let caption = base.caption;
    let palette = base.palette;

    if (/gold|sun|amber|lantern|honey/.test(text)) {
      themeName = "Gilded Sun Vault";
      caption = "Warm gold light spills across the reels like honey on velvet.";
      palette = {
        accent: "#ffcf63",
        accentSoft: "#ffe6a8",
        glow: "#54e7ff",
        glowSoft: "#c3f7ff",
        shadow: "#4b2f76",
        surface: "#2a1830",
      };
    } else if (/moon|night|velvet|midnight|noir/.test(text)) {
      themeName = "Midnight Velvet Observatory";
      caption = "Moonlit ribbons and soft hush shadows wrap each spin in calm drama.";
      palette = {
        accent: "#ff6bc4",
        accentSoft: "#ffd9ea",
        glow: "#85ffd9",
        glowSoft: "#d2fff2",
        shadow: "#4a2b71",
        surface: "#27193a",
      };
    } else if (/ocean|aqua|blue|teal|tide/.test(text)) {
      themeName = "Tidal Glass Atrium";
      caption = "Cool aquamarine shimmer and glass-bright reflections drift with the reels.";
      palette = {
        accent: "#7ee8ff",
        accentSoft: "#d2fbff",
        glow: "#b388ff",
        glowSoft: "#e8d4ff",
        shadow: "#1a3a4a",
        surface: "#152228",
      };
    } else if (/garden|rose|flower|bloom|petal/.test(text)) {
      themeName = "Rose Quartz Pavilion";
      caption = "Petals of soft pink light and gentle sparkle embrace every lucky moment.";
      palette = {
        accent: "#ff98c3",
        accentSoft: "#ffd9ea",
        glow: "#85ffd9",
        glowSoft: "#d2fff2",
        shadow: "#4a2b71",
        surface: "#27193a",
      };
    }

    return {
      source: "local-ai",
      themeName: themeName,
      caption: caption,
      palette: palette,
      backgroundImageDataUrl: buildLocalThemeImageDataUrl(themeName, palette),
      storyWhisper:
        "The room reshapes around your dream: " +
        themeName +
        ". The air tastes like possibility.",
    };
  }

  function localComposeMusicFromPrompt(prompt, worldStage) {
    const text = String(prompt || "").toLowerCase();
    const stagePulse = 0.1 + worldStage * 0.015;

    if (/moon|night|velvet|midnight|noir/.test(text)) {
      return {
        name: "Midnight Velvet Drift",
        wave: "sine",
        pulseHz: stagePulse,
        freqs: [130.81, 155.56, 196.0],
        brightness: 0.9,
      };
    }
    if (/gold|sun|amber|lantern|honey/.test(text)) {
      return {
        name: "Golden Lantern Waltz",
        wave: "triangle",
        pulseHz: stagePulse + 0.03,
        freqs: [146.83, 185.0, 220.0],
        brightness: 1.05,
      };
    }
    if (/ocean|aqua|blue|teal|tide/.test(text)) {
      return {
        name: "Tidal Glass Echo",
        wave: "sine",
        pulseHz: stagePulse + 0.02,
        freqs: [110.0, 146.83, 174.61],
        brightness: 0.95,
      };
    }
    if (/garden|rose|flower|bloom|petal/.test(text)) {
      return {
        name: "Rose Garden Lilt",
        wave: "triangle",
        pulseHz: stagePulse + 0.04,
        freqs: [174.61, 220.0, 261.63],
        brightness: 1.1,
      };
    }

    return {
      name: "Velvet Night Flow",
      wave: "sine",
      pulseHz: stagePulse,
      freqs: [130.81, 164.81, 196.0],
      brightness: 0.95,
    };
  }

  function applyMusicProfile(profile) {
    if (!profile || !Array.isArray(profile.freqs) || profile.freqs.length < 2) {
      return;
    }
    state.musicProfile = {
      name: profile.name || "Dream Lounge Mix",
      wave: profile.wave || "sine",
      pulseHz: Number(profile.pulseHz) || 0.12,
      brightness: Number(profile.brightness) || 1,
      freqs: profile.freqs.slice(0, 4).map(function (value) {
        return Number(value) || 130.81;
      }),
    };

    if (state.musicEnabled) {
      restartAmbientMusic();
    }
  }

  /** Rich offline narrator when /api/ai/story is unavailable (static hosting). */
  function localGuideNarrative(eventType, payload) {
    const room = state.themeName;
    const bal = formatNumber(state.balance);

    switch (eventType) {
      case "big_win":
        return (
          "Listen — " +
          room +
          " just lit up for Lynne. The reels agreed: " +
          (payload.recentOutcome || "a dazzling hit") +
          ". Balance glows at " +
          bal +
          " credits."
        );
      case "diamond_bonus":
        return (
          "Three diamonds woke the vault. " +
          room +
          " hums a little brighter. Choose crystals like you're choosing constellations — each one remembers your luck."
        );
      case "free_spin_bonus":
        return (
          "Sevens carved a doorway of free spins. " +
          room +
          " offers three moods: moonlight drift, starfall balance, or comet sprint. Pick what your heart wants next."
        );
      case "treasure_shelf":
        return (
          "Three bells opened the Treasure Shelf. " +
          room +
          " leans in: one shelf is steady, one is velvet-soft adventure, one is a golden pop of surprise."
        );
      case "guide":
        return (
          "Before the next spin, Lynne, imagine the payline as a ribbon of light. " +
          room +
          " is listening — breathe once, then let the reels decide the story."
        );
      default:
        return (
          (payload && payload.recentOutcome) ||
          "The lounge holds its breath between spins. " + room + " keeps a little sparkle in reserve just for you."
        );
    }
  }

  /** Short line after each spin so the story panel always moves (unless a bigger guide moment just ran). */
  function localSpinFlavor(result, usingFreeSpin, outcomeIds) {
    const room = state.themeName;
    const freeBit = usingFreeSpin ? " Free-spin moonlight still lingers on the glass." : "";

    if (result.kind === "none") {
      const faces = outcomeIds
        .map(function (id) {
          return symbolMap[id] ? symbolMap[id].icon : "?";
        })
        .join(" ");
      return (
        "The reels exhaled " +
        faces +
        " across the payline in " +
        room +
        "." +
        freeBit +
        " Lynne, even a quiet spin nudges the story forward — try once more."
      );
    }

    if (result.kind === "two") {
      const sym = symbolMap[result.symbolId];
      const name = sym ? sym.name : "symbol";
      return (
        "Two matching " +
        name +
        " symbols leaned together in " +
        room +
        " — close enough to feel lucky." +
        freeBit +
        " The next beat might lock all three."
      );
    }

    if (result.kind === "three") {
      const sym = symbolMap[result.symbolId];
      const name = sym ? sym.name : "symbol";
      return (
        "Three " +
        name +
        " symbols lined up like a tiny headline in " +
        room +
        ". " +
        result.description +
        " paid out — the Lucky Guide is grinning." +
        freeBit
      );
    }

    return (
      "Something unusual settled on the reels in " +
      room +
      ". " +
      (result.description || "The lounge keeps its secrets.") +
      freeBit
    );
  }

  function shouldTriggerSparkBonus(result) {
    if (
      result.kind === "three" &&
      (result.symbolId === "diamond" || result.symbolId === "seven" || result.symbolId === "bell")
    ) {
      return false;
    }
    if (state.spinCount > 0 && state.spinCount % SPARK_BONUS_EVERY_N_SPINS === 0) {
      return true;
    }
    return Math.random() < MYSTERY_SPARK_CHANCE;
  }

  function buildMysterySparkOptions(baseBet) {
    const pool = shuffle([2, 3, 4, 5, 6, 7, 8]);
    const labels = ["Amber", "Rose", "Sky"];
    return pool.slice(0, 3).map(function (m, i) {
      const credits = baseBet * m;
      return {
        title: labels[i] + " Spark",
        subtitle: "Tap to reveal your surprise",
        rewardText: "+" + formatNumber(credits) + " credits",
        credits: credits,
        summaryText:
          "The " +
          labels[i].toLowerCase() +
          " spark paid " +
          formatNumber(credits) +
          " credits (" +
          m +
          "× bet).",
      };
    });
  }

  async function runMysterySparkBonus(baseBet) {
    createExplosionBurst(["#fff0a3", "#ff6ec7", "#7df9ff", "#ffffff"]);
    sound.bonus();
    showMessage("Mystery Spark! Pick a lucky glimmer.", "bonus");

    const reward = await presentSinglePickBonus({
      kicker: "Mystery Spark",
      title: "Pick one glowing spark",
      description:
        "A surprise mini-bonus between bigger moments — one tap, instant coins. The lounge saves these for lucky timing.",
      summary: "One pick only. Every spark pays.",
      options: buildMysterySparkOptions(baseBet),
    });

    state.balance += reward.credits;
    state.bonusMoments += 1;
    showMessage(reward.summaryText, "bonus");
    setStoryOutput(
      "✨ Mystery Spark danced through " +
        state.themeName +
        ". " +
        reward.summaryText +
        " Little bonuses like this keep the night exciting even when the rare triples hide."
    );
    await delay(200);
  }

  function setIdleReels() {
    const reelHeight = getReelHeight();

    reelEls.forEach(function (reelEl, reelIndex) {
      const strip = buildStrip(chooseWeightedSymbol(), BASE_STRIP_LENGTH + reelIndex * 4);
      renderStrip(reelEl, strip);
      reelEl.style.transition = "none";
      reelEl.style.transform = "translateY(-" + ((strip.length - 1) * reelHeight) + "px)";
    });
  }

  function evaluateResult(outcomeIds) {
    const first = outcomeIds[0];
    const second = outcomeIds[1];
    const third = outcomeIds[2];
    const fourth = outcomeIds[3];
    const fifth = outcomeIds[4];

    if (first === second && second === third && third === fourth && fourth === fifth) {
      const symbol = symbolMap[first];
      return {
        multiplier: symbol.multiplier * 3,
        winningReels: [0, 1, 2, 3, 4],
        kind: "five",
        symbolId: first,
        description: symbol.name + " x5",
      };
    }

    const fourOfAKind = checkFourOfAKind(outcomeIds);
    if (fourOfAKind) {
      const symbol = symbolMap[fourOfAKind.symbolId];
      return {
        multiplier: symbol.multiplier * 2,
        winningReels: fourOfAKind.reels,
        kind: "four",
        symbolId: fourOfAKind.symbolId,
        description: symbol.name + " x4",
      };
    }

    const threeOfAKind = checkThreeOfAKind(outcomeIds);
    if (threeOfAKind) {
      const symbol = symbolMap[threeOfAKind.symbolId];
      return {
        multiplier: symbol.multiplier,
        winningReels: threeOfAKind.reels,
        kind: "three",
        symbolId: threeOfAKind.symbolId,
        description: symbol.name + " x3",
      };
    }

    const specialResult = checkSpecialSymbols(outcomeIds);
    if (specialResult) {
      return specialResult;
    }

    const twoOfAKind = checkTwoOfAKind(outcomeIds);
    if (twoOfAKind) {
      return {
        multiplier: TWO_MATCH_MULTIPLIER,
        winningReels: twoOfAKind.reels,
        kind: "two",
        symbolId: twoOfAKind.symbolId,
        description: "Two matching symbols",
      };
    }

    return {
      multiplier: 0,
      winningReels: [],
      kind: "none",
      description: "No win",
    };
  }

  function checkFourOfAKind(outcomeIds) {
    const counts = {};
    outcomeIds.forEach((id, index) => {
      if (!counts[id]) counts[id] = [];
      counts[id].push(index);
    });

    for (const [symbolId, reels] of Object.entries(counts)) {
      if (reels.length === 4) {
        return { symbolId, reels };
      }
    }
    return null;
  }

  function checkThreeOfAKind(outcomeIds) {
    const counts = {};
    outcomeIds.forEach((id, index) => {
      if (!counts[id]) counts[id] = [];
      counts[id].push(index);
    });

    for (const [symbolId, reels] of Object.entries(counts)) {
      if (reels.length === 3) {
        return { symbolId, reels };
      }
    }
    return null;
  }

  function checkTwoOfAKind(outcomeIds) {
    const counts = {};
    outcomeIds.forEach((id, index) => {
      if (!counts[id]) counts[id] = [];
      counts[id].push(index);
    });

    for (const [symbolId, reels] of Object.entries(counts)) {
      if (reels.length === 2) {
        return { symbolId, reels };
      }
    }
    return null;
  }

  function checkSpecialSymbols(outcomeIds) {
    const wildCount = outcomeIds.filter(id => id === 'wild').length;
    if (wildCount >= 3) {
      return {
        multiplier: symbolMap['wild'].multiplier * 2,
        winningReels: outcomeIds.map((id, index) => id === 'wild' ? index : -1).filter(i => i >= 0),
        kind: "special",
        symbolId: 'wild',
        description: "WILD x" + wildCount,
      };
    }

    const vegasCount = outcomeIds.filter(id => id === 'vegas').length;
    if (vegasCount >= 3) {
      return {
        multiplier: symbolMap['vegas'].multiplier,
        winningReels: outcomeIds.map((id, index) => id === 'vegas' ? index : -1).filter(i => i >= 0),
        kind: "bonus",
        symbolId: 'vegas',
        description: "VEGAS BABY FREE SPINS!",
      };
    }

    const coinCount = outcomeIds.filter(id => id === 'coin').length;
    if (coinCount >= 3) {
      return {
        multiplier: symbolMap['coin'].multiplier,
        winningReels: outcomeIds.map((id, index) => id === 'coin' ? index : -1).filter(i => i >= 0),
        kind: "jackpot",
        symbolId: 'coin',
        description: "COIN JACKPOT!",
      };
    }

    return null;
  }

  function highlightWinningSymbols(reelIndexes) {
    reelIndexes.forEach(function (reelIndex) {
      const reelSymbols = reelEls[reelIndex].querySelectorAll(".reel-symbol");
      const lastVisibleSymbol = reelSymbols[reelSymbols.length - 1];

      if (lastVisibleSymbol) {
        lastVisibleSymbol.classList.add("is-winning");
      }
    });
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function spinSingleReel(reelEl, strip, reelIndex) {
    const reelHeight = getReelHeight();
    const finalPosition = (strip.length - 1) * reelHeight;
    let currentPosition = 0;
    let animationFrameId = 0;
    let running = true;
    let previousTime = performance.now();

    renderStrip(reelEl, strip);
    reelEl.style.transition = "none";
    reelEl.style.transform = "translateY(0)";

    function animate(time) {
      if (!running) {
        return;
      }

      const elapsed = Math.min(time - previousTime, 32);
      previousTime = time;
      currentPosition += elapsed * (1.78 + reelIndex * 0.28);

      if (currentPosition > finalPosition - reelHeight * 2.2) {
        currentPosition = reelHeight * (1.2 + reelIndex * 0.06);
      }

      reelEl.style.transform = "translateY(-" + currentPosition + "px)";
      animationFrameId = window.requestAnimationFrame(animate);
    }

    animationFrameId = window.requestAnimationFrame(animate);

    return {
      stop: function () {
        running = false;
        window.cancelAnimationFrame(animationFrameId);

        return new Promise(function (resolve) {
          const settleTime = 560 + reelIndex * 130;

          reelEl.style.transition = "transform " + settleTime + "ms cubic-bezier(0.2, 0.92, 0.2, 1)";
          reelEl.style.transform = "translateY(-" + finalPosition + "px)";

          sound.reelStop();

          window.setTimeout(function () {
            reelEl.style.transition = "none";
            resolve();
          }, settleTime + 40);
        });
      },
    };
  }

  function apiBaseUrl() {
    if (typeof window !== "undefined" && window.__API_BASE__) {
      return String(window.__API_BASE__).replace(/\/$/, "");
    }
    return "";
  }

  /** GitHub Pages / file:// have no /api — avoid failed fetches and use offline copy immediately. */
  function useOfflineAiOnly() {
    if (apiBaseUrl()) {
      return false;
    }
    if (typeof window === "undefined" || !window.location) {
      return false;
    }
    const host = window.location.hostname || "";
    if (host.indexOf("github.io") !== -1) {
      return true;
    }
    if (window.location.protocol === "file:") {
      return true;
    }
    return false;
  }

  async function fetchJson(urlPath, body) {
    const base = apiBaseUrl();
    const url = base ? base + urlPath : urlPath;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  }

  async function requestGuideStory(eventType, extra) {
    const payload = Object.assign(
      {
        eventType: eventType,
        themeName: state.themeName,
        balance: state.balance,
        bet: state.bet,
        bonusRound: null,
        worldStage: state.worldStage,
        recentOutcome: "The lounge is waiting for the next special moment.",
      },
      extra || {}
    );

    if (useOfflineAiOnly()) {
      setStoryOutput(localGuideNarrative(eventType, payload));
      setAiStatus(
        "Offline guide (static site). Set __API_BASE__ to your Railway URL or play the full app on Railway for live AI."
      );
      return;
    }

    try {
      const result = await fetchJson("/api/ai/story", payload);
      setStoryOutput(result.message);
      setAiStatus(result.source === "openai" ? "Lucky Guide is speaking live" : "Lucky Guide is using cozy fallback mode");
    } catch (error) {
      setStoryOutput(localGuideNarrative(eventType, payload));
      setAiStatus("Offline smart guide — deploy /api/ai/story for live AI");
    }
  }

  async function evolveTheme(reason) {
    const localTheme = getLocalThemeData();
    setAiStatus("Generating the next bonus world...");
    themeButton.disabled = true;

    if (useOfflineAiOnly()) {
      const offline = localEvolveThemeFromPrompt(themePromptEl.value);
      applyMusicProfile(localComposeMusicFromPrompt(themePromptEl.value, state.worldStage));
      applyThemeData({
        source: offline.source,
        themeName: offline.themeName,
        caption: offline.caption,
        palette: offline.palette,
        backgroundImageDataUrl: offline.backgroundImageDataUrl || "",
      });
      if (offline.storyWhisper) {
        setStoryOutput(offline.storyWhisper);
      }
      setAiStatus(
        "Offline dream engine generated theme visuals and music mood."
      );
      updateUi();
      return;
    }

    try {
      const result = await fetchJson("/api/ai/theme", {
        themePrompt: themePromptEl.value,
        worldStage: state.worldStage,
        reason: reason,
        currentTheme: state.themeName,
      });

      applyThemeData({
        source: result.source || localTheme.source,
        themeName: result.themeName || localTheme.themeName,
        caption: result.caption || localTheme.caption,
        palette: result.palette || localTheme.palette,
        backgroundImageDataUrl: result.backgroundImageDataUrl || "",
      });
      applyMusicProfile(result.musicProfile || localComposeMusicFromPrompt(themePromptEl.value, state.worldStage));

      if (result.storyWhisper) {
        setStoryOutput(result.storyWhisper);
      }

      setAiStatus(
        result.source === "openai-image"
          ? "Live AI art is active for this world stage"
          : result.source === "openai-text"
            ? "AI designed a new world palette and story"
            : "Using local cozy art fallback"
      );
    } catch (error) {
      const offline = localEvolveThemeFromPrompt(themePromptEl.value);
      applyMusicProfile(localComposeMusicFromPrompt(themePromptEl.value, state.worldStage));
      applyThemeData({
        source: offline.source,
        themeName: offline.themeName,
        caption: offline.caption,
        palette: offline.palette,
        backgroundImageDataUrl: offline.backgroundImageDataUrl || "",
      });
      if (offline.storyWhisper) {
        setStoryOutput(offline.storyWhisper);
      }
      setAiStatus("Offline dream engine generated local image style + music mood");
    } finally {
      updateUi();
    }
  }

  function maybeAdvanceWorldStage(reason) {
    const shouldAdvance = state.worldStage < 5;

    if (!shouldAdvance) {
      return Promise.resolve();
    }

    state.worldStage += 1;
    updateUi();
    return evolveTheme(reason);
  }

  function getDiamondBonusMultiplier() {
    const bonusOptions = [2, 3, 4, 5, 8, 10];
    return bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
  }

  function buildDiamondVaultRewards(baseBet) {
    const stageBoost = state.worldStage;
    return shuffle([
      {
        title: "Aurora Prism",
        subtitle: "A warm glowing crystal",
        rewardText: "+" + formatNumber(baseBet * (4 + stageBoost)) + " credits",
        credits: baseBet * (4 + stageBoost),
        stageBoost: 0,
      },
      {
        title: "Ribbon Sapphire",
        subtitle: "Velvet luck bundled inside",
        rewardText: "+" + formatNumber(baseBet * (5 + stageBoost)) + " credits",
        credits: baseBet * (5 + stageBoost),
        stageBoost: 0,
      },
      {
        title: "Moonfire Diamond",
        subtitle: "A brighter premium cache",
        rewardText: "+" + formatNumber(baseBet * (7 + stageBoost)) + " credits",
        credits: baseBet * (7 + stageBoost),
        stageBoost: 0,
      },
      {
        title: "Sky Vault Key",
        subtitle: "Unlocks a world-stage leap",
        rewardText: "+" + formatNumber(baseBet * 3) + " credits and +1 world stage",
        credits: baseBet * 3,
        stageBoost: 1,
      },
      {
        title: "Jackpot Facet",
        subtitle: "The richest crystal in the room",
        rewardText: "+" + formatNumber(baseBet * (10 + stageBoost)) + " credits",
        credits: baseBet * (10 + stageBoost),
        stageBoost: 0,
      },
      {
        title: "Soft Gold Cluster",
        subtitle: "A quiet but lovely bonus",
        rewardText: "+" + formatNumber(baseBet * (3 + stageBoost)) + " credits",
        credits: baseBet * (3 + stageBoost),
        stageBoost: 0,
      },
    ]);
  }

  async function runDiamondBonus(baseBet) {
    let totalBonus = 0;
    let extraStageBoost = 0;

    showMessage("Diamond Vault is open. Pick 3 crystals and build your reward chest.", "bonus");
    createExplosionBurst(["#9ef3ff", "#ffffff", "#54e7ff", "#8f72ff"]);
    sound.bonus();
    await requestGuideStory("diamond_bonus", {
      bonusRound: "Diamond Vault",
      recentOutcome: "Three diamonds woke up the premium Diamond Vault room.",
    });

    const picks = await presentMultiPickBonus({
      kicker: "Diamond Vault",
      title: "Choose 3 crystal chambers",
      description: "Each chamber hides a richer reward. Some crystals carry extra world energy.",
      options: buildDiamondVaultRewards(baseBet),
      pickCount: 3,
      summaryBuilder: function (selectedOptions) {
        const coinTotal = selectedOptions.reduce(function (sum, option) {
          return sum + option.credits;
        }, 0);
        const stageTotal = selectedOptions.reduce(function (sum, option) {
          return sum + option.stageBoost;
        }, 0);
        return "Vault total so far: " + formatNumber(coinTotal) + " credits" + (stageTotal ? " and +" + stageTotal + " stage." : ".");
      },
    });

    picks.forEach(function (pick) {
      totalBonus += pick.credits;
      extraStageBoost += pick.stageBoost;
    });

    state.balance += totalBonus;
    return {
      credits: totalBonus,
      extraStageBoost: extraStageBoost,
    };
  }

  async function runSevenBonus() {
    const freeSpinPackages = [
      {
        title: "Moonlight Drift",
        subtitle: "Longer gentle run",
        rewardText: "5 free spins at x2",
        spins: 5,
        multiplier: 2,
        summaryText: "You chose a calm, steady climb: 5 free spins with a 2x win multiplier.",
      },
      {
        title: "Starfall Burst",
        subtitle: "Balanced premium run",
        rewardText: "4 free spins at x3",
        spins: 4,
        multiplier: 3,
        summaryText: "You chose the richer middle path: 4 free spins with a 3x win multiplier.",
      },
      {
        title: "Jackpot Comet",
        subtitle: "Short but explosive",
        rewardText: "3 free spins at x4",
        spins: 3,
        multiplier: 4,
        summaryText: "You chose the bold sprint: 3 free spins with a 4x win multiplier.",
      },
    ];

    createExplosionBurst(["#ff4eb5", "#ffcf63", "#ffffff", "#ff7884"]);
    pulseBigWin();
    sound.bonus();

    await requestGuideStory("free_spin_bonus", {
      bonusRound: "Starfall Spins",
      recentOutcome: "Three sevens opened a brighter starfall free-spin room.",
    });

    const chosenPackage = await presentSinglePickBonus({
      kicker: "Starfall Spins",
      title: "Choose your free-spin path",
      description: "Each path changes how powerful your next run feels. Pick the style that matches your mood.",
      summary: "One pick only. Higher multipliers mean fewer spins, but bigger hits.",
      options: freeSpinPackages,
    });

    state.freeSpins += chosenPackage.spins;
    state.freeSpinMultiplier = chosenPackage.multiplier;
    state.freeSpinLabel = chosenPackage.title;

    showMessage(
      chosenPackage.summaryText,
      "bonus"
    );
    await delay(320);

    return chosenPackage;
  }

  async function runBellBonus(baseBet) {
    createExplosionBurst(["#ffd892", "#ffcf63", "#ffffff"]);
    sound.bonus();
    await requestGuideStory("treasure_shelf", {
      bonusRound: "Treasure Shelf",
      recentOutcome: "Three bells opened a cozy Treasure Shelf bonus choice.",
    });

    const options = [
      {
        title: "Lantern Shelf",
        subtitle: "Steady warm rewards",
        rewardText: "+" + formatNumber(baseBet * 4) + " credits",
        credits: baseBet * 4,
        stageBoost: 0,
        summaryText: "The lantern shelf poured out a calm, dependable prize.",
      },
      {
        title: "Velvet Drawer",
        subtitle: "Coins and richer mood",
        rewardText: "+" + formatNumber(baseBet * 3) + " credits and +1 world stage",
        credits: baseBet * 3,
        stageBoost: 1,
        summaryText: "The velvet drawer carried coins and a stronger world shift.",
      },
      {
        title: "Golden Trinket Box",
        subtitle: "Short but sweet jackpot pop",
        rewardText: "+" + formatNumber(baseBet * 6) + " credits",
        credits: baseBet * 6,
        stageBoost: 0,
        summaryText: "The golden trinket box snapped open with a richer burst of coins.",
      },
    ];

    const reward = await presentSinglePickBonus({
      kicker: "Treasure Shelf",
      title: "Choose one shelf reward",
      description: "The bells opened a warm little shelf of hidden treats. Pick the one that feels lucky.",
      summary: "One pick only. Some shelves boost coins, one shelf advances the world.",
      options: options,
    });

    state.balance += reward.credits;
    showMessage(reward.summaryText, "bonus");
    return reward;
  }

  async function handleBonusRounds(result, baseBet) {
    let bonusWinnings = 0;
    let extraStageBoost = 0;

    if (result.kind === "three" && result.symbolId === "diamond") {
      const diamondBonus = await runDiamondBonus(baseBet);
      bonusWinnings += diamondBonus.credits;
      extraStageBoost += diamondBonus.extraStageBoost;
      state.bonusMoments += 1;
      await maybeAdvanceWorldStage("diamond bonus celebration");
    }

    if (result.kind === "three" && result.symbolId === "seven") {
      await runSevenBonus();
      state.bonusMoments += 1;
      await maybeAdvanceWorldStage("free spin storm");
    }

    if (result.kind === "three" && result.symbolId === "bell") {
      const bellBonus = await runBellBonus(baseBet);
      bonusWinnings += bellBonus.credits;
      extraStageBoost += bellBonus.stageBoost;
      state.bonusMoments += 1;
      await maybeAdvanceWorldStage("treasure shelf glow");
    }

    while (extraStageBoost > 0 && state.worldStage < 5) {
      extraStageBoost -= 1;
      await maybeAdvanceWorldStage("bonus room stage leap");
    }

    return bonusWinnings;
  }

  async function playSpin() {
    if (state.spinning) {
      return;
    }

    sound.click();
    if (state.musicEnabled && !state.musicPlaying) {
      safeStartAmbientMusic();
    }

    if (state.bet <= 0) {
      showMessage("Your bet is too low. Raise it to at least 10 virtual coins.", "loss");
      updateUi();
      return;
    }

    if (state.freeSpins === 0 && state.balance < state.bet) {
      showMessage("Not enough virtual coins for that spin. Lower your bet or press Reset.", "loss");
      updateUi();
      return;
    }

    const balanceBeforeRound = state.balance;
    state.spinning = true;
    state.spinCount += 1;
    clearWinningHighlights();
    if (winAmountEl) {
      winAmountEl.textContent = "0";
    }

    const usingFreeSpin = state.freeSpins > 0;
    const wager = state.bet;

    if (usingFreeSpin) {
      state.freeSpins -= 1;
      showMessage("Free spin activated. This spin pays 2x on wins.", "bonus");
    } else {
      state.balance -= wager;
      showMessage("Spinning for " + formatNumber(wager) + " VC... good luck!", "");
    }

    updateUi();

    const outcomeIds = [
      chooseWeightedSymbol(), 
      chooseWeightedSymbol(), 
      chooseWeightedSymbol(), 
      chooseWeightedSymbol(), 
      chooseWeightedSymbol()
    ];
    const strips = outcomeIds.map(function (symbolId, reelIndex) {
      return buildStrip(symbolId, BASE_STRIP_LENGTH + reelIndex * 8);
    });

    const reelControllers = reelEls.map(function (reelEl, reelIndex) {
      return spinSingleReel(reelEl, strips[reelIndex], reelIndex);
    });

    for (let reelIndex = 0; reelIndex < reelControllers.length; reelIndex += 1) {
      await reelControllers[reelIndex].stop();
      if (reelIndex < reelControllers.length - 1) {
        await delay(Math.max(84, 150 - reelIndex * 18));
      }
    }

    const result = evaluateResult(outcomeIds);
    const payoutMultiplier = usingFreeSpin ? result.multiplier * state.freeSpinMultiplier : result.multiplier;
    const baseWinnings = wager * payoutMultiplier;
    let bonusWinnings = 0;

    if (result.multiplier > 0) {
      state.balance += baseWinnings;
      highlightWinningSymbols(result.winningReels);

      // Show big win display for large wins
      if (baseWinnings >= 500 || result.kind === "five" || result.kind === "jackpot") {
        if (bigWinDisplayEl && bigWinNumberEl) {
          bigWinNumberEl.textContent = formatNumber(baseWinnings);
          bigWinDisplayEl.classList.remove("hidden");
          setTimeout(() => {
            bigWinDisplayEl.classList.add("hidden");
          }, 3000);
        }
      }

      if (payoutMultiplier >= BIG_WIN_MULTIPLIER) {
        pulseBigWin();
        triggerWinExplosion("big");
        sound.bigWin();
        await requestGuideStory("big_win", {
          recentOutcome: result.description + " paid " + formatNumber(baseWinnings) + " virtual coins.",
        });
        await maybeAdvanceWorldStage("big win evolution");
      } else {
        triggerWinExplosion("small");
        sound.smallWin();
      }

      bonusWinnings = await handleBonusRounds(result, wager);
    }

    const premiumTriple =
      result.kind === "three" &&
      (result.symbolId === "diamond" || result.symbolId === "seven" || result.symbolId === "bell");
    if (payoutMultiplier < BIG_WIN_MULTIPLIER && !premiumTriple) {
      setStoryOutput(localSpinFlavor(result, usingFreeSpin, outcomeIds));
    }

    let sparkTriggered = false;
    if (shouldTriggerSparkBonus(result)) {
      sparkTriggered = true;
      await runMysterySparkBonus(wager);
    }

    const totalRoundWin = baseWinnings + bonusWinnings;
    const netChange = state.balance - balanceBeforeRound;
    const betLabel = usingFreeSpin ? "Free spin" : "Bet " + formatNumber(wager) + " VC";
    let roundSummary = "";
    let roundTone = "loss";

    if (totalRoundWin > 0) {
      const winLead = payoutMultiplier >= BIG_WIN_MULTIPLIER ? "JACKPOT HIT!" : "WIN!";
      const bonusLabel = bonusWinnings > 0 ? " + Bonus " + formatNumber(bonusWinnings) + " VC" : "";
      const sparkLabel = sparkTriggered ? " + Mystery Spark" : "";
      roundSummary =
        winLead +
        " " +
        result.description +
        " • " +
        betLabel +
        " • +" +
        formatNumber(totalRoundWin) +
        " VC" +
        bonusLabel +
        sparkLabel +
        " • Balance " +
        formatNumber(state.balance) +
        " VC";
      roundTone = payoutMultiplier >= BIG_WIN_MULTIPLIER ? "big-win" : (bonusWinnings > 0 ? "bonus" : "win");
      pulseStatusCard(winAmountEl, "win");
      pulseStatusCard(balanceEl, "win");
    } else {
      roundSummary =
        (usingFreeSpin ? "No win this free spin." : "No win this round.") +
        " " +
        betLabel +
        " • " +
        (usingFreeSpin ? "0 VC spent" : "-" + formatNumber(wager) + " VC") +
        " • Balance " +
        formatNumber(state.balance) +
        " VC";
      if (sparkTriggered && netChange > 0) {
        roundSummary += " • Mystery Spark kept this round profitable.";
        pulseStatusCard(balanceEl, "win");
      } else {
        pulseStatusCard(balanceEl, "loss");
      }
    }
    if (winAmountEl) {
      winAmountEl.textContent = formatNumber(totalRoundWin);
    }
    showMessage(roundSummary, roundTone);

    if (state.freeSpins === 0) {
      state.freeSpinMultiplier = FREE_SPIN_MULTIPLIER;
      state.freeSpinLabel = "Moonlight x2";
    }

    clampBet();
    state.spinning = false;
    updateUi();
  }

  function changeBet(direction) {
    if (state.spinning) {
      return;
    }

    sound.click();
    state.bet += direction * BET_STEP;
    clampBet();
    updateUi();
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    updateUi();
  }

  function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;
    if (state.musicEnabled) {
      audioUnlocked = true;
      safeStartAmbientMusic();
    } else {
      ambientMusic.stop();
    }
    updateUi();
  }

  function unlockAudioOnFirstGesture() {
    let unlocked = false;

    function unlock() {
      if (unlocked) {
        return;
      }
      unlocked = true;
      audioUnlocked = true;

      const ctx = ensureAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(function () {});
      }

      if (state.musicEnabled && !state.musicPlaying) {
        safeStartAmbientMusic();
      }

      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    }

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
  }

  function resetGame() {
    if (state.spinning) {
      return;
    }

    sound.click();
    state.balance = START_BALANCE;
    state.bet = DEFAULT_BET;
    state.freeSpins = 0;
    state.freeSpinMultiplier = FREE_SPIN_MULTIPLIER;
    state.freeSpinLabel = "Moonlight x2";
    state.worldStage = 1;
    state.bonusMoments = 0;
    state.spinCount = 0;
    state.musicEnabled = true;
    ambientMusic.stop();
    clearWinningHighlights();
    effectsLayerEl.innerHTML = "";
    closeBonusOverlay();
    clampBet();
    applyThemeData(getLocalThemeData());
    setIdleReels();
    showMessage("Game reset. Lynne's lounge is calm again and ready for a fresh lucky run.", "");
    setStoryOutput("The velvet room settled back into its opening glow. We can start a brand new story whenever you want.");
    setAiStatus("World reset to stage 1");
    updateUi();
  }

  function init() {
    clampBet();
    applyThemeData(getLocalThemeData());
    applyMusicProfile(localComposeMusicFromPrompt(themePromptEl.value, state.worldStage));
    setIdleReels();
    updateUi();
    setStoryOutput("The room is settled into a velvet glow. When you are ready, I will help the world bloom.");
    showMessage("Welcome to Lynne's AI Slot Deluxe. Let the room glow, then press Spin.", "");
    setAiStatus(
      useOfflineAiOnly()
        ? "Offline guide on this host — spins still narrate; Railway full deploy = live AI"
        : "Offline AI + music ready (optional /api routes for live models)"
    );

    spinButton.addEventListener("click", playSpin);
    resetButton.addEventListener("click", resetGame);
    soundButton.addEventListener("click", toggleSound);
    if (musicButton) {
      musicButton.addEventListener("click", function () {
        sound.click();
        toggleMusic();
      });
    }
    unlockAudioOnFirstGesture();
    themeButton.addEventListener("click", function () {
      sound.click();
      evolveTheme("manual theme request from Lynne");
    });
    guideButton.addEventListener("click", function () {
      sound.click();
      requestGuideStory("guide", {
        recentOutcome: "Lynne asked for a warm suggestion before the next set of spins.",
      });
    });
    betDownButton.addEventListener("click", function () {
      changeBet(-1);
    });
    betUpButton.addEventListener("click", function () {
      changeBet(1);
    });
    
    // New button event handlers
    paytableButton.addEventListener("click", function () {
      sound.click();
      showMessage("Pay Table: Cherry 3x=2x, Lemon 3x=3x, Plum 3x=4x, Orange 3x=4x, Watermelon 3x=5x, Bell 3x=8x, Horseshoe 3x=10x, WILD substitutes any symbol, VEGAS triggers free spins, Coin 3x=50x, Seven 3x=30x");
    });
    
    partyCharmsButton.addEventListener("click", function () {
      sound.click();
      showMessage("Party Charms: Special bonus features coming soon!");
    });
    
    treasureBoxButton.addEventListener("click", function () {
      sound.click();
      showMessage("Treasure Box: Daily rewards and prizes coming soon!");
    });
    window.addEventListener("resize", function () {
      if (!state.spinning) {
        setIdleReels();
      }
    });
  }

  init();
});
