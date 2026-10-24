// src/store/slices/walletSlice.js — Phase 5C, payouts domain (separate slice).
//
// Reads (TTL 60s, keyed snapshots — never authoritative for executing money):
// - summary: GET /admin/wallet (legacy getAdminWalletSummary ≡ modern
//   getPlatformWallet; modern used).
// - withdrawals: legacy getAllWithdrawalRequests OWNS the URL + 404 fallback
//   (/admin/wallet/withdrawals → /admin/wallet/withdrawalhistory), which the
//   modern module does not replicate — thunk delegates to legacy (no URL
//   duplication). Keyed by filter params (e.g. {status}) so server-filtered
//   reads (Billing) and unfiltered reads (TechnicianPayouts) never share a
//   cache entry.
// - autoPayoutSummary: URL-identical → modern module.
// Mutations (all pessimistic, server response returned, caches invalidated;
// preview → confirm → mutate → refresh page flows unchanged):
// - approve/reject/pay/send-money/resolve/manual-approve via modern
//   api/wallet.js (paths+methods verified identical). rejectWithdrawal keeps
//   the legacy `{ reason: "" }` default body when the page passes no reason.
// Details/receipts/CSVs/settings/freeze/retry stay page-local legacy
// (per-request, receipt-generating, or out-of-scope settings endpoints).
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPlatformWallet,
  getAutoPayoutSummary,
  approveWithdrawal as apiApproveWithdrawal,
  rejectWithdrawal as apiRejectWithdrawal,
  payWithdrawal as apiPayWithdrawal,
  sendMoneyToTechnician as apiSendMoneyToTechnician,
  approveManualPayout as apiApproveManualPayout,
  resolveManualReviewPayout as apiResolveManualReviewPayout,
} from "api/wallet";
import { getAllWithdrawalRequests as legacyGetAllWithdrawalRequests } from "views/utils/axiosInstance";
import { logout, sessionExpired } from "./authSlice";
import { dedupedFetch } from "store/requestDedup";

export const WALLET_TTL_MS = 60 * 1000;

const asArray = (raw, keys) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    for (const key of keys) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

// Superset of TechnicianPayouts' unwrapping for each leg.
export const normalizeWalletSummary = (body) =>
  body?.summary || body?.result || body?.data || body || null;
export const normalizeWithdrawals = (body) =>
  asArray(
    body?.result || body?.requests || body?.data || body?.history || body?.withdrawals || body,
    ["requests", "history", "withdrawals"]
  );
export const normalizeAutoPayoutSummary = (body) =>
  body?.summary || body?.result || body?.data || body || null;

const emptyEntry = (dataDefault) => ({
  data: dataDefault,
  status: "idle",
  error: null,
  requestId: null,
  lastFetchedAt: 0,
});

const initialState = {
  summary: emptyEntry(null),
  withdrawals: {}, // { [filterKey]: entry } — keyed so filtered reads never collide
  autoPayoutSummary: emptyEntry(null),
};

// Filter key for withdrawals: only the params the legacy endpoint honors.
// Unfiltered callers (TechnicianPayouts) use keyOf({}) — identical to the
// previous single-entry behavior, now collision-safe with filtered callers.
const withdrawalKeyOf = (params) =>
  JSON.stringify({ status: params?.status || "" });

const withdrawalEntryFor = (state, key) => {
  if (!state.withdrawals[key]) state.withdrawals[key] = emptyEntry([]);
  return state.withdrawals[key];
};

const isFresh = (entry) => Date.now() - entry.lastFetchedAt < WALLET_TTL_MS;

