import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
  Badge,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { FaInfoCircle, FaMinusCircle, FaEquals, FaCoins } from "react-icons/fa";

/**
 * Format paise or rupees into INR string.
 * Prefers integer paise if provided (divided by 100).
 */
export const formatInr = (amountPaise, fallbackRupees = 0) => {
  if (amountPaise != null && !isNaN(Number(amountPaise))) {
    const val = Number(amountPaise) / 100;
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  const num = Number(fallbackRupees || 0);
  if (isNaN(num)) return "₹0.00";
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function FinancialBreakdown({
  financials = {},
  variant = "detailed", // "detailed" | "compact" | "card"
  isDark = false,
}) {
  const {
    requestedAmount,
    requestedAmountPaise,
    commissionDeduction,
    commissionDeductionPaise,
    penaltyDeduction,
    penaltyDeductionPaise,
    penaltyReason,
    otherDeductions,
    otherDeductionsPaise,
    netPayoutAmount,
    netPayoutAmountPaise,
  } = financials;

  const grossStr = formatInr(requestedAmountPaise, requestedAmount);
  const commStr = formatInr(commissionDeductionPaise, commissionDeduction);
  const penaltyStr = formatInr(penaltyDeductionPaise, penaltyDeduction);
  const otherStr = formatInr(otherDeductionsPaise, otherDeductions);
  const netStr = formatInr(netPayoutAmountPaise, netPayoutAmount);

  const hasCommission = Number(commissionDeductionPaise || commissionDeduction || 0) > 0;
  const hasPenalty = Number(penaltyDeductionPaise || penaltyDeduction || 0) > 0;
  const hasOther = Number(otherDeductionsPaise || otherDeductions || 0) > 0;

  if (variant === "compact") {
    return (
      <HStack spacing={2} fontSize="xs" flexWrap="wrap">
        <Text fontWeight="600" color={isDark ? "gray.200" : "gray.800"}>
          Gross: {grossStr}
        </Text>
        {(hasCommission || hasPenalty) && (
          <Text color="gray.500" fontSize="2xs">
            (Deductions: -{formatInr((commissionDeductionPaise || 0) + (penaltyDeductionPaise || 0))})
          </Text>
        )}
        <Badge colorScheme="teal" variant="subtle" fontSize="xs" fontWeight="700">
          Net: {netStr}
        </Badge>
      </HStack>
    );
  }

  return (
    <Box
      p={4}
      borderRadius="16px"
      bg={isDark ? "gray.800" : "white"}
      border="1px solid"
      borderColor={isDark ? "gray.700" : "gray.200"}
      boxShadow="sm"
    >
      <VStack spacing={2.5} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack spacing={1.5}>
            <Icon as={FaCoins} color="teal.500" boxSize={3.5} />
            <Text fontSize="xs" fontWeight="600" color={isDark ? "gray.300" : "gray.700"}>
              Gross Withdrawal Amount
            </Text>
          </HStack>
          <Text fontSize="xs" fontWeight="700" color={isDark ? "gray.100" : "gray.900"}>
            {grossStr}
          </Text>
        </HStack>

        {hasCommission && (
          <HStack justify="space-between" align="center">
            <HStack spacing={1.5}>
              <Icon as={FaMinusCircle} color="red.400" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                Commission Deduction
              </Text>
            </HStack>
            <Text fontSize="xs" fontWeight="600" color="red.500">
              -{commStr}
            </Text>
          </HStack>
        )}

        {hasPenalty && (
          <HStack justify="space-between" align="center">
            <HStack spacing={1.5}>
              <Icon as={FaMinusCircle} color="red.400" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                Penalty Deduction
              </Text>
              {penaltyReason && (
                <Tooltip label={penaltyReason} placement="top" hasArrow>
                  <Box as="span" cursor="help">
                    <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
                  </Box>
                </Tooltip>
              )}
            </HStack>
            <Text fontSize="xs" fontWeight="600" color="red.500">
              -{penaltyStr}
            </Text>
          </HStack>
        )}

        {hasOther && (
          <HStack justify="space-between" align="center">
            <HStack spacing={1.5}>
              <Icon as={FaMinusCircle} color="red.400" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                Other Deductions
              </Text>
            </HStack>
            <Text fontSize="xs" fontWeight="600" color="red.500">
              -{otherStr}
            </Text>
          </HStack>
        )}

        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

        <HStack
          justify="space-between"
          align="center"
          p={3}
          borderRadius="12px"
          bg={isDark ? "teal.900" : "teal.50"}
          border="1px solid"
          borderColor={isDark ? "teal.700" : "teal.200"}
        >
          <HStack spacing={2}>
            <Icon as={FaEquals} color="teal.500" boxSize={3.5} />
            <Text fontSize="xs" fontWeight="800" color={isDark ? "teal.200" : "teal.900"} textTransform="uppercase" letterSpacing="0.04em">
              Net Bank Transfer Payable
            </Text>
          </HStack>
          <Badge
            colorScheme="teal"
            variant="solid"
            bg="teal.600"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="8px"
            fontWeight="900"
            boxShadow="0 2px 6px rgba(0, 128, 128, 0.25)"
          >
            {netStr}
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
}
