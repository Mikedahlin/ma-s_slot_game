# Ma's Slot — Lynnes Buffalo Base

This branch imports the existing `Mikedahlin/Lynnes-Buffalo-Slot` project into `ma-s_slot_game` and makes it runnable as a normal app instead of opening `index.html` from Downloads.

## Important reality check

The source repo includes audio files, but it does not include an `images/` folder. The current code has image mode disabled:

```js
this.useImages = false;
```

That means the game currently uses emoji/text symbols, not real PNG reel art.

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Audit

```bash
npm run audit:assets
```

## Railway

Start command:

```bash
npm start
```

The server uses `process.env.PORT || 3000`.
