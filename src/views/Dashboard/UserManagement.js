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
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaTrash,
  FaEye,
  FaWallet,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import {
  getAllUsers,
  deleteUser,
  getAllServiceBooking,
  getAllCurrentTechJob,
  getAllTechnicians,
} from "views/utils/axiosInstance";

// Main User Management Component
function UserManagement() {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const iconTeal = useColorModeValue("teal.300", "teal.300");
  const iconBoxInside = useColorModeValue("white", "white");
  const bgButton = useColorModeValue("gray.100", "gray.100");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.700");

  // Custom color theme
  const customColor = "#008080";
  const customHoverColor = "#008080";

  const toast = useToast();

  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allBookingsState, setAllBookingsState] = useState([]); // Store all bookings separately
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Search filter state
  const [showPassword, setShowPassword] = useState(false); // Show password state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Show confirm password state

  // View state - 'list'
  const [currentView, setCurrentView] = useState("list");

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const cancelRef = useRef();

  // User details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Technician Allocation Modal State
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [selectedUserForTech, setSelectedUserForTech] = useState(null);

  // User Payment Details Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedUserForPayment, setSelectedUserForPayment] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate current slice based on active view
  const currentItems = filteredData;
  const totalPages = Math.ceil(currentItems.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSlice = currentItems.slice(indexOfFirstItem, indexOfLastItem);
  const displayItems = [...currentSlice];

  // Fetch current user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role?.toLowerCase();

    if (
      !storedUser ||
      (role !== "admin" && role !== "super admin" && role !== "owner")
    ) {
      toast({
        title: "Access Denied",
        description: "Only admin, super admin, or owner users can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentUser(storedUser);
  }, [toast]);

  // Fetch users from backend - defined as useCallback for reuse
  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setTableLoading(true);
    setDataLoaded(false);
    try {
      const [usersResponse, bookingsResponse, techJobsResponse, techniciansResponse] = await Promise.all([
        getAllUsers(),
        getAllServiceBooking(),
        getAllCurrentTechJob().catch((error) => {
          console.error("Error fetching current tech jobs:", error);
          return [];
        }),
        getAllTechnicians().catch((error) => {
          console.error("Error fetching technicians:", error);
          return [];
        }),
      ]);
      console.log("usersResponse", usersResponse);
      console.log("bookingsResponse", bookingsResponse);
      console.log("techJobsResponse", techJobsResponse);
      console.log("techniciansResponse", techniciansResponse);

      // Handle different response formats (handle direct array or .result/.data/.users)
      const usersRaw = usersResponse.result || usersResponse.data?.users || usersResponse.data || usersResponse?.users || usersResponse || [];
      const allBookingsRaw = bookingsResponse.result || bookingsResponse.data?.bookings || bookingsResponse.data || bookingsResponse?.serviceBookings || bookingsResponse || [];
      const allJobsRaw = techJobsResponse.result || techJobsResponse.data || techJobsResponse || [];
      const allTechnicians = techniciansResponse.result || techniciansResponse.data || techniciansResponse || [];

      // Ensure we have arrays
      const users = Array.isArray(usersRaw) ? usersRaw : [];
      const allBookings = Array.isArray(allBookingsRaw) ? allBookingsRaw : [];
      const allJobs = Array.isArray(allJobsRaw) ? allJobsRaw : [];
      const techniciansList = Array.isArray(allTechnicians) ? allTechnicians : [];

      setTechnicians(techniciansList);
      setAllBookingsState(allBookings); // Store raw bookings for modal filtering

      // Sort users in alphabetical order by first name, then last name
      const sortedUsers = users.sort((a, b) => {
        const getName = (u) => {
          if (u.profile && (u.profile.fname || u.profile.lname)) {
            return `${u.profile.fname || ""} ${u.profile.lname || ""}`.trim();
          }
          if (u.profile && (u.profile.firstName || u.profile.lastName)) {
            return `${u.profile.firstName || ""} ${u.profile.lastName || ""}`.trim();
          }
          return (u.name || `${u.firstName || ''} ${u.lastName || ''}`).trim();
        };

        const nameA = getName(a).toLowerCase();
        const nameB = getName(b).toLowerCase();

        // If names are the same, sort by email/mobile as fallback
        if (nameA === nameB) {
          const extraA = (a.email || a.mobileNumber || '').toLowerCase();
          const extraB = (b.email || b.mobileNumber || '').toLowerCase();
          return extraA.localeCompare(extraB);
        }

        return nameA.localeCompare(nameB);
      });

      // Enrich users with booking data
      const usersWithDetails = sortedUsers.map(user => {
        const userId = user._id;
        const userAuthId = user.userId;
        const userEmail = user.email;

        const userBookings = allBookings.filter(booking => {
          const bookingUserId = booking.userId || (booking.user && booking.user._id);
          const bookingCustomerId = booking.customerId?._id || booking.customerId;

          return (
            (bookingCustomerId === userId) ||
            (bookingUserId === userId) ||
            (userAuthId && bookingUserId === userAuthId) ||
            (userEmail && booking.user?.email === userEmail)
          );
        });

        // Find if this user has any current tech job
        const userJob = allJobs.find(job => {
          // IDs from user object
          const currentUserId = user._id;
          const currentUserAuthId = user.userId;
          const currentUserEmail = user.email?.toLowerCase();

          // Search criteria in job
          const jobCustId = job.customer?._id || job.customer;
          const jobBookingId = job.bookingId || job.booking?._id || job.jobId;
          const jobBookingUserId = job.booking?.userId || job.booking?.user?._id || job.booking?.user;
          const jobUserId = job.userId || job.user?._id || job.user;

          // Additional fallbacks for nested service info
          const serviceCustId = job.service?.customer?._id || job.service?.customer || job.service?.userId;
          const serviceEmail = job.service?.customer?.email?.toLowerCase() || job.service?.user?.email?.toLowerCase();

          // Check if any booking associated with this user matches the job ID
          const matchesBooking = userBookings.some(b => b._id === jobBookingId || b.id === jobBookingId);

          const isMatch = (
            (jobCustId && (jobCustId === currentUserId || jobCustId === currentUserAuthId)) ||
            (jobBookingUserId && (jobBookingUserId === currentUserId || jobBookingUserId === currentUserAuthId)) ||
            (jobUserId && (jobUserId === currentUserId || jobUserId === currentUserAuthId)) ||
            (serviceCustId && (serviceCustId === currentUserId || serviceCustId === currentUserAuthId)) ||
            (currentUserEmail && (
              job.customer?.email?.toLowerCase() === currentUserEmail ||
              job.booking?.user?.email?.toLowerCase() === currentUserEmail ||
              serviceEmail === currentUserEmail
            )) ||
            matchesBooking
          );

          return isMatch;
        });

        // Resolve Technician Name
        let technicianName = "None";
        if (userJob) {
          const techId = typeof userJob.technician === 'object' ? userJob.technician?._id : userJob.technician;
          const matchedTech = techniciansList.find(t => t._id === techId || t.userId === techId);

          technicianName =
            (userJob.technician?.name) ||
            (userJob.technician?.firstName ? `${userJob.technician.firstName} ${userJob.technician.lastName || ''}`.trim() : null) ||
            (matchedTech?.name) ||
            (matchedTech?.firstName ? `${matchedTech.firstName} ${matchedTech.lastName || ''}`.trim() : null) ||
            userJob.technicianName ||
            "Allocated"; // Fallback if assigned but name not found
        }


        return {
          ...user,
          bookingCount: user.jobStats?.service?.total ?? 0, // Use backend provided stats
          allocatedTechnician: technicianName,
          bookings: userBookings,
          hasPayments: userBookings.some(b => b.paymentStatus === 'paid' || b.paymentStatus === 'success')
        };
      });

      console.log("Total Appointments/Jobs fetched:", allJobs.length);
      console.log("Users with technicians found:", usersWithDetails.filter(u => u.allocatedTechnician !== "None"));

      setUserData(usersWithDetails);

      // DEBUG: Log ID samples to find why linking is failing
      if (usersWithDetails.length > 0) {
        console.log("Linking Debug - Sample User:", {
          _id: usersWithDetails[0]._id,
          userId: usersWithDetails[0].userId,
          email: usersWithDetails[0].email
        });
      }
      if (allBookings.length > 0) {
        console.log("Linking Debug - Sample Booking:", {
          _id: allBookings[0]._id,
          userId: allBookings[0].userId,
          user_id: allBookings[0].user?._id,
          email: allBookings[0].user?.email
        });
      }
      if (allJobs.length > 0) {
        console.log("Linking Debug - Sample Job:", {
          jobId: allJobs[0].jobId,
          custId: allJobs[0].customer?._id || allJobs[0].customer,
          bookingId: allJobs[0].bookingId || allJobs[0].booking?._id
        });
      }

      setFilteredData(usersWithDetails);
      setDataLoaded(true);
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load user list.";
      setError(errorMessage);
      setDataLoaded(true);
      toast({
        title: "Fetch Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [currentUser, toast]);

  // Initial fetch
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Apply filters and search - UPDATED to maintain alphabetical order
  useEffect(() => {
    if (!dataLoaded) return;

    setTableLoading(true);
    setCurrentPage(1); // Reset to first page when filter changes

    const timer = setTimeout(() => {
      let filtered = userData;

      // Apply role/status filter
      switch (activeFilter) {
        case "technicianAllocation":
          filtered = userData.filter((user) => user.allocatedTechnician !== "None");
          break;
        case "Inactive":
          filtered = userData.filter((user) => user.status === "Inactive");
          break;
        case "withBookings":
          filtered = userData.filter((user) => (user.bookingCount || 0) > 0);
          break;
        default:
          filtered = userData;
      }

      // Apply search filter
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter((user) => {
          const userName = (
            (user.profile && (user.profile.fname || user.profile.lname)) ? `${user.profile.fname || ""} ${user.profile.lname || ""}` :
              (user.profile && (user.profile.firstName || user.profile.lastName)) ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}` :
                (user.name || `${user.firstName || ""} ${user.lastName || ""}`)
          ).toLowerCase();

          return (
            userName.includes(searchTerm.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.mobileNumber || user.phone || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      // Maintain alphabetical order after filtering
      const sortedFilteredData = filtered.sort((a, b) => {
        const getName = (u) => {
          if (u.profile && (u.profile.fname || u.profile.lname)) {
            return `${u.profile.fname || ""} ${u.profile.lname || ""}`.trim();
          }
          if (u.profile && (u.profile.firstName || u.profile.lastName)) {
            return `${u.profile.firstName || ""} ${u.profile.lastName || ""}`.trim();
          }
          return (u.name || `${u.firstName || ''} ${u.lastName || ''}`).trim();
        };

        const nameA = getName(a).toLowerCase();
        const nameB = getName(b).toLowerCase();

        if (nameA === nameB) {
          return (a.email || '').toLowerCase().localeCompare((b.email || '').toLowerCase());
        }

        return nameA.localeCompare(nameB);
      });

      setFilteredData(sortedFilteredData);
      setTableLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeFilter, userData, dataLoaded, searchTerm]);

  // Delete confirmation dialog state logic handled below


  // Get status color with background
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { color: "white", bg: "#9d4edd" };
      case "inactive":
        return { color: "white", bg: "red.500" };
      case "pending":
        return { color: "white", bg: "yellow.500" };
      default:
        return { color: "white", bg: "#9d4edd" };
    }
  };

  // Card click handlers
  const handleCardClick = (filterType) => {
    setActiveFilter(filterType);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleViewDetails = (user) => {
    setSelectedUserDetails(user);
    setIsDetailsModalOpen(true);
  };

  const handleViewTechnicianAllocation = (user) => {
    // Determine the user ID to match against bookings
    const userId = user._id;

    // Filter bookings for this user using customerId
    const userBookings = allBookingsState.filter(booking => {
      // Check if customerId is populated object or string ID
      const customerId = booking.customerId?._id || booking.customerId;
      return customerId === userId;
    });

    setSelectedUserForTech({ ...user, bookings: userBookings });
    setIsTechModalOpen(true);
  };

  const handleViewPaymentDetails = (user) => {
    // Determine the user ID to match against bookings
    const userId = user._id;

    // Filter bookings for this user using customerId
    const userBookings = allBookingsState.filter(booking => {
      const customerId = booking.customerId?._id || booking.customerId;
      return customerId === userId;
    });

    // Filter successful payments
    const successfulBookings = userBookings.filter(b =>
      (b.paymentStatus === 'paid' || b.paymentStatus === 'success')
    );

    // Calculate total amount
    const totalPaidAmount = successfulBookings.reduce((sum, b) => {
      const amount = parseFloat(b.paidAmount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    setSelectedUserForPayment({
      user: user,
      totalBookings: userBookings.length,
      successfulPaymentsCount: successfulBookings.length,
      totalPaidAmount: totalPaidAmount
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
      await deleteUser(userToDelete._id);

      toast({
        title: "User Deleted",
        description: `User ${userToDelete.firstName} ${userToDelete.lastName} has been deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchUsers();

    } catch (err) {
      console.error("Error deleting user:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete user.";
      toast({
        title: "Delete Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  if (!currentUser) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color={customColor} />
      </Flex>
    );
  }

  // Render List View with Fixed Layout
  return (
    <>
      <Flex
        flexDirection="column"
        pt={{ base: "45px", md: "65px", lg: "75px" }}
        minH="calc(100vh - 40px)"
        pb="150px"
        overflow="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: '24px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'transparent',
            borderRadius: '24px',
            transition: 'background 0.3s ease',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
          },
          '&:hover::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          },
          // For Firefox
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
          '&:hover': {
            scrollbarColor: '#cbd5e1 transparent',
          },
        }}
      >
        {/* Fixed Statistics Cards */}
        <Box mb="24px">
          {/* Horizontal Cards Container */}
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={{ base: 3, md: 4 }}
            w="100%"
          >
            {/* Total Users Card */}
            <Card
              minH="75px"
              cursor="pointer"
              onClick={() => handleCardClick("all")}
              border={activeFilter === "all" ? "2px solid" : "1px solid"}
              borderColor={activeFilter === "all" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              position="relative"
              overflow="hidden"
              w="100%"
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
                transform: "translateY(-4px)",
                shadow: "xl",
                _before: {
                  opacity: 1,
                },
                borderColor: customColor,
              }}
            >
              <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
                <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                  <Stat me="2">
                    <StatLabel
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.600"
                      fontWeight="bold"
                      pb="0px"
                      lineHeight="1.2"
                    >
                      Total Users
                    </StatLabel>
                    <Flex>
                      <StatNumber fontSize={{ base: "md", md: "lg" }} color={textColor}>
                        {userData.length}
                      </StatNumber>
                    </Flex>
                  </Stat>
                  <CustomIconBox
                    as="box"
                    h={{ base: "35px", md: "45px" }}
                    w={{ base: "35px", md: "45px" }}
                    bg={customColor}
                    transition="all 0.2s ease-in-out"
                  >
                    <Icon
                      as={FaUsers}
                      h={{ base: "18px", md: "24px" }}
                      w={{ base: "18px", md: "24px" }}
                      color="white"
                    />
                  </CustomIconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* Technician Allocation Card */}
            <Card
              minH="75px"
              cursor="pointer"
              onClick={() => handleCardClick("all")}
              border={activeFilter === "all" ? "2px solid" : "1px solid"}
              borderColor={activeFilter === "all" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              position="relative"
              overflow="hidden"
              w="100%"
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
                transform: "translateY(-4px)",
                shadow: "xl",
                _before: {
                  opacity: 1,
                },
                borderColor: customColor,
              }}
            >
              <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
                <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                  <Stat me="2">
                    <StatLabel
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.600"
                      fontWeight="bold"
                      pb="2px"
                      lineHeight="1.2"
                    >
                      User payment details
                    </StatLabel>
                    <Flex>
                      <StatNumber fontSize={{ base: "md", md: "lg" }} color={textColor}>
                        ₹ {userData.reduce((total, user) => {
                          const userTotal = user.bookings ? user.bookings.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'success').reduce((sum, b) => sum + (parseFloat(b.paidAmount) || 0), 0) : 0;
                          return total + userTotal;
                        }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </StatNumber>
                    </Flex>
                  </Stat>
                  <CustomIconBox
                    as="box"
                    h={{ base: "35px", md: "45px" }}
                    w={{ base: "35px", md: "45px" }}
                    bg={customColor}
                    transition="all 0.2s ease-in-out"
                    _groupHover={{
                      transform: "scale(1.1)",
                    }}
                  >
                    <Icon
                      as={IoCheckmarkDoneCircleSharp}
                      h={{ base: "18px", md: "24px" }}
                      w={{ base: "18px", md: "24px" }}
                      color="white"
                    />
                  </CustomIconBox>
                </Flex>
              </CardBody>
            </Card>

            {/* Users with Bookings Card */}
            <Card
              minH="75px"
              cursor="pointer"
              onClick={() => handleCardClick("withBookings")}
              border={activeFilter === "withBookings" ? "2px solid" : "1px solid"}
              borderColor={activeFilter === "withBookings" ? customColor : `${customColor}30`}
              transition="all 0.2s ease-in-out"
              bg="white"
              position="relative"
              overflow="hidden"
              w="100%"
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
                transform: "translateY(-4px)",
                shadow: "xl",
                _before: {
                  opacity: 1,
                },
                borderColor: customColor,
              }}
            >
              <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
                <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                  <Stat me="2">
                    <StatLabel
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.600"
                      fontWeight="bold"
                      pb="2px"
                      lineHeight="1.2"
                    >
                      Successfull Bookings Details
                    </StatLabel>
                    <Flex>
                      <StatNumber fontSize={{ base: "md", md: "lg" }} color={textColor}>
                        {userData.filter((u) => (u.bookingCount || 0) > 0).length}
                      </StatNumber>
                    </Flex>
                  </Stat>
                  <CustomIconBox
                    as="box"
                    h={{ base: "35px", md: "45px" }}
                    w={{ base: "35px", md: "45px" }}
                    bg={customColor}
                    transition="all 0.2s ease-in-out"
                    _groupHover={{
                      transform: "scale(1.1)",
                    }}
                  >
                    <Icon
                      as={IoCheckmarkDoneCircleSharp}
                      h={{ base: "18px", md: "24px" }}
                      w={{ base: "18px", md: "24px" }}
                      color="white"
                    />
                  </CustomIconBox>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Success/Error Message Display */}
          {error && (
            <Text
              color="red.500"
              mb={4}
              p={3}
              border="1px"
              borderColor="red.200"
              borderRadius="md"
              bg="red.50"
            >
              {error}
            </Text>
          )}
          {success && (
            <Text
              color="green.500"
              mb={4}
              p={3}
              border="1px"
              borderColor="green.200"
              borderRadius="md"
              bg="green.50"
            >
              {success}
            </Text>
          )}

          {/* Active Filter Display */}
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {activeFilter === "technicianAllocation" && "Technician Allocation"}
              {activeFilter === "Inactive" && "Inactive Users"}
              {activeFilter === "withBookings" && "Users with Bookings"}
              {activeFilter === "all" && "All Users"}
            </Text>
            {activeFilter !== "all" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveFilter("all")}
                border="1px"
                borderColor={customColor}
                color={customColor}
                _hover={{ bg: customColor, color: "white" }}
              >
                Show All
              </Button>
            )}
          </Flex>
        </Box>

        {/* Table Container - Removed background box */}
        <Box
          mt={{ base: "0px", md: "-32px" }}
          flex="1"
          display="flex"
          flexDirection="column"
          p={2}
          pt={0}
        >
          <Card
            shadow="xl"
            bg="white"
            display="flex"
            flexDirection="column"
            border="1px solid"
            borderColor={customColor}
          >
            {/* Header */}
            <CardHeader
              p={2}
              pb={2}
              flexShrink={0}
              borderBottom="1px solid"
              borderColor={`${customColor}20`}
            >
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <Heading size="sm" color="gray.700">
                  👥 Users Table
                </Heading>

                <Flex align="center" maxW="350px" w="100%">
                  <Input
                    placeholder="Search..."
                    size="sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Icon as={FaSearch} ml={2} color="gray.400" />
                </Flex>
              </Flex>
            </CardHeader>

            {/* Body */}
            <CardBody p={0} display="flex" flexDirection="column">
              {tableLoading ? (
                <Flex justify="center" align="center" py={5} flex="1">
                  <Spinner size="xl" color={customColor} />
                  <Text ml={4}>Loading Users...</Text>
                </Flex>
              ) : (
                <Box display="flex" flexDirection="column">
                  {displayItems.length > 0 ? (
                    <Box overflow="auto">
                      <Table
                        size="sm"
                        variant="simple"
                        minW={{ base: "800px", lg: "100%" }}
                        sx={{
                          "th, td": {
                            px: 2,
                            py: 1,
                          },
                        }}
                      >
                        <Thead>
                          <Tr>
                            {["User", "Contact", "Bookings", "Technician", "Actions"].map(h => (
                              <Th
                                key={h}
                                position="sticky"
                                top={0}
                                bg={customColor}
                                color="white"
                                fontSize="xs"
                                fontWeight="bold"
                                zIndex={10}
                              >
                                {h}
                              </Th>
                            ))}
                          </Tr>
                        </Thead>

                        <Tbody>
                          {displayItems.map((user, index) => {
                            const userName =
                              user?.profile?.fname ||
                              user?.profile?.firstName ||
                              user?.name ||
                              "Unknown User";

                            return (
                              <Tr
                                key={user._id || index}
                                _hover={{ bg: `${customColor}10` }}
                                borderBottom="1px solid"
                                borderColor={`${customColor}20`}
                                height="40px"
                              >
                                {/* User */}
                                <Td>
                                  <Flex align="center" gap={2}>
                                    <Avatar size="xs" name={userName} src={user.profileImage} />
                                    <Box>
                                      <Text fontSize="sm" fontWeight="medium" lineHeight="short">
                                        {userName}
                                      </Text>
                                      <Text fontSize="xs" color="gray.600" lineHeight="shorter">
                                        {user.email || "No email"}
                                      </Text>
                                    </Box>
                                  </Flex>
                                </Td>

                                {/* Contact */}
                                <Td fontSize="sm" color="gray.600">
                                  {user.mobileNumber || user.phone || "-"}
                                </Td>

                                {/* Bookings */}
                                <Td fontSize="sm" fontWeight="bold">
                                  {user.bookingCount}
                                </Td>

                                {/* Technician */}
                                <Td>
                                  <IconButton
                                    size="xs"
                                    icon={<FaEye />}
                                    aria-label="View Technician"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => handleViewTechnicianAllocation(user)}
                                  />
                                </Td>

                                {/* Actions */}
                                <Td>
                                  <Flex gap={1}>
                                    <IconButton
                                      size="xs"
                                      icon={<FaWallet />}
                                      aria-label="Payments"
                                      variant="outline"
                                      colorScheme="orange"
                                      onClick={() => handleViewPaymentDetails(user)}
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaEye />}
                                      aria-label="Details"
                                      variant="outline"
                                      colorScheme="teal"
                                      onClick={() => handleViewDetails(user)}
                                    />
                                  </Flex>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Flex
                      height="200px"
                      justify="center"
                      align="center"
                      border="1px dashed"
                      borderColor={`${customColor}30`}
                      borderRadius="md"
                      m={4}
                    >
                      <Text textAlign="center" color="gray.500" fontSize="lg">
                        {dataLoaded
                          ? "No users found."
                          : "Loading users..."}
                      </Text>
                    </Flex>
                  )}

                  {/* Pagination */}
                  {filteredData.length > 0 && (
                    <Box
                      p={1}
                      borderTop="1px solid"
                      borderColor={`${customColor}20`}
                    >
                      <Flex justify="flex-end" align="center" gap={2}>
                        <Button
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          isDisabled={currentPage === 1}
                        >
                          Prev
                        </Button>

                        <Text fontSize="sm" fontWeight="bold">
                          {currentPage} / {totalPages}
                        </Text>

                        <Button
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          isDisabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </Flex>
                    </Box>
                  )}
                </Box>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              {userToDelete && (
                <>
                  Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                  <Text mt={2} color="red.500" fontSize="sm">
                    This action cannot be undone.
                  </Text>
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* User Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="15px" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4}>
            <Flex align="center">
              <Avatar
                size="md"
                name={selectedUserDetails ? (selectedUserDetails.profile?.firstName ? `${selectedUserDetails.profile.firstName} ${selectedUserDetails.profile.lastName || ''}` : selectedUserDetails.name || 'User Details') : 'User Details'}
                src={selectedUserDetails?.profileImage}
                mr={4}
              />
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  {selectedUserDetails ? (selectedUserDetails.profile?.firstName ? `${selectedUserDetails.profile.firstName} ${selectedUserDetails.profile.lastName || ''}`.trim() : selectedUserDetails.name || 'Unknown User') : 'User Details'}
                </Text>
                <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="xs">
                  {selectedUserDetails?.status || 'Active'}
                </Badge>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            {selectedUserDetails && (
              <VStack align="stretch" spacing={6}>
                {/* Basic Information */}
                <Box>
                  <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} letterSpacing="wider">
                    Contact Information
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Email Address</Text>
                      <Text fontWeight="medium">{selectedUserDetails.email || 'N/A'}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Phone Number</Text>
                      <Text fontWeight="medium">{selectedUserDetails.mobileNumber || selectedUserDetails.phone || 'N/A'}</Text>
                    </GridItem>
                  </Grid>
                </Box>

                {/* Job Stats - The part the user requested */}
                <Box bg={`${customColor}05`} p={4} borderRadius="12px" border="1px solid" borderColor={`${customColor}10`}>
                  <Heading size="xs" textTransform="uppercase" color={customColor} mb={4} letterSpacing="wider">
                    Booking Statistics (jobStats)
                  </Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    {/* Service Stats */}
                    <Box p={3} bg="white" borderRadius="8px" shadow="sm">
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Service Bookings</Text>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="xs" color="gray.500">Total</Text>
                        <Text fontSize="xs" fontWeight="bold">{selectedUserDetails.jobStats?.service?.total || 0}</Text>
                      </Flex>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="xs" color="gray.500">Completed</Text>
                        <Text fontSize="xs" fontWeight="bold" color="green.500">{selectedUserDetails.jobStats?.service?.completed || 0}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="xs" color="gray.500">Cancelled</Text>
                        <Text fontSize="xs" fontWeight="bold" color="red.500">{selectedUserDetails.jobStats?.service?.cancelled || 0}</Text>
                      </Flex>
                    </Box>

                    {/* Product Stats */}
                    <Box p={3} bg="white" borderRadius="8px" shadow="sm">
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Product Orders</Text>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="xs" color="gray.500">Total</Text>
                        <Text fontSize="xs" fontWeight="bold">{selectedUserDetails.jobStats?.product?.total || 0}</Text>
                      </Flex>
                      {/* Add more product stats if available in the future */}
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Account Details */}
                <Box>
                  <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} letterSpacing="wider">
                    Account Details
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Joined Date</Text>
                      <Text fontWeight="medium">
                        {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleDateString() : 'N/A'}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Last Login</Text>
                      <Text fontWeight="medium">
                        {selectedUserDetails.lastLoginAt ? new Date(selectedUserDetails.lastLoginAt).toLocaleString() : 'N/A'}
                      </Text>
                    </GridItem>
                  </Grid>
                </Box>
              </VStack>
            )}
          </ModalBody>


        </ModalContent>
      </Modal>

      {/* Technician Allocation Modal */}
      <Modal isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="15px" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4}>
            <Text fontSize="lg" fontWeight="bold">Technician Allocation Details</Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6} maxH="70vh" overflowY="auto">
            {selectedUserForTech && selectedUserForTech.bookings && selectedUserForTech.bookings.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {selectedUserForTech.bookings.map((booking, idx) => (
                  <Box key={idx} p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" bg="gray.50">
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3}>
                      Booking #{idx + 1}
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Technician Details */}
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="teal.500" mb={1} textTransform="uppercase">Technician Details</Text>
                        {booking.technicianId ? (
                          <>
                            <Text fontSize="sm"><strong>Name:</strong> {
                              (() => {
                                const tUser = booking.technicianId.userId;
                                const name = `${tUser?.fname || tUser?.firstName || ''} ${tUser?.lname || tUser?.lastName || ''}`.trim() || tUser?.name || tUser?.email || "Unknown";
                                if (name && (name.toLowerCase().startsWith('deleted_') || name.includes('example.invalid'))) return "Deleted Technician";
                                return name;
                              })()
                            }</Text>
                            <Text fontSize="sm"><strong>Mobile:</strong> {booking.technicianId.userId?.mobileNumber || "N/A"}</Text>
                            <Text fontSize="sm"><strong>Status:</strong> {booking.technicianId.workStatus || "N/A"}</Text>
                            <Text fontSize="sm"><strong>Assigned At:</strong> {booking.assignedAt ? new Date(booking.assignedAt).toLocaleString() : "N/A"}</Text>
                          </>
                        ) : (
                          <Text fontSize="sm" color="red.500" fontStyle="italic">No technician has been allocated for this booking.</Text>
                        )}
                      </Box>

                      {/* Service & Booking Details */}
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="blue.500" mb={1} textTransform="uppercase">Service & Booking</Text>
                        <Text fontSize="sm"><strong>Service:</strong> {booking.serviceId?.serviceName || "N/A"}</Text>
                        <Text fontSize="sm"><strong>Type:</strong> {booking.serviceId?.serviceType || "N/A"}</Text>
                        <Text fontSize="sm"><strong>Cost:</strong> ₹{booking.serviceId?.serviceCost || 0}</Text>
                        <Text fontSize="sm" mt={1}><strong>Booking Status:</strong> <Badge colorScheme={booking.status === 'completed' ? 'green' : booking.status === 'cancelled' ? 'red' : 'yellow'}>{booking.status}</Badge></Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Flex justify="center" align="center" minH="100px">
                <Text color="gray.500">No bookings found for this user.</Text>
              </Flex>
            )}
          </ModalBody>

        </ModalContent>
      </Modal>

      {/* Payment Details Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="15px" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4} bg="gray.50" borderTopRadius="15px">
            <Flex align="center">
              <Icon as={FaWallet} color="orange.500" mr={3} w={6} h={6} />
              <Text fontSize="lg" fontWeight="bold">User Payment Summary</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            {selectedUserForPayment ? (
              <VStack spacing={0} align="stretch" border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
                <Box bg="gray.50" p={2} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">User Details</Text>
                </Box>
                <Flex p={4} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center">
                  <Text color="gray.600" fontSize="sm">User Name</Text>
                  <Text fontWeight="bold">
                    {(() => {
                      const u = selectedUserForPayment.user;
                      if (u.profile && (u.profile.fname || u.profile.lname)) return `${u.profile.fname || ""} ${u.profile.lname || ""}`.trim();
                      if (u.profile && (u.profile.firstName || u.profile.lastName)) return `${u.profile.firstName || ""} ${u.profile.lastName || ""}`.trim();
                      return (u.name || `${u.firstName || ''} ${u.lastName || ''}`).trim() || "Unknown";
                    })()}
                  </Text>
                </Flex>
                <Flex p={4} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center">
                  <Text color="gray.600" fontSize="sm">Mobile Number</Text>
                  <Text fontWeight="bold">{selectedUserForPayment.user.mobileNumber || selectedUserForPayment.user.phone || "N/A"}</Text>
                </Flex>

                <Box bg="gray.50" p={2} borderBottom="1px solid" borderColor="gray.200" mt={2}>
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">Payment Stats</Text>
                </Box>
                <Flex p={4} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center">
                  <Text color="gray.600" fontSize="sm">Total Bookings</Text>
                  <Text fontWeight="bold">{selectedUserForPayment.totalBookings}</Text>
                </Flex>
                <Flex p={4} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center">
                  <Text color="gray.600" fontSize="sm">Successful Paid</Text>
                  <Badge colorScheme={selectedUserForPayment.successfulPaymentsCount > 0 ? "green" : "gray"}>
                    {selectedUserForPayment.successfulPaymentsCount}
                  </Badge>
                </Flex>

                <Box bg="teal.50" p={4}>
                  <Flex justify="space-between" align="center">
                    <Text color="teal.700" fontWeight="bold">Total Amount Paid</Text>
                    <Text fontSize="xl" fontWeight="extrabold" color="teal.600">
                      ₹ {selectedUserForPayment.totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </Flex>
                </Box>

                {selectedUserForPayment.successfulPaymentsCount === 0 && (
                  <Box p={3} bg="red.50" borderTop="1px solid" borderColor="red.100">
                    <Text fontSize="sm" color="red.500" textAlign="center">No successful payments found for this user.</Text>
                  </Box>
                )}
              </VStack>
            ) : null}
          </ModalBody>

        </ModalContent>
      </Modal>
    </>
  );
}

// Custom IconBox component
function CustomIconBox({ children, ...rest }) {
  return (
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
}

export default UserManagement;