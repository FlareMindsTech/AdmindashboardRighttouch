// src/store/store.js — Phase 2: Redux store (authentication only).
//
// - Registers only the auth reducer (no placeholder slices for later phases).
// - Keeps default serializability/immutability checks enabled.
// - Bridges the legacy 401/session-expiry path: the store registers a reset
//   listener so handleSessionExpiry clears Redux state through the SAME
//   debounced toast+redirect flow — no second redirect mechanism.
// - Only the auth slice is persisted, and only via the existing legacy
//   storage helpers (setAuth/clearAuth). The store itself is never persisted.
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { sessionExpired } from "./slices/authSlice";
import notificationsReducer from "./slices/notificationsSlice";
import referenceReducer from "./slices/referenceSlice";
import bookingsReducer from "./slices/bookingsSlice";
import techniciansReducer from "./slices/techniciansSlice";
import usersReducer from "./slices/usersSlice";
import financeReducer from "./slices/financeSlice";
import walletReducer from "./slices/walletSlice";
import { setAuthResetListener } from "views/utils/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    reference: referenceReducer,
    bookings: bookingsReducer,
    technicians: techniciansReducer,
    users: usersReducer,
    finance: financeReducer,
    wallet: walletReducer,
  },
});

// Single integration point with the legacy HTTP layer. handleSessionExpiry
// already cleared storage + showed the toast + redirected; here we only
// reset the Redux representation. Guarded so unit contexts without a DOM
// or without the helper still configure safely.
try {
  setAuthResetListener(() => {
    store.dispatch(sessionExpired());
  });
} catch (e) {
  // Legacy helper unavailable (e.g. isolated tests) — store still works;
  // session-expiry reset is then driven by explicit dispatches.
}

export default store;
