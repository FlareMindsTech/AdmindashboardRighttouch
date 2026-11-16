// src/components/Scheduling/BaseLocationModal.js
// Modal to inspect and set/verify technician service base location (scheduling origin)
import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  SimpleGrid,
  Button,
  Alert,
  AlertIcon,
  useColorMode,
} from "@chakra-ui/react";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import { setTechnicianBaseLocation } from "api/scheduling";

const TN_CITY_PRESETS = [
  { name: "Chennai Center", lat: "13.0827", lng: "80.2707" },
  { name: "Coimbatore RS Puram", lat: "11.0168", lng: "76.9558" },
  { name: "Tiruppur Center", lat: "11.1085", lng: "77.3411" },
  { name: "Madurai Meenakshi", lat: "9.9252", lng: "78.1198" },
  { name: "Salem New Bus Stand", lat: "11.6643", lng: "78.1460" },
  { name: "Trichy Junction", lat: "10.7905", lng: "78.7047" },
];

export default function BaseLocationModal({
  isOpen,
  onClose,
  technician,
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [verified, setVerified] = useState(true);
  const [force, setForce] = useState(false);
  const [reason, setReason] = useState("Admin verified base location for scheduling");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (technician) {
      const loc = technician.serviceBaseLocation || technician.baseLocation || {};
      const coords = loc.coordinates || [];
      // GeoJSON is [lng, lat]
      if (coords.length === 2) {
        setLng(String(coords[0]));
        setLat(String(coords[1]));
      } else {
        setLat(loc.latitude ? String(loc.latitude) : "");
        setLng(loc.longitude ? String(loc.longitude) : "");
      }
      setVerified(loc.verified !== undefined ? Boolean(loc.verified) : true);
      setForce(false);
      setReason("Admin verified base location for scheduling");
    }
  }, [technician, isOpen]);

  const handleSubmit = async () => {
    if (!lat.trim() || !lng.trim()) {
      toast({
        title: "Coordinates required",
        description: "Please enter both latitude and longitude for the technician origin.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const nLat = Number(lat);
    const nLng = Number(lng);
    if (isNaN(nLat) || isNaN(nLng) || nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) {
      toast({
        title: "Invalid coordinates",
        description: "Latitude must be between -90 and 90; longitude between -180 and 180.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    const techId = technician?._id || technician?.technicianId || technician?.id;
    const body = {
      latitude: nLat,
      longitude: nLng,
      verified: Boolean(verified),
      force: Boolean(force),
      reason: reason.trim() || "Admin base location update",
    };

    const { error } = await setTechnicianBaseLocation(techId, body);
    setSaving(false);

    if (error) {
      toast.error(error, {
        title: "Could not set base location",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Service Base Location Saved",
      description: `Updated base origin for ${technician?.name || "technician"} to (${nLat.toFixed(4)}, ${nLng.toFixed(4)}).`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onClose();
    if (onSuccess) onSuccess();
  };

  const techName = technician?.name || technician?.user?.name || "Technician";
  const techDistrict = technician?.district?.name || technician?.district || "Unassigned";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        if (saving) return;
        onClose();
      }}
      title="Set Technician Service Base Location"
      size="lg"
      primaryAction={{
        label: "Save Base Location",
        onClick: handleSubmit,
        isLoading: saving,
        colorScheme: "teal",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Info card */}
        <Box
          p={3.5}
          bg={isDark ? "teal.950" : "teal.50"}
          borderRadius="12px"
          border="1px solid"
          borderColor={isDark ? "teal.800" : "teal.200"}
        >
          <HStack justify="space-between" align="center" flexWrap="wrap">
            <Box>
              <Text fontSize="xs" fontWeight="800" color={isDark ? "teal.100" : "teal.900"}>
                {techName}
              </Text>
              <Text fontSize="2xs" color={isDark ? "teal.300" : "teal.700"} fontFamily="mono">
                ID: #{String(technician?._id || technician?.id || "—").slice(-8)}
              </Text>
            </Box>
            <Badge colorScheme="teal" fontSize="2xs">
              District: {techDistrict}
            </Badge>
          </HStack>
        </Box>

        {/* Quick presets */}
        <Box>
          <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
            Quick Tamil Nadu Hub Presets:
          </Text>
          <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
            {TN_CITY_PRESETS.map((p) => (
              <Button
                key={p.name}
                size="2xs"
                variant="outline"
                borderRadius="8px"
                onClick={() => {
                  setLat(p.lat);
                  setLng(p.lng);
                }}
                _hover={{ bg: "teal.50", borderColor: "teal.400" }}
              >
                {p.name}
              </Button>
            ))}
          </SimpleGrid>
        </Box>

        {/* Inputs */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="700">
              Latitude (°N)
            </FormLabel>
            <Input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 11.0168"
              fontFamily="mono"
              borderRadius="8px"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="700">
              Longitude (°E)
            </FormLabel>
            <Input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 76.9558"
              fontFamily="mono"
              borderRadius="8px"
            />
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel fontSize="xs" fontWeight="700">
            Audit Reason / Notes
          </FormLabel>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Home address verified via Aadhaar"
            borderRadius="8px"
            fontSize="xs"
          />
        </FormControl>

        <HStack spacing={6} pt={1}>
          <Checkbox
            isChecked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            colorScheme="teal"
            size="sm"
          >
            <Text fontSize="xs" fontWeight="600">
              Mark as Verified Origin
            </Text>
          </Checkbox>

          <Checkbox
            isChecked={force}
            onChange={(e) => setForce(e.target.checked)}
            colorScheme="orange"
            size="sm"
          >
            <Text fontSize="xs" fontWeight="600">
              Force Override (Bypass district boundary)
            </Text>
          </Checkbox>
        </HStack>

        {force && (
          <Alert status="warning" borderRadius="8px" fontSize="2xs" py={2}>
            <AlertIcon />
            Force override allows setting coordinates outside the technician&apos;s primary approved district.
          </Alert>
        )}
      </VStack>
    </AppModal>
  );
}
