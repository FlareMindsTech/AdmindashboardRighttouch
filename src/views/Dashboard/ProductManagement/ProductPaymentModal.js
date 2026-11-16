import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Icon,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { FaMoneyBillWave, FaPaperPlane, FaWallet } from "react-icons/fa";
import AppModal from "components/common/AppModal";
import StatusBadge from "components/common/StatusBadge";
import { useAppToast } from "components/feedback";
import {
  recordManualPaymentForBooking,
  requestProductPayment,
} from "api/quotations";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  formatDateTime,
  formatINR,
  getAddress,
  getBookingNumber,
  getBookingPaidPaise,
  getBookingRemainingPaise,
  getBookingTotalPaise,
  getCustomer,
  getPaymentModeLabel,
  getProduct,
  getQuotationNumber,
  unwrapResult,
} from "./productFlowUtils";

const DetailRow = ({ label, children }) => (
  <Grid templateColumns={{ base: "1fr", sm: "145px 1fr" }} gap={1} py={1}>
    <Text fontSize="xs" fontWeight="700" color="gray.500">
      {label}
    </Text>
    <Box fontSize="sm" color="gray.800" minW={0}>
      {children || "—"}
    </Box>
  </Grid>
);

const OptionCard = ({ active, icon, title, description, onClick, isDisabled }) => (
  <Box
    role="button"
    tabIndex={0}
    p={4}
    borderRadius="12px"
    border="1.5px solid"
    borderColor={active ? "teal.400" : "gray.200"}
    bg={active ? "teal.50" : "white"}
    cursor={isDisabled ? "not-allowed" : "pointer"}
    opacity={isDisabled ? 0.55 : 1}
    onClick={() => {
      if (!isDisabled) onClick();
    }}
    onKeyDown={(event) => {
      if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick();
      }
    }}
    transition="all 0.18s ease"
    _hover={isDisabled ? undefined : { borderColor: "teal.300", transform: "translateY(-1px)" }}
  >
    <HStack spacing={3} align="start">
      <Flex
        w="36px"
        h="36px"
        borderRadius="10px"
        bg={active ? "teal.100" : "gray.100"}
        color={active ? "teal.700" : "gray.500"}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon as={icon} boxSize={4} />
      </Flex>
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="800" color={active ? "teal.800" : "gray.800"}>
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500" mt={0.5}>
          {description}
        </Text>
      </Box>
    </HStack>
  </Box>
);

