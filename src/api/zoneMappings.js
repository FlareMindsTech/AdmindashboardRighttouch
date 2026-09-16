// src/api/zoneMappings.js  — Zone Service Mappings
import apiClient, { handle } from "./client";

export const listZoneMappings = () =>
  handle(apiClient.get("/admin/zone-mappings"));

export const updateZoneMapping = (body) =>
  handle(apiClient.post("/admin/zone-mappings", body));

export const createZoneMapping = (body) =>
  handle(apiClient.post("/admin/zone-mappings", body));

export const deleteZoneMapping = (zoneId, serviceId) =>
  handle(apiClient.delete(`/admin/zone-mappings/${zoneId}/${serviceId}`));