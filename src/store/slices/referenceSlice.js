// src/store/slices/referenceSlice.js — Phase 4A: shared reference data.
//
// Resources (independent cache entries — never forced into one entry):
// - categories, keyed by query type ("service" | "product"). The two types
//   are different server datasets (legacy `?categoryType=` param) consumed by
//   different pages, so each type has its own data/timestamp.
// - services (GET /user/getAllServices — identical in legacy + api module).
// - products (GET /user/getproduct — case differs from api/products.js
//   `/user/getProduct`, so the thunk reuses the LEGACY helper that owns the
//   proven URL instead of duplicating or changing it).
//
// Cache policy: reference data changes only through admin mutations, and
// every CRUD page force-refreshes after mutations AND dispatches
// invalidateReference() for the keys it touched. TTL (5 min) therefore only
// skips genuinely redundant re-reads during cross-page navigation.
// Errors never clear last-good data (established Phase 3 pattern).
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategories } from "api/categories";
import { getAllServices } from "api/services";
import { getAllProducts as legacyGetAllProducts } from "views/utils/axiosInstance";
import { logout, sessionExpired } from "./authSlice";
import { dedupedFetch } from "store/requestDedup";

export const REFERENCE_TTL_MS = 5 * 60 * 1000;

const asArray = (raw, keys) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    for (const key of keys) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

// Superset of the unwrapping every consumer performed locally.
export const normalizeCategories = (body) =>
  asArray(body?.result || body?.data || body?.categories || body, [
    "categories",
  ]);
export const normalizeServices = (body) =>
  asArray(body?.result || body?.data || body?.services || body, ["services"]);
export const normalizeProducts = (body) => {
  if (Array.isArray(body)) return body;
  const direct =
    body?.products || body?.data || body?.result || body || [];
  if (Array.isArray(direct)) return direct;
  if (direct && typeof direct === "object") {
    return (
      direct.products ||
      direct.categories ||
      direct.result ||
      direct.data ||
      []
    );
  }
  return [];
};

const emptyEntry = () => ({
  data: [],
  status: "idle",
  error: null,
  requestId: null,
  lastFetchedAt: 0,
});

const initialState = {
  categories: {}, // { [type]: entry }
  services: emptyEntry(),
  products: emptyEntry(),
};

const isFresh = (entry) =>
  entry.data.length > 0 &&
  Date.now() - entry.lastFetchedAt < REFERENCE_TTL_MS;

export const fetchCategories = createAsyncThunk(
  "reference/fetchCategories",
  async ({ categoryType = "product", force = false } = {}, {
    getState,
    rejectWithValue,
  }) => {
    // Dedup lives outside Redux state: checking entry.status here would see
    // this thunk's own pending action under a real store (cold starts would
    // never fetch). See store/requestDedup.js.
    const readEntry = () =>
      getState().reference.categories[categoryType] || emptyEntry();
    try {
      const { list, cached } = await dedupedFetch(`reference:categories:${categoryType}`, {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        run: async () => {
          const { data, error } = await getAllCategories(categoryType);
          if (error) throw new Error(error);
          return normalizeCategories(data);
        },
      });
      return { categoryType, list, cached };
    } catch (err) {
      return rejectWithValue({ categoryType, error: err?.message || "Request failed" });
    }
  }
);

export const fetchServices = createAsyncThunk(
  "reference/fetchServices",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    const readEntry = () => getState().reference.services;
    try {
      const { list, cached } = await dedupedFetch("reference:services", {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        run: async () => {
          const { data, error } = await getAllServices();
          if (error) throw new Error(error);
          return normalizeServices(data);
        },
      });
      return { list, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Request failed");
    }
  }
);

export const fetchProducts = createAsyncThunk(
  "reference/fetchProducts",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    const readEntry = () => getState().reference.products;
    try {
      const { list, cached } = await dedupedFetch("reference:products", {
        force,
        isFresh: () => isFresh(readEntry()),
        getCurrent: () => readEntry().data,
        // Legacy helper owns the proven lowercase URL; it throws on failure.
        run: async () => normalizeProducts(await legacyGetAllProducts()),
      });
      return { list, cached };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to load products");
    }
  }
);

