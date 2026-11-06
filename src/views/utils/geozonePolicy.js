import polygonClipping from "polygon-clipping";
import {
  findTnDistrict,
  findTnDistrictForRecord,
  getTnDistrictBoundary,
} from "../../data/tamilNaduLocations";
import { geometryArea, toMultiPolygonCoordinates } from "./zoneGeometry";

const MIN_OVERLAP_AREA = 1e-9;
const CONTAINMENT_AREA_TOLERANCE = 1e-6;

const districtIdOf = (district) =>
  district?._id || district?.backendRecord?._id || district?.id || "";

export const getDistrictBoundaryGeometry = (district) => {
  if (!district) return null;
  const record = district.backendRecord || district;
  const candidates = [
    record.polygon,
    record.officialBoundary,
    record.geoJson,
    record.boundary,
    district.polygon,
    district.officialBoundary,
  ];
  for (const candidate of candidates) {
    if (toMultiPolygonCoordinates(candidate)) return candidate;
  }
  const tnDistrict =
    findTnDistrictForRecord(record) ||
    findTnDistrict(record.name) ||
    findTnDistrict(record.city);
  return tnDistrict ? getTnDistrictBoundary(tnDistrict.name) : null;
};

export const getDistrictLabel = (district) =>
  district?.name || district?.city || district?.backendRecord?.name || "District";

export const inspectZoneContainment = (zonePolygon, district) => {
  const zoneMulti = toMultiPolygonCoordinates(zonePolygon);
  const districtBoundary = getDistrictBoundaryGeometry(district);
  const districtMulti = toMultiPolygonCoordinates(districtBoundary);
  if (!zoneMulti || !districtMulti) {
    return { checked: false, contained: true, outsideRatio: 0 };
  }
  try {
    const outside = polygonClipping.difference(zoneMulti, districtMulti);
    const zoneArea = geometryArea(zonePolygon);
    const outsideArea = geometryArea(outside);
    const outsideRatio = zoneArea > 0 ? outsideArea / zoneArea : 0;
    return {
      checked: true,
      contained: outsideRatio <= CONTAINMENT_AREA_TOLERANCE,
      outsideRatio,
    };
  } catch {
    return { checked: false, contained: true, outsideRatio: 0 };
  }
};

export const isActiveDistrictRecord = (district) => {
  // UI wrappers carry a merged top-level flag. Prefer it so an optimistic
  // disable is not masked by the stale backendRecord kept for API calls.
  if (typeof district?.active === "boolean") return district.active;
  if (typeof district?.isActive === "boolean") return district.isActive;
  const record = district?.backendRecord || district;
  return (
    Boolean(record) &&
    record.active !== false &&
    record.isActive !== false &&
    String(record.status || "").toUpperCase() !== "INACTIVE"
  );
};

/**
 * District boundaries may share borders, but two operational districts must
 * not cover the same area. Disabled districts still own their boundary, so
 * they participate in the check. Returns the original polygon untouched; a
 * material overlap is a blocking error rather than a silent trim.
 */
