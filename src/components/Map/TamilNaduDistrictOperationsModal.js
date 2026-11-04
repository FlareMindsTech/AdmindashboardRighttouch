/**
 * TamilNaduDistrictOperationsModal.js
 *
 * High-performance full-screen operational map modal for RightTouch.
 * Displays ONLY operational service districts and active city micro-zones
 * with zero-latency instant loading, search, toolbar, and drilldown.
 */

import React, { useMemo, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { MdClose, MdAddLocation, MdMap } from "react-icons/md";
import ZoneMap from "./ZoneMap";

export default function TamilNaduDistrictOperationsModal({
  isOpen,
  onClose,
  districts = [],
  zones = [],
  focusDistrictName = "",
  onDrillDownToMicroZones,
  onCreateZone,
}) {
  const operationalDistricts = useMemo(() => {
    return (districts || []).filter(
      (d) => d.active !== false && d.isActive !== false
    );
  }, [districts]);

  const operationalZones = useMemo(() => {
    return (zones || []).filter(
      (z) => z.active !== false && z.isActive !== false
    );
  }, [zones]);

  // Ensure Leaflet recalculates viewport bounds immediately when modal opens
  useEffect(() => {
    if (isOpen) {
      const timers = [
        setTimeout(() => window.dispatchEvent(new Event("resize")), 60),
        setTimeout(() => window.dispatchEvent(new Event("resize")), 180),
        setTimeout(() => window.dispatchEvent(new Event("resize")), 450),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered={false}>
      <ModalOverlay bg="blackAlpha.850" backdropFilter="blur(6px)" />
      <ModalContent
        bg="#0b1118"
        m={0}
        p={0}
        borderRadius={0}
        h="100vh"
        maxH="100vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {/* Top Operational Header */}
        <Flex
          justify="space-between"
          align="center"
          w="100%"
          px={5}
          py={3}
          bg="#0f172a"
          borderBottom="1px solid"
          borderColor="#1e293b"
          boxShadow="sm"
          flexShrink={0}
        >
          <HStack spacing={3}>
            <HStack spacing={2}>
              <Box p={1.5} borderRadius="8px" bg="rgba(6, 182, 212, 0.15)">
                <MdMap size={20} color="#06b6d4" />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="800" color="white" letterSpacing="0.5px">
                  RightTouch Operational Service Grid
                </Text>
                <Text fontSize="11px" color="gray.400">
                  Live geofenced boundaries for operational districts & micro-zones
                </Text>
              </Box>
            </HStack>

            <Badge
              colorScheme="cyan"
              variant="solid"
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
            >
              📍 {operationalDistricts.length} Active Districts
            </Badge>

            <Badge
              colorScheme="purple"
              variant="solid"
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
            >
              🏘️ {operationalZones.length} Active Micro-Zones
            </Badge>
          </HStack>

          <HStack spacing={3}>
            {onCreateZone && (
              <Button
                size="sm"
                colorScheme="cyan"
                variant="solid"
                leftIcon={<MdAddLocation />}
                onClick={() => {
                  onClose();
                  onCreateZone();
                }}
              >
                + Add City Zone
              </Button>
            )}
            <IconButton
              aria-label="Close"
              icon={<MdClose size={20} />}
              size="sm"
              colorScheme="red"
              variant="solid"
              onClick={onClose}
            />
          </HStack>
        </Flex>

        {/* Full-screen Operational Map */}
        <ModalBody
          p={2}
          m={0}
          flex="1"
          minH="0"
          h="calc(100vh - 65px)"
          display="flex"
          flexDirection="column"
          bg="#0b1118"
        >
          <Box
            w="100%"
            h="100%"
            flex="1"
            minH="0"
            display="flex"
            flexDirection="column"
            borderRadius="8px"
            overflow="hidden"
          >
            <ZoneMap
              districts={operationalDistricts}
              allDistricts={districts}
              zones={operationalZones}
              allZones={zones}
              height="100%"
              mode="view"
              showToolbar={true}
              showSearch={true}
              showNavControls={true}
              onlyTamilNadu={true}
              viewMode="state"
              districtName={focusDistrictName || ""}
              selectedDistrictName={focusDistrictName || ""}
              onSelectDistrict={(dist) => {
                if (onDrillDownToMicroZones) {
                  onClose();
                  onDrillDownToMicroZones(dist.name || dist.city);
                }
              }}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
