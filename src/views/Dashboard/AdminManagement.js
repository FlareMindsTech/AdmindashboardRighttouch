// AdminManagement.js - OWNER ONLY ACCESS
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
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Select,
  Textarea,
  Tooltip,
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
  FaUserGraduate,
  FaIdCard,
  FaHistory,
  FaTrash,
  FaSearchPlus,
  FaSearchMinus,
  FaRedo,
  FaUndo,
  FaArrowLeft,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdAdminPanelSettings, MdWarning } from "react-icons/md";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  getAllTechnicians,
  updateAdmin,
  createAdmin,
  deleteTechnician,
  getTechnicianKYC,
  getAllKYCRecords,
  verifyKYC,
  deleteKYC,
  updateTrainingStatus,
  getTechnicianJobHistory,
} from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

// Helper to resolve technician name safely
const getTechnicianName = (tech) => {
  if (!tech) return "Unknown";

  const isDeleted = (str) => str && (typeof str === 'string') && (str.startsWith("deleted_") || str.includes("example.invalid"));

  // Top level specific fields
  if (tech.name && tech.name.trim() !== "") {
    if (isDeleted(tech.name)) return "Deleted Technician";
    return tech.name;
  }

  if (tech.firstName) {
    const fullName = `${tech.firstName} ${tech.lastName || ""}`.trim();
    if (isDeleted(fullName)) return "Deleted Technician";
    return fullName;
  }

  if (tech.fname) {
    const fullName = `${tech.fname} ${tech.lname || ""}`.trim();
    if (isDeleted(fullName)) return "Deleted Technician";
    return fullName;
  }

  // Profile fields
  if (tech.profile?.name) {
    if (isDeleted(tech.profile.name)) return "Deleted Technician";
    return tech.profile.name;
  }

  if (tech.profile?.firstName) {
    const fullName = `${tech.profile.firstName} ${tech.profile.lastName || ""}`.trim();
    if (isDeleted(fullName)) return "Deleted Technician";
    return fullName;
  }

  // Nested userId fields
  if (tech.userId) {
    if (typeof tech.userId === 'object') {
      if (tech.userId.name) {
        if (isDeleted(tech.userId.name)) return "Deleted Technician";
        return tech.userId.name;
      }
      if (tech.userId.firstName) {
        const fullName = `${tech.userId.firstName} ${tech.userId.lastName || ""}`.trim();
        if (isDeleted(fullName)) return "Deleted Technician";
        return fullName;
      }
      if (tech.userId.fname) {
        const fullName = `${tech.userId.fname} ${tech.userId.lname || ""}`.trim();
        if (isDeleted(fullName)) return "Deleted Technician";
        return fullName;
      }
    }
  }

  // Fallback email or ID
  if (tech.email) {
    if (isDeleted(tech.email)) return "Deleted Technician";
    return tech.email.split('@')[0];
  }

  return "Unknown";
};

const getTechnicianImage = (tech) => {
  return tech?.profileImage || tech?.profile?.profileImage || (typeof tech?.userId === 'object' ? tech?.userId?.profileImage : "") || "";
};

// Custom IconBox component
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

// Mobile Card Component for Technician
const TechnicianMobileCard = ({ tech, idx, indexOfFirstItem, onViewDetails, onViewKYC, onViewHistory, onDelete }) => {
  const userName = getTechnicianName(tech);
  const customColor = "#008080";

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
          <Avatar size="xs" name={userName} src={getTechnicianImage(tech)} />
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {userName}
          </Text>
        </HStack>
        <Badge
          colorScheme={tech.status?.toLowerCase() === "active" || tech.status?.toLowerCase() === "approved" ? "green" : "red"}
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {tech.status || "Active"}
        </Badge>
      </Flex>

      <Text fontSize="2xs" color="gray.600" noOfLines={1} mb={2}>
        {tech.specialization || tech.profile?.specialization || "No specialization"} • 
        {tech.city || tech.profile?.city || tech.locality || "No city"}
      </Text>

      <HStack spacing={2} mb={3} wrap="wrap">
        <Badge colorScheme="blue" variant="subtle" fontSize="3xs">
          Jobs: {tech.totalJobsCompleted || tech.jobStats?.completed || 0}
        </Badge>
        <Badge 
          colorScheme={tech.trainingCompleted ? "green" : "orange"} 
          fontSize="3xs"
        >
          Training: {tech.trainingCompleted ? "Done" : "Pending"}
        </Badge>
        <Badge colorScheme="purple" fontSize="3xs">
          Rating: {tech.rating?.avg?.toFixed(1) || "0.0"}
        </Badge>
      </HStack>

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View details"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => onViewDetails(tech)}
        />
        <IconButton
          aria-label="View KYC"
          icon={<MdAdminPanelSettings />}
          size="xs"
          colorScheme="green"
          variant="ghost"
          onClick={() => onViewKYC(tech)}
        />
        <IconButton
          aria-label="View history"
          icon={<FaHistory />}
          size="xs"
          colorScheme="orange"
          variant="ghost"
          onClick={() => onViewHistory(tech)}
        />
        <IconButton
          aria-label="Delete technician"
          icon={<FaTrash />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={() => onDelete(tech)}
        />
      </Flex>
    </Box>
  );
};

