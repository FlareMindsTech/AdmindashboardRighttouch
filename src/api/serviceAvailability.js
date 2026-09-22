// src/api/serviceAvailability.js — Service-Zone Matrix & Availability Management (Admin)
import apiClient, { handle } from "./client";

// Get service-zone matrix: { districtId }
export const getServiceZoneMatrix = (params = {}) =>
  handle(apiClient.get("/admin/service-availability/matrix", { params }));

// Get detail of service zone availability
export const getServiceZoneDetail = (serviceId) =>
  handle(apiClient.get(`/admin/service-availability/service/${serviceId}/detail`));

// Toggle single zone availability: { serviceId, districtId, cityZoneId, status: 'ENABLED' | 'DISABLED' }
export const toggleSingleZone = (body) =>
  handle(apiClient.post("/admin/service-availability/toggle-zone", body));

// Bulk toggle zones: { serviceId, districtId, cityZoneIds: [...], status: 'ENABLED' | 'DISABLED' }
export const bulkToggleZones = (body) =>
  handle(apiClient.post("/admin/service-availability/bulk-toggle-zones", body));

// Clear district zones overrides: { serviceId, districtId }
export const clearDistrictZones = (body) =>
  handle(apiClient.post("/admin/service-availability/clear-district-zones", body));

// Toggle global service status: { serviceId, isActive: true | false }
export const toggleGlobalServiceStatus = (body) =>
  handle(apiClient.post("/admin/service-availability/toggle-service-status", body));

// Toggle service zone restriction flag: { zoneRestricted: true | false }
export const toggleServiceZoneRestriction = (serviceId, zoneRestricted) =>
  handle(apiClient.put(`/user/service/${serviceId}/zone-restriction`, { zoneRestricted }));

// Create availability config: { serviceId, districtId, scope, status }
export const createAvailabilityConfig = (body) =>
  handle(apiClient.post("/admin/service-availability", body));

// List availability configs: { districtId }
export const listAvailabilityConfigs = (params = {}) =>
  handle(apiClient.get("/admin/service-availability", { params }));

// Update availability config: { status: 'ENABLED' | 'DISABLED' }
export const updateAvailabilityConfig = (availabilityId, body) =>
  handle(apiClient.put(`/admin/service-availability/${availabilityId}`, body));

// Delete availability config
export const deleteAvailabilityConfig = (availabilityId) =>
  handle(apiClient.delete(`/admin/service-availability/${availabilityId}`));

// Dispatch diagnostics: { technicianId, bookingId }
export const getDispatchDiagnostics = (params = {}) =>
  handle(apiClient.get("/admin/dispatch-debug", { params }));
