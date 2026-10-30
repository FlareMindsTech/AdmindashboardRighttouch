/* eslint-disable */
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Image,
  Badge,
  Link,
} from "@chakra-ui/react";
import IconBox from "components/Icons/IconBox";
import {
  renderThumbDark,
  renderThumbLight,
  renderTrack,
  renderTrackRTL,
  renderView,
  renderViewRTL,
} from "components/Scrollbar/Scrollbar";
import { HSeparator } from "components/Separator/Separator";
import { SidebarHelp } from "components/Sidebar/SidebarHelp";
import React, { useRef, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { NavLink } from "react-router-dom";
import FlareMindslogo from "assets/img/fm logo.png";

import { useAdminNotificationCounts } from "hooks/useAdminNotificationCounts";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { logout, selectToken } from "store/slices/authSlice";

const Sidebar = React.memo(function Sidebar(props) {
  const { sidebarVariant, logo, routes } = props;
  const mainPanel = React.useRef();
  const variantChange = "0.2s linear";
  const dispatch = useAppDispatch();
  // Subscribed auth token (Phase 2) — replaces direct getToken() reads.
  const authToken = useAppSelector(selectToken);

  const { counts, markModuleRead } = useAdminNotificationCounts();

  const getBadgeCount = (path) => {
    if (path === "/product-management") return counts.productQuoteRequests || 0;
    if (path === "/admin-management") return counts.technicianApplications || 0;
    if (path === "/reports-ratings") return counts.customerReports || 0;
    return 0;
  };

  const getModuleNameForPath = (path) => {
    if (path === "/product-management") return "productQuoteRequests";
    if (path === "/admin-management") return "technicianApplications";
    if (path === "/reports-ratings") return "customerReports";
    return null;
  };

  // Sidebar Container Tokens: Clean, elegant white card (no bulky neumorphic shadow)
  const sidebarContainerBg = useColorModeValue("#FFFFFF", "navy.800");
  const sidebarContainerBorder = useColorModeValue(
    "1px solid rgba(0, 0, 0, 0.06)",
    "1px solid rgba(255, 255, 255, 0.08)"
  );
  const sidebarContainerShadow = useColorModeValue(
    "0px 10px 30px rgba(0, 0, 0, 0.05)",
    "0px 10px 30px rgba(0, 0, 0, 0.4)"
  );
  const sidebarRadius = "10px";
  const sidebarMargins = "0px";

  // Papermorphic Menu Item Tokens ("Inside menus only")
  const paperItemBg = useColorModeValue("#FFFFFF", "navy.700");
  const paperItemBorder = useColorModeValue(
    "1px solid rgba(226, 232, 240, 0.8)",
    "1px solid rgba(255, 255, 255, 0.06)"
  );
  const paperItemShadow = useColorModeValue(
    "0 1px 3px rgba(0, 0, 0, 0.04), 0 3px 8px rgba(0, 0, 0, 0.03)",
    "0 1px 3px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0, 0, 0, 0.2)"
  );
  const paperItemHoverShadow = useColorModeValue(
    "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)",
    "0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)"
  );
  const paperItemHoverBorder = useColorModeValue(
    "1px solid rgba(0, 128, 128, 0.25)",
    "1px solid rgba(0, 128, 128, 0.4)"
  );

  const activePaperBg = useColorModeValue(
    "linear-gradient(135deg, #008f8f 0%, #007373 100%)",
    "linear-gradient(135deg, #008f8f 0%, #006666 100%)"
  );
  const activeColor = "white";
  const activePaperShadow = useColorModeValue(
    "0 4px 14px rgba(0, 128, 128, 0.35), 0 1px 3px rgba(0, 128, 128, 0.2)",
    "0 4px 14px rgba(0, 0, 0, 0.5)"
  );

  const inactiveColor = useColorModeValue("#4A5568", "#CBD5E1");

  // Paper chip icon boxes
  const inactiveIconBg = useColorModeValue("#F7FAFC", "navy.800");
  const inactiveIconBorder = useColorModeValue(
    "1px solid rgba(226, 232, 240, 0.9)",
    "1px solid rgba(255, 255, 255, 0.06)"
  );
  const inactiveIconShadow = useColorModeValue(
    "0 1px 2px rgba(0, 0, 0, 0.03)",
    "none"
  );

  // Footer paper card
  const footerBg = useColorModeValue("#F8FAFC", "navy.700");
  const footerBorder = useColorModeValue(
    "1px solid rgba(226, 232, 240, 0.8)",
    "1px solid rgba(255, 255, 255, 0.06)"
  );
  const footerShadow = useColorModeValue(
    "0 1px 3px rgba(0, 0, 0, 0.02)",
    "none"
  );

  // Desktop logout / signin dialog state
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSigninPromptOpen, setIsSigninPromptOpen] = useState(false);
  const logoutCancelRef = useRef();
  const signinCancelRef = useRef();
  const toast = useToast();

  const openLogout = () => setIsLogoutOpen(true);
  const closeLogout = () => setIsLogoutOpen(false);
  const openSigninPrompt = () => setIsSigninPromptOpen(true);
  const closeSigninPrompt = () => setIsSigninPromptOpen(false);

  const handleConfirmLogout = () => {
    try {
      closeLogout();
      // Canonical logout: clears legacy storage (same cleanup as before)
      // and resets Redux auth state.
      dispatch(logout());
      toast({
        title: "Logged out successfully",
        description: "Redirecting to the sign-in page...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      const base = window.location.origin + window.location.pathname;
      window.location.replace(`${base}#/auth/signin`);
    } catch (err) {
      toast({
        title: "Logout failed",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleGoToSignIn = () => {
    closeSigninPrompt();
    const base = window.location.origin + window.location.pathname;
    window.location.replace(`${base}#/auth/signin`);
  };

  const createLinks = (routes) =>
    routes.map((prop, key) => {
      if (prop.redirect || prop.hideInSidebar) return null;

      if (prop.category) {
        return (
          <React.Fragment key={key}>
            <Text
              color={activeColor}
              fontWeight="bold"
              mb={{
                base: "4px",    // 320px - 480px
                sm: "5px",      // 481px - 767px
                md: "6px",      // 768px - 1024px
                lg: "6px",      // 1025px - 1280px
                xl: "6px"       // 1281px +
              }}
              mx="auto"
              ps={{
                base: "8px",    // 320px - 480px
                sm: "9px",      // 481px - 767px
                md: "10px",     // 768px - 1024px
                lg: "12px",     // 1025px - 1280px
                xl: "16px"      // 1281px +
              }}
              py={{
                base: "8px",    // 320px - 480px
                sm: "10px",     // 481px - 767px
                md: "12px",     // 768px - 1024px
                lg: "12px",     // 1025px - 1280px
                xl: "12px"      // 1281px +
              }}
              fontSize={{
                base: "xs",     // 320px - 480px
                sm: "sm",       // 481px - 767px
                md: "sm",       // 768px - 1024px
                lg: "sm",       // 1025px - 1280px
                xl: "sm"        // 1281px +
              }}
            >
              {document.documentElement.dir === "rtl" ? prop.rtlName : prop.name}
            </Text>
            {createLinks(prop.views)}
          </React.Fragment>
        );
      }

      if (!prop.icon) return null;

      // If logout route, intercept and show dialogs
      if (prop.path === "/logout") {
        return (
          <Button
            key={key}
            boxSize="initial"
            justifyContent="flex-start"
            alignItems="center"
            mb={{ base: "8px", md: "10px" }}
            mx="auto"
            ps={{ base: "10px", md: "14px" }}
            py={{ base: "10px", md: "12px" }}
            borderRadius="6px"
            w="100%"
            bg={paperItemBg}
            color={useColorModeValue("#E53E3E", "#FC8181")}
            boxShadow={paperItemShadow}
            border={paperItemBorder}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: useColorModeValue("#FFF5F5", "#2D1D1D"),
              borderColor: useColorModeValue("#FED7D7", "#742A2A"),
              boxShadow: paperItemHoverShadow,
              transform: "translateY(-1.5px)",
            }}
            _active={{
              transform: "translateY(1px)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
            _focus={{ boxShadow: "none" }}
            onClick={() => {
              if (!authToken) {
                // If not logged in, prompt to go to sign-in
                openSigninPrompt();
                return;
              }
              openLogout();
            }}
          >
            <Flex align="center">
              <IconBox
                bg={useColorModeValue("#FFF5F5", "#2D1D1D")}
                color={"#E53E3E"}
                h="32px"
                w="32px"
                borderRadius="6px"
                border="1px solid"
                borderColor={useColorModeValue("#FED7D7", "#742A2A")}
                boxShadow={inactiveIconShadow}
                me="12px"
                transition="all 0.2s ease-in-out"
                flexShrink={0}
              >
                {prop.icon}
              </IconBox>
              <Text my="auto" fontSize={{ base: "xs", sm: "sm" }} fontWeight="600">
                {document.documentElement.dir === "rtl" ? prop.rtlName : prop.name}
              </Text>
            </Flex>
          </Button>
        );
      }

      const count = getBadgeCount(prop.path);
      const modName = getModuleNameForPath(prop.path);

      return (
        <NavLink
          to={prop.layout + prop.path}
          key={key}
          onClick={() => {
            if (modName && count > 0) {
              markModuleRead(modName, null, true);
            }
          }}
        >
          {({ isActive }) => (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              mb={{
                base: "8px",
                md: "10px",
              }}
              mx="auto"
              ps={{
                base: "10px",
                md: "12px",
              }}
              pe={{
                base: "10px",
                md: "10px",
              }}
              py={{
                base: "10px",
                md: "12px",
              }}
              borderRadius="6px"
              w="100%"
              bg={isActive ? activePaperBg : paperItemBg}
              color={isActive ? activeColor : inactiveColor}
              boxShadow={isActive ? activePaperShadow : paperItemShadow}
              border={isActive ? "1px solid rgba(0, 128, 128, 0.2)" : paperItemBorder}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                bg: isActive ? activePaperBg : paperItemBg,
                boxShadow: isActive ? activePaperShadow : paperItemHoverShadow,
                borderColor: isActive ? "rgba(0, 128, 128, 0.3)" : paperItemHoverBorder,
                color: isActive ? activeColor : "#008080",
                transform: isActive ? "none" : "translateY(-1.5px)",
              }}
              _active={{
                transform: "translateY(1px)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
              _focus={{ boxShadow: "none" }}
            >
              <Flex align="center" justify="space-between" w="100%" minW="0" gap={2}>
                <Flex align="center" minW="0" flex="1">
                  <IconBox
                    bg={isActive ? "white" : inactiveIconBg}
                    color={"#008080"}
                    h="32px"
                    w="32px"
                    borderRadius="6px"
                    border={isActive ? "none" : inactiveIconBorder}
                    boxShadow={
                      isActive
                        ? "0 2px 5px rgba(0, 0, 0, 0.08)"
                        : inactiveIconShadow
                    }
                    me="12px"
                    transition="all 0.2s ease-in-out"
                    flexShrink={0}
                  >
                    {prop.icon}
                  </IconBox>
                  <Text
                    my="auto"
                    fontSize={{
                      base: "xs",
                      sm: "sm",
                    }}
                    fontWeight={isActive ? "700" : "600"}
                    letterSpacing="0.2px"
                    noOfLines={1}
                    isTruncated
                  >
                    {document.documentElement.dir === "rtl"
                      ? prop.rtlName
                      : prop.name}
                  </Text>
                </Flex>
                {count > 0 && (
                  <Badge
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    minW="20px"
                    h="20px"
                    px={count > 9 ? "6px" : "4px"}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="800"
                    lineHeight="1"
                    bg={isActive ? "white" : "#008080"}
                    color={isActive ? "#008080" : "white"}
                    boxShadow={
                      isActive
                        ? "0 2px 4px rgba(0, 0, 0, 0.12)"
                        : "0 1px 3px rgba(0, 128, 128, 0.35)"
                    }
                    flexShrink={0}
                  >
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </Flex>
            </Button>
          )}
        </NavLink>
      );
    });

  const links = <>{createLinks(routes)}</>;

  const brand = (
    <Box pt={{
      base: "15px",  // 320px - 480px
      sm: "20px",    // 481px - 767px
      md: "25px",    // 768px - 1024px
      lg: "25px",    // 1025px - 1280px
      xl: "25px"     // 1281px +
    }} mb={{
      base: "8px",   // 320px - 480px
      sm: "10px",    // 481px - 767px
      md: "12px",    // 768px - 1024px
      lg: "12px",    // 1025px - 1280px
      xl: "12px"     // 1281px +
    }}>
      {logo}
      <HSeparator my={{
        base: "20px", // 320px - 480px
        sm: "22px",   // 481px - 767px
        md: "24px",   // 768px - 1024px
        lg: "26px",   // 1025px - 1280px
        xl: "26px"    // 1281px +
      }} />
    </Box>
  );

  return (
    <Box ref={mainPanel}>
      {/* Desktop Sidebar - Show on lg screens and above */}
      <Box
        display={{
          base: "none",  // 320px - 480px
          sm: "none",    // 481px - 767px
          md: "none",    // 768px - 1024px
          lg: "block",   // 1025px - 1280px
          xl: "block"    // 1281px +
        }}
        position="fixed"
        top={{
          base: "40px",  // 320px - 480px
          sm: "45px",    // 481px - 767px
          md: "50px",    // 768px - 1024px
          lg: "50px",    // 1025px - 1280px
          xl: "50px"     // 1281px +
        }}
        left={{
          base: "12px",  // 320px - 480px
          sm: "14px",    // 481px - 767px
          md: "16px",    // 768px - 1024px
          lg: "16px",    // 1025px - 1280px
          xl: "16px"     // 1281px +
        }}
        zIndex="1200"
      >
        <Box
          bg={sidebarContainerBg}
          boxShadow={sidebarContainerShadow}
          border={sidebarContainerBorder}
          transition={variantChange}
          w={{
            base: "260px",
            sm: "270px",
            md: "295px",
            lg: "315px",
            xl: "315px"
          }}
          maxW={{
            base: "260px",
            sm: "270px",
            md: "295px",
            lg: "315px",
            xl: "315px"
          }}
          h={{
            base: "calc(100vh - 60px)",  // 320px - 480px
            sm: "calc(100vh - 65px)",    // 481px - 767px
            md: "calc(100vh - 66px)",    // 768px - 1024px
            lg: "calc(100vh - 66px)",    // 1025px - 1280px
            xl: "calc(100vh - 66px)"     // 1281px +
          }}
          ps={{
            base: "14px",
            sm: "16px",
            md: "18px",
            lg: "18px",
            xl: "18px"
          }}
          pe={{
            base: "14px",
            sm: "16px",
            md: "18px",
            lg: "18px",
            xl: "18px"
          }}
          m={sidebarMargins}
          borderRadius={sidebarRadius}
          display="flex"
          flexDirection="column"
        >
          <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
            <Box>{brand}</Box>
            <Stack direction="column" mb={{
              base: "30px", // 320px - 480px
              sm: "35px",   // 481px - 767px
              md: "40px",   // 768px - 1024px
              lg: "40px",   // 1025px - 1280px
              xl: "40px"    // 1281px +
            }} flex="1" overflow="hidden">
              <Scrollbars
                autoHide
                renderTrackVertical={renderTrack}
                renderThumbVertical={useColorModeValue(renderThumbLight, renderThumbDark)}
                renderView={
                  document.documentElement.dir === "rtl"
                    ? renderViewRTL
                    : renderView
                }
                style={{ width: "100%", height: "100%" }}
              >
                <Box pe="10px" pb="30px">
                  {links}
                </Box>
              </Scrollbars>
            </Stack>
          </Box>
          <Box
            textAlign="center"
            py="10px"
            px="14px"
            my="10px"
            borderRadius="6px"
            bg={footerBg}
            border={footerBorder}
            boxShadow={footerShadow}
            flexShrink={0}
          >
            <Flex align="center" justify="center">
              <Link
                href="https://flaremindstech.com/"
                target="_blank"
                rel="noopener noreferrer"
                _hover={{ textDecoration: "none", opacity: 0.85 }}
              >
                <Text
                  fontSize={{ base: "11px", sm: "12px" }}
                  color={inactiveColor}
                  fontWeight="500"
                  display="flex"
                  alignItems="center"
                  gap="6px"
                  whiteSpace="nowrap"
                >
                  Made by
                  <Image
                    src={FlareMindslogo}
                    alt="FlareMinds Logo"
                    boxSize="18px"
                    objectFit="contain"
                  />
                  <Text as="span" fontWeight="700" color="#008080">
                    FlareMinds Tech PVT LTD
                  </Text>
                </Text>
              </Link>
            </Flex>
          </Box>


        </Box>
      </Box>
      {/* Sign-in prompt dialog (when user clicks Logout but not logged in) */}
      <AlertDialog isOpen={isSigninPromptOpen} leastDestructiveRef={signinCancelRef} onClose={closeSigninPrompt} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#008080">
              Not signed in
            </AlertDialogHeader>
            <AlertDialogBody>
              You are not signed in yet. Do you want to go to the Sign-in page?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={signinCancelRef} onClick={closeSigninPrompt} variant="ghost">Cancel</Button>
              <Button colorScheme="purple" onClick={handleGoToSignIn} ml={3}>Go to Sign In</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Logout confirmation dialog (desktop) */}
      <AlertDialog isOpen={isLogoutOpen} leastDestructiveRef={logoutCancelRef} onClose={closeLogout} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#008080">
              Confirm Logout
            </AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to log out?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={logoutCancelRef} onClick={closeLogout} variant="ghost">Cancel</Button>
              <Button colorScheme="red" onClick={handleConfirmLogout} ml={3}>Sign Out</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

// ✅ Responsive Sidebar - FIXED VERSION
export const SidebarResponsive = React.memo(function SidebarResponsive(props) {
  const { logo, routes, hamburgerColor, isOpen, onOpen, onClose } = props;
  const mainPanel = React.useRef();
  const dispatchResp = useAppDispatch();
  // Subscribed auth token (Phase 2) — replaces direct getToken() reads.
  const authTokenResp = useAppSelector(selectToken);

  const { counts, markModuleRead } = useAdminNotificationCounts();

  const getBadgeCount = (path) => {
    if (path === "/product-management") return counts.productQuoteRequests || 0;
    if (path === "/admin-management") return counts.technicianApplications || 0;
    if (path === "/reports-ratings") return counts.customerReports || 0;
    return 0;
  };

  const getModuleNameForPath = (path) => {
    if (path === "/product-management") return "productQuoteRequests";
    if (path === "/admin-management") return "technicianApplications";
    if (path === "/reports-ratings") return "customerReports";
    return null;
  };

  // Logout / signin state for responsive drawer
  const [isLogoutOpenResp, setIsLogoutOpenResp] = useState(false);
  const [isSigninPromptOpenResp, setIsSigninPromptOpenResp] = useState(false);
  const logoutCancelRefResp = useRef();
  const signinCancelRefResp = useRef();
  const toastResp = useToast();

  const openLogoutResp = () => setIsLogoutOpenResp(true);
  const closeLogoutResp = () => setIsLogoutOpenResp(false);
  const openSigninPromptResp = () => setIsSigninPromptOpenResp(true);
  const closeSigninPromptResp = () => setIsSigninPromptOpenResp(false);

  const handleConfirmLogoutResp = () => {
    try {
      closeLogoutResp();
      if (onClose) onClose();
      // Canonical logout: clears legacy storage (same cleanup as before)
      // and resets Redux auth state.
      dispatchResp(logout());
      toastResp({
        title: "Logged out successfully",
        description: "Redirecting to the sign-in page...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      const base = window.location.origin + window.location.pathname;
      window.location.replace(`${base}#/auth/signin`);
    } catch (err) {
      toastResp({
        title: "Logout failed",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleGoToSignInResp = () => {
    closeSigninPromptResp();
    if (onClose) onClose();
    const base = window.location.origin + window.location.pathname;
    window.location.replace(`${base}#/auth/signin`);
  };

  // Sidebar Container Tokens: Clean, elegant white card (no bulky neumorphic shadow)
  const sidebarContainerBg = useColorModeValue("#FFFFFF", "navy.800");
  const sidebarContainerBorder = useColorModeValue(
    "1px solid rgba(0, 0, 0, 0.06)",
    "1px solid rgba(255, 255, 255, 0.08)"
  );
  const sidebarContainerShadow = useColorModeValue(
    "0px 10px 30px rgba(0, 0, 0, 0.05)",
    "0px 10px 30px rgba(0, 0, 0, 0.4)"
  );

  // Papermorphic Menu Item Tokens ("Inside menus only")
  const paperItemBg = useColorModeValue("#FFFFFF", "navy.700");
  const paperItemBorder = useColorModeValue(
    "1px solid rgba(226, 232, 240, 0.8)",
    "1px solid rgba(255, 255, 255, 0.06)"
  );
  const paperItemShadow = useColorModeValue(
    "0 1px 3px rgba(0, 0, 0, 0.04), 0 3px 8px rgba(0, 0, 0, 0.03)",
    "0 1px 3px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0, 0, 0, 0.2)"
  );
  const paperItemHoverShadow = useColorModeValue(
    "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)",
    "0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)"
  );
  const paperItemHoverBorder = useColorModeValue(
    "1px solid rgba(0, 128, 128, 0.25)",
    "1px solid rgba(0, 128, 128, 0.4)"
  );

  const activePaperBg = useColorModeValue(
    "linear-gradient(135deg, #008f8f 0%, #007373 100%)",
    "linear-gradient(135deg, #008f8f 0%, #006666 100%)"
  );
  const activeColor = "white";
  const activePaperShadow = useColorModeValue(
    "0 4px 14px rgba(0, 128, 128, 0.35), 0 1px 3px rgba(0, 128, 128, 0.2)",
    "0 4px 14px rgba(0, 0, 0, 0.5)"
  );

  const inactiveColor = useColorModeValue("#4A5568", "#CBD5E1");

  // Paper chip icon boxes
  const inactiveIconBg = useColorModeValue("#F7FAFC", "navy.800");
  const inactiveIconBorder = useColorModeValue(
    "1px solid rgba(226, 232, 240, 0.9)",
    "1px solid rgba(255, 255, 255, 0.06)"
  );
  const inactiveIconShadow = useColorModeValue(
    "0 1px 2px rgba(0, 0, 0, 0.03)",
    "none"
  );

  // Footer paper card
  const footerBg = useColorModeValue("#F8FAFC", "navy.700");
  const footerBorder = useColorModeValue(
    "1px solid rgba(226, 232, 240, 0.8)",
    "1px solid rgba(255, 255, 255, 0.06)"
  );
  const footerShadow = useColorModeValue(
    "0 1px 3px rgba(0, 0, 0, 0.02)",
    "none"
  );

  const createLinks = (routes) =>
    routes.map((prop, key) => {
      if (prop.redirect || prop.hideInSidebar) return null;
      if (prop.category) {
        return (
          <React.Fragment key={key}>
            <Text
              color={activeColor}
              fontWeight="bold"
              mb={{
                base: "4px",
                sm: "5px",
                md: "6px",
              }}
              mx="auto"
              ps={{
                base: "8px",
                sm: "9px",
                md: "10px",
              }}
              py={{
                base: "8px",
                sm: "10px",
                md: "12px",
              }}
              fontSize={{
                base: "xs",
                sm: "sm",
                md: "sm",
              }}
            >
              {document.documentElement.dir === "rtl"
                ? prop.rtlName
                : prop.name}
            </Text>
            {createLinks(prop.views)}
          </React.Fragment>
        );
      }

      if (!prop.icon) return null;

      // Intercept logout route in responsive sidebar
      if (prop.path === "/logout") {
        return (
          <Button
            key={key}
            boxSize="initial"
            justifyContent="flex-start"
            alignItems="center"
            mb={{ base: "8px", md: "10px" }}
            mx="auto"
            ps={{ base: "10px", md: "14px" }}
            py={{ base: "10px", md: "12px" }}
            borderRadius="6px"
            w="100%"
            bg={paperItemBg}
            color={useColorModeValue("#E53E3E", "#FC8181")}
            boxShadow={paperItemShadow}
            border={paperItemBorder}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: useColorModeValue("#FFF5F5", "#2D1D1D"),
              borderColor: useColorModeValue("#FED7D7", "#742A2A"),
              boxShadow: paperItemHoverShadow,
              transform: "translateY(-1.5px)",
            }}
            _active={{
              transform: "translateY(1px)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
            _focus={{ boxShadow: "none" }}
            onClick={() => {
              if (!authTokenResp) {
                openSigninPromptResp();
                return;
              }
              openLogoutResp();
            }}
          >
            <Flex align="center">
              <IconBox
                bg={useColorModeValue("#FFF5F5", "#2D1D1D")}
                color={"#E53E3E"}
                h="32px"
                w="32px"
                borderRadius="6px"
                border="1px solid"
                borderColor={useColorModeValue("#FED7D7", "#742A2A")}
                boxShadow={inactiveIconShadow}
                me="12px"
                transition="all 0.2s ease-in-out"
                flexShrink={0}
              >
                {prop.icon}
              </IconBox>
              <Text my="auto" fontSize={{ base: "xs", sm: "sm" }} fontWeight="600">
                {document.documentElement.dir === "rtl" ? prop.rtlName : prop.name}
              </Text>
            </Flex>
          </Button>
        );
      }

      const count = getBadgeCount(prop.path);
      const modName = getModuleNameForPath(prop.path);

      return (
        <NavLink
          to={prop.layout + prop.path}
          key={key}
          onClick={() => {
            if (modName && count > 0) {
              markModuleRead(modName, null, true);
            }
            if (onClose) onClose();
          }}
        >
          {({ isActive }) => (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              mb={{
                base: "8px",
                md: "10px",
              }}
              mx="auto"
              ps={{
                base: "10px",
                md: "14px",
              }}
              py={{
                base: "10px",
                md: "12px",
              }}
              borderRadius="6px"
              w="100%"
              bg={isActive ? activePaperBg : paperItemBg}
              color={isActive ? activeColor : inactiveColor}
              boxShadow={isActive ? activePaperShadow : paperItemShadow}
              border={isActive ? "1px solid rgba(0, 128, 128, 0.2)" : paperItemBorder}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                bg: isActive ? activePaperBg : paperItemBg,
                boxShadow: isActive ? activePaperShadow : paperItemHoverShadow,
                borderColor: isActive ? "rgba(0, 128, 128, 0.3)" : paperItemHoverBorder,
                color: isActive ? activeColor : "#008080",
                transform: isActive ? "none" : "translateY(-1.5px)",
              }}
              _active={{
                transform: "translateY(1px)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
              _focus={{ boxShadow: "none" }}
            >
              <Flex align="center" justify="space-between" w="100%" minW="0" gap={2}>
                <Flex align="center" minW="0" flex="1">
                  <IconBox
                    bg={isActive ? "white" : inactiveIconBg}
                    color={"#008080"}
                    h="32px"
                    w="32px"
                    borderRadius="6px"
                    border={isActive ? "none" : inactiveIconBorder}
                    boxShadow={
                      isActive
                        ? "0 2px 5px rgba(0, 0, 0, 0.08)"
                        : inactiveIconShadow
                    }
                    me="12px"
                    transition="all 0.2s ease-in-out"
                    flexShrink={0}
                  >
                    {prop.icon}
                  </IconBox>
                  <Text
                    my="auto"
                    fontSize={{
                      base: "xs",
                      sm: "sm",
                    }}
                    fontWeight={isActive ? "700" : "600"}
                    letterSpacing="0.2px"
                    noOfLines={1}
                    isTruncated
                  >
                    {document.documentElement.dir === "rtl"
                      ? prop.rtlName
                      : prop.name}
                  </Text>
                </Flex>
                {count > 0 && (
                  <Badge
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    minW="20px"
                    h="20px"
                    px={count > 9 ? "6px" : "4px"}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="800"
                    lineHeight="1"
                    bg={isActive ? "white" : "#008080"}
                    color={isActive ? "#008080" : "white"}
                    boxShadow={
                      isActive
                        ? "0 2px 4px rgba(0, 0, 0, 0.12)"
                        : "0 1px 3px rgba(0, 128, 128, 0.35)"
                    }
                    flexShrink={0}
                  >
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </Flex>
            </Button>
          )}
        </NavLink>
      );
    });

  const links = <>{createLinks(routes)}</>;

  const brand = (
    <Box pt={{
      base: "25px",  // 320px - 480px
      sm: "30px",    // 481px - 767px
      md: "35px"     // 768px - 1024px
    }} mb={{
      base: "6px",   // 320px - 480px
      sm: "7px",     // 481px - 767px
      md: "8px"      // 768px - 1024px
    }}>
      {logo}
      <HSeparator my={{
        base: "20px", // 320px - 480px
        sm: "22px",   // 481px - 767px
        md: "26px"    // 768px - 1024px
      }} />
    </Box>
  );

  return (
    <Flex
      display={{
        base: "flex",  // 320px - 480px
        sm: "flex",    // 481px - 767px
        md: "flex",    // 768px - 1024px
        lg: "none",    // 1025px - 1280px
        xl: "none"     // 1281px +
      }}
      ref={mainPanel}
      alignItems="center"
    >
      {/* Hamburger Icon - Only visible on mobile */}
      {/* <HamburgerIcon 
        color={hamburgerColor} 
        w={{
          base: "16px",  // 320px - 480px
          sm: "17px",    // 481px - 767px
          md: "18px"     // 768px - 1024px
        }}
        h={{
          base: "16px",  // 320px - 480px
          sm: "17px",    // 481px - 767px
          md: "18px"     // 768px - 1024px
        }}
        onClick={onOpen}
        cursor="pointer"
      /> */}

      {/* Mobile Sidebar Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === "rtl" ? "right" : "left"}
        size={{
          base: "xs",  // 320px - 480px
          sm: "sm",    // 481px - 767px
          md: "md"     // 768px - 1024px
        }}
      >
        <DrawerOverlay />
        <DrawerContent
          w={{
            base: "285px",
            sm: "300px",
            md: "320px"
          }}
          maxW={{
            base: "285px",
            sm: "300px",
            md: "320px"
          }}
          bg={sidebarContainerBg}
          boxShadow={sidebarContainerShadow}
          border={sidebarContainerBorder}
          borderRadius="10px"
          mt={{
            base: "50px",  // 320px - 480px
            sm: "55px",    // 481px - 767px
            md: "60px"     // 768px - 1024px
          }}
          mb={{
            base: "15px",  // 320px - 480px
            sm: "18px",    // 481px - 767px
            md: "20px"     // 768px - 1024px
          }}
          ml={{
            base: "8px",   // 320px - 480px
            sm: "9px",     // 481px - 767px
            md: "10px"     // 768px - 1024px
          }}
          h={{
            base: "calc(100vh - 65px)",  // 320px - 480px
            sm: "calc(100vh - 73px)",    // 481px - 767px
            md: "calc(100vh - 80px)"     // 768px - 1024px
          }}
        >
          <DrawerCloseButton
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
            mt={{
              base: "8px",   // 320px - 480px
              sm: "9px",     // 481px - 767px
              md: "10px"     // 768px - 1024px
            }}
            mr={{
              base: "8px",   // 320px - 480px
              sm: "9px",     // 481px - 767px
              md: "10px"     // 768px - 1024px
            }}
            size={{
              base: "md",    // 320px - 480px
              sm: "lg",      // 481px - 767px
              md: "lg"       // 768px - 1024px
            }}
          />
          <DrawerBody
            px={{
              base: "0.8rem",  // 320px - 480px
              sm: "0.9rem",    // 481px - 767px
              md: "1rem"       // 768px - 1024px
            }}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Box
              w="100%"
              h="100%"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                <Box>{brand}</Box>
                <Stack direction="column" mb={{
                  base: "30px", // 320px - 480px
                  sm: "35px",   // 481px - 767px
                  md: "40px"    // 768px - 1024px
                }} flex="1" overflow="hidden">
                  <Box overflow="auto" flex="1">
                    {links}
                  </Box>
                </Stack>
                <SidebarHelp />
              </Box>

              <Box
                textAlign="center"
                py={{ base: "10px", md: "12px" }}
                my="10px"
                bg={footerBg}
                border={footerBorder}
                boxShadow={footerShadow}
                borderRadius="6px"
                fontSize={{ base: "11px", sm: "12px", md: "13px" }}
                color="#888"
                flexShrink={0}
              >
                <Flex
                  align="center"
                  justify="center"
                >
                  <Link
                    href="https://flaremindstech.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "none", opacity: 0.85 }}
                  >
                    <Text
                      fontSize={{ base: "12px", sm: "13px", md: "14px" }}
                      display="flex"
                      alignItems="center"
                      gap="6px"
                    >
                      Made by
                      <Image
                        src={FlareMindslogo}
                        alt="FlareMinds Logo"
                        boxSize={{ base: "20px", sm: "20px", md: "22px" }}
                        objectFit="contain"
                      />
                      <strong style={{ color: "#008080" }}>FlareMinds Tech PVT LTD</strong>
                    </Text>
                  </Link>
                </Flex>
              </Box>

            </Box>
          </DrawerBody>
          {/* Responsive signin prompt dialog */}
          <AlertDialog isOpen={isSigninPromptOpenResp} leastDestructiveRef={signinCancelRefResp} onClose={closeSigninPromptResp} isCentered>
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#008080">Not signed in</AlertDialogHeader>
                <AlertDialogBody>You are not signed in yet. Do you want to go to the Sign-in page?</AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={signinCancelRefResp} onClick={closeSigninPromptResp} variant="ghost">Cancel</Button>
                  <Button colorScheme="purple" onClick={handleGoToSignInResp} ml={3}>Go to Sign In</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* Responsive logout confirmation dialog */}
          <AlertDialog isOpen={isLogoutOpenResp} leastDestructiveRef={logoutCancelRefResp} onClose={closeLogoutResp} isCentered>
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#008080">Confirm Logout</AlertDialogHeader>
                <AlertDialogBody>Are you sure you want to logout?</AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={logoutCancelRefResp} onClick={closeLogoutResp} variant="ghost">Cancel</Button>
                  <Button colorScheme="red" onClick={handleConfirmLogoutResp} ml={3}>Sign Out</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
});

export default Sidebar;