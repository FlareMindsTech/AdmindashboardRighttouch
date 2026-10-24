import React from "react";
import {
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaWallet,
  FaPercentage,
  FaRobot,
  FaUserCheck,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";

export default function PayoutMetricsCards({ metrics = {} }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cardStyle = getSkeuomorphicCardStyle(isDark, false);

  const {
    totalPayoutsAmt = 0,
    processingAmt = 0,
    paidAmt = 0,
    failedCount = 0,
    manualReviewCount = 0,
    reservedAmt = 0,
    payableAmt = 0,
    commEarned = 0,
    autoCount = 0,
    adminDirectAmt = 0,
  } = metrics;

  const cardList = [
    {
      label: "💰 Total Payouts",
      value: `₹${totalPayoutsAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Lifetime Dispatched",
      color: "teal.600",
      icon: FaMoneyBillWave,
      iconBg: "teal.600",
    },
    {
      label: "⏳ Processing",
      value: `₹${processingAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Gateway Processing",
      color: "blue.600",
      icon: FaClock,
      iconBg: "blue.500",
    },
    {
      label: "✅ Paid",
      value: `₹${paidAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Successfully Settled",
      color: "green.600",
      icon: FaCheckCircle,
      iconBg: "green.500",
    },
    {
      label: "❌ Failed",
      value: `${failedCount} Payouts`,
      subText: "Gateway Errors",
      color: "red.600",
      icon: MdWarning,
      iconBg: "red.500",
    },
    {
      label: "⚠️ Manual Review",
      value: `${manualReviewCount} Ambiguous`,
      subText: "Network Timeouts",
      color: "orange.600",
      icon: FaExclamationTriangle,
      iconBg: "orange.500",
    },
    {
      label: "🔒 Reserved",
      value: `₹${reservedAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Locked Outbox Reserve",
      color: "purple.600",
      icon: FaLock,
      iconBg: "purple.500",
    },
    {
      label: "💵 Tech Payable",
      value: `₹${payableAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Unwithdrawn Wallet Owed",
      color: "teal.700",
      icon: FaWallet,
      iconBg: "teal.600",
    },
    {
      label: "📊 Platform Commission",
      value: `₹${commEarned.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Net Revenue Cut",
      color: "purple.700",
      icon: FaPercentage,
      iconBg: "purple.600",
    },
    {
      label: "🤖 Auto Payouts",
      value: `${autoCount} Auto`,
      subText: "System Auto-Settled",
      color: "teal.600",
      icon: FaRobot,
      iconBg: "teal.500",
    },
    {
      label: "👤 Admin Direct",
      value: `₹${adminDirectAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subText: "Manual Admin Transfers",
      color: "cyan.700",
      icon: FaUserCheck,
      iconBg: "cyan.600",
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing="14px" mb="24px" w="100%">
      {cardList.map((item, idx) => (
        <Card
          key={idx}
          borderRadius="20px"
          minH="88px"
          p={0}
          {...cardStyle}
        >
          <CardBody p="14px">
            <Flex align="center" justify="space-between">
              <Stat me="auto">
                <StatLabel fontSize="xs" color={isDark ? "gray.400" : "gray.600"} fontWeight="bold">
                  {item.label}
                </StatLabel>
                <StatNumber fontSize="lg" color={item.color} fontWeight="extrabold" mt={0.5}>
                  {item.value}
                </StatNumber>
                <StatHelpText fontSize="3xs" color={isDark ? "gray.400" : "gray.500"} mb="0">
                  {item.subText}
                </StatHelpText>
              </Stat>
              <Flex
                w="42px"
                h="42px"
                align="center"
                justify="center"
                flexShrink={0}
                ml={2}
                {...getSkeuomorphicIconBoxStyle(item.iconBg)}
              >
                <Icon as={item.icon} color="white" boxSize={4} sx={skeuomorphicIconFilter} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}
