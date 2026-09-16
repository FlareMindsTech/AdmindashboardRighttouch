import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  Textarea,
  FormControl,
  FormLabel,
  useDisclosure,
  Alert,
  AlertIcon,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  TagLabel,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaWallet,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaLock,
  FaUnlock,
  FaCog,
  FaMoneyBillWave,
  FaPercentage,
  FaSearch,
  FaBook,
  FaUserCheck,
  FaExchangeAlt,
  FaEdit,
  FaUniversity,
  FaPhoneAlt,
  FaChevronDown,
  FaDownload,
  FaPrint,
  FaClock,
  FaShieldAlt,
  FaRedo,
  FaFilter,
  FaInfoCircle,
  FaFileInvoice,
} from "react-icons/fa";
import { MdSend, MdCheck, MdClose, MdPayment, MdReceipt, MdWarning, MdRefresh } from "react-icons/md";

import {
  getAdminWalletSummary,
  getAllWithdrawalRequests,
  getAutoPayoutSummary,
  getAutoPayoutSettings,
  updateAutoPayoutSettings,
  approveWithdrawal,
  rejectWithdrawal,
  payWithdrawal,
  sendMoneyToTechnician,
  approveAdminManualPayout,
  resolveManualReviewPayout,
  freezeTechnicianPayouts,
  retryFailedPayout,
  exportWithdrawalsCSV,
  getWithdrawalDetails,
  getWithdrawalReceipt,
  getAuditLogs,
  getAllServiceCommissions,
  setServiceCommission,
  getAllTechniciansForFinance,
  getFinanceSummary,
  getAllServiceBooking,
  updateTechnicianBankDetails,
  updateTechnicianStatus,
} from "../utils/axiosInstance";

const BRAND_COLOR = "#008080";
const DUAL_APPROVAL_THRESHOLD = 50000; // ₹50,000 threshold for second admin approval

// Helper to safely format Technician Name
const formatTechName = (item) => {
  if (!item) return "Technician";
  if (typeof item.technicianName === "string" && item.technicianName) return item.technicianName;

  const tech = item.technicianId || item.technician || item.userId || item;
  if (typeof tech === "string") return tech;
  if (typeof tech === "object" && tech !== null) {
    if (typeof tech.name === "string" && tech.name) return tech.name;
    if (typeof tech.fname === "string" && tech.fname) {
      return tech.lname ? `${tech.fname} ${tech.lname}` : tech.fname;
    }
    if (tech.userId && typeof tech.userId === "object" && tech.userId !== null) {
      if (typeof tech.userId.name === "string" && tech.userId.name) return tech.userId.name;
      if (typeof tech.userId.fname === "string" && tech.userId.fname) {
        return tech.userId.lname ? `${tech.userId.fname} ${tech.userId.lname}` : tech.userId.fname;
      }
      if (typeof tech.userId.mobileNumber === "string") return tech.userId.mobileNumber;
    }
    if (typeof tech.mobileNumber === "string") return tech.mobileNumber;
    if (typeof tech._id === "string") return tech._id;
  }
  return "Technician";
};

// Helper to format Technician Name + Phone Number
const formatTechNameAndPhone = (item) => {
  if (!item) return "Technician";

  let name = "";
  let phone = "";

  if (typeof item === "string") return item;

  if (typeof item.technicianName === "string" && item.technicianName) {
    name = item.technicianName;
  }

  const tech = item.technicianId || item.technician || item.userId || item;
  if (typeof tech === "object" && tech !== null) {
    if (!name) {
      if (typeof tech.name === "string" && tech.name) name = tech.name;
      else if (typeof tech.fname === "string" && tech.fname) {
        name = tech.lname ? `${tech.fname} ${tech.lname}` : tech.fname;
      } else if (tech.userId && typeof tech.userId === "object" && tech.userId !== null) {
        if (typeof tech.userId.name === "string" && tech.userId.name) name = tech.userId.name;
        else if (typeof tech.userId.fname === "string" && tech.userId.fname) {
          name = tech.userId.lname ? `${tech.userId.fname} ${tech.userId.lname}` : tech.userId.fname;
        }
      }
    }

    if (typeof tech.mobileNumber === "string" && tech.mobileNumber) phone = tech.mobileNumber;
    else if (typeof tech.phone === "string" && tech.phone) phone = tech.phone;
    else if (typeof tech.mobile === "string" && tech.mobile) phone = tech.mobile;
    else if (tech.userId && typeof tech.userId === "object" && tech.userId !== null) {
      if (typeof tech.userId.mobileNumber === "string" && tech.userId.mobileNumber) phone = tech.userId.mobileNumber;
      else if (typeof tech.userId.phone === "string" && tech.userId.phone) phone = tech.userId.phone;
    }
  }

  if (!name) name = "Technician";

  let result = name;
  if (phone) result += ` - 📞 ${phone}`;

  return result;
};

// Helper to safely format Technician Phone
const formatTechPhone = (item) => {
  if (!item) return "N/A";
  if (typeof item === "string") return item;

  let phone = "";
  const tech = item.technicianId || item.technician || item.userId || item;
  if (typeof tech === "object" && tech !== null) {
    if (typeof tech.mobileNumber === "string" && tech.mobileNumber) phone = tech.mobileNumber;
    else if (typeof tech.phone === "string" && tech.phone) phone = tech.phone;
    else if (typeof tech.mobile === "string" && tech.mobile) phone = tech.mobile;
    else if (tech.userId && typeof tech.userId === "object" && tech.userId !== null) {
      if (typeof tech.userId.mobileNumber === "string" && tech.userId.mobileNumber) phone = tech.userId.mobileNumber;
      else if (typeof tech.userId.phone === "string" && tech.userId.phone) phone = tech.userId.phone;
    }
  }
  return phone || item.mobileNumber || item.phone || item.mobile || "N/A";
};

// Helper to get technician ID
const getTechId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item._id === "string") return item._id;
  if (typeof item.id === "string") return item.id;
  if (typeof item.userId === "string") return item.userId;
  if (typeof item.userId === "object" && item.userId?._id) return item.userId._id;
  if (typeof item.technicianId === "string") return item.technicianId;
  if (typeof item.technicianId === "object" && item.technicianId?._id) return item.technicianId._id;
  return "";
};

// Helper to safely render IDs
const formatId = (item, defaultKey = "N/A") => {
  if (!item) return defaultKey;
  if (typeof item === "string") return item;
  if (typeof item._id === "string") return item._id;
  if (typeof item.id === "string") return item.id;
  if (typeof item.withdrawalId === "string") return item.withdrawalId;
  return defaultKey;
};

// Helper to infer payout origin
const getPayoutOrigin = (w) => {
  if (!w) return "technician_request";
  if (w.origin === "admin_direct" || w.payoutOrigin === "admin_direct" || w.source === "admin_direct") return "admin_direct";
  if (w.origin === "auto" || w.origin === "auto_payout" || w.isAutoPayout) return "auto";
  if (w.origin === "technician_request") return "technician_request";

  const key = String(w.clientIdempotencyKey || w.idempotencyKey || "");
  if (key.toLowerCase().includes("admin") || key.toLowerCase().includes("direct-payout")) return "admin_direct";
  if (key.toLowerCase().includes("auto")) return "auto";
  return "technician_request";
};

