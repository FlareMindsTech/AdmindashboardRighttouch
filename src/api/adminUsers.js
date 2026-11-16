import apiClient, { handle } from "./client";

export const listPrivilegedUsers = () => handle(apiClient.get("/admin/users"));

export const createPrivilegedUser = (body) =>
  handle(apiClient.post("/admin/users", body));

export const changePrivilegedUserRole = (id, body) =>
  handle(apiClient.patch(`/admin/users/${id}/role`, body));
