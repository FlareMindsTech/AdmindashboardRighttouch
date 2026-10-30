// src/views/Dashboard/RewardsManagement.js — Full Reward Governance, Wallets, Ledger & Audit
// Covers Postman Folder 16 (8 canonical endpoints):
// 1. GET/POST /admin/rewards/policy
// 2. GET /admin/rewards/metrics
// 3. GET /admin/rewards/wallets
// 4. GET /admin/rewards/wallets/:customerId
// 5. GET /admin/rewards/transactions
// 6. GET /admin/rewards/redemptions
// 7. GET /admin/rewards/reconciliation

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useToast,
  Spinner,
  Center,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Switch,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  Divider,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import SharedStatCard from "components/common/StatCard";
import {
  getRewardPolicy,
  createRewardPolicy,
  getRewardMetrics,
  getRewardWallets,
  getCustomerRewardOverview,
  getRewardTransactions,
  getRewardRedemptions,
  getRewardReconciliation,
} from "api/rewards";

const BRAND = "#008080";

export default function RewardsManagement() {
  const toast = useToast();
  const [tabIndex, setTabIndex] = useState(0);

  // Stats & Policy
  const [policy, setPolicy] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Form State
  const [form, setForm] = useState({
    rewardRateBps: "",
    expiryMonths: "",
    maxRedemptionPct: "",
    earningEnabled: true,
    minEligiblePaise: "",
    maxCoinsPerBooking: "",
    notes: "",
  });

  // Wallets State
  const [wallets, setWallets] = useState([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [walletFilter, setWalletFilter] = useState({ search: "", minCoins: "0" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState("");

  // Redemptions State
  const [redemptions, setRedemptions] = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState("");

  // Reconciliation State
  const [reconciliation, setReconciliation] = useState(null);
  const [reconLoading, setReconLoading] = useState(false);

  // Load KPI & Policy
  const loadOverview = useCallback(async () => {
    setLoading(true);
    const [{ data: p, error: pe }, { data: m }] = await Promise.all([
      getRewardPolicy(),
      getRewardMetrics(),
    ]);
    setLoading(false);

    if (pe) {
      toast({
        title: "Failed to load rewards policy",
        description: pe,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const pol = p?.result ?? p?.data ?? p ?? null;
    setPolicy(pol);
    if (pol && typeof pol === "object") {
      setForm({
        rewardRateBps: pol.rewardRateBps ?? "",
        expiryMonths: pol.expiryMonths ?? "",
        maxRedemptionPct: pol.maxRedemptionPct ?? "",
        earningEnabled: pol.earningEnabled ?? true,
        minEligiblePaise: pol.minEligiblePaise ?? "",
        maxCoinsPerBooking: pol.maxCoinsPerBooking ?? "",
        notes: pol.notes ?? "",
      });
    }
    setMetrics(m?.result ?? m?.data ?? m ?? null);
  }, [toast]);

  // Load Wallets
  const loadWallets = useCallback(async () => {
    setWalletsLoading(true);
    const params = {};
    if (walletFilter.search) params.search = walletFilter.search;
    if (walletFilter.minCoins) params.minAvailableCoins = walletFilter.minCoins;

    const { data, error } = await getRewardWallets(params);
    setWalletsLoading(false);
    if (error) {
      toast({ title: "Failed to load wallets", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    const list = data?.result ?? data?.data ?? data ?? [];
    setWallets(Array.isArray(list) ? list : list?.wallets ?? []);
  }, [walletFilter, toast]);

  // Load Transactions
  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    const params = {};
    if (txTypeFilter) params.type = txTypeFilter;

    const { data, error } = await getRewardTransactions(params);
    setTxLoading(false);
    if (error) {
      toast({ title: "Failed to load transactions", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    const list = data?.result ?? data?.data ?? data ?? [];
    setTransactions(Array.isArray(list) ? list : list?.transactions ?? []);
  }, [txTypeFilter, toast]);

  // Load Redemptions
  const loadRedemptions = useCallback(async () => {
    setRedemptionsLoading(true);
    const params = {};
    if (redemptionStatusFilter) params.status = redemptionStatusFilter;

    const { data, error } = await getRewardRedemptions(params);
    setRedemptionsLoading(false);
    if (error) {
      toast({ title: "Failed to load redemptions", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    const list = data?.result ?? data?.data ?? data ?? [];
    setRedemptions(Array.isArray(list) ? list : list?.redemptions ?? []);
  }, [redemptionStatusFilter, toast]);

  // Load Reconciliation
  const loadReconciliation = useCallback(async () => {
    setReconLoading(true);
    const { data, error } = await getRewardReconciliation();
    setReconLoading(false);
    if (error) {
      toast({ title: "Failed to load reconciliation", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    setReconciliation(data?.result ?? data?.data ?? data ?? null);
  }, [toast]);

  // Customer Overview Modal
  const openCustomerDetails = async (customerId) => {
    if (!customerId) return;
    setCustomerModalOpen(true);
    setCustomerLoading(true);
    const { data, error } = await getCustomerRewardOverview(customerId);
    setCustomerLoading(false);
    if (error) {
      toast({ title: "Failed to load customer reward overview", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    setSelectedCustomer(data?.result ?? data?.data ?? data ?? null);
  };

  // Initial load
  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Lazy tab switcher
  useEffect(() => {
    if (tabIndex === 1) loadWallets();
    else if (tabIndex === 2) loadTransactions();
    else if (tabIndex === 3) loadRedemptions();
    else if (tabIndex === 4) loadReconciliation();
  }, [tabIndex, loadWallets, loadTransactions, loadRedemptions, loadReconciliation]);

  const savePolicy = async () => {
    setSavingPolicy(true);
    const payload = {
      ...form,
      rewardRateBps: Number(form.rewardRateBps) || undefined,
      expiryMonths: Number(form.expiryMonths) || undefined,
      maxRedemptionPct: Number(form.maxRedemptionPct) || undefined,
      minEligiblePaise: Number(form.minEligiblePaise) || undefined,
      maxCoinsPerBooking: Number(form.maxCoinsPerBooking) || undefined,
    };
    const { error } = await createRewardPolicy(payload);
    setSavingPolicy(false);
    if (error) {
      toast({ title: "Save failed", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: "Reward policy saved successfully", status: "success", duration: 2500, isClosable: true });
    loadOverview();
  };

  const idOf = (r) => r?._id || r?.id || r?.customerId || "—";

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      {/* Top Standardized KPI Cards (105px height) */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
        <SharedStatCard kpi title="Coins Issued" value={String(metrics?.issued ?? metrics?.totalIssued ?? "—")} />
        <SharedStatCard kpi title="Coins Redeemed" value={String(metrics?.redeemed ?? metrics?.totalRedeemed ?? "—")} />
        <SharedStatCard kpi title="Active Wallets" value={String(metrics?.activeUsers ?? metrics?.totalWallets ?? "—")} />
        <SharedStatCard kpi title="Earning Mode" value={policy?.earningEnabled === false ? "Disabled" : "Active"} />
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={3}>
            <Box>
              <Heading size="md">Rewards & Loyalty Hub</Heading>
              <Text fontSize="sm" color="gray.500">
                Governance, customer wallets, transaction ledger, and redemption audit
              </Text>
            </Box>
            <HStack>
              <Button size="sm" variant="outline" onClick={loadOverview}>
                Refresh Metrics
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="teal" isLazy>
            <TabList overflowX="auto" overflowY="hidden" py={1}>
              <Tab fontWeight="semibold">Reward Policy</Tab>
              <Tab fontWeight="semibold">Customer Wallets</Tab>
              <Tab fontWeight="semibold">Transactions Ledger</Tab>
              <Tab fontWeight="semibold">Redemptions Audit</Tab>
              <Tab fontWeight="semibold">System Reconciliation</Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Reward Policy */}
              <TabPanel px={0} pt={4}>
                {loading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : (
                  <Box>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Reward Rate (bps - Basis Points)</FormLabel>
                        <Input
                          value={form.rewardRateBps}
                          onChange={(e) => setForm((f) => ({ ...f, rewardRateBps: e.target.value }))}
                          placeholder="e.g. 100 (100 bps = 1%)"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>100 basis points = 1% coins awarded on completed services</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Coin Expiry Duration (Months)</FormLabel>
                        <Input
                          value={form.expiryMonths}
                          onChange={(e) => setForm((f) => ({ ...f, expiryMonths: e.target.value }))}
                          placeholder="e.g. 12"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>Earned coins expire after this many months (FIFO deduction)</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Max Redemption Percentage (%)</FormLabel>
                        <Input
                          value={form.maxRedemptionPct}
                          onChange={(e) => setForm((f) => ({ ...f, maxRedemptionPct: e.target.value }))}
                          placeholder="e.g. 20"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>Maximum percentage of service bill payable with coins</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Min Eligible Amount (in Paise)</FormLabel>
                        <Input
                          value={form.minEligiblePaise}
                          onChange={(e) => setForm((f) => ({ ...f, minEligiblePaise: e.target.value }))}
                          placeholder="e.g. 10000 (₹100)"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>100 coins = ₹1 (1 coin = 1 paise)</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Max Coins Redeemable per Booking</FormLabel>
                        <Input
                          value={form.maxCoinsPerBooking}
                          onChange={(e) => setForm((f) => ({ ...f, maxCoinsPerBooking: e.target.value }))}
                          placeholder="e.g. 500"
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center" gap={3} pt={4}>
                        <FormLabel mb={0} fontSize="sm" fontWeight="semibold">Global Earning Enabled</FormLabel>
                        <Switch
                          isChecked={!!form.earningEnabled}
                          onChange={(e) => setForm((f) => ({ ...f, earningEnabled: e.target.checked }))}
                          colorScheme="teal"
                          size="lg"
                        />
                      </FormControl>
                      <FormControl gridColumn={{ md: "1 / -1" }}>
                        <FormLabel fontSize="sm" fontWeight="semibold">Policy Governance Notes</FormLabel>
                        <Input
                          value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          placeholder="Optional audit notes on policy rationale"
                        />
                      </FormControl>
                    </SimpleGrid>
                    <Flex justify="flex-end" gap={3}>
                      <Button variant="outline" onClick={loadOverview}>Reset</Button>
                      <Button variant="brand" isLoading={savingPolicy} onClick={savePolicy}>
                        Save Reward Policy
                      </Button>
                    </Flex>
                  </Box>
                )}
              </TabPanel>

              {/* Tab 2: Customer Wallets Directory */}
              <TabPanel px={0} pt={4}>
                <Flex gap={3} mb={4} wrap="wrap" align="center" justify="space-between">
                  <HStack spacing={3} wrap="wrap">
                    <Input
                      maxW="260px"
                      size="sm"
                      placeholder="Search Customer ID / Mobile"
                      value={walletFilter.search}
                      onChange={(e) => setWalletFilter((f) => ({ ...f, search: e.target.value }))}
                    />
                    <Select
                      maxW="180px"
                      size="sm"
                      value={walletFilter.minCoins}
                      onChange={(e) => setWalletFilter((f) => ({ ...f, minCoins: e.target.value }))}
                    >
                      <option value="0">All Balances (≥ 0)</option>
                      <option value="100">≥ 100 Coins (₹1)</option>
                      <option value="500">≥ 500 Coins (₹5)</option>
                      <option value="1000">≥ 1,000 Coins (₹10)</option>
                    </Select>
                    <Button size="sm" variant="brand" onClick={loadWallets}>
                      Apply Filters
                    </Button>
                  </HStack>
                  <Button size="sm" variant="ghost" onClick={loadWallets}>
                    Refresh Wallets
                  </Button>
                </Flex>

                {walletsLoading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : wallets.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No customer reward wallets found.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Customer</Th>
                          <Th>Available Coins</Th>
                          <Th>Reserved Coins</Th>
                          <Th>Total Earned</Th>
                          <Th>Total Redeemed</Th>
                          <Th>Cash Equivalent</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {wallets.map((w, idx) => {
                          const avail = Number(w.availableCoins || w.coins || 0);
                          const reserved = Number(w.reservedCoins || 0);
                          const custId = w.customerId || w.userId || idOf(w);
                          return (
                            <Tr key={custId + idx}>
                              <Td fontSize="xs" fontFamily="mono">{custId}</Td>
                              <Td fontWeight="bold" color="teal.600">{avail.toLocaleString()}</Td>
                              <Td color="orange.500">{reserved.toLocaleString()}</Td>
                              <Td>{Number(w.lifetimeEarned || w.totalEarned || 0).toLocaleString()}</Td>
                              <Td>{Number(w.lifetimeRedeemed || w.totalRedeemed || 0).toLocaleString()}</Td>
                              <Td fontSize="xs">₹{(avail / 100).toFixed(2)}</Td>
                              <Td>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => openCustomerDetails(custId)}
                                >
                                  View Lots & History
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

              {/* Tab 3: Transactions Ledger */}
              <TabPanel px={0} pt={4}>
                <Flex gap={3} mb={4} wrap="wrap" align="center" justify="space-between">
                  <HStack spacing={3}>
                    <Select
                      maxW="200px"
                      size="sm"
                      value={txTypeFilter}
                      onChange={(e) => setTxTypeFilter(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="EARN">EARN</option>
                      <option value="REDEEM">REDEEM</option>
                      <option value="EXPIRE">EXPIRE</option>
                      <option value="CLAWBACK">CLAWBACK</option>
                      <option value="ADJUST">ADJUST</option>
                    </Select>
                    <Button size="sm" variant="brand" onClick={loadTransactions}>
                      Filter Ledger
                    </Button>
                  </HStack>
                  <Button size="sm" variant="ghost" onClick={loadTransactions}>
                    Refresh Ledger
                  </Button>
                </Flex>

                {txLoading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : transactions.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No reward transactions recorded yet.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Tx ID</Th>
                          <Th>Customer</Th>
                          <Th>Type</Th>
                          <Th>Coins</Th>
                          <Th>Reference / Booking</Th>
                          <Th>Balance After</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {transactions.map((tx, idx) => {
                          const type = tx.type || tx.action || "UNKNOWN";
                          const badgeColor =
                            type === "EARN" ? "green" :
                            type === "REDEEM" ? "blue" :
                            type === "CLAWBACK" ? "red" :
                            type === "EXPIRE" ? "gray" : "purple";
                          return (
                            <Tr key={idOf(tx) + idx}>
                              <Td fontSize="xs" fontFamily="mono">{idOf(tx)}</Td>
                              <Td fontSize="xs" fontFamily="mono">{tx.customerId || tx.userId || "—"}</Td>
                              <Td><Badge colorScheme={badgeColor}>{type}</Badge></Td>
                              <Td fontWeight="semibold">{tx.coins ? (type === "EARN" ? `+${tx.coins}` : `-${tx.coins}`) : "—"}</Td>
                              <Td fontSize="xs">{tx.bookingId || tx.referenceId || "—"}</Td>
                              <Td fontSize="xs">{tx.balanceAfter != null ? tx.balanceAfter : "—"}</Td>
                              <Td fontSize="xs">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>

              {/* Tab 4: Redemptions Audit */}
              <TabPanel px={0} pt={4}>
                <Flex gap={3} mb={4} wrap="wrap" align="center" justify="space-between">
                  <HStack spacing={3}>
                    <Select
                      maxW="200px"
                      size="sm"
                      value={redemptionStatusFilter}
                      onChange={(e) => setRedemptionStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="reserved">Reserved</option>
                      <option value="consumed">Consumed</option>
                      <option value="released">Released</option>
                    </Select>
                    <Button size="sm" variant="brand" onClick={loadRedemptions}>
                      Filter Redemptions
                    </Button>
                  </HStack>
                  <Button size="sm" variant="ghost" onClick={loadRedemptions}>
                    Refresh Redemptions
                  </Button>
                </Flex>

                {redemptionsLoading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : redemptions.length === 0 ? (
                  <Center py={10}><Text color="gray.500">No coin redemption records found.</Text></Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Redemption ID</Th>
                          <Th>Booking ID</Th>
                          <Th>Customer</Th>
                          <Th>Coins</Th>
                          <Th>Discount (₹)</Th>
                          <Th>Status</Th>
                          <Th>Created At</Th>
                          <Th>Consumed At</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {redemptions.map((rd, idx) => {
                          const status = rd.status || "reserved";
                          const color =
                            status === "consumed" ? "green" :
                            status === "reserved" ? "yellow" : "red";
                          return (
                            <Tr key={idOf(rd) + idx}>
                              <Td fontSize="xs" fontFamily="mono">{idOf(rd)}</Td>
                              <Td fontSize="xs" fontFamily="mono">{rd.bookingId || "—"}</Td>
                              <Td fontSize="xs" fontFamily="mono">{rd.customerId || rd.userId || "—"}</Td>
                              <Td fontWeight="bold">{rd.coins || rd.coinsRedeemed || 0}</Td>
                              <Td>₹{rd.discountRupees != null ? rd.discountRupees : (Number(rd.coins || 0) / 100).toFixed(2)}</Td>
                              <Td><Badge colorScheme={color}>{status}</Badge></Td>
                              <Td fontSize="xs">{rd.createdAt ? new Date(rd.createdAt).toLocaleString() : "—"}</Td>
                              <Td fontSize="xs">{rd.consumedAt ? new Date(rd.consumedAt).toLocaleString() : (rd.releasedAt ? `Released: ${new Date(rd.releasedAt).toLocaleTimeString()}` : "—")}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>

              {/* Tab 5: System Reconciliation & Health */}
              <TabPanel px={0} pt={4}>
                {reconLoading ? (
                  <Center py={10}><Spinner color={BRAND} /></Center>
                ) : (
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Heading size="sm">Ledger Reconciliation Audit</Heading>
                        <Text fontSize="xs" color="gray.500">Cross-verifies wallet balances against granular lot transactions</Text>
                      </Box>
                      <Button size="sm" variant="outline" onClick={loadReconciliation}>
                        Re-Audit Ledger
                      </Button>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                      <Card p={4} variant="outline">
                        <Stat>
                          <StatLabel fontSize="xs">Active Wallets Balance</StatLabel>
                          <StatNumber fontSize="xl" color="teal.600">
                            {Number(reconciliation?.totalWalletCoins ?? reconciliation?.walletTotal ?? 0).toLocaleString()}
                          </StatNumber>
                          <StatHelpText>Sum of all customer wallets</StatHelpText>
                        </Stat>
                      </Card>
                      <Card p={4} variant="outline">
                        <Stat>
                          <StatLabel fontSize="xs">Transaction Ledger Net</StatLabel>
                          <StatNumber fontSize="xl" color="blue.600">
                            {Number(reconciliation?.totalLedgerCoins ?? reconciliation?.ledgerTotal ?? 0).toLocaleString()}
                          </StatNumber>
                          <StatHelpText>Net of EARN - REDEEM - EXPIRE</StatHelpText>
                        </Stat>
                      </Card>
                      <Card p={4} variant="outline">
                        <Stat>
                          <StatLabel fontSize="xs">Discrepancy / Variance</StatLabel>
                          <StatNumber
                            fontSize="xl"
                            color={Number(reconciliation?.discrepancy || 0) === 0 ? "green.500" : "red.500"}
                          >
                            {Number(reconciliation?.discrepancy || 0).toLocaleString()}
                          </StatNumber>
                          <StatHelpText>
                            {Number(reconciliation?.discrepancy || 0) === 0 ? "Ledger perfectly synchronized" : "Discrepancy detected"}
                          </StatHelpText>
                        </Stat>
                      </Card>
                    </SimpleGrid>

                    {reconciliation?.details && (
                      <Box mt={4} p={4} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="md">
                        <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap">
                          {JSON.stringify(reconciliation.details, null, 2)}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Customer Wallet Modal Details */}
      <Modal isOpen={customerModalOpen} onClose={() => setCustomerModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Reward Breakdown</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {customerLoading ? (
              <Center py={8}><Spinner color={BRAND} /></Center>
            ) : !selectedCustomer ? (
              <Text>No customer overview details found.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={2} spacing={3} p={3} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="md">
                  <Box>
                    <Text fontSize="xs" color="gray.500">Available Coins</Text>
                    <Text fontSize="lg" fontWeight="bold" color="teal.600">
                      {Number(selectedCustomer.availableCoins || selectedCustomer.coins || 0).toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Reserved Coins</Text>
                    <Text fontSize="lg" fontWeight="bold" color="orange.500">
                      {Number(selectedCustomer.reservedCoins || 0).toLocaleString()}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Divider />
                <Heading size="xs">Active FIFO Coin Lots</Heading>
                {Array.isArray(selectedCustomer.lots) && selectedCustomer.lots.length > 0 ? (
                  <Table size="xs" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Lot ID</Th>
                        <Th>Remaining</Th>
                        <Th>Expires At</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedCustomer.lots.map((lot, idx) => (
                        <Tr key={lot._id || idx}>
                          <Td fontSize="xs" fontFamily="mono">{lot._id || `Lot #${idx + 1}`}</Td>
                          <Td fontWeight="semibold">{lot.remainingCoins || lot.coins || 0}</Td>
                          <Td fontSize="xs">{lot.expiresAt ? new Date(lot.expiresAt).toLocaleDateString() : "Never"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text fontSize="xs" color="gray.500">No active coin lots remaining.</Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={() => setCustomerModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
