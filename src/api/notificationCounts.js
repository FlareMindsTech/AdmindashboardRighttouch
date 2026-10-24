// src/api/notificationCounts.js — Sidebar module-badge counts (domain A).
//
// These endpoints are DISTINCT from the inbox endpoints in
// ./notifications.js (domain B) and must not be merged with them:
// - GET  /admin/notifications/unread-counts  -> { counts: {
//        productQuoteRequests, technicianApplications, customerReports } }
// - PATCH /admin/notifications/mark-read     { module, id, markAll }
//        -> updated { counts }
//
// Relocated (not duplicated) from hooks/useAdminNotificationCounts.js so the
// Redux slice has a single canonical request location. Same URLs, methods,
// bodies, and tolerant response reading as the hook's original fetch calls.
// Auth header + 401/session-expiry flow come from ./client (apiClient),
// matching the legacy global-fetch 401 handling the hook relied on.
import apiClient, { handle } from "./client";

const DEFAULT_COUNTS = {
  productQuoteRequests: 0,
  technicianApplications: 0,
  customerReports: 0,
};

const readCounts = (body) => {
  const counts =
    body?.counts || body?.result?.counts || body?.data?.counts || null;
  if (!counts || typeof counts !== "object") return null;
  return { ...DEFAULT_COUNTS, ...counts };
};

export const getModuleUnreadCounts = async () => {
  const { data, error } = await handle(
    apiClient.get("/admin/notifications/unread-counts")
  );
  if (error) return { data: null, error };
  const counts = readCounts(data);
  if (!counts) return { data: null, error: "Invalid counts response" };
  return { data: { counts }, error: null };
};

export const markModuleNotificationsRead = async ({
  module,
  id = null,
  markAll = false,
} = {}) => {
  const { data, error } = await handle(
    apiClient.patch("/admin/notifications/mark-read", { module, id, markAll })
  );
  if (error) return { data: null, error };
  const counts = readCounts(data);
  if (!counts) return { data: null, error: "Invalid counts response" };
  return { data: { counts }, error: null };
};

export const DEFAULT_MODULE_COUNTS = DEFAULT_COUNTS;
export default { getModuleUnreadCounts, markModuleNotificationsRead };
