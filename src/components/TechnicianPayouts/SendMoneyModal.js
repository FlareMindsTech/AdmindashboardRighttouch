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
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  Box,
  Badge,
  Spinner,
  SimpleGrid,
  Avatar,
  Icon,
  Wrap,
  WrapItem,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaPaperPlane,
  FaRupeeSign,
  FaUniversity,
  FaUser,
} from "react-icons/fa";
import { sendMoneyToTechnician, getTechnicianWalletOverview } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

const DUAL_APPROVAL_RUPEES = 10000; // Dual approval threshold (₹10,000)

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function SendMoneyModal({
  isOpen,
  onClose,
  technicians = [],
  initialTechnicianId = "",
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [selectedTechId, setSelectedTechId] = useState(initialTechnicianId || "");
  const [amountRupees, setAmountRupees] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletOverview, setWalletOverview] = useState(null);

  const numAmount = parseFloat(amountRupees || 0);
  const isHighValue = numAmount >= DUAL_APPROVAL_RUPEES;
  const amountPaise = Math.round(numAmount * 100);

  const selectedTech = technicians.find(
    (t) => String(t._id || t.id || t.technicianId) === String(selectedTechId)
  );

  // Live authoritative balance from wallet overview (or fallback if pending fetch)
  const availablePaise =
    walletOverview?.wallet?.availableBalancePaise ??
    (selectedTech?.availableBalancePaise ?? null);

  const reservedPaise =
    walletOverview?.wallet?.reservedBalancePaise ??
    (selectedTech?.reservedBalancePaise ?? 0);

  const maintenanceFloorPaise =
    walletOverview?.eligibility?.minimumMaintenancePaise ?? 10000;

  const maxSpendablePaise = Math.max(0, (availablePaise ?? 0) - maintenanceFloorPaise);

  const isPayoutBlocked =
    walletOverview?.eligibility?.payoutBlocked ??
    (selectedTech?.payoutBlocked || false);

  const activeWithdrawal = walletOverview?.activeWithdrawal || null;
  const bank = walletOverview?.eligibility?.bankDetails || walletOverview?.bankDetails || {};
  const rawAcc = String(bank?.accountNumber || selectedTech?.payoutDestination || "").replace(/\s/g, "");
  const maskedAcc = rawAcc.length >= 4 ? `••••${rawAcc.slice(-4)}` : rawAcc || "Not linked";

  useEffect(() => {
    if (isOpen) {
      setSelectedTechId(initialTechnicianId || "");
      setAmountRupees("");
      setReason("");
      setErrorMsg("");
      setIsSubmitting(false);
      setWalletOverview(null);
    }
  }, [isOpen, initialTechnicianId]);

  // Asynchronously fetch authoritative wallet overview when technician is selected
  useEffect(() => {
    let isMounted = true;
    if (selectedTechId) {
      setWalletLoading(true);
      setWalletOverview(null);
      getTechnicianWalletOverview(selectedTechId)
        .then(({ data, error }) => {
          if (!isMounted) return;
          if (data) {
            setWalletOverview(data?.result || data);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch technician wallet overview:", err);
        })
        .finally(() => {
          if (isMounted) setWalletLoading(false);
        });
    } else {
      setWalletOverview(null);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedTechId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!selectedTechId) {
      setErrorMsg("Please select a technician from the list.");
      return;
    }

    if (isPayoutBlocked) {
      setErrorMsg("Technician payouts are currently frozen under an administrative hold. Cannot initiate direct payout.");
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid payout amount greater than ₹0.");
      return;
    }

    if (availablePaise !== null && amountPaise > availablePaise) {
      setErrorMsg(
        `Insufficient technician balance. Available spendable balance is ${formatInr(availablePaise)}.`
      );
      return;
    }

    if (!reason.trim()) {
      setErrorMsg("A detailed audit reason is required for administrator-initiated manual disbursements.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        technicianId: selectedTechId,
        amount: numAmount,
        amountPaise,
        reason: reason.trim(),
        clientIdempotencyKey: `admin-direct-${selectedTechId}-${Date.now()}`,
      };

      const { data, error } = await sendMoneyToTechnician(selectedTechId, payload);

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: isHighValue ? "High-Value Payout Initiated" : "Direct Payout Created",
        description: isHighValue
          ? `Disbursement of ₹${numAmount.toLocaleString("en-IN")} requires second-admin approval before transfer.`
          : `Disbursement of ₹${numAmount.toLocaleString("en-IN")} is approved and ready for offline transfer.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to initiate admin payout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTechName =
    selectedTech?.name ||
    (selectedTech?.userId?.fname
      ? `${selectedTech.userId.fname} ${selectedTech.userId.lname || ""}`.trim()
      : selectedTech?.fname || "Technician");

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
              w="38px"
              h="38px"
              borderRadius="10px"
              bg="teal.700"
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={FaPaperPlane} boxSize={4} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                Direct Admin Payout (Send Money)
              </Text>
              <Text fontSize="xs" color="teal.200">
                Initiate a manual wallet settlement on behalf of a technician
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="2xs" fontWeight="800">
            ADMIN DIRECT
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            {isHighValue ? "Dual-approval workflow will be triggered (≥ ₹10,000)" : "Will be ready for bank transfer immediately"}
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
              loadingText="Initiating..."
              isDisabled={!selectedTechId || numAmount <= 0 || !reason.trim() || isSubmitting}
            >
              Initiate Direct Payout {numAmount > 0 ? `(${formatInr(amountPaise)})` : ""}
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={2}>
        {/* Error Banner */}
        {errorMsg && (
          <Alert status="error" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* 2-Column Responsive Layout */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* ================= LEFT COLUMN: CONFIGURATION ================= */}
          <VStack spacing={4} align="stretch">
            {/* Select Technician */}
            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
                Select Technician
              </FormLabel>
              <Select
                size="md"
                borderRadius="10px"
                placeholder="Choose technician to pay..."
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                isDisabled={isSubmitting}
                fontWeight="600"
              >
                {technicians.map((t) => {
                  const id = t._id || t.id || t.technicianId;
                  const name =
                    t.name ||
                    (t.userId?.fname ? `${t.userId.fname} ${t.userId.lname || ""}`.trim() : "") ||
                    t.fname ||
                    "Technician";
                  const phone = t.userId?.mobileNumber || t.mobileNumber || "";
                  const bal = formatInr(
                    t.availableBalancePaise ?? (t.walletBalance ? Math.round(t.walletBalance * 100) : 0)
                  );
                  return (
                    <option key={id} value={id}>
                      {name} {phone ? `(${phone})` : ""} — {bal}
                    </option>
                  );
                })}
              </Select>
            </FormControl>

            {/* Payout Amount */}
            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
                Payout Amount (₹)
              </FormLabel>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaRupeeSign} color="teal.500" />
                </InputLeftElement>
                <Input
                  borderRadius="10px"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter disbursement amount..."
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  isDisabled={isSubmitting}
                  fontWeight="700"
                  fontSize="md"
                />
              </InputGroup>

              {/* Quick Amount Chips */}
              <Box mt={2}>
                <Text fontSize="3xs" color="gray.500" mb={1.5} fontWeight="600">
                  Quick Amount Presets:
                </Text>
                <Wrap spacing={1.5}>
                  {QUICK_AMOUNTS.map((amt) => (
                    <WrapItem key={amt}>
                      <Button
                        size="xs"
                        variant={numAmount === amt ? "solid" : "outline"}
                        colorScheme="teal"
                        borderRadius="full"
                        onClick={() => setAmountRupees(String(amt))}
                        isDisabled={isSubmitting}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </Button>
                    </WrapItem>
                  ))}
                  {maxSpendablePaise > 0 && (
                    <WrapItem>
                      <Button
                        size="xs"
                        variant="subtle"
                        colorScheme="green"
                        borderRadius="full"
                        onClick={() => setAmountRupees(String(maxSpendablePaise / 100))}
                        isDisabled={isSubmitting}
                      >
                        Max Available (₹{(maxSpendablePaise / 100).toFixed(0)})
                      </Button>
                    </WrapItem>
                  )}
                </Wrap>
              </Box>
              <FormHelperText fontSize="3xs">
                Funds will be reserved from available balance immediately at creation.
              </FormHelperText>
            </FormControl>

            {/* Reason */}
            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
                Audit Reason / Settlement Note
              </FormLabel>
              <Textarea
                size="md"
                borderRadius="10px"
                rows={3}
                placeholder="Specify reason (e.g. Weekly performance incentive, offline bank adjustment, urgent advance)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                isDisabled={isSubmitting}
                fontSize="xs"
              />
            </FormControl>
          </VStack>

          {/* ================= RIGHT COLUMN: LIVE LIQUIDITY & COMPLIANCE ================= */}
          <VStack spacing={4} align="stretch">
            {selectedTech ? (
              <Box
                p={4}
                borderRadius="16px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                {/* Tech Header */}
                <HStack spacing={3} mb={3.5}>
                  <Avatar size="sm" name={selectedTechName} bg="teal.600" color="white" fontWeight="700" />
                  <Box flex={1}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="800" noOfLines={1}>
                        {selectedTechName}
                      </Text>
                      {isPayoutBlocked ? (
                        <Badge colorScheme="red" fontSize="3xs" px={2} borderRadius="full">
                          FROZEN
                        </Badge>
                      ) : (
                        <Badge colorScheme="green" fontSize="3xs" px={2} borderRadius="full">
                          KYC ACTIVE
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="2xs" color="gray.500">
                      {selectedTech.userId?.mobileNumber || selectedTech.mobileNumber || "No phone linked"}
                    </Text>
                  </Box>
                </HStack>

                <Divider mb={3.5} />

                {/* Balances Grid */}
                <SimpleGrid columns={2} spacing={3} mb={3.5}>
                  <Box
                    p={2.5}
                    borderRadius="10px"
                    bg={isDark ? "gray.750" : "white"}
                    border="1px solid"
                    borderColor={isDark ? "gray.600" : "gray.200"}
                  >
                    <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                      Available Balance
                    </Text>
                    {walletLoading ? (
                      <HStack spacing={1} mt={1}>
                        <Spinner size="xs" color="teal.500" />
                        <Text fontSize="2xs">Verifying...</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="md" fontWeight="800" color="teal.600">
                        {availablePaise !== null ? formatInr(availablePaise) : "₹0.00"}
                      </Text>
                    )}
                  </Box>

                  <Box
                    p={2.5}
                    borderRadius="10px"
                    bg={isDark ? "gray.750" : "white"}
                    border="1px solid"
                    borderColor={isDark ? "gray.600" : "gray.200"}
                  >
                    <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                      In-Flight Escrow
                    </Text>
                    <Text fontSize="md" fontWeight="800" color="orange.600">
                      {formatInr(reservedPaise)}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Bank Destination */}
                <Box
                  p={3}
                  borderRadius="10px"
                  bg={isDark ? "gray.900" : "blue.50"}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "blue.200"}
                  fontSize="2xs"
                  mb={3}
                >
                  <HStack spacing={1.5} mb={1}>
                    <Icon as={FaUniversity} color="blue.600" />
                    <Text fontWeight="800" color="blue.800">
                      Destination: {bank.bankName || "Linked Bank"}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" color="gray.600">
                    <Text>Account: {maskedAcc}</Text>
                    <Text>IFSC: {bank.ifscCode || "N/A"}</Text>
                  </HStack>
                  {bank.upiId && (
                    <Text color="purple.600" mt={1}>
                      UPI: {bank.upiId}
                    </Text>
                  )}
                </Box>

                {/* Warnings */}
                {isPayoutBlocked && (
                  <Alert status="error" borderRadius="10px" fontSize="2xs" py={2} mb={2}>
                    <AlertIcon boxSize={3} />
                    <Box>
                      <Text fontWeight="700">Payouts Blocked</Text>
                      <Text>{walletOverview?.eligibility?.payoutBlockedReason || "Legal / Risk hold in effect."}</Text>
                    </Box>
                  </Alert>
                )}

                {activeWithdrawal && (
                  <Alert status="warning" borderRadius="10px" fontSize="2xs" py={2}>
                    <AlertIcon boxSize={3} />
                    <Box>
                      <Text fontWeight="700">Existing Active Request</Text>
                      <Text>
                        Request #{String(activeWithdrawal._id).slice(-6)} ({activeWithdrawal.status}) for {formatInr(activeWithdrawal.netPayoutAmountPaise)}.
                      </Text>
                    </Box>
                  </Alert>
                )}
              </Box>
            ) : (
              <Box
                p={8}
                borderRadius="16px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="2px dashed"
                borderColor={isDark ? "gray.700" : "gray.200"}
                textAlign="center"
              >
                <Icon as={FaUser} boxSize={8} color="gray.400" mb={3} />
                <Text fontSize="sm" fontWeight="700" color="gray.600" mb={1}>
                  No Technician Selected
                </Text>
                <Text fontSize="2xs" color="gray.400">
                  Select a technician on the left to review their live ledger balance, linked bank account, and KYC eligibility.
                </Text>
              </Box>
            )}

            {/* Dual-Approval Alert */}
            {isHighValue && (
              <Alert status="warning" variant="left-accent" borderRadius="12px" fontSize="xs" py={2.5}>
                <AlertIcon boxSize={4} />
                <Box>
                  <Text fontWeight="800" color="purple.800">
                    Dual-Approval Required (≥ ₹10,000)
                  </Text>
                  <Text fontSize="2xs" color="gray.600">
                    High-value disbursements require second-admin verification. This payout will be parked with status <strong>requested</strong> and must be approved by another administrator.
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </SimpleGrid>
      </VStack>
    </AppModal>
  );
}

SendMoneyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  technicians: PropTypes.array,
  initialTechnicianId: PropTypes.string,
  onSuccess: PropTypes.func,
};
