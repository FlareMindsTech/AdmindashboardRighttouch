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