import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { findTnDistrictForRecord } from "../../data/tamilNaduLocations";
import { getCachedDistrictOverlay, loadDistrictOverlay } from "./districtOverlayStore";

const TN_BOUNDS = [
  [7.95, 76.15],
  [13.65, 80.45],
];

const isRecordActive = (record) =>
  !!record && record.active !== false && record.isActive !== false;

export default function TamilNaduDistrictMiniMap({
  districts = [],
  selectedTnName = "",
  onSelectDistrict,
  onOpenFullMap,
  height = 300,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const onSelectRef = useRef(onSelectDistrict);

  useEffect(() => {
    onSelectRef.current = onSelectDistrict;
  }, [onSelectDistrict]);

  const [features, setFeatures] = useState(() => getCachedDistrictOverlay() || []);

  useEffect(() => {
    let cancelled = false;
    loadDistrictOverlay()
      .then((loaded) => {
        if (!cancelled) setFeatures(loaded);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const configuredByTn = useMemo(() => {
    const byTn = {};
    (districts || []).forEach((record) => {
      const tn = findTnDistrictForRecord(record);
      if (tn?.name) byTn[tn.name] = record;
    });
    return byTn;
  }, [districts]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      preferCanvas: true,
      maxBounds: TN_BOUNDS,
      maxBoundsViscosity: 1,
    });
    map.fitBounds(TN_BOUNDS, { padding: [8, 8] });
    mapRef.current = map;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);
    const timer = setTimeout(() => map.invalidateSize(), 120);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      if (typeof map.stop === "function") map.stop();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.invalidateSize();

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const styleFor = (feature) => {
      const tn = feature.properties.name;
      const record = configuredByTn[tn];
      const selected = tn === selectedTnName;

      if (selected) {
        return {
          color: "#22d3ee",
          weight: 2.4,
          opacity: 1,
          fillColor: "#0891b2",
          fillOpacity: 0.45,
        };
      }
      if (record) {
        const active = isRecordActive(record);
        return {
          color: active ? "#10b981" : "#f59e0b",
          weight: 1.3,
          opacity: 0.95,
          fillColor: active ? "#10b981" : "#f59e0b",
          fillOpacity: 0.22,
        };
      }
      return {
        color: "#64748b",
        weight: 1,
        opacity: 0.8,
        dashArray: "3 3",
        fillColor: "#1e293b",
        fillOpacity: 0.25,
      };
    };

    if (!features.length) return;

    const layer = L.geoJSON({ type: "FeatureCollection", features }, {
      style: styleFor,
      onEachFeature: (feature, geoLayer) => {
        const tn = feature.properties.name;
        const record = configuredByTn[tn];
        const status = record
          ? isRecordActive(record)
            ? "Active"
            : "Inactive"
          : "Not configured";

        geoLayer.bindTooltip(
          `<strong>${tn}</strong><br/>${status}`,
          { sticky: true, direction: "top", className: "tn-mini-tooltip" }
        );

        geoLayer.on({
          mouseover: () => {
            geoLayer.setStyle({
              weight: 2,
              fillOpacity: tn === selectedTnName ? 0.55 : 0.38,
            });
          },
          mouseout: () => geoLayer.setStyle(styleFor(feature)),
          click: () => onSelectRef.current?.(tn),
        });
      },
    }).addTo(map);

    layerRef.current = layer;

    if (selectedTnName) {
      const selectedFeature = features.find(
        (feature) => feature.properties.name === selectedTnName
      );
      if (selectedFeature) {
        const temp = L.geoJSON(selectedFeature);
        try {
          map.fitBounds(temp.getBounds(), { padding: [18, 18], maxZoom: 8 });
        } catch {
          map.fitBounds(TN_BOUNDS, { padding: [8, 8] });
        }
      }
    } else {
      map.fitBounds(TN_BOUNDS, { padding: [8, 8] });
    }
  }, [features, configuredByTn, selectedTnName]);

  return (
    <Box
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      overflow="hidden"
      bg="#0b1118"
      sx={{
        "& .leaflet-container": {
          background: "#0b1118",
          fontFamily: "inherit",
        },
        "& .tn-mini-tooltip": {
          background: "rgba(15, 23, 42, 0.96)",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          borderRadius: "6px",
          color: "#e2e8f0",
          fontSize: "11px",
          lineHeight: 1.45,
          padding: "5px 8px",
          boxShadow: "none",
        },
        "& .tn-mini-tooltip::before": {
          borderTopColor: "rgba(148, 163, 184, 0.35)",
        },
      }}
    >
      <Flex
        px={3}
        py={2}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="white">
            Tamil Nadu District Coverage
          </Text>
          <Text fontSize="xs" color="whiteAlpha.600">
            Click a district to prefill or edit
          </Text>
        </Box>
        {onOpenFullMap ? (
          <Button
            size="xs"
            variant="outline"
            colorScheme="cyan"
            onClick={onOpenFullMap}
          >
            Open Full Map
          </Button>
        ) : null}
      </Flex>

      <Box ref={containerRef} height={`${height}px`} width="100%" />

      <HStack
        px={3}
        py={2}
        spacing={3}
        flexWrap="wrap"
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
      >
        <LegendDot color="#10b981" label="Active" />
        <LegendDot color="#f59e0b" label="Inactive" />
        <LegendDot color="#64748b" label="Not configured" dashed />
      </HStack>
    </Box>
  );
}

function LegendDot({ color, label, dashed = false }) {
  return (
    <HStack spacing={1.5}>
      <Box
        w="9px"
        h="9px"
        borderRadius="sm"
        border="1px solid"
        borderColor={color}
        bg={dashed ? "transparent" : color}
        opacity={dashed ? 0.8 : 1}
      />
      <Text fontSize="10px" color="whiteAlpha.600">
        {label}
      </Text>
    </HStack>
  );
}
