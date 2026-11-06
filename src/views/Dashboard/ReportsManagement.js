import React, { useState, useEffect, useCallback, useMemo } from "react";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import ErrorState from "components/feedback/ErrorState";
import ConfirmActionModal from "components/common/ConfirmActionModal";
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Heading,
  VStack,
  HStack,
  Center,
  Spinner,
  Textarea,
  Image,
  Icon,
  Tag,
  Divider,
} from "@chakra-ui/react";

import StatusBadge from "components/common/StatusBadge";

import {
  MdStar,
  MdStarBorder,
  MdReport,
  MdCheckCircle,
  MdRefresh,
  MdSearch,
  MdRateReview,
  MdOutlineRateReview,
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
  FaClipboardList,
  FaDownload,
  FaCopy,
} from "react-icons/fa";

import {
  getAllReports,
  resolveReport,
  getAllRatings,
  updateRating,
  deleteRating,
  adminCreateRefund,
  overrideBookingCommission,
  getComplaintsList,
  getComplaintById,
  updateComplaintStatus,
  rejectComplaint,
} from "../utils/axiosInstance";
import { rebuildRatingAggregate } from "api/bookingsReports";
import { useAppSelector } from "store/hooks";
import { selectUser } from "store/slices/authSlice";

const BRAND = "#008080";
const GOLD = "#F5B700";

