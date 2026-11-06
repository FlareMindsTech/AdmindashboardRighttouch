const STATUS_COPY = {
  400: {
    kind: "validation",
    title: "Check the request",
    message: "Some of the submitted details are invalid. Review them and try again.",
  },
  401: {
    kind: "auth",
    title: "Session expired",
    message: "Please sign in again to continue.",
  },
  403: {
    kind: "forbidden",
    title: "Access denied",
    message: "You do not have permission to perform this action.",
  },
  404: {
    kind: "not_found",
    title: "Not found",
    message: "The requested item could not be found.",
  },
  405: {
    kind: "client",
    title: "Action not supported",
    message: "This action is not available right now.",
  },
  408: {
    kind: "timeout",
    title: "Request timed out",
    message: "The server took too long to respond. Please try again.",
  },
  409: {
    kind: "conflict",
    title: "Conflict detected",
    message: "This change conflicts with existing data. Refresh and try again.",
  },
  413: {
    kind: "client",
    title: "File is too large",
    message: "Reduce the file size and try again.",
  },
  415: {
    kind: "client",
    title: "Unsupported file",
    message: "Choose a supported file type and try again.",
  },
  422: {
    kind: "validation",
    title: "Check the details",
    message: "Some fields need your attention. Review the highlighted fields.",
  },
  429: {
    kind: "rate_limit",
    title: "Too many requests",
    message: "Please wait a moment before trying again.",
  },
  500: {
    kind: "server",
    title: "Something went wrong",
    message: "Our server could not complete the request. Please try again.",
  },
  502: {
    kind: "server",
    title: "Service unavailable",
    message: "The service is temporarily unavailable. Please try again.",
  },
  503: {
    kind: "server",
    title: "Service unavailable",
    message: "The service is temporarily unavailable. Please try again.",
  },
  504: {
    kind: "server",
    title: "Server timed out",
    message: "The server took too long to respond. Please try again.",
  },
};

const KIND_COPY = {
  validation: {
    title: "Check the details",
    message: "Some fields need your attention. Review them and try again.",
  },
  auth: {
    title: "Session expired",
    message: "Please sign in again to continue.",
  },
  forbidden: {
    title: "Access denied",
    message: "You do not have permission to perform this action.",
  },
  not_found: {
    title: "Not found",
    message: "The requested item could not be found.",
  },
  conflict: {
    title: "Conflict detected",
    message: "This change conflicts with existing data. Refresh and try again.",
  },
  rate_limit: {
    title: "Too many requests",
    message: "Please wait a moment before trying again.",
  },
  network: {
    title: "Connection problem",
    message: "Check your internet connection and try again.",
  },
  timeout: {
    title: "Request timed out",
    message: "The server took too long to respond. Please try again.",
  },
  server: {
    title: "Something went wrong",
    message: "Our server could not complete the request. Please try again.",
  },
  canceled: {
    title: "Request canceled",
    message: "",
  },
  client: {
    title: "Request could not be completed",
    message: "Review the details and try again.",
  },
  unknown: {
    title: "Something went wrong",
    message: "Please try again. If the issue continues, contact support.",
  },
};

