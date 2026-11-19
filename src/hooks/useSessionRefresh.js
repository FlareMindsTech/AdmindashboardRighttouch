// Proactive refresh for long-lived dashboard tabs.
//
// Refresh tokens are valid for 90 days and rotate on every use, so a tab left
// open past the 1h access-token lifetime still works. The HTTP interceptor
// remains the safety net for missed timers (sleep, clock changes).
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectToken,
} from "store/slices/authSlice";
import { getToken, getRefreshToken } from "views/utils/authStorage";
import { handleSessionExpiry } from "views/utils/axiosInstance";
import { refreshSession } from "views/utils/tokenRefresh";

const REFRESH_LEEWAY_MS = 15 * 60 * 1000;
const MAX_SLEEP_MS = 30 * 60 * 1000;
const MIN_RETRY_MS = 5 * 60 * 1000;

const getExpiry = (token) => {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch (e) {
    return null;
  }
};

export const useSessionRefresh = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);

  useEffect(() => {
    if (!isAuthenticated || !token) return undefined;

    let cancelled = false;
    let timer = null;
    let inFlight = false;

    const schedule = (delayOverride) => {
      if (cancelled) return;
      if (timer) clearTimeout(timer);

      const expiry = getExpiry(getToken());
      const untilRefresh = expiry
        ? expiry - Date.now() - REFRESH_LEEWAY_MS
        : MAX_SLEEP_MS;
      const delay =
        delayOverride !== undefined
          ? delayOverride
          : Math.max(1000, Math.min(untilRefresh, MAX_SLEEP_MS));

      timer = setTimeout(run, delay);
    };

    const run = async () => {
      if (cancelled || inFlight) return;
      const current = getToken();
      if (!current) return;

      const expiry = getExpiry(current);
      const due = expiry ? expiry - Date.now() <= REFRESH_LEEWAY_MS : false;
      if (!due) {
        schedule();
        return;
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token available. If token is already expired, terminate session.
        if (expiry && expiry <= Date.now()) {
          handleSessionExpiry("Session expired");
        }
        return;
      }

      inFlight = true;
      try {
        await refreshSession({ staleToken: current });
        if (!cancelled) schedule();
      } catch (err) {
        // Terminal errors clear storage and terminate session; non-terminal ones (offline,
        // 5xx) deserve a quiet retry rather than a tight loop.
        if (!cancelled) {
          if (err?.terminal) {
            handleSessionExpiry(err.message);
            return;
          }
          schedule(MIN_RETRY_MS);
        }
      } finally {
        inFlight = false;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") run();
    };

    schedule();
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated, token]);
};

export default useSessionRefresh;
