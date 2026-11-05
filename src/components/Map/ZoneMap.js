import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Icon,
  IconButton,
  Select,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { MdClear, MdContentCopy, MdCropSquare, MdGpsFixed, MdLocationOn, MdMap, MdRadar, MdSearch } from "react-icons/md";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_LOOKUP, TAMIL_NADU_CITIES, calculatePolygonCentroid, generateCircularGeoJSON } from "./DistrictMap.js";
import { detectParentDistrict, findTnDistrict, getTnDistrictBoundary, getDistrictCities, TAMIL_NADU_DISTRICTS, formatCleanCityName } from "../../data/tamilNaduLocations";
import { computePlusCode, isPointInPolygon, getSubzonesByDistrict, TAMIL_NADU_SUBZONES } from "../../data/tamilNaduDistrictsData";
import polygonClipping from "polygon-clipping";
import {
  clipPolygonAgainstZones,
  filterZonesForDistrict,
  getZoneId,
} from "../../views/utils/zoneGeometry";
import {
  fitRadiusInDistrict,
  serializeZonesForGeometry,
} from "../../views/utils/zoneGeometryOperations";
import {
  isGeometryWorkerSupported,
  runGeometryTask,
} from "../../views/utils/zoneGeometryWorkerClient";

if (L?.Canvas?.prototype && !L.Canvas.prototype._safeRedrawPatched) {
  const originalRedraw = L.Canvas.prototype._redraw;
  L.Canvas.prototype._redraw = function safeCanvasRedraw() {
    if (!this._ctx || !this._map || !this._container) {
      this._redrawRequest = null;
      return;
    }
    return originalRedraw.call(this);
  };
  L.Canvas.prototype._safeRedrawPatched = true;
}

export const ZONE_COLOR_PALETTE = [
  { border: "#059669", fill: "#10b981", name: "Emerald Green" },
  { border: "#10b981", fill: "#34d399", name: "Mint Green" },
  { border: "#0d9488", fill: "#14b8a6", name: "Teal Green" },
  { border: "#16a34a", fill: "#22c55e", name: "Forest Green" },
  { border: "#047857", fill: "#059669", name: "Deep Emerald" },
  { border: "#15803d", fill: "#4ade80", name: "Bright Green" },
  { border: "#0f766e", fill: "#2dd4bf", name: "Cyan Teal" },
  { border: "#65a30d", fill: "#84cc16", name: "Lime Green" },
  { border: "#0284c7", fill: "#38bdf8", name: "Sky Green" },
  { border: "#065f46", fill: "#10b981", name: "Classic Green" },
];

export const TN_BOUNDS = [
  [8.06, 76.18],
  [13.52, 80.34],
];

export const TN_MAX_BOUNDS = [
  [7.2, 75.0],
  [14.2, 81.5],
];

let cachedBuiltinTnFeatures = null;

export function getBuiltinTnFeatures() {
  if (cachedBuiltinTnFeatures) return cachedBuiltinTnFeatures;
  cachedBuiltinTnFeatures = TAMIL_NADU_DISTRICTS.map((d) => {
    const boundary = getTnDistrictBoundary(d.name) || generateCircularGeoJSON(d.lat, d.lng, 15);
    return {
      type: "Feature",
      id: d.code || d.name,
      properties: {
        district: d.name,
        name: d.name,
        code: d.code,
        dtcode: d.dtcode,
        center: d.center || [d.lat, d.lng],
      },
      geometry: boundary,
    };
  });
  return cachedBuiltinTnFeatures;
}

/**
 * ZoneMap — production-level geofence editor/viewer (Leaflet core only, no extra deps).
 *
 * Props (superset of DistrictMap so it can replace it):
 *  polygonCoordinates: string | object (GeoJSON Polygon) — the editable boundary
 *  onPolygonChange(geoJsonString) — emitted on draw / edit / radius / clear
 *  onValidationChange({valid, reason, pointCount, areaKm2}) — optional
 *  mode: "radius" | "polygon" | "view" — radius: click sets center+circle; polygon: vertex drawing; view: read-only
 *  interactive, readOnly, height, cityName, districtName
 *  districts, allDistricts, zones, allZones, technicians, customers
 *  selectedDistrictId, selectedZoneId, onSelectZone / onZoneSelect
 *  showToolbar, allowRadiusSelect, showSearch, showDrawTools, radiusKm, onRadiusChange
 */
export function parsePolygonProp(input) {
  if (!input) return null;
  try {
    const parsed = typeof input === "object" ? input : JSON.parse(String(input));
    if (parsed && parsed.type === "Polygon" && Array.isArray(parsed.coordinates) && Array.isArray(parsed.coordinates[0])) {
      return parsed;
    }
    if (Array.isArray(parsed)) {
      const coords = Array.isArray(parsed[0]?.[0]) ? parsed : [parsed];
      return { type: "Polygon", coordinates: coords };
    }
    return null;
  } catch {
    return null;
  }
}

export function validatePolygonGeoJSON(poly) {
  if (!poly) return { valid: false, reason: "No boundary", pointCount: 0, areaKm2: 0 };
  const ring = poly.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    return { valid: false, reason: `Need ≥3 vertices (${Math.max(0, ring?.length || 0)}/4 points)`, pointCount: ring?.length || 0, areaKm2: 0 };
  }
  for (const [lng, lat] of ring) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return { valid: false, reason: "Non-numeric position", pointCount: ring.length, areaKm2: 0 };
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return { valid: false, reason: `Out of range [${lng}, ${lat}]`, pointCount: ring.length, areaKm2: 0 };
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return { valid: false, reason: "Ring not closed (first ≠ last)", pointCount: ring.length, areaKm2: 0 };
  }
  // Shoelace approx in km² (equirectangular around centroid)
  const lats = ring.map((p) => p[1]);
  const meanLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const kx = 111.32 * Math.cos((meanLat * Math.PI) / 180);
  const ky = 110.574;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * kx * ring[i + 1][1] * ky - ring[i + 1][0] * kx * ring[i][1] * ky;
  }
  const areaKm2 = Math.abs(area / 2);
  if (areaKm2 < 0.01) return { valid: false, reason: "Area too small (<0.01 km²)", pointCount: ring.length, areaKm2 };
  if (areaKm2 > 50000) return { valid: false, reason: "Area unrealistically large", pointCount: ring.length, areaKm2 };
  return { valid: true, reason: `${ring.length - 1} vertices • ${areaKm2.toFixed(2)} km²`, pointCount: ring.length, areaKm2 };
}

const vertexIcon = (active) =>
  L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${active ? "#008080" : "#fff"};border:2.5px solid #008080;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const techIcon = (online, label) =>
  L.divIcon({
    html: `<div style="background:${online ? "#10B981" : "#6B7280"};color:#fff;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;border:1px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);white-space:nowrap;">🔧 ${label}</div>`,
    className: "",
    iconSize: [60, 22],
    iconAnchor: [30, 11],
  });

const customerIcon = () =>
  L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:#F59E0B;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

