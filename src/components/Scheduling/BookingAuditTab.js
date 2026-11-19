// src/components/Scheduling/BookingAuditTab.js
// Booking Inspection & Broadcast Delivery Audit — User Friendly & Easy to Read
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
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider,
  Alert,
  AlertIcon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaCopy,
  FaCheck,
  FaTimes,
  FaBullhorn,
  FaShieldAlt,
  FaCalendarAlt,
  FaUserCheck,
  FaUserTimes,
  FaExternalLinkAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAppToast } from "components/feedback";
import StatusBadge from "components/common/StatusBadge";
import {
  getAllSchedulingBookings,
  getSchedulingBookingById,
  getBroadcastAudit,
} from "api/scheduling";
import {
  formatFriendlyDateTime,
  formatFriendlyCurrency,
  formatFriendlyAddress,
  formatFriendlyRelativeTime,
  getFriendlyCandidateStatus,
  getBookingTypeMeta,
  getBroadcastSummary,
  getBookingCustomerName,
  getBookingCustomerPhone,
  getBookingTechnicianInfo,
  getBookingScheduleInfo,
  getBookingAmount,
  normalizeBroadcastAudit,
} from "./schedulingFormatters";

const bookingStatusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "green";
  if (s === "cancelled" || s === "canceled") return "red";
  if (s === "active" || s === "in_progress") return "blue";
  return "teal";
};

