// src/store/slices/authSlice.js — Phase 2: canonical Redux authentication state.
//
// Mirrors the existing legacy contract in views/utils/axiosInstance.js:
// - Sign-in POSTs `${API_BASE_URL}/api/user/login/owner` with
//   { identifier, password, role: "Owner" } (see views/Pages/SignIn.js).
// - Success payload is `res.data.result` containing { token, role, id }.
// - Persistence reuses the legacy setAuth/clearAuth/getToken/getUser helpers
//   so all 8 storage slots (token/adminToken/user/currentUser x
//   localStorage/sessionStorage) keep their exact current behavior.
// - The stored user may be minimal ({ identifier, role, id }); profile data
//   stays separate and is NOT merged here.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  setAuth,
  clearAuth,
  getToken,
  getUser,
} from "views/utils/axiosInstance";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://righttouchservernew-727889857503.asia-south1.run.app";

// Preserve the exact legacy login request (URL, payload, response reading).
export const loginOwner = createAsyncThunk(
  "auth/loginOwner",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const cleanIdentifier = (identifier || "").toString().trim();
      const res = await axios.post(
        `${API_BASE_URL}/api/user/login/owner`,
        { identifier: cleanIdentifier, password, role: "Owner" },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.data?.result) {
        throw new Error("Invalid server response structure");
      }
      const { token, role } = res.data.result;
      const userId = res.data.result.userId || res.data.result.id || res.data.result._id || "";
      const user = { identifier: cleanIdentifier, role: role || "Owner", id: userId, userId };
      // Single canonical write path — legacy helper keeps storage compatible.
      setAuth(token, user);
      return { token, user, role: role || "Owner" };
    } catch (err) {
      const status = err.response?.status || 0;
      const data = err.response?.data;
      const code =
        data?.code ||
        (err.code === "ERR_NETWORK"
          ? "NETWORK_ERROR"
          : status === 429
          ? "TOO_MANY_ATTEMPTS"
          : status === 401
          ? "INVALID_CREDENTIALS"
          : status === 403
          ? "FORBIDDEN"
          : status === 404
          ? "USER_NOT_FOUND"
          : "SERVER_ERROR");

      const serverMessage =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : null);

      let friendlyMessage = serverMessage;
      if (!err.response) {
        friendlyMessage =
          "Cannot connect to the server. Please check your internet connection or server status.";
      } else if (status === 429) {
        friendlyMessage =
          serverMessage || "Too many login attempts. Please wait 15 minutes before trying again.";
      } else if (!friendlyMessage) {
        friendlyMessage = err.message || "An unexpected error occurred during login.";
      }

      return rejectWithValue({
        status,
        code,
        message: friendlyMessage,
        detail: data?.details ? JSON.stringify(data.details) : serverMessage || err.message || "",
      });
    }
  }
);

const isJwtExpired = (token) => {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch (e) {
    return false;
  }
};

const readStoredSession = () => {
  try {
    const token = getToken();
    const user = getUser();
    if (!token || !user) return { token: null, user: null, role: "" };
    if (isJwtExpired(token)) {
      clearAuth();
      return { token: null, user: null, role: "" };
    }
    const rawRole = user?.role || user?.roleName || (token ? "Owner" : "");
    const role = (rawRole || "").toString().toLowerCase();
    return { token, user, role };
  } catch (e) {
    return { token: null, user: null, role: "" };
  }
};

const initialState = {
  token: null,
  user: null,
  role: "",
  isAuthenticated: false,
  // idle | loading | succeeded | failed | initialized (restored) | loggedOut
  status: "idle",
  error: null,
  // False until initializeAuth() has read legacy storage once, so route
  // guards never decide on an empty state (no protected-content flash).
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // One-time restore of the pre-Redux session before guards decide.
    initializeAuth(state) {
      const { token, user, role } = readStoredSession();
      state.token = token;
      state.user = user;
      state.role = role;
      state.isAuthenticated = Boolean(token && user);
      state.status = state.isAuthenticated ? "initialized" : "idle";
      state.error = null;
      state.initialized = true;
    },
    // Local logout (confirmation dialogs, manual sign-out): clear storage
    // with the legacy helper so cleanup semantics are unchanged.
    logout(state) {
      clearAuth();
      state.token = null;
      state.user = null;
      state.role = "";
      state.isAuthenticated = false;
      state.status = "loggedOut";
      state.error = null;
      state.initialized = true;
    },
    // Silent reset for the 401/session-expiry path. Storage was already
    // cleared by handleSessionExpiry; never touch unrelated keys here.
    sessionExpired(state) {
      state.token = null;
      state.user = null;
      state.role = "";
      state.isAuthenticated = false;
      state.status = "loggedOut";
      state.error = null;
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === "failed") state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginOwner.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginOwner.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = (action.payload.role || "").toLowerCase();
        state.isAuthenticated = Boolean(action.payload.token);
        state.status = "succeeded";
        state.error = null;
        state.initialized = true;
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || { message: "Server error" };
      });
  },
});

export const { initializeAuth, logout, sessionExpired, clearAuthError } =
  authSlice.actions;

// Selectors — use these instead of repeating storage reads.
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;
export const selectIsOwner = (state) =>
  state.auth.isAuthenticated && state.auth.role === "owner";

export default authSlice.reducer;
