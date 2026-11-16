// Admin.js - OWNER/ADMIN ACCESS
import {
  Portal,
  useDisclosure,
  Stack,
  Box,
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

import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  initializeAuth,
  isPrivilegedRole,
  selectRole,
  selectAuthInitialized,
  logout,
} from "store/slices/authSlice";
import { clearAuth } from "views/utils/axiosInstance";
import { useNotificationCoordinator } from "hooks/useNotificationCoordinator";
import { useAdminSocket } from "hooks/useAdminSocket";

export default function Dashboard(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const dispatch = useAppDispatch();
  // Canonical auth state (Phase 2): restored once from legacy storage by
  // initializeAuth (also dispatched at entry in index.js — idempotent).
  const userRole = useAppSelector(selectRole);
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isLoading = !authInitialized;
  const location = useLocation();

  // Phase 3: single notification refresh coordinator for privileged sessions.
  // Owns the badge/inbox-count polling + cross-tab sync; unmounts on logout.
  useNotificationCoordinator();
  useAdminSocket();

  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const { onOpen: onPluginOpen } = useDisclosure();

  document.documentElement.dir = "ltr";

  useEffect(() => {
    // Idempotent restore (index.js already dispatched once at entry).
    // Keeps direct navigation / hard refresh working without a flash of
    // protected content: guards below wait for `initialized`.
    dispatch(initializeAuth());
  }, [dispatch]);

  const canAccessRoute = React.useCallback(
    (route) => {
      if (!route || route.layout !== "/owner") return false;
      if (Array.isArray(route.roles)) return route.roles.includes(userRole);
      return isPrivilegedRole(userRole);
    },
    [userRole]
  );

  // Filter routes for sidebar - privileged dashboard routes only.
  const filteredRoutes = useMemo(() => {
    if (!userRole) return [];

    const filterRoutes = (routesArray) => {
      return routesArray
        .filter((route) => {
          if (route.collapse) return true;
          return canAccessRoute(route);
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
  }, [canAccessRoute, userRole]);

  // Get all accessible dashboard routes for the current role.
  const accessibleRoutes = useMemo(() => {
    if (!isPrivilegedRole(userRole)) return [];

    const extractRoutes = (routesArray) => {
      const result = [];

      routesArray.forEach(route => {
        if (route.collapse && route.views) {
          result.push(...extractRoutes(route.views));
        } else if (route.element && route.path && canAccessRoute(route)) {
          result.push({
            path: route.path,
            element: route.element,
            key: `${route.layout}${route.path}`
          });
        }
      });

      return result;
    };

    return extractRoutes(routes);
  }, [canAccessRoute, userRole]);

  // Render routes for the current privileged role.
  const renderRoutes = () => {
    if (isLoading) return null;

    if (!isPrivilegedRole(userRole)) {
      return <Route path="*" element={<Navigate to="/auth/signin" replace />} />;
    }

    return (
      <>
        {/* Render all routes accessible to the current role */}
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

  // Get active route for navbar (memoized by pathname)
  const brandText = useMemo(() => {
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
  }, [location.pathname]);

  const mobileLogo = useMemo(
    () => (
      <Stack direction="row" spacing="12px" align="center" justify="center">
        <Image
          src={FlareLogo}
          alt="Flare Logo"
          w={{ base: "80px", sm: "90px", md: "100px" }}
          h="auto"
        />
        <Box w="1px" h="20px" />
      </Stack>
    ),
    []
  );

  const desktopLogo = useMemo(
    () => (
      <Stack direction="row" spacing="12px" align="center" justify="center">
        <Image
          src={FlareLogo}
          alt="Flare Logo"
          w={{ base: "120px", sm: "90px", md: "100px", lg: "100px", xl: "100px" }}
          h="8vh"
        />
        <Box w="1px" h="20px" />
      </Stack>
    ),
    []
  );

  // Redirect non-privileged sessions safely inside useEffect.
  useEffect(() => {
    if (authInitialized && !isPrivilegedRole(userRole)) {
      try {
        dispatch(logout());
      } catch (e) {
        clearAuth();
      }
    }
  }, [authInitialized, userRole, dispatch]);

  // Show loading state while auth is restoring
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        Loading...
      </Box>
    );
  }

  if (!isPrivilegedRole(userRole)) {
    return <Navigate to="/auth/signin" replace />;
  }
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

      {/* Mobile Sidebar - role-filtered routes */}
      <SidebarResponsive
        logo={mobileLogo}
        routes={filteredRoutes}
        hamburgerColor="white"
        isOpen={isSidebarOpen}
        onOpen={onSidebarOpen}
        onClose={onSidebarClose}
      />

      {/* Desktop Sidebar - role-filtered routes */}
      <Sidebar
        routes={filteredRoutes}
        logo={desktopLogo}
        {...rest}
      />

      <MainPanel
        id="main-panel"
        maxH="100vh"
        minH="100vh"
        overflowX="hidden"
        overflowY="auto"
        w={{ base: "100%", sm: "100%", md: "100%", lg: "calc(100% - 390px)", xl: "calc(100% - 410px)", "2xl": "calc(100% - 410px)" }}
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
            brandText={brandText}
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
