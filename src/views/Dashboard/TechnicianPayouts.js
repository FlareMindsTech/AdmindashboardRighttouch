import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Icon,
  IconButton,
  Tabs,
  TabList,
  Tab,
  useToast,
  useColorMode,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaRedo,
  FaFileDownload,
  FaPlus,
  FaUniversity,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

// Reusable TechnicianPayouts Components
import {
  PayoutSummaryCards,
  TechnicianWalletDetailsCard,
  TechnicianPayoutsTable,
  WithdrawalDetailsDrawer,
  PayoutReceiptModal,
  RecordBankTransferModal,
  ApproveWithdrawalModal,
  RejectWithdrawalModal,
  RevertPaidModal,
  ResolveManualReviewModal,
  SendMoneyModal,
  FreezePayoutModal,
} from "components/TechnicianPayouts";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import { getSkeuomorphicCardStyle } from "components/common/skeuomorphicStyles";

// API & Store
import {
  getWithdrawals,
  exportWithdrawals,
  exportBulkPayments,
} from "api/wallet";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchTechnicians as fetchTechniciansShared,
  selectTechnicians,
} from "store/slices/techniciansSlice";
import {
  fetchWalletSummary,
  fetchAutoPayoutSummary as fetchAutoPayoutSummaryThunk,
  selectWalletSummary,
  selectAutoPayoutSummary,
} from "store/slices/walletSlice";
import {
  generateWithdrawalsCsv,
  generateBulkBankCsv,
  downloadCsvFile,
} from "components/TechnicianPayouts/payoutExportUtils";

// Status tab definitions mapped to backend withdrawal statuses
const STATUS_TABS = [
  { id: "all", label: "All Withdrawals", status: "" },
  { id: "requested", label: "Pending / Requested", status: "requested" },
  { id: "pending", label: "Awaiting Approval", status: "pending" },
  { id: "approved", label: "Approved — Awaiting Transfer", status: "approved" },
  { id: "paid", label: "Paid", status: "paid" },
  { id: "rejected", label: "Rejected / Cancelled", status: "rejected,cancelled" },
  { id: "failed", label: "Failed / Reverted", status: "failed" },
  { id: "manual_review", label: "Manual Review", status: "manual_review" },
];

