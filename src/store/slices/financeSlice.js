// src/store/slices/financeSlice.js — Phase 5C (read models only).
//
// Separated collections (never one mega-entry), each keyed by its actual
// query parameters so tab/filter/page changes naturally use distinct cache
// entries:
// - summary: keyed by JSON {type,month} (FinanceTracking calls with no args).
// - breakdown: keyed by JSON {status,paymentStatus,technicianId,from,to,page,limit}.
// - ledger: keyed by JSON {status,from,to,page,limit}.
// - techFinance: keyed by technicianId (on-demand detail modal).
// - earnings: passthrough thunk (no page consumer found; kept out of state
//   rather than cached blindly — see report).
//
// All reads use modern api/finance.js — paths/params verified identical to
// the legacy helpers. TTL 60s (money data is volatile). FinanceTracking is
// read-only (no finance mutations exist on the page), so no invalidation
// wiring is needed here; breakdown/ledger refetch on filter change by key.
// Balances are NEVER written optimistically and NEVER cached as authoritative
// for executing payments — thunks only store last-fetched snapshots.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFinanceSummary,
  getFinanceBreakdown,
  getPaymentsLedger,
  getTechnicianFinance,
} from "api/finance";
import { logout, sessionExpired } from "./authSlice";
import { dedupedFetch } from "store/requestDedup";

export const FINANCE_TTL_MS = 60 * 1000;

const emptyEntry = () => ({
  data: null,
  status: "idle",
  error: null,
  requestId: null,
  lastFetchedAt: 0,
});

const initialState = {
  summary: {}, // { [key]: entry }
  breakdown: {}, // { [key]: entry }
  ledger: {}, // { [key]: entry }
  techFinance: {}, // { [technicianId]: entry }
};

const keyOf = (params) => JSON.stringify(params || {});

const entryFor = (bucket, key) => {
  if (!bucket[key]) bucket[key] = emptyEntry();
  return bucket[key];
};

const readCached = (bucket, key) => {
  const entry = bucket[key];
  if (
    entry &&
    entry.data !== null &&
    Date.now() - entry.lastFetchedAt < FINANCE_TTL_MS
  ) {
    return entry.data;
  }
  return undefined;
};


// Dedup lives outside Redux state (see store/requestDedup.js): the old
// `status === "loading"` check saw each thunk's own pending action under a
// real store, so cold starts never fetched.

export const fetchFinanceSummary = createAsyncThunk(
  "finance/fetchFinanceSummary",
  async ({ force = false, ...params } = {}, { getState, rejectWithValue }) => {
    const key = keyOf(params);
    try {
      const { list: data, cached } = await dedupedFetch(`finance:summary:${key}`, {
        force,
        isFresh: () =>
          readCached(getState().finance.summary, key) !== undefined,
        getCurrent: () => readCached(getState().finance.summary, key),
        run: async () => {
          const { data: body, error } = await getFinanceSummary(params);
          if (error) throw new Error(error);
          return body?.result || body?.data || body?.summary || body;
        },
      });
      return { key, data, cached };
    } catch (err) {
      return rejectWithValue({ key, error: err?.message || "Request failed" });
    }
  }
);

export const fetchFinanceBreakdown = createAsyncThunk(
  "finance/fetchFinanceBreakdown",
  async ({ force = false, ...params } = {}, { getState, rejectWithValue }) => {
    const key = keyOf(params);
    try {
      const { list: data, cached } = await dedupedFetch(`finance:breakdown:${key}`, {
        force,
        isFresh: () =>
          readCached(getState().finance.breakdown, key) !== undefined,
        getCurrent: () => readCached(getState().finance.breakdown, key),
        run: async () => {
          const { data: body, error } = await getFinanceBreakdown(params);
          if (error) throw new Error(error);
          // Preserve the page's list/meta split exactly.
          const raw = body?.result || body?.data || body;
          const list = Array.isArray(raw)
            ? raw
            : raw?.payments || raw?.breakdown || raw?.items || [];
          const meta = body?.meta || (typeof raw === "object" && raw?.meta) || {};
          return { list, meta };
        },
      });
      return { key, data, cached };
    } catch (err) {
      return rejectWithValue({ key, error: err?.message || "Request failed" });
    }
  }
);

