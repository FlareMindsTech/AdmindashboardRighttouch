import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Spinner,
  Center,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { FaFileInvoiceDollar, FaPrint } from "react-icons/fa";
import { getWithdrawalReceipt } from "api/wallet";
import FinancialBreakdown from "./FinancialBreakdown";

export default function PayoutReceiptModal({
  isOpen,
  onClose,
  withdrawalId,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && withdrawalId) {
      fetchReceipt(withdrawalId);
    } else {
      setReceipt(null);
      setErrorMsg("");
    }
  }, [isOpen, withdrawalId]);

  const fetchReceipt = async (id) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await getWithdrawalReceipt(id);
      if (error) {
        setErrorMsg(error);
      } else {
        setReceipt(data?.receipt || data?.result || data);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load withdrawal receipt.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tech = receipt?.technician || {};
  const fin = receipt?.financials || {};
  const timestamps = receipt?.timestamps || {};

  const isPaid = receipt?.status === "paid";
  const isApproved = receipt?.status === "approved";
  const isReceiptEligible = isPaid || isApproved;

  // Paid timestamp must come strictly from authoritative records - NEVER fabricate today's date
  const actualPaidDate =
    timestamps.paidAt || receipt?.paidAt
      ? new Date(timestamps.paidAt || receipt?.paidAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  const approvedDate =
    timestamps.approvedAt || receipt?.approvedAt
      ? new Date(timestamps.approvedAt || receipt?.approvedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  // Accurate confirmed payment mode - never default blindly to NEFT
  const confirmedMode =
    receipt?.paymentMode || receipt?.payoutMode || (isPaid ? "Bank Transfer" : "Pending Transfer");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg={isPaid ? "teal.800" : isApproved ? "blue.800" : "gray.800"} color="white" py={4} px={6}>
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FaFileInvoiceDollar} boxSize={5} color={isPaid ? "teal.200" : "blue.200"} />
              <Box>
                <Text fontSize="md" fontWeight="bold">
                  {isPaid ? "Official Payout Receipt" : isApproved ? "Payout Approval Summary" : "Withdrawal Record"}
                </Text>
                <Text fontSize="2xs" color={isPaid ? "teal.200" : "blue.200"} fontFamily="mono">
                  {receipt?.receiptId || `WD-REF-${String(withdrawalId).slice(-8).toUpperCase()}`}
                </Text>
              </Box>
            </HStack>
            <Badge
              colorScheme={isPaid ? "green" : isApproved ? "blue" : "gray"}
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="2xs"
            >
              {receipt?.status?.toUpperCase() || "RECORD"}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} />

        <ModalBody p={6}>
          {loading ? (
            <Center py={12}>
              <VStack spacing={3}>
                <Spinner size="lg" color="teal.500" thickness="3px" />
                <Text fontSize="xs" color="gray.500">Loading payout voucher...</Text>
              </VStack>
            </Center>
          ) : errorMsg ? (
            <Center py={12}>
              <VStack spacing={3}>
                <Text fontSize="sm" color="red.500" fontWeight="600">{errorMsg}</Text>
                <Button size="xs" onClick={() => fetchReceipt(withdrawalId)}>Retry</Button>
              </VStack>
            </Center>
          ) : !isReceiptEligible ? (
            <Center py={8}>
              <VStack spacing={3} textAlign="center" maxW="360px">
                <Icon as={FaFileInvoiceDollar} boxSize={10} color="gray.400" />
                <Text fontSize="sm" fontWeight="700" color="gray.700">
                  Payment Receipt Unavailable
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Official bank payment receipts are only generated for disbursements that have completed bank transfer and recorded UTR evidence.
                </Text>
                <Badge colorScheme="orange" fontSize="2xs">
                  Current Status: {receipt?.status?.toUpperCase() || "UNPAID"}
                </Badge>
              </VStack>
            </Center>
          ) : receipt ? (
            <VStack spacing={4} align="stretch" id="printable-payout-receipt">
              {/* Organization Header */}
              <Box borderBottom="2px solid" borderColor={isPaid ? "teal.500" : "blue.500"} pb={3}>
                <HStack justify="space-between" align="flex-start">
                  <Box>
                    <Text fontSize="sm" fontWeight="800" color={isPaid ? "teal.700" : "blue.700"}>
                      {receipt.issuer || "RightTouch Technologies Private Limited"}
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      {isPaid
                        ? "Technician Financial Disbursement & Settlement Voucher"
                        : "Technician Payout Approval Advice (Pre-Disbursement)"}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="2xs" color="gray.500">
                      {isPaid ? "Date Disbursed:" : "Date Approved:"}
                    </Text>
                    <Text fontSize="xs" fontWeight="700">
                      {isPaid ? (actualPaidDate || "Recorded in bank ledger") : (approvedDate || "Pending execution")}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Beneficiary & Transaction Info */}
              <Box p={3} bg={isDark ? "gray.800" : "gray.50"} borderRadius="12px" fontSize="xs">
                <HStack justify="space-between" mb={1.5}>
                  <Text color="gray.500">Technician Beneficiary:</Text>
                  <Text fontWeight="700">{tech.name || "N/A"} ({tech.mobileNumber || "N/A"})</Text>
                </HStack>
                <HStack justify="space-between" mb={1.5}>
                  <Text color="gray.500">Payment Channel / Mode:</Text>
                  <Badge colorScheme={isPaid ? "blue" : "gray"} fontSize="3xs">
                    {confirmedMode}
                  </Badge>
                </HStack>
                <HStack justify="space-between" mb={1.5}>
                  <Text color="gray.500">Destination Account:</Text>
                  <Text fontFamily="mono" fontWeight="600">{receipt.payoutDestination || "Masked Bank Account"}</Text>
                </HStack>
                {receipt.utr ? (
                  <HStack justify="space-between" pt={1} borderTop="1px dashed" borderColor="gray.300">
                    <Text color="green.700" fontWeight="700">Bank UTR / Transaction Ref:</Text>
                    <Text fontFamily="mono" fontWeight="800" color="green.700">{receipt.utr}</Text>
                  </HStack>
                ) : isApproved ? (
                  <HStack justify="space-between" pt={1} borderTop="1px dashed" borderColor="gray.300">
                    <Text color="blue.600" fontWeight="600">Disbursement Status:</Text>
                    <Text fontSize="2xs" color="blue.600" fontWeight="700">Awaiting Manual Bank Transfer & UTR Entry</Text>
                  </HStack>
                ) : null}
              </Box>

              {/* Financial Deductions & Net Breakdown */}
              <FinancialBreakdown financials={fin} isDark={isDark} />

              {/* Legal / Audit Disclaimer */}
              {isPaid ? (
                <Box p={2.5} bg="green.50" borderRadius="8px" fontSize="3xs" color="green.800">
                  <Text fontWeight="700">Official Disbursement Confirmation:</Text>
                  <Text>
                    This document serves as an electronic payment voucher confirming funds transferred via banking channels. Discrepancies must be raised with RightTouch Finance within 7 business days.
                  </Text>
                </Box>
              ) : (
                <Box p={2.5} bg="blue.50" borderRadius="8px" fontSize="3xs" color="blue.800">
                  <Text fontWeight="700">Pre-Transfer Approval Advice:</Text>
                  <Text>
                    This voucher reflects authorized withdrawal approval. Funds have NOT been disbursed yet. An official disbursement receipt will be generated upon executing the bank transfer and recording the UTR.
                  </Text>
                </Box>
              )}
            </VStack>
          ) : null}
        </ModalBody>

        <ModalFooter bg="gray.50" py={3} px={6} borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={3} justify="space-between" w="full">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FaPrint />}
              onClick={handlePrint}
              isDisabled={!isReceiptEligible || !receipt}
            >
              {isPaid ? "Print Receipt" : "Print Approval Summary"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
