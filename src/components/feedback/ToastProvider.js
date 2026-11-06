import React, { createContext, useCallback, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useToast } from "@chakra-ui/react";
import AppToast from "./AppToast";
import { toUserError } from "errors/normalizeError";

const ToastContext = createContext(null);

export const TOAST_DURATIONS = {
  success: 3000,
  info: 3500,
  warning: 5000,
  error: 6000,
};

const GENERIC_ERROR_TITLES = new Set([
  "error",
  "failed",
  "request failed",
  "validation error",
  "fetch error",
  "load error",
  "delete error",
  "update error",
  "cancel error",
  "assign error",
  "revise error",
  "polygon error",
  "cleanup error",
]);

const makeId = (key, status, title) => {
  if (key) return String(key);
  if (!title) return undefined;
  return `${status}-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
};

export function ToastProvider({ children }) {
  const rawToast = useToast({
    position: "top-right",
    isClosable: true,
    variant: "solid",
  });

  const show = useCallback(
    ({
      title,
      description,
      status = "info",
      duration,
      key,
      id,
      action,
      requestId,
      ...rest
    }) => {
      let safeTitle = title;
      let safeDescription = description;
      if (status === "error") {
        const shouldNormalize =
          (typeof description === "string" && description.trim()) || description instanceof Error;
        if (shouldNormalize) {
          const info = toUserError(description);
          if (info.isCanceled) return null;
          safeDescription = info.message || "Please try again.";
          if (!safeTitle || GENERIC_ERROR_TITLES.has(String(safeTitle).trim().toLowerCase())) {
            safeTitle = info.title;
          }
        }
      }
      const toastId = id || makeId(key, status, safeTitle);
      const effectiveDuration =
        duration === undefined ? TOAST_DURATIONS[status] ?? TOAST_DURATIONS.info : duration;
      const render = (props) =>
        React.createElement(AppToast, {
          ...props,
          title: props.title ?? safeTitle,
          description: props.description ?? safeDescription,
          status: props.status ?? status,
          duration: effectiveDuration,
          action,
          requestId,
        });

      const payload = {
        ...rest,
        id: toastId,
        title: safeTitle,
        description: safeDescription,
        status,
        duration: effectiveDuration,
        isClosable: rest.isClosable !== false,
        render,
      };

      if (toastId && rawToast.isActive(toastId)) {
        rawToast.update(toastId, payload);
        return toastId;
      }

      rawToast(payload);
      return toastId;
    },
    [rawToast]
  );

  const error = useCallback(
    (input, options = {}) => {
      if (!input && !options.message) return null;
      const info = toUserError(input, {
        title: options.title,
        message: options.description || options.message,
      });
      if (info.isCanceled) return null;
      if (info.kind === "auth" && !options.allowAuth) return null;
      return show({
        key: options.key || options.context,
        id: options.id,
        title: options.title || info.title,
        description: options.description || info.message,
        status: "error",
        duration: options.duration,
        action: options.action,
        requestId: options.showRequestId === false ? undefined : info.requestId,
        isClosable: options.isClosable,
      });
    },
    [show]
  );

  const success = useCallback(
    (title, options = {}) =>
      show({
        ...options,
        title,
        status: "success",
        duration: options.duration,
      }),
    [show]
  );

  const warning = useCallback(
    (title, options = {}) =>
      show({
        ...options,
        title,
        status: "warning",
        duration: options.duration,
      }),
    [show]
  );

  const info = useCallback(
    (title, options = {}) =>
      show({
        ...options,
        title,
        status: "info",
        duration: options.duration,
      }),
    [show]
  );

  const value = useMemo(() => {
    const toast = (options) => show(options);
    toast.show = show;
    toast.error = error;
    toast.apiError = error;
    toast.success = success;
    toast.warning = warning;
    toast.info = info;
    toast.close = rawToast.close;
    toast.closeAll = rawToast.closeAll;
    toast.isActive = rawToast.isActive;
    toast.update = rawToast.update;
    return toast;
  }, [show, error, success, warning, info, rawToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

ToastProvider.propTypes = {
  children: PropTypes.node,
};

export const useAppToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used inside ToastProvider");
  }
  return context;
};

export default ToastProvider;
