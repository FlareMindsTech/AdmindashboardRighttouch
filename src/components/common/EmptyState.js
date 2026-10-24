import React from "react";
import { Flex, Text, Icon } from "@chakra-ui/react";

/**
 * Shared empty-data indicator — Phase 1 extraction.
 * variant="icon" preserves the Dashboard analytics empty block
 * (Flex h 300px column gray.400, boxSize 8 icon mb 2 + message).
 * variant="text" preserves the Dashboard recent-bookings empty line
 * (gray.400 centered py 4). Table-row empties (Tr/Td with colSpan) are
 * intentionally NOT covered — different DOM context — and stay local.
 */
export default function EmptyState(props) {
  const { variant, message, icon, height, ...rest } = props;
  if (variant === "text") {
    return (
      <Text color="gray.400" textAlign="center" py={4} {...rest}>
        {message}
      </Text>
    );
  }
  return (
    <Flex
      h={height || "300px"}
      justify="center"
      align="center"
      direction="column"
      color="gray.400"
      {...rest}
    >
      {icon && <Icon as={icon} boxSize={8} mb={2} />}
      <Text>{message}</Text>
    </Flex>
  );
}
