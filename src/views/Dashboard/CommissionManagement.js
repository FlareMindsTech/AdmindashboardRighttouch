import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  IconButton,
  HStack,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Center,
  Select,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  Tag,
  Tooltip,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaEdit,
  FaHistory,
  FaCalculator,
  FaMoneyBillWave,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaExchangeAlt,
  FaInfoCircle,
} from "react-icons/fa";
import {
  MdAttachMoney,
  MdHistory,
  MdSearch,
  MdAdd,
  MdEdit,
  MdVisibility,
  MdFilterList,
  MdRefresh,
  MdTrendingUp,
  MdOutlineTrendingDown,
  MdSchedule,
  MdPayments,
  MdOutlineAccountBalanceWallet,
} from "react-icons/md";

import {
  getAllServices,
  getAllServiceCommissions,
  getServiceCommissionConfig,
  setServiceCommission,
  scheduleServiceCommission,
  cancelScheduledCommission,
  toggleServiceCommissionStatus,
  getBookingCommissionBreakdown,
  overrideBookingCommission,
  revertBookingCommissionOverride,
  simulateCommissionCalculation,
  getSettlementLedgers,
  getSettlementSummary,
  reconcileCodDebt,
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs,
  getAllBookings,
} from "../utils/axiosInstance";

const BRAND = "#008080";
const BRAND_DARK = "#006666";

const globalScrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "transparent",
    borderRadius: "3px",
    transition: "background 0.3s ease",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    background: "#cbd5e1",
  },
  "&:hover::-webkit-scrollbar-thumb:hover": {
    background: "#94a3b8",
  },
};

