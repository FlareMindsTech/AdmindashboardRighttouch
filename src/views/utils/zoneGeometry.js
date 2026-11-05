import polygonClipping from "polygon-clipping";

const EPS = 1e-9;
const STRING_GEOMETRY_CACHE_LIMIT = 300;
const stringGeometryCache = new Map();
const zonePolygonCache = new WeakMap();

const normalizeMultiPolygon = (geometry) => {
  let geom = geometry;
  if (geom?.type === "Feature") geom = geom.geometry;
  if (Array.isArray(geom)) {
    if (Array.isArray(geom[0]?.[0]?.[0])) return geom;
    if (Array.isArray(geom[0]?.[0])) return [geom];
    return null;
  }
  if (!geom || !Array.isArray(geom.coordinates)) return null;
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  return null;
};

export const toMultiPolygonCoordinates = (geometry) => {
  if (!geometry) return null;
  if (typeof geometry === "string") {
    if (stringGeometryCache.has(geometry)) return stringGeometryCache.get(geometry);
    let parsed = null;
    try {
      parsed = JSON.parse(geometry);
    } catch {
      parsed = null;
    }
    const multi = normalizeMultiPolygon(parsed);
    if (stringGeometryCache.size >= STRING_GEOMETRY_CACHE_LIMIT) {
      stringGeometryCache.clear();
    }
    stringGeometryCache.set(geometry, multi);
    return multi;
  }
  return normalizeMultiPolygon(geometry);
};

export const multiPolygonToGeoJSON = (multi) => {
  if (!Array.isArray(multi) || multi.length === 0) return null;
  return multi.length === 1
    ? { type: "Polygon", coordinates: multi[0] }
    : { type: "MultiPolygon", coordinates: multi };
};

export const getZonePolygon = (zone) => {
  if (!zone) return null;
  const cacheable = typeof zone === "object";
  if (cacheable && zonePolygonCache.has(zone)) return zonePolygonCache.get(zone);
  const candidates = [
    zone.polygon,
    zone.boundary,
    zone.geoJson,
    zone.geometry,
    zone.officialBoundary,
    zone.polygonCoordinates,
    zone.coordinates,
  ];
  for (const candidate of candidates) {
    if (toMultiPolygonCoordinates(candidate)) {
      if (cacheable) zonePolygonCache.set(zone, candidate);
      return candidate;
    }
  }
  if (cacheable) zonePolygonCache.set(zone, null);
  return null;
};

export const getZoneId = (zone) => {
  if (!zone) return "";
  return zone._id || zone.zoneId || zone.id || "";
};

export const getZoneDistrictId = (zone) => {
  if (!zone) return "";
  const ref =
    zone.operationalCityId ??
    zone.districtId ??
    zone.operationalCity ??
    zone.district ??
    "";
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  if (typeof ref === "object") return ref._id || ref.districtId || ref.id || "";
  return "";
};

export const filterZonesForDistrict = (zones = [], districtId = "") => {
  if (!Array.isArray(zones) || zones.length === 0) return [];
  if (!districtId) return zones;
  const target = String(districtId);
  return zones.filter((zone) => String(getZoneDistrictId(zone)) === target);
};

