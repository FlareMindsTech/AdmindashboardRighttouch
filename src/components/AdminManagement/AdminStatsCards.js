import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Badge,
  Skeleton,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import IconBox from "components/common/IconBox";
import {
  getSkeuomorphicCardStyle,
  getSkeuomorphicIconBoxStyle,
  skeuomorphicIconFilter,
} from "components/common/skeuomorphicStyles";
import {
  FaUsers,
  FaUserClock,
  FaCheckCircle,
  FaIdCard,
  FaUniversity,
} from "react-icons/fa";

export default function AdminStatsCards({
  activeTab,
  onCardClick,
  loading = false,
  counts = {},
  customColor = "#008080",
  textColor = "gray.700",
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const {
    totalCount = 0,
    newTechCount = 0,
    newUnverifiedCount = 0,
    activeTechCount = 0,
    kycVerifiedCount = 0,
    kycUnverifiedCount = 0,
    bankVerifiedCount = 0,
    bankUnverifiedCount = 0,
  } = counts;

  const cardItems = [
    {
      id: "all",
      label: "Total Technician",
      subLabel: "All Registered",
      value: totalCount,
      color: textColor,
      icon: FaUsers,
      iconBg: customColor,
    },
    {
      id: "NewTechnician",
      label: "New Technician",
      value: newTechCount,
      color: "blue.600",
      icon: FaUserClock,
      iconBg: "blue.500",
      badge: !loading && newUnverifiedCount > 0 ? (
        <Badge
          colorScheme="red"
          variant="subtle"
          fontSize="9px"
          px={2}
          py={0.5}
          borderRadius="full"
          fontWeight="bold"
          textTransform="capitalize"
        >
          {newUnverifiedCount} unverified
        </Badge>
      ) : (
        <Text fontSize="10px" color="gray.400" fontWeight="medium">
          All verified
        </Text>
      ),
    },
    {
      id: "Active",
      label: "Active Technician",
      value: activeTechCount,
      color: "green.600",
      icon: FaCheckCircle,
      iconBg: "green.500",
      badge: (
        <Badge
          colorScheme="green"
          variant="subtle"
          fontSize="9px"
          px={2}
          py={0.5}
          borderRadius="full"
          fontWeight="bold"
          textTransform="capitalize"
        >
          Active & ready
        </Badge>
      ),
    },
    {
      id: "KYCVerification",
      label: "KYC Verification",
      value: kycVerifiedCount,
      color: "purple.600",
      icon: FaIdCard,
      iconBg: "purple.500",
      badge: !loading && kycUnverifiedCount > 0 ? (
        <Badge
          colorScheme="purple"
          variant="subtle"
          fontSize="9px"
          px={2}
          py={0.5}
          borderRadius="full"
          fontWeight="bold"
          textTransform="capitalize"
        >
          {kycUnverifiedCount} unverified
        </Badge>
      ) : (
        <Text fontSize="10px" color="gray.400" fontWeight="medium">
          All verified
        </Text>
      ),
    },
    {
      id: "BankVerification",
      label: "Bank Verification",
      value: bankVerifiedCount,
      color: "orange.600",
      icon: FaUniversity,
      iconBg: "orange.500",
      badge: !loading && bankUnverifiedCount > 0 ? (
        <Badge
          colorScheme="orange"
          variant="subtle"
          fontSize="9px"
          px={2}
          py={0.5}
          borderRadius="full"
          fontWeight="bold"
          textTransform="capitalize"
        >
          {bankUnverifiedCount} unverified
        </Badge>
      ) : (
        <Text fontSize="10px" color="gray.400" fontWeight="medium">
          All verified
        </Text>
      ),
    },
  ];

  return (
    <Box mb={{ base: 3, md: 4 }} px={{ base: 2, md: 4 }}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={{ base: 3, md: 4 }}>
        {cardItems.map((item) => {
          const isActive = activeTab === item.id;
          const cardStyle = getSkeuomorphicCardStyle(isDark, isActive, customColor);

          return (
            <Card
              key={item.id}
              minH={{ base: "90px", md: "105px" }}
              h={{ base: "auto", md: "105px" }}
              borderRadius="10px"
              cursor="pointer"
              onClick={() => onCardClick(item.id)}
              p={0}
              {...cardStyle}
            >
              <CardBody p={{ base: 3, md: 4 }} display="flex" alignItems="center">
                <Flex align="flex-start" justify="space-between">
                  <Box flex="1" mr={2}>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"} fontWeight="bold" noOfLines={1}>
                      {item.label}
                    </Text>
                    <Text
                      as="div"
                      fontSize="2xl"
                      fontWeight="black"
                      color={item.color}
                      mt={1}
                      lineHeight="1.2"
                    >
                      {loading ? <Skeleton height="24px" width="40px" /> : item.value}
                    </Text>
                    <Box mt={1.5} minH="18px">
                      {item.badge || (
                        <Text fontSize="10px" color="gray.400" fontWeight="medium">
                          {item.subLabel}
                        </Text>
                      )}
                    </Box>
                  </Box>
                  <IconBox
                    h={{ base: "40px", md: "44px" }}
                    w={{ base: "40px", md: "44px" }}
                    flexShrink={0}
                    {...getSkeuomorphicIconBoxStyle(item.iconBg)}
                  >
                    <Icon as={item.icon} boxSize="20px" color="white" sx={skeuomorphicIconFilter} />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
