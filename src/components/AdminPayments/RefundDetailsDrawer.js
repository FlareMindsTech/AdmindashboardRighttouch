import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  FaCheck,
  FaCheckCircle,
  FaCopy,
  FaFileInvoiceDollar,
  FaPaperPlane,
  FaRedoAlt,
  FaShieldAlt,
  FaTimes,
  FaUndoAlt,
} from "react-icons/fa";
import { useAppToast } from "components/feedback";
import {
  formatDateTime,
  formatINR,
  getRailLabel,
  getRefundAmountPaise,
  getRefundBookingId,
  getRefundCustomer,
  getRefundCustomerId,
  getRefundPaymentId,
  getRefundStatusMeta,
  isRefundPayoutEligible,
  isRefundRetryable,
} from "./refundUtils";

const DetailRow = ({
  label,
  value,
  mono,
  copyKey,
  copiedKey,
  onCopy,
  copyLabel,
}) => (
  <Flex justify="space-between" align="flex-start" gap={4} py={2}>
    <Text fontSize="xs" color="gray.500" flexShrink={0}>
      {label}
    </Text>
    <HStack spacing={1} justify="flex-end" minW={0}>
      <Text
        fontSize="xs"
        fontWeight="700"
        color="gray.800"
        fontFamily={mono ? "mono" : undefined}
        textAlign="right"
        wordBreak="break-all"
      >
        {value || "—"}
      </Text>
      {copyKey && value ? (
        <Tooltip label={`Copy ${copyLabel || label}`} hasArrow>
          <IconButton
            size="2xs"
            variant="ghost"
            colorScheme={copiedKey === copyKey ? "green" : "gray"}
            icon={<Icon as={copiedKey === copyKey ? FaCheck : FaCopy} boxSize={2.5} />}
            onClick={() => onCopy(value, copyKey, copyLabel || label)}
            aria-label={`Copy ${copyLabel || label}`}
          />
        </Tooltip>
      ) : null}
    </HStack>
  </Flex>
);

const TimelineStep = ({ title, detail, state, isLast }) => {
  const isDone = state === "done";
  const isFailed = state === "failed";
  const isActive = state === "active";

  const circleBg = isDone
    ? "teal.500"
    : isFailed
    ? "red.500"
    : isActive
    ? "orange.100"
    : "gray.100";
  const iconColor = isDone || isFailed ? "white" : "orange.600";

  return (
    <HStack align="stretch" spacing={3}>
      <VStack spacing={0} align="center">
        <Flex
          w="24px"
          h="24px"
          borderRadius="full"
          bg={circleBg}
          color={iconColor}
          align="center"
          justify="center"
          flexShrink={0}
        >
          {isDone ? (
            <Icon as={FaCheck} boxSize={2.5} />
          ) : isFailed ? (
            <Icon as={FaTimes} boxSize={2.5} />
          ) : (
            <Box
              w="7px"
              h="7px"
              borderRadius="full"
              bg={isActive ? "orange.500" : "gray.300"}
            />
          )}
        </Flex>
        {!isLast ? (
          <Box
            w="1px"
            flex="1"
            minH="28px"
            bg={isDone ? "teal.200" : "gray.200"}
          />
        ) : null}
      </VStack>
      <Box pb={isLast ? 0 : 4} minW={0}>
        <Text
          fontSize="xs"
          fontWeight="800"
          color={isFailed ? "red.600" : "gray.800"}
        >
          {title}
        </Text>
        <Text fontSize="2xs" color="gray.500" mt={0.5} lineHeight="tall">
          {detail}
        </Text>
      </Box>
    </HStack>
  );
};

