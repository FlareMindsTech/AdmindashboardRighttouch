import React from "react";
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

export default function KpiTile({
  label,
  value,
  icon,
  subValue,
  trend,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const hasTrend = typeof trend === "number" && Number.isFinite(trend);
  const isPositive = hasTrend && trend >= 0;

  return (
    <Box
      borderRadius="14px"
      bg={
        isDark
          ? "linear-gradient(145deg, #1A2234 0%, #111C44 100%)"
          : "#FFFFFF"
      }
      border="1px solid"
      borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"}
      boxShadow={
        isDark
          ? "0 2px 8px rgba(0, 0, 0, 0.25)"
          : "0 1px 3px rgba(15, 23, 42, 0.04)"
      }
      p={{ base: 4, md: 4.5 }}
      minH="122px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      transition="all 0.2s ease"
      _hover={{
        borderColor: isDark ? "teal.400" : "#008080",
        transform: "translateY(-2px)",
        boxShadow: isDark
          ? "0 8px 20px rgba(0, 0, 0, 0.4)"
          : "0 8px 20px rgba(0, 128, 128, 0.08)",
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box minW={0} flex={1}>
          <Text
            fontSize="12px"
            fontWeight="600"
            color={isDark ? "gray.400" : "gray.500"}
            noOfLines={1}
          >
            {label}
          </Text>
          <Heading
            as="div"
            fontSize={{ base: "xl", md: "24px" }}
            fontWeight="700"
            color={isDark ? "gray.50" : "gray.900"}
            mt={1}
            lineHeight="1.2"
            letterSpacing="-0.02em"
            noOfLines={1}
          >
            {value}
          </Heading>
        </Box>

        <Flex
          w="40px"
          h="40px"
          align="center"
          justify="center"
          borderRadius="10px"
          bg={isDark ? "rgba(0, 128, 128, 0.16)" : "rgba(0, 128, 128, 0.08)"}
          color={isDark ? "teal.300" : "#008080"}
          flexShrink={0}
        >
          <Icon as={icon} boxSize="18px" />
        </Flex>
      </Flex>

      <Flex
        mt={3}
        pt={2}
        align="center"
        justify="space-between"
        gap={2}
        borderTop="1px solid"
        borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
      >
        <Text
          fontSize="xs"
          fontWeight="500"
          color={isDark ? "gray.400" : "gray.500"}
          noOfLines={1}
        >
          {subValue}
        </Text>
        {hasTrend && (
          <HStack
            spacing={1}
            px={2}
            py={0.5}
            borderRadius="md"
            flexShrink={0}
            bg={
              isPositive
                ? isDark
                  ? "rgba(16, 185, 129, 0.15)"
                  : "#ECFDF5"
                : isDark
                ? "rgba(239, 68, 68, 0.15)"
                : "#FEF2F2"
            }
            color={
              isPositive
                ? isDark
                  ? "#34D399"
                  : "#059669"
                : isDark
                ? "#F87171"
                : "#DC2626"
            }
            title="vs last month"
          >
            <Icon as={isPositive ? FaArrowUp : FaArrowDown} boxSize="8px" />
            <Text fontSize="2xs" fontWeight="700">
              {Math.abs(trend).toFixed(1)}%
            </Text>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}


