import React, { useEffect, useMemo, useState } from "react";
import { useAppToast } from "components/feedback";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import DataTable from "components/common/DataTable";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import StatusBadge from "components/common/StatusBadge";
import { MobileCard } from "components/common/MobileCard";
import {
  cancelProductBooking,
  completeProductBooking,
} from "api/quotations";
import { BookingDetailModal, ManualPaymentModal } from "./ProductFlowModals";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  formatDate,
  formatINR,
  getBookingNumber,
  getBookingTotalPaise,
  getCustomer,
  getProduct,
  getQuotationNumber,
} from "./productFlowUtils";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const normalize = (value) => String(value || "").toLowerCase();

export default function BookingsView({
  bookings = [],
  quotations = [],
  isLoading,
  onRefresh,
}) {
  const toast = useAppToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [busy, setBusy] = useState(false);

  const quotationsById = useMemo(() => {
    const map = new Map();
    (quotations || []).forEach((quotation) => {
      if (quotation._id) map.set(String(quotation._id), quotation);
    });
    return map;
  }, [quotations]);

  const quotationFor = (booking) => {
    const id = booking.quotationId?._id || booking.quotationId;
    return id ? quotationsById.get(String(id)) : null;
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (bookings || []).filter((booking) => {
      if (status !== "all" && normalize(booking.status) !== status) return false;
      if (paymentStatus !== "all" && normalize(booking.paymentStatus) !== paymentStatus) return false;
      if (!term) return true;
      const customer = getCustomer(booking);
      const product = getProduct(booking);
      return [
        getBookingNumber(booking),
        customer.name,
        customer.phone,
        product.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [bookings, search, status, paymentStatus]);

  useEffect(() => {
    setPage(1);
  }, [search, status, paymentStatus, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const refresh = async () => {
    await onRefresh?.();
  };

  const handleComplete = async (booking) => {
    setBusy(true);
    const { error } = await completeProductBooking(booking._id);
    setBusy(false);
    if (error) {
      toast.error(error, { title: "Booking not completed", duration: 4500, isClosable: true });
      return;
    }
    toast({ title: "Booking completed", status: "success", duration: 2500, isClosable: true });
    setSelected(null);
    refresh();
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setBusy(true);
    const { error } = await cancelProductBooking(confirmCancel._id, {
      reason: "Cancelled by admin from product management",
    });
    setBusy(false);
    if (error) {
      toast.error(error, { title: "Booking not cancelled", duration: 4500, isClosable: true });
      return;
    }
    toast({ title: "Booking cancelled", status: "success", duration: 2500, isClosable: true });
    setConfirmCancel(null);
    setSelected(null);
    refresh();
  };

  const columns = [
    {
      key: "booking",
      label: "Booking",
      cell: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="700">{getBookingNumber(row)}</Text>
          <Text fontSize="2xs" color="gray.500">{formatDate(row.createdAt)}</Text>
        </VStack>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      cell: (row) => {
        const customer = getCustomer(row);
        return (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="600">{customer.name}</Text>
            <Text fontSize="2xs" color="gray.500">{customer.phone}</Text>
          </VStack>
        );
      },
    },
    {
      key: "product",
      label: "Product",
      cell: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" noOfLines={1}>{getProduct(row).name}</Text>
          <Text fontSize="2xs" color="gray.500">
            {quotationFor(row) ? getQuotationNumber(quotationFor(row)) : "No quotation"}
          </Text>
        </VStack>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      cell: (row) => (
        <Text fontSize="sm" fontWeight="700">
          {formatINR(getBookingTotalPaise(row), { fromPaise: true })}
        </Text>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      cell: (row) => {
        const key = normalize(row.paymentStatus || "pending");
        return (
          <StatusBadge
            colorScheme={PAYMENT_STATUS_COLORS[key] || "gray"}
            label={PAYMENT_STATUS_LABELS[key] || key}
            fontSize="2xs"
            px={2}
            py={0.5}
            borderRadius="full"
          />
        );
      },
    },
    {
      key: "status",
      label: "Status",
      cell: (row) => {
        const key = normalize(row.status || "active");
        return (
          <StatusBadge
            colorScheme={BOOKING_STATUS_COLORS[key] || "gray"}
            label={BOOKING_STATUS_LABELS[key] || key}
            fontSize="2xs"
            px={2}
            py={0.5}
            borderRadius="full"
          />
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      cell: (row) => {
        const bookingStatus = normalize(row.status || "active");
        const payStatus = normalize(row.paymentStatus || "pending");
        const canPay = bookingStatus === "active" && payStatus !== "paid";
        const canComplete = bookingStatus === "active" && payStatus === "paid";
        return (
          <HStack spacing={1} justify="flex-end">
            <Button size="xs" variant="ghost" onClick={() => setSelected(row)}>View</Button>
            {canPay && (
              <Button size="xs" variant="outline" colorScheme="blue" onClick={() => setPaymentBooking(row)}>
                Pay
              </Button>
            )}
            {canComplete && (
              <Button size="xs" colorScheme="teal" onClick={() => handleComplete(row)} isDisabled={busy}>
                Complete
              </Button>
            )}
            {bookingStatus === "active" && payStatus === "paid" && (
              <Button size="xs" variant="ghost" onClick={() => navigate("/owner/admin-payments")}>
                Refund
              </Button>
            )}
            {bookingStatus === "active" && payStatus !== "paid" && (
              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setConfirmCancel(row)}>
                Cancel
              </Button>
            )}
          </HStack>
        );
      },
    },
  ];

  const renderMobileCard = (row) => {
    const bookingStatus = normalize(row.status || "active");
    const payStatus = normalize(row.paymentStatus || "pending");
    const canPay = bookingStatus === "active" && payStatus !== "paid";
    const canComplete = bookingStatus === "active" && payStatus === "paid";
    const customer = getCustomer(row);
    return (
      <MobileCard key={row._id || row.id}>
        <Flex justify="space-between" align="start" gap={2} mb={2}>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="800" noOfLines={1}>{getBookingNumber(row)}</Text>
            <Text fontSize="2xs" color="gray.500" noOfLines={1}>
              {customer.name} · {getProduct(row).name}
            </Text>
          </Box>
          <VStack align="end" spacing={1}>
            <StatusBadge
              colorScheme={BOOKING_STATUS_COLORS[bookingStatus] || "gray"}
              label={BOOKING_STATUS_LABELS[bookingStatus] || bookingStatus}
              fontSize="2xs"
            />
            <StatusBadge
              colorScheme={PAYMENT_STATUS_COLORS[payStatus] || "gray"}
              label={PAYMENT_STATUS_LABELS[payStatus] || payStatus}
              fontSize="2xs"
            />
          </VStack>
        </Flex>
        <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={1}>
          <Text>Amount</Text>
          <Text fontWeight="700">{formatINR(getBookingTotalPaise(row), { fromPaise: true })}</Text>
        </Flex>
        <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={1}>
          <Text>Phone</Text>
          <Text fontWeight="600">{customer.phone}</Text>
        </Flex>
        <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={2}>
          <Text>Created</Text>
          <Text fontWeight="600">{formatDate(row.createdAt)}</Text>
        </Flex>
        <HStack spacing={2} justify="flex-end">
          <Button size="xs" variant="ghost" onClick={() => setSelected(row)}>View</Button>
          {canPay && (
            <Button size="xs" variant="outline" colorScheme="blue" onClick={() => setPaymentBooking(row)}>Pay</Button>
          )}
          {canComplete && (
            <Button size="xs" colorScheme="teal" onClick={() => handleComplete(row)} isDisabled={busy}>Complete</Button>
          )}
          {bookingStatus === "active" && payStatus !== "paid" && (
            <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setConfirmCancel(row)}>Cancel</Button>
          )}
        </HStack>
      </MobileCard>
    );
  };

  return (
    <Box display="flex" flexDirection="column" flex="1" minH={0} bg="white">
      <Flex
        px={{ base: 3, md: 4 }}
        py={3}
        gap={2}
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Box flex="1">
          <Text fontSize="md" fontWeight="800" color="gray.800">Product bookings</Text>
          <Text fontSize="xs" color="gray.500">
            Real accepted-quotation bookings. Record payment, complete or refund. {filtered.length} shown.
          </Text>
        </Box>
        <HStack spacing={2} flexWrap="wrap">
          <Input
            size="sm"
            maxW={{ base: "100%", md: "240px" }}
            placeholder="Search booking, customer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select size="sm" maxW="140px" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select size="sm" maxW="150px" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="all">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </Select>
          <Button size="sm" variant="outline" onClick={refresh} isLoading={isLoading}>Refresh</Button>
        </HStack>
      </Flex>

      <Box display={{ base: "none", md: "flex" }} flex="1" minH={0} overflow="hidden">
        <DataTable
          columns={columns}
          rows={paged}
          isLoading={isLoading}
          keyExtractor={(row) => row._id || row.id}
          emptyTitle="No product bookings"
          emptyDescription="Bookings are created automatically when a customer accepts a quotation."
          pagination={{
            page,
            totalPages,
            totalRows: filtered.length,
            indexOfFirst: (page - 1) * rowsPerPage,
            indexOfLast: Math.min(page * rowsPerPage, filtered.length),
            rowsPerPage,
            onPageChange: setPage,
            onRowsPerPageChange: setRowsPerPage,
            rowsPerPageOptions: PAGE_SIZE_OPTIONS,
            label: "bookings",
          }}
        />
      </Box>

      <Box display={{ base: "block", md: "none" }} flex="1" overflow="auto" px={3} py={3}>
        <VStack align="stretch" spacing={2}>
          {paged.map(renderMobileCard)}
          {!isLoading && paged.length === 0 && (
            <Text textAlign="center" py={8} fontSize="sm" color="gray.500">No product bookings found.</Text>
          )}
        </VStack>
      </Box>

      <BookingDetailModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        booking={selected}
        quotation={selected ? quotationFor(selected) : null}
        isBusy={busy}
        onRecordPayment={(booking) => {
          setSelected(null);
          setPaymentBooking(booking);
        }}
        onComplete={handleComplete}
        onCancel={(booking) => {
          setSelected(null);
          setConfirmCancel(booking);
        }}
      />

      <ManualPaymentModal
        isOpen={Boolean(paymentBooking)}
        onClose={() => setPaymentBooking(null)}
        booking={paymentBooking}
        onSaved={refresh}
      />

      <ConfirmActionModal
        isOpen={Boolean(confirmCancel)}
        onClose={() => setConfirmCancel(null)}
        onConfirm={handleCancel}
        isLoading={busy}
        title="Cancel product booking"
        description="Cancelling an unpaid booking cannot be undone. Paid bookings must be refunded through Admin Payments first."
        confirmText="Cancel booking"
        confirmColorScheme="red"
      />
    </Box>
  );
}
