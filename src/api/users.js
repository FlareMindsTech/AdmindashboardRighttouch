// src/api/users.js  — Section 2: Users (Owner)
import apiClient, { handle } from "./client";

export const checkUserByIdentifier = (identifier) =>
  handle(apiClient.get(`/user/debug/check-user/${identifier}`));
export const getMyProfile = () => handle(apiClient.get("/user/me"));
export const updateMyProfile = (body) => handle(apiClient.put("/user/me", body));
export const getUserByRoleAndId = (role, id) =>
  handle(apiClient.get(`/user/users/${role}/${id}`));
export const getAllUsersByRole = (role) =>
  handle(apiClient.get(`/user/users/${role}`));
export const deleteUser = (id) => handle(apiClient.delete(`/user/users/${id}`));
export const completeProfile = (body) =>
  handle(apiClient.post("/user/complete-profile", body));
