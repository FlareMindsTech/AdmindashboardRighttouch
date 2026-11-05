// Shared helpers for the product quote → quotation → booking admin flow.

export const QUOTE_REQUEST_ACTIVE_STATUSES = [
  "quote_requested",
  "under_review",
  "quotation_prepared",
  "quotation_sent",
  "viewed",
];

export const QUOTE_REQUEST_STATUS_LABELS = {
  quote_requested: "New request",
  under_review: "Under review",
  quotation_prepared: "Quotation prepared",
  quotation_sent: "Quotation sent",
  viewed: "Viewed by customer",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const QUOTATION_STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  superseded: "Superseded",
  converted: "Converted",
};

export const BOOKING_STATUS_LABELS = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
  completed: "Completed",
};

export const QUOTE_REQUEST_STATUS_COLORS = {
  quote_requested: "blue",
  under_review: "orange",
  quotation_prepared: "purple",
  quotation_sent: "teal",
  viewed: "cyan",
  accepted: "green",
  rejected: "red",
  cancelled: "gray",
  expired: "red",
};

export const QUOTATION_STATUS_COLORS = {
  draft: "gray",
  sent: "blue",
  viewed: "cyan",
  accepted: "green",
  rejected: "red",
  expired: "red",
  superseded: "orange",
  converted: "purple",
};

export const BOOKING_STATUS_COLORS = {
  active: "blue",
  completed: "green",
  cancelled: "red",
};

export const PAYMENT_STATUS_COLORS = {
  pending: "orange",
  paid: "green",
  refunded: "purple",
  completed: "green",
};

export const unwrapList = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  if (Array.isArray(data.result)) return data.result;
  if (data.result && typeof data.result === "object") {
    for (const key of keys) {
      if (Array.isArray(data.result[key])) return data.result[key];
    }
    if (Array.isArray(data.result.payments)) return data.result.payments;
  }
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") {
    for (const key of keys) {
      if (Array.isArray(data.data[key])) return data.data[key];
    }
  }
  return [];
};

export const unwrapResult = (data) => {
  if (!data || typeof data !== "object") return data;
  return data.result ?? data.data ?? data;
};

export const toPaise = (rupees) => {
  const value = Number(rupees);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 100));
};

export const toRupees = (paise) => {
  const value = Number(paise);
  if (!Number.isFinite(value)) return 0;
  return value / 100;
};

export const formatINR = (value, { fromPaise = false } = {}) => {
  const amount = fromPaise ? toRupees(value) : Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getCustomer = (entity = {}) => {
  const snapshot = entity.customerSnapshot || {};
  const populated = entity.customerId;
  const user =
    populated && typeof populated === "object" ? populated : {};
  const name =
    snapshot.name ||
    entity.customerName ||
    user.name ||
    [user.fname, user.lname].filter(Boolean).join(" ").trim() ||
    "Customer";
  const phone =
    snapshot.phone || entity.customerPhone || user.mobileNumber || user.phone || "—";
  const email = snapshot.email || entity.customerEmail || user.email || "—";
  return { name, phone, email, raw: user };
};

export const getProduct = (entity = {}) => {
  const snapshot = entity.productSnapshot || {};
  const populated = entity.productId;
  const product =
    populated && typeof populated === "object" ? populated : {};
  const images =
    product.productImages ||
    snapshot.imageUrls ||
    (snapshot.imageUrl ? [snapshot.imageUrl] : []);
  return {
    name:
      snapshot.productName ||
      product.productName ||
      entity.productName ||
      "Product",
    type:
      snapshot.productType ||
      product.productType ||
      entity.productType ||
      "—",
    image: images?.[0] || null,
    raw: product,
  };
};

export const getAddress = (entity = {}) => {
  const address = entity.addressSnapshot || {};
  if (!address || typeof address !== "object") return "—";
  return (
    address.addressLine ||
    [address.city, address.state, address.pincode].filter(Boolean).join(", ") ||
    (address.latitude != null && address.longitude != null
      ? `${address.latitude}, ${address.longitude}`
      : "—")
  );
};

export const getQuoteRequestId = (entity = {}) =>
  entity.quoteRequestId?._id || entity.quoteRequestId || entity.requestId || null;

export const getQuotationTotalPaise = (quotation = {}) => {
  const snapshot = quotation.financialSnapshot || {};
  if (snapshot.totalAmountPaise != null) return Number(snapshot.totalAmountPaise);
  if (Array.isArray(quotation.items) && quotation.items.length > 0) {
    return quotation.items.reduce((sum, item) => {
      const itemSnapshot = item.financialSnapshot || {};
      if (itemSnapshot.totalAmountPaise != null) {
        return sum + Number(itemSnapshot.totalAmountPaise);
      }
      return sum + toPaise(item.total ?? item.unitPrice ?? 0);
    }, 0);
  }
  if (quotation.finalAmountPaise != null) return Number(quotation.finalAmountPaise);
  if (quotation.totalAmountPaise != null) return Number(quotation.totalAmountPaise);
  if (quotation.finalAmount != null) return toPaise(quotation.finalAmount);
  return 0;
};

export const getBookingTotalPaise = (booking = {}) => {
  if (booking.amountPaise != null) return Number(booking.amountPaise);
  const snapshot = booking.financialSnapshot || {};
  if (snapshot.totalAmountPaise != null) return Number(snapshot.totalAmountPaise);
  if (booking.totalAmountPaise != null) return Number(booking.totalAmountPaise);
  if (booking.amount != null) return toPaise(booking.amount);
  return 0;
};

export const getBookingNumber = (booking = {}) =>
  booking.bookingNumber ||
  booking.orderNumber ||
  (booking._id ? `ORD-${String(booking._id).slice(-6).toUpperCase()}` : "—");

export const getRequestNumber = (request = {}) =>
  request.requestNumber ||
  (request._id ? `REQ-${String(request._id).slice(-6).toUpperCase()}` : "—");

export const getQuotationNumber = (quotation = {}) =>
  quotation.quotationNumber ||
  (quotation._id ? `QUO-${String(quotation._id).slice(-6).toUpperCase()}` : "—");

export const isDeletableQuoteRequest = (request = {}) =>
  !["accepted", "quotation_sent", "viewed"].includes(
    String(request.status || "").toLowerCase()
  );

export const isDeletableQuotation = (quotation = {}) =>
  !["accepted", "converted"].includes(
    String(quotation.status || "").toLowerCase()
  );

export const canSendQuotation = (quotation = {}) =>
  String(quotation.status || "").toLowerCase() === "draft";

export const canResendQuotation = (quotation = {}) =>
  ["sent", "viewed"].includes(String(quotation.status || "").toLowerCase());

export const canReviseQuotation = (quotation = {}) =>
  !["accepted", "converted"].includes(
    String(quotation.status || "").toLowerCase()
  );

export const bookingByQuotationId = (bookings = []) => {
  const map = new Map();
  bookings.forEach((booking) => {
    const quotationId =
      booking.quotationId?._id || booking.quotationId || booking.quotation?._id;
    if (quotationId) map.set(String(quotationId), booking);
  });
  return map;
};
