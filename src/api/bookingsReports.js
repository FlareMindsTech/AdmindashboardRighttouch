// src/api/bookingsReports.js  — Section 6: Bookings, Reports, Ratings
import apiClient, { handle } from "./client";

export const getAllBookings = (params) =>
  handle(apiClient.get("/user/booking/getAllBookings", { params }));
export const getBookingById = (id) =>
  handle(apiClient.get(`/user/booking/getBookingById/${id}`));
export const getCancellationReasons = () =>
  handle(apiClient.get("/user/booking/reasons"));
export const getAllRoleBookings = () =>
  handle(apiClient.get("/user/service/booking"));

export const getAllReports = (params) =>
  handle(apiClient.get("/user/getAllReports", { params }));
export const getReportById = (id) =>
  handle(apiClient.get(`/user/getReportById/${id}`));
export const resolveReport = (id, body = {}) =>
  handle(apiClient.put(`/user/report/resolve/${id}`, body));

export const getAllRatings = () =>
  handle(apiClient.get("/user/getAllRatings"));
export const getRatingById = (id) =>
  handle(apiClient.get(`/user/getRatingById/${id}`));
export const updateRating = (id, body) =>
  handle(apiClient.put(`/user/updateRating/${id}`, body));
export const deleteRating = (id) =>
  handle(apiClient.delete(`/user/deleteRating/${id}`));

// Admin bookings / ratings ops (Postman folder 17, Routes/User.js)
export const deleteBookingAsAdmin = (id) =>
  handle(apiClient.delete(`/user/booking/admin/${id}`));

export const listAdminRatings = (params) =>
  handle(apiClient.get("/user/admin/ratings", { params }));

export const getAllRatingsAdmin = (params) =>
  handle(apiClient.get("/user/getAllRatings", { params }));

export const rebuildRatingAggregate = (targetType, targetId, body = {}) =>
  handle(
    apiClient.post(
      `/user/admin/ratings/rebuild/${targetType}/${targetId}`,
      body
    )
  );

export const completeProductBookingAsAdmin = (id, body = {}) =>
  handle(apiClient.put(`/user/admin/productBooking/${id}/complete`, body));
