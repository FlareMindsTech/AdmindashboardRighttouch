
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
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
  deleteServiceImage,
  setServicePolygon,
  removeServicePolygon,
  toggleZoneRestriction,
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
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Progress,
  Tooltip,
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
  FaTools,
  FaTag,
  FaStar,
  FaAward,
  FaMoneyBillWave,
  FaFilter,
  FaRedo,
  FaTrophy,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdCategory, MdInventory, MdWarning, MdAttachMoney } from "react-icons/md";



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
  const [polygonInput, setPolygonInput] = useState("");
  const [polygonSubmitting, setPolygonSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [whatIncludedInput, setWhatIncludedInput] = useState("");
  const [whatNotIncludedInput, setWhatNotIncludedInput] = useState("");
  const [serviceHighlightsInput, setServiceHighlightsInput] = useState("");
  // New input states for array fields
  const [faqInput, setFaqInput] = useState("");
  const [brandsInput, setBrandsInput] = useState("");
  const [rectifyInput, setRectifyInput] = useState("");
  const [faultInput, setFaultInput] = useState("");
  const [toolsInput, setToolsInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");

  // Service Analysis Filters State
  const [analysisCategoryFilter, setAnalysisCategoryFilter] = useState("");
  const [analysisTypeFilter, setAnalysisTypeFilter] = useState("");
  const [analysisStatusFilter, setAnalysisStatusFilter] = useState("");
  const [analysisPricingFilter, setAnalysisPricingFilter] = useState("");
  const [analysisSearchTerm, setAnalysisSearchTerm] = useState("");

  const resetAnalysisFilters = () => {
    setAnalysisCategoryFilter("");
    setAnalysisTypeFilter("");
    setAnalysisStatusFilter("");
    setAnalysisPricingFilter("");
    setAnalysisSearchTerm("");
  };

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
    commissionPercentage: 12,
    technicianAmount: 0,
    whatIncluded: [],
    whatNotIncluded: [],
    serviceImages: [],
    serviceHighlights: [],
    serviceWarranty: "",
    cancellationPolicy: "",
    requiresSpareParts: false,
    zoneRestricted: false,
    duration: "",
    siteVisitRequired: true,
    isActive: true,
    isPopular: false,
    isRecommended: false,
    frequentlyAskedQuestions: [],
    supportedBrands: [],
    rectifyMethod: [],
    faultReasons: [],
    toolsEquipments: [],
    serviceChecklist: [],
  };

  const [newCategory, setNewCategory] = useState(initialCategory);
  const [newService, setNewService] = useState(initialService);


  const serviceTypeOptions = ["Installation", "Maintenance", "Repair", "Inspection"];
  const pricingTypeOptions = ["fixed", "after_inspection"];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredCategories = categories.filter((cat) => {
    const categoryName = (cat.category || cat.name || "").toLowerCase();
    const categoryDesc = (cat.description || "").toLowerCase();
    const searchLow = categorySearch.toLowerCase();
    return categoryName.includes(searchLow) || categoryDesc.includes(searchLow);
  });

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

  const stats = calculateServiceStatistics();

  const getRevenueByTypeData = useCallback(() => {
    const revenueMap = services.reduce((acc, b) => {
      const type = b.serviceType || "Misc";
      acc[type] = (acc[type] || 0) + (b.serviceCost || 0);
      return acc;
    }, {});

    return {
      labels: Object.keys(revenueMap),
      series: [{
        name: 'Total Revenue',
        data: Object.values(revenueMap)
      }]
    };
  }, [services]);

  const chartData = getRevenueByTypeData();

  // Filtered Services for Service Analysis View
  const filteredAnalysisServices = services.filter((service) => {
    if (analysisCategoryFilter) {
      const catId = service.categoryId?._id || service.categoryId;
      if (catId !== analysisCategoryFilter) return false;
    }
    if (analysisTypeFilter && service.serviceType !== analysisTypeFilter) {
      return false;
    }
    if (analysisStatusFilter === "active" && !service.isActive) return false;
    if (analysisStatusFilter === "inactive" && service.isActive) return false;
    if (analysisPricingFilter && service.pricingType !== analysisPricingFilter) return false;
    if (analysisSearchTerm) {
      const query = analysisSearchTerm.toLowerCase();
      const matchesName = service.serviceName?.toLowerCase().includes(query);
      const matchesCat = (service.categoryId?.category || categories.find(c => c._id === service.categoryId)?.category || "").toLowerCase().includes(query);
      if (!matchesName && !matchesCat) return false;
    }
    return true;
  });

  const analysisStats = {
    totalCount: filteredAnalysisServices.length,
    activeServices: filteredAnalysisServices.filter((s) => s.isActive).length,
    popularServices: filteredAnalysisServices.filter((s) => s.isPopular).length,
    recommendedServices: filteredAnalysisServices.filter((s) => s.isRecommended).length,
    totalRevenue: filteredAnalysisServices.reduce((sum, s) => sum + (s.serviceCost || 0), 0),
    avgCost: filteredAnalysisServices.length > 0 
      ? Math.round(filteredAnalysisServices.reduce((sum, s) => sum + (s.serviceCost || 0), 0) / filteredAnalysisServices.length) 
      : 0,
    highestCost: filteredAnalysisServices.length > 0 
      ? Math.max(...filteredAnalysisServices.map(s => s.serviceCost || 0)) 
      : 0,
    activeFiltersCount: [analysisCategoryFilter, analysisTypeFilter, analysisStatusFilter, analysisPricingFilter, analysisSearchTerm].filter(Boolean).length
  };

  const uniqueServiceTypes = Array.from(
    new Set(services.map((s) => s.serviceType).filter(Boolean))
  );




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

  const handleRemoveServiceImage = async (index) => {
    const imageToDelete = newService.serviceImages[index];

    try {
      // If it's an existing image in edit mode, delete from DB
      if (selectedService && imageToDelete && !imageToDelete.isNew) {
        setIsSubmitting(true);
        // Use public_id, _id, url, or the image object itself depending on structure
        const publicId = imageToDelete.public_id ||
          imageToDelete._id ||
          imageToDelete.url ||
          (typeof imageToDelete === 'string' ? imageToDelete : null);

        if (publicId) {
          await deleteServiceImage(selectedService._id, publicId);

          toast({
            title: "Success",
            description: "Service image successfully deleted",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      } else {
        // Just for UI removal of newly added images
        toast({
          title: "Removed",
          description: "Image removed from selection",
          status: "info",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });
      }

      setNewService(prev => ({
        ...prev,
        serviceImages: prev.serviceImages.filter((_, i) => i !== index)
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // --- Handlers for New Array Fields ---

  const handleAddArrayItem = (field, inputState, setInputState) => {
    if (inputState.trim()) {
      setNewService(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), inputState.trim()]
      }));
      setInputState("");
    }
  };

  const handleRemoveArrayItem = (field, index) => {
    setNewService(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
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
        getAllCategories("service"),
        getAllServices(),  // Using the function defined outside component

      ]);

      const categoriesRaw = categoryData.result || categoryData.data || categoryData.categories || categoryData || [];
      const servicesRaw = serviceData.result || serviceData.data || serviceData.services || serviceData || [];

      setCategories(Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw.categories || []));
      setServices(Array.isArray(servicesRaw) ? servicesRaw : (servicesRaw.services || []));



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
    const role = storedUser?.role?.toLowerCase();
    if (!storedUser || (role !== "owner" && role !== "admin" && role !== "super admin")) {
      toast({
        title: "Access Denied",
        description: "Only admin, super admin, or owner can access this page.",
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
    setFaqInput("");
    setBrandsInput("");
    setRectifyInput("");
    setFaultInput("");
    setToolsInput("");
    setChecklistInput("");
  };

  const handleResetCategory = () => setNewCategory(initialCategory);
  const handleResetService = () => {
    setNewService(initialService);
    setWhatIncludedInput("");
    setWhatNotIncludedInput("");
    setServiceHighlightsInput("");
    setFaqInput("");
    setBrandsInput("");
    setRectifyInput("");
    setFaultInput("");
    setToolsInput("");
    setChecklistInput("");
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
        zoneRestricted: newService.zoneRestricted || false,
        duration: newService.duration?.trim() || "",
        siteVisitRequired: newService.siteVisitRequired !== false,
        isActive: newService.isActive !== false,
        isPopular: newService.isPopular || false,
        isRecommended: newService.isRecommended || false,
        // New fields
        frequentlyAskedQuestions: newService.frequentlyAskedQuestions || [],
        supportedBrands: newService.supportedBrands || [],
        rectifyMethod: newService.rectifyMethod || [],
        faultReasons: newService.faultReasons || [],
        toolsEquipments: newService.toolsEquipments || [],
        serviceChecklist: newService.serviceChecklist || [],
        technicianAmount: Number(newService.technicianAmount || 0), // Assuming this is calculated or manually entered
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

        if (!!newService.zoneRestricted !== !!selectedService.zoneRestricted) {
          try {
            await toggleZoneRestriction(selectedService._id, !!newService.zoneRestricted);
          } catch (zoneErr) {
            console.error("Zone restriction toggle failed:", zoneErr);
            toast({
              title: "Zone Restriction Warning",
              description: "Service saved, but the zone-restriction setting failed to sync.",
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
          }
        }
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
    setPolygonInput(service.polygon ? JSON.stringify(service.polygon, null, 2) : "");
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
      zoneRestricted: service.zoneRestricted || false,
      duration: service.duration || "",
      siteVisitRequired: service.siteVisitRequired !== false,
      isActive: service.isActive !== false,
      isPopular: service.isPopular || false,
      isRecommended: service.isRecommended || false,
      // New fields population
      technicianAmount: service.technicianAmount || 0,
      frequentlyAskedQuestions: service.frequentlyAskedQuestions || [],
      supportedBrands: service.supportedBrands || [],
      rectifyMethod: service.rectifyMethod || [],
      faultReasons: service.faultReasons || [],
      toolsEquipments: service.toolsEquipments || [],
      serviceChecklist: service.serviceChecklist || [],
    });
    setCurrentView("addService");
  };

  const handleSetServicePolygon = async () => {
    if (!selectedService) return;
    if (!polygonInput.trim()) {
      return toast({
        title: "Validation Error",
        description: "Paste polygon GeoJSON before setting.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    let polygon = null;
    try {
      const parsed = JSON.parse(polygonInput);
      if (parsed && typeof parsed === "object" && parsed.type && Array.isArray(parsed.coordinates)) {
        polygon = { type: parsed.type, coordinates: parsed.coordinates };
      } else if (Array.isArray(parsed)) {
        polygon = { type: "Polygon", coordinates: parsed };
      } else {
        return toast({
          title: "Validation Error",
          description: "Invalid polygon. Paste a GeoJSON object {type, coordinates} or a coordinate array.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      return toast({
        title: "Validation Error",
        description: "Invalid JSON in polygon field.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPolygonSubmitting(true);
    try {
      await setServicePolygon(selectedService._id, polygon);
      toast({
        title: "Polygon Set",
        description: "Service coverage polygon saved. Customers can only book inside this area.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      const updated = await getAllServices();
      const raw = updated.result || updated.data || updated.services || updated || [];
      const svc = (Array.isArray(raw) ? raw : []).find((s) => s._id === selectedService._id);
      if (svc) setSelectedService(svc);
    } catch (err) {
      toast({
        title: "Polygon Error",
        description: err.message || "Failed to set polygon.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPolygonSubmitting(false);
    }
  };

  const handleRemoveServicePolygon = async () => {
    if (!selectedService) return;
    if (!window.confirm("Remove the coverage polygon for this service? The service will be available everywhere.")) return;
    setPolygonSubmitting(true);
    try {
      await removeServicePolygon(selectedService._id);
      toast({
        title: "Polygon Removed",
        description: "Service coverage polygon removed. Service is now unrestricted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setPolygonInput("");
      await fetchData();
      const updated = await getAllServices();
      const raw = updated.result || updated.data || updated.services || updated || [];
      const svc = (Array.isArray(raw) ? raw : []).find((s) => s._id === selectedService._id);
      if (svc) setSelectedService(svc);
    } catch (err) {
      toast({
        title: "Polygon Error",
        description: err.message || "Failed to remove polygon.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPolygonSubmitting(false);
    }
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

  // Calculate statistics already handled at top

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
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {cat.category || cat.name}
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
        height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
        overflow="hidden"
        css={globalScrollbarStyles}
      >
        <Card
          bg="white"
          shadow="xl"
          display="flex"
          flexDirection="column"
          height="100%"
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
            display="flex"
            flexDirection="column"
            overflow="hidden"
            p={0}
          >
            {/* Category Form */}
            {(currentView === "addCategory" || currentView === "editCategory") && (
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                <Box
                  flex="1"
                  overflowY="auto"
                  p={4}
                  css={globalScrollbarStyles}
                >
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
                </Box>

                <Box
                  p={4}
                  borderTop="1px solid"
                  borderColor="gray.100"
                  bg="white"
                  flexShrink={0}
                >
                  <Flex justify="flex-end" gap={4}>
                    <Button
                      variant="outline"
                      onClick={handleResetCategory}
                      borderColor="gray.300"
                      color="gray.600"
                      size="md"
                      px={8}
                      borderRadius="lg"
                      _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                    >
                      Reset
                    </Button>
                    <Button
                      bg={customColor}
                      _hover={{ bg: "#006666", transform: "translateY(-1px)", boxShadow: "lg" }}
                      _active={{ bg: "#004d4d", transform: "translateY(0)" }}
                      color="white"
                      onClick={currentView === "addCategory" ? handleSubmitCategory : handleUpdateCategory}
                      isLoading={isSubmitting}
                      size="md"
                      px={10}
                      borderRadius="lg"
                      leftIcon={<FaPlusCircle />}
                      transition="all 0.2s"
                    >
                      {currentView === "addCategory" ? "Create Category" : "Update Category"}
                    </Button>
                  </Flex>
                </Box>
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
                        <FormLabel color="gray.700" fontSize="sm">Service Name</FormLabel>
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
                        <FormLabel color="gray.700" fontSize="sm">Category</FormLabel>
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
                        <FormLabel color="gray.700" fontSize="sm">Service Type</FormLabel>
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
                          {serviceTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Pricing Type</FormLabel>
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
                    <Grid templateColumns={["1fr", "1fr 1fr", "repeat(3, 1fr)"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Service Cost (₹)</FormLabel>
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
                          isDisabled
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Min. Visit Charge (₹)</FormLabel>
                        <Input
                          type="number"
                          value={newService.minimumVisitCharge}
                          onChange={(e) => setNewService({ ...newService, minimumVisitCharge: e.target.value })}
                          placeholder="Minimum visit charge"
                          min="0"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Technician Amount (₹)</FormLabel>
                        <Input
                          type="number"
                          value={newService.technicianAmount}
                          // Allow editing or make read-only if strictly calculated
                          onChange={(e) => setNewService({ ...newService, technicianAmount: e.target.value })}
                          placeholder="Technician Amount"
                          min="0"
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

                    {/* New Array Fields: FAQ, Brands, Rectify, Faults, Tools, Checklist */}

                    {/* Frequently Asked Questions */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Frequently Asked Questions</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={faqInput}
                          onChange={(e) => setFaqInput(e.target.value)}
                          placeholder="Add FAQ"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddArrayItem('frequentlyAskedQuestions', faqInput, setFaqInput)}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.frequentlyAskedQuestions?.map((item, index) => (
                          <Badge key={index} colorScheme="blue" p={2} whiteSpace="normal" textAlign="left">
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveArrayItem('frequentlyAskedQuestions', index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Supported Brands */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Supported Brands</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={brandsInput}
                          onChange={(e) => setBrandsInput(e.target.value)}
                          placeholder="Add brand (e.g. LG, Samsung)"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddArrayItem('supportedBrands', brandsInput, setBrandsInput)}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.supportedBrands?.map((item, index) => (
                          <Badge key={index} colorScheme="teal" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveArrayItem('supportedBrands', index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Service Checklist */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Service Checklist</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={checklistInput}
                          onChange={(e) => setChecklistInput(e.target.value)}
                          placeholder="Add checklist item"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddArrayItem('serviceChecklist', checklistInput, setChecklistInput)}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.serviceChecklist?.map((item, index) => (
                          <Badge key={index} colorScheme="cyan" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveArrayItem('serviceChecklist', index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Rectify Method */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Rectify Method</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={rectifyInput}
                          onChange={(e) => setRectifyInput(e.target.value)}
                          placeholder="Add rectify method"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddArrayItem('rectifyMethod', rectifyInput, setRectifyInput)}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.rectifyMethod?.map((item, index) => (
                          <Badge key={index} colorScheme="orange" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveArrayItem('rectifyMethod', index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Fault Reasons */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Fault Reasons</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={faultInput}
                          onChange={(e) => setFaultInput(e.target.value)}
                          placeholder="Add fault reason"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddArrayItem('faultReasons', faultInput, setFaultInput)}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.faultReasons?.map((item, index) => (
                          <Badge key={index} colorScheme="red" variant="subtle" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveArrayItem('faultReasons', index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>

                    {/* Tools & Equipments */}
                    <FormControl mb={4}>
                      <FormLabel color="gray.700" fontSize="sm">Tools & Equipments</FormLabel>
                      <Flex mb={2} gap={2}>
                        <Input
                          value={toolsInput}
                          onChange={(e) => setToolsInput(e.target.value)}
                          placeholder="Add tool/equipment"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddArrayItem('toolsEquipments', toolsInput, setToolsInput)}
                          leftIcon={<FaPlus />}
                          bg={customColor}
                          _hover={{ bg: customHoverColor }}
                          color="white"
                        >
                          Add
                        </Button>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {newService.toolsEquipments?.map((item, index) => (
                          <Badge key={index} colorScheme="gray" p={2}>
                            {item}
                            <IconButton
                              aria-label="Remove item"
                              icon={<FaTimes />}
                              size="2xs"
                              ml={2}
                              onClick={() => handleRemoveArrayItem('toolsEquipments', index)}
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
                          isChecked={newService.zoneRestricted}
                          onChange={(e) => setNewService({ ...newService, zoneRestricted: e.target.checked })}
                          colorScheme="blue"
                          size="sm"
                        >
                          Restrict to Zones
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
                  p={6}
                  borderTop="1px solid"
                  borderColor={`${customColor}20`}
                  bg="white"
                  boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.05)"
                  flexShrink={0}
                >
                  <Flex justify="flex-end" gap={4}>
                    <Button
                      variant="outline"
                      onClick={handleResetService}
                      borderColor="gray.300"
                      color="gray.600"
                      size="md"
                      px={8}
                      borderRadius="lg"
                      _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                    >
                      Reset
                    </Button>

                    <Button
                      bg={customColor}
                      _hover={{ bg: "#006666" }}
                      _active={{ bg: "#004d4d" }}
                      color="white"
                      onClick={handleSubmitService}
                      isLoading={isSubmitting}
                      size="md"
                      px={10}
                      borderRadius="lg"
                      leftIcon={selectedService ? <FaEdit /> : <FaPlusCircle />}
                    >
                      {selectedService ? "Update Service" : "Create Service"}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}
          </CardBody>
        </Card>
      </Flex >
    );
  }

  // Main Dashboard View with Fixed Layout
  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "45px" }}
      height={{ base: "calc(100vh - 20px)", md: "calc(100vh - 40px)" }}
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
          gap={{ base: "8px", md: "10px" }}
          mb={{ base: "8px", md: "12px" }}
        >
          {/* All Categories Card */}
          <Card
            minH={{ base: "55px", md: "60px" }}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
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
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
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
            minH={{ base: "55px", md: "60px" }}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
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
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
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
            minH={{ base: "55px", md: "60px" }}
            cursor="pointer"
            onClick={() => setCurrentView("serviceAnalysis")}
            border={currentView === "serviceAnalysis" || currentView === "revenueAnalysis" ? "2px solid" : "1px solid"}
            borderColor={currentView === "serviceAnalysis" || currentView === "revenueAnalysis" ? customColor : `${customColor}30`}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
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
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
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
            minH={{ base: "55px", md: "60px" }}
            cursor="pointer"
            onClick={() => setCurrentView("revenueAnalysis")}
            border={currentView === "revenueAnalysis" ? "2px solid" : "1px solid"}
            borderColor={currentView === "revenueAnalysis" ? customColor : `${customColor}30`}
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
            <CardBody position="relative" zIndex={1} p={{ base: 2, md: 3 }}>
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
                  h={{ base: "28px", md: "32px" }}
                  w={{ base: "28px", md: "32px" }}
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
        display="flex"
        flexDirection="column"
        p={4}
        pt={0}
        flex="1"
        overflow="hidden"
      >
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
            p="10px 16px"
            pb="8px"
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
                {currentView === "revenueAnalysis" && "📈 Revenue Analysis"}
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
              <Box display="flex" flexDirection="column" overflow="hidden">
                {/* Categories Table */}
                {currentView === "categories" && (
                  <>
                    {/* Table Container */}
                    <Box
                      display="flex"
                      flexDirection="column"
                      overflow="hidden"
                    >
                      {/* Desktop Table View */}
                      <Box
                        display={{ base: "none", md: "block" }}
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
                                py={2}
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
                                py={2}
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
                                py={2}
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
                                py={2}
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
                                py={2}
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
                                  height="40px"
                                >
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                    {indexOfFirstItem + idx + 1}
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontWeight="medium" fontSize="xs" py={1.5}>
                                    {cat.category || cat.name}
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                    <Text noOfLines={1} maxW="200px">
                                      {cat.description || "-"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
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
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
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
                        overflow="auto"
                        px={3}
                        py={1.5}
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
                      display="flex"
                      flexDirection="column"
                      overflow="hidden"
                    >
                      {/* Desktop Table View */}
                      <Box
                        display={{ base: "none", md: "block" }}
                        overflow="auto"
                        css={globalScrollbarStyles}
                      >
                        <Table variant="simple" size="sm" bg="transparent">
                          {/* Fixed Header */}
                          <Thead>
                            <Tr verticalAlign="middle">
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
                                textAlign="center"
                                w="50px"
                                minW="50px"
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
                                textAlign="left"
                                minW="180px"
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                SERVICE NAME
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
                                textAlign="left"
                                minW="140px"
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                CATEGORY
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
                                textAlign="center"
                                minW="120px"
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                TYPE
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
                                textAlign="center"
                                minW="150px"
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                PRICING
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
                                textAlign="center"
                                minW="140px"
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                STATUS
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
                                textAlign="center"
                                minW="130px"
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                ACTIONS
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
                                  verticalAlign="middle"
                                >
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2.5} textAlign="center" fontWeight="medium">
                                    {indexOfFirstItem + idx + 1}
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontWeight="medium" fontSize="xs" py={2.5}>
                                    <Text noOfLines={1} maxW="200px" title={service.serviceName}>
                                      {service.serviceName}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2.5}>
                                    <Text noOfLines={1} maxW="150px" color="gray.600">
                                      {service.categoryId?.category ||
                                        categories.find(c => c._id === service.categoryId)?.category ||
                                        "N/A"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2.5} textAlign="center">
                                    <Flex justify="center" align="center">
                                      <Badge
                                        colorScheme={
                                          service.serviceType === "Installation" ? "blue" :
                                            service.serviceType === "Maintenance" ? "green" :
                                              service.serviceType === "Repair" ? "orange" : "purple"
                                        }
                                        fontSize="2xs"
                                        px={2.5}
                                        py={0.5}
                                        borderRadius="full"
                                        fontWeight="semibold"
                                      >
                                        {service.serviceType}
                                      </Badge>
                                    </Flex>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2.5} textAlign="center">
                                    <HStack justify="center" spacing={2} align="center">
                                      <Badge
                                        colorScheme={service.pricingType === "fixed" ? "green" : "blue"}
                                        fontSize="3xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        textTransform="capitalize"
                                      >
                                        {service.pricingType}
                                      </Badge>
                                      <Text fontSize="xs" fontWeight="bold" color="gray.800">
                                        ₹{service.serviceCost}
                                      </Text>
                                    </HStack>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2.5} textAlign="center">
                                    <HStack justify="center" spacing={1.5} align="center">
                                      <Badge
                                        colorScheme={service.isActive ? "green" : "red"}
                                        fontSize="2xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                      >
                                        {service.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                      {service.isPopular && (
                                        <Badge colorScheme="orange" fontSize="3xs" px={1.5} py={0.5} borderRadius="md" title="Popular">
                                          P
                                        </Badge>
                                      )}
                                      {service.isRecommended && (
                                        <Badge colorScheme="teal" fontSize="3xs" px={1.5} py={0.5} borderRadius="md" title="Recommended">
                                          R
                                        </Badge>
                                      )}
                                    </HStack>
                                  </Td>
                                  <Td borderColor={`${customColor}20`} fontSize="xs" py={2.5} textAlign="center">
                                    <HStack justify="center" spacing={1.5} align="center">
                                      <IconButton
                                        aria-label="View service"
                                        icon={<FaEye />}
                                        bg="white"
                                        color="blue.500"
                                        border="1px"
                                        borderColor="blue.300"
                                        _hover={{ bg: "blue.500", color: "white", borderColor: "blue.500" }}
                                        size="xs"
                                        h="28px"
                                        w="28px"
                                        borderRadius="md"
                                        onClick={() => handleViewService(service)}
                                      />
                                      <IconButton
                                        aria-label="Edit service"
                                        icon={<FaEdit />}
                                        bg="white"
                                        color={customColor}
                                        border="1px"
                                        borderColor={`${customColor}50`}
                                        _hover={{ bg: customColor, color: "white", borderColor: customColor }}
                                        size="xs"
                                        h="28px"
                                        w="28px"
                                        borderRadius="md"
                                        onClick={() => handleEditService(service)}
                                      />
                                      <IconButton
                                        aria-label="Delete service"
                                        icon={<FaTrash />}
                                        bg="white"
                                        color="red.500"
                                        border="1px"
                                        borderColor="red.300"
                                        _hover={{ bg: "red.500", color: "white", borderColor: "red.500" }}
                                        size="xs"
                                        h="28px"
                                        w="28px"
                                        borderRadius="md"
                                        onClick={() => handleDeleteService(service)}
                                      />
                                    </HStack>
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
                        overflow="auto"
                        px={3}
                        py={1.5}
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

                {/* Service Analysis View */}
                {(currentView === "serviceAnalysis" || currentView === "revenueAnalysis") && (
                  <Box
                    flex="1"
                    display="flex"
                    flexDirection="column"
                    overflowY="auto"
                    css={globalScrollbarStyles}
                    p={{ base: 3, md: 5 }}
                    gap={5}
                  >
                    {/* Header & Interactive Filters Control Panel */}
                    <Card bg="white" shadow="sm" borderRadius="xl" border="1px solid" borderColor="gray.100" p={4}>
                      <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "center" }} gap={4} mb={4}>
                        <Box>
                          <HStack spacing={2} align="center">
                            <Icon as={FaChartLine} color={customColor} boxSize={5} />
                            <Heading size="md" color="gray.800">
                              Service Performance & Analytics
                            </Heading>
                            <Badge colorScheme="teal" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
                              {analysisStats.totalCount} {analysisStats.totalCount === 1 ? "Service" : "Services"}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Analyze service distribution, active status rates, valuation metrics, and cost rankings in real-time.
                          </Text>
                        </Box>

                        {analysisStats.activeFiltersCount > 0 && (
                          <Button
                            leftIcon={<FaRedo />}
                            size="xs"
                            colorScheme="red"
                            variant="light"
                            onClick={resetAnalysisFilters}
                            borderRadius="lg"
                          >
                            Reset Filters ({analysisStats.activeFiltersCount})
                          </Button>
                        )}
                      </Flex>

                      {/* Interactive Filter Grid */}
                      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap={3}>
                        {/* Search Term */}
                        <Box>
                          <Text fontSize="2xs" fontWeight="bold" color="gray.600" mb={1} textTransform="uppercase">
                            Search Service
                          </Text>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <FaSearch color="gray.400" size={12} />
                            </InputLeftElement>
                            <Input
                              placeholder="Search by name..."
                              value={analysisSearchTerm}
                              onChange={(e) => setAnalysisSearchTerm(e.target.value)}
                              borderRadius="lg"
                              borderColor="gray.200"
                              fontSize="xs"
                              _focus={{ borderColor: customColor }}
                            />
                            {analysisSearchTerm && (
                              <InputRightElement width="2rem">
                                <IconButton
                                  icon={<FaTimes />}
                                  size="xs"
                                  variant="ghost"
                                  aria-label="Clear search"
                                  onClick={() => setAnalysisSearchTerm("")}
                                />
                              </InputRightElement>
                            )}
                          </InputGroup>
                        </Box>

                        {/* Category Filter */}
                        <Box>
                          <Text fontSize="2xs" fontWeight="bold" color="gray.600" mb={1} textTransform="uppercase">
                            Category
                          </Text>
                          <Select
                            size="sm"
                            borderRadius="lg"
                            borderColor="gray.200"
                            fontSize="xs"
                            value={analysisCategoryFilter}
                            onChange={(e) => setAnalysisCategoryFilter(e.target.value)}
                            _focus={{ borderColor: customColor }}
                          >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.category}
                              </option>
                            ))}
                          </Select>
                        </Box>

                        {/* Service Type Filter */}
                        <Box>
                          <Text fontSize="2xs" fontWeight="bold" color="gray.600" mb={1} textTransform="uppercase">
                            Service Type
                          </Text>
                          <Select
                            size="sm"
                            borderRadius="lg"
                            borderColor="gray.200"
                            fontSize="xs"
                            value={analysisTypeFilter}
                            onChange={(e) => setAnalysisTypeFilter(e.target.value)}
                            _focus={{ borderColor: customColor }}
                          >
                            <option value="">All Types</option>
                            {uniqueServiceTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Select>
                        </Box>

                        {/* Status Filter */}
                        <Box>
                          <Text fontSize="2xs" fontWeight="bold" color="gray.600" mb={1} textTransform="uppercase">
                            Status
                          </Text>
                          <Select
                            size="sm"
                            borderRadius="lg"
                            borderColor="gray.200"
                            fontSize="xs"
                            value={analysisStatusFilter}
                            onChange={(e) => setAnalysisStatusFilter(e.target.value)}
                            _focus={{ borderColor: customColor }}
                          >
                            <option value="">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                          </Select>
                        </Box>

                        {/* Pricing Type Filter */}
                        <Box>
                          <Text fontSize="2xs" fontWeight="bold" color="gray.600" mb={1} textTransform="uppercase">
                            Pricing Model
                          </Text>
                          <Select
                            size="sm"
                            borderRadius="lg"
                            borderColor="gray.200"
                            fontSize="xs"
                            value={analysisPricingFilter}
                            onChange={(e) => setAnalysisPricingFilter(e.target.value)}
                            _focus={{ borderColor: customColor }}
                          >
                            <option value="">All Pricing</option>
                            <option value="fixed">Fixed Price</option>
                            <option value="variable">Variable / Inspection</option>
                          </Select>
                        </Box>
                      </Grid>
                    </Card>

                    {currentView === "serviceAnalysis" && (
                      <>
                        {/* Executive Metric Cards */}
                        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
                          {/* Card 1: Total Services */}
                          <Card bg="white" shadow="sm" borderRadius="xl" border="1px solid" borderColor="teal.100" p={4} position="relative" overflow="hidden">
                            <Box position="absolute" top="-10px" right="-10px" w="70px" h="70px" bg="teal.50" borderRadius="full" zIndex={0} opacity={0.6} />
                            <Flex justify="space-between" align="flex-start" position="relative" zIndex={1}>
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                  Total Services
                                </Text>
                                <Heading size="lg" color="teal.700" mt={1} fontWeight="extrabold">
                                  {analysisStats.totalCount}
                                </Heading>
                                <Text fontSize="3xs" color="gray.500" mt={1}>
                                  Out of {services.length} registered overall
                                </Text>
                              </Box>
                              <Flex w="40px" h="40px" bg="teal.500" color="white" borderRadius="xl" justify="center" align="center" shadow="sm">
                                <Icon as={FaTools} boxSize={5} />
                              </Flex>
                            </Flex>
                          </Card>

                          {/* Card 2: Active Services Rate */}
                          <Card bg="white" shadow="sm" borderRadius="xl" border="1px solid" borderColor="green.100" p={4} position="relative" overflow="hidden">
                            <Box position="absolute" top="-10px" right="-10px" w="70px" h="70px" bg="green.50" borderRadius="full" zIndex={0} opacity={0.6} />
                            <Flex justify="space-between" align="flex-start" position="relative" zIndex={1}>
                              <Box flex="1">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                  Active Services
                                </Text>
                                <HStack spacing={2} align="baseline" mt={1}>
                                  <Heading size="lg" color="green.600" fontWeight="extrabold">
                                    {analysisStats.activeServices}
                                  </Heading>
                                  <Badge colorScheme="green" fontSize="3xs" borderRadius="full" px={1.5}>
                                    {analysisStats.totalCount > 0
                                      ? `${Math.round((analysisStats.activeServices / analysisStats.totalCount) * 100)}% Active`
                                      : "0%"}
                                  </Badge>
                                </HStack>
                                <Progress
                                  value={analysisStats.totalCount > 0 ? (analysisStats.activeServices / analysisStats.totalCount) * 100 : 0}
                                  size="xs"
                                  colorScheme="green"
                                  borderRadius="full"
                                  mt={2.5}
                                />
                              </Box>
                              <Flex w="40px" h="40px" bg="green.500" color="white" borderRadius="xl" justify="center" align="center" shadow="sm" ml={2}>
                                <Icon as={FaCheckCircle} boxSize={5} />
                              </Flex>
                            </Flex>
                          </Card>

                          {/* Card 3: Featured & Highlights */}
                          <Card bg="white" shadow="sm" borderRadius="xl" border="1px solid" borderColor="orange.100" p={4} position="relative" overflow="hidden">
                            <Box position="absolute" top="-10px" right="-10px" w="70px" h="70px" bg="orange.50" borderRadius="full" zIndex={0} opacity={0.6} />
                            <Flex justify="space-between" align="flex-start" position="relative" zIndex={1}>
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                  Featured Highlights
                                </Text>
                                <HStack spacing={3} mt={1.5}>
                                  <VStack align="flex-start" spacing={0}>
                                    <Text fontSize="2xs" color="gray.500">Popular</Text>
                                    <Text fontSize="md" fontWeight="bold" color="orange.600">
                                      {analysisStats.popularServices}
                                    </Text>
                                  </VStack>
                                  <Box w="1px" h="24px" bg="gray.200" />
                                  <VStack align="flex-start" spacing={0}>
                                    <Text fontSize="2xs" color="gray.500">Recommended</Text>
                                    <Text fontSize="md" fontWeight="bold" color="purple.600">
                                      {analysisStats.recommendedServices}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Box>
                              <Flex w="40px" h="40px" bg="orange.400" color="white" borderRadius="xl" justify="center" align="center" shadow="sm">
                                <Icon as={FaStar} boxSize={5} />
                              </Flex>
                            </Flex>
                          </Card>

                          {/* Card 4: Total Portfolio Value */}
                          <Card bg="white" shadow="sm" borderRadius="xl" border="1px solid" borderColor="purple.100" p={4} position="relative" overflow="hidden">
                            <Box position="absolute" top="-10px" right="-10px" w="70px" h="70px" bg="purple.50" borderRadius="full" zIndex={0} opacity={0.6} />
                            <Flex justify="space-between" align="flex-start" position="relative" zIndex={1}>
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                  Total Service Value
                                </Text>
                                <Heading size="lg" color="purple.700" mt={1} fontWeight="extrabold">
                                  ₹{analysisStats.totalRevenue.toLocaleString()}
                                </Heading>
                                <Text fontSize="3xs" color="gray.500" mt={1}>
                                  Avg: ₹{analysisStats.avgCost.toLocaleString()} | Max: ₹{analysisStats.highestCost.toLocaleString()}
                                </Text>
                              </Box>
                              <Flex w="40px" h="40px" bg="purple.600" color="white" borderRadius="xl" justify="center" align="center" shadow="sm">
                                <Icon as={FaMoneyBillWave} boxSize={5} />
                              </Flex>
                            </Flex>
                          </Card>
                        </Grid>
                      </>
                    )}

                    {/* Revenue Line Chart - only visible for revenue analysis */}
                    {currentView === "revenueAnalysis" && (
                      <Card bg="white" shadow="sm" borderRadius="xl" p={5}>
                        <Heading size="xs" color="gray.700" mb={4}>
                          Revenue Distribution by Service Category / Type
                        </Heading>
                        <Box height="300px">
                          <ReactApexChart
                            options={{
                              chart: {
                                type: 'line',
                                toolbar: { show: false },
                                zoom: { enabled: false }
                              },
                              stroke: {
                                curve: 'smooth',
                                width: 3,
                                colors: [customColor]
                              },
                              markers: {
                                size: 5,
                                colors: [customColor],
                                strokeColors: '#fff',
                                strokeWidth: 2,
                              },
                              xaxis: {
                                categories: chartData.labels,
                                labels: { rotate: -45, style: { colors: 'gray', fontSize: '12px' } }
                              },
                              yaxis: {
                                labels: {
                                  formatter: (val) => `₹${val.toLocaleString()}`,
                                  style: { colors: 'gray', fontSize: '12px' }
                                }
                              },
                              tooltip: {
                                theme: 'light',
                                y: { formatter: (val) => `₹${val.toLocaleString()}` }
                              },
                              grid: {
                                borderColor: '#f1f1f1',
                              },
                              colors: [customColor]
                            }}
                            series={chartData.series}
                            type="line"
                            height="100%"
                          />
                        </Box>
                      </Card>
                    )}

                    {/* Ranked Services Table */}
                    {currentView === "serviceAnalysis" && (
                      <Card bg="white" shadow="sm" borderRadius="xl" p={5} border="1px solid" borderColor="gray.100">
                        <Flex justify="space-between" align="center" mb={4}>
                          <Box>
                            <HStack spacing={2}>
                              <Icon as={FaTrophy} color="amber.500" />
                              <Heading size="xs" color="gray.800" textTransform="uppercase" letterSpacing="wide">
                                Top Services Ranked by Cost
                              </Heading>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" mt={0.5}>
                              Showing highest value services according to applied filter criteria.
                            </Text>
                          </Box>
                          <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="xs">
                            {filteredAnalysisServices.length} Results
                          </Badge>
                        </Flex>

                        {filteredAnalysisServices.length > 0 ? (
                          <Box overflowX="auto" css={globalScrollbarStyles}>
                            <Table variant="simple" size="sm">
                              <Thead bg={`${customColor}10`}>
                                <Tr verticalAlign="middle">
                                  <Th textAlign="center" w="60px" color="gray.700" py={3}>RANK</Th>
                                  <Th color="gray.700" py={3}>SERVICE NAME</Th>
                                  <Th color="gray.700" py={3}>CATEGORY</Th>
                                  <Th textAlign="center" color="gray.700" py={3}>SERVICE TYPE</Th>
                                  <Th textAlign="right" color="gray.700" py={3}>COST (₹)</Th>
                                  <Th textAlign="center" color="gray.700" py={3}>STATUS & PRICING</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {[...filteredAnalysisServices]
                                  .sort((a, b) => (b.serviceCost || 0) - (a.serviceCost || 0))
                                  .slice(0, 10)
                                  .map((service, index) => {
                                    const rank = index + 1;
                                    const isGold = rank === 1;
                                    const isSilver = rank === 2;
                                    const isBronze = rank === 3;

                                    return (
                                      <Tr key={service._id || index} _hover={{ bg: `${customColor}08` }} verticalAlign="middle">
                                        <Td textAlign="center" py={3}>
                                          {isGold ? (
                                            <Badge colorScheme="yellow" bg="yellow.100" color="yellow.800" fontSize="2xs" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                              🥇 #1
                                            </Badge>
                                          ) : isSilver ? (
                                            <Badge colorScheme="gray" bg="gray.200" color="gray.800" fontSize="2xs" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                              🥈 #2
                                            </Badge>
                                          ) : isBronze ? (
                                            <Badge colorScheme="orange" bg="orange.100" color="orange.800" fontSize="2xs" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                              🥉 #3
                                            </Badge>
                                          ) : (
                                            <Text fontSize="xs" fontWeight="bold" color="gray.500">
                                              #{rank}
                                            </Text>
                                          )}
                                        </Td>
                                        <Td py={3}>
                                          <Text fontWeight="bold" fontSize="xs" color="gray.800" noOfLines={1} maxW="240px">
                                            {service.serviceName}
                                          </Text>
                                        </Td>
                                        <Td py={3}>
                                          <Text fontSize="xs" color="gray.600" noOfLines={1} maxW="160px">
                                            {service.categoryId?.category ||
                                              categories.find(c => c._id === service.categoryId)?.category ||
                                              "N/A"}
                                          </Text>
                                        </Td>
                                        <Td textAlign="center" py={3}>
                                          <Badge
                                            colorScheme={
                                              service.serviceType === "Installation" ? "blue" :
                                                service.serviceType === "Maintenance" ? "green" :
                                                  service.serviceType === "Repair" ? "orange" : "purple"
                                            }
                                            fontSize="2xs"
                                            px={2.5}
                                            py={0.5}
                                            borderRadius="full"
                                          >
                                            {service.serviceType || "General"}
                                          </Badge>
                                        </Td>
                                        <Td textAlign="right" py={3}>
                                          <Text fontSize="xs" fontWeight="extrabold" color="teal.700">
                                            ₹{(service.serviceCost || 0).toLocaleString()}
                                          </Text>
                                        </Td>
                                        <Td textAlign="center" py={3}>
                                          <HStack justify="center" spacing={1.5}>
                                            <Badge
                                              colorScheme={service.isActive ? "green" : "red"}
                                              fontSize="3xs"
                                              px={2}
                                              py={0.5}
                                              borderRadius="full"
                                            >
                                              {service.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <Badge
                                              colorScheme={service.pricingType === "fixed" ? "teal" : "blue"}
                                              fontSize="3xs"
                                              px={1.5}
                                              py={0.5}
                                              borderRadius="md"
                                              textTransform="capitalize"
                                            >
                                              {service.pricingType || "fixed"}
                                            </Badge>
                                          </HStack>
                                        </Td>
                                      </Tr>
                                    );
                                  })}
                              </Tbody>
                            </Table>
                          </Box>
                        ) : (
                          <Center py={10} flexDir="column" gap={2}>
                            <Icon as={FaSearch} color="gray.300" boxSize={8} />
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                              No services match the selected filter criteria.
                            </Text>
                            <Button size="xs" colorScheme="teal" variant="outline" onClick={resetAnalysisFilters} mt={2}>
                              Reset Filters
                            </Button>
                          </Center>
                        )}
                      </Card>
                    )}
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
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Tech Amount:</Text>
                    <Text fontSize="md" mt={1} fontWeight="bold" color="blue.600">
                      ₹{selectedService.technicianAmount || 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Min. Visit Charge:</Text>
                    <Text fontSize="md" mt={1}>
                      ₹{selectedService.minimumVisitCharge || 0}
                    </Text>
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

                {/* New Array Fields Display */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>

                  {/* FAQs */}
                  {selectedService.frequentlyAskedQuestions && selectedService.frequentlyAskedQuestions.length > 0 && (
                    <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">FAQs:</Text>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {selectedService.frequentlyAskedQuestions.map((item, index) => (
                          <Badge key={index} colorScheme="blue" p={2} whiteSpace="normal" textAlign="left">
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {/* Supported Brands */}
                  {selectedService.supportedBrands && selectedService.supportedBrands.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">Supported Brands:</Text>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {selectedService.supportedBrands.map((item, index) => (
                          <Badge key={index} colorScheme="teal" p={2}>
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {/* Service Checklist */}
                  {selectedService.serviceChecklist && selectedService.serviceChecklist.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">Checklist:</Text>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {selectedService.serviceChecklist.map((item, index) => (
                          <Badge key={index} colorScheme="cyan" p={2}>
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {/* Rectify Method */}
                  {selectedService.rectifyMethod && selectedService.rectifyMethod.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">Rectify Method:</Text>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {selectedService.rectifyMethod.map((item, index) => (
                          <Badge key={index} colorScheme="orange" p={2}>
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {/* Fault Reasons */}
                  {selectedService.faultReasons && selectedService.faultReasons.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">Fault Reasons:</Text>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {selectedService.faultReasons.map((item, index) => (
                          <Badge key={index} colorScheme="red" variant="subtle" p={2}>
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {/* Tools */}
                  {selectedService.toolsEquipments && selectedService.toolsEquipments.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">Tools & Equipment:</Text>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {selectedService.toolsEquipments.map((item, index) => (
                          <Badge key={index} colorScheme="gray" p={2}>
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </SimpleGrid>

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

                {/* Service Coverage Polygon */}
                <Box mt={4} p={4} border="1px solid" borderColor={`${customColor}20`} borderRadius="md" bg="gray.50">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">
                      Service Coverage Polygon
                    </Text>
                    <Badge colorScheme={selectedService.polygon ? "green" : "gray"} fontSize="xs">
                      {selectedService.polygon ? "Defined" : "Unrestricted"}
                    </Badge>
                  </Flex>
                  {selectedService.polygon && (
                    <Text fontSize="xs" color="gray.500" mb={2} fontFamily="monospace">
                      {selectedService.polygon.type || "Polygon"} •{" "}
                      {selectedService.polygon.coordinates?.length || 0} ring(s) •{" "}
                      {(selectedService.polygon.coordinates?.[0]?.length || 0)} points
                    </Text>
                  )}
                  <Textarea
                    value={polygonInput}
                    onChange={(e) => setPolygonInput(e.target.value)}
                    placeholder={'{\n  "type": "Polygon",\n  "coordinates": [\n    [[72.83, 19.07], [72.94, 19.07], [72.94, 19.22], [72.83, 19.22], [72.83, 19.07]]\n  ]\n}'}
                    size="sm"
                    rows={4}
                    fontFamily="monospace"
                    fontSize="xs"
                    bg="white"
                    borderColor="gray.300"
                  />
                  <Flex gap={2} mt={2} justify="flex-end">
                    {selectedService.polygon && (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="red.400"
                        color="red.500"
                        _hover={{ bg: "red.500", color: "white" }}
                        onClick={handleRemoveServicePolygon}
                        isLoading={polygonSubmitting}
                      >
                        Remove Polygon
                      </Button>
                    )}
                    <Button
                      size="xs"
                      bg={customColor}
                      color="white"
                      _hover={{ bg: "#006666" }}
                      onClick={handleSetServicePolygon}
                      isLoading={polygonSubmitting}
                    >
                      Set Polygon
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}
          </ModalBody>

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