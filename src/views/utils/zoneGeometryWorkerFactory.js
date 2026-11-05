export const createZoneGeometryWorker = () =>
  new Worker(new URL("./zoneGeometry.worker.js", import.meta.url));
