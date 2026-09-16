import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Heading,
  Text,
  IconButton,
  Spinner,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Badge,
  Grid,
  GridItem,
  VStack,
  HStack,
  Center,
  Image,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaEye,
  FaWallet,
  FaUserCog,
  FaChartLine,
  FaUserCheck,
  FaUserClock,
  FaArrowLeft,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { MdWarning, MdOutlinePayment } from "react-icons/md";
import {
  getUsersByRole,
  deleteUserById,
  getAllServiceBooking,
  getAllCurrentTechJob,
  getAllTechnicians,
} from "../utils/axiosInstance";

export const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";

  if (user.fname || user.lname) {
    const name = `${user.fname || ''} ${user.lname || ''}`.trim();
    if (name) return name;
  }
  if (user.profile?.fname || user.profile?.lname) {
    const name = `${user.profile.fname || ''} ${user.profile.lname || ''}`.trim();
    if (name) return name;
  }
  if (user.firstName || user.lastName) {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (name) return name;
  }
  if (user.profile?.firstName || user.profile?.lastName) {
    const name = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
    if (name) return name;
  }
  if (typeof user.name === 'string' && user.name.trim()) return user.name.trim();
  if (typeof user.fullName === 'string' && user.fullName.trim()) return user.fullName.trim();
  if (typeof user.userName === 'string' && user.userName.trim()) return user.userName.trim();
  if (typeof user.username === 'string' && user.username.trim()) return user.username.trim();

  if (user.bookings && Array.isArray(user.bookings) && user.bookings.length > 0) {
    const b = user.bookings[0];
    const bName = b.customerName || b.customerId?.fname || b.customerId?.name;
    if (typeof bName === 'string' && bName.trim()) return bName.trim();
  }

  const phone = user.mobileNumber || user.phone || user.mobile || user.phoneNumber || user.contact || user.profile?.mobileNumber;
  if (phone) return `Customer (${phone})`;

  const id = user._id || user.id;
  if (id) return `Customer #${String(id).slice(-6).toUpperCase()}`;

  return "Unknown User";
};

export const getUserDisplayEmail = (user) => {
  if (!user) return "No email registered";
  if (typeof user.email === 'string' && user.email.trim()) return user.email.trim();
  if (typeof user.emailId === 'string' && user.emailId.trim()) return user.emailId.trim();
  if (typeof user.profile?.email === 'string' && user.profile.email.trim()) return user.profile.email.trim();

  if (user.bookings && Array.isArray(user.bookings) && user.bookings.length > 0) {
    const b = user.bookings[0];
    if (typeof b.customerEmail === 'string' && b.customerEmail.trim()) return b.customerEmail.trim();
  }

  return "No email registered";
};

export const getUserDisplayPhone = (user) => {
  if (!user) return "-";
  return (
    user.mobileNumber ||
    user.phone ||
    user.mobile ||
    user.phoneNumber ||
    user.contact ||
    user.profile?.mobileNumber ||
    user.profile?.phone ||
    "-"
  );
};

