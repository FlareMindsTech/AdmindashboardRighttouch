// src/store/slices/bookingsSlice.js — Phase 4B: bookings.
//
// Two SEPARATE collections — different schemas, endpoints, and consumers:
// - service: legacy GET /user/service/booking (via api/bookingsReports.js
//   getAllRoleBookings — URL-identical) consumed by Dashboard (KPIs),
//   UserManagement (enrichment), TechnicianPayouts (history modal).
//   Commission's paginated GET /user/booking/getAllBookings is a different
//   contract and stays on its legacy helper (documented, not merged).
// - product: GET /user/getAllProductBooking (via api/products.js —
//   URL-identical) consumed today only by ProductManagement (tab-scoped,
//   mutation-heavy). The collection + thunk ship tested so service/product
//   separation is structural; page wiring follows when a second consumer or
//   tab-dedup need is verified (see Phase 4 report).
//
// TTL 60s: bookings change from customer/technician activity outside admin
// control, so the window is intentionally short — it dedups mount bursts and
// cross-page navigation, never replaces user-triggered refresh.
// Derived totals/KPIs/charts/sorting/filtering stay in pages. No optimistic
// payment/booking mutations in this phase.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllRoleBookings } from "api/bookingsReports";
import { getAllProductBookings } from "api/products";
import { logout, sessionExpired } from "./authSlice";
import { dedupedFetch } from "store/requestDedup";

export const BOOKINGS_TTL_MS = 60 * 1000;

const asArray = (raw, keys) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    for (const key of keys) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

// Supersets of each page's local unwrapping (field coverage preserved so
// Dashboard KPIs, user enrichment, and tech-history filters keep working).
export const normalizeServiceBookings = (body) =>
  asArray(
    body?.result || body?.data || body?.bookings || body?.serviceBookings || body,
    ["bookings", "serviceBookings"]
  );
export const normalizeProductBookings = (body) =>
  asArray(body?.result || body?.bookings || body?.data || body, ["bookings"]);

const emptyCollection = () => ({
  data: [],
  status: "idle",
  error: null,
  requestId: null,
  lastFetchedAt: 0,
});

const initialState = {
  service: emptyCollection(),
  product: emptyCollection(),
};

const isFresh = (entry) => Date.now() - entry.lastFetchedAt < BOOKINGS_TTL_MS;

export const fetchServiceBookings = createAsyncThunk(
  "bookings/fetchServiceBookings",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    // Dedup outside Redux state (see store/requestDedup.js): reading
    // entry.status here would see this thunk's own pending action.
    const readEntry = () => getState().bookings.service;
    try {
      const { list, cached } = await dedupedFetch("bookings:service", {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        run: async () => {
          const { data, error } = await getAllRoleBookings();
          if (error) throw new Error(error);
          return normalizeServiceBookings(data);
        },
      });
      return { list, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  }
);

export const fetchProductBookings = createAsyncThunk(
  "bookings/fetchProductBookings",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    const readEntry = () => getState().bookings.product;
    try {
      const { list, cached } = await dedupedFetch("bookings:product", {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        run: async () => {
          const { data, error } = await getAllProductBookings();
          if (error) throw new Error(error);
          return normalizeProductBookings(data);
        },
      });
      return { list, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    invalidateBookings(state, action) {
      const keys = action.payload?.keys;
      const all = !keys || keys.length === 0;
      if (all || keys.includes("service")) state.service.lastFetchedAt = 0;
      if (all || keys.includes("product")) state.product.lastFetchedAt = 0;
    },
    resetBookings() {
      return { service: emptyCollection(), product: emptyCollection() };
    },
  },
  extraReducers: (builder) => {
    const applyFulfilled = (entry, requestId, list) => {
      if (entry.requestId !== requestId) return;
      entry.data = list;
      entry.status = "succeeded";
      entry.error = null;
      entry.lastFetchedAt = Date.now();
    };
    const applyRejected = (entry, requestId, error) => {
      if (entry.requestId !== requestId) return;
      entry.status = "failed";
      entry.error = error;
    };
    builder
      .addCase(fetchServiceBookings.pending, (state, action) => {
        state.service.status = "loading";
        state.service.requestId = action.meta.requestId;
      })
      .addCase(fetchServiceBookings.fulfilled, (state, action) => {
        applyFulfilled(state.service, action.meta.requestId, action.payload.list);
      })
      .addCase(fetchServiceBookings.rejected, (state, action) => {
        applyRejected(
          state.service,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(fetchProductBookings.pending, (state, action) => {
        state.product.status = "loading";
        state.product.requestId = action.meta.requestId;
      })
      .addCase(fetchProductBookings.fulfilled, (state, action) => {
        applyFulfilled(state.product, action.meta.requestId, action.payload.list);
      })
      .addCase(fetchProductBookings.rejected, (state, action) => {
        applyRejected(
          state.product,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(logout, () => ({
        service: emptyCollection(),
        product: emptyCollection(),
      }))
      .addCase(sessionExpired, () => ({
        service: emptyCollection(),
        product: emptyCollection(),
      }));
  },
});

export const { invalidateBookings, resetBookings } = bookingsSlice.actions;

export const selectServiceBookings = (state) => state.bookings.service.data;
export const selectServiceBookingsStatus = (state) =>
  state.bookings.service.status;
export const selectProductBookings = (state) => state.bookings.product.data;
export const selectProductBookingsStatus = (state) =>
  state.bookings.product.status;

export default bookingsSlice.reducer;
