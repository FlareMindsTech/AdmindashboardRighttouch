// AdminManagement.js - OWNER ONLY ACCESS
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
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
  Badge,
  Text,
  IconButton,
  Spinner,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Textarea,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect, useRef } from "react";
import {
  FaUsers,
  FaEdit,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaUserSlash,
  FaExclamationTriangle,
  FaUserGraduate,
  FaTimes,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdAdminPanelSettings, MdPerson, MdBlock, MdWarning } from "react-icons/md";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  getAllTechnicians,
  updateAdmin,
  createAdmin,
  inActiveAdmin,
  deleteTechnician,
  getTechnicianKYC,
  verifyKYC,
  deleteKYC,
  updateTrainingStatus,
} from "views/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

// Main Admin Management Component
function AdminManagement() {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const iconTeal = useColorModeValue("teal.300", "teal.300");
  const iconBoxInside = useColorModeValue("white", "white");
  const bgButton = useColorModeValue("gray.100", "gray.100");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.700");

  // Custom color theme
  const customColor = "#008080";
  const customHoverColor = "#5a189a";
  const customBorderColor = "#F5B700"; // Golden Border

  const toast = useToast();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert dialog for delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingKYC, setIsDeletingKYC] = useState(false);
  const [technicianIdToDeleteKYC, setTechnicianIdToDeleteKYC] = useState(null); // For inline confirmation
  const cancelRef = useRef();

  // View state - 'list', 'add', 'edit'
  const [currentView, setCurrentView] = useState("list");
  const [editingAdmin, setEditingAdmin] = useState(null);

  // KYC Modal State
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [kycData, setKYCData] = useState(null);
  const [kycLoading, setKYcLoading] = useState(false);
  const [selectedTechnicianForKYC, setSelectedTechnicianForKYC] = useState(null);
  const [rejectionInput, setRejectionInput] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [confirmingModalDelete, setConfirmingModalDelete] = useState(false);

  // Technician Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
    role: "admin",
    status: "Active"
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayItems = [...currentItems];
  while (displayItems.length < itemsPerPage && displayItems.length > 0) {
    displayItems.push({ _id: `empty-${displayItems.length}`, isEmpty: true });
  }

  // Toggle password visibility
  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Fetch current user from localStorage and check permissions
  useEffect(() => {
    const userString = localStorage.getItem("user");
    
    // Check if user exists and is owner
    if (!userString) {
      toast({
        title: "Access Denied",
        description: "Please sign in to access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/auth/signin");
      return;
    }

    try {
      const userData = JSON.parse(userString);
      const userRole = userData.role?.toLowerCase();
      
      // 🔐 STRICT OWNER CHECK
      if (userRole !== "owner") {
        toast({
          title: "Access Denied",
          description: "Only owner accounts can access this page.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/access-denied");
        return;
      }
      
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      toast({
        title: "Session Error",
        description: "Your session data is invalid. Please sign in again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      localStorage.removeItem("user");
      navigate("/auth/signin");
    }
  }, [toast, navigate]);

  // Fetch admins from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      if (!currentUser) return;

      setLoading(true);
      setTableLoading(true);
      setDataLoaded(false);
      try {
        const response = await getAllTechnicians();
        
        // Handle different response formats
        const admins = response.result || response.data?.admins || response.data || response?.admins || response || [];

        if (!Array.isArray(admins)) {
          console.error("Unexpected response data format:", response);
          setAdminData([]);
          setFilteredData([]);
          setDataLoaded(true);
          return;
        }

        const sortedAdmins = admins.sort(
          (a, b) =>
            new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
        );

        setAdminData(sortedAdmins);
        setFilteredData(sortedAdmins);
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching admins:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load admin list.";
        if (errorMessage.includes("token not found") || errorMessage.includes("Session expired") || errorMessage.includes("401")) {
             toast({
              title: "Session Expired",
              description: "Please log in again.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("adminToken");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("adminToken");
            setTimeout(() => {
                navigate("/auth/signin");
            }, 1000);
            return;
        }

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
    };

    if (currentUser) {
      fetchAdmins();
    }
  }, [currentUser, toast]);

  // Apply filters and search
  useEffect(() => {
    if (!dataLoaded) return;

    setTableLoading(true);
    setCurrentPage(1); // Reset to first page when filter changes

    const timer = setTimeout(() => {
      let filtered = adminData;

      // Apply role/status filter
      switch (activeFilter) {
        case "Active":
          filtered = adminData.filter((admin) => admin.status?.toLowerCase() === "approved" || admin.status?.toLowerCase() === "active");
          break;
        case "Inactive":
          filtered = adminData.filter((admin) => admin.status === "Inactive");
          break;
        case "Verified":
          filtered = adminData.filter((admin) => 
            (admin.status?.toLowerCase() === "approved" || admin.status?.toLowerCase() === "active") && 
            admin.trainingCompleted === true
          );
          break;
        case "Deleted":
          filtered = adminData.filter((admin) => admin.status === "Deleted");
          break;
        default:
          filtered = adminData;
      }

      // Apply search filter
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter(
          (admin) => {
            const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`;
            return (
              fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (admin.status && admin.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (admin.city && admin.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (admin.mobileNumber && admin.mobileNumber.toString().includes(searchTerm))
            );
          }
        );
      }

      setFilteredData(filtered);
      setTableLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeFilter, adminData, dataLoaded, searchTerm]);

  // Handle delete admin - show confirmation dialog
  const handleDeleteAdmin = async (admin) => {
    // Prevent deleting owner accounts
    if (admin.role?.toLowerCase() === "owner") {
      toast({
        title: "Permission Denied",
        description: "You cannot delete owner accounts.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteTechnician(adminToDelete._id);
      
      toast({
        title: "Admin Deleted",
        description: `${adminToDelete.name} has been deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh admin list
      const fetchAdmins = async () => {
        try {
          const adminsResponse = await getAllTechnicians();
          // Handle different response formats
          const admins = adminsResponse.result || adminsResponse.data?.admins || adminsResponse.data || adminsResponse?.admins || adminsResponse || [];
          
          if (!Array.isArray(admins)) {
            console.error("Unexpected response data format during refresh:", adminsResponse);
            return;
          }
          
          const sortedAdmins = admins.sort(
            (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
          );
          setAdminData(sortedAdmins);
          setFilteredData(sortedAdmins);
        } catch (err) {
          console.error("Error refreshing admins:", err);
        }
      };

      await fetchAdmins();
      closeDeleteDialog();

    } catch (err) {
      console.error("Error deleting admin:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete admin.";
      toast({
        title: "Delete Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleting(false);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setAdminToDelete(null);
    setIsDeleting(false);
  };

  const handleAddAdmin = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      profileImage: "",
      role: "admin",
      status: "Active"
    });
    setEditingAdmin(null);
    setCurrentView("add");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Handle edit admin - show edit form
  const handleEditAdmin = (admin) => {
    // Prevent editing owner accounts
    if (admin.role?.toLowerCase() === "owner") {
      toast({
        title: "Permission Denied",
        description: "You cannot edit owner accounts.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Extract first and last name from admin.name
    const nameParts = admin.name ? admin.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setFormData({
      firstName: firstName,
      lastName: lastName,
      phone: admin.phone || "",
      email: admin.email || "",
      password: "", // Don't pre-fill password for security
      confirmPassword: "",
      profileImage: admin.profileImage || "",
      role: admin.role || "admin",
      status: admin.status || "Active"
    });
    setEditingAdmin(admin);
    setCurrentView("edit");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView("list");
    setEditingAdmin(null);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle form submit for both add and edit
  const handleSubmit = async () => {
    // Frontend validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return toast({
        title: "Validation Error",
        description: "First name, last name, and email are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return toast({
        title: "Validation Error",
        description: "Invalid email format",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // For add admin, password is required
    if (currentView === "add" && !formData.password) {
      return toast({
        title: "Validation Error",
        description: "Password is required for new admins",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // Validate password strength if provided
    if (formData.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        return toast({
          title: "Validation Error",
          description:
            "Password must be at least 8 characters, include uppercase, lowercase, and a number",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }

    // Check password confirmation for add admin
    if (currentView === "add" && formData.password !== formData.confirmPassword) {
      return toast({
        title: "Validation Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // Prevent creating owner accounts
    if (formData.role?.toLowerCase() === "owner") {
      return toast({
        title: "Permission Denied",
        description: "Owner accounts cannot be created through the admin interface",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data for API
      let adminDataToSend = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phone: formData.phone || "",
        profileImage: formData.profileImage || "",
        ...(formData.password && { password: formData.password })
      };

      let response;
      let successMessage;

      if (currentView === "edit" && editingAdmin) {
        // Update existing admin
        response = await updateAdmin(editingAdmin._id, adminDataToSend);
        successMessage = `Admin ${formData.firstName} updated successfully`;
      } else {
        // Create new admin
        response = await createAdmin(adminDataToSend);
        successMessage = `Admin ${formData.firstName} created successfully`;
      }

      toast({
        title: currentView === "edit" ? "Admin Updated" : "Admin Created",
        description: successMessage,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh admin list
      const fetchAdmins = async () => {
        try {
          const adminsResponse = await getAllTechnicians();
          const admins = adminsResponse.data?.admins || adminsResponse.data || adminsResponse?.admins || adminsResponse || [];
          
          // Filter out owner accounts
          const nonOwnerAdmins = admins.filter(admin => 
            admin.role?.toLowerCase() !== "owner"
          );
          
          const sortedAdmins = nonOwnerAdmins.sort(
            (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
          );
          setAdminData(sortedAdmins);
          setFilteredData(sortedAdmins);
        } catch (err) {
          console.error("Error refreshing admins:", err);
        }
      };

      await fetchAdmins();

      setSuccess(successMessage);
      
      // Reset form and go back to list
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImage: "",
        role: "admin",
        status: "Active"
      });
      setEditingAdmin(null);
      setCurrentView("list");

    } catch (err) {
      console.error("API Error details:", err);
      
      let errorMessage = "API error. Try again.";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  // Auto-hide success/error messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Get status color with background and icon
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { 
          color: "white", 
          bg: "green.500",
          icon: IoCheckmarkDoneCircleSharp
        };
      case "active":
        return { 
          color: "white", 
          bg: "#9d4edd",
          icon: IoCheckmarkDoneCircleSharp
        };
      case "inactive":
        return { 
          color: "white", 
          bg: "red.500",
          icon: FaUserSlash
        };
      case "pending":
        return { 
          color: "white", 
          bg: "yellow.500",
          icon: MdPerson
        };
      default:
        return { 
          color: "white", 
          bg: "gray.500",
          icon: MdPerson
        };
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const roleLower = role?.toLowerCase();
    if (roleLower === "owner") return "purple";
    if (roleLower === "super admin") return "blue";
    if (roleLower === "admin") return "green";
    return "gray";
  };

  // Card click handlers
  const handleCardClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // Pagination handlers
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

  // KYC Handlers
  const handleViewKYC = async (technician) => {
    setSelectedTechnicianForKYC(technician);
    setIsKYCModalOpen(true);
    setKYCData(null);
    setKYcLoading(true);
    try {
      const idToFetch = technician._id; 
      const response = await getTechnicianKYC(idToFetch);
      // Determine response structure
      setKYCData(response.data || response.result || response);
    } catch (error) {
      console.error("Failed to fetch KYC:", error);
      toast({
        title: "Info",
        description: "KYC documents not found or error fetching them.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setKYCData(null); 
    } finally {
      setKYcLoading(false);
    }
  };

  const handleVerifyKYCAction = async (status) => {
     if (!selectedTechnicianForKYC) return;
     
     // specific check for rejection
     if (status === "rejected") {
       if (!rejectionInput || rejectionInput.trim() === "") {
         toast({
          title: "Validation Error",
          description: "Please enter a rejection reason in the field below before rejecting.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
       }
     }

     try {
       const payload = {
         technicianId: selectedTechnicianForKYC._id,
         status: status
       };
       
       if (status === "rejected" && rejectionInput) {
         payload.rejectionReason = rejectionInput;
       }

       await verifyKYC(payload);
       
       toast({
         title: "Success",
         description: `KYC has been ${status}.`,
         status: "success",
         duration: 3000,
         isClosable: true,
       });

       closeKYCModal();
       
       // Refresh list
       const refresh = async () => {
          try {
            const response = await getAllTechnicians();
            const admins = response.result || response.data?.admins || response.data || response?.admins || response || [];
            if (Array.isArray(admins)) {
               const sortedAdmins = admins.sort(
                  (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
               );
               setAdminData(sortedAdmins);
               setFilteredData(sortedAdmins);
            }
          } catch(e) {
            console.error("Error refreshing list:", e);
          }
       };
       refresh();

     } catch (error) {
       console.error("KYC Verification Error:", error);
       let errorMsg = "Failed to update KYC status.";
       // Try to extract message from response if available
       if (error.response && error.response.data && error.response.data.message) {
           errorMsg = error.response.data.message;
       } else if (error.message) {
           errorMsg = error.message;
       }

       toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
     }
  };

  const handleDeleteKYC = async (technician) => {
      if (!technician?._id) return;
      
      try {
        setIsDeletingKYC(true);
        await deleteKYC(technician._id);
        
        toast({
          title: "Success",
          description: "KYC record deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // If modal is open, close it
        if (isKYCModalOpen) {
          closeKYCModal();
        }

        // Reset deletion ID
        setTechnicianIdToDeleteKYC(null);
        
        // Refresh list
        const response = await getAllTechnicians();
        const admins = response.result || response.data?.admins || response.data || response?.admins || response || [];
        if (Array.isArray(admins)) {
           const sortedAdmins = admins.sort(
              (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
           );
           setAdminData(sortedAdmins);
           setFilteredData(sortedAdmins);
        }
      } catch (error) {
         console.error("Delete KYC Error:", error);
         toast({
          title: "Error",
          description: "Failed to delete KYC record.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsDeletingKYC(false);
      }
  };

  const handleTrainingCompletion = async (technician, status = true) => {
    try {
      setLoading(true);
      
      await updateTrainingStatus(technician._id, status);
      
      toast({
        title: "Training Updated",
        description: `Technician training status marked as ${status ? "completed" : "pending"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Update selectedTechnician if it's the one being modified
      if (selectedTechnician && selectedTechnician._id === technician._id) {
        setSelectedTechnician(prev => ({ ...prev, trainingCompleted: status }));
      }

      // Refresh list
      const response = await getAllTechnicians();
      const admins = response.result || response.data?.admins || response.data || response?.admins || response || [];
      if (Array.isArray(admins)) {
         const sortedAdmins = admins.sort(
            (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
         );
         setAdminData(sortedAdmins);
         setFilteredData(sortedAdmins);
      }
    } catch (error) {
       console.error("Training Update Error:", error);
       let errorMsg = "Failed to update training status.";
       if (error.response && error.response.data && error.response.data.message) {
           errorMsg = error.response.data.message;
       } else if (error.message) {
           errorMsg = error.message;
       }
       
       toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
       });
    } finally {
      setLoading(false);
    }
  };

  const closeKYCModal = () => {
    setIsKYCModalOpen(false);
    setKYCData(null);
    setSelectedTechnicianForKYC(null);
    setRejectionInput("");
    setShowRejectionInput(false);
    setConfirmingModalDelete(false);
  };

  const handleViewDetails = (technician) => {
    setSelectedTechnician(technician);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTechnician(null);
  };

  // If currentUser is null (still checking or not owner), show loading
  if (!currentUser) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color={customColor} />
        <Text ml={4}>Checking permissions...</Text>
      </Flex>
    );
  }

  // Render Form View (Add/Edit)
  if (currentView === "add" || currentView === "edit") {
    return (
      <Flex 
        flexDirection="column" 
        pt={{ base: "120px", md: "75px" }} 
        height="100vh" 
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
        }}
      >
        <Card bg="white" shadow="xl" height="100%" display="flex" flexDirection="column">
          <CardHeader bg="white" flexShrink={0}>
            <Flex align="center" mb={4}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={handleBackToList}
                mr={4}
                color={customColor}
                _hover={{ bg: `${customColor}10` }}
              >
                {/* Back arrow only */}
              </Button>
              <Heading size="md" color="gray.700">
                {currentView === "add" ? "Add New Admin" : "Edit Admin"}
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody bg="white" flex="1" overflow="auto">
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
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="firstName" color="gray.700">First Name</FormLabel>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleInputChange}
                  value={formData.firstName}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel htmlFor="lastName" color="gray.700">Last Name</FormLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleInputChange}
                  value={formData.lastName}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="email" color="gray.700">Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  onChange={handleInputChange}
                  value={formData.email}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel htmlFor="phone" color="gray.700">Phone</FormLabel>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleInputChange}
                  value={formData.phone}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel htmlFor="role" color="gray.700">Role</FormLabel>
                <Select
                  id="role"
                  name="role"
                  onChange={handleInputChange}
                  value={formData.role}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                >
                  <option value="admin">Admin</option>
                  <option value="super admin">Super Admin</option>
                  {/* Owner role is not selectable */}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="status" color="gray.700">Status</FormLabel>
                <Select
                  id="status"
                  name="status"
                  onChange={handleInputChange}
                  value={formData.status}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl isRequired={currentView === "add"}>
                <FormLabel htmlFor="password" color="gray.700">
                  {currentView === "add" ? "Password *" : "New Password (optional)"}
                </FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={currentView === "add" ? "Password" : "New Password"}
                    onChange={handleInputChange}
                    value={formData.password}
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.500"
                      _hover={{ color: customColor, bg: "transparent" }}
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {currentView === "add" && (
                <FormControl isRequired>
                  <FormLabel htmlFor="confirmPassword" color="gray.700">
                    Confirm Password *
                  </FormLabel>
                  <InputGroup>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      onChange={handleInputChange}
                      value={formData.confirmPassword}
                      borderColor={`${customColor}50`}
                      _hover={{ borderColor: customColor }}
                      _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                      bg="white"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        color="gray.500"
                        _hover={{ color: customColor, bg: "transparent" }}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              )}
            </SimpleGrid>

            <Flex justify="flex-end" mt={6} flexShrink={0}>
              <Button 
                variant="outline" 
                mr={3} 
                onClick={handleBackToList}
                border="1px"
                borderColor="gray.300"
              >
                Cancel
              </Button>
              <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={handleSubmit}
                isLoading={loading}
              >
                {currentView === "add" ? "Create Admin" : "Update Admin"}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  // Render List View
  return (
    <Flex 
      flexDirection="column" 
      pt={{ base: "5px", md: "45px" }} 
      height="100vh" 
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
      }}
    >
      {/* Fixed Statistics Cards */}
      <Box mb="24px">
        <Flex
          direction="row"
          wrap="wrap"
          justify="center"
          gap={{ base: 3, md: 4 }}
          overflowX="auto"
          py={2}
          css={{
            '&::-webkit-scrollbar': {
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
          }}
        >
          {/* Total Admins Card */}
          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => handleCardClick("all")}
            border={activeFilter === "all" ? "2px solid" : "1px solid"}
            borderColor={customBorderColor}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="0px"
                  >
                    Total Technician
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>
                      {adminData.length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
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
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Active Admins Card */}
          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => handleCardClick("Active")}
            border={activeFilter === "Active" ? "2px solid" : "1px solid"}
            borderColor={customBorderColor}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="2px"
                  >
                    Active Technician
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>
                      {adminData.filter((a) => a.status?.toLowerCase() === "approved" || a.status?.toLowerCase() === "active").length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox 
                  as="box" 
                  h={{ base: "35px", md: "45px" }} 
                  w={{ base: "35px", md: "45px" }} 
                  bg={customColor}
                  transition="all 0.2s ease-in-out"
                >
                  <Icon
                    as={IoCheckmarkDoneCircleSharp}
                    h={{ base: "18px", md: "24px" }}
                    w={{ base: "18px", md: "24px" }}
                    color="white"
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Deleted Admins Card */}
          <Card
            minH="83px"
            cursor="pointer"
            onClick={() => handleCardClick("Verified")}
            border={activeFilter === "Verified" ? "2px solid" : "1px solid"}
            borderColor={customBorderColor}
            transition="all 0.2s ease-in-out"
            bg="white"
            position="relative"
            overflow="hidden"
            w={{ base: "32%", md: "30%", lg: "25%" }}
            minW="100px"
            flex="1"
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
            <CardBody position="relative" zIndex={1} p={{ base: 3, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="space-between" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="2px"
                  >
                    Verified Technician
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "lg", md: "xl" }} color={textColor}>
                      {adminData.filter((a) => 
                        (a.status?.toLowerCase() === "approved" || a.status?.toLowerCase() === "active") && 
                        a.trainingCompleted === true
                      ).length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox 
                  as="box" 
                  h={{ base: "35px", md: "45px" }} 
                  w={{ base: "35px", md: "45px" }} 
                  bg={customColor}
                  transition="all 0.2s ease-in-out"
                >
                  <Icon
                    as={MdAdminPanelSettings}
                    h={{ base: "18px", md: "24px" }}
                    w={{ base: "18px", md: "24px" }}
                    color="white"
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        </Flex>

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
          <Text fontSize="lg" fontWeight="bold" color={textColor} pl="25px">
            {activeFilter === "Active" && "Active Technician"}
            {activeFilter === "Inactive" && "Inactive Technician"}
            {activeFilter === "Verified" && "Verified Technician"}
            {activeFilter === "all" && "All Technician"}
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

      {/* Table Container */}
      <Box 
        mt={-8}
        flex="1" 
        display="flex" 
        flexDirection="column" 
        p={2}
        pt={0}
        overflow="hidden"
      >
        <Card 
          shadow="xl" 
          bg="white"
          display="flex" 
          flexDirection="column"
          height="100%"
          minH="0"
          border="1px solid"
          borderColor={customBorderColor}
        >
          {/* Table Header */}
          <CardHeader 
            p="5px" 
            pb="5px"
            bg="transparent"
            flexShrink={0}
            borderBottom="1px solid"
            borderColor={`${customColor}20`}
          >
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              {/* Title */}
              <Heading size="md" flexShrink={0} color="gray.700">
                👤 Technician Table
              </Heading>

              {/* Search Bar */}
              <Flex align="center" flex="1" maxW="400px">
                <Input
                  placeholder="Search by name, email, phone, or role..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="sm"
                  mr={2}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  bg="white"
                />
                <Icon as={FaSearch} color="gray.400" />
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
                  >
                    Clear
                  </Button>
                )}
              </Flex>

              {/* Add Admin Button */}
              {/* <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={handleAddAdmin}
                fontSize="sm"
                borderRadius="8px"
                flexShrink={0}
              >
                + Add Admin
              </Button> */}
            </Flex>
          </CardHeader>
          
          {/* Table Content Area */}
          <CardBody 
            bg="transparent"
            flex="1" 
            display="flex" 
            flexDirection="column" 
            p={0} 
            overflow="hidden"
          >
            {tableLoading ? (
              <Flex justify="center" align="center" py={10} flex="1">
                <Spinner size="xl" color={customColor} />
                <Text ml={4}>Loading admins...</Text>
              </Flex>
            ) : (
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                {currentItems.length > 0 ? (
                  <>
                    <Box 
                      flex="1"
                      display="flex"
                      flexDirection="column"
                      height="400px"
                      overflow="hidden"
                    >
                      <Box
                        flex="1"
                        overflowY="hidden"
                        overflowX="hidden"
                        _hover={{
                          overflowY: "auto",
                          overflowX: "auto",
                        }}
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'transparent',
                            borderRadius: '4px',
                            transition: 'background 0.3s ease',
                          },
                          '&:hover::-webkit-scrollbar-thumb': {
                            background: '#cbd5e1',
                          },
                          '&:hover::-webkit-scrollbar-thumb:hover': {
                            background: '#94a3b8',
                          },
                        }}
                      >
                        <Table variant="simple" size="md" bg="transparent">
                          <Thead>
                            <Tr>
                              <Th 
                                color="gray.100" 
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Technician Name
                              </Th>
                              <Th 
                                color="gray.100" 
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
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
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Experience
                              </Th>
                              <Th 
                                color="gray.100" 
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                City
                              </Th>
                              <Th 
                                color="gray.100" 
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Rating
                              </Th>
                              <Th 
                                color="gray.100" 
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Total Jobs
                              </Th>
                              <Th 
                                color="gray.100" 
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Actions
                              </Th>
                            </Tr>
                          </Thead>

                          <Tbody bg="transparent">
                            {displayItems.map((admin, index) => {
                              if (admin.isEmpty) {
                                return (
                                  <Tr 
                                    key={admin._id}
                                    bg="transparent"
                                    height="60px"
                                  >
                                    <Td borderColor={`${customColor}20`} colSpan={7}>
                                      <Box height="60px" />
                                    </Td>
                                  </Tr>
                                );
                              }

                              const statusConfig = getStatusConfig(admin.status);
                              return (
                                <Tr 
                                  key={admin._id || index}
                                  bg="transparent"
                                  _hover={{ bg: `${customColor}10` }}
                                  borderBottom="1px"
                                  borderColor={`${customColor}20`}
                                  height="60px"
                                >
                                  <Td borderColor={`${customColor}20`}>
                                    <Flex align="center">
                                      <Avatar
                                        size="sm"
                                        name={`${admin.firstName} ${admin.lastName}` || "Unknown"}
                                        src={admin.profileImage || ""}
                                        mr={3}
                                      />
                                      <Box>
                                        <Text fontWeight="medium" color="gray.700">
                                          {admin.firstName} {admin.lastName}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {admin.email || "No Email"}
                                        </Text>
                                        {admin.availability?.isOnline && (
                                          <Badge colorScheme="green" fontSize="xs" mt={1}>Online</Badge>
                                        )}
                                      </Box>
                                    </Flex>
                                  </Td>
                                  <Td borderColor={`${customColor}20`}>
                                    <Badge
                                      bg={statusConfig.bg}
                                      color={statusConfig.color}
                                      px={3}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="sm"
                                      fontWeight="bold"
                                      display="flex"
                                      alignItems="center"
                                      gap={2}
                                      width="fit-content"
                                    >
                                      <Icon as={statusConfig.icon} boxSize={3} />
                                      {admin.status || "Unknown"}
                                    </Badge>
                                  </Td>
                                  <Td borderColor={`${customColor}20`}>
                                    <Text fontWeight="medium" color="gray.700">
                                      {admin.experienceYears ? `${admin.experienceYears} Years` : "N/A"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`}>
                                    <Text fontWeight="medium" color="gray.700">
                                      {admin.city || "N/A"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`}>
                                    <Flex align="center">
                                      <Icon as={FaSearch} color="yellow.400" mr={1} boxSize={3} />
                                      <Text fontWeight="bold">{admin.rating?.avg?.toFixed(1) || "0.0"}</Text>
                                      <Text fontSize="xs" color="gray.500" ml={1}>({admin.rating?.count || 0})</Text>
                                    </Flex>
                                  </Td>
                                  <Td borderColor={`${customColor}20`}>
                                    <Text fontWeight="medium">{admin.totalJobsCompleted || 0}</Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`}>
                                    <Flex gap={2}>
                                      <IconButton
                                        aria-label="View Details"
                                        icon={<FaEye />}
                                        bg="white"
                                        color="purple.500"
                                        border="1px"
                                        borderColor="purple.500"
                                        _hover={{ bg: "purple.500", color: "white" }}
                                        size="sm"
                                        onClick={() => handleViewDetails(admin)}
                                        title="View Details"
                                      />
                                      <IconButton
                                        aria-label="View KYC"
                                        icon={<MdAdminPanelSettings />} /* Using a different icon to distinguish */
                                        bg="white"
                                        color="blue.500"
                                        border="1px"
                                        borderColor="blue.500"
                                        _hover={{ bg: "blue.500", color: "white" }}
                                        size="sm"
                                        onClick={() => handleViewKYC(admin)}
                                        title="View KYC Documents"
                                      />
                                      <IconButton
                                        aria-label="Delete technician"
                                        icon={<FaUserSlash />}
                                        bg="white"
                                        color="red.500"
                                        border="1px"
                                        borderColor="red.500"
                                        _hover={{ bg: "red.500", color: "white" }}
                                        size="sm"
                                        onClick={() => handleDeleteAdmin(admin)}
                                        title="Delete technician"
                                      />
                                    </Flex>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>

                    {/* Pagination Bar */}
                    {currentItems.length > 0 && (
                      <Box 
                        flexShrink={0}
                        p="16px"
                        borderTop="1px solid"
                        borderColor={`${customColor}20`}
                        bg="transparent"
                      >
                        <Flex
                          justify="flex-end"
                          align="center"
                          gap={3}
                        >
                          <Text fontSize="sm" color="gray.600" display={{ base: "none", sm: "block" }}>
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} admins
                          </Text>

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
                              <Text fontSize="sm" color="gray.500">
                                /
                              </Text>
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
                  </>
                ) : (
                  <Flex 
                    height="200px" 
                    justify="center" 
                    align="center" 
                    border="1px dashed"
                    borderColor={`${customColor}30`}
                    borderRadius="md"
                    flex="1"
                    bg="transparent"
                  >
                    <Text textAlign="center" color="gray.500" fontSize="lg">
                      {dataLoaded
                        ? adminData.length === 0
                          ? "No admins found."
                          : searchTerm
                          ? "No admins match your search."
                          : "No admins match the selected filter."
                        : "Loading admins..."}
                    </Text>
                  </Flex>
                )}
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      <Modal isOpen={isKYCModalOpen} onClose={closeKYCModal} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>KYC Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {kycLoading ? (
               <Flex justify="center" align="center" h="200px">
                  <Spinner size="xl" color={customColor} />
               </Flex>
            ) : kycData ? (
               <Box>
                  {(() => {
                    // Filter to find the correct KYC record for this technician
                    let kycRecord = kycData;
                    if (Array.isArray(kycData)) {
                        kycRecord = kycData.find(doc => {
                            const tId = doc.technicianId?._id || doc.technicianId;
                            return tId === selectedTechnicianForKYC?._id;
                        });
                    }
                    
                    if (!kycRecord) return <Text textAlign="center">No matching KYC Data found for this technician.</Text>;

                    return (
                      <>
                        <Text fontWeight="bold" mb={4} fontSize="lg" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                           Technician: <Text as="span" color={customColor}>{selectedTechnicianForKYC?.firstName} {selectedTechnicianForKYC?.lastName}</Text>
                        </Text>
                        
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                           {/* Identity Proof (Aadhaar) */}
                           <Box>
                              <Text fontWeight="semibold" mb={2} color="gray.600">Aadhaar Card</Text>
                              {kycRecord.documents?.aadhaarUrl ? (
                                 <Box border="1px solid #eee" borderRadius="md" overflow="hidden" boxShadow="sm">
                                    <img 
                                      src={kycRecord.documents.aadhaarUrl} 
                                      alt="Aadhaar Card" 
                                      style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                                      onClick={() => window.open(kycRecord.documents.aadhaarUrl, '_blank')}
                                      cursor="pointer"
                                    />
                                    <Button 
                                      size="xs" 
                                      width="100%" 
                                      borderRadius="0"
                                      as="a" 
                                      href={kycRecord.documents.aadhaarUrl} 
                                      target="_blank"
                                      colorScheme="purple"
                                      variant="ghost"
                                    >
                                      View Full Image
                                    </Button>
                                 </Box>
                              ) : <Flex height="150px" bg="gray.50" align="center" justify="center" border="1px dashed gray"><Text color="gray.400">Not Uploaded</Text></Flex>}
                               <Text mt={2} fontSize="sm"><strong>No:</strong> {kycRecord.aadhaarNumber || "N/A"}</Text>
                           </Box>

                           {/* PAN Card */}
                           <Box>
                              <Text fontWeight="semibold" mb={2} color="gray.600">PAN Card</Text>
                               {kycRecord.documents?.panUrl ? (
                                 <Box border="1px solid #eee" borderRadius="md" overflow="hidden" boxShadow="sm">
                                    <img 
                                      src={kycRecord.documents.panUrl} 
                                      alt="PAN Card" 
                                      style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                                      onClick={() => window.open(kycRecord.documents.panUrl, '_blank')}
                                      cursor="pointer"
                                    />
                                    <Button 
                                      size="xs" 
                                      width="100%" 
                                      borderRadius="0"
                                      as="a" 
                                      href={kycRecord.documents.panUrl} 
                                      target="_blank"
                                      colorScheme="purple"
                                      variant="ghost"
                                    >
                                      View Full Image
                                    </Button>
                                 </Box>
                              ) : <Flex height="150px" bg="gray.50" align="center" justify="center" border="1px dashed gray"><Text color="gray.400">Not Uploaded</Text></Flex>}
                              <Text mt={2} fontSize="sm"><strong>No:</strong> {kycRecord.panNumber || "N/A"}</Text>
                           </Box>

                           {/* Driving License */}
                           <Box>
                              <Text fontWeight="semibold" mb={2} color="gray.600">Driving License</Text>
                               {kycRecord.documents?.dlUrl ? (
                                 <Box border="1px solid #eee" borderRadius="md" overflow="hidden" boxShadow="sm">
                                    <img 
                                      src={kycRecord.documents.dlUrl} 
                                      alt="Driving License" 
                                      style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                                      onClick={() => window.open(kycRecord.documents.dlUrl, '_blank')}
                                      cursor="pointer"
                                    />
                                    <Button 
                                      size="xs" 
                                      width="100%" 
                                      borderRadius="0"
                                      as="a" 
                                      href={kycRecord.documents.dlUrl} 
                                      target="_blank"
                                      colorScheme="purple"
                                      variant="ghost"
                                    >
                                      View Full Image
                                    </Button>
                                 </Box>
                              ) : <Flex height="150px" bg="gray.50" align="center" justify="center" border="1px dashed gray"><Text color="gray.400">Not Uploaded</Text></Flex>}
                              <Text mt={2} fontSize="sm"><strong>No:</strong> {kycRecord.drivingLicenseNumber || "N/A"}</Text>
                           </Box>
                        </SimpleGrid>

                         <Box mt={6} p={4} bg={kycRecord.verificationStatus === 'approved' ? 'green.50' : kycRecord.verificationStatus === 'rejected' ? 'red.50' : 'yellow.50'} borderRadius="md">
                            <Text fontSize="md">
                              <strong>Verification Status: </strong> 
                              <Badge 
                                colorScheme={kycRecord.verificationStatus === 'approved' ? 'green' : kycRecord.verificationStatus === 'rejected' ? 'red' : 'yellow'}
                                fontSize="0.9em"
                                ml={2}
                              >
                                {kycRecord.verificationStatus || "Pending"}
                              </Badge>
                            </Text>
                             {/* Additional metadata if available */}
                             {kycRecord.verifiedAt && <Text fontSize="sm" mt={1} color="gray.600">Verified At: {new Date(kycRecord.verifiedAt).toLocaleDateString()}</Text>}
                             {kycRecord.rejectionReason && <Text fontSize="sm" mt={1} color="red.500"><strong>Rejection Reason:</strong> {kycRecord.rejectionReason}</Text>}
                         </Box>
                         
                         {showRejectionInput && (
                           <Box mt={4}>
                             <Text mb={2} fontWeight="bold" fontSize="sm">Reason for Rejection (Required):</Text>
                             <Textarea 
                               placeholder="Enter reason for rejection here..."
                               value={rejectionInput}
                               onChange={(e) => setRejectionInput(e.target.value)}
                               bg="white"
                             />
                           </Box>
                         )}
                      </>
                    );
                  })()}
               </Box>
            ) : (
                <Text textAlign="center" py={10}>No KYC documents found for this technician.</Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={closeKYCModal}>
              Close
            </Button>
            {kycData && (
              <Button 
                colorScheme="orange" 
                variant="ghost" 
                mr="auto"
                leftIcon={<FaExclamationTriangle />}
                onClick={() => {
                  if (confirmingModalDelete) {
                    handleDeleteKYC(selectedTechnicianForKYC);
                  } else {
                    setConfirmingModalDelete(true);
                  }
                }}
                isLoading={isDeletingKYC}
              >
                {confirmingModalDelete ? "Confirm Delete?" : "Delete Record"}
              </Button>
            )}
            {kycData && (
              <>
                {!showRejectionInput ? (
                  <>
                    <Button 
                      colorScheme="red" 
                      mr={3} 
                      onClick={() => setShowRejectionInput(true)}
                      isDisabled={(() => {
                        // Only disable if no record matches
                        let kycRecord = kycData;
                        if (Array.isArray(kycData)) {
                            kycRecord = kycData.find(doc => (doc.technicianId?._id || doc.technicianId) === selectedTechnicianForKYC?._id);
                        }
                        return !kycRecord;
                      })()}
                    >
                      Reject
                    </Button>
                    <Button 
                      colorScheme="green" 
                      onClick={() => handleVerifyKYCAction("approved")}
                      isDisabled={(() => {
                        let kycRecord = kycData;
                        if (Array.isArray(kycData)) {
                            kycRecord = kycData.find(doc => (doc.technicianId?._id || doc.technicianId) === selectedTechnicianForKYC?._id);
                        }
                        return !kycRecord || kycRecord.verificationStatus === 'approved';
                      })()}
                    >
                      Approve (Verify)
                    </Button>
                  </>
                ) : (
                  <>
                     <Button 
                      variant="ghost" 
                      mr={3} 
                      onClick={() => {
                        setShowRejectionInput(false);
                        setRejectionInput("");
                      }}
                    >
                      Cancel Rejection
                    </Button>
                    <Button 
                      colorScheme="red" 
                      onClick={() => handleVerifyKYCAction("rejected")}
                    >
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Technician
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={closeDeleteDialog}
                isDisabled={isDeleting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                bg="red.500"
                _hover={{ bg: "red.600" }}
                color="white"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                loadingText="Deleting..."
                ml={3}
                size="sm"
              >
                Delete Admin
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    {/* Details Preview Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Technician Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTechnician && (
              <Box>
                <Flex align="center" mb={6}>
                  <Avatar 
                    size="xl" 
                    name={`${selectedTechnician.firstName} ${selectedTechnician.lastName}`} 
                    src={selectedTechnician.profileImage} 
                    mr={4}
                    border="2px solid"
                    borderColor={customColor}
                  />
                  <Box>
                    <Heading size="md">{selectedTechnician.firstName} {selectedTechnician.lastName}</Heading>
                    <Text color="gray.500">{selectedTechnician.email}</Text>
                    <Badge colorScheme={selectedTechnician.status === "Active" ? "green" : "red"} mt={1}>
                      {selectedTechnician.status}
                    </Badge>
                  </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" color="gray.500" mb={1} fontSize="xs" textTransform="uppercase">Contact Info</Text>
                    <Text mb={2}><strong>Mobile:</strong> {selectedTechnician.mobileNumber}</Text>
                    <Text mb={2}><strong>Email:</strong> {selectedTechnician.email}</Text>
                    <Text><strong>Gender:</strong> {selectedTechnician.gender || "N/A"}</Text>
                  </Box>

                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" color="gray.500" mb={1} fontSize="xs" textTransform="uppercase">Professional Info</Text>
                    <Text mb={2}><strong>Experience:</strong> {selectedTechnician.experienceYears} Years</Text>
                    <Text mb={2}><strong>Specialization:</strong> {selectedTechnician.specialization || "N/A"}</Text>
                    <Text mb={2}><strong>Total Jobs:</strong> {selectedTechnician.totalJobsCompleted}</Text>
                    <Text>
                      <strong>Training:</strong>{" "}
                      <Badge colorScheme={selectedTechnician.trainingCompleted ? "green" : "orange"}>
                        {selectedTechnician.trainingCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </Text>
                  </Box>

                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" color="gray.500" mb={1} fontSize="xs" textTransform="uppercase">Address</Text>
                    <Text mb={1}>{selectedTechnician.address}</Text>
                    <Text mb={1}>{selectedTechnician.locality}, {selectedTechnician.city}</Text>
                    <Text>{selectedTechnician.state} - {selectedTechnician.pincode}</Text>
                  </Box>

                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" color="gray.500" mb={1} fontSize="xs" textTransform="uppercase">StatUs</Text>
                    <Text mb={2}><strong>Rating:</strong> {selectedTechnician.rating?.avg} ({selectedTechnician.rating?.count} reviews)</Text>
                    <Text mb={2}><strong>Wallet Balance:</strong> ₹{selectedTechnician.walletBalance}</Text>
                    <Text><strong>Work Status:</strong> {selectedTechnician.workStatus}</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
             {selectedTechnician && (
               <Button
                 bg={selectedTechnician.trainingCompleted ? "red.500" : "teal.500"}
                 _hover={{ bg: selectedTechnician.trainingCompleted ? "red.600" : "teal.600" }}
                 color="white"
                 mr={3}
                 onClick={() => handleTrainingCompletion(selectedTechnician, !selectedTechnician.trainingCompleted)}
                 isLoading={loading}
                 leftIcon={<FaUserGraduate />}
               >
                 {selectedTechnician.trainingCompleted ? "Mark Training as Incomplete" : "Approve Training"}
               </Button>
             )}
            <Button colorScheme="blue" mr={3} onClick={closeDetailsModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

// Custom IconBox component
function IconBox({ children, ...rest }) {
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

export default AdminManagement;