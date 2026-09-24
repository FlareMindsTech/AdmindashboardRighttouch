import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  Switch,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { MdClear, MdCropSquare, MdGpsFixed, MdPlace, MdRadar, MdRefresh, MdSearch } from "react-icons/md";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_LOOKUP, TAMIL_NADU_CITIES, calculatePolygonCentroid, generateCircularGeoJSON } from "./DistrictMap.js";

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

export default function ZoneMap({
  cityName = "",
  districtName = "",
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
  onSelectDistrict,
  onSelectZone,
  onZoneSelect,
  technicians = [],
  customers = [],
  layerToggles,
  allowRadiusSelect = true,
  showToolbar = true,
  showSearch = true,
  showDrawTools = true,
  radiusKm = 10,
  onRadiusChange,
}) {
  const mode = modeProp || (readOnly || interactive === false ? "view" : "radius");
  const editable = interactive && !readOnly && mode !== "view";

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const groups = useRef({});
  const vertexMarkers = useRef([]);
  const searchTimer = useRef(null);

  const effectiveDistricts = useMemo(
    () => (Array.isArray(districts) && districts.length ? districts : Array.isArray(allDistricts) ? allDistricts : []),
    [districts, allDistricts]
  );
  const effectiveZones = useMemo(
    () => (Array.isArray(zones) && zones.length ? zones : Array.isArray(allZones) ? allZones : []),
    [zones, allZones]
  );
  const cappedZones = useMemo(() => effectiveZones.slice(0, 300), [effectiveZones]);
  const zoneOverflow = effectiveZones.length - cappedZones.length;
  const selectZone = onSelectZone || onZoneSelect;

  const [center, setCenter] = useState([11.0168, 76.9558]);
  const [radius, setRadius] = useState(radiusKm || 10);
  const [drawMode, setDrawMode] = useState(mode === "polygon");
  const [draftPoints, setDraftPoints] = useState([]); // [lat,lng][]
  const [status, setStatus] = useState("");
  const [tileFallback, setTileFallback] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
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

  useEffect(() => {
    if (radiusKm && radiusKm !== radius) setRadius(radiusKm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  // Jump to cityName preset
  useEffect(() => {
    if (!cityName) return;
    const key = String(cityName).split("(")[0].trim().toLowerCase();
    const hit = CITY_LOOKUP[key];
    if (hit && leafletMap.current) {
      setCenter(hit);
      leafletMap.current.setView(hit, 11, { animate: true });
    }
  }, [cityName]);

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
    if (c && Number.isFinite(c[0])) setCenter(c);
  }, [polyKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const emitPolygon = useCallback(
    (poly) => {
      if (onPolygonChange) onPolygonChange(poly ? JSON.stringify(poly, null, 2) : "");
    },
    [onPolygonChange]
  );

  // ---- map init (once) ----
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const map = L.map(mapRef.current, {
      center,
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    });
    const primary = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
    primary.on("tileerror", () => setTileFallback(true));
    primary.addTo(map);
    L.control.scale({ position: "bottomleft" }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: false }).addAttribution('© <a href="https://openstreetmap.org">OSM</a>').addTo(map);
    groups.current = {
      districts: L.layerGroup().addTo(map),
      zones: L.layerGroup().addTo(map),
      techs: L.layerGroup().addTo(map),
      customers: L.layerGroup().addTo(map),
      boundary: L.layerGroup().addTo(map),
      draft: L.layerGroup().addTo(map),
      center: L.layerGroup().addTo(map),
    };
    leafletMap.current = map;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapRef.current);
    const t1 = setTimeout(() => map.invalidateSize(), 120);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      map.remove();
      leafletMap.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tile fallback layer
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !tileFallback) return;
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    setStatus("OSM tiles slow — switched to HOT fallback.");
  }, [tileFallback]);

  // ---- interactions ----
  const handleRadiusAt = useCallback(
    (lat, lng, km) => {
      setCenter([lat, lng]);
      const poly = generateCircularGeoJSON(lat, lng, km);
      emitPolygon(poly);
      setStatus(`Center ${lat.toFixed(4)}, ${lng.toFixed(4)} • ${km} KM radius`);
    },
    [emitPolygon]
  );

  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    const onClick = (e) => {
      if (!editable) return;
      const { lat, lng } = e.latlng;
      if (drawMode) {
        setDraftPoints((prev) => [...prev, [lat, lng]]);
      } else {
        handleRadiusAt(lat, lng, radius);
      }
    };
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [editable, drawMode, radius, handleRadiusAt]);

  // ---- render layers ----
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    const g = groups.current;
    Object.values(g).forEach((lg) => lg && lg.clearLayers());
    vertexMarkers.current = [];
    const bounds = L.latLngBounds([]);

    // boundary (editable polygon)
    if (layers.boundary && parsedPolygon) {
      try {
        const layer = L.geoJSON(parsedPolygon, {
          style: {
            color: validation.valid ? "#0F766E" : "#DC2626",
            weight: 2.5,
            fillColor: validation.valid ? "#0D9488" : "#FCA5A5",
            fillOpacity: 0.12,
            dashArray: "8, 8",
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
              emitPolygon({ type: "Polygon", coordinates: [next, ...parsedPolygon.coordinates.slice(1)] });
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

    // center pin
    if (center && Number.isFinite(center[0])) {
      L.marker(center, { icon: centerIcon(`${center[0].toFixed(4)}, ${center[1].toFixed(4)}`), interactive: false, zIndexOffset: 500 }).addTo(g.center);
    }

    // districts
    if (layers.districts) {
      effectiveDistricts.forEach((d) => {
        if (!d?.polygon?.coordinates) return;
        const sel = selectedDistrictId && String(d._id) === String(selectedDistrictId);
        try {
          const layer = L.geoJSON(d.polygon, {
            style: { color: sel ? "#2563EB" : "#3B82F6", weight: sel ? 3 : 1.5, fillColor: "#3B82F6", fillOpacity: sel ? 0.15 : 0.05, dashArray: sel ? null : "4, 4" },
          });
          layer.bindTooltip(`District: ${d.name || d.city}`, { sticky: true });
          if (onSelectDistrict) layer.on("click", (e) => { L.DomEvent.stopPropagation(e); onSelectDistrict(d); });
          layer.addTo(g.districts);
        } catch { /* ignore bad geometry */ }
      });
    }

    // zones
    if (layers.zones) {
      cappedZones.forEach((z) => {
        if (!z?.polygon?.coordinates) return;
        const sel = selectedZoneId && String(z._id) === String(selectedZoneId);
        const isActive = z.active !== false;
        try {
          const layer = L.geoJSON(z.polygon, {
            style: {
              color: sel ? "#EA580C" : isActive ? "#16A34A" : "#9CA3AF",
              weight: sel ? 3 : 2,
              fillColor: isActive ? "#22C55E" : "#D1D5DB",
              fillOpacity: sel ? 0.3 : 0.12,
            },
          });
          layer.bindTooltip(`<b>${z.name}</b> (${z.zoneCode || ""})<br/>${isActive ? "ACTIVE 🟢" : "INACTIVE ⚪"}`, { sticky: true });
          if (selectZone) layer.on("click", (e) => { L.DomEvent.stopPropagation(e); selectZone(z); });
          layer.addTo(g.zones);
        } catch { /* ignore */ }
      });
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
  }, [parsedPolygon, validation.valid, validation.reason, effectiveDistricts, effectiveZones, cappedZones, technicians, customers, layers, center, cityName, districtName, selectedDistrictId, selectedZoneId, editable, drawMode, draftPoints, selectZone, onSelectDistrict, emitPolygon]);

  const fitAll = useCallback(() => {
    const map = leafletMap.current;
    if (!map) return;
    const g = groups.current;
    const b = L.latLngBounds([]);
    [g.boundary, g.districts, g.zones].forEach((lg) => {
      lg &&
        lg.eachLayer((l) => {
          if (l.getBounds && l.getBounds().isValid()) b.extend(l.getBounds());
        });
    });
    if (b.isValid()) map.fitBounds(b, { padding: [35, 35], maxZoom: 13 });
    else if (center) map.setView(center, 11, { animate: true });
  }, [center]);

  // ---- toolbar actions ----
  const applyRadius = (km) => {
    setRadius(km);
    if (onRadiusChange) onRadiusChange(km);
    if (!editable || drawMode) return;
    handleRadiusAt(center[0], center[1], km);
  };

  const finishDraft = () => {
    if (draftPoints.length < 3) {
      setStatus("Add at least 3 points, then Finish.");
      return;
    }
    const ring = [...draftPoints.map(([lat, lng]) => [lng, lat]), [draftPoints[0][1], draftPoints[0][0]]];
    emitPolygon({ type: "Polygon", coordinates: [ring] });
    setDraftPoints([]);
    setStatus(`Polygon saved: ${ring.length - 1} vertices.`);
  };

  const runSearch = async (q) => {
    const query = String(q || "").trim();
    if (!query) return;
    // preset first (offline-safe)
    const preset = TAMIL_NADU_CITIES.find((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    if (preset) {
      setCenter([preset.lat, preset.lng]);
      leafletMap.current?.setView([preset.lat, preset.lng], 12, { animate: true });
      if (onCitySelect) onCitySelect(preset);
      if (editable && !drawMode) handleRadiusAt(preset.lat, preset.lng, radius);
      setStatus(`Jumped to ${preset.name} (${preset.code})`);
      return;
    }
    // Nominatim fallback
    try {
      setSearching(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data?.[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCenter([lat, lng]);
        leafletMap.current?.setView([lat, lng], 12, { animate: true });
        if (editable && !drawMode) handleRadiusAt(lat, lng, radius);
        setStatus(`Found: ${data[0].display_name?.slice(0, 80)}`);
      } else {
        setStatus("No results. Try a Tamil Nadu city name.");
      }
    } catch {
      setStatus("Search offline. Use City Preset dropdown.");
    } finally {
      setSearching(false);
    }
  };

  const debouncedSearch = (v) => {
    setSearchText(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runSearch(v), 600);
  };

  const showTb = showToolbar && !readOnly ? true : showToolbar && mode === "view";

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {showTb && (
        <Flex align="center" justify="space-between" bg="teal.50" px={3} py={2} borderRadius="10px" border="1px solid" borderColor="teal.200" flexWrap="wrap" gap={2}>
          {showSearch && editable && (
            <HStack spacing={1} flex={{ base: "1 1 100%", md: "0 1 auto" }}>
              <Icon as={MdSearch} color="teal.700" boxSize={4} />
              <Input size="xs" maxW="200px" bg="white" borderRadius="6px" placeholder="Search place / city…" value={searchText} onChange={(e) => debouncedSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runSearch(searchText); }} />
              <Select size="xs" maxW="170px" bg="white" borderRadius="6px" placeholder="— TN preset —" onChange={(e) => { const c = TAMIL_NADU_CITIES.find((x) => x.name === e.target.value); if (c) { setCenter([c.lat, c.lng]); leafletMap.current?.setView([c.lat, c.lng], 11, { animate: true }); if (onCitySelect) onCitySelect(c); if (editable && !drawMode) handleRadiusAt(c.lat, c.lng, radius); } }}>
                {TAMIL_NADU_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </Select>
            </HStack>
          )}
          {editable && (
            <HStack spacing={1} flexWrap="wrap">
              {showDrawTools && (
                <ButtonGroup size="xs" isAttached variant="outline" colorScheme="teal">
                  <Button bg={!drawMode ? "teal.600" : "white"} color={!drawMode ? "white" : "teal.800"} onClick={() => { setDrawMode(false); setDraftPoints([]); }}>⭕ Radius</Button>
                  <Button bg={drawMode ? "teal.600" : "white"} color={drawMode ? "white" : "teal.800"} onClick={() => setDrawMode(true)}>✏️ Draw</Button>
                </ButtonGroup>
              )}
              {!drawMode && allowRadiusSelect && (
                <ButtonGroup size="xs" isAttached variant="outline" colorScheme="teal">
                  {[5, 10, 15, 25].map((km) => (
                    <Button key={km} bg={radius === km ? "teal.600" : "white"} color={radius === km ? "white" : "teal.800"} onClick={() => applyRadius(km)}>{km}KM</Button>
                  ))}
                </ButtonGroup>
              )}
              {drawMode && (
                <ButtonGroup size="xs" variant="outline" colorScheme="teal">
                  <Button onClick={finishDraft} isDisabled={draftPoints.length < 3}>Finish ({draftPoints.length})</Button>
                  <Button onClick={() => setDraftPoints((p) => p.slice(0, -1))} isDisabled={!draftPoints.length}>Undo</Button>
                  <Button onClick={() => { setDraftPoints([]); emitPolygon(null); setStatus("Boundary cleared."); }}>Clear</Button>
                </ButtonGroup>
              )}
            </HStack>
          )}
          <HStack spacing={2}>
            <Tooltip label="Fit all boundaries"><IconButton size="xs" icon={<MdGpsFixed />} variant="ghost" colorScheme="teal" aria-label="Fit bounds" onClick={fitAll} /></Tooltip>
            {polygonCoordinates && editable && (
              <Tooltip label="Reset to circular geofence"><IconButton size="xs" icon={<MdRefresh />} variant="ghost" colorScheme="teal" aria-label="Reset" onClick={() => handleRadiusAt(center[0], center[1], radius)} /></Tooltip>
            )}
            <HStack spacing={1}>
              <Text fontSize="10px" fontWeight="600" color="gray.600">Techs</Text>
              <Switch size="sm" colorScheme="teal" isChecked={layers.technicians} onChange={(e) => setLayers((p) => ({ ...p, technicians: e.target.checked }))} />
            </HStack>
            <HStack spacing={1}>
              <Text fontSize="10px" fontWeight="600" color="gray.600">Zones</Text>
              <Switch size="sm" colorScheme="teal" isChecked={layers.zones} onChange={(e) => setLayers((p) => ({ ...p, zones: e.target.checked }))} />
            </HStack>
          </HStack>
        </Flex>
      )}

      <Box ref={mapRef} h={height} w="100%" borderRadius="12px" border="2px solid" borderColor={validation.valid || !parsedPolygon ? "teal.300" : "red.300"} overflow="hidden" boxShadow="sm" position="relative" bg="gray.100" />

      <Flex align="center" justify="space-between" px={3} py={1.5} borderRadius="8px" fontSize="xs" bg={validation.valid ? "teal.900" : parsedPolygon ? "red.700" : "gray.700"} color="white" flexWrap="wrap" gap={2}>
        <HStack spacing={2}>
          <Icon as={drawMode && editable ? MdCropSquare : MdRadar} boxSize={3.5} color="teal.300" />
          <Text fontWeight="600">
            {drawMode && editable
              ? `Drawing: ${draftPoints.length} pts — click map to add, Finish to save${zoneOverflow > 0 ? ` • +${zoneOverflow} zones hidden (cap 300)` : ""}`
              : `${validation.valid ? "✅" : parsedPolygon ? "⚠️" : "📍"} ${validation.reason}${zoneOverflow > 0 ? ` • +${zoneOverflow} zones hidden (cap 300)` : ""}`}
          </Text>
        </HStack>
        {(status || validation.reason) && (
          <HStack spacing={1}>
            {status && <Text opacity={0.85}>{status}</Text>}
            <IconButton size="xs" icon={<MdClear />} variant="ghost" colorScheme="whiteAlpha" aria-label="Clear status" onClick={() => setStatus("")} />
          </HStack>
        )}
      </Flex>
      {searching && <Text fontSize="xs" color="gray.500">Searching…</Text>}
    </VStack>
  );
}

export { TAMIL_NADU_CITIES, CITY_LOOKUP, generateCircularGeoJSON, calculatePolygonCentroid };
