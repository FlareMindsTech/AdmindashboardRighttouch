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
  RadioGroup,
  Radio,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { resolveManualReviewPayout } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

export default function ResolveManualReviewModal({
  isOpen,
  onClose,
  withdrawal,
  onSuccess,
}) {
  const toast = useToast();

  const [decision, setDecision] = useState("complete");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const grossPaise =
    withdrawal?.requestedAmountPaise ??
    withdrawal?.amountPaise ??
    (withdrawal?.amount ? Math.round(withdrawal.amount * 100) : 0);
  const netPaise =
    withdrawal?.netPayoutAmountPaise ??
    (withdrawal?.financials?.netPayoutAmountPaise ?? grossPaise);

  useEffect(() => {
    if (isOpen) {
      setDecision("complete");
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!["complete", "revert"].includes(decision)) {
      setErrorMsg("Please select a valid resolution decision.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await resolveManualReviewPayout(withdrawal._id, {
        decision,
      });

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: `Manual Review ${decision === "complete" ? "Completed" : "Reverted"}`,
        description: `Successfully resolved manual review withdrawal #${withdrawal._id}.`,
        status: decision === "complete" ? "success" : "info",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to resolve manual review payout.");
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
        <ModalHeader bg="purple.800" color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Resolve Manual Review Payout
              </Text>
              <Text fontSize="2xs" color="purple.200" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
            <Badge colorScheme="purple" px={2.5} py={1} borderRadius="full" fontSize="2xs">
              MANUAL REVIEW
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            <Alert status="warning" borderRadius="12px" fontSize="xs">
              <AlertIcon />
              <Box>
                <AlertTitle fontWeight="700">Investigation Decision</AlertTitle>
                <AlertDescription>
                  This withdrawal was flagged for manual review. Confirm whether bank evidence verifies that funds left the company account or if the payout should be reverted.
                </AlertDescription>
              </Box>
            </Alert>

            {errorMsg && (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <Box p={3} bg="gray.50" borderRadius="10px" fontSize="xs">
              <HStack justify="space-between" mb={1}>
                <Text color="gray.600">Net Transfer Amount:</Text>
                <Text fontWeight="700">{formatInr(netPaise)}</Text>
              </HStack>
              {withdrawal?.utr && (
                <HStack justify="space-between" mb={1}>
                  <Text color="gray.600">Recorded UTR:</Text>
                  <Text fontFamily="mono" fontWeight="700">{withdrawal.utr}</Text>
                </HStack>
              )}
              {withdrawal?.failureReason && (
                <HStack justify="space-between">
                  <Text color="gray.600">Review Flag Reason:</Text>
                  <Text color="red.600" fontWeight="600">{withdrawal.failureReason}</Text>
                </HStack>
              )}
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="700">
                Resolution Action
              </FormLabel>
              <RadioGroup value={decision} onChange={setDecision} isDisabled={isSubmitting}>
                <Stack spacing={3}>
                  <Radio value="complete" colorScheme="purple">
                    <Box>
                      <Text fontSize="xs" fontWeight="700">Complete (Mark Paid)</Text>
                      <Text fontSize="2xs" color="gray.500">
                        Confirm that transfer cleared bank verification. Finalizes the withdrawal as paid.
                      </Text>
                    </Box>
                  </Radio>
                  <Radio value="revert" colorScheme="red">
                    <Box>
                      <Text fontSize="xs" fontWeight="700">Revert (Mark Failed)</Text>
                      <Text fontSize="2xs" color="gray.500">
                        Revert transaction. Unwinds hold and returns {formatInr(grossPaise)} back to technician wallet.
                      </Text>
                    </Box>
                  </Radio>
                </Stack>
              </RadioGroup>
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
              colorScheme={decision === "complete" ? "purple" : "red"}
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Resolving..."
            >
              Confirm Resolution ({decision})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
