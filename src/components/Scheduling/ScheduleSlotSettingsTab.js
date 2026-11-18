// src/components/Scheduling/ScheduleSlotSettingsTab.js
// Global Schedule Slot Settings & Live Preview Tab
// Direct implementation of Postman collection 01b - Schedule Slot Settings:
// - GET  /api/admin/settings/schedule-slots
// - PUT  /api/admin/settings/schedule-slots
// - POST /api/admin/settings/schedule-slots/reset

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Icon,
  Badge,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  Tag,
  TagLabel,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUndo,
  FaSave,
  FaSlidersH,
  FaSun,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAppToast } from "components/feedback";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import {
  getScheduleSlotSettings,
  updateScheduleSlotSettings,
  resetScheduleSlotSettings,
} from "api/scheduling";

// Preset configurations for convenience
const PRESET_WINDOWS = [
  { label: "Standard (09:00 - 21:00, 4 Slots)", start: 9, end: 21, count: 4 },
  { label: "Early Bird (08:00 - 20:00, 4 Slots)", start: 8, end: 20, count: 4 },
  { label: "High Density (09:00 - 21:00, 6 Slots)", start: 9, end: 21, count: 6 },
  { label: "Extended Day (08:00 - 22:00, 7 Slots)", start: 8, end: 22, count: 7 },
  { label: "Compact Afternoon (10:00 - 18:00, 4 Slots)", start: 10, end: 18, count: 4 },
];

const PRESET_DAYS = [
  { label: "3 Days", value: 3 },
  { label: "5 Days (Default)", value: 5 },
  { label: "7 Days (1 Week)", value: 7 },
  { label: "14 Days (2 Weeks)", value: 14 },
  { label: "30 Days (1 Month)", value: 30 },
];

// Helper: Format hour number (0-23) to 12-hour AM/PM label
const formatHourLabel = (h) => {
  const hourNum = Number(h);
  if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) return `${h}:00`;
  const period = hourNum >= 12 ? "PM" : "AM";
  const h12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h12)}:00 ${period} (${pad(hourNum)}:00)`;
};

// Helper: Format 12-hour time from hour & minute
const format12Time = (h, m = 0) => {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h12)}:${pad(m)} ${period}`;
};

