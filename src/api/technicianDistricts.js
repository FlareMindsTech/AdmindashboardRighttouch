// src/api/technicianDistricts.js  — Technician District Permissions
import apiClient, { handle } from "./client";

export const getTechnicianDistricts = (technicianId) =>
  handle(apiClient.get(`/admin/technicians/${technicianId}/districts`));

export const addTechnicianDistrictPermission = (technicianId, districtId) =>
  handle(apiClient.post(`/admin/technicians/${technicianId}/districts`, { districtId }));

export const toggleTechnicianDistrictPermission = (technicianId, districtId, isEnabled) =>
  handle(apiClient.patch(`/admin/technicians/${technicianId}/districts/${districtId}`, { isEnabled }));

export const removeTechnicianDistrictPermission = (technicianId, districtId) =>
  handle(apiClient.delete(`/admin/technicians/${technicianId}/districts/${districtId}`));

/* ================= TECHNICIAN CITY ZONE PERMISSIONS ================= */

export const getTechnicianZonePermissions = (technicianId) =>
  handle(apiClient.get(`/admin/technicians/${technicianId}/city-zones`));

export const enableTechnicianZonePermission = (technicianId, cityZoneId, reason = "") =>
  handle(apiClient.post(`/admin/technicians/${technicianId}/city-zones`, { cityZoneId, reason }));

export const disableTechnicianZonePermission = (technicianId, zoneId, reason = "") =>
  handle(apiClient.delete(`/admin/technicians/${technicianId}/city-zones/${zoneId}`, { data: { reason } }));