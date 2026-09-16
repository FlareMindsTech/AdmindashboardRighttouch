// src/api/districts.js  — District Master & Operational Zones
import apiClient, { handle } from "./client";

export const listDistricts = (params = {}) =>
  handle(apiClient.get("/admin/districts", { params }));

export const getDistrictById = (id) =>
  handle(apiClient.get(`/admin/districts/${id}`));

export const createDistrict = (body) =>
  handle(apiClient.post("/admin/districts", body));

export const updateDistrict = (id, body) =>
  handle(apiClient.put(`/admin/districts/${id}`, body));

export const toggleDistrictStatus = (id, active) =>
  handle(apiClient.patch(`/admin/districts/${id}/status`, { active }));

export const toggleDistrictRegistration = (id, isRegistrationEnabled) =>
  handle(apiClient.patch(`/admin/districts/${id}/registration`, { isRegistrationEnabled }));

export const toggleDistrictJobs = (id, isJobEnabled) =>
  handle(apiClient.patch(`/admin/districts/${id}/jobs`, { isJobEnabled }));

export const getDistrictTechnicians = (id) =>
  handle(apiClient.get(`/admin/districts/${id}/technicians`));

export const deleteDistrict = (id) =>
  handle(apiClient.delete(`/admin/districts/${id}`));