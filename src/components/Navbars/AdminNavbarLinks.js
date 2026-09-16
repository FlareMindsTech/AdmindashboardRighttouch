// Chakra Imports
import {
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  IconButton,
  Badge,
  VStack,
  HStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { BellIcon } from "@chakra-ui/icons";
import { ProfileIcon } from "components/Icons/Icons";
import {
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "views/utils/axiosInstance";

export default function HeaderLinks(props) {
  const { fixed, scrolled, secondary } = props;
  const toast = useToast();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  let navbarIcon =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  if (secondary) navbarIcon = "white";

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getAdminUnreadNotificationCount();
      const count = res.count ?? res.unreadCount ?? res.result?.count ?? 0;
      setUnreadCount(count);
    } catch (err) {
      // silently catch
    }
  }, []);

  const fetchNotificationsList = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAdminNotifications();
      const list = res.notifications || res.result || res.data || (Array.isArray(res) ? res : []);
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleMarkRead = async (id) => {
    try {
      await markAdminNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to mark notification read",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to mark all as read",
        status: "error",
        duration: 2000,
      });
    }
  };

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      gap={3}
    >
      {/* ✅ In-App Notifications Bell */}
      <Popover placement="bottom-end" onOpen={fetchNotificationsList}>
        <PopoverTrigger>
          <Box position="relative" cursor="pointer">
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon w="20px" h="20px" color={navbarIcon} />}
              variant="ghost"
              size="sm"
              _hover={{ bg: "rgba(255,255,255,0.15)" }}
            />
            {unreadCount > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-2px"
                right="-2px"
                fontSize="3xs"
                px={1.5}
                py={0.2}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Box>
        </PopoverTrigger>
        <PopoverContent w={{ base: "300px", sm: "360px" }} shadow="2xl" border="1px solid" borderColor="teal.100">
          <PopoverArrow />
          <PopoverHeader fontWeight="bold" fontSize="sm" borderBottomWidth="1px">
            <Flex justify="space-between" align="center">
              <Text color="teal.700">Notifications</Text>
              {unreadCount > 0 && (
                <Button size="xs" colorScheme="teal" variant="ghost" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </Flex>
          </PopoverHeader>
          <PopoverBody maxH="320px" overflowY="auto" p={2}>
            {isLoading ? (
              <Flex justify="center" py={4}>
                <Spinner size="sm" color="teal.500" />
              </Flex>
            ) : notifications.length > 0 ? (
              <VStack align="stretch" spacing={2}>
                {notifications.map((item) => {
                  const id = item._id || item.id;
                  const isRead = item.isRead || item.read;
                  return (
                    <Box
                      key={id}
                      p={2.5}
                      bg={isRead ? "gray.50" : "teal.50"}
                      borderRadius="md"
                      borderLeft="3px solid"
                      borderLeftColor={isRead ? "gray.300" : "teal.500"}
                      cursor="pointer"
                      onClick={() => !isRead && handleMarkRead(id)}
                      _hover={{ bg: isRead ? "gray.100" : "teal.100" }}
                      transition="background 0.2s"
                    >
                      <Flex justify="space-between" align="start" mb={1}>
                        <Text fontWeight={isRead ? "normal" : "bold"} fontSize="xs" color="gray.800" noOfLines={1}>
                          {item.title || "Notification"}
                        </Text>
                        <Text fontSize="3xs" color="gray.500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </Text>
                      </Flex>
                      <Text fontSize="2xs" color="gray.600" noOfLines={2}>
                        {item.message || item.body || item.content || ""}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                No notifications found.
              </Text>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>

      {/* ✅ Profile Button */}
      <Button
        as={NavLink}
        to="/owner/profile"
        ms="0px"
        px="0px"
        me={{ sm: "2px", md: "16px" }}
        color={navbarIcon}
        variant="no-effects"
        rightIcon={<ProfileIcon color={navbarIcon} w="22px" h="22px" />}
        _hover={{ bg: "rgba(255,255,255,0.1)" }}
      >
        <Text display={{ sm: "none", md: "flex" }}>Profile</Text>
      </Button>
    </Flex>
  );
}