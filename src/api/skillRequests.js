// src/api/skillRequests.js — Technician Skill Requests (Admin)
// Matches Postman folder "8. Skill Requests" (Routes/adminSkillRequestRoutes.js).
// NEW module — no prior coverage in src/api.
import apiClient, { handle } from "./client";

export const listSkillRequests = (params) =>
  handle(apiClient.get("/admin/technician-skill-requests", { params }));

export const reviewSkillRequest = (requestId, body) =>
  handle(
    apiClient.put(
      `/admin/technician-skill-requests/${requestId}/review`,
      body
    )
  );
