
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
  Badge,
  Spinner,
  useColorModeValue,
  HStack,
  VStack,
  Progress,
  Container,
  Divider
} from "@chakra-ui/react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaRupeeSign,
  FaLayerGroup,
  FaChartBar,
  FaExclamationCircle,
  FaHistory
} from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import { getAllServiceBooking, getAllCategories } from "../utils/axiosInstance";

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

const getStatusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === 'success' || s === 'paid' || s === 'completed' || s === 'approved') return 'green';
  if (s === 'pending' || s === 'requested') return 'yellow';
  if (s === 'failed' || s === 'rejected' || s === 'cancelled') return 'red';
  return 'gray';
};

export default function Dashboard() {
  // --- State ---
  const [serviceBookings, setServiceBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Theme ---
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel Fetch
        const [bookingsRes, categoriesRes] = await Promise.all([
          getAllServiceBooking(),
          getAllCategories("service") // Assuming "service" type based on context, or fetch all
        ]);

        // Process Bookings
        let bookingsData = [];
        if (bookingsRes?.result && Array.isArray(bookingsRes.result)) {
          bookingsData = bookingsRes.result;
        } else if (Array.isArray(bookingsRes)) {
          bookingsData = bookingsRes;
        }

        // Process Categories
        let categoriesData = [];
        if (categoriesRes?.result && Array.isArray(categoriesRes.result)) {
          categoriesData = categoriesRes.result;
        } else if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data;
        } else if (categoriesRes?.categories && Array.isArray(categoriesRes.categories)) {
          categoriesData = categoriesRes.categories;
        } else if (Array.isArray(categoriesRes)) {
          categoriesData = categoriesRes;
        } else if (categoriesRes?.result?.categories && Array.isArray(categoriesRes.result.categories)) {
          categoriesData = categoriesRes.result.categories;
        }

        setServiceBookings(bookingsData);
        setCategories(categoriesData);

      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Derived Metrics ---
  const kpiData = useMemo(() => {
    const totalBookings = serviceBookings.length;

    // Filter for successful payments
    const successBookings = serviceBookings.filter(b => {
      const status = b?.paymentStatus?.toLowerCase();
      return status === 'success' || status === 'paid';
    });

    const successPaymentsCount = successBookings.length;

    // Revenue Calculation (Strictly from SUCCESS bookings)
    const totalRevenue = successBookings.reduce((acc, curr) => {
      return acc + (Number(curr?.baseAmount) || Number(curr?.amount) || 0);
    }, 0);

    // Active Categories Count
    // We need to map bookings to categories. 
    // Assuming booking.serviceId.category is the link or we match by service name?
    // Let's collect unique category IDs/Names from bookings
    const uniqueActiveCategories = new Set();
    serviceBookings.forEach(b => {
      const cat = b?.serviceId?.category || b?.category;
      if (cat) {
        let val;
        if (typeof cat === 'object') {
          val = cat.category || cat.name || cat._id;
        } else {
          val = cat;
        }
        if (val) uniqueActiveCategories.add(val);
      }
    });

    return {
      totalBookings,
      successPaymentsCount,
      totalRevenue,
      activeCategoriesCount: uniqueActiveCategories.size
    };
  }, [serviceBookings]);

  // --- Category Performance Data ---
  const categoryPerformance = useMemo(() => {
    // optimize category map
    const catMap = {};
    categories.forEach(c => {
      if (c._id) catMap[c._id] = c.category || c.name;
    });

    const perfMap = {};

    // Initialize with all categories (even 0 bookings)
    categories.forEach(c => {
      const name = c.category || c.name || "Unknown";
      if (!perfMap[name]) {
        perfMap[name] = { name, totalBookings: 0, revenue: 0, successCount: 0 };
      }
    });

    // Aggregate data
    serviceBookings.forEach(b => {
      let catName = "Uncategorized";
      const catRef = b?.serviceId?.category || b?.category;

      if (catRef) {
        if (typeof catRef === 'string') {
          catName = catMap[catRef] || catRef; // ID matched or raw string
        } else if (typeof catRef === 'object') {
          catName = catRef.category || catRef.name || "Uncategorized";
        }
      }

      if (!perfMap[catName]) {
        perfMap[catName] = { name: catName, totalBookings: 0, revenue: 0, successCount: 0 };
      }

      // Increment counts
      perfMap[catName].totalBookings += 1;

      // Revenue logic
      const status = b?.paymentStatus?.toLowerCase();
      if (status === 'success' || status === 'paid') {
        perfMap[catName].successCount += 1;
        perfMap[catName].revenue += (Number(b?.baseAmount) || 0);
      }
    });

    return Object.values(perfMap).sort((a, b) => b.revenue - a.revenue); // Sort by revenue desc
  }, [serviceBookings, categories]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const labels = categoryPerformance.map(c => c.name);
    const revenues = categoryPerformance.map(c => c.revenue);
    const bookings = categoryPerformance.map(c => c.totalBookings);

    return {
      series: [
        { name: 'Revenue (₹)', data: revenues },
        { name: 'Bookings', data: bookings }
      ],
      options: {
        chart: {
          type: 'bar',
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 4
          },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
          categories: labels,
          labels: { style: { colors: subTextColor, fontSize: '12px' } }
        },
        yaxis: [
          {
            title: { text: 'Revenue (₹)', style: { color: '#008FFB' } },
            labels: { style: { colors: subTextColor } }
          },
          {
            opposite: true,
            title: { text: 'Bookings', style: { color: '#00E396' } },
            labels: { style: { colors: subTextColor } }
          }
        ],
        fill: { opacity: 1 },
        tooltip: {
          y: {
            formatter: function (val, { seriesIndex }) {
              return seriesIndex === 0 ? formatCurrency(val) : val;
            }
          }
        },
        colors: ['#008FFB', '#00E396']
      }
    };
  }, [categoryPerformance, subTextColor]);

  // --- Recent Bookings ---
  // sort by createdAt desc, take top 5
  // Warning: check date field name. Billing.js uses 'scheduledAt' or 'createdAt'.
  const recentBookings = useMemo(() => {
    return [...serviceBookings]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.scheduledAt || 0);
        const dateB = new Date(b.createdAt || b.scheduledAt || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [serviceBookings]);

  // --- UI Components ---
  const KPICard = ({ title, value, icon, color, subValue }) => (
    <Box bg={cardBg} borderRadius="xl" shadow="sm" border="1px solid" borderColor={borderColor}>
      <Box p={5}>
        <Flex align="center" justify="space-between" mb={2}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={subTextColor} textTransform="uppercase" letterSpacing="wide">
              {title}
            </Text>
            <Heading size="lg" mt={1} color={textColor}>
              {value}
            </Heading>
          </Box>
          <Flex
            w={12} h={12}
            align="center" justify="center"
            bg={`${color}.50`} color={`${color}.500`}
            borderRadius="lg"
          >
            <Icon as={icon} boxSize={6} />
          </Flex>
        </Flex>
        {subValue && <Text fontSize="xs" color={subTextColor}>{subValue}</Text>}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Flex h="80vh" w="100%" justify="center" align="center">
        <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
        <Text ml={4} fontWeight="medium" color="gray.500">Loading Dashboard...</Text>
      </Flex>
    );
  }

  return (
    <Box
      h="100vh"
      overflowY="auto"
      pt={{ base: "120px", md: "80px" }}
      pb={{ base: 8, md: 12 }}
      px={{ base: 4, md: 8 }}
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
      <Stack spacing={8}>

        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
        </Flex>

        {/* 1. TOP KPI CARDS */}
        {/* 1. TOP KPI CARDS */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
          <KPICard
            title="Total Bookings"
            value={kpiData.totalBookings}
            icon={FaCalendarCheck}
            color="blue"
          />
          <KPICard
            title="Successful Payments"
            value={kpiData.successPaymentsCount}
            icon={FaCheckCircle}
            color="green"
            subValue={`${((kpiData.successPaymentsCount / (kpiData.totalBookings || 1)) * 100).toFixed(1)}% Conversion`}
          />
          <KPICard
            title="Total Revenue"
            value={formatCurrency(kpiData.totalRevenue)}
            icon={FaRupeeSign}
            color="purple"
          />
          <KPICard
            title="Active Categories"
            value={kpiData.activeCategoriesCount}
            icon={FaLayerGroup}
            color="orange"
          />
        </SimpleGrid>

        {/* 2. ANALYTICS SECTION */}
        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={8}>

          {/* 2a. Chart */}
          <Box gridColumn={{ xl: "span 2" }} bg={cardBg} borderRadius="xl" shadow="sm" border="1px solid" borderColor={borderColor}>
            <Box p={5}>
              <Flex align="center" justify="space-between" mb={6}>
                <HStack>
                  <Icon as={FaChartBar} color="blue.500" />
                  <Heading size="md" color={textColor}>Service Category Performance</Heading>
                </HStack>
              </Flex>

              {categoryPerformance.length > 0 ? (
                <Box h="350px">
                  <ReactApexChart
                    options={chartData.options}
                    series={chartData.series}
                    type="bar"
                    height="100%"
                  />
                </Box>
              ) : (
                <Flex h="300px" justify="center" align="center" direction="column" color="gray.400">
                  <Icon as={FaExclamationCircle} boxSize={8} mb={2} />
                  <Text>No Analytics Data Available</Text>
                </Flex>
              )}
            </Box>
          </Box>

          {/* 2b. Recent Bookings List (Right Panel) */}
          <Box bg={cardBg} borderRadius="xl" shadow="sm" border="1px solid" borderColor={borderColor}>
            <Box p={5}>
              <HStack mb={4}>
                <Icon as={FaHistory} color="gray.500" />
                <Heading size="md" color={textColor}>Recent Bookings</Heading>
              </HStack>

              <VStack spacing={4} align="stretch" divider={<Divider />}>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, idx) => {
                    const serviceName = booking?.serviceId?.serviceName || "Unknown Service";
                    const customerName = booking?.customerId?.fname
                      ? `${booking.customerId.fname} ${booking.customerId.lname || ''}`
                      : (booking?.addressSnapshot?.name || "Unknown Customer");
                    const amount = booking?.baseAmount || 0;
                    const status = booking?.paymentStatus || 'Pending';

                    return (
                      <Flex key={idx} justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={1}>
                            {serviceName}
                          </Text>
                          <Text fontSize="xs" color={subTextColor}>
                            {customerName}
                          </Text>
                          <Text fontSize="xs" color="gray.400" mt="1px">
                            {formatDate(booking.createdAt || booking.scheduledAt)}
                          </Text>
                        </Box>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm" color={textColor}>
                            {formatCurrency(amount)}
                          </Text>
                          <Badge
                            size="sm"
                            mt={1}
                            colorScheme={getStatusColor(status)}
                            fontSize="10px"
                          >
                            {status}
                          </Badge>
                        </VStack>
                      </Flex>
                    );
                  })
                ) : (
                  <Text color="gray.400" textAlign="center" py={4}>No recent bookings</Text>
                )}
              </VStack>
            </Box>
          </Box>
        </SimpleGrid>

        {/* 3. Detailed Category Table (Optional but good for data depth) */}
        <Box bg={cardBg} borderRadius="xl" shadow="sm" border="1px solid" borderColor={borderColor}>
          <Box p={5} overflowX="auto">
            <Heading size="md" mb={4} color={textColor}>Category Breakdown</Heading>
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
                      <Tr key={idx} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="medium">{cat.name}</Td>
                        <Td isNumeric>{cat.totalBookings}</Td>
                        <Td isNumeric>{cat.successCount}</Td>
                        <Td isNumeric fontWeight="bold" color="gray.700">
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
          </Box>
        </Box>

      </Stack>
    </Box>
  );
}