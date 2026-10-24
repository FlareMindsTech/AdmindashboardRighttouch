/**
 * Phase 5B — City-Zone interaction safety helpers (pure, dependency-free).
 *
 * Small testable units extracted so F-02A/B/C/D/E/F behaviors are covered
 * without rendering the 6k-line CityZones component or adding test deps:
 * - F-02D: polygon dirty-state model + discard/replace guard + beforeunload.
 * - F-02E: cancellable invalidate-size timer scheduling (DistrictMap pattern).
 * - F-02A: destructive-confirmation gate (cancel = no call, confirm = 1 call).
 * - F-02B: pending-action guard (no duplicate in-flight requests).
 * - F-02C: per-tab pagination + stale-response guard.
 * - F-02F: status-label resolution that never renders missing/failed as healthy.
 */

// ---------- F-02D: polygon draft dirty-state ----------

export const normalizePolygonText = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  try {
    return JSON.stringify(value, null, 2).trim();
  } catch {
    return String(value).trim();
  }
};

/** Dirty when normalized content differs. Clearing a saved draft counts as a change. */
export const isPolygonDraftDirty = (current, saved) =>
  normalizePolygonText(current) !== normalizePolygonText(saved);

/**
 * Returns true when the caller may proceed with a discard/replace.
 * Never prompts when nothing changed. `confirmFn` defaults to
 * `window.confirm` so tests can inject a stub.
 */
export const confirmIfDirty = (dirty, message, confirmFn) => {
  if (!dirty) return true;
  const fn =
    confirmFn ||
    (typeof window !== "undefined" && typeof window.confirm === "function"
      ? (msg) => window.confirm(msg)
      : () => true);
  return fn(message || "You have unsaved polygon changes. Discard them?") === true;
};

export const shouldBlockUnload = (dirty) => dirty === true;

/** Attaches a `beforeunload` guard while `isDirty`; returns a detach fn. */
export const attachBeforeUnload = (isDirty, target) => {
  const scope =
    target ||
    (typeof window !== "undefined" ? window : null);
  if (!scope || typeof scope.addEventListener !== "function") return () => {};
  if (!isDirty) return () => {};
  const handler = (event) => {
    event.preventDefault();
    event.returnValue = "";
    return "";
  };
  scope.addEventListener("beforeunload", handler);
  return () => {
    if (typeof scope.removeEventListener === "function") {
      scope.removeEventListener("beforeunload", handler);
    }
  };
};

// ---------- F-02E: cancellable invalidate timers ----------

/**
 * Schedules `invalidate` after each delay; returns a cleanup that cancels
 * pending timers and prevents post-removal access. Mirrors ZoneMap pattern.
 */
export const scheduleInvalidateTimers = (invalidate, delays = [100, 350]) => {
  const timers = (Array.isArray(delays) ? delays : []).map((ms) =>
    setTimeout(() => {
      if (typeof invalidate === "function") invalidate();
    }, ms)
  );
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    timers.forEach((t) => clearTimeout(t));
  };
};

// ---------- F-02A: destructive-confirmation gate ----------

/**
 * Runs `action` exactly once when `confirmed`, never when cancelled.
 * Returns a result envelope so callers/tests can assert call counts.
 */
export const runConfirmedDestructive = async (confirmed, action) => {
  if (!confirmed) return { proceeded: false, calls: 0, result: null };
  const result = await action();
  return { proceeded: true, calls: 1, result };
};

// ---------- F-02B: pending-action guard ----------

/** Guards an async action so repeated clicks never duplicate in-flight requests. */
export const createPendingGuard = () => {
  let pending = false;
  return {
    isPending: () => pending,
    execute: async (action) => {
      if (pending) return { deduped: true, calls: 0, result: null };
      pending = true;
      try {
        const result = await action();
        return { deduped: false, calls: 1, result };
      } finally {
        pending = false;
      }
    },
  };
};

// ---------- F-02C: pagination + stale-response guard ----------

export const pageForTab = (pageByTab, tab) => {
  const page = pageByTab?.[tab];
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const withPageReset = (pageByTab, tab) => ({
  ...(pageByTab || {}),
  [tab]: 1,
});

export const withPageSet = (pageByTab, tab, page) => ({
  ...(pageByTab || {}),
  [tab]: page,
});

/** Last-issued-wins guard: only the newest fetch may commit its response. */
export const createStaleGuard = () => {
  let latest = 0;
  return {
    issue: () => {
      latest += 1;
      return latest;
    },
    isCurrent: (id) => id === latest,
    latest: () => latest,
  };
};

// ---------- F-02F: honest status labels ----------

/**
 * Resolves a status pill from real server data. Missing/loading/failed data
 * always maps to the unknown label — never to a healthy one.
 */
export const statusLabel = ({
  value,
  loading = false,
  error = null,
  trueLabel = "Active",
  falseLabel = "Inactive",
  unknownLabel = "Unknown",
} = {}) => {
  if (loading || error != null) return { label: unknownLabel, tone: "unknown", healthy: false };
  if (value === true) return { label: trueLabel, tone: "active", healthy: true };
  if (value === false) return { label: falseLabel, tone: "inactive", healthy: false };
  return { label: unknownLabel, tone: "unknown", healthy: false };
};
