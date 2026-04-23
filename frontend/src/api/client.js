import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const http = axios.create({ baseURL: `${BASE_URL}/api` });

export const projects = {
  list: () => http.get("/projects/"),
  get: (id) => http.get(`/projects/${id}`),
  create: (data) => http.post("/projects/", data),
  update: (id, data) => http.patch(`/projects/${id}`, data),
  delete: (id) => http.delete(`/projects/${id}`),
};

export const issues = {
  list: (projectId) => http.get(`/projects/${projectId}/issues/`),
  get: (projectId, issueId) => http.get(`/projects/${projectId}/issues/${issueId}`),
  create: (projectId, data) => http.post(`/projects/${projectId}/issues/`, data),
  update: (projectId, issueId, data) =>
    http.patch(`/projects/${projectId}/issues/${issueId}`, data),
  transition: (projectId, issueId, status) =>
    http.post(`/projects/${projectId}/issues/${issueId}/transition`, { status }),
  transitions: (projectId, issueId) =>
    http.get(`/projects/${projectId}/issues/${issueId}/transitions`),
  delete: (projectId, issueId) =>
    http.delete(`/projects/${projectId}/issues/${issueId}`),
};

export const comments = {
  list: (issueId) => http.get(`/issues/${issueId}/comments/`),
  create: (issueId, body) => http.post(`/issues/${issueId}/comments/`, { body }),
  delete: (issueId, commentId) =>
    http.delete(`/issues/${issueId}/comments/${commentId}`),
};