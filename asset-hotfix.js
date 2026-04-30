(() => {
  function repairImages() {
    document.querySelectorAll('.symbol-art').forEach((img) => {
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.width = img.style.width || '92%';
      img.style.height = img.style.height || '92%';
    });
  }

  function unlockAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      window.__lynneAudioCtx = window.__lynneAudioCtx || new Ctx();
      if (window.__lynneAudioCtx.state === 'suspended') {
        window.__lynneAudioCtx.resume().catch(() => {});
      }
    } catch {}
  }

  function tone(eventName) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = window.__lynneAudioCtx || new Ctx();
      window.__lynneAudioCtx = ctx;
      const map = {
        button: [340],
        spinStart: [150, 190, 235],
        reelStop: [260],
        win: [520, 700],
        bigWin: [520, 760, 960],
        jackpot: [420, 560, 860, 1180],
        bonusStart: [340, 460, 620],
        bonusReveal: [500, 700],
        bonusSpin: [270, 380, 490],
        bonusEnd: [560, 820, 1040]
      };
      const notes = map[eventName] || [320];
      notes.forEach((note, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.055;
        osc.type = eventName === 'jackpot' ? 'sawtooth' : 'triangle';
        osc.frequency.value = note;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.09, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  }

  function repairAudio() {
    if (!window.audioManager && typeof audioManager === 'undefined') return;
    const manager = window.audioManager || audioManager;
    manager.filesByEvent = {
      button: ['assets/audio/button.wav', 'assets/audio/bonus-round-5.wav'],
      spinStart: ['assets/audio/spin.wav', 'assets/audio/reel-spin.wav'],
      reelStop: ['assets/audio/reel-stop.wav', 'assets/audio/bonus-round-4.wav'],
      win: ['assets/audio/win-small.wav', 'assets/audio/casino-win.wav'],
      bigWin: ['assets/audio/win-big.wav', 'assets/audio/casino-win.wav', 'assets/audio/bonus-round-7.wav'],
      jackpot: ['assets/audio/win-mega.wav', 'assets/audio/jackpot.wav', 'assets/audio/bonus-round-7.wav'],
      bonusStart: ['assets/audio/bonus-trigger.wav', 'assets/audio/bonus-round-1.wav'],
      bonusReveal: ['assets/audio/bonus-round-2.wav'],
      bonusSpin: ['assets/audio/bonus-round-3.wav', 'assets/audio/reel-stop.wav'],
      bonusMiss: ['assets/audio/bonus-round-6.wav'],
      bonusEnd: ['assets/audio/mission-complete.wav', 'assets/audio/bonus-round-7.wav']
    };
    const oldPlay = manager.play.bind(manager);
    manager.play = async function patchedPlay(eventName) {
      unlockAudio();
      try {
        await oldPlay(eventName);
      } catch {
        tone(eventName);
      }
    };
    if (typeof manager.preload === 'function') manager.preload();
  }

  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('load', () => {
    repairAudio();
    repairImages();
    setInterval(repairImages, 400);
  });
})();
