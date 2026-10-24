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
  Input,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  useToast,
  Checkbox,
} from "@chakra-ui/react";
import { revertPaidWithdrawal } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

export default function RevertPaidModal({
  isOpen,
  onClose,
  withdrawal,
  currentUser,
  onSuccess,
}) {
  const toast = useToast();

  const [reason, setReason] = useState("");
  const [bankReturnUtr, setBankReturnUtr] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isOwner = currentUser?.role?.toLowerCase() === "owner";

  const grossPaise =
    withdrawal?.requestedAmountPaise ??
    withdrawal?.amountPaise ??
    (withdrawal?.amount ? Math.round(withdrawal.amount * 100) : 0);
  const netPaise =
    withdrawal?.netPayoutAmountPaise ??
    (withdrawal?.financials?.netPayoutAmountPaise ?? grossPaise);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setBankReturnUtr("");
      setAcknowledged(false);
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!isOwner) {
      setErrorMsg("Only account Owners can execute financial payout reversals.");
      return;
    }

    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setErrorMsg("A detailed reversal reason of at least 5 characters is required.");
      return;
    }

    if (!acknowledged) {
      setErrorMsg("Please acknowledge the financial remediation consequences.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        reason: trimmed,
        bankReturnUtr: bankReturnUtr.trim() || undefined,
      };

      const { data, error } = await revertPaidWithdrawal(withdrawal._id, payload);

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Payout Reverted (Remediated)",
        description: `Successfully reverted payout #${withdrawal._id}. Gross ${formatInr(grossPaise)} returned to wallet balance.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to revert paid withdrawal.");
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered closeOnOverlayClick={!isSubmitting}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg="red.800" color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Revert Recorded Payment (Owner Only)
              </Text>
              <Text fontSize="2xs" color="red.200" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
            <Badge colorScheme="red" px={2.5} py={1} borderRadius="full" fontSize="2xs">
              FINANCIAL REMEDIATION
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            {!isOwner ? (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <Box>
                  <AlertTitle fontWeight="700">Access Restricted</AlertTitle>
                  <AlertDescription>
                    Only users with the <strong>Owner</strong> role have permission to revert paid payouts. Ordinary administrators cannot access this function.
                  </AlertDescription>
                </Box>
              </Alert>
            ) : (
              <Alert status="error" borderRadius="12px" variant="left-accent" fontSize="xs">
                <AlertIcon />
                <Box>
                  <AlertTitle fontWeight="700">Exceptional Financial Correction</AlertTitle>
                  <AlertDescription>
                    Reversing a payment is an append-only audit operation used when a bank transfer bounced or a wrong UTR was recorded. The payout will be marked <strong>failed</strong>, lifetime withdrawn will be unwound by {formatInr(netPaise)}, and the full gross amount of <strong>{formatInr(grossPaise)}</strong> will be credited back to the technician's available balance.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {errorMsg && (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <FormControl isRequired isInvalid={reason.length > 0 && reason.trim().length < 5}>
              <FormLabel fontSize="xs" fontWeight="700">
                Reason for Reversal (Mandatory Audit Trail)
              </FormLabel>
              <Textarea
                size="sm"
                borderRadius="8px"
                rows={3}
                placeholder="Explain why this payment record is being reverted (e.g. Bank portal rejected transfer due to invalid account number; funds reversed to company account)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                isDisabled={!isOwner || isSubmitting}
                autoFocus
              />
              <Text fontSize="3xs" color="gray.500" mt={1}>
                Minimum 5 characters required. Logged in audit history and notified to technician.
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">
                Bank Return UTR / Reference (If applicable)
              </FormLabel>
              <Input
                size="sm"
                borderRadius="8px"
                fontFamily="mono"
                placeholder="e.g. RET/HDFC202610150912"
                value={bankReturnUtr}
                onChange={(e) => setBankReturnUtr(e.target.value.toUpperCase())}
                isDisabled={!isOwner || isSubmitting}
              />
            </FormControl>

            <Checkbox
              size="sm"
              colorScheme="red"
              isChecked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              isDisabled={!isOwner || isSubmitting}
            >
              <Text fontSize="xs" fontWeight="600" color="red.700">
                I confirm that this payment has failed or was erroneously recorded, and agree to restore {formatInr(grossPaise)} to the technician wallet.
              </Text>
            </Checkbox>
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
              loadingText="Reverting Payment..."
              isDisabled={!isOwner || reason.trim().length < 5 || !acknowledged || isSubmitting}
            >
              Confirm Revert ({formatInr(grossPaise)})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