export default function AdminManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const navigate = useNavigate();

  // Custom color theme (matching UserManagement)
  const customColor = "#008080";

  // State hooks
  const [currentUser, setCurrentUser] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allKycRecords, setAllKycRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal states
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [kycData, setKYCData] = useState(null);
  const [kycLoading, setKYcLoading] = useState(false);
  const [selectedTechnicianForKYC, setSelectedTechnicianForKYC] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTechForHistory, setSelectedTechForHistory] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Image preview state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  // KYC verification states
  const [rejectionInput, setRejectionInput] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [confirmingModalDelete, setConfirmingModalDelete] = useState(false);
  const [isDeletingKYC, setIsDeletingKYC] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef();

  // Global scrollbar styles (matching UserManagement)
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

  // Calculate technician statistics (matching UserManagement style)
  const calculateTechStats = useCallback(() => {
    const totalTechnicians = adminData.length;
    const activeTechnicians = adminData.filter(tech => 
      tech.isActiveTechnician === true || 
      tech.status?.toLowerCase() === "approved" || 
      tech.status?.toLowerCase() === "active"
    ).length;
    
    const trainingCompleted = adminData.filter(tech => tech.trainingCompleted === true).length;
    
    const kycVerified = adminData.filter(tech => {
      const kycMatch = allKycRecords.find(k => 
        (k.technicianId?._id || k.technicianId) === tech._id
      );
      const status = kycMatch?.status?.toLowerCase() || kycMatch?.verificationStatus?.toLowerCase();
      return status === "approved" || status === "verified";
    }).length;

    return {
      totalTechnicians,
      activeTechnicians,
      trainingCompleted,
      kycVerified,
    };
  }, [adminData, allKycRecords]);

  const stats = calculateTechStats();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Check authentication (OWNER ONLY)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role?.toLowerCase();
    
    if (!storedUser) {
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

    if (role !== "owner") {
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

    setCurrentUser(storedUser);
  }, [toast, navigate]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setTableLoading(true);
    setDataLoaded(false);

    try {
      const [techniciansResponse, kycResponse] = await Promise.all([
        getAllTechnicians(),
        getAllKYCRecords()
      ]);

      // Parse responses
      const technicians = Array.isArray(techniciansResponse.result || techniciansResponse.data?.technicians || techniciansResponse.data || techniciansResponse?.technicians || techniciansResponse) 
        ? (techniciansResponse.result || techniciansResponse.data?.technicians || techniciansResponse.data || techniciansResponse?.technicians || techniciansResponse) 
        : [];

      const kycRecords = Array.isArray(kycResponse.result || kycResponse.data || kycResponse)
        ? (kycResponse.result || kycResponse.data || kycResponse)
        : [];

      setAllKycRecords(kycRecords);

      // Sort technicians alphabetically
      const sortedTechnicians = technicians.sort((a, b) => {
        return getTechnicianName(a).toLowerCase().localeCompare(getTechnicianName(b).toLowerCase());
      });

      setAdminData(sortedTechnicians);
      setFilteredData(sortedTechnicians);
      setDataLoaded(true);
    } catch (err) {
      console.error("Fetch error:", err);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to load technician data.";
      
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
        navigate("/auth/signin");
        return;
      }

      toast({
        title: "Fetch Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
      setTableLoading(false);
    }
  }, [currentUser, toast, navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Apply filters
  useEffect(() => {
    if (!dataLoaded) return;

    setTableLoading(true);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      let filtered = adminData;

      // Apply filter
      switch (activeFilter) {
        case "active":
          filtered = adminData.filter(tech => 
            tech.isActiveTechnician === true || 
            tech.status?.toLowerCase() === "approved" || 
            tech.status?.toLowerCase() === "active"
          );
          break;
        case "trainingCompleted":
          filtered = adminData.filter(tech => tech.trainingCompleted === true);
          break;
        case "kycVerified":
          filtered = adminData.filter(tech => {
            const kycMatch = allKycRecords.find(k => 
              (k.technicianId?._id || k.technicianId) === tech._id
            );
            const status = kycMatch?.status?.toLowerCase() || kycMatch?.verificationStatus?.toLowerCase();
            return status === "approved" || status === "verified";
          });
          break;
        default:
          filtered = adminData;
      }

      // Apply search filter
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter(tech => {
          const fullName = getTechnicianName(tech);
          const specialization = tech.specialization || tech.profile?.specialization || "";
          const city = tech.city || tech.profile?.city || tech.locality || "";
          const phoneStr = (
            tech.phone ||
            tech.mobileNumber ||
            tech.profile?.phone ||
            tech.profile?.mobileNumber ||
            ""
          ).toString();

          return (
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tech.email && tech.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phoneStr.includes(searchTerm)
          );
        });
      }

      setFilteredData(filtered);
      setTableLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeFilter, adminData, dataLoaded, searchTerm, allKycRecords]);

  // Fetch Job History when History Modal is opened
  useEffect(() => {
    const fetchHistory = async () => {
      if (isHistoryModalOpen && selectedTechForHistory) {
        setHistoryLoading(true);
        try {
          const result = await getTechnicianJobHistory();
          const historyData = Array.isArray(result) ? result : (result.data || []);

          const filtered = historyData.filter(job =>
            (job.technicianId?._id || job.technicianId) === selectedTechForHistory._id
          );
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setJobHistory(filtered);
        } catch (err) {
          console.error("Error fetching job history:", err);
          toast({
            title: "Error",
            description: "Failed to load job history.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();
  }, [isHistoryModalOpen, selectedTechForHistory, toast]);

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Filter handlers (matching UserManagement style)
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
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
  const handleViewDetails = (technician) => {
    setSelectedTechnician(technician);
    setIsDetailsModalOpen(true);
  };

  const handleViewKYC = async (technician) => {
    setSelectedTechnicianForKYC(technician);
    setIsKYCModalOpen(true);
    setKYCData(null);
    setKYcLoading(true);
    setShowRejectionInput(false);
    setRejectionInput("");
    setConfirmingModalDelete(false);
    
    try {
      const idToFetch = technician._id;
      const response = await getTechnicianKYC(idToFetch);
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

  const handleViewHistory = (technician) => {
    setSelectedTechForHistory(technician);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteClick = (technician) => {
    setTechnicianToDelete(technician);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!technicianToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTechnician(technicianToDelete._id);
      
      toast({
        title: "Technician Deleted",
        description: `Technician has been deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      await fetchData();
      closeDeleteModal();
    } catch (err) {
      toast({
        title: "Delete Error",
        description: err.message || "Failed to delete technician.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteDialogOpen(false);
    setTechnicianToDelete(null);
    setIsDeleting(false);
  };

  const closeModal = () => {
    setIsDetailsModalOpen(false);
    setIsKYCModalOpen(false);
    setIsHistoryModalOpen(false);
    setIsImageModalOpen(false);
    setSelectedTechnician(null);
    setSelectedTechnicianForKYC(null);
    setSelectedTechForHistory(null);
    setKYCData(null);
    setShowRejectionInput(false);
    setRejectionInput("");
    setConfirmingModalDelete(false);
  };

  // KYC verification handlers
  const handleVerifyKYCAction = async (status) => {
    if (!selectedTechnicianForKYC) return;

    // Specific check for rejection
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

      closeModal();

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("KYC Verification Error:", error);
      let errorMsg = "Failed to update KYC status.";
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

      closeModal();
      fetchData();
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
    // STRICT WORKFLOW: KYC Check before Training Completion
    if (status) {
      const kycMatch = allKycRecords.find(k =>
        (k.technicianId?._id || k.technicianId) === technician._id
      );
      const kycStatus = kycMatch?.status?.toLowerCase() || kycMatch?.verificationStatus?.toLowerCase();

      if (kycStatus !== "approved" && kycStatus !== "verified") {
        toast({
          title: "Prerequisite Missing",
          description: "Cannot mark Training as Completed. KYC Verification must be APPROVED first.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    try {
      setIsLoading(true);
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

      // Refresh data
      fetchData();
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
      setIsLoading(false);
    }
  };

  // Image preview handlers
  const handleOpenImage = (url) => {
    setSelectedImageUrl(url);
    setRotation(0);
    setZoom(1);
    setIsImageModalOpen(true);
  };

  const handleRotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetImage = () => {
    setRotation(0);
    setZoom(1);
  };

  if (!currentUser) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color={customColor} />
        <Text ml={4}>Checking permissions...</Text>
      </Flex>
    );
  }

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "50px", md: "45px" }}
      height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
      overflow="hidden"
      css={globalScrollbarStyles}
    >
      {/* Fixed Statistics Cards - Preserved exactly as in UserManagement but with tech stats */}
      <Box flexShrink={0} p={{ base: 1, md: 4 }} pb={0}>
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
          gap={{ base: "10px", md: "15px" }}
          mb={{ base: "15px", md: "20px" }}
        >
          {/* Total Technicians Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("all")}
            border="1px solid"
            borderColor={`${customColor}30`}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Total Technicians
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.totalTechnicians}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg={customColor}
                >
                  <Icon as={FaUsers} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Active Technicians Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("active")}
            border="1px solid"
            borderColor={`${customColor}30`}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Active Technicians
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.activeTechnicians}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg="green.500"
                >
                  <Icon as={IoCheckmarkDoneCircleSharp} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Training Completed Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("trainingCompleted")}
            border="1px solid"
            borderColor={`${customColor}30`}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Training Completed
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.trainingCompleted}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg="orange.500"
                >
                  <Icon as={FaUserGraduate} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* KYC Verified Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => handleFilterClick("kycVerified")}
            border="1px solid"
            borderColor={`${customColor}30`}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 4 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    KYC Verified
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoading ? <Spinner size="xs" /> : stats.kycVerified}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg="purple.500"
                >
                  <Icon as={FaIdCard} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
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
          height="100%"
          overflow="hidden"
        >
          {/* Fixed Table Header */}
          <CardHeader
            p="16px"
            pb="12px"
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
                👤 Technician Management
              </Heading>

              <Flex
                align="center"
                flex={{ base: "none", sm: "1" }}
                maxW={{ base: "100%", sm: "350px" }}
                minW={{ base: "0", sm: "200px" }}
                w="100%"
              >
                <Input
                  placeholder="Search technicians..."
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
          <CardBody bg="white" display="flex" flexDirection="column" p={0} flex="1" overflow="hidden">
            {isLoading ? (
              <Flex justify="center" align="center" py={6} flex="1">
                <Spinner size="lg" color={customColor} />
                <Text ml={3} fontSize="sm">Loading technicians...</Text>
              </Flex>
            ) : (
              <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
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
                          py={3}
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
                          py={3}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Technician
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
                          py={3}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Specialization
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
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
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
                          bg={customColor}
                          zIndex={10}
                          fontWeight="bold"
                          fontSize="xs"
                          py={3}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Jobs
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
                          py={3}
                          borderBottom="2px solid"
                          borderBottomColor={`${customColor}50`}
                        >
                          Actions
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody bg="transparent">
                      {currentItems.length > 0 ? (
                        currentItems.map((tech, idx) => {
                          const userName = getTechnicianName(tech);

                          return (
                            <Tr
                              key={tech._id || idx}
                              bg="transparent"
                              _hover={{ bg: `${customColor}10` }}
                              borderBottom="1px"
                              borderColor={`${customColor}20`}
                              height="50px"
                            >
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                {indexOfFirstItem + idx + 1}
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                <Flex align="center" gap={2}>
                                  <Avatar size="xs" name={userName} src={getTechnicianImage(tech)} />
                                  <Box>
                                    <Text fontWeight="medium" fontSize="xs" noOfLines={1}>
                                      {userName}
                                    </Text>
                                  </Box>
                                </Flex>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                <Tooltip label={tech.specialization} hasArrow placement="top">
                                  <Text noOfLines={1} maxW="150px">
                                    {tech.specialization || tech.profile?.specialization || "N/A"}
                                  </Text>
                                </Tooltip>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                {tech.city || tech.profile?.city || tech.locality || "N/A"}
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                <Flex align="center">
                                  <Icon as={FaSearch} color="yellow.400" mr={1} boxSize={3} />
                                  <Text fontWeight="bold" fontSize="xs">
                                    {tech.rating?.avg?.toFixed(1) || "0.0"}
                                  </Text>
                                  <Text fontSize="2xs" color="gray.500" ml={1}>
                                    ({tech.rating?.count || 0})
                                  </Text>
                                </Flex>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                <Text fontWeight="bold">{tech.totalJobsCompleted || tech.jobStats?.completed || 0}</Text>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
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
                                    onClick={() => handleViewDetails(tech)}
                                  />
                                  <IconButton
                                    aria-label="View KYC"
                                    icon={<MdAdminPanelSettings />}
                                    bg="white"
                                    color="green.500"
                                    border="1px"
                                    borderColor="green.500"
                                    _hover={{ bg: "green.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleViewKYC(tech)}
                                  />
                                  <IconButton
                                    aria-label="View history"
                                    icon={<FaHistory />}
                                    bg="white"
                                    color="orange.500"
                                    border="1px"
                                    borderColor="orange.500"
                                    _hover={{ bg: "orange.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleViewHistory(tech)}
                                  />
                                  <IconButton
                                    aria-label="Delete technician"
                                    icon={<FaTrash />}
                                    bg="white"
                                    color="red.500"
                                    border="1px"
                                    borderColor="red.500"
                                    _hover={{ bg: "red.500", color: "white" }}
                                    size="xs"
                                    onClick={() => handleDeleteClick(tech)}
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
                              {adminData.length === 0 ? "No technicians found." : "No technicians match your search."}
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
                  py={2}
                  css={globalScrollbarStyles}
                >
                  {currentItems.length > 0 ? (
                    currentItems.map((tech, idx) => (
                      <TechnicianMobileCard
                        key={tech._id || idx}
                        tech={tech}
                        idx={idx}
                        indexOfFirstItem={indexOfFirstItem}
                        onViewDetails={handleViewDetails}
                        onViewKYC={handleViewKYC}
                        onViewHistory={handleViewHistory}
                        onDelete={handleDeleteClick}
                      />
                    ))
                  ) : (
                    <Center py={10}>
                      <VStack spacing={2}>
                        <Icon as={FaUsers} color="gray.300" boxSize={10} />
                        <Text fontSize="sm" color="gray.500">No technicians found</Text>
                      </VStack>
                    </Center>
                  )}
                </Box>

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                  <Box
                    flexShrink={0}
                    p="16px"
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

      {/* Technician Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeModal} size="lg">
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader color="gray.700">Technician Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {selectedTechnician && (
              <VStack spacing={4} align="stretch">
                {/* Profile Header */}
                <Flex align="center" gap={4} mb={2}>
                  <Avatar
                    size="xl"
                    name={getTechnicianName(selectedTechnician)}
                    src={getTechnicianImage(selectedTechnician)}
                  />
                  <Box>
                    <Heading size="md" color="gray.700">
                      {getTechnicianName(selectedTechnician)}
                    </Heading>
                    <Badge 
                      colorScheme={selectedTechnician.status?.toLowerCase() === "active" || selectedTechnician.status?.toLowerCase() === "approved" ? "green" : "red"} 
                      mt={1}
                    >
                      {selectedTechnician.status || "Active"}
                    </Badge>
                  </Box>
                </Flex>

                {/* Contact Information */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Contact Information</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Email</Text>
                      <Text fontSize="sm">{selectedTechnician.email || "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Phone</Text>
                      <Text fontSize="sm">{selectedTechnician.mobileNumber || selectedTechnician.phone || "N/A"}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Professional Information */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Professional Information</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Specialization</Text>
                      <Text fontSize="sm">{selectedTechnician.specialization || selectedTechnician.profile?.specialization || "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Experience</Text>
                      <Text fontSize="sm">
                        {(() => {
                          const exp = selectedTechnician.experienceYears ?? selectedTechnician.profile?.experienceYears;
                          return (exp !== undefined && exp !== null) ? `${exp} Years` : "0 Years";
                        })()}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Total Jobs</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedTechnician.totalJobsCompleted || selectedTechnician.jobStats?.completed || 0}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Rating</Text>
                      <Text fontSize="sm">
                        {selectedTechnician.rating?.avg?.toFixed(1) || "0.0"} ({selectedTechnician.rating?.count || 0} reviews)
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Address */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Address</Text>
                  <Text fontSize="sm">
                    {selectedTechnician.address || "N/A"}, {selectedTechnician.locality || "N/A"}, {selectedTechnician.city || selectedTechnician.profile?.city || "N/A"} - {selectedTechnician.pincode || "N/A"}
                  </Text>
                </Box>

                {/* Status */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Status</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Training</Text>
                      <Badge colorScheme={selectedTechnician.trainingCompleted ? "green" : "orange"}>
                        {selectedTechnician.trainingCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Work Status</Text>
                      <Text fontSize="sm">{selectedTechnician.workStatus || "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Wallet Balance</Text>
                      <Text fontSize="sm">₹{selectedTechnician.walletBalance || 0}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Online</Text>
                      <Badge colorScheme={selectedTechnician.availability?.isOnline ? "green" : "gray"}>
                        {selectedTechnician.availability?.isOnline ? "Yes" : "No"}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Bank Details */}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Bank Details</Text>
                  {(() => {
                    const kycMatch = allKycRecords.find(k => 
                      (k.technicianId?._id || k.technicianId) === selectedTechnician._id
                    );
                    if (!kycMatch || !kycMatch.bankDetails) return <Text fontSize="sm" color="gray.500">No bank details provided</Text>;

                    return (
                      <SimpleGrid columns={2} spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500">Bank Name</Text>
                          <Text fontSize="sm">{kycMatch.bankDetails.bankName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">Account Holder</Text>
                          <Text fontSize="sm">{kycMatch.bankDetails.accountHolderName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">Account Number</Text>
                          <Text fontSize="sm">{kycMatch.bankDetails.accountNumber || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">IFSC Code</Text>
                          <Text fontSize="sm">{kycMatch.bankDetails.ifscCode || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">UPI ID</Text>
                          <Text fontSize="sm">{kycMatch.bankDetails.upiId || "N/A"}</Text>
                        </Box>
                      </SimpleGrid>
                    );
                  })()}
                </Box>

                {/* Training Action Button */}
                <Flex justify="flex-end" mt={2}>
                  <Button
                    size="sm"
                    bg={selectedTechnician.trainingCompleted ? "red.500" : customColor}
                    color="white"
                    _hover={{ bg: selectedTechnician.trainingCompleted ? "red.600" : "#006666" }}
                    onClick={() => handleTrainingCompletion(selectedTechnician, !selectedTechnician.trainingCompleted)}
                    isLoading={isLoading}
                    leftIcon={<FaUserGraduate />}
                  >
                    {selectedTechnician.trainingCompleted ? "Mark Training Incomplete" : "Mark Training Completed"}
                  </Button>
                </Flex>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* KYC Modal - Preserved with original design */}
      <Modal isOpen={isKYCModalOpen} onClose={closeModal} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader color="gray.700">KYC Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {kycLoading ? (
              <Flex justify="center" align="center" py={10}>
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

                  if (!kycRecord) return <Text textAlign="center" py={10}>No matching KYC Data found for this technician.</Text>;

                  return (
                    <>
                      <Flex mb={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100" pb={4}>
                        <HStack spacing={4}>
                          <Avatar
                            size="md"
                            name={getTechnicianName(selectedTechnicianForKYC)}
                            src={getTechnicianImage(selectedTechnicianForKYC)}
                            border="2px solid"
                            borderColor={customColor}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="lg">
                              Technician: <Text as="span" color={customColor}>{getTechnicianName(selectedTechnicianForKYC)}</Text>
                            </Text>
                          </VStack>
                        </HStack>
                      </Flex>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                        {/* Identity Proof (Aadhaar) */}
                        <Box bg="white" p={3} borderRadius="md" boxShadow="sm" border="1px solid" borderColor="purple.100">
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>Aadhaar Card</Text>
                          {(() => {
                            const aadhaarUrls = [];
                            const docs = kycRecord.documents || {};
                            if (docs.aadhaarUrl) Array.isArray(docs.aadhaarUrl) ? aadhaarUrls.push(...docs.aadhaarUrl) : aadhaarUrls.push(docs.aadhaarUrl);
                            if (docs.aadhaarBackUrl) Array.isArray(docs.aadhaarBackUrl) ? aadhaarUrls.push(...docs.aadhaarBackUrl) : aadhaarUrls.push(docs.aadhaarBackUrl);
                            if (docs.aadhaarFrontUrl) Array.isArray(docs.aadhaarFrontUrl) ? aadhaarUrls.push(...docs.aadhaarFrontUrl) : aadhaarUrls.push(docs.aadhaarFrontUrl);
                            if (docs.aadharUrl) Array.isArray(docs.aadharUrl) ? aadhaarUrls.push(...docs.aadharUrl) : aadhaarUrls.push(docs.aadharUrl);
                            if (docs.aadhaar) Array.isArray(docs.aadhaar) ? aadhaarUrls.push(...docs.aadhaar) : (typeof docs.aadhaar === 'string' && aadhaarUrls.push(docs.aadhaar));
                            if (docs.aadhar) Array.isArray(docs.aadhar) ? aadhaarUrls.push(...docs.aadhar) : (typeof docs.aadhar === 'string' && aadhaarUrls.push(docs.aadhar));

                            if (aadhaarUrls.length === 0) return <Flex height="150px" bg="gray.50" align="center" justify="center" border="1px dashed gray"><Text color="gray.400">Not Uploaded</Text></Flex>;

                            return (
                              <Box
                                display="flex"
                                overflowX="auto"
                                gap={2}
                                pb={2}
                                css={{
                                  '&::-webkit-scrollbar': { height: '4px' },
                                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                                  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
                                }}
                              >
                                {aadhaarUrls.map((url, idx) => (
                                  <Box key={idx} minW={aadhaarUrls.length > 1 ? "150px" : "100%"} border="1px solid #eee" borderRadius="md" overflow="hidden" boxShadow="sm">
                                    <img
                                      src={url}
                                      alt={`Aadhaar ${idx + 1}`}
                                      style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                      onClick={() => handleOpenImage(url)}
                                    />
                                    <Button
                                      size="xs"
                                      width="100%"
                                      borderRadius="0"
                                      onClick={() => handleOpenImage(url)}
                                      colorScheme="purple"
                                      variant="ghost"
                                    >
                                      View {aadhaarUrls.length > 1 ? `Image ${idx + 1}` : 'Full Image'}
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            );
                          })()}
                          <Text mt={3} fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Number</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">{kycRecord.aadhaarNumber || kycRecord.aadharNumber || "N/A"}</Text>
                        </Box>

                        {/* PAN Card */}
                        <Box bg="white" p={3} borderRadius="md" boxShadow="sm" border="1px solid" borderColor="purple.100">
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>PAN Card</Text>
                          {(() => {
                            const panUrls = [];
                            const docs = kycRecord.documents || {};
                            if (docs.panUrl) Array.isArray(docs.panUrl) ? panUrls.push(...docs.panUrl) : panUrls.push(docs.panUrl);
                            if (docs.panBackUrl) Array.isArray(docs.panBackUrl) ? panUrls.push(...docs.panBackUrl) : panUrls.push(docs.panBackUrl);
                            if (docs.panFrontUrl) Array.isArray(docs.panFrontUrl) ? panUrls.push(...docs.panFrontUrl) : panUrls.push(docs.panFrontUrl);
                            if (docs.pan) Array.isArray(docs.pan) ? panUrls.push(...docs.pan) : (typeof docs.pan === 'string' && panUrls.push(docs.pan));

                            if (panUrls.length === 0) return <Flex height="150px" bg="gray.50" align="center" justify="center" border="1px dashed gray"><Text color="gray.400">Not Uploaded</Text></Flex>;

                            return (
                              <Box
                                display="flex"
                                overflowX="auto"
                                gap={2}
                                pb={2}
                                css={{
                                  '&::-webkit-scrollbar': { height: '4px' },
                                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                                  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
                                }}
                              >
                                {panUrls.map((url, idx) => (
                                  <Box key={idx} minW={panUrls.length > 1 ? "150px" : "100%"} border="1px solid #eee" borderRadius="md" overflow="hidden" boxShadow="sm">
                                    <img
                                      src={url}
                                      alt={`PAN ${idx + 1}`}
                                      style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                      onClick={() => handleOpenImage(url)}
                                    />
                                    <Button
                                      size="xs"
                                      width="100%"
                                      borderRadius="0"
                                      onClick={() => handleOpenImage(url)}
                                      colorScheme="purple"
                                      variant="ghost"
                                    >
                                      View {panUrls.length > 1 ? `Image ${idx + 1}` : 'Full Image'}
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            );
                          })()}
                          <Text mt={3} fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Number</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">{kycRecord.panNumber || "N/A"}</Text>
                        </Box>

                        {/* Driving License */}
                        <Box bg="white" p={3} borderRadius="md" boxShadow="sm" border="1px solid" borderColor="purple.100">
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>Driving License</Text>
                          {(() => {
                            const dlUrls = [];
                            const docs = kycRecord.documents || {};
                            if (docs.dlUrl) Array.isArray(docs.dlUrl) ? dlUrls.push(...docs.dlUrl) : dlUrls.push(docs.dlUrl);
                            if (docs.dlBackUrl) Array.isArray(docs.dlBackUrl) ? dlUrls.push(...docs.dlBackUrl) : dlUrls.push(docs.dlBackUrl);
                            if (docs.dlFrontUrl) Array.isArray(docs.dlFrontUrl) ? dlUrls.push(...docs.dlFrontUrl) : dlUrls.push(docs.dlFrontUrl);
                            if (docs.dl) Array.isArray(docs.dl) ? dlUrls.push(...docs.dl) : (typeof docs.dl === 'string' && dlUrls.push(docs.dl));
                            if (docs.license) Array.isArray(docs.license) ? dlUrls.push(...docs.license) : (typeof docs.license === 'string' && dlUrls.push(docs.license));

                            if (dlUrls.length === 0) return <Flex height="150px" bg="gray.50" align="center" justify="center" border="1px dashed gray"><Text color="gray.400">Not Uploaded</Text></Flex>;

                            return (
                              <Box
                                display="flex"
                                overflowX="auto"
                                gap={2}
                                pb={2}
                                css={{
                                  '&::-webkit-scrollbar': { height: '4px' },
                                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                                  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
                                }}
                              >
                                {dlUrls.map((url, idx) => (
                                  <Box key={idx} minW={dlUrls.length > 1 ? "150px" : "100%"} border="1px solid #eee" borderRadius="md" overflow="hidden" boxShadow="sm">
                                    <img
                                      src={url}
                                      alt={`Driving License ${idx + 1}`}
                                      style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                      onClick={() => handleOpenImage(url)}
                                    />
                                    <Button
                                      size="xs"
                                      width="100%"
                                      borderRadius="0"
                                      onClick={() => handleOpenImage(url)}
                                      colorScheme="purple"
                                      variant="ghost"
                                    >
                                      View {dlUrls.length > 1 ? `Image ${idx + 1}` : 'Full Image'}
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            );
                          })()}
                          <Text mt={3} fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Number</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">{kycRecord.drivingLicenseNumber || "N/A"}</Text>
                        </Box>
                      </SimpleGrid>

                      {/* Bank Information Integration */}
                      <Box mt={6} p={4} borderRadius="md" border="1px solid" borderColor="teal.100" bg="white" boxShadow="sm">
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={4} borderBottom="1px solid" borderColor="teal.50" pb={2}>
                          Bank Information
                        </Text>
                        {kycRecord.bankDetails ? (
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Account Holder</Text>
                              <Text fontSize="md" fontWeight="semibold" color="gray.700">{kycRecord.bankDetails.accountHolderName || "N/A"}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Bank / Branch</Text>
                              <Text fontSize="md" fontWeight="semibold" color="gray.700">{kycRecord.bankDetails.bankName || "N/A"}</Text>
                              <Text fontSize="sm" color="gray.500">{kycRecord.bankDetails.branchName || ""}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Account Number</Text>
                              <Text fontSize="md" fontWeight="semibold" color="teal.600">{kycRecord.bankDetails.accountNumber || "N/A"}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">IFSC Code</Text>
                              <Text fontSize="md" fontWeight="semibold" color="gray.800" fontFamily="monospace">{kycRecord.bankDetails.ifscCode || "N/A"}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">UPI ID</Text>
                              <Text fontSize="md" fontWeight="semibold" color="teal.600">{kycRecord.bankDetails.upiId || "N/A"}</Text>
                            </Box>
                          </SimpleGrid>
                        ) : (
                          <Text color="gray.400" fontStyle="italic">No bank details uploaded by technician.</Text>
                        )}
                      </Box>

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
            {kycData && (
              <>
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

                {!showRejectionInput ? (
                  <>
                    <Button
                      colorScheme="red"
                      mr={3}
                      onClick={() => setShowRejectionInput(true)}
                      isDisabled={(() => {
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

      {/* Job History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={closeModal} size="xl">
        <ModalOverlay />
        <ModalContent maxW="700px">
          <ModalHeader color="gray.700">
            Job History: {selectedTechForHistory ? getTechnicianName(selectedTechForHistory) : "Technician"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {historyLoading ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner size="xl" color={customColor} />
                <Text ml={4}>Fetching job history...</Text>
              </Flex>
            ) : jobHistory.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {jobHistory.map((job, idx) => {
                  const custName = job.customerId ? `${job.customerId.fname || ""} ${job.customerId.lname || ""}`.trim() : "N/A";
                  const custMobile = job.customerId?.mobileNumber || "N/A";
                  const serviceName = job.serviceId?.serviceName || "N/A";
                  const serviceType = job.serviceId?.serviceType || "N/A";
                  const city = job.addressSnapshot?.city || "N/A";

                  return (
                    <Box
                      key={job._id || idx}
                      p={4}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <Text fontWeight="bold" color={customColor} fontSize="sm" mb={3}>
                        Job #{idx + 1} - {new Date(job.createdAt).toLocaleDateString()}
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color="blue.500" mb={1}>
                            Service Details
                          </Text>
                          <Text fontSize="sm"><strong>Service:</strong> {serviceName}</Text>
                          <Text fontSize="sm"><strong>Type:</strong> {serviceType}</Text>
                          <Text fontSize="sm"><strong>Amount:</strong> ₹{job.baseAmount || 0}</Text>
                          <Text fontSize="sm"><strong>City:</strong> {city}</Text>
                        </Box>

                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color="green.500" mb={1}>
                            Customer Details
                          </Text>
                          <Text fontSize="sm"><strong>Name:</strong> {custName}</Text>
                          <Text fontSize="sm"><strong>Mobile:</strong> {custMobile}</Text>
                          <Text fontSize="sm" mt={1}>
                            <strong>Status:</strong>{" "}
                            <Badge
                              colorScheme={
                                job.status === 'completed' ? 'green' :
                                job.status === 'cancelled' ? 'red' : 'yellow'
                              }
                            >
                              {job.status}
                            </Badge>
                          </Text>
                          <Text fontSize="sm">
                            <strong>Payment:</strong>{" "}
                            <Badge colorScheme={job.paymentStatus === "paid" ? "green" : "red"}>
                              {job.paymentStatus || "Pending"}
                            </Badge>
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Flex justify="center" align="center" py={10} flexDirection="column">
                <Icon as={FaHistory} w={10} h={10} color="gray.300" mb={4} />
                <Text color="gray.500">No job history found for this technician.</Text>
              </Flex>
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
              {technicianToDelete && (
                <Text>
                  Are you sure you want to delete{" "}
                  <Text as="span" fontWeight="bold" color={customColor}>
                    "{getTechnicianName(technicianToDelete)}"
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
                isLoading={isDeleting}
                size="sm"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Image Preview Modal with Rotate and Zoom */}
      <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} size="full">
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.800" />
        <ModalContent bg="transparent" shadow="none">
          <ModalCloseButton color="white" size="lg" zIndex={2000} />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={0}
            position="relative"
          >
            <Box
              overflow="auto"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="100%"
              h="90vh"
              p={10}
              css={{
                '&::-webkit-scrollbar': { width: '8px', height: '8px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: 'whiteAlpha.300', borderRadius: '10px' },
                '&:hover::-webkit-scrollbar-thumb': { background: 'whiteAlpha.500' },
              }}
            >
              <Box
                transition="transform 0.3s ease"
                transform={`rotate(${rotation}deg) scale(${zoom})`}
                display="inline-block"
              >
                <img
                  src={selectedImageUrl}
                  alt="Full Preview"
                  style={{
                    maxHeight: "80vh",
                    maxWidth: "90vw",
                    display: "block",
                    borderRadius: "8px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                  }}
                />
              </Box>
            </Box>

            {/* Image Controls Overlay */}
            <Flex
              gap={4}
              bg="whiteAlpha.200"
              p={4}
              borderRadius="full"
              backdropFilter="blur(10px)"
              position="absolute"
              bottom="30px"
              zIndex={2000}
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              <IconButton
                icon={<FaSearchPlus />}
                onClick={handleZoomIn}
                aria-label="Zoom In"
                colorScheme="whiteAlpha"
                color="white"
                borderRadius="full"
                variant="ghost"
                _hover={{ bg: "whiteAlpha.300" }}
              />
              <IconButton
                icon={<FaSearchMinus />}
                onClick={handleZoomOut}
                aria-label="Zoom Out"
                colorScheme="whiteAlpha"
                color="white"
                borderRadius="full"
                variant="ghost"
                _hover={{ bg: "whiteAlpha.300" }}
              />
              <IconButton
                icon={<FaRedo />}
                onClick={handleRotateImage}
                aria-label="Rotate"
                colorScheme="whiteAlpha"
                color="white"
                borderRadius="full"
                variant="ghost"
                _hover={{ bg: "whiteAlpha.300" }}
              />
              <IconButton
                icon={<FaUndo />}
                onClick={handleResetImage}
                aria-label="Reset"
                colorScheme="whiteAlpha"
                color="white"
                borderRadius="full"
                variant="ghost"
                _hover={{ bg: "whiteAlpha.300" }}
              />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}