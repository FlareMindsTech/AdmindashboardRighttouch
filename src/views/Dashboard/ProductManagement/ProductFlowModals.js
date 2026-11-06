import React, { useEffect, useMemo, useState } from "react";
import { useAppToast } from "components/feedback";
import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import AppModal from "components/common/AppModal";
import StatusBadge from "components/common/StatusBadge";
import { recordManualPaymentForBooking } from "api/quotations";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_LABELS,
  QUOTE_REQUEST_STATUS_COLORS,
  QUOTE_REQUEST_STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatINR,
  getAddress,
  getBookingNumber,
  getBookingTotalPaise,
  getCustomer,
  getProduct,
  getQuotationNumber,
  getQuotationTotalPaise,
  getRequestNumber,
  toRupees,
  unwrapResult,
} from "./productFlowUtils";

const DetailRow = ({ label, children }) => (
  <Grid templateColumns={{ base: "1fr", sm: "160px 1fr" }} gap={1} py={1.5}>
    <Text fontSize="xs" fontWeight="700" color="gray.500">
      {label}
    </Text>
    <Box fontSize="sm" color="gray.800" minW={0}>
      {children || "—"}
    </Box>
  </Grid>
);

export function QuoteRequestDetailModal({
  isOpen,
  onClose,
  request,
  onPrepare,
  onAssign,
  onCancel,
  onDelete,
  isBusy,
}) {
  const customer = getCustomer(request || {});
  const product = getProduct(request || {});
  const status = String(request?.status || "quote_requested").toLowerCase();
  const canAssign = ["quote_requested", "under_review"].includes(status);
  const canPrepare = ["quote_requested", "under_review", "quotation_prepared"].includes(status);
  const canCancel = ["quote_requested", "under_review"].includes(status);
  const canDelete = !["accepted", "quotation_sent", "viewed"].includes(status);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quote Request"
      subtitle={request ? getRequestNumber(request) : "Loading request"}
      size="xl"
      footer={
        request ? (
          <HStack spacing={2} flexWrap="wrap" justify="flex-end">
            {canDelete && (
              <Button size="sm" variant="ghost" colorScheme="red" onClick={() => onDelete(request)} isDisabled={isBusy}>
                Delete
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="outline" colorScheme="orange" onClick={() => onCancel(request)} isDisabled={isBusy}>
                Cancel request
              </Button>
            )}
            {canAssign && (
              <Button size="sm" variant="outline" colorScheme="blue" onClick={() => onAssign(request)} isLoading={isBusy}>
                {status === "under_review" ? "Reassign to me" : "Assign to me"}
              </Button>
            )}
            {canPrepare && (
              <Button size="sm" colorScheme="teal" onClick={() => onPrepare(request)}>
                Prepare quotation
              </Button>
            )}
          </HStack>
        ) : null
      }
    >
      {request ? (
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <StatusBadge
              colorScheme={QUOTE_REQUEST_STATUS_COLORS[status] || "gray"}
              label={QUOTE_REQUEST_STATUS_LABELS[status] || status}
            />
            <Text fontSize="xs" color="gray.500">
              Created {formatDateTime(request.createdAt)}
            </Text>
          </HStack>
          <Divider />
          <DetailRow label="Customer">
            <Text fontWeight="700">{customer.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {customer.phone} · {customer.email}
            </Text>
          </DetailRow>
          <DetailRow label="Product">
            <Text fontWeight="700">{product.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {product.type}
            </Text>
          </DetailRow>
          <DetailRow label="Quantity">{request.quantity || 1}</DetailRow>
          <DetailRow label="Delivery address">{getAddress(request)}</DetailRow>
          <DetailRow label="Preferred contact">{request.preferredContactMethod || "—"}</DetailRow>
          <DetailRow label="Requirement">
            <Text whiteSpace="pre-wrap">{request.requirementDescription || "—"}</Text>
          </DetailRow>
          <DetailRow label="Additional notes">
            <Text whiteSpace="pre-wrap">{request.additionalNotes || "—"}</Text>
          </DetailRow>
          <DetailRow label="Assigned admin">
            {request.assignedAdminId?.name ||
              request.assignedAdminId?.fname ||
              (typeof request.assignedAdminId === "string" ? request.assignedAdminId : "Unassigned")}
          </DetailRow>
          <DetailRow label="Last updated">{formatDateTime(request.updatedAt)}</DetailRow>
        </VStack>
      ) : null}
    </AppModal>
  );
}

export function QuotationDetailModal({
  isOpen,
  onClose,
  quotation,
  booking,
  onSend,
  onResend,
  onRevise,
  onEditDraft,
  onDelete,
  isBusy,
}) {
  const customer = getCustomer(quotation || {});
  const product = getProduct(quotation || {});
  const status = String(quotation?.status || "draft").toLowerCase();
  const snapshot = quotation?.financialSnapshot || {};
  const totalPaise = getQuotationTotalPaise(quotation || {});
  const canSend = status === "draft";
  const canResend = ["sent", "viewed"].includes(status);
  const canRevise = !["accepted", "converted"].includes(status);
  const canDelete = !["accepted", "converted"].includes(status);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quotation"
      subtitle={quotation ? `${getQuotationNumber(quotation)} · revision ${quotation.revision || 1}` : "Loading quotation"}
      size="xl"
      footer={
        quotation ? (
          <HStack spacing={2} flexWrap="wrap" justify="flex-end">
            {canDelete && (
              <Button size="sm" variant="ghost" colorScheme="red" onClick={() => onDelete(quotation)} isDisabled={isBusy}>
                Delete
              </Button>
            )}
            {status === "draft" && (
              <Button size="sm" variant="outline" colorScheme="teal" onClick={() => onEditDraft(quotation)} isDisabled={isBusy}>
                Edit draft
              </Button>
            )}
            {canRevise && status !== "draft" && (
              <Button size="sm" variant="outline" colorScheme="orange" onClick={() => onRevise(quotation)} isDisabled={isBusy}>
                Revise
              </Button>
            )}
            {canResend && (
              <Button size="sm" variant="outline" colorScheme="blue" onClick={() => onResend(quotation)} isLoading={isBusy}>
                Resend
              </Button>
            )}
            {canSend && (
              <Button size="sm" colorScheme="teal" onClick={() => onSend(quotation)} isLoading={isBusy}>
                Send quotation
              </Button>
            )}
          </HStack>
        ) : null
      }
    >
      {quotation ? (
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <StatusBadge
              colorScheme={QUOTATION_STATUS_COLORS[status] || "gray"}
              label={QUOTATION_STATUS_LABELS[status] || status}
            />
            <Text fontSize="xs" color="gray.500">
              Valid until {formatDate(quotation.validUntil)}
            </Text>
          </HStack>
          <Divider />
          <DetailRow label="Customer">
            <Text fontWeight="700">{customer.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {customer.phone} · {customer.email}
            </Text>
          </DetailRow>
          <DetailRow label="Product">
            <Text fontWeight="700">{product.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {product.type}
            </Text>
          </DetailRow>
          <DetailRow label="Quantity">{quotation.quantity || 1}</DetailRow>
          <Divider />
          <DetailRow label="Unit price">{formatINR(snapshot.unitPricePaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Base amount">{formatINR(snapshot.baseAmountPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Installation">{formatINR(snapshot.installationAmountPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Additional charges">{formatINR(snapshot.additionalChargesPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Discount">{formatINR(snapshot.discountPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="GST">{`${snapshot.gstPercent || 0}% · ${formatINR(snapshot.gstAmountPaise, { fromPaise: true })}`}</DetailRow>
          <DetailRow label="Total">
            <Text fontWeight="800" color="teal.700">
              {formatINR(totalPaise, { fromPaise: true })}
            </Text>
          </DetailRow>
          <Divider />
          <DetailRow label="Terms">
            <Text whiteSpace="pre-wrap">{quotation.termsAndConditions || "—"}</Text>
          </DetailRow>
          <DetailRow label="Admin notes">
            <Text whiteSpace="pre-wrap">{quotation.adminNotes || quotation.notes || "—"}</Text>
          </DetailRow>
          <DetailRow label="Sent at">{formatDateTime(quotation.sentAt)}</DetailRow>
          <DetailRow label="Booking">
            {booking ? (
              <Badge colorScheme="green">
                {getBookingNumber(booking)} · {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus}
              </Badge>
            ) : (
              "Not accepted yet"
            )}
          </DetailRow>
        </VStack>
      ) : null}
    </AppModal>
  );
}

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  quotation,
  onRecordPayment,
  onComplete,
  onCancel,
  isBusy,
}) {
  const navigate = useNavigate();
  const customer = getCustomer(booking || {});
  const product = getProduct(booking || {});
  const status = String(booking?.status || "active").toLowerCase();
  const paymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();
  const totalPaise = getBookingTotalPaise(booking || {});
  const paidPaise = Number(booking?.paidAmountPaise || (paymentStatus === "paid" ? totalPaise : 0));
  const remainingPaise = Math.max(0, totalPaise - paidPaise);
  const canPay = status === "active" && paymentStatus !== "paid" && remainingPaise > 0;
  const canComplete = status === "active" && paymentStatus === "paid";
  const canCancel = status === "active" && paymentStatus !== "paid";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Booking"
      subtitle={booking ? getBookingNumber(booking) : "Loading booking"}
      size="xl"
      footer={
        booking ? (
          <HStack spacing={2} flexWrap="wrap" justify="flex-end">
            {paymentStatus === "paid" && (
              <Button size="sm" variant="ghost" onClick={() => navigate("/owner/admin-payments")}>
                Open payments
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="outline" colorScheme="red" onClick={() => onCancel(booking)} isDisabled={isBusy}>
                Cancel booking
              </Button>
            )}
            {canPay && (
              <Button size="sm" variant="outline" colorScheme="blue" onClick={() => onRecordPayment(booking)}>
                Record payment
              </Button>
            )}
            {canComplete && (
              <Button size="sm" colorScheme="teal" onClick={() => onComplete(booking)} isLoading={isBusy}>
                Mark completed
              </Button>
            )}
            {status === "active" && paymentStatus === "paid" && (
              <Text fontSize="xs" color="orange.600" alignSelf="center">
                Paid bookings must be refunded before cancellation.
              </Text>
            )}
          </HStack>
        ) : null
      }
    >
      {booking ? (
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <HStack>
              <StatusBadge
                colorScheme={BOOKING_STATUS_COLORS[status] || "gray"}
                label={BOOKING_STATUS_LABELS[status] || status}
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
          <Divider />
          <DetailRow label="Customer">
            <Text fontWeight="700">{customer.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {customer.phone} · {customer.email}
            </Text>
          </DetailRow>
          <DetailRow label="Product">
            <Text fontWeight="700">{product.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {product.type}
            </Text>
          </DetailRow>
          <DetailRow label="Quantity">{booking.quantity || 1}</DetailRow>
          <DetailRow label="Delivery address">{getAddress(booking)}</DetailRow>
          <Divider />
          <DetailRow label="Total">{formatINR(totalPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Paid">{formatINR(paidPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Remaining">{formatINR(remainingPaise, { fromPaise: true })}</DetailRow>
          <DetailRow label="Payment mode">{booking.paymentMode || "—"}</DetailRow>
          <DetailRow label="Payment reference">
            {booking.paymentProviderPaymentId || booking.paymentDetailsSummary || "—"}
          </DetailRow>
          <DetailRow label="Quotation">
            {quotation ? getQuotationNumber(quotation) : "—"}
          </DetailRow>
          <DetailRow label="Quotation total">
            {quotation ? formatINR(getQuotationTotalPaise(quotation), { fromPaise: true }) : "—"}
          </DetailRow>
        </VStack>
      ) : null}
    </AppModal>
  );
}

export function ManualPaymentModal({ isOpen, onClose, booking, onSaved }) {
  const toast = useAppToast();
  const [form, setForm] = useState({
    amount: "",
    paymentMode: "cash",
    transactionReference: "",
    notes: "Offline payment collected by admin",
  });
  const [saving, setSaving] = useState(false);

  const remainingRupees = useMemo(() => {
    if (!booking) return 0;
    const total = toRupees(getBookingTotalPaise(booking));
    const paid = booking.paidAmountPaise != null
      ? toRupees(booking.paidAmountPaise)
      : Number(booking.paidAmount || (booking.paymentStatus === "paid" ? total : 0));
    return Math.max(0, total - paid);
  }, [booking]);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      amount: remainingRupees > 0 ? String(remainingRupees) : "",
      paymentMode: "cash",
      transactionReference: "",
      notes: "Offline payment collected by admin",
    });
  }, [isOpen, remainingRupees]);

  const submit = async () => {
    const amount = Number(form.amount);
    if (!booking || !Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Enter a valid amount", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    if (remainingRupees > 0 && Math.abs(amount - remainingRupees) > 0.01) {
      toast({
        title: "Full settlement required",
        description: `Record the full remaining balance of ${formatINR(remainingRupees)}. Partial product payments are not supported.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setSaving(true);
    const { data, error } = await recordManualPaymentForBooking(
      booking._id || booking.id,
      {
        amount,
        paymentMode: form.paymentMode,
        transactionReference: form.transactionReference.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }
    );
    setSaving(false);
    if (error) {
      toast.error(error, { title: "Payment not recorded", duration: 4000, isClosable: true });
      return;
    }
    const result = unwrapResult(data);
    toast({
      title: "Payment recorded",
      description: `Recorded ${formatINR(result?.amount ?? amount)} via ${form.paymentMode}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onSaved?.();
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record offline payment"
      subtitle={booking ? getBookingNumber(booking) : ""}
      size="md"
      primaryAction={{
        label: "Record payment",
        onClick: submit,
        isLoading: saving,
        colorScheme: "teal",
      }}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
    >
      <VStack align="stretch" spacing={3}>
        <Text fontSize="sm" color="gray.600">
          Remaining balance: <b>{formatINR(remainingRupees)}</b>
        </Text>
        <FormControl isRequired>
          <FormLabel fontSize="sm">Amount (INR)</FormLabel>
          <Input
            type="number"
            min={1}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontSize="sm">Payment mode</FormLabel>
          <Select
            value={form.paymentMode}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentMode: e.target.value }))}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="upi_direct">UPI direct</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
            <option value="offline">Offline</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Transaction reference</FormLabel>
          <Input
            value={form.transactionReference}
            onChange={(e) => setForm((prev) => ({ ...prev, transactionReference: e.target.value }))}
            placeholder="Optional reference"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Notes</FormLabel>
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </FormControl>
      </VStack>
    </AppModal>
  );
}