export default function TechnicianPayouts() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();
  const dispatch = useAppDispatch();

  // Current authenticated user (Owner / Admin)
  const [currentUser, setCurrentUser] = useState(null);

  // Redux Shared Data (Authoritative Single Source of Truth)
  const reduxWalletSummary = useAppSelector(selectWalletSummary);
  const reduxAutoSummary = useAppSelector(selectAutoPayoutSummary);
  const techniciansList = useAppSelector(selectTechnicians) || [];

  // Local Component State
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);

  // Selected Technician for Wallet Details Console
  const [selectedTechId, setSelectedTechId] = useState("");
  const [selectedTechFilter, setSelectedTechFilter] = useState("");

  // Tab & Filters State
  const [activeTabId, setActiveTabId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [payoutMode, setPayoutMode] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Modal / Drawer Target Objects
  const [selectedDrawerId, setSelectedDrawerId] = useState(null);
  const [targetReceiptId, setTargetReceiptId] = useState(null);
  const [targetRecordTransfer, setTargetRecordTransfer] = useState(null);
  const [targetApprove, setTargetApprove] = useState(null);
  const [targetReject, setTargetReject] = useState(null);
  const [targetRevert, setTargetRevert] = useState(null);
  const [targetResolveReview, setTargetResolveReview] = useState(null);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [targetFreezeTech, setTargetFreezeTech] = useState(null);

  // 1. Load User from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not parse current user:", e);
    }
  }, []);

  // 2. Fetch Technicians for Send Money & Wallet Console dropdown
  useEffect(() => {
    dispatch(fetchTechniciansShared());
  }, [dispatch]);

  // 3. Fetch Platform Wallet Summary & Auto Payout Summary (via Redux with TTL & Deduplication)
  const refreshSummaries = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchWalletSummary({ force: true })).unwrap().catch((err) => console.warn("Wallet summary refresh warning:", err)),
        dispatch(fetchAutoPayoutSummaryThunk({ force: true })).unwrap().catch((err) => console.warn("Auto payout summary refresh warning:", err)),
      ]);
    } catch (err) {
      console.warn("Error refreshing summaries:", err);
    }
  }, [dispatch]);

  // 4. Fetch Withdrawals with Active Filters & Server-Side Pagination
  const fetchWithdrawalsList = useCallback(async () => {
    setLoading(true);
    try {
      const activeTabObj = STATUS_TABS.find((t) => t.id === activeTabId);
      const params = {
        page,
        limit,
      };

      if (activeTabObj && activeTabObj.status) {
        params.status = activeTabObj.status;
      }
      if (selectedTechFilter) {
        params.technicianId = selectedTechFilter;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        params.search = term;
        if (term.length === 24 && /^[0-9a-fA-F]{24}$/.test(term)) {
          params.withdrawalId = term;
        } else if (term.toUpperCase().startsWith("UTR")) {
          params.utr = term;
        } else if (/^\d{10}$/.test(term)) {
          params.mobileNumber = term;
        }
      }
      if (payoutMode) {
        params.payoutMode = payoutMode;
      }
      if (minAmount && !isNaN(Number(minAmount))) {
        params.minAmount = Number(minAmount);
      }
      if (maxAmount && !isNaN(Number(maxAmount))) {
        params.maxAmount = Number(maxAmount);
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const { data, error } = await getWithdrawals(params);

      if (error) {
        toast({
          title: "Error Loading Withdrawals",
          description: error,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setWithdrawals([]);
        setTotalRecords(0);
        setTotalPages(1);
      } else {
        const list = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setWithdrawals(list);
        const totalCount = data?.total != null ? data.total : list.length;
        const calculatedPages = Math.ceil(totalCount / limit) || 1;
        setTotalRecords(totalCount);
        setTotalPages(data?.totalPages != null ? data.totalPages : calculatedPages);
      }
    } catch (err) {
      console.error("fetchWithdrawalsList error:", err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, [activeTabId, selectedTechFilter, searchTerm, payoutMode, minAmount, maxAmount, startDate, endDate, page, limit, toast]);

  // Initial and reactive load
  useEffect(() => {
    refreshSummaries();
  }, [refreshSummaries]);

  useEffect(() => {
    fetchWithdrawalsList();
  }, [fetchWithdrawalsList]);

  // Handle Tab Click
  const handleTabSelect = (tabId) => {
    setActiveTabId(tabId);
    setPage(1);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedTechFilter("");
    setPayoutMode("");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Trigger Refresh
  const handleRefreshAll = () => {
    refreshSummaries();
    fetchWithdrawalsList();
    toast({
      title: "Data Refreshed",
      description: "Updated withdrawal requests and platform wallet summaries.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Export Filtered Withdrawals CSV (RFC 4180 with Formula Injection Protection)
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const activeTabObj = STATUS_TABS.find((t) => t.id === activeTabId);
      const params = {};
      if (activeTabObj && activeTabObj.status) params.status = activeTabObj.status;
      if (selectedTechFilter) params.technicianId = selectedTechFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data, error } = await exportWithdrawals(params);
      if (error) throw new Error(error);

      let csvText;
      if (typeof data === "string" && (data.includes(",") || data.includes("\n"))) {
        csvText = data;
      } else {
        const records = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : withdrawals;
        csvText = generateWithdrawalsCsv(records);
      }

      downloadCsvFile(csvText, `technician_payouts_${new Date().toISOString().slice(0, 10)}.csv`);

      toast({
        title: "Report Exported",
        description: "Filtered payouts report downloaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err.message || "Could not generate CSV export.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  // Export Approved Bulk Payments for Bank Net Banking Upload (Batch NEFT / CMS)
  const handleExportBulkBankCSV = async () => {
    setBulkExporting(true);
    try {
      const { data, error } = await exportBulkPayments();
      if (error) throw new Error(error);

      let csvText;
      if (typeof data === "string" && (data.includes(",") || data.includes("\n"))) {
        csvText = data;
      } else {
        const records = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : withdrawals.filter((w) => w.status === "approved");
        csvText = generateBulkBankCsv(records);
      }

      downloadCsvFile(csvText, `approved_bulk_bank_transfer_${new Date().toISOString().slice(0, 10)}.csv`);

      toast({
        title: "Bank Batch File Exported",
        description: "Exported approved payouts for batch NEFT upload in your bank corporate portal.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Bulk Export Failed",
        description: err.message || "Could not generate bulk payment export.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setBulkExporting(false);
    }
  };

  // Card container styling from skeuomorphic tokens
  const containerCardStyle = getSkeuomorphicCardStyle(isDark, false);

  return (
    <Box pt={{ base: "120px", md: "80px" }} px={{ base: "16px", md: "24px" }} pb="40px">
      <VStack spacing={6} align="stretch">
        {/* ================= 1. PAGE HEADER ================= */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "flex-start", lg: "center" }}
          gap={4}
        >
          <Box>
            <Breadcrumb fontSize="xs" color="gray.500" mb={1}>
              <BreadcrumbItem>
                <BreadcrumbLink href="#/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#/admin/finance">Finance</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink fontWeight="600" color="teal.600">
                  Technician Payouts Console
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Heading as="h1" size="lg" fontWeight="800" color={isDark ? "white" : "gray.800"}>
              Technician Payout Console
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Manage withdrawal requests, manual bank transfers, payment verification, and reconciliation.
            </Text>
          </Box>

          {/* Header Action Buttons */}
          <HStack spacing={3} flexWrap="wrap">
            <Button
              size="sm"
              colorScheme="teal"
              leftIcon={<FaPlus />}
              fontWeight="700"
              onClick={() => setIsSendMoneyOpen(true)}
            >
              Send Money
            </Button>
            <Tooltip label="Download pre-formatted CSV of approved payouts for corporate bank portal upload" hasArrow>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<FaUniversity />}
                isLoading={bulkExporting}
                loadingText="Exporting..."
                onClick={handleExportBulkBankCSV}
              >
                Bulk Bank Export
              </Button>
            </Tooltip>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FaFileDownload />}
              isLoading={exporting}
              loadingText="Exporting..."
              onClick={handleExportCSV}
            >
              Export Report
            </Button>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<MdRefresh size={18} />}
              aria-label="Refresh Data"
              onClick={handleRefreshAll}
            />
          </HStack>
        </Flex>

        {/* ================= ARCHITECTURE SAFETY NOTICE ================= */}
        <Alert
          status="info"
          borderRadius="14px"
          bg={isDark ? "blue.950" : "blue.50"}
          border="1px solid"
          borderColor={isDark ? "blue.800" : "blue.200"}
          py={3}
          px={4}
        >
          <AlertIcon color="blue.500" boxSize={5} />
          <Box fontSize="xs">
            <AlertTitle fontWeight="700" color={isDark ? "blue.200" : "blue.800"}>
              Manual Bank Transfer Workflow (Manual-NEFT / IMPS)
            </AlertTitle>
            <AlertDescription color={isDark ? "blue.300" : "blue.700"}>
              Automated RazorpayX payouts have been permanently removed. All approved technician payouts must be processed manually through your banking portal (NEFT / IMPS / UPI / RTGS). After completing the bank transfer, record the UTR reference number to finalize the payout and update technician ledger records.
            </AlertDescription>
          </Box>
        </Alert>

        {/* ================= 2. SUMMARY CARDS ================= */}
        <PayoutSummaryCards
          walletSummary={reduxWalletSummary}
          autoPayoutSummary={reduxAutoSummary}
          activeTab={activeTabId}
          onSelectTab={handleTabSelect}
          loading={loading && !reduxWalletSummary}
        />

        {/* ================= 3. TECHNICIAN WALLET DETAILS CONSOLE ================= */}
        <TechnicianWalletDetailsCard
          technicians={techniciansList}
          selectedTechId={selectedTechId}
          onSelectTechnician={(id) => setSelectedTechId(id)}
          onOpenSendMoney={(tech) => {
            setSelectedTechId(tech._id || tech.technicianId);
            setIsSendMoneyOpen(true);
          }}
          onOpenFreeze={(tech) => setTargetFreezeTech(tech)}
          onFilterTableByTech={(id) => {
            setSelectedTechFilter(id);
            setPage(1);
          }}
        />

        {/* ================= 4. MAIN CONTENT CARD ================= */}
        <Card {...containerCardStyle}>
          <CardBody p={{ base: "16px", md: "24px" }}>
            <VStack spacing={5} align="stretch">
              {/* STATUS TABS */}
              <Tabs
                variant="soft-rounded"
                colorScheme="teal"
                index={STATUS_TABS.findIndex((t) => t.id === activeTabId)}
                onChange={(idx) => handleTabSelect(STATUS_TABS[idx].id)}
                overflowX="auto"
                pb={1}
              >
                <TabList gap={2} flexWrap="wrap">
                  {STATUS_TABS.map((tab) => (
                    <Tab
                      key={tab.id}
                      fontSize="xs"
                      fontWeight="700"
                      borderRadius="full"
                      px={4}
                      py={2}
                      _selected={{
                        bg: "teal.600",
                        color: "white",
                        boxShadow: "sm",
                      }}
                    >
                      {tab.label}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>

              {/* FILTERS TOOLBAR */}
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={3}
                align={{ base: "stretch", md: "center" }}
                justify="space-between"
                bg={isDark ? "gray.800" : "gray.50"}
                p={3}
                borderRadius="12px"
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <HStack spacing={3} flex={1} flexWrap="wrap">
                  {/* Search Input */}
                  <InputGroup size="sm" maxW={{ base: "full", md: "240px" }}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      borderRadius="8px"
                      placeholder="Search Tech, ID, or UTR..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  {/* Technician Filter */}
                  <Select
                    size="sm"
                    w={{ base: "full", sm: "170px" }}
                    borderRadius="8px"
                    placeholder="All Technicians"
                    value={selectedTechFilter}
                    onChange={(e) => {
                      setSelectedTechFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    {techniciansList.map((t) => {
                      const id = t._id || t.id || t.technicianId;
                      const name =
                        t.name ||
                        (t.userId?.fname ? `${t.userId.fname} ${t.userId.lname || ""}`.trim() : "") ||
                        t.fname ||
                        "Technician";
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </Select>

                  {/* Payout Mode Filter */}
                  <Select
                    size="sm"
                    w={{ base: "full", sm: "120px" }}
                    borderRadius="8px"
                    placeholder="All Modes"
                    value={payoutMode}
                    onChange={(e) => {
                      setPayoutMode(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="UPI">UPI</option>
                    <option value="RTGS">RTGS</option>
                  </Select>

                  {/* Min Amount Filter */}
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    w={{ base: "full", sm: "105px" }}
                    borderRadius="8px"
                    placeholder="Min ₹"
                    value={minAmount}
                    onChange={(e) => {
                      setMinAmount(e.target.value);
                      setPage(1);
                    }}
                  />

                  {/* Max Amount Filter */}
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    w={{ base: "full", sm: "105px" }}
                    borderRadius="8px"
                    placeholder="Max ₹"
                    value={maxAmount}
                    onChange={(e) => {
                      setMaxAmount(e.target.value);
                      setPage(1);
                    }}
                  />

                  {/* Date Range Start */}
                  <Input
                    size="sm"
                    type="date"
                    w={{ base: "full", sm: "135px" }}
                    borderRadius="8px"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                  />

                  {/* Date Range End */}
                  <Input
                    size="sm"
                    type="date"
                    w={{ base: "full", sm: "135px" }}
                    borderRadius="8px"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </HStack>

                {/* Reset Filters Button */}
                {(searchTerm || selectedTechFilter || payoutMode || minAmount || maxAmount || startDate || endDate) && (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<FaRedo />}
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                )}
              </Flex>

              {/* ================= 5. TABLE ================= */}
              <TechnicianPayoutsTable
                withdrawals={withdrawals}
                loading={loading}
                currentUser={currentUser}
                page={page}
                totalPages={totalPages}
                total={totalRecords}
                limit={limit}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                onViewDetails={(item) => setSelectedDrawerId(item._id || item.withdrawalId)}
                onViewReceipt={(item) => setTargetReceiptId(item._id || item.withdrawalId)}
                onRecordTransfer={(item) => setTargetRecordTransfer(item)}
                onApprove={(item) => setTargetApprove(item)}
                onReject={(item) => setTargetReject(item)}
                onRevert={(item) => setTargetRevert(item)}
                onResolveReview={(item) => setTargetResolveReview(item)}
                onFreezeTechnician={(tech) => setTargetFreezeTech(tech)}
                onRetry={fetchWithdrawalsList}
              />
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Details Slide-out Drawer */}
      <WithdrawalDetailsDrawer
        isOpen={!!selectedDrawerId}
        onClose={() => setSelectedDrawerId(null)}
        withdrawalId={selectedDrawerId}
        currentUser={currentUser}
        onOpenRecordTransfer={(item) => setTargetRecordTransfer(item)}
        onOpenApprove={(item) => setTargetApprove(item)}
        onOpenReject={(item) => setTargetReject(item)}
        onOpenRevert={(item) => setTargetRevert(item)}
        onOpenFreeze={(tech) => setTargetFreezeTech(tech)}
        onViewReceipt={(item) => setTargetReceiptId(item.withdrawalId || item._id)}
      />

      {/* Official Payout Receipt Modal */}
      {targetReceiptId && (
        <PayoutReceiptModal
          isOpen={!!targetReceiptId}
          onClose={() => setTargetReceiptId(null)}
          withdrawalId={targetReceiptId}
        />
      )}

      {/* Record Bank Transfer (Mark Paid) Modal */}
      {targetRecordTransfer && (
        <RecordBankTransferModal
          isOpen={!!targetRecordTransfer}
          onClose={() => setTargetRecordTransfer(null)}
          withdrawal={targetRecordTransfer}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}

      {/* Approve Withdrawal Modal */}
      {targetApprove && (
        <ApproveWithdrawalModal
          isOpen={!!targetApprove}
          onClose={() => setTargetApprove(null)}
          withdrawal={targetApprove}
          currentUser={currentUser}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}

      {/* Reject Withdrawal Modal */}
      {targetReject && (
        <RejectWithdrawalModal
          isOpen={!!targetReject}
          onClose={() => setTargetReject(null)}
          withdrawal={targetReject}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}

      {/* Revert Paid Payment (Owner Only) Modal */}
      {targetRevert && (
        <RevertPaidModal
          isOpen={!!targetRevert}
          onClose={() => setTargetRevert(null)}
          withdrawal={targetRevert}
          currentUser={currentUser}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}

      {/* Resolve Manual Review Modal */}
      {targetResolveReview && (
        <ResolveManualReviewModal
          isOpen={!!targetResolveReview}
          onClose={() => setTargetResolveReview(null)}
          withdrawal={targetResolveReview}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}

      {/* Send Money (Direct Admin Payout) Modal */}
      <SendMoneyModal
        isOpen={isSendMoneyOpen}
        onClose={() => setIsSendMoneyOpen(false)}
        technicians={techniciansList}
        onSuccess={() => {
          fetchWithdrawalsList();
          refreshSummaries();
        }}
      />

      {/* Freeze / Unfreeze Technician Modal */}
      {targetFreezeTech && (
        <FreezePayoutModal
          isOpen={!!targetFreezeTech}
          onClose={() => setTargetFreezeTech(null)}
          technician={targetFreezeTech}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}
    </Box>
  );
}
