import React from "react";
import {
  SimpleGrid,
  Flex,
  Box,
  Text,
  Icon,
  Badge,
  HStack,
  useColorMode,
  Skeleton,
} from "@chakra-ui/react";
import {
  FaClock,
  FaCheckCircle,
  FaLock,
  FaMoneyCheckAlt,
  FaArrowRight,
} from "react-icons/fa";
import { formatInr } from "./FinancialBreakdown";

export default function PayoutSummaryCards({
  walletSummary = {},
  autoPayoutSummary = {},
  activeTab = "all",
  onSelectTab,
  loading = false,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // API-backed values from backend summary models
  const withdrawalsData = walletSummary?.withdrawals || walletSummary?.result?.withdrawals || {};
  const techData = walletSummary?.technicians || walletSummary?.result?.technicians || {};
  const autoSummary = autoPayoutSummary?.result || autoPayoutSummary || {};

  // Extract authoritative numbers
  const pendingCount =
    withdrawalsData?.pending?.count ??
    withdrawalsData?.requested?.count ??
    autoSummary?.pendingApprovalCount ??
    0;

  const approvedAwaitingTransferCount =
    withdrawalsData?.approved?.count ??
    autoSummary?.approvedAwaitingTransferCount ??
    0;

  const paidCount =
    withdrawalsData?.paid?.count ??
    autoSummary?.allTimePaidCount ??
    0;

  // Reserved balance for active withdrawals
  const reservedPaise =
    techData?.totalReservedPaise ??
    techData?.reservedBalancePaise ??
    (withdrawalsData?.approved?.amount ? withdrawalsData.approved.amount * 100 : 0);

  const cards = [
    {
      id: "requested",
      title: "Pending Requests",
      count: pendingCount,
      subtitle: "Awaiting admin review",
      tag: "Action Required",
      icon: FaClock,
      accentColor: "#F59E0B",
      bgGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      glowColor: "rgba(245, 158, 11, 0.28)",
      lightBg: "rgba(245, 158, 11, 0.08)",
      filterTab: "requested",
    },
    {
      id: "approved",
      title: "Ready to Pay",
      count: approvedAwaitingTransferCount,
      subtitle: "Execute bank transfer",
      tag: "Transfer Ready",
      icon: FaMoneyCheckAlt,
      accentColor: "#008080",
      bgGradient: "linear-gradient(135deg, #008080 0%, #006666 100%)",
      glowColor: "rgba(0, 128, 128, 0.28)",
      lightBg: "rgba(0, 128, 128, 0.08)",
      filterTab: "approved",
    },
    {
      id: "paid",
      title: "Paid Payouts",
      count: paidCount,
      subtitle: "UTR recorded & completed",
      tag: "Disbursed",
      icon: FaCheckCircle,
      accentColor: "#10B981",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      glowColor: "rgba(16, 185, 129, 0.28)",
      lightBg: "rgba(16, 185, 129, 0.08)",
      filterTab: "paid",
    },
    {
      id: "reserved",
      title: "Reserved Payout Funds",
      isCurrency: true,
      amountStr: formatInr(reservedPaise),
      subtitle: "Escrow for active payouts",
      tag: "Platform Escrow",
      icon: FaLock,
      accentColor: "#6366F1",
      bgGradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
      glowColor: "rgba(99, 102, 241, 0.28)",
      lightBg: "rgba(99, 102, 241, 0.08)",
      filterTab: "approved",
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 5 }}>
      {cards.map((card) => {
        const isSelected = activeTab === card.filterTab;

        return (
          <Box
            key={card.id}
            position="relative"
            bg={isDark ? "gray.850" : "white"}
            borderRadius="18px"
            border="2px solid"
            borderColor={isSelected ? card.accentColor : isDark ? "gray.750" : "gray.100"}
            boxShadow={
              isSelected
                ? `0 12px 30px -4px ${card.glowColor}, 0 4px 12px -2px rgba(0,0,0,0.06)`
                : isDark
                ? "0 4px 20px -2px rgba(0, 0, 0, 0.4)"
                : "0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)"
            }
            overflow="hidden"
            cursor="pointer"
            onClick={() => onSelectTab && onSelectTab(card.filterTab)}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              transform: "translateY(-4px)",
              borderColor: card.accentColor,
              boxShadow: `0 14px 32px -4px ${card.glowColor}, 0 6px 16px -2px rgba(0, 0, 0, 0.08)`,
            }}
            role="button"
            tabIndex={0}
            aria-label={`${card.title}: ${card.isCurrency ? card.amountStr : card.count}`}
          >
            {/* Top Accent Gradient Line */}
            <Box h="4px" w="100%" bg={card.bgGradient} />

            <Box p={{ base: 4, md: 5 }}>
              {/* Header: Title and Icon Badge */}
              <Flex justify="space-between" align="flex-start" mb={3}>
                <Box pr={2}>
                  <Text
                    fontSize="xs"
                    fontWeight="800"
                    color={isDark ? "gray.300" : "gray.600"}
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    noOfLines={1}
                  >
                    {card.title}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" fontWeight="500" mt={0.5}>
                    {card.subtitle}
                  </Text>
                </Box>

                {/* Glowing Rounded Icon Box */}
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="12px"
                  bg={card.bgGradient}
                  align="center"
                  justify="center"
                  color="white"
                  boxShadow={`0 4px 14px ${card.glowColor}`}
                  flexShrink={0}
                >
                  <Icon as={card.icon} boxSize="20px" />
                </Flex>
              </Flex>

              {/* Metric Value */}
              <Box my={2}>
                {loading ? (
                  <Skeleton h="36px" w="70%" borderRadius="8px" />
                ) : (
                  <Text
                    fontSize={{ base: "26px", md: "28px" }}
                    fontWeight="900"
                    color={isDark ? "white" : "gray.850"}
                    lineHeight="1.1"
                    letterSpacing="-0.5px"
                  >
                    {card.isCurrency ? card.amountStr : card.count.toLocaleString()}
                  </Text>
                )}
              </Box>

              {/* Bottom Footer: Status Tag & Filter Hint */}
              <Flex justify="space-between" align="center" mt={3} pt={2.5} borderTop="1px solid" borderColor={isDark ? "gray.800" : "gray.100"}>
                <Badge
                  fontSize="2xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={card.lightBg}
                  color={card.accentColor}
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  {card.tag}
                </Badge>

                <HStack
                  spacing={1}
                  fontSize="2xs"
                  fontWeight="700"
                  color={isSelected ? card.accentColor : "gray.400"}
                  _groupHover={{ color: card.accentColor }}
                >
                  <Text>{isSelected ? "Active View" : "Filter"}</Text>
                  <Icon as={FaArrowRight} boxSize={2} />
                </HStack>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
