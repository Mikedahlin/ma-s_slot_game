type Props = {
  code: string;
  setCode: (v: string) => void;
  onRedeem: () => void;
  status: string | null;
};

export function PromoInput({ code, setCode, onRedeem, status }: Props) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        background: "rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ fontSize: 14, marginBottom: 6 }}>Have a promo code?</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="WELCOME500"
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(5,5,20,0.9)",
            color: "white"
          }}
        />
        <button
          onClick={onRedeem}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(90deg,#00e5ff,#00ff88)",
            color: "#021015",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Redeem
        </button>
      </div>
      {status && <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>{status}</div>}
    </div>
  );
}