const CODE_COPY = {
  ZONE_OUTSIDE_PARENT_DISTRICT: {
    title: "Zone outside district",
    message: "The zone must be fully inside its parent district boundary.",
  },
  ZONE_OVERLAP_DETECTED: {
    title: "Zone overlap",
    message: "This zone overlaps another zone. Review the boundary and try again.",
  },
  ZONE_REQUIRED: {
    title: "Service zone required",
    message: "This service is only available inside a configured service zone.",
  },
  ZONE_INACTIVE: {
    title: "Service zone inactive",
    message: "Service is currently unavailable in this area.",
  },
  SERVICE_NOT_AVAILABLE: {
    title: "Service unavailable",
    message: "This service is not available at the selected location.",
  },
  ZONE_SERVICE_NOT_MAPPED: {
    title: "Service unavailable in zone",
    message: "This service is not enabled for the selected zone.",
  },
  DISTRICT_REQUIRED: {
    title: "Service district required",
    message: "Select a service district before continuing.",
  },
  NO_ACTIVE_DISTRICT: {
    title: "No active district",
    message: "There is no active service district for this location.",
  },
  SESSION_EXPIRED: {
    title: "Session expired",
    message: "Please sign in again to continue.",
  },
  TOO_MANY_ATTEMPTS: {
    title: "Too many attempts",
    message: "Please wait before trying again.",
  },
  INVALID_CREDENTIALS: {
    title: "Sign-in failed",
    message: "The mobile number or password is incorrect.",
  },
  FORBIDDEN: {
    title: "Access denied",
    message: "You do not have permission to perform this action.",
  },
  NETWORK_ERROR: {
    title: "Connection problem",
    message: "Check your internet connection and try again.",
  },
  SERVER_ERROR: {
    title: "Something went wrong",
    message: "Our server could not complete the request. Please try again.",
  },
  INTERNAL_ERROR: {
    title: "Something went wrong",
    message: "Our server could not complete the request. Please try again.",
  },
  INVALID_ID: {
    title: "Invalid selection",
    message: "The selected record is not valid. Refresh and try again.",
  },
};

const TECHNICAL_MESSAGE_PATTERNS = [
  /^error:\s*\d+$/i,
  /^request failed with status code\s*\d+$/i,
  /^network error$/i,
  /^timeout of \d+ms exceeded$/i,
  /^failed to fetch$/i,
  /^load failed$/i,
  /^unexpected token/i,
  /^cannot read propert/i,
  /^undefined is not/i,
  /^\[object object\]$/i,
  /^internal server error$/i,
  /^something went wrong\.?$/i,
  /^an error occurred$/i,
  /^axioserror/i,
  /^typeerror/i,
  /^referenceerror/i,
  /^syntaxerror/i,
];

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toText = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Error) return value.message || "";
  return "";
};

const stripHtml = (value) =>
  String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeMessage = (value, maxLength = 320) => {
  const raw = toText(value);
  if (!raw) return "";
  if (raw.length > 4000) return "";
  const text = stripHtml(raw);
  if (!text) return "";
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
  }
  if (TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(text))) {
    return "";
  }
  if (/^\s*<!doctype html/i.test(raw) || /^\s*<html/i.test(raw)) {
    return "";
  }
  return text;
};

const getPayload = (input) => {
  if (!input) return null;
  if (input.response?.data !== undefined) return input.response.data;
  if (input.payload !== undefined) return input.payload;
  if (input.data !== undefined && (isObject(input.data) || Array.isArray(input.data))) {
    return input.data;
  }
  if (isObject(input)) return input;
  return null;
};

const readMessage = (payload) => {
  if (!payload) return "";
  if (typeof payload === "string") return sanitizeMessage(payload);
  if (!isObject(payload)) return "";

  const candidates = [
    payload.message,
    payload.error?.message,
    payload.error,
    payload.err,
    payload.detail,
    payload.details?.message,
    payload.reason,
  ];

  for (const candidate of candidates) {
    const message = sanitizeMessage(candidate);
    if (message) return message;
  }

  if (Array.isArray(payload.errors)) {
    const messages = payload.errors
      .map((entry) => {
        if (typeof entry === "string") return sanitizeMessage(entry);
        if (isObject(entry)) {
          return sanitizeMessage(entry.message || entry.msg || entry.detail || entry.reason);
        }
        return "";
      })
      .filter(Boolean);
    if (messages.length) return messages.join(", ");
  }

  return "";
};

const FIELD_KEYS = ["field", "path", "param", "name", "key", "property"];

const readFieldEntry = (entry) => {
  if (!isObject(entry)) return null;
  const field = FIELD_KEYS.map((key) => entry[key]).find(
    (value) => typeof value === "string" && value.trim()
  );
  const message = sanitizeMessage(
    entry.message || entry.msg || entry.detail || entry.reason || entry.error
  );
  if (!field || !message) return null;
  return { field: String(field).trim(), message };
};

