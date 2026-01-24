
import React, { useEffect, useState } from "react";
import {
  Avatar, Button, Flex, Grid, Text, VStack, Image, Divider,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Spinner,
  Badge, useToast, Input, FormControl, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, useDisclosure, Box, HStack, Heading
} from "@chakra-ui/react";
import { FaUsers, FaBoxOpen, FaEdit, FaSignOutAlt, FaSave, FaTimes, FaChartPie, FaCrown } from "react-icons/fa";
import Card from "components/Card/Card";
import { useNavigate } from "react-router-dom";
import { getAllBookings, getAllServiceBooking, getAllTechnicians, getAllProduct, getAllServices } from "views/utils/axiosInstance";

import ReactApexChart from 'react-apexcharts';

// Helper functions
const getSafeString = (str, fallback = "N/A") => {
  if (str === null || str === undefined) return fallback;
  return String(str).trim() || fallback;
};

const getSafeImage = (img, fallback = "https://via.placeholder.com/150") => {
  if (!img) return fallback;
  if (Array.isArray(img)) return img[0] || fallback;
  return img;
};

const getSafeCategory = (cat) => {
  if (!cat) return "Uncategorized";
  if (typeof cat === 'object') return cat.category || cat.name || "Uncategorized";
  return cat;
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'success':
      return 'green';
    case 'pending':
    case 'broadcasted':
      return 'orange';
    case 'cancelled':
    case 'failed':
    case 'inactive':
      return 'red';
    default:
      return 'gray';
  }
};

const getInitialOwnerData = () => {
  const userString = localStorage.getItem("user");
  let userData = {};
  try { userData = JSON.parse(userString) || {}; } catch { }

  return {
    ownerId: userData._id || userData.id,
    name: userData.name || "Owner User",
    role: userData.role || "Owner",
    email: userData.email || "owner@example.com",
    joined: "N/A",
    avatar: userData.avatar || userData.profileImage || userData.image || "https://i.pravatar.cc/150?img=32",
    actions: [
      { icon: "users", label: "Manage Users" },
      { icon: "box", label: "Manage Services" },
      { icon: "chart", label: "Service Overview" },
    ],
    createdOwners: [],
    ownerProducts: [],
    allUsers: [],
  };
};


const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'owner': return 'purple';
    case 'manager': return 'blue';
    case 'user': return 'green';
    case 'staff': return 'orange';
    default: return 'gray';
  }
};




