/**
 * payoutExportUtils.js
 * Safe CSV export and spreadsheet formula-injection sanitization for RightTouch Payout Console.
 *
 * Implements RFC 4180 compliant CSV generation:
 * - Proper quote escaping for fields with commas, newlines, or quotes
 * - OWASP / CWE-1236 Formula Injection Mitigation:
 *   Prefixes potentially dangerous leading characters (=, +, -, @, \t, \r) with a single quote (')
 *   while preserving valid negative numeric amounts.
 * - Integer paise to INR rupees conversion.
 */

/**
 * Sanitizes a cell value to prevent CSV / Spreadsheet formula injection.
 * @param {any} value
 * @returns {string}
 */
export const sanitizeCsvCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  let str = String(value);

  // If the value starts with formula triggers (=, +, @, \t, \r), prefix with a single quote (')
  // For negative numbers (starts with -), only sanitize if it is NOT a pure number (e.g. -CMD|... vs -125.50)
  if (/^[=+@\t\r]/.test(str)) {
    str = `'${str}`;
  } else if (/^-[A-Za-z_=(@]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180: If the string contains comma, quote, or newline, escape quotes and wrap in quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts a list of withdrawal objects into safe, RFC 4180 CSV text.
 * @param {Array<object>} withdrawals
 * @returns {string}
 */
export const generateWithdrawalsCsv = (withdrawals = []) => {
  if (!Array.isArray(withdrawals) || withdrawals.length === 0) {
    throw new Error("No withdrawal records found to export.");
  }

  const headers = [
    "Withdrawal ID",
    "Technician Name",
    "Mobile Number",
    "Requested Date",
    "Gross Amount (INR)",
    "Commission Deduction (INR)",
    "Penalty Deduction (INR)",
    "Net Payable (INR)",
    "Payout Mode",
    "Status",
    "Bank Ref / UTR",
    "Destination Account",
    "Paid Date",
    "Origin",
    "Admin Note",
  ];

  const rows = withdrawals.map((item) => {
    const grossPaise =
      item.requestedAmountPaise ??
      item.amountPaise ??
      (item.amount ? Math.round(item.amount * 100) : 0);
    const commPaise = item.commissionDeductionPaise ?? (item.commissionAmount ? Math.round(item.commissionAmount * 100) : 0);
    const penaltyPaise = item.penaltyDeductionPaise ?? (item.penaltyAmount ? Math.round(item.penaltyAmount * 100) : 0);
    const netPaise =
      item.netPayoutAmountPaise ??
      item.financials?.netPayoutAmountPaise ??
      grossPaise - (commPaise + penaltyPaise);

    // Resolve technician name & phone safely
    let techName = item.technicianName || "";
    let techPhone = "";
    const tech = item.technicianId || item.technician;
    if (tech && typeof tech === "object") {
      if (tech.userId && typeof tech.userId === "object") {
        techName = techName || `${tech.userId.fname || ""} ${tech.userId.lname || ""}`.trim() || tech.userId.name || "";
        techPhone = tech.userId.mobileNumber || "";
      }
      techName = techName || tech.name || `${tech.fname || ""} ${tech.lname || ""}`.trim();
      techPhone = techPhone || tech.mobileNumber || "";
    }
    if (!techName) techName = "Technician";

    const requestedDate = item.createdAt
      ? new Date(item.createdAt).toISOString().replace("T", " ").slice(0, 19)
      : "";
    const paidDate = item.timestamps?.paidAt || item.paidAt
      ? new Date(item.timestamps?.paidAt || item.paidAt).toISOString().replace("T", " ").slice(0, 19)
      : "";

    const destination = item.payoutDestination || item.bankDetails?.accountNumber
      ? `****${String(item.bankDetails?.accountNumber || item.payoutDestination).slice(-4)}`
      : "";

    return [
      sanitizeCsvCell(item._id || item.withdrawalId || ""),
      sanitizeCsvCell(techName),
      sanitizeCsvCell(techPhone),
      sanitizeCsvCell(requestedDate),
      sanitizeCsvCell((grossPaise / 100).toFixed(2)),
      sanitizeCsvCell((commPaise / 100).toFixed(2)),
      sanitizeCsvCell((penaltyPaise / 100).toFixed(2)),
      sanitizeCsvCell((netPaise / 100).toFixed(2)),
      sanitizeCsvCell(item.payoutMode || "Bank Transfer"),
      sanitizeCsvCell(item.status || "requested"),
      sanitizeCsvCell(item.utr || ""),
      sanitizeCsvCell(destination),
      sanitizeCsvCell(paidDate),
      sanitizeCsvCell(item.origin || "technician_requested"),
      sanitizeCsvCell(item.adminNote || item.reason || ""),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
};

/**
 * Converts approved withdrawals into a batch bank upload CSV file.
 * @param {Array<object>} withdrawals
 * @returns {string}
 */
export const generateBulkBankCsv = (withdrawals = []) => {
  if (!Array.isArray(withdrawals) || withdrawals.length === 0) {
    throw new Error("No approved withdrawal records available for batch bank transfer.");
  }

  const headers = [
    "Payment Reference / Withdrawal ID",
    "Beneficiary Name",
    "Bank Account Number",
    "IFSC Code",
    "Amount (INR)",
    "Payment Mode",
    "Remarks",
  ];

  const rows = withdrawals.map((item) => {
    const grossPaise =
      item.requestedAmountPaise ??
      item.amountPaise ??
      (item.amount ? Math.round(item.amount * 100) : 0);
    const commPaise = item.commissionDeductionPaise ?? 0;
    const penaltyPaise = item.penaltyDeductionPaise ?? 0;
    const netPaise =
      item.netPayoutAmountPaise ??
      item.financials?.netPayoutAmountPaise ??
      grossPaise - (commPaise + penaltyPaise);

    const bank = item.bankDetails || {};
    const tech = item.technicianId || item.technician || {};
    const beneficiaryName =
      bank.accountHolderName ||
      tech.name ||
      (tech.userId ? `${tech.userId.fname || ""} ${tech.userId.lname || ""}`.trim() : "") ||
      "Technician";

    return [
      sanitizeCsvCell(item._id || item.withdrawalId || ""),
      sanitizeCsvCell(beneficiaryName),
      sanitizeCsvCell(bank.accountNumber || item.payoutDestination || ""),
      sanitizeCsvCell(bank.ifscCode || ""),
      sanitizeCsvCell((netPaise / 100).toFixed(2)),
      sanitizeCsvCell(item.payoutMode || "NEFT"),
      sanitizeCsvCell(`RightTouch Payout #${String(item._id || "").slice(-8)}`),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
};

/**
 * Triggers a client-side file download of CSV content with proper BOM and UTF-8 encoding.
 * @param {string} csvContent
 * @param {string} filename
 */
export const downloadCsvFile = (csvContent, filename) => {
  if (!csvContent || typeof csvContent !== "string") {
    throw new Error("Invalid CSV content. Cannot download empty file.");
  }

  // Prepend UTF-8 BOM (\uFEFF) so Excel correctly displays Unicode characters
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
