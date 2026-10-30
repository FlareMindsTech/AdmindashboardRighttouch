import React from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
} from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";
import SectionCard from "components/common/SectionCard";
import StatusBadge from "components/common/StatusBadge";
import {
  formatCurrency,
  formatDate,
  getBookingAmount,
  getBookingItemName,
  getCustomerName,
} from "components/Dashboard/dashboardUtils";

const TYPE_META = {
  service: {
    label: "Service",
    colorLight: "#006666",
    bgLight: "rgba(0, 128, 128, 0.08)",
    colorDark: "#5EEAD4",
    bgDark: "rgba(0, 128, 128, 0.18)",
  },
  product: {
    label: "Product",
    colorLight: "#1D4ED8",
    bgLight: "rgba(37, 99, 235, 0.08)",
    colorDark: "#93C5FD",
    bgDark: "rgba(37, 99, 235, 0.18)",
  },
};

export default function RecentBookingsCard({ items = [] }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const textColor = isDark ? "gray.100" : "gray.800";
  const subTextColor = isDark ? "gray.400" : "gray.500";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)";

  return (
    <SectionCard bodyProps={{ p: 0 }}>
      <Flex
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={4}
        justify="space-between"
        align="center"
        gap={3}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={3}>
          <Flex
            w="38px"
            h="38px"
            align="center"
            justify="center"
            borderRadius="10px"
            bg={isDark ? "rgba(0, 128, 128, 0.16)" : "rgba(0, 128, 128, 0.08)"}
            color={isDark ? "teal.300" : "#008080"}
            flexShrink={0}
          >
            <Icon as={FaHistory} boxSize="17px" />
          </Flex>
          <Box>
            <Heading
              size="sm"
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="800"
              color={textColor}
              letterSpacing="-0.02em"
            >
              Recent Bookings
            </Heading>
            <Text fontSize="xs" color={subTextColor}>
              Latest service and product activity in one feed
            </Text>
          </Box>
        </HStack>

        <Badge
          px={2.5}
          py={1}
          borderRadius="full"
          fontSize="2xs"
          fontWeight="800"
          bg={isDark ? "rgba(255,255,255,0.05)" : "gray.100"}
          color={isDark ? "gray.300" : "gray.600"}
        >
          {items.length} recent
        </Badge>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th
                borderColor={borderColor}
                color={subTextColor}
                fontSize="2xs"
                letterSpacing="0.06em"
              >
                Booking
              </Th>
              <Th
                borderColor={borderColor}
                color={subTextColor}
                fontSize="2xs"
                letterSpacing="0.06em"
              >
                Type
              </Th>
              <Th
                display={{ base: "none", md: "table-cell" }}
                borderColor={borderColor}
                color={subTextColor}
                fontSize="2xs"
                letterSpacing="0.06em"
              >
                Customer
              </Th>
              <Th
                display={{ base: "none", lg: "table-cell" }}
                borderColor={borderColor}
                color={subTextColor}
                fontSize="2xs"
                letterSpacing="0.06em"
              >
                Date
              </Th>
              <Th
                isNumeric
                borderColor={borderColor}
                color={subTextColor}
                fontSize="2xs"
                letterSpacing="0.06em"
              >
                Amount
              </Th>
              <Th
                borderColor={borderColor}
                color={subTextColor}
                fontSize="2xs"
                letterSpacing="0.06em"
              >
                Payment
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.length > 0 ? (
              items.map(({ booking, kind }, index) => {
                const meta = TYPE_META[kind] || TYPE_META.service;
                const id = booking?._id || booking?.id || booking?.bookingId;
                const itemName = getBookingItemName(booking, kind);
                const customer = getCustomerName(booking);
                const amount = getBookingAmount(booking);
                const status = booking?.paymentStatus || "Pending";

                return (
                  <Tr
                    key={id || `${kind}-${index}`}
                    _hover={{
                      bg: isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(15,23,42,0.02)",
                    }}
                  >
                    <Td borderColor={borderColor} py={3}>
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color={textColor}
                        noOfLines={1}
                      >
                        {itemName}
                      </Text>
                      {id && (
                        <Text
                          fontSize="2xs"
                          color={subTextColor}
                          fontFamily="monospace"
                          mt={0.5}
                        >
                          #{String(id).slice(-6).toUpperCase()}
                        </Text>
                      )}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="2xs"
                        fontWeight="800"
                        bg={isDark ? meta.bgDark : meta.bgLight}
                        color={isDark ? meta.colorDark : meta.colorLight}
                      >
                        {meta.label}
                      </Badge>
                    </Td>
                    <Td
                      display={{ base: "none", md: "table-cell" }}
                      borderColor={borderColor}
                    >
                      <Text fontSize="sm" color={textColor} noOfLines={1}>
                        {customer}
                      </Text>
                    </Td>
                    <Td
                      display={{ base: "none", lg: "table-cell" }}
                      borderColor={borderColor}
                    >
                      <Text fontSize="xs" color={subTextColor}>
                        {formatDate(
                          booking?.createdAt || booking?.scheduledAt
                        )}
                      </Text>
                    </Td>
                    <Td isNumeric borderColor={borderColor}>
                      <Text fontSize="sm" fontWeight="800" color={textColor}>
                        {formatCurrency(amount)}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <StatusBadge preset="payment" status={status} />
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td
                  colSpan={6}
                  textAlign="center"
                  py={10}
                  color="gray.500"
                  borderColor={borderColor}
                >
                  No recent bookings yet
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </SectionCard>
  );
}
