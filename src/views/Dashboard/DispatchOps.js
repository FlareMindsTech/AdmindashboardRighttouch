// src/views/Dashboard/DispatchOps.js — Dispatch Queue Ops (Admin)
// Covers Postman Folder 14: pending/failed/stats/health, retry, worker controls
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
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import SharedStatCard from "components/common/StatCard";
import {
  getDispatchPending,
  getDispatchFailed,
  getDispatchStats,
  getDispatchHealth,
  retryDispatch,
  retryFailedDispatches,
  restartDispatchWorker,
  stopDispatchWorker,
} from "api/dispatch";

const BRAND = "#008080";

export default function DispatchOps() {
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const loadStats = useCallback(async (isMounted = { current: true }) => {
    const [{ data: s }, { data: h }] = await Promise.all([getDispatchStats(), getDispatchHealth()]);
    if (isMounted.current) {
      setStats(s?.result ?? s ?? null);
      setHealth(h?.result ?? h ?? null);
    }
  }, []);

  const loadList = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) setLoading(true);
    const fn = tab === 0 ? getDispatchPending : getDispatchFailed;
    const { data, error } = await fn();
    if (!isMounted.current) return;
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load dispatch queue", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    const list = data?.result ?? data?.data ?? data ?? [];
    setRows(Array.isArray(list) ? list : list?.jobs ?? list?.items ?? []);
  }, [tab, toast]);

  useEffect(() => {
    const isMounted = { current: true };
    loadStats(isMounted);
    return () => { isMounted.current = false; };
  }, [loadStats]);

  useEffect(() => {
    const isMounted = { current: true };
    loadList(isMounted);
    return () => { isMounted.current = false; };
  }, [loadList]);

  const ok = (msg) => toast({ title: msg, status: "success", duration: 2500, isClosable: true });
  const fail = (e) => toast({ title: "Action failed", description: e, status: "error", duration: 3000, isClosable: true });

  const doRetryOne = async (row) => {
    const id = row?._id || row?.bookingId || row?.id;
    if (!id) return;
    setActing(true);
    const { error } = await retryDispatch(id);
    setActing(false);
    if (error) return fail(error);
    ok("Retry queued");
    loadList();
  };

  const doRetryFailed = async () => {
    setActing(true);
    const { error } = await retryFailedDispatches();
    setActing(false);
    if (error) return fail(error);
    ok("Failed queue re-queued");
    loadList();
  };

  const doWorker = async (fn, label) => {
    setActing(true);
    const { error } = await fn();
    setActing(false);
    if (error) return fail(error);
    ok(label);
    loadStats();
  };

  const statVal = (k, fb = "—") => stats?.[k] ?? stats?.summary?.[k] ?? fb;
  const idOf = (r) => r?._id || r?.bookingId || r?.id || "—";

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
        <SharedStatCard kpi title="Pending" value={String(statVal("pending", stats ? rows.length : "—"))} />
        <SharedStatCard kpi title="Failed" value={String(statVal("failed", "—"))} />
        <SharedStatCard kpi title="Processed" value={String(statVal("processed", statVal("total", "—")))} />
        <SharedStatCard kpi title="Worker" value={String(health?.status || health?.worker || "—")} />
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={3}>
            <Box>
              <Heading size="md">Dispatch Queue</Heading>
              <Text fontSize="sm" color="gray.500">Pending / failed jobs, stats, worker controls</Text>
            </Box>
            <HStack>
              <Button size="sm" variant="outline" isLoading={acting} onClick={doRetryFailed}>Retry all failed</Button>
              <Button size="sm" variant="outline" isLoading={acting} onClick={() => doWorker(restartDispatchWorker, "Worker restarted")}>Restart worker</Button>
              <Button size="sm" variant="outline" colorScheme="red" isLoading={acting} onClick={() => doWorker(stopDispatchWorker, "Worker stopped")}>Stop worker</Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Tabs index={tab} onChange={setTab} colorScheme="teal">
            <TabList>
              <Tab>Pending</Tab>
              <Tab>Failed</Tab>
            </TabList>
            <TabPanels>
              {[0, 1].map((t) => (
                <TabPanel key={t} px={0}>
                  {loading ? (
                    <Center py={10}><Spinner color={BRAND} /></Center>
                  ) : rows.length === 0 ? (
                    <Center py={10}><Text color="gray.500">Queue is empty.</Text></Center>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Job / Booking</Th>
                            <Th>Status</Th>
                            <Th>Attempts</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {rows.map((r, i) => (
                            <Tr key={idOf(r) + i}>
                              <Td fontSize="xs">{idOf(r)}</Td>
                              <Td><Badge colorScheme={t === 0 ? "yellow" : "red"}>{r.status || (t === 0 ? "pending" : "failed")}</Badge></Td>
                              <Td>{r.attempts ?? r.retryCount ?? "—"}</Td>
                              <Td>
                                <Button size="xs" variant="brand" isLoading={acting} onClick={() => doRetryOne(r)}>Retry</Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Box>
  );
}
