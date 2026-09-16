import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Heading,
  Text,
  IconButton,
  Spinner,
  Badge,
  Grid,
  Center,
  VStack,
  HStack,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import {
  MdAttachMoney,
  MdPayments,
  MdHistory,
  MdPerson,
  MdRefresh,
  MdVisibility,
  MdAccountBalanceWallet,
} from "react-icons/md";

import {
  getFinanceSummary,
  getFinanceBreakdown,
  getPaymentsLedger,
  getTechnicianFinanceDetail,
  getAllTechnicians,
} from "../utils/axiosInstance";

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

export default function FinanceTracking() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const customColor = "#008080";
  const goldColor = "#F5B700";

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const [breakdown, setBreakdown] = useState([]);
  const [breakdownTotal, setBreakdownTotal] = useState(0);
  const [breakdownPages, setBreakdownPages] = useState(1);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [breakdownPage, setBreakdownPage] = useState(1);
  const [breakdownFilters, setBreakdownFilters] = useState({
    status: "",
    paymentStatus: "",
    technicianId: "",
    from: "",
    to: "",
  });

  const [payments, setPayments] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsPages, setPaymentsPages] = useState(1);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsFilters, setPaymentsFilters] = useState({
    status: "success",
    from: "",
    to: "",
  });

  const [technicians, setTechnicians] = useState([]);
  const [selectedTechDetail, setSelectedTechDetail] = useState(null);
  const [isTechDetailOpen, setIsTechDetailOpen] = useState(false);
  const [techLoadingId, setTechLoadingId] = useState(null);

  const itemsPerPage = 10;

  const globalScrollbarStyles = {
    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      background: "transparent",
      borderRadius: "3px",
      transition: "background 0.3s ease",
    },
    "&:hover::-webkit-scrollbar-thumb": { background: "#cbd5e1" },
    "&:hover::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role?.toLowerCase();
    if (!storedUser || (role !== "owner" && role !== "admin" && role !== "super admin")) {
      toast({
        title: "Access Denied",
        description: "Only admin, super admin, or owner can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentUser(storedUser);
  }, [toast]);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true);
      const response = await getFinanceSummary();
      const data = response.result || response.data || response.summary || response;
      setSummary(data);
    } catch (err) {
      console.error("Error fetching finance summary:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load finance summary.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setSummary(null);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [toast]);

  const fetchBreakdown = useCallback(async () => {
    try {
      setIsLoadingBreakdown(true);
      const response = await getFinanceBreakdown({
        ...breakdownFilters,
        page: breakdownPage,
        limit: itemsPerPage,
      });
      const data = response.result || response.data || response;
      const list = Array.isArray(data) ? data : data.payments || data.breakdown || data.items || [];
      setBreakdown(list);
      const meta = response.meta || (typeof data === "object" && data.meta) || {};
      setBreakdownTotal(meta.total || list.length);
      setBreakdownPages(meta.totalPages || Math.ceil((meta.total || list.length) / itemsPerPage) || 1);
    } catch (err) {
      console.error("Error fetching finance breakdown:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load finance breakdown.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setBreakdown([]);
    } finally {
      setIsLoadingBreakdown(false);
    }
  }, [breakdownFilters, breakdownPage, toast]);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      const response = await getPaymentsLedger({
        ...paymentsFilters,
        page: paymentsPage,
        limit: itemsPerPage,
      });
      const data = response.result || response.data || response;
      const list = Array.isArray(data) ? data : data.payments || data.items || [];
      setPayments(list);
      const meta = response.meta || (typeof data === "object" && data.meta) || {};
      setPaymentsTotal(meta.total || list.length);
      setPaymentsPages(meta.totalPages || Math.ceil((meta.total || list.length) / itemsPerPage) || 1);
    } catch (err) {
      console.error("Error fetching payments ledger:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load payments ledger.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setPayments([]);
    } finally {
      setIsLoadingPayments(false);
    }
  }, [paymentsFilters, paymentsPage, toast]);

  const fetchTechnicians = useCallback(async () => {
    try {
      const response = await getAllTechnicians();
      const data = response.result || response.data || response.technicians || response || [];
      const list = Array.isArray(data) ? data : data.technicians || [];
      setTechnicians(list);
    } catch (err) {
      console.error("Error fetching technicians:", err);
      setTechnicians([]);
    }
  }, []);

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
  }, [breakdownFilters.status, breakdownFilters.paymentStatus, breakdownFilters.technicianId, breakdownFilters.from, breakdownFilters.to]);

  useEffect(() => {
    setPaymentsPage(1);
  }, [paymentsFilters.status, paymentsFilters.from, paymentsFilters.to]);

  if (!currentUser) return null;

  const handleViewTechnicianDetail = async (technician) => {
    const techId = technician._id || technician.userId || technician.id;
    if (!techId) return;
    try {
      setTechLoadingId(techId);
      const response = await getTechnicianFinanceDetail(techId);
      const data = response.result || response.data || response.detail || response;
      setSelectedTechDetail({
        technician,
        data,
      });
      setIsTechDetailOpen(true);
    } catch (err) {
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load technician finance detail.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTechLoadingId(null);
    }
  };

  const getTechName = (tech) => {
    if (tech.name) return tech.name;
    const user = tech.userId || tech.user;
    if (user) {
      const fname = user.fname || user.firstName || "";
      const lname = user.lname || user.lastName || "";
      return `${fname} ${lname}`.trim() || user.name || user.mobileNumber || "Technician";
    }
    return tech.mobileNumber || "Technician";
  };

  const StatCard = ({ label, value, icon, bg }) => (
    <Card
      minH={{ base: "60px", md: "70px" }}
      border="1px solid"
      borderColor={`${customColor}30`}
      transition="all 0.2s ease-in-out"
      bg="white"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${customColor}15, transparent)`,
      }}
    >
      <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
        <Flex flexDirection="row" align="center" justify="space-between" w="100%">
          <Stat me="auto">
            <StatLabel fontSize={{ base: "2xs", md: "xs" }} color="gray.600" fontWeight="bold" pb="1px">
              {label}
            </StatLabel>
            <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
              {isLoadingSummary ? <Spinner size="xs" /> : value}
            </StatNumber>
          </Stat>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="12px"
            h={{ base: "32px", md: "36px" }}
            w={{ base: "32px", md: "36px" }}
            bg={bg}
          >
            <Icon as={icon} h={{ base: "16px", md: "20px" }} w={{ base: "16px", md: "20px" }} color="white" />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  const PaymentMobileCard = ({ payment, idx, type }) => {
    const serviceName = payment.service || payment.serviceName || payment.itemType || "N/A";
    const customerName = payment.customerId?.name ||
      payment.customerId?.profile?.fname ||
      payment.customerName || payment.customer || "N/A";
    const technicianName = payment.technician || payment.technicianName || "N/A";
    const amount = type === "breakdown"
      ? (payment.totalAmount || payment.serviceAmount + payment.gstAmount + payment.tipAmount || 0)
      : (payment.totalAmount || payment.amount || 0);

    return (
      <Box
        p={3}
        bg="white"
        borderWidth="1px"
        borderColor={`${customColor}20`}
        borderRadius="md"
        shadow="sm"
        mb={3}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{idx + 1} {serviceName}
          </Text>
          <Badge
            colorScheme={payment.status === "success" ? "green" : payment.status === "pending" ? "yellow" : "red"}
            borderRadius="full"
            px={2}
            fontSize="3xs"
          >
            {payment.status || "N/A"}
          </Badge>
        </Flex>
        <Text fontSize="2xs" color="gray.600" noOfLines={1} mb={1}>
          {type === "breakdown"
            ? `Technician: ${technicianName} • ${payment.paymentStatus || "No pay status"}`
            : `Order: ${payment.providerOrderId || "N/A"}`}
        </Text>
        {type === "breakdown" && (
          <Flex gap={2} wrap="wrap" mb={1}>
            <Badge colorScheme="blue" variant="subtle" fontSize="3xs">Service: {formatCurrency(payment.serviceAmount)}</Badge>
            <Badge colorScheme="orange" variant="subtle" fontSize="3xs">GST: {formatCurrency(payment.gstAmount)}</Badge>
            <Badge colorScheme="purple" variant="subtle" fontSize="3xs">Tip: {formatCurrency(payment.tipAmount)}</Badge>
            <Badge colorScheme="red" variant="subtle" fontSize="3xs">Commission: {formatCurrency(payment.commissionAmount)}</Badge>
            <Badge colorScheme="green" variant="subtle" fontSize="3xs">Tech Payable: {formatCurrency(payment.technicianAmount)}</Badge>
          </Flex>
        )}
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" fontWeight="bold" color={textColor}>
            {formatCurrency(amount)}
          </Text>
          <Text fontSize="3xs" color="gray.500">
            {formatDate(payment.createdAt)}
          </Text>
        </Flex>
      </Box>
    );
  };

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "50px", md: "45px" }}
      height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
      overflowY="auto"
      css={globalScrollbarStyles}
    >
      {/* Summary Stats */}
      <Box flexShrink={0} p={{ base: 1, md: 4 }} pb={0}>
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
          gap={{ base: "6px", md: "8px" }}
          mb={{ base: "6px", md: "8px" }}
        >
          <StatCard
            label={`Paid Services${summary?.services?.paid?.count ? ` (${summary.services.paid.count})` : ""}`}
            value={formatCurrency(summary?.services?.paid?.totalAmount || summary?.summary?.totalCollected)}
            icon={MdAttachMoney}
            bg="green.600"
          />
          <StatCard
            label={`Unpaid / Pending Services${summary?.services?.unpaid?.count ? ` (${summary.services.unpaid.count})` : ""}`}
            value={formatCurrency(summary?.services?.unpaid?.totalAmount)}
            icon={MdPayments}
            bg="yellow.600"
          />
          <StatCard
            label="Total Commission"
            value={formatCurrency(summary?.summary?.totalCommission)}
            icon={MdAttachMoney}
            bg="purple.600"
          />
          <StatCard
            label="Total GST (Tax)"
            value={formatCurrency(summary?.summary?.totalGst)}
            icon={MdPayments}
            bg="orange.500"
          />
          <StatCard
            label="Service Base Amount"
            value={formatCurrency(summary?.summary?.totalServiceAmount)}
            icon={MdPayments}
            bg="blue.500"
          />
          <StatCard
            label="Technician Payable"
            value={formatCurrency(summary?.summary?.totalPayableToTechnician)}
            icon={MdAccountBalanceWallet}
            bg="teal.600"
          />
          <StatCard
            label="Paid Out to Technicians"
            value={formatCurrency(summary?.summary?.totalPaidOutToTechnician)}
            icon={MdHistory}
            bg="teal.500"
          />
          <StatCard
            label="Held by Platform"
            value={formatCurrency(summary?.summary?.totalHeldByPlatform)}
            icon={MdHistory}
            bg="cyan.600"
          />
          <StatCard
            label={`Approved Withdrawals${summary?.withdrawals?.approved?.count ? ` (${summary.withdrawals.approved.count})` : ""}`}
            value={formatCurrency(summary?.withdrawals?.approved?.amount)}
            icon={MdHistory}
            bg="teal.500"
          />
          <StatCard
            label={`Paid Withdrawals${summary?.withdrawals?.paid?.count ? ` (${summary.withdrawals.paid.count})` : ""}`}
            value={formatCurrency(summary?.withdrawals?.paid?.amount)}
            icon={MdHistory}
            bg="cyan.600"
          />
          <StatCard
            label={`Pending Withdrawals${summary?.withdrawals?.pending?.count ? ` (${summary.withdrawals.pending.count})` : ""}`}
            value={formatCurrency(summary?.withdrawals?.pending?.amount)}
            icon={MdHistory}
            bg="yellow.500"
          />
          <StatCard
            label={`Rejected Withdrawals${summary?.withdrawals?.rejected?.count ? ` (${summary.withdrawals.rejected.count})` : ""}`}
            value={formatCurrency(summary?.withdrawals?.rejected?.amount)}
            icon={MdHistory}
            bg="red.500"
          />
        </Grid>
      </Box>

      {/* Main Card with Tabs */}
      <Box display="flex" flexDirection="column" p={{ base: 1, md: 4 }} pt={0}>
        <Card shadow="lg" bg="white" display="flex" flexDirection="column">
          <CardHeader
            p="8px 12px"
            pb="6px"
            bg="white"
            flexShrink={0}
            borderBottom="1px solid"
            borderColor={`${customColor}20`}
          >
            <Flex
              flexDirection={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              gap={3}
            >
              <Heading size="sm" flexShrink={0} color="gray.700">
                <HStack spacing={2}>
                  <Icon as={MdAttachMoney} color={customColor} />
                  <Text>Finance Tracking</Text>
                </HStack>
              </Heading>
              <Button
                leftIcon={<MdRefresh />}
                size="sm"
                onClick={() => {
                  fetchSummary();
                  if (activeTab === 1) fetchBreakdown();
                  if (activeTab === 2) fetchPayments();
                }}
                bg="white"
                color={customColor}
                border="1px"
                borderColor={customColor}
                _hover={{ bg: customColor, color: "white" }}
              >
                Refresh
              </Button>
            </Flex>
          </CardHeader>

          <CardBody bg="white" display="flex" flexDirection="column" p={0} overflow="hidden">
            <Tabs
              index={activeTab}
              onChange={setActiveTab}
              variant="enclosed"
              display="flex"
              flexDirection="column"
              flex="1"
              overflow="hidden"
            >
              <TabList flexShrink={0} borderColor={`${customColor}30`} px={4} pt={2}>
                <Tab
                  _selected={{ bg: customColor, color: "white", fontWeight: "bold" }}
                  _hover={{ bg: `${customColor}10` }}
                  fontSize="sm"
                  gap={2}
                >
                  <Icon as={MdHistory} />
                  Breakdown
                </Tab>
                <Tab
                  _selected={{ bg: customColor, color: "white", fontWeight: "bold" }}
                  _hover={{ bg: `${customColor}10` }}
                  fontSize="sm"
                  gap={2}
                >
                  <Icon as={MdPayments} />
                  Payments Ledger
                </Tab>
                <Tab
                  _selected={{ bg: customColor, color: "white", fontWeight: "bold" }}
                  _hover={{ bg: `${customColor}10` }}
                  fontSize="sm"
                  gap={2}
                >
                  <Icon as={MdPerson} />
                  Technician Finance
                </Tab>
              </TabList>

              <TabPanels flex="1" overflow="hidden">
                {/* Breakdown Tab */}
                <TabPanel p={0} display="flex" flexDirection="column" overflow="hidden" h="100%">
                  <Box px={4} py={3} flexShrink={0}>
                    <Flex direction={{ base: "column", md: "row" }} gap={3} align={{ base: "stretch", md: "center" }} wrap="wrap">
                      <Select
                        size="sm"
                        maxW="150px"
                        value={breakdownFilters.status}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, status: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      >
                        <option value="">Booking: All</option>
                        <option value="pending">Booking: Pending</option>
                        <option value="accepted">Booking: Accepted</option>
                        <option value="on_the_way">Booking: On The Way</option>
                        <option value="reached">Booking: Reached</option>
                        <option value="in_progress">Booking: In Progress</option>
                        <option value="completed">Booking: Completed</option>
                        <option value="cancelled">Booking: Cancelled</option>
                        <option value="expired">Booking: Expired</option>
                      </Select>
                      <Select
                        size="sm"
                        maxW="150px"
                        value={breakdownFilters.paymentStatus}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, paymentStatus: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      >
                        <option value="">Payment: All</option>
                        <option value="paid">Payment: Paid</option>
                        <option value="pending">Payment: Pending</option>
                        <option value="failed">Payment: Failed</option>
                        <option value="refunded">Payment: Refunded</option>
                      </Select>
                      <Select
                        size="sm"
                        maxW="200px"
                        value={breakdownFilters.technicianId}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, technicianId: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      >
                        <option value="">All Technicians</option>
                        {technicians.map((tech) => (
                          <option key={tech._id || tech.userId} value={tech._id || tech.userId}>
                            {getTechName(tech)}
                          </option>
                        ))}
                      </Select>
                      <Input
                        type="date"
                        size="sm"
                        maxW="150px"
                        value={breakdownFilters.from}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, from: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      />
                      <Input
                        type="date"
                        size="sm"
                        maxW="150px"
                        value={breakdownFilters.to}
                        onChange={(e) => setBreakdownFilters({ ...breakdownFilters, to: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      />
                    </Flex>
                  </Box>

                  <Box display="flex" flexDirection="column" px={4} pb={4}>
                    {isLoadingBreakdown ? (
                      <Flex justify="center" align="center" py={10}>
                        <Spinner size="lg" color={customColor} />
                        <Text ml={3} fontSize="sm">Loading breakdown...</Text>
                      </Flex>
                    ) : (
                      <Box display="flex" flexDirection="column">
                        <Box display={{ base: "none", md: "block" }} overflowX="auto" css={globalScrollbarStyles}>
                          <Table variant="simple" size="sm" bg="transparent">
                            <Thead>
                              <Tr>
                                {["#", "Service", "Technician", "Service Amt", "GST", "Tip", "Commission", "Tech Payable", "Total", "Pay Status", "Settlement", "Date"].map((header) => (
                                  <Th
                                    key={header}
                                    color="gray.100"
                                    borderColor={`${customColor}30`}
                                    position="sticky"
                                    top={0}
                                    bg={customColor}
                                    zIndex={10}
                                    fontWeight="bold"
                                    fontSize="xs"
                                    py={1.5}
                                    borderBottom="2px solid"
                                    borderBottomColor={`${customColor}50`}
                                  >
                                    {header}
                                  </Th>
                                ))}
                              </Tr>
                            </Thead>
                            <Tbody bg="transparent">
                              {breakdown.length > 0 ? (
                                breakdown.map((payment, idx) => {
                                  const serviceName = payment.service || payment.serviceName || "N/A";
                                  const technicianName = payment.technician || "N/A";
                                  const total = payment.totalAmount ||
                                    (payment.serviceAmount + payment.gstAmount + payment.tipAmount) || 0;
                                  return (
                                    <Tr
                                      key={payment.bookingId || payment._id || idx}
                                      bg="transparent"
                                      _hover={{ bg: `${customColor}10` }}
                                      borderBottom="1px"
                                      borderColor={`${customColor}20`}
                                      height="35px"
                                    >
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        {(breakdownPage - 1) * itemsPerPage + idx + 1}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1} maxW="140px">
                                        <Text noOfLines={1}>{serviceName}</Text>
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1} maxW="120px">
                                        <Text noOfLines={1}>{technicianName}</Text>
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        {formatCurrency(payment.serviceAmount)}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        {formatCurrency(payment.gstAmount)}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        {formatCurrency(payment.tipAmount)}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        {formatCurrency(payment.commissionAmount)}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1} fontWeight="bold" color="green.600">
                                        {formatCurrency(payment.technicianAmount)}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1} fontWeight="bold">
                                        {formatCurrency(total)}
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        <Badge
                                          colorScheme={payment.paymentStatus === "paid" ? "green" : payment.paymentStatus === "pending" ? "yellow" : "gray"}
                                          fontSize="3xs"
                                        >
                                          {payment.paymentStatus || "N/A"}
                                        </Badge>
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        <Badge
                                          colorScheme={payment.settlementStatus === "settled" ? "green" : payment.settlementStatus === "pending" ? "yellow" : "gray"}
                                          fontSize="3xs"
                                        >
                                          {payment.settlementStatus || "N/A"}
                                        </Badge>
                                      </Td>
                                      <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                        {formatDate(payment.createdAt)}
                                      </Td>
                                    </Tr>
                                  );
                                })
                              ) : (
                                <Tr>
                                  <Td colSpan={12} textAlign="center" py={6}>
                                    <Text fontSize="xs">No payments found.</Text>
                                  </Td>
                                </Tr>
                              )}
                            </Tbody>
                          </Table>
                        </Box>

                        <Box
                          display={{ base: "block", md: "none" }}
                          overflow="auto"
                          px={3}
                          py={1.5}
                          css={globalScrollbarStyles}
                        >
                          {breakdown.length > 0 ? (
                            breakdown.map((payment, idx) => (
                              <PaymentMobileCard key={payment._id || idx} payment={payment} idx={idx} type="breakdown" />
                            ))
                          ) : (
                            <Center py={10}>
                              <VStack spacing={2}>
                                <Icon as={MdHistory} color="gray.300" boxSize={10} />
                                <Text fontSize="sm" color="gray.500">No payments found</Text>
                              </VStack>
                            </Center>
                          )}
                        </Box>

                        {breakdown.length > 0 && (
                          <Box flexShrink={0} p="10px" borderTop="1px solid" borderColor={`${customColor}20`} bg="transparent">
                            <Flex justify="flex-end" align="center" gap={3}>
                              <Button
                                size="sm"
                                onClick={() => setBreakdownPage(Math.max(1, breakdownPage - 1))}
                                isDisabled={breakdownPage === 1}
                                leftIcon={<FaChevronLeft />}
                                bg="white"
                                color={customColor}
                                border="1px"
                                borderColor={customColor}
                                _hover={{ bg: customColor, color: "white" }}
                                _disabled={{
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                  bg: "gray.100",
                                  color: "gray.400",
                                  borderColor: "gray.300",
                                }}
                              >
                                <Text display={{ base: "none", sm: "block" }}>Previous</Text>
                              </Button>
                              <Flex align="center" gap={2} bg={`${customColor}10`} px={3} py={1} borderRadius="6px" minW="80px" justify="center">
                                <Text fontSize="sm" fontWeight="bold" color={customColor}>{breakdownPage}</Text>
                                <Text fontSize="sm" color="gray.500">/</Text>
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">{breakdownPages}</Text>
                              </Flex>
                              <Button
                                size="sm"
                                onClick={() => setBreakdownPage(Math.min(breakdownPages, breakdownPage + 1))}
                                isDisabled={breakdownPage === breakdownPages}
                                rightIcon={<FaChevronRight />}
                                bg="white"
                                color={customColor}
                                border="1px"
                                borderColor={customColor}
                                _hover={{ bg: customColor, color: "white" }}
                                _disabled={{
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                  bg: "gray.100",
                                  color: "gray.400",
                                  borderColor: "gray.300",
                                }}
                              >
                                <Text display={{ base: "none", sm: "block" }}>Next</Text>
                              </Button>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                {/* Payments Ledger Tab */}
                <TabPanel p={0} display="flex" flexDirection="column" overflow="hidden" h="100%">
                  <Box px={4} py={3} flexShrink={0}>
                    <Flex direction={{ base: "column", md: "row" }} gap={3} align={{ base: "stretch", md: "center" }} wrap="wrap">
                      <Select
                        size="sm"
                        maxW="150px"
                        value={paymentsFilters.status}
                        onChange={(e) => setPaymentsFilters({ ...paymentsFilters, status: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      >
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="">All</option>
                      </Select>
                      <Input
                        type="date"
                        size="sm"
                        maxW="150px"
                        value={paymentsFilters.from}
                        onChange={(e) => setPaymentsFilters({ ...paymentsFilters, from: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      />
                      <Input
                        type="date"
                        size="sm"
                        maxW="150px"
                        value={paymentsFilters.to}
                        onChange={(e) => setPaymentsFilters({ ...paymentsFilters, to: e.target.value })}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                      />
                    </Flex>
                  </Box>

                  <Box display="flex" flexDirection="column" px={4} pb={4}>
                    {isLoadingPayments ? (
                      <Flex justify="center" align="center" py={10}>
                        <Spinner size="lg" color={customColor} />
                        <Text ml={3} fontSize="sm">Loading payments...</Text>
                      </Flex>
                    ) : (
                      <Box display="flex" flexDirection="column">
                        <Box display={{ base: "none", md: "block" }} overflowX="auto" css={globalScrollbarStyles}>
                          <Table variant="simple" size="sm" bg="transparent">
                            <Thead>
                              <Tr>
                                {["#", "Order ID", "Type", "Amount", "Status", "Commission", "Date"].map((header) => (
                                  <Th
                                    key={header}
                                    color="gray.100"
                                    borderColor={`${customColor}30`}
                                    position="sticky"
                                    top={0}
                                    bg={customColor}
                                    zIndex={10}
                                    fontWeight="bold"
                                    fontSize="xs"
                                    py={1.5}
                                    borderBottom="2px solid"
                                    borderBottomColor={`${customColor}50`}
                                  >
                                    {header}
                                  </Th>
                                ))}
                              </Tr>
                            </Thead>
                            <Tbody bg="transparent">
                              {payments.length > 0 ? (
                                payments.map((payment, idx) => (
                                  <Tr
                                    key={payment.paymentId || payment._id || idx}
                                    bg="transparent"
                                    _hover={{ bg: `${customColor}10` }}
                                    borderBottom="1px"
                                    borderColor={`${customColor}20`}
                                    height="35px"
                                  >
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                      {(paymentsPage - 1) * itemsPerPage + idx + 1}
                                    </Td>
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                      <Text fontSize="xs" noOfLines={1} maxW="200px">
                                        {payment.providerOrderId || payment.paymentId || "N/A"}
                                      </Text>
                                    </Td>
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1} maxW="140px" noOfLines={1}>
                                      {payment.itemType || "N/A"}
                                    </Td>
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1} fontWeight="bold">
                                      {formatCurrency(payment.totalAmount)}
                                    </Td>
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                      <Badge
                                        colorScheme={payment.status === "success" ? "green" : payment.status === "pending" ? "yellow" : "red"}
                                        fontSize="3xs"
                                      >
                                        {payment.status || "N/A"}
                                      </Badge>
                                    </Td>
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                      {formatCurrency(payment.commissionAmount)}
                                    </Td>
                                    <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                      {formatDate(payment.createdAt)}
                                    </Td>
                                  </Tr>
                                ))
                              ) : (
                                <Tr>
                                  <Td colSpan={7} textAlign="center" py={6}>
                                    <Text fontSize="xs">No payments found.</Text>
                                  </Td>
                                </Tr>
                              )}
                            </Tbody>
                          </Table>
                        </Box>

                        <Box
                          display={{ base: "block", md: "none" }}
                          overflow="auto"
                          px={3}
                          py={1.5}
                          css={globalScrollbarStyles}
                        >
                          {payments.length > 0 ? (
                            payments.map((payment, idx) => (
                              <PaymentMobileCard key={payment._id || idx} payment={payment} idx={idx} type="payments" />
                            ))
                          ) : (
                            <Center py={10}>
                              <VStack spacing={2}>
                                <Icon as={MdPayments} color="gray.300" boxSize={10} />
                                <Text fontSize="sm" color="gray.500">No payments found</Text>
                              </VStack>
                            </Center>
                          )}
                        </Box>

                        {payments.length > 0 && (
                          <Box flexShrink={0} p="10px" borderTop="1px solid" borderColor={`${customColor}20`} bg="transparent">
                            <Flex justify="flex-end" align="center" gap={3}>
                              <Button
                                size="sm"
                                onClick={() => setPaymentsPage(Math.max(1, paymentsPage - 1))}
                                isDisabled={paymentsPage === 1}
                                leftIcon={<FaChevronLeft />}
                                bg="white"
                                color={customColor}
                                border="1px"
                                borderColor={customColor}
                                _hover={{ bg: customColor, color: "white" }}
                                _disabled={{
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                  bg: "gray.100",
                                  color: "gray.400",
                                  borderColor: "gray.300",
                                }}
                              >
                                <Text display={{ base: "none", sm: "block" }}>Previous</Text>
                              </Button>
                              <Flex align="center" gap={2} bg={`${customColor}10`} px={3} py={1} borderRadius="6px" minW="80px" justify="center">
                                <Text fontSize="sm" fontWeight="bold" color={customColor}>{paymentsPage}</Text>
                                <Text fontSize="sm" color="gray.500">/</Text>
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">{paymentsPages}</Text>
                              </Flex>
                              <Button
                                size="sm"
                                onClick={() => setPaymentsPage(Math.min(paymentsPages, paymentsPage + 1))}
                                isDisabled={paymentsPage === paymentsPages}
                                rightIcon={<FaChevronRight />}
                                bg="white"
                                color={customColor}
                                border="1px"
                                borderColor={customColor}
                                _hover={{ bg: customColor, color: "white" }}
                                _disabled={{
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                  bg: "gray.100",
                                  color: "gray.400",
                                  borderColor: "gray.300",
                                }}
                              >
                                <Text display={{ base: "none", sm: "block" }}>Next</Text>
                              </Button>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                {/* Technician Finance Tab */}
                <TabPanel p={0} display="flex" flexDirection="column" overflow="hidden" h="100%">
                  <Box display="flex" flexDirection="column" px={4} pb={4} pt={3}>
                    <Box display={{ base: "none", md: "block" }} overflowX="auto" css={globalScrollbarStyles}>
                      <Table variant="simple" size="sm" bg="transparent">
                        <Thead>
                          <Tr>
                            {["#", "Technician", "Contact", "Status", "Actions"].map((header) => (
                              <Th
                                key={header}
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={customColor}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={1.5}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                {header}
                              </Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody bg="transparent">
                          {technicians.length > 0 ? (
                            technicians.map((tech, idx) => (
                              <Tr
                                key={tech._id || idx}
                                bg="transparent"
                                _hover={{ bg: `${customColor}10` }}
                                borderBottom="1px"
                                borderColor={`${customColor}20`}
                                height="35px"
                              >
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                  {idx + 1}
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                  <Flex align="center" gap={2}>
                                    <Icon as={MdPerson} color={customColor} boxSize={3.5} />
                                    <Text fontWeight="medium" fontSize="xs" noOfLines={1}>
                                      {getTechName(tech)}
                                    </Text>
                                  </Flex>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                  {tech.userId?.mobileNumber || tech.mobileNumber || "-"}
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                  <Badge
                                    bg={tech.workStatus === "approved" ? customColor : "gray.300"}
                                    color="white"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    fontSize="2xs"
                                  >
                                    {tech.workStatus || "N/A"}
                                  </Badge>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                  <IconButton
                                    aria-label="View finance detail"
                                    icon={<MdVisibility />}
                                    bg="white"
                                    color="blue.500"
                                    border="1px"
                                    borderColor="blue.500"
                                    _hover={{ bg: "blue.500", color: "white" }}
                                    size="xs"
                                    isLoading={techLoadingId === (tech._id || tech.userId)}
                                    onClick={() => handleViewTechnicianDetail(tech)}
                                  />
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={6}>
                                <Text fontSize="xs">No technicians found.</Text>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>

                    <Box
                      display={{ base: "block", md: "none" }}
                      overflow="auto"
                      px={3}
                      py={1.5}
                      css={globalScrollbarStyles}
                    >
                      {technicians.length > 0 ? (
                        technicians.map((tech, idx) => (
                          <Box
                            key={tech._id || idx}
                            p={3}
                            bg="white"
                            borderWidth="1px"
                            borderColor={`${customColor}20`}
                            borderRadius="md"
                            shadow="sm"
                            mb={3}
                          >
                            <Flex justify="space-between" align="center" mb={1}>
                              <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
                                {getTechName(tech)}
                              </Text>
                              <IconButton
                                aria-label="View finance detail"
                                icon={<MdVisibility />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                isLoading={techLoadingId === (tech._id || tech.userId)}
                                onClick={() => handleViewTechnicianDetail(tech)}
                              />
                            </Flex>
                            <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                              {tech.userId?.mobileNumber || tech.mobileNumber || "No contact"}
                            </Text>
                          </Box>
                        ))
                      ) : (
                        <Center py={10}>
                          <VStack spacing={2}>
                            <Icon as={MdPerson} color="gray.300" boxSize={10} />
                            <Text fontSize="sm" color="gray.500">No technicians found</Text>
                          </VStack>
                        </Center>
                      )}
                    </Box>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>

      {/* Technician Finance Detail Modal */}
      <Modal isOpen={isTechDetailOpen} onClose={() => setIsTechDetailOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent maxW="650px">
          <ModalHeader color="gray.700">
            <HStack spacing={2}>
              <Icon as={MdAccountBalanceWallet} color={customColor} />
              <Text>Technician Finance Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {selectedTechDetail && (
              <VStack spacing={4} align="stretch">
                <Box bg={`${customColor}05`} p={4} borderRadius="md">
                  <Text fontSize="md" fontWeight="bold" color={customColor}>
                    {selectedTechDetail.data?.technician?.name || getTechName(selectedTechDetail.technician)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedTechDetail.data?.technician?.mobile ||
                      selectedTechDetail.technician.userId?.mobileNumber ||
                      selectedTechDetail.technician.mobileNumber ||
                      "No contact"}
                  </Text>
                  <Badge
                    bg={selectedTechDetail.data?.technician?.workStatus === "approved" ? customColor : "gray.300"}
                    color="white"
                    mt={1}
                    borderRadius="full"
                    px={2}
                    fontSize="2xs"
                  >
                    {selectedTechDetail.data?.technician?.workStatus || "N/A"}
                  </Badge>
                </Box>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Bookings (Paid & Completed)</Text>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Jobs Completed</Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedTechDetail.data?.bookings?.count || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Settled Jobs</Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedTechDetail.data?.bookings?.settledCount || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Service Amount</Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {formatCurrency(selectedTechDetail.data?.bookings?.serviceAmount)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">GST</Text>
                      <Text fontSize="lg" fontWeight="bold" color="orange.600">
                        {formatCurrency(selectedTechDetail.data?.bookings?.gst)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Tips</Text>
                      <Text fontSize="lg" fontWeight="bold" color="purple.600">
                        {formatCurrency(selectedTechDetail.data?.bookings?.tip)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Commission</Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.600">
                        {formatCurrency(selectedTechDetail.data?.bookings?.commission)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Net Earnings</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {formatCurrency(selectedTechDetail.data?.bookings?.earned)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Wallet Balance</Text>
                      <Text fontSize="lg" fontWeight="bold" color={customColor}>
                        {formatCurrency(selectedTechDetail.data?.technician?.walletBalance)}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Wallet Ledger</Text>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Job Earnings</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {formatCurrency(selectedTechDetail.data?.ledger?.jobEarnings)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Tips</Text>
                      <Text fontSize="lg" fontWeight="bold" color="purple.600">
                        {formatCurrency(selectedTechDetail.data?.ledger?.tips)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Bonuses</Text>
                      <Text fontSize="lg" fontWeight="bold" color="teal.600">
                        {formatCurrency(selectedTechDetail.data?.ledger?.bonuses)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Withdrawals</Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {formatCurrency(selectedTechDetail.data?.ledger?.withdrawals)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Penalties</Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.600">
                        {formatCurrency(selectedTechDetail.data?.ledger?.penalties)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Total Credited</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {formatCurrency(selectedTechDetail.data?.ledger?.totalCredited)}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}