const ringArea = (ring) => {
  if (!Array.isArray(ring) || ring.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
};

export const polygonPartArea = (polygonPart) => {
  if (!Array.isArray(polygonPart) || polygonPart.length === 0) return 0;
  return polygonPart.reduce(
    (total, ring, index) => total + (index === 0 ? ringArea(ring) : -ringArea(ring)),
    0
  );
};

export const geometryArea = (geometry) => {
  const multi = toMultiPolygonCoordinates(geometry);
  if (!multi) return 0;
  return multi.reduce((total, part) => total + polygonPartArea(part), 0);
};

export const isPointInRing = (point, ring) => {
  if (!Array.isArray(point) || !Array.isArray(ring) || ring.length < 3) return false;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const pickLargestPolygonPart = (geoJson, preferredPoint = null) => {
  if (!geoJson) return null;
  if (geoJson.type !== "MultiPolygon") return geoJson;
  const parts = geoJson.coordinates || [];
  if (!parts.length) return null;
  if (preferredPoint) {
    for (const part of parts) {
      if (part?.[0] && isPointInRing(preferredPoint, part[0])) {
        return { type: "Polygon", coordinates: part };
      }
    }
  }
  let best = null;
  let bestArea = -Infinity;
  for (const part of parts) {
    const area = polygonPartArea(part);
    if (area > bestArea) {
      bestArea = area;
      best = part;
    }
  }
  return best ? { type: "Polygon", coordinates: best } : null;
};

const outerRingsOf = (polygon) => {
  if (!polygon || !Array.isArray(polygon.coordinates)) return [];
  if (polygon.type === "Polygon") return [polygon.coordinates[0]].filter(Boolean);
  if (polygon.type === "MultiPolygon") return polygon.coordinates.map((p) => p[0]).filter(Boolean);
  return [];
};

const ringBboxCache = new WeakMap();
const multiBboxCache = new WeakMap();
const polygonBboxCache = new WeakMap();

export const bboxOfRing = (ring) => {
  if (!Array.isArray(ring) || ring.length === 0) return null;
  const cached = ringBboxCache.get(ring);
  if (cached) return cached;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const x = point[0];
    const y = point[1];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  const bbox = [minX, minY, maxX, maxY];
  ringBboxCache.set(ring, bbox);
  return bbox;
};

const mergeBbox = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ];
};

export const bboxOfMultiPolygon = (multi) => {
  if (!Array.isArray(multi) || multi.length === 0) return null;
  const cached = multiBboxCache.get(multi);
  if (cached) return cached;
  let bbox = null;
  for (const part of multi) {
    const ringBbox = bboxOfRing(part?.[0]);
    if (ringBbox) bbox = mergeBbox(bbox, ringBbox);
  }
  if (bbox) multiBboxCache.set(multi, bbox);
  return bbox;
};

export const bboxOfPolygon = (polygon) => {
  if (!polygon) return null;
  const cacheable = typeof polygon === "object";
  if (cacheable && polygonBboxCache.has(polygon)) return polygonBboxCache.get(polygon);
  let bbox = null;
  for (const ring of outerRingsOf(polygon)) {
    const ringBbox = bboxOfRing(ring);
    if (ringBbox) bbox = mergeBbox(bbox, ringBbox);
  }
  if (cacheable) polygonBboxCache.set(polygon, bbox);
  return bbox;
};

export const bboxesIntersect = (a, b) =>
  Boolean(a && b && a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]);

const pointOnSegment = (pt, a, b, tolerance = 0) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(pt[0] - a[0], pt[1] - a[1]) <= Math.max(EPS, tolerance);
  }
  const t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / lenSq));
  const projX = a[0] + t * dx;
  const projY = a[1] + t * dy;
  return Math.hypot(pt[0] - projX, pt[1] - projY) <= Math.max(EPS, tolerance);
};

const pointOnRingBoundary = (pt, ring, tolerance = 0) => {
  for (let i = 0; i < ring.length - 1; i++) {
    if (pointOnSegment(pt, ring[i], ring[i + 1], tolerance)) return true;
  }
  return false;
};

const orientation = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

const segmentsProperlyIntersect = (p1, p2, p3, p4) => {
  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);
  return o1 * o2 < 0 && o3 * o4 < 0;
};

const eachEdgePair = (ringA, ringB, fn) => {
  const n = ringA.length - 1;
  const m = ringB.length - 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (fn(ringA[i], ringA[i + 1], ringB[j], ringB[j + 1])) return true;
    }
  }
  return false;
};

const ringsProperlyCross = (ringA, ringB) => eachEdgePair(ringA, ringB, segmentsProperlyIntersect);

