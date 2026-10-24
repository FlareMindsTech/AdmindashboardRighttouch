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
  Divider,
} from "@chakra-ui/react";
import { approveWithdrawal, approveManualPayout } from "api/wallet";
import FinancialBreakdown, { formatInr } from "./FinancialBreakdown";

export default function ApproveWithdrawalModal({
  isOpen,
  onClose,
  withdrawal,
  currentUser,
  onSuccess,
}) {
  const toast = useToast();

  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const requestedPaise =
    withdrawal?.requestedAmountPaise ??
    withdrawal?.amountPaise ??
    (withdrawal?.amount ? Math.round(withdrawal.amount * 100) : 0);

  // Check if dual approval applies (explicit flag or high-value threshold >= ₹50,000)
  const DUAL_APPROVAL_THRESHOLD_PAISE = 5000000; // ₹50,000
  const isHighValue = requestedPaise >= DUAL_APPROVAL_THRESHOLD_PAISE || (withdrawal?.amount >= 50000);
  const isDualApproval = Boolean(
    withdrawal?.requiresApproval ||
    withdrawal?.requiresDualApproval ||
    (withdrawal?.origin === "admin_direct" && isHighValue)
  );

  // Maker-checker segregation of duties: user cannot approve a withdrawal they initiated
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;
  const initiatorId =
    withdrawal?.initiatedBy?.actorId ||
    withdrawal?.initiatedBy?._id ||
    withdrawal?.initiatedBy?.id ||
    withdrawal?.initiatedBy ||
    withdrawal?.createdBy;
  const isInitiator = Boolean(
    initiatorId &&
    currentUserId &&
    String(initiatorId) === String(currentUserId)
  );

  // Calculate live preview
  const penaltyPaise = Math.round(parseFloat(penaltyAmount || 0) * 100);
  const commissionPaise = Math.round(parseFloat(commissionAmount || 0) * 100);
  const otherPaise = Math.round(parseFloat(otherDeductions || 0) * 100);
  const totalDeductionsPaise = penaltyPaise + commissionPaise + otherPaise;
  const netPaise = requestedPaise - totalDeductionsPaise;

  useEffect(() => {
    if (isOpen) {
      setPenaltyAmount("");
      setPenaltyReason("");
      setCommissionAmount("");
      setOtherDeductions("");
      setAdminNote("");
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (isInitiator) {
      setErrorMsg("Dual control violation: You initiated this admin-direct payout and cannot approve it yourself. A second administrator must approve it.");
      return;
    }

    if (penaltyPaise > 0 && (!penaltyReason || !penaltyReason.trim())) {
      setErrorMsg("Penalty reason is required when applying a penalty reduction.");
      return;
    }

    if (totalDeductionsPaise >= requestedPaise) {
      setErrorMsg("Total deductions cannot exceed or equal the requested withdrawal amount. The net payout must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        penaltyPaise: penaltyPaise > 0 ? penaltyPaise : 0,
        penaltyAmount: penaltyPaise > 0 ? penaltyPaise / 100 : 0,
        penaltyReason: penaltyReason.trim() || undefined,
        commissionPaise: commissionPaise > 0 ? commissionPaise : 0,
        commissionAmount: commissionPaise > 0 ? commissionPaise / 100 : 0,
        otherDeductionsPaise: otherPaise > 0 ? otherPaise : 0,
        otherDeductions: otherPaise > 0 ? otherPaise / 100 : 0,
        adminNote: adminNote.trim() || undefined,
      };

      let res;
      if (isDualApproval) {
        res = await approveManualPayout(withdrawal._id, payload);
      } else {
        res = await approveWithdrawal(withdrawal._id, payload);
      }

      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: isDualApproval ? "Dual Approval Confirmed" : "Withdrawal Approved",
        description: `Approved net amount of ${formatInr(netPaise)}. Payout is now ready for manual bank transfer.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to approve withdrawal.");
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
        <ModalHeader bg="blue.700" color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                {isDualApproval ? "Approve High-Value Admin Payout (Dual Control)" : "Approve Withdrawal Request"}
              </Text>
              <Text fontSize="2xs" color="blue.100" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
            <Badge colorScheme={isDualApproval ? "purple" : "blue"} px={2.5} py={1} borderRadius="full" fontSize="2xs">
              {isDualApproval ? "DUAL APPROVAL" : "ADMIN APPROVAL"}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            {isInitiator && (
              <Alert status="error" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <Box>
                  <AlertTitle fontWeight="700">Self-Approval Prohibited</AlertTitle>
                  <AlertDescription>
                    You initiated this payout. Company financial governance mandates that a different administrator must provide second-admin approval.
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

            {/* Financial Breakdown Live Preview */}
            <FinancialBreakdown
              financials={{
                requestedAmountPaise: requestedPaise,
                commissionDeductionPaise: commissionPaise,
                penaltyDeductionPaise: penaltyPaise,
                penaltyReason,
                otherDeductionsPaise: otherPaise,
                netPayoutAmountPaise: netPaise,
              }}
            />

            <Divider />

            <Text fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase">
              Optional Deductions & Adjustments
            </Text>

            <HStack spacing={4} align="flex-start">
              <FormControl flex={1}>
                <FormLabel fontSize="xs" fontWeight="600">
                  Penalty Deduction (₹)
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="8px"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  isDisabled={isSubmitting || isInitiator}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontSize="xs" fontWeight="600">
                  Commission Deduction (₹)
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="8px"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  isDisabled={isSubmitting || isInitiator}
                />
              </FormControl>
            </HStack>

            {penaltyPaise > 0 && (
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600">
                  Penalty Reason
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="8px"
                  placeholder="Reason for penalty (e.g. Job re-acceptance or no-show)"
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  isDisabled={isSubmitting || isInitiator}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600">
                Decision Note
              </FormLabel>
              <Textarea
                size="sm"
                borderRadius="8px"
                rows={2}
                placeholder="Optional decision note for audit logs"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                isDisabled={isSubmitting || isInitiator}
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
              colorScheme="blue"
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Approving..."
              isDisabled={isInitiator || netPaise <= 0 || (penaltyPaise > 0 && !penaltyReason.trim()) || isSubmitting}
            >
              Confirm Approval ({formatInr(netPaise)})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
