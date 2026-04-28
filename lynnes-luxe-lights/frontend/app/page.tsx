"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WalletBar } from "../components/WalletBar";
import { SlotMachine } from "../components/SlotMachine";
import { MissionsPanel } from "../components/MissionsPanel";
import { PromoInput } from "../components/PromoInput";
import { LynneArtBox } from "../components/LynneArtBox";

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
    bonus: {
      triggered: boolean;
      isFreeSpin: boolean;
      scatters: number;
      multiplier: number;
      freeSpinsAwarded: number;
      freeSpinsRemaining: number;
    };
  };
  mission: Mission;
};

type LynneArt = {
  imageDataUrl: string;
  caption: string;
  promptUsed: string;
  provider: "openai" | "google" | "fallback";
};

const API_URL = "http://localhost:4000";

const defaultSymbols = [
  ["🍒", "🔔", "💎", "7️⃣", "⭐️"],
  ["🍒", "🔔", "💎", "7️⃣", "⭐️"],
  ["🍒", "🔔", "💎", "7️⃣", "⭐️"]
];

type SoundName =
  | "button"
  | "spin"
  | "reelStop"
  | "winSmall"
  | "winBig"
  | "winMega"
  | "mission"
  | "ambience";

const soundPathByName: Record<SoundName, string> = {
  button: "/audio/button.wav",
  spin: "/audio/spin.wav",
  reelStop: "/audio/reel-stop.wav",
  winSmall: "/audio/win-small.wav",
  winBig: "/audio/win-big.wav",
  winMega: "/audio/win-mega.wav",
  mission: "/audio/mission-complete.wav",
  ambience: "/audio/ambience-loop.wav"
};

