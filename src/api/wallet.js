// src/api/wallet.js  — Wallet & Payouts APIs
import apiClient, { handle } from "./client";

export const getPlatformWallet = (params) =>
  handle(apiClient.get("/admin/wallet", { params }));

export const getWithdrawalHistory = (params) =>
  handle(apiClient.get("/admin/wallet/withdrawalhistory", { params }));

export const getAllWithdrawals = (params) =>
  handle(apiClient.get("/admin/wallet/withdrawalhistory", { params }));

export const approveWithdrawal = (id, body) =>
  handle(apiClient.put(`/admin/wallet/withdrawal/${id}/approve`, body));

export const rejectWithdrawal = (id, body) =>
  handle(apiClient.put(`/admin/wallet/withdrawal/${id}/reject`, body));

export const payWithdrawal = (id, body) =>
  handle(apiClient.put(`/admin/wallet/withdrawal/${id}/pay`, body));

export const getAutoPayoutSummary = () =>
  handle(apiClient.get("/admin/wallet/auto-payouts/summary"));

// Manual technician wallet credit/debit (bonus / penalty)
export const technicianWalletTransaction = (body) =>
  handle(apiClient.post("/technician/wallet/transaction", body));

// Admin Manual Payout to Technician
export const sendMoneyToTechnician = (technicianId, body) =>
  handle(apiClient.post(`/admin/wallet/technician/${technicianId}/send-money`, body));

// Approve Admin Manual Payout
export const approveManualPayout = (id, body) =>
  handle(apiClient.put(`/admin/wallet/withdrawal/${id}/approve-manual-payout`, body));

// Resolve Manual Review Payout
export const resolveManualReviewPayout = (id, body) =>
  handle(apiClient.put(`/admin/wallet/withdrawal/${id}/resolve-manual-review`, body));


