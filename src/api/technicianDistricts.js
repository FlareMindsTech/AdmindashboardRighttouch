// src/api/technicianDistricts.js — Technician District & Zone Approvals (Admin)
import apiClient, { handle } from "./client";

/* ================= TECHNICIAN DISTRICT PERMISSIONS ================= */

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

// Approve zone(s): body can be { cityZoneIds: [id], reason } or cityZoneIds directly
export const approveTechnicianZones = (technicianId, cityZoneIds, reason = "") => {
  const payload = typeof cityZoneIds === "object" && !Array.isArray(cityZoneIds) && cityZoneIds !== null
    ? cityZoneIds
    : {
        cityZoneIds: Array.isArray(cityZoneIds) ? cityZoneIds : [cityZoneIds],
        reason,
      };
  return handle(apiClient.post(`/admin/technicians/${technicianId}/city-zones`, payload));
};

export const enableTechnicianZonePermission = approveTechnicianZones;

// Revoke single zone
export const revokeTechnicianZone = (technicianId, cityZoneId) =>
  handle(apiClient.delete(`/admin/technicians/${technicianId}/city-zones/${cityZoneId}`));

export const disableTechnicianZonePermission = revokeTechnicianZone;

// Bulk revoke zones: { cityZoneIds: [...], reason }
export const bulkRevokeTechnicianZones = (technicianId, cityZoneIds, reason = "") => {
  const payload = typeof cityZoneIds === "object" && !Array.isArray(cityZoneIds) && cityZoneIds !== null
    ? cityZoneIds
    : {
        cityZoneIds: Array.isArray(cityZoneIds) ? cityZoneIds : [cityZoneIds],
        reason,
      };
  return handle(apiClient.delete(`/admin/technicians/${technicianId}/city-zones`, { data: payload }));
};