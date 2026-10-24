// src/store/requestDedup.js — shared in-flight deduplication for thunks.
//
// Background: several slices originally deduped with
// `if (entry.status === "loading") return cached` INSIDE the payload creator.
// Under a real store that check always sees the thunk's OWN pending action
// (RTK dispatches pending before running the payload creator), so cold
// starts returned empty cached data and never fetched. Unit tests missed it
// because they invoke thunks with a hand-built idle state.
//
// This module tracks in-flight requests OUTSIDE Redux state, so the check is
// immune to the pending action. Freshness (TTL) is still read from state.
const inflight = new Map();

export const clearInflightForTests = () => inflight.clear();

/**
 * @param {string} key stable per resource+params (e.g. "categories:service")
 * @param {object} opts { force, isFresh: () => bool, getCurrent: () => list,
 *   run: () => Promise<list> (throws/rejects with the API error) }
 * @returns {Promise<{list: Array, cached: boolean}>}
 */
export const dedupedFetch = async (key, { force, isFresh, getCurrent, run }) => {
  if (!force && isFresh()) {
    return { list: getCurrent(), cached: true };
  }
  if (!force && inflight.has(key)) {
    // Share the running request's OUTCOME (not a state re-read: the owner's
    // fulfilled action may not be reduced yet when we resume). On failure,
    // fall through and retry ourselves instead of trusting empty data.
    const shared = await inflight.get(key);
    if (shared.ok) {
      return { list: shared.list, cached: true };
    }
  }
  const runPromise = (async () => {
    try {
      return { ok: true, list: await run() };
    } catch (err) {
      return { ok: false, error: err };
    }
  })();
  inflight.set(key, runPromise);
  try {
    const res = await runPromise;
    if (!res.ok) throw res.error;
    return { list: res.list, cached: false };
  } finally {
    if (inflight.get(key) === runPromise) inflight.delete(key);
  }
};

export default dedupedFetch;
