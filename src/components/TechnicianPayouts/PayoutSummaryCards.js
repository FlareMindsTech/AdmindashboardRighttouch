import React from "react";
import {
  SimpleGrid,
  Flex,
  Box,
  Text,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import {
  getSkeuomorphicCardStyle,
  getSkeuomorphicIconBoxStyle,
  skeuomorphicIconFilter,
} from "components/common/skeuomorphicStyles";
import {
  FaClock,
  FaCheckCircle,
  FaLock,
  FaMoneyCheckAlt,
  FaQuestionCircle,
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

  const manualReviewCount =
    withdrawalsData?.manual_review?.count ??
    autoSummary?.manualReviewCount ??
    0;

  // Reserved balance for active withdrawals:
  // Use reservedBalancePaise from technician aggregates or withdrawal hold
  const reservedPaise =
    techData?.totalReservedPaise ??
    techData?.reservedBalancePaise ??
    (withdrawalsData?.approved?.amount ? withdrawalsData.approved.amount * 100 : 0);

  const cards = [
    {
      id: "requested",
      title: "Pending Requests",
      count: pendingCount,
      subtitle: "Awaiting review",
      icon: FaClock,
      accentColor: "orange.500",
      iconVariant: "warning",
      filterTab: "requested",
    },
    {
      id: "approved",
      title: "Approved — Awaiting Transfer",
      count: approvedAwaitingTransferCount,
      subtitle: "Execute manual bank transfer",
      icon: FaMoneyCheckAlt,
      accentColor: "blue.500",
      iconVariant: "info",
      filterTab: "approved",
    },
    {
      id: "paid",
      title: "Paid Payouts",
      count: paidCount,
      subtitle: "UTR recorded & completed",
      icon: FaCheckCircle,
      accentColor: "green.500",
      iconVariant: "success",
      filterTab: "paid",
    },
    {
      id: "manual_review",
      title: "Manual Review",
      count: manualReviewCount,
      subtitle: "Requires investigation",
      icon: FaQuestionCircle,
      accentColor: "purple.500",
      iconVariant: "warning",
      filterTab: "manual_review",
    },
    {
      id: "reserved",
      title: "Reserved Payout Funds",
      isCurrency: true,
      amountStr: formatInr(reservedPaise),
      subtitle: "Held for active withdrawals",
      icon: FaLock,
      accentColor: "teal.500",
      iconVariant: "primary",
      filterTab: "approved",
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 5 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
      {cards.map((card) => {
        const isSelected = activeTab === card.filterTab;
        const cardStyle = getSkeuomorphicCardStyle(isDark, isSelected, card.accentColor);
        const iconBoxStyle = getSkeuomorphicIconBoxStyle(isDark, card.iconVariant, "md");

        return (
          <Card
            key={card.id}
            minH={{ base: "90px", md: "105px" }}
            h={{ base: "auto", md: "105px" }}
            borderRadius="10px"
            p={0}
            {...cardStyle}
            cursor="pointer"
            onClick={() => onSelectTab && onSelectTab(card.filterTab)}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              transform: "translateY(-3px)",
              borderColor: card.accentColor,
            }}
            role="button"
            tabIndex={0}
            aria-label={`${card.title}: ${card.isCurrency ? card.amountStr : card.count}`}
          >
            <CardBody p={{ base: 3, md: 4 }} display="flex" alignItems="center">
              <Flex justify="space-between" align="center" w="100%">
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={isDark ? "gray.400" : "gray.500"}
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    mb="6px"
                  >
                    {card.title}
                  </Text>
                  <Text
                    fontSize={card.isCurrency ? "xl" : "2xl"}
                    fontWeight="800"
                    color={isDark ? "gray.100" : "gray.800"}
                    lineHeight="1.1"
                    mb="4px"
                  >
                    {loading ? "..." : card.isCurrency ? card.amountStr : card.count.toLocaleString()}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" fontWeight="500">
                    {card.subtitle}
                  </Text>
                </Box>
                <Flex {...iconBoxStyle} align="center" justify="center">
                  <Icon
                    as={card.icon}
                    boxSize="18px"
                    color={card.accentColor}
                    filter={skeuomorphicIconFilter}
                  />
                </Flex>
              </Flex>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