export const fetchPaymentsLedger = createAsyncThunk(
  "finance/fetchPaymentsLedger",
  async ({ force = false, ...params } = {}, { getState, rejectWithValue }) => {
    const key = keyOf(params);
    try {
      const { list: data, cached } = await dedupedFetch(`finance:ledger:${key}`, {
        force,
        isFresh: () =>
          readCached(getState().finance.ledger, key) !== undefined,
        getCurrent: () => readCached(getState().finance.ledger, key),
        run: async () => {
          const { data: body, error } = await getPaymentsLedger(params);
          if (error) throw new Error(error);
          const raw = body?.result || body?.data || body;
          const list = Array.isArray(raw)
            ? raw
            : raw?.payments || raw?.ledger || raw?.items || [];
          const meta = body?.meta || (typeof raw === "object" && raw?.meta) || {};
          return { list, meta };
        },
      });
      return { key, data, cached };
    } catch (err) {
      return rejectWithValue({ key, error: err?.message || "Request failed" });
    }
  }
);

export const fetchTechnicianFinance = createAsyncThunk(
  "finance/fetchTechnicianFinance",
  async (technicianId, { getState, rejectWithValue }) => {
    const key = String(technicianId);
    try {
      const { list: data, cached } = await dedupedFetch(`finance:tech:${key}`, {
        force: false,
        isFresh: () =>
          readCached(getState().finance.techFinance, key) !== undefined,
        getCurrent: () => readCached(getState().finance.techFinance, key),
        run: async () => {
          const { data: body, error } = await getTechnicianFinance(technicianId);
          if (error) throw new Error(error);
          return body?.result || body?.data || body?.detail || body;
        },
      });
      return { key, data, cached };
    } catch (err) {
      return rejectWithValue({ key, error: err?.message || "Request failed" });
    }
  }
);

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    invalidateFinance(state, action) {
      const { buckets, keys } = action.payload || {};
      const wipe = (bucket) => {
        if (!keys) {
          Object.keys(bucket).forEach((k) => {
            bucket[k].lastFetchedAt = 0;
          });
          return;
        }
        keys.forEach((k) => {
          if (bucket[k]) bucket[k].lastFetchedAt = 0;
        });
      };
      if (!buckets || buckets.includes("summary")) wipe(state.summary);
      if (!buckets || buckets.includes("breakdown")) wipe(state.breakdown);
      if (!buckets || buckets.includes("ledger")) wipe(state.ledger);
      if (!buckets || buckets.includes("techFinance")) wipe(state.techFinance);
    },
    resetFinance() {
      return { summary: {}, breakdown: {}, ledger: {}, techFinance: {} };
    },
  },
  extraReducers: (builder) => {
    const pendingIn = (bucket, key, requestId) => {
      const entry = entryFor(bucket, key);
      entry.status = "loading";
      entry.requestId = requestId;
    };
    const fulfilledIn = (bucket, key, requestId, data) => {
      const entry = bucket[key];
      if (!entry || entry.requestId !== requestId) return;
      entry.data = data;
      entry.status = "succeeded";
      entry.error = null;
      entry.lastFetchedAt = Date.now();
    };
    const rejectedIn = (bucket, key, requestId, error) => {
      const entry = bucket[key];
      if (!entry || entry.requestId !== requestId) return;
      entry.status = "failed";
      entry.error = error;
    };
    const wire = (thunk, getBucket, isIdKeyed) => {
      // Must mirror each thunk's key: keyOf(params) for object args,
      // String(technicianId) for the detail thunk, keyOf({}) when arg omitted.
      // `force` is a fetch directive, not part of the cache identity — the
      // thunks strip it before keying, so the reducers must too. Otherwise a
      // { force: true } call writes pending to one key while fulfilled lands
      // on another and the data is silently dropped.
      const stripForce = (arg) => {
        if (!arg || typeof arg !== "object") return arg;
        const { force, ...rest } = arg;
        return rest;
      };
      const pendingKey = (arg) =>
        isIdKeyed ? String(arg) : keyOf(stripForce(arg) || {});
      builder
        .addCase(thunk.pending, (state, action) => {
          pendingIn(getBucket(state), pendingKey(action.meta.arg), action.meta.requestId);
        })
        .addCase(thunk.fulfilled, (state, action) => {
          fulfilledIn(
            getBucket(state),
            action.payload.key,
            action.meta.requestId,
            action.payload.data
          );
        })
        .addCase(thunk.rejected, (state, action) => {
          const raw = action.meta.arg;
          const key =
            action.payload?.key ??
            (isIdKeyed ? String(raw) : keyOf(stripForce(raw) || {}));
          rejectedIn(
            getBucket(state),
            key,
            action.meta.requestId,
            action.payload?.error || action.error?.message
          );
        });
    };
    wire(fetchFinanceSummary, (s) => s.summary);
    wire(fetchFinanceBreakdown, (s) => s.breakdown);
    wire(fetchPaymentsLedger, (s) => s.ledger);
    wire(fetchTechnicianFinance, (s) => s.techFinance, true);
    const reset = () => ({
      summary: {},
      breakdown: {},
      ledger: {},
      techFinance: {},
    });
    builder.addCase(logout, reset).addCase(sessionExpired, reset);
  },
});

