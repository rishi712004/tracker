const config = {
  open:        { color: "#1d4ed8", bg: "#dbeafe", label: "Open" },
  in_progress: { color: "#92400e", bg: "#fef3c7", label: "In Progress" },
  resolved:    { color: "#065f46", bg: "#d1fae5", label: "Resolved" },
  closed:      { color: "#374151", bg: "#f3f4f6", label: "Closed" },
};

export default function StatusBadge({ status }) {
  const s = config[status] || config.closed;
  return (
    <span style={{
      color: s.color,
      background: s.bg,
      fontSize: 12,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}
