// src/components/Scheduling/NoShowCompensationTab.js
// Customer No-Show Compensation Review & Settlement Desk — User Friendly & Easy to Read
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
  HStack,
  VStack,
  Icon,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorMode,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaCopy,
  FaCheck,
  FaTimes,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAppToast } from "components/feedback";
import StatusBadge from "components/common/StatusBadge";
import NoShowCompensationModal from "./NoShowCompensationModal";
import { getAllSchedulingBookings } from "api/scheduling";
import { formatFriendlyDateTime, formatFriendlyCurrency } from "./schedulingFormatters";

export default function NoShowCompensationTab({ onRefreshPendingCount }) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("approve");
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);

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

  const loadNoShowBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getAllSchedulingBookings({ limit: 100 });
    setLoading(false);

    if (error) {
      toast.error(error, { title: "Could not load bookings for no-show claims", duration: 3000, isClosable: true });
      return;
    }

    const res = data?.result ?? data?.data ?? data ?? {};
    const items = Array.isArray(res) ? res : res?.bookings ?? res?.items ?? [];

    // Filter only bookings that have a customerNoShow or noShow field
    const claims = items.filter((b) => {
      const ns = b.customerNoShow || b.noShow;
      return Boolean(ns && (ns.status || ns.amount || ns.compensationPaise || ns.reportedAt));
    });

    setBookings(claims);

    if (onRefreshPendingCount) {
      const pendingCount = claims.filter((c) => {
        const s = String(c.customerNoShow?.status || c.noShow?.status || "").toLowerCase();
        return s === "pending" || s === "requested" || s === "reported";
      }).length;
      onRefreshPendingCount(pendingCount);
    }
  }, [onRefreshPendingCount, toast]);

  useEffect(() => {
    loadNoShowBookings();
  }, [loadNoShowBookings]);

  // Open modal for action
  const handleOpenAction = (booking, action) => {
    setSelectedBookingForModal(booking);
    setModalAction(action);
    setModalOpen(true);
  };

  // Filtered rows
  const filteredClaims = useMemo(() => {
    return bookings.filter((b) => {
      const ns = b.customerNoShow || b.noShow || {};
      const compStatus = String(ns.compensationStatus || ns.status || "pending").toLowerCase();

      // Status filter
      if (statusFilter === "PENDING") {
        if (compStatus !== "pending" && compStatus !== "requested" && compStatus !== "reported") return false;
      } else if (statusFilter === "APPROVED") {
        if (compStatus !== "approved") return false;
      } else if (statusFilter === "PAID") {
        if (compStatus !== "paid" && compStatus !== "settled" && compStatus !== "posted") return false;
      } else if (statusFilter === "REJECTED") {
        if (compStatus !== "rejected" && compStatus !== "declined") return false;
      }

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      const bId = String(b._id || b.bookingId || b.id || "").toLowerCase();
      const tName = String(b.technician?.name || b.technicianId?.name || ns.technicianName || "").toLowerCase();
      const cName = String(b.customerName || b.user?.name || "").toLowerCase();
      const utr = String(ns.providerReference || ns.reference || "").toLowerCase();

      return bId.includes(q) || tName.includes(q) || cName.includes(q) || utr.includes(q);
    });
  }, [bookings, statusFilter, search]);

  const idOf = (b) => b._id || b.bookingId || b.id || "—";

  return (
    <Box>
      {/* Workflow Banner */}
      <Box
        p={4}
        mb={4}
        bg={isDark ? "teal.950" : "teal.50"}
        borderRadius="14px"
        border="1px solid"
        borderColor={isDark ? "teal.800" : "teal.200"}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={3}
        >
          <HStack spacing={3} align="flex-start">
            <Box p={2.5} bg="teal.100" color="teal.800" borderRadius="10px">
              <Icon as={FaMoneyBillWave} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="800" color={isDark ? "teal.100" : "teal.900"}>
                Customer No-Show Compensation Lifecycle
              </Text>
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* Filter & Search Bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        mb={4}
        gap={3}
      >
        <HStack spacing={3} flex="1">
          <InputGroup size="sm" maxW="340px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by booking, technician, customer, or UTR..."
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

          <Button size="sm" variant="ghost" leftIcon={<MdRefresh size={16} />} onClick={loadNoShowBookings}>
            Refresh Claims
          </Button>
        </HStack>
      </Flex>

      {/* Preset Status Tags */}
      <HStack spacing={2} mb={4} flexWrap="wrap">
        <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase">
          Filter:
        </Text>
        <Tag
          size="sm"
          borderRadius="full"
          variant={statusFilter === "ALL" ? "solid" : "subtle"}
          colorScheme="teal"
          cursor="pointer"
          onClick={() => setStatusFilter("ALL")}
        >
          <TagLabel>All Claims ({bookings.length})</TagLabel>
        </Tag>
        <Tag
          size="sm"
          borderRadius="full"
          variant={statusFilter === "PENDING" ? "solid" : "subtle"}
          colorScheme="yellow"
          cursor="pointer"
          onClick={() => setStatusFilter("PENDING")}
        >
          <TagLabel>● Pending Review</TagLabel>
        </Tag>
        <Tag
          size="sm"
          borderRadius="full"
          variant={statusFilter === "APPROVED" ? "solid" : "subtle"}
          colorScheme="orange"
          cursor="pointer"
          onClick={() => setStatusFilter("APPROVED")}
        >
          <TagLabel>● Approved (Awaiting Payment)</TagLabel>
        </Tag>
        <Tag
          size="sm"
          borderRadius="full"
          variant={statusFilter === "PAID" ? "solid" : "subtle"}
          colorScheme="green"
          cursor="pointer"
          onClick={() => setStatusFilter("PAID")}
        >
          <TagLabel>✓ Paid &amp; Settled</TagLabel>
        </Tag>
        <Tag
          size="sm"
          borderRadius="full"
          variant={statusFilter === "REJECTED" ? "solid" : "subtle"}
          colorScheme="red"
          cursor="pointer"
          onClick={() => setStatusFilter("REJECTED")}
        >
          <TagLabel>✕ Rejected</TagLabel>
        </Tag>
      </HStack>

      {/* Table or States */}
      {loading ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Spinner size="lg" color="#008080" thickness="3px" />
            <Text fontSize="xs" color="gray.500">
              Retrieving customer no-show compensation claims...
            </Text>
          </VStack>
        </Center>
      ) : filteredClaims.length === 0 ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="green.500">
              <Icon as={FaCheckCircle} boxSize={8} />
            </Box>
            <Text fontWeight="700" color="gray.600">
              No Customer No-Show Claims Found
            </Text>
            <Text fontSize="xs" color="gray.500" maxW="360px" textAlign="center">
              {search || statusFilter !== "ALL"
                ? "No compensation claims match your current filter."
                : "No customer no-show claims have been reported on scheduled bookings."}
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
                <Th py={3.5}>BOOKING ID &amp; SLOT</Th>
                <Th py={3.5}>CLAIMING TECHNICIAN</Th>
                <Th py={3.5}>CUSTOMER NAME</Th>
                <Th py={3.5}>COMPENSATION AMOUNT</Th>
                <Th py={3.5}>LIFECYCLE STATUS</Th>
                <Th py={3.5}>BANK UTR REFERENCE</Th>
                <Th py={3.5} textAlign="center">
                  ACTIONS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredClaims.map((b, idx) => {
                const bId = idOf(b);
                const ns = b.customerNoShow || b.noShow || {};
                const compStatus = String(ns.compensationStatus || ns.status || "pending").toLowerCase();
                const isPending = compStatus === "pending" || compStatus === "requested" || compStatus === "reported";
                const isApproved = compStatus === "approved";
                const isPaid = compStatus === "paid" || compStatus === "settled" || compStatus === "posted";
                const isRejected = compStatus === "rejected" || compStatus === "declined";

                const amountFormatted = formatFriendlyCurrency(
                  ns.compensationPaise != null ? ns.compensationPaise : ns.amount,
                  ns.compensationPaise != null
                );

                const techName =
                  b.technician?.name ||
                  b.technicianId?.name ||
                  ns.technicianName ||
                  "Technician";

                const custName =
                  b.customerName ||
                  b.user?.name ||
                  b.customer?.name ||
                  "Customer";

                return (
                  <Tr key={bId + idx} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                    {/* Booking ID & Date */}
                    <Td py={3}>
                      <VStack align="flex-start" spacing={0.5}>
                        <HStack spacing={1}>
                          <Text
                            fontSize="xs"
                            fontFamily="mono"
                            fontWeight="700"
                            color={isDark ? "teal.300" : "teal.700"}
                          >
                            #{String(bId).slice(-8)}
                          </Text>
                          <Tooltip label="Copy Booking ID" hasArrow>
                            <IconButton
                              size="2xs"
                              icon={<Icon as={copiedKey === `bid_${bId}` ? FaCheck : FaCopy} boxSize={2.5} />}
                              variant="ghost"
                              colorScheme={copiedKey === `bid_${bId}` ? "green" : "gray"}
                              onClick={() => copyToClipboard(bId, `bid_${bId}`, "Booking ID")}
                              aria-label="Copy Booking ID"
                            />
                          </Tooltip>
                        </HStack>
                        <Text fontSize="3xs" color="gray.500">
                          {formatFriendlyDateTime(b.bookingDate || b.scheduledDate)}
                        </Text>
                      </VStack>
                    </Td>

                    {/* Technician */}
                    <Td py={3}>
                      <Text fontSize="xs" fontWeight="700">
                        {techName}
                      </Text>
                    </Td>

                    {/* Customer */}
                    <Td py={3}>
                      <Text fontSize="xs" color="gray.600">
                        {custName}
                      </Text>
                    </Td>

                    {/* Compensation Amount */}
                    <Td py={3} fontWeight="800" fontSize="sm" color="teal.600">
                      {amountFormatted}
                    </Td>

                    {/* Status */}
                    <Td py={3}>
                      {isPending && (
                        <StatusBadge
                          colorScheme="yellow"
                          label="Pending Review"
                          variant="subtle"
                          showDot
                        />
                      )}
                      {isApproved && (
                        <StatusBadge
                          colorScheme="orange"
                          label="Approved (Awaiting UTR)"
                          variant="subtle"
                          showDot
                        />
                      )}
                      {isPaid && (
                        <StatusBadge
                          colorScheme="green"
                          label="Settled & Posted"
                          variant="subtle"
                          showDot
                        />
                      )}
                      {isRejected && (
                        <StatusBadge
                          colorScheme="red"
                          label="Rejected"
                          variant="subtle"
                          showDot
                        />
                      )}
                    </Td>

                    {/* Settlement / UTR */}
                    <Td py={3} fontSize="xs" fontFamily="mono">
                      {ns.providerReference || ns.reference ? (
                        <HStack spacing={1}>
                          <Text fontSize="2xs" color="green.700" fontWeight="700">
                            {ns.providerReference || ns.reference}
                          </Text>
                          <Tooltip label="Copy UTR" hasArrow>
                            <IconButton
                              size="2xs"
                              icon={<Icon as={copiedKey === `utr_${bId}` ? FaCheck : FaCopy} boxSize={2.5} />}
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(ns.providerReference || ns.reference, `utr_${bId}`, "UTR")
                              }
                              aria-label="Copy UTR"
                            />
                          </Tooltip>
                        </HStack>
                      ) : (
                        <Text fontSize="3xs" color="gray.400" fontStyle="italic">
                          {isRejected ? "Dispute closed" : "Awaiting payment UTR"}
                        </Text>
                      )}
                    </Td>

                    {/* Actions */}
                    <Td py={3} textAlign="center">
                      <HStack spacing={1.5} justify="center">
                        {isPending && (
                          <>
                            <Button
                              size="xs"
                              colorScheme="teal"
                              variant="solid"
                              leftIcon={<Icon as={FaCheckCircle} boxSize={2.5} />}
                              onClick={() => handleOpenAction(b, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<Icon as={FaTimesCircle} boxSize={2.5} />}
                              onClick={() => handleOpenAction(b, "reject")}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {isApproved && (
                          <>
                            <Button
                              size="xs"
                              colorScheme="green"
                              variant="solid"
                              leftIcon={<Icon as={FaMoneyBillWave} boxSize={2.5} />}
                              onClick={() => handleOpenAction(b, "mark_paid")}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleOpenAction(b, "reject")}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {isPaid && (
                          <StatusBadge
                            colorScheme="teal"
                            label="Reconciled"
                            variant="outline"
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Compensation Action Modal */}
      <NoShowCompensationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBookingForModal(null);
        }}
        booking={selectedBookingForModal}
        actionType={modalAction}
        onSuccess={loadNoShowBookings}
      />
    </Box>
  );
}
