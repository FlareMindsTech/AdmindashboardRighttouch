// Central auth persistence used by the API clients, the Redux auth slice and
// the refresh coordinator. Keeping every storage key in one module prevents
// partial logouts (e.g. access token cleared but refresh token left behind).

const TOKEN_KEYS = ["token", "adminToken"];
const REFRESH_KEYS = ["refreshToken", "adminRefreshToken"];
const USER_KEYS = ["user", "currentUser"];

const writeBoth = (keys, value) => {
  if (value === undefined) return;
  keys.forEach((key) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    } catch (e) {
      // Private-mode/quota failures must never break auth.
    }
  });
};

const removeBoth = (keys) => {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  });
};

const readFirst = (keys) => {
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (value) return value;
    } catch (e) {
      // ignore
    }
  }
  return null;
};

export const setAuth = (token, user, refreshToken) => {
  if (token) writeBoth(TOKEN_KEYS, token);
  if (user) {
    const userStr = typeof user === "string" ? user : JSON.stringify(user);
    writeBoth(USER_KEYS, userStr);
  }
  // Only touch refresh tokens when a caller explicitly supplies one, so
  // token-only refreshes never wipe an existing rotating refresh token.
  if (refreshToken) writeBoth(REFRESH_KEYS, refreshToken);
};

export const updateTokens = (token, refreshToken) => {
  if (token) writeBoth(TOKEN_KEYS, token);
  if (refreshToken) writeBoth(REFRESH_KEYS, refreshToken);
};

export const clearAuth = () => {
  removeBoth(TOKEN_KEYS);
  removeBoth(REFRESH_KEYS);
  removeBoth(USER_KEYS);
};

export const getToken = () => readFirst(TOKEN_KEYS);

export const getRefreshToken = () => readFirst(REFRESH_KEYS);

export const getUser = () => {
  const userStr = readFirst(USER_KEYS);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};
