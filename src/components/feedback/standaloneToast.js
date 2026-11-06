import React from "react";
import { createStandaloneToast } from "@chakra-ui/toast";
import theme from "theme/theme.js";
import AppToast from "./AppToast";
import { toUserError } from "errors/normalizeError";
import { TOAST_DURATIONS } from "./ToastProvider";

const standaloneToast = createStandaloneToast({
  theme,
  defaultOptions: {
    position: "top-right",
    isClosable: true,
    variant: "solid",
  },
});

const show = ({
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
  const toastId = id || key;
  const effectiveDuration =
    duration === undefined ? TOAST_DURATIONS[status] ?? TOAST_DURATIONS.info : duration;
  const render = (props) =>
    React.createElement(AppToast, {
      ...props,
      title: props.title ?? title,
      description: props.description ?? description,
      action,
      requestId,
    });

  const payload = {
    ...rest,
    id: toastId,
    title,
    description,
    status,
    duration: effectiveDuration,
    isClosable: rest.isClosable !== false,
    render,
  };

  if (toastId && standaloneToast.isActive(toastId)) {
    standaloneToast.update(toastId, payload);
    return toastId;
  }

  standaloneToast(payload);
  return toastId;
};

const error = (input, options = {}) => {
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
};

const appToast = (options) => show(options);
appToast.show = show;
appToast.error = error;
appToast.apiError = error;
appToast.success = (title, options = {}) =>
  show({ ...options, title, status: "success" });
appToast.warning = (title, options = {}) =>
  show({ ...options, title, status: "warning" });
appToast.info = (title, options = {}) =>
  show({ ...options, title, status: "info" });
appToast.close = standaloneToast.close;
appToast.closeAll = standaloneToast.closeAll;
appToast.isActive = standaloneToast.isActive;
appToast.update = standaloneToast.update;

export { appToast };
export default appToast;
