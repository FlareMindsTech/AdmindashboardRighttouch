// src/api/finance.js  — Section 8: Finance Tracking
import apiClient, { handle } from "./client";

export const getFinanceSummary = (params) =>
  handle(apiClient.get("/admin/finance/summary", { params }));
export const getFinanceBreakdown = (params) =>
  handle(apiClient.get("/admin/finance/breakdown", { params }));
export const getPaymentsLedger = (params) =>
  handle(apiClient.get("/admin/finance/payments", { params }));
export const getTechnicianFinance = (technicianId) =>
  handle(apiClient.get(`/admin/finance/technician/${technicianId}`));
export const getFinanceEarnings = (params) =>
  handle(apiClient.get("/admin/finance/earnings", { params }));


