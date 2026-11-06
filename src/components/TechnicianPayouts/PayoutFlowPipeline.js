import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaChevronRight,
  FaShieldAlt,
  FaBan,
  FaUndoAlt,
} from "react-icons/fa";

/**
 * PayoutFlowPipeline
 * Visual interactive lifecycle pipeline tracking the 4-stage manual payout process:
 * 1. Requested -> 2. Dual-Approval (if > ₹10k) -> 3. Approved / Bank Run -> 4. Disbursed / Paid
 * Along with exception branches (Rejected / Reverted).
 */
export default function PayoutFlowPipeline({
  activeStage = "all",
  onSelectStage,
  counts = {},
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const stages = [
    {
      id: "requested",
      stepNumber: 1,
      title: "Requested",
      subtitle: "Balance reserved in escrow",
      actionText: "Awaiting Admin Transfer",
      icon: FaFileInvoiceDollar,
      count: (counts.requested || 0) + (counts.pending || 0),
      accentColor: "#D97706",
      bgGlow: "rgba(217, 119, 6, 0.12)",
      borderColor: "yellow.400",
    },
    {
      id: "approved",
      stepNumber: 2,
      title: "Ready to Disburse",
      subtitle: "Offline Bank / UPI transfer",
      actionText: "Execute Transfer & Record UTR",
      icon: FaMoneyCheckAlt,
      count: counts.approved ?? 0,
      accentColor: "#008080",
      bgGlow: "rgba(0, 128, 128, 0.12)",
      borderColor: "teal.400",
    },
    {
      id: "paid",
      stepNumber: 3,
      title: "Settled & Paid",
      subtitle: "UTR recorded & ledger debited",
      actionText: "Receipt Generated (Owner Reversible)",
      icon: FaCheckCircle,
      count: counts.paid ?? 0,
      accentColor: "#10B981",
      bgGlow: "rgba(16, 185, 129, 0.12)",
      borderColor: "green.400",
    },
  ];

  return (
    <Box
      p={{ base: 3, md: 4 }}
      borderRadius="16px"
      bg={isDark ? "gray.850" : "white"}
      border="1px solid"
      borderColor={isDark ? "gray.700" : "gray.200"}
      boxShadow={isDark ? "none" : "0 2px 12px rgba(0,0,0,0.03)"}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={3}
        gap={2}
      >
        <HStack spacing={2} align="center">
          <Flex
            w="26px"
            h="26px"
            borderRadius="8px"
            bg={isDark ? "teal.900" : "teal.50"}
            color="teal.500"
            align="center"
            justify="center"
          >
            <Icon as={FaShieldAlt} boxSize={3.5} />
          </Flex>
          <Box>
            <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.05em" color={isDark ? "gray.200" : "gray.700"}>
              Manual Payout Lifecycle Pipeline
            </Text>
            <Text fontSize="3xs" color="gray.500">
              4-Stage Maker-Checker & Offline Transfer Execution
            </Text>
          </Box>
        </HStack>
        <HStack spacing={2} fontSize="2xs" flexWrap="wrap">
          <Badge
            variant={activeStage === "all" ? "solid" : "subtle"}
            colorScheme={activeStage === "all" ? "teal" : "gray"}
            cursor="pointer"
            px={2.5}
            py={1}
            borderRadius="full"
            fontWeight="700"
            onClick={() => onSelectStage && onSelectStage("all")}
            _hover={{ opacity: 0.85 }}
          >
            All Withdrawals
          </Badge>
          <Badge
            variant={activeStage === "rejected" ? "solid" : "subtle"}
            colorScheme="orange"
            cursor="pointer"
            px={2.5}
            py={1}
            borderRadius="full"
            fontWeight="700"
            onClick={() => onSelectStage && onSelectStage("rejected")}
            _hover={{ opacity: 0.85 }}
          >
            <HStack spacing={1}>
              <Icon as={FaBan} boxSize={2.5} />
              <Text>Rejected / Cancelled: {counts.rejected ?? 0}</Text>
            </HStack>
          </Badge>
          <Badge
            variant={activeStage === "failed" ? "solid" : "subtle"}
            colorScheme="red"
            cursor="pointer"
            px={2.5}
            py={1}
            borderRadius="full"
            fontWeight="700"
            onClick={() => onSelectStage && onSelectStage("failed")}
            _hover={{ opacity: 0.85 }}
          >
            <HStack spacing={1}>
              <Icon as={FaUndoAlt} boxSize={2.5} />
              <Text>Failed / Reverted: {counts.failed ?? 0}</Text>
            </HStack>
          </Badge>
        </HStack>
      </Flex>

      {/* 4 Steps Grid */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        align="stretch"
        gap={2}
      >
        {stages.map((stage, idx) => {
          const isSelected = activeStage === stage.id;
          return (
            <React.Fragment key={stage.id}>
              <Box
                flex={1}
                p={3}
                borderRadius="12px"
                cursor="pointer"
                transition="all 0.2s ease"
                bg={
                  isSelected
                    ? isDark
                      ? "gray.800"
                      : stage.bgGlow
                    : isDark
                    ? "gray.900"
                    : "gray.50"
                }
                border="2px solid"
                borderColor={
                  isSelected
                    ? stage.accentColor
                    : isDark
                    ? "gray.800"
                    : "transparent"
                }
                boxShadow={isSelected ? `0 4px 14px ${stage.bgGlow}` : "none"}
                _hover={{
                  borderColor: stage.accentColor,
                  transform: "translateY(-1px)",
                }}
                onClick={() => onSelectStage && onSelectStage(stage.id)}
              >
                <Flex justify="space-between" align="center" mb={1.5}>
                  <HStack spacing={2}>
                    <Flex
                      w="22px"
                      h="22px"
                      borderRadius="full"
                      bg={stage.accentColor}
                      color="white"
                      align="center"
                      justify="center"
                      fontSize="3xs"
                      fontWeight="800"
                    >
                      {stage.stepNumber}
                    </Flex>
                    <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.800"}>
                      {stage.title}
                    </Text>
                  </HStack>
                  <Badge
                    fontSize="2xs"
                    fontWeight="800"
                    borderRadius="full"
                    px={2}
                    bg={isSelected ? stage.accentColor : isDark ? "gray.800" : "gray.200"}
                    color={isSelected ? "white" : isDark ? "gray.200" : "gray.700"}
                  >
                    {stage.count}
                  </Badge>
                </Flex>

                <Text fontSize="3xs" color="gray.500" noOfLines={1} mb={2}>
                  {stage.subtitle}
                </Text>

                <Flex
                  align="center"
                  gap={1.5}
                  fontSize="3xs"
                  color={stage.accentColor}
                  fontWeight="600"
                >
                  <Icon as={stage.icon} boxSize={3} />
                  <Text noOfLines={1}>{stage.actionText}</Text>
                </Flex>
              </Box>

              {idx < stages.length - 1 && (
                <Flex
                  display={{ base: "none", lg: "flex" }}
                  align="center"
                  justify="center"
                  px={1}
                >
                  <Icon as={FaChevronRight} color="gray.300" boxSize={3} />
                </Flex>
              )}
            </React.Fragment>
          );
        })}
      </Flex>
    </Box>
  );
}

PayoutFlowPipeline.propTypes = {
  activeStage: PropTypes.string,
  onSelectStage: PropTypes.func,
  counts: PropTypes.shape({
    requested: PropTypes.number,
    pending: PropTypes.number,
    dualApproval: PropTypes.number,
    approved: PropTypes.number,
    paid: PropTypes.number,
    rejected: PropTypes.number,
    failed: PropTypes.number,
  }),
};