const EditOwnerModal = ({ isOpen, onClose, owner, onSave }) => {
  const [editData, setEditData] = useState(owner || {});
  const toast = useToast();

  useEffect(() => {
    setEditData(owner || {});
  }, [owner]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!editData.name || !editData.email) {
      toast({ title: "Error", description: "Name and email are required", status: "error" });
      return;
    }
    onSave(editData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Owner</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={getSafeString(editData.name, '')}
                onChange={handleChange}
                placeholder="Enter owner name"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={getSafeString(editData.email, '')}
                onChange={handleChange}
                placeholder="Enter owner email"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Input
                name="role"
                value={getSafeString(editData.role, '')}
                onChange={handleChange}
                placeholder="Enter owner role"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="purple" bg={'#5a189a'} onClick={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export default function OwnerProfile() {
  const toast = useToast();
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "navy.800");
  const [ownerData, setOwnerData] = useState(getInitialOwnerData());
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentView, setCurrentView] = useState("users");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [productSubView, setProductSubView] = useState("products");

  const [currentPage, setCurrentPage] = useState(1);
  const ownersPerPage = 5;
  const productsPerPage = 5;
  const usersPerPage = 5;
  const technicianPerPage = 5;
  const servicePerPage = 5;


  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [productBookings, setProductBookings] = useState([]);
  const [dailyStats, setDailyStats] = useState({ added: 0, outgoing: 0 });


  const currentUserRole = ownerData.role?.toLowerCase();


  const isOwner = currentUserRole === 'owner';



  const fetchAllTechnicians = async () => {
    setDataLoading(true);
    try {
      const response = await getAllTechnicians();
      const techArray = response.result || response.technicians || response.data || (Array.isArray(response) ? response : []);
      setTechnicians(Array.isArray(techArray) ? techArray : []);
    } catch (err) {
      console.error("Error fetching technicians:", err);
      toast({ title: "Error", description: "Failed to fetch technicians", status: "error" });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAllServices = async () => {
    setDataLoading(true);
    try {
      const response = await getAllServices();
      console.log("Services API response:", response);

      let serviceArray = [];
      if (Array.isArray(response)) {
        serviceArray = response;
      } else if (response && typeof response === 'object') {
        serviceArray = response.services || response.allServices || response.service || response.serviceList || response.result || response.data || [];

        // Handle nested structure like response.data.services or response.result.services
        if (!Array.isArray(serviceArray)) {
          const nested = serviceArray;
          serviceArray = nested.services || nested.allServices || nested.service || nested.serviceList || nested.result || nested.data || [];
        }
      }

      setServices(Array.isArray(serviceArray) ? serviceArray : []);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchServiceOverview = async () => {
    setDataLoading(true);
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        getAllServices(),
        getAllServiceBooking()
      ]);

      let allServices = [];
      if (Array.isArray(servicesRes)) {
        allServices = servicesRes;
      } else if (servicesRes && typeof servicesRes === 'object') {
        allServices = servicesRes.services || servicesRes.allServices || servicesRes.service || servicesRes.serviceList || servicesRes.result || servicesRes.data || [];
        if (!Array.isArray(allServices)) {
          const nested = allServices;
          allServices = nested.services || nested.allServices || nested.service || nested.serviceList || nested.result || nested.data || [];
        }
      }

      let allBookings = [];
      if (Array.isArray(bookingsRes)) {
        allBookings = bookingsRes;
      } else if (bookingsRes && typeof bookingsRes === 'object') {
        allBookings = bookingsRes.bookings || bookingsRes.allBookings || bookingsRes.booking || bookingsRes.bookingList || bookingsRes.result || bookingsRes.data || [];
        if (!Array.isArray(allBookings)) {
          const nested = allBookings;
          allBookings = nested.bookings || nested.allBookings || nested.booking || nested.bookingList || nested.result || nested.data || [];
        }
      }

      setServices(Array.isArray(allServices) ? allServices : []);
      setBookings(Array.isArray(allBookings) ? allBookings : []);
    } catch (err) {
      console.error("Error fetching service overview:", err);
      toast({ title: "Error", description: "Failed to load service analytics", status: "error" });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchOwnerProducts = async () => {
    setDataLoading(true);
    try {
      const response = await getAllProduct();
      console.log("🔄 Fetching products... Raw response:", response);

      let products = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && Array.isArray(response.result)) {
        products = response.result;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      }

      const processedProducts = products.map(product => ({
        id: product._id || product.id,
        name: getSafeString(product.productName || product.name || product.title),
        category: getSafeCategory(product.categoryId || product.category),
        price: product.productPrice || product.price || 0,
        pricingModel: product.pricingModel,
        estimatedPriceFrom: product.estimatedPriceFrom,
        estimatedPriceTo: product.estimatedPriceTo,
        stock: product.inStock ?? product.stock ?? 0,
        status: getSafeString(product.status) || (product.isActive !== false ? 'Active' : 'Inactive'),
        createdAt: product.createdAt || new Date(),
        image: getSafeImage(product.productImages || product.image)
      }));

      setOwnerData(prev => ({ ...prev, ownerProducts: processedProducts }));
      await fetchAllServices();
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      toast({ title: "Error", description: "Failed to fetch products", status: "error" });
    } finally {
      setDataLoading(false);
    }
  };


  useEffect(() => {
    console.log(`🔄 Current view changed to: ${currentView}`);
    if (currentView === "users") {
      fetchAllTechnicians();
    } else if (currentView === "services_view") {
      fetchAllServices();
    } else if (currentView === "analytics") {
      fetchServiceOverview();
    }
  }, [currentView, isOwner]);


  const refreshProductsData = async () => {
    await fetchOwnerProducts();
  };

  const handleActionClick = async (action) => {
    console.log(`🖱️ Action clicked: ${action.label}`);
    if (action.label === "Manage Services") {
      setCurrentView("services_view");
      setProductSubView("services");
      await fetchAllServices();
      setCurrentPage(1);
    } else if (action.label === "Manage Users") {
      setCurrentView("users");
      await fetchAllTechnicians();
      setCurrentPage(1);
    } else if (action.label === "Service Overview") {
      setCurrentView("analytics");
      await fetchServiceOverview();
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast({ title: "Logged Out", status: "info", duration: 2000 });
    navigate("/auth/signin");
  };

  const handleSaveProfile = (updatedData) => {
    setOwnerData(updatedData);
    setIsEditingProfile(false);
    toast({ title: "Profile updated", status: "success", duration: 2000 });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };



  const indexOfLastUser = currentPage * usersPerPage;
  const currentUsers = (Array.isArray(ownerData.allUsers) ? ownerData.allUsers : []).slice(indexOfLastUser - usersPerPage, indexOfLastUser);
  const totalUserPages = Math.ceil((Array.isArray(ownerData.allUsers) ? ownerData.allUsers : []).length / usersPerPage);

  const indexOfLastProduct = currentPage * productsPerPage;
  const currentProducts = ownerData.ownerProducts.slice(indexOfLastProduct - productsPerPage, indexOfLastProduct);
  const totalProductPages = Math.ceil(ownerData.ownerProducts.length / productsPerPage);

  const indexOfLastTechnician = currentPage * technicianPerPage;
  const currentTechnicians = technicians.slice(indexOfLastTechnician - technicianPerPage, indexOfLastTechnician);
  const totalTechnicianPages = Math.ceil(technicians.length / technicianPerPage);

  const indexOfLastService = currentPage * servicePerPage;
  const currentServicesList = (Array.isArray(services) ? services : []).slice(indexOfLastService - servicePerPage, indexOfLastService);
  const totalServicePages = Math.ceil((Array.isArray(services) ? services : []).length / servicePerPage);

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={8} p={6} mt={12}>
      {/* Left Panel - Fixed Card */}
      <Card
        w={{ base: "100%", md: "280px" }}
        bg={cardBg}
        mt={12}
        p={5}
        borderRadius="2xl"
        boxShadow="md"
        transition="all 0.3s ease"
        _hover={{ transform: "translateY(-3px)", boxShadow: "xl" }}
        position="sticky"
        top="100px"
        alignSelf="flex-start"
      >
        <Flex direction="column" align="center">
          <Avatar
            size="xl"
            mb={3}
            name={ownerData.name}
            bg="#008080"
            color="white"
            showBorder
            border="3px solid"
            borderColor="#008080"
          />

          <VStack spacing={2} align="center" w="100%">
            <Flex align="center" gap={2}>
              <Text fontSize="lg" fontWeight="bold">{ownerData.name}</Text>
              <FaCrown color="#FFD700" size="16px" />
            </Flex>
            <Badge colorScheme={getRoleColor(ownerData.role)} fontSize="sm" px={2} py={1}>
              {ownerData.role}
            </Badge>


            <Divider my={3} />

            <VStack spacing={2} align="start" w="100%" mb={4}>
              {ownerData.actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  w="100%"
                  justifyContent="start"
                  leftIcon={
                    action.icon === "users" ? <FaUsers /> :
                      action.icon === "box" ? <FaBoxOpen /> :
                        <FaChartPie />
                  }
                  onClick={() => handleActionClick(action)}
                  colorScheme={
                    currentView === "users" && action.label === "Manage Users" ? "#5a189a" :
                      currentView === "services_view" && action.label === "Manage Services" ? "#5a189a" :
                        currentView === "analytics" && action.label === "Service Overview" ? "#5a189a" :
                          "gray"
                  }
                >
                  {action.label}
                </Button>
              ))}
            </VStack>
          </VStack>
        </Flex>
      </Card>

      {/* Right Panel */}
      <Grid templateColumns="1fr" gap={4} flex="1" mt={12}>
        {isEditingProfile && (
          <ProfileEditComponent
            ownerData={ownerData}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        )}

        {!isEditingProfile && (
          <>
            {currentView === "dashboard" && (
              <Card p={6} bg={cardBg}>
                <Flex align="center" gap={2} mb={3}>
                  <FaCrown color="#5a189a" size="20px" />
                  <Text fontSize="lg" fontWeight="bold">Welcome, {ownerData.name}!</Text>
                </Flex>
                <Text mt={2} color="gray.600">
                  Use the navigation menu to manage {isOwner ? 'owners' : 'users'}, products, or view stock analytics.
                </Text>
              </Card>
            )}

            {currentView === "users" && (
              <Card p={{ base: 3, md: 5 }} bg={cardBg} w="100%" overflowX="auto">
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={4}>
                  Technician Details
                </Text>

                {dataLoading ? (
                  <Flex justify="center" py={8}><Spinner size="lg" /></Flex>
                ) : (
                  <>
                    <Table variant="simple" size="sm">
                      <Thead display={{ base: "none", md: "table-header-group" }}>
                        <Tr>
                          <Th>Technician</Th>
                          <Th>Experience</Th>
                          <Th>Phone</Th>
                          <Th>Status</Th>
                          <Th>Joined</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentTechnicians.length > 0 ? (
                          currentTechnicians.map((tech, i) => {
                            const user = tech.userId || {};
                            const displayName = user.name || (tech.firstName ? `${tech.firstName} ${tech.lastName || ''}` : (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email || "Technician"));
                            const displayPhone = tech.mobileNumber || user.mobileNumber || user.phoneNumber || user.phone || tech.phoneNumber || "N/A";
                            const isApproved = tech.status === 'approved' || tech.isActive === true;

                            return (
                              <Tr key={tech._id || i} display={{ base: "block", md: "table-row" }} mb={{ base: 4, md: 0 }}>
                                <Td display="flex" alignItems="center" gap={3} border="none">
                                  <Avatar size="sm" name={displayName} src={user.profileImage || tech.profileImage} />
                                  <Text fontWeight="medium" display={{ base: "block", md: "block" }}>{displayName}</Text>
                                </Td>
                                <Td display={{ base: "none", md: "table-cell" }}>
                                  {tech.experienceYears ? `${tech.experienceYears} Years` : "N/A"}
                                </Td>
                                <Td>{displayPhone}</Td>
                                <Td>
                                  <Badge colorScheme={isApproved ? "green" : "red"}>
                                    {tech.status || (tech.isActive ? "Active" : "Inactive")}
                                  </Badge>
                                </Td>
                                <Td>{new Date(tech.createdAt).toLocaleDateString()}</Td>
                              </Tr>
                            );
                          })
                        ) : (
                          <Tr><Td colSpan={5} textAlign="center">No technicians found</Td></Tr>
                        )}
                      </Tbody>
                    </Table>
                    {totalTechnicianPages > 1 && (
                      <Flex justify="space-between" mt={4}>
                        <Button size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>Previous</Button>
                        <Text>Page {currentPage} of {totalTechnicianPages}</Text>
                        <Button size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalTechnicianPages))} isDisabled={currentPage === totalTechnicianPages}>Next</Button>
                      </Flex>
                    )}
                  </>
                )}
              </Card>
            )}

            {currentView === "services_view" && (
              <Card p={{ base: 3, md: 5 }} bg={cardBg} w="100%" overflowX="auto">
                <Flex justify="space-between" align="center" mb={4} flexDirection={{ base: "column", sm: "row" }} gap={3}>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                    Manage Services
                  </Text>
                </Flex>
                {dataLoading ? (
                  <Flex justify="center" py={8}><Spinner size="lg" /></Flex>
                ) : (
                  <>
                    <Table variant="simple" size="sm">
                      <Thead display={{ base: "none", md: "table-header-group" }}>
                        <Tr>
                          <Th>Service</Th>
                          <Th>Type</Th>
                          <Th>Price</Th>
                          <Th>Commission</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentServicesList.length > 0 ? (
                          currentServicesList.map((s, i) => (
                            <Tr key={i} display={{ base: "block", md: "table-row" }} mb={{ base: 4, md: 0 }} borderBottom={{ base: "1px solid", md: "none" }} borderColor="gray.100" pb={{ base: 2, md: 0 }}>
                              <Td border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }}>
                                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>{s.serviceName}</Text>
                              </Td>
                              <Td border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "flex", md: "table-cell" }} justifyContent="space-between" alignItems="center">
                                <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.500" fontWeight="bold">Type:</Text>
                                <Text fontSize={{ base: "sm", md: "md" }}>{s.serviceType}</Text>
                              </Td>
                              <Td border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "flex", md: "table-cell" }} justifyContent="space-between" alignItems="center">
                                <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.500" fontWeight="bold">Price:</Text>
                                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="semibold">₹{s.serviceCost}</Text>
                              </Td>
                              <Td border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "flex", md: "table-cell" }} justifyContent="space-between" alignItems="center">
                                <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.500" fontWeight="bold">Commission:</Text>
                                <Text fontSize={{ base: "sm", md: "md" }}>{s.commissionPercentage}%</Text>
                              </Td>
                              <Td border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "flex", md: "table-cell" }} justifyContent="space-between" alignItems="center">
                                <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.500" fontWeight="bold">Status:</Text>
                                <Badge colorScheme={s.isActive ? "green" : "red"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr><Td colSpan={5} textAlign="center">No services found</Td></Tr>
                        )}
                      </Tbody>
                    </Table>

                    <Flex justify="space-between" mt={4}>
                      <Button size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>Previous</Button>
                      <Text>
                        Page {currentPage} of {totalServicePages}
                      </Text>
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalServicePages))}
                        isDisabled={currentPage === totalServicePages}
                      >
                        Next
                      </Button>
                    </Flex>
                  </>
                )}
              </Card>
            )}

            {currentView === "analytics" && (
              <Card p={6} bg={cardBg}>
                <VStack align="stretch" spacing={6}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="bold">Service Overview</Text>
                    <Badge colorScheme="purple" p={2}>Analysis: {new Date().toLocaleDateString()}</Badge>
                  </Flex>

                  {dataLoading ? (
                    <Flex justify="center" align="center" py={12}>
                      <Spinner size="xl" color="purple.500" />
                    </Flex>
                  ) : (
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                      <Box p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" bg="white" shadow="sm">
                        <Text fontWeight="bold" mb={4} textAlign="center" color="#5a189a">Available Services by Type</Text>
                        <ReactApexChart
                          options={{
                            labels: Array.from(new Set(services.map(s => s.serviceType || "Unknown"))),
                            colors: ['#7B1FA2', '#9C27B0', '#BA68C8', '#E1BEE7', '#4A148C'],
                            legend: { position: 'bottom' },
                            dataLabels: { enabled: true },
                            responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }]
                          }}
                          series={
                            Array.from(new Set((Array.isArray(services) ? services : []).map(s => s.serviceType || "Unknown"))).map(type =>
                              (Array.isArray(services) ? services : []).filter(s => (s.serviceType || "Unknown") === type).length
                            )
                          }
                          type="pie"
                          height={350}
                        />
                      </Box>

                      <Box p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" bg="white" shadow="sm">
                        <Text fontWeight="bold" mb={4} textAlign="center" color="#5a189a">Service Bookings Distribution</Text>
                        <ReactApexChart
                          options={{
                            labels: Array.from(new Set(bookings.map(b => b.serviceId?.serviceName || "Misc"))).slice(0, 5),
                            colors: ['#FF7043', '#FFA726', '#FFCA28', '#FFEE58', '#D4E157'],
                            legend: { position: 'bottom' },
                            plotOptions: { pie: { donut: { size: '65%' } } }
                          }}
                          series={
                            Array.from(new Set((Array.isArray(bookings) ? bookings : []).map(b => b.serviceId?.serviceName || "Misc"))).slice(0, 5).map(name =>
                              (Array.isArray(bookings) ? bookings : []).filter(b => (b.serviceId?.serviceName || "Misc") === name).length
                            )
                          }
                          type="donut"
                          height={350}
                        />
                      </Box>
                    </Grid>
                  )}

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={4}>Recent Service Bookings</Text>
                    <Table variant="simple" size="sm">
                      <Thead display={{ base: "none", md: "table-header-group" }}>
                        <Tr>
                          <Th>Booking ID</Th>
                          <Th>Service</Th>
                          <Th display={{ base: "none", lg: "table-cell" }}>Customer</Th>
                          <Th>Status</Th>
                          <Th display={{ base: "none", sm: "table-cell" }}>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(Array.isArray(bookings) ? bookings : []).slice(0, 5).map((booking, i) => (
                          <Tr key={i} display={{ base: "block", md: "table-row" }} mb={{ base: 3, md: 0 }} borderBottom={{ base: "1px solid", md: "none" }} borderColor="gray.50" pb={{ base: 2, md: 0 }}>
                            <Td fontSize="xs" border="none" display={{ base: "none", md: "table-cell" }}>{booking._id?.substring(0, 8)}...</Td>
                            <Td fontWeight="medium" border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }}>
                              <Text fontSize="sm">{booking.serviceId?.serviceName || "N/A"}</Text>
                              <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.400">{booking._id?.substring(0, 8)}...</Text>
                            </Td>
                            <Td fontSize="xs" border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "none", lg: "table-cell" }}>{booking.userId?.name || booking.userId?.email || "Unknown"}</Td>
                            <Td border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "flex", md: "table-cell" }} justifyContent="space-between" alignItems="center">
                              <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.500" fontWeight="bold">Status:</Text>
                              <Badge colorScheme={getStatusColor(booking.status)} fontSize="xs">{booking.status}</Badge>
                            </Td>
                            <Td fontSize="xs" border="none" px={{ base: 0, md: 4 }} py={{ base: 1, md: 3 }} display={{ base: "none", sm: "table-cell" }}>{new Date(booking.createdAt).toLocaleDateString()}</Td>
                          </Tr>
                        ))}
                        {bookings.length === 0 && (
                          <Tr><Td colSpan={5} textAlign="center" py={4}>No recent bookings found</Td></Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </VStack>
              </Card>
            )}
          </>
        )}
      </Grid>
    </Flex >
  );
}