import React from "react";
import {
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
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
  FaUserCheck,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";

export default function UserStatsCards({
  stats,
  activeFilter,
  onFilterClick,
  isLoading,
  customColor = "#008080",
  textColor,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const cards = [
    {
      id: "all",
      label: "Total Users",
      value: isLoading ? <Spinner size="xs" /> : stats?.totalUsers || 0,
      icon: FaUsers,
      iconBg: customColor,
    },
    {
      id: "active",
      label: "Active Users",
      value: isLoading ? <Spinner size="xs" /> : stats?.activeUsers || 0,
      icon: FaUserCheck,
      iconBg: "green.500",
    },
    {
      id: "withBookings",
      label: "With Bookings",
      value: isLoading ? <Spinner size="xs" /> : stats?.usersWithBookings || 0,
      icon: FaCheckCircle,
      iconBg: "orange.500",
    },
    {
      id: "paidUsers",
      label: "Total Revenue",
      value: isLoading
        ? <Spinner size="xs" />
        : `₹${Number(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FaChartLine,
      iconBg: "purple.500",
    },
  ];

  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, md: 4 }}
      spacing={{ base: 3, md: 4 }}
      mb={{ base: 3, md: 4 }}
    >
      {cards.map((c) => {
        const isActive = activeFilter === c.id;
        const cardStyle = getSkeuomorphicCardStyle(isDark, isActive, customColor);

        return (
          <Card
            key={c.id}
            minH={{ base: "90px", md: "105px" }}
            h={{ base: "auto", md: "105px" }}
            borderRadius="10px"
            cursor="pointer"
            onClick={() => onFilterClick && onFilterClick(c.id)}
            p={0}
            {...cardStyle}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }} display="flex" alignItems="center">
              <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "xs", md: "sm" }}
                    color={isDark ? "gray.400" : "gray.600"}
                    fontWeight="bold"
                    pb="2px"
                    noOfLines={1}
                  >
                    {c.label}
                  </StatLabel>
                  <Flex>
                    <StatNumber
                      fontSize={{ base: "lg", md: "2xl" }}
                      color={textColor || (isDark ? "gray.100" : "gray.800")}
                      fontWeight="800"
                    >
                      {c.value}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  h={{ base: "40px", md: "44px" }}
                  w={{ base: "40px", md: "44px" }}
                  flexShrink={0}
                  ml={2}
                  {...getSkeuomorphicIconBoxStyle(c.iconBg)}
                >
                  <Icon
                    as={c.icon}
                    boxSize={{ base: "18px", md: "20px" }}
                    color="white"
                    sx={skeuomorphicIconFilter}
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
