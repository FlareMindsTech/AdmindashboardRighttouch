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
import { getAllBookings, getAllProductBookings, getAllTechnicians, getAllProduct, getAllServices } from "views/utils/axiosInstance";

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
      { icon: "box", label: "Manage Products" },
      { icon: "chart", label: "Product Stock Overview" },
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
      const techArray = response.result || response.technicians || response.data || [];
      setTechnicians(techArray);
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
      const serviceArray = response.result || response.services || response.data || [];
      setServices(serviceArray);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchStockMovement = async () => {
    setDataLoading(true);
    try {
      const [bookingsRes, prodBookingsRes, productsRes] = await Promise.all([
        getAllBookings(),
        getAllProductBookings(),
        getAllProduct()
      ]);

      const allBookings = bookingsRes.result || [];
      const allProductBookings = prodBookingsRes.result || [];
      const allProducts = productsRes.result || productsRes.products || [];

      setBookings(allBookings);
      setProductBookings(allProductBookings);

     
      const today = new Date().toISOString().split('T')[0];

      const addedToday = allProducts.filter(p => p.createdAt?.startsWith(today)).length;
      const outgoingToday = allProductBookings.filter(b => b.createdAt?.startsWith(today)).length;

      setDailyStats({ added: addedToday, outgoing: outgoingToday });
    } catch (err) {
      console.error("Error fetching stock movement:", err);
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
    } else if (currentView === "products" || currentView === "analytics") {
      fetchOwnerProducts();
    }
  }, [currentView, isOwner]);


  const refreshProductsData = async () => {
    await fetchOwnerProducts();
  };

  const handleActionClick = async (action) => {
    console.log(`🖱️ Action clicked: ${action.label}`);
    if (action.label === "Manage Products") {
      setCurrentView("products");
      setProductSubView("products");
      await fetchOwnerProducts();
      setCurrentPage(1);
    } else if (action.label === "Manage Users") {
      setCurrentView("users");
      await fetchAllTechnicians();
      setCurrentPage(1);
    } else if (action.label === "Product Stock Overview") {
      setCurrentView("analytics");
      await fetchStockMovement();
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
  const currentUsers = ownerData.allUsers.slice(indexOfLastUser - usersPerPage, indexOfLastUser);
  const totalUserPages = Math.ceil(ownerData.allUsers.length / usersPerPage);

  const indexOfLastProduct = currentPage * productsPerPage;
  const currentProducts = ownerData.ownerProducts.slice(indexOfLastProduct - productsPerPage, indexOfLastProduct);
  const totalProductPages = Math.ceil(ownerData.ownerProducts.length / productsPerPage);

  const indexOfLastTechnician = currentPage * technicianPerPage;
  const currentTechnicians = technicians.slice(indexOfLastTechnician - technicianPerPage, indexOfLastTechnician);
  const totalTechnicianPages = Math.ceil(technicians.length / technicianPerPage);

  const indexOfLastService = currentPage * servicePerPage;
  const currentServicesList = services.slice(indexOfLastService - servicePerPage, indexOfLastService);
  const totalServicePages = Math.ceil(services.length / servicePerPage);

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
            <Text fontSize="sm" mb={2}>{ownerData.email}</Text>

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
                      currentView === "products" && action.label === "Manage Products" ? "#5a189a" :
                        currentView === "analytics" && action.label === "Product Stock Overview" ? "#5a189a" :
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
                          <Th>Avatar</Th>
                          <Th>Email</Th>
                          <Th>Phone</Th>
                          <Th>Status</Th>
                          <Th>Joined</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentTechnicians.length > 0 ? (
                          currentTechnicians.map((tech, i) => {
                            const user = tech.userId || {};
                            const displayName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email || "Technician");
                            const displayEmail = user.email || "N/A";
                            const displayPhone = user.phoneNumber || user.phone || tech.phoneNumber || "N/A";
                            const isApproved = tech.status === 'approved' || tech.isActive === true;

                            return (
                              <Tr key={tech._id || i} display={{ base: "block", md: "table-row" }} mb={{ base: 4, md: 0 }}>
                                <Td display="flex" alignItems="center" gap={3} border="none">
                                  <Avatar size="sm" name={displayName} src={user.profileImage || tech.profileImage} />

                                </Td>
                                <Td display={{ base: "none", md: "table-cell" }}>{displayEmail}</Td>
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

            {currentView === "products" && (
              <Card p={{ base: 3, md: 5 }} bg={cardBg} w="100%" overflowX="auto">
                <Flex justify="space-between" align="center" mb={4} flexDirection={{ base: "column", sm: "row" }} gap={3}>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                    Manage {productSubView === "products" ? "Products" : "Services"}
                  </Text>
                  <HStack spacing={2} alignSelf={{ base: "flex-end", sm: "center" }}>
                    <Button
                      size="sm"
                      colorScheme={productSubView === "products" ? "purple" : "gray"}
                      onClick={() => { setProductSubView("products"); setCurrentPage(1); }}
                    >
                      All Products
                    </Button>
                    <Button
                      size="sm"
                      colorScheme={productSubView === "services" ? "purple" : "gray"}
                      onClick={() => { setProductSubView("services"); setCurrentPage(1); }}
                    >
                      All Services
                    </Button>
                  </HStack>
                </Flex>

                {dataLoading ? (
                  <Flex justify="center" py={8}><Spinner size="lg" /></Flex>
                ) : (
                  <>
                    {productSubView === "products" ? (
                      <Table variant="simple" size="sm">
                        <Thead display={{ base: "none", md: "table-header-group" }}>
                          <Tr>
                            <Th>Product</Th>
                            <Th>Category</Th>
                            <Th>Price</Th>
                            
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentProducts.length > 0 ? (
                            currentProducts.map((p, i) => (
                              <Tr key={i} display={{ base: "block", md: "table-row" }} mb={2}>
                                <Td border="none">
                                  <Text fontWeight="bold">{p.name}</Text>
                                </Td>
                                <Td display={{ base: "none", md: "table-cell" }}>
                                  <Badge colorScheme="purple" variant="subtle">{p.category}</Badge>
                                </Td>
                                <Td>
                                  {p.pricingModel === "fixed" ? (
                                    `₹${p.price || p.estimatedPriceFrom || 0}`
                                  ) : p.estimatedPriceFrom && p.estimatedPriceTo ? (
                                    `₹${p.estimatedPriceFrom} - ₹${p.estimatedPriceTo}`
                                  ) : (
                                    `₹${p.price || 0}`
                                  )}
                                </Td>
                                
                              </Tr>
                            ))
                          ) : (
                            <Tr><Td colSpan={5} textAlign="center">No products found</Td></Tr>
                          )}
                        </Tbody>
                      </Table>
                    ) : (
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
                              <Tr key={i} display={{ base: "block", md: "table-row" }} mb={2}>
                                <Td border="none">
                                  <Text fontWeight="bold">{s.serviceName}</Text>
                                </Td>
                                <Td>{s.serviceType}</Td>
                                <Td>₹{s.serviceCost}</Td>
                                <Td>{s.commissionPercentage}%</Td>
                                <Td>
                                  <Badge colorScheme={s.isActive ? "green" : "red"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr><Td colSpan={5} textAlign="center">No services found</Td></Tr>
                          )}
                        </Tbody>
                      </Table>
                    )}

                    <Flex justify="space-between" mt={4}>
                      <Button size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>Previous</Button>
                      <Text>
                        Page {currentPage} of {productSubView === "products" ? totalProductPages : totalServicePages}
                      </Text>
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, productSubView === "products" ? totalProductPages : totalServicePages))}
                        isDisabled={currentPage === (productSubView === "products" ? totalProductPages : totalServicePages)}
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
                    <Text fontSize="lg" fontWeight="bold">Product Stock Overview (Daily)</Text>
                    <Badge colorScheme="purple" p={2}>Today: {new Date().toLocaleDateString()}</Badge>
                  </Flex>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <Box p={5} borderRadius="xl" bg="green.50" border="1px solid" borderColor="green.200">
                      <VStack align="start" spacing={1}>
                        <Text color="green.600" fontWeight="bold">Products Added</Text>
                        <Heading size="xl" color="green.700">{dailyStats.added}</Heading>
                        <Text fontSize="sm" color="green.600">Items newly created today</Text>
                      </VStack>
                    </Box>

                    <Box p={5} borderRadius="xl" bg="orange.50" border="1px solid" borderColor="orange.200">
                      <VStack align="start" spacing={1}>
                        <Text color="orange.600" fontWeight="bold">Products Outgoing</Text>
                        <Heading size="xl" color="orange.700">{dailyStats.outgoing}</Heading>
                        <Text fontSize="sm" color="orange.600">Product bookings recorded today</Text>
                      </VStack>
                    </Box>
                  </Grid>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={4}>Recent Movements</Text>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Item ID</Th>
                          <Th>Type</Th>
                          <Th>Quantity</Th>
                          <Th>Status</Th>
                          <Th>Time</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {productBookings.slice(0, 5).map((move, i) => (
                          <Tr key={i}>
                            <Td fontSize="xs">{move.ProductId || move._id}</Td>
                            <Td><Badge colorScheme="orange">Outgoing</Badge></Td>
                            <Td>{move.quantity || 1}</Td>
                            <Td><Badge size="xs" colorScheme={getStatusColor(move.status)}>{move.status}</Badge></Td>
                            <Td fontSize="xs">{new Date(move.createdAt).toLocaleTimeString()}</Td>
                          </Tr>
                        ))}
                        {productBookings.length === 0 && (
                          <Tr><Td colSpan={5} textAlign="center" py={4}>No stock movement today</Td></Tr>
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