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

// Fix Leaflet default icon paths in React build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Comprehensive Tamil Nadu & Regional Operational Cities / Taluks in Alphabetical Order
export const TAMIL_NADU_CITIES = [
  { name: "Ambasamudram", code: "ASD", lat: 8.7061, lng: 77.4578 },
  { name: "Ambur", code: "AMB", lat: 12.7907, lng: 78.7166 },
  { name: "Arani", code: "ARN", lat: 12.6681, lng: 79.2842 },
  { name: "Attur", code: "ATT", lat: 11.5976, lng: 78.5971 },
  { name: "Avadi", code: "AVD", lat: 13.1147, lng: 80.1098 },
  { name: "Bhavani", code: "BHV", lat: 11.4468, lng: 77.6830 },
  { name: "Bodinayakanur", code: "BDN", lat: 10.0100, lng: 77.3500 },
  { name: "Chengalpattu", code: "CGL", lat: 12.6820, lng: 79.9804 },
  { name: "Chennai", code: "MAA", lat: 13.0827, lng: 80.2707 },
  { name: "Chennai Central", code: "MAA-C", lat: 13.0827, lng: 80.2707 },
  { name: "Chennai North", code: "MAA-N", lat: 13.1300, lng: 80.2500 },
  { name: "Chennai South", code: "MAA-S", lat: 12.9800, lng: 80.2200 },
  { name: "Chidambaram", code: "CDM", lat: 11.3992, lng: 79.6936 },
  { name: "Coimbatore", code: "CBE", lat: 11.0168, lng: 76.9558 },
  { name: "Cuddalore", code: "CUD", lat: 11.7480, lng: 79.7714 },
  { name: "Dharapuram", code: "DPM", lat: 10.7300, lng: 77.5300 },
  { name: "Dharmapuri", code: "DPI", lat: 12.1211, lng: 78.1582 },
  { name: "Dindigul", code: "DG", lat: 10.3673, lng: 77.9803 },
  { name: "Edappadi", code: "EDP", lat: 11.5833, lng: 77.8500 },
  { name: "Erode", code: "ERD", lat: 11.3410, lng: 77.7172 },
  { name: "Gobichettipalayam", code: "GOBI", lat: 11.4542, lng: 77.4420 },
  { name: "Hosur", code: "HSR", lat: 12.7409, lng: 77.8253 },
  { name: "Kallakurichi", code: "KLK", lat: 11.7383, lng: 78.9639 },
  { name: "Kanchipuram", code: "KPM", lat: 12.8342, lng: 79.7036 },
  { name: "Kangeyam", code: "KGM", lat: 11.0050, lng: 77.5600 },
  { name: "Kanniyakumari", code: "KNY", lat: 8.0883, lng: 77.5385 },
  { name: "Karaikudi", code: "KKD", lat: 10.0735, lng: 78.7732 },
  { name: "Karur", code: "KRR", lat: 10.9601, lng: 78.0766 },
  { name: "Katpadi", code: "KPD", lat: 12.9800, lng: 79.1300 },
  { name: "Kovilpatti", code: "KVP", lat: 9.1700, lng: 77.8700 },
  { name: "Krishnagiri", code: "KGI", lat: 12.5186, lng: 78.2137 },
  { name: "Kumbakonam", code: "KMU", lat: 10.9602, lng: 79.3845 },
  { name: "Madurai", code: "MDU", lat: 9.9252, lng: 78.1198 },
  { name: "Manapparai", code: "MNP", lat: 10.6075, lng: 78.4192 },
  { name: "Mayiladuthurai", code: "MYD", lat: 11.1018, lng: 79.6522 },
  { name: "Mettupalayam", code: "MTP", lat: 11.2994, lng: 76.9427 },
  { name: "Mettur", code: "MTR", lat: 11.7862, lng: 77.8008 },
  { name: "Nagapattinam", code: "NAG", lat: 10.7656, lng: 79.8424 },
  { name: "Nagercoil", code: "KK", lat: 8.1833, lng: 77.4119 },
  { name: "Namakkal", code: "NKL", lat: 11.2189, lng: 78.1674 },
  { name: "Palani", code: "PLN", lat: 10.4500, lng: 77.5200 },
  { name: "Perundurai", code: "PDR", lat: 11.2750, lng: 77.5850 },
  { name: "Pollachi", code: "PLC", lat: 10.6586, lng: 77.0084 },
  { name: "Pudukkottai", code: "PDK", lat: 10.3797, lng: 78.8208 },
  { name: "Rajapalayam", code: "RJP", lat: 9.4500, lng: 77.5500 },
  { name: "Ramanathapuram", code: "RMD", lat: 9.3639, lng: 78.8395 },
  { name: "Rameswaram", code: "RSM", lat: 9.2876, lng: 79.3129 },
  { name: "Ranipet", code: "RNP", lat: 12.9272, lng: 79.3331 },
  { name: "Rasipuram", code: "RPM", lat: 11.4632, lng: 78.1747 },
  { name: "Salem", code: "SLM", lat: 11.6643, lng: 78.1460 },
  { name: "Sankari", code: "SNK", lat: 11.4795, lng: 77.8690 },
  { name: "Sivaganga", code: "SVG", lat: 9.8433, lng: 78.4809 },
  { name: "Sivakasi", code: "SVK", lat: 9.4533, lng: 77.7972 },
  { name: "Sriperumbudur", code: "SPB", lat: 12.9734, lng: 79.9431 },
  { name: "Srirangam", code: "SRG", lat: 10.8622, lng: 78.6948 },
  { name: "Tambaram", code: "TBM", lat: 12.9249, lng: 80.1000 },
  { name: "Tenkasi", code: "TSI", lat: 8.9593, lng: 77.3148 },
  { name: "Thanjavur", code: "TNJ", lat: 10.7870, lng: 79.1378 },
  { name: "Theni", code: "THN", lat: 10.0104, lng: 77.4768 },
  { name: "Thirumangalam", code: "TMG", lat: 9.8247, lng: 77.9864 },
  { name: "Thoothukudi", code: "TCN", lat: 8.7642, lng: 78.1348 },
  { name: "Tiruchengode", code: "TGD", lat: 11.3789, lng: 77.8967 },
  { name: "Tirunelveli", code: "TEN", lat: 8.7139, lng: 77.7567 },
  { name: "Tirupathur", code: "TPT", lat: 12.4950, lng: 78.5678 },
  { name: "Tirupur", code: "TPR", lat: 11.1085, lng: 77.3411 },
  { name: "Tiruvallur", code: "TLR", lat: 13.1438, lng: 79.9083 },
  { name: "Tiruvannamalai", code: "TVM", lat: 12.2253, lng: 79.0747 },
  { name: "Tiruvarur", code: "TVR", lat: 10.7725, lng: 79.6365 },
  { name: "Trichy", code: "TPJ", lat: 10.7905, lng: 78.7047 },
  { name: "Udumalaipettai", code: "UDM", lat: 10.5847, lng: 77.2486 },
  { name: "Vaniyambadi", code: "VNB", lat: 12.6825, lng: 78.6186 },
  { name: "Vellore", code: "VLR", lat: 12.9165, lng: 79.1325 },
  { name: "Puducherry", code: "PDY", lat: 11.9416, lng: 79.8083 },
  { name: "The Nilgiris", code: "NLG", lat: 11.4102, lng: 76.6950 },
  { name: "Ooty", code: "UAM", lat: 11.4100, lng: 76.6950 },
  { name: "Coonoor", code: "CNR", lat: 11.3530, lng: 76.7959 },
  { name: "Villupuram", code: "VPM", lat: 11.9401, lng: 79.4861 },
  { name: "Virudhunagar", code: "VNR", lat: 9.5850, lng: 77.9600 },
];

