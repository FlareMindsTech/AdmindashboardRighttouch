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
import DataTable from "components/common/DataTable";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import StatusBadge from "components/common/StatusBadge";
import { MobileCard } from "components/common/MobileCard";
import {
  assignQuoteRequest,
  deleteQuoteRequest,
  updateQuoteRequestStatus,
} from "api/quotations";
import QuotationEditorModal from "./QuotationEditorModal";
import { QuoteRequestDetailModal } from "./ProductFlowModals";
import {
  QUOTE_REQUEST_STATUS_COLORS,
  QUOTE_REQUEST_STATUS_LABELS,
  formatDate,
  getCustomer,
  getProduct,
  getRequestNumber,
} from "./productFlowUtils";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const canPrepare = (request) =>
  ["quote_requested", "under_review", "quotation_prepared"].includes(
    String(request.status || "").toLowerCase()
  );

const canAssign = (request) =>
  ["quote_requested", "under_review"].includes(
    String(request.status || "").toLowerCase()
  );

export default function QuoteRequestsView({ requests = [], isLoading, onRefresh }) {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);
  const [editorRequest, setEditorRequest] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (requests || []).filter((request) => {
      const requestStatus = String(request.status || "").toLowerCase();
      const statusMatch =
        status === "all" ||
        (status === "active"
          ? ["quote_requested", "under_review", "quotation_prepared", "quotation_sent", "viewed"].includes(requestStatus)
          : requestStatus === status);
      if (!statusMatch) return false;
      if (!term) return true;
      const customer = getCustomer(request);
      const product = getProduct(request);
      return [
        getRequestNumber(request),
        customer.name,
        customer.phone,
        product.name,
        request.requirementDescription,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [requests, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const refresh = async () => {
    await onRefresh?.();
  };

  const handleAssign = async (request) => {
    setBusy(true);
    const { error } = await assignQuoteRequest(request._id);
    setBusy(false);
    if (error) {
      toast.error(error, { title: "Assign failed", duration: 4000, isClosable: true });
      return;
    }
    toast({ title: "Request assigned", status: "success", duration: 2500, isClosable: true });
    refresh();
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    const { request, action } = confirm;
    const response =
      action === "delete"
        ? await deleteQuoteRequest(request._id)
        : await updateQuoteRequestStatus(request._id, { status: "cancelled" });
    setBusy(false);
    if (response.error) {
      toast({ title: "Action failed", description: response.error, status: "error", duration: 4000, isClosable: true });
      return;
    }
    toast({
      title: action === "delete" ? "Quote request deleted" : "Quote request cancelled",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
    setConfirm(null);
    setSelected(null);
    refresh();
  };

  const columns = [
    {
      key: "request",
      label: "Request",
      cell: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="700">{getRequestNumber(row)}</Text>
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
      cell: (row) => {
        const product = getProduct(row);
        return (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" noOfLines={1}>{product.name}</Text>
            <Text fontSize="2xs" color="gray.500">Qty {row.quantity || 1}</Text>
          </VStack>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      cell: (row) => {
        const key = String(row.status || "").toLowerCase();
        return (
          <StatusBadge
            colorScheme={QUOTE_REQUEST_STATUS_COLORS[key] || "gray"}
            label={QUOTE_REQUEST_STATUS_LABELS[key] || key}
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
      cell: (row) => (
        <HStack spacing={1} justify="flex-end">
          <Button size="xs" variant="ghost" onClick={() => setSelected(row)}>View</Button>
          {canAssign(row) && (
            <Button size="xs" variant="outline" colorScheme="blue" onClick={() => handleAssign(row)} isDisabled={busy}>
              Assign
            </Button>
          )}
          {canPrepare(row) && (
            <Button size="xs" colorScheme="teal" onClick={() => setEditorRequest(row)}>
              Quote
            </Button>
          )}
        </HStack>
      ),
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
          <Text fontSize="md" fontWeight="800" color="gray.800">Product quote requests</Text>
          <Text fontSize="xs" color="gray.500">
            Requests waiting for review or quotation. {filtered.length} shown.
          </Text>
        </Box>
        <HStack spacing={2} flexWrap="wrap">
          <Input
            size="sm"
            maxW={{ base: "100%", md: "280px" }}
            placeholder="Search customer, phone, request..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select size="sm" maxW="160px" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="all">All statuses</option>
            {Object.entries(QUOTE_REQUEST_STATUS_LABELS).map(([value, label]) => (
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
          emptyTitle="No quote requests"
          emptyDescription="New product quote requests will appear here."
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
            label: "requests",
          }}
        />
      </Box>

      <Box display={{ base: "block", md: "none" }} flex="1" overflow="auto" px={3} py={3}>
        <VStack align="stretch" spacing={2}>
          {paged.map((row) => {
            const customer = getCustomer(row);
            const product = getProduct(row);
            const key = String(row.status || "").toLowerCase();
            return (
              <MobileCard key={row._id || row.id}>
                <Flex justify="space-between" align="start" gap={2} mb={2}>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="800" noOfLines={1}>{customer.name}</Text>
                    <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                      {getRequestNumber(row)} · {product.name}
                    </Text>
                  </Box>
                  <StatusBadge
                    colorScheme={QUOTE_REQUEST_STATUS_COLORS[key] || "gray"}
                    label={QUOTE_REQUEST_STATUS_LABELS[key] || key}
                    fontSize="2xs"
                  />
                </Flex>
                <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={1}>
                  <Text>Phone</Text>
                  <Text fontWeight="600">{customer.phone}</Text>
                </Flex>
                <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={1}>
                  <Text>Quantity</Text>
                  <Text fontWeight="600">{row.quantity || 1}</Text>
                </Flex>
                <Flex justify="space-between" fontSize="2xs" color="gray.600" mb={2}>
                  <Text>Created</Text>
                  <Text fontWeight="600">{formatDate(row.createdAt)}</Text>
                </Flex>
                <HStack spacing={2} justify="flex-end">
                  <Button size="xs" variant="ghost" onClick={() => setSelected(row)}>View</Button>
                  {canAssign(row) && (
                    <Button size="xs" variant="outline" colorScheme="blue" onClick={() => handleAssign(row)}>Assign</Button>
                  )}
                  {canPrepare(row) && (
                    <Button size="xs" colorScheme="teal" onClick={() => setEditorRequest(row)}>Quote</Button>
                  )}
                </HStack>
              </MobileCard>
            );
          })}
          {!isLoading && paged.length === 0 && (
            <Text textAlign="center" py={8} fontSize="sm" color="gray.500">No quote requests found.</Text>
          )}
        </VStack>
      </Box>

      <QuoteRequestDetailModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        request={selected}
        isBusy={busy}
        onPrepare={(request) => {
          setSelected(null);
          setEditorRequest(request);
        }}
        onAssign={handleAssign}
        onCancel={(request) => setConfirm({ action: "cancel", request })}
        onDelete={(request) => setConfirm({ action: "delete", request })}
      />

      <QuotationEditorModal
        isOpen={Boolean(editorRequest)}
        onClose={() => setEditorRequest(null)}
        mode="create"
        request={editorRequest}
        onSaved={refresh}
      />

      <ConfirmActionModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        isLoading={busy}
        title={confirm?.action === "delete" ? "Delete quote request" : "Cancel quote request"}
        description={
          confirm?.action === "delete"
            ? "This permanently removes the quote request. This cannot be undone."
            : "The customer will no longer be able to receive a quotation for this request."
        }
        confirmText={confirm?.action === "delete" ? "Delete" : "Cancel request"}
        confirmColorScheme={confirm?.action === "delete" ? "red" : "orange"}
      />
    </Box>
  );
}
