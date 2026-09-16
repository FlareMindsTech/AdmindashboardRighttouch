// src/api/quotations.js  — Admin Quotation Management APIs
import apiClient, { handle } from "./client";

export const createQuotation = (body) =>
  handle(apiClient.post("/admin/quotations", body));

export const listQuotations = (params) =>
  handle(apiClient.get("/admin/quotations", { params }));

export const getQuotationById = (id) =>
  handle(apiClient.get(`/admin/quotations/${id}`));

export const updateQuotation = (id, body) =>
  handle(apiClient.patch(`/admin/quotations/${id}`, body));

export const sendQuotation = (id, body = {}) =>
  handle(apiClient.post(`/admin/quotations/${id}/send`, body));

export const resendQuotation = (id, body = {}) =>
  handle(apiClient.post(`/admin/quotations/${id}/resend`, body));

export const reviseQuotation = (id, body = {}) =>
  handle(apiClient.post(`/admin/quotations/${id}/revise`, body));

// Product Quote Requests (Admin)
export const listQuoteRequests = (params) =>
  handle(apiClient.get("/admin/product-quote-requests", { params }));

export const getQuoteRequestById = (id) =>
  handle(apiClient.get(`/admin/product-quote-requests/${id}`));

export const assignQuoteRequest = (id, body) =>
  handle(apiClient.post(`/admin/product-quote-requests/${id}/assign`, body));

export const updateQuoteRequestStatus = (id, body) =>
  handle(apiClient.patch(`/admin/product-quote-requests/${id}/status`, body));

