// src/components/Scheduling/schedulingFormatters.js
// Human-friendly data formatters and translators for scheduling & dispatch data

/**
 * Format date and time in an intuitive, human-friendly readable string
 * e.g. "Today at 2:30 PM", "Yesterday at 11:15 AM", or "12 Nov 2026, 4:00 PM"
 */
export const formatFriendlyDateTime = (dateVal) => {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return String(dateVal);
  }
};

/**
 * Format relative time (e.g. "2 mins ago", "1 hour ago", "Just now")
 */
export const formatFriendlyRelativeTime = (dateVal) => {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "—";

    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return "In the future";

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch (e) {
    return "—";
  }
};

/**
 * Clean INR Currency Formatter (handles both paise and rupees)
 */
export const formatFriendlyCurrency = (amountPaiseOrRupees, isPaise = false) => {
  if (amountPaiseOrRupees == null) return "₹0.00";
  const num = Number(amountPaiseOrRupees);
  if (isNaN(num)) return "₹0.00";

  const rupees = isPaise ? num / 100 : num;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Clean human-readable address formatter from string or object
 */
export const formatFriendlyAddress = (addr) => {
  if (!addr) return "Customer address not specified";
  if (typeof addr === "string") return addr;

  const parts = [];
  if (addr.houseNumber || addr.doorNumber) parts.push(`Door ${addr.houseNumber || addr.doorNumber}`);
  if (addr.addressLine) parts.push(addr.addressLine);
  if (addr.addressLine1 || addr.street) parts.push(addr.addressLine1 || addr.street);
  if (addr.addressLine2) parts.push(addr.addressLine2);
  if (addr.landmark) parts.push(`Near ${addr.landmark}`);
  if (addr.area || addr.locality || addr.city) {
    parts.push(addr.area || addr.locality || addr.city);
  }
  if (addr.state) parts.push(addr.state);
  if (addr.postalCode || addr.pincode) parts.push(`PIN: ${addr.postalCode || addr.pincode}`);
  if (addr.country) parts.push(addr.country);

  return parts.length > 0 ? parts.join(", ") : "Address on file";
};

const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
};

const personFullName = (person) => {
  if (!person || typeof person !== "object") return "";
  const direct = firstText(
    person.name,
    person.fullName,
    person.displayName,
    person.customerName,
    person.technicianName
  );
  if (direct) return direct;
  const combined = firstText(
    `${firstText(person.fname, person.firstName)} ${firstText(
      person.lname,
      person.lastName
    )}`.trim(),
    `${firstText(person.firstName)} ${firstText(person.lastName)}`.trim()
  );
  if (combined) return combined;
  return (
    personFullName(person.userId) ||
    personFullName(person.user) ||
    personFullName(person.profile) ||
    personFullName(person.customerId)
  );
};

const personPhoneNumber = (person) => {
  if (!person || typeof person !== "object") return "";
  return firstText(
    person.mobileNumber,
    person.mobile,
    person.phone,
    person.phoneNumber,
    person.contactNumber,
    person.contact,
    person.userId?.mobileNumber,
    person.userId?.phone,
    person.user?.mobileNumber,
    person.user?.phone,
    person.profile?.mobileNumber,
    person.profile?.phone
  );
};

export const getBookingCustomerName = (booking) => {
  if (!booking) return "Customer";
  const name =
    personFullName(booking.customerSnapshot) ||
    personFullName(booking.customerId) ||
    personFullName(booking.customer) ||
    personFullName(booking.user) ||
    personFullName(booking.userId) ||
    firstText(
      booking.customerName,
      booking.addressSnapshot?.name,
      booking.addressId?.name
    );
  return name || "Customer";
};

export const getBookingCustomerPhone = (booking) => {
  if (!booking) return "";
  return (
    personPhoneNumber(booking.customerSnapshot) ||
    personPhoneNumber(booking.customerId) ||
    personPhoneNumber(booking.customer) ||
    personPhoneNumber(booking.user) ||
    personPhoneNumber(booking.userId) ||
    firstText(
      booking.customerPhone,
      booking.addressSnapshot?.phone,
      booking.addressId?.phone
    )
  );
};

const normalizeStatusKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

export const getLatestAssignmentAttempt = (booking) => {
  const attempts = Array.isArray(booking?.assignmentAttempts)
    ? booking.assignmentAttempts
    : [];
  return attempts.length ? attempts[attempts.length - 1] : null;
};

