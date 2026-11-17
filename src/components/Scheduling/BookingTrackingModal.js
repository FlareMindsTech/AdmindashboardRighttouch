import React from "react";
import { FaBullhorn } from "react-icons/fa";
import AppModal from "components/common/AppModal";
import BookingAuditTab from "./BookingAuditTab";

export default function BookingTrackingModal({
  isOpen,
  onClose,
  bookingId,
  onOpenCompensation,
}) {
  const shortId = bookingId ? String(bookingId).slice(-8) : "";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking tracking"
      subtitle={shortId ? `Booking #${shortId}` : "Focused broadcast and assignment audit"}
      icon={FaBullhorn}
      size="6xl"
      bodyMaxH="78vh"
      scrollBehavior="inside"
      secondaryAction={{ label: "Close", onClick: onClose }}
    >
      {isOpen && bookingId ? (
        <BookingAuditTab
          key={bookingId}
          preselectedBookingId={bookingId}
          lockToBooking
          onOpenCompensation={onOpenCompensation}
        />
      ) : null}
    </AppModal>
  );
}
