// src/store/slices/usersSlice.js — Phase 5B: user records.
//
// Justification note: the Customer list has a single page consumer
// (UserManagement), but it is enriched with shared bookings + technicians and
// feeds the allocation UI, so a keyed cache + uniform invalidation still pays
// off. Admin (/admins/*) records stay page-local to their single consumer.
// - Reads use modern api/users.js getAllUsersByRole — URL-identical to legacy
//   getUsersByRole(role) for the no-options call UserManagement makes.
// - Mutations reuse the LEGACY helpers (/users/register, /users/update/:id,
//   /users/delete/:id) — the modern module has no create/update and a
//   different delete path, so legacy owns those URLs (no duplication).
// - inActiveAdmin's delegation to deleteTechnician is preserved untouched in
//   the page (suspicious but out of scope to "fix").
// Search/sort/pagination/selection/modals/forms stay local. All mutations
// pessimistic + invalidate the role cache.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllUsersByRole } from "api/users";
import { deleteUserById as legacyDeleteUserById } from "views/utils/axiosInstance";
import { logout, sessionExpired } from "./authSlice";
import { dedupedFetch } from "store/requestDedup";

export const USERS_TTL_MS = 2 * 60 * 1000;

const asArray = (raw, keys) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    for (const key of keys) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

// Superset of UserManagement's list unwrapping.
export const normalizeUsers = (body) =>
  asArray(
    body?.result || body?.data?.users || body?.data || body?.users || body,
    ["users"]
  );

const emptyEntry = () => ({
  data: [],
  status: "idle",
  error: null,
  requestId: null,
  lastFetchedAt: 0,
});

const initialState = {
  byRole: {}, // { [role]: entry }
};

const entryFor = (state, role) => {
  if (!state.byRole[role]) state.byRole[role] = emptyEntry();
  return state.byRole[role];
};

export const fetchUsersByRole = createAsyncThunk(
  "users/fetchUsersByRole",
  async ({ role = "Customer", force = false } = {}, {
    getState,
    rejectWithValue,
  }) => {
    // Dedup outside Redux state (see store/requestDedup.js).
    const readEntry = () => getState().users.byRole[role] || emptyEntry();
    const fresh =
      readEntry().data.length > 0 &&
      Date.now() - readEntry().lastFetchedAt < USERS_TTL_MS;
    try {
      const { list, cached } = await dedupedFetch(`users:${role}`, {
        force,
        isFresh: () => fresh,
        getCurrent: () => readEntry().data,
        run: async () => {
          const { data, error } = await getAllUsersByRole(role);
          if (error) throw new Error(error);
          return normalizeUsers(data);
        },
      });
      return { role, list, cached };
    } catch (err) {
      return rejectWithValue({ role, error: err?.message || "Request failed" });
    }
  }
);

const mutationThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      const result = await fn(arg);
      return { arg, result };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  });

// Deletion is the only user mutation this dashboard performs
// (UserManagement has no create/edit flows); the legacy helper owns the
// exact /users/delete/:id contract. Pessimistic + invalidates the cache.
export const removeUserRecord = mutationThunk(
  "users/removeUserRecord",
  ({ id }) => legacyDeleteUserById(id)
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    invalidateUsers(state, action) {
      const roles = action.payload?.roles;
      if (!roles || roles.length === 0) {
        Object.keys(state.byRole).forEach((role) => {
          state.byRole[role].lastFetchedAt = 0;
        });
        return;
      }
      roles.forEach((role) => {
        if (state.byRole[role]) state.byRole[role].lastFetchedAt = 0;
      });
    },
    resetUsers() {
      return { byRole: {} };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersByRole.pending, (state, action) => {
        const role = action.meta.arg?.role || "Customer";
        const entry = entryFor(state, role);
        entry.status = "loading";
        entry.requestId = action.meta.requestId;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        const { role, list } = action.payload;
        const entry = entryFor(state, role);
        if (entry.requestId !== action.meta.requestId) return;
        entry.data = list;
        entry.status = "succeeded";
        entry.error = null;
        entry.lastFetchedAt = Date.now();
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        const role = action.meta.arg?.role || "Customer";
        const entry = state.byRole[role];
        if (!entry || entry.requestId !== action.meta.requestId) return;
        entry.status = "failed";
        entry.error = action.payload?.error || action.error?.message;
      });
    const invalidateRole = (state, role = "Customer") => {
      if (state.byRole[role]) state.byRole[role].lastFetchedAt = 0;
    };
    for (const thunk of [removeUserRecord]) {
      // Invalidate the deleted user's own role cache (falls back to Customer
      // for callers that only pass { id }), so other roles never go stale.
      builder.addCase(thunk.fulfilled, (state, action) => {
        const role = action.payload?.arg?.role || action.meta?.arg?.role || "Customer";
        invalidateRole(state, role);
      });
    }
    builder
      .addCase(logout, () => ({ byRole: {} }))
      .addCase(sessionExpired, () => ({ byRole: {} }));
  },
});

export const { invalidateUsers, resetUsers } = usersSlice.actions;

const EMPTY_USERS = Object.freeze([]);
const usersByRoleSelectors = {};

export const selectUsersByRole = (role = "Customer") => {
  if (!usersByRoleSelectors[role]) {
    usersByRoleSelectors[role] = (state) =>
      state.users.byRole[role]?.data || EMPTY_USERS;
  }
  return usersByRoleSelectors[role];
};
export const selectUsersStatus = (role = "Customer") => (state) =>
  state.users.byRole[role]?.status || "idle";

export default usersSlice.reducer;
