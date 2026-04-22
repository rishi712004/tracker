import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import IssueDetail from "./pages/IssueDetail";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetail />} />
      </Routes>
    </Layout>
  );
}
