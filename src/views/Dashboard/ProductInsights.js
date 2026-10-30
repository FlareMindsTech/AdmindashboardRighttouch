// src/views/Dashboard/ProductInsights.js — Product Dashboard, Sales & Audit Logs
// Covers Postman Folder 10

import React, { useState, useEffect, useCallback } from "react";
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
  useToast,
  Spinner,
  Center,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
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
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Audit Log Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  const loadSummary = useCallback(async (isMounted = { current: true }) => {
    const { data, error } = await getProductDashboard();
    if (!isMounted.current) return;
    if (error) {
      toast({ title: "Failed to load product dashboard", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    setSummary(data?.result ?? data?.data ?? data ?? null);
  }, [toast]);

  const loadTab = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) setLoading(true);
    if (tab === 0) {
      const { data, error } = await getSalesReport();
      if (!isMounted.current) return;
      if (error) toast({ title: "Sales report failed", description: error, status: "error", duration: 3000, isClosable: true });
      else {
        const list = data?.result ?? data?.data ?? data ?? [];
        setSales(Array.isArray(list) ? list : list?.rows ?? list?.sales ?? []);
      }
    } else {
      const { data, error } = await listProductAuditLogs();
      if (!isMounted.current) return;
      if (error) toast({ title: "Audit logs failed", description: error, status: "error", duration: 3000, isClosable: true });
      else {
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
      toast({ title: "Failed to load audit log detail", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    setSelectedLog(data?.result ?? data?.data ?? data ?? null);
  };

  const cell = (r) =>
    r?.action || r?.event || r?.type || r?.status || r?.month || r?.label || "—";

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      {/* Standardized 105px KPI Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
        <SharedStatCard kpi title="Active Products" value={String(summary?.products ?? summary?.totalProducts ?? "—")} />
        <SharedStatCard kpi title="Product Bookings" value={String(summary?.bookings ?? summary?.totalBookings ?? "—")} />
        <SharedStatCard kpi title="Total Sales Volume" value={`₹${Number(summary?.revenue ?? summary?.totalRevenue ?? 0).toLocaleString()}`} />
        <SharedStatCard kpi title="Pending Quote Requests" value={String(summary?.pendingQuotes ?? summary?.quoteRequests ?? "—")} />
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
                {loading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : sales.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No sales records found for this period.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Period / Product</Th>
                          <Th>Orders Count</Th>
                          <Th>Revenue (₹)</Th>
                          <Th>Average Order Value</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sales.map((s, i) => (
                          <Tr key={s?._id || s?.id || i}>
                            <Td fontWeight="semibold">{s?.productName || s?.period || cell(s)}</Td>
                            <Td>{s?.ordersCount ?? s?.count ?? s?.quantity ?? "—"}</Td>
                            <Td fontWeight="bold" color="teal.600">₹{Number(s?.revenue ?? s?.totalAmount ?? 0).toLocaleString()}</Td>
                            <Td>₹{Number(s?.aov ?? (s?.revenue && s?.ordersCount ? (s.revenue / s.ordersCount) : 0)).toFixed(2)}</Td>
                            <Td fontSize="xs">{s?.date || (s?.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—")}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>

              {/* Tab 2: Catalog Audit Logs */}
              <TabPanel px={0} pt={4}>
                {loading ? (
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
      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Audit Log Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                <Box p={3} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="md" maxH="250px" overflowY="auto">
                  <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap">
                    {JSON.stringify(selectedLog.diff || selectedLog.payload || selectedLog.changes || selectedLog, null, 2)}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={() => setLogModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
