import { applyDelta, UserId } from "./wallet";

export interface PromoCode {
  code: string;
  amount: number;
  maxRedemptions: number;
  perUserLimit: number;
  redemptions: number;
  redeemedBy: Map<UserId, number>;
}

const promos = new Map<string, PromoCode>();

// Seed one promo.
const welcomePromo: PromoCode = {
  code: "WELCOME500",
  amount: 500,
  maxRedemptions: 10000,
  perUserLimit: 1,
  redemptions: 0,
  redeemedBy: new Map()
};
promos.set(welcomePromo.code, welcomePromo);

export function redeemPromo(userId: UserId, code: string) {
  const promo = promos.get(code.toUpperCase());
  if (!promo) throw new Error("INVALID_CODE");
  if (promo.redemptions >= promo.maxRedemptions) throw new Error("PROMO_EXHAUSTED");

  const userCount = promo.redeemedBy.get(userId) ?? 0;
  if (userCount >= promo.perUserLimit) throw new Error("ALREADY_REDEEMED");

  applyDelta(userId, promo.amount, "promo_grant", code);
  promo.redemptions++;
  promo.redeemedBy.set(userId, userCount + 1);

  return { amount: promo.amount };
}