export default function Page() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [symbols, setSymbols] = useState<string[][]>(defaultSymbols);
  const [winAmount, setWinAmount] = useState(0);
  const [winTier, setWinTier] = useState<"none" | "small" | "big" | "mega">("none");
  const [spinning, setSpinning] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [lynneArt, setLynneArt] = useState<LynneArt | null>(null);
  const [artLoading, setArtLoading] = useState(false);
  const [bonusStatus, setBonusStatus] = useState<string | null>(null);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);

  const soundsRef = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  const ambienceStartedRef = useRef(false);
  const missionCompletedPlayedRef = useRef(false);

  const loungeMessage = useMemo(() => {
    if (freeSpinsRemaining > 0) {
      return `Bonus round live: ${freeSpinsRemaining} free spins left at ${bonusMultiplier}x multiplier.`;
    }
    if (mission?.completed) return "Mission done. Lynne is shining tonight.";
    return "Welcome to the lounge. Spin, complete missions, and redeem promos.";
  }, [mission, freeSpinsRemaining, bonusMultiplier]);

  useEffect(() => {
    const createSound = (name: SoundName, loop = false, volume = 0.5) => {
      const audio = new Audio(soundPathByName[name]);
      audio.preload = "auto";
      audio.loop = loop;
      audio.volume = volume;
      soundsRef.current[name] = audio;
    };

    createSound("button", false, 0.35);
    createSound("spin", false, 0.45);
    createSound("reelStop", false, 0.4);
    createSound("winSmall", false, 0.45);
    createSound("winBig", false, 0.5);
    createSound("winMega", false, 0.55);
    createSound("mission", false, 0.52);
    createSound("ambience", true, 0.2);

    return () => {
      Object.values(soundsRef.current).forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  const startAmbienceIfNeeded = async () => {
    if (ambienceStartedRef.current) return;
    const ambience = soundsRef.current.ambience;
    if (!ambience) return;
    try {
      await ambience.play();
      ambienceStartedRef.current = true;
    } catch {
      // Browser may block autoplay until user interacts again.
    }
  };

  const playSound = (name: SoundName) => {
    const audio = soundsRef.current[name];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore audio play errors caused by browser policy.
    });
  };

  const fetchLynneArt = async (payload: {
    winTier?: "none" | "small" | "big" | "mega";
    winAmount?: number;
    missionProgress?: number;
    missionTarget?: number;
    event?: string;
  }) => {
    setArtLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/art`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await res.json()) as LynneArt | { error: string };
      if (!res.ok) {
        setAiStatus(`AI error: ${(data as { error: string }).error}`);
        return;
      }

      const art = data as LynneArt;
      setLynneArt(art);
      if (art.provider === "fallback") {
        setAiStatus(
          "AI fallback in use. Set OPENAI_API_KEY or GOOGLE_API_KEY in backend to generate live images."
        );
      } else {
        setAiStatus(`AI image updated via ${art.provider}.`);
      }
    } catch {
      setAiStatus("AI request failed. Is backend running?");
    } finally {
      setArtLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/wallet`)
      .then((r) => r.json())
      .then(setWallet)
      .catch(() => setPromoStatus("Could not load wallet. Is backend running?"));

    fetch(`${API_URL}/api/missions`)
      .then((r) => r.json())
      .then((m: Mission) => {
        setMission(m);
        void fetchLynneArt({
          event: "welcome",
          missionProgress: m.progress,
          missionTarget: m.target
        });
      })
      .catch(() => {
        setPromoStatus("Could not load missions. Is backend running?");
        void fetchLynneArt({ event: "welcome" });
      });

    fetch(`${API_URL}/api/ai/status`)
      .then((r) => r.json())
      .then((status: { openaiConfigured?: boolean; googleConfigured?: boolean }) => {
        if (!status.openaiConfigured && !status.googleConfigured) {
          setAiStatus("No AI key found yet. Fallback art will be shown.");
        }
      })
      .catch(() => {
        // Silent fail for status checks.
      });
  }, []);

  const handleSpin = async () => {
    if (spinning) return;

    playSound("button");
    await startAmbienceIfNeeded();

    setSpinning(true);
    setWinTier("none");
    setWinAmount(0);
    playSound("spin");

    try {
      const res = await fetch(`${API_URL}/api/spin`, {
        method: "POST"
      });
      const data = (await res.json()) as SpinResponse | { error: string };
      if (!res.ok) {
        setPromoStatus(
          (data as { error: string }).error === "INSUFFICIENT_FUNDS"
            ? "Not enough coins to spin."
            : "Spin failed."
        );
      } else {
        const okData = data as SpinResponse;
        setSymbols(okData.result.symbols);
        setWinAmount(okData.result.winAmount);
        setWinTier(okData.result.winTier);
        setWallet({ balance: okData.result.newBalance });
        setMission(okData.mission);
        setFreeSpinsRemaining(okData.result.bonus.freeSpinsRemaining);
        setBonusMultiplier(okData.result.bonus.multiplier);

        setTimeout(() => playSound("reelStop"), 120);

        if (okData.result.winTier === "small") playSound("winSmall");
        if (okData.result.winTier === "big") playSound("winBig");
        if (okData.result.winTier === "mega") playSound("winMega");

        if (okData.mission.completed && !missionCompletedPlayedRef.current) {
          missionCompletedPlayedRef.current = true;
          playSound("mission");
        }

        if (okData.result.bonus.triggered) {
          playSound("winMega");
          if (okData.result.bonus.isFreeSpin) {
            setBonusStatus(
              `RETRIGGER! +${okData.result.bonus.freeSpinsAwarded} free spins awarded.`
            );
          } else {
            setBonusStatus(
              `BONUS TRIGGERED! +${okData.result.bonus.freeSpinsAwarded} free spins at ${okData.result.bonus.multiplier}x.`
            );
          }
        } else if (okData.result.bonus.isFreeSpin) {
          setBonusStatus(
            `Bonus spin played. ${okData.result.bonus.freeSpinsRemaining} free spins left.`
          );
        } else if (okData.result.bonus.freeSpinsRemaining === 0) {
          setBonusStatus(null);
        }

        void fetchLynneArt({
          event: okData.result.bonus.triggered ? "bonus_trigger" : "spin",
          winTier: okData.result.winTier,
          winAmount: okData.result.winAmount,
          missionProgress: okData.mission.progress,
          missionTarget: okData.mission.target
        });
      }
    } catch {
      setPromoStatus("Network error: backend may be offline.");
    } finally {
      setSpinning(false);
    }
  };

  const handleRedeem = async () => {
    if (!promoCode) return;
    playSound("button");
    await startAmbienceIfNeeded();

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
        void fetchLynneArt({
          event: "promo",
          missionProgress: mission?.progress,
          missionTarget: mission?.target
        });
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
        <LynneArtBox
          art={lynneArt}
          loading={artLoading}
          onRefresh={() =>
            void fetchLynneArt({
              event: "manual_refresh",
              missionProgress: mission?.progress,
              missionTarget: mission?.target
            })
          }
        />

        <div style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>{loungeMessage}</div>
        {aiStatus && <div style={{ marginTop: 6, fontSize: 12, opacity: 0.82 }}>{aiStatus}</div>}
        {bonusStatus && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 10px",
              borderRadius: 10,
              background: "rgba(0,229,255,0.16)",
              border: "1px solid rgba(0,229,255,0.42)",
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {bonusStatus}
          </div>
        )}

        <SlotMachine
          symbols={symbols}
          winAmount={winAmount}
          winTier={winTier}
          spinning={spinning}
          onSpin={handleSpin}
          spinLabel={
            freeSpinsRemaining > 0 ? `FREE SPIN (${freeSpinsRemaining} left)` : "SPIN (50 coins)"
          }
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
