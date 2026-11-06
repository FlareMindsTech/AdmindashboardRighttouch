import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AppModal from "components/common/AppModal";
import { useAppToast } from "components/feedback";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Icon,
  Badge,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaSlidersH,
  FaRupeeSign,
  FaCalendarAlt,
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";
import {
  getWithdrawalSettings,
  updateWithdrawalSettings,
  getAutoPayoutSettings,
  updateAutoPayoutSettings,
} from "api/settings";

/**
 * PayoutSettingsModal
 * Admin / Owner console to review and update live GlobalSetting payout limits,
 * maintenance floors, and dual-approval thresholds.
 */
export default function PayoutSettingsModal({ isOpen, onClose, onSuccess }) {
  const toast = useAppToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [minWithdrawal, setMinWithdrawal] = useState("100");
  const [maxWithdrawal, setMaxWithdrawal] = useState("50000");
  const [minMaintenance, setMinMaintenance] = useState("100");
  const [dualApprovalThreshold, setDualApprovalThreshold] = useState("10000");
  const [cooldownDays, setCooldownDays] = useState("0");

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const apiCall = typeof getWithdrawalSettings === "function" ? getWithdrawalSettings : getAutoPayoutSettings;
      const { data, error } = await apiCall();
      if (error) {
        setErrorMsg(error);
      } else {
        const s = data?.result || data || {};
        if (s.minWithdrawalAmount != null) setMinWithdrawal(String(s.minWithdrawalAmount));
        else if (s.minWithdrawalAmountPaise != null) setMinWithdrawal(String(s.minWithdrawalAmountPaise / 100));

        if (s.maxWithdrawalAmount != null) setMaxWithdrawal(String(s.maxWithdrawalAmount));
        else if (s.maxWithdrawalAmountPaise != null) setMaxWithdrawal(String(s.maxWithdrawalAmountPaise / 100));

        if (s.minimumMaintenance != null) setMinMaintenance(String(s.minimumMaintenance));
        else if (s.minimumMaintenancePaise != null) setMinMaintenance(String(s.minimumMaintenancePaise / 100));

        if (s.dualApprovalThreshold != null) setDualApprovalThreshold(String(s.dualApprovalThreshold));
        else if (s.dualApprovalThresholdPaise != null) setDualApprovalThreshold(String(s.dualApprovalThresholdPaise / 100));

        if (s.withdrawalCooldownDays != null) setCooldownDays(String(s.withdrawalCooldownDays));
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load payout settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErrorMsg("");

    const minW = parseFloat(minWithdrawal);
    const maxW = parseFloat(maxWithdrawal);
    const minM = parseFloat(minMaintenance);
    const dualT = parseFloat(dualApprovalThreshold);
    const coolD = parseInt(cooldownDays, 10);

    if (isNaN(minW) || minW < 100) {
      setErrorMsg("Minimum withdrawal amount must be at least ₹100.");
      return;
    }
    if (isNaN(maxW) || maxW < minW) {
      setErrorMsg("Maximum withdrawal amount cannot be less than the minimum withdrawal amount.");
      return;
    }
    if (isNaN(minM) || minM < 0) {
      setErrorMsg("Minimum maintenance floor cannot be negative.");
      return;
    }
    if (isNaN(dualT) || dualT < 0) {
      setErrorMsg("Dual-approval threshold cannot be negative.");
      return;
    }
    if (isNaN(coolD) || coolD < 0) {
      setErrorMsg("Cooldown days cannot be negative.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        minWithdrawalAmount: minW,
        minWithdrawalAmountPaise: Math.round(minW * 100),
        maxWithdrawalAmount: maxW,
        maxWithdrawalAmountPaise: Math.round(maxW * 100),
        minimumMaintenance: minM,
        minimumMaintenancePaise: Math.round(minM * 100),
        dualApprovalThreshold: dualT,
        dualApprovalThresholdPaise: Math.round(dualT * 100),
        withdrawalCooldownDays: coolD,
      };

      const apiUpdate = typeof updateWithdrawalSettings === "function" ? updateWithdrawalSettings : updateAutoPayoutSettings;
      const { data, error } = await apiUpdate(payload);
      if (error) {
        setErrorMsg(error);
        setSaving(false);
        return;
      }

      toast({
        title: "Payout Policy Updated",
        description: "Global payout limits and dual-approval thresholds updated successfully.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save payout settings.");
    } finally {
      setSaving(false);
    }
  };

  // Live simulation calculations
  const simBalance = 5000;
  const simMaintenance = parseFloat(minMaintenance) || 0;
  const simWithdrawable = Math.max(0, simBalance - simMaintenance);
  const simThreshold = parseFloat(dualApprovalThreshold) || 10000;
  const simTriggersDual = simWithdrawable >= simThreshold;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      maxW={{ base: "96vw", md: "960px", lg: "1100px", xl: "1180px" }}
      bodyMaxH="80vh"
      isCentered
      closeOnOverlayClick={!saving}
      headerBg="teal.800"
      headerColor="white"
      closeButtonColor="white"
      title={
        <HStack justify="space-between" align="center" w="full" pr={4}>
          <HStack spacing={3}>
            <Box
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="teal.700"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaSlidersH} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="800">
                Global Payout Policy & Limits
              </Text>
              <Text fontSize="xs" color="teal.200">
                Configure platform withdrawal ceilings, liquidity floors, and dual-approval thresholds
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="2xs" fontWeight="800">
            PLATFORM POLICY
          </Badge>
        </HStack>
      }
      footer={
        <HStack spacing={3} justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            Changes take effect immediately across all technician wallets.
          </Text>
          <HStack spacing={3}>
            <Button size="md" variant="ghost" onClick={onClose} isDisabled={saving}>
              Cancel
            </Button>
            <Button
              size="md"
              colorScheme="teal"
              bg="teal.600"
              _hover={{ bg: "teal.700" }}
              fontWeight="800"
              px={6}
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving Settings..."
              isDisabled={loading || saving}
            >
              Save Policy Configuration
            </Button>
          </HStack>
        </HStack>
      }
    >
      {loading ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Spinner size="lg" color="teal.500" thickness="3px" />
            <Text fontSize="sm" color="gray.500">Loading current payout limits & settings...</Text>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={5} align="stretch" py={1}>
          {errorMsg && (
            <Alert status="error" borderRadius="12px" fontSize="xs">
              <AlertIcon />
              <Text>{errorMsg}</Text>
            </Alert>
          )}

          {/* 100% Offline Mode Banner */}
          <Alert status="info" variant="left-accent" borderRadius="12px" py={3} bg="teal.50" borderColor="teal.500">
            <AlertIcon as={FaLock} color="teal.600" />
            <Box fontSize="xs">
              <Text fontWeight="800" color="teal.900">
                100% Offline Manual Transfer System Governed
              </Text>
              <Text color="teal.800">
                Automatic payout execution is permanently disabled. All platform disbursements require manual offline bank/UPI transfer followed by UTR recording.
              </Text>
            </Box>
          </Alert>

          {/* 2-Column Responsive Policy Sections */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* ================= COLUMN 1: FLOORS & CEILINGS ================= */}
            <Box
              p={4}
              borderRadius="16px"
              bg={isDark ? "gray.800" : "gray.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <HStack spacing={2} mb={3.5}>
                <Icon as={FaRupeeSign} color="teal.500" />
                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.700">
                  Withdrawal Ceilings & Floors
                </Text>
              </HStack>

              <VStack spacing={4} align="stretch">
                {/* Min Withdrawal */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Minimum Withdrawal Amount (₹)
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaRupeeSign} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      borderRadius="10px"
                      value={minWithdrawal}
                      onChange={(e) => setMinWithdrawal(e.target.value)}
                      min={100}
                      fontWeight="700"
                    />
                  </InputGroup>
                  <FormHelperText fontSize="3xs">Minimum permissible amount per request (Min ₹100)</FormHelperText>
                </FormControl>

                {/* Max Withdrawal */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Maximum Single Withdrawal Cap (₹)
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaRupeeSign} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      borderRadius="10px"
                      value={maxWithdrawal}
                      onChange={(e) => setMaxWithdrawal(e.target.value)}
                      min={100}
                      fontWeight="700"
                    />
                  </InputGroup>
                  <FormHelperText fontSize="3xs">Upper limit cap per single payout request</FormHelperText>
                </FormControl>

                {/* Minimum Maintenance Balance */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Minimum Wallet Maintenance Floor (₹)
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaRupeeSign} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      borderRadius="10px"
                      value={minMaintenance}
                      onChange={(e) => setMinMaintenance(e.target.value)}
                      min={0}
                      fontWeight="700"
                    />
                  </InputGroup>
                  <FormHelperText fontSize="3xs">
                    Reserved liquidity retained in technician wallet to service adjustments
                  </FormHelperText>
                </FormControl>
              </VStack>
            </Box>

            {/* ================= COLUMN 2: WITHDRAWAL FREQUENCY & POLICY ================= */}
            <Box
              p={4}
              borderRadius="16px"
              bg={isDark ? "gray.800" : "gray.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <HStack spacing={2} mb={3.5}>
                <Icon as={FaCalendarAlt} color="teal.500" />
                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="0.5px" color="gray.700">
                  Withdrawal Frequency & Policy
                </Text>
              </HStack>

              <VStack spacing={4} align="stretch">
                {/* Cooldown Days */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Technician Withdrawal Cooldown (Days)
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaCalendarAlt} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      borderRadius="10px"
                      value={cooldownDays}
                      onChange={(e) => setCooldownDays(e.target.value)}
                      min={0}
                      fontWeight="700"
                    />
                  </InputGroup>
                  <FormHelperText fontSize="3xs">
                    Days technician must wait after a paid request before requesting another (0 = no cooldown)
                  </FormHelperText>
                </FormControl>

                {/* Direct Transfer Guide Callout */}
                <Box p={3} borderRadius="10px" bg="teal.50" border="1px solid" borderColor="teal.200" fontSize="2xs">
                  <HStack spacing={1.5} color="teal.800" fontWeight="800" mb={1}>
                    <Icon as={FaInfoCircle} />
                    <Text>100% Offline Bank / UPI Settlement Policy</Text>
                  </HStack>
                  <Text color="teal.700" lineHeight="1.5">
                    Technicians submit withdrawal requests within these configured limits. Funds are reserved in platform escrow until the administrator transfers money externally (via Bank/UPI) and inputs the verified UTR number.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Real-time Policy Simulation Card */}
          <Box
            p={4}
            borderRadius="14px"
            bg={isDark ? "gray.800" : "blue.50"}
            border="1px solid"
            borderColor={isDark ? "gray.700" : "blue.200"}
          >
            <HStack justify="space-between" align="center" mb={2}>
              <HStack spacing={2}>
                <Icon as={FaInfoCircle} color="blue.600" />
                <Text fontSize="xs" fontWeight="800" color="blue.900" textTransform="uppercase">
                  Real-time Policy Simulation (Sample Balance ₹5,000)
                </Text>
              </HStack>
              <Badge colorScheme="blue" fontSize="3xs">SIMULATION</Badge>
            </HStack>

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3} fontSize="xs">
              <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px">
                <Text fontSize="3xs" color="gray.500">Retained Floor</Text>
                <Text fontWeight="800" color="orange.600">₹{simMaintenance.toLocaleString("en-IN")}</Text>
              </Box>
              <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px">
                <Text fontSize="3xs" color="gray.500">Max Spendable</Text>
                <Text fontWeight="800" color="green.600">₹{simWithdrawable.toLocaleString("en-IN")}</Text>
              </Box>
              <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px">
                <Text fontSize="3xs" color="gray.500">Cooldown Window</Text>
                <Text fontWeight="800">{cooldownDays} day(s)</Text>
              </Box>
              <Box bg={isDark ? "gray.900" : "white"} p={2.5} borderRadius="8px">
                <Text fontSize="3xs" color="gray.500">Dual-Approval Needed?</Text>
                <Badge colorScheme={simTriggersDual ? "purple" : "gray"} mt={0.5}>
                  {simTriggersDual ? "YES (≥ Threshold)" : "NO (Auto-eligible)"}
                </Badge>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      )}
    </AppModal>
  );
}

PayoutSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
