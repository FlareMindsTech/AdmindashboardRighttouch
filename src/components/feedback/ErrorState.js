import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdRefresh, MdErrorOutline } from "react-icons/md";
import { toUserError } from "errors/normalizeError";

export default function ErrorState({
  error,
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  compact = false,
  icon = MdErrorOutline,
  requestId,
  action,
  ...rest
}) {
  const info = error ? toUserError(error) : null;
  const effectiveTitle = title || info?.title || "Something went wrong";
  const effectiveDescription =
    description || info?.message || "Please try again. If the issue continues, contact support.";
  const effectiveRequestId = requestId || info?.requestId;
  const surface = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const titleColor = useColorModeValue("gray.800", "white");
  const bodyColor = useColorModeValue("gray.600", "gray.300");
  const iconBg = useColorModeValue("red.50", "red.900");
  const iconColor = useColorModeValue("red.600", "red.300");

  if (compact) {
    return (
      <Flex
        align="flex-start"
        gap={3}
        p={4}
        border="1px solid"
        borderColor={border}
        borderRadius="10px"
        bg={surface}
        {...rest}
      >
        <Icon as={icon} boxSize={5} color={iconColor} mt={0.5} flexShrink={0} />
        <Box flex="1" minW={0}>
          <Text fontSize="sm" fontWeight="800" color={titleColor}>
            {effectiveTitle}
          </Text>
          <Text fontSize="sm" color={bodyColor} mt={1} lineHeight="1.5">
            {effectiveDescription}
          </Text>
          {effectiveRequestId ? (
            <Text fontSize="xs" color={bodyColor} mt={1} fontFamily="mono">
              Ref: {effectiveRequestId}
            </Text>
          ) : null}
          {onRetry ? (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="teal"
              mt={2}
              ml={-2}
              leftIcon={<MdRefresh />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      px={6}
      py={10}
      minH="240px"
      border="1px solid"
      borderColor={border}
      borderRadius="12px"
      bg={surface}
      {...rest}
    >
      <Flex
        w="52px"
        h="52px"
        borderRadius="12px"
        bg={iconBg}
        color={iconColor}
        align="center"
        justify="center"
        mb={4}
      >
        <Icon as={icon} boxSize={7} />
      </Flex>
      <Text fontSize="md" fontWeight="800" color={titleColor}>
        {effectiveTitle}
      </Text>
      <Text fontSize="sm" color={bodyColor} mt={2} maxW="460px" lineHeight="1.6">
        {effectiveDescription}
      </Text>
      {effectiveRequestId ? (
        <Text fontSize="xs" color={bodyColor} mt={2} fontFamily="mono">
          Ref: {effectiveRequestId}
        </Text>
      ) : null}
      {onRetry || action ? (
        <Flex mt={5} gap={3} flexWrap="wrap" justify="center">
          {onRetry ? (
            <Button size="sm" colorScheme="teal" leftIcon={<MdRefresh />} onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </Flex>
      ) : null}
    </Flex>
  );
}

ErrorState.propTypes = {
  error: PropTypes.any,
  title: PropTypes.node,
  description: PropTypes.node,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  compact: PropTypes.bool,
  icon: PropTypes.elementType,
  requestId: PropTypes.string,
  action: PropTypes.node,
};