export default function ProductPaymentModal({
  isOpen,
  onClose,
  booking,
  quotation,
  onSaved,
}) {
  const toast = useAppToast();
  const [option, setOption] = useState("app");
  const [mode, setMode] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("Offline payment collected by admin");
  const [requesting, setRequesting] = useState(false);
  const [recording, setRecording] = useState(false);

  const totalPaise = getBookingTotalPaise(booking || {});
  const paidPaise = getBookingPaidPaise(booking || {});
  const remainingPaise = getBookingRemainingPaise(booking || {});
  const remainingRupees = remainingPaise / 100;
  const customer = getCustomer(booking || {});
  const product = getProduct(booking || {});
  const bookingStatus = String(booking?.status || "active").toLowerCase();
  const paymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();
  const canPay = bookingStatus === "active" && paymentStatus !== "paid" && remainingPaise > 0;
  const isBusy = requesting || recording;

  useEffect(() => {
    if (!isOpen) return;
    setOption("app");
    setMode("cash");
    setReference("");
    setNotes("Offline payment collected by admin");
  }, [isOpen, booking?._id]);

  const finish = () => {
    onSaved?.();
    onClose();
  };

  const sendRequest = async () => {
    if (!booking || !canPay) {
      toast({ title: "Payment is not due for this booking", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setRequesting(true);
    const { data, error } = await requestProductPayment(booking._id || booking.id);
    setRequesting(false);
    if (error) {
      toast.error(error, { title: "Payment request not sent", duration: 4000, isClosable: true });
      return;
    }
    const result = unwrapResult(data);
    toast({
      title: "Payment request sent",
      description: `Customer notified to pay ${formatINR(result?.amountPaise ?? remainingPaise, { fromPaise: true })} from the app.`,
      status: "success",
      duration: 3500,
      isClosable: true,
    });
    finish();
  };

  const recordPayment = async () => {
    if (!booking || !canPay) {
      toast({ title: "Payment is not due for this booking", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!Number.isFinite(remainingRupees) || remainingRupees <= 0) {
      toast({ title: "No remaining balance to record", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setRecording(true);
    const { data, error } = await recordManualPaymentForBooking(
      booking._id || booking.id,
      {
        amount: remainingRupees,
        paymentMode: mode,
        transactionReference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      }
    );
    setRecording(false);
    if (error) {
      toast.error(error, { title: "Payment not recorded", duration: 4500, isClosable: true });
      return;
    }
    const result = unwrapResult(data);
    toast({
      title: "Payment recorded",
      description: `${formatINR(result?.amountPaise ?? remainingPaise, { fromPaise: true })} recorded via ${getPaymentModeLabel(result?.paymentMode || mode)}. Customer notified.`,
      status: "success",
      duration: 3500,
      isClosable: true,
    });
    finish();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Product payment"
      subtitle={booking ? `${getBookingNumber(booking)} · ${product.name}` : "Loading booking"}
      icon={FaWallet}
      size="xl"
      isBusy={isBusy}
      primaryAction={
        option === "app"
          ? {
              label: "Send payment request",
              onClick: sendRequest,
              isLoading: requesting,
              isDisabled: !canPay || isBusy,
              colorScheme: "teal",
            }
          : {
              label: "Record full payment",
              onClick: recordPayment,
              isLoading: recording,
              isDisabled: !canPay || isBusy,
              colorScheme: "teal",
            }
      }
      secondaryAction={{ label: "Cancel", onClick: onClose }}
    >
      {booking ? (
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <HStack>
              <StatusBadge
                colorScheme={BOOKING_STATUS_COLORS[bookingStatus] || "gray"}
                label={BOOKING_STATUS_LABELS[bookingStatus] || bookingStatus}
              />
              <StatusBadge
                colorScheme={PAYMENT_STATUS_COLORS[paymentStatus] || "gray"}
                label={PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
              />
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Created {formatDateTime(booking.createdAt)}
            </Text>
          </HStack>

          <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="12px" bg="gray.50">
            <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={3} mb={3}>
              <Box>
                <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                  Total
                </Text>
                <Text fontSize="md" fontWeight="800">{formatINR(totalPaise, { fromPaise: true })}</Text>
              </Box>
              <Box>
                <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                  Paid
                </Text>
                <Text fontSize="md" fontWeight="800" color="green.600">
                  {formatINR(paidPaise, { fromPaise: true })}
                </Text>
              </Box>
              <Box>
                <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                  Remaining
                </Text>
                <Text fontSize="md" fontWeight="800" color={remainingPaise > 0 ? "orange.600" : "green.600"}>
                  {formatINR(remainingPaise, { fromPaise: true })}
                </Text>
              </Box>
            </Grid>
            <Divider mb={3} />
            <DetailRow label="Customer">
              <Text fontWeight="700">{customer.name}</Text>
              <Text fontSize="xs" color="gray.500">{customer.phone} · {customer.email}</Text>
            </DetailRow>
            <DetailRow label="Product">{product.name}</DetailRow>
            <DetailRow label="Delivery address">{getAddress(booking)}</DetailRow>
            <DetailRow label="Quotation">
              {quotation ? getQuotationNumber(quotation) : "—"}
            </DetailRow>
            <DetailRow label="Current payment">{getPaymentModeLabel(booking.paymentMode || booking.paymentProvider)}</DetailRow>
            <DetailRow label="Reference">
              {booking.paymentProviderPaymentId || booking.paymentDetailsSummary || "—"}
            </DetailRow>
            <DetailRow label="Last request">
              {booking.paymentRequestedAt ? formatDateTime(booking.paymentRequestedAt) : "Not requested yet"}
            </DetailRow>
          </Box>

          {paymentStatus === "paid" ? (
            <Alert status="success" borderRadius="10px">
              <AlertIcon />
              This booking is already paid. Refunds are handled from Admin Payments.
            </Alert>
          ) : null}

          <Box>
            <Text fontSize="sm" fontWeight="800" color="gray.800" mb={2}>
              How is the customer paying?
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
              <OptionCard
                active={option === "app"}
                icon={FaPaperPlane}
                title="Customer pays in app"
                description="Send an instant payment request. The customer pays securely from the product orders screen."
                onClick={() => setOption("app")}
                isDisabled={!canPay}
              />
              <OptionCard
                active={option === "offline"}
                icon={FaMoneyBillWave}
                title="Admin records payment"
                description="Record a full offline payment collected by cash, UPI, bank transfer, cheque, or POS card."
                onClick={() => setOption("offline")}
                isDisabled={!canPay}
              />
            </Grid>
          </Box>

          {option === "app" ? (
            <VStack align="stretch" spacing={3} p={4} border="1px solid" borderColor="teal.100" borderRadius="12px">
              <Text fontSize="sm" fontWeight="700">App payment request</Text>
              <Text fontSize="xs" color="gray.600">
                The customer receives an in-app notification and push message with the amount due and a direct link to their product orders. Payment status changes automatically after successful payment.
              </Text>
              {booking.paymentRequestedAt ? (
                <HStack fontSize="xs" color="gray.500">
                  <Text>Last sent:</Text>
                  <Text fontWeight="700">{formatDateTime(booking.paymentRequestedAt)}</Text>
                </HStack>
              ) : null}
              {!canPay ? (
                <Text fontSize="xs" color="orange.600">
                  Payment requests are available only for active bookings with a pending balance.
                </Text>
              ) : null}
            </VStack>
          ) : (
            <VStack align="stretch" spacing={3} p={4} border="1px solid" borderColor="teal.100" borderRadius="12px">
              <Alert status="info" borderRadius="8px" fontSize="xs">
                <AlertIcon />
                This records the full remaining balance, marks the booking paid, and sends a payment-success notification to the customer.
              </Alert>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700">Full amount (INR)</FormLabel>
                <Input
                  value={formatINR(remainingPaise, { fromPaise: true })}
                  isReadOnly
                  fontWeight="800"
                  bg="gray.50"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700">Payment mode</FormLabel>
                <Select size="sm" value={mode} onChange={(event) => setMode(event.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="upi_direct">UPI Direct</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card / POS</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700">Transaction reference / UTR</FormLabel>
                <Input
                  size="sm"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Cash receipt, UTR, or POS reference"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700">Internal note</FormLabel>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Collected by, location, or other context"
                />
              </FormControl>
              {!canPay ? (
                <Text fontSize="xs" color="orange.600">
                  Payment recording is available only for active bookings with a pending balance.
                </Text>
              ) : null}
            </VStack>
          )}
        </VStack>
      ) : null}
    </AppModal>
  );
}
