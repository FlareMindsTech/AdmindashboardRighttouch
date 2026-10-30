import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Spinner,
  Center,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaUser,
  FaFileInvoiceDollar,
  FaUniversity,
  FaCheckCircle,
  FaHistory,
  FaClock,
} from "react-icons/fa";
import { getWithdrawalDetails } from "api/wallet";
import PayoutStatusBadge from "./PayoutStatusBadge";
import FinancialBreakdown from "./FinancialBreakdown";

export default function WithdrawalDetailsDrawer({
  isOpen,
  onClose,
  withdrawalId,
  onOpenRecordTransfer,
  onOpenApprove,
  onOpenReject,
  onViewReceipt,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && withdrawalId) {
      fetchDetails(withdrawalId);
    } else {
      setDetails(null);
      setErrorMsg("");
    }
  }, [isOpen, withdrawalId]);

  const fetchDetails = async (id) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await getWithdrawalDetails(id);
      if (error) {
        setErrorMsg(error);
      } else {
        setDetails(data?.result || data);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load withdrawal details.");
    } finally {
      setLoading(false);
    }
  };

  const status = details?.status || "pending";
  const tech = details?.technician || {};
  const fin = details?.financials || {};
  const bank = details?.bankDetails || {};
  const timestamps = details?.timestamps || {};
  const auditLogs = details?.auditHistory || [];

  // Mask bank account number safely (never expose raw in UI)
  const rawAcc = String(bank?.accountNumber || "").replace(/\s/g, "");
  const maskedAcc = rawAcc ? `****${rawAcc.slice(-4)}` : "Not provided";

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(3px)" />
      <DrawerContent bg={isDark ? "gray.900" : "white"} color={isDark ? "gray.100" : "gray.800"}>
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.800" : "gray.50"}
          py={4}
          px={6}
        >
          <HStack justify="space-between" align="center" pr={8}>
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Withdrawal Details
              </Text>
              <Text fontSize="2xs" color="gray.500" fontFamily="mono">
                ID: #{withdrawalId}
              </Text>
            </Box>
            <PayoutStatusBadge status={status} size="sm" />
          </HStack>
        </DrawerHeader>
        <DrawerCloseButton top={4} right={4} />

        <DrawerBody p={6}>
          {loading ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Spinner size="lg" color="teal.500" thickness="3px" />
                <Text fontSize="xs" color="gray.500">Loading audit & payout details...</Text>
              </VStack>
            </Center>
          ) : errorMsg ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Text fontSize="sm" color="red.500" fontWeight="600">{errorMsg}</Text>
                <Button size="xs" onClick={() => fetchDetails(withdrawalId)}>Retry</Button>
              </VStack>
            </Center>
          ) : details ? (
            <VStack spacing={5} align="stretch">
              {/* Financial Breakdown Card */}
              <Box>
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color="gray.500" mb={2}>
                  Financial Breakdown
                </Text>
                <FinancialBreakdown financials={fin} isDark={isDark} />
              </Box>

              {/* Technician Info Card */}
              <Box
                p={4}
                borderRadius="14px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FaUser} color="teal.500" />
                    <Text fontSize="xs" fontWeight="700">Technician Information</Text>
                  </HStack>
                  {tech.payoutBlocked && (
                    <Badge colorScheme="red" fontSize="2xs">
                      PAYOUTS FROZEN
                    </Badge>
                  )}
                </HStack>
                <VStack spacing={1.5} align="stretch" fontSize="xs">
                  <HStack justify="space-between">
                    <Text color="gray.500">Name:</Text>
                    <Text fontWeight="600">{tech.name || "N/A"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Phone:</Text>
                    <Text fontWeight="600">{tech.mobileNumber || "N/A"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Email:</Text>
                    <Text fontWeight="600">{tech.email || "N/A"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Origin:</Text>
                    <Badge colorScheme={details.origin === "admin_direct" ? "purple" : "teal"} fontSize="2xs">
                      {details.origin === "admin_direct" ? "Admin Direct" : "Technician Requested"}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Bank & Destination Details (Masked) */}
              <Box
                p={4}
                borderRadius="14px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FaUniversity} color="blue.500" />
                    <Text fontSize="xs" fontWeight="700">Bank Destination (Masked)</Text>
                  </HStack>
                  <Badge colorScheme={bank.bankVerified ? "green" : "orange"} fontSize="2xs">
                    {bank.bankVerified ? "KYC VERIFIED" : "VERIFICATION PENDING"}
                  </Badge>
                </HStack>
                <VStack spacing={1.5} align="stretch" fontSize="xs">
                  <HStack justify="space-between">
                    <Text color="gray.500">Account Holder:</Text>
                    <Text fontWeight="600">{bank.accountHolderName || "N/A"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Bank Name:</Text>
                    <Text fontWeight="600">{bank.bankName || "N/A"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Account Number:</Text>
                    <Text fontWeight="700" fontFamily="mono">{maskedAcc}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">IFSC Code:</Text>
                    <Text fontWeight="700" fontFamily="mono">{bank.ifscCode || "N/A"}</Text>
                  </HStack>
                  {bank.upiId && (
                    <HStack justify="space-between">
                      <Text color="gray.500">UPI ID:</Text>
                      <Text fontWeight="600" fontFamily="mono">{bank.upiId}</Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* Transfer Details (If processed/paid) */}
              {(details.utr || status === "paid") && (
                <Box
                  p={4}
                  borderRadius="14px"
                  bg={isDark ? "gray.800" : "green.50"}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "green.200"}
                >
                  <HStack spacing={2} mb={2}>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="xs" fontWeight="700" color="green.700">
                      Bank Transfer Execution Record
                    </Text>
                  </HStack>
                  <VStack spacing={1.5} align="stretch" fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.500">UTR / Reference:</Text>
                      <Text fontWeight="800" fontFamily="mono" color="green.700">
                        {details.utr || "N/A"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Payout Mode:</Text>
                      <Badge colorScheme="green" fontSize="2xs">
                        {details.payoutMode || "NEFT"}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Transfer Date:</Text>
                      <Text fontWeight="600">
                        {timestamps.paidAt ? new Date(timestamps.paidAt).toLocaleString("en-IN") : "N/A"}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Lifecycle Timestamps */}
              <Box
                p={4}
                borderRadius="14px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <HStack spacing={2} mb={2}>
                  <Icon as={FaClock} color="gray.500" />
                  <Text fontSize="xs" fontWeight="700">Timeline & Timestamps</Text>
                </HStack>
                <VStack spacing={1.5} align="stretch" fontSize="xs">
                  <HStack justify="space-between">
                    <Text color="gray.500">Requested:</Text>
                    <Text>{timestamps.createdAt ? new Date(timestamps.createdAt).toLocaleString("en-IN") : "N/A"}</Text>
                  </HStack>
                  {timestamps.decidedAt && (
                    <HStack justify="space-between">
                      <Text color="gray.500">Decided / Approved:</Text>
                      <Text>{new Date(timestamps.decidedAt).toLocaleString("en-IN")}</Text>
                    </HStack>
                  )}
                  {timestamps.paidAt && (
                    <HStack justify="space-between">
                      <Text color="gray.500">Paid:</Text>
                      <Text>{new Date(timestamps.paidAt).toLocaleString("en-IN")}</Text>
                    </HStack>
                  )}
                  {timestamps.failedAt && (
                    <HStack justify="space-between">
                      <Text color="gray.500">Failed / Reverted:</Text>
                      <Text color="red.500">{new Date(timestamps.failedAt).toLocaleString("en-IN")}</Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* Audit History Accordion */}
              {auditLogs.length > 0 && (
                <Accordion allowToggle>
                  <AccordionItem border="none">
                    <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                      <Box flex="1" textAlign="left" fontSize="xs" fontWeight="700" color="gray.500">
                        <HStack spacing={2}>
                          <Icon as={FaHistory} />
                          <Text>Audit History ({auditLogs.length} events)</Text>
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0} pb={2}>
                      <VStack spacing={2} align="stretch" fontSize="2xs">
                        {auditLogs.map((log, idx) => (
                          <Box
                            key={idx}
                            p={2.5}
                            borderRadius="8px"
                            bg={isDark ? "gray.800" : "gray.100"}
                            borderLeft="3px solid"
                            borderColor="teal.400"
                          >
                            <HStack justify="space-between" mb={1}>
                              <Badge fontSize="3xs" colorScheme="teal">
                                {log.action}
                              </Badge>
                              <Text color="gray.400">
                                {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : ""}
                              </Text>
                            </HStack>
                            {log.reason && <Text color="gray.600">Note: {log.reason}</Text>}
                            <Text color="gray.400" fontFamily="mono">Actor: {log.actorRole} ({log.actor})</Text>
                          </Box>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )}
            </VStack>
          ) : null}
        </DrawerBody>

        <DrawerFooter
          borderTopWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.800" : "gray.50"}
          p={4}
        >
          <HStack spacing={2} justify="flex-end" w="full" flexWrap="wrap">
            {/* Official Receipt View for Paid Withdrawals */}
            {status === "paid" && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="teal"
                leftIcon={<FaFileInvoiceDollar />}
                onClick={() => {
                  onClose();
                  onViewReceipt && onViewReceipt(details);
                }}
              >
                View Official Receipt
              </Button>
            )}

            {/* Approval Summary View for Approved Withdrawals */}
            {status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<FaFileInvoiceDollar />}
                onClick={() => {
                  onClose();
                  onViewReceipt && onViewReceipt(details);
                }}
              >
                View Approval Summary
              </Button>
            )}

                        {/* Quick Action: Record Transfer (if approved) */}
            {status === "approved" && (
              <Button
                size="sm"
                colorScheme="teal"
                fontWeight="700"
                onClick={() => {
                  onClose();
                  onOpenRecordTransfer && onOpenRecordTransfer(details);
                }}
              >
                Record Bank Transfer
              </Button>
            )}

            {/* Quick Action: Approve (if pending/requested) */}
            {(status === "pending" || status === "requested") && (
              <Button
                size="sm"
                colorScheme="blue"
                fontWeight="700"
                onClick={() => {
                  onClose();
                  onOpenApprove && onOpenApprove(details);
                }}
              >
                Approve
              </Button>
            )}

            {/* Quick Action: Reject (if pending/requested/approved) */}
            {(status === "pending" || status === "requested" || status === "approved") && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                fontWeight="700"
                onClick={() => {
                  onClose();
                  onOpenReject && onOpenReject(details);
                }}
              >
                Reject
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
