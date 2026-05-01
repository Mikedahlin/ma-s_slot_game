type Mission = {
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
};

export function MissionsPanel({ mission }: { mission: Mission | null }) {
  if (!mission) return null;
  const pct = (mission.progress / mission.target) * 100;
  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        background: "rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.8 }}>Daily Mission</div>
      <div style={{ fontWeight: 600, marginTop: 4 }}>Spin {mission.target} times</div>
      <div style={{ fontSize: 13, marginTop: 2 }}>
        {mission.progress}/{mission.target} • Reward: {mission.reward.toLocaleString()} coins
      </div>
      <div
        style={{
          marginTop: 8,
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg,#00e5ff,#00ff88)"
          }}
        />
      </div>
      {mission.completed && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#00ff88" }}>
          Completed! (auto-claimed in this demo)
        </div>
      )}
    </div>
  );
}
