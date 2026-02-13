// billing
// CleanedBilling.js (Mobile-friendly table / compact-scroll version)
// Updated to keep table layout but be responsive & mobile-friendly.
// - Horizontal scroll on small screens
// - Compact table sizes on mobile
// - Filters & search stacked on mobile
// - Pagination buttons full-width / touch-friendly on mobile
// - Bugfix: Confirm_Order calls fetchOrders()
// - Keep rest of features identical to original file

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

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
} from "@chakra-ui/react";

import { FaSearch, FaChevronLeft, FaChevronRight, FaArrowLeft, FaTimes, FaEye, FaCheckCircle } from "react-icons/fa";
import { FiMoreVertical, FiEye, FiDownload, FiUser, FiCalendar, FiTruck } from "react-icons/fi";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdCategory } from "react-icons/md";

import { UpdatePaymentStatus, getAllServiceBooking, updateOrders, getAllUsers, getAllWallets, approveWithdrawal, rejectWithdrawal, getTotalWalletsDetails, getTechnicianById } from "../utils/axiosInstance";

// Lightweight presentational Card components so this file is self-contained.
const Card = ({ children, ...props }) => <Box borderRadius="12px" p={0} {...props}>{children}</Box>;
const CardHeader = ({ children, ...props }) => <Box px="16px" py="12px" borderBottomWidth="1px" {...props}>{children}</Box>;
const CardBody = ({ children, ...props }) => <Box p="16px" {...props}>{children}</Box>;

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
const DEFAULT_CUSTOM_HOVER = "#5a189a";

const STATUS_COLORS = {
  delivered: { bg: "#10B981", color: "white" },
  confirmed: { bg: "#3B82F6", color: "white" },
  pending: { bg: "#F59E0B", color: "white" },
  completed: { bg: "#10B981", color: "white" },
  broadcasted: { bg: "#8B5CF6", color: "white" },
  requested: { bg: "#3B82F6", color: "white" },
  cancelled: { bg: "#EF4444", color: "white" },
  default: { bg: "#6366F1", color: "white" },
};

const ORDER_STATUS_OPTIONS = ["all", "pending", "confirmed", "delivered", "completed", "failed", "refunded"];
const PAYMENT_METHOD_OPTIONS = ["all", "card", "upi", "netbanking", "cod", "wallet", "bank_transfer"];
const PAYMENT_STATUS_OPTIONS = ["all", "success", "failed", "refunded", "pending"];

