import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Skeleton,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import { FaTruckFast } from "react-icons/fa6";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaCopy,
  FaExclamationTriangle,
  FaEye,
  FaMapMarkerAlt,
  FaMapMarkedAlt,
  FaMoneyBillWave,
  FaPlay,
  FaRedoAlt,
  FaSearch,
  FaTimes,
  FaUserCheck,
  FaUserClock,
  FaWrench,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

import Card from "components/Card/Card.js";
import { useAppToast } from "components/feedback";
import TablePagination from "components/common/TablePagination";
import ConfirmActionModal from "components/common/ConfirmActionModal";

import {
  getDispatchStats,
  getDispatchHealth,
  retryFailedDispatches,
  restartDispatchWorker,
  getMissingBaseLocations,
  getAllSchedulingBookings,
  retryDispatch,
} from "api/scheduling";

import {
  formatFriendlyDateTime,
  formatFriendlyCurrency,
  getBookingTypeMeta,
  getBookingCustomerName,
  getBookingCustomerPhone,
  getBookingTechnicianInfo,
  getBookingScheduleInfo,
  getBookingAmount,
} from "components/Scheduling/schedulingFormatters";

import BookingAuditTab from "components/Scheduling/BookingAuditTab";
import DispatchQueueTab from "components/Scheduling/DispatchQueueTab";
import TechnicianBaseLocationTab from "components/Scheduling/TechnicianBaseLocationTab";
import NoShowCompensationTab from "components/Scheduling/NoShowCompensationTab";
import ZoneHealthTab from "components/Scheduling/ZoneHealthTab";
import BookingDetailDrawer from "components/Scheduling/BookingDetailDrawer";
import NoShowCompensationModal from "components/Scheduling/NoShowCompensationModal";

const bookingIdOf = (booking) =>
  String(booking?._id || booking?.bookingId || booking?.id || "");

const technicianOf = (booking) => getBookingTechnicianInfo(booking);

const currentTechnicianOf = (booking) => {
  const technician = technicianOf(booking);
  return technician?.isCurrent ? technician : null;
};

const noShowOf = (booking) =>
  booking?.customerNoShow || booking?.noShow || null;

const customerNameOf = (booking) => getBookingCustomerName(booking);

const customerPhoneOf = (booking) =>
  getBookingCustomerPhone(booking) || "No phone on file";

const serviceNameOf = (booking) =>
  booking?.serviceName ||
  booking?.serviceId?.serviceName ||
  booking?.serviceSnapshot?.serviceName ||
  booking?.service?.name ||
  "Service";

const bookingAmountOf = (booking) => getBookingAmount(booking);

const scheduleValueOf = (booking) => getBookingScheduleInfo(booking).date;

