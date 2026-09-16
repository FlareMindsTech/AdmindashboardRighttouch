// src/api/products.js  — Section 5: Products
import apiClient, { handle } from "./client";

export const createProduct = (body) =>
  handle(apiClient.post("/user/product", body));

export const uploadProductImages = (files, productId) => {
  const form = new FormData();
  if (productId) form.append("productId", productId);
  (Array.isArray(files) ? files : [files]).forEach((f) =>
    form.append("productImages", f)
  );
  return handle(
    apiClient.post("/user/product/upload-images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const removeProductImage = (productId, imageUrl) =>
  handle(
    apiClient.delete("/user/product/remove-image", {
      data: { productId, imageUrl },
    })
  );

export const replaceProductImages = (files, productId) => {
  const form = new FormData();
  if (productId) form.append("productId", productId);
  (Array.isArray(files) ? files : [files]).forEach((f) =>
    form.append("productImages", f)
  );
  return handle(
    apiClient.put("/user/product/replace-images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const getAllProducts = () => handle(apiClient.get("/user/getProduct"));
export const getProductById = (id) =>
  handle(apiClient.get(`/user/getOneProduct/${id}`));
export const updateProduct = (id, body) =>
  handle(apiClient.put(`/user/updateProduct/${id}`, body));
export const deleteProduct = (id) =>
  handle(apiClient.delete(`/user/deleteProduct/${id}`));
export const getAllProductBookings = () =>
  handle(apiClient.get("/user/getAllProductBooking"));
export const updateProductBooking = (id, body) =>
  handle(apiClient.put(`/user/productBookingUpdate/${id}`, body));
export const cancelProductBooking = (id, body) =>
  handle(apiClient.put(`/user/productBookingCancel/${id}`, body));