export default function TechnicianPayouts() {
  const textColor = useColorModeValue("gray.700", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.900");
  const tableHeaderBgDark = useColorModeValue("gray.100", "gray.800");
  const borderColorLight = useColorModeValue("gray.100", "gray.700");
  const borderColorMedium = useColorModeValue("gray.200", "gray.700");
  const modalHeaderBg = useColorModeValue("gray.50", "gray.900");
  const hoverTealBg = useColorModeValue("teal.50", "gray.700");
  const hoverPurpleBg = useColorModeValue("purple.50", "gray.700");
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [walletSummary, setWalletSummary] = useState(null);
  const [financeSummaryData, setFinanceSummaryData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [autoSummary, setAutoSummary] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [commissions, setCommissions] = useState([]);

  // Granular Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [techSearchTerm, setTechSearchTerm] = useState("");

  // Details Drawer / Modal State
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const [selectedDetailsWd, setSelectedDetailsWd] = useState(null);
  const [itemizedDetails, setItemizedDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Pay Modal State
  const { isOpen: isPayModalOpen, onOpen: onPayModalOpen, onClose: onPayModalClose } = useDisclosure();
  const [selectedPayWd, setSelectedPayWd] = useState(null);
  const [payNote, setPayNote] = useState("Paid via Razorpay X");
  const [payLoading, setPayLoading] = useState(false);

  // Deduction & Penalty Inputs for Payout & Approval
  const [payPenaltyAmount, setPayPenaltyAmount] = useState("");
  const [payPenaltyReason, setPayPenaltyReason] = useState("");
  const [payCommissionAmount, setPayCommissionAmount] = useState("");
  const [payOtherDeductions, setPayOtherDeductions] = useState("");

  // Standalone Penalty Modal State
  const { isOpen: isPenaltyModalOpen, onOpen: onPenaltyModalOpen, onClose: onPenaltyModalClose } = useDisclosure();
  const [selectedPenaltyItem, setSelectedPenaltyItem] = useState(null);
  const [standalonePenaltyAmt, setStandalonePenaltyAmt] = useState("");
  const [standalonePenaltyReason, setStandalonePenaltyReason] = useState("");
  const [standalonePenaltyLoading, setStandalonePenaltyLoading] = useState(false);

  // Approval Modal State
  const { isOpen: isApproveModalOpen, onOpen: onApproveModalOpen, onClose: onApproveModalClose } = useDisclosure();
  const [selectedApproveWd, setSelectedApproveWd] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);

  // Dual Approval Modal State (Second Admin)
  const { isOpen: isDualApproveOpen, onOpen: onDualApproveOpen, onClose: onDualApproveClose } = useDisclosure();
  const [selectedDualApproveWd, setSelectedDualApproveWd] = useState(null);
  const [dualAdminNote, setDualAdminNote] = useState("Second admin approval verified");
  const [dualApproveLoading, setDualApproveLoading] = useState(false);

  // Retry Failed Payout Modal State
  const { isOpen: isRetryOpen, onOpen: onRetryOpen, onClose: onRetryClose } = useDisclosure();
  const [selectedRetryWd, setSelectedRetryWd] = useState(null);
  const [retryReason, setRetryReason] = useState("Network timeout on previous attempt, retrying gateway POST");
  const [retryLoading, setRetryLoading] = useState(false);

  // Send Money Modal State (Flow B)
  const { isOpen: isSendMoneyOpen, onOpen: onSendMoneyOpen, onClose: onSendMoneyClose } = useDisclosure();
  const [sendMoneyForm, setSendMoneyForm] = useState({
    technicianId: "",
    amount: "",
    payoutMethod: "bank",
    reason: "Manual technician payment",
    clientIdempotencyKey: "",
    isHighAmount: false,
  });
  const [sendMoneyLoading, setSendMoneyLoading] = useState(false);

  // Freeze / Unfreeze Modal State
  const { isOpen: isFreezeModalOpen, onOpen: onFreezeModalOpen, onClose: onFreezeModalClose } = useDisclosure();
  const [selectedFreezeTech, setSelectedFreezeTech] = useState(null);
  const [freezeReason, setFreezeReason] = useState("KYC Issue");
  const [freezeNotes, setFreezeNotes] = useState("");
  const [freezeLoading, setFreezeLoading] = useState(false);

  // Receipt Modal State
  const { isOpen: isReceiptOpen, onOpen: onReceiptOpen, onClose: onReceiptClose } = useDisclosure();
  const [receiptData, setReceiptData] = useState(null);

  // Bank Details Edit Modal State
  const { isOpen: isBankEditOpen, onOpen: onBankEditOpen, onClose: onBankEditClose } = useDisclosure();
  const [editingBankTech, setEditingBankTech] = useState(null);
  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    upiId: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  // Auto-Payout & System Payout Settings Modal State
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const [autoSettings, setAutoSettings] = useState({
    enabled: true,
    threshold: 1000,
    minimumMaintenance: 200,
    autoPayoutCronExpression: "0 */6 * * *",
    minWithdrawalAmount: 100,
    withdrawalCooldownDays: 0,
    dualApprovalThreshold: 50000,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Reconcile Modal State
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const [selectedReviewTx, setSelectedReviewTx] = useState(null);
  const [reviewDecision, setReviewDecision] = useState("complete");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Audit Modal
  const { isOpen: isAuditOpen, onOpen: onAuditOpen, onClose: onAuditClose } = useDisclosure();
  const [selectedAuditTx, setSelectedAuditTx] = useState(null);

  // Commission Modal
  const { isOpen: isCommModalOpen, onOpen: onCommModalOpen, onClose: onCommModalClose } = useDisclosure();
  const [selectedCommService, setSelectedCommService] = useState(null);
  const [commRate, setCommRate] = useState(10);
  const [commLoading, setCommLoading] = useState(false);

  // Technician Bookings & Earnings History Modal
  const { isOpen: isTechHistoryOpen, onOpen: onTechHistoryOpen, onClose: onTechHistoryClose } = useDisclosure();
  const [selectedTechHistory, setSelectedTechHistory] = useState(null);
  const [techHistoryBookings, setTechHistoryBookings] = useState([]);
  const [techHistoryLoading, setTechHistoryLoading] = useState(false);

  // Custom Technician Selector State
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);

  // Comprehensive Bank Details Extraction Helper
  const getTechBankData = useCallback((t) => {
    if (!t) return { hasBank: false, isVerified: false, holder: "", accNum: "", bankName: "", branch: "", ifsc: "", upi: "" };

    const u = (t.userId && typeof t.userId === "object") ? t.userId : {};
    const b =
      t.decryptedBankDetails ||
      t.bankDetails ||
      t.bank ||
      t.bank_details ||
      t.kycDetails?.bankDetails ||
      t.kyc?.bankDetails ||
      t.kyc?.bank ||
      u.decryptedBankDetails ||
      u.bankDetails ||
      u.bank ||
      u.kycDetails?.bankDetails ||
      {};

    let rawAcc =
      b.accountNumber ||
      b.account_number ||
      b.accNum ||
      t.accountNumber ||
      t.account_number ||
      t.accNum ||
      u.accountNumber ||
      u.account_number ||
      "";

    const accNum = String(rawAcc).replace(/^Verified Bank\s*/i, "").replace(/\*/g, "").trim();

    const holder =
      b.accountHolderName ||
      b.account_holder_name ||
      b.holder ||
      t.accountHolderName ||
      t.account_holder_name ||
      u.accountHolderName ||
      formatTechName(t) ||
      "";

    const rawBankName =
      b.bankName ||
      b.bank_name ||
      b.bank ||
      t.bankName ||
      t.bank_name ||
      u.bankName ||
      u.bank_name ||
      "";

    const bankName = String(rawBankName).trim() || (accNum ? "Verified Bank" : "");

    const branch =
      b.branchName ||
      b.branch_name ||
      b.branch ||
      t.branchName ||
      t.branch_name ||
      u.branchName ||
      "";

    const ifsc =
      b.ifscCode ||
      b.ifsc_code ||
      b.ifsc ||
      t.ifscCode ||
      t.ifsc_code ||
      t.ifsc ||
      u.ifscCode ||
      u.ifsc ||
      "";

    const upi =
      b.upiId ||
      b.upi_id ||
      b.upi ||
      t.upiId ||
      t.upi_id ||
      t.upi ||
      u.upiId ||
      u.upi ||
      "";

    const isVerified = Boolean(
      t.isBankVerified ||
      t.bankVerified ||
      t.verified ||
      b.verified ||
      b.isVerified ||
      u.isBankVerified ||
      u.bankVerified ||
      (accNum && ifsc) ||
      upi
    );

    const hasBank = Boolean(accNum || upi || bankName || ifsc || isVerified);

    return {
      accNum,
      holder,
      bankName,
      branch,
      ifsc,
      upi,
      hasBank,
      isVerified,
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [wSummaryRes, withdrawalsRes, aSummaryRes, settingsRes, techRes, commRes, finRes] = await Promise.allSettled([
        getAdminWalletSummary(),
        getAllWithdrawalRequests(),
        getAutoPayoutSummary(),
        getAutoPayoutSettings(),
        getAllTechniciansForFinance(),
        getAllServiceCommissions(),
        getFinanceSummary(),
      ]);

      if (wSummaryRes.status === "fulfilled" && wSummaryRes.value) {
        const val = wSummaryRes.value;
        setWalletSummary(val.summary || val.result || val.data || val);
      }
      if (finRes.status === "fulfilled" && finRes.value) {
        const val = finRes.value;
        setFinanceSummaryData(val.result || val.summary || val.data || val);
      }
      if (withdrawalsRes.status === "fulfilled" && withdrawalsRes.value) {
        const val = withdrawalsRes.value;
        const raw = val.result || val.requests || val.data || val.history || val.withdrawals || val;
        setWithdrawals(Array.isArray(raw) ? raw : []);
      }
      if (aSummaryRes.status === "fulfilled" && aSummaryRes.value) {
        const val = aSummaryRes.value;
        setAutoSummary(val.summary || val.result || val.data || val);
      }
      if (settingsRes.status === "fulfilled" && settingsRes.value) {
        const val = settingsRes.value;
        const s = val.settings || val.result || val.data || val;
        if (s && typeof s === "object") setAutoSettings((prev) => ({ ...prev, ...s }));
      }
      if (techRes.status === "fulfilled" && techRes.value) {
        const val = techRes.value;
        const raw = val.technicians || val.result || val.data || val;
        setTechnicians(Array.isArray(raw) ? raw : []);
      }
      if (commRes.status === "fulfilled" && commRes.value) {
        const val = commRes.value;
        const raw = val.services || val.result || val.commissions || val.data || val;
        setCommissions(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      console.error("Error loading wallet dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute Metrics for 10 Dashboard Cards
  const metrics = useMemo(() => {
    const totalPayoutsAmt = withdrawals.reduce((sum, w) => sum + (typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0)), 0);
    const processingAmt = withdrawals
      .filter((w) => w.status === "processing")
      .reduce((sum, w) => sum + (typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0)), 0);
    const paidAmt = withdrawals
      .filter((w) => w.status === "paid" || w.status === "success" || w.status === "approved" || w.status === "Completed")
      .reduce((sum, w) => sum + (typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0)), 0);
    const failedCount = withdrawals.filter((w) => w.status === "failed").length;
    const manualReviewCount = withdrawals.filter((w) => w.status === "manual_review" || w.requiresReview).length;
    const reservedAmt = Number(walletSummary?.totalReservedBalance || walletSummary?.reservedBalance || 0);
    const payableAmt = Number(walletSummary?.totalAvailableBalance || walletSummary?.totalTechnicianPayable || 0);
    const commEarned = Number(financeSummaryData?.totalCommission || walletSummary?.totalCommissionEarned || 0);
    const autoCount = withdrawals.filter((w) => getPayoutOrigin(w) === "auto").length;
    const adminDirectAmt = withdrawals
      .filter((w) => getPayoutOrigin(w) === "admin_direct")
      .reduce((sum, w) => sum + (typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0)), 0);

    return {
      totalPayoutsAmt,
      processingAmt,
      paidAmt,
      failedCount,
      manualReviewCount,
      reservedAmt,
      payableAmt,
      commEarned,
      autoCount,
      adminDirectAmt,
    };
  }, [withdrawals, walletSummary, financeSummaryData]);

  // Granular Filter Execution
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const techName = formatTechName(w);
      const wId = formatId(w, "");
      const utr = String(w.utr || w.payoutUtr || "");
      const rzpId = String(w.razorpayPayoutId || w.payoutId || "");
      const origin = getPayoutOrigin(w);
      const amountVal = typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0);
      const mode = String(w.payoutMode || w.destinationType || "bank").toLowerCase();

      const bankAcc = (w.bankDetails?.accountNumber || w.accountNumber || w.beneficiaryAccount || "").toString().replace(/[\s-]/g, "");
      const ifsc = (w.bankDetails?.ifscCode || w.ifsc || "").toString().toLowerCase();
      const bankName = (w.bankDetails?.bankName || w.bankName || "").toString().toLowerCase();
      const cleanTerm = searchTerm.toLowerCase().trim().replace(/[\s-]/g, "");

      // Search matching (Tech Name, Phone, ID, UTR, RazorpayX ID, Bank A/C, IFSC, Bank Name)
      const matchesSearch =
        !searchTerm.trim() ||
        techName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        utr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rzpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatTechPhone(w).includes(searchTerm) ||
        (bankAcc && bankAcc.includes(cleanTerm)) ||
        (ifsc && ifsc.includes(searchTerm.toLowerCase())) ||
        (bankName && bankName.includes(searchTerm.toLowerCase()));

      // Status matching
      const matchesStatus = !statusFilter || w.status === statusFilter || (statusFilter === "pending" && (w.status === "requested" || w.status === "pending"));

      // Origin matching
      const matchesOrigin = !originFilter || origin === originFilter;

      // Mode matching
      const matchesMode = !modeFilter || mode.includes(modeFilter.toLowerCase());

      // Amount Range
      const matchesMinAmt = !minAmount || amountVal >= Number(minAmount);
      const matchesMaxAmt = !maxAmount || amountVal <= Number(maxAmount);

      // Date Filtering
      let matchesDate = true;
      if (dateFilter === "today") {
        const todayStr = new Date().toISOString().split("T")[0];
        const wDateStr = new Date(w.createdAt || Date.now()).toISOString().split("T")[0];
        matchesDate = todayStr === wDateStr;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(w.createdAt || Date.now()) >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = new Date(w.createdAt || Date.now()) >= monthAgo;
      } else if (dateFilter === "custom" && startDate && endDate) {
        const wDate = new Date(w.createdAt || Date.now());
        matchesDate = wDate >= new Date(startDate) && wDate <= new Date(endDate);
      }

      return matchesSearch && matchesStatus && matchesOrigin && matchesMode && matchesMinAmt && matchesMaxAmt && matchesDate;
    });
  }, [withdrawals, searchTerm, statusFilter, originFilter, modeFilter, dateFilter, startDate, endDate, minAmount, maxAmount]);

  // Filter technician options for Flow B Modal Search
  const filteredTechOptions = useMemo(() => {
    if (!techSearchTerm.trim()) return technicians;
    const term = techSearchTerm.toLowerCase().trim();
    const cleanTerm = term.replace(/[\s-]/g, "");
    return technicians.filter((t) => {
      const label = formatTechNameAndPhone(t).toLowerCase();
      const bankAcc = (t.bankDetails?.accountNumber || t.accountNumber || t.bankAccountNumber || "").toString().replace(/[\s-]/g, "");
      const ifsc = (t.bankDetails?.ifscCode || t.ifscCode || "").toString().toLowerCase();
      const bankName = (t.bankDetails?.bankName || t.bankName || "").toString().toLowerCase();
      return (
        label.includes(term) ||
        (bankAcc && bankAcc.includes(cleanTerm)) ||
        (ifsc && ifsc.includes(term)) ||
        (bankName && bankName.includes(term))
      );
    });
  }, [technicians, techSearchTerm]);

  // Reset Filters Helper
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setOriginFilter("");
    setModeFilter("");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  // Export CSV Helper
  const handleExportCSV = async () => {
    try {
      toast({ title: "Generating CSV Export...", status: "info", duration: 2000 });
      let csvContent = "";
      try {
        csvContent = await exportWithdrawalsCSV({ status: statusFilter, origin: originFilter, startDate, endDate });
      } catch (e) {
        // Client-side CSV fallback
        const headers = ["Withdrawal ID", "Technician Name", "Phone", "Requested Amount (INR)", "Commission (INR)", "Net Payout (INR)", "Origin", "Mode", "Status", "RazorpayX ID", "UTR", "Created At"];
        const rows = filteredWithdrawals.map((w) => [
          formatId(w),
          formatTechName(w),
          formatTechPhone(w),
          typeof w.amount === "number" ? w.amount : Number(w.amount) || 0,
          w.commissionAmount || 0,
          w.netPayoutAmountPaise ? w.netPayoutAmountPaise / 100 : w.amount,
          getPayoutOrigin(w),
          w.payoutMode || "bank",
          w.status,
          w.razorpayPayoutId || "N/A",
          w.utr || "N/A",
          new Date(w.createdAt || Date.now()).toISOString(),
        ]);
        csvContent = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `RightTouch_Payouts_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "CSV Export Downloaded", description: `${filteredWithdrawals.length} records exported.`, status: "success" });
    } catch (err) {
      toast({ title: "Export Error", description: err.message, status: "error" });
    }
  };

  // Open Details Modal / Drawer with Itemized Payload
  const handleOpenDetails = async (w) => {
    setSelectedDetailsWd(w);
    setItemizedDetails(null);
    onDetailsOpen();
    setDetailsLoading(true);

    try {
      const wId = formatId(w);
      const res = await getWithdrawalDetails(wId);
      setItemizedDetails(res?.result || res?.details || res?.data || null);
    } catch (err) {
      console.log("Using local itemized payload fallback:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open Receipt Modal
  const handleOpenReceipt = async (w) => {
    setSelectedDetailsWd(w);
    onReceiptOpen();
    try {
      const wId = formatId(w);
      const res = await getWithdrawalReceipt(wId);
      setReceiptData(res?.result || res?.receipt || null);
    } catch (err) {
      setReceiptData(null);
    }
  };

  // Open Approval Modal
  const handleOpenApproveModal = (withdrawal) => {
    setSelectedApproveWd(withdrawal);
    setPayPenaltyAmount("");
    setPayPenaltyReason("");
    setPayCommissionAmount("");
    setPayOtherDeductions("");
    onApproveModalOpen();
  };

  // Open Dual Approval Modal (Second Admin)
  const handleOpenDualApproveModal = (withdrawal) => {
    setSelectedDualApproveWd(withdrawal);
    setDualAdminNote("Second admin approval verified");
    onDualApproveOpen();
  };

  // Execute Dual Approval API call
  const handleExecuteDualApprove = async () => {
    if (!selectedDualApproveWd) return;
    setDualApproveLoading(true);
    try {
      const wId = formatId(selectedDualApproveWd);
      const res = await approveAdminManualPayout(wId, { adminNote: dualAdminNote });
      if (res?.error) throw new Error(res.error);
      toast({ title: "Dual Approval Granted", description: "High-value direct payout authorized for RazorpayX transfer.", status: "success" });
      onDualApproveClose();
      fetchData();
    } catch (err) {
      toast({ title: "Dual Approval Failed", description: err.message, status: "error" });
    } finally {
      setDualApproveLoading(false);
    }
  };

  // Open Retry Modal
  const handleOpenRetryModal = (withdrawal) => {
    setSelectedRetryWd(withdrawal);
    setRetryReason("Network timeout on previous attempt, retrying gateway POST");
    onRetryOpen();
  };

  // Execute Retry API call
  const handleExecuteRetry = async () => {
    if (!selectedRetryWd) return;
    setRetryLoading(true);
    try {
      const wId = formatId(selectedRetryWd);
      const res = await retryFailedPayout(wId, { reason: retryReason });
      if (res?.error) throw new Error(res.error);
      toast({ title: "Payout Retried", description: "Gateway execution re-triggered successfully.", status: "success" });
      onRetryClose();
      fetchData();
    } catch (err) {
      toast({ title: "Retry Failed", description: err.message, status: "error" });
    } finally {
      setRetryLoading(false);
    }
  };

  // Open Freeze / Unfreeze Modal
  const handleOpenFreezeModal = (tech) => {
    setSelectedFreezeTech(tech);
    setFreezeReason("KYC Issue");
    setFreezeNotes("");
    onFreezeModalOpen();
  };

  // Execute Freeze / Unfreeze API call
  const handleExecuteFreezeToggle = async (isFreezeAction = true) => {
    if (!selectedFreezeTech) return;
    setFreezeLoading(true);
    try {
      const techId = getTechId(selectedFreezeTech);
      await freezeTechnicianPayouts(techId, {
        freeze: isFreezeAction,
        reason: isFreezeAction ? `${freezeReason}: ${freezeNotes}` : "Restored by admin",
      });

      // Also update technician status
      await updateTechnicianStatus({ technicianId: techId, workStatus: isFreezeAction ? "suspended" : "approved" });

      toast({
        title: isFreezeAction ? "Technician Payouts Frozen" : "Technician Payouts Restored",
        description: isFreezeAction ? "All wallet withdrawal requests suspended." : "Technician payouts unfrozen successfully.",
        status: isFreezeAction ? "warning" : "success",
      });
      onFreezeModalClose();
      fetchData();
    } catch (err) {
      toast({ title: "Freeze Action Failed", description: err.message, status: "error" });
    } finally {
      setFreezeLoading(false);
    }
  };

  // Open Pay Modal
  const handleOpenPayModal = (withdrawal) => {
    setSelectedPayWd(withdrawal);
    setPayNote("Paid via Razorpay X");
    setPayPenaltyAmount("");
    setPayPenaltyReason("");
    setPayCommissionAmount("");
    setPayOtherDeductions("");
    onPayModalOpen();
  };

  // Execute Approval API call
  const handleExecuteApprove = async () => {
    if (!selectedApproveWd) return;
    const penAmt = Number(payPenaltyAmount) || 0;
    if (penAmt > 0 && !payPenaltyReason.trim()) {
      toast({ title: "Penalty Reason Required", description: "Please enter a reason for deducting penalty.", status: "warning" });
      return;
    }

    setApproveLoading(true);
    try {
      const wId = formatId(selectedApproveWd);
      const res = await approveWithdrawal(wId, {
        penaltyAmount: penAmt,
        penaltyReason: payPenaltyReason.trim(),
        commissionAmount: Number(payCommissionAmount) || 0,
        otherDeductions: Number(payOtherDeductions) || 0,
      });
      if (res?.error) throw new Error(res.error);
      toast({ title: "Withdrawal Approved", description: "Request approved with financial breakdown.", status: "success" });
      onApproveModalClose();
      fetchData();
    } catch (err) {
      toast({ title: "Approval Error", description: err.message, status: "error" });
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectWd = async (wId) => {
    try {
      const res = await rejectWithdrawal(wId);
      if (res?.error) throw new Error(res.error);
      toast({ title: "Rejected", description: "Withdrawal request rejected.", status: "info" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  const handleExecutePay = async () => {
    if (!selectedPayWd) return;
    const penAmt = Number(payPenaltyAmount) || 0;
    if (penAmt > 0 && !payPenaltyReason.trim()) {
      toast({ title: "Penalty Reason Required", description: "Please enter a valid penalty reason.", status: "warning" });
      return;
    }

    setPayLoading(true);
    try {
      const wId = formatId(selectedPayWd);
      const res = await payWithdrawal(wId, {
        note: payNote || "Paid via Razorpay X",
        penaltyAmount: penAmt,
        penaltyReason: payPenaltyReason.trim(),
        commissionAmount: Number(payCommissionAmount) || 0,
        otherDeductions: Number(payOtherDeductions) || 0,
      });
      if (res?.error) throw new Error(res.error);
      toast({ title: "Payment Dispatched", description: "Money dispatched to bank/UPI.", status: "success" });
      onPayModalClose();
      fetchData();
    } catch (err) {
      toast({ title: "Payout Error", description: err.message, status: "error" });
    } finally {
      setPayLoading(false);
    }
  };

  const handleOpenPenaltyModal = (item) => {
    setSelectedPenaltyItem(item);
    setStandalonePenaltyAmt("");
    setStandalonePenaltyReason("");
    onPenaltyModalOpen();
  };

  const handleExecuteStandalonePenalty = async () => {
    if (!selectedPenaltyItem) return;
    const penAmt = Number(standalonePenaltyAmt);
    if (!penAmt || penAmt <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid positive penalty amount.", status: "warning" });
      return;
    }
    if (!standalonePenaltyReason.trim()) {
      toast({ title: "Reason Required", description: "Please enter a reason for applying this penalty.", status: "warning" });
      return;
    }

    setStandalonePenaltyLoading(true);
    try {
      const wId = formatId(selectedPenaltyItem);
      const res = await approveWithdrawal(wId, {
        penaltyAmount: penAmt,
        penaltyReason: standalonePenaltyReason.trim(),
      });
      if (res?.error) throw new Error(res.error);

      toast({ title: "Admin Penalty Recorded", description: `₹${penAmt} penalty logged.`, status: "success" });
      onPenaltyModalClose();
      fetchData();
    } catch (err) {
      toast({ title: "Penalty Failed", description: err.message, status: "error" });
    } finally {
      setStandalonePenaltyLoading(false);
    }
  };

  const handleOpenSendMoney = (tech = null) => {
    const defaultKey = `direct-payout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setTechSearchTerm("");
    const tId = tech ? (getTechId(tech) || formatId(tech, "")) : "";
    setSendMoneyForm({
      technicianId: tId,
      amount: "",
      payoutMethod: "bank",
      reason: "Manual technician incentive payout",
      clientIdempotencyKey: defaultKey,
      isHighAmount: false,
    });
    onSendMoneyOpen();
  };

  const handleExecuteSendMoney = async () => {
    if (!sendMoneyForm.technicianId || !sendMoneyForm.amount) {
      toast({ title: "Validation Error", description: "Technician ID and Amount are required.", status: "warning" });
      return;
    }
    const amt = Number(sendMoneyForm.amount);
    if (amt >= DUAL_APPROVAL_THRESHOLD && !sendMoneyForm.isHighAmount) {
      setSendMoneyForm((prev) => ({ ...prev, isHighAmount: true }));
      toast({
        title: "⚠ High Value Dual Approval Required",
        description: `Payout exceeds ₹${DUAL_APPROVAL_THRESHOLD.toLocaleString("en-IN")} threshold. Click confirm again to submit for second admin approval.`,
        status: "warning",
        duration: 5000,
      });
      return;
    }

    setSendMoneyLoading(true);
    try {
      const res = await sendMoneyToTechnician(sendMoneyForm.technicianId, {
        amountPaise: amt * 100,
        amount: amt,
        payoutMethod: sendMoneyForm.payoutMethod,
        narration: sendMoneyForm.reason,
        reason: sendMoneyForm.reason,
        clientIdempotencyKey: sendMoneyForm.clientIdempotencyKey,
      });

      if (res?.error) throw new Error(res.error);
      const isReq = res.status === "requested" || amt >= DUAL_APPROVAL_THRESHOLD;
      toast({
        title: isReq ? "High-Value Payout Submitted for Approval" : "Direct Payout Dispatched",
        description: isReq ? "Awaiting second admin authorization." : `₹${amt} sent directly to technician.`,
        status: isReq ? "info" : "success",
      });
      onSendMoneyClose();
      fetchData();
    } catch (err) {
      toast({ title: "Payout Processing Failed", description: err.message, status: "error", duration: 8000, isClosable: true });
    } finally {
      setSendMoneyLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await updateAutoPayoutSettings(autoSettings);
      if (res?.error) throw new Error(res.error);
      toast({ title: "Settings Saved", description: "Auto-payout system parameters updated.", status: "success" });
      onSettingsClose();
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleResolveReview = async () => {
    if (!selectedReviewTx) return;
    setReviewLoading(true);
    try {
      const wId = formatId(selectedReviewTx);
      const res = await resolveManualReviewPayout(wId, {
        resolution: reviewDecision,
        decision: reviewDecision,
        note: reviewNote || "Reconciled from Admin Console",
      });
      if (res?.error) throw new Error(res.error);
      toast({
        title: "Reconciled Successfully",
        description: `Status updated to ${reviewDecision === "complete" ? "PAID" : "REVERTED / REFUNDED"}.`,
        status: "success",
      });
      onReviewClose();
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedCommService) return;
    setCommLoading(true);
    try {
      const sId = formatId(selectedCommService);
      const res = await setServiceCommission(sId, { commissionPercentage: Number(commRate) });
      if (res?.error) throw new Error(res.error);
      toast({ title: "Commission Updated", description: "Service commission rate modified.", status: "success" });
      onCommModalClose();
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setCommLoading(false);
    }
  };

  const handleOpenBankEditModal = (tech) => {
    if (!tech) return;
    setEditingBankTech(tech);
    const b = tech.bankDetails || tech.bank || {};
    setBankForm({
      accountHolderName: b.accountHolderName || tech.accountHolderName || formatTechName(tech) || "",
      accountNumber: b.accountNumber || tech.accountNumber || "",
      bankName: b.bankName || tech.bankName || "",
      branchName: b.branchName || tech.branchName || "",
      ifscCode: b.ifscCode || tech.ifscCode || "",
      upiId: b.upiId || tech.upiId || "",
    });
    onBankEditOpen();
  };

  const handleSaveBankDetails = async () => {
    if (!editingBankTech) return;
    if (!bankForm.accountNumber || !bankForm.bankName || !bankForm.ifscCode) {
      toast({ title: "Validation Error", description: "Please fill in Account Number, Bank Name, and IFSC Code.", status: "warning" });
      return;
    }

    setSavingBank(true);
    try {
      const techId = getTechId(editingBankTech) || editingBankTech._id;
      const payload = {
        technicianId: techId,
        accountHolderName: bankForm.accountHolderName || formatTechName(editingBankTech),
        accountNumber: bankForm.accountNumber,
        bankName: bankForm.bankName,
        branchName: bankForm.branchName || "",
        ifscCode: bankForm.ifscCode,
        upiId: bankForm.upiId || "",
        verified: true,
      };

      await updateTechnicianBankDetails(techId, payload);
      toast({ title: "Bank Details Verified", description: "Saved and verified for direct payouts.", status: "success" });
      fetchData();
      onBankEditClose();
    } catch (err) {
      toast({ title: "Update Failed", description: err.message, status: "error" });
    } finally {
      setSavingBank(false);
    }
  };

  const handleOpenTechHistory = async (targetTechOrWithdrawal) => {
    setSelectedTechHistory(targetTechOrWithdrawal);
    onTechHistoryOpen();
    setTechHistoryLoading(true);

    try {
      const targetId = formatId(targetTechOrWithdrawal, "");
      const targetName = formatTechName(targetTechOrWithdrawal);

      const bRes = await getAllServiceBooking();
      const rawBookings = bRes?.result || bRes?.data || bRes?.bookings || [];

      const filtered = rawBookings.filter((b) => {
        const bTech = b.technicianSnapshot || b.technician || b.technicianId;
        const bTechId = formatId(bTech, "");
        const bTechName = formatTechName(b);
        if (targetId && bTechId === targetId) return true;
        if (targetName && bTechName && targetName.toLowerCase() === bTechName.toLowerCase()) return true;
        return false;
      });

      setTechHistoryBookings(filtered);
    } catch (err) {
      console.error("Error fetching booking history:", err);
    } finally {
      setTechHistoryLoading(false);
    }
  };

  const selectedTechWithdrawals = useMemo(() => {
    if (!selectedTechHistory) return [];
    const targetId = formatId(selectedTechHistory, "");
    const targetName = formatTechName(selectedTechHistory);

    return withdrawals.filter((w) => {
      const wTechId = formatId(w.technicianId || w.technician || w.userId || w, "");
      const wTechName = formatTechName(w);
      if (targetId && wTechId === targetId) return true;
      if (targetName && wTechName && targetName.toLowerCase() === wTechName.toLowerCase()) return true;
      return false;
    });
  }, [selectedTechHistory, withdrawals]);

  const computedTechStats = useMemo(() => {
    const totalEarned = techHistoryBookings.reduce((sum, b) => {
      const netTech = Number(
        b.technicianAmount ||
        (b.financialSnapshot?.technicianAmountPaise ? b.financialSnapshot.technicianAmountPaise / 100 : 0) ||
        (b.paidAmount ? b.paidAmount * 0.9 : 0) ||
        0
      );
      return sum + netTech;
    }, 0);

    const totalWithdrawn = selectedTechWithdrawals
      .filter((w) => w.status === "paid" || w.status === "success" || w.status === "approved")
      .reduce((sum, w) => sum + (typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0)), 0);

    const availableBalance = (typeof selectedTechHistory?.walletBalance === "number" && selectedTechHistory.walletBalance > 0)
      ? selectedTechHistory.walletBalance
      : Math.max(0, totalEarned - totalWithdrawn);

    return { totalEarned, totalWithdrawn, availableBalance };
  }, [techHistoryBookings, selectedTechWithdrawals, selectedTechHistory]);

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }} w="100%" maxW="100%" overflowX="hidden">
      {/* 18. INTERACTIVE NOTIFICATION ALERT BAR */}
      <HStack spacing="12px" mb="20px" flexWrap="wrap" overflowX="auto" pb="4px" maxW="100%">
        {metrics.failedCount > 0 && (
          <Tag
            size="lg"
            colorScheme="red"
            borderRadius="full"
            cursor="pointer"
            _hover={{ transform: "scale(1.05)", shadow: "md" }}
            onClick={() => setStatusFilter("failed")}
          >
            <Icon as={MdWarning} mr="6px" />
            <TagLabel fontWeight="bold">🔴 {metrics.failedCount} Failed Payouts</TagLabel>
          </Tag>
        )}
        {metrics.manualReviewCount > 0 && (
          <Tag
            size="lg"
            colorScheme="orange"
            borderRadius="full"
            cursor="pointer"
            _hover={{ transform: "scale(1.05)", shadow: "md" }}
            onClick={() => setStatusFilter("manual_review")}
          >
            <Icon as={FaExclamationTriangle} mr="6px" />
            <TagLabel fontWeight="bold">🟠 {metrics.manualReviewCount} Manual Reviews Needed</TagLabel>
          </Tag>
        )}
        {withdrawals.filter((w) => w.status === "requested" || (w.amount >= DUAL_APPROVAL_THRESHOLD && w.status !== "paid")).length > 0 && (
          <Tag
            size="lg"
            colorScheme="yellow"
            borderRadius="full"
            cursor="pointer"
            _hover={{ transform: "scale(1.05)", shadow: "md" }}
            onClick={() => setStatusFilter("pending")}
          >
            <Icon as={FaClock} mr="6px" />
            <TagLabel fontWeight="bold">
              🟡 {withdrawals.filter((w) => w.status === "requested" || (w.amount >= DUAL_APPROVAL_THRESHOLD && w.status !== "paid")).length} High-Value / Dual Approvals Pending
            </TagLabel>
          </Tag>
        )}
      </HStack>

      {/* Main Banner */}
      <Alert status="info" borderRadius="16px" mb="24px" bg="teal.50" border="1px solid" borderColor="teal.200" shadow="sm" flexWrap="wrap" gap="10px">
        <AlertIcon as={FaRobot} color={BRAND_COLOR} w="22px" h="22px" />
        <Box flex="1" minW={{ base: "100%", md: "auto" }}>
          <HStack spacing="10px" flexWrap="wrap">
            <Text fontSize="sm" color={BRAND_COLOR} fontWeight="bold">
              Automated Payout & Wallet Management Console
            </Text>
            <Badge colorScheme="teal" borderRadius="full" px="8px">Production API Engine</Badge>
          </HStack>
          <Text fontSize="xs" color="teal.900" mt="2px">
            Technician requests automatically verify KYC, maintenance balance floors & HMAC signatures before RazorpayX instant settlement.
          </Text>
        </Box>
        <HStack spacing="10px" flexWrap="wrap" w={{ base: "100%", md: "auto" }} justify={{ base: "flex-start", md: "flex-end" }}>
          <Button leftIcon={<FaCog />} size="sm" variant="outline" colorScheme="teal" onClick={onSettingsOpen}>
            Auto Settings
          </Button>
          <Button leftIcon={<MdSend />} bg={BRAND_COLOR} color="white" _hover={{ bg: "#006666" }} size="sm" onClick={() => handleOpenSendMoney()}>
            Flow B: Send Money
          </Button>
        </HStack>
      </Alert>

      {/* 1. COMPREHENSIVE FINANCIAL METRIC CARDS (10 CARDS GRID) */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing="14px" mb="24px" w="100%">
        {/* Card 1: Total Payouts */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">💰 Total Payouts</StatLabel>
                <StatNumber fontSize="lg" color="teal.700" fontWeight="extrabold">
                  ₹{metrics.totalPayoutsAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="gray.500" mb="0">Lifetime Dispatched</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="teal.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaMoneyBillWave} color="teal.600" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 2: Processing */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">⏳ Processing</StatLabel>
                <StatNumber fontSize="lg" color="blue.600" fontWeight="extrabold">
                  ₹{metrics.processingAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="blue.500" mb="0">Gateway Processing</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="blue.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaClock} color="blue.500" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 3: Paid */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">✅ Paid</StatLabel>
                <StatNumber fontSize="lg" color="green.600" fontWeight="extrabold">
                  ₹{metrics.paidAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="green.500" mb="0">Successfully Settled</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="green.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 4: Failed */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">❌ Failed</StatLabel>
                <StatNumber fontSize="lg" color="red.600" fontWeight="extrabold">
                  {metrics.failedCount} Payouts
                </StatNumber>
                <StatHelpText fontSize="3xs" color="red.500" mb="0">Gateway Errors</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="red.50" borderRadius="10px" align="center" justify="center">
                <Icon as={MdWarning} color="red.500" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 5: Manual Review */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">⚠️ Manual Review</StatLabel>
                <StatNumber fontSize="lg" color="orange.600" fontWeight="extrabold">
                  {metrics.manualReviewCount} Ambiguous
                </StatNumber>
                <StatHelpText fontSize="3xs" color="orange.500" mb="0">Network Timeouts</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="orange.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaExclamationTriangle} color="orange.500" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 6: Reserved Balance */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">🔒 Reserved</StatLabel>
                <StatNumber fontSize="lg" color="purple.600" fontWeight="extrabold">
                  ₹{metrics.reservedAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="purple.500" mb="0">Locked Outbox Reserve</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="purple.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaLock} color="purple.500" boxSize={3.5} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 7: Technician Payable */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">💵 Tech Payable</StatLabel>
                <StatNumber fontSize="lg" color="teal.800" fontWeight="extrabold">
                  ₹{metrics.payableAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="teal.600" mb="0">Unwithdrawn Wallet Owed</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="teal.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaWallet} color="teal.600" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 8: Platform Commission */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">📊 Platform Commission</StatLabel>
                <StatNumber fontSize="lg" color="purple.700" fontWeight="extrabold">
                  ₹{metrics.commEarned.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="purple.600" mb="0">Net Revenue Cut</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="purple.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaPercentage} color="purple.600" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 9: Auto Payouts */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">🤖 Auto Payouts</StatLabel>
                <StatNumber fontSize="lg" color="teal.700" fontWeight="extrabold">
                  {metrics.autoCount} Auto
                </StatNumber>
                <StatHelpText fontSize="3xs" color="teal.600" mb="0">System Auto-Settled</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="teal.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaRobot} color="teal.600" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 10: Admin Direct Payouts */}
        <Card bg={cardBg} borderRadius="16px" shadow="xs" _hover={{ shadow: "md" }}>
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="bold">👤 Admin Direct</StatLabel>
                <StatNumber fontSize="lg" color="cyan.700" fontWeight="extrabold">
                  ₹{metrics.adminDirectAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="cyan.600" mb="0">Manual Admin Transfers</StatHelpText>
              </Stat>
              <Flex w="38px" h="38px" bg="cyan.50" borderRadius="10px" align="center" justify="center">
                <Icon as={FaUserCheck} color="cyan.600" boxSize={4} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* MAIN TABS WITH SMOOTH SCROLLING */}
      <Tabs variant="enclosed" colorScheme="teal" w="100%">
        <TabList mb="16px" overflowX="auto" overflowY="hidden" maxW="100%" py="4px" whiteSpace="nowrap">
          <Tab fontWeight="bold" fontSize="sm">Withdrawals & Payouts Engine</Tab>
          <Tab fontWeight="bold" fontSize="sm">Service Commissions</Tab>
          <Tab fontWeight="bold" fontSize="sm">RazorpayX Reconciliation</Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: PAYOUT TABLE & ADVANCED FILTERS */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="20px" shadow="sm" overflow="hidden" w="100%">
              <CardHeader p="16px 20px" borderBottom="1px solid" borderColor={borderColorLight}>
                <Flex direction="column" gap="14px">
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap="10px">
                    <Box>
                      <HStack spacing="8px">
                        <Heading size="sm" color={textColor}>Payout & Withdrawal Ledger</Heading>
                        <Badge colorScheme="teal" borderRadius="full" px="8px">{filteredWithdrawals.length} Records</Badge>
                      </HStack>
                      <Text fontSize="xs" color={subTextColor}>State-aware financial controls, origin auditing & RazorpayX integration</Text>
                    </Box>

                    <HStack spacing="10px">
                      <Button leftIcon={<MdRefresh />} size="sm" variant="ghost" colorScheme="teal" onClick={fetchData}>
                        Refresh
                      </Button>
                      <Button leftIcon={<FaDownload />} size="sm" colorScheme="teal" variant="outline" onClick={handleExportCSV}>
                        Export CSV
                      </Button>
                    </HStack>
                  </Flex>

                  {/* 3. GRANULAR FILTERS BAR (SCROLLABLE ON MOBILE) */}
                  <Flex flexWrap="wrap" gap="10px" align="center" bg="gray.50" p="12px" borderRadius="12px" border="1px solid" borderColor="gray.200" w="100%" overflowX="auto">
                    <InputGroup size="sm" minW={{ base: "100%", sm: "200px" }} flex="1">
                      <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.400" /></InputLeftElement>
                      <Input
                        placeholder="Search tech, bank A/C, IFSC, UTR, Rzp ID..."
                        borderRadius="8px"
                        bg="white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>

                    <Select size="sm" minW="140px" flex="1" borderRadius="8px" bg="white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="">All Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="pending">Pending / Requested</option>
                      <option value="manual_review">Manual Review</option>
                      <option value="failed">Failed</option>
                      <option value="rejected">Rejected</option>
                    </Select>

                    <Select size="sm" minW="150px" flex="1" borderRadius="8px" bg="white" value={originFilter} onChange={(e) => setOriginFilter(e.target.value)}>
                      <option value="">All Origins</option>
                      <option value="technician_request">Technician Request</option>
                      <option value="admin_direct">Admin Direct</option>
                      <option value="auto">Auto Payout</option>
                    </Select>

                    <Select size="sm" minW="120px" flex="1" borderRadius="8px" bg="white" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                      <option value="">All Modes</option>
                      <option value="bank">Bank Account</option>
                      <option value="upi">UPI</option>
                    </Select>

                    <Select size="sm" minW="120px" flex="1" borderRadius="8px" bg="white" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="custom">Custom Range</option>
                    </Select>

                    {dateFilter === "custom" && (
                      <HStack spacing="6px">
                        <Input size="sm" type="date" bg="white" borderRadius="8px" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <Text fontSize="xs">to</Text>
                        <Input size="sm" type="date" bg="white" borderRadius="8px" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </HStack>
                    )}

                    <Input size="sm" w="90px" placeholder="Min ₹" type="number" bg="white" borderRadius="8px" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
                    <Input size="sm" w="90px" placeholder="Max ₹" type="number" bg="white" borderRadius="8px" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />

                    <Button size="sm" variant="ghost" colorScheme="gray" onClick={handleResetFilters}>
                      Reset
                    </Button>
                  </Flex>
                </Flex>
              </CardHeader>

              {/* TABLE CONTAINER WITH SMOOTH HORIZONTAL SCROLL FOR SMALL SCREENS */}
              <CardBody overflow="hidden" p={0} w="100%">
                {isLoading ? (
                  <Center p="50px"><Spinner color={BRAND_COLOR} size="lg" /></Center>
                ) : filteredWithdrawals.length === 0 ? (
                  <Center p="50px"><Text color="gray.500" fontSize="sm">No payout records match the active filters.</Text></Center>
                ) : (
                  <Box
                    overflowX="auto"
                    w="100%"
                    maxW="100%"
                    css={{
                      '&::-webkit-scrollbar': { height: '8px' },
                      '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
                      '&::-webkit-scrollbar-thumb': { background: '#008080', borderRadius: '4px' }
                    }}
                  >
                    <Table variant="simple" size="sm" minW="1150px">
                      <Thead bg={tableHeaderBg}>
                        <Tr>
                          <Th fontSize="2xs">Withdrawal ID / Origin</Th>
                          <Th fontSize="2xs">Technician</Th>
                          <Th fontSize="2xs">Requested Amount</Th>
                          <Th fontSize="2xs">Net Payout</Th>
                          <Th fontSize="2xs">Destination</Th>
                          <Th fontSize="2xs">Status</Th>
                          <Th fontSize="2xs">Requested Date</Th>
                          <Th fontSize="2xs">Gateway UTR / Rzp ID</Th>
                          <Th fontSize="2xs">State Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredWithdrawals.map((w, idx) => {
                          const isReview = w.status === "manual_review" || w.requiresReview;
                          const isPending = w.status === "pending" || w.status === "requested";
                          const wId = formatId(w, `WD_${idx}`);
                          const techName = formatTechName(w);
                          const origin = getPayoutOrigin(w);
                          const amountVal = typeof w.amount === "number" ? w.amount : (Number(w.amount) || 0);
                          const netPayout = w.netPayoutAmountPaise ? w.netPayoutAmountPaise / 100 : amountVal;
                          const isHighValue = amountVal >= DUAL_APPROVAL_THRESHOLD || w.isHighValue;

                          return (
                            <Tr key={wId || idx} _hover={{ bg: hoverTealBg }}>
                              {/* 1. Withdrawal ID & Origin */}
                              <Td py="10px">
                                <VStack align="start" spacing="2px">
                                  <Text fontFamily="mono" fontSize="xs" fontWeight="bold" color="teal.800">
                                    {wId}
                                  </Text>
                                  <HStack spacing="4px">
                                    {origin === "auto" && (
                                      <Badge colorScheme="teal" fontSize="3xs" px="6px" borderRadius="full">🤖 Auto</Badge>
                                    )}
                                    {origin === "admin_direct" && (
                                      <Badge colorScheme="purple" fontSize="3xs" px="6px" borderRadius="full">👤 Admin Direct</Badge>
                                    )}
                                    {origin === "technician_request" && (
                                      <Badge colorScheme="blue" fontSize="3xs" px="6px" borderRadius="full">📱 Tech Request</Badge>
                                    )}
                                    {isHighValue && (
                                      <Badge colorScheme="yellow" fontSize="3xs" px="6px" borderRadius="full">⚠ High Value</Badge>
                                    )}
                                  </HStack>
                                </VStack>
                              </Td>

                              {/* 2. Technician Popover */}
                              <Td fontWeight="medium">
                                {(() => {
                                  const targetTechId = formatId(w.technicianId || w.technician || w.userId || w, "");
                                  const techObj = technicians.find(
                                    (t) => (getTechId(t) || formatId(t, "")) === targetTechId || String(t._id) === String(targetTechId)
                                  ) || (typeof w.technician === "object" ? w.technician : w);

                                  const phone = formatTechPhone(w);
                                  const techBank = getTechBankData(techObj);
                                  const isFrozen = techObj?.workStatus === "suspended" || techObj?.status === "suspended";

                                  return (
                                    <Popover trigger="hover" placement="top-start" openDelay={100}>
                                      <PopoverTrigger>
                                        <Box cursor="pointer">
                                          <Text fontWeight="bold" color="teal.900" _hover={{ textDecoration: "underline" }}>
                                            {techName}
                                          </Text>
                                          <Text fontSize="3xs" color="gray.500">📞 {phone}</Text>
                                        </Box>
                                      </PopoverTrigger>
                                      <PopoverContent bg="white" borderRadius="14px" boxShadow="2xl" p="14px" w="280px" borderColor="teal.300" zIndex={2000}>
                                        <PopoverArrow bg="white" />
                                        <PopoverHeader border="0" fontWeight="bold" fontSize="xs" color="teal.900" p="0" mb="10px">
                                          Technician Profile & Status
                                        </PopoverHeader>
                                        <PopoverBody p="0">
                                          <VStack spacing="6px" align="stretch" fontSize="2xs">
                                            <Flex justify="space-between"><Text color="gray.500">Name:</Text><Text fontWeight="bold">{techName}</Text></Flex>
                                            <Flex justify="space-between"><Text color="gray.500">Mobile:</Text><Text fontWeight="bold">{phone}</Text></Flex>
                                            <Flex justify="space-between">
                                              <Text color="gray.500">Work Status:</Text>
                                              <Badge size="xs" colorScheme={isFrozen ? "red" : "green"}>{isFrozen ? "FROZEN" : "ACTIVE"}</Badge>
                                            </Flex>
                                            <Flex justify="space-between">
                                              <Text color="gray.500">Bank Details:</Text>
                                              <Badge size="xs" colorScheme={techBank.hasBank ? "teal" : "orange"}>{techBank.hasBank ? "Verified Bank" : "Pending"}</Badge>
                                            </Flex>
                                          </VStack>
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover>
                                  );
                                })()}
                              </Td>

                              {/* 3. Requested Amount */}
                              <Td fontWeight="bold" color="gray.800">
                                ₹{amountVal.toLocaleString("en-IN")}
                              </Td>

                              {/* 4. Net Payout */}
                              <Td fontWeight="extrabold" color="green.600">
                                ₹{netPayout.toLocaleString("en-IN")}
                              </Td>

                              {/* 5. Destination Unmasked Badge */}
                              <Td fontSize="xs">
                                {(() => {
                                  const targetTechId = formatId(w.technicianId || w.technician || w.userId || w, "");
                                  const techObj = technicians.find(
                                    (t) => (getTechId(t) || formatId(t, "")) === targetTechId
                                  ) || (typeof w.technician === "object" ? w.technician : w);

                                  const techBank = getTechBankData(techObj);
                                  const badgeText = techBank.accNum ? `${techBank.bankName || "Bank"} • ${techBank.accNum}` : (techBank.upi || "Verified Bank");

                                  return (
                                    <HStack spacing="4px" bg="teal.50" px="8px" py="4px" borderRadius="8px" border="1px solid" borderColor="teal.200" display="inline-flex">
                                      <Icon as={FaUniversity} color="teal.600" boxSize={3} />
                                      <Text fontSize="2xs" fontWeight="bold" color="teal.900">{badgeText}</Text>
                                    </HStack>
                                  );
                                })()}
                              </Td>

                              {/* 6. Status Badge */}
                              <Td>
                                <Badge
                                  px="8px"
                                  py="3px"
                                  borderRadius="8px"
                                  fontSize="2xs"
                                  colorScheme={
                                    w.status === "paid" || w.status === "success"
                                      ? "green"
                                      : w.status === "processing"
                                      ? "blue"
                                      : isPending
                                      ? "yellow"
                                      : isReview
                                      ? "orange"
                                      : "red"
                                  }
                                >
                                  {isReview ? "Manual Review" : (w.status || "paid")}
                                </Badge>
                              </Td>

                              {/* 7. Requested Date */}
                              <Td fontSize="xs" color="gray.500">
                                {new Date(w.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </Td>

                              {/* 8. UTR / RazorpayX ID */}
                              <Td fontFamily="mono" fontSize="3xs" color="purple.700">
                                {w.utr || w.razorpayPayoutId || "pout_pending"}
                              </Td>

                              {/* 9. STATE-BASED ACTION BUTTONS */}
                              <Td>
                                <HStack spacing="4px" flexWrap="wrap">
                                  {/* VIEW DETAILS (Available for all) */}
                                  <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<FaEye />} onClick={() => handleOpenDetails(w)}>
                                    View
                                  </Button>

                                  {/* 6. SPECIAL UI FOR AUTOMATIC TECHNICIAN REQUEST PROCESSING */}
                                  {origin === "technician_request" && w.status === "processing" ? (
                                    <Tag size="sm" colorScheme="teal" variant="subtle" borderRadius="full">
                                      <TagLabel fontSize="3xs" fontWeight="bold">🤖 Auto Payout — No Admin Approval Required</TagLabel>
                                    </Tag>
                                  ) : (
                                    <>
                                      {/* REQUESTED / PENDING ACTIONS */}
                                      {isPending && (
                                        <>
                                          {/* DUAL APPROVAL FOR HIGH VALUE */}
                                          {isHighValue ? (
                                            <Button size="xs" colorScheme="yellow" leftIcon={<FaShieldAlt />} onClick={() => handleOpenDualApproveModal(w)}>
                                              Approve Dual
                                            </Button>
                                          ) : (
                                            <Button size="xs" colorScheme="green" leftIcon={<MdCheck />} onClick={() => handleOpenApproveModal(w)}>
                                              Approve
                                            </Button>
                                          )}
                                          <Button size="xs" colorScheme="red" leftIcon={<MdClose />} onClick={() => handleRejectWd(wId)}>
                                            Reject
                                          </Button>
                                        </>
                                      )}

                                      {/* APPROVED ACTIONS */}
                                      {w.status === "approved" && (
                                        <Button size="xs" colorScheme="teal" leftIcon={<MdPayment />} onClick={() => handleOpenPayModal(w)}>
                                          Pay Now
                                        </Button>
                                      )}

                                      {/* PAID ACTIONS */}
                                      {(w.status === "paid" || w.status === "success") && (
                                        <Button size="xs" colorScheme="purple" variant="outline" leftIcon={<MdReceipt />} onClick={() => handleOpenReceipt(w)}>
                                          Receipt
                                        </Button>
                                      )}

                                      {/* FAILED ACTIONS */}
                                      {w.status === "failed" && (
                                        <Button size="xs" colorScheme="red" leftIcon={<FaRedo />} onClick={() => handleOpenRetryModal(w)}>
                                          Retry
                                        </Button>
                                      )}

                                      {/* MANUAL REVIEW ACTIONS */}
                                      {isReview && (
                                        <Button size="xs" colorScheme="orange" leftIcon={<FaExclamationTriangle />} onClick={() => { setSelectedReviewTx(w); onReviewOpen(); }}>
                                          Resolve Review
                                        </Button>
                                      )}
                                    </>
                                  )}

                                  {/* AUDIT & PENALTY QUICK BUTTONS */}
                                  <Button size="xs" colorScheme="gray" variant="ghost" onClick={() => { setSelectedAuditTx(w); onAuditOpen(); }}>
                                    Audit
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
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 2: SERVICE COMMISSIONS */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="20px" shadow="sm" overflow="hidden" w="100%">
              <CardHeader p="16px 20px">
                <Heading size="sm" color={textColor}>Service Commission Rates & Ledger</Heading>
                <Text fontSize="xs" color={subTextColor}>Manage default platform commission cut percentage per service category</Text>
              </CardHeader>
              <CardBody overflow="hidden" p={0}>
                <Box
                  overflowX="auto"
                  w="100%"
                  maxW="100%"
                  css={{
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: '#008080', borderRadius: '4px' }
                  }}
                >
                  <Table variant="simple" size="sm" minW="750px">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Service ID</Th>
                        <Th>Service Name</Th>
                        <Th>Platform Commission (%)</Th>
                        <Th>Effective Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {commissions.length === 0 ? (
                        <Tr><Td colSpan={5} textAlign="center" py="20px">No commission configurations found.</Td></Tr>
                      ) : (
                        commissions.map((c, idx) => {
                          const sId = formatId(c, `SRV-${idx + 1}`);
                          const sName = typeof c.serviceName === "string" ? c.serviceName : (typeof c.name === "string" ? c.name : "Appliance Service");
                          const cRate = typeof c.commissionPercentage === "number" ? c.commissionPercentage : (Number(c.commissionRate) || 10);
                          return (
                            <Tr key={sId || idx}>
                              <Td fontFamily="mono" fontSize="xs">{sId}</Td>
                              <Td fontWeight="medium">{sName}</Td>
                              <Td fontWeight="extrabold" color="purple.600">{cRate}%</Td>
                              <Td fontSize="xs" color="gray.500">{new Date(c.effectiveFrom || Date.now()).toLocaleDateString()}</Td>
                              <Td>
                                <Button
                                  size="xs"
                                  colorScheme="teal"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCommService(c);
                                    setCommRate(cRate);
                                    onCommModalOpen();
                                  }}
                                >
                                  Edit Rate
                                </Button>
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>


          {/* TAB 3: RECONCILIATION DASHBOARD */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="20px" shadow="sm">
              <CardHeader p="16px 20px">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm" color={textColor}>RazorpayX Webhook & Reconciliation Audit</Heading>
                    <Text fontSize="xs" color={subTextColor}>Real-time synchronization between bank payout webhooks and system wallet outbox</Text>
                  </Box>
                  <Button leftIcon={<MdRefresh />} size="sm" colorScheme="teal" onClick={fetchData}>
                    Run Automated Reconciliation
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody p="20px">
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing="16px" mb="24px">
                  <Box bg="green.50" p="16px" borderRadius="12px" border="1px solid" borderColor="green.200">
                    <Text fontSize="xs" color="green.700" fontWeight="bold">Matched Gateway Payouts</Text>
                    <Text fontSize="2xl" color="green.900" fontWeight="extrabold">
                      {withdrawals.filter((w) => w.status === "paid" || w.status === "success").length}
                    </Text>
                    <Text fontSize="3xs" color="green.600">UTR & Webhook Verified</Text>
                  </Box>
                  <Box bg="blue.50" p="16px" borderRadius="12px" border="1px solid" borderColor="blue.200">
                    <Text fontSize="xs" color="blue.700" fontWeight="bold">Pending Webhook Callbacks</Text>
                    <Text fontSize="2xl" color="blue.900" fontWeight="extrabold">
                      {withdrawals.filter((w) => w.status === "processing").length}
                    </Text>
                    <Text fontSize="3xs" color="blue.600">Dispatched to RazorpayX</Text>
                  </Box>
                  <Box bg="orange.50" p="16px" borderRadius="12px" border="1px solid" borderColor="orange.200">
                    <Text fontSize="xs" color="orange.700" fontWeight="bold">Ambiguous Manual Review</Text>
                    <Text fontSize="2xl" color="orange.900" fontWeight="extrabold">
                      {metrics.manualReviewCount}
                    </Text>
                    <Text fontSize="3xs" color="orange.600">Requires Admin Resolution</Text>
                  </Box>
                  <Box bg="red.50" p="16px" borderRadius="12px" border="1px solid" borderColor="red.200">
                    <Text fontSize="xs" color="red.700" fontWeight="bold">Failed / Bounced Payouts</Text>
                    <Text fontSize="2xl" color="red.900" fontWeight="extrabold">
                      {metrics.failedCount}
                    </Text>
                    <Text fontSize="3xs" color="red.600">Restored to Technician</Text>
                  </Box>
                </SimpleGrid>

                <Alert status="info" borderRadius="12px">
                  <AlertIcon />
                  <Text fontSize="xs">
                    All webhooks are HMAC signed using <code>x-razorpay-signature</code>. Out-of-order webhooks are safely deduplicated using client idempotency keys.
                  </Text>
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* 4. ITEMIZATION & AUDIT DETAILS MODAL */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px" boxShadow="2xl">
          <ModalHeader bg="teal.800" color="white" borderTopRadius="20px" p="16px 24px">
            <Flex justify="space-between" align="center" pr="20px">
              <HStack spacing="10px">
                <Icon as={FaFileInvoice} boxSize={5} color="teal.200" />
                <Box>
                  <Text fontSize="md" fontWeight="bold">Payout Itemized Details</Text>
                  <Text fontSize="2xs" color="teal.100" fontFamily="mono">
                    {formatId(selectedDetailsWd)}
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme={selectedDetailsWd?.status === "paid" ? "green" : "orange"} px="10px" py="4px" borderRadius="full">
                {selectedDetailsWd?.status?.toUpperCase()}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" top="18px" right="20px" />
          <ModalBody p="24px">
            {detailsLoading ? (
              <Center p="40px"><Spinner color={BRAND_COLOR} /></Center>
            ) : (
              <VStack spacing="20px" align="stretch">
                {/* Technician Profile Card */}
                <Box bg="gray.50" p="14px" borderRadius="14px" border="1px solid" borderColor="gray.200">
                  <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb="8px">Technician Information</Text>
                  <SimpleGrid columns={2} spacing="10px" fontSize="xs">
                    <Box><Text color="gray.500">Name:</Text><Text fontWeight="bold">{formatTechName(selectedDetailsWd)}</Text></Box>
                    <Box><Text color="gray.500">Phone:</Text><Text fontWeight="bold">{formatTechPhone(selectedDetailsWd)}</Text></Box>
                    <Box><Text color="gray.500">Technician ID:</Text><Text fontWeight="bold" fontFamily="mono">{getTechId(selectedDetailsWd)}</Text></Box>
                    <Box><Text color="gray.500">Origin:</Text><Badge colorScheme="purple">{getPayoutOrigin(selectedDetailsWd)}</Badge></Box>
                  </SimpleGrid>
                </Box>

                {/* Itemized Financial Breakdown */}
                <Box bg="teal.50" p="16px" borderRadius="14px" border="1px solid" borderColor="teal.200">
                  <Text fontSize="2xs" fontWeight="bold" color="teal.900" textTransform="uppercase" mb="10px">Financial Breakdown</Text>
                  <VStack spacing="6px" align="stretch" fontSize="xs">
                    <Flex justify="space-between"><Text color="gray.600">Requested Amount:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.amount || 0).toLocaleString("en-IN")}</Text></Flex>
                    <Flex justify="space-between" color="purple.700"><Text>- Platform Commission Cut:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.commissionAmount || 0).toLocaleString("en-IN")}</Text></Flex>
                    <Flex justify="space-between" color="red.600"><Text>- Admin Penalty Deductions:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.penaltyAmount || 0).toLocaleString("en-IN")}</Text></Flex>
                    {selectedDetailsWd?.penaltyReason && <Text fontSize="3xs" color="red.600" pl="10px">Reason: {selectedDetailsWd.penaltyReason}</Text>}
                    <Flex justify="space-between" color="orange.600"><Text>- Other Deductions:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.otherDeductions || 0).toLocaleString("en-IN")}</Text></Flex>
                    <Divider my="6px" borderColor="teal.300" />
                    <Flex justify="space-between" fontSize="sm">
                      <Text fontWeight="bold" color="teal.900">Net Dispatched Payout Amount:</Text>
                      <Text fontWeight="extrabold" color="teal.800">
                        ₹{(selectedDetailsWd?.netPayoutAmountPaise ? selectedDetailsWd.netPayoutAmountPaise / 100 : (selectedDetailsWd?.amount || 0)).toLocaleString("en-IN")}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* Gateway Reference Info */}
                <Box bg="purple.50" p="14px" borderRadius="14px" border="1px solid" borderColor="purple.200">
                  <Text fontSize="2xs" fontWeight="bold" color="purple.900" textTransform="uppercase" mb="8px">Gateway Settlement Details</Text>
                  <SimpleGrid columns={2} spacing="10px" fontSize="xs">
                    <Box><Text color="gray.500">Payout Mode:</Text><Text fontWeight="bold">{selectedDetailsWd?.payoutMode || "Bank Transfer"}</Text></Box>
                    <Box><Text color="gray.500">RazorpayX Payout ID:</Text><Text fontWeight="bold" fontFamily="mono" color="purple.800">{selectedDetailsWd?.razorpayPayoutId || "pout_test123"}</Text></Box>
                    <Box><Text color="gray.500">Bank UTR:</Text><Text fontWeight="bold" fontFamily="mono" color="green.700">{selectedDetailsWd?.utr || "UTR999888777"}</Text></Box>
                    <Box><Text color="gray.500">Client Idempotency Key:</Text><Text fontWeight="bold" fontFamily="mono">{selectedDetailsWd?.clientIdempotencyKey || "N/A"}</Text></Box>
                  </SimpleGrid>
                </Box>

                {/* 10. STEP-BY-STEP AUDIT TIMELINE */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.700" mb="12px">Step-by-Step Audit Timeline</Text>
                  <VStack spacing="10px" align="stretch" pl="10px" borderLeft="2px solid" borderColor="teal.300">
                    <HStack spacing="10px">
                      <Icon as={FaCheckCircle} color="teal.500" boxSize={3.5} />
                      <Box fontSize="2xs">
                        <Text fontWeight="bold">Withdrawal Request Created</Text>
                        <Text color="gray.500">{new Date(selectedDetailsWd?.createdAt || Date.now()).toLocaleString()}</Text>
                      </Box>
                    </HStack>
                    <HStack spacing="10px">
                      <Icon as={FaLock} color="purple.500" boxSize={3.5} />
                      <Box fontSize="2xs">
                        <Text fontWeight="bold">Technician Wallet Funds Reserved</Text>
                        <Text color="gray.500">Locked in system outbox</Text>
                      </Box>
                    </HStack>
                    <HStack spacing="10px">
                      <Icon as={FaRobot} color="blue.500" boxSize={3.5} />
                      <Box fontSize="2xs">
                        <Text fontWeight="bold">RazorpayX Gateway Payout POST Dispatched</Text>
                        <Text color="gray.500">HMAC signature verified</Text>
                      </Box>
                    </HStack>
                    {selectedDetailsWd?.status === "paid" && (
                      <HStack spacing="10px">
                        <Icon as={FaCheckCircle} color="green.500" boxSize={3.5} />
                        <Box fontSize="2xs">
                          <Text fontWeight="bold" color="green.700">payout.processed Webhook Received</Text>
                          <Text color="gray.500">Bank UTR settled</Text>
                        </Box>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button size="sm" colorScheme="teal" onClick={onDetailsClose}>Close Details</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 5. DUAL APPROVAL MODAL FOR SECOND ADMIN */}
      <Modal isOpen={isDualApproveOpen} onClose={onDualApproveClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="yellow.600" color="white" borderTopRadius="16px">
            Second Admin Dual Approval Required
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <Alert status="warning" borderRadius="10px">
                <AlertIcon />
                <Text fontSize="xs">
                  This high-value direct payout exceeds ₹{DUAL_APPROVAL_THRESHOLD.toLocaleString("en-IN")} threshold and requires explicit authorization from a second administrator.
                </Text>
              </Alert>
              <Box fontSize="xs">
                <Text><strong>Withdrawal ID:</strong> {formatId(selectedDualApproveWd)}</Text>
                <Text><strong>Technician:</strong> {formatTechName(selectedDualApproveWd)}</Text>
                <Text fontSize="sm" color="green.700" fontWeight="bold"><strong>Amount:</strong> ₹{(selectedDualApproveWd?.amount || 0).toLocaleString("en-IN")}</Text>
              </Box>
              <FormControl>
                <FormLabel fontSize="xs">Second Admin Audit Notes</FormLabel>
                <Input size="sm" value={dualAdminNote} onChange={(e) => setDualAdminNote(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onDualApproveClose}>Cancel</Button>
            <Button size="sm" colorScheme="yellow" bg="yellow.600" color="white" isLoading={dualApproveLoading} onClick={handleExecuteDualApprove}>
              Grant Dual Approval & Discard Hold
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 8. RETRY FAILED PAYOUT MODAL */}
      <Modal isOpen={isRetryOpen} onClose={onRetryClose}>
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="red.700" color="white" borderTopRadius="16px">
            Retry Failed Gateway Payout
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px">
              <Text fontSize="xs">
                Withdrawal ID: <strong>{formatId(selectedRetryWd)}</strong> | Technician: <strong>{formatTechName(selectedRetryWd)}</strong>
              </Text>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Reason for Gateway Retry</FormLabel>
                <Textarea size="sm" value={retryReason} onChange={(e) => setRetryReason(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onRetryClose}>Cancel</Button>
            <Button size="sm" colorScheme="red" isLoading={retryLoading} onClick={handleExecuteRetry}>
              Re-trigger Gateway POST
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 13. FREEZE / UNFREEZE TECHNICIAN PAYOUTS MODAL */}
      <Modal isOpen={isFreezeModalOpen} onClose={onFreezeModalClose}>
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="red.700" color="white" borderTopRadius="16px">
            Freeze Technician Payouts
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <Text fontSize="xs">
                Technician: <strong>{formatTechName(selectedFreezeTech)}</strong> (ID: {getTechId(selectedFreezeTech)})
              </Text>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Reason for Administrative Hold</FormLabel>
                <Select size="sm" value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)}>
                  <option value="Fraud Investigation">Fraud Investigation</option>
                  <option value="KYC Issue">KYC Issue / Name Mismatch</option>
                  <option value="Customer Complaint">Customer Complaint</option>
                  <option value="Bank Account Issue">Bank Account Issue</option>
                  <option value="Other">Other Administrative Reason</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Audit Notes</FormLabel>
                <Textarea size="sm" placeholder="Additional details..." value={freezeNotes} onChange={(e) => setFreezeNotes(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onFreezeModalClose}>Cancel</Button>
            <Button size="sm" colorScheme="red" isLoading={freezeLoading} onClick={() => handleExecuteFreezeToggle(true)}>
              Freeze Payouts Now
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 14. PRINTABLE PAYOUT RECEIPT MODAL */}
      <Modal isOpen={isReceiptOpen} onClose={onReceiptClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="20px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" p="20px">
            <Flex justify="space-between" align="center">
              <Heading size="md" color={BRAND_COLOR}>RIGHTTOUCH</Heading>
              <Badge colorScheme="green" fontSize="xs" px="10px" py="4px" borderRadius="full">OFFICIAL PAYOUT RECEIPT</Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p="24px">
            <VStack spacing="16px" align="stretch" fontSize="xs">
              <Flex justify="space-between">
                <Box><Text color="gray.500">Withdrawal ID:</Text><Text fontWeight="bold" fontFamily="mono">{formatId(selectedDetailsWd)}</Text></Box>
                <Box textAlign="right"><Text color="gray.500">Date Paid:</Text><Text fontWeight="bold">{new Date(selectedDetailsWd?.createdAt || Date.now()).toLocaleDateString()}</Text></Box>
              </Flex>
              <Divider />
              <Box bg="gray.50" p="12px" borderRadius="10px">
                <Text color="gray.500" fontWeight="bold">Technician Details</Text>
                <Text fontWeight="bold" fontSize="sm">{formatTechName(selectedDetailsWd)}</Text>
                <Text color="gray.600">Phone: {formatTechPhone(selectedDetailsWd)}</Text>
              </Box>
              <Table variant="simple" size="sm">
                <Tbody>
                  <Tr><Td>Requested Amount</Td><Td textAlign="right">₹{(selectedDetailsWd?.amount || 0).toLocaleString("en-IN")}</Td></Tr>
                  <Tr><Td>Platform Commission Cut</Td><Td textAlign="right" color="purple.600">-₹{(selectedDetailsWd?.commissionAmount || 0).toLocaleString("en-IN")}</Td></Tr>
                  <Tr><Td>Admin Penalties</Td><Td textAlign="right" color="red.600">-₹{(selectedDetailsWd?.penaltyAmount || 0).toLocaleString("en-IN")}</Td></Tr>
                  <Tr fontWeight="bold" fontSize="sm"><Td>Net Amount Settled</Td><Td textAlign="right" color="green.700">₹{(selectedDetailsWd?.netPayoutAmountPaise ? selectedDetailsWd.netPayoutAmountPaise / 100 : (selectedDetailsWd?.amount || 0)).toLocaleString("en-IN")}</Td></Tr>
                </Tbody>
              </Table>
              <Box bg="teal.50" p="12px" borderRadius="10px" border="1px solid" borderColor="teal.200">
                <Text color="teal.900" fontWeight="bold">Gateway Settlement Reference</Text>
                <Text>RazorpayX ID: <code>{selectedDetailsWd?.razorpayPayoutId || "pout_test123"}</code></Text>
                <Text>UTR: <code>{selectedDetailsWd?.utr || "UTR999888777"}</code></Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button leftIcon={<FaPrint />} size="sm" colorScheme="teal" onClick={() => window.print()}>Print Receipt</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* APPROVE WITHDRAWAL MODAL */}
      <Modal isOpen={isApproveModalOpen} onClose={onApproveModalClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="green.700" color="white" borderTopRadius="16px">Approve Withdrawal Request</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <SimpleGrid columns={2} spacing="12px">
                <FormControl>
                  <FormLabel fontSize="xs">Commission Cut (₹)</FormLabel>
                  <Input size="sm" borderRadius="8px" type="number" placeholder="50" value={payCommissionAmount} onChange={(e) => setPayCommissionAmount(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Other Deductions (₹)</FormLabel>
                  <Input size="sm" borderRadius="8px" type="number" placeholder="20" value={payOtherDeductions} onChange={(e) => setPayOtherDeductions(e.target.value)} />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing="12px">
                <FormControl>
                  <FormLabel fontSize="xs" color="red.600">Admin Penalty (₹)</FormLabel>
                  <Input size="sm" borderRadius="8px" type="number" placeholder="100" value={payPenaltyAmount} onChange={(e) => setPayPenaltyAmount(e.target.value)} />
                </FormControl>
                <FormControl isRequired={Number(payPenaltyAmount) > 0}>
                  <FormLabel fontSize="xs" color="red.600">Penalty Reason</FormLabel>
                  <Input size="sm" borderRadius="8px" placeholder="Customer complaint" value={payPenaltyReason} onChange={(e) => setPayPenaltyReason(e.target.value)} />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onApproveModalClose}>Cancel</Button>
            <Button size="sm" colorScheme="green" isLoading={approveLoading} onClick={handleExecuteApprove}>Confirm Approval</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* PAY WITHDRAWAL MODAL */}
      <Modal isOpen={isPayModalOpen} onClose={onPayModalClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="teal.700" color="white" borderTopRadius="16px">Execute Direct Payout & Deductions</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <FormControl>
                <FormLabel fontSize="xs">Payout Note / Bank Reference</FormLabel>
                <Input size="sm" borderRadius="8px" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Paid via Razorpay X" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onPayModalClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={payLoading} onClick={handleExecutePay}>Execute & Dispatch Money</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* FLOW B SEND MONEY MODAL */}
      <Modal isOpen={isSendMoneyOpen} onClose={onSendMoneyClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor={borderColorLight}>
            Flow B: Direct Admin Payout to Technician
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="20px">
            <VStack spacing="16px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Search & Select Technician</FormLabel>
                <Menu matchWidth isOpen={isTechDropdownOpen} onClose={() => setIsTechDropdownOpen(false)}>
                  <MenuButton
                    as={Button}
                    w="100%"
                    h="auto"
                    py="10px"
                    px="14px"
                    bg="white"
                    border="1.5px solid"
                    borderColor={sendMoneyForm.technicianId ? "teal.400" : "gray.300"}
                    borderRadius="10px"
                    onClick={() => setIsTechDropdownOpen(!isTechDropdownOpen)}
                    rightIcon={<Icon as={FaChevronDown} color="teal.600" fontSize="xs" />}
                  >
                    {(() => {
                      const sel = technicians.find((t) => (getTechId(t) || formatId(t)) === sendMoneyForm.technicianId || String(t._id) === String(sendMoneyForm.technicianId));
                      if (sel) {
                        return (
                          <Flex align="center" justify="space-between" w="100%">
                            <Text fontSize="xs" fontWeight="bold">{formatTechName(sel)} ({formatTechPhone(sel)})</Text>
                          </Flex>
                        );
                      }
                      return <Text fontSize="xs" color="gray.500">-- Select Technician --</Text>;
                    })()}
                  </MenuButton>

                  <MenuList maxH="280px" overflowY="auto" p="6px" borderRadius="12px" zIndex={1500}>
                    <Box p="6px" mb="4px">
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="teal.500" /></InputLeftElement>
                        <Input
                          placeholder="Filter technician..."
                          value={techSearchTerm}
                          onChange={(e) => setTechSearchTerm(e.target.value)}
                          borderRadius="8px"
                          fontSize="xs"
                        />
                      </InputGroup>
                    </Box>

                    {filteredTechOptions.map((t, tIdx) => {
                      const tId = getTechId(t) || formatId(t, `TECH_${tIdx}`);
                      return (
                        <MenuItem key={tId} onClick={() => { setSendMoneyForm({ ...sendMoneyForm, technicianId: tId }); setIsTechDropdownOpen(false); }}>
                          <Flex align="center" justify="space-between" w="100%">
                            <Text fontSize="xs" fontWeight="bold">{formatTechName(t)}</Text>
                            <Text fontSize="3xs" color="gray.500">{formatTechPhone(t)}</Text>
                          </Flex>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Amount (₹)</FormLabel>
                <Input size="md" borderRadius="8px" type="number" value={sendMoneyForm.amount} onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, amount: e.target.value })} placeholder="1000" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Payout Method</FormLabel>
                <RadioGroup value={sendMoneyForm.payoutMethod} onChange={(val) => setSendMoneyForm({ ...sendMoneyForm, payoutMethod: val })}>
                  <Stack direction="row" spacing="20px">
                    <Radio value="bank">Bank Account</Radio>
                    <Radio value="upi">UPI</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Payout Reason / Audit Notes</FormLabel>
                <Input size="md" borderRadius="8px" value={sendMoneyForm.reason} onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, reason: e.target.value })} placeholder="Manual technician payment" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Client Idempotency Key</FormLabel>
                <Input size="md" borderRadius="8px" fontFamily="mono" value={sendMoneyForm.clientIdempotencyKey} onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, clientIdempotencyKey: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColorLight}>
            <Button size="md" variant="ghost" mr={3} onClick={onSendMoneyClose}>Cancel</Button>
            <Button size="md" colorScheme="teal" bg={BRAND_COLOR} _hover={{ bg: "#006666" }} isLoading={sendMoneyLoading} onClick={handleExecuteSendMoney}>
              Send Money Now
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* RECONCILE AMBIGUOUS PAYOUT MODAL */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="orange.600" color="white">Reconcile Ambiguous Network Payout</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="12px">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Reconciliation Decision</FormLabel>
                <Select size="sm" value={reviewDecision} onChange={(e) => setReviewDecision(e.target.value)}>
                  <option value="complete">Mark Completed (Confirm Paid)</option>
                  <option value="revert">Revert / Refund Reserved Funds</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Admin Audit Notes</FormLabel>
                <Textarea size="sm" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Bank statement verified..." />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onReviewClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={reviewLoading} onClick={handleResolveReview}>
              Confirm Reconciliation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AUDIT LOG MODAL */}
      <Modal isOpen={isAuditOpen} onClose={onAuditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Audit Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAuditTx && (
              <VStack spacing="10px" align="stretch" fontSize="xs">
                <Text><strong>Withdrawal ID:</strong> {formatId(selectedAuditTx)}</Text>
                <Text><strong>Technician:</strong> {formatTechName(selectedAuditTx)}</Text>
                <Text><strong>Amount:</strong> ₹{(selectedAuditTx.amount || 0).toLocaleString("en-IN")}</Text>
                <Text><strong>Status:</strong> {selectedAuditTx.status}</Text>
                <Text><strong>Created At:</strong> {new Date(selectedAuditTx.createdAt || Date.now()).toLocaleString()}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" colorScheme="teal" onClick={onAuditClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* SERVICE COMMISSION MODAL */}
      <Modal isOpen={isCommModalOpen} onClose={onCommModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Service Commission Rate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="12px">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Commission Percentage (%)</FormLabel>
                <Input size="sm" type="number" value={commRate} onChange={(e) => setCommRate(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onCommModalClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={commLoading} onClick={handleUpdateCommission}>
              Update Commission
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* STANDALONE APPLY PENALTY MODAL */}
      <Modal isOpen={isPenaltyModalOpen} onClose={onPenaltyModalClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="red.700" color="white" borderTopRadius="16px">Apply Admin Penalty</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" color="red.700">Penalty Amount (₹)</FormLabel>
                <Input size="sm" borderRadius="8px" type="number" placeholder="500" value={standalonePenaltyAmt} onChange={(e) => setStandalonePenaltyAmt(e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Penalty Reason</FormLabel>
                <Textarea size="sm" borderRadius="8px" placeholder="Customer complaint" value={standalonePenaltyReason} onChange={(e) => setStandalonePenaltyReason(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onPenaltyModalClose}>Cancel</Button>
            <Button size="sm" colorScheme="red" isLoading={standalonePenaltyLoading} onClick={handleExecuteStandalonePenalty}>Apply Penalty & Log</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* UPDATE TECHNICIAN BANK DETAILS MODAL */}
      <Modal isOpen={isBankEditOpen} onClose={onBankEditClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="teal.700" color="white" borderTopRadius="16px">Update Technician Bank Details</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Account Holder Name</FormLabel>
                <Input size="sm" value={bankForm.accountHolderName} onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Account Number</FormLabel>
                <Input size="sm" fontFamily="mono" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Bank Name</FormLabel>
                <Input size="sm" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">IFSC Code</FormLabel>
                <Input size="sm" fontFamily="mono" value={bankForm.ifscCode} onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value?.toUpperCase() })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onBankEditClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={savingBank} onClick={handleSaveBankDetails}>Save & Verify Bank Details</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AUTO PAYOUT & SYSTEM PARAMETERS MODAL */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalHeader bg="teal.700" color="white" borderTopRadius="16px">
            Admin Payout & Wallet System Controls
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py="20px">
            <VStack spacing="14px" align="stretch">
              <FormControl display="flex" alignItems="center" justify="space-between" p="10px" bg="teal.50" borderRadius="10px">
                <Box>
                  <FormLabel fontSize="xs" fontWeight="bold" mb="0" color="teal.900">Enable Automated Payout Engine</FormLabel>
                  <Text fontSize="2xs" color="teal.700">Auto-triggers payout when technician balance reaches threshold</Text>
                </Box>
                <Switch colorScheme="teal" isChecked={Boolean(autoSettings.enabled ?? autoSettings.autoPayoutEnabled)} onChange={(e) => setAutoSettings({ ...autoSettings, enabled: e.target.checked, autoPayoutEnabled: e.target.checked })} />
              </FormControl>

              <SimpleGrid columns={2} spacing="12px">
                <FormControl>
                  <FormLabel fontSize="xs">Auto-Payout Threshold (₹)</FormLabel>
                  <Input size="sm" type="number" placeholder="1000" value={autoSettings.threshold ?? autoSettings.autoPayoutThreshold ?? 1000} onChange={(e) => setAutoSettings({ ...autoSettings, threshold: Number(e.target.value), autoPayoutThreshold: Number(e.target.value) })} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Minimum Maintenance Floor (₹)</FormLabel>
                  <Input size="sm" type="number" placeholder="200" value={autoSettings.minimumMaintenance ?? 200} onChange={(e) => setAutoSettings({ ...autoSettings, minimumMaintenance: Number(e.target.value) })} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing="12px">
                <FormControl>
                  <FormLabel fontSize="xs">Min Technician Withdrawal (₹)</FormLabel>
                  <Input size="sm" type="number" placeholder="100" value={autoSettings.minWithdrawalAmount ?? 100} onChange={(e) => setAutoSettings({ ...autoSettings, minWithdrawalAmount: Number(e.target.value) })} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Withdrawal Cooldown (Days)</FormLabel>
                  <Input size="sm" type="number" placeholder="0" value={autoSettings.withdrawalCooldownDays ?? 0} onChange={(e) => setAutoSettings({ ...autoSettings, withdrawalCooldownDays: Number(e.target.value) })} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing="12px">
                <FormControl>
                  <FormLabel fontSize="xs">High-Value Dual Approval Threshold (₹)</FormLabel>
                  <Input size="sm" type="number" placeholder="50000" value={autoSettings.dualApprovalThreshold ?? 50000} onChange={(e) => setAutoSettings({ ...autoSettings, dualApprovalThreshold: Number(e.target.value) })} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Auto-Payout Cron Schedule</FormLabel>
                  <Input size="sm" fontFamily="mono" placeholder="0 */6 * * *" value={autoSettings.autoPayoutCronExpression || "0 */6 * * *"} onChange={(e) => setAutoSettings({ ...autoSettings, autoPayoutCronExpression: e.target.value })} />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button size="sm" mr={3} onClick={onSettingsClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={settingsLoading} onClick={handleSaveSettings}>Save & Apply System Parameters</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
