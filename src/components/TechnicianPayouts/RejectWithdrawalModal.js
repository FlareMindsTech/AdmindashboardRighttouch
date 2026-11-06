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
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Box,
  Badge,
  Avatar,
  Icon,
  Wrap,
  WrapItem,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaTimesCircle,
  FaUndoAlt,
} from "react-icons/fa";
import { rejectWithdrawal } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

const REJECTION_PRESETS = [
  "Bank details mismatch with verified KYC record",
  "Active customer dispute or unresolved warranty complaint",
  "Technician requested cancellation of withdrawal",
  "Suspected fraudulent activity or unauthorized request",
  "Outstanding penalty dues / negative balance adjustment",
  "Incomplete KYC documentation submitted",
];

export default function RejectWithdrawalModal({
  isOpen,
  onClose,
  withdrawal,
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const requestedPaise =
    withdrawal?.requestedAmountPaise ??
    withdrawal?.amountPaise ??
    (withdrawal?.amount ? Math.round(withdrawal.amount * 100) : 0);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setErrorMsg("A rejection reason of at least 5 characters is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await rejectWithdrawal(withdrawal._id, {
        reason: trimmed,
        adminNote: trimmed,
      });

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Withdrawal Rejected",
        description: `Rejected withdrawal #${withdrawal._id}. ${formatInr(
          requestedPaise
        )} has been released back to the technician's available balance.`,
        status: "info",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to reject withdrawal.");
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

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      maxW={{ base: "95vw", md: "850px", lg: "920px" }}
      bodyMaxH="75vh"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      headerBg="red.800"
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="red.700"
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={FaTimesCircle} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                Reject Withdrawal Request
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
            DECLINE & REFUND
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            Funds will immediately return to technician's active balance.
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
              loadingText="Rejecting..."
              isDisabled={reason.trim().length < 5 || isSubmitting}
            >
              Confirm Rejection & Refund ({formatInr(requestedPaise)})
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={1}>
        {/* Reservation Refund Notice */}
        <Alert status="info" borderRadius="12px" variant="left-accent" bg="blue.50" borderColor="blue.500">
          <AlertIcon as={FaUndoAlt} color="blue.600" />
          <Box>
            <AlertTitle fontWeight="800" fontSize="sm" color="blue.900">
              Immediate Escrow Balance Restoration
            </AlertTitle>
            <AlertDescription fontSize="xs" color="blue.800">
              Upon rejection, the reserved balance of <strong>{formatInr(requestedPaise)}</strong> will be immediately unblocked and credited back to the technician's available wallet balance.
            </AlertDescription>
          </Box>
        </Alert>

        {errorMsg && (
          <Alert status="error" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Withdrawal Overview Card */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.800" : "gray.50"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Avatar size="sm" name={techName} bg="red.600" color="white" fontWeight="700" />
              <Box>
                <Text fontSize="sm" fontWeight="800">
                  {techName}
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  {techPhone ? `Mobile: ${techPhone}` : `Origin: ${withdrawal?.origin || "technician_request"}`}
                </Text>
              </Box>
            </HStack>
            <Box textAlign="right">
              <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                Reserved Amount to Refund
              </Text>
              <Text fontSize="xl" fontWeight="900" color="red.600">
                {formatInr(requestedPaise)}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Rejection Preset Chips */}
        <Box>
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.600" mb={2}>
            Common Rejection Reasons (Click to Apply)
          </Text>
          <Wrap spacing={2}>
            {REJECTION_PRESETS.map((preset) => (
              <WrapItem key={preset}>
                <Button
                  size="xs"
                  variant={reason === preset ? "solid" : "outline"}
                  colorScheme="red"
                  borderRadius="full"
                  onClick={() => setReason(preset)}
                  isDisabled={isSubmitting}
                >
                  {preset}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Mandatory Reason Textarea */}
        <FormControl isRequired isInvalid={reason.length > 0 && reason.trim().length < 5}>
          <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
            Detailed Reason for Rejection (Visible to Technician)
          </FormLabel>
          <Textarea
            size="md"
            borderRadius="10px"
            rows={4}
            placeholder="Explain the specific reason for rejecting this payout request..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            isDisabled={isSubmitting}
            fontSize="xs"
          />
          <HStack justify="space-between" mt={1}>
            <Text fontSize="3xs" color="gray.500">
              Minimum 5 characters required. This note is recorded in audit logs and sent via notification.
            </Text>
            <Text fontSize="3xs" color={reason.trim().length >= 5 ? "green.600" : "gray.400"} fontWeight="700">
              {reason.trim().length} chars
            </Text>
          </HStack>
        </FormControl>
      </VStack>
    </AppModal>
  );
}

RejectWithdrawalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  withdrawal: PropTypes.object,
  onSuccess: PropTypes.func,
};
