import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  useToast,
  Spinner,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Center,
  Divider,
  Image,
  Select,
  Tooltip,
  InputGroup,
  InputRightElement,
  VisuallyHidden,
  useBreakpointValue,
  Avatar,
  SimpleGrid,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaWallet,
  FaChartLine,
  FaCalendarAlt,
  FaRupeeSign,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdCategory, MdPayment, MdOutlinePayment } from "react-icons/md";
import { FiCalendar, FiUser, FiTruck } from "react-icons/fi";

import { UpdatePaymentStatus, getAllServiceBooking, updateOrders, getAllUsers, getAllWallets, approveWithdrawal, rejectWithdrawal, getTotalWalletsDetails, getTechnicianById } from "../utils/axiosInstance";

// Custom IconBox component
const IconBox = ({ children, ...rest }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderRadius="12px"
    {...rest}
  >
    {children}
  </Box>
);

// Mobile Card Component for Service Bookings
const ServiceMobileCard = ({ booking, idx, indexOfFirstItem, onViewDetails, users }) => {
  const customColor = "#008080";

  // Helper to find user if customerProfileId is a string
  const foundUser = (typeof booking.customerProfileId === 'string')
    ? users.find(u => u._id === booking.customerProfileId || u.userId === booking.customerProfileId)
    : null;

  const customerName = (
    (booking.customerId?.fname || booking.customerId?.lname) ? `${booking.customerId.fname || ""} ${booking.customerId.lname || ""}` :
      (booking.addressSnapshot?.name) ? booking.addressSnapshot.name :
        (typeof booking.customerProfileId === 'object' && (booking.customerProfileId?.firstName || booking.customerProfileId?.lastName)) ? `${booking.customerProfileId.firstName || ""} ${booking.customerProfileId.lastName || ""}` :
          (foundUser) ? (`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.name) :
            "—"
  ).trim() || "—";

  return (
    <Box
      p={3}
      bg="white"
      borderWidth="1px"
      borderColor={`${customColor}20`}
      borderRadius="md"
      shadow="sm"
      mb={3}
      transition="all 0.2s"
      _active={{ transform: "scale(0.98)" }}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Avatar size="xs" name={customerName} />
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1}
          </Text>
        </HStack>
        <Badge
          colorScheme={booking.paymentStatus === "paid" ? "green" : "orange"}
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {booking.paymentStatus || "Pending"}
        </Badge>
      </Flex>

      <SimpleGrid columns={2} spacing={1} mb={2}>
        <Text fontSize="2xs" color="gray.600" noOfLines={1}>
          <Text as="span" fontWeight="bold">Customer:</Text> {customerName}
        </Text>
        <Text fontSize="2xs" color="gray.600" noOfLines={1}>
          <Text as="span" fontWeight="bold">Service:</Text> {booking.serviceId?.serviceName || "N/A"}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Amount:</Text> ₹{booking.baseAmount || 0}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Status:</Text>{" "}
          <Badge colorScheme={booking.status === "completed" ? "green" : booking.status === "cancelled" ? "red" : "yellow"} fontSize="3xs">
            {booking.status}
          </Badge>
        </Text>
      </SimpleGrid>

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View details"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => onViewDetails(booking)}
        />
      </Flex>
    </Box>
  );
};

// Mobile Card Component for Payments
const PaymentMobileCard = ({ payment, idx, indexOfFirstItem, onUpdatePayment }) => {
  const customColor = "#008080";

  return (
    <Box
      p={3}
      bg="white"
      borderWidth="1px"
      borderColor={`${customColor}20`}
      borderRadius="md"
      shadow="sm"
      mb={3}
      transition="all 0.2s"
      _active={{ transform: "scale(0.98)" }}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <IconBox h="20px" w="20px" bg={customColor}>
            <Icon as={FaMoneyBillWave} h="10px" w="10px" color="white" />
          </IconBox>
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1}
          </Text>
        </HStack>
        <Badge
          colorScheme={payment.status === "success" || payment.status === "paid" ? "green" : "red"}
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {payment.status || "Pending"}
        </Badge>
      </Flex>

      <SimpleGrid columns={2} spacing={1} mb={2}>
        <Text fontSize="2xs" color="gray.600" noOfLines={1}>
          <Text as="span" fontWeight="bold">Payment ID:</Text> {payment._id?.substring(0, 8)}...
        </Text>
        <Text fontSize="2xs" color="gray.600" noOfLines={1}>
          <Text as="span" fontWeight="bold">Method:</Text> {payment.method || "N/A"}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Amount:</Text> ₹{payment.amount || 0}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Date:</Text> {formatDate(payment.createdAt)}
        </Text>
      </SimpleGrid>

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="Update payment"
          icon={<FaCheckCircle />}
          size="xs"
          colorScheme="green"
          variant="ghost"
          onClick={() => onUpdatePayment(payment._id)}
        />
      </Flex>
    </Box>
  );
};

// Mobile Card Component for Wallets
const WalletMobileCard = ({ wallet, idx, indexOfFirstItem, technicianMap }) => {
  const customColor = "#008080";

  const techId = wallet.technicianId?._id || wallet.technicianProfileId || wallet.providerId?._id || (typeof wallet.providerId === 'string' ? wallet.providerId : null);
  const techData = technicianMap && techId ? technicianMap[techId] : null;

  let displayName = "Unknown";
  if (techData) {
    if (techData.userId && (techData.userId.fname || techData.userId.lname)) {
      displayName = `${techData.userId.fname || ""} ${techData.userId.lname || ""}`.trim();
    } else if (techData.userId && (techData.userId.firstName || techData.userId.lastName)) {
      displayName = `${techData.userId.firstName || ""} ${techData.userId.lastName || ""}`.trim();
    } else if (techData.name) {
      displayName = techData.name;
    }
  }

  return (
    <Box
      p={3}
      bg="white"
      borderWidth="1px"
      borderColor={`${customColor}20`}
      borderRadius="md"
      shadow="sm"
      mb={3}
      transition="all 0.2s"
      _active={{ transform: "scale(0.98)" }}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Avatar size="xs" name={displayName} />
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {displayName}
          </Text>
        </HStack>
        <Badge
          colorScheme={wallet.status === "approved" ? "green" : wallet.status === "rejected" ? "red" : "yellow"}
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {wallet.status}
        </Badge>
      </Flex>

      <SimpleGrid columns={2} spacing={1} mb={2}>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Amount:</Text> ₹{wallet.amount || 0}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Balance:</Text> ₹{wallet.technicianId?.walletBalance || 0}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Date:</Text> {formatDate(wallet.createdAt)}
        </Text>
      </SimpleGrid>
    </Box>
  );
};

/** Helper & Utilities **/
const safeGet = (obj, path, fallback = undefined) => {
  if (!path) return fallback;
  try {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
  } catch {
    return fallback;
  }
};

const formatINR = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "₹0";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  } catch {
    return `₹${num}`;
  }
};

const formatDate = (dateValue) => {
  if (!dateValue || dateValue === 0) return "N/A";
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
};

const formatDateTime = (dateValue) => {
  if (!dateValue || dateValue === 0) return "N/A";
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
};

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const getDateRangePreset = (preset) => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  let start = null;
  switch ((preset || "all").toLowerCase()) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
      break;
    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0).getTime();
      break;
    }
    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
      break;
    case "this_year":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
      break;
    case "all":
    default:
      start = null;
  }
  return [start, end];
};

const exportToCSV = (filename, rows) => {
  if (!rows || !rows.length) {
    const blob = new Blob(["No data"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(rows.map((row) =>
    headers.map((h) => {
      const v = row[h] === undefined || row[h] === null ? "" : String(row[h]);
      return `"${v.replace(/"/g, '""')}"`;
    }).join(",")
  )).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** Constants **/
