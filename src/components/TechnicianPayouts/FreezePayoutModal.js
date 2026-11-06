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
  FaSnowflake,
  FaUnlock,
} from "react-icons/fa";
import { toggleTechnicianPayoutFreeze } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

const FREEZE_PRESETS = [
  "KYC Bank account details under investigation",
  "Repeated customer service cancellation disputes",
  "Suspected fraudulent activity or unauthorized login",
  "Outstanding commission dues recovery",
  "Quality audit / account verification hold",
];

export default function FreezePayoutModal({
  isOpen,
  onClose,
  technician,
  onSuccess,
}) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const isCurrentlyFrozen = !!(
    technician?.payoutBlocked ||
    technician?.technicianId?.payoutBlocked
  );

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const techId =
    technician?._id ||
    technician?.technicianId?._id ||
    technician?.technicianId ||
    technician?.id;

  const techName =
    technician?.name ||
    technician?.technicianName ||
    (technician?.technicianId?.userId?.fname
      ? `${technician?.technicianId?.userId?.fname} ${technician?.technicianId?.userId?.lname || ""}`.trim()
      : "Technician");

  const techPhone =
    technician?.phone ||
    technician?.technicianId?.userId?.mobileNumber ||
    technician?.technicianId?.mobileNumber ||
    "";

  const availablePaise =
    technician?.availableBalancePaise ??
    (technician?.walletBalance ? Math.round(technician.walletBalance * 100) : 0);

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

    const newFreezeState = !isCurrentlyFrozen;

    if (newFreezeState && !reason.trim()) {
      setErrorMsg("A reason is required to freeze technician payouts.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        freeze: newFreezeState,
        reason: reason.trim() || undefined,
      };

      const { data, error } = await toggleTechnicianPayoutFreeze(techId, payload);

      if (error) {
        setErrorMsg(error);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: newFreezeState ? "Technician Payouts Frozen" : "Technician Payouts Unfrozen",
        description: newFreezeState
          ? `Payouts for ${techName} are now blocked.`
          : `Payouts for ${techName} have been unblocked.`,
        status: newFreezeState ? "warning" : "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to update payout freeze status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      maxW={{ base: "95vw", md: "780px", lg: "840px" }}
      bodyMaxH="75vh"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      headerBg={isCurrentlyFrozen ? "teal.800" : "red.800"}
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="10px"
              bg={isCurrentlyFrozen ? "teal.700" : "red.700"}
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={isCurrentlyFrozen ? FaUnlock : FaSnowflake} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                {isCurrentlyFrozen
                  ? "Unfreeze Technician Payouts"
                  : "Freeze Technician Payouts"}
              </Text>
              <Text fontSize="xs" color={isCurrentlyFrozen ? "teal.200" : "red.200"}>
                ID #{techId} • {techName}
              </Text>
            </Box>
          </HStack>
          <Badge
            colorScheme={isCurrentlyFrozen ? "green" : "red"}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="800"
          >
            {isCurrentlyFrozen ? "CURRENTLY FROZEN" : "CURRENTLY ACTIVE"}
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            {isCurrentlyFrozen
              ? "Technician will immediately regain withdrawal access."
              : "All future manual and automated payouts will be blocked."}
          </Text>
          <HStack spacing={3}>
            <Button size="md" variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="md"
              colorScheme={isCurrentlyFrozen ? "green" : "red"}
              bg={isCurrentlyFrozen ? "green.600" : "red.600"}
              _hover={{ bg: isCurrentlyFrozen ? "green.700" : "red.700" }}
              fontWeight="800"
              px={6}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Updating..."
              isDisabled={(!isCurrentlyFrozen && !reason.trim()) || isSubmitting}
            >
              {isCurrentlyFrozen ? "Confirm Unfreeze" : "Confirm Payout Freeze"}
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack spacing={5} align="stretch" as="form" onSubmit={handleSubmit} py={1}>
        {/* Governance Alert */}
        <Alert
          status={isCurrentlyFrozen ? "info" : "warning"}
          borderRadius="12px"
          variant="left-accent"
        >
          <AlertIcon />
          <Box>
            <AlertTitle fontWeight="800" fontSize="sm">
              {isCurrentlyFrozen
                ? "Restore Payout Capabilities"
                : "Risk Management Payout Freeze"}
            </AlertTitle>
            <AlertDescription fontSize="xs">
              {isCurrentlyFrozen
                ? "Unfreezing will restore this technician's ability to request withdrawals and receive payouts."
                : "Freezing prevents the technician from requesting withdrawals or receiving payouts until explicitly unblocked by an admin."}
            </AlertDescription>
          </Box>
        </Alert>

        {errorMsg && (
          <Alert status="error" borderRadius="12px" fontSize="xs">
            <AlertIcon />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Technician Profile Card */}
        <Box
          p={4}
          borderRadius="14px"
          bg={isDark ? "gray.800" : "gray.50"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={techName}
                bg={isCurrentlyFrozen ? "red.600" : "teal.600"}
                color="white"
                fontWeight="700"
              />
              <Box>
                <Text fontSize="sm" fontWeight="800">
                  {techName}
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  {techPhone ? `Mobile: ${techPhone}` : `Technician ID: ${techId}`}
                </Text>
              </Box>
            </HStack>
            <Box textAlign="right">
              <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                Available Balance
              </Text>
              <Text fontSize="lg" fontWeight="900" color="teal.600">
                {formatInr(availablePaise)}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Presets and Textarea if Freezing */}
        {!isCurrentlyFrozen ? (
          <>
            <Box>
              <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.600" mb={2}>
                Common Freeze Reasons (Click to Apply)
              </Text>
              <Wrap spacing={2}>
                {FREEZE_PRESETS.map((preset) => (
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

            <FormControl isRequired isInvalid={!reason.trim() && reason.length > 0}>
              <FormLabel fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px">
                Audit Reason for Freezing Payouts
              </FormLabel>
              <Textarea
                size="md"
                borderRadius="10px"
                rows={3}
                placeholder="Explain the specific risk reason for placing this payout block..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                isDisabled={isSubmitting}
                fontSize="xs"
              />
            </FormControl>
          </>
        ) : (
          /* Current Freeze Reason Display */
          <Box
            p={4}
            borderRadius="12px"
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            fontSize="xs"
          >
            <Text fontWeight="800" color="red.800" textTransform="uppercase" letterSpacing="0.5px" mb={1}>
              Active Freeze Reason:
            </Text>
            <Text color="red.700" fontWeight="600">
              {technician?.payoutBlockedReason ||
                technician?.technicianId?.payoutBlockedReason ||
                "Administrative hold placed on payouts."}
            </Text>
          </Box>
        )}
      </VStack>
    </AppModal>
  );
}

FreezePayoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  technician: PropTypes.object,
  onSuccess: PropTypes.func,
};
