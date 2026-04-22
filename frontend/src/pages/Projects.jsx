import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projects as api } from "../api/client";

const card = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: 12,
  padding: "18px 20px",
  cursor: "pointer",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const btn = (primary) => ({
  background: primary ? "var(--blue)" : "var(--surface)",
  color: primary ? "white" : "var(--text)",
  border: primary ? "none" : "1.5px solid var(--border)",
  padding: "9px 18px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  transition: "all 0.15s",
});

export default function Projects() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.list().then((r) => setList(r.data));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    try {
      const r = await api.create({ name: name.trim(), description: description.trim() });
      setList([r.data, ...list]);
      setName("");
      setDescription("");
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg ?? "Something went wrong");
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this project and all its issues?")) return;
    await api.delete(id);
    setList(list.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Projects</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {list.length} {list.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <button
          style={btn(!creating)}
          onClick={() => setCreating(!creating)}
          onMouseEnter={e => { if (!creating) { e.currentTarget.style.background = "#1e40af"; } }}
          onMouseLeave={e => { if (!creating) { e.currentTarget.style.background = "var(--blue)"; } }}
        >
          {creating ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {creating && (
        <div style={{
          background: "var(--surface)",
          border: "1.5px solid var(--blue-light)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 0 0 4px rgba(59,130,246,0.08)",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>New Project</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</label>
              <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Backend API" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 14 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={btn(true)}>Create Project</button>
              <button type="button" style={btn(false)} onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {list.length === 0 && !creating ? (
        <div style={{
          background: "var(--surface)",
          border: "1.5px dashed var(--border)",
          borderRadius: 12,
          padding: "60px 40px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No projects yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Create your first project to start tracking issues.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(project => (
            <div
              key={project.id}
              style={card}
              onClick={() => navigate(`/projects/${project.id}`)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue-light)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: project.description ? 4 : 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{project.name}</span>
                  </div>
                  {project.description && (
                    <p style={{ color: "var(--text-muted)", fontSize: 13, paddingLeft: 18 }}>{project.description}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <button
                    onClick={e => handleDelete(e, project.id)}
                    style={{ background: "transparent", color: "var(--text-dim)", fontSize: 18, lineHeight: 1, padding: "2px 6px", borderRadius: 4, transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                  >×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