export default function ReportsManagement() {
  const isDark = false;
  const toast = useAppToast();
  const reduxUser = useAppSelector(selectUser);

  const [currentUser, setCurrentUser] = useState(reduxUser || null);
  const [activeTab, setActiveTab] = useState("reports");

  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

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

  useEffect(() => {
    if (reduxUser) {
      setCurrentUser(reduxUser);
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, [reduxUser]);

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

    return { name: "Platform / Direct Delivery", phone: "N/A", email: "N/A", assigned: false };
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
      setLoadError(err);
      toast.error(err, { title: "Fetch Error", description: "Failed to load reports.", duration: 3000, isClosable: true });
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
      setTotalPages(data?.totalPages || Math.ceil(ratingsList.length / itemsPerPage) || 1);
      setTotalItems(data?.total || ratingsList.length);
      return ratingsList;
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setLoadError(err);
      toast.error(err, { title: "Fetch Error", description: "Failed to load ratings.", duration: 3000, isClosable: true });
      return [];
    }
  }, [currentPage, itemsPerPage, toast]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoadError(null);
    setIsLoading(true);
    try {
      if (activeTab === "reports") {
        await fetchReports();
      } else {
        await fetchRatings();
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

  // Client-side filtering when searching/category filtering
  const filteredData = useMemo(() => {
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

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
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
            (item.comment || '').toLowerCase().includes(searchLower) ||
            (item.status || '').toLowerCase().includes(searchLower) ||
            (item.ratedBy || '').toLowerCase().includes(searchLower)
          );
        }
      });
    }

    return filtered;
  }, [activeTab, reports, ratings, selectedCategoryFilter, selectedStatusFilter, searchTerm]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const resolvedReports = reports.filter(
      (r) => r.status?.toLowerCase().includes("resolved")
    ).length;
    const openReports = reports.filter(
      (r) => r.status?.toLowerCase() === "open" || r.status?.toLowerCase() === "under_review"
    ).length;
    const totalRatings = ratings.length;
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + (r.rates || 0), 0) / ratings.length).toFixed(1)
        : "0.0";

    return {
      totalReports,
      resolvedReports,
      openReports,
      totalRatings,
      avgRating,
    };
  }, [reports, ratings]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategoryFilter("all");
    setSelectedStatusFilter("all");
    setCurrentPage(1);
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

    try {
      const detailedRes = await getComplaintById(item._id || item.id);
      const dossier = detailedRes.data || detailedRes.result || detailedRes.report || detailedRes.complaint || detailedRes;
      if (dossier && (dossier._id || dossier.id)) {
        setSelectedItem((prev) => ({ ...prev, ...dossier }));
      }
    } catch {
      // Keep item from list
    }
  };

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
      toast.error(err, { title: "Action Failed", description: "Failed to update report status.", duration: 3000, isClosable: true });
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
      } catch {
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
      toast.error(err, { title: "Rejection Failed", description: "Failed to reject complaint.", duration: 3000, isClosable: true });
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
      } catch {
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
      toast.error(err, { title: "Freeze Failed", description: "Failed to freeze payout.", duration: 3000, isClosable: true });
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
        } catch {
          // Fallback to update complaint directly
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
      } catch {
        await resolveReport(selectedItem._id || selectedItem.id, statusPayload);
      }

      toast({
        title: `Customer Refund Processed (₹${refundAmt})`,
        description: "Complaint resolved in customer's favor and refund record logged.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast.error(err, { title: "Refund Action Failed", description: "Failed to process customer refund.", duration: 3000, isClosable: true });
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
        } catch {
          // Fallback
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
      toast.error(err, { title: "Penalty Action Failed", description: "Failed to penalize technician.", duration: 3000, isClosable: true });
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
        description: "Rating and feedback comment updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err, { title: "Error", description: "Failed to update rating.", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleRebuildAggregate = async (item) => {
    const target = item?.technicianId || item?.technician || null;
    const service = item?.serviceId || item?.service || null;
    const targetType = target ? "technician" : "service";
    const rawTarget = target || service || item?.targetId || item?._id;
    const targetId =
      typeof rawTarget === "object" && rawTarget !== null
        ? rawTarget._id || rawTarget.id
        : rawTarget;
    if (!targetId) {
      toast({ title: "Cannot rebuild", description: "No aggregate target found on this rating.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await rebuildRatingAggregate(targetType, targetId);
      if (error) throw new Error(error);
      toast({ title: "Aggregate Rebuilt", description: `${targetType} ratings recalculated.`, status: "success", duration: 3000, isClosable: true });
      await fetchData();
    } catch (err) {
      toast.error(err, { title: "Rebuild failed", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await deleteRating(itemToDelete._id);
      toast({
        title: "Rating Deleted",
        description: "The rating has been deleted permanently.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast.error(err, { title: "Delete Failed", description: "Failed to delete rating.", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
    }
  };

  const renderStars = (rating, size = "sm") => {
    return (
      <Flex gap={0.5} align="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= (rating || 0) ? MdStar : MdStarBorder}
            color={star <= (rating || 0) ? GOLD : "gray.300"}
            boxSize={size === "xs" ? 3.5 : 4}
          />
        ))}
      </Flex>
    );
  };

  // CSV Export for active tab
  const handleExportCsv = () => {
    try {
      let csvContent = "";
      const dateStr = new Date().toISOString().slice(0, 10);
      let filename = `dispute_reports_${dateStr}.csv`;

      if (activeTab === "reports") {
        const headers = ["Case ID", "Category", "Customer Name", "Customer Phone", "Technician", "Related Item", "Status", "Complaint", "Created At"];
        const rows = filteredData.map((item) => {
          const cust = getCustomerDetails(item);
          const tech = getTechnicianDetails(item);
          const details = getItemDetails(item);
          return [
            item._id || item.id || "",
            `"${(item.category || item.reason || "").replace(/"/g, '""')}"`,
            `"${cust.name.replace(/"/g, '""')}"`,
            cust.phone || "",
            `"${tech.name.replace(/"/g, '""')}"`,
            `"${details.name.replace(/"/g, '""')}"`,
            item.status || "",
            `"${(item.complaint || item.description || "").replace(/"/g, '""')}"`,
            item.createdAt ? new Date(item.createdAt).toISOString() : "",
          ];
        });
        csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      } else {
        filename = `customer_ratings_${dateStr}.csv`;
        const headers = ["Rating ID", "Stars", "Comment", "Rated By", "Created At"];
        const rows = filteredData.map((r) => [
          r._id || r.id || "",
          r.rates || 0,
          `"${(r.comment || "").replace(/"/g, '""')}"`,
          `"${(r.ratedBy || "").replace(/"/g, '""')}"`,
          r.createdAt ? new Date(r.createdAt).toISOString() : "",
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
        title: "Data Exported",
        description: `Exported ${filename} successfully.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err, { title: "Export Failed" });
    }
  };

  if (!currentUser) return null;

  const modalItemDetails = selectedItem ? getItemDetails(selectedItem) : {};
  const modalTechDetails = selectedItem ? getTechnicianDetails(selectedItem) : {};
  const modalCustDetails = selectedItem ? getCustomerDetails(selectedItem) : {};

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
                QUALITY ASSURANCE & DISPUTE DESK
              </Tag>
              <Badge
                colorScheme="purple"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Box as="span" w="6px" h="6px" borderRadius="full" bg="purple.500" />
                Live Review Stream
              </Badge>
            </HStack>
            <Heading as="h1" size="lg" fontWeight="900" letterSpacing="-0.5px" color={isDark ? "white" : "gray.850"}>
              Reported Issues & Customer Ratings
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Investigate customer dispute claims, review counter-evidence, enforce SLA penalties, and monitor service rating scores.
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
              isLoading={isLoading}
              onClick={fetchData}
            >
              Refresh Desk
            </Button>
          </HStack>
        </Flex>

        {loadError && (
          <ErrorState
            compact
            error={loadError}
            title="Could not load reports or ratings"
            onRetry={fetchData}
          />
        )}

        {/* ================= 2. EXECUTIVE KPI CARDS ================= */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          {/* Card 1: Total Reports */}
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
                Total Dispute Reports
              </Text>
              <Box p={2.5} bg="purple.50" color="purple.600" borderRadius="10px">
                <Icon as={MdReport} boxSize={5} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {stats.totalReports}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="purple" fontSize="2xs" borderRadius="full" px={2}>
                {stats.openReports} Active Cases
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Logged disputes
              </Text>
            </HStack>
          </Box>

          {/* Card 2: Resolved Cases */}
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
                Resolved Disputes
              </Text>
              <Box p={2.5} bg="green.50" color="green.600" borderRadius="10px">
                <Icon as={MdCheckCircle} boxSize={5} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color="green.600">
              {stats.resolvedReports}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="green" fontSize="2xs" borderRadius="full" px={2}>
                {stats.totalReports > 0 ? `${Math.round((stats.resolvedReports / stats.totalReports) * 100)}% Rate` : "100% Rate"}
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Closed cases
              </Text>
            </HStack>
          </Box>

          {/* Card 3: Average Rating */}
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
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="yellow.400" />
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                Overall Rating Score
              </Text>
              <Box p={2.5} bg="yellow.50" color="yellow.600" borderRadius="10px">
                <Icon as={MdStar} boxSize={5} />
              </Box>
            </HStack>
            <HStack spacing={2} align="baseline">
              <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
                {stats.avgRating}
              </Text>
              <Text fontSize="sm" color="gray.400" fontWeight="bold">/ 5.0</Text>
            </HStack>
            <HStack spacing={1.5} mt={1}>
              {renderStars(Number(stats.avgRating), "xs")}
              <Text fontSize="2xs" color="gray.500" ml={1}>
                Platform satisfaction
              </Text>
            </HStack>
          </Box>

          {/* Card 4: Total Ratings */}
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
                Verified Reviews
              </Text>
              <Box p={2.5} bg="teal.50" color="teal.600" borderRadius="10px">
                <Icon as={MdOutlineRateReview} boxSize={5} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color={isDark ? "white" : "gray.850"}>
              {stats.totalRatings}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="teal" fontSize="2xs" borderRadius="full" px={2}>
                Customer Submissions
              </Badge>
              <Text fontSize="2xs" color="gray.500">
                Audited feedback
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* ================= 3. WORKSPACE CONTAINER WITH SEGMENTED TABS ================= */}
        <Box
          bg={isDark ? "gray.850" : "white"}
          borderRadius="20px"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
          overflow="hidden"
        >
          {/* Top Segmented Navigation Header */}
          <Flex
            borderBottom="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            px={6}
            pt={4}
            bg={isDark ? "gray.900" : "gray.50"}
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
            <HStack spacing={2}>
              <Button
                size="md"
                variant="ghost"
                borderRadius="10px 10px 0 0"
                fontWeight="800"
                fontSize="sm"
                px={5}
                py={3}
                color={activeTab === "reports" ? BRAND : "gray.500"}
                bg={activeTab === "reports" ? (isDark ? "gray.850" : "white") : "transparent"}
                borderTop={activeTab === "reports" ? "3px solid" : "none"}
                borderTopColor={BRAND}
                _hover={{ color: BRAND }}
                leftIcon={<MdReport size={18} />}
                onClick={() => setActiveTab("reports")}
              >
                Dispute Reports & Complaints
                <Badge ml={2} colorScheme={activeTab === "reports" ? "teal" : "gray"} borderRadius="full" fontSize="2xs">
                  {reports.length}
                </Badge>
              </Button>

              <Button
                size="md"
                variant="ghost"
                borderRadius="10px 10px 0 0"
                fontWeight="800"
                fontSize="sm"
                px={5}
                py={3}
                color={activeTab === "ratings" ? BRAND : "gray.500"}
                bg={activeTab === "ratings" ? (isDark ? "gray.850" : "white") : "transparent"}
                borderTop={activeTab === "ratings" ? "3px solid" : "none"}
                borderTopColor={BRAND}
                _hover={{ color: BRAND }}
                leftIcon={<MdStar size={18} />}
                onClick={() => setActiveTab("ratings")}
              >
                Customer Ratings & Feedback
                <Badge ml={2} colorScheme={activeTab === "ratings" ? "teal" : "gray"} borderRadius="full" fontSize="2xs">
                  {ratings.length}
                </Badge>
              </Button>
            </HStack>

            <Text fontSize="xs" color="gray.400" display={{ base: "none", md: "block" }}>
              {activeTab === "reports" ? "Case Management Matrix" : "Ratings Quality Audit"}
            </Text>
          </Flex>

          {/* Filter Toolbar */}
          <Box p={5} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
            <VStack spacing={3} align="stretch">
              <Flex
                direction={{ base: "column", lg: "row" }}
                justify="space-between"
                align={{ base: "stretch", lg: "center" }}
                gap={3}
              >
                <HStack spacing={3} flex="1" flexWrap="wrap">
                  {/* Search box */}
                  <InputGroup size="sm" maxW={{ base: "100%", sm: "300px" }}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={MdSearch} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                      placeholder={
                        activeTab === "reports"
                          ? "Search customer, technician, booking..."
                          : "Search comments, customer name..."
                      }
                      value={searchTerm}
                      onChange={handleSearchChange}
                      borderRadius="8px"
                      bg={isDark ? "gray.900" : "white"}
                      borderColor={isDark ? "gray.700" : "gray.300"}
                      fontSize="xs"
                    />
                  </InputGroup>

                  {/* Status Filter for Reports */}
                  {activeTab === "reports" && (
                    <Select
                      size="sm"
                      borderRadius="8px"
                      maxW="170px"
                      value={selectedStatusFilter}
                      onChange={(e) => {
                        setSelectedStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      bg={isDark ? "gray.900" : "white"}
                      borderColor={isDark ? "gray.700" : "gray.300"}
                      fontSize="xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved_refunded">Resolved (Refunded)</option>
                      <option value="resolved_no_refund">Resolved (No Refund)</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="expired">Expired</option>
                    </Select>
                  )}

                  {/* Category Filter for Reports */}
                  {activeTab === "reports" && (
                    <Select
                      size="sm"
                      borderRadius="8px"
                      maxW="180px"
                      value={selectedCategoryFilter}
                      onChange={(e) => {
                        setSelectedCategoryFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      bg={isDark ? "gray.900" : "white"}
                      borderColor={isDark ? "gray.700" : "gray.300"}
                      fontSize="xs"
                    >
                      <option value="all">All Categories</option>
                      <option value="quality_dispute">Quality Dispute</option>
                      <option value="damage">Property Damage</option>
                      <option value="incomplete_work">Incomplete Work</option>
                      <option value="technician_misconduct">Tech Misconduct</option>
                      <option value="goodwill">Goodwill / Courtesy</option>
                      <option value="product_issue">Product Defect</option>
                      <option value="other">Other Issue</option>
                    </Select>
                  )}
                </HStack>

                {(searchTerm || selectedCategoryFilter !== "all" || selectedStatusFilter !== "all") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    onClick={handleClearFilters}
                    borderRadius="8px"
                    fontSize="xs"
                  >
                    Reset Filters
                  </Button>
                )}
              </Flex>

              {/* Quick Category Filter Pills Bar (For Reports) */}
              {activeTab === "reports" && (
                <Flex align="center" gap={2} pt={1} overflowX="auto">
                  <Text fontSize="2xs" color="gray.400" fontWeight="700" textTransform="uppercase" flexShrink={0}>
                    Quick Categories:
                  </Text>
                  {[
                    { id: "all", label: "All" },
                    { id: "quality_dispute", label: "Quality Dispute" },
                    { id: "damage", label: "Property Damage" },
                    { id: "incomplete_work", label: "Incomplete Work" },
                    { id: "technician_misconduct", label: "Tech Misconduct" },
                    { id: "goodwill", label: "Goodwill" },
                    { id: "product_issue", label: "Product Defect" },
                    { id: "other", label: "Other" },
                  ].map((cat) => {
                    const isSelected = selectedCategoryFilter === cat.id;
                    return (
                      <Button
                        key={cat.id}
                        size="xs"
                        h="24px"
                        px={3}
                        borderRadius="full"
                        bg={isSelected ? BRAND : isDark ? "gray.800" : "gray.100"}
                        color={isSelected ? "white" : isDark ? "gray.300" : "gray.600"}
                        _hover={{ bg: isSelected ? BRAND : isDark ? "gray.700" : "gray.200" }}
                        onClick={() => {
                          setSelectedCategoryFilter(cat.id);
                          setCurrentPage(1);
                        }}
                        fontSize="3xs"
                        fontWeight={isSelected ? "700" : "500"}
                        flexShrink={0}
                      >
                        {cat.label}
                      </Button>
                    );
                  })}
                </Flex>
              )}
            </VStack>
          </Box>

          {/* Table / List Workspace */}
          <Box p={6}>
            {isLoading ? (
              <Center py={16}>
                <VStack spacing={3}>
                  <Spinner size="lg" color={BRAND} thickness="3px" />
                  <Text fontSize="sm" color="gray.500" fontWeight="600">
                    Loading {activeTab === "reports" ? "dispute records" : "customer reviews"}...
                  </Text>
                </VStack>
              </Center>
            ) : filteredData.length === 0 ? (
              <Center py={16} bg={isDark ? "gray.800" : "gray.50"} borderRadius="16px">
                <VStack spacing={2}>
                  <Icon as={activeTab === "reports" ? MdReport : MdStar} boxSize={10} color="gray.300" />
                  <Text fontWeight="700" fontSize="md" color={isDark ? "white" : "gray.700"}>
                    No records found
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Try adjusting search keywords or changing category filters.
                  </Text>
                </VStack>
              </Center>
            ) : activeTab === "reports" ? (
              /* ================= TAB 1: REPORTS TABLE ================= */
              <VStack spacing={4} align="stretch">
                <Box overflowX="auto" borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                  <Table variant="simple" size="sm">
                    <Thead bg={isDark ? "gray.900" : "gray.50"}>
                      <Tr>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase" py={3.5}>#</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Case ID & Category</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Customer (Reporter)</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Subject (Technician)</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Booked Item & Ref</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Complaint Statement</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Status</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Date</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase" textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, idx) => {
                        const cust = getCustomerDetails(item);
                        const tech = getTechnicianDetails(item);
                        const details = getItemDetails(item);
                        const catMeta = getCategoryMeta(item.category || item.reason);
                        const caseId = item._id || item.id;

                        return (
                          <Tr
                            key={caseId || idx}
                            _hover={{ bg: isDark ? "gray.800" : "gray.50" }}
                            transition="background 0.15s ease"
                          >
                            <Td fontSize="xs" color="gray.500" fontWeight="600">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </Td>

                            <Td>
                              <VStack align="flex-start" spacing={1}>
                                <Badge colorScheme={catMeta.color} borderRadius="full" px={2} py={0.5} fontSize="3xs">
                                  {catMeta.label}
                                </Badge>
                                {caseId && (
                                  <HStack spacing={1}>
                                    <Text fontSize="3xs" color="gray.400" fontFamily="mono">
                                      #{String(caseId).slice(-6).toUpperCase()}
                                    </Text>
                                    <IconButton
                                      aria-label="Copy case ID"
                                      icon={<FaCopy size={9} />}
                                      size="xs"
                                      h="14px"
                                      w="14px"
                                      minW="14px"
                                      variant="ghost"
                                      color="gray.400"
                                      _hover={{ color: BRAND }}
                                      onClick={() => copyToClipboard(caseId, "Case ID")}
                                    />
                                  </HStack>
                                )}
                              </VStack>
                            </Td>

                            <Td maxW="160px">
                              <HStack spacing={1.5}>
                                <Icon as={FaUser} boxSize={3} color="blue.500" />
                                <Box>
                                  <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.800"} noOfLines={1}>
                                    {cust.name}
                                  </Text>
                                  <Text fontSize="3xs" color="gray.400">
                                    {cust.phone}
                                  </Text>
                                </Box>
                              </HStack>
                            </Td>

                            <Td maxW="160px">
                              <HStack spacing={1.5}>
                                <Icon as={FaTools} boxSize={3} color="orange.500" />
                                <Box>
                                  <Text fontSize="xs" fontWeight="600" color={isDark ? "gray.200" : "gray.700"} noOfLines={1}>
                                    {tech.name}
                                  </Text>
                                  <Text fontSize="3xs" color="gray.400">
                                    {tech.assigned ? tech.phone : "No Tech"}
                                  </Text>
                                </Box>
                              </HStack>
                            </Td>

                            <Td maxW="160px">
                              <VStack align="flex-start" spacing={0}>
                                <Text fontSize="xs" fontWeight="600" color={isDark ? "white" : "gray.800"} noOfLines={1}>
                                  {details.name}
                                </Text>
                                <Text fontSize="3xs" color="gray.400" fontFamily="mono">
                                  Ref: #{details.ref}
                                </Text>
                              </VStack>
                            </Td>

                            <Td maxW="200px">
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {item.complaint || item.description || item.reason || "No statement"}
                              </Text>
                            </Td>

                            <Td>
                              <StatusBadge preset="report" status={item.status} />
                            </Td>

                            <Td fontSize="2xs" color="gray.500" whiteSpace="nowrap">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </Td>

                            <Td textAlign="center">
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="teal"
                                borderRadius="8px"
                                fontWeight="700"
                                leftIcon={<FaEye size={11} />}
                                onClick={() => handleViewDetails(item)}
                              >
                                Review Dossier
                              </Button>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination */}
                <Flex justify="space-between" align="center" pt={2} flexWrap="wrap" gap={3}>
                  <Text fontSize="xs" color="gray.500">
                    Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> • Total {totalItems} records
                  </Text>

                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      leftIcon={<FaChevronLeft size={10} />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      rightIcon={<FaChevronRight size={10} />}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            ) : (
              /* ================= TAB 2: RATINGS TABLE ================= */
              <VStack spacing={4} align="stretch">
                <Box overflowX="auto" borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                  <Table variant="simple" size="sm">
                    <Thead bg={isDark ? "gray.900" : "gray.50"}>
                      <Tr>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase" py={3.5}>#</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Rating & Stars</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Customer Comment</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Customer (Rated By)</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Associated Service</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase">Date</Th>
                        <Th color="gray.500" fontSize="2xs" textTransform="uppercase" textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r, idx) => {
                        const serviceName = typeof r.serviceId === "object" ? r.serviceId?.serviceName : r.serviceId || "Service Order";

                        return (
                          <Tr
                            key={r._id || idx}
                            _hover={{ bg: isDark ? "gray.800" : "gray.50" }}
                            transition="background 0.15s ease"
                          >
                            <Td fontSize="xs" color="gray.500" fontWeight="600">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </Td>

                            <Td>
                              <HStack spacing={2}>
                                {renderStars(r.rates)}
                                <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.850"}>
                                  {r.rates || 0}.0
                                </Text>
                              </HStack>
                            </Td>

                            <Td maxW="280px">
                              <Text fontSize="xs" color="gray.700" fontStyle="italic" noOfLines={2}>
                                "{r.comment || "No feedback text provided."}"
                              </Text>
                            </Td>

                            <Td fontSize="xs" fontWeight="600" color={isDark ? "gray.200" : "gray.700"}>
                              {r.ratedBy || "Customer"}
                            </Td>

                            <Td fontSize="xs" color="gray.600">
                              {serviceName}
                            </Td>

                            <Td fontSize="2xs" color="gray.500" whiteSpace="nowrap">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </Td>

                            <Td textAlign="center">
                              <HStack spacing={1} justify="center">
                                <IconButton
                                  aria-label="View rating"
                                  icon={<FaEye size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewDetails(r)}
                                />
                                <IconButton
                                  aria-label="Edit rating"
                                  icon={<FaEdit size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="orange"
                                  onClick={() => handleEditRating(r)}
                                />
                                <IconButton
                                  aria-label="Rebuild aggregate"
                                  icon={<FaHistory size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="purple"
                                  isLoading={actionLoading}
                                  onClick={() => handleRebuildAggregate(r)}
                                />
                                <IconButton
                                  aria-label="Delete rating"
                                  icon={<FaTrash size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteClick(r)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination */}
                <Flex justify="space-between" align="center" pt={2} flexWrap="wrap" gap={3}>
                  <Text fontSize="xs" color="gray.500">
                    Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> • Total {totalItems} reviews
                  </Text>

                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      leftIcon={<FaChevronLeft size={10} />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      rightIcon={<FaChevronRight size={10} />}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            )}
          </Box>
        </Box>
      </VStack>

      {/* ================= 4. INVESTIGATION & RESOLUTION DOSSIER MODAL ================= */}
      <AppModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        size="3xl"
        title={activeTab === "reports" ? "Dispute Investigation Dossier" : "Rating Details"}
        subtitle={
          activeTab === "reports"
            ? `Case #${String(selectedItem?._id || selectedItem?.id || "").slice(-8).toUpperCase()} • Full evidence claims, counter-defense, and SLA enforcement desk.`
            : "Customer rating review and aggregate score."
        }
        icon={activeTab === "reports" ? MdReport : MdStar}
        iconColor={BRAND}
      >
        {selectedItem && (
          <VStack spacing={5} align="stretch" py={1}>
            {activeTab === "reports" ? (
              <>
                {/* 3 Entity Cards: Item, Technician, Customer */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  {/* Entity 1: Related Item */}
                  <Box p={3.5} bg={isDark ? "gray.800" : "teal.50"} borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "teal.200"}>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <HStack spacing={1.5}>
                        <Icon as={FaBoxOpen} color="teal.500" boxSize={3.5} />
                        <Text fontSize="3xs" fontWeight="800" color="teal.800" textTransform="uppercase">
                          Booked Item
                        </Text>
                      </HStack>
                      <Badge colorScheme={modalItemDetails.type === "PRODUCT" ? "purple" : "teal"} fontSize="3xs">
                        {modalItemDetails.type}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.850"} noOfLines={2}>
                      {modalItemDetails.name}
                    </Text>
                    <HStack justify="space-between" mt={2} pt={1.5} borderTop="1px dashed" borderColor={isDark ? "gray.700" : "teal.200"} fontSize="3xs">
                      <Text color="gray.500">Ref: #{modalItemDetails.ref}</Text>
                      {modalItemDetails.price && (
                        <Text fontWeight="800" color="teal.600">₹{modalItemDetails.price}</Text>
                      )}
                    </HStack>
                  </Box>

                  {/* Entity 2: Technician */}
                  <Box p={3.5} bg={isDark ? "gray.800" : "orange.50"} borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "orange.200"}>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <HStack spacing={1.5}>
                        <Icon as={FaTools} color="orange.500" boxSize={3.5} />
                        <Text fontSize="3xs" fontWeight="800" color="orange.800" textTransform="uppercase">
                          Technician
                        </Text>
                      </HStack>
                      <Badge colorScheme={modalTechDetails.assigned ? "orange" : "gray"} fontSize="3xs">
                        {modalTechDetails.assigned ? "Assigned" : "Unassigned"}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.850"} noOfLines={1}>
                      {modalTechDetails.name}
                    </Text>
                    <HStack justify="space-between" mt={2} pt={1.5} borderTop="1px dashed" borderColor={isDark ? "gray.700" : "orange.200"} fontSize="3xs">
                      <Text color="gray.500">Ph: {modalTechDetails.phone}</Text>
                    </HStack>
                  </Box>

                  {/* Entity 3: Customer */}
                  <Box p={3.5} bg={isDark ? "gray.800" : "blue.50"} borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "blue.200"}>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <HStack spacing={1.5}>
                        <Icon as={FaUser} color="blue.500" boxSize={3.5} />
                        <Text fontSize="3xs" fontWeight="800" color="blue.800" textTransform="uppercase">
                          Customer
                        </Text>
                      </HStack>
                      <Badge colorScheme="blue" fontSize="3xs">
                        Reporter
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.850"} noOfLines={1}>
                      {modalCustDetails.name}
                    </Text>
                    <HStack justify="space-between" mt={2} pt={1.5} borderTop="1px dashed" borderColor={isDark ? "gray.700" : "blue.200"} fontSize="3xs">
                      <Text color="gray.500">Ph: {modalCustDetails.phone}</Text>
                    </HStack>
                  </Box>
                </SimpleGrid>

                {/* Customer Complaint Statement */}
                <Box p={4} bg={isDark ? "gray.800" : "purple.50"} borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "purple.200"}>
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={FaExclamationTriangle} color="purple.600" boxSize={4} />
                      <Text fontWeight="800" fontSize="xs" color="purple.900" textTransform="uppercase">
                        Customer Complaint Statement
                      </Text>
                    </HStack>
                    <Badge colorScheme={getCategoryMeta(selectedItem.category || selectedItem.reason).color} fontSize="3xs">
                      {getCategoryMeta(selectedItem.category || selectedItem.reason).label}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={isDark ? "gray.200" : "gray.800"} whiteSpace="pre-wrap" lineHeight="relaxed">
                    {formatCleanComplaintText(selectedItem.complaint || selectedItem.description || selectedItem.reason)}
                  </Text>

                  {selectedItem.image && (
                    <Box mt={3}>
                      <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={1}>
                        Attached Customer Evidence:
                      </Text>
                      <Image
                        src={selectedItem.image}
                        alt="Evidence"
                        maxH="140px"
                        borderRadius="10px"
                        border="1px solid"
                        borderColor="gray.200"
                        objectFit="contain"
                      />
                    </Box>
                  )}
                </Box>

                {/* Technician Written Defense (if present) */}
                {(selectedItem.technicianResponse || selectedItem.technicianExplanation) && (
                  <Box p={4} bg={isDark ? "gray.800" : "orange.50"} borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "orange.200"}>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FaTools} color="orange.600" boxSize={4} />
                      <Text fontWeight="800" fontSize="xs" color="orange.900" textTransform="uppercase">
                        Technician Counter Defense
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={isDark ? "gray.200" : "gray.800"} whiteSpace="pre-wrap" lineHeight="relaxed">
                      "{selectedItem.technicianResponse || selectedItem.technicianExplanation}"
                    </Text>
                  </Box>
                )}

                {/* Timeline & Previous Notes */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                    <HStack spacing={1.5} mb={0.5}>
                      <Icon as={FaClock} color="gray.500" boxSize={3.5} />
                      <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                        Reported Date
                      </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.800"}>
                      {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString("en-IN") : "N/A"}
                    </Text>
                  </Box>

                  <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                    <HStack spacing={1.5} mb={0.5}>
                      <Icon as={FaHourglassHalf} color="amber.600" boxSize={3.5} />
                      <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                        SLA Window
                      </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.800"}>
                      {selectedItem.slaDeadline ? new Date(selectedItem.slaDeadline).toLocaleString("en-IN") : "Standard 24h Window"}
                    </Text>
                  </Box>
                </SimpleGrid>

                {selectedItem.resolutionNote && (
                  <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px" borderLeft="4px solid" borderColor="teal.500">
                    <HStack spacing={1.5} mb={1}>
                      <Icon as={FaClipboardList} color="teal.500" boxSize={3.5} />
                      <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                        Previous Investigation Note
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={isDark ? "gray.200" : "gray.800"} fontWeight="600">
                      {selectedItem.resolutionNote}
                    </Text>
                  </Box>
                )}

                <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                {/* Enforcement Controls */}
                <Box p={4} bg={isDark ? "gray.800" : "white"} borderRadius="14px" border="2px solid" borderColor={`${BRAND}40`}>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FaGavel} color={BRAND} boxSize={4} />
                    <Text fontWeight="800" fontSize="xs" color={isDark ? "white" : "gray.850"} textTransform="uppercase">
                      Enforcement Actions & Resolution Desk
                    </Text>
                  </HStack>

                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontSize="2xs" color="gray.500" fontWeight="700" mb={1} textTransform="uppercase">
                        Investigation Findings / Note
                      </Text>
                      <Textarea
                        size="sm"
                        borderRadius="8px"
                        rows={2}
                        placeholder="Enter investigation findings, reason for customer refund or penalty rationale..."
                        value={resolutionNoteInput}
                        onChange={(e) => setResolutionNoteInput(e.target.value)}
                        bg={isDark ? "gray.900" : "white"}
                      />
                    </Box>

                    {/* Quick Direct Actions Matrix */}
                    <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        borderRadius="8px"
                        fontWeight="700"
                        onClick={() => triggerConfirmation("freeze")}
                        isLoading={actionLoading}
                      >
                        🧊 Freeze Payout
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="green"
                        borderRadius="8px"
                        fontWeight="700"
                        onClick={() => triggerConfirmation("refund")}
                        isLoading={actionLoading}
                      >
                        💸 Refund Customer
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="orange"
                        borderRadius="8px"
                        fontWeight="700"
                        onClick={() => triggerConfirmation("penalize")}
                        isLoading={actionLoading}
                      >
                        ⚠️ Penalize Tech
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        borderRadius="8px"
                        fontWeight="700"
                        onClick={() => triggerConfirmation("reject")}
                        isLoading={actionLoading}
                      >
                        ❌ Reject Complaint
                      </Button>
                    </SimpleGrid>

                    <HStack spacing={2} pt={1}>
                      <Select
                        size="sm"
                        borderRadius="8px"
                        value={selectedStatusAction}
                        onChange={(e) => setSelectedStatusAction(e.target.value)}
                        bg={isDark ? "gray.900" : "white"}
                        maxW="260px"
                      >
                        <option value="under_review">🔍 Under Review</option>
                        <option value="resolved_refunded">✅ Resolve (Refund Customer)</option>
                        <option value="resolved_no_refund">🛑 Resolve (No Refund)</option>
                      </Select>
                      <Button
                        size="sm"
                        flex="1"
                        bg={BRAND}
                        color="white"
                        borderRadius="8px"
                        fontWeight="700"
                        _hover={{ bg: "#006666" }}
                        isLoading={actionLoading}
                        onClick={() => triggerConfirmation("execute")}
                      >
                        Execute Status Update
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </>
            ) : (
              /* Rating details */
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={isDark ? "gray.800" : "yellow.50"} borderRadius="14px" border="1px solid" borderColor={isDark ? "gray.700" : "yellow.200"}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      {renderStars(selectedItem.rates)}
                      <Text fontSize="lg" fontWeight="900" color={isDark ? "white" : "gray.850"}>
                        {selectedItem.rates || 0}.0 / 5.0
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString("en-IN") : ""}
                    </Text>
                  </HStack>
                </Box>

                <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="14px">
                  <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={1}>
                    Review Comment
                  </Text>
                  <Text fontSize="sm" color={isDark ? "gray.200" : "gray.800"} fontStyle="italic">
                    "{selectedItem.comment || "No comment provided."}"
                  </Text>
                </Box>

                <SimpleGrid columns={2} spacing={3}>
                  <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                    <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                      Customer (Reviewer)
                    </Text>
                    <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.800"} mt={0.5}>
                      {selectedItem.ratedBy || "Customer"}
                    </Text>
                  </Box>
                  <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px">
                    <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                      Service
                    </Text>
                    <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.800"} mt={0.5}>
                      {typeof selectedItem.serviceId === "object" ? selectedItem.serviceId?.serviceName : selectedItem.serviceId || "Service Order"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Button
                  leftIcon={<FaHistory />}
                  colorScheme="purple"
                  variant="outline"
                  size="sm"
                  borderRadius="8px"
                  fontWeight="700"
                  onClick={() => handleRebuildAggregate(selectedItem)}
                  isLoading={actionLoading}
                >
                  Recalculate Rating Aggregate
                </Button>
              </VStack>
            )}

            <Flex justify="flex-end" pt={2}>
              <Button size="sm" variant="outline" borderRadius="8px" onClick={() => setIsDetailModalOpen(false)}>
                Close Dossier
              </Button>
            </Flex>
          </VStack>
        )}
      </AppModal>

      {/* ================= 5. EDIT RATING MODAL ================= */}
      <AppModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="md"
        title="Edit Customer Rating"
        subtitle="Modify score rating and review feedback statement."
        icon={MdRateReview}
        iconColor={BRAND}
      >
        <VStack spacing={4} align="stretch" py={2}>
          <Box>
            <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
              Star Rating
            </Text>
            <HStack spacing={2}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  aria-label={`Rate ${star} stars`}
                  icon={<MdStar size={24} />}
                  size="md"
                  color={star <= editRates ? GOLD : "gray.300"}
                  bg="transparent"
                  _hover={{ transform: "scale(1.15)" }}
                  _active={{ transform: "scale(0.95)" }}
                  onClick={() => setEditRates(star)}
                />
              ))}
              <Text fontSize="md" fontWeight="800" color={isDark ? "white" : "gray.800"} ml={2}>
                {editRates} of 5
              </Text>
            </HStack>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={1}>
              Review Comment
            </Text>
            <Textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Enter customer review comment..."
              size="sm"
              borderRadius="8px"
              rows={3}
              bg={isDark ? "gray.900" : "white"}
            />
          </Box>

          <Flex justify="flex-end" gap={2} pt={2}>
            <Button size="sm" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              bg={BRAND}
              color="white"
              _hover={{ bg: "#006666" }}
              borderRadius="8px"
              fontWeight="700"
              isLoading={actionLoading}
              onClick={handleUpdateRating}
            >
              Update Rating
            </Button>
          </Flex>
        </VStack>
      </AppModal>

      {/* ================= 6. DELETE RATING CONFIRM MODAL ================= */}
      <ConfirmActionModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Rating"
        description="Are you sure you want to delete this rating permanently? This action cannot be reversed."
        confirmText="Yes, Delete Rating"
        confirmColorScheme="red"
        isLoading={actionLoading}
      />

      {/* ================= 7. ENFORCEMENT ACTION CONFIRMATION MODAL ================= */}
      <AppModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        size="lg"
        title={confirmModalData.title || "Confirm Enforcement Action"}
        subtitle="Review action parameters and execute financial/status modification."
        icon={FaExclamationTriangle}
        iconColor={confirmModalData.colorScheme === "red" ? "red.500" : BRAND}
      >
        <VStack align="stretch" spacing={4} py={2}>
          <Box p={3.5} bg={`${confirmModalData.colorScheme}.50`} borderRadius="12px" border="1px solid" borderColor={`${confirmModalData.colorScheme}.200`}>
            <Text fontSize="xs" color={`${confirmModalData.colorScheme}.900`} fontWeight="600" lineHeight="relaxed">
              {confirmModalData.description}
            </Text>
          </Box>

          {selectedItem && (() => {
            const fin = getFinancialBreakdown(selectedItem);
            return (
              <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="14px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={2}>
                  Order Financial Context
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  <Box p={2.5} bg={isDark ? "gray.900" : "white"} borderRadius="10px">
                    <Text fontSize="3xs" color="gray.500">Customer Paid</Text>
                    <Text fontSize="sm" fontWeight="800" color="green.600">₹{fin.customerPays}</Text>
                  </Box>
                  <Box p={2.5} bg={isDark ? "gray.900" : "white"} borderRadius="10px">
                    <Text fontSize="3xs" color="gray.500">Tech Payout</Text>
                    <Text fontSize="sm" fontWeight="800" color="purple.600">₹{fin.techPayout}</Text>
                  </Box>
                  <Box p={2.5} bg={isDark ? "gray.900" : "white"} borderRadius="10px">
                    <Text fontSize="3xs" color="gray.500">Platform Fee</Text>
                    <Text fontSize="sm" fontWeight="800" color="teal.600">₹{fin.platformFee}</Text>
                  </Box>
                </Grid>

                {(confirmModalData.actionType === "refund" ||
                  confirmModalData.actionType === "penalize" ||
                  confirmModalData.actionType === "freeze") && (
                  <Box mt={3} pt={3} borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                    <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={1}>
                      Action Amount (₹)
                    </Text>
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <Text fontWeight="bold" color="gray.500">₹</Text>
                      </InputLeftElement>
                      <Input
                        type="number"
                        value={customAmountInput}
                        onChange={(e) => setCustomAmountInput(e.target.value)}
                        borderRadius="8px"
                        fontWeight="800"
                        bg={isDark ? "gray.900" : "white"}
                      />
                    </InputGroup>
                  </Box>
                )}
              </Box>
            );
          })()}

          <Flex justify="flex-end" gap={2} pt={2}>
            <Button size="sm" variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme={confirmModalData.colorScheme}
              borderRadius="8px"
              fontWeight="700"
              isLoading={actionLoading}
              onClick={handleProceedConfirmAction}
            >
              Confirm & Execute
            </Button>
          </Flex>
        </VStack>
      </AppModal>
    </Box>
  );
}
