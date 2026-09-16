// src/api/operationalCities.js  — Section 11: Operational Cities
import apiClient, { handle } from "./client";

export const listOperationalCities = () =>
  handle(apiClient.get("/admin/operational-cities"));
export const getActiveCity = () =>
  handle(apiClient.get("/admin/operational-cities/active"));
export const getActivePolygons = () =>
  handle(apiClient.get("/admin/operational-cities/polygons"));
export const createOperationalCity = (body) =>
  handle(apiClient.post("/admin/operational-cities", body));
export const updateOperationalCity = (id, body) =>
  handle(apiClient.put(`/admin/operational-cities/${id}`, body));
export const activateCity = (id) =>
  handle(apiClient.post(`/admin/operational-cities/${id}/activate`));
export const deleteOperationalCity = (id) =>
  handle(apiClient.delete(`/admin/operational-cities/${id}`));
