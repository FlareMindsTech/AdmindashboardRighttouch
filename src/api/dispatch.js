// src/api/dispatch.js — Dispatch Queue Ops (Admin)
// Matches Postman folder "14. Dispatch Queue Ops"
// (Routes/adminDispatchRoutes.js). NEW module — no prior coverage in src/api
// (only GET /admin/dispatch-debug in serviceAvailability.js, which is a
// different diagnostics endpoint and is kept as-is).
import apiClient, { handle } from "./client";

export const getDispatchPending = (params) =>
  handle(apiClient.get("/admin/dispatch/pending", { params }));

export const getDispatchFailed = (params) =>
  handle(apiClient.get("/admin/dispatch/failed", { params }));

export const getDispatchStats = (params) =>
  handle(apiClient.get("/admin/dispatch/stats", { params }));

export const getDispatchHealth = () =>
  handle(apiClient.get("/admin/dispatch/health"));

export const retryDispatch = (id, body = {}) =>
  handle(apiClient.post(`/admin/dispatch/${id}/retry`, body));

export const retryFailedDispatches = (body = {}) =>
  handle(apiClient.post("/admin/dispatch/retry-failed", body));

export const restartDispatchWorker = (body = {}) =>
  handle(apiClient.post("/admin/dispatch/worker/restart", body));

export const stopDispatchWorker = (body = {}) =>
  handle(apiClient.post("/admin/dispatch/worker/stop", body));
