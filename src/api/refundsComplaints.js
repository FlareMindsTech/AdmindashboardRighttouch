// src/api/refundsComplaints.js  — Refunds & Complaints APIs
import apiClient, { handle } from "./client";

export const previewRefund = (body) =>
  handle(apiClient.post("/admin/refunds/preview", body));

export const createRefund = (body) =>
  handle(apiClient.post("/admin/refunds", body));

export const approveRefund = (refundId, approvedBy) => {
  const payload = typeof approvedBy === "object" ? approvedBy : { approvedBy };
  return handle(apiClient.post(`/admin/refunds/${refundId}/approve`, payload));
};

export const retryRefund = (refundId) =>
  handle(apiClient.post(`/admin/refunds/${refundId}/retry`));

export const customerPayoutRefund = (refundId, destination) => {
  const payload =
    typeof destination === "object" && destination.destination
      ? destination
      : { refundId, destination };
  return handle(apiClient.post(`/admin/refunds/${refundId}/customer-payout`, payload));
};

export const listRefunds = (params) => {
  const options = typeof params === "string" ? { status: params } : params;
  return handle(apiClient.get("/admin/refunds", { params: options }));
};

export const listComplaints = (params) => {
  const options = typeof params === "string" ? { status: params } : params;
  return handle(apiClient.get("/admin/complaints", { params: options }));
};

export const getComplaintDetail = (id) =>
  handle(apiClient.get(`/admin/complaints/${id}`));

export const rejectComplaint = (id, body) => {
  const payload = typeof body === "object" ? body : { reason: body || "" };
  return handle(apiClient.post(`/admin/complaints/${id}/reject`, payload));
};

export const getComplaintCategories = () =>
  handle(apiClient.get("/admin/complaints/categories"));

export const updateComplaintStatus = (id, body) =>
  handle(apiClient.post(`/admin/complaints/${id}/status`, body));