const readThunk = (type, fn) =>
  createAsyncThunk(type, async ({ force = false } = {}, { getState, rejectWithValue }) => {
    const key = type.split("/")[1];
    const bucket = { summary: "summary", withdrawals: "withdrawals", auto: "autoPayoutSummary" }[key];
    // Dedup outside Redux state (see store/requestDedup.js).
    const readEntry = () => getState().wallet[bucket];
    try {
      const { list: data, cached } = await dedupedFetch(`wallet:${key}`, {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        run: fn,
      });
      return { data, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  });

export const fetchWalletSummary = readThunk("wallet/summary", async () => {
  const { data, error } = await getPlatformWallet();
  if (error) throw new Error(error);
  return normalizeWalletSummary(data);
});

export const fetchWithdrawals = createAsyncThunk(
  "wallet/withdrawals",
  async ({ force = false, status } = {}, { getState, rejectWithValue }) => {
    const key = withdrawalKeyOf({ status });
    try {
      // Dedup outside Redux state (see store/requestDedup.js).
      const readEntry = () =>
        getState().wallet.withdrawals[key] || emptyEntry([]);
      const params = status ? { status } : {};
      const { list: data, cached } = await dedupedFetch(`wallet:withdrawals:${key}`, {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        run: async () => {
          // Legacy helper owns the /withdrawals → /withdrawalhistory
          // fallback. Params omitted when unfiltered to preserve the exact
          // no-query URL the pages used before.
          const body = await legacyGetAllWithdrawalRequests(params);
          return normalizeWithdrawals(body);
        },
      });
      return { key, data, cached };
    } catch (err) {
      return rejectWithValue({ key, error: err?.message || "Request failed" });
    }
  }
);

export const fetchAutoPayoutSummary = readThunk("wallet/auto", async () => {
  const { data, error } = await getAutoPayoutSummary();
  if (error) throw new Error(error);
  return normalizeAutoPayoutSummary(data);
});

const mutationThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      const result = await fn(arg);
      return { arg, result };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  });

const unwrapModern = async (call) => {
  const { data, error } = await call;
  if (error) throw new Error(error);
  return data;
};

