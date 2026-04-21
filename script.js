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

  const symbols = [
    { id: "cherry", name: "Cherry", icon: "🍒", weight: 32, multiplier: 2 },
    { id: "lemon", name: "Lemon", icon: "🍋", weight: 28, multiplier: 3 },
    { id: "bell", name: "Bell", icon: "🔔", weight: 20, multiplier: 5 },
    { id: "diamond", name: "Diamond", icon: "💎", weight: 12, multiplier: 10 },
    { id: "seven", name: "Seven", icon: "7", weight: 8, multiplier: 20 },
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
    musicEnabled: false,
    musicPlaying: false,
    voiceGuideEnabled: false,
    themeName: localThemeStages[0].themeName,
    currentThemeImage: "",
    themeCaption: localThemeStages[0].caption,
    themeSource: "local",
    bonusMoments: 0,
  };

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
  const soundButton = document.getElementById("sound-button");
  const musicButton = document.getElementById("music-button");
  const voiceGuideEl = document.getElementById("voice-guide");
  const themeButton = document.getElementById("theme-button");
  const guideButton = document.getElementById("guide-button");
  const bonusVideoBgEl = document.getElementById("bonus-video-bg");
  const spinButton = document.getElementById("spin-button");
  const resetButton = document.getElementById("reset-button");
  const betDownButton = document.getElementById("bet-down");
  const betUpButton = document.getElementById("bet-up");
  const reelEls = [
    document.getElementById("reel-0"),
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
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
      const master = ctx.createGain();
      master.gain.value = 0.032;
      const freqs = [130.81, 164.81, 196.0];
      freqs.forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = 0.22 + i * 0.06;
        osc.connect(g);
        g.connect(master);
        osc.start();
        ambientMusic.nodes.push(osc, g);
      });
      master.connect(ctx.destination);
      ambientMusic.nodes.push(master);
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

  function addStoryMoment(text) {
    const storyItem = document.createElement("li");
    storyItem.textContent = text;
    storyLogEl.prepend(storyItem);

    while (storyLogEl.children.length > STORY_LOG_LIMIT) {
      storyLogEl.removeChild(storyLogEl.lastElementChild);
    }
  }

  function setStoryOutput(text) {
    storyOutputEl.textContent = text;
    addStoryMoment(text);
    if (voiceGuideEl && voiceGuideEl.checked && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const line = new SpeechSynthesisUtterance(text);
      line.rate = 0.96;
      line.pitch = 1.05;
      window.speechSynthesis.speak(line);
    }
  }

  function setAiStatus(text) {
    aiStatusEl.textContent = text;
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
    themeSourceEl.textContent = prettySource;
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
    if (bonusVideoBgEl) {
      if (isVisible) {
        bonusVideoBgEl.play().catch(function () {});
      } else {
        bonusVideoBgEl.pause();
        bonusVideoBgEl.currentTime = 0;
      }
    }
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

  function createExplosionBurst(colors) {
    const centerX = 50;
    const centerY = 45;

    for (let index = 0; index < 22; index += 1) {
      const particleEl = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 22;
      const distance = 90 + Math.random() * 130;
      const color = colors[index % colors.length];

      particleEl.className = "particle";
      particleEl.style.left = centerX + "%";
      particleEl.style.top = centerY + "%";
      particleEl.style.setProperty("--dx", Math.cos(angle) * distance + "px");
      particleEl.style.setProperty("--dy", Math.sin(angle) * distance + "px");
      particleEl.style.setProperty("--particle-color", color);

      effectsLayerEl.appendChild(particleEl);

      window.setTimeout(function () {
        particleEl.remove();
      }, 900);
    }
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
    worldStageEl.textContent = formatNumber(state.worldStage);
    soundButton.textContent = state.soundEnabled ? "Sound: On" : "Sound: Off";
    soundButton.setAttribute("aria-pressed", state.soundEnabled ? "true" : "false");

    if (musicButton) {
      musicButton.textContent = state.musicEnabled ? "Music: On" : "Music: Off";
      musicButton.setAttribute("aria-pressed", state.musicEnabled ? "true" : "false");
    }

    const hasCreditsForSpin = state.freeSpins > 0 || state.balance >= state.bet;

    spinButton.disabled = state.spinning || state.bet <= 0 || !hasCreditsForSpin;
    resetButton.disabled = state.spinning;
    themeButton.disabled = state.spinning;
    guideButton.disabled = state.spinning;
    betDownButton.disabled = state.spinning || state.bet <= BET_STEP;
    betUpButton.disabled = state.spinning || state.bet >= Math.min(MAX_BET, state.balance);
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

    themeNameEl.textContent = state.themeName;
    themeCaptionEl.textContent = state.themeCaption;
    setThemeSourceLabel(state.themeSource);

    if (state.currentThemeImage) {
      const layeredImage =
        "linear-gradient(180deg, rgba(6, 6, 12, 0.18), rgba(5, 7, 12, 0.7)), url('" +
        state.currentThemeImage +
        "')";
      themeSurfaceEl.style.backgroundImage = layeredImage;
      themePreviewEl.style.backgroundImage = layeredImage;
    } else {
      const localBackground = buildLocalBackground(palette);
      themeSurfaceEl.style.backgroundImage = localBackground;
      themePreviewEl.style.backgroundImage = localBackground;
    }
  }

  function getLocalThemeData() {
    const localTheme = localThemeStages[state.worldStage - 1];
    return {
      source: "local",
      themeName: localTheme.themeName,
      caption: localTheme.caption,
      palette: localTheme.palette,
      backgroundImageDataUrl: "",
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
      backgroundImageDataUrl: "",
      storyWhisper:
        "The room reshapes around your dream: " +
        themeName +
        ". The air tastes like possibility.",
    };
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

    if (first === second && second === third) {
      return {
        multiplier: symbolMap[first].multiplier,
        winningReels: [0, 1, 2],
        kind: "three",
        symbolId: first,
        description: symbolMap[first].name + " x3",
      };
    }

    if (first === second) {
      return {
        multiplier: TWO_MATCH_MULTIPLIER,
        winningReels: [0, 1],
        kind: "two",
        symbolId: first,
        description: "Two matching symbols",
      };
    }

    if (second === third) {
      return {
        multiplier: TWO_MATCH_MULTIPLIER,
        winningReels: [1, 2],
        kind: "two",
        symbolId: second,
        description: "Two matching symbols",
      };
    }

    if (first === third) {
      return {
        multiplier: TWO_MATCH_MULTIPLIER,
        winningReels: [0, 2],
        kind: "two",
        symbolId: first,
        description: "Two matching symbols",
      };
    }

    return {
      multiplier: 0,
      winningReels: [],
      kind: "none",
      symbolId: null,
      description: "No win",
    };
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
      currentPosition += elapsed * (1.42 + reelIndex * 0.22);

      if (currentPosition > finalPosition - reelHeight * 2) {
        currentPosition = reelHeight * 1.6;
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
          const settleTime = 720 + reelIndex * 180;

          reelEl.style.transition = "transform " + settleTime + "ms cubic-bezier(0.15, 0.85, 0.24, 1)";
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

  async function fetchJson(url, body) {
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
      setAiStatus("Offline dream engine — deploy /api/ai/theme for live image + palette AI");
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

    if (state.bet <= 0) {
      showMessage("Your bet is too low. Raise it to at least 10 credits.", "loss");
      updateUi();
      return;
    }

    if (state.freeSpins === 0 && state.balance < state.bet) {
      showMessage("You do not have enough balance for that spin. Lower the bet or press Reset.", "loss");
      updateUi();
      return;
    }

    state.spinning = true;
    clearWinningHighlights();

    const usingFreeSpin = state.freeSpins > 0;
    const wager = state.bet;

    if (usingFreeSpin) {
      state.freeSpins -= 1;
      showMessage("Free spin activated. This spin pays double on wins.", "bonus");
    } else {
      state.balance -= wager;
      showMessage("Reels spinning for Lynne... the room is gathering sparkle.", "");
    }

    updateUi();

    const outcomeIds = [chooseWeightedSymbol(), chooseWeightedSymbol(), chooseWeightedSymbol()];
    const strips = outcomeIds.map(function (symbolId, reelIndex) {
      return buildStrip(symbolId, BASE_STRIP_LENGTH + reelIndex * 8);
    });

    const reelControllers = reelEls.map(function (reelEl, reelIndex) {
      return spinSingleReel(reelEl, strips[reelIndex], reelIndex);
    });

    await reelControllers[0].stop();
    await delay(220);
    await reelControllers[1].stop();
    await delay(220);
    await reelControllers[2].stop();

    const result = evaluateResult(outcomeIds);
    const payoutMultiplier = usingFreeSpin ? result.multiplier * state.freeSpinMultiplier : result.multiplier;
    const baseWinnings = wager * payoutMultiplier;
    let bonusWinnings = 0;

    if (result.multiplier > 0) {
      state.balance += baseWinnings;
      highlightWinningSymbols(result.winningReels);

      if (payoutMultiplier >= BIG_WIN_MULTIPLIER) {
        pulseBigWin();
        createExplosionBurst(["#ffcf63", "#ff4eb5", "#54e7ff", "#ffffff"]);
        sound.bigWin();
        showMessage(
          "Big win! " + result.description + " paid " + formatNumber(baseWinnings) + " credits.",
          "big-win"
        );
        await requestGuideStory("big_win", {
          recentOutcome: result.description + " paid " + formatNumber(baseWinnings) + " credits.",
        });
        await maybeAdvanceWorldStage("big win evolution");
      } else {
        createExplosionBurst(["#5ff0af", "#54e7ff", "#ffcf63"]);
        sound.smallWin();
        showMessage(
          "Nice win! " + result.description + " paid " + formatNumber(baseWinnings) + " credits.",
          "win"
        );
      }

      bonusWinnings = await handleBonusRounds(result, wager);

      if (bonusWinnings > 0) {
        showMessage(
          "Bonus winnings added " + formatNumber(bonusWinnings) + " extra credits on top of the regular win.",
          "bonus"
        );
      }
    } else {
      showMessage(
        usingFreeSpin
          ? "No win on that free spin, but it cost you nothing."
          : "No win this time. You spent " + formatNumber(wager) + " credits.",
        "loss"
      );
    }

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
      ambientMusic.start();
    } else {
      ambientMusic.stop();
    }
    updateUi();
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
    state.musicEnabled = false;
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
    setIdleReels();
    updateUi();
    setStoryOutput("The room is settled into a velvet glow. When you are ready, I will help the world bloom.");
    showMessage("Welcome to Lynne's AI Slot Deluxe. Let the room glow, then press Spin.", "");
    setAiStatus("Offline AI + music ready (optional /api routes for live models)");

    spinButton.addEventListener("click", playSpin);
    resetButton.addEventListener("click", resetGame);
    soundButton.addEventListener("click", toggleSound);
    if (musicButton) {
      musicButton.addEventListener("click", function () {
        sound.click();
        toggleMusic();
      });
    }
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
    window.addEventListener("resize", function () {
      if (!state.spinning) {
        setIdleReels();
      }
    });
  }

  init();
});