export const { invalidateFinance, resetFinance } = financeSlice.actions;

const defaultSummarySelector = (state) => state.finance.summary[keyOf({})]?.data ?? null;
const defaultLedgerSelector = (state) => state.finance.ledger[keyOf({})]?.data ?? null;
const defaultBreakdownSelector = (state) => state.finance.breakdown[keyOf({})]?.data ?? null;

// Selectors keyed exactly like the thunks' arguments, with stable references for all params.
const summarySelectors = new Map();
export const selectFinanceSummary = (params) => {
  if (!params || Object.keys(params).length === 0) return defaultSummarySelector;
  if ("finance" in params) return defaultSummarySelector(params);
  const key = keyOf(params);
  let sel = summarySelectors.get(key);
  if (!sel) {
    sel = (state) => state.finance.summary[key]?.data ?? null;
    summarySelectors.set(key, sel);
  }
  return sel;
};
export const selectFinanceSummaryStatus = (params = {}) => (state) =>
  state.finance.summary[keyOf(params)]?.status || "idle";

const breakdownSelectors = new Map();
export const selectFinanceBreakdown = (params) => {
  if (!params || Object.keys(params).length === 0) return defaultBreakdownSelector;
  if ("finance" in params) return defaultBreakdownSelector(params);
  const key = keyOf(params);
  let sel = breakdownSelectors.get(key);
  if (!sel) {
    sel = (state) => state.finance.breakdown[key]?.data ?? null;
    breakdownSelectors.set(key, sel);
  }
  return sel;
};

const ledgerSelectors = new Map();
export const selectPaymentsLedger = (params) => {
  if (!params || Object.keys(params).length === 0) return defaultLedgerSelector;
  if ("finance" in params) return defaultLedgerSelector(params);
  const key = keyOf(params);
  let sel = ledgerSelectors.get(key);
  if (!sel) {
    sel = (state) => state.finance.ledger[key]?.data ?? null;
    ledgerSelectors.set(key, sel);
  }
  return sel;
};

const techFinanceSelectors = new Map();
export const selectTechnicianFinance = (technicianId) => {
  const idStr = String(technicianId || "");
  let sel = techFinanceSelectors.get(idStr);
  if (!sel) {
    sel = (state) => state.finance.techFinance[idStr]?.data ?? null;
    techFinanceSelectors.set(idStr, sel);
  }
  return sel;
};

export default financeSlice.reducer;
