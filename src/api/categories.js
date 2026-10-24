// src/api/categories.js  — Section 3: Categories
import apiClient, { handle } from "./client";

export const createCategory = (body) =>
  handle(apiClient.post("/user/category", body));

export const uploadCategoryImage = (file, categoryId) => {
  const form = new FormData();
  if (categoryId) form.append("categoryId", categoryId);
  form.append("image", file);
  return handle(
    apiClient.post("/user/category/upload-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const removeCategoryImage = (categoryId) =>
  handle(
    apiClient.delete("/user/category/remove-image", {
      data: { categoryId },
    })
  );

export const getAllCategories = (categoryType) => {
  // Additive optional filter: legacy callers request
  // GET /user/getAllcategory?categoryType=<service|product>. Omitting the
  // argument preserves this module's original contract (no query string).
  const url = categoryType
    ? `/user/getAllcategory?categoryType=${encodeURIComponent(categoryType)}`
    : "/user/getAllcategory";
  return handle(apiClient.get(url));
};
export const getCategoryById = (id) =>
  handle(apiClient.get(`/user/getByIdcategory/${id}`));
export const updateCategory = (id, body) =>
  handle(apiClient.put(`/user/updatecategory/${id}`, body));
export const deleteCategory = (id) =>
  handle(apiClient.delete(`/user/deletecategory/${id}`));
