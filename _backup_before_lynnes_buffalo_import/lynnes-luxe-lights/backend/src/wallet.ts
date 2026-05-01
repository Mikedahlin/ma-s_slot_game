export type UserId = string;

export interface Wallet {
  userId: UserId;
  balance: number;
}

export interface LedgerEntry {
  id: string;
  userId: UserId;
  delta: number;
  reason: string;
  ref?: string;
  createdAt: string;
}

const wallets = new Map<UserId, Wallet>();
const ledger: LedgerEntry[] = [];

function now() {
  return new Date().toISOString();
}

function id() {
  return Math.random().toString(36).slice(2);
}

export function getOrCreateWallet(userId: UserId): Wallet {
  let w = wallets.get(userId);
  if (!w) {
    w = { userId, balance: 1000 }; // welcome grant
    wallets.set(userId, w);
    ledger.push({
      id: id(),
      userId,
      delta: 1000,
      reason: "welcome_grant",
      createdAt: now()
    });
  }
  return w;
}

export function applyDelta(
  userId: UserId,
  delta: number,
  reason: string,
  ref?: string
): Wallet {
  const w = getOrCreateWallet(userId);
  const newBalance = w.balance + delta;
  if (newBalance < 0) {
    throw new Error("INSUFFICIENT_FUNDS");
  }
  w.balance = newBalance;
  ledger.push({
    id: id(),
    userId,
    delta,
    reason,
    ref,
    createdAt: now()
  });
  return w;
}

export function getLedger(userId: UserId): LedgerEntry[] {
  return ledger.filter((l) => l.userId === userId);
}
