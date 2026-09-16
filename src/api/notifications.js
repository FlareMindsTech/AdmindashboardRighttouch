// src/api/notifications.js  — Section 17: Notifications (In-App Inbox)
import apiClient, { handle } from "./client";

export const listNotifications = (params) =>
  handle(apiClient.get("/admin/notifications", { params }));
export const getUnreadCount = () =>
  handle(apiClient.get("/admin/notifications/unread-count"));
export const markNotificationRead = (id) =>
  handle(apiClient.patch(`/admin/notifications/${id}/read`, {}));
export const markAllNotificationsRead = () =>
  handle(apiClient.patch("/admin/notifications/read-all", {}));
export const markNotificationReceived = (id) =>
  handle(apiClient.post(`/admin/notifications/${id}/received`, {}));
export const markNotificationOpened = (id) =>
  handle(apiClient.post(`/admin/notifications/${id}/opened`, {}));
