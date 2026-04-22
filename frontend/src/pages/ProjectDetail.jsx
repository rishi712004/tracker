import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects as projectsApi, issues as issuesApi } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUS_FILTERS = ["all", "open", "in_progress", "resolved", "closed"];

const btn = (primary, small) => ({
  background: primary ? "var(--blue)" : "var(--surface)",
  color: primary ? "white" : "var(--text)",
  border: primary ? "none" : "1.5px solid var(--border)",
  padding: small ? "6px 14px" : "9px 18px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: small ? 12 : 13,
  cursor: "pointer",
  transition: "all 0.15s",
  whiteSpace: "nowrap",
});

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [issueList, setIssueList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [error, setError] = useState("");

  useEffect(() => {
    projectsApi.get(projectId).then(r => setProject(r.data));
    issuesApi.list(projectId).then(r => setIssueList(r.data));
  }, [projectId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError("");
    try {
      const r = await issuesApi.create(projectId, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      setIssueList([r.data, ...issueList]);
      setForm({ title: "", description: "", priority: "medium" });
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg ?? "Something went wrong");
    }
  }

  async function handleDelete(e, issueId) {
    e.stopPropagation();
    await issuesApi.delete(projectId, issueId);
    setIssueList(issueList.filter(i => i.id !== issueId));
  }

  const visible = filter === "all" ? issueList : issueList.filter(i => i.status === filter);
  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === "all" ? issueList.length : issueList.filter(i => i.status === s).length;
    return acc;
  }, {});

  if (!project) return null;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{project.name}</h1>
        {project.description && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{project.description}</p>}
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background: filter === s ? "var(--blue-dim)" : "transparent",
                color: filter === s ? "var(--blue)" : "var(--text-muted)",
                border: filter === s ? "1.5px solid var(--blue-mid)" : "1.5px solid transparent",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              {counts[s] > 0 && (
                <span style={{
                  marginLeft: 6,
                  background: filter === s ? "var(--blue)" : "var(--border)",
                  color: filter === s ? "white" : "var(--text-muted)",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontSize: 11,
                }}>
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          style={btn(true)}
          onClick={() => setCreating(!creating)}
          onMouseEnter={e => e.currentTarget.style.background = "#1e40af"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--blue)"}
        >
          {creating ? "Cancel" : "+ New Issue"}
        </button>
      </div>

      {creating && (
        <div style={{
          background: "var(--surface)",
          border: "1.5px solid var(--blue-light)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
          boxShadow: "0 0 0 4px rgba(59,130,246,0.08)",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>New Issue</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</label>
              <input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be fixed?" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</label>
              <div style={{ display: "flex", gap: 8 }}>
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{
                      background: form.priority === p ? "var(--blue-dim)" : "var(--surface-2)",
                      color: form.priority === p ? "var(--blue)" : "var(--text-muted)",
                      border: form.priority === p ? "1.5px solid var(--blue-light)" : "1.5px solid var(--border)",
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "all 0.15s",
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 14 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={btn(true)}>Create Issue</button>
              <button type="button" style={btn(false)} onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {visible.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          border: "1.5px dashed var(--border)",
          borderRadius: 12,
          padding: "50px 40px",
          textAlign: "center",
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {filter === "all" ? "No issues yet. Create one to get started." : `No ${filter.replace("_", " ")} issues.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visible.map(issue => (
            <div
              key={issue.id}
              onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: 10,
                padding: "14px 18px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue-light)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.title}</p>
                <PriorityBadge priority={issue.priority} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <StatusBadge status={issue.status} />
                <span style={{ fontSize: 12, color: "var(--text-dim)", minWidth: 70, textAlign: "right" }}>
                  {new Date(issue.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={e => handleDelete(e, issue.id)}
                  style={{ background: "transparent", color: "var(--text-dim)", fontSize: 18, padding: "2px 5px", borderRadius: 4, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
