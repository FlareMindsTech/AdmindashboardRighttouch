import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance, { getToken } from "views/utils/axiosInstance";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://righttouchservernew-727889857503.asia-south1.run.app";

export const useAdminNotificationCounts = () => {
  const isMountedRef = useRef(true);
  const [counts, setCounts] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_unread_counts");
      return saved ? JSON.parse(saved) : { productQuoteRequests: 0, technicianApplications: 0, customerReports: 0 };
    } catch (e) {
      return { productQuoteRequests: 0, technicianApplications: 0, customerReports: 0 };
    }
  });

  const fetchCounts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/unread-counts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.counts && isMountedRef.current) {
          setCounts(data.counts);
          localStorage.setItem("admin_unread_counts", JSON.stringify(data.counts));
        }
      }
    } catch (err) {
      console.error("Failed to fetch notification counts:", err);
    }
  }, []);

  const markModuleRead = useCallback(async (moduleName, id = null, markAll = false) => {
    const token = getToken();
    if (!token) return;

    // Optimistic UI update
    if (isMountedRef.current) {
      setCounts((prev) => {
        const updated = { ...prev, [moduleName]: 0 };
        localStorage.setItem("admin_unread_counts", JSON.stringify(updated));
        return updated;
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/mark-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ module: moduleName, id, markAll }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.counts && isMountedRef.current) {
          setCounts(data.counts);
          localStorage.setItem("admin_unread_counts", JSON.stringify(data.counts));
          window.dispatchEvent(new Event("admin_unread_counts_updated"));
        }
      }
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCounts();

    // Cross-tab synchronization via localStorage
    const handleStorageChange = (e) => {
      if (e.key === "admin_unread_counts" && e.newValue && isMountedRef.current) {
        try {
          setCounts(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    // Custom in-tab event listener
    const handleCustomEvent = () => {
      if (isMountedRef.current) {
        fetchCounts();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("admin_unread_counts_updated", handleCustomEvent);
    window.addEventListener("focus", fetchCounts);

    // Polling interval for fast background sync (10 seconds)
    const interval = setInterval(fetchCounts, 10000);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("admin_unread_counts_updated", handleCustomEvent);
      window.removeEventListener("focus", fetchCounts);
      clearInterval(interval);
    };
  }, [fetchCounts]);

  return { counts, fetchCounts, markModuleRead };
};
