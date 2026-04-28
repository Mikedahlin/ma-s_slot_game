type SpinResult = {
  symbols: string[][];
  winAmount: number;
  winTier: "none" | "small" | "big" | "mega";
};

type Props = {
  symbols: string[][];
  winAmount: number;
  winTier: SpinResult["winTier"];
  spinning: boolean;
  onSpin: () => void;
};

export function SlotMachine({ symbols, winAmount, winTier, spinning, onSpin }: Props) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        background: "linear-gradient(145deg,#2b1b4a,#120820)",
        boxShadow: "0 0 30px rgba(255,0,255,0.2)"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: 8,
          padding: 12,
          borderRadius: 12,
          background: "rgba(0,0,0,0.6)"
        }}
      >
        {symbols.map((row, rIdx) => (
          <div
            key={rIdx}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 6
            }}
          >
            {row.map((sym, cIdx) => (
              <div
                key={cIdx}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: "rgba(10,10,30,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  border:
                    rIdx === 1
                      ? "1px solid rgba(255,255,255,0.25)"
                      : "1px solid rgba(255,255,255,0.08)"
                }}
              >
                {sym}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, textAlign: "center", minHeight: 24 }}>
        {winTier !== "none" && (
          <div
            style={{
              fontWeight: 700,
              color:
                winTier === "small"
                  ? "#ffd700"
                  : winTier === "big"
                  ? "#ff69b4"
                  : "#00e5ff"
            }}
          >
            {winTier.toUpperCase()} WIN +{winAmount.toLocaleString()} coins
          </div>
        )}
      </div>

      <button
        onClick={onSpin}
        disabled={spinning}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 0",
          borderRadius: 999,
          border: "none",
          fontWeight: 700,
          fontSize: 16,
          background: spinning
            ? "linear-gradient(90deg,#555,#777)"
            : "linear-gradient(90deg,#ff00cc,#ff8800)",
          color: "white",
          boxShadow: "0 0 20px rgba(255,0,200,0.4)",
          cursor: spinning ? "default" : "pointer"
        }}
      >
        {spinning ? "Spinning..." : "SPIN"}
      </button>
    </div>
  );
}
