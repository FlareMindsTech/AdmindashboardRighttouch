import React from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import AppModal from "components/common/AppModal";
import StatusBadge from "components/common/StatusBadge";
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
  getBookingPaidPaise,
  getBookingRemainingPaise,
  getBookingTotalPaise,
  getCustomer,
  getPaymentModeLabel,
  getProduct,
  getQuotationNumber,
  getQuotationTotalPaise,
  getRequestNumber,
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
  onManagePayment,
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
  const bookingStatus = String(booking?.status || "").toLowerCase();
  const bookingPaymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();
  const canManagePayment =
    Boolean(booking) &&
    bookingStatus === "active" &&
    bookingPaymentStatus !== "paid" &&
    getBookingRemainingPaise(booking) > 0;

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
            {canManagePayment && (
              <Button size="sm" variant="outline" colorScheme="blue" onClick={() => onManagePayment(booking)}>
                Manage payment
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
          <DetailRow label="Delivery address">
            {getAddress(quotation) !== "—" ? getAddress(quotation) : getAddress(booking || {})}
          </DetailRow>
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
  const paidPaise = getBookingPaidPaise(booking || {});
  const remainingPaise = getBookingRemainingPaise(booking || {});
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
                Manage payment
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
          <DetailRow label="Payment mode">{getPaymentModeLabel(booking.paymentMode || booking.paymentProvider)}</DetailRow>
          <DetailRow label="Payment reference">
            {booking.paymentProviderPaymentId || booking.paymentDetailsSummary || "—"}
          </DetailRow>
          <DetailRow label="Payment requested">
            {booking.paymentRequestedAt ? formatDateTime(booking.paymentRequestedAt) : "Not requested yet"}
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
