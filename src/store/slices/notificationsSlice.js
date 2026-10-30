// src/store/slices/notificationsSlice.js — Phase 3: notification state.
//
// Two verified-distinct domains share this slice but NEVER share endpoints:
// - Domain A (sidebar module badges): src/api/notificationCounts.js
//   GET /admin/notifications/unread-counts, PATCH /admin/notifications/mark-read
// - Domain B (navbar inbox): src/api/notifications.js (endpoint-identical to
//   the legacy helpers AdminNavbarLinks used: GET /admin/notifications,
//   GET /admin/notifications/unread-count, PATCH /:id/read, PATCH /read-all)
//
// Envelope note: legacy B helpers returned raw response JSON and threw on
// failure; api/* modules return { data, error }. The thunks below normalize
// to the same tolerant parsing the consumers already used, so UI behavior
// (badge numbers, inbox rows, toasts) is unchanged.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getModuleUnreadCounts,
  markModuleNotificationsRead,
  DEFAULT_MODULE_COUNTS,
} from "api/notificationCounts";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "api/notifications";
import { logout, sessionExpired } from "./authSlice";

const COUNTS_STORAGE_KEY = "admin_unread_counts";
const COUNTS_STALE_AFTER_MS = 10 * 1000;

const readStoredCounts = () => {
  try {
    const saved =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(COUNTS_STORAGE_KEY)
        : null;
    return saved ? JSON.parse(saved) : { ...DEFAULT_MODULE_COUNTS };
  } catch (e) {
    return { ...DEFAULT_MODULE_COUNTS };
  }
};

const persistCounts = (counts) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(counts));
    }
  } catch (e) {
    // Storage full/blocked — counts still live in Redux; never throw.
  }
};

const countsEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
};

// --- Domain A thunks (sidebar badges) ---

export const fetchModuleCounts = createAsyncThunk(
  "notifications/fetchModuleCounts",
  async (_, { rejectWithValue }) => {
    const { data, error } = await getModuleUnreadCounts();
    if (error) return rejectWithValue(error);
    return data.counts;
  },
  {
    // Skip overlapping refreshes; the coordinator already serializes ticks.
    condition: (_, { getState }) => {
      const { notifications } = getState();
      return notifications?.countsStatus !== "loading";
    },
  }
);

export const markModuleRead = createAsyncThunk(
  "notifications/markModuleRead",
  async ({ module, id = null, markAll = false } = {}, { rejectWithValue }) => {
    const { data, error } = await markModuleNotificationsRead({
      module,
      id,
      markAll,
    });
    if (error) return rejectWithValue({ module, error });
    return { module, counts: data.counts };
  }
);

// --- Domain B thunks (navbar inbox) ---

const readUnreadCount = (body) => {
  // Same tolerant parsing AdminNavbarLinks used on the legacy response.
  const count =
    body?.count ?? body?.unreadCount ?? body?.result?.count ?? body?.data?.count ?? 0;
  return Number(count) || 0;
};

const readInboxList = (body) => {
  const list =
    body?.notifications ||
    body?.result ||
    body?.data ||
    (Array.isArray(body) ? body : []);
  return Array.isArray(list) ? list : [];
};

export const fetchInboxUnreadCount = createAsyncThunk(
  "notifications/fetchInboxUnreadCount",
  async (_, { rejectWithValue }) => {
    const { data, error } = await getUnreadCount();
    if (error) return rejectWithValue(error);
    return readUnreadCount(data);
  },
  {
    condition: (_, { getState }) => {
      const { notifications } = getState();
      return notifications?.inboxCountStatus !== "loading";
    },
  }
);

export const fetchInboxList = createAsyncThunk(
  "notifications/fetchInboxList",
  async (_, { rejectWithValue }) => {
    const { data, error } = await listNotifications();
    if (error) return rejectWithValue(error);
    return readInboxList(data);
  }
);

export const markInboxRead = createAsyncThunk(
  "notifications/markInboxRead",
  async (id, { rejectWithValue }) => {
    const { error } = await markNotificationRead(id);
    if (error) return rejectWithValue(error);
    return id;
  }
);

export const markAllInboxRead = createAsyncThunk(
  "notifications/markAllInboxRead",
  async (_, { rejectWithValue }) => {
    const { error } = await markAllNotificationsRead();
    if (error) return rejectWithValue(error);
    return true;
  }
);

