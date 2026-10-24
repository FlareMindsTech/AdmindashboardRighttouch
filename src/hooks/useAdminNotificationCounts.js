// Phase 3: selector facade over the Redux notifications slice.
//
// Public interface is unchanged ({ counts, fetchCounts, markModuleRead }) so
// existing consumers (Sidebar desktop + responsive) keep working untouched.
// Polling, focus/storage listeners, and cross-tab sync moved to
// useNotificationCoordinator (mounted once in layouts/Admin.js) — this hook
// owns NO timers or listeners, so no duplicate polling can occur.
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchModuleCounts,
  markModuleRead as markModuleReadThunk,
  selectModuleCounts,
} from "store/slices/notificationsSlice";

export const useAdminNotificationCounts = () => {
  const dispatch = useAppDispatch();
  const counts = useAppSelector(selectModuleCounts);

  const fetchCounts = useCallback(() => {
    dispatch(fetchModuleCounts());
  }, [dispatch]);

  const markModuleRead = useCallback(
    async (moduleName, id = null, markAll = false) => {
      await dispatch(markModuleReadThunk({ module: moduleName, id, markAll }));
    },
    [dispatch]
  );

  return { counts, fetchCounts, markModuleRead };
};

export default useAdminNotificationCounts;
