// src/components/Scheduling/ZoneHealthTab.js
// Zone & Supply Health Dashboard for Scheduled Matching — User Friendly & Easy to Read
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Center,
  Badge,
  HStack,
  VStack,
  SimpleGrid,
  Icon,
  Alert,
  AlertIcon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaMapMarkedAlt,
  FaUsers,
  FaCalendarCheck,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAppToast } from "components/feedback";
import { getZoneHealthDashboard } from "api/scheduling";

export default function ZoneHealthTab() {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getZoneHealthDashboard();
    setLoading(false);

    if (error) {
      toast.error(error, { title: "Could not load zone health telemetry", duration: 3000, isClosable: true });
      return;
    }

    setHealthData(data?.result ?? data?.data ?? data ?? null);
  }, [toast]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const zonesList = healthData?.zones || healthData?.districts || healthData?.items || [];
  const underSuppliedCount =
    healthData?.underSuppliedCount ??
    zonesList.filter((z) => z.isUnderSupplied || z.supplyStatus === "LOW").length;

  return (
    <Box>
      {/* Top Banner */}
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
        <Box>
          <HStack spacing={2}>
            <Icon as={FaMapMarkedAlt} color="teal.500" />
            <Text fontSize="sm" fontWeight="800">
              Operational Zone Supply &amp; Demand Health
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Real-time balance between scheduled customer booking slots and active verified technicians.
          </Text>
        </Box>

        <Button size="sm" variant="outline" leftIcon={<MdRefresh size={16} />} onClick={loadHealth}>
          Refresh Supply
        </Button>
      </Flex>

      {/* Under-supplied alert if any */}
      {underSuppliedCount > 0 && (
        <Alert status="warning" borderRadius="12px" mb={4} fontSize="xs">
          <AlertIcon />
          <Box>
            <Text fontWeight="800">Under-Supplied Operational Zones Detected ({underSuppliedCount}):</Text>
            <Text mt={0.5}>
              Certain zones have scheduled bookings exceeding verified technician coverage. Ensure technicians have their
              service base location verified in these areas to prevent customer fulfillment delays.
            </Text>
          </Box>
        </Alert>
      )}

      {loading ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Spinner size="lg" color="#008080" thickness="3px" />
            <Text fontSize="xs" color="gray.500">
              Analyzing operational zone supply metrics and geofence health...
            </Text>
          </VStack>
        </Center>
      ) : !healthData ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="gray.400">
              <Icon as={FaMapMarkedAlt} boxSize={8} />
            </Box>
            <Text fontWeight="700" color="gray.600">
              Zone Supply Telemetry Loading
            </Text>
            <Text fontSize="xs" color="gray.500">
              Click &quot;Refresh Supply&quot; to fetch the latest zone supply snapshot.
            </Text>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={5} align="stretch">
          {/* Health Summary Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
            <Box p={4} bg={isDark ? "gray.800" : "white"} borderRadius="12px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Monitored Zones
              </Text>
              <Text fontSize="2xl" fontWeight="900" mt={1}>
                {healthData.totalZones ?? zonesList.length}
              </Text>
              <Text fontSize="3xs" color="teal.600" mt={1}>
                ● Active geofence polygons
              </Text>
            </Box>

            <Box p={4} bg={isDark ? "gray.800" : "white"} borderRadius="12px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Under-Supplied Zones
              </Text>
              <Text fontSize="2xl" fontWeight="900" color={underSuppliedCount > 0 ? "orange.500" : "green.500"} mt={1}>
                {underSuppliedCount}
              </Text>
              <Text fontSize="3xs" color={underSuppliedCount > 0 ? "orange.600" : "green.600"} mt={1}>
                {underSuppliedCount > 0 ? "Requires technician supply" : "Optimal supply balance"}
              </Text>
            </Box>

            <Box p={4} bg={isDark ? "gray.800" : "white"} borderRadius="12px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Geo-Engine Reachability
              </Text>
              <HStack spacing={1.5} mt={1}>
                <Icon as={FaShieldAlt} color="green.500" />
                <Text fontSize="md" fontWeight="800">
                  {healthData.geoEngineStatus || "Operational"}
                </Text>
              </HStack>
              <Text fontSize="3xs" color="gray.500" mt={1}>
                Tamil Nadu boundaries live
              </Text>
            </Box>

            <Box p={4} bg={isDark ? "gray.800" : "white"} borderRadius="12px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Slot Fulfillment Ratio
              </Text>
              <Text fontSize="2xl" fontWeight="900" color="teal.600" mt={1}>
                {healthData.slotFulfillmentRatio ? `${(healthData.slotFulfillmentRatio * 100).toFixed(0)}%` : "100%"}
              </Text>
              <Text fontSize="3xs" color="teal.600" mt={1}>
                Slots covered by technician origin
              </Text>
            </Box>
          </SimpleGrid>

          {/* Zones Table */}
          {zonesList.length > 0 && (
            <Box
              overflowX="auto"
              borderRadius="12px"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <Table variant="simple" size="sm">
                <Thead bg={isDark ? "gray.800" : "gray.50"}>
                  <Tr>
                    <Th py={3.5}>OPERATIONAL ZONE / DISTRICT</Th>
                    <Th py={3.5}>ACTIVE TECHNICIANS</Th>
                    <Th py={3.5}>SCHEDULED BOOKING DEMAND</Th>
                    <Th py={3.5}>SUPPLY HEALTH</Th>
                    <Th py={3.5}>DISPATCH RECOMMENDATION</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {zonesList.map((z, idx) => {
                    const zName = z.name || z.zoneName || z.districtName || `Zone #${idx + 1}`;
                    const activeTechs = z.activeTechnicians ?? z.techCount ?? z.supply ?? 0;
                    const scheduledDemand = z.scheduledSlots ?? z.demandCount ?? z.demand ?? 0;
                    const isLow =
                      z.isUnderSupplied ||
                      z.supplyStatus === "LOW" ||
                      (scheduledDemand > activeTechs && activeTechs === 0);

                    return (
                      <Tr key={z._id || idx} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                        <Td py={3}>
                          <Text fontSize="xs" fontWeight="700">
                            {zName}
                          </Text>
                        </Td>
                        <Td py={3} fontSize="xs">
                          <HStack spacing={1.5}>
                            <Icon as={FaUsers} color="teal.500" />
                            <Text fontWeight="600">{activeTechs} Technicians</Text>
                          </HStack>
                        </Td>
                        <Td py={3} fontSize="xs">
                          <HStack spacing={1.5}>
                            <Icon as={FaCalendarCheck} color="blue.500" />
                            <Text fontWeight="600">{scheduledDemand} Slots Booked</Text>
                          </HStack>
                        </Td>
                        <Td py={3}>
                          {isLow ? (
                            <Badge colorScheme="orange" variant="solid" fontSize="3xs" px={2} py={0.5} borderRadius="full">
                              ● Under-Supplied
                            </Badge>
                          ) : (
                            <Badge colorScheme="green" variant="subtle" fontSize="3xs" px={2} py={0.5} borderRadius="full">
                              ✓ Healthy Coverage
                            </Badge>
                          )}
                        </Td>
                        <Td py={3} fontSize="2xs" color="gray.600">
                          {isLow ? (
                            <HStack spacing={1}>
                              <Icon as={FaExclamationTriangle} color="orange.500" boxSize={2.5} />
                              <Text color="orange.700" fontWeight="600">
                                Verify technician base locations in this zone
                              </Text>
                            </HStack>
                          ) : (
                            <HStack spacing={1}>
                              <Icon as={FaCheckCircle} color="green.500" boxSize={2.5} />
                              <Text color="green.700">
                                Active supply covers all scheduled slots
                              </Text>
                            </HStack>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}
