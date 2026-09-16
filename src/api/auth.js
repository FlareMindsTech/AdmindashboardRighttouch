// src/api/auth.js  — Section 1: Owner Auth
import apiClient, { handle } from "./client";

export const ownerSignup = (body) => handle(apiClient.post("/user/owner/signup", body));
export const ownerVerifyOtp = (body) =>
  handle(apiClient.post("/user/owner/verify-otp", body));
export const ownerSetPassword = (body) =>
  handle(apiClient.post("/user/owner/set-password", body));
export const ownerLogin = (body) => handle(apiClient.post("/user/owner/login", body));
export const ownerLoginAlias = (body) =>
  handle(apiClient.post("/user/login/owner", body));
export const loginAny = (body) => handle(apiClient.post("/user/login", body));
