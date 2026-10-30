// src/store/slices/techniciansSlice.js — Phase 5A: technician data.
//
// Scope (evidence-backed):
// - list: shared by AdminManagement (CRUD), CityZones (district assignment),
//   FinanceTracking (technician filter), TechnicianPayouts (send-money
//   dropdown), UserManagement (allocation). Modern api/technicians.js URLs are
//   identical to the legacy helpers for list/byId/training-status/delete, so
//   those reads/mutations use the modern module.
// - kycRecords + kycDetail: AdminManagement only. The legacy helpers OWN the
//   endpoint fallback order (/technician/kyc... with /admin/kyc... fallback,
//   404→null for missing KYC) which the modern module does NOT replicate, so
//   KYC/bank thunks reuse the LEGACY helpers — fallback order preserved
//   exactly. No URL duplication: thunks delegate, never re-implement.
// - PII unmasking (getKYCFullPII, audit-logged) intentionally stays
//   page-local: sensitive identity numbers must not sit in a long-lived
//   store. getTechnicianJobHistory/getTechnicianById have no page consumers
//   and are NOT modeled (no placeholder code).
//
// Policy: reads TTL-cached (list 2 min, KYC 60s); all mutations pessimistic
// (no optimistic KYC/bank updates) and invalidate list + KYC caches. Detail
// fetches are forced (same as today — the modal always re-reads).
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllTechnicians,
  updateTechnicianTraining,
  updateTechnicianStatus,
  deleteTechnician,
} from "api/technicians";
import {
  getAllKYCRecords,
  getTechnicianKYC,
  verifyKYC as legacyVerifyKYC,
  verifyBankDetails as legacyVerifyBankDetails,
  adminEditKYCDetails as legacyAdminEditKYCDetails,
  adminEditBankDetails as legacyAdminEditBankDetails,
  deleteKYC as legacyDeleteKYC,
} from "views/utils/axiosInstance";
import { logout, sessionExpired } from "./authSlice";
import { dedupedFetch } from "store/requestDedup";

export const TECHNICIANS_TTL_MS = 2 * 60 * 1000;
export const KYC_TTL_MS = 60 * 1000;

const asArray = (raw, keys) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    for (const key of keys) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

// Superset of AdminManagement's list unwrapping (result/data.admins/data/
// admins/body). Technician entries keep their full server shape — name
// resolution stays in pages.
export const normalizeTechnicians = (body) =>
  asArray(
    body?.result || body?.data?.admins || body?.data || body?.admins || body,
    ["admins", "technicians"]
  );
// getAllKYCRecords resolves to [] on backend gaps (legacy swallows to empty).
export const normalizeKYCRecords = (body) =>
  asArray(body?.result || body?.data || body, ["records", "kyc"]);
// Modal detail: legacy resolves {result,data} or null (404 → null record).
export const normalizeKYCDetail = (body) => {
  if (!body) return null;
  return body?.result ?? body?.data ?? body;
};

const emptyEntry = () => ({
  data: [],
  status: "idle",
  error: null,
  requestId: null,
  lastFetchedAt: 0,
});

const initialState = {
  list: emptyEntry(),
  kycRecords: emptyEntry(),
  kycDetail: {}, // { [technicianId]: { data, status, error, requestId } }
};

const isFresh = (entry, ttl) =>
  entry.data.length > 0 && Date.now() - entry.lastFetchedAt < ttl;

// --- Reads ---

export const fetchTechnicians = createAsyncThunk(
  "technicians/fetchTechnicians",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    // Dedup outside Redux state (see store/requestDedup.js).
    const readEntry = () => getState().technicians.list;
    try {
      const { list, cached } = await dedupedFetch("technicians:list", {
        force,
        isFresh: () => isFresh(readEntry(), TECHNICIANS_TTL_MS),
        getCurrent: () => readEntry().data,
        run: async () => {
          const { data, error } = await getAllTechnicians();
          if (error) throw new Error(error);
          return normalizeTechnicians(data);
        },
      });
      return { list, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  }
);

export const fetchKYCRecords = createAsyncThunk(
  "technicians/fetchKYCRecords",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    const readEntry = () => getState().technicians.kycRecords;
    try {
      const { list, cached } = await dedupedFetch("technicians:kycRecords", {
        force,
        isFresh: () => isFresh(readEntry(), KYC_TTL_MS),
        getCurrent: () => readEntry().data,
        run: async () => normalizeKYCRecords(await getAllKYCRecords()),
      });
      return { list, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to load KYC records");
    }
  }
);

export const fetchKYCDetail = createAsyncThunk(
  "technicians/fetchKYCDetail",
  async (technicianId, { rejectWithValue }) => {
    try {
      const body = await getTechnicianKYC(technicianId);
      return { technicianId, detail: normalizeKYCDetail(body) };
    } catch (err) {
      return rejectWithValue({ technicianId, error: err?.message || "KYC fetch failed" });
    }
  }
);

// --- Mutations (all pessimistic; invalidate on success) ---

const mutationThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      const result = await fn(arg);
      return { arg, result };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  });

