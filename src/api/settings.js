// src/api/settings.js  — Global & Payout Settings APIs
import apiClient, { handle } from "./client";

export const getReacceptPenalty = () =>
  handle(apiClient.get("/admin/settings/reaccept-penalty"));

export const setReacceptPenalty = (body) => {
  const payload =
    typeof body === "object"
      ? body
      : { percent: body, penaltyPercent: body };
  return handle(apiClient.put("/admin/settings/reaccept-penalty", payload));
};

export const getAutoPayoutSettings = () =>
  handle(apiClient.get("/admin/settings/auto-payout"));

export const updateAutoPayoutSettings = (body) =>
  handle(apiClient.put("/admin/settings/auto-payout", body));

// Withdrawal Configuration & Limits (Manual Payouts)
export const getWithdrawalSettings = () =>
  handle(
    apiClient
      .get("/admin/settings/withdrawal")
      .catch(() => apiClient.get("/admin/settings/auto-payout"))
  );

export const updateWithdrawalSettings = (body) =>
  handle(
    apiClient
      .put("/admin/settings/withdrawal", body)
      .catch(() => apiClient.put("/admin/settings/auto-payout", body))
  );