export default function RefundDetailsDrawer({
  isOpen,
  onClose,
  refund,
  busyAction,
  onApprove,
  onRetry,
  onSendPayout,
}) {
  const toast = useAppToast();
  const [copiedKey, setCopiedKey] = useState("");

  if (!refund) return null;

  const refundId = String(refund._id || refund.id || "");
  const status = getRefundStatusMeta(refund);
  const customer = getRefundCustomer(refund);
  const amountPaise = getRefundAmountPaise(refund);
  const grossPaise = Number(refund.grossPaise || amountPaise);
  const deductionsPaise = Math.max(grossPaise - amountPaise, 0);
  const bookingId = getRefundBookingId(refund);
  const paymentId = getRefundPaymentId(refund);
  const customerId = getRefundCustomerId(refund);
  const awaitingApproval = Boolean(refund.awaitingApproval);
  const processed =
    String(refund.status || "").toLowerCase() === "processed";
  const failed = String(refund.status || "").toLowerCase() === "failed";
  const canRetry = isRefundRetryable(refund);
  const canSendPayout = isRefundPayoutEligible(refund);
  const attempts = Number(refund.attempts || 0);

  const copy = (value, key, label) => {
    if (!value) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(value));
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1600);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied.`,
      status: "info",
      duration: 1800,
      isClosable: true,
    });
  };

  const settlementDetail = processed
    ? `Settled on ${formatDateTime(refund.processedAt || refund.executedAt)}`
    : failed
    ? refund.lastError || "Execution failed. A retry can re-queue this refund."
    : `${getRailLabel(refund.rail)} • attempt ${attempts} of 3`;

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
      <DrawerContent borderLeftRadius="20px" overflow="hidden">
        <DrawerHeader
          px={6}
          py={5}
          bg="gray.50"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <HStack spacing={3} pr={8}>
            <Flex
              w="42px"
              h="42px"
              borderRadius="12px"
              bg="teal.600"
              color="white"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FaUndoAlt} boxSize={5} />
            </Flex>
            <Box minW={0}>
              <Text
                fontSize="2xs"
                fontWeight="800"
                letterSpacing="0.14em"
                color="gray.500"
                textTransform="uppercase"
              >
                Refund record
              </Text>
              <HStack spacing={2} mt={0.5}>
                <Text
                  fontSize="sm"
                  fontWeight="900"
                  fontFamily="mono"
                  color="gray.800"
                >
                  #{refundId.slice(-10)}
                </Text>
                <Tooltip label="Copy refund ID" hasArrow>
                  <IconButton
                    size="2xs"
                    variant="ghost"
                    icon={
                      <Icon
                        as={copiedKey === "refund-id" ? FaCheck : FaCopy}
                        boxSize={2.5}
                      />
                    }
                    onClick={() => copy(refundId, "refund-id", "Refund ID")}
                    aria-label="Copy refund ID"
                  />
                </Tooltip>
              </HStack>
            </Box>
          </HStack>
          <DrawerCloseButton top={4} right={4} />
        </DrawerHeader>

        <DrawerBody px={6} py={5}>
          <VStack spacing={5} align="stretch">
            <Box
              p={5}
              borderRadius="18px"
              bgGradient="linear-gradient(135deg, #0B2424 0%, #0B4444 60%, #008080 100%)"
              color="white"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                right="-30px"
                top="-40px"
                w="150px"
                h="150px"
                borderRadius="full"
                bg="whiteAlpha.100"
              />
              <Text
                fontSize="2xs"
                fontWeight="800"
                letterSpacing="0.14em"
                textTransform="uppercase"
                color="whiteAlpha.700"
              >
                Customer receives
              </Text>
              <Text fontSize="3xl" fontWeight="900" letterSpacing="-0.03em" mt={1}>
                {formatINR(amountPaise)}
              </Text>
              <HStack spacing={2} mt={3} flexWrap="wrap">
                <Badge
                  colorScheme={status.colorScheme}
                  variant="solid"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                >
                  {status.label}
                </Badge>
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                  fontWeight="700"
                >
                  {getRailLabel(refund.rail)}
                </Badge>
              </HStack>

              <Divider my={4} borderColor="whiteAlpha.300" />

              <HStack justify="space-between" align="flex-start">
                <Box>
                  <Text fontSize="2xs" color="whiteAlpha.700" fontWeight="700">
                    Gross payment
                  </Text>
                  <Text fontSize="sm" fontWeight="800">
                    {formatINR(grossPaise)}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="2xs" color="whiteAlpha.700" fontWeight="700">
                    Adjustments
                  </Text>
                  <Text fontSize="sm" fontWeight="800">
                    −{formatINR(deductionsPaise)}
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="14px"
            >
              <Text
                fontSize="2xs"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="0.12em"
                mb={3}
              >
                Refund progress
              </Text>
              <VStack align="stretch" spacing={0}>
                <TimelineStep
                  title="Refund requested"
                  detail={`${formatDateTime(refund.createdAt)} • ${refund.reason || "Customer refund"}`}
                  state="done"
                />
                <TimelineStep
                  title="Approval"
                  detail={
                    awaitingApproval
                      ? "Waiting for a second owner approval before execution."
                      : "Approved and cleared for execution."
                  }
                  state={awaitingApproval ? "active" : "done"}
                />
                <TimelineStep
                  title="Settlement"
                  detail={settlementDetail}
                  state={processed ? "done" : failed ? "failed" : "active"}
                  isLast
                />
              </VStack>
            </Box>

            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="14px"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text
                  fontSize="2xs"
                  fontWeight="800"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                >
                  Customer
                </Text>
                <Icon as={FaShieldAlt} boxSize={3} color="teal.500" />
              </Flex>
              <Text fontSize="sm" fontWeight="800" color="gray.800">
                {customer.name}
              </Text>
              <Text fontSize="2xs" color="gray.500" mt={0.5}>
                {customer.contact || "No contact available"}
              </Text>
              <Divider my={2.5} />
              <DetailRow
                label="Customer ID"
                value={customerId ? `…${customerId.slice(-12)}` : "—"}
                mono
                copyKey="customer-id"
                copiedKey={copiedKey}
                onCopy={copy}
                copyLabel="Customer ID"
              />
            </Box>

            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="14px"
            >
              <Text
                fontSize="2xs"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="0.12em"
                mb={1}
              >
                Ledger references
              </Text>
              <DetailRow
                label="Booking"
                value={bookingId ? `…${bookingId.slice(-12)}` : "—"}
                mono
                copyKey="booking-id"
                copiedKey={copiedKey}
                onCopy={copy}
                copyLabel="Booking ID"
              />
              <DetailRow
                label="Payment"
                value={paymentId ? `…${paymentId.slice(-12)}` : "—"}
                mono
                copyKey="payment-id"
                copiedKey={copiedKey}
                onCopy={copy}
                copyLabel="Payment ID"
              />
              <DetailRow
                label="Refund type"
                value={refund.refundClass || "—"}
              />
              <DetailRow
                label="Fault party"
                value={refund.faultParty || "—"}
              />
              <DetailRow
                label="Share"
                value={`${Number(refund.sharePct || 0)}%`}
              />
              <DetailRow
                label="Attempts"
                value={`${attempts} of 3`}
              />
            </Box>

            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="14px"
            >
              <Text
                fontSize="2xs"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="0.12em"
                mb={2}
              >
                Reason
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                {refund.reason || "No reason provided."}
              </Text>
            </Box>

            {refund.lastError ? (
              <Box
                p={4}
                borderRadius="14px"
                bg="red.50"
                border="1px solid"
                borderColor="red.100"
              >
                <HStack spacing={2} mb={1}>
                  <Icon as={FaTimes} boxSize={3} color="red.500" />
                  <Text fontSize="2xs" fontWeight="800" color="red.700">
                    LAST EXECUTION ERROR
                  </Text>
                </HStack>
                <Text fontSize="xs" color="red.700" lineHeight="tall">
                  {refund.lastError}
                </Text>
              </Box>
            ) : null}

            {refund.providerRefundId ? (
              <Box
                p={4}
                borderRadius="14px"
                bg="teal.50"
                border="1px solid"
                borderColor="teal.100"
              >
                <HStack spacing={2}>
                  <Icon as={FaCheckCircle} boxSize={3} color="teal.600" />
                  <Text fontSize="2xs" fontWeight="800" color="teal.800">
                    Provider refund ID
                  </Text>
                </HStack>
                <Text
                  fontSize="xs"
                  fontFamily="mono"
                  color="teal.900"
                  mt={1}
                  wordBreak="break-all"
                >
                  {refund.providerRefundId}
                </Text>
              </Box>
            ) : null}
          </VStack>
        </DrawerBody>

        <DrawerFooter
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="gray.100"
          bg="gray.50"
        >
          <Flex w="100%" justify="space-between" align="center" gap={3}>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <HStack spacing={2} flexWrap="wrap" justify="flex-end">
              {canSendPayout ? (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<Icon as={FaPaperPlane} boxSize={3} />}
                  onClick={() => onSendPayout(refund)}
                >
                  Send payout
                </Button>
              ) : null}
              {canRetry ? (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="orange"
                  leftIcon={<Icon as={FaRedoAlt} boxSize={3} />}
                  isLoading={busyAction === "retry"}
                  onClick={() => onRetry(refund)}
                >
                  Retry
                </Button>
              ) : null}
              {awaitingApproval ? (
                <Button
                  size="sm"
                  bg="#008080"
                  color="white"
                  _hover={{ bg: "#006666" }}
                  leftIcon={<Icon as={FaFileInvoiceDollar} boxSize={3} />}
                  isLoading={busyAction === "approve"}
                  onClick={() => onApprove(refund)}
                >
                  Approve refund
                </Button>
              ) : null}
            </HStack>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
