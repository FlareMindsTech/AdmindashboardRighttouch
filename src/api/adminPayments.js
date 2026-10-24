// src/api/adminPayments.js — Admin Payments (Offline & Product)
// Matches Postman folder "11. Payments (Offline & Product)"
// (Routes/adminPaymentRoutes.js). NEW module — src/api/payments.js only covers
// the /user/payment/* customer-side paths; these are the /admin/* ops paths.
import apiClient, { handle } from "./client";

/* ================= OFFLINE PAYMENTS ================= */

export const recordOfflinePayment = (body) =>
  handle(apiClient.post("/admin/payments/record-offline", body));

export const recordOfflinePaymentForBooking = (bookingId, body) =>
  handle(
    apiClient.post(`/admin/payments/record-offline/${bookingId}`, body)
  );

export const updateAdminPaymentStatus = (id, body) =>
  handle(apiClient.put(`/admin/payments/${id}/status`, body));

export const getPaymentByBookingAdmin = (bookingId) =>
  handle(apiClient.get(`/admin/payments/booking/${bookingId}`));

export const deleteBookingAsAdmin = (id) =>
  handle(apiClient.delete(`/admin/payments/booking/${id}`));

/* ================= PRODUCT PAYMENTS ================= */

export const listProductPayments = (params) =>
  handle(apiClient.get("/admin/payments/product-payments", { params }));

export const getProductPaymentsSummary = (params) =>
  handle(
    apiClient.get("/admin/payments/product-payments/summary", { params })
  );
