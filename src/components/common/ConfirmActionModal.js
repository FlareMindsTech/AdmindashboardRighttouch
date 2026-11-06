import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Checkbox,
  Input,
  List,
  ListItem,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdWarning, MdDeleteOutline, MdHelpOutline } from "react-icons/md";
import AppModal from "./AppModal";
import { normalizeError } from "errors/normalizeError";

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm action",
  subtitle,
  description = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColorScheme = "red",
  isLoading = false,
  icon,
  iconBg,
  iconColor,
  size = "md",
  error,
  onRetry,
  details,
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Add a short reason for this action",
  reasonValue,
  onReasonChange,
  minReasonLength = 5,
  acknowledgement,
  acknowledged = false,
  onAcknowledgedChange,
  children,
}) {
  const cancelRef = useRef(null);
  const reasonRef = useRef(null);
  const [internalBusy, setInternalBusy] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const [reason, setReason] = useState(reasonValue || "");
  const [isAcknowledged, setIsAcknowledged] = useState(Boolean(acknowledged));
  const isDanger = confirmColorScheme === "red";
  const defaultIcon = isDanger
    ? MdDeleteOutline
    : confirmColorScheme === "orange"
    ? MdWarning
    : MdHelpOutline;
  const effectiveIcon = icon || defaultIcon;
  const tone = isDanger ? "danger" : confirmColorScheme === "orange" ? "warning" : "default";
  const effectiveIconBg =
    iconBg || (isDanger ? "red.50" : confirmColorScheme === "orange" ? "orange.50" : "teal.50");
  const effectiveIconColor =
    iconColor ||
    (isDanger ? "red.600" : confirmColorScheme === "orange" ? "orange.600" : "#008080");
  const descColor = useColorModeValue("gray.600", "gray.300");
  const helperColor = useColorModeValue("gray.500", "gray.400");
  const busy = Boolean(isLoading || internalBusy);

  useEffect(() => {
    if (!isOpen) {
      setInternalError(null);
      setReason(reasonValue || "");
      setIsAcknowledged(Boolean(acknowledged));
    }
  }, [isOpen, reasonValue, acknowledged]);

  const handleReasonChange = useCallback(
    (event) => {
      const value = event.target.value;
      setReason(value);
      if (onReasonChange) onReasonChange(value);
    },
    [onReasonChange]
  );

  const handleAcknowledgedChange = useCallback(
    (event) => {
      const value = event.target.checked;
      setIsAcknowledged(value);
      if (onAcknowledgedChange) onAcknowledgedChange(value);
    },
    [onAcknowledgedChange]
  );

  const handleConfirm = useCallback(async () => {
    const trimmedReason = String(reason || "").trim();
    if (requireReason && trimmedReason.length < minReasonLength) {
      setInternalError(
        new Error(`Please enter a reason of at least ${minReasonLength} characters.`)
      );
      return;
    }
    if (acknowledgement && !isAcknowledged) {
      setInternalError(new Error("Please confirm that you understand the impact of this action."));
      return;
    }

    setInternalError(null);
    setInternalBusy(true);
    try {
      const result = await onConfirm({ reason: trimmedReason, acknowledged: isAcknowledged });
      if (result === false) return;
      onClose();
    } catch (input) {
      setInternalError(normalizeError(input));
    } finally {
      setInternalBusy(false);
    }
  }, [
    acknowledgement,
    isAcknowledged,
    minReasonLength,
    onClose,
    onConfirm,
    reason,
    requireReason,
  ]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={effectiveIcon}
      tone={tone}
      iconBg={effectiveIconBg}
      iconColor={effectiveIconColor}
      size={size}
      isBusy={busy}
      error={internalError || error}
      onRetry={onRetry}
      initialFocusRef={requireReason ? reasonRef : cancelRef}
      primaryAction={{
        label: confirmText,
        onClick: handleConfirm,
        isLoading: busy,
        loadingText: confirmText,
        colorScheme: confirmColorScheme,
      }}
      secondaryAction={{
        label: cancelText,
        onClick: onClose,
        variant: "ghost",
        isDisabled: busy,
        ref: cancelRef,
      }}
    >
      <VStack spacing={4} align="stretch" py={1}>
        {typeof description === "string" ? (
          <Text fontSize="sm" color={descColor} lineHeight="1.5">
            {description}
          </Text>
        ) : (
          description
        )}

        {Array.isArray(details) && details.length ? (
          <Box>
            <List spacing={1} fontSize="sm" color={descColor} styleType="disc" pl={4}>
              {details.map((item, index) => (
                <ListItem key={`${item}-${index}`}>{item}</ListItem>
              ))}
            </List>
          </Box>
        ) : null}

        {requireReason ? (
          <Box>
            <Text fontSize="sm" fontWeight="700" color={descColor} mb={2}>
              {reasonLabel}
            </Text>
            <Input
              ref={reasonRef}
              value={reason}
              onChange={handleReasonChange}
              placeholder={reasonPlaceholder}
              isDisabled={busy}
              size="sm"
              borderRadius="6px"
              autoFocus
            />
            <Text fontSize="xs" color={helperColor} mt={1}>
              Minimum {minReasonLength} characters.
            </Text>
          </Box>
        ) : null}

        {acknowledgement ? (
          <Checkbox
            isChecked={isAcknowledged}
            onChange={handleAcknowledgedChange}
            isDisabled={busy}
            size="sm"
            colorScheme={isDanger ? "red" : "orange"}
          >
            <Text fontSize="sm" color={descColor}>
              {acknowledgement}
            </Text>
          </Checkbox>
        ) : null}

        {children ? <Box>{children}</Box> : null}
      </VStack>
    </AppModal>
  );
}

ConfirmActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  description: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColorScheme: PropTypes.string,
  isLoading: PropTypes.bool,
  icon: PropTypes.elementType,
  iconBg: PropTypes.string,
  iconColor: PropTypes.string,
  size: PropTypes.string,
  error: PropTypes.any,
  onRetry: PropTypes.func,
  details: PropTypes.arrayOf(PropTypes.node),
  requireReason: PropTypes.bool,
  reasonLabel: PropTypes.string,
  reasonPlaceholder: PropTypes.string,
  reasonValue: PropTypes.string,
  onReasonChange: PropTypes.func,
  minReasonLength: PropTypes.number,
  acknowledgement: PropTypes.node,
  acknowledged: PropTypes.bool,
  onAcknowledgedChange: PropTypes.func,
  children: PropTypes.node,
};
