import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  VStack,
  Icon,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  useColorMode,
  Spinner,
} from "@chakra-ui/react";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaChartBar,
  FaSun,
  FaShieldAlt,
  FaBuilding,
  FaBolt,
  FaWrench,
  FaExclamationCircle,
} from "react-icons/fa";
import { MdGridView, MdHomeRepairService } from "react-icons/md";
import { FiChevronDown, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { HiOutlineCalendar } from "react-icons/hi";
import ReactApexChart from "react-apexcharts";

// Currency formatter
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Category Icon & Color mapping based on name
const getCategoryIconMeta = (categoryName = "") => {
  const lower = categoryName.toLowerCase();
  if (lower.includes("solar") || lower.includes("sun") || lower.includes("energy")) {
    return {
      icon: FaSun,
      bg: "#FEF3C7", // amber-100
      color: "#D97706", // amber-600
    };
  }
  if (
    lower.includes("security") ||
    lower.includes("cctv") ||
    lower.includes("surveillance") ||
    lower.includes("shield")
  ) {
    return {
      icon: FaShieldAlt,
      bg: "#F3E8FF", // purple-100
      color: "#9333EA", // purple-600
    };
  }
  if (
    lower.includes("commercial") ||
    lower.includes("business") ||
    lower.includes("office") ||
    lower.includes("building")
  ) {
    return {
      icon: FaBuilding,
      bg: "#FFE4E6", // rose-100
      color: "#E11D48", // rose-600
    };
  }
  if (lower.includes("uncategorized") || lower.includes("general") || lower.includes("misc")) {
    return {
      icon: MdGridView,
      bg: "#E0F2FE", // sky-100
      color: "#0284C7", // sky-600
    };
  }
  if (lower.includes("electric") || lower.includes("wiring") || lower.includes("power")) {
    return {
      icon: FaBolt,
      bg: "#FEF9C3",
      color: "#CA8A04",
    };
  }
  if (lower.includes("plumb") || lower.includes("water") || lower.includes("pipe")) {
    return {
      icon: FaWrench,
      bg: "#E0F2FE",
      color: "#0284C7",
    };
  }
  // Default fallback
  return {
    icon: MdHomeRepairService,
    bg: "#F1F5F9",
    color: "#475569",
  };
};

const DATE_FILTER_LABELS = {
  thisMonth: "This Month",
  last30Days: "Last 30 Days",
  thisYear: "This Year",
  allTime: "All Time",
};

export default function ServiceCategoryPerformance({
  serviceBookings = [],
  categories = [],
  loading = false,
  gridColumn,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Date range filter state
  const [dateFilter, setDateFilter] = useState("thisMonth");

  // Filter bookings based on selected date range
  const filteredBookings = useMemo(() => {
    const list = Array.isArray(serviceBookings) ? serviceBookings : [];
    if (dateFilter === "allTime") return list;

    const now = new Date();
    return list.filter((b) => {
      const bDate = new Date(b?.createdAt || b?.scheduledAt || 0);
      if (isNaN(bDate.getTime())) return true;

      if (dateFilter === "thisMonth") {
        return (
          bDate.getMonth() === now.getMonth() &&
          bDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === "last30Days") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return bDate >= thirtyDaysAgo && bDate <= now;
      }
      if (dateFilter === "thisYear") {
        return bDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [serviceBookings, dateFilter]);

  // Aggregate Category Performance from filtered bookings
  const { categoryPerformance, totalRevenue, totalBookings } = useMemo(() => {
    const bookingsList = Array.isArray(filteredBookings) ? filteredBookings : [];
    const categoriesList = Array.isArray(categories) ? categories : [];

    const catMap = {};
    categoriesList.forEach((c) => {
      if (!c) return;
      const name = c.category || c.name;
      if (c._id && name) catMap[c._id] = name;
    });

    const perfMap = {};

    // Initialize with known categories
    categoriesList.forEach((c) => {
      if (!c) return;
      const name = c.category || c.name || "Unknown";
      if (!perfMap[name]) {
        perfMap[name] = { name, totalBookings: 0, revenue: 0, successCount: 0 };
      }
    });

    let revSum = 0;
    let bCount = 0;

    // Aggregate filtered bookings
    bookingsList.forEach((b) => {
      if (!b) return;
      bCount += 1;
      let catName = "Uncategorized";
      const catRef =
        b?.categoryId ||
        b?.category ||
        b?.serviceId?.categoryId ||
        b?.serviceId?.category ||
        b?.serviceCategory;

      if (catRef) {
        if (typeof catRef === "string") {
          catName = catMap[catRef] || catRef;
        } else if (typeof catRef === "object" && catRef !== null) {
          catName = catRef.category || catRef.name || catRef.title || "Uncategorized";
        }
      }

      const isObjectId = (val) =>
        typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

      if (catName === "Uncategorized" || isObjectId(catName)) {
        const sName = (
          b?.serviceId?.serviceName ||
          b?.serviceName ||
          ""
        ).toLowerCase();
        if (sName) {
          for (const name of Object.values(catMap)) {
            if (sName.includes(name.toLowerCase())) {
              catName = name;
              break;
            }
          }
        }
      }

      if (isObjectId(catName)) {
        catName = "Uncategorized";
      }

      if (!perfMap[catName]) {
        perfMap[catName] = { name: catName, totalBookings: 0, revenue: 0, successCount: 0 };
      }

      perfMap[catName].totalBookings += 1;

      const status = b?.paymentStatus?.toLowerCase();
      if (status === "success" || status === "paid") {
        perfMap[catName].successCount += 1;
        const amt = Number(b?.baseAmount) || Number(b?.amount) || 0;
        perfMap[catName].revenue += amt;
        revSum += amt;
      }
    });

    const sortedList = Object.values(perfMap).sort((a, b) => b.revenue - a.revenue);
    return {
      categoryPerformance: sortedList,
      totalRevenue: revSum,
      totalBookings: bCount,
    };
  }, [filteredBookings, categories]);

  // Actual Month-over-Month comparison calculated strictly from real dates
  const momData = useMemo(() => {
    const list = Array.isArray(serviceBookings) ? serviceBookings : [];
    const now = new Date();

    const thisMonthBookings = list.filter((b) => {
      const d = new Date(b?.createdAt || b?.scheduledAt || 0);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthBookings = list.filter((b) => {
      const d = new Date(b?.createdAt || b?.scheduledAt || 0);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === prevMonthDate.getMonth() &&
        d.getFullYear() === prevMonthDate.getFullYear()
      );
    });

    const thisMonthRev = thisMonthBookings.reduce((sum, b) => {
      const s = b?.paymentStatus?.toLowerCase();
      return s === "success" || s === "paid"
        ? sum + (Number(b?.baseAmount) || Number(b?.amount) || 0)
        : sum;
    }, 0);

    const lastMonthRev = lastMonthBookings.reduce((sum, b) => {
      const s = b?.paymentStatus?.toLowerCase();
      return s === "success" || s === "paid"
        ? sum + (Number(b?.baseAmount) || Number(b?.amount) || 0)
        : sum;
    }, 0);

    const hasComparison = lastMonthBookings.length > 0;
    const revMoM =
      hasComparison && lastMonthRev > 0
        ? Number((((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1))
        : null;
    const bookingsMoM =
      hasComparison && lastMonthBookings.length > 0
        ? Number(
            (
              ((thisMonthBookings.length - lastMonthBookings.length) /
                lastMonthBookings.length) *
              100
            ).toFixed(1)
          )
        : null;

    return {
      hasComparison,
      revMoM,
      bookingsMoM,
    };
  }, [serviceBookings]);

  // Chart configuration
  const chartConfig = useMemo(() => {
    const labels = categoryPerformance.map((c) => c.name);
    const revenues = categoryPerformance.map((c) => c.revenue);
    const bookings = categoryPerformance.map((c) => c.totalBookings);

    return {
      series: [
        { name: "Revenue (₹)", data: revenues },
        { name: "Bookings", data: bookings },
      ],
      options: {
        chart: {
          type: "bar",
          toolbar: { show: false },
          parentHeightOffset: 0,
          fontFamily: "inherit",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 400,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "36%",
            borderRadius: 6,
            borderRadiusApplication: "end",
            dataLabels: {
              position: "top",
            },
          },
        },
        dataLabels: {
          enabled: true,
          offsetY: -22,
          style: {
            fontSize: "11px",
            fontFamily: "inherit",
            fontWeight: 700,
            colors: ["#2563EB", "#059669"],
          },
          background: {
            enabled: true,
            foreColor: "#0F172A",
            borderRadius: 6,
            padding: 4,
            opacity: 0.12,
            borderWidth: 0,
          },
          formatter: function (val, opts) {
            if (!val || val === 0) return "";
            const seriesIndex = opts?.seriesIndex ?? 0;
            if (seriesIndex === 0) {
              return val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`;
            }
            return String(val);
          },
        },
        stroke: { show: true, width: 2, colors: ["transparent"] },
        legend: { show: false }, // Rendered in custom header row
        grid: {
          borderColor: isDark ? "#334155" : "#F1F5F9",
          strokeDashArray: 4,
          yaxis: { lines: { show: true } },
          xaxis: { lines: { show: false } },
          padding: {
            top: 20,
            right: 15,
            bottom: 0,
            left: 10,
          },
        },
        xaxis: {
          categories: labels,
          labels: {
            show: false, // Clean category footer rendered below
          },
          axisBorder: {
            show: true,
            color: isDark ? "#334155" : "#E2E8F0",
            height: 1.5,
          },
          axisTicks: { show: false },
        },
        yaxis: [
          {
            title: {
              text: "Revenue (₹)",
              style: {
                color: "#3B82F6",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "inherit",
              },
            },
            labels: {
              formatter: (val) => {
                if (val === undefined || val === null) return "₹0";
                if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                return `₹${Math.round(val)}`;
              },
              style: {
                colors: isDark ? "#94A3B8" : "#64748B",
                fontSize: "11px",
                fontWeight: 500,
              },
            },
          },
          {
            opposite: true,
            title: {
              text: "Bookings",
              style: {
                color: "#10B981",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "inherit",
              },
            },
            labels: {
              formatter: (val) =>
                val !== undefined && val !== null ? Math.round(val) : 0,
              style: {
                colors: isDark ? "#94A3B8" : "#64748B",
                fontSize: "11px",
                fontWeight: 500,
              },
            },
          },
        ],
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.15,
            gradientToColors: ["#60A5FA", "#34D399"],
            inverseColors: false,
            opacityFrom: 0.95,
            opacityTo: 0.85,
            stops: [0, 100],
          },
        },
        tooltip: {
          theme: isDark ? "dark" : "light",
          shared: true,
          intersect: false,
          y: {
            formatter: function (val, opts) {
              const seriesIndex = opts?.seriesIndex ?? 0;
              return seriesIndex === 0
                ? formatCurrency(val)
                : `${val || 0} bookings`;
            },
          },
        },
        colors: ["#3B82F6", "#10B981"],
      },
    };
  }, [categoryPerformance, isDark]);

  return (
    <Box
      gridColumn={gridColumn}
      bg={isDark ? "#1E293B" : "#FFFFFF"}
      borderRadius="10px"
      border="1px solid"
      borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"}
      boxShadow={
        isDark
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.4)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)"
      }
      p={{ base: 4, sm: 6, md: 7 }}
      position="relative"
      transition="all 0.25s ease"
    >
      {/* 1. HEADER ROW */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "flex-start", sm: "center" }}
        justify="space-between"
        gap={4}
      >
        <HStack spacing={3.5} align="center">
          <Flex
            w="46px"
            h="46px"
            borderRadius="6px"
            bg="linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)"
            color="white"
            align="center"
            justify="center"
            boxShadow="0 4px 12px rgba(59, 130, 246, 0.3)"
            flexShrink={0}
          >
            <Icon as={FaChartBar} boxSize="20px" />
          </Flex>
          <Box>
            <Heading
              size="md"
              fontSize={{ base: "md", md: "19px" }}
              fontWeight="800"
              color={isDark ? "#F8FAFC" : "#0F172A"}
              letterSpacing="-0.02em"
            >
              Service Category Performance
            </Heading>
            <Text
              fontSize="13px"
              color={isDark ? "#94A3B8" : "#64748B"}
              fontWeight="500"
              mt="2px"
            >
              Compare revenue and total bookings across service categories
            </Text>
          </Box>
        </HStack>

        {/* Date Selector Dropdown */}
        <Menu>
          <MenuButton
            as={Button}
            variant="outline"
            size="sm"
            h="38px"
            px={3.5}
            bg={isDark ? "#0F172A" : "#FFFFFF"}
            borderColor={isDark ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0"}
            borderRadius="6px"
            _hover={{
              bg: isDark ? "#1E293B" : "#F8FAFC",
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "#CBD5E1",
            }}
            _active={{ bg: isDark ? "#1E293B" : "#F1F5F9" }}
            rightIcon={
              <Icon
                as={FiChevronDown}
                color={isDark ? "#94A3B8" : "#64748B"}
                boxSize="14px"
              />
            }
            leftIcon={
              <Icon
                as={HiOutlineCalendar}
                color={isDark ? "#94A3B8" : "#64748B"}
                boxSize="15px"
              />
            }
            fontSize="13px"
            fontWeight="600"
            color={isDark ? "#E2E8F0" : "#1E293B"}
            alignSelf={{ base: "flex-end", sm: "center" }}
          >
            {DATE_FILTER_LABELS[dateFilter] || "This Month"}
          </MenuButton>
          <MenuList
            borderRadius="6px"
            borderColor={isDark ? "#334155" : "#E2E8F0"}
            boxShadow="lg"
            bg={isDark ? "#0F172A" : "#FFFFFF"}
            p={1.5}
            zIndex={10}
          >
            {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
              <MenuItem
                key={key}
                borderRadius="6px"
                fontSize="13px"
                fontWeight={dateFilter === key ? "700" : "500"}
                color={
                  dateFilter === key
                    ? "#3B82F6"
                    : isDark
                    ? "#E2E8F0"
                    : "#1E293B"
                }
                bg={
                  dateFilter === key
                    ? isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "#EFF6FF"
                    : "transparent"
                }
                _hover={{
                  bg: isDark ? "rgba(255, 255, 255, 0.06)" : "#F8FAFC",
                }}
                onClick={() => setDateFilter(key)}
              >
                {label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      {/* 2. SUMMARY CARDS + LEGEND ROW */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        align={{ base: "stretch", lg: "center" }}
        justify="space-between"
        gap={4}
        mt={6}
        mb={4}
      >
        <HStack spacing={4} flexWrap="wrap" flex={1}>
          {/* Revenue Summary Card */}
          <Flex
            align="center"
            bg={isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF"}
            border="1px solid"
            borderColor={isDark ? "rgba(59, 130, 246, 0.25)" : "#DBEAFE"}
            borderRadius="6px"
            px={4}
            py={3}
            minW={{ base: "100%", sm: "240px" }}
            gap={3.5}
            flex={{ base: "1", sm: "0 1 auto" }}
          >
            <Flex
              w="40px"
              h="40px"
              borderRadius="full"
              bg="#3B82F6"
              color="white"
              align="center"
              justify="center"
              flexShrink={0}
              boxShadow="0 2px 8px rgba(59, 130, 246, 0.25)"
            >
              <Icon as={FaRupeeSign} boxSize="17px" />
            </Flex>
            <Box flex={1}>
              <Text
                fontSize="12px"
                fontWeight="600"
                color={isDark ? "#94A3B8" : "#64748B"}
              >
                Total Revenue
              </Text>
              <Heading
                size="md"
                fontSize="22px"
                fontWeight="800"
                color={isDark ? "#F8FAFC" : "#0F172A"}
                lineHeight="1.15"
                mt="2px"
              >
                {formatCurrency(totalRevenue)}
              </Heading>
            </Box>
            {momData.hasComparison && momData.revMoM !== null && (
              <VStack spacing={0} align="flex-end" ml={1}>
                <HStack
                  spacing={1}
                  color={momData.revMoM >= 0 ? "#10B981" : "#EF4444"}
                >
                  <Icon
                    as={momData.revMoM >= 0 ? FiTrendingUp : FiTrendingDown}
                    boxSize="13px"
                  />
                  <Text fontSize="12px" fontWeight="700">
                    {momData.revMoM >= 0
                      ? `+${momData.revMoM}%`
                      : `${momData.revMoM}%`}
                  </Text>
                </HStack>
                <Text
                  fontSize="10px"
                  color={isDark ? "#64748B" : "#94A3B8"}
                  fontWeight="500"
                >
                  vs last month
                </Text>
              </VStack>
            )}
          </Flex>

          {/* Bookings Summary Card */}
          <Flex
            align="center"
            bg={isDark ? "rgba(16, 185, 129, 0.1)" : "#ECFDF5"}
            border="1px solid"
            borderColor={isDark ? "rgba(16, 185, 129, 0.25)" : "#D1FAE5"}
            borderRadius="6px"
            px={4}
            py={3}
            minW={{ base: "100%", sm: "240px" }}
            gap={3.5}
            flex={{ base: "1", sm: "0 1 auto" }}
          >
            <Flex
              w="40px"
              h="40px"
              borderRadius="full"
              bg="#10B981"
              color="white"
              align="center"
              justify="center"
              flexShrink={0}
              boxShadow="0 2px 8px rgba(16, 185, 129, 0.25)"
            >
              <Icon as={FaCalendarAlt} boxSize="16px" />
            </Flex>
            <Box flex={1}>
              <Text
                fontSize="12px"
                fontWeight="600"
                color={isDark ? "#94A3B8" : "#64748B"}
              >
                Total Bookings
              </Text>
              <Heading
                size="md"
                fontSize="22px"
                fontWeight="800"
                color={isDark ? "#F8FAFC" : "#0F172A"}
                lineHeight="1.15"
                mt="2px"
              >
                {totalBookings.toLocaleString("en-IN")}
              </Heading>
            </Box>
            {momData.hasComparison && momData.bookingsMoM !== null && (
              <VStack spacing={0} align="flex-end" ml={1}>
                <HStack
                  spacing={1}
                  color={momData.bookingsMoM >= 0 ? "#10B981" : "#EF4444"}
                >
                  <Icon
                    as={momData.bookingsMoM >= 0 ? FiTrendingUp : FiTrendingDown}
                    boxSize="13px"
                  />
                  <Text fontSize="12px" fontWeight="700">
                    {momData.bookingsMoM >= 0
                      ? `+${momData.bookingsMoM}%`
                      : `${momData.bookingsMoM}%`}
                  </Text>
                </HStack>
                <Text
                  fontSize="10px"
                  color={isDark ? "#64748B" : "#94A3B8"}
                  fontWeight="500"
                >
                  vs last month
                </Text>
              </VStack>
            )}
          </Flex>
        </HStack>

        {/* Legend (on the right on desktop, or stacked on mobile) */}
        <HStack spacing={5} alignSelf={{ base: "flex-end", lg: "center" }}>
          <HStack spacing={2}>
            <Box w="12px" h="12px" borderRadius="full" bg="#3B82F6" />
            <Text
              fontSize="13px"
              fontWeight="700"
              color={isDark ? "#E2E8F0" : "#1E293B"}
            >
              Revenue (₹)
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="12px" h="12px" borderRadius="full" bg="#10B981" />
            <Text
              fontSize="13px"
              fontWeight="700"
              color={isDark ? "#E2E8F0" : "#1E293B"}
            >
              Bookings
            </Text>
          </HStack>
        </HStack>
      </Flex>

      {/* 3. CHART CANVAS & CATEGORY ICONS FOOTER */}
      {loading ? (
        <Flex h="360px" align="center" justify="center" direction="column">
          <Spinner size="xl" color="blue.500" thickness="3px" mb={3} />
          <Text fontSize="sm" color="gray.500">
            Updating category analytics...
          </Text>
        </Flex>
      ) : categoryPerformance.length > 0 ? (
        <Box position="relative">
          <Box h="320px">
            <ReactApexChart
              options={chartConfig.options}
              series={chartConfig.series}
              type="bar"
              height="100%"
            />
          </Box>

          {/* Synchronized Category Icon & Label Footer */}
          <Box
            mt={1}
            pt={3}
            borderTop="1.5px solid"
            borderColor={isDark ? "#334155" : "#F1F5F9"}
            ml={{ base: "45px", md: "60px" }}
            mr={{ base: "35px", md: "50px" }}
          >
            <SimpleGrid
              columns={categoryPerformance.length || 1}
              spacing={2}
              alignItems="flex-start"
            >
              {categoryPerformance.map((cat, idx) => {
                const meta = getCategoryIconMeta(cat.name);
                return (
                  <Flex
                    key={idx}
                    direction="column"
                    align="center"
                    textAlign="center"
                    px={1}
                  >
                    <Flex
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      bg={meta.bg}
                      color={meta.color}
                      align="center"
                      justify="center"
                      mb={2}
                      boxShadow="0 2px 6px rgba(0,0,0,0.06)"
                      transition="transform 0.2s"
                      _hover={{ transform: "scale(1.12)" }}
                    >
                      <Icon as={meta.icon} boxSize="17px" />
                    </Flex>
                    <Text
                      fontSize={{ base: "11px", md: "12px" }}
                      fontWeight="700"
                      color={isDark ? "#E2E8F0" : "#1E293B"}
                      lineHeight="1.3"
                      maxW="110px"
                      noOfLines={2}
                    >
                      {cat.name}
                    </Text>
                  </Flex>
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>
      ) : (
        <Flex
          h="300px"
          align="center"
          justify="center"
          direction="column"
          color="gray.400"
        >
          <Icon as={FaExclamationCircle} boxSize={8} mb={2} />
          <Text fontWeight="600">No Analytics Data Available</Text>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Try selecting a different date range above.
          </Text>
        </Flex>
      )}
    </Box>
  );
}
