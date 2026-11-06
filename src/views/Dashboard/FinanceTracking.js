import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Heading,
  Text,
  IconButton,
  Spinner,
  Badge,
  Center,
  VStack,
  HStack,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Divider,
} from "@chakra-ui/react";
import { useAppToast } from "components/feedback";
import ErrorState from "components/feedback/ErrorState";
import AppModal from "components/common/AppModal";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaDownload,
  FaWallet,
  FaMoneyBillWave,
  FaClock,
  FaCopy,
  FaUserTie,
} from "react-icons/fa";
import {
  MdAttachMoney,
  MdPayments,
  MdHistory,
  MdPerson,
  MdRefresh,
  MdVisibility,
  MdAccountBalanceWallet,
  MdTrendingUp,
} from "react-icons/md";

import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchTechnicians as fetchTechniciansShared,
  selectTechnicians,
} from "store/slices/techniciansSlice";
import {
  fetchFinanceSummary,
  fetchFinanceBreakdown,
  fetchPaymentsLedger,
  fetchTechnicianFinance,
  selectFinanceSummary,
  selectFinanceBreakdown,
  selectPaymentsLedger,
  selectTechnicianFinance,
} from "store/slices/financeSlice";

const BRAND = "#008080";

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export default function FinanceTracking() {
  const isDark = false;
  const toast = useAppToast();
  const dispatch = useAppDispatch();

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loadError, setLoadError] = useState(null);

  // Summary loading state
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Breakdown tab state
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [breakdownPage, setBreakdownPage] = useState(1);
  const [breakdownSearch, setBreakdownSearch] = useState("");
  const [breakdownFilters, setBreakdownFilters] = useState({
    status: "",
    paymentStatus: "",
    technicianId: "",
    from: "",
    to: "",
  });

  // Payments ledger tab state
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsSearch, setPaymentsSearch] = useState("");
  const [paymentsFilters, setPaymentsFilters] = useState({
    status: "",
    from: "",
    to: "",
  });

  // Technicians tab state
  const [techSearch, setTechSearch] = useState("");
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(null);
  const [isTechDetailOpen, setIsTechDetailOpen] = useState(false);
  const [techLoadingId, setTechLoadingId] = useState(null);

  const itemsPerPage = 10;

  // Redux Selectors
  const summary = useAppSelector(selectFinanceSummary());
  const breakdownParams = useMemo(
    () => ({ ...breakdownFilters, page: breakdownPage, limit: itemsPerPage }),
    [breakdownFilters, breakdownPage]
  );
  const breakdownData = useAppSelector(selectFinanceBreakdown(breakdownParams));
  const breakdownList = breakdownData?.list;
  const rawBreakdown = useMemo(() => breakdownList || [], [breakdownList]);
  const breakdownTotal = breakdownData?.meta?.total || rawBreakdown.length;
  const breakdownPages =
    breakdownData?.meta?.totalPages ||
    Math.ceil((breakdownData?.meta?.total || rawBreakdown.length) / itemsPerPage) ||
    1;

  const paymentsParams = useMemo(
    () => ({ ...paymentsFilters, page: paymentsPage, limit: itemsPerPage }),
    [paymentsFilters, paymentsPage]
  );
  const paymentsData = useAppSelector(selectPaymentsLedger(paymentsParams));
  const paymentsList = paymentsData?.list;
  const rawPayments = useMemo(() => paymentsList || [], [paymentsList]);
  const paymentsTotal = paymentsData?.meta?.total || rawPayments.length;
  const paymentsPages =
    paymentsData?.meta?.totalPages ||
    Math.ceil((paymentsData?.meta?.total || rawPayments.length) / itemsPerPage) ||
    1;

  const rawTechnicians = useAppSelector(selectTechnicians);
  const technicians = useMemo(() => rawTechnicians || [], [rawTechnicians]);
  const selectedTechData = useAppSelector(
    selectTechnicianFinance(selectedTechId || "")
  );
  const selectedTechDetail = selectedTech
    ? { technician: selectedTech, data: selectedTechData }
    : null;

  // Filter breakdown client-side for instant search if typed
  const breakdown = useMemo(() => {
    if (!breakdownSearch.trim()) return rawBreakdown;
    const q = breakdownSearch.toLowerCase().trim();
    return rawBreakdown.filter((item) => {
      const sName = String(item.service || item.serviceName || "").toLowerCase();
      const tName = String(item.technician || item.technicianName || "").toLowerCase();
      const bId = String(item.bookingId || item._id || "").toLowerCase();
      return sName.includes(q) || tName.includes(q) || bId.includes(q);
    });
  }, [rawBreakdown, breakdownSearch]);

  // Filter payments client-side for search if typed
  const payments = useMemo(() => {
    if (!paymentsSearch.trim()) return rawPayments;
    const q = paymentsSearch.toLowerCase().trim();
    return rawPayments.filter((p) => {
      const oId = String(p.providerOrderId || "").toLowerCase();
      const pId = String(p.paymentId || p._id || "").toLowerCase();
      const iType = String(p.itemType || "").toLowerCase();
      return oId.includes(q) || pId.includes(q) || iType.includes(q);
    });
  }, [rawPayments, paymentsSearch]);

  // Filter technicians by search
  const filteredTechnicians = useMemo(() => {
    if (!techSearch.trim()) return technicians;
    const q = techSearch.toLowerCase().trim();
    return technicians.filter((tech) => {
      const name = String(
        tech.name ||
        tech.userId?.fname ||
        tech.user?.fname ||
        tech.mobileNumber ||
        ""
      ).toLowerCase();
      const phone = String(tech.userId?.mobileNumber || tech.mobileNumber || "");
      return name.includes(q) || phone.includes(q);
    });
  }, [technicians, techSearch]);

  // Auth gate check
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const role = storedUser?.role?.toLowerCase();
    if (!storedUser || (role !== "owner" && role !== "admin" && role !== "super admin")) {
      toast({
        title: "Access Denied",
        description: "Only admin, super admin, or owner can access finance tracking.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentUser(storedUser);
  }, [toast]);

  // Data fetching functions
  const fetchSummary = useCallback(async () => {
    try {
      setLoadError(null);
      setIsLoadingSummary(true);
      await dispatch(fetchFinanceSummary()).unwrap();
    } catch (err) {
      console.error("Error fetching finance summary:", err);
      setLoadError(err);
      toast.error(err, { title: "Fetch Error", description: "Failed to load finance summary.", duration: 3000, isClosable: true });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [dispatch, toast]);

  const fetchBreakdown = useCallback(async () => {
    try {
      setLoadError(null);
      setIsLoadingBreakdown(true);
      const params = {
        ...breakdownFilters,
        page: breakdownPage,
        limit: itemsPerPage,
      };
      await dispatch(fetchFinanceBreakdown(params)).unwrap();
    } catch (err) {
      console.error("Error fetching finance breakdown:", err);
      setLoadError(err);
      toast.error(err, { title: "Fetch Error", description: "Failed to load finance breakdown.", duration: 3000, isClosable: true });
    } finally {
      setIsLoadingBreakdown(false);
    }
  }, [breakdownFilters, breakdownPage, dispatch, toast]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoadError(null);
      setIsLoadingPayments(true);
      const params = {
        ...paymentsFilters,
        page: paymentsPage,
        limit: itemsPerPage,
      };
      await dispatch(fetchPaymentsLedger(params)).unwrap();
    } catch (err) {
      console.error("Error fetching payments ledger:", err);
      setLoadError(err);
      toast.error(err, { title: "Fetch Error", description: "Failed to load payments ledger.", duration: 3000, isClosable: true });
    } finally {
      setIsLoadingPayments(false);
    }
  }, [paymentsFilters, paymentsPage, dispatch, toast]);

  const fetchTechnicians = useCallback(async () => {
    try {
      await dispatch(fetchTechniciansShared()).unwrap();
    } catch (err) {
      console.error("Error fetching technicians:", err);
    }
  }, [dispatch]);

  // Trigger loads on mount & active tab changes
  useEffect(() => {
    if (currentUser) {
      fetchSummary();
      fetchTechnicians();
    }
  }, [currentUser, fetchSummary, fetchTechnicians]);

  useEffect(() => {
    if (currentUser && activeTab === 0) {
      fetchBreakdown();
    }
  }, [currentUser, activeTab, fetchBreakdown]);

  useEffect(() => {
    if (currentUser && activeTab === 1) {
      fetchPayments();
    }
  }, [currentUser, activeTab, fetchPayments]);

  useEffect(() => {
    setBreakdownPage(1);
  }, [
    breakdownFilters.status,
    breakdownFilters.paymentStatus,
    breakdownFilters.technicianId,
    breakdownFilters.from,
    breakdownFilters.to,
  ]);

  useEffect(() => {
    setPaymentsPage(1);
  }, [paymentsFilters.status, paymentsFilters.from, paymentsFilters.to]);

  const handleViewTechnicianDetail = async (technician) => {
    const techId = technician._id || technician.userId || technician.id;
    if (!techId) return;
    try {
      setTechLoadingId(techId);
      await dispatch(fetchTechnicianFinance(techId)).unwrap();
      setSelectedTech(technician);
      setSelectedTechId(String(techId));
      setIsTechDetailOpen(true);
    } catch (err) {
      toast.error(err, { title: "Fetch Error", description: "Failed to load technician finance detail.", duration: 3000, isClosable: true });
    } finally {
      setTechLoadingId(null);
    }
  };

  const getTechName = (tech) => {
    if (!tech) return "Technician";
    if (tech.name) return tech.name;
    const user = tech.userId || tech.user;
    if (user) {
      const fname = user.fname || user.firstName || "";
      const lname = user.lname || user.lastName || "";
      const combined = `${fname} ${lname}`.trim();
      return combined || user.name || user.mobileNumber || "Technician";
    }
    return tech.mobileNumber || "Technician";
  };

  const copyToClipboard = (text, label = "Item") => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text));
    toast({
      title: `${label} copied`,
      status: "info",
      duration: 1800,
      isClosable: true,
    });
  };

  // CSV Export for the active tab
  const handleExportCsv = () => {
    try {
      let csvContent = "";
      let filename = `finance_report_${new Date().toISOString().slice(0, 10)}.csv`;

      if (activeTab === 0) {
        filename = `finance_breakdown_${new Date().toISOString().slice(0, 10)}.csv`;
        const headers = ["Booking ID", "Service", "Technician", "Service Amount", "GST", "Tip", "Commission", "Tech Payable", "Total", "Payment Status", "Settlement", "Date"];
        const rows = breakdown.map((item) => [
          item.bookingId || item._id || "",
          `"${(item.service || item.serviceName || "").replace(/"/g, '""')}"`,
          `"${(item.technician || "").replace(/"/g, '""')}"`,
          item.serviceAmount || 0,
          item.gstAmount || 0,
          item.tipAmount || 0,
          item.commissionAmount || 0,
          item.technicianAmount || 0,
          item.totalAmount || (item.serviceAmount + item.gstAmount + item.tipAmount) || 0,
          item.paymentStatus || "",
          item.settlementStatus || "",
          item.createdAt ? new Date(item.createdAt).toISOString() : "",
        ]);
        csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      } else if (activeTab === 1) {
        filename = `payments_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
        const headers = ["Order ID", "Payment ID", "Item Type", "Total Amount", "Commission", "Status", "Date"];
        const rows = payments.map((p) => [
          p.providerOrderId || "",
          p.paymentId || p._id || "",
          `"${(p.itemType || "").replace(/"/g, '""')}"`,
          p.totalAmount || p.amount || 0,
          p.commissionAmount || 0,
          p.status || "",
          p.createdAt ? new Date(p.createdAt).toISOString() : "",
        ]);
        csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      } else {
        filename = `technicians_financial_directory_${new Date().toISOString().slice(0, 10)}.csv`;
        const headers = ["Technician Name", "Contact", "Status", "Wallet Balance"];
        const rows = technicians.map((tech) => [
          `"${getTechName(tech).replace(/"/g, '""')}"`,
          tech.userId?.mobileNumber || tech.mobileNumber || "",
          tech.workStatus || "",
          tech.walletBalance || 0,
        ]);
        csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: `Downloaded ${filename} successfully.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err, { title: "Export Failed", description: "Could not export report." });
    }
  };

  const handleRefreshAll = () => {
    fetchSummary();
    if (activeTab === 0) fetchBreakdown();
    if (activeTab === 1) fetchPayments();
    if (activeTab === 2) fetchTechnicians();
    toast({
      title: "Financials refreshed",
      status: "info",
      duration: 1500,
      isClosable: true,
    });
  };

  if (!currentUser) return null;

  // Key KPI values
  const totalRevenue = summary?.services?.paid?.totalAmount || summary?.summary?.totalCollected || 0;
  const paidOrdersCount = summary?.services?.paid?.count || 0;
  const totalCommission = summary?.summary?.totalCommission || 0;
  const totalPaidOut = summary?.summary?.totalPaidOutToTechnician || 0;
  const totalPayable = summary?.summary?.totalPayableToTechnician || 0;
  const pendingWithdrawalsAmount = summary?.withdrawals?.pending?.amount || 0;
  const pendingWithdrawalsCount = summary?.withdrawals?.pending?.count || 0;
  const unpaidServicesAmount = summary?.services?.unpaid?.totalAmount || 0;
  const unpaidServicesCount = summary?.services?.unpaid?.count || 0;

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
            <HStack spacing={2} mb={1}>
              <Tag size="sm" colorScheme="teal" borderRadius="full" fontWeight="bold">
                FINANCIAL INTELLIGENCE CONSOLE
              </Tag>
              <Badge
                colorScheme="green"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Box as="span" w="6px" h="6px" borderRadius="full" bg="green.500" />
                Live Balances
              </Badge>
            </HStack>
            <Heading as="h1" size="lg" fontWeight="900" letterSpacing="-0.5px" color={isDark ? "white" : "gray.850"}>
              Finance & Revenue Tracking
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Platform revenue collection, commission margins, customer payment ledger, and partner payout liabilities.
            </Text>
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            <Button
              size="sm"
              variant="outline"
              borderRadius="10px"
              fontWeight="700"
              borderColor={isDark ? "gray.700" : "gray.300"}
              leftIcon={<FaDownload size={13} />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              bg={BRAND}
              color="white"
              borderRadius="10px"
              fontWeight="700"
              _hover={{ bg: "#006666" }}
              _active={{ bg: "#004d4d" }}
              leftIcon={<MdRefresh size={16} />}
              isLoading={isLoadingSummary || isLoadingBreakdown || isLoadingPayments}
              onClick={handleRefreshAll}
            >
              Refresh Data
            </Button>
          </HStack>
        </Flex>

        {loadError && (
          <ErrorState
            compact
            error={loadError}
            title="Could not load finance data"
            onRetry={handleRefreshAll}
          />
        )}

        {/* ================= 2. EXECUTIVE HERO KPI CARDS ================= */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          {/* Card 1: Gross Inflows */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="green.400" />
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Gross Collected Revenue
              </Text>
              <Box p={2.5} bg="green.50" color="green.600" borderRadius="10px">
                <Icon as={FaMoneyBillWave} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {formatCurrency(totalRevenue)}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="green" fontSize="2xs" borderRadius="full" px={2}>
                {paidOrdersCount} Paid Orders
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Base: {formatCurrency(summary?.summary?.totalServiceAmount)}
              </Text>
            </HStack>
          </Box>

          {/* Card 2: Platform Net Commission */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="purple.400" />
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Platform Commission
              </Text>
              <Box p={2.5} bg="purple.50" color="purple.600" borderRadius="10px">
                <Icon as={MdTrendingUp} boxSize={5} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {formatCurrency(totalCommission)}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="purple" fontSize="2xs" borderRadius="full" px={2}>
                Platform Take-Rate
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Net retained margin
              </Text>
            </HStack>
          </Box>

          {/* Card 3: Technician Disbursed & Payable */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="teal.400" />
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Technician Disbursed
              </Text>
              <Box p={2.5} bg="teal.50" color="teal.600" borderRadius="10px">
                <Icon as={FaWallet} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {formatCurrency(totalPaidOut)}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="teal" fontSize="2xs" borderRadius="full" px={2}>
                Transferred
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Payable: {formatCurrency(totalPayable)}
              </Text>
            </HStack>
          </Box>

          {/* Card 4: Escrow & Pending Withdrawals */}
          <Box
            p={5}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="orange.400" />
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Pending Liabilities
              </Text>
              <Box p={2.5} bg="orange.50" color="orange.600" borderRadius="10px">
                <Icon as={FaClock} boxSize={4} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color="orange.500">
              {formatCurrency(pendingWithdrawalsAmount)}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="orange" fontSize="2xs" borderRadius="full" px={2}>
                {pendingWithdrawalsCount} Requests Pending
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Unpaid: {formatCurrency(unpaidServicesAmount)}
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* ================= 3. FINANCIAL STREAMS & WITHDRAWAL LIFECYCLE SUMMARY ================= */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {/* Revenue Breakdown Strip */}
          <Box
            p={4}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <HStack justify="space-between" mb={3}>
              <HStack spacing={2}>
                <Icon as={MdAttachMoney} color={BRAND} boxSize={5} />
                <Text fontWeight="800" fontSize="sm" color={isDark ? "white" : "gray.800"}>
                  Revenue Breakdown & Tax Accounting
                </Text>
              </HStack>
              <Badge colorScheme="gray" fontSize="3xs" textTransform="uppercase">
                Platform P&L
              </Badge>
            </HStack>

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3} pt={1}>
              <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  Base Service Vol.
                </Text>
                <Text fontSize="sm" fontWeight="800" color={isDark ? "white" : "gray.800"} mt={0.5}>
                  {formatCurrency(summary?.summary?.totalServiceAmount)}
                </Text>
                <Text fontSize="3xs" color="gray.400" mt={0.5}>Gross order value</Text>
              </Box>

              <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  GST / Taxes
                </Text>
                <Text fontSize="sm" fontWeight="800" color="orange.600" mt={0.5}>
                  {formatCurrency(summary?.summary?.totalGst)}
                </Text>
                <Text fontSize="3xs" color="gray.400" mt={0.5}>Tax statutory</Text>
              </Box>

              <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  Platform Margin
                </Text>
                <Text fontSize="sm" fontWeight="800" color="purple.600" mt={0.5}>
                  {formatCurrency(summary?.summary?.totalCommission)}
                </Text>
                <Text fontSize="3xs" color="gray.400" mt={0.5}>Commission cut</Text>
              </Box>

              <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  Unpaid Invoices
                </Text>
                <Text fontSize="sm" fontWeight="800" color="yellow.600" mt={0.5}>
                  {formatCurrency(unpaidServicesAmount)}
                </Text>
                <Text fontSize="3xs" color="gray.400" mt={0.5}>{unpaidServicesCount} awaiting pay</Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Technician Withdrawals Lifecycle Strip */}
          <Box
            p={4}
            bg={isDark ? "gray.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <HStack justify="space-between" mb={3}>
              <HStack spacing={2}>
                <Icon as={MdAccountBalanceWallet} color="teal.500" boxSize={5} />
                <Text fontWeight="800" fontSize="sm" color={isDark ? "white" : "gray.800"}>
                  Partner Withdrawal Desk Lifecycle
                </Text>
              </HStack>
              <Badge colorScheme="teal" fontSize="3xs" textTransform="uppercase">
                Settlements
              </Badge>
            </HStack>

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3} pt={1}>
              <Box p={3} bg={isDark ? "gray.800" : "yellow.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "yellow.200"}>
                <HStack justify="space-between">
                  <Text fontSize="2xs" color="yellow.700" fontWeight="700" textTransform="uppercase">
                    Pending
                  </Text>
                  <Badge colorScheme="yellow" fontSize="3xs" borderRadius="full">
                    {summary?.withdrawals?.pending?.count || 0}
                  </Badge>
                </HStack>
                <Text fontSize="sm" fontWeight="800" color="yellow.800" mt={0.5}>
                  {formatCurrency(summary?.withdrawals?.pending?.amount)}
                </Text>
                <Text fontSize="3xs" color="yellow.600" mt={0.5}>Awaiting review</Text>
              </Box>

              <Box p={3} bg={isDark ? "gray.800" : "blue.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "blue.200"}>
                <HStack justify="space-between">
                  <Text fontSize="2xs" color="blue.700" fontWeight="700" textTransform="uppercase">
                    Approved
                  </Text>
                  <Badge colorScheme="blue" fontSize="3xs" borderRadius="full">
                    {summary?.withdrawals?.approved?.count || 0}
                  </Badge>
                </HStack>
                <Text fontSize="sm" fontWeight="800" color="blue.800" mt={0.5}>
                  {formatCurrency(summary?.withdrawals?.approved?.amount)}
                </Text>
                <Text fontSize="3xs" color="blue.600" mt={0.5}>Pending transfer</Text>
              </Box>

              <Box p={3} bg={isDark ? "gray.800" : "green.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "green.200"}>
                <HStack justify="space-between">
                  <Text fontSize="2xs" color="green.700" fontWeight="700" textTransform="uppercase">
                    Paid Out
                  </Text>
                  <Badge colorScheme="green" fontSize="3xs" borderRadius="full">
                    {summary?.withdrawals?.paid?.count || 0}
                  </Badge>
                </HStack>
                <Text fontSize="sm" fontWeight="800" color="green.800" mt={0.5}>
                  {formatCurrency(summary?.withdrawals?.paid?.amount)}
                </Text>
                <Text fontSize="3xs" color="green.600" mt={0.5}>External UTR logged</Text>
              </Box>

              <Box p={3} bg={isDark ? "gray.800" : "red.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "red.200"}>
                <HStack justify="space-between">
                  <Text fontSize="2xs" color="red.700" fontWeight="700" textTransform="uppercase">
                    Rejected
                  </Text>
                  <Badge colorScheme="red" fontSize="3xs" borderRadius="full">
                    {summary?.withdrawals?.rejected?.count || 0}
                  </Badge>
                </HStack>
                <Text fontSize="sm" fontWeight="800" color="red.800" mt={0.5}>
                  {formatCurrency(summary?.withdrawals?.rejected?.amount)}
                </Text>
                <Text fontSize="3xs" color="red.600" mt={0.5}>Reserve refunded</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </SimpleGrid>

        {/* ================= 4. MAIN WORKSPACE TABS ================= */}
        <Box
          bg={isDark ? "gray.850" : "white"}
          borderRadius="20px"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
          overflow="hidden"
        >
          <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled">
            {/* Tab navigation headers */}
            <Flex
              borderBottom="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              px={6}
              pt={4}
              bg={isDark ? "gray.900" : "gray.50"}
              overflowX="auto"
              gap={3}
            >
              <TabList gap={2}>
                <Tab
                  px={4}
                  py={3}
                  borderRadius="10px 10px 0 0"
                  fontWeight="700"
                  fontSize="sm"
                  color={activeTab === 0 ? BRAND : "gray.500"}
                  bg={activeTab === 0 ? (isDark ? "gray.850" : "white") : "transparent"}
                  borderTop={activeTab === 0 ? "2px solid" : "none"}
                  borderTopColor={BRAND}
                  _hover={{ color: BRAND }}
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Icon as={MdHistory} boxSize={4} />
                    <Text>Service Bookings Breakdown</Text>
                    <Badge colorScheme={activeTab === 0 ? "teal" : "gray"} borderRadius="full" fontSize="2xs">
                      {breakdownTotal}
                    </Badge>
                  </HStack>
                </Tab>

                <Tab
                  px={4}
                  py={3}
                  borderRadius="10px 10px 0 0"
                  fontWeight="700"
                  fontSize="sm"
                  color={activeTab === 1 ? BRAND : "gray.500"}
                  bg={activeTab === 1 ? (isDark ? "gray.850" : "white") : "transparent"}
                  borderTop={activeTab === 1 ? "2px solid" : "none"}
                  borderTopColor={BRAND}
                  _hover={{ color: BRAND }}
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Icon as={MdPayments} boxSize={4} />
                    <Text>Payments Ledger</Text>
                    <Badge colorScheme={activeTab === 1 ? "teal" : "gray"} borderRadius="full" fontSize="2xs">
                      {paymentsTotal}
                    </Badge>
                  </HStack>
                </Tab>

                <Tab
                  px={4}
                  py={3}
                  borderRadius="10px 10px 0 0"
                  fontWeight="700"
                  fontSize="sm"
                  color={activeTab === 2 ? BRAND : "gray.500"}
                  bg={activeTab === 2 ? (isDark ? "gray.850" : "white") : "transparent"}
                  borderTop={activeTab === 2 ? "2px solid" : "none"}
                  borderTopColor={BRAND}
                  _hover={{ color: BRAND }}
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Icon as={MdPerson} boxSize={4} />
                    <Text>Technician Profiles</Text>
                    <Badge colorScheme={activeTab === 2 ? "teal" : "gray"} borderRadius="full" fontSize="2xs">
                      {technicians.length}
                    </Badge>
                  </HStack>
                </Tab>
              </TabList>
            </Flex>

            <TabPanels>
              {/* ================= TAB 1: SERVICE BREAKDOWN ================= */}
              <TabPanel p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Filter Toolbar */}
                  <Flex
                    direction={{ base: "column", lg: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", lg: "center" }}
                    gap={3}
                    p={4}
                    bg={isDark ? "gray.800" : "gray.50"}
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                  >
                    <HStack spacing={3} flex="1" flexWrap="wrap">
                      {/* Search */}
                      <Box position="relative" minW={{ base: "100%", sm: "220px" }}>
                        <Input
                          size="sm"
                          borderRadius="8px"
                          placeholder="Search service, technician, ID..."
                          value={breakdownSearch}
                          onChange={(e) => setBreakdownSearch(e.target.value)}
                          bg={isDark ? "gray.900" : "white"}
                          borderColor={isDark ? "gray.700" : "gray.300"}
                          pl={8}
                        />
                        <Icon
                          as={FaSearch}
                          position="absolute"
                          left={3}
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          boxSize={3}
                        />
                      </Box>

                      {/* Booking status */}
                      <Select
                        size="sm"
                        borderRadius="8px"
                        maxW={{ base: "100%", sm: "160px" }}
                        value={breakdownFilters.status}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, status: e.target.value })}
                        bg={isDark ? "gray.900" : "white"}
                        borderColor={isDark ? "gray.700" : "gray.300"}
                      >
                        <option value="">Booking: All</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="on_the_way">On The Way</option>
                        <option value="reached">Reached</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </Select>

                      {/* Payment status */}
                      <Select
                        size="sm"
                        borderRadius="8px"
                        maxW={{ base: "100%", sm: "160px" }}
                        value={breakdownFilters.paymentStatus}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, paymentStatus: e.target.value })}
                        bg={isDark ? "gray.900" : "white"}
                        borderColor={isDark ? "gray.700" : "gray.300"}
                      >
                        <option value="">Payment: All</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </Select>

                      {/* Technician */}
                      <Select
                        size="sm"
                        borderRadius="8px"
                        maxW={{ base: "100%", sm: "180px" }}
                        value={breakdownFilters.technicianId}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, technicianId: e.target.value })}
                        bg={isDark ? "gray.900" : "white"}
                        borderColor={isDark ? "gray.700" : "gray.300"}
                      >
                        <option value="">All Technicians</option>
                        {technicians.map((tech) => (
                          <option key={tech._id || tech.userId} value={tech._id || tech.userId}>
                            {getTechName(tech)}
                          </option>
                        ))}
                      </Select>

                      {/* Date From & To */}
                      <HStack spacing={2} minW={{ base: "100%", sm: "auto" }}>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius="8px"
                          maxW="140px"
                          value={breakdownFilters.from}
                          onChange={(e) => setBreakdownFilters({ ...breakdownFilters, from: e.target.value })}
                          bg={isDark ? "gray.900" : "white"}
                          borderColor={isDark ? "gray.700" : "gray.300"}
                        />
                        <Text fontSize="xs" color="gray.400">to</Text>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius="8px"
                          maxW="140px"
                          value={breakdownFilters.to}
                          onChange={(e) => setBreakdownFilters({ ...breakdownFilters, to: e.target.value })}
                          bg={isDark ? "gray.900" : "white"}
                          borderColor={isDark ? "gray.700" : "gray.300"}
                        />
                      </HStack>
                    </HStack>

                    <Button
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      _hover={{ color: "red.500" }}
                      onClick={() => {
                        setBreakdownSearch("");
                        setBreakdownFilters({
                          status: "",
                          paymentStatus: "",
                          technicianId: "",
                          from: "",
                          to: "",
                        });
                      }}
                    >
                      Reset
                    </Button>
                  </Flex>

                  {/* Table view */}
                  {isLoadingBreakdown ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Spinner size="lg" color={BRAND} thickness="3px" />
                        <Text fontSize="sm" color="gray.500" fontWeight="600">
                          Loading booking financial breakdown...
                        </Text>
                      </VStack>
                    </Center>
                  ) : breakdown.length === 0 ? (
                    <Center py={16} bg={isDark ? "gray.800" : "gray.50"} borderRadius="16px">
                      <VStack spacing={2}>
                        <Icon as={MdHistory} boxSize={10} color="gray.300" />
                        <Text fontWeight="700" fontSize="md" color={isDark ? "white" : "gray.700"}>
                          No booking records found
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Try adjusting your filters or date range to see financial statements.
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Box overflowX="auto" borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Table variant="simple" size="sm">
                        <Thead bg={isDark ? "gray.900" : "gray.50"}>
                          <Tr>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" py={3.5}>#</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Booking & Service</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Technician</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>Service Fee</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>GST / Tip</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>Platform Cut</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>Tech Net</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>Total</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Pay Status</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Settlement</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {breakdown.map((item, idx) => {
                            const bId = item.bookingId || item._id;
                            const total = item.totalAmount || (item.serviceAmount + item.gstAmount + item.tipAmount) || 0;
                            const isPaid = item.paymentStatus === "paid";
                            const isSettled = item.settlementStatus === "settled";

                            return (
                              <Tr
                                key={bId || idx}
                                _hover={{ bg: isDark ? "gray.800" : "gray.50" }}
                                transition="background 0.15s ease"
                              >
                                <Td fontSize="xs" color="gray.500" fontWeight="600">
                                  {(breakdownPage - 1) * itemsPerPage + idx + 1}
                                </Td>

                                <Td maxW="220px">
                                  <VStack align="flex-start" spacing={0.5}>
                                    <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.800"} noOfLines={1}>
                                      {item.service || item.serviceName || "Service"}
                                    </Text>
                                    {bId && (
                                      <HStack spacing={1}>
                                        <Text fontSize="3xs" color="gray.400" fontFamily="mono">
                                          ID: {String(bId).slice(-8)}
                                        </Text>
                                        <IconButton
                                          aria-label="Copy booking ID"
                                          icon={<FaCopy size={9} />}
                                          size="xs"
                                          h="14px"
                                          w="14px"
                                          minW="14px"
                                          variant="ghost"
                                          color="gray.400"
                                          _hover={{ color: BRAND }}
                                          onClick={() => copyToClipboard(bId, "Booking ID")}
                                        />
                                      </HStack>
                                    )}
                                  </VStack>
                                </Td>

                                <Td maxW="160px">
                                  <HStack spacing={1.5}>
                                    <Icon as={FaUserTie} boxSize={3} color="gray.400" />
                                    <Text fontSize="xs" fontWeight="600" color={isDark ? "gray.200" : "gray.700"} noOfLines={1}>
                                      {item.technician || "Unassigned"}
                                    </Text>
                                  </HStack>
                                </Td>

                                <Td fontSize="xs" fontWeight="600" isNumeric>
                                  {formatCurrency(item.serviceAmount)}
                                </Td>

                                <Td fontSize="xs" isNumeric>
                                  <VStack align="flex-end" spacing={0}>
                                    <Text fontSize="2xs" color="orange.600">
                                      GST: {formatCurrency(item.gstAmount)}
                                    </Text>
                                    {item.tipAmount > 0 && (
                                      <Text fontSize="3xs" color="purple.600">
                                        Tip: {formatCurrency(item.tipAmount)}
                                      </Text>
                                    )}
                                  </VStack>
                                </Td>

                                <Td fontSize="xs" fontWeight="700" color="purple.600" isNumeric>
                                  {formatCurrency(item.commissionAmount)}
                                </Td>

                                <Td fontSize="xs" fontWeight="800" color="green.600" isNumeric>
                                  {formatCurrency(item.technicianAmount)}
                                </Td>

                                <Td fontSize="xs" fontWeight="900" color={isDark ? "white" : "gray.850"} isNumeric>
                                  {formatCurrency(total)}
                                </Td>

                                <Td>
                                  <Badge
                                    colorScheme={isPaid ? "green" : item.paymentStatus === "pending" ? "yellow" : "gray"}
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                    fontSize="3xs"
                                    textTransform="uppercase"
                                  >
                                    {item.paymentStatus || "unknown"}
                                  </Badge>
                                </Td>

                                <Td>
                                  <Badge
                                    colorScheme={isSettled ? "green" : "yellow"}
                                    variant="subtle"
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                    fontSize="3xs"
                                    textTransform="uppercase"
                                  >
                                    {item.settlementStatus || "pending"}
                                  </Badge>
                                </Td>

                                <Td fontSize="2xs" color="gray.500" whiteSpace="nowrap">
                                  {formatDate(item.createdAt)}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )}

                  {/* Pagination */}
                  {breakdown.length > 0 && (
                    <Flex justify="space-between" align="center" pt={2} flexWrap="wrap" gap={3}>
                      <Text fontSize="xs" color="gray.500">
                        Showing page <strong>{breakdownPage}</strong> of <strong>{breakdownPages}</strong> • Total {breakdownTotal} records
                      </Text>

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="8px"
                          isDisabled={breakdownPage === 1}
                          onClick={() => setBreakdownPage(Math.max(1, breakdownPage - 1))}
                          leftIcon={<FaChevronLeft size={10} />}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="8px"
                          isDisabled={breakdownPage === breakdownPages}
                          onClick={() => setBreakdownPage(Math.min(breakdownPages, breakdownPage + 1))}
                          rightIcon={<FaChevronRight size={10} />}
                        >
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  )}
                </VStack>
              </TabPanel>

              {/* ================= TAB 2: PAYMENTS LEDGER ================= */}
              <TabPanel p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Ledger Filters */}
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", sm: "center" }}
                    gap={3}
                    p={4}
                    bg={isDark ? "gray.800" : "gray.50"}
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                  >
                    <HStack spacing={3} flex="1" flexWrap="wrap">
                      <Box position="relative" minW={{ base: "100%", sm: "240px" }}>
                        <Input
                          size="sm"
                          borderRadius="8px"
                          placeholder="Search order ID or payment ID..."
                          value={paymentsSearch}
                          onChange={(e) => setPaymentsSearch(e.target.value)}
                          bg={isDark ? "gray.900" : "white"}
                          borderColor={isDark ? "gray.700" : "gray.300"}
                          pl={8}
                        />
                        <Icon
                          as={FaSearch}
                          position="absolute"
                          left={3}
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          boxSize={3}
                        />
                      </Box>

                      <Select
                        size="sm"
                        borderRadius="8px"
                        maxW="140px"
                        value={paymentsFilters.status}
                        onChange={(e) => setPaymentsFilters({ ...paymentsFilters, status: e.target.value })}
                        bg={isDark ? "gray.900" : "white"}
                        borderColor={isDark ? "gray.700" : "gray.300"}
                      >
                        <option value="">Status: All</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </Select>

                      <HStack spacing={2}>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius="8px"
                          maxW="140px"
                          value={paymentsFilters.from}
                          onChange={(e) => setPaymentsFilters({ ...paymentsFilters, from: e.target.value })}
                          bg={isDark ? "gray.900" : "white"}
                          borderColor={isDark ? "gray.700" : "gray.300"}
                        />
                        <Text fontSize="xs" color="gray.400">to</Text>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius="8px"
                          maxW="140px"
                          value={paymentsFilters.to}
                          onChange={(e) => setPaymentsFilters({ ...paymentsFilters, to: e.target.value })}
                          bg={isDark ? "gray.900" : "white"}
                          borderColor={isDark ? "gray.700" : "gray.300"}
                        />
                      </HStack>
                    </HStack>

                    <Button
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      _hover={{ color: "red.500" }}
                      onClick={() => {
                        setPaymentsSearch("");
                        setPaymentsFilters({ status: "", from: "", to: "" });
                      }}
                    >
                      Reset
                    </Button>
                  </Flex>

                  {/* Ledger Table */}
                  {isLoadingPayments ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Spinner size="lg" color={BRAND} thickness="3px" />
                        <Text fontSize="sm" color="gray.500" fontWeight="600">
                          Loading transaction ledger...
                        </Text>
                      </VStack>
                    </Center>
                  ) : payments.length === 0 ? (
                    <Center py={16} bg={isDark ? "gray.800" : "gray.50"} borderRadius="16px">
                      <VStack spacing={2}>
                        <Icon as={MdPayments} boxSize={10} color="gray.300" />
                        <Text fontWeight="700" fontSize="md" color={isDark ? "white" : "gray.700"}>
                          No transactions found
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Try adjusting status filter or date range.
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Box overflowX="auto" borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Table variant="simple" size="sm">
                        <Thead bg={isDark ? "gray.900" : "gray.50"}>
                          <Tr>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" py={3.5}>#</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Order & Gateway Reference</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Item / Service Type</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>Gross Amount</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase" isNumeric>Platform Cut</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Status</Th>
                            <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Timestamp</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {payments.map((p, idx) => {
                            const orderId = p.providerOrderId || p.paymentId || p._id;
                            const isSuccess = p.status === "success";
                            const isPending = p.status === "pending";

                            return (
                              <Tr
                                key={p.paymentId || p._id || idx}
                                _hover={{ bg: isDark ? "gray.800" : "gray.50" }}
                                transition="background 0.15s ease"
                              >
                                <Td fontSize="xs" color="gray.500" fontWeight="600">
                                  {(paymentsPage - 1) * itemsPerPage + idx + 1}
                                </Td>

                                <Td maxW="250px">
                                  <HStack spacing={1.5}>
                                    <Text fontSize="xs" fontWeight="700" fontFamily="mono" color={isDark ? "white" : "gray.850"} noOfLines={1}>
                                      {orderId || "N/A"}
                                    </Text>
                                    {orderId && (
                                      <IconButton
                                        aria-label="Copy reference"
                                        icon={<FaCopy size={9} />}
                                        size="xs"
                                        h="16px"
                                        w="16px"
                                        minW="16px"
                                        variant="ghost"
                                        color="gray.400"
                                        _hover={{ color: BRAND }}
                                        onClick={() => copyToClipboard(orderId, "Reference")}
                                      />
                                    )}
                                  </HStack>
                                </Td>

                                <Td fontSize="xs" color={isDark ? "gray.300" : "gray.700"} fontWeight="600">
                                  {p.itemType || "Service Booking"}
                                </Td>

                                <Td fontSize="xs" fontWeight="900" color={isDark ? "white" : "gray.850"} isNumeric>
                                  {formatCurrency(p.totalAmount || p.amount)}
                                </Td>

                                <Td fontSize="xs" fontWeight="700" color="purple.600" isNumeric>
                                  {formatCurrency(p.commissionAmount)}
                                </Td>

                                <Td>
                                  <Badge
                                    colorScheme={isSuccess ? "green" : isPending ? "yellow" : "red"}
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                    fontSize="3xs"
                                    textTransform="uppercase"
                                    display="inline-flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Box
                                      as="span"
                                      w="5px"
                                      h="5px"
                                      borderRadius="full"
                                      bg={isSuccess ? "green.500" : isPending ? "yellow.500" : "red.500"}
                                    />
                                    {p.status || "unknown"}
                                  </Badge>
                                </Td>

                                <Td fontSize="2xs" color="gray.500" whiteSpace="nowrap">
                                  {formatDate(p.createdAt)}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )}

                  {/* Pagination */}
                  {payments.length > 0 && (
                    <Flex justify="space-between" align="center" pt={2} flexWrap="wrap" gap={3}>
                      <Text fontSize="xs" color="gray.500">
                        Showing page <strong>{paymentsPage}</strong> of <strong>{paymentsPages}</strong> • Total {paymentsTotal} transactions
                      </Text>

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="8px"
                          isDisabled={paymentsPage === 1}
                          onClick={() => setPaymentsPage(Math.max(1, paymentsPage - 1))}
                          leftIcon={<FaChevronLeft size={10} />}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="8px"
                          isDisabled={paymentsPage === paymentsPages}
                          onClick={() => setPaymentsPage(Math.min(paymentsPages, paymentsPage + 1))}
                          rightIcon={<FaChevronRight size={10} />}
                        >
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  )}
                </VStack>
              </TabPanel>

              {/* ================= TAB 3: TECHNICIAN FINANCIAL PROFILES ================= */}
              <TabPanel p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Search Bar */}
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", sm: "center" }}
                    gap={3}
                    p={4}
                    bg={isDark ? "gray.800" : "gray.50"}
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                  >
                    <Box position="relative" minW={{ base: "100%", sm: "300px" }}>
                      <Input
                        size="sm"
                        borderRadius="8px"
                        placeholder="Search technician by name or mobile number..."
                        value={techSearch}
                        onChange={(e) => setTechSearch(e.target.value)}
                        bg={isDark ? "gray.900" : "white"}
                        borderColor={isDark ? "gray.700" : "gray.300"}
                        pl={8}
                      />
                      <Icon
                        as={FaSearch}
                        position="absolute"
                        left={3}
                        top="50%"
                        transform="translateY(-50%)"
                        color="gray.400"
                        boxSize={3}
                      />
                    </Box>

                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                      Showing {filteredTechnicians.length} technician profiles
                    </Text>
                  </Flex>

                  {/* Technicians List / Cards */}
                  {filteredTechnicians.length === 0 ? (
                    <Center py={16} bg={isDark ? "gray.800" : "gray.50"} borderRadius="16px">
                      <VStack spacing={2}>
                        <Icon as={MdPerson} boxSize={10} color="gray.300" />
                        <Text fontWeight="700" fontSize="md" color={isDark ? "white" : "gray.700"}>
                          No technicians found
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Try searching with a different name or mobile number.
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {filteredTechnicians.map((tech) => {
                        const techId = tech._id || tech.userId || tech.id;
                        const name = getTechName(tech);
                        const phone = tech.userId?.mobileNumber || tech.mobileNumber || "—";
                        const isApproved = tech.workStatus === "approved";
                        const isLoadingThis = techLoadingId === techId;

                        return (
                          <Box
                            key={techId}
                            p={5}
                            bg={isDark ? "gray.800" : "white"}
                            borderRadius="16px"
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            boxShadow="sm"
                            _hover={{ borderColor: BRAND, boxShadow: "md" }}
                            transition="all 0.2s"
                          >
                            <Flex justify="space-between" align="flex-start" mb={3}>
                              <HStack spacing={3}>
                                <Center
                                  w="42px"
                                  h="42px"
                                  borderRadius="12px"
                                  bg={BRAND}
                                  color="white"
                                  fontWeight="900"
                                  fontSize="sm"
                                >
                                  {name.slice(0, 2).toUpperCase()}
                                </Center>
                                <Box>
                                  <Text fontWeight="800" fontSize="sm" color={isDark ? "white" : "gray.850"} noOfLines={1}>
                                    {name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {phone}
                                  </Text>
                                </Box>
                              </HStack>

                              <Badge
                                colorScheme={isApproved ? "teal" : "gray"}
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="3xs"
                                textTransform="capitalize"
                              >
                                {tech.workStatus || "pending"}
                              </Badge>
                            </Flex>

                            <Divider my={3} borderColor={isDark ? "gray.700" : "gray.100"} />

                            <Flex justify="space-between" align="center">
                              <Box>
                                <Text fontSize="2xs" color="gray.400" fontWeight="700" textTransform="uppercase">
                                  Wallet Balance
                                </Text>
                                <Text fontSize="md" fontWeight="900" color="teal.500">
                                  {formatCurrency(tech.walletBalance || 0)}
                                </Text>
                              </Box>

                              <Button
                                size="sm"
                                variant="outline"
                                borderColor={BRAND}
                                color={BRAND}
                                _hover={{ bg: BRAND, color: "white" }}
                                borderRadius="8px"
                                fontWeight="700"
                                fontSize="xs"
                                leftIcon={<MdVisibility size={14} />}
                                isLoading={isLoadingThis}
                                onClick={() => handleViewTechnicianDetail(tech)}
                              >
                                Financial Audit
                              </Button>
                            </Flex>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>

      {/* ================= 5. TECHNICIAN FINANCIAL STATEMENT AUDIT MODAL ================= */}
      <AppModal
        isOpen={isTechDetailOpen}
        onClose={() => setIsTechDetailOpen(false)}
        title="Technician Financial Statement"
        subtitle="Detailed booking commissions, customer tips, wallet credit ledger, and payout history."
        icon={MdAccountBalanceWallet}
        iconColor={BRAND}
        size="3xl"
      >
        {selectedTechDetail && (
          <VStack spacing={5} align="stretch" py={1}>
            {/* Header Identity Card */}
            <Box
              p={4}
              bg={isDark ? "gray.800" : "gray.50"}
              borderRadius="14px"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                gap={3}
              >
                <HStack spacing={3}>
                  <Center w="48px" h="48px" borderRadius="14px" bg={BRAND} color="white" fontWeight="900" fontSize="md">
                    {(selectedTechDetail.data?.technician?.name || getTechName(selectedTechDetail.technician))
                      .slice(0, 2)
                      .toUpperCase()}
                  </Center>
                  <Box>
                    <HStack spacing={2}>
                      <Text fontSize="md" fontWeight="800" color={isDark ? "white" : "gray.850"}>
                        {selectedTechDetail.data?.technician?.name || getTechName(selectedTechDetail.technician)}
                      </Text>
                      <Badge
                        colorScheme={selectedTechDetail.data?.technician?.workStatus === "approved" ? "teal" : "gray"}
                        borderRadius="full"
                        px={2}
                        fontSize="3xs"
                        textTransform="capitalize"
                      >
                        {selectedTechDetail.data?.technician?.workStatus || "Active"}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      {selectedTechDetail.data?.technician?.mobile ||
                        selectedTechDetail.technician.userId?.mobileNumber ||
                        selectedTechDetail.technician.mobileNumber ||
                        "No contact registered"}
                    </Text>
                  </Box>
                </HStack>

                <Box
                  p={3}
                  bg={isDark ? "gray.900" : "teal.50"}
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "teal.200"}
                  textAlign={{ base: "left", sm: "right" }}
                  minW="150px"
                >
                  <Text fontSize="2xs" color="teal.600" fontWeight="700" textTransform="uppercase">
                    Current Wallet Balance
                  </Text>
                  <Text fontSize="xl" fontWeight="900" color="teal.600">
                    {formatCurrency(selectedTechDetail.data?.technician?.walletBalance)}
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Section 1: Service & Booking Economics */}
            <Box>
              <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" mb={3} letterSpacing="0.5px">
                Booking Revenue & Commissions
              </Text>
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Jobs Completed</Text>
                  <Text fontSize="md" fontWeight="800" color={isDark ? "white" : "gray.800"} mt={0.5}>
                    {selectedTechDetail.data?.bookings?.count || 0}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Settled Jobs</Text>
                  <Text fontSize="md" fontWeight="800" color="green.600" mt={0.5}>
                    {selectedTechDetail.data?.bookings?.settledCount || 0}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Service Value</Text>
                  <Text fontSize="md" fontWeight="800" color={isDark ? "white" : "gray.800"} mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.bookings?.serviceAmount)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">GST Collected</Text>
                  <Text fontSize="md" fontWeight="800" color="orange.600" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.bookings?.gst)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Tips Received</Text>
                  <Text fontSize="md" fontWeight="800" color="purple.600" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.bookings?.tip)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Commission Cut</Text>
                  <Text fontSize="md" fontWeight="800" color="red.500" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.bookings?.commission)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "green.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "green.200"}>
                  <Text fontSize="3xs" color="green.700" fontWeight="700" textTransform="uppercase">Net Earned</Text>
                  <Text fontSize="md" fontWeight="900" color="green.700" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.bookings?.earned)}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

            {/* Section 2: Wallet Ledger Credits & Deductions */}
            <Box>
              <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" mb={3} letterSpacing="0.5px">
                Wallet Ledger Inflows & Deductions
              </Text>
              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Job Inflow Credited</Text>
                  <Text fontSize="md" fontWeight="800" color="green.600" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.ledger?.jobEarnings)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Tips Credited</Text>
                  <Text fontSize="md" fontWeight="800" color="purple.600" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.ledger?.tips)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Bonuses Added</Text>
                  <Text fontSize="md" fontWeight="800" color="teal.600" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.ledger?.bonuses)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                  <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Withdrawals Paid</Text>
                  <Text fontSize="md" fontWeight="800" color={isDark ? "white" : "gray.800"} mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.ledger?.withdrawals)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "red.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "red.200"}>
                  <Text fontSize="3xs" color="red.700" fontWeight="700" textTransform="uppercase">Penalties Deducted</Text>
                  <Text fontSize="md" fontWeight="800" color="red.600" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.ledger?.penalties)}
                  </Text>
                </Box>

                <Box p={3} bg={isDark ? "gray.800" : "green.50"} borderRadius="12px" border="1px solid" borderColor={isDark ? "transparent" : "green.200"}>
                  <Text fontSize="3xs" color="green.700" fontWeight="700" textTransform="uppercase">Total Lifetime Credited</Text>
                  <Text fontSize="md" fontWeight="900" color="green.700" mt={0.5}>
                    {formatCurrency(selectedTechDetail.data?.ledger?.totalCredited)}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Flex justify="flex-end" pt={2}>
              <Button size="sm" variant="outline" onClick={() => setIsTechDetailOpen(false)} borderRadius="8px">
                Close Statement
              </Button>
            </Flex>
          </VStack>
        )}
      </AppModal>
    </Box>
  );
}