/**
 * Mirrors the district/zone overlap rule used by the admin API so a locally
 * trimmed boundary is not rejected after a round-trip. Shared borders and
 * vertices are not overlaps; a point strictly inside another zone is.
 */
export const checkZoneOverlap = (polygonA, polygonB) => {
  const outers1 = outerRingsOf(polygonA);
  const outers2 = outerRingsOf(polygonB);
  if (!outers1.length || !outers2.length) return false;
  if (!bboxesIntersect(bboxOfPolygon(polygonA), bboxOfPolygon(polygonB))) return false;

  const centroid = (ring) => {
    const pts = ring.slice(0, -1);
    if (!pts.length) return null;
    return [
      pts.reduce((s, p) => s + p[0], 0) / pts.length,
      pts.reduce((s, p) => s + p[1], 0) / pts.length,
    ];
  };
  const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  for (const r1 of outers1) {
    for (const r2 of outers2) {
      const c1 = centroid(r1);
      const c2 = centroid(r2);
      if (c1 && isPointInRing(c1, r2) && !pointOnRingBoundary(c1, r2)) return true;
      if (c2 && isPointInRing(c2, r1) && !pointOnRingBoundary(c2, r1)) return true;
      for (const pt of r1) {
        if (isPointInRing(pt, r2) && !pointOnRingBoundary(pt, r2)) return true;
      }
      for (const pt of r2) {
        if (isPointInRing(pt, r1) && !pointOnRingBoundary(pt, r1)) return true;
      }
      if (ringsProperlyCross(r1, r2)) return true;
      for (let i = 0; i < r1.length - 1; i++) {
        const mid = midpoint(r1[i], r1[i + 1]);
        if (isPointInRing(mid, r2) && !pointOnRingBoundary(mid, r2)) return true;
      }
      for (let j = 0; j < r2.length - 1; j++) {
        const mid = midpoint(r2[j], r2[j + 1]);
        if (isPointInRing(mid, r1) && !pointOnRingBoundary(mid, r1)) return true;
      }
    }
  }
  return false;
};

export const geometriesIntersect = (geometryA, geometryB) => {
  const a = toMultiPolygonCoordinates(geometryA);
  const b = toMultiPolygonCoordinates(geometryB);
  if (!a || !b) return false;
  try {
    return polygonClipping.intersection(a, b).length > 0;
  } catch {
    return false;
  }
};

const zoneBlockerCache = new WeakMap();

const getZoneBlocker = (zone) => {
  const cacheable = zone && typeof zone === "object";
  if (cacheable && zoneBlockerCache.has(zone)) return zoneBlockerCache.get(zone);
  const id = getZoneId(zone);
  const multi = toMultiPolygonCoordinates(getZonePolygon(zone));
  const blocker = multi
    ? {
        id,
        name: zone.name || zone.zoneCode || "Zone",
        polygon: multiPolygonToGeoJSON(multi),
        multi,
        bbox: bboxOfMultiPolygon(multi),
      }
    : null;
  if (cacheable) zoneBlockerCache.set(zone, blocker);
  return blocker;
};

/**
 * Cuts away every part of `polygon` that overlaps an existing zone. Returns
 * the largest remaining polygon part (or the part containing `preferPoint`)
 * plus diagnostics the UI can use to highlight conflicting zones.
 */
