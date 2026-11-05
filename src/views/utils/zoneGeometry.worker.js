/* eslint-disable no-restricted-globals */
import { fitRadiusInDistrict } from "./zoneGeometryOperations";

self.onmessage = (event) => {
  const { id, type, payload } = event.data || {};
  try {
    if (type === "fitRadius") {
      const result = fitRadiusInDistrict(payload || {});
      self.postMessage({ id, ok: true, result });
      return;
    }
    throw new Error(`Unknown geometry task: ${type}`);
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error?.message || "Geometry worker failed",
    });
  }
};
