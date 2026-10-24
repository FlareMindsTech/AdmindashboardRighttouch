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
  FormHelperText,
  Input,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { markWithdrawalPaid } from "api/wallet";
import FinancialBreakdown from "./FinancialBreakdown";

const UTR_REGEX = /^[A-Za-z0-9_-]{6,50}$/;

export default function RecordBankTransferModal({
  isOpen,
  onClose,
  withdrawal,
  onSuccess,
}) {
  const toast = useToast();

  const [utr, setUtr] = useState("");
  const [payoutMode, setPayoutMode] = useState("NEFT");
  const [transferDateTime, setTransferDateTime] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Extract expected net payout
  const requestedPaise =
    withdrawal?.requestedAmountPaise ??
    withdrawal?.amountPaise ??
    (withdrawal?.amount ? Math.round(withdrawal.amount * 100) : 0);
  const netPaise =
    withdrawal?.netPayoutAmountPaise ??
    (withdrawal?.financials?.netPayoutAmountPaise ?? requestedPaise);
  const netRupees = (netPaise / 100).toFixed(2);

  // Initialize form when withdrawal opens
  useEffect(() => {
    if (isOpen) {
      setUtr("");
      setPayoutMode("NEFT");
      // Default to current local datetime string YYYY-MM-DDTHH:MM
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setTransferDateTime(now.toISOString().slice(0, 16));
      setConfirmedAmount(netRupees);
      setAdminNote("");
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen, netRupees]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    // 1. Validate UTR
    const trimmedUtr = utr.trim();
    if (!trimmedUtr) {
      setErrorMsg("Bank UTR / Transaction Reference is required.");
      return;
    }
    if (!UTR_REGEX.test(trimmedUtr)) {
      setErrorMsg("UTR must be 6 to 50 alphanumeric characters (letters, numbers, hyphens, underscores).");
      return;
    }

    // 2. Validate Transfer Date
    if (!transferDateTime) {
      setErrorMsg("Transfer date and time is required.");
      return;
    }
    const transferDate = new Date(transferDateTime);
    if (isNaN(transferDate.getTime())) {
      setErrorMsg("Invalid transfer date format.");
      return;
    }
    if (transferDate > new Date()) {
      setErrorMsg("Transfer date cannot be in the future.");
      return;
    }

    // 3. Validate Confirmed Amount
    const enteredPaise = Math.round(parseFloat(confirmedAmount || 0) * 100);
    if (isNaN(enteredPaise) || enteredPaise <= 0) {
      setErrorMsg("Please enter a valid confirmed transfer amount.");
      return;
    }
    if (enteredPaise !== netPaise) {
      setErrorMsg(
        `Confirmed amount (₹${(enteredPaise / 100).toFixed(2)}) must exactly match the approved net payable amount (₹${netRupees}). Partial or excess payments cannot be recorded.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        utr: trimmedUtr,
        paymentMode: payoutMode,
        paidAt: transferDate.toISOString(),
        confirmedAmountPaise: enteredPaise,
        confirmedAmount: enteredPaise / 100,
        adminNote: adminNote.trim() || `Manual ${payoutMode} bank transfer recorded by Admin`,
      };

      const { data, error } = await markWithdrawalPaid(withdrawal._id, payload);

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Payout Marked as Paid",
        description: `Successfully recorded ${payoutMode} transfer with UTR: ${trimmedUtr}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to mark withdrawal as paid.");
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
        <ModalHeader bg="teal.700" color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Record Manual Bank Transfer
              </Text>
              <Text fontSize="2xs" color="teal.100" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
            <Badge colorScheme="orange" px={2.5} py={1} borderRadius="full" fontSize="2xs">
              MANUAL NEFT / IMPS
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            {/* Critical Financial Safety Alert */}
            <Alert status="warning" borderRadius="12px" variant="left-accent" fontSize="xs">
              <AlertIcon />
              <Box>
                <AlertTitle fontWeight="700">Bank Portal Transfer Required First</AlertTitle>
                <AlertDescription>
                  This action records an offline bank transfer that you have <strong>already executed</strong> in your bank portal. Do not submit this form if the bank transfer has not yet cleared.
                </AlertDescription>
              </Box>
            </Alert>

            {errorMsg && (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            {/* Financial Breakdown Preview */}
            <FinancialBreakdown
              financials={{
                requestedAmountPaise: requestedPaise,
                commissionDeductionPaise: withdrawal?.commissionDeductionPaise,
                penaltyDeductionPaise: withdrawal?.penaltyDeductionPaise,
                penaltyReason: withdrawal?.penaltyReason,
                otherDeductionsPaise: withdrawal?.otherDeductionsPaise,
                netPayoutAmountPaise: netPaise,
              }}
            />

            <Divider />

            {/* Payout Mode */}
            <HStack spacing={4} align="flex-start">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="xs" fontWeight="700">
                  Payout Mode
                </FormLabel>
                <Select
                  size="sm"
                  borderRadius="8px"
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value)}
                  isDisabled={isSubmitting}
                >
                  <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
                  <option value="IMPS">IMPS (Immediate Payment Service)</option>
                  <option value="UPI">UPI (Unified Payments Interface)</option>
                  <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                </Select>
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel fontSize="xs" fontWeight="700">
                  Transfer Date & Time
                </FormLabel>
                <Input
                  type="datetime-local"
                  size="sm"
                  borderRadius="8px"
                  value={transferDateTime}
                  max={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setTransferDateTime(e.target.value)}
                  isDisabled={isSubmitting}
                />
                <FormHelperText fontSize="3xs">Must not be a future timestamp</FormHelperText>
              </FormControl>
            </HStack>

            {/* UTR Input */}
            <FormControl isRequired isInvalid={utr.length > 0 && !UTR_REGEX.test(utr.trim())}>
              <FormLabel fontSize="xs" fontWeight="700">
                Bank UTR / Transaction Reference Number
              </FormLabel>
              <Input
                size="sm"
                borderRadius="8px"
                fontFamily="mono"
                placeholder="e.g. HDFC202610150912345 or UPI/3284910283"
                value={utr}
                onChange={(e) => setUtr(e.target.value.toUpperCase())}
                isDisabled={isSubmitting}
                autoFocus
              />
              <FormHelperText fontSize="3xs">
                Unique bank transfer reference issued by your bank after executing the transaction
              </FormHelperText>
            </FormControl>

            {/* Confirmed Net Amount */}
            <FormControl isRequired isInvalid={parseFloat(confirmedAmount || 0) !== parseFloat(netRupees)}>
              <FormLabel fontSize="xs" fontWeight="700">
                Confirm Net Amount Transferred (₹)
              </FormLabel>
              <Input
                size="sm"
                borderRadius="8px"
                fontFamily="mono"
                fontWeight="700"
                value={confirmedAmount}
                onChange={(e) => setConfirmedAmount(e.target.value)}
                isDisabled={isSubmitting}
              />
              <FormHelperText fontSize="3xs">
                Must match exact approved net payable: ₹{netRupees}
              </FormHelperText>
            </FormControl>

            {/* Admin Notes */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">
                Audit Notes / Reference (Optional)
              </FormLabel>
              <Textarea
                size="sm"
                borderRadius="8px"
                rows={2}
                placeholder="Optional notes for financial audit (e.g. Bank Account: HDFC Current #9012)"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                isDisabled={isSubmitting}
              />
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
              colorScheme="teal"
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Recording Payment..."
              isDisabled={!utr.trim() || !UTR_REGEX.test(utr.trim()) || isSubmitting}
            >
              Confirm & Mark as Paid
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
