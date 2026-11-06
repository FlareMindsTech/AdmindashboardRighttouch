// src/views/Dashboard/ProductInsights.js — Product Dashboard, Sales & Audit Logs
// Covers Postman Folder 10

import React, { useState, useEffect, useCallback } from "react";
import { useAppToast } from "components/feedback";
import AppModal from "components/common/AppModal";
import ErrorState from "components/feedback/ErrorState";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Center,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  VStack,
  Divider,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import SharedStatCard from "components/common/StatCard";
import {
  getProductDashboard,
  getSalesReport,
  listProductAuditLogs,
  getProductAuditLogById,
} from "api/productDashboard";

const BRAND = "#008080";

export default function ProductInsights() {
  const toast = useAppToast();
  const [tab, setTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Audit Log Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  const loadSummary = useCallback(async (isMounted = { current: true }) => {
    const { data, error } = await getProductDashboard();
    if (!isMounted.current) return;
    if (error) {
      toast.error(error, { title: "Failed to load product dashboard", duration: 3000, isClosable: true });
      return;
    }
    setSummary(data?.result ?? data?.data ?? data ?? null);
  }, [toast]);

  const loadTab = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) setLoading(true);
    if (tab === 0) {
      const { data, error } = await getSalesReport();
      if (!isMounted.current) return;
      if (error) {
        setLoadError(error);
        toast.error(error, { title: "Sales report failed", duration: 3000, isClosable: true });
      } else {
        setLoadError(null);
        const list = data?.result ?? data?.data ?? data ?? [];
        setSales(Array.isArray(list) ? list : list?.rows ?? list?.sales ?? []);
      }
    } else {
      const { data, error } = await listProductAuditLogs();
      if (!isMounted.current) return;
      if (error) {
        setLoadError(error);
        toast.error(error, { title: "Audit logs failed", duration: 3000, isClosable: true });
      } else {
        setLoadError(null);
        const list = data?.result ?? data?.data ?? data ?? [];
        setLogs(Array.isArray(list) ? list : list?.logs ?? []);
      }
    }
    if (isMounted.current) setLoading(false);
  }, [tab, toast]);

  useEffect(() => {
    const isMounted = { current: true };
    loadSummary(isMounted);
    return () => { isMounted.current = false; };
  }, [loadSummary]);

  useEffect(() => {
    const isMounted = { current: true };
    loadTab(isMounted);
    return () => { isMounted.current = false; };
  }, [loadTab]);

  const viewLogDetail = async (id) => {
    if (!id) return;
    setLogModalOpen(true);
    setLogLoading(true);
    const { data, error } = await getProductAuditLogById(id);
    setLogLoading(false);
    if (error) {
      toast.error(error, { title: "Failed to load audit log detail", duration: 3000, isClosable: true });
      return;
    }
    setSelectedLog(data?.result ?? data?.data ?? data ?? null);
  };

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      {/* Standardized 105px KPI Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
        <SharedStatCard kpi title="Active Products" value={String(summary?.totalProductsCount ?? "—")} />
        <SharedStatCard kpi title="Product Bookings" value={String(summary?.totalBookingsCount ?? "—")} />
        <SharedStatCard kpi title="Collected Sales" value={`₹${Number(summary?.totalPaid ?? (summary?.paidPaise || 0) / 100).toLocaleString("en-IN")}`} />
        <SharedStatCard kpi title="Unpaid Amount" value={`₹${Number(summary?.totalUnpaid ?? (summary?.unpaidPaise || 0) / 100).toLocaleString("en-IN")}`} />
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" w="100%">
            <Box>
              <Heading size="md">Product Insights & Audit Ledger</Heading>
              <Text fontSize="sm" color="gray.500">Sales metrics, conversion analytics, and catalog audit history</Text>
            </Box>
            <Button size="sm" variant="brand" onClick={() => { loadSummary(); loadTab(); }}>
              Refresh Data
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <Tabs index={tab} onChange={setTab} colorScheme="teal" isLazy>
            <TabList>
              <Tab fontWeight="semibold">Sales Performance</Tab>
              <Tab fontWeight="semibold">Catalog Audit Logs</Tab>
            </TabList>
            <TabPanels>
              {/* Tab 1: Sales Performance */}
              <TabPanel px={0} pt={4}>
                {loadError ? (
                  <ErrorState compact error={loadError} title="Could not load sales data" onRetry={loadTab} />
                ) : loading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : sales.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No sales records found for this period.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Booking</Th>
                          <Th>Customer</Th>
                          <Th>Product</Th>
                          <Th>Amount (₹)</Th>
                          <Th>Payment</Th>
                          <Th>Status</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sales.map((s, i) => (
                          <Tr key={s?._id || s?.bookingId || s?.id || i}>
                            <Td fontSize="xs" fontWeight="semibold" fontFamily="mono">
                              {s?.bookingNumber || s?._id || s?.bookingId || "—"}
                            </Td>
                            <Td fontSize="xs">{s?.customerName || "—"}</Td>
                            <Td fontSize="xs">{s?.productName || "—"}</Td>
                            <Td fontWeight="bold" color="teal.600">
                              ₹{Number(s?.amount ?? (s?.amountPaise || 0) / 100).toLocaleString("en-IN")}
                            </Td>
                            <Td>
                              <Badge colorScheme={s?.paymentStatus === "paid" ? "green" : "yellow"}>
                                {s?.paymentStatus || "pending"}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={s?.status === "completed" ? "green" : s?.status === "cancelled" ? "red" : "blue"}>
                                {s?.status || "active"}
                              </Badge>
                            </Td>
                            <Td fontSize="xs">{s?.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>

              {/* Tab 2: Catalog Audit Logs */}
              <TabPanel px={0} pt={4}>
                {loadError ? (
                  <ErrorState compact error={loadError} title="Could not load audit logs" onRetry={loadTab} />
                ) : loading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : logs.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No product audit logs recorded.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Action / Event</Th>
                          <Th>Product / Target</Th>
                          <Th>Actor</Th>
                          <Th>Timestamp</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {logs.map((log, i) => {
                          const logId = log?._id || log?.id;
                          return (
                            <Tr key={logId || i}>
                              <Td>
                                <Badge colorScheme={log?.action === "create" ? "green" : log?.action === "delete" ? "red" : "blue"}>
                                  {log?.action || log?.event || "UPDATE"}
                                </Badge>
                              </Td>
                              <Td fontSize="xs" fontWeight="semibold">{log?.productName || log?.targetId || "—"}</Td>
                              <Td fontSize="xs">{log?.actorName || log?.actor || log?.userId || "Admin"}</Td>
                              <Td fontSize="xs">{log?.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</Td>
                              <Td>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => viewLogDetail(logId)}
                                >
                                  View Diff
                                </Button>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Audit Log Detail Modal */}
      <AppModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="Audit log details"
        subtitle="Immutable record details and the captured change payload."
        size="lg"
        secondaryAction={{ label: "Close", onClick: () => setLogModalOpen(false) }}
      >
            {logLoading ? (
              <Center py={8}><Spinner color={BRAND} /></Center>
            ) : !selectedLog ? (
              <Text>No audit log details available.</Text>
            ) : (
              <VStack align="stretch" spacing={3} fontSize="sm">
                <Flex justify="space-between">
                  <Text color="gray.500">Action:</Text>
                  <Badge colorScheme="teal">{selectedLog.action || selectedLog.event || "UPDATE"}</Badge>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Target Product ID:</Text>
                  <Text fontFamily="mono">{selectedLog.targetId || selectedLog.productId || "—"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Performed By:</Text>
                  <Text fontWeight="semibold">{selectedLog.actor || selectedLog.userId || "Admin"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Timestamp:</Text>
                  <Text>{selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : "—"}</Text>
                </Flex>
                <Divider />
                <Heading size="xs">Change Payload / Diff</Heading>
                <Box p={3} bg="gray.50" borderRadius="md" maxH="250px" overflowY="auto">
                  <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap">
                    {JSON.stringify(selectedLog.diff || selectedLog.payload || selectedLog.changes || selectedLog, null, 2)}
                  </Text>
                </Box>
              </VStack>
            )}
      </AppModal>
    </Box>
  );
}
