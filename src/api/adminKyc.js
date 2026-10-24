// src/api/adminKyc.js — KYC & Bank Review (Admin canonical paths)
// Matches Postman folder "7. KYC & Bank Review" (Routes/adminKycRoutes.js).
// NOTE: src/api/technicians.js keeps the legacy /technician/kyc... paths used
// by existing views/store; this module is the canonical /admin/kyc + /admin/bank
// surface from the collection. Both coexist intentionally (same pattern as
// notifications.js vs notificationCounts.js).
import apiClient, { handle } from "./client";

/* ================= KYC ================= */

export const listAllKyc = (params) =>
  handle(apiClient.get("/admin/kyc", { params }));

export const getKycByTechnician = (technicianId) =>
  handle(apiClient.get(`/admin/kyc/${technicianId}`));

export const getKycFull = (technicianId) =>
  handle(apiClient.get(`/admin/kyc/${technicianId}/full`));

export const updateKycDetails = (technicianId, body) =>
  handle(apiClient.put(`/admin/kyc/${technicianId}`, body));

export const verifyKyc = (technicianId, body) =>
  handle(apiClient.put(`/admin/kyc/${technicianId}/verify`, body));

export const deleteTechnicianKyc = (technicianId) =>
  handle(apiClient.delete(`/admin/kyc/${technicianId}`));

/* ================= ORPHANED KYC ================= */

export const listOrphanedKyc = (params) =>
  handle(apiClient.get("/admin/kyc/orphaned/list", { params }));

export const deleteOrphanedKyc = (kycId) =>
  handle(apiClient.delete(`/admin/kyc/orphaned/${kycId}`));

export const cleanupAllOrphanedKyc = () =>
  handle(apiClient.delete("/admin/kyc/orphaned/cleanup/all"));

/* ================= BANK ================= */

export const updateBankDetails = (technicianId, body) =>
  handle(apiClient.put(`/admin/bank/${technicianId}`, body));

export const verifyBankDetails = (technicianId, body) =>
  handle(apiClient.put(`/admin/bank/${technicianId}/verify`, body));
