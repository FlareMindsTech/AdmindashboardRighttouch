import polygonClipping from "polygon-clipping";
import {
  clipPolygonAgainstZones,
  getZoneId,
  getZonePolygon,
  isPointInRing,
  toMultiPolygonCoordinates,
} from "./zoneGeometry";

export const serializeZonesForGeometry = (zones = []) =>
  (Array.isArray(zones) ? zones : [])
    .map((zone) => {
      const polygon = getZonePolygon(zone);
      if (!polygon) return null;
      return {
        id: getZoneId(zone),
        name: zone.name || zone.zoneCode || "Zone",
        zoneCode: zone.zoneCode || "",
        polygon,
      };
    })
    .filter(Boolean);

export const generateCirclePolygon = (lat, lng, radiusKm = 10, numPoints = 48) => {
  const points = [];
  const kmInDegLat = 1 / 110.574;
  const kmInDegLng = 1 / (111.32 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i += 1) {
    const angle = (i * 360) / numPoints;
    const rad = (angle * Math.PI) / 180;
    const pLat = lat + radiusKm * kmInDegLat * Math.sin(rad);
    const pLng = lng + radiusKm * kmInDegLng * Math.cos(rad);
    points.push([parseFloat(pLng.toFixed(6)), parseFloat(pLat.toFixed(6))]);
  }
  if (points.length > 0) points.push([points[0][0], points[0][1]]);

  return { type: "Polygon", coordinates: [points] };
};

const pickDistrictPiece = (clipped, lng, lat) => {
  if (!clipped?.length) return null;
  if (clipped.length === 1) return clipped[0];
  for (const poly of clipped) {
    if (poly?.[0] && isPointInRing([lng, lat], poly[0])) return poly;
  }
  return clipped[0];
};

export const buildRadiusCandidate = ({
  lat,
  lng,
  radiusKm = 5,
  districtGeometry = null,
  districtRing = null,
  zones = [],
  preferPoint = null,
  requireInsideDistrict = true,
  fallbackToCircle = false,
}) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { outsideDistrict: true, invalidPoint: true };
  }

  if (
    requireInsideDistrict &&
    districtRing &&
    districtRing.length >= 3 &&
    !isPointInRing([lng, lat], districtRing)
  ) {
    return { outsideDistrict: true };
  }

  const baseCircle = generateCirclePolygon(lat, lng, radiusKm, 48);
  let circle = baseCircle;
  let cutToDistrict = false;
  const districtMulti = toMultiPolygonCoordinates(districtGeometry);

  if (districtMulti) {
    try {
      const clipped = polygonClipping.intersection(districtMulti, [baseCircle.coordinates]);
      const bestPoly = pickDistrictPiece(clipped, lng, lat);
      if (bestPoly) {
        circle = { type: "Polygon", coordinates: bestPoly };
        cutToDistrict = true;
      } else if (!fallbackToCircle) {
        return { outsideDistrict: true };
      }
    } catch {
      circle = baseCircle;
      cutToDistrict = false;
    }
  }

  const zoneResult = clipPolygonAgainstZones(circle, zones, {
    preferPoint: preferPoint || [lng, lat],
  });

  return {
    ...zoneResult,
    circle,
    cutToDistrict,
    requestedRadiusKm: radiusKm,
    radiusKm,
  };
};

export const fitRadiusInDistrict = ({
  lat,
  lng,
  radiusKm = 5,
  districtGeometry = null,
  districtRing = null,
  zones = [],
  preferPoint = null,
  requireInsideDistrict = true,
  fallbackToCircle = false,
  maxSteps = 16,
}) => {
  const requestedKm = Number(radiusKm) || 5;
  const basePayload = {
    lat,
    lng,
    districtGeometry,
    districtRing,
    zones,
    preferPoint: preferPoint || [lng, lat],
    requireInsideDistrict,
    fallbackToCircle,
  };

  const primary = buildRadiusCandidate({ ...basePayload, radiusKm: requestedKm });
  if (primary.outsideDistrict) return primary;

  const conflicts = primary.overlappingZones || [];
  const conflictKeys = conflicts.map((zone) => String(zone.id || zone.name));
  const conflictNames = conflicts
    .map((zone) => `"${zone.name}"`)
    .filter(Boolean)
    .join(", ");

  const resultBase = {
    requestedRadiusKm: requestedKm,
    conflictKeys,
    conflictNames,
  };

  if (primary.polygon && primary.compatible) {
    return {
      ...primary,
      ...resultBase,
      radiusKm: requestedKm,
      reduced: false,
    };
  }

  let fallback = primary.polygon ? primary.polygon : null;

  for (let step = 1; step <= maxSteps; step += 1) {
    const nextKm = Number((requestedKm * (1 - step * 0.06)).toFixed(2));
    if (nextKm < 0.4) break;
    const attempt = buildRadiusCandidate({ ...basePayload, radiusKm: nextKm });
    if (attempt.outsideDistrict) break;
    if (attempt.polygon && attempt.compatible) {
      return {
        ...attempt,
        ...resultBase,
        radiusKm: nextKm,
        reduced: true,
      };
    }
    if (!fallback && attempt.polygon) fallback = attempt.polygon;
  }

  return {
    ...primary,
    ...resultBase,
    polygon: null,
    fallbackPolygon: fallback,
    adjusted: true,
    compatible: false,
    radiusKm: requestedKm,
    reduced: true,
  };
};
