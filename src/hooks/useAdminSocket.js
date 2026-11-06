// src/hooks/useAdminSocket.js — owner-session Socket.IO connection.
//
// One connection per owner layout. Polling remains the fallback in
// useNotificationCoordinator; this hook only adds push updates.
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { selectAuthInitialized, selectIsOwner } from "store/slices/authSlice";
import { applySocketCounts } from "store/slices/notificationsSlice";
import { getToken, handleSessionExpiry } from "views/utils/axiosInstance";

const API_ORIGIN = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:7372"
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
  const isOwner = useAppSelector(selectIsOwner);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!authInitialized || !isOwner) return undefined;

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
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [authInitialized, isOwner, dispatch]);

  return socketRef;
};

export default useAdminSocket;
