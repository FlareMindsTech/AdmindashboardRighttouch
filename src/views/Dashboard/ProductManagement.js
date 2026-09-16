// ProductManagement.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCategories,
  createCategories,
  getAllProducts,
  createProducts,
  updateCategories,
  deleteCategory,
  updateProducts,
  deleteProducts,
  uploadProductImage,
  uploadProductImages,
  uploadImageCategory,
  removeCategoryImage,
  deleteProductImage,
  getAllProductBookings,
  updateProductBooking,
  cancelProductBooking,
  adminListQuoteRequestsController,
  adminGetQuoteRequestController,
  adminAssignQuoteRequestController,
  adminUpdateQuoteRequestStatusController,
  createAdminQuotation,
  getAdminQuotationsList,
  getAdminQuotationById,
  updateAdminQuotation,
  sendAdminQuotation,
  resendAdminQuotation,
  reviseAdminQuotation,
  deleteAdminQuoteRequest,
  deleteAdminQuotation,
  updateAdminQuotationPaymentStatus,
  adminRecordManualProductBookingPayment,
  adminUpdateProductBookingStatus,
  adminCompleteProductBooking,
  adminGetInventory,
  adminUpdateStock,
  adminIncreaseStock,
  adminDecreaseStock,
  adminGetStockHistory,
  adminGetProductPayments,
  adminGetProductPaymentById,
  adminGetBookingPaymentsHistory,
  adminGetPaymentAttempts,
  adminGetRazorpayPaymentDetails,
  adminGetManualPayments,
  adminGetManualPaymentById,
  adminGetRefundRequests,
  adminGetRefundDetails,
  adminCreatePaymentRefund,
  adminGetRefundHistory,
  adminGetReconciliationSummary,
  adminGetUnmatchedPayments,
  adminReconcilePayment,
  adminGetProductNotifications,
  adminGetNotificationById,
  adminResendNotification,
  adminGetProductDashboardSummary,
  adminGetSalesReport,
  adminGetPaymentReport,
  adminGetQuoteReport,
  adminGetProductPerformanceReport,
  adminExportSalesReport,
  adminGetProductAuditLogs,
  adminGetAuditLogById,
  adminToggleProductStatus,
  adminToggleCategoryStatus,
} from "../utils/axiosInstance";

import {
  Flex,
  Grid,
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
  Badge,
  Heading,
  Text,
  useToast,
  Icon,
  Button,
  IconButton,
  Box,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Select,
  Image,
  Textarea,
  Spinner,
  Center,
  SimpleGrid,
  Switch,
  Checkbox,
  Stack,
  VStack,
  HStack,
  Avatar,
  Tooltip,
  Divider,
  useBreakpointValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Portal,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaUsers,
  FaArrowLeft,
  FaEye,
  FaEdit,
  FaPlusCircle,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaChartLine,
  FaPlus,
  FaTimes,
  FaBox,
  FaTag,
  FaRupeeSign,
  FaBoxes,
  FaFileInvoiceDollar,
  FaQuoteRight,
  FaPaperPlane,
  FaRedo,
  FaFileContract,
  FaUserCheck,
  FaExchangeAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaHistory,
  FaClock,
  FaShippingFast,
  FaCheckDouble,
  FaPrint,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaLayerGroup,
  FaSyncAlt,
  FaPercent,
  FaCreditCard,
  FaQuestionCircle,
  FaClipboardCheck,
  FaBan,
  FaFileDownload,
} from "react-icons/fa";
import { MdCategory, MdInventory, MdWarning } from "react-icons/md";

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

