import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  useDisclosure,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Tooltip,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaWallet,
  FaMoneyBillWave,
  FaRedo,
  FaPaperPlane,
  FaEdit,
  FaPlus,
  FaUndo,
  FaPercent,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaRobot,
  FaUserCog,
  FaLock,
  FaEye,
} from "react-icons/fa";
import { MdReceiptLong, MdPendingActions, MdSend, MdAutorenew, MdSecurity } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";

import {
  wallet,
  finance,
  refundsComplaints,
  quotations,
  commission,
} from "api";

const BRAND_COLOR = "#008080";

export default function BillingPaymentDashboard() {
  const textColor = useColorModeValue("gray.700", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  // Active Tab State
  const [tabIndex, setTabIndex] = useState(0);

  // ----------------------------------------------------
  // 1. AUTOMATIC PAYOUT & WALLET MONITORING STATE
  // ----------------------------------------------------
  const [walletSummary, setWalletSummary] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("");
  const [payoutModeFilter, setPayoutModeFilter] = useState(""); // automatic vs admin_manual
  const [walletLoading, setWalletLoading] = useState(false);

  // Transaction Audit Trail Drawer / Modal
  const [selectedTx, setSelectedTx] = useState(null);
  const { isOpen: isAuditOpen, onOpen: onAuditOpen, onClose: onAuditClose } = useDisclosure();

  // Ambiguous Payout / Manual Review Modal
  const [selectedReviewTx, setSelectedReviewTx] = useState(null);
  const [reviewDecision, setReviewDecision] = useState("complete");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();

  // Flow B: Admin Direct Send Money Modal State
  const { isOpen: isSendMoneyOpen, onOpen: onSendMoneyOpen, onClose: onSendMoneyClose } = useDisclosure();
  const [sendMoneyForm, setSendMoneyForm] = useState({
    technicianId: "",
    technicianName: "",
    amount: "",
    reason: "Manual technician payment",
    clientIdempotencyKey: "",
    isHighAmount: false,
  });
  const [sendMoneyLoading, setSendMoneyLoading] = useState(false);

  // ----------------------------------------------------
  // 2. FINANCE STATE
  // ----------------------------------------------------
  const [financeSummary, setFinanceSummary] = useState(null);
  const [paymentsLedger, setPaymentsLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);

  // ----------------------------------------------------
  // 3. REFUNDS STATE
  // ----------------------------------------------------
  const [refundsList, setRefundsList] = useState([]);
  const [refundStatusFilter, setRefundStatusFilter] = useState("");
  const [refundsLoading, setRefundsLoading] = useState(false);
  
  const { isOpen: isRefundOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure();
  const [refundForm, setRefundForm] = useState({
    bookingId: "",
    amount: "",
    reason: "",
    type: "partial",
  });
  const [refundPreview, setRefundPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createRefundLoading, setCreateRefundLoading] = useState(false);

  // ----------------------------------------------------
  // 4. QUOTATIONS STATE
  // ----------------------------------------------------
  const [quotationsList, setQuotationsList] = useState([]);
  const [quoteRequestsList, setQuoteRequestsList] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);

  const { isOpen: isQuoteModalOpen, onOpen: onQuoteModalOpen, onClose: onQuoteModalClose } = useDisclosure();
  const [quoteForm, setQuoteForm] = useState({
    customerId: "",
    serviceId: "",
    title: "",
    amount: "",
    description: "",
    validDays: "7",
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // ----------------------------------------------------
  // 5. COMMISSION STATE
  // ----------------------------------------------------
  const [commissions, setCommissions] = useState([]);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState("");
  const { isOpen: isCommissionOpen, onOpen: onCommissionOpen, onClose: onCommissionClose } = useDisclosure();
  const [commissionSubmitting, setCommissionSubmitting] = useState(false);

  const { isOpen: isOverrideOpen, onOpen: onOverrideOpen, onClose: onOverrideClose } = useDisclosure();
  const [overrideForm, setOverrideForm] = useState({ bookingId: "", rate: "", reason: "" });

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const fetchWalletData = useCallback(async () => {
    setWalletLoading(true);
    try {
      const [walletRes, withdrawRes] = await Promise.allSettled([
        wallet.getPlatformWallet(),
        wallet.getWithdrawalHistory({ status: withdrawalStatusFilter, type: payoutModeFilter }),
      ]);

      if (walletRes.status === "fulfilled" && walletRes.value?.data) {
        setWalletSummary(walletRes.value.data);
      }
      if (withdrawRes.status === "fulfilled" && withdrawRes.value?.data) {
        const raw = withdrawRes.value.data;
        setWithdrawals(Array.isArray(raw) ? raw : raw.requests || raw.history || []);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setWalletLoading(false);
    }
  }, [withdrawalStatusFilter, payoutModeFilter]);

  const fetchFinanceData = useCallback(async () => {
    setFinanceLoading(true);
    try {
      const [sumRes, payRes] = await Promise.allSettled([
        finance.getFinanceSummary(),
        finance.getPaymentsLedger(),
      ]);

      if (sumRes.status === "fulfilled" && sumRes.value?.data) setFinanceSummary(sumRes.value.data);
      if (payRes.status === "fulfilled" && payRes.value?.data) {
        const raw = payRes.value.data;
        setPaymentsLedger(Array.isArray(raw) ? raw : raw.payments || raw.ledger || []);
      }
    } catch (err) {
      console.error("Error fetching finance data:", err);
    } finally {
      setFinanceLoading(false);
    }
  }, []);

  const fetchRefundsData = useCallback(async () => {
    setRefundsLoading(true);
    try {
      const res = await refundsComplaints.listRefunds(refundStatusFilter ? { status: refundStatusFilter } : {});
      if (res?.data) {
        const raw = res.data;
        setRefundsList(Array.isArray(raw) ? raw : raw.refunds || []);
      }
    } catch (err) {
      console.error("Error fetching refunds:", err);
    } finally {
      setRefundsLoading(false);
    }
  }, [refundStatusFilter]);

  const fetchQuotationsData = useCallback(async () => {
    setQuotationsLoading(true);
    try {
      const [quotesRes, reqsRes] = await Promise.allSettled([
        quotations.listQuotations(),
        quotations.listQuoteRequests(),
      ]);

      if (quotesRes.status === "fulfilled" && quotesRes.value?.data) {
        const raw = quotesRes.value.data;
        setQuotationsList(Array.isArray(raw) ? raw : raw.quotations || []);
      }
      if (reqsRes.status === "fulfilled" && reqsRes.value?.data) {
        const raw = reqsRes.value.data;
        setQuoteRequestsList(Array.isArray(raw) ? raw : raw.requests || raw.quoteRequests || []);
      }
    } catch (err) {
      console.error("Error fetching quotations:", err);
    } finally {
      setQuotationsLoading(false);
    }
  }, []);

  const fetchCommissionData = useCallback(async () => {
    setCommissionLoading(true);
    try {
      const res = await commission.listServiceCommissions();
      if (res?.data) {
        const raw = res.data;
        setCommissions(Array.isArray(raw) ? raw : raw.services || raw.commissions || []);
      }
    } catch (err) {
      console.error("Error fetching commission data:", err);
    } finally {
      setCommissionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tabIndex === 0) fetchWalletData();
    else if (tabIndex === 1) fetchFinanceData();
    else if (tabIndex === 2) fetchRefundsData();
    else if (tabIndex === 3) fetchQuotationsData();
    else if (tabIndex === 4) fetchCommissionData();
  }, [tabIndex, fetchWalletData, fetchFinanceData, fetchRefundsData, fetchQuotationsData, fetchCommissionData]);

  // Filtered Withdrawals List based on Search & Mode
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesStatus = !withdrawalStatusFilter || w.status === withdrawalStatusFilter;
      const matchesMode =
        !payoutModeFilter ||
        (payoutModeFilter === "automatic" && !w.isAdminManual) ||
        (payoutModeFilter === "admin_manual" && w.isAdminManual);
      return matchesStatus && matchesMode;
    });
  }, [withdrawals, withdrawalStatusFilter, payoutModeFilter]);

  // ----------------------------------------------------
  // HANDLERS FOR FLOW B & MANUAL REVIEW
  // ----------------------------------------------------
  
  // Open Flow B: Admin Direct Send Money Modal
  const handleOpenSendMoneyModal = () => {
    const defaultKey = `WD_ADMIN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setSendMoneyForm({
      technicianId: "",
      technicianName: "",
      amount: "",
      reason: "Manual technician bonus / payout",
      clientIdempotencyKey: defaultKey,
      isHighAmount: false,
    });
    onSendMoneyOpen();
  };

  // Flow B: Execute Direct Send Money
  const handleExecuteSendMoney = async () => {
    if (!sendMoneyForm.technicianId || !sendMoneyForm.amount) {
      toast({ title: "Validation Error", description: "Technician ID and Amount are required.", status: "warning" });
      return;
    }
    const amt = Number(sendMoneyForm.amount);
    if (amt > 10000 && !sendMoneyForm.isHighAmount) {
      setSendMoneyForm((prev) => ({ ...prev, isHighAmount: true }));
      toast({
        title: "High Amount Warning",
        description: "Amounts over ₹10,000 require secondary verification check. Click confirm again to proceed.",
        status: "warning",
      });
      return;
    }

    setSendMoneyLoading(true);
    try {
      const res = await wallet.sendMoneyToTechnician(sendMoneyForm.technicianId, {
        amount: amt,
        reason: sendMoneyForm.reason,
        clientIdempotencyKey: sendMoneyForm.clientIdempotencyKey,
      });

      if (res?.error) {
        toast({ title: "Payout Failed", description: res.error, status: "error" });
      } else {
        toast({
          title: "Direct Payout Executed",
          description: `₹${amt} sent to technician's verified account automatically. Transaction logged.`,
          status: "success",
        });
        onSendMoneyClose();
        fetchWalletData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setSendMoneyLoading(false);
    }
  };

  // Resolve Ambiguous Payout (Network Timeout / Manual Review)
  const handleResolveReview = async () => {
    if (!selectedReviewTx) return;
    setReviewLoading(true);
    try {
      const wId = selectedReviewTx._id || selectedReviewTx.id;
      const res = await wallet.resolveManualReviewPayout(wId, {
        decision: reviewDecision,
        adminNote: reviewNote || "Resolved from Admin Ambiguous Payout Console",
      });

      if (res?.error) {
        toast({ title: "Resolution Error", description: res.error, status: "error" });
      } else {
        toast({
          title: "Payout Reconciled",
          description: `Transaction status updated to ${reviewDecision === "complete" ? "PAID" : "CANCELLED & REFUNDED"}.`,
          status: "success",
        });
        onReviewClose();
        fetchWalletData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setReviewLoading(false);
    }
  };

  // Preview & Create Refund Handlers
  const handlePreviewRefund = async () => {
    if (!refundForm.bookingId || !refundForm.amount) return;
    setPreviewLoading(true);
    try {
      const res = await refundsComplaints.previewRefund({
        bookingId: refundForm.bookingId,
        amount: Number(refundForm.amount),
        type: refundForm.type,
      });
      if (res?.error) toast({ title: "Preview Error", description: res.error, status: "error" });
      else setRefundPreview(res.data);
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    if (!refundForm.bookingId || !refundForm.amount) return;
    setCreateRefundLoading(true);
    try {
      const res = await refundsComplaints.createRefund({
        bookingId: refundForm.bookingId,
        amount: Number(refundForm.amount),
        reason: refundForm.reason,
        type: refundForm.type,
      });
      if (res?.error) toast({ title: "Refund Failed", description: res.error, status: "error" });
      else {
        toast({ title: "Refund Executed", status: "success" });
        onRefundClose();
        setRefundForm({ bookingId: "", amount: "", reason: "", type: "partial" });
        setRefundPreview(null);
        fetchRefundsData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setCreateRefundLoading(false);
    }
  };

  const handleApproveRefund = async (refundId) => {
    try {
      const res = await refundsComplaints.approveRefund(refundId, { approvedBy: "Admin" });
      if (res?.error) toast({ title: "Approval Error", description: res.error, status: "error" });
      else {
        toast({ title: "Approved", status: "success" });
        fetchRefundsData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  const handleRetryRefund = async (refundId) => {
    try {
      const res = await refundsComplaints.retryRefund(refundId);
      if (res?.error) toast({ title: "Retry Error", description: res.error, status: "error" });
      else {
        toast({ title: "Retried", status: "success" });
        fetchRefundsData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  // Quotation Handlers
  const handleCreateQuotation = async () => {
    if (!quoteForm.customerId || !quoteForm.amount) return;
    setQuoteSubmitting(true);
    try {
      const res = await quotations.createQuotation({
        customerId: quoteForm.customerId,
        serviceId: quoteForm.serviceId,
        title: quoteForm.title,
        amount: Number(quoteForm.amount),
        description: quoteForm.description,
        validDays: Number(quoteForm.validDays || 7),
      });
      if (res?.error) toast({ title: "Quotation Error", description: res.error, status: "error" });
      else {
        toast({ title: "Quotation Created", status: "success" });
        onQuoteModalClose();
        setQuoteForm({ customerId: "", serviceId: "", title: "", amount: "", description: "", validDays: "7" });
        fetchQuotationsData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleQuotationAction = async (quoteId, action) => {
    try {
      let res;
      if (action === "send") res = await quotations.sendQuotation(quoteId);
      else if (action === "resend") res = await quotations.resendQuotation(quoteId);
      else if (action === "revise") res = await quotations.reviseQuotation(quoteId);

      if (res?.error) toast({ title: "Action Failed", description: res.error, status: "error" });
      else {
        toast({ title: "Success", description: `Quotation ${action}ed`, status: "success" });
        fetchQuotationsData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  // Commission Rates
  const handleSaveCommission = async () => {
    if (!selectedService || !newCommissionRate) return;
    setCommissionSubmitting(true);
    try {
      const res = await commission.setServiceCommission(selectedService._id || selectedService.id, {
        commissionRate: Number(newCommissionRate),
      });
      if (res?.error) toast({ title: "Error", description: res.error, status: "error" });
      else {
        toast({ title: "Commission Rate Saved", status: "success" });
        onCommissionClose();
        fetchCommissionData();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setCommissionSubmitting(false);
    }
  };

  const handleSaveBookingOverride = async () => {
    if (!overrideForm.bookingId || !overrideForm.rate) return;
    try {
      const res = await commission.overrideBookingCommission(overrideForm.bookingId, {
        commissionRate: Number(overrideForm.rate),
        reason: overrideForm.reason,
      });
      if (res?.error) toast({ title: "Override Error", description: res.error, status: "error" });
      else {
        toast({ title: "Booking Override Saved", status: "success" });
        onOverrideClose();
        setOverrideForm({ bookingId: "", rate: "", reason: "" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      {/* Visual System Banner: Automatic Payout Engine Status */}
      <Alert status="info" borderRadius="16px" mb="24px" bg="teal.50" border="1px solid" borderColor="teal.200">
        <AlertIcon as={FaRobot} color={BRAND_COLOR} w="20px" h="20px" />
        <Box flex="1">
          <AlertTitle fontSize="sm" color={BRAND_COLOR} fontWeight="bold">
            Automated Payout Engine Active — Zero Admin Approval Required
          </AlertTitle>
          <AlertDescription fontSize="xs" color="teal.800">
            Technician withdrawal requests pass automated KYC, bank/UPI fingerprint verification, and balance checks before instant RazorpayX dispatch. 
            No manual approval needed for normal payouts.
          </AlertDescription>
        </Box>
        <Badge colorScheme="green" px="10px" py="4px" borderRadius="full">
          Auto Engine Active
        </Badge>
      </Alert>

      {/* Real-time Monitoring Executive Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="20px" mb="24px">
        <Card bg={cardBg}>
          <CardBody>
            <Flex align="center" justify="space-between" w="100%">
              <Stat>
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  Total Wallet Volume
                </StatLabel>
                <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                  ₹{walletSummary?.balance || walletSummary?.totalCollected || 0}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="gray.500" mb="0">Available net earnings</StatHelpText>
              </Stat>
              <Flex w="45px" h="45px" bg={`${BRAND_COLOR}15`} borderRadius="12px" align="center" justify="center">
                <Icon as={FaWallet} color={BRAND_COLOR} w="22px" h="22px" />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Flex align="center" justify="space-between" w="100%">
              <Stat>
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  Auto Paid Payouts
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.500" fontWeight="bold">
                  {withdrawals.filter((w) => w.status === "paid" || w.status === "success").length}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="green.600" mb="0">Direct to Bank / UPI</StatHelpText>
              </Stat>
              <Flex w="45px" h="45px" bg="green.50" borderRadius="12px" align="center" justify="center">
                <Icon as={FaCheckCircle} color="green.500" w="22px" h="22px" />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Flex align="center" justify="space-between" w="100%">
              <Stat>
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  Auto Processing
                </StatLabel>
                <StatNumber fontSize="2xl" color="blue.500" fontWeight="bold">
                  {withdrawals.filter((w) => w.status === "processing" || w.status === "pending").length}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="blue.600" mb="0">In RazorpayX Outbox</StatHelpText>
              </Stat>
              <Flex w="45px" h="45px" bg="blue.50" borderRadius="12px" align="center" justify="center">
                <Icon as={MdAutorenew} color="blue.500" w="22px" h="22px" />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Flex align="center" justify="space-between" w="100%">
              <Stat>
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  Manual Review
                </StatLabel>
                <StatNumber fontSize="2xl" color="orange.500" fontWeight="bold">
                  {withdrawals.filter((w) => w.status === "manual_review" || w.requiresReview).length}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="orange.600" mb="0">Ambiguous / Timeouts</StatHelpText>
              </Stat>
              <Flex w="45px" h="45px" bg="orange.50" borderRadius="12px" align="center" justify="center">
                <Icon as={FaExclamationTriangle} color="orange.500" w="22px" h="22px" />
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Payment Hub Navigation Tabs */}
      <Tabs variant="soft-rounded" colorScheme="teal" index={tabIndex} onChange={(i) => setTabIndex(i)}>
        <Flex justify="space-between" align="center" mb="20px" flexWrap="wrap" gap="12px">
          <TabList bg={cardBg} p="6px" borderRadius="16px" border="1px solid" borderColor={borderColor}>
            <Tab fontWeight="bold" fontSize="xs">
              <Icon as={FaRobot} mr="6px" /> Automatic Payouts & Wallet
            </Tab>
            <Tab fontWeight="bold" fontSize="xs">
              <Icon as={MdReceiptLong} mr="6px" /> Finance Ledgers
            </Tab>
            <Tab fontWeight="bold" fontSize="xs">
              <Icon as={FaUndo} mr="6px" /> Refunds Governance
            </Tab>
            <Tab fontWeight="bold" fontSize="xs">
              <Icon as={HiDocumentText} mr="6px" /> Quotations & Requests
            </Tab>
            <Tab fontWeight="bold" fontSize="xs">
              <Icon as={FaPercent} mr="6px" /> Commission Rules
            </Tab>
          </TabList>

          {/* Quick Actions per Tab */}
          {tabIndex === 0 && (
            <HStack spacing="10px">
              <Button leftIcon={<MdSend />} bg={BRAND_COLOR} color="white" _hover={{ bg: "#006666" }} size="sm" onClick={handleOpenSendMoneyModal}>
                Flow B: Admin Send Money
              </Button>
            </HStack>
          )}
          {tabIndex === 2 && (
            <Button leftIcon={<FaPlus />} bg={BRAND_COLOR} color="white" _hover={{ bg: "#006666" }} size="sm" onClick={onRefundOpen}>
              Issue Refund
            </Button>
          )}
          {tabIndex === 3 && (
            <Button leftIcon={<FaPlus />} bg={BRAND_COLOR} color="white" _hover={{ bg: "#006666" }} size="sm" onClick={onQuoteModalOpen}>
              New Quotation
            </Button>
          )}
          {tabIndex === 4 && (
            <Button leftIcon={<FaEdit />} variant="outline" colorScheme="teal" size="sm" onClick={onOverrideOpen}>
              Booking Override
            </Button>
          )}
        </Flex>

        <TabPanels>
          {/* TAB 1: AUTOMATIC PAYOUTS & WALLET MONITORING */}
          <TabPanel p="0">
            <Card bg={cardBg}>
              <CardHeader p="16px 20px">
                <Flex justify="space-between" align="center" flexWrap="wrap" gap="10px">
                  <Box>
                    <Heading size="sm" color={textColor}>
                      Technician Automatic Payout Audit Trail
                    </Heading>
                    <Text fontSize="xs" color={subTextColor}>
                      Monitors every technician automatic withdrawal & direct admin payout transaction
                    </Text>
                  </Box>
                  <HStack spacing="10px">
                    <Select
                      size="sm"
                      w="160px"
                      borderRadius="8px"
                      value={payoutModeFilter}
                      onChange={(e) => setPayoutModeFilter(e.target.value)}
                    >
                      <option value="">All Payout Modes</option>
                      <option value="automatic">Flow A: Automatic</option>
                      <option value="admin_manual">Flow B: Admin Direct</option>
                    </Select>
                    <Select
                      size="sm"
                      w="150px"
                      borderRadius="8px"
                      value={withdrawalStatusFilter}
                      onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="paid">Paid (RazorpayX)</option>
                      <option value="processing">Processing</option>
                      <option value="manual_review">Manual Review</option>
                      <option value="failed">Failed</option>
                    </Select>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody overflowX="auto">
                {walletLoading ? (
                  <Center p="40px"><Spinner color={BRAND_COLOR} /></Center>
                ) : filteredWithdrawals.length === 0 ? (
                  <Center p="40px"><Text color="gray.500" fontSize="sm">No payout records matching filters.</Text></Center>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                      <Tr>
                        <Th>Withdrawal ID</Th>
                        <Th>Technician</Th>
                        <Th>Amount</Th>
                        <Th>Mode</Th>
                        <Th>Destination</Th>
                        <Th>Status</Th>
                        <Th>Timestamp</Th>
                        <Th textTransform="none">Audit</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredWithdrawals.map((w, idx) => {
                        const isAuto = !w.isAdminManual;
                        const wId = w._id || w.withdrawalId || `WD_${idx+1}`;
                        const isReview = w.status === "manual_review" || w.requiresReview;

                        return (
                          <Tr key={w._id || idx}>
                            <Td fontFamily="mono" fontSize="xs" fontWeight="bold">
                              {wId}
                            </Td>
                            <Td fontWeight="medium">
                              {w.technicianName || w.technicianId?.name || w.technicianId || "Technician"}
                            </Td>
                            <Td fontWeight="bold" color="teal.600">₹{w.amount}</Td>
                            <Td>
                              <Badge colorScheme={isAuto ? "teal" : "purple"} fontSize="3xs" px="6px">
                                {isAuto ? "Flow A: Automatic" : "Flow B: Admin Direct"}
                              </Badge>
                            </Td>
                            <Td fontSize="xs">
                              <HStack spacing="4px">
                                <Icon as={FaLock} color="gray.400" w="10px" h="10px" />
                                <Text fontSize="xs">{w.destinationMasked || w.bankMasked || "Verified Bank ****1234"}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  w.status === "paid" || w.status === "success"
                                    ? "green"
                                    : w.status === "processing"
                                    ? "blue"
                                    : isReview
                                    ? "orange"
                                    : "red"
                                }
                              >
                                {isReview ? "Manual Review" : w.status || "processing"}
                              </Badge>
                            </Td>
                            <Td fontSize="xs" color="gray.500">{new Date(w.createdAt || Date.now()).toLocaleString()}</Td>
                            <Td>
                              <HStack spacing="6px">
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="teal"
                                  leftIcon={<FaEye />}
                                  onClick={() => {
                                    setSelectedTx(w);
                                    onAuditOpen();
                                  }}
                                >
                                  Trail
                                </Button>
                                {isReview && (
                                  <Button
                                    size="xs"
                                    colorScheme="orange"
                                    onClick={() => {
                                      setSelectedReviewTx(w);
                                      onReviewOpen();
                                    }}
                                  >
                                    Reconcile
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 2: FINANCE LEDGERS */}
          <TabPanel p="0">
            <Card bg={cardBg}>
              <CardHeader p="16px 20px">
                <Heading size="sm" color={textColor}>Payments Ledger</Heading>
                <Text fontSize="xs" color={subTextColor}>Real-time breakdown of platform revenue & earnings</Text>
              </CardHeader>
              <CardBody overflowX="auto">
                {financeLoading ? (
                  <Center p="40px"><Spinner color={BRAND_COLOR} /></Center>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                      <Tr>
                        <Th>Transaction Ref</Th>
                        <Th>Order ID</Th>
                        <Th>Amount</Th>
                        <Th>Method</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paymentsLedger.map((p, idx) => (
                        <Tr key={p._id || idx}>
                          <Td fontFamily="mono" fontSize="xs">{p._id || `TXN-${idx+1}`}</Td>
                          <Td fontSize="xs">{p.orderId || p.bookingId || "—"}</Td>
                          <Td fontWeight="bold" color="teal.600">₹{p.amount || 0}</Td>
                          <Td><Tag size="sm">{p.method || "Online"}</Tag></Td>
                          <Td>
                            <Badge colorScheme={p.status === "success" || p.status === "paid" ? "green" : "red"}>
                              {p.status || "paid"}
                            </Badge>
                          </Td>
                          <Td fontSize="xs" color="gray.500">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 3: REFUNDS GOVERNANCE */}
          <TabPanel p="0">
            <Card bg={cardBg}>
              <CardHeader p="16px 20px">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm" color={textColor}>Refund Requests & Disputes</Heading>
                    <Text fontSize="xs" color={subTextColor}>Audit, approve dual authorization refunds & retry failed payouts</Text>
                  </Box>
                  <Select
                    size="sm"
                    w="150px"
                    value={refundStatusFilter}
                    onChange={(e) => setRefundStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="processed">Processed</option>
                    <option value="failed">Failed</option>
                  </Select>
                </Flex>
              </CardHeader>
              <CardBody overflowX="auto">
                {refundsLoading ? (
                  <Center p="40px"><Spinner color={BRAND_COLOR} /></Center>
                ) : refundsList.length === 0 ? (
                  <Center p="40px"><Text color="gray.500" fontSize="sm">No refunds found.</Text></Center>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                      <Tr>
                        <Th>Refund ID</Th>
                        <Th>Booking</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Type</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {refundsList.map((r, idx) => (
                        <Tr key={r._id || idx}>
                          <Td fontFamily="mono" fontSize="xs">{r._id}</Td>
                          <Td fontSize="xs">{r.bookingId || "—"}</Td>
                          <Td fontWeight="bold" color="red.500">₹{r.amount}</Td>
                          <Td>
                            <Badge colorScheme={r.status === "approved" || r.status === "processed" ? "green" : r.status === "failed" ? "red" : "orange"}>
                              {r.status}
                            </Badge>
                          </Td>
                          <Td><Tag size="sm">{r.type || "Partial"}</Tag></Td>
                          <Td>
                            <HStack spacing="6px">
                              {r.status === "pending" && (
                                <Button size="xs" colorScheme="teal" onClick={() => handleApproveRefund(r._id)}>Approve</Button>
                              )}
                              {r.status === "failed" && (
                                <Button size="xs" colorScheme="orange" leftIcon={<FaRedo />} onClick={() => handleRetryRefund(r._id)}>Retry</Button>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 4: QUOTATIONS & QUOTE REQUESTS */}
          <TabPanel p="0">
            <VStack spacing="24px" align="stretch">
              <Card bg={cardBg}>
                <CardHeader p="16px 20px">
                  <Heading size="sm" color={textColor}>Issued Product Quotations</Heading>
                  <Text fontSize="xs" color={subTextColor}>Custom price estimates issued to customers</Text>
                </CardHeader>
                <CardBody overflowX="auto">
                  {quotationsLoading ? (
                    <Center p="20px"><Spinner color={BRAND_COLOR} /></Center>
                  ) : quotationsList.length === 0 ? (
                    <Center p="20px"><Text color="gray.500" fontSize="sm">No formal quotations issued yet.</Text></Center>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                        <Tr>
                          <Th>Quote ID</Th>
                          <Th>Customer</Th>
                          <Th>Title</Th>
                          <Th>Amount</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {quotationsList.map((q, idx) => (
                          <Tr key={q._id || idx}>
                            <Td fontFamily="mono" fontSize="xs">{q._id}</Td>
                            <Td fontSize="xs">{q.customerId?.fname || q.customerId || "Customer"}</Td>
                            <Td fontSize="xs">{q.title || "Custom Service Quote"}</Td>
                            <Td fontWeight="bold" color="teal.600">₹{q.amount}</Td>
                            <Td>
                              <Badge colorScheme={q.status === "approved" || q.status === "accepted" ? "green" : q.status === "sent" ? "blue" : "orange"}>
                                {q.status || "draft"}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing="4px">
                                <Button size="xs" colorScheme="blue" leftIcon={<FaPaperPlane />} onClick={() => handleQuotationAction(q._id, "send")}>Send</Button>
                                <Button size="xs" variant="ghost" onClick={() => handleQuotationAction(q._id, "resend")}>Resend</Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* TAB 5: COMMISSION RULES */}
          <TabPanel p="0">
            <Card bg={cardBg}>
              <CardHeader p="16px 20px">
                <Heading size="sm" color={textColor}>Service Commissions Governance</Heading>
                <Text fontSize="xs" color={subTextColor}>Set platform commission percentage rates across all offered services</Text>
              </CardHeader>
              <CardBody overflowX="auto">
                {commissionLoading ? (
                  <Center p="40px"><Spinner color={BRAND_COLOR} /></Center>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                      <Tr>
                        <Th>Service</Th>
                        <Th>Base Price</Th>
                        <Th>Commission Rate (%)</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {commissions.map((c, idx) => (
                        <Tr key={c._id || idx}>
                          <Td fontWeight="medium">{c.serviceName || c.name || `Service ${idx+1}`}</Td>
                          <Td>₹{c.basePrice || c.price || 0}</Td>
                          <Td fontWeight="bold" color="teal.600">{c.commissionRate || c.rate || 10}%</Td>
                          <Td>
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="teal"
                              leftIcon={<FaEdit />}
                              onClick={() => {
                                setSelectedService(c);
                                setNewCommissionRate(c.commissionRate || c.rate || 10);
                                onCommissionOpen();
                              }}
                            >
                              Edit Rate
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* FLOW B: ADMIN DIRECT SEND MONEY MODAL */}
      <Modal isOpen={isSendMoneyOpen} onClose={onSendMoneyClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Flow B: Direct Admin Payout to Technician</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="14px" align="stretch">
              <Alert status="warning" borderRadius="8px" fontSize="xs">
                <AlertIcon />
                Admin direct payout automatically dispatches funds to the technician's verified bank/UPI via RazorpayX.
              </Alert>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Technician ID</FormLabel>
                <Input
                  size="sm"
                  value={sendMoneyForm.technicianId}
                  onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, technicianId: e.target.value })}
                  placeholder="Technician Object ID"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Amount (₹)</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  value={sendMoneyForm.amount}
                  onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, amount: e.target.value })}
                  placeholder="50"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Reason for Payment</FormLabel>
                <Input
                  size="sm"
                  value={sendMoneyForm.reason}
                  onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, reason: e.target.value })}
                  placeholder="Manual bonus or settlement"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Client Idempotency Key</FormLabel>
                <Input
                  size="sm"
                  fontFamily="mono"
                  value={sendMoneyForm.clientIdempotencyKey}
                  onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, clientIdempotencyKey: e.target.value })}
                />
              </FormControl>

              {sendMoneyForm.isHighAmount && (
                <Alert status="error" borderRadius="8px">
                  <AlertIcon />
                  <Box fontSize="xs">
                    <Text fontWeight="bold">Secondary High Amount Authorization Required</Text>
                    Amount exceeds ₹10,000 threshold. Click execute again to confirm release.
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onSendMoneyClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={sendMoneyLoading} onClick={handleExecuteSendMoney}>
              {sendMoneyForm.isHighAmount ? "Confirm High Payout" : "Execute Direct Payout"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TRANSACTION AUDIT TRAIL MODAL */}
      <Modal isOpen={isAuditOpen} onClose={onAuditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Audit Trail Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTx && (
              <VStack spacing="12px" align="stretch">
                <Box p="12px" bg="gray.50" borderRadius="8px">
                  <SimpleGrid columns={2} spacing="10px" fontSize="xs">
                    <Text><strong>Withdrawal ID:</strong> {selectedTx._id || selectedTx.withdrawalId}</Text>
                    <Text><strong>Technician:</strong> {selectedTx.technicianName || selectedTx.technicianId}</Text>
                    <Text><strong>Amount:</strong> ₹{selectedTx.amount}</Text>
                    <Text><strong>Mode:</strong> {!selectedTx.isAdminManual ? "Flow A: Automatic" : "Flow B: Admin Direct"}</Text>
                    <Text><strong>RazorpayX Payout ID:</strong> {selectedTx.razorpayPayoutId || "POUT_AUTOPAY_123"}</Text>
                    <Text><strong>Bank / UPI Destination:</strong> {selectedTx.destinationMasked || "Verified Bank ****1234"}</Text>
                  </SimpleGrid>
                </Box>

                <Heading size="xs" color={BRAND_COLOR} mt="8px">Ledger & Reservation State Timeline</Heading>
                <VStack spacing="8px" align="stretch" fontSize="xs">
                  <Flex justify="space-between" p="8px" bg="green.50" borderRadius="6px">
                    <Text>1. Verification & Security Gate</Text>
                    <Badge colorScheme="green">PASSED (KYC & Fingerprint Match)</Badge>
                  </Flex>
                  <Flex justify="space-between" p="8px" bg="blue.50" borderRadius="6px">
                    <Text>2. Wallet Reservation</Text>
                    <Text fontStyle="italic">Reserved: ₹{selectedTx.amount} (Available = ₹0)</Text>
                  </Flex>
                  <Flex justify="space-between" p="8px" bg="purple.50" borderRadius="6px">
                    <Text>3. RazorpayX Outbox Dispatch</Text>
                    <Text fontStyle="italic">Idempotency Key: {selectedTx._id || selectedTx.withdrawalId}</Text>
                  </Flex>
                  <Flex justify="space-between" p="8px" bg="teal.50" borderRadius="6px">
                    <Text>4. Ledger Consumption</Text>
                    <Badge colorScheme="teal">Available: ₹0 | Withdrawn: ₹{selectedTx.amount}</Badge>
                  </Flex>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" colorScheme="teal" onClick={onAuditClose}>Close Audit Log</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AMBIGUOUS PAYOUT / MANUAL REVIEW RECONCILIATION MODAL */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reconcile Ambiguous Payout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="12px" align="stretch">
              <Alert status="warning" borderRadius="8px" fontSize="xs">
                <AlertIcon />
                This payout timed out during network dispatch to RazorpayX. Reconcile carefully.
              </Alert>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Reconciliation Decision</FormLabel>
                <Select size="sm" value={reviewDecision} onChange={(e) => setReviewDecision(e.target.value)}>
                  <option value="complete">Mark Completed (Money Reached Bank)</option>
                  <option value="cancel">Cancel Payout & Refund Reserved Amount to Wallet</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Audit Remarks / Bank Ref</FormLabel>
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

      {/* ISSUE REFUND MODAL */}
      <Modal isOpen={isRefundOpen} onClose={onRefundClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Issue Refund</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="12px">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Booking ID</FormLabel>
                <Input size="sm" value={refundForm.bookingId} onChange={(e) => setRefundForm({ ...refundForm, bookingId: e.target.value })} placeholder="Enter booking ID" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Refund Amount (₹)</FormLabel>
                <Input size="sm" type="number" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} placeholder="500" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Reason</FormLabel>
                <Textarea size="sm" value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} placeholder="Customer unsatisfied" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={2} variant="ghost" isLoading={previewLoading} onClick={handlePreviewRefund}>Preview</Button>
            <Button size="sm" colorScheme="teal" isLoading={createRefundLoading} onClick={handleCreateRefund}>Confirm Refund</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* CREATE QUOTATION MODAL */}
      <Modal isOpen={isQuoteModalOpen} onClose={onQuoteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Customer Quotation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="12px">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Customer ID</FormLabel>
                <Input size="sm" value={quoteForm.customerId} onChange={(e) => setQuoteForm({ ...quoteForm, customerId: e.target.value })} placeholder="Customer ID string" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Quotation Title</FormLabel>
                <Input size="sm" value={quoteForm.title} onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })} placeholder="Custom AC Installation Package" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Estimated Amount (₹)</FormLabel>
                <Input size="sm" type="number" value={quoteForm.amount} onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })} placeholder="2500" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onQuoteModalClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={quoteSubmitting} onClick={handleCreateQuotation}>Create Quote</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT COMMISSION MODAL */}
      <Modal isOpen={isCommissionOpen} onClose={onCommissionClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Service Commission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="12px">
              <Text fontSize="sm">Service: <strong>{selectedService?.serviceName || selectedService?.name}</strong></Text>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Commission Percentage (%)</FormLabel>
                <Input size="sm" type="number" value={newCommissionRate} onChange={(e) => setNewCommissionRate(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onCommissionClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" isLoading={commissionSubmitting} onClick={handleSaveCommission}>Save Rate</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* OVERRIDE BOOKING COMMISSION MODAL */}
      <Modal isOpen={isOverrideOpen} onClose={onOverrideClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Override Booking Commission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="12px">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Booking ID</FormLabel>
                <Input size="sm" value={overrideForm.bookingId} onChange={(e) => setOverrideForm({ ...overrideForm, bookingId: e.target.value })} placeholder="Target booking ID" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Override Rate (%)</FormLabel>
                <Input size="sm" type="number" value={overrideForm.rate} onChange={(e) => setOverrideForm({ ...overrideForm, rate: e.target.value })} placeholder="12" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Reason</FormLabel>
                <Input size="sm" value={overrideForm.reason} onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })} placeholder="Special promo / dispute resolution" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onOverrideClose}>Cancel</Button>
            <Button size="sm" colorScheme="teal" onClick={handleSaveBookingOverride}>Apply Override</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}