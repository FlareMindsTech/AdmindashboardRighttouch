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

export const getAllCategories = () =>
  handle(apiClient.get("/user/getAllcategory"));
export const getCategoryById = (id) =>
  handle(apiClient.get(`/user/getByIdcategory/${id}`));
export const updateCategory = (id, body) =>
  handle(apiClient.put(`/user/updatecategory/${id}`, body));
export const deleteCategory = (id) =>
  handle(apiClient.delete(`/user/deletecategory/${id}`));
