// src/api/commission.js  — Section 10: Commission Governance
import apiClient, { handle } from "./client";

export const listServiceCommissions = (params) =>
  handle(apiClient.get("/admin/commission/services", { params }));
export const getServiceCommission = (serviceId) =>
  handle(apiClient.get(`/admin/commission/service/${serviceId}`));
export const setServiceCommission = (serviceId, body) =>
  handle(apiClient.put(`/admin/commission/service/${serviceId}`, body));
export const overrideBookingCommission = (bookingId, body) =>
  handle(
    apiClient.put(`/admin/commission/booking/${bookingId}/override`, body)
  );
