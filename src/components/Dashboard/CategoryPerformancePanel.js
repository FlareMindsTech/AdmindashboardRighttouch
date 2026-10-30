import React from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import SectionCard from "components/common/SectionCard";
import EmptyState from "components/common/EmptyState";
import {
  formatCompactCurrency,
  formatCurrency,
} from "components/Dashboard/dashboardUtils";

const PALETTES = {
  service: {
    accent: "#008080",
    light: "#14B8A6",
    softLight: "#E6F2F2",
    softDark: "rgba(0, 128, 128, 0.16)",
    accentTextLight: "#006666",
    accentTextDark: "#5EEAD4",
  },
  product: {
    accent: "#2563EB",
    light: "#3B82F6",
    softLight: "#EFF6FF",
    softDark: "rgba(37, 99, 235, 0.16)",
    accentTextLight: "#1D4ED8",
    accentTextDark: "#93C5FD",
  },
};

function MiniMetric({ label, value, isDark, color }) {
  return (
    <Box
      p={2.5}
      borderRadius="10px"
      bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.025)"}
      border="1px solid"
      borderColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
      minW={0}
    >
      <Text
        fontSize="2xs"
        fontWeight="700"
        color={isDark ? "gray.500" : "gray.400"}
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="800"
        color={color || (isDark ? "gray.100" : "gray.800")}
        mt={0.5}
        noOfLines={1}
      >
        {value}
      </Text>
    </Box>
  );
}

