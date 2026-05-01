import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

const requiredFiles = [
  'index.html',
  'styles.css',
  'help-modal.css',
  'help-modal.js',
  'slot-machine.js',
  'audio/coinHandling.wav',
  'audio/reelSpin.mp3',
  'audio/reelStop.mp3',
  'audio/scatterHit.mp3',
  'audio/slotFeature.mp3',
  'audio/slotPull.mp3',
  'audio/slotWin.mp3',
  'audio/slotsBG.mp3',
  'audio/winSmall.wav'
];

for (const file of requiredFiles) {
  const full = path.join(root, file);
  if (!existsSync(full)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  } else {
    console.log(`OK file: ${file}`);
  }
}

const slotJs = readFileSync(path.join(root, 'slot-machine.js'), 'utf8');
if (slotJs.includes("this.useImages = false")) {
  console.log('OK image mode is disabled; no missing image folder required for current runtime.');
} else {
  console.error('Image mode appears enabled. Verify images/ exists with every symbol .png before deploy.');
  failed = true;
}

if (slotJs.includes("this.imagesPath = 'images/'") && !existsSync(path.join(root, 'images'))) {
  console.log('NOTE images/ folder is absent, but image mode is disabled. This repo uses emoji symbols unless image mode is intentionally enabled later.');
}

if (failed) process.exit(1);
console.log('Asset audit passed.');