// Modern module (URL-identical to legacy): training toggle + work status.
export const setTrainingStatus = mutationThunk(
  "technicians/setTrainingStatus",
  ({ id, completed }) => updateTechnicianTraining(id, completed)
);
export const setWorkStatus = mutationThunk(
  "technicians/setWorkStatus",
  (body) => updateTechnicianStatus(body)
);
export const removeTechnician = mutationThunk(
  "technicians/removeTechnician",
  ({ id }) => deleteTechnician(id)
);
// Legacy helpers (fallback order preserved): KYC + bank + admin records.
export const verifyTechnicianKYC = mutationThunk(
  "technicians/verifyTechnicianKYC",
  (payload) => legacyVerifyKYC(payload)
);
export const editTechnicianKYC = mutationThunk(
  "technicians/editTechnicianKYC",
  ({ id, body }) => legacyAdminEditKYCDetails(id, body)
);
export const verifyTechnicianBank = mutationThunk(
  "technicians/verifyTechnicianBank",
  (payload) => legacyVerifyBankDetails(payload)
);
export const editTechnicianBank = mutationThunk(
  "technicians/editTechnicianBank",
  ({ id, body }) => legacyAdminEditBankDetails(id, body)
);
export const removeKYC = mutationThunk(
  "technicians/removeKYC",
  ({ id }) => legacyDeleteKYC(id)
);

const techniciansSlice = createSlice({
  name: "technicians",
  initialState,
  reducers: {
    invalidateTechnicians(state, action) {
      const keys = action.payload?.keys;
      const all = !keys || keys.length === 0;
      if (all || keys.includes("list")) state.list.lastFetchedAt = 0;
      if (all || keys.includes("kycRecords")) state.kycRecords.lastFetchedAt = 0;
      if (all || keys.includes("kycDetail")) state.kycDetail = {};
    },
    resetTechnicians() {
      return { list: emptyEntry(), kycRecords: emptyEntry(), kycDetail: {} };
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
    const trackFulfilledList = (entry, requestId, list) => {
      if (entry.requestId !== requestId) return;
      entry.data = list;
      entry.status = "succeeded";
      entry.error = null;
      entry.lastFetchedAt = Date.now();
    };
    const invalidateAll = (state) => {
      state.list.lastFetchedAt = 0;
      state.kycRecords.lastFetchedAt = 0;
      state.kycDetail = {};
    };
    const mutationDone = (state, action, ok) => {
      if (action.meta.requestId && ok) invalidateAll(state);
    };
    builder
      .addCase(fetchTechnicians.pending, (state, action) => {
        trackPending(state.list, action.meta.requestId);
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        trackFulfilledList(state.list, action.meta.requestId, action.payload.list);
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        trackRejected(
          state.list,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(fetchKYCRecords.pending, (state, action) => {
        trackPending(state.kycRecords, action.meta.requestId);
      })
      .addCase(fetchKYCRecords.fulfilled, (state, action) => {
        trackFulfilledList(
          state.kycRecords,
          action.meta.requestId,
          action.payload.list
        );
      })
      .addCase(fetchKYCRecords.rejected, (state, action) => {
        trackRejected(
          state.kycRecords,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(fetchKYCDetail.pending, (state, action) => {
        const id = action.meta.arg;
        state.kycDetail[id] = {
          data: state.kycDetail[id]?.data ?? null,
          status: "loading",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchKYCDetail.fulfilled, (state, action) => {
        const { technicianId, detail } = action.payload;
        const slot = state.kycDetail[technicianId];
        if (!slot || slot.requestId !== action.meta.requestId) return;
        state.kycDetail[technicianId] = {
          data: detail,
          status: "succeeded",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchKYCDetail.rejected, (state, action) => {
        const id = action.payload?.technicianId ?? action.meta.arg;
        const slot = state.kycDetail[id];
        if (!slot || slot.requestId !== action.meta.requestId) return;
        state.kycDetail[id] = {
          data: null,
          status: "failed",
          error: action.payload?.error || action.error?.message,
          requestId: action.meta.requestId,
        };
      });
    // All mutations invalidate on success only (failure keeps caches).
    for (const thunk of [
      setTrainingStatus,
      setWorkStatus,
      verifyTechnicianKYC,
      editTechnicianKYC,
      verifyTechnicianBank,
      editTechnicianBank,
      removeTechnician,
      removeKYC,
    ]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        mutationDone(state, action, true);
      });
    }
    builder
      .addCase(logout, () => ({
        list: emptyEntry(),
        kycRecords: emptyEntry(),
        kycDetail: {},
      }))
      .addCase(sessionExpired, () => ({
        list: emptyEntry(),
        kycRecords: emptyEntry(),
        kycDetail: {},
      }));
  },
});

export const { invalidateTechnicians, resetTechnicians } =
  techniciansSlice.actions;

export const selectTechnicians = (state) => state.technicians.list.data;
export const selectTechniciansStatus = (state) =>
  state.technicians.list.status;
export const selectKYCRecords = (state) => state.technicians.kycRecords.data;
export const selectKYCRecordsStatus = (state) =>
  state.technicians.kycRecords.status;
const kycDetailSelectors = new Map();
export const selectKYCDetail = (technicianId) => {
  const idStr = String(technicianId || "");
  let sel = kycDetailSelectors.get(idStr);
  if (!sel) {
    sel = (state) => state.technicians.kycDetail[idStr]?.data ?? null;
    kycDetailSelectors.set(idStr, sel);
  }
  return sel;
};

const kycDetailStatusSelectors = new Map();
export const selectKYCDetailStatus = (technicianId) => {
  const idStr = String(technicianId || "");
  let sel = kycDetailStatusSelectors.get(idStr);
  if (!sel) {
    sel = (state) => state.technicians.kycDetail[idStr]?.status || "idle";
    kycDetailStatusSelectors.set(idStr, sel);
  }
  return sel;
};

export default techniciansSlice.reducer;