export default function BookingAuditTab({
  preselectedBookingId,
  onOpenCompensation,
  lockToBooking = false,
  customerLookup = null,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // State
  const [bookingsList, setBookingsList] = useState([]);
  const [searchBookingQuery, setSearchBookingQuery] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(preselectedBookingId || "");
  const activeBookingId = lockToBooking
    ? preselectedBookingId || ""
    : selectedBookingId;

  // Audit details
  const [bookingDetail, setBookingDetail] = useState(null);
  const [broadcastAudit, setBroadcastAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");

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

  // Load Bookings list
  const loadBookingsList = useCallback(async () => {
    const { data, error } = await getAllSchedulingBookings({ limit: 100 });
    if (error) {
      toast.error(error, { title: "Failed to load bookings", duration: 3000, isClosable: true });
      return;
    }
    const res = data?.result ?? data?.data ?? data ?? {};
    const items = Array.isArray(res) ? res : res?.bookings ?? res?.items ?? [];
    setBookingsList(items);

    setSelectedBookingId((current) => {
      if (current) return current;
      if (items.length === 0) return current;
      return items[0]._id || items[0].bookingId || items[0].id || "";
    });
  }, [toast]);

  useEffect(() => {
    if (lockToBooking) return;
    loadBookingsList();
  }, [loadBookingsList, lockToBooking]);

  // If preselectedBookingId changes from props
  useEffect(() => {
    if (preselectedBookingId && preselectedBookingId !== selectedBookingId) {
      setSelectedBookingId(preselectedBookingId);
    }
  }, [preselectedBookingId, selectedBookingId]);

  // Load Single Booking & Broadcast Audit
  const inspectBooking = useCallback(async (bId) => {
    if (!bId) return;
    setAuditLoading(true);
    setAuditError(null);

    const [{ data: bData, error: bError }, { data: aData }] = await Promise.all([
      getSchedulingBookingById(bId),
      getBroadcastAudit(bId),
    ]);

    setAuditLoading(false);

    if (bError) {
      setAuditError(bError);
      toast.error(bError, { title: "Could not fetch booking detail", duration: 3000, isClosable: true });
      return;
    }

    setBookingDetail(bData?.result ?? bData?.data ?? bData ?? null);
    setBroadcastAudit(normalizeBroadcastAudit(aData));
  }, [toast]);

  useEffect(() => {
    if (activeBookingId) {
      inspectBooking(activeBookingId);
    }
  }, [activeBookingId, inspectBooking]);

  const handleManualSearch = () => {
    if (!searchBookingQuery.trim()) return;
    setSelectedBookingId(searchBookingQuery.trim());
  };

  const idOf = (r) => r?._id || r?.bookingId || r?.id || "—";

  // No-Show extraction
  const noShowData = bookingDetail?.customerNoShow || bookingDetail?.noShow || null;
  const hasNoShow = Boolean(noShowData && (noShowData.status || noShowData.amount || noShowData.compensationPaise));
  const bookingTypeMeta = getBookingTypeMeta(bookingDetail);
  const broadcastSummary = getBroadcastSummary(broadcastAudit);
  const broadcastCandidates =
    broadcastAudit?.candidates || broadcastAudit?.offers || broadcastAudit?.deliveries || [];
  const customerName = getBookingCustomerName(bookingDetail, customerLookup);
  const customerPhone = getBookingCustomerPhone(bookingDetail, customerLookup);
  const technicianInfo = getBookingTechnicianInfo(bookingDetail);
  const currentTechnicianInfo = technicianInfo?.isCurrent ? technicianInfo : null;
  const schedule = getBookingScheduleInfo(bookingDetail);
  const bookingAmount = getBookingAmount(bookingDetail);

  return (
    <Box>
      {lockToBooking ? (
        <Flex justify="flex-end" mb={4}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<MdRefresh size={16} />}
            onClick={() => {
              if (activeBookingId) inspectBooking(activeBookingId);
            }}
          >
            Refresh Tracking
          </Button>
        </Flex>
      ) : (
        <>
          {/* Search & Selector Bar */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            mb={4}
            gap={3}
          >
            <HStack spacing={3} flex="1">
              <InputGroup size="sm" maxW={{ base: "100%", md: "400px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Enter or paste Booking ID to inspect..."
                  value={searchBookingQuery}
                  onChange={(e) => setSearchBookingQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  borderRadius="8px"
                  fontFamily="mono"
                />
                {searchBookingQuery && (
                  <InputRightElement>
                    <IconButton
                      size="xs"
                      icon={<FaTimes size={10} />}
                      variant="ghost"
                      onClick={() => setSearchBookingQuery("")}
                      aria-label="Clear search"
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              <Button
                size="sm"
                bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
                color="white"
                _hover={{ bg: "linear-gradient(135deg, #006666 0%, #004d4d 100%)" }}
                onClick={handleManualSearch}
                borderRadius="8px"
                fontWeight="700"
              >
                Audit Booking
              </Button>
            </HStack>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<MdRefresh size={16} />}
              onClick={() => {
                loadBookingsList();
                if (activeBookingId) inspectBooking(activeBookingId);
              }}
            >
              Refresh Data
            </Button>
          </Flex>

          {/* Quick Booking Selector Chips */}
          {bookingsList.length > 0 && (
            <Box mb={5} overflowX="auto" pb={2}>
              <HStack spacing={2}>
                <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase" whiteSpace="nowrap">
                  Recent Bookings:
                </Text>
                {bookingsList.map((b) => {
                  const bId = idOf(b);
                  const isCurrent = bId === selectedBookingId;
                  const status = String(b.status || "scheduled").toLowerCase();
                  const serviceName = b.serviceName || b.service?.name || "Service";
                  const typeMeta = getBookingTypeMeta(b);

                  return (
                    <Badge
                      key={bId}
                      cursor="pointer"
                      variant={isCurrent ? "solid" : "subtle"}
                      colorScheme={
                        isCurrent
                          ? "teal"
                          : status === "completed"
                          ? "green"
                          : status === "cancelled"
                          ? "red"
                          : "blue"
                      }
                      fontSize="2xs"
                      px={2.5}
                      py={1}
                      borderRadius="6px"
                      onClick={() => setSelectedBookingId(bId)}
                      whiteSpace="nowrap"
                      _hover={{ transform: "translateY(-1px)" }}
                      transition="all 0.15s"
                    >
                      #{String(bId).slice(-6)} • {serviceName.slice(0, 12)} • {typeMeta.label}
                    </Badge>
                  );
                })}
              </HStack>
            </Box>
          )}
        </>
      )}

      {/* Main Inspection Area */}
      {auditLoading ? (
        <Center py={20}>
          <VStack spacing={3}>
            <Spinner size="xl" color="#008080" thickness="3px" />
            <Text fontSize="sm" color="gray.500">
              Retrieving booking specifications &amp; broadcast candidate delivery logs...
            </Text>
          </VStack>
        </Center>
      ) : auditError ? (
        <Alert status="error" borderRadius="12px" mb={4}>
          <AlertIcon />
          {auditError}
        </Alert>
      ) : !bookingDetail ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="gray.400">
              <Icon as={FaSearch} boxSize={8} />
            </Box>
            <Text fontWeight="700" color="gray.600">
              Select a Booking Above to Inspect
            </Text>
            <Text fontSize="xs" color="gray.500" maxW="360px" textAlign="center">
              Click any of the recent booking chips or paste a Booking ID to audit customer requirements, slot execution, and
              the broadcast candidate wave.
            </Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
          {/* Column 1: Booking 360° Specs */}
          <Box
            p={5}
            bg={isDark ? "gray.800" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
              <HStack spacing={2.5}>
                <Box p={2} bg="teal.50" color="teal.600" borderRadius="8px">
                  <Icon as={FaShieldAlt} boxSize={4} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="800">
                    Booking Specifications
                  </Text>
                  <HStack spacing={1}>
                    <Text fontSize="2xs" color="gray.500" fontFamily="mono">
                      ID: #{String(activeBookingId).slice(-10)}
                    </Text>
                    <Tooltip label="Copy Full Booking ID" hasArrow>
                      <IconButton
                        size="2xs"
                        icon={<Icon as={copiedKey === "bId" ? FaCheck : FaCopy} boxSize={2.5} />}
                        variant="ghost"
                        colorScheme={copiedKey === "bId" ? "green" : "gray"}
                        onClick={() => copyToClipboard(activeBookingId, "bId", "Booking ID")}
                        aria-label="Copy Booking ID"
                      />
                    </Tooltip>
                  </HStack>
                </Box>
              </HStack>

              <HStack spacing={2}>
                <StatusBadge
                  colorScheme={bookingTypeMeta.color}
                  label={bookingTypeMeta.label}
                  variant="subtle"
                />
                <StatusBadge
                  status={bookingDetail.status || "Scheduled"}
                  map={bookingStatusColor}
                />
              </HStack>
            </Flex>

            {/* Customer No-Show Callout Banner if present */}
            {hasNoShow && (
              <Box
                p={3.5}
                mb={4}
                bg={isDark ? "orange.950" : "orange.50"}
                borderRadius="12px"
                border="1px solid"
                borderColor={isDark ? "orange.800" : "orange.200"}
              >
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <HStack spacing={2}>
                      <StatusBadge
                        colorScheme="orange"
                        label="Customer No-Show Reported"
                      />
                      <Text fontSize="2xs" fontWeight="700" color="orange.700">
                        Status: {noShowData.compensationStatus || noShowData.status || "Pending Review"}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="800" color={isDark ? "orange.200" : "orange.900"} mt={1}>
                      Claimed:{" "}
                      {formatFriendlyCurrency(
                        noShowData.compensationPaise != null
                          ? noShowData.compensationPaise
                          : noShowData.amount,
                        noShowData.compensationPaise != null
                      )}
                    </Text>
                  </Box>

                  {onOpenCompensation && (
                    <Button
                      size="xs"
                      colorScheme="orange"
                      rightIcon={<FaExternalLinkAlt size={9} />}
                      onClick={() => onOpenCompensation(bookingDetail)}
                    >
                      Review &amp; Settle Claim
                    </Button>
                  )}
                </Flex>
              </Box>
            )}

            {/* Spec details grid */}
            <VStack spacing={3} align="stretch" fontSize="xs">
              {/* Customer */}
              <Flex justify="space-between" align="center">
                <Text color="gray.500">Customer Name:</Text>
                <Text fontWeight="700">
                  {customerName}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.500">Customer Contact:</Text>
                <Text fontWeight="600" fontFamily="mono">
                  {customerPhone || "—"}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.500">Service Category &amp; Item:</Text>
                <Text fontWeight="700" color="teal.600">
                  {bookingDetail.serviceName ||
                    bookingDetail.serviceId?.serviceName ||
                    bookingDetail.service?.name ||
                    "—"}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.500">Booking Type:</Text>
                <HStack spacing={1.5}>
                  <Icon
                    as={bookingTypeMeta.key === "instant" ? FaClock : FaCalendarAlt}
                    color={bookingTypeMeta.key === "instant" ? "orange.500" : "blue.500"}
                  />
                  <Text fontWeight="700" color={bookingTypeMeta.key === "instant" ? "orange.600" : "blue.600"}>
                    {bookingTypeMeta.label}
                  </Text>
                  <Text fontSize="2xs" color="gray.500">
                    {bookingTypeMeta.description}
                  </Text>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.500">
                  {bookingTypeMeta.key === "instant" ? "Requested At:" : "Scheduled Date & Slot:"}
                </Text>
                <HStack spacing={1}>
                  <Icon as={FaCalendarAlt} color="gray.400" />
                  <Text fontWeight="600">
                    {formatFriendlyDateTime(schedule.date)}
                    {schedule.timeLabel ? ` (${schedule.timeLabel})` : ""}
                  </Text>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.500">Total Booking Value:</Text>
                <Text fontWeight="800" fontSize="sm" color="teal.700">
                  {formatFriendlyCurrency(bookingAmount)}
                </Text>
              </Flex>

              <Divider my={1} />

              {/* Technician */}
              <Flex justify="space-between" align="center">
                <Text color="gray.500">
                  {currentTechnicianInfo
                    ? "Assigned Technician:"
                    : technicianInfo
                    ? "Previously Assigned:"
                    : "Assigned Technician:"}
                </Text>
                {technicianInfo ? (
                  <HStack spacing={1.5}>
                    <Icon
                      as={currentTechnicianInfo ? FaUserCheck : FaUserTimes}
                      color={currentTechnicianInfo ? "green.500" : "orange.500"}
                    />
                    <Text
                      fontWeight="700"
                      color={currentTechnicianInfo ? "green.700" : "orange.600"}
                    >
                      {technicianInfo.name}
                    </Text>
                    {technicianInfo.phone && (
                      <Text fontSize="2xs" color="gray.500" fontFamily="mono">
                        {technicianInfo.phone}
                      </Text>
                    )}
                  </HStack>
                ) : (
                  <HStack spacing={1.5}>
                    <Icon as={FaUserTimes} color="gray.400" />
                    <Text color="gray.500" fontStyle="italic">
                      Unassigned • Searching for Technician
                    </Text>
                  </HStack>
                )}
              </Flex>

              {/* Service Address */}
              <Flex justify="space-between" align="flex-start">
                <Text color="gray.500">Service Destination:</Text>
                <HStack align="flex-start" maxW="280px" justify="flex-end">
                  <Icon as={FaMapMarkerAlt} color="teal.500" mt={0.5} />
                  <Text fontWeight="500" textAlign="right">
                    {formatFriendlyAddress(
                      bookingDetail.addressSnapshot ||
                        (bookingDetail.addressId &&
                        typeof bookingDetail.addressId === "object"
                          ? bookingDetail.addressId
                          : null) ||
                        bookingDetail.address ||
                        bookingDetail.serviceLocation
                    )}
                  </Text>
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* Column 2: Broadcast Delivery Audit */}
          <Box
            p={5}
            bg={isDark ? "gray.800" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
              <HStack spacing={2.5}>
                <Box p={2} bg="purple.50" color="purple.600" borderRadius="8px">
                  <Icon as={FaBullhorn} boxSize={4} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="800">
                    Broadcast Delivery &amp; Wave Audit
                  </Text>
                </Box>
              </HStack>

              {broadcastAudit && (
                <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                  Wave v{broadcastAudit.version ?? broadcastAudit.wave ?? 1}
                </Badge>
              )}
            </Flex>

            {!broadcastAudit ? (
              <Center py={12}>
                <VStack spacing={2}>
                  <Icon as={FaClock} color="gray.300" boxSize={6} />
                  <Text fontSize="xs" color="gray.500">
                    No broadcast wave logs recorded for this booking.
                  </Text>
                </VStack>
              </Center>
            ) : (
              <VStack spacing={3} align="stretch">
                {/* Wave metrics summary */}
                <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2} p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="10px">
                  <Box textAlign="center">
                    <Text fontSize="3xs" color="gray.500" textTransform="uppercase">
                      Offers Sent
                    </Text>
                    <Text fontSize="lg" fontWeight="900">
                      {broadcastSummary.totalOffers}
                    </Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="3xs" color="gray.500" textTransform="uppercase">
                      Accepted
                    </Text>
                    <Text fontSize="lg" fontWeight="900" color="green.500">
                      {broadcastSummary.accepted}
                    </Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="3xs" color="gray.500" textTransform="uppercase">
                      Rejected
                    </Text>
                    <Text fontSize="lg" fontWeight="900" color="red.500">
                      {broadcastSummary.rejected}
                    </Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="3xs" color="gray.500" textTransform="uppercase">
                      Expired
                    </Text>
                    <Text fontSize="lg" fontWeight="900" color="orange.500">
                      {broadcastSummary.expired}
                    </Text>
                  </Box>
                </SimpleGrid>

                {(broadcastSummary.pending > 0 ||
                  broadcastSummary.busy > 0 ||
                  broadcastSummary.cancelled > 0) && (
                  <HStack spacing={2} flexWrap="wrap">
                    {broadcastSummary.pending > 0 && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="3xs" borderRadius="full" px={2} py={0.5}>
                        {broadcastSummary.pending} awaiting response
                      </Badge>
                    )}
                    {broadcastSummary.busy > 0 && (
                      <Badge colorScheme="gray" variant="subtle" fontSize="3xs" borderRadius="full" px={2} py={0.5}>
                        {broadcastSummary.busy} busy / on job
                      </Badge>
                    )}
                    {broadcastSummary.cancelled > 0 && (
                      <Badge colorScheme="purple" variant="subtle" fontSize="3xs" borderRadius="full" px={2} py={0.5}>
                        {broadcastSummary.cancelled} cancelled / released
                      </Badge>
                    )}
                  </HStack>
                )}

                {/* Candidate Technicians Table */}
                <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase" mt={2}>
                  Candidate Evaluation &amp; Responses:
                </Text>

                <Box
                  overflowX="auto"
                  maxH="280px"
                  borderRadius="10px"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                >
                  <Table variant="simple" size="sm">
                    <Thead bg={isDark ? "gray.800" : "gray.50"}>
                      <Tr>
                        <Th fontSize="3xs">TECHNICIAN CANDIDATE</Th>
                        <Th fontSize="3xs">DISTANCE</Th>
                        <Th fontSize="3xs">OFFERED AT</Th>
                        <Th fontSize="3xs">RESPONDED AT</Th>
                        <Th fontSize="3xs">RESPONSE</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {broadcastCandidates.length === 0 ? (
                        <Tr>
                          <Td colSpan={5} textAlign="center" fontSize="xs" color="gray.400" py={4}>
                            No individual technician candidate responses recorded.
                          </Td>
                        </Tr>
                      ) : (
                        broadcastCandidates.map((c, idx) => {
                          const stateObj = getFriendlyCandidateStatus(c.status || c.state || c.response);
                          const techRef =
                            c.technicianId && typeof c.technicianId === "object"
                              ? c.technicianId
                              : null;
                          const candidateId =
                            techRef?._id || c.technicianId || c.technician?.id || c.id;
                          const matchedCurrentTech =
                            currentTechnicianInfo &&
                            candidateId &&
                            String(candidateId) === String(currentTechnicianInfo.id);
                          const candidateName =
                            c.technicianName ||
                            c.name ||
                            c.technician?.name ||
                            (techRef
                              ? techRef.name ||
                                techRef.fullName ||
                                `${techRef.fname || techRef.userId?.fname || ""} ${
                                  techRef.lname || techRef.userId?.lname || ""
                                }`.trim()
                              : "") ||
                            (matchedCurrentTech ? currentTechnicianInfo.name : "") ||
                            `Tech #${String(candidateId || "").slice(-6)}`;
                          const candidatePhone =
                            c.phone ||
                            techRef?.mobileNumber ||
                            techRef?.phone ||
                            techRef?.userId?.mobileNumber ||
                            (matchedCurrentTech ? currentTechnicianInfo.phone : "");
                          const offeredAt =
                            c.offeredAt || c.notifiedAt || c.sentAt || c.createdAt;
                          const respondedAt =
                            c.respondedAt ||
                            c.acceptedAt ||
                            c.rejectedAt ||
                            c.declinedAt ||
                            c.expiredAt;

                          return (
                            <Tr key={`${candidateId || "candidate"}-${idx}`} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                              <Td fontSize="xs" py={2.5}>
                                <Text fontWeight="700">
                                  {candidateName}
                                </Text>
                                {candidatePhone && (
                                  <Text fontSize="3xs" color="gray.500" fontFamily="mono">
                                    {candidatePhone}
                                  </Text>
                                )}
                              </Td>

                              <Td fontSize="xs" py={2.5} fontFamily="mono">
                                {c.distanceKm != null ? (
                                  <Badge colorScheme="blue" variant="subtle" fontSize="3xs">
                                    {Number(c.distanceKm).toFixed(1)} km
                                  </Badge>
                                ) : (
                                  <Text color="gray.400" fontSize="3xs">—</Text>
                                )}
                              </Td>

                              <Td fontSize="3xs" py={2.5} color="gray.500">
                                {offeredAt ? (
                                  <Tooltip label={formatFriendlyDateTime(offeredAt)} hasArrow>
                                    <Text>{formatFriendlyRelativeTime(offeredAt)}</Text>
                                  </Tooltip>
                                ) : (
                                  "—"
                                )}
                              </Td>

                              <Td fontSize="3xs" py={2.5} color="gray.500">
                                {respondedAt ? (
                                  <Tooltip label={formatFriendlyDateTime(respondedAt)} hasArrow>
                                    <Text>{formatFriendlyRelativeTime(respondedAt)}</Text>
                                  </Tooltip>
                                ) : (
                                  "—"
                                )}
                              </Td>

                              <Td py={2.5}>
                                <Tooltip label={stateObj.desc} hasArrow>
                                  <StatusBadge
                                    colorScheme={stateObj.color}
                                    label={stateObj.label}
                                    variant={stateObj.color === "gray" ? "subtle" : "solid"}
                                    showDot
                                  />
                                </Tooltip>
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            )}
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
}
