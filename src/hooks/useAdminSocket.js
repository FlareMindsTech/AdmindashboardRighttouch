// src/hooks/useAdminSocket.js — privileged-session Socket.IO connection.
//
// One connection per Owner/Admin layout. Polling remains the fallback in
// useNotificationCoordinator; this hook only adds push updates.
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  selectAuthInitialized,
  selectIsPrivileged,
  selectSessionVerified,
} from "store/slices/authSlice";
import { applySocketCounts } from "store/slices/notificationsSlice";
import { getToken, getRefreshToken, handleSessionExpiry } from "views/utils/axiosInstance";
import { refreshSession } from "views/utils/tokenRefresh";

const API_ORIGIN = (
  process.env.REACT_APP_API_BASE_URL || "http://13.206.118.180:7372"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

export const ADMIN_PRODUCT_FLOW_EVENT = "admin_product_flow_updated";

const PRODUCT_EVENTS = [
  ["product_quote_request:changed", "quote_request"],
  ["product_quotation:changed", "quotation"],
  ["product_booking:changed", "booking"],
];

export const useAdminSocket = () => {
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isPrivileged = useAppSelector(selectIsPrivileged);
  const sessionVerified = useAppSelector(selectSessionVerified);
  const socketRef = useRef(null);

  useEffect(() => {
    // Wait for the silent refresh + /user/me verification so the handshake
    // never starts with an already-expired access token.
    if (!authInitialized || !isPrivileged || !sessionVerified) return undefined;

    const token = getToken();
    if (!token) return undefined;

    const socket = io(API_ORIGIN, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });
    socketRef.current = socket;

    const handleCounts = (payload) => {
      const counts = payload?.counts || payload;
      if (counts && typeof counts === "object") {
        dispatch(applySocketCounts(counts));
      }
    };

    const handleProductEvent = (entity) => (payload) => {
      window.dispatchEvent(
        new CustomEvent(ADMIN_PRODUCT_FLOW_EVENT, {
          detail: { entity, payload },
        })
      );
    };

    const handlePaymentSuccess = (payload) => {
      if (payload?.itemType !== "product") return;
      window.dispatchEvent(
        new CustomEvent(ADMIN_PRODUCT_FLOW_EVENT, {
          detail: { entity: "payment", payload },
        })
      );
    };

    const handleSessionEnd = (payload) => {
      socket.disconnect();
      handleSessionExpiry(
        payload?.message ||
          "Your session was ended. Please log in again."
      );
    };

    const handleTokenRefreshed = (event) => {
      const token = event?.detail?.token;
      if (token) socket.auth = { token };
    };

    let reconnectAttemptInFlight = false;
    const handleConnectError = async (error) => {
      const message = String(error?.message || "");
      if (!/auth|token|session|revoked|expired/i.test(message)) return;
      if (reconnectAttemptInFlight) return;
      reconnectAttemptInFlight = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          socket.disconnect();
          handleSessionExpiry("Socket authentication expired");
          return;
        }
        const token = await refreshSession({ staleToken: getToken() });
        if (token) {
          socket.auth = { token };
          if (!socket.connected) socket.connect();
        }
      } catch (err) {
        socket.disconnect();
        handleSessionExpiry(err?.message || "Session expired");
      } finally {
        reconnectAttemptInFlight = false;
      }
    };

    window.addEventListener("rt:auth-refreshed", handleTokenRefreshed);
    socket.on("connect_error", handleConnectError);
    socket.on("admin:unread_counts_updated", handleCounts);
    PRODUCT_EVENTS.forEach(([event, entity]) => {
      socket.on(event, handleProductEvent(entity));
    });
    socket.on("payment_success", handlePaymentSuccess);
    socket.on("session:replaced", handleSessionEnd);
    socket.on("session:revoked", handleSessionEnd);

    return () => {
      socket.off("admin:unread_counts_updated", handleCounts);
      PRODUCT_EVENTS.forEach(([event]) => {
        socket.off(event);
      });
      socket.off("payment_success", handlePaymentSuccess);
      socket.off("session:replaced", handleSessionEnd);
      socket.off("session:revoked", handleSessionEnd);
      socket.off("connect_error", handleConnectError);
      window.removeEventListener("rt:auth-refreshed", handleTokenRefreshed);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [authInitialized, isPrivileged, sessionVerified, dispatch]);

  return socketRef;
};

export default useAdminSocket;
