
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCategories,
  getAllServices,
  createCategories,
  createService,
  updateCategories,
  deleteCategory,
  updateService,
  deleteService,
  uploadServiceImages,
  uploadCategoryImage,
} from "../utils/axiosInstance";

import {
  Flex,
  Grid,
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
  Badge,
  Heading,
  Text,
  useToast,
  Icon,
  Button,
  IconButton,
  Box,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Select,
  Image,
  Textarea,
  Spinner,
  Center,
  SimpleGrid,
  Checkbox,
  VStack,
  HStack,
  Stack,
} from "@chakra-ui/react";



import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaUsers,
  FaArrowLeft,
  FaEye,
  FaEdit,
  FaPlusCircle,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaChartLine,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdCategory, MdInventory, MdWarning } from "react-icons/md";



export default function ServiceManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const navigate = useNavigate();

  // Custom color theme
  const customColor = "#008080";
  const customHoverColor = "#008080";

  // All state hooks - MUST BE IN SAME ORDER EVERY RENDER
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);


  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalType, setViewModalType] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);


  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [whatIncludedInput, setWhatIncludedInput] = useState("");
  const [whatNotIncludedInput, setWhatNotIncludedInput] = useState("");
  const [serviceHighlightsInput, setServiceHighlightsInput] = useState("");

  // Category form
  const initialCategory = {
    category: "",
    description: "",
    image: "",
    isActive: true,
    categoryType: "service"
  };

  // Service form
  const initialService = {
    serviceName: "",
    description: "",
    categoryId: "",
    serviceType: "",
    pricingType: "fixed",
    serviceCost: 0,
    minimumVisitCharge: 0,
    serviceDiscountPercentage: 0,
    commissionPercentage: 0,
    whatIncluded: [],
    whatNotIncluded: [],
    serviceImages: [],
    serviceHighlights: [],
    serviceWarranty: "",
    cancellationPolicy: "",
    requiresSpareParts: false,
    duration: "",
    siteVisitRequired: true,
    isActive: true,
    isPopular: false,
    isRecommended: false,
  };

  const [newCategory, setNewCategory] = useState(initialCategory);
  const [newService, setNewService] = useState(initialService);


  const serviceTypeOptions = ["Installation", "Maintenance", "Repair", "Inspection"];
  const pricingTypeOptions = ["fixed", "after_inspection"];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredCategories = categories.filter((cat) =>
    cat.category?.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.description?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredServices = services.filter(
    (service) =>
      service.serviceName?.toLowerCase().includes(serviceSearch.toLowerCase()) &&
      (serviceCategoryFilter ?
        (service.categoryId?._id === serviceCategoryFilter || service.categoryId === serviceCategoryFilter)
        : true)
  );

  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const totalServicePages = Math.ceil(filteredServices.length / itemsPerPage);

  // All useCallback hooks must be defined here, before any useEffect
  const calculateServiceStatistics = useCallback(() => {
    const activeServices = services.filter(service => service.isActive).length;
    const popularServices = services.filter(service => service.isPopular).length;
    const recommendedServices = services.filter(service => service.isRecommended).length;
    const totalRevenue = services.reduce((sum, service) => sum + (service.serviceCost || 0), 0);

    return {
      activeServices,
      popularServices,
      recommendedServices,
      totalRevenue
    };
  }, [services]);



  // Event handlers (regular functions, not hooks)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (currentView === "categories") {
      setCategorySearch(value);
    } else if (currentView === "services") {
      setServiceSearch(value);
    }

    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCategorySearch("");
    setServiceSearch("");
    setCurrentPage(1);
  };

  const handleServiceImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsSubmitting(true);

      if (selectedService) {
        const result = await uploadServiceImages(selectedService._id, files);

        const updatedService = result.service || result.data || result.result || result;
        const updatedImages = Array.isArray(result) ? result : (
          updatedService?.serviceImages ||
          result.serviceImages ||
          (result.data && Array.isArray(result.data) ? result.data : null)
        );

        if (updatedImages && Array.isArray(updatedImages)) {
          setNewService(prev => ({
            ...prev,
            serviceImages: updatedImages
          }));
        }
      } else {
        const newImages = Array.from(files).map(file => ({
          file: file,
          preview: URL.createObjectURL(file),
          isNew: true
        }));

        setNewService(prev => ({
          ...prev,
          serviceImages: [...(prev.serviceImages || []), ...newImages]
        }));
      }

      toast({
        title: "Images Uploaded",
        description: "Service images uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload images",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      event.target.value = "";
    }
  };

  const handleRemoveServiceImage = (index) => {
    setNewService(prev => ({
      ...prev,
      serviceImages: prev.serviceImages.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const previewUrl = URL.createObjectURL(file);

      setNewCategory(prev => ({
        ...prev,
        image: previewUrl,
        imageFile: file
      }));

      toast({
        title: "Image Uploaded",
        description: "Category image uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      event.target.value = "";
    }
  };

  const handleAddWhatIncluded = () => {
    if (whatIncludedInput.trim()) {
      setNewService(prev => ({
        ...prev,
        whatIncluded: [...prev.whatIncluded, whatIncludedInput.trim()]
      }));
      setWhatIncludedInput("");
    }
  };

  const handleRemoveWhatIncluded = (index) => {
    setNewService(prev => ({
      ...prev,
      whatIncluded: prev.whatIncluded.filter((_, i) => i !== index)
    }));
  };

  const handleAddWhatNotIncluded = () => {
    if (whatNotIncludedInput.trim()) {
      setNewService(prev => ({
        ...prev,
        whatNotIncluded: [...prev.whatNotIncluded, whatNotIncludedInput.trim()]
      }));
      setWhatNotIncludedInput("");
    }
  };

  const handleRemoveWhatNotIncluded = (index) => {
    setNewService(prev => ({
      ...prev,
      whatNotIncluded: prev.whatNotIncluded.filter((_, i) => i !== index)
    }));
  };

  const handleAddServiceHighlights = () => {
    if (serviceHighlightsInput.trim()) {
      setNewService(prev => ({
        ...prev,
        serviceHighlights: [...prev.serviceHighlights, serviceHighlightsInput.trim()]
      }));
      setServiceHighlightsInput("");
    }
  };

  const handleRemoveServiceHighlights = (index) => {
    setNewService(prev => ({
      ...prev,
      serviceHighlights: prev.serviceHighlights.filter((_, i) => i !== index)
    }));
  };

  const handleNextPage = () => {
    if (currentView === "categories" && currentPage < totalCategoryPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentView === "services" && currentPage < totalServicePages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setViewModalType("category");
    setIsViewModalOpen(true);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setViewModalType("service");
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedCategory(null);
    setSelectedService(null);
    setViewModalType("");
  };

  // Now define useCallback hooks that depend on the above functions
  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setIsLoadingCategories(true);
      setIsLoadingServices(true);


      const [categoryData, serviceData] = await Promise.all([
        getAllCategories(),
        getAllServices(),  // Using the function defined outside component

      ]);

      setCategories(categoryData.result || categoryData.data || []);
      setServices(serviceData.result || serviceData.data || []);



    } catch (err) {
      console.error("Fetch error:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Failed to load dashboard data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingData(false);
      setIsLoadingCategories(false);
      setIsLoadingServices(false);

    }
  }, [toast]);

  // All useEffect hooks must come after all useCallback hooks
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || (storedUser.role !== "owner")) {
      toast({
        title: "Access Denied",
        description: "Only admin or super admin can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/auth/signin");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate, toast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setCategorySearch("");
    setServiceSearch("");
  }, [currentView]);

  if (!currentUser) return null;

  // More regular functions (not hooks)
  const handleBack = () => {
    setCurrentView("categories");
    setSelectedCategory(null);
    setSelectedService(null);
    setNewCategory(initialCategory);
    setNewService(initialService);
    setWhatIncludedInput("");
    setWhatNotIncludedInput("");
    setServiceHighlightsInput("");
  };

  const handleResetCategory = () => setNewCategory(initialCategory);
  const handleResetService = () => {
    setNewService(initialService);
    setWhatIncludedInput("");
    setWhatNotIncludedInput("");
    setServiceHighlightsInput("");
  };

  const handleSubmitCategory = async () => {
    if (!newCategory.category.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const categoryData = {
        category: newCategory.category.trim(),
        description: newCategory.description?.trim() || "",
        isActive: newCategory.isActive !== false,
        categoryType: "service"
      };

      const data = await createCategories(categoryData);

      const createdCategory = data.category || data.data || data.result || data;

      if (newCategory.imageFile && createdCategory?._id) {
        try {
          await uploadCategoryImage(createdCategory._id, newCategory.imageFile);
        } catch (imgError) {
          console.error("Category image upload failed:", imgError);
          toast({
            title: "Image Upload Error",
            description: "Category was created but image upload failed.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }

      toast({
        title: "Category Created",
        description: `"${createdCategory.category || newCategory.category}" added successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      handleBack();
    } catch (err) {
      toast({
        title: "Error Creating Category",
        description: err.message || "Failed to create category",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!newCategory.category.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const categoryData = {
        category: newCategory.category.trim(),
        description: newCategory.description?.trim() || "",
        isActive: newCategory.isActive !== false,
        categoryType: "service"
      };

      await updateCategories(selectedCategory._id, categoryData);

      if (newCategory.imageFile) {
        try {
          await uploadCategoryImage(selectedCategory._id, newCategory.imageFile);
        } catch (imgError) {
          console.error("Category image upload failed:", imgError);
        }
      }

      toast({
        title: "Category Updated",
        description: `"${newCategory.category}" updated successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      handleBack();
    } catch (error) {
      toast({
        title: "Error Updating Category",
        description: error.message || "Failed to update category",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    setItemToDelete(category);
    setDeleteType("category");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteService = async (service) => {
    setItemToDelete(service);
    setDeleteType("service");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);

      if (deleteType === "category") {
        const servicesInCategory = services.filter(
          s => s.categoryId?._id === itemToDelete._id || s.categoryId === itemToDelete._id
        );

        if (servicesInCategory.length > 0) {
          toast({
            title: "Cannot Delete Category",
            description: `This category has ${servicesInCategory.length} service(s). Please remove or reassign them first.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        await deleteCategory(itemToDelete._id);
        toast({
          title: "Category Deleted",
          description: `"${itemToDelete.category}" has been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (deleteType === "service") {
        await deleteService(itemToDelete._id);
        toast({
          title: "Service Deleted",
          description: `"${itemToDelete.serviceName}" has been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchData();
      closeDeleteModal();
    } catch (err) {
      toast({
        title: `Error Deleting ${deleteType === "category" ? "Category" : "Service"}`,
        description: err.message || `Failed to delete ${deleteType}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteType("");
    setIsDeleting(false);
  };

  const handleSubmitService = async () => {
    if (!newService.serviceName.trim()) {
      return toast({
        title: "Validation Error",
        description: "Service name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!newService.categoryId) {
      return toast({
        title: "Category Error",
        description: "Please select a category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!newService.serviceType) {
      return toast({
        title: "Validation Error",
        description: "Please select a service type.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!newService.serviceCost || newService.serviceCost <= 0) {
      return toast({
        title: "Validation Error",
        description: "Service cost must be greater than 0.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const serviceData = {
        serviceName: newService.serviceName.trim(),
        description: newService.description?.trim() || "",
        categoryId: newService.categoryId,
        serviceType: newService.serviceType,
        pricingType: newService.pricingType || "fixed",
        serviceCost: Number(newService.serviceCost),
        minimumVisitCharge: Number(newService.minimumVisitCharge || 0),
        serviceDiscountPercentage: Number(newService.serviceDiscountPercentage || 0),
        commissionPercentage: Number(newService.commissionPercentage || 0),
        whatIncluded: newService.whatIncluded || [],
        whatNotIncluded: newService.whatNotIncluded || [],
        serviceImages: newService.serviceImages?.map(img => {
          if (typeof img === 'string') return img;
          return img.url; // Never send blob/preview URLs for initial creation/update data
        }).filter(img => typeof img === 'string' && img.length > 0 && !img.startsWith('blob:')) || [],
        serviceHighlights: newService.serviceHighlights || [],
        serviceWarranty: newService.serviceWarranty?.trim() || "",
        cancellationPolicy: newService.cancellationPolicy?.trim() || "",
        requiresSpareParts: newService.requiresSpareParts || false,
        duration: newService.duration?.trim() || "",
        siteVisitRequired: newService.siteVisitRequired !== false,
        isActive: newService.isActive !== false,
        isPopular: newService.isPopular || false,
        isRecommended: newService.isRecommended || false,
      };

      console.log("Submitting service data:", serviceData);

      let response;
      if (selectedService) {
        response = await updateService(selectedService._id, serviceData);

        // For updates, new images are usually handled immediately in handleServiceImageUpload,
        // but as a fallback check for unsaved new images
        const newImageFiles = newService.serviceImages
          ?.filter(img => img.isNew && img.file)
          ?.map(img => img.file) || [];

        if (newImageFiles.length > 0) {
          try {
            await uploadServiceImages(selectedService._id, newImageFiles);
          } catch (imgError) {
            console.error("Image upload failed during update:", imgError);
          }
        }

        toast({
          title: "Service Updated",
          description: `"${serviceData.serviceName}" updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        response = await createService(serviceData);

        // Robust ID detection from various response structures
        const createdService = response.service || response.data || response.result || response;
        const serviceId = createdService?._id || createdService?.id || response._id;

        console.log("Created service response:", response);
        console.log("Detected service ID:", serviceId);

        if (newService.serviceImages && newService.serviceImages.length > 0 && serviceId) {
          const newImageFiles = newService.serviceImages
            .filter(img => img.file)
            .map(img => img.file);

          if (newImageFiles.length > 0) {
            try {
              console.log(`Uploading ${newImageFiles.length} images for service ${serviceId}`);
              await uploadServiceImages(serviceId, newImageFiles);
            } catch (imgError) {
              console.error("Image upload failed for new service:", imgError);
              toast({
                title: "Image Upload Warning",
                description: "Service created, but there was an error uploading images.",
                status: "warning",
                duration: 5000,
                isClosable: true,
              });
            }
          }
        }

        toast({
          title: "Service Created",
          description: `"${serviceData.serviceName}" added successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchData();
      handleBack();
    } catch (err) {
      console.error("Service submission error:", err);

      let errorTitle = selectedService ? "Error Updating Service" : "Error Creating Service";
      let errorDescription = err.message;

      if (err.message?.includes("500")) {
        errorDescription = "Server error. Please check backend connection.";
      } else if (err.message?.includes("401") || err.message?.includes("403")) {
        errorDescription = "Authentication error. Please log in again.";
      } else if (err.message?.includes("Network")) {
        errorDescription = "Network error. Check your internet connection.";
      } else if (err.message?.includes("category")) {
        errorDescription = "Category error. Please select a valid category.";
      } else if (err.status === 500) {
        errorDescription = "Server error (500). Please check backend logs.";
      } else if (err.response?.data?.message) {
        errorDescription = err.response.data.message;
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setNewService({
      serviceName: service.serviceName || "",
      description: service.description || "",
      categoryId: service.categoryId?._id || service.categoryId || "",
      serviceType: service.serviceType || "",
      pricingType: service.pricingType || "fixed",
      serviceCost: service.serviceCost || 0,
      minimumVisitCharge: service.minimumVisitCharge || 0,
      serviceDiscountPercentage: service.serviceDiscountPercentage || 0,
      commissionPercentage: service.commissionPercentage || 0,
      whatIncluded: service.whatIncluded || [],
      whatNotIncluded: service.whatNotIncluded || [],
      serviceImages: service.serviceImages || [],
      serviceHighlights: service.serviceHighlights || [],
      serviceWarranty: service.serviceWarranty || "",
      cancellationPolicy: service.cancellationPolicy || "",
      requiresSpareParts: service.requiresSpareParts || false,
      duration: service.duration || "",
      siteVisitRequired: service.siteVisitRequired !== false,
      isActive: service.isActive !== false,
      isPopular: service.isPopular || false,
      isRecommended: service.isRecommended || false,
    });
    setCurrentView("addService");
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategory({
      category: category.category,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive !== false,
      categoryType: "service"
    });
    setCurrentView("editCategory");
  };

  // Loading component for tables
  const TableLoader = ({ columns = 6 }) => (
    <Tr>
      <Td colSpan={columns} textAlign="center" py={4}>
        <Center>
          <Spinner size="md" color={customColor} mr={3} />
          <Text fontSize="sm">Loading data...</Text>
        </Center>
      </Td>
    </Tr>
  );

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

  // Global scrollbar styles for mobile
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

  // Calculate statistics
  const stats = calculateServiceStatistics();

  // Mobile Card Component for Category
  const CategoryMobileCard = ({ cat, idx }) => (
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
          <Text fontWeight="bold" color="gray.700" fontSize="xs">
            #{indexOfFirstItem + idx + 1}
          </Text>
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            {cat.category}
          </Text>
        </HStack>
        <Badge
          colorScheme={cat.isActive ? "green" : "red"}
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {cat.isActive ? "Active" : "Inactive"}
        </Badge>
      </Flex>
      <Text fontSize="2xs" color="gray.600" noOfLines={2} mb={3}>
        {cat.description || "No description provided."}
      </Text>
      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => handleViewCategory(cat)}
        />
        <IconButton
          aria-label="Edit"
          icon={<FaEdit />}
          size="xs"
          colorScheme="teal"
          variant="ghost"
          onClick={() => handleEditCategory(cat)}
        />
        <IconButton
          aria-label="Delete"
          icon={<FaTrash />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={() => handleDeleteCategory(cat)}
        />
      </Flex>
    </Box>
  );

  // Mobile Card Component for Service
  const ServiceMobileCard = ({ service, idx }) => (
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
      <Flex justify="space-between" align="start" mb={2}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1} maxW="180px">
            #{indexOfFirstItem + idx + 1} {service.serviceName}
          </Text>
          <Text fontSize="3xs" color="gray.500">
            {service.categoryId?.category || "N/A"}
          </Text>
        </VStack>
        <Badge
          colorScheme={service.isActive ? "green" : "red"}
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {service.isActive ? "Active" : "Inactive"}
        </Badge>
      </Flex>

      <HStack spacing={2} mb={3} wrap="wrap">
        <Badge colorScheme="blue" variant="subtle" fontSize="3xs">{service.serviceType}</Badge>
        <Badge colorScheme="orange" variant="outline" fontSize="3xs">{service.pricingType}</Badge>
        <Text fontWeight="bold" fontSize="xs" ml="auto">₹{service.serviceCost}</Text>
      </HStack>

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => handleViewService(service)}
        />
        <IconButton
          aria-label="Edit"
          icon={<FaEdit />}
          size="xs"
          colorScheme="teal"
          variant="ghost"
          onClick={() => handleEditService(service)}
        />
        <IconButton
          aria-label="Delete"
          icon={<FaTrash />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={() => handleDeleteService(service)}
        />
      </Flex>
    </Box>
  );

  // Render Form Views (Add/Edit Category/Service)
  if (currentView === "addCategory" || currentView === "editCategory" || currentView === "addService") {
    return (
      <Flex
        flexDirection="column"
        pt={{ base: "120px", md: "75px" }}
        height="100vh"
        overflow="hidden"
        css={globalScrollbarStyles}
      >
        <Card
          bg="white"
          shadow="xl"
          height="100%"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <CardHeader bg="white" flexShrink={0}>
            <Flex align="center" mb={4}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={handleBack}
                mr={4}
                color={customColor}
                _hover={{ bg: `${customColor}10` }}
                size="sm"
              >
                Back
              </Button>
              <Heading size="md" color="gray.700">
                {currentView === "addCategory" && "Add New Category"}
                {currentView === "editCategory" && "Edit Category"}
                {currentView === "addService" && (selectedService ? "Edit Service" : "Add New Service")}
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody
            bg="white"
            flex="1"
            overflow="auto"
            css={globalScrollbarStyles}
          >
            {/* Category Form */}
            {(currentView === "addCategory" || currentView === "editCategory") && (
              <Box p={4}>
                <FormControl mb="20px">
                  <FormLabel htmlFor="category" color="gray.700" fontSize="sm">Category Name *</FormLabel>
                  <Input
                    id="category"
                    placeholder="Enter category name"
                    onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                    value={newCategory.category}
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                    size="sm"
                  />
                </FormControl>
                <FormControl mb="20px">
                  <FormLabel htmlFor="description" color="gray.700" fontSize="sm">Description</FormLabel>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    value={newCategory.description}
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                    rows={3}
                    size="sm"
                  />
                </FormControl>

                <FormControl mb="20px">
                  <FormLabel color="gray.700" fontSize="sm">Category Image</FormLabel>
                  <Flex direction="column" gap={3}>
                    {newCategory.image && (
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={2}
                        width="fit-content"
                        position="relative"
                      >
                        <Image
                          src={newCategory.image}
                          alt="Category Preview"
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={-2}
                          right={-2}
                          borderRadius="full"
                          onClick={() => setNewCategory(prev => ({ ...prev, image: "" }))}
                          aria-label="Remove image"
                        />
                      </Box>
                    )}
                    <Box
                      border="1px dashed"
                      borderColor={customColor}
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{ bg: `${customColor}05` }}
                      position="relative"
                    >
                      {isSubmitting ? (
                        <Spinner size="sm" color={customColor} />
                      ) : (
                        <>
                          <Input
                            type="file"
                            accept="image/*"
                            height="100%"
                            width="100%"
                            position="absolute"
                            top="0"
                            left="0"
                            opacity="0"
                            cursor="pointer"
                            onChange={handleCategoryImageUpload}
                            disabled={isSubmitting}
                          />
                          <Flex direction="column" align="center" justify="center" gap={2}>
                            <Icon as={FaPlusCircle} w={6} h={6} color={customColor} />
                            <Text fontSize="sm" color="gray.500">
                              Click to upload category image
                            </Text>
                          </Flex>
                        </>
                      )}
                    </Box>
                  </Flex>
                </FormControl>

                <FormControl mb="20px">
                  <Checkbox
                    isChecked={newCategory.isActive}
                    onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                    colorScheme="green"
                    size="sm"
                  >
                    Active Category
                  </Checkbox>
                </FormControl>

                <Flex justify="flex-end" mt={4} flexShrink={0}>
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={handleResetCategory}
                    border="1px"
                    borderColor="gray.300"
                    size="sm"
                  >
                    Reset
                  </Button>
                  <Button
                    bg={customColor}
                    _hover={{ bg: customHoverColor }}
                    color="white"
                    onClick={currentView === "addCategory" ? handleSubmitCategory : handleUpdateCategory}
                    isLoading={isSubmitting}
                    size="sm"
                  >
                    {currentView === "addCategory" ? "Create Category" : "Update Category"}
                  </Button>
                </Flex>
              </Box>
            )}

            {/* Service Form */}
            {currentView === "addService" && (
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                overflow="hidden"
                bg="transparent"
              >
                {/* Scrollable Form Container */}
                <Box
                  flex="1"
                  overflowY="auto"
                  overflowX="hidden"
                  css={globalScrollbarStyles}
                  pr={2}
                >
                  <Box p={4}>
                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      {/* Service Name */}
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Service Name *</FormLabel>
                        <Input
                          value={newService.serviceName}
                          onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
                          placeholder="Enter service name"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      {/* Category Selection */}
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Category *</FormLabel>
                        <Select
                          value={newService.categoryId}
                          onChange={(e) => setNewService({ ...newService, categoryId: e.target.value })}
                          placeholder="Select category"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        >
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.category}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Service Type and Pricing Type */}
                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Service Type *</FormLabel>
                        <Select
                          value={newService.serviceType}
                          onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })}
                          placeholder="Select service type"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        >
                          <option value="">Select type</option>
                          {serviceTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Pricing Type *</FormLabel>
                        <Select
                          value={newService.pricingType}
                          onChange={(e) => setNewService({ ...newService, pricingType: e.target.value })}
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        >
                          {pricingTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Pricing Details */}
                    <Grid templateColumns={["1fr", "1fr 1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Service Cost (₹) *</FormLabel>
                        <Input
                          type="number"
                          value={newService.serviceCost}
                          onChange={(e) => setNewService({ ...newService, serviceCost: e.target.value })}
                          placeholder="Enter service cost"
                          min="0"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Discount %</FormLabel>
                        <Input
                          type="number"
                          value={newService.serviceDiscountPercentage}
                          onChange={(e) => setNewService({ ...newService, serviceDiscountPercentage: e.target.value })}
                          placeholder="Enter discount percentage"
                          min="0"
                          max="100"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Commission %</FormLabel>
                        <Input
                          type="number"
                          value={newService.commissionPercentage}
                          onChange={(e) => setNewService({ ...newService, commissionPercentage: e.target.value })}
                          placeholder="Enter commission percentage"
                          min="0"
                          max="100"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>
                    </Grid>

                    {/* Description */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Description</FormLabel>
                      <Textarea
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        placeholder="Enter service description"
                        rows={3}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                      />
                    </FormControl>

                    {/* What's Included */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">What's Included</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={whatIncludedInput}
                          onChange={(e) => setWhatIncludedInput(e.target.value)}
                          placeholder="Add what's included"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddWhatIncluded}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.whatIncluded.map((item, index) => (
                          <Badge key={index} colorScheme="green" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveWhatIncluded(index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* What's Not Included */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">What's Not Included</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={whatNotIncludedInput}
                          onChange={(e) => setWhatNotIncludedInput(e.target.value)}
                          placeholder="Add what's not included"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddWhatNotIncluded}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.whatNotIncluded.map((item, index) => (
                          <Badge key={index} colorScheme="red" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveWhatNotIncluded(index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Service Highlights */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Service Highlights</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={serviceHighlightsInput}
                          onChange={(e) => setServiceHighlightsInput(e.target.value)}
                          placeholder="Add service highlight"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddServiceHighlights}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.serviceHighlights.map((item, index) => (
                          <Badge key={index} colorScheme="purple" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveServiceHighlights(index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Additional Details */}
                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Service Warranty</FormLabel>
                        <Input
                          value={newService.serviceWarranty}
                          onChange={(e) => setNewService({ ...newService, serviceWarranty: e.target.value })}
                          placeholder="e.g., 15 days service warranty"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Cancellation Policy</FormLabel>
                        <Input
                          value={newService.cancellationPolicy}
                          onChange={(e) => setNewService({ ...newService, cancellationPolicy: e.target.value })}
                          placeholder="Enter cancellation policy"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>
                    </Grid>

                    {/* Checkboxes */}
                    <Grid templateColumns={["1fr", "1fr 1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <Checkbox
                          isChecked={newService.requiresSpareParts}
                          onChange={(e) => setNewService({ ...newService, requiresSpareParts: e.target.checked })}
                          colorScheme="blue"
                          size="sm"
                        >
                          Requires Spare Parts
                        </Checkbox>
                      </FormControl>

                      <FormControl>
                        <Checkbox
                          isChecked={newService.siteVisitRequired}
                          onChange={(e) => setNewService({ ...newService, siteVisitRequired: e.target.checked })}
                          colorScheme="blue"
                          size="sm"
                        >
                          Site Visit Required
                        </Checkbox>
                      </FormControl>

                      <FormControl>
                        <Checkbox
                          isChecked={newService.isActive}
                          onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })}
                          colorScheme="green"
                          size="sm"
                        >
                          Active Service
                        </Checkbox>
                      </FormControl>
                    </Grid>

                    {/* Additional Checkboxes */}
                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <Checkbox
                          isChecked={newService.isPopular}
                          onChange={(e) => setNewService({ ...newService, isPopular: e.target.checked })}
                          colorScheme="orange"
                          size="sm"
                        >
                          Popular Service
                        </Checkbox>
                      </FormControl>

                      <FormControl>
                        <Checkbox
                          isChecked={newService.isRecommended}
                          onChange={(e) => setNewService({ ...newService, isRecommended: e.target.checked })}
                          colorScheme="teal"
                          size="sm"
                        >
                          Recommended Service
                        </Checkbox>
                      </FormControl>
                    </Grid>

                    {/* Duration */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Duration</FormLabel>
                      <Input
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                        placeholder="e.g., 1–3 hours"
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                      />
                    </FormControl>

                    {/* Image Upload */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Service Images</FormLabel>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleServiceImageUpload}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                        mb={3}
                      />

                      {newService.serviceImages && newService.serviceImages.length > 0 && (
                        <Flex wrap="wrap" gap={3}>
                          {newService.serviceImages.map((img, index) => (
                            <Box key={index} position="relative">
                              <Image
                                src={img.url || img.preview || img}
                                alt={`Service image ${index + 1}`}
                                boxSize="50px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                              <IconButton
                                aria-label="Remove image"
                                icon={<FaTrash />}
                                size="xs"
                                colorScheme="red"
                                position="absolute"
                                top={-1}
                                right={-1}
                                onClick={() => handleRemoveServiceImage(index)}
                              />
                            </Box>
                          ))}
                        </Flex>
                      )}
                    </FormControl>
                  </Box>
                </Box>

                {/* Fixed Footer with Buttons */}
                <Box
                  flexShrink={0}
                  p={4}
                  borderTop="1px solid"
                  borderColor={`${customColor}20`}
                  bg="transparent"
                >
                  <Flex justify="flex-end">
                    <Button
                      variant="outline"
                      mr={3}
                      onClick={handleResetService}
                      border="1px"
                      borderColor="gray.300"
                      size="sm"
                    >
                      Reset
                    </Button>
                    <Button
                      bg={customColor}
                      _hover={{ bg: customHoverColor }}
                      color="white"
                      onClick={handleSubmitService}
                      isLoading={isSubmitting}
                      size="sm"
                    >
                      {selectedService ? "Update Service" : "Create Service"}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}
          </CardBody>
        </Card>
      </Flex>
    );
  }

  // Main Dashboard View with Fixed Layout
  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "45px" }}
      height="100vh"
      overflow="hidden"
      css={globalScrollbarStyles}
    >
      {/* Fixed Statistics Cards */}
      <Box
        flexShrink={0}
        p={{ base: 1, md: 4 }}
        pb={0}
        mt={{ base: 0, md: 0 }}
      >
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
          gap={{ base: "10px", md: "15px" }}
          mb={{ base: "15px", md: "20px" }}
        >
          {/* All Categories Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => setCurrentView("categories")}
            border={currentView === "categories" ? "2px solid" : "1px solid"}
            borderColor={currentView === "categories" ? customColor : `${customColor}30`}
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
              _before: {
                opacity: 1,
              },
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
                    All Categories
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingCategories ? <Spinner size="xs" /> : categories.length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg={customColor}
                  transition="all 0.2s ease-in-out"
                >
                  <Icon
                    as={MdCategory}
                    h={{ base: "14px", md: "18px" }}
                    w={{ base: "14px", md: "18px" }}
                    color="white"
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* All Services Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => setCurrentView("services")}
            border={currentView === "services" ? "2px solid" : "1px solid"}
            borderColor={currentView === "services" ? customColor : `${customColor}30`}
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
              _before: {
                opacity: 1,
              },
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
                    All Services
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingServices ? <Spinner size="xs" /> : services.length}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg={customColor}
                  transition="all 0.2s ease-in-out"
                >
                  <Icon
                    as={IoCheckmarkDoneCircleSharp}
                    h={{ base: "14px", md: "18px" }}
                    w={{ base: "14px", md: "18px" }}
                    color="white"
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Active Services Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => setCurrentView("serviceAnalysis")}
            border={currentView === "serviceAnalysis" ? "2px solid" : "1px solid"}
            borderColor={currentView === "serviceAnalysis" ? customColor : `${customColor}30`}
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
              _before: {
                opacity: 1,
              },
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
                    Active Services
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingServices ? <Spinner size="xs" /> : stats.activeServices}
                    </StatNumber>
                  </Flex>
                  <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.500" mt={{ base: 0.5, md: 1 }}>
                    {stats.popularServices} popular
                  </Text>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg={customColor}
                  transition="all 0.2s ease-in-out"
                >
                  <Icon
                    as={FaChartLine}
                    h={{ base: "14px", md: "18px" }}
                    w={{ base: "14px", md: "18px" }}
                    color="white"
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Total Revenue Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => setCurrentView("serviceAnalysis")}
            border={currentView === "serviceAnalysis" ? "2px solid" : "1px solid"}
            borderColor={currentView === "serviceAnalysis" ? customColor : `${customColor}30`}
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
              _before: {
                opacity: 1,
              },
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
                    Total Revenue
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingServices ? <Spinner size="xs" /> :
                        `₹${stats.totalRevenue.toLocaleString()}`
                      }
                    </StatNumber>
                  </Flex>
                  <Text fontSize={{ base: "2xs", md: "xs" }} color="green.500" mt={{ base: 0.5, md: 1 }}>
                    {services.length} services
                  </Text>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg="green.500"
                  transition="all 0.2s ease-in-out"
                >
                  <Icon
                    as={FaChartLine}
                    h={{ base: "12px", md: "14px" }}
                    w={{ base: "12px", md: "14px" }}
                    color="white"
                  />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        </Grid>
      </Box>

      {/* Scrollable Table Container */}
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        p={4}
        pt={0}
        overflow="hidden"
      >
        <Card
          shadow="lg"
          bg="white"
          display="flex"
          flexDirection="column"
          height="100%"
          minH="0"
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
              {/* Title */}
              <Heading size="sm" flexShrink={0} color="gray.700">
                {currentView === "categories" && "🏷️ Categories"}
                {currentView === "services" && "🛠️ Services"}
                {currentView === "serviceAnalysis" && "📊 Service Analysis"}
              </Heading>

              {/* Search Bar - Only show for categories and services */}
              {(currentView === "categories" || currentView === "services") && (
                <Flex
                  align="center"
                  flex={{ base: "none", sm: "1" }}
                  maxW={{ base: "100%", sm: "350px" }}
                  minW={{ base: "0", sm: "200px" }}
                  w="100%"
                >
                  <Input
                    placeholder={
                      currentView === "categories"
                        ? "Search categories..."
                        : "Search services..."
                    }
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
              )}

              {/* Add Button - Only show for categories and services */}
              {(currentView === "categories" || currentView === "services") && (
                <Button
                  bg={customColor}
                  _hover={{ bg: customHoverColor }}
                  color="white"
                  onClick={() => {
                    if (currentView === "categories") {
                      setCurrentView("addCategory");
                    } else {
                      setSelectedService(null);
                      setNewService(initialService);
                      setWhatIncludedInput("");
                      setWhatNotIncludedInput("");
                      setServiceHighlightsInput("");
                      setCurrentView("addService");
                    }
                  }}
                  fontSize="sm"
                  borderRadius="6px"
                  flexShrink={0}
                  leftIcon={<FaPlusCircle />}
                  size="sm"
                  px={3}
                >
                  {currentView === "categories" ? "Add Category" : "Add Service"}
                </Button>
              )}
            </Flex>
          </CardHeader>

          {/* Scrollable Table Content Area */}
          <CardBody
            bg="white"
            flex="1"
            display="flex"
            flexDirection="column"
            p={0}
            overflow="hidden"
          >
            {isLoadingData ? (
              <Flex justify="center" align="center" py={6} flex="1">
                <Spinner size="lg" color={customColor} />
                <Text ml={3} fontSize="sm">Loading data...</Text>
              </Flex>
            ) : (
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                {/* Categories Table */}
                {currentView === "categories" && (
                  <>
                    {/* Table Container */}
                    <Box
                      flex="1"
                      display="flex"
                      flexDirection="column"
                      overflow="hidden"
                    >
                      {/* Desktop Table View */}
                      <Box
                        display={{ base: "none", md: "block" }}
                        flex="1"
                        overflow="auto"
                        css={globalScrollbarStyles}
                      >
                        <Table variant="simple" size="sm" bg="transparent">
                          {/* Fixed Header */}
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
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Category
                              </Th>
                              <Th
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Description
                              </Th>
                              <Th
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
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
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Actions
                              </Th>
                            </Tr>
                          </Thead>

                          {/* Scrollable Body */}
                          <Tbody bg="transparent">
                            {currentCategories.length > 0 ? (
                              currentCategories.map((cat, idx) => (
                                <Tr
                                  key={cat._id || idx}
                                  bg="transparent"
                                  _hover={{ bg: `${customColor}10` }}
                                  borderBottom="1px"
                                  borderColor={`${customColor}20`}
                                  height="50px"
                                >
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    {indexOfFirstItem + idx + 1}
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontWeight="medium" fontSize="xs" py={2}>
                                    {cat.category}
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Text noOfLines={1} maxW="200px">
                                      {cat.description || "-"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Badge
                                      colorScheme={cat.isActive ? "green" : "red"}
                                      px={2}
                                      py={0.5}
                                      borderRadius="full"
                                      fontSize="2xs"
                                      fontWeight="bold"
                                    >
                                      {cat.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Flex gap={2}>
                                      <IconButton
                                        aria-label="View category"
                                        icon={<FaEye />}
                                        bg="white"
                                        color="blue.500"
                                        border="1px"
                                        borderColor="blue.500"
                                        _hover={{ bg: "blue.500", color: "white" }}
                                        size="xs"
                                        onClick={() => handleViewCategory(cat)}
                                      />
                                      <IconButton
                                        aria-label="Edit category"
                                        icon={<FaEdit />}
                                        bg="white"
                                        color={customColor}
                                        border="1px"
                                        borderColor={customColor}
                                        _hover={{ bg: customColor, color: "white" }}
                                        size="xs"
                                        onClick={() => handleEditCategory(cat)}
                                      />
                                      <IconButton
                                        aria-label="Delete category"
                                        icon={<FaTrash />}
                                        bg="white"
                                        color="red.500"
                                        border="1px"
                                        borderColor="red.500"
                                        _hover={{ bg: "red.500", color: "white" }}
                                        size="xs"
                                        onClick={() => handleDeleteCategory(cat)}
                                      />
                                    </Flex>
                                  </Td>
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={5} textAlign="center" py={6}>
                                  <Text fontSize="xs">
                                    {categories.length === 0
                                      ? "No categories found."
                                      : "No categories match your search."}
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
                        flex="1"
                        overflow="auto"
                        px={3}
                        py={2}
                        css={globalScrollbarStyles}
                      >
                        {currentCategories.length > 0 ? (
                          currentCategories.map((cat, idx) => (
                            <CategoryMobileCard key={cat._id || idx} cat={cat} idx={idx} />
                          ))
                        ) : (
                          <Center py={10}>
                            <VStack spacing={2}>
                              <Icon as={MdCategory} color="gray.300" boxSize={10} />
                              <Text fontSize="sm" color="gray.500">No categories found</Text>
                            </VStack>
                          </Center>
                        )}
                      </Box>
                    </Box>

                    {/* Pagination Controls */}
                    {filteredCategories.length > 0 && (
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
                          {/* Page Info */}
                          <Text fontSize="sm" color="gray.600" display={{ base: "none", sm: "block" }}>
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} categories
                          </Text>

                          {/* Pagination Controls */}
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

                            {/* Page Number Display */}
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
                                {totalCategoryPages}
                              </Text>
                            </Flex>

                            <Button
                              size="sm"
                              onClick={handleNextPage}
                              isDisabled={currentPage === totalCategoryPages}
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
                )}

                {/* Services Table */}
                {currentView === "services" && (
                  <>
                    {/* Table Container */}
                    <Box
                      flex="1"
                      display="flex"
                      flexDirection="column"
                      overflow="hidden"
                    >
                      {/* Desktop Table View */}
                      <Box
                        display={{ base: "none", md: "block" }}
                        flex="1"
                        overflow="auto"
                        css={globalScrollbarStyles}
                      >
                        <Table variant="simple" size="sm" bg="transparent">
                          {/* Fixed Header */}
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
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Service Name
                              </Th>
                              <Th
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Category
                              </Th>
                              <Th
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Type
                              </Th>
                              <Th
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Pricing
                              </Th>
                              <Th
                                color="gray.100"
                                borderColor={`${customColor}30`}
                                position="sticky"
                                top={0}
                                bg={`${customColor}`}
                                zIndex={10}
                                fontWeight="bold"
                                fontSize="xs"
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
                                fontSize="xs"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Actions
                              </Th>
                            </Tr>
                          </Thead>

                          {/* Scrollable Body */}
                          <Tbody bg="transparent">
                            {currentServices.length > 0 ? (
                              currentServices.map((service, idx) => (
                                <Tr
                                  key={service._id || idx}
                                  bg="transparent"
                                  _hover={{ bg: `${customColor}10` }}
                                  borderBottom="1px"
                                  borderColor={`${customColor}20`}
                                  height="50px"
                                >
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    {indexOfFirstItem + idx + 1}
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontWeight="medium" fontSize="xs" py={2}>
                                    <Text noOfLines={1} maxW="150px">
                                      {service.serviceName}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Text noOfLines={1} maxW="120px">
                                      {service.categoryId?.category ||
                                        categories.find(c => c._id === service.categoryId)?.category ||
                                        "N/A"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Badge
                                      colorScheme={
                                        service.serviceType === "Installation" ? "blue" :
                                          service.serviceType === "Maintenance" ? "green" :
                                            service.serviceType === "Repair" ? "orange" : "purple"
                                      }
                                      fontSize="2xs"
                                      px={2}
                                      py={0.5}
                                      borderRadius="full"
                                    >
                                      {service.serviceType}
                                    </Badge>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Flex direction="column" gap={0.5}>
                                      <Badge
                                        colorScheme={service.pricingType === "fixed" ? "green" : "blue"}
                                        fontSize="3xs"
                                        px={1}
                                        borderRadius="full"
                                        textAlign="center"
                                      >
                                        {service.pricingType}
                                      </Badge>
                                      <Text fontSize="xs" fontWeight="bold">
                                        ₹{service.serviceCost}
                                      </Text>
                                    </Flex>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Flex direction="column" gap={0.5}>
                                      <Badge
                                        colorScheme={service.isActive ? "green" : "red"}
                                        fontSize="2xs"
                                        px={2}
                                        borderRadius="full"
                                      >
                                        {service.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                      <HStack spacing={1}>
                                        {service.isPopular && (
                                          <Badge colorScheme="orange" fontSize="3xs">P</Badge>
                                        )}
                                        {service.isRecommended && (
                                          <Badge colorScheme="teal" fontSize="3xs">R</Badge>
                                        )}
                                      </HStack>
                                    </Flex>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2}>
                                    <Flex gap={2}>
                                      <IconButton
                                        aria-label="View service"
                                        icon={<FaEye />}
                                        bg="white"
                                        color="blue.500"
                                        border="1px"
                                        borderColor="blue.500"
                                        _hover={{ bg: "blue.500", color: "white" }}
                                        size="xs"
                                        onClick={() => handleViewService(service)}
                                      />
                                      <IconButton
                                        aria-label="Edit service"
                                        icon={<FaEdit />}
                                        bg="white"
                                        color={customColor}
                                        border="1px"
                                        borderColor={customColor}
                                        _hover={{ bg: customColor, color: "white" }}
                                        size="xs"
                                        onClick={() => handleEditService(service)}
                                      />
                                      <IconButton
                                        aria-label="Delete service"
                                        icon={<FaTrash />}
                                        bg="white"
                                        color="red.500"
                                        border="1px"
                                        borderColor="red.500"
                                        _hover={{ bg: "red.500", color: "white" }}
                                        size="xs"
                                        onClick={() => handleDeleteService(service)}
                                      />
                                    </Flex>
                                  </Td>
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={7} textAlign="center" py={6}>
                                  <Text fontSize="xs">
                                    {services.length === 0
                                      ? "No services found."
                                      : "No services match your search."}
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
                        flex="1"
                        overflow="auto"
                        px={3}
                        py={2}
                        css={globalScrollbarStyles}
                      >
                        {currentServices.length > 0 ? (
                          currentServices.map((service, idx) => (
                            <ServiceMobileCard key={service._id || idx} service={service} idx={idx} />
                          ))
                        ) : (
                          <Center py={10}>
                            <VStack spacing={2}>
                              <Icon as={MdInventory} color="gray.300" boxSize={10} />
                              <Text fontSize="sm" color="gray.500">No services found</Text>
                            </VStack>
                          </Center>
                        )}
                      </Box>
                    </Box>

                    {/* Pagination Controls */}
                    {filteredServices.length > 0 && (
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
                          {/* Page Info */}
                          <Text fontSize="sm" color="gray.600" display={{ base: "none", sm: "block" }}>
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length} services
                          </Text>

                          {/* Pagination Controls */}
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

                            {/* Page Number Display */}
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
                                {totalServicePages}
                              </Text>
                            </Flex>

                            <Button
                              size="sm"
                              onClick={handleNextPage}
                              isDisabled={currentPage === totalServicePages}
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
                )}

                {/* Service Analysis View - Simplified without charts */}
                {currentView === "serviceAnalysis" && (
                  <Box
                    flex="1"
                    display="flex"
                    flexDirection="column"
                    overflow="auto"
                    css={globalScrollbarStyles}
                    p={4}
                  >
                    {/* Service Statistics */}
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <Card bg="white" shadow="sm" p={4}>
                        <Text fontWeight="bold" color="gray.700" mb={4}>
                          Service Statistics
                        </Text>
                        <SimpleGrid columns={2} spacing={4}>
                          <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500">Total Services</Text>
                            <Text fontSize="2xl" fontWeight="bold">{services.length}</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500">Active</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="green.500">{stats.activeServices}</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500">Popular</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="orange.500">{stats.popularServices}</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500">Recommended</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="teal.500">{stats.recommendedServices}</Text>
                          </Box>
                        </SimpleGrid>
                      </Card>

                      <Card bg="white" shadow="sm" p={4}>
                        <Text fontWeight="bold" color="gray.700" mb={4}>
                          Revenue Overview
                        </Text>
                        <Box textAlign="center">
                          <Text fontSize="sm" color="gray.500">Total Service Value</Text>
                          <Text fontSize="3xl" fontWeight="bold" color="green.500">
                            ₹{stats.totalRevenue.toLocaleString()}
                          </Text>
                          <Text fontSize="sm" color="gray.500" mt={2}>
                            Average per service: ₹{(stats.totalRevenue / (services.length || 1)).toFixed(0)}
                          </Text>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Top Services List */}
                    <Card bg="white" shadow="sm" p={4} mt={6}>
                      <Text fontWeight="bold" color="gray.700" mb={4}>
                        Top 10 Services by Cost
                      </Text>
                      {services.length > 0 ? (
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Service Name</Th>
                                <Th>Category</Th>
                                <Th>Type</Th>
                                <Th isNumeric>Cost</Th>
                                <Th>Status</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {[...services]
                                .sort((a, b) => (b.serviceCost || 0) - (a.serviceCost || 0))
                                .slice(0, 10)
                                .map((service, index) => (
                                  <Tr key={service._id}>
                                    <Td>{service.serviceName}</Td>
                                    <Td>{service.categoryId?.category || "N/A"}</Td>
                                    <Td>
                                      <Badge colorScheme={
                                        service.serviceType === "Installation" ? "blue" :
                                          service.serviceType === "Maintenance" ? "green" :
                                            service.serviceType === "Repair" ? "orange" : "purple"
                                      }>
                                        {service.serviceType}
                                      </Badge>
                                    </Td>
                                    <Td isNumeric fontWeight="bold">₹{service.serviceCost}</Td>
                                    <Td>
                                      <Badge colorScheme={service.isActive ? "green" : "red"}>
                                        {service.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                            </Tbody>
                          </Table>
                        </Box>
                      ) : (
                        <Center py={10}>
                          <Text fontSize="md" color="gray.500">
                            No services available
                          </Text>
                        </Center>
                      )}
                    </Card>
                  </Box>
                )}
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* View Modal for Category and Service Details */}
      <Modal isOpen={isViewModalOpen} onClose={closeModal} size="lg">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader color="gray.700">
            {viewModalType === "category" ? "Category Details" : "Service Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {viewModalType === "category" && selectedCategory && (
              <SimpleGrid columns={1} spacing={4}>
                {selectedCategory.image && (
                  <Box textAlign="center">
                    <Image
                      src={selectedCategory.image}
                      alt={selectedCategory.category}
                      maxH="200px"
                      mx="auto"
                      borderRadius="md"
                    />
                  </Box>
                )}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Category Name:</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.category}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description:</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.description || "No description"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Status:</Text>
                  <Badge
                    colorScheme={selectedCategory.isActive ? "green" : "red"}
                    fontSize="sm"
                    px={3}
                    py={1}
                  >
                    {selectedCategory.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Services in this category:</Text>
                  <Text fontSize="md" mt={1}>
                    {services.filter(s => s.categoryId?._id === selectedCategory._id || s.categoryId === selectedCategory._id).length} services
                  </Text>
                </Box>
              </SimpleGrid>
            )}

            {viewModalType === "service" && selectedService && (
              <Box>
                {/* Service Images */}
                {selectedService.serviceImages && selectedService.serviceImages.length > 0 && (
                  <Box mb={4}>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Service Images:</Text>
                    <SimpleGrid columns={4} spacing={2}>
                      {selectedService.serviceImages.map((img, index) => (
                        <Box
                          key={index}
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Image
                            src={img.url || img}
                            alt={`Service image ${index + 1}`}
                            w="100%"
                            h="80px"
                            objectFit="cover"
                            border="1px solid"
                            borderColor="gray.200"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Service Name:</Text>
                    <Text fontSize="md" mt={1}>{selectedService.serviceName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Category:</Text>
                    <Text fontSize="md" mt={1}>
                      {selectedService.categoryId?.category ||
                        categories.find(c => c._id === selectedService.categoryId)?.category ||
                        "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Service Type:</Text>
                    <Badge
                      colorScheme={
                        selectedService.serviceType === "Installation" ? "blue" :
                          selectedService.serviceType === "Maintenance" ? "green" :
                            selectedService.serviceType === "Repair" ? "orange" : "purple"
                      }
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {selectedService.serviceType}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Pricing Type:</Text>
                    <Badge
                      colorScheme={selectedService.pricingType === "fixed" ? "green" : "blue"}
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {selectedService.pricingType}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Service Cost:</Text>
                    <Text fontSize="md" mt={1} fontWeight="bold" color="green.600">
                      ₹{selectedService.serviceCost}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Discount:</Text>
                    <Text fontSize="md" mt={1}>{selectedService.serviceDiscountPercentage || 0}%</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Commission:</Text>
                    <Text fontSize="md" mt={1}>{selectedService.commissionPercentage || 0}%</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Duration:</Text>
                    <Text fontSize="md" mt={1}>{selectedService.duration || "Not specified"}</Text>
                  </Box>
                </Grid>

                {/* Description */}
                <Box mt={4}>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description:</Text>
                  <Text fontSize="md" mt={1}>{selectedService.description || "No description"}</Text>
                </Box>

                {/* What's Included */}
                {selectedService.whatIncluded && selectedService.whatIncluded.length > 0 && (
                  <Box mt={4}>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">What's Included:</Text>
                    <Flex wrap="wrap" gap={2} mt={2}>
                      {selectedService.whatIncluded.map((item, index) => (
                        <Badge key={index} colorScheme="green" p={2}>
                          {item}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* What's Not Included */}
                {selectedService.whatNotIncluded && selectedService.whatNotIncluded.length > 0 && (
                  <Box mt={4}>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">What's Not Included:</Text>
                    <Flex wrap="wrap" gap={2} mt={2}>
                      {selectedService.whatNotIncluded.map((item, index) => (
                        <Badge key={index} colorScheme="red" p={2}>
                          {item}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Service Highlights */}
                {selectedService.serviceHighlights && selectedService.serviceHighlights.length > 0 && (
                  <Box mt={4}>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Service Highlights:</Text>
                    <Flex wrap="wrap" gap={2} mt={2}>
                      {selectedService.serviceHighlights.map((item, index) => (
                        <Badge key={index} colorScheme="purple" p={2}>
                          {item}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Additional Information */}
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Service Warranty:</Text>
                    <Text fontSize="md" mt={1}>{selectedService.serviceWarranty || "Not specified"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Cancellation Policy:</Text>
                    <Text fontSize="md" mt={1}>{selectedService.cancellationPolicy || "Not specified"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Requires Spare Parts:</Text>
                    <Badge
                      colorScheme={selectedService.requiresSpareParts ? "red" : "green"}
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {selectedService.requiresSpareParts ? "Yes" : "No"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Site Visit Required:</Text>
                    <Badge
                      colorScheme={selectedService.siteVisitRequired ? "blue" : "gray"}
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {selectedService.siteVisitRequired ? "Yes" : "No"}
                    </Badge>
                  </Box>
                </Grid>

                {/* Status Badges */}
                <Flex gap={3} mt={4} wrap="wrap">
                  <Badge
                    colorScheme={selectedService.isActive ? "green" : "red"}
                    fontSize="sm"
                    px={3}
                    py={1}
                  >
                    {selectedService.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {selectedService.isPopular && (
                    <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                      Popular
                    </Badge>
                  )}
                  {selectedService.isRecommended && (
                    <Badge colorScheme="teal" fontSize="sm" px={3} py={1}>
                      Recommended
                    </Badge>
                  )}
                </Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={closeModal}
              size="sm"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="gray.700">
            <Flex align="center" gap={2}>
              <Icon as={FaExclamationTriangle} color="red.500" />
              Confirm Delete
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="md" mb={4}>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold" color={customColor}>
                "{itemToDelete?.category || itemToDelete?.serviceName}"
              </Text>
              ? This action cannot be undone.
            </Text>

            {deleteType === "category" && (
              <Box
                bg="orange.50"
                p={3}
                borderRadius="md"
                border="1px"
                borderColor="orange.200"
              >
                <Flex align="center" gap={2} mb={2}>
                  <Icon as={MdWarning} color="orange.500" />
                  <Text fontSize="sm" fontWeight="medium" color="orange.700">
                    Important Note
                  </Text>
                </Flex>
                <Text fontSize="sm" color="orange.600">
                  This category must be empty (no services) before it can be deleted.
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={closeDeleteModal}
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
              size="sm"
            >
              Delete {deleteType === "category" ? "Category" : "Service"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}