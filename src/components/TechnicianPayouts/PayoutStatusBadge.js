import React from "react";
import { Badge, HStack, Icon, Text } from "@chakra-ui/react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaBan,
  FaMoneyCheckAlt,
  FaSpinner,
} from "react-icons/fa";

export const getStatusConfig = (status) => {
  const norm = String(status || "").toLowerCase().trim();
  switch (norm) {
    case "requested":
    case "pending":
      return {
        label: norm === "requested" ? "Requested" : "Pending",
        colorScheme: "orange",
        bg: "orange.50",
        color: "orange.700",
        borderColor: "orange.200",
        icon: FaClock,
        description: "Awaiting administrator review and approval",
      };
    case "approved":
      return {
        label: "Approved — Awaiting Transfer",
        colorScheme: "blue",
        bg: "blue.50",
        color: "blue.700",
        borderColor: "blue.200",
        icon: FaMoneyCheckAlt,
        description: "Approved by admin. Ready for manual bank transfer & UTR entry",
      };
    case "paid":
      return {
        label: "Paid",
        colorScheme: "green",
        bg: "green.50",
        color: "green.700",
        borderColor: "green.200",
        icon: FaCheckCircle,
        description: "Bank transfer completed and UTR recorded",
      };
    case "rejected":
      return {
        label: "Rejected",
        colorScheme: "red",
        bg: "red.50",
        color: "red.700",
        borderColor: "red.200",
        icon: FaTimesCircle,
        description: "Rejected by admin. Reserved funds returned to wallet",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        colorScheme: "gray",
        bg: "gray.100",
        color: "gray.700",
        borderColor: "gray.300",
        icon: FaBan,
        description: "Cancelled prior to processing. Funds released",
      };
    case "failed":
      return {
        label: "Failed / Reverted",
        colorScheme: "red",
        bg: "red.50",
        color: "red.700",
        borderColor: "red.200",
        icon: FaExclamationTriangle,
        description: "Payment failed or reverted by Owner. Funds restored",
      };
    case "manual_review":
      return {
        label: "Manual Review",
        colorScheme: "purple",
        bg: "purple.50",
        color: "purple.700",
        borderColor: "purple.200",
        icon: FaQuestionCircle,
        description: "Ambiguous transaction requiring human investigation",
      };
    case "processing":
      return {
        label: "Processing",
        colorScheme: "cyan",
        bg: "cyan.50",
        color: "cyan.700",
        borderColor: "cyan.200",
        icon: FaSpinner,
        description: "Transaction in flight",
      };
    default:
      return {
        label: status ? String(status).toUpperCase() : "UNKNOWN",
        colorScheme: "gray",
        bg: "gray.50",
        color: "gray.600",
        borderColor: "gray.200",
        icon: FaQuestionCircle,
        description: "Unknown status",
      };
  }
};

export default function PayoutStatusBadge({ status, size = "md", showIcon = true }) {
  const config = getStatusConfig(status);

  return (
    <Badge
      px={size === "sm" ? 2 : 2.5}
      py={size === "sm" ? 0.5 : 1}
      borderRadius="full"
      borderWidth="1px"
      bg={config.bg}
      color={config.color}
      borderColor={config.borderColor}
      fontSize={size === "sm" ? "2xs" : "xs"}
      fontWeight="700"
      letterSpacing="0.02em"
      textTransform="none"
      boxShadow="sm"
    >
      <HStack spacing={1.5} align="center">
        {showIcon && <Icon as={config.icon} boxSize={size === "sm" ? "10px" : "12px"} />}
        <Text as="span">{config.label}</Text>
      </HStack>
    </Badge>
  );
}
