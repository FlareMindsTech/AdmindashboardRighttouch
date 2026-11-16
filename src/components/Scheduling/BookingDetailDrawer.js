import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Icon,
  Tooltip,
  IconButton,
  Flex,
  SimpleGrid,
  Link,
  Center,
  Divider,
  Skeleton,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaFileInvoiceDollar,
  FaCheck,
  FaCopy,
  FaBullhorn,
  FaCalendarAlt,
  FaUserCheck,
  FaUserTimes,
  FaRedoAlt,
  FaExternalLinkAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaClock,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRoute,
  FaClipboardList,
  FaTruck,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSearch,
} from "react-icons/fa";
import { useAppToast } from "components/feedback";
import {
  getSchedulingBookingById,
  getBroadcastAudit,
  retryDispatch,
} from "api/scheduling";
import {
  formatFriendlyDateTime,
  formatFriendlyCurrency,
  formatFriendlyAddress,
  getGoogleMapsUrl,
  getFriendlyCandidateStatus,
  getBookingTypeMeta,
  getBroadcastSummary,
  formatFriendlyRelativeTime,
  getBookingCustomerName,
  getBookingCustomerPhone,
  getBookingTechnicianInfo,
  getBookingScheduleInfo,
  getBookingAmount,
  getAssignmentReleaseLabel,
  getExpiredBookingDescription,
  normalizeBroadcastAudit,
} from "./schedulingFormatters";

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "yellow",
    step: 0,
    description: "Booking created and waiting for dispatch.",
  },
  broadcasted: {
    label: "Broadcasting",
    color: "purple",
    step: 1,
    description: "Nearby technicians are being notified about this job.",
  },
  accepted: {
    label: "Assigned",
    color: "blue",
    step: 2,
    description: "A technician accepted this booking.",
  },
  on_the_way: {
    label: "On the way",
    color: "cyan",
    step: 3,
    description: "The technician is travelling to the customer.",
  },
  reached: {
    label: "Reached",
    color: "teal",
    step: 4,
    description: "The technician reached the service location.",
  },
  in_progress: {
    label: "In progress",
    color: "teal",
    step: 4,
    description: "Service work is currently in progress.",
  },
  completed: {
    label: "Completed",
    color: "green",
    step: 5,
    description: "The service was completed successfully.",
  },
  cancelled: {
    label: "Cancelled",
    color: "red",
    step: -1,
    description: "This booking was cancelled.",
  },
  expired: {
    label: "Expired",
    color: "orange",
    step: -1,
    description: "No technician accepted before the booking expired.",
  },
};

const STATUS_ALIASES = {
  searching: "broadcasted",
  requested: "pending",
  assigned: "accepted",
  inprogress: "in_progress",
};

const LIFECYCLE_STEPS = [
  { key: "pending", label: "Requested", icon: FaClipboardList },
  { key: "broadcasted", label: "Broadcast", icon: FaBullhorn },
  { key: "accepted", label: "Assigned", icon: FaUserCheck },
  { key: "on_the_way", label: "On the way", icon: FaTruck },
  { key: "in_progress", label: "In progress", icon: FaTools },
  { key: "completed", label: "Completed", icon: FaCheckCircle },
];

const normalizeStatusKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getStatusMeta = (status) => {
  const normalized = normalizeStatusKey(status);
  const key = STATUS_ALIASES[normalized] || normalized;
  if (STATUS_META[key]) return { key, ...STATUS_META[key] };
  return {
    key: normalized || "unknown",
    label: status ? String(status) : "Unknown",
    color: "gray",
    step: 0,
    description: "Booking status is unavailable.",
  };
};

const getCurrentStep = (statusMeta, booking) => {
  if (statusMeta.key === "cancelled" || statusMeta.key === "expired") return -1;
  if (statusMeta.key === "pending") {
    const assignmentStatus = normalizeStatusKey(booking?.assignmentStatus);
    if (assignmentStatus === "broadcasted") return 1;
    if (assignmentStatus === "assigned") return 2;
  }
  return statusMeta.step;
};

const SectionCard = ({
  dark,
  icon,
  colorScheme = "brand",
  title,
  subtitle,
  right,
  children,
}) => (
  <Box
    p={{ base: 4, md: 5 }}
    borderRadius="16px"
    bg={dark ? "gray.800" : "white"}
    border="1px solid"
    borderColor={dark ? "gray.700" : "gray.200"}
    h="full"
  >
    <Flex justify="space-between" align="flex-start" gap={3} mb={4}>
      <HStack spacing={3} align="flex-start" minW={0}>
        <Flex
          w="34px"
          h="34px"
          borderRadius="10px"
          bg={dark ? `${colorScheme}.900` : `${colorScheme}.50`}
          color={dark ? `${colorScheme}.200` : `${colorScheme}.600`}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={3.5} />
        </Flex>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="800">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="2xs" color="gray.500" mt={0.5}>
              {subtitle}
            </Text>
          )}
        </Box>
      </HStack>
      {right}
    </Flex>
    {children}
  </Box>
);

const InfoTile = ({ dark, icon, label, value, hint, valueColor }) => (
  <Box
    p={3}
    borderRadius="12px"
    bg={dark ? "whiteAlpha.100" : "white"}
    border="1px solid"
    borderColor={dark ? "whiteAlpha.200" : "gray.200"}
    minW={0}
  >
    <HStack spacing={1.5} color="gray.500">
      <Icon as={icon} boxSize={3} />
      <Text
        fontSize="3xs"
        fontWeight="800"
        textTransform="uppercase"
        letterSpacing="0.04em"
      >
        {label}
      </Text>
    </HStack>
    <Text
      fontSize="sm"
      fontWeight="800"
      mt={1}
      color={valueColor}
      wordBreak="break-word"
    >
      {value}
    </Text>
    {hint && (
      <Text fontSize="3xs" color="gray.500" mt={0.5} wordBreak="break-word">
        {hint}
      </Text>
    )}
  </Box>
);

