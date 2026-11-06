import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import {
  Button,
  VStack,
  HStack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  Divider,
  SimpleGrid,
  Avatar,
  Icon,
  Wrap,
  WrapItem,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaRupeeSign,
  FaShieldAlt,
} from "react-icons/fa";
import { approveWithdrawal, approveManualPayout } from "api/wallet";
import FinancialBreakdown, { formatInr } from "./FinancialBreakdown";

const PENALTY_PRESETS = [0, 100, 250, 500, 1000];

export default function ApproveWithdrawalModal({
  isOpen,
  onClose,
  withdrawal,
  currentUser,
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

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

  // Check if dual approval applies (explicit flag or high-value threshold >= ₹10,000)
  const DUAL_APPROVAL_THRESHOLD_PAISE = 1000000; // ₹10,000 as per global specification
  const isHighValue =
    requestedPaise >= DUAL_APPROVAL_THRESHOLD_PAISE ||
    (withdrawal?.amount != null && withdrawal.amount >= 10000);
  const isDualApproval = Boolean(
    withdrawal?.requiresApproval ||
    withdrawal?.requiresDualApproval ||
    (withdrawal?.origin === "admin_direct" && isHighValue)
  );

  // Maker-checker segregation of duties: user cannot approve a withdrawal they initiated
  const currentUserId =
    currentUser?._id || currentUser?.id || currentUser?.userId;
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
      setErrorMsg(
        "Dual control violation: You initiated this admin-direct payout and cannot approve it yourself. A second administrator must approve it."
      );
      return;
    }

    if (penaltyPaise > 0 && (!penaltyReason || !penaltyReason.trim())) {
      setErrorMsg("Penalty reason is required when applying a penalty reduction.");
      return;
    }

    if (netPaise <= 0) {
      setErrorMsg("Net payable payout amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (withdrawal?.origin === "admin_direct" && isDualApproval) {
        // High-value admin direct payout dual-approval endpoint
        result = await approveManualPayout(withdrawal._id, {
          adminNote: adminNote.trim() || undefined,
        });
      } else {
        // Standard technician request approval with optional deductions
        const payload = {
          penaltyDeductionPaise: penaltyPaise,
          penaltyReason: penaltyPaise > 0 ? penaltyReason.trim() : undefined,
          commissionDeductionPaise: commissionPaise,
          otherDeductionsPaise: otherPaise,
          adminNote: adminNote.trim() || undefined,
        };
        result = await approveWithdrawal(withdrawal._id, payload);
      }

      const { data, error } = result;

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: isDualApproval ? "Dual Approval Granted" : "Withdrawal Approved",
        description: `Disbursement of ${formatInr(netPaise)} is approved. Now ready for offline bank transfer.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
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
    (withdrawal?.technicianId?.userId?.fname
      ? `${withdrawal?.technicianId?.userId?.fname} ${withdrawal?.technicianId?.userId?.lname || ""}`.trim()
      : "Technician");

  const techPhone =
    withdrawal?.technician?.phone ||
    withdrawal?.technicianId?.userId?.mobileNumber ||
    withdrawal?.technicianId?.mobileNumber ||
    "";

  const bank =
    withdrawal?.bankDetails ||
    withdrawal?.technician?.bankDetails ||
    withdrawal?.technicianId?.bankDetails ||
    {};
  const rawAcc = String(bank?.accountNumber || withdrawal?.payoutDestination || "").replace(/\s/g, "");
  const maskedAcc = rawAcc.length >= 4 ? `••••${rawAcc.slice(-4)}` : rawAcc || "Not linked";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      maxW={{ base: "96vw", md: "960px", lg: "1100px", xl: "1180px" }}
      bodyMaxH="78vh"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      headerBg="blue.800"
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="blue.700"
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={isDualApproval ? FaShieldAlt : FaCheckCircle} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                {isDualApproval
                  ? "Dual-Control Payout Approval"
                  : "Approve Withdrawal Request"}
              </Text>
              <Text fontSize="xs" color="blue.200" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
          </HStack>
          <Badge
            colorScheme={isDualApproval ? "purple" : "blue"}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="800"
          >
            {isDualApproval ? "DUAL APPROVAL (MAKER-CHECKER)" : "ADMIN APPROVAL"}
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            {isDualApproval
              ? "Second admin confirmation authorizes bank transfer release."
              : "Approval locks net amount and transitions payout to 'Ready to Pay'."}
          </Text>
          <HStack spacing={3}>
            <Button size="md" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="md"
              colorScheme="blue"
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              fontWeight="800"
              px={6}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Approving..."
              isDisabled={
                isInitiator ||
                netPaise <= 0 ||
                (penaltyPaise > 0 && !penaltyReason.trim()) ||
                isSubmitting
              }
            >
              Confirm Approval ({formatInr(netPaise)})
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={1}>
        {/* Initiator Violation Alert */}
        {isInitiator && (
          <Alert status="error" borderRadius="12px" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle fontWeight="800" fontSize="sm">
                Maker-Checker Segregation Violation
              </AlertTitle>
              <AlertDescription fontSize="xs">
                You initiated this direct payout. Company financial governance strictly requires that a different administrator approve it.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Dual Approval Advisory Alert */}
        {isDualApproval && !isInitiator && (
          <Alert status="info" borderRadius="12px" variant="left-accent" bg="purple.50" borderColor="purple.500">
            <AlertIcon as={FaShieldAlt} color="purple.600" />
            <Box>
              <AlertTitle fontWeight="800" fontSize="sm" color="purple.900">
                Maker-Checker Verification Mode
              </AlertTitle>
              <AlertDescription fontSize="xs" color="purple.800">
                This transaction exceeds the dual-approval threshold of ₹10,000. Your approval acts as the second-admin authorization.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <Alert status="error" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* 2-Column Responsive Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* ================= LEFT COLUMN: SUMMARY & BREAKDOWN ================= */}
          <VStack spacing={4} align="stretch">
            {/* Technician & Account Card */}
            <Box
              p={4}
              borderRadius="14px"
              bg={isDark ? "gray.800" : "blue.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "blue.200"}
            >
              <HStack spacing={3} mb={3}>
                <Avatar size="sm" name={techName} bg="blue.600" color="white" fontWeight="700" />
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="800">
                    {techName}
                  </Text>
                  <Text fontSize="2xs" color="gray.500">
                    {techPhone ? `Phone: ${techPhone}` : `Origin: ${withdrawal?.origin || "technician_request"}`}
                  </Text>
                </Box>
                <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                  Verified
                </Badge>
              </HStack>

              <Divider borderColor={isDark ? "gray.700" : "blue.200"} mb={3} />

              <SimpleGrid columns={2} spacing={2.5} fontSize="2xs">
                <Box>
                  <Text color="gray.500">Bank / Mode</Text>
                  <Text fontWeight="700">{bank.bankName || "Bank Transfer"}</Text>
                </Box>
                <Box>
                  <Text color="gray.500">Account / VPA</Text>
                  <Text fontWeight="700" fontFamily="mono">{maskedAcc}</Text>
                </Box>
                <Box>
                  <Text color="gray.500">IFSC Code</Text>
                  <Text fontWeight="700" fontFamily="mono">{bank.ifscCode || "—"}</Text>
                </Box>
                <Box>
                  <Text color="gray.500">Gross Requested</Text>
                  <Text fontWeight="800" color="blue.600">{formatInr(requestedPaise)}</Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Live Financial Calculation Card */}
            <Box>
              <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.500" mb={2}>
                Live Financial Calculation
              </Text>
              <FinancialBreakdown
                financials={{
                  requestedAmountPaise: requestedPaise,
                  commissionDeductionPaise: commissionPaise,
                  penaltyDeductionPaise: penaltyPaise,
                  penaltyReason,
                  otherDeductionsPaise: otherPaise,
                  netPayoutAmountPaise: netPaise,
                }}
                isDark={isDark}
              />
            </Box>

            {/* Net Amount Callout */}
            <Box
              p={3.5}
              borderRadius="12px"
              bg={netPaise > 0 ? "green.50" : "red.50"}
              border="1.5px solid"
              borderColor={netPaise > 0 ? "green.300" : "red.300"}
              textAlign="center"
            >
              <Text fontSize="2xs" fontWeight="700" textTransform="uppercase" color={netPaise > 0 ? "green.700" : "red.700"}>
                Net Amount To Be Disbursed
              </Text>
              <Text fontSize="2xl" fontWeight="900" color={netPaise > 0 ? "green.700" : "red.700"}>
                {formatInr(netPaise)}
              </Text>
            </Box>
          </VStack>

          {/* ================= RIGHT COLUMN: ADJUSTMENTS & NOTES ================= */}
          <VStack spacing={4} align="stretch">
            <Box
              p={4}
              borderRadius="14px"
              bg={isDark ? "gray.800" : "gray.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.600" mb={3}>
                Adjustments & Deductions
              </Text>

              {/* Penalty Deduction */}
              <FormControl mb={3}>
                <FormLabel fontSize="xs" fontWeight="700">
                  Penalty Deduction (₹)
                </FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaRupeeSign} color="red.500" />
                  </InputLeftElement>
                  <Input
                    borderRadius="10px"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    isDisabled={isSubmitting || isInitiator}
                    fontWeight="700"
                  />
                </InputGroup>

                {/* Preset Chips */}
                <Wrap spacing={1.5} mt={2}>
                  {PENALTY_PRESETS.map((amt) => (
                    <WrapItem key={amt}>
                      <Button
                        size="xs"
                        variant={parseFloat(penaltyAmount || 0) === amt ? "solid" : "outline"}
                        colorScheme="red"
                        borderRadius="full"
                        onClick={() => setPenaltyAmount(amt > 0 ? String(amt) : "")}
                        isDisabled={isSubmitting || isInitiator}
                      >
                        ₹{amt}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>

              {/* Penalty Reason (Mandatory if penalty > 0) */}
              {penaltyPaise > 0 && (
                <FormControl isRequired mb={3}>
                  <FormLabel fontSize="xs" fontWeight="700" color="red.600">
                    Penalty Reason (Audited & Notified)
                  </FormLabel>
                  <Input
                    size="md"
                    borderRadius="10px"
                    placeholder="e.g. Job no-show or late customer cancellation penalty"
                    value={penaltyReason}
                    onChange={(e) => setPenaltyReason(e.target.value)}
                    isDisabled={isSubmitting || isInitiator}
                    fontWeight="600"
                    borderColor="red.300"
                  />
                </FormControl>
              )}

              {/* Commission Deduction */}
              <FormControl mb={3}>
                <FormLabel fontSize="xs" fontWeight="700">
                  Commission Deduction (₹)
                </FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaRupeeSign} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    borderRadius="10px"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={commissionAmount}
                    onChange={(e) => setCommissionAmount(e.target.value)}
                    isDisabled={isSubmitting || isInitiator}
                    fontWeight="600"
                  />
                </InputGroup>
              </FormControl>

              {/* Other Deductions */}
              <FormControl mb={3}>
                <FormLabel fontSize="xs" fontWeight="700">
                  Other Adjustments (₹)
                </FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaRupeeSign} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    borderRadius="10px"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(e.target.value)}
                    isDisabled={isSubmitting || isInitiator}
                    fontWeight="600"
                  />
                </InputGroup>
              </FormControl>
            </Box>

            {/* Decision Note */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
                Approval Note (Internal Audit Log)
              </FormLabel>
              <Textarea
                size="md"
                borderRadius="10px"
                rows={3}
                placeholder="Optional approval commentary for internal tracking..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                isDisabled={isSubmitting || isInitiator}
                fontSize="xs"
              />
            </FormControl>
          </VStack>
        </SimpleGrid>
      </VStack>
    </AppModal>
  );
}

ApproveWithdrawalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  withdrawal: PropTypes.object,
  currentUser: PropTypes.object,
  onSuccess: PropTypes.func,
};
