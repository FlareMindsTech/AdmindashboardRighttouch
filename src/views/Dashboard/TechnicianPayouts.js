import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  InputRightElement,
  Select,
  Icon,
  Tabs,
  TabList,
  Tab,
  useToast,
  useColorMode,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { FaSearch, FaRedo, FaTimes, FaFileCsv, FaPlus, FaMoneyBillWave } from "react-icons/fa";
import { MdRefresh, MdFileDownload, MdArrowDropDown } from "react-icons/md";

// Reusable TechnicianPayouts Components
import {
  PayoutSummaryCards,
  TechnicianPayoutsTable,
  WithdrawalDetailsDrawer,
  PayoutReceiptModal,
  RecordBankTransferModal,
  ApproveWithdrawalModal,
  RejectWithdrawalModal,
  SendMoneyModal,
} from "components/TechnicianPayouts";

import {
  generateWithdrawalsCsv,
  generateBulkBankCsv,
  downloadCsvFile,
} from "components/TechnicianPayouts/payoutExportUtils";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";

// API & Store
import { getWithdrawals } from "api/wallet";
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

// Status tab definitions mapped to backend withdrawal statuses
const STATUS_TABS = [
  { id: "all", label: "All Withdrawals", status: "", countKey: "all" },
  { id: "requested", label: "Pending Review", status: "requested", countKey: "requested" },
  { id: "pending", label: "Awaiting Approval", status: "pending", countKey: "pending" },
  { id: "approved", label: "Ready to Pay", status: "approved", countKey: "approved" },
  { id: "paid", label: "Paid", status: "paid", countKey: "paid" },
  { id: "rejected", label: "Rejected / Cancelled", status: "rejected,cancelled", countKey: "rejected" },
  { id: "failed", label: "Failed", status: "failed", countKey: "failed" },
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
  const rawTechnicians = useAppSelector(selectTechnicians);
  const techniciansList = useMemo(() => rawTechnicians || [], [rawTechnicians]);

  // Local Component State
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected Technician filter
  const [selectedTechFilter, setSelectedTechFilter] = useState("");

  // Tab & Filters State
  const [activeTabId, setActiveTabId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Modal / Drawer Target Objects
  const [selectedDrawerId, setSelectedDrawerId] = useState(null);
  const [targetReceiptId, setTargetReceiptId] = useState(null);
  const [targetRecordTransfer, setTargetRecordTransfer] = useState(null);
  const [targetApprove, setTargetApprove] = useState(null);
  const [targetReject, setTargetReject] = useState(null);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);

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
  }, [activeTabId, selectedTechFilter, searchTerm, page, limit, toast]);

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
    setPage(1);
  };

  // Trigger Refresh
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshSummaries(), fetchWithdrawalsList()]);
      toast({
        title: "Data Refreshed",
        description: "Updated withdrawal requests and platform wallet summaries.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Export handlers
  const handleExportAll = () => {
    try {
      if (!withdrawals || withdrawals.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no withdrawal records to export for the current filters.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const csv = generateWithdrawalsCsv(withdrawals);
      const filename = `RightTouch_Payouts_${activeTabId}_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsvFile(csv, filename);
      toast({
        title: "Export Successful",
        description: `Exported ${withdrawals.length} records to ${filename}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleExportBankBatch = () => {
    try {
      const approvedOnly = withdrawals.filter((w) => String(w.status).toLowerCase() === "approved");
      if (approvedOnly.length === 0) {
        toast({
          title: "No Approved Records",
          description: "Bank batch export requires records with 'Approved' status.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const csv = generateBulkBankCsv(approvedOnly);
      const filename = `RightTouch_BankBatch_Upload_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsvFile(csv, filename);
      toast({
        title: "Batch File Exported",
        description: `Exported ${approvedOnly.length} approved payments ready for bank upload.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Batch Export Failed",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Calculate live counts for each tab
  const tabCounts = useMemo(() => {
    const withdrawalsData = reduxWalletSummary?.withdrawals || reduxWalletSummary?.result?.withdrawals || {};
    const autoSummary = reduxAutoSummary?.result || reduxAutoSummary || {};

    const pending =
      withdrawalsData?.pending?.count ??
      withdrawalsData?.requested?.count ??
      autoSummary?.pendingApprovalCount ??
      0;

    const approved =
      withdrawalsData?.approved?.count ??
      autoSummary?.approvedAwaitingTransferCount ??
      0;

    const paid =
      withdrawalsData?.paid?.count ??
      autoSummary?.allTimePaidCount ??
      0;

    return {
      all: totalRecords,
      requested: pending,
      pending: pending,
      approved: approved,
      paid: paid,
      rejected: 0,
      failed: 0,
    };
  }, [reduxWalletSummary, reduxAutoSummary, totalRecords]);

  // Selected tech object for active filter chip display
  const selectedTechObj = useMemo(() => {
    if (!selectedTechFilter) return null;
    return techniciansList.find((t) => String(t._id || t.id || t.technicianId) === String(selectedTechFilter));
  }, [selectedTechFilter, techniciansList]);

  const selectedTechDisplayName = useMemo(() => {
    if (!selectedTechObj) return "";
    return (
      selectedTechObj.name ||
      (selectedTechObj.userId?.fname ? `${selectedTechObj.userId.fname} ${selectedTechObj.userId.lname || ""}`.trim() : "") ||
      selectedTechObj.fname ||
      "Technician"
    );
  }, [selectedTechObj]);

  const containerCardStyle = {
    bg: isDark ? "gray.850" : "white",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: isDark ? "gray.750" : "gray.100",
    boxShadow: isDark
      ? "0 8px 30px -4px rgba(0, 0, 0, 0.5)"
      : "0 4px 24px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02)",
    overflow: "hidden",
  };

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
            <HStack spacing={3} align="center">
              <Heading as="h1" size="lg" fontWeight="800" color={isDark ? "white" : "gray.800"}>
                Pay to Technician
              </Heading>
              <Badge colorScheme="teal" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs">
                Disbursement Console
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Review withdrawal requests, approve disbursements, and record bank transfers with one-click verification.
            </Text>
          </Box>

          {/* Header Action Buttons */}
          <HStack spacing={3} flexWrap="wrap">
            {/* Direct Payout / Send Money Button */}
            <Button
              size="sm"
              bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
              color="white"
              _hover={{
                bg: "linear-gradient(135deg, #006666 0%, #004d4d 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 128, 128, 0.35)",
              }}
              _active={{ transform: "translateY(0)" }}
              leftIcon={<FaPlus size={12} />}
              fontWeight="bold"
              borderRadius="10px"
              onClick={() => setIsSendMoneyOpen(true)}
            >
              Direct Payout
            </Button>

            {/* Export Menu */}
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                leftIcon={<MdFileDownload size={18} />}
                rightIcon={<MdArrowDropDown />}
                borderRadius="10px"
              >
                Export
              </MenuButton>
              <MenuList fontSize="xs" shadow="xl" borderRadius="12px" py={1.5} minW="220px">
                <MenuItem icon={<FaFileCsv color="#008080" size={14} />} onClick={handleExportAll}>
                  Export Filtered CSV ({withdrawals.length} records)
                </MenuItem>
                <MenuItem icon={<FaMoneyBillWave color="#2B6CB0" size={14} />} onClick={handleExportBankBatch}>
                  Export Bank Batch File (Approved Only)
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              borderRadius="10px"
              leftIcon={<MdRefresh size={16} />}
              isLoading={refreshing}
              loadingText="Refreshing..."
              onClick={handleRefreshAll}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {/* ================= 2. SUMMARY METRICS CARDS ================= */}
        <PayoutSummaryCards
          walletSummary={reduxWalletSummary}
          autoPayoutSummary={reduxAutoSummary}
          activeTab={activeTabId}
          onSelectTab={handleTabSelect}
          loading={loading && !reduxWalletSummary}
        />

        {/* ================= 3. MAIN CONTENT CARD ================= */}
        <Card {...containerCardStyle}>
          <CardBody p={{ base: "16px", md: "24px" }}>
            <VStack spacing={5} align="stretch">
              {/* STATUS TABS WITH LIVE COUNTERS */}
              <Tabs
                variant="soft-rounded"
                colorScheme="teal"
                index={STATUS_TABS.findIndex((t) => t.id === activeTabId)}
                onChange={(idx) => handleTabSelect(STATUS_TABS[idx].id)}
                overflowX="auto"
                pb={1}
              >
                <TabList gap={2} flexWrap="nowrap">
                  {STATUS_TABS.map((tab) => {
                    const count = tabCounts[tab.countKey];
                    const isSelected = activeTabId === tab.id;
                    return (
                      <Tab
                        key={tab.id}
                        fontSize="xs"
                        fontWeight="700"
                        borderRadius="full"
                        px={4}
                        py={2}
                        whiteSpace="nowrap"
                        _selected={{
                          bg: "teal.600",
                          color: "white",
                          boxShadow: "sm",
                        }}
                      >
                        {tab.label}
                        {count !== undefined && count > 0 && (
                          <Badge
                            ml={2}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="2xs"
                            bg={isSelected ? "whiteAlpha.300" : isDark ? "gray.700" : "gray.200"}
                            color={isSelected ? "white" : isDark ? "gray.200" : "gray.700"}
                          >
                            {count}
                          </Badge>
                        )}
                      </Tab>
                    );
                  })}
                </TabList>
              </Tabs>

              {/* FILTERS TOOLBAR */}
              <VStack spacing={3} align="stretch">
                <Flex
                  direction={{ base: "column", md: "row" }}
                  gap={3}
                  align={{ base: "stretch", md: "center" }}
                  justify="space-between"
                  bg={isDark ? "gray.800" : "gray.50"}
                  p={3}
                  borderRadius="14px"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                >
                  <HStack spacing={3} flex={1} flexWrap="wrap">
                    {/* Search Input with Clear Button */}
                    <InputGroup size="sm" maxW={{ base: "full", md: "300px" }}>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        borderRadius="10px"
                        placeholder="Search Tech, ID, or UTR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg={isDark ? "gray.900" : "white"}
                      />
                      {searchTerm && (
                        <InputRightElement>
                          <IconButton
                            size="2xs"
                            icon={<FaTimes />}
                            variant="ghost"
                            aria-label="Clear Search"
                            onClick={() => setSearchTerm("")}
                          />
                        </InputRightElement>
                      )}
                    </InputGroup>

                    {/* Technician Filter */}
                    <Select
                      size="sm"
                      w={{ base: "full", sm: "220px" }}
                      borderRadius="10px"
                      placeholder="All Technicians"
                      value={selectedTechFilter}
                      bg={isDark ? "gray.900" : "white"}
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
                  </HStack>

                  {/* Reset Filters Button */}
                  {(searchTerm || selectedTechFilter) && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<FaRedo />}
                      onClick={handleResetFilters}
                      borderRadius="8px"
                    >
                      Reset Filters
                    </Button>
                  )}
                </Flex>

                {/* Active Filter Chips */}
                {(searchTerm || selectedTechFilter) && (
                  <HStack spacing={2} flexWrap="wrap" px={1}>
                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                      Active Filters:
                    </Text>
                    {searchTerm && (
                      <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="teal">
                        <TagLabel>Search: &quot;{searchTerm}&quot;</TagLabel>
                        <TagCloseButton onClick={() => setSearchTerm("")} />
                      </Tag>
                    )}
                    {selectedTechFilter && (
                      <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="blue">
                        <TagLabel>Technician: {selectedTechDisplayName}</TagLabel>
                        <TagCloseButton onClick={() => setSelectedTechFilter("")} />
                      </Tag>
                    )}
                  </HStack>
                )}
              </VStack>

              {/* ================= 4. TABLE ================= */}
              <TechnicianPayoutsTable
                withdrawals={withdrawals}
                loading={loading}
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
                onRetry={fetchWithdrawalsList}
              />
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Direct Send Money / Payout Modal */}
      {isSendMoneyOpen && (
        <SendMoneyModal
          isOpen={isSendMoneyOpen}
          onClose={() => setIsSendMoneyOpen(false)}
          technicians={techniciansList}
          onSuccess={() => {
            fetchWithdrawalsList();
            refreshSummaries();
          }}
        />
      )}

      {/* Details Slide-out Drawer */}
      <WithdrawalDetailsDrawer
        isOpen={!!selectedDrawerId}
        onClose={() => setSelectedDrawerId(null)}
        withdrawalId={selectedDrawerId}
        onOpenRecordTransfer={(item) => setTargetRecordTransfer(item)}
        onOpenApprove={(item) => setTargetApprove(item)}
        onOpenReject={(item) => setTargetReject(item)}
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
    </Box>
  );
}
