import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaRupeeSign,
  FaUniversity,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { getTechnicianWalletOverview, sendMoneyToTechnician } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";
import TechnicianSearchCombobox from "./TechnicianSearchCombobox";

const DUAL_APPROVAL_RUPEES = 10000;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletOverview, setWalletOverview] = useState(null);

  const numAmount = Number.parseFloat(amountRupees || 0);
  const amountPaise = Math.round((Number.isFinite(numAmount) ? numAmount : 0) * 100);
  const isHighValue = amountPaise >= DUAL_APPROVAL_RUPEES * 100;

  const selectedTech = technicians.find(
    (tech) => String(tech._id || tech.id || tech.technicianId) === String(selectedTechId)
  );

  const wallet = walletOverview?.wallet || {};
  const eligibility = walletOverview?.eligibility || {};
  const overviewTech = walletOverview?.technician || {};
  const overviewUser = overviewTech.user || {};

  const availablePaise =
    wallet.availableBalancePaise ??
    (selectedTech?.availableBalancePaise ?? null);
  const reservedPaise =
    wallet.reservedBalancePaise ??
    (selectedTech?.reservedBalancePaise ?? 0);
  const maintenanceFloorPaise = Math.max(
    0,
    walletOverview?.maintenanceFloorPaise ?? 0
  );
  const minimumWithdrawalPaise = Math.max(
    0,
    walletOverview?.minimumWithdrawalAmountPaise ?? 0
  );
  const maximumWithdrawalPaise =
    walletOverview?.maximumWithdrawalAmountPaise != null
      ? Math.max(0, walletOverview.maximumWithdrawalAmountPaise)
      : Number.MAX_SAFE_INTEGER;
  const adminDirectMaxPaise =
    walletOverview?.adminDirectMaxWithdrawablePaise ??
    Math.max(0, (availablePaise ?? 0) - maintenanceFloorPaise);
  const maxSpendablePaise = Math.max(
    0,
    Math.min(adminDirectMaxPaise, maximumWithdrawalPaise)
  );
  const isPayoutBlocked = Boolean(
    eligibility.payoutBlocked ?? selectedTech?.payoutBlocked
  );
  const bankVerified = Boolean(eligibility.bankVerified);
  const hasBankFingerprint = Boolean(eligibility.hasBankFingerprint);
  const bankReady = bankVerified && hasBankFingerprint;
  const bankNotReady = Boolean(walletOverview) && !bankReady;
  const activeWithdrawal = walletOverview?.activeWithdrawal || null;

  const bank = eligibility.bankDetails || walletOverview?.bankDetails || {};
  const rawAccount = String(
    bank.maskedAccountNumber || bank.accountNumber || selectedTech?.payoutDestination || ""
  ).replace(/\s/g, "");
  const maskedAccount =
    rawAccount.length >= 4 ? `••••${rawAccount.slice(-4)}` : rawAccount || "Not linked";
  const hasVisibleBankDetails = Boolean(
    bank.maskedAccountNumber || bank.accountNumber || bank.upiId
  );

  const displayName =
    selectedTech?.name ||
    [
      selectedTech?.userId?.fname || overviewUser.fname,
      selectedTech?.userId?.lname || overviewUser.lname,
    ]
      .filter(Boolean)
      .join(" ") ||
    selectedTech?.fname ||
    "Technician";

  const phone =
    selectedTech?.userId?.mobileNumber ||
    selectedTech?.mobileNumber ||
    overviewUser.mobileNumber ||
    "No phone linked";

  const canSubmit =
    Boolean(selectedTechId) &&
    Boolean(walletOverview) &&
    !walletLoading &&
    !isSubmitting &&
    !isPayoutBlocked &&
    bankReady &&
    !activeWithdrawal &&
    numAmount > 0 &&
    amountPaise >= minimumWithdrawalPaise &&
    amountPaise <= maxSpendablePaise;

  const payoutStatus = !canSubmit
    ? { label: "Cannot pay yet", colorScheme: "red" }
    : isHighValue
      ? { label: "Needs second approval", colorScheme: "orange" }
      : { label: "Ready to create", colorScheme: "green" };

  const bankBadge = !bankVerified
    ? { label: "Bank not verified", colorScheme: "orange" }
    : !hasBankFingerprint
      ? { label: "Bank details not linked", colorScheme: "red" }
      : { label: "Bank verified", colorScheme: "green" };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedTechId(initialTechnicianId || "");
    setAmountRupees("");
    setErrorMsg("");
    setIsSubmitting(false);
    setWalletOverview(null);
  }, [isOpen, initialTechnicianId]);

  useEffect(() => {
    let cancelled = false;

    if (!isOpen || !selectedTechId) {
      setWalletOverview(null);
      setWalletLoading(false);
      return undefined;
    }

    setWalletLoading(true);
    setWalletOverview(null);
    setErrorMsg("");

    getTechnicianWalletOverview(selectedTechId)
      .then(({ data }) => {
        if (!cancelled && data) {
          setWalletOverview(data?.result || data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg(err.message || "Could not load this technician's live balance.");
        }
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedTechId]);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setErrorMsg("");

    if (!selectedTechId) {
      setErrorMsg("Choose a technician before creating a payout.");
      return;
    }

    if (walletLoading || !walletOverview) {
      setErrorMsg("The live balance is still loading. Please wait a moment and try again.");
      return;
    }

    if (isPayoutBlocked) {
      setErrorMsg("This technician's payouts are frozen. Unfreeze payouts before paying.");
      return;
    }

    if (bankNotReady) {
      setErrorMsg("This technician has no verified bank/UPI details linked for payouts.");
      return;
    }

    if (activeWithdrawal) {
      setErrorMsg("This technician already has a payout in progress. Resolve it before creating another.");
      return;
    }

    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setErrorMsg("Enter a payout amount greater than ₹0.");
      return;
    }

    if (minimumWithdrawalPaise > 0 && amountPaise < minimumWithdrawalPaise) {
      setErrorMsg(`Minimum payout amount is ${formatInr(minimumWithdrawalPaise)}.`);
      return;
    }

    if (amountPaise > maxSpendablePaise) {
      setErrorMsg(
        `You can pay up to ${formatInr(maxSpendablePaise)} under the current global payout policy.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        technicianId: selectedTechId,
        amount: numAmount,
        amountPaise,
        reason: "Admin direct payout (no technician request)",
        clientIdempotencyKey: `admin-direct-${selectedTechId}-${Date.now()}`,
      };

      const { data, error } = await sendMoneyToTechnician(selectedTechId, payload);

      if (error) {
        setErrorMsg(error);
        return;
      }

      toast({
        title: isHighValue ? "Payout sent for second approval" : "Payout created",
        description: isHighValue
          ? `${formatInr(amountPaise)} is waiting for another admin to approve before transfer.`
          : `${formatInr(amountPaise)} is ready for bank transfer. Record the UTR after transfer.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onSuccess?.(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create the payout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      maxW={{ base: "96vw", md: "900px" }}
      bodyMaxH="78vh"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      headerBg="teal.700"
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack spacing={3} pr={8}>
          <Flex
            w="38px"
            h="38px"
            borderRadius="10px"
            bg="teal.600"
            color="white"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={FaPaperPlane} boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="lg" fontWeight="800">
              Pay Technician Directly
            </Text>
            <Text fontSize="xs" color="teal.100">
              No withdrawal request required
            </Text>
          </Box>
        </HStack>
      }
      footer={
        <HStack justify="space-between" w="full" spacing={3} flexWrap="wrap">
          <Text fontSize="xs" color="gray.500">
            {isHighValue
              ? "A second admin must approve this high-value payout."
              : "Creates an admin-direct payout record for bank transfer."}
          </Text>
          <HStack spacing={3}>
            <Button size="md" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="md"
              colorScheme="teal"
              fontWeight="800"
              px={6}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Creating payout..."
              isDisabled={!canSubmit}
            >
              {isHighValue ? "Send for Approval" : "Pay"}
              {numAmount > 0 ? ` ${formatInr(amountPaise)}` : ""}
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={1}>
        {errorMsg && (
          <Alert status="error" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <Alert status="info" borderRadius="12px" alignItems="flex-start">
          <AlertIcon mt={0.5} />
          <Box>
            <Text fontWeight="800" fontSize="sm">
              Pay from the technician's available balance
            </Text>
            <Text fontSize="xs" mt={0.5}>
              This does not need a technician request. The amount is reserved immediately and appears
              in the payout queue for bank transfer and UTR recording.
            </Text>
          </Box>
        </Alert>

        <Box
          p={4}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          borderRadius="14px"
          bg={isDark ? "gray.800" : "white"}
        >
          <HStack spacing={2} mb={3}>
            <Badge colorScheme="teal" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
              1
            </Badge>
            <Text fontSize="sm" fontWeight="800">
              Choose technician
            </Text>
          </HStack>

          <TechnicianSearchCombobox
            technicians={technicians}
            selectedTechId={selectedTechId}
            onSelect={(id) => setSelectedTechId(id)}
            placeholder="Select a technician to pay (search name or phone)..."
            isDark={isDark}
            isDisabled={isSubmitting}
            size="md"
            width="full"
            showBalance={true}
          />
        </Box>

        {!selectedTechId && (
          <Box
            p={8}
            borderRadius="14px"
            border="2px dashed"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.800" : "gray.50"}
            textAlign="center"
          >
            <Icon as={FaUser} boxSize={7} color="gray.400" mb={2} />
            <Text fontSize="sm" fontWeight="700" color="gray.600">
              Select a technician first
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              You will see their live balance, bank destination, and payout eligibility before paying.
            </Text>
          </Box>
        )}

        {selectedTechId && walletLoading && (
          <Flex py={6} justify="center" align="center">
            <HStack spacing={3}>
              <Spinner size="sm" color="teal.500" />
              <Text fontSize="xs" color="gray.500">
                Checking live balance...
              </Text>
            </HStack>
          </Flex>
        )}

        {selectedTechId && walletOverview && (
          <Box
            p={4}
            borderRadius="14px"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.800" : "gray.50"}
          >
            <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
              <HStack spacing={3}>
                <Avatar size="sm" name={displayName} bg="teal.600" color="white" fontWeight="700" />
                <Box>
                  <Text fontSize="sm" fontWeight="800">
                    {displayName}
                  </Text>
                  <Text fontSize="2xs" color="gray.500">
                    {phone}
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={2} flexWrap="wrap">
                <Badge
                  colorScheme={bankBadge.colorScheme}
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                >
                  <HStack spacing={1}>
                    <Icon
                      as={bankReady ? FaCheckCircle : FaExclamationTriangle}
                      boxSize={2.5}
                    />
                    <Text as="span">{bankBadge.label}</Text>
                  </HStack>
                </Badge>
                {isPayoutBlocked && (
                  <Badge colorScheme="red" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
                    Payouts frozen
                  </Badge>
                )}
              </HStack>
            </Flex>

            <Divider my={3.5} />

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              <Box p={3} borderRadius="10px" bg={isDark ? "gray.750" : "white"} borderWidth="1px">
                <HStack spacing={1.5} mb={1}>
                  <Icon as={FaWallet} boxSize={3} color="teal.500" />
                  <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                    Available balance
                  </Text>
                </HStack>
                <Text fontSize="md" fontWeight="800" color="teal.600">
                  {availablePaise != null ? formatInr(availablePaise) : "—"}
                </Text>
              </Box>

              <Box p={3} borderRadius="10px" bg={isDark ? "gray.750" : "white"} borderWidth="1px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  Already on hold
                </Text>
                <Text fontSize="md" fontWeight="800" color="orange.600">
                  {formatInr(reservedPaise)}
                </Text>
              </Box>

              <Box p={3} borderRadius="10px" bg={isDark ? "gray.750" : "white"} borderWidth="1px">
                <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  Can pay now
                </Text>
                <Text fontSize="md" fontWeight="800" color="purple.600">
                  {formatInr(maxSpendablePaise)}
                </Text>
              </Box>
            </SimpleGrid>

            <Text fontSize="2xs" color="gray.500" mt={2}>
              {maintenanceFloorPaise > 0
                ? `${formatInr(maintenanceFloorPaise)} must remain in the wallet as the global maintenance floor.`
                : "No maintenance floor is applied by the global payout policy."}
            </Text>

            <Box
              mt={3}
              p={3}
              borderRadius="10px"
              bg={isDark ? "gray.900" : "blue.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "blue.200"}
            >
              <HStack spacing={1.5} mb={1}>
                <Icon as={FaUniversity} boxSize={3} color="blue.600" />
                <Text fontSize="2xs" fontWeight="800" color="blue.800">
                  Destination account
                </Text>
              </HStack>
              {hasVisibleBankDetails ? (
                <>
                  <Text fontSize="2xs" color="gray.600">
                    {bank.bankName || "Linked bank"} • Account {maskedAccount}
                  </Text>
                  <Text fontSize="2xs" color="gray.600">
                    IFSC {bank.ifscCode || "N/A"}
                    {bank.upiId ? ` • UPI ${bank.upiId}` : ""}
                  </Text>
                </>
              ) : bankReady ? (
                <>
                  <Text fontSize="2xs" color="gray.600">
                    Verified bank/UPI account on file.
                  </Text>
                  <Text fontSize="2xs" color="gray.600">
                    Account details are hidden here; use the payout queue for transfer details.
                  </Text>
                </>
              ) : (
                <>
                  <Text fontSize="2xs" color="gray.600">
                    No verified bank/UPI account linked.
                  </Text>
                  <Text fontSize="2xs" color="gray.600">
                    Verify the technician&apos;s payout details before creating a payout.
                  </Text>
                </>
              )}
            </Box>

            {isPayoutBlocked && (
              <Alert status="error" borderRadius="10px" fontSize="2xs" py={2} mt={3}>
                <AlertIcon boxSize={3} />
                <Box>
                  <Text fontWeight="700">Payouts are frozen</Text>
                  <Text>
                    {eligibility.payoutBlockedReason || "Unfreeze payouts before paying this technician."}
                  </Text>
                </Box>
              </Alert>
            )}

            {bankNotReady && (
              <Alert status="warning" borderRadius="10px" fontSize="2xs" py={2} mt={3}>
                <AlertIcon boxSize={3} />
                <Box>
                  <Text fontWeight="700">
                    {bankVerified ? "Bank details not linked" : "Bank not verified"}
                  </Text>
                  <Text>
                    {bankVerified
                      ? "No verified bank/UPI account is linked for payouts."
                      : "Verify this technician's bank details before creating a payout."}
                  </Text>
                </Box>
              </Alert>
            )}

            {activeWithdrawal && (
              <Alert status="warning" borderRadius="10px" fontSize="2xs" py={2} mt={3}>
                <AlertIcon boxSize={3} />
                <Box>
                  <Text fontWeight="700">A payout is already in progress</Text>
                  <Text>
                    Request #{String(activeWithdrawal._id).slice(-6)} is currently{" "}
                    {activeWithdrawal.status} for{" "}
                    {formatInr(activeWithdrawal.netPayoutAmountPaise)}. Resolve it before creating
                    another payout.
                  </Text>
                </Box>
              </Alert>
            )}
          </Box>
        )}

        {selectedTechId && walletOverview && (
          <Box
            p={4}
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            borderRadius="14px"
            bg={isDark ? "gray.800" : "white"}
          >
            <HStack spacing={2} mb={3}>
              <Badge colorScheme="teal" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
                2
              </Badge>
              <Text fontSize="sm" fontWeight="800">
                Payout details
              </Text>
            </HStack>

            <SimpleGrid columns={1} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase">
                  Amount (₹)
                </FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaRupeeSign} color="teal.500" />
                  </InputLeftElement>
                  <Input
                    borderRadius="10px"
                    type="number"
                    min={Math.max(0.01, minimumWithdrawalPaise / 100)}
                    step="0.01"
                    placeholder="Enter amount"
                    value={amountRupees}
                    onChange={(event) => setAmountRupees(event.target.value)}
                    isDisabled={isSubmitting || maxSpendablePaise <= 0}
                    fontWeight="700"
                  />
                </InputGroup>

                <Wrap spacing={1.5} mt={2}>
                  {QUICK_AMOUNTS.map((quickAmount) => {
                    const quickPaise = quickAmount * 100;
                    const outsidePolicy =
                      quickPaise < minimumWithdrawalPaise ||
                      quickPaise > maxSpendablePaise;
                    return (
                      <WrapItem key={quickAmount}>
                        <Button
                          size="xs"
                          variant={amountPaise === quickPaise ? "solid" : "outline"}
                          colorScheme="teal"
                          borderRadius="full"
                          isDisabled={isSubmitting || outsidePolicy}
                          onClick={() => setAmountRupees(String(quickAmount))}
                        >
                          ₹{quickAmount.toLocaleString("en-IN")}
                        </Button>
                      </WrapItem>
                    );
                  })}
                  {maxSpendablePaise >= minimumWithdrawalPaise && maxSpendablePaise > 0 && (
                    <WrapItem>
                      <Button
                        size="xs"
                        variant="subtle"
                        colorScheme="green"
                        borderRadius="full"
                        isDisabled={isSubmitting}
                        onClick={() => setAmountRupees((maxSpendablePaise / 100).toFixed(2))}
                      >
                        Use max
                      </Button>
                    </WrapItem>
                  )}
                </Wrap>

                <FormHelperText fontSize="2xs">
                  {maxSpendablePaise > 0 && maxSpendablePaise >= minimumWithdrawalPaise
                    ? minimumWithdrawalPaise > 0
                      ? `Minimum ${formatInr(minimumWithdrawalPaise)} • Maximum ${formatInr(maxSpendablePaise)}`
                      : `Maximum you can pay now: ${formatInr(maxSpendablePaise)}`
                    : "No payable amount under the current global payout policy."}
                </FormHelperText>
              </FormControl>
            </SimpleGrid>

            {numAmount > 0 && selectedTechId && (
              <Flex
                mt={4}
                p={3}
                borderRadius="10px"
                bg={isDark ? "gray.900" : "teal.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "teal.200"}
                justify="space-between"
                align="center"
                gap={2}
                flexWrap="wrap"
              >
                <Text fontSize="xs">
                  Paying <strong>{formatInr(amountPaise)}</strong> to <strong>{displayName}</strong>
                </Text>
                <Badge
                  colorScheme={payoutStatus.colorScheme}
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                >
                  {payoutStatus.label}
                </Badge>
              </Flex>
            )}
          </Box>
        )}

        {isHighValue && (
          <Alert status="warning" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <Box>
              <Text fontWeight="800">Second admin approval required</Text>
              <Text fontSize="2xs" mt={0.5}>
                Payouts of ₹{DUAL_APPROVAL_RUPEES.toLocaleString("en-IN")} or more are created in
                pending-review status and must be approved by another administrator.
              </Text>
            </Box>
          </Alert>
        )}
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
