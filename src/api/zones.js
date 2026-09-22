// src/api/zones.js — Section: City Zones & Service Mappings (Admin)
import apiClient, { handle } from "./client";

// List zones with optional filters: { operationalCityId, active }
export const listZones = (params = {}) =>
  handle(apiClient.get("/admin/zones", { params }));

// Get specific zone by ID
export const getZoneById = (id) =>
  handle(apiClient.get(`/admin/zones/${id}`));

// Create zone (seeds every active service as DISABLED)
export const createZone = (body) =>
  handle(apiClient.post("/admin/zones", body));

// Update zone / deactivate
export const updateZone = (id, body) =>
  handle(apiClient.put(`/admin/zones/${id}`, body));

// Delete zone (cascades)
export const deleteZone = (id) =>
  handle(apiClient.delete(`/admin/zones/${id}`));

// Get technician candidates located inside the zone but not yet approved
export const getZoneTechnicianCandidates = (zoneId) =>
  handle(apiClient.get(`/admin/zones/${zoneId}/technician-candidates`));

// List zone-service mappings for a zone: { zoneId }
export const listZoneMappings = (params = {}) =>
  handle(apiClient.get("/admin/zone-mappings", { params }));

// Enable services in a zone: { zoneId, serviceIds: [...] }
export const createZoneMappings = (body) =>
  handle(apiClient.post("/admin/zone-mappings", body));

// Delete single zone-service mapping
export const deleteZoneMapping = (zoneId, serviceId) =>
  handle(apiClient.delete(`/admin/zone-mappings/${zoneId}/${serviceId}`));

// Bulk toggle all services in a zone: { active: true | false }
export const toggleZoneServices = (zoneId, active) =>
  handle(apiClient.put(`/admin/zones/${zoneId}/services/toggle`, { active }));
