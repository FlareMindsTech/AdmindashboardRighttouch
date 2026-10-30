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
import React from "react";
import { NavLink } from "react-router-dom";
import { BellIcon } from "@chakra-ui/icons";
import { ProfileIcon } from "components/Icons/Icons";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchInboxList,
  markInboxRead as markInboxReadThunk,
  markAllInboxRead as markAllInboxReadThunk,
  selectInbox,
  selectInboxUnreadCount,
  selectInboxLoading,
} from "store/slices/notificationsSlice";

const HeaderLinks = React.memo(function HeaderLinks(props) {
  const { fixed, scrolled, secondary } = props;
  const toast = useToast();
  const dispatch = useAppDispatch();

  // Phase 3: inbox state lives in Redux (single coordinator owns the count
  // polling; the list is still fetched on demand when the popover opens).
  const unreadCount = useAppSelector(selectInboxUnreadCount);
  const notifications = useAppSelector(selectInbox);
  const isLoading = useAppSelector(selectInboxLoading);

  // Hoisted unconditionally (Rules of Hooks); rendered value unchanged.
  const navbarIconFixed = useColorModeValue("gray.700", "gray.200");
  const navbarIconDefault = useColorModeValue("white", "gray.200");
  let navbarIcon = fixed && scrolled ? navbarIconFixed : navbarIconDefault;
  if (secondary) navbarIcon = "white";

  const fetchNotificationsList = () => {
    dispatch(fetchInboxList());
  };

  const handleMarkRead = async (id) => {
    try {
      await dispatch(markInboxReadThunk(id)).unwrap();
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || err || "Failed to mark notification read",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllInboxReadThunk()).unwrap();
      toast({
        title: "Success",
        description: "All notifications marked as read",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || err || "Failed to mark all as read",
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
              _active={{ bg: "rgba(255,255,255,0.25)" }}
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
        <PopoverContent w={{ base: "300px", sm: "360px" }} borderRadius="6px" shadow="2xl" border="1px solid" borderColor="teal.100">
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
                      borderRadius="6px"
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
        variant="ghost"
        rightIcon={<ProfileIcon color={navbarIcon} w="22px" h="22px" />}
        _hover={{ bg: "rgba(255,255,255,0.1)" }}
        _active={{ bg: "rgba(255,255,255,0.2)" }}
      >
        <Text display={{ sm: "none", md: "flex" }}>Profile</Text>
      </Button>
    </Flex>
  );
});

export default HeaderLinks;