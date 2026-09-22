// src/api/zoneGeofence.js — Geofence & Spatial Diagnostics (Admin)
import apiClient, { handle } from "./client";

// Create city-zone via geofence controller: { operationalCityId, name, zoneCode, polygon }
export const createGeofenceCityZone = (body) =>
  handle(apiClient.post("/admin/zone-geofence/city-zones", body));

// List city-zones for district: { districtId }
export const listGeofenceCityZones = (params = {}) =>
  handle(apiClient.get("/admin/zone-geofence/city-zones", { params }));

// Create district via geofence controller: { name, state, polygon, isRegistrationEnabled, isJobEnabled }
export const createGeofenceDistrict = (body) =>
  handle(apiClient.post("/admin/zone-geofence/districts", body));

// List districts via geofence controller
export const listGeofenceDistricts = () =>
  handle(apiClient.get("/admin/zone-geofence/districts"));

// Grant district coverage to technician: { technicianId, districtId, reason }
export const grantDistrictToTechnician = (body) =>
  handle(apiClient.post("/admin/zone-geofence/technicians/grant-district", body));

// Revoke district coverage from technician: { technicianId, districtId, reason }
export const revokeDistrictFromTechnician = (body) =>
  handle(apiClient.post("/admin/zone-geofence/technicians/revoke-district", body));

// Spatial hierarchy tree (Districts -> City Zones -> Technicians)
export const getSpatialHierarchy = () =>
  handle(apiClient.get("/admin/zone-geofence/spatial-hierarchy"));

// Impact analysis: { type: 'district' | 'cityZone', id }
export const getImpactAnalysis = (params = {}) =>
  handle(apiClient.get("/admin/zone-geofence/impact-analysis", { params }));

// District dashboard metrics
export const getDistrictDashboard = (districtId) =>
  handle(apiClient.get(`/admin/zone-geofence/districts/${districtId}/dashboard`));

// Inspect active job location & surrounding technicians
export const inspectJobLocation = (bookingId) =>
  handle(apiClient.get(`/admin/zone-geofence/jobs/${bookingId}/location-inspect`));

// Audit job broadcast candidates and dispatch breakdown
export const auditJobBroadcast = (bookingId) =>
  handle(apiClient.get(`/admin/zone-geofence/jobs/${bookingId}/broadcast-audit`));

// Zone health overview & geo-engine status
export const getZoneHealthDashboard = () =>
  handle(apiClient.get("/admin/zone-geofence/zone-health-dashboard"));

// List technicians with geofence metrics: { districtId }
export const listGeofenceTechnicians = (params = {}) =>
  handle(apiClient.get("/admin/zone-geofence/technicians", { params }));

// Get technician detailed geofence permissions & live GPS state
export const getGeofenceTechnicianDetails = (technicianId) =>
  handle(apiClient.get(`/admin/zone-geofence/technicians/${technicianId}/details`));

// Perform technician verification action: { action: 'APPROVE' | 'REJECT', reason }
export const verifyTechnician = (technicianId, body) =>
  handle(apiClient.post(`/admin/zone-geofence/technicians/${technicianId}/verification`, body));

// Rollback polygon version: { entityType: 'CITY_ZONE' | 'DISTRICT', entityId, targetVersion }
export const rollbackPolygon = (body) =>
  handle(apiClient.post("/admin/zone-geofence/polygons/rollback", body));
