import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  IconButton,
  Badge,
  VStack,
  HStack,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { useAppToast } from "components/feedback";
import { NavLink, useNavigate } from "react-router-dom";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { MdPerson, MdLogout, MdAttachMoney, MdReport, MdShield } from "react-icons/md";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  logout,
  selectUser,
  selectRole,
} from "store/slices/authSlice";
import {
  fetchInboxList,
  markInboxRead as markInboxReadThunk,
  markAllInboxRead as markAllInboxReadThunk,
  selectInbox,
  selectInboxUnreadCount,
  selectInboxLoading,
} from "store/slices/notificationsSlice";

const BRAND_TEAL = "#008080";

const HeaderLinks = React.memo(function HeaderLinks() {
  const toast = useAppToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectRole);

  const unreadCount = useAppSelector(selectInboxUnreadCount);
  const notifications = useAppSelector(selectInbox);
  const isLoading = useAppSelector(selectInboxLoading);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchNotificationsList = () => {
    dispatch(fetchInboxList());
  };

  const handleMarkRead = async (id) => {
    try {
      await dispatch(markInboxReadThunk(id)).unwrap();
    } catch (err) {
      toast.error(err, { title: "Error", description: "Failed to mark notification read", duration: 2000 });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllInboxReadThunk()).unwrap();
      toast({
        title: "All caught up",
        description: "All notifications marked as read.",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast.error(err, { title: "Error", description: "Failed to mark all as read", duration: 2000 });
    }
  };

  const handleConfirmLogout = () => {
    setLogoutLoading(true);
    try {
      dispatch(logout());
      navigate("/auth/signin");
    } finally {
      setLogoutLoading(false);
      setIsLogoutOpen(false);
    }
  };

  const displayName =
    user?.fname && user?.lname
      ? `${user.fname} ${user.lname}`
      : user?.name || user?.identifier || "Owner";
  const initials = (displayName.slice(0, 2) || "OW").toUpperCase();
  const userRole = (role || user?.role || "Owner").toUpperCase();

  return (
    <Flex alignItems="center" gap={{ base: 2, sm: 3 }} flexShrink={0}>
      {/* 1. Executive Console Status Tag (Desktop) */}
      <HStack
        display={{ base: "none", xl: "flex" }}
        spacing={1.5}
        px={3}
        py={1.5}
        borderRadius="full"
        bg="rgba(255, 255, 255, 0.12)"
        border="1px solid rgba(255, 255, 255, 0.22)"
        backdropFilter="blur(8px)"
      >
        <Box as="span" color="yellow.300" fontSize="2xs">
          ✦
        </Box>
        <Text fontSize="3xs" fontWeight="800" color="white" textTransform="uppercase" letterSpacing="0.8px">
          Owner Console
        </Text>
      </HStack>

      {/* 2. In-App Notifications Hub */}
      <Popover placement="bottom-end" onOpen={fetchNotificationsList}>
        <PopoverTrigger>
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon boxSize={5} color="white" />}
              variant="ghost"
              size="sm"
              borderRadius="12px"
              bg="rgba(255, 255, 255, 0.12)"
              _hover={{ bg: "rgba(255, 255, 255, 0.22)", transform: "scale(1.05)" }}
              _active={{ bg: "rgba(255, 255, 255, 0.3)" }}
              transition="all 0.2s"
            />
            {unreadCount > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-1px"
                right="-1px"
                fontSize="3xs"
                px={1.5}
                py={0.2}
                boxShadow="0 0 0 2px #008080"
                animation="pulse 2s infinite"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Box>
        </PopoverTrigger>

        <PopoverContent
          w={{ base: "300px", sm: "360px" }}
          borderRadius="16px"
          shadow="2xl"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          _focus={{ boxShadow: "none" }}
          overflow="hidden"
        >
          <PopoverArrow bg="white" />
          <PopoverHeader
            p={4}
            borderBottomWidth="1px"
            borderColor="gray.100"
            bg="gray.50"
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Text fontWeight="800" fontSize="xs" color="gray.850">
                  System Notifications
                </Text>
                {unreadCount > 0 && (
                  <Badge colorScheme="teal" borderRadius="full" fontSize="3xs" px={2}>
                    {unreadCount} unread
                  </Badge>
                )}
              </HStack>
              {unreadCount > 0 && (
                <Button size="xs" colorScheme="teal" variant="ghost" fontSize="3xs" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </Flex>
          </PopoverHeader>

          <PopoverBody maxH="320px" overflowY="auto" p={2}>
            {isLoading ? (
              <Flex justify="center" align="center" py={8}>
                <Spinner size="sm" color={BRAND_TEAL} thickness="2px" />
              </Flex>
            ) : notifications.length > 0 ? (
              <VStack align="stretch" spacing={2}>
                {notifications.map((item) => {
                  const id = item._id || item.id;
                  const isRead = item.isRead || item.read;
                  return (
                    <Box
                      key={id}
                      p={3}
                      bg={isRead ? "gray.50" : "teal.50"}
                      borderRadius="12px"
                      borderLeft="3px solid"
                      borderLeftColor={isRead ? "gray.300" : BRAND_TEAL}
                      cursor="pointer"
                      onClick={() => !isRead && handleMarkRead(id)}
                      _hover={{ bg: isRead ? "gray.100" : "teal.100" }}
                      transition="background 0.2s"
                    >
                      <Flex justify="space-between" align="start" mb={1}>
                        <Text fontWeight={isRead ? "600" : "800"} fontSize="xs" color="gray.800" noOfLines={1}>
                          {item.title || "Notification"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400" flexShrink={0} ml={2}>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </Text>
                      </Flex>
                      <Text fontSize="2xs" color="gray.500" noOfLines={2}>
                        {item.message || item.body || item.content || ""}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Text fontSize="xs" color="gray.400">
                  All caught up! No new notifications.
                </Text>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>

      {/* 3. Executive User Profile Capsule */}
      <Menu placement="bottom-end">
        <MenuButton
          as={Button}
          variant="ghost"
          px={{ base: 2, md: 3 }}
          py={1.5}
          h="auto"
          borderRadius="14px"
          bg="rgba(255, 255, 255, 0.16)"
          border="1px solid rgba(255, 255, 255, 0.28)"
          backdropFilter="blur(8px)"
          _hover={{ bg: "rgba(255, 255, 255, 0.26)", transform: "translateY(-1px)" }}
          _active={{ bg: "rgba(255, 255, 255, 0.34)" }}
          transition="all 0.2s ease"
        >
          <HStack spacing={2.5}>
            {/* White Circular Avatar Badge with Teal Initials */}
            <Flex
              w="32px"
              h="32px"
              borderRadius="10px"
              bg="white"
              color={BRAND_TEAL}
              align="center"
              justify="center"
              fontWeight="900"
              fontSize="xs"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
              position="relative"
            >
              {initials}
              <Box
                as="span"
                position="absolute"
                bottom="-1px"
                right="-1px"
                w="8px"
                h="8px"
                borderRadius="full"
                bg="#22c55e"
                border="1.5px solid #008080"
                boxShadow="0 0 4px #22c55e"
              />
            </Flex>

            {/* Name & Role on desktop */}
            <Box textAlign="left" display={{ base: "none", md: "block" }}>
              <Text fontSize="xs" fontWeight="800" color="white" lineHeight="short" noOfLines={1} maxW="130px">
                {displayName}
              </Text>
              <Text fontSize="3xs" fontWeight="700" color="teal.100" textTransform="uppercase" letterSpacing="0.5px">
                {userRole}
              </Text>
            </Box>

            <ChevronDownIcon color="whiteAlpha.800" boxSize={3.5} display={{ base: "none", md: "block" }} />
          </HStack>
        </MenuButton>

        <MenuList
          borderRadius="16px"
          shadow="2xl"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          p={2}
          minW="230px"
          zIndex={1500}
        >
          {/* Identity Header Card */}
          <Box p={3.5} bg="teal.50" borderRadius="12px" mb={2}>
            <Text fontSize="xs" fontWeight="800" color="gray.900" noOfLines={1}>
              {displayName}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="3xs">
                {userRole}
              </Badge>
              <Text fontSize="3xs" color="gray.500">
                Verified Account
              </Text>
            </HStack>
          </Box>

          <MenuItem
            as={NavLink}
            to="/owner/profile"
            icon={<MdPerson size={16} color={BRAND_TEAL} />}
            borderRadius="10px"
            fontSize="xs"
            fontWeight="600"
          >
            My Profile & Security
          </MenuItem>

          <MenuItem
            as={NavLink}
            to="/owner/finance-tracking"
            icon={<MdAttachMoney size={16} color={BRAND_TEAL} />}
            borderRadius="10px"
            fontSize="xs"
            fontWeight="600"
          >
            Financial Analytics
          </MenuItem>

          <MenuItem
            as={NavLink}
            to="/owner/reports-ratings"
            icon={<MdReport size={16} color={BRAND_TEAL} />}
            borderRadius="10px"
            fontSize="xs"
            fontWeight="600"
          >
            Disputes & Ratings
          </MenuItem>

          <MenuItem
            as={NavLink}
            to="/owner/admin-management"
            icon={<MdShield size={16} color={BRAND_TEAL} />}
            borderRadius="10px"
            fontSize="xs"
            fontWeight="600"
          >
            Partner Management
          </MenuItem>

          <MenuDivider my={1} borderColor="gray.200" />

          <MenuItem
            icon={<MdLogout size={16} color="#ef4444" />}
            borderRadius="10px"
            fontSize="xs"
            fontWeight="700"
            color="red.500"
            _hover={{ bg: "red.50", color: "red.600" }}
            onClick={() => setIsLogoutOpen(true)}
          >
            Sign Out
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Logout Confirmation Modal */}
      <ConfirmActionModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out Confirmation"
        description="Are you sure you want to sign out of the RightTouch Owner Console?"
        confirmText="Sign Out"
        confirmColorScheme="red"
        isLoading={logoutLoading}
      />
    </Flex>
  );
});

export default HeaderLinks;
