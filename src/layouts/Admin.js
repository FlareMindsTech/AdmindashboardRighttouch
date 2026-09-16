// Admin.js - OWNER ONLY ACCESS
import {
  Portal,
  useDisclosure,
  Stack,
  Box,
  useColorMode,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import FlareLogo from "assets/img/Right_Touch.png";
import Sidebar, { SidebarResponsive } from "components/Sidebar/Sidebar.js";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import routes from "routes.js";
import FixedPlugin from "components/FixedPlugin/FixedPlugin";
import MainPanel from "components/Layout/MainPanel";
import PanelContainer from "components/Layout/PanelContainer";
import PanelContent from "components/Layout/PanelContent";

import { getToken, getUser } from "views/utils/axiosInstance";

export default function Dashboard(props) {
  const { ...rest } = props;
  const [fixed, setFixed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const { isOpen: isPluginOpen, onOpen: onPluginOpen, onClose: onPluginClose } = useDisclosure();

  document.documentElement.dir = "ltr";

  useEffect(() => {
    const token = getToken();
    const userData = getUser();

    if (!token || !userData) {
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    const role = userData?.role?.toLowerCase() || "";
    setUserRole(role);
    setIsLoading(false);
  }, []);

  // Filter routes for sidebar - ONLY OWNER ROUTES
  const filteredRoutes = useMemo(() => {
    if (!userRole) return [];

    const filterRoutes = (routesArray) => {
      return routesArray
        .filter((route) => {
          if (route.collapse) return true;

          // Skip auth routes
          if (route.layout === "/auth") return false;

          // 🔐 ONLY allow /owner layout for owners
          if (route.layout === "/owner") {
            return userRole === "owner";
          }

          // 🔴 REJECT /admin layout completely
          if (route.layout === "/admin") {
            return false;
          }

          // Check role restrictions if specified
          if (route.roles && Array.isArray(route.roles)) {
            return route.roles.includes(userRole);
          }

          return false; // Default to not showing
        })
        .map((route) => {
          if (route.collapse && route.views) {
            const filteredViews = filterRoutes(route.views);
            if (filteredViews.length === 0) return null;
            return { ...route, views: filteredViews };
          }
          return route;
        })
        .filter(Boolean);
    };

    return filterRoutes(routes);
  }, [userRole]);

  // Get all accessible routes - ONLY OWNER ROUTES
  const accessibleRoutes = useMemo(() => {
    if (!userRole || userRole !== "owner") return [];

    const extractRoutes = (routesArray) => {
      const result = [];

      routesArray.forEach(route => {
        if (route.collapse && route.views) {
          result.push(...extractRoutes(route.views));
        } else if (route.element && route.path) {
          // 🔐 ONLY include /owner layout routes
          if (route.layout === "/owner") {
            result.push({
              path: route.path,
              element: route.element,
              key: `${route.layout}${route.path}`
            });
          }
        }
      });

      return result;
    };

    return extractRoutes(routes);
  }, [userRole]);

  // Render routes - ONLY OWNER ACCESS
  const renderRoutes = () => {
    if (isLoading) return null;

    // 🔐 STRICT CHECK: ONLY OWNER CAN ACCESS
    if (!userRole || userRole !== "owner") {
      return <Route path="*" element={<Navigate to="/auth/signin" replace />} />;
    }

    // ✅ OWNER CAN ACCESS ONLY /owner ROUTES
    return (
      <>
        {/* Render all accessible owner routes */}
        {accessibleRoutes.map((route) => (
          <Route
            key={route.key}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Catch-all for unmatched routes */}
        <Route
          path="*"
          element={<Navigate to="/owner/dashboard" replace />}
        />
      </>
    );
  };

  // Get active route for navbar
  const getActiveRoute = () => {
    const currentPath = location.pathname;

    const findRoute = (routesArray) => {
      for (const route of routesArray) {
        if (route.collapse && route.views) {
          const found = findRoute(route.views);
          if (found) return found;
        } else if (route.path && route.layout) {
          // Only consider /owner layout routes
          if (route.layout === "/owner") {
            const routePath = `${route.layout}${route.path}`;
            if (currentPath.includes(routePath) || currentPath === route.path) {
              return route.name || "Dashboard";
            }
          }
        }
      }
      return "Dashboard";
    };

    return findRoute(routes);
  };

  // Redirect non-owners check is handled in the render phase
  useEffect(() => {
    // Legacy redirect logic removed in favor of strict render-time redirection
  }, [isLoading, userRole, location.pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        Loading...
      </Box>
    );
  }

  // 🔐 STRICT ACCESS CONTROL: ONLY OWNER
  if (userRole !== "owner") {
    clearAuth();
    return <Navigate to="/auth/signin" replace />;
  }

  // ✅ ONLY OWNER SEES THIS
  return (
    <Box>
      <Box
        minH={{
          base: "12vh",
          sm: "13vh",
          md: "14vh",
          lg: "15vh",
          xl: "15vh",
          "2xl": "15vh"
        }}
        w="100%"
        position="fixed"
        bgSize="cover"
        top="0"
      />

      {/* Mobile Sidebar - ONLY OWNER ROUTES */}
      <SidebarResponsive
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            <Image
              src={FlareLogo}
              alt="Flare Logo"
              w={{ base: "80px", sm: "90px", md: "100px" }}
              h="auto"
            />
            <Box w="1px" h="20px" />
          </Stack>
        }
        routes={filteredRoutes.filter(r => r.layout !== "/auth")}
        hamburgerColor="white"
        isOpen={isSidebarOpen}
        onOpen={onSidebarOpen}
        onClose={onSidebarClose}
      />

      {/* Desktop Sidebar - ONLY OWNER ROUTES */}
      <Sidebar
        routes={filteredRoutes.filter(r => r.layout !== "/auth")}
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            <Image
              src={FlareLogo}
              alt="Flare Logo"
              w={{ base: "120px", sm: "90px", md: "100px", lg: "100px", xl: "100px" }}
              h="8vh"
            />
            <Box w="1px" h="20px" />
          </Stack>
        }
        {...rest}
      />

      <MainPanel
        maxH="100vh"
        minH="100vh"
        overflowX="hidden"
        overflowY="auto"
        w={{ base: "100%", sm: "100%", md: "100%", lg: "calc(100% - 300px)", xl: "calc(100% - 310px)", "2xl": "calc(100% - 310px)" }}
        transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
        css={{
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "10px" },
          "&:hover::-webkit-scrollbar-thumb": { background: "#94a3b8" },
        }}
      >
        <Portal>
          <AdminNavbar
            onOpen={onSidebarOpen}
            brandText={getActiveRoute()}
            secondary={false}
            fixed={fixed}
            {...rest}
          />
        </Portal>

        <PanelContent>
          <PanelContainer
            px={{ base: "15px", sm: "20px", md: "25px", lg: "30px", xl: "35px" }}
            py={{ base: "15px", sm: "20px", md: "25px", lg: "30px", xl: "35px" }}
          >
            <React.Suspense
              fallback={
                <Flex justify="center" align="center" minH="60vh" w="100%">
                  <Spinner size="xl" color="#008080" thickness="4px" speed="0.65s" emptyColor="gray.200" />
                </Flex>
              }
            >
              <Routes>
                {renderRoutes()}
                {/* Default route */}
                <Route path="/" element={<Navigate to="/owner/dashboard" replace />} />
              </Routes>
            </React.Suspense>
          </PanelContainer>
        </PanelContent>

        <Portal>
          <FixedPlugin
            secondary={false}
            fixed={fixed}
            onOpen={onPluginOpen}
          />
        </Portal>
      </MainPanel>
    </Box>
  );
}
