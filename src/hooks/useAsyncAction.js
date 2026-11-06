import { useCallback, useRef, useState } from "react";
import { normalizeError } from "errors/normalizeError";
import { useAppToast } from "components/feedback/ToastProvider";

export default function useAsyncAction(action, options = {}) {
  const {
    context,
    errorTitle,
    successTitle,
    successDescription,
    showErrorToast = true,
    showSuccessToast = false,
    onSuccess,
    onError,
    resetOnRun = true,
  } = options;
  const notify = useAppToast();
  const actionRef = useRef(action);
  actionRef.current = action;
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    fieldErrors: {},
    data: null,
  });

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, fieldErrors: {}, data: null });
  }, []);

  const run = useCallback(
    async (...args) => {
      if (resetOnRun) {
        setState((current) => ({
          ...current,
          isLoading: true,
          error: null,
          fieldErrors: {},
        }));
      } else {
        setState((current) => ({ ...current, isLoading: true }));
      }

      try {
        const data = await actionRef.current(...args);
        setState({ isLoading: false, error: null, fieldErrors: {}, data });
        if (showSuccessToast && successTitle) {
          notify.success(successTitle, {
            description: successDescription,
            key: context ? `${context}.success` : undefined,
          });
        }
        if (onSuccess) onSuccess(data);
        return { ok: true, data, error: null };
      } catch (input) {
        const error = normalizeError(input, { title: errorTitle });
        if (error.normalized.isCanceled) {
          setState((current) => ({ ...current, isLoading: false }));
          return { ok: false, data: null, error: null, canceled: true };
        }
        setState({
          isLoading: false,
          error,
          fieldErrors: error.normalized.fieldErrors || {},
          data: null,
        });
        if (showErrorToast) {
          notify.error(error, {
            key: context ? `${context}.error` : undefined,
          });
        }
        if (onError) onError(error);
        return { ok: false, data: null, error };
      }
    },
    [
      context,
      errorTitle,
      notify,
      onError,
      onSuccess,
      resetOnRun,
      showErrorToast,
      showSuccessToast,
      successDescription,
      successTitle,
    ]
  );

  return {
    ...state,
    run,
    execute: run,
    reset,
  };
}
