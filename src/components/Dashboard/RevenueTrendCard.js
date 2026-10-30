import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import ReactApexChart from "react-apexcharts";
import SectionCard from "components/common/SectionCard";
import {
  formatCompactCurrency,
  formatCurrency,
  percentChange,
} from "components/Dashboard/dashboardUtils";

const SERVICE_COLOR = "#008080";
const PRODUCT_COLOR = "#2563EB";

function LegendItem({ color, label, isDark, last }) {
  return (
    <HStack spacing={2} mr={last ? 0 : 4}>
      <Box w="9px" h="9px" borderRadius="full" bg={color} />
      <Text
        fontSize="xs"
        fontWeight="700"
        color={isDark ? "gray.300" : "gray.600"}
      >
        {label}
      </Text>
    </HStack>
  );
}

export default function RevenueTrendCard({
  months = [],
  gridColumn,
  serviceLabel = "Services",
  productLabel = "Products",
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bookingsColor = isDark ? "#94A3B8" : "#64748B";

  const labels = months.map((month) => month.label);
  const serviceSeries = months.map((month) => month.serviceRevenue);
  const productSeries = months.map((month) => month.productRevenue);
  const bookingSeries = months.map((month) => month.totalBookings);
  const totalBookings = bookingSeries.reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );
  const currentMonth = months[months.length - 1] || {};
  const previousMonth = months[months.length - 2] || {};
  const revenueGrowth = percentChange(
    currentMonth.totalRevenue,
    previousMonth.totalRevenue
  );
  const hasData = months.some(
    (month) =>
      Number(month.totalRevenue) > 0 || Number(month.totalBookings) > 0
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        parentHeightOffset: 0,
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
      },
      colors: [SERVICE_COLOR, PRODUCT_COLOR, bookingsColor],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: [2.5, 2.5, 0],
        lineCap: "round",
      },
      fill: {
        type: ["gradient", "gradient", "solid"],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.32,
          opacityTo: 0.02,
          stops: [0, 95, 100],
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "30%",
          borderRadius: 4,
          borderRadiusApplication: "end",
        },
      },
      markers: {
        size: 0,
        strokeWidth: 2,
        hover: { size: 4 },
      },
      grid: {
        borderColor: isDark
          ? "rgba(148, 163, 184, 0.14)"
          : "rgba(148, 163, 184, 0.24)",
        strokeDashArray: 4,
        padding: { top: 4, right: 12, bottom: 0, left: 8 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: isDark ? "#94A3B8" : "#64748B",
            fontSize: "11px",
            fontWeight: 600,
          },
        },
      },
      yaxis: [
        {
          seriesName: "Service Revenue",
          tickAmount: 4,
          labels: {
            formatter: (value) => formatCompactCurrency(value),
            style: {
              colors: isDark ? "#94A3B8" : "#64748B",
              fontSize: "11px",
              fontWeight: 600,
            },
          },
        },
        {
          seriesName: "Product Revenue",
          show: false,
        },
        {
          seriesName: "Bookings",
          opposite: true,
          labels: {
            formatter: (value) => Math.round(value || 0),
            style: {
              colors: isDark ? "#94A3B8" : "#64748B",
              fontSize: "11px",
              fontWeight: 600,
            },
          },
        },
      ],
      legend: { show: false },
      tooltip: {
        theme: isDark ? "dark" : "light",
        shared: true,
        intersect: false,
        y: {
          formatter: (value, context) =>
            context?.seriesIndex === 2
              ? `${value || 0} bookings`
              : formatCurrency(value),
        },
      },
    }),
    [bookingsColor, isDark, labels]
  );

  const series = [
    { name: serviceLabel, type: "area", data: serviceSeries },
    { name: productLabel, type: "area", data: productSeries },
    { name: "Bookings", type: "column", data: bookingSeries },
  ];

  return (
    <SectionCard gridColumn={gridColumn} bodyProps={{ p: 0 }}>
      <Flex
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={3}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={3}
      >
        <HStack spacing={3}>
          <Flex
            w="38px"
            h="38px"
            align="center"
            justify="center"
            borderRadius="10px"
            bg={isDark ? "rgba(0, 128, 128, 0.16)" : "rgba(0, 128, 128, 0.08)"}
            color={isDark ? "teal.300" : "#008080"}
            flexShrink={0}
          >
            <Icon as={FiActivity} boxSize="17px" />
          </Flex>
          <Box>
            <Heading
              size="sm"
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="800"
              color={isDark ? "gray.50" : "gray.800"}
              letterSpacing="-0.02em"
            >
              Revenue & Bookings
            </Heading>
            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
              Performance across the last six months
            </Text>
          </Box>
        </HStack>

        <HStack spacing={4}>
          <Box textAlign="right">
            <Text
              fontSize="2xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.06em"
              color={isDark ? "gray.500" : "gray.400"}
            >
              This month
            </Text>
            <Text
              fontSize="sm"
              fontWeight="800"
              color={isDark ? "gray.100" : "gray.800"}
            >
              {formatCompactCurrency(currentMonth.totalRevenue || 0)}
            </Text>
          </Box>
          {revenueGrowth !== null && (
            <HStack
              spacing={1}
              px={2}
              py={1}
              borderRadius="full"
              bg={
                revenueGrowth >= 0
                  ? isDark
                    ? "rgba(16, 185, 129, 0.16)"
                    : "#DCFCE7"
                  : isDark
                  ? "rgba(239, 68, 68, 0.16)"
                  : "#FEE2E2"
              }
              color={
                revenueGrowth >= 0
                  ? isDark
                    ? "#6EE7B7"
                    : "#047857"
                  : isDark
                  ? "#FCA5A5"
                  : "#B91C1C"
              }
            >
              <Icon
                as={revenueGrowth >= 0 ? FaArrowUp : FaArrowDown}
                boxSize="9px"
              />
              <Text fontSize="2xs" fontWeight="800">
                {Math.abs(revenueGrowth).toFixed(1)}%
              </Text>
            </HStack>
          )}
        </HStack>
      </Flex>

      <Flex
        px={{ base: 4, md: 5 }}
        pb={3}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={2}
      >
        <HStack spacing={0} wrap="wrap" rowGap={2}>
          <LegendItem
            color={SERVICE_COLOR}
            label="Service revenue"
            isDark={isDark}
          />
          <LegendItem
            color={PRODUCT_COLOR}
            label="Product revenue"
            isDark={isDark}
          />
          <LegendItem
            color={bookingsColor}
            label="Bookings"
            isDark={isDark}
            last
          />
        </HStack>
        <Text
          fontSize="2xs"
          fontWeight="700"
          color={isDark ? "gray.500" : "gray.400"}
        >
          {totalBookings.toLocaleString("en-IN")} total bookings
        </Text>
      </Flex>

      {hasData ? (
        <Box px={{ base: 1, md: 2 }} pb={3}>
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={300}
          />
        </Box>
      ) : (
        <Flex
          h="300px"
          align="center"
          justify="center"
          direction="column"
          gap={2}
        >
          <Icon
            as={FiActivity}
            boxSize={8}
            color={isDark ? "gray.600" : "gray.300"}
          />
          <Text fontSize="sm" color="gray.500">
            No activity recorded in this period
          </Text>
        </Flex>
      )}
    </SectionCard>
  );
}