/** Main component **/
export default function CleanedBilling() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.800");
  const toast = useToast();

  const customColor = DEFAULT_CUSTOM_COLOR;
  const customHoverColor = DEFAULT_CUSTOM_HOVER;

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
  const [technicianMap, setTechnicianMap] = useState({}); // Cache for technician details
  const [serviceBookings, setServiceBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const payments = useMemo(() => {
    const list = [];

    // Include Paid Service Bookings in Payments Table
    (serviceBookings || []).forEach((s) => {
      const status = (safeGet(s, "paymentStatus", "") || "").toString().toLowerCase();
      if (status === "paid" || status === "success") {
        const pObj = safeGet(s, "payment", {}) || {};
        list.push({
          _id: safeGet(s, "paymentId") || safeGet(s, "payment._id") || safeGet(s, "razorpayPaymentId") || `SB-${safeGet(s, "_id")}`,
          razorpayOrderId: safeGet(s, "razorpayOrderId") || safeGet(pObj, "razorpayOrderId") || "N/A",
          orderId: safeGet(s, "_id", "UNKNOWN"), // Use Booking ID
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

  const [users, setUsers] = useState([]); // Add users state

  const [currentView, setCurrentView] = useState("services");
  const [filteredData, setFilteredData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 220);

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDatePreset, setOrderDatePreset] = useState("all");

  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentDatePreset, setPaymentDatePreset] = useState("all");
  const [state, setState] = useState("")

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (searchRef?.current) searchRef.current.focus();
      }
      if (e.key === "Escape") {
        // Clear search on Esc for quick mobile UX
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fetching orders
  // Fetching orders removed


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
      // Handle different response formats similar to UserManagement.js
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

  // Fetch technician details for wallets
  useEffect(() => {
    const fetchTechnicianDetails = async () => {
      if (!wallets || wallets.length === 0) return;

      const uniqueTechIds = [...new Set(wallets.map(w => w.technicianId?._id || w.technicianProfileId || w.providerId?._id || w.providerId).filter(id => id && typeof id === 'string'))];

      const newIdsToFetch = uniqueTechIds.filter(id => !technicianMap[id]);

      if (newIdsToFetch.length === 0) return;

      // Update map with loading placeholders (optional, or just fetch directly)
      // setTechnicianMap(prev => { ...prev, ...Object.fromEntries(newIdsToFetch.map(id => [id, { loading: true }])) });

      try {
        const results = await Promise.allSettled(
          newIdsToFetch.map(async (id) => {
            try {
              const data = await getTechnicianById(id);
              // Handle different response structures: result, data, or direct object
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
  }, [wallets]); // Depend on wallets list updates

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



  // Filtering logic
  // Fixed: Removed filteredOrders since orders are removed.


  const filteredWallets = useMemo(() => {
    return (wallets || []).filter((w) => {
      // Basic filtering - extend as needed
      return true;
    });
  }, [wallets]);

  const filteredPayments = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();
    const [payStart, payEnd] = getDateRangePreset(paymentDatePreset);

    return (payments || []).filter((p) => {
      const method = (safeGet(p, "method", "") || "").toString().toLowerCase();
      if (paymentMethodFilter !== "all" && method !== paymentMethodFilter) return false;

      const status = (safeGet(p, "status", "") || "").toString().toLowerCase();
      if (paymentStatusFilter !== "all" && status !== paymentStatusFilter) return false;

      let createdAt = null;
      if (safeGet(p, "createdAt", null)) createdAt = new Date(safeGet(p, "createdAt")).getTime();
      else if (safeGet(p, "orderRef.createdAt", null)) createdAt = new Date(safeGet(p, "orderRef.createdAt")).getTime();

      if (payStart != null) {
        if (createdAt == null) return false;
        if (!(createdAt >= payStart && createdAt <= payEnd)) return false;
      }

      if (!q) return true;
      const pid = (safeGet(p, "_id", "") || "").toString().toLowerCase();
      const razor = (safeGet(p, "razorpayOrderId", "") || "").toString().toLowerCase();
      const orderId = (safeGet(p, "orderId", "") || "").toString().toLowerCase();
      return pid.includes(q) || razor.includes(q) || orderId.includes(q) || method.includes(q) || status.includes(q);
    });
  }, [payments, debouncedSearch, paymentMethodFilter, paymentStatusFilter, paymentDatePreset]);

  const filteredServices = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();
    return (serviceBookings || []).filter((s) => {
      const id = (safeGet(s, "_id", "") || "").toString().toLowerCase();

      const customerName = (
        (s.customerId?.fname || s.customerId?.lname) ? `${s.customerId.fname || ""} ${s.customerId.lname || ""}` :
          (s.addressSnapshot?.name) ? s.addressSnapshot.name :
            (s.customerProfileId?.firstName || s.customerProfileId?.lastName) ? `${s.customerProfileId.firstName || ""} ${s.customerProfileId.lastName || ""}` :
              "—"
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
  }, [serviceBookings, debouncedSearch]);

  // Pagination

  const totalPages = useMemo(() => {
    let len = 0;
    if (currentView === "services") len = filteredServices.length;
    else if (currentView === "wallets") len = filteredWallets.length;
    else len = filteredPayments.length;
    return Math.max(1, Math.ceil(len / itemsPerPage));
  }, [currentView, filteredPayments, filteredServices, filteredWallets, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentView, debouncedSearch, orderStatusFilter, paymentMethodFilter, paymentStatusFilter, orderDatePreset, paymentDatePreset, itemsPerPage]);

  const currentSlice = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    if (currentView === "services") return filteredServices.slice(start, end);
    if (currentView === "wallets") return filteredWallets.slice(start, end);
    return filteredPayments.slice(start, end);
  }, [currentPage, itemsPerPage, currentView, filteredPayments, filteredServices, filteredWallets]);

  // UI helpers
  const getStatusColor = (status) => {
    if (!status) return STATUS_COLORS.default;
    const n = status.toString().toLowerCase();
    return STATUS_COLORS[n] || STATUS_COLORS.default;
  };

  const openModalForOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
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

  const prepareOrdersExportRows = () => {
    return (filteredOrders || []).map((o) => ({
      orderId: safeGet(o, "_id", ""),
      email: safeGet(o, "user.email", ""),
      items: (safeGet(o, "orderItems", []) || []).map((it) => `${safeGet(it, "name", "")} x${safeGet(it, "qty", 1)}`).join("; "),
      amount: safeGet(o, "total_amount", 0),
      status: safeGet(o, "status", ""),
      createdAt: safeGet(o, "createdAt", ""),
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

  const prepareServicesExportRows = () => {
    return (filteredServices || []).map((s) => ({
      bookingId: safeGet(s, "_id", ""),
      customer: `${safeGet(s, "customerProfileId.firstName", "")} ${safeGet(s, "customerProfileId.lastName", "")}`,
      service: safeGet(s, "serviceId.serviceName", ""),
      amount: safeGet(s, "baseAmount", 0),
      status: safeGet(s, "status", ""),
      paymentStatus: safeGet(s, "paymentStatus", ""),
      scheduledAt: safeGet(s, "scheduledAt", ""),
    }));
  };

  // Fixed Confirm_Order (calls fetchOrders)
  const Confirm_Order = async () => {
    try {
      const orderId = safeGet(selectedOrder, "_id");
      await updateOrders(orderId, { status: "confirmed" });

      toast({
        title: "Order Confirmed",
        description: `Order ${orderId} marked as confirmed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchOrders();
      closeModal();
    } catch (error) {
      console.error("Error confirming order:", error);
      toast({
        title: "Error",
        description: "Failed to confirm the order. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const ShipingDate = async () => {
    console.log(state)
    try {
      const orderId = safeGet(selectedOrder, "_id");
      await updateOrders(orderId, { ShipingDate: state });

      toast({
        title: "Shipment Date",
        description: `Shipment Date :${state}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchOrders();
      closeModal();
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast({
        title: "Error",
        description: "Failed to mark the order as delivered. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const markAsDelivered = async () => {
    try {
      const orderId = safeGet(selectedOrder, "_id");
      await updateOrders(orderId, { status: "delivered" });

      toast({
        title: "Order Delivered",
        description: `Order ${orderId} marked as delivered.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchOrders();
      closeModal();
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast({
        title: "Error",
        description: "Failed to mark the order as delivered. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
      await fetchServiceBookings(); // replaced fetchOrders
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

  useEffect(() => {
    if (currentView === "services") {
      setFilteredData(filteredServices);
    } else if (currentView === "wallets") {
      setFilteredData(filteredWallets);
    } else {
      setFilteredData(filteredPayments);
    }
  }, [currentView, filteredPayments, filteredServices, filteredWallets]);

  // Row components
  const OrderRow = ({ order }) => {
    const status = safeGet(order, "status", "pending");
    return (
      <Tr _hover={{ bg: "gray.50", cursor: "pointer" }} borderBottom="1px solid" borderColor="gray.100">
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" color="gray.700" fontSize={isMobile ? "sm" : "md"}>{safeGet(order, "user.email", "—")}</Text>
            <Text fontSize={isMobile ? "xs" : "sm"} color="gray.600">{safeGet(order, "user._id", "")}</Text>
            <Text fontSize="xs" color="gray.500">{safeGet(order, "orderItems.length", 0)} items</Text>
          </VStack>
        </Td>

        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium" fontSize={isMobile ? "sm" : "md"}>{safeGet(order, "address.city", "—")} ({safeGet(order, "address.pincode", "—")})</Text>
            <Text fontSize="xs" color="gray.500">{safeGet(order, "address.state", "—")}</Text>
            <Text fontSize="xs" color="gray.500">{safeGet(order, "address.country", "—")}</Text>
          </VStack>
        </Td>

        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium" fontSize={isMobile ? "sm" : "md"}>{formatINR(safeGet(order, "total_amount", 0))}</Text>
            <Text fontSize="xs" color="gray.500">{new Date(safeGet(order, "createdAt", Date.now())).toLocaleDateString()}</Text>
          </VStack>
        </Td>

        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <Badge bg={getStatusColor(status).bg} color={getStatusColor(status).color} px={3} py={1} borderRadius="full" fontSize={isMobile ? "xs" : "sm"} fontWeight="bold">
            {String(status).toUpperCase()}
          </Badge>
        </Td>

        <Td borderColor={`${customColor}20`}>
          <Flex gap={2}>
            <IconButton
              aria-label="View bill"
              icon={<FaEye />}
              bg="white"
              color="green.500"
              border="1px"
              borderColor="green.500"
              _hover={{ bg: "green.500", color: "white" }}
              size="sm"
              onClick={() => openModalForOrder(order)}
            />
            {/* {order.status !== "paid" && (
                                        <IconButton
                                          aria-label="Mark as paid"
                                          icon={<FaCheckCircle />}
                                          bg="white"
                                          color={customColor}
                                          border="1px"
                                          borderColor={customColor}
                                          _hover={{ bg: customColor, color: "white" }}
                                          size="sm"
                                          onClick={() => {Confirm_Order(selectedOrder)}}
                                        />
                                      )} */}
          </Flex>
        </Td>

      </Tr>
    );
  };

  const PaymentRow = ({ payment }) => {
    const status = safeGet(payment, "status", "pending");
    const paymentId = safeGet(payment, "_id", null);

    return (
      <Tr borderBottom="1px solid" borderColor="gray.100">
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Text fontWeight="semibold" fontSize={isMobile ? "sm" : "md"}>{safeGet(payment, "razorpayOrderId", safeGet(payment, "_id", "—"))}</Text></Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Text color="gray.700" fontSize={isMobile ? "sm" : "md"}>{safeGet(payment, "orderId", "—")}</Text></Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Text fontWeight="bold" color="gray.800" fontSize={isMobile ? "md" : "lg"}>{formatINR(safeGet(payment, "amount", 0))}</Text></Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Badge variant="outline" colorScheme="blue" fontSize={isMobile ? "xs" : "sm"}>{safeGet(payment, "method", "UNKNOWN")}</Badge></Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Badge bg={getStatusColor(status).bg} color={getStatusColor(status).color} px={3} py={1} borderRadius="full" fontSize={isMobile ? "xs" : "sm"} fontWeight="bold">{String(status).toUpperCase()}</Badge></Td>
        <Td>
          <IconButton
            aria-label="Update Payment Status"
            icon={<FaCheckCircle />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => handleUpdatePaymentStatus(paymentId)}
            tooltip="Refresh Payment Status"
            isDisabled={!paymentId || (typeof paymentId === 'string' && paymentId.startsWith('SB-'))}
          />
        </Td>
      </Tr>
    );
  };

  const ServiceBookingRow = ({ booking }) => {
    const status = safeGet(booking, "status", "requested");
    const payStatus = safeGet(booking, "paymentStatus", "pending");

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

    const customerPhone = (
      booking.customerId?.mobileNumber ||
      booking.addressSnapshot?.phone ||
      (typeof booking.customerProfileId === 'object' ? booking.customerProfileId?.mobileNumber : null) ||
      (foundUser?.mobileNumber || foundUser?.phone) ||
      "—"
    );

    return (
      <Tr borderBottom="1px solid" borderColor="gray.100" _hover={{ bg: "gray.50" }}>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" fontSize={isMobile ? "sm" : "md"}>{customerName}</Text>
            <Text fontSize="xs" color="gray.500">{customerPhone}</Text>
          </VStack>
        </Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Text fontSize={isMobile ? "sm" : "md"}>{safeGet(booking, "serviceId.serviceName", "—")}</Text></Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Text fontWeight="bold" fontSize={isMobile ? "md" : "lg"}>{formatINR(safeGet(booking, "baseAmount", 0))}</Text></Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <Badge bg={getStatusColor(status).bg} color={getStatusColor(status).color} px={3} py={1} borderRadius="full" fontSize={isMobile ? "xs" : "sm"} fontWeight="bold">
            {String(status).toUpperCase()}
          </Badge>
        </Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}>
          <Badge variant="solid" colorScheme={payStatus === "paid" ? "green" : "orange"} fontSize={isMobile ? "xs" : "sm"}>
            {String(payStatus).toUpperCase()}
          </Badge>
        </Td>
        <Td px={isMobile ? 3 : 6} py={isMobile ? 2 : 3}><Text fontSize="xs" color="gray.500">{new Date(safeGet(booking, "scheduledAt", Date.now())).toLocaleDateString()}</Text></Td>
        <Td>
          <Flex gap={2}>
            <IconButton
              aria-label="View booking details"
              icon={<FaEye />}
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={() => openModalForBooking(booking)}
            />
            {(() => {
              const payId = safeGet(booking, "paymentId") || safeGet(booking, "payment._id");
              // Only show button if we have a valid Mongo ID
              if (payId && /^[0-9a-fA-F]{24}$/.test(payId)) {
                return (
                  <IconButton
                    aria-label="Update Payment Status"
                    icon={<FaCheckCircle />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => handleUpdatePaymentStatus(payId)}
                    tooltip="Refresh Payment Status"
                  />
                );
              }
              return null;
            })()}
          </Flex>
        </Td>
      </Tr>
    );
  };

  const WalletRow = ({ wallet, technicianMap }) => {
    // Determine technician name safely
    const techId = wallet.technicianId?._id || wallet.technicianProfileId || wallet.providerId?._id || (typeof wallet.providerId === 'string' ? wallet.providerId : null);

    // Check map first, then existing object structure
    const techData = technicianMap && techId ? technicianMap[techId] : null;

    let displayName = "Unknown";

    if (techData) {
      // Data from API fetch
      // API returns userId object inside technician response
      if (techData.userId && (techData.userId.fname || techData.userId.lname)) {
        displayName = `${techData.userId.fname || ""} ${techData.userId.lname || ""}`.trim();
      } else if (techData.userId && (techData.userId.firstName || techData.userId.lastName)) {
        displayName = `${techData.userId.firstName || ""} ${techData.userId.lastName || ""}`.trim();
      } else if (techData.name) {
        displayName = techData.name;
      } else if (techData.firstName) {
        displayName = `${techData.firstName} ${techData.lastName || ""}`.trim();
      }
    } else {
      // Fallback to embedded data if fetch failed or not yet loaded
      displayName =
        wallet.providerId?.name ||
        wallet.providerId?.firstName ||
        (wallet.providerId?.firstName && wallet.providerId?.lastName ? `${wallet.providerId.firstName} ${wallet.providerId.lastName}` : null) ||
        "Unknown";
    }

    return (
      <Tr borderBottom="1px solid" borderColor="gray.100">
        <Td><Text fontSize="sm">{displayName}</Text></Td>
        <Td><Text fontWeight="bold" color="green.600">{formatINR(wallet.technicianId?.walletBalance)}</Text></Td>
        <Td><Text fontWeight="bold">{formatINR(wallet.amount)}</Text></Td>
        <Td>
          <Badge colorScheme={wallet.status === "approved" ? "green" : wallet.status === "rejected" ? "red" : "yellow"}>
            {wallet.status}
          </Badge>
        </Td>
        <Td><Text fontSize="xs">{new Date(wallet.createdAt).toLocaleDateString()}</Text></Td>
        <Td>
          {wallet.status === "pending" && (
            <HStack spacing={2}>
              <Button size="xs" colorScheme="green" onClick={() => handleApproveWithdrawal(wallet._id)}>Approve</Button>
              <Button size="xs" colorScheme="red" onClick={() => handleRejectWithdrawal(wallet._id)}>Reject</Button>
            </HStack>
          )}
        </Td>
      </Tr>
    );
  };

  if (!currentUser) {
    return (
      <Center minH="300px">
        <Spinner />
        <Text ml={3}>Checking user...</Text>
      </Center>
    );
  }

  const searchPlaceholder = currentView === "orders"
    ? "Search orders by ID, email, product, city, pincode..."
    : currentView === "services"
      ? "Search services by ID, customer, service name, status..."
      : "Search payments by payment ID, method, or order ID...";

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "5px", md: "45px" }}
      height="100vh"
      overflow="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
          borderRadius: '24px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent',
          borderRadius: '24px',
          transition: 'background 0.3s ease',
        },
        '&:hover::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
        },
        '&:hover::-webkit-scrollbar-thumb:hover': {
          background: '#94a3b8',
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '&:hover': {
          scrollbarColor: '#cbd5e1 transparent',
        },
      }}
    >

      <Box mb="24px">

        <Flex
          direction="row"
          wrap="wrap"
          justify="center"
          gap={{ base: 3, md: 4 }}
          overflowX="auto"
          py={2}
          css={{
            '&::-webkit-scrollbar': {
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
          }}
        >

          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => setCurrentView("wallets")}
            border={currentView === "wallets" ? "2px solid" : "1px solid"}
            borderColor={currentView === "wallets" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
              transform: "translateY(-4px)",
              shadow: "xl",
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%" padding={5}>
                <Stat me="auto">
                  <StatLabel fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="bold" pb="0px">
                    Available Balance
                  </StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>
                    {isLoading ? <Spinner size="xs" /> : formatINR(walletDetails.availableBalance)}
                  </StatNumber>
                </Stat>
                <Box display="flex" alignItems="center" justifyContent="center" borderRadius="10px" h="34px" w="34px" bg={customColor}>
                  <Icon as={MdCategory} h="16px" w="16px" color="white" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Total Collected Card */}
          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => setCurrentView("wallets")}
            border={currentView === "wallets" ? "2px solid" : "1px solid"}
            borderColor={currentView === "wallets" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
              transform: "translateY(-4px)",
              shadow: "xl",
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%" padding={5}>
                <Stat me="auto">
                  <StatLabel fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="bold" pb="0px">
                    Total Collected
                  </StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>
                    {isLoading ? <Spinner size="xs" /> : formatINR(walletDetails.totalCollected)}
                  </StatNumber>
                </Stat>
                <Box display="flex" alignItems="center" justifyContent="center" borderRadius="10px" h="34px" w="34px" bg={customColor}>
                  <Icon as={MdCategory} h="16px" w="16px" color="white" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Total Commission Card */}
          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => setCurrentView("wallets")}
            border={currentView === "wallets" ? "2px solid" : "1px solid"}
            borderColor={currentView === "wallets" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
              transform: "translateY(-4px)",
              shadow: "xl",
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%" padding={5}>
                <Stat me="auto">
                  <StatLabel fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="bold" pb="0px">
                    Total Commission
                  </StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>
                    {isLoading ? <Spinner size="xs" /> : formatINR(walletDetails.totalCommission)}
                  </StatNumber>
                </Stat>
                <Box display="flex" alignItems="center" justifyContent="center" borderRadius="10px" h="34px" w="34px" bg={customColor}>
                  <Icon as={MdCategory} h="16px" w="16px" color="white" />
                </Box>
              </Flex>
            </CardBody>
          </Card>


          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => setCurrentView("payments")}
            border={currentView === "payments" ? "2px solid" : "1px solid"}
            borderColor={currentView === "payments" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
              transform: "translateY(-4px)",
              shadow: "xl",
              _before: {
                opacity: 1,
              },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%" padding={5}>
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="2px"
                  >All Payments</StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>{isLoading ? <Spinner size="xs" /> : payments.length}</StatNumber>
                </Stat>
                <Box display="flex" alignItems="center" justifyContent="center" borderRadius="10px" h="34px" w="34px" bg={customColor}>
                  <Icon as={IoCheckmarkDoneCircleSharp} h="16px" w="16px" color="white" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => setCurrentView("services")}
            border={currentView === "services" ? "2px solid" : "1px solid"}
            borderColor={currentView === "services" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
              transform: "translateY(-4px)",
              shadow: "xl",
              _before: {
                opacity: 1,
              },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%" padding={5}>
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="2px"
                  >Service Bookings</StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>{isLoading ? <Spinner size="xs" /> : serviceBookings.length}</StatNumber>
                </Stat>
                <Box display="flex" alignItems="center" justifyContent="center" borderRadius="10px" h="34px" w="34px" bg={customColor}>
                  <Icon as={FiCalendar} h="16px" w="16px" color="white" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* <Card 
          minH="83px" 
          cursor="pointer" 
          onClick={() => setCurrentView("payments")} 
          border={currentView === "payments" ? "2px solid" : "1px solid"} 
          borderColor={currentView === "payments" ? customColor : `${customColor}30`} 
          transition="all 0.2s ease-in-out" 
          bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
              transform: "translateY(-4px)",
              shadow: "xl",
              _before: {
                opacity: 1,
              },
              borderColor: customColor,
            }}>

            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              
            <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                <Stat me="auto">
                  <StatLabel 
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="2px"
                  >All Payments</StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>{isLoading ? <Spinner size="xs" /> : payments.length}</StatNumber>
                </Stat>

                <Box display="flex" alignItems="center" justifyContent="center" borderRadius="10px" h="34px" w="34px" bg={customColor}>
                  <Icon as={IoCheckmarkDoneCircleSharp} h="16px" w="16px" color="white" />
                </Box>

              </Flex>
            </CardBody>
          </Card> */}

        </Flex>

        {/* Success/Error Message Display */}
        {/* {error && (
          <Text
            color="red.500"
            mb={4}
            p={3}
            border="1px"
            borderColor="red.200"
            borderRadius="md"
            bg="red.50"
          >
            {error}
          </Text>
        )}
        {success && (
          <Text
            color="green.500"
            mb={4}
            p={3}
            border="1px"
            borderColor="green.200"
            borderRadius="md"
            bg="green.50"
          >
            {success}
          </Text>
        )} */}

        {/* Active Filter Display */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {currentView === "payments" && "All Payments"}
            {currentView === "orders" && "All Orders"}
            {currentView === "services" && "Service Bookings"}
          </Text>
          {/* {currentView !== "all" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCardClick("all")}
              border="1px"
              borderColor={customColor}
              color={customColor}
              _hover={{ bg: customColor, color: "white" }}
            >
              Show All Products
            </Button>
          )} */}
        </Flex>

      </Box >

      {/* Table Container */}
      < Box
        mt={- 8
        }
        flex="1"
        display="flex"
        flexDirection="column"
        p={2}
        pt={0}
        overflow="hidden"
      >
        <Card
          shadow="xl"
          bg="transparent"
          display="flex"
          flexDirection="column"
          height="90%"
          minH="0"
          border="none"
        >
          <CardHeader
            p="5px"
            pb="5px"
            padding='5'
            bg="transparent"
            flexShrink={0}
            borderBottom="1px solid"
            borderColor={`${customColor}20`}
          >

            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={4}
            >

              <Heading size="md" flexShrink={0} color="gray.700">
                {currentView === "orders" ? "🛒 Orders" : currentView === "services" ? "🛠️ Service Bookings" : "💳 Payments"}
              </Heading>

              <Flex align="center" flex="1" maxW="400px">

                <InputGroup width="100%">
                  <VisuallyHidden as="label" htmlFor="global-search">Search</VisuallyHidden>
                  <Input
                    id="global-search"
                    ref={searchRef}
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="sm"
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                    fontSize={isMobile ? "sm" : "md"}
                    transition="box-shadow 0.15s ease, border-color 0.15s ease"
                  />
                  <InputRightElement width="3rem">
                    {searchQuery ? (
                      <Tooltip label="Clear search (Esc also clears)">
                        <Button size="xs" onClick={() => setSearchQuery("")} variant="ghost">
                          <Icon as={FaTimes} />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip label="Search (Ctrl + / to focus)">
                        <Box as="span" color="gray.400" pl={1}><Icon as={FaSearch} /></Box>
                      </Tooltip>
                    )}
                  </InputRightElement>
                </InputGroup>
              </Flex>

              <HStack spacing={2} align="center">
                <Button leftIcon={<FaArrowLeft />} size="sm" variant="ghost" onClick={() => {
                  setSearchQuery("");
                  setOrderStatusFilter("all");
                  setPaymentMethodFilter("all");
                  setPaymentStatusFilter("all");
                  setOrderDatePreset("all");
                  setPaymentDatePreset("all");
                  setCurrentView("orders");
                }}>Reset</Button>

                <Button variant="outline" size="sm" borderColor="gray.200" bg={cardBg} onClick={() => {
                  if (currentView === "orders") {
                    const rows = prepareOrdersExportRows();
                    exportToCSV(`orders_export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                  } else if (currentView === "services") {
                    const rows = prepareServicesExportRows();
                    exportToCSV(`services_export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                  } else {
                    const rows = preparePaymentsExportRows();
                    exportToCSV(`payments_export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                  }
                }}>Export</Button>

              </HStack>
            </Flex>

            {/* <Flex mt={3} gap={3} flexWrap="wrap" direction={{ base: "column", md: "row" }}>
              {currentView === "orders" ? (
                <HStack spacing={3} width="100%" flexWrap="wrap">
                  <Box width={{ base: "100%", sm: "48%", md: "auto" }}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Status</Text>
                    <Select size="sm" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} width="100%" bg="white">
                      {ORDER_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </Select>
                  </Box>

                  <Box width={{ base: "100%", sm: "48%", md: "auto" }}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Date</Text>
                    <Select size="sm" value={orderDatePreset} onChange={(e) => setOrderDatePreset(e.target.value)} width="100%" bg="white">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                      <option value="this_year">This Year</option>
                    </Select>
                  </Box>
                </HStack>
              ) : (
                <HStack spacing={3} width="100%" flexWrap="wrap">
                  <Box width={{ base: "100%", sm: "48%", md: "auto" }}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Method</Text>
                    <Select size="sm" value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} width="100%" bg="white">
                      {PAYMENT_METHOD_OPTIONS.map((m) => <option key={m} value={m}>{m === "all" ? "All" : m.toUpperCase()}</option>)}
                    </Select>
                  </Box>

                  <Box width={{ base: "100%", sm: "48%", md: "auto" }}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Status</Text>
                    <Select size="sm" value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} width="100%" bg="white">
                      {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </Select>
                  </Box>

                  <Box width={{ base: "100%", sm: "48%", md: "auto" }}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Date</Text>
                    <Select size="sm" value={paymentDatePreset} onChange={(e) => setPaymentDatePreset(e.target.value)} width="100%" bg="white">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                      <option value="this_year">This Year</option>
                    </Select>
                  </Box>
                </HStack>
              )}
            </Flex> */}

          </CardHeader>

          <CardBody
            bg="transparent"
            flex="1"
            display="flex"
            flexDirection="column"
            p={0}
            overflow="hidden"
          >
            {isLoading ? (
              <Flex justify="center" align="center" py={10} flex="1">
                <Spinner size="xl" color={customColor} />
                <Text ml={3} fontSize="sm">Loading data...</Text>
              </Flex>
            ) : (
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">


                <Box
                  flex="1"
                  display="flex"
                  flexDirection="column"
                  height="400px"
                  overflow="hidden"
                >
                  {/* Responsive Table Wrapper */}
                  <Box
                    flex="1"
                    overflowY="hidden"
                    overflowX="hidden"
                    _hover={{
                      overflowY: "auto",
                      overflowX: "auto",
                    }}
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'transparent',
                        borderRadius: '4px',
                        transition: 'background 0.3s ease',
                      },
                      '&:hover::-webkit-scrollbar-thumb': {
                        background: '#cbd5e1',
                      },
                      '&:hover::-webkit-scrollbar-thumb:hover': {
                        background: '#94a3b8',
                      },
                    }}
                  >
                    {currentView === "wallets" ? (
                      <Table variant="simple" size="md" bg="transparent">
                        <Thead>
                          <Tr>
                            <Th color="gray.600">Technician</Th>
                            <Th color="gray.600">Wallet Balance</Th>
                            <Th color="gray.600">Amount</Th>
                            <Th color="gray.600">Status</Th>
                            <Th color="gray.600">Date</Th>
                            <Th color="gray.600">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentSlice.length > 0 ? (
                            currentSlice.map((w) => (
                              <WalletRow key={w._id} wallet={w} technicianMap={technicianMap} />
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={6} textAlign="center" py={4}>No wallet records found</Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    ) : currentView === "services" ? (
                      <Table variant="simple" size="md" bg="transparent">
                        <Thead>
                          <Tr>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Customer</Th>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Service</Th>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Amount</Th>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Status</Th>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Payment Status</Th>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Scheduled At</Th>
                            <Th color="gray.100" borderColor={`${customColor}30`} position="sticky" top={0} bg={`${customColor}`} zIndex={10} fontWeight="bold" fontSize="sm" py={3} borderBottom="2px solid" borderBottomColor={`${customColor}50`}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentSlice.length === 0 ? (
                            <Tr><Td colSpan={7}><Center py={6}><Text color="gray.500">No bookings found.</Text></Center></Td></Tr>
                          ) : (
                            currentSlice.map((booking) => (
                              <ServiceBookingRow key={booking._id} booking={booking} />
                            ))
                          )}
                        </Tbody>
                      </Table>
                    ) : (
                      <Table variant="simple" size="md" bg="transparent">
                        <Thead>
                          <Tr>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={`${customColor}`}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="sm"
                              py={3}
                              borderBottom="2px solid"
                              borderBottomColor={`${customColor}50`}
                            >Payment ID</Th>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={`${customColor}`}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="sm"
                              py={3}
                              borderBottom="2px solid"
                              borderBottomColor={`${customColor}50`}
                            >Order ID</Th>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={`${customColor}`}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="sm"
                              py={3}
                              borderBottom="2px solid"
                              borderBottomColor={`${customColor}50`}
                            >Amount</Th>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={`${customColor}`}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="sm"
                              py={3}
                              borderBottom="2px solid"
                              borderBottomColor={`${customColor}50`}
                            >Method</Th>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={`${customColor}`}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="sm"
                              py={3}
                              borderBottom="2px solid"
                              borderBottomColor={`${customColor}50`}
                            >Status</Th>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={`${customColor}`}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="sm"
                              py={3}
                              borderBottom="2px solid"
                              borderBottomColor={`${customColor}50`}
                            >Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentSlice.length === 0 ? (
                            <Tr>
                              <Td colSpan={5}>
                                <Center py={6}>
                                  <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>
                                    No payments found.
                                  </Text>
                                </Center>
                              </Td>
                            </Tr>
                          ) : (
                            currentSlice.map((pay) => (
                              <PaymentRow
                                key={safeGet(pay, "_id", safeGet(pay, "orderId", Math.random().toString()))}
                                payment={pay}
                              />
                            ))
                          )}
                        </Tbody>
                      </Table>
                    )}
                  </Box>

                  {/* Pagination controls */}
                  {currentSlice.length > 0 && (
                    <Box
                      flexShrink={0}
                      p="16px"
                      borderTop="1px solid"
                      borderColor={`${customColor}20`}
                      bg="transparent"
                    >
                      <Flex
                        justify="flex-end"
                        align="center"
                        gap={3}
                      >
                        {/* Page Info */}
                        <Text fontSize="sm" color="gray.600" display={{ base: "none", sm: "block" }}>
                          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} {currentView === 'orders' ? 'orders' : currentView === 'services' ? 'bookings' : 'payment'}
                        </Text>

                        {/* Pagination Controls */}
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

                          {/* Page Number Display */}
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
                            <Text fontSize="sm" color="gray.500">
                              /
                            </Text>
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




              </Box>
            )}
          </CardBody>
        </Card>
      </Box >

      {/* Order Details Modal */}
      < Modal isOpen={isModalOpen} onClose={closeModal} size="4xl" isCentered >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" overflow="hidden">
          <ModalHeader bg={`${customColor}`} borderBottom="1px solid" borderColor="gray.200">
            <VStack align="start" spacing={2}>
              <Heading size="md" color={"white"}>Order Details</Heading>
              <Text color="gray.200" fontSize="sm">Manage order status and delivery information</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color={"white"} />
          <ModalBody py={6}>
            {selectedOrder ? (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">{safeGet(selectedOrder, "_id", "—")}</Text>
                    <HStack spacing={4}>
                      <HStack><Icon as={FiUser} color="gray.500" /><Text color="gray.600">{safeGet(selectedOrder, "user.email", "—")}</Text></HStack>
                      <HStack><Icon as={FiCalendar} color="gray.500" /><Text color="gray.600">{new Date(safeGet(selectedOrder, "createdAt", Date.now())).toLocaleString()}</Text></HStack>
                    </HStack>
                  </VStack>

                  <Badge bg={getStatusColor(safeGet(selectedOrder, "status", "")).bg} color={getStatusColor(safeGet(selectedOrder, "status", "")).color} px={4} py={2} borderRadius="full" fontSize="md" fontWeight="bold">
                    {String(safeGet(selectedOrder, "status", "UNKNOWN")).toUpperCase()}
                  </Badge>
                </HStack>

                <Divider />

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>Order Items</Text>
                  <VStack spacing={3} align="stretch">
                    {(safeGet(selectedOrder, "orderItems", []) || []).map((item, index) => (
                      <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                        <HStack spacing={3}>
                          {item?.image ? (
                            <Image alt={safeGet(item, "name", "")} src={item.image} boxSize="50px" objectFit="cover" borderRadius="8px" />
                          ) : (
                            <Box boxSize="50px" display="flex" alignItems="center" justifyContent="center" bg="gray.100" borderRadius="8px"><Text fontSize="xs">No Image</Text></Box>
                          )}
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{safeGet(item, "name", "Unnamed")}</Text>
                            <Text fontSize="sm" color="gray.600">₹{safeGet(item, "price", 0)} × {safeGet(item, "qty", 1)}</Text>
                          </VStack>
                        </HStack>
                        <Text fontWeight="bold" fontSize="lg">₹{(safeGet(item, "price", 0) * safeGet(item, "qty", 1)).toLocaleString()}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Box bg={`${customColor}05`} p={4} borderRadius="lg">
                  <HStack justify="space-between">
                    <Text fontSize="xl" fontWeight="bold">Total Amount</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={customColor}>{formatINR(safeGet(selectedOrder, "total_amount", 0))}</Text>
                  </HStack>
                </Box>

                <HStack spacing={3} justify="flex-end" flexWrap="wrap">

                  <Button leftIcon={<IoCheckmarkDoneCircleSharp />} bg="#3B82F6" _hover={{ bg: "#2563EB" }} color="white" onClick={() => {
                    Confirm_Order();
                  }}>Confirm Order</Button>






                  <Button leftIcon={<FiTruck />} bg="#10B981" _hover={{ bg: "#059669" }} color="white" onClick={ShipingDate} >Shiping Date :
                    <Input width={150} height={5} border={"none"} type="date" onChange={(e) => setState(e.target.value)} />
                  </Button>

                  <Button leftIcon={<FaCheckCircle />} bg="purple.500" _hover={{ bg: "purple.600" }} color="white" onClick={() => {
                    const payId = safeGet(selectedOrder, "payment._id") || safeGet(selectedOrder, "payment_response._id") || safeGet(selectedOrder, "paymentResponse._id");
                    handleUpdatePaymentStatus(payId);
                  }}>Update Payment</Button>

                  <Button leftIcon={<FiTruck />} bg="#10B981" _hover={{ bg: "#059669" }} color="white" onClick={markAsDelivered}>Mark Delivered</Button>

                </HStack>
              </VStack>
            ) : (
              <Center py={6}><Text color="gray.500">No order selected.</Text></Center>
            )}
          </ModalBody>

          <ModalFooter><Button onClick={closeModal}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal >

      {/* Service Booking Details Modal */}
      < Modal isOpen={isBookingModalOpen} onClose={closeBookingModal} size="4xl" isCentered >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" overflow="hidden">
          <ModalHeader bg={`${customColor}`} borderBottom="1px solid" borderColor="gray.200">
            <VStack align="start" spacing={2}>
              <Heading size="md" color={"white"}>Service Booking Details</Heading>
              <Text color="gray.200" fontSize="sm">Full details for the selected service booking</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color={"white"} />
          <ModalBody py={6}>
            {selectedBooking ? (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">{safeGet(selectedBooking, "_id", "—")}</Text>
                    <HStack spacing={4}>
                      <HStack>
                        <Icon as={FiUser} color="gray.500" />
                        <Text color="gray.600">
                          {(() => {
                            const foundUser = (typeof selectedBooking.customerProfileId === 'string')
                              ? users.find(u => u._id === selectedBooking.customerProfileId || u.userId === selectedBooking.customerProfileId)
                              : null;

                            let name = "—";
                            if (selectedBooking.customerId?.fname || selectedBooking.customerId?.lname) {
                              name = `${selectedBooking.customerId.fname || ""} ${selectedBooking.customerId.lname || ""}`;
                            } else if (selectedBooking.addressSnapshot?.name) {
                              name = selectedBooking.addressSnapshot.name;
                            } else if (typeof selectedBooking.customerProfileId === 'object' && (selectedBooking.customerProfileId?.firstName || selectedBooking.customerProfileId?.lastName)) {
                              name = `${selectedBooking.customerProfileId.firstName || ""} ${selectedBooking.customerProfileId.lastName || ""}`;
                            } else if (foundUser) {
                              name = (`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.name);
                            }
                            return name.trim() || "—";
                          })()}
                        </Text>
                      </HStack>
                      <HStack><Icon as={FiCalendar} color="gray.500" /><Text color="gray.600">{new Date(safeGet(selectedBooking, "createdAt", Date.now())).toLocaleString()}</Text></HStack>
                    </HStack>
                  </VStack>

                  <Badge bg={getStatusColor(safeGet(selectedBooking, "status", "")).bg} color={getStatusColor(safeGet(selectedBooking, "status", "")).color} px={4} py={2} borderRadius="full" fontSize="md" fontWeight="bold">
                    {String(safeGet(selectedBooking, "status", "UNKNOWN")).toUpperCase()}
                  </Badge>
                </HStack>

                <Divider />

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Service Information</Text>
                    <VStack align="start" p={4} bg="gray.50" borderRadius="lg" spacing={2} width="100%">
                      <HStack justify="space-between" width="100%">
                        <Text color="gray.600">Service Name:</Text>
                        <Text fontWeight="medium">{safeGet(selectedBooking, "serviceId.serviceName", "—")}</Text>
                      </HStack>
                      <HStack justify="space-between" width="100%">
                        <Text color="gray.600">Service Type:</Text>
                        <Text fontWeight="medium">{safeGet(selectedBooking, "serviceId.serviceType", "—")}</Text>
                      </HStack>
                      <HStack justify="space-between" width="100%">
                        <Text color="gray.600">Service Cost:</Text>
                        <Text fontWeight="medium">{formatINR(safeGet(selectedBooking, "serviceId.serviceCost", 0))}</Text>
                      </HStack>
                      <HStack justify="space-between" width="100%">
                        <Text color="gray.600">Scheduled For:</Text>
                        <Text fontWeight="medium" color="blue.600">{new Date(safeGet(selectedBooking, "scheduledAt", Date.now())).toLocaleString()}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Address & Contact</Text>
                    <VStack align="start" p={4} bg="gray.50" borderRadius="lg" spacing={2} width="100%">
                      <HStack align="start" width="100%">
                        <Icon as={FiTruck} mt={1} color="gray.500" />
                        <VStack align="start" spacing={0}>
                          <Text color="gray.600" fontSize="xs">Service Address:</Text>
                          <Text fontWeight="medium">{safeGet(selectedBooking, "address", "—")}</Text>
                          {selectedBooking.addressSnapshot && (
                            <Text fontSize="xs" color="gray.500">
                              {selectedBooking.addressSnapshot.city}, {selectedBooking.addressSnapshot.state} - {selectedBooking.addressSnapshot.pincode}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <HStack align="start" width="100%">
                        <Icon as={FiUser} mt={1} color="gray.500" />
                        <VStack align="start" spacing={0}>
                          <Text color="gray.600" fontSize="xs">Contact Number:</Text>
                          <Text fontWeight="medium">
                            {(() => {
                              const foundUser = (typeof selectedBooking.customerProfileId === 'string')
                                ? users.find(u => u._id === selectedBooking.customerProfileId || u.userId === selectedBooking.customerProfileId)
                                : null;

                              return selectedBooking.customerId?.mobileNumber ||
                                selectedBooking.addressSnapshot?.phone ||
                                (typeof selectedBooking.customerProfileId === 'object' ? selectedBooking.customerProfileId?.mobileNumber : null) ||
                                (foundUser?.mobileNumber || foundUser?.phone) ||
                                "—";
                            })()}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Box>
                </Grid>

                <Box bg={`${customColor}05`} p={4} borderRadius="lg">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="lg" fontWeight="bold">Total Base Amount</Text>
                      <Text fontSize="xs" color="gray.500">Payment Status: {safeGet(selectedBooking, "paymentStatus", "pending").toUpperCase()}</Text>
                    </VStack>
                    <Text fontSize="2xl" fontWeight="bold" color={customColor}>{formatINR(safeGet(selectedBooking, "baseAmount", 0))}</Text>
                  </HStack>
                </Box>

                <HStack spacing={3} justify="flex-end">
                  <Button leftIcon={<FaCheckCircle />} bg="purple.500" _hover={{ bg: "purple.600" }} color="white" onClick={() => {
                    const payId = safeGet(selectedBooking, "paymentId") || safeGet(selectedBooking, "payment._id") || safeGet(selectedBooking, "razorpayPaymentId") || safeGet(selectedBooking, "paymentProviderPaymentId");
                    handleUpdatePaymentStatus(payId);
                  }}>Update Payment</Button>
                  <Button variant="ghost" onClick={closeBookingModal}>Close</Button>
                </HStack>
              </VStack>
            ) : (
              <Center py={6}><Text color="gray.500">No booking selected.</Text></Center>
            )}
          </ModalBody>
          <ModalFooter><Button onClick={closeBookingModal}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal >
    </Flex >
  );
}

/* End of CleanedBilling.js */