export default function UserManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  // Custom color theme (matching ServiceManagement)
  const customColor = "#008080";
  const customHoverColor = "#008080";

  // State hooks
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUserForTech, setSelectedUserForTech] = useState(null);
  const [selectedUserForPayment, setSelectedUserForPayment] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const cancelRef = useRef();

  // Global scrollbar styles (matching ServiceManagement)
  const globalScrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'transparent',
      borderRadius: '3px',
      transition: 'background 0.3s ease',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      background: '#cbd5e1',
    },
    '&:hover::-webkit-scrollbar-thumb:hover': {
      background: '#94a3b8',
    },
  };

  // Calculate user statistics
  const calculateUserStats = useCallback(() => {
    const totalUsers = userData.length;
    const activeUsers = userData.filter(user => user.status?.toLowerCase() === "active").length;
    const usersWithBookings = userData.filter(user => (user.bookingCount || 0) > 0).length;

    const totalRevenue = userData.reduce((sum, user) => {
      const userTotal = user.bookings
        ? user.bookings
          .filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'success')
          .reduce((s, b) => s + (parseFloat(b.paidAmount) || 0), 0)
        : 0;
      return sum + userTotal;
    }, 0);

    return {
      totalUsers,
      activeUsers,
      usersWithBookings,
      totalRevenue,
    };
  }, [userData]);

  const stats = calculateUserStats();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Check authentication
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role?.toLowerCase();

    if (!storedUser || (role !== "admin" && role !== "super admin" && role !== "owner")) {
      toast({
        title: "Access Denied",
        description: "Only admin, super admin, or owner can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentUser(storedUser);
  }, [toast]);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const [usersResponse, bookingsResponse, techJobsResponse, techniciansResponse] = await Promise.all([
        getUsersByRole("Customer"),
        getAllServiceBooking(),
        getAllCurrentTechJob().catch(err => []),
        getAllTechnicians().catch(err => []),
      ]);

      if (!isMountedRef.current) return;

      // Parse responses
      const users = Array.isArray(usersResponse.result || usersResponse.data?.users || usersResponse.data || usersResponse?.users || usersResponse)
        ? (usersResponse.result || usersResponse.data?.users || usersResponse.data || usersResponse?.users || usersResponse)
        : [];
      const bookings = Array.isArray(bookingsResponse.result || bookingsResponse.data?.bookings || bookingsResponse.data || bookingsResponse?.serviceBookings || bookingsResponse)
        ? (bookingsResponse.result || bookingsResponse.data?.bookings || bookingsResponse.data || bookingsResponse?.serviceBookings || bookingsResponse)
        : [];
      const techJobs = Array.isArray(techJobsResponse.result || techJobsResponse.data || techJobsResponse)
        ? (techJobsResponse.result || techJobsResponse.data || techJobsResponse)
        : [];
      const techList = Array.isArray(techniciansResponse.result || techniciansResponse.data || techniciansResponse)
        ? (techniciansResponse.result || techniciansResponse.data || techniciansResponse)
        : [];

      setAllBookings(bookings);
      setTechnicians(techList);

      const sortedUsers = users.sort((a, b) => {
        const nameA = getUserDisplayName(a).toLowerCase();
        const nameB = getUserDisplayName(b).toLowerCase();
        return nameA.localeCompare(nameB);
      });

      // Enrich users with data
      const usersWithDetails = sortedUsers.map(user => {
        const userBookings = bookings.filter(booking => {
          const customerId = booking.customerId?._id || booking.customerId;
          return customerId === user._id;
        });

        const userJob = techJobs.find(job => {
          const jobCustId = job.customer?._id || job.customer;
          return jobCustId === user._id;
        });

        let technicianName = "None";
        if (userJob) {
          const techId = typeof userJob.technician === 'object' ? userJob.technician?._id : userJob.technician;
          const matchedTech = techList.find(t => t._id === techId || t.userId === techId);
          technicianName = matchedTech?.name ||
            (matchedTech?.firstName ? `${matchedTech.firstName} ${matchedTech.lastName || ''}`.trim() : null) ||
            userJob.technicianName ||
            "Allocated";
        }

        return {
          ...user,
          bookingCount: user.jobStats?.service?.total ?? 0,
          allocatedTechnician: technicianName,
          bookings: userBookings,
        };
      });

      setUserData(usersWithDetails);
      setFilteredData(usersWithDetails);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Fetch error:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load user data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = userData.filter(user => {
      const userName = getUserDisplayName(user).toLowerCase();
      const userEmail = getUserDisplayEmail(user).toLowerCase();
      const userPhone = getUserDisplayPhone(user).toLowerCase();

      return (
        userName.includes(value.toLowerCase()) ||
        userEmail.includes(value.toLowerCase()) ||
        userPhone.includes(value.toLowerCase())
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredData(userData);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    let filtered = userData;

    switch (filterType) {
      case "active":
        filtered = userData.filter(user => user.status?.toLowerCase() === "active");
        break;
      case "withBookings":
        filtered = userData.filter(user => (user.bookingCount || 0) > 0);
        break;
      case "withTechnician":
        filtered = userData.filter(user => user.allocatedTechnician !== "None");
        break;
      case "paidUsers":
        filtered = userData.filter(user => {
          if (!user.bookings) return false;
          return user.bookings.some(b => b.paymentStatus === 'paid' || b.paymentStatus === 'success');
        });
        break;
      default:
        filtered = userData;
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Navigation handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Modal handlers
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleViewTechnicianAllocation = (user) => {
    const userBookings = allBookings.filter(booking => {
      const customerId = booking.customerId?._id || booking.customerId;
      return customerId === user._id;
    });
    setSelectedUserForTech({ ...user, bookings: userBookings });
    setIsTechModalOpen(true);
  };

  const handleViewPaymentDetails = (user) => {
    const userBookings = allBookings.filter(booking => {
      const customerId = booking.customerId?._id || booking.customerId;
      return customerId === user._id;
    });

    const successfulBookings = userBookings.filter(b =>
      b.paymentStatus === 'paid' || b.paymentStatus === 'success'
    );

    const totalPaidAmount = successfulBookings.reduce((sum, b) => {
      const amount = parseFloat(b.paidAmount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    setSelectedUserForPayment({
      user,
      totalBookings: userBookings.length,
      successfulPaymentsCount: successfulBookings.length,
      totalPaidAmount,
    });
    setIsPaymentModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteUserById(userToDelete._id);

      toast({
        title: "User Deleted",
        description: `User has been deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchData();
      closeDeleteModal();
    } catch (err) {
      toast({
        title: "Delete Error",
        description: err.message || "Failed to delete user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
    setDeleteLoading(false);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsTechModalOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedUser(null);
    setSelectedUserForTech(null);
    setSelectedUserForPayment(null);
  };

  // Custom IconBox component (matching ServiceManagement)
  const IconBox = ({ children, ...rest }) => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="12px"
      {...rest}
    >
      {children}
    </Box>
  );

  const UserMobileCard = ({ user, idx }) => {
    const userName = getUserDisplayName(user);
    const userEmail = getUserDisplayEmail(user);

    return (
      <Box
        p={3}
        bg="white"
        borderWidth="1px"
        borderColor={`${customColor}20`}
        borderRadius="md"
        shadow="sm"
        mb={3}
        transition="all 0.2s"
        _active={{ transform: "scale(0.98)" }}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <HStack spacing={2}>
            <Avatar size="xs" name={userName} src={user.profileImage} />
            <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
              #{indexOfFirstItem + idx + 1} {userName}
            </Text>
          </HStack>
          <Badge
            colorScheme={user.status?.toLowerCase() === "active" ? "green" : "red"}
            borderRadius="full"
            px={2}
            fontSize="3xs"
          >
            {user.status || "Active"}
          </Badge>
        </Flex>

        <Text fontSize="2xs" color="gray.600" noOfLines={1} mb={2}>
          {user.email || "No email"} • {user.mobileNumber || user.phone || "No phone"}
        </Text>

        <HStack spacing={2} mb={3} wrap="wrap">
          <Badge colorScheme="blue" variant="subtle" fontSize="3xs">
            Bookings: {user.bookingCount}
          </Badge>
          <Badge
            colorScheme={user.allocatedTechnician !== "None" ? "green" : "gray"}
            fontSize="3xs"
          >
            Tech: {user.allocatedTechnician !== "None" ? "Yes" : "No"}
          </Badge>
        </HStack>

        <Flex gap={2} justify="flex-end">
          <IconButton
            aria-label="View details"
            icon={<FaEye />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            onClick={() => handleViewDetails(user)}
          />
          <IconButton
            aria-label="View technician"
            icon={<FaUserCog />}
            size="xs"
            colorScheme="green"
            variant="ghost"
            onClick={() => handleViewTechnicianAllocation(user)}
          />
          <IconButton
            aria-label="View payments"
            icon={<FaWallet />}
            size="xs"
            colorScheme="orange"
            variant="ghost"
            onClick={() => handleViewPaymentDetails(user)}
          />
        </Flex>
      </Box>
    );
  };

  if (!currentUser) return null;

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "50px", md: "45px" }}
      height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
      overflow="hidden"
      css={globalScrollbarStyles}
    >
      {/* Fixed Statistics Cards */}
      <Box flexShrink={0} p={{ base: 1, md: 4 }} pb={0}>
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
          gap={{ base: "6px", md: "8px" }}
          mb={{ base: "6px", md: "8px" }}
        >
          {/* Total Users Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("all")}
            border={activeFilter === "all" ? "2px solid" : "1px solid"}
            borderColor={activeFilter === "all" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${customColor}15, transparent)`,
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 1.5, md: 2 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Total Users
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.totalUsers}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg={customColor}
                >
                  <Icon as={FaUsers} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Active Users Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("active")}
            border={activeFilter === "active" ? "2px solid" : "1px solid"}
            borderColor={activeFilter === "active" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${customColor}15, transparent)`,
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 1.5, md: 2 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Active Users
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.activeUsers}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg="green.500"
                >
                  <Icon as={FaUserCheck} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Users with Bookings Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("withBookings")}
            border={activeFilter === "withBookings" ? "2px solid" : "1px solid"}
            borderColor={activeFilter === "withBookings" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${customColor}15, transparent)`,
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 1.5, md: 2 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    With Bookings
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.usersWithBookings}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg="orange.500"
                >
                  <Icon as={FaCheckCircle} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Total Revenue Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("paidUsers")}
            border={activeFilter === "paidUsers" ? "2px solid" : "1px solid"}
            borderColor={activeFilter === "paidUsers" ? customColor : `${customColor}30`}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${customColor}15, transparent)`,
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
            }}
            _hover={{
              transform: { base: "none", md: "translateY(-2px)" },
              shadow: { base: "none", md: "lg" },
              _before: { opacity: 1 },
              borderColor: customColor,
            }}
          >
            <CardBody position="relative" zIndex={1} p={{ base: 1.5, md: 2 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Total Revenue
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : `₹${stats.totalRevenue.toLocaleString()}`}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
                  bg="purple.500"
                >
                  <Icon as={FaChartLine} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        </Grid>
      </Box>

      {/* Scrollable Table Container */}
      <Box display="flex" flexDirection="column" p={4} pt={0} flex="1" overflow="hidden">
        <Card
          shadow="lg"
          bg="white"
          display="flex"
          flexDirection="column"
          maxH="100%"
          overflow="hidden"
        >
          {/* Fixed Table Header */}
          <CardHeader
            p="8px 12px"
            pb="6px"
            bg="white"
            flexShrink={0}
            borderBottom="1px solid"
            borderColor={`${customColor}20`}
          >
            <Flex
              flexDirection={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              gap={3}
            >
              <Heading size="sm" flexShrink={0} color="gray.700">
                {activeFilter === "all" && "👥 User Management"}
                {activeFilter === "active" && "✅ Active Users"}
                {activeFilter === "withBookings" && "📅 Users With Bookings"}
                {activeFilter === "paidUsers" && "💰 Revenue Users"}
              </Heading>

              <Flex
                align="center"
                flex={{ base: "none", sm: "1" }}
                maxW={{ base: "100%", sm: "350px" }}
                minW={{ base: "0", sm: "200px" }}
                w="100%"
              >
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="sm"
                  mr={2}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                  fontSize="sm"
                />
                <Icon as={FaSearch} color="gray.400" boxSize={3} />
                {searchTerm && (
                  <Button
                    size="sm"
                    ml={2}
                    onClick={handleClearSearch}
                    bg="white"
                    color={customColor}
                    border="1px"
                    borderColor={customColor}
                    _hover={{ bg: customColor, color: "white" }}
                    fontSize="xs"
                    px={2}
                  >
                    Clear
                  </Button>
                )}
              </Flex>
            </Flex>
          </CardHeader>

          {/* Scrollable Table Content Area */}
          <CardBody bg="white" display="flex" flexDirection="column" p={0} overflow="hidden">
            {isLoading ? (
              <Flex justify="center" align="center" py={6} flex="1">
                <Spinner size="lg" color={customColor} />
                <Text ml={3} fontSize="sm">Loading users...</Text>
              </Flex>
            ) : (
              <Box display="flex" flexDirection="column" overflow="hidden">
                {/* Desktop Table View */}
                <Box display={{ base: "none", md: "block" }} overflow="auto" css={globalScrollbarStyles}>
                  <Table variant="simple" size="sm" bg="transparent">
                    <Thead>
                      <Tr>
                        <Th
                          color="gray.100"
                          borderColor={`${customColor}30`}
                          position="sticky"
                          top={0}
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={1.5}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          #
                        </Th>
                        <Th
                          color="gray.100"
                          borderColor={`${customColor}30`}
                          position="sticky"
                          top={0}
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={1.5}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          User
                        </Th>
                        <Th
                          color="gray.100"
                          borderColor={`${customColor}30`}
                          position="sticky"
                          top={0}
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={1.5}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Contact
                        </Th>
                        <Th
                          color="gray.100"
                          borderColor={`${customColor}30`}
                          position="sticky"
                          top={0}
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={1.5}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Status
                        </Th>
                        <Th
                          color="gray.100"
                          borderColor={`${customColor}30`}
                          position="sticky"
                          top={0}
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={1.5}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Bookings
                        </Th>

                        <Th
                          color="gray.100"
                          borderColor={`${customColor}30`}
                          position="sticky"
                          top={0}
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={1.5}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Actions
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody bg="transparent">
                      {currentItems.length > 0 ? (
                        currentItems.map((user, idx) => {
                          const userName = getUserDisplayName(user);
                          const userEmail = getUserDisplayEmail(user);
                          const userPhone = getUserDisplayPhone(user);

                          return (
                            <Tr
                              key={user._id || idx}
                              bg="transparent"
                              _hover={{ bg: `${customColor}10` }}
                              borderBottom="1px"
                              borderColor={`${customColor}20`}
                              height="35px"
                            >
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                {indexOfFirstItem + idx + 1}
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                <Flex align="center" gap={2}>
                                  <Avatar size="xs" name={userName} src={user.profileImage} />
                                  <Box>
                                    <Text fontWeight="bold" color="gray.800" fontSize="xs" noOfLines={1}>
                                      {userName}
                                    </Text>
                                    <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                                      {userEmail}
                                    </Text>
                                  </Box>
                                </Flex>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                {userPhone}
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                <Badge
                                  colorScheme={user.status?.toLowerCase() === "active" ? "green" : "red"}
                                  px={2}
                                  py={0.5}
                                  borderRadius="full"
                                  fontSize="2xs"
                                >
                                  {user.status || "Active"}
                                </Badge>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                <Text fontWeight="bold">{user.bookingCount}</Text>
                              </Td>

                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1}>
                                <Flex gap={2}>
                                  <IconButton
                                    aria-label="View details"
                                    icon={<FaEye />}
                                    bg="white"
                                    color="blue.500"
                                    border="1px"
                                    borderColor="blue.500"
                                    _hover={{ bg: "blue.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleViewDetails(user)}
                                  />
                                  <IconButton
                                    aria-label="View technician"
                                    icon={<FaUserCog />}
                                    bg="white"
                                    color="green.500"
                                    border="1px"
                                    borderColor="green.500"
                                    _hover={{ bg: "green.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleViewTechnicianAllocation(user)}
                                  />
                                  <IconButton
                                    aria-label="View payments"
                                    icon={<FaWallet />}
                                    bg="white"
                                    color="orange.500"
                                    border="1px"
                                    borderColor="orange.500"
                                    _hover={{ bg: "orange.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleViewPaymentDetails(user)}
                                  />
                                </Flex>
                              </Td>
                            </Tr>
                          );
                        })
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={6}>
                            <Text fontSize="xs">
                              {userData.length === 0 ? "No users found." : "No users match your search."}
                            </Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* Mobile Card View */}
                <Box
                  display={{ base: "block", md: "none" }}
                  overflow="auto"
                  px={3}
                  py={1.5}
                  css={globalScrollbarStyles}
                >
                  {currentItems.length > 0 ? (
                    currentItems.map((user, idx) => (
                      <UserMobileCard key={user._id || idx} user={user} idx={idx} />
                    ))
                  ) : (
                    <Center py={10}>
                      <VStack spacing={2}>
                        <Icon as={FaUsers} color="gray.300" boxSize={10} />
                        <Text fontSize="sm" color="gray.500">No users found</Text>
                      </VStack>
                    </Center>
                  )}
                </Box>

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                  <Box
                    flexShrink={0}
                    p="10px"
                    borderTop="1px solid"
                    borderColor={`${customColor}20`}
                    bg="transparent"
                  >
                    <Flex justify="flex-end" align="center" gap={3}>
                      <Flex align="center" gap={2}>
                        <Button
                          size="sm"
                          onClick={handlePrevPage}
                          isDisabled={currentPage === 1}
                          leftIcon={<FaChevronLeft />}
                          bg="white"
                          color={customColor}
                          border="1px"
                          borderColor={customColor}
                          _hover={{ bg: customColor, color: "white" }}
                          _disabled={{
                            opacity: 0.5,
                            cursor: "not-allowed",
                            bg: "gray.100",
                            color: "gray.400",
                            borderColor: "gray.300"
                          }}
                        >
                          <Text display={{ base: "none", sm: "block" }}>Previous</Text>
                        </Button>

                        <Flex
                          align="center"
                          gap={2}
                          bg={`${customColor}10`}
                          px={3}
                          py={1}
                          borderRadius="6px"
                          minW="80px"
                          justify="center"
                        >
                          <Text fontSize="sm" fontWeight="bold" color={customColor}>
                            {currentPage}
                          </Text>
                          <Text fontSize="sm" color="gray.500">/</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {totalPages}
                          </Text>
                        </Flex>

                        <Button
                          size="sm"
                          onClick={handleNextPage}
                          isDisabled={currentPage === totalPages}
                          rightIcon={<FaChevronRight />}
                          bg="white"
                          color={customColor}
                          border="1px"
                          borderColor={customColor}
                          _hover={{ bg: customColor, color: "white" }}
                          _disabled={{
                            opacity: 0.5,
                            cursor: "not-allowed",
                            bg: "gray.100",
                            color: "gray.400",
                            borderColor: "gray.300"
                          }}
                        >
                          <Text display={{ base: "none", sm: "block" }}>Next</Text>
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                )}
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* User Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={closeModal} size="lg">
        <ModalOverlay backdropFilter="blur(2px)" bg="blackAlpha.500" />
        <ModalContent maxW="620px" borderRadius="xl" overflow="hidden" shadow="2xl">
          <ModalHeader bg="gray.900" color="white" py={4} px={6}>
            <Flex align="center" justify="space-between" pr={6}>
              <HStack spacing={3}>
                <Box p={2} bg={`${customColor}30`} borderRadius="md">
                  <Icon as={FaUsers} color="teal.300" boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="md" fontWeight="bold" color="white">
                    User Profile & Account Dossier
                  </Text>
                  {selectedUser && (
                    <Text fontSize="2xs" color="gray.400" fontFamily="mono">
                      USER ID: #{String(selectedUser._id || selectedUser.id || "").slice(-8).toUpperCase()}
                    </Text>
                  )}
                </Box>
              </HStack>
              {selectedUser && (
                <Badge
                  colorScheme={selectedUser.status?.toLowerCase() === "active" ? "green" : "red"}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {selectedUser.status || "Active"}
                </Badge>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" mt={1} />
          <ModalBody p={5} maxH="75vh" overflowY="auto" bg="gray.50">
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                {/* Profile Banner Card */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
                  <Flex align="center" gap={4}>
                    <Avatar
                      size="xl"
                      name={getUserDisplayName(selectedUser)}
                      src={selectedUser.profileImage}
                      border="2px solid"
                      borderColor={customColor}
                      shadow="md"
                    />
                    <Box flex="1">
                      <Heading size="md" color="gray.800">
                        {getUserDisplayName(selectedUser)}
                      </Heading>
                      <Text fontSize="xs" color="gray.600" mt={0.5}>
                        {getUserDisplayEmail(selectedUser)}
                      </Text>
                      <HStack spacing={2} mt={2}>
                        <Badge colorScheme="teal" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                          {selectedUser.role || "Registered Customer"}
                        </Badge>
                        <Badge colorScheme={selectedUser.allocatedTechnician !== "None" ? "purple" : "gray"} fontSize="2xs" px={2} py={0.5} borderRadius="md">
                          {selectedUser.allocatedTechnician !== "None" ? "Assigned Tech" : "Unassigned"}
                        </Badge>
                      </HStack>
                    </Box>
                  </Flex>
                </Box>

                {/* Contact & Personal Information */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
                  <Text fontWeight="bold" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={3}>
                    Contact & Account Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} fontSize="xs">
                    <Box bg="gray.50" p={2.5} borderRadius="lg">
                      <Text color="gray.500" fontSize="2xs">Mobile Phone</Text>
                      <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                        {getUserDisplayPhone(selectedUser)}
                      </Text>
                    </Box>
                    <Box bg="gray.50" p={2.5} borderRadius="lg">
                      <Text color="gray.500" fontSize="2xs">Email Address</Text>
                      <Text fontWeight="semibold" color="gray.800" isTruncated fontSize="xs">
                        {getUserDisplayEmail(selectedUser)}
                      </Text>
                    </Box>
                    <Box bg="gray.50" p={2.5} borderRadius="lg">
                      <Text color="gray.500" fontSize="2xs">Joined Date</Text>
                      <Text fontWeight="semibold" color="gray.800">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                      </Text>
                    </Box>
                    <Box bg="gray.50" p={2.5} borderRadius="lg">
                      <Text color="gray.500" fontSize="2xs">Location / City</Text>
                      <Text fontWeight="semibold" color="gray.800" textTransform="capitalize">
                        {selectedUser.city || selectedUser.locality || selectedUser.address || selectedUser.profile?.city || "N/A"}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Booking Statistics Grid */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
                  <Text fontWeight="bold" color="teal.700" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={3}>
                    Service Booking Metrics
                  </Text>
                  <SimpleGrid columns={4} spacing={2}>
                    <Box bg="teal.50" p={2.5} borderRadius="lg" textAlign="center">
                      <Text fontSize="2xs" color="teal.700" fontWeight="bold">TOTAL</Text>
                      <Text fontSize="lg" fontWeight="black" color="teal.800">
                        {selectedUser.bookings?.length || selectedUser.bookingCount || 0}
                      </Text>
                    </Box>
                    <Box bg="green.50" p={2.5} borderRadius="lg" textAlign="center">
                      <Text fontSize="2xs" color="green.700" fontWeight="bold">COMPLETED</Text>
                      <Text fontSize="lg" fontWeight="black" color="green.700">
                        {selectedUser.jobStats?.service?.completed || 0}
                      </Text>
                    </Box>
                    <Box bg="orange.50" p={2.5} borderRadius="lg" textAlign="center">
                      <Text fontSize="2xs" color="orange.700" fontWeight="bold">PENDING</Text>
                      <Text fontSize="lg" fontWeight="black" color="orange.700">
                        {Math.max(0, (selectedUser.bookingCount || selectedUser.bookings?.length || 0) - (selectedUser.jobStats?.service?.completed || 0))}
                      </Text>
                    </Box>
                    <Box bg="red.50" p={2.5} borderRadius="lg" textAlign="center">
                      <Text fontSize="2xs" color="red.700" fontWeight="bold">CANCELLED</Text>
                      <Text fontSize="lg" fontWeight="black" color="red.700">
                        {selectedUser.jobStats?.service?.cancelled || 0}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Technician Assignment */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
                  <Text fontWeight="bold" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={2}>
                    Allocated Technician
                  </Text>
                  <Badge
                    colorScheme={selectedUser.allocatedTechnician !== "None" ? "green" : "gray"}
                    fontSize="xs"
                    px={3}
                    py={1.5}
                    borderRadius="md"
                  >
                    {selectedUser.allocatedTechnician !== "None" ?
                      `Assigned Specialist: ${selectedUser.allocatedTechnician}` :
                      "No active technician allocated"}
                  </Badge>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Technician Allocation Modal */}
      <Modal isOpen={isTechModalOpen} onClose={closeModal} size="xl">
        <ModalOverlay backdropFilter="blur(2px)" bg="blackAlpha.500" />
        <ModalContent maxW="700px" borderRadius="xl" overflow="hidden" shadow="2xl">
          <ModalHeader bg="gray.900" color="white" py={4} px={6}>
            <Flex align="center" gap={3}>
              <Box p={2} bg={`${customColor}30`} borderRadius="md">
                <Icon as={FaUserCog} color="teal.300" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="bold" color="white">
                  Technician Allocation & Job Details
                </Text>
                <Text fontSize="2xs" color="gray.400">
                  Assigned technicians per booking
                </Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" mt={1} />
          <ModalBody p={5} maxH="75vh" overflowY="auto" bg="gray.50">
            {selectedUserForTech && (
              <VStack spacing={4} align="stretch">
                {selectedUserForTech.bookings && selectedUserForTech.bookings.length > 0 ? (
                  selectedUserForTech.bookings.map((booking, idx) => {
                    const techObj = typeof booking.technicianId === 'object' && booking.technicianId
                      ? (booking.technicianId.userId || booking.technicianId)
                      : null;
                    const techName = techObj
                      ? (`${techObj.fname || techObj.firstName || ''} ${techObj.lname || techObj.lastName || ''}`.trim() || techObj.name || "Assigned Specialist")
                      : (booking.technicianName || "No Technician Allocated");
                    const techPhone = techObj?.mobileNumber || techObj?.phone || techObj?.mobile || booking.technicianPhone || "N/A";
                    const techEmail = techObj?.email || "N/A";

                    return (
                      <Box
                        key={idx}
                        p={4}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="xl"
                        bg="white"
                        shadow="xs"
                      >
                        <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px dashed" borderColor="gray.200">
                          <Text fontWeight="bold" color={customColor} fontSize="xs" textTransform="uppercase">
                            Booking #{idx + 1} ({booking.bookingNumber || String(booking._id || "").slice(-6)})
                          </Text>
                          <Badge
                            colorScheme={
                              booking.status === 'completed' ? 'green' :
                              booking.status === 'cancelled' ? 'red' : 'yellow'
                            }
                            fontSize="2xs"
                            px={2.5}
                            py={0.5}
                            borderRadius="full"
                          >
                            {booking.status || "Pending"}
                          </Badge>
                        </Flex>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box bg="teal.50/50" p={3} borderRadius="lg" borderLeft="3px solid" borderColor="teal.400">
                            <Text fontSize="2xs" fontWeight="bold" color="teal.700" textTransform="uppercase" mb={1.5}>
                              Allocated Technician Profile
                            </Text>
                            {booking.technicianId || booking.technicianName ? (
                              <VStack align="stretch" spacing={1} fontSize="xs">
                                <Text><strong>Name:</strong> {techName}</Text>
                                <Text><strong>Phone:</strong> {techPhone}</Text>
                                <Text><strong>Email:</strong> {techEmail}</Text>
                                <Text><strong>Assigned:</strong> {booking.assignedAt ? new Date(booking.assignedAt).toLocaleString() : "System Auto-Allocated"}</Text>
                              </VStack>
                            ) : (
                              <Text fontSize="xs" color="red.500" fontWeight="medium" fontStyle="italic">
                                No technician allocated yet for this booking.
                              </Text>
                            )}
                          </Box>

                          <Box bg="blue.50/50" p={3} borderRadius="lg" borderLeft="3px solid" borderColor="blue.400">
                            <Text fontSize="2xs" fontWeight="bold" color="blue.700" textTransform="uppercase" mb={1.5}>
                              Booked Service Details
                            </Text>
                            <VStack align="stretch" spacing={1} fontSize="xs">
                              <Text><strong>Service:</strong> {booking.serviceId?.serviceName || booking.serviceName || booking.title || "Standard Service"}</Text>
                              <Text><strong>Category:</strong> {booking.serviceId?.category || booking.bookingType || "Service"}</Text>
                              <Text><strong>Amount:</strong> <Text as="span" fontWeight="bold" color="green.600">₹{booking.totalAmount || booking.amount || booking.serviceId?.serviceCost || 0}</Text></Text>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    );
                  })
                ) : (
                  <Center py={8}>
                    <VStack spacing={2}>
                      <Icon as={FaUsers} color="gray.400" boxSize={8} />
                      <Text color="gray.500" fontSize="sm">No service bookings found for this customer.</Text>
                    </VStack>
                  </Center>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Payment Details Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={closeModal} size="lg">
        <ModalOverlay />
        <ModalContent maxW="500px">
          <ModalHeader color="gray.700">
            <Flex align="center" gap={2}>
              <Icon as={FaWallet} color="orange.500" />
              Payment Summary
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUserForPayment && (
              <VStack spacing={4} align="stretch">
                {/* User Info */}
                <Flex align="center" gap={3} p={3} bg="gray.50" borderRadius="md">
                  <Avatar
                    size="sm"
                    name={getUserDisplayName(selectedUserForPayment.user)}
                  />
                  <Box>
                    <Text fontWeight="bold">
                      {getUserDisplayName(selectedUserForPayment.user)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {getUserDisplayPhone(selectedUserForPayment.user)} • {getUserDisplayEmail(selectedUserForPayment.user)}
                    </Text>
                  </Box>
                </Flex>

                {/* Payment Stats */}
                <SimpleGrid columns={2} spacing={3}>
                  <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">Total Bookings</Text>
                    <Text fontSize="xl" fontWeight="bold">{selectedUserForPayment.totalBookings}</Text>
                  </Box>
                  <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">Paid Bookings</Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.500">
                      {selectedUserForPayment.successfulPaymentsCount}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Total Amount */}
                <Box p={4} bg="teal.50" borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color="teal.700">Total Amount Paid</Text>
                    <Text fontSize="2xl" fontWeight="extrabold" color="teal.600">
                      ₹{selectedUserForPayment.totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </Flex>
                </Box>

                {selectedUserForPayment.successfulPaymentsCount === 0 && (
                  <Box p={3} bg="red.50" borderRadius="md">
                    <Text fontSize="sm" color="red.500" textAlign="center">
                      No successful payments found for this user.
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteDialogOpen} leastDestructiveRef={cancelRef} onClose={closeDeleteModal}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <Flex align="center" gap={2}>
                <Icon as={MdWarning} color="red.500" />
                Confirm Delete
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody>
              {userToDelete && (
                <Text>
                  Are you sure you want to delete{" "}
                  <Text as="span" fontWeight="bold" color={customColor}>
                    "{getUserDisplayName(userToDelete)}"
                  </Text>
                  ? This action cannot be undone.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteModal} size="sm">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={deleteLoading}
                size="sm"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}