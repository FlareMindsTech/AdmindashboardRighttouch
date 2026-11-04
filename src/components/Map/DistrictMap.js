import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Select,
  Switch,
  ButtonGroup,
  Icon,
} from "@chakra-ui/react";
import {
  MdClear,
  MdPlace,
  MdRadar,
  MdRefresh,
} from "react-icons/md";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  TAMIL_NADU_DISTRICTS,
  TAMIL_NADU_CITIES,
  TAMIL_NADU_SUBZONES,
  getCitiesByDistrict,
  getSubzonesByDistrict,
  CITY_LOOKUP,
  generateCircularGeoJSON,
  calculatePolygonCentroid,
  isPointInPolygon,
  getTnDistrictBoundary,
} from "data/tamilNaduLocations.js";

// Fix Leaflet default icon paths in React build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Patch Leaflet to fix "Cannot read properties of undefined (reading '_leaflet_pos')"
// when map is removed or unmounted while a zoom transition/animation is in-flight.
if (L && L.DomUtil && !L.DomUtil._origGetPosition) {
  L.DomUtil._origGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el) {
    if (!el) return new L.Point(0, 0);
    return L.DomUtil._origGetPosition(el);
  };
}

if (L && L.Map && L.Map.prototype && !L.Map.prototype._origOnZoomTransitionEnd) {
  L.Map.prototype._origOnZoomTransitionEnd = L.Map.prototype._onZoomTransitionEnd;
  L.Map.prototype._onZoomTransitionEnd = function () {
    if (!this._mapPane || !this._animatingZoom) {
      this._animatingZoom = false;
      return;
    }
    return L.Map.prototype._origOnZoomTransitionEnd.call(this);
  };
}

if (L && L.Map && L.Map.prototype && !L.Map.prototype._origGetMapPanePos) {
  L.Map.prototype._origGetMapPanePos = L.Map.prototype._getMapPanePos;
  L.Map.prototype._getMapPanePos = function () {
    if (!this._mapPane) return new L.Point(0, 0);
    return L.Map.prototype._origGetMapPanePos.call(this);
  };
}



export {
  TAMIL_NADU_DISTRICTS,
  TAMIL_NADU_CITIES,
  TAMIL_NADU_SUBZONES,
  getCitiesByDistrict,
  getSubzonesByDistrict,
  CITY_LOOKUP,
  generateCircularGeoJSON,
  calculatePolygonCentroid,
  isPointInPolygon,
  getTnDistrictBoundary,
};

const DEFAULT_LAYER_TOGGLES = {
  districtBoundary: true,
  zoneBoundaries: true,
  technicians: true,
  customers: true,
  radiusCircle: true,
};

