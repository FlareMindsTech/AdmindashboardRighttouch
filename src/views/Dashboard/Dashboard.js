
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  SimpleGrid,
  Flex,
  Text,
  Heading,
  Stack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useColorMode,
  HStack,
  VStack,
  Progress,
} from "@chakra-ui/react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaRupeeSign,
  FaLayerGroup,
  FaHistory
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { fetchCategories, selectServiceCategories } from "store/slices/referenceSlice";
import { fetchServiceBookings, selectServiceBookings } from "store/slices/bookingsSlice";
import StatCard from "components/common/StatCard";
import StatusBadge from "components/common/StatusBadge";
import SectionCard from "components/common/SectionCard";
import LoadingState from "components/common/LoadingState";
import EmptyState from "components/common/EmptyState";
import ServiceCategoryPerformance from "components/Dashboard/ServiceCategoryPerformance";
import { getClaymorphicItemStyle, getClaymorphicIconBoxStyle } from "components/common/skeuomorphicStyles";

// --- Helper Functions ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};



const KPICard = React.memo(({ title, value, icon, color, subValue, textColor, subTextColor }) => (
  <StatCard
    variant="kpi"
    textColor={textColor}
    subTextColor={subTextColor}
    title={title}
    value={value}
    icon={icon}
    color={color}
    subValue={subValue}
  />
));

