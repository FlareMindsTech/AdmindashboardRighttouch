export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const formatCompactCurrency = (amount) => {
  const value = Number(amount) || 0;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${Math.round(value)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const isSuccessfulPayment = (booking) => {
  const status = (booking?.paymentStatus || "").toLowerCase();
  return status === "success" || status === "paid";
};

export const getBookingAmount = (booking) => {
  if (!booking) return 0;
  const totalPaise = booking?.financialSnapshot?.totalAmountPaise;
  const candidates = [
    totalPaise !== undefined && totalPaise !== null
      ? Number(totalPaise) / 100
      : null,
    booking?.baseAmount,
    booking?.amount,
    booking?.finalAmount,
    booking?.totalAmount,
    booking?.grandTotal,
    booking?.pricing?.totalAmount,
    booking?.pricing?.finalAmount,
  ];
  for (const value of candidates) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return 0;
};

export const getCustomerName = (booking) => {
  const customer =
    booking?.customerSnapshot ||
    (booking?.customerId && typeof booking.customerId === "object"
      ? booking.customerId
      : null) ||
    {};
  const fullName = customer.fname
    ? `${customer.fname} ${customer.lname || ""}`.trim()
    : "";
  return (
    customer.name ||
    fullName ||
    booking?.customerName ||
    booking?.addressSnapshot?.name ||
    "Unknown Customer"
  );
};

export const getBookingItemName = (booking, kind) => {
  if (kind === "product") {
    return (
      booking?.productSnapshot?.productName ||
      booking?.productId?.productName ||
      booking?.productId?.name ||
      booking?.productName ||
      (Array.isArray(booking?.items) && booking.items[0]?.description) ||
      "Unknown Product"
    );
  }
  return (
    booking?.serviceId?.serviceName ||
    booking?.serviceName ||
    "Unknown Service"
  );
};

export const getCategoryRef = (booking, kind) => {
  if (kind === "product") {
    return (
      booking?.categoryId ||
      booking?.category ||
      booking?.productId?.categoryId ||
      booking?.productId?.category ||
      booking?.productSnapshot?.categoryId ||
      booking?.productSnapshot?.category ||
      booking?.productSnapshot?.categoryName
    );
  }
  return (
    booking?.categoryId ||
    booking?.category ||
    booking?.serviceId?.categoryId ||
    booking?.serviceId?.category ||
    booking?.serviceCategory
  );
};

const isObjectId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export const buildDomainAnalytics = (bookingsInput, categoriesInput, kind) => {
  const bookings = Array.isArray(bookingsInput) ? bookingsInput : [];
  const categories = Array.isArray(categoriesInput) ? categoriesInput : [];

  const categoryMap = {};
  categories.forEach((category) => {
    if (!category) return;
    const name = category.category || category.name;
    if (category._id && name) categoryMap[category._id] = name;
  });

  const categoryEntries = Object.values(categoryMap).map((name) => ({
    name,
    lower: name.toLowerCase(),
  }));

  const perfMap = {};
  const namedCategories = new Set();

  categories.forEach((category) => {
    if (!category) return;
    const name = category.category || category.name;
    if (!name) return;
    namedCategories.add(name);
    if (!perfMap[name]) {
      perfMap[name] = {
        name,
        totalBookings: 0,
        revenue: 0,
        successCount: 0,
      };
    }
  });

  let revenue = 0;
  let successPayments = 0;

  bookings.forEach((booking) => {
    if (!booking) return;

    let categoryName = "Uncategorized";
    const categoryRef = getCategoryRef(booking, kind);

    if (categoryRef) {
      if (typeof categoryRef === "string") {
        categoryName = categoryMap[categoryRef] || categoryRef;
      } else if (typeof categoryRef === "object") {
        categoryName =
          categoryRef.category ||
          categoryRef.name ||
          categoryRef.title ||
          "Uncategorized";
      }
    }

    if (categoryName === "Uncategorized" || isObjectId(categoryName)) {
      const itemName = getBookingItemName(booking, kind).toLowerCase();
      if (itemName) {
        for (let i = 0; i < categoryEntries.length; i++) {
          if (itemName.includes(categoryEntries[i].lower)) {
            categoryName = categoryEntries[i].name;
            break;
          }
        }
      }
    }

    if (isObjectId(categoryName)) categoryName = "Uncategorized";
    if (categoryName !== "Uncategorized") namedCategories.add(categoryName);

    if (!perfMap[categoryName]) {
      perfMap[categoryName] = {
        name: categoryName,
        totalBookings: 0,
        revenue: 0,
        successCount: 0,
      };
    }

    perfMap[categoryName].totalBookings += 1;

    if (isSuccessfulPayment(booking)) {
      const amount = getBookingAmount(booking);
      successPayments += 1;
      revenue += amount;
      perfMap[categoryName].successCount += 1;
      perfMap[categoryName].revenue += amount;
    }
  });

  const categoryPerformance = Object.values(perfMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    totalBookings: bookings.length,
    successPayments,
    revenue,
    categoryCount: namedCategories.size,
    categoryPerformance,
  };
};

export const buildMonthlyTrend = (
  serviceBookingsInput,
  productBookingsInput,
  months = 6
) => {
  const now = new Date();
  const buckets = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      year: date.getFullYear(),
      serviceRevenue: 0,
      productRevenue: 0,
      serviceBookings: 0,
      productBookings: 0,
      serviceSuccess: 0,
      productSuccess: 0,
      totalRevenue: 0,
      totalBookings: 0,
      totalSuccess: 0,
    });
  }

  const lookup = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  const applyBookings = (list, kind) => {
    (Array.isArray(list) ? list : []).forEach((booking) => {
      if (!booking) return;
      const date = new Date(
        booking?.createdAt || booking?.scheduledAt || booking?.bookingDate || 0
      );
      if (Number.isNaN(date.getTime())) return;

      const bucket = lookup.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!bucket) return;

      bucket[`${kind}Bookings`] += 1;

      if (isSuccessfulPayment(booking)) {
        bucket[`${kind}Success`] += 1;
        bucket[`${kind}Revenue`] += getBookingAmount(booking);
      }
    });
  };

  applyBookings(serviceBookingsInput, "service");
  applyBookings(productBookingsInput, "product");

  buckets.forEach((bucket) => {
    bucket.totalRevenue = bucket.serviceRevenue + bucket.productRevenue;
    bucket.totalBookings = bucket.serviceBookings + bucket.productBookings;
    bucket.totalSuccess = bucket.serviceSuccess + bucket.productSuccess;
  });

  return buckets;
};

export const percentChange = (current, previous) => {
  const currentValue = Number(current) || 0;
  const previousValue = Number(previous) || 0;
  if (previousValue <= 0) return null;
  return Number(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
  );
};

export const isActiveCatalogItem = (item) => {
  if (!item) return false;
  if (item.isActive === true) return true;
  const status = (item.status || "").toLowerCase();
  return (
    !status ||
    status === "active" ||
    status === "available" ||
    status === "approved" ||
    status === "in stock"
  );
};
