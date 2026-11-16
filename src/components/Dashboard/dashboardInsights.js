import { getFinanceSummary } from "api/finance";
import { getProductDashboard, getSalesReport } from "api/productDashboard";

const unwrapBody = (body) => body?.result ?? body?.data ?? body ?? null;

const pickArray = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];
  const keys = [
    "result",
    "data",
    "sales",
    "rows",
    "items",
    "records",
    "earnings",
    "monthly",
    "trend",
    "series",
    "list",
  ];
  for (const key of keys) {
    if (Array.isArray(body[key])) return body[key];
  }
  return [];
};

const firstFinite = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};

const firstPositive = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
};

const SUCCESS_PAYMENT_STATUSES = new Set(["paid", "success", "captured"]);

const hasPaymentStatus = (row) => {
  const value = row?.paymentStatus ?? row?.payment_status;
  return value !== undefined && value !== null && String(value).trim() !== "";
};

const isSuccessfulSale = (row) => {
  if (!row) return false;
  const status = String(
    row.paymentStatus ?? row.payment_status ?? ""
  ).toLowerCase();
  return SUCCESS_PAYMENT_STATUSES.has(status);
};

const toAmount = (row) => {
  if (!row) return 0;
  const paise = row.totalAmountPaise ?? row.financialSnapshot?.totalAmountPaise;
  return firstPositive(
    paise !== undefined && paise !== null ? Number(paise) / 100 : null,
    row.revenue,
    row.totalRevenue,
    row.totalSales,
    row.sales,
    row.amount,
    row.totalAmount,
    row.earnings,
    row.totalEarnings,
    row.netRevenue,
    row.netEarnings,
    row.paidAmount,
    row.grossAmount,
    row.totalPaid,
    row.total,
    row.value
  );
};

// Unpaid rows in the sales report still carry an order amount, so they must
// never be aggregated as collected revenue.
const toPaidAmount = (row) =>
  hasPaymentStatus(row) && !isSuccessfulSale(row) ? 0 : toAmount(row);

const toBookings = (row) =>
  firstFinite(
    row?.bookings,
    row?.bookingsCount,
    row?.totalBookings,
    row?.orders,
    row?.ordersCount,
    row?.totalOrders,
    row?.count,
    row?.paidCount
  );

export const normalizeFinanceSummary = (body) => {
  const source = unwrapBody(body) || {};
  const services = source.services || {};
  const paid = services.paid || {};
  const unpaid = services.unpaid || {};
  const core = source.summary || {};

  const paidCount = firstFinite(paid.count, source.paidCount);
  const pendingCount = firstFinite(unpaid.count, source.unpaidCount);
  const revenue = firstPositive(
    paid.totalAmount,
    core.totalServiceAmount,
    core.totalCollected,
    source.totalRevenue,
    source.revenue
  );

  return {
    revenue,
    paidCount,
    bookings: paidCount + pendingCount,
    pendingCount,
    totalCollected: firstPositive(core.totalCollected, revenue),
  };
};

export const normalizeProductSummary = (body) => {
  const source = unwrapBody(body) || {};
  return {
    // `totalSalesTurnover` is gross order value (paid + unpaid); only the
    // collected amount may be presented as revenue.
    revenue: firstPositive(
      source.totalPaid,
      source.collectedRevenue,
      source.paidAmount,
      source.totalPaidAmount,
      source.revenue,
      source.totalRevenue
    ),
    bookings: firstFinite(
      source.totalBookingsCount,
      source.bookings,
      source.totalBookings,
      source.orders,
      source.totalOrders
    ),
    products: firstFinite(
      source.totalProductsCount,
      source.products,
      source.totalProducts,
      source.activeProducts
    ),
    paidCount: firstFinite(
      source.paidCount,
      source.paidOrders,
      source.successPayments,
      source.paidOrdersCount,
      source.paidBookingsCount
    ),
  };
};

export const normalizeSalesRows = (body) => {
  const source = unwrapBody(body) || body;

  if (source && Array.isArray(source.labels) && Array.isArray(source.data)) {
    return source.labels.map((label, index) => ({
      label,
      revenue: source.data[index],
    }));
  }

  const rows = pickArray(source);
  return rows;
};

const MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const monthIndexFromToken = (token) => {
  if (token === undefined || token === null) return null;
  if (typeof token === "number" && Number.isFinite(token)) {
    if (token >= 1 && token <= 12) return token - 1;
    if (token >= 0 && token <= 11) return token;
    return null;
  }
  const text = String(token).trim().toLowerCase();
  if (!text) return null;

  const numeric = Number(text);
  if (Number.isFinite(numeric)) {
    if (numeric >= 1 && numeric <= 12) return numeric - 1;
    return null;
  }

  const yearMonth = text.match(/^(\d{4})-(\d{1,2})/);
  if (yearMonth) return Number(yearMonth[2]) - 1;

  const monthName = MONTH_NAMES.findIndex((month) => text.startsWith(month));
  if (monthName >= 0) return monthName;

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.getMonth();
  return null;
};

const monthKeyFromRow = (row, fallbackYear) => {
  if (!row || typeof row !== "object") return null;
  const year = firstFinite(row.year, fallbackYear);
  const candidates = [
    row.date,
    row.createdAt,
    row.updatedAt,
    row.month,
    row.period,
    row.label,
    row.name,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === "string" && /^\d{4}-\d{1,2}/.test(candidate)) {
      const match = candidate.match(/^(\d{4})-(\d{1,2})/);
      return `${Number(match[1])}-${Number(match[2]) - 1}`;
    }

    if (
      typeof candidate === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(candidate)
    ) {
      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${parsed.getMonth()}`;
      }
    }

    if (typeof candidate === "string" && candidate.includes(",")) {
      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${parsed.getMonth()}`;
      }
    }

    const monthIndex = monthIndexFromToken(candidate);
    if (monthIndex !== null) {
      return `${year}-${monthIndex}`;
    }
  }

  return null;
};

export const normalizeMonthlySeries = (body, months = []) => {
  if (!Array.isArray(months) || months.length === 0) return null;
  const source = unwrapBody(body) || body;
  const rows = normalizeSalesRows(source);
  if (rows.length === 0) return null;

  const fallbackYear = Number(months[months.length - 1]?.year) || new Date().getFullYear();
  const bucketMap = new Map();
  rows.forEach((row) => {
    const key = monthKeyFromRow(row, fallbackYear);
    if (!key) return;
    const current = bucketMap.get(key) || { revenue: 0, bookings: 0 };
    current.revenue += toPaidAmount(row);
    current.bookings += toBookings(row);
    bucketMap.set(key, current);
  });

  if (bucketMap.size === 0) return null;

  const series = months.map((month) => {
    const bucket = bucketMap.get(month.key);
    if (!bucket) return null;
    return {
      revenue: bucket.revenue,
      bookings: bucket.bookings,
    };
  });

  return series.some((entry) => entry !== null) ? series : null;
};

const safeCall = async (request) => {
  try {
    const response = await request();
    if (!response || response.error) return null;
    return response.data;
  } catch (error) {
    console.warn("Dashboard insight fetch warning:", error);
    return null;
  }
};

let cachedInsights = null;
let lastInsightsFetchTime = 0;
const INSIGHTS_TTL_MS = 60 * 1000;

export const clearCachedInsightsForTests = () => {
  cachedInsights = null;
  lastInsightsFetchTime = 0;
};

export const fetchDashboardInsights = async (force = false) => {
  const now = Date.now();
  if (!force && cachedInsights && now - lastInsightsFetchTime < INSIGHTS_TTL_MS) {
    return cachedInsights;
  }

  const [financeBody, productBody, salesBody] =
    await Promise.all([
      safeCall(() => getFinanceSummary()),
      safeCall(() => getProductDashboard()),
      safeCall(() => getSalesReport()),
    ]);

  const finance = normalizeFinanceSummary(financeBody);
  const product = normalizeProductSummary(productBody);
  const salesRows = normalizeSalesRows(salesBody);
  const paidSalesRows = salesRows.filter(isSuccessfulSale);

  if (!product.paidCount && paidSalesRows.length > 0) {
    product.paidCount = paidSalesRows.length;
  }

  if (product.revenue <= 0 && paidSalesRows.length > 0) {
    product.revenue = paidSalesRows.reduce(
      (sum, row) => sum + toAmount(row),
      0
    );
  }

  const result = {
    finance,
    product,
    salesRows,
    serviceEarnings: null,
  };

  cachedInsights = result;
  lastInsightsFetchTime = now;

  return result;
};
