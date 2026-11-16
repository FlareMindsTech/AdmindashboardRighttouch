// src/components/Scheduling/TechnicianBaseLocationTab.js
// Approved technicians missing service base location review & update — User Friendly & Easy to Read
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Icon,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaCopy,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAppToast } from "components/feedback";
import TablePagination from "components/common/TablePagination";
import BaseLocationModal from "./BaseLocationModal";
import {
  getMissingBaseLocations,
  getTechnicianBaseLocation,
} from "api/scheduling";
import { getGoogleMapsUrl } from "./schedulingFormatters";

export default function TechnicianBaseLocationTab({ onRefreshMissingCount }) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [techList, setTechList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [copiedKey, setCopiedKey] = useState("");

  // Edit modal
  const [selectedTechForEdit, setSelectedTechForEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = (text, key, label = "Item") => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text).trim());
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    toast({
      title: "Copied!",
      description: `${label}: ${text}`,
      status: "info",
      duration: 1800,
      isClosable: true,
    });
  };

  const loadMissing = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getMissingBaseLocations({ page, limit });
    setLoading(false);

    if (error) {
      toast.error(error, { title: "Could not load missing base locations", duration: 3000, isClosable: true });
      return;
    }

    const res = data?.result ?? data?.data ?? data ?? {};
    const items = Array.isArray(res) ? res : res?.technicians ?? res?.items ?? [];
    setTechList(items);
    setPagination(
      res?.pagination ?? {
        total: items.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(items.length / limit)),
      }
    );

    if (onRefreshMissingCount) {
      onRefreshMissingCount(res?.pagination?.total ?? items.length);
    }
  }, [page, limit, onRefreshMissingCount, toast]);

  useEffect(() => {
    loadMissing();
  }, [loadMissing]);

  // Handle edit click
  const handleOpenEdit = async (tech) => {
    const techId = tech._id || tech.technicianId || tech.id;
    const { data } = await getTechnicianBaseLocation(techId);
    const baseLoc = data?.result ?? data?.data ?? data ?? null;

    setSelectedTechForEdit({
      ...tech,
      serviceBaseLocation: baseLoc || tech.serviceBaseLocation,
    });
    setIsModalOpen(true);
  };

  // Filtered rows
  const filteredTechs = useMemo(() => {
    if (!search.trim()) return techList;
    const q = search.toLowerCase().trim();
    return techList.filter((t) => {
      const name = String(t.name || t.user?.name || "").toLowerCase();
      const phone = String(t.mobileNumber || t.phone || t.user?.phone || "").toLowerCase();
      const dist = String(t.district?.name || t.district || "").toLowerCase();
      const id = String(t._id || t.id || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || dist.includes(q) || id.includes(q);
    });
  }, [techList, search]);

  const idOf = (t) => t._id || t.technicianId || t.id || "—";

  return (
    <Box>
      {/* Controls Bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        mb={4}
        gap={3}
      >
        <HStack spacing={2} flex="1">
          <InputGroup size="sm" maxW="320px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by technician name, phone, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="8px"
            />
            {search && (
              <InputRightElement>
                <IconButton
                  size="xs"
                  icon={<FaTimes size={10} />}
                  variant="ghost"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                />
              </InputRightElement>
            )}
          </InputGroup>

          <Button size="sm" variant="ghost" leftIcon={<MdRefresh size={16} />} onClick={loadMissing}>
            Refresh List
          </Button>
        </HStack>

        <Text fontSize="2xs" color="gray.500" fontWeight="700">
          Showing {filteredTechs.length} of {pagination.total || techList.length} Technicians Requiring Location Setup
        </Text>
      </Flex>

      {/* Table or States */}
      {loading ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Spinner size="lg" color="#008080" thickness="3px" />
            <Text fontSize="xs" color="gray.500">
              Checking approved technician base locations...
            </Text>
          </VStack>
        </Center>
      ) : filteredTechs.length === 0 ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="green.500">
              <Icon as={FaCheckCircle} boxSize={8} />
            </Box>
            <Text fontWeight="700" color="gray.600">
              All Approved Technicians Verified
            </Text>
            <Text fontSize="xs" color="gray.500" maxW="360px" textAlign="center">
              Every approved technician currently has a verified service base origin for scheduled matching.
            </Text>
          </VStack>
        </Center>
      ) : (
        <Box
          overflowX="auto"
          borderRadius="12px"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <Table variant="simple" size="sm">
            <Thead bg={isDark ? "gray.800" : "gray.50"}>
              <Tr>
                <Th py={3.5}>TECHNICIAN NAME &amp; ID</Th>
                <Th py={3.5}>MOBILE PHONE</Th>
                <Th py={3.5}>APPROVED DISTRICT</Th>
                <Th py={3.5}>GPS LOCATION STATUS</Th>
                <Th py={3.5}>GPS COORDINATES</Th>
                <Th py={3.5} textAlign="center">
                  ACTIONS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTechs.map((t, idx) => {
                const tId = idOf(t);
                const tName = t.name || t.user?.name || "Technician";
                const phone = t.mobileNumber || t.phone || t.user?.phone || "—";
                const dist = t.district?.name || t.district || "Unassigned";
                const loc = t.serviceBaseLocation || t.baseLocation || {};
                const coords = loc.coordinates || [];
                const hasCoords = coords.length === 2 || (loc.latitude && loc.longitude);
                const isVerified = Boolean(loc.verified);

                const lat = coords.length === 2 ? coords[1] : loc.latitude;
                const lng = coords.length === 2 ? coords[0] : loc.longitude;
                const mapsUrl = hasCoords ? getGoogleMapsUrl(lat, lng) : "";

                return (
                  <Tr key={tId + idx} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                    {/* Name & ID */}
                    <Td py={3}>
                      <VStack align="flex-start" spacing={0.5}>
                        <Text fontSize="xs" fontWeight="700">
                          {tName}
                        </Text>
                        <HStack spacing={1}>
                          <Text fontSize="3xs" color="gray.500" fontFamily="mono">
                            ID: #{String(tId).slice(-8)}
                          </Text>
                          <Tooltip label="Copy Technician ID" hasArrow>
                            <IconButton
                              size="2xs"
                              icon={<Icon as={copiedKey === `tid_${tId}` ? FaCheck : FaCopy} boxSize={2.5} />}
                              variant="ghost"
                              colorScheme={copiedKey === `tid_${tId}` ? "green" : "gray"}
                              onClick={() => copyToClipboard(tId, `tid_${tId}`, "Technician ID")}
                              aria-label="Copy Technician ID"
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </Td>

                    {/* Phone */}
                    <Td py={3} fontSize="xs" fontFamily="mono">
                      {phone}
                    </Td>

                    {/* District */}
                    <Td py={3}>
                      <Badge colorScheme="teal" variant="subtle" fontSize="3xs">
                        {dist}
                      </Badge>
                    </Td>

                    {/* Location Status */}
                    <Td py={3}>
                      {!hasCoords ? (
                        <Badge colorScheme="red" variant="solid" fontSize="3xs" px={2} borderRadius="full">
                          ● Missing Origin
                        </Badge>
                      ) : !isVerified ? (
                        <Badge colorScheme="orange" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
                          ● Unverified Origin
                        </Badge>
                      ) : (
                        <Badge colorScheme="green" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
                          ✓ Verified
                        </Badge>
                      )}
                    </Td>

                    {/* Coordinates & Google Maps */}
                    <Td py={3}>
                      {hasCoords ? (
                        <VStack align="flex-start" spacing={1}>
                          <Text fontSize="2xs" fontFamily="mono" color="gray.700">
                            {Number(lat).toFixed(4)}° N, {Number(lng).toFixed(4)}° E
                          </Text>
                          {mapsUrl && (
                            <Link
                              href={mapsUrl}
                              isExternal
                              fontSize="3xs"
                              color="teal.600"
                              fontWeight="bold"
                              display="inline-flex"
                              alignItems="center"
                            >
                              View on Map <Icon as={FaExternalLinkAlt} boxSize={2} ml={1} />
                            </Link>
                          )}
                        </VStack>
                      ) : (
                        <Text fontSize="2xs" color="gray.400" fontStyle="italic">
                          No coordinates on file
                        </Text>
                      )}
                    </Td>

                    {/* Actions */}
                    <Td py={3} textAlign="center">
                      <Button
                        size="xs"
                        colorScheme="teal"
                        variant="solid"
                        leftIcon={<Icon as={FaMapMarkerAlt} boxSize={2.5} />}
                        onClick={() => handleOpenEdit(t)}
                      >
                        Set Base Location
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Pagination */}
      {filteredTechs.length > 0 && (
        <Box mt={4}>
          <TablePagination
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalRows={pagination.total || techList.length}
            indexOfFirst={(pagination.page - 1) * (pagination.limit || limit)}
            indexOfLast={Math.min(
              (pagination.page || page) * (pagination.limit || limit),
              pagination.total || techList.length
            )}
            rowsPerPage={pagination.limit || limit}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
            label="technicians"
          />
        </Box>
      )}

      {/* Base Location Edit Modal */}
      <BaseLocationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTechForEdit(null);
        }}
        technician={selectedTechForEdit}
        onSuccess={loadMissing}
      />
    </Box>
  );
}
