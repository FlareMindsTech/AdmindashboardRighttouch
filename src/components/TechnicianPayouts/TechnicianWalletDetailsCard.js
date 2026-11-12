import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Spinner,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  IconButton,
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
  FaUniversity,
  FaCopy,
  FaCheck,
  FaQrcode,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAppSelector } from "store/hooks";
import { selectKYCRecords } from "store/slices/techniciansSlice";
import { useAppToast } from "components/feedback";
import { getTechnicianWalletOverview } from "api/wallet";
import { formatInr } from "./FinancialBreakdown";
import PayoutStatusBadge from "./PayoutStatusBadge";
import TechnicianSearchCombobox from "./TechnicianSearchCombobox";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";


export default function TechnicianWalletDetailsCard({
  technicians = [],
  selectedTechId = "",
  refreshKey = 0,
  onSelectTechnician,
  onOpenSendMoney,
  onOpenFreeze,
  onFilterTableByTech,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const toast = useAppToast();
  const reduxKYCRecords = useAppSelector(selectKYCRecords);

  const [techId, setTechId] = useState(selectedTechId || "");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [showFullAccount, setShowFullAccount] = useState(false);

  useEffect(() => {
    setShowFullAccount(false);
    setCopiedField("");
  }, [techId]);

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
  }, [techId, refreshKey]);

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

  const cardStyle = {
    bg: isDark ? "gray.850" : "white",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: isDark ? "gray.800" : "gray.100",
    boxShadow: isDark
      ? "0 8px 30px -4px rgba(0, 0, 0, 0.5)"
      : "0 4px 24px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02)",
    overflow: "hidden",
  };

  const wallet = overview?.wallet || {};
  const eligibility = overview?.eligibility || {};
  const user = useMemo(() => overview?.technician?.user || {}, [overview]);
  const activeWd = overview?.activeWithdrawal;
  const recentWds = overview?.recentWithdrawals || [];
  const recentTxs = overview?.recentTransactions || [];

  const kycRecordsList = useMemo(() => {
    if (Array.isArray(reduxKYCRecords)) return reduxKYCRecords;
    if (Array.isArray(reduxKYCRecords?.records)) return reduxKYCRecords.records;
    if (Array.isArray(reduxKYCRecords?.data)) return reduxKYCRecords.data;
    return [];
  }, [reduxKYCRecords]);

  const selectedTech = useMemo(() => {
    if (!techId) return null;
    return (
      technicians.find((t) => {
        const id = t._id || t.id || t.technicianId;
        return String(id) === String(techId);
      }) || null
    );
  }, [technicians, techId]);

  const kycMatch = useMemo(() => {
    if (!techId && !overview?.technician?._id) return null;
    const targetId = String(techId || overview?.technician?._id || "");
    const targetUserId = String(
      overview?.technician?.user?._id ||
      overview?.technician?.userId?._id ||
      overview?.technician?.userId ||
      selectedTech?.userId?._id ||
      selectedTech?.userId ||
      ""
    );
    return (
      kycRecordsList.find((k) => {
        const kTechId = String(k.technicianId?._id || k.technicianId || k.technician?._id || k.technician || "");
        const kUserId = String(k.userId?._id || k.userId || k.user?._id || k.user || "");
        const kRecordId = String(k._id || k.id || "");
        return (
          (targetId && (kTechId === targetId || kRecordId === targetId)) ||
          (targetUserId && kUserId === targetUserId)
        );
      }) || null
    );
  }, [kycRecordsList, techId, overview, selectedTech]);

  const bank = useMemo(() => {
    return (
      overview?.bankDetails ||
      overview?.eligibility?.bankDetails ||
      overview?.technician?.bankDetails ||
      overview?.technician?.profile?.bankDetails ||
      overview?.technician?.kyc?.bankDetails ||
      overview?.activeWithdrawal?.bankDetails ||
      kycMatch?.bankDetails ||
      kycMatch?.bank ||
      kycMatch?.banking ||
      selectedTech?.bankDetails ||
      selectedTech?.profile?.bankDetails ||
      selectedTech?.kyc?.bankDetails ||
      selectedTech?.bankAccount ||
      selectedTech?.bank ||
      {}
    );
  }, [overview, selectedTech, kycMatch]);

  const rawAcc = useMemo(() => {
    return String(
      bank.accountNumber ||
      bank.accountNo ||
      bank.bankAccountNumber ||
      bank.account_number ||
      bank.accNo ||
      overview?.activeWithdrawal?.payoutDestination ||
      overview?.activeWithdrawal?.destination ||
      selectedTech?.payoutDestination ||
      ""
    ).trim();
  }, [bank, overview, selectedTech]);

  const ifscCode = useMemo(() => {
    return String(bank.ifscCode || bank.ifsc || bank.ifsc_code || "").trim().toUpperCase();
  }, [bank]);

  const bankName = useMemo(() => {
    return String(bank.bankName || bank.bank || bank.bank_name || "").trim();
  }, [bank]);

  const accountHolderName = useMemo(() => {
    return String(
      bank.accountHolderName ||
      bank.accountName ||
      bank.beneficiaryName ||
      bank.accountHolder ||
      bank.holderName ||
      bank.name ||
      (user.fname ? `${user.fname} ${user.lname || ""}`.trim() : "") ||
      selectedTech?.name ||
      ""
    ).trim();
  }, [bank, user, selectedTech]);

  const branchName = useMemo(() => {
    return String(bank.branchName || bank.branch || bank.branch_name || "").trim();
  }, [bank]);

  const upiId = useMemo(() => {
    return String(bank.upiId || bank.upi || bank.vpa || bank.upi_id || "").trim();
  }, [bank]);

  const accountType = useMemo(() => {
    return String(bank.accountType || bank.type || "").trim();
  }, [bank]);

  const isBankKycVerified = Boolean(
    eligibility.bankVerified ||
    bank.bankVerified ||
    bank.verified ||
    kycMatch?.bankDetails?.verified ||
    kycMatch?.bankDetails?.verificationStatus === "verified"
  );

  const hasBankDetails = Boolean(rawAcc || ifscCode || upiId);

  const copyToClipboard = (text, fieldId, label) => {
    if (!text) return;
    const cleanText = String(text).trim();
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(cleanText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = cleanText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(""), 2000);
      toast({
        title: "Copied!",
        description: `${label || "Value"} copied: ${cleanText}`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please select and copy manually.",
        status: "warning",
        duration: 2000,
      });
    }
  };

  const handleCopyAllBankDetails = () => {
    const lines = [];
    if (accountHolderName) lines.push(`Beneficiary Name: ${accountHolderName}`);
    if (bankName) lines.push(`Bank Name: ${bankName}`);
    if (rawAcc) lines.push(`Account Number: ${rawAcc}`);
    if (ifscCode) lines.push(`IFSC Code: ${ifscCode}`);
    if (branchName) lines.push(`Branch: ${branchName}`);
    if (accountType) lines.push(`Account Type: ${accountType}`);
    if (upiId) lines.push(`UPI ID: ${upiId}`);

    if (lines.length === 0) {
      toast({
        title: "No Details Available",
        description: "No banking information available to copy.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const fullSummary = lines.join("\n");
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(fullSummary);
      } else {
        const ta = document.createElement("textarea");
        ta.value = fullSummary;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedField("all");
      setTimeout(() => setCopiedField(""), 2000);
      toast({
        title: "All Bank Details Copied!",
        description: "Complete beneficiary details copied to clipboard in standard transfer format.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually.",
        status: "warning",
        duration: 2000,
      });
    }
  };

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
              <TechnicianSearchCombobox
                technicians={technicians}
                selectedTechId={techId}
                onSelect={(id) => {
                  setTechId(id);
                  onSelectTechnician && onSelectTechnician(id);
                }}
                placeholder="Search technician by name or phone..."
                isDark={isDark}
                width={{ base: "full", md: "340px" }}
              />

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
                  {onOpenSendMoney && (
                    <Button
                      size="xs"
                      colorScheme="teal"
                      variant="solid"
                      leftIcon={<FaPaperPlane />}
                      isDisabled={eligibility.payoutBlocked}
                      onClick={() => onOpenSendMoney(overview.technician)}
                    >
                      Pay Directly
                    </Button>
                  )}

                  {onFilterTableByTech && (
                    <Button
                      size="xs"
                      colorScheme="teal"
                      variant="solid"
                      leftIcon={<FaCoins />}
                      onClick={() => onFilterTableByTech(overview.technician?._id)}
                    >
                      View Payout Requests
                    </Button>
                  )}

                  <Button
                    size="xs"
                    colorScheme={eligibility.payoutBlocked ? "green" : "red"}
                    variant="outline"
                    onClick={() => onOpenFreeze && onOpenFreeze(overview.technician)}
                  >
                    {eligibility.payoutBlocked ? "Unfreeze Payouts" : "Freeze Payouts"}
                  </Button>
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

              {/* ================= BENEFICIARY SETTLEMENT & BANKING DESTINATION ================= */}
              <Box
                p={4}
                borderRadius="16px"
                bg={isDark ? "gray.800" : "blue.50"}
                border="1.5px solid"
                borderColor={isDark ? "gray.700" : "blue.200"}
              >
                {/* Header with Title, Status & Primary "Copy All Bank Details" Button */}
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  gap={3}
                  mb={3.5}
                  pb={3}
                  borderBottom="1px solid"
                  borderColor={isDark ? "gray.700" : "blue.100"}
                >
                  <HStack spacing={2.5}>
                    <Flex
                      w="36px"
                      h="36px"
                      borderRadius="10px"
                      bg={isDark ? "blue.900" : "blue.100"}
                      color="blue.600"
                      align="center"
                      justify="center"
                    >
                      <Icon as={FaUniversity} boxSize={4} />
                    </Flex>
                    <Box>
                      <HStack spacing={2} align="center">
                        <Text
                          fontSize="xs"
                          fontWeight="800"
                          color={isDark ? "blue.200" : "blue.900"}
                          textTransform="uppercase"
                          letterSpacing="0.5px"
                        >
                          Settlement & Banking Details
                        </Text>
                        <Badge
                          colorScheme={isBankKycVerified ? "green" : hasBankDetails ? "orange" : "gray"}
                          fontSize="3xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                        >
                          {isBankKycVerified
                            ? "KYC Bank Verified"
                            : hasBankDetails
                            ? "Verification Pending"
                            : "No Bank Added"}
                        </Badge>
                      </HStack>
                      <Text fontSize="2xs" color="gray.500">
                        Official destination credentials for IMPS, NEFT, RTGS, and UPI technician payouts
                      </Text>
                    </Box>
                  </HStack>

                  {/* Copy All Details Button */}
                  {hasBankDetails && (
                    <Button
                      size="sm"
                      colorScheme={copiedField === "all" ? "green" : "blue"}
                      variant="solid"
                      leftIcon={<Icon as={copiedField === "all" ? FaCheck : FaCopy} />}
                      onClick={handleCopyAllBankDetails}
                      borderRadius="10px"
                      fontWeight="700"
                      fontSize="xs"
                      shadow="sm"
                      _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                      transition="all 0.15s ease"
                    >
                      {copiedField === "all" ? "All Details Copied!" : "Copy All Bank Details"}
                    </Button>
                  )}
                </Flex>

                {/* Content: When no details are configured */}
                {!hasBankDetails ? (
                  <Box
                    p={4}
                    borderRadius="12px"
                    bg={isDark ? "gray.900" : "white"}
                    border="1px dashed"
                    borderColor={isDark ? "gray.700" : "gray.300"}
                    textAlign="center"
                  >
                    <Icon as={FaExclamationTriangle} color="orange.400" boxSize={5} mb={1.5} />
                    <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.700"}>
                      No Banking Details Linked
                    </Text>
                    <Text fontSize="2xs" color="gray.500" mt={0.5}>
                      This technician has not added bank account details or UPI ID. Please check KYC verification or instruct the technician to submit valid banking credentials.
                    </Text>
                  </Box>
                ) : (
                  /* Responsive Grid with Individual 1-Click Copy Buttons */
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
                    {/* 1. Beneficiary / Account Holder Name */}
                    <Box
                      bg={isDark ? "gray.900" : "white"}
                      p={3}
                      borderRadius="10px"
                      border="1px solid"
                      borderColor={isDark ? "gray.700" : "blue.100"}
                      shadow="2xs"
                    >
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                          Beneficiary Name
                        </Text>
                        <Tooltip label={copiedField === "name" ? "Copied!" : "Copy Beneficiary Name"} hasArrow>
                          <IconButton
                            size="xs"
                            h="24px"
                            minW="24px"
                            icon={<Icon as={copiedField === "name" ? FaCheck : FaCopy} boxSize={3} />}
                            colorScheme={copiedField === "name" ? "green" : "blue"}
                            variant="ghost"
                            onClick={() => copyToClipboard(accountHolderName, "name", "Beneficiary Name")}
                            aria-label="Copy Beneficiary Name"
                          />
                        </Tooltip>
                      </Flex>
                      <Text fontWeight="800" fontSize="sm" color={isDark ? "white" : "gray.800"} isTruncated>
                        {accountHolderName || "—"}
                      </Text>
                    </Box>

                    {/* 2. Account Number */}
                    <Box
                      bg={isDark ? "gray.900" : "white"}
                      p={3}
                      borderRadius="10px"
                      border="1px solid"
                      borderColor={isDark ? "gray.700" : "blue.100"}
                      shadow="2xs"
                    >
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                          Account Number
                        </Text>
                        <HStack spacing={1}>
                          {rawAcc.length > 4 && (
                            <Tooltip label={showFullAccount ? "Mask Account" : "Reveal Account Number"} hasArrow>
                              <IconButton
                                size="xs"
                                h="24px"
                                minW="24px"
                                icon={<Icon as={showFullAccount ? FaEyeSlash : FaEye} boxSize={3} />}
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => setShowFullAccount(!showFullAccount)}
                                aria-label="Toggle Account Mask"
                              />
                            </Tooltip>
                          )}
                          <Tooltip label={copiedField === "account" ? "Copied!" : "Copy Account Number"} hasArrow>
                            <IconButton
                              size="xs"
                              h="24px"
                              minW="24px"
                              icon={<Icon as={copiedField === "account" ? FaCheck : FaCopy} boxSize={3} />}
                              colorScheme={copiedField === "account" ? "green" : "blue"}
                              variant="ghost"
                              onClick={() => copyToClipboard(rawAcc, "account", "Account Number")}
                              aria-label="Copy Account Number"
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                      <Text
                        fontWeight="800"
                        fontSize="sm"
                        fontFamily="monospace"
                        color={isDark ? "teal.200" : "blue.900"}
                        letterSpacing="0.5px"
                      >
                        {rawAcc
                          ? showFullAccount || rawAcc.length <= 4
                            ? rawAcc
                            : `••••••••${rawAcc.slice(-4)}`
                          : "—"}
                      </Text>
                    </Box>

                    {/* 3. IFSC Code */}
                    <Box
                      bg={isDark ? "gray.900" : "white"}
                      p={3}
                      borderRadius="10px"
                      border="1px solid"
                      borderColor={isDark ? "gray.700" : "blue.100"}
                      shadow="2xs"
                    >
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                          IFSC Code
                        </Text>
                        {ifscCode && (
                          <Tooltip label={copiedField === "ifsc" ? "Copied!" : "Copy IFSC Code"} hasArrow>
                            <IconButton
                              size="xs"
                              h="24px"
                              minW="24px"
                              icon={<Icon as={copiedField === "ifsc" ? FaCheck : FaCopy} boxSize={3} />}
                              colorScheme={copiedField === "ifsc" ? "green" : "blue"}
                              variant="ghost"
                              onClick={() => copyToClipboard(ifscCode, "ifsc", "IFSC Code")}
                              aria-label="Copy IFSC Code"
                            />
                          </Tooltip>
                        )}
                      </Flex>
                      <Text
                        fontWeight="800"
                        fontSize="sm"
                        fontFamily="monospace"
                        color={isDark ? "white" : "gray.800"}
                        letterSpacing="0.5px"
                      >
                        {ifscCode || "—"}
                      </Text>
                    </Box>

                    {/* 4. Bank Name */}
                    <Box
                      bg={isDark ? "gray.900" : "white"}
                      p={3}
                      borderRadius="10px"
                      border="1px solid"
                      borderColor={isDark ? "gray.700" : "blue.100"}
                      shadow="2xs"
                    >
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                          Bank Name
                        </Text>
                        {bankName && (
                          <Tooltip label={copiedField === "bank" ? "Copied!" : "Copy Bank Name"} hasArrow>
                            <IconButton
                              size="xs"
                              h="24px"
                              minW="24px"
                              icon={<Icon as={copiedField === "bank" ? FaCheck : FaCopy} boxSize={3} />}
                              colorScheme={copiedField === "bank" ? "green" : "blue"}
                              variant="ghost"
                              onClick={() => copyToClipboard(bankName, "bank", "Bank Name")}
                              aria-label="Copy Bank Name"
                            />
                          </Tooltip>
                        )}
                      </Flex>
                      <Text fontWeight="800" fontSize="sm" color={isDark ? "white" : "gray.800"} isTruncated>
                        {bankName || "NEFT / Bank Transfer"}
                      </Text>
                    </Box>

                    {/* 5. Branch Location & Account Type */}
                    {(branchName || accountType) && (
                      <Box
                        bg={isDark ? "gray.900" : "white"}
                        p={3}
                        borderRadius="10px"
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "blue.100"}
                        shadow="2xs"
                      >
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="3xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                            {branchName ? "Branch Location" : "Account Type"}
                          </Text>
                          {branchName && (
                            <Tooltip label={copiedField === "branch" ? "Copied!" : "Copy Branch"} hasArrow>
                              <IconButton
                                size="xs"
                                h="24px"
                                minW="24px"
                                icon={<Icon as={copiedField === "branch" ? FaCheck : FaCopy} boxSize={3} />}
                                colorScheme={copiedField === "branch" ? "green" : "blue"}
                                variant="ghost"
                                onClick={() => copyToClipboard(branchName, "branch", "Branch Location")}
                                aria-label="Copy Branch Location"
                              />
                            </Tooltip>
                          )}
                        </Flex>
                        <Text fontWeight="800" fontSize="sm" color={isDark ? "white" : "gray.800"} isTruncated>
                          {branchName ? `${branchName}${accountType ? ` (${accountType})` : ""}` : accountType}
                        </Text>
                      </Box>
                    )}

                    {/* 6. UPI ID / VPA */}
                    {upiId && (
                      <Box
                        bg={isDark ? "purple.950" : "purple.50"}
                        p={3}
                        borderRadius="10px"
                        border="1px solid"
                        borderColor={isDark ? "purple.800" : "purple.200"}
                        shadow="2xs"
                      >
                        <Flex justify="space-between" align="center" mb={1}>
                          <HStack spacing={1.5}>
                            <Icon as={FaQrcode} color="purple.500" boxSize={3} />
                            <Text fontSize="3xs" color="purple.700" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                              UPI ID (VPA)
                            </Text>
                          </HStack>
                          <Tooltip label={copiedField === "upi" ? "Copied!" : "Copy UPI ID"} hasArrow>
                            <IconButton
                              size="xs"
                              h="24px"
                              minW="24px"
                              icon={<Icon as={copiedField === "upi" ? FaCheck : FaCopy} boxSize={3} />}
                              colorScheme={copiedField === "upi" ? "green" : "purple"}
                              variant="ghost"
                              onClick={() => copyToClipboard(upiId, "upi", "UPI ID")}
                              aria-label="Copy UPI ID"
                            />
                          </Tooltip>
                        </Flex>
                        <Text
                          fontWeight="800"
                          fontSize="sm"
                          fontFamily="monospace"
                          color={isDark ? "purple.200" : "purple.800"}
                          isTruncated
                        >
                          {upiId}
                        </Text>
                      </Box>
                    )}
                  </SimpleGrid>
                )}
              </Box>

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
