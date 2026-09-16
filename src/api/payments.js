// src/api/payments.js  — Section 7: Payments & Settlements
import apiClient, { handle } from "./client";

export const updatePaymentStatus = (paymentId, body) =>
  handle(apiClient.put(`/user/payment/${paymentId}/status`, body));
export const retrySettlement = (body) =>
  handle(apiClient.post("/user/payment/retry-settlement", body));
export const getPaymentByBooking = (bookingId) =>
  handle(apiClient.get(`/user/payment/${bookingId}`));
export const createPaymentOrder = (body) =>
  handle(apiClient.post("/user/payment/order", body));
export const verifyPayment = (body) =>
  handle(apiClient.post("/user/payment/verify", body));

// Razorpay webhook — no Bearer auth, uses x-razorpay-signature header
export const razorpayWebhook = (payload, signature) =>
  handle(
    apiClient.post("/user/payment/webhook/razorpay", payload, {
      headers: { "x-razorpay-signature": signature },
    })
  );
