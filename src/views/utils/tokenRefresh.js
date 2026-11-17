// Single-flight refresh-token coordinator.
//
// Used by the fetch wrapper, every axios interceptor and the Redux auth slice.
// Only this module talks to /user/auth/refresh so concurrent 401s can never
// trigger a refresh storm or rotate the same token twice in one tab.
import axios from "axios";
import {
  getRefreshToken,
  getToken,
  updateTokens,
} from "./authStorage";

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "https://api.righttouchservice.com"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

const refreshClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export class RefreshError extends Error {
  constructor(message, { terminal = true, status = 0, code = "" } = {}) {
    super(message);
    this.name = "RefreshError";
    this.terminal = terminal;
    this.status = status;
    this.code = code;
  }
}

const AUTH_ENDPOINT_RE =
  /\/auth\/(refresh|logout)|\/login|\/signin|\/signup|\/verify-otp|\/request-otp|\/resend-otp|\/set-password/i;

export const isAuthEndpoint = (url = "") => AUTH_ENDPOINT_RE.test(String(url));

let refreshPromise = null;
let tokenRefreshListener = null;
let broadcastChannel = null;

export const setTokenRefreshListener = (listener) => {
  tokenRefreshListener = typeof listener === "function" ? listener : null;
};

const notifyRefreshed = (token, refreshToken, { broadcast = true } = {}) => {
  try {
    if (tokenRefreshListener) tokenRefreshListener({ token, refreshToken });
  } catch (e) {
    // Listener failures must not break request retries.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("rt:auth-refreshed", { detail: { token } })
    );
  }
  if (!broadcast) return;
  try {
    if (!broadcastChannel && typeof BroadcastChannel !== "undefined") {
      broadcastChannel = new BroadcastChannel("rt-auth");
    }
    broadcastChannel?.postMessage({ type: "tokens-refreshed" });
  } catch (e) {
    // BroadcastChannel is optional.
  }
};

try {
  if (typeof BroadcastChannel !== "undefined") {
    broadcastChannel = new BroadcastChannel("rt-auth");
    broadcastChannel.addEventListener("message", (event) => {
      if (event.data?.type !== "tokens-refreshed") return;
      // localStorage is shared between tabs; read the latest pair.
      const token = getToken();
      if (token) {
        notifyRefreshed(token, getRefreshToken(), { broadcast: false });
      }
    });
  }
} catch (e) {
  broadcastChannel = null;
}

const withLock = async (fn) => {
  if (
    typeof navigator !== "undefined" &&
    navigator.locks &&
    typeof navigator.locks.request === "function"
  ) {
    return navigator.locks.request("rt-auth-refresh", fn);
  }
  return fn();
};

const unwrapResult = (body) => (body && body.result ? body.result : body);

const readRefreshTokens = (result) => ({
  token: result?.token || result?.accessToken || "",
  refreshToken:
    result?.refresh_token || result?.refreshToken || result?.refresh || "",
  expiresIn: result?.expires_in ?? result?.expiresIn ?? null,
});

const doRefresh = async ({ staleToken, staleRefreshToken } = {}) => {
  const currentToken = getToken();
  // Another tab already refreshed while this request waited for the lock.
  if (staleToken && currentToken && currentToken !== staleToken) {
    return currentToken;
  }

  const refreshToken = getRefreshToken();
  // Pre-refresh-token deployments: upgrade a still-valid access token once.
  // The backend accepts a Bearer token on /auth/refresh for this rollout.
  const legacyUpgrade = !refreshToken;
  if (legacyUpgrade) {
    // Logout cleared storage while this request waited for the lock.
    if (staleRefreshToken) {
      throw new RefreshError("Session ended", {
        terminal: false,
        status: 0,
        code: "SESSION_ENDED",
      });
    }
    if (!currentToken) {
      const ended = Boolean(staleToken);
      throw new RefreshError(ended ? "Session ended" : "No refresh token available", {
        terminal: !ended,
        status: ended ? 0 : 401,
        code: ended ? "SESSION_ENDED" : "NO_REFRESH_TOKEN",
      });
    }
  }
  // Logout (or another tab) changed the pair before we acquired the lock.
  if (staleRefreshToken && refreshToken && refreshToken !== staleRefreshToken) {
    if (currentToken) return currentToken;
    throw new RefreshError("Session ended", {
      terminal: false,
      status: 0,
      code: "SESSION_ENDED",
    });
  }

  let response;
  try {
    response = await refreshClient.post(
      "/user/auth/refresh",
      legacyUpgrade
        ? undefined
        : { refresh_token: refreshToken, refreshToken },
      legacyUpgrade
        ? { headers: { Authorization: `Bearer ${currentToken}` } }
        : undefined
    );
  } catch (err) {
    const status = err.response?.status || 0;
    const code = err.response?.data?.code || "";
    const terminal = status === 400 || status === 401 || status === 403;
    throw new RefreshError(
      err.response?.data?.message ||
        err.message ||
        "Unable to refresh session",
      { terminal, status, code }
    );
  }

  const tokens = readRefreshTokens(unwrapResult(response.data));
  if (!tokens.token) {
    throw new RefreshError("Refresh response did not include an access token", {
      terminal: true,
      status: 0,
      code: "INVALID_REFRESH_RESPONSE",
    });
  }

  if (legacyUpgrade) {
    // Never resurrect a session that was logged out or replaced mid-flight.
    const latestToken = getToken();
    if (!latestToken) {
      throw new RefreshError("Session ended", {
        terminal: false,
        status: 0,
        code: "SESSION_ENDED",
      });
    }
    if (latestToken !== currentToken) return latestToken;
  } else {
    // Never resurrect a session that was logged out, or clobber a pair that a
    // different tab rotated while this request was in flight.
    const latestRefreshToken = getRefreshToken();
    if (!latestRefreshToken) {
      throw new RefreshError("Session ended", {
        terminal: false,
        status: 0,
        code: "SESSION_ENDED",
      });
    }
    if (latestRefreshToken !== refreshToken) {
      const latestToken = getToken();
      if (latestToken) return latestToken;
    }
  }

  updateTokens(tokens.token, tokens.refreshToken);
  notifyRefreshed(tokens.token, tokens.refreshToken);
  return tokens.token;
};

/**
 * Refreshes the access token. Resolves with the new token. Concurrent callers
 * in this tab share one in-flight request; other tabs serialize through the
 * Web Locks API. Terminal errors mean "log in again"; non-terminal errors
 * (network/5xx) must leave the session intact.
 */
export const refreshSession = async ({ staleToken } = {}) => {
  if (refreshPromise) return refreshPromise;

  const staleRefreshToken = getRefreshToken();
  refreshPromise = withLock(() =>
    doRefresh({ staleToken, staleRefreshToken })
  ).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

/** Best-effort current-device server logout. Accepts a snapshot so callers
 * can clear local auth first without losing the token to revoke. */
export const revokeCurrentSession = async ({ refreshToken: provided } = {}) => {
  const refreshToken = provided || getRefreshToken();
  if (!refreshToken) return false;
  try {
    await refreshClient.post(
      "/user/auth/logout",
      { refresh_token: refreshToken, refreshToken },
      { timeout: 4000 }
    );
    return true;
  } catch (e) {
    // Local logout remains authoritative when the network is unavailable.
    return false;
  }
};

export const markSessionExpired = (message) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("rt:session-expired", { detail: { message } })
    );
  }
};
