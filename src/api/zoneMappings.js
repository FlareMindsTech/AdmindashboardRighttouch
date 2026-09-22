// src/api/zoneMappings.js — Zone Service Mappings (Admin)
import apiClient, { handle } from "./client";

// List zone-service mappings: { zoneId }
export const listZoneMappings = (params = {}) =>
  handle(apiClient.get("/admin/zone-mappings", { params }));

// Enable services in zone: { zoneId, serviceIds: [...] }
export const createZoneMapping = (body) =>
  handle(apiClient.post("/admin/zone-mappings", body));

export const updateZoneMapping = createZoneMapping;
export const enableServicesInZone = createZoneMapping;

// Delete zone-service mapping
export const deleteZoneMapping = (zoneId, serviceId) =>
  handle(apiClient.delete(`/admin/zone-mappings/${zoneId}/${serviceId}`));