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
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  Checkbox,
  SimpleGrid,
  Icon,
  Wrap,
  WrapItem,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaUndoAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { revertPaidWithdrawal } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

const REVERT_PRESETS = [
  "Bank transfer bounced (invalid beneficiary account or IFSC)",
  "Erroneous UTR recorded by administrator",
  "Transferred to incorrect beneficiary account",
  "Financial institution chargeback or return of funds",
  "Duplicate manual payout recorded in error",
];

export default function RevertPaidModal({
  isOpen,
  onClose,
  withdrawal,
  currentUser,
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

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
        description: `Successfully reverted payout #${withdrawal._id}. Gross ${formatInr(
          grossPaise
        )} returned to technician wallet balance.`,
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
    (withdrawal?.technicianId?.userId?.fname
      ? `${withdrawal?.technicianId?.userId?.fname} ${withdrawal?.technicianId?.userId?.lname || ""}`.trim()
      : "Technician");

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      maxW={{ base: "95vw", md: "880px", lg: "960px" }}
      bodyMaxH="75vh"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      headerBg="red.900"
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="red.800"
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={FaUndoAlt} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                Revert Recorded Payment (Owner Remediation)
              </Text>
              <Text fontSize="xs" color="red.200" fontFamily="mono">
                Withdrawal #{withdrawal?._id} • {techName}
              </Text>
            </Box>
          </HStack>
          <Badge
            colorScheme="red"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="800"
          >
            OWNER ONLY
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            Compensating ledger transaction will be appended to audit history.
          </Text>
          <HStack spacing={3}>
            <Button size="md" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="md"
              colorScheme="red"
              bg="red.600"
              _hover={{ bg: "red.700" }}
              fontWeight="800"
              px={6}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Reverting Payment..."
              isDisabled={
                !isOwner ||
                reason.trim().length < 5 ||
                !acknowledged ||
                isSubmitting
              }
            >
              Confirm Revert ({formatInr(grossPaise)})
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={1}>
        {/* Permission Guard */}
        {!isOwner ? (
          <Alert status="error" borderRadius="12px" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle fontWeight="800" fontSize="sm">
                Owner Role Authorization Required
              </AlertTitle>
              <AlertDescription fontSize="xs">
                Only users with the <strong>Owner</strong> role can execute financial payout reversals. Standard administrators cannot access this function.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <Alert status="error" borderRadius="12px" variant="left-accent" bg="red.50" borderColor="red.500">
            <AlertIcon as={FaExclamationTriangle} color="red.600" />
            <Box>
              <AlertTitle fontWeight="800" fontSize="sm" color="red.900">
                Exceptional Financial Correction
              </AlertTitle>
              <AlertDescription fontSize="xs" color="red.800">
                Reversing a paid withdrawal unwinds the transaction without mutating original ledger rows. The withdrawal transitions to <strong>failed</strong>, and gross amount {formatInr(grossPaise)} is credited back to the technician.
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

        {/* Financial Remediation Matrix */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.800" : "gray.50"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.600" mb={3}>
            Audit & Balance Remediation Impact
          </Text>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <Box bg={isDark ? "gray.900" : "white"} p={3} borderRadius="10px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Record Status</Text>
              <HStack mt={1}>
                <Badge colorScheme="green" fontSize="3xs">PAID</Badge>
                <Text fontSize="xs" color="gray.400">→</Text>
                <Badge colorScheme="red" fontSize="3xs">FAILED</Badge>
              </HStack>
            </Box>

            <Box bg={isDark ? "gray.900" : "white"} p={3} borderRadius="10px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Wallet Refund</Text>
              <Text fontSize="sm" fontWeight="900" color="green.600" mt={1}>
                +{formatInr(grossPaise)}
              </Text>
            </Box>

            <Box bg={isDark ? "gray.900" : "white"} p={3} borderRadius="10px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Lifetime Withdrawn</Text>
              <Text fontSize="sm" fontWeight="900" color="red.600" mt={1}>
                -{formatInr(netPaise)}
              </Text>
            </Box>

            <Box bg={isDark ? "gray.900" : "white"} p={3} borderRadius="10px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">Ledger Action</Text>
              <Text fontSize="2xs" fontWeight="700" fontFamily="mono" color="purple.600" mt={1} noOfLines={1}>
                payout_reversal
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Common Reversal Preset Chips */}
        <Box>
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.600" mb={2}>
            Common Reversal Scenarios (Click to Apply)
          </Text>
          <Wrap spacing={2}>
            {REVERT_PRESETS.map((preset) => (
              <WrapItem key={preset}>
                <Button
                  size="xs"
                  variant={reason === preset ? "solid" : "outline"}
                  colorScheme="red"
                  borderRadius="full"
                  onClick={() => setReason(preset)}
                  isDisabled={!isOwner || isSubmitting}
                >
                  {preset}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Reason Textarea */}
        <FormControl isRequired isInvalid={reason.length > 0 && reason.trim().length < 5}>
          <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
            Mandatory Reversal Audit Reason
          </FormLabel>
          <Textarea
            size="md"
            borderRadius="10px"
            rows={3}
            placeholder="Document the exact reason for reversing this settled payout..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            isDisabled={!isOwner || isSubmitting}
            fontSize="xs"
          />
        </FormControl>

        {/* Bank Return UTR */}
        <FormControl>
          <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
            Bank Return Reference / UTR (If Applicable)
          </FormLabel>
          <Input
            size="md"
            borderRadius="10px"
            fontFamily="mono"
            placeholder="e.g. RET/HDFC202611060912 or BOUNCE-REF-442"
            value={bankReturnUtr}
            onChange={(e) => setBankReturnUtr(e.target.value.toUpperCase())}
            isDisabled={!isOwner || isSubmitting}
          />
        </FormControl>

        {/* High-Contrast Acknowledgment */}
        <Box
          p={3.5}
          borderRadius="12px"
          bg={acknowledged ? "red.50" : isDark ? "gray.800" : "gray.50"}
          border="1.5px solid"
          borderColor={acknowledged ? "red.400" : isDark ? "gray.700" : "gray.200"}
        >
          <Checkbox
            size="md"
            colorScheme="red"
            isChecked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            isDisabled={!isOwner || isSubmitting}
          >
            <Text fontSize="xs" fontWeight="700" color="red.700">
              I certify as Owner that this payout has failed or was wrongly settled, and authorize restoring {formatInr(grossPaise)} to the technician's balance.
            </Text>
          </Checkbox>
        </Box>
      </VStack>
    </AppModal>
  );
}

RevertPaidModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  withdrawal: PropTypes.object,
  currentUser: PropTypes.object,
  onSuccess: PropTypes.func,
};
