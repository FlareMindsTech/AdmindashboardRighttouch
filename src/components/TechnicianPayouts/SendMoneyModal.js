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
  Spinner,
} from "@chakra-ui/react";
import { sendMoneyToTechnician, getTechnicianWalletOverview } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

const DUAL_APPROVAL_RUPEES = 50000;

export default function SendMoneyModal({
  isOpen,
  onClose,
  technicians = [],
  onSuccess,
}) {
  const toast = useToast();

  const [selectedTechId, setSelectedTechId] = useState("");
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

  const isPayoutBlocked =
    walletOverview?.eligibility?.payoutBlocked ??
    (selectedTech?.payoutBlocked || false);

  const activeWithdrawal = walletOverview?.activeWithdrawal || null;

  useEffect(() => {
    if (isOpen) {
      setSelectedTechId("");
      setAmountRupees("");
      setReason("");
      setErrorMsg("");
      setIsSubmitting(false);
      setWalletOverview(null);
    }
  }, [isOpen]);

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
      setErrorMsg("Please select a technician.");
      return;
    }

    if (isPayoutBlocked) {
      setErrorMsg("Technician payouts are currently frozen. Cannot initiate direct payout.");
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
      setErrorMsg("A detailed reason is required for admin-initiated payouts.");
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
        title: isHighValue ? "High-Value Payout Initiated" : "Payout Request Created",
        description: isHighValue
          ? `Initiated ₹${numAmount.toLocaleString("en-IN")}. Parked in 'requested' awaiting second-admin approval.`
          : `Initiated ₹${numAmount.toLocaleString("en-IN")}. Approved and ready for manual bank transfer.`,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered closeOnOverlayClick={!isSubmitting}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg="teal.800" color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Direct Admin Payout (Send Money)
              </Text>
              <Text fontSize="2xs" color="teal.200">
                Initiate a manual withdrawal on behalf of a technician
              </Text>
            </Box>
            <Badge colorScheme="teal" px={2.5} py={1} borderRadius="full" fontSize="2xs">
              ADMIN DIRECT
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} isDisabled={isSubmitting} />

        <ModalBody p={6}>
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
            {isHighValue && (
              <Alert status="warning" borderRadius="12px" fontSize="xs">
                <AlertIcon />
                <Box>
                  <AlertTitle fontWeight="700">Dual-Approval Threshold (₹50,000+)</AlertTitle>
                  <AlertDescription>
                    Payouts at or above ₹50,000 require second-admin verification. This request will be parked with status <strong>requested</strong> and must be approved by another administrator before bank transfer.
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

            {/* Select Technician */}
            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="700">
                Select Technician
              </FormLabel>
              <Select
                size="sm"
                borderRadius="8px"
                placeholder="Choose technician..."
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                isDisabled={isSubmitting}
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
                      {name} {phone ? `(${phone})` : ""} — Available: {bal}
                    </option>
                  );
                })}
              </Select>
            </FormControl>

            {selectedTech && (
              <Box p={3} bg="gray.50" borderRadius="10px" fontSize="xs" border="1px solid" borderColor="gray.200">
                <HStack justify="space-between" mb={1}>
                  <Text color="gray.600">Authoritative Available Balance:</Text>
                  {walletLoading ? (
                    <HStack spacing={2}>
                      <Spinner size="xs" color="teal.500" />
                      <Text fontSize="2xs" color="gray.500">Checking ledger...</Text>
                    </HStack>
                  ) : (
                    <Text fontWeight="800" color="teal.700">
                      {availablePaise !== null ? formatInr(availablePaise) : "Verification in progress"}
                    </Text>
                  )}
                </HStack>

                {isPayoutBlocked && (
                  <Badge colorScheme="red" fontSize="2xs" mt={1}>
                    PAYOUTS FROZEN: {walletOverview?.eligibility?.payoutBlockedReason || selectedTech.payoutBlockedReason || "Admin lock"}
                  </Badge>
                )}

                {activeWithdrawal && (
                  <Alert status="warning" borderRadius="8px" fontSize="2xs" py={1.5} px={2} mt={2}>
                    <AlertIcon boxSize={3} />
                    <Text>
                      Active withdrawal <strong>#{String(activeWithdrawal._id).slice(-8)}</strong> ({activeWithdrawal.status}) in flight for net {formatInr(activeWithdrawal.netPayoutAmountPaise)}.
                    </Text>
                  </Alert>
                )}
              </Box>
            )}

            {/* Payout Amount */}
            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="700">
                Payout Amount (₹)
              </FormLabel>
              <Input
                size="sm"
                borderRadius="8px"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 5000"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                isDisabled={isSubmitting}
              />
              <FormHelperText fontSize="3xs">
                Amount will be deducted and reserved from technician's available balance
              </FormHelperText>
            </FormControl>

            {/* Reason */}
            <FormControl isRequired>
              <FormLabel fontSize="xs" fontWeight="700">
                Reason / Note for Payout
              </FormLabel>
              <Textarea
                size="sm"
                borderRadius="8px"
                rows={2}
                placeholder="Reason for direct payout (e.g. Weekly settlement or emergency advance)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
              loadingText="Initiating..."
              isDisabled={!selectedTechId || numAmount <= 0 || !reason.trim() || isSubmitting}
            >
              Initiate Direct Payout {numAmount > 0 ? `(${formatInr(amountPaise)})` : ""}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