const centerIcon = (title) =>
  L.divIcon({
    html: `<div title="${title}" style="width:30px;height:30px;border-radius:50%;background:#0F766E;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(15,118,110,.5);"><div style="width:12px;height:12px;border-radius:50%;background:#fff;border:2.5px solid #E11D48;"></div></div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

/**
 * Finds the closest point on a polygon perimeter ring to an exterior point pt [lng, lat]
 */
export function getClosestPointOnRing(pt, ring) {
  if (!ring || ring.length < 2) return pt;
  let minDistSq = Infinity;
  let closest = [pt[0], pt[1]];
  const px = pt[0], py = pt[1];

  for (let i = 0; i < ring.length - 1; i++) {
    const ax = ring[i][0], ay = ring[i][1];
    const bx = ring[i + 1][0], by = ring[i + 1][1];
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) continue;

    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const qx = ax + t * dx;
    const qy = ay + t * dy;
    const distSq = (px - qx) * (px - qx) + (py - qy) * (py - qy);

    if (distSq < minDistSq) {
      minDistSq = distSq;
      closest = [qx, qy];
    }
  }
  return closest;
}

// Global module-level cache for zero-latency instant GeoJSON loading
let cachedTnFeatures = null;
let tnFeaturesFetchPromise = null;
const NO_DISTRICT_CONFLICTS = [];

export default function ZoneMap({
  cityName = "",
  cityOptions = null,
  districtName = "",
  selectedDistrictName = "",
  polygonCoordinates = "",
  onPolygonChange,
  onValidationChange,
  onCitySelect,
  height = "380px",
  interactive = true,
  readOnly = false,
  mode: modeProp,
  districts = [],
  allDistricts = [],
  zones = [],
  allZones = [],
  selectedDistrictId = null,
  selectedZoneId = null,
  conflictDistrictNames = NO_DISTRICT_CONFLICTS,
  onSelectDistrict,
  onSelectSubzone,
  onSelectZone,
  onZoneSelect,
  technicians = [],
  customers = [],
  layerToggles,
  allowRadiusSelect = true,
  showToolbar = true,
  showSearch = true,
  showDrawTools = true,
  showNavControls = true,
  selectedCityName = "",
  radiusKm = 10,
  onRadiusChange,
  onlyTamilNadu = true,
  parentDistrictActive = true,
  basemap = "osm", // "osm" | "vector"
  viewMode = "auto", // "auto" | "state" (full TN map) | "district" (per-district map)
}) {
  const mode = modeProp || (readOnly || interactive === false ? "view" : "radius");
  const editable = interactive && !readOnly && mode !== "view" && parentDistrictActive !== false;

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const mapAliveRef = useRef(false);
  const userInteractedRef = useRef(false);
  const didInitialFitRef = useRef(false);
  const groups = useRef({});
  const vertexMarkers = useRef([]);

  const effectiveDistricts = useMemo(
    () => (Array.isArray(districts) && districts.length ? districts : Array.isArray(allDistricts) ? allDistricts : []),
    [districts, allDistricts]
  );
  const districtOptions = useMemo(() => {
    if (viewMode === "state" || onlyTamilNadu) {
      return TAMIL_NADU_DISTRICTS;
    }
    if (Array.isArray(allDistricts) && allDistricts.length >= 38) {
      return allDistricts;
    }
    if (Array.isArray(districts) && districts.length > 0) {
      return districts.map((d) => ({
        name: d.name || d.city,
        code: d.code || "TN",
      }));
    }
    return TAMIL_NADU_DISTRICTS;
  }, [districts, allDistricts, viewMode, onlyTamilNadu]);
  const effectiveZones = useMemo(
    () => (Array.isArray(zones) && zones.length ? zones : Array.isArray(allZones) ? allZones : []),
    [zones, allZones]
  );
  const zoneBlockers = useMemo(() => {
    const scoped = selectedDistrictId
      ? filterZonesForDistrict(effectiveZones, selectedDistrictId)
      : effectiveZones;
    return scoped.filter(
      (zone) => !selectedZoneId || String(getZoneId(zone)) !== String(selectedZoneId)
    );
  }, [effectiveZones, selectedDistrictId, selectedZoneId]);
  const presetCities = useMemo(
    () =>
      Array.isArray(cityOptions) && cityOptions.length
        ? cityOptions
        : TAMIL_NADU_CITIES,
    [cityOptions]
  );
  const cappedZones = useMemo(() => effectiveZones.slice(0, 300), [effectiveZones]);
  const zoneOverflow = effectiveZones.length - cappedZones.length;
  const selectZone = onSelectZone || onZoneSelect;

  const tileLayerRef = useRef(null);
  const [center, setCenter] = useState(null);
  const [radius, setRadius] = useState(radiusKm || 10);
  const [drawMode, setDrawMode] = useState(mode === "polygon");
  const [draftPoints, setDraftPoints] = useState([]); // [lat,lng][]
  const [conflictZoneKeys, setConflictZoneKeys] = useState([]);
  const [status, setStatus] = useState("");
  const [mapGeocode, setMapGeocode] = useState(null);
  const [tileFallback, setTileFallback] = useState(false);
  const [selectedTnDistrict, setSelectedTnDistrict] = useState(() => {
    if (viewMode === "state") return "";
    const init = (selectedDistrictName || districtName || "").trim();
    if (init.toLowerCase() === "tamil nadu") return "";
    return init;
  });
  const [tnFeatures, setTnFeatures] = useState(() => cachedTnFeatures || getBuiltinTnFeatures());

  // Canonical active district name & official boundary feature
  const canonicalActiveDistrict = useMemo(() => {
    const raw = (selectedTnDistrict || selectedDistrictName || districtName || "").trim();
    if (!raw || raw.toLowerCase() === "tamil nadu") return "";
    const found = findTnDistrict(raw);
    return found?.name || raw;
  }, [selectedTnDistrict, selectedDistrictName, districtName]);

  const activeDistrictFeature = useMemo(() => {
    if (!canonicalActiveDistrict || !Array.isArray(tnFeatures)) return null;
    const lower = canonicalActiveDistrict.toLowerCase();
    return (
      tnFeatures.find((f) => {
        const dName = (f.properties?.district || f.properties?.name || "").toLowerCase();
        const dCode = (f.properties?.code || f.properties?.dtcode || "").toLowerCase();
        return dName === lower || dCode === lower || lower.includes(dName) || dName.includes(lower);
      }) || null
    );
  }, [canonicalActiveDistrict, tnFeatures]);

  const activeDistrictRing = useMemo(() => {
    if (!activeDistrictFeature?.geometry?.coordinates) return null;
    const geom = activeDistrictFeature.geometry;
    if (geom.type === "Polygon") {
      return geom.coordinates[0];
    }
    if (geom.type === "MultiPolygon") {
      let largest = null;
      let maxLen = 0;
      for (const poly of geom.coordinates) {
        if (poly[0] && poly[0].length > maxLen) {
          maxLen = poly[0].length;
          largest = poly[0];
        }
      }
      return largest;
    }
    return null;
  }, [activeDistrictFeature]);

  // Inject sleek dark vector canvas and district pill label styling globally
  useEffect(() => {
    const styleId = "zonemap-custom-vector-styles";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.innerHTML = `
        .leaflet-container {
          background-color: #080d19 !important;
        }
        .city-pill-wrapper, .district-badge-container {
          background: transparent !important;
          border: none !important;
        }
        .city-pill {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: translate(-50%, -50%) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          white-space: nowrap !important;
          padding: 4px 12px !important;
          border-radius: 9999px !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          user-select: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease !important;
        }
        .city-pill.is-active {
          background: rgba(16, 185, 129, 0.95) !important;
          color: #ffffff !important;
          border: 1.5px solid #34d399 !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45) !important;
        }
        .city-pill.is-available {
          background: rgba(15, 23, 42, 0.94) !important;
          color: #38bdf8 !important;
          border: 1.5px solid #0ea5e9 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55) !important;
        }
        .city-pill:hover {
          transform: translate(-50%, -50%) scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.75) !important;
          z-index: 1000 !important;
        }
        .city-pill.is-available:hover {
          background: rgba(14, 165, 233, 0.95) !important;
          color: #ffffff !important;
          border-color: #38bdf8 !important;
        }
        .city-pill-icon {
          font-size: 11px !important;
          line-height: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
        }
        .city-pill-text {
          line-height: 1.2 !important;
          letter-spacing: 0.02em !important;
        }
        .district-name-badge {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: translate(-50%, -50%) !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          pointer-events: none !important;
          white-space: nowrap !important;
          text-align: center !important;
          border-radius: 6px !important;
          padding: 2px 7px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        }
        .district-name-badge.default {
          color: #94a3b8 !important;
          background: rgba(15, 23, 42, 0.75) !important;
          border: 1px solid rgba(148, 163, 184, 0.25) !important;
        }
        .district-name-badge.operational {
          color: #6ee7b7 !important;
          font-weight: 700 !important;
          background: rgba(6, 78, 59, 0.88) !important;
          border: 1px solid rgba(52, 211, 153, 0.7) !important;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5) !important;
        }
        .district-name-badge.active-selected {
          color: #ffffff !important;
          font-weight: 700 !important;
          background: rgba(5, 150, 105, 0.95) !important;
          border: 1.5px solid #34d399 !important;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.65) !important;
        }
        .custom-zone-tooltip {
          background: rgba(15, 23, 42, 0.96) !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
          color: #f8fafc !important;
          padding: 6px 10px !important;
        }
        .custom-zone-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.96) !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "state") {
      const raw = selectedDistrictName && selectedDistrictName.toLowerCase() !== "tamil nadu" ? selectedDistrictName : "";
      setSelectedTnDistrict(raw);
      return;
    }
    const raw = selectedDistrictName || (districtName && districtName.toLowerCase() !== "tamil nadu" ? districtName : "");
    if (raw) {
      setSelectedTnDistrict(raw);
    }
  }, [selectedDistrictName, districtName, viewMode]);

  // Load official Survey of India boundary GeoJSON from public/tamilnadu_districts.geojson (cached)
  useEffect(() => {
    let isMounted = true;
    if (cachedTnFeatures && cachedTnFeatures.length) {
      setTnFeatures(cachedTnFeatures);
      return;
    }
    if (!tnFeaturesFetchPromise) {
      const url = `${process.env.PUBLIC_URL || ""}/tamilnadu_districts.geojson`;
      tnFeaturesFetchPromise = fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Could not load /tamilnadu_districts.geojson");
          return res.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.features) && data.features.length) {
            cachedTnFeatures = data.features;
            return data.features;
          }
          return [];
        })
        .catch(() => []);
    }
    tnFeaturesFetchPromise.then((features) => {
      if (isMounted && features && features.length) {
        setTnFeatures(features);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [layers, setLayers] = useState({
    districts: true,
    zones: true,
    technicians: true,
    customers: true,
    boundary: true,
    ...(layerToggles || {}),
  });

  const parsedPolygon = useMemo(() => parsePolygonProp(polygonCoordinates), [polygonCoordinates]);
  const validation = useMemo(() => validatePolygonGeoJSON(parsedPolygon), [parsedPolygon]);

  useEffect(() => {
    if (onValidationChange) onValidationChange(validation);
  }, [validation, onValidationChange]);

  const updateGeocode = useCallback(
    (lat, lng) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const nearest = (TAMIL_NADU_SUBZONES || []).reduce((best, sz) => {
        const szLat = Number(sz.lat);
        const szLng = Number(sz.lng);
        if (!Number.isFinite(szLat) || !Number.isFinite(szLng)) return best;
        const distance = Math.hypot(lat - szLat, lng - szLng);
        if (distance > 0.15) return best;
        if (!best || distance < best.distance) return { subzone: sz, distance };
        return best;
      }, null);
      const subzone = nearest?.subzone || null;
      const parentDistrict = detectParentDistrict(lat, lng);
      setMapGeocode({
        lat,
        lng,
        label:
          subzone?.name ||
          (parentDistrict?.name ? `${parentDistrict.name} District` : "Tamil Nadu"),
        district: subzone?.district || parentDistrict?.name || canonicalActiveDistrict || "",
        plusCode: subzone?.plus_code || computePlusCode(lat, lng),
        pincode: subzone?.pincode || "",
        adminCode: subzone?.admin_code || "",
      });
    },
    [canonicalActiveDistrict]
  );

  const copyGeocode = useCallback(() => {
    if (!mapGeocode) return;
    const text =
      `Geo Code: ${mapGeocode.lat.toFixed(5)}° N, ${mapGeocode.lng.toFixed(5)}° E | ` +
      `Plus Code: ${mapGeocode.plusCode} | Admin Code: ${mapGeocode.adminCode || "--"} | ` +
      `Zone: ${mapGeocode.label} (${mapGeocode.district}) | Pincode: ${mapGeocode.pincode || "--"}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => setStatus("Geo code copied to clipboard."))
        .catch(() => setStatus(text));
    } else {
      setStatus(text);
    }
  }, [mapGeocode]);

  useEffect(() => {
    if (radiusKm && radiusKm !== radius) setRadius(radiusKm);
  }, [radiusKm]);


  // Center on loaded polygon centroid (only when polygon identity changes, not on every keystroke)
  const polyKey = useMemo(() => {
    if (!parsedPolygon) return "";
    const ring = parsedPolygon.coordinates?.[0] || [];
    return `${ring.length}:${ring[0]?.join(",")}:${ring[Math.floor(ring.length / 2)]?.join(",")}`;
  }, [parsedPolygon]);
  useEffect(() => {
    if (!parsedPolygon) return;
    const ring = parsedPolygon.coordinates[0];
    const c = calculatePolygonCentroid(ring.slice(0, -1));
    if (c && Number.isFinite(c[0])) {
      setCenter(c);
      updateGeocode(c[0], c[1]);
    }
  }, [polyKey, updateGeocode]);

  const onPolygonChangeRef = useRef(onPolygonChange);
  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange;
  });
  const emitPolygon = useCallback((poly) => {
    if (onPolygonChangeRef.current) {
      onPolygonChangeRef.current(poly ? JSON.stringify(poly, null, 2) : "");
    }
  }, []);

  // ---- map init (once) ----
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    userInteractedRef.current = false;
    didInitialFitRef.current = false;
    const map = L.map(mapRef.current, {
      center: center && Number.isFinite(center[0]) ? center : [10.82, 78.4],
      zoom: 7.4,
      zoomSnap: 0.5,
      zoomDelta: 1,
      wheelPxPerZoomLevel: 45,
      wheelDebounceTime: 30,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: onlyTamilNadu ? TN_MAX_BOUNDS : undefined,
      maxBoundsViscosity: onlyTamilNadu ? 0.4 : undefined,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    });
    L.control.scale({ position: "bottomleft" }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: false }).addAttribution('© <a href="https://openstreetmap.org">OSM</a>').addTo(map);
    groups.current = {
      districts: L.layerGroup().addTo(map),
      districtLabels: L.layerGroup().addTo(map),
      zones: L.layerGroup().addTo(map),
      techs: L.layerGroup().addTo(map),
      customers: L.layerGroup().addTo(map),
      boundary: L.layerGroup().addTo(map),
      draft: L.layerGroup().addTo(map),
      center: L.layerGroup().addTo(map),
    };
    leafletMap.current = map;
    mapAliveRef.current = true;

    const markUserInteraction = (event) => {
      if (event?.originalEvent) userInteractedRef.current = true;
    };
    map.on("zoomstart movestart", markUserInteraction);

    // Responsive state fitting function ensuring full Tamil Nadu view fits viewport.
    // Only run the initial fit; never override a user's manual zoom afterwards.
    const fitState = () => {
      if (!mapAliveRef.current || userInteractedRef.current || didInitialFitRef.current) return;
      try {
        map.invalidateSize();
        const sz = map.getSize();
        if (!sz || sz.x <= 10 || sz.y <= 10) return;
        if (onlyTamilNadu) {
          map.fitBounds(TN_BOUNDS, { padding: [15, 15] });
          didInitialFitRef.current = true;
        }
      } catch {
        /* ignore */
      }
    };

    fitState();

    let ro = null;
    if (typeof ResizeObserver !== "undefined" && mapRef.current) {
      ro = new ResizeObserver(() => {
        if (!mapAliveRef.current) return;
        try {
          map.invalidateSize();
        } catch {
          /* ignore */
        }
      });
      ro.observe(mapRef.current);
    }

    const t1 = setTimeout(fitState, 60);
    const t2 = setTimeout(fitState, 180);
    const t3 = setTimeout(fitState, 450);

    return () => {
      mapAliveRef.current = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (ro) ro.disconnect();
      try {
        map.off();
      } catch {
        /* ignore */
      }
      try {
        Object.values(groups.current).forEach((layerGroup) => {
          if (layerGroup) layerGroup.clearLayers();
        });
      } catch {
        /* ignore */
      }
      groups.current = {};
      vertexMarkers.current = [];
      try {
        map._animatingZoom = false;
        if (typeof map.stop === "function") map.stop();
      } catch {
        /* ignore */
      }
      try {
        map.remove();
      } catch {
        /* ignore */
      }
      if (leafletMap.current === map) leafletMap.current = null;
      tileLayerRef.current = null;
    };
  }, [onlyTamilNadu]);

  // Dynamic basemap layer handling (OpenStreetMap by default, vector-only optional)
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !mapAliveRef.current) return;

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch {
        /* ignore */
      }
      tileLayerRef.current = null;
    }

    if (basemap === "osm") {
      const layer = tileFallback
        ? L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
            subdomains: "abcd",
          })
        : L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          });
      layer.on("tileerror", () => setTileFallback(true));
      layer.addTo(map);
      tileLayerRef.current = layer;
    }
  }, [basemap, tileFallback, onlyTamilNadu]);

  // ---- interactions ----
  const zoneBlockersForGeometry = useMemo(
    () => serializeZonesForGeometry(zoneBlockers),
    [zoneBlockers]
  );
  const radiusRequestRef = useRef(0);

  const handleRadiusAt = useCallback(
    async (lat, lng, km) => {
      const requestedKm = Number(km) || 5;
      const requestId = ++radiusRequestRef.current;
      setStatus(`Calculating ${requestedKm} KM zone…`);

      const payload = {
        lat,
        lng,
        radiusKm: requestedKm,
        districtGeometry: activeDistrictFeature?.geometry || null,
        districtRing: activeDistrictRing,
        zones: zoneBlockersForGeometry,
        preferPoint: [lng, lat],
        requireInsideDistrict: true,
        fallbackToCircle: false,
        maxSteps: 16,
      };

      let result = null;
      if (isGeometryWorkerSupported()) {
        try {
          result = await runGeometryTask("fitRadius", payload);
        } catch {
          result = null;
        }
      }
      if (!result) result = fitRadiusInDistrict(payload);
      if (requestId !== radiusRequestRef.current) return;

      if (result.outsideDistrict) {
        setStatus(`⚠️ Click inside ${canonicalActiveDistrict || "the district"} to create zone`);
        return;
      }

      setCenter([lat, lng]);
      const conflictKeys = result.conflictKeys || [];
      const conflictNames = result.conflictNames || "";

      if (result.polygon && result.compatible) {
        emitPolygon(result.polygon);
        setConflictZoneKeys(result.adjusted ? conflictKeys : []);
        setStatus(
          result.reduced
            ? `⚠️ Overlap with ${conflictNames || "existing zones"} — radius reduced to ${Number(
                result.radiusKm
              ).toFixed(1)} KM to fit the available area`
            : result.adjusted
              ? `✂ Boundary trimmed to avoid ${conflictNames || "existing zones"} in ${canonicalActiveDistrict || "the district"}`
              : `Zone inside ${canonicalActiveDistrict || "district"} • ${requestedKm} KM radius${result.cutToDistrict ? " (cut to district border)" : ""}`
        );
        return;
      }

      setConflictZoneKeys(conflictKeys);
      emitPolygon(null);
      setStatus(
        conflictNames
          ? `⛔ This area is already covered by ${conflictNames}. Click outside existing zones or pick a smaller radius.`
          : `⚠️ Could not place a zone here. Click inside ${canonicalActiveDistrict || "the district"} and retry.`
      );
    },
    [
      activeDistrictFeature,
      activeDistrictRing,
      zoneBlockersForGeometry,
      emitPolygon,
      canonicalActiveDistrict,
    ]
  );

  const mapCallbacksRef = useRef({});
  useEffect(() => {
    mapCallbacksRef.current = {
      onSelectDistrict,
      onCitySelect,
      onSelectSubzone,
      selectZone,
      emitPolygon,
      handleRadiusAt,
    };
  });

  // Jump to a newly selected city preset. Do not recenter when only the
  // radius, polygon, or zone data changes — that would fight manual zooming.
  const cityViewKeyRef = useRef("");
  useEffect(() => {
    const activeCity = (selectedCityName || cityName || "").trim();
    if (!activeCity) {
      cityViewKeyRef.current = "";
      return;
    }
    const key = activeCity.split("(")[0].trim().toLowerCase();
    const matchedCity = presetCities.find((city) => {
      const name = String(city.name || "").toLowerCase().trim();
      return name && (key === name || key.includes(name) || name.includes(key));
    });
    const hit = matchedCity
      ? [Number(matchedCity.lat), Number(matchedCity.lng)]
      : CITY_LOOKUP[key];

    if (hit && Number.isFinite(hit[0]) && Number.isFinite(hit[1])) {
      const cityChanged = cityViewKeyRef.current !== key;
      cityViewKeyRef.current = key;
      if (!cityChanged) return;

      setCenter(hit);
      if (leafletMap.current && mapAliveRef.current) {
        leafletMap.current.setView(hit, 12, { animate: true });
      }
      if (editable && mode === "radius" && !parsedPolygon) {
        const rad = radius || radiusKm || 5;
        handleRadiusAt(hit[0], hit[1], rad);
      }
    }
  }, [cityName, selectedCityName, presetCities, editable, mode, parsedPolygon, radius, radiusKm, handleRadiusAt]);

  const districtCities = useMemo(() => {
    const act = (canonicalActiveDistrict || selectedTnDistrict || selectedDistrictName || districtName || "").trim();
    const all = act ? getDistrictCities(act) : [];
    const activeCity = (selectedCityName || cityName || "").trim();
    if (activeCity) {
      const cNorm = activeCity.split("(")[0].trim().toLowerCase();
      const matched = all.filter((c) => {
        const n = (c.name || "").toLowerCase().trim();
        return n === cNorm || n.includes(cNorm) || cNorm.includes(n);
      });
      if (matched.length > 0) return matched;
    }
    return all;
  }, [canonicalActiveDistrict, selectedTnDistrict, selectedDistrictName, districtName, cityName, selectedCityName]);

  const districtSubzones = useMemo(() => {
    const act = (canonicalActiveDistrict || selectedTnDistrict || selectedDistrictName || districtName || "").trim();
    const all = act ? getSubzonesByDistrict(act) : [];
    const activeCity = (selectedCityName || cityName || "").trim();
    if (activeCity) {
      const cNorm = activeCity.split("(")[0].trim().toLowerCase();
      const matched = all.filter((sz) => {
        const szName = (sz.name || "").toLowerCase();
        const szDist = (sz.district || "").toLowerCase();
        const szCity = (sz.city || "").toLowerCase();
        return (
          szName.includes(cNorm) ||
          szCity.includes(cNorm) ||
          cNorm.includes(szCity)
        );
      });
      if (matched.length > 0) return matched;
    }
    return all;
  }, [canonicalActiveDistrict, selectedTnDistrict, selectedDistrictName, districtName, cityName, selectedCityName]);

  const handleSelectCityOrZone = useCallback(
    (key) => {
      if (!key) return;
      const [type, val] = key.split(":");
      let targetItem = null;
      if (type === "zone") {
        targetItem = districtSubzones.find((sz) => sz.name === val || sz.id === val);
      } else if (type === "city") {
        targetItem = districtCities.find((c) => c.name === val || c.code === val);
      }
      if (!targetItem) return;

      const lat = Number(targetItem.lat);
      const lng = Number(targetItem.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      if (leafletMap.current && mapAliveRef.current) {
        leafletMap.current.setView([lat, lng], 12);
      }

      const rad = targetItem.radius_km || radiusKm || 5;
      handleRadiusAt(lat, lng, rad);

      const itemName = type === "zone" ? targetItem.name : `${targetItem.name} Zone`;
      const itemCity = targetItem.district || targetItem.city || canonicalActiveDistrict || "";
      const itemCode = targetItem.id || targetItem.code || targetItem.admin_code || "";

      if (onCitySelect) {
        onCitySelect({
          name: itemName,
          city: itemCity,
          code: itemCode,
          zoneCode: itemCode,
          lat,
          lng,
        });
      }

      setStatus(`Selected ${targetItem.name} • ${rad} KM zone clipped to ${canonicalActiveDistrict || "district"} border`);
    },
    [districtSubzones, districtCities, canonicalActiveDistrict, radiusKm, handleRadiusAt, onCitySelect]
  );

  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !mapAliveRef.current) return;
    const onClick = (e) => {
      if (!editable) return;
      const { lat, lng } = e.latlng;
      updateGeocode(lat, lng);
      if (drawMode) {
        if (activeDistrictRing && activeDistrictRing.length >= 3) {
          if (!isPointInPolygon([lng, lat], activeDistrictRing)) {
            const snapped = getClosestPointOnRing([lng, lat], activeDistrictRing);
            setDraftPoints((prev) => [...prev, [snapped[1], snapped[0]]]);
            setStatus(`📍 Snapped to ${canonicalActiveDistrict} border (boundary constrained)`);
            return;
          }
        }
        setDraftPoints((prev) => [...prev, [lat, lng]]);
      } else {
        handleRadiusAt(lat, lng, radius);
      }
    };
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [editable, drawMode, radius, handleRadiusAt, activeDistrictRing, canonicalActiveDistrict, updateGeocode]);

  // ---- render layers ----
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !mapAliveRef.current) return;
    map.invalidateSize();
    const g = groups.current;
    Object.values(g).forEach((lg) => lg && lg.clearLayers());
    vertexMarkers.current = [];
    const bounds = L.latLngBounds([]);

    // boundary (editable polygon)
    if (layers.boundary && parsedPolygon) {
      try {
        const layer = L.geoJSON(parsedPolygon, {
          style: {
            color: validation.valid ? "#10b981" : "#DC2626",
            weight: 3.5,
            fillColor: validation.valid ? "#34d399" : "#FCA5A5",
            fillOpacity: 0.45,
            dashArray: null,
          },
        });
        layer.bindTooltip(`📍 <b>${districtName || cityName || "Boundary"}</b><br/>${validation.reason}`, { sticky: true });
        layer.addTo(g.boundary);
        if (layer.getBounds().isValid()) bounds.extend(layer.getBounds());
        // draggable vertex markers in draw mode
        if (editable && drawMode) {
          const ring = parsedPolygon.coordinates[0].slice(0, -1); // [lng,lat]
          ring.forEach(([lng, lat], idx) => {
            const m = L.marker([lat, lng], { draggable: true, icon: vertexIcon(false) });
            m.on("dragend", () => {
              const p = m.getLatLng();
              const next = parsedPolygon.coordinates[0].map((pt, i) =>
                i === idx ? [p.lng, p.lat] : pt
              );
              // keep closure
              if (idx === 0) next[next.length - 1] = [p.lng, p.lat];
              mapCallbacksRef.current.emitPolygon({ type: "Polygon", coordinates: [next, ...parsedPolygon.coordinates.slice(1)] });
            });
            m.addTo(g.boundary);
            vertexMarkers.current.push(m);
          });
        }
      } catch { /* ignore */ }
    }

    // draft polyline while drawing
    if (editable && drawMode && draftPoints.length) {
      const line = L.polyline(draftPoints, { color: "#008080", weight: 2, dashArray: "4,4" }).addTo(g.draft);
      draftPoints.forEach(([lat, lng], i) => {
        L.marker([lat, lng], { icon: vertexIcon(i === draftPoints.length - 1) }).addTo(g.draft);
      });
      if (draftPoints.length >= 3) {
        L.polygon([...draftPoints, draftPoints[0]], { color: "#008080", weight: 1, fillOpacity: 0.06, dashArray: "4,4" }).addTo(g.draft);
      }
      bounds.extend(line.getBounds());
    }

    // center pin (only show in editable radius mode when a center point is defined)
    if (center && Number.isFinite(center[0]) && editable && mode === "radius") {
      L.marker(center, { icon: centerIcon(`${center[0].toFixed(4)}, ${center[1].toFixed(4)}`), interactive: false, zIndexOffset: 500 }).addTo(g.center);
    }

    // Official Survey of India Tamil Nadu Districts Layer (from tamilnadu_districts.geojson)
    if (layers.districts && Array.isArray(tnFeatures)) {
      // Always render all 38 districts of Tamil Nadu so the full operational map is always visible
      const featuresToRender = tnFeatures;
      const districtConflictSet = new Set();
      (conflictDistrictNames || []).forEach((name) => {
        districtConflictSet.add(String(name).toLowerCase());
        const canonical = findTnDistrict(name);
        if (canonical?.name) districtConflictSet.add(canonical.name.toLowerCase());
      });

      featuresToRender.forEach((feature) => {
        if (!feature?.geometry?.coordinates) return;
        const distName = feature.properties?.district || feature.properties?.name || "";
        const distCode = feature.properties?.code || feature.properties?.dtcode || "";
        const lowerName = distName.toLowerCase();

        // Check if currently selected / active focus
        const isCurrentSelected =
          Boolean(selectedTnDistrict && selectedTnDistrict.toLowerCase() === lowerName) ||
          Boolean(selectedDistrictName && selectedDistrictName.toLowerCase() === lowerName) ||
          Boolean(canonicalActiveDistrict && canonicalActiveDistrict.toLowerCase() === lowerName) ||
          Boolean(
            selectedDistrictId &&
              effectiveDistricts.some(
                (d) =>
                  String(d._id) === String(selectedDistrictId) &&
                  (d.name?.toLowerCase() === lowerName || d.city?.toLowerCase() === lowerName)
              )
          );

        // Check if matching backend operational district
        const backendMatch = effectiveDistricts.find(
          (d) =>
            d.name?.toLowerCase() === lowerName ||
            d.city?.toLowerCase() === lowerName ||
            d.code?.toLowerCase() === distCode.toLowerCase()
        );
        const isOperational = Boolean(
          backendMatch && backendMatch.active !== false && backendMatch.isActive !== false
        );
        const isConflict =
          districtConflictSet.has(lowerName) ||
          (distCode && districtConflictSet.has(String(distCode).toLowerCase()));

        // Green color for active / operational / selected district inside
        const fillColor = isConflict
          ? "#ef4444"
          : (isCurrentSelected || isOperational) ? "#064e3b" : "#13253b";
        const strokeColor = isConflict
          ? "#ef4444"
          : isCurrentSelected ? "#34d399" : isOperational ? "#10b981" : "rgba(56, 189, 248, 0.45)";
        const fillOpacity = isConflict ? 0.38 : isCurrentSelected ? 0.48 : isOperational ? 0.38 : 0.65;
        const weight = isConflict ? 3.5 : isCurrentSelected ? 3.0 : isOperational ? 2.0 : 1.4;

        try {
          const layer = L.geoJSON(feature, {
            style: {
              color: strokeColor,
              weight: weight,
              fillColor: fillColor,
              fillOpacity: fillOpacity,
              dashArray: isConflict ? "7,4" : null,
              opacity: isConflict ? 1.0 : isCurrentSelected ? 1.0 : 0.95,
            },
          });

          const tooltipHtml = `
            <div style="font-family: inherit; font-size: 12px; line-height: 1.35; padding: 3px 5px;">
              <div style="font-weight: 700; color: #f8fafc; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>📍 ${distName}</span>
                ${distCode ? `<span style="font-size: 10px; background: #1e293b; color: #94a3b8; padding: 1px 6px; border-radius: 4px; font-weight: 600;">${distCode}</span>` : ""}
              </div>
              <div style="font-size: 11px; margin-top: 3px; font-weight: 600; color: ${isConflict ? "#fca5a5" : isCurrentSelected ? "#22d3ee" : isOperational ? "#34d399" : "#94a3b8"};">
                ${isConflict ? "⚠️ Overlaps the boundary being created" : isCurrentSelected ? "🎯 Active Selected District" : isOperational ? "✓ Service Enabled" : "✕ Service Disabled"}
              </div>
              <div style="font-size: 10px; color: #38bdf8; margin-top: 3px;">
                Click to focus district & inspect sub-zones
              </div>
            </div>
          `;
          layer.bindTooltip(tooltipHtml, { sticky: true, direction: "top", offset: [0, -6], className: "custom-zone-tooltip" });

          const centerCoord =
            feature.properties?.center ||
            (feature.properties?.lat && feature.properties?.lng ? [feature.properties.lat, feature.properties.lng] : null) ||
            (layer.getBounds && layer.getBounds().isValid() ? [layer.getBounds().getCenter().lat, layer.getBounds().getCenter().lng] : null);

          // Render centered badge label for Tamil Nadu districts
          if (centerCoord && Array.isArray(centerCoord) && centerCoord.length === 2 && Number.isFinite(centerCoord[0])) {
            const isViewingThisDistrictDetail = canonicalActiveDistrict && canonicalActiveDistrict.toLowerCase() === lowerName;
            // Suppress duplicate district centroid label when zoomed into / managing this district's cities
            if (!isViewingThisDistrictDetail) {
              const labelHtml = isConflict
                ? `<div class="district-name-badge default"><span>⚠️ ${distName}</span></div>`
                : isCurrentSelected
                ? `<div class="district-name-badge active-selected"><span>📍 ${distName}</span></div>`
                : isOperational
                ? `<div class="district-name-badge operational"><span>🟢 ${distName}</span></div>`
                : `<div class="district-name-badge default"><span>${distName}</span></div>`;

              const labelIcon = L.divIcon({
                className: "district-badge-container",
                html: labelHtml,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              });
              const marker = L.marker([centerCoord[0], centerCoord[1]], {
                icon: labelIcon,
                interactive: false,
                zIndexOffset: isCurrentSelected ? 1000 : isOperational ? 500 : 100,
              });
              marker.addTo(g.districtLabels);
            }
          }

          layer.on({
            mouseover: () => {
              if (isConflict) {
                layer.setStyle({
                  weight: 4.5,
                  color: "#ef4444",
                  fillColor: "#dc2626",
                  fillOpacity: 0.55,
                });
                if (layer.bringToFront) layer.bringToFront();
                return;
              }
              if (!isCurrentSelected) {
                layer.setStyle({
                  weight: 2.6,
                  color: "#34d399",
                  fillColor: isOperational ? "#059669" : "#10b981",
                  fillOpacity: 0.75,
                });
                if (layer.bringToFront) layer.bringToFront();
              }
            },
            mouseout: () => {
              if (!isCurrentSelected || isConflict) {
                layer.setStyle({
                  color: strokeColor,
                  weight: weight,
                  fillColor: fillColor,
                  fillOpacity: fillOpacity,
                  dashArray: isConflict ? "7,4" : null,
                  opacity: isConflict ? 1.0 : 0.95,
                });
              }
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedTnDistrict(distName);
              setStatus(`Focused on ${distName} • Full Tamil Nadu Operations Grid`);

              if (layer.getBounds && layer.getBounds().isValid()) {
                map.fitBounds(layer.getBounds(), { padding: [35, 35], maxZoom: 13 });
              }

              const payload = backendMatch || {
                _id: null,
                name: distName,
                city: distName,
                code: distCode,
                polygon: feature.geometry,
                geometry: feature.geometry,
                active: isOperational,
                isActive: isOperational,
              };

              const callbacks = mapCallbacksRef.current;
              if (callbacks.onSelectDistrict) callbacks.onSelectDistrict(payload);

              if (centerCoord) {
                setCenter(centerCoord);
                if (!callbacks.onSelectDistrict && callbacks.onCitySelect) {
                  callbacks.onCitySelect({ name: distName, code: distCode, lat: centerCoord[0], lng: centerCoord[1] });
                }
              }

              if (editable) {
                if (drawMode) {
                  const { lat, lng } = e.latlng;
                  if (activeDistrictRing && activeDistrictRing.length >= 3) {
                    if (!isPointInPolygon([lng, lat], activeDistrictRing)) {
                      const snapped = getClosestPointOnRing([lng, lat], activeDistrictRing);
                      setDraftPoints((prev) => [...prev, [snapped[1], snapped[0]]]);
                      setStatus(`📍 Snapped to ${canonicalActiveDistrict || distName} border (boundary constrained)`);
                      return;
                    }
                  }
                  setDraftPoints((prev) => [...prev, [lat, lng]]);
                } else if (mode === "radius" || allowRadiusSelect) {
                  // Creates a micro-zone radius centered at clicked point, clipped to district borders
                  callbacks.handleRadiusAt(e.latlng.lat, e.latlng.lng, radius || radiusKm || 5);
                } else {
                  // Only emit entire district geometry when in pure district mode (not micro-zone mode)
                  callbacks.emitPolygon(feature.geometry);
                }
              }
            },
          });

          layer.addTo(g.districts);
        } catch {
          // ignore bad geometry
        }
      });
    }

    // zones inside the district or all zones
    if (layers.zones) {
      const zonesToRender = cappedZones;

      const conflictKeys = new Set(conflictZoneKeys.map(String));
      const activeDistrictSubzones = canonicalActiveDistrict
        ? getSubzonesByDistrict(canonicalActiveDistrict)
        : [];

      zonesToRender.forEach((z, idx) => {
        if (!z?.polygon?.coordinates) return;
        const zoneKey = String(getZoneId(z) || z.name || "");
        const isConflict = conflictKeys.has(zoneKey);
        const sel = selectedZoneId && String(getZoneId(z)) === String(selectedZoneId);
        const isActive = z.active !== false;
        const colorPair = ZONE_COLOR_PALETTE[idx % ZONE_COLOR_PALETTE.length];
        const strokeColor = isConflict ? "#ef4444" : sel ? "#f59e0b" : isActive ? colorPair.border : "#64748b";
        const fillColor = isConflict ? "#ef4444" : sel ? "#fbbf24" : isActive ? colorPair.fill : "#475569";
        try {
          const layer = L.geoJSON(z.polygon, {
            style: {
              color: strokeColor,
              weight: isConflict ? 3.5 : sel ? 3.5 : 2.5,
              fillColor: fillColor,
              fillOpacity: isConflict ? 0.35 : sel ? 0.55 : isActive ? 0.45 : 0.15,
              dashArray: isConflict ? "7,4" : isActive ? null : "3,3",
            },
          });
          layer.bindTooltip(
            `<div style="font-family:inherit;font-size:12px;padding:3px 5px;">` +
            `<div style="font-weight:700;color:${isConflict ? "#ef4444" : colorPair.fill};">📍 ${z.name || "Zone"} ${z.zoneCode ? `(${z.zoneCode})` : ""}</div>` +
            `<div style="font-size:10px;color:${isConflict ? "#fca5a5" : "#94a3b8"};margin-top:2px;">${
              isConflict ? "⚠️ Conflicts with the boundary being drawn" : isActive ? "Active Service Zone 🟢" : "Inactive ⚪"
            }</div>` +
            `</div>`,
            { sticky: true, className: "custom-zone-tooltip" }
          );
          layer.on("click", (e) => {
            const callbacks = mapCallbacksRef.current;
            if (!callbacks.selectZone) return;
            L.DomEvent.stopPropagation(e);
            callbacks.selectZone(z);
          });
          layer.addTo(g.zones);

          // Add centered label pill for existing custom zones inside this district
          if (canonicalActiveDistrict && z.polygon?.coordinates?.[0]) {
            const zCity = (z.city || z.district || "").toLowerCase();
            const actLower = (canonicalActiveDistrict || "").toLowerCase();
            const isMatch = zCity && actLower && (zCity === actLower || actLower.includes(zCity) || zCity.includes(actLower));
            if (isMatch) {
              const subzones = activeDistrictSubzones;
              const cleanZoneName = formatCleanCityName(z.name || "Zone", canonicalActiveDistrict);
              const isCoveredBySubzone = subzones.some((sz) => {
                const szClean = formatCleanCityName(sz.name, canonicalActiveDistrict).toLowerCase();
                const zNameLower = (z.name || "").toLowerCase();
                const szNameLower = (sz.name || "").toLowerCase();
                return zNameLower.includes(szClean) || szClean.includes(zNameLower) || zNameLower.includes(szNameLower) || szNameLower.includes(zNameLower);
              });
              if (!isCoveredBySubzone) {
                const centroid = calculatePolygonCentroid(z.polygon.coordinates[0]);
                if (centroid && Array.isArray(centroid) && Number.isFinite(centroid[0])) {
                  const labelHtml = `
                    <div class="city-pill is-active">
                      <span class="city-pill-icon">✓</span>
                      <span class="city-pill-text">${cleanZoneName}</span>
                    </div>
                  `;
                  const zoneIcon = L.divIcon({
                    className: "city-pill-wrapper",
                    html: labelHtml,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0],
                  });
                  L.marker([centroid[0], centroid[1]], { icon: zoneIcon, interactive: false, zIndexOffset: 450 }).addTo(g.zones);
                }
              }
            }
          }
        } catch { /* ignore */ }
      });

      // Render official sub-zone / city pins for the active district (e.g. Tiruppur)
      if (canonicalActiveDistrict) {
        try {
          const subzones = activeDistrictSubzones;
          subzones.forEach((sz) => {
            if (!Number.isFinite(sz.lat) || !Number.isFinite(sz.lng)) return;
            const cleanCity = formatCleanCityName(sz.name, canonicalActiveDistrict);
            const alreadyCreated = effectiveZones.some((z) => {
              const zName = (z.name || "").toLowerCase();
              const szName = (sz.name || "").toLowerCase();
              const cName = cleanCity.toLowerCase();
              return zName.includes(szName) || szName.includes(zName) || zName.includes(cName);
            });
            const pillHtml = `
              <div class="city-pill ${alreadyCreated ? "is-active" : "is-available"}">
                <span class="city-pill-icon">${alreadyCreated ? "✓" : "📍"}</span>
                <span class="city-pill-text">${cleanCity}</span>
              </div>
            `;
            const icon = L.divIcon({
              className: "city-pill-wrapper",
              html: pillHtml,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            });
            const m = L.marker([sz.lat, sz.lng], { icon, zIndexOffset: 550 });
            m.bindTooltip(
              `<div style="font-family:inherit;font-size:12px;line-height:1.35;padding:3px 5px;">` +
              `<div style="font-weight:700;color:#0ea5e9;">${cleanCity}</div>` +
              (sz.name && sz.name !== cleanCity ? `<div style="font-size:10px;color:#cbd5e1;">${sz.name}</div>` : "") +
              (sz.type ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px;">${sz.type}</div>` : "") +
              `<div style="font-size:10px;font-weight:600;margin-top:3px;color:${alreadyCreated ? "#34d399" : "#38bdf8"};">` +
              `${alreadyCreated ? "✓ Operational Zone Active" : "Click to select & configure radius"}</div>` +
              `</div>`,
              { sticky: true, className: "custom-zone-tooltip" }
            );
            m.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              const callbacks = mapCallbacksRef.current;
              if (callbacks.onSelectSubzone) {
                if (leafletMap.current && mapAliveRef.current) {
                  leafletMap.current.setView([sz.lat, sz.lng], 12);
                }
                callbacks.onSelectSubzone(sz);
                return;
              }
              callbacks.handleRadiusAt(sz.lat, sz.lng, sz.radius_km || radiusKm || 5);
              if (callbacks.onCitySelect) {
                callbacks.onCitySelect({
                  name: cleanCity,
                  fullName: sz.name,
                  city: sz.district || canonicalActiveDistrict,
                  code: sz.id || sz.admin_code,
                  zoneCode: sz.id || sz.admin_code,
                  lat: sz.lat,
                  lng: sz.lng,
                });
              }
            });
            m.addTo(g.zones);
          });
        } catch { /* ignore */ }
      }
    }

    // technicians
    if (layers.technicians && Array.isArray(technicians)) {
      technicians.slice(0, 300).forEach((t) => {
        const coords = t?.location?.coordinates;
        if (!Array.isArray(coords) || !Number.isFinite(coords[1])) return;
        const [lng, lat] = coords;
        const online = t?.availability?.isOnline === true;
        const label = t?.userId?.fname || t?.fname || "Tech";
        L.marker([lat, lng], { icon: techIcon(online, label) })
          .bindPopup(`<b>${label} ${t?.userId?.lname || t?.lname || ""}</b><br/>${online ? "ONLINE 🟢" : "OFFLINE ⚪"}<br/>${t?.userId?.mobileNumber || t?.mobileNumber || ""}`)
          .addTo(g.techs);
      });
    }

    // customers
    if (layers.customers && Array.isArray(customers)) {
      customers.slice(0, 500).forEach((c) => {
        const lat = c?.lat ?? c?.latitude ?? c?.location?.coordinates?.[1];
        const lng = c?.lng ?? c?.longitude ?? c?.location?.coordinates?.[0];
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        L.marker([lat, lng], { icon: customerIcon() })
          .bindTooltip(`${c?.name || "Customer"}`, { direction: "top", offset: [0, -6] })
          .addTo(g.customers);
      });
    }
  }, [parsedPolygon, validation.valid, validation.reason, effectiveDistricts, effectiveZones, cappedZones, technicians, customers, layers, center, cityName, districtName, selectedDistrictId, selectedZoneId, editable, drawMode, draftPoints, tnFeatures, selectedTnDistrict, selectedDistrictName, mode, allowRadiusSelect, radius, radiusKm, activeDistrictRing, canonicalActiveDistrict, conflictZoneKeys, conflictDistrictNames]);

  const fitTamilNadu = useCallback(() => {
    const map = leafletMap.current;
    if (!map || !mapAliveRef.current) return;
    map.invalidateSize();
    try {
      map.fitBounds(TN_BOUNDS, { padding: [15, 15] });
    } catch {
      /* ignore */
    }
    setSelectedTnDistrict("");
    setStatus("Tamil Nadu Operational Overview — All 38 Revenue Districts");
  }, []);

  const handleFocusDistrict = useCallback(
    (targetName) => {
      const map = leafletMap.current;
      if (!map || !mapAliveRef.current) return;
      const active = (targetName || canonicalActiveDistrict || selectedTnDistrict || districtName || "").trim();
      if (!active || active.toLowerCase() === "tamil nadu") {
        fitTamilNadu();
        return;
      }
      const feat = (tnFeatures || []).find((f) => {
        const dName = (f.properties?.district || f.properties?.name || "").toLowerCase();
        const dCode = (f.properties?.code || f.properties?.dtcode || "").toLowerCase();
        const aLower = active.toLowerCase();
        return dName === aLower || dCode === aLower || aLower.includes(dName) || dName.includes(aLower);
      });
      if (feat) {
        try {
          const b = L.geoJSON(feat).getBounds();
          if (b.isValid()) {
            map.fitBounds(b, { padding: [35, 35], maxZoom: 13 });
            setStatus(`Focused on ${active} • Boundary & Micro-Zones`);
          }
        } catch {
          /* ignore */
        }
      }
    },
    [canonicalActiveDistrict, selectedTnDistrict, districtName, tnFeatures, fitTamilNadu]
  );

  const fitAll = useCallback(() => {
    const map = leafletMap.current;
    if (!map || !mapAliveRef.current) return;
    const g = groups.current;
    const b = L.latLngBounds([]);
    [g.boundary, g.zones].forEach((lg) => {
      lg &&
        lg.eachLayer((l) => {
          if (l.getBounds && l.getBounds().isValid()) b.extend(l.getBounds());
        });
    });
    if (b.isValid()) map.fitBounds(b, { padding: [35, 35], maxZoom: 13 });
    else fitTamilNadu();
  }, [fitTamilNadu]);

  const handleSelectDistrictByName = useCallback(
    (distName) => {
      if (!distName) {
        fitTamilNadu();
        return;
      }
      const feat = tnFeatures.find((f) => {
        const n = f.properties?.district || f.properties?.name;
        return n?.toLowerCase() === distName.toLowerCase();
      });
      const d = TAMIL_NADU_DISTRICTS.find((x) => x.name.toLowerCase() === distName.toLowerCase());
      const boundary = feat?.geometry || getTnDistrictBoundary(distName);
      const lat = feat?.properties?.center?.[0] || d?.center?.[0] || d?.lat || 11.1085;
      const lng = feat?.properties?.center?.[1] || d?.center?.[1] || d?.lng || 77.3411;

      setCenter([lat, lng]);
      setSelectedTnDistrict(distName);
      if (leafletMap.current && mapAliveRef.current) {
        if (feat) {
          try {
            const temp = L.geoJSON(feat);
            leafletMap.current.fitBounds(temp.getBounds(), { padding: [25, 25], maxZoom: 13 });
          } catch {
            leafletMap.current.setView([lat, lng], 10, { animate: true });
          }
        } else {
          leafletMap.current.setView([lat, lng], 10, { animate: true });
        }
      }
      if (boundary && editable && !drawMode && mode !== "radius" && !allowRadiusSelect) {
        emitPolygon(boundary);
      }
      const backendMatch = effectiveDistricts.find(
        (x) => x.name?.toLowerCase() === distName.toLowerCase() || x.city?.toLowerCase() === distName.toLowerCase()
      );
      if (onSelectDistrict) {
        onSelectDistrict(
          backendMatch || {
            _id: null,
            name: distName,
            city: distName,
            code: d?.code || "",
            polygon: boundary,
            geometry: boundary,
          }
        );
      }
      if (onCitySelect && d) onCitySelect({ name: d.name, code: d.code, lat, lng });
      setStatus(`Selected ${distName} — Official Survey of India Boundary`);
    },
    [fitTamilNadu, tnFeatures, editable, drawMode, emitPolygon, effectiveDistricts, onSelectDistrict, onCitySelect]
  );

  // ---- toolbar actions ----
  const applyRadius = (km) => {
    setRadius(km);
    if (onRadiusChange) onRadiusChange(km);
    if (!editable || drawMode || !center || !Number.isFinite(center[0])) return;
    handleRadiusAt(center[0], center[1], km);
  };

  const finishDraft = () => {
    if (draftPoints.length < 3) {
      setStatus("Add at least 3 points, then Finish.");
      return;
    }
    const ring = [...draftPoints.map(([lat, lng]) => [lng, lat]), [draftPoints[0][1], draftPoints[0][0]]];

    let polygon = { type: "Polygon", coordinates: [ring] };
    let cutToDistrict = false;

    if (activeDistrictFeature?.geometry?.coordinates) {
      try {
        const geom = activeDistrictFeature.geometry;
        const districtInput = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
        const clipped = polygonClipping.intersection(districtInput, [[[...ring]]]);
        if (clipped && clipped.length > 0) {
          polygon = { type: "Polygon", coordinates: clipped[0] };
          cutToDistrict = true;
        }
      } catch (err) {
        console.warn("polygonClipping finishDraft error:", err);
      }
    }

    const zoneResult = clipPolygonAgainstZones(polygon, zoneBlockers);
    if (!zoneResult.polygon || !zoneResult.compatible) {
      const blockedNames = (zoneResult.blockers?.length ? zoneResult.blockers : zoneResult.overlappingZones || [])
        .map((zone) => `"${zone.name}"`)
        .filter(Boolean)
        .join(", ");
      setConflictZoneKeys(
        (zoneResult.overlappingZones || []).map((zone) => String(zone.id || zone.name))
      );
      setStatus(
        blockedNames
          ? `⛔ Boundary overlaps existing zone ${blockedNames}. Adjust the points and finish again.`
          : "⛔ Boundary overlaps an existing zone in this district. Adjust the points and finish again."
      );
      return;
    }

    emitPolygon(zoneResult.polygon);
    setConflictZoneKeys(
      zoneResult.adjusted
        ? (zoneResult.overlappingZones || []).map((zone) => String(zone.id || zone.name))
        : []
    );
    setDraftPoints([]);
    setStatus(
      zoneResult.adjusted
        ? "Polygon saved after trimming the area already covered by existing zones."
        : `Polygon saved: ${zoneResult.polygon.coordinates?.[0]?.length - 1 || ring.length - 1} vertices${
            cutToDistrict ? " (cut to district border)" : ""
          }.`
    );
  };

  const showTb = showToolbar && !readOnly ? true : showToolbar && mode === "view";

  return (
    <VStack spacing={2} align="stretch" w="100%" h="100%" flex="1" overflow="hidden">
      {showTb && (
        <Flex
          align="center"
          justify="space-between"
          bg="rgba(15, 23, 42, 0.95)"
          px={3.5}
          py={2}
          borderRadius="10px"
          border="1px solid"
          borderColor="rgba(6, 182, 212, 0.25)"
          boxShadow="0 4px 14px rgba(0,0,0,0.35)"
          gap={2.5}
          flexWrap="wrap"
        >
          {/* City & Zone Area Search within Separate District */}
          {canonicalActiveDistrict && (districtSubzones.length > 0 || districtCities.length > 0) && (
            <HStack spacing={1.5} flex={{ base: "1 1 100%", md: "1 1 250px" }} maxW="340px">
              <Icon as={MdSearch} color="cyan.400" boxSize={4} />
              <Select
                size="sm"
                bg="#1e293b"
                borderRadius="8px"
                borderColor="cyan.500"
                fontWeight="700"
                color="white"
                placeholder={
                  (selectedCityName || cityName)
                    ? `🔍 Zones in ${(selectedCityName || cityName).split("(")[0].trim()}...`
                    : `🔍 Search City / Zone in ${canonicalActiveDistrict}...`
                }
                onChange={(e) => {
                  handleSelectCityOrZone(e.target.value);
                  e.target.value = "";
                }}
                _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #06b6d4" }}
              >
                {districtSubzones.length > 0 && (
                  <optgroup
                    label={
                      (selectedCityName || cityName)
                        ? `⚡ ${(selectedCityName || cityName).split("(")[0].trim()} Zones (${districtSubzones.length})`
                        : `⚡ ${canonicalActiveDistrict} Zone Areas (${districtSubzones.length})`
                    }
                  >
                    {districtSubzones.map((sz) => (
                      <option key={sz.id || sz.name} value={`zone:${sz.name}`} style={{ background: "#0f172a", color: "#38bdf8" }}>
                        ⚡ Zone: {sz.name} ({sz.radius_km || 5} km)
                      </option>
                    ))}
                  </optgroup>
                )}
                {districtCities.length > 0 && (
                  <optgroup
                    label={
                      (selectedCityName || cityName)
                        ? `📍 Selected City (${districtCities.length})`
                        : `📍 ${canonicalActiveDistrict} Cities / Taluks (${districtCities.length})`
                    }
                  >
                    {districtCities.map((c) => (
                      <option key={c.name} value={`city:${c.name}`} style={{ background: "#0f172a", color: "#f8fafc" }}>
                        📍 City: {c.name} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
              </Select>
            </HStack>
          )}

          {/* District Switcher (Only shown when navigation controls are enabled) */}
          {showNavControls && (
            <HStack spacing={1.5} flex={{ base: "1 1 100%", md: "0 0 200px" }} maxW="230px">
              <Select
                size="sm"
                w="100%"
                bg="#1e293b"
                borderRadius="8px"
                borderColor="teal.500"
                fontWeight="600"
                color="gray.200"
                value={selectedTnDistrict || ""}
                placeholder={
                  Array.isArray(districts) && districts.length > 0
                    ? `District (${districtOptions.length})...`
                    : "District (38)..."
                }
                onChange={(e) => handleSelectDistrictByName(e.target.value)}
                _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #06b6d4" }}
              >
                {districtOptions.map((d) => (
                  <option key={d.name} value={d.name} style={{ background: "#0f172a", color: "#f8fafc" }}>
                    📍 {d.name} ({d.code || "TN"})
                  </option>
                ))}
              </Select>
              {selectedTnDistrict && (
                <IconButton
                  size="xs"
                  icon={<MdClear />}
                  variant="ghost"
                  colorScheme="cyan"
                  aria-label="Clear selection"
                  title="Reset to Full Tamil Nadu Map"
                  onClick={fitTamilNadu}
                />
              )}
            </HStack>
          )}

          {/* Controls: Focus District & Radius Kilometres */}
          <HStack spacing={2} flexWrap="wrap" align="center">
            {parentDistrictActive === false && (
              <Badge colorScheme="orange" variant="subtle" borderRadius="6px" px={2} py={1} fontSize="10px" fontWeight="700">
                ⚠ Parent district disabled — enable it to draw or edit zones
              </Badge>
            )}

            {Boolean(canonicalActiveDistrict || selectedTnDistrict || districtName) && (
              <Button
                size="xs"
                variant="outline"
                colorScheme="cyan"
                leftIcon={<MdGpsFixed />}
                onClick={() => handleFocusDistrict(canonicalActiveDistrict || selectedTnDistrict || districtName)}
                title={`Focus on ${canonicalActiveDistrict || selectedTnDistrict || districtName}`}
              >
                🎯 Focus {(canonicalActiveDistrict || selectedTnDistrict || districtName).split(" ")[0]}
              </Button>
            )}

            {editable && (
              <>
                {showDrawTools && (
                  <ButtonGroup size="xs" isAttached variant="outline" colorScheme="teal">
                    <Button
                      variant={!drawMode ? "solid" : "outline"}
                      colorScheme="teal"
                      onClick={() => {
                        setDrawMode(false);
                        setDraftPoints([]);
                      }}
                    >
                      ⭕ Radius
                    </Button>
                    <Button
                      variant={drawMode ? "solid" : "outline"}
                      colorScheme="teal"
                      onClick={() => setDrawMode(true)}
                    >
                      ✏️ Draw
                    </Button>
                  </ButtonGroup>
                )}

                {/* Radius Kilometres Selection */}
                {(!drawMode || !showDrawTools) && allowRadiusSelect && (
                  <HStack spacing={1.5} align="center" flexWrap="wrap">
                    <Badge
                      colorScheme="teal"
                      variant="solid"
                      px={2}
                      py={1}
                      borderRadius="6px"
                      fontSize="11px"
                      fontWeight="700"
                      letterSpacing="0.3px"
                    >
                      ⭕ Radius: {radius || radiusKm || 5} km
                    </Badge>
                    <ButtonGroup size="xs" isAttached variant="outline" colorScheme="cyan">
                      {[3, 5, 8, 10, 15, 20].map((km) => (
                        <Button
                          key={km}
                          variant={(radius || radiusKm || 5) === km ? "solid" : "outline"}
                          colorScheme="cyan"
                          fontWeight="700"
                          px={2}
                          onClick={() => applyRadius(km)}
                        >
                          {km} km
                        </Button>
                      ))}
                    </ButtonGroup>
                  </HStack>
                )}

                {drawMode && (
                  <HStack spacing={1.5}>
                    <Button
                      size="xs"
                      colorScheme="green"
                      onClick={finishDraft}
                      isDisabled={draftPoints.length < 3}
                    >
                      Finish ({draftPoints.length})
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => {
                        setDrawMode(false);
                        setDraftPoints([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}

                {!drawMode && parsedPolygon && (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => {
                      emitPolygon(null);
                      setConflictZoneKeys([]);
                      setStatus("Boundary cleared.");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </>
            )}
          </HStack>
        </Flex>
      )}

      {/* Big Dark Leaflet Canvas */}
      <Box
        ref={mapRef}
        h={height === "100%" ? "100%" : height}
        flex="1"
        w="100%"
        minH={height === "100%" ? "0" : "420px"}
        borderRadius="10px"
        border="1px solid"
        borderColor="rgba(6, 182, 212, 0.3)"
        overflow="hidden"
        boxShadow="md"
        position="relative"
        bg="#0b111e"
        style={{
          backgroundColor: "#0b111e",
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), radial-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      >
        {mapGeocode && (
          <Box
            position="absolute"
            left="10px"
            bottom="10px"
            zIndex={450}
            maxW="calc(100% - 20px)"
            bg="rgba(2, 6, 23, 0.92)"
            border="1px solid"
            borderColor="rgba(6, 182, 212, 0.45)"
            borderRadius="10px"
            px={3}
            py={2}
            boxShadow="0 6px 18px rgba(0,0,0,0.4)"
          >
            <HStack spacing={2} align="flex-start">
              <Icon as={MdLocationOn} color="cyan.300" boxSize={4} mt="1px" />
              <Box minW={0}>
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontSize="11px" fontWeight="800" color="cyan.200" noOfLines={1}>
                    {mapGeocode.label}
                  </Text>
                  <Badge colorScheme="cyan" variant="subtle" fontSize="9px" borderRadius="4px">
                    {mapGeocode.plusCode}
                  </Badge>
                </HStack>
                <Text fontSize="10px" color="gray.300" mt="1px">
                  {mapGeocode.lat.toFixed(5)}° N, {mapGeocode.lng.toFixed(5)}° E
                  {mapGeocode.pincode ? ` • PIN ${mapGeocode.pincode}` : ""}
                  {mapGeocode.adminCode ? ` • ${mapGeocode.adminCode}` : ""}
                </Text>
              </Box>
              <IconButton
                size="xs"
                variant="ghost"
                colorScheme="cyan"
                icon={<MdContentCopy />}
                aria-label="Copy geo code"
                title="Copy geo code"
                onClick={copyGeocode}
              />
            </HStack>
          </Box>
        )}
      </Box>

      {/* Clean Status Strip */}
      <Flex
        align="center"
        justify="space-between"
        px={3}
        py={1.5}
        borderRadius="8px"
        fontSize="xs"
        bg="rgba(15, 23, 42, 0.95)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
        color="gray.300"
        flexWrap="wrap"
        gap={2}
      >
        <HStack spacing={2}>
          <Icon as={MdLocationOn} color="teal.400" />
          <Text fontWeight="700" color="cyan.300">
            {selectedTnDistrict && selectedTnDistrict.toLowerCase() !== "tamil nadu"
              ? `📍 ${selectedTnDistrict} • Tamil Nadu Operational Service Grid`
              : "Tamil Nadu Operational Service Grid (All 38 Districts)"}
          </Text>
          <Text color="gray.400" fontSize="11px">
            {selectedTnDistrict && selectedTnDistrict.toLowerCase() !== "tamil nadu"
              ? "• Full state grid active • Survey of India Boundary Ready"
              : drawMode
              ? `• Click map to place boundary points (${draftPoints.length} added)`
              : "• Click any district or zone on map to inspect"}
          </Text>
        </HStack>
        {status && (
          <Text color="teal.300" fontSize="11px" fontWeight="600">
            {status}
          </Text>
        )}
      </Flex>
    </VStack>
  );
}

export { TAMIL_NADU_CITIES, CITY_LOOKUP, generateCircularGeoJSON, calculatePolygonCentroid };
