// src/views/Dashboard/SkillRequests.js — Technician Skill Requests (Admin)
// Covers Postman folder 8: GET /admin/technician-skill-requests,
// PUT /admin/technician-skill-requests/:requestId/review
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
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { MobileCard, MobileCardActions } from "components/common/MobileCard";
import { listSkillRequests, reviewSkillRequest } from "api/skillRequests";

const BRAND = "#008080";

const statusColor = (s) => {
  const v = String(s || "").toLowerCase();
  if (["approved", "accepted", "resolved"].includes(v)) return "green";
  if (["rejected"].includes(v)) return "red";
  return "yellow";
};

export default function SkillRequests() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [reviewTarget, setReviewTarget] = useState(null);
  const [action, setAction] = useState("accept");
  const [remarks, setRemarks] = useState("");
  const [autoEnable, setAutoEnable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const { data, error } = await listSkillRequests(params);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load skill requests", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    const list = data?.result ?? data?.data ?? data ?? [];
    setRows(Array.isArray(list) ? list : list?.requests ?? []);
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);

  const openReview = (row) => {
    setReviewTarget(row);
    setAction("accept");
    setRemarks("");
    setAutoEnable(true);
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    const id = reviewTarget._id || reviewTarget.requestId || reviewTarget.id;
    if (!id) return;
    setSubmitting(true);
    const { error } = await reviewSkillRequest(id, {
      action,
      adminRemarks: remarks,
      autoEnableInZone: autoEnable,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Review failed", description: error, status: "error", duration: 3000, isClosable: true });
      return;
    }
    toast({ title: `Request ${action}ed`, status: "success", duration: 2500, isClosable: true });
    setReviewTarget(null);
    fetchList();
  };

  const idOf = (r) => r?._id || r?.requestId || r?.id || "—";
  const techOf = (r) =>
    r?.technicianName || r?.technician?.name || r?.technicianId || "—";
  const skillOf = (r) => r?.skill || r?.serviceName || r?.serviceId || "—";

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={3}>
            <Box>
              <Heading size="md">Skill Requests</Heading>
              <Text fontSize="sm" color="gray.500">Review technician skill additions</Text>
            </Box>
            <HStack>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} maxW="200px" size="sm" placeholder="All statuses">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Button size="sm" onClick={fetchList} variant="brand">Refresh</Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Center py={10}><Spinner color={BRAND} /></Center>
          ) : pageRows.length === 0 ? (
            <Center py={10}><Text color="gray.500">No skill requests found.</Text></Center>
          ) : (
            <>
              <Box overflowX="auto" display={{ base: "none", md: "block" }}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Request</Th>
                      <Th>Technician</Th>
                      <Th>Skill / Service</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pageRows.map((r) => (
                      <Tr key={idOf(r)}>
                        <Td fontSize="xs">{idOf(r)}</Td>
                        <Td>{techOf(r)}</Td>
                        <Td>{skillOf(r)}</Td>
                        <Td><Badge colorScheme={statusColor(r.status)}>{r.status || "pending"}</Badge></Td>
                        <Td>
                          <Button size="xs" variant="brand" onClick={() => openReview(r)}>Review</Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Box display={{ base: "block", md: "none" }}>
                {pageRows.map((r) => (
                  <MobileCard key={idOf(r)} title={skillOf(r)} subtitle={techOf(r)}>
                    <Badge colorScheme={statusColor(r.status)}>{r.status || "pending"}</Badge>
                    <MobileCardActions actions={[{ label: "Review", colorScheme: "teal", onClick: () => openReview(r) }]} />
                  </MobileCard>
                ))}
              </Box>
              <Flex justify="space-between" align="center" mt={4}>
                <Text fontSize="sm" color="gray.500">Page {page} of {totalPages} ({rows.length})</Text>
                <HStack>
                  <Button size="sm" isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                  <Button size="sm" isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </HStack>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Skill Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Decision</FormLabel>
              <Select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="accept">Accept</option>
                <option value="reject">Reject</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Admin remarks</FormLabel>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason / notes" />
            </FormControl>
            <FormControl display="flex" alignItems="center" gap={2}>
              <FormLabel mb={0}>Auto-enable in zone</FormLabel>
              <Switch isChecked={autoEnable} onChange={(e) => setAutoEnable(e.target.checked)} colorScheme="teal" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button variant="brand" isLoading={submitting} onClick={submitReview}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
