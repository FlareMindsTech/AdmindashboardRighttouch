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

// Alias: collection lists both /withdrawals and /withdrawalhistory
export const getWithdrawals = (params) =>
  handle(apiClient.get("/admin/wallet/withdrawals", { params }));

// Technician Specific Wallet Overview
export const getTechnicianWalletOverview = (technicianId) =>
  handle(apiClient.get(`/admin/wallet/technician/${technicianId}`));

// Withdrawal detail + receipt (Postman folder 12)
export const getWithdrawalDetails = (id) =>
  handle(apiClient.get(`/admin/wallet/withdrawal/${id}/details`));

export const getWithdrawalReceipt = (id) =>
  handle(apiClient.get(`/admin/wallet/withdrawal/${id}/receipt`));

// CSV exports
export const exportWithdrawals = (params) =>
  handle(apiClient.get("/admin/wallet/export", { params }));

export const exportBulkPayments = (params) =>
  handle(apiClient.get("/admin/wallet/bulk-payment-export", { params }));

// Post-payment lifecycle: mark-paid / retry / revert-paid
export const markWithdrawalPaid = (id, body) =>
  handle(apiClient.post(`/admin/wallet/withdrawal/${id}/mark-paid`, body));

export const retryWithdrawal = (id, body = {}) =>
  handle(apiClient.post(`/admin/wallet/withdrawal/${id}/retry`, body));

export const revertPaidWithdrawal = (id, body) =>
  handle(apiClient.post(`/admin/wallet/withdrawal/${id}/revert-paid`, body));

// Freeze / unfreeze technician payouts: { freeze: true|false, reason }
export const toggleTechnicianPayoutFreeze = (technicianId, body) =>
  handle(apiClient.put(`/admin/wallet/technician/${technicianId}/freeze`, body));