// Mobile Card Component for Categories
const CategoryMobileCard = ({ cat, idx, indexOfFirstItem, onView, onEdit, onDelete, onAddProduct }) => {
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
          {cat.image || cat.url ? (
            <Image
              src={cat.image || cat.url}
              alt={cat.category || cat.name}
              boxSize="24px"
              borderRadius="full"
              objectFit="cover"
            />
          ) : (
            <IconBox h="24px" w="24px" bg={customColor}>
              <Icon as={MdCategory} h="12px" w="12px" color="white" />
            </IconBox>
          )}
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {cat.category || cat.name}
          </Text>
        </HStack>
        <Badge
          bg="#dffff9ff"
          color="#008080"
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          Active
        </Badge>
      </Flex>

      <Text fontSize="2xs" color="gray.600" noOfLines={2} mb={2}>
        {cat.description || "No description"}
      </Text>

      <Flex gap={2} justify="space-between" align="center">
        <Button
          leftIcon={<FaPlus />}
          bg="white"
          color="#008080"
          border="1px"
          borderColor="#008080"
          _hover={{ bg: "#008080", color: "white" }}
          size="xs"
          onClick={() => onAddProduct(cat)}
        >
          Add Product
        </Button>

        <HStack spacing={1}>
          <IconButton
            aria-label="View"
            icon={<FaEye />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            onClick={() => onView(cat)}
          />
          <IconButton
            aria-label="Edit"
            icon={<FaEdit />}
            size="xs"
            colorScheme="teal"
            variant="ghost"
            onClick={() => onEdit(cat)}
          />
          <IconButton
            aria-label="Delete"
            icon={<FaTrash />}
            size="xs"
            colorScheme="red"
            variant="ghost"
            onClick={() => onDelete(cat)}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

// Mobile Card Component for Products
const ProductMobileCard = ({ prod, idx, indexOfFirstItem, onView, onEdit, onDelete, categories }) => {
  const customColor = "#008080";

  // Get category name
  const getCategoryName = () => {
    const categoryData = prod.categoryId || prod.category;
    const isObject = typeof categoryData === 'object' && categoryData !== null;
    const catId = isObject ? categoryData._id : categoryData;
    const catObj = categories.find(c => c._id === catId) || (isObject ? categoryData : null);
    return catObj?.category || catObj?.name || "N/A";
  };

  const priceRange = prod.estimatedPriceFrom && prod.estimatedPriceTo ?
    `₹${prod.estimatedPriceFrom} - ₹${prod.estimatedPriceTo}` :
    (prod.variants?.length > 0 ?
      `₹${Math.min(...prod.variants.map(v => v.price || 0))} - ₹${Math.max(...prod.variants.map(v => v.price || 0))}` :
      (prod.price ? `₹${prod.price}` : "N/A"));

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
          <Avatar
            size="xs"
            name={prod.name}
            src={prod.images?.[0]?.url || prod.images?.[0] || prod.productImages?.[0]?.url}
          />
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {prod.name}
          </Text>
        </HStack>
        <Badge
          colorScheme={
            prod.status === "Available" ? "green" :
              prod.status === "Out of Stock" ? "orange" : "red"
          }
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {prod.status || "Available"}
        </Badge>
      </Flex>

      <SimpleGrid columns={2} spacing={1} mb={2}>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Category:</Text> {getCategoryName()}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Price:</Text> {priceRange}
        </Text>
      </SimpleGrid>

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => onView(prod)}
        />
        <IconButton
          aria-label="Edit"
          icon={<FaEdit />}
          size="xs"
          colorScheme="teal"
          variant="ghost"
          onClick={() => onEdit(prod)}
        />
        <IconButton
          aria-label="Delete"
          icon={<FaTrash />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={() => onDelete(prod)}
        />
      </Flex>
    </Box>
  );
};

// Helper to extract full Customer Details from a quote request object
const getQuoteCustomerDetails = (req) => {
  if (!req) return { name: "Valued Customer", phone: "—", email: "—", address: "—", city: "—", contactMethod: "WHATSAPP" };

  const c = req.customerId || req.userId || req.customer || req.user || req.client;

  const name =
    req.customerSnapshot?.name ||
    req.customerName ||
    req.clientName ||
    req.name ||
    (c && typeof c === "object" ? (c.name || (c.fname ? `${c.fname} ${c.lname || ""}`.trim() : null) || c.username) : null) ||
    "Valued Customer";

  const phone =
    req.customerSnapshot?.phone ||
    req.customerPhone ||
    req.mobile ||
    req.phone ||
    req.mobileNumber ||
    (c && typeof c === "object" ? (c.mobileNumber || c.phone || c.mobile) : null) ||
    "—";

  const email =
    req.customerSnapshot?.email ||
    req.customerEmail ||
    req.email ||
    (c && typeof c === "object" ? c.email : null) ||
    "—";

  let address = "—";
  if (req.addressSnapshot) {
    const parts = [
      req.addressSnapshot.name,
      req.addressSnapshot.addressLine,
      req.addressSnapshot.city,
      req.addressSnapshot.state,
      req.addressSnapshot.pincode,
    ].filter(Boolean);
    if (parts.length > 0) address = parts.join(", ");
  }
  if (address === "—") {
    const raw =
      req.address ||
      req.location ||
      req.customerAddress ||
      (c && typeof c === "object" ? (c.address || c.streetAddress || (c.city ? `${c.city} ${c.pincode || ""}` : null)) : null) ||
      "—";
    if (typeof raw === "string") {
      address = raw;
    } else if (raw && typeof raw === "object") {
      const parts = [
        raw.addressLine || raw.street || raw.houseNo || (typeof raw.address === 'string' ? raw.address : null),
        raw.city,
        raw.state,
        raw.pincode || raw.zipCode,
      ].filter(Boolean);
      address = parts.length > 0 ? parts.join(", ") : "—";
    }
  }

  const rawCity =
    req.addressSnapshot?.city ||
    req.city ||
    req.pincode ||
    (c && typeof c === "object" ? (c.city || c.pincode) : null) ||
    "—";
  const city = typeof rawCity === "string" ? rawCity : "—";

  const contactMethod = req.preferredContactMethod ? req.preferredContactMethod.toUpperCase() : "WHATSAPP";

  return { name, phone, email, address, city, contactMethod };
};

// Helper to extract full Product Details from a quote request object
const getQuoteProductDetails = (req) => {
  if (!req) return { name: "Appliance Product", brand: "—", category: "—", model: "—", price: "—", quantity: 1, image: null, specText: "—" };

  const p = req.productId || req.product || req.requestedProduct;

  const name =
    req.productSnapshot?.productName ||
    req.productName ||
    req.requirementTitle ||
    req.title ||
    (typeof p === "object" && p !== null ? (p?.productName || p?.name) : null) ||
    "Appliance Product Supply & Installation";

  const brand = (typeof p === "object" && p !== null ? p?.brand : null) || req.brand || "—";
  const category = req.productSnapshot?.productType || (typeof p === "object" && p !== null ? (p?.productType || p?.category) : null) || req.category || "—";
  const model = (typeof p === "object" && p !== null ? p?.modelNumber : null) || req.modelNumber || "—";
  const price = (typeof p === "object" && p !== null ? (p?.price || (p?.estimatedPriceFrom ? `₹${p.estimatedPriceFrom} - ₹${p.estimatedPriceTo || ''}` : null)) : null) || req.budget || req.estimatedPrice || req.estimatedBudget || "—";
  const quantity = req.quantity || req.qty || 1;
  const image = req.productSnapshot?.imageUrl || (typeof p === "object" && p !== null ? (p?.images?.[0]?.url || p?.images?.[0] || p?.productImages?.[0]?.url || p?.productImages?.[0]) : null) || req.imageUrl || req.image || null;

  const specText =
    req.additionalNotes ||
    req.requirementDescription ||
    req.description ||
    req.notes ||
    req.customerNotes ||
    req.additionalRequirements ||
    "No additional customer notes provided.";

  return { name, brand, category, model, price, quantity, image, specText };
};

export default function ProductManagement() {
  const getSafeId = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val._id || null;
    if (typeof val === 'string' && val.trim() !== "") return val;
    return null;
  };

  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const navigate = useNavigate();

  // Standardized toast helper with close button & deduplication
  const showToast = useCallback(
    ({ title, description, status = "info", duration = 3500, id }) => {
      const toastId = id || `toast-${(title || "").replace(/\s+/g, "-").toLowerCase()}`;
      if (toast.isActive(toastId)) {
        toast.close(toastId);
      }
      toast({
        id: toastId,
        title,
        description,
        status,
        duration,
        isClosable: true,
        position: "bottom-right",
      });
    },
    [toast]
  );

  const formatExpiryDate = (dateInput) => {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getExpiryInfo = (validUntilStr, status) => {
    const rawStatus = (status || "").toLowerCase();
    const isRespondedOrClosed = [
      "accepted",
      "converted",
      "completed",
      "fulfilled",
      "service_completed",
      "paid",
      "rejected",
      "cancelled",
      "declined"
    ].includes(rawStatus);

    if (!validUntilStr) {
      return { isExpired: false, label: isRespondedOrClosed ? `Status: ${rawStatus.toUpperCase()}` : "No Expiry Date", color: isRespondedOrClosed ? "green" : "gray" };
    }
    const d = new Date(validUntilStr);
    if (isNaN(d.getTime())) return { isExpired: false, label: "Invalid Date", color: "gray" };

    if (isRespondedOrClosed) {
      return { isExpired: false, label: `Quotation ${rawStatus.toUpperCase()} (Validity: ${formatExpiryDate(d)})`, color: "green" };
    }

    const expiryEnd = new Date(d);
    expiryEnd.setHours(23, 59, 59, 999);
    
    const now = new Date();
    const isExpired = expiryEnd < now;

    if (isExpired) {
      return { isExpired: true, label: `Expired on ${formatExpiryDate(d)}`, color: "red" };
    }

    const diffTime = expiryEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return { isExpired: false, label: `Expires Today (${formatExpiryDate(d)})`, color: "orange" };
    }

    return { isExpired: false, label: `${formatExpiryDate(d)} (${diffDays}d left)`, color: "teal" };
  };

  // Custom color theme
  const customColor = "#008080";
  const customHoverColor = "#006666";

  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalType, setViewModalType] = useState("");

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Product Quotation states
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [quotationsList, setQuotationsList] = useState([]);
  const [quotationStatusFilter, setQuotationStatusFilter] = useState("all");
  const [requestStatusFilter, setRequestStatusFilter] = useState("active");
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedQuoteReq, setSelectedQuoteReq] = useState(null);
  const [selectedQuotationItem, setSelectedQuotationItem] = useState(null);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  // Refresh state
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  const sanitizeInputValue = (val) => {
    if (val === null || val === undefined || Number.isNaN(val)) return "";
    if (typeof val === "string" && (val.trim() === "NaN" || val.trim() === "")) return "";
    return val;
  };

  const initialQuotationForm = {
    quoteRequestId: "",
    productId: "",
    productName: "",
    productCategory: "",
    productModel: "",
    productImage: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    requirementNotes: "",
    items: [{ description: "Product Supply & Service", quantity: 1, unitPrice: 0, total: 0 }],
    discount: 0,
    discountPercent: 0,
    discountMode: "percent", // "percent" | "amount"
    gstPercent: 5,
    isCustomGst: false,
    customGstInput: "5",
    termsList: [
      "Quotation includes standard warranty and installation support.",
      "Valid for 24 hours from the date of issuance.",
      "50% advance payment required upon quotation confirmation."
    ],
    newTermText: "",
    adminMessage: "",
    tax: 0,
    finalAmount: 0,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "Quotation includes standard warranty and installation support.",
  };

  const [quotationForm, setQuotationForm] = useState(initialQuotationForm);

  // Product Domain Manual Payment states
  const [isManualPaymentModalOpen, setIsManualPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    amount: 0,
    paymentMethod: "cash",
    reference: "",
    notes: "Cash payment received by admin at office.",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Quote Request Details Modal state
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);
  const [isReqDetailModalOpen, setIsReqDetailModalOpen] = useState(false);

  // Quotation Preview Modal state
  const [previewQuotation, setPreviewQuotation] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Comprehensive Quotation Detail Modal state
  const [selectedQuotationForDetail, setSelectedQuotationForDetail] = useState(null);
  const [isQuotationDetailModalOpen, setIsQuotationDetailModalOpen] = useState(false);

  const handleOpenQuotationDetail = (qItem) => {
    setSelectedQuotationForDetail(qItem);
    setIsQuotationDetailModalOpen(true);
  };

  // Revise Quotation Modal state
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [revisingQuotationItem, setRevisingQuotationItem] = useState(null);
  const [revisedPrice, setRevisedPrice] = useState("");
  const [revisedNotes, setRevisedNotes] = useState("");
  const [isSubmittingRevise, setIsSubmittingRevise] = useState(false);

  const handleOpenManualPayment = (booking) => {
    setSelectedBookingForPayment(booking);
    const total = booking.totalAmount || booking.finalAmount || booking.amount || 0;
    const paid = booking.paidAmount || (booking.paymentStatus === "paid" ? total : 0);
    const remaining = Math.max(0, total - paid);
    setManualPaymentForm({
      amount: remaining > 0 ? remaining : total,
      paymentMethod: "cash",
      reference: `PAY_${Date.now().toString().slice(-6)}`,
      notes: "Cash payment collected by Admin",
    });
    setIsManualPaymentModalOpen(true);
  };

  const handleRecordManualPayment = async () => {
    if (!selectedBookingForPayment || !manualPaymentForm.amount) {
      toast({ title: "Validation Error", description: "Payment amount is required.", status: "warning" });
      return;
    }
    setIsSubmittingPayment(true);
    try {
      await adminRecordManualProductBookingPayment(
        selectedBookingForPayment._id || selectedBookingForPayment.id,
        {
          amountPaise: Math.round(Number(manualPaymentForm.amount) * 100),
          paymentMethod: manualPaymentForm.paymentMethod,
          reference: manualPaymentForm.reference,
          notes: manualPaymentForm.notes,
        }
      );
      toast({ title: "Payment Recorded", description: `Recorded ${manualPaymentForm.paymentMethod.toUpperCase()} payment of INR ${manualPaymentForm.amount}`, status: "success" });
      setIsManualPaymentModalOpen(false);
      fetchProductBookings();
    } catch (err) {
      toast({ title: "Payment Error", description: err.message, status: "error" });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleUpdateProductBookingStatus = async (bookingId, newStatus) => {
    try {
      await adminUpdateProductBookingStatus(bookingId, { status: newStatus });
      toast({ title: "Booking Status Updated", description: `Order status changed to ${newStatus}`, status: "success" });
      fetchProductBookings();
    } catch (err) {
      toast({ title: "Status Update Error", description: err.message, status: "error" });
    }
  };

  const handleOpenPreviewQuotation = (quotation) => {
    setPreviewQuotation(quotation);
    setIsPreviewModalOpen(true);
  };

  // -------------------------------------------------------------
  // Inventory Management State & Handlers
  // -------------------------------------------------------------
  const [inventoryList, setInventoryList] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: 0, changeType: "set", reason: "" });
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [stockHistoryModalOpen, setStockHistoryModalOpen] = useState(false);
  const [stockHistoryLogs, setStockHistoryLogs] = useState([]);
  const [isLoadingStockHistory, setIsLoadingStockHistory] = useState(false);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);

  const fetchInventoryData = useCallback(async () => {
    setIsLoadingInventory(true);
    try {
      const res = await adminGetInventory();
      setInventoryList(res.data || res.products || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setIsLoadingInventory(false);
    }
  }, []);

  const handleOpenStockAdjustModal = (product) => {
    setSelectedStockProduct(product);
    setStockForm({
      quantity: product.stockQuantity || product.stock || 0,
      changeType: "set",
      reason: "Manual admin inventory update",
    });
    setStockModalOpen(true);
  };

  const handleSaveStockAdjustment = async () => {
    if (!selectedStockProduct) return;
    setIsSubmittingStock(true);
    try {
      const pId = selectedStockProduct._id || selectedStockProduct.id;
      if (stockForm.changeType === "increase") {
        await adminIncreaseStock(pId, Number(stockForm.quantity), stockForm.reason);
      } else if (stockForm.changeType === "decrease") {
        await adminDecreaseStock(pId, Number(stockForm.quantity), stockForm.reason);
      } else {
        await adminUpdateStock(pId, { stockQuantity: Number(stockForm.quantity), reason: stockForm.reason });
      }
      toast({ title: "Stock Updated", description: `Updated inventory for ${selectedStockProduct.name}`, status: "success" });
      setStockModalOpen(false);
      fetchInventoryData();
      fetchProducts();
    } catch (err) {
      toast({ title: "Stock Update Failed", description: err.message, status: "error" });
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleOpenStockHistoryModal = async (product) => {
    setSelectedStockProduct(product);
    setStockHistoryModalOpen(true);
    setIsLoadingStockHistory(true);
    try {
      const pId = product._id || product.id;
      const res = await adminGetStockHistory(pId);
      setStockHistoryLogs(res.data || res.history || (Array.isArray(res) ? res : []));
    } catch (err) {
      setStockHistoryLogs([]);
    } finally {
      setIsLoadingStockHistory(false);
    }
  };

  // -------------------------------------------------------------
  // Dedicated Product Payments Tracking State & Handlers
  // -------------------------------------------------------------
  const [paymentsList, setPaymentsList] = useState([]);
  const [isLoadingPaymentsList, setIsLoadingPaymentsList] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [paymentAttemptsLogs, setPaymentAttemptsLogs] = useState([]);
  const [razorpayPaymentDetails, setRazorpayPaymentDetails] = useState(null);
  const [isLoadingPaymentDetail, setIsLoadingPaymentDetail] = useState(false);

  const fetchPaymentsData = useCallback(async () => {
    setIsLoadingPaymentsList(true);
    try {
      const res = await adminGetProductPayments();
      setPaymentsList(res.data || res.payments || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setIsLoadingPaymentsList(false);
    }
  }, []);

  const handleOpenPaymentDetailModal = async (payItem) => {
    setSelectedPaymentDetail(payItem);
    setPaymentDetailModalOpen(true);
    setIsLoadingPaymentDetail(true);
    setPaymentAttemptsLogs([]);
    setRazorpayPaymentDetails(null);
    try {
      const payId = payItem._id || payItem.id;
      if (payId) {
        const attemptsRes = await adminGetPaymentAttempts(payId).catch(() => null);
        if (attemptsRes) setPaymentAttemptsLogs(attemptsRes.data || attemptsRes.attempts || []);
      }
      if (payItem.razorpayPaymentId) {
        const rzpRes = await adminGetRazorpayPaymentDetails(payItem.razorpayPaymentId).catch(() => null);
        if (rzpRes) setRazorpayPaymentDetails(rzpRes.data || rzpRes);
      }
    } catch (err) {
      console.error("Error loading payment detail:", err);
    } finally {
      setIsLoadingPaymentDetail(false);
    }
  };

  // -------------------------------------------------------------
  // Reconciliation & Refunds State & Handlers
  // -------------------------------------------------------------
  const [reconciliationSummary, setReconciliationSummary] = useState(null);
  const [unmatchedPayments, setUnmatchedPayments] = useState([]);
  const [refundRequestsList, setRefundRequestsList] = useState([]);
  const [isLoadingReconciliation, setIsLoadingReconciliation] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [selectedUnmatchedItem, setSelectedUnmatchedItem] = useState(null);
  const [reconcileForm, setReconcileForm] = useState({ notes: "", matchedBookingId: "" });
  const [isSubmittingReconcile, setIsSubmittingReconcile] = useState(false);

  const fetchReconciliationData = useCallback(async () => {
    setIsLoadingReconciliation(true);
    try {
      const [sumRes, unmatchRes, refundRes] = await Promise.all([
        adminGetReconciliationSummary().catch(() => ({})),
        adminGetUnmatchedPayments().catch(() => ({})),
        adminGetRefundRequests().catch(() => ({})),
      ]);
      setReconciliationSummary(sumRes.data || sumRes);
      setUnmatchedPayments(unmatchRes.data || unmatchRes.unmatched || []);
      setRefundRequestsList(refundRes.data || refundRes.refunds || []);
    } catch (err) {
      console.error("Error fetching reconciliation:", err);
    } finally {
      setIsLoadingReconciliation(false);
    }
  }, []);

  const handleOpenReconcileModal = (unmatchedItem) => {
    setSelectedUnmatchedItem(unmatchedItem);
    setReconcileForm({ notes: "Manual admin reconciliation verification", matchedBookingId: unmatchedItem.bookingId || "" });
    setReconcileModalOpen(true);
  };

  const handleExecuteReconcile = async () => {
    if (!selectedUnmatchedItem) return;
    setIsSubmittingReconcile(true);
    try {
      const payId = selectedUnmatchedItem._id || selectedUnmatchedItem.id;
      await adminReconcilePayment(payId, reconcileForm);
      toast({ title: "Payment Reconciled", description: "Successfully reconciled payment", status: "success" });
      setReconcileModalOpen(false);
      fetchReconciliationData();
    } catch (err) {
      toast({ title: "Reconciliation Error", description: err.message, status: "error" });
    } finally {
      setIsSubmittingReconcile(false);
    }
  };

  // -------------------------------------------------------------
  // Reports & Financial Analytics State & Handlers
  // -------------------------------------------------------------
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [salesReportList, setSalesReportList] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const fetchReportsData = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const [dashRes, salesRes] = await Promise.all([
        adminGetProductDashboardSummary().catch(() => ({})),
        adminGetSalesReport().catch(() => ({})),
      ]);
      setDashboardSummary(dashRes.data || dashRes);
      setSalesReportList(salesRes.data || salesRes.report || salesRes.sales || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const csvText = await adminExportSalesReport();
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Product_Sales_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Report Exported", description: "Sales report CSV downloaded successfully.", status: "success" });
    } catch (err) {
      toast({ title: "Export Error", description: err.message, status: "error" });
    } finally {
      setIsExportingCSV(false);
    }
  };

  // -------------------------------------------------------------
  // Product Audit Logs State & Handlers
  // -------------------------------------------------------------
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [selectedAuditDetail, setSelectedAuditDetail] = useState(null);
  const [auditDetailModalOpen, setAuditDetailModalOpen] = useState(false);

  const fetchAuditLogsData = useCallback(async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await adminGetProductAuditLogs();
      setAuditLogsList(res.data || res.logs || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  }, []);

  const handleOpenAuditDetail = (logItem) => {
    setSelectedAuditDetail(logItem);
    setAuditDetailModalOpen(true);
  };

  useEffect(() => {
    if (currentView === "inventory") fetchInventoryData();
    else if (currentView === "payments") fetchPaymentsData();
    else if (currentView === "reconciliation") fetchReconciliationData();
    else if (currentView === "reports") fetchReportsData();
    else if (currentView === "audit-logs") fetchAuditLogsData();
  }, [currentView, fetchInventoryData, fetchPaymentsData, fetchReconciliationData, fetchReportsData, fetchAuditLogsData]);


  const fetchQuotationsData = useCallback(async () => {
    setIsLoadingQuotations(true);
    try {
      const [reqRes, listRes] = await Promise.allSettled([
        adminListQuoteRequestsController(),
        getAdminQuotationsList(),
      ]);

      if (reqRes.status === "fulfilled" && reqRes.value) {
        const raw = reqRes.value.data || reqRes.value.result || reqRes.value.quoteRequests || reqRes.value.requests || reqRes.value;
        setQuoteRequests(Array.isArray(raw) ? raw : []);
      }
      if (listRes.status === "fulfilled" && listRes.value) {
        const raw = listRes.value.data || listRes.value.result || listRes.value.quotations || listRes.value;
        setQuotationsList(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      console.error("Error fetching quotation data:", err);
    } finally {
      setIsLoadingQuotations(false);
    }
  }, []);

  const handleRefreshAllData = async () => {
    setIsRefreshingData(true);
    try {
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchQuotationsData(),
        fetchProductBookings(),
        fetchInventoryData(),
        fetchPaymentsData(),
        fetchReconciliationData(),
        fetchReportsData(),
        fetchAuditLogsData(),
      ]);
      toast({
        title: "Dashboard Data Refreshed",
        description: "Latest quote requests, inventory, payments, and reports loaded.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (e) {
      console.error("Refresh error:", e);
      toast({ title: "Refresh Failed", description: e.message, status: "error" });
    } finally {
      setIsRefreshingData(false);
    }
  };

  const filteredQuoteRequests = React.useMemo(() => {
    const search = (searchTerm || "").trim().toLowerCase();
    return quoteRequests.filter((req) => {
      const cust = getQuoteCustomerDetails(req);
      const prod = getQuoteProductDetails(req);
      const displayReqId = (req.requestNumber || (req._id ? `REQ-${req._id.slice(-6)}` : "")).toLowerCase();
      const rawId = (req._id || req.id || "").toLowerCase();
      const status = (req.status || "quote_requested").toLowerCase();

      const matchesSearch = !search || (
        cust.name.toLowerCase().includes(search) ||
        cust.phone.toLowerCase().includes(search) ||
        cust.email.toLowerCase().includes(search) ||
        prod.name.toLowerCase().includes(search) ||
        prod.category.toLowerCase().includes(search) ||
        prod.brand.toLowerCase().includes(search) ||
        displayReqId.includes(search) ||
        rawId.includes(search) ||
        status.includes(search)
      );

      if (!matchesSearch) return false;

      if (requestStatusFilter === "active") return ["quote_requested", "under_review", "quotation_prepared", "quotation_sent", "viewed"].includes(status);
      if (requestStatusFilter === "accepted") return ["accepted", "converted", "completed"].includes(status);
      if (requestStatusFilter === "cancelled") return ["cancelled", "rejected", "expired"].includes(status);

      return true;
    });
  }, [quoteRequests, searchTerm, requestStatusFilter]);

  const activeQuoteRequestsCount = React.useMemo(() => {
    return quoteRequests.filter((r) => {
      const st = (r.status || "quote_requested").toLowerCase();
      return st === "quote_requested" || st === "under_review";
    }).length;
  }, [quoteRequests]);

  const filteredQuotationsList = React.useMemo(() => {
    const search = (searchTerm || "").trim().toLowerCase();
    return quotationsList.filter((q) => {
      const qId = (q._id || q.id || q.quotationNumber || "").toLowerCase();
      const custName = (q.customerSnapshot?.name || q.customerName || q.clientName || (typeof q.customerId === 'object' && q.customerId ? (q.customerId.name || `${q.customerId.fname || ''} ${q.customerId.lname || ''}`.trim()) : "")).toLowerCase();
      const custPhone = (q.customerSnapshot?.phone || q.customerPhone || (typeof q.customerId === 'object' && q.customerId ? q.customerId.phone : "")).toLowerCase();
      const custEmail = (q.customerEmail || "").toLowerCase();
      const prodName = (q.productName || q.items?.[0]?.description || "").toLowerCase();
      const status = (q.status || "draft").toLowerCase();

      const matchesSearch = !search || (
        qId.includes(search) ||
        custName.includes(search) ||
        custPhone.includes(search) ||
        custEmail.includes(search) ||
        prodName.includes(search) ||
        status.includes(search)
      );

      if (!matchesSearch) return false;

      if (quotationStatusFilter === "draft") return status === "draft";
      if (quotationStatusFilter === "waiting") return ["sent", "viewed", "delivered", "quotation_sent"].includes(status);
      if (quotationStatusFilter === "accepted") return ["accepted", "converted", "completed"].includes(status);
      if (quotationStatusFilter === "cancelled") return ["cancelled", "rejected", "superseded", "expired"].includes(status);

      return true;
    });
  }, [quotationsList, searchTerm, quotationStatusFilter]);

  useEffect(() => {
    if (currentUser) {
      fetchQuotationsData();
    }
  }, [currentUser, fetchQuotationsData]);

  const handleAddTerm = () => {
    if (!quotationForm.newTermText || !quotationForm.newTermText.trim()) return;
    const term = quotationForm.newTermText.trim();
    const currentTerms = quotationForm.termsList || [];
    setQuotationForm({
      ...quotationForm,
      termsList: [...currentTerms, term],
      newTermText: "",
    });
  };

  const handleRemoveTerm = (index) => {
    const currentTerms = quotationForm.termsList || [];
    setQuotationForm({
      ...quotationForm,
      termsList: currentTerms.filter((_, idx) => idx !== index),
    });
  };

  const recalculateQuotationForm = (updates) => {
    const nextForm = { ...quotationForm, ...updates };

    const rawUnitPrice = nextForm.items?.[0]?.unitPrice;
    const rawQty = nextForm.items?.[0]?.quantity;

    const unitPriceVal = (rawUnitPrice === "" || rawUnitPrice === undefined || rawUnitPrice === null) ? "" : rawUnitPrice;
    const qtyVal = (rawQty === "" || rawQty === undefined || rawQty === null) ? "" : rawQty;

    const unitPriceNum = unitPriceVal === "" ? 0 : Math.max(0, Number(unitPriceVal) || 0);
    const qtyNum = qtyVal === "" ? 0 : Math.max(0, Number(qtyVal) || 0);
    const subtotal = unitPriceNum * qtyNum;

    let discountAmt = 0;
    let discountPct = 0;

    if (nextForm.discountMode === "percent" || nextForm.discountType === "percent") {
      discountPct = Math.min(100, Math.max(0, Number(nextForm.discountPercent ?? 0)));
      discountAmt = Math.round((subtotal * discountPct) / 100);
    } else {
      const rawDisc = nextForm.discountInput !== undefined ? nextForm.discountInput : nextForm.discount;
      const discVal = rawDisc === "" || rawDisc === undefined ? 0 : Number(rawDisc || 0);
      discountAmt = Math.min(subtotal, Math.max(0, discVal));
      discountPct = subtotal > 0 ? Number(((discountAmt / subtotal) * 100).toFixed(2)) : 0;
    }

    const taxableSubtotal = Math.max(0, subtotal - discountAmt);
    const gstRate = Number(nextForm.gstPercent || 0);
    const taxAmount = Math.round((taxableSubtotal * gstRate) / 100);
    const finalAmount = taxableSubtotal + taxAmount;

    const updatedItem = {
      ...(nextForm.items?.[0] || { description: "Product Supply" }),
      unitPrice: unitPriceVal,
      quantity: qtyVal,
      total: subtotal,
    };

    setQuotationForm({
      ...nextForm,
      items: [updatedItem],
      discount: discountAmt,
      discountPercent: discountPct,
      tax: taxAmount,
      finalAmount: finalAmount,
    });
  };

  const handleOpenQuotationForProduct = (prod) => {
    const price = Number(prod.price || prod.estimatedPriceFrom || (prod.variants?.[0]?.price) || 0);
    const gstPct = 5;
    const taxAmt = Math.round((price * gstPct) / 100);
    const finalAmt = price + taxAmt;
    const imgUrl = prod.images?.[0]?.url || prod.images?.[0] || prod.imageUrl || null;

    setQuotationForm({
      ...initialQuotationForm,
      productId: prod._id || prod.id,
      productName: prod.name || prod.productName || "Product Supply",
      productCategory: prod.productType || prod.category || "Appliance",
      productModel: prod.modelNumber || "—",
      productImage: imgUrl,
      requirementNotes: prod.description || "Direct product quotation request.",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "—",
      items: [{ productId: prod._id || prod.id, description: prod.name || "Product Supply", quantity: 1, unitPrice: price, total: price }],
      discount: 0,
      discountPercent: 0,
      discountMode: "percent",
      gstPercent: gstPct,
      tax: taxAmt,
      finalAmount: finalAmt,
    });
    setSelectedQuotationItem(null);
    setIsQuotationModalOpen(true);
  };

  const handleOpenQuotationForRequest = (req) => {
    setSelectedQuoteReq(req);
    const reqId = req._id || req.id;
    const existingQ = quotationsList.find(q => {
      const qReqId = q.quoteRequestId?._id || q.quoteRequestId || q.requestId || q.request?._id || q.request;
      return qReqId === reqId;
    });

    const cust = getQuoteCustomerDetails(req);
    const prod = getQuoteProductDetails(req);
    const prodPrice = prod.price !== "—" ? Number(prod.price) : 0;
    const qty = Number(prod.quantity || 1);
    const subtotal = prodPrice * qty;
    const gstPct = 5;
    const taxAmt = Math.round((subtotal * gstPct) / 100);
    const finalAmt = subtotal + taxAmt;
    const rawProdId = req.productId?._id || req.productId || req.product?._id || req.product || (products.length > 0 ? (products[0]._id || products[0].id) : "");

    if (existingQ) {
      setSelectedQuotationItem(existingQ);
      setQuotationForm({
        ...initialQuotationForm,
        quoteRequestId: reqId,
        productId: existingQ.productId?._id || existingQ.productId || rawProdId,
        productName: existingQ.productName || prod.name,
        productCategory: prod.category,
        productModel: prod.model,
        productImage: prod.image,
        customerName: existingQ.customerName || cust.name,
        customerEmail: existingQ.customerEmail || (cust.email !== "—" ? cust.email : ""),
        customerPhone: existingQ.customerPhone || (cust.phone !== "—" ? cust.phone : ""),
        customerAddress: cust.address !== "—" ? cust.address : "",
        items: existingQ.items && existingQ.items.length > 0
          ? existingQ.items.map(it => ({ ...it, unitPrice: it.unitPrice || (it.unitPricePaise ? it.unitPricePaise / 100 : 0) }))
          : [{ productId: rawProdId, description: prod.name, quantity: qty, unitPrice: prodPrice, total: subtotal }],
        discount: existingQ.discountPaise ? existingQ.discountPaise / 100 : (existingQ.discount || 0),
        discountPercent: existingQ.discountPercent || 0,
        discountMode: existingQ.discountMode || "percent",
        gstPercent: existingQ.gstPercent || gstPct,
        tax: existingQ.taxPaise ? existingQ.taxPaise / 100 : (existingQ.tax || taxAmt),
        finalAmount: existingQ.finalAmountPaise ? existingQ.finalAmountPaise / 100 : (existingQ.finalAmount || finalAmt),
        adminMessage: existingQ.notes || "",
        validUntil: existingQ.validUntil ? existingQ.validUntil.split("T")[0] : initialQuotationForm.validUntil,
      });
    } else {
      setSelectedQuotationItem(null);
      setQuotationForm({
        ...initialQuotationForm,
        quoteRequestId: reqId,
        productId: rawProdId,
        productName: prod.name,
        productCategory: prod.category,
        productModel: prod.model,
        productImage: prod.image,
        requirementNotes: prod.specText !== "—" ? prod.specText : "",
        customerName: cust.name,
        customerEmail: cust.email !== "—" ? cust.email : "",
        customerPhone: cust.phone !== "—" ? cust.phone : "",
        customerAddress: cust.address !== "—" ? cust.address : "",
        items: [{ productId: rawProdId, description: prod.name, quantity: qty, unitPrice: prodPrice, total: subtotal }],
        discount: 0,
        discountPercent: 0,
        discountMode: "percent",
        gstPercent: gstPct,
        tax: taxAmt,
        finalAmount: finalAmt,
      });
    }
    setIsQuotationModalOpen(true);
  };

  const handleSaveQuotation = async () => {
    if (!quotationForm.customerName || !quotationForm.finalAmount) {
      toast({ title: "Validation Error", description: "Customer Name and Final Amount are required.", status: "warning" });
      return;
    }
    setIsSubmittingQuotation(true);
    try {
      const defaultProdId = quotationForm.productId || (products.length > 0 ? (products[0]._id || products[0].id) : undefined);
      const unitPrice = quotationForm.items?.[0]?.unitPrice || quotationForm.finalAmount || 0;
      const qty = quotationForm.items?.[0]?.quantity || 1;
      
      const itemsPayload = (quotationForm.items && quotationForm.items.length > 0
        ? quotationForm.items
        : [{ description: "Product Supply", quantity: qty, unitPrice, total: unitPrice * qty }]
      ).map(it => {
        const itemUnitPrice = Number(it.unitPrice || unitPrice);
        const itemQty = Number(it.quantity || 1);
        return {
          productId: it.productId || defaultProdId,
          description: it.description || "Product Supply",
          quantity: itemQty,
          unitPrice: itemUnitPrice,
          unitPricePaise: Math.round(itemUnitPrice * 100),
          total: Number(it.total || itemUnitPrice * itemQty),
          totalPaise: Math.round((it.total || itemUnitPrice * itemQty) * 100),
          gstPercent: Number(quotationForm.gstPercent || 5),
        };
      });

      const formattedTermsList = (quotationForm.termsList || []).map((t, idx) => `${idx + 1}. ${t}`).join("\n");
      const fullNotesPayload = [
        quotationForm.adminMessage ? `[Admin Message]:\n${quotationForm.adminMessage}` : "",
        formattedTermsList ? `[Terms & Conditions]:\n${formattedTermsList}` : ""
      ].filter(Boolean).join("\n\n") || "Standard RightTouch warranty and service terms apply.";

      const paisePayload = {
        quoteRequestId: quotationForm.quoteRequestId || undefined,
        requestId: quotationForm.quoteRequestId || undefined,
        productId: defaultProdId,
        customerName: quotationForm.customerName,
        customerEmail: quotationForm.customerEmail,
        customerPhone: quotationForm.customerPhone,
        unitPricePaise: Math.round(Number(unitPrice) * 100),
        quantity: Number(qty),
        installationAmountPaise: 0,
        additionalChargesPaise: 0,
        discountPaise: Math.round(Number(quotationForm.discount || 0) * 100),
        gstPercent: Number(quotationForm.gstPercent || 5),
        termsAndConditions: fullNotesPayload,
        notes: fullNotesPayload,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: quotationForm.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // Rupee backward compatibility
        finalAmount: Number(quotationForm.finalAmount),
        items: itemsPayload,
      };

      const reqId = quotationForm.quoteRequestId;
      const targetQ = selectedQuotationItem || (reqId ? quotationsList.find(q => (q.quoteRequestId?._id || q.quoteRequestId || q.requestId) === reqId) : null);

      if (targetQ) {
        await updateAdminQuotation(targetQ._id || targetQ.id, paisePayload);
        toast({ title: "Quotation Updated", status: "success" });
      } else {
        if (quotationForm.quoteRequestId) {
          try {
            await adminUpdateQuoteRequestStatusController(quotationForm.quoteRequestId, { status: "under_review" });
          } catch (e) {
            console.log("Status transition check completed.");
          }
        }
        try {
          await createAdminQuotation(paisePayload);
          toast({ title: "Quotation Created", status: "success", description: "Product quotation created successfully." });
        } catch (createErr) {
          if (reqId) {
            const freshQ = quotationsList.find(q => (q.quoteRequestId?._id || q.quoteRequestId || q.requestId) === reqId);
            if (freshQ) {
              await updateAdminQuotation(freshQ._id || freshQ.id, paisePayload);
              toast({ title: "Quotation Updated", status: "success" });
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      }
      setIsQuotationModalOpen(false);
      fetchQuotationsData();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setIsSubmittingQuotation(false);
    }
  };

  const handleSaveAndSendQuotation = async () => {
    if (!quotationForm.customerName && !quotationForm.quoteRequestId) {
      toast({ title: "Validation Error", description: "Customer details are required.", status: "warning" });
      return;
    }
    setIsSubmittingQuotation(true);
    try {
      const defaultProdId = quotationForm.productId || (products.length > 0 ? (products[0]._id || products[0].id) : undefined);
      const unitPrice = quotationForm.items?.[0]?.unitPrice || quotationForm.finalAmount || 0;
      const qty = quotationForm.items?.[0]?.quantity || 1;

      const itemsPayload = (quotationForm.items && quotationForm.items.length > 0
        ? quotationForm.items
        : [{ description: "Product Supply", quantity: qty, unitPrice, total: unitPrice * qty }]
      ).map(it => ({
        productId: it.productId || defaultProdId,
        description: it.description || "Product Supply",
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.unitPrice || unitPrice),
        total: Number(it.total || unitPrice * qty),
      }));
      
      const formattedTermsList = (quotationForm.termsList || []).map((t, idx) => `${idx + 1}. ${t}`).join("\n");
      const fullNotesPayload = [
        quotationForm.adminMessage ? `[Admin Message]:\n${quotationForm.adminMessage}` : "",
        formattedTermsList ? `[Terms & Conditions]:\n${formattedTermsList}` : ""
      ].filter(Boolean).join("\n\n") || "Standard RightTouch warranty and service terms apply.";

      const paisePayload = {
        quoteRequestId: quotationForm.quoteRequestId || undefined,
        requestId: quotationForm.quoteRequestId || undefined,
        productId: defaultProdId,
        customerName: quotationForm.customerName,
        customerEmail: quotationForm.customerEmail,
        customerPhone: quotationForm.customerPhone,
        unitPricePaise: Math.round(Number(unitPrice) * 100),
        quantity: Number(qty),
        installationAmountPaise: 0,
        additionalChargesPaise: 0,
        discountPaise: Math.round(Number(quotationForm.discount || 0) * 100),
        gstPercent: Number(quotationForm.gstPercent || 5),
        termsAndConditions: fullNotesPayload,
        notes: fullNotesPayload,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: quotationForm.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        finalAmount: Number(quotationForm.finalAmount || unitPrice * qty),
        items: itemsPayload,
      };

      const reqId = quotationForm.quoteRequestId;
      const targetQ = selectedQuotationItem || (reqId ? quotationsList.find(q => (q.quoteRequestId?._id || q.quoteRequestId || q.requestId) === reqId) : null);

      let qRes;
      if (targetQ) {
        qRes = await updateAdminQuotation(targetQ._id || targetQ.id, paisePayload);
      } else {
        if (quotationForm.quoteRequestId) {
          const targetReq = quoteRequests.find(r => (r._id || r.id) === quotationForm.quoteRequestId);
          if (targetReq && targetReq.status === "quote_requested") {
            try {
              await adminUpdateQuoteRequestStatusController(quotationForm.quoteRequestId, { status: "under_review" });
            } catch (e) {
              console.log("Status transition check completed.");
            }
          }
        }
        try {
          qRes = await createAdminQuotation(paisePayload);
        } catch (createErr) {
          if (reqId) {
            const freshQ = quotationsList.find(q => (q.quoteRequestId?._id || q.quoteRequestId || q.requestId) === reqId);
            if (freshQ) {
              qRes = await updateAdminQuotation(freshQ._id || freshQ.id, paisePayload);
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      }

      const createdId = qRes?.result?._id || qRes?.result?.id || qRes?._id || qRes?.id || qRes?.quotation?._id || qRes?.data?._id || targetQ?._id || targetQ?.id;

      if (createdId) {
        await sendAdminQuotation(createdId);
        toast({ title: "Quotation Dispatched", status: "success", description: "Quotation updated & sent to customer via In-App + WhatsApp." });
      } else {
        toast({ title: "Quotation Prepared", status: "success" });
      }

      setIsQuotationModalOpen(false);
      fetchQuotationsData();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setIsSubmittingQuotation(false);
    }
  };

  const handleSendQuotation = async (qId, optionalItem) => {
    try {
      await sendAdminQuotation(qId);
      showToast({ id: `send-${qId}`, title: "Quotation Sent", status: "success", description: "Quotation dispatched to customer." });
      fetchQuotationsData();
    } catch (err) {
      showToast({ title: "Send Error", description: err.message, status: "error" });
    }
  };

  const handleResendQuotation = async (qId, optionalItem) => {
    try {
      await resendAdminQuotation(qId);
      showToast({ id: `resend-${qId}`, title: "Quotation Resent", status: "info", description: "Quotation notification re-sent to customer." });
      fetchQuotationsData();
    } catch (err) {
      showToast({ title: "Resend Error", description: err.message, status: "error" });
    }
  };

  const handleTogglePaymentStatus = async (quotationId, currentPaymentStatus) => {
    const nextStatus = (currentPaymentStatus || "unpaid").toLowerCase() === "paid" ? "unpaid" : "paid";
    try {
      await updateAdminQuotationPaymentStatus(quotationId, nextStatus);
      showToast({
        id: `payment-status-${quotationId}`,
        title: `Payment Marked ${nextStatus.toUpperCase()}`,
        status: nextStatus === "paid" ? "success" : "info",
        description: `Quotation payment status updated to ${nextStatus.toUpperCase()}.`
      });
      setSelectedQuotationForDetail(prev => {
        if (prev && (prev._id === quotationId || prev.id === quotationId || prev.quotationNumber === quotationId)) {
          return { ...prev, paymentStatus: nextStatus };
        }
        return prev;
      });
      fetchQuotationsData();
    } catch (err) {
      showToast({ title: "Payment Status Error", description: err.message, status: "error" });
    }
  };

  const handleOpenReviseModal = (qItem) => {
    setRevisingQuotationItem(qItem);
    const snap = qItem.financialSnapshot || {};
    const qty = qItem.quantity || qItem.items?.[0]?.quantity || 1;
    const uPrice = snap.unitPricePaise ? snap.unitPricePaise / 100 : (qItem.items?.[0]?.unitPrice || qItem.finalAmount || 0);
    const disc = snap.discountPaise ? snap.discountPaise / 100 : (qItem.discount ? Number(qItem.discount) : 0);
    const gst = snap.gstPercent ?? qItem.gstPercent ?? 5;
    
    let adminMsg = qItem.adminNotes || qItem.notes || "";
    let terms = [];
    const tText = qItem.termsAndConditions || "";
    if (tText.includes('[Admin Message]:')) {
      const parts = tText.split('[Terms & Conditions]:');
      const mPart = parts[0].replace('[Admin Message]:', '').trim();
      if (mPart) adminMsg = mPart;
      if (parts[1]) {
        terms = parts[1].trim().split('\n').map(t => t.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      }
    } else if (tText) {
      terms = tText.trim().split('\n').map(t => t.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    }

    const reqObj = qItem.quoteRequestId;
    const cust = getQuoteCustomerDetails(reqObj || qItem);
    const prod = getQuoteProductDetails(reqObj || qItem);

    const initForm = {
      quotationNumber: qItem.quotationNumber || "",
      quoteRequestId: qItem.quoteRequestId?._id || qItem.quoteRequestId || qItem.requestId || "",
      productId: qItem.productId?._id || qItem.productId || "",
      productName: prod.name || qItem.items?.[0]?.description || "Appliance Product",
      productCategory: prod.category || "Appliance",
      productModel: prod.model || "—",
      productImage: prod.image,
      customerName: cust.name,
      customerEmail: cust.email !== "—" ? cust.email : "",
      customerPhone: cust.phone !== "—" ? cust.phone : "",
      customerAddress: cust.address !== "—" ? cust.address : "",
      requirementNotes: prod.specText !== "—" ? prod.specText : "",
      items: [{
        productId: qItem.productId?._id || qItem.productId || "",
        unitPrice: uPrice,
        quantity: qty
      }],
      discountMode: "amount",
      discountPercent: (uPrice * qty) > 0 ? Math.round((disc / (uPrice * qty)) * 100) : 0,
      discount: disc,
      tax: snap.gstAmountPaise ? snap.gstAmountPaise / 100 : Math.round((Math.max(0, (uPrice * qty) - disc) * gst) / 100),
      gstPercent: gst,
      isCustomGst: ![0, 5, 12, 18, 28].includes(gst),
      customGstInput: String(gst),
      adminMessage: adminMsg,
      termsList: terms.length > 0 ? terms : ["Quotation includes standard warranty and installation support."],
      newTermText: "",
      validUntil: qItem.validUntil ? new Date(qItem.validUntil).toISOString().split('T')[0] : "",
      finalAmount: qItem.finalAmount || qItem.totalAmount || (snap.totalAmountPaise ? snap.totalAmountPaise / 100 : 0)
    };

    setQuotationForm(initForm);
    setIsReviseModalOpen(true);
  };

  const handleConfirmRevise = async () => {
    if (!revisingQuotationItem) return;
    setIsSubmittingRevise(true);
    try {
      const item = quotationForm.items?.[0] || {};
      const uPrice = Number(item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      const baseVal = uPrice * qty;
      const discVal = Number(quotationForm.discount || 0);
      const taxable = Math.max(0, baseVal - discVal);
      const gstPct = Number(quotationForm.gstPercent || 0);
      const gstVal = Math.round((taxable * gstPct) / 100);
      const finalTot = taxable + gstVal;

      let combinedTerms = "";
      if (quotationForm.adminMessage) {
        combinedTerms += `[Admin Message]:\n${quotationForm.adminMessage.trim()}\n\n`;
      }
      if (quotationForm.termsList && quotationForm.termsList.length > 0) {
        combinedTerms += `[Terms & Conditions]:\n` + quotationForm.termsList.map((t, i) => `${i + 1}. ${t}`).join('\n');
      } else {
        combinedTerms += `[Terms & Conditions]:\n1. Quotation includes standard warranty and installation support.`;
      }

      const revRes = await reviseAdminQuotation(revisingQuotationItem._id || revisingQuotationItem.id, {
        unitPricePaise: Math.round(uPrice * 100),
        quantity: qty,
        discountPaise: Math.round(discVal * 100),
        gstPercent: gstPct,
        totalAmountPaise: Math.round(finalTot * 100),
        termsAndConditions: combinedTerms,
        adminNotes: quotationForm.adminMessage || "Revised by Admin",
        notes: quotationForm.adminMessage || "Revised by Admin",
        validUntil: quotationForm.validUntil ? new Date(quotationForm.validUntil) : undefined
      });

      const newId = revRes?.result?._id || revRes?.result?.id || revRes?._id || revRes?.id || revRes?.quotation?._id || revRes?.data?._id;
      if (newId) {
        try {
          await sendAdminQuotation(newId);
          toast({ title: "Revised Quotation Dispatched", status: "success", description: "Revised quotation created & sent to customer." });
        } catch (e) {
          toast({ title: "Quotation Revised", status: "success", description: "New revised draft created successfully." });
        }
      } else {
        toast({ title: "Quotation Revised", status: "success", description: "New revised draft created successfully." });
      }

      setIsReviseModalOpen(false);
      setRevisingQuotationItem(null);
      fetchQuotationsData();
    } catch (err) {
      toast({ title: "Revise Error", description: err.message, status: "error" });
    } finally {
      setIsSubmittingRevise(false);
    }
  };

  const handleDeleteQuoteRequest = async (id, item) => {
    const status = (item?.status || "").toLowerCase();
    if (["accepted", "quotation_sent", "viewed"].includes(status)) {
      toast({
        title: "Deletion Blocked by Safeguard",
        description: `Cannot delete quote request in '${status}' status to preserve order history and audit trail.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (!window.confirm("Are you sure you want to delete this quote request?")) return;
    try {
      await deleteAdminQuoteRequest(id);
      toast({
        title: "Quote request deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchQuotationsData();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err.response?.data?.message || err.message || "Failed to delete quote request",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteQuotation = async (id, item) => {
    const status = (item?.status || "").toLowerCase();
    if (["accepted", "converted"].includes(status)) {
      toast({
        title: "Deletion Blocked by Safeguard",
        description: `Cannot delete quotation in '${status}' status to preserve financial audit trail.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    try {
      await deleteAdminQuotation(id);
      toast({
        title: "Quotation deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchQuotationsData();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err.response?.data?.message || err.message || "Failed to delete quotation",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleAssignQuoteReq = async (reqId) => {
    try {
      await adminAssignQuoteRequestController(reqId);
      toast({ title: "Request Assigned", description: "Moved to under_review status", status: "success" });
      fetchQuotationsData();
    } catch (err) {
      toast({ title: "Assign Error", description: err.message, status: "error" });
    }
  };

  const handleUpdateQuoteReqStatus = async (reqId, currentStatus, newStatus) => {
    if (newStatus === "under_review" || (currentStatus === "quote_requested" && newStatus === "under_review")) {
      return handleAssignQuoteReq(reqId);
    }
    try {
      await adminUpdateQuoteRequestStatusController(reqId, { status: newStatus });
      toast({ title: "Status Updated", status: "success" });
      fetchQuotationsData();
    } catch (err) {
      toast({ title: "Update Error", description: err.message, status: "error" });
    }
  };

  // Product bookings state
  const [showProductBookings, setShowProductBookings] = useState(false);
  const [productBookings, setProductBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsActionId, setBookingsActionId] = useState(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  // Category form
  const initialCategory = { name: "", description: "", image: "", categoryType: "product" };

  // Product form
  const initialProduct = {
    name: "",
    description: "",
    images: [],
    status: "Available",
    productType: "Hardware",
    pricingModel: "fixed",
    estimatedPriceFrom: 0,
    estimatedPriceTo: 0,
    siteInspectionRequired: false,
    installationDuration: "",
    usageType: "",
    whatIncluded: [],
    whatNotIncluded: [],
    warrantyPeriod: "",
    amcAvailable: true,
    amcPricePerYear: "",
    faqs: [],
  };

  const statusOptions = ["Available", "Out of Stock", "Discontinued"];

  const [newCategory, setNewCategory] = useState(initialCategory);
  const [categoryFile, setCategoryFile] = useState(null);
  const [newProduct, setNewProduct] = useState(initialProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  // Variants management
  const [variants, setVariants] = useState([]);

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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filtered data
  const filteredCategories = categories.filter((cat) =>
    (cat.category || cat.name)?.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.description?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredProducts = products.filter(
    (prod) =>
      prod.name?.toLowerCase().includes(productSearch.toLowerCase()) &&
      (productCategoryFilter ? (
        (prod.category?._id || prod.category) === productCategoryFilter ||
        (prod.categoryId?._id || prod.categoryId) === productCategoryFilter
      ) : true)
  );

  // Combined Bookings List (includes direct product bookings & accepted/converted/completed quotations)
  const allBookingsList = React.useMemo(() => {
    const list = [...(productBookings || [])];

    (quotationsList || []).forEach((q) => {
      const st = (q.status || "").toLowerCase();
      if (["accepted", "converted", "completed"].includes(st)) {
        const qId = q._id || q.id;
        const exists = list.some(
          (b) => b._id === qId || b.id === qId || (q.quotationNumber && (b.quotationNumber === q.quotationNumber || b.bookingNumber === q.quotationNumber))
        );
        if (!exists) {
          const custName =
            q.customerSnapshot?.name ||
            q.customerName ||
            q.clientName ||
            (typeof q.customerId === "object" && q.customerId
              ? q.customerId.name || `${q.customerId.fname || ""} ${q.customerId.lname || ""}`.trim()
              : "Customer");
          const custPhone =
            q.customerSnapshot?.phone ||
            q.customerPhone ||
            (typeof q.customerId === "object" && q.customerId ? q.customerId.phone : "Not Provided");
          const custEmail =
            q.customerSnapshot?.email ||
            q.customerEmail ||
            (typeof q.customerId === "object" && q.customerId ? q.customerId.email : "Not Provided");
          const custAddress =
            q.deliveryAddress ||
            q.address ||
            q.customerSnapshot?.address ||
            "Customer Address";

          const prodName =
            q.productName ||
            (Array.isArray(q.items) && q.items.length > 0
              ? q.items.map((i) => i.description || i.name || "Item").join(", ")
              : "Quotation Order");

          const qty = q.quantity || (Array.isArray(q.items) && q.items[0]?.quantity) || 1;
          const totAmount = q.totalAmount || q.pricing?.totalAmount || q.amount || 0;

          const bookingStatus = st === "completed" ? "completed" : "accepted";
          const payStatus = (q.paymentStatus || (st === "completed" ? "paid" : "pending")).toLowerCase();

          list.push({
            _id: q._id || q.id,
            id: q._id || q.id,
            bookingNumber: q.quotationNumber || `QUOT-${(q._id || "").slice(-6).toUpperCase()}`,
            customerSnapshot: {
              name: custName,
              phone: custPhone,
              email: custEmail,
              address: custAddress,
            },
            customerName: custName,
            phone: custPhone,
            email: custEmail,
            productSnapshot: {
              productName: prodName,
              categoryName: "Custom Quotation",
              images: q.productImages || [],
              description: q.adminNote || q.vendorNote || "Quotation Product Booking",
            },
            productName: prodName,
            quantity: qty,
            amount: totAmount,
            finalAmount: totAmount,
            status: bookingStatus,
            paymentStatus: payStatus,
            createdAt: q.createdAt || q.updatedAt || new Date().toISOString(),
            isQuotationBooking: true,
            rawQuotation: q,
          });
        }
      }
    });

    return list;
  }, [productBookings, quotationsList]);

  const filteredBookings = React.useMemo(() => {
    return allBookingsList.filter((b) => {
      const status = (b.status || "active").toLowerCase();
      const payStatus = (b.paymentStatus || "pending").toLowerCase();

      if (bookingStatusFilter === "active" && !["active", "accepted", "confirmed", "in_progress"].includes(status)) {
        return false;
      }
      if (bookingStatusFilter === "completed" && status !== "completed") {
        return false;
      }
      if (bookingStatusFilter === "paid" && payStatus !== "paid") {
        return false;
      }
      if (bookingStatusFilter === "unpaid" && payStatus === "paid") {
        return false;
      }
      if (bookingStatusFilter === "cancelled" && status !== "cancelled") {
        return false;
      }

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();

      const custObj = b.customerId || b.customerSnapshot || {};
      const custName = (custObj.name || `${custObj.fname || ""} ${custObj.lname || ""}`.trim() || b.customerName || "").toLowerCase();
      const custPhone = (custObj.mobileNumber || custObj.phone || b.phone || "").toLowerCase();

      const prodObj = b.productId || b.productSnapshot || {};
      const prodName = (prodObj.productName || prodObj.name || b.productName || "").toLowerCase();

      const bId = (b._id || b.id || b.bookingNumber || "").toLowerCase();

      return (
        bId.includes(term) ||
        custName.includes(term) ||
        custPhone.includes(term) ||
        prodName.includes(term) ||
        status.includes(term) ||
        payStatus.includes(term)
      );
    });
  }, [allBookingsList, bookingStatusFilter, searchTerm]);

  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const totalBookingPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;

  // Calculate statistics
  const totalCategories = categories.length;
  const totalProducts = products.length;

  const acceptedBookingsCount = React.useMemo(() => {
    return allBookingsList.filter((p) =>
      ["active", "accepted", "confirmed", "in_progress"].includes((p.status || "").toLowerCase())
    ).length;
  }, [allBookingsList]);

  const completedBookingsCount = React.useMemo(() => {
    return allBookingsList.filter((p) => (p.status || "").toLowerCase() === "completed").length;
  }, [allBookingsList]);

  const paidBookingsCount = React.useMemo(() => {
    return allBookingsList.filter((p) => (p.paymentStatus || "").toLowerCase() === "paid").length;
  }, [allBookingsList]);

  // Category Image Upload Handler
  const handleCategoryImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCategoryFile(file);
      setNewCategory(prev => ({
        ...prev,
        image: URL.createObjectURL(file)
      }));
    }
  };

  const handleRemoveCategoryImg = async () => {
    if (currentView === "editCategory" && selectedCategory && (selectedCategory.image || selectedCategory.url) && !categoryFile) {
      try {
        setIsSubmitting(true);
        await removeCategoryImage(selectedCategory._id);
        setNewCategory(prev => ({ ...prev, image: "", url: "" }));
        setSelectedCategory(prev => ({ ...prev, image: "", url: "" }));
        toast({ title: "Image Removed", status: "success", duration: 3000, isClosable: true });
      } catch (e) {
        toast({ title: "Error Removing Image", description: e.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCategoryFile(null);
      setNewCategory(prev => ({ ...prev, image: "" }));
    }
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    const previewUrls = files.map(file => ({
      url: URL.createObjectURL(file),
      preview: URL.createObjectURL(file),
      file: file
    }));

    setNewProduct(prev => ({
      ...prev,
      images: [...(prev.images || []), ...previewUrls]
    }));
  };

  const handleRemoveImage = (item, index) => {
    let serverIdentifier = null;

    if (item && item.preventDefault) return;

    if (typeof item === 'string' && !item.startsWith('blob:') && !item.includes('://localhost')) {
      serverIdentifier = item;
    } else if (typeof item === 'object' && item !== null && !item.file) {
      serverIdentifier = item.public_id || item.publicId || item.url || item.secure_url;
    }

    if (serverIdentifier) {
      setDeletedImageIds(prev => [...prev, serverIdentifier]);
    }

    if (item && item.file) {
      setImageFiles(prev => prev.filter(f => f !== item.file));
    }

    setNewProduct(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));

    toast({
      title: "Image Removed",
      description: "Image removed from list. Save to apply changes.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (currentView === "categories") {
      setCategorySearch(value);
    } else if (currentView === "products") {
      setProductSearch(value);
    }

    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCategorySearch("");
    setProductSearch("");
    setProductCategoryFilter("");
    setCurrentPage(1);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentView === "categories" && currentPage < totalCategoryPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentView === "products" && currentPage < totalProductPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentView === "bookings" && currentPage < totalBookingPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // View handlers
  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setViewModalType("category");
    setIsViewModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewModalType("product");
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setViewModalType("");
  };

  // Fetch current user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || (storedUser.role?.toLowerCase() !== "owner")) {
      toast({
        title: "Access Denied",
        description: "Only owner can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/auth/signin");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate, toast]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setIsLoadingCategories(true);
      setIsLoadingProducts(true);

      const [categoryData, productData] = await Promise.all([
        getAllCategories(),
        getAllProducts()
      ]);

      // Parse categories
      let categoriesArray = [];
      if (Array.isArray(categoryData)) {
        categoriesArray = categoryData;
      } else if (categoryData && Array.isArray(categoryData.categories)) {
        categoriesArray = categoryData.categories;
      } else if (categoryData && Array.isArray(categoryData.data)) {
        categoriesArray = categoryData.data;
      } else if (categoryData?.data?.categories) {
        categoriesArray = categoryData.data.categories;
      } else if (categoryData?.result && Array.isArray(categoryData.result)) {
        categoriesArray = categoryData.result;
      } else if (categoryData?.result?.categories) {
        categoriesArray = categoryData.result.categories;
      } else {
        const maybeArray = Object.values(categoryData || {}).find((v) => Array.isArray(v));
        if (Array.isArray(maybeArray)) {
          categoriesArray = maybeArray;
        }
      }
      setCategories(categoriesArray);

      // Parse products
      let productsArray = [];
      if (Array.isArray(productData)) {
        productsArray = productData;
      } else if (productData && Array.isArray(productData.products)) {
        productsArray = productData.products;
      } else if (productData && Array.isArray(productData.data)) {
        productsArray = productData.data;
      } else if (productData?.data?.products) {
        productsArray = productData.data.products;
      } else if (productData?.result && Array.isArray(productData.result)) {
        productsArray = productData.result;
      } else if (productData?.result?.products) {
        productsArray = productData.result.products;
      } else {
        const maybeArray = Object.values(productData || {}).find((v) => Array.isArray(v));
        if (Array.isArray(maybeArray)) {
          productsArray = maybeArray;
        }
      }

      const normalizedProducts = productsArray.map(product => ({
        ...product,
        name: product.name || product.productName || "Unnamed Product"
      }));

      setProducts(normalizedProducts);

    } catch (err) {
      console.error("Fetch error:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load dashboard data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingData(false);
      setIsLoadingCategories(false);
      setIsLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const fetchProductBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await getAllProductBookings();
      const raw = res?.result || res?.bookings || res?.data || res || [];
      setProductBookings(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Error fetching product bookings:", err);
      toast({
        title: "Bookings Error",
        description: err.message || "Failed to load product bookings.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBookingsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) fetchProductBookings();
  }, [currentUser, fetchProductBookings]);

  const handleUpdateProductBooking = async (booking) => {
    const bId = booking._id || booking.id;
    setBookingsActionId(bId);
    try {
      await adminCompleteProductBooking(bId);
      toast({ title: "Booking Completed", status: "success", description: "Product booking marked as completed." });
      fetchProductBookings();
    } catch (err) {
      try {
        await adminUpdateProductBookingStatus(bId, { status: "completed" });
        toast({ title: "Booking Completed", status: "success", description: "Product booking marked as completed." });
        fetchProductBookings();
      } catch (err2) {
        toast({ title: "Update Error", description: err2.message || err.message, status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      setBookingsActionId(null);
    }
  };

  const handleCancelProductBooking = async (booking) => {
    const reason = window.prompt("Cancel reason:", "Admin cancelled");
    if (reason === null) return;
    const bId = booking._id || booking.id;
    setBookingsActionId(bId);
    try {
      await adminUpdateProductBookingStatus(bId, { status: "cancelled", cancelReason: reason.trim() || "Admin cancelled" });
      toast({ title: "Booking Cancelled", status: "info", description: "Product booking has been cancelled." });
      fetchProductBookings();
    } catch (err) {
      try {
        await cancelProductBooking(bId, reason.trim() || "Admin cancelled");
        toast({ title: "Booking Cancelled", status: "info", description: "Product booking has been cancelled." });
        fetchProductBookings();
      } catch (err2) {
        toast({ title: "Cancel Error", description: err2.message || err.message, status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      setBookingsActionId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setCategorySearch("");
    setProductSearch("");
    setProductCategoryFilter("");
  }, [currentView]);

  if (!currentUser) return null;

  const handleBack = () => {
    setCurrentView("categories");
    setSelectedCategory(null);
    setSelectedProduct(null);
    setNewCategory(initialCategory);
    setNewProduct(initialProduct);
    setVariants([]);
    setCategoryFile(null);
    setImageFiles([]);
    setDeletedImageIds([]);
  };

  const handleResetCategory = () => {
    setNewCategory(initialCategory);
    setCategoryFile(null);
  };

  const handleResetProduct = () => {
    setNewProduct(initialProduct);
    setImageFiles([]);
    setDeletedImageIds([]);
    setVariants([]);
  };

  // Category Submit
  const handleSubmitCategory = async () => {
    const categoryName = newCategory.name || "";
    const categoryDesc = newCategory.description || "";

    if (!categoryName.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!categoryDesc.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category description is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!categoryFile) {
      return toast({
        title: "Validation Error",
        description: "Category image is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const categoryData = {
        category: newCategory.name,
        description: newCategory.description,
        categoryType: newCategory.categoryType,
      };

      const resData = await createCategories(categoryData);

      const categoryId =
        resData._id ||
        resData.category?._id ||
        resData.data?._id ||
        resData.data?.category?._id ||
        resData.result?._id;

      if (!categoryId) {
        throw new Error(`Category created but ID was not found in response.`);
      }

      await uploadImageCategory(categoryId, categoryFile);

      toast({
        title: "Category Created",
        description: `"${resData.category?.category || resData.category || categoryData.category}" added successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setNewCategory(initialCategory);
      setCategoryFile(null);
      await fetchData();
      handleBack();

    } catch (err) {
      toast({
        title: "Error Creating Category",
        description: err.message || "Failed to create category",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Category
  const handleUpdateCategory = async () => {
    const categoryName = newCategory.name || "";
    const categoryDesc = newCategory.description || "";

    if (!categoryName.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    if (!categoryDesc.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category description is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);
      const updateData = {
        category: categoryName.trim(),
        description: categoryDesc.trim(),
        categoryType: newCategory.categoryType
      };

      await updateCategories(selectedCategory._id, updateData);

      if (categoryFile && selectedCategory._id) {
        try {
          await uploadImageCategory(selectedCategory._id, categoryFile);
        } catch (uploadError) {
          console.error("Image upload failed during update:", uploadError);
          toast({
            title: "Warning",
            description: "Category details updated, but image upload failed.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }

      toast({
        title: "Category Updated",
        description: `"${categoryName}" updated successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setCategoryFile(null);
      await fetchData();
      handleBack();
    } catch (error) {
      toast({
        title: "Error Updating Category",
        description: error.message || "Failed to update category",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteCategory = async (category) => {
    setItemToDelete(category);
    setDeleteType("category");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    setItemToDelete(product);
    setDeleteType("product");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);

      if (deleteType === "category") {
        const productsInCategory = products.filter(
          p => p.category?._id === itemToDelete._id || p.category === itemToDelete._id
        );

        if (productsInCategory.length > 0) {
          toast({
            title: "Cannot Delete Category",
            description: `This category has ${productsInCategory.length} product(s). Please remove or reassign them first.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        await deleteCategory(itemToDelete._id);
        toast({
          title: "Category Deleted",
          description: `"${itemToDelete.name || itemToDelete.category}" has been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (deleteType === "product") {
        await deleteProducts(itemToDelete._id);
        toast({
          title: "Product Deleted",
          description: `"${itemToDelete.name}" has been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchData();
      closeDeleteModal();
    } catch (err) {
      toast({
        title: `Error Deleting ${deleteType === "category" ? "Category" : "Product"}`,
        description: err.message || `Failed to delete ${deleteType}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteType("");
    setIsDeleting(false);
  };

  // Product Submit
  const handleSubmitProduct = async () => {
    if (!newProduct.name || !newProduct.name.trim()) {
      return toast({
        title: "Validation Error",
        description: "Product name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    let finalCategoryId =
      getSafeId(selectedCategory) ||
      getSafeId(newProduct.categoryId) ||
      getSafeId(newProduct.category) ||
      getSafeId(selectedProduct?.category) ||
      getSafeId(selectedProduct?.categoryId) ||
      getSafeId(selectedProduct?.category?._id) ||
      getSafeId(selectedProduct?.categoryId?._id);

    if (!finalCategoryId && selectedProduct) {
      const possibleFieldNames = ['category', 'categoryId', 'category_id'];
      for (const field of possibleFieldNames) {
        const val = selectedProduct[field];
        if (val) {
          if (typeof val === 'string' && val.trim() !== "") {
            finalCategoryId = val;
            break;
          } else if (typeof val === 'object' && val._id) {
            finalCategoryId = val._id;
            break;
          }
        }
      }
    }

    if (!finalCategoryId) {
      return toast({
        title: "Validation Error",
        description: "Category is required. Please ensure this product is linked to a category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (newProduct.estimatedPriceFrom === "" || newProduct.estimatedPriceTo === "") {
      return toast({
        title: "Validation Error",
        description: "Price range (From/To) is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const productData = {
        productName: (newProduct.name || "").trim(),
        productType: newProduct.productType || "Hardware",
        description: (newProduct.description || "").trim(),
        pricingModel: newProduct.pricingModel || "fixed",
        estimatedPriceFrom: Number(newProduct.estimatedPriceFrom) || 0,
        estimatedPriceTo: Number(newProduct.estimatedPriceTo) || 0,
        siteInspectionRequired: !!newProduct.siteInspectionRequired,
        installationDuration: newProduct.installationDuration || "2-3 hours",
        usageType: newProduct.usageType || "Residential",
        whatIncluded: Array.isArray(newProduct.whatIncluded) ? newProduct.whatIncluded.map(i => i.trim()).filter(i => i !== "") : [],
        whatNotIncluded: Array.isArray(newProduct.whatNotIncluded) ? newProduct.whatNotIncluded.map(i => i.trim()).filter(i => i !== "") : [],
        warrantyPeriod: newProduct.warrantyPeriod || "2 years",
        amcAvailable: !!newProduct.amcAvailable,
        amcPricePerYear: Number(newProduct.amcPricePerYear) || 0,
        status: newProduct.status || "Available",
        productImages: Array.isArray(newProduct.images) ? newProduct.images.filter(img => !img.file) : [],
        images: Array.isArray(newProduct.images) ? newProduct.images.filter(img => !img.file) : [],
        faqs: Array.isArray(newProduct.faqs)
          ? newProduct.faqs
              .filter(f => f && (f.question?.trim() || f.answer?.trim()))
              .map(f => ({ question: f.question?.trim() || "", answer: f.answer?.trim() || "" }))
          : []
      };

      if (finalCategoryId) {
        productData.categoryId = finalCategoryId;
      }

      if (variants && variants.length > 0) {
        productData.variants = variants;
      }

      let response;
      if (selectedProduct) {
        if (!selectedProduct._id) {
          throw new Error("Cannot update: Product ID is missing.");
        }

        if (deletedImageIds.length > 0) {
          try {
            await Promise.all(
              deletedImageIds.map((publicId) =>
                deleteProductImage(selectedProduct._id, publicId)
              )
            );
          } catch (deleteErr) {
            console.error("Failed to delete some images:", deleteErr);
            toast({
              title: "Warning",
              description: "Some images could not be deleted from server.",
              status: "warning",
              duration: 3000,
              isClosable: true,
            });
          }
          setDeletedImageIds([]);
        }

        response = await updateProducts(selectedProduct._id, productData);

        if (imageFiles.length > 0) {
          await uploadProductImages(selectedProduct._id, imageFiles);
        }

        toast({
          title: "Product Updated",
          description: `"${productData.productName}" updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        response = await createProducts(productData);

        const createdProductId =
          response.result?._id ||
          response.data?._id ||
          response._id ||
          response.productId ||
          response.result?.productId;

        if (imageFiles.length > 0 && createdProductId) {
          await uploadProductImages(createdProductId, imageFiles);
        }

        toast({
          title: "Product Created",
          description: `"${productData.productName}" added successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setImageFiles([]);
      await fetchData();
      handleBack();
    } catch (err) {
      console.error("Product submission error:", err);

      let errorTitle = selectedProduct ? "Error Updating Product" : "Error Creating Product";
      let errorDescription = err.message;

      if (err.message?.includes("500")) {
        errorDescription = "Server error. Please check backend connection.";
      } else if (err.message?.includes("401") || err.message?.includes("403")) {
        errorDescription = "Authentication error. Please log in again.";
      } else if (err.message?.includes("Network")) {
        errorDescription = "Network error. Check your internet connection.";
      } else if (err.message?.includes("category")) {
        errorDescription = "Category error. Please select a valid category.";
      } else if (err.status === 500) {
        errorDescription = "Server error (500). Please check backend logs.";
      } else if (err.response?.data?.message) {
        errorDescription = err.response.data.message;
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit handlers
  const handleEditProduct = (product) => {
    setSelectedProduct(product);

    const catId = getSafeId(product.category) || getSafeId(product.categoryId);
    let cat = categories.find((c) => c._id === catId);

    if (!cat && catId) {
      if (typeof product.categoryId === 'object') {
        cat = product.categoryId;
      } else if (typeof product.category === 'object') {
        cat = product.category;
      } else {
        cat = { _id: catId, name: product.categoryName || "Current Category" };
      }
    }

    if (cat) {
      setSelectedCategory(cat);
    }

    const existingImages = Array.isArray(product.productImages) ? product.productImages : (Array.isArray(product.images) ? product.images : []);

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      setVariants(product.variants.map(variant => {
        const color = Array.isArray(variant.color) ? variant.color[0] || '' : variant.color || '';
        const size = Array.isArray(variant.size) ? variant.size[0] || '' : variant.size || '';

        return {
          color: color,
          size: size,
          price: variant.price || '',
          stock: variant.stock || '',
          sku: variant.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
      }));
    } else {
      setVariants([]);
    }

    setNewProduct({
      name: product.productName || product.name || '',
      description: product.description || '',
      images: Array.isArray(existingImages) ? existingImages : [],
      status: product.status || "Available",
      productType: product.productType || "Hardware",
      pricingModel: product.pricingModel || "fixed",
      estimatedPriceFrom: product.estimatedPriceFrom !== undefined ? product.estimatedPriceFrom : 0,
      estimatedPriceTo: product.estimatedPriceTo !== undefined ? product.estimatedPriceTo : 0,
      siteInspectionRequired: !!product.siteInspectionRequired,
      installationDuration: product.installationDuration || "2-3 hours",
      usageType: product.usageType || "Residential",
      whatIncluded: Array.isArray(product.whatIncluded) ? product.whatIncluded : [],
      whatNotIncluded: Array.isArray(product.whatNotIncluded) ? product.whatNotIncluded : [],
      warrantyPeriod: product.warrantyPeriod || "2 years",
      amcAvailable: !!product.amcAvailable,
      amcPricePerYear: product.amcPricePerYear || 0,
      categoryId: catId,
      faqs: Array.isArray(product.faqs) ? product.faqs : []
    });
    setCurrentView("addProduct");
  };

  const handleAddProductToCategory = (category) => {
    setSelectedCategory(category);
    setNewProduct(initialProduct);
    setVariants([]);
    setImageFiles([]);
    setCurrentView("addProduct");
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryFile(null);
    setNewCategory({
      name: category.name || category.category,
      description: category.description || "",
      image: category.image || category.url || "",
      categoryType: category.categoryType || "product"
    });
    setCurrentView("editCategory");
  };

  // Render Form Views
  if (currentView === "addCategory" || currentView === "editCategory" || currentView === "addProduct") {
    return (
      <Flex
        flexDirection="column"
        pt={{ base: "120px", md: "75px" }}
        height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
        overflow="hidden"
        css={globalScrollbarStyles}
      >
        <Card
          bg="white"
          shadow="xl"
          display="flex"
          flexDirection="column"
          height="100%"
          overflow="hidden"
        >
          <CardHeader bg="white" flexShrink={0}>
            <Flex align="center" mb={4}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={handleBack}
                mr={4}
                color={customColor}
                _hover={{ bg: `${customColor}10` }}
                size="sm"
              >
                Back
              </Button>
              <Heading size="md" color="gray.700">
                {currentView === "addCategory" && "Add New Category"}
                {currentView === "editCategory" && "Edit Category"}
                {currentView === "addProduct" && (selectedProduct ? "Edit Product" : "Add New Product")}
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody
            bg="white"
            flex="1"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            p={0}
          >
            {/* Category Form */}
            {(currentView === "addCategory" || currentView === "editCategory") && (
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                <Box
                  flex="1"
                  overflowY="auto"
                  p={4}
                  css={globalScrollbarStyles}
                >
                  <FormControl mb="20px" isRequired>
                    <FormLabel htmlFor="name" color="gray.700" fontSize="sm">Name</FormLabel>
                    <Input
                      id="name"
                      placeholder="Enter category name"
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      value={newCategory.name}
                      borderColor={`${customColor}50`}
                      _hover={{ borderColor: customColor }}
                      _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                      bg="white"
                      size="sm"
                    />
                  </FormControl>

                  <FormControl mb="20px" isRequired>
                    <FormLabel htmlFor="description" color="gray.700" fontSize="sm">Description</FormLabel>
                    <Textarea
                      id="description"
                      placeholder="Enter category description"
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      value={newCategory.description}
                      borderColor={`${customColor}50`}
                      _hover={{ borderColor: customColor }}
                      _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                      bg="white"
                      rows={3}
                      size="sm"
                    />
                  </FormControl>

                  <FormControl mb="20px" isRequired>
                    <FormLabel color="gray.700" fontSize="sm">Category Image</FormLabel>
                    <Flex direction="column" gap={3}>
                      {newCategory.image && (
                        <Box
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          p={2}
                          width="fit-content"
                          position="relative"
                        >
                          <Image
                            src={newCategory.image}
                            alt="Category Preview"
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <IconButton
                            icon={<FaTrash />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={-2}
                            right={-2}
                            borderRadius="full"
                            onClick={handleRemoveCategoryImg}
                            aria-label="Remove image"
                          />
                        </Box>
                      )}
                      <Box
                        border="1px dashed"
                        borderColor={customColor}
                        borderRadius="md"
                        p={4}
                        textAlign="center"
                        cursor="pointer"
                        _hover={{ bg: `${customColor}05` }}
                        position="relative"
                      >
                        {isSubmitting ? (
                          <Spinner size="sm" color={customColor} />
                        ) : (
                          <>
                            <Input
                              type="file"
                              accept="image/*"
                              height="100%"
                              width="100%"
                              position="absolute"
                              top="0"
                              left="0"
                              opacity="0"
                              cursor="pointer"
                              onChange={handleCategoryImageUpload}
                              disabled={isSubmitting}
                            />
                            <Flex direction="column" align="center" justify="center" gap={2}>
                              <Icon as={FaPlusCircle} w={6} h={6} color={customColor} />
                              <Text fontSize="sm" color="gray.500">
                                Click to upload category image
                              </Text>
                            </Flex>
                          </>
                        )}
                      </Box>
                    </Flex>
                  </FormControl>
                </Box>

                <Box
                  p={4}
                  borderTop="1px solid"
                  borderColor="gray.100"
                  bg="white"
                  flexShrink={0}
                >
                  <Flex justify="flex-end" gap={4}>
                    <Button
                      variant="outline"
                      onClick={handleResetCategory}
                      borderColor="gray.300"
                      color="gray.600"
                      size="md"
                      px={8}
                      borderRadius="lg"
                      _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                    >
                      Reset
                    </Button>
                    <Button
                      bg={customColor}
                      _hover={{ bg: "#006666", transform: "translateY(-1px)", boxShadow: "lg" }}
                      _active={{ bg: "#004d4d", transform: "translateY(0)" }}
                      color="white"
                      onClick={currentView === "addCategory" ? handleSubmitCategory : handleUpdateCategory}
                      isLoading={isSubmitting}
                      size="md"
                      px={10}
                      borderRadius="lg"
                      leftIcon={<FaPlusCircle />}
                      transition="all 0.2s"
                    >
                      {currentView === "addCategory" ? "Create Category" : "Update Category"}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}

            {/* Product Form */}
            {currentView === "addProduct" && (
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                overflow="hidden"
                bg="transparent"
              >
                <Box
                  flex="1"
                  overflowY="auto"
                  css={globalScrollbarStyles}
                  pr={2}
                >
                  <Box p={4}>
                    <FormControl mb="20px" isRequired>
                      <FormLabel htmlFor="category" color="gray.700" fontSize="sm">Category</FormLabel>
                      <Select
                        id="category"
                        placeholder="Select category"
                        value={
                          (typeof selectedCategory === 'object' ? selectedCategory?._id : selectedCategory) || ""
                        }
                        onChange={(e) => {
                          const category = categories.find(c => c._id === e.target.value);
                          setSelectedCategory(category || { _id: e.target.value });
                        }}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.category || cat.name}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Product Name</FormLabel>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Enter product name"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Status</FormLabel>
                        <Select
                          value={newProduct.status}
                          onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Estimated Price From (₹)</FormLabel>
                        <Input
                          type="number"
                          value={newProduct.estimatedPriceFrom}
                          onChange={(e) => setNewProduct({ ...newProduct, estimatedPriceFrom: e.target.value })}
                          placeholder="e.g. 2500"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Estimated Price To (₹)</FormLabel>
                        <Input
                          type="number"
                          value={newProduct.estimatedPriceTo}
                          onChange={(e) => setNewProduct({ ...newProduct, estimatedPriceTo: e.target.value })}
                          placeholder="e.g. 3500"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Product Type</FormLabel>
                        <Select
                          value={newProduct.productType}
                          onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          <option value="Hardware">Hardware</option>
                          <option value="Service">Service</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Pricing Model</FormLabel>
                        <Select
                          value={newProduct.pricingModel}
                          onChange={(e) => setNewProduct({ ...newProduct, pricingModel: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="quote">Quote</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Usage Type</FormLabel>
                        <Select
                          value={newProduct.usageType}
                          onChange={(e) => setNewProduct({ ...newProduct, usageType: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Installation Duration</FormLabel>
                        <Input
                          value={newProduct.installationDuration}
                          onChange={(e) => setNewProduct({ ...newProduct, installationDuration: e.target.value })}
                          placeholder="e.g. 2-3 hours"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Warranty Period</FormLabel>
                        <Input
                          value={newProduct.warrantyPeriod}
                          onChange={(e) => setNewProduct({ ...newProduct, warrantyPeriod: e.target.value })}
                          placeholder="e.g. 2 years"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        />
                      </FormControl>
                    </Grid>

                    <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="site-inspection" mb="0" fontSize="sm" color="gray.700">
                          Site Inspection?
                        </FormLabel>
                        <Switch
                          id="site-inspection"
                          isChecked={newProduct.siteInspectionRequired}
                          onChange={(e) => setNewProduct({ ...newProduct, siteInspectionRequired: e.target.checked })}
                          colorScheme="teal"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="amc-available" mb="0" fontSize="sm" color="gray.700">
                          AMC Available?
                        </FormLabel>
                        <Switch
                          id="amc-available"
                          isChecked={newProduct.amcAvailable}
                          onChange={(e) => setNewProduct({ ...newProduct, amcAvailable: e.target.checked })}
                          colorScheme="teal"
                          size="sm"
                        />
                      </FormControl>

                      {newProduct.amcAvailable && (
                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.700">AMC Price / Year</FormLabel>
                          <Input
                            type="number"
                            value={newProduct.amcPricePerYear}
                            onChange={(e) => setNewProduct({ ...newProduct, amcPricePerYear: e.target.value })}
                            size="sm"
                            borderColor={`${customColor}50`}
                            _hover={{ borderColor: customColor }}
                            _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                            bg="white"
                          />
                        </FormControl>
                      )}
                    </SimpleGrid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">What's Included</FormLabel>
                        <Textarea
                          value={Array.isArray(newProduct.whatIncluded) ? newProduct.whatIncluded.join('\n') : ''}
                          onChange={(e) => setNewProduct({ ...newProduct, whatIncluded: e.target.value.split('\n').filter(item => item.trim()) })}
                          placeholder="Enter each item on a new line"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">What's Not Included</FormLabel>
                        <Textarea
                          value={Array.isArray(newProduct.whatNotIncluded) ? newProduct.whatNotIncluded.join('\n') : ''}
                          onChange={(e) => setNewProduct({ ...newProduct, whatNotIncluded: e.target.value.split('\n').filter(item => item.trim()) })}
                          placeholder="Enter each item on a new line"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          rows={3}
                        />
                      </FormControl>
                    </Grid>

                    <FormControl mb="20px">
                      <FormLabel color="gray.700" fontSize="sm">Description</FormLabel>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Enter product description"
                        rows={3}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                      />
                    </FormControl>

                    {/* FAQ Questions Section */}
                    <Box borderTop="1px solid" borderColor={`${customColor}20`} pt={4} mt={4} mb={6}>
                      <Flex align="center" justify="space-between" mb={3}>
                        <HStack spacing={2}>
                          <Icon as={FaQuestionCircle} color={customColor} />
                          <Heading size="xs" color="gray.700">Product FAQs (Frequently Asked Questions)</Heading>
                        </HStack>
                        <Button
                          size="xs"
                          leftIcon={<FaPlus />}
                          colorScheme="teal"
                          variant="outline"
                          onClick={() => {
                            const currentFaqs = Array.isArray(newProduct.faqs) ? [...newProduct.faqs] : [];
                            setNewProduct({
                              ...newProduct,
                              faqs: [...currentFaqs, { question: "", answer: "" }],
                            });
                          }}
                        >
                          Add FAQ
                        </Button>
                      </Flex>

                      {(!newProduct.faqs || newProduct.faqs.length === 0) ? (
                        <Text fontSize="xs" color="gray.500" fontStyle="italic" mb={2}>
                          No FAQ questions added yet. Click "Add FAQ" to add product-specific FAQs.
                        </Text>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          {newProduct.faqs.map((faq, idx) => (
                            <Box key={idx} p={3} border="1px solid" borderColor={`${customColor}30`} borderRadius="md" bg="gray.50">
                              <Flex align="center" justify="space-between" mb={2}>
                                <Text fontSize="xs" fontWeight="bold" color={customColor}>
                                  FAQ #{idx + 1}
                                </Text>
                                <IconButton
                                  aria-label="Remove FAQ"
                                  icon={<FaTrash />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = newProduct.faqs.filter((_, i) => i !== idx);
                                    setNewProduct({ ...newProduct, faqs: updated });
                                  }}
                                />
                              </Flex>
                              <FormControl mb={2}>
                                <FormLabel fontSize="2xs" color="gray.600" mb={1}>Question</FormLabel>
                                <Input
                                  size="sm"
                                  placeholder="e.g. Is installation included?"
                                  value={faq.question || ""}
                                  onChange={(e) => {
                                    const updated = [...newProduct.faqs];
                                    updated[idx] = { ...updated[idx], question: e.target.value };
                                    setNewProduct({ ...newProduct, faqs: updated });
                                  }}
                                  bg="white"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="2xs" color="gray.600" mb={1}>Answer</FormLabel>
                                <Textarea
                                  size="sm"
                                  rows={2}
                                  placeholder="e.g. Yes, basic installation is included in the quote."
                                  value={faq.answer || ""}
                                  onChange={(e) => {
                                    const updated = [...newProduct.faqs];
                                    updated[idx] = { ...updated[idx], answer: e.target.value };
                                    setNewProduct({ ...newProduct, faqs: updated });
                                  }}
                                  bg="white"
                                />
                              </FormControl>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>

                    <FormControl mb="20px">
                      <FormLabel color="gray.700" fontSize="sm">Product Images</FormLabel>
                      <Flex direction="column" gap={3}>
                        {newProduct.images && newProduct.images.length > 0 && (
                          <Flex wrap="wrap" gap={3}>
                            {newProduct.images.map((img, index) => (
                              <Box
                                key={img.public_id || img.publicId || index}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={2}
                                width="fit-content"
                                position="relative"
                              >
                                <Image
                                  src={img.url || img.preview || img}
                                  alt={`Product image ${index + 1}`}
                                  boxSize="80px"
                                  objectFit="cover"
                                  borderRadius="md"
                                />
                                <IconButton
                                  icon={<FaTrash />}
                                  size="xs"
                                  colorScheme="red"
                                  position="absolute"
                                  top={-2}
                                  right={-2}
                                  borderRadius="full"
                                  onClick={() => handleRemoveImage(img, index)}
                                  aria-label="Remove image"
                                />
                              </Box>
                            ))}
                          </Flex>
                        )}
                        <Box
                          border="1px dashed"
                          borderColor={customColor}
                          borderRadius="md"
                          p={4}
                          textAlign="center"
                          cursor="pointer"
                          _hover={{ bg: `${customColor}05` }}
                          position="relative"
                        >
                          {isSubmitting ? (
                            <Spinner size="sm" color={customColor} />
                          ) : (
                            <>
                              <Input
                                type="file"
                                multiple
                                accept="image/*"
                                height="100%"
                                width="100%"
                                position="absolute"
                                top="0"
                                left="0"
                                opacity="0"
                                cursor="pointer"
                                onChange={handleImageUpload}
                                disabled={isSubmitting}
                              />
                              <Flex direction="column" align="center" justify="center" gap={2}>
                                <Icon as={FaPlusCircle} w={6} h={6} color={customColor} />
                                <Text fontSize="sm" color="gray.500">
                                  Click to upload product images
                                </Text>
                              </Flex>
                            </>
                          )}
                        </Box>
                      </Flex>
                    </FormControl>
                  </Box>
                </Box>

                <Box
                  p={6}
                  borderTop="1px solid"
                  borderColor={`${customColor}20`}
                  bg="white"
                  boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.05)"
                  flexShrink={0}
                >
                  <Flex justify="flex-end" gap={4}>
                    <Button
                      variant="outline"
                      onClick={handleResetProduct}
                      borderColor="gray.300"
                      color="gray.600"
                      size="md"
                      px={8}
                      borderRadius="lg"
                      _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                    >
                      Reset
                    </Button>
                    <Button
                      bg={customColor}
                      _hover={{ bg: "#006666", transform: "translateY(-1px)", boxShadow: "lg" }}
                      _active={{ bg: "#004d4d", transform: "translateY(0)" }}
                      color="white"
                      onClick={handleSubmitProduct}
                      isLoading={isSubmitting}
                      size="md"
                      px={10}
                      borderRadius="lg"
                      leftIcon={selectedProduct ? <FaEdit /> : <FaPlusCircle />}
                      transition="all 0.2s"
                    >
                      {selectedProduct ? "Update Product" : "Create Product"}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}
          </CardBody>
        </Card>
      </Flex>
    );
  }

  // Main Dashboard View
  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "45px" }}
      height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
      overflow="hidden"
      css={globalScrollbarStyles}
    >
      {/* Fixed Statistics Cards */}
      <Box flexShrink={0} p={{ base: 1, md: 4 }} pb={0}>
          <Grid
            templateColumns={{ base: "1fr 1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            gap={{ base: 2.5, md: 3 }}
            mb={{ base: 3, md: 4 }}
          >
            {/* 1. All Categories Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("categories")}
              border={currentView === "categories" ? "2px solid" : "1px solid"}
              borderColor={currentView === "categories" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              position="relative"
              overflow="hidden"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Categories
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {isLoadingCategories ? <Spinner size="xs" /> : totalCategories}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg={customColor} flexShrink={0} borderRadius="10px">
                    <Icon as={MdCategory} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 2. All Products Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("products")}
              border={currentView === "products" ? "2px solid" : "1px solid"}
              borderColor={currentView === "products" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Products
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {isLoadingProducts ? <Spinner size="xs" /> : totalProducts}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg={customColor} flexShrink={0} borderRadius="10px">
                    <Icon as={FaBox} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 3. Product Quotes Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("quotations")}
              border={currentView === "quotations" ? "2px solid" : "1px solid"}
              borderColor={currentView === "quotations" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              position="relative"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              {activeQuoteRequestsCount > 0 && (
                <Badge colorScheme="red" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="3xs" position="absolute" top="-8px" right="-6px" zIndex={3}>
                  {activeQuoteRequestsCount} NEW
                </Badge>
              )}
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Product Quotes
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {isLoadingQuotations ? <Spinner size="xs" /> : Math.max(quoteRequests.length, quotationsList.length)}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg={customColor} flexShrink={0} borderRadius="10px">
                    <Icon as={FaFileInvoiceDollar} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 4. Accepted Bookings Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => { setCurrentView("bookings"); setBookingStatusFilter("active"); }}
              border={currentView === "bookings" ? "2px solid" : "1px solid"}
              borderColor={currentView === "bookings" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Bookings
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {bookingsLoading ? <Spinner size="xs" /> : acceptedBookingsCount}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg="blue.500" flexShrink={0} borderRadius="10px">
                    <Icon as={FaClipboardCheck} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 5. Inventory & Stock Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("inventory")}
              border={currentView === "inventory" ? "2px solid" : "1px solid"}
              borderColor={currentView === "inventory" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Stock Inventory
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {isLoadingInventory ? <Spinner size="xs" /> : inventoryList.length || totalProducts}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg="orange.400" flexShrink={0} borderRadius="10px">
                    <Icon as={MdInventory} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 6. Payments Tracking Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("payments")}
              border={currentView === "payments" ? "2px solid" : "1px solid"}
              borderColor={currentView === "payments" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Payments & Settlement
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {isLoadingPaymentsList ? <Spinner size="xs" /> : paymentsList.length || 0}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg="purple.500" flexShrink={0} borderRadius="10px">
                    <Icon as={FaCreditCard} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 7. Reconciliation & Refunds Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("reconciliation")}
              border={currentView === "reconciliation" ? "2px solid" : "1px solid"}
              borderColor={currentView === "reconciliation" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Reconciliation
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      {isLoadingReconciliation ? <Spinner size="xs" /> : `${unmatchedPayments.length} Unmatched`}
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg="teal.600" flexShrink={0} borderRadius="10px">
                    <Icon as={FaExchangeAlt} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* 8. Financial Reports & Audit Card */}
            <Card
              minH={{ base: "52px", md: "60px" }}
              cursor="pointer"
              onClick={() => setCurrentView("reports")}
              border={currentView === "reports" || currentView === "audit-logs" ? "2px solid" : "1px solid"}
              borderColor={currentView === "reports" || currentView === "audit-logs" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              _hover={{ transform: { base: "none", md: "translateY(-2px)" }, shadow: "md", borderColor: customColor }}
            >
              <CardBody p={{ base: 2, md: 3 }}>
                <Flex align="center" justify="space-between" w="100%" gap={2}>
                  <Stat me="auto" minW="0" flex="1">
                    <StatLabel fontSize={{ base: "xs", lg: "sm" }} color="gray.600" fontWeight="bold">
                      Reports & Audit
                    </StatLabel>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="extrabold">
                      Overview
                    </StatNumber>
                  </Stat>
                  <IconBox h="34px" w="34px" bg="green.500" flexShrink={0} borderRadius="10px">
                    <Icon as={FaChartLine} h="18px" w="18px" color="white" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>
          </Grid>
        </Box>

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
                  {currentView === "categories"
                    ? "🏷️ Categories"
                    : currentView === "quotations"
                    ? "📄 Product Quotations & Requests"
                    : currentView === "bookings"
                    ? "🛒 Product Bookings Management"
                    : "🛒 Products"}
                </Heading>

              <Flex
                align="center"
                flex={{ base: "none", sm: "1" }}
                maxW={{ base: "100%", sm: "400px" }}
                minW={{ base: "0", sm: "220px" }}
                w="100%"
              >
                <IconButton
                  icon={<Icon as={FaSyncAlt} boxSize={3.5} />}
                  aria-label="Refresh Dashboard Data"
                  title="Refresh All Dashboard Data"
                  size="sm"
                  mr={2}
                  colorScheme="teal"
                  variant="outline"
                  borderColor={`${customColor}50`}
                  color={customColor}
                  _hover={{ bg: `${customColor}10`, borderColor: customColor }}
                  isLoading={isRefreshingData}
                  onClick={handleRefreshAllData}
                />
                <Input
                  placeholder={
                    currentView === "categories"
                      ? "Search categories..."
                      : currentView === "quotations"
                      ? "Search by phone, customer name, ID..."
                      : currentView === "bookings"
                      ? "Search bookings by customer, phone, product, ID..."
                      : "Search products..."
                  }
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="sm"
                  mr={2}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                  fontSize="sm"
                />
                {currentView === "products" && (
                  <Select
                    placeholder="All Categories"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    size="sm"
                    mr={2}
                    maxW="150px"
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                    fontSize="sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category || cat.name}
                      </option>
                    ))}
                  </Select>
                )}
                <Icon as={FaSearch} color="gray.400" boxSize={3} />
                {searchTerm && (
                  <Button
                    size="sm"
                    ml={2}
                    onClick={handleClearSearch}
                    bg="white"
                    color={customColor}
                    border="1px"
                    borderColor={customColor}
                    _hover={{ bg: customColor, color: "white" }}
                    fontSize="xs"
                    px={2}
                  >
                    Clear
                  </Button>
                )}
              </Flex>

              <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={() => {
                  if (currentView === "categories") {
                    setCurrentView("addCategory");
                  } else if (currentView === "quotations") {
                    setSelectedQuoteReq(null);
                    setQuotationForm({
                      unitPricePaise: 0,
                      quantity: 1,
                      installationAmountPaise: 0,
                      additionalChargesPaise: 0,
                      discountPaise: 0,
                      gstPercent: 5,
                      validFrom: "",
                      validUntil: "",
                      termsAndConditions: "Standard terms apply."
                    });
                    setIsQuotationModalOpen(true);
                  } else {
                    setSelectedCategory(null);
                    setSelectedProduct(null);
                    setNewProduct(initialProduct);
                    setVariants([]);
                    setCurrentView("addProduct");
                  }
                }}
                fontSize="xs"
                fontWeight="bold"
                borderRadius="lg"
                flexShrink={0}
                leftIcon={<FaPlusCircle />}
                size="sm"
                px={4}
                shadow="sm"
                _hover={{ bg: customColor, filter: "brightness(0.9)", shadow: "md" }}
              >
                {currentView === "categories" ? "Add Category" : currentView === "quotations" ? "Create Quotation" : "Add Product"}
              </Button>
            </Flex>
          </CardHeader>

          {/* Scrollable Table Content Area */}
          <CardBody bg="white" display="flex" flexDirection="column" p={0} overflow="hidden">
            {isLoadingData ? (
              <Flex justify="center" align="center" py={6} flex="1">
                <Spinner size="lg" color={customColor} />
                <Text ml={3} fontSize="sm">Loading data...</Text>
              </Flex>
            ) : (
              <Box display="flex" flexDirection="column" overflow="hidden">
                {/* Desktop Table View */}
                <Box display={{ base: "none", md: "block" }} overflow="auto" css={globalScrollbarStyles}>
                  {currentView === "categories" && (
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
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Description
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
                            Add Product
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
                        {currentCategories.length > 0 ? (
                          currentCategories.map((cat, idx) => (
                            <Tr
                              key={cat._id || idx}
                              bg="transparent"
                              _hover={{ bg: `${customColor}10` }}
                              borderBottom="1px"
                              borderColor={`${customColor}20`}
                            >
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                {indexOfFirstItem + idx + 1}
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Flex align="center" gap={2}>
                                  {(cat.image || cat.url) && (
                                    <Image
                                      src={cat.image || cat.url}
                                      alt={cat.category || cat.name}
                                      boxSize="24px"
                                      borderRadius="full"
                                      objectFit="cover"
                                    />
                                  )}
                                  <Text fontWeight="medium" fontSize="xs">
                                    {cat.category || cat.name}
                                  </Text>
                                </Flex>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Text noOfLines={1} maxW="200px">
                                  {cat.description || "-"}
                                </Text>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Badge
                                  bg="#dffff9ff"
                                  color="#008080"
                                  px={2}
                                  py={0.5}
                                  borderRadius="full"
                                  fontSize="2xs"
                                >
                                  Active
                                </Badge>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Button
                                  leftIcon={<FaPlus />}
                                  bg="white"
                                  color="#008080"
                                  border="1px"
                                  borderColor="#008080"
                                  _hover={{ bg: "#008080", color: "white" }}
                                  size="xs"
                                  onClick={() => handleAddProductToCategory(cat)}
                                >
                                  Add Product
                                </Button>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Flex gap={2}>
                                  <IconButton
                                    aria-label="View"
                                    icon={<FaEye />}
                                    bg="white"
                                    color="blue.500"
                                    border="1px"
                                    borderColor="blue.500"
                                    _hover={{ bg: "blue.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleViewCategory(cat)}
                                  />
                                  <IconButton
                                    aria-label="Edit"
                                    icon={<FaEdit />}
                                    bg="white"
                                    color={customColor}
                                    border="1px"
                                    borderColor={customColor}
                                    _hover={{ bg: customColor, color: "white" }}
                                    size="xs"
                                    onClick={() => handleEditCategory(cat)}
                                  />
                                  <IconButton
                                    aria-label="Delete"
                                    icon={<FaTrash />}
                                    bg="white"
                                    color="red.500"
                                    border="1px"
                                    borderColor="red.500"
                                    _hover={{ bg: "red.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleDeleteCategory(cat)}
                                  />
                                </Flex>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={6}>
                              <Text fontSize="xs">
                                {categories.length === 0
                                  ? "No categories found."
                                  : "No categories match your search."}
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  )}

                  {currentView === "quotations" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <Tabs variant="soft-rounded" colorScheme="teal">
                        <TabList mb={4} gap={2} flexWrap="wrap">
                          <Tab
                            fontWeight="bold"
                            fontSize="xs"
                            borderRadius="lg"
                            px={4}
                            py={2}
                            _selected={{ color: "white", bg: customColor, shadow: "sm" }}
                            _focus={{ boxShadow: "none" }}
                          >
                            Formal Quotations ({filteredQuotationsList.length})
                          </Tab>
                          <Tab
                            fontWeight="bold"
                            fontSize="xs"
                            borderRadius="lg"
                            px={4}
                            py={2}
                            _selected={{ color: "white", bg: customColor, shadow: "sm" }}
                            _focus={{ boxShadow: "none" }}
                          >
                            Quote Requests ({filteredQuoteRequests.length})
                          </Tab>
                        </TabList>
                        <TabPanels>
                          {/* TAB 1: FORMAL QUOTATIONS */}
                          <TabPanel p={0}>
                            <HStack spacing={2} mb={4} flexWrap="wrap">
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={quotationStatusFilter === "all" ? "teal" : "gray"}
                                variant={quotationStatusFilter === "all" ? "solid" : "outline"}
                                bg={quotationStatusFilter === "all" ? customColor : "transparent"}
                                onClick={() => setQuotationStatusFilter("all")}
                              >
                                All ({quotationsList.length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={quotationStatusFilter === "draft" ? "teal" : "gray"}
                                variant={quotationStatusFilter === "draft" ? "solid" : "outline"}
                                bg={quotationStatusFilter === "draft" ? customColor : "transparent"}
                                onClick={() => setQuotationStatusFilter("draft")}
                              >
                                Draft ({quotationsList.filter(q => (q.status || "draft") === "draft").length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={quotationStatusFilter === "waiting" ? "teal" : "gray"}
                                variant={quotationStatusFilter === "waiting" ? "solid" : "outline"}
                                bg={quotationStatusFilter === "waiting" ? customColor : "transparent"}
                                onClick={() => setQuotationStatusFilter("waiting")}
                              >
                                Customer Waiting ({quotationsList.filter(q => ["sent", "viewed", "delivered", "quotation_sent"].includes((q.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={quotationStatusFilter === "accepted" ? "teal" : "gray"}
                                variant={quotationStatusFilter === "accepted" ? "solid" : "outline"}
                                bg={quotationStatusFilter === "accepted" ? customColor : "transparent"}
                                onClick={() => setQuotationStatusFilter("accepted")}
                              >
                                Completed / Accepted ({quotationsList.filter(q => ["accepted", "converted", "completed"].includes((q.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={quotationStatusFilter === "cancelled" ? "teal" : "gray"}
                                variant={quotationStatusFilter === "cancelled" ? "solid" : "outline"}
                                bg={quotationStatusFilter === "cancelled" ? customColor : "transparent"}
                                onClick={() => setQuotationStatusFilter("cancelled")}
                              >
                                Cancelled / Expired ({quotationsList.filter(q => ["cancelled", "rejected", "superseded", "expired"].includes((q.status || "").toLowerCase())).length})
                              </Button>
                            </HStack>

                            {isLoadingQuotations ? (
                              <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                            ) : filteredQuotationsList.length === 0 ? (
                              <Center p={10} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={2}>
                                  <Icon as={FaQuoteRight} boxSize={8} color="gray.300" />
                                  <Text fontSize="sm" color="gray.500" fontWeight="medium">No admin product quotations found matching criteria.</Text>
                                </VStack>
                              </Center>
                            ) : (
                              <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflowX="auto" boxShadow="sm" w="100%">
                                <Table variant="simple" size="sm">
                                  <Thead bg={customColor}>
                                    <Tr>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Quotation ID</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Customer</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Items / Product</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Total Amount</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Valid Until</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Status</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Payment Status</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap" textAlign="right">Actions</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody bg="white">
                                    {filteredQuotationsList.map((q, qIdx) => {
                                      const qId = q._id || q.id || `QT_${qIdx}`;
                                      const displayQId = q.quotationNumber || (qId.length > 12 ? `QT-${qId.slice(-8)}` : qId);
                                      
                                      // Customer details extraction
                                      const custObj = q.customerSnapshot || (typeof q.customerId === 'object' && q.customerId ? q.customerId : {}) || {};
                                      const custName = custObj.name || q.customerName || q.clientName || (custObj.fname ? `${custObj.fname || ''} ${custObj.lname || ''}`.trim() : null) || "Customer";
                                      const custPhone = custObj.phone || custObj.mobile || q.customerPhone || q.phone || "Not Provided";
                                      const custEmail = custObj.email || q.customerEmail || "Not Provided";
                                      const rawAddr = custObj.deliveryAddress || custObj.address || q.deliveryAddress || q.address;
                                      const custAddress = typeof rawAddr === 'string' ? rawAddr : (typeof rawAddr === 'object' && rawAddr ? ([rawAddr.addressLine || rawAddr.street || rawAddr.houseNo || (typeof rawAddr.address === 'string' ? rawAddr.address : null), rawAddr.city, rawAddr.state, rawAddr.pincode || rawAddr.zipCode].filter(Boolean).join(', ') || "Standard Service Location") : "Standard Service Location");

                                      // Product details extraction
                                      const prodObj = q.productSnapshot || (typeof q.productId === 'object' && q.productId ? q.productId : {}) || {};
                                      const itemDesc = prodObj.productName || prodObj.name || q.items?.[0]?.productSnapshot?.productName || q.items?.[0]?.description || q.productName || "Product Supply";
                                      const prodCategory = prodObj.categoryName || prodObj.category || "General Product";
                                      const prodQuantity = q.quantity || 1;
                                      const prodSpec = prodObj.description || q.notes || q.adminNotes || "Standard product supply and setup";

                                      // Financial details extraction
                                      const fin = q.financialSnapshot || {};
                                      const total = (fin.totalAmountPaise ? fin.totalAmountPaise / 100 : null)
                                        ?? (fin.unitPricePaise ? (fin.unitPricePaise * prodQuantity) / 100 : null)
                                        ?? q.finalAmount
                                        ?? q.totalAmount
                                        ?? 0;
                                      const unitPrice = fin.unitPricePaise ? fin.unitPricePaise / 100 : (total / prodQuantity);
                                      const baseAmount = fin.baseAmountPaise ? fin.baseAmountPaise / 100 : (unitPrice * prodQuantity);
                                      const discountAmount = fin.discountPaise ? fin.discountPaise / 100 : 0;
                                      const taxableAmount = fin.taxableAmountPaise ? fin.taxableAmountPaise / 100 : Math.max(0, baseAmount - discountAmount);
                                      const gstPercent = fin.gstPercent ?? 5;
                                      const gstAmount = fin.gstAmountPaise ? fin.gstAmountPaise / 100 : Math.round((taxableAmount * gstPercent) / 100);

                                      // Status & Payment details extraction
                                      const status = q.status || "draft";
                                      const payStatus = (q.paymentStatus || "unpaid").toLowerCase();
                                      const payMethod = q.paymentMethod || q.paymentGroup?.paymentMethod || (payStatus === "paid" ? "Recorded Online / UPI / Cash" : "Pending Settlement");
                                      const payGroupId = q.paymentGroup?._id || q.paymentGroup || q.paymentGroupId || `PAY-${qId.slice(-8).toUpperCase()}`;
                                      const payDate = q.paidAt ? new Date(q.paidAt).toLocaleDateString() : (q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : new Date().toLocaleDateString());

                                      return (
                                        <Tr
                                          key={qId}
                                          cursor="pointer"
                                          _hover={{ bg: "teal.50/60", transform: "translateY(-1px)", shadow: "xs" }}
                                          transition="all 0.15s"
                                          onClick={() => handleOpenQuotationDetail(q)}
                                        >
                                          {/* QUOTATION ID POPOVER */}
                                          <Td py={3} px={3} whiteSpace="nowrap">
                                            <Popover trigger="hover" placement="top-start" openDelay={100}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">{displayQId}</Text>
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                                  <PopoverArrow bg="white" />
                                                  <Box>
                                                    <HStack spacing={2} mb={2}>
                                                      <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                        <Icon as={FaFileContract} boxSize={3} />
                                                      </Flex>
                                                      <Text fontSize="xs" fontWeight="bold" color="teal.900">Quotation Overview</Text>
                                                    </HStack>
                                                    <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                      <HStack justify="space-between"><Text fontWeight="bold">Quotation No:</Text><Text fontWeight="bold" color="teal.700">{displayQId}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">System ID:</Text><Text fontFamily="mono" fontSize="3xs">{qId}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Created Date:</Text><Text>{formatExpiryDate(q.createdAt || Date.now())}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Valid Until:</Text><Text color="orange.700" fontWeight="bold">{formatExpiryDate(q.validUntil)}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Lifecycle State:</Text><Badge colorScheme={status === "accepted" ? "green" : "teal"} fontSize="3xs">{status.toUpperCase()}</Badge></HStack>
                                                    </VStack>
                                                  </Box>
                                                </PopoverContent>
                                              </Portal>
                                            </Popover>
                                          </Td>

                                          {/* CUSTOMER POPOVER */}
                                          <Td py={3} px={3} whiteSpace="nowrap">
                                            <Popover trigger="hover" placement="top-start" openDelay={100}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">{custName}</Text>
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                                  <PopoverArrow bg="white" />
                                                  <Box>
                                                    <HStack spacing={2} mb={2}>
                                                      <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                        <Icon as={FaUser} boxSize={3} />
                                                      </Flex>
                                                      <Text fontSize="xs" fontWeight="bold" color="teal.900">Customer Details</Text>
                                                    </HStack>
                                                    <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                      <HStack justify="space-between"><Text fontWeight="bold">Name:</Text><Text fontWeight="semibold" color="gray.900">{custName}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Phone:</Text><Text color="teal.700" fontWeight="bold">{custPhone}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Email:</Text><Text>{custEmail}</Text></HStack>
                                                      <Box pt={1} borderTop="1px dashed" borderColor="gray.200">
                                                        <Text fontWeight="bold" color="gray.600">Delivery Address:</Text>
                                                        <Text color="gray.800" mt={0.5} noOfLines={2}>{custAddress}</Text>
                                                      </Box>
                                                    </VStack>
                                                  </Box>
                                                </PopoverContent>
                                              </Portal>
                                            </Popover>
                                          </Td>

                                          {/* PRODUCT POPOVER */}
                                          <Td py={3} px={3} maxW="200px" isTruncated>
                                            <Popover trigger="hover" placement="top-start" openDelay={100}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block" maxW="100%">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" color="gray.600" isTruncated>{itemDesc}</Text>
                                                    {prodQuantity > 1 && (
                                                      <Badge colorScheme="teal" fontSize="3xs" px={1.5} borderRadius="full">x{prodQuantity}</Badge>
                                                    )}
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} flexShrink={0} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="310px" zIndex={99999}>
                                                  <PopoverArrow bg="white" />
                                                  <Box>
                                                    <HStack spacing={2} mb={2}>
                                                      <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                        <Icon as={FaBox} boxSize={3} />
                                                      </Flex>
                                                      <Text fontSize="xs" fontWeight="bold" color="teal.900">Product & Order Specifications</Text>
                                                    </HStack>
                                                    <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                      <HStack justify="space-between"><Text fontWeight="bold">Product Name:</Text><Text fontWeight="semibold" color="gray.900">{itemDesc}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Quantity:</Text><Text fontWeight="bold" color="teal.700">{prodQuantity} Unit(s)</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Category:</Text><Text>{prodCategory}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Unit Price:</Text><Text fontWeight="semibold">INR {Number(unitPrice).toLocaleString("en-IN")}</Text></HStack>
                                                      <Box bg="teal.50" p={2} borderRadius="8px" border="1px solid" borderColor="teal.200">
                                                        <Text color="teal.900" fontWeight="bold" fontSize="3xs" mb={0.5}>Notes / Specification:</Text>
                                                        <Text color="gray.800" fontSize="2xs" fontStyle="italic" whiteSpace="pre-wrap">{prodSpec}</Text>
                                                      </Box>
                                                    </VStack>
                                                  </Box>
                                                </PopoverContent>
                                              </Portal>
                                            </Popover>
                                          </Td>

                                          {/* TOTAL AMOUNT POPOVER */}
                                          <Td py={3} px={3} whiteSpace="nowrap">
                                            <Popover trigger="hover" placement="top-start" openDelay={100}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" fontWeight="bold" color="teal.700">INR {Number(total).toLocaleString("en-IN")}</Text>
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                                  <PopoverArrow bg="white" />
                                                  <Box>
                                                    <HStack spacing={2} mb={2}>
                                                      <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                        <Icon as={FaReceipt} boxSize={3} />
                                                      </Flex>
                                                      <Text fontSize="xs" fontWeight="bold" color="teal.900">Quotation Financial Breakdown</Text>
                                                    </HStack>
                                                    <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                      <HStack justify="space-between"><Text fontWeight="bold">Base Subtotal:</Text><Text>INR {Number(baseAmount).toLocaleString("en-IN")}</Text></HStack>
                                                      {discountAmount > 0 && (
                                                        <HStack justify="space-between" color="green.600"><Text fontWeight="bold">Discount:</Text><Text>- INR {Number(discountAmount).toLocaleString("en-IN")}</Text></HStack>
                                                      )}
                                                      <HStack justify="space-between"><Text fontWeight="bold">Taxable Amount:</Text><Text>INR {Number(taxableAmount).toLocaleString("en-IN")}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">GST ({gstPercent}%):</Text><Text>+ INR {Number(gstAmount).toLocaleString("en-IN")}</Text></HStack>
                                                      <Divider my={1} />
                                                      <HStack justify="space-between" fontSize="xs"><Text fontWeight="extrabold" color="teal.900">Grand Total:</Text><Text fontWeight="extrabold" color="teal.700">INR {Number(total).toLocaleString("en-IN")}</Text></HStack>
                                                    </VStack>
                                                  </Box>
                                                </PopoverContent>
                                              </Portal>
                                            </Popover>
                                          </Td>

                                          {/* VALID UNTIL WITH EXPIRY BADGE & TOOLTIP */}
                                          <Td py={3} px={3} whiteSpace="nowrap">
                                            {(() => {
                                              const expiryInfo = getExpiryInfo(q.validUntil, status);
                                              return (
                                                <Tooltip label={expiryInfo.label}>
                                                  <Badge
                                                    px={2.5}
                                                    py={1}
                                                    borderRadius="full"
                                                    fontSize="2xs"
                                                    fontWeight="bold"
                                                    colorScheme={expiryInfo.color}
                                                  >
                                                    {formatExpiryDate(q.validUntil)}
                                                  </Badge>
                                                </Tooltip>
                                              );
                                            })()}
                                          </Td>

                                          <Td py={3} px={3} whiteSpace="nowrap">
                                            {status === "rejected" ? (
                                              <Popover trigger="hover" placement="top" openDelay={100}>
                                                <PopoverTrigger>
                                                  <Box display="inline-block" cursor="pointer">
                                                    <Badge
                                                      px={2.5}
                                                      py={1}
                                                      borderRadius="full"
                                                      fontSize="2xs"
                                                      fontWeight="extrabold"
                                                      textTransform="uppercase"
                                                      colorScheme="red"
                                                      display="inline-flex"
                                                      alignItems="center"
                                                      gap="4px"
                                                      shadow="xs"
                                                    >
                                                      <Icon as={FaBan} boxSize={2.5} />
                                                      REJECTED
                                                    </Badge>
                                                    {q.rejectedReason && (
                                                      <Text fontSize="3xs" color="red.600" fontWeight="bold" maxW="130px" isTruncated mt="2px">
                                                        "{q.rejectedReason}"
                                                      </Text>
                                                    )}
                                                  </Box>
                                                </PopoverTrigger>
                                                <Portal>
                                                  <PopoverContent bg="white" borderColor="red.300" shadow="2xl" borderRadius="14px" p={3.5} w="310px" zIndex={99999}>
                                                    <PopoverArrow bg="white" />
                                                    <Box>
                                                      <HStack spacing={2} mb={2}>
                                                        <Flex boxSize="24px" bg="red.100" color="red.700" borderRadius="6px" align="center" justify="center">
                                                          <Icon as={FaBan} boxSize={3} />
                                                        </Flex>
                                                        <Text fontSize="xs" fontWeight="extrabold" color="red.900">
                                                          Customer Rejection Feedback
                                                        </Text>
                                                      </HStack>
                                                      <Box bg="red.50" p={2.5} borderRadius="8px" border="1px solid" borderColor="red.200" mb={2}>
                                                        <Text fontSize="3xs" color="red.700" fontWeight="bold" textTransform="uppercase">
                                                          Rejection Reason:
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.900" fontWeight="bold" mt={1}>
                                                          {q.rejectedReason || "Price exceeds budget / Rejected by customer"}
                                                        </Text>
                                                      </Box>
                                                      {q.rejectedAt && (
                                                        <Text fontSize="3xs" color="gray.500" mb={1.5}>
                                                          Date Rejected: {formatExpiryDate(q.rejectedAt)}
                                                        </Text>
                                                      )}
                                                      <Text fontSize="3xs" color="teal.700" fontWeight="medium">
                                                        💡 Tip: Click "Revise" to send a revised quote revision with updated pricing.
                                                      </Text>
                                                    </Box>
                                                  </PopoverContent>
                                                </Portal>
                                              </Popover>
                                            ) : (
                                              <Badge
                                                px={2.5}
                                                py={1}
                                                borderRadius="full"
                                                fontSize="2xs"
                                                fontWeight="bold"
                                                textTransform="uppercase"
                                                colorScheme={status === "sent" || status === "accepted" ? "green" : "orange"}
                                              >
                                                {status}
                                              </Badge>
                                            )}
                                          </Td>

                                          {/* PAYMENT STATUS POPOVER */}
                                          <Td py={3} px={3} whiteSpace="nowrap">
                                            <Popover trigger="hover" placement="top-end" openDelay={100}>
                                              <PopoverTrigger>
                                                <Badge
                                                  cursor="pointer"
                                                  px={2.5}
                                                  py={1}
                                                  borderRadius="full"
                                                  fontSize="2xs"
                                                  fontWeight="extrabold"
                                                  textTransform="uppercase"
                                                  colorScheme={payStatus === "paid" ? "green" : "red"}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePaymentStatus(qId, payStatus);
                                                  }}
                                                  _hover={{ opacity: 0.85, transform: "scale(1.05)" }}
                                                  transition="all 0.15s"
                                                >
                                                  {payStatus === "paid" ? "✓ PAID" : "✕ UNPAID"}
                                                </Badge>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor={payStatus === "paid" ? "green.300" : "red.300"} shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                                  <PopoverArrow bg="white" />
                                                  <Box>
                                                    <HStack spacing={2} mb={2}>
                                                      <Flex boxSize="24px" bg={payStatus === "paid" ? "green.100" : "red.100"} color={payStatus === "paid" ? "green.700" : "red.700"} borderRadius="6px" align="center" justify="center">
                                                        <Icon as={FaCreditCard} boxSize={3} />
                                                      </Flex>
                                                      <Text fontSize="xs" fontWeight="bold" color={payStatus === "paid" ? "green.900" : "red.900"}>
                                                        Payment & Settlement Record
                                                      </Text>
                                                    </HStack>
                                                    <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                      <HStack justify="space-between">
                                                        <Text fontWeight="bold">Payment Status:</Text>
                                                        <Badge colorScheme={payStatus === "paid" ? "green" : "red"} fontSize="3xs" px={2} borderRadius="full">
                                                          {payStatus === "paid" ? "✓ PAID & SETTLED" : "✕ UNPAID / PENDING"}
                                                        </Badge>
                                                      </HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Total Amount:</Text><Text fontWeight="extrabold" color="teal.700">INR {Number(total).toLocaleString("en-IN")}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Payment Method:</Text><Text fontWeight="semibold">{payMethod}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Reference ID:</Text><Text fontFamily="mono" fontSize="3xs">{payGroupId}</Text></HStack>
                                                      <HStack justify="space-between"><Text fontWeight="bold">Date Recorded:</Text><Text>{payDate}</Text></HStack>
                                                      <Box pt={1.5} borderTop="1px dashed" borderColor="gray.200" textAlign="center">
                                                        <Text color="gray.500" fontSize="3xs" fontStyle="italic" lineHeight="tight">
                                                          💡 Click status badge to toggle status (PAID / UNPAID)
                                                        </Text>
                                                      </Box>
                                                    </VStack>
                                                  </Box>
                                                </PopoverContent>
                                              </Portal>
                                            </Popover>
                                          </Td>
                                          <Td py={3} px={3} whiteSpace="nowrap" textAlign="right">
                                            <HStack spacing={1.5} justify="flex-end">
                                              {status === "draft" && (
                                                <Button
                                                  size="xs"
                                                  colorScheme="teal"
                                                  bg={customColor}
                                                  _hover={{ bg: customColor, filter: "brightness(0.9)" }}
                                                  leftIcon={<FaPaperPlane />}
                                                  borderRadius="md"
                                                  px={2.5}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSendQuotation(qId, q);
                                                  }}
                                                >
                                                  Send
                                                </Button>
                                              )}
                                              {["sent", "viewed", "delivered", "quotation_sent"].includes(status) && (
                                                <Button
                                                  size="xs"
                                                  variant="outline"
                                                  colorScheme="blue"
                                                  leftIcon={<FaRedo />}
                                                  borderRadius="md"
                                                  px={2.5}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResendQuotation(qId, q);
                                                  }}
                                                >
                                                  Resend
                                                </Button>
                                              )}
                                              {["sent", "viewed", "delivered", "quotation_sent", "rejected"].includes(status) && (
                                                <Button
                                                  size="xs"
                                                  variant="outline"
                                                  colorScheme="orange"
                                                  borderRadius="md"
                                                  px={2.5}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenReviseModal(q);
                                                  }}
                                                >
                                                  Revise
                                                </Button>
                                              )}
                                              {(() => {
                                                const isProtectedQuotation = ["accepted", "converted"].includes((q.status || "").toLowerCase());
                                                return (
                                                  <Tooltip label={isProtectedQuotation ? "Accepted quotation cannot be deleted (Audit Trail Safeguard)" : "Delete Quotation"}>
                                                    <IconButton
                                                      icon={<FaTrash />}
                                                      aria-label="Delete Quotation"
                                                      size="xs"
                                                      colorScheme="red"
                                                      variant="ghost"
                                                      borderRadius="md"
                                                      isDisabled={isProtectedQuotation}
                                                      opacity={isProtectedQuotation ? 0.35 : 1}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteQuotation(qId, q);
                                                      }}
                                                    />
                                                  </Tooltip>
                                                );
                                              })()}
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

                          {/* TAB 2: QUOTE REQUESTS */}
                          <TabPanel p={0}>
                            <HStack spacing={2} mb={4} flexWrap="wrap">
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "active" ? "teal" : "gray"}
                                variant={requestStatusFilter === "active" ? "solid" : "outline"}
                                bg={requestStatusFilter === "active" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("active")}
                              >
                                New / Active ({quoteRequests.filter(r => ["quote_requested", "under_review", "quotation_prepared", "quotation_sent", "viewed"].includes((r.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "accepted" ? "teal" : "gray"}
                                variant={requestStatusFilter === "accepted" ? "solid" : "outline"}
                                bg={requestStatusFilter === "accepted" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("accepted")}
                              >
                                Completed / Accepted ({quoteRequests.filter(r => ["accepted", "converted", "completed"].includes((r.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "cancelled" ? "teal" : "gray"}
                                variant={requestStatusFilter === "cancelled" ? "solid" : "outline"}
                                bg={requestStatusFilter === "cancelled" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("cancelled")}
                              >
                                Cancelled / Expired ({quoteRequests.filter(r => ["cancelled", "rejected", "expired"].includes((r.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "all" ? "teal" : "gray"}
                                variant={requestStatusFilter === "all" ? "solid" : "outline"}
                                bg={requestStatusFilter === "all" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("all")}
                              >
                                All ({quoteRequests.length})
                              </Button>
                            </HStack>
                            {isLoadingQuotations ? (
                              <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                            ) : filteredQuoteRequests.length === 0 ? (
                              <Center p={10} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={2}>
                                  <Icon as={FaFileContract} boxSize={8} color="gray.300" />
                                  <Text fontSize="sm" color="gray.500" fontWeight="medium">No customer quote requests found matching search.</Text>
                                </VStack>
                              </Center>
                            ) : (
                              <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflowX="auto" boxShadow="sm" w="100%">
                                <Table variant="simple" size="sm">
                                  <Thead bg={customColor}>
                                    <Tr>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Request ID</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Customer Name</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Contact Phone</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Requested Product</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Status</Th>
                                      <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap" textAlign="right">Actions</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody bg="white">
                                    {filteredQuoteRequests.map((req, rIdx) => {
                                      const reqId = req._id || req.id || `REQ_${rIdx}`;
                                      const displayReqId = req.requestNumber || (req._id ? `REQ-${req._id.slice(-6)}` : `REQ_${rIdx}`);
                                      const cust = getQuoteCustomerDetails(req);
                                      const prod = getQuoteProductDetails(req);
                                      const status = (req.status || "quote_requested").toLowerCase();
                                      const canCreateQuotation = ["quote_requested", "under_review"].includes(status);
                                      return (
                                        <Tr key={reqId} _hover={{ bg: "teal.50/30" }} transition="all 0.15s">
                                          <Td fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">{displayReqId}</Td>
                                          <Td>
                                            <Popover trigger="hover" placement="top" openDelay={150}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">{cust.name}</Text>
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.600" opacity={0.8} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                                <PopoverArrow bg="white" />
                                                <Box>
                                                  <HStack spacing={2} mb={2}>
                                                    <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                      <Icon as={FaUser} boxSize={3} />
                                                    </Flex>
                                                    <Text fontSize="xs" fontWeight="bold" color="teal.900">Customer Details</Text>
                                                  </HStack>
                                                  <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                    <HStack justify="space-between"><Text fontWeight="bold">Name:</Text><Text fontWeight="semibold" color="gray.900">{cust.name}</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Phone:</Text><Text color="teal.700" fontWeight="bold">{cust.phone}</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Email:</Text><Text>{cust.email}</Text></HStack>
                                                    <Box pt={1} borderTop="1px dashed" borderColor="gray.200">
                                                      <Text fontWeight="bold" color="gray.600">Location / Delivery Address:</Text>
                                                      <Text color="gray.800" mt={0.5} noOfLines={2}>{cust.address}</Text>
                                                    </Box>
                                                  </VStack>
                                                </Box>
                                              </PopoverContent>
                                            </Portal>
                                            </Popover>
                                          </Td>
                                          <Td fontSize="xs" color="gray.600">{cust.phone}</Td>
                                          <Td>
                                            <Popover trigger="hover" placement="top" openDelay={150}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" fontWeight="medium" color="gray.700">{prod.name}</Text>
                                                    {prod.quantity > 1 && (
                                                      <Badge colorScheme="teal" fontSize="3xs" px={1.5} borderRadius="full">x{prod.quantity}</Badge>
                                                    )}
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                              <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="310px" zIndex={99999}>
                                                <PopoverArrow bg="white" />
                                                <Box>
                                                  <HStack spacing={2} mb={2}>
                                                    <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                      <Icon as={FaBox} boxSize={3} />
                                                    </Flex>
                                                    <Text fontSize="xs" fontWeight="bold" color="teal.900">Product & Purpose Details</Text>
                                                  </HStack>
                                                  <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                    <HStack justify="space-between"><Text fontWeight="bold">Product Name:</Text><Text fontWeight="semibold" color="gray.900">{prod.name}</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Quantity Required:</Text><Text fontWeight="bold" color="teal.700">{prod.quantity} Unit(s)</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Category / Brand:</Text><Text>{prod.category} / {prod.brand}</Text></HStack>
                                                    <Box bg="teal.50" p={2} borderRadius="8px" border="1px solid" borderColor="teal.200">
                                                      <Text color="teal.900" fontWeight="bold" fontSize="3xs" mb={0.5}>Customer Purpose / Additional Notes:</Text>
                                                      <Text color="gray.800" fontSize="2xs" fontStyle="italic" whiteSpace="pre-wrap">{prod.specText}</Text>
                                                    </Box>
                                                  </VStack>
                                                </Box>
                                              </PopoverContent>
                                            </Portal>
                                             </Popover>
                                          </Td>
                                          <Td>
                                            <Badge
                                              px={2.5}
                                              py={1}
                                              borderRadius="full"
                                              fontSize="2xs"
                                              fontWeight="extrabold"
                                              textTransform="uppercase"
                                              colorScheme={
                                                ["quote_requested", "under_review"].includes(status) ? "red" :
                                                status === "quoted" || status === "approved" || status === "accepted" || status === "quotation_sent" ? "green" :
                                                status === "rejected" || status === "cancelled" ? "red" : "orange"
                                              }
                                              display="inline-flex"
                                              alignItems="center"
                                              gap={1}
                                              shadow="xs"
                                            >
                                              {["quote_requested", "under_review"].includes(status) && <Icon as={FaEnvelope} boxSize="9px" />}
                                              {status === "quote_requested" ? "NEW REQUEST" : (req.status || "quote_requested").replace(/_/g, " ")}
                                            </Badge>
                                          </Td>
                                          <Td>
                                            <Flex align="center" gap={2} flexWrap="nowrap">
                                              <IconButton
                                                icon={<FaEye />}
                                                aria-label="View Full Details"
                                                title="View Full Request Details"
                                                size="xs"
                                                colorScheme="teal"
                                                variant="ghost"
                                                borderRadius="lg"
                                                onClick={() => {
                                                  setSelectedReqDetail(req);
                                                  setIsReqDetailModalOpen(true);
                                                }}
                                              />
                                              {canCreateQuotation && (
                                                <Button
                                                  size="xs"
                                                  colorScheme="teal"
                                                  bg={customColor}
                                                  _hover={{ bg: customColor, filter: "brightness(0.9)", shadow: "sm" }}
                                                  leftIcon={<FaFileContract />}
                                                  borderRadius="lg"
                                                  px={3}
                                                  py={1.5}
                                                  fontWeight="semibold"
                                                  whiteSpace="nowrap"
                                                  onClick={() => handleOpenQuotationForRequest(req)}
                                                >
                                                  Create Quotation
                                                </Button>
                                              )}
                                              {(() => {
                                                const isProtectedReq = ["accepted", "quotation_sent", "viewed"].includes((req.status || "").toLowerCase());
                                                return (
                                                  <Tooltip label={isProtectedReq ? "Quote request with active quotation/order cannot be deleted" : "Delete Request"}>
                                                    <IconButton
                                                      icon={<FaTrash />}
                                                      aria-label="Delete Request"
                                                      size="xs"
                                                      colorScheme="red"
                                                      variant="ghost"
                                                      borderRadius="lg"
                                                      isDisabled={isProtectedReq}
                                                      opacity={isProtectedReq ? 0.35 : 1}
                                                      onClick={() => handleDeleteQuoteRequest(reqId, req)}
                                                    />
                                                  </Tooltip>
                                                );
                                              })()}
                                            </Flex>
                                          </Td>
                                        </Tr>
                                      );
                                    })}
                                  </Tbody>
                                </Table>
                              </Box>
                            )}
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Box>
                  )}

                  {currentView === "products" && (
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
                            Product
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
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Price Range
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
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentProducts.length > 0 ? (
                          currentProducts.map((prod, idx) => {
                            // Get category name
                            const getCategoryName = () => {
                              const categoryData = prod.categoryId || prod.category;
                              const isObject = typeof categoryData === 'object' && categoryData !== null;
                              const catId = isObject ? categoryData._id : categoryData;
                              const catObj = categories.find(c => c._id === catId) || (isObject ? categoryData : null);
                              return catObj?.category || catObj?.name || "N/A";
                            };

                            const priceRange = prod.estimatedPriceFrom && prod.estimatedPriceTo ?
                              `₹${prod.estimatedPriceFrom} - ₹${prod.estimatedPriceTo}` :
                              (prod.variants?.length > 0 ?
                                `₹${Math.min(...prod.variants.map(v => v.price || 0))} - ₹${Math.max(...prod.variants.map(v => v.price || 0))}` :
                                (prod.price ? `₹${prod.price}` : "N/A"));

                            return (
                              <Tr
                                key={prod._id || idx}
                                bg="transparent"
                                _hover={{ bg: `${customColor}10` }}
                                borderBottom="1px"
                                borderColor={`${customColor}20`}
                              >
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  {indexOfFirstItem + idx + 1}
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} verticalAlign="middle">
                                  <Popover trigger="hover" placement="top-start" openDelay={100} isLazy>
                                    <PopoverTrigger>
                                      <Flex align="center" gap={2} cursor="pointer">
                                        <Avatar
                                          size="xs"
                                          name={prod.name}
                                          src={prod.images?.[0]?.url || prod.images?.[0] || prod.productImages?.[0]?.url}
                                        />
                                        <Text fontWeight="medium" fontSize="xs" noOfLines={1} textDecoration="underline" textDecorationColor="teal.300">
                                          {prod.name}
                                        </Text>
                                        <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                      </Flex>
                                    </PopoverTrigger>
                                    <Portal>
                                      <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="300px" zIndex={99999}>
                                        <PopoverArrow bg="white" />
                                        <Box>
                                          <HStack spacing={2} mb={2}>
                                            <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                              <Icon as={FaBox} boxSize={3} />
                                            </Flex>
                                            <Text fontSize="xs" fontWeight="bold" color="teal.900">📦 Catalog Product Overview</Text>
                                          </HStack>
                                          {(prod.images?.[0]?.url || prod.images?.[0] || prod.productImages?.[0]?.url) && (
                                            <Image
                                              src={prod.images?.[0]?.url || prod.images?.[0] || prod.productImages?.[0]?.url}
                                              alt={prod.name}
                                              maxH="100px"
                                              w="100%"
                                              objectFit="cover"
                                              borderRadius="md"
                                              mb={2}
                                            />
                                          )}
                                          <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                            <HStack justify="space-between"><Text fontWeight="bold">Product Name:</Text><Text fontWeight="semibold" color="gray.900">{prod.name}</Text></HStack>
                                            <HStack justify="space-between"><Text fontWeight="bold">Category:</Text><Badge colorScheme="teal" fontSize="3xs">{getCategoryName()}</Badge></HStack>
                                            <HStack justify="space-between"><Text fontWeight="bold">Price Range:</Text><Text fontWeight="bold" color="teal.700">{priceRange}</Text></HStack>
                                            <HStack justify="space-between"><Text fontWeight="bold">Pricing Model:</Text><Text>{(prod.pricingModel || 'fixed').toUpperCase()}</Text></HStack>
                                            <HStack justify="space-between"><Text fontWeight="bold">Status:</Text><Badge colorScheme={prod.status === "Available" ? "green" : "orange"} fontSize="3xs">{prod.status || "Available"}</Badge></HStack>
                                            {prod.description && (
                                              <Box bg="teal.50" p={2} borderRadius="6px" border="1px solid" borderColor="teal.100">
                                                <Text color="teal.900" fontWeight="bold" fontSize="3xs" mb={0.5}>Description:</Text>
                                                <Text color="gray.700" fontSize="3xs" noOfLines={3}>{prod.description}</Text>
                                              </Box>
                                            )}
                                          </VStack>
                                        </Box>
                                      </PopoverContent>
                                    </Portal>
                                  </Popover>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Badge
                                    bg={`${customColor}10`}
                                    color={customColor}
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                    fontSize="2xs"
                                  >
                                    {getCategoryName()}
                                  </Badge>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="medium">
                                  {priceRange}
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Badge
                                    colorScheme={
                                      prod.status === "Available" ? "green" :
                                        prod.status === "Out of Stock" ? "orange" : "red"
                                    }
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    fontSize="2xs"
                                  >
                                    {prod.status || "Available"}
                                  </Badge>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Flex gap={2}>
                                    <IconButton
                                      aria-label="View"
                                      icon={<FaEye />}
                                      bg="white"
                                      color="blue.500"
                                      border="1px"
                                      borderColor="blue.500"
                                      _hover={{ bg: "blue.500", color: "white" }}
                                      size="xs"
                                      onClick={() => handleViewProduct(prod)}
                                    />
                                    <IconButton
                                      aria-label="Edit"
                                      icon={<FaEdit />}
                                      bg="white"
                                      color={customColor}
                                      border="1px"
                                      borderColor={customColor}
                                      _hover={{ bg: customColor, color: "white" }}
                                      size="xs"
                                      onClick={() => handleEditProduct(prod)}
                                    />
                                    <IconButton
                                      aria-label="Delete"
                                      icon={<FaTrash />}
                                      bg="white"
                                      color="red.500"
                                      border="1px"
                                      borderColor="red.500"
                                      _hover={{ bg: "red.500", color: "white" }}
                                      size="xs"
                                      onClick={() => handleDeleteProduct(prod)}
                                    />
                                  </Flex>
                                </Td>
                              </Tr>
                            );
                          })
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={6}>
                              <Text fontSize="xs">
                                {products.length === 0
                                  ? "No products found."
                                  : "No products match your search."}
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  )}

                  {currentView === "bookings" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <HStack spacing={2} mb={4} flexWrap="wrap">
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={bookingStatusFilter === "all" ? "teal" : "gray"}
                          variant={bookingStatusFilter === "all" ? "solid" : "outline"}
                          bg={bookingStatusFilter === "all" ? customColor : "transparent"}
                          onClick={() => setBookingStatusFilter("all")}
                        >
                          All Bookings ({allBookingsList.length})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={bookingStatusFilter === "active" ? "teal" : "gray"}
                          variant={bookingStatusFilter === "active" ? "solid" : "outline"}
                          bg={bookingStatusFilter === "active" ? customColor : "transparent"}
                          onClick={() => setBookingStatusFilter("active")}
                        >
                          Accepted / Active ({acceptedBookingsCount})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={bookingStatusFilter === "completed" ? "teal" : "gray"}
                          variant={bookingStatusFilter === "completed" ? "solid" : "outline"}
                          bg={bookingStatusFilter === "completed" ? customColor : "transparent"}
                          onClick={() => setBookingStatusFilter("completed")}
                        >
                          Completed ({completedBookingsCount})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={bookingStatusFilter === "paid" ? "teal" : "gray"}
                          variant={bookingStatusFilter === "paid" ? "solid" : "outline"}
                          bg={bookingStatusFilter === "paid" ? customColor : "transparent"}
                          onClick={() => setBookingStatusFilter("paid")}
                        >
                          Paid ({paidBookingsCount})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={bookingStatusFilter === "unpaid" ? "teal" : "gray"}
                          variant={bookingStatusFilter === "unpaid" ? "solid" : "outline"}
                          bg={bookingStatusFilter === "unpaid" ? customColor : "transparent"}
                          onClick={() => setBookingStatusFilter("unpaid")}
                        >
                          Unpaid ({allBookingsList.length - paidBookingsCount})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={bookingStatusFilter === "cancelled" ? "teal" : "gray"}
                          variant={bookingStatusFilter === "cancelled" ? "solid" : "outline"}
                          bg={bookingStatusFilter === "cancelled" ? customColor : "transparent"}
                          onClick={() => setBookingStatusFilter("cancelled")}
                        >
                          Cancelled ({allBookingsList.filter(b => (b.status || "").toLowerCase() === "cancelled").length})
                        </Button>
                      </HStack>

                      {bookingsLoading ? (
                        <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                      ) : filteredBookings.length === 0 ? (
                        <Center p={10} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                          <VStack spacing={2}>
                            <Icon as={FaClipboardCheck} boxSize={8} color="gray.300" />
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">No product bookings found matching criteria.</Text>
                          </VStack>
                        </Center>
                      ) : (
                        <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflowX="auto" boxShadow="sm" w="100%">
                          <Table variant="simple" size="sm">
                            <Thead bg={customColor}>
                              <Tr>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Booking ID</Th>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Customer</Th>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Product</Th>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Amount</Th>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Status</Th>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Payment</Th>
                                <Th color="white" py={3} px={3} fontSize="xs" fontWeight="bold" whiteSpace="nowrap" textAlign="right">Actions</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg="white">
                              {currentBookings.map((b, bIdx) => {
                                const bId = b._id || b.id || `BK_${bIdx}`;
                                const displayBId = b.bookingNumber || (bId.length > 10 ? `BK-${bId.slice(-8).toUpperCase()}` : bId);

                                const custObj = b.customerSnapshot || (typeof b.customerId === 'object' && b.customerId ? b.customerId : {}) || {};
                                const custName = custObj.name || (custObj.fname ? `${custObj.fname || ''} ${custObj.lname || ''}`.trim() : null) || b.customerName || "Customer";
                                const custPhone = custObj.mobileNumber || custObj.phone || b.phone || "Not Provided";
                                const custEmail = custObj.email || b.email || "Not Provided";
                                const addrObj = b.addressSnapshot || custObj.address || b.address;
                                const custAddress = typeof addrObj === 'string' ? addrObj : (typeof addrObj === 'object' && addrObj ? ([addrObj.addressLine || addrObj.street, addrObj.city, addrObj.state, addrObj.pincode].filter(Boolean).join(', ') || "Customer Address") : "Customer Address");

                                const prodObj = b.productSnapshot || (typeof b.productId === 'object' && b.productId ? b.productId : {}) || {};
                                const prodName = prodObj.productName || prodObj.name || b.productName || "Product Item";
                                const prodImg = prodObj.images?.[0]?.url || prodObj.images?.[0] || prodObj.productImages?.[0]?.url || prodObj.image;
                                const quantity = b.quantity || 1;
                                const prodCategory = prodObj.categoryName || prodObj.category || "Hardware";
                                const prodDesc = prodObj.description || b.notes || "Product Order";

                                const fin = b.financialSnapshot || {};
                                const totalAmount = (fin.totalAmountPaise ? fin.totalAmountPaise / 100 : null)
                                  ?? b.amount
                                  ?? b.finalAmount
                                  ?? 0;
                                const baseAmount = fin.baseAmountPaise ? fin.baseAmountPaise / 100 : totalAmount;
                                const gstAmount = fin.gstAmountPaise ? fin.gstAmountPaise / 100 : 0;

                                const status = (b.status || "active").toLowerCase();
                                const payStatus = (b.paymentStatus || "pending").toLowerCase();

                                return (
                                  <Tr key={bId} _hover={{ bg: "teal.50/30" }} transition="all 0.15s">
                                    {/* BOOKING ID POPOVER */}
                                    <Td py={3} px={3} whiteSpace="nowrap" verticalAlign="middle">
                                      <Popover trigger="hover" placement="top-start" openDelay={100} isLazy>
                                        <PopoverTrigger>
                                          <Box cursor="pointer" display="inline-block">
                                            <HStack spacing={1}>
                                              <Text fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">{displayBId}</Text>
                                              <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                            </HStack>
                                          </Box>
                                        </PopoverTrigger>
                                        <Portal>
                                          <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                            <PopoverArrow bg="white" />
                                            <Box>
                                              <HStack spacing={2} mb={2}>
                                                <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                  <Icon as={FaReceipt} boxSize={3} />
                                                </Flex>
                                                <Text fontSize="xs" fontWeight="bold" color="teal.900">Order & Payment Overview</Text>
                                              </HStack>
                                              <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                <HStack justify="space-between"><Text fontWeight="bold">Booking ID:</Text><Text fontWeight="bold" color="teal.700">{displayBId}</Text></HStack>
                                                <HStack justify="space-between"><Text fontWeight="bold">Created Date:</Text><Text>{new Date(b.createdAt || Date.now()).toLocaleDateString()}</Text></HStack>
                                                <HStack justify="space-between">
                                                  <Text fontWeight="bold">Order Status:</Text>
                                                  <Badge colorScheme={status === "completed" ? "green" : status === "active" ? "blue" : "red"} fontSize="3xs">
                                                    {status.toUpperCase()}
                                                  </Badge>
                                                </HStack>
                                                <HStack justify="space-between">
                                                  <Text fontWeight="bold">Payment Status:</Text>
                                                  <Badge colorScheme={payStatus === "paid" ? "green" : "red"} fontSize="3xs">
                                                    {payStatus.toUpperCase()}
                                                  </Badge>
                                                </HStack>
                                                <Divider my={1} />
                                                <HStack justify="space-between"><Text fontWeight="bold">Subtotal Amount:</Text><Text>INR {Number(baseAmount).toLocaleString("en-IN")}</Text></HStack>
                                                {gstAmount > 0 && (
                                                  <HStack justify="space-between"><Text fontWeight="bold">GST Amount:</Text><Text>+ INR {Number(gstAmount).toLocaleString("en-IN")}</Text></HStack>
                                                )}
                                                <HStack justify="space-between" fontSize="xs"><Text fontWeight="extrabold" color="teal.900">Total Payable:</Text><Text fontWeight="extrabold" color="teal.700">INR {Number(totalAmount).toLocaleString("en-IN")}</Text></HStack>
                                              </VStack>
                                            </Box>
                                          </PopoverContent>
                                        </Portal>
                                      </Popover>
                                    </Td>

                                    {/* CUSTOMER DETAILS POPOVER */}
                                    <Td py={3} px={3} whiteSpace="nowrap" verticalAlign="middle">
                                      <Popover trigger="hover" placement="top-start" openDelay={100} isLazy>
                                        <PopoverTrigger>
                                          <Box cursor="pointer" display="inline-block">
                                            <HStack spacing={1}>
                                              <Text fontSize="xs" fontWeight="semibold" color="gray.800" textDecoration="underline" textDecorationColor="teal.300">{custName}</Text>
                                              <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                            </HStack>
                                          </Box>
                                        </PopoverTrigger>
                                        <Portal>
                                          <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                            <PopoverArrow bg="white" />
                                            <Box>
                                              <HStack spacing={2} mb={2}>
                                                <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                  <Icon as={FaUser} boxSize={3} />
                                                </Flex>
                                                <Text fontSize="xs" fontWeight="bold" color="teal.900">Customer Details</Text>
                                              </HStack>
                                              <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                <HStack justify="space-between"><Text fontWeight="bold">Name:</Text><Text fontWeight="semibold" color="gray.900">{custName}</Text></HStack>
                                                <HStack justify="space-between"><Text fontWeight="bold">Phone:</Text><Text color="teal.700" fontWeight="bold">{custPhone}</Text></HStack>
                                                <HStack justify="space-between"><Text fontWeight="bold">Email:</Text><Text>{custEmail}</Text></HStack>
                                                <Box pt={1} borderTop="1px dashed" borderColor="gray.200">
                                                  <Text fontWeight="bold" color="gray.600">Delivery Address:</Text>
                                                  <Text color="gray.800" mt={0.5} noOfLines={2}>{custAddress}</Text>
                                                </Box>
                                              </VStack>
                                            </Box>
                                          </PopoverContent>
                                        </Portal>
                                      </Popover>
                                      </Td>

                                    {/* PRODUCT DETAILS POPOVER */}
                                    <Td py={3} px={3} maxW="200px" verticalAlign="middle">
                                      <Popover trigger="hover" placement="top-start" openDelay={100} isLazy>
                                        <PopoverTrigger>
                                          <Box cursor="pointer" display="inline-block" maxW="100%">
                                            <HStack spacing={1}>
                                              <Text fontSize="xs" color="gray.800" fontWeight="medium" noOfLines={1}>{prodName}</Text>
                                              <Badge colorScheme="teal" fontSize="3xs" px={1.5} borderRadius="full">x{quantity}</Badge>
                                              <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} flexShrink={0} />
                                            </HStack>
                                          </Box>
                                        </PopoverTrigger>
                                        <Portal>
                                          <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="300px" zIndex={99999}>
                                            <PopoverArrow bg="white" />
                                            <Box>
                                              <HStack spacing={2} mb={2}>
                                                <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                  <Icon as={FaBox} boxSize={3} />
                                                </Flex>
                                                <Text fontSize="xs" fontWeight="bold" color="teal.900">Product Specifications</Text>
                                              </HStack>
                                              {prodImg && (
                                                <Image src={prodImg} alt={prodName} maxH="90px" w="100%" objectFit="cover" borderRadius="md" mb={2} />
                                              )}
                                              <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                <HStack justify="space-between"><Text fontWeight="bold">Product Name:</Text><Text fontWeight="semibold" color="gray.900">{prodName}</Text></HStack>
                                                <HStack justify="space-between"><Text fontWeight="bold">Quantity:</Text><Text fontWeight="bold" color="teal.700">{quantity} Unit(s)</Text></HStack>
                                                <HStack justify="space-between"><Text fontWeight="bold">Category:</Text><Badge colorScheme="teal" fontSize="3xs">{prodCategory}</Badge></HStack>
                                                <Box bg="teal.50" p={2} borderRadius="6px" border="1px solid" borderColor="teal.100">
                                                  <Text color="teal.900" fontWeight="bold" fontSize="3xs" mb={0.5}>Notes / Specification:</Text>
                                                  <Text color="gray.700" fontSize="3xs" noOfLines={3}>{prodDesc}</Text>
                                                </Box>
                                              </VStack>
                                            </Box>
                                          </PopoverContent>
                                        </Portal>
                                      </Popover>
                                    </Td>

                                    {/* AMOUNT */}
                                    <Td py={3} px={3} whiteSpace="nowrap" verticalAlign="middle">
                                      <Text fontSize="xs" fontWeight="bold" color="teal.700">INR {Number(totalAmount).toLocaleString("en-IN")}</Text>
                                    </Td>

                                    {/* ORDER STATUS BADGE */}
                                    <Td py={3} px={3} whiteSpace="nowrap" verticalAlign="middle">
                                      <Badge
                                        px={2.5}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="2xs"
                                        fontWeight="bold"
                                        textTransform="uppercase"
                                        colorScheme={status === "completed" ? "green" : status === "active" ? "blue" : "red"}
                                      >
                                        {status}
                                      </Badge>
                                    </Td>

                                    {/* PAYMENT STATUS BADGE */}
                                    <Td py={3} px={3} whiteSpace="nowrap" verticalAlign="middle">
                                      <Badge
                                        px={2.5}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="2xs"
                                        fontWeight="extrabold"
                                        textTransform="uppercase"
                                        colorScheme={payStatus === "paid" ? "green" : "red"}
                                      >
                                        {payStatus === "paid" ? "✓ PAID" : "✕ UNPAID"}
                                      </Badge>
                                    </Td>

                                    {/* ACTIONS */}
                                    <Td py={3} px={3} whiteSpace="nowrap" textAlign="right" verticalAlign="middle">
                                      <HStack spacing={1.5} justify="flex-end">
                                        {status === "active" && (
                                          <Button
                                            size="xs"
                                            colorScheme="green"
                                            leftIcon={<FaCheckCircle />}
                                            borderRadius="md"
                                            px={2.5}
                                            isLoading={bookingsActionId === bId}
                                            onClick={() => handleUpdateProductBooking(b)}
                                          >
                                            Complete
                                          </Button>
                                        )}
                                        {payStatus !== "paid" && (
                                          <Button
                                            size="xs"
                                            colorScheme="purple"
                                            leftIcon={<FaCreditCard />}
                                            borderRadius="md"
                                            px={2.5}
                                            onClick={() => handleOpenManualPayment(b)}
                                          >
                                            Record Pay
                                          </Button>
                                        )}
                                        {status === "active" && (
                                          <Button
                                            size="xs"
                                            variant="outline"
                                            colorScheme="red"
                                            leftIcon={<FaBan />}
                                            borderRadius="md"
                                            px={2}
                                            isLoading={bookingsActionId === bId}
                                            onClick={() => handleCancelProductBooking(b)}
                                          >
                                            Cancel
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
                    </Box>
                  )}

                  {currentView === "inventory" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <HStack spacing={2} mb={4} flexWrap="wrap">
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={!lowStockFilter && !outOfStockFilter ? "teal" : "gray"}
                          variant={!lowStockFilter && !outOfStockFilter ? "solid" : "outline"}
                          bg={!lowStockFilter && !outOfStockFilter ? customColor : "transparent"}
                          onClick={() => { setLowStockFilter(false); setOutOfStockFilter(false); }}
                        >
                          All Inventory ({inventoryList.length})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={lowStockFilter ? "orange" : "gray"}
                          variant={lowStockFilter ? "solid" : "outline"}
                          onClick={() => { setLowStockFilter(!lowStockFilter); setOutOfStockFilter(false); }}
                        >
                          Low Stock (&lt;5) ({inventoryList.filter(i => (i.stockQuantity || i.stock || 0) > 0 && (i.stockQuantity || i.stock || 0) < 5).length})
                        </Button>
                        <Button
                          size="xs"
                          borderRadius="full"
                          colorScheme={outOfStockFilter ? "red" : "gray"}
                          variant={outOfStockFilter ? "solid" : "outline"}
                          onClick={() => { setOutOfStockFilter(!outOfStockFilter); setLowStockFilter(false); }}
                        >
                          Out of Stock (0) ({inventoryList.filter(i => (i.stockQuantity || i.stock || 0) === 0).length})
                        </Button>
                      </HStack>

                      {isLoadingInventory ? (
                        <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                      ) : (
                        <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflowX="auto" boxShadow="sm">
                          <Table variant="simple" size="sm">
                            <Thead bg={customColor}>
                              <Tr>
                                <Th color="white" py={3} fontSize="xs">Product / SKU</Th>
                                <Th color="white" py={3} fontSize="xs">Category</Th>
                                <Th color="white" py={3} fontSize="xs">Price</Th>
                                <Th color="white" py={3} fontSize="xs">Total Stock</Th>
                                <Th color="white" py={3} fontSize="xs">Stock Status</Th>
                                <Th color="white" py={3} fontSize="xs" textAlign="right">Actions</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg="white">
                              {inventoryList
                                .filter(item => {
                                  const qty = item.stockQuantity || item.stock || 0;
                                  if (lowStockFilter) return qty > 0 && qty < 5;
                                  if (outOfStockFilter) return qty === 0;
                                  if (searchTerm) {
                                    const s = searchTerm.toLowerCase();
                                    return (item.name || "").toLowerCase().includes(s) || (item.sku || "").toLowerCase().includes(s);
                                  }
                                  return true;
                                })
                                .map((item, idx) => {
                                  const qty = item.stockQuantity || item.stock || 0;
                                  const statusScheme = qty === 0 ? "red" : qty < 5 ? "orange" : "green";
                                  const statusLabel = qty === 0 ? "Out of Stock" : qty < 5 ? "Low Stock" : "In Stock";
                                  return (
                                    <Tr key={item._id || idx} _hover={{ bg: "teal.50/20" }}>
                                      <Td fontWeight="bold" fontSize="xs" color="gray.800">
                                        <HStack spacing={2}>
                                          <Avatar size="xs" name={item.name} src={item.images?.[0]?.url || item.images?.[0]} />
                                          <VStack align="start" spacing={0}>
                                            <Text>{item.name}</Text>
                                            {item.sku && <Text fontSize="3xs" color="gray.500" fontFamily="mono">SKU: {item.sku}</Text>}
                                          </VStack>
                                        </HStack>
                                      </Td>
                                      <Td fontSize="xs" color="gray.600">{item.category?.name || item.category || "N/A"}</Td>
                                      <Td fontSize="xs" fontWeight="semibold">₹{item.price || item.estimatedPriceFrom || 0}</Td>
                                      <Td fontSize="xs" fontWeight="extrabold" color={`${statusScheme}.600`}>{qty} units</Td>
                                      <Td>
                                        <Badge colorScheme={statusScheme} px={2} py={0.5} borderRadius="full" fontSize="3xs">
                                          {statusLabel}
                                        </Badge>
                                      </Td>
                                      <Td textAlign="right">
                                        <HStack justify="flex-end" spacing={1.5}>
                                          <Button size="xs" colorScheme="teal" bg={customColor} variant="solid" onClick={() => handleOpenStockAdjustModal(item)}>
                                            Update Stock
                                          </Button>
                                          <Button size="xs" variant="outline" colorScheme="blue" onClick={() => handleOpenStockHistoryModal(item)}>
                                            History
                                          </Button>
                                        </HStack>
                                      </Td>
                                    </Tr>
                                  );
                                })}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                    </Box>
                  )}

                  {currentView === "payments" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <HStack spacing={2} mb={4} flexWrap="wrap">
                        {["all", "paid", "unpaid", "pending", "failed", "manual"].map((st) => (
                          <Button
                            key={st}
                            size="xs"
                            borderRadius="full"
                            colorScheme={paymentStatusFilter === st ? "teal" : "gray"}
                            variant={paymentStatusFilter === st ? "solid" : "outline"}
                            bg={paymentStatusFilter === st ? customColor : "transparent"}
                            textTransform="capitalize"
                            onClick={() => setPaymentStatusFilter(st)}
                          >
                            {st} ({paymentsList.filter(p => st === "all" ? true : (p.status || p.paymentStatus || "").toLowerCase() === st).length})
                          </Button>
                        ))}
                      </HStack>

                      {isLoadingPaymentsList ? (
                        <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                      ) : (
                        <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflowX="auto" boxShadow="sm">
                          <Table variant="simple" size="sm">
                            <Thead bg={customColor}>
                              <Tr>
                                <Th color="white" py={3} fontSize="xs">Payment Ref</Th>
                                <Th color="white" py={3} fontSize="xs">Customer</Th>
                                <Th color="white" py={3} fontSize="xs">Amount</Th>
                                <Th color="white" py={3} fontSize="xs">Payment Mode</Th>
                                <Th color="white" py={3} fontSize="xs">Status</Th>
                                <Th color="white" py={3} fontSize="xs">Date</Th>
                                <Th color="white" py={3} fontSize="xs" textAlign="right">Actions</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg="white">
                              {paymentsList
                                .filter(p => {
                                  if (paymentStatusFilter !== "all" && (p.status || p.paymentStatus || "").toLowerCase() !== paymentStatusFilter) return false;
                                  if (searchTerm) {
                                    const s = searchTerm.toLowerCase();
                                    return (p.reference || "").toLowerCase().includes(s) || (p.customerName || "").toLowerCase().includes(s) || (p.bookingId || "").toLowerCase().includes(s);
                                  }
                                  return true;
                                })
                                .map((pay, idx) => {
                                  const amt = pay.amountPaise ? pay.amountPaise / 100 : pay.amount || 0;
                                  const status = (pay.status || pay.paymentStatus || "pending").toLowerCase();
                                  return (
                                    <Tr key={pay._id || idx} _hover={{ bg: "teal.50/20" }}>
                                      <Td fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">
                                        {pay.reference || pay.razorpayPaymentId || `PAY_${idx}`}
                                      </Td>
                                      <Td fontSize="xs" fontWeight="semibold" color="gray.800">
                                        {pay.customerName || pay.clientName || "Customer"}
                                      </Td>
                                      <Td fontSize="xs" fontWeight="extrabold" color="teal.700">
                                        ₹{Number(amt).toLocaleString("en-IN")}
                                      </Td>
                                      <Td fontSize="xs" textTransform="uppercase" fontWeight="bold">
                                        <Badge colorScheme="purple" fontSize="3xs">{pay.paymentMethod || pay.method || "ONLINE"}</Badge>
                                      </Td>
                                      <Td>
                                        <Badge colorScheme={status === "paid" || status === "captured" ? "green" : status === "failed" ? "red" : "orange"} px={2.5} py={1} borderRadius="full" fontSize="2xs">
                                          {status}
                                        </Badge>
                                      </Td>
                                      <Td fontSize="xs" color="gray.500">
                                        {new Date(pay.createdAt || pay.receivedAt || Date.now()).toLocaleDateString()}
                                      </Td>
                                      <Td textAlign="right">
                                        <Button size="xs" colorScheme="teal" variant="outline" onClick={() => handleOpenPaymentDetailModal(pay)}>
                                          View Details
                                        </Button>
                                      </Td>
                                    </Tr>
                                  );
                                })}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                    </Box>
                  )}

                  {currentView === "reconciliation" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <Tabs variant="soft-rounded" colorScheme="teal">
                        <TabList mb={4} gap={2}>
                          <Tab fontSize="xs" fontWeight="bold">Unmatched Payments ({unmatchedPayments.length})</Tab>
                          <Tab fontSize="xs" fontWeight="bold">Refund Requests ({refundRequestsList.length})</Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel p={0}>
                            {isLoadingReconciliation ? (
                              <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                            ) : unmatchedPayments.length === 0 ? (
                              <Center p={10} bg="gray.50" borderRadius="xl"><Text fontSize="sm" color="gray.500">All payments reconciled successfully. No unmatched records.</Text></Center>
                            ) : (
                              <Table variant="simple" size="sm">
                                <Thead bg={customColor}>
                                  <Tr>
                                    <Th color="white">Razorpay ID</Th>
                                    <Th color="white">Amount</Th>
                                    <Th color="white">Discrepancy Note</Th>
                                    <Th color="white" textAlign="right">Action</Th>
                                  </Tr>
                                </Thead>
                                <Tbody bg="white">
                                  {unmatchedPayments.map((unm, idx) => (
                                    <Tr key={unm._id || idx}>
                                      <Td fontFamily="mono" fontSize="xs">{unm.razorpayPaymentId || unm._id}</Td>
                                      <Td fontSize="xs" fontWeight="bold">₹{unm.amount || 0}</Td>
                                      <Td fontSize="xs" color="orange.600">{unm.reason || "Unmatched ledger record"}</Td>
                                      <Td textAlign="right">
                                        <Button size="xs" colorScheme="teal" bg={customColor} onClick={() => handleOpenReconcileModal(unm)}>
                                          Reconcile
                                        </Button>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            )}
                          </TabPanel>
                          <TabPanel p={0}>
                            <Table variant="simple" size="sm">
                              <Thead bg={customColor}>
                                <Tr>
                                  <Th color="white">Booking Ref</Th>
                                  <Th color="white">Customer</Th>
                                  <Th color="white">Refund Amount</Th>
                                  <Th color="white">Status</Th>
                                </Tr>
                              </Thead>
                              <Tbody bg="white">
                                {refundRequestsList.map((rf, idx) => (
                                  <Tr key={rf._id || idx}>
                                    <Td fontSize="xs" fontFamily="mono">{rf.bookingId || rf._id}</Td>
                                    <Td fontSize="xs">{rf.customerName || "Customer"}</Td>
                                    <Td fontSize="xs" fontWeight="bold">₹{rf.amount || 0}</Td>
                                    <Td><Badge colorScheme="purple">{rf.status || "Requested"}</Badge></Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Box>
                  )}

                  {currentView === "reports" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">Financial Sales & Performance Analytics</Text>
                          <Button size="xs" colorScheme="teal" variant="outline" onClick={() => setCurrentView("audit-logs")}>
                            View Audit Logs
                          </Button>
                        </HStack>
                        <Button size="sm" colorScheme="teal" bg={customColor} leftIcon={<FaFileDownload />} isLoading={isExportingCSV} onClick={handleExportCSV}>
                          Export Sales CSV
                        </Button>
                      </Flex>
                      {isLoadingReports ? (
                        <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                      ) : (
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
                          <Card p={4} border="1px solid" borderColor="teal.100" bg="teal.50/40">
                            <Stat>
                              <StatLabel fontSize="xs" color="gray.600">Total Turnover</StatLabel>
                              <StatNumber fontSize="xl" fontWeight="extrabold" color="teal.800">
                                ₹{Number(dashboardSummary?.totalSalesTurnover || 0).toLocaleString("en-IN")}
                              </StatNumber>
                            </Stat>
                          </Card>
                          <Card p={4} border="1px solid" borderColor="green.100" bg="green.50/40">
                            <Stat>
                              <StatLabel fontSize="xs" color="gray.600">Collected Revenue</StatLabel>
                              <StatNumber fontSize="xl" fontWeight="extrabold" color="green.700">
                                ₹{Number(dashboardSummary?.collectedRevenue || 0).toLocaleString("en-IN")}
                              </StatNumber>
                            </Stat>
                          </Card>
                          <Card p={4} border="1px solid" borderColor="purple.100" bg="purple.50/40">
                            <Stat>
                              <StatLabel fontSize="xs" color="gray.600">Conversion Rate</StatLabel>
                              <StatNumber fontSize="xl" fontWeight="extrabold" color="purple.700">
                                {dashboardSummary?.quoteConversionRate || "85"}%
                              </StatNumber>
                            </Stat>
                          </Card>
                        </Grid>
                      )}
                    </Box>
                  )}

                  {currentView === "audit-logs" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">🛡️ Product Administrative Audit Trail</Text>
                        <Button size="xs" colorScheme="teal" variant="outline" onClick={() => setCurrentView("reports")}>
                          Back to Reports
                        </Button>
                      </Flex>
                      {isLoadingAuditLogs ? (
                        <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                      ) : auditLogsList.length === 0 ? (
                        <Center p={10} bg="gray.50" borderRadius="xl"><Text fontSize="sm" color="gray.500">No audit log records found.</Text></Center>
                      ) : (
                        <Table variant="simple" size="sm">
                          <Thead bg={customColor}>
                            <Tr>
                              <Th color="white">Timestamp</Th>
                              <Th color="white">Performed By</Th>
                              <Th color="white">Action</Th>
                              <Th color="white">Entity</Th>
                              <Th color="white">Reason / Details</Th>
                            </Tr>
                          </Thead>
                          <Tbody bg="white">
                            {auditLogsList.map((log, idx) => (
                              <Tr key={log._id || idx}>
                                <Td fontSize="xs" color="gray.500">{new Date(log.createdAt || Date.now()).toLocaleString()}</Td>
                                <Td fontSize="xs" fontWeight="bold">{log.adminName || log.userEmail || "Admin"}</Td>
                                <Td><Badge colorScheme="blue" fontSize="3xs">{log.action}</Badge></Td>
                                <Td fontSize="xs" fontFamily="mono">{log.entityId || log.targetId || "System"}</Td>
                                <Td fontSize="xs" color="gray.700">{log.reason || log.description || "N/A"}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}
                    </Box>
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
                  {currentView === "categories" && (
                    currentCategories.length > 0 ? (
                      currentCategories.map((cat, idx) => (
                        <CategoryMobileCard
                          key={cat._id || idx}
                          cat={cat}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          onView={handleViewCategory}
                          onEdit={handleEditCategory}
                          onDelete={handleDeleteCategory}
                          onAddProduct={handleAddProductToCategory}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={MdCategory} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No categories found</Text>
                        </VStack>
                      </Center>
                    )
                  )}

                  {currentView === "quotations" && (
                    <Box p={{ base: 2, md: 4 }}>
                      <Tabs variant="soft-rounded" colorScheme="teal">
                        <TabList mb={4} gap={2} flexWrap="wrap">
                          <Tab
                            fontWeight="bold"
                            fontSize="xs"
                            borderRadius="lg"
                            px={4}
                            py={2}
                            _selected={{ color: "white", bg: customColor, shadow: "sm" }}
                            _focus={{ boxShadow: "none" }}
                          >
                            Formal Quotations ({filteredQuotationsList.length})
                          </Tab>
                          <Tab
                            fontWeight="bold"
                            fontSize="xs"
                            borderRadius="lg"
                            px={4}
                            py={2}
                            _selected={{ color: "white", bg: customColor, shadow: "sm" }}
                            _focus={{ boxShadow: "none" }}
                          >
                            Quote Requests ({filteredQuoteRequests.length})
                          </Tab>
                        </TabList>
                        <TabPanels>
                          {/* TAB 1: FORMAL QUOTATIONS */}
                          <TabPanel p={0}>
                            {isLoadingQuotations ? (
                              <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                            ) : filteredQuotationsList.length === 0 ? (
                              <Center p={10} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={2}>
                                  <Icon as={FaQuoteRight} boxSize={8} color="gray.300" />
                                  <Text fontSize="sm" color="gray.500" fontWeight="medium">No admin product quotations found matching search.</Text>
                                </VStack>
                              </Center>
                            ) : (
                              <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden" boxShadow="sm">
                                <Table variant="simple" size="sm">
                                  <Thead bg={customColor}>
                                    <Tr>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Quotation ID</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Customer</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Items / Product</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Total Amount</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Valid Until</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Status</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Actions</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody bg="white">
                                    {filteredQuotationsList.map((q, qIdx) => {
                                      const qId = q._id || q.id || `QT_${qIdx}`;
                                      const cust = q.customerSnapshot?.name || q.customerName || q.clientName || (typeof q.customerId === 'object' && q.customerId ? (q.customerId.name || `${q.customerId.fname || ''} ${q.customerId.lname || ''}`.trim()) : null) || "Customer";
                                      const itemDesc = q.productSnapshot?.productName || (typeof q.productId === 'object' && q.productId ? (q.productId.productName || q.productId.name) : null) || q.items?.[0]?.productSnapshot?.productName || q.items?.[0]?.description || q.productName || "Product Supply";
                                      const total = (q.financialSnapshot?.totalAmountPaise ? q.financialSnapshot.totalAmountPaise / 100 : null)
                                        ?? (q.financialSnapshot?.unitPricePaise ? (q.financialSnapshot.unitPricePaise * (q.quantity || 1)) / 100 : null)
                                        ?? q.finalAmount
                                        ?? q.totalAmount
                                        ?? 0;
                                      const status = q.status || "draft";
                                      return (
                                        <Tr key={qId} _hover={{ bg: "teal.50/30" }} transition="all 0.15s">
                                          <Td fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">{qId}</Td>
                                          <Td fontSize="xs" fontWeight="semibold" color="gray.800">{cust}</Td>
                                          <Td fontSize="xs" color="gray.600">{itemDesc}</Td>
                                          <Td fontSize="xs" fontWeight="bold" color="teal.700">INR {Number(total).toLocaleString("en-IN")}</Td>
                                          <Td fontSize="xs" color="gray.500">{new Date(q.validUntil || Date.now()).toLocaleDateString()}</Td>
                                          <Td>
                                            <Badge
                                              px={2.5}
                                              py={1}
                                              borderRadius="full"
                                              fontSize="2xs"
                                              fontWeight="bold"
                                              textTransform="uppercase"
                                              colorScheme={status === "sent" || status === "accepted" ? "green" : status === "rejected" ? "red" : "orange"}
                                            >
                                              {status}
                                            </Badge>
                                          </Td>
                                          <Td>
                                            <HStack spacing={2}>
                                              {status === "draft" && (
                                                <Button
                                                  size="xs"
                                                  colorScheme="teal"
                                                  bg={customColor}
                                                  _hover={{ bg: customColor, filter: "brightness(0.9)" }}
                                                  leftIcon={<FaPaperPlane />}
                                                  borderRadius="md"
                                                  px={3}
                                                  onClick={() => handleSendQuotation(qId, q)}
                                                >
                                                  Send
                                                </Button>
                                              )}
                                              {["sent", "viewed", "delivered", "quotation_sent"].includes(status) && (
                                                <Button
                                                  size="xs"
                                                  variant="outline"
                                                  colorScheme="blue"
                                                  leftIcon={<FaRedo />}
                                                  borderRadius="md"
                                                  px={3}
                                                  onClick={() => handleResendQuotation(qId, q)}
                                                >
                                                  Resend
                                                </Button>
                                              )}
                                              {["sent", "viewed", "delivered", "quotation_sent", "rejected"].includes(status) && (
                                                <Button
                                                  size="xs"
                                                  variant="outline"
                                                  colorScheme="orange"
                                                  borderRadius="md"
                                                  px={3}
                                                  onClick={() => handleOpenReviseModal(q)}
                                                >
                                                  Revise
                                                </Button>
                                              )}
                                              {(() => {
                                                const isProtectedQuotation = ["accepted", "converted"].includes((q.status || "").toLowerCase());
                                                return (
                                                  <Tooltip label={isProtectedQuotation ? "Accepted quotation cannot be deleted (Audit Trail Safeguard)" : "Delete Quotation"}>
                                                    <IconButton
                                                      icon={<FaTrash />}
                                                      aria-label="Delete Quotation"
                                                      size="xs"
                                                      colorScheme="red"
                                                      variant="ghost"
                                                      borderRadius="md"
                                                      isDisabled={isProtectedQuotation}
                                                      opacity={isProtectedQuotation ? 0.35 : 1}
                                                      onClick={() => handleDeleteQuotation(qId, q)}
                                                    />
                                                  </Tooltip>
                                                );
                                              })()}
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

                          {/* TAB 2: QUOTE REQUESTS */}
                          <TabPanel p={0}>
                            <HStack spacing={2} mb={4} flexWrap="wrap">
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "active" ? "teal" : "gray"}
                                variant={requestStatusFilter === "active" ? "solid" : "outline"}
                                bg={requestStatusFilter === "active" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("active")}
                              >
                                New / Active ({quoteRequests.filter(r => ["quote_requested", "under_review", "quotation_prepared", "quotation_sent", "viewed"].includes((r.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "accepted" ? "teal" : "gray"}
                                variant={requestStatusFilter === "accepted" ? "solid" : "outline"}
                                bg={requestStatusFilter === "accepted" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("accepted")}
                              >
                                Completed / Accepted ({quoteRequests.filter(r => ["accepted", "converted", "completed"].includes((r.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "cancelled" ? "teal" : "gray"}
                                variant={requestStatusFilter === "cancelled" ? "solid" : "outline"}
                                bg={requestStatusFilter === "cancelled" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("cancelled")}
                              >
                                Cancelled / Expired ({quoteRequests.filter(r => ["cancelled", "rejected", "expired"].includes((r.status || "").toLowerCase())).length})
                              </Button>
                              <Button
                                size="xs"
                                borderRadius="full"
                                colorScheme={requestStatusFilter === "all" ? "teal" : "gray"}
                                variant={requestStatusFilter === "all" ? "solid" : "outline"}
                                bg={requestStatusFilter === "all" ? customColor : "transparent"}
                                onClick={() => setRequestStatusFilter("all")}
                              >
                                All ({quoteRequests.length})
                              </Button>
                            </HStack>
                            {isLoadingQuotations ? (
                              <Center p={10}><Spinner color={customColor} size="lg" /></Center>
                            ) : filteredQuoteRequests.length === 0 ? (
                              <Center p={10} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={2}>
                                  <Icon as={FaFileContract} boxSize={8} color="gray.300" />
                                  <Text fontSize="sm" color="gray.500" fontWeight="medium">No customer quote requests found matching search.</Text>
                                </VStack>
                              </Center>
                            ) : (
                              <Box borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden" boxShadow="sm">
                                <Table variant="simple" size="sm">
                                  <Thead bg={customColor}>
                                    <Tr>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Request ID</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Customer Name</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Contact Phone</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Requested Product</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Status</Th>
                                      <Th color="white" py={3.5} fontSize="xs" fontWeight="bold">Actions</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody bg="white">
                                    {filteredQuoteRequests.map((req, rIdx) => {
                                      const reqId = req._id || req.id || `REQ_${rIdx}`;
                                      const displayReqId = req.requestNumber || (req._id ? `REQ-${req._id.slice(-6)}` : `REQ_${rIdx}`);
                                      const cust = getQuoteCustomerDetails(req);
                                      const prod = getQuoteProductDetails(req);
                                      const status = (req.status || "quote_requested").toLowerCase();
                                      const canCreateQuotation = ["quote_requested", "under_review"].includes(status);
                                      return (
                                        <Tr key={reqId} _hover={{ bg: "teal.50/30" }} transition="all 0.15s">
                                          <Td fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">{displayReqId}</Td>
                                          <Td>
                                            <Popover trigger="hover" placement="top" openDelay={150}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">{cust.name}</Text>
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.600" opacity={0.8} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                                                                            <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="290px" zIndex={99999}>
                                                <PopoverArrow bg="white" />
                                                <Box>
                                                  <HStack spacing={2} mb={2}>
                                                    <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                      <Icon as={FaUser} boxSize={3} />
                                                    </Flex>
                                                    <Text fontSize="xs" fontWeight="bold" color="teal.900">Customer Details</Text>
                                                  </HStack>
                                                  <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                    <HStack justify="space-between"><Text fontWeight="bold">Name:</Text><Text fontWeight="semibold" color="gray.900">{cust.name}</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Phone:</Text><Text color="teal.700" fontWeight="bold">{cust.phone}</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Email:</Text><Text>{cust.email}</Text></HStack>
                                                    <Box pt={1} borderTop="1px dashed" borderColor="gray.200">
                                                      <Text fontWeight="bold" color="gray.600">Location / Delivery Address:</Text>
                                                      <Text color="gray.800" mt={0.5} noOfLines={2}>{cust.address}</Text>
                                                    </Box>
                                                  </VStack>
                                                </Box>
                                              </PopoverContent>
                                            </Portal>
                                             </Popover>
                                          </Td>
                                          <Td fontSize="xs" color="gray.600">{cust.phone}</Td>
                                          <Td>
                                            <Popover trigger="hover" placement="top" openDelay={150}>
                                              <PopoverTrigger>
                                                <Box cursor="pointer" display="inline-block">
                                                  <HStack spacing={1}>
                                                    <Text fontSize="xs" fontWeight="medium" color="gray.700">{prod.name}</Text>
                                                    {prod.quantity > 1 && (
                                                      <Badge colorScheme="teal" fontSize="3xs" px={1.5} borderRadius="full">x{prod.quantity}</Badge>
                                                    )}
                                                    <Icon as={FaInfoCircle} boxSize={3} color="teal.500" opacity={0.7} />
                                                  </HStack>
                                                </Box>
                                              </PopoverTrigger>
                                                                                            <Portal>
                                                <PopoverContent bg="white" borderColor="teal.200" shadow="2xl" borderRadius="14px" p={3.5} w="310px" zIndex={99999}>
                                                <PopoverArrow bg="white" />
                                                <Box>
                                                  <HStack spacing={2} mb={2}>
                                                    <Flex boxSize="24px" bg="teal.100" color="teal.700" borderRadius="6px" align="center" justify="center">
                                                      <Icon as={FaBox} boxSize={3} />
                                                    </Flex>
                                                    <Text fontSize="xs" fontWeight="bold" color="teal.900">Product & Purpose Details</Text>
                                                  </HStack>
                                                  <VStack align="stretch" spacing={1.5} fontSize="2xs" color="gray.700">
                                                    <HStack justify="space-between"><Text fontWeight="bold">Product Name:</Text><Text fontWeight="semibold" color="gray.900">{prod.name}</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Quantity Required:</Text><Text fontWeight="bold" color="teal.700">{prod.quantity} Unit(s)</Text></HStack>
                                                    <HStack justify="space-between"><Text fontWeight="bold">Category / Brand:</Text><Text>{prod.category} / {prod.brand}</Text></HStack>
                                                    <Box bg="teal.50" p={2} borderRadius="8px" border="1px solid" borderColor="teal.200">
                                                      <Text color="teal.900" fontWeight="bold" fontSize="3xs" mb={0.5}>Customer Purpose / Additional Notes:</Text>
                                                      <Text color="gray.800" fontSize="2xs" fontStyle="italic" whiteSpace="pre-wrap">{prod.specText}</Text>
                                                    </Box>
                                                  </VStack>
                                                </Box>
                                              </PopoverContent>
                                            </Portal>
                                             </Popover>
                                          </Td>
                                          <Td>
                                            <Badge
                                              px={2.5}
                                              py={1}
                                              borderRadius="full"
                                              fontSize="2xs"
                                              fontWeight="extrabold"
                                              textTransform="uppercase"
                                              colorScheme={
                                                ["quote_requested", "under_review"].includes(status) ? "red" :
                                                status === "accepted" || status === "quotation_sent" ? "green" :
                                                status === "under_review" || status === "quotation_prepared" ? "teal" :
                                                status === "rejected" || status === "cancelled" ? "red" : "orange"
                                              }
                                              display="inline-flex"
                                              alignItems="center"
                                              gap={1}
                                              shadow="xs"
                                            >
                                              {["quote_requested", "under_review"].includes(status) && <Icon as={FaEnvelope} boxSize="9px" />}
                                              {status === "quote_requested" ? "NEW REQUEST" : (req.status || "QUOTE_REQUESTED").replace(/_/g, " ")}
                                            </Badge>
                                          </Td>
                                          <Td>
                                            <Flex align="center" gap={2} flexWrap="nowrap">
                                              <IconButton
                                                icon={<FaEye />}
                                                aria-label="View Full Details"
                                                title="View Full Request Details"
                                                size="xs"
                                                colorScheme="teal"
                                                variant="ghost"
                                                borderRadius="lg"
                                                onClick={() => {
                                                  setSelectedReqDetail(req);
                                                  setIsReqDetailModalOpen(true);
                                                }}
                                              />
                                              {canCreateQuotation && (
                                                <Button
                                                  size="xs"
                                                  colorScheme="teal"
                                                  bg={customColor}
                                                  _hover={{ bg: customColor, filter: "brightness(0.9)", shadow: "sm" }}
                                                  leftIcon={<FaFileContract />}
                                                  borderRadius="lg"
                                                  px={3}
                                                  py={1.5}
                                                  fontWeight="semibold"
                                                  whiteSpace="nowrap"
                                                  onClick={() => handleOpenQuotationForRequest(req)}
                                                >
                                                  Create Quotation
                                                </Button>
                                              )}
                                              {(() => {
                                                const isProtectedReq = ["accepted", "quotation_sent", "viewed"].includes((req.status || "").toLowerCase());
                                                return (
                                                  <Tooltip label={isProtectedReq ? "Quote request with active quotation/order cannot be deleted" : "Delete Request"}>
                                                    <IconButton
                                                      icon={<FaTrash />}
                                                      aria-label="Delete Request"
                                                      size="xs"
                                                      colorScheme="red"
                                                      variant="ghost"
                                                      borderRadius="lg"
                                                      isDisabled={isProtectedReq}
                                                      opacity={isProtectedReq ? 0.35 : 1}
                                                      onClick={() => handleDeleteQuoteRequest(reqId, req)}
                                                    />
                                                  </Tooltip>
                                                );
                                              })()}
                                            </Flex>
                                          </Td>
                                        </Tr>
                                      );
                                    })}
                                  </Tbody>
                                </Table>
                              </Box>
                            )}
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Box>
                  )}

                  {currentView === "products" && (
                    currentProducts.length > 0 ? (
                      currentProducts.map((prod, idx) => (
                        <ProductMobileCard
                          key={prod._id || idx}
                          prod={prod}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          onView={handleViewProduct}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          categories={categories}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={FaBox} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No products found</Text>
                        </VStack>
                      </Center>
                    )
                  )}
                  {currentView === "bookings" && (
                    currentBookings.length > 0 ? (
                      currentBookings.map((b, idx) => {
                        const bId = b._id || b.id || `BK_${idx}`;
                        const displayBId = b.bookingNumber || (bId.length > 10 ? `BK-${bId.slice(-8).toUpperCase()}` : bId);
                        const custObj = b.customerSnapshot || (typeof b.customerId === 'object' && b.customerId ? b.customerId : {}) || {};
                        const custName = custObj.name || (custObj.fname ? `${custObj.fname || ''} ${custObj.lname || ''}`.trim() : null) || b.customerName || "Customer";
                        const custPhone = custObj.mobileNumber || custObj.phone || b.phone || "N/A";
                        const prodObj = b.productSnapshot || (typeof b.productId === 'object' && b.productId ? b.productId : {}) || {};
                        const prodName = prodObj.productName || prodObj.name || b.productName || "Product Item";
                        const totalAmount = (b.financialSnapshot?.totalAmountPaise ? b.financialSnapshot.totalAmountPaise / 100 : null) ?? b.amount ?? 0;
                        const status = (b.status || "active").toLowerCase();
                        const payStatus = (b.paymentStatus || "pending").toLowerCase();

                        return (
                          <Card key={bId} mb={3} p={3} border="1px solid" borderColor="gray.200" borderRadius="xl" shadow="xs">
                            <Flex justify="space-between" align="center" mb={2}>
                              <Text fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.700">{displayBId}</Text>
                              <HStack spacing={1}>
                                <Badge colorScheme={status === "completed" ? "green" : status === "active" ? "blue" : "red"} fontSize="3xs">
                                  {status}
                                </Badge>
                                <Badge colorScheme={payStatus === "paid" ? "green" : "red"} fontSize="3xs">
                                  {payStatus === "paid" ? "PAID" : "UNPAID"}
                                </Badge>
                              </HStack>
                            </Flex>
                            <VStack align="stretch" spacing={1} fontSize="xs" mb={3}>
                              <Flex justify="space-between">
                                <Text color="gray.500">Customer:</Text>
                                <Text fontWeight="semibold" color="gray.800">{custName} ({custPhone})</Text>
                              </Flex>
                              <Flex justify="space-between">
                                <Text color="gray.500">Product:</Text>
                                <Text fontWeight="medium">{prodName} (x{b.quantity || 1})</Text>
                              </Flex>
                              <Flex justify="space-between">
                                <Text color="gray.500">Total Amount:</Text>
                                <Text fontWeight="extrabold" color="teal.700">INR {Number(totalAmount).toLocaleString("en-IN")}</Text>
                              </Flex>
                            </VStack>
                            <Flex gap={2} justify="flex-end">
                              {status === "active" && (
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  leftIcon={<FaCheckCircle />}
                                  isLoading={bookingsActionId === bId}
                                  onClick={() => handleUpdateProductBooking(b)}
                                >
                                  Complete
                                </Button>
                              )}
                              {payStatus !== "paid" && (
                                <Button
                                  size="xs"
                                  colorScheme="purple"
                                  leftIcon={<FaCreditCard />}
                                  onClick={() => handleOpenManualPayment(b)}
                                >
                                  Record Pay
                                </Button>
                              )}
                              {status === "active" && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme="red"
                                  leftIcon={<FaBan />}
                                  isLoading={bookingsActionId === bId}
                                  onClick={() => handleCancelProductBooking(b)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Flex>
                          </Card>
                        );
                      })
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={FaClipboardCheck} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No product bookings found</Text>
                        </VStack>
                      </Center>
                    )
                  )}

                  {currentView === "inventory" && (
                    <VStack align="stretch" spacing={3}>
                      {inventoryList.map((item, idx) => (
                        <Card key={item._id || idx} p={3} border="1px solid" borderColor="gray.200" borderRadius="xl">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontSize="xs" fontWeight="bold">{item.name}</Text>
                            <Badge colorScheme={(item.stockQuantity || item.stock || 0) === 0 ? "red" : (item.stockQuantity || item.stock || 0) < 5 ? "orange" : "green"} fontSize="3xs">
                              Qty: {item.stockQuantity || item.stock || 0}
                            </Badge>
                          </Flex>
                          <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={2}>
                            <Text>SKU: {item.sku || "N/A"}</Text>
                            <Text fontWeight="semibold" color="gray.800">₹{item.price || item.estimatedPriceFrom || 0}</Text>
                          </Flex>
                          <HStack justify="flex-end" spacing={2}>
                            <Button size="xs" colorScheme="teal" bg={customColor} onClick={() => handleOpenStockAdjustModal(item)}>Adjust Stock</Button>
                            <Button size="xs" variant="outline" onClick={() => handleOpenStockHistoryModal(item)}>History</Button>
                          </HStack>
                        </Card>
                      ))}
                    </VStack>
                  )}

                  {currentView === "payments" && (
                    <VStack align="stretch" spacing={3}>
                      {paymentsList.map((pay, idx) => (
                        <Card key={pay._id || idx} p={3} border="1px solid" borderColor="gray.200" borderRadius="xl">
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontFamily="mono" fontSize="2xs" fontWeight="bold" color="teal.700">{pay.reference || pay.razorpayPaymentId || `PAY_${idx}`}</Text>
                            <Badge colorScheme={(pay.status || pay.paymentStatus || "").toLowerCase() === "paid" ? "green" : "orange"} fontSize="3xs">{pay.status || pay.paymentStatus || "pending"}</Badge>
                          </Flex>
                          <Text fontSize="xs" fontWeight="semibold" color="gray.800">{pay.customerName || pay.clientName || "Customer"}</Text>
                          <Flex justify="space-between" fontSize="2xs" color="gray.600" mt={1}>
                            <Text fontWeight="extrabold" color="teal.700">₹{pay.amountPaise ? pay.amountPaise / 100 : pay.amount || 0}</Text>
                            <Text textTransform="uppercase">{pay.paymentMethod || pay.method || "ONLINE"}</Text>
                          </Flex>
                          <Button size="xs" mt={2} colorScheme="teal" variant="outline" onClick={() => handleOpenPaymentDetailModal(pay)}>View Details</Button>
                        </Card>
                      ))}
                    </VStack>
                  )}

                  {currentView === "reconciliation" && (
                    <VStack align="stretch" spacing={3}>
                      {unmatchedPayments.map((unm, idx) => (
                        <Card key={unm._id || idx} p={3} border="1px solid" borderColor="teal.200" borderRadius="xl" bg="teal.50/20">
                          <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color="teal.800">Unmatched: {unm.razorpayPaymentId || unm._id}</Text>
                          <Text fontSize="xs" fontWeight="extrabold" color="teal.700" mt={1}>Amount: ₹{unm.amount || 0}</Text>
                          <Text fontSize="2xs" color="orange.600" mt={1}>{unm.reason || "Unmatched payment ledger item"}</Text>
                          <Button size="xs" mt={2} colorScheme="teal" bg={customColor} onClick={() => handleOpenReconcileModal(unm)}>Reconcile</Button>
                        </Card>
                      ))}
                    </VStack>
                  )}

                  {currentView === "reports" && (
                    <VStack align="stretch" spacing={3}>
                      <Card p={4} bg="teal.50">
                        <Text fontSize="xs" color="gray.600">Total Turnover</Text>
                        <Text fontSize="lg" fontWeight="extrabold" color="teal.800">₹{Number(dashboardSummary?.totalSalesTurnover || 0).toLocaleString("en-IN")}</Text>
                      </Card>
                      <Button size="sm" colorScheme="teal" bg={customColor} leftIcon={<FaFileDownload />} isLoading={isExportingCSV} onClick={handleExportCSV}>
                        Export Sales CSV
                      </Button>
                    </VStack>
                  )}

                  {currentView === "audit-logs" && (
                    <VStack align="stretch" spacing={3}>
                      {auditLogsList.map((log, idx) => (
                        <Card key={log._id || idx} p={3} border="1px solid" borderColor="gray.200" borderRadius="xl">
                          <Flex justify="space-between" mb={1}>
                            <Badge colorScheme="blue" fontSize="3xs">{log.action}</Badge>
                            <Text fontSize="3xs" color="gray.400">{new Date(log.createdAt || Date.now()).toLocaleDateString()}</Text>
                          </Flex>
                          <Text fontSize="xs" fontWeight="bold" color="gray.800">{log.adminName || log.userEmail || "Admin"}</Text>
                          <Text fontSize="2xs" color="gray.600" mt={1}>{log.reason || log.description || "System action logged"}</Text>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Pagination Controls */}
                {(currentView === "categories" ? filteredCategories.length > 0 : currentView === "bookings" ? filteredBookings.length > 0 : filteredProducts.length > 0) && (
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
                            {currentView === "categories" ? totalCategoryPages : currentView === "bookings" ? totalBookingPages : totalProductPages}
                          </Text>
                        </Flex>

                        <Button
                          size="sm"
                          onClick={handleNextPage}
                          isDisabled={
                            currentView === "categories"
                              ? currentPage === totalCategoryPages
                              : currentView === "bookings"
                              ? currentPage === totalBookingPages
                              : currentPage === totalProductPages
                          }
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

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={closeModal} size="lg">
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader color="gray.700">
            {viewModalType === "category" ? "Category Details" : "Product Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {viewModalType === "category" && selectedCategory && (
              <VStack spacing={4} align="stretch">
                {(selectedCategory.image || selectedCategory.url) && (
                  <Box borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
                    <Image
                      src={selectedCategory.image || selectedCategory.url}
                      alt={selectedCategory.name || selectedCategory.category}
                      w="100%"
                      h="200px"
                      objectFit="contain"
                      bg="gray.50"
                    />
                  </Box>
                )}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Name</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.category || selectedCategory.name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.description || "No description"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Products in this category</Text>
                  <Text fontSize="md" mt={1}>
                    {products.filter(p => p.category?._id === selectedCategory._id || p.category === selectedCategory._id).length} products
                  </Text>
                </Box>
              </VStack>
            )}

            {viewModalType === "product" && selectedProduct && (
              <VStack spacing={4} align="stretch">
                {/* Image */}
                <Box borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
                  <Image
                    src={
                      selectedProduct.images?.[0]?.url ||
                      selectedProduct.images?.[0] ||
                      selectedProduct.productImages?.[0]?.url ||
                      selectedProduct.productImages?.[0] ||
                      "/placeholder.png"
                    }
                    alt={selectedProduct.name}
                    w="100%"
                    h="200px"
                    objectFit="contain"
                    bg="gray.50"
                  />
                </Box>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Product Name</Text>
                  <Text fontSize="lg" fontWeight="medium" mt={1}>{selectedProduct.productName || selectedProduct.name}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Status</Text>
                    <Badge
                      colorScheme={
                        selectedProduct.status === "Available" ? "green" :
                          selectedProduct.status === "Out of Stock" ? "orange" : "red"
                      }
                      mt={1}
                      px={2}
                      py={1}
                    >
                      {selectedProduct.status || "Available"}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Product Type</Text>
                    <Text fontSize="sm" mt={1}>{selectedProduct.productType || "Hardware"}</Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description</Text>
                  <Text fontSize="sm" mt={1}>{selectedProduct.description || "No description"}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Price Range</Text>
                    <Text fontSize="md" fontWeight="bold" color="green.600">
                      ₹{selectedProduct.estimatedPriceFrom || 0} - ₹{selectedProduct.estimatedPriceTo || 0}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Pricing Model</Text>
                    <Text fontSize="sm" textTransform="capitalize">{selectedProduct.pricingModel || "Fixed"}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Usage Type</Text>
                    <Text fontSize="sm">{selectedProduct.usageType || "Residential"}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Installation</Text>
                    <Text fontSize="sm">{selectedProduct.installationDuration || "N/A"}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Warranty</Text>
                    <Text fontSize="sm">{selectedProduct.warrantyPeriod || "N/A"}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">AMC</Text>
                    <Text fontSize="sm">
                      {selectedProduct.amcAvailable ? `Yes (₹${selectedProduct.amcPricePerYear}/yr)` : "No"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Site Inspection Required</Text>
                  <Text fontSize="sm">{selectedProduct.siteInspectionRequired ? "Yes" : "No"}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="green.600" fontSize="sm">What's Included</Text>
                    <Box pl={2} mt={1}>
                      {selectedProduct.whatIncluded && selectedProduct.whatIncluded.length > 0 ? (
                        selectedProduct.whatIncluded.map((item, i) => (
                          <Flex key={i} align="center" gap={1} mb={0.5}>
                            <Icon as={FaCheckCircle} color="green.500" boxSize={3} />
                            <Text fontSize="sm">{item}</Text>
                          </Flex>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">Not specified</Text>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="red.600" fontSize="sm">What's Not Included</Text>
                    <Box pl={2} mt={1}>
                      {selectedProduct.whatNotIncluded && selectedProduct.whatNotIncluded.length > 0 ? (
                        selectedProduct.whatNotIncluded.map((item, i) => (
                          <Flex key={i} align="center" gap={1} mb={0.5}>
                            <Icon as={FaTimes} color="red.500" boxSize={3} />
                            <Text fontSize="sm">{item}</Text>
                          </Flex>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">Not specified</Text>
                      )}
                    </Box>
                  </Box>
                </SimpleGrid>

                {/* Frequently Asked Questions */}
                {selectedProduct.faqs && selectedProduct.faqs.length > 0 && (
                  <Box borderTop="1px solid" borderColor="gray.200" pt={3} mt={2}>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FaQuestionCircle} color="teal.500" boxSize={4} />
                      <Text fontWeight="bold" color="gray.700" fontSize="sm">Frequently Asked Questions</Text>
                    </HStack>
                    <VStack spacing={2} align="stretch" pl={2}>
                      {selectedProduct.faqs.map((faq, index) => (
                        <Box key={index} p={2} bg="gray.50" borderRadius="md" borderLeft="3px solid" borderColor="teal.500">
                          <Text fontSize="xs" fontWeight="bold" color="gray.800">Q: {faq.question}</Text>
                          <Text fontSize="xs" color="gray.600" mt={1}>A: {faq.answer}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Additional Images */}
                {(() => {
                  const allImages = [...(selectedProduct.images || []), ...(selectedProduct.productImages || [])];
                  if (allImages.length <= 1) return null;

                  return (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Additional Images</Text>
                      <SimpleGrid columns={4} spacing={2}>
                        {allImages.slice(1).map((img, index) => (
                          <Box
                            key={img.public_id || index}
                            borderRadius="md"
                            overflow="hidden"
                          >
                            <Image
                              src={img.url || img}
                              alt={`Image ${index + 2}`}
                              w="100%"
                              h="60px"
                              objectFit="cover"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  );
                })()}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="gray.700">
            <Flex align="center" gap={2}>
              <Icon as={FaExclamationTriangle} color="red.500" />
              Confirm Delete
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="md" mb={4}>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold" color={customColor}>
                "{itemToDelete?.category || itemToDelete?.name}"
              </Text>
              ? This action cannot be undone.
            </Text>

            {deleteType === "category" && (
              <Box
                bg="orange.50"
                p={3}
                borderRadius="md"
                border="1px"
                borderColor="orange.200"
              >
                <Flex align="center" gap={2} mb={2}>
                  <Icon as={MdWarning} color="orange.500" />
                  <Text fontSize="sm" fontWeight="medium" color="orange.700">
                    Important Note
                  </Text>
                </Flex>
                <Text fontSize="sm" color="orange.600">
                  This category must be empty (no products) before it can be deleted.
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={closeDeleteModal}
              isDisabled={isDeleting}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              bg="red.500"
              _hover={{ bg: "red.600" }}
              color="white"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Deleting..."
              size="sm"
            >
              Delete {deleteType === "category" ? "Category" : "Product"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



      {/* MANUAL PAYMENT MODAL */}
      <Modal isOpen={isManualPaymentModalOpen} onClose={() => setIsManualPaymentModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" bg="green.50">
            <Flex align="center" gap={2}>
              <Icon as={FaMoneyBillWave} color="green.600" boxSize={5} />
              <Text fontSize="md" fontWeight="bold" color="green.800">
                Mark Product Order Payment Received
              </Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={3} align="stretch">
              <Box bg="gray.50" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontSize="2xs" color="gray.500" textTransform="uppercase">Target Booking</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.800">
                  {selectedBookingForPayment?._id || selectedBookingForPayment?.id}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Customer: {selectedBookingForPayment?.customerName || "Customer"}
                </Text>
              </Box>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Collected Amount (INR)</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  fontWeight="bold"
                  color="green.700"
                  value={manualPaymentForm.amount}
                  onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, amount: Number(e.target.value) })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Payment Method</FormLabel>
                <Select
                  size="sm"
                  value={manualPaymentForm.paymentMethod}
                  onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="other">Other Manual Approved Method</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Reference / Transaction ID</FormLabel>
                <Input
                  size="sm"
                  placeholder="e.g. CASH-1001 or UPI/12345"
                  value={manualPaymentForm.reference}
                  onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, reference: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Admin Notes</FormLabel>
                <Textarea
                  size="sm"
                  rows={2}
                  value={manualPaymentForm.notes}
                  onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, notes: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button size="sm" mr={3} onClick={() => setIsManualPaymentModalOpen(false)}>Cancel</Button>
            <Button size="sm" colorScheme="green" isLoading={isSubmittingPayment} onClick={handleRecordManualPayment}>
              Confirm & Log Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QUOTE REQUEST DETAILS MODAL WITH EXPANDABLE / COLLAPSIBLE ACCORDION SECTIONS */}
      <Modal isOpen={isReqDetailModalOpen} onClose={() => setIsReqDetailModalOpen(false)} size="2xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
          <ModalHeader bg={customColor} color="white" p="20px 24px">
            <Flex align="center" justify="space-between" flexWrap="wrap" gap="10px" pr="48px">
              <HStack spacing="12px">
                <Flex w="42px" h="42px" bg="whiteAlpha.300" color="white" borderRadius="12px" align="center" justify="center" shadow="sm">
                  <Icon as={FaFileContract} w="22px" h="22px" />
                </Flex>
                <Box>
                  <Heading size="sm" color="white" fontWeight="bold">
                    Quote Request Specifications & Dossier
                  </Heading>
                  <Text fontSize="xs" color="teal.100" fontWeight="mono" mt="2px">
                    ID: {selectedReqDetail?._id || selectedReqDetail?.id}
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="teal" bg="whiteAlpha.300" color="white" px="12px" py="5px" borderRadius="10px" fontSize="xs" fontWeight="bold">
                {(selectedReqDetail?.status || "quote_requested").replace(/_/g, " ").toUpperCase()}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" top="18px" right="20px" />

          <ModalBody p="24px" bg="gray.50">
            {selectedReqDetail && (() => {
              const cust = getQuoteCustomerDetails(selectedReqDetail);
              const prod = getQuoteProductDetails(selectedReqDetail);

              return (
                <VStack spacing="20px" align="stretch">
                  {/* INSTRUCTION BADGE */}
                  <Flex align="center" justify="space-between" bg="teal.50" border="1px solid" borderColor="teal.200" p="12px 16px" borderRadius="14px">
                    <HStack spacing="8px">
                      <Icon as={FaInfoCircle} color="teal.600" />
                      <Text fontSize="xs" color="teal.900" fontWeight="medium">
                        Click on any section header below to Expand / Hide (Collapsible Accordion View)
                      </Text>
                    </HStack>
                    <Badge colorScheme="teal" fontSize="3xs" px="8px" py="2px" borderRadius="6px">Interactive Dossier</Badge>
                  </Flex>

                  {/* ACCORDION SECTIONS */}
                  <Accordion allowMultiple defaultIndex={[0, 1, 2]} reduceMotion>
                    
                    {/* SECTION 1: CUSTOMER DETAILS */}
                    <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="14px" bg="white" mb="14px" overflow="hidden" boxShadow="sm">
                      <h2>
                        <AccordionButton p="14px 18px" _expanded={{ bg: "teal.50", color: "teal.900" }}>
                          <Flex flex="1" textAlign="left" align="center" gap="10px">
                            <Flex w="32px" h="32px" bg="teal.100" color="teal.700" borderRadius="8px" align="center" justify="center">
                              <Icon as={FaUser} boxSize={4} />
                            </Flex>
                            <Box>
                              <Text fontSize="sm" fontWeight="bold">Customer Profile & Contact Details</Text>
                              <Text fontSize="2xs" color="gray.500">Identity, phone, email & service location</Text>
                            </Box>
                          </Flex>
                          <AccordionIcon color="teal.600" boxSize={6} />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb="16px" pt="12px" px="18px" bg="white">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="14px">
                          <Box p="10px 14px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb="2px">Customer Name</Text>
                            <Text fontSize="sm" fontWeight="extrabold" color="gray.800">{cust.name}</Text>
                          </Box>

                          <Box p="10px 14px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb="2px">Contact Phone</Text>
                            <HStack spacing="6px">
                              <Icon as={FaPhoneAlt} color="teal.600" boxSize={3} />
                              <Text fontSize="sm" fontWeight="bold" color="teal.900">{cust.phone}</Text>
                            </HStack>
                          </Box>

                          <Box p="10px 14px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb="2px">Email Address</Text>
                            <HStack spacing="6px">
                              <Icon as={FaEnvelope} color="blue.500" boxSize={3} />
                              <Text fontSize="sm" fontWeight="semibold" color="gray.700">{cust.email}</Text>
                            </HStack>
                          </Box>

                          <Box p="10px 14px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb="2px">Location / Address</Text>
                            <HStack spacing="6px">
                              <Icon as={FaMapMarkerAlt} color="red.500" boxSize={3} />
                              <Text fontSize="xs" color="gray.700">{cust.address !== "—" ? cust.address : (cust.city !== "—" ? cust.city : "Address not provided")}</Text>
                            </HStack>
                          </Box>
                        </SimpleGrid>
                      </AccordionPanel>
                    </AccordionItem>

                    {/* SECTION 2: PRODUCT DETAILS */}
                    <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="14px" bg="white" mb="14px" overflow="hidden" boxShadow="sm">
                      <h2>
                        <AccordionButton p="14px 18px" _expanded={{ bg: "teal.50", color: "teal.900" }}>
                          <Flex flex="1" textAlign="left" align="center" gap="10px">
                            <Flex w="32px" h="32px" bg="teal.100" color="teal.700" borderRadius="8px" align="center" justify="center">
                              <Icon as={FaBox} boxSize={4} />
                            </Flex>
                            <Box>
                              <Text fontSize="sm" fontWeight="bold">Product & Category Details</Text>
                              <Text fontSize="2xs" color="gray.500">Target product, model number & estimated rate</Text>
                            </Box>
                          </Flex>
                          <AccordionIcon color="teal.600" boxSize={6} />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb="16px" pt="12px" px="18px" bg="white">
                        <Flex direction={{ base: "column", sm: "row" }} gap="16px" align="center" mb="14px">
                          {prod.image ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              boxSize="80px"
                              objectFit="cover"
                              borderRadius="12px"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                          ) : (
                            <Flex boxSize="80px" bg="teal.50" color="teal.600" borderRadius="12px" align="center" justify="center" border="1px solid" borderColor="teal.200">
                              <Icon as={FaBox} boxSize={8} />
                            </Flex>
                          )}
                          <Box flex="1">
                            <Heading size="xs" color="gray.800" mb="4px">{prod.name}</Heading>
                            <HStack spacing="8px" flexWrap="wrap">
                              <Badge colorScheme="teal" fontSize="2xs" px="8px" py="2px" borderRadius="6px">
                                Category: {prod.category}
                              </Badge>
                              <Badge colorScheme="gray" fontSize="2xs" px="8px" py="2px" borderRadius="6px">
                                Brand: {prod.brand}
                              </Badge>
                            </HStack>
                          </Box>
                        </Flex>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="12px">
                          <Box p="10px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Model Number</Text>
                            <Text fontSize="xs" fontWeight="mono" color="gray.800">{prod.model}</Text>
                          </Box>
                          <Box p="10px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Estimated Price / Budget</Text>
                            <Text fontSize="xs" fontWeight="extrabold" color="teal.700">
                              {prod.price !== "—" ? `INR ${Number(prod.price).toLocaleString("en-IN")}` : "Custom Quote Request"}
                            </Text>
                          </Box>
                          <Box p="10px" bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.100">
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Quantity Requested</Text>
                            <Text fontSize="xs" fontWeight="bold" color="teal.700">{prod.quantity} Unit(s)</Text>
                          </Box>
                        </SimpleGrid>
                      </AccordionPanel>
                    </AccordionItem>

                    {/* SECTION 3: REQUESTED SPECIFICATIONS & DESCRIPTION */}
                    <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="14px" bg="white" overflow="hidden" boxShadow="sm">
                      <h2>
                        <AccordionButton p="14px 18px" _expanded={{ bg: "teal.50", color: "teal.900" }}>
                          <Flex flex="1" textAlign="left" align="center" gap="10px">
                            <Flex w="32px" h="32px" bg="teal.100" color="teal.700" borderRadius="8px" align="center" justify="center">
                              <Icon as={FaFileInvoiceDollar} boxSize={4} />
                            </Flex>
                            <Box>
                              <Text fontSize="sm" fontWeight="bold">Customer Specification / Description Notes</Text>
                              <Text fontSize="2xs" color="gray.500">Custom requirement text & technical snapshots</Text>
                            </Box>
                          </Flex>
                          <AccordionIcon color="teal.600" boxSize={6} />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb="16px" pt="12px" px="18px" bg="white">
                        <Box p="14px" bg="teal.50" borderRadius="12px" border="1px solid" borderColor="teal.200" mb="12px">
                          <Text fontSize="xs" fontWeight="bold" color="teal.900" mb="6px">Customer Requirement Description:</Text>
                          <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap" lineHeight="1.5">
                            {prod.specText}
                          </Text>
                        </Box>

                        {selectedReqDetail.specifications && (
                          <Box p="14px" bg="gray.900" color="green.300" borderRadius="12px" overflowX="auto">
                            <Text fontSize="2xs" fontWeight="bold" color="teal.300" mb="4px">Structured Technical Specs Snapshot:</Text>
                            <Text fontSize="2xs" fontFamily="mono">
                              {typeof selectedReqDetail.specifications === "string" 
                                ? selectedReqDetail.specifications 
                                : JSON.stringify(selectedReqDetail.specifications, null, 2)}
                            </Text>
                          </Box>
                        )}
                      </AccordionPanel>
                    </AccordionItem>

                  </Accordion>
                </VStack>
              );
            })()}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="gray.100" p="14px 24px">
            <Button size="sm" variant="ghost" mr={3} onClick={() => setIsReqDetailModalOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              bg={customColor}
              _hover={{ bg: customColor, filter: "brightness(0.9)" }}
              leftIcon={<FaFileContract />}
              onClick={() => {
                setIsReqDetailModalOpen(false);
                if (selectedReqDetail) handleOpenQuotationForRequest(selectedReqDetail);
              }}
            >
              Prepare Quotation Now
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* COMPREHENSIVE ROW-CLICK QUOTATION DETAIL MODAL */}
      <Modal isOpen={isQuotationDetailModalOpen} onClose={() => setIsQuotationDetailModalOpen(false)} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
          {selectedQuotationForDetail && (() => {
            const q = selectedQuotationForDetail;
            const qId = q._id || q.id || "QT-UNKNOWN";
            const displayQId = q.quotationNumber || (qId.length > 12 ? `QT-${qId.slice(-8)}` : qId);
            
            const custObj = q.customerSnapshot || (typeof q.customerId === 'object' && q.customerId ? q.customerId : {}) || {};
            const custName = custObj.name || q.customerName || q.clientName || (custObj.fname ? `${custObj.fname || ''} ${custObj.lname || ''}`.trim() : null) || "Customer";
            const custPhone = custObj.phone || custObj.mobile || q.customerPhone || q.phone || "Not Provided";
            const custEmail = custObj.email || q.customerEmail || "Not Provided";
            const rawAddr = custObj.deliveryAddress || custObj.address || q.deliveryAddress || q.address;
            const custAddress = typeof rawAddr === 'string' ? rawAddr : (typeof rawAddr === 'object' && rawAddr ? ([rawAddr.addressLine || rawAddr.street || rawAddr.houseNo || (typeof rawAddr.address === 'string' ? rawAddr.address : null), rawAddr.city, rawAddr.state, rawAddr.pincode || rawAddr.zipCode].filter(Boolean).join(', ') || "Standard Service Location") : "Standard Service Location");

            const prodObj = q.productSnapshot || (typeof q.productId === 'object' && q.productId ? q.productId : {}) || {};
            const itemDesc = prodObj.productName || prodObj.name || q.items?.[0]?.productSnapshot?.productName || q.items?.[0]?.description || q.productName || "Product Supply";
            const prodCategory = prodObj.categoryName || prodObj.category || "General Product";
            const prodBrand = prodObj.brand || prodObj.brandName || "RightTouch Partner";
            const prodQuantity = q.quantity || 1;
            const prodSpec = prodObj.description || q.notes || q.adminNotes || "Standard product supply and setup";

            const fin = q.financialSnapshot || {};
            const total = (fin.totalAmountPaise ? fin.totalAmountPaise / 100 : null)
              ?? (fin.unitPricePaise ? (fin.unitPricePaise * prodQuantity) / 100 : null)
              ?? q.finalAmount
              ?? q.totalAmount
              ?? 0;
            const unitPrice = fin.unitPricePaise ? fin.unitPricePaise / 100 : (total / prodQuantity);
            const baseAmount = fin.baseAmountPaise ? fin.baseAmountPaise / 100 : (unitPrice * prodQuantity);
            const discountAmount = fin.discountPaise ? fin.discountPaise / 100 : 0;
            const taxableAmount = fin.taxableAmountPaise ? fin.taxableAmountPaise / 100 : Math.max(0, baseAmount - discountAmount);
            const gstPercent = fin.gstPercent ?? 5;
            const gstAmount = fin.gstAmountPaise ? fin.gstAmountPaise / 100 : Math.round((taxableAmount * gstPercent) / 100);

            const status = (q.status || "draft").toLowerCase();
            const payStatus = (q.paymentStatus || "unpaid").toLowerCase();
            const payMethod = q.paymentMethod || q.paymentGroup?.paymentMethod || (payStatus === "paid" ? "Recorded Online / UPI / Cash" : "Pending Settlement");
            const payGroupId = q.paymentGroup?._id || q.paymentGroup || q.paymentGroupId || `PAY-${qId.slice(-8).toUpperCase()}`;
            const payDate = q.paidAt ? formatExpiryDate(q.paidAt) : (q.updatedAt ? formatExpiryDate(q.updatedAt) : formatExpiryDate(new Date()));

            const expiryInfo = getExpiryInfo(q.validUntil, status);

            return (
              <>
                <ModalHeader bg={customColor} color="white" p="20px 24px">
                  <Flex align="center" justify="space-between" flexWrap="wrap" gap="10px" pr="48px">
                    <HStack spacing="12px">
                      <Flex w="42px" h="42px" bg="whiteAlpha.300" color="white" borderRadius="12px" align="center" justify="center" shadow="sm">
                        <Icon as={FaFileContract} w="22px" h="22px" />
                      </Flex>
                      <Box>
                        <Heading size="sm" color="white" fontWeight="bold">
                          Quotation Details & Audit Dossier
                        </Heading>
                        <Text fontSize="xs" color="teal.100" fontWeight="mono" mt="2px">
                          {displayQId} &bull; System ID: {qId}
                        </Text>
                      </Box>
                    </HStack>
                    <HStack spacing="8px">
                      <Badge colorScheme={status === "accepted" ? "green" : "whiteAlpha"} px="10px" py="4px" borderRadius="8px" fontSize="xs" fontWeight="bold">
                        {status.toUpperCase()}
                      </Badge>
                      <Badge colorScheme={payStatus === "paid" ? "green" : "red"} px="10px" py="4px" borderRadius="8px" fontSize="xs" fontWeight="extrabold">
                        {payStatus === "paid" ? "✓ PAID" : "✕ UNPAID"}
                      </Badge>
                    </HStack>
                  </Flex>
                </ModalHeader>
                <ModalCloseButton color="white" top="18px" right="20px" />

                <ModalBody p="24px" bg="gray.50">
                  <VStack spacing="18px" align="stretch">
                    {/* CUSTOMER REJECTION REASON CARD */}
                    {status === "rejected" && (
                      <Box bg="red.50" border="1px solid" borderColor="red.300" borderRadius="14px" p="16px" boxShadow="sm">
                        <Flex align="center" justify="space-between" mb="8px">
                          <HStack spacing="10px">
                            <Flex w="30px" h="30px" bg="red.100" color="red.700" borderRadius="8px" align="center" justify="center">
                              <Icon as={FaBan} boxSize={3.5} />
                            </Flex>
                            <Box>
                              <Heading size="xs" color="red.900">Quotation Rejected by Customer</Heading>
                              <Text fontSize="3xs" color="red.600">
                                Customer declined this quotation offer {q.rejectedAt ? `• Date: ${formatExpiryDate(q.rejectedAt)}` : ''}
                              </Text>
                            </Box>
                          </HStack>
                          <Badge colorScheme="red" fontSize="2xs" px="10px" py="3px" borderRadius="full">
                            REJECTED
                          </Badge>
                        </Flex>
                        <Box bg="white" p="12px 14px" borderRadius="10px" border="1px solid" borderColor="red.200" mt="6px">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Customer Stated Reason</Text>
                          <Text fontSize="sm" color="red.900" fontWeight="bold" mt="2px">
                            "{q.rejectedReason || 'Price exceeds budget / Customer declined offer'}"
                          </Text>
                        </Box>
                        <Flex justify="flex-end" mt="10px">
                          <Button
                            size="xs"
                            colorScheme="teal"
                            leftIcon={<Icon as={FaEdit} />}
                            borderRadius="full"
                            onClick={() => {
                              setSelectedQuotation(null);
                              handleOpenReviseModal(q);
                            }}
                          >
                            Create & Send Revised Quote (V{q.revision ? q.revision + 1 : 2})
                          </Button>
                        </Flex>
                      </Box>
                    )}

                    {/* EXPIRY BANNER */}
                    <Flex
                      align="center"
                      justify="space-between"
                      bg={expiryInfo.isExpired ? "red.50" : expiryInfo.color === "orange" ? "orange.50" : "teal.50"}
                      border="1px solid"
                      borderColor={expiryInfo.isExpired ? "red.200" : expiryInfo.color === "orange" ? "orange.200" : "teal.200"}
                      p="12px 16px"
                      borderRadius="14px"
                    >
                      <HStack spacing="10px">
                        <Icon
                          as={expiryInfo.isExpired ? MdWarning : FaInfoCircle}
                          color={expiryInfo.isExpired ? "red.600" : expiryInfo.color === "orange" ? "orange.600" : "teal.600"}
                          boxSize={5}
                        />
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color={expiryInfo.isExpired ? "red.900" : expiryInfo.color === "orange" ? "orange.900" : "teal.900"}>
                            Lifecycle Expiration Record: {expiryInfo.label}
                          </Text>
                          <Text fontSize="3xs" color="gray.600">
                            Valid Until Date: {formatExpiryDate(q.validUntil)} &bull; Issued Date: {formatExpiryDate(q.createdAt || Date.now())}
                          </Text>
                        </Box>
                      </HStack>
                      <Badge colorScheme={expiryInfo.color} fontSize="2xs" px="10px" py="3px" borderRadius="full">
                        {expiryInfo.isExpired ? "EXPIRED" : "ACTIVE"}
                      </Badge>
                    </Flex>

                    {/* SECTIONS GRID */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
                      {/* CUSTOMER DETAILS CARD */}
                      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="14px" p="16px" boxShadow="sm">
                        <HStack spacing="10px" mb="12px">
                          <Flex w="30px" h="30px" bg="teal.100" color="teal.700" borderRadius="8px" align="center" justify="center">
                            <Icon as={FaUser} boxSize={3.5} />
                          </Flex>
                          <Heading size="xs" color="gray.800">Customer Identity</Heading>
                        </HStack>
                        <VStack align="stretch" spacing="8px" fontSize="xs">
                          <Flex justify="space-between"><Text color="gray.500" fontWeight="medium">Name:</Text><Text fontWeight="extrabold" color="gray.900">{custName}</Text></Flex>
                          <Flex justify="space-between"><Text color="gray.500" fontWeight="medium">Phone:</Text><Text fontWeight="bold" color="teal.700">{custPhone}</Text></Flex>
                          <Flex justify="space-between"><Text color="gray.500" fontWeight="medium">Email:</Text><Text color="gray.800">{custEmail}</Text></Flex>
                          <Divider my="4px" />
                          <Box bg="gray.50" p="8px 10px" borderRadius="8px">
                            <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Delivery Location</Text>
                            <Text fontSize="xs" color="gray.800" fontWeight="medium" mt="2px">{custAddress}</Text>
                          </Box>
                        </VStack>
                      </Box>

                      {/* PRODUCT & ORDER CARD */}
                      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="14px" p="16px" boxShadow="sm">
                        <HStack spacing="10px" mb="12px">
                          <Flex w="30px" h="30px" bg="teal.100" color="teal.700" borderRadius="8px" align="center" justify="center">
                            <Icon as={FaBox} boxSize={3.5} />
                          </Flex>
                          <Heading size="xs" color="gray.800">Product Specifications</Heading>
                        </HStack>
                        <VStack align="stretch" spacing="8px" fontSize="xs">
                          <Flex justify="space-between"><Text color="gray.500" fontWeight="medium">Product Name:</Text><Text fontWeight="extrabold" color="gray.900">{itemDesc}</Text></Flex>
                          <Flex justify="space-between"><Text color="gray.500" fontWeight="medium">Quantity:</Text><Badge colorScheme="teal" borderRadius="full" px="8px">{prodQuantity} Unit(s)</Badge></Flex>
                          <Flex justify="space-between"><Text color="gray.500" fontWeight="medium">Category / Brand:</Text><Text color="gray.800">{prodCategory} / {prodBrand}</Text></Flex>
                          <Divider my="4px" />
                          <Box bg="gray.50" p="8px 10px" borderRadius="8px">
                            <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Specification Notes</Text>
                            <Text fontSize="xs" color="gray.700" fontStyle="italic" mt="2px">{prodSpec}</Text>
                          </Box>
                        </VStack>
                      </Box>
                    </SimpleGrid>

                    {/* FINANCIAL BREAKDOWN CARD */}
                    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="14px" p="16px" boxShadow="sm">
                      <HStack spacing="10px" mb="14px">
                        <Flex w="30px" h="30px" bg="teal.100" color="teal.700" borderRadius="8px" align="center" justify="center">
                          <Icon as={FaReceipt} boxSize={3.5} />
                        </Flex>
                        <Heading size="xs" color="gray.800">Financial Audit & Breakdown</Heading>
                      </HStack>
                      <SimpleGrid columns={{ base: 1, md: 4 }} spacing="12px" mb="12px">
                        <Box bg="gray.50" p="10px" borderRadius="10px" border="1px solid" borderColor="gray.100">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Unit Rate</Text>
                          <Text fontSize="xs" fontWeight="bold" color="gray.800">INR {Number(unitPrice).toLocaleString("en-IN")}</Text>
                        </Box>
                        <Box bg="gray.50" p="10px" borderRadius="10px" border="1px solid" borderColor="gray.100">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Base Subtotal</Text>
                          <Text fontSize="xs" fontWeight="bold" color="gray.800">INR {Number(baseAmount).toLocaleString("en-IN")}</Text>
                        </Box>
                        <Box bg="gray.50" p="10px" borderRadius="10px" border="1px solid" borderColor="gray.100">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Discount ({discountAmount > 0 ? "Applied" : "None"})</Text>
                          <Text fontSize="xs" fontWeight="bold" color={discountAmount > 0 ? "green.600" : "gray.600"}>
                            {discountAmount > 0 ? `- INR ${Number(discountAmount).toLocaleString("en-IN")}` : "INR 0"}
                          </Text>
                        </Box>
                        <Box bg="gray.50" p="10px" borderRadius="10px" border="1px solid" borderColor="gray.100">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold" textTransform="uppercase">GST ({gstPercent}%)</Text>
                          <Text fontSize="xs" fontWeight="bold" color="teal.700">+ INR {Number(gstAmount).toLocaleString("en-IN")}</Text>
                        </Box>
                      </SimpleGrid>
                      <Flex align="center" justify="space-between" bg="teal.50" p="12px 16px" borderRadius="10px" border="1px solid" borderColor="teal.200">
                        <Text fontSize="sm" fontWeight="extrabold" color="teal.900">Quotation Grand Total:</Text>
                        <Text fontSize="lg" fontWeight="black" color="teal.700">INR {Number(total).toLocaleString("en-IN")}</Text>
                      </Flex>
                    </Box>

                    {/* PAYMENT & SETTLEMENT RECORD CARD */}
                    <Box bg="white" border="1px solid" borderColor={payStatus === "paid" ? "green.200" : "red.200"} borderRadius="14px" p="16px" boxShadow="sm">
                      <Flex align="center" justify="space-between" mb="12px">
                        <HStack spacing="10px">
                          <Flex w="30px" h="30px" bg={payStatus === "paid" ? "green.100" : "red.100"} color={payStatus === "paid" ? "green.700" : "red.700"} borderRadius="8px" align="center" justify="center">
                            <Icon as={FaCreditCard} boxSize={3.5} />
                          </Flex>
                          <Heading size="xs" color={payStatus === "paid" ? "green.900" : "red.900"}>Payment Settlement Record</Heading>
                        </HStack>
                        <Button
                          size="xs"
                          colorScheme={payStatus === "paid" ? "red" : "green"}
                          variant="solid"
                          borderRadius="full"
                          px="12px"
                          onClick={() => handleTogglePaymentStatus(qId, payStatus)}
                        >
                          {payStatus === "paid" ? "Mark as UNPAID" : "Mark as PAID"}
                        </Button>
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="12px" fontSize="xs">
                        <Box bg="gray.50" p="8px 12px" borderRadius="8px">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold">SETTLEMENT STATUS</Text>
                          <Badge colorScheme={payStatus === "paid" ? "green" : "red"} mt="2px">
                            {payStatus === "paid" ? "✓ PAID & CONFIRMED" : "✕ UNPAID"}
                          </Badge>
                        </Box>
                        <Box bg="gray.50" p="8px 12px" borderRadius="8px">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold">PAYMENT METHOD</Text>
                          <Text fontWeight="bold" color="gray.800" mt="2px">{payMethod}</Text>
                        </Box>
                        <Box bg="gray.50" p="8px 12px" borderRadius="8px">
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold">LAST RECORDED DATE</Text>
                          <Text fontWeight="bold" color="gray.800" mt="2px">{payDate}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </ModalBody>

                <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="gray.100" p="14px 24px">
                  <Button size="sm" variant="ghost" mr={3} onClick={() => setIsQuotationDetailModalOpen(false)}>
                    Close Dossier
                  </Button>
                  {status === "draft" && (
                    <Button
                      size="sm"
                      colorScheme="teal"
                      bg={customColor}
                      _hover={{ bg: customColor, filter: "brightness(0.9)" }}
                      leftIcon={<FaPaperPlane />}
                      onClick={() => {
                        setIsQuotationDetailModalOpen(false);
                        handleSendQuotation(qId, q);
                      }}
                    >
                      Send Quotation
                    </Button>
                  )}
                  {["sent", "viewed", "delivered", "quotation_sent"].includes(status) && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<FaRedo />}
                      mr="8px"
                      onClick={() => {
                        handleResendQuotation(qId, q);
                      }}
                    >
                      Resend Notification
                    </Button>
                  )}
                  {["sent", "viewed", "delivered", "quotation_sent", "rejected"].includes(status) && (
                    <Button
                      size="sm"
                      colorScheme="orange"
                      variant="solid"
                      onClick={() => {
                        setIsQuotationDetailModalOpen(false);
                        handleOpenReviseModal(q);
                      }}
                    >
                      Revise Quotation
                    </Button>
                  )}
                </ModalFooter>
              </>
            );
          })()}
        </ModalContent>
      </Modal>

      {/* QUOTATION PREVIEW MODAL */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader bg={customColor} color="white" borderTopRadius="16px">
            <Flex justify="space-between" align="center" pr="48px">
              <Text fontSize="md" fontWeight="bold">RightTouch Official Quotation Preview</Text>
              <Badge colorScheme="teal" bg="whiteAlpha.300" color="white" fontSize="2xs">{previewQuotation?._id || previewQuotation?.id}</Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {previewQuotation && (
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center" borderBottom="2px solid" borderColor="teal.600" pb={3}>
                  <Box>
                    <Heading size="md" color="teal.700">RightTouch</Heading>
                    <Text fontSize="2xs" color="gray.500">Appliance & Installation Solutions</Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="xs" fontWeight="bold">Quotation Date: {new Date(previewQuotation.createdAt || Date.now()).toLocaleDateString()}</Text>
                    <Text fontSize="xs" color="red.500">Valid Until: {new Date(previewQuotation.validUntil || Date.now()).toLocaleDateString()}</Text>
                  </Box>
                </Flex>

                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontSize="xs" fontWeight="bold" color="gray.700">Customer:</Text>
                  <Text fontSize="xs">{previewQuotation.customerName || "Valued Customer"}</Text>
                </Box>

                <Table variant="simple" size="sm">
                  <Thead bg="teal.50">
                    <Tr>
                      <Th>Description</Th>
                      <Th isNumeric>Qty</Th>
                      <Th isNumeric>Rate</Th>
                      <Th isNumeric>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(previewQuotation.items || [{ description: previewQuotation.productName || "Product", quantity: 1, unitPrice: previewQuotation.finalAmount || 0, total: previewQuotation.finalAmount || 0 }]).map((it, i) => (
                      <Tr key={i}>
                        <Td fontSize="xs">{it.description}</Td>
                        <Td fontSize="xs" isNumeric>{it.quantity || 1}</Td>
                        <Td fontSize="xs" isNumeric>INR {Number(it.unitPrice || 0).toLocaleString("en-IN")}</Td>
                        <Td fontSize="xs" isNumeric fontWeight="bold">INR {Number(it.total || 0).toLocaleString("en-IN")}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Flex justify="flex-end" pt={2}>
                  <VStack align="stretch" w="220px" spacing={1}>
                    <Flex justify="space-between" fontSize="xs">
                      <Text color="gray.600">Discount:</Text>
                      <Text fontWeight="medium" color="red.500">- INR {Number(previewQuotation.discount || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="xs">
                      <Text color="gray.600">Tax / GST:</Text>
                      <Text fontWeight="medium">+ INR {Number(previewQuotation.tax || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="sm" fontWeight="bold" color="teal.800" pt={2} borderTop="1px solid" borderColor="gray.200">
                      <Text>Final Total:</Text>
                      <Text>INR {Number(previewQuotation.finalAmount || previewQuotation.totalAmount || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                  </VStack>
                </Flex>

                <Box bg="teal.50" p={3} borderRadius="md">
                  <Text fontSize="2xs" fontWeight="bold" color="teal.800">Terms & Conditions:</Text>
                  <Text fontSize="2xs" color="gray.700">{previewQuotation.notes || "Standard RightTouch warranty and service terms apply."}</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button size="sm" mr={3} onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
            <Button size="sm" colorScheme="teal" bg={customColor} leftIcon={<FaPaperPlane />} onClick={() => {
              setIsPreviewModalOpen(false);
              if (previewQuotation) handleSendQuotation(previewQuotation._id || previewQuotation.id);
            }}>
              Send Quotation to Customer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* CREATE / PREPARE QUOTATION MODAL */}
      <Modal isOpen={isQuotationModalOpen} onClose={() => setIsQuotationModalOpen(false)} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="18px" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="teal.100">
          <ModalHeader bg="teal.700" color="white" p="18px 24px" position="relative" borderTopRadius="18px">
            <Flex align="center" justify="space-between" pr="48px">
              <HStack spacing="12px">
                <Flex w="40px" h="40px" bg="teal.500" color="white" borderRadius="12px" align="center" justify="center" shadow="md">
                  <Icon as={FaFileContract} w="20px" h="20px" />
                </Flex>
                <Box>
                  <Heading size="sm" color="white" fontWeight="bold">
                    {selectedQuotationItem ? "Edit Quotation Draft" : "Prepare Official Product Quotation"}
                  </Heading>
                  <Text fontSize="xs" color="teal.100" mt="2px">
                    Money parameters are auto-calculated into integer paise per Postman API specs.
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="teal" bg="teal.500" color="white" px="10px" py="4px" borderRadius="8px" fontSize="2xs" fontWeight="bold">
                ADMIN BUILDER
              </Badge>
            </Flex>
            <ModalCloseButton color="white" position="absolute" top="18px" right="18px" zIndex={10} borderRadius="8px" />
          </ModalHeader>

          <ModalBody p="20px" bg="gray.50">
            <VStack spacing={4} align="stretch">
              
              {/* REQUESTED PRODUCT & CUSTOMER REQUIREMENT DOSSIER */}
              <Box bg="white" p={4} borderRadius="14px" border="1px solid" borderColor="teal.200" boxShadow="sm">
                <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                  <HStack spacing={2}>
                    <Icon as={FaBox} color="teal.600" w="14px" h="14px" />
                    <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase">
                      Requested Product & Requirement Dossier
                    </Text>
                  </HStack>
                  <Badge colorScheme="teal" borderRadius="8px" px={2.5} py={1} fontSize="3xs" fontWeight="bold">
                    QTY: {quotationForm.items?.[0]?.quantity || 1} UNIT(S)
                  </Badge>
                </Flex>

                <Flex direction={{ base: "column", sm: "row" }} gap={3} align="flex-start">
                  {quotationForm.productImage ? (
                    <Image
                      src={quotationForm.productImage}
                      alt={quotationForm.productName || "Product"}
                      boxSize="64px"
                      objectFit="cover"
                      borderRadius="10px"
                      border="1px solid"
                      borderColor="gray.200"
                      flexShrink={0}
                    />
                  ) : (
                    <Flex w="64px" h="64px" bg="teal.50" color="teal.600" borderRadius="10px" border="1px solid" borderColor="teal.200" align="center" justify="center" flexShrink={0}>
                      <Icon as={FaBox} w="28px" h="28px" />
                    </Flex>
                  )}

                  <VStack align="stretch" spacing={2} flex={1} w="100%">
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.800" lineHeight="tight">
                        {quotationForm.productName || quotationForm.items?.[0]?.description || "Appliance Product Supply & Service"}
                      </Text>
                      <HStack spacing={2} mt={1} fontSize="2xs" color="gray.500" wrap="wrap">
                        {quotationForm.productCategory && quotationForm.productCategory !== "—" && (
                          <Badge colorScheme="gray" borderRadius="6px" fontSize="3xs">
                            {quotationForm.productCategory}
                          </Badge>
                        )}
                        {quotationForm.productModel && quotationForm.productModel !== "—" && (
                          <Text color="gray.600">Model: <strong>{quotationForm.productModel}</strong></Text>
                        )}
                      </HStack>
                    </Box>

                    {/* Customer Requirement Description */}
                    {quotationForm.requirementNotes && quotationForm.requirementNotes !== "—" && (
                      <Box bg="yellow.50" p={2.5} borderRadius="8px" border="1px solid" borderColor="yellow.200">
                        <Text fontSize="3xs" fontWeight="bold" color="yellow.800" textTransform="uppercase" mb={0.5}>
                          📝 Customer Requirement Description / Notes:
                        </Text>
                        <Text fontSize="xs" color="gray.700" fontStyle="italic">
                          "{quotationForm.requirementNotes}"
                        </Text>
                      </Box>
                    )}

                    {/* Delivery / Location */}
                    {quotationForm.customerAddress && quotationForm.customerAddress !== "—" && (
                      <HStack spacing={1.5} fontSize="2xs" color="gray.600">
                        <Icon as={FaMapMarkerAlt} color="red.500" w="12px" h="12px" />
                        <Text fontSize="2xs" color="gray.700">
                          <strong>Service Location:</strong> {quotationForm.customerAddress}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Flex>
              </Box>

              {/* CUSTOMER DOSSIER SUMMARY */}
              <Box bg="white" p={4} borderRadius="14px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase" mb={3}>
                  Customer & Request Context
                </Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Customer Name</FormLabel>
                    <Input
                      size="sm"
                      borderRadius="8px"
                      value={quotationForm.customerName || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, customerName: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Contact Phone</FormLabel>
                    <Input
                      size="sm"
                      borderRadius="8px"
                      value={quotationForm.customerPhone || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, customerPhone: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Customer Email</FormLabel>
                    <Input
                      size="sm"
                      borderRadius="8px"
                      value={quotationForm.customerEmail || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, customerEmail: e.target.value })}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* FINANCIAL CALCULATOR SNAPSHOT */}
              <Box bg="white" p={4} borderRadius="14px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase">
                    Line Items & Financial Calculator (INR ₹)
                  </Text>
                  <Badge colorScheme="teal" variant="subtle" borderRadius="8px" fontSize="3xs">AUTO-CALCULATING</Badge>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Unit Price (₹)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      borderRadius="8px"
                      fontWeight="bold"
                      color="teal.700"
                      value={sanitizeInputValue(quotationForm.items?.[0]?.unitPrice)}
                      onChange={(e) => recalculateQuotationForm({ items: [{ ...(quotationForm.items?.[0] || {}), unitPrice: e.target.value }] })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Quantity (Units)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      min={1}
                      borderRadius="8px"
                      value={sanitizeInputValue(quotationForm.items?.[0]?.quantity)}
                      onChange={(e) => recalculateQuotationForm({ items: [{ ...(quotationForm.items?.[0] || {}), quantity: e.target.value }] })}
                    />
                  </FormControl>

                  {/* DISCOUNT INPUT WITH PERCENTAGE (%) OR RUPEES (₹) TOGGLE */}
                  <FormControl gridColumn={{ base: "span 1", md: "span 2" }} bg="teal.50/50" p={3} borderRadius="10px" border="1px solid" borderColor="teal.100">
                    <Flex justify="space-between" align="center" mb={2}>
                      <FormLabel fontSize="2xs" fontWeight="bold" color="teal.900" mb={0}>
                        Discount Settings
                      </FormLabel>
                      <HStack spacing={1}>
                        <Button
                          size="xs"
                          height="22px"
                          fontSize="3xs"
                          borderRadius="6px"
                          colorScheme={quotationForm.discountType === "percent" ? "teal" : "gray"}
                          variant={quotationForm.discountType === "percent" ? "solid" : "outline"}
                          onClick={() => {
                            setQuotationForm({ ...quotationForm, discountType: "percent" });
                            recalculateQuotationForm({ discountType: "percent" });
                          }}
                        >
                          Percentage (%)
                        </Button>
                        <Button
                          size="xs"
                          height="22px"
                          fontSize="3xs"
                          borderRadius="6px"
                          colorScheme={quotationForm.discountType === "flat" ? "teal" : "gray"}
                          variant={quotationForm.discountType === "flat" ? "solid" : "outline"}
                          onClick={() => {
                            setQuotationForm({ ...quotationForm, discountType: "flat" });
                            recalculateQuotationForm({ discountType: "flat" });
                          }}
                        >
                          Flat Amount (₹)
                        </Button>
                      </HStack>
                    </Flex>

                    {quotationForm.discountType === "flat" ? (
                      <Input
                        size="sm"
                        type="number"
                        min={0}
                        borderRadius="8px"
                        bg="white"
                        placeholder="Discount in Rupees (e.g. 500)"
                        value={sanitizeInputValue(quotationForm.discountInput ?? quotationForm.discount)}
                        onChange={(e) => recalculateQuotationForm({ discountInput: e.target.value, discount: e.target.value })}
                      />
                    ) : (
                      <HStack spacing={1.5} wrap="wrap">
                        {[0, 5, 10, 15, 20].map((pct) => (
                          <Button
                            key={pct}
                            size="2xs"
                            height="24px"
                            fontSize="3xs"
                            borderRadius="6px"
                            colorScheme={quotationForm.discountPercent === pct ? "teal" : "gray"}
                            variant={quotationForm.discountPercent === pct ? "solid" : "outline"}
                            onClick={() => recalculateQuotationForm({ discountPercent: pct, customDiscountInput: "" })}
                          >
                            {pct}%
                          </Button>
                        ))}
                        <Input
                          size="xs"
                          height="24px"
                          type="number"
                          min={0}
                          max={100}
                          maxW="140px"
                          borderRadius="8px"
                          bg="white"
                          placeholder="Custom %"
                          value={quotationForm.customDiscountInput || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuotationForm({ ...quotationForm, customDiscountInput: e.target.value });
                            recalculateQuotationForm({ discountPercent: val });
                          }}
                        />
                      </HStack>
                    )}
                  </FormControl>

                  {/* GST TAX SETTINGS */}
                  <FormControl gridColumn={{ base: "span 1", md: "span 2" }} bg="gray.50" p={3} borderRadius="10px" border="1px solid" borderColor="gray.200">
                    <Flex justify="space-between" align="center" mb={2}>
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.700" mb={0}>
                        GST Tax Rate (%)
                      </FormLabel>
                      <Badge colorScheme="gray" borderRadius="6px" fontSize="3xs">CURRENT: {quotationForm.gstPercent || 0}%</Badge>
                    </Flex>

                    <HStack spacing={1.5} wrap="wrap">
                      {[0, 5, 12, 18, 28].map((gst) => (
                        <Button
                          key={gst}
                          size="2xs"
                          height="24px"
                          fontSize="3xs"
                          borderRadius="6px"
                          colorScheme={quotationForm.gstPercent === gst ? "teal" : "gray"}
                          variant={quotationForm.gstPercent === gst ? "solid" : "outline"}
                          onClick={() => recalculateQuotationForm({ gstPercent: gst, customGstInput: "" })}
                        >
                          {gst}%
                        </Button>
                      ))}
                      <Input
                        size="xs"
                        height="24px"
                        type="number"
                        min={0}
                        max={100}
                        maxW="140px"
                        borderRadius="8px"
                        bg="white"
                        placeholder="Custom %"
                        value={quotationForm.customGstInput || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setQuotationForm({ ...quotationForm, customGstInput: e.target.value });
                          recalculateQuotationForm({ gstPercent: val });
                        }}
                      />
                    </HStack>
                  </FormControl>
                </SimpleGrid>

                {/* NET FINANCIAL BREAKDOWN SUMMARY BOX */}
                <Box bg="teal.50" p={3.5} borderRadius="10px" border="1px solid" borderColor="teal.200">
                  <VStack spacing={1.5} align="stretch" fontSize="xs">
                    <Flex justify="space-between" color="gray.700">
                      <Text>Gross Subtotal (Unit Price × Qty):</Text>
                      <Text fontWeight="semibold">₹{((quotationForm.items?.[0]?.unitPrice || 0) * (quotationForm.items?.[0]?.quantity || 1)).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Flex justify="space-between" color="teal.700">
                      <Text>Discount Applied ({quotationForm.discountPercent || 0}%):</Text>
                      <Text fontWeight="bold">- ₹{(quotationForm.discount || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Flex justify="space-between" color="gray.700">
                      <Text>GST Tax ({quotationForm.gstPercent || 0}%):</Text>
                      <Text fontWeight="semibold">+ ₹{(quotationForm.tax || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Box borderTop="1px dashed" borderColor="teal.300" pt={2} mt={1}>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" fontWeight="bold" color="teal.900">Total Net Amount (Calculated in Paise):</Text>
                        <Text fontSize="lg" fontWeight="extrabold" color="teal.800">
                          ₹{(quotationForm.finalAmount || 0).toLocaleString("en-IN")}
                        </Text>
                      </Flex>
                    </Box>
                  </VStack>
                </Box>
              </Box>

              {/* ADMIN MESSAGE BOX */}
              <Box bg="white" p={4} borderRadius="14px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase" mb={2}>
                  💬 Admin Message / Remarks to Customer
                </Text>
                <Textarea
                  size="sm"
                  rows={2}
                  borderRadius="8px"
                  placeholder="Enter personalized note, greetings, or specific offer remarks for the customer..."
                  value={quotationForm.adminMessage || ""}
                  onChange={(e) => setQuotationForm({ ...quotationForm, adminMessage: e.target.value })}
                />
              </Box>

              {/* VALIDITY WINDOW & MULTIPLE TERMS & CONDITIONS WITH "+" ICON */}
              <Box bg="white" p={4} borderRadius="14px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase">
                    Validity Window & Terms & Conditions
                  </Text>
                  <Badge colorScheme="teal" borderRadius="8px" px={2.5} py={1} fontSize="3xs" fontWeight="bold">
                    Default 24 Hours
                  </Badge>
                </Flex>

                <FormControl mb={4}>
                  <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600" mb={2}>
                    Valid Until Date
                  </FormLabel>
                  <Flex direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "center" }} gap={2.5}>
                    <Input
                      size="sm"
                      type="date"
                      borderRadius="8px"
                      w={{ base: "100%", sm: "auto" }}
                      minW="180px"
                      value={quotationForm.validUntil || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, validUntil: e.target.value })}
                    />
                    <HStack spacing={1.5} flexWrap="wrap">
                      <Button
                        size="xs"
                        height="32px"
                        px={3}
                        fontSize="2xs"
                        borderRadius="8px"
                        colorScheme={quotationForm.validUntil === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "teal" : "gray"}
                        variant={quotationForm.validUntil === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "solid" : "outline"}
                        onClick={() => {
                          const d = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setQuotationForm({ ...quotationForm, validUntil: d });
                        }}
                      >
                        24 Hours (1 Day)
                      </Button>
                      <Button
                        size="xs"
                        height="32px"
                        px={3}
                        fontSize="2xs"
                        borderRadius="8px"
                        colorScheme={quotationForm.validUntil === new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0] ? "teal" : "gray"}
                        variant={quotationForm.validUntil === new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0] ? "solid" : "outline"}
                        onClick={() => {
                          const d = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setQuotationForm({ ...quotationForm, validUntil: d });
                        }}
                      >
                        48 Hours
                      </Button>
                      <Button
                        size="xs"
                        height="32px"
                        px={3}
                        fontSize="2xs"
                        borderRadius="8px"
                        colorScheme={quotationForm.validUntil === new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "teal" : "gray"}
                        variant={quotationForm.validUntil === new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "solid" : "outline"}
                        onClick={() => {
                          const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setQuotationForm({ ...quotationForm, validUntil: d });
                        }}
                      >
                        7 Days
                      </Button>
                    </HStack>
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600" mb={2}>
                    Dynamic Terms & Conditions List (Click + to add items)
                  </FormLabel>
                  
                  {/* List of current terms */}
                  <VStack align="stretch" spacing={2} mb={3}>
                    {(quotationForm.termsList || []).map((term, index) => (
                      <HStack key={index} bg="gray.50" p={2} borderRadius="8px" border="1px solid" borderColor="gray.200" justify="space-between">
                        <HStack spacing={2} flex={1}>
                          <Badge colorScheme="teal" borderRadius="6px" px={2} py={0.5} fontSize="3xs">
                            #{index + 1}
                          </Badge>
                          <Text fontSize="xs" color="gray.800">{term}</Text>
                        </HStack>
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Remove term"
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          borderRadius="6px"
                          onClick={() => handleRemoveTerm(index)}
                        />
                      </HStack>
                    ))}
                  </VStack>

                  {/* Add new term input with + icon */}
                  <HStack spacing={2}>
                    <Input
                      size="sm"
                      borderRadius="8px"
                      placeholder="Add a new term or condition (e.g. Free installation included)..."
                      value={quotationForm.newTermText || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, newTermText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTerm();
                        }
                      }}
                    />
                    <IconButton
                      icon={<FaPlus />}
                      aria-label="Add Term"
                      colorScheme="teal"
                      bg={customColor}
                      _hover={{ bg: customColor, filter: "brightness(0.9)" }}
                      size="sm"
                      borderRadius="8px"
                      onClick={handleAddTerm}
                    />
                  </HStack>
                </FormControl>
              </Box>

            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="gray.50" p="16px 24px" borderBottomRadius="18px">
            <Button size="sm" borderRadius="10px" variant="ghost" mr={3} onClick={() => setIsQuotationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              borderRadius="10px"
              colorScheme="gray"
              mr={2}
              isLoading={isSubmittingQuotation}
              onClick={handleSaveQuotation}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              borderRadius="10px"
              colorScheme="teal"
              bg={customColor}
              _hover={{ bg: customColor, filter: "brightness(0.9)" }}
              leftIcon={<FaPaperPlane />}
              isLoading={isSubmittingQuotation}
              onClick={handleSaveAndSendQuotation}
            >
              Save & Send to Customer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* REVISE QUOTATION MODAL */}
      <Modal isOpen={isReviseModalOpen} onClose={() => setIsReviseModalOpen(false)} isCentered size="3xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="0px" overflow="hidden" boxShadow="2xl">
          <ModalHeader bg={customColor} color="white" py={4} px={6} fontSize="md" fontWeight="extrabold" borderRadius="0px">
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={FaRedo} />
                <Text>Revise Quotation #{revisingQuotationItem?.quotationNumber || revisingQuotationItem?._id?.slice?.(-6) || ""}</Text>
              </HStack>
              <Badge colorScheme="whiteAlpha" fontSize="xs" px={2} py={0.5} borderRadius="2px">
                Revision Draft
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" top={4} right={4} />

          <ModalBody py={5} px={6} bg="gray.50">
            <VStack spacing={5} align="stretch">

              {/* REQUESTED PRODUCT & CUSTOMER REQUIREMENT DOSSIER */}
              <Box bg="white" p={4} borderRadius="2px" border="1px solid" borderColor="teal.200" boxShadow="sm">
                <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                  <HStack spacing={2}>
                    <Icon as={FaBox} color="teal.600" w="14px" h="14px" />
                    <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase">
                      Requested Product & Requirement Dossier
                    </Text>
                  </HStack>
                  <Badge colorScheme="teal" borderRadius="2px" px={2} py={0.5} fontSize="3xs" fontWeight="bold">
                    QTY: {quotationForm.items?.[0]?.quantity || 1} UNIT(S)
                  </Badge>
                </Flex>

                <Flex direction={{ base: "column", sm: "row" }} gap={3} align="flex-start">
                  {quotationForm.productImage ? (
                    <Image
                      src={quotationForm.productImage}
                      alt={quotationForm.productName || "Product"}
                      boxSize="64px"
                      objectFit="cover"
                      borderRadius="2px"
                      border="1px solid"
                      borderColor="gray.200"
                      flexShrink={0}
                    />
                  ) : (
                    <Flex w="64px" h="64px" bg="teal.50" color="teal.600" borderRadius="2px" border="1px solid" borderColor="teal.200" align="center" justify="center" flexShrink={0}>
                      <Icon as={FaBox} w="28px" h="28px" />
                    </Flex>
                  )}

                  <VStack align="stretch" spacing={2} flex={1} w="100%">
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.800" lineHeight="tight">
                        {quotationForm.productName || quotationForm.items?.[0]?.description || "Appliance Product Supply & Service"}
                      </Text>
                      <HStack spacing={2} mt={1} fontSize="2xs" color="gray.500" wrap="wrap">
                        {quotationForm.productCategory && quotationForm.productCategory !== "—" && (
                          <Badge colorScheme="gray" borderRadius="2px" fontSize="3xs">
                            {quotationForm.productCategory}
                          </Badge>
                        )}
                        {quotationForm.productModel && quotationForm.productModel !== "—" && (
                          <Text color="gray.600">Model: <strong>{quotationForm.productModel}</strong></Text>
                        )}
                      </HStack>
                    </Box>

                    {/* Customer Requirement Description */}
                    {quotationForm.requirementNotes && quotationForm.requirementNotes !== "—" && (
                      <Box bg="yellow.50" p={2.5} borderRadius="2px" border="1px solid" borderColor="yellow.200">
                        <Text fontSize="3xs" fontWeight="bold" color="yellow.800" textTransform="uppercase" mb={0.5}>
                          📝 Customer Requirement Description / Notes:
                        </Text>
                        <Text fontSize="xs" color="gray.700" fontStyle="italic">
                          "{quotationForm.requirementNotes}"
                        </Text>
                      </Box>
                    )}

                    {/* Delivery / Location */}
                    {quotationForm.customerAddress && quotationForm.customerAddress !== "—" && (
                      <HStack spacing={1.5} fontSize="2xs" color="gray.600">
                        <Icon as={FaMapMarkerAlt} color="red.500" w="12px" h="12px" />
                        <Text fontSize="2xs" color="gray.700">
                          <strong>Service Location:</strong> {quotationForm.customerAddress}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Flex>
              </Box>

              {/* FINANCIAL PRICING & GST CONTROLS */}
              <Box bg="white" p={4} borderRadius="2px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase" mb={3}>
                  💰 Revised Financial Calculations & Tax Settings
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Unit Price (₹)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      borderRadius="2px"
                      fontWeight="bold"
                      color="teal.700"
                      value={sanitizeInputValue(quotationForm.items?.[0]?.unitPrice)}
                      onChange={(e) => recalculateQuotationForm({ items: [{ ...(quotationForm.items?.[0] || {}), unitPrice: e.target.value }] })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600">Quantity (Units)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      min={1}
                      borderRadius="2px"
                      value={sanitizeInputValue(quotationForm.items?.[0]?.quantity)}
                      onChange={(e) => recalculateQuotationForm({ items: [{ ...(quotationForm.items?.[0] || {}), quantity: e.target.value }] })}
                    />
                  </FormControl>

                  {/* DISCOUNT INPUT WITH PERCENTAGE (%) OR RUPEES (₹) TOGGLE */}
                  <FormControl gridColumn={{ base: "span 1", md: "span 2" }} bg="teal.50/50" p={3} borderRadius="2px" border="1px solid" borderColor="teal.100">
                    <Flex justify="space-between" align="center" mb={2}>
                      <FormLabel fontSize="2xs" fontWeight="bold" color="teal.900" mb={0}>
                        Discount Settings
                      </FormLabel>
                      <HStack spacing={1}>
                        <Button
                          size="xs"
                          height="22px"
                          fontSize="3xs"
                          borderRadius="2px"
                          colorScheme={quotationForm.discountMode === "percent" ? "teal" : "gray"}
                          variant={quotationForm.discountMode === "percent" ? "solid" : "outline"}
                          onClick={() => recalculateQuotationForm({ discountMode: "percent" })}
                        >
                          Percentage (%)
                        </Button>
                        <Button
                          size="xs"
                          height="22px"
                          fontSize="3xs"
                          borderRadius="2px"
                          colorScheme={quotationForm.discountMode === "amount" ? "teal" : "gray"}
                          variant={quotationForm.discountMode === "amount" ? "solid" : "outline"}
                          onClick={() => recalculateQuotationForm({ discountMode: "amount" })}
                        >
                          Amount (₹)
                        </Button>
                      </HStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <Box>
                        <FormLabel fontSize="3xs" color="gray.600">
                          Discount in Percentage (%) {quotationForm.discountMode === "amount" && "(Auto-calculated)"}
                        </FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          min={0}
                          max={100}
                          borderRadius="2px"
                          bg={quotationForm.discountMode === "percent" ? "white" : "gray.100"}
                          isReadOnly={quotationForm.discountMode !== "percent"}
                          placeholder="e.g. 10%"
                          value={sanitizeInputValue(quotationForm.discountPercent)}
                          onChange={(e) => recalculateQuotationForm({ discountPercent: e.target.value, discountMode: "percent" })}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize="3xs" color="gray.600">
                          Discount in Rupees (₹) {quotationForm.discountMode === "percent" && "(Auto-calculated)"}
                        </FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          min={0}
                          borderRadius="2px"
                          bg={quotationForm.discountMode === "amount" ? "white" : "gray.100"}
                          isReadOnly={quotationForm.discountMode !== "amount"}
                          placeholder="e.g. ₹500"
                          value={sanitizeInputValue(quotationForm.discount)}
                          onChange={(e) => recalculateQuotationForm({ discount: e.target.value, discountMode: "amount" })}
                        />
                      </Box>
                    </SimpleGrid>
                  </FormControl>

                  {/* GST CUSTOM INPUT & PRESETS */}
                  <FormControl gridColumn={{ base: "span 1", md: "span 2" }} bg="gray.50" p={3} borderRadius="2px" border="1px solid" borderColor="gray.200">
                    <Flex justify="space-between" align="center" mb={2}>
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.700" mb={0}>
                        GST Tax Rate (%)
                      </FormLabel>
                      <HStack spacing={1}>
                        {[0, 5, 12, 18, 28].map((pct) => (
                          <Button
                            key={pct}
                            size="xs"
                            height="20px"
                            fontSize="3xs"
                            borderRadius="2px"
                            colorScheme={quotationForm.gstPercent === pct && !quotationForm.isCustomGst ? "teal" : "gray"}
                            onClick={() => recalculateQuotationForm({ gstPercent: pct, isCustomGst: false, customGstInput: String(pct) })}
                          >
                            {pct}%
                          </Button>
                        ))}
                      </HStack>
                    </Flex>
                    
                    <HStack spacing={3}>
                      <Select
                        size="sm"
                        borderRadius="2px"
                        bg="white"
                        value={quotationForm.isCustomGst ? "custom" : quotationForm.gstPercent}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setQuotationForm({ ...quotationForm, isCustomGst: true });
                          } else {
                            const val = Number(e.target.value);
                            recalculateQuotationForm({ gstPercent: val, isCustomGst: false, customGstInput: String(val) });
                          }
                        }}
                      >
                        <option value={0}>0% (Tax Exempt)</option>
                        <option value={5}>5% (Standard Goods)</option>
                        <option value={12}>12% (Commercial Products)</option>
                        <option value={18}>18% (Hardware & Services)</option>
                        <option value={28}>28% (Luxury Appliances)</option>
                        <option value="custom">Custom GST %</option>
                      </Select>

                      {quotationForm.isCustomGst && (
                        <Input
                          size="sm"
                          type="number"
                          min={0}
                          max={100}
                          maxW="140px"
                          borderRadius="2px"
                          bg="white"
                          placeholder="Custom %"
                          value={quotationForm.customGstInput || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuotationForm({ ...quotationForm, customGstInput: e.target.value });
                            recalculateQuotationForm({ gstPercent: val });
                          }}
                        />
                      )}
                    </HStack>
                  </FormControl>
                </SimpleGrid>

                {/* NET FINANCIAL BREAKDOWN SUMMARY BOX */}
                <Box bg="teal.50" p={3.5} borderRadius="2px" border="1px solid" borderColor="teal.200">
                  <VStack spacing={1.5} align="stretch" fontSize="xs">
                    <Flex justify="space-between" color="gray.700">
                      <Text>Gross Subtotal (Unit Price × Qty):</Text>
                      <Text fontWeight="semibold">₹{((quotationForm.items?.[0]?.unitPrice || 0) * (quotationForm.items?.[0]?.quantity || 1)).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Flex justify="space-between" color="teal.700">
                      <Text>Discount Applied ({quotationForm.discountPercent || 0}%):</Text>
                      <Text fontWeight="bold">- ₹{(quotationForm.discount || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Flex justify="space-between" color="gray.700">
                      <Text>GST Tax ({quotationForm.gstPercent || 0}%):</Text>
                      <Text fontWeight="semibold">+ ₹{(quotationForm.tax || 0).toLocaleString("en-IN")}</Text>
                    </Flex>
                    <Box borderTop="1px dashed" borderColor="teal.300" pt={2} mt={1}>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" fontWeight="bold" color="teal.900">Revised Total Net Amount:</Text>
                        <Text fontSize="lg" fontWeight="extrabold" color="teal.800">
                          ₹{(quotationForm.finalAmount || 0).toLocaleString("en-IN")}
                        </Text>
                      </Flex>
                    </Box>
                  </VStack>
                </Box>
              </Box>

              {/* ADMIN MESSAGE BOX */}
              <Box bg="white" p={4} borderRadius="2px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase" mb={2}>
                  💬 Admin Message / Remarks to Customer
                </Text>
                <Textarea
                  size="sm"
                  rows={2}
                  borderRadius="2px"
                  placeholder="Enter personalized note, greetings, or specific offer remarks for the customer..."
                  value={quotationForm.adminMessage || ""}
                  onChange={(e) => setQuotationForm({ ...quotationForm, adminMessage: e.target.value })}
                />
              </Box>

              {/* VALIDITY WINDOW & MULTIPLE TERMS & CONDITIONS WITH "+" ICON */}
              <Box bg="white" p={4} borderRadius="2px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="xs" fontWeight="bold" color="teal.800" textTransform="uppercase">
                    Validity Window & Terms & Conditions
                  </Text>
                  <Badge colorScheme="teal" borderRadius="2px" px={2} py={0.5} fontSize="3xs">
                    Default 24 Hours
                  </Badge>
                </Flex>

                <FormControl mb={4}>
                  <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600" mb={2}>
                    Valid Until Date
                  </FormLabel>
                  <Flex direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "center" }} gap={2.5}>
                    <Input
                      size="sm"
                      type="date"
                      borderRadius="8px"
                      w={{ base: "100%", sm: "auto" }}
                      minW="180px"
                      value={quotationForm.validUntil || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, validUntil: e.target.value })}
                    />
                    <HStack spacing={1.5} flexWrap="wrap">
                      <Button
                        size="xs"
                        height="32px"
                        px={3}
                        fontSize="2xs"
                        borderRadius="8px"
                        colorScheme={quotationForm.validUntil === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "teal" : "gray"}
                        variant={quotationForm.validUntil === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "solid" : "outline"}
                        onClick={() => {
                          const d = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setQuotationForm({ ...quotationForm, validUntil: d });
                        }}
                      >
                        24 Hours (1 Day)
                      </Button>
                      <Button
                        size="xs"
                        height="32px"
                        px={3}
                        fontSize="2xs"
                        borderRadius="8px"
                        colorScheme={quotationForm.validUntil === new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0] ? "teal" : "gray"}
                        variant={quotationForm.validUntil === new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0] ? "solid" : "outline"}
                        onClick={() => {
                          const d = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setQuotationForm({ ...quotationForm, validUntil: d });
                        }}
                      >
                        48 Hours
                      </Button>
                      <Button
                        size="xs"
                        height="32px"
                        px={3}
                        fontSize="2xs"
                        borderRadius="8px"
                        colorScheme={quotationForm.validUntil === new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "teal" : "gray"}
                        variant={quotationForm.validUntil === new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "solid" : "outline"}
                        onClick={() => {
                          const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setQuotationForm({ ...quotationForm, validUntil: d });
                        }}
                      >
                        7 Days
                      </Button>
                    </HStack>
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="2xs" fontWeight="bold" color="gray.600" mb={2}>
                    Dynamic Terms & Conditions List (Click + to add items)
                  </FormLabel>
                  
                  {/* List of current terms */}
                  <VStack align="stretch" spacing={2} mb={3}>
                    {(quotationForm.termsList || []).map((term, index) => (
                      <HStack key={index} bg="gray.50" p={2} borderRadius="2px" border="1px solid" borderColor="gray.200" justify="space-between">
                        <HStack spacing={2} flex={1}>
                          <Badge colorScheme="teal" borderRadius="2px" px={2} py={0.5} fontSize="3xs">
                            #{index + 1}
                          </Badge>
                          <Text fontSize="xs" color="gray.800">{term}</Text>
                        </HStack>
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Remove term"
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveTerm(index)}
                        />
                      </HStack>
                    ))}
                  </VStack>

                  {/* Add new term input with + icon */}
                  <HStack spacing={2}>
                    <Input
                      size="sm"
                      borderRadius="2px"
                      placeholder="Add a new term or condition (e.g. Free installation included)..."
                      value={quotationForm.newTermText || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, newTermText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTerm();
                        }
                      }}
                    />
                    <IconButton
                      icon={<FaPlus />}
                      aria-label="Add Term"
                      colorScheme="teal"
                      bg={customColor}
                      _hover={{ bg: customColor, filter: "brightness(0.9)" }}
                      size="sm"
                      borderRadius="2px"
                      onClick={handleAddTerm}
                    />
                  </HStack>
                </FormControl>
              </Box>

            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.100" py={3.5} px={6} borderTop="1px solid" borderColor="gray.200" borderRadius="0px">
            <Button size="sm" borderRadius="2px" variant="ghost" mr={3} onClick={() => setIsReviseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              borderRadius="2px"
              colorScheme="teal"
              bg={customColor}
              _hover={{ bg: customColor, filter: "brightness(0.9)" }}
              leftIcon={<FaPaperPlane />}
              isLoading={isSubmittingRevise}
              onClick={handleConfirmRevise}
            >
              Create Revised Quotation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* STOCK ADJUSTMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg={customColor} color="white" py={3} borderTopRadius="xl" fontSize="sm">
            📦 Stock Inventory Adjustment — {selectedStockProduct?.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Adjustment Mode</FormLabel>
                <Select
                  size="sm"
                  value={stockForm.changeType}
                  onChange={(e) => setStockForm({ ...stockForm, changeType: e.target.value })}
                >
                  <option value="set">Set Absolute Quantity</option>
                  <option value="increase">Increase Stock (+ Add)</option>
                  <option value="decrease">Decrease Stock (- Remove)</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">
                  {stockForm.changeType === "set" ? "New Stock Level" : "Quantity to Adjust"}
                </FormLabel>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Audit Reason / Remarks</FormLabel>
                <Textarea
                  size="sm"
                  rows={2}
                  placeholder="Reason for manual stock modification..."
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" py={3} borderBottomRadius="xl">
            <Button size="sm" variant="ghost" mr={2} onClick={() => setStockModalOpen(false)}>Cancel</Button>
            <Button size="sm" colorScheme="teal" bg={customColor} isLoading={isSubmittingStock} onClick={handleSaveStockAdjustment}>
              Save Adjustment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* STOCK HISTORY MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal isOpen={stockHistoryModalOpen} onClose={() => setStockHistoryModalOpen(false)} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg={customColor} color="white" py={3} borderTopRadius="xl" fontSize="sm">
            📜 Stock Movement Logs — {selectedStockProduct?.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            {isLoadingStockHistory ? (
              <Center p={6}><Spinner color={customColor} /></Center>
            ) : stockHistoryLogs.length === 0 ? (
              <Center p={6}><Text fontSize="xs" color="gray.500">No previous stock movements recorded.</Text></Center>
            ) : (
              <Table variant="simple" size="sm">
                <Thead bg="gray.100">
                  <Tr>
                    <Th fontSize="2xs">Date</Th>
                    <Th fontSize="2xs">Change</Th>
                    <Th fontSize="2xs">New Qty</Th>
                    <Th fontSize="2xs">Reason</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stockHistoryLogs.map((log, idx) => (
                    <Tr key={idx}>
                      <Td fontSize="xs">{new Date(log.createdAt || Date.now()).toLocaleDateString()}</Td>
                      <Td fontSize="xs" fontWeight="bold" color={log.change > 0 ? "green.600" : "red.600"}>
                        {log.change > 0 ? `+${log.change}` : log.change}
                      </Td>
                      <Td fontSize="xs" fontWeight="extrabold">{log.newQuantity}</Td>
                      <Td fontSize="xs" color="gray.600">{log.reason || "N/A"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50" py={3} borderBottomRadius="xl">
            <Button size="sm" colorScheme="teal" onClick={() => setStockHistoryModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* PAYMENT DETAILS & ATTEMPTS MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal isOpen={paymentDetailModalOpen} onClose={() => setPaymentDetailModalOpen(false)} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg="purple.600" color="white" py={3} borderTopRadius="xl" fontSize="sm">
            💳 Payment Details & Gateways Log
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            {isLoadingPaymentDetail ? (
              <Center p={6}><Spinner color="purple.500" /></Center>
            ) : (
              <VStack align="stretch" spacing={3} fontSize="xs">
                <Card p={3} bg="purple.50" border="1px solid" borderColor="purple.200">
                  <VStack align="stretch" spacing={1}>
                    <Flex justify="space-between"><Text fontWeight="bold">Reference ID:</Text><Text fontFamily="mono" color="purple.800">{selectedPaymentDetail?.reference || "N/A"}</Text></Flex>
                    <Flex justify="space-between"><Text fontWeight="bold">Customer Name:</Text><Text>{selectedPaymentDetail?.customerName || "N/A"}</Text></Flex>
                    <Flex justify="space-between"><Text fontWeight="bold">Razorpay Payment ID:</Text><Text fontFamily="mono">{selectedPaymentDetail?.razorpayPaymentId || "N/A"}</Text></Flex>
                    <Flex justify="space-between"><Text fontWeight="bold">Razorpay Order ID:</Text><Text fontFamily="mono">{selectedPaymentDetail?.razorpayOrderId || "N/A"}</Text></Flex>
                  </VStack>
                </Card>
                {razorpayPaymentDetails && (
                  <Card p={3} bg="gray.50">
                    <Text fontWeight="bold" color="gray.700" mb={1}>Gateway Payload Status:</Text>
                    <Text fontSize="2xs" fontFamily="mono" color="gray.800">{JSON.stringify(razorpayPaymentDetails, null, 2)}</Text>
                  </Card>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50" py={3} borderBottomRadius="xl">
            <Button size="sm" colorScheme="purple" onClick={() => setPaymentDetailModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* RECONCILE MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal isOpen={reconcileModalOpen} onClose={() => setReconcileModalOpen(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg="teal.600" color="white" py={3} borderTopRadius="xl" fontSize="sm">
            ⚖️ Manual Payment Reconciliation
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Target Booking ID</FormLabel>
                <Input
                  size="sm"
                  placeholder="Enter Booking ID to match..."
                  value={reconcileForm.matchedBookingId}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, matchedBookingId: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Reconciliation Note</FormLabel>
                <Textarea
                  size="sm"
                  rows={2}
                  value={reconcileForm.notes}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, notes: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" py={3} borderBottomRadius="xl">
            <Button size="sm" variant="ghost" mr={2} onClick={() => setReconcileModalOpen(false)}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={isSubmittingReconcile} onClick={handleExecuteReconcile}>
              Execute Reconcile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Flex>
  );
}
