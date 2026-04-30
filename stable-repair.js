(() => {
  function tone(kind = 'button') {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = window.__slotToneCtx || new AudioContextClass();
      window.__slotToneCtx = ctx;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const notesByKind = {
        button: [380],
        spinStart: [160, 210, 260],
        reelStop: [260],
        win: [520, 700],
        bigWin: [520, 760, 980],
        jackpot: [420, 620, 860, 1200],
        bonusStart: [340, 460, 620],
        bonusReveal: [520, 760],
        bonusSpin: [240, 320, 420],
        bonusEnd: [560, 820, 1040]
      };
      const notes = notesByKind[kind] || notesByKind.button;
      const volume = Math.max(0.02, Math.min(0.12, (audioManager && audioManager.volume ? audioManager.volume : 0.85) * 0.12));
      notes.forEach((note, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + index * 0.055;
        osc.type = kind === 'jackpot' ? 'sawtooth' : 'triangle';
        osc.frequency.value = note;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch (_) {}
  }

  function fixAudio() {
    if (typeof audioManager === 'undefined' || !audioManager) return;
    audioManager.filesByEvent = {
      spinStart: ['assets/audio/bonus-round-3.wav', 'assets/audio/casino-win.wav'],
      reelStop: ['assets/audio/bonus-round-4.wav', 'assets/audio/casino-win.wav'],
      button: ['assets/audio/bonus-round-5.wav', 'assets/audio/casino-win.wav'],
      win: ['assets/audio/casino-win.wav', 'assets/audio/bonus-round-7.wav'],
      bigWin: ['assets/audio/bonus-round-7.wav', 'assets/audio/casino-win.wav'],
      jackpot: ['assets/audio/jackpot.wav', 'assets/audio/bonus-round-7.wav', 'assets/audio/casino-win.wav'],
      bonusStart: ['assets/audio/bonus-round-1.wav', 'assets/audio/casino-win.wav'],
      bonusReveal: ['assets/audio/bonus-round-2.wav', 'assets/audio/casino-win.wav'],
      bonusSpin: ['assets/audio/bonus-round-3.wav', 'assets/audio/casino-win.wav'],
      bonusMiss: ['assets/audio/bonus-round-6.wav', 'assets/audio/casino-win.wav'],
      bonusEnd: ['assets/audio/bonus-round-7.wav', 'assets/audio/casino-win.wav']
    };
    audioManager.players = new Map();
    audioManager.play = async function repairedPlay(eventName) {
      if (this.muted) return;
      const files = this.filesByEvent[eventName] || [];
      for (const file of files) {
        try {
          let player = this.players.get(file);
          if (!player) {
            player = new Audio(file);
            player.preload = 'auto';
            this.players.set(file, player);
          }
          player.currentTime = 0;
          player.volume = this.volume || 0.85;
          await player.play();
          return;
        } catch (_) {}
      }
      tone(eventName);
    };
    if (typeof audioManager.preload === 'function') audioManager.preload();
  }

  function fixedSymbolVisual(symbolId, options = {}) {
    const compact = Boolean(options.compact);
    const symbol = SYMBOL_BY_ID[symbolId] || SYMBOL_BY_ID.star;
    const img = document.createElement('img');
    img.className = 'symbol-art';
    img.src = symbol.image;
    img.alt = symbol.label;
    img.loading = 'eager';
    img.decoding = 'async';
    img.style.width = compact ? '40px' : '96%';
    img.style.height = compact ? '40px' : '96%';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 1px 5px rgba(0,0,0,0.25)';
    const fallback = document.createElement('div');
    fallback.className = 'symbol-fallback';
    fallback.textContent = symbol.short;
    img.addEventListener('error', () => img.replaceWith(fallback));
    return img;
  }

  function fixImages() {
    if (typeof createSymbolVisual === 'function') {
      createSymbolVisual = fixedSymbolVisual;
    }
    document.querySelectorAll('.symbol-art').forEach((img) => {
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.width = '96%';
      img.style.height = '96%';
      img.style.borderRadius = '8px';
    });
    if (typeof renderStaticBoard === 'function') renderStaticBoard();
  }

  window.addEventListener('load', () => {
    fixAudio();
    fixImages();
    setTimeout(fixImages, 250);
    setTimeout(fixImages, 1000);
  });
})();
