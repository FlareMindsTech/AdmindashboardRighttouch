import React from "react";
import PropTypes from "prop-types";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { MdRefresh } from "react-icons/md";
import { toUserError } from "errors/normalizeError";

export default function FormErrorSummary({
  error,
  fieldErrors,
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  showFieldList = true,
}) {
  const info = error ? toUserError(error) : null;
  const mergedFieldErrors = {
    ...(info?.fieldErrors || {}),
    ...(fieldErrors || {}),
  };
  const fieldMessages = Object.values(mergedFieldErrors).filter(Boolean);
  const effectiveTitle = title || info?.title || "Please review the form";
  const effectiveDescription = description || info?.message || "";
  const showDescription =
    effectiveDescription && (!fieldMessages.length || effectiveDescription !== fieldMessages[0]);

  if (!info && !fieldMessages.length && !effectiveDescription && !effectiveTitle) {
    return null;
  }

  return (
    <Alert status="error" borderRadius="10px" alignItems="flex-start" role="alert">
      <AlertIcon mt={0.5} />
      <Box flex="1" minW={0}>
        <AlertTitle fontSize="sm" fontWeight="800">
          {effectiveTitle}
        </AlertTitle>
        {showDescription ? (
          <AlertDescription display="block" fontSize="sm" mt={1} lineHeight="1.5">
            {effectiveDescription}
          </AlertDescription>
        ) : null}
        {showFieldList && fieldMessages.length ? (
          <List mt={2} spacing={1} fontSize="sm" styleType="disc" pl={4}>
            {fieldMessages.map((message, index) => (
              <ListItem key={`${message}-${index}`}>{message}</ListItem>
            ))}
          </List>
        ) : null}
        {info?.requestId ? (
          <Text fontSize="xs" mt={2} fontFamily="mono">
            Ref: {info.requestId}
          </Text>
        ) : null}
        {onRetry ? (
          <Button
            size="xs"
            variant="ghost"
            colorScheme="red"
            mt={2}
            ml={-2}
            leftIcon={<MdRefresh />}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        ) : null}
      </Box>
    </Alert>
  );
}

FormErrorSummary.propTypes = {
  error: PropTypes.any,
  fieldErrors: PropTypes.object,
  title: PropTypes.node,
  description: PropTypes.node,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  showFieldList: PropTypes.bool,
};