export const CITY_LOOKUP = {};
TAMIL_NADU_CITIES.forEach((c) => {
  CITY_LOOKUP[c.name.toLowerCase().trim()] = [c.lat, c.lng];
  const shortName = c.name.split("(")[0].trim().toLowerCase();
  CITY_LOOKUP[shortName] = [c.lat, c.lng];
});

// Generate circular 32-point GeoJSON polygon around lat/lng for smooth circle preview
export const generateCircularGeoJSON = (lat, lng, radiusKm = 10, numPoints = 32) => {
  const points = [];
  const kmInDegLat = 1 / 110.574;
  const kmInDegLng = 1 / (111.32 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const rad = (angle * Math.PI) / 180;
    const pLat = parseFloat((lat + radiusKm * kmInDegLat * Math.sin(rad)).toFixed(5));
    const pLng = parseFloat((lng + radiusKm * kmInDegLng * Math.cos(rad)).toFixed(5));
    points.push([pLng, pLat]);
  }
  points.push(points[0]); // close loop

  return {
    type: "Polygon",
    coordinates: [points],
  };
};

/**
 * Ray-casting Point-in-polygon helper for Leaflet inspector
 */
export function isPointInPolygon(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Calculate centroid of polygon points
export function calculatePolygonCentroid(pts) {
  if (!pts || pts.length === 0) return [11.1085, 77.3411];
  let sumLat = 0;
  let sumLng = 0;
  const count = pts.length;
  pts.forEach((p) => {
    sumLng += p[0];
    sumLat += p[1];
  });
  return [parseFloat((sumLat / count).toFixed(5)), parseFloat((sumLng / count).toFixed(5))];
}

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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
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

      setTimeout(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      }, 100);
      setTimeout(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      }, 350);

      return () => {
        resizeObserver.disconnect();
        if (leafletMap.current) {
          leafletMap.current.remove();
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

        if (parsed && (parsed.type === "Polygon" || parsed.coordinates)) {
          const geoLayer = L.geoJSON(parsed, {
            style: {
              color: "#0F766E", // Deep Teal outline
              weight: 2.5,
              fillColor: "#0D9488", // Teal 600 fill
              fillOpacity: 0.1,
              dashArray: "8, 8", // Clean dashed border matching screenshot
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
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:#0F766E;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 4px 12px rgba(15,118,110,0.5);cursor:pointer;">
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

    // C. Fallback: If no polygon coordinates yet, render dashed circle buffer
    if (
      !hasValidPolygon &&
      localLayerToggles.radiusCircle &&
      centerCoords &&
      centerCoords.length === 2 &&
      Number.isFinite(centerCoords[0])
    ) {
      const circle = L.circle(centerCoords, {
        radius: selectedRadius * 1000,
        color: "#0F766E",
        fillColor: "#0D9488",
        fillOpacity: 0.08,
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
              color: isSelected ? "#2563EB" : "#3B82F6",
              weight: isSelected ? 3 : 1.5,
              fillColor: "#3B82F6",
              fillOpacity: isSelected ? 0.15 : 0.05,
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
              color: isSelected ? "#EA580C" : isActive ? "#16A34A" : "#9CA3AF",
              weight: isSelected ? 3 : 2,
              fillColor: isActive ? "#22C55E" : "#D1D5DB",
              fillOpacity: isSelected ? 0.3 : 0.12,
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
      {/* Interactive Map Toolbar (Clean: City Preset + Geofence KM Radii + Techs Toggle) */}
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
          {/* Quick Preset Jump */}
          <HStack spacing={2} flex={{ base: "1 1 100%", sm: "0 1 auto" }}>
            <Icon as={MdPlace} color="teal.700" boxSize={4} />
            <Text fontSize="xs" fontWeight="700" color="teal.900" whiteSpace="nowrap">
              City Preset:
            </Text>
            <Select
              size="xs"
              maxW="180px"
              borderRadius="6px"
              bg="white"
              borderColor="teal.300"
              fontWeight="600"
              value={selectedPresetCity}
              onChange={handleSelectPresetCity}
            >
              <option value="">-- Jump to TN City --</option>
              {TAMIL_NADU_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.code})
                </option>
              ))}
            </Select>
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