const StatTile = ({ dark, icon, label, value, colorScheme }) => (
  <Box
    p={3}
    borderRadius="12px"
    bg={dark ? `${colorScheme}.900` : `${colorScheme}.50`}
    border="1px solid"
    borderColor={dark ? `${colorScheme}.800` : `${colorScheme}.100`}
  >
    <HStack justify="space-between" align="flex-start">
      <Box>
        <Text
          fontSize="2xl"
          fontWeight="900"
          lineHeight="1"
          color={dark ? `${colorScheme}.200` : `${colorScheme}.600`}
        >
          {value}
        </Text>
        <Text
          fontSize="3xs"
          fontWeight="800"
          color="gray.500"
          textTransform="uppercase"
          mt={1}
        >
          {label}
        </Text>
      </Box>
      <Icon
        as={icon}
        boxSize={4}
        color={dark ? `${colorScheme}.300` : `${colorScheme}.500`}
      />
    </HStack>
  </Box>
);

const TimeLabel = ({ value }) => {
  if (!value) {
    return (
      <Text fontSize="2xs" color="gray.400">
        —
      </Text>
    );
  }
  return (
    <Tooltip label={formatFriendlyDateTime(value)} hasArrow>
      <Text fontSize="2xs" color="gray.500" cursor="default">
        {formatFriendlyRelativeTime(value)}
      </Text>
    </Tooltip>
  );
};

const EmptyState = ({ dark, icon, title, description }) => (
  <VStack
    spacing={2}
    py={8}
    px={4}
    textAlign="center"
    borderRadius="12px"
    bg={dark ? "whiteAlpha.50" : "gray.50"}
    border="1px dashed"
    borderColor={dark ? "gray.700" : "gray.200"}
  >
    <Flex
      w="40px"
      h="40px"
      borderRadius="full"
      bg={dark ? "whiteAlpha.100" : "white"}
      color="gray.400"
      align="center"
      justify="center"
    >
      <Icon as={icon} boxSize={4} />
    </Flex>
    <Text fontSize="sm" fontWeight="800" color={dark ? "gray.200" : "gray.700"}>
      {title}
    </Text>
    <Text fontSize="2xs" color="gray.500" maxW="340px">
      {description}
    </Text>
  </VStack>
);

