// src/api/addresses.js  — Section 16: Addresses (Admin)
import apiClient, { handle } from "./client";

export const getAllAddressesAdmin = () =>
  handle(apiClient.get("/addresses/admin/all"));
export const getAddressByIdAdmin = (id) =>
  handle(apiClient.get(`/addresses/admin/${id}`));
