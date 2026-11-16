import React, { useState } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Icon,
  Tooltip,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useAppToast } from "components/feedback";

export default function PaymentDetailsDrawer({
  isOpen,
  onClose,
  payment,
  onMarkStatus,
  onLookupBooking,
  isDark = false,
}) {
  const toast = useAppToast();
  const [copiedKey, setCopiedKey] = useState("");

  if (!payment) return null;

  const paymentId = payment._id || payment.paymentId || payment.id || "—";
  const bookingId =
    payment.bookingId?._id ||
    payment.bookingId?.bookingId ||
    payment.bookingId ||
    payment.orderId ||
    "";
  const status = String(payment.status || "pending").toLowerCase();
  const isSuccess = status === "success" || status === "captured";
  const isPending = status === "pending" || status === "created";
  const isFailed = status === "failed";

  const amountPaise =
    payment.totalAmountPaise != null
      ? Number(payment.totalAmountPaise)
      : payment.totalAmount != null
      ? Math.round(Number(payment.totalAmount) * 100)
      : payment.amountPaise != null
      ? Number(payment.amountPaise)
      : payment.amount != null
      ? Math.round(Number(payment.amount) * 100)
      : 0;

  const formattedAmount = `₹${(amountPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const paymentMode = (
    payment.mode ||
    payment.provider ||
    payment.paymentMode ||
    payment.gateway ||
    "ONLINE"
  ).toUpperCase();

  const reference =
    payment.transactionReference ||
    payment.razorpayPaymentId ||
    payment.reference ||
    "";

  const customerName =
    payment.customerName ||
    payment.bookingId?.customerName ||
    payment.bookingId?.customer?.name ||
    payment.user?.name ||
    payment.bookingId?.user?.name ||
    "";

  const customerPhone =
    payment.customerPhone ||
    payment.bookingId?.customerPhone ||
    payment.bookingId?.customer?.phone ||
    payment.user?.phone ||
    payment.bookingId?.user?.mobileNumber ||
    "";

  const copyToClipboard = (text, key, label) => {
    if (!text) return;
    const clean = String(text).trim();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(clean);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    toast({
      title: "Copied!",
      description: `${label || "Value"} copied: ${clean}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(3px)" />
      <DrawerContent
        bg={isDark ? "gray.900" : "white"}
        color={isDark ? "white" : "gray.800"}
      >
        {/* Drawer Header */}
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.850" : "gray.50"}
          py={4}
          px={6}
        >
          <HStack justify="space-between" align="center" pr={6}>
            <HStack spacing={3}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="10px"
                bg={
                  isSuccess
                    ? "green.500"
                    : isPending
                    ? "orange.500"
                    : isFailed
                    ? "red.500"
                    : "teal.600"
                }
                color="white"
                align="center"
                justify="center"
              >
                <Icon as={FaFileInvoiceDollar} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="800">
                  Payment Transaction 360°
                </Text>
                <HStack spacing={1}>
                  <Text fontSize="2xs" color="gray.500" fontFamily="mono">
                    ID: #{paymentId.slice(-10)}
                  </Text>
                  <Tooltip label="Copy full Payment ID" hasArrow>
                    <IconButton
                      size="2xs"
                      icon={
                        <Icon
                          as={copiedKey === "pid" ? FaCheck : FaCopy}
                          boxSize={2.5}
                        />
                      }
                      variant="ghost"
                      colorScheme={copiedKey === "pid" ? "green" : "gray"}
                      onClick={() =>
                        copyToClipboard(paymentId, "pid", "Payment ID")
                      }
                      aria-label="Copy Payment ID"
                    />
                  </Tooltip>
                </HStack>
              </Box>
            </HStack>

            <Badge
              colorScheme={
                isSuccess
                  ? "green"
                  : isPending
                  ? "yellow"
                  : isFailed
                  ? "red"
                  : "blue"
              }
              fontSize="2xs"
              px={2.5}
              py={1}
              borderRadius="full"
              textTransform="uppercase"
            >
              {status}
            </Badge>
          </HStack>
          <DrawerCloseButton top={4} right={4} />
        </DrawerHeader>

        {/* Drawer Body */}
        <DrawerBody p={6}>
          <VStack spacing={5} align="stretch">
            {/* Amount & Status Banner */}
            <Box
              p={4}
              borderRadius="14px"
              bg={
                isSuccess
                  ? isDark
                    ? "green.950"
                    : "green.50"
                  : isPending
                  ? isDark
                    ? "orange.950"
                    : "orange.50"
                  : isDark
                  ? "gray.800"
                  : "gray.50"
              }
              border="1.5px solid"
              borderColor={
                isSuccess
                  ? isDark
                    ? "green.800"
                    : "green.200"
                  : isPending
                  ? isDark
                    ? "orange.800"
                    : "orange.200"
                  : isDark
                  ? "gray.700"
                  : "gray.200"
              }
              textAlign="center"
            >
              <Text
                fontSize="2xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Collected Payment Amount
              </Text>
              <Text
                fontSize="3xl"
                fontWeight="900"
                color={
                  isSuccess
                    ? "green.600"
                    : isPending
                    ? "orange.600"
                    : isDark
                    ? "white"
                    : "gray.800"
                }
                my={0.5}
              >
                {formattedAmount}
              </Text>
              <HStack justify="center" spacing={2} mt={1}>
                <Badge
                  colorScheme="teal"
                  variant="subtle"
                  fontSize="2xs"
                  px={2}
                  borderRadius="md"
                >
                  {paymentMode}
                </Badge>
                {payment.provider && (
                  <Badge
                    colorScheme="purple"
                    variant="subtle"
                    fontSize="2xs"
                    px={2}
                    borderRadius="md"
                  >
                    via {payment.provider}
                  </Badge>
                )}
              </HStack>
            </Box>

            {/* Core Transaction Metadata */}
            <Box
              p={4}
              borderRadius="12px"
              bg={isDark ? "gray.800" : "white"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              boxShadow="2xs"
            >
              <Text
                fontSize="2xs"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="0.5px"
                mb={3}
              >
                Transaction Credentials & Rails
              </Text>

              <VStack spacing={2.5} align="stretch" fontSize="xs">
                {/* Reference / UTR */}
                <Flex justify="space-between" align="center">
                  <Text color="gray.500">Transaction Reference:</Text>
                  <HStack spacing={1}>
                    <Text fontWeight="700" fontFamily="mono" color={isDark ? "teal.200" : "teal.700"}>
                      {reference || "—"}
                    </Text>
                    {reference && (
                      <Tooltip label="Copy Reference" hasArrow>
                        <IconButton
                          size="2xs"
                          icon={
                            <Icon
                              as={copiedKey === "ref" ? FaCheck : FaCopy}
                              boxSize={2.5}
                            />
                          }
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(reference, "ref", "Reference")
                          }
                          aria-label="Copy Reference"
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Flex>

                {/* Gateway Order ID */}
                {payment.razorpayOrderId && (
                  <Flex justify="space-between" align="center">
                    <Text color="gray.500">Gateway Order ID:</Text>
                    <HStack spacing={1}>
                      <Text fontWeight="600" fontFamily="mono" fontSize="2xs">
                        {payment.razorpayOrderId}
                      </Text>
                      <Tooltip label="Copy Order ID" hasArrow>
                        <IconButton
                          size="2xs"
                          icon={
                            <Icon
                              as={copiedKey === "oid" ? FaCheck : FaCopy}
                              boxSize={2.5}
                            />
                          }
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(payment.razorpayOrderId, "oid", "Order ID")
                          }
                          aria-label="Copy Order ID"
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>
                )}

                {/* Date Created */}
                <Flex justify="space-between" align="center">
                  <Text color="gray.500">Recorded Date:</Text>
                  <Text fontWeight="600">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </Text>
                </Flex>

                {/* Currency */}
                <Flex justify="space-between" align="center">
                  <Text color="gray.500">Currency & Ledger:</Text>
                  <Text fontWeight="600">
                    {payment.currency || "INR"} (Indian Rupee)
                  </Text>
                </Flex>
              </VStack>
            </Box>

            {/* Linked Booking Card */}
            <Box
              p={4}
              borderRadius="12px"
              bg={isDark ? "gray.800" : "white"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              boxShadow="2xs"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Text
                  fontSize="2xs"
                  fontWeight="800"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  Linked Customer & Booking
                </Text>
                {bookingId && onLookupBooking && (
                  <Button
                    size="2xs"
                    colorScheme="teal"
                    variant="outline"
                    rightIcon={<FaExternalLinkAlt size={8} />}
                    onClick={() => {
                      onLookupBooking(bookingId);
                      onClose();
                    }}
                  >
                    Audit Booking
                  </Button>
                )}
              </Flex>

              <VStack spacing={2.5} align="stretch" fontSize="xs">
                {/* Booking ID */}
                <Flex justify="space-between" align="center">
                  <Text color="gray.500">Booking ID:</Text>
                  <HStack spacing={1}>
                    <Text fontWeight="700" fontFamily="mono" color="blue.600">
                      {bookingId || "Unlinked / Direct"}
                    </Text>
                    {bookingId && (
                      <Tooltip label="Copy Booking ID" hasArrow>
                        <IconButton
                          size="2xs"
                          icon={
                            <Icon
                              as={copiedKey === "bid" ? FaCheck : FaCopy}
                              boxSize={2.5}
                            />
                          }
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(bookingId, "bid", "Booking ID")
                          }
                          aria-label="Copy Booking ID"
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Flex>

                {/* Customer Name */}
                {customerName && (
                  <Flex justify="space-between" align="center">
                    <Text color="gray.500">Customer Name:</Text>
                    <Text fontWeight="700">{customerName}</Text>
                  </Flex>
                )}

                {/* Customer Phone */}
                {customerPhone && (
                  <Flex justify="space-between" align="center">
                    <Text color="gray.500">Contact Number:</Text>
                    <Text fontWeight="600" fontFamily="mono">
                      {customerPhone}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>

            {/* Admin Status Actions */}
            <Box
              p={4}
              borderRadius="12px"
              bg={isDark ? "gray.850" : "gray.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <Text
                fontSize="2xs"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="0.5px"
                mb={2.5}
              >
                Administrative Controls
              </Text>

              <HStack spacing={2}>
                {!isSuccess && (
                  <Button
                    size="xs"
                    colorScheme="green"
                    variant="solid"
                    leftIcon={<FaCheckCircle />}
                    onClick={() => onMarkStatus(payment, "success")}
                    flex="1"
                  >
                    Mark as Captured / Success
                  </Button>
                )}
                {!isFailed && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<FaTimesCircle />}
                    onClick={() => onMarkStatus(payment, "failed")}
                    flex="1"
                  >
                    Mark as Failed
                  </Button>
                )}
              </HStack>
            </Box>
          </VStack>
        </DrawerBody>

        <DrawerFooter
          borderTopWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.850" : "gray.50"}
          py={3}
        >
          <Button size="sm" variant="ghost" onClick={onClose} w="full">
            Close Inspector
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
