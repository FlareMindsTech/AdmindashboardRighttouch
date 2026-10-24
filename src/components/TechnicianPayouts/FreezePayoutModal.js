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
import { toggleTechnicianPayoutFreeze } from "api/wallet";

export default function FreezePayoutModal({
  isOpen,
  onClose,
  technician,
  onSuccess,
}) {
  const toast = useToast();

  const isCurrentlyFrozen = !!(
    technician?.payoutBlocked ||
    technician?.technicianId?.payoutBlocked
  );

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const techId =
    technician?._id ||
    technician?.technicianId?._id ||
    technician?.technicianId ||
    technician?.id;

  const techName =
    technician?.name ||
    technician?.technicianName ||
    technician?.technicianId?.userId?.fname
      ? `${technician?.technicianId?.userId?.fname} ${technician?.technicianId?.userId?.lname || ""}`.trim()
      : "Technician";

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

    const newFreezeState = !isCurrentlyFrozen;

    if (newFreezeState && !reason.trim()) {
      setErrorMsg("A reason is required to freeze technician payouts.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        freeze: newFreezeState,
        reason: reason.trim() || undefined,
      };

      const { data, error } = await toggleTechnicianPayoutFreeze(techId, payload);

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: newFreezeState ? "Technician Payouts Frozen" : "Technician Payouts Unfrozen",
        description: newFreezeState
          ? `Payouts for ${techName} are now blocked.`
          : `Payouts for ${techName} have been unblocked.`,
        status: newFreezeState ? "warning" : "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to update payout freeze status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered closeOnOverlayClick={!isSubmitting}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg={isCurrentlyFrozen ? "green.700" : "red.700"} color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                {isCurrentlyFrozen ? "Unfreeze Technician Payouts" : "Freeze Technician Payouts"}
              </Text>
              <Text fontSize="2xs" color="whiteAlpha.800" fontFamily="mono">
                {techName} • #{techId}
              </Text>
            </Box>
            <Badge colorScheme={isCurrentlyFrozen ? "green" : "red"} px={2.5} py={1} borderRadius="full" fontSize="2xs">
              {isCurrentlyFrozen ? "UNBLOCK" : "BLOCK"}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            <Alert status={isCurrentlyFrozen ? "info" : "warning"} borderRadius="12px" fontSize="xs">
              <AlertIcon />
              <Box>
                <AlertTitle fontWeight="700">
                  {isCurrentlyFrozen ? "Restore Payout Capabilities" : "Payout Freeze Governance"}
                </AlertTitle>
                <AlertDescription>
                  {isCurrentlyFrozen
                    ? "Unfreezing will allow this technician to submit new withdrawal requests and receive payouts."
                    : "Freezing blocks the technician from requesting withdrawals or receiving automatic/manual payouts until unfrozen by an administrator."}
                </AlertDescription>
              </Box>
            </Alert>

            {errorMsg && (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            {!isCurrentlyFrozen && (
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700">
                  Reason for Freezing Payouts
                </FormLabel>
                <Textarea
                  size="sm"
                  borderRadius="8px"
                  rows={3}
                  placeholder="e.g. Investigation into suspicious cancellation pattern or customer complaint"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  isDisabled={isSubmitting}
                  autoFocus
                />
              </FormControl>
            )}

            {isCurrentlyFrozen && (
              <Box p={3} bg="gray.50" borderRadius="10px" fontSize="xs">
                <Text color="gray.600" mb={1}>Current Freeze Reason:</Text>
                <Text fontWeight="600" color="red.600">
                  {technician?.payoutBlockedReason || technician?.technicianId?.payoutBlockedReason || "Not specified"}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" py={3} px={6} borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={3} justify="flex-end" w="full">
            <Button size="sm" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme={isCurrentlyFrozen ? "green" : "red"}
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Updating..."
              isDisabled={(!isCurrentlyFrozen && !reason.trim()) || isSubmitting}
            >
              {isCurrentlyFrozen ? "Confirm Unfreeze" : "Confirm Freeze"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
