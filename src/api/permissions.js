// src/api/permissions.js — Admin Permissions (Admin)
// Matches the permissions requests inside Postman folder "17"
// (Routes/adminPermissionRoutes.js). NEW module — no prior coverage in src/api.
import apiClient, { handle } from "./client";

export const getUserPermissions = (userId) =>
  handle(apiClient.get(`/admin/permissions/${userId}`));

export const getPermissionsAnalytics = (params) =>
  handle(apiClient.get("/admin/permissions/analytics", { params }));
