type Props = { balance: number };

export function WalletBar({ balance }: Props) {
  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <div style={{ fontWeight: 600 }}>Lynne&apos;s Luxe Lights</div>
      <div
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: "linear-gradient(90deg,#ffd700,#ff8c00)",
          color: "#2b1a00",
          fontWeight: 700,
          fontSize: 14
        }}
      >
        {balance.toLocaleString()} coins
      </div>
    </div>
  );
}
