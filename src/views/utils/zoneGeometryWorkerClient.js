let workerPromise = null;
let requestSequence = 0;
const pendingRequests = new Map();

const rejectPending = (error) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests.clear();
};

const loadWorker = async () => {
  if (typeof Worker === "undefined" || typeof URL === "undefined") return null;
  if (!workerPromise) {
    workerPromise = import("./zoneGeometryWorkerFactory")
      .then(({ createZoneGeometryWorker }) => createZoneGeometryWorker())
      .then((worker) => {
        worker.onmessage = (event) => {
          const { id, ok, result, error } = event.data || {};
          const request = pendingRequests.get(id);
          if (!request) return;
          pendingRequests.delete(id);
          if (ok) request.resolve(result);
          else request.reject(new Error(error || "Geometry worker failed"));
        };
        worker.onerror = (event) => {
          const error = new Error(event?.message || "Geometry worker crashed");
          rejectPending(error);
          workerPromise = null;
          try {
            worker.terminate();
          } catch {
            /* ignore */
          }
        };
        return worker;
      })
      .catch(() => {
        workerPromise = null;
        return null;
      });
  }
  return workerPromise;
};

export const isGeometryWorkerSupported = () =>
  typeof Worker !== "undefined" && typeof URL !== "undefined";

export const runGeometryTask = async (type, payload) => {
  const worker = await loadWorker();
  if (!worker) return null;

  return new Promise((resolve, reject) => {
    const id = ++requestSequence;
    pendingRequests.set(id, { resolve, reject });
    try {
      worker.postMessage({ id, type, payload });
    } catch (error) {
      pendingRequests.delete(id);
      reject(error);
    }
  });
};
