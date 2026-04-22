const config = {
  low:      { color: "#6b7a8f", label: "Low" },
  medium:   { color: "#1d4ed8", label: "Medium" },
  high:     { color: "#d97706", label: "High" },
  critical: { color: "#dc2626", label: "Critical" },
};

const dot = {
  low: "○",
  medium: "◔",
  high: "◕",
  critical: "●",
};

export default function PriorityBadge({ priority }) {
  const s = config[priority] || config.medium;
  return (
    <span style={{
      color: s.color,
      fontSize: 12,
      fontWeight: 500,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    }}>
      <span style={{ fontSize: 10 }}>{dot[priority]}</span>
      {s.label}
    </span>
  );
}
