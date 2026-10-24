import React from "react";
import PropTypes from "prop-types";
import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { MdWarning, MdDeleteOutline, MdHelpOutline } from "react-icons/md";
import AppModal from "./AppModal";

/**
 * ConfirmActionModal Component
 *
 * Standardized confirmation dialog for dangerous actions (delete, deactivate, freeze, rollback)
 * or major operational decisions across the admin dashboard.
 */
export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
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
  children,
}) {
  const isDanger = confirmColorScheme === "red";
  const defaultIcon = isDanger ? MdDeleteOutline : confirmColorScheme === "orange" ? MdWarning : MdHelpOutline;
  const effectiveIcon = icon || defaultIcon;
  const effectiveIconBg = iconBg || (isDanger ? "red.50" : confirmColorScheme === "orange" ? "orange.50" : "teal.50");
  const effectiveIconColor = iconColor || (isDanger ? "red.600" : confirmColorScheme === "orange" ? "orange.600" : "#008080");

  const descColor = useColorModeValue("gray.600", "gray.300");

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={effectiveIcon}
      iconBg={effectiveIconBg}
      iconColor={effectiveIconColor}
      size={size}
      primaryAction={{
        label: confirmText,
        onClick: onConfirm,
        isLoading,
        colorScheme: confirmColorScheme,
      }}
      secondaryAction={{
        label: cancelText,
        onClick: onClose,
        variant: "ghost",
      }}
    >
      <VStack spacing={3} align="stretch" py={1}>
        {typeof description === "string" ? (
          <Text fontSize="sm" color={descColor} lineHeight="1.5">
            {description}
          </Text>
        ) : (
          description
        )}
        {children && <Box mt={2}>{children}</Box>}
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
  children: PropTypes.node,
};
