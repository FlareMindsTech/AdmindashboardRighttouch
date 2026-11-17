// src/components/Scheduling/DispatchQueueTab.js
// Dispatch Queue & Worker Operations Tab — User Friendly & Easy to Read
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Center,
  Badge,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Icon,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorMode,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaCopy,
  FaCheck,
  FaRedoAlt,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaPlay,
  FaStop,
  FaInfoCircle,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAppToast } from "components/feedback";
import StatusBadge from "components/common/StatusBadge";
import TablePagination from "components/common/TablePagination";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import {
  getDispatchPending,
  getDispatchFailed,
  retryDispatch,
  retryFailedDispatches,
  restartDispatchWorker,
  stopDispatchWorker,
} from "api/scheduling";
import {
  formatFriendlyDateTime,
  formatFriendlyRelativeTime,
  formatFriendlyDispatchError,
} from "./schedulingFormatters";

export default function DispatchQueueTab({
  onInspectBooking,
  stats,
  health,
  onRefreshStats,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [queueTab, setQueueTab] = useState(0); // 0: Pending, 1: Failed
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [copiedKey, setCopiedKey] = useState("");

  const copyToClipboard = (text, key, label = "Item") => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text).trim());
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    toast({
      title: "Copied!",
      description: `${label}: ${text}`,
      status: "info",
      duration: 1800,
      isClosable: true,
    });
  };

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const isPending = queueTab === 0;
    const params = { page, limit };
    if (isPending) params.status = "all"; // return both pending and inflight

    const fn = isPending ? getDispatchPending : getDispatchFailed;
    const { data, error } = await fn(params);
    setLoading(false);

    if (error) {
      toast.error(error, { title: "Failed to load dispatch queue", duration: 3000, isClosable: true });
      return;
    }

    const res = data?.result ?? data?.data ?? data ?? {};
    const items = Array.isArray(res) ? res : res?.items ?? res?.jobs ?? res?.rows ?? [];
    setRows(items);
    setPagination(
      res?.pagination ?? {
        total: items.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(items.length / limit)),
      }
    );
  }, [queueTab, page, limit, toast]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Actions
  const handleRetryOne = async (row) => {
    const id = row?._id || row?.dispatchId || row?.id || row?.bookingId;
    if (!id) return;
    setActionLoadingId(id);
    const { error, status } = await retryDispatch(id);
    setActionLoadingId(null);

    if (error) {
      if (status === 409) {
        toast({
          title: "Already Active in Queue",
          description: "This booking is currently being processed or broadcasted to technicians.",
          status: "info",
          duration: 3500,
          isClosable: true,
        });
        return;
      }
      toast.error(error, { title: "Retry failed", duration: 3500, isClosable: true });
      return;
    }

    toast({
      title: "Dispatch Requeued",
      description: `Job #${String(id).slice(-8)} re-added to active execution pipeline.`,
      status: "success",
      duration: 2500,
      isClosable: true,
    });
    loadQueue();
    if (onRefreshStats) onRefreshStats();
  };

  const openConfirm = (action) => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "retry-all") {
      const { error } = await retryFailedDispatches();
      if (error) throw new Error(error);
      toast({
        title: "All failed jobs requeued",
        description: "Every failed outbox row is back in the dispatch queue.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadQueue();
      if (onRefreshStats) onRefreshStats();
      return;
    }

    const isStop = confirmAction === "stop";
    const { error } = isStop
      ? await stopDispatchWorker()
      : await restartDispatchWorker();

    if (error) throw new Error(error);

    toast({
      title: isStop ? "Dispatch worker stopped" : "Dispatch worker restarted",
      description: isStop
        ? "New scheduled jobs will stay queued until the worker is restarted."
        : "Technician matching has resumed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    if (onRefreshStats) onRefreshStats();
  };

  const confirmContent =
    confirmAction === "retry-all"
      ? {
          title: "Retry every failed dispatch?",
          description:
            "All failed jobs will be requeued and offered to eligible technicians again.",
          confirmText: "Retry all failed",
          confirmColorScheme: "red",
          icon: FaRedoAlt,
        }
      : confirmAction === "stop"
      ? {
          title: "Stop the dispatch worker?",
          description:
            "Scheduled jobs will stay in the queue and no new technicians will be matched until the worker is restarted.",
          confirmText: "Stop worker",
          confirmColorScheme: "red",
          icon: FaStop,
        }
      : {
          title: "Restart the dispatch worker?",
          description:
            "The worker will restart and resume matching. Live dispatch processing may pause for a few seconds.",
          confirmText: "Restart worker",
          confirmColorScheme: "orange",
          icon: FaPlay,
        };

  // Filtered rows by search
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const idStr = String(r?._id || r?.id || r?.bookingId || "").toLowerCase();
      const errStr = String(r?.error || r?.errorMessage || r?.reason || "").toLowerCase();
      const statusStr = String(r?.status || "").toLowerCase();
      return idStr.includes(q) || errStr.includes(q) || statusStr.includes(q);
    });
  }, [rows, search]);

  const idOf = (r) => r?._id || r?.dispatchId || r?.id || "—";
  const bookingOf = (r) => r?.bookingId?._id || r?.bookingId || r?.orderId || "";

  return (
    <Box>
      {/* Top Controls Bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={4}
        gap={3}
      >
        <HStack spacing={2} flexWrap="wrap">
          <InputGroup size="sm" maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by Job ID or failure reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="8px"
            />
            {search && (
              <InputRightElement>
                <IconButton
                  size="xs"
                  icon={<FaTimes size={10} />}
                  variant="ghost"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                />
              </InputRightElement>
            )}
          </InputGroup>

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<MdRefresh size={16} />}
            onClick={() => {
              loadQueue();
              if (onRefreshStats) onRefreshStats();
            }}
          >
            Refresh Queue
          </Button>
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          {queueTab === 1 && (
            <Button
              size="sm"
              colorScheme="red"
              variant="solid"
              leftIcon={<FaRedoAlt size={11} />}
              onClick={() => openConfirm("retry-all")}
            >
              Retry All Failed
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            leftIcon={<FaPlay size={10} />}
            onClick={() => openConfirm("restart")}
          >
            Restart Worker
          </Button>

          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={<FaStop size={10} />}
            onClick={() => openConfirm("stop")}
          >
            Stop Worker
          </Button>
        </HStack>
      </Flex>

      {/* Queue Tabs */}
      <Tabs
        index={queueTab}
        onChange={(idx) => {
          setQueueTab(idx);
          setPage(1);
        }}
        colorScheme="teal"
        variant="solid-rounded"
        size="sm"
        mb={4}
      >
        <TabList>
          <Tab>
            <HStack spacing={1.5}>
              <Icon as={FaClock} />
              <Text>Pending &amp; In-Flight</Text>
              <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="3xs">
                {stats?.pending ?? (queueTab === 0 ? rows.length : "—")}
              </Badge>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={1.5}>
              <Icon as={FaExclamationTriangle} />
              <Text>Failed Dispatch Rows</Text>
              <Badge colorScheme="red" borderRadius="full" px={2} fontSize="3xs">
                {stats?.failed ?? (queueTab === 1 ? rows.length : "—")}
              </Badge>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {[0, 1].map((tabIdx) => (
            <TabPanel key={tabIdx} px={0} py={2}>
              {loading ? (
                <Center py={16}>
                  <VStack spacing={3}>
                    <Spinner size="lg" color="#008080" thickness="3px" />
                    <Text fontSize="xs" color="gray.500">
                      Loading {tabIdx === 0 ? "active in-flight" : "failed"} queue jobs...
                    </Text>
                  </VStack>
                </Center>
              ) : filteredRows.length === 0 ? (
                <Center py={16}>
                  <VStack spacing={3}>
                    <Box p={4} bg={isDark ? "gray.800" : "gray.50"} borderRadius="full" color="green.500">
                      <Icon as={FaCheckCircle} boxSize={8} />
                    </Box>
                    <Text fontWeight="700" color="gray.600">
                      {tabIdx === 0 ? "Zero Pending Dispatch Jobs" : "Zero Failed Dispatch Rows"}
                    </Text>
                    <Text fontSize="xs" color="gray.500" maxW="360px" textAlign="center">
                      {tabIdx === 0
                        ? "All scheduled customer bookings have been dispatched and matched to technicians."
                        : "No failed jobs currently logged. All dispatch operations succeeded without exceptions."}
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <Box
                  overflowX="auto"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                >
                  <Table variant="simple" size="sm">
                    <Thead bg={isDark ? "gray.800" : "gray.50"}>
                      <Tr>
                        <Th py={3.5}>DISPATCH JOB ID</Th>
                        <Th py={3.5}>LINKED BOOKING</Th>
                        <Th py={3.5}>QUEUE STATE</Th>
                        <Th py={3.5}>ATTEMPTS</Th>
                        {tabIdx === 1 && <Th py={3.5}>FAILURE REASON (PLAIN ENGLISH)</Th>}
                        <Th py={3.5}>SCHEDULED / RECORDED TIME</Th>
                        <Th py={3.5} textAlign="center">
                          ACTIONS
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredRows.map((r, i) => {
                        const rowId = idOf(r);
                        const bId = bookingOf(r);
                        const status = String(r?.status || (tabIdx === 0 ? "pending" : "failed")).toLowerCase();
                        const attempts = r?.attempts ?? r?.retryCount ?? 1;
                        const errorFormatted = formatFriendlyDispatchError(
                          r?.error || r?.errorMessage || r?.lastError || r?.reason
                        );
                        const rawTimestamp = r?.createdAt || r?.updatedAt || r?.scheduledFor;
                        const friendlyTime = formatFriendlyDateTime(rawTimestamp);
                        const relativeTime = formatFriendlyRelativeTime(rawTimestamp);

                        return (
                          <Tr key={rowId + i} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                            {/* Job ID */}
                            <Td py={3}>
                              <HStack spacing={1}>
                                <Text
                                  fontSize="xs"
                                  fontFamily="mono"
                                  fontWeight="700"
                                  color={isDark ? "teal.300" : "teal.700"}
                                >
                                  #{String(rowId).slice(-8)}
                                </Text>
                                <Tooltip label="Copy Dispatch ID" hasArrow>
                                  <IconButton
                                    size="2xs"
                                    icon={
                                      <Icon
                                        as={copiedKey === `did_${rowId}` ? FaCheck : FaCopy}
                                        boxSize={2.5}
                                      />
                                    }
                                    variant="ghost"
                                    colorScheme={copiedKey === `did_${rowId}` ? "green" : "gray"}
                                    onClick={() => copyToClipboard(rowId, `did_${rowId}`, "Dispatch ID")}
                                    aria-label="Copy Dispatch ID"
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>

                            {/* Booking ID */}
                            <Td py={3}>
                              {bId ? (
                                <Badge
                                  cursor="pointer"
                                  variant="subtle"
                                  colorScheme="blue"
                                  fontSize="2xs"
                                  px={2}
                                  py={0.5}
                                  borderRadius="md"
                                  onClick={() => onInspectBooking && onInspectBooking(bId)}
                                  _hover={{ bg: "blue.100" }}
                                >
                                  Booking #{String(bId).slice(-8)}
                                </Badge>
                              ) : (
                                <Text fontSize="xs" color="gray.400">
                                  —
                                </Text>
                              )}
                            </Td>

                            {/* Status */}
                            <Td py={3}>
                              <StatusBadge
                                colorScheme={
                                  status === "failed"
                                    ? "red"
                                    : status === "inflight"
                                    ? "purple"
                                    : "yellow"
                                }
                                label={
                                  status === "failed"
                                    ? "Failed"
                                    : status === "inflight"
                                    ? "Dispatching"
                                    : "Ready in Queue"
                                }
                                variant={status === "failed" ? "solid" : "subtle"}
                                showDot
                              />
                            </Td>

                            {/* Attempts */}
                            <Td py={3} fontSize="xs">
                              <StatusBadge
                                colorScheme={attempts > 1 ? "orange" : "gray"}
                                label={`Attempt ${attempts}`}
                                variant="subtle"
                              />
                            </Td>

                            {/* Error Reason (Failed only) */}
                            {tabIdx === 1 && (
                              <Td py={3} maxW="300px">
                                <VStack align="flex-start" spacing={0.5}>
                                  <HStack spacing={1}>
                                    <Text fontSize="xs" fontWeight="700" color="red.600">
                                      {errorFormatted.title}
                                    </Text>
                                    {errorFormatted.raw && (
                                      <Popover trigger="hover" placement="top">
                                        <PopoverTrigger>
                                          <Box cursor="pointer" color="gray.400">
                                            <Icon as={FaInfoCircle} boxSize={3} />
                                          </Box>
                                        </PopoverTrigger>
                                        <PopoverContent fontSize="2xs" p={2} maxW="280px">
                                          <PopoverArrow />
                                          <PopoverHeader fontWeight="bold" fontSize="3xs">
                                            Technical Stack Trace
                                          </PopoverHeader>
                                          <PopoverBody fontFamily="mono" color="red.600">
                                            {errorFormatted.raw}
                                          </PopoverBody>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </HStack>
                                  <Text fontSize="3xs" color="gray.500" noOfLines={2}>
                                    {errorFormatted.details}
                                  </Text>
                                </VStack>
                              </Td>
                            )}

                            {/* Timestamp */}
                            <Td py={3}>
                              <VStack align="flex-start" spacing={0}>
                                <Text fontSize="xs" fontWeight="600">
                                  {friendlyTime}
                                </Text>
                                <Text fontSize="3xs" color="gray.400">
                                  {relativeTime}
                                </Text>
                              </VStack>
                            </Td>

                            {/* Actions */}
                            <Td py={3} textAlign="center">
                              <HStack spacing={1.5} justify="center">
                                <Button
                                  size="xs"
                                  colorScheme="teal"
                                  variant="solid"
                                  leftIcon={<FaRedoAlt size={10} />}
                                  isLoading={actionLoadingId === rowId}
                                  onClick={() => handleRetryOne(r)}
                                >
                                  Retry Now
                                </Button>

                                {bId && onInspectBooking && (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    leftIcon={<FaEye size={10} />}
                                    onClick={() => onInspectBooking(bId)}
                                  >
                                    Inspect
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

              {/* Pagination */}
              {filteredRows.length > 0 && (
                <Box mt={4}>
                  <TablePagination
                    page={pagination.page || page}
                    totalPages={pagination.totalPages || 1}
                    totalRows={pagination.total || rows.length}
                    indexOfFirst={(pagination.page - 1) * (pagination.limit || limit)}
                    indexOfLast={Math.min(
                      (pagination.page || page) * (pagination.limit || limit),
                      pagination.total || rows.length
                    )}
                    rowsPerPage={pagination.limit || limit}
                    onPageChange={setPage}
                    onRowsPerPageChange={(value) => {
                      setLimit(value);
                      setPage(1);
                    }}
                    label="dispatch jobs"
                  />
                </Box>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <ConfirmActionModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmContent.title}
        description={confirmContent.description}
        confirmText={confirmContent.confirmText}
        confirmColorScheme={confirmContent.confirmColorScheme}
        icon={confirmContent.icon}
        details={
          confirmAction === "retry-all"
            ? [
                `All failed dispatch rows will be replayed automatically.`,
                `Jobs that are already active in the queue will not be duplicated.`,
              ]
            : undefined
        }
      />
    </Box>
  );
}
