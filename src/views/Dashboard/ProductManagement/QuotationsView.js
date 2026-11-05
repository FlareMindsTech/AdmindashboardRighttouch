import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Select,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import DataTable from "components/common/DataTable";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import StatusBadge from "components/common/StatusBadge";
import { MobileCard } from "components/common/MobileCard";
import {
  deleteQuotation,
  resendQuotation,
  sendQuotation,
} from "api/quotations";
import QuotationEditorModal from "./QuotationEditorModal";
import { QuotationDetailModal } from "./ProductFlowModals";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_LABELS,
  bookingByQuotationId,
  formatDate,
  formatINR,
  getCustomer,
  getProduct,
  getQuotationNumber,
  getQuotationTotalPaise,
} from "./productFlowUtils";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const statusOf = (quotation) => String(quotation.status || "draft").toLowerCase();

export default function QuotationsView({
  quotations = [],
  bookings = [],
  isLoading,
  onRefresh,
}) {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const bookingsByQuotation = useMemo(() => bookingByQuotationId(bookings), [bookings]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (quotations || []).filter((quotation) => {
      if (status !== "all" && statusOf(quotation) !== status) return false;
      if (!term) return true;
      const customer = getCustomer(quotation);
      const product = getProduct(quotation);
      return [
        getQuotationNumber(quotation),
        customer.name,
        customer.phone,
        product.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [quotations, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const refresh = async () => {
    await onRefresh?.();
  };

  const handleSend = async (quotation) => {
    setBusy(true);
    const { error } = await sendQuotation(quotation._id);
    setBusy(false);
    if (error) {
      toast({ title: "Quotation not sent", description: error, status: "error", duration: 4000, isClosable: true });
      return;
    }
    toast({ title: "Quotation sent", status: "success", duration: 2500, isClosable: true });
    setSelected(null);
    refresh();
  };

  const handleResend = async (quotation) => {
    setBusy(true);
    const { error } = await resendQuotation(quotation._id);
    setBusy(false);
    if (error) {
      toast({ title: "Quotation not resent", description: error, status: "error", duration: 4000, isClosable: true });
      return;
    }
    toast({ title: "Quotation resent", status: "success", duration: 2500, isClosable: true });
    setSelected(null);
    refresh();
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    const { error } = await deleteQuotation(confirm._id);
    setBusy(false);
    if (error) {
      toast({ title: "Delete failed", description: error, status: "error", duration: 4000, isClosable: true });
      return;
    }
    toast({ title: "Quotation deleted", status: "success", duration: 2500, isClosable: true });
    setConfirm(null);
    setSelected(null);
    refresh();
  };

  const columns = [
    {
      key: "quotation",
      label: "Quotation",
      cell: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="700">{getQuotationNumber(row)}</Text>
          <Text fontSize="2xs" color="gray.500">Revision {row.revision || 1}</Text>
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
        <Text fontSize="sm" noOfLines={1}>{getProduct(row).name}</Text>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      cell: (row) => (
        <Text fontSize="sm" fontWeight="700">
          {formatINR(getQuotationTotalPaise(row), { fromPaise: true })}
        </Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      cell: (row) => {
        const key = statusOf(row);
        return (
          <StatusBadge
            colorScheme={QUOTATION_STATUS_COLORS[key] || "gray"}
            label={QUOTATION_STATUS_LABELS[key] || key}
            fontSize="2xs"
            px={2}
            py={0.5}
            borderRadius="full"
          />
        );
      },
    },
    {
      key: "validity",
      label: "Valid until",
      cell: (row) => <Text fontSize="xs">{formatDate(row.validUntil)}</Text>,
    },
    {
      key: "booking",
      label: "Booking",
      cell: (row) => {
        const booking = bookingsByQuotation.get(String(row._id));
        if (!booking) return <Text fontSize="2xs" color="gray.400">—</Text>;
        const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();
        return (
          <StatusBadge
            colorScheme={PAYMENT_STATUS_COLORS[paymentStatus] || "gray"}
            label={PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
            fontSize="2xs"
          />
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      cell: (row) => {
        const key = statusOf(row);
        return (
          <HStack spacing={1} justify="flex-end">
            <Button size="xs" variant="ghost" onClick={() => setSelected(row)}>View</Button>
            {key === "draft" && (
              <Button size="xs" variant="outline" colorScheme="teal" onClick={() => setEditor({ mode: "edit", quotation: row })}>
                Edit
              </Button>
            )}
            {!["accepted", "converted"].includes(key) && key !== "draft" && (
              <Button size="xs" variant="outline" colorScheme="orange" onClick={() => setEditor({ mode: "revise", quotation: row })}>
                Revise
              </Button>
            )}
            {key === "draft" && (
              <Button size="xs" colorScheme="teal" onClick={() => handleSend(row)} isDisabled={busy}>Send</Button>
            )}
            {["sent", "viewed"].includes(key) && (
              <Button size="xs" variant="outline" colorScheme="blue" onClick={() => handleResend(row)} isDisabled={busy}>Resend</Button>
            )}
          </HStack>
        );
      },
    },
  ];

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
          <Text fontSize="md" fontWeight="800" color="gray.800">Quotations</Text>
          <Text fontSize="xs" color="gray.500">
            Create quotations from a quote request, then send, resend or revise. {filtered.length} shown.
          </Text>
        </Box>
        <HStack spacing={2} flexWrap="wrap">
          <Input
            size="sm"
            maxW={{ base: "100%", md: "260px" }}
            placeholder="Search quotation, customer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select size="sm" maxW="150px" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
          emptyTitle="No quotations"
          emptyDescription="Prepare a quotation from a product quote request."
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
            label: "quotations",
          }}
        />
      </Box>

      <Box display={{ base: "block", md: "none" }} flex="1" overflow="auto" px={3} py={3}>
        <VStack align="stretch" spacing={2}>
          {paged.map((row) => {
            const key = statusOf(row);
            const customer = getCustomer(row);
            const booking = bookingsByQuotation.get(String(row._id));
            return (
              <MobileCard key={row._id || row.id}>
                <Flex justify="space-between" align="start" gap={2} mb={2}>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="800" noOfLines={1}>{getQuotationNumber(row)}</Text>
                    <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                      {customer.name} · {getProduct(row).name}
                    </Text>
                  </Box>
                  <StatusBadge
                    colorScheme={QUOTATION_STATUS_COLORS[key] || "gray"}
                    label={QUOTATION_STATUS_LABELS[key] || key}
                    fontSize="2xs"
                  />
                </Flex>
                <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={1}>
                  <Text>Total</Text>
                  <Text fontWeight="700">{formatINR(getQuotationTotalPaise(row), { fromPaise: true })}</Text>
                </Flex>
                <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={1}>
                  <Text>Valid until</Text>
                  <Text fontWeight="600">{formatDate(row.validUntil)}</Text>
                </Flex>
                <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={2}>
                  <Text>Booking</Text>
                  <Text fontWeight="600">
                    {booking ? PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus : "—"}
                  </Text>
                </Flex>
                <HStack spacing={2} justify="flex-end">
                  <Button size="xs" variant="ghost" onClick={() => setSelected(row)}>View</Button>
                  {key === "draft" && (
                    <Button size="xs" variant="outline" colorScheme="teal" onClick={() => setEditor({ mode: "edit", quotation: row })}>
                      Edit
                    </Button>
                  )}
                  {key === "draft" && (
                    <Button size="xs" colorScheme="teal" onClick={() => handleSend(row)} isDisabled={busy}>Send</Button>
                  )}
                </HStack>
              </MobileCard>
            );
          })}
          {!isLoading && paged.length === 0 && (
            <Text textAlign="center" py={8} fontSize="sm" color="gray.500">No quotations found.</Text>
          )}
        </VStack>
      </Box>

      <QuotationDetailModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        quotation={selected}
        booking={selected ? bookingsByQuotation.get(String(selected._id)) : null}
        isBusy={busy}
        onSend={handleSend}
        onResend={handleResend}
        onRevise={(quotation) => {
          setSelected(null);
          setEditor({ mode: "revise", quotation });
        }}
        onEditDraft={(quotation) => {
          setSelected(null);
          setEditor({ mode: "edit", quotation });
        }}
        onDelete={(quotation) => setConfirm(quotation)}
      />

      <QuotationEditorModal
        isOpen={Boolean(editor)}
        onClose={() => setEditor(null)}
        mode={editor?.mode || "create"}
        quotation={editor?.quotation || null}
        onSaved={refresh}
      />

      <ConfirmActionModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        isLoading={busy}
        title="Delete quotation"
        description="This permanently deletes the quotation. Accepted or converted quotations cannot be deleted."
        confirmText="Delete"
      />
    </Box>
  );
}
