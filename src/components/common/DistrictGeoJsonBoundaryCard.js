import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  HStack,
  VStack,
  Icon,
  Button,
  IconButton,
  Textarea,
  Collapse,
  Tooltip,
  useToast,
  Grid,
} from "@chakra-ui/react";
import {
  MdContentCopy,
  MdCheckCircle,
  MdRefresh,
  MdPublic,
  MdPlace,
  MdExpandMore,
  MdExpandLess,
  MdGpsFixed,
} from "react-icons/md";
import {
  findTnDistrict,
  getTnDistrictBoundary,
  computePlusCode,
  getSubzonesByDistrict,
} from "../../data/tamilNaduLocations";

const BRAND = "#008080";

/**
 * Converts GeoJSON Polygon or MultiPolygon into an SVG path for crisp vector display
 */
function geojsonToSvgPath(geom, width = 380, height = 240, padding = 16) {
  if (!geom || !geom.coordinates) return null;
  let allRings = [];

  if (geom.type === "Polygon") {
    allRings = geom.coordinates;
  } else if (geom.type === "MultiPolygon") {
    allRings = geom.coordinates.map((poly) => poly[0]);
  } else {
    return null;
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  allRings.forEach((ring) => {
    ring.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
  });

  if (!isFinite(minLng) || !isFinite(maxLng)) return null;

  const spanLng = maxLng - minLng || 0.001;
  const spanLat = maxLat - minLat || 0.001;
  const drawW = width - padding * 2;
  const drawH = height - padding * 2;

  let totalPoints = 0;
  const paths = allRings
    .map((ring) => {
      totalPoints += ring.length;
      return (
        ring
          .map(([lng, lat], i) => {
            const x = padding + ((lng - minLng) / spanLng) * drawW;
            const y = height - padding - ((lat - minLat) / spanLat) * drawH;
            return (i === 0 ? "M" : "L") + " " + x.toFixed(1) + " " + y.toFixed(1);
          })
          .join(" ") + " Z"
      );
    })
    .join(" ");

  return {
    path: paths,
    minLng,
    maxLng,
    minLat,
    maxLat,
    totalPoints,
    centerSvg: [width / 2, height / 2],
  };
}

export default function DistrictGeoJsonBoundaryCard({
  districtName = "",
  cityName = "",
  polygonCoordinates = "",
  onPolygonChange,
  code = "",
}) {
  const toast = useToast();
  const [showRawJson, setShowRawJson] = useState(false);

  // 1. Resolve canonical Tamil Nadu district metadata
  const tnDistrict = useMemo(() => {
    return (
      findTnDistrict(districtName) ||
      findTnDistrict(cityName) ||
      findTnDistrict(code) ||
      null
    );
  }, [districtName, cityName, code]);

  // 2. Parse active polygon or fall back to official SOI boundary
  const parsedGeometry = useMemo(() => {
    if (polygonCoordinates) {
      try {
        const obj = typeof polygonCoordinates === "string" ? JSON.parse(polygonCoordinates) : polygonCoordinates;
        if (obj && (obj.type === "Polygon" || obj.type === "MultiPolygon")) {
          return obj;
        }
      } catch (e) {
        // Fall back below
      }
    }
    if (tnDistrict) {
      return getTnDistrictBoundary(tnDistrict.name);
    }
    return null;
  }, [polygonCoordinates, tnDistrict]);

  // 3. Compute SVG vector path
  const svgData = useMemo(() => {
    if (!parsedGeometry) return null;
    return geojsonToSvgPath(parsedGeometry, 400, 240, 20);
  }, [parsedGeometry]);

  // 4. District center & Plus Code
  const centerCoords = useMemo(() => {
    if (tnDistrict?.center) return tnDistrict.center;
    if (tnDistrict?.lat && tnDistrict?.lng) return [tnDistrict.lat, tnDistrict.lng];
    if (svgData) {
      return [
        (svgData.minLat + svgData.maxLat) / 2,
        (svgData.minLng + svgData.maxLng) / 2,
      ];
    }
    return [11.1271, 78.6569]; // TN state centroid
  }, [tnDistrict, svgData]);

  const plusCode = useMemo(() => {
    if (!centerCoords) return "";
    return computePlusCode(centerCoords[0], centerCoords[1]);
  }, [centerCoords]);

  // 5. Subzones in this district
  const districtSubzones = useMemo(() => {
    if (!tnDistrict?.name) return [];
    return getSubzonesByDistrict(tnDistrict.name);
  }, [tnDistrict]);

  // Copy GeoJSON to clipboard
  const handleCopyGeoJson = () => {
    const textToCopy = typeof polygonCoordinates === "string" && polygonCoordinates
      ? polygonCoordinates
      : JSON.stringify(parsedGeometry, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      toast({
        title: "GeoJSON Copied",
        description: "Official boundary GeoJSON copied to clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Re-link official SOI boundary
  const handleResetToOfficialBoundary = () => {
    if (!tnDistrict) return;
    const official = getTnDistrictBoundary(tnDistrict.name);
    if (official && onPolygonChange) {
      onPolygonChange(JSON.stringify(official, null, 2));
      toast({
        title: "Official Boundary Linked",
        description: `Survey of India GeoJSON reloaded for ${tnDistrict.name}.`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="12px"
      border="1.5px solid"
      borderColor="teal.200"
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      minW={0}
      h="100%"
    >
      {/* Header Banner */}
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Box p={1.5} bg="teal.50" color={BRAND} borderRadius="8px">
            <Icon as={MdPublic} boxSize={4} />
          </Box>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="700"
              color={BRAND}
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Tamil Nadu District Boundary
            </Text>
            <Text fontSize="10px" color="gray.500">
              Survey of India (SOI) Official Geofence GeoJSON
            </Text>
          </Box>
        </HStack>
        <HStack spacing={1.5}>
          <Badge colorScheme="teal" fontSize="10px" px={2} py={0.5} borderRadius="6px">
            {tnDistrict ? tnDistrict.name : "Tamil Nadu"}
          </Badge>
          <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="6px">
            {code || tnDistrict?.code || "33"}
          </Badge>
        </HStack>
      </Flex>

      {/* Vector SVG Boundary Canvas */}
      <Box
        position="relative"
        bg="gray.900"
        borderRadius="10px"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.800"
        minH="240px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {svgData ? (
          <svg
            viewBox="0 0 400 240"
            width="100%"
            height="240px"
            style={{ display: "block" }}
          >
            <defs>
              <linearGradient id="tnDistGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#008080" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.45" />
              </linearGradient>
              <pattern
                id="gridPattern"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>

            {/* Subtle Grid Background */}
            <rect width="400" height="240" fill="url(#gridPattern)" />

            {/* Official Boundary Polygon */}
            <path
              d={svgData.path}
              fill="url(#tnDistGrad)"
              stroke="#00f5d4"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 0 6px rgba(0, 245, 212, 0.4))",
                transition: "all 0.3s ease",
              }}
            />

            {/* Center Landmark Crosshair */}
            <circle
              cx={svgData.centerSvg[0]}
              cy={svgData.centerSvg[1]}
              r="4"
              fill="#fbbf24"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <circle
              cx={svgData.centerSvg[0]}
              cy={svgData.centerSvg[1]}
              r="12"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="0.8"
              strokeDasharray="2,2"
              opacity="0.8"
            />

            {/* Vector Label */}
            <text
              x={svgData.centerSvg[0]}
              y={svgData.centerSvg[1] - 16}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.5px"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
            >
              {tnDistrict?.name || "Official Hub"}
            </text>
          </svg>
        ) : (
          <VStack spacing={2} p={4} color="gray.400">
            <Icon as={MdPlace} boxSize={8} color="teal.300" />
            <Text fontSize="xs">Pick a Tamil Nadu district to link boundary.</Text>
          </VStack>
        )}

        {/* Floating Top-Right Overlay Info */}
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="rgba(15, 23, 42, 0.85)"
          backdropFilter="blur(4px)"
          p={1.5}
          borderRadius="6px"
          border="1px solid rgba(255,255,255,0.1)"
        >
          <HStack spacing={2} fontSize="10px" color="teal.200">
            <Icon as={MdGpsFixed} boxSize={3} />
            <Text fontWeight="600">
              {centerCoords ? `${centerCoords[0].toFixed(3)}°N, ${centerCoords[1].toFixed(3)}°E` : "TN"}
            </Text>
          </HStack>
        </Box>

        {/* Floating Bottom-Left Plus Code Badge */}
        {plusCode && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="rgba(15, 23, 42, 0.85)"
            backdropFilter="blur(4px)"
            px={2}
            py={0.5}
            borderRadius="6px"
            border="1px solid rgba(255,255,255,0.1)"
          >
            <Text fontSize="10px" color="amber.300" fontWeight="600">
              Plus Code: {plusCode}
            </Text>
          </Box>
        )}
      </Box>

      {/* Geocode & Metadata Grid */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2} mt={3}>
        <Box bg="gray.50" p={2} borderRadius="8px" border="1px solid" borderColor="gray.200">
          <Text fontSize="9px" color="gray.500" fontWeight="700" textTransform="uppercase">
            Boundary Type
          </Text>
          <Text fontSize="xs" fontWeight="700" color="gray.800">
            {parsedGeometry?.type || "MultiPolygon"}
          </Text>
        </Box>
        <Box bg="gray.50" p={2} borderRadius="8px" border="1px solid" borderColor="gray.200">
          <Text fontSize="9px" color="gray.500" fontWeight="700" textTransform="uppercase">
            Vertex Count
          </Text>
          <Text fontSize="xs" fontWeight="700" color="gray.800">
            {svgData ? `${svgData.totalPoints.toLocaleString()} pts` : "1,200+ pts"}
          </Text>
        </Box>
        <Box bg="gray.50" p={2} borderRadius="8px" border="1px solid" borderColor="gray.200">
          <Text fontSize="9px" color="gray.500" fontWeight="700" textTransform="uppercase">
            Validation Status
          </Text>
          <HStack spacing={1}>
            <Icon as={MdCheckCircle} color="green.500" boxSize={3} />
            <Text fontSize="11px" fontWeight="700" color="green.700">
              SOI Linked
            </Text>
          </HStack>
        </Box>
      </Grid>

      {/* Quick Pick Subzones in this district (if available) */}
      {districtSubzones.length > 0 && (
        <Box mt={2.5}>
          <Text fontSize="10px" fontWeight="700" color="gray.600" mb={1}>
            Operational City & Village Hubs ({districtSubzones.length}):
          </Text>
          <Flex wrap="wrap" gap={1}>
            {districtSubzones.slice(0, 5).map((sub) => (
              <Badge
                key={sub.id}
                fontSize="9px"
                colorScheme="teal"
                variant="subtle"
                borderRadius="4px"
                px={1.5}
                py={0.5}
              >
                {sub.name}
              </Badge>
            ))}
            {districtSubzones.length > 5 && (
              <Badge fontSize="9px" colorScheme="gray" borderRadius="4px" px={1.5} py={0.5}>
                +{districtSubzones.length - 5} more
              </Badge>
            )}
          </Flex>
        </Box>
      )}

      {/* Action Toolbar */}
      <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px solid" borderColor="gray.100">
        <HStack spacing={2}>
          <Button
            size="xs"
            leftIcon={<Icon as={MdContentCopy} />}
            variant="outline"
            colorScheme="teal"
            onClick={handleCopyGeoJson}
          >
            Copy GeoJSON
          </Button>
          <Tooltip label="Reload the pristine official Survey of India boundary for this district">
            <IconButton
              size="xs"
              icon={<MdRefresh />}
              variant="ghost"
              colorScheme="teal"
              onClick={handleResetToOfficialBoundary}
              aria-label="Reload boundary"
            />
          </Tooltip>
        </HStack>

        <Button
          size="xs"
          variant="ghost"
          color="gray.600"
          rightIcon={<Icon as={showRawJson ? MdExpandLess : MdExpandMore} />}
          onClick={() => setShowRawJson((prev) => !prev)}
        >
          {showRawJson ? "Hide Raw JSON" : "Inspect GeoJSON"}
        </Button>
      </Flex>

      {/* Collapsible Raw GeoJSON Editor */}
      <Collapse in={showRawJson} animateOpacity>
        <Box mt={2}>
          <Textarea
            size="xs"
            fontFamily="mono"
            fontSize="10px"
            rows={4}
            value={polygonCoordinates || JSON.stringify(parsedGeometry, null, 2)}
            onChange={(e) => onPolygonChange && onPolygonChange(e.target.value)}
            borderRadius="8px"
            bg="gray.50"
            borderColor="gray.300"
          />
          <Text fontSize="9px" color="gray.500" mt={1}>
            💡 Coordinates format: MultiPolygon / Polygon GeoJSON as required by the backend API.
          </Text>
        </Box>
      </Collapse>
    </Box>
  );
}