const referenceSlice = createSlice({
  name: "reference",
  initialState,
  reducers: {
    // Called by CRUD pages after successful create/update/delete so other
    // pages refetch. Keys: "categories:<type>" | "services" | "products".
    // Clears freshness only — data stays until the next fetch populates it.
    invalidateReference(state, action) {
      const keys = action.payload?.keys;
      const all = !keys || keys.length === 0;
      const touches = (key) => all || keys.includes(key);
      if (touches("services")) state.services.lastFetchedAt = 0;
      if (touches("products")) state.products.lastFetchedAt = 0;
      Object.keys(state.categories).forEach((type) => {
        if (touches(`categories:${type}`)) {
          state.categories[type].lastFetchedAt = 0;
        }
      });
    },
    resetReference() {
      return {
        categories: {},
        services: emptyEntry(),
        products: emptyEntry(),
      };
    },
  },
  extraReducers: (builder) => {
    const pendingEntry = (entry, requestId) => {
      entry.status = "loading";
      entry.requestId = requestId;
    };
    const failedEntry = (entry, requestId, error) => {
      if (entry.requestId !== requestId) return;
      entry.status = "failed";
      entry.error = error;
    };
    builder
      .addCase(fetchCategories.pending, (state, action) => {
        const type = action.meta.arg?.categoryType || "product";
        if (!state.categories[type]) state.categories[type] = emptyEntry();
        pendingEntry(state.categories[type], action.meta.requestId);
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        const { categoryType, list } = action.payload;
        const entry = state.categories[categoryType] || emptyEntry();
        if (entry.requestId !== action.meta.requestId) return;
        entry.data = list;
        entry.status = "succeeded";
        entry.error = null;
        entry.lastFetchedAt = Date.now();
        state.categories[categoryType] = entry;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        const type = action.meta.arg?.categoryType || "product";
        const entry = state.categories[type];
        if (!entry) return;
        failedEntry(
          entry,
          action.meta.requestId,
          action.payload?.error || action.error?.message
        );
      })
      .addCase(fetchServices.pending, (state, action) => {
        pendingEntry(state.services, action.meta.requestId);
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        if (state.services.requestId !== action.meta.requestId) return;
        state.services.data = action.payload.list;
        state.services.status = "succeeded";
        state.services.error = null;
        state.services.lastFetchedAt = Date.now();
      })
      .addCase(fetchServices.rejected, (state, action) => {
        failedEntry(
          state.services,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(fetchProducts.pending, (state, action) => {
        pendingEntry(state.products, action.meta.requestId);
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.products.requestId !== action.meta.requestId) return;
        state.products.data = action.payload.list;
        state.products.status = "succeeded";
        state.products.error = null;
        state.products.lastFetchedAt = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        failedEntry(
          state.products,
          action.meta.requestId,
          action.payload || action.error?.message
        );
      })
      .addCase(logout, () => ({
        categories: {},
        services: emptyEntry(),
        products: emptyEntry(),
      }))
      .addCase(sessionExpired, () => ({
        categories: {},
        services: emptyEntry(),
        products: emptyEntry(),
      }));
  },
});

export const { invalidateReference, resetReference } = referenceSlice.actions;

// Selectors — pages keep their own sorting/filtering/mapping locally.
const EMPTY_CATEGORIES = Object.freeze([]);

export const selectServiceCategories = (state) =>
  state.reference.categories["service"]?.data || EMPTY_CATEGORIES;
export const selectProductCategories = (state) =>
  state.reference.categories["product"]?.data || EMPTY_CATEGORIES;

const categoriesByTypeSelectors = {
  service: selectServiceCategories,
  product: selectProductCategories,
};

export const selectCategoriesByType = (categoryType = "product") => {
  if (categoriesByTypeSelectors[categoryType]) {
    return categoriesByTypeSelectors[categoryType];
  }
  categoriesByTypeSelectors[categoryType] = (state) =>
    state.reference.categories[categoryType]?.data || EMPTY_CATEGORIES;
  return categoriesByTypeSelectors[categoryType];
};
export const selectCategoriesStatus = (categoryType = "product") => (state) =>
  state.reference.categories[categoryType]?.status || "idle";
export const selectServices = (state) => state.reference.services.data;
export const selectServicesStatus = (state) =>
  state.reference.services.status;
export const selectProducts = (state) => state.reference.products.data;
export const selectProductsStatus = (state) =>
  state.reference.products.status;

export default referenceSlice.reducer;
