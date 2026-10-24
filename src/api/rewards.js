// src/api/rewards.js — Rewards Policy, Wallets & Metrics (Admin)
// Matches Postman folder "16. Rewards Policy & Metrics" (Routes/rewardRoutes.js)
import apiClient, { handle } from "./client";

export const getRewardPolicy = () =>
  handle(apiClient.get("/admin/rewards/policy"));

export const createRewardPolicy = (body) =>
  handle(apiClient.post("/admin/rewards/policy", body));

export const getRewardMetrics = (params) =>
  handle(apiClient.get("/admin/rewards/metrics", { params }));

export const getRewardWallets = (params) =>
  handle(apiClient.get("/admin/rewards/wallets", { params }));

export const getCustomerRewardOverview = (customerId) =>
  handle(apiClient.get(`/admin/rewards/wallets/${customerId}`));

export const getRewardTransactions = (params) =>
  handle(apiClient.get("/admin/rewards/transactions", { params }));

export const getRewardRedemptions = (params) =>
  handle(apiClient.get("/admin/rewards/redemptions", { params }));

export const getRewardReconciliation = () =>
  handle(apiClient.get("/admin/rewards/reconciliation"));
