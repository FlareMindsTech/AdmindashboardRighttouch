import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaBoxOpen,
  FaCalendarCheck,
  FaCheckCircle,
  FaRupeeSign,
  FaTools,
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchCategories,
  fetchProducts,
  selectServiceCategories,
  selectProductCategories,
  selectProducts,
} from "store/slices/referenceSlice";
import {
  fetchServiceBookings,
  fetchProductBookings,
  selectServiceBookings,
  selectProductBookings,
} from "store/slices/bookingsSlice";
import LoadingState from "components/common/LoadingState";
import KpiTile from "components/Dashboard/KpiTile";
import RevenueTrendCard from "components/Dashboard/RevenueTrendCard";
import RevenueMixCard from "components/Dashboard/RevenueMixCard";
import CategoryPerformancePanel from "components/Dashboard/CategoryPerformancePanel";
import RecentBookingsCard from "components/Dashboard/RecentBookingsCard";
import {
  buildDomainAnalytics,
  buildMonthlyTrend,
  formatCompactCurrency,
  formatCurrency,
  isActiveCatalogItem,
  percentChange,
} from "components/Dashboard/dashboardUtils";
import {
  fetchDashboardInsights,
  normalizeMonthlySeries,
} from "components/Dashboard/dashboardInsights";


export default function Dashboard() {
  const dispatch = useAppDispatch();
  const serviceBookings = useAppSelector(selectServiceBookings);
  const productBookings = useAppSelector(selectProductBookings);
  const serviceCategories = useAppSelector(selectServiceCategories);
  const productCategories = useAppSelector(selectProductCategories);
  const products = useAppSelector(selectProducts);

  const hasExistingData =
    (serviceBookings && serviceBookings.length > 0) ||
    (productBookings && productBookings.length > 0);
  const [loading, setLoading] = useState(!hasExistingData);
  const [insights, setInsights] = useState(null);

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const textColor = isDark ? "gray.50" : "gray.800";
  const subTextColor = isDark ? "gray.400" : "gray.500";

  const dispatchDashboardData = useCallback(
    (force = false) =>
      Promise.all([
        dispatch(fetchServiceBookings({ force }))
          .unwrap()
          .catch((error) => {
            console.warn("Service bookings fetch warning:", error);
          }),
        dispatch(fetchProductBookings({ force }))
          .unwrap()
          .catch((error) => {
            console.warn("Product bookings fetch warning:", error);
          }),
        dispatch(fetchCategories({ categoryType: "service", force }))
          .unwrap()
          .catch((error) => {
            console.warn("Service categories fetch warning:", error);
          }),
        dispatch(fetchCategories({ categoryType: "product", force }))
          .unwrap()
          .catch((error) => {
            console.warn("Product categories fetch warning:", error);
          }),
        dispatch(fetchProducts({ force }))
          .unwrap()
          .catch((error) => {
            console.warn("Products fetch warning:", error);
          }),
      ]),
    [dispatch]
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!hasExistingData) {
        setLoading(true);
      }
      try {
        const [, insightData] = await Promise.all([
          dispatchDashboardData(false),
          fetchDashboardInsights(false),
        ]);
        if (isMounted) {
          setInsights(insightData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [dispatchDashboardData, hasExistingData]);

  const serviceAnalytics = useMemo(
    () => buildDomainAnalytics(serviceBookings, serviceCategories, "service"),
    [serviceBookings, serviceCategories]
  );

  const productAnalytics = useMemo(
    () => buildDomainAnalytics(productBookings, productCategories, "product"),
    [productBookings, productCategories]
  );

  const catalog = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return {
      total: list.length,
      active: list.filter(isActiveCatalogItem).length,
    };
  }, [products]);

  const monthlyTrend = useMemo(() => {
    const base = buildMonthlyTrend(serviceBookings, productBookings, 6);
    if (!insights) return base;

    const serviceSeries = normalizeMonthlySeries(
      insights.serviceEarnings,
      base
    );
    const productSeries = normalizeMonthlySeries(insights.salesRows, base);

    return base.map((month, index) => {
      const apiService = serviceSeries?.[index];
      const apiProduct = productSeries?.[index];
      const serviceRevenue = apiService?.revenue ?? month.serviceRevenue;
      const productRevenue = apiProduct?.revenue ?? month.productRevenue;
      const serviceBookingsForMonth =
        month.serviceBookings || apiService?.bookings || 0;
      const productBookingsForMonth =
        month.productBookings || apiProduct?.bookings || 0;

      return {
        ...month,
        serviceRevenue,
        productRevenue,
        serviceBookings: serviceBookingsForMonth,
        productBookings: productBookingsForMonth,
        totalRevenue: serviceRevenue + productRevenue,
        totalBookings: serviceBookingsForMonth + productBookingsForMonth,
      };
    });
  }, [serviceBookings, productBookings, insights]);

  const kpiData = useMemo(() => {
    const apiServiceRevenue = insights?.finance?.revenue || 0;
    const apiProductRevenue = insights?.product?.revenue || 0;
    const serviceRevenue =
      apiServiceRevenue > 0 ? apiServiceRevenue : serviceAnalytics.revenue;
    const productRevenue =
      apiProductRevenue > 0 ? apiProductRevenue : productAnalytics.revenue;

    const apiServiceBookings = insights?.finance?.bookings || 0;
    const apiProductBookings = insights?.product?.bookings || 0;
    const serviceBookingsCount =
      apiServiceBookings > 0
        ? apiServiceBookings
        : serviceAnalytics.totalBookings;
    const productBookingsCount =
      apiProductBookings > 0
        ? apiProductBookings
        : productAnalytics.totalBookings;

    const apiServicePaid = insights?.finance?.paidCount || 0;
    const apiProductPaid = insights?.product?.paidCount || 0;
    const servicePaid =
      apiServicePaid > 0
        ? apiServicePaid
        : serviceAnalytics.successPayments;
    const productPaid =
      apiProductPaid > 0
        ? apiProductPaid
        : productAnalytics.successPayments;

    const totalBookings = serviceBookingsCount + productBookingsCount;
    const successPayments = servicePaid + productPaid;
    const totalRevenue = serviceRevenue + productRevenue;
    const successRate =
      totalBookings > 0 ? (successPayments / totalBookings) * 100 : 0;

    const currentMonth = monthlyTrend[monthlyTrend.length - 1] || {};
    const previousMonth = monthlyTrend[monthlyTrend.length - 2] || {};

    return {
      totalBookings,
      successPayments,
      totalRevenue,
      successRate,
      serviceBookings: serviceBookingsCount,
      productBookings: productBookingsCount,
      serviceRevenue,
      productRevenue,
      serviceCategories: serviceAnalytics.categoryCount,
      activeProducts:
        insights?.product?.products > 0
          ? insights.product.products
          : catalog.active,
      revenueTrend: percentChange(
        currentMonth.totalRevenue,
        previousMonth.totalRevenue
      ),
      bookingsTrend: percentChange(
        currentMonth.totalBookings,
        previousMonth.totalBookings
      ),
      successTrend: percentChange(
        currentMonth.totalSuccess,
        previousMonth.totalSuccess
      ),
    };
  }, [serviceAnalytics, productAnalytics, monthlyTrend, insights, catalog]);

  const recentActivity = useMemo(() => {
    const combined = [
      ...(Array.isArray(serviceBookings)
        ? serviceBookings.map((booking) => ({ booking, kind: "service" }))
        : []),
      ...(Array.isArray(productBookings)
        ? productBookings.map((booking) => ({ booking, kind: "product" }))
        : []),
    ];

    return combined
      .sort((a, b) => {
        const dateA = new Date(
          a.booking?.createdAt || a.booking?.scheduledAt || 0
        ).getTime();
        const dateB = new Date(
          b.booking?.createdAt || b.booking?.scheduledAt || 0
        ).getTime();
        return (dateB || 0) - (dateA || 0);
      })
      .slice(0, 8);
  }, [serviceBookings, productBookings]);

  if (loading) {
    return <LoadingState label="Loading Dashboard..." />;
  }

  return (
    <Box
      pt={{ base: "120px", md: "75px" }}
      pb={{ base: 6, md: 8 }}
      px={{ base: 2, md: 4, lg: 6 }}
    >
      <Stack spacing={{ base: 5, md: 6 }} maxW="1600px" mx="auto">
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3, xl: 5 }}
          spacing={{ base: 3, md: 4 }}
        >
          <KpiTile
            label="Total Revenue"
            value={formatCurrency(kpiData.totalRevenue)}
            icon={FaRupeeSign}
            subValue={`Svc ${formatCompactCurrency(
              kpiData.serviceRevenue
            )} · Prod ${formatCompactCurrency(kpiData.productRevenue)}`}
            trend={kpiData.revenueTrend}
          />
          <KpiTile
            label="Total Bookings"
            value={kpiData.totalBookings.toLocaleString("en-IN")}
            icon={FaCalendarCheck}
            subValue={`${kpiData.serviceBookings} services · ${kpiData.productBookings} products`}
            trend={kpiData.bookingsTrend}
          />
          <KpiTile
            label="Paid Bookings"
            value={kpiData.successPayments.toLocaleString("en-IN")}
            icon={FaCheckCircle}
            subValue={`${kpiData.successRate.toFixed(1)}% success rate`}
            trend={kpiData.successTrend}
          />
          <KpiTile
            label="Service Categories"
            value={kpiData.serviceCategories.toLocaleString("en-IN")}
            icon={FaTools}
            subValue={`${kpiData.serviceBookings} service bookings`}
          />
          <KpiTile
            label="Active Products"
            value={kpiData.activeProducts.toLocaleString("en-IN")}
            icon={FaBoxOpen}
            subValue={`${catalog.total} total in catalogue`}
          />
        </SimpleGrid>

        <SimpleGrid
          columns={{ base: 1, xl: 3 }}
          spacing={{ base: 4, md: 5 }}
          alignItems="stretch"
        >
          <RevenueTrendCard
            months={monthlyTrend}
            gridColumn={{ xl: "span 2" }}
          />
          <RevenueMixCard
            serviceRevenue={kpiData.serviceRevenue}
            productRevenue={kpiData.productRevenue}
          />
        </SimpleGrid>

        <Box>
          <Flex
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            direction={{ base: "column", sm: "row" }}
            gap={2}
            mb={3}
          >
            <Box>
              <Heading
                size="sm"
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="800"
                color={textColor}
                letterSpacing="-0.02em"
              >
                Category Performance
              </Heading>
              <Text fontSize="xs" color={subTextColor}>
                Compare service and product categories side by side
              </Text>
            </Box>
            <Text
              fontSize="2xs"
              fontWeight="800"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={subTextColor}
            >
              All time
            </Text>
          </Flex>

          <SimpleGrid
            columns={{ base: 1, xl: 2 }}
            spacing={{ base: 4, md: 5 }}
            alignItems="stretch"
          >
            <CategoryPerformancePanel
              kind="service"
              title="Service Performance"
              subtitle="Service catalogue and booking revenue"
              icon={FaTools}
              analytics={serviceAnalytics}
              revenue={kpiData.serviceRevenue}
              totalRevenue={kpiData.totalRevenue}
            />
            <CategoryPerformancePanel
              kind="product"
              title="Product Performance"
              subtitle="Product catalogue and order revenue"
              icon={FaBoxOpen}
              analytics={productAnalytics}
              revenue={kpiData.productRevenue}
              totalRevenue={kpiData.totalRevenue}
              catalog={catalog}
            />
          </SimpleGrid>
        </Box>

        <RecentBookingsCard items={recentActivity} />
      </Stack>
    </Box>
  );
}