export const getAssignmentReleaseLabel = (reason) => {
  const key = normalizeStatusKey(reason);
  const labels = {
    on_the_way_timeout: "On-the-way timeout",
    schedule_travel_no_show: "Scheduled travel no-show",
    technician_cancel: "Technician cancelled",
    customer_cancel: "Customer cancelled",
    booking_expired: "Booking expired",
    technician_no_action: "Technician no action",
    no_technician_accept: "No technician accepted",
    slot_hold_expired: "Slot hold expired",
  };
  return labels[key] || (reason ? String(reason).replace(/_/g, " ") : "");
};

export const getExpiredBookingDescription = (booking) => {
  const latestAssignment = getLatestAssignmentAttempt(booking);
  if (
    booking?.cancelReason === "technician_no_action" ||
    latestAssignment?.status === "released"
  ) {
    return "The assigned technician was released and no replacement accepted before the booking expired.";
  }
  if (booking?.cancelReason === "slot_hold_expired") {
    return "The slot hold expired before a technician accepted the booking.";
  }
  return "No technician accepted before the booking expired.";
};

export const getBookingTechnicianInfo = (booking) => {
  if (!booking) return null;
  const latestAssignment = getLatestAssignmentAttempt(booking);
  const statusKey = normalizeStatusKey(booking.status);
  const assignmentStatusKey = normalizeStatusKey(booking.assignmentStatus);
  const isCompleted = statusKey === "completed";
  const isHistoricalStatus = ["expired", "cancelled", "canceled"].includes(
    statusKey
  );
  const resolveIsCurrent = (hasTechnician) =>
    Boolean(hasTechnician) &&
    !isHistoricalStatus &&
    (isCompleted || assignmentStatusKey !== "released");
  const hasCurrentTechnician = Boolean(
    booking.technicianId ||
      booking.technician ||
      booking.assignedTechnician ||
      booking.technicianDetails ||
      booking.acceptedTechnician ||
      booking.provider
  );
  const isCurrent = resolveIsCurrent(hasCurrentTechnician);

  const sources = [
    booking.technician,
    booking.technicianId,
    booking.assignedTechnician,
    booking.technicianDetails,
    booking.acceptedTechnician,
    booking.provider,
  ];

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const name = personFullName(source);
    const phone = personPhoneNumber(source);
    if (name || phone) {
      return {
        name: name || "Technician",
        phone,
        mobileNumber: phone,
        id: firstText(source._id, source.id, source.technicianId),
        raw: source,
        isCurrent,
        isCompleted,
        latestAssignment,
      };
    }
  }

  const snapshot = booking.technicianSnapshot || {};
  const name = firstText(
    snapshot.name,
    booking.technicianName,
    booking.assignedTechnicianName
  );
  const phone = firstText(
    snapshot.mobile,
    snapshot.phone,
    booking.technicianMobile,
    booking.technicianPhone
  );

  if (!name && !phone) return null;

  return {
    name: name || "Technician",
    phone,
    mobileNumber: phone,
    id: firstText(
      snapshot._id,
      snapshot.id,
      typeof booking.technicianId === "string" ? booking.technicianId : "",
      booking.technicianId?._id,
      latestAssignment?.technicianId ? String(latestAssignment.technicianId) : ""
    ),
    raw: snapshot,
    isCurrent: resolveIsCurrent(Boolean(name || phone)),
    isCompleted,
    latestAssignment,
  };
};

export const getBookingScheduleInfo = (booking) => {
  if (!booking) return { date: null, timeLabel: "" };
  const date =
    booking.scheduledAt ||
    booking.slotStartAt ||
    booking.bookingDate ||
    booking.scheduledDate ||
    booking.slotDate ||
    booking.scheduledFor ||
    booking.serviceDate ||
    booking.appointmentDate ||
    booking.scheduledDateLocal ||
    booking.createdAt ||
    null;
  const timeLabel = firstText(
    booking.slotLabel,
    booking.scheduledTimeLocal,
    booking.slotValue,
    booking.bookingTime,
    booking.slotTime,
    booking.scheduledTime
  );
  return { date, timeLabel };
};

export const getBookingAmount = (booking) => {
  if (!booking) return 0;
  const paiseCandidates = [
    booking.financialSnapshot?.totalAmountPaise,
    booking.totalAmountPaise,
    booking.paidAmountPaise,
  ];
  for (const value of paiseCandidates) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount / 100;
  }

  const rupeeCandidates = [
    booking.baseAmount,
    booking.amount,
    booking.finalAmount,
    booking.totalAmount,
    booking.grandTotal,
    booking.paidAmount,
    booking.pricing?.totalAmount,
    booking.pricing?.finalAmount,
    booking.serviceId?.serviceCost,
  ];
  for (const value of rupeeCandidates) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return 0;
};

