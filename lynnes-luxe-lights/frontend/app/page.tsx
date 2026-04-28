"use client";

import { useEffect, useState } from "react";
import { WalletBar } from "../components/WalletBar";
import { SlotMachine } from "../components/SlotMachine";
import { MissionsPanel } from "../components/MissionsPanel";
import { PromoInput } from "../components/PromoInput";

type Wallet = { balance: number };
type Mission = {
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
};
type SpinResponse = {
  result: {
    symbols: string[][];
    winAmount: number;
    winTier: "none" | "small" | "big" | "mega";
    newBalance: number;
  };
  mission: Mission;
};

const API_URL = "http://localhost:4000";

const defaultSymbols = [
  ["🍒", "🔔", "💎", "7️⃣", "⭐️"],
  ["🍒", "🔔", "💎", "7️⃣", "⭐️"],
  ["🍒", "🔔", "💎", "7️⃣", "⭐️"]
];

export default function Page() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [symbols, setSymbols] = useState<string[][]>(defaultSymbols);
  const [winAmount, setWinAmount] = useState(0);
  const [winTier, setWinTier] = useState<"none" | "small" | "big" | "mega">("none");
  const [spinning, setSpinning] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/wallet`)
      .then((r) => r.json())
      .then(setWallet)
      .catch(() => setPromoStatus("Could not load wallet. Is backend running?"));

    fetch(`${API_URL}/api/missions`)
      .then((r) => r.json())
      .then(setMission)
      .catch(() => setPromoStatus("Could not load missions. Is backend running?"));
  }, []);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setWinTier("none");
    setWinAmount(0);

    try {
      const res = await fetch(`${API_URL}/api/spin`, {
        method: "POST"
      });
      const data = (await res.json()) as SpinResponse | { error: string };
      if (!res.ok) {
        setPromoStatus((data as { error: string }).error === "INSUFFICIENT_FUNDS" ? "Not enough coins to spin." : "Spin failed.");
      } else {
        const okData = data as SpinResponse;
        setSymbols(okData.result.symbols);
        setWinAmount(okData.result.winAmount);
        setWinTier(okData.result.winTier);
        setWallet({ balance: okData.result.newBalance });
        setMission(okData.mission);
      }
    } catch {
      setPromoStatus("Network error: backend may be offline.");
    } finally {
      setSpinning(false);
    }
  };

  const handleRedeem = async () => {
    if (!promoCode) return;
    setPromoStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/promo/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoStatus(`Error: ${data.error}`);
      } else {
        setPromoStatus(`Granted +${data.grant.amount} coins!`);
        setWallet(data.wallet);
      }
    } catch {
      setPromoStatus("Network error: could not redeem promo.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <WalletBar balance={wallet?.balance ?? 0} />
      <div
        style={{
          flex: 1,
          padding: 16,
          maxWidth: 480,
          margin: "0 auto"
        }}
      >
        <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
          Welcome to the lounge. Spin, complete missions, and redeem promos.
        </div>

        <SlotMachine
          symbols={symbols}
          winAmount={winAmount}
          winTier={winTier}
          spinning={spinning}
          onSpin={handleSpin}
        />

        <MissionsPanel mission={mission} />

        <PromoInput
          code={promoCode}
          setCode={setPromoCode}
          onRedeem={handleRedeem}
          status={promoStatus}
        />
      </div>
    </div>
  );
}
