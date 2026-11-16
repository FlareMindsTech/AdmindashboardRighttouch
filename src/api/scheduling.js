// src/api/scheduling.js — Scheduling & Dispatch Operations API
// Direct implementation of Postman collection "RightTouch - Scheduling (Admin)"
// Covers:
// - Dispatch Queue & Health Ops
// - Booking Inspection & Broadcast Delivery Audit
// - Technician Service Base Locations (Scheduling Origin)
// - Customer No-Show Compensation Lifecycle
// - Zone Supply & Health Dashboard

import apiClient, { handle } from "./client";

/* ================= 1. DISPATCH QUEUE & HEALTH OPS ================= */

export const getDispatchStats = (params = {}) =>
  handle(apiClient.get("/admin/dispatch/stats", { params }));

export const getDispatchHealth = () =>
  handle(apiClient.get("/admin/dispatch/health"));

export const getDispatchFailed = (params = { page: 1, limit: 25 }) =>
  handle(apiClient.get("/admin/dispatch/failed", { params }));

export const getDispatchPending = (params = { status: "pending" }) =>
  handle(apiClient.get("/admin/dispatch/pending", { params }));

export const retryDispatch = (dispatchId, body = {}) =>
  handle(apiClient.post(`/admin/dispatch/${dispatchId}/retry`, body));

export const retryFailedDispatches = (body = {}) =>
  handle(apiClient.post("/admin/dispatch/retry-failed", body));

export const restartDispatchWorker = (body = {}) =>
  handle(apiClient.post("/admin/dispatch/worker/restart", body));

export const stopDispatchWorker = (body = {}) =>
  handle(apiClient.post("/admin/dispatch/worker/stop", body));

/* ================= 2. BOOKING INSPECTION & BROADCAST AUDIT ================= */

export const getAllSchedulingBookings = (params = { limit: 50 }) =>
  handle(apiClient.get("/user/booking/getAllBookings", { params }));

export const getSchedulingBookingById = (bookingId) =>
  handle(apiClient.get(`/user/booking/getBookingById/${bookingId}`));

export const getBroadcastAudit = (bookingId) =>
  handle(apiClient.get(`/admin/zone-geofence/jobs/${bookingId}/broadcast-audit`));

/* ================= 3. TECHNICIAN SERVICE BASE LOCATIONS ================= */

export const getMissingBaseLocations = (params = { page: 1, limit: 50 }) =>
  handle(apiClient.get("/technician/admin/service-base-location/missing", { params }));

export const getTechnicianBaseLocation = (technicianId) =>
  handle(apiClient.get(`/technician/admin/technicians/${technicianId}/service-base-location`));

export const setTechnicianBaseLocation = (technicianId, body) =>
  handle(apiClient.put(`/technician/admin/technicians/${technicianId}/service-base-location`, body));

/* ================= 4. ZONE SUPPLY & HEALTH DASHBOARD ================= */

export const getZoneHealthDashboard = () =>
  handle(apiClient.get("/admin/zone-geofence/zone-health-dashboard"));

/* ================= 5. CUSTOMER NO-SHOW COMPENSATION ================= */

/**
 * Update Customer No-Show Compensation
 * @param {string} bookingId
 * @param {Object} body
 * @param {'approve'|'reject'|'mark_paid'} body.action
 * @param {string} [body.note]
 * @param {string} [body.providerReference] Required when action === 'mark_paid' (e.g. UTR-123456)
 */
export const updateNoShowCompensation = (bookingId, body) =>
  handle(apiClient.put(`/user/booking/${bookingId}/customer-no-show/compensation`, body));
