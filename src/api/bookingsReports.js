// src/api/bookingsReports.js  — Section 6: Bookings, Reports, Ratings
import apiClient, { handle } from "./client";

export const getAllBookings = () =>
  handle(apiClient.get("/user/booking/getAllBookings"));
export const getBookingById = (id) =>
  handle(apiClient.get(`/user/booking/getBookingById/${id}`));
export const getCancellationReasons = () =>
  handle(apiClient.get("/user/booking/reasons"));
export const getAllRoleBookings = () =>
  handle(apiClient.get("/user/service/booking"));

export const getAllReports = () => handle(apiClient.get("/user/getAllReports"));
export const getReportById = (id) =>
  handle(apiClient.get(`/user/getReportById/${id}`));
export const resolveReport = (id) =>
  handle(apiClient.put(`/user/report/resolve/${id}`));

export const getAllRatings = () =>
  handle(apiClient.get("/user/getAllRatings"));
export const getRatingById = (id) =>
  handle(apiClient.get(`/user/getRatingById/${id}`));
export const updateRating = (id, body) =>
  handle(apiClient.put(`/user/updateRating/${id}`, body));
export const deleteRating = (id) =>
  handle(apiClient.delete(`/user/deleteRating/${id}`));
