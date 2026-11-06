import polygonClipping from "polygon-clipping";
import {
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

  // Zone-to-zone overlap is allowed inside a district. Only the district
  // boundary clips a zone; sibling zones are never subtracted here.
  return {
    polygon: circle,
    adjusted: cutToDistrict,
    overlappingZones: [],
    blockers: [],
    compatible: true,
    failed: false,
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
  requireInsideDistrict = true,
  fallbackToCircle = false,
}) => {
  const requestedKm = Number(radiusKm) || 5;
  const primary = buildRadiusCandidate({
    lat,
    lng,
    districtGeometry,
    districtRing,
    requireInsideDistrict,
    fallbackToCircle,
    radiusKm: requestedKm,
  });

  if (primary.outsideDistrict) return primary;

  return {
    ...primary,
    requestedRadiusKm: requestedKm,
    conflictKeys: [],
    conflictNames: "",
    radiusKm: requestedKm,
    reduced: false,
  };
};