export const evaluateDistrictOverlap = (
  polygon,
  existingDistricts = [],
  excludeDistrictId = null
) => {
  const originalArea = geometryArea(polygon);
  const candidates = [];

  for (const district of existingDistricts) {
    const districtId = districtIdOf(district);
    if (
      excludeDistrictId &&
      districtId &&
      String(districtId) === String(excludeDistrictId)
    ) {
      continue;
    }
    const boundary = getDistrictBoundaryGeometry(district);
    const multi = toMultiPolygonCoordinates(boundary);
    if (!multi) continue;
    const tnDistrict = findTnDistrictForRecord(district);
    candidates.push({
      _id: districtId || getDistrictLabel(district),
      name: getDistrictLabel(district),
      tnName: tnDistrict?.name || "",
      polygon: boundary,
      multi,
    });
  }

  const subject = toMultiPolygonCoordinates(polygon);
  const overlappingZones = [];
  let overlappingArea = 0;

  if (subject) {
    for (const candidate of candidates) {
      let intersection = [];
      try {
        intersection = polygonClipping.intersection(subject, candidate.multi);
      } catch {
        continue;
      }
      if (!intersection?.length) continue;
      const area = geometryArea({ type: "MultiPolygon", coordinates: intersection });
      if (area <= MIN_OVERLAP_AREA) continue;
      overlappingZones.push({
        id: candidate._id,
        name: candidate.tnName || candidate.name,
        area,
      });
      overlappingArea += area;
    }
  }

  const conflictNames = [
    ...new Set(overlappingZones.map((blocker) => blocker.name).filter(Boolean)),
  ];
  const coveredArea = originalArea > 0 ? Math.min(originalArea, overlappingArea) : 0;
  const coverageRatio = originalArea > 0 ? (originalArea - coveredArea) / originalArea : 1;

  return {
    polygon,
    adjusted: false,
    overlappingZones,
    blockers: overlappingZones,
    compatible: overlappingZones.length === 0,
    failed: false,
    conflictNames,
    coverageRatio,
    overlapRatio: originalArea > 0 ? coveredArea / originalArea : 0,
    originalArea,
    remainingArea: Math.max(0, originalArea - coveredArea),
  };
};

export const buildDistrictPolygonDecision = (
  polygon,
  existingDistricts = [],
  excludeDistrictId = null,
  tnDistrictName = ""
) => {
  const overlap = evaluateDistrictOverlap(polygon, existingDistricts, excludeDistrictId);
  const conflictNames = overlap.conflictNames || [];
  const existingByTnName = (existingDistricts || []).find((district) => {
    const districtId = districtIdOf(district);
    if (excludeDistrictId && districtId && String(districtId) === String(excludeDistrictId)) {
      return false;
    }
    const configuredTn = findTnDistrictForRecord(district);
    return (
      configuredTn?.name &&
      tnDistrictName &&
      configuredTn.name.toLowerCase() === tnDistrictName.toLowerCase()
    );
  });

  if (existingByTnName) {
    const error = `"${tnDistrictName}" is already configured as "${getDistrictLabel(
      existingByTnName
    )}". Open that operational district to edit its boundary instead of creating a duplicate.`;
    return { finalPolygon: polygon, error, warning: "", conflictNames, isValid: false, message: error };
  }

  if (conflictNames.length > 0) {
    const error = `The ${tnDistrictName || "district"} boundary overlaps ${conflictNames.join(
      ", "
    )}. District borders may share edges, but cannot cover the same area. Move or redraw the boundary.`;
    return { finalPolygon: polygon, error, warning: "", conflictNames, isValid: false, message: error };
  }

  return {
    finalPolygon: polygon,
    error: "",
    warning: "",
    conflictNames: [],
    isValid: true,
    message: `Official Survey of India GeoCode Boundary loaded for ${
      tnDistrictName || "the district"
    }.`,
  };
};

export const resolveDistrictPolygonForSave = (
  polygon,
  existingDistricts = [],
  excludeDistrictId = null,
  tnDistrictName = ""
) => {
  const decision = buildDistrictPolygonDecision(
    polygon,
    existingDistricts,
    excludeDistrictId,
    tnDistrictName
  );
  if (decision.error) throw new Error(decision.error);
  return {
    polygon: decision.finalPolygon,
    adjusted: false,
    warning: "",
    conflictNames: [],
  };
};

export const parseGeozoneApiError = (error) => {
  const payload = error?.response?.data || error?.payload || {};
  const message =
    payload.message ||
    payload.error ||
    error?.message ||
    "Request failed";
  const rawConflicts =
    payload.conflicts ||
    payload.conflictingDistricts ||
    payload.conflictingZones ||
    [];
  const conflicts = Array.isArray(rawConflicts)
    ? rawConflicts
        .map((conflict) =>
          typeof conflict === "string"
            ? conflict
            : conflict?.name ||
              conflict?.zoneName ||
              conflict?.districtName ||
              conflict?.id ||
              ""
        )
        .filter(Boolean)
    : [];
  return {
    message,
    code: payload.code || payload.errorCode || "",
    status: error?.status || error?.response?.status || 0,
    conflicts,
  };
};
