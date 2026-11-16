// src/views/Dashboard/AdminPayments.js — Admin Payments & Customer Refunds
// Modernized Executive Payments & Refunds Management Desk
// Features:
// 1. Executive KPI summary cards with 1-click drilldown
// 2. Tab 1: Product & Customer Payments (Multi-filter, CSV export, Payment 360° Drawer, 1-click copy)
// 3. Tab 2: Customer Refunds Desk (Step-by-step workflow guide, UTR tracking, settlement modal, CSV export)
// 4. Tab 3: Booking Payment Audit & Lookup (Instant audit card, sample chips, status controls, safe deletion)
// 5. Visual "Record Offline Payment" modal with payment mode selector pills
// 6. Dynamic dark/light mode via useColorMode()

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
  InputRightElement,
  useColorMode,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import TablePagination from "components/common/TablePagination";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import AppModal from "components/common/AppModal";
import ErrorState from "components/feedback/ErrorState";
import { useAppToast } from "components/feedback";
import PaymentDetailsDrawer from "components/AdminPayments/PaymentDetailsDrawer";

import {
  FaSearch,
  FaCopy,
  FaCheck,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaUndoAlt,
  FaClock,
  FaPlus,
  FaExchangeAlt,
  FaDownload,
  FaEye,
  FaTrash,
  FaUniversity,
  FaCreditCard,
  FaQrcode,
  FaShieldAlt,
  FaTimes,
  FaReceipt,
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
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Navigation state
  const [activeMainTab, setActiveMainTab] = useState(0);

  // Tab 1: Product / Incoming Payments State
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loadError, setLoadError] = useState(null);

  // Inspector Drawer State
  const [selectedPaymentForDrawer, setSelectedPaymentForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Record Offline Payment Modal State
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [reference, setReference] = useState("");
  const [offlineNote, setOfflineNote] = useState("");
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

  // Copied indicator state
  const [copiedKey, setCopiedKey] = useState("");

  // Helpers
  const copyToClipboard = (text, key, label = "Item") => {
    if (!text) return;
    const clean = String(text).trim();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(clean);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    toast({
      title: "Copied to clipboard",
      description: `${label}: ${clean}`,
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

  const loadList = useCallback(
    async (isMounted = { current: true }) => {
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
    },
    [limit, page, statusFilter, toast]
  );

  // 2. Load Customer Refunds
  const loadRefunds = useCallback(
    async (isMounted = { current: true }) => {
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
    },
    [refundStatusFilter, toast]
  );

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
      toast({ title: "Booking ID and Amount are required", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      toast({ title: "Please enter a valid positive amount", status: "warning", duration: 2500, isClosable: true });
      return;
    }

    setSavingOffline(true);
    const payload = {
      bookingId: bookingId.trim(),
      amount: cleanAmount,
      paymentMode: mode,
      transactionReference: reference.trim() || undefined,
      note: offlineNote.trim() || undefined,
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
    setOfflineNote("");
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
    if (selectedPaymentForDrawer && (selectedPaymentForDrawer._id === id || selectedPaymentForDrawer.id === id)) {
      setSelectedPaymentForDrawer((prev) => ({ ...prev, status }));
    }
    if (bookingPayment && (bookingPayment._id === id || bookingPayment.id === id)) {
      setBookingPayment((prev) => ({ ...prev, status }));
    }
  };

  // Open Drawer for a Payment
  const handleOpenDrawer = (payment) => {
    setSelectedPaymentForDrawer(payment);
    setIsDrawerOpen(true);
  };

  // Booking Payment Lookup
  const searchBookingPayment = async (targetId) => {
    const queryId = (targetId || lookupBookingId || "").trim();
    if (!queryId) {
      toast({ title: "Please enter a Booking ID", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setLookupBookingId(queryId);
    setLookupLoading(true);
    const { data, error } = await getPaymentByBookingAdmin(queryId);
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
      note: processNote.trim() || undefined,
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

  // Filtered Payments List (by search and mode)
  const filteredPayments = useMemo(() => {
    return rows.filter((r) => {
      // Mode filter
      if (modeFilter) {
        const m = String(r?.mode || r?.provider || r?.paymentMode || r?.gateway || "ONLINE").toLowerCase();
        if (modeFilter === "offline") {
          const isOffline = m.includes("cash") || m.includes("offline") || m.includes("manual");
          if (!isOffline) return false;
        } else if (modeFilter === "online") {
          const isOnline = !m.includes("cash") && !m.includes("offline") && !m.includes("manual");
          if (!isOnline) return false;
        } else if (!m.includes(modeFilter.toLowerCase())) {
          return false;
        }
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const pid = String(idOf(r)).toLowerCase();
      const bid = String(r?.bookingId?._id || r?.bookingId?.bookingId || r?.bookingId || r?.orderId || "").toLowerCase();
      const ref = String(r?.transactionReference || r?.razorpayPaymentId || r?.reference || "").toLowerCase();
      const cName = String(
        r?.customerName ||
          r?.bookingId?.customerName ||
          r?.bookingId?.customer?.name ||
          r?.user?.name ||
          ""
      ).toLowerCase();
      const cPhone = String(
        r?.customerPhone ||
          r?.bookingId?.customerPhone ||
          r?.bookingId?.customer?.phone ||
          r?.user?.phone ||
          ""
      ).toLowerCase();

      return (
        pid.includes(q) ||
        bid.includes(q) ||
        ref.includes(q) ||
        cName.includes(q) ||
        cPhone.includes(q)
      );
    });
  }, [rows, searchQuery, modeFilter]);

  // Filtered Refunds List (by search)
  const filteredRefunds = useMemo(() => {
    if (!refundSearch.trim()) return refunds;
    const q = refundSearch.toLowerCase().trim();
    return refunds.filter((rf) => {
      const rid = String(rf._id || rf.id || "").toLowerCase();
      const bid = String(rf.bookingId || rf.booking?._id || "").toLowerCase();
      const uRef = String(rf.manualReference || rf.reference || "").toLowerCase();
      const cName = String(rf.customerName || rf.user?.name || rf.customer?.name || "").toLowerCase();
      const cPhone = String(rf.customerPhone || rf.user?.phone || rf.customer?.phone || "").toLowerCase();
      return (
        rid.includes(q) ||
        bid.includes(q) ||
        uRef.includes(q) ||
        cName.includes(q) ||
        cPhone.includes(q)
      );
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

  // Recent sample booking IDs for 1-click audit chips
  const sampleBookingIds = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      const bid = r?.bookingId?._id || r?.bookingId?.bookingId || r?.bookingId;
      if (bid && typeof bid === "string" && bid.length >= 8) {
        set.add(bid);
      }
    });
    return Array.from(set).slice(0, 4);
  }, [rows]);

  // CSV Export: Payments
  const handleExportPaymentsCsv = () => {
    if (!filteredPayments.length) {
      toast({ title: "No payments to export", status: "info", duration: 2000, isClosable: true });
      return;
    }
    const headers = [
      "Payment ID",
      "Booking ID",
      "Customer Name",
      "Customer Phone",
      "Amount (INR)",
      "Status",
      "Payment Mode",
      "Reference / UTR",
      "Date",
    ];

    const csvRows = filteredPayments.map((r) => {
      const pId = idOf(r);
      const bId = r?.bookingId?._id || r?.bookingId?.bookingId || r?.bookingId || r?.orderId || "";
      const name = r?.customerName || r?.bookingId?.customerName || r?.user?.name || "";
      const phone = r?.customerPhone || r?.bookingId?.customerPhone || r?.user?.phone || "";
      const amount = (paymentAmountPaise(r) / 100).toFixed(2);
      const status = r?.status || "pending";
      const mode = r?.mode || r?.provider || r?.paymentMode || r?.gateway || "ONLINE";
      const ref = r?.transactionReference || r?.razorpayPaymentId || r?.reference || "";
      const date = r?.createdAt ? new Date(r.createdAt).toISOString() : "";
      return [pId, bId, `"${name}"`, `"${phone}"`, amount, status, mode, `"${ref}"`, date].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Payments exported to CSV", status: "success", duration: 2500, isClosable: true });
  };

  // CSV Export: Refunds
  const handleExportRefundsCsv = () => {
    if (!filteredRefunds.length) {
      toast({ title: "No refunds to export", status: "info", duration: 2000, isClosable: true });
      return;
    }
    const headers = [
      "Refund ID",
      "Booking ID",
      "Customer Name",
      "Amount (INR)",
      "Status",
      "Payment Method",
      "External UTR / Reference",
      "Created Date",
      "Settled Date",
    ];

    const csvRows = filteredRefunds.map((rf) => {
      const rid = rf._id || rf.id || "";
      const bid = rf.bookingId || rf.booking?._id || "";
      const name = rf.customerName || rf.user?.name || rf.customer?.name || "";
      const amount = rf.amountPaise ? (rf.amountPaise / 100).toFixed(2) : rf.amount ? Number(rf.amount).toFixed(2) : "0.00";
      const status = rf.status || "pending_manual";
      const method = rf.manualMethod || "upi";
      const utr = rf.manualReference || rf.reference || "";
      const created = rf.createdAt ? new Date(rf.createdAt).toISOString() : "";
      const paid = rf.paidAt ? new Date(rf.paidAt).toISOString() : "";
      return [rid, bid, `"${name}"`, amount, status, method, `"${utr}"`, created, paid].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_refunds_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Refunds exported to CSV", status: "success", duration: 2500, isClosable: true });
  };

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
            <HStack spacing={2.5}>
              <Box
                p={2}
                bg={isDark ? "teal.900" : "teal.50"}
                color="teal.500"
                borderRadius="10px"
              >
                <Icon as={FaFileInvoiceDollar} boxSize={5} />
              </Box>
              <Heading
                as="h1"
                size="lg"
                fontWeight="900"
                letterSpacing="-0.5px"
                color={isDark ? "white" : "gray.850"}
              >
                Admin Payments & Refunds Desk
              </Heading>
            </HStack>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Supervise platform revenue inflows, record offline cash/UPI receipts, and settle manual customer refunds.
            </Text>
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            <Button
              size="sm"
              bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
              color="white"
              _hover={{ bg: "linear-gradient(135deg, #006666 0%, #004d4d 100%)", transform: "translateY(-1px)" }}
              _active={{ transform: "translateY(0)" }}
              leftIcon={<FaPlus size={12} />}
              fontWeight="800"
              borderRadius="10px"
              boxShadow="0 4px 12px rgba(0, 128, 128, 0.2)"
              px={4}
              onClick={() => setOfflineOpen(true)}
            >
              Record Offline Payment
            </Button>

            <Button
              size="sm"
              variant="outline"
              borderRadius="10px"
              fontWeight="700"
              leftIcon={<FaDownload size={12} />}
              onClick={activeMainTab === 1 ? handleExportRefundsCsv : handleExportPaymentsCsv}
            >
              Export CSV
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
          {/* Card 1: Revenue */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
              borderColor: "teal.400",
            }}
            onClick={() => {
              setActiveMainTab(0);
              setStatusFilter("success");
            }}
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                Total Collected Revenue
              </Text>
              <Box p={2.5} bg="green.50" color="green.600" borderRadius="10px">
                <Icon as={FaMoneyBillWave} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {inrFromPaise(summary?.paidPaise)}
            </Text>
            <HStack spacing={1.5} mt={2}>
              <Badge colorScheme="green" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
                ● Captured Inflows
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Verified customer receipts
              </Text>
            </HStack>
          </Box>

          {/* Card 2: Pending Refunds (Action Needed) */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={
              pendingRefundsCount > 0
                ? isDark
                  ? "orange.600"
                  : "orange.300"
                : isDark
                ? "gray.700"
                : "gray.200"
            }
            boxShadow={pendingRefundsCount > 0 ? "0 4px 14px rgba(237, 137, 54, 0.15)" : "sm"}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
              borderColor: "orange.400",
            }}
            onClick={() => {
              setActiveMainTab(1);
              setRefundStatusFilter("pending_manual");
            }}
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                Pending Manual Refunds
              </Text>
              <Box
                p={2.5}
                bg={pendingRefundsCount > 0 ? "orange.100" : "gray.100"}
                color={pendingRefundsCount > 0 ? "orange.600" : "gray.500"}
                borderRadius="10px"
              >
                <Icon as={FaClock} boxSize={4} />
              </Box>
            </HStack>
            <Text
              fontSize="2xl"
              fontWeight="900"
              color={pendingRefundsCount > 0 ? "orange.500" : isDark ? "white" : "gray.850"}
            >
              {pendingRefundsCount}
            </Text>
            <HStack spacing={1.5} mt={2}>
              {pendingRefundsCount > 0 ? (
                <Badge colorScheme="orange" variant="solid" fontSize="3xs" px={2} borderRadius="full">
                  Action Required
                </Badge>
              ) : (
                <Badge colorScheme="green" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
                  All Settled
                </Badge>
              )}
              <Text fontSize="2xs" color="gray.500">
                Awaiting transfer & UTR
              </Text>
            </HStack>
          </Box>

          {/* Card 3: Processed Refunds */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
              borderColor: "teal.400",
            }}
            onClick={() => {
              setActiveMainTab(1);
              setRefundStatusFilter("processed");
            }}
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                Settled Refunds Total
              </Text>
              <Box p={2.5} bg="teal.50" color="teal.600" borderRadius="10px">
                <Icon as={FaUndoAlt} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {inrFromPaise(processedRefundsTotalPaise)}
            </Text>
            <HStack spacing={1.5} mt={2}>
              <Badge colorScheme="teal" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
                Reconciled
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Processed via bank/UPI
              </Text>
            </HStack>
          </Box>

          {/* Card 4: Total Payment Records */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
              borderColor: "blue.400",
            }}
            onClick={() => {
              setActiveMainTab(0);
              setStatusFilter("");
              setModeFilter("");
              setSearchQuery("");
            }}
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                Total Payment Transactions
              </Text>
              <Box p={2.5} bg="blue.50" color="blue.600" borderRadius="10px">
                <Icon as={FaReceipt} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {pagination.total || rows.length}
            </Text>
            <HStack spacing={1.5} mt={2}>
              <Badge colorScheme="blue" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
                Ledger Records
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Online & recorded offline
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* ================= 3. MAIN NAVIGATION TABS ================= */}
        <Card
          bg={isDark ? "gray.850" : "white"}
          borderRadius="16px"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
          overflow="hidden"
        >
          <CardHeader pb={0} pt={4} px={6}>
            <Tabs index={activeMainTab} onChange={setActiveMainTab} colorScheme="teal" variant="enclosed">
              <TabList borderBottom="2px solid" borderColor={isDark ? "gray.700" : "gray.100"}>
                <Tab fontWeight="700" fontSize="sm" py={3} px={5}>
                  <HStack spacing={2}>
                    <Icon as={FaMoneyBillWave} />
                    <Text>Product & Customer Payments</Text>
                    <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="3xs">
                      {pagination.total || rows.length}
                    </Badge>
                  </HStack>
                </Tab>

                <Tab fontWeight="700" fontSize="sm" py={3} px={5}>
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

                <Tab fontWeight="700" fontSize="sm" py={3} px={5}>
                  <HStack spacing={2}>
                    <Icon as={FaSearch} />
                    <Text>Booking Payment Audit & Lookup</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* ================= TAB 1: PRODUCT & CUSTOMER PAYMENTS ================= */}
                <TabPanel px={0} py={5}>
                  {/* Filter Toolbar */}
                  <Flex
                    direction={{ base: "column", lg: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", lg: "center" }}
                    mb={4}
                    gap={3}
                  >
                    <HStack spacing={2.5} flexWrap="wrap" flex="1">
                      {/* Search */}
                      <InputGroup size="sm" maxW={{ base: "100%", md: "280px" }}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search payment ID, booking, customer, UTR..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          borderRadius="8px"
                        />
                        {searchQuery && (
                          <InputRightElement>
                            <IconButton
                              size="xs"
                              icon={<FaTimes size={10} />}
                              variant="ghost"
                              onClick={() => setSearchQuery("")}
                              aria-label="Clear search"
                            />
                          </InputRightElement>
                        )}
                      </InputGroup>

                      {/* Status Selector */}
                      <Select
                        maxW={{ base: "100%", md: "170px" }}
                        size="sm"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        borderRadius="8px"
                      >
                        <option value="">All Statuses</option>
                        <option value="success">Success / Captured</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="authorized">Authorized</option>
                      </Select>

                      {/* Payment Mode Selector */}
                      <Select
                        maxW={{ base: "100%", md: "170px" }}
                        size="sm"
                        value={modeFilter}
                        onChange={(e) => setModeFilter(e.target.value)}
                        borderRadius="8px"
                      >
                        <option value="">All Payment Modes</option>
                        <option value="cash">Cash / Offline</option>
                        <option value="upi">Direct UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="card">Card POS</option>
                        <option value="online">Online / Gateway</option>
                      </Select>

                      {/* Clear Button */}
                      {(searchQuery || statusFilter || modeFilter) && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("");
                            setModeFilter("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </HStack>

                    <HStack spacing={2}>
                      <Text fontSize="2xs" color="gray.500" fontWeight="600">
                        Showing {filteredPayments.length} of {pagination.total || rows.length} records
                      </Text>
                    </HStack>
                  </Flex>

                  {/* Preset quick filter tags */}
                  <HStack spacing={2} mb={4} flexWrap="wrap">
                    <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                      Quick View:
                    </Text>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={!statusFilter && !modeFilter ? "solid" : "subtle"}
                      colorScheme="teal"
                      cursor="pointer"
                      onClick={() => {
                        setStatusFilter("");
                        setModeFilter("");
                      }}
                    >
                      <TagLabel>All</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={statusFilter === "success" ? "solid" : "subtle"}
                      colorScheme="green"
                      cursor="pointer"
                      onClick={() => setStatusFilter("success")}
                    >
                      <TagLabel>✓ Success Only</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={statusFilter === "pending" ? "solid" : "subtle"}
                      colorScheme="yellow"
                      cursor="pointer"
                      onClick={() => setStatusFilter("pending")}
                    >
                      <TagLabel>● Pending</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={statusFilter === "failed" ? "solid" : "subtle"}
                      colorScheme="red"
                      cursor="pointer"
                      onClick={() => setStatusFilter("failed")}
                    >
                      <TagLabel>✕ Failed</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={modeFilter === "cash" ? "solid" : "subtle"}
                      colorScheme="orange"
                      cursor="pointer"
                      onClick={() => setModeFilter("cash")}
                    >
                      <TagLabel>Cash / Offline</TagLabel>
                    </Tag>
                  </HStack>

                  {/* Table or States */}
                  {loadError ? (
                    <ErrorState
                      compact
                      error={loadError}
                      title="Could not load payments"
                      onRetry={() => {
                        loadSummary();
                        loadList();
                      }}
                    />
                  ) : loading ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Spinner size="lg" color={BRAND} thickness="3px" />
                        <Text fontSize="xs" color="gray.500">
                          Fetching payment transactions...
                        </Text>
                      </VStack>
                    </Center>
                  ) : filteredPayments.length === 0 ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="gray.400">
                          <Icon as={FaFileInvoiceDollar} boxSize={8} />
                        </Box>
                        <Text fontWeight="700" color="gray.600">
                          No payment records found
                        </Text>
                        <Text fontSize="xs" color="gray.500" maxW="360px" textAlign="center">
                          {searchQuery || statusFilter || modeFilter
                            ? "Try adjusting your search criteria or clearing filters."
                            : "No incoming customer payment transactions recorded yet."}
                        </Text>
                        {(searchQuery || statusFilter || modeFilter) && (
                          <Button
                            size="xs"
                            colorScheme="teal"
                            variant="outline"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("");
                              setModeFilter("");
                            }}
                          >
                            Reset All Filters
                          </Button>
                        )}
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
                            <Th py={3.5}>PAYMENT ID & TIME</Th>
                            <Th py={3.5}>CUSTOMER & BOOKING</Th>
                            <Th py={3.5}>AMOUNT</Th>
                            <Th py={3.5}>PAYMENT MODE</Th>
                            <Th py={3.5}>STATUS</Th>
                            <Th py={3.5}>REFERENCE / UTR</Th>
                            <Th py={3.5} textAlign="center">
                              ACTIONS
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredPayments.map((r, i) => {
                            const status = String(r?.status || "pending").toLowerCase();
                            const isSuccess = status === "success" || status === "captured";
                            const isPending = status === "pending" || status === "created";
                            const isFailed = status === "failed";
                            const amountPaise = paymentAmountPaise(r);
                            const paymentIdStr = idOf(r);
                            const linkedBooking =
                              r?.bookingId?._id ||
                              r?.bookingId?.bookingId ||
                              r?.bookingId ||
                              r?.orderId ||
                              "—";
                            const modeStr = (
                              r?.mode ||
                              r?.provider ||
                              r?.paymentMode ||
                              r?.gateway ||
                              "ONLINE"
                            ).toUpperCase();

                            const customerName =
                              r?.customerName ||
                              r?.bookingId?.customerName ||
                              r?.bookingId?.customer?.name ||
                              r?.user?.name ||
                              "";

                            const customerPhone =
                              r?.customerPhone ||
                              r?.bookingId?.customerPhone ||
                              r?.bookingId?.customer?.phone ||
                              r?.user?.phone ||
                              "";

                            const ref =
                              r?.transactionReference ||
                              r?.razorpayPaymentId ||
                              r?.reference ||
                              "";

                            return (
                              <Tr
                                key={paymentIdStr + i}
                                _hover={{ bg: isDark ? "gray.800" : "gray.50", cursor: "pointer" }}
                                onClick={() => handleOpenDrawer(r)}
                              >
                                {/* 1. Payment ID & Date */}
                                <Td py={3}>
                                  <VStack align="flex-start" spacing={0.5}>
                                    <HStack spacing={1}>
                                      <Text
                                        fontSize="xs"
                                        fontFamily="mono"
                                        fontWeight="700"
                                        color={isDark ? "teal.300" : "teal.700"}
                                      >
                                        #{paymentIdStr.slice(-8)}
                                      </Text>
                                      <Tooltip label="Copy Payment ID" hasArrow>
                                        <IconButton
                                          icon={
                                            <Icon
                                              as={copiedKey === `pid_${paymentIdStr}` ? FaCheck : FaCopy}
                                              boxSize={2.5}
                                            />
                                          }
                                          size="2xs"
                                          variant="ghost"
                                          colorScheme={copiedKey === `pid_${paymentIdStr}` ? "green" : "gray"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(paymentIdStr, `pid_${paymentIdStr}`, "Payment ID");
                                          }}
                                          aria-label="Copy Payment ID"
                                        />
                                      </Tooltip>
                                    </HStack>
                                    <Text fontSize="2xs" color="gray.400">
                                      {r?.createdAt
                                        ? new Date(r.createdAt).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "—"}
                                    </Text>
                                  </VStack>
                                </Td>

                                {/* 2. Customer & Linked Booking */}
                                <Td py={3}>
                                  <VStack align="flex-start" spacing={0.5}>
                                    {customerName ? (
                                      <Text fontSize="xs" fontWeight="700">
                                        {customerName}
                                      </Text>
                                    ) : (
                                      <Text fontSize="xs" color="gray.400">
                                        Customer
                                      </Text>
                                    )}

                                    {linkedBooking !== "—" ? (
                                      <Badge
                                        variant="subtle"
                                        colorScheme="blue"
                                        fontSize="3xs"
                                        borderRadius="md"
                                        cursor="pointer"
                                        _hover={{ bg: "blue.100" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setLookupBookingId(String(linkedBooking));
                                          setActiveMainTab(2);
                                          searchBookingPayment(String(linkedBooking));
                                        }}
                                      >
                                        Booking #{String(linkedBooking).slice(-8)}
                                      </Badge>
                                    ) : (
                                      customerPhone && (
                                        <Text fontSize="3xs" color="gray.500" fontFamily="mono">
                                          {customerPhone}
                                        </Text>
                                      )
                                    )}
                                  </VStack>
                                </Td>

                                {/* 3. Amount */}
                                <Td py={3} fontWeight="800" fontSize="sm" color={isSuccess ? "green.600" : undefined}>
                                  {inrFromPaise(amountPaise)}
                                </Td>

                                {/* 4. Mode */}
                                <Td py={3}>
                                  <Badge
                                    variant="subtle"
                                    colorScheme={
                                      modeStr.includes("CASH")
                                        ? "orange"
                                        : modeStr.includes("UPI")
                                        ? "purple"
                                        : modeStr.includes("BANK")
                                        ? "cyan"
                                        : modeStr.includes("CARD")
                                        ? "blue"
                                        : "teal"
                                    }
                                    fontSize="3xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                  >
                                    {modeStr}
                                  </Badge>
                                </Td>

                                {/* 5. Status */}
                                <Td py={3}>
                                  <Badge
                                    colorScheme={isSuccess ? "green" : isPending ? "yellow" : "red"}
                                    fontSize="2xs"
                                    px={2.5}
                                    py={0.5}
                                    borderRadius="full"
                                    textTransform="uppercase"
                                  >
                                    {isSuccess ? "✓ " : isPending ? "● " : "✕ "}
                                    {status}
                                  </Badge>
                                </Td>

                                {/* 6. Reference / UTR */}
                                <Td py={3} fontSize="xs" fontFamily="mono">
                                  {ref ? (
                                    <HStack spacing={1}>
                                      <Text fontSize="2xs" color={isDark ? "gray.300" : "gray.600"}>
                                        {ref.length > 14 ? `${ref.slice(0, 14)}...` : ref}
                                      </Text>
                                      <Tooltip label="Copy Reference" hasArrow>
                                        <IconButton
                                          icon={
                                            <Icon
                                              as={copiedKey === `ref_${ref}` ? FaCheck : FaCopy}
                                              boxSize={2.5}
                                            />
                                          }
                                          size="2xs"
                                          variant="ghost"
                                          colorScheme={copiedKey === `ref_${ref}` ? "green" : "gray"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(ref, `ref_${ref}`, "Reference");
                                          }}
                                          aria-label="Copy Reference"
                                        />
                                      </Tooltip>
                                    </HStack>
                                  ) : (
                                    <Text fontSize="2xs" color="gray.400">
                                      —
                                    </Text>
                                  )}
                                </Td>

                                {/* 7. Actions */}
                                <Td py={3} textAlign="center" onClick={(e) => e.stopPropagation()}>
                                  <HStack spacing={1.5} justify="center">
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      colorScheme="teal"
                                      leftIcon={<FaEye size={10} />}
                                      onClick={() => handleOpenDrawer(r)}
                                    >
                                      Inspect
                                    </Button>

                                    {!isSuccess && (
                                      <Tooltip label="Mark as Captured" hasArrow>
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="green"
                                          onClick={() => markStatus(r, "success")}
                                        >
                                          Confirm
                                        </Button>
                                      </Tooltip>
                                    )}

                                    {!isFailed && status !== "success" && (
                                      <Tooltip label="Mark as Failed" hasArrow>
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="red"
                                          onClick={() => markStatus(r, "failed")}
                                        >
                                          Fail
                                        </Button>
                                      </Tooltip>
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

                  {/* Pagination */}
                  {filteredPayments.length > 0 && (
                    <Box mt={4}>
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
                <TabPanel px={0} py={5}>
                  {/* Workflow Guidance Banner */}
                  <Box
                    p={4}
                    mb={5}
                    bg={isDark ? "teal.950" : "teal.50"}
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={isDark ? "teal.800" : "teal.200"}
                  >
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      align={{ base: "flex-start", md: "center" }}
                      justify="space-between"
                      gap={3}
                    >
                      <HStack spacing={3} align="flex-start">
                        <Box p={2.5} bg="teal.100" color="teal.800" borderRadius="10px">
                          <Icon as={FaExchangeAlt} boxSize={5} />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="800" color={isDark ? "teal.100" : "teal.900"}>
                            Manual Customer Refund Execution Desk
                          </Text>
                          <Text fontSize="xs" color={isDark ? "teal.200" : "teal.800"} mt={0.5}>
                            Customer refunds are settled via business UPI or netbanking. Execute the transfer offline, then click{" "}
                            <strong>&quot;Mark Transferred&quot;</strong> to record the external UTR and declare the refund settled.
                          </Text>
                        </Box>
                      </HStack>

                      {pendingRefundsCount > 0 && (
                        <Badge colorScheme="orange" variant="solid" px={3} py={1} borderRadius="full" fontSize="xs">
                          {pendingRefundsCount} Pending Settlement
                        </Badge>
                      )}
                    </Flex>
                  </Box>

                  {/* Filter Toolbar */}
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                    mb={4}
                    gap={3}
                  >
                    <HStack spacing={3} flexWrap="wrap">
                      <InputGroup size="sm" maxW={{ base: "100%", md: "280px" }}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search refund ID, booking, customer, UTR..."
                          value={refundSearch}
                          onChange={(e) => setRefundSearch(e.target.value)}
                          borderRadius="8px"
                        />
                        {refundSearch && (
                          <InputRightElement>
                            <IconButton
                              size="xs"
                              icon={<FaTimes size={10} />}
                              variant="ghost"
                              onClick={() => setRefundSearch("")}
                              aria-label="Clear search"
                            />
                          </InputRightElement>
                        )}
                      </InputGroup>

                      <Select
                        maxW={{ base: "100%", md: "220px" }}
                        size="sm"
                        value={refundStatusFilter}
                        onChange={(e) => setRefundStatusFilter(e.target.value)}
                        borderRadius="8px"
                      >
                        <option value="">All Refund Statuses</option>
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

                  {/* Quick Preset Tags for Refunds */}
                  <HStack spacing={2} mb={4} flexWrap="wrap">
                    <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                      Filter:
                    </Text>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={!refundStatusFilter ? "solid" : "subtle"}
                      colorScheme="teal"
                      cursor="pointer"
                      onClick={() => setRefundStatusFilter("")}
                    >
                      <TagLabel>All Refunds ({refunds.length})</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={refundStatusFilter === "pending_manual" ? "solid" : "subtle"}
                      colorScheme="orange"
                      cursor="pointer"
                      onClick={() => setRefundStatusFilter("pending_manual")}
                    >
                      <TagLabel>● Awaiting Transfer ({pendingRefundsCount})</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={refundStatusFilter === "processed" ? "solid" : "subtle"}
                      colorScheme="green"
                      cursor="pointer"
                      onClick={() => setRefundStatusFilter("processed")}
                    >
                      <TagLabel>✓ Settled</TagLabel>
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      variant={refundStatusFilter === "cancelled" ? "solid" : "subtle"}
                      colorScheme="red"
                      cursor="pointer"
                      onClick={() => setRefundStatusFilter("cancelled")}
                    >
                      <TagLabel>✕ Cancelled</TagLabel>
                    </Tag>
                  </HStack>

                  {/* Table or States */}
                  {refundsLoading ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Spinner size="lg" color={BRAND} thickness="3px" />
                        <Text fontSize="xs" color="gray.500">
                          Loading customer refund requests...
                        </Text>
                      </VStack>
                    </Center>
                  ) : filteredRefunds.length === 0 ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="gray.400">
                          <Icon as={FaUndoAlt} boxSize={8} />
                        </Box>
                        <Text fontWeight="700" color="gray.600">
                          No customer refund records
                        </Text>
                        <Text fontSize="xs" color="gray.500" maxW="360px" textAlign="center">
                          {refundSearch || refundStatusFilter
                            ? "No refunds match your current filters."
                            : "There are currently no customer refund records on the platform."}
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
                            <Th py={3.5}>REFUND ID & DATE</Th>
                            <Th py={3.5}>CUSTOMER & BOOKING</Th>
                            <Th py={3.5}>REFUND AMOUNT</Th>
                            <Th py={3.5}>TRANSFER STATUS</Th>
                            <Th py={3.5}>EXTERNAL UTR / REFERENCE</Th>
                            <Th py={3.5} textAlign="center">
                              ACTIONS
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredRefunds.map((rf, idx) => {
                            const rid = String(rf._id || rf.id || "");
                            const status = String(rf.status || "").toLowerCase();
                            const isPendingManual =
                              status === "pending_manual" || status === "pending" || status === "requested";
                            const isProcessed = status === "processed";
                            const isCancelled = status === "cancelled";
                            const amountVal = rf.amountPaise
                              ? inrFromPaise(rf.amountPaise)
                              : rf.amount
                              ? `₹${Number(rf.amount).toLocaleString("en-IN")}`
                              : "₹0";

                            return (
                              <Tr key={rid || idx} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                                {/* Refund ID */}
                                <Td py={3}>
                                  <VStack align="flex-start" spacing={0.5}>
                                    <HStack spacing={1}>
                                      <Text fontSize="xs" fontWeight="700" fontFamily="mono" color="teal.600">
                                        #{rid.slice(-8)}
                                      </Text>
                                      <Tooltip label="Copy Refund ID" hasArrow>
                                        <IconButton
                                          icon={
                                            <Icon
                                              as={copiedKey === `rid_${rid}` ? FaCheck : FaCopy}
                                              boxSize={2.5}
                                            />
                                          }
                                          size="2xs"
                                          variant="ghost"
                                          colorScheme={copiedKey === `rid_${rid}` ? "green" : "gray"}
                                          onClick={() => copyToClipboard(rid, `rid_${rid}`, "Refund ID")}
                                          aria-label="Copy Refund ID"
                                        />
                                      </Tooltip>
                                    </HStack>
                                    <Text fontSize="2xs" color="gray.400">
                                      {rf.createdAt ? new Date(rf.createdAt).toLocaleDateString("en-IN") : "—"}
                                    </Text>
                                  </VStack>
                                </Td>

                                {/* Customer / Booking */}
                                <Td py={3}>
                                  <VStack align="flex-start" spacing={0.5}>
                                    <Text fontSize="xs" fontWeight="700">
                                      {rf.customerName || rf.user?.name || rf.customer?.name || "Customer"}
                                    </Text>
                                    {rf.bookingId && (
                                      <Badge
                                        fontSize="3xs"
                                        colorScheme="blue"
                                        cursor="pointer"
                                        _hover={{ bg: "blue.100" }}
                                        onClick={() => {
                                          setLookupBookingId(String(rf.bookingId));
                                          setActiveMainTab(2);
                                          searchBookingPayment(String(rf.bookingId));
                                        }}
                                      >
                                        Booking #{String(rf.bookingId).slice(-8)}
                                      </Badge>
                                    )}
                                  </VStack>
                                </Td>

                                {/* Refund Amount */}
                                <Td py={3} fontWeight="800" fontSize="sm" color="teal.700">
                                  {amountVal}
                                </Td>

                                {/* Transfer Status */}
                                <Td py={3}>
                                  {isPendingManual && (
                                    <Badge colorScheme="orange" variant="subtle" fontSize="2xs" px={2.5} py={0.5} borderRadius="full">
                                      ● Awaiting Transfer
                                    </Badge>
                                  )}
                                  {isProcessed && (
                                    <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={2.5} py={0.5} borderRadius="full">
                                      ✓ Settled
                                    </Badge>
                                  )}
                                  {isCancelled && (
                                    <Badge colorScheme="red" variant="subtle" fontSize="2xs" px={2.5} py={0.5} borderRadius="full">
                                      ✕ Cancelled
                                    </Badge>
                                  )}
                                </Td>

                                {/* UTR / Reference */}
                                <Td py={3} fontSize="xs" fontFamily="mono">
                                  {rf.manualReference || rf.reference ? (
                                    <VStack align="flex-start" spacing={0.5}>
                                      <HStack spacing={1}>
                                        <Text fontWeight="700" color="green.700" fontSize="xs">
                                          {rf.manualReference || rf.reference}
                                        </Text>
                                        <Tooltip label="Copy UTR" hasArrow>
                                          <IconButton
                                            icon={
                                              <Icon
                                                as={copiedKey === `utr_${rid}` ? FaCheck : FaCopy}
                                                boxSize={2.5}
                                              />
                                            }
                                            size="2xs"
                                            variant="ghost"
                                            colorScheme={copiedKey === `utr_${rid}` ? "green" : "gray"}
                                            onClick={() =>
                                              copyToClipboard(
                                                rf.manualReference || rf.reference,
                                                `utr_${rid}`,
                                                "UTR"
                                              )
                                            }
                                            aria-label="Copy UTR"
                                          />
                                        </Tooltip>
                                      </HStack>
                                      <HStack spacing={1}>
                                        <Badge fontSize="3xs" colorScheme="purple">
                                          {(rf.manualMethod || "UPI").toUpperCase()}
                                        </Badge>
                                        {rf.paidAt && (
                                          <Text fontSize="3xs" color="gray.400">
                                            {new Date(rf.paidAt).toLocaleDateString("en-IN")}
                                          </Text>
                                        )}
                                      </HStack>
                                    </VStack>
                                  ) : isCancelled ? (
                                    <Text fontSize="2xs" color="gray.400" fontStyle="italic">
                                      {rf.cancelReason || "Dispute cancelled"}
                                    </Text>
                                  ) : (
                                    <Badge variant="outline" colorScheme="orange" fontSize="3xs">
                                      Awaiting Bank UTR
                                    </Badge>
                                  )}
                                </Td>

                                {/* Actions */}
                                <Td py={3} textAlign="center">
                                  <HStack spacing={1.5} justify="center">
                                    {isPendingManual && (
                                      <>
                                        <Button
                                          size="xs"
                                          colorScheme="teal"
                                          bg="teal.600"
                                          _hover={{ bg: "teal.700" }}
                                          fontWeight="800"
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
                                        Reconciled
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
                <TabPanel px={0} py={5}>
                  <Box maxW="680px" mb={6}>
                    <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={2}>
                      Search Booking Payment by ID
                    </Text>

                    <HStack spacing={3}>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          value={lookupBookingId}
                          onChange={(e) => setLookupBookingId(e.target.value)}
                          placeholder="e.g. 64f40ffd0ff92d4bde26df01"
                          borderRadius="10px"
                          fontFamily="mono"
                        />
                      </InputGroup>

                      <Button
                        size="md"
                        bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
                        color="white"
                        _hover={{ bg: "linear-gradient(135deg, #006666 0%, #004d4d 100%)" }}
                        isLoading={lookupLoading}
                        onClick={() => searchBookingPayment()}
                        px={6}
                        borderRadius="10px"
                      >
                        Audit Booking
                      </Button>
                    </HStack>

                    {/* Sample chips */}
                    {sampleBookingIds.length > 0 && (
                      <HStack spacing={2} mt={3} flexWrap="wrap">
                        <Text fontSize="2xs" color="gray.500">
                          Sample Bookings from Ledger:
                        </Text>
                        {sampleBookingIds.map((bid) => (
                          <Badge
                            key={bid}
                            cursor="pointer"
                            variant="subtle"
                            colorScheme="teal"
                            fontSize="3xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            onClick={() => {
                              setLookupBookingId(bid);
                              searchBookingPayment(bid);
                            }}
                            _hover={{ bg: "teal.100" }}
                          >
                            #{bid.slice(-8)}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </Box>

                  {/* Audit Card Details */}
                  {bookingPayment && (
                    <Card
                      p={6}
                      variant="outline"
                      borderRadius="16px"
                      maxW="720px"
                      boxShadow="sm"
                      borderColor={isDark ? "gray.700" : "gray.200"}
                      bg={isDark ? "gray.800" : "white"}
                    >
                      <Flex justify="space-between" align="center" mb={4} pb={3} borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
                        <HStack spacing={2.5}>
                          <Box p={2} bg="teal.50" color="teal.700" borderRadius="8px">
                            <Icon as={FaShieldAlt} boxSize={4} />
                          </Box>
                          <Box>
                            <Heading size="sm" color={isDark ? "white" : "teal.800"}>
                              Booking Payment Audit Verification
                            </Heading>
                            <Text fontSize="2xs" color="gray.500">
                              Ledger verification for booking #{String(bookingPayment.bookingId || lookupBookingId).slice(-8)}
                            </Text>
                          </Box>
                        </HStack>

                        <Badge
                          colorScheme={
                            bookingPayment.status === "success" || bookingPayment.status === "captured"
                              ? "green"
                              : "yellow"
                          }
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="2xs"
                          textTransform="uppercase"
                        >
                          {bookingPayment.status || "—"}
                        </Badge>
                      </Flex>

                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={5}>
                        <Box p={3} borderRadius="10px" bg={isDark ? "gray.850" : "gray.50"}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                            Payment ID
                          </Text>
                          <HStack spacing={1} mt={1}>
                            <Text fontWeight="700" fontFamily="mono" fontSize="xs">
                              {bookingPayment._id || bookingPayment.id || "—"}
                            </Text>
                            <Tooltip label="Copy ID" hasArrow>
                              <IconButton
                                size="2xs"
                                icon={<Icon as={FaCopy} boxSize={2.5} />}
                                variant="ghost"
                                onClick={() => copyToClipboard(bookingPayment._id || bookingPayment.id, "audit_pid", "Payment ID")}
                                aria-label="Copy Payment ID"
                              />
                            </Tooltip>
                          </HStack>
                        </Box>

                        <Box p={3} borderRadius="10px" bg={isDark ? "gray.850" : "gray.50"}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                            Amount Paid
                          </Text>
                          <Text fontWeight="900" fontSize="lg" color="teal.600" mt={0.5}>
                            ₹{Number(bookingPayment.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </Text>
                        </Box>

                        <Box p={3} borderRadius="10px" bg={isDark ? "gray.850" : "gray.50"}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                            Transaction Reference / UTR
                          </Text>
                          <Text fontWeight="600" fontFamily="mono" fontSize="xs" mt={1}>
                            {bookingPayment.transactionReference || bookingPayment.razorpayPaymentId || "—"}
                          </Text>
                        </Box>

                        <Box p={3} borderRadius="10px" bg={isDark ? "gray.850" : "gray.50"}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                            Payment Mode / Gateway
                          </Text>
                          <Badge mt={1} colorScheme="teal" fontSize="2xs">
                            {bookingPayment.paymentMode || bookingPayment.method || "ONLINE"}
                          </Badge>
                        </Box>
                      </SimpleGrid>

                      <Divider mb={4} />

                      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          leftIcon={<FaTrash size={12} />}
                          isLoading={deletingPayment}
                          onClick={() => removeBookingPayment(bookingPayment._id || bookingPayment.id || lookupBookingId)}
                        >
                          Delete Payment Record
                        </Button>

                        <HStack spacing={2}>
                          {bookingPayment.status !== "success" && (
                            <Button
                              size="sm"
                              variant="solid"
                              colorScheme="green"
                              leftIcon={<FaCheckCircle size={12} />}
                              onClick={() => markStatus(bookingPayment, "success")}
                            >
                              Mark Success
                            </Button>
                          )}
                          {bookingPayment.status !== "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              leftIcon={<FaTimesCircle size={12} />}
                              onClick={() => markStatus(bookingPayment, "failed")}
                            >
                              Mark Failed
                            </Button>
                          )}
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
        title="Record Customer Offline Payment"
        subtitle="Log a cash, direct UPI, bank transfer, or card swipe payment against a customer booking."
        size="lg"
        primaryAction={{
          label: "Record Payment",
          onClick: submitOffline,
          isLoading: savingOffline,
          colorScheme: "teal",
        }}
        secondaryAction={{ label: "Cancel", onClick: () => setOfflineOpen(false) }}
      >
        <VStack spacing={4} align="stretch">
          <Alert status="info" borderRadius="10px" fontSize="xs">
            <AlertIcon />
            Recording an offline payment automatically reconciles the booking balance and updates platform revenue.
          </Alert>

          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="700">
              Booking ID
            </FormLabel>
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. 64f40ffd0ff92d4bde26df01"
              borderRadius="8px"
              fontFamily="mono"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="700">
              Amount Paid (₹)
            </FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.500" fontSize="sm">
                ₹
              </InputLeftElement>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                type="number"
                borderRadius="8px"
                fontWeight="700"
              />
            </InputGroup>
          </FormControl>

          {/* Visual Payment Mode Selector */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700">
              Payment Mode
            </FormLabel>
            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
              {[
                { key: "cash", label: "Direct Cash", icon: FaMoneyBillWave },
                { key: "upi", label: "Direct UPI", icon: FaQrcode },
                { key: "bank_transfer", label: "Bank Transfer", icon: FaUniversity },
                { key: "card", label: "POS Card", icon: FaCreditCard },
              ].map((item) => (
                <Box
                  key={item.key}
                  p={3}
                  borderRadius="10px"
                  border="1.5px solid"
                  borderColor={mode === item.key ? "teal.500" : isDark ? "gray.700" : "gray.200"}
                  bg={mode === item.key ? (isDark ? "teal.900" : "teal.50") : undefined}
                  cursor="pointer"
                  textAlign="center"
                  onClick={() => setMode(item.key)}
                  transition="all 0.2s"
                >
                  <Icon
                    as={item.icon}
                    boxSize={4}
                    color={mode === item.key ? "teal.500" : "gray.500"}
                    mb={1}
                  />
                  <Text fontSize="2xs" fontWeight="700" color={mode === item.key ? "teal.700" : "gray.600"}>
                    {item.label}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700">
              Transaction Reference / UTR Number (Optional)
            </FormLabel>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 431289102948 or Cash Receipt No"
              borderRadius="8px"
              fontFamily="mono"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700">
              Internal Note (Optional)
            </FormLabel>
            <Textarea
              value={offlineNote}
              onChange={(e) => setOfflineNote(e.target.value)}
              placeholder="e.g. Collected at customer doorstep by supervisor..."
              borderRadius="8px"
              fontSize="xs"
              rows={2}
            />
          </FormControl>
        </VStack>
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
            <Box
              p={3.5}
              bg={isDark ? "teal.950" : "teal.50"}
              borderRadius="12px"
              border="1px solid"
              borderColor={isDark ? "teal.800" : "teal.200"}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="xs" color="teal.800" fontWeight="600">
                    Refund Amount to Transfer:
                  </Text>
                  <Text fontSize="xl" fontWeight="900" color="teal.900">
                    {selectedRefundForProcess.amountPaise
                      ? inrFromPaise(selectedRefundForProcess.amountPaise)
                      : selectedRefundForProcess.amount
                      ? `₹${Number(selectedRefundForProcess.amount).toLocaleString("en-IN")}`
                      : "₹0"}
                  </Text>
                </Box>
                <Badge colorScheme="teal" fontSize="2xs" px={2} py={1} borderRadius="full">
                  Refund #{String(selectedRefundForProcess._id || selectedRefundForProcess.id).slice(-8)}
                </Badge>
              </Flex>
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="700">
                External Bank Reference / UTR Number
              </FormLabel>
              <Input
                placeholder="e.g. 431289102948 or UPI Ref Number"
                value={manualReference}
                onChange={(e) => setManualReference(e.target.value)}
                borderRadius="8px"
                fontFamily="mono"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">
                Payment Transfer Method
              </FormLabel>
              <Select value={manualMethod} onChange={(e) => setManualMethod(e.target.value)} borderRadius="8px">
                <option value="upi">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                <option value="neft">NEFT Bank Transfer</option>
                <option value="imps">IMPS Instant Transfer</option>
                <option value="cash">Cash Handover</option>
                <option value="other">Other External Rails</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">
                Transfer Date & Time
              </FormLabel>
              <Input
                type="datetime-local"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                borderRadius="8px"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">
                Internal Audit Note (Optional)
              </FormLabel>
              <Textarea
                placeholder="e.g. Sent to customer UPI ID verified by phone..."
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
        subtitle="Cancelling releases the escrow reservation and reverses any clawback applied to the technician."
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
        <VStack spacing={4} align="stretch">
          <Alert status="warning" borderRadius="10px" fontSize="xs">
            <AlertIcon />
            Cancelling this refund will reverse any technician escrow clawback and mark the refund dispute closed.
          </Alert>

          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="700">
              Cancellation Reason
            </FormLabel>
            <Textarea
              placeholder="Explain why this customer refund is being cancelled (e.g. customer agreed to reschedule service)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              borderRadius="8px"
              fontSize="xs"
              rows={3}
            />
          </FormControl>
        </VStack>
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
        description="This permanently deletes the payment record from the database and cannot be undone."
        confirmText="Delete payment"
        confirmColorScheme="red"
        isLoading={deletingPayment}
        error={deleteError}
      />

      {/* ================= DRAWER: PAYMENT 360° INSPECTOR ================= */}
      <PaymentDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPaymentForDrawer(null);
        }}
        payment={selectedPaymentForDrawer}
        onMarkStatus={markStatus}
        onLookupBooking={(bid) => {
          setLookupBookingId(bid);
          setActiveMainTab(2);
          searchBookingPayment(bid);
        }}
        isDark={isDark}
      />
    </Box>
  );
}
