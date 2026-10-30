import { getFinanceEarnings, getFinanceSummary } from "api/finance";
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
    revenue: firstPositive(
      source.revenue,
      source.totalRevenue,
      source.totalSalesTurnover,
      source.totalPaid
    ),
    bookings: firstFinite(
      source.bookings,
      source.totalBookings,
      source.orders,
      source.totalOrders
    ),
    products: firstFinite(
      source.products,
      source.totalProducts,
      source.activeProducts
    ),
    paidCount: firstFinite(
      source.paidCount,
      source.paidOrders,
      source.successPayments
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
    current.revenue += toAmount(row);
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

  const currentYear = new Date().getFullYear();
  const [financeBody, productBody, salesBody, earningsBody] =
    await Promise.all([
      safeCall(() => getFinanceSummary()),
      safeCall(() => getProductDashboard()),
      safeCall(() => getSalesReport()),
      safeCall(() =>
        getFinanceEarnings({ type: "service", year: currentYear })
      ),
    ]);

  const finance = normalizeFinanceSummary(financeBody);
  const product = normalizeProductSummary(productBody);
  const salesRows = normalizeSalesRows(salesBody);

  if (product.revenue <= 0 && salesRows.length > 0) {
    product.revenue = salesRows.reduce(
      (sum, row) => sum + toAmount(row),
      0
    );
  }

  const result = {
    finance,
    product,
    salesRows,
    serviceEarnings: earningsBody,
  };

  cachedInsights = result;
  lastInsightsFetchTime = now;

  return result;
};
