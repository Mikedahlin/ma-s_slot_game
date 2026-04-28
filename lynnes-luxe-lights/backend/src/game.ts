import { applyDelta, getOrCreateWallet, UserId } from "./wallet";

export type MachineId = "vegas_dreams" | "neon_oasis";

export interface SpinResult {
  machineId: MachineId;
  symbols: string[][];
  winAmount: number;
  winTier: "none" | "small" | "big" | "mega";
  newBalance: number;
}

const SPIN_COST = 50;

const symbolSet = ["🍒", "🔔", "💎", "7️⃣", "⭐️"];

function randomSymbol() {
  return symbolSet[Math.floor(Math.random() * symbolSet.length)];
}

function generateReels(): string[][] {
  const rows = 3;
  const cols = 5;
  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(randomSymbol());
    }
    grid.push(row);
  }
  return grid;
}

function evaluateWin(symbols: string[][]): { amount: number; tier: SpinResult["winTier"] } {
  // Simple rule: if middle row has 3+ same symbols in a row, pay.
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
  return { amount, tier };
}

export function spin(userId: UserId, machineId: MachineId): SpinResult {
  const wallet = getOrCreateWallet(userId);
  if (wallet.balance < SPIN_COST) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  applyDelta(userId, -SPIN_COST, "spin_cost", machineId);

  const symbols = generateReels();
  const { amount, tier } = evaluateWin(symbols);

  let newWallet = wallet;
  if (amount > 0) {
    newWallet = applyDelta(userId, amount, "spin_payout", machineId);
  }

  return {
    machineId,
    symbols,
    winAmount: amount,
    winTier: tier,
    newBalance: newWallet.balance
  };
}