const normalizeFieldErrors = (payload) => {
  const fieldErrors = {};
  const unmappedMessages = [];
  if (!isObject(payload)) return { fieldErrors, unmappedMessages };

  const directSources = [payload.fieldErrors, payload.fields];
  for (const source of directSources) {
    if (!isObject(source)) continue;
    Object.entries(source).forEach(([field, value]) => {
      const message = sanitizeMessage(
        isObject(value) ? value.message || value.msg || value.error : value
      );
      if (field && message) fieldErrors[field] = message;
    });
  }

  const details = isObject(payload.details) ? payload.details : null;
  if (details) {
    if (isObject(details.fieldErrors)) {
      Object.entries(details.fieldErrors).forEach(([field, value]) => {
        const message = sanitizeMessage(
          isObject(value) ? value.message || value.msg || value.error : value
        );
        if (field && message) fieldErrors[field] = message;
      });
    }
    if (Array.isArray(details.errors)) {
      details.errors.forEach((entry) => {
        const parsed = readFieldEntry(entry);
        if (parsed) fieldErrors[parsed.field] = parsed.message;
        else {
          const message = sanitizeMessage(entry);
          if (message) unmappedMessages.push(message);
        }
      });
    }
  }

  if (Array.isArray(payload.errors)) {
    payload.errors.forEach((entry) => {
      const parsed = readFieldEntry(entry);
      if (parsed) {
        fieldErrors[parsed.field] = parsed.message;
        return;
      }
      const message = sanitizeMessage(entry);
      if (message) unmappedMessages.push(message);
    });
  }

  return { fieldErrors, unmappedMessages };
};

