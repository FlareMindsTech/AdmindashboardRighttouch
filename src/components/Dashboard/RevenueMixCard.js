import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { FaChartPie } from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import SectionCard from "components/common/SectionCard";
import {
  formatCompactCurrency,
  formatCurrency,
} from "components/Dashboard/dashboardUtils";

const SERVICE_COLOR = "#008080";
const PRODUCT_COLOR = "#2563EB";

function MixRow({ label, amount, percent, color, isDark }) {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={1.5}>
        <HStack spacing={2}>
          <Box w="8px" h="8px" borderRadius="full" bg={color} />
          <Text
            fontSize="xs"
            fontWeight="700"
            color={isDark ? "gray.300" : "gray.600"}
          >
            {label}
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Text
            fontSize="xs"
            fontWeight="800"
            color={isDark ? "gray.100" : "gray.800"}
          >
            {formatCurrency(amount)}
          </Text>
          <Text fontSize="2xs" color={isDark ? "gray.500" : "gray.400"}>
            {percent.toFixed(1)}%
          </Text>
        </HStack>
      </Flex>
      <Box
        h="6px"
        borderRadius="full"
        overflow="hidden"
        bg={isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(148, 163, 184, 0.2)"}
      >
        <Box
          h="100%"
          w={`${Math.min(percent, 100)}%`}
          borderRadius="full"
          bg={color}
        />
      </Box>
    </Box>
  );
}

export default function RevenueMixCard({
  serviceRevenue = 0,
  productRevenue = 0,
  gridColumn,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const total = Number(serviceRevenue) + Number(productRevenue);
  const servicePercent = total > 0 ? (serviceRevenue / total) * 100 : 0;
  const productPercent = total > 0 ? (productRevenue / total) * 100 : 0;

  const options = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 450,
        },
      },
      labels: ["Services", "Products"],
      colors: [SERVICE_COLOR, PRODUCT_COLOR],
      stroke: {
        width: 3,
        colors: [isDark ? "#1D2635" : "#FFFFFF"],
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "77%",
            labels: { show: false },
          },
        },
      },
      states: {
        hover: { filter: { type: "lighten", value: 0.05 } },
        active: { filter: { type: "none" } },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: { formatter: (value) => formatCurrency(value) },
      },
    }),
    [isDark]
  );

  return (
    <SectionCard gridColumn={gridColumn} bodyProps={{ p: 0 }}>
      <Flex
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={1}
        align="center"
        gap={3}
      >
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
          <Icon as={FaChartPie} boxSize="17px" />
        </Flex>
        <Box>
          <Heading
            size="sm"
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="800"
            color={isDark ? "gray.50" : "gray.800"}
            letterSpacing="-0.02em"
          >
            Revenue Mix
          </Heading>
          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
            Contribution by business line
          </Text>
        </Box>
        <Box
          ml="auto"
          px={2.5}
          py={1}
          borderRadius="full"
          bg={isDark ? "rgba(255,255,255,0.05)" : "gray.100"}
          flexShrink={0}
        >
          <Text
            fontSize="2xs"
            fontWeight="800"
            color={isDark ? "gray.300" : "gray.600"}
          >
            All time
          </Text>
        </Box>
      </Flex>

      <Box position="relative" h="210px" mt={2}>
        {total > 0 ? (
          <>
            <ReactApexChart
              options={options}
              series={[Number(serviceRevenue) || 0, Number(productRevenue) || 0]}
              type="donut"
              height={210}
            />
            <Flex
              position="absolute"
              inset={0}
              align="center"
              justify="center"
              direction="column"
              pointerEvents="none"
            >
              <Text
                fontSize="2xs"
                fontWeight="700"
                letterSpacing="0.06em"
                textTransform="uppercase"
                color={isDark ? "gray.500" : "gray.400"}
              >
                Total Revenue
              </Text>
              <Text
                fontSize="lg"
                fontWeight="800"
                color={isDark ? "gray.50" : "gray.800"}
                lineHeight="1.2"
              >
                {formatCompactCurrency(total)}
              </Text>
            </Flex>
          </>
        ) : (
          <Flex h="210px" align="center" justify="center" direction="column" gap={2}>
            <Icon
              as={FaChartPie}
              boxSize={7}
              color={isDark ? "gray.600" : "gray.300"}
            />
            <Text fontSize="sm" color="gray.500">
              No revenue to split yet
            </Text>
          </Flex>
        )}
      </Box>

      <VStack
        spacing={3}
        align="stretch"
        px={{ base: 4, md: 5 }}
        pb={{ base: 4, md: 5 }}
        pt={2}
      >
        <MixRow
          label="Services"
          amount={serviceRevenue}
          percent={servicePercent}
          color={SERVICE_COLOR}
          isDark={isDark}
        />
        <MixRow
          label="Products"
          amount={productRevenue}
          percent={productPercent}
          color={PRODUCT_COLOR}
          isDark={isDark}
        />
      </VStack>
    </SectionCard>
  );
}
