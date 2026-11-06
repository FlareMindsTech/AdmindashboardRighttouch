import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeError } from "errors/normalizeError";
import { useAppToast } from "components/feedback/ToastProvider";

export default function useAsyncResource(fetcher, options = {}) {
  const {
    deps = [],
    initialData = null,
    context,
    errorTitle,
    showErrorToast = true,
    auto = true,
    keepPreviousData = true,
    onSuccess,
    onError,
  } = options;
  const notify = useAppToast();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);
  const requestRef = useRef(0);
  const [state, setState] = useState({
    data: initialData,
    isLoading: Boolean(auto),
    error: null,
    fieldErrors: {},
    requestId: "",
  });
  const depKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (loadOptions = {}) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      const controller = new AbortController();
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
        fieldErrors: {},
        data: keepPreviousData ? current.data : initialData,
      }));

      try {
        const data = await fetcherRef.current({
          signal: controller.signal,
          silent: Boolean(loadOptions.silent),
        });
        if (!mountedRef.current || requestRef.current !== requestId) {
          return { ok: true, data, error: null, stale: true };
        }
        setState({
          data,
          isLoading: false,
          error: null,
          fieldErrors: {},
          requestId: "",
        });
        if (onSuccess) onSuccess(data);
        return { ok: true, data, error: null };
      } catch (input) {
        const error = normalizeError(input, { title: errorTitle });
        if (!mountedRef.current || requestRef.current !== requestId) {
          return { ok: false, data: null, error, stale: true };
        }
        if (error.normalized.isCanceled) {
          setState((current) => ({ ...current, isLoading: false }));
          return { ok: false, data: null, error: null, canceled: true };
        }
        setState((current) => ({
          ...current,
          isLoading: false,
          error,
          fieldErrors: error.normalized.fieldErrors || {},
          requestId: error.normalized.requestId || "",
        }));
        if (showErrorToast && !loadOptions.silent) {
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
      initialData,
      keepPreviousData,
      notify,
      onError,
      onSuccess,
      showErrorToast,
    ]
  );

  useEffect(() => {
    if (!auto) return undefined;
    load();
    return () => {
      requestRef.current += 1;
    };
  }, [auto, depKey, load]);

  return {
    ...state,
    isLoading: state.isLoading,
    error: state.error,
    fieldErrors: state.fieldErrors,
    requestId: state.requestId,
    load,
    retry: load,
    refetch: load,
  };
}
