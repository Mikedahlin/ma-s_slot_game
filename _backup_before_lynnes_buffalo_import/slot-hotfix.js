// Hotfix layer for Lynne's Vegas Slots.
// Loaded after script.js so it can correct rendering and bonus behavior without rewriting the full game.

(function installSlotHotfix() {
  function safeCash(value) {
    if (typeof formatCash === "function") return formatCash(value);
    return `$${Math.max(0, Math.round(value)).toLocaleString("en-US")}`;
  }

  function safeUpdateHUD() {
    if (typeof updateHUD === "function") updateHUD();
  }

  function safeSetMessage(text) {
    if (typeof setMessage === "function") setMessage(text);
  }

  function safePlay(eventName) {
    if (typeof audioManager !== "undefined" && audioManager && typeof audioManager.play === "function") {
      audioManager.play(eventName);
    }
  }

  function safeCelebrate(tier) {
    if (typeof triggerCelebration === "function") triggerCelebration(tier);
    if (typeof maybeLaunchCoinBurst === "function") maybeLaunchCoinBurst(tier === "mega" ? 34 : tier === "big" ? 24 : 14);
  }

  function addBonusBanner(mode) {
    if (typeof BONUS_BANNERS === "undefined" || !BONUS_BANNERS[mode] || !dom?.bonusBody) return;
    const banner = document.createElement("img");
    banner.className = "bonus-banner";
    banner.src = BONUS_BANNERS[mode];
    banner.alt = `${mode} bonus`; 
    banner.loading = "eager";
    banner.decoding = "async";
    dom.bonusBody.appendChild(banner);
  }

  function completeBonus(payout, message) {
    state.balance += payout;
    state.lastWin = payout;
    state.spinsSinceBonus = 0;
    safeUpdateHUD();
    safeSetMessage(message || `Bonus paid ${safeCash(payout)}.`);
    safePlay(payout > getCurrentBet() * 25 ? "bigWin" : "win");
    safeCelebrate(payout > getCurrentBet() * 25 ? "big" : "small");
    dom.bonusContinueBtn.classList.remove("hidden");
    dom.bonusContinueBtn.textContent = "Continue";
    dom.bonusContinueBtn.onclick = closeBonusOverlay;
  }

  function makeBonusButton(text, className = "chip-btn") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = text;
    return btn;
  }

  function renderWheelBonus() {
    const bet = getCurrentBet();
    const multipliers = [8, 10, 12, 15, 20, 25, 40, 60];
    openBonusOverlay("Power Wheel Bonus", "Spin the wheel. Whatever it lands on gets paid into the balance.");
    addBonusBanner("wheel");

    const shell = document.createElement("div");
    shell.className = "wheel-shell";

    const pointer = document.createElement("div");
    pointer.className = "wheel-pointer";
    shell.appendChild(pointer);

    const wheel = document.createElement("div");
    wheel.className = "wheel";
    multipliers.forEach((mult, index) => {
      const label = document.createElement("span");
      label.className = "wheel-label";
      label.style.setProperty("--i", index);
      label.textContent = `${mult}x`;
      wheel.appendChild(label);
    });

    const center = document.createElement("div");
    center.className = "wheel-center";
    center.textContent = "SPIN";
    wheel.appendChild(center);
    shell.appendChild(wheel);
    dom.bonusBody.appendChild(shell);

    const spin = makeBonusButton("Spin Power Wheel", "wheel-spin-btn");
    dom.bonusBody.appendChild(spin);

    spin.onclick = async () => {
      spin.disabled = true;
      safePlay("bonusSpin");
      const landedIndex = Math.floor(Math.random() * multipliers.length);
      const turns = 5 * 360 + landedIndex * 45 + Math.floor(Math.random() * 20);
      wheel.style.transition = "transform 1.8s cubic-bezier(0.12, 0.75, 0.15, 1)";
      wheel.style.transform = `rotate(${turns}deg)`;
      pointer.classList.add("tick");
      setTimeout(() => pointer.classList.remove("tick"), 180);
      await new Promise((resolve) => setTimeout(resolve, 1900));
      const multiplier = multipliers[landedIndex];
      const payout = bet * multiplier;
      center.textContent = `${multiplier}x`;
      completeBonus(payout, `Power Wheel paid ${safeCash(payout)}.`);
    };
  }

  function renderPickBonus() {
    const bet = getCurrentBet();
    const values = [4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 35, 50]
      .sort(() => Math.random() - 0.5);
    let picksLeft = 4;
    let total = 0;

    openBonusOverlay("Treasure Pick Bonus", "Pick 4 cards. Each reveal adds money to the bonus win.");
    addBonusBanner("pick");

    const status = document.createElement("p");
    status.className = "bonus-status";
    status.textContent = `Picks left: ${picksLeft} — Total: ${safeCash(total)}`;
    dom.bonusBody.appendChild(status);

    const grid = document.createElement("div");
    grid.className = "pick-grid";
    dom.bonusBody.appendChild(grid);

    values.forEach((multiplier, index) => {
      const card = makeBonusButton("Pick", "pick-card");
      card.setAttribute("aria-label", `Pick card ${index + 1}`);
      card.onclick = () => {
        if (card.disabled || picksLeft <= 0) return;
        card.disabled = true;
        card.textContent = `${multiplier}x\n${safeCash(bet * multiplier)}`;
        card.classList.add("revealed");
        safePlay("bonusReveal");
        total += bet * multiplier;
        picksLeft -= 1;
        status.textContent = `Picks left: ${picksLeft} — Total: ${safeCash(total)}`;
        if (picksLeft === 0) {
          Array.from(grid.children).forEach((btn) => (btn.disabled = true));
          completeBonus(total, `Treasure Pick paid ${safeCash(total)}.`);
        }
      };
      grid.appendChild(card);
    });
  }

  async function renderFreeSpinsBonus() {
    const bet = getCurrentBet();
    const freeSpinCount = 5;
    let total = 0;

    openBonusOverlay("Free Spins Burst", "Run 5 free spins. Line wins pay double and get added to your balance.");
    addBonusBanner("freespins");

    const status = document.createElement("p");
    status.className = "bonus-status";
    status.textContent = "Ready for 5 free spins.";
    dom.bonusBody.appendChild(status);

    const list = document.createElement("ol");
    list.className = "free-spin-list";
    dom.bonusBody.appendChild(list);

    const runBtn = makeBonusButton("Start Free Spins", "wheel-spin-btn");
    dom.bonusBody.appendChild(runBtn);

    runBtn.onclick = async () => {
      runBtn.disabled = true;
      for (let i = 1; i <= freeSpinCount; i += 1) {
        safePlay("bonusSpin");
        status.textContent = `Free spin ${i} of ${freeSpinCount}...`;
        await new Promise((resolve) => setTimeout(resolve, 420));
        const grid = createRandomGrid({ includeBonus: false });
        const result = evaluateGrid(grid);
        const payout = result.totalLineWin * 2;
        total += payout;
        const item = document.createElement("li");
        item.textContent = `Spin ${i}: ${payout > 0 ? safeCash(payout) : "No line win"}`;
        list.appendChild(item);
      }
      completeBonus(total, `Free Spins paid ${safeCash(total)}.`);
    };
  }

  function chooseBonusMode() {
    const pack = getCurrentPack();
    const modes = pack?.bonusModes?.length ? pack.bonusModes : ["wheel", "pick", "freespins"];
    return modes[Math.floor(Math.random() * modes.length)] || "wheel";
  }

  window.launchBonusRound = function launchBonusRound(mode = chooseBonusMode()) {
    if (!dom?.bonusOverlay || !dom?.bonusBody || !dom?.bonusContinueBtn) {
      console.error("Bonus overlay markup is missing. Cannot launch bonus round.");
      state.controlsLocked = false;
      safeUpdateHUD();
      return;
    }

    safePlay("bonusStart");
    if (mode === "pick") return renderPickBonus();
    if (mode === "freespins") return renderFreeSpinsBonus();
    return renderWheelBonus();
  };

  // Some older script versions call different names. Alias them all to the same working launcher.
  window.startBonusRound = window.launchBonusRound;
  window.runBonusRound = window.launchBonusRound;
  window.triggerBonusRound = window.launchBonusRound;

  // If the original spin code forgot to launch a bonus after evaluation, wrap evaluateGrid and launch it after reels finish.
  if (typeof evaluateGrid === "function" && !window.__slotHotfixEvaluateWrapped) {
    const originalEvaluateGrid = evaluateGrid;
    evaluateGrid = function patchedEvaluateGrid(grid) {
      const result = originalEvaluateGrid(grid);
      if (result?.bonusCount >= 3) {
        window.__slotHotfixPendingBonus = true;
      }
      return result;
    };
    window.__slotHotfixEvaluateWrapped = true;
  }

  if (typeof spinAllReels === "function" && !window.__slotHotfixSpinWrapped) {
    const originalSpinAllReels = spinAllReels;
    spinAllReels = async function patchedSpinAllReels(grid, options) {
      await originalSpinAllReels(grid, options);
      if (window.__slotHotfixPendingBonus) {
        window.__slotHotfixPendingBonus = false;
        setTimeout(() => {
          if (!state.activeBonus && !dom.bonusOverlay.classList.contains("hidden")) return;
          if (!state.activeBonus) window.launchBonusRound();
        }, 350);
      }
    };
    window.__slotHotfixSpinWrapped = true;
  }

  // Replace the symbol renderer so slot art is contained, not cropped.
  if (typeof createSymbolVisual === "function" && !window.__slotHotfixSymbolWrapped) {
    createSymbolVisual = function patchedCreateSymbolVisual(symbolId, { compact = false } = {}) {
      const symbol = SYMBOL_BY_ID[symbolId] || SYMBOL_BY_ID.star;
      const img = document.createElement("img");
      img.className = "symbol-art";
      img.src = symbol.image;
      img.alt = symbol.label;
      img.loading = "eager";
      img.decoding = "async";
      img.style.width = compact ? "40px" : "96%";
      img.style.height = compact ? "40px" : "96%";
      img.style.objectFit = "contain";
      img.style.objectPosition = "center";
      img.style.borderRadius = "6px";
      img.style.boxShadow = "0 1px 5px rgba(0,0,0,0.22)";

      const fallback = document.createElement("div");
      fallback.className = "symbol-fallback";
      fallback.textContent = symbol.short;
      img.addEventListener("error", () => img.replaceWith(fallback));
      return img;
    };
    window.__slotHotfixSymbolWrapped = true;
    if (typeof renderStaticBoard === "function") renderStaticBoard();
  }
})();
