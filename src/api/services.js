// src/api/services.js  — Section 4: Services
import apiClient, { handle } from "./client";

export const createService = (body) =>
  handle(apiClient.post("/user/service", body));

export const uploadServiceImages = (files, serviceId) => {
  const form = new FormData();
  if (serviceId) form.append("serviceId", serviceId);
  (Array.isArray(files) ? files : [files]).forEach((f) =>
    form.append("serviceImages", f)
  );
  return handle(
    apiClient.post("/user/services/upload-images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const removeServiceImage = (serviceId, imageUrl) =>
  handle(
    apiClient.delete("/user/services/remove-image", {
      data: { serviceId, imageUrl },
    })
  );

export const replaceServiceImages = (files, serviceId) => {
  const form = new FormData();
  if (serviceId) form.append("serviceId", serviceId);
  (Array.isArray(files) ? files : [files]).forEach((f) =>
    form.append("serviceImages", f)
  );
  return handle(
    apiClient.put("/user/services/replace-images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const getAllServices = () =>
  handle(apiClient.get("/user/getAllServices"));
export const getServiceById = (id) =>
  handle(apiClient.get(`/user/getServiceById/${id}`));
export const updateService = (id, body) =>
  handle(apiClient.put(`/user/updateService/${id}`, body));
export const toggleServiceZoneRestriction = (id, zoneRestricted) =>
  handle(
    apiClient.put(`/user/service/${id}/zone-restriction`, { zoneRestricted })
  );
export const deleteService = (id) =>
  handle(apiClient.delete(`/user/services/${id}`));
export const getServicePolygon = (id) =>
  handle(apiClient.get(`/user/service/${id}/polygon`));
export const setServicePolygon = (id, polygon) =>
  handle(apiClient.put(`/user/service/${id}/polygon`, { polygon }));
export const removeServicePolygon = (id) =>
  handle(apiClient.delete(`/user/service/${id}/polygon`));
