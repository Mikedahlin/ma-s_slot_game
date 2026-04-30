(() => {
  function fixImages() {
    document.querySelectorAll('.symbol-art').forEach((img) => {
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.width = '96%';
      img.style.height = '96%';
      img.style.filter = 'saturate(1.12) contrast(1.06)';
    });
  }

  if (typeof createSymbolVisual === 'function') {
    createSymbolVisual = function fixedCreateSymbolVisual(symbolId, opts = {}) {
      const compact = Boolean(opts.compact);
      const symbol = SYMBOL_BY_ID[symbolId] || SYMBOL_BY_ID.star;
      const img = document.createElement('img');
      img.className = 'symbol-art';
      img.src = symbol.image;
      img.alt = symbol.label;
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.width = compact ? '42px' : '96%';
      img.style.height = compact ? '42px' : '96%';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.borderRadius = '8px';
      img.style.filter = 'saturate(1.12) contrast(1.06)';
      const fallback = document.createElement('div');
      fallback.className = 'symbol-fallback';
      fallback.textContent = symbol.short;
      img.addEventListener('error', () => img.replaceWith(fallback));
      return img;
    };
  }

  if (typeof audioManager !== 'undefined' && audioManager) {
    audioManager.filesByEvent = {
      button: ['assets/audio/button.wav', 'assets/audio/bonus-round-5.wav'],
      spinStart: ['assets/audio/spin.wav', 'assets/audio/reel-spin.wav'],
      reelStop: ['assets/audio/reel-stop.wav', 'assets/audio/bonus-round-4.wav'],
      win: ['assets/audio/win-small.wav', 'assets/audio/casino-win.wav'],
      bigWin: ['assets/audio/win-big.wav', 'assets/audio/casino-win.wav', 'assets/audio/bonus-round-7.wav'],
      jackpot: ['assets/audio/win-mega.wav', 'assets/audio/jackpot.wav'],
      bonusStart: ['assets/audio/bonus-trigger.wav', 'assets/audio/bonus-round-1.wav'],
      bonusReveal: ['assets/audio/bonus-round-2.wav'],
      bonusSpin: ['assets/audio/bonus-round-3.wav', 'assets/audio/reel-stop.wav'],
      bonusMiss: ['assets/audio/bonus-round-6.wav'],
      bonusEnd: ['assets/audio/mission-complete.wav', 'assets/audio/bonus-round-7.wav']
    };
    if (typeof audioManager.preload === 'function') audioManager.preload();
  }

  window.addEventListener('load', () => {
    fixImages();
    setTimeout(fixImages, 300);
    setTimeout(fixImages, 1000);
    if (typeof renderStaticBoard === 'function') renderStaticBoard();
  });
})();