export const approveWithdrawalThunk = mutationThunk(
  "wallet/approveWithdrawal",
  ({ id, body }) => unwrapModern(apiApproveWithdrawal(id, body))
);
// Preserves legacy default: pages calling with no reason still send {reason:""}.
export const rejectWithdrawalThunk = mutationThunk(
  "wallet/rejectWithdrawal",
  ({ id, reason = "" }) => unwrapModern(apiRejectWithdrawal(id, { reason }))
);
export const payWithdrawalThunk = mutationThunk(
  "wallet/payWithdrawal",
  ({ id, body }) => unwrapModern(apiPayWithdrawal(id, body))
);
export const sendMoneyThunk = mutationThunk(
  "wallet/sendMoney",
  ({ technicianId, body }) =>
    unwrapModern(apiSendMoneyToTechnician(technicianId, body))
);
export const approveManualPayoutThunk = mutationThunk(
  "wallet/approveManualPayout",
  ({ id, body }) => unwrapModern(apiApproveManualPayout(id, body))
);
export const resolveManualReviewThunk = mutationThunk(
  "wallet/resolveManualReview",
  ({ id, body }) => unwrapModern(apiResolveManualReviewPayout(id, body))
);

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    invalidateWallet(state, action) {
      const keys = action.payload?.keys;
      const all = !keys || keys.length === 0;
      if (all || keys.includes("summary")) state.summary.lastFetchedAt = 0;
      if (all || keys.includes("withdrawals")) {
        Object.keys(state.withdrawals).forEach((k) => {
          state.withdrawals[k].lastFetchedAt = 0;
        });
      }
      if (all || keys.includes("autoPayoutSummary"))
        state.autoPayoutSummary.lastFetchedAt = 0;
    },
    resetWallet() {
      return {
        summary: emptyEntry(null),
        withdrawals: {},
        autoPayoutSummary: emptyEntry(null),
      };
    },
  },
  extraReducers: (builder) => {
    const trackPending = (entry, requestId) => {
      entry.status = "loading";
      entry.requestId = requestId;
    };
    const trackRejected = (entry, requestId, error) => {
      if (entry.requestId !== requestId) return;
      entry.status = "failed";
      entry.error = error;
    };
    const trackFulfilled = (entry, requestId, data) => {
      if (entry.requestId !== requestId) return;
      entry.data = data;
      entry.status = "succeeded";
      entry.error = null;
      entry.lastFetchedAt = Date.now();
    };
    const invalidateAll = (state) => {
      state.summary.lastFetchedAt = 0;
      Object.keys(state.withdrawals).forEach((k) => {
        state.withdrawals[k].lastFetchedAt = 0;
      });
      state.autoPayoutSummary.lastFetchedAt = 0;
    };
    const withdrawalPendingKey = (arg) => withdrawalKeyOf(arg || {});
    builder
      .addCase(fetchWalletSummary.pending, (state, action) => {
        trackPending(state.summary, action.meta.requestId);
      })
      .addCase(fetchWalletSummary.fulfilled, (state, action) => {
        trackFulfilled(state.summary, action.meta.requestId, action.payload.data);
      })
      .addCase(fetchWalletSummary.rejected, (state, action) => {
        trackRejected(
          state.summary,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(fetchWithdrawals.pending, (state, action) => {
        trackPending(
          withdrawalEntryFor(state, withdrawalPendingKey(action.meta.arg)),
          action.meta.requestId
        );
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        const entry = state.withdrawals[action.payload.key];
        if (!entry) return;
        trackFulfilled(entry, action.meta.requestId, action.payload.data);
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        const key =
          action.payload?.key ?? withdrawalPendingKey(action.meta.arg);
        const entry = state.withdrawals[key];
        if (!entry) return;
        trackRejected(
          entry,
          action.meta.requestId,
          action.payload?.error || action.error?.message
        );
      })
      .addCase(fetchAutoPayoutSummary.pending, (state, action) => {
        trackPending(state.autoPayoutSummary, action.meta.requestId);
      })
      .addCase(fetchAutoPayoutSummary.fulfilled, (state, action) => {
        trackFulfilled(
          state.autoPayoutSummary,
          action.meta.requestId,
          action.payload.data
        );
      })
      .addCase(fetchAutoPayoutSummary.rejected, (state, action) => {
        trackRejected(
          state.autoPayoutSummary,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      });
    // Money mutations invalidate snapshots on success only.
    for (const thunk of [
      approveWithdrawalThunk,
      rejectWithdrawalThunk,
      payWithdrawalThunk,
      sendMoneyThunk,
      approveManualPayoutThunk,
      resolveManualReviewThunk,
    ]) {
      builder.addCase(thunk.fulfilled, (state) => {
        invalidateAll(state);
      });
    }
    const reset = () => ({
      summary: emptyEntry(null),
      withdrawals: {},
      autoPayoutSummary: emptyEntry(null),
    });
    builder.addCase(logout, reset).addCase(sessionExpired, reset);
  },
});

export const { invalidateWallet, resetWallet } = walletSlice.actions;

const EMPTY_WITHDRAWALS = Object.freeze([]);

export const selectWalletSummary = (state) => state.wallet.summary.data;
// Keyed exactly like the thunk's arguments: selectWithdrawals() reads the
// unfiltered entry; selectWithdrawals({ status }) reads that filter's entry.
const defaultWithdrawalsSelector = (state) =>
  state.wallet.withdrawals[withdrawalKeyOf({})]?.data ?? EMPTY_WITHDRAWALS;

export const selectWithdrawals = (params) => {
  if (!params || Object.keys(params).length === 0) return defaultWithdrawalsSelector;
  if ("wallet" in params) return defaultWithdrawalsSelector(params);
  const key = withdrawalKeyOf(params);
  return (state) => state.wallet.withdrawals[key]?.data ?? EMPTY_WITHDRAWALS;
};
export const selectAllWithdrawals = defaultWithdrawalsSelector;
export const selectWithdrawalsStatus = (params = {}) => {
  const key = withdrawalKeyOf(params);
  return (state) => state.wallet.withdrawals[key]?.status || "idle";
};
export const selectAutoPayoutSummary = (state) =>
  state.wallet.autoPayoutSummary.data;

export default walletSlice.reducer;