export default function ScheduleSlotSettingsTab() {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Data states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [serverConfig, setServerConfig] = useState(null);
  const [serverPreview, setServerPreview] = useState(null);
  const [serverDefaults, setServerDefaults] = useState(null);

  // Form states
  const [scheduleDays, setScheduleDays] = useState(5);
  const [windowStartHour, setWindowStartHour] = useState(9);
  const [windowEndHour, setWindowEndHour] = useState(21);
  const [slotCount, setSlotCount] = useState(4);

  // UI states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedPreviewDayIndex, setSelectedPreviewDayIndex] = useState(0);

  // Load Settings from API
  const loadSettings = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    const { data, error } = await getScheduleSlotSettings();
    if (!quiet) setLoading(false);

    if (error) {
      toast.error(error, {
        title: "Failed to load schedule slot settings",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const res = data?.result ?? data?.data ?? data ?? {};
    const cfg = res.config || {};
    setServerConfig(cfg);
    setServerPreview(res.preview || null);
    setServerDefaults(res.defaults || null);

    if (cfg.scheduleDays != null) setScheduleDays(Number(cfg.scheduleDays));
    if (cfg.windowStartHour != null) setWindowStartHour(Number(cfg.windowStartHour));
    if (cfg.windowEndHour != null) setWindowEndHour(Number(cfg.windowEndHour));
    if (cfg.slotCount != null) setSlotCount(Number(cfg.slotCount));
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Real-time validation math
  const validation = useMemo(() => {
    const sH = Number(windowStartHour);
    const eH = Number(windowEndHour);
    const sCount = Number(slotCount);
    const sDays = Number(scheduleDays);

    const isValidHours = Number.isInteger(sH) && Number.isInteger(eH) && sH >= 0 && sH <= 22 && eH >= 1 && eH <= 23 && eH > sH;
    const windowHours = isValidHours ? eH - sH : 0;
    const windowMinutes = windowHours * 60;

    const isValidSlotCount = Number.isInteger(sCount) && sCount >= 1 && sCount <= 12;
    const isEvenDivision = isValidSlotCount && windowMinutes > 0 && windowMinutes % sCount === 0;
    const slotDurationMinutes = isValidSlotCount && isEvenDivision ? windowMinutes / sCount : 0;
    const isMinDuration = slotDurationMinutes >= 30;
    const isValidDays = Number.isInteger(sDays) && sDays >= 1 && sDays <= 30;

    const isValid = isValidHours && isValidSlotCount && isEvenDivision && isMinDuration && isValidDays;

    let errorReason = "";
    if (!isValidHours) {
      errorReason = "Service window end hour must be strictly greater than start hour.";
    } else if (!isValidSlotCount) {
      errorReason = "Number of slots must be between 1 and 12.";
    } else if (!isEvenDivision) {
      errorReason = `The ${windowHours}-hour window (${windowMinutes} mins) cannot be divided evenly into ${sCount} slots. Each slot must have equal whole minutes.`;
    } else if (!isMinDuration) {
      errorReason = `Each slot would be only ${slotDurationMinutes} mins. Minimum allowed slot length is 30 minutes.`;
    } else if (!isValidDays) {
      errorReason = "Bookable schedule days must be between 1 and 30 days.";
    }

    return {
      isValid,
      errorReason,
      windowHours,
      windowMinutes,
      slotDurationMinutes,
      isValidHours,
      isValidSlotCount,
      isEvenDivision,
      isMinDuration,
      isValidDays,
    };
  }, [windowStartHour, windowEndHour, slotCount, scheduleDays]);

  // Real-time locally computed slot list
  const liveGeneratedSlots = useMemo(() => {
    if (!validation.isValid) return [];
    const slots = [];
    const { slotDurationMinutes } = validation;

    for (let i = 0; i < slotCount; i++) {
      const startMin = windowStartHour * 60 + i * slotDurationMinutes;
      const endMin = startMin + slotDurationMinutes;
      const startH = Math.floor(startMin / 60);
      const startM = startMin % 60;
      const endH = Math.floor(endMin / 60);
      const endM = endMin % 60;

      const pad = (n) => String(n).padStart(2, "0");
      const startTime = `${pad(startH)}:${pad(startM)}`;
      const endTime = `${pad(endH)}:${pad(endM)}`;
      const label = `${format12Time(startH, startM)} – ${format12Time(endH, endM)}`;

      // Friendly time period
      let period = "Day";
      let periodColor = "blue";
      if (startH < 12) {
        period = "Morning";
        periodColor = "teal";
      } else if (startH < 16) {
        period = "Afternoon";
        periodColor = "orange";
      } else if (startH < 20) {
        period = "Evening";
        periodColor = "purple";
      } else {
        period = "Night";
        periodColor = "gray";
      }

      slots.push({
        index: i + 1,
        startTime,
        endTime,
        label,
        durationMinutes: slotDurationMinutes,
        period,
        periodColor,
      });
    }
    return slots;
  }, [validation, windowStartHour, slotCount]);

  // Bookable calendar preview days
  const previewDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const count = Math.max(1, Math.min(scheduleDays, 30));

    for (let i = 0; i < count; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const weekday = isToday ? "Today" : isTomorrow ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateText = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const isoDate = d.toISOString().split("T")[0];

      days.push({
        index: i,
        isoDate,
        weekday,
        dateText,
        isToday,
      });
    }
    return days;
  }, [scheduleDays]);

  // Detect whether form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!serverConfig) return false;
    return (
      scheduleDays !== Number(serverConfig.scheduleDays) ||
      windowStartHour !== Number(serverConfig.windowStartHour) ||
      windowEndHour !== Number(serverConfig.windowEndHour) ||
      slotCount !== Number(serverConfig.slotCount)
    );
  }, [serverConfig, scheduleDays, windowStartHour, windowEndHour, slotCount]);

  // Save updated config
  const handleSaveConfig = async () => {
    if (!validation.isValid) {
      toast.error(validation.errorReason, {
        title: "Invalid slot configuration",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    const payload = {
      scheduleDays: Number(scheduleDays),
      windowStartHour: Number(windowStartHour),
      windowEndHour: Number(windowEndHour),
      slotCount: Number(slotCount),
    };

    const { data, error } = await updateScheduleSlotSettings(payload);
    setSaving(false);

    if (error) {
      toast.error(error, {
        title: "Failed to update schedule slot settings",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const res = data?.result ?? data?.data ?? data ?? {};
    setServerConfig(res.config || payload);
    if (res.preview) setServerPreview(res.preview);

    toast({
      title: "Schedule Slot Settings Saved",
      description: `Configured ${scheduleDays} bookable days with ${slotCount} daily slots (${validation.slotDurationMinutes} mins each).`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Reset to server defaults
  const handleConfirmReset = async () => {
    setIsResetConfirmOpen(false);
    setResetting(true);
    const { data, error } = await resetScheduleSlotSettings();
    setResetting(false);

    if (error) {
      toast.error(error, {
        title: "Failed to reset settings",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const res = data?.result ?? data?.data ?? data ?? {};
    const cfg = res.config || { scheduleDays: 5, windowStartHour: 9, windowEndHour: 21, slotCount: 4 };
    setServerConfig(cfg);
    if (res.preview) setServerPreview(res.preview);

    setScheduleDays(Number(cfg.scheduleDays || 5));
    setWindowStartHour(Number(cfg.windowStartHour || 9));
    setWindowEndHour(Number(cfg.windowEndHour || 21));
    setSlotCount(Number(cfg.slotCount || 4));

    toast({
      title: "Restored Default Slot Settings",
      description: "Reset to 5 bookable days, 09:00 - 21:00 operating window, and 4 slots.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Preset button handler
  const handleApplyPreset = (preset) => {
    setWindowStartHour(preset.start);
    setWindowEndHour(preset.end);
    setSlotCount(preset.count);
  };

  if (loading && !serverConfig) {
    return (
      <Center py={24}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="3px" />
          <Text fontSize="sm" color="gray.500" fontWeight="600">
            Loading schedule slot configuration &amp; live preview...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
        mb={5}
      >
        <Box>
          <HStack spacing={2.5}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="teal.50"
              color="teal.600"
              align="center"
              justify="center"
            >
              <Icon as={FaClock} boxSize={4} />
            </Flex>
            <Box>
              <HStack spacing={2}>
                <Text fontSize="lg" fontWeight="900" letterSpacing="-0.3px">
                  Global Schedule Slot Settings
                </Text>
                {isDirty && (
                  <Badge colorScheme="orange" variant="solid" fontSize="3xs" px={2} borderRadius="full">
                    Unsaved changes
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                Configure customer bookable window, daily operating hours, and service slot intervals across all zones.
              </Text>
            </Box>
          </HStack>
        </Box>

        <HStack spacing={2.5} flexWrap="wrap">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<MdRefresh size={16} />}
            onClick={() => loadSettings(false)}
            isLoading={loading}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="ghost"
            colorScheme="orange"
            leftIcon={<Icon as={FaUndo} boxSize={3} />}
            onClick={() => setIsResetConfirmOpen(true)}
            isLoading={resetting}
          >
            Reset to defaults
          </Button>

          <Button
            size="sm"
            colorScheme="teal"
            leftIcon={<Icon as={FaSave} boxSize={3} />}
            onClick={handleSaveConfig}
            isLoading={saving}
            isDisabled={!validation.isValid || !isDirty}
          >
            Save changes
          </Button>
        </HStack>
      </Flex>

      {/* Metric KPI cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={6}>
        {/* Metric 1: Bookable Days */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
        >
          <HStack justify="space-between" align="flex-start" mb={2}>
            <Text fontSize="2xs" fontWeight="800" color="gray.500" textTransform="uppercase">
              Bookable Advance Window
            </Text>
            <Icon as={FaCalendarAlt} color="teal.500" boxSize={3.5} />
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color={isDark ? "teal.200" : "teal.600"}>
            {scheduleDays} {scheduleDays === 1 ? "Day" : "Days"}
          </Text>
          <Text fontSize="2xs" color="gray.500" mt={1}>
            Customers can book slots up to {scheduleDays} days ahead
          </Text>
        </Box>

        {/* Metric 2: Operating Window */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
        >
          <HStack justify="space-between" align="flex-start" mb={2}>
            <Text fontSize="2xs" fontWeight="800" color="gray.500" textTransform="uppercase">
              Daily Service Window
            </Text>
            <Icon as={FaSun} color="orange.400" boxSize={3.5} />
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color={isDark ? "orange.200" : "orange.600"}>
            {format12Time(windowStartHour)} – {format12Time(windowEndHour)}
          </Text>
          <Text fontSize="2xs" color="gray.500" mt={1}>
            {validation.windowHours} hours of active operations per day
          </Text>
        </Box>

        {/* Metric 3: Slot Count */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
        >
          <HStack justify="space-between" align="flex-start" mb={2}>
            <Text fontSize="2xs" fontWeight="800" color="gray.500" textTransform="uppercase">
              Daily Slot Count
            </Text>
            <Icon as={FaSlidersH} color="purple.500" boxSize={3.5} />
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color={isDark ? "purple.200" : "purple.600"}>
            {slotCount} {slotCount === 1 ? "Slot" : "Slots"}
          </Text>
          <Text fontSize="2xs" color="gray.500" mt={1}>
            Divided evenly across the {validation.windowHours}-hour window
          </Text>
        </Box>

        {/* Metric 4: Slot Duration */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
        >
          <HStack justify="space-between" align="flex-start" mb={2}>
            <Text fontSize="2xs" fontWeight="800" color="gray.500" textTransform="uppercase">
              Slot Interval Duration
            </Text>
            <Icon as={FaClock} color="blue.500" boxSize={3.5} />
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color={isDark ? "blue.200" : "blue.600"}>
            {validation.slotDurationMinutes > 0 ? `${validation.slotDurationMinutes} mins` : "—"}
          </Text>
          <Text fontSize="2xs" color="gray.500" mt={1}>
            {validation.slotDurationMinutes >= 60
              ? `${(validation.slotDurationMinutes / 60).toFixed(1).replace(".0", "")} hrs per service window`
              : "Minimum requirement is 30 mins"}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Main Grid: Settings Form & Live Preview */}
      <SimpleGrid columns={{ base: 1, xl: 12 }} spacing={6}>
        {/* Left Column: Form Controls (7 cols) */}
        <Box
          gridColumn={{ xl: "span 7" }}
          p={{ base: 4, md: 5 }}
          borderRadius="16px"
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
        >
          <Text fontSize="sm" fontWeight="800" mb={1}>
            Slot Configuration Parameters
          </Text>
          <Text fontSize="xs" color="gray.500" mb={4}>
            Adjust settings below. The live schedule preview will update instantly to reflect your changes.
          </Text>

          {/* Quick Preset Buttons */}
          <Box mb={5} p={3} borderRadius="10px" bg={isDark ? "gray.800" : "gray.50"} border="1px dashed" borderColor={isDark ? "gray.700" : "gray.200"}>
            <Text fontSize="2xs" fontWeight="800" color="gray.500" textTransform="uppercase" mb={2}>
              Quick Presets:
            </Text>
            <Flex wrap="wrap" gap={2}>
              {PRESET_WINDOWS.map((preset) => {
                const isActive =
                  windowStartHour === preset.start &&
                  windowEndHour === preset.end &&
                  slotCount === preset.count;
                return (
                  <Button
                    key={preset.label}
                    size="xs"
                    variant={isActive ? "solid" : "outline"}
                    colorScheme={isActive ? "teal" : "gray"}
                    onClick={() => handleApplyPreset(preset)}
                    borderRadius="full"
                    fontWeight="600"
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </Flex>
          </Box>

          <VStack spacing={5} align="stretch">
            {/* Setting 1: Bookable Days */}
            <FormControl>
              <Flex justify="space-between" align="center" mb={1.5}>
                <FormLabel fontSize="xs" fontWeight="700" m={0}>
                  1. Advance Bookable Window (Days)
                </FormLabel>
                <Tag size="sm" colorScheme="teal" borderRadius="full">
                  <TagLabel fontWeight="700">{scheduleDays} Days</TagLabel>
                </Tag>
              </Flex>
              <FormHelperText fontSize="2xs" color="gray.500" mb={2}>
                Number of future days customers can view and book in the mobile app (Range: 1 – 30 days).
              </FormHelperText>

              <HStack spacing={3}>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={scheduleDays}
                  onChange={(val) => setScheduleDays(val)}
                  focusThumbOnChange={false}
                  colorScheme="teal"
                  flex="1"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={4} />
                </Slider>

                <NumberInput
                  size="sm"
                  maxW="85px"
                  min={1}
                  max={30}
                  value={scheduleDays}
                  onChange={(_, val) => !isNaN(val) && setScheduleDays(val)}
                >
                  <NumberInputField textAlign="center" fontWeight="700" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>

              {/* Day presets */}
              <HStack spacing={1.5} mt={2} flexWrap="wrap">
                {PRESET_DAYS.map((p) => (
                  <Button
                    key={p.label}
                    size="2xs"
                    variant={scheduleDays === p.value ? "solid" : "ghost"}
                    colorScheme="teal"
                    onClick={() => setScheduleDays(p.value)}
                  >
                    {p.label}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

            {/* Setting 2 & 3: Window Start & End Hour */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" mb={1}>
                  2. Window Start Hour (Opening)
                </FormLabel>
                <Select
                  size="sm"
                  borderRadius="8px"
                  value={windowStartHour}
                  onChange={(e) => setWindowStartHour(Number(e.target.value))}
                >
                  {Array.from({ length: 23 }, (_, i) => (
                    <option key={i} value={i}>
                      {formatHourLabel(i)}
                    </option>
                  ))}
                </Select>
                <FormHelperText fontSize="3xs" color="gray.500">
                  Earliest technician service arrival time.
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" mb={1}>
                  3. Window End Hour (Closing)
                </FormLabel>
                <Select
                  size="sm"
                  borderRadius="8px"
                  value={windowEndHour}
                  onChange={(e) => setWindowEndHour(Number(e.target.value))}
                >
                  {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {formatHourLabel(h)}
                    </option>
                  ))}
                </Select>
                <FormHelperText fontSize="3xs" color="gray.500">
                  Latest technician service departure window.
                </FormHelperText>
              </FormControl>
            </SimpleGrid>

            {/* Setting 4: Number of Slots */}
            <FormControl>
              <Flex justify="space-between" align="center" mb={1.5}>
                <FormLabel fontSize="xs" fontWeight="700" m={0}>
                  4. Number of Slots Per Day (slotCount)
                </FormLabel>
                <Tag size="sm" colorScheme="purple" borderRadius="full">
                  <TagLabel fontWeight="700">{slotCount} Slots</TagLabel>
                </Tag>
              </Flex>
              <FormHelperText fontSize="2xs" color="gray.500" mb={2}>
                Number of equal appointment intervals inside the {validation.windowHours}-hour window (Range: 1 – 12 slots).
              </FormHelperText>

              <HStack spacing={3}>
                <Slider
                  min={1}
                  max={12}
                  step={1}
                  value={slotCount}
                  onChange={(val) => setSlotCount(val)}
                  focusThumbOnChange={false}
                  colorScheme="purple"
                  flex="1"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={4} />
                </Slider>

                <NumberInput
                  size="sm"
                  maxW="85px"
                  min={1}
                  max={12}
                  value={slotCount}
                  onChange={(_, val) => !isNaN(val) && setSlotCount(val)}
                >
                  <NumberInputField textAlign="center" fontWeight="700" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>
            </FormControl>

            {/* Real-time Validation Banner */}
            <Box
              p={3.5}
              borderRadius="12px"
              bg={validation.isValid ? (isDark ? "teal.950" : "teal.50") : isDark ? "red.950" : "red.50"}
              border="1px solid"
              borderColor={validation.isValid ? (isDark ? "teal.800" : "teal.200") : isDark ? "red.800" : "red.200"}
            >
              <HStack spacing={2.5} align="flex-start">
                <Icon
                  as={validation.isValid ? FaCheckCircle : FaExclamationTriangle}
                  color={validation.isValid ? "teal.500" : "red.500"}
                  boxSize={4}
                  mt={0.5}
                />
                <Box flex="1">
                  <Text fontSize="xs" fontWeight="800" color={validation.isValid ? "teal.700" : "red.700"}>
                    {validation.isValid ? "Valid Slot Configuration" : "Configuration Validation Issue"}
                  </Text>
                  <Text fontSize="2xs" color={validation.isValid ? "teal.600" : "red.600"} mt={0.5}>
                    {validation.isValid
                      ? `${validation.windowHours}-hour window divides cleanly into ${slotCount} slots of ${validation.slotDurationMinutes} minutes (${(validation.slotDurationMinutes / 60).toFixed(1).replace(".0", "")} hrs) each.`
                      : validation.errorReason}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Validation Checklist */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} fontSize="2xs">
              <HStack spacing={1.5} color={validation.isValidHours ? "teal.600" : "red.500"}>
                <Icon as={validation.isValidHours ? FaCheckCircle : FaExclamationTriangle} boxSize={3} />
                <Text>End hour strictly after start hour</Text>
              </HStack>
              <HStack spacing={1.5} color={validation.isEvenDivision ? "teal.600" : "red.500"}>
                <Icon as={validation.isEvenDivision ? FaCheckCircle : FaExclamationTriangle} boxSize={3} />
                <Text>Window divides evenly by slot count</Text>
              </HStack>
              <HStack spacing={1.5} color={validation.isMinDuration ? "teal.600" : "red.500"}>
                <Icon as={validation.isMinDuration ? FaCheckCircle : FaExclamationTriangle} boxSize={3} />
                <Text>Slot duration &gt;= 30 minutes</Text>
              </HStack>
              <HStack spacing={1.5} color={validation.isValidDays ? "teal.600" : "red.500"}>
                <Icon as={validation.isValidDays ? FaCheckCircle : FaExclamationTriangle} boxSize={3} />
                <Text>Schedule days within 1 to 30</Text>
              </HStack>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Right Column: Live Schedule & Slot Preview (5 cols) */}
        <Box
          gridColumn={{ xl: "span 5" }}
          p={{ base: 4, md: 5 }}
          borderRadius="16px"
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" fontWeight="800">
              Live Slot Preview
            </Text>
            <Badge colorScheme="teal" variant="subtle" fontSize="3xs" px={2} borderRadius="full">
              {liveGeneratedSlots.length} Slots Generated
            </Badge>
          </Flex>
          <Text fontSize="xs" color="gray.500" mb={3}>
            Customers will see these exact slots available for selection during booking.
          </Text>

          {/* Bookable Day Chips Selector */}
          <Box mb={4}>
            <Text fontSize="3xs" fontWeight="800" color="gray.400" textTransform="uppercase" mb={1.5}>
              Preview Across Bookable Days:
            </Text>
            <Flex overflowX="auto" pb={2} gap={1.5} sx={{ scrollbarWidth: "none", "::-webkit-scrollbar": { display: "none" } }}>
              {previewDays.map((d) => {
                const isSelected = selectedPreviewDayIndex === d.index;
                return (
                  <Button
                    key={d.isoDate}
                    size="xs"
                    variant={isSelected ? "solid" : "outline"}
                    colorScheme={isSelected ? "teal" : "gray"}
                    borderRadius="10px"
                    px={3}
                    py={2}
                    h="auto"
                    flexShrink={0}
                    onClick={() => setSelectedPreviewDayIndex(d.index)}
                  >
                    <VStack spacing={0} align="center">
                      <Text fontSize="3xs" fontWeight={isSelected ? "800" : "600"}>
                        {d.weekday}
                      </Text>
                      <Text fontSize="2xs" fontWeight="700">
                        {d.dateText}
                      </Text>
                    </VStack>
                  </Button>
                );
              })}
            </Flex>
          </Box>

          <Divider mb={3} borderColor={isDark ? "gray.700" : "gray.200"} />

          {/* Slot Timeline List */}
          <VStack spacing={2.5} align="stretch" maxH="440px" overflowY="auto" pr={1}>
            {liveGeneratedSlots.length === 0 ? (
              <Center py={10}>
                <Text fontSize="xs" color="gray.400">
                  Adjust parameters to generate slots preview.
                </Text>
              </Center>
            ) : (
              liveGeneratedSlots.map((slot) => (
                <Box
                  key={slot.index}
                  p={3}
                  borderRadius="12px"
                  bg={isDark ? "gray.800" : "gray.50"}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  transition="all 0.15s"
                  _hover={{ borderColor: "teal.400", bg: isDark ? "gray.750" : "teal.50" }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={2.5}>
                      <Flex
                        w="28px"
                        h="28px"
                        borderRadius="full"
                        bg={isDark ? "teal.900" : "teal.100"}
                        color={isDark ? "teal.200" : "teal.700"}
                        align="center"
                        justify="center"
                        fontSize="2xs"
                        fontWeight="800"
                      >
                        {slot.index}
                      </Flex>
                      <Box>
                        <Text fontSize="xs" fontWeight="800">
                          {slot.label}
                        </Text>
                        <Text fontSize="3xs" color="gray.500" fontFamily="mono">
                          {slot.startTime} to {slot.endTime}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={1.5}>
                      <Badge colorScheme={slot.periodColor} fontSize="3xs" borderRadius="full" px={2}>
                        {slot.period}
                      </Badge>
                      <Badge colorScheme="gray" fontSize="3xs" borderRadius="full" px={1.5}>
                        {slot.durationMinutes}m
                      </Badge>
                    </HStack>
                  </Flex>
                </Box>
              ))
            )}
          </VStack>

          {/* Current Config Metadata */}
          {serverConfig && (
            <Box mt={4} pt={3} borderTopWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
              <HStack justify="space-between" fontSize="3xs" color="gray.500" flexWrap="wrap" gap={1}>
                <Text>
                  Active: {serverConfig.scheduleDays || 5}d • {serverConfig.slotCount || 4} slots
                  {serverDefaults ? ` (Default: ${serverDefaults.scheduleDays}d, ${serverDefaults.slotCount} slots)` : ""}
                  {serverPreview ? " • Live synced" : ""}
                </Text>
                {serverConfig.updatedAt && (
                  <Text>
                    Updated {new Date(serverConfig.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                )}
              </HStack>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* Confirmation Modal for Resetting to Defaults */}
      <ConfirmActionModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Schedule Slot Configuration?"
        description="This will restore the standard default scheduling parameters: 5 bookable days, 09:00 - 21:00 operating window, and 4 slots of 3 hours each."
        confirmText="Reset to Defaults"
        confirmColorScheme="orange"
        icon={FaUndo}
        details={[
          "Bookable days will be set to 5 days ahead.",
          "Operating window will be set to 09:00 AM – 09:00 PM (12 hours).",
          "Daily slots will be set to 4 equal 3-hour intervals.",
        ]}
      />
    </Box>
  );
}
