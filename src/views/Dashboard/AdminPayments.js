// src/views/Dashboard/AdminPayments.js — Admin Payments & Customer Refunds
// Covers:
// 1. Customer Product & Booking Online/Offline Payments
// 2. Customer Refunds Desk (Manual External Transfers & Cancellations)
// 3. Booking Payment Audit & Lookup

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Divider,
  Icon,
  Tooltip,
  IconButton,
  Textarea,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import TablePagination from "components/common/TablePagination";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import AppModal from "components/common/AppModal";
import ErrorState from "components/feedback/ErrorState";
import { useAppToast } from "components/feedback";
import {
  FaSearch,
  FaCopy,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaCheckCircle,
  FaUndoAlt,
  FaClock,
  FaPlus,
  FaExchangeAlt,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

import {
  listProductPayments,
  getProductPaymentsSummary,
  recordOfflinePayment,
  recordOfflinePaymentForBooking,
  updateAdminPaymentStatus,
  getPaymentByBookingAdmin,
  deleteBookingAsAdmin,
} from "api/adminPayments";

import {
  listRefunds,
  markRefundProcessed,
  cancelRefund,
} from "api/refundsComplaints";

const BRAND = "#008080";

export default function AdminPayments() {
  const toast = useAppToast();
  const isDark = false;

  const [activeMainTab, setActiveMainTab] = useState(0);

  // Tab 1: Product / Incoming Payments State
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loadError, setLoadError] = useState(null);

  // Record Offline Payment Modal State
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [reference, setReference] = useState("");
  const [savingOffline, setSavingOffline] = useState(false);

  // Tab 2: Customer Refunds Desk State
  const [refunds, setRefunds] = useState([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundStatusFilter, setRefundStatusFilter] = useState("");
  const [refundSearch, setRefundSearch] = useState("");

  // Process Refund Modal State
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedRefundForProcess, setSelectedRefundForProcess] = useState(null);
  const [manualReference, setManualReference] = useState("");
  const [manualMethod, setManualMethod] = useState("upi");
  const [paidAt, setPaidAt] = useState("");
  const [processNote, setProcessNote] = useState("");
  const [processSaving, setProcessSaving] = useState(false);

  // Cancel Refund Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRefundForCancel, setSelectedRefundForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSaving, setCancelSaving] = useState(false);

  // Tab 3: Booking Lookup State
  const [lookupBookingId, setLookupBookingId] = useState("");
  const [bookingPayment, setBookingPayment] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Helpers
  const copyToClipboard = (text, label = "Item") => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text));
    toast({
      title: "Copied to clipboard",
      description: `${label}: ${text}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const idOf = (r) => r?._id || r?.paymentId || r?.id || "—";
  const inrFromPaise = (value) =>
    `₹${(Number(value || 0) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const paymentAmountPaise = (row) => {
    if (row?.totalAmountPaise != null) return Number(row.totalAmountPaise);
    if (row?.totalAmount != null) return Math.round(Number(row.totalAmount) * 100);
    if (row?.amountPaise != null) return Number(row.amountPaise);
    if (row?.amount != null) return Math.round(Number(row.amount) * 100);
    return 0;
  };

  // 1. Load Incoming Payments Summary & List
  const loadSummary = useCallback(async (isMounted = { current: true }) => {
    const { data } = await getProductPaymentsSummary();
    if (isMounted.current) {
      setSummary(data?.result ?? data?.data ?? data ?? null);
    }
  }, []);

  const loadList = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;

    const { data, error } = await listProductPayments(params);
    if (!isMounted.current) return;
    setLoading(false);
    if (error) {
      setLoadError(error);
      toast.error(error, { title: "Failed to load payments", duration: 3000, isClosable: true });
      return;
    }
    setLoadError(null);
    const result = data?.result ?? data?.data ?? data ?? {};
    const list = Array.isArray(result) ? result : result?.payments ?? [];
    setRows(list);
    setPagination(
      result?.pagination ?? {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      }
    );
  }, [limit, page, statusFilter, toast]);

  // 2. Load Customer Refunds
  const loadRefunds = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) setRefundsLoading(true);
    const params = {};
    if (refundStatusFilter) params.status = refundStatusFilter;

    const { data, error } = await listRefunds(params);
    if (!isMounted.current) return;
    setRefundsLoading(false);
    if (error) {
      toast.error(error, { title: "Failed to load customer refunds", duration: 3000, isClosable: true });
      return;
    }
    const result = data?.result ?? data?.data ?? data ?? {};
    const list = Array.isArray(result) ? result : result?.refunds ?? [];
    setRefunds(list);
  }, [refundStatusFilter, toast]);

  useEffect(() => {
    const isMounted = { current: true };
    loadSummary(isMounted);
    loadList(isMounted);
    loadRefunds(isMounted);
    return () => {
      isMounted.current = false;
    };
  }, [loadSummary, loadList, loadRefunds]);

  // Handle Offline Payment Submission
  const submitOffline = async () => {
    if (!bookingId || !amount) {
      toast({ title: "Booking and amount are required", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setSavingOffline(true);
    const payload = {
      bookingId: bookingId.trim(),
      amount: Number(amount),
      paymentMode: mode,
      transactionReference: reference.trim(),
    };

    const { error } = bookingId
      ? await recordOfflinePaymentForBooking(bookingId.trim(), payload)
      : await recordOfflinePayment(payload);

    setSavingOffline(false);
    if (error) {
      toast.error(error, { title: "Record failed", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: "Offline payment recorded successfully", status: "success", duration: 2500, isClosable: true });
    setOfflineOpen(false);
    setBookingId("");
    setAmount("");
    setReference("");
    loadList();
    loadSummary();
  };

  // Mark Incoming Payment Status
  const markStatus = async (row, status) => {
    const id = row?._id || row?.paymentId || row?.id;
    if (!id) return;
    const { error } = await updateAdminPaymentStatus(id, { status });
    if (error) {
      toast.error(error, { title: "Update failed", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: `Marked payment as ${status}`, status: "success", duration: 2000, isClosable: true });
    loadList();
    loadSummary();
  };

  // Booking Payment Lookup
  const searchBookingPayment = async () => {
    if (!lookupBookingId.trim()) {
      toast({ title: "Please enter a Booking ID", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setLookupLoading(true);
    const { data, error } = await getPaymentByBookingAdmin(lookupBookingId.trim());
    setLookupLoading(false);
    if (error) {
      toast.error(error, { title: "Booking payment lookup failed", duration: 3000, isClosable: true });
      setBookingPayment(null);
      return;
    }
    setBookingPayment(data?.result ?? data?.data ?? data ?? null);
  };

  // Delete Payment Record
  const removeBookingPayment = (id) => {
    if (!id) return;
    setPendingDeleteId(id);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const confirmRemoveBookingPayment = async () => {
    if (!pendingDeleteId) return false;
    setDeletingPayment(true);
    setDeleteError(null);
    const { error } = await deleteBookingAsAdmin(pendingDeleteId);
    setDeletingPayment(false);
    if (error) {
      const failure = new Error(error);
      setDeleteError(failure);
      toast.error(error, { title: "Failed to delete payment", duration: 3000, isClosable: true });
      throw failure;
    }
    toast({ title: "Payment deleted successfully", status: "success", duration: 2500, isClosable: true });
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
    setBookingPayment(null);
    loadList();
    loadSummary();
    return true;
  };

  // Handle Mark Refund Processed (External Transfer Completed)
  const handleOpenProcessRefund = (refund) => {
    setSelectedRefundForProcess(refund);
    setManualReference("");
    setManualMethod("upi");
    setPaidAt(new Date().toISOString().slice(0, 16));
    setProcessNote("");
    setProcessModalOpen(true);
  };

  const submitProcessRefund = async () => {
    if (!manualReference.trim()) {
      toast({ title: "External Reference / UTR is required", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setProcessSaving(true);
    const refId = selectedRefundForProcess?._id || selectedRefundForProcess?.id;
    const payload = {
      manualReference: manualReference.trim(),
      manualMethod,
      paidAt: paidAt || new Date().toISOString(),
      note: processNote.trim(),
    };

    const { error } = await markRefundProcessed(refId, payload);
    setProcessSaving(false);
    if (error) {
      toast.error(error, { title: "Could not mark refund processed", duration: 3500, isClosable: true });
      return;
    }

    toast({
      title: "Refund recorded as processed",
      description: `UTR ${manualReference} logged. Customer notified.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setProcessModalOpen(false);
    setSelectedRefundForProcess(null);
    loadRefunds();
  };

  // Handle Cancel Refund (Reverse Escrow Reservation & Clawback)
  const handleOpenCancelRefund = (refund) => {
    setSelectedRefundForCancel(refund);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const submitCancelRefund = async () => {
    if (!cancelReason.trim()) {
      toast({ title: "Cancel reason is required", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setCancelSaving(true);
    const refId = selectedRefundForCancel?._id || selectedRefundForCancel?.id;
    const { error } = await cancelRefund(refId, { cancelReason: cancelReason.trim() });
    setCancelSaving(false);
    if (error) {
      toast.error(error, { title: "Could not cancel refund", duration: 3500, isClosable: true });
      return;
    }

    toast({
      title: "Refund cancelled",
      description: "Payment reservation released and technician clawback reversed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setCancelModalOpen(false);
    setSelectedRefundForCancel(null);
    loadRefunds();
  };

  // Filtered Payments List (by search)
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((r) => {
      const pid = String(idOf(r)).toLowerCase();
      const bid = String(r?.bookingId?._id || r?.bookingId || "").toLowerCase();
      const ref = String(r?.transactionReference || r?.paymentId || "").toLowerCase();
      return pid.includes(q) || bid.includes(q) || ref.includes(q);
    });
  }, [rows, searchQuery]);

  // Filtered Refunds List (by search)
  const filteredRefunds = useMemo(() => {
    if (!refundSearch.trim()) return refunds;
    const q = refundSearch.toLowerCase().trim();
    return refunds.filter((rf) => {
      const rid = String(rf._id || rf.id || "").toLowerCase();
      const bid = String(rf.bookingId || rf.booking?._id || "").toLowerCase();
      const uRef = String(rf.manualReference || rf.reference || "").toLowerCase();
      const cName = String(rf.customerName || rf.user?.name || "").toLowerCase();
      return rid.includes(q) || bid.includes(q) || uRef.includes(q) || cName.includes(q);
    });
  }, [refunds, refundSearch]);

  // Calculate Refund Stats
  const pendingRefundsCount = useMemo(() => {
    return refunds.filter((r) => {
      const s = String(r.status || "").toLowerCase();
      return s === "pending_manual" || s === "pending" || s === "requested";
    }).length;
  }, [refunds]);

  const processedRefundsTotalPaise = useMemo(() => {
    return refunds
      .filter((r) => String(r.status || "").toLowerCase() === "processed")
      .reduce((sum, r) => sum + (r.amountPaise || (r.amount ? r.amount * 100 : 0)), 0);
  }, [refunds]);

  return (
    <Box pt={{ base: "120px", md: "80px" }} px={{ base: "16px", md: "24px" }} pb="40px">
      <VStack spacing={6} align="stretch">
        {/* ================= 1. PAGE HEADER ================= */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <Box>
            <Heading as="h1" size="lg" fontWeight="900" letterSpacing="-0.5px" color={isDark ? "white" : "gray.850"}>
              Admin Payments & Customer Refunds
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Track customer revenue, record offline payments, and process manual customer refunds with external UTRs.
            </Text>
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            <Button
              size="sm"
              bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
              color="white"
              _hover={{ bg: "linear-gradient(135deg, #006666 0%, #004d4d 100%)" }}
              leftIcon={<FaPlus size={12} />}
              fontWeight="800"
              borderRadius="10px"
              px={4}
              onClick={() => setOfflineOpen(true)}
            >
              + Record Offline Payment
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderRadius="10px"
              fontWeight="700"
              leftIcon={<MdRefresh size={16} />}
              onClick={() => {
                loadSummary();
                loadList();
                loadRefunds();
              }}
            >
              Refresh Desk
            </Button>
          </HStack>
        </Flex>

        {/* ================= 2. KPI SUMMARY CARDS ================= */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          <Box
            p={4}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Collected Revenue
              </Text>
              <Box p={2} bg="green.50" color="green.600" borderRadius="8px">
                <Icon as={FaMoneyBillWave} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {inrFromPaise(summary?.paidPaise)}
            </Text>
            <Text fontSize="2xs" color="green.600" fontWeight="600" mt={1}>
              ● Confirmed customer inflows
            </Text>
          </Box>

          <Box
            p={4}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Pending Manual Refunds
              </Text>
              <Box p={2} bg="orange.50" color="orange.600" borderRadius="8px">
                <Icon as={FaClock} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color="orange.500">
              {pendingRefundsCount}
            </Text>
            <Text fontSize="2xs" color="orange.600" fontWeight="600" mt={1}>
              Awaiting external transfer & UTR
            </Text>
          </Box>

          <Box
            p={4}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Processed Refunds
              </Text>
              <Box p={2} bg="teal.50" color="teal.600" borderRadius="8px">
                <Icon as={FaUndoAlt} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {inrFromPaise(processedRefundsTotalPaise)}
            </Text>
            <Text fontSize="2xs" color="gray.500" fontWeight="600" mt={1}>
              Total external transfers settled
            </Text>
          </Box>

          <Box
            p={4}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Total Payment Records
              </Text>
              <Box p={2} bg="blue.50" color="blue.600" borderRadius="8px">
                <Icon as={FaFileInvoiceDollar} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {pagination.total || rows.length}
            </Text>
            <Text fontSize="2xs" color="gray.500" fontWeight="600" mt={1}>
              Online & recorded offline
            </Text>
          </Box>
        </SimpleGrid>

        {/* ================= 3. MAIN NAVIGATION TABS ================= */}
        <Card bg={isDark ? "gray.850" : "white"} borderRadius="16px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
          <CardHeader pb={0} pt={4} px={6}>
            <Tabs index={activeMainTab} onChange={setActiveMainTab} colorScheme="teal" variant="enclosed">
              <TabList borderBottom="2px solid" borderColor="gray.100">
                <Tab fontWeight="700" fontSize="sm">
                  <HStack spacing={2}>
                    <Icon as={FaMoneyBillWave} />
                    <Text>Product & Customer Payments</Text>
                    <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="3xs">
                      {pagination.total || rows.length}
                    </Badge>
                  </HStack>
                </Tab>

                <Tab fontWeight="700" fontSize="sm">
                  <HStack spacing={2}>
                    <Icon as={FaUndoAlt} />
                    <Text>Customer Refunds Desk</Text>
                    {pendingRefundsCount > 0 ? (
                      <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2} fontSize="3xs">
                        {pendingRefundsCount} Action Required
                      </Badge>
                    ) : (
                      <Badge colorScheme="gray" borderRadius="full" px={2} fontSize="3xs">
                        {refunds.length}
                      </Badge>
                    )}
                  </HStack>
                </Tab>

                <Tab fontWeight="700" fontSize="sm">
                  <HStack spacing={2}>
                    <Icon as={FaSearch} />
                    <Text>Booking Payment Audit & Lookup</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* ================= TAB 1: PRODUCT & CUSTOMER PAYMENTS ================= */}
                <TabPanel px={0} py={4}>
                  <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                    <HStack spacing={3} flexWrap="wrap">
                      <InputGroup size="sm" maxW="260px">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search payment / booking ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          borderRadius="8px"
                        />
                      </InputGroup>

                      <Select
                        maxW="180px"
                        size="sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        borderRadius="8px"
                      >
                        <option value="">All Statuses</option>
                        <option value="success">Success / Captured</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="authorized">Authorized</option>
                      </Select>

                      {(searchQuery || statusFilter) && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </HStack>

                    <Button size="sm" variant="ghost" onClick={() => { loadSummary(); loadList(); }}>
                      Refresh List
                    </Button>
                  </Flex>

                  {loadError ? (
                    <ErrorState
                      compact
                      error={loadError}
                      title="Could not load payments"
                      onRetry={() => { loadSummary(); loadList(); }}
                    />
                  ) : loading ? (
                    <Center py={12}><Spinner color={BRAND} /></Center>
                  ) : filteredPayments.length === 0 ? (
                    <Center py={12}><Text color="gray.500" fontSize="sm">No customer payment records found.</Text></Center>
                  ) : (
                    <Box overflowX="auto" borderRadius="12px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Table variant="simple" size="sm">
                        <Thead bg={isDark ? "gray.800" : "gray.50"}>
                          <Tr>
                            <Th py={3}>PAYMENT ID</Th>
                            <Th py={3}>BOOKING / ORDER</Th>
                            <Th py={3}>AMOUNT</Th>
                            <Th py={3}>METHOD / GATEWAY</Th>
                            <Th py={3}>STATUS</Th>
                            <Th py={3}>DATE & TIME</Th>
                            <Th py={3} textAlign="center">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredPayments.map((r, i) => {
                            const status = String(r?.status || "pending").toLowerCase();
                            const isSuccess = status === "success" || status === "captured";
                            const isPending = status === "pending" || status === "created";
                            const amountPaise = paymentAmountPaise(r);
                            const paymentIdStr = idOf(r);
                            const linkedBooking = r?.bookingId?._id || r?.bookingId || "—";

                            return (
                              <Tr key={paymentIdStr + i} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                                <Td fontSize="xs" fontFamily="mono" fontWeight="700" color="teal.600">
                                  <HStack spacing={1}>
                                    <Text>{paymentIdStr.length > 12 ? `${paymentIdStr.slice(0, 12)}...` : paymentIdStr}</Text>
                                    <Tooltip label="Copy ID">
                                      <IconButton
                                        icon={<FaCopy size={10} />}
                                        size="2xs"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(paymentIdStr, "Payment ID")}
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>

                                <Td fontSize="xs" fontFamily="mono">
                                  {linkedBooking !== "—" ? (
                                    <Badge
                                      cursor="pointer"
                                      variant="subtle"
                                      colorScheme="blue"
                                      fontSize="2xs"
                                      onClick={() => {
                                        setLookupBookingId(String(linkedBooking));
                                        setActiveMainTab(2);
                                        searchBookingPayment();
                                      }}
                                    >
                                      #{String(linkedBooking).slice(-8)}
                                    </Badge>
                                  ) : (
                                    <Text color="gray.400">—</Text>
                                  )}
                                </Td>

                                <Td fontWeight="800" fontSize="xs">
                                  {inrFromPaise(amountPaise)}
                                </Td>

                                <Td fontSize="xs">
                                  <Badge variant="outline" colorScheme="gray" fontSize="3xs" textTransform="uppercase">
                                    {r?.mode || r?.provider || r?.paymentMode || r?.gateway || "ONLINE"}
                                  </Badge>
                                </Td>

                                <Td>
                                  <Badge
                                    colorScheme={isSuccess ? "green" : isPending ? "yellow" : "red"}
                                    fontSize="2xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                  >
                                    {status}
                                  </Badge>
                                </Td>

                                <Td fontSize="xs" color="gray.500">
                                  {r?.createdAt ? new Date(r.createdAt).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }) : "—"}
                                </Td>

                                <Td textAlign="center">
                                  <HStack spacing={1.5} justify="center">
                                    {!isSuccess && (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        colorScheme="green"
                                        onClick={() => markStatus(r, "success")}
                                      >
                                        Mark Success
                                      </Button>
                                    )}
                                    {status !== "failed" && (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        colorScheme="red"
                                        onClick={() => markStatus(r, "failed")}
                                      >
                                        Mark Failed
                                      </Button>
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

                  {filteredPayments.length > 0 && (
                    <Box mt={3}>
                      <TablePagination
                        page={pagination.page || page}
                        totalPages={pagination.totalPages || 1}
                        totalRows={pagination.total || rows.length}
                        indexOfFirst={(pagination.page - 1) * (pagination.limit || limit)}
                        indexOfLast={Math.min(
                          (pagination.page || page) * (pagination.limit || limit),
                          pagination.total || rows.length
                        )}
                        rowsPerPage={pagination.limit || limit}
                        onPageChange={setPage}
                        onRowsPerPageChange={(value) => {
                          setLimit(value);
                          setPage(1);
                        }}
                        label="payments"
                      />
                    </Box>
                  )}
                </TabPanel>

                {/* ================= TAB 2: CUSTOMER REFUNDS DESK ================= */}
                <TabPanel px={0} py={4}>
                  {/* Visual Process Notice */}
                  <Box p={3.5} mb={4} bg="teal.50" borderRadius="12px" border="1px solid" borderColor="teal.200">
                    <Flex align="center" gap={3}>
                      <Box p={2} bg="teal.100" color="teal.800" borderRadius="8px">
                        <Icon as={FaExchangeAlt} boxSize={4} />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="800" color="teal.900">
                          Manual Customer Refund Desk Active
                        </Text>
                        <Text fontSize="xs" color="teal.800">
                          Customer refunds are settled via external bank/UPI transfer. Execute the transfer offline, then click <strong>&quot;Mark Transferred&quot;</strong> to record the UTR and declare the CreditNote.
                        </Text>
                      </Box>
                    </Flex>
                  </Box>

                  {/* Filter Toolbar */}
                  <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                    <HStack spacing={3} flexWrap="wrap">
                      <InputGroup size="sm" maxW="280px">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search refund ID, booking, UTR..."
                          value={refundSearch}
                          onChange={(e) => setRefundSearch(e.target.value)}
                          borderRadius="8px"
                        />
                      </InputGroup>

                      <Select
                        maxW="200px"
                        size="sm"
                        value={refundStatusFilter}
                        onChange={(e) => setRefundStatusFilter(e.target.value)}
                        borderRadius="8px"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending_manual">Awaiting Transfer (Pending)</option>
                        <option value="processed">Processed (Settled)</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>

                      {(refundSearch || refundStatusFilter) && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setRefundSearch("");
                            setRefundStatusFilter("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </HStack>

                    <Button size="sm" variant="ghost" onClick={() => loadRefunds()}>
                      Refresh Desk
                    </Button>
                  </Flex>

                  {refundsLoading ? (
                    <Center py={12}><Spinner color={BRAND} /></Center>
                  ) : filteredRefunds.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={2}>
                        <Icon as={FaCheckCircle} color="gray.300" boxSize={8} />
                        <Text color="gray.500" fontSize="sm">No customer refunds matching criteria.</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Box overflowX="auto" borderRadius="12px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Table variant="simple" size="sm">
                        <Thead bg={isDark ? "gray.800" : "gray.50"}>
                          <Tr>
                            <Th py={3}>REFUND ID & DATE</Th>
                            <Th py={3}>CUSTOMER / BOOKING</Th>
                            <Th py={3}>REFUND AMOUNT</Th>
                            <Th py={3}>TRANSFER STATUS</Th>
                            <Th py={3}>EXTERNAL UTR / REFERENCE</Th>
                            <Th py={3} textAlign="center">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredRefunds.map((rf, idx) => {
                            const rid = String(rf._id || rf.id || "");
                            const status = String(rf.status || "").toLowerCase();
                            const isPendingManual = status === "pending_manual" || status === "pending" || status === "requested";
                            const isProcessed = status === "processed";
                            const isCancelled = status === "cancelled";
                            const amountVal = rf.amountPaise ? inrFromPaise(rf.amountPaise) : rf.amount ? `₹${rf.amount}` : "₹0";

                            return (
                              <Tr key={rid || idx} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                                <Td py={3}>
                                  <VStack align="flex-start" spacing={0.5}>
                                    <HStack spacing={1}>
                                      <Text fontSize="xs" fontWeight="700" fontFamily="mono" color="teal.600">
                                        #{rid.slice(-8)}
                                      </Text>
                                      <Tooltip label="Copy Refund ID">
                                        <IconButton
                                          icon={<FaCopy size={10} />}
                                          size="2xs"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(rid, "Refund ID")}
                                        />
                                      </Tooltip>
                                    </HStack>
                                    <Text fontSize="2xs" color="gray.400">
                                      {rf.createdAt ? new Date(rf.createdAt).toLocaleDateString("en-IN") : "—"}
                                    </Text>
                                  </VStack>
                                </Td>

                                <Td py={3}>
                                  <VStack align="flex-start" spacing={0.5}>
                                    <Text fontSize="xs" fontWeight="700">
                                      {rf.customerName || rf.user?.name || rf.customer?.name || "Customer"}
                                    </Text>
                                    {rf.bookingId && (
                                      <Badge fontSize="3xs" colorScheme="blue">
                                        Booking #{String(rf.bookingId).slice(-8)}
                                      </Badge>
                                    )}
                                  </VStack>
                                </Td>

                                <Td py={3} fontWeight="800" fontSize="sm" color="teal.700">
                                  {amountVal}
                                </Td>

                                <Td py={3}>
                                  {isPendingManual && (
                                    <Badge colorScheme="orange" variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                      ● Awaiting Transfer
                                    </Badge>
                                  )}
                                  {isProcessed && (
                                    <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                      ✓ Transferred
                                    </Badge>
                                  )}
                                  {isCancelled && (
                                    <Badge colorScheme="red" variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                      ✕ Cancelled
                                    </Badge>
                                  )}
                                </Td>

                                <Td py={3} fontSize="xs" fontFamily="mono">
                                  {rf.manualReference || rf.reference ? (
                                    <HStack spacing={1}>
                                      <Text fontWeight="600" color="green.700">
                                        {rf.manualReference || rf.reference}
                                      </Text>
                                      <Tooltip label="Copy Reference">
                                        <IconButton
                                          icon={<FaCopy size={10} />}
                                          size="2xs"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(rf.manualReference || rf.reference, "Reference")}
                                        />
                                      </Tooltip>
                                    </HStack>
                                  ) : isCancelled ? (
                                    <Text fontSize="2xs" color="gray.400">
                                      {rf.cancelReason || "Cancelled"}
                                    </Text>
                                  ) : (
                                    <Text fontSize="2xs" color="gray.400">
                                      Pending Transfer
                                    </Text>
                                  )}
                                </Td>

                                <Td py={3} textAlign="center">
                                  <HStack spacing={1.5} justify="center">
                                    {isPendingManual && (
                                      <>
                                        <Button
                                          size="xs"
                                          colorScheme="teal"
                                          bg="teal.600"
                                          _hover={{ bg: "teal.700" }}
                                          fontWeight="700"
                                          borderRadius="6px"
                                          onClick={() => handleOpenProcessRefund(rf)}
                                        >
                                          Mark Transferred
                                        </Button>
                                        <Button
                                          size="xs"
                                          colorScheme="red"
                                          variant="outline"
                                          borderRadius="6px"
                                          onClick={() => handleOpenCancelRefund(rf)}
                                        >
                                          Cancel
                                        </Button>
                                      </>
                                    )}
                                    {isProcessed && (
                                      <Badge colorScheme="teal" variant="outline" fontSize="3xs">
                                        Settled
                                      </Badge>
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
                </TabPanel>

                {/* ================= TAB 3: BOOKING PAYMENT AUDIT & LOOKUP ================= */}
                <TabPanel px={0} py={4}>
                  <Box maxW="600px" mb={6}>
                    <FormControl mb={3}>
                      <FormLabel fontSize="sm" fontWeight="700">Audit Payment by Booking ID</FormLabel>
                      <HStack>
                        <Input
                          value={lookupBookingId}
                          onChange={(e) => setLookupBookingId(e.target.value)}
                          placeholder="Enter Booking ID (e.g. 507f1f77bcf86cd799439077)"
                          borderRadius="8px"
                        />
                        <Button variant="brand" isLoading={lookupLoading} onClick={searchBookingPayment} px={6}>
                          Lookup Booking
                        </Button>
                      </HStack>
                    </FormControl>
                  </Box>

                  {bookingPayment && (
                    <Card p={5} variant="outline" borderRadius="14px" maxW="700px" boxShadow="sm">
                      <Flex justify="space-between" align="center" mb={3}>
                        <Heading size="sm" color="teal.700">Booking Payment Audit Details</Heading>
                        <Badge colorScheme={bookingPayment.status === "success" ? "green" : "yellow"} px={2} py={0.5} borderRadius="full">
                          {bookingPayment.status || "—"}
                        </Badge>
                      </Flex>
                      <Divider mb={4} />

                      <VStack align="stretch" spacing={2.5} fontSize="sm">
                        <Flex justify="space-between">
                          <Text color="gray.500">Payment ID:</Text>
                          <Text fontWeight="semibold" fontFamily="mono">{bookingPayment._id || bookingPayment.id || "—"}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Booking ID:</Text>
                          <Text fontWeight="semibold" fontFamily="mono">{bookingPayment.bookingId || lookupBookingId}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Amount Paid:</Text>
                          <Text fontWeight="bold" color="teal.600">₹{Number(bookingPayment.amount || 0).toLocaleString("en-IN")}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Transaction Reference:</Text>
                          <Text fontFamily="mono">{bookingPayment.transactionReference || bookingPayment.razorpayPaymentId || "—"}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Payment Mode:</Text>
                          <Text>{bookingPayment.paymentMode || bookingPayment.method || "ONLINE"}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Created At:</Text>
                          <Text>{bookingPayment.createdAt ? new Date(bookingPayment.createdAt).toLocaleString("en-IN") : "—"}</Text>
                        </Flex>
                      </VStack>

                      <Divider my={4} />

                      <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          isLoading={deletingPayment}
                          onClick={() => removeBookingPayment(bookingPayment._id || bookingPayment.id || lookupBookingId)}
                        >
                          Delete Payment Record
                        </Button>

                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="green"
                            onClick={() => markStatus(bookingPayment, "success")}
                          >
                            Mark Success
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={() => markStatus(bookingPayment, "failed")}
                          >
                            Mark Failed
                          </Button>
                        </HStack>
                      </Flex>
                    </Card>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardHeader>
        </Card>
      </VStack>

      {/* ================= MODAL: RECORD OFFLINE PAYMENT ================= */}
      <AppModal
        isOpen={offlineOpen}
        onClose={() => setOfflineOpen(false)}
        title="Record Offline Payment"
        subtitle="Capture a cash, UPI, bank, or card payment against a customer booking."
        size="md"
        primaryAction={{
          label: "Record Payment",
          onClick: submitOffline,
          isLoading: savingOffline,
          colorScheme: "teal",
        }}
        secondaryAction={{ label: "Cancel", onClick: () => setOfflineOpen(false) }}
      >
        <FormControl mb={3} isRequired>
          <FormLabel fontSize="xs" fontWeight="700">Booking ID</FormLabel>
          <Input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="507f1f77bcf86cd799439077"
            borderRadius="8px"
          />
        </FormControl>

        <FormControl mb={3} isRequired>
          <FormLabel fontSize="xs" fontWeight="700">Amount Paid (₹)</FormLabel>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 750"
            type="number"
            borderRadius="8px"
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel fontSize="xs" fontWeight="700">Payment Mode</FormLabel>
          <Select value={mode} onChange={(e) => setMode(e.target.value)} borderRadius="8px">
            <option value="cash">Cash on Delivery / Direct Cash</option>
            <option value="upi">Direct UPI (QR / PhonePe / GPay)</option>
            <option value="bank_transfer">Direct Bank Transfer (NEFT/IMPS)</option>
            <option value="card">Point-of-Sale Card</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" fontWeight="700">Transaction Reference / UTR</FormLabel>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Bank UTR number or cash receipt code"
            borderRadius="8px"
          />
        </FormControl>
      </AppModal>

      {/* ================= MODAL: MARK REFUND PROCESSED ================= */}
      <AppModal
        isOpen={processModalOpen}
        onClose={() => {
          if (processSaving) return;
          setProcessModalOpen(false);
          setSelectedRefundForProcess(null);
        }}
        title="Mark Refund as Transferred (Record UTR)"
        subtitle="Record the external bank or UPI transaction details for this customer refund."
        size="md"
        primaryAction={{
          label: "Confirm Transfer & Mark Processed",
          onClick: submitProcessRefund,
          isLoading: processSaving,
          colorScheme: "teal",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => {
            setProcessModalOpen(false);
            setSelectedRefundForProcess(null);
          },
        }}
      >
        {selectedRefundForProcess && (
          <VStack spacing={4} align="stretch">
            <Box p={3} bg="teal.50" borderRadius="10px" border="1px solid" borderColor="teal.200">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="xs" color="teal.800" fontWeight="600">Refund Amount:</Text>
                  <Text fontSize="lg" fontWeight="900" color="teal.900">
                    {selectedRefundForProcess.amountPaise
                      ? inrFromPaise(selectedRefundForProcess.amountPaise)
                      : selectedRefundForProcess.amount
                      ? `₹${selectedRefundForProcess.amount}`
                      : "₹0"}
                  </Text>
                </Box>
                <Badge colorScheme="teal" fontSize="2xs">
                  Refund #{String(selectedRefundForProcess._id || selectedRefundForProcess.id).slice(-8)}
                </Badge>
              </Flex>
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="700">External Bank Reference / UTR Number</FormLabel>
              <Input
                placeholder="e.g. 431289102948 or UPI Ref"
                value={manualReference}
                onChange={(e) => setManualReference(e.target.value)}
                borderRadius="8px"
                fontFamily="mono"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">Payment Transfer Method</FormLabel>
              <Select value={manualMethod} onChange={(e) => setManualMethod(e.target.value)} borderRadius="8px">
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="neft">NEFT Bank Transfer</option>
                <option value="imps">IMPS Instant Transfer</option>
                <option value="cash">Cash Handover</option>
                <option value="other">Other External Rails</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">Transfer Date & Time</FormLabel>
              <Input
                type="datetime-local"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                borderRadius="8px"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">Internal Audit Note (Optional)</FormLabel>
              <Textarea
                placeholder="Notes about the refund execution or customer receipt confirmation..."
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                borderRadius="8px"
                fontSize="xs"
                rows={2}
              />
            </FormControl>
          </VStack>
        )}
      </AppModal>

      {/* ================= MODAL: CANCEL REFUND ================= */}
      <AppModal
        isOpen={cancelModalOpen}
        onClose={() => {
          if (cancelSaving) return;
          setCancelModalOpen(false);
          setSelectedRefundForCancel(null);
        }}
        title="Cancel Customer Refund"
        subtitle="Cancelling releases the escrow payment reservation and reverses any clawback applied to the technician."
        size="md"
        primaryAction={{
          label: "Cancel Refund Record",
          onClick: submitCancelRefund,
          isLoading: cancelSaving,
          colorScheme: "red",
        }}
        secondaryAction={{
          label: "Back",
          onClick: () => {
            setCancelModalOpen(false);
            setSelectedRefundForCancel(null);
          },
        }}
      >
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="700">Cancellation Reason</FormLabel>
          <Textarea
            placeholder="Explain why this customer refund is being cancelled (e.g., customer agreed to re-service, dispute resolved)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            borderRadius="8px"
            fontSize="xs"
            rows={3}
          />
        </FormControl>
      </AppModal>

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      <ConfirmActionModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          if (deletingPayment) return;
          setDeleteConfirmOpen(false);
          setPendingDeleteId(null);
          setDeleteError(null);
        }}
        onConfirm={confirmRemoveBookingPayment}
        title="Delete payment record"
        description="This permanently deletes the payment record and cannot be undone. The related booking may still exist."
        confirmText="Delete payment"
        confirmColorScheme="red"
        isLoading={deletingPayment}
        error={deleteError}
      />
    </Box>
  );
}
