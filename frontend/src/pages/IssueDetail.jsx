import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { issues as issuesApi, comments as commentsApi } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const btn = (primary, disabled) => ({
  background: disabled ? "var(--border)" : primary ? "var(--blue)" : "var(--surface)",
  color: disabled ? "var(--text-muted)" : primary ? "white" : "var(--text)",
  border: primary || disabled ? "none" : "1.5px solid var(--border)",
  padding: "9px 18px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.15s",
  opacity: disabled ? 0.7 : 1,
});

const STATUS_LABELS = {
  in_progress: "In Progress",
  open: "Open",
  resolved: "Resolved",
  closed: "Closed",
};

export default function IssueDetail() {
  const { projectId, issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [allowed, setAllowed] = useState([]);
  const [commentList, setCommentList] = useState([]);
  const [body, setBody] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState("");

  useEffect(() => {
    issuesApi.get(projectId, issueId).then(r => setIssue(r.data));
    issuesApi.transitions(projectId, issueId).then(r => setAllowed(r.data.allowed));
    commentsApi.list(issueId).then(r => setCommentList(r.data));
  }, [projectId, issueId]);

  async function handleTransition(status) {
    setTransitionError("");
    setTransitioning(true);
    try {
      const r = await issuesApi.transition(projectId, issueId, status);
      setIssue(r.data);
      const t = await issuesApi.transitions(projectId, issueId);
      setAllowed(t.data.allowed);
    } catch (err) {
      setTransitionError(err.response?.data?.error ?? "Transition failed");
    } finally {
      setTransitioning(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    const r = await commentsApi.create(issueId, body.trim());
    setCommentList([...commentList, r.data]);
    setBody("");
  }

  async function handleDeleteComment(commentId) {
    await commentsApi.delete(issueId, commentId);
    setCommentList(commentList.filter(c => c.id !== commentId));
  }

  if (!issue) return null;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }}>
            #{issue.id} · Updated {new Date(issue.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>{issue.title}</h1>
        {issue.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{issue.description}</p>
        )}
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          Move Status
        </p>
        {allowed.length === 0 ? (
          <div style={{
            background: "var(--surface-2)",
            border: "1.5px solid var(--border)",
            borderRadius: 8,
            padding: "12px 16px",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            This issue is closed — no further transitions available.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {allowed.map(s => (
              <button
                key={s}
                onClick={() => handleTransition(s)}
                disabled={transitioning}
                style={{
                  background: "var(--blue-dim)",
                  color: "var(--blue)",
                  border: "1.5px solid var(--blue-mid)",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: transitioning ? "not-allowed" : "pointer",
                  opacity: transitioning ? 0.6 : 1,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!transitioning) { e.currentTarget.style.background = "var(--blue)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--blue-dim)"; e.currentTarget.style.color = "var(--blue)"; }}
              >
                → {STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        )}
        {transitionError && (
          <p style={{ color: "var(--red)", fontSize: 12, marginTop: 12, background: "var(--red-dim)", padding: "8px 12px", borderRadius: 6 }}>
            {transitionError}
          </p>
        )}
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        padding: 20,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
          Comments ({commentList.length})
        </p>

        {commentList.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {commentList.map(c => (
              <div key={c.id} style={{
                background: "var(--surface-2)",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text)", flex: 1 }}>{c.body}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{ background: "transparent", color: "var(--text-dim)", fontSize: 16, padding: "0 4px", borderRadius: 3, transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                    >×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComment}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Add a comment..."
            style={{ marginBottom: 10 }}
          />
          <button
            type="submit"
            disabled={!body.trim()}
            style={btn(true, !body.trim())}
          >
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
}
