import React from "react";
import { Badge, Box, HStack } from "@chakra-ui/react";

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

export const STATUS_BADGE_PROPS = {
  px: 2.5,
  py: 1,
  fontSize: "2xs",
  fontWeight: "700",
  borderRadius: "control",
  lineHeight: "1.2",
  minH: "24px",
};

const PRESET_DEFAULT_PROPS = {
  payment: { mt: 1 },
  report: {},
};

export default function StatusBadge(props) {
  const {
    preset,
    status,
    colorScheme,
    map,
    label,
    children,
    showDot = false,
    ...rest
  } = props;

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

  const content = showDot ? (
    <HStack as="span" spacing={1.5} align="center">
      <Box as="span" boxSize="6px" borderRadius="full" bg="currentColor" />
      <Box as="span">{resolvedLabel}</Box>
    </HStack>
  ) : (
    resolvedLabel
  );

  return (
    <Badge
      colorScheme={resolvedScheme}
      {...STATUS_BADGE_PROPS}
      {...defaults}
      {...rest}
    >
      {content}
    </Badge>
  );
}
