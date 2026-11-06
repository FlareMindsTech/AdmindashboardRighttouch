import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button,
  Flex,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Spinner,
  Center,
  Icon,
  Avatar,
  SimpleGrid,
  IconButton,
  Tooltip,
  useColorMode,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import {
  FaWallet,
  FaUniversity,
  FaShieldAlt,
  FaCoins,
  FaCopy,
  FaSnowflake,
  FaCheckCircle,
  FaMobileAlt,
  FaEnvelope,
  FaReceipt,
  FaHistory,
} from "react-icons/fa";
import { getTechnicianWalletOverview } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";
import PayoutStatusBadge from "./PayoutStatusBadge";
import { useAppToast } from "components/feedback";

/**
 * TechnicianProfileDrawer
 * Comprehensive 360° Profile & Wallet Liquidity Console for Admin / Owner
 * Displays verified KYC bank destination, live balances in escrow, freeze status,
 * and direct settlement actions.
 */
export default function TechnicianProfileDrawer({
  isOpen,
  onClose,
  technicianId,
  onOpenSendMoney,
  onOpenFreeze,
  onViewReceipt,
  onViewWithdrawalDetails,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useAppToast();

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOverview = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await getTechnicianWalletOverview(id);
      if (error) {
        setErrorMsg(error);
      } else {
        setOverview(data?.result || data);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load technician wallet profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && technicianId) {
      fetchOverview(technicianId);
    } else {
      setOverview(null);
      setErrorMsg("");
    }
  }, [isOpen, technicianId, fetchOverview]);

  const copyToClipboard = (text, label = "Details") => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const wallet = overview?.wallet || {};
  const eligibility = overview?.eligibility || {};
  const tech = overview?.technician || {};
  const user = tech?.user || {};
  const bank = eligibility?.bankDetails || overview?.bankDetails || {};
  const recentWds = overview?.recentWithdrawals || [];

  const techName =
    tech?.name ||
    (user.fname ? `${user.fname} ${user.lname || ""}`.trim() : "") ||
    "Technician";
  const techMobile = user.mobileNumber || tech?.mobileNumber || "N/A";
  const techEmail = user.email || tech?.email || "N/A";
  const isPayoutFrozen = Boolean(eligibility.payoutBlocked || tech?.payoutBlocked);

  // Balances
  const availablePaise = wallet.availableBalancePaise ?? (wallet.availableBalance ? wallet.availableBalance * 100 : 0);
  const reservedPaise = wallet.reservedBalancePaise ?? (wallet.reservedBalance ? wallet.reservedBalance * 100 : 0);
  const maintenancePaise = eligibility.minimumMaintenancePaise ?? 10000; // ₹100 default
  const availableToWithdrawPaise = Math.max(0, availablePaise - maintenancePaise);
  const totalEarnedPaise = wallet.totalEarnedPaise ?? (wallet.totalEarned ? wallet.totalEarned * 100 : 0);
  const totalWithdrawnPaise = wallet.totalWithdrawnPaise ?? (wallet.totalWithdrawn ? wallet.totalWithdrawn * 100 : 0);

  // Bank Info
  const rawAcc = String(bank.accountNumber || "").replace(/\s/g, "");
  const maskedAcc = rawAcc ? `****${rawAcc.slice(-4)}` : "Not provided";
  const bankName = bank.bankName || "Bank Account";
  const ifsc = bank.ifscCode || "";
  const upiId = bank.upiId || "";

  return (
    <Drawer isOpen={isOpen} placement="right" size="xl" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent
        minW={{ base: "100%", md: "740px", lg: "880px" }}
        maxW={{ base: "100%", md: "900px" }}
        bg={isDark ? "gray.900" : "white"}
        color={isDark ? "gray.100" : "gray.800"}
      >
        {/* Header */}
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.850" : "gray.50"}
          py={4}
          px={6}
        >
          <HStack justify="space-between" align="center" pr={8}>
            <HStack spacing={3}>
              <Avatar size="md" name={techName} bg="teal.600" color="white" fontWeight="700" />
              <Box>
                <HStack spacing={2} align="center">
                  <Text fontSize="md" fontWeight="800">
                    {techName}
                  </Text>
                  {isPayoutFrozen ? (
                    <Badge colorScheme="red" variant="solid" fontSize="2xs" px={2} borderRadius="full">
                      <HStack spacing={1}>
                        <Icon as={FaSnowflake} />
                        <Text>FROZEN</Text>
                      </HStack>
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={2} borderRadius="full">
                      ACTIVE
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={2} fontSize="2xs" color="gray.500" mt={0.5}>
                  <HStack spacing={1}>
                    <Icon as={FaMobileAlt} />
                    <Text>{techMobile}</Text>
                  </HStack>
                  <Text>&bull;</Text>
                  <HStack spacing={1}>
                    <Icon as={FaEnvelope} />
                    <Text>{techEmail}</Text>
                  </HStack>
                </HStack>
              </Box>
            </HStack>
          </HStack>
        </DrawerHeader>
        <DrawerCloseButton top={4} right={4} />

        <DrawerBody p={6}>
          {loading ? (
            <Center py={20}>
              <VStack spacing={3}>
                <Spinner size="lg" color="teal.500" thickness="3px" />
                <Text fontSize="xs" color="gray.500">
                  Loading technician liquidity and verification profile...
                </Text>
              </VStack>
            </Center>
          ) : errorMsg ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Alert status="error" borderRadius="12px" fontSize="xs">
                  <AlertIcon />
                  <Text>{errorMsg}</Text>
                </Alert>
                <Button size="xs" onClick={() => fetchOverview(technicianId)}>
                  Retry
                </Button>
              </VStack>
            </Center>
          ) : overview ? (
            <VStack spacing={5} align="stretch">
              {/* Freeze Banner if Frozen */}
              {isPayoutFrozen && (
                <Alert status="error" borderRadius="12px" py={2.5}>
                  <AlertIcon />
                  <Box fontSize="xs">
                    <Text fontWeight="700">Payouts Currently Frozen</Text>
                    <Text color="gray.600">
                      Reason: {eligibility.freezeReason || "Administrative hold placed on payouts."}
                    </Text>
                  </Box>
                </Alert>
              )}

              {/* 1. LIQUIDITY & ESCROW AUDIT */}
              <Box>
                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.500" mb={3}>
                  Wallet Liquidity & Escrow Breakdown
                </Text>
                <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                  {/* Available Balance */}
                  <Box
                    p={3.5}
                    borderRadius="14px"
                    bg={isDark ? "gray.800" : "teal.50"}
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "teal.200"}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="3xs" fontWeight="700" textTransform="uppercase" color="teal.700">
                        Available Balance
                      </Text>
                      <Icon as={FaWallet} color="teal.600" boxSize={3} />
                    </HStack>
                    <Text fontSize="md" fontWeight="800" color="teal.700">
                      {formatInr(availablePaise)}
                    </Text>
                    <Text fontSize="3xs" color="gray.500" mt={0.5}>
                      Current unreserved funds
                    </Text>
                  </Box>

                  {/* Reserved Balance in Escrow */}
                  <Box
                    p={3.5}
                    borderRadius="14px"
                    bg={isDark ? "gray.800" : "orange.50"}
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "orange.200"}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="3xs" fontWeight="700" textTransform="uppercase" color="orange.700">
                        In-Flight Escrow
                      </Text>
                      <Icon as={FaShieldAlt} color="orange.600" boxSize={3} />
                    </HStack>
                    <Text fontSize="md" fontWeight="800" color="orange.700">
                      {formatInr(reservedPaise)}
                    </Text>
                    <Text fontSize="3xs" color="gray.500" mt={0.5}>
                      Locked for pending payouts
                    </Text>
                  </Box>

                  {/* Available to Withdraw */}
                  <Box
                    p={3.5}
                    borderRadius="14px"
                    bg={isDark ? "gray.800" : "green.50"}
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "green.200"}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="3xs" fontWeight="700" textTransform="uppercase" color="green.700">
                        Withdrawable Net
                      </Text>
                      <Icon as={FaCoins} color="green.600" boxSize={3} />
                    </HStack>
                    <Text fontSize="md" fontWeight="800" color="green.700">
                      {formatInr(availableToWithdrawPaise)}
                    </Text>
                    <Text fontSize="3xs" color="gray.500" mt={0.5}>
                      Floor: {formatInr(maintenancePaise)}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Secondary Earnings Stats */}
                <HStack
                  spacing={4}
                  mt={2.5}
                  p={2.5}
                  borderRadius="10px"
                  bg={isDark ? "gray.800" : "gray.50"}
                  fontSize="2xs"
                  justify="space-around"
                >
                  <Text color="gray.500">
                    Lifetime Earned: <strong style={{ color: isDark ? "#E2E8F0" : "#2D3748" }}>{formatInr(totalEarnedPaise)}</strong>
                  </Text>
                  <Text color="gray.500">
                    Total Disbursed: <strong style={{ color: isDark ? "#E2E8F0" : "#2D3748" }}>{formatInr(totalWithdrawnPaise)}</strong>
                  </Text>
                </HStack>
              </Box>

              {/* 2. VERIFIED BANK DESTINATION */}
              <Box
                p={4}
                borderRadius="14px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaUniversity} color="blue.500" />
                    <Text fontSize="xs" fontWeight="800">
                      Verified Bank Destination
                    </Text>
                  </HStack>
                  <Badge colorScheme={eligibility.kycVerified !== false ? "green" : "orange"} fontSize="3xs" px={2} borderRadius="full">
                    {eligibility.kycVerified !== false ? "KYC VERIFIED" : "VERIFICATION PENDING"}
                  </Badge>
                </Flex>

                <VStack spacing={2} align="stretch" fontSize="xs">
                  <HStack justify="space-between">
                    <Text color="gray.500">Bank Name:</Text>
                    <Text fontWeight="700">{bankName}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Account Holder:</Text>
                    <Text fontWeight="600">{bank.accountHolderName || techName}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Account Number:</Text>
                    <HStack spacing={1.5}>
                      <Text fontWeight="700" fontFamily="mono">
                        {maskedAcc}
                      </Text>
                      {rawAcc && (
                        <Tooltip label="Copy Account Number" hasArrow>
                          <IconButton
                            size="2xs"
                            icon={<FaCopy />}
                            variant="ghost"
                            onClick={() => copyToClipboard(rawAcc, "Account Number")}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </HStack>
                  {ifsc && (
                    <HStack justify="space-between">
                      <Text color="gray.500">IFSC Code:</Text>
                      <HStack spacing={1.5}>
                        <Text fontWeight="700" fontFamily="mono">
                          {ifsc}
                        </Text>
                        <Tooltip label="Copy IFSC Code" hasArrow>
                          <IconButton
                            size="2xs"
                            icon={<FaCopy />}
                            variant="ghost"
                            onClick={() => copyToClipboard(ifsc, "IFSC Code")}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  )}
                  {upiId && (
                    <HStack justify="space-between">
                      <Text color="gray.500">UPI ID:</Text>
                      <HStack spacing={1.5}>
                        <Text fontWeight="700" fontFamily="mono" color="purple.600">
                          {upiId}
                        </Text>
                        <Tooltip label="Copy UPI ID" hasArrow>
                          <IconButton
                            size="2xs"
                            icon={<FaCopy />}
                            variant="ghost"
                            onClick={() => copyToClipboard(upiId, "UPI ID")}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* 3. RECENT WITHDRAWALS */}
              <Box>
                <HStack justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FaHistory} color="teal.500" />
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.500">
                      Recent Withdrawals & Disbursements
                    </Text>
                  </HStack>
                  <Badge fontSize="3xs" colorScheme="teal" borderRadius="full">
                    {recentWds.length} records
                  </Badge>
                </HStack>

                {recentWds.length === 0 ? (
                  <Box
                    p={4}
                    borderRadius="12px"
                    bg={isDark ? "gray.800" : "gray.50"}
                    textAlign="center"
                    fontSize="xs"
                    color="gray.500"
                  >
                    No past payout history found for this technician.
                  </Box>
                ) : (
                  <Box
                    borderRadius="12px"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    overflow="hidden"
                  >
                    <Table size="sm" variant="simple">
                      <Thead bg={isDark ? "gray.800" : "gray.100"}>
                        <Tr>
                          <Th fontSize="3xs">Date</Th>
                          <Th fontSize="3xs">Amount</Th>
                          <Th fontSize="3xs">Status</Th>
                          <Th fontSize="3xs">UTR</Th>
                          <Th fontSize="3xs" textAlign="right">Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentWds.map((w, idx) => {
                          const wId = w._id || w.withdrawalId;
                          const amount = w.netPayoutAmountPaise ?? (w.amount ? w.amount * 100 : 0);
                          const date = w.createdAt ? new Date(w.createdAt).toLocaleDateString("en-IN") : "";
                          return (
                            <Tr key={wId || idx} _hover={{ bg: isDark ? "gray.800" : "gray.50" }}>
                              <Td fontSize="2xs" color="gray.500">{date}</Td>
                              <Td fontSize="2xs" fontWeight="700">{formatInr(amount)}</Td>
                              <Td>
                                <PayoutStatusBadge status={w.status} size="sm" />
                              </Td>
                              <Td fontSize="3xs" fontFamily="mono">{w.utr ? `${w.utr.slice(0, 8)}...` : "-"}</Td>
                              <Td textAlign="right">
                                <HStack spacing={1} justify="flex-end">
                                  {w.status === "paid" && (
                                    <Tooltip label="View Official Receipt" hasArrow>
                                      <IconButton
                                        size="2xs"
                                        icon={<FaReceipt color="#008080" />}
                                        variant="ghost"
                                        onClick={() => {
                                          onClose();
                                          onViewReceipt && onViewReceipt(wId);
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  <Button
                                    size="2xs"
                                    variant="link"
                                    colorScheme="teal"
                                    onClick={() => {
                                      onClose();
                                      onViewWithdrawalDetails && onViewWithdrawalDetails(wId);
                                    }}
                                  >
                                    Details
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
              </Box>
            </VStack>
          ) : null}
        </DrawerBody>

        {/* Footer Actions */}
        <DrawerFooter
          borderTopWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.850" : "gray.50"}
          p={4}
        >
          <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
            {/* Freeze / Unfreeze Action */}
            <Button
              size="sm"
              variant="outline"
              colorScheme={isPayoutFrozen ? "green" : "red"}
              leftIcon={<Icon as={isPayoutFrozen ? FaCheckCircle : FaSnowflake} />}
              onClick={() => {
                onClose();
                onOpenFreeze && onOpenFreeze(tech || { _id: technicianId, name: techName, payoutBlocked: isPayoutFrozen });
              }}
            >
              {isPayoutFrozen ? "Unfreeze Payouts" : "Freeze Payouts"}
            </Button>

            <HStack spacing={2}>
              {/* Send Direct Payout */}
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close Drawer
              </Button>
            </HStack>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

TechnicianProfileDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  technicianId: PropTypes.string,
  onOpenSendMoney: PropTypes.func,
  onOpenFreeze: PropTypes.func,
  onViewReceipt: PropTypes.func,
  onViewWithdrawalDetails: PropTypes.func,
};
