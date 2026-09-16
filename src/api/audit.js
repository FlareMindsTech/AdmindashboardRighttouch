// src/api/audit.js  — Section 14: Audit Logs
import apiClient, { handle } from "./client";

export const getAuditLogs = (params) => handle(apiClient.get("/admin/audit-logs", { params }));
