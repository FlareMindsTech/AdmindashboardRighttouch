import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Text,
  VStack,
  SimpleGrid,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdVisibility } from "react-icons/md";
import AppModal from "./AppModal";

/**
 * InspectionModal Component
 *
 * Dedicated modal for deep inspection of audit trails, transactions, logs, and entity payloads.
 * Features the standardized 4-card metadata grid and formatted payload viewer matching RightTouch design tokens.
 */
export default function InspectionModal({
  isOpen,
  onClose,
  title = "Audit Inspection",
  subtitle = "Deep immutable record details and payload",
  icon = MdVisibility,
  iconBg = "teal.50",
  iconColor = "#008080",
  size = "xl",
  metadata = [],
  payloadTitle = "Raw Payload / State Differences",
  payload,
  fallbackMessage = "No details available.",
  extraContent,
  primaryAction,
  secondaryAction = { label: "Close", onClick: onClose },
}) {
  const cardBg = useColorModeValue("gray.50", "gray.750");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "white");
  const preBg = useColorModeValue("white", "gray.900");
  const preBorder = useColorModeValue("gray.200", "gray.700");

  const formattedPayload = React.useMemo(() => {
    if (!payload) return null;
    if (typeof payload === "object") {
      try {
        return JSON.stringify(payload, null, 2);
      } catch {
        return String(payload);
      }
    }
    return String(payload);
  }, [payload]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconBg={iconBg}
      iconColor={iconColor}
      size={size}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    >
      <VStack spacing={4} align="stretch" fontSize="xs">
        {/* Responsive Metadata Cards Grid (e.g., Action, Target, Actor, Timestamp) */}
        {metadata && metadata.length > 0 && (
          <SimpleGrid columns={{ base: 2, sm: Math.min(metadata.length, 4) }} gap={2.5}>
            {metadata.map((item, idx) => (
              <Box
                key={item.label || idx}
                p={3}
                bg={cardBg}
                borderRadius="6px"
                border="1px solid"
                borderColor={cardBorder}
              >
                <Text color={labelColor} fontSize="10px" fontWeight="600" textTransform="uppercase">
                  {item.label}
                </Text>
                {item.isBadge ? (
                  <Badge
                    colorScheme={item.badgeScheme || "teal"}
                    mt={1}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontWeight="700"
                  >
                    {item.value || "N/A"}
                  </Badge>
                ) : (
                  <Text fontWeight="700" color={valueColor} mt={1} noOfLines={1} title={item.value}>
                    {item.value || "N/A"}
                  </Text>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Optional Custom Extra Content */}
        {extraContent}

        {/* Raw Payload / State Differences Monospace Container */}
        {payloadTitle && (
          <Box p={4} bg={cardBg} borderRadius="10px" border="1px solid" borderColor={cardBorder}>
            <Text
              fontWeight="700"
              color={labelColor}
              mb={2}
              textTransform="uppercase"
              fontSize="11px"
              letterSpacing="0.4px"
            >
              {payloadTitle}
            </Text>
            <Box
              as="pre"
              fontSize="11px"
              fontFamily="mono"
              whiteSpace="pre-wrap"
              wordBreak="break-word"
              bg={preBg}
              p={3}
              borderRadius="6px"
              border="1px solid"
              borderColor={preBorder}
              color={valueColor}
              maxH="320px"
              overflowY="auto"
            >
              {formattedPayload || fallbackMessage}
            </Box>
          </Box>
        )}
      </VStack>
    </AppModal>
  );
}

InspectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.elementType,
  iconBg: PropTypes.string,
  iconColor: PropTypes.string,
  size: PropTypes.string,
  metadata: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node,
      isBadge: PropTypes.bool,
      badgeScheme: PropTypes.string,
    })
  ),
  payloadTitle: PropTypes.string,
  payload: PropTypes.any,
  fallbackMessage: PropTypes.string,
  extraContent: PropTypes.node,
  primaryAction: PropTypes.object,
  secondaryAction: PropTypes.object,
};