export default function CategoryPerformancePanel({
  kind = "service",
  title,
  subtitle,
  icon,
  analytics,
  totalRevenue = 0,
  revenue: revenueOverride,
  catalog,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const palette = PALETTES[kind] || PALETTES.service;
  const accentText = isDark
    ? palette.accentTextDark
    : palette.accentTextLight;

  const derivedRevenue = Number(analytics?.revenue) || 0;
  const revenue =
    Number(revenueOverride) > 0 ? Number(revenueOverride) : derivedRevenue;
  const totalBookings = Number(analytics?.totalBookings) || 0;
  const successPayments = Number(analytics?.successPayments) || 0;
  const categories = Array.isArray(analytics?.categoryPerformance)
    ? analytics.categoryPerformance
    : [];

  const share = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
  const successRate =
    totalBookings > 0 ? (successPayments / totalBookings) * 100 : 0;
  const orderBase = successPayments > 0 ? successPayments : totalBookings;
  const averageOrder = orderBase > 0 ? revenue / orderBase : 0;
  const hasRevenue = categories.some(
    (category) => Number(category.revenue) > 0
  );
  const ranking = hasRevenue
    ? categories
    : [...categories].sort(
        (a, b) => Number(b.totalBookings) - Number(a.totalBookings)
      );
  const maxMetric = hasRevenue
    ? Number(ranking[0]?.revenue) || 1
    : Number(ranking[0]?.totalBookings) || 1;
  const topCategories = ranking.slice(0, 5);

  const textColor = isDark ? "gray.100" : "gray.800";
  const subTextColor = isDark ? "gray.400" : "gray.500";
  const trackColor = isDark
    ? "rgba(148, 163, 184, 0.16)"
    : "rgba(148, 163, 184, 0.2)";

  return (
    <SectionCard bodyProps={{ p: 0 }}>
      <Flex
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={4}
        justify="space-between"
        align="flex-start"
        gap={3}
        borderBottom="1px solid"
        borderColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
      >
        <HStack spacing={3} align="flex-start">
          <Flex
            w="38px"
            h="38px"
            align="center"
            justify="center"
            borderRadius="10px"
            bg={isDark ? palette.softDark : palette.softLight}
            color={accentText}
            flexShrink={0}
          >
            <Icon as={icon} boxSize="17px" />
          </Flex>
          <Box>
            <Heading
              size="sm"
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="800"
              color={textColor}
              letterSpacing="-0.02em"
            >
              {title}
            </Heading>
            <Text fontSize="xs" color={subTextColor} mt={0.5}>
              {subtitle}
            </Text>
          </Box>
        </HStack>

        <Box
          px={2.5}
          py={1}
          borderRadius="full"
          bg={isDark ? palette.softDark : palette.softLight}
          flexShrink={0}
        >
          <Text fontSize="2xs" fontWeight="800" color={accentText}>
            {share.toFixed(1)}% share
          </Text>
        </Box>
      </Flex>

      <Box px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={5}>
          <Box
            p={3}
            borderRadius="10px"
            bg={isDark ? palette.softDark : palette.softLight}
          >
            <Text
              fontSize="2xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.06em"
              color={accentText}
            >
              Total Revenue
            </Text>
            <Heading
              as="div"
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="800"
              color={textColor}
              mt={0.5}
              noOfLines={1}
            >
              {formatCurrency(revenue)}
            </Heading>
            <Text fontSize="2xs" color={subTextColor} mt={0.5}>
              {formatCompactCurrency(revenue)} collected
            </Text>
          </Box>
          <Box
            p={3}
            borderRadius="10px"
            bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.025)"}
            border="1px solid"
            borderColor={
              isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"
            }
          >
            <Text
              fontSize="2xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.06em"
              color={subTextColor}
            >
              Total Bookings
            </Text>
            <Heading
              as="div"
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="800"
              color={textColor}
              mt={0.5}
              noOfLines={1}
            >
              {totalBookings.toLocaleString("en-IN")}
            </Heading>
            <Text fontSize="2xs" color={subTextColor} mt={0.5}>
              {successPayments.toLocaleString("en-IN")} successful payments
            </Text>
          </Box>
        </SimpleGrid>

        <Flex justify="space-between" align="center" mb={3}>
          <Text
            fontSize="2xs"
            fontWeight="800"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={subTextColor}
          >
            Top Categories
          </Text>
          <Text
            fontSize="2xs"
            fontWeight="800"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={subTextColor}
          >
            {hasRevenue ? "Revenue" : "Bookings"}
          </Text>
        </Flex>

        {topCategories.length > 0 ? (
          <VStack spacing={3.5} align="stretch">
            {topCategories.map((category, index) => {
              const metric = hasRevenue
                ? Number(category.revenue) || 0
                : Number(category.totalBookings) || 0;
              const percent =
                maxMetric > 0 ? (metric / maxMetric) * 100 : 0;
              return (
                <Box key={`${category.name}-${index}`}>
                  <Flex justify="space-between" align="center" gap={2} mb={1.5}>
                    <HStack spacing={2} minW={0}>
                      <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg={palette.accent}
                        flexShrink={0}
                      />
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color={textColor}
                        noOfLines={1}
                      >
                        {category.name}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="xs"
                      fontWeight="800"
                      color={textColor}
                      flexShrink={0}
                    >
                      {hasRevenue
                        ? formatCurrency(category.revenue)
                        : category.totalBookings.toLocaleString("en-IN")}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={3}>
                    <Box
                      flex={1}
                      h="6px"
                      borderRadius="full"
                      bg={trackColor}
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={`${Math.min(percent, 100)}%`}
                        borderRadius="full"
                        bg={`linear-gradient(90deg, ${palette.accent} 0%, ${palette.light} 100%)`}
                      />
                    </Box>
                    <Text
                      fontSize="2xs"
                      fontWeight="600"
                      color={subTextColor}
                      minW="64px"
                      textAlign="right"
                    >
                      {hasRevenue
                        ? `${category.totalBookings} bookings`
                        : `${category.successCount} paid`}
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        ) : (
          <EmptyState variant="text" message="No category data yet" />
        )}

        <SimpleGrid columns={3} spacing={2.5} mt={5}>
          <MiniMetric
            label="Success"
            value={`${successRate.toFixed(1)}%`}
            isDark={isDark}
          />
          <MiniMetric
            label="Avg. order"
            value={formatCompactCurrency(averageOrder)}
            isDark={isDark}
          />
          <MiniMetric
            label={kind === "product" ? "Active" : "Categories"}
            value={
              kind === "product" && catalog
                ? `${catalog.active}/${catalog.total}`
                : categories.length
            }
            isDark={isDark}
            color={accentText}
          />
        </SimpleGrid>
      </Box>
    </SectionCard>
  );
}
