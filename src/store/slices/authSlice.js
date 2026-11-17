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
  getRefreshToken,
} from "views/utils/axiosInstance";
import {
  refreshSession,
  revokeCurrentSession,
} from "views/utils/tokenRefresh";
import {
  PRIVILEGED_ROLES,
  isAdminRole,
  isOwnerRole,
  isPrivilegedRole,
  normalizeRole,
} from "config/accessPolicy";

export { PRIVILEGED_ROLES, isAdminRole, isOwnerRole, isPrivilegedRole };

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "https://api.righttouchservice.com"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

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
      const { token } = res.data.result;
      const refreshToken =
        res.data.result.refresh_token || res.data.result.refreshToken || null;
      const role = normalizeRole(res.data.result.role);
      if (!token || !isPrivilegedRole(role)) {
        return rejectWithValue({
          status: 403,
          code: "ROLE_MISMATCH",
          message: "This dashboard is restricted to Owner and Admin accounts.",
          detail: "",
        });
      }
      const userId = res.data.result.userId || res.data.result.id || res.data.result._id || "";
      const user = { identifier: cleanIdentifier, role, id: userId, userId };
      // A login without a refresh token must not inherit the previous
      // account's rotating token from storage.
      if (!refreshToken) clearAuth();
      // Single canonical write path — legacy helper keeps storage compatible.
      setAuth(token, user, refreshToken);
      return { token, user, role, refreshToken };
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

const fetchProfile = (token) =>
  axios.get(`${API_BASE_URL}/api/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const verifySession = createAsyncThunk(
  "auth/verifySession",
  async (_, { rejectWithValue }) => {
    let token = getToken();
    if (!token) {
      return rejectWithValue({
        status: 401,
        code: "NO_SESSION",
        message: "Please sign in to continue.",
        detail: "",
      });
    }

    try {
      // Expired access token + stored refresh token = silent restore.
      if (isJwtExpired(token)) {
        token = await refreshSession({ staleToken: token });
      }

      let res;
      try {
        res = await fetchProfile(token);
      } catch (err) {
        if (err.response?.status === 401) {
          token = await refreshSession({ staleToken: token });
          res = await fetchProfile(token);
        } else {
          throw err;
        }
      }

      const profile = res.data?.result || res.data?.user || null;
      const role = normalizeRole(profile?.role || profile?.roleName);
      if (!profile || !isPrivilegedRole(role)) {
        clearAuth();
        return rejectWithValue({
          status: 403,
          code: "ROLE_MISMATCH",
          message: "This dashboard is restricted to Owner and Admin accounts.",
          detail: "",
        });
      }

      // Upgrade sessions created before refresh tokens were deployed. The
      // backend accepts a valid Bearer token on /auth/refresh once.
      if (!getRefreshToken()) {
        try {
          token = await refreshSession({ staleToken: token });
        } catch (err) {
          // A transient failure must not invalidate an otherwise good session.
          if (err?.terminal) throw err;
        }
      }

      const storedUser = getUser() || {};
      const userId =
        profile.userId || profile.id || profile._id || storedUser.id || storedUser.userId || "";
      const user = { ...storedUser, ...profile, role, id: userId, userId };
      setAuth(token, user, getRefreshToken());
      return { token, user, role };
    } catch (err) {
      const status = err.response?.status || err.status || 0;
      const isRefreshError = err?.name === "RefreshError";
      const terminal = isRefreshError
        ? Boolean(err.terminal)
        : status === 401 || status === 403;

      if (terminal) clearAuth();

      const data = err.response?.data;
      const code =
        data?.code ||
        err.code ||
        (terminal
          ? "SESSION_EXPIRED"
          : status === 0
          ? "NETWORK_ERROR"
          : "SERVER_ERROR");
      const message =
        data?.message ||
        data?.error ||
        (status === 0
          ? "Cannot verify your session right now. Please check your connection."
          : "Your session could not be verified. Please sign in again.");

      return rejectWithValue({
        status,
        code,
        message,
        detail: err.message || "",
        // Network/5xx failures must not destroy a still-valid local session.
        keepSession: !terminal,
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
      // Expired access token is still restorable when a rotating refresh
      // token exists; verifySession() refreshes before calling /user/me.
      if (!getRefreshToken()) {
        clearAuth();
        return { token: null, user: null, role: "" };
      }
    }
    const role = normalizeRole(user?.role || user?.roleName);
    if (!isPrivilegedRole(role)) {
      clearAuth();
      return { token: null, user: null, role: "" };
    }
    return { token, user: { ...user, role }, role };
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
  // False until the stored session role has been confirmed by /user/me.
  sessionVerified: false,
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
      state.sessionVerified = !state.isAuthenticated;
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
      state.sessionVerified = true;
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
      state.sessionVerified = true;
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === "failed") state.status = "idle";
    },
    // The HTTP layer rotated the pair in storage; mirror only the token.
    tokensRefreshed(state, action) {
      const token = action.payload?.token;
      if (!token) return;
      state.token = token;
      state.isAuthenticated = true;
      state.sessionVerified = true;
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
        state.sessionVerified = true;
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || { message: "Server error" };
      })
      .addCase(verifySession.pending, (state) => {
        state.status = "verifying";
        state.error = null;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = Boolean(action.payload.token);
        state.status = "succeeded";
        state.error = null;
        state.initialized = true;
        state.sessionVerified = true;
      })
      .addCase(verifySession.rejected, (state, action) => {
        if (!action.payload?.keepSession) {
          state.token = null;
          state.user = null;
          state.role = "";
          state.isAuthenticated = false;
        }
        state.status = "failed";
        state.error = action.payload || { message: "Session verification failed" };
        state.initialized = true;
        state.sessionVerified = true;
      });
  },
});

export const {
  initializeAuth,
  logout,
  sessionExpired,
  clearAuthError,
  tokensRefreshed,
} = authSlice.actions;

/**
 * User-initiated logout: revoke this device's refresh family first, then
 * clear local state even if the network call fails.
 */
export const logoutSession = () => async (dispatch) => {
  // Snapshot the token, then clear local state immediately so the UI cannot
  // bounce back into the dashboard while revocation is in flight.
  const refreshToken = getRefreshToken();
  dispatch(logout());
  await revokeCurrentSession({ refreshToken });
};

// Selectors — use these instead of repeating storage reads.
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;
export const selectSessionVerified = (state) => state.auth.sessionVerified;
export const selectIsOwner = (state) =>
  state.auth.isAuthenticated && isOwnerRole(state.auth.role);
export const selectIsAdmin = (state) =>
  state.auth.isAuthenticated && isAdminRole(state.auth.role);
export const selectIsPrivileged = (state) =>
  state.auth.isAuthenticated && isPrivilegedRole(state.auth.role);

export default authSlice.reducer;
