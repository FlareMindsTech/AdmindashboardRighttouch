// src/hooks/useNotificationCoordinator.js — Phase 3: single notification
// refresh owner for the whole owner session.
//
// Consolidates what used to be three independent mechanisms:
// - Sidebar hook: 10s counts poll + focus + storage event + custom window event
// - Navbar: 30s unread-count poll
// - Navbar: on-demand inbox fetch on popover open (stays on-demand in the
//   navbar component — NOT moved here)
//
// The single 10s timer preserves both existing cadences exactly: module
// counts refresh every tick (as before), the inbox unread count every 3rd
// tick (every ~30s, as before). No overlapping timers, one cleanup point.
// Cross-tab sync (storage event) and the in-tab custom event are preserved
// with identical semantics. Mount once in layouts/Admin.js (unmounts on
// logout because the owner layout unmounts).
import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchModuleCounts,
  fetchInboxUnreadCount,
  syncCountsFromStorage,
  COUNTS_STORAGE_KEY,
} from "store/slices/notificationsSlice";
import { selectIsAuthenticated } from "store/slices/authSlice";

const COUNTS_TICK_MS = 10 * 1000;
const INBOX_COUNT_EVERY_N_TICKS = 3;

export const useNotificationCoordinator = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const tickRef = useRef(0);

  const refreshCounts = useCallback(() => {
    if (!isAuthenticated) return;
    dispatch(fetchModuleCounts());
  }, [dispatch, isAuthenticated]);

  const refreshInboxCount = useCallback(() => {
    if (!isAuthenticated) return;
    dispatch(fetchInboxUnreadCount());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    // Immediate refresh on session start (both hooks fetched on mount).
    tickRef.current = 0;
    refreshCounts();
    refreshInboxCount();

    const interval = setInterval(() => {
      // Pause polling if the tab/browser is in the background
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }
      tickRef.current += 1;
      refreshCounts();
      if (tickRef.current % INBOX_COUNT_EVERY_N_TICKS === 0) {
        refreshInboxCount();
      }
    }, COUNTS_TICK_MS);

    // Cross-tab sync: another tab wrote counts to localStorage.
    const handleStorageChange = (e) => {
      if (e.key === COUNTS_STORAGE_KEY && e.newValue) {
        try {
          dispatch(syncCountsFromStorage(JSON.parse(e.newValue)));
        } catch (err) {
          // Malformed payload — ignore, next tick refreshes from server.
        }
      }
    };

    // In-tab legacy event (dispatched after mark-read): refresh from server.
    const handleCustomEvent = () => {
      refreshCounts();
    };

    // Window refocus & tab visibility refresh
    const handleFocus = () => {
      refreshCounts();
      refreshInboxCount();
    };

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        refreshCounts();
        refreshInboxCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("admin_unread_counts_updated", handleCustomEvent);
    window.addEventListener("focus", handleFocus);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("admin_unread_counts_updated", handleCustomEvent);
      window.removeEventListener("focus", handleFocus);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [dispatch, isAuthenticated, refreshCounts, refreshInboxCount]);

  return { refreshCounts, refreshInboxCount };
};

export default useNotificationCoordinator;