const LifecycleStepper = ({ dark, currentStep, statusMeta }) => (
  <SectionCard
    dark={dark}
    icon={FaRoute}
    colorScheme="brand"
    title="Booking progress"
    subtitle={statusMeta.description}
  >
    <Flex align="flex-start" overflowX="auto" pb={1}>
      {LIFECYCLE_STEPS.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        const isTodo = index > currentStep;

        return (
          <React.Fragment key={step.key}>
            <VStack spacing={1.5} minW="62px" flexShrink={0}>
              <Flex
                w="28px"
                h="28px"
                borderRadius="full"
                align="center"
                justify="center"
                bg={
                  isDone || isCurrent
                    ? dark
                      ? "brand.400"
                      : "brand.500"
                    : dark
                    ? "gray.700"
                    : "gray.100"
                }
                color={isDone || isCurrent ? "white" : "gray.500"}
                boxShadow={
                  isCurrent ? "0 0 0 4px rgba(0, 128, 128, 0.16)" : "none"
                }
              >
                <Icon
                  as={isDone ? FaCheck : step.icon}
                  boxSize={isDone ? 2.5 : 3}
                />
              </Flex>
              <Text
                fontSize="3xs"
                fontWeight={isTodo ? "600" : "800"}
                color={isTodo ? "gray.500" : dark ? "gray.100" : "gray.700"}
                textAlign="center"
                lineHeight="short"
              >
                {step.label}
              </Text>
            </VStack>
            {index < LIFECYCLE_STEPS.length - 1 && (
              <Box
                flex="1"
                minW="18px"
                h="2px"
                mt="13px"
                bg={
                  index < currentStep
                    ? dark
                      ? "brand.400"
                      : "brand.500"
                    : dark
                    ? "gray.700"
                    : "gray.200"
                }
              />
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  </SectionCard>
);

const TerminalStatusBanner = ({ dark, statusMeta }) => {
  const isCancelled = statusMeta.key === "cancelled";
  const colorScheme = isCancelled ? "red" : "orange";
  return (
    <Flex
      p={4}
      borderRadius="16px"
      bg={dark ? `${colorScheme}.900` : `${colorScheme}.50`}
      border="1px solid"
      borderColor={dark ? `${colorScheme}.800` : `${colorScheme}.200`}
      gap={3}
      align="flex-start"
    >
      <Flex
        w="34px"
        h="34px"
        borderRadius="10px"
        bg={dark ? `${colorScheme}.800` : `${colorScheme}.100`}
        color={dark ? `${colorScheme}.200` : `${colorScheme}.600`}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon as={isCancelled ? FaTimesCircle : FaHourglassHalf} boxSize={4} />
      </Flex>
      <Box>
        <Text
          fontSize="sm"
          fontWeight="800"
          color={dark ? `${colorScheme}.100` : `${colorScheme}.800`}
        >
          {statusMeta.label}
        </Text>
        <Text
          fontSize="xs"
          color={dark ? `${colorScheme}.200` : `${colorScheme}.700`}
          mt={0.5}
        >
          {statusMeta.description}
        </Text>
      </Box>
    </Flex>
  );
};

const DrawerSkeleton = () => (
  <VStack spacing={5} align="stretch">
    <Skeleton height="156px" borderRadius="16px" />
    <Skeleton height="94px" borderRadius="16px" />
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
      <Skeleton height="210px" borderRadius="16px" />
      <Skeleton height="210px" borderRadius="16px" />
    </SimpleGrid>
    <Skeleton height="290px" borderRadius="16px" />
  </VStack>
);

const hasAddressText = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      Object.values(value).some(
        (item) => typeof item === "string" && item.trim()
      )
  );

export default function BookingDetailDrawer({
  isOpen,
  onClose,
  bookingId,
  onOpenCompensation,
  onOpenTracker,
  isDark,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const dark = typeof isDark === "boolean" ? isDark : colorMode === "dark";
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [broadcast, setBroadcast] = useState(null);
  const [error, setError] = useState("");
  const [auditError, setAuditError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [retrying, setRetrying] = useState(false);
  const requestRef = useRef(0);

  const copyToClipboard = (text, key, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text).trim());
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    toast({
      title: "Copied",
      description: `${label}: ${text}`,
      status: "info",
      duration: 1800,
      isClosable: true,
    });
  };

  const loadDetails = useCallback(async (id, options = {}) => {
    if (!id) return;
    const { refresh = false } = options;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    setAuditError("");

    const [bookingResult, auditResult] = await Promise.all([
      getSchedulingBookingById(id),
      getBroadcastAudit(id),
    ]);

    if (requestRef.current !== requestId) return;

    if (bookingResult.error) {
      if (!refresh) setBooking(null);
      setError(bookingResult.error);
    } else {
      setBooking(
        bookingResult.data?.result ??
          bookingResult.data?.data ??
          bookingResult.data ??
          null
      );
    }

    if (auditResult.error) {
      setBroadcast(null);
      setAuditError(auditResult.error);
    } else {
      setBroadcast(normalizeBroadcastAudit(auditResult.data));
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!isOpen || !bookingId) {
      requestRef.current += 1;
      setBooking(null);
      setBroadcast(null);
      setError("");
      setAuditError("");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    loadDetails(bookingId);
  }, [isOpen, bookingId, loadDetails]);

  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    []
  );

  if (!isOpen) return null;

  const handleRetryJob = async () => {
    if (!bookingId) return;
    setRetrying(true);
    const { error: retryError, status } = await retryDispatch(bookingId);
    setRetrying(false);

    if (retryError) {
      if (status === 409) {
        toast({
          title: "Already active",
          description:
            "This job is already queued or active in the dispatch outbox.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      toast.error(retryError, {
        title: "Retry failed",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Dispatch requeued",
      description: "The job was re-added to the active dispatch queue.",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
    loadDetails(bookingId, { refresh: true });
  };

  const baseStatusMeta = getStatusMeta(booking?.status);
  const statusMeta =
    baseStatusMeta.key === "expired"
      ? { ...baseStatusMeta, description: getExpiredBookingDescription(booking) }
      : baseStatusMeta;
  const currentStep = getCurrentStep(statusMeta, booking);
  const isTerminal = ["cancelled", "expired"].includes(statusMeta.key);
  const canRetry = Boolean(booking) && !["completed", "cancelled"].includes(statusMeta.key);
  const noShow = booking?.customerNoShow || booking?.noShow;
  const hasNoShow = Boolean(
    noShow &&
      (noShow.status ||
        noShow.compensationStatus ||
        noShow.amount ||
        noShow.compensationPaise)
  );
  const bookingTypeMeta = getBookingTypeMeta(booking);
  const broadcastSummary = getBroadcastSummary(broadcast);
  const broadcastCandidates =
    broadcast?.candidates || broadcast?.offers || broadcast?.deliveries || [];

  const serviceName =
    booking?.serviceName ||
    booking?.serviceId?.serviceName ||
    booking?.serviceSnapshot?.serviceName ||
    booking?.service?.name ||
    "Service";
  const serviceType =
    booking?.serviceId?.serviceType ||
    booking?.serviceType ||
    booking?.serviceSnapshot?.serviceType ||
    "";
  const faultProblem = booking?.faultProblem || "";

  const customerName = getBookingCustomerName(booking);
  const customerPhone = getBookingCustomerPhone(booking);
  const customerEmail =
    booking?.customerId?.email ||
    booking?.customerSnapshot?.email ||
    booking?.customer?.email ||
    booking?.customerEmail ||
    "";

  const addressSnapshot =
    booking?.addressSnapshot && typeof booking.addressSnapshot === "object"
      ? booking.addressSnapshot
      : null;
  const addressSource =
    (hasAddressText(addressSnapshot) ? addressSnapshot : null) ||
    (hasAddressText(booking?.addressId) ? booking.addressId : null) ||
    booking?.address ||
    booking?.serviceLocation;
  const addressText = formatFriendlyAddress(addressSource);
  const addressLat = Number(
    addressSnapshot?.latitude ?? booking?.location?.coordinates?.[1]
  );
  const addressLng = Number(
    addressSnapshot?.longitude ?? booking?.location?.coordinates?.[0]
  );
  const addressMapsUrl =
    Number.isFinite(addressLat) && Number.isFinite(addressLng)
      ? getGoogleMapsUrl(addressLat, addressLng)
      : "";

  const techInfo = getBookingTechnicianInfo(booking);
  const techIsCurrent = Boolean(techInfo?.isCurrent);
  const previousAssignment = techInfo && !techIsCurrent ? techInfo.latestAssignment : null;
  const previousReleaseLabel = previousAssignment?.releaseReason
    ? getAssignmentReleaseLabel(previousAssignment.releaseReason)
    : "";
  const tech = techInfo?.raw || null;
  const techCoords = Array.isArray(tech?.serviceBaseLocation?.coordinates)
    ? tech.serviceBaseLocation.coordinates
    : [];
  const techHasCoords =
    techCoords.length === 2 &&
    Number.isFinite(Number(techCoords[1])) &&
    Number.isFinite(Number(techCoords[0]));
  const techMapsUrl = techHasCoords
    ? getGoogleMapsUrl(Number(techCoords[1]), Number(techCoords[0]))
    : "";

  const schedule = getBookingScheduleInfo(booking);
  const bookingAmount = getBookingAmount(booking);
  const paymentStatus = normalizeStatusKey(booking?.paymentStatus);
  const paymentHint =
    paymentStatus === "paid"
      ? "Payment received"
      : paymentStatus === "pending"
      ? "Payment pending"
      : paymentStatus === "refunded"
      ? "Payment refunded"
      : "Payment status not recorded";

  const noShowStatus =
    noShow?.compensationStatus || noShow?.status || "Pending review";
  const noShowAmount = formatFriendlyCurrency(
    noShow?.compensationPaise != null ? noShow.compensationPaise : noShow?.amount,
    noShow?.compensationPaise != null
  );

  const assignmentStatus = normalizeStatusKey(booking?.assignmentStatus);
  let techEmptyMessage = "No technician is assigned to this booking yet.";
  if (
    statusMeta.key === "broadcasted" ||
    assignmentStatus === "broadcasted"
  ) {
    techEmptyMessage =
      "Broadcast is notifying nearby technicians. Responses will appear in the audit below.";
  } else if (statusMeta.key === "expired") {
    techEmptyMessage =
      "No technician accepted this booking before the offer window expired.";
  } else if (statusMeta.key === "cancelled") {
    techEmptyMessage =
      "This booking was cancelled before a technician was assigned.";
  } else if (statusMeta.key === "accepted" || assignmentStatus === "assigned") {
    techEmptyMessage =
      "A technician is assigned, but contact details are unavailable.";
  }

  const candidateDisplay = (candidate, index) => {
    const techRef =
      candidate.technicianId && typeof candidate.technicianId === "object"
        ? candidate.technicianId
        : null;
    const techUser = techRef?.userId;
    const candidateId =
      techRef?._id || candidate.technicianId || candidate.technician?.id || candidate.id;
    const matchedCurrentTech =
      techInfo &&
      candidateId &&
      String(candidateId) === String(techInfo.id);
    const techRefName = techRef
      ? techRef.name ||
        techRef.fullName ||
        `${techRef.fname || techUser?.fname || ""} ${
          techRef.lname || techUser?.lname || ""
        }`.trim()
      : "";
    const name =
      candidate.technicianName ||
      candidate.name ||
      candidate.technician?.name ||
      techRefName ||
      (matchedCurrentTech ? techInfo.name : "") ||
      (candidateId ? `Technician #${String(candidateId).slice(-6)}` : "Technician");
    const phone =
      candidate.phone ||
      techRef?.mobileNumber ||
      techRef?.phone ||
      techUser?.mobileNumber ||
      (matchedCurrentTech ? techInfo.phone : "");
    const offeredAt =
      candidate.offeredAt ||
      candidate.notifiedAt ||
      candidate.sentAt ||
      candidate.createdAt ||
      null;
    const respondedAt =
      candidate.respondedAt ||
      candidate.acceptedAt ||
      candidate.releasedAt ||
      candidate.rejectedAt ||
      candidate.declinedAt ||
      candidate.expiredAt ||
      null;

    return {
      key: `${candidateId || "candidate"}-${candidate.attemptNumber || index}`,
      id: candidateId,
      name,
      phone,
      distanceKm: candidate.distanceKm,
      offeredAt,
      respondedAt,
      attemptNumber: candidate.attemptNumber,
      releaseReason: candidate.releaseReason,
      status: getFriendlyCandidateStatus(
        candidate.status || candidate.state || candidate.response
      ),
    };
  };

  const candidateRows = broadcastCandidates.map(candidateDisplay);

  return (
    <Drawer isOpen={isOpen} placement="right" size="xl" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent
        minW={{ base: "100%", md: "720px", lg: "840px" }}
        maxW={{ base: "100%", md: "920px" }}
        bg={dark ? "gray.900" : "white"}
        color={dark ? "gray.100" : "gray.800"}
      >
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor={dark ? "gray.700" : "gray.200"}
          bg={dark ? "gray.800" : "gray.50"}
          py={4}
          px={6}
        >
          <Flex justify="space-between" align="center" pr={9} gap={3}>
            <HStack spacing={3} minW={0}>
              <Flex
                w="40px"
                h="40px"
                borderRadius="12px"
                bg={dark ? "brand.500" : "brand.600"}
                color="white"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={FaFileInvoiceDollar} boxSize={5} />
              </Flex>
              <Box minW={0}>
                <Text fontSize="md" fontWeight="800" noOfLines={1}>
                  Booking &amp; Dispatch 360°
                </Text>
                <HStack spacing={1}>
                  <Text
                    fontSize="2xs"
                    color="gray.500"
                    fontFamily="mono"
                    isTruncated
                  >
                    ID: #{String(bookingId || "").slice(-10)}
                  </Text>
                  <Tooltip label="Copy booking ID" hasArrow>
                    <IconButton
                      size="2xs"
                      icon={
                        <Icon
                          as={copiedKey === "bId" ? FaCheck : FaCopy}
                          boxSize={2.5}
                        />
                      }
                      variant="ghost"
                      colorScheme={copiedKey === "bId" ? "green" : "gray"}
                      onClick={() =>
                        copyToClipboard(bookingId, "bId", "Booking ID")
                      }
                      aria-label="Copy booking ID"
                    />
                  </Tooltip>
                </HStack>
              </Box>
            </HStack>

            <Tooltip label="Refresh booking and audit" hasArrow>
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="brand"
                icon={<Icon as={FaSyncAlt} boxSize={3.5} />}
                isLoading={refreshing}
                onClick={() => loadDetails(bookingId, { refresh: true })}
                aria-label="Refresh booking and audit"
              />
            </Tooltip>
          </Flex>
          <DrawerCloseButton top={4} right={4} />
        </DrawerHeader>

        <DrawerBody p={{ base: 4, md: 6 }}>
          {loading && !booking ? (
            <DrawerSkeleton />
          ) : error && !booking ? (
            <Center py={20}>
              <VStack spacing={3} maxW="360px" textAlign="center">
                <Flex
                  w="48px"
                  h="48px"
                  borderRadius="full"
                  bg={dark ? "red.900" : "red.50"}
                  color={dark ? "red.200" : "red.500"}
                  align="center"
                  justify="center"
                >
                  <Icon as={FaExclamationTriangle} boxSize={5} />
                </Flex>
                <Text fontSize="sm" fontWeight="800">
                  Could not load this booking
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {error}
                </Text>
                <Button
                  size="sm"
                  colorScheme="brand"
                  onClick={() => loadDetails(bookingId)}
                >
                  Try again
                </Button>
              </VStack>
            </Center>
          ) : !booking ? (
            <Center py={20}>
              <VStack spacing={3} maxW="360px" textAlign="center">
                <Flex
                  w="48px"
                  h="48px"
                  borderRadius="full"
                  bg={dark ? "whiteAlpha.100" : "gray.100"}
                  color="gray.400"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaSearch} boxSize={5} />
                </Flex>
                <Text fontSize="sm" fontWeight="800">
                  Booking not found
                </Text>
                <Text fontSize="xs" color="gray.500">
                  The booking record may have been removed or the ID may be
                  invalid.
                </Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={5} align="stretch">
              {hasNoShow && (
                <Box
                  p={4}
                  borderRadius="16px"
                  bg={dark ? "orange.900" : "orange.50"}
                  border="1px solid"
                  borderColor={dark ? "orange.800" : "orange.200"}
                >
                  <Flex
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    gap={3}
                    direction={{ base: "column", sm: "row" }}
                  >
                    <HStack spacing={3} align="flex-start">
                      <Flex
                        w="34px"
                        h="34px"
                        borderRadius="10px"
                        bg={dark ? "orange.800" : "orange.100"}
                        color={dark ? "orange.200" : "orange.600"}
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={FaMoneyBillWave} boxSize={4} />
                      </Flex>
                      <Box>
                        <Badge
                          colorScheme="orange"
                          variant="subtle"
                          fontSize="3xs"
                          borderRadius="full"
                          px={2}
                          py={0.5}
                        >
                          Customer no-show claim
                        </Badge>
                        <Text
                          fontSize="sm"
                          fontWeight="800"
                          color={dark ? "orange.100" : "orange.800"}
                          mt={1}
                        >
                          {noShowStatus}
                        </Text>
                        <Text
                          fontSize="2xs"
                          color={dark ? "orange.200" : "orange.700"}
                          mt={0.5}
                        >
                          Technician reported that the customer was unreachable
                          at the service location.
                        </Text>
                      </Box>
                    </HStack>
                    <VStack align={{ base: "flex-start", sm: "flex-end" }} spacing={2}>
                      <Text
                        fontSize="lg"
                        fontWeight="900"
                        color={dark ? "orange.100" : "orange.800"}
                      >
                        {noShowAmount}
                      </Text>
                      {onOpenCompensation && (
                        <Button
                          size="xs"
                          colorScheme="orange"
                          leftIcon={<FaMoneyBillWave size={10} />}
                          onClick={() => {
                            onClose();
                            onOpenCompensation(booking);
                          }}
                        >
                          Review &amp; settle claim
                        </Button>
                      )}
                    </VStack>
                  </Flex>
                </Box>
              )}

              <Box
                p={{ base: 4, md: 5 }}
                borderRadius="16px"
                bgGradient={
                  dark
                    ? "linear(to-br, gray.800, gray.900)"
                    : "linear(to-br, brand.50, white)"
                }
                border="1px solid"
                borderColor={dark ? "gray.700" : "brand.100"}
              >
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  gap={4}
                  direction={{ base: "column", md: "row" }}
                >
                  <Box flex="1" minW={0}>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge
                        colorScheme={bookingTypeMeta.color}
                        variant="subtle"
                        fontSize="3xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        textTransform="uppercase"
                      >
                        {bookingTypeMeta.label}
                      </Badge>
                      <Badge
                        colorScheme={statusMeta.color}
                        variant="solid"
                        fontSize="3xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        textTransform="uppercase"
                      >
                        {statusMeta.label}
                      </Badge>
                    </HStack>
                    <Text
                      fontSize="3xs"
                      fontWeight="800"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mt={3}
                    >
                      Service requirement
                    </Text>
                    <Text
                      fontSize={{ base: "xl", md: "2xl" }}
                      fontWeight="900"
                      color={dark ? "white" : "brand.900"}
                      mt={0.5}
                      wordBreak="break-word"
                    >
                      {serviceName}
                    </Text>
                    {serviceType && (
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        {serviceType}
                      </Text>
                    )}
                    {faultProblem && (
                      <Text fontSize="xs" color="gray.600" mt={2}>
                        Reported issue: {faultProblem}
                      </Text>
                    )}
                  </Box>

                  <Box
                    textAlign={{ base: "left", md: "right" }}
                    flexShrink={0}
                    minW={{ base: "100%", md: "170px" }}
                  >
                    <Text
                      fontSize="3xs"
                      fontWeight="800"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      Total amount
                    </Text>
                    <Text
                      fontSize="3xl"
                      fontWeight="900"
                      color={dark ? "brand.200" : "brand.600"}
                      lineHeight="1.1"
                    >
                      {formatFriendlyCurrency(bookingAmount)}
                    </Text>
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      {paymentHint}
                    </Text>
                  </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mt={4}>
                  <InfoTile
                    dark={dark}
                    icon={FaCalendarAlt}
                    label={
                      bookingTypeMeta.key === "instant"
                        ? "Requested at"
                        : "Scheduled for"
                    }
                    value={formatFriendlyDateTime(schedule.date)}
                    hint={schedule.timeLabel || undefined}
                  />
                  <InfoTile
                    dark={dark}
                    icon={
                      bookingTypeMeta.key === "instant" ? FaClock : FaCalendarAlt
                    }
                    label="Booking type"
                    value={bookingTypeMeta.label}
                    hint={bookingTypeMeta.description}
                  />
                  <InfoTile
                    dark={dark}
                    icon={statusMeta.key === "completed" ? FaCheckCircle : FaRoute}
                    label="Current status"
                    value={statusMeta.label}
                    hint={statusMeta.description}
                    valueColor={dark ? `${statusMeta.color}.200` : `${statusMeta.color}.600`}
                  />
                </SimpleGrid>
              </Box>

              {isTerminal ? (
                <TerminalStatusBanner dark={dark} statusMeta={statusMeta} />
              ) : (
                <LifecycleStepper
                  dark={dark}
                  currentStep={currentStep}
                  statusMeta={statusMeta}
                />
              )}

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                <SectionCard
                  dark={dark}
                  icon={FaUser}
                  colorScheme="brand"
                  title="Customer details"
                  subtitle="Contact and service destination"
                >
                  <HStack spacing={3} align="flex-start">
                    <Avatar
                      size="md"
                      name={customerName}
                      bg="brand.500"
                      color="white"
                      fontWeight="700"
                    />
                    <Box minW={0} flex="1">
                      <Text fontSize="md" fontWeight="800" wordBreak="break-word">
                        {customerName}
                      </Text>
                      <HStack spacing={1.5} mt={1} color="gray.500">
                        <Icon as={FaPhoneAlt} boxSize={2.5} />
                        <Text fontSize="xs" fontFamily="mono">
                          {customerPhone || "No phone on file"}
                        </Text>
                        {customerPhone && (
                          <Tooltip label="Copy phone number" hasArrow>
                            <IconButton
                              size="2xs"
                              variant="ghost"
                              icon={
                                <Icon
                                  as={
                                    copiedKey === "customerPhone"
                                      ? FaCheck
                                      : FaCopy
                                  }
                                  boxSize={2.5}
                                />
                              }
                              colorScheme={
                                copiedKey === "customerPhone" ? "green" : "gray"
                              }
                              onClick={() =>
                                copyToClipboard(
                                  customerPhone,
                                  "customerPhone",
                                  "Phone number"
                                )
                              }
                              aria-label="Copy customer phone number"
                            />
                          </Tooltip>
                        )}
                      </HStack>
                      {customerEmail && (
                        <HStack spacing={1.5} mt={1} color="gray.500">
                          <Icon as={FaEnvelope} boxSize={2.5} />
                          <Text fontSize="xs" wordBreak="break-all">
                            {customerEmail}
                          </Text>
                        </HStack>
                      )}
                    </Box>
                  </HStack>

                  <Divider my={4} borderColor={dark ? "gray.700" : "gray.200"} />

                  <HStack spacing={2.5} align="flex-start">
                    <Icon as={FaMapMarkerAlt} color="brand.500" mt={0.5} />
                    <Box minW={0}>
                      <Text
                        fontSize="3xs"
                        fontWeight="800"
                        color="gray.500"
                        textTransform="uppercase"
                      >
                        Service address
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="500"
                        mt={1}
                        wordBreak="break-word"
                      >
                        {addressText}
                      </Text>
                      {addressMapsUrl && (
                        <Link
                          href={addressMapsUrl}
                          isExternal
                          color="brand.500"
                          fontSize="2xs"
                          fontWeight="700"
                          mt={1.5}
                          display="inline-flex"
                          alignItems="center"
                          gap={1}
                        >
                          Open in Maps
                          <Icon as={FaExternalLinkAlt} boxSize={2} />
                        </Link>
                      )}
                    </Box>
                  </HStack>
                </SectionCard>

                <SectionCard
                  dark={dark}
                  icon={techInfo ? (techIsCurrent ? FaUserCheck : FaUserTimes) : FaUserTimes}
                  colorScheme={techInfo ? (techIsCurrent ? "green" : "orange") : "gray"}
                  title="Technician details"
                  subtitle={
                    techInfo
                      ? techIsCurrent
                        ? "Assigned service professional"
                        : "Released technician from a previous attempt"
                      : "Assignment pending"
                  }
                  right={
                    <Badge
                      colorScheme={techInfo ? (techIsCurrent ? "green" : "orange") : "gray"}
                      variant="subtle"
                      fontSize="3xs"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                    >
                      {techInfo ? (techIsCurrent ? "Assigned" : "Previously assigned") : "Unassigned"}
                    </Badge>
                  }
                >
                  {techInfo ? (
                    <VStack spacing={2.5} align="stretch">
                      {!techIsCurrent && (
                        <Alert status="warning" borderRadius="md" py={2} px={3}>
                          <AlertIcon boxSize={3} />
                          <Box>
                            <Text fontSize="2xs" fontWeight="700">
                              No longer assigned
                            </Text>
                            <Text fontSize="2xs">
                              {previousReleaseLabel
                                ? `Released: ${previousReleaseLabel}`
                                : "This technician was released before the booking ended."}
                              {previousAssignment?.releasedAt
                                ? ` · ${formatFriendlyDateTime(previousAssignment.releasedAt)}`
                                : ""}
                            </Text>
                          </Box>
                        </Alert>
                      )}
                      <HStack spacing={3} align="flex-start">
                        <Avatar
                          size="md"
                          name={techInfo.name}
                          bg={techIsCurrent ? "green.500" : "orange.400"}
                          color="white"
                          fontWeight="700"
                        />
                        <Box minW={0} flex="1">
                          <Text
                            fontSize="md"
                            fontWeight="800"
                            wordBreak="break-word"
                          >
                            {techInfo.name}
                          </Text>
                          <HStack spacing={1.5} mt={1} color="gray.500">
                            <Icon as={FaPhoneAlt} boxSize={2.5} />
                            <Text fontSize="xs" fontFamily="mono">
                              {techInfo.phone || "No phone on file"}
                            </Text>
                            {techInfo.phone && (
                              <Tooltip label="Copy phone number" hasArrow>
                                <IconButton
                                  size="2xs"
                                  variant="ghost"
                                  icon={
                                    <Icon
                                      as={
                                        copiedKey === "techPhone"
                                          ? FaCheck
                                          : FaCopy
                                      }
                                      boxSize={2.5}
                                    />
                                  }
                                  colorScheme={
                                    copiedKey === "techPhone" ? "green" : "gray"
                                  }
                                  onClick={() =>
                                    copyToClipboard(
                                      techInfo.phone,
                                      "techPhone",
                                      "Technician phone"
                                    )
                                  }
                                  aria-label="Copy technician phone number"
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Box>
                      </HStack>

                      <Divider
                        my={1}
                        borderColor={dark ? "gray.700" : "gray.200"}
                      />

                      {techInfo.id && (
                        <Flex justify="space-between" align="center" gap={2}>
                          <Text fontSize="xs" color="gray.500">
                            Technician ID
                          </Text>
                          <HStack spacing={1}>
                            <Text
                              fontSize="2xs"
                              fontFamily="mono"
                              fontWeight="700"
                            >
                              #{String(techInfo.id).slice(-8)}
                            </Text>
                            <Tooltip label="Copy technician ID" hasArrow>
                              <IconButton
                                size="2xs"
                                variant="ghost"
                                icon={
                                  <Icon
                                    as={
                                      copiedKey === "techId" ? FaCheck : FaCopy
                                    }
                                    boxSize={2.5}
                                  />
                                }
                                colorScheme={
                                  copiedKey === "techId" ? "green" : "gray"
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    techInfo.id,
                                    "techId",
                                    "Technician ID"
                                  )
                                }
                                aria-label="Copy technician ID"
                              />
                            </Tooltip>
                          </HStack>
                        </Flex>
                      )}

                      {techHasCoords && (
                        <Flex justify="space-between" align="center" gap={2}>
                          <Text fontSize="xs" color="gray.500">
                            Service origin
                          </Text>
                          <HStack spacing={1.5}>
                            <Text fontSize="2xs" fontFamily="mono">
                              {Number(techCoords[1]).toFixed(4)}° N,{" "}
                              {Number(techCoords[0]).toFixed(4)}° E
                            </Text>
                            {techMapsUrl && (
                              <Tooltip label="Open service origin in Maps" hasArrow>
                                <IconButton
                                  size="2xs"
                                  variant="ghost"
                                  colorScheme="brand"
                                  icon={<Icon as={FaExternalLinkAlt} boxSize={2.5} />}
                                  as="a"
                                  href={techMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label="Open technician service origin in Maps"
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Flex>
                      )}
                    </VStack>
                  ) : (
                    <EmptyState
                      dark={dark}
                      icon={FaUserTimes}
                      title="No technician assigned yet"
                      description={techEmptyMessage}
                    />
                  )}
                </SectionCard>
              </SimpleGrid>

              <SectionCard
                dark={dark}
                icon={FaBullhorn}
                colorScheme="purple"
                title="Broadcast & assignment audit"
                subtitle="Offers sent to technicians and their responses"
                right={
                  <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                    {broadcast && (
                      <Badge
                        colorScheme="purple"
                        variant="subtle"
                        fontSize="3xs"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                      >
                        Wave v{broadcast.version || 1}
                      </Badge>
                    )}
                    {onOpenTracker && bookingId && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="purple"
                        leftIcon={<Icon as={FaBullhorn} boxSize={2.5} />}
                        onClick={() => {
                          onClose();
                          onOpenTracker(bookingId);
                        }}
                      >
                        Track responses
                      </Button>
                    )}
                  </HStack>
                }
              >
                {auditError && (
                  <Alert status="warning" borderRadius="12px" fontSize="xs" mb={4}>
                    <AlertIcon />
                    Could not load broadcast audit data: {auditError}
                  </Alert>
                )}

                {!broadcast ? (
                  <EmptyState
                    dark={dark}
                    icon={FaBullhorn}
                    title="No broadcast audit available"
                    description="Offers may not have been generated yet, or this booking was assigned outside the broadcast flow."
                  />
                ) : (
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3}>
                      <StatTile
                        dark={dark}
                        icon={FaBullhorn}
                        label="Offers"
                        value={broadcastSummary.totalOffers}
                        colorScheme="brand"
                      />
                      <StatTile
                        dark={dark}
                        icon={FaCheckCircle}
                        label="Accepted"
                        value={broadcastSummary.accepted}
                        colorScheme="green"
                      />
                      <StatTile
                        dark={dark}
                        icon={FaTimesCircle}
                        label="Rejected"
                        value={broadcastSummary.rejected}
                        colorScheme="red"
                      />
                      <StatTile
                        dark={dark}
                        icon={FaHourglassHalf}
                        label="Expired"
                        value={broadcastSummary.expired}
                        colorScheme="orange"
                      />
                    </SimpleGrid>

                    {(broadcastSummary.pending > 0 ||
                      broadcastSummary.busy > 0 ||
                      broadcastSummary.cancelled > 0) && (
                      <HStack spacing={2} flexWrap="wrap">
                        {broadcastSummary.pending > 0 && (
                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            fontSize="3xs"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            {broadcastSummary.pending} awaiting response
                          </Badge>
                        )}
                        {broadcastSummary.busy > 0 && (
                          <Badge
                            colorScheme="gray"
                            variant="subtle"
                            fontSize="3xs"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            {broadcastSummary.busy} busy / on job
                          </Badge>
                        )}
                        {broadcastSummary.cancelled > 0 && (
                          <Badge
                            colorScheme="purple"
                            variant="subtle"
                            fontSize="3xs"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            {broadcastSummary.cancelled} cancelled / released
                          </Badge>
                        )}
                      </HStack>
                    )}

                    {candidateRows.length === 0 ? (
                      <EmptyState
                        dark={dark}
                        icon={FaClipboardList}
                        title="No response records yet"
                        description="No individual technician offer or assignment responses are available for this booking."
                      />
                    ) : (
                      <>
                        <Box
                          display={{ base: "none", md: "block" }}
                          overflowX="auto"
                          borderRadius="12px"
                          border="1px solid"
                          borderColor={dark ? "gray.700" : "gray.200"}
                        >
                          <Table variant="simple" size="sm">
                            <Thead bg={dark ? "whiteAlpha.50" : "gray.50"}>
                              <Tr>
                                <Th fontSize="3xs">Technician</Th>
                                <Th fontSize="3xs">Distance</Th>
                                <Th fontSize="3xs">Offered</Th>
                                <Th fontSize="3xs">Responded</Th>
                                <Th fontSize="3xs">Status</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {candidateRows.map((candidate) => (
                                <Tr key={candidate.key}>
                                  <Td py={3}>
                                    <HStack spacing={2}>
                                      <Avatar
                                        size="xs"
                                        name={candidate.name}
                                        bg="purple.500"
                                        color="white"
                                        fontSize="2xs"
                                      />
                                      <Box minW={0}>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="700"
                                          isTruncated
                                        >
                                          {candidate.name}
                                        </Text>
                                        {candidate.phone && (
                                          <Text
                                            fontSize="3xs"
                                            color="gray.500"
                                            fontFamily="mono"
                                          >
                                            {candidate.phone}
                                          </Text>
                                        )}
                                        {candidate.attemptNumber && (
                                          <Text
                                            fontSize="3xs"
                                            color="gray.500"
                                          >
                                            Attempt #{candidate.attemptNumber}
                                          </Text>
                                        )}
                                      </Box>
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <Text fontSize="2xs">
                                      {candidate.distanceKm != null
                                        ? `${Number(
                                            candidate.distanceKm
                                          ).toFixed(1)} km`
                                        : "—"}
                                    </Text>
                                  </Td>
                                  <Td py={3}>
                                    <TimeLabel value={candidate.offeredAt} />
                                  </Td>
                                  <Td py={3}>
                                    <TimeLabel value={candidate.respondedAt} />
                                  </Td>
                                  <Td py={3}>
                                    <Tooltip
                                      label={
                                        candidate.releaseReason ||
                                        candidate.status.desc
                                      }
                                      hasArrow
                                    >
                                      <Badge
                                        colorScheme={candidate.status.color}
                                        variant="subtle"
                                        fontSize="3xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                      >
                                        {candidate.status.label}
                                      </Badge>
                                    </Tooltip>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>

                        <VStack
                          spacing={2}
                          align="stretch"
                          display={{ base: "flex", md: "none" }}
                        >
                          {candidateRows.map((candidate) => (
                            <Box
                              key={candidate.key}
                              p={3}
                              borderRadius="12px"
                              bg={dark ? "whiteAlpha.50" : "gray.50"}
                              border="1px solid"
                              borderColor={dark ? "gray.700" : "gray.200"}
                            >
                              <Flex justify="space-between" align="flex-start" gap={2}>
                                <HStack spacing={2} minW={0}>
                                  <Avatar
                                    size="xs"
                                    name={candidate.name}
                                    bg="purple.500"
                                    color="white"
                                    fontSize="2xs"
                                  />
                                  <Box minW={0}>
                                    <Text
                                      fontSize="xs"
                                      fontWeight="700"
                                      isTruncated
                                    >
                                      {candidate.name}
                                    </Text>
                                    {candidate.phone && (
                                      <Text
                                        fontSize="3xs"
                                        color="gray.500"
                                        fontFamily="mono"
                                      >
                                        {candidate.phone}
                                      </Text>
                                    )}
                                  </Box>
                                </HStack>
                                <Badge
                                  colorScheme={candidate.status.color}
                                  variant="subtle"
                                  fontSize="3xs"
                                  px={2}
                                  py={0.5}
                                  borderRadius="full"
                                  flexShrink={0}
                                >
                                  {candidate.status.label}
                                </Badge>
                              </Flex>
                              <HStack
                                spacing={2}
                                mt={2}
                                color="gray.500"
                                fontSize="3xs"
                                flexWrap="wrap"
                              >
                                {candidate.distanceKm != null && (
                                  <Text>
                                    {Number(candidate.distanceKm).toFixed(1)} km
                                    away
                                  </Text>
                                )}
                                {candidate.offeredAt && (
                                  <Text>
                                    Offered{" "}
                                    {formatFriendlyRelativeTime(
                                      candidate.offeredAt
                                    )}
                                  </Text>
                                )}
                                {candidate.respondedAt && (
                                  <Text>
                                    Responded{" "}
                                    {formatFriendlyRelativeTime(
                                      candidate.respondedAt
                                    )}
                                  </Text>
                                )}
                                {candidate.attemptNumber && (
                                  <Text>Attempt #{candidate.attemptNumber}</Text>
                                )}
                              </HStack>
                              {candidate.releaseReason && (
                                <Text fontSize="3xs" color="orange.500" mt={1.5}>
                                  Reason: {candidate.releaseReason}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </>
                    )}
                  </VStack>
                )}
              </SectionCard>
            </VStack>
          )}
        </DrawerBody>

        <DrawerFooter
          borderTopWidth="1px"
          borderColor={dark ? "gray.700" : "gray.200"}
          bg={dark ? "gray.800" : "gray.50"}
          py={3}
          px={6}
        >
          <Flex
            w="full"
            gap={2}
            direction={{ base: "column-reverse", sm: "row" }}
            justify="flex-end"
          >
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {canRetry ? (
              <Tooltip
                label="Requeue this booking for dispatch"
                hasArrow
                shouldWrapChildren
              >
                <Button
                  colorScheme="brand"
                  leftIcon={<Icon as={FaRedoAlt} boxSize={3} />}
                  isLoading={retrying}
                  onClick={handleRetryJob}
                  minW={{ base: "100%", sm: "190px" }}
                >
                  Retry dispatch
                </Button>
              </Tooltip>
            ) : (
              <Button
                colorScheme="brand"
                variant="outline"
                onClick={onClose}
                minW={{ base: "100%", sm: "150px" }}
              >
                Close inspector
              </Button>
            )}
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
