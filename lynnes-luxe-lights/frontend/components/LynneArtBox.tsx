type LynneArt = {
  imageDataUrl: string;
  caption: string;
  provider: "openai" | "google" | "fallback";
};

type Props = {
  art: LynneArt | null;
  loading: boolean;
  onRefresh: () => void;
};

export function LynneArtBox({ art, loading, onRefresh }: Props) {
  return (
    <div
      style={{
        marginTop: 14,
        borderRadius: 14,
        background: "rgba(0,0,0,0.46)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 10
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          gap: 8
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>Lynne Story Art</div>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            background: loading
              ? "linear-gradient(90deg,#666,#888)"
              : "linear-gradient(90deg,#00e5ff,#00ff88)",
            color: loading ? "white" : "#06131a"
          }}
        >
          {loading ? "Loading..." : "Refresh Art"}
        </button>
      </div>

      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(9,10,24,0.9)",
          aspectRatio: "9 / 13",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {art?.imageDataUrl ? (
          <img
            src={art.imageDataUrl}
            alt="AI art for Lynne"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ opacity: 0.8, fontSize: 12, padding: 16, textAlign: "center" }}>
            AI image will appear here.
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.92 }}>
        {art?.caption ?? "Story beat will appear here after AI art loads."}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
        Provider: {art?.provider ?? "none"}
      </div>
    </div>
  );
}

