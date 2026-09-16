// src/api/technicians.js  — Section 13: Technician Management & KYC Review
import apiClient, { handle } from "./client";

export const getAllTechnicians = () =>
  handle(apiClient.get("/technician/technicianAll"));
export const getTechnicianById = (id) =>
  handle(apiClient.get(`/technician/technicianById/${id}`));
export const getMyTechnicianProfile = () =>
  handle(apiClient.get("/technician/technician/me"));
export const updateTechnician = (body) =>
  handle(apiClient.put("/technician/updateTechnician", body));
export const updateTechnicianStatus = (body) =>
  handle(apiClient.put("/technician/technician/status", body));
export const updateTechnicianTraining = (id, trainingCompleted) =>
  handle(
    apiClient.put(`/technician/${id}/training`, { trainingCompleted })
  );
export const deleteTechnician = (id) =>
  handle(apiClient.delete(`/technician/technicianDelete/${id}`));

export const getAllKYC = () => handle(apiClient.get("/technician/technician/kyc"));
export const getKYCByTechnician = (id) =>
  handle(apiClient.get(`/technician/technician/kyc/${id}`));
export const getKYCFull = (id) =>
  handle(apiClient.get(`/technician/technician/kyc/${id}/full`));
export const verifyKYC = (body) =>
  handle(apiClient.put("/technician/technician/kyc/verify", body));
export const verifyBankDetails = (body) =>
  handle(apiClient.put("/technician/technician/kyc/bank/verify", body));
export const deleteKYC = (id) =>
  handle(apiClient.delete(`/technician/technician/deletekyc/${id}`));
export const adminEditKYCDetails = (id, body) =>
  handle(apiClient.put(`/admin/kyc/${id}`, body));
export const adminEditBankDetails = (id, body) =>
  handle(apiClient.put(`/admin/bank/${id}`, body));
export const listOrphanedKYC = () =>
  handle(apiClient.get("/technician/technician/kyc/orphaned/list"));
export const deleteOrphanedKYC = (kycId) =>
  handle(apiClient.delete(`/technician/technician/kyc/orphaned/${kycId}`));
export const cleanupAllOrphanedKYC = () =>
  handle(apiClient.delete("/technician/technician/kyc/orphaned/cleanup/all"));

export const getAcceptedJobs = () =>
  handle(apiClient.get("/technician/jobs/accepted"));
export const getAcceptedScheduledJobs = () =>
  handle(apiClient.get("/technician/jobs/accepted/scheduled"));
export const getCurrentJobs = () =>
  handle(apiClient.get("/technician/jobs/current"));
export const getAdminJobHistory = () =>
  handle(apiClient.get("/technician/admin/jobs/history"));
export const registerTechnicianFcm = (token, unregister = false) =>
  handle(
    apiClient.put("/technician/fcm-token", { token, unregister })
  );