const initialState = {
  // Domain A
  counts: readStoredCounts(),
  countsStatus: "idle",
  countsError: null,
  countsRequestId: null,
  // Snapshot of counts before the latest optimistic markModuleRead, so a
  // failed mark-read can roll back instead of leaving a false zero.
  countsBeforeOptimistic: null,
  markReadRequestId: null,
  lastFetchedCountsAt: 0,
  // Domain B
  inbox: [],
  unreadCount: 0,
  inboxStatus: "idle",
  inboxError: null,
  inboxRequestId: null,
  inboxCountStatus: "idle",
  inboxCountError: null,
  inboxCountRequestId: null,
  inboxReadRequestId: null,
  lastFetchedInboxAt: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Cross-tab sync: applies counts broadcast via the storage event,
    // exactly like the legacy hook's handleStorageChange did.
    syncCountsFromStorage(state, action) {
      const counts = action.payload;
      if (counts && typeof counts === "object") {
        state.counts = { ...DEFAULT_MODULE_COUNTS, ...counts };
      }
    },
    resetNotifications(state) {
      state.counts = { ...DEFAULT_MODULE_COUNTS };
      state.countsStatus = "idle";
      state.countsError = null;
      state.countsRequestId = null;
      state.countsBeforeOptimistic = null;
      state.markReadRequestId = null;
      state.lastFetchedCountsAt = 0;
      state.inbox = [];
      state.unreadCount = 0;
      state.inboxStatus = "idle";
      state.inboxError = null;
      state.inboxRequestId = null;
      state.inboxCountStatus = "idle";
      state.inboxCountError = null;
      state.inboxCountRequestId = null;
      state.inboxReadRequestId = null;
      state.lastFetchedInboxAt = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Domain A: fetch counts (stale responses ignored via requestId)
      .addCase(fetchModuleCounts.pending, (state, action) => {
        if (state.countsStatus !== "succeeded") {
          state.countsStatus = "loading";
        }
        state.countsRequestId = action.meta.requestId;
      })
      .addCase(fetchModuleCounts.fulfilled, (state, action) => {
        if (state.countsRequestId !== action.meta.requestId) return;
        const nextCounts = { ...DEFAULT_MODULE_COUNTS, ...action.payload };
        if (!countsEqual(state.counts, nextCounts)) {
          state.counts = nextCounts;
          persistCounts(state.counts);
        }
        state.countsStatus = "succeeded";
        state.countsError = null;
        state.lastFetchedCountsAt = Date.now();
      })
      .addCase(fetchModuleCounts.rejected, (state, action) => {
        if (state.countsRequestId !== action.meta.requestId) return;
        // Preserve last good counts on failure (legacy hook also kept them).
        state.countsStatus = "failed";
        state.countsError = action.payload || action.error?.message;
      })
      // Domain A: optimistic zeroing (legacy behavior), then authoritative.
      // The pre-optimistic snapshot lets a failed mark-read roll back instead
      // of leaving a false zero badge. Stale responses (incl. late arrivals
      // after logout, where the id resets to null) are ignored via requestId.
      .addCase(markModuleRead.pending, (state, action) => {
        const moduleName = action.meta.arg?.module;
        state.markReadRequestId = action.meta.requestId;
        if (moduleName && moduleName in state.counts) {
          state.countsBeforeOptimistic = { ...state.counts };
          state.counts = { ...state.counts, [moduleName]: 0 };
          persistCounts(state.counts);
        }
      })
      .addCase(markModuleRead.fulfilled, (state, action) => {
        if (state.markReadRequestId !== action.meta.requestId) return;
        state.markReadRequestId = null;
        state.countsBeforeOptimistic = null;
        state.counts = { ...DEFAULT_MODULE_COUNTS, ...action.payload.counts };
        persistCounts(state.counts);
        state.countsError = null;
      })
      .addCase(markModuleRead.rejected, (state, action) => {
        if (state.markReadRequestId !== action.meta.requestId) return;
        state.markReadRequestId = null;
        // Roll back the optimistic zero so the badge shows the last good
        // counts instead of a misleading 0.
        if (state.countsBeforeOptimistic) {
          state.counts = { ...state.countsBeforeOptimistic };
          persistCounts(state.counts);
          state.countsBeforeOptimistic = null;
        }
        state.countsError = action.payload?.error || action.error?.message;
      })
      // Domain B: inbox count (stale responses ignored via requestId)
      .addCase(fetchInboxUnreadCount.pending, (state, action) => {
        state.inboxCountStatus = "loading";
        state.inboxCountRequestId = action.meta.requestId;
      })
      .addCase(fetchInboxUnreadCount.fulfilled, (state, action) => {
        if (state.inboxCountRequestId !== action.meta.requestId) return;
        state.inboxCountRequestId = null;
        state.unreadCount = action.payload;
        state.inboxCountStatus = "succeeded";
        state.inboxCountError = null;
        state.lastFetchedInboxAt = Date.now();
      })
      .addCase(fetchInboxUnreadCount.rejected, (state, action) => {
        if (state.inboxCountRequestId !== action.meta.requestId) return;
        state.inboxCountRequestId = null;
        // Legacy navbar silently kept the old badge on failure.
        state.inboxCountStatus = "failed";
        state.inboxCountError = action.payload || action.error?.message;
      })
      // Domain B: inbox list (stale responses ignored via requestId)
      .addCase(fetchInboxList.pending, (state, action) => {
        state.inboxStatus = "loading";
        state.inboxRequestId = action.meta.requestId;
      })
      .addCase(fetchInboxList.fulfilled, (state, action) => {
        if (state.inboxRequestId !== action.meta.requestId) return;
        state.inbox = action.payload;
        state.inboxStatus = "succeeded";
        state.inboxError = null;
      })
      .addCase(fetchInboxList.rejected, (state, action) => {
        if (state.inboxRequestId !== action.meta.requestId) return;
        state.inboxStatus = "failed";
        state.inboxError = action.payload || action.error?.message;
      })
      // Domain B: read ops mirror the legacy local updates.
      // Guarded by requestId so late responses after logout/reset are ignored.
      .addCase(markInboxRead.pending, (state, action) => {
        state.inboxReadRequestId = action.meta.requestId;
      })
      .addCase(markInboxRead.fulfilled, (state, action) => {
        if (state.inboxReadRequestId !== action.meta.requestId) return;
        state.inboxReadRequestId = null;
        const id = action.payload;
        state.inbox = state.inbox.map((n) =>
          n._id === id || n.id === id ? { ...n, isRead: true } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markInboxRead.rejected, (state, action) => {
        if (state.inboxReadRequestId !== action.meta.requestId) return;
        state.inboxReadRequestId = null;
        state.inboxError = action.payload || action.error?.message;
      })
      .addCase(markAllInboxRead.pending, (state, action) => {
        state.inboxReadRequestId = action.meta.requestId;
      })
      .addCase(markAllInboxRead.fulfilled, (state, action) => {
        if (state.inboxReadRequestId !== action.meta.requestId) return;
        state.inboxReadRequestId = null;
        state.inbox = state.inbox.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllInboxRead.rejected, (state, action) => {
        if (state.inboxReadRequestId !== action.meta.requestId) return;
        state.inboxReadRequestId = null;
        state.inboxError = action.payload || action.error?.message;
      })
      // Logout / session expiry: drop notification state (storage itself is
      // cleared by the legacy clearAuth, as before). Timers are owned by the
      // coordinator, which unmounts with the owner layout.
      .addCase(logout, (state) => {
        state.counts = { ...DEFAULT_MODULE_COUNTS };
        state.countsStatus = "idle";
        state.countsError = null;
        state.countsRequestId = null;
        state.countsBeforeOptimistic = null;
        state.markReadRequestId = null;
        state.lastFetchedCountsAt = 0;
        state.inbox = [];
        state.unreadCount = 0;
        state.inboxStatus = "idle";
        state.inboxError = null;
        state.inboxRequestId = null;
        state.inboxCountStatus = "idle";
        state.inboxCountError = null;
        state.inboxCountRequestId = null;
        state.inboxReadRequestId = null;
        state.lastFetchedInboxAt = 0;
      })
      .addCase(sessionExpired, (state) => {
        state.counts = { ...DEFAULT_MODULE_COUNTS };
        state.countsStatus = "idle";
        state.countsError = null;
        state.countsRequestId = null;
        state.countsBeforeOptimistic = null;
        state.markReadRequestId = null;
        state.lastFetchedCountsAt = 0;
        state.inbox = [];
        state.unreadCount = 0;
        state.inboxStatus = "idle";
        state.inboxError = null;
        state.inboxRequestId = null;
        state.inboxCountStatus = "idle";
        state.inboxCountError = null;
        state.inboxCountRequestId = null;
        state.inboxReadRequestId = null;
        state.lastFetchedInboxAt = 0;
      });
  },
});

export const { syncCountsFromStorage, resetNotifications } =
  notificationsSlice.actions;

// Selectors for sidebar badges and navbar display.
export const selectModuleCounts = (state) => state.notifications.counts;
export const selectModuleCount = (module) => (state) =>
  state.notifications.counts[module] || 0;
export const selectCountsStatus = (state) => state.notifications.countsStatus;
export const selectCountsError = (state) => state.notifications.countsError;
export const selectInbox = (state) => state.notifications.inbox;
export const selectInboxUnreadCount = (state) =>
  state.notifications.unreadCount;
export const selectInboxStatus = (state) => state.notifications.inboxStatus;
export const selectInboxError = (state) => state.notifications.inboxError;
export const selectInboxLoading = (state) =>
  state.notifications.inboxStatus === "loading";
export const selectLastFetchedCountsAt = (state) =>
  state.notifications.lastFetchedCountsAt;

export { COUNTS_STORAGE_KEY, COUNTS_STALE_AFTER_MS };
export default notificationsSlice.reducer;
