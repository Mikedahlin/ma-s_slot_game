import { applyDelta, getOrCreateWallet, UserId } from "./wallet";

export type MachineId = "vegas_dreams" | "neon_oasis";
export type SlotSymbol = "cherry" | "bell" | "diamond" | "seven" | "star";

export interface BonusState {
  triggered: boolean;
  isFreeSpin: boolean;
  scatters: number;
  multiplier: number;
  freeSpinsAwarded: number;
  freeSpinsRemaining: number;
}

export interface SpinResult {
  machineId: MachineId;
  symbols: SlotSymbol[][];
  winAmount: number;
  winTier: "none" | "small" | "big" | "mega";
  newBalance: number;
  bonus: BonusState;
}

const SPIN_COST = 50;
const BASE_BONUS_FREE_SPINS = 10;
const RETRIGGER_FREE_SPINS = 5;

const symbolPool: SlotSymbol[] = ["cherry", "bell", "diamond", "seven", "star"];
const scatterSymbol: SlotSymbol = "star";

type PlayerBonusRuntime = {
  freeSpinsRemaining: number;
  multiplier: number;
};

const bonusByUser = new Map<UserId, PlayerBonusRuntime>();

function getBonusRuntime(userId: UserId): PlayerBonusRuntime {
  const current = bonusByUser.get(userId);
  if (current) return current;
  const created = { freeSpinsRemaining: 0, multiplier: 1 };
  bonusByUser.set(userId, created);
  return created;
}

function randomSymbol(): SlotSymbol {
  return symbolPool[Math.floor(Math.random() * symbolPool.length)];
}

function generateReels(): SlotSymbol[][] {
  const rows = 3;
  const cols = 5;
  const grid: SlotSymbol[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: SlotSymbol[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(randomSymbol());
    }
    grid.push(row);
  }
  return grid;
}

function countScatters(symbols: SlotSymbol[][]): number {
  let count = 0;
  for (const row of symbols) {
    for (const symbol of row) {
      if (symbol === scatterSymbol) count++;
    }
  }
  return count;
}

function evaluateWin(
  symbols: SlotSymbol[][],
  multiplier = 1
): { amount: number; tier: SpinResult["winTier"] } {
  // Simple pay rule: if middle row has 3+ same symbols in a row, pay.
  const middle = symbols[1];
  let bestRun = 1;
  let currentRun = 1;
  for (let i = 1; i < middle.length; i++) {
    if (middle[i] === middle[i - 1]) {
      currentRun++;
      bestRun = Math.max(bestRun, currentRun);
    } else {
      currentRun = 1;
    }
  }

  if (bestRun < 3) return { amount: 0, tier: "none" };

  let amount = 0;
  let tier: SpinResult["winTier"] = "small";
  if (bestRun === 3) {
    amount = 100;
    tier = "small";
  } else if (bestRun === 4) {
    amount = 300;
    tier = "big";
  } else {
    amount = 1000;
    tier = "mega";
  }

  return { amount: amount * multiplier, tier };
}

function bonusMultiplierFromScatters(scatters: number): number {
  // 3 scatters = 2x, 4 scatters = 3x, 5+ scatters = 4x
  return Math.min(4, Math.max(2, scatters - 1));
}

export function spin(userId: UserId, machineId: MachineId): SpinResult {
  const wallet = getOrCreateWallet(userId);
  const bonusRuntime = getBonusRuntime(userId);
  const isFreeSpin = bonusRuntime.freeSpinsRemaining > 0;

  if (!isFreeSpin && wallet.balance < SPIN_COST) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  if (!isFreeSpin) {
    applyDelta(userId, -SPIN_COST, "spin_cost", machineId);
  }

  const symbols = generateReels();
  const scatters = countScatters(symbols);

  const activeMultiplier = isFreeSpin ? bonusRuntime.multiplier : 1;
  const { amount, tier } = evaluateWin(symbols, activeMultiplier);

  let newWallet = wallet;
  if (amount > 0) {
    newWallet = applyDelta(userId, amount, "spin_payout", machineId);
  }

  let triggered = false;
  let freeSpinsAwarded = 0;

  // Trigger/retrigger rule:
  // 3+ scatters on paid spin => start bonus.
  // 3+ scatters during bonus => add retrigger spins.
  if (scatters >= 3) {
    triggered = true;
    if (isFreeSpin) {
      freeSpinsAwarded = RETRIGGER_FREE_SPINS;
      bonusRuntime.freeSpinsRemaining += RETRIGGER_FREE_SPINS;
    } else {
      freeSpinsAwarded = BASE_BONUS_FREE_SPINS;
      bonusRuntime.freeSpinsRemaining += BASE_BONUS_FREE_SPINS;
      bonusRuntime.multiplier = bonusMultiplierFromScatters(scatters);
    }
  }

  // Consume one free spin after this free spin resolves.
  if (isFreeSpin) {
    bonusRuntime.freeSpinsRemaining = Math.max(0, bonusRuntime.freeSpinsRemaining - 1);
    if (bonusRuntime.freeSpinsRemaining === 0) {
      bonusRuntime.multiplier = 1;
    }
  }

  return {
    machineId,
    symbols,
    winAmount: amount,
    winTier: tier,
    newBalance: newWallet.balance,
    bonus: {
      triggered,
      isFreeSpin,
      scatters,
      multiplier: isFreeSpin ? activeMultiplier : bonusRuntime.multiplier,
      freeSpinsAwarded,
      freeSpinsRemaining: bonusRuntime.freeSpinsRemaining
    }
  };
}
