// src/components/Scheduling/NoShowCompensationModal.js
// Modal to approve, reject, or mark paid customer no-show compensation claims
import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  useColorMode,
} from "@chakra-ui/react";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import { updateNoShowCompensation } from "api/scheduling";

export default function NoShowCompensationModal({
  isOpen,
  onClose,
  booking,
  actionType = "approve", // 'approve' | 'reject' | 'mark_paid'
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [note, setNote] = useState("");
  const [providerReference, setProviderReference] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNote("");
      setProviderReference("");
    }
  }, [isOpen]);

  if (!booking) return null;

  const bookingId = booking._id || booking.bookingId || booking.id;
  const noShowData = booking.customerNoShow || booking.noShow || {};
  const compensationPaise =
    noShowData.compensationPaise != null
      ? Number(noShowData.compensationPaise)
      : noShowData.amountPaise != null
      ? Number(noShowData.amountPaise)
      : noShowData.amount != null
      ? Number(noShowData.amount) * 100
      : 0;

  const formattedCompensation = `₹${(compensationPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const techName =
    booking.technician?.name ||
    booking.technicianId?.name ||
    noShowData.technicianName ||
    "Assigned Technician";

  const isApprove = actionType === "approve";
  const isReject = actionType === "reject";
  const isMarkPaid = actionType === "mark_paid";

  const modalTitle = isApprove
    ? "Approve Customer No-Show Compensation"
    : isReject
    ? "Reject Customer No-Show Compensation"
    : "Mark No-Show Compensation as Paid";

  const primaryLabel = isApprove
    ? "Confirm Approval"
    : isReject
    ? "Confirm Rejection"
    : "Mark Settled & Paid";

  const primaryColorScheme = isApprove ? "teal" : isReject ? "red" : "green";

  const handleSubmit = async () => {
    if (isReject && !note.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please specify why the no-show compensation is rejected.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isMarkPaid && !providerReference.trim()) {
      toast({
        title: "UTR Reference required",
        description: "Please enter the bank UTR or UPI transaction reference for this payment.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    const body = {
      action: actionType,
      note: note.trim() || undefined,
    };

    if (isMarkPaid) {
      body.providerReference = providerReference.trim();
    }

    const { error } = await updateNoShowCompensation(bookingId, body);
    setSaving(false);

    if (error) {
      toast.error(error, {
        title: "Action failed",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: isApprove
        ? "Compensation Approved"
        : isReject
        ? "Compensation Rejected"
        : "Compensation Settled",
      description: isApprove
        ? `Approved ${formattedCompensation} for ${techName}. Liability posted to wallet.`
        : isReject
        ? `Claim rejected for booking #${String(bookingId).slice(-8)}.`
        : `Marked paid with UTR ${providerReference}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        if (saving) return;
        onClose();
      }}
      title={modalTitle}
      size="md"
      primaryAction={{
        label: primaryLabel,
        onClick: handleSubmit,
        isLoading: saving,
        colorScheme: primaryColorScheme,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Claim context summary */}
        <Box
          p={3.5}
          bg={
            isApprove
              ? isDark
                ? "teal.950"
                : "teal.50"
              : isReject
              ? isDark
                ? "red.950"
                : "red.50"
              : isDark
              ? "green.950"
              : "green.50"
          }
          borderRadius="12px"
          border="1px solid"
          borderColor={
            isApprove
              ? isDark
                ? "teal.800"
                : "teal.200"
              : isReject
              ? isDark
                ? "red.800"
                : "red.200"
              : isDark
              ? "green.800"
              : "green.200"
          }
        >
          <HStack justify="space-between" align="center" mb={1}>
            <Text fontSize="xs" fontWeight="700" color="gray.500">
              Compensation Amount:
            </Text>
            <Text fontSize="lg" fontWeight="900" color={isReject ? "red.600" : "teal.600"}>
              {formattedCompensation}
            </Text>
          </HStack>
          <HStack justify="space-between" align="center">
            <Text fontSize="2xs" color="gray.500">
              Technician: <strong>{techName}</strong>
            </Text>
            <Badge fontSize="3xs" colorScheme="blue">
              Booking #{String(bookingId).slice(-8)}
            </Badge>
          </HStack>
        </Box>

        {isApprove && (
          <Alert status="info" borderRadius="8px" fontSize="2xs" py={2}>
            <AlertIcon />
            Approving posts a pending <strong>manual_adjustment</strong> entry to the technician&apos;s wallet ledger.
          </Alert>
        )}

        {isReject && (
          <Alert status="warning" borderRadius="8px" fontSize="2xs" py={2}>
            <AlertIcon />
            Rejecting cancels this claim and marks the pending ledger liability as an exception.
          </Alert>
        )}

        {isMarkPaid && (
          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="700">
              Bank Reference / UTR Number
            </FormLabel>
            <Input
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
              placeholder="e.g. UTR-20261112001 or UPI Ref"
              fontFamily="mono"
              borderRadius="8px"
            />
          </FormControl>
        )}

        <FormControl isRequired={isReject}>
          <FormLabel fontSize="xs" fontWeight="700">
            {isReject ? "Rejection Reason (Required)" : "Audit Note (Optional)"}
          </FormLabel>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isReject
                ? "Explain why the no-show claim was declined..."
                : isMarkPaid
                ? "Payment transfer notes..."
                : "e.g. Confirmed technician waited 20 minutes at customer location"
            }
            borderRadius="8px"
            fontSize="xs"
            rows={3}
          />
        </FormControl>
      </VStack>
    </AppModal>
  );
}