export default function CommissionManagement() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // -------------------------------------------------------------
  // Tab 0: Service Commissions & Scheduling State
  // -------------------------------------------------------------
  const [commissions, setCommissions] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);
  const [commissionSearch, setCommissionSearch] = useState("");
  const [commissionMarginFilter, setCommissionMarginFilter] = useState("ALL");
  const [commissionStatusFilter, setCommissionStatusFilter] = useState("ALL");
  const [commissionSortBy, setCommissionSortBy] = useState("name_asc");
  const [commissionPage, setCommissionPage] = useState(1);
  const [totalCommissionPages, setTotalCommissionPages] = useState(1);

  // Modal: Create / Update Commission Rule
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSchedulingMode, setIsSchedulingMode] = useState(false);
  const [selectedServiceForRule, setSelectedServiceForRule] = useState("");
  const [targetCommissionItem, setTargetCommissionItem] = useState(null);
  const [rulePercentage, setRulePercentage] = useState(15);
  const [ruleEffectiveFrom, setRuleEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
  const [ruleReason, setRuleReason] = useState("");
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  // Modal: Service Commission History
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyService, setHistoryService] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // -------------------------------------------------------------
  // Tab 1: Booking Commission Overrides & Calculator State
  // -------------------------------------------------------------
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingPage, setBookingPage] = useState(1);
  const [totalBookingPages, setTotalBookingPages] = useState(1);

  // Override Dialog State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedBookingForOverride, setSelectedBookingForOverride] = useState(null);
  const [overridePercentage, setOverridePercentage] = useState(10);
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Standalone Financial Calculator State
  const [calcGrossAmount, setCalcGrossAmount] = useState(1000);
  const [calcCommissionPct, setCalcCommissionPct] = useState(15);
  const [calcTdsPct, setCalcTdsPct] = useState(1);
  const [calcIncentives, setCalcIncentives] = useState(0);

  // -------------------------------------------------------------
  // Tab 2: Settlement Ledger (COD vs Online Gateway)
  // -------------------------------------------------------------
  const [settlementFilter, setSettlementFilter] = useState("ALL");

  // -------------------------------------------------------------
  // Tab 3: Immutable Audit Logs State
  // -------------------------------------------------------------
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(1);
  const [logActionFilter, setLogActionFilter] = useState("");
  const [logTargetTypeFilter, setLogTargetTypeFilter] = useState("");
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const itemsPerPage = 10;

  // Authentication guard
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role?.toLowerCase();
    if (!storedUser || (role !== "owner" && role !== "admin" && role !== "super admin")) {
      toast({
        title: "Access Denied",
        description: "Only admin, super admin, or owner can access Commission Governance.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentUser(storedUser);
  }, [toast]);

  // -------------------------------------------------------------
  // Data Fetching Functions
  // -------------------------------------------------------------
  const fetchCommissions = useCallback(async () => {
    try {
      setIsLoadingCommissions(true);
      const response = await getAllServiceCommissions(commissionPage, 100, commissionSearch);
      const data = response.result || response.data || response.commissions || response || [];
      const list = Array.isArray(data) ? data : (data.commissions || []);
      setCommissions(list);
      setTotalCommissionPages(Math.ceil(list.length / itemsPerPage) || 1);
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setCommissions([]);
    } finally {
      setIsLoadingCommissions(false);
    }
  }, [commissionPage, commissionSearch]);

  const fetchAllServicesList = useCallback(async () => {
    try {
      const response = await getAllServices();
      const data = response.result || response.data || response.services || response || [];
      const list = Array.isArray(data) ? data : (data.services || []);
      const sorted = list.slice().sort((a, b) => (a.serviceName || a.name || "").localeCompare(b.serviceName || b.name || ""));
      setAllServices(sorted);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }, []);

  const fetchBookingsList = useCallback(async () => {
    try {
      setIsLoadingBookings(true);
      const response = await getAllBookings({ page: bookingPage, limit: 30 });
      const data = response.result || response.data || response.bookings || response || [];
      const list = Array.isArray(data) ? data : (data.bookings || []);
      setBookings(list);
      setTotalBookingPages(Math.ceil(list.length / itemsPerPage) || 1);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [bookingPage]);

  const fetchAuditLogsList = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const params = {
        limit: itemsPerPage,
        page: logPage,
      };
      if (logActionFilter) params.action = logActionFilter;
      if (logTargetTypeFilter) params.targetType = logTargetTypeFilter;
      if (logDateFrom) params.from = logDateFrom;
      if (logDateTo) params.to = logDateTo;

      const response = await getAuditLogs(params);
      const data = response.result || response.data || response.logs || response || [];
      const list = Array.isArray(data) ? data : (data.logs || []);
      setAuditLogs(list);
      setTotalLogPages(data.totalPages || Math.ceil((data.total || list.length) / itemsPerPage) || 1);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setAuditLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [logPage, logActionFilter, logTargetTypeFilter, logDateFrom, logDateTo]);

  useEffect(() => {
    if (currentUser) {
      fetchCommissions();
      fetchAllServicesList();
    }
  }, [currentUser, fetchCommissions, fetchAllServicesList]);

  useEffect(() => {
    if (currentUser && activeTab === 1) {
      fetchBookingsList();
    } else if (currentUser && activeTab === 3) {
      fetchAuditLogsList();
    }
  }, [currentUser, activeTab, fetchBookingsList, fetchAuditLogsList]);

  // -------------------------------------------------------------
  // Merge Catalog Services with Custom Commission Rules
  // -------------------------------------------------------------
  const combinedCommissions = useMemo(() => {
    if (!allServices || allServices.length === 0) return commissions;

    const commissionMap = new Map();
    commissions.forEach((c) => {
      const sId = c.serviceId?._id || c.serviceId || c._id;
      if (sId) commissionMap.set(sId.toString(), c);
    });

    return allServices.map((svc) => {
      const sId = (svc._id || svc.id || "").toString();
      const existing = commissionMap.get(sId);
      if (existing) {
        return {
          ...existing,
          serviceId: svc,
          serviceName: svc.serviceName || svc.name || "Service",
          serviceType: svc.serviceType || svc.category?.name || "Standard",
          commissionPercentage: existing.commissionPercentage ?? 15,
          isActive: existing.isActive !== false,
        };
      }
      return {
        _id: sId,
        serviceId: svc,
        serviceName: svc.serviceName || svc.name || "Service",
        serviceType: svc.serviceType || svc.category?.name || "Standard",
        commissionPercentage: 15,
        effectiveFrom: new Date().toISOString(),
        isActive: true,
      };
    });
  }, [allServices, commissions]);

  // -------------------------------------------------------------
  // Computed KPI Stats
  // -------------------------------------------------------------
  const stats = useMemo(() => {
    const list = combinedCommissions.length ? combinedCommissions : commissions;
    const total = list.length || allServices.length || 0;
    const pcts = list.map((c) => Number(c.commissionPercentage) || 0).filter((p) => p > 0);
    const avg = pcts.length ? (pcts.reduce((a, b) => a + b, 0) / pcts.length).toFixed(1) : "15.0";
    const highMargin = list.filter((c) => (Number(c.commissionPercentage) || 0) > 20).length;
    const lowMargin = list.filter((c) => (Number(c.commissionPercentage) || 0) < 10).length;
    const scheduled = list.filter((c) => c.scheduledPercentage && new Date(c.scheduledEffectiveFrom) > new Date()).length;

    return {
      totalServices: total,
      avgCommission: avg,
      highMargin,
      lowMargin,
      scheduled,
    };
  }, [combinedCommissions, commissions, allServices]);

  // -------------------------------------------------------------
  // Filtered & Sorted Commissions
  // -------------------------------------------------------------
  const filteredCommissions = useMemo(() => {
    const search = commissionSearch.toLowerCase();
    const sourceList = combinedCommissions.length ? combinedCommissions : commissions;
    return sourceList
      .filter((item) => {
        const name = (item.serviceId?.serviceName || item.serviceName || "").toLowerCase();
        const type = (item.serviceId?.serviceType || item.serviceType || "").toLowerCase();
        const matchesSearch = name.includes(search) || type.includes(search);

        const pct = Number(item.commissionPercentage) || 0;
        let matchesMargin = true;
        if (commissionMarginFilter === "HIGH") matchesMargin = pct > 20;
        if (commissionMarginFilter === "STANDARD") matchesMargin = pct >= 10 && pct <= 20;
        if (commissionMarginFilter === "LOW") matchesMargin = pct < 10;
        if (commissionMarginFilter === "SCHEDULED") matchesMargin = !!item.scheduledPercentage;

        let matchesStatus = true;
        if (commissionStatusFilter === "ACTIVE") matchesStatus = item.isActive !== false;
        if (commissionStatusFilter === "INACTIVE") matchesStatus = item.isActive === false;

        return matchesSearch && matchesMargin && matchesStatus;
      })
      .sort((a, b) => {
        const nameA = (a.serviceId?.serviceName || a.serviceName || "").toLowerCase();
        const nameB = (b.serviceId?.serviceName || b.serviceName || "").toLowerCase();
        const pctA = Number(a.commissionPercentage) || 0;
        const pctB = Number(b.commissionPercentage) || 0;
        const dateA = new Date(a.effectiveFrom || 0);
        const dateB = new Date(b.effectiveFrom || 0);

        if (commissionSortBy === "name_asc") return nameA.localeCompare(nameB);
        if (commissionSortBy === "name_desc") return nameB.localeCompare(nameA);
        if (commissionSortBy === "pct_desc") return pctB - pctA;
        if (commissionSortBy === "pct_asc") return pctA - pctB;
        if (commissionSortBy === "date_desc") return dateB - dateA;
        return 0;
      });
  }, [combinedCommissions, commissions, commissionSearch, commissionMarginFilter, commissionStatusFilter, commissionSortBy]);

  const pagedCommissions = useMemo(() => {
    const start = (commissionPage - 1) * itemsPerPage;
    return filteredCommissions.slice(start, start + itemsPerPage);
  }, [filteredCommissions, commissionPage]);

  // Keep totalCommissionPages in sync with filtered items
  useEffect(() => {
    setTotalCommissionPages(Math.ceil(filteredCommissions.length / itemsPerPage) || 1);
  }, [filteredCommissions]);

  // -------------------------------------------------------------
  // Filtered Bookings for Override Tab
  // -------------------------------------------------------------
  const filteredBookings = useMemo(() => {
    const search = bookingSearch.toLowerCase();
    return bookings.filter((b) => {
      const bId = (b.bookingId || b._id || "").toLowerCase();
      const sName = (b.serviceId?.serviceName || b.serviceName || "").toLowerCase();
      const cust = (b.customerId?.name || b.customerName || b.mobileNumber || "").toLowerCase();
      const matchesSearch = bId.includes(search) || sName.includes(search) || cust.includes(search);

      if (bookingStatusFilter !== "ALL") {
        return matchesSearch && (b.status || "").toUpperCase() === bookingStatusFilter;
      }
      return matchesSearch;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  // -------------------------------------------------------------
  // Handlers: Create, Edit & Schedule Commission
  // -------------------------------------------------------------
  const handleOpenCreateRule = () => {
    setTargetCommissionItem(null);
    setSelectedServiceForRule(allServices[0]?._id || "");
    setRulePercentage(15);
    setRuleEffectiveFrom(new Date().toISOString().split("T")[0]);
    setRuleReason("");
    setIsSchedulingMode(false);
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (item, isSchedule = false) => {
    setTargetCommissionItem(item);
    setSelectedServiceForRule(item.serviceId?._id || item.serviceId || item._id);
    setRulePercentage(item.commissionPercentage || 15);
    setRuleEffectiveFrom(
      isSchedule
        ? new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0] // default 14 days in future
        : item.effectiveFrom ? new Date(item.effectiveFrom).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    );
    setRuleReason("");
    setIsSchedulingMode(isSchedule);
    setIsRuleModalOpen(true);
  };

  const handleOpenHistoryDrawer = async (item) => {
    setHistoryService(item);
    setIsHistoryModalOpen(true);
    try {
      setIsLoadingHistory(true);
      const serviceId = item.serviceId?._id || item.serviceId || item._id;
      const res = await getServiceCommissionConfig(serviceId);
      const hist = res.history || res.result?.history || [];
      setHistoryList(hist);
    } catch (e) {
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmitRule = async () => {
    if (rulePercentage === "" || Number(rulePercentage) < 0 || Number(rulePercentage) > 100) {
      return toast({
        title: "Validation Error",
        description: "Commission rate must be a valid percentage between 0% and 100%.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!ruleEffectiveFrom) {
      return toast({
        title: "Validation Error",
        description: "Please select a valid effective-from date.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmittingRule(true);

      if (isSchedulingMode) {
        await scheduleServiceCommission(selectedServiceForRule, {
          scheduledPercentage: Number(rulePercentage),
          scheduledEffectiveFrom: new Date(ruleEffectiveFrom).toISOString(),
          reason: ruleReason || "Future festive/quarterly commission rate revision",
        });
        toast({
          title: "Commission Scheduled",
          description: `Scheduled forward revision to ${rulePercentage}% effective from ${new Date(ruleEffectiveFrom).toLocaleDateString()}.`,
          status: "success",
          duration: 3500,
          isClosable: true,
        });
      } else {
        await setServiceCommission(selectedServiceForRule, {
          commissionPercentage: Number(rulePercentage),
          effectiveFrom: new Date(ruleEffectiveFrom).toISOString(),
          reason: ruleReason || "Direct administrative catalog commission rate update",
        });
        toast({
          title: "Commission Updated",
          description: `Successfully applied ${rulePercentage}% effective from ${new Date(ruleEffectiveFrom).toLocaleDateString()}.`,
          status: "success",
          duration: 3500,
          isClosable: true,
        });
      }

      setIsRuleModalOpen(false);
      fetchCommissions();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to save commission rate.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleCancelSchedule = async (item) => {
    const serviceId = item.serviceId?._id || item.serviceId || item._id;
    try {
      await cancelScheduledCommission(serviceId);
      toast({
        title: "Schedule Cancelled",
        description: "Upcoming commission revision has been revoked.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      fetchCommissions();
    } catch (err) {
      toast({
        title: "Cancel Failed",
        description: err.message || "Could not cancel scheduled revision.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (item) => {
    const serviceId = item.serviceId?._id || item.serviceId || item._id;
    const newStatus = item.isActive === false;
    try {
      await toggleServiceCommissionStatus(serviceId, {
        isActive: newStatus,
        reason: `Commission rule ${newStatus ? "re-activated" : "deactivated"} by Admin`,
      });
      toast({
        title: newStatus ? "Rule Activated" : "Rule Deactivated",
        description: `Service commission rule status changed to ${newStatus ? "Active" : "Inactive"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchCommissions();
    } catch (err) {
      toast({
        title: "Status Update Failed",
        description: err.message || "Could not toggle commission rule status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // -------------------------------------------------------------
  // Handlers: Booking Override & Revert
  // -------------------------------------------------------------
  const handleOpenOverrideModal = (booking) => {
    setSelectedBookingForOverride(booking);
    setOverridePercentage(10);
    setOverrideReason("");
    setIsOverrideModalOpen(true);
  };

  const handleSubmitOverride = async () => {
    if (overridePercentage === "" || Number(overridePercentage) < 0 || Number(overridePercentage) > 100) {
      return toast({
        title: "Validation Error",
        description: "Override commission must be between 0% and 100%.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!overrideReason.trim()) {
      return toast({
        title: "Mandatory Reason Required",
        description: "Please enter an official audit justification for this booking commission override.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmittingOverride(true);
      const bookingId = selectedBookingForOverride._id || selectedBookingForOverride.bookingId;
      await overrideBookingCommission(bookingId, {
        overridePercentage: Number(overridePercentage),
        overrideReason: overrideReason.trim(),
      });

      toast({
        title: "Commission Override Applied",
        description: `Booking #${bookingId.slice(-6)} commission set to ${overridePercentage}%.`,
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      setIsOverrideModalOpen(false);
      fetchBookingsList();
    } catch (err) {
      toast({
        title: "Override Failed",
        description: err.message || "Could not apply commission override.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleRevertOverride = async (booking) => {
    const bookingId = booking._id || booking.bookingId;
    try {
      await revertBookingCommissionOverride(bookingId);
      toast({
        title: "Override Reverted",
        description: `Booking #${bookingId.slice(-6)} commission reverted to standard catalog rate.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      fetchBookingsList();
    } catch (err) {
      toast({
        title: "Revert Failed",
        description: err.message || "Could not revert booking override.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // -------------------------------------------------------------
  // Export Audit Logs to CSV
  // -------------------------------------------------------------
  const handleExportAuditLogsCSV = () => {
    if (!auditLogs.length) {
      return toast({ title: "No Data", description: "No audit logs available to export.", status: "info", duration: 2500 });
    }
    const headers = ["Timestamp", "Action", "Actor", "Target Type", "Details", "IP Address"];
    const rows = auditLogs.map((l) => [
      l.createdAt ? new Date(l.createdAt).toISOString() : "",
      l.action || "",
      l.actor?.name || l.performedBy || "System",
      l.targetType || "",
      (typeof l.details === "object" ? JSON.stringify(l.details) : l.details || "").replace(/"/g, '""'),
      l.ipAddress || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => `"${e.join('","')}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RightTouch_Commission_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) return null;

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "80px" }}
      pb="28px"
      px={{ base: 3, md: 6 }}
      minH="100vh"
      overflowY="auto"
      css={globalScrollbarStyles}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. KPI STAT CARDS BANNER                                        */}
      {/* ------------------------------------------------------------- */}
      <Box mb={5} flexShrink={0}>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap={{ base: 3, md: 4 }}>
          {[
            {
              label: "Configured Services",
              value: stats.totalServices,
              icon: MdAttachMoney,
              color: BRAND,
              bg: "teal.50",
            },
            {
              label: "Average Platform Cut",
              value: `${stats.avgCommission}%`,
              icon: FaExchangeAlt,
              color: "#6366F1",
              bg: "indigo.50",
            },
            {
              label: "High Margin (>20%)",
              value: stats.highMargin,
              icon: MdTrendingUp,
              color: "#10B981",
              bg: "emerald.50",
            },
            {
              label: "Low Margin / Promo (<10%)",
              value: stats.lowMargin,
              icon: MdOutlineTrendingDown,
              color: "#F59E0B",
              bg: "amber.50",
            },
            {
              label: "Scheduled Rate Changes",
              value: stats.scheduled,
              icon: MdSchedule,
              color: "#8B5CF6",
              bg: "purple.50",
            },
          ].map((card, idx) => (
            <Box
              key={idx}
              bg="white"
              borderRadius="14px"
              p={4}
              border="1.5px solid"
              borderColor="gray.200"
              boxShadow="0 1px 3px rgba(16,24,40,0.05)"
              transition="all 0.2s"
              _hover={{ borderColor: card.color, transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(16,24,40,0.08)" }}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" noOfLines={1}>
                    {card.label}
                  </Text>
                  <Text fontSize="2xl" fontWeight="800" color="gray.800" mt={1}>
                    {card.value}
                  </Text>
                </Box>
                <Flex
                  w="42px"
                  h="42px"
                  borderRadius="10px"
                  bg={card.bg}
                  color={card.color}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={card.icon} boxSize={5} />
                </Flex>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CARD & TABS CONTAINER                                   */}
      {/* ------------------------------------------------------------- */}
      <Card bg="white" borderRadius="16px" shadow="sm" border="1px solid" borderColor="gray.200" overflow="hidden" flex="1" display="flex" flexDirection="column">
        <CardHeader p={{ base: 4, md: 5 }} pb={0}>
          <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} flexWrap="wrap" gap={3} mb={3}>
            <Box>
              <Heading size="md" color="gray.800" fontWeight="800" letterSpacing="-0.02em">
                RightTouch Commission Governance &amp; Financial Ledgers
              </Heading>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                Manage catalog commission rates, schedule future revisions, audit overrides, and track COD/Gateway settlements.
              </Text>
            </Box>

            <HStack spacing={2}>
              {activeTab === 0 && (
                <Button
                  leftIcon={<MdAdd />}
                  size="sm"
                  bg={BRAND}
                  color="white"
                  borderRadius="8px"
                  _hover={{ bg: BRAND_DARK }}
                  onClick={handleOpenCreateRule}
                >
                  Set Commission Rule
                </Button>
              )}
              {activeTab === 3 && (
                <Button
                  leftIcon={<FaDownload />}
                  size="sm"
                  variant="outline"
                  borderRadius="8px"
                  borderColor="gray.300"
                  onClick={handleExportAuditLogsCSV}
                >
                  Export CSV
                </Button>
              )}
              <Button
                leftIcon={<MdRefresh />}
                size="sm"
                variant="outline"
                borderRadius="8px"
                borderColor="gray.300"
                onClick={() => {
                  if (activeTab === 0) fetchCommissions();
                  if (activeTab === 1) fetchBookingsList();
                  if (activeTab === 3) fetchAuditLogsList();
                }}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>

          {/* Module Navigation Tabs */}
          <HStack spacing={2} overflowX="auto" pb={2} pt={1} css={globalScrollbarStyles}>
            {[
              { label: "1. Service Commissions & Scheduling", icon: MdAttachMoney, count: filteredCommissions.length },
              { label: "2. Booking Overrides & Calculator", icon: FaCalculator, count: bookings.length },
              { label: "3. Settlement Ledger (COD / Online)", icon: MdPayments },
              { label: "4. Immutable Financial Audit Trail", icon: MdHistory, count: auditLogs.length },
            ].map((t, idx) => (
              <Button
                key={idx}
                size="sm"
                onClick={() => { setActiveTab(idx); }}
                bg={activeTab === idx ? BRAND : "gray.50"}
                color={activeTab === idx ? "white" : "gray.700"}
                fontWeight={activeTab === idx ? "700" : "600"}
                borderRadius="10px"
                px={4}
                py={2}
                border="1px solid"
                borderColor={activeTab === idx ? BRAND : "gray.200"}
                leftIcon={<Icon as={t.icon} boxSize={4} />}
                _hover={{ bg: activeTab === idx ? BRAND_DARK : "gray.100" }}
                flexShrink={0}
              >
                {t.label}
                {t.count !== undefined && (
                  <Badge ml={2} bg={activeTab === idx ? "whiteAlpha.300" : "gray.200"} color={activeTab === idx ? "white" : "gray.700"} borderRadius="full" fontSize="10px">
                    {t.count}
                  </Badge>
                )}
              </Button>
            ))}
          </HStack>
        </CardHeader>

        <CardBody p={{ base: 4, md: 5 }} pt={3} flex="1" display="flex" flexDirection="column">
          {/* ========================================================= */}
          {/* TAB 0: SERVICE COMMISSIONS & SCHEDULING                   */}
          {/* ========================================================= */}
          {activeTab === 0 && (
            <VStack spacing={4} align="stretch" flex="1">
              {/* Filter Toolbar */}
              <Flex gap={2.5} wrap="wrap" align="center" bg="gray.50" p={2.5} borderRadius="10px" border="1px solid" borderColor="gray.200">
                <Box position="relative" flex={{ base: "1 1 100%", sm: "0 1 260px" }}>
                  <Icon as={MdSearch} position="absolute" left="10px" top="50%" transform="translateY(-50%)" color="gray.400" />
                  <Input
                    placeholder="Search service name or category..."
                    size="sm"
                    pl="32px"
                    bg="white"
                    borderRadius="8px"
                    value={commissionSearch}
                    onChange={(e) => { setCommissionSearch(e.target.value); setCommissionPage(1); }}
                  />
                </Box>

                <Select
                  size="sm"
                  w={{ base: "100%", sm: "160px" }}
                  bg="white"
                  borderRadius="8px"
                  value={commissionMarginFilter}
                  onChange={(e) => { setCommissionMarginFilter(e.target.value); setCommissionPage(1); }}
                >
                  <option value="ALL">All Margins</option>
                  <option value="HIGH">High Margin (&gt;20%)</option>
                  <option value="STANDARD">Standard (10-20%)</option>
                  <option value="LOW">Low / Promo (&lt;10%)</option>
                  <option value="SCHEDULED">Scheduled Only</option>
                </Select>

                <Select
                  size="sm"
                  w={{ base: "100%", sm: "140px" }}
                  bg="white"
                  borderRadius="8px"
                  value={commissionStatusFilter}
                  onChange={(e) => { setCommissionStatusFilter(e.target.value); setCommissionPage(1); }}
                >
                  <option value="ALL">Status: All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>

                <Select
                  size="sm"
                  w={{ base: "100%", sm: "160px" }}
                  bg="white"
                  borderRadius="8px"
                  value={commissionSortBy}
                  onChange={(e) => setCommissionSortBy(e.target.value)}
                >
                  <option value="name_asc">Sort: Name (A–Z)</option>
                  <option value="name_desc">Sort: Name (Z–A)</option>
                  <option value="pct_desc">Sort: Commission (High–Low)</option>
                  <option value="pct_asc">Sort: Commission (Low–High)</option>
                  <option value="date_desc">Sort: Effective Date</option>
                </Select>

                {(commissionSearch || commissionMarginFilter !== "ALL" || commissionStatusFilter !== "ALL") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="gray.600"
                    onClick={() => {
                      setCommissionSearch("");
                      setCommissionMarginFilter("ALL");
                      setCommissionStatusFilter("ALL");
                      setCommissionPage(1);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </Flex>

              {/* Commissions Table */}
              <Box overflowX="auto" borderRadius="12px" border="1px solid" borderColor="gray.200">
                {isLoadingCommissions ? (
                  <Flex justify="center" align="center" py={12}>
                    <Spinner size="lg" color={BRAND} />
                  </Flex>
                ) : (
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th py={3}>#</Th>
                        <Th py={3}>SERVICE NAME</Th>
                        <Th py={3}>TYPE / CATEGORY</Th>
                        <Th py={3}>COMMISSION RATE</Th>
                        <Th py={3}>EFFECTIVE FROM</Th>
                        <Th py={3}>SCHEDULED REVISION</Th>
                        <Th py={3}>STATUS</Th>
                        <Th py={3} textAlign="right">ACTIONS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pagedCommissions.length === 0 ? (
                        <Tr>
                          <Td colSpan={8} textAlign="center" py={8} color="gray.500">
                            No service commission rules match the current filters.
                          </Td>
                        </Tr>
                      ) : (
                        pagedCommissions.map((item, idx) => {
                          const pct = Number(item.commissionPercentage) || 0;
                          const hasSchedule = item.scheduledPercentage && new Date(item.scheduledEffectiveFrom) > new Date();

                          return (
                            <Tr key={item._id || idx} _hover={{ bg: "teal.50" }}>
                              <Td fontWeight="600" color="gray.500">
                                {(commissionPage - 1) * itemsPerPage + idx + 1}
                              </Td>
                              <Td fontWeight="700" color="gray.800">
                                {item.serviceId?.serviceName || item.serviceName || "Service"}
                              </Td>
                              <Td>
                                <Tag size="sm" colorScheme="purple">
                                  {item.serviceId?.serviceType || item.serviceType || "Standard"}
                                </Tag>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={pct > 20 ? "green" : pct >= 10 ? "teal" : "orange"}
                                  fontSize="xs"
                                  px={2.5}
                                  py={0.5}
                                  borderRadius="full"
                                  fontWeight="800"
                                >
                                  {pct}%
                                </Badge>
                              </Td>
                              <Td fontSize="xs" color="gray.600">
                                {item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString() : "Immediate"}
                              </Td>
                              <Td>
                                {hasSchedule ? (
                                  <HStack spacing={1}>
                                    <Badge colorScheme="purple" fontSize="10px">
                                      {item.scheduledPercentage}%
                                    </Badge>
                                    <Text fontSize="10px" color="gray.500">
                                      on {new Date(item.scheduledEffectiveFrom).toLocaleDateString()}
                                    </Text>
                                  </HStack>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">—</Text>
                                )}
                              </Td>
                              <Td>
                                <Tag size="sm" colorScheme={item.isActive !== false ? "green" : "gray"}>
                                  {item.isActive !== false ? "Active" : "Inactive"}
                                </Tag>
                              </Td>
                              <Td textAlign="right">
                                <HStack spacing={1} justify="flex-end">
                                  <Tooltip label="Edit Rate">
                                    <IconButton
                                      aria-label="Edit"
                                      icon={<FaEdit />}
                                      size="xs"
                                      colorScheme="teal"
                                      variant="ghost"
                                      onClick={() => handleOpenEditRule(item, false)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Schedule Future Revision">
                                    <IconButton
                                      aria-label="Schedule"
                                      icon={<MdSchedule />}
                                      size="xs"
                                      colorScheme="purple"
                                      variant="ghost"
                                      onClick={() => handleOpenEditRule(item, true)}
                                    />
                                  </Tooltip>
                                  {hasSchedule && (
                                    <Tooltip label="Cancel Scheduled Revision">
                                      <IconButton
                                        aria-label="Cancel Schedule"
                                        icon={<FaTimesCircle />}
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleCancelSchedule(item)}
                                      />
                                    </Tooltip>
                                  )}
                                  <Tooltip label={item.isActive !== false ? "Deactivate Rule (Soft)" : "Re-activate Rule"}>
                                    <IconButton
                                      aria-label="Toggle Status"
                                      icon={item.isActive !== false ? <FaTimesCircle /> : <FaCheckCircle />}
                                      size="xs"
                                      colorScheme={item.isActive !== false ? "orange" : "green"}
                                      variant="ghost"
                                      onClick={() => handleToggleStatus(item)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="View Audit History">
                                    <IconButton
                                      aria-label="History"
                                      icon={<FaHistory />}
                                      size="xs"
                                      colorScheme="blue"
                                      variant="ghost"
                                      onClick={() => handleOpenHistoryDrawer(item)}
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                )}
              </Box>

              {/* Pagination */}
              {totalCommissionPages > 1 && (
                <Flex justify="space-between" align="center" mt={2}>
                  <Text fontSize="xs" color="gray.500">
                    Showing {(commissionPage - 1) * itemsPerPage + 1} to {Math.min(commissionPage * itemsPerPage, filteredCommissions.length)} of {filteredCommissions.length} services
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      leftIcon={<FaChevronLeft />}
                      onClick={() => setCommissionPage(Math.max(1, commissionPage - 1))}
                      isDisabled={commissionPage === 1}
                    >
                      Previous
                    </Button>
                    <Text fontSize="xs" fontWeight="700" color={BRAND}>
                      {commissionPage} / {totalCommissionPages}
                    </Text>
                    <Button
                      size="xs"
                      rightIcon={<FaChevronRight />}
                      onClick={() => setCommissionPage(Math.min(totalCommissionPages, commissionPage + 1))}
                      isDisabled={commissionPage === totalCommissionPages}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              )}
            </VStack>
          )}

          {/* ========================================================= */}
          {/* TAB 1: BOOKING COMMISSION OVERRIDES & CALCULATOR          */}
          {/* ========================================================= */}
          {activeTab === 1 && (
            <VStack spacing={5} align="stretch" flex="1">
              {/* Financial Breakdown Simulator Card */}
              <Box p={4} bg="teal.50" borderRadius="14px" border="1.5px solid" borderColor="teal.200">
                <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                  <HStack spacing={2}>
                    <Icon as={FaCalculator} color={BRAND} />
                    <Text fontSize="sm" fontWeight="700" color="teal.900">
                      Live Financial Commission &amp; Technician Payout Simulator
                    </Text>
                  </HStack>
                  <Badge colorScheme="teal">Real-Time Split Engine</Badge>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={3} mb={3}>
                  <Box bg="white" p={3} borderRadius="8px" border="1px solid" borderColor="teal.200">
                    <Text fontSize="11px" fontWeight="600" color="gray.600">Gross Booking (₹)</Text>
                    <NumberInput size="sm" value={calcGrossAmount} onChange={(v) => setCalcGrossAmount(Number(v) || 0)} min={100}>
                      <NumberInputField fontWeight="700" />
                    </NumberInput>
                  </Box>
                  <Box bg="white" p={3} borderRadius="8px" border="1px solid" borderColor="teal.200">
                    <Text fontSize="11px" fontWeight="600" color="gray.600">Platform Commission (%)</Text>
                    <NumberInput size="sm" value={calcCommissionPct} onChange={(v) => setCalcCommissionPct(Number(v) || 0)} min={0} max={100}>
                      <NumberInputField fontWeight="700" />
                    </NumberInput>
                  </Box>
                  <Box bg="white" p={3} borderRadius="8px" border="1px solid" borderColor="teal.200">
                    <Text fontSize="11px" fontWeight="600" color="gray.600">TDS Withholding (%)</Text>
                    <NumberInput size="sm" value={calcTdsPct} onChange={(v) => setCalcTdsPct(Number(v) || 0)} min={0} max={10}>
                      <NumberInputField fontWeight="700" />
                    </NumberInput>
                  </Box>
                  <Box bg="white" p={3} borderRadius="8px" border="1px solid" borderColor="teal.200">
                    <Text fontSize="11px" fontWeight="600" color="gray.600">Technician Incentive (₹)</Text>
                    <NumberInput size="sm" value={calcIncentives} onChange={(v) => setCalcIncentives(Number(v) || 0)} min={0}>
                      <NumberInputField fontWeight="700" />
                    </NumberInput>
                  </Box>
                </Grid>

                {/* Calculation Outputs */}
                {(() => {
                  const platformFee = (calcGrossAmount * (calcCommissionPct / 100));
                  const tdsAmount = (calcGrossAmount * (calcTdsPct / 100));
                  const techNet = calcGrossAmount - platformFee - tdsAmount + calcIncentives;

                  return (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                      <Box p={3} bg="white" borderRadius="8px" borderLeft="4px solid" borderColor="teal.500">
                        <Text fontSize="11px" color="gray.500">RightTouch Platform Fee</Text>
                        <Text fontSize="lg" fontWeight="800" color="teal.700">₹{platformFee.toFixed(2)}</Text>
                        <Text fontSize="10px" color="gray.500">({calcCommissionPct}% of Gross)</Text>
                      </Box>
                      <Box p={3} bg="white" borderRadius="8px" borderLeft="4px solid" borderColor="orange.400">
                        <Text fontSize="11px" color="gray.500">Tax Withholding (TDS)</Text>
                        <Text fontSize="lg" fontWeight="800" color="orange.700">₹{tdsAmount.toFixed(2)}</Text>
                        <Text fontSize="10px" color="gray.500">({calcTdsPct}% Section 194C/M)</Text>
                      </Box>
                      <Box p={3} bg="white" borderRadius="8px" borderLeft="4px solid" borderColor="green.500">
                        <Text fontSize="11px" color="gray.500">Technician Net Payout</Text>
                        <Text fontSize="lg" fontWeight="800" color="green.700">₹{techNet.toFixed(2)}</Text>
                        <Text fontSize="10px" color="gray.500">Credited to Tech Wallet</Text>
                      </Box>
                    </Grid>
                  );
                })()}
              </Box>

              {/* Bookings Override Table */}
              <Flex gap={2.5} wrap="wrap" align="center" bg="gray.50" p={2.5} borderRadius="10px" border="1px solid" borderColor="gray.200">
                <Box position="relative" flex={{ base: "1 1 100%", sm: "0 1 280px" }}>
                  <Icon as={MdSearch} position="absolute" left="10px" top="50%" transform="translateY(-50%)" color="gray.400" />
                  <Input
                    placeholder="Search booking ID, customer, service..."
                    size="sm"
                    pl="32px"
                    bg="white"
                    borderRadius="8px"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                  />
                </Box>
                <Select
                  size="sm"
                  w={{ base: "100%", sm: "160px" }}
                  bg="white"
                  borderRadius="8px"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Booking Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </Flex>

              <Box overflowX="auto" borderRadius="12px" border="1px solid" borderColor="gray.200">
                {isLoadingBookings ? (
                  <Flex justify="center" align="center" py={12}>
                    <Spinner size="lg" color={BRAND} />
                  </Flex>
                ) : (
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th py={3}>BOOKING ID</Th>
                        <Th py={3}>SERVICE</Th>
                        <Th py={3}>CUSTOMER</Th>
                        <Th py={3}>GROSS AMOUNT</Th>
                        <Th py={3}>DEFAULT COMMISSION</Th>
                        <Th py={3}>OVERRIDE STATUS</Th>
                        <Th py={3} textAlign="right">ACTION</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredBookings.length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                            No bookings found.
                          </Td>
                        </Tr>
                      ) : (
                        filteredBookings.slice(0, 10).map((b, idx) => {
                          const gross = b.totalPrice || b.amount || 1000;
                          const isOverridden = b.isCommissionOverridden || false;
                          const isSettledOrCancelled = b.status === "CANCELLED" || b.status === "REFUNDED";

                          return (
                            <Tr key={b._id || idx} _hover={{ bg: "gray.50" }}>
                              <Td fontWeight="700" color={BRAND}>#{b._id?.slice(-6) || "BKG101"}</Td>
                              <Td fontWeight="600">{b.serviceId?.serviceName || b.serviceName || "Service"}</Td>
                              <Td fontSize="xs">{b.customerId?.name || b.customerName || "Customer"}</Td>
                              <Td fontWeight="700">₹{gross}</Td>
                              <Td>
                                <Badge colorScheme="teal">{b.defaultCommissionPct || 15}%</Badge>
                              </Td>
                              <Td>
                                {isOverridden ? (
                                  <Tag size="sm" colorScheme="purple">Overridden ({b.overrideCommissionPct}%)</Tag>
                                ) : (
                                  <Tag size="sm" colorScheme="gray">Standard</Tag>
                                )}
                              </Td>
                              <Td textAlign="right">
                                <HStack spacing={1} justify="flex-end">
                                  <Button
                                    size="xs"
                                    colorScheme="teal"
                                    variant="outline"
                                    isDisabled={isSettledOrCancelled}
                                    onClick={() => handleOpenOverrideModal(b)}
                                  >
                                    {isOverridden ? "Edit Override" : "Override %"}
                                  </Button>
                                  {isOverridden && (
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      variant="ghost"
                                      isDisabled={isSettledOrCancelled}
                                      onClick={() => handleRevertOverride(b)}
                                    >
                                      Revert
                                    </Button>
                                  )}
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </VStack>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SETTLEMENT LEDGER (COD vs ONLINE GATEWAY)          */}
          {/* ========================================================= */}
          {activeTab === 2 && (
            <VStack spacing={4} align="stretch" flex="1">
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                {/* COD Settlement Box */}
                <Box p={4} bg="orange.50" borderRadius="14px" border="1.5px solid" borderColor="orange.200">
                  <HStack spacing={2} mb={2}>
                    <Icon as={FaMoneyBillWave} color="orange.600" />
                    <Text fontWeight="800" color="orange.900">Cash on Delivery (COD) Collections</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.600" mb={3}>
                    Technicians physically hold 100% customer cash. Platform fee is debited from their floating security deposit.
                  </Text>
                  <SimpleGrid columns={2} gap={2} fontSize="xs">
                    <Box p={2.5} bg="white" borderRadius="8px">
                      <Text color="gray.500">Total COD Collected</Text>
                      <Text fontWeight="800" color="gray.800">₹1,45,200</Text>
                    </Box>
                    <Box p={2.5} bg="white" borderRadius="8px">
                      <Text color="gray.500">Platform Fee Owed</Text>
                      <Text fontWeight="800" color="orange.700">₹21,780</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Online Gateway Settlement Box */}
                <Box p={4} bg="blue.50" borderRadius="14px" border="1.5px solid" borderColor="blue.200">
                  <HStack spacing={2} mb={2}>
                    <Icon as={MdOutlineAccountBalanceWallet} color="blue.600" />
                    <Text fontWeight="800" color="blue.900">Online Gateway (UPI / Razorpay)</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.600" mb={3}>
                    Platform collects 100% upfront. Platform cut is retained and net earnings are credited to the technician wallet.
                  </Text>
                  <SimpleGrid columns={2} gap={2} fontSize="xs">
                    <Box p={2.5} bg="white" borderRadius="8px">
                      <Text color="gray.500">Online Captured</Text>
                      <Text fontWeight="800" color="gray.800">₹3,88,500</Text>
                    </Box>
                    <Box p={2.5} bg="white" borderRadius="8px">
                      <Text color="gray.500">Net Tech Wallet Credit</Text>
                      <Text fontWeight="800" color="green.700">₹3,26,340</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Grid>

              {/* Settlement History List */}
              <Box p={4} bg="white" borderRadius="12px" border="1px solid" borderColor="gray.200">
                <Heading size="xs" color="gray.700" mb={3} textTransform="uppercase">
                  Recent Settlement Ledger Entries
                </Heading>
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>TRANSACTION REF</Th>
                      <Th>PAYMENT MODE</Th>
                      <Th>GROSS AMOUNT</Th>
                      <Th>PLATFORM CUT</Th>
                      <Th>NET DISBURSED</Th>
                      <Th>SETTLEMENT STATUS</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[
                      { ref: "TXN-8821", mode: "COD", gross: 1200, cut: 180, net: 1020, status: "DEBITED_FROM_DEPOSIT" },
                      { ref: "TXN-8822", mode: "UPI_GATEWAY", gross: 2500, cut: 375, net: 2125, status: "WALLET_CREDITED" },
                      { ref: "TXN-8823", mode: "COD", gross: 800, cut: 120, net: 680, status: "DEBITED_FROM_DEPOSIT" },
                      { ref: "TXN-8824", mode: "CARD_GATEWAY", gross: 4000, cut: 600, net: 3400, status: "WALLET_CREDITED" },
                    ].map((row, i) => (
                      <Tr key={i}>
                        <Td fontWeight="700">{row.ref}</Td>
                        <Td><Tag size="sm" colorScheme={row.mode === "COD" ? "orange" : "blue"}>{row.mode}</Tag></Td>
                        <Td fontWeight="700">₹{row.gross}</Td>
                        <Td color="teal.600" fontWeight="700">₹{row.cut}</Td>
                        <Td color="green.600" fontWeight="700">₹{row.net}</Td>
                        <Td><Badge colorScheme="green">{row.status}</Badge></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          )}

          {/* ========================================================= */}
          {/* TAB 3: IMMUTABLE FINANCIAL AUDIT TRAIL                    */}
          {/* ========================================================= */}
          {activeTab === 3 && (
            <VStack spacing={4} align="stretch" flex="1">
              <Flex gap={2.5} wrap="wrap" align="center" bg="gray.50" p={2.5} borderRadius="10px" border="1px solid" borderColor="gray.200">
                <Select
                  size="sm"
                  maxW="160px"
                  bg="white"
                  borderRadius="8px"
                  value={logActionFilter}
                  onChange={(e) => { setLogActionFilter(e.target.value); setLogPage(1); }}
                >
                  <option value="">All Actions</option>
                  <option value="set_commission">SET_COMMISSION</option>
                  <option value="override">OVERRIDE</option>
                  <option value="create">CREATE</option>
                  <option value="update">UPDATE</option>
                  <option value="delete">DEACTIVATE</option>
                </Select>

                <Select
                  size="sm"
                  maxW="160px"
                  bg="white"
                  borderRadius="8px"
                  value={logTargetTypeFilter}
                  onChange={(e) => { setLogTargetTypeFilter(e.target.value); setLogPage(1); }}
                >
                  <option value="">All Target Types</option>
                  <option value="Service">Service</option>
                  <option value="Booking">Booking</option>
                  <option value="Commission">Commission</option>
                </Select>

                <Input
                  type="date"
                  size="sm"
                  maxW="150px"
                  bg="white"
                  borderRadius="8px"
                  value={logDateFrom}
                  onChange={(e) => { setLogDateFrom(e.target.value); setLogPage(1); }}
                />
                <Input
                  type="date"
                  size="sm"
                  maxW="150px"
                  bg="white"
                  borderRadius="8px"
                  value={logDateTo}
                  onChange={(e) => { setLogDateTo(e.target.value); setLogPage(1); }}
                />

                {(logActionFilter || logTargetTypeFilter || logDateFrom || logDateTo) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.600"
                    onClick={() => {
                      setLogActionFilter("");
                      setLogTargetTypeFilter("");
                      setLogDateFrom("");
                      setLogDateTo("");
                      setLogPage(1);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Flex>

              <Box overflowX="auto" borderRadius="12px" border="1px solid" borderColor="gray.200">
                {isLoadingLogs ? (
                  <Flex justify="center" align="center" py={12}>
                    <Spinner size="lg" color={BRAND} />
                  </Flex>
                ) : (
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th py={3}>#</Th>
                        <Th py={3}>ACTION</Th>
                        <Th py={3}>ACTOR</Th>
                        <Th py={3}>TARGET</Th>
                        <Th py={3}>AUDIT DETAILS</Th>
                        <Th py={3}>TIMESTAMP</Th>
                        <Th py={3} textAlign="right">INSPECT</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {auditLogs.length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                            No audit logs found.
                          </Td>
                        </Tr>
                      ) : (
                        auditLogs.map((log, idx) => (
                          <Tr key={log._id || idx} _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.500">
                              {(logPage - 1) * itemsPerPage + idx + 1}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  log.action?.includes("override") ? "purple" :
                                  log.action?.includes("commission") ? "teal" :
                                  log.action?.includes("create") ? "green" :
                                  "blue"
                                }
                              >
                                {log.action || "UPDATE"}
                              </Badge>
                            </Td>
                            <Td fontWeight="600">{log.actor?.name || log.performedBy || "Administrator"}</Td>
                            <Td><Tag size="sm">{log.targetType || "Service"}</Tag></Td>
                            <Td fontSize="xs" maxW="280px" noOfLines={1} color="gray.700">
                              {log.details || log.reason || "Rule adjusted"}
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                            </Td>
                            <Td textAlign="right">
                              <IconButton
                                aria-label="View"
                                icon={<MdVisibility />}
                                size="xs"
                                colorScheme="teal"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLog(log);
                                  setIsLogDetailOpen(true);
                                }}
                              />
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                )}
              </Box>

              {totalLogPages > 1 && (
                <Flex justify="space-between" align="center" mt={2}>
                  <Text fontSize="xs" color="gray.500">Page {logPage} of {totalLogPages}</Text>
                  <HStack spacing={2}>
                    <Button size="xs" onClick={() => setLogPage(Math.max(1, logPage - 1))} isDisabled={logPage === 1}>Previous</Button>
                    <Button size="xs" onClick={() => setLogPage(Math.min(totalLogPages, logPage + 1))} isDisabled={logPage === totalLogPages}>Next</Button>
                  </HStack>
                </Flex>
              )}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* ============================================================= */}
      {/* MODAL 1: CREATE / UPDATE / SCHEDULE COMMISSION RULE           */}
      {/* ============================================================= */}
      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" zIndex={1400} />
        <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401} mx={4} overflow="hidden">
          <ModalHeader bg="white" color="gray.800" borderBottom="1px solid" borderColor="gray.100" pr="50px" py={4}>
            <HStack spacing={2.5}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="10px"
                bg={isSchedulingMode ? "purple.50" : "teal.50"}
                color={isSchedulingMode ? "purple.600" : BRAND}
                align="center"
                justify="center"
              >
                <Icon as={isSchedulingMode ? MdSchedule : MdEdit} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800">
                  {isSchedulingMode
                    ? "Schedule Forward Commission Revision"
                    : targetCommissionItem
                    ? "Update Service Commission Rate"
                    : "Create Service Commission Rule"}
                </Text>
                <Text fontSize="xs" fontWeight="500" color="gray.500">
                  {isSchedulingMode
                    ? "Set an automated forward-dated rate change for upcoming campaigns"
                    : "Configure platform revenue cut applied to new bookings"}
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top="16px" right="16px" borderRadius="full" _hover={{ bg: "gray.100" }} />

          <ModalBody bg="white" py={5} px={6}>
            <VStack spacing={4} align="stretch">
              {/* Service Selector */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="gray.700">Service Catalog Item</FormLabel>
                <Select
                  size="md"
                  borderRadius="8px"
                  value={selectedServiceForRule}
                  onChange={(e) => setSelectedServiceForRule(e.target.value)}
                  isDisabled={!!targetCommissionItem}
                  fontWeight="600"
                >
                  {allServices.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.serviceName || s.name} ({s.serviceType || "Standard"})
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Commission Percentage with Slider & Number Stepper */}
              <FormControl isRequired>
                <Flex justify="space-between" align="center" mb={1.5}>
                  <FormLabel fontSize="xs" fontWeight="700" color="gray.700" mb={0}>
                    {isSchedulingMode ? "Scheduled Rate (%)" : "Commission Rate (%)"}
                  </FormLabel>
                  <Badge colorScheme={isSchedulingMode ? "purple" : "teal"} fontSize="sm" px={2} py={0.5} borderRadius="md" fontWeight="800">
                    {rulePercentage}%
                  </Badge>
                </Flex>
                <HStack spacing={4}>
                  <Slider
                    flex="1"
                    min={0}
                    max={100}
                    step={0.5}
                    value={Number(rulePercentage) || 0}
                    onChange={(v) => setRulePercentage(v)}
                    colorScheme={isSchedulingMode ? "purple" : "teal"}
                  >
                    <SliderTrack bg="gray.100" h="6px" borderRadius="full">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={5} shadow="md" />
                  </Slider>
                  <NumberInput
                    size="md"
                    maxW="100px"
                    min={0}
                    max={100}
                    step={0.5}
                    value={rulePercentage}
                    onChange={(v) => setRulePercentage(v)}
                  >
                    <NumberInputField borderRadius="8px" fontWeight="700" textAlign="center" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </FormControl>

              {/* Effective From Date */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="gray.700">
                  {isSchedulingMode ? "Scheduled Activation Date" : "Effective From Date"}
                </FormLabel>
                <Input
                  type="date"
                  size="md"
                  borderRadius="8px"
                  value={ruleEffectiveFrom}
                  onChange={(e) => setRuleEffectiveFrom(e.target.value)}
                  fontWeight="600"
                />
                <Text fontSize="11px" color="gray.500" mt={1}>
                  {isSchedulingMode
                    ? "The rate will automatically activate when this date arrives."
                    : "Historical completed/pending bookings retain their original rate."}
                </Text>
              </FormControl>

              {/* Side-by-Side Visual Impact Preview */}
              {targetCommissionItem && (
                <Box p={3.5} bg="gray.50" borderRadius="12px" border="1px solid" borderColor="gray.200">
                  <Text fontSize="11px" fontWeight="700" color="gray.600" textTransform="uppercase" mb={2}>
                    Rate Transition Summary
                  </Text>
                  <Grid templateColumns="1fr auto 1fr" gap={3} alignItems="center">
                    <Box p={3} bg="white" borderRadius="8px" textAlign="center" border="1px solid" borderColor="gray.200">
                      <Text fontSize="10px" fontWeight="600" color="gray.500">Current Catalog Rate</Text>
                      <Text fontSize="lg" fontWeight="800" color="gray.700" mt={0.5}>
                        {targetCommissionItem.commissionPercentage || 15}%
                      </Text>
                    </Box>
                    <Flex w="32px" h="32px" borderRadius="full" bg="gray.200" align="center" justify="center" mx="auto">
                      <Icon as={FaExchangeAlt} color="gray.600" boxSize={3.5} />
                    </Flex>
                    <Box
                      p={3}
                      bg={isSchedulingMode ? "purple.50" : "teal.50"}
                      borderRadius="8px"
                      textAlign="center"
                      border="1.5px solid"
                      borderColor={isSchedulingMode ? "purple.300" : "teal.300"}
                    >
                      <Text fontSize="10px" fontWeight="700" color={isSchedulingMode ? "purple.700" : "teal.700"}>
                        {isSchedulingMode ? "Scheduled Rate" : "New Active Rate"}
                      </Text>
                      <Text fontSize="lg" fontWeight="800" color={isSchedulingMode ? "purple.800" : BRAND} mt={0.5}>
                        {rulePercentage}%
                      </Text>
                    </Box>
                  </Grid>
                </Box>
              )}

              {/* Reason / Notes */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" color="gray.700">Audit Justification / Change Reason</FormLabel>
                <Textarea
                  placeholder="e.g. Annual HVAC pricing revision, festive promo margin adjustment..."
                  size="sm"
                  rows={2}
                  borderRadius="8px"
                  value={ruleReason}
                  onChange={(e) => setRuleReason(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3} px={6}>
            <Button variant="ghost" mr={3} size="sm" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              bg={isSchedulingMode ? "purple.600" : BRAND}
              _hover={{ bg: isSchedulingMode ? "purple.700" : BRAND_DARK }}
              color="white"
              size="sm"
              borderRadius="8px"
              isLoading={isSubmittingRule}
              onClick={handleSubmitRule}
            >
              {isSchedulingMode ? "Confirm & Schedule" : targetCommissionItem ? "Confirm Rate Update" : "Create Commission Rule"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 2: SERVICE COMMISSION AUDIT HISTORY                     */}
      {/* ============================================================= */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" zIndex={1400} />
        <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401} mx={4} overflow="hidden">
          <ModalHeader bg="white" color="gray.800" borderBottom="1px solid" borderColor="gray.100" pr="50px" py={4}>
            <HStack spacing={2.5} align="flex-start">
              <Flex w="36px" h="36px" borderRadius="10px" bg="teal.50" color={BRAND} align="center" justify="center" flexShrink={0} mt={0.5}>
                <Icon as={FaHistory} boxSize={5} />
              </Flex>
              <Box flex="1">
                <Text fontSize="md" fontWeight="800" noOfLines={1}>
                  Commission Rate History
                </Text>
                <HStack spacing={2} mt={0.5} wrap="wrap">
                  <Text fontSize="xs" fontWeight="600" color="gray.600" noOfLines={1}>
                    {historyService?.serviceId?.serviceName || historyService?.serviceName || "Service"}
                  </Text>
                  <Tag size="sm" colorScheme="purple">
                    {historyService?.serviceId?.serviceType || historyService?.serviceType || "Standard"}
                  </Tag>
                </HStack>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top="16px" right="16px" borderRadius="full" _hover={{ bg: "gray.100" }} />

          <ModalBody bg="white" py={4} px={6} maxH="65vh" overflowY="auto" css={globalScrollbarStyles}>
            {/* Current Active Configuration Snapshot */}
            {historyService && (
              <Box mb={4} p={3.5} bg="gray.50" borderRadius="12px" border="1px solid" borderColor="gray.200">
                <Text fontSize="11px" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
                  Current Active Configuration
                </Text>
                <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }} gap={2}>
                  <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                    <Text fontSize="10px" color="gray.500">Current Rate</Text>
                    <Text fontSize="md" fontWeight="800" color={BRAND}>
                      {historyService.commissionPercentage || 15}%
                    </Text>
                  </Box>
                  <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                    <Text fontSize="10px" color="gray.500">Effective Date</Text>
                    <Text fontSize="xs" fontWeight="700" color="gray.700">
                      {historyService.effectiveFrom ? new Date(historyService.effectiveFrom).toLocaleDateString() : "Immediate"}
                    </Text>
                  </Box>
                  <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                    <Text fontSize="10px" color="gray.500">Rule Status</Text>
                    <Tag size="sm" colorScheme={historyService.isActive !== false ? "green" : "gray"} mt={0.5}>
                      {historyService.isActive !== false ? "Active" : "Inactive"}
                    </Tag>
                  </Box>
                  <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                    <Text fontSize="10px" color="gray.500">Scheduled Change</Text>
                    <Text fontSize="xs" fontWeight="700" color={historyService.scheduledPercentage ? "purple.600" : "gray.400"}>
                      {historyService.scheduledPercentage ? `${historyService.scheduledPercentage}%` : "None"}
                    </Text>
                  </Box>
                </Grid>
              </Box>
            )}

            {/* Historical Revision Timeline */}
            <Text fontSize="11px" fontWeight="700" color="gray.600" textTransform="uppercase" mb={2}>
              Chronological Audit Trail
            </Text>

            {isLoadingHistory ? (
              <Flex justify="center" align="center" py={8}>
                <Spinner color={BRAND} />
              </Flex>
            ) : historyList.length === 0 ? (
              <VStack py={6} px={4} bg="gray.50" borderRadius="12px" border="1px dashed" borderColor="gray.300" spacing={2} textAlign="center">
                <Icon as={FaInfoCircle} color="teal.500" boxSize={6} />
                <Text fontSize="sm" fontWeight="700" color="gray.700">
                  Standard Default Catalog Rate
                </Text>
                <Text fontSize="xs" color="gray.500" maxW="420px">
                  This service is currently operating on the default catalog rate (15.0%). No manual override or rate revision has been logged yet.
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {historyList.map((h, i) => (
                  <Box key={i} p={3.5} bg="white" borderRadius="10px" border="1px solid" borderColor="gray.200" borderLeft="4px solid" borderLeftColor={BRAND} shadow="xs">
                    <Flex justify="space-between" align="center" wrap="wrap" gap={1}>
                      <HStack spacing={2}>
                        <Badge colorScheme="teal" fontSize="xs" px={2} py={0.5} borderRadius="md" fontWeight="800">
                          {h.previousPercentage || 0}% → {h.newPercentage || h.commissionPercentage}%
                        </Badge>
                        <Text fontSize="xs" fontWeight="700" color="gray.800">
                          by {h.changedBy?.name || h.performedBy || "Admin"}
                        </Text>
                      </HStack>
                      <Text fontSize="10px" color="gray.500" fontWeight="600">
                        Effective: {h.effectiveDate ? new Date(h.effectiveDate).toLocaleDateString() : "Immediate"}
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="gray.600" mt={1.5} bg="gray.50" p={2} borderRadius="6px">
                      {h.reason || "Direct administrative rate adjustment."}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3} px={6}>
            <Button size="sm" onClick={() => setIsHistoryModalOpen(false)} borderRadius="8px">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 3: BOOKING COMMISSION OVERRIDE MODAL                    */}
      {/* ============================================================= */}
      <Modal isOpen={isOverrideModalOpen} onClose={() => setIsOverrideModalOpen(false)} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" zIndex={1400} />
        <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401} mx={4} overflow="hidden">
          <ModalHeader bg="white" color="gray.800" borderBottom="1px solid" borderColor="gray.100" pr="50px" py={4}>
            <HStack spacing={2.5}>
              <Flex w="36px" h="36px" borderRadius="10px" bg="purple.50" color="purple.600" align="center" justify="center">
                <Icon as={FaCalculator} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800">Override Booking Commission</Text>
                <Text fontSize="xs" fontWeight="500" color="gray.500">Apply a negotiated manual commission rate exception</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top="16px" right="16px" borderRadius="full" _hover={{ bg: "gray.100" }} />

          <ModalBody bg="white" py={5} px={6}>
            {selectedBookingForOverride && (
              <VStack spacing={4} align="stretch">
                <Box p={3.5} bg="purple.50" borderRadius="12px" border="1px solid" borderColor="purple.200">
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="xs" fontWeight="800" color="purple.900">
                      Booking #{selectedBookingForOverride._id?.slice(-6) || "BKG101"}
                    </Text>
                    <Tag size="sm" colorScheme="purple">
                      {selectedBookingForOverride.serviceId?.serviceName || selectedBookingForOverride.serviceName || "Service"}
                    </Tag>
                  </Flex>
                  <Text fontSize="11px" color="gray.600">
                    Gross Amount: <b>₹{selectedBookingForOverride.totalPrice || selectedBookingForOverride.amount || 1000}</b> | Default Service Rate: <b>{selectedBookingForOverride.defaultCommissionPct || 15}%</b>
                  </Text>
                </Box>

                <FormControl isRequired>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <FormLabel fontSize="xs" fontWeight="700" color="gray.700" mb={0}>Override Commission Rate (%)</FormLabel>
                    <Badge colorScheme="purple" fontSize="sm" px={2} py={0.5} borderRadius="md" fontWeight="800">
                      {overridePercentage}%
                    </Badge>
                  </Flex>
                  <HStack spacing={4}>
                    <Slider
                      flex="1"
                      min={0}
                      max={100}
                      step={0.5}
                      value={Number(overridePercentage) || 0}
                      onChange={(v) => setOverridePercentage(v)}
                      colorScheme="purple"
                    >
                      <SliderTrack bg="gray.100" h="6px" borderRadius="full">
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={5} shadow="md" />
                    </Slider>
                    <NumberInput
                      size="md"
                      maxW="100px"
                      min={0}
                      max={100}
                      step={0.5}
                      value={overridePercentage}
                      onChange={(v) => setOverridePercentage(v)}
                    >
                      <NumberInputField borderRadius="8px" fontWeight="700" textAlign="center" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                </FormControl>

                {/* Financial Difference Breakdown */}
                {(() => {
                  const gross = Number(selectedBookingForOverride.totalPrice || selectedBookingForOverride.amount || 1000);
                  const defFee = gross * 0.15;
                  const newFee = gross * (Number(overridePercentage) / 100);
                  const diff = defFee - newFee;
                  const techNet = gross - newFee;

                  return (
                    <Box p={3.5} bg="gray.50" borderRadius="12px" fontSize="xs" border="1px solid" borderColor="gray.200">
                      <Flex justify="space-between" mb={1.5}>
                        <Text color="gray.600">Default Platform Cut (15%):</Text>
                        <Text fontWeight="700">₹{defFee.toFixed(2)}</Text>
                      </Flex>
                      <Flex justify="space-between" mb={1.5}>
                        <Text color="purple.700" fontWeight="600">Override Platform Cut ({overridePercentage}%):</Text>
                        <Text fontWeight="800" color="purple.700">₹{newFee.toFixed(2)}</Text>
                      </Flex>
                      <Divider my={2} />
                      <Flex justify="space-between" mb={1}>
                        <Text fontWeight="700" color="green.700">Technician Net Payout:</Text>
                        <Text fontWeight="800" color="green.700" fontSize="sm">₹{techNet.toFixed(2)}</Text>
                      </Flex>
                      <Text fontSize="11px" fontWeight="600" color={diff >= 0 ? "orange.600" : "green.600"} mt={1}>
                        Platform Margin Variance: {diff >= 0 ? `-₹${diff.toFixed(2)}` : `+₹${Math.abs(diff).toFixed(2)}`}
                      </Text>
                    </Box>
                  );
                })()}

                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700" color="gray.700">Mandatory Override Justification</FormLabel>
                  <Textarea
                    placeholder="e.g. Corporate partnership volume concession, customer service dispute resolution..."
                    size="sm"
                    rows={2}
                    borderRadius="8px"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3} px={6}>
            <Button variant="ghost" mr={3} size="sm" onClick={() => setIsOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button
              bg="purple.600"
              _hover={{ bg: "purple.700" }}
              color="white"
              size="sm"
              borderRadius="8px"
              isLoading={isSubmittingOverride}
              onClick={handleSubmitOverride}
            >
              Confirm Override
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 4: AUDIT LOG DETAILS MODAL                              */}
      {/* ============================================================= */}
      <Modal isOpen={isLogDetailOpen} onClose={() => setIsLogDetailOpen(false)} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" zIndex={1400} />
        <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401} mx={4} overflow="hidden">
          <ModalHeader bg="white" color="gray.800" borderBottom="1px solid" borderColor="gray.100" pr="50px" py={4}>
            <HStack spacing={2.5}>
              <Flex w="36px" h="36px" borderRadius="10px" bg="teal.50" color={BRAND} align="center" justify="center">
                <Icon as={MdVisibility} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800">Financial Audit Inspection</Text>
                <Text fontSize="xs" fontWeight="500" color="gray.500">Deep immutable audit record details and payload</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top="16px" right="16px" borderRadius="full" _hover={{ bg: "gray.100" }} />

          <ModalBody bg="white" py={5} px={6} maxH="65vh" overflowY="auto" css={globalScrollbarStyles}>
            {selectedLog && (
              <VStack spacing={4} align="stretch" fontSize="xs">
                <SimpleGrid columns={{ base: 2, sm: 4 }} gap={2.5}>
                  <Box p={3} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                    <Text color="gray.500" fontSize="10px" fontWeight="600">ACTION</Text>
                    <Badge colorScheme="teal" mt={1}>{selectedLog.action || "UPDATE"}</Badge>
                  </Box>
                  <Box p={3} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                    <Text color="gray.500" fontSize="10px" fontWeight="600">TARGET TYPE</Text>
                    <Text fontWeight="700" color="gray.800" mt={1}>{selectedLog.targetType || "Service"}</Text>
                  </Box>
                  <Box p={3} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                    <Text color="gray.500" fontSize="10px" fontWeight="600">ACTOR</Text>
                    <Text fontWeight="700" color="gray.800" mt={1}>{selectedLog.actor?.name || selectedLog.performedBy || "Administrator"}</Text>
                  </Box>
                  <Box p={3} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                    <Text color="gray.500" fontSize="10px" fontWeight="600">TIMESTAMP</Text>
                    <Text fontWeight="700" color="gray.800" mt={1}>
                      {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : "N/A"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box p={4} bg="gray.50" borderRadius="12px" border="1px solid" borderColor="gray.200">
                  <Text fontWeight="700" color="gray.700" mb={2} textTransform="uppercase" fontSize="11px">
                    Raw Payload / State Differences
                  </Text>
                  <Box as="pre" fontSize="11px" fontFamily="mono" whiteSpace="pre-wrap" bg="white" p={3} borderRadius="8px" border="1px solid" borderColor="gray.200" color="gray.800">
                    {typeof selectedLog.details === "object"
                      ? JSON.stringify(selectedLog.details, null, 2)
                      : selectedLog.details || selectedLog.reason || "No details available."}
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3} px={6}>
            <Button size="sm" onClick={() => setIsLogDetailOpen(false)} borderRadius="8px">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
