// ProductManagement.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCategories,
  createCategories,
  getAllProducts,
  createProducts,
  updateCategories,
  deleteCategory,
  updateProducts,
  deleteProducts,
  uploadProductImage,
  uploadProductImages,
  uploadImageCategory,
  removeCategoryImage,
  deleteProductImage,
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
  Switch,
  Checkbox,
  Stack,
  VStack,
  HStack,
  Avatar,
  Tooltip,
  useBreakpointValue,
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
  FaBox,
  FaTag,
  FaRupeeSign,
  FaBoxes,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdCategory, MdInventory, MdWarning } from "react-icons/md";

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

// Mobile Card Component for Categories
const CategoryMobileCard = ({ cat, idx, indexOfFirstItem, onView, onEdit, onDelete, onAddProduct }) => {
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
          {cat.image || cat.url ? (
            <Image
              src={cat.image || cat.url}
              alt={cat.category || cat.name}
              boxSize="24px"
              borderRadius="full"
              objectFit="cover"
            />
          ) : (
            <IconBox h="24px" w="24px" bg={customColor}>
              <Icon as={MdCategory} h="12px" w="12px" color="white" />
            </IconBox>
          )}
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {cat.category || cat.name}
          </Text>
        </HStack>
        <Badge
          bg="#dffff9ff"
          color="#008080"
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          Active
        </Badge>
      </Flex>

      <Text fontSize="2xs" color="gray.600" noOfLines={2} mb={2}>
        {cat.description || "No description"}
      </Text>

      <Flex gap={2} justify="space-between" align="center">
        <Button
          leftIcon={<FaPlus />}
          bg="white"
          color="#008080"
          border="1px"
          borderColor="#008080"
          _hover={{ bg: "#008080", color: "white" }}
          size="xs"
          onClick={() => onAddProduct(cat)}
        >
          Add Product
        </Button>

        <HStack spacing={1}>
          <IconButton
            aria-label="View"
            icon={<FaEye />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            onClick={() => onView(cat)}
          />
          <IconButton
            aria-label="Edit"
            icon={<FaEdit />}
            size="xs"
            colorScheme="teal"
            variant="ghost"
            onClick={() => onEdit(cat)}
          />
          <IconButton
            aria-label="Delete"
            icon={<FaTrash />}
            size="xs"
            colorScheme="red"
            variant="ghost"
            onClick={() => onDelete(cat)}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

// Mobile Card Component for Products
const ProductMobileCard = ({ prod, idx, indexOfFirstItem, onView, onEdit, onDelete, categories }) => {
  const customColor = "#008080";

  // Get category name
  const getCategoryName = () => {
    const categoryData = prod.categoryId || prod.category;
    const isObject = typeof categoryData === 'object' && categoryData !== null;
    const catId = isObject ? categoryData._id : categoryData;
    const catObj = categories.find(c => c._id === catId) || (isObject ? categoryData : null);
    return catObj?.category || catObj?.name || "N/A";
  };

  const priceRange = prod.estimatedPriceFrom && prod.estimatedPriceTo ?
    `₹${prod.estimatedPriceFrom} - ₹${prod.estimatedPriceTo}` :
    (prod.variants?.length > 0 ?
      `₹${Math.min(...prod.variants.map(v => v.price || 0))} - ₹${Math.max(...prod.variants.map(v => v.price || 0))}` :
      (prod.price ? `₹${prod.price}` : "N/A"));

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
          <Avatar
            size="xs"
            name={prod.name}
            src={prod.images?.[0]?.url || prod.images?.[0] || prod.productImages?.[0]?.url}
          />
          <Text fontWeight="bold" color={customColor} fontSize="sm" noOfLines={1}>
            #{indexOfFirstItem + idx + 1} {prod.name}
          </Text>
        </HStack>
        <Badge
          colorScheme={
            prod.status === "Available" ? "green" :
              prod.status === "Out of Stock" ? "orange" : "red"
          }
          borderRadius="full"
          px={2}
          fontSize="3xs"
        >
          {prod.status || "Available"}
        </Badge>
      </Flex>

      <SimpleGrid columns={2} spacing={1} mb={2}>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Category:</Text> {getCategoryName()}
        </Text>
        <Text fontSize="2xs" color="gray.600">
          <Text as="span" fontWeight="bold">Price:</Text> {priceRange}
        </Text>
      </SimpleGrid>

      <Flex gap={2} justify="flex-end">
        <IconButton
          aria-label="View"
          icon={<FaEye />}
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={() => onView(prod)}
        />
        <IconButton
          aria-label="Edit"
          icon={<FaEdit />}
          size="xs"
          colorScheme="teal"
          variant="ghost"
          onClick={() => onEdit(prod)}
        />
        <IconButton
          aria-label="Delete"
          icon={<FaTrash />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={() => onDelete(prod)}
        />
      </Flex>
    </Box>
  );
};

export default function ProductManagement() {
  const getSafeId = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val._id || null;
    if (typeof val === 'string' && val.trim() !== "") return val;
    return null;
  };

  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const navigate = useNavigate();

  // Custom color theme
  const customColor = "#008080";
  const customHoverColor = "#006666";

  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalType, setViewModalType] = useState("");

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Category form
  const initialCategory = { name: "", description: "", image: "", categoryType: "product" };

  // Product form
  const initialProduct = {
    name: "",
    description: "",
    images: [],
    status: "Available",
    productType: "Hardware",
    pricingModel: "fixed",
    estimatedPriceFrom: 0,
    estimatedPriceTo: 0,
    siteInspectionRequired: false,
    installationDuration: "",
    usageType: "",
    whatIncluded: [],
    whatNotIncluded: [],
    warrantyPeriod: "",
    amcAvailable: true,
    amcPricePerYear: ""
  };

  const statusOptions = ["Available", "Out of Stock", "Discontinued"];

  const [newCategory, setNewCategory] = useState(initialCategory);
  const [categoryFile, setCategoryFile] = useState(null);
  const [newProduct, setNewProduct] = useState(initialProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  // Variants management
  const [variants, setVariants] = useState([]);

  // Responsive detection
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Global scrollbar styles
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filtered data
  const filteredCategories = categories.filter((cat) =>
    (cat.category || cat.name)?.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.description?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredProducts = products.filter(
    (prod) =>
      prod.name?.toLowerCase().includes(productSearch.toLowerCase()) &&
      (productCategoryFilter ? (
        (prod.category?._id || prod.category) === productCategoryFilter ||
        (prod.categoryId?._id || prod.categoryId) === productCategoryFilter
      ) : true)
  );

  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Calculate statistics
  const totalCategories = categories.length;
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.status === "Available").length;
  const outOfStockProducts = products.filter(p => p.status === "Out of Stock").length;

  // Category Image Upload Handler
  const handleCategoryImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCategoryFile(file);
      setNewCategory(prev => ({
        ...prev,
        image: URL.createObjectURL(file)
      }));
    }
  };

  const handleRemoveCategoryImg = async () => {
    if (currentView === "editCategory" && selectedCategory && (selectedCategory.image || selectedCategory.url) && !categoryFile) {
      try {
        setIsSubmitting(true);
        await removeCategoryImage(selectedCategory._id);
        setNewCategory(prev => ({ ...prev, image: "", url: "" }));
        setSelectedCategory(prev => ({ ...prev, image: "", url: "" }));
        toast({ title: "Image Removed", status: "success", duration: 3000, isClosable: true });
      } catch (e) {
        toast({ title: "Error Removing Image", description: e.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCategoryFile(null);
      setNewCategory(prev => ({ ...prev, image: "" }));
    }
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    const previewUrls = files.map(file => ({
      url: URL.createObjectURL(file),
      preview: URL.createObjectURL(file),
      file: file
    }));

    setNewProduct(prev => ({
      ...prev,
      images: [...(prev.images || []), ...previewUrls]
    }));
  };

  const handleRemoveImage = (item, index) => {
    let serverIdentifier = null;

    if (item && item.preventDefault) return;

    if (typeof item === 'string' && !item.startsWith('blob:') && !item.includes('://localhost')) {
      serverIdentifier = item;
    } else if (typeof item === 'object' && item !== null && !item.file) {
      serverIdentifier = item.public_id || item.publicId || item.url || item.secure_url;
    }

    if (serverIdentifier) {
      setDeletedImageIds(prev => [...prev, serverIdentifier]);
    }

    if (item && item.file) {
      setImageFiles(prev => prev.filter(f => f !== item.file));
    }

    setNewProduct(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));

    toast({
      title: "Image Removed",
      description: "Image removed from list. Save to apply changes.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (currentView === "categories") {
      setCategorySearch(value);
    } else if (currentView === "products") {
      setProductSearch(value);
    }

    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCategorySearch("");
    setProductSearch("");
    setProductCategoryFilter("");
    setCurrentPage(1);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentView === "categories" && currentPage < totalCategoryPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentView === "products" && currentPage < totalProductPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // View handlers
  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setViewModalType("category");
    setIsViewModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewModalType("product");
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setViewModalType("");
  };

  // Fetch current user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || (storedUser.role?.toLowerCase() !== "owner")) {
      toast({
        title: "Access Denied",
        description: "Only owner can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/auth/signin");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate, toast]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setIsLoadingCategories(true);
      setIsLoadingProducts(true);

      const [categoryData, productData] = await Promise.all([
        getAllCategories(),
        getAllProducts()
      ]);

      // Parse categories
      let categoriesArray = [];
      if (Array.isArray(categoryData)) {
        categoriesArray = categoryData;
      } else if (categoryData && Array.isArray(categoryData.categories)) {
        categoriesArray = categoryData.categories;
      } else if (categoryData && Array.isArray(categoryData.data)) {
        categoriesArray = categoryData.data;
      } else if (categoryData?.data?.categories) {
        categoriesArray = categoryData.data.categories;
      } else if (categoryData?.result && Array.isArray(categoryData.result)) {
        categoriesArray = categoryData.result;
      } else if (categoryData?.result?.categories) {
        categoriesArray = categoryData.result.categories;
      } else {
        const maybeArray = Object.values(categoryData || {}).find((v) => Array.isArray(v));
        if (Array.isArray(maybeArray)) {
          categoriesArray = maybeArray;
        }
      }
      setCategories(categoriesArray);

      // Parse products
      let productsArray = [];
      if (Array.isArray(productData)) {
        productsArray = productData;
      } else if (productData && Array.isArray(productData.products)) {
        productsArray = productData.products;
      } else if (productData && Array.isArray(productData.data)) {
        productsArray = productData.data;
      } else if (productData?.data?.products) {
        productsArray = productData.data.products;
      } else if (productData?.result && Array.isArray(productData.result)) {
        productsArray = productData.result;
      } else if (productData?.result?.products) {
        productsArray = productData.result.products;
      } else {
        const maybeArray = Object.values(productData || {}).find((v) => Array.isArray(v));
        if (Array.isArray(maybeArray)) {
          productsArray = maybeArray;
        }
      }

      const normalizedProducts = productsArray.map(product => ({
        ...product,
        name: product.name || product.productName || "Unnamed Product"
      }));

      setProducts(normalizedProducts);

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
      setIsLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setCategorySearch("");
    setProductSearch("");
    setProductCategoryFilter("");
  }, [currentView]);

  if (!currentUser) return null;

  const handleBack = () => {
    setCurrentView("categories");
    setSelectedCategory(null);
    setSelectedProduct(null);
    setNewCategory(initialCategory);
    setNewProduct(initialProduct);
    setVariants([]);
    setCategoryFile(null);
    setImageFiles([]);
    setDeletedImageIds([]);
  };

  const handleResetCategory = () => {
    setNewCategory(initialCategory);
    setCategoryFile(null);
  };

  const handleResetProduct = () => {
    setNewProduct(initialProduct);
    setImageFiles([]);
    setDeletedImageIds([]);
    setVariants([]);
  };

  // Category Submit
  const handleSubmitCategory = async () => {
    const categoryName = newCategory.name || "";
    const categoryDesc = newCategory.description || "";

    if (!categoryName.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!categoryDesc.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category description is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (!categoryFile) {
      return toast({
        title: "Validation Error",
        description: "Category image is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const categoryData = {
        category: newCategory.name,
        description: newCategory.description,
        categoryType: newCategory.categoryType,
      };

      const resData = await createCategories(categoryData);

      const categoryId =
        resData._id ||
        resData.category?._id ||
        resData.data?._id ||
        resData.data?.category?._id ||
        resData.result?._id;

      if (!categoryId) {
        throw new Error(`Category created but ID was not found in response.`);
      }

      await uploadImageCategory(categoryId, categoryFile);

      toast({
        title: "Category Created",
        description: `"${resData.category?.category || resData.category || categoryData.category}" added successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setNewCategory(initialCategory);
      setCategoryFile(null);
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

  // Update Category
  const handleUpdateCategory = async () => {
    const categoryName = newCategory.name || "";
    const categoryDesc = newCategory.description || "";

    if (!categoryName.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    if (!categoryDesc.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category description is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);
      const updateData = {
        category: categoryName.trim(),
        description: categoryDesc.trim(),
        categoryType: newCategory.categoryType
      };

      await updateCategories(selectedCategory._id, updateData);

      if (categoryFile && selectedCategory._id) {
        try {
          await uploadImageCategory(selectedCategory._id, categoryFile);
        } catch (uploadError) {
          console.error("Image upload failed during update:", uploadError);
          toast({
            title: "Warning",
            description: "Category details updated, but image upload failed.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }

      toast({
        title: "Category Updated",
        description: `"${categoryName}" updated successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setCategoryFile(null);
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

  // Delete handlers
  const handleDeleteCategory = async (category) => {
    setItemToDelete(category);
    setDeleteType("category");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    setItemToDelete(product);
    setDeleteType("product");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);

      if (deleteType === "category") {
        const productsInCategory = products.filter(
          p => p.category?._id === itemToDelete._id || p.category === itemToDelete._id
        );

        if (productsInCategory.length > 0) {
          toast({
            title: "Cannot Delete Category",
            description: `This category has ${productsInCategory.length} product(s). Please remove or reassign them first.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        await deleteCategory(itemToDelete._id);
        toast({
          title: "Category Deleted",
          description: `"${itemToDelete.name || itemToDelete.category}" has been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (deleteType === "product") {
        await deleteProducts(itemToDelete._id);
        toast({
          title: "Product Deleted",
          description: `"${itemToDelete.name}" has been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchData();
      closeDeleteModal();
    } catch (err) {
      toast({
        title: `Error Deleting ${deleteType === "category" ? "Category" : "Product"}`,
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

  // Product Submit
  const handleSubmitProduct = async () => {
    if (!newProduct.name || !newProduct.name.trim()) {
      return toast({
        title: "Validation Error",
        description: "Product name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    let finalCategoryId =
      getSafeId(selectedCategory) ||
      getSafeId(newProduct.categoryId) ||
      getSafeId(newProduct.category) ||
      getSafeId(selectedProduct?.category) ||
      getSafeId(selectedProduct?.categoryId) ||
      getSafeId(selectedProduct?.category?._id) ||
      getSafeId(selectedProduct?.categoryId?._id);

    if (!finalCategoryId && selectedProduct) {
      const possibleFieldNames = ['category', 'categoryId', 'category_id'];
      for (const field of possibleFieldNames) {
        const val = selectedProduct[field];
        if (val) {
          if (typeof val === 'string' && val.trim() !== "") {
            finalCategoryId = val;
            break;
          } else if (typeof val === 'object' && val._id) {
            finalCategoryId = val._id;
            break;
          }
        }
      }
    }

    if (!finalCategoryId) {
      return toast({
        title: "Validation Error",
        description: "Category is required. Please ensure this product is linked to a category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (newProduct.estimatedPriceFrom === "" || newProduct.estimatedPriceTo === "") {
      return toast({
        title: "Validation Error",
        description: "Price range (From/To) is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsSubmitting(true);

      const productData = {
        productName: (newProduct.name || "").trim(),
        productType: newProduct.productType || "Hardware",
        description: (newProduct.description || "").trim(),
        pricingModel: newProduct.pricingModel || "fixed",
        estimatedPriceFrom: Number(newProduct.estimatedPriceFrom) || 0,
        estimatedPriceTo: Number(newProduct.estimatedPriceTo) || 0,
        siteInspectionRequired: !!newProduct.siteInspectionRequired,
        installationDuration: newProduct.installationDuration || "2-3 hours",
        usageType: newProduct.usageType || "Residential",
        whatIncluded: Array.isArray(newProduct.whatIncluded) ? newProduct.whatIncluded.map(i => i.trim()).filter(i => i !== "") : [],
        whatNotIncluded: Array.isArray(newProduct.whatNotIncluded) ? newProduct.whatNotIncluded.map(i => i.trim()).filter(i => i !== "") : [],
        warrantyPeriod: newProduct.warrantyPeriod || "2 years",
        amcAvailable: !!newProduct.amcAvailable,
        amcPricePerYear: Number(newProduct.amcPricePerYear) || 0,
        status: newProduct.status || "Available",
        productImages: Array.isArray(newProduct.images) ? newProduct.images.filter(img => !img.file) : [],
        images: Array.isArray(newProduct.images) ? newProduct.images.filter(img => !img.file) : []
      };

      if (finalCategoryId) {
        productData.categoryId = finalCategoryId;
      }

      if (variants && variants.length > 0) {
        productData.variants = variants;
      }

      let response;
      if (selectedProduct) {
        if (!selectedProduct._id) {
          throw new Error("Cannot update: Product ID is missing.");
        }

        if (deletedImageIds.length > 0) {
          try {
            await Promise.all(
              deletedImageIds.map((publicId) =>
                deleteProductImage(selectedProduct._id, publicId)
              )
            );
          } catch (deleteErr) {
            console.error("Failed to delete some images:", deleteErr);
            toast({
              title: "Warning",
              description: "Some images could not be deleted from server.",
              status: "warning",
              duration: 3000,
              isClosable: true,
            });
          }
          setDeletedImageIds([]);
        }

        response = await updateProducts(selectedProduct._id, productData);

        if (imageFiles.length > 0) {
          await uploadProductImages(selectedProduct._id, imageFiles);
        }

        toast({
          title: "Product Updated",
          description: `"${productData.productName}" updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        response = await createProducts(productData);

        const createdProductId =
          response.result?._id ||
          response.data?._id ||
          response._id ||
          response.productId ||
          response.result?.productId;

        if (imageFiles.length > 0 && createdProductId) {
          await uploadProductImages(createdProductId, imageFiles);
        }

        toast({
          title: "Product Created",
          description: `"${productData.productName}" added successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setImageFiles([]);
      await fetchData();
      handleBack();
    } catch (err) {
      console.error("Product submission error:", err);

      let errorTitle = selectedProduct ? "Error Updating Product" : "Error Creating Product";
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

  // Edit handlers
  const handleEditProduct = (product) => {
    setSelectedProduct(product);

    const catId = getSafeId(product.category) || getSafeId(product.categoryId);
    let cat = categories.find((c) => c._id === catId);

    if (!cat && catId) {
      if (typeof product.categoryId === 'object') {
        cat = product.categoryId;
      } else if (typeof product.category === 'object') {
        cat = product.category;
      } else {
        cat = { _id: catId, name: product.categoryName || "Current Category" };
      }
    }

    if (cat) {
      setSelectedCategory(cat);
    }

    const existingImages = Array.isArray(product.productImages) ? product.productImages : (Array.isArray(product.images) ? product.images : []);

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      setVariants(product.variants.map(variant => {
        const color = Array.isArray(variant.color) ? variant.color[0] || '' : variant.color || '';
        const size = Array.isArray(variant.size) ? variant.size[0] || '' : variant.size || '';

        return {
          color: color,
          size: size,
          price: variant.price || '',
          stock: variant.stock || '',
          sku: variant.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
      }));
    } else {
      setVariants([]);
    }

    setNewProduct({
      name: product.productName || product.name || '',
      description: product.description || '',
      images: Array.isArray(existingImages) ? existingImages : [],
      status: product.status || "Available",
      productType: product.productType || "Hardware",
      pricingModel: product.pricingModel || "fixed",
      estimatedPriceFrom: product.estimatedPriceFrom !== undefined ? product.estimatedPriceFrom : 0,
      estimatedPriceTo: product.estimatedPriceTo !== undefined ? product.estimatedPriceTo : 0,
      siteInspectionRequired: !!product.siteInspectionRequired,
      installationDuration: product.installationDuration || "2-3 hours",
      usageType: product.usageType || "Residential",
      whatIncluded: Array.isArray(product.whatIncluded) ? product.whatIncluded : [],
      whatNotIncluded: Array.isArray(product.whatNotIncluded) ? product.whatNotIncluded : [],
      warrantyPeriod: product.warrantyPeriod || "2 years",
      amcAvailable: !!product.amcAvailable,
      amcPricePerYear: product.amcPricePerYear || 0,
      categoryId: catId
    });
    setCurrentView("addProduct");
  };

  const handleAddProductToCategory = (category) => {
    setSelectedCategory(category);
    setNewProduct(initialProduct);
    setVariants([]);
    setImageFiles([]);
    setCurrentView("addProduct");
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryFile(null);
    setNewCategory({
      name: category.name || category.category,
      description: category.description || "",
      image: category.image || category.url || "",
      categoryType: category.categoryType || "product"
    });
    setCurrentView("editCategory");
  };

  // Render Form Views
  if (currentView === "addCategory" || currentView === "editCategory" || currentView === "addProduct") {
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
                {currentView === "addProduct" && (selectedProduct ? "Edit Product" : "Add New Product")}
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
                  <FormControl mb="20px" isRequired>
                    <FormLabel htmlFor="name" color="gray.700" fontSize="sm">Name</FormLabel>
                    <Input
                      id="name"
                      placeholder="Enter category name"
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      value={newCategory.name}
                      borderColor={`${customColor}50`}
                      _hover={{ borderColor: customColor }}
                      _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                      bg="white"
                      size="sm"
                    />
                  </FormControl>

                  <FormControl mb="20px" isRequired>
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

                  <FormControl mb="20px" isRequired>
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
                            onClick={handleRemoveCategoryImg}
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

            {/* Product Form */}
            {currentView === "addProduct" && (
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                overflow="hidden"
                bg="transparent"
              >
                <Box
                  flex="1"
                  overflowY="auto"
                  css={globalScrollbarStyles}
                  pr={2}
                >
                  <Box p={4}>
                    <FormControl mb="20px" isRequired>
                      <FormLabel htmlFor="category" color="gray.700" fontSize="sm">Category</FormLabel>
                      <Select
                        id="category"
                        placeholder="Select category"
                        value={
                          (typeof selectedCategory === 'object' ? selectedCategory?._id : selectedCategory) || ""
                        }
                        onChange={(e) => {
                          const category = categories.find(c => c._id === e.target.value);
                          setSelectedCategory(category || { _id: e.target.value });
                        }}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.category || cat.name}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Product Name</FormLabel>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Enter product name"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Status</FormLabel>
                        <Select
                          value={newProduct.status}
                          onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Estimated Price From (₹)</FormLabel>
                        <Input
                          type="number"
                          value={newProduct.estimatedPriceFrom}
                          onChange={(e) => setNewProduct({ ...newProduct, estimatedPriceFrom: e.target.value })}
                          placeholder="e.g. 2500"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Estimated Price To (₹)</FormLabel>
                        <Input
                          type="number"
                          value={newProduct.estimatedPriceTo}
                          onChange={(e) => setNewProduct({ ...newProduct, estimatedPriceTo: e.target.value })}
                          placeholder="e.g. 3500"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Product Type</FormLabel>
                        <Select
                          value={newProduct.productType}
                          onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          <option value="Hardware">Hardware</option>
                          <option value="Service">Service</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Pricing Model</FormLabel>
                        <Select
                          value={newProduct.pricingModel}
                          onChange={(e) => setNewProduct({ ...newProduct, pricingModel: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="quote">Quote</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Usage Type</FormLabel>
                        <Select
                          value={newProduct.usageType}
                          onChange={(e) => setNewProduct({ ...newProduct, usageType: e.target.value })}
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        >
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Installation Duration</FormLabel>
                        <Input
                          value={newProduct.installationDuration}
                          onChange={(e) => setNewProduct({ ...newProduct, installationDuration: e.target.value })}
                          placeholder="e.g. 2-3 hours"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">Warranty Period</FormLabel>
                        <Input
                          value={newProduct.warrantyPeriod}
                          onChange={(e) => setNewProduct({ ...newProduct, warrantyPeriod: e.target.value })}
                          placeholder="e.g. 2 years"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                        />
                      </FormControl>
                    </Grid>

                    <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="site-inspection" mb="0" fontSize="sm" color="gray.700">
                          Site Inspection?
                        </FormLabel>
                        <Switch
                          id="site-inspection"
                          isChecked={newProduct.siteInspectionRequired}
                          onChange={(e) => setNewProduct({ ...newProduct, siteInspectionRequired: e.target.checked })}
                          colorScheme="teal"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="amc-available" mb="0" fontSize="sm" color="gray.700">
                          AMC Available?
                        </FormLabel>
                        <Switch
                          id="amc-available"
                          isChecked={newProduct.amcAvailable}
                          onChange={(e) => setNewProduct({ ...newProduct, amcAvailable: e.target.checked })}
                          colorScheme="teal"
                          size="sm"
                        />
                      </FormControl>

                      {newProduct.amcAvailable && (
                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.700">AMC Price / Year</FormLabel>
                          <Input
                            type="number"
                            value={newProduct.amcPricePerYear}
                            onChange={(e) => setNewProduct({ ...newProduct, amcPricePerYear: e.target.value })}
                            size="sm"
                            borderColor={`${customColor}50`}
                            _hover={{ borderColor: customColor }}
                            _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                            bg="white"
                          />
                        </FormControl>
                      )}
                    </SimpleGrid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">What's Included</FormLabel>
                        <Textarea
                          value={Array.isArray(newProduct.whatIncluded) ? newProduct.whatIncluded.join('\n') : ''}
                          onChange={(e) => setNewProduct({ ...newProduct, whatIncluded: e.target.value.split('\n').filter(item => item.trim()) })}
                          placeholder="Enter each item on a new line"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">What's Not Included</FormLabel>
                        <Textarea
                          value={Array.isArray(newProduct.whatNotIncluded) ? newProduct.whatNotIncluded.join('\n') : ''}
                          onChange={(e) => setNewProduct({ ...newProduct, whatNotIncluded: e.target.value.split('\n').filter(item => item.trim()) })}
                          placeholder="Enter each item on a new line"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          rows={3}
                        />
                      </FormControl>
                    </Grid>

                    <FormControl mb="20px">
                      <FormLabel color="gray.700" fontSize="sm">Description</FormLabel>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Enter product description"
                        rows={3}
                        borderColor={`${customColor}50`}
                        _hover={{ borderColor: customColor }}
                        _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                        bg="white"
                        size="sm"
                      />
                    </FormControl>

                    <FormControl mb="20px">
                      <FormLabel color="gray.700" fontSize="sm">Product Images</FormLabel>
                      <Flex direction="column" gap={3}>
                        {newProduct.images && newProduct.images.length > 0 && (
                          <Flex wrap="wrap" gap={3}>
                            {newProduct.images.map((img, index) => (
                              <Box
                                key={img.public_id || img.publicId || index}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={2}
                                width="fit-content"
                                position="relative"
                              >
                                <Image
                                  src={img.url || img.preview || img}
                                  alt={`Product image ${index + 1}`}
                                  boxSize="80px"
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
                                  onClick={() => handleRemoveImage(img, index)}
                                  aria-label="Remove image"
                                />
                              </Box>
                            ))}
                          </Flex>
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
                                multiple
                                accept="image/*"
                                height="100%"
                                width="100%"
                                position="absolute"
                                top="0"
                                left="0"
                                opacity="0"
                                cursor="pointer"
                                onChange={handleImageUpload}
                                disabled={isSubmitting}
                              />
                              <Flex direction="column" align="center" justify="center" gap={2}>
                                <Icon as={FaPlusCircle} w={6} h={6} color={customColor} />
                                <Text fontSize="sm" color="gray.500">
                                  Click to upload product images
                                </Text>
                              </Flex>
                            </>
                          )}
                        </Box>
                      </Flex>
                    </FormControl>
                  </Box>
                </Box>

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
                      onClick={handleResetProduct}
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
                      onClick={handleSubmitProduct}
                      isLoading={isSubmitting}
                      size="md"
                      px={10}
                      borderRadius="lg"
                      leftIcon={selectedProduct ? <FaEdit /> : <FaPlusCircle />}
                      transition="all 0.2s"
                    >
                      {selectedProduct ? "Update Product" : "Create Product"}
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

  // Main Dashboard View
  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "45px" }}
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
          {/* All Categories Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
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
                    All Categories
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingCategories ? <Spinner size="xs" /> : totalCategories}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg={customColor}
                >
                  <Icon as={MdCategory} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* All Products Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => setCurrentView("products")}
            border={currentView === "products" ? "2px solid" : "1px solid"}
            borderColor={currentView === "products" ? customColor : `${customColor}30`}
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
                    All Products
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingProducts ? <Spinner size="xs" /> : totalProducts}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg={customColor}
                >
                  <Icon as={FaBox} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* In Stock Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => setCurrentView("products")}
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
            <CardBody position="relative" zIndex={1} p={{ base: 1.5, md: 2 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    In Stock
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingProducts ? <Spinner size="xs" /> : inStockProducts}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg="green.500"
                >
                  <Icon as={FaCheckCircle} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* Out of Stock Card */}
          <Card
            minH={{ base: "45px", md: "50px" }}
            cursor="pointer"
            onClick={() => setCurrentView("products")}
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
            <CardBody position="relative" zIndex={1} p={{ base: 1.5, md: 2 }}>
              <Flex flexDirection="row" align="center" justify="center" w="100%">
                <Stat me="auto">
                  <StatLabel
                    fontSize={{ base: "2xs", md: "xs" }}
                    color="gray.600"
                    fontWeight="bold"
                    pb="1px"
                  >
                    Out of Stock
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      {isLoadingProducts ? <Spinner size="xs" /> : outOfStockProducts}
                    </StatNumber>
                  </Flex>
                </Stat>
                <IconBox
                  as="box"
                  h={{ base: "30px", md: "35px" }}
                  w={{ base: "30px", md: "35px" }}
                  bg="red.500"
                >
                  <Icon as={FaExclamationTriangle} h={{ base: "14px", md: "18px" }} w={{ base: "14px", md: "18px" }} color="white" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        </Grid>
      </Box>

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
              <Heading size="sm" flexShrink={0} color="gray.700">
                {currentView === "categories" ? "🏷️ Categories" : "🛒 Products"}
              </Heading>

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
                      : "Search products..."
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
                {currentView === "products" && (
                  <Select
                    placeholder="All Categories"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    size="sm"
                    mr={2}
                    maxW="150px"
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                    bg="white"
                    fontSize="sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category || cat.name}
                      </option>
                    ))}
                  </Select>
                )}
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

              <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={() => {
                  if (currentView === "categories") {
                    setCurrentView("addCategory");
                  } else {
                    setSelectedCategory(null);
                    setSelectedProduct(null);
                    setNewProduct(initialProduct);
                    setVariants([]);
                    setCurrentView("addProduct");
                  }
                }}
                fontSize="sm"
                borderRadius="6px"
                flexShrink={0}
                leftIcon={<FaPlusCircle />}
                size="sm"
                px={3}
              >
                {currentView === "categories" ? "Add Category" : "Add Product"}
              </Button>
            </Flex>
          </CardHeader>

          {/* Scrollable Table Content Area */}
          <CardBody bg="white" display="flex" flexDirection="column" p={0} overflow="hidden">
            {isLoadingData ? (
              <Flex justify="center" align="center" py={6} flex="1">
                <Spinner size="lg" color={customColor} />
                <Text ml={3} fontSize="sm">Loading data...</Text>
              </Flex>
            ) : (
              <Box display="flex" flexDirection="column" overflow="hidden">
                {/* Desktop Table View */}
                <Box display={{ base: "none", md: "block" }} overflow="auto" css={globalScrollbarStyles}>
                  {currentView === "categories" && (
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
                            bg={customColor}
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
                            bg={customColor}
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
                            bg={customColor}
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
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Add Product
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
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentCategories.length > 0 ? (
                          currentCategories.map((cat, idx) => (
                            <Tr
                              key={cat._id || idx}
                              bg="transparent"
                              _hover={{ bg: `${customColor}10` }}
                              borderBottom="1px"
                              borderColor={`${customColor}20`}
                            >
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                {indexOfFirstItem + idx + 1}
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Flex align="center" gap={2}>
                                  {(cat.image || cat.url) && (
                                    <Image
                                      src={cat.image || cat.url}
                                      alt={cat.category || cat.name}
                                      boxSize="24px"
                                      borderRadius="full"
                                      objectFit="cover"
                                    />
                                  )}
                                  <Text fontWeight="medium" fontSize="xs">
                                    {cat.category || cat.name}
                                  </Text>
                                </Flex>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Text noOfLines={1} maxW="200px">
                                  {cat.description || "-"}
                                </Text>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Badge
                                  bg="#dffff9ff"
                                  color="#008080"
                                  px={2}
                                  py={0.5}
                                  borderRadius="full"
                                  fontSize="2xs"
                                >
                                  Active
                                </Badge>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Button
                                  leftIcon={<FaPlus />}
                                  bg="white"
                                  color="#008080"
                                  border="1px"
                                  borderColor="#008080"
                                  _hover={{ bg: "#008080", color: "white" }}
                                  size="xs"
                                  onClick={() => handleAddProductToCategory(cat)}
                                >
                                  Add Product
                                </Button>
                              </Td>
                              <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                <Flex gap={2}>
                                  <IconButton
                                    aria-label="View"
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
                                    aria-label="Edit"
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
                                    aria-label="Delete"
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
                            <Td colSpan={6} textAlign="center" py={6}>
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
                  )}

                  {currentView === "products" && (
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
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Product
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
                            bg={customColor}
                            zIndex={10}
                            fontWeight="bold"
                            fontSize="xs"
                            py={2}
                            borderBottom="2px solid"
                            borderBottomColor={`${customColor}50`}
                          >
                            Price Range
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
                            bg={customColor}
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
                      <Tbody>
                        {currentProducts.length > 0 ? (
                          currentProducts.map((prod, idx) => {
                            // Get category name
                            const getCategoryName = () => {
                              const categoryData = prod.categoryId || prod.category;
                              const isObject = typeof categoryData === 'object' && categoryData !== null;
                              const catId = isObject ? categoryData._id : categoryData;
                              const catObj = categories.find(c => c._id === catId) || (isObject ? categoryData : null);
                              return catObj?.category || catObj?.name || "N/A";
                            };

                            const priceRange = prod.estimatedPriceFrom && prod.estimatedPriceTo ?
                              `₹${prod.estimatedPriceFrom} - ₹${prod.estimatedPriceTo}` :
                              (prod.variants?.length > 0 ?
                                `₹${Math.min(...prod.variants.map(v => v.price || 0))} - ₹${Math.max(...prod.variants.map(v => v.price || 0))}` :
                                (prod.price ? `₹${prod.price}` : "N/A"));

                            return (
                              <Tr
                                key={prod._id || idx}
                                bg="transparent"
                                _hover={{ bg: `${customColor}10` }}
                                borderBottom="1px"
                                borderColor={`${customColor}20`}
                              >
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  {indexOfFirstItem + idx + 1}
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Flex align="center" gap={2}>
                                    <Avatar
                                      size="xs"
                                      name={prod.name}
                                      src={prod.images?.[0]?.url || prod.images?.[0] || prod.productImages?.[0]?.url}
                                    />
                                    <Text fontWeight="medium" fontSize="xs" noOfLines={1}>
                                      {prod.name}
                                    </Text>
                                  </Flex>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Badge
                                    bg={`${customColor}10`}
                                    color={customColor}
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                    fontSize="2xs"
                                  >
                                    {getCategoryName()}
                                  </Badge>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5} fontWeight="medium">
                                  {priceRange}
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Badge
                                    colorScheme={
                                      prod.status === "Available" ? "green" :
                                        prod.status === "Out of Stock" ? "orange" : "red"
                                    }
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    fontSize="2xs"
                                  >
                                    {prod.status || "Available"}
                                  </Badge>
                                </Td>
                                <Td borderColor={`${customColor}20`} fontSize="xs" py={1.5}>
                                  <Flex gap={2}>
                                    <IconButton
                                      aria-label="View"
                                      icon={<FaEye />}
                                      bg="white"
                                      color="blue.500"
                                      border="1px"
                                      borderColor="blue.500"
                                      _hover={{ bg: "blue.500", color: "white" }}
                                      size="xs"
                                      onClick={() => handleViewProduct(prod)}
                                    />
                                    <IconButton
                                      aria-label="Edit"
                                      icon={<FaEdit />}
                                      bg="white"
                                      color={customColor}
                                      border="1px"
                                      borderColor={customColor}
                                      _hover={{ bg: customColor, color: "white" }}
                                      size="xs"
                                      onClick={() => handleEditProduct(prod)}
                                    />
                                    <IconButton
                                      aria-label="Delete"
                                      icon={<FaTrash />}
                                      bg="white"
                                      color="red.500"
                                      border="1px"
                                      borderColor="red.500"
                                      _hover={{ bg: "red.500", color: "white" }}
                                      size="xs"
                                      onClick={() => handleDeleteProduct(prod)}
                                    />
                                  </Flex>
                                </Td>
                              </Tr>
                            );
                          })
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={6}>
                              <Text fontSize="xs">
                                {products.length === 0
                                  ? "No products found."
                                  : "No products match your search."}
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  )}
                </Box>

                {/* Mobile Card View */}
                <Box
                  display={{ base: "block", md: "none" }}
                  overflow="auto"
                  px={3}
                  py={2}
                  css={globalScrollbarStyles}
                >
                  {currentView === "categories" && (
                    currentCategories.length > 0 ? (
                      currentCategories.map((cat, idx) => (
                        <CategoryMobileCard
                          key={cat._id || idx}
                          cat={cat}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          onView={handleViewCategory}
                          onEdit={handleEditCategory}
                          onDelete={handleDeleteCategory}
                          onAddProduct={handleAddProductToCategory}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={MdCategory} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No categories found</Text>
                        </VStack>
                      </Center>
                    )
                  )}

                  {currentView === "products" && (
                    currentProducts.length > 0 ? (
                      currentProducts.map((prod, idx) => (
                        <ProductMobileCard
                          key={prod._id || idx}
                          prod={prod}
                          idx={idx}
                          indexOfFirstItem={indexOfFirstItem}
                          onView={handleViewProduct}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          categories={categories}
                        />
                      ))
                    ) : (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={FaBox} color="gray.300" boxSize={10} />
                          <Text fontSize="sm" color="gray.500">No products found</Text>
                        </VStack>
                      </Center>
                    )
                  )}
                </Box>

                {/* Pagination Controls */}
                {(currentView === "categories" ? filteredCategories.length > 0 : filteredProducts.length > 0) && (
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
                            {currentView === "categories" ? totalCategoryPages : totalProductPages}
                          </Text>
                        </Flex>

                        <Button
                          size="sm"
                          onClick={handleNextPage}
                          isDisabled={
                            currentView === "categories"
                              ? currentPage === totalCategoryPages
                              : currentPage === totalProductPages
                          }
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

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={closeModal} size="lg">
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader color="gray.700">
            {viewModalType === "category" ? "Category Details" : "Product Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {viewModalType === "category" && selectedCategory && (
              <VStack spacing={4} align="stretch">
                {(selectedCategory.image || selectedCategory.url) && (
                  <Box borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
                    <Image
                      src={selectedCategory.image || selectedCategory.url}
                      alt={selectedCategory.name || selectedCategory.category}
                      w="100%"
                      h="200px"
                      objectFit="contain"
                      bg="gray.50"
                    />
                  </Box>
                )}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Name</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.category || selectedCategory.name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.description || "No description"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Products in this category</Text>
                  <Text fontSize="md" mt={1}>
                    {products.filter(p => p.category?._id === selectedCategory._id || p.category === selectedCategory._id).length} products
                  </Text>
                </Box>
              </VStack>
            )}

            {viewModalType === "product" && selectedProduct && (
              <VStack spacing={4} align="stretch">
                {/* Image */}
                <Box borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
                  <Image
                    src={
                      selectedProduct.images?.[0]?.url ||
                      selectedProduct.images?.[0] ||
                      selectedProduct.productImages?.[0]?.url ||
                      selectedProduct.productImages?.[0] ||
                      "/placeholder.png"
                    }
                    alt={selectedProduct.name}
                    w="100%"
                    h="200px"
                    objectFit="contain"
                    bg="gray.50"
                  />
                </Box>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Product Name</Text>
                  <Text fontSize="lg" fontWeight="medium" mt={1}>{selectedProduct.productName || selectedProduct.name}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Status</Text>
                    <Badge
                      colorScheme={
                        selectedProduct.status === "Available" ? "green" :
                          selectedProduct.status === "Out of Stock" ? "orange" : "red"
                      }
                      mt={1}
                      px={2}
                      py={1}
                    >
                      {selectedProduct.status || "Available"}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Product Type</Text>
                    <Text fontSize="sm" mt={1}>{selectedProduct.productType || "Hardware"}</Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description</Text>
                  <Text fontSize="sm" mt={1}>{selectedProduct.description || "No description"}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Price Range</Text>
                    <Text fontSize="md" fontWeight="bold" color="green.600">
                      ₹{selectedProduct.estimatedPriceFrom || 0} - ₹{selectedProduct.estimatedPriceTo || 0}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Pricing Model</Text>
                    <Text fontSize="sm" textTransform="capitalize">{selectedProduct.pricingModel || "Fixed"}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Usage Type</Text>
                    <Text fontSize="sm">{selectedProduct.usageType || "Residential"}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Installation</Text>
                    <Text fontSize="sm">{selectedProduct.installationDuration || "N/A"}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">Warranty</Text>
                    <Text fontSize="sm">{selectedProduct.warrantyPeriod || "N/A"}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">AMC</Text>
                    <Text fontSize="sm">
                      {selectedProduct.amcAvailable ? `Yes (₹${selectedProduct.amcPricePerYear}/yr)` : "No"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Site Inspection Required</Text>
                  <Text fontSize="sm">{selectedProduct.siteInspectionRequired ? "Yes" : "No"}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="green.600" fontSize="sm">What's Included</Text>
                    <Box pl={2} mt={1}>
                      {selectedProduct.whatIncluded && selectedProduct.whatIncluded.length > 0 ? (
                        selectedProduct.whatIncluded.map((item, i) => (
                          <Flex key={i} align="center" gap={1} mb={0.5}>
                            <Icon as={FaCheckCircle} color="green.500" boxSize={3} />
                            <Text fontSize="sm">{item}</Text>
                          </Flex>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">Not specified</Text>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="red.600" fontSize="sm">What's Not Included</Text>
                    <Box pl={2} mt={1}>
                      {selectedProduct.whatNotIncluded && selectedProduct.whatNotIncluded.length > 0 ? (
                        selectedProduct.whatNotIncluded.map((item, i) => (
                          <Flex key={i} align="center" gap={1} mb={0.5}>
                            <Icon as={FaTimes} color="red.500" boxSize={3} />
                            <Text fontSize="sm">{item}</Text>
                          </Flex>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">Not specified</Text>
                      )}
                    </Box>
                  </Box>
                </SimpleGrid>

                {/* Additional Images */}
                {(() => {
                  const allImages = [...(selectedProduct.images || []), ...(selectedProduct.productImages || [])];
                  if (allImages.length <= 1) return null;

                  return (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>Additional Images</Text>
                      <SimpleGrid columns={4} spacing={2}>
                        {allImages.slice(1).map((img, index) => (
                          <Box
                            key={img.public_id || index}
                            borderRadius="md"
                            overflow="hidden"
                          >
                            <Image
                              src={img.url || img}
                              alt={`Image ${index + 2}`}
                              w="100%"
                              h="60px"
                              objectFit="cover"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  );
                })()}
              </VStack>
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
                "{itemToDelete?.category || itemToDelete?.name}"
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
                  This category must be empty (no products) before it can be deleted.
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
              Delete {deleteType === "category" ? "Category" : "Product"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}