const readStatus = (input) => {
  const payload = getPayload(input);
  const status =
    input?.response?.status ||
    input?.status ||
    input?.statusCode ||
    payload?.status ||
    payload?.statusCode ||
    input?.payload?.status;
  const parsed = Number(status);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readCode = (input) => {
  const payload = getPayload(input);
  return String(
    input?.code ||
      input?.errorCode ||
      payload?.code ||
      payload?.errorCode ||
      payload?.error?.code ||
      ""
  ).trim();
};

const readRequestId = (input) => {
  const payload = getPayload(input);
  const headers = input?.response?.headers || input?.headers || {};
  const headerValue =
    headers["x-request-id"] ||
    headers["request-id"] ||
    headers["x-correlation-id"] ||
    headers["x-trace-id"];
  return String(
    headerValue || payload?.requestId || payload?.request_id || input?.requestId || ""
  ).trim();
};

const isCanceled = (input) => {
  const code = String(input?.code || "").toUpperCase();
  const name = String(input?.name || "").toLowerCase();
  return (
    code === "ERR_CANCELED" ||
    code === "ABORT_ERR" ||
    name === "cancelederror" ||
    name === "aborterror" ||
    input?.__CANCEL__ === true
  );
};

const isTimeout = (input, status) => {
  const code = String(input?.code || "").toUpperCase();
  const message = String(input?.message || "");
  return (
    status === 408 ||
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    /timeout/i.test(message)
  );
};

const kindForStatus = (status, input) => {
  if (isCanceled(input)) return "canceled";
  if (isTimeout(input, status)) return "timeout";
  if (STATUS_COPY[status]) return STATUS_COPY[status].kind;
  if (!status) {
    if (!input?.response && (input?.request || input?.isAxiosError || input?.name === "TypeError")) {
      return "network";
    }
    return "unknown";
  }
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "unknown";
};

const normalizeError = (input, options = {}) => {
  if (input?.isAppError && input?.normalized && !options.title && !options.message) {
    return input;
  }
  if (input?.isAppError && input?.normalized) {
    const next = {
      ...input.normalized,
      title: options.title || input.normalized.title,
      message: options.message || input.normalized.message,
    };
    const error = new Error(next.message || next.title);
    error.name = "AppError";
    error.isAppError = true;
    error.normalized = next;
    error.status = next.status;
    error.code = next.code;
    error.fieldErrors = next.fieldErrors;
    error.retryable = next.retryable;
    error.requestId = next.requestId;
    error.conflicts = next.conflicts;
    return error;
  }

  const payload = typeof input === "string" ? input : getPayload(input);
  const status = readStatus(input);
  const code = readCode(input);
  const kind = kindForStatus(status, input);
  const statusCopy = STATUS_COPY[status] || KIND_COPY[kind] || KIND_COPY.unknown;
  const codeCopy = CODE_COPY[code] || null;
  const { fieldErrors, unmappedMessages } = normalizeFieldErrors(payload);

  let message = readMessage(payload);
  if (!message && Array.isArray(input?.errors)) {
    message = sanitizeMessage(input.errors.join(", "));
  }
  if (!message) message = sanitizeMessage(input?.message);
  if (!message && unmappedMessages.length) message = unmappedMessages.join(", ");

  if (status === 401) message = "Please sign in again to continue.";
  if (status === 403 && !message) message = statusCopy.message;
  if (status === 429 && !message) message = statusCopy.message;
  if (kind === "network") message = "";
  if (kind === "timeout") message = "";
  if (kind === "canceled") message = "";
  if (kind === "server" && !message) message = statusCopy.message;

  const title = options.title || codeCopy?.title || statusCopy.title || KIND_COPY.unknown.title;
  const fallbackMessage =
    options.message || codeCopy?.message || statusCopy.message || KIND_COPY.unknown.message;
  const finalMessage = options.preferServerMessage === false ? fallbackMessage : message || fallbackMessage;

  const conflicts =
    payload?.conflicts ||
    payload?.conflictingDistricts ||
    payload?.conflictingZones ||
    payload?.details?.conflicts ||
    [];

  const normalized = {
    kind,
    title,
    message: finalMessage,
    status,
    code,
    fieldErrors,
    details: payload?.details ?? payload?.errors ?? null,
    retryable:
      kind === "network" ||
      kind === "timeout" ||
      kind === "server" ||
      status === 408 ||
      status === 429,
    requestId: readRequestId(input),
    conflicts: Array.isArray(conflicts) ? conflicts : [],
    isCanceled: kind === "canceled",
    raw: input,
  };

  const error = new Error(normalized.message || normalized.title);
  error.name = "AppError";
  error.isAppError = true;
  error.normalized = normalized;
  error.status = normalized.status;
  error.code = normalized.code;
  error.fieldErrors = normalized.fieldErrors;
  error.retryable = normalized.retryable;
  error.requestId = normalized.requestId;
  error.conflicts = normalized.conflicts;
  return error;
};

const getErrorMessage = (input, fallback) => {
  if (!input) return fallback || "";
  if (typeof input === "string") return sanitizeMessage(input) || fallback || "";
  const normalized = input?.normalized || normalizeError(input).normalized;
  return normalized.message || fallback || normalized.title || "";
};

const getErrorTitle = (input, fallback) => {
  if (!input) return fallback || KIND_COPY.unknown.title;
  if (typeof input === "string") return fallback || KIND_COPY.unknown.title;
  const normalized = input?.normalized || normalizeError(input).normalized;
  return normalized.title || fallback || KIND_COPY.unknown.title;
};

const isCanceledError = (input) => {
  if (!input) return false;
  if (input?.normalized) return input.normalized.isCanceled === true;
  return isCanceled(input);
};

const toUserError = (input, options = {}) => normalizeError(input, options).normalized;

export {
  CODE_COPY,
  KIND_COPY,
  STATUS_COPY,
  getErrorMessage,
  getErrorTitle,
  isCanceledError,
  normalizeError,
  normalizeFieldErrors,
  sanitizeMessage,
  toUserError,
};
