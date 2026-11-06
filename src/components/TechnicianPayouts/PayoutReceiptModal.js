import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AppModal from "components/common/AppModal";
import {
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Spinner,
  Center,
  Icon,
  Divider,
  SimpleGrid,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaFileInvoiceDollar,
  FaPrint,
  FaCheckCircle,
} from "react-icons/fa";
import { getWithdrawalReceipt } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";

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

  // Paid timestamp must come strictly from authoritative records - NEVER fabricate today's date
  const actualPaidDate =
    timestamps.paidAt || receipt?.paidAt
      ? new Date(timestamps.paidAt || receipt?.paidAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const approvedDate =
    timestamps.approvedAt || receipt?.approvedAt
      ? new Date(timestamps.approvedAt || receipt?.approvedAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const requestedPaise =
    fin?.requestedAmountPaise ??
    (receipt?.amount ? Math.round(receipt.amount * 100) : 0);
  const netPaise = fin?.netPayoutAmountPaise ?? requestedPaise;
  const penaltyPaise = fin?.penaltyDeductionPaise || 0;
  const commissionPaise = fin?.commissionDeductionPaise || 0;
  const otherPaise = fin?.otherDeductionsPaise || 0;

  const techName = tech.name || tech.fname || receipt?.technicianName || "Technician";
  const bank = receipt?.bankDetails || tech.bankDetails || {};
  const rawAcc = String(bank.accountNumber || receipt?.payoutDestination || "").replace(/\s/g, "");
  const maskedAcc = rawAcc.length >= 4 ? `••••${rawAcc.slice(-4)}` : rawAcc || "—";

  const utr = receipt?.utr || receipt?.bankTransferDetails?.utr || receipt?.payoutReference || "";
  const payoutMode = receipt?.payoutMode || receipt?.paymentMode || "Bank Transfer";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      maxW={{ base: "96vw", md: "960px", lg: "1050px", xl: "1120px" }}
      bodyMaxH="80vh"
      isCentered
      headerBg={isPaid ? "teal.800" : isApproved ? "blue.800" : "gray.800"}
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="10px"
              bg={isPaid ? "teal.700" : "blue.700"}
              color="white"
              align="center"
              justify="center"
            >
              <Icon as={FaFileInvoiceDollar} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                {isPaid ? "Official Payout Disbursement Receipt" : "Payout Approval Summary"}
              </Text>
              <Text fontSize="xs" color="teal.200" fontFamily="mono">
                Voucher #{receipt?.receiptNumber || receipt?.receiptId || withdrawalId}
              </Text>
            </Box>
          </HStack>
          <Badge
            colorScheme={isPaid ? "green" : isApproved ? "blue" : "gray"}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="800"
          >
            {isPaid ? "DISBURSED & SETTLED" : isApproved ? "APPROVED FOR TRANSFER" : "PENDING"}
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            Immutable settlement audit record • RightTouch Automated Ledger
          </Text>
          <HStack spacing={3}>
            <Button
              size="md"
              variant="outline"
              leftIcon={<FaPrint />}
              onClick={handlePrint}
              isDisabled={loading || !receipt}
            >
              Print Receipt
            </Button>
            <Button size="md" colorScheme="teal" bg="teal.600" onClick={onClose}>
              Close
            </Button>
          </HStack>
        </HStack>
      }
    >
      {loading ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Spinner size="lg" color="teal.500" thickness="3px" />
            <Text fontSize="sm" color="gray.500">Generating official payout voucher...</Text>
          </VStack>
        </Center>
      ) : errorMsg ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Text fontSize="sm" color="red.500" fontWeight="700">{errorMsg}</Text>
            <Button size="xs" onClick={() => fetchReceipt(withdrawalId)}>Retry</Button>
          </VStack>
        </Center>
      ) : receipt ? (
        <VStack spacing={5} align="stretch" py={2} id="payout-receipt-content">
          {/* Receipt Top Banner */}
          <Box
            p={5}
            borderRadius="16px"
            bg={isDark ? "gray.800" : "white"}
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            boxShadow="sm"
          >
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4} mb={4}>
              <Box>
                <HStack spacing={2} align="center">
                  <Text fontSize="md" fontWeight="900" color="teal.700" letterSpacing="0.5px">
                    RIGHTTOUCH
                  </Text>
                  <Badge colorScheme="teal" fontSize="3xs" px={2} borderRadius="full">
                    DISBURSEMENT DESK
                  </Badge>
                </HStack>
                <Text fontSize="2xs" color="gray.500" mt={0.5}>
                  Partner Compensation & Settlement Voucher
                </Text>
              </Box>

              <Box textAlign={{ base: "left", sm: "right" }}>
                <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                  Settlement Date
                </Text>
                <Text fontSize="xs" fontWeight="800">
                  {actualPaidDate || approvedDate || "Pending Offline Execution"}
                </Text>
              </Box>
            </Flex>

            <Divider mb={4} />

            {/* 2-Column Payee & Banking Info */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Payee Details */}
              <Box>
                <Text fontSize="2xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.500" mb={2}>
                  Technician / Payee Details
                </Text>
                <VStack align="stretch" spacing={1.5} fontSize="xs">
                  <HStack justify="space-between">
                    <Text color="gray.500">Name:</Text>
                    <Text fontWeight="800">{techName}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Mobile:</Text>
                    <Text fontWeight="700">{tech.mobileNumber || tech.phone || "—"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Technician ID:</Text>
                    <Text fontWeight="700" fontFamily="mono">{tech.id || tech._id || "—"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Destination:</Text>
                    <Text fontWeight="700" fontFamily="mono">{maskedAcc}</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Bank & Audit Details */}
              <Box>
                <Text fontSize="2xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.500" mb={2}>
                  Disbursement & Banking Audit
                </Text>
                <VStack align="stretch" spacing={1.5} fontSize="xs">
                  <HStack justify="space-between">
                    <Text color="gray.500">Bank Name:</Text>
                    <Text fontWeight="800">{bank.bankName || "NEFT Transfer"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">IFSC Code:</Text>
                    <Text fontWeight="700" fontFamily="mono">{bank.ifscCode || "—"}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Payment Channel:</Text>
                    <Badge colorScheme="blue" fontSize="3xs">{payoutMode}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Bank UTR / Ref:</Text>
                    <Text fontWeight="800" fontFamily="mono" color="teal.600">
                      {utr || "Pending Disbursal"}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Itemized Financial Ledger */}
          <Box
            borderRadius="16px"
            bg={isDark ? "gray.800" : "white"}
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            overflow="hidden"
          >
            <Box px={5} py={3} bg={isDark ? "gray.750" : "gray.50"} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.600">
                Itemized Settlement Statement
              </Text>
            </Box>

            <VStack spacing={0} align="stretch" divider={<Divider />} fontSize="xs">
              <HStack justify="space-between" px={5} py={3}>
                <Box>
                  <Text fontWeight="700">Gross Withdrawal Request</Text>
                  <Text fontSize="3xs" color="gray.500">Earned balance reserved at request submission</Text>
                </Box>
                <Text fontWeight="800">{formatInr(requestedPaise)}</Text>
              </HStack>

              {penaltyPaise > 0 && (
                <HStack justify="space-between" px={5} py={3} bg="red.50" color="red.800">
                  <Box>
                    <Text fontWeight="700">Penalty Deduction</Text>
                    <Text fontSize="3xs" color="red.600">{fin.penaltyReason || "Platform performance deduction"}</Text>
                  </Box>
                  <Text fontWeight="800">-{formatInr(penaltyPaise)}</Text>
                </HStack>
              )}

              {commissionPaise > 0 && (
                <HStack justify="space-between" px={5} py={3}>
                  <Box>
                    <Text fontWeight="700">Platform Commission Retained</Text>
                    <Text fontSize="3xs" color="gray.500">Service charge deduction</Text>
                  </Box>
                  <Text fontWeight="800">-{formatInr(commissionPaise)}</Text>
                </HStack>
              )}

              {otherPaise > 0 && (
                <HStack justify="space-between" px={5} py={3}>
                  <Box>
                    <Text fontWeight="700">Other Adjustments</Text>
                  </Box>
                  <Text fontWeight="800">-{formatInr(otherPaise)}</Text>
                </HStack>
              )}

              {/* Net Disbursed Total */}
              <HStack justify="space-between" px={5} py={4} bg="teal.50" color="teal.900">
                <Box>
                  <Text fontSize="sm" fontWeight="900" textTransform="uppercase" letterSpacing="0.5px">
                    Net Disbursed Amount
                  </Text>
                  <Text fontSize="3xs" color="teal.700">
                    Transferred directly to technician's verified beneficiary account
                  </Text>
                </Box>
                <Text fontSize="2xl" fontWeight="900" color="teal.700">
                  {formatInr(netPaise)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Electronic Verification Watermark */}
          <Box
            p={3.5}
            borderRadius="12px"
            bg={isDark ? "gray.850" : "gray.50"}
            border="1px dashed"
            borderColor={isDark ? "gray.700" : "gray.300"}
            textAlign="center"
          >
            <HStack justify="center" spacing={2} mb={1}>
              <Icon as={FaCheckCircle} color="teal.500" boxSize={3.5} />
              <Text fontSize="2xs" fontWeight="800" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                System Verified & Recorded
              </Text>
            </HStack>
            <Text fontSize="3xs" color="gray.500">
              This document is generated by RightTouch Finance Portal. Cryptographic hash recorded on internal audit ledger.
            </Text>
          </Box>
        </VStack>
      ) : null}
    </AppModal>
  );
}

PayoutReceiptModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  withdrawalId: PropTypes.string,
};
