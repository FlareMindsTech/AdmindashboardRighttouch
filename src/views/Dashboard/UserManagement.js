import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  useColorModeValue,
  useToast,
  Heading,
  Text,
  IconButton,
  Spinner,
  Avatar,
  Badge,
  VStack,
  HStack,
  Center,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { MobileCard, MobileCardActions } from "components/common/MobileCard";
import DataTable from "components/common/DataTable";
import {
  UserDetailsModal,
  AllocateTechnicianModal,
  UserPaymentModal,
  DeleteUserModal,
  UserStatsCards,
} from "components/UserManagement";

import {
  FaUsers,
  FaSearch,
  FaEye,
  FaWallet,
  FaUserCog,
  FaTrash,
} from "react-icons/fa";
import {
  getAllCurrentTechJob,
} from "../utils/axiosInstance";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchUsersByRole,
  removeUserRecord,
} from "store/slices/usersSlice";
import { fetchTechnicians as fetchTechniciansShared } from "store/slices/techniciansSlice";
import {
  fetchServiceBookings,
  selectServiceBookings,
} from "store/slices/bookingsSlice";

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

const UserMobileCard = React.memo(({
  user,
  index,
  customColor,
  onViewDetails,
  onViewTechnician,
  onViewPayment,
  onDelete
}) => {
  const userName = getUserDisplayName(user);
  const userEmail = getUserDisplayEmail(user);

  return (
    <MobileCard>
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Avatar size="xs" name={userName} src={user.profileImage} />
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{index} {userName}
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
        {userEmail || "No email"} • {user.mobileNumber || user.phone || "No phone"}
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

      <MobileCardActions
        actions={[
          { label: "View details", icon: <FaEye />, colorScheme: "blue", onClick: () => onViewDetails(user) },
          { label: "View technician", icon: <FaUserCog />, colorScheme: "green", onClick: () => onViewTechnician(user) },
          { label: "View payments", icon: <FaWallet />, colorScheme: "orange", onClick: () => onViewPayment(user) },
          { label: "Delete user", icon: <FaTrash />, colorScheme: "red", onClick: () => onDelete(user) },
        ]}
      />
    </MobileCard>
  );
});

export default function UserManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const dispatch = useAppDispatch();
  // Shared service-bookings collection (TTL-cached; enrichment below now
  // reads the same array the Dashboard KPIs use).
  const allBookings = useAppSelector(selectServiceBookings);

  // Custom color theme (matching ServiceManagement)
  const customColor = "#008080";

  // State hooks
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
      const [usersResult, bookingsResult, techJobsResponse, techniciansResult] = await Promise.all([
        // Shared users cache (TTL keyed by role).
        dispatch(fetchUsersByRole({ role: "Customer" })).unwrap().then((r) => r.list),
        // Shared cache (TTL): resolves to { list } so local parsing below
        // keeps working on the normalized array.
        dispatch(fetchServiceBookings()).unwrap().then((r) => r.list),
        getAllCurrentTechJob().catch(err => []),
        // Shared technicians cache (TTL) for allocation matching.
        dispatch(fetchTechniciansShared()).unwrap().then((r) => r.list).catch(err => []),
      ]);

      if (!isMountedRef.current) return;

      // Parse responses
      const users = Array.isArray(usersResult) ? usersResult : [];
      const bookings = Array.isArray(bookingsResult) ? bookingsResult : [];
      const techJobs = Array.isArray(techJobsResponse.result || techJobsResponse.data || techJobsResponse)
        ? (techJobsResponse.result || techJobsResponse.data || techJobsResponse)
        : [];
      const techList = Array.isArray(techniciansResult) ? techniciansResult : [];

      const sortedUsers = [...users].sort((a, b) => {
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
  }, [currentUser, dispatch, toast]);

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
      await dispatch(
        removeUserRecord({ id: userToDelete._id, role: userToDelete.role || "Customer" })
      ).unwrap();

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
        <UserStatsCards
          stats={stats}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
          isLoading={isLoading}
          customColor={customColor}
          textColor={textColor}
        />
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
                <Box display={{ base: "none", md: "block" }} flex={1} minH={0}>
                  <DataTable
                    showIndex
                    keyExtractor={(user, i) => user._id || `user-${i}`}
                    rows={currentItems}
                    emptyTitle={userData.length === 0 ? "No users found" : "No users match your search"}
                    pagination={
                      filteredData.length > 0
                        ? {
                            page: currentPage,
                            totalPages: totalPages || 1,
                            totalRows: filteredData.length,
                            rowsPerPage: itemsPerPage,
                            onPageChange: setCurrentPage,
                            showRowsPerPage: false,
                            label: "users",
                          }
                        : undefined
                    }
                    columns={[
                      {
                        key: "user",
                        label: "User",
                        minWidth: "200px",
                        cell: (user) => (
                          <Flex align="center" gap={2}>
                            <Avatar size="xs" name={getUserDisplayName(user)} src={user.profileImage} />
                            <Box>
                              <Text fontWeight="bold" color="gray.800" fontSize="xs" noOfLines={1}>
                                {getUserDisplayName(user)}
                              </Text>
                              <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                                {getUserDisplayEmail(user)}
                              </Text>
                            </Box>
                          </Flex>
                        ),
                      },
                      {
                        key: "contact",
                        label: "Contact",
                        minWidth: "140px",
                        cell: (user) => getUserDisplayPhone(user),
                      },
                      {
                        key: "status",
                        label: "Status",
                        align: "center",
                        width: "120px",
                        cell: (user) => (
                          <Badge
                            colorScheme={user.status?.toLowerCase() === "active" ? "green" : "red"}
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="2xs"
                          >
                            {user.status || "Active"}
                          </Badge>
                        ),
                      },
                      {
                        key: "bookingCount",
                        label: "Bookings",
                        align: "center",
                        width: "120px",
                        cell: (user) => <Text fontWeight="bold">{user.bookingCount}</Text>,
                      },
                      {
                        key: "actions",
                        label: "Actions",
                        align: "right",
                        width: "190px",
                        thProps: { pr: 6 },
                        cell: (user) => (
                          <Flex gap={2} justify="flex-end">
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
                            <IconButton
                              aria-label="Delete user"
                              icon={<FaTrash />}
                              bg="white"
                              color="red.500"
                              border="1px"
                              borderColor="red.500"
                              _hover={{ bg: "red.500", color: "white" }}
                              size="xs"
                              onClick={() => handleDeleteClick(user)}
                            />
                          </Flex>
                        ),
                      },
                    ]}
                  />
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
                      <UserMobileCard
                        key={user._id || idx}
                        user={user}
                        index={indexOfFirstItem + idx + 1}
                        customColor={customColor}
                        onViewDetails={handleViewDetails}
                        onViewTechnician={handleViewTechnicianAllocation}
                        onViewPayment={handleViewPaymentDetails}
                        onDelete={handleDeleteClick}
                      />
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
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isViewModalOpen}
        onClose={closeModal}
        selectedUser={selectedUser}
        customColor={customColor}
      />

      {/* Technician Allocation Modal */}
      <AllocateTechnicianModal
        isOpen={isTechModalOpen}
        onClose={closeModal}
        selectedUserForTech={selectedUserForTech}
        customColor={customColor}
      />

      {/* Payment Details Modal */}
      <UserPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closeModal}
        selectedUserForPayment={selectedUserForPayment}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserModal
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteModal}
        userToDelete={userToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        cancelRef={cancelRef}
        customColor={customColor}
      />
    </Flex>
  );
}