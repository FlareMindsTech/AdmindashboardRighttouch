import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import {
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
  SimpleGrid,
  Flex,
  IconButton,
  Tooltip,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaCopy,
  FaUniversity,
} from "react-icons/fa";
import { markWithdrawalPaid } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

const UTR_REGEX = /^[A-Za-z0-9_-]{6,50}$/;

export default function RecordBankTransferModal({
  isOpen,
  onClose,
  withdrawal,
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

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
      setErrorMsg(
        "UTR must be 6 to 50 alphanumeric characters (letters, numbers, hyphens, underscores)."
      );
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

    // 3. Validate Confirmed Amount
    const enteredAmt = parseFloat(confirmedAmount);
    if (isNaN(enteredAmt) || enteredAmt <= 0) {
      setErrorMsg("Confirmed amount must be a positive number.");
      return;
    }

    const expectedRupees = netPaise / 100;
    if (Math.abs(enteredAmt - expectedRupees) > 0.01) {
      setErrorMsg(
        `Confirmed amount (₹${enteredAmt.toFixed(2)}) does not match net payable amount (₹${expectedRupees.toFixed(2)}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        utr: trimmedUtr,
        payoutMode,
        transferDate: transferDate.toISOString(),
        confirmedAmountPaise: netPaise,
        adminNote: adminNote.trim() || undefined,
      };

      const { data, error } = await markWithdrawalPaid(withdrawal._id, payload);

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Bank Transfer Recorded",
        description: `Disbursement #${withdrawal._id} recorded as paid with UTR ${trimmedUtr}. Reserve released & ledger debited.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to record bank transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const techName =
    withdrawal?.technician?.name ||
    withdrawal?.technicianName ||
    (withdrawal?.technicianId?.userId?.fname
      ? `${withdrawal?.technicianId?.userId?.fname} ${withdrawal?.technicianId?.userId?.lname || ""}`.trim()
      : "Technician");

  const bank =
    withdrawal?.bankDetails ||
    withdrawal?.technician?.bankDetails ||
    withdrawal?.technicianId?.bankDetails ||
    {};
  const beneficiaryName = bank.accountHolderName || techName;
  const accountNumber = bank.accountNumber || withdrawal?.payoutDestination || "";
  const ifscCode = bank.ifscCode || "";
  const bankName = bank.bankName || "";
  const upiId = bank.upiId || "";

  const isUtrValid = UTR_REGEX.test(utr.trim());

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      maxW={{ base: "96vw", md: "960px", lg: "1100px", xl: "1180px" }}
      bodyMaxH="78vh"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      headerBg="teal.800"
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="teal.700"
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={FaUniversity} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                Record Manual Bank Transfer
              </Text>
              <Text fontSize="xs" color="teal.200" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
          </HStack>
          <Badge
            colorScheme="orange"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="800"
          >
            OFFLINE DISBURSEMENT
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            Recording UTR releases reserved funds and marks payout as settled.
          </Text>
          <HStack spacing={3}>
            <Button size="md" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="md"
              colorScheme="teal"
              bg="teal.600"
              _hover={{ bg: "teal.700" }}
              fontWeight="800"
              px={6}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Recording Payment..."
              isDisabled={!isUtrValid || isSubmitting}
            >
              Confirm & Mark as Paid ({formatInr(netPaise)})
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={1}>
        {/* Safety Header Alert */}
        <Alert status="warning" borderRadius="12px" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle fontWeight="800" fontSize="sm">
              Bank Portal Execution Required
            </AlertTitle>
            <AlertDescription fontSize="xs">
              Execute the bank or UPI transfer in your banking portal using the beneficiary credentials below. Once completed, enter the authentic Bank Reference / UTR to settle the record.
            </AlertDescription>
          </Box>
        </Alert>

        {errorMsg && (
          <Alert status="error" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* 2-Column Responsive Layout */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* ================= LEFT COLUMN: BENEFICIARY DETAILS ================= */}
          <VStack spacing={4} align="stretch">
            {/* Step 1 Pill */}
            <HStack spacing={2}>
              <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="3xs">
                STEP 1
              </Badge>
              <Text fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                Beneficiary Transfer Details
              </Text>
            </HStack>

            {/* Quick-Copy Beneficiary Card */}
            <Box
              p={4}
              borderRadius="16px"
              bg={isDark ? "gray.800" : "blue.50"}
              border="1.5px solid"
              borderColor={isDark ? "gray.700" : "blue.200"}
            >
              <HStack justify="space-between" mb={3}>
                <HStack spacing={2}>
                  <Icon as={FaUniversity} color="blue.600" boxSize={4} />
                  <Text fontSize="xs" fontWeight="800" color={isDark ? "blue.200" : "blue.900"} textTransform="uppercase">
                    Destination Bank / VPA
                  </Text>
                </HStack>
                {bank.bankVerified ? (
                  <Badge colorScheme="green" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                    KYC Verified
                  </Badge>
                ) : (
                  <Badge colorScheme="yellow" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                    Unverified
                  </Badge>
                )}
              </HStack>

              <VStack spacing={2.5} align="stretch" fontSize="xs">
                {/* Beneficiary Name */}
                <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px" border="1px solid" borderColor={isDark ? "gray.700" : "blue.100"}>
                  <Text fontSize="3xs" color="gray.500" fontWeight="600" textTransform="uppercase">Beneficiary Name</Text>
                  <HStack justify="space-between" mt={0.5}>
                    <Text fontWeight="800" color={isDark ? "white" : "gray.800"}>{beneficiaryName}</Text>
                    <Tooltip label="Copy Name">
                      <IconButton
                        size="xs"
                        icon={<FaCopy />}
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => copyToClipboard(beneficiaryName, "Beneficiary Name")}
                        aria-label="Copy Name"
                      />
                    </Tooltip>
                  </HStack>
                </Box>

                {/* Account Number */}
                <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px" border="1px solid" borderColor={isDark ? "gray.700" : "blue.100"}>
                  <Text fontSize="3xs" color="gray.500" fontWeight="600" textTransform="uppercase">Account Number</Text>
                  <HStack justify="space-between" mt={0.5}>
                    <Text fontWeight="800" fontFamily="mono" fontSize="sm" color={isDark ? "white" : "gray.800"}>
                      {accountNumber || "Not Linked"}
                    </Text>
                    {accountNumber && (
                      <Tooltip label="Copy Account Number">
                        <IconButton
                          size="xs"
                          icon={<FaCopy />}
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => copyToClipboard(accountNumber, "Account Number")}
                          aria-label="Copy Account Number"
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Box>

                {/* IFSC & Bank Name */}
                <SimpleGrid columns={2} spacing={2}>
                  <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px" border="1px solid" borderColor={isDark ? "gray.700" : "blue.100"}>
                    <Text fontSize="3xs" color="gray.500" fontWeight="600" textTransform="uppercase">IFSC Code</Text>
                    <HStack justify="space-between" mt={0.5}>
                      <Text fontWeight="800" fontFamily="mono" color={isDark ? "white" : "gray.800"}>
                        {ifscCode || "—"}
                      </Text>
                      {ifscCode && (
                        <Tooltip label="Copy IFSC">
                          <IconButton
                            size="xs"
                            icon={<FaCopy />}
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => copyToClipboard(ifscCode, "IFSC Code")}
                            aria-label="Copy IFSC"
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Box>
                  <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px" border="1px solid" borderColor={isDark ? "gray.700" : "blue.100"}>
                    <Text fontSize="3xs" color="gray.500" fontWeight="600" textTransform="uppercase">Bank Name</Text>
                    <Text fontWeight="800" mt={0.5} noOfLines={1} color={isDark ? "white" : "gray.800"}>
                      {bankName || "NEFT Transfer"}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* UPI VPA (if present) */}
                {upiId && (
                  <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px" border="1px solid" borderColor={isDark ? "gray.700" : "blue.100"}>
                    <Text fontSize="3xs" color="gray.500" fontWeight="600" textTransform="uppercase">UPI ID (VPA)</Text>
                    <HStack justify="space-between" mt={0.5}>
                      <Text fontWeight="800" fontFamily="mono" color={isDark ? "white" : "gray.800"}>{upiId}</Text>
                      <Tooltip label="Copy UPI ID">
                        <IconButton
                          size="xs"
                          icon={<FaCopy />}
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => copyToClipboard(upiId, "UPI ID")}
                          aria-label="Copy UPI ID"
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Net Amount Callout Card */}
            <Box
              p={4}
              borderRadius="14px"
              bg="teal.50"
              border="2px solid"
              borderColor="teal.300"
              textAlign="center"
            >
              <Text fontSize="2xs" fontWeight="800" color="teal.800" textTransform="uppercase" letterSpacing="0.5px">
                Exact Transfer Amount
              </Text>
              <Text fontSize="3xl" fontWeight="900" color="teal.700" my={1}>
                {formatInr(netPaise)}
              </Text>
              <HStack justify="center" spacing={2}>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<FaCopy />}
                  onClick={() => copyToClipboard(netRupees, "Disbursement Amount")}
                >
                  Copy ₹{netRupees}
                </Button>
              </HStack>
            </Box>
          </VStack>

          {/* ================= RIGHT COLUMN: RECORDING FORM ================= */}
          <VStack spacing={4} align="stretch">
            {/* Step 2 Pill */}
            <HStack spacing={2}>
              <Badge colorScheme="teal" borderRadius="full" px={2.5} py={0.5} fontSize="3xs">
                STEP 2
              </Badge>
              <Text fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                Enter Transfer Reference
              </Text>
            </HStack>

            <Box
              p={4}
              borderRadius="16px"
              bg={isDark ? "gray.800" : "gray.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              {/* UTR Input */}
              <FormControl isRequired isInvalid={utr.length > 0 && !isUtrValid} mb={4}>
                <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
                  Bank Reference Number / UTR
                </FormLabel>
                <Input
                  size="md"
                  borderRadius="10px"
                  fontFamily="mono"
                  fontSize="md"
                  fontWeight="700"
                  placeholder="e.g. CMS1234567890 or 202611061234"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.toUpperCase())}
                  isDisabled={isSubmitting}
                  autoFocus
                />
                <FormHelperText fontSize="3xs">
                  Must be 6–50 alphanumeric characters provided by your bank receipt.
                </FormHelperText>
              </FormControl>

              {/* Payout Mode & Date Grid */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Payment Mode
                  </FormLabel>
                  <Select
                    size="md"
                    borderRadius="10px"
                    value={payoutMode}
                    onChange={(e) => setPayoutMode(e.target.value)}
                    isDisabled={isSubmitting}
                    fontWeight="600"
                  >
                    <option value="NEFT">NEFT (National Electronic Fund)</option>
                    <option value="IMPS">IMPS (Immediate Payment)</option>
                    <option value="RTGS">RTGS (Real Time Gross)</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="DIRECT_BANK_TRANSFER">Bank Portal Transfer</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Transfer Date & Time
                  </FormLabel>
                  <Input
                    size="md"
                    borderRadius="10px"
                    type="datetime-local"
                    value={transferDateTime}
                    onChange={(e) => setTransferDateTime(e.target.value)}
                    isDisabled={isSubmitting}
                    fontSize="xs"
                  />
                </FormControl>
              </SimpleGrid>

              {/* Confirmed Amount Verification */}
              <FormControl isRequired mb={4}>
                <FormLabel fontSize="xs" fontWeight="700">
                  Confirmed Disbursed Amount (₹)
                </FormLabel>
                <Input
                  size="md"
                  borderRadius="10px"
                  type="number"
                  step="0.01"
                  value={confirmedAmount}
                  onChange={(e) => setConfirmedAmount(e.target.value)}
                  isDisabled={isSubmitting}
                  fontWeight="700"
                  fontSize="md"
                />
                <FormHelperText fontSize="3xs">
                  Must match expected net amount of ₹{netRupees} exactly.
                </FormHelperText>
              </FormControl>

              {/* Administrative Accounting Note */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700">
                  Accounting Note / Reference
                </FormLabel>
                <Textarea
                  size="md"
                  borderRadius="10px"
                  rows={2}
                  placeholder="Optional internal remarks (e.g. Processed via HDFC Corporate Banking)..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  isDisabled={isSubmitting}
                  fontSize="xs"
                />
              </FormControl>
            </Box>
          </VStack>
        </SimpleGrid>
      </VStack>
    </AppModal>
  );
}

RecordBankTransferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  withdrawal: PropTypes.object,
  onSuccess: PropTypes.func,
};
