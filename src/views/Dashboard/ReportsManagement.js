import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  SkeletonText,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  VStack,
  HStack,
  Center,
  Spinner,
  Textarea,
  Image,
  useColorModeValue,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Tooltip,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  MdStar,
  MdStarBorder,
  MdReport,
  MdCheckCircle,
  MdDelete,
  MdVisibility,
  MdFilterList,
  MdRefresh,
  MdSearch,
  MdRateReview,
  MdWarning,
  MdThumbUp,
  MdAttachMoney,
} from "react-icons/md";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaEdit,
  FaTrash,
  FaUser,
  FaTools,
  FaExclamationTriangle,
  FaBoxOpen,
  FaHistory,
  FaGavel,
  FaClock,
  FaHourglassHalf,
  FaStickyNote,
  FaClipboardList,
} from "react-icons/fa";

import {
  getAllReports,
  getReportById,
  resolveReport,
  getAllRatings,
  getRatingById,
  updateRating,
  deleteRating,
  adminCreateRefund,
  overrideBookingCommission,
  getComplaintsList,
  getComplaintById,
  updateComplaintStatus,
  rejectComplaint,
  getReportCategories,
} from "../utils/axiosInstance";

export default function ReportsManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  const customColor = "#008080";
  const goldColor = "#F5B700";

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("reports");

  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedStatusAction, setSelectedStatusAction] = useState("resolved_refunded");
  const [resolutionNoteInput, setResolutionNoteInput] = useState("");

  const [editRates, setEditRates] = useState(5);
  const [editComment, setEditComment] = useState("");

  // Action Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState(0);
  const [confirmModalData, setConfirmModalData] = useState({
    title: "",
    description: "",
    actionType: "",
    colorScheme: "blue",
    onConfirm: null,
  });

  const triggerConfirmation = (type) => {
    if (type === "reject" && !resolutionNoteInput.trim()) {
      toast({
        title: "Reason Required",
        description: "Please enter a rejection reason in the investigation note field before proceeding.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fin = getFinancialBreakdown(selectedItem);
    let defaultAmt = fin.customerPays;
    if (type === "penalize") {
      defaultAmt = Math.round(fin.techPayout * 0.5) || Math.round(fin.customerPays * 0.25) || 500;
    } else if (type === "freeze") {
      defaultAmt = fin.techPayout || fin.customerPays;
    }
    setCustomAmountInput(defaultAmt || 0);

    let config = {
      actionType: type,
      title: "",
      description: "",
      colorScheme: "blue",
      onConfirm: null,
    };

    if (type === "freeze") {
      config = {
        actionType: type,
        title: "Confirm Payout Freeze",
        description: "Are you sure you want to freeze the technician's payout reserve for this complaint? This locked state remains until active investigation completes.",
        colorScheme: "blue",
        onConfirm: handleFreezePayout,
      };
    } else if (type === "refund") {
      config = {
        actionType: type,
        title: "Confirm Customer Refund",
        description: "Are you sure you want to issue a full refund to the customer and update the complaint status to Resolved (Refunded)?",
        colorScheme: "green",
        onConfirm: handleRefundCustomer,
      };
    } else if (type === "penalize") {
      config = {
        actionType: type,
        title: "Confirm Technician Penalty",
        description: "Are you sure you want to log an official penalty strike against the technician and freeze payout reserves?",
        colorScheme: "orange",
        onConfirm: handlePenalizeTechnician,
      };
    } else if (type === "reject") {
      config = {
        actionType: type,
        title: "Confirm Complaint Rejection",
        description: "Are you sure you want to dismiss and reject this complaint with the recorded investigation note?",
        colorScheme: "red",
        onConfirm: handleRejectComplaint,
      };
    } else if (type === "execute") {
      config = {
        actionType: type,
        title: "Confirm Resolution Execution",
        description: `Are you sure you want to execute status update '${selectedStatusAction.replace(/_/g, " ").toUpperCase()}' for this complaint report?`,
        colorScheme: selectedStatusAction === "resolved_no_refund" ? "red" : selectedStatusAction === "under_review" ? "blue" : "teal",
        onConfirm: handleExecuteResolve,
      };
    }

    setConfirmModalData(config);
    setIsConfirmModalOpen(true);
  };

  const handleProceedConfirmAction = async () => {
    if (confirmModalData.onConfirm) {
      await confirmModalData.onConfirm();
    }
    setIsConfirmModalOpen(false);
  };

  const cancelRef = useRef();

  const getCategoryMeta = (cat) => {
    const key = (cat || "").toLowerCase();
    const meta = {
      quality_dispute: { label: "Quality Dispute", color: "blue" },
      damage: { label: "Property Damage", color: "red" },
      incomplete_work: { label: "Incomplete Work", color: "orange" },
      technician_misconduct: { label: "Technician Misconduct", color: "purple" },
      goodwill: { label: "Goodwill / Courtesy", color: "teal" },
      product_issue: { label: "Product Defect", color: "pink" },
      other: { label: "Other Issue", color: "gray" },
    };
    return meta[key] || { label: cat ? cat.replace(/_/g, " ").toUpperCase() : "General Issue", color: "gray" };
  };

  const renderStatusBadge = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "resolved_refunded") return <Badge colorScheme="green" px={2} py={0.5} borderRadius="full" fontSize="2xs">Resolved (Refunded)</Badge>;
    if (st === "resolved_no_refund") return <Badge colorScheme="gray" px={2} py={0.5} borderRadius="full" fontSize="2xs">Resolved (No Refund)</Badge>;
    if (st === "resolved") return <Badge colorScheme="green" px={2} py={0.5} borderRadius="full" fontSize="2xs">Resolved</Badge>;
    if (st === "under_review") return <Badge colorScheme="blue" px={2} py={0.5} borderRadius="full" fontSize="2xs">Under Review</Badge>;
    if (st === "withdrawn") return <Badge colorScheme="purple" px={2} py={0.5} borderRadius="full" fontSize="2xs">Withdrawn</Badge>;
    if (st === "expired") return <Badge colorScheme="red" px={2} py={0.5} borderRadius="full" fontSize="2xs">Expired</Badge>;
    return <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="full" fontSize="2xs">Open</Badge>;
  };

  const formatCleanComplaintText = (text) => {
    if (!text) return "No detailed complaint statement provided.";
    let str = String(text).trim();
    while (
      (str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))
    ) {
      str = str.slice(1, -1).trim();
    }
    return str || "No detailed complaint statement provided.";
  };

  const getItemDetails = (item) => {
    if (!item) return { name: "N/A", type: "SERVICE", ref: "N/A", price: null };
    
    let name = "Service / Product Booking";
    if (typeof item.serviceId === "object" && item.serviceId?.serviceName) {
      name = item.serviceId.serviceName;
    } else if (typeof item.productId === "object" && item.productId?.productName) {
      name = item.productId.productName;
    } else if (item.serviceName) {
      name = item.serviceName;
    } else if (item.productName) {
      name = item.productName;
    } else if (item.relatedItemName) {
      name = item.relatedItemName;
    } else if (typeof item.bookingId === "object" && item.bookingId) {
      name = item.bookingId?.serviceId?.serviceName || item.bookingId?.productId?.productName || item.bookingId?.title || name;
    }

    let type = "SERVICE";
    if (item.productId || item.productName || item.bookingType === "product" || item.bookingId?.bookingType === "product") {
      type = "PRODUCT";
    }

    let price = item.serviceId?.servicePrice || item.productId?.price || item.bookingId?.totalAmount || item.amount || item.totalAmount || null;

    let ref = "N/A";
    if (typeof item.bookingId === "object" && item.bookingId) {
      ref = item.bookingId.bookingNumber || item.bookingId._id || item.bookingId.id || "N/A";
    } else if (item.bookingId) {
      ref = String(item.bookingId);
    }

    return { name, type, ref, price };
  };

  const getTechnicianDetails = (item) => {
    if (!item) return { name: "Not Assigned", phone: "N/A", email: "N/A", assigned: false };
    
    let techObj = item.technicianId || item.technicianDetails || item.assignedTechnician;
    if (techObj && typeof techObj === "object") {
      let u = techObj.userId || techObj;
      let fname = u.fname || u.firstName || techObj.fname || "";
      let lname = u.lname || u.lastName || techObj.lname || "";
      let fullName = `${fname} ${lname}`.trim() || u.name || techObj.name || "Assigned Technician";
      let phone = u.mobileNumber || u.phone || u.mobile || techObj.mobileNumber || techObj.phone || "N/A";
      let email = u.email || techObj.email || "N/A";
      return { name: fullName, phone, email, assigned: true };
    }

    if (item.techName || item.technicianName) {
      return {
        name: item.techName || item.technicianName,
        phone: item.techMobile || item.technicianPhone || "N/A",
        email: item.techEmail || "N/A",
        assigned: true,
      };
    }

    return { name: "Platform / Direct Order (No Technician)", phone: "N/A", email: "N/A", assigned: false };
  };

  const getCustomerDetails = (item) => {
    if (!item) return { name: "N/A", phone: "N/A", email: "N/A" };

    let custObj = item.customerId || item.customerDetails;
    if (custObj && typeof custObj === "object") {
      let fname = custObj.fname || custObj.firstName || "";
      let lname = custObj.lname || custObj.lastName || "";
      let fullName = `${fname} ${lname}`.trim() || custObj.name || item.reportedBy || "Customer";
      let phone = custObj.mobileNumber || custObj.phone || custObj.mobile || "N/A";
      let email = custObj.email || "N/A";
      return { name: fullName, phone, email };
    }

    return {
      name: item.reportedBy || item.customerName || "Customer",
      phone: item.customerPhone || "N/A",
      email: item.customerEmail || "N/A",
    };
  };

  const getFinancialBreakdown = (item) => {
    if (!item) {
      return {
        customerPays: 0,
        serviceAmount: 0,
        techCommissionPct: 15,
        techPayout: 0,
        platformFee: 0,
        itemName: "Service / Product Item",
        bookingRef: "N/A"
      };
    }

    const itemDetails = getItemDetails(item);
    let customerPays = 0;

    if (item.bookingId && typeof item.bookingId === "object") {
      customerPays = item.bookingId.totalAmount || item.bookingId.grandTotal || item.bookingId.finalCost || item.bookingId.serviceCost || item.bookingId.price || 0;
    }
    if (!customerPays) {
      customerPays = item.totalAmount || item.amount || itemDetails.price || item.serviceCost || item.price || 0;
    }

    let serviceAmount = item.serviceId?.serviceCost || item.productId?.price || item.serviceCost || customerPays;
    let commissionPct = item.commissionPercentage || item.bookingId?.commissionPercentage || 15;
    
    let techPayout = item.bookingId?.technicianPayout || item.technicianPayout || Math.round(customerPays * (1 - commissionPct / 100));
    let platformFee = Math.max(0, customerPays - techPayout);

    return {
      customerPays,
      serviceAmount,
      techCommissionPct: commissionPct,
      techPayout,
      platformFee,
      itemName: itemDetails.name,
      bookingRef: itemDetails.ref
    };
  };

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

  const stats = {
    totalReports: reports.length,
    resolvedReports: reports.filter(
      (r) => r.status?.toLowerCase().includes("resolved")
    ).length,
    totalRatings: ratings.length,
    averageRating:
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + (r.rates || 0), 0) / ratings.length
          ).toFixed(1)
        : 0,
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role?.toLowerCase();

    if (
      !storedUser ||
      (role !== "admin" && role !== "super admin" && role !== "owner")
    ) {
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

  const extractReportsList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.reports)) return res.reports;
    if (Array.isArray(res.complaints)) return res.complaints;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.result)) return res.result;
    if (res.data && typeof res.data === "object") {
      if (Array.isArray(res.data.reports)) return res.data.reports;
      if (Array.isArray(res.data.complaints)) return res.data.complaints;
      if (Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data.result)) return res.data.result;
    }
    if (res.result && typeof res.result === "object") {
      if (Array.isArray(res.result.reports)) return res.result.reports;
      if (Array.isArray(res.result.complaints)) return res.result.complaints;
    }
    return [];
  };

  const fetchReports = useCallback(async () => {
    try {
      let reportsList = [];
      let totalP = 1;
      let totalI = 0;
      try {
        const response = await getComplaintsList({
          status: selectedStatusFilter !== "all" ? selectedStatusFilter : "all",
          search: searchTerm || undefined,
          page: currentPage,
          limit: itemsPerPage,
        });
        reportsList = extractReportsList(response);
        const dataObj = response.data && typeof response.data === "object" && !Array.isArray(response.data) ? response.data : response;
        totalP = dataObj?.totalPages || response?.totalPages || Math.ceil(reportsList.length / itemsPerPage) || 1;
        totalI = dataObj?.total || response?.total || reportsList.length;
      } catch (err) {
        console.warn("New engine complaints fetch fallback:", err.message);
        const legacyRes = await getAllReports(currentPage, itemsPerPage);
        reportsList = extractReportsList(legacyRes);
        const dataObj = legacyRes.data && typeof legacyRes.data === "object" && !Array.isArray(legacyRes.data) ? legacyRes.data : legacyRes;
        totalP = dataObj?.totalPages || legacyRes?.totalPages || Math.ceil(reportsList.length / itemsPerPage) || 1;
        totalI = dataObj?.total || legacyRes?.total || reportsList.length;
      }

      setReports(reportsList);
      setTotalPages(totalP);
      setTotalItems(totalI);
      return reportsList;
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load reports.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  }, [currentPage, itemsPerPage, selectedStatusFilter, searchTerm, toast]);

  const fetchRatings = useCallback(async () => {
    try {
      const response = await getAllRatings(currentPage, itemsPerPage);
      const data = response.result || response.data || response;
      const ratingsList = Array.isArray(data?.ratings)
        ? data.ratings
        : Array.isArray(data)
        ? data
        : [];
      setRatings(ratingsList);
      setTotalPages(data?.totalPages || Math.ceil(ratingsList.length / itemsPerPage));
      setTotalItems(data?.total || ratingsList.length);
      return ratingsList;
    } catch (err) {
      console.error("Error fetching ratings:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load ratings.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  }, [currentPage, itemsPerPage, toast]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if (activeTab === "reports") {
        const reportsList = await fetchReports();
        setFilteredData(reportsList);
      } else {
        const ratingsList = await fetchRatings();
        setFilteredData(ratingsList);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, activeTab, fetchReports, fetchRatings]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    const data = activeTab === "reports" ? reports : ratings;
    let filtered = data;

    if (activeTab === "reports") {
      if (selectedCategoryFilter !== "all") {
        filtered = filtered.filter((r) => (r.category || r.reason || "other") === selectedCategoryFilter);
      }
      if (selectedStatusFilter !== "all") {
        filtered = filtered.filter((r) => r.status === selectedStatusFilter);
      }
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (activeTab === "reports") {
          const cName = item.customerId ? `${item.customerId.fname || ''} ${item.customerId.lname || ''}` : (item.reportedBy || '');
          const tName = item.technicianId?.userId ? `${item.technicianId.userId.fname || ''} ${item.technicianId.userId.lname || ''}` : (item.technicianId?.fname || '');
          const sName = item.serviceId?.serviceName || '';
          const pName = item.productId?.productName || '';
          const categoryName = getCategoryMeta(item.category || item.reason).label;
          return (
            categoryName.toLowerCase().includes(searchLower) ||
            (item.category && item.category.toLowerCase().includes(searchLower)) ||
            (item.complaint && item.complaint.toLowerCase().includes(searchLower)) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            (item.reason && item.reason.toLowerCase().includes(searchLower)) ||
            (item.status && item.status.toLowerCase().includes(searchLower)) ||
            cName.toLowerCase().includes(searchLower) ||
            tName.toLowerCase().includes(searchLower) ||
            sName.toLowerCase().includes(searchLower) ||
            pName.toLowerCase().includes(searchLower) ||
            String(item.bookingId || '').toLowerCase().includes(searchLower)
          );
        } else {
          return (
            item.comment?.toLowerCase().includes(searchLower) ||
            item.status?.toLowerCase().includes(searchLower) ||
            item.ratedBy?.toLowerCase().includes(searchLower)
          );
        }
      });
    }
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
  }, [searchTerm, selectedCategoryFilter, selectedStatusFilter, reports, ratings, activeTab, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCategoryFilter("all");
    setSelectedStatusFilter("all");
    setCurrentPage(1);
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

  const handleViewDetails = async (item) => {
    setSelectedItem(item);
    setResolutionNoteInput(item.resolutionNote || "");
    setSelectedStatusAction(
      item.status === "open"
        ? "under_review"
        : ["resolved_refunded", "resolved_no_refund", "under_review"].includes(item.status)
        ? item.status
        : "resolved_refunded"
    );
    setIsDetailModalOpen(true);

    // Fetch full dossier details from GET /api/admin/complaints/:id
    try {
      const detailedRes = await getComplaintById(item._id || item.id);
      const dossier = detailedRes.data || detailedRes.result || detailedRes.report || detailedRes.complaint || detailedRes;
      if (dossier && (dossier._id || dossier.id)) {
        setSelectedItem(prev => ({ ...prev, ...dossier }));
      }
    } catch (e) {
      console.log("Single complaint dossier detail loaded from list state.");
    }
  };

  const handleExecuteResolve = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const payload = {
        status: selectedStatusAction,
        resolutionNote: resolutionNoteInput.trim() || undefined,
      };

      try {
        await updateComplaintStatus(selectedItem._id || selectedItem.id, payload);
      } catch (e) {
        console.warn("Status update fallback to legacy resolveReport:", e.message);
        await resolveReport(selectedItem._id || selectedItem.id, payload);
      }

      toast({
        title: "Report Status Updated",
        description: `Status changed to ${selectedStatusAction.replace(/_/g, " ").toUpperCase()}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to update report status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectComplaint = async () => {
    if (!selectedItem) return;
    if (!resolutionNoteInput.trim()) {
      toast({
        title: "Reason Required",
        description: "Please enter a rejection reason in the investigation note field.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setActionLoading(true);
    try {
      try {
        await rejectComplaint(selectedItem._id || selectedItem.id, { reason: resolutionNoteInput.trim() });
      } catch (e) {
        console.warn("Reject complaint fallback:", e.message);
        await updateComplaintStatus(selectedItem._id || selectedItem.id, {
          status: "resolved_no_refund",
          resolutionNote: `Rejected: ${resolutionNoteInput.trim()}`,
        });
      }

      toast({
        title: "Complaint Rejected",
        description: "Complaint dismissed with mandatory reason recorded.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast({
        title: "Rejection Failed",
        description: err.message || "Failed to reject complaint.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreezePayout = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const amt = Number(customAmountInput) || 0;
      const payload = {
        status: "under_review",
        frozenAmount: amt,
        resolutionNote: resolutionNoteInput.trim() || `Freeze Payout (₹${amt}): Locked under active complaint investigation.`,
      };

      try {
        await updateComplaintStatus(selectedItem._id || selectedItem.id, payload);
      } catch (e) {
        await resolveReport(selectedItem._id || selectedItem.id, payload);
      }

      toast({
        title: `Payout Frozen (₹${amt})`,
        description: "Technician payout reserve has been locked for investigation.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast({
        title: "Freeze Failed",
        description: err.message || "Failed to freeze payout.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundCustomer = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const refundAmt = Number(customAmountInput) || 0;
      let refundRes = null;
      if (selectedItem.bookingId) {
        try {
          refundRes = await adminCreateRefund({
            bookingId: selectedItem.bookingId,
            amount: refundAmt,
            reason: resolutionNoteInput.trim() || `Complaint Refund (₹${refundAmt}): ${selectedItem.complaint || "Quality dispute"}`,
          });
        } catch (e) {
          console.warn("Direct refund API fallback:", e.message);
        }
      }
      const refundId = refundRes?.refund?._id || refundRes?._id || refundRes?.id;
      const statusPayload = {
        status: "resolved_refunded",
        refundAmount: refundAmt,
        resolutionNote: resolutionNoteInput.trim() || `Customer Refund of ₹${refundAmt} issued successfully.`,
        refundId: refundId,
      };

      try {
        await updateComplaintStatus(selectedItem._id || selectedItem.id, statusPayload);
      } catch (e) {
        await resolveReport(selectedItem._id || selectedItem.id, statusPayload);
      }

      toast({
        title: `Customer Refund Processed (₹${refundAmt})`,
        description: "Complaint resolved in customer's favor and refund created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast({
        title: "Refund Action Failed",
        description: err.message || "Failed to process customer refund.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePenalizeTechnician = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const penaltyAmt = Number(customAmountInput) || 0;
      if (selectedItem.bookingId) {
        try {
          await overrideBookingCommission(selectedItem.bookingId, {
            penaltyAmount: penaltyAmt,
            reason: `Penalty ₹${penaltyAmt} for complaint #${selectedItem._id}: ${resolutionNoteInput || "Technician misconduct/quality failure"}`,
          });
        } catch (e) {
          console.warn("Commission override penalty fallback:", e.message);
        }
      }
      await resolveReport(selectedItem._id, {
        status: "resolved_refunded",
        penaltyAmount: penaltyAmt,
        resolutionNote: resolutionNoteInput.trim()
          ? `Technician Penalized ₹${penaltyAmt}: ${resolutionNoteInput.trim()}`
          : `Technician Penalized ₹${penaltyAmt} & Commission Adjusted.`,
      });
      toast({
        title: `Technician Penalized (₹${penaltyAmt})`,
        description: "Penalty applied and booking commission adjusted.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast({
        title: "Penalty Action Failed",
        description: err.message || "Failed to penalize technician.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRating = (rating) => {
    setSelectedItem(rating);
    setEditRates(rating.rates || 5);
    setEditComment(rating.comment || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateRating = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await updateRating(selectedItem._id, {
        rates: editRates,
        comment: editComment,
      });
      toast({
        title: "Rating Updated",
        description: "Rating has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsEditModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update rating.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await deleteRating(itemToDelete._id);
      toast({
        title: "Rating Deleted",
        description: "Rating has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete rating.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating, size = "sm") => {
    return (
      <Flex gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= rating ? MdStar : MdStarBorder}
            color={star <= rating ? goldColor : "gray.300"}
            boxSize={size === "xs" ? 3 : 4}
          />
        ))}
      </Flex>
    );
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
        <Flex flexDirection="row" align="center" justify="space-between" w="100%">
          <Stat me="auto">
            <StatLabel
              fontSize={{ base: "2xs", md: "xs" }}
              color="gray.600"
              fontWeight="bold"
              pb="1px"
            >
              {label}
            </StatLabel>
            <StatNumber fontSize={{ base: "sm", md: "lg" }} color={textColor}>
              {isLoading ? <Spinner size="xs" /> : value}
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
            <Icon
              as={icon}
              h={{ base: "16px", md: "20px" }}
              w={{ base: "16px", md: "20px" }}
              color="white"
            />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  const ReportMobileCard = ({ item, idx }) => {
    const categoryMeta = getCategoryMeta(item.category || item.reason);
    const reporterName = item.customerId
      ? `${item.customerId.fname || ''} ${item.customerId.lname || ''}`.trim() || item.customerId.email
      : (item.reportedBy || "Customer");
    const targetName = item.technicianId?.userId
      ? `${item.technicianId.userId.fname || ''} ${item.technicianId.userId.lname || ''}`.trim()
      : (item.technicianId?.fname || "Platform");
    const relatedItem = item.serviceId?.serviceName || item.productId?.productName || "Service Order";

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
            <Text fontWeight="bold" color={customColor} fontSize="sm">
              #{indexOfFirstItem + idx + 1}
            </Text>
            <Badge colorScheme={categoryMeta.color} fontSize="3xs" borderRadius="md" px={1.5}>
              {categoryMeta.label}
            </Badge>
          </HStack>
          {renderStatusBadge(item.status)}
        </Flex>

        <VStack align="stretch" spacing={1} fontSize="xs" mb={2}>
          <Text color="gray.600">
            <strong>Reporter:</strong> {reporterName}
          </Text>
          <Text color="gray.600">
            <strong>Against:</strong> {targetName}
          </Text>
          <Text color="gray.600" noOfLines={1}>
            <strong>Related:</strong> {relatedItem}
          </Text>
          {(item.complaint || item.description || item.reason) && (
            <Text color="gray.500" fontSize="2xs" noOfLines={2} bg="gray.50" p={1.5} borderRadius="xs">
              "{item.complaint || item.description || item.reason}"
            </Text>
          )}
        </VStack>

        <Flex gap={2} justify="space-between" align="center" pt={1} borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="3xs" color="gray.400">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
          </Text>
          <Button
            aria-label="View details"
            leftIcon={<FaEye />}
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={() => handleViewDetails(item)}
          >
            Review & Resolve
          </Button>
        </Flex>
      </Box>
    );
  };

  const RatingMobileCard = ({ item, idx }) => (
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
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1}
          </Text>
          {renderStars(item.rates, "xs")}
        </HStack>
        <Text fontSize="xs" color="gray.500">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "N/A"}
        </Text>
      </Flex>

      {item.comment && (
        <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
          "{item.comment}"
        </Text>
      )}

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View details"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => handleViewDetails(item)}
        />
        <IconButton
          aria-label="Edit rating"
          icon={<FaEdit />}
          size="xs"
          colorScheme="orange"
          variant="ghost"
          onClick={() => handleEditRating(item)}
        />
        <IconButton
          aria-label="Delete rating"
          icon={<FaTrash />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={() => handleDeleteClick(item)}
        />
      </Flex>
    </Box>
  );

  if (!currentUser) return null;

  const modalItemDetails = selectedItem ? getItemDetails(selectedItem) : {};
  const modalTechDetails = selectedItem ? getTechnicianDetails(selectedItem) : {};
  const modalCustDetails = selectedItem ? getCustomerDetails(selectedItem) : {};

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
        <SimpleGrid
          columns={{ base: 2, md: 4 }}
          spacing={{ base: "6px", md: "8px" }}
          mb={{ base: "6px", md: "8px" }}
        >
          <StatCard
            label="Total Reports"
            value={stats.totalReports}
            icon={MdReport}
            bg={customColor}
          />
          <StatCard
            label="Resolved Reports"
            value={stats.resolvedReports}
            icon={MdCheckCircle}
            bg="green.500"
          />
          <StatCard
            label="Total Ratings"
            value={stats.totalRatings}
            icon={MdRateReview}
            bg="blue.500"
          />
          <StatCard
            label="Average Rating"
            value={`${stats.averageRating} / 5`}
            icon={MdStar}
            bg={goldColor}
          />
        </SimpleGrid>
      </Box>

      {/* Tab Buttons */}
      <Box flexShrink={0} px={{ base: 1, md: 4 }} pb={2}>
        <Flex gap={2}>
          <Button
            size="sm"
            leftIcon={<MdReport />}
            onClick={() => setActiveTab("reports")}
            bg={activeTab === "reports" ? customColor : "white"}
            color={activeTab === "reports" ? "white" : customColor}
            border="1px"
            borderColor={customColor}
            _hover={{
              bg: activeTab === "reports" ? customColor : `${customColor}10`,
            }}
            borderRadius="md"
            fontWeight="bold"
            fontSize="xs"
          >
            Reports
          </Button>
          <Button
            size="sm"
            leftIcon={<MdStar />}
            onClick={() => setActiveTab("ratings")}
            bg={activeTab === "ratings" ? customColor : "white"}
            color={activeTab === "ratings" ? "white" : customColor}
            border="1px"
            borderColor={customColor}
            _hover={{
              bg: activeTab === "ratings" ? customColor : `${customColor}10`,
            }}
            borderRadius="md"
            fontWeight="bold"
            fontSize="xs"
          >
            Ratings
          </Button>
        </Flex>
      </Box>

      {/* Scrollable Table Container */}
      <Box
        display="flex"
        flexDirection="column"
        p={{ base: 1, md: 4 }}
        pt={0}
        flex="1"
        overflow="hidden"
      >
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
            p="14px 18px"
            pb="12px"
            bg="white"
            flexShrink={0}
            borderBottom="1px solid"
            borderColor={`${customColor}20`}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <Flex
              flexDirection={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "stretch", lg: "center" }}
              gap={3}
            >
              <Heading size="sm" flexShrink={0} color="gray.800" fontWeight="bold">
                {activeTab === "reports"
                  ? "Reports & Complaints Management"
                  : "Ratings & Reviews Management"}
              </Heading>

              <Flex
                align="center"
                flexWrap="wrap"
                gap={2.5}
                justify={{ base: "flex-start", lg: "flex-end" }}
              >
                <InputGroup size="sm" maxW={{ base: "100%", sm: "240px" }} minW="190px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.400" boxSize={4} />
                  </InputLeftElement>
                  <Input
                    placeholder={
                      activeTab === "reports"
                        ? "Search reporter, tech, issue..."
                        : "Search ratings..."
                    }
                    value={searchTerm}
                    onChange={handleSearchChange}
                    borderColor="gray.200"
                    _hover={{ borderColor: customColor }}
                    _focus={{
                      borderColor: customColor,
                      boxShadow: `0 0 0 1px ${customColor}`,
                    }}
                    bg="gray.50"
                    fontSize="xs"
                    borderRadius="md"
                    h="36px"
                  />
                </InputGroup>

                {activeTab === "reports" && (
                  <HStack spacing={2} align="center">
                    <Select
                      size="sm"
                      minW="140px"
                      w="auto"
                      h="36px"
                      value={selectedStatusFilter}
                      onChange={(e) => {
                        setSelectedStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      borderColor="gray.200"
                      _hover={{ borderColor: customColor }}
                      _focus={{ borderColor: customColor }}
                      bg="gray.50"
                      fontSize="xs"
                      borderRadius="md"
                      fontWeight="medium"
                      color="gray.700"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved_refunded">Resolved (Refunded)</option>
                      <option value="resolved_no_refund">Resolved (No Refund)</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="expired">Expired</option>
                    </Select>

                    <Select
                      size="sm"
                      minW="165px"
                      w="auto"
                      h="36px"
                      value={selectedCategoryFilter}
                      onChange={(e) => {
                        setSelectedCategoryFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      borderColor="gray.200"
                      _hover={{ borderColor: customColor }}
                      _focus={{ borderColor: customColor }}
                      bg="gray.50"
                      fontSize="xs"
                      borderRadius="md"
                      fontWeight="medium"
                      color="gray.700"
                    >
                      <option value="all">All Categories</option>
                      <option value="quality_dispute">Quality Dispute</option>
                      <option value="damage">Property Damage</option>
                      <option value="incomplete_work">Incomplete Work</option>
                      <option value="technician_misconduct">Technician Misconduct</option>
                      <option value="goodwill">Goodwill / Courtesy</option>
                      <option value="product_issue">Product Defect / Issue</option>
                      <option value="other">Other Issue</option>
                    </Select>
                  </HStack>
                )}

                {(searchTerm || selectedCategoryFilter !== "all" || selectedStatusFilter !== "all") && (
                  <Button
                    size="sm"
                    h="36px"
                    onClick={handleClearSearch}
                    variant="ghost"
                    color="red.600"
                    bg="red.50"
                    _hover={{ bg: "red.100", color: "red.700" }}
                    _active={{ bg: "red.200" }}
                    fontSize="xs"
                    fontWeight="semibold"
                    px={3}
                    borderRadius="md"
                    leftIcon={<Icon as={MdRefresh} boxSize={4} />}
                    flexShrink={0}
                  >
                    Reset Filters
                  </Button>
                )}
              </Flex>
            </Flex>

            {/* Quick Category Filter Pills Bar */}
            {activeTab === "reports" && (
              <Flex
                align="center"
                gap={2}
                pt={1}
                overflowX="auto"
                css={{
                  ...globalScrollbarStyles,
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                <Flex align="center" gap={1.5} flexShrink={0} mr={1}>
                  <Icon as={MdFilterList} color={customColor} boxSize={4} />
                  <Text
                    fontSize="2xs"
                    color="gray.500"
                    fontWeight="bold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                  >
                    Quick Filter:
                  </Text>
                </Flex>
                {[
                  { id: "all", label: "All Categories" },
                  { id: "quality_dispute", label: "Quality Dispute" },
                  { id: "damage", label: "Property Damage" },
                  { id: "incomplete_work", label: "Incomplete Work" },
                  { id: "technician_misconduct", label: "Tech Misconduct" },
                  { id: "goodwill", label: "Goodwill / Courtesy" },
                  { id: "product_issue", label: "Product Defect" },
                  { id: "other", label: "Other Issue" },
                ].map((cat) => {
                  const isSelected = selectedCategoryFilter === cat.id;
                  return (
                    <Button
                      key={cat.id}
                      size="xs"
                      h="28px"
                      px={3.5}
                      borderRadius="full"
                      bg={isSelected ? customColor : "gray.100"}
                      color={isSelected ? "white" : "gray.600"}
                      border="1px solid"
                      borderColor={isSelected ? customColor : "gray.200"}
                      _hover={{
                        bg: isSelected ? customColor : "gray.200",
                        color: isSelected ? "white" : "gray.800",
                        borderColor: isSelected ? customColor : "gray.300",
                      }}
                      _active={{
                        bg: isSelected ? customColor : "gray.300",
                      }}
                      _focus={{ boxShadow: "none" }}
                      onClick={() => {
                        setSelectedCategoryFilter(cat.id);
                        setCurrentPage(1);
                      }}
                      fontSize="xs"
                      fontWeight={isSelected ? "semibold" : "medium"}
                      flexShrink={0}
                      transition="all 0.15s ease-in-out"
                      shadow={isSelected ? "xs" : "none"}
                    >
                      {cat.label}
                    </Button>
                  );
                })}
              </Flex>
            )}
          </CardHeader>

          {/* Scrollable Content Area */}
          <CardBody
            bg="white"
            display="flex"
            flexDirection="column"
            p={0}
            overflow="hidden"
          >
            {isLoading ? (
              <Flex
                justify="center"
                align="center"
                py={6}
                flex="1"
                direction="column"
                gap={3}
              >
                <Spinner size="lg" color={customColor} />
                <Text fontSize="sm" color="gray.500">
                  Loading data...
                </Text>
              </Flex>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                overflow="hidden"
              >
                {/* Desktop Table View */}
                <Box
                  display={{ base: "none", md: "block" }}
                  overflow="auto"
                  css={globalScrollbarStyles}
                >
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
                          py={2.5}
                          verticalAlign="middle"
                        >
                          #
                        </Th>
                        {activeTab === "reports" ? (
                          <>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={customColor}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="xs"
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Category
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Reported By
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Against
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Related Item
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Complaint Summary
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
                              py={2.5}
                              verticalAlign="middle"
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
                              py={2.5}
                              verticalAlign="middle"
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Actions
                            </Th>
                          </>
                        ) : (
                          <>
                            <Th
                              color="gray.100"
                              borderColor={`${customColor}30`}
                              position="sticky"
                              top={0}
                              bg={customColor}
                              zIndex={10}
                              fontWeight="bold"
                              fontSize="xs"
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Rating
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Comment
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
                              py={2.5}
                              verticalAlign="middle"
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
                              py={2.5}
                              verticalAlign="middle"
                            >
                              Actions
                            </Th>
                          </>
                        )}
                      </Tr>
                    </Thead>

                    <Tbody bg="transparent">
                      {currentItems.length > 0 ? (
                        currentItems.map((item, idx) => (
                          <Tr
                            key={item._id || idx}
                            bg="transparent"
                            _hover={{ bg: `${customColor}10` }}
                            borderBottom="1px"
                            borderColor={`${customColor}20`}
                          >
                            <Td
                              borderColor={`${customColor}20`}
                              fontSize="xs"
                              py={2.5}
                              verticalAlign="middle"
                              fontWeight="bold"
                              color="gray.600"
                            >
                              {indexOfFirstItem + idx + 1}
                            </Td>

                            {activeTab === "reports" ? (
                              <>
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                >
                                  <Badge
                                    colorScheme={getCategoryMeta(item.category || item.reason).color}
                                    px={2.5}
                                    py={0.5}
                                    borderRadius="full"
                                    fontSize="2xs"
                                  >
                                    {getCategoryMeta(item.category || item.reason).label}
                                  </Badge>
                                </Td>

                                {/* Reported By with Hover Popover */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  fontWeight="medium"
                                  maxW="140px"
                                >
                                  <Popover trigger="hover" placement="right-start" openDelay={150} closeDelay={100}>
                                    <PopoverTrigger>
                                      <Box cursor="pointer" _hover={{ color: customColor, textDecoration: "underline" }}>
                                        <Text noOfLines={1} fontWeight="semibold" color="gray.800">
                                          {item.customerId
                                            ? `${item.customerId.fname || ''} ${item.customerId.lname || ''}`.trim() || item.customerId.email
                                            : (item.reportedBy || "Customer")}
                                        </Text>
                                      </Box>
                                    </PopoverTrigger>
                                    <PopoverContent bg="white" borderColor="gray.200" shadow="2xl" borderRadius="lg" p={3.5} w="320px" zIndex={999}>
                                      <PopoverArrow />
                                      <PopoverHeader fontWeight="bold" fontSize="xs" color="gray.800" borderBottom="1px solid" borderColor="gray.100" pb={1.5} mb={2}>
                                        <Flex align="center" gap={1.5}>
                                          <Icon as={FaUser} color="blue.500" boxSize={3.5} />
                                          <Text textTransform="uppercase" letterSpacing="wide">Diagnostic Report Summary</Text>
                                        </Flex>
                                      </PopoverHeader>
                                      <PopoverBody p={0} fontSize="xs">
                                        <VStack align="stretch" spacing={2}>
                                          <Box bg="blue.50" p={2.5} borderRadius="md" borderLeft="3px solid" borderColor="blue.400">
                                            <Text fontWeight="bold" color="blue.800" fontSize="2xs" textTransform="uppercase">Reporter Context</Text>
                                            <Text color="gray.800" fontWeight="semibold" mt={0.5}>
                                              {item.customerId
                                                ? `${item.customerId.fname || ''} ${item.customerId.lname || ''}`.trim() || item.customerId.email
                                                : (item.reportedBy || "Customer")}
                                            </Text>
                                            <Text color="gray.600" fontSize="2xs">
                                              Phone: {item.customerId?.mobileNumber || "N/A"}
                                            </Text>
                                          </Box>

                                          <Box bg="orange.50" p={2.5} borderRadius="md" borderLeft="3px solid" borderColor="orange.400">
                                            <Text fontWeight="bold" color="orange.800" fontSize="2xs" textTransform="uppercase">Target Party (Against)</Text>
                                            <Text color="gray.800" fontWeight="semibold" mt={0.5}>
                                              {item.technicianId?.userId
                                                ? `${item.technicianId.userId.fname || ''} ${item.technicianId.userId.lname || ''}`.trim()
                                                : (item.technicianId?.fname || "Platform / Direct Delivery")}
                                            </Text>
                                            <Text color="gray.600" fontSize="2xs">
                                              Phone: {item.technicianId?.userId?.mobileNumber || "N/A"}
                                            </Text>
                                          </Box>

                                          <Box bg="purple.50" p={2.5} borderRadius="md" borderLeft="3px solid" borderColor="purple.400">
                                            <Text fontWeight="bold" color="purple.800" fontSize="2xs" textTransform="uppercase">Why Reported ({getCategoryMeta(item.category || item.reason).label})</Text>
                                            <Text color="gray.700" mt={0.5} noOfLines={3}>
                                              {item.complaint || item.description || item.reason || "N/A"}
                                            </Text>
                                          </Box>

                                          <Box bg="teal.50" p={2.5} borderRadius="md" borderLeft="3px solid" borderColor="teal.400">
                                            <Text fontWeight="bold" color="teal.800" fontSize="2xs" textTransform="uppercase">Related Booking</Text>
                                            <Text color="gray.800" fontWeight="semibold" mt={0.5}>
                                              {item.serviceId?.serviceName || item.productId?.productName || "Service"} #{item.bookingId || "N/A"}
                                            </Text>
                                          </Box>
                                        </VStack>
                                      </PopoverBody>
                                    </PopoverContent>
                                  </Popover>
                                </Td>

                                {/* Target Party (Against) */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  maxW="140px"
                                >
                                  <Text noOfLines={1} color="gray.800" fontWeight="medium">
                                    {item.technicianId?.userId
                                      ? `${item.technicianId.userId.fname || ''} ${item.technicianId.userId.lname || ''}`.trim()
                                      : (item.technicianId?.fname || item.reportedAgainst || "Platform")}
                                  </Text>
                                </Td>

                                {/* Related Item */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  maxW="150px"
                                >
                                  <Text noOfLines={1} color="gray.700">
                                    {item.serviceId?.serviceName || item.productId?.productName || "Service"}
                                  </Text>
                                </Td>

                                {/* Complaint Summary with Hover Tooltip/Popover */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  maxW="200px"
                                >
                                  <Tooltip label={item.complaint || item.description || item.reason || "N/A"} placement="top" hasArrow bg="gray.800" color="white" borderRadius="md" px={3} py={1.5} fontSize="xs">
                                    <Text noOfLines={1} cursor="help" color="gray.700" fontWeight="medium">
                                      {item.complaint || item.description || item.reason || "N/A"}
                                    </Text>
                                  </Tooltip>
                                </Td>

                                {/* Status */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                >
                                  {renderStatusBadge(item.status)}
                                </Td>

                                {/* Date */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  color="gray.600"
                                >
                                  {item.createdAt
                                    ? new Date(
                                        item.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </Td>

                                {/* Actions */}
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                >
                                  <Flex gap={2}>
                                    <Button
                                      leftIcon={<FaEye />}
                                      bg="white"
                                      color="blue.500"
                                      border="1px"
                                      borderColor="blue.500"
                                      _hover={{
                                        bg: "blue.500",
                                        color: "white",
                                      }}
                                      size="xs"
                                      borderRadius="full"
                                      px={3}
                                      onClick={() => handleViewDetails(item)}
                                    >
                                      Review
                                    </Button>
                                  </Flex>
                                </Td>
                              </>
                            ) : (
                              <>
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                >
                                  {renderStars(item.rates)}
                                </Td>
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  maxW="200px"
                                >
                                  <Text noOfLines={1} color="gray.700">
                                    {item.comment || "N/A"}
                                  </Text>
                                </Td>
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                  color="gray.600"
                                >
                                  {item.createdAt
                                    ? new Date(
                                        item.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </Td>
                                <Td
                                  borderColor={`${customColor}20`}
                                  fontSize="xs"
                                  py={2.5}
                                  verticalAlign="middle"
                                >
                                  <Flex gap={2}>
                                    <IconButton
                                      aria-label="View details"
                                      icon={<FaEye />}
                                      bg="white"
                                      color="blue.500"
                                      border="1px"
                                      borderColor="blue.500"
                                      _hover={{
                                        bg: "blue.500",
                                        color: "white",
                                      }}
                                      size="xs"
                                      onClick={() => handleViewDetails(item)}
                                    />
                                    <IconButton
                                      aria-label="Edit rating"
                                      icon={<FaEdit />}
                                      bg="white"
                                      color="orange.500"
                                      border="1px"
                                      borderColor="orange.500"
                                      _hover={{
                                        bg: "orange.500",
                                        color: "white",
                                      }}
                                      size="xs"
                                      onClick={() => handleEditRating(item)}
                                    />
                                    <IconButton
                                      aria-label="Delete rating"
                                      icon={<FaTrash />}
                                      bg="white"
                                      color="red.500"
                                      border="1px"
                                      borderColor="red.500"
                                      _hover={{
                                        bg: "red.500",
                                        color: "white",
                                      }}
                                      size="xs"
                                      onClick={() => handleDeleteClick(item)}
                                    />
                                  </Flex>
                                </Td>
                              </>
                            )}
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td
                            colSpan={activeTab === "reports" ? 6 : 5}
                            textAlign="center"
                            py={6}
                          >
                            <VStack spacing={2}>
                              <Icon
                                as={
                                  activeTab === "reports"
                                    ? MdReport
                                    : MdStarBorder
                                }
                                color="gray.300"
                                boxSize={10}
                              />
                              <Text fontSize="sm" color="gray.500">
                                {searchTerm
                                  ? "No results found."
                                  : activeTab === "reports"
                                  ? "No reports found."
                                  : "No ratings found."}
                              </Text>
                            </VStack>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* Mobile Card View */}
                <Box
                  display={{ base: "block", md: "none" }}
                  overflow="auto"
                  px={3}
                  py={1.5}
                  css={globalScrollbarStyles}
                >
                  {currentItems.length > 0 ? (
                    currentItems.map((item, idx) =>
                      activeTab === "reports" ? (
                        <ReportMobileCard key={item._id || idx} item={item} idx={idx} />
                      ) : (
                        <RatingMobileCard key={item._id || idx} item={item} idx={idx} />
                      )
                    )
                  ) : (
                    <Center py={10}>
                      <VStack spacing={2}>
                        <Icon
                          as={activeTab === "reports" ? MdReport : MdStarBorder}
                          color="gray.300"
                          boxSize={10}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {searchTerm
                            ? "No results found."
                            : activeTab === "reports"
                            ? "No reports found."
                            : "No ratings found."}
                        </Text>
                      </VStack>
                    </Center>
                  )}
                </Box>

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                  <Box
                    flexShrink={0}
                    p="10px"
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
                            borderColor: "gray.300",
                          }}
                        >
                          <Text display={{ base: "none", sm: "block" }}>
                            Previous
                          </Text>
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
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color={customColor}
                          >
                            {currentPage}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            /
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            fontWeight="medium"
                          >
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
                            borderColor: "gray.300",
                          }}
                        >
                          <Text display={{ base: "none", sm: "block" }}>
                            Next
                          </Text>
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

      {/* Detail Modal */}
      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        size="xl"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent maxW="780px" borderRadius="2xl" overflow="hidden" shadow="2xl">
          <ModalHeader bg="gray.900" color="white" py={4} px={6}>
            <Flex justify="space-between" align="center" pr={6}>
              <HStack spacing={3}>
                <Box p={2} bg={`${customColor}30`} borderRadius="lg">
                  <Icon as={MdReport} color={goldColor} boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {activeTab === "reports" ? "Report Audit & Action Matrix" : "Rating Details"}
                  </Text>
                  {selectedItem && activeTab === "reports" && (
                    <Text fontSize="2xs" color="gray.400">
                      CASE #{String(selectedItem._id || selectedItem.id || "").slice(-8).toUpperCase()}
                    </Text>
                  )}
                </Box>
              </HStack>
              {selectedItem && activeTab === "reports" && (
                <HStack spacing={2}>
                  <Badge colorScheme={getCategoryMeta(selectedItem.category || selectedItem.reason).color} px={2.5} py={1} borderRadius="md" fontSize="2xs">
                    {getCategoryMeta(selectedItem.category || selectedItem.reason).label}
                  </Badge>
                  {renderStatusBadge(selectedItem.status)}
                </HStack>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" mt={1} />
          <ModalBody p={5} maxH="80vh" overflowY="auto" bg="gray.50">
            {selectedItem && (
              <VStack spacing={4} align="stretch">
                {activeTab === "reports" ? (
                  <>
                    {/* Top Grid: Key Entity Highlights (Product/Service, Technician, Customer) with Hover Detail Popovers */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                      {/* 1. Related Product / Service Card */}
                      <Popover trigger="hover" placement="bottom-start" gutter={8}>
                        <PopoverTrigger>
                          <Box
                            bg="white"
                            p={3.5}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="teal.200"
                            shadow="sm"
                            position="relative"
                            cursor="pointer"
                            transition="all 0.2s ease"
                            _hover={{
                              shadow: "md",
                              borderColor: "teal.400",
                              transform: "translateY(-2px)",
                              bg: "teal.50",
                            }}
                          >
                            <Flex align="center" justify="space-between" mb={2}>
                              <Flex align="center" gap={2}>
                                <Icon as={FaBoxOpen} color="teal.500" boxSize={4} />
                                <Text fontWeight="bold" color="teal.800" fontSize="2xs" textTransform="uppercase" letterSpacing="wide">
                                  Related Item & Booking
                                </Text>
                              </Flex>
                              <Badge fontSize="3xs" colorScheme="teal" variant="subtle" borderRadius="full" px={1.5}>
                                Hover Info
                              </Badge>
                            </Flex>
                            <Text fontWeight="bold" color="gray.800" fontSize="sm" noOfLines={2} title={modalItemDetails.name}>
                              {modalItemDetails.name}
                            </Text>
                            <HStack spacing={1.5} mt={2} wrap="wrap">
                              <Badge colorScheme={modalItemDetails.type === "PRODUCT" ? "purple" : "teal"} fontSize="2xs" px={2} py={0.5} borderRadius="md">
                                {modalItemDetails.type}
                              </Badge>
                              <Badge colorScheme={selectedItem.frozeReserve ? "red" : "green"} fontSize="2xs" px={2} py={0.5} borderRadius="md">
                                {selectedItem.frozeReserve ? "🔒 Frozen" : "Payout Ready"}
                              </Badge>
                            </HStack>
                            <Box mt={2.5} pt={2} borderTop="1px dashed" borderColor="gray.200" fontSize="2xs">
                              <Text color="gray.500">Booking Ref: <Text as="span" fontWeight="bold" color="gray.700">#{modalItemDetails.ref}</Text></Text>
                              {modalItemDetails.price && (
                                <Text color="gray.500">Price: <Text as="span" fontWeight="bold" color="teal.600">₹{modalItemDetails.price}</Text></Text>
                              )}
                            </Box>
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent bg="gray.900" color="white" borderColor="teal.400" shadow="xl" borderRadius="xl" p={3.5} w="290px" _focus={{ boxShadow: "none" }}>
                          <PopoverArrow bg="gray.900" />
                          <PopoverHeader borderBottom="1px solid" borderColor="gray.700" fontWeight="bold" fontSize="xs" color="teal.300" pb={2} mb={2.5}>
                            <Flex align="center" gap={2}>
                              <Icon as={FaBoxOpen} color="teal.400" boxSize={4} />
                              Item & Booking Details
                            </Flex>
                          </PopoverHeader>
                          <PopoverBody p={0} fontSize="xs">
                            <VStack align="stretch" spacing={2}>
                              <Flex justify="space-between" align="start">
                                <Text color="gray.400" fontSize="2xs">Item Name:</Text>
                                <Text fontWeight="semibold" color="white" textAlign="right" maxW="170px" fontSize="2xs">
                                  {modalItemDetails.name}
                                </Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Category Type:</Text>
                                <Badge colorScheme={modalItemDetails.type === "PRODUCT" ? "purple" : "teal"} fontSize="3xs">
                                  {modalItemDetails.type}
                                </Badge>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Booking Ref ID:</Text>
                                <Text fontFamily="mono" color="teal.200" fontWeight="bold" fontSize="2xs">
                                  #{modalItemDetails.ref}
                                </Text>
                              </Flex>
                              {modalItemDetails.price && (
                                <Flex justify="space-between" align="center">
                                  <Text color="gray.400" fontSize="2xs">Booking Amount:</Text>
                                  <Text fontWeight="bold" color="green.300" fontSize="2xs">
                                    ₹{modalItemDetails.price}
                                  </Text>
                                </Flex>
                              )}
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Payout Status:</Text>
                                <Badge colorScheme={selectedItem.frozeReserve ? "red" : "green"} fontSize="3xs">
                                  {selectedItem.frozeReserve ? "Payout Frozen" : "Ready for Transfer"}
                                </Badge>
                              </Flex>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>

                      {/* 2. Assigned Technician Card */}
                      <Popover trigger="hover" placement="bottom" gutter={8}>
                        <PopoverTrigger>
                          <Box
                            bg="white"
                            p={3.5}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="orange.200"
                            shadow="sm"
                            position="relative"
                            cursor="pointer"
                            transition="all 0.2s ease"
                            _hover={{
                              shadow: "md",
                              borderColor: "orange.400",
                              transform: "translateY(-2px)",
                              bg: "orange.50",
                            }}
                          >
                            <Flex align="center" justify="space-between" mb={2}>
                              <Flex align="center" gap={2}>
                                <Icon as={FaTools} color="orange.500" boxSize={4} />
                                <Text fontWeight="bold" color="orange.800" fontSize="2xs" textTransform="uppercase" letterSpacing="wide">
                                  Assigned Technician
                                </Text>
                              </Flex>
                              <Badge fontSize="3xs" colorScheme="orange" variant="subtle" borderRadius="full" px={1.5}>
                                Hover Info
                              </Badge>
                            </Flex>
                            <Text fontWeight="bold" color="gray.800" fontSize="sm" noOfLines={1} title={modalTechDetails.name}>
                              {modalTechDetails.name}
                            </Text>
                            <HStack spacing={1.5} mt={2}>
                              <Badge colorScheme={modalTechDetails.assigned ? "orange" : "gray"} fontSize="2xs" px={2} py={0.5} borderRadius="md">
                                {modalTechDetails.assigned ? "Field Specialist" : "No Technician"}
                              </Badge>
                            </HStack>
                            <Box mt={2.5} pt={2} borderTop="1px dashed" borderColor="gray.200" fontSize="2xs">
                              <Text color="gray.500">Phone: <Text as="span" fontWeight="bold" color="gray.700">{modalTechDetails.phone}</Text></Text>
                              <Text color="gray.500" noOfLines={1}>Email: <Text as="span" fontWeight="bold" color="gray.700">{modalTechDetails.email}</Text></Text>
                            </Box>
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent bg="gray.900" color="white" borderColor="orange.400" shadow="xl" borderRadius="xl" p={3.5} w="290px" _focus={{ boxShadow: "none" }}>
                          <PopoverArrow bg="gray.900" />
                          <PopoverHeader borderBottom="1px solid" borderColor="gray.700" fontWeight="bold" fontSize="xs" color="orange.300" pb={2} mb={2.5}>
                            <Flex align="center" gap={2}>
                              <Icon as={FaTools} color="orange.400" boxSize={4} />
                              Technician Details & Profile
                            </Flex>
                          </PopoverHeader>
                          <PopoverBody p={0} fontSize="xs">
                            <VStack align="stretch" spacing={2}>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Technician Name:</Text>
                                <Text fontWeight="semibold" color="white" fontSize="2xs">
                                  {modalTechDetails.name}
                                </Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Assignment:</Text>
                                <Badge colorScheme={modalTechDetails.assigned ? "orange" : "gray"} fontSize="3xs">
                                  {modalTechDetails.assigned ? "Assigned Specialist" : "Unassigned"}
                                </Badge>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Mobile Phone:</Text>
                                <Text fontWeight="bold" color="orange.200" fontSize="2xs">
                                  {modalTechDetails.phone}
                                </Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Email Address:</Text>
                                <Text fontSize="2xs" color="gray.300" maxW="160px" isTruncated>
                                  {modalTechDetails.email}
                                </Text>
                              </Flex>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>

                      {/* 3. Customer / Reporter Card */}
                      <Popover trigger="hover" placement="bottom-end" gutter={8}>
                        <PopoverTrigger>
                          <Box
                            bg="white"
                            p={3.5}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="blue.200"
                            shadow="sm"
                            position="relative"
                            cursor="pointer"
                            transition="all 0.2s ease"
                            _hover={{
                              shadow: "md",
                              borderColor: "blue.400",
                              transform: "translateY(-2px)",
                              bg: "blue.50",
                            }}
                          >
                            <Flex align="center" justify="space-between" mb={2}>
                              <Flex align="center" gap={2}>
                                <Icon as={FaUser} color="blue.500" boxSize={4} />
                                <Text fontWeight="bold" color="blue.800" fontSize="2xs" textTransform="uppercase" letterSpacing="wide">
                                  Reported By (Customer)
                                </Text>
                              </Flex>
                              <Badge fontSize="3xs" colorScheme="blue" variant="subtle" borderRadius="full" px={1.5}>
                                Hover Info
                              </Badge>
                            </Flex>
                            <Text fontWeight="bold" color="gray.800" fontSize="sm" noOfLines={1} title={modalCustDetails.name}>
                              {modalCustDetails.name}
                            </Text>
                            <HStack spacing={1.5} mt={2}>
                              <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                                Registered User
                              </Badge>
                            </HStack>
                            <Box mt={2.5} pt={2} borderTop="1px dashed" borderColor="gray.200" fontSize="2xs">
                              <Text color="gray.500">Phone: <Text as="span" fontWeight="bold" color="gray.700">{modalCustDetails.phone}</Text></Text>
                              <Text color="gray.500" noOfLines={1}>Email: <Text as="span" fontWeight="bold" color="gray.700">{modalCustDetails.email}</Text></Text>
                            </Box>
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent bg="gray.900" color="white" borderColor="blue.400" shadow="xl" borderRadius="xl" p={3.5} w="290px" _focus={{ boxShadow: "none" }}>
                          <PopoverArrow bg="gray.900" />
                          <PopoverHeader borderBottom="1px solid" borderColor="gray.700" fontWeight="bold" fontSize="xs" color="blue.300" pb={2} mb={2.5}>
                            <Flex align="center" gap={2}>
                              <Icon as={FaUser} color="blue.400" boxSize={4} />
                              Customer Details & Account
                            </Flex>
                          </PopoverHeader>
                          <PopoverBody p={0} fontSize="xs">
                            <VStack align="stretch" spacing={2}>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Customer Name:</Text>
                                <Text fontWeight="semibold" color="white" fontSize="2xs">
                                  {modalCustDetails.name}
                                </Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">User Status:</Text>
                                <Badge colorScheme="blue" fontSize="3xs">
                                  Registered User
                                </Badge>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Phone Number:</Text>
                                <Text fontWeight="bold" color="blue.200" fontSize="2xs">
                                  {modalCustDetails.phone}
                                </Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text color="gray.400" fontSize="2xs">Email Address:</Text>
                                <Text fontSize="2xs" color="gray.300" maxW="160px" isTruncated>
                                  {modalCustDetails.email}
                                </Text>
                              </Flex>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </SimpleGrid>

                    {/* Section: Customer Complaint & Justification */}
                    <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="purple.200" shadow="sm">
                      <Flex align="center" justify="space-between" mb={3}>
                        <HStack spacing={2}>
                          <Icon as={FaExclamationTriangle} color="purple.600" boxSize={4} />
                          <Text fontWeight="bold" color="purple.900" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                            Customer Complaint & Issue Justification
                          </Text>
                        </HStack>
                        <Badge colorScheme={getCategoryMeta(selectedItem.category || selectedItem.reason).color} fontSize="2xs" px={2.5} py={0.5} borderRadius="full">
                          {getCategoryMeta(selectedItem.category || selectedItem.reason).label}
                        </Badge>
                      </Flex>
                      <Box
                        bg="purple.50"
                        p={4}
                        borderRadius="xl"
                        borderLeft="4px solid"
                        borderColor="purple.500"
                        shadow="xs"
                      >
                        <Text color="gray.900" whiteSpace="pre-wrap" fontSize="sm" lineHeight="relaxed" fontWeight="semibold">
                          {formatCleanComplaintText(selectedItem.complaint || selectedItem.description || selectedItem.reason)}
                        </Text>
                      </Box>
                        {selectedItem.image && (
                          <Box mt={3}>
                            <Text color="gray.600" mb={1.5} fontSize="2xs" fontWeight="bold" textTransform="uppercase">
                              Attached Evidence Photo:
                            </Text>
                            <Image
                              src={selectedItem.image}
                              alt="Complaint Evidence"
                              maxH="160px"
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="gray.200"
                              objectFit="contain"
                              shadow="xs"
                            />
                          </Box>
                        )}
                      </Box>

                      {/* Section: Technician Defense & Counter Evidence Dossier (If present) */}
                      {(selectedItem.technicianResponse || selectedItem.technicianExplanation || (selectedItem.technicianImages && selectedItem.technicianImages.length > 0)) && (
                        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="orange.300" shadow="sm">
                          <HStack spacing={2} mb={2.5}>
                            <Icon as={FaTools} color="orange.600" boxSize={4} />
                            <Text fontWeight="bold" color="orange.900" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                              Technician Evidence & Response Dossier
                            </Text>
                          </HStack>
                          {(selectedItem.technicianResponse || selectedItem.technicianExplanation) && (
                            <Box bg="orange.50" p={3} borderRadius="lg" borderLeft="4px solid" borderColor="orange.400" mb={2}>
                              <Text color="orange.900" fontSize="2xs" fontWeight="bold" textTransform="uppercase" mb={0.5}>
                                Technician Written Defense:
                              </Text>
                              <Text color="gray.800" fontSize="xs" whiteSpace="pre-wrap" lineHeight="relaxed">
                                "{selectedItem.technicianResponse || selectedItem.technicianExplanation}"
                              </Text>
                            </Box>
                          )}
                          {selectedItem.technicianImages && selectedItem.technicianImages.length > 0 && (
                            <Box mt={2}>
                              <Text color="gray.600" mb={1.5} fontSize="2xs" fontWeight="bold" textTransform="uppercase">
                                Technician Evidence Photos:
                              </Text>
                              <Flex gap={2} wrap="wrap">
                                {selectedItem.technicianImages.map((img, i) => (
                                  <Image
                                    key={i}
                                    src={img}
                                    alt={`Tech Evidence ${i + 1}`}
                                    maxH="130px"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    objectFit="contain"
                                    shadow="xs"
                                  />
                                ))}
                              </Flex>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Section: Historical Context & Timeline */}
                      <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                        <Flex justify="space-between" align="center" mb={3}>
                          <HStack spacing={2} align="center">
                            <Flex w="30px" h="30px" bg={`${customColor}15`} color={customColor} borderRadius="lg" justify="center" align="center">
                              <Icon as={FaHistory} boxSize={4} />
                            </Flex>
                            <Box>
                              <Text fontWeight="extrabold" color="gray.800" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                                Historical Audit & Timeline
                              </Text>
                              <Text fontSize="3xs" color="gray.500">
                                Event timestamps & admin resolution history
                              </Text>
                            </Box>
                          </HStack>
                          <Badge colorScheme="teal" fontSize="3xs" px={2.5} py={0.5} borderRadius="full">
                            Audited Record
                          </Badge>
                        </Flex>

                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
                          {/* Report Date */}
                          <Box bg="blue.50" p={3} borderRadius="xl" border="1px solid" borderColor="blue.100">
                            <HStack spacing={1.5} mb={1} color="blue.700">
                              <Icon as={FaClock} boxSize={3.5} />
                              <Text color="blue.700" fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                                Report Date
                              </Text>
                            </HStack>
                            <Text fontWeight="extrabold" fontSize="xs" color="blue.900">
                              {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }) : "N/A"}
                            </Text>
                          </Box>

                          {/* SLA Resolution Deadline */}
                          <Box bg="amber.50" p={3} borderRadius="xl" border="1px solid" borderColor="amber.200">
                            <HStack spacing={1.5} mb={1} color="amber.800">
                              <Icon as={FaHourglassHalf} boxSize={3.5} />
                              <Text color="amber.800" fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                                SLA Resolution Deadline
                              </Text>
                            </HStack>
                            <Text fontWeight="extrabold" fontSize="xs" color="amber.950">
                              {selectedItem.slaDeadline ? new Date(selectedItem.slaDeadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }) : "Standard 24h Resolution Window"}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        {/* Previous Admin Resolution Notes */}
                        {selectedItem.resolutionNote && (
                          <Box bg="red.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="red.200" borderLeft="4px solid" borderLeftColor="red.500">
                            <HStack spacing={2} mb={1.5} align="center">
                              <Icon as={FaClipboardList} color="red.600" boxSize={4} />
                              <Text fontSize="2xs" color="red.800" fontWeight="extrabold" textTransform="uppercase" letterSpacing="wider">
                                Previous Admin Resolution Notes:
                              </Text>
                            </HStack>
                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="red.150" shadow="2xs">
                              <Text fontSize="xs" color="gray.900" fontWeight="semibold" lineHeight="relaxed">
                                {selectedItem.resolutionNote}
                              </Text>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Section: Admin Investigation & Action Controls */}
                      <Box bg="white" p={4} borderRadius="xl" border="2px solid" borderColor={`${customColor}50`} shadow="md">
                        <HStack spacing={2} mb={3}>
                          <Icon as={FaGavel} color={customColor} boxSize={4} />
                          <Text fontWeight="bold" color="gray.900" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                            Admin Investigation & Recommended Enforcement Controls
                          </Text>
                        </HStack>
                        <VStack align="stretch" spacing={3} fontSize="xs">
                          <Box>
                            <Text color="gray.700" fontWeight="semibold" mb={1}>Select Target Status / Action:</Text>
                            <Select
                              size="sm"
                              bg="gray.50"
                              value={selectedStatusAction}
                              onChange={(e) => setSelectedStatusAction(e.target.value)}
                              borderColor={`${customColor}60`}
                              borderRadius="md"
                              fontWeight="medium"
                            >
                              <option value="under_review">🔍 Mark Under Review (Active Investigation)</option>
                              <option value="resolved_refunded">✅ Resolve & Issue Refund (Customer Favor)</option>
                              <option value="resolved_no_refund">🛑 Reject Complaint / No Refund (Technician Favor)</option>
                            </Select>
                          </Box>

                          <Box>
                            <Text color="gray.700" fontWeight="semibold" mb={1}>Admin Investigation Note / Reason:</Text>
                            <Textarea
                              size="sm"
                              bg="gray.50"
                              placeholder="Enter detailed investigation findings, reason for approval/rejection, or penalty rationale..."
                              value={resolutionNoteInput}
                              onChange={(e) => setResolutionNoteInput(e.target.value)}
                              rows={2.5}
                              borderColor={`${customColor}60`}
                              borderRadius="md"
                            />
                          </Box>

                          {/* Quick Direct Actions Matrix */}
                          <Box pt={1}>
                            <Text color="gray.600" fontWeight="bold" fontSize="2xs" mb={1.5} textTransform="uppercase" letterSpacing="wider">
                              Direct Enforcement Actions:
                            </Text>
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={2}>
                              <Button
                                leftIcon={<MdWarning />}
                                colorScheme="blue"
                                variant="solid"
                                size="xs"
                                onClick={() => triggerConfirmation("freeze")}
                                isLoading={actionLoading}
                                shadow="xs"
                                borderRadius="md"
                              >
                                🧊 Freeze Payout
                              </Button>
                              <Button
                                leftIcon={<MdCheckCircle />}
                                colorScheme="green"
                                variant="solid"
                                size="xs"
                                onClick={() => triggerConfirmation("refund")}
                                isLoading={actionLoading}
                                shadow="xs"
                                borderRadius="md"
                              >
                                💸 Refund Customer
                              </Button>
                              <Button
                                leftIcon={<FaExclamationTriangle />}
                                colorScheme="orange"
                                variant="solid"
                                size="xs"
                                onClick={() => triggerConfirmation("penalize")}
                                isLoading={actionLoading}
                                shadow="xs"
                                borderRadius="md"
                              >
                                ⚠️ Penalize Tech
                              </Button>
                              <Button
                                leftIcon={<FaTrash />}
                                colorScheme="red"
                                variant="solid"
                                size="xs"
                                onClick={() => triggerConfirmation("reject")}
                                isLoading={actionLoading}
                                shadow="xs"
                                borderRadius="md"
                              >
                                ❌ Reject Complaint
                              </Button>
                            </SimpleGrid>
                          </Box>

                          <Button
                            leftIcon={<MdCheckCircle />}
                            bg={selectedStatusAction === "resolved_no_refund" ? "red.600" : selectedStatusAction === "under_review" ? "blue.600" : customColor}
                            color="white"
                            _hover={{
                              bg: selectedStatusAction === "resolved_no_refund" ? "red.700" : selectedStatusAction === "under_review" ? "blue.700" : "#006666",
                            }}
                            onClick={() => triggerConfirmation("execute")}
                            isLoading={actionLoading}
                            size="md"
                            w="100%"
                            mt={2}
                            borderRadius="lg"
                            fontWeight="bold"
                            shadow="md"
                          >
                            Execute Resolution & Update Report
                          </Button>
                        </VStack>
                      </Box>
                    </>
                  ) : (
                  <>
                    <Box
                      bg={`${customColor}05`}
                      p={4}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={`${customColor}20`}
                    >
                      <Text
                        fontWeight="bold"
                        color={customColor}
                        fontSize="sm"
                        mb={2}
                      >
                        Rating Information
                      </Text>
                      <SimpleGrid columns={2} spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            Rating
                          </Text>
                          <Box mt={1}>{renderStars(selectedItem.rates)}</Box>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            Date
                          </Text>
                          <Text fontSize="sm">
                            {selectedItem.createdAt
                              ? new Date(
                                  selectedItem.createdAt
                                ).toLocaleString()
                              : "N/A"}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>

                    <Box>
                      <Text
                        fontWeight="bold"
                        color="gray.600"
                        fontSize="sm"
                        mb={2}
                      >
                        Comment
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {selectedItem.comment || "No comment provided."}
                      </Text>
                    </Box>

                    {selectedItem.ratedBy && (
                      <Box>
                        <Text
                          fontWeight="bold"
                          color="gray.600"
                          fontSize="sm"
                          mb={2}
                        >
                          Rated By
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {selectedItem.ratedBy}
                        </Text>
                      </Box>
                    )}

                    {selectedItem.serviceId && (
                      <Box>
                        <Text
                          fontWeight="bold"
                          color="gray.600"
                          fontSize="sm"
                          mb={2}
                        >
                          Service
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {typeof selectedItem.serviceId === "object"
                            ? selectedItem.serviceId.serviceName || "N/A"
                            : selectedItem.serviceId}
                        </Text>
                      </Box>
                    )}
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Rating Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent maxW="450px">
          <ModalHeader color="gray.700">Edit Rating</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
                  Rating
                </Text>
                <HStack spacing={2}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                      key={star}
                      aria-label={`Rate ${star} stars`}
                      icon={<MdStar />}
                      size="lg"
                      color={star <= editRates ? goldColor : "gray.300"}
                      bg="transparent"
                      _hover={{ bg: "transparent", transform: "scale(1.1)" }}
                      onClick={() => setEditRates(star)}
                    />
                  ))}
                </HStack>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
                  Comment
                </Text>
                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Enter comment..."
                  size="sm"
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{
                    borderColor: customColor,
                    boxShadow: `0 0 0 1px ${customColor}`,
                  }}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsEditModalOpen(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              bg={customColor}
              color="white"
              _hover={{ bg: `${customColor}dd` }}
              onClick={handleUpdateRating}
              isLoading={actionLoading}
              size="sm"
            >
              Update Rating
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Rating
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this rating? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteDialogOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={actionLoading}
                size="sm"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Enforcement Action Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        isCentered
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="gray.200">
          <ModalHeader bg={`${confirmModalData.colorScheme}.600`} color="white" py={4} px={5}>
            <Flex justify="space-between" align="center" pr={6}>
              <HStack spacing={2.5}>
                <Icon as={FaExclamationTriangle} boxSize={5} />
                <Text fontSize="md" fontWeight="extrabold">
                  {confirmModalData.title || "Confirm Action"}
                </Text>
              </HStack>
              <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="3xs" textTransform="uppercase">
                {confirmModalData.actionType} Action
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody p={5} bg="gray.50">
            <VStack align="stretch" spacing={4}>
              {/* Description Alert Banner */}
              <Box bg={`${confirmModalData.colorScheme}.50`} p={3.5} borderRadius="xl" border="1px solid" borderColor={`${confirmModalData.colorScheme}.200`}>
                <Text fontSize="xs" color={`${confirmModalData.colorScheme}.900`} fontWeight="medium" lineHeight="relaxed">
                  {confirmModalData.description}
                </Text>
              </Box>

              {/* Financial & Booking Details Summary Card */}
              {selectedItem && (() => {
                const fin = getFinancialBreakdown(selectedItem);
                const techDetails = getTechnicianDetails(selectedItem);
                const custDetails = getCustomerDetails(selectedItem);

                return (
                  <Card bg="white" shadow="sm" borderRadius="xl" p={4} border="1px solid" borderColor="blue.100">
                    <Flex justify="space-between" align="center" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                      <HStack spacing={2}>
                        <Flex w="30px" h="30px" bg="blue.50" color="blue.600" borderRadius="lg" justify="center" align="center">
                          <Icon as={MdAttachMoney} boxSize={5} />
                        </Flex>
                        <Box>
                          <Text fontWeight="extrabold" fontSize="xs" color="gray.800" textTransform="uppercase" letterSpacing="wide">
                            Financial Breakdown & Order Details
                          </Text>
                          <Text fontSize="3xs" color="gray.500">
                            Ref: #{fin.bookingRef} | Case #{String(selectedItem._id || selectedItem.id || "").slice(-8).toUpperCase()}
                          </Text>
                        </Box>
                      </HStack>
                      <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="3xs">
                        Verified Order
                      </Badge>
                    </Flex>

                    {/* Service / Product Item Name */}
                    <Box bg="gray.50" p={2.5} borderRadius="lg" mb={3} border="1px solid" borderColor="gray.200">
                      <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                        Booked Service / Product:
                      </Text>
                      <Text fontSize="xs" fontWeight="extrabold" color="gray.800" noOfLines={1} mt={0.5}>
                        📦 {fin.itemName}
                      </Text>
                      <HStack spacing={4} mt={1} fontSize="3xs" color="gray.600">
                        <Text>👤 Customer: <Text as="span" fontWeight="bold" color="gray.800">{custDetails.name}</Text></Text>
                        <Text>🛠️ Technician: <Text as="span" fontWeight="bold" color="gray.800">{techDetails.name}</Text></Text>
                      </HStack>
                    </Box>

                    {/* Financial Metrics Grid */}
                    <Grid templateColumns="repeat(3, 1fr)" gap={2.5} mb={3}>
                      {/* Customer Pays */}
                      <Box bg="green.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="green.200">
                        <Text fontSize="3xs" color="green.700" fontWeight="extrabold" textTransform="uppercase" letterSpacing="wider">
                          Customer Paid
                        </Text>
                        <Text fontSize="md" fontWeight="extrabold" color="green.800" mt={0.5}>
                          ₹{fin.customerPays.toLocaleString()}
                        </Text>
                        <Text fontSize="4xs" color="green.600">Total Billed Amount</Text>
                      </Box>

                      {/* Service / Product Base Cost */}
                      <Box bg="blue.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="blue.200">
                        <Text fontSize="3xs" color="blue.700" fontWeight="extrabold" textTransform="uppercase" letterSpacing="wider">
                          Service Base
                        </Text>
                        <Text fontSize="md" fontWeight="extrabold" color="blue.800" mt={0.5}>
                          ₹{fin.serviceAmount.toLocaleString()}
                        </Text>
                        <Text fontSize="4xs" color="blue.600">Catalog Base Price</Text>
                      </Box>

                      {/* Tech Payout & Commission */}
                      <Box bg="purple.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="purple.200">
                        <Text fontSize="3xs" color="purple.700" fontWeight="extrabold" textTransform="uppercase" letterSpacing="wider">
                          Tech Payout
                        </Text>
                        <Text fontSize="md" fontWeight="extrabold" color="purple.800" mt={0.5}>
                          ₹{fin.techPayout.toLocaleString()}
                        </Text>
                        <Text fontSize="4xs" color="purple.600">
                          ({100 - fin.techCommissionPct}% Payout | {fin.techCommissionPct}% Fee)
                        </Text>
                      </Box>
                    </Grid>

                    {/* Editable Amount Control Section */}
                    {(confirmModalData.actionType === "refund" ||
                      confirmModalData.actionType === "penalize" ||
                      confirmModalData.actionType === "freeze" ||
                      confirmModalData.actionType === "execute") && (
                      <Box bg="white" p={3.5} borderRadius="xl" border="2px solid" borderColor={`${confirmModalData.colorScheme}.400`} shadow="sm">
                        <Flex justify="space-between" align="center" mb={2}>
                          <HStack spacing={1.5}>
                            <Icon as={FaEdit} color={`${confirmModalData.colorScheme}.600`} boxSize={4} />
                            <Text fontSize="xs" fontWeight="extrabold" color="gray.800" textTransform="uppercase" letterSpacing="wider">
                              {confirmModalData.actionType === "refund"
                                ? "Editable Refund Amount (₹)"
                                : confirmModalData.actionType === "penalize"
                                ? "Editable Penalty Amount (₹)"
                                : confirmModalData.actionType === "freeze"
                                ? "Editable Freeze Reserve (₹)"
                                : "Custom Execution Amount (₹)"}
                            </Text>
                          </HStack>
                          <Badge colorScheme={confirmModalData.colorScheme} fontSize="3xs" borderRadius="full" px={2} py={0.5}>
                            Editable Input
                          </Badge>
                        </Flex>

                        <InputGroup size="md" mb={2.5}>
                          <InputLeftElement pointerEvents="none">
                            <Text fontWeight="extrabold" color={`${confirmModalData.colorScheme}.600`}>
                              ₹
                            </Text>
                          </InputLeftElement>
                          <Input
                            type="number"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value)}
                            fontSize="md"
                            fontWeight="extrabold"
                            color="gray.900"
                            borderRadius="xl"
                            bg="gray.50"
                            borderColor={`${confirmModalData.colorScheme}.300`}
                            _focus={{ bg: "white", borderColor: `${confirmModalData.colorScheme}.500`, boxShadow: `0 0 0 1px ${confirmModalData.colorScheme}` }}
                          />
                        </InputGroup>

                        {/* Quick Preset Buttons */}
                        <HStack spacing={2} justify="flex-start" wrap="wrap">
                          <Text fontSize="3xs" fontWeight="extrabold" color="gray.500" textTransform="uppercase">
                            Quick Presets:
                          </Text>
                          <Button
                            size="xs"
                            h="24px"
                            colorScheme="teal"
                            variant="solid"
                            borderRadius="md"
                            fontSize="3xs"
                            onClick={() => setCustomAmountInput(fin.customerPays)}
                          >
                            100% Full (₹{fin.customerPays})
                          </Button>
                          <Button
                            size="xs"
                            h="24px"
                            colorScheme="blue"
                            variant="outline"
                            borderRadius="md"
                            fontSize="3xs"
                            onClick={() => setCustomAmountInput(Math.round(fin.customerPays * 0.5))}
                          >
                            50% Half (₹{Math.round(fin.customerPays * 0.5)})
                          </Button>
                          <Button
                            size="xs"
                            h="24px"
                            colorScheme="purple"
                            variant="outline"
                            borderRadius="md"
                            fontSize="3xs"
                            onClick={() => setCustomAmountInput(Math.round(fin.customerPays * 0.25))}
                          >
                            25% (₹{Math.round(fin.customerPays * 0.25)})
                          </Button>
                        </HStack>
                      </Box>
                    )}
                  </Card>
                );
              })()}

              {resolutionNoteInput.trim() && (
                <Box bg="white" p={3} borderRadius="xl" border="1px solid" borderColor="gray.200">
                  <Text color="gray.500" fontSize="3xs" fontWeight="bold" textTransform="uppercase">
                    Recorded Investigation Note:
                  </Text>
                  <Text color="gray.800" fontSize="xs" fontStyle="italic" noOfLines={2} mt={0.5}>
                    "{resolutionNoteInput.trim()}"
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter bg="white" py={3} px={5} borderTop="1px solid" borderColor="gray.200">
            <Button
              variant="outline"
              size="sm"
              borderRadius="lg"
              onClick={() => setIsConfirmModalOpen(false)}
              isDisabled={actionLoading}
            >
              Cancel / Back
            </Button>
            <Button
              colorScheme={confirmModalData.colorScheme}
              size="sm"
              borderRadius="lg"
              ml={3}
              onClick={handleProceedConfirmAction}
              isLoading={actionLoading}
              leftIcon={<MdCheckCircle />}
              fontWeight="bold"
              shadow="md"
            >
              Yes, Proceed & Execute (₹{Number(customAmountInput || 0).toLocaleString()})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
