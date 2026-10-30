import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Select,
  SimpleGrid,
  Spinner,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaWallet,
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCoins,
  FaPaperPlane,
} from "react-icons/fa";
import { getTechnicianWalletOverview } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";
import PayoutStatusBadge from "./PayoutStatusBadge";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";


export default function TechnicianWalletDetailsCard({
  technicians = [],
  selectedTechId = "",
  onSelectTechnician,
  onOpenSendMoney,
  onOpenFreeze,
  onFilterTableByTech,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [techId, setTechId] = useState(selectedTechId || "");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (selectedTechId) {
      setTechId(selectedTechId);
    }
  }, [selectedTechId]);

  useEffect(() => {
    if (techId) {
      fetchOverview(techId);
    } else {
      setOverview(null);
      setErrorMsg("");
    }
  }, [techId]);

  const fetchOverview = async (id) => {
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
      setErrorMsg(err.message || "Failed to load technician wallet overview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setTechId(val);
    onSelectTechnician && onSelectTechnician(val);
  };

  const cardStyle = {
    bg: isDark ? "gray.850" : "white",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: isDark ? "gray.750" : "gray.100",
    boxShadow: isDark
      ? "0 8px 30px -4px rgba(0, 0, 0, 0.5)"
      : "0 4px 24px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02)",
    overflow: "hidden",
  };

  const wallet = overview?.wallet || {};
  const eligibility = overview?.eligibility || {};
  const user = overview?.technician?.user || {};
  const activeWd = overview?.activeWithdrawal;
  const recentWds = overview?.recentWithdrawals || [];
  const recentTxs = overview?.recentTransactions || [];

  return (
    <Card {...cardStyle} mb="24px">
      <CardBody p={{ base: "16px", md: "24px" }}>
        <VStack spacing={5} align="stretch">
          {/* Header & Technician Selector */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={3}
          >
            <HStack spacing={3}>
              <Flex
                w="42px"
                h="42px"
                borderRadius="12px"
                bg="teal.600"
                color="white"
                align="center"
                justify="center"
              >
                <Icon as={FaWallet} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="800" color={isDark ? "white" : "gray.800"}>
                  Technician Wallet Console & Liquidity Audit
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  Inspect available funds, active payout holds, retention reserve floor, and KYC eligibility.
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2} w={{ base: "full", md: "auto" }}>
              <Select
                size="sm"
                borderRadius="8px"
                placeholder="Select technician to inspect..."
                value={techId}
                onChange={handleSelectChange}
                maxW={{ base: "full", md: "320px" }}
                fontWeight="600"
              >
                {technicians.map((t) => {
                  const id = t._id || t.id || t.technicianId;
                  const name =
                    t.name ||
                    (t.userId?.fname ? `${t.userId.fname} ${t.userId.lname || ""}`.trim() : "") ||
                    t.fname ||
                    "Technician";
                  const phone = t.userId?.mobileNumber || t.mobileNumber || "";
                  return (
                    <option key={id} value={id}>
                      {name} {phone ? `(${phone})` : ""}
                    </option>
                  );
                })}
              </Select>

              {techId && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setTechId("");
                    setOverview(null);
                    onSelectTechnician && onSelectTechnician("");
                  }}
                >
                  Clear
                </Button>
              )}
            </HStack>
          </Flex>

          {loading && (
            <Flex py={8} justify="center" align="center">
              <HStack spacing={3}>
                <Spinner size="md" color="teal.500" />
                <Text fontSize="xs" color="gray.500">
                  Loading authoritative wallet ledger from backend...
                </Text>
              </HStack>
            </Flex>
          )}

          {errorMsg && (
            <Alert status="error" borderRadius="12px" fontSize="xs">
              <AlertIcon />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {!loading && overview && (
            <VStack spacing={5} align="stretch">
              {/* Technician Profile & Verification Banner */}
              <Flex
                p={3.5}
                borderRadius="14px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={3}
              >
                <HStack spacing={3}>
                  <Box>
                    <HStack spacing={2} align="center">
                      <Text fontSize="sm" fontWeight="700">
                        {user.fname} {user.lname || ""}
                      </Text>
                      <Badge colorScheme={overview.technician?.status === "active" ? "green" : "gray"} fontSize="3xs">
                        {overview.technician?.status?.toUpperCase() || "ACTIVE"}
                      </Badge>
                      {eligibility.payoutBlocked && (
                        <Badge colorScheme="red" fontSize="3xs">
                          PAYOUTS FROZEN
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={3} fontSize="2xs" color="gray.500" mt={0.5}>
                      <Text>Phone: {user.mobileNumber || "N/A"}</Text>
                      <Text>•</Text>
                      <Text>Email: {user.email || "N/A"}</Text>
                      <Text>•</Text>
                      <Text fontFamily="mono">Tech ID: #{overview.technician?._id}</Text>
                    </HStack>
                  </Box>
                </HStack>

                <HStack spacing={2} flexWrap="wrap">
                  <Badge
                    colorScheme={eligibility.bankVerified ? "green" : "orange"}
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    fontSize="2xs"
                  >
                    <HStack spacing={1}>
                      <Icon as={eligibility.bankVerified ? FaCheckCircle : FaExclamationTriangle} />
                      <Text as="span">{eligibility.bankVerified ? "KYC Bank Verified" : "KYC Pending"}</Text>
                    </HStack>
                  </Badge>

                  {/* Actions for this technician */}
                  <Button
                    size="xs"
                    colorScheme="teal"
                    leftIcon={<FaPaperPlane />}
                    onClick={() => onOpenSendMoney && onOpenSendMoney(overview.technician)}
                  >
                    Send Money
                  </Button>

                  <Button
                    size="xs"
                    colorScheme={eligibility.payoutBlocked ? "green" : "red"}
                    variant="outline"
                    onClick={() => onOpenFreeze && onOpenFreeze(overview.technician)}
                  >
                    {eligibility.payoutBlocked ? "Unfreeze Payouts" : "Freeze Payouts"}
                  </Button>

                  {onFilterTableByTech && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => onFilterTableByTech(overview.technician?._id)}
                    >
                      Filter Table
                    </Button>
                  )}
                </HStack>
              </Flex>

              {/* Payout Freeze Warning if blocked */}
              {eligibility.payoutBlocked && (
                <Alert status="error" borderRadius="12px" fontSize="xs" py={2.5}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontWeight="700">Technician Payouts are Frozen</AlertTitle>
                    <AlertDescription>
                      Reason: {eligibility.payoutBlockedReason || "Locked by administrator"}. The technician cannot request withdrawals.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Active in-flight withdrawal alert */}
              {activeWd && (
                <Alert status="warning" borderRadius="12px" fontSize="xs" py={2.5}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontWeight="700">Active Withdrawal in Progress</AlertTitle>
                    <AlertDescription>
                      Withdrawal #{activeWd._id} ({activeWd.origin}) is currently in status <strong>{activeWd.status}</strong> for net {formatInr(activeWd.netPayoutAmountPaise)}. No new withdrawals can be submitted until this is resolved.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* ================= 4 DISTINCT BALANCES ================= */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3.5}>
                {/* 1. Available Spendable Balance */}
                <Box
                  p={3.5}
                  borderRadius="14px"
                  bg={isDark ? "teal.950" : "teal.50"}
                  border="1px solid"
                  borderColor={isDark ? "teal.800" : "teal.200"}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="2xs" fontWeight="700" color="teal.700" textTransform="uppercase">
                      Available Balance
                    </Text>
                    <Icon as={FaCoins} color="teal.500" boxSize={3.5} />
                  </HStack>
                  <Text fontSize="xl" fontWeight="800" color="teal.700">
                    {formatInr(wallet.availableBalancePaise)}
                  </Text>
                  <Text fontSize="3xs" color="teal.600" mt={1}>
                    Unencumbered funds ready for withdrawal or direct payout
                  </Text>
                </Box>

                {/* 2. Active Payout Reservation */}
                <Box
                  p={3.5}
                  borderRadius="14px"
                  bg={isDark ? "orange.950" : "orange.50"}
                  border="1px solid"
                  borderColor={isDark ? "orange.800" : "orange.200"}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="2xs" fontWeight="700" color="orange.700" textTransform="uppercase">
                      Active Payout Hold
                    </Text>
                    <Icon as={FaLock} color="orange.500" boxSize={3.5} />
                  </HStack>
                  <Text fontSize="xl" fontWeight="800" color="orange.700">
                    {formatInr(wallet.reservedBalancePaise)}
                  </Text>
                  <Text fontSize="3xs" color="orange.600" mt={1}>
                    Funds currently reserved for pending/approved withdrawals
                  </Text>
                </Box>

                {/* 3. Retention Reserve Floor */}
                <Box
                  p={3.5}
                  borderRadius="14px"
                  bg={isDark ? "purple.950" : "purple.50"}
                  border="1px solid"
                  borderColor={isDark ? "purple.800" : "purple.200"}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="2xs" fontWeight="700" color="purple.700" textTransform="uppercase">
                      Retention Floor
                    </Text>
                    <Icon as={FaShieldAlt} color="purple.500" boxSize={3.5} />
                  </HStack>
                  <Text fontSize="xl" fontWeight="800" color="purple.700">
                    {formatInr(wallet.reserveBalancePaise || overview.maintenanceFloorPaise)}
                  </Text>
                  <Text fontSize="3xs" color="purple.600" mt={1}>
                    Minimum safety retention reserve / maintenance buffer
                  </Text>
                </Box>

                {/* 4. Outstanding Dues */}
                <Box
                  p={3.5}
                  borderRadius="14px"
                  bg={isDark ? "red.950" : "red.50"}
                  border="1px solid"
                  borderColor={isDark ? "red.800" : "red.200"}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="2xs" fontWeight="700" color="red.700" textTransform="uppercase">
                      Outstanding Dues
                    </Text>
                    <Icon as={FaExclamationTriangle} color="red.500" boxSize={3.5} />
                  </HStack>
                  <Text fontSize="xl" fontWeight="800" color="red.700">
                    {formatInr(wallet.outstandingDuesPaise)}
                  </Text>
                  <Text fontSize="3xs" color="red.600" mt={1}>
                    Unrecovered platform deductions or penalty dues
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Cumulative Metrics & Liquidity Audit */}
              <Flex
                p={3}
                borderRadius="12px"
                bg={isDark ? "gray.800" : "gray.50"}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
                justify="space-around"
                align="center"
                fontSize="xs"
                flexWrap="wrap"
                gap={3}
              >
                <Box textAlign="center">
                  <Text color="gray.500" fontSize="3xs" textTransform="uppercase">Lifetime Earnings</Text>
                  <Text fontWeight="800" color={isDark ? "gray.200" : "gray.800"}>
                    {formatInr(wallet.lifetimeEarnedPaise)}
                  </Text>
                </Box>
                <Divider orientation="vertical" h="28px" />
                <Box textAlign="center">
                  <Text color="gray.500" fontSize="3xs" textTransform="uppercase">Lifetime Withdrawn</Text>
                  <Text fontWeight="800" color={isDark ? "gray.200" : "gray.800"}>
                    {formatInr(wallet.lifetimeWithdrawnPaise)}
                  </Text>
                </Box>
                <Divider orientation="vertical" h="28px" />
                <Box textAlign="center">
                  <Text color="gray.500" fontSize="3xs" textTransform="uppercase">Max Withdrawable Now</Text>
                  <Text fontWeight="800" color="teal.600">
                    {formatInr(overview.maxWithdrawablePaise)}
                  </Text>
                </Box>
                <Divider orientation="vertical" h="28px" />
                <Box textAlign="center">
                  <Text color="gray.500" fontSize="3xs" textTransform="uppercase">Ledger Version</Text>
                  <Text fontWeight="700" color="gray.500" fontFamily="mono">
                    v{wallet.walletVersion}
                  </Text>
                </Box>
              </Flex>

              {/* Recent Activity Mini-Tables */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {/* Recent Withdrawals */}
                <Box
                  p={3.5}
                  borderRadius="14px"
                  bg={isDark ? "gray.800" : "gray.50"}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                >
                  <Text fontSize="xs" fontWeight="700" mb={2}>
                    Recent Withdrawal History
                  </Text>
                  {recentWds.length === 0 ? (
                    <Text fontSize="2xs" color="gray.400">No withdrawal records for this technician.</Text>
                  ) : (
                    <VStack spacing={2} align="stretch" fontSize="xs">
                      {recentWds.slice(0, 5).map((w) => (
                        <Flex
                          key={w._id}
                          justify="space-between"
                          align="center"
                          p={2}
                          borderRadius="8px"
                          bg={isDark ? "gray.850" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                        >
                          <Box>
                            <HStack spacing={1.5}>
                              <Text fontWeight="700" fontFamily="mono" fontSize="2xs">
                                #{String(w._id).slice(-6)}
                              </Text>
                              <PayoutStatusBadge status={w.status} size="sm" showIcon={false} />
                            </HStack>
                            <Text fontSize="3xs" color="gray.400">
                              {w.createdAt ? new Date(w.createdAt).toLocaleDateString("en-IN") : ""} • {w.payoutMode || "NEFT"}
                            </Text>
                          </Box>
                          <Text fontWeight="800" color="teal.700" fontSize="xs">
                            {formatInr(w.netPayoutAmountPaise)}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Recent Ledger Transactions */}
                <Box
                  p={3.5}
                  borderRadius="14px"
                  bg={isDark ? "gray.800" : "gray.50"}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                >
                  <Text fontSize="xs" fontWeight="700" mb={2}>
                    Recent Wallet Transactions
                  </Text>
                  {recentTxs.length === 0 ? (
                    <Text fontSize="2xs" color="gray.400">No recent wallet transactions.</Text>
                  ) : (
                    <VStack spacing={2} align="stretch" fontSize="xs">
                      {recentTxs.slice(0, 5).map((tx) => (
                        <Flex
                          key={tx._id}
                          justify="space-between"
                          align="center"
                          p={2}
                          borderRadius="8px"
                          bg={isDark ? "gray.850" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                        >
                          <Box>
                            <HStack spacing={1.5}>
                              <Badge
                                colorScheme={tx.type === "credit" ? "green" : "red"}
                                fontSize="3xs"
                              >
                                {tx.type?.toUpperCase()}
                              </Badge>
                              <Text fontSize="2xs" fontWeight="600" textTransform="capitalize">
                                {tx.source || "Transaction"}
                              </Text>
                            </HStack>
                            <Text fontSize="3xs" color="gray.400">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN") : ""}
                            </Text>
                          </Box>
                          <Text
                            fontWeight="800"
                            color={tx.type === "credit" ? "green.600" : "red.600"}
                            fontSize="xs"
                          >
                            {tx.type === "credit" ? "+" : "-"}{formatInr(tx.amountPaise)}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>
              </SimpleGrid>
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