const DEFAULT_CUSTOM_COLOR = "#008080";

const STATUS_COLORS = {
  delivered: { bg: "#10B981", color: "white" },
  confirmed: { bg: "#3B82F6", color: "white" },
  pending: { bg: "#F59E0B", color: "white" },
  completed: { bg: "#10B981", color: "white" },
  broadcasted: { bg: "#8B5CF6", color: "white" },
  requested: { bg: "#3B82F6", color: "white" },
  cancelled: { bg: "#EF4444", color: "white" },
  paid: { bg: "#10B981", color: "white" },
  success: { bg: "#10B981", color: "white" },
  failed: { bg: "#EF4444", color: "white" },
  refunded: { bg: "#F59E0B", color: "white" },
  default: { bg: "#6366F1", color: "white" },
};

/** Main component **/
export default function CleanedBilling() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.800");
  const toast = useToast();

  const customColor = DEFAULT_CUSTOM_COLOR;
  const customHoverColor = "#008080";

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = window?.localStorage?.getItem?.("user");
      return raw ? JSON.parse(raw) : { role: "admin", name: "Local Dev" };
    } catch {
      return null;
    }
  });

  const [wallets, setWallets] = useState([]);
  const [walletDetails, setWalletDetails] = useState({
    totalCollected: 0,
    totalCommission: 0,
    availableBalance: 0
  });
  const [technicianMap, setTechnicianMap] = useState({});
  const [serviceBookings, setServiceBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const payments = useMemo(() => {
    const list = [];

    (serviceBookings || []).forEach((s) => {
      const status = (safeGet(s, "paymentStatus", "") || "").toString().toLowerCase();
      if (status === "paid" || status === "success") {
        const pObj = safeGet(s, "payment", {}) || {};
        list.push({
          _id: safeGet(s, "paymentId") || safeGet(s, "payment._id") || safeGet(s, "razorpayPaymentId") || `SB-${safeGet(s, "_id")}`,
          razorpayOrderId: safeGet(s, "razorpayOrderId") || safeGet(pObj, "razorpayOrderId") || "",
          orderId: safeGet(s, "_id", "UNKNOWN"),
          amount: safeGet(s, "baseAmount", 0),
          method: safeGet(s, "paymentMethod", safeGet(pObj, "method", "Online")),
          status: status,
          createdAt: safeGet(s, "createdAt", safeGet(s, "scheduledAt", Date.now())),
          orderRef: s,
          isService: true
        });
      }
    });

    return list;
  }, [serviceBookings]);

  const [users, setUsers] = useState([]);

  const [currentView, setCurrentView] = useState("services");
  const [filteredData, setFilteredData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 220);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const searchRef = useRef(null);

  // Responsive detection
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Global scrollbar styles
  const globalScrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'transparent',
      borderRadius: '3px',
      transition: 'background 0.3s ease',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      background: '#cbd5e1',
    },
    '&:hover::-webkit-scrollbar-thumb:hover': {
      background: '#94a3b8',
    },
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (searchRef?.current) searchRef.current.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fetchServiceBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllServiceBooking();
      if (res && res.success && Array.isArray(res.result)) {
        setServiceBookings(res.result);
      } else if (Array.isArray(res)) {
        setServiceBookings(res);
      } else {
        setServiceBookings([]);
      }
    } catch (err) {
      console.error("Error fetching service bookings:", err);
      toast({ title: "Failed to load service bookings", description: err?.message || "See console", status: "error", duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      const usersRaw = res.result || res.data?.users || res.data || res?.users || res || [];
      setUsers(Array.isArray(usersRaw) ? usersRaw : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await getAllWallets();
      console.log("Wallets fetched:", res);
      const walletList = Array.isArray(res) ? res : (res.data || res.result || res.wallets || []);
      setWallets(Array.isArray(walletList) ? walletList : []);
    } catch (err) {
      console.error("Error fetching wallets:", err);
      toast({ status: "error", title: "Wallet Fetch Error", description: err.message });
    }
  }, [toast]);

  useEffect(() => {
    const fetchTechnicianDetails = async () => {
      if (!wallets || wallets.length === 0) return;

      const uniqueTechIds = [...new Set(wallets.map(w => w.technicianId?._id || w.technicianProfileId || w.providerId?._id || w.providerId).filter(id => id && typeof id === 'string'))];

      const newIdsToFetch = uniqueTechIds.filter(id => !technicianMap[id]);

      if (newIdsToFetch.length === 0) return;

      try {
        const results = await Promise.allSettled(
          newIdsToFetch.map(async (id) => {
            try {
              const data = await getTechnicianById(id);
              const tech = data.result || data.data || data;
              return { id, tech };
            } catch (e) {
              console.error(`Failed to fetch technician ${id}`, e);
              return { id, error: true };
            }
          })
        );

        setTechnicianMap(prev => {
          const newMap = { ...prev };
          results.forEach(res => {
            if (res.status === 'fulfilled' && res.value && !res.value.error) {
              newMap[res.value.id] = res.value.tech;
            }
          });
          return newMap;
        });

      } catch (error) {
        console.error("Error fetching technician details batch:", error);
      }
    };

    fetchTechnicianDetails();
  }, [wallets]);

  const fetchWalletDetails = useCallback(async () => {
    try {
      const res = await getTotalWalletsDetails();
      if (res && res.result) {
        setWalletDetails(res.result);
      }
    } catch (err) {
      console.error("Error fetching wallet details:", err);
    }
  }, []);

  useEffect(() => {
    fetchServiceBookings();
    fetchUsers();
    fetchWallets();
    fetchWalletDetails();
  }, [fetchServiceBookings, fetchUsers, fetchWallets, fetchWalletDetails]);

  const handleApproveWithdrawal = async (withdrawId) => {
    if (!withdrawId) return;
    setIsLoading(true);
    try {
      await approveWithdrawal(withdrawId);
      toast({ title: "Approved", status: "success", description: "Withdrawal request approved." });
      fetchWallets();
    } catch (error) {
      toast({ title: "Error", status: "error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawId) => {
    if (!withdrawId) return;
    setIsLoading(true);
    try {
      await rejectWithdrawal(withdrawId);
      toast({ title: "Rejected", status: "info", description: "Withdrawal request rejected." });
      fetchWallets();
    } catch (error) {
      toast({ title: "Error", status: "error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWallets = useMemo(() => {
    return (wallets || []).filter((w) => {
      return true;
    });
  }, [wallets]);

  const filteredPayments = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();

    return (payments || []).filter((p) => {
      if (!q) return true;
      const pid = (safeGet(p, "_id", "") || "").toString().toLowerCase();
      const razor = (safeGet(p, "razorpayOrderId", "") || "").toString().toLowerCase();
      const orderId = (safeGet(p, "orderId", "") || "").toString().toLowerCase();
      const method = (safeGet(p, "method", "") || "").toString().toLowerCase();
      const status = (safeGet(p, "status", "") || "").toString().toLowerCase();
      return pid.includes(q) || razor.includes(q) || orderId.includes(q) || method.includes(q) || status.includes(q);
    });
  }, [payments, debouncedSearch]);

  const filteredServices = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();
    return (serviceBookings || []).filter((s) => {
      const id = (safeGet(s, "_id", "") || "").toString().toLowerCase();

      const foundUser = (typeof s.customerProfileId === 'string')
        ? users.find(u => u._id === s.customerProfileId || u.userId === s.customerProfileId)
        : null;

      const customerName = (
        (s.customerId?.fname || s.customerId?.lname) ? `${s.customerId.fname || ""} ${s.customerId.lname || ""}` :
          (s.addressSnapshot?.name) ? s.addressSnapshot.name :
            (typeof s.customerProfileId === 'object' && (s.customerProfileId?.firstName || s.customerProfileId?.lastName)) ? `${s.customerProfileId.firstName || ""} ${s.customerProfileId.lastName || ""}` :
              (foundUser) ? (`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.name) :
                ""
      ).toLowerCase();

      const serviceName = (safeGet(s, "serviceId.serviceName", "") || "").toLowerCase();
      const status = (safeGet(s, "status", "") || "").toString().toLowerCase();
      const paymentStatus = (safeGet(s, "paymentStatus", "") || "").toString().toLowerCase();

      if (!q) return true;

      return (
        id.includes(q) ||
        customerName.includes(q) ||
        serviceName.includes(q) ||
        status.includes(q) ||
        paymentStatus.includes(q)
      );
    });
  }, [serviceBookings, debouncedSearch, users]);

  const totalPages = useMemo(() => {
    let len = 0;
    if (currentView === "services") len = filteredServices.length;
    else if (currentView === "wallets") len = filteredWallets.length;
    else len = filteredPayments.length;
    return Math.max(1, Math.ceil(len / itemsPerPage));
  }, [currentView, filteredPayments, filteredServices, filteredWallets, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentView, debouncedSearch, itemsPerPage]);

  const currentSlice = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    if (currentView === "services") return filteredServices.slice(start, end);
    if (currentView === "wallets") return filteredWallets.slice(start, end);
    return filteredPayments.slice(start, end);
  }, [currentPage, itemsPerPage, currentView, filteredPayments, filteredServices, filteredWallets]);

  useEffect(() => {
    if (currentView === "services") {
      setFilteredData(filteredServices);
    } else if (currentView === "wallets") {
      setFilteredData(filteredWallets);
    } else {
      setFilteredData(filteredPayments);
    }
  }, [currentView, filteredPayments, filteredServices, filteredWallets]);

  const getStatusColor = (status) => {
    if (!status) return STATUS_COLORS.default;
    const n = status.toString().toLowerCase();
    return STATUS_COLORS[n] || STATUS_COLORS.default;
  };

  const openModalForBooking = (booking) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBooking(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const prepareServicesExportRows = () => {
    return (filteredServices || []).map((s) => ({
      bookingId: safeGet(s, "_id", ""),
      customer: `${safeGet(s, "customerId.fname", "")} ${safeGet(s, "customerId.lname", "")}`,
      service: safeGet(s, "serviceId.serviceName", ""),
      amount: safeGet(s, "baseAmount", 0),
      status: safeGet(s, "status", ""),
      paymentStatus: safeGet(s, "paymentStatus", ""),
      scheduledAt: safeGet(s, "scheduledAt", safeGet(s, "createdAt", "")),
    }));
  };

  const preparePaymentsExportRows = () => {
    return (filteredPayments || []).map((p) => ({
      paymentId: safeGet(p, "_id", ""),
      razorpayOrderId: safeGet(p, "razorpayOrderId", ""),
      orderId: safeGet(p, "orderId", ""),
      method: safeGet(p, "method", ""),
      amount: safeGet(p, "amount", 0),
      status: safeGet(p, "status", ""),
      createdAt: safeGet(p, "createdAt", safeGet(p, "orderRef.createdAt", "")),
    }));
  };

  const handleUpdatePaymentStatus = async (paymentId) => {
    if (!paymentId) {
      toast({
        title: "Error",
        description: "Payment ID not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await UpdatePaymentStatus(paymentId);
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchServiceBookings();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Service Booking Row Component
  const ServiceBookingRow = ({ booking }) => {
    const status = safeGet(booking, "status", "requested");
    const payStatus = safeGet(booking, "paymentStatus", "pending");

    const foundUser = (typeof booking.customerProfileId === 'string')
      ? users.find(u => u._id === booking.customerProfileId || u.userId === booking.customerProfileId)
      : null;

    const customerName = (
      (booking.customerId?.fname || booking.customerId?.lname) ? `${booking.customerId.fname || ""} ${booking.customerId.lname || ""}` :
        (booking.addressSnapshot?.name) ? booking.addressSnapshot.name :
          (typeof booking.customerProfileId === 'object' && (booking.customerProfileId?.firstName || booking.customerProfileId?.lastName)) ? `${booking.customerProfileId.firstName || ""} ${booking.customerProfileId.lastName || ""}` :
            (foundUser) ? (`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.name) :
              "—"
    ).trim() || "—";

    const customerPhone = (
      booking.customerId?.mobileNumber ||
      booking.addressSnapshot?.phone ||
      (typeof booking.customerProfileId === 'object' ? booking.customerProfileId?.mobileNumber : null) ||
      (foundUser?.mobileNumber || foundUser?.phone) ||
      "—"
    );

    return (
      <>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" fontSize="xs">{customerName}</Text>
            <Text fontSize="2xs" color="gray.500">{customerPhone}</Text>
          </VStack>
        </Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>{safeGet(booking, "serviceId.serviceName", "—")}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="bold">₹{safeGet(booking, "baseAmount", 0)}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Badge bg={getStatusColor(status).bg} color={getStatusColor(status).color} px={2} py={0.5} borderRadius="full" fontSize="2xs" fontWeight="bold">
            {String(status).toUpperCase()}
          </Badge>
        </Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Badge variant="solid" colorScheme={payStatus === "paid" ? "green" : "orange"} px={2} fontSize="2xs">
            {String(payStatus).toUpperCase()}
          </Badge>
        </Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>{formatDate(safeGet(booking, "scheduledAt") || safeGet(booking, "createdAt"))}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Flex gap={2}>
            <IconButton
              aria-label="View booking details"
              icon={<FaEye />}
              bg="white"
              color="blue.500"
              border="1px"
              borderColor="blue.500"
              _hover={{ bg: "blue.500", color: "white" }}
              size="xs"
              onClick={() => openModalForBooking(booking)}
            />
          </Flex>
        </Td>
      </>
    );
  };

  // Payment Row Component
  const PaymentRow = ({ payment }) => {
    const status = safeGet(payment, "status", "pending");
    const paymentId = safeGet(payment, "_id", null);

    return (
      <>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="medium">{safeGet(payment, "_id", safeGet(payment, "razorpayOrderId", "—")).substring(0, 12)}...</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>{safeGet(payment, "orderId", "—").substring(0, 8)}...</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="bold">₹{safeGet(payment, "amount", 0)}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Badge variant="outline" colorScheme="blue" fontSize="2xs">{safeGet(payment, "method", "UNKNOWN")}</Badge>
        </Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Badge bg={getStatusColor(status).bg} color={getStatusColor(status).color} px={2} py={0.5} borderRadius="full" fontSize="2xs" fontWeight="bold">
            {String(status).toUpperCase()}
          </Badge>
        </Td>
      </>
    );
  };

  // Wallet Row Component
  const WalletRow = ({ wallet }) => {
    const techId = wallet.technicianId?._id || wallet.technicianProfileId || wallet.providerId?._id || (typeof wallet.providerId === 'string' ? wallet.providerId : null);
    const techData = technicianMap && techId ? technicianMap[techId] : null;

    let displayName = "Unknown";
    if (techData) {
      if (techData.userId && (techData.userId.fname || techData.userId.lname)) {
        displayName = `${techData.userId.fname || ""} ${techData.userId.lname || ""}`.trim();
      } else if (techData.userId && (techData.userId.firstName || techData.userId.lastName)) {
        displayName = `${techData.userId.firstName || ""} ${techData.userId.lastName || ""}`.trim();
      } else if (techData.name) {
        displayName = techData.name;
      } else if (techData.firstName) {
        displayName = `${techData.firstName} ${techData.lastName || ""}`.trim();
      }
    }

    return (
      <>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Flex align="center" gap={2}>
            <Avatar size="xs" name={displayName} />
            <Text fontSize="xs">{displayName}</Text>
          </Flex>
        </Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="bold" color="green.600">₹{wallet.technicianId?.walletBalance || 0}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="bold">₹{wallet.amount || 0}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          <Badge
            bg={wallet.status === "approved" ? "#10B981" : wallet.status === "rejected" ? "#EF4444" : "#F59E0B"}
            color="white"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="2xs"
          >
            {wallet.status}
          </Badge>
        </Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>{new Date(wallet.createdAt).toLocaleDateString()}</Td>
        <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
          {wallet.status === "pending" && (
            <HStack spacing={2}>
              <Button size="xs" bg="green.500" color="white" _hover={{ bg: "green.600" }} onClick={() => handleApproveWithdrawal(wallet._id)}>Approve</Button>
              <Button size="xs" bg="red.500" color="white" _hover={{ bg: "red.600" }} onClick={() => handleRejectWithdrawal(wallet._id)}>Reject</Button>
            </HStack>
          )}
        </Td>
      </>
    );
  };

  if (!currentUser) {
    return (
      <Center minH="300px">
        <Spinner size="xl" color={customColor} />
        <Text ml={3}>Checking user...</Text>
      </Center>
    );
  }

  const searchPlaceholder = currentView === "services"
    ? "Search by customer, service, status..."
    : currentView === "wallets"
      ? "Search payments by payment ID, method, or order..."
      : "Search by payment ID, method, status...";

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "50px", md: "45px" }}
      height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
      overflow="hidden"
      css={globalScrollbarStyles}
    >
      {/* Fixed Statistics Cards */}
      <Box flexShrink={0} p={{ base: 1, md: 4 }} pb={0}>
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
          gap={{ base: "8px", md: "10px" }}
          mb={{ base: "8px", md: "12px" }}
        >
          {/* Service Bookings Card */}
          <Card
            minH={{ base: "55px", md: "60px" }}
            cursor="pointer"
            onClick={() => setCurrentView("services")}
            border={currentView === "services" ? "2px solid" : "1px solid"}
            borderColor={currentView === "services" ? customColor : `${customColor}30`}
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
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Service Bookings
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : serviceBookings.length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg={customColor}
                >
                  <Icon as={FiCalendar} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* All Payments Card */}
          <Card
            minH={{ base: "55px", md: "60px" }}
            cursor="pointer"
            onClick={() => setCurrentView("payments")}
            border={currentView === "payments" ? "2px solid" : "1px solid"}
            borderColor={currentView === "payments" ? customColor : `${customColor}30`}
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
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    All Payments
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : payments.length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg={customColor}
                >
                  <Icon as={MdPayment} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Total Collected Card */}
          <Card
            minH={{ base: "55px", md: "60px" }}
            cursor="pointer"
            onClick={() => setCurrentView("revenue")}
            border={currentView === "revenue" ? "2px solid" : "1px solid"}
            borderColor={currentView === "revenue" ? customColor : `${customColor}30`}
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
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Total Collected
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : formatINR(walletDetails.totalCollected)}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg="green.500"
                >
                  <Icon as={FaRupeeSign} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Total Commission Card */}
          <Card
            minH={{ base: "55px", md: "60px" }}
            cursor="pointer"
            onClick={() => setCurrentView("wallets")}
            border={currentView === "wallets" ? "2px solid" : "1px solid"}
            borderColor={currentView === "wallets" ? customColor : `${customColor}30`}
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
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Total Commission
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : formatINR(walletDetails.totalCommission)}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg="purple.500"
                >
                  <Icon as={FaChartLine} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        </Grid>
      </Box>

      {/* Scrollable Table Container */}
      <Box display="flex" flexDirection="column" p={4} pt={0} flex="1" overflow="hidden">
        <Card
          shadow="lg"
          bg="white"
          display="flex"
          flexDirection="column"
          maxH="100%"
          overflow="hidden"
        >
          {/* Fixed Table Header */}
          <CardHeader
            p="10px 16px"
            pb="8px"
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
                {currentView === "services" && "🛠️ Service Bookings"}
                {currentView === "payments" && "💳 Payments"}
                {currentView === "wallets" && "💳 Payments"}
                {currentView === "revenue" && "💰 Revenue Report"}
              </Heading>
              <Flex
                align="center"
                flex={{ base: "none", sm: "1" }}
                maxW={{ base: "100%", sm: "400px" }}
                minW={{ base: "0", sm: "200px" }}
                w="100%"
                mx={{ sm: 4 }}
              >
                <InputGroup size="sm">
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                    fontSize="sm"
                    borderRadius="md"
                  />
                  <InputRightElement color="gray.400">
                    <FaSearch size="12px" />
                  </InputRightElement>
                </InputGroup>
              </Flex>

              <HStack spacing={4}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FaArrowLeft />}
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  color="gray.600"
                  fontWeight="bold"
                  fontSize="sm"
                  _hover={{ bg: "transparent", color: customColor }}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fontWeight="bold"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  px={6}
                  bg="white"
                  onClick={() => {
                    if (currentView === "services") {
                      const rows = prepareServicesExportRows();
                      exportToCSV(`services_export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                    } else if (currentView === "payments") {
                      const rows = preparePaymentsExportRows();
                      exportToCSV(`payments_export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                    }
                  }}
                >
                  Export
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          {/* Scrollable Table Content Area */}
          <CardBody bg="white" display="flex" flexDirection="column" p={0} overflow="hidden">
            {isLoading ? (
              <Flex justify="center" align="center" py={6} flex="1">
                <Spinner size="lg" color={customColor} />
                <Text ml={3} fontSize="sm">Loading data...</Text>
              </Flex>
            ) : (
              <Box display="flex" flexDirection="column" overflow="hidden">
                {/* Desktop Table View */}
                <Box display={{ base: "none", md: "block" }} overflow="auto" css={globalScrollbarStyles}>
                  {currentView === "services" && (
                    <Table variant="simple" size="sm" bg="transparent">
                      <Thead>
                        <Tr>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            #
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Customer
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Service
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Amount
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Status
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Payment
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Date
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentSlice.length > 0 ? (
                          currentSlice.map((booking, idx) => (
                            <Tr key={booking._id || idx} borderBottom="1px" borderColor={`${customColor}20`} _hover={{ bg: `${customColor}10` }}>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>{indexOfFirstItem + idx + 1}</Td>
                              <ServiceBookingRow booking={booking} />
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={8} textAlign="center" py={6}>
                              <Text fontSize="xs">No bookings found.</Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  )}

                  {currentView === "payments" && (
                    <Table variant="simple" size="sm" bg="transparent">
                      <Thead>
                        <Tr>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            #
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Payment ID
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Order ID
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Amount
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Method
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Status
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentSlice.length > 0 ? (
                          currentSlice.map((payment, idx) => (
                            <Tr key={payment._id || idx} borderBottom="1px" borderColor={`${customColor}20`} _hover={{ bg: `${customColor}10` }}>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>{indexOfFirstItem + idx + 1}</Td>
                              <PaymentRow payment={payment} />
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={6}>
                              <Text fontSize="xs">No payments found.</Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  )}

                  {currentView === "wallets" && (
                    <Table variant="simple" size="sm" bg="transparent">
                      <Thead>
                        <Tr>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            #
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Technician
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Balance
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Amount
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Status
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Date
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentSlice.length > 0 ? (
                          currentSlice.map((wallet, idx) => (
                            <Tr key={wallet._id || idx} borderBottom="1px" borderColor={`${customColor}20`} _hover={{ bg: `${customColor}10` }}>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>{indexOfFirstItem + idx + 1}</Td>
                              <WalletRow wallet={wallet} />
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={7} textAlign="center" py={6}>
                              <Text fontSize="xs">No wallet records found.</Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  )}

                  {currentView === "revenue" && (
                    <Table variant="simple" size="sm" bg="transparent">
                      <Thead>
                        <Tr>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={3}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            #
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={3}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Metric
                          </Th>
                          <Th
                            color="gray.100"
                            borderColor={`${customColor}30`}
                            position="sticky"
                            top={0}
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={3}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Amount
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(() => {
                          const totalWithdrawals = wallets.reduce((sum, w) => {
                            return w.status !== 'rejected' ? sum + (Number(w.amount) || 0) : sum;
                          }, 0);

                          const totalCollected = walletDetails.totalCollected || 0;
                          const totalCommission = walletDetails.totalCommission || 0;
                          const technicianBalance = totalCollected - totalCommission;
                          const availableBalance = technicianBalance - totalWithdrawals;

                          const metrics = [
                            { name: "Total Collected", amount: totalCollected, color: "green.600" },
                            { name: "Total Commission", amount: -totalCommission, color: "red.500" },
                            { name: "Technician Balance", amount: technicianBalance, color: "blue.600" },
                            { name: "Withdrawals", amount: -totalWithdrawals, color: "red.500" },
                            { name: "Available Balance", amount: availableBalance, color: "purple.600" },
                          ];

                          return metrics.map((metric, idx) => (
                            <Tr key={idx} borderBottom="1px" borderColor={`${customColor}20`} _hover={{ bg: `${customColor}10` }}>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>{idx + 1}</Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2} fontWeight="medium">{metric.name}</Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2} fontWeight="bold" color={metric.color}>
                                {metric.amount >= 0 ? formatINR(metric.amount) : `- ${formatINR(Math.abs(metric.amount))}`}
                              </Td>
                            </Tr>
                          ));
                        })()}
                      </Tbody>
                    </Table>
                  )}
                </Box>

                {/* Mobile Card View */}
                <Box
                  display={{ base: "block", md: "none" }}
                  overflow="auto"
                  px={3}
                  py={2}
                  css={globalScrollbarStyles}
                >
                  {currentView === "services" && (
                    currentSlice.length > 0 ? (
                      currentSlice.map((booking, idx) => (
                        <ServiceMobileCard
                          key={booking._id || idx}
                          booking={booking}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          onViewDetails={openModalForBooking}
                          users={users}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={FiCalendar} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No bookings found</Text>
                        </VStack>
                      </Center>
                    )
                  )}

                  {currentView === "payments" && (
                    currentSlice.length > 0 ? (
                      currentSlice.map((payment, idx) => (
                        <PaymentMobileCard
                          key={payment._id || idx}
                          payment={payment}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          onUpdatePayment={handleUpdatePaymentStatus}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={MdPayment} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No payments found</Text>
                        </VStack>
                      </Center>
                    )
                  )}

                  {currentView === "wallets" && (
                    currentSlice.length > 0 ? (
                      currentSlice.map((wallet, idx) => (
                        <WalletMobileCard
                          key={wallet._id || idx}
                          wallet={wallet}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          technicianMap={technicianMap}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={FaWallet} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No wallet records found</Text>
                        </VStack>
                      </Center>
                    )
                  )}

                  {currentView === "revenue" && (
                    <Box p={4}>
                      <VStack spacing={3}>
                        <Box p={3} bg="white" borderWidth="1px" borderColor={`${customColor}20`} borderRadius="md" shadow="sm" w="100%">
                          <Text fontSize="xs" color="gray.500">Total Collected</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">{formatINR(walletDetails.totalCollected)}</Text>
                        </Box>
                        <Box p={3} bg="white" borderWidth="1px" borderColor={`${customColor}20`} borderRadius="md" shadow="sm" w="100%">
                          <Text fontSize="xs" color="gray.500">Total Commission</Text>
                          <Text fontSize="lg" fontWeight="bold" color="red.500">{formatINR(walletDetails.totalCommission)}</Text>
                        </Box>
                        <Box p={3} bg="white" borderWidth="1px" borderColor={`${customColor}20`} borderRadius="md" shadow="sm" w="100%">
                          <Text fontSize="xs" color="gray.500">Available Balance</Text>
                          <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            {formatINR((walletDetails.totalCollected || 0) - (walletDetails.totalCommission || 0))}
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  )}
                </Box>

                {/* Pagination Controls */}
                {filteredData.length > 0 && currentView !== "revenue" && (
                  <Box
                    flexShrink={0}
                    p="16px"
                    borderTop="1px solid"
                    borderColor={`${customColor}20`}
                    bg="transparent"
                  >
                    <Flex justify="flex-end" align="center" gap={3}>
                      <Flex align="center" gap={2}>
                        <Button
                          size="sm"
                          onClick={handlePrevPage}
                          isDisabled={currentPage === 1}
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
                            borderColor: "gray.300"
                          }}
                        >
                          <Text display={{ base: "none", sm: "block" }}>Previous</Text>
                        </Button>

                        <Flex
                          align="center"
                          gap={2}
                          bg={`${customColor}10`}
                          px={3}
                          py={1}
                          borderRadius="6px"
                          minW="80px"
                          justify="center"
                        >
                          <Text fontSize="sm" fontWeight="bold" color={customColor}>
                            {currentPage}
                          </Text>
                          <Text fontSize="sm" color="gray.500">/</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {totalPages}
                          </Text>
                        </Flex>

                        <Button
                          size="sm"
                          onClick={handleNextPage}
                          isDisabled={currentPage === totalPages}
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
                            borderColor: "gray.300"
                          }}
                        >
                          <Text display={{ base: "none", sm: "block" }}>Next</Text>
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                )}
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* Service Booking Details Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={closeBookingModal} size="xl">
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader color="gray.700">Service Booking Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {selectedBooking && (
              <VStack spacing={4} align="stretch">
                {/* Header */}
                <Flex align="center" gap={4} mb={2}>
                  <Avatar
                    size="lg"
                    name={(() => {
                      const foundUser = (typeof selectedBooking.customerProfileId === 'string')
                        ? users.find(u => u._id === selectedBooking.customerProfileId || u.userId === selectedBooking.customerProfileId)
                        : null;

                      return (
                        (selectedBooking.customerId?.fname || selectedBooking.customerId?.lname) ? `${selectedBooking.customerId.fname || ""} ${selectedBooking.customerId.lname || ""}` :
                          (selectedBooking.addressSnapshot?.name) ? selectedBooking.addressSnapshot.name :
                            (typeof selectedBooking.customerProfileId === 'object' && (selectedBooking.customerProfileId?.firstName || selectedBooking.customerProfileId?.lastName)) ? `${selectedBooking.customerProfileId.firstName || ""} ${selectedBooking.customerProfileId.lastName || ""}` :
                              (foundUser) ? (`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.name) :
                                "Customer"
                      );
                    })()}
                  />
                  <Box>
                    <Heading size="md" color="gray.700">
                      Booking #{selectedBooking._id?.substring(selectedBooking._id.length - 6)}
                    </Heading>
                    <Badge
                      bg={getStatusColor(selectedBooking.status).bg}
                      color="white"
                      mt={1}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                    >
                      {selectedBooking.status}
                    </Badge>
                  </Box>
                </Flex>

                {/* Service Details */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Service Information</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Service Name</Text>
                      <Text fontSize="sm" fontWeight="medium">{selectedBooking.serviceId?.serviceName || "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Service Type</Text>
                      <Text fontSize="sm">{selectedBooking.serviceId?.serviceType || "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Base Amount</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.600">₹{selectedBooking.baseAmount || 0}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Scheduled At</Text>
                      <Text fontSize="sm">{formatDateTime(selectedBooking.scheduledAt || selectedBooking.createdAt)}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Customer Details */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Customer Details</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Name</Text>
                      <Text fontSize="sm">
                        {(() => {
                          const foundUser = (typeof selectedBooking.customerProfileId === 'string')
                            ? users.find(u => u._id === selectedBooking.customerProfileId || u.userId === selectedBooking.customerProfileId)
                            : null;

                          return (
                            (selectedBooking.customerId?.fname || selectedBooking.customerId?.lname) ? `${selectedBooking.customerId.fname || ""} ${selectedBooking.customerId.lname || ""}` :
                              (selectedBooking.addressSnapshot?.name) ? selectedBooking.addressSnapshot.name :
                                (typeof selectedBooking.customerProfileId === 'object' && (selectedBooking.customerProfileId?.firstName || selectedBooking.customerProfileId?.lastName)) ? `${selectedBooking.customerProfileId.firstName || ""} ${selectedBooking.customerProfileId.lastName || ""}` :
                                  (foundUser) ? (`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.name) :
                                    "—"
                          );
                        })()}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Phone</Text>
                      <Text fontSize="sm">
                        {selectedBooking.customerId?.mobileNumber ||
                          selectedBooking.addressSnapshot?.phone ||
                          (typeof selectedBooking.customerProfileId === 'object' ? selectedBooking.customerProfileId?.mobileNumber : null) ||
                          "—"}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Address */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Service Address</Text>
                  <Text fontSize="sm">
                    {selectedBooking.addressSnapshot?.address || selectedBooking.address || "—"}
                    {selectedBooking.addressSnapshot?.city && `, ${selectedBooking.addressSnapshot.city}`}
                    {selectedBooking.addressSnapshot?.state && `, ${selectedBooking.addressSnapshot.state}`}
                    {selectedBooking.addressSnapshot?.pincode && ` - ${selectedBooking.addressSnapshot.pincode}`}
                  </Text>
                </Box>

                {/* Payment Status */}
                <Box bg={`${customColor}05`} p={4} borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">Payment Status</Text>
                      <Text fontSize="xs" color="gray.500">Payment ID: {selectedBooking.paymentId || "N/A"}</Text>
                    </Box>
                    <Badge
                      colorScheme={selectedBooking.paymentStatus === "paid" ? "green" : "orange"}
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {selectedBooking.paymentStatus || "Pending"}
                    </Badge>
                  </Flex>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}