export const normalizeBroadcastAudit = (raw) => {
  if (!raw) return null;
  const root =
    raw?.result && typeof raw.result === "object"
      ? raw.result
      : raw?.data && typeof raw.data === "object"
      ? raw.data
      : raw;
  if (!root) return null;

  const payload = root.broadcastAudit || root.audit || root;
  const candidateSource = Array.isArray(payload)
    ? payload
    : payload?.candidates || payload?.offers || payload?.deliveries || [];

  const candidates = (Array.isArray(candidateSource) ? candidateSource : []).map(
    (candidate) => ({
      ...candidate,
      offeredAt:
        candidate.offeredAt ||
        candidate.notifiedAt ||
        candidate.sentAt ||
        candidate.createdAt ||
        null,
      respondedAt:
        candidate.respondedAt ||
        candidate.acceptedAt ||
        candidate.releasedAt ||
        candidate.rejectedAt ||
        candidate.declinedAt ||
        candidate.expiredAt ||
        null,
    })
  );

  return {
    ...(Array.isArray(payload) ? {} : payload),
    bookingId: root.bookingId || payload?.bookingId,
    status: root.status || payload?.status,
    version:
      root.activeBroadcastVersion ||
      payload?.activeBroadcastVersion ||
      payload?.version ||
      1,
    assignedTechnicianId:
      root.assignedTechnicianId || payload?.assignedTechnicianId,
    candidates,
  };
};

/**
 * Human-friendly explanation of dispatch errors
 */
export const formatFriendlyDispatchError = (err) => {
  if (!err) return { title: "Unknown error", details: "No error details logged." };

  let raw = "";
  if (typeof err === "object") {
    raw = err.message || err.error || err.lastError || err.reason || JSON.stringify(err);
  } else {
    raw = String(err);
  }

  const low = raw.toLowerCase();

  if (low.includes("econnrefused") || low.includes("redis")) {
    return {
      title: "Queue Connection Issue",
      details: "Could not reach the Redis dispatch worker engine. Check worker status and click 'Restart Worker'.",
      raw,
    };
  }

  if (low.includes("duplicate") || low.includes("conflict") || low.includes("409") || low.includes("already queued")) {
    return {
      title: "Already Active in Queue",
      details: "This booking is already currently in-flight or actively being broadcasted to technicians.",
      raw,
    };
  }

  if (low.includes("not found") || low.includes("404")) {
    return {
      title: "Booking Not Found",
      details: "The associated booking record may have been deleted or archived.",
      raw,
    };
  }

  if (low.includes("no technician") || low.includes("out of range") || low.includes("no eligible")) {
    return {
      title: "No Eligible Technicians in Zone",
      details: "No active verified technicians found matching the service skill and geographic radius for this slot.",
      raw,
    };
  }

  if (low.includes("timeout") || low.includes("timed out")) {
    return {
      title: "Dispatch Timed Out",
      details: "The dispatch operation timed out waiting for worker response. Click 'Retry' to re-attempt.",
      raw,
    };
  }

  return {
    title: "Dispatch Failed",
    details: raw.length > 90 ? `${raw.slice(0, 90)}...` : raw,
    raw,
  };
};

/**
 * Google Maps link generator for coordinates
 */
export const getGoogleMapsUrl = (lat, lng) => {
  if (!lat || !lng) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
};

/**
 * Translate candidate response status into a human-friendly badge configuration
 */
export const getFriendlyCandidateStatus = (statusStr) => {
  const s = String(statusStr || "offered").toLowerCase();

  if (s === "accepted" || s === "winner" || s === "assigned" || s === "confirmed") {
    return { label: "Accepted", color: "teal", icon: "check", desc: "Technician accepted the job offer" };
  }
  if (s === "declined" || s === "rejected" || s === "refused") {
    return { label: "Rejected", color: "red", icon: "times", desc: "Technician rejected the job offer" };
  }
  if (s === "released") {
    return { label: "Released", color: "gray", icon: "times", desc: "Technician was released from this booking" };
  }
  if (s === "expired" || s === "timeout" || s === "timedout" || s === "timed_out") {
    return { label: "Expired", color: "orange", icon: "clock", desc: "No response within the offer window" };
  }
  if (s === "suppressed" || s === "busy" || s === "unavailable") {
    return { label: "Busy / On Job", color: "gray", icon: "ban", desc: "Technician is currently engaged on another service" };
  }
  if (s === "cancelled" || s === "canceled") {
    return { label: "Cancelled", color: "gray", icon: "times", desc: "Offer was cancelled before a response" };
  }
  if (s === "pending" || s === "awaiting" || s === "sent" || s === "offered" || s === "notified" || s === "delivered") {
    return { label: "Offer Sent", color: "gray", icon: "bullhorn", desc: "Offer is waiting for the technician to respond" };
  }
  return { label: "Offer Sent", color: "gray", icon: "bullhorn", desc: "Offer dispatched to technician app" };
};

