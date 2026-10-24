import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { rejectWithdrawal } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

export default function RejectWithdrawalModal({
  isOpen,
  onClose,
  withdrawal,
  onSuccess,
}) {
  const toast = useToast();

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const requestedPaise =
    withdrawal?.requestedAmountPaise ??
    withdrawal?.amountPaise ??
    (withdrawal?.amount ? Math.round(withdrawal.amount * 100) : 0);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setErrorMsg("A rejection reason of at least 5 characters is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await rejectWithdrawal(withdrawal._id, {
        reason: trimmed,
        adminNote: trimmed,
      });

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Withdrawal Rejected",
        description: `Rejected withdrawal #${withdrawal._id}. ${formatInr(requestedPaise)} has been returned to the technician's available balance.`,
        status: "info",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to reject withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const techName =
    withdrawal?.technician?.name ||
    withdrawal?.technicianName ||
    withdrawal?.technicianId?.userId?.fname
      ? `${withdrawal?.technicianId?.userId?.fname} ${withdrawal?.technicianId?.userId?.lname || ""}`.trim()
      : "Technician";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered closeOnOverlayClick={!isSubmitting}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg="red.700" color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Reject Withdrawal Request
              </Text>
              <Text fontSize="2xs" color="red.100" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
            <Badge colorScheme="red" px={2.5} py={1} borderRadius="full" fontSize="2xs">
              REJECTION
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            <Alert status="info" borderRadius="12px" fontSize="xs">
              <AlertIcon />
              <Box>
                <AlertTitle fontWeight="700">Reservation Release</AlertTitle>
                <AlertDescription>
                  Upon rejection, the reserved amount of <strong>{formatInr(requestedPaise)}</strong> will be immediately unblocked and credited back to the technician's available balance.
                </AlertDescription>
              </Box>
            </Alert>

            {errorMsg && (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <FormControl isRequired isInvalid={reason.length > 0 && reason.trim().length < 5}>
              <FormLabel fontSize="xs" fontWeight="700">
                Reason for Rejection (Visible to Technician)
              </FormLabel>
              <Textarea
                size="sm"
                borderRadius="8px"
                rows={3}
                placeholder="Explain the specific reason (e.g. Incomplete KYC bank verification, disputed booking commission, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                isDisabled={isSubmitting}
                autoFocus
              />
              <Text fontSize="3xs" color="gray.500" mt={1}>
                Minimum 5 characters required. This note will be recorded in the audit logs and sent in the push notification.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" py={3} px={6} borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={3} justify="flex-end" w="full">
            <Button size="sm" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Rejecting..."
              isDisabled={reason.trim().length < 5 || isSubmitting}
            >
              Confirm Rejection
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
