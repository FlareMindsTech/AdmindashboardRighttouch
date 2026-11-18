import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaDownload,
  FaExclamationTriangle,
  FaMobileAlt,
  FaPaperPlane,
  FaRedoAlt,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaUndoAlt,
  FaUniversity,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AppModal from "components/common/AppModal";
import RefreshButton from "components/common/RefreshButton";
import ErrorState from "components/feedback/ErrorState";
import TablePagination from "components/common/TablePagination";
import StatusBadge from "components/common/StatusBadge";
import { useAppToast } from "components/feedback";
import RefundDetailsDrawer from "components/AdminPayments/RefundDetailsDrawer";
import {
  REFUND_FILTERS,
  formatDate,
  formatINR,
  getRailLabel,
  getRefundAmountPaise,
  getRefundBookingId,
  getRefundBucket,
  getRefundCustomer,
  getRefundCustomerId,
  getRefundPaymentId,
  getRefundStatusMeta,
  isRefundRetryable,
} from "components/AdminPayments/refundUtils";
import {
  approveRefund,
  customerPayoutRefund,
  listRefunds,
  retryRefund,
} from "api/refundsComplaints";

const BRAND = "#008080";

const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return undefined;
    }

    let frame = null;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return value;
};

const refundSearchText = (refund) =>
  [
    refund?._id,
    refund?.id,
    getRefundCustomer(refund).name,
    getRefundCustomer(refund).contact,
    refund?.reason,
    getRefundBookingId(refund),
    getRefundPaymentId(refund),
    refund?.providerRefundId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function KpiCard({ label, value, hint, icon, accent, softBg, onClick }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      textAlign="left"
      position="relative"
      w="100%"
      p={5}
      cursor="pointer"
      bg="white"
      borderRadius="18px"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
      overflow="hidden"
      transition="transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 12px 26px rgba(16, 24, 40, 0.08)",
        borderColor: "gray.300",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "teal.400",
        outlineOffset: "2px",
      }}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={accent} />
      <HStack justify="space-between" align="flex-start" spacing={3}>
        <Box minW={0}>
          <Text
            fontSize="2xs"
            fontWeight="800"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="gray.500"
            noOfLines={1}
          >
            {label}
          </Text>
          <Heading
            as="div"
            mt={2}
            fontSize="2xl"
            fontWeight="900"
            letterSpacing="-0.03em"
            color="gray.900"
            noOfLines={1}
          >
            {value}
          </Heading>
          <Text fontSize="2xs" color="gray.500" mt={1} noOfLines={1}>
            {hint}
          </Text>
        </Box>
        <Flex
          w="40px"
          h="40px"
          borderRadius="12px"
          bg={softBg}
          color={accent}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} />
        </Flex>
      </HStack>
    </Box>
  );
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const toast = useAppToast();

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionBusy, setActionBusy] = useState("");

  const [payoutTarget, setPayoutTarget] = useState(null);
  const [payoutType, setPayoutType] = useState("bank");
  const [payoutForm, setPayoutForm] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    vpa: "",
  });
  const [payoutSaving, setPayoutSaving] = useState(false);

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await listRefunds();
    setLoading(false);

    if (error) {
      setLoadError(new Error(error));
      toast.error(error, {
        title: "Could not load refunds",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = data?.result ?? data?.data ?? data ?? {};
    const list = Array.isArray(result) ? result : result?.refunds ?? [];
    setRefunds(list);
  }, [toast]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  useEffect(() => {
    setPage(1);
  }, [filter, search, rowsPerPage]);

  useEffect(() => {
    if (!selectedRefund) return;
    const fresh = refunds.find(
      (item) =>
        String(item._id || item.id) ===
        String(selectedRefund._id || selectedRefund.id)
    );
    if (fresh) setSelectedRefund(fresh);
  }, [refunds, selectedRefund]);

  const stats = useMemo(() => {
    const counts = {
      all: refunds.length,
      awaiting: 0,
      progress: 0,
      refunded: 0,
      attention: 0,
    };
    let refundedPaise = 0;

    refunds.forEach((refund) => {
      const bucket = getRefundBucket(refund);
      counts[bucket] = (counts[bucket] || 0) + 1;
      if (bucket === "refunded") {
        refundedPaise += getRefundAmountPaise(refund);
      }
    });

    return {
      counts,
      refundedPaise,
      openCount: counts.awaiting + counts.progress + counts.attention,
    };
  }, [refunds]);

  const animatedRefundedPaise = useCountUp(stats.refundedPaise);

  const filteredRefunds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return refunds.filter((refund) => {
      const matchesFilter =
        filter === "all" || getRefundBucket(refund) === filter;
      if (!matchesFilter) return false;
      if (!query) return true;
      return refundSearchText(refund).includes(query);
    });
  }, [refunds, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRefunds.length / rowsPerPage)
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRefunds.slice(start, start + rowsPerPage);
  }, [filteredRefunds, page, rowsPerPage]);

  const openDrawer = (refund) => {
    setSelectedRefund(refund);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRefund(null);
  };

  const openConfirm = (type, refund) => {
    setDrawerOpen(false);
    setConfirmAction({ type, refund });
  };

  const closeConfirm = () => {
    if (actionBusy) return;
    setConfirmAction(null);
  };

  const runConfirmAction = async () => {
    if (!confirmAction?.refund) return;
    const refundId = String(
      confirmAction.refund._id || confirmAction.refund.id || ""
    );
    setActionBusy(confirmAction.type);

    const { error } =
      confirmAction.type === "approve"
        ? await approveRefund(refundId)
        : await retryRefund(refundId);

    setActionBusy("");

    if (error) {
      toast.error(error, {
        title:
          confirmAction.type === "approve"
            ? "Could not approve refund"
            : "Could not retry refund",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    toast({
      title:
        confirmAction.type === "approve"
          ? "Refund approved"
          : "Refund re-queued",
      description:
        confirmAction.type === "approve"
          ? "The refund is now queued for execution."
          : "A new execution attempt has been scheduled.",
      status: "success",
      duration: 2600,
      isClosable: true,
    });
    setConfirmAction(null);
    loadRefunds();
  };

  const openPayout = (refund) => {
    setDrawerOpen(false);
    setPayoutTarget(refund);
    setPayoutType("bank");
    setPayoutForm({
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      vpa: "",
    });
  };

  const closePayout = () => {
    if (payoutSaving) return;
    setPayoutTarget(null);
  };

  const submitPayout = async () => {
    if (!payoutTarget) return;
    const refundId = String(payoutTarget._id || payoutTarget.id || "");

    if (payoutType === "bank") {
      if (
        !payoutForm.accountName.trim() ||
        !payoutForm.accountNumber.trim() ||
        !payoutForm.ifscCode.trim()
      ) {
        toast({
          title: "Complete the bank details",
          description: "Account name, account number and IFSC are required.",
          status: "warning",
          duration: 2600,
          isClosable: true,
        });
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(payoutForm.ifscCode.trim())) {
        toast({
          title: "Check the IFSC code",
          description: "Enter a valid 11-character IFSC code.",
          status: "warning",
          duration: 2600,
          isClosable: true,
        });
        return;
      }
    } else if (!payoutForm.vpa.trim().includes("@")) {
      toast({
        title: "Check the UPI ID",
        description: "Enter a valid UPI ID, for example name@bank.",
        status: "warning",
        duration: 2600,
        isClosable: true,
      });
      return;
    }

    const destination =
      payoutType === "bank"
        ? {
            type: "bank",
            accountName: payoutForm.accountName.trim(),
            accountNumber: payoutForm.accountNumber.trim(),
            ifscCode: payoutForm.ifscCode.trim().toUpperCase(),
          }
        : {
            type: "vpa",
            vpa: payoutForm.vpa.trim(),
            accountName: payoutForm.accountName.trim() || undefined,
          };

    setPayoutSaving(true);
    const { error } = await customerPayoutRefund(refundId, destination);
    setPayoutSaving(false);

    if (error) {
      toast.error(error, {
        title: "Could not create customer payout",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Payout request created",
      description: "The refund is now waiting for payout approval.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setPayoutTarget(null);
    loadRefunds();
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  const applyKpiFilter = (nextFilter) => {
    setFilter(nextFilter);
    if (typeof document !== "undefined") {
      setTimeout(() => {
        document
          .getElementById("refund-ledger")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  const exportCsv = () => {
    if (!filteredRefunds.length) {
      toast({
        title: "Nothing to export",
        description: "No refunds match the current filters.",
        status: "info",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    const headers = [
      "Refund ID",
      "Booking ID",
      "Payment ID",
      "Customer",
      "Contact",
      "Net Refund (INR)",
      "Gross (INR)",
      "Status",
      "Rail",
      "Reason",
      "Attempts",
      "Created",
      "Settled",
    ];

    const lines = filteredRefunds.map((refund) => {
      const customer = getRefundCustomer(refund);
      const status = getRefundStatusMeta(refund);
      return [
        refund._id || refund.id || "",
        getRefundBookingId(refund),
        getRefundPaymentId(refund),
        customer.name,
        customer.contact,
        (getRefundAmountPaise(refund) / 100).toFixed(2),
        (Number(refund.grossPaise || 0) / 100).toFixed(2),
        status.label,
        getRailLabel(refund.rail),
        refund.reason || "",
        Number(refund.attempts || 0),
        refund.createdAt ? new Date(refund.createdAt).toISOString() : "",
        refund.processedAt ? new Date(refund.processedAt).toISOString() : "",
      ]
        .map(escapeCsv)
        .join(",");
    });

    const blob = new Blob(
      [`${headers.map(escapeCsv).join(",")}\n${lines.join("\n")}`],
      { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customer_refunds_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Refund ledger exported",
      description: `${filteredRefunds.length} refund records exported to CSV.`,
      status: "success",
      duration: 2400,
      isClosable: true,
    });
  };

  const kpis = [
    {
      key: "refunded",
      label: "Refunded",
      value: formatINR(stats.refundedPaise, { decimals: 0 }),
      hint: `${stats.counts.refunded} settled refund${
        stats.counts.refunded === 1 ? "" : "s"
      }`,
      icon: FaCheckCircle,
      accent: "green.500",
      softBg: "green.50",
      onClick: () => applyKpiFilter("refunded"),
    },
    {
      key: "awaiting",
      label: "Awaiting approval",
      value: stats.counts.awaiting,
      hint: "Owner sign-off required",
      icon: FaShieldAlt,
      accent: "orange.500",
      softBg: "orange.50",
      onClick: () => applyKpiFilter("awaiting"),
    },
    {
      key: "progress",
      label: "In progress",
      value: stats.counts.progress,
      hint: "Queued or executing",
      icon: FaClock,
      accent: "blue.500",
      softBg: "blue.50",
      onClick: () => applyKpiFilter("progress"),
    },
    {
      key: "attention",
      label: "Needs attention",
      value: stats.counts.attention,
      hint: "Failed or in manual review",
      icon: FaExclamationTriangle,
      accent: "red.500",
      softBg: "red.50",
      onClick: () => applyKpiFilter("attention"),
    },
  ];

  const hasActiveFilters = Boolean(search.trim()) || filter !== "all";

  return (
    <Box
      pt={{ base: "120px", md: "80px" }}
      px={{ base: "16px", md: "24px" }}
      pb="40px"
    >
      <VStack spacing={6} align="stretch">
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="24px"
          bgGradient="linear-gradient(135deg, #071C1C 0%, #0B3B3B 55%, #008080 100%)"
          color="white"
          px={{ base: 6, md: 9 }}
          py={{ base: 7, md: 9 }}
          boxShadow="0 22px 48px rgba(0, 64, 64, 0.2)"
        >
          <Box
            position="absolute"
            top="-90px"
            right="-40px"
            w="280px"
            h="280px"
            borderRadius="full"
            bg="whiteAlpha.100"
          />
          <Box
            position="absolute"
            bottom="-120px"
            right="180px"
            w="220px"
            h="220px"
            borderRadius="full"
            bg="whiteAlpha.50"
          />

          <Flex
            position="relative"
            direction={{ base: "column", lg: "row" }}
            align={{ base: "flex-start", lg: "center" }}
            justify="space-between"
            gap={8}
          >
            <Box maxW="620px">
              <HStack spacing={2} mb={3} flexWrap="wrap">
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="2xs"
                  fontWeight="800"
                  letterSpacing="0.12em"
                >
                  ADMIN PAYMENTS
                </Badge>
                <Badge
                  variant="outline"
                  borderColor="whiteAlpha.400"
                  color="whiteAlpha.900"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="2xs"
                  fontWeight="700"
                >
                  Refunds only
                </Badge>
              </HStack>
              <Heading
                as="h1"
                fontSize={{ base: "2xl", md: "4xl" }}
                fontWeight="900"
                letterSpacing="-0.04em"
                lineHeight="1.1"
              >
                Refund operations
              </Heading>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="whiteAlpha.800"
                mt={3}
                maxW="560px"
                lineHeight="tall"
              >
                Review, approve, and settle customer refunds from one clear
                workspace. Every action is recorded for audit.
              </Text>
              <HStack spacing={3} mt={6} flexWrap="wrap">
                <RefreshButton
                  bg="white"
                  color="teal.800"
                  borderColor="white"
                  _hover={{ bg: "teal.50", transform: "translateY(-1px)" }}
                  isLoading={loading}
                  onClick={loadRefunds}
                  aria-label="Refresh refunds"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  fontWeight="700"
                  borderRadius="10px"
                  leftIcon={<Icon as={FaDownload} boxSize={3} />}
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={exportCsv}
                >
                  Export CSV
                </Button>
              </HStack>
            </Box>

            <Box
              minW={{ base: "100%", lg: "260px" }}
              maxW={{ base: "100%", lg: "320px" }}
              p={5}
              borderRadius="18px"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
              backdropFilter="blur(8px)"
            >
              <Text
                fontSize="2xs"
                fontWeight="800"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="whiteAlpha.700"
              >
                Refunded to customers
              </Text>
              <Heading
                as="div"
                mt={2}
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="900"
                letterSpacing="-0.04em"
              >
                {formatINR(animatedRefundedPaise, { decimals: 0 })}
              </Heading>
              <HStack spacing={2} mt={3} flexWrap="wrap">
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                >
                  {stats.counts.refunded} settled
                </Badge>
                <Badge
                  bg={stats.openCount > 0 ? "orange.300" : "green.300"}
                  color="gray.900"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                  fontWeight="800"
                >
                  {stats.openCount} open
                </Badge>
              </HStack>
              <Text fontSize="2xs" color="whiteAlpha.700" mt={3}>
                All amounts are shown in INR.
              </Text>
            </Box>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
          {kpis.map((item) => (
            <KpiCard key={item.key} {...item} />
          ))}
        </SimpleGrid>

        <Box
          bg="white"
          borderRadius="18px"
          border="1px solid"
          borderColor="gray.200"
          p={{ base: 4, md: 5 }}
          boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
        >
          <Flex
            direction={{ base: "column", xl: "row" }}
            align={{ base: "stretch", xl: "center" }}
            justify="space-between"
            gap={4}
          >
            <InputGroup size="md" maxW={{ base: "100%", xl: "360px" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search refund, customer, booking, payment..."
                borderRadius="10px"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.300" }}
                _focusVisible={{ borderColor: "teal.400", bg: "white" }}
              />
            </InputGroup>

            <HStack spacing={2} overflowX="auto" pb={0.5} flexWrap="nowrap">
              {REFUND_FILTERS.map((option) => {
                const active = filter === option.key;
                const count = stats.counts[option.key] ?? 0;
                return (
                  <Button
                    key={option.key}
                    size="sm"
                    flexShrink={0}
                    borderRadius="full"
                    variant={active ? "solid" : "outline"}
                    bg={active ? BRAND : "white"}
                    color={active ? "white" : "gray.600"}
                    borderColor={active ? BRAND : "gray.200"}
                    fontWeight="700"
                    leftIcon={
                      active ? (
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg="white"
                        />
                      ) : undefined
                    }
                    _hover={{
                      bg: active ? "#006666" : "gray.50",
                      borderColor: active ? "#006666" : "gray.300",
                    }}
                    onClick={() => setFilter(option.key)}
                  >
                    {option.label}
                    <Badge
                      ml={2}
                      bg={active ? "whiteAlpha.300" : "gray.100"}
                      color={active ? "white" : "gray.600"}
                      borderRadius="full"
                      px={1.5}
                      fontSize="2xs"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </HStack>

            <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
              {filteredRefunds.length} record
              {filteredRefunds.length === 1 ? "" : "s"}
            </Text>
          </Flex>
        </Box>

        <Box
          id="refund-ledger"
          bg="white"
          borderRadius="18px"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
        >
          <Flex
            px={{ base: 4, md: 5 }}
            py={4}
            justify="space-between"
            align="center"
            gap={3}
            flexWrap="wrap"
          >
            <Box>
              <Heading size="sm" color="gray.800" letterSpacing="-0.02em">
                Refund ledger
              </Heading>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                Newest refunds first. Open a record to see the full timeline.
              </Text>
            </Box>
            <HStack spacing={2}>
              {hasActiveFilters ? (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={resetFilters}
                  leftIcon={<Icon as={FaTimes} boxSize={2.5} />}
                >
                  Clear filters
                </Button>
              ) : null}
              <RefreshButton
                isLoading={loading}
                onClick={loadRefunds}
                aria-label="Refresh refund ledger"
              />
            </HStack>
          </Flex>

          <Divider borderColor="gray.100" />

          {loadError ? (
            <ErrorState
              compact
              error={loadError}
              title="Could not load refunds"
              onRetry={loadRefunds}
            />
          ) : loading ? (
            <VStack align="stretch" spacing={3} p={5}>
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <Skeleton
                  key={item}
                  h="46px"
                  borderRadius="10px"
                  startColor="gray.50"
                  endColor="gray.100"
                />
              ))}
            </VStack>
          ) : filteredRefunds.length === 0 ? (
            <Center py={16} px={6}>
              <VStack spacing={3} maxW="420px" textAlign="center">
                <Flex
                  w="56px"
                  h="56px"
                  borderRadius="16px"
                  bg="teal.50"
                  color="teal.600"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaUndoAlt} boxSize={6} />
                </Flex>
                <Text fontWeight="800" color="gray.800">
                  {hasActiveFilters
                    ? "No refunds match these filters"
                    : "No refunds yet"}
                </Text>
                <Text fontSize="sm" color="gray.500" lineHeight="tall">
                  {hasActiveFilters
                    ? "Try a different search term or clear the filters to see the full refund ledger."
                    : "Refunds raised from service and product bookings will appear here."}
                </Text>
                {hasActiveFilters ? (
                  <Button
                    size="sm"
                    bg={BRAND}
                    color="white"
                    _hover={{ bg: "#006666" }}
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </VStack>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      {[
                        ["Refund", "left"],
                        ["Customer", "left"],
                        ["Amount", "right"],
                        ["Status", "left"],
                        ["Route", "left"],
                        ["", "right"],
                      ].map(([label, align]) => (
                        <Th
                          key={label || "actions"}
                          textAlign={align}
                          py={3}
                          px={4}
                          borderColor="gray.100"
                          color="gray.500"
                          fontSize="2xs"
                          fontWeight="800"
                          letterSpacing="0.08em"
                          textTransform="uppercase"
                          whiteSpace="nowrap"
                        >
                          {label}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pageRows.map((refund) => {
                      const refundId = String(
                        refund._id || refund.id || ""
                      );
                      const status = getRefundStatusMeta(refund);
                      const customer = getRefundCustomer(refund);
                      const customerId = getRefundCustomerId(refund);
                      const amountPaise = getRefundAmountPaise(refund);
                      const grossPaise = Number(
                        refund.grossPaise || amountPaise
                      );
                      const awaitingApproval = Boolean(
                        refund.awaitingApproval
                      );
                      const canRetry = isRefundRetryable(refund);

                      return (
                        <Tr
                          key={refundId}
                          cursor="pointer"
                          transition="background 0.15s ease"
                          _hover={{ bg: "teal.50" }}
                          onClick={() => openDrawer(refund)}
                        >
                          <Td px={4} py={3.5} borderColor="gray.100">
                            <VStack align="flex-start" spacing={0.5}>
                              <HStack spacing={1.5}>
                                <Text
                                  fontFamily="mono"
                                  fontSize="xs"
                                  fontWeight="800"
                                  color="teal.700"
                                >
                                  #{refundId.slice(-8)}
                                </Text>
                                <Text fontSize="2xs" color="gray.400">
                                  •
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                  {formatDate(refund.createdAt)}
                                </Text>
                              </HStack>
                              <Text
                                fontSize="2xs"
                                color="gray.500"
                                textTransform="capitalize"
                              >
                                {refund.refundClass || "refund"} •{" "}
                                {refund.speed || "normal"}
                              </Text>
                            </VStack>
                          </Td>

                          <Td px={4} py={3.5} borderColor="gray.100">
                            <VStack align="flex-start" spacing={0.5}>
                              <Text
                                fontSize="xs"
                                fontWeight="800"
                                color="gray.800"
                                noOfLines={1}
                              >
                                {customer.name}
                              </Text>
                              <Text
                                fontSize="2xs"
                                color="gray.500"
                                noOfLines={1}
                              >
                                {customer.contact ||
                                  (customerId
                                    ? `Customer …${customerId.slice(-6)}`
                                    : "No contact")}
                              </Text>
                            </VStack>
                          </Td>

                          <Td
                            px={4}
                            py={3.5}
                            borderColor="gray.100"
                            textAlign="right"
                          >
                            <Text
                              fontSize="sm"
                              fontWeight="900"
                              color="gray.800"
                              whiteSpace="nowrap"
                            >
                              {formatINR(amountPaise)}
                            </Text>
                            <Text fontSize="2xs" color="gray.400">
                              {grossPaise > amountPaise
                                ? `Gross ${formatINR(grossPaise)}`
                                : "Net refund"}
                            </Text>
                          </Td>

                          <Td px={4} py={3.5} borderColor="gray.100">
                            <StatusBadge
                              colorScheme={status.colorScheme}
                              label={status.label}
                              variant="subtle"
                              whiteSpace="nowrap"
                              showDot
                            />
                          </Td>

                          <Td px={4} py={3.5} borderColor="gray.100">
                            <VStack align="flex-start" spacing={0.5}>
                              <Text fontSize="xs" fontWeight="600" color="gray.700">
                                {getRailLabel(refund.rail)}
                              </Text>
                              <Text fontSize="2xs" color="gray.500">
                                Attempt {Number(refund.attempts || 0)} of 3
                              </Text>
                            </VStack>
                          </Td>

                          <Td
                            px={4}
                            py={3.5}
                            borderColor="gray.100"
                            textAlign="right"
                          >
                            <HStack justify="flex-end" spacing={2}>
                              {awaitingApproval ? (
                                <Button
                                  size="xs"
                                  bg={BRAND}
                                  color="white"
                                  fontWeight="800"
                                  borderRadius="8px"
                                  _hover={{ bg: "#006666" }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openConfirm("approve", refund);
                                  }}
                                >
                                  Approve
                                </Button>
                              ) : null}
                              {canRetry ? (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme="orange"
                                  borderRadius="8px"
                                  leftIcon={<Icon as={FaRedoAlt} boxSize={2.5} />}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openConfirm("retry", refund);
                                  }}
                                >
                                  Retry
                                </Button>
                              ) : null}
                              <Tooltip label="Open refund details" hasArrow>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="teal"
                                  aria-label="Open refund details"
                                  icon={<Icon as={FaChevronRight} boxSize={3} />}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openDrawer(refund);
                                  }}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              <TablePagination
                page={page}
                totalPages={totalPages}
                totalRows={filteredRefunds.length}
                indexOfFirst={(page - 1) * rowsPerPage}
                indexOfLast={Math.min(
                  page * rowsPerPage,
                  filteredRefunds.length
                )}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                label="refunds"
              />
            </>
          )}
        </Box>

        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
          gap={4}
          p={{ base: 5, md: 5 }}
          borderRadius="18px"
          bg="teal.50"
          border="1px solid"
          borderColor="teal.100"
        >
          <HStack spacing={3} align="flex-start">
            <Flex
              w="40px"
              h="40px"
              borderRadius="12px"
              bg="white"
              color="teal.600"
              align="center"
              justify="center"
              flexShrink={0}
              boxShadow="sm"
            >
              <Icon as={FaUniversity} boxSize={4} />
            </Flex>
            <Box>
              <Text fontSize="sm" fontWeight="800" color="teal.900">
                Recording an offline payment?
              </Text>
              <Text fontSize="xs" color="teal.800" mt={0.5} lineHeight="tall">
                Product payments are now recorded from Product Management →
                Bookings. Admin Payments is dedicated to refunds.
              </Text>
            </Box>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            bg="white"
            borderRadius="10px"
            rightIcon={<Icon as={FaArrowRight} boxSize={3} />}
            flexShrink={0}
            onClick={() => navigate("/owner/product-management")}
          >
            Open Product Management
          </Button>
        </Flex>
      </VStack>

      <RefundDetailsDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        refund={selectedRefund}
        busyAction={actionBusy}
        onApprove={(refund) => openConfirm("approve", refund)}
        onRetry={(refund) => openConfirm("retry", refund)}
        onSendPayout={openPayout}
      />

      <AppModal
        isOpen={Boolean(confirmAction)}
        onClose={closeConfirm}
        title={
          confirmAction?.type === "approve"
            ? "Approve this refund?"
            : "Retry this refund?"
        }
        subtitle={
          confirmAction?.type === "approve"
            ? "The refund will leave the approval queue and start execution."
            : "A new execution attempt will be scheduled for this refund."
        }
        icon={
          confirmAction?.type === "approve" ? FaShieldAlt : FaRedoAlt
        }
        tone={confirmAction?.type === "approve" ? "success" : "warning"}
        size="md"
        isBusy={Boolean(actionBusy)}
        primaryAction={{
          label:
            confirmAction?.type === "approve"
              ? "Approve refund"
              : "Retry refund",
          onClick: runConfirmAction,
          isLoading: Boolean(actionBusy),
          colorScheme: confirmAction?.type === "approve" ? "teal" : "orange",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: closeConfirm,
        }}
      >
        {confirmAction?.refund ? (
          <VStack spacing={4} align="stretch">
            <Flex
              p={4}
              borderRadius="12px"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.100"
              justify="space-between"
              align="center"
              gap={3}
            >
              <Box>
                <Text fontSize="2xs" color="gray.500" fontWeight="700">
                  Refund amount
                </Text>
                <Text fontSize="xl" fontWeight="900" color="gray.900">
                  {formatINR(getRefundAmountPaise(confirmAction.refund))}
                </Text>
              </Box>
              <StatusBadge
                colorScheme={
                  getRefundStatusMeta(confirmAction.refund).colorScheme
                }
                label={getRefundStatusMeta(confirmAction.refund).label}
                variant="subtle"
              />
            </Flex>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              {confirmAction.type === "approve"
                ? "Approve only after the refund has been verified. The customer refund will move into the execution queue and this action is recorded in the audit trail."
                : `This refund has ${Number(
                    confirmAction.refund.attempts || 0
                  )} failed attempt${
                    Number(confirmAction.refund.attempts || 0) === 1 ? "" : "s"
                  }. Retrying re-queues the refund for another execution attempt.`}
            </Text>
            {confirmAction.refund.lastError ? (
              <Alert status="error" borderRadius="10px" fontSize="xs">
                <AlertIcon />
                {confirmAction.refund.lastError}
              </Alert>
            ) : null}
          </VStack>
        ) : null}
      </AppModal>

      <AppModal
        isOpen={Boolean(payoutTarget)}
        onClose={closePayout}
        title="Send customer payout"
        subtitle="Create a bank account or UPI payout for this refund."
        icon={FaPaperPlane}
        tone="info"
        size="lg"
        isBusy={payoutSaving}
        primaryAction={{
          label: "Create payout",
          onClick: submitPayout,
          isLoading: payoutSaving,
          colorScheme: "teal",
        }}
        secondaryAction={{ label: "Cancel", onClick: closePayout }}
      >
        {payoutTarget ? (
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="10px" fontSize="xs">
              <AlertIcon />
              The refund will move to manual review until the payout is approved
              and processed.
            </Alert>

            <Flex
              p={4}
              borderRadius="12px"
              bg="teal.50"
              border="1px solid"
              borderColor="teal.100"
              justify="space-between"
              align="center"
              gap={3}
            >
              <Box>
                <Text fontSize="2xs" color="teal.700" fontWeight="700">
                  {getRefundCustomer(payoutTarget).name}
                </Text>
                <Text fontSize="xl" fontWeight="900" color="teal.900">
                  {formatINR(getRefundAmountPaise(payoutTarget))}
                </Text>
              </Box>
              <Text fontSize="2xs" color="teal.700" fontFamily="mono">
                #{String(payoutTarget._id || payoutTarget.id || "").slice(-8)}
              </Text>
            </Flex>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="800">
                Destination
              </FormLabel>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={payoutType === "bank" ? "solid" : "outline"}
                  colorScheme="teal"
                  leftIcon={<Icon as={FaUniversity} boxSize={3} />}
                  onClick={() => setPayoutType("bank")}
                >
                  Bank account
                </Button>
                <Button
                  size="sm"
                  variant={payoutType === "vpa" ? "solid" : "outline"}
                  colorScheme="teal"
                  leftIcon={<Icon as={FaMobileAlt} boxSize={3} />}
                  onClick={() => setPayoutType("vpa")}
                >
                  UPI ID
                </Button>
              </HStack>
            </FormControl>

            {payoutType === "bank" ? (
              <>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Account holder name
                  </FormLabel>
                  <Input
                    value={payoutForm.accountName}
                    onChange={(event) =>
                      setPayoutForm((current) => ({
                        ...current,
                        accountName: event.target.value,
                      }))
                    }
                    placeholder="Name as per bank account"
                    borderRadius="8px"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Account number
                  </FormLabel>
                  <Input
                    value={payoutForm.accountNumber}
                    onChange={(event) =>
                      setPayoutForm((current) => ({
                        ...current,
                        accountNumber: event.target.value.replace(/\s/g, ""),
                      }))
                    }
                    placeholder="Enter the bank account number"
                    borderRadius="8px"
                    fontFamily="mono"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    IFSC code
                  </FormLabel>
                  <Input
                    value={payoutForm.ifscCode}
                    onChange={(event) =>
                      setPayoutForm((current) => ({
                        ...current,
                        ifscCode: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. HDFC0001234"
                    borderRadius="8px"
                    fontFamily="mono"
                    maxLength={11}
                  />
                  <FormHelperText fontSize="2xs">
                    The IFSC must belong to the customer's bank branch.
                  </FormHelperText>
                </FormControl>
              </>
            ) : (
              <>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    UPI ID
                  </FormLabel>
                  <Input
                    value={payoutForm.vpa}
                    onChange={(event) =>
                      setPayoutForm((current) => ({
                        ...current,
                        vpa: event.target.value,
                      }))
                    }
                    placeholder="e.g. customer@okhdfcbank"
                    borderRadius="8px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Account holder name (optional)
                  </FormLabel>
                  <Input
                    value={payoutForm.accountName}
                    onChange={(event) =>
                      setPayoutForm((current) => ({
                        ...current,
                        accountName: event.target.value,
                      }))
                    }
                    placeholder="Name linked to the UPI ID"
                    borderRadius="8px"
                  />
                </FormControl>
              </>
            )}

            <Alert status="warning" borderRadius="12px">
              <AlertIcon />
              <Box>
                <Text fontSize="xs" fontWeight="800">
                  Verify the destination before continuing
                </Text>
                <Text fontSize="2xs" mt={0.5}>
                  Customer payouts cannot be reversed automatically. Check the
                  name and account details against the customer record.
                </Text>
              </Box>
            </Alert>
          </VStack>
        ) : null}
      </AppModal>
    </Box>
  );
}