/**
 * Detect whether a booking is instant or scheduled, with safe fallbacks.
 */
export const getBookingTypeMeta = (booking) => {
  const scheduledMeta = {
    key: "scheduled",
    label: "Scheduled",
    color: "gray",
    description: "Booked for a future time slot",
  };
  const instantMeta = {
    key: "instant",
    label: "Instant",
    color: "teal",
    description: "Technician matching starts immediately",
  };

  if (!booking) return scheduledMeta;

  const markers = [
    booking.bookingType,
    booking.bookingMode,
    booking.scheduleType,
    booking.dispatchType,
    booking.serviceMode,
    booking.timePreference,
  ]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();

  const explicitInstant =
    booking.isInstant === true ||
    booking.instant === true ||
    booking.instantBooking === true ||
    /instant|immediate|on[\s_-]?demand|right[\s_-]?now|asap/.test(markers);

  const explicitScheduled =
    booking.isScheduled === true ||
    booking.scheduled === true ||
    /sched|slot|appointment|future|later/.test(markers);

  if (explicitInstant) return instantMeta;
  if (explicitScheduled) return scheduledMeta;

  const createdTime = new Date(
    booking.createdAt || booking.created_at || booking.bookedAt || 0
  ).getTime();
  const scheduledTime = new Date(
    booking.bookingDate ||
      booking.scheduledDate ||
      booking.scheduledAt ||
      booking.slotStartAt ||
      booking.slotDate ||
      booking.scheduledFor ||
      0
  ).getTime();

  if (createdTime && scheduledTime) {
    return scheduledTime - createdTime > 60 * 60 * 1000
      ? scheduledMeta
      : instantMeta;
  }

  if (!scheduledTime) return instantMeta;
  if (scheduledTime > Date.now() + 60 * 60 * 1000) return scheduledMeta;

  return instantMeta;
};

/**
 * Normalize broadcast wave counts for consistent tracking across views.
 */
export const getBroadcastSummary = (broadcastAudit) => {
  const candidates =
    broadcastAudit?.candidates ||
    broadcastAudit?.offers ||
    broadcastAudit?.deliveries ||
    [];

  const counts = {
    accepted: 0,
    rejected: 0,
    expired: 0,
    busy: 0,
    cancelled: 0,
    pending: 0,
  };

  candidates.forEach((candidate) => {
    const status = String(
      candidate?.status || candidate?.state || candidate?.response || "offered"
    ).toLowerCase();

    if (["accepted", "winner", "assigned", "confirmed"].includes(status)) {
      counts.accepted += 1;
    } else if (["declined", "rejected", "refused"].includes(status)) {
      counts.rejected += 1;
    } else if (
      ["expired", "timeout", "timedout", "timed_out"].includes(status)
    ) {
      counts.expired += 1;
    } else if (["suppressed", "busy", "unavailable"].includes(status)) {
      counts.busy += 1;
    } else if (["cancelled", "canceled", "released"].includes(status)) {
      counts.cancelled += 1;
    } else {
      counts.pending += 1;
    }
  });

  const rawTotal =
    broadcastAudit?.totalOffers ??
    broadcastAudit?.offersCount ??
    candidates.length;

  const totalOffers = Number.isFinite(Number(rawTotal))
    ? Number(rawTotal)
    : candidates.length;

  const acceptedRaw = broadcastAudit?.acceptedCount ?? counts.accepted;
  const accepted =
    Number(acceptedRaw) > 0
      ? Number(acceptedRaw)
      : broadcastAudit?.winnerId
      ? 1
      : 0;

  const rejected = Number(
    broadcastAudit?.declinedCount ??
      broadcastAudit?.rejectedCount ??
      counts.rejected
  );
  const expired = Number(
    broadcastAudit?.expiredCount ??
      broadcastAudit?.timedOutCount ??
      counts.expired
  );
  const busy = Number(
    broadcastAudit?.suppressedCount ?? broadcastAudit?.busyCount ?? counts.busy
  );

  const cancelled = Number(
    broadcastAudit?.cancelledCount ??
      broadcastAudit?.releasedCount ??
      counts.cancelled
  );

  const explicitPending = broadcastAudit?.pendingCount;
  const pending =
    explicitPending != null
      ? Number(explicitPending)
      : totalOffers > 0
      ? Math.max(
          0,
          totalOffers - accepted - rejected - expired - busy - cancelled
        )
      : counts.pending;

  return {
    totalOffers,
    accepted,
    rejected,
    expired,
    busy,
    cancelled,
    pending,
  };
};

