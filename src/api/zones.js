// src/api/zones.js  — Section 12: City Zones & Service Mappings
import apiClient, { handle } from "./client";

export const listZones = () => handle(apiClient.get("/admin/zones"));
export const getZoneById = (id) => handle(apiClient.get(`/admin/zones/${id}`));
export const createZone = (body) => handle(apiClient.post("/admin/zones", body));
export const updateZone = (id, body) =>
  handle(apiClient.put(`/admin/zones/${id}`, body));
export const deleteZone = (id) =>
  handle(apiClient.delete(`/admin/zones/${id}`));

export const listZoneMappings = () =>
  handle(apiClient.get("/admin/zone-mappings"));
export const createZoneMappings = (body) =>
  handle(apiClient.post("/admin/zone-mappings", body));
export const deleteZoneMapping = (zoneId, serviceId) =>
  handle(
    apiClient.delete(`/admin/zone-mappings/${zoneId}/${serviceId}`)
  );
export const toggleZoneServices = (zoneId, active) =>
  handle(
    apiClient.put(`/admin/zones/${zoneId}/services/toggle`, { active })
  );
