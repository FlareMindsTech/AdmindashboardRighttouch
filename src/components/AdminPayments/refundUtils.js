const REFUND_STATUS_META = {
  pending_execution: {
    label: "Queued",
    colorScheme: "blue",
    dot: "blue.500",
  },
  initiated: {
    label: "In progress",
    colorScheme: "blue",
    dot: "blue.500",
  },
  processed: {
    label: "Refunded",
    colorScheme: "green",
    dot: "green.500",
  },
  failed: {
    label: "Failed",
    colorScheme: "red",
    dot: "red.500",
  },
  retrying: {
    label: "Retrying",
    colorScheme: "blue",
    dot: "blue.500",
  },
  manual_review: {
    label: "Manual review",
    colorScheme: "orange",
    dot: "orange.500",
  },
  unrefundable_source: {
    label: "Source unavailable",
    colorScheme: "red",
    dot: "red.500",
  },
};

export const REFUND_FILTERS = [
  { key: "all", label: "All refunds" },
  { key: "awaiting", label: "Awaiting approval" },
  { key: "progress", label: "In progress" },
  { key: "refunded", label: "Refunded" },
  { key: "attention", label: "Needs attention" },
];

export const getRefundStatusMeta = (refund) => {
  if (refund?.awaitingApproval) {
    return {
      key: "awaiting_approval",
      label: "Awaiting approval",
      colorScheme: "orange",
      dot: "orange.500",
    };
  }
  const key = String(refund?.status || "pending_execution").toLowerCase();
  const meta = REFUND_STATUS_META[key];
  if (meta) return { key, ...meta };
  return {
    key,
    label: key.replace(/_/g, " "),
    colorScheme: "gray",
    dot: "gray.400",
  };
};

export const getRefundBucket = (refund) => {
  if (refund?.awaitingApproval) return "awaiting";
  const status = String(refund?.status || "").toLowerCase();
  if (status === "processed") return "refunded";
  if (["failed", "manual_review", "unrefundable_source"].includes(status)) {
    return "attention";
  }
  return "progress";
};

export const getRefundAmountPaise = (refund) => {
  const net = Number(refund?.netRefundPaise);
  if (Number.isFinite(net) && net > 0) return net;
  const gross = Number(refund?.grossPaise);
  if (Number.isFinite(gross) && gross > 0) return gross;
  const legacy = Number(refund?.amount);
  return Number.isFinite(legacy) ? Math.round(legacy * 100) : 0;
};

export const formatINR = (paise, { decimals = 2 } = {}) => {
  const value = Number(paise || 0) / 100;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getRefundCustomer = (refund) => {
  const customer = refund?.customerId;
  if (customer && typeof customer === "object") {
    const name = [customer.fname, customer.lname]
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      name: name || refund?.customerName || "Customer",
      contact: customer.mobileNumber || customer.email || "",
      email: customer.email || "",
    };
  }
  return {
    name: refund?.customerName || "Customer",
    contact: refund?.customerPhone || "",
    email: "",
  };
};

export const getRefundPayment = (refund) => {
  const payment = refund?.paymentId;
  return payment && typeof payment === "object" ? payment : null;
};

export const getRefundPaymentId = (refund) => {
  const payment = refund?.paymentId;
  if (payment && typeof payment === "object") {
    return String(payment._id || payment.id || "");
  }
  return String(payment || "");
};

export const getRefundCustomerId = (refund) => {
  const customer = refund?.customerId;
  if (customer && typeof customer === "object") {
    return String(customer._id || customer.id || "");
  }
  return String(customer || "");
};

export const getRefundBookingId = (refund) => {
  if (refund?.bookingId) return String(refund.bookingId);
  const payment = getRefundPayment(refund);
  return String(payment?.bookingId || "");
};

export const getRailLabel = (rail) =>
  rail === "razorpayx_payout"
    ? "Bank / UPI payout"
    : "Original payment method";

export const isRefundRetryable = (refund) => {
  const status = String(refund?.status || "").toLowerCase();
  return (
    refund?.rail !== "razorpayx_payout" &&
    ["failed", "manual_review"].includes(status) &&
    Number(refund?.attempts || 0) < 3
  );
};

export const isRefundPayoutEligible = (refund) => {
  const status = String(refund?.status || "").toLowerCase();
  return (
    !refund?.awaitingApproval &&
    status !== "processed" &&
    refund?.rail !== "razorpayx_payout"
  );
};