export const clipPolygonAgainstZones = (polygon, zones = [], options = {}) => {
  const { excludeZoneId = null, preferPoint = null, keepAllParts = false } = options;
  const subject = toMultiPolygonCoordinates(polygon);
  const empty = {
    polygon,
    adjusted: false,
    overlappingZones: [],
    blockers: [],
    compatible: true,
    failed: false,
  };
  if (!subject) return empty;

  const subjectBbox = bboxOfMultiPolygon(subject);
  const blockers = [];
  for (const zone of zones || []) {
    const id = getZoneId(zone);
    if (excludeZoneId && id && String(id) === String(excludeZoneId)) continue;
    const blocker = getZoneBlocker(zone);
    if (!blocker) continue;
    if (subjectBbox && blocker.bbox && !bboxesIntersect(subjectBbox, blocker.bbox)) continue;
    blockers.push(blocker);
  }
  if (!blockers.length) return empty;

  let clipped = subject;
  let clippedBbox = subjectBbox;
  let adjusted = false;
  let failed = false;
  const overlappingZones = [];

  for (const blocker of blockers) {
    if (clippedBbox && blocker.bbox && !bboxesIntersect(clippedBbox, blocker.bbox)) continue;
    let intersects = false;
    try {
      intersects = polygonClipping.intersection(clipped, blocker.multi).length > 0;
    } catch {
      failed = true;
      continue;
    }
    if (!intersects) continue;
    overlappingZones.push(blocker);
    try {
      const difference = polygonClipping.difference(clipped, blocker.multi);
      if (!difference || difference.length === 0) {
        return {
          polygon: null,
          adjusted: true,
          overlappingZones,
          blockers: [blocker],
          compatible: false,
          failed,
        };
      }
      clipped = difference;
      clippedBbox = bboxOfMultiPolygon(clipped);
      adjusted = true;
    } catch {
      failed = true;
    }
  }

  const fullResult = multiPolygonToGeoJSON(clipped);
  let result;
  if (keepAllParts) {
    const parts =
      fullResult?.type === "MultiPolygon"
        ? fullResult.coordinates
        : fullResult?.type === "Polygon"
          ? [fullResult.coordinates]
          : [];
    const compatibleParts = parts.filter((part) => {
      const candidate = { type: "Polygon", coordinates: part };
      return !blockers.some((blocker) => checkZoneOverlap(candidate, blocker.polygon));
    });
    if (compatibleParts.length) {
      result =
        compatibleParts.length === parts.length
          ? fullResult
          : compatibleParts.length === 1
            ? { type: "Polygon", coordinates: compatibleParts[0] }
            : { type: "MultiPolygon", coordinates: compatibleParts };
    } else {
      result = fullResult;
    }
  } else {
    result = pickLargestPolygonPart(fullResult, preferPoint) || fullResult;

    const parts =
      fullResult?.type === "MultiPolygon"
        ? fullResult.coordinates
        : fullResult?.type === "Polygon"
          ? [fullResult.coordinates]
          : [];
    if (parts.length > 1) {
      const compatibleParts = parts.filter((part) => {
        const candidate = { type: "Polygon", coordinates: part };
        return !blockers.some((blocker) => checkZoneOverlap(candidate, blocker.polygon));
      });
      if (compatibleParts.length) {
        const containing = preferPoint
          ? compatibleParts.find((part) => part?.[0] && isPointInRing(preferPoint, part[0]))
          : null;
        const chosen =
          containing ||
          compatibleParts.reduce(
            (best, part) => (polygonPartArea(part) > polygonPartArea(best) ? part : best),
            compatibleParts[0]
          );
        result = { type: "Polygon", coordinates: chosen };
      }
    }
  }

  const resultBbox = bboxOfMultiPolygon(clipped);
  const offending = blockers.filter(
    (blocker) =>
      (!resultBbox || !blocker.bbox || bboxesIntersect(resultBbox, blocker.bbox)) &&
      checkZoneOverlap(result, blocker.polygon)
  );

  return {
    polygon: result,
    adjusted,
    overlappingZones,
    blockers: offending,
    compatible: offending.length === 0,
    failed,
  };
};

export const findZoneByName = (zones = [], name = "") => {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return null;
  return (
    (zones || []).find((zone) => String(zone.name || "").trim().toLowerCase() === target) ||
    (zones || []).find((zone) => String(zone.zoneCode || "").trim().toLowerCase() === target) ||
    null
  );
};