const scheduleTimeOf = (booking) => {
  const value = scheduleValueOf(booking);
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const noShowStatusOf = (booking) => {
  const noShow = noShowOf(booking);
  return String(noShow?.compensationStatus || noShow?.status || "").toLowerCase();
};

const hasNoShowClaim = (booking) => {
  const noShow = noShowOf(booking);
  if (!noShow) return false;
  return Boolean(
    noShow.status ||
      noShow.compensationStatus ||
      noShow.amount ||
      noShow.compensationPaise ||
      noShow.reportedAt
  );
};

const noShowActionOf = (booking) => {
  if (!hasNoShowClaim(booking)) return null;
  const status = noShowStatusOf(booking);
  if (status === "approved") return "mark_paid";
  if (["paid", "settled", "posted", "rejected", "declined"].includes(status)) {
    return null;
  }
  return "approve";
};

const dispatchBadgeOf = (booking) => {
  const status = String(booking?.status || "").toLowerCase();
  if (hasNoShowClaim(booking)) {
    const noShowStatus = noShowStatusOf(booking);
    if (["paid", "settled", "posted"].includes(noShowStatus)) {
      return {
        label: "No-show settled",
        colorScheme: "green",
        icon: FaCheckCircle,
      };
    }
    if (noShowStatus === "approved") {
      return {
        label: "No-show approved",
        colorScheme: "blue",
        icon: FaCheckCircle,
      };
    }
    if (["rejected", "declined"].includes(noShowStatus)) {
      return {
        label: "No-show rejected",
        colorScheme: "red",
        icon: FaTimes,
      };
    }
    return {
      label: "No-show reported",
      colorScheme: "orange",
      icon: FaExclamationTriangle,
    };
  }
  if (status === "cancelled" || status === "canceled") {
    return { label: "Cancelled", colorScheme: "gray", icon: FaTimes };
  }
  if (status === "completed") {
    return { label: "Completed", colorScheme: "green", icon: FaCheckCircle };
  }
  if (status === "expired") {
    return { label: "Expired", colorScheme: "orange", icon: FaClock };
  }
  if (currentTechnicianOf(booking)) {
    return {
      label: "Technician assigned",
      colorScheme: "green",
      icon: FaUserCheck,
    };
  }
  if (technicianOf(booking)) {
    return {
      label: "Previously assigned",
      colorScheme: "orange",
      icon: FaUserClock,
    };
  }
  return {
    label: "Finding technician",
    colorScheme: "purple",
    icon: FaBullhorn,
  };
};

const sortBySchedule = (direction) => (a, b) => {
  const aTime = scheduleTimeOf(a);
  const bTime = scheduleTimeOf(b);
  if (!aTime && !bTime) return 0;
  if (!aTime) return 1;
  if (!bTime) return -1;
  return direction === "asc" ? aTime - bTime : bTime - aTime;
};

export default function SchedulingOps() {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [activeMainTab, setActiveMainTab] = useState(0);
  const [trackerBookingId, setTrackerBookingId] = useState("");

  const [selectedDrawerBookingId, setSelectedDrawerBookingId] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedCompensationBooking, setSelectedCompensationBooking] = useState(null);
  const [compensationActionType, setCompensationActionType] = useState("approve");
  const [isCompensationModalOpen, setIsCompensationModalOpen] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("ALL");
  const [bookingSort, setBookingSort] = useState("SOONEST");
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingLimit, setBookingLimit] = useState(15);
  const [bookingRetryId, setBookingRetryId] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");

  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [missingBaseCount, setMissingBaseCount] = useState(0);
  const [noShowClaimsCount, setNoShowClaimsCount] = useState(0);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [telemetryError, setTelemetryError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [confirmAction, setConfirmAction] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const copyToClipboard = (text, key, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text).trim());
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    toast({
      title: "Copied to clipboard",
      description: `${label}: ${text}`,
      status: "info",
      duration: 1800,
      isClosable: true,
    });
  };

  const loadTelemetry = useCallback(
    async (isMounted = { current: true }, silent = false) => {
      if (!silent) setTelemetryLoading(true);

      const [statsRes, healthRes, missingRes] = await Promise.all([
        getDispatchStats(),
        getDispatchHealth(),
        getMissingBaseLocations({ page: 1, limit: 1 }),
      ]);

      if (!isMounted.current) return;

      if (!statsRes.error) setStats(statsRes.data?.result ?? statsRes.data ?? null);
      if (!healthRes.error) setHealth(healthRes.data?.result ?? healthRes.data ?? null);

      if (!missingRes.error) {
        const missingData =
          missingRes.data?.result ??
          missingRes.data?.data ??
          missingRes.data ??
          {};
        setMissingBaseCount(
          missingData?.pagination?.total ??
            (Array.isArray(missingData) ? missingData.length : 0)
        );
      }

      setTelemetryError(statsRes.error || healthRes.error || missingRes.error || "");
      setTelemetryLoading(false);
    },
    []
  );

  const loadLiveBookings = useCallback(
    async (isMounted = { current: true }, silent = false) => {
      if (!silent) setBookingsLoading(true);

      const { data, error } = await getAllSchedulingBookings({ limit: 100 });

      if (!isMounted.current) return;
      setBookingsLoading(false);

      if (error) {
        setBookingsError(error);
        if (!silent) {
          toast.error(error, {
            title: "Could not load bookings",
            duration: 3000,
            isClosable: true,
          });
        }
        return;
      }

      setBookingsError("");

      const response = data?.result ?? data?.data ?? data ?? {};
      const items = Array.isArray(response)
        ? response
        : response?.bookings ?? response?.items ?? [];
      setBookings(items);

      const pendingNoShow = items.filter((booking) => {
        const noShow = noShowOf(booking);
        const status = String(
          noShow?.compensationStatus || noShow?.status || ""
        ).toLowerCase();
        return (
          Boolean(noShow) &&
          (status === "pending" || status === "requested" || status === "reported")
        );
      }).length;
      setNoShowClaimsCount(pendingNoShow);
    },
    [toast]
  );

  useEffect(() => {
    const isMounted = { current: true };

    const loadInitialData = async () => {
      await Promise.all([
        loadTelemetry(isMounted),
        loadLiveBookings(isMounted),
      ]);
      if (isMounted.current) setLastUpdated(new Date());
    };

    loadInitialData();

    return () => {
      isMounted.current = false;
    };
  }, [loadTelemetry, loadLiveBookings]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    let active = true;
    const timer = setInterval(async () => {
      await Promise.all([
        loadTelemetry({ current: active }, true),
        loadLiveBookings({ current: active }, true),
      ]);
      if (active) setLastUpdated(new Date());
    }, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [autoRefresh, loadTelemetry, loadLiveBookings]);

  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true);
    const isMounted = { current: true };
    await Promise.all([
      loadTelemetry(isMounted),
      loadLiveBookings(isMounted),
    ]);
    setRefreshing(false);
    setLastUpdated(new Date());
  }, [loadTelemetry, loadLiveBookings]);

  const openConfirm = (action) => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "retry-all") {
      const { error } = await retryFailedDispatches();
      if (error) throw new Error(error);
      toast({
        title: "Failed dispatches requeued",
        description:
          "Every failed job has been put back into the dispatch queue.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    if (confirmAction === "restart-worker") {
      const { error } = await restartDispatchWorker();
      if (error) throw new Error(error);
      toast({
        title: "Dispatch worker restarted",
        description: "Job matching has resumed. Live processing may take a few seconds to catch up.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    await handleRefreshAll();
  };

  const handleRetryBooking = async (bookingId) => {
    if (!bookingId) return;
    setBookingRetryId(bookingId);
    const { error, status } = await retryDispatch(bookingId);
    setBookingRetryId(null);

    if (error) {
      if (status === 409) {
        toast({
          title: "Already in the dispatch queue",
          description:
            "This booking is already being matched or broadcast to technicians.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      toast.error(error, {
        title: "Could not retry dispatch",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Dispatch requeued",
      description: `Booking #${String(bookingId).slice(
        -8
      )} is back in the matching queue.`,
      status: "success",
      duration: 2500,
      isClosable: true,
    });

    const isMounted = { current: true };
    await Promise.all([
      loadTelemetry(isMounted, true),
      loadLiveBookings(isMounted, true),
    ]);
    setLastUpdated(new Date());
  };

  const handleOpenDrawer = (bookingId) => {
    if (!bookingId) return;
    setSelectedDrawerBookingId(String(bookingId));
    setIsDrawerOpen(true);
  };

  const handleOpenTracker = (bookingId) => {
    if (!bookingId) return;
    setTrackerBookingId(String(bookingId));
    setActiveMainTab(1);
  };

  const handleMissingCountChange = useCallback(
    (count) => setMissingBaseCount(count),
    []
  );

  const handleNoShowCountChange = useCallback(
    (count) => setNoShowClaimsCount(count),
    []
  );

  const handleOpenCompensation = (booking, action) => {
    setSelectedCompensationBooking(booking);
    setCompensationActionType(action || noShowActionOf(booking) || "approve");
    setIsCompensationModalOpen(true);
  };

  const assignedCount = useMemo(
    () =>
      bookings.filter((booking) => Boolean(currentTechnicianOf(booking))).length,
    [bookings]
  );

  const instantCount = useMemo(
    () =>
      bookings.filter(
        (booking) => getBookingTypeMeta(booking).key === "instant"
      ).length,
    [bookings]
  );

  const scheduledCount = Math.max(0, bookings.length - instantCount);
  const unassignedCount = Math.max(0, bookings.length - assignedCount);
  const pendingCount = Number(stats?.pending ?? 0);
  const failedCount = Number(stats?.failed ?? 0);

  const rawWorkerStatus =
    health?.status || health?.worker?.status || health?.worker || "Operational";
  const workerStatus =
    typeof rawWorkerStatus === "string" ? rawWorkerStatus : "Operational";
  const normalizedWorkerStatus = workerStatus.toLowerCase();
  const isWorkerOk =
    !/(down|offline|stopped|failed|error|unhealthy|not\s+run)/.test(
      normalizedWorkerStatus
    ) && /(ok|run|oper|health|online|active)/.test(normalizedWorkerStatus);

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "not loaded yet";

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(booking.status || "").toLowerCase();
      const technician = technicianOf(booking);
      const currentTechnician = currentTechnicianOf(booking);
      const noShow = hasNoShowClaim(booking);
      const typeKey = getBookingTypeMeta(booking).key.toUpperCase();

      if (bookingTypeFilter !== "ALL" && typeKey !== bookingTypeFilter) {
        return false;
      }

      if (bookingStatusFilter === "ASSIGNED" && !currentTechnician) return false;
      if (bookingStatusFilter === "UNASSIGNED" && currentTechnician) return false;
      if (
        bookingStatusFilter === "COMPLETED" &&
        status !== "completed"
      ) {
        return false;
      }
      if (
        bookingStatusFilter === "CANCELLED" &&
        status !== "cancelled" &&
        status !== "canceled"
      ) {
        return false;
      }
      if (bookingStatusFilter === "NOSHOW" && !noShow) return false;

      if (!bookingSearch.trim()) return true;

      const query = bookingSearch.toLowerCase().trim();
      const technicianName = String(
        technician?.name || booking.technicianId?.name || ""
      ).toLowerCase();

      return [
        bookingIdOf(booking),
        customerNameOf(booking),
        customerPhoneOf(booking),
        serviceNameOf(booking),
        technicianName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [bookings, bookingSearch, bookingStatusFilter, bookingTypeFilter]);

  const sortedBookings = useMemo(() => {
    const list = [...filteredBookings];

    if (bookingSort === "CUSTOMER") {
      return list.sort((a, b) =>
        customerNameOf(a).localeCompare(customerNameOf(b))
      );
    }

    return list.sort(sortBySchedule(bookingSort === "LATEST" ? "desc" : "asc"));
  }, [filteredBookings, bookingSort]);

  const pagedBookings = useMemo(() => {
    const start = (bookingPage - 1) * bookingLimit;
    return sortedBookings.slice(start, start + bookingLimit);
  }, [sortedBookings, bookingPage, bookingLimit]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedBookings.length / bookingLimit));
    if (bookingPage > totalPages) setBookingPage(totalPages);
  }, [sortedBookings.length, bookingLimit, bookingPage]);

  const hasActiveFilters =
    bookingSearch.trim() !== "" ||
    bookingStatusFilter !== "ALL" ||
    bookingTypeFilter !== "ALL";

  const clearFilters = () => {
    setBookingSearch("");
    setBookingStatusFilter("ALL");
    setBookingTypeFilter("ALL");
    setBookingSort("SOONEST");
    setBookingPage(1);
  };

  const overviewLoading =
    (telemetryLoading && !stats) || (bookingsLoading && bookings.length === 0);

  const summaryCards = [
    {
      tab: 0,
      label: "Live bookings",
      value: bookings.length,
      helper:
        bookings.length === 0
          ? "No bookings right now"
          : `${instantCount} instant · ${scheduledCount} scheduled${
              unassignedCount > 0
                ? ` · ${unassignedCount} waiting for a technician`
                : ""
            }`,
      badge:
        bookings.length === 0
          ? { text: "Idle", colorScheme: "gray" }
          : unassignedCount > 0
          ? { text: "Matching", colorScheme: "purple" }
          : { text: "Covered", colorScheme: "green" },
      icon: FaCalendarAlt,
      iconBg: isDark ? "gray.700" : "teal.50",
      iconColor: isDark ? "teal.200" : "teal.600",
    },
    {
      tab: 2,
      label: "Failed dispatches",
      value: failedCount,
      helper: `${pendingCount} ${
        pendingCount === 1 ? "job" : "jobs"
      } currently in the dispatch queue`,
      badge:
        failedCount > 0
          ? { text: "Needs retry", colorScheme: "red" }
          : { text: "All clear", colorScheme: "green" },
      icon: FaExclamationTriangle,
      iconBg: isDark ? "red.900" : "red.50",
      iconColor: isDark ? "red.200" : "red.500",
    },
    {
      tab: 3,
      label: "Technician locations",
      value: missingBaseCount,
      helper:
        missingBaseCount > 0
          ? "Technicians without GPS cannot receive jobs"
          : "All technicians are ready for matching",
      badge:
        missingBaseCount > 0
          ? { text: "Setup needed", colorScheme: "orange" }
          : { text: "Verified", colorScheme: "green" },
      icon: FaMapMarkerAlt,
      iconBg: isDark ? "orange.900" : "orange.50",
      iconColor: isDark ? "orange.200" : "orange.500",
    },
    {
      tab: 4,
      label: "No-show claims",
      value: noShowClaimsCount,
      helper:
        noShowClaimsCount > 0
          ? "Claims waiting for a decision"
          : "No claims waiting for review",
      badge:
        noShowClaimsCount > 0
          ? { text: "Review", colorScheme: "yellow" }
          : { text: "Settled", colorScheme: "green" },
      icon: FaMoneyBillWave,
      iconBg: isDark ? "yellow.900" : "yellow.50",
      iconColor: isDark ? "yellow.200" : "yellow.700",
    },
  ];

  const confirmContent =
    confirmAction === "retry-all"
      ? {
          title: `Retry ${failedCount} failed ${
            failedCount === 1 ? "dispatch" : "dispatches"
          }?`,
          description:
            "Every failed job will be put back into the dispatch queue and offered to eligible technicians again.",
          confirmText: "Retry failed dispatches",
          confirmColorScheme: "red",
          icon: FaRedoAlt,
        }
      : {
          title: "Restart the dispatch worker?",
          description:
            "The worker will restart and resume technician matching. Live dispatch processing may pause for a few seconds.",
          confirmText: "Restart worker",
          confirmColorScheme: "orange",
          icon: FaPlay,
        };

  const renderDispatchBadge = (booking) => {
    const state = dispatchBadgeOf(booking);
    return (
      <Badge
        colorScheme={state.colorScheme}
        variant="subtle"
        px={2.5}
        py={1}
        borderRadius="full"
        fontSize="2xs"
        fontWeight="700"
      >
        <HStack spacing={1.5}>
          <Icon as={state.icon} boxSize={2.5} />
          <Text>{state.label}</Text>
        </HStack>
      </Badge>
    );
  };

  return (
    <Box pt={{ base: "120px", md: "80px" }} px={{ base: "16px", md: "24px" }} pb="40px">
      <Flex
        direction={{ base: "column", xl: "row" }}
        justify="space-between"
        align={{ base: "flex-start", xl: "center" }}
        gap={4}
        mb={5}
      >
        <Box>
          <HStack spacing={3} align="flex-start">
            <Flex
              w="46px"
              h="46px"
              borderRadius="14px"
              bg="teal.500"
              color="white"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FaTruckFast} boxSize={5} />
            </Flex>
            <Box>
              <Heading as="h1" size="lg" fontWeight="900" letterSpacing="-0.4px">
                Scheduling &amp; Dispatch
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                See which bookings need a technician, fix dispatch problems, and
                settle customer no-show claims.
              </Text>
            </Box>
          </HStack>
        </Box>

        <VStack align={{ base: "flex-start", xl: "flex-end" }} spacing={2}>
          <HStack spacing={2} flexWrap="wrap">
            <Tooltip
              label={
                isWorkerOk
                  ? "The dispatch worker is processing scheduled jobs"
                  : "The dispatch worker may be paused or unhealthy"
              }
              hasArrow
            >
              <Badge
                colorScheme={isWorkerOk ? "green" : "red"}
                variant={isWorkerOk ? "subtle" : "solid"}
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="2xs"
                fontWeight="800"
              >
                <HStack spacing={1.5}>
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={isWorkerOk ? "green.500" : "white"}
                  />
                  <Text>{isWorkerOk ? "Worker online" : "Worker offline"}</Text>
                </HStack>
              </Badge>
            </Tooltip>

            <HStack
              spacing={2}
              px={2.5}
              py={1.5}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              borderRadius="full"
              bg={isDark ? "gray.800" : "white"}
            >
              <Text fontSize="2xs" color="gray.500" fontWeight="700">
                Updated {lastUpdatedLabel}
              </Text>
              <Box w="1px" h="12px" bg={isDark ? "gray.600" : "gray.200"} />
              <Text fontSize="2xs" color="gray.500" fontWeight="700">
                Auto
              </Text>
              <Switch
                size="sm"
                colorScheme="teal"
                isChecked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
                aria-label="Auto refresh every 30 seconds"
              />
            </HStack>
          </HStack>

          <HStack spacing={2} flexWrap="wrap">
            {failedCount > 0 && (
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<FaRedoAlt size={11} />}
                borderRadius="10px"
                fontWeight="700"
                onClick={() => openConfirm("retry-all")}
              >
                Retry {failedCount} failed
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              leftIcon={<MdRefresh size={16} />}
              borderRadius="10px"
              fontWeight="700"
              isLoading={refreshing}
              onClick={handleRefreshAll}
            >
              Refresh
            </Button>

            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                borderRadius="10px"
                fontWeight="700"
                leftIcon={<FaWrench size={11} />}
                rightIcon={<FaChevronDown size={9} />}
              >
                Tools
              </MenuButton>
              <MenuList fontSize="sm" borderRadius="12px" py={1.5} minW="240px">
                <MenuItem
                  icon={<FaRedoAlt size={12} />}
                  isDisabled={failedCount === 0}
                  onClick={() => openConfirm("retry-all")}
                >
                  Retry failed dispatches
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<FaPlay size={11} />}
                  onClick={() => openConfirm("restart-worker")}
                >
                  Restart dispatch worker
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </VStack>
      </Flex>

      {telemetryError && (
        <Alert status="warning" borderRadius="12px" mb={4} fontSize="sm">
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="800">Some live metrics could not be refreshed</Text>
            <Text fontSize="xs">{telemetryError}</Text>
          </Box>
          <Button size="xs" variant="outline" onClick={handleRefreshAll}>
            Try again
          </Button>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={6}>
        {summaryCards.map((card) => {
          const isActive = activeMainTab === card.tab;
          return (
            <Box
              key={card.label}
              role="button"
              tabIndex={0}
              textAlign="left"
              w="100%"
              p={4}
              bg={isDark ? "gray.800" : "white"}
              borderRadius="16px"
              border="1px solid"
              borderColor={
                isActive ? "teal.400" : isDark ? "gray.700" : "gray.200"
              }
              boxShadow={isActive ? "0 0 0 1px #2C7A7B" : "sm"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
                borderColor: "teal.400",
              }}
              _focus={{ boxShadow: "outline" }}
              onClick={() => setActiveMainTab(card.tab)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveMainTab(card.tab);
                }
              }}
            >
              <HStack justify="space-between" align="flex-start" mb={3}>
                <HStack spacing={2.5}>
                  <Box
                    p={2}
                    borderRadius="10px"
                    bg={card.iconBg}
                    color={card.iconColor}
                  >
                    <Icon as={card.icon} boxSize={4} />
                  </Box>
                  <Text fontSize="sm" fontWeight="800" color={isDark ? "gray.200" : "gray.700"}>
                    {card.label}
                  </Text>
                </HStack>
                <Icon
                  as={FaChevronRight}
                  boxSize={2.5}
                  color={isActive ? "teal.500" : "gray.400"}
                  mt={1}
                />
              </HStack>

              <HStack align="center" spacing={2.5}>
                {overviewLoading ? (
                  <Skeleton height="32px" width="44px" borderRadius="6px" />
                ) : (
                  <Text
                    fontSize="3xl"
                    fontWeight="900"
                    lineHeight="1"
                    color={
                      card.tab === 1 && failedCount > 0
                        ? "red.500"
                        : card.tab === 2 && missingBaseCount > 0
                        ? "orange.500"
                        : card.tab === 3 && noShowClaimsCount > 0
                        ? "yellow.600"
                        : isDark
                        ? "white"
                        : "gray.800"
                    }
                  >
                    {card.value}
                  </Text>
                )}
                <Badge
                  colorScheme={card.badge.colorScheme}
                  variant="subtle"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="2xs"
                  fontWeight="700"
                >
                  {card.badge.text}
                </Badge>
              </HStack>

              <Text fontSize="xs" color="gray.500" mt={2} noOfLines={2}>
                {card.helper}
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>

      <Card
        bg={isDark ? "gray.800" : "white"}
        borderRadius="16px"
        border="1px solid"
        borderColor={isDark ? "gray.700" : "gray.200"}
        boxShadow="sm"
        overflow="hidden"
      >
        <Tabs
          index={activeMainTab}
          onChange={setActiveMainTab}
          colorScheme="teal"
          variant="line"
          isLazy
        >
          <TabList
            px={{ base: 2, md: 4 }}
            borderBottom="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            overflowX="auto"
            overflowY="hidden"
            sx={{
              scrollbarWidth: "none",
              "::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Tab fontWeight="700" fontSize="sm" py={3.5} px={{ base: 3, md: 4 }} whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FaCalendarAlt} boxSize={3.5} />
                <Text>Bookings</Text>
                <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="2xs">
                  {bookings.length}
                </Badge>
              </HStack>
            </Tab>

            <Tab fontWeight="700" fontSize="sm" py={3.5} px={{ base: 3, md: 4 }} whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FaBullhorn} boxSize={3.5} />
                <Text>Booking tracking</Text>
              </HStack>
            </Tab>

            <Tab fontWeight="700" fontSize="sm" py={3.5} px={{ base: 3, md: 4 }} whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FaTruckFast} boxSize={3.5} />
                <Text>Dispatch queue</Text>
                <Badge
                  colorScheme={failedCount > 0 ? "red" : "teal"}
                  variant={failedCount > 0 ? "solid" : "subtle"}
                  borderRadius="full"
                  px={2}
                  fontSize="2xs"
                >
                  {failedCount > 0 ? `${failedCount} failed` : `${pendingCount} pending`}
                </Badge>
              </HStack>
            </Tab>

            <Tab fontWeight="700" fontSize="sm" py={3.5} px={{ base: 3, md: 4 }} whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FaMapMarkerAlt} boxSize={3.5} />
                <Text>Technician locations</Text>
                <Badge
                  colorScheme={missingBaseCount > 0 ? "orange" : "green"}
                  variant={missingBaseCount > 0 ? "solid" : "subtle"}
                  borderRadius="full"
                  px={2}
                  fontSize="2xs"
                >
                  {missingBaseCount} missing
                </Badge>
              </HStack>
            </Tab>

            <Tab fontWeight="700" fontSize="sm" py={3.5} px={{ base: 3, md: 4 }} whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FaMoneyBillWave} boxSize={3.5} />
                <Text>No-show claims</Text>
                <Badge
                  colorScheme={noShowClaimsCount > 0 ? "yellow" : "green"}
                  variant={noShowClaimsCount > 0 ? "solid" : "subtle"}
                  borderRadius="full"
                  px={2}
                  fontSize="2xs"
                >
                  {noShowClaimsCount}
                </Badge>
              </HStack>
            </Tab>

            <Tab fontWeight="700" fontSize="sm" py={3.5} px={{ base: 3, md: 4 }} whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FaMapMarkedAlt} boxSize={3.5} />
                <Text>Zone health</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={{ base: 3, md: 5 }} py={5}>
              <Flex
                direction={{ base: "column", lg: "row" }}
                justify="space-between"
                align={{ base: "stretch", lg: "center" }}
                gap={3}
                mb={4}
              >
                <HStack spacing={2} flexWrap="wrap">
                  <InputGroup size="sm" maxW={{ base: "100%", md: "340px" }}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search booking, customer, phone, service, technician..."
                      value={bookingSearch}
                      onChange={(event) => {
                        setBookingSearch(event.target.value);
                        setBookingPage(1);
                      }}
                      borderRadius="8px"
                    />
                    {bookingSearch && (
                      <InputRightElement>
                        <IconButton
                          size="xs"
                          icon={<FaTimes size={10} />}
                          variant="ghost"
                          onClick={() => {
                            setBookingSearch("");
                            setBookingPage(1);
                          }}
                          aria-label="Clear search"
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>

                  <Select
                    size="sm"
                    maxW={{ base: "100%", md: "220px" }}
                    value={bookingStatusFilter}
                    onChange={(event) => {
                      setBookingStatusFilter(event.target.value);
                      setBookingPage(1);
                    }}
                    borderRadius="8px"
                    aria-label="Filter bookings by status"
                  >
                    <option value="ALL">All bookings</option>
                    <option value="UNASSIGNED">Waiting for technician</option>
                    <option value="ASSIGNED">Technician assigned</option>
                    <option value="NOSHOW">No-show reported</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>

                  <Select
                    size="sm"
                    maxW={{ base: "100%", md: "210px" }}
                    value={bookingTypeFilter}
                    onChange={(event) => {
                      setBookingTypeFilter(event.target.value);
                      setBookingPage(1);
                    }}
                    borderRadius="8px"
                    aria-label="Filter by booking type"
                  >
                    <option value="ALL">All booking types</option>
                    <option value="INSTANT">Instant bookings ({instantCount})</option>
                    <option value="SCHEDULED">
                      Scheduled bookings ({scheduledCount})
                    </option>
                  </Select>

                  <Select
                    size="sm"
                    maxW={{ base: "100%", md: "190px" }}
                    value={bookingSort}
                    onChange={(event) => {
                      setBookingSort(event.target.value);
                      setBookingPage(1);
                    }}
                    borderRadius="8px"
                    aria-label="Sort bookings"
                  >
                    <option value="SOONEST">Soonest scheduled</option>
                    <option value="LATEST">Latest scheduled</option>
                    <option value="CUSTOMER">Customer name</option>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<FaTimes size={10} />}
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                  )}
                </HStack>

                <Text fontSize="xs" color="gray.500" fontWeight="700" whiteSpace="nowrap">
                  Showing {pagedBookings.length} of {sortedBookings.length} bookings
                </Text>
              </Flex>

              {bookingsLoading && bookings.length === 0 ? (
                <VStack spacing={2} align="stretch">
                  {[0, 1, 2, 3, 4].map((row) => (
                    <Skeleton key={row} height="58px" borderRadius="10px" />
                  ))}
                </VStack>
              ) : (
                <>
                  {bookingsError && (
                    <Alert status="error" borderRadius="12px" mb={4} fontSize="sm">
                      <AlertIcon />
                      <Box flex="1">
                        <Text fontWeight="800">Bookings could not be loaded</Text>
                        <Text fontSize="xs">{bookingsError}</Text>
                      </Box>
                      <Button size="xs" variant="outline" onClick={handleRefreshAll}>
                        Try again
                      </Button>
                    </Alert>
                  )}

                  {sortedBookings.length === 0 ? (
                    <Center py={16}>
                      <VStack spacing={3}>
                        <Box
                          p={4}
                          bg={isDark ? "gray.700" : "gray.50"}
                          borderRadius="full"
                          color={hasActiveFilters ? "gray.400" : "green.500"}
                        >
                          <Icon
                            as={hasActiveFilters ? FaSearch : FaCheckCircle}
                            boxSize={7}
                          />
                        </Box>
                        <Text fontWeight="800" color={isDark ? "gray.200" : "gray.700"}>
                          {hasActiveFilters
                            ? "No bookings match these filters"
                            : "No scheduled bookings yet"}
                        </Text>
                        <Text fontSize="sm" color="gray.500" maxW="380px" textAlign="center">
                          {hasActiveFilters
                            ? "Try a different search or status, or clear the filters to see every booking."
                            : "New customer bookings will appear here as soon as they are scheduled."}
                        </Text>
                        {hasActiveFilters && (
                          <Button size="sm" variant="outline" onClick={clearFilters}>
                            Clear filters
                          </Button>
                        )}
                      </VStack>
                    </Center>
                  ) : (
                    <>
                      <Box
                        display={{ base: "none", md: "block" }}
                        overflowX="auto"
                        borderRadius="12px"
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                      >
                        <Table variant="simple" size="md">
                          <Thead bg={isDark ? "gray.700" : "gray.50"}>
                            <Tr>
                              <Th py={3.5} fontSize="2xs">BOOKING</Th>
                              <Th py={3.5} fontSize="2xs">CUSTOMER</Th>
                              <Th py={3.5} fontSize="2xs">SERVICE &amp; VALUE</Th>
                              <Th py={3.5} fontSize="2xs">DISPATCH STATUS</Th>
                              <Th py={3.5} fontSize="2xs">TECHNICIAN</Th>
                              <Th py={3.5} fontSize="2xs" textAlign="right">
                                ACTIONS
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {pagedBookings.map((booking, index) => {
                              const id = bookingIdOf(booking);
                              const technician = technicianOf(booking);
                              const currentTechnician = technician?.isCurrent
                                ? technician
                                : null;
                              const previousTechnician =
                                technician && !technician.isCurrent
                                  ? technician
                                  : null;
                              const noShowAction = noShowActionOf(booking);
                              const typeMeta = getBookingTypeMeta(booking);

                              return (
                                <Tr
                                  key={id || `booking-${index}`}
                                  _hover={{
                                    bg: isDark ? "gray.700" : "gray.50",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleOpenDrawer(id)}
                                >
                                  <Td py={3.5}>
                                    <VStack align="flex-start" spacing={1}>
                                      <HStack spacing={1}>
                                        <Text
                                          fontSize="xs"
                                          fontFamily="mono"
                                          fontWeight="700"
                                          color={isDark ? "teal.200" : "teal.700"}
                                        >
                                          #{id ? id.slice(-8) : "—"}
                                        </Text>
                                        {id && (
                                          <Tooltip label="Copy booking ID" hasArrow>
                                            <IconButton
                                              size="2xs"
                                              icon={
                                                <Icon
                                                  as={copiedKey === `bid_${id}` ? FaCheck : FaCopy}
                                                  boxSize={2.5}
                                                />
                                              }
                                              variant="ghost"
                                              colorScheme={
                                                copiedKey === `bid_${id}` ? "green" : "gray"
                                              }
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                copyToClipboard(id, `bid_${id}`, "Booking ID");
                                              }}
                                              aria-label="Copy booking ID"
                                            />
                                          </Tooltip>
                                        )}
                                        <Badge
                                          colorScheme={typeMeta.color}
                                          variant="subtle"
                                          borderRadius="full"
                                          px={1.5}
                                          py={0.5}
                                          fontSize="2xs"
                                        >
                                          {typeMeta.label}
                                        </Badge>
                                      </HStack>
                                      <HStack spacing={1.5}>
                                        <Icon as={FaCalendarAlt} boxSize={2.5} color="gray.400" />
                                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                                          {formatFriendlyDateTime(scheduleValueOf(booking))}
                                        </Text>
                                      </HStack>
                                    </VStack>
                                  </Td>

                                  <Td py={3.5}>
                                    <HStack spacing={2.5}>
                                      <Avatar
                                        size="sm"
                                        name={customerNameOf(booking)}
                                        bg="teal.500"
                                        color="white"
                                        fontSize="2xs"
                                      />
                                      <VStack align="flex-start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                                          {customerNameOf(booking)}
                                        </Text>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          fontFamily="mono"
                                          noOfLines={1}
                                        >
                                          {customerPhoneOf(booking)}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </Td>

                                  <Td py={3.5}>
                                    <VStack align="flex-start" spacing={0.5}>
                                      <Text
                                        fontSize="sm"
                                        fontWeight="700"
                                        color={isDark ? "teal.200" : "teal.700"}
                                        noOfLines={1}
                                      >
                                        {serviceNameOf(booking)}
                                      </Text>
                                      <Text fontSize="sm" fontWeight="800">
                                        {formatFriendlyCurrency(bookingAmountOf(booking))}
                                      </Text>
                                    </VStack>
                                  </Td>

                                  <Td py={3.5}>{renderDispatchBadge(booking)}</Td>

                                  <Td py={3.5}>
                                    {currentTechnician ? (
                                      <HStack spacing={2}>
                                        <Avatar
                                          size="xs"
                                          name={currentTechnician.name || "Technician"}
                                          bg="green.500"
                                          color="white"
                                          fontSize="2xs"
                                        />
                                        <VStack align="flex-start" spacing={0}>
                                          <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                                            {currentTechnician.name || "Technician"}
                                          </Text>
                                          {currentTechnician.mobileNumber && (
                                            <Text
                                              fontSize="2xs"
                                              color="gray.500"
                                              fontFamily="mono"
                                            >
                                              {currentTechnician.mobileNumber}
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>
                                    ) : previousTechnician ? (
                                      <HStack spacing={2}>
                                        <Avatar
                                          size="xs"
                                          name={previousTechnician.name || "Technician"}
                                          bg="orange.400"
                                          color="white"
                                          fontSize="2xs"
                                        />
                                        <VStack align="flex-start" spacing={0}>
                                          <Text
                                            fontSize="sm"
                                            fontWeight="700"
                                            color="gray.500"
                                            noOfLines={1}
                                          >
                                            {previousTechnician.name || "Technician"}
                                          </Text>
                                          <Text
                                            fontSize="2xs"
                                            color="orange.500"
                                            fontWeight="600"
                                          >
                                            Previously assigned
                                          </Text>
                                        </VStack>
                                      </HStack>
                                    ) : (
                                      <HStack spacing={1.5} color="gray.500">
                                        <Icon as={FaUserClock} boxSize={3} />
                                        <Text fontSize="xs" fontStyle="italic">
                                          Auto-matching
                                        </Text>
                                      </HStack>
                                    )}
                                  </Td>

                                  <Td py={3.5} onClick={(event) => event.stopPropagation()}>
                                    <HStack spacing={1.5} justify="flex-end">
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        leftIcon={<FaEye size={10} />}
                                        onClick={() => handleOpenDrawer(id)}
                                      >
                                        Details
                                      </Button>

                                      <Tooltip
                                        label="See which technicians accepted, rejected, or expired"
                                        hasArrow
                                      >
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="purple"
                                          leftIcon={<FaBullhorn size={10} />}
                                          onClick={() => handleOpenTracker(id)}
                                        >
                                          Track
                                        </Button>
                                      </Tooltip>

                                      <Tooltip label="Send to dispatch queue again" hasArrow>
                                        <IconButton
                                          size="xs"
                                          variant="outline"
                                          colorScheme="teal"
                                          icon={<FaRedoAlt size={10} />}
                                          isLoading={bookingRetryId === id}
                                          isDisabled={!id}
                                          onClick={() => handleRetryBooking(id)}
                                          aria-label="Retry dispatch"
                                        />
                                      </Tooltip>

                                      {noShowAction && (
                                        <Button
                                          size="xs"
                                          colorScheme={
                                            noShowAction === "mark_paid" ? "green" : "orange"
                                          }
                                          variant="solid"
                                          onClick={() =>
                                            handleOpenCompensation(booking, noShowAction)
                                          }
                                        >
                                          {noShowAction === "mark_paid"
                                            ? "Mark paid"
                                            : "Review"}
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

                      <VStack
                        display={{ base: "flex", md: "none" }}
                        spacing={3}
                        align="stretch"
                      >
                        {pagedBookings.map((booking, index) => {
                          const id = bookingIdOf(booking);
                          const technician = technicianOf(booking);
                          const currentTechnician = technician?.isCurrent
                            ? technician
                            : null;
                          const previousTechnician =
                            technician && !technician.isCurrent
                              ? technician
                              : null;
                          const noShowAction = noShowActionOf(booking);
                          const typeMeta = getBookingTypeMeta(booking);

                          return (
                            <Box
                              key={id || `mobile-booking-${index}`}
                              p={4}
                              borderRadius="12px"
                              border="1px solid"
                              borderColor={isDark ? "gray.700" : "gray.200"}
                              bg={isDark ? "gray.800" : "white"}
                              cursor="pointer"
                              onClick={() => handleOpenDrawer(id)}
                            >
                              <Flex justify="space-between" align="flex-start" gap={2}>
                                <Box minW={0}>
                                  <HStack spacing={1}>
                                    <Text
                                      fontSize="xs"
                                      fontFamily="mono"
                                      fontWeight="700"
                                      color={isDark ? "teal.200" : "teal.700"}
                                    >
                                      #{id ? id.slice(-8) : "—"}
                                    </Text>
                                    {id && (
                                      <IconButton
                                        size="2xs"
                                        icon={
                                          <Icon
                                            as={copiedKey === `mbid_${id}` ? FaCheck : FaCopy}
                                            boxSize={2.5}
                                          />
                                        }
                                        variant="ghost"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          copyToClipboard(id, `mbid_${id}`, "Booking ID");
                                        }}
                                        aria-label="Copy booking ID"
                                      />
                                    )}
                                    <Badge
                                      colorScheme={typeMeta.color}
                                      variant="subtle"
                                      borderRadius="full"
                                      px={1.5}
                                      py={0.5}
                                      fontSize="2xs"
                                    >
                                      {typeMeta.label}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" fontWeight="800" mt={1} noOfLines={1}>
                                    {customerNameOf(booking)}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                    {customerPhoneOf(booking)}
                                  </Text>
                                </Box>
                                {renderDispatchBadge(booking)}
                              </Flex>

                              <Flex justify="space-between" align="center" mt={3} gap={2}>
                                <VStack align="flex-start" spacing={0.5} minW={0}>
                                  <Text fontSize="xs" fontWeight="700" noOfLines={1}>
                                    {serviceNameOf(booking)}
                                  </Text>
                                  <Text fontSize="2xs" color="gray.500">
                                    {formatFriendlyDateTime(scheduleValueOf(booking))}
                                  </Text>
                                </VStack>
                                <Text fontSize="sm" fontWeight="800" whiteSpace="nowrap">
                                  {formatFriendlyCurrency(bookingAmountOf(booking))}
                                </Text>
                              </Flex>

                              <Flex justify="space-between" align="center" mt={3} gap={2}>
                                <HStack spacing={1.5} color="gray.600" minW={0}>
                                  <Icon
                                    as={currentTechnician ? FaUserCheck : FaUserClock}
                                    boxSize={3}
                                    color={
                                      currentTechnician
                                        ? "green.500"
                                        : previousTechnician
                                        ? "orange.500"
                                        : "gray.400"
                                    }
                                  />
                                  <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                                    {currentTechnician
                                      ? currentTechnician.name || "Technician"
                                      : previousTechnician
                                      ? `${previousTechnician.name || "Technician"} · Previously assigned`
                                      : "Auto-matching"}
                                  </Text>
                                </HStack>

                                <HStack spacing={1.5} onClick={(event) => event.stopPropagation()}>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleOpenDrawer(id)}
                                  >
                                    Details
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="purple"
                                    onClick={() => handleOpenTracker(id)}
                                  >
                                    Track
                                  </Button>
                                  <IconButton
                                    size="xs"
                                    variant="outline"
                                    colorScheme="teal"
                                    icon={<FaRedoAlt size={10} />}
                                    isLoading={bookingRetryId === id}
                                    isDisabled={!id}
                                    onClick={() => handleRetryBooking(id)}
                                    aria-label="Retry dispatch"
                                  />
                                </HStack>
                              </Flex>

                              {noShowAction && (
                                <Button
                                  size="xs"
                                  mt={3}
                                  w="full"
                                  colorScheme={
                                    noShowAction === "mark_paid" ? "green" : "orange"
                                  }
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenCompensation(booking, noShowAction);
                                  }}
                                >
                                  {noShowAction === "mark_paid"
                                    ? "Mark no-show compensation as paid"
                                    : "Review no-show claim"}
                                </Button>
                              )}
                            </Box>
                          );
                        })}
                      </VStack>

                      {filteredBookings.length > 0 && (
                        <Box mt={4}>
                          <TablePagination
                            page={bookingPage}
                            totalPages={Math.max(
                              1,
                              Math.ceil(sortedBookings.length / bookingLimit)
                            )}
                            totalRows={sortedBookings.length}
                            indexOfFirst={(bookingPage - 1) * bookingLimit}
                            indexOfLast={Math.min(
                              bookingPage * bookingLimit,
                              sortedBookings.length
                            )}
                            rowsPerPage={bookingLimit}
                            onPageChange={setBookingPage}
                            onRowsPerPageChange={(value) => {
                              setBookingLimit(value);
                              setBookingPage(1);
                            }}
                            label="bookings"
                          />
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </TabPanel>

            <TabPanel px={{ base: 3, md: 5 }} py={5}>
              <BookingAuditTab
                preselectedBookingId={trackerBookingId}
                onOpenCompensation={handleOpenCompensation}
              />
            </TabPanel>

            <TabPanel px={{ base: 3, md: 5 }} py={5}>
              <DispatchQueueTab
                onInspectBooking={handleOpenDrawer}
                stats={stats}
                health={health}
                onRefreshStats={loadTelemetry}
              />
            </TabPanel>

            <TabPanel px={{ base: 3, md: 5 }} py={5}>
              <TechnicianBaseLocationTab
                onRefreshMissingCount={handleMissingCountChange}
              />
            </TabPanel>

            <TabPanel px={{ base: 3, md: 5 }} py={5}>
              <NoShowCompensationTab
                onRefreshPendingCount={handleNoShowCountChange}
              />
            </TabPanel>

            <TabPanel px={{ base: 3, md: 5 }} py={5}>
              <ZoneHealthTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      <BookingDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDrawerBookingId("");
        }}
        bookingId={selectedDrawerBookingId}
        onOpenCompensation={handleOpenCompensation}
        onOpenTracker={handleOpenTracker}
        isDark={isDark}
      />

      <NoShowCompensationModal
        isOpen={isCompensationModalOpen}
        onClose={() => {
          setIsCompensationModalOpen(false);
          setSelectedCompensationBooking(null);
        }}
        booking={selectedCompensationBooking}
        actionType={compensationActionType}
        onSuccess={() => {
          const isMounted = { current: true };
          loadTelemetry(isMounted, true);
          loadLiveBookings(isMounted, true);
          setLastUpdated(new Date());
        }}
      />

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
          confirmAction === "retry-all" && failedCount > 0
            ? [
                `${failedCount} failed ${failedCount === 1 ? "job" : "jobs"} will be requeued.`,
                "Eligible technicians will be notified again automatically.",
              ]
            : undefined
        }
      />
    </Box>
  );
}
