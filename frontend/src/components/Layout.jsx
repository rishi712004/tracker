import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        background: "var(--blue)",
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <span style={{
            fontWeight: 700,
            fontSize: 16,
            color: "white",
            letterSpacing: "-0.01em",
          }}>
            Trackr
          </span>
        </Link>

        {!isHome && (
          <Link to="/" style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 500,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "white"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
          >
            ← Projects
          </Link>
        )}
      </header>

      <main style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "32px 24px",
      }}>
        {children}
      </main>
    </div>
  );
}
