// src/api/productDashboard.js — Product Dashboard, Audit Logs & Sales Reports
// Matches Postman folder "10. Product Dashboard & Sales"
// (Routes/adminProductDashboardRoutes.js). NEW module — previously only
// scattered legacy fetch helpers in views/utils/axiosInstance.js.
import apiClient, { handle } from "./client";

export const getProductDashboard = (params) =>
  handle(apiClient.get("/admin/product-dashboard", { params }));

export const getSalesReport = (params) =>
  handle(apiClient.get("/admin/product-reports/sales", { params }));

export const listProductAuditLogs = (params) =>
  handle(apiClient.get("/admin/product-audit-logs", { params }));

export const getProductAuditLogById = (id) =>
  handle(apiClient.get(`/admin/product-audit-logs/${id}`));
