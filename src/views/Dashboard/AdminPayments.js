// src/views/Dashboard/AdminPayments.js — Admin Payments (Product & Offline Records)
// Covers Postman Folder 11

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
  Badge,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Divider,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import SharedStatCard from "components/common/StatCard";
import {
  listProductPayments,
  getProductPaymentsSummary,
  recordOfflinePayment,
  recordOfflinePaymentForBooking,
  updateAdminPaymentStatus,
  getPaymentByBookingAdmin,
  deleteBookingAsAdmin,
} from "api/adminPayments";

const BRAND = "#008080";

export default function AdminPayments() {
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Record Offline Payment Modal
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  // Booking Lookup State
  const [lookupBookingId, setLookupBookingId] = useState("");
  const [bookingPayment, setBookingPayment] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(false);

  const loadSummary = useCallback(async (isMounted = { current: true }) => {
    const { data } = await getProductPaymentsSummary();
    if (isMounted.current) {
      setSummary(data?.result ?? data?.data ?? data ?? null);
    }
  }, []);

  const loadList = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;

    const { data, error } = await listProductPayments(params);
    if (!isMounted.current) return;
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load payments", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    const list = data?.result ?? data?.data ?? data ?? [];
    setRows(Array.isArray(list) ? list : list?.payments ?? []);
  }, [statusFilter, toast]);

  useEffect(() => {
    const isMounted = { current: true };
    loadSummary(isMounted);
    loadList(isMounted);
    return () => { isMounted.current = false; };
  }, [loadSummary, loadList]);

  const submitOffline = async () => {
    if (!bookingId || !amount) {
      toast({ title: "Booking and amount are required", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setSaving(true);
    const payload = {
      bookingId,
      amount: Number(amount),
      paymentMode: mode,
      transactionReference: reference,
    };

    const { error } = bookingId
      ? await recordOfflinePaymentForBooking(bookingId, payload)
      : await recordOfflinePayment(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Record failed", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: "Offline payment recorded successfully", status: "success", duration: 2500, isClosable: true });
    setOfflineOpen(false);
    setBookingId("");
    setAmount("");
    setReference("");
    loadList();
    loadSummary();
  };

  const markStatus = async (row, status) => {
    const id = row?._id || row?.paymentId || row?.id;
    if (!id) return;
    const { error } = await updateAdminPaymentStatus(id, { status });
    if (error) {
      toast({ title: "Update failed", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: `Marked payment as ${status}`, status: "success", duration: 2000, isClosable: true });
    loadList();
    loadSummary();
  };

  const searchBookingPayment = async () => {
    if (!lookupBookingId.trim()) {
      toast({ title: "Please enter a Booking ID", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setLookupLoading(true);
    const { data, error } = await getPaymentByBookingAdmin(lookupBookingId.trim());
    setLookupLoading(false);
    if (error) {
      toast({ title: "Booking payment lookup failed", description: error, status: "error", duration: 3000, isClosable: true });
      setBookingPayment(null);
      return;
    }
    setBookingPayment(data?.result ?? data?.data ?? data ?? null);
  };

  const removeBookingPayment = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) return;
    setDeletingPayment(true);
    const { error } = await deleteBookingAsAdmin(id);
    setDeletingPayment(false);
    if (error) {
      toast({ title: "Failed to delete payment", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: "Payment deleted successfully", status: "success", duration: 2500, isClosable: true });
    setBookingPayment(null);
    loadList();
    loadSummary();
  };

  const idOf = (r) => r?._id || r?.paymentId || r?.id || "—";

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      {/* Standardized 105px KPI Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
        <SharedStatCard kpi title="Total Records" value={String(summary?.total ?? summary?.count ?? rows.length)} />
        <SharedStatCard kpi title="Collected Revenue" value={`₹${Number(summary?.collected ?? summary?.totalAmount ?? 0).toLocaleString()}`} />
        <SharedStatCard kpi title="Pending Verification" value={String(summary?.pending ?? 0)} />
        <SharedStatCard kpi title="Failed / Disputed" value={String(summary?.failed ?? 0)} />
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={3}>
            <Box>
              <Heading size="md">Payments Control Center</Heading>
              <Text fontSize="sm" color="gray.500">Product payments, offline audit, and booking verification</Text>
            </Box>
            <HStack>
              <Button size="sm" bg={BRAND} color="white" onClick={() => setOfflineOpen(true)}>
                Record Offline Payment
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Tabs index={tab} onChange={setTab} colorScheme="teal" isLazy>
            <TabList>
              <Tab fontWeight="semibold">Product & Online Payments</Tab>
              <Tab fontWeight="semibold">Booking Payment Audit</Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Product Payments Table */}
              <TabPanel px={0} pt={4}>
                <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                  <HStack spacing={3}>
                    <Select
                      maxW="200px"
                      size="sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="success">Success</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="authorized">Authorized</option>
                    </Select>
                    <Button size="sm" variant="outline" onClick={loadList}>Filter</Button>
                  </HStack>
                  <Button size="sm" variant="ghost" onClick={() => { loadSummary(); loadList(); }}>
                    Refresh
                  </Button>
                </Flex>

                {loading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : rows.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No payment records found.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Payment ID</Th>
                          <Th>Booking ID</Th>
                          <Th>Amount</Th>
                          <Th>Method / Gateway</Th>
                          <Th>Status</Th>
                          <Th>Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rows.map((r, i) => {
                          const status = r?.status || "pending";
                          const badgeColor =
                            status === "success" || status === "captured" ? "green" :
                            status === "pending" || status === "created" ? "yellow" : "red";
                          return (
                            <Tr key={idOf(r) + i}>
                              <Td fontSize="xs" fontFamily="mono">{idOf(r)}</Td>
                              <Td fontSize="xs" fontFamily="mono">{r?.bookingId || "—"}</Td>
                              <Td fontWeight="bold">₹{Number(r?.amount ?? 0).toLocaleString()}</Td>
                              <Td fontSize="xs">{r?.paymentMethod || r?.paymentMode || r?.gateway || "Razorpay"}</Td>
                              <Td><Badge colorScheme={badgeColor}>{status}</Badge></Td>
                              <Td fontSize="xs">{r?.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</Td>
                              <Td>
                                <HStack spacing={1}>
                                  <Button size="xs" variant="outline" colorScheme="green" onClick={() => markStatus(r, "success")}>
                                    Approve
                                  </Button>
                                  <Button size="xs" variant="outline" colorScheme="red" onClick={() => markStatus(r, "failed")}>
                                    Mark Failed
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>

              {/* Tab 2: Booking Payment Audit Lookup */}
              <TabPanel px={0} pt={4}>
                <Box maxW="600px" mb={6}>
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" fontWeight="semibold">Search Payment by Booking ID</FormLabel>
                    <HStack>
                      <Input
                        value={lookupBookingId}
                        onChange={(e) => setLookupBookingId(e.target.value)}
                        placeholder="Enter Booking ID (e.g. 507f1f77bcf86cd799439077)"
                      />
                      <Button bg={BRAND} color="white" isLoading={lookupLoading} onClick={searchBookingPayment}>
                        Lookup
                      </Button>
                    </HStack>
                  </FormControl>
                </Box>

                {bookingPayment && (
                  <Card p={5} variant="outline" borderRadius="md" maxW="700px">
                    <Heading size="sm" mb={3} color="teal.600">Booking Payment Details</Heading>
                    <Divider mb={3} />
                    <VStack align="stretch" spacing={2} fontSize="sm">
                      <Flex justify="space-between">
                        <Text color="gray.500">Payment ID:</Text>
                        <Text fontWeight="semibold" fontFamily="mono">{bookingPayment._id || bookingPayment.id || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Booking ID:</Text>
                        <Text fontWeight="semibold" fontFamily="mono">{bookingPayment.bookingId || lookupBookingId}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Amount Paid:</Text>
                        <Text fontWeight="bold" color="teal.600">₹{Number(bookingPayment.amount || 0).toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Payment Status:</Text>
                        <Badge colorScheme={bookingPayment.status === "success" ? "green" : "yellow"}>
                          {bookingPayment.status || "—"}
                        </Badge>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Transaction Reference:</Text>
                        <Text fontFamily="mono">{bookingPayment.transactionReference || bookingPayment.razorpayPaymentId || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Payment Mode:</Text>
                        <Text>{bookingPayment.paymentMode || bookingPayment.method || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Created At:</Text>
                        <Text>{bookingPayment.createdAt ? new Date(bookingPayment.createdAt).toLocaleString() : "—"}</Text>
                      </Flex>
                    </VStack>
                    <Divider my={4} />
                    <Flex justify="space-between" align="center">
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        isLoading={deletingPayment}
                        onClick={() => removeBookingPayment(bookingPayment._id || bookingPayment.id || lookupBookingId)}
                      >
                        Delete Payment Record
                      </Button>
                      <HStack>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="green"
                          onClick={() => markStatus(bookingPayment, "success")}
                        >
                          Mark Success
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={() => markStatus(bookingPayment, "failed")}
                        >
                          Mark Failed
                        </Button>
                      </HStack>
                    </Flex>
                  </Card>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Record Offline Payment Modal */}
      <Modal isOpen={offlineOpen} onClose={() => setOfflineOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record Offline Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3} isRequired>
              <FormLabel fontSize="sm">Booking ID</FormLabel>
              <Input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="507f1f77bcf86cd799439077"
              />
            </FormControl>
            <FormControl mb={3} isRequired>
              <FormLabel fontSize="sm">Amount (₹)</FormLabel>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 750"
                type="number"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel fontSize="sm">Payment Mode</FormLabel>
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="cash">Cash on Delivery</option>
                <option value="upi">Direct UPI (QR / Mobile)</option>
                <option value="bank_transfer">Direct Bank Transfer (NEFT/IMPS)</option>
                <option value="card">Point-of-Sale Card</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Transaction Reference / UTR</FormLabel>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="UTR number or receipt ref"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setOfflineOpen(false)}>Cancel</Button>
            <Button bg={BRAND} color="white" isLoading={saving} onClick={submitOffline}>
              Record Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