export default function Dashboard() {
  // --- State (shared via Redux; derived KPIs/charts stay local) ---
  const dispatch = useAppDispatch();
  const serviceBookings = useAppSelector(selectServiceBookings);
  const categories = useAppSelector(selectServiceCategories);
  const [loading, setLoading] = useState(true);

  // --- Theme ---
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

  // --- Fetch Data (TTL-cached shared collections; per-leg failure
  // keeps last-good store data instead of blanking, warnings preserved) ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel ensure-fetch (cache hits resolve without a request)
        await Promise.all([
          dispatch(fetchServiceBookings()).unwrap().catch(err => {
            console.warn("Bookings fetch warning:", err);
          }),
          dispatch(fetchCategories({ categoryType: "service" })).unwrap().catch(err => {
            console.warn("Categories fetch warning:", err);
          })
        ]);
      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [dispatch]);

  // --- Derived Metrics ---
  const kpiData = useMemo(() => {
    const bookingsList = Array.isArray(serviceBookings) ? serviceBookings : [];
    const categoriesList = Array.isArray(categories) ? categories : [];

    const totalBookings = bookingsList.length;

    // Filter for successful payments
    const successBookings = bookingsList.filter(b => {
      const status = b?.paymentStatus?.toLowerCase();
      return status === 'success' || status === 'paid';
    });

    const successPaymentsCount = successBookings.length;

    // Revenue Calculation (Strictly from SUCCESS bookings)
    const totalRevenue = successBookings.reduce((acc, curr) => {
      return acc + (Number(curr?.baseAmount) || Number(curr?.amount) || 0);
    }, 0);

    const uniqueActiveCategories = new Set();
    const catMap = {};
    categoriesList.forEach(c => {
      if (!c) return;
      const name = c.category || c.name;
      if (c._id && name) catMap[c._id] = name;
    });

    bookingsList.forEach(b => {
      if (!b) return;
      const catRef = b?.categoryId || b?.category || b?.serviceId?.categoryId || b?.serviceId?.category || b?.serviceCategory;
      if (catRef) {
        let name;
        if (typeof catRef === 'object' && catRef !== null) {
          name = catRef.category || catRef.name || catRef.title;
        } else {
          name = catMap[catRef] || catRef;
        }
        if (name && name !== "Uncategorized") uniqueActiveCategories.add(name);
      }
    });

    return {
      totalBookings,
      successPaymentsCount,
      totalRevenue,
      activeCategoriesCount: uniqueActiveCategories.size || categoriesList.length
    };
  }, [serviceBookings, categories]);

  // --- Category Performance Data ---
  const categoryPerformance = useMemo(() => {
    const bookingsList = Array.isArray(serviceBookings) ? serviceBookings : [];
    const categoriesList = Array.isArray(categories) ? categories : [];

    const catMap = {};
    categoriesList.forEach(c => {
      if (!c) return;
      const name = c.category || c.name;
      if (c._id && name) catMap[c._id] = name;
    });

    const perfMap = {};

    // Initialize with all categories
    categoriesList.forEach(c => {
      if (!c) return;
      const name = c.category || c.name || "Unknown";
      if (!perfMap[name]) {
        perfMap[name] = { name, totalBookings: 0, revenue: 0, successCount: 0 };
      }
    });

    // Aggregate data
    bookingsList.forEach(b => {
      if (!b) return;
      let catName = "Uncategorized";
      const catRef = b?.categoryId || b?.category || b?.serviceId?.categoryId || b?.serviceId?.category || b?.serviceCategory;

      if (catRef) {
        if (typeof catRef === 'string') {
          catName = catMap[catRef] || catRef;
        } else if (typeof catRef === 'object' && catRef !== null) {
          catName = catRef.category || catRef.name || catRef.title || "Uncategorized";
        }
      }

      const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

      if (catName === "Uncategorized" || isObjectId(catName)) {
        const sName = (b?.serviceId?.serviceName || b?.serviceName || "").toLowerCase();
        if (sName) {
          for (const name of Object.values(catMap)) {
            if (sName.includes(name.toLowerCase())) {
              catName = name;
              break;
            }
          }
        }
      }

      if (isObjectId(catName)) {
        catName = "Uncategorized";
      }

      if (!perfMap[catName]) {
        perfMap[catName] = { name: catName, totalBookings: 0, revenue: 0, successCount: 0 };
      }

      perfMap[catName].totalBookings += 1;

      const status = b?.paymentStatus?.toLowerCase();
      if (status === 'success' || status === 'paid') {
        perfMap[catName].successCount += 1;
        perfMap[catName].revenue += (Number(b?.baseAmount) || Number(b?.amount) || 0);
      }
    });

    return Object.values(perfMap).sort((a, b) => b.revenue - a.revenue);
  }, [serviceBookings, categories]);



  // --- Recent Bookings ---
  const recentBookings = useMemo(() => {
    const bookingsList = Array.isArray(serviceBookings) ? serviceBookings : [];
    return [...bookingsList]
      .sort((a, b) => {
        const dateA = new Date(a?.createdAt || a?.scheduledAt || 0);
        const dateB = new Date(b?.createdAt || b?.scheduledAt || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [serviceBookings]);

  if (loading) {
    return <LoadingState label="Loading Dashboard..." />;
  }

  return (
    <Box
      h="100vh"
      display="flex"
      flexDirection="column"
      pt={{ base: "100px", md: "60px" }}
      pb={{ base: 4, md: 8 }}
      px={{ base: 4, md: 8 }}
      overflow="hidden"
    >
      {/* 1. TOP KPI CARDS - Fixed Header */}
      <Box mb={{ base: 3, md: 4 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }}>
          <KPICard
            title="Total Bookings"
            value={kpiData.totalBookings}
            icon={FaCalendarCheck}
            color="blue"
            textColor={textColor}
            subTextColor={subTextColor}
          />
          <KPICard
            title="Successful Payments"
            value={kpiData.successPaymentsCount}
            icon={FaCheckCircle}
            color="green"
            subValue={`${((kpiData.successPaymentsCount / (kpiData.totalBookings || 1)) * 100).toFixed(1)}% Conversion`}
            textColor={textColor}
            subTextColor={subTextColor}
          />
          <KPICard
            title="Total Revenue"
            value={formatCurrency(kpiData.totalRevenue)}
            icon={FaRupeeSign}
            color="purple"
            textColor={textColor}
            subTextColor={subTextColor}
          />
          <KPICard
            title="Active Categories"
            value={kpiData.activeCategoriesCount}
            icon={FaLayerGroup}
            color="orange"
            textColor={textColor}
            subTextColor={subTextColor}
          />
        </SimpleGrid>
      </Box>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <Box
        flex="1"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'transparent',
            borderRadius: '24px',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            background: 'var(--chakra-colors-gray-400)',
          },
        }}
      >
        <Stack spacing={8} pb={6} pr={2}>
          {/* 2. ANALYTICS SECTION */}
          <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={8}>

            {/* 2a. Redesigned Service Category Performance Analytics Card */}
            <ServiceCategoryPerformance
              gridColumn={{ xl: "span 2" }}
              serviceBookings={serviceBookings}
              categories={categories}
              loading={loading}
            />

            {/* 2b. Recent Bookings List (Right Panel) */}
            <SectionCard>
                <HStack mb={4} spacing={3}>
                  <Flex
                    w="38px"
                    h="38px"
                    align="center"
                    justify="center"
                    flexShrink={0}
                    {...getClaymorphicIconBoxStyle("purple.500")}
                  >
                    <Icon as={FaHistory} color="white" boxSize="18px" />
                  </Flex>
                  <Heading size="md" color={textColor}>Recent Bookings</Heading>
                </HStack>

                <VStack spacing={3} align="stretch">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, idx) => {
                      const serviceName = booking?.serviceId?.serviceName || "Unknown Service";
                      const customerName = booking?.customerId?.fname
                        ? `${booking.customerId.fname} ${booking.customerId.lname || ''}`
                        : (booking?.addressSnapshot?.name || "Unknown Customer");
                      const amount = booking?.baseAmount || 0;
                      const status = booking?.paymentStatus || 'Pending';

                      return (
                        <Flex
                          key={idx}
                          justify="space-between"
                          align="center"
                          p={3.5}
                          {...getClaymorphicItemStyle(isDark)}
                        >
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={1}>
                              {serviceName}
                            </Text>
                            <Text fontSize="xs" color={subTextColor}>
                              {customerName}
                            </Text>
                            <Text fontSize="xs" color="gray.400" mt="1px">
                              {formatDate(booking?.createdAt || booking?.scheduledAt)}
                            </Text>
                          </Box>
                          <VStack align="end" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm" color={textColor}>
                              {formatCurrency(amount)}
                            </Text>
                            <StatusBadge preset="payment" status={status} />
                          </VStack>
                        </Flex>
                      );
                    })
                  ) : (
                    <EmptyState variant="text" message="No recent bookings" />
                  )}
                </VStack>
            </SectionCard>
          </SimpleGrid>

          {/* 3. Detailed Category Table */}
          <SectionCard
            bodyProps={{ overflowX: "auto" }}
          >
              <HStack mb={4} spacing={3}>
                <Flex
                  w="38px"
                  h="38px"
                  align="center"
                  justify="center"
                  flexShrink={0}
                  {...getClaymorphicIconBoxStyle("teal.500")}
                >
                  <Icon as={FaLayerGroup} color="white" boxSize="18px" />
                </Flex>
                <Heading size="md" color={textColor}>Category Breakdown</Heading>
              </HStack>

              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Category Name</Th>
                    <Th isNumeric>Total Bookings</Th>
                    <Th isNumeric>Success. Payments</Th>
                    <Th isNumeric>Revenue</Th>
                    <Th width="200px">Performance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {categoryPerformance.length > 0 ? (
                    categoryPerformance.map((cat, idx) => {
                      const maxRev = categoryPerformance[0]?.revenue || 1;
                      const percent = (cat.revenue / maxRev) * 100;

                      return (
                        <Tr key={idx}>
                          <Td fontWeight="medium">{cat.name}</Td>
                          <Td isNumeric>{cat.totalBookings}</Td>
                          <Td isNumeric>{cat.successCount}</Td>
                          <Td isNumeric fontWeight="bold" color={textColor}>
                            {formatCurrency(cat.revenue)}
                          </Td>
                          <Td>
                            <Progress
                              value={percent}
                              size="xs"
                              colorScheme="blue"
                              borderRadius="full"
                            />
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={6} color="gray.500">
                        No stats available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
}