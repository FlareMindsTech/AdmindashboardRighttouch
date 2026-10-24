// src/api/districts.js — District Master & Operational Districts (Admin)
import apiClient, { handle } from "./client";

// List districts: { active: true | false }
export const listDistricts = (params = {}) =>
  handle(apiClient.get("/admin/districts", { params }));

// Get district by ID
export const getDistrictById = (id) =>
  handle(apiClient.get(`/admin/districts/${id}`));

// Create district
export const createDistrict = (body) =>
  handle(apiClient.post("/admin/districts", body));

// Update district
export const updateDistrict = (id, body) =>
  handle(apiClient.put(`/admin/districts/${id}`, body));

// Toggle district active status
export const toggleDistrictStatus = (id, active) =>
  handle(apiClient.patch(`/admin/districts/${id}/status`, { active }));

// Toggle district technician registration flag
export const toggleDistrictRegistration = (id, isRegistrationEnabled) =>
  handle(apiClient.patch(`/admin/districts/${id}/registration`, { isRegistrationEnabled }));

// Toggle district customer jobs flag
export const toggleDistrictJobs = (id, isJobEnabled) =>
  handle(apiClient.patch(`/admin/districts/${id}/jobs`, { isJobEnabled }));

// List technicians assigned/registered in district
export const getDistrictTechnicians = (id) =>
  handle(apiClient.get(`/admin/districts/${id}/technicians`));

// Delete district
export const deleteDistrict = (id) =>
  handle(apiClient.delete(`/admin/districts/${id}`));

// ---- Legacy double-prefix aliases (/admin/admin/districts/*) ----
// The collection lists these alongside /admin/districts/* (same handlers in
// Routes/operationalCityRoutes.js). Kept as thin aliases so both prefixes work.
export const listAdminDistricts = (params = {}) =>
  handle(apiClient.get("/admin/admin/districts", { params }));

export const getAdminDistrictById = (id) =>
  handle(apiClient.get(`/admin/admin/districts/${id}`));

export const createAdminDistrict = (body) =>
  handle(apiClient.post("/admin/admin/districts", body));

export const updateAdminDistrict = (id, body) =>
  handle(apiClient.put(`/admin/admin/districts/${id}`, body));

export const deleteAdminDistrict = (id) =>
  handle(apiClient.delete(`/admin/admin/districts/${id}`));

export const toggleAdminDistrictStatus = (id, body) =>
  handle(apiClient.patch(`/admin/admin/districts/${id}/status`, body));

export const toggleAdminDistrictRegistration = (id, body) =>
  handle(apiClient.patch(`/admin/admin/districts/${id}/registration`, body));

export const toggleAdminDistrictJobs = (id, body) =>
  handle(apiClient.patch(`/admin/admin/districts/${id}/jobs`, body));

export const getAdminDistrictTechnicians = (id) =>
  handle(apiClient.get(`/admin/admin/districts/${id}/technicians`));