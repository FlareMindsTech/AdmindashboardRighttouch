import React from "react";
import { Badge } from "@chakra-ui/react";

/**
 * Shared status badge — Phase 1 extraction (visual parity only).
 *
 * Presets preserve the exact status→colorScheme mappings found in source:
 * - preset="payment": Dashboard.js getStatusColor — success/paid/completed/
 *   approved→green, pending/requested→yellow, failed/rejected/cancelled→red,
 *   else gray. Default badge props match Dashboard recent-bookings badge
 *   (size sm, mt 1, fontSize 10px).
 * - preset="report": ReportsManagement.js renderStatusBadge — resolved_refunded/
 *   resolved→green, resolved_no_refund→gray, under_review→blue,
 *   withdrawn→purple, expired→red, else Open/yellow. Default badge props
 *   match that call site (px 2, py 0.5, full radius, 2xs).
 *
 * Pass `colorScheme` directly for one-off cases, or `map` for a custom
 * status→colorScheme function. Explicit props always override preset defaults.
 */

export const paymentStatusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "success" || s === "paid" || s === "completed" || s === "approved")
    return "green";
  if (s === "pending" || s === "requested") return "yellow";
  if (s === "failed" || s === "rejected" || s === "cancelled") return "red";
  return "gray";
};

export const reportStatusMeta = (status) => {
  const st = (status || "").toLowerCase();
  if (st === "resolved_refunded")
    return { colorScheme: "green", label: "Resolved (Refunded)" };
  if (st === "resolved_no_refund")
    return { colorScheme: "gray", label: "Resolved (No Refund)" };
  if (st === "resolved") return { colorScheme: "green", label: "Resolved" };
  if (st === "under_review")
    return { colorScheme: "blue", label: "Under Review" };
  if (st === "withdrawn")
    return { colorScheme: "purple", label: "Withdrawn" };
  if (st === "expired") return { colorScheme: "red", label: "Expired" };
  return { colorScheme: "yellow", label: "Open" };
};

const PRESET_DEFAULT_PROPS = {
  payment: { size: "sm", mt: 1, fontSize: "10px", borderRadius: "full" },
  report: { px: 2, py: 0.5, borderRadius: "full", fontSize: "2xs" },
};

export default function StatusBadge(props) {
  const { preset, status, colorScheme, map, label, children, ...rest } = props;

  let resolvedScheme = colorScheme;
  let resolvedLabel = label !== undefined ? label : children;
  let defaults = {};

  if (preset === "payment") {
    resolvedScheme = resolvedScheme || paymentStatusColor(status);
    if (resolvedLabel === undefined) resolvedLabel = status;
    defaults = PRESET_DEFAULT_PROPS.payment;
  } else if (preset === "report") {
    const meta = reportStatusMeta(status);
    resolvedScheme = resolvedScheme || meta.colorScheme;
    if (resolvedLabel === undefined) resolvedLabel = meta.label;
    defaults = PRESET_DEFAULT_PROPS.report;
  } else if (typeof map === "function") {
    resolvedScheme = resolvedScheme || map(status);
    if (resolvedLabel === undefined) resolvedLabel = status;
  }

  return (
    <Badge colorScheme={resolvedScheme} {...defaults} {...rest}>
      {resolvedLabel}
    </Badge>
  );
}
