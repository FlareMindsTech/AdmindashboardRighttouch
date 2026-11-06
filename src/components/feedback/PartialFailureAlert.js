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
} from "@chakra-ui/react";
import { MdRefresh } from "react-icons/md";
import { toUserError } from "errors/normalizeError";

export default function PartialFailureAlert({
  failures = [],
  total,
  title,
  description,
  onRetry,
  retryLabel = "Retry failed sections",
}) {
  const items = failures
    .map((failure, index) => {
      const info = failure?.error ? toUserError(failure.error) : null;
      const label = failure?.label || failure?.section || `Section ${index + 1}`;
      return {
        key: failure?.key || `${label}-${index}`,
        label,
        message: failure?.message || info?.message || "",
      };
    })
    .filter((item) => item.message || item.label);

  if (!items.length) return null;

  const failedCount = items.length;
  const totalCount = Number(total) > 0 ? Number(total) : failedCount;
  const effectiveTitle =
    title || `Some sections could not be loaded (${failedCount} of ${totalCount})`;
  const effectiveDescription =
    description || "The rest of the page is available. Retry the failed sections below.";

  return (
    <Alert status="warning" borderRadius="10px" alignItems="flex-start" role="alert">
      <AlertIcon mt={0.5} />
      <Box flex="1" minW={0}>
        <AlertTitle fontSize="sm" fontWeight="800">
          {effectiveTitle}
        </AlertTitle>
        <AlertDescription display="block" fontSize="sm" mt={1} lineHeight="1.5">
          {effectiveDescription}
        </AlertDescription>
        <List mt={2} spacing={1} fontSize="sm" styleType="disc" pl={4}>
          {items.map((item) => (
            <ListItem key={item.key}>
              <strong>{item.label}:</strong> {item.message || "Could not be loaded."}
            </ListItem>
          ))}
        </List>
        {onRetry ? (
          <Button
            size="xs"
            variant="ghost"
            colorScheme="orange"
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

PartialFailureAlert.propTypes = {
  failures: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      section: PropTypes.string,
      error: PropTypes.any,
      message: PropTypes.string,
    })
  ),
  total: PropTypes.number,
  title: PropTypes.node,
  description: PropTypes.node,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
};
