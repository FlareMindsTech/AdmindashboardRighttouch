import React from "react";
import { Button, IconButton, Tooltip } from "@chakra-ui/react";
import { MdRefresh } from "react-icons/md";

export default function RefreshButton({
  label = "Refresh",
  isLoading = false,
  iconOnly = false,
  ariaLabel,
  isDisabled = false,
  onClick,
  tooltip,
  variant = "outline",
  size = "sm",
  ...rest
}) {
  const accessibleLabel = ariaLabel || tooltip || label;

  if (iconOnly) {
    return (
      <Tooltip label={tooltip || accessibleLabel} hasArrow placement="top">
        <IconButton
          aria-label={accessibleLabel}
          icon={<MdRefresh size={16} />}
          size={size}
          h="32px"
          w="32px"
          minW="32px"
          variant={variant}
          borderRadius="8px"
          isLoading={isLoading}
          isDisabled={isDisabled}
          onClick={onClick}
          {...rest}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      h="32px"
      px={3}
      variant={variant}
      borderRadius="8px"
      fontWeight="700"
      leftIcon={<MdRefresh size={14} />}
      isLoading={isLoading}
      loadingText="Refreshing"
      isDisabled={isDisabled}
      onClick={onClick}
      {...rest}
    >
      {label}
    </Button>
  );
}
