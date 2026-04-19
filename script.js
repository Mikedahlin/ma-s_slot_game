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

  const symbols = [
    { id: "cherry", name: "Cherry", icon: "🍒", weight: 32, multiplier: 2 },
    { id: "lemon", name: "Lemon", icon: "🍋", weight: 28, multiplier: 3 },
    { id: "bell", name: "Bell", icon: "🔔", weight: 20, multiplier: 5 },
    { id: "diamond", name: "Diamond", icon: "💎", weight: 12, multiplier: 10 },
    { id: "seven", name: "Seven", icon: "7", weight: 8, multiplier: 20 },
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
    spinning: false,
  };

  const balanceEl = document.getElementById("balance");
  const betEl = document.getElementById("bet");
  const freeSpinsEl = document.getElementById("free-spins");
  const messageEl = document.getElementById("message");
  const machineEl = document.getElementById("machine");
  const effectsLayerEl = document.getElementById("effects-layer");
  const spinButton = document.getElementById("spin-button");
  const resetButton = document.getElementById("reset-button");
  const betDownButton = document.getElementById("bet-down");
  const betUpButton = document.getElementById("bet-up");
  const reelEls = [
    document.getElementById("reel-0"),
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
  ];

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
    freeSpinsEl.textContent = formatNumber(state.freeSpins);

    const hasCreditsForSpin = state.freeSpins > 0 || state.balance >= state.bet;

    spinButton.disabled = state.spinning || state.bet <= 0 || !hasCreditsForSpin;
    resetButton.disabled = state.spinning;
    betDownButton.disabled = state.spinning || state.bet <= BET_STEP;
    betUpButton.disabled = state.spinning || state.bet >= Math.min(MAX_BET, state.balance);
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

          window.setTimeout(function () {
            reelEl.style.transition = "none";
            resolve();
          }, settleTime + 40);
        });
      },
    };
  }

  function getDiamondBonusMultiplier() {
    const bonusOptions = [2, 3, 4, 5, 8, 10];
    return bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
  }

  async function runDiamondBonus(baseBet) {
    let totalBonus = 0;

    showMessage("Diamond Rush bonus! Lynne gets 3 glowing prize picks.", "bonus");
    createExplosionBurst(["#9ef3ff", "#ffffff", "#54e7ff", "#8f72ff"]);

    for (let pickNumber = 1; pickNumber <= 3; pickNumber += 1) {
      await delay(360);
      const multiplier = getDiamondBonusMultiplier();
      const prize = baseBet * multiplier;
      totalBonus += prize;
      createExplosionBurst(["#9ef3ff", "#ffcf63", "#ffffff"]);
      showMessage(
        "Diamond Rush pick " + pickNumber + " won " + formatNumber(prize) + " credits (" + multiplier + "x bet).",
        "bonus"
      );
    }

    state.balance += totalBonus;
    return totalBonus;
  }

  async function runSevenBonus() {
    state.freeSpins += FREE_SPIN_COUNT;
    createExplosionBurst(["#ff4eb5", "#ffcf63", "#ffffff", "#ff7884"]);
    pulseBigWin();
    showMessage(
      "Lynne's Lucky Free Spins! You earned " + FREE_SPIN_COUNT + " free spins with double payouts.",
      "bonus"
    );
    await delay(500);
  }

  async function handleBonusRounds(result, baseBet) {
    let bonusWinnings = 0;

    if (result.kind === "three" && result.symbolId === "diamond") {
      bonusWinnings += await runDiamondBonus(baseBet);
    }

    if (result.kind === "three" && result.symbolId === "seven") {
      await runSevenBonus();
    }

    return bonusWinnings;
  }

  async function playSpin() {
    if (state.spinning) {
      return;
    }

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
      showMessage("Reels spinning for Lynne... good luck!", "");
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
    const payoutMultiplier = usingFreeSpin ? result.multiplier * FREE_SPIN_MULTIPLIER : result.multiplier;
    const baseWinnings = wager * payoutMultiplier;
    let bonusWinnings = 0;

    if (result.multiplier > 0) {
      state.balance += baseWinnings;
      highlightWinningSymbols(result.winningReels);

      if (payoutMultiplier >= BIG_WIN_MULTIPLIER) {
        pulseBigWin();
        createExplosionBurst(["#ffcf63", "#ff4eb5", "#54e7ff", "#ffffff"]);
        showMessage(
          "Big win! " + result.description + " paid " + formatNumber(baseWinnings) + " credits.",
          "big-win"
        );
      } else {
        createExplosionBurst(["#5ff0af", "#54e7ff", "#ffcf63"]);
        showMessage(
          "Nice win! " + result.description + " paid " + formatNumber(baseWinnings) + " credits.",
          "win"
        );
      }

      bonusWinnings = await handleBonusRounds(result, wager);

      if (bonusWinnings > 0) {
        showMessage(
          "Total bonus winnings: " + formatNumber(bonusWinnings) + " credits on top of your regular win.",
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

    clampBet();
    state.spinning = false;
    updateUi();
  }

  function changeBet(direction) {
    if (state.spinning) {
      return;
    }

    state.bet += direction * BET_STEP;
    clampBet();
    updateUi();
  }

  function resetGame() {
    if (state.spinning) {
      return;
    }

    state.balance = START_BALANCE;
    state.bet = DEFAULT_BET;
    state.freeSpins = 0;
    clearWinningHighlights();
    effectsLayerEl.innerHTML = "";
    clampBet();
    setIdleReels();
    showMessage("Game reset. Lynne is back to 1000 credits and ready for a fresh start.", "");
    updateUi();
  }

  function init() {
    clampBet();
    setIdleReels();
    updateUi();
    showMessage("Welcome to Lynne's Luxe Slots Deluxe. Press Spin when you are ready.", "");

    spinButton.addEventListener("click", playSpin);
    resetButton.addEventListener("click", resetGame);
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