export default function DistrictMap({
  cityName = "",
  districtName = "",
  polygonCoordinates = "",
  onPolygonChange,
  onCitySelect,
  height = "380px",
  interactive = true,
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
  layerToggles = DEFAULT_LAYER_TOGGLES,
  onPointInspect,
  allowRadiusSelect = true,
  showToolbar = true,
  radiusKm = 10,
  onRadiusChange,
}) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  const effectiveDistricts = Array.isArray(districts) && districts.length > 0 ? districts : (Array.isArray(allDistricts) ? allDistricts : []);
  const effectiveZones = Array.isArray(zones) && zones.length > 0 ? zones : (Array.isArray(allZones) ? allZones : []);
  const effectiveSelectZone = onSelectZone || onZoneSelect;

  // Layer Groups
  const districtLayersGroup = useRef(null);
  const zoneLayersGroup = useRef(null);
  const techMarkersGroup = useRef(null);
  const customerMarkersGroup = useRef(null);
  const activePolygonGroup = useRef(null);
  const circleLayerGroup = useRef(null);
  const centerPinGroup = useRef(null);

  const [centerCoords, setCenterCoords] = useState([11.1085, 77.3411]); // Default Tirupur
  const [selectedRadius, setSelectedRadius] = useState(radiusKm || 10);
  const [geoStatus, setGeoStatus] = useState("");
  const [selectedPresetCity, setSelectedPresetCity] = useState("");
  const [selectedPresetDistrict, setSelectedPresetDistrict] = useState("");
  const [localLayerToggles, setLocalLayerToggles] = useState(layerToggles);

  useEffect(() => {
    if (radiusKm && radiusKm !== selectedRadius) {
      setSelectedRadius(radiusKm);
    }
  }, [radiusKm]);

  useEffect(() => {
    setLocalLayerToggles((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(layerToggles)) return prev;
      return layerToggles;
    });
  }, [layerToggles]);

  // Determine initial coordinates based on cityName or TAMIL_NADU_CITIES
  useEffect(() => {
    if (cityName) {
      const cleanCity = cityName.split("(")[0].trim().toLowerCase();
      if (CITY_LOOKUP[cleanCity]) {
        const [lat, lng] = CITY_LOOKUP[cleanCity];
        setCenterCoords([lat, lng]);
        if (leafletMap.current) {
          leafletMap.current.setView([lat, lng], 11, { animate: true });
        }
      }
    }
  }, [cityName]);

  // Extract center coords from existing polygon if available
  useEffect(() => {
    if (polygonCoordinates && polygonCoordinates.trim()) {
      try {
        const parsed = typeof polygonCoordinates === "object" ? polygonCoordinates : JSON.parse(polygonCoordinates);
        if (parsed?.coordinates?.[0]?.length > 0) {
          const ring = parsed.coordinates[0];
          const centroid = calculatePolygonCentroid(ring.slice(0, -1));
          if (centroid && Number.isFinite(centroid[0])) {
            setCenterCoords(centroid);
          }
        }
      } catch (e) {}
    }
  }, [polygonCoordinates]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: centerCoords,
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        subdomains: "abc",
      }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution('&copy; <a href="https://openstreetmap.org">OSM</a>')
        .addTo(map);

      // Create Layer Groups
      districtLayersGroup.current = L.layerGroup().addTo(map);
      zoneLayersGroup.current = L.layerGroup().addTo(map);
      techMarkersGroup.current = L.layerGroup().addTo(map);
      customerMarkersGroup.current = L.layerGroup().addTo(map);
      activePolygonGroup.current = L.layerGroup().addTo(map);
      circleLayerGroup.current = L.layerGroup().addTo(map);
      centerPinGroup.current = L.layerGroup().addTo(map);

      leafletMap.current = map;

      // Handle ResizeObserver to fix modal animation tile-rendering issues
      const resizeObserver = new ResizeObserver(() => {
        if (leafletMap.current) {
          leafletMap.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapRef.current);

      // F-02E: store invalidate-size timer handles so unmounting before
      // they fire cannot touch a removed map (ZoneMap cleanup pattern).
      const invalidateTimer1 = setTimeout(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      }, 100);
      const invalidateTimer2 = setTimeout(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      }, 350);

      return () => {
        clearTimeout(invalidateTimer1);
        clearTimeout(invalidateTimer2);
        resizeObserver.disconnect();
        if (leafletMap.current) {
          const m = leafletMap.current;
          m._animatingZoom = false;
          if (typeof m.stop === "function") m.stop();
          m.remove();
          leafletMap.current = null;
        }
      };
    }
  }, []);

  // 2. Click Handler for Center Pin Placement & Circular Geofence
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;

      if (interactive) {
        setCenterCoords([lat, lng]);
        setGeoStatus(`Operational Center Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        // Automatically update circular radius geofence around newly clicked center
        const autoGeo = generateCircularGeoJSON(lat, lng, selectedRadius);
        if (onPolygonChange) {
          onPolygonChange(JSON.stringify(autoGeo, null, 2));
        }

        if (onPointInspect) {
          let foundDistrict = null;
          let foundZone = null;

          if (Array.isArray(zones)) {
            for (const z of zones) {
              if (z.polygon && z.polygon.coordinates && z.polygon.coordinates[0]) {
                if (isPointInPolygon([lng, lat], z.polygon.coordinates[0])) {
                  foundZone = z;
                  break;
                }
              }
            }
          }

          if (Array.isArray(districts)) {
            for (const d of districts) {
              if (d.polygon && d.polygon.coordinates && d.polygon.coordinates[0]) {
                if (isPointInPolygon([lng, lat], d.polygon.coordinates[0])) {
                  foundDistrict = d;
                  break;
                }
              }
            }
          }

          onPointInspect({ lat, lng, district: foundDistrict, zone: foundZone });
        }
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [
    interactive,
    zones,
    districts,
    selectedRadius,
    polygonCoordinates,
    onPolygonChange,
    onPointInspect,
  ]);

  // 3. Render Active Polygon, Center Pin, Geofence Buffer & All Layers
  const renderAllLayers = useCallback(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Clear all layers
    districtLayersGroup.current?.clearLayers();
    zoneLayersGroup.current?.clearLayers();
    techMarkersGroup.current?.clearLayers();
    customerMarkersGroup.current?.clearLayers();
    activePolygonGroup.current?.clearLayers();
    circleLayerGroup.current?.clearLayers();
    centerPinGroup.current?.clearLayers();

    const bounds = L.latLngBounds([]);

    // A. Render Active Polygon (from prop polygonCoordinates or radius circle)
    let hasValidPolygon = false;
    if (polygonCoordinates && polygonCoordinates.trim()) {
      try {
        const parsed = typeof polygonCoordinates === "object" ? polygonCoordinates : JSON.parse(polygonCoordinates);

        if (parsed && (parsed.type === "Polygon" || parsed.coordinates || parsed.type === "MultiPolygon")) {
          const geoLayer = L.geoJSON(parsed, {
            style: {
              color: "#059669", // Dark Emerald stroke
              weight: 2.5,
              fillColor: "#10B981", // Emerald Green 500 fill
              fillOpacity: 0.22,
              dashArray: null,
            },
          });

          const nameTag = districtName || cityName || "Operational Boundary";
          geoLayer.bindTooltip(`📍 <b>${nameTag}</b><br/>Operational Geofence Boundary`, {
            sticky: true,
          });
          geoLayer.addTo(activePolygonGroup.current);

          if (geoLayer.getBounds().isValid()) {
            bounds.extend(geoLayer.getBounds());
            hasValidPolygon = true;
          }
        }
      } catch (err) {
        // ignore JSON parse error
      }
    }

    // B. Render Center Bullseye Pin (Exact Visual Match to Screenshot)
    if (centerCoords && centerCoords.length === 2 && Number.isFinite(centerCoords[0])) {
      const pinHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:#007F7F;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 4px 12px rgba(0,127,127,0.5);cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#E11D48" stroke-width="2.5" fill="#FFFFFF" />
            <circle cx="12" cy="12" r="5" stroke="#E11D48" stroke-width="2" fill="#FFFFFF" />
            <circle cx="12" cy="12" r="2.5" fill="#E11D48" />
          </svg>
        </div>
      `;
      const pinIcon = L.divIcon({
        html: pinHtml,
        className: "leaflet-custom-center-pin",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const pinMarker = L.marker(centerCoords, { icon: pinIcon, zIndexOffset: 1000 });
      pinMarker.bindTooltip(
        `<b>Center: ${cityName || districtName || "Operational Hub"}</b><br/>Lat: ${centerCoords[0].toFixed(4)}, Lng: ${centerCoords[1].toFixed(4)}`,
        { sticky: true }
      );
      pinMarker.addTo(centerPinGroup.current);
      bounds.extend(centerCoords);
    }

    // C. Official Survey of India Boundary Fallback (if no explicit polygon passed)
    if (!hasValidPolygon && (districtName || cityName)) {
      const official = getTnDistrictBoundary(districtName || cityName);
      if (official) {
        try {
          const geoLayer = L.geoJSON(official, {
            style: {
              color: "#059669",
              weight: 2.5,
              fillColor: "#10B981",
              fillOpacity: 0.22,
            },
          });
          const nameTag = districtName || cityName || "Official District Boundary";
          geoLayer.bindTooltip(`📍 <b>${nameTag}</b><br/>Official Survey of India Boundary`, { sticky: true });
          geoLayer.addTo(activePolygonGroup.current);
          if (geoLayer.getBounds().isValid()) {
            bounds.extend(geoLayer.getBounds());
            hasValidPolygon = true;
          }
        } catch (err) {}
      }
    }

    // C2. Fallback: If no polygon coordinates yet, render dashed circle buffer
    if (
      !hasValidPolygon &&
      localLayerToggles.radiusCircle &&
      centerCoords &&
      centerCoords.length === 2 &&
      Number.isFinite(centerCoords[0])
    ) {
      const circle = L.circle(centerCoords, {
        radius: selectedRadius * 1000,
        color: "#059669",
        fillColor: "#10B981",
        fillOpacity: 0.1,
        weight: 2.5,
        dashArray: "8, 8",
      });
      circle.bindTooltip(`⭕ ${selectedRadius} KM Service Radius Boundary`, { sticky: true });
      circle.addTo(circleLayerGroup.current);
      bounds.extend(circle.getBounds());
    }

    // D. Render Other Districts
    if (localLayerToggles.districtBoundary && Array.isArray(effectiveDistricts) && effectiveDistricts.length > 0) {
      effectiveDistricts.forEach((d) => {
        if (!d.polygon || !d.polygon.coordinates) return;
        const isSelected = selectedDistrictId && String(d._id) === String(selectedDistrictId);

        try {
          const geoLayer = L.geoJSON(d.polygon, {
            style: {
              color: isSelected ? "#007F7F" : "#059669",
              weight: isSelected ? 3 : 1.5,
              fillColor: isSelected ? "#007F7F" : "#10B981",
              fillOpacity: isSelected ? 0.35 : 0.12,
              dashArray: isSelected ? null : "4, 4",
            },
          });
          geoLayer.bindTooltip(`District: ${d.name || d.city}`, { sticky: true });
          geoLayer.addTo(districtLayersGroup.current);
        } catch (e) {}
      });
    }

    // E. Render Other Zones
    if (localLayerToggles.zoneBoundaries && Array.isArray(effectiveZones) && effectiveZones.length > 0) {
      effectiveZones.forEach((z) => {
        if (!z.polygon || !z.polygon.coordinates) return;
        const isSelected = selectedZoneId && String(z._id) === String(selectedZoneId);
        const isActive = z.active !== false;

        try {
          const geoLayer = L.geoJSON(z.polygon, {
            style: {
              color: isSelected ? "#007F7F" : isActive ? "#059669" : "#94A3B8",
              weight: isSelected ? 3 : 2,
              fillColor: isSelected ? "#007F7F" : isActive ? "#10B981" : "#CBD5E1",
              fillOpacity: isSelected ? 0.35 : isActive ? 0.25 : 0.1,
            },
          });

          geoLayer.bindTooltip(
            `<b>${z.name}</b> (${z.zoneCode || ""})<br/>Status: ${isActive ? "ACTIVE 🟢" : "INACTIVE ⚪"}`,
            { sticky: true }
          );

          if (effectiveSelectZone) {
            geoLayer.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              effectiveSelectZone(z);
            });
          }

          geoLayer.addTo(zoneLayersGroup.current);
        } catch (e) {}
      });
    }

    // F. Render Technician Markers
    if (localLayerToggles.technicians && Array.isArray(technicians)) {
      technicians.forEach((t) => {
        const coords = t.location?.coordinates;
        if (Array.isArray(coords) && coords.length === 2 && Number.isFinite(coords[1])) {
          const [lng, lat] = coords;
          const isOnline = t.availability?.isOnline === true;
          const markerHtml = `
            <div style="background:${isOnline ? "#10B981" : "#6B7280"};color:white;padding:3px 7px;border-radius:10px;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;display:flex;align-items:center;gap:3px;border:1px solid white;">
              <span>🔧</span> ${t.userId?.fname || t.fname || "Tech"}
            </div>
          `;
          const icon = L.divIcon({ html: markerHtml, className: "", iconSize: [50, 20] });
          const m = L.marker([lat, lng], { icon });
          m.bindPopup(
            `<b>Tech: ${t.userId?.fname || t.fname || ""} ${t.userId?.lname || t.lname || ""}</b><br/>Status: ${
              isOnline ? "ONLINE 🟢" : "OFFLINE ⚪"
            }<br/>Phone: ${t.userId?.mobileNumber || t.mobileNumber || "N/A"}`
          );
          m.addTo(techMarkersGroup.current);
        }
      });
    }

    // Auto-fit bounds if we have an active polygon
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
    }
  }, [
    polygonCoordinates,
    districtName,
    cityName,
    centerCoords,
    selectedRadius,
    localLayerToggles,
    districts,
    selectedDistrictId,
    zones,
    selectedZoneId,
    technicians,
    onSelectZone,
  ]);

  useEffect(() => {
    renderAllLayers();
  }, [renderAllLayers]);

  // Jump to Tamil Nadu District Preset (Exact Survey of India GeoCode Boundary)
  const handleSelectPresetDistrict = (e) => {
    const districtNameVal = e.target.value;
    setSelectedPresetDistrict(districtNameVal);
    if (!districtNameVal) return;

    const d = TAMIL_NADU_DISTRICTS.find((item) => item.name === districtNameVal);
    const boundary = getTnDistrictBoundary(districtNameVal);

    if (d || boundary) {
      const lat = d?.center?.[0] || d?.lat || 11.1085;
      const lng = d?.center?.[1] || d?.lng || 77.3411;
      setCenterCoords([lat, lng]);

      if (leafletMap.current) {
        leafletMap.current.setView([lat, lng], 10, { animate: true });
        leafletMap.current.invalidateSize();
      }

      if (boundary && onPolygonChange) {
        onPolygonChange(JSON.stringify(boundary, null, 2));
      }

      if (onCitySelect && d) {
        onCitySelect({ name: d.name, code: d.code, lat, lng });
      }

      setGeoStatus(`Selected ${districtNameVal} (${d?.code || "TN"}) — Official Survey of India GeoCode Boundary Applied`);
    }
  };

  // Jump to City Preset
  const handleSelectPresetCity = (e) => {
    const cityNameVal = e.target.value;
    setSelectedPresetCity(cityNameVal);
    if (!cityNameVal) return;

    const cityItem = TAMIL_NADU_CITIES.find((c) => c.name === cityNameVal);
    if (cityItem) {
      const lat = cityItem.lat;
      const lng = cityItem.lng;
      setCenterCoords([lat, lng]);

      if (leafletMap.current) {
        leafletMap.current.setView([lat, lng], 11, { animate: true });
        leafletMap.current.invalidateSize();
      }

      // Generate geofence polygon for selected city
      const newPoly = generateCircularGeoJSON(lat, lng, selectedRadius);
      if (onPolygonChange) {
        onPolygonChange(JSON.stringify(newPoly, null, 2));
      }

      if (onCitySelect) {
        onCitySelect(cityItem);
      }

      setGeoStatus(`Jumped to ${cityItem.name} (${cityItem.code}) — Geofence boundary active`);
    }
  };

  // Generate Circular Geofence for specified radius
  const handleGenerateRadiusGeofence = (radiusKmVal) => {
    setSelectedRadius(radiusKmVal);
    if (onRadiusChange) onRadiusChange(radiusKmVal);

    if (centerCoords && centerCoords.length === 2) {
      const newPoly = generateCircularGeoJSON(centerCoords[0], centerCoords[1], radiusKmVal);
      const jsonStr = JSON.stringify(newPoly, null, 2);
      if (onPolygonChange) onPolygonChange(jsonStr);
      setGeoStatus(`Active Geofence: ${radiusKmVal} KM radius boundary around operational center`);
    }
  };

  const handleResetBoundary = () => {
    if (centerCoords) {
      const resetPoly = generateCircularGeoJSON(centerCoords[0], centerCoords[1], selectedRadius);
      if (onPolygonChange) onPolygonChange(JSON.stringify(resetPoly, null, 2));
    } else {
      if (onPolygonChange) onPolygonChange("");
    }
    setGeoStatus("Reset boundary to default circular geofence.");
  };

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {/* Interactive Map Toolbar (District GeoJSON Preset + City Preset + Geofence KM Radii) */}
      {showToolbar && (
        <Flex
          align="center"
          justify="space-between"
          bg="teal.50"
          px={3}
          py={2}
          borderRadius="10px"
          border="1px solid"
          borderColor="teal.200"
          flexWrap="wrap"
          gap={2}
        >
          {/* Quick District & City Preset Jump */}
          <HStack spacing={2} flex={{ base: "1 1 100%", sm: "0 1 auto" }} flexWrap="wrap">
            <HStack spacing={1}>
              <Icon as={MdPlace} color="teal.700" boxSize={4} />
              <Text fontSize="xs" fontWeight="700" color="teal.900" whiteSpace="nowrap">
                District:
              </Text>
              <Select
                size="xs"
                maxW="180px"
                borderRadius="6px"
                bg="white"
                borderColor="teal.400"
                fontWeight="700"
                value={selectedPresetDistrict}
                onChange={handleSelectPresetDistrict}
              >
                <option value="">-- TN District (GeoJSON) --</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </Select>
            </HStack>

            <HStack spacing={1}>
              <Text fontSize="xs" fontWeight="600" color="teal.800" whiteSpace="nowrap">
                Town:
              </Text>
              <Select
                size="xs"
                maxW="160px"
                borderRadius="6px"
                bg="white"
                borderColor="teal.300"
                fontWeight="600"
                value={selectedPresetCity}
                onChange={handleSelectPresetCity}
              >
                <option value="">-- Jump to Town --</option>
                {TAMIL_NADU_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </Select>
            </HStack>
          </HStack>

          {/* Quick Geofence Radius Buttons */}
          {allowRadiusSelect && (
            <HStack spacing={1}>
              <Text fontSize="11px" fontWeight="700" color="teal.900">
                Geofence:
              </Text>
              <ButtonGroup size="xs" isAttached variant="outline" colorScheme="teal">
                {[5, 10, 15, 25].map((km) => (
                  <Button
                    key={km}
                    bg={selectedRadius === km ? "teal.600" : "white"}
                    color={selectedRadius === km ? "white" : "teal.800"}
                    _hover={{ bg: selectedRadius === km ? "teal.700" : "teal.100" }}
                    _active={{ bg: selectedRadius === km ? "teal.800" : "teal.200" }}
                    onClick={() => handleGenerateRadiusGeofence(km)}
                    fontWeight={selectedRadius === km ? "700" : "500"}
                  >
                    {km}KM
                  </Button>
                ))}
              </ButtonGroup>
            </HStack>
          )}

          {/* Controls: Reset + Techs Toggle */}
          <HStack spacing={2} flexWrap="wrap">
            {polygonCoordinates && (
              <Tooltip label="Reset boundary to circular geofence">
                <IconButton
                  size="xs"
                  icon={<MdRefresh />}
                  colorScheme="teal"
                  variant="ghost"
                  aria-label="Reset boundary"
                  onClick={handleResetBoundary}
                />
              </Tooltip>
            )}

            {/* Quick layer toggles */}
            <HStack spacing={2}>
              <Tooltip label="Toggle Technicians on Map">
                <HStack spacing={1}>
                  <Text fontSize="10px" fontWeight="600" color="gray.600">
                    Techs
                  </Text>
                  <Switch
                    size="sm"
                    colorScheme="teal"
                    isChecked={localLayerToggles.technicians}
                    onChange={(e) =>
                      setLocalLayerToggles((prev) => ({ ...prev, technicians: e.target.checked }))
                    }
                  />
                </HStack>
              </Tooltip>
            </HStack>
          </HStack>
        </Flex>
      )}

      {/* Leaflet Map Canvas */}
      <Box
        ref={mapRef}
        h={height}
        w="100%"
        borderRadius="12px"
        border="2px solid"
        borderColor="teal.300"
        overflow="hidden"
        boxShadow="sm"
        position="relative"
        bg="gray.100"
      />

      {/* Geo Status Notification Bar */}
      {geoStatus && (
        <Flex
          align="center"
          justify="space-between"
          bg="teal.900"
          color="white"
          px={3}
          py={1.5}
          borderRadius="8px"
          fontSize="xs"
        >
          <HStack spacing={2}>
            <Icon as={MdRadar} color="teal.300" boxSize={3.5} />
            <Text fontWeight="600">{geoStatus}</Text>
          </HStack>
          <IconButton
            size="xs"
            icon={<MdClear />}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={() => setGeoStatus("")}
            aria-label="Close"
          />
        </Flex>
      )}
    </VStack>
  );
}
