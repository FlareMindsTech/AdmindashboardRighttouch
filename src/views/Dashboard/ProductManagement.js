//ProductManagement
// Chakra imports
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
  deleteProductImage,
  uploadImage,
  uploadImageCategory, 
  removeCategoryImage,
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
} from "@chakra-ui/react";

// Import ApexCharts
import ReactApexChart from 'react-apexcharts';

// Import your custom Card components
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
  const customColor = "#008080"; // Teal
  const customHoverColor = "#006666"; // Darker Teal
  const accentColor = "#FFD700"; // Gold/Yellow
  const customBorderColor = "#F5B700"; // Golden Border


  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalType, setViewModalType] = useState("");
  
  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
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

  // Category doesn't have status field
  const initialCategory = { name: "", description: "", image: "" ,categoryType: "product"};
  
  // Product has status field
  const initialProduct = {
    name: "",
    description: "",
    images: [],
    status: "",
    productType: "Hardware",
    pricingModel: "fixed",
    estimatedPriceFrom: 0,
    estimatedPriceTo: 0,
    siteInspectionRequired: false,
    installationDuration: "",
    usageType: "",
    whatIncluded: [""],
    whatNotIncluded: [""],
    warrantyPeriod: "",
    amcAvailable: true,
    amcPricePerYear: ""
  };
  
  const statusOptions = ["Available", "Out of Stock", "Discontinued"];
  
  const [newCategory, setNewCategory] = useState(initialCategory);
  const [categoryFile, setCategoryFile] = useState("");
  const [newProduct, setNewProduct] = useState(initialProduct);
  
  // Color management states
  const [availableColors, setAvailableColors] = useState([
    'Red', 'Blue', 'Green', 'Black', 'White', 
    'Yellow', 'Pink', 'Gray', 'Maroon', 'Purple'
  ]);
  const [customColorInput, setCustomColorInput] = useState("");

  // Variants management
  const [variants, setVariants] = useState([]);
// Add this state variable
const [imageFiles, setImageFiles] = useState([]);
const [formerImages, setFormerImages] = useState([]);

  const [deletedImageIds, setDeletedImageIds] = useState([]);

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
    // If we are editing a category and it has a saved image, and we haven't just uploaded a new one (which is in categoryFile)
    if (currentView === "editCategory" && selectedCategory && (selectedCategory.image || selectedCategory.url) && !categoryFile) {
        try {
            setIsSubmitting(true);
            await removeCategoryImage(selectedCategory._id);
            
            // Update UI state
            setNewCategory(prev => ({ ...prev, image: "", url: "" }));
            setSelectedCategory(prev => ({ ...prev, image: "", url: "" }));
             // Update local list
            const updatedCategories = categories.map(c => c._id === selectedCategory._id ? { ...c, image: "", url: "" } : c);
            // Assuming setCategories is available, if not we might need to fetch data again
             // But fetchData() is called on update success usually.
             // For immediate UI update:
            // setCategories(updatedCategories); 

            toast({ title: "Image Removed", status: "success", duration: 3000, isClosable: true });
        } catch(e) {
             toast({ title: "Error Removing Image", description: e.message, status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    } else {
        // Just clear the preview if it's a new file upload or in add mode
        setCategoryFile(null);
        setNewCategory(prev => ({ ...prev, image: "" }));
    }
  };

// Update your handleImageUpload function
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  
  // Store the actual File objects
  setImageFiles(prev => [...prev, ...files]);
  
  // Also create preview URLs for display
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

// Updated handleRemoveImage to track deleted server images
const handleRemoveImage = (indexOrId) => {
  // Local state cleanup
  if (typeof indexOrId === 'number') {
    // This looks like an index for a newly uploaded file (client-side only)
    setImageFiles(prev => prev.filter((_, i) => i !== indexOrId));
    setNewProduct(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== indexOrId)
    }));
  } else {
    // This is a public_id string from the server
    
    // Add to deletion queue
    setDeletedImageIds(prev => [...prev, indexOrId]);

    setImageFiles(prev => prev.filter(file => !(file.public_id && file.public_id === indexOrId)));
    setNewProduct(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => !(img.public_id && img.public_id === indexOrId))
    }));
  }
};
  // Calculate pagination
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

  // Function to calculate available stock for a product
  const calculateAvailableStock = useCallback((product) => {
    if (!product || !orders.length) {
      const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
      return totalStock;
    }

    const totalOrderedQuantity = orders.reduce((total, order) => {
      const validStatus = order.status && 
        (order.status.toLowerCase() === 'confirmed' || 
         order.status.toLowerCase() === 'completed' || 
         order.status.toLowerCase() === 'delivered' ||
         order.status.toLowerCase() === 'pending');

      if (!validStatus) return total;

      let orderedQty = 0;
      const items = order.items || order.orderItems || order.products || order.orderProducts || [];
      
      items.forEach(item => {
        const itemProductId = item.productId?._id || item.productId || item.product?._id || item.product;
        const itemName = item.name || item.productId?.name || item.product?.name || item.productName || item.productId?.productName || item.product?.productName;
        
        if (itemProductId === product._id || itemName === product.name) {
          orderedQty += item.quantity || item.qty || 0;
        }
      });

      return total + orderedQty;
    }, 0);

    const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
    const availableStock = Math.max(0, totalStock - totalOrderedQuantity);

    return availableStock;
  }, [orders]);

  // Function to get low stock products
  const getLowStockProducts = useCallback(() => {
    return products.filter(product => {
      const availableStock = calculateAvailableStock(product);
      return availableStock <= 10 && availableStock > 0;
    });
  }, [products, calculateAvailableStock]);

  // Function to get out of stock products
  const getOutOfStockProducts = useCallback(() => {
    return products.filter(product => {
      const availableStock = calculateAvailableStock(product);
      return availableStock <= 0;
    });
  }, [products, calculateAvailableStock]);

  // Function to get in stock products
  const getInStockProducts = useCallback(() => {
    return products.filter(product => {
      const availableStock = calculateAvailableStock(product);
      return availableStock > 10;
    });
  }, [products, calculateAvailableStock]);

  // Calculate total available stock across all products
  const calculateTotalAvailableStock = useCallback(() => {
    return products.reduce((total, product) => {
      return total + calculateAvailableStock(product);
    }, 0);
  }, [products, calculateAvailableStock]);

  // Prepare stock chart data
  const prepareStockChartData = useCallback(() => {
    const stockProducts = [...products]
      .filter(product => {
        const availableStock = calculateAvailableStock(product);
        return availableStock > 0; 
      })
      .sort((a, b) => {
        const stockA = calculateAvailableStock(a);
        const stockB = calculateAvailableStock(b);
        return stockB - stockA;
      })
      .slice(0, 10); 
    const categories = stockProducts.map(product => 
      product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name
    );
    
    const availableStockData = stockProducts.map(product => calculateAvailableStock(product));
    const totalStockData = stockProducts.map(product => 
      product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0
    );

    return {
      series: [
        {
          name: 'Available Stock',
          data: availableStockData,
          color: customColor
        },
        {
          name: 'Total Stock',
          data: totalStockData,
          color: accentColor
        }
      ],
      options: {
        chart: {
          type: 'line',
          height: 350,
          toolbar: {
            show: true
          }
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 5
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              colors: textColor,
              fontSize: '12px'
            },
            rotate: -45
          }
        },
        yaxis: {
          title: {
            text: 'Stock Quantity',
            style: {
              color: textColor
            }
          },
          labels: {
            style: {
              colors: textColor
            }
          }
        },
        title: {
          text: 'Available vs Total Stock by Product',
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: textColor
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'center',
          labels: {
            colors: textColor
          }
        },
        grid: {
          borderColor: useColorModeValue('#e0e0e0', '#424242')
        },
        tooltip: {
          theme: useColorModeValue('light', 'dark')
        }
      }
    };
  }, [products, calculateAvailableStock, textColor]);

  // Prepare stock alert chart data
  const prepareStockAlertChartData = useCallback(() => {
    const alertProducts = [...getOutOfStockProducts(), ...getLowStockProducts()]
      .slice(0, 10);

    const categories = alertProducts.map(product => 
      product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name
    );
    
    const availableStockData = alertProducts.map(product => calculateAvailableStock(product));
    const totalStockData = alertProducts.map(product => 
      product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0
    );

    return {
      series: [
        {
          name: 'Available Stock',
          data: availableStockData,
          color: '#FF6B6B'
        },
        {
          name: 'Total Stock',
          data: totalStockData,
          color: accentColor
        }
      ],
      options: {
        chart: {
          type: 'line',
          height: 350,
          toolbar: {
            show: true
          }
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 5
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              colors: textColor,
              fontSize: '12px'
            },
            rotate: -45
          }
        },
        yaxis: {
          title: {
            text: 'Stock Quantity',
            style: {
              color: textColor
            }
          },
          labels: {
            style: {
              colors: textColor
            }
          }
        },
        title: {
          text: 'Stock Alerts - Low and Out of Stock Products',
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: textColor
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'center',
          labels: {
            colors: textColor
          }
        },
        grid: {
          borderColor: useColorModeValue('#e0e0e0', '#424242')
        },
        tooltip: {
          theme: useColorModeValue('light', 'dark')
        }
      }
    };
  }, [getOutOfStockProducts, getLowStockProducts, calculateAvailableStock, textColor]);

  // Search handler functions
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
  // Color management functions
  const handleAddCustomColor = () => {
    const color = customColorInput.trim();
    
    if (!color) {
      toast({
        title: "Empty Color",
        description: "Please enter a color name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (availableColors.includes(color)) {
      toast({
        title: "Color Exists",
        description: `Color "${color}" already exists in the list`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setAvailableColors(prev => [...prev, color]);
    setCustomColorInput("");
    
    toast({
      title: "Color Added",
      description: `Color "${color}" added successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRemoveColor = (colorToRemove) => {
    // Don't allow removal if it's used in any variant
    const isColorUsed = variants.some(variant => variant.color === colorToRemove);
    if (isColorUsed) {
      toast({
        title: "Cannot Remove",
        description: `Color "${colorToRemove}" is currently used in variants. Please remove or change variants first.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setAvailableColors(prev => prev.filter(color => color !== colorToRemove));
    
    toast({
      title: "Color Removed",
      description: `Color "${colorToRemove}" removed from available colors`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Variant management functions
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { 
        color: '', 
        size: '', 
        price: '', 
        stock: '', 
        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
      }
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one variant is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    
    // Auto-generate SKU if color and size are set
    if ((field === 'color' || field === 'size') && updatedVariants[index].color && updatedVariants[index].size) {
      const colorCode = updatedVariants[index].color.substring(0, 3).toUpperCase();
      const sizeCode = updatedVariants[index].size.toUpperCase();
      updatedVariants[index].sku = `SKU-${colorCode}-${sizeCode}-${Date.now().toString().slice(-6)}`;
    }
    
    setVariants(updatedVariants);
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

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // View handlers for category and product
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

  // Fetch categories + products + orders
  // const fetchData = useCallback(async () => {
  //   try {
  //     setIsLoadingData(true);
  //     setIsLoadingCategories(true);
  //     setIsLoadingProducts(true);
  //     setIsLoadingOrders(true);

  //     const [categoryData, productData, ordersData] = await Promise.all([
  //       getAllCategories(),
  //       getAllProducts(),
  //       getAllOrders()
  //     ]);

  //     setCategories(categoryData.categories || categoryData.data || []);
  //     setProducts(productData.products || productData.data || []);
      
  //     let ordersArray = [];
  //     if (Array.isArray(ordersData)) {
  //       ordersArray = ordersData;
  //     } else if (ordersData && Array.isArray(ordersData.orders)) {
  //       ordersArray = ordersData.orders;
  //     } else if (ordersData && Array.isArray(ordersData.data)) {
  //       ordersArray = ordersData.data;
  //     } else {
  //       const maybeArray = Object.values(ordersData || {}).find((v) => Array.isArray(v));
  //       if (Array.isArray(maybeArray)) {
  //         ordersArray = maybeArray;
  //       }
  //     }
  //     setOrders(ordersArray);
      
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //     toast({
  //       title: "Fetch Error",
  //       description: err.message || "Failed to load dashboard data.",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsLoadingData(false);
  //     setIsLoadingCategories(false);
  //     setIsLoadingProducts(false);
  //     setIsLoadingOrders(false);
  //   }
  // }, [toast]);
const fetchData = useCallback(async () => {
  try {
    setIsLoadingData(true);
    setIsLoadingCategories(true);
    setIsLoadingProducts(true);
    setIsLoadingOrders(true);

    const [categoryData, productData] = await Promise.all([
      getAllCategories(),
      getAllProducts()
    ]);

    console.log("Raw category data:", categoryData); // Add this
    
    // Handle different possible response structures
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
      // Handle { success: true, result: [...] } format
      categoriesArray = categoryData.result;
    } else if (categoryData?.result?.categories) {
      // Handle { success: true, result: { categories: [...] } } format
      categoriesArray = categoryData.result.categories;
    } else {
      // Try to extract any array from the response
      const maybeArray = Object.values(categoryData || {}).find((v) => Array.isArray(v));
      if (Array.isArray(maybeArray)) {
        categoriesArray = maybeArray;
      }
    }

    console.log("Processed categories:", categoriesArray); // Add this
    
    setCategories(categoriesArray);
    
    // Rest of your existing code...
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
    
    // Normalize products to ensure name property exists
    const normalizedProducts = productsArray.map(product => ({
      ...product,
      name: product.name || product.productName || "Unnamed Product"
    }));
    
    setProducts(normalizedProducts);
    
    // ... rest of orders handling
    
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
    // setIsLoadingOrders(false);
  }
}, [toast]);
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Reset pagination when view changes
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
    setCustomColorInput("");
    setVariants([]);
    setCategoryFile(null);
  };

  // Reset form
  const handleResetCategory = () => {
    setNewCategory(initialCategory);
    setCategoryFile(null);
  };
  const handleResetProduct = () => {
    setNewProduct(initialProduct);
    setCustomColorInput("");
    setVariants([]);
  };

  // Category Submit
  // const handleSubmitCategory = async () => {
  //   if (!newCategory.name.trim()) {
  //     return toast({
  //       title: "Validation Error",
  //       description: "Category name is required.",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  //   if (!newCategory.description.trim()) {
  //     return toast({
  //       title: "Validation Error",
  //       description: "Category description is required.",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  //   if (!newCategory.image) {
  //     return toast({
  //       title: "Validation Error",
  //       description: "Category image is required.",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  //   try {
  //     setIsSubmitting(true);
  //     // Create a copy without the blob URL and map 'name' to 'category' for submission
  //     const categoryData = { 
  //       category: newCategory.name, 
  //       description: newCategory.description,
  //       categoryType: newCategory.categoryType,
  //       image: "" 
  //     };
  //     const data = await createCategories(categoryData);
  //     // Enhanced ID extraction
  //     const categoryId = data._id || data.category?._id || data.data?._id || data.data?.category?._id;

  //     if (categoryFile && categoryId) {
  //       try {
  //         await uploadImageCategory(categoryId, categoryFile);
  //       } catch (uploadError) {
  //         console.error("Image upload failed:", uploadError);
  //         toast({
  //           title: "Warning",
  //           description: "Category created, but image upload failed.",
  //           status: "warning",
  //           duration: 5000,
  //           isClosable: true,
  //         });
  //       }
  //     }

  //     toast({
  //       title: "Category Created",
  //       description: `"${data.category?.name || data.data?.name || data.name}" added successfully.`,
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     await fetchData();
  //     handleBack();
  //     setCategoryFile(null);
  //   } catch (err) {
  //     toast({
  //       title: "Error Creating Category",
  //       description: err.message || "Failed to create category",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
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

    // 1️⃣ CREATE CATEGORY (WITHOUT IMAGE)
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
      resData.result?._id; // ✅ Added support for 'result' key based on console output

    if (!categoryId) {
      console.error("No category ID found in response structure:", resData);
      throw new Error(`Category created but ID was not found in response. Received: ${JSON.stringify(resData)}`);
    }

    // 2️⃣ UPLOAD IMAGE
    await uploadImageCategory(categoryId, categoryFile);

    toast({
      title: "Category Created",
      description: `"${resData.category?.category || resData.category || categoryData.category}" added successfully.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setNewCategory(initialCategory);
    setCategoryFile("");
    fetchData();
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
      
      const response = await updateCategories(selectedCategory._id, updateData);
      
      // Handle image upload if a new file was selected
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

  // Delete Category Handler
  const handleDeleteCategory = async (category) => {
    setItemToDelete(category);
    setDeleteType("category");
    setIsDeleteModalOpen(true);
  };

  // Delete Product Handler
  const handleDeleteProduct = async (product) => {
    setItemToDelete(product);
    setDeleteType("product");
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Handler
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
          description: `"${itemToDelete.name}" has been deleted successfully.`,
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

  // Close Delete Modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteType("");
    setIsDeleting(false);
  };

 // Product Submit (Add/Edit) - Updated for new API format
const handleSubmitProduct = async () => {
  if (!newProduct.name) {
    return toast({
      title: "Validation Error",
      description: "Product name is required.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
  

  // Enhanced validation
  if (!newProduct.name || !newProduct.name.trim()) {
    return toast({
      title: "Validation Error",
      description: "Product name is required.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }

  // Determine the Category ID for the payload - Ensure it's ALWAYS a non-empty string
  let finalCategoryId = 
    getSafeId(selectedCategory) || 
    getSafeId(newProduct.categoryId) ||
    getSafeId(newProduct.category) ||
    getSafeId(selectedProduct?.category) || 
    getSafeId(selectedProduct?.categoryId) ||
    getSafeId(selectedProduct?.category?._id) ||
    getSafeId(selectedProduct?.categoryId?._id);

  // Debugging: If we still don't have it, try every possible path
  if (!finalCategoryId && selectedProduct) {
    const possibleFieldNames = ['category', 'categoryId', 'category_id', 'CategoryId'];
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

  // Price validation - only alert if completely empty
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

    // Prepare product data according to new API format
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

    // Only add categoryId if it exists to avoid null errors on update
    if (finalCategoryId) {
      productData.categoryId = finalCategoryId;
    }

    // Only add variants if they exist to avoid empty array validation issues
    if (variants && variants.length > 0) {
      productData.variants = variants;
    }

    console.log("Sending product data:", productData);

    let response;
    if (selectedProduct) {
      if (!selectedProduct._id) {
        throw new Error("Cannot update: Product ID is missing.");
      }
      // For editing - update product
      response = await updateProducts(selectedProduct._id, productData);
      
      // Handle deleted images
      if (deletedImageIds.length > 0) {
        await Promise.all(
          deletedImageIds.map((publicId) => 
            deleteProductImage(selectedProduct._id, publicId)
          )
        );
        setDeletedImageIds([]); // Clear after processing
      }

      // Handle image uploads for existing product
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
      // For new product - create first, then upload images
      response = await createProducts(productData);
      
      // Get the created product ID - Support data, result, or direct ID
      const createdProductId = 
        response.result?._id || 
        response.data?._id || 
        response._id || 
        response.productId ||
        response.result?.productId;
      
      console.log("Submit product response:", response);
      
      // Handle image uploads for new product
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

    // Reset local image files state after successful submission
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
  // Edit Product handler
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    // Simplified category detection - trust the ID from the product
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
    setFormerImages(existingImages);
    
    // Set variants from product data
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
      whatIncluded: Array.isArray(product.whatIncluded) ? product.whatIncluded : ["Product", "Installation"],
      whatNotIncluded: Array.isArray(product.whatNotIncluded) ? product.whatNotIncluded : ["Plumbing work"],
      warrantyPeriod: product.warrantyPeriod || "2 years",
      amcAvailable: !!product.amcAvailable,
      amcPricePerYear: product.amcPricePerYear || 0,
      categoryId: catId // Store the ID here too
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

  // Edit Category handler - No status field
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

  // Stock status badge component
  const StockStatusBadge = ({ product }) => {
    const availableStock = calculateAvailableStock(product);
    const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
    
    if (availableStock <= 0) {
      return (
        <Badge colorScheme="red" fontSize="xs" px={2} py={1}>
          <Flex align="center" gap={1}>
            <FaExclamationTriangle size={10} />
            Out of Stock
          </Flex>
        </Badge>
      );
    } else if (availableStock <= 10) {
      return (
        <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>
          <Flex align="center" gap={1}>
            <MdWarning size={12} />
            Low Stock ({availableStock})
          </Flex>
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
          In Stock ({availableStock})
        </Badge>
      );
    }
  };

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

  // Prepare chart data
  const stockChartData = prepareStockChartData();
  const stockAlertChartData = prepareStockAlertChartData();

  // Render Form Views (Add/Edit Category/Product)
  if (currentView === "addCategory" || currentView === "editCategory" || currentView === "addProduct") {
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
                {currentView === "addProduct" && (selectedProduct ? "Edit Product" : "Add New Product")}
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody 
            bg="white" 
            flex="1" 
            overflow="auto"
            css={globalScrollbarStyles}
          >
            {/* Category Form - NO STATUS FIELD */}
            {(currentView === "addCategory" || currentView === "editCategory") && (
              <Box p={4}>
                <FormControl mb="20px">
                  <FormLabel htmlFor="name" color="gray.700" fontSize="sm">Name *</FormLabel>
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
                    rows={2}
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

            {/* Product Form - WITH STATUS FIELD */}
            {currentView === "addProduct" && (
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
                  overflowY="visible"
                  pr={2}
                >
                  <Box p={4}>
                    {/* Category Selection - Always visible */}
                    <FormControl mb="20px">
                        <FormLabel htmlFor="category" color="gray.700" fontSize="sm">Category *</FormLabel>
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
                        <FormLabel color="gray.700" fontSize="sm">Product Name *</FormLabel>
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
                    </Grid>

                    <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Estimated Price From (₹) *</FormLabel>
                        <Input
                          type="number"
                          value={newProduct.estimatedPriceFrom}
                          onChange={(e) => setNewProduct({ ...newProduct, estimatedPriceFrom: e.target.value })}
                          placeholder="2500"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontSize="sm">Estimated Price To (₹) *</FormLabel>
                        <Input
                          type="number"
                          value={newProduct.estimatedPriceTo}
                          onChange={(e) => setNewProduct({ ...newProduct, estimatedPriceTo: e.target.value })}
                          placeholder="3500"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          size="sm"
                        />
                      </FormControl>
                    </Grid>

                    {/* New Product Fields according to API structure */}
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
                        <FormLabel color="gray.700" fontSize="sm">What's Included (One per line)</FormLabel>
                        <Textarea
                          value={newProduct.whatIncluded.join('\n')}
                          onChange={(e) => setNewProduct({ ...newProduct, whatIncluded: e.target.value.split('\n') })}
                          placeholder="Item 1&#10;Item 2"
                          size="sm"
                          borderColor={`${customColor}50`}
                          _hover={{ borderColor: customColor }}
                          _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                          bg="white"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm">What's Not Included (One per line)</FormLabel>
                        <Textarea
                          value={newProduct.whatNotIncluded.join('\n')}
                          onChange={(e) => setNewProduct({ ...newProduct, whatNotIncluded: e.target.value.split('\n') })}
                          placeholder="Item 1&#10;Item 2"
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

                    {/* Image Upload Section */}
                    <FormControl mb="20px">
                      <FormLabel color="gray.700" fontSize="sm">Product Images</FormLabel>
                      <Flex direction="column" gap={3}>
                        {newProduct.images && newProduct.images.length > 0 && (
                          <Flex wrap="wrap" gap={3}>
                            {newProduct.images.map((img, index) => (
                              <Box 
                                key={img.public_id || index} 
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
                                  onClick={() => handleRemoveImage(img.public_id || index)}
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
                                  Click to upload product images (Multiple supported)
                                </Text>
                              </Flex>
                            </>
                          )}
                        </Box>
                      </Flex>
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
                      onClick={handleResetProduct}
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
                      onClick={handleSubmitProduct}
                      isLoading={isSubmitting}
                      isDisabled={isSubmitting}
                      size="sm"
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
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr" }}
          gap={{ base: "10px", md: "15px" }} 
          mb={{ base: "15px", md: "20px" }}
        >
          {/* All Categories Card */}
          <Card
            minH={{ base: "65px", md: "75px" }} 
            cursor="pointer"
            onClick={() => setCurrentView("categories")}
            border={currentView === "categories" ? "2px solid" : "1px solid"}
            borderColor={customBorderColor}
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

          {/* All Products Card */}
          <Card
            minH={{ base: "65px", md: "75px" }}
            cursor="pointer"
            onClick={() => setCurrentView("products")}
            border={currentView === "products" ? "2px solid" : "1px solid"}
            borderColor={customBorderColor}
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
                    All Products
                  </StatLabel>
                  <Flex>
                    <StatNumber fontSize={{ base: "sm", md: "md" }} color={textColor}> 
                      {isLoadingProducts ? <Spinner size="xs" /> : products.length}
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

          {/* Available Stock Card Hidden */}
          {/* <Card ... /> */}

          {/* Stock Alerts Card Hidden */}
          {/* <Card ... /> */}
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
          border="1px solid"
          borderColor={customBorderColor}
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
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
              {/* Title */}
              <Heading size="sm" flexShrink={0} color="gray.700">
                {currentView === "categories" && "🏷️ Categories"}
                {currentView === "products" && "🛒 Products"}
                {currentView === "stockAnalysis" && "📊 Stock Analysis"}
                {currentView === "stockAlerts" && "⚠️ Stock Alerts"}
              </Heading>

              {/* Search Bar - Only show for categories and products */}
              {(currentView === "categories" || currentView === "products") && (
                <Flex align="center" flex="1" maxW="350px" minW="200px">
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
              )}

              {/* Add Button - Only show for categories and products */}
              {(currentView === "categories" || currentView === "products") && (
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
                      setVariants([{ 
                        color: '', 
                        size: '', 
                        price: '', 
                        stock: '', 
                        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
                      }]);
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
                      {/* Scrollable Table Area */}
                      <Box
                        flex="1"
                        overflow="auto"
                        css={globalScrollbarStyles}
                      >
                        <Table variant="simple" size="md" bg="transparent">
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
                                fontSize="sm"
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
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Name
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
                                Add Product
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
                                px={14}
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
                                  borderColor={`${customColor}30`}
                                  height="60px"
                                >
                                  <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                    {indexOfFirstItem + idx + 1}
                                  </Td>
                                  <Td borderColor={`${customColor}30`} fontWeight="medium" fontSize="sm" py={3}>
                                    {cat.category || cat.name}
                                  </Td>
                                  <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                    <Text noOfLines={1} maxW="200px">
                                      {cat.description || "-"}
                                    </Text>
                                  </Td>
                                  <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                    <Badge
                                      bg="#dffff9ff"
                                      color="#008080"
                                      px={3}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="sm"
                                      fontWeight="bold"
                                    >
                                      {cat.status || "Active"}
                                    </Badge>
                                  </Td>
                                 
                                  <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
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
                                 
                                  <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                    <Flex gap={2}>
                                      <IconButton
                                        aria-label="View category"
                                        icon={<FaEye />}
                                        bg="white"
                                        color="blue.500"
                                        border="1px"
                                        borderColor="blue.500"
                                        _hover={{ bg: "blue.500", color: "white" }}
                                        size="sm"
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
                                        size="sm"
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
                                        size="sm"
                                        onClick={() => handleDeleteCategory(cat)}
                                      />
                                    </Flex>
                                  </Td>
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={6} textAlign="center" py={6}>
                                  <Text fontSize="sm">
                                    {categories.length === 0
                                      ? "No categories found. Click 'Add Category' to create one."
                                      : categorySearch
                                      ? "No categories match your search."
                                      : "No categories available."}
                                  </Text>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>

                    {/* Pagination Controls */}
                    {filteredCategories.length > 0 && (
                      <Box 
                        flexShrink={0}
                        p="16px"
                        borderTop="1px solid"
                        borderColor={`${customColor}30`}
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

                {/* Products Table */}
                {currentView === "products" && (
                  <>
                    {/* Table Container */}
                    <Box 
                      flex="1"
                      display="flex"
                      flexDirection="column"
                      overflow="hidden"
                    >
                      {/* Scrollable Table Area */}
                      <Box
                        flex="1"
                        overflow="auto"
                        css={globalScrollbarStyles}
                      >
                        <Table variant="simple" size="md" bg="transparent">
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
                                fontSize="sm"
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
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Name
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
                                fontSize="sm"
                                py={3}
                                borderBottom="2px solid"
                                borderBottomColor={`${customColor}50`}
                              >
                                Price Range
                              </Th>
                              {/* Stock Status Hidden */}
                              {/* <Th ... >Stock Status</Th> */}
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

                          {/* Scrollable Body */}
                          <Tbody bg="transparent">
                            {currentProducts.length > 0 ? (
                              currentProducts.map((prod, idx) => {
                                const availableStock = calculateAvailableStock(prod);
                                const totalStock = prod.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
                                
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
                                    borderColor={`${customColor}30`}
                                    height="60px"
                                  >
                                    <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                      {indexOfFirstItem + idx + 1}
                                    </Td>
                                    <Td borderColor={`${customColor}30`} fontWeight="medium" fontSize="sm" py={3}>
                                      <Text noOfLines={1} maxW="150px">
                                        {prod.name}
                                      </Text>
                                    </Td>
                                      <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                        <Flex align="center" gap={2}>
                                          {(() => {
                                            // Extract Category Object and ID
                                            const categoryData = prod.categoryId || prod.category;
                                            const isObject = typeof categoryData === 'object' && categoryData !== null;
                                            
                                            const catId = isObject ? categoryData._id : categoryData;
                                            
                                            // Find in categories list OR use embedded object
                                            const catObj = categories.find(c => c._id === catId) || (isObject ? categoryData : null);
                                            
                                            const catName = catObj?.category || catObj?.name || "N/A";
                                            const catImage = catObj?.image;

                                            return (
                                              <>
                                                {catImage && (
                                                  <Box w="24px" h="24px" borderRadius="full" overflow="hidden" flexShrink={0}>
                                                    <Image 
                                                      src={catImage} 
                                                      w="100%" 
                                                      h="100%" 
                                                      objectFit="cover"
                                                      fallbackSrc="/placeholder.png"
                                                    />
                                                  </Box>
                                                )}
                                                <Badge
                                                  bg={`${customColor}10`}
                                                  color={customColor}
                                                  px={2}
                                                  py={0.5}
                                                  borderRadius="md"
                                                  fontSize="xs"
                                                  fontWeight="medium"
                                                >
                                                  {catName}
                                                </Badge>
                                              </>
                                            );
                                          })()}
                                        </Flex>
                                      </Td>
                                    <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                      {priceRange}
                                    </Td>
                                    {/* Stock Status Hidden */}
                                    {/* <Td ... >...</Td> */}
                                    <Td borderColor={`${customColor}30`} fontSize="sm" py={3}>
                                      <Flex gap={2}>
                                        <IconButton
                                          aria-label="View product"
                                          icon={<FaEye />}
                                          bg="white"
                                          color="blue.500"
                                          border="1px"
                                          borderColor="blue.500"
                                          _hover={{ bg: "blue.500", color: "white" }}
                                          size="sm"
                                          onClick={() => handleViewProduct(prod)}
                                        />
                                        <IconButton
                                          aria-label="Edit product"
                                          icon={<FaEdit />}
                                          bg="white"
                                          color={customColor}
                                          border="1px"
                                          borderColor={customColor}
                                          _hover={{ bg: customColor, color: "white" }}
                                          size="sm"
                                          onClick={() => handleEditProduct(prod)}
                                        />
                                        <IconButton
                                          aria-label="Delete product"
                                          icon={<FaTrash />}
                                          bg="white"
                                          color="red.500"
                                          border="1px"
                                          borderColor="red.500"
                                          _hover={{ bg: "red.500", color: "white" }}
                                          size="sm"
                                          onClick={() => handleDeleteProduct(prod)}
                                        />
                                      </Flex>
                                    </Td>
                                  </Tr>
                                );
                              })
                            ) : (
                              <Tr>
                                <Td colSpan={5} textAlign="center" py={6}>
                                  <Text fontSize="sm">
                                    {products.length === 0
                                      ? "No products found. Click 'Add Product' to create one."
                                      : productSearch
                                      ? "No products match your search."
                                      : "No products available."}
                                  </Text>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>

                    {/* Pagination Controls */}
                    {filteredProducts.length > 0 && (
                      <Box 
                        flexShrink={0}
                        p="16px"
                        borderTop="1px solid"
                        borderColor={`${customColor}30`}
                        bg="transparent"
                      >
                        <Flex
                          justify="flex-end"
                          align="center"
                          gap={3}
                        >
                          {/* Page Info */}
                          <Text fontSize="sm" color="gray.600" display={{ base: "none", sm: "block" }}>
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
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
                                {totalProductPages}
                              </Text>
                            </Flex>

                            <Button
                              size="sm"
                              onClick={handleNextPage}
                              isDisabled={currentPage === totalProductPages}
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

                {/* Stock Analysis View Hidden */}
                {/* currentView === "stockAnalysis" && ... */}

                {/* Stock Alerts View Hidden */}
                {/* currentView === "stockAlerts" && ... */}
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* View Modal for Category and Product Details */}
      <Modal isOpen={isViewModalOpen} onClose={closeModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="gray.700">
            {viewModalType === "category" ? "Category Details" : "Product Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewModalType === "category" && selectedCategory && (
              <SimpleGrid columns={1} spacing={4}>
                 {(selectedCategory.image || selectedCategory.url) && (
                   <Box mb={4} borderRadius="xl" overflow="hidden" height="200px" border="1px" borderColor="gray.200">
                      <Image 
                        src={selectedCategory.image || selectedCategory.url} 
                        alt={selectedCategory.name || selectedCategory.category} 
                        w="100%" 
                        h="100%" 
                        objectFit="contain" 
                        bg="gray.50"
                      />
                   </Box>
                )}
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Name:</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.category || selectedCategory.name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Description:</Text>
                  <Text fontSize="md" mt={1}>{selectedCategory.description || "No description"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">Products in this category:</Text>
                  <Text fontSize="md" mt={1}>
                    {products.filter(p => p.category?._id === selectedCategory._id || p.category === selectedCategory._id).length} products
                  </Text>
                </Box>
              </SimpleGrid>
            )}

            {viewModalType === "product" && selectedProduct && (
              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="xl"
                boxShadow="lg"
                p={5}
                w="100%"
                maxW="480px"
                mx="auto"
              >
                {/* Square Layout with Image and Details Side by Side */}
                <Flex gap={4} mb={4}>
                  {/* Left Side - Image */}
                  <Box
                    w="140px"
                    h="140px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.100"
                    flexShrink={0}
                  >
                    <Image
                      src={
                        selectedProduct.images?.[0]?.url ||
                        selectedProduct.images?.[0] ||
                        selectedProduct.productImages?.[0]?.url ||
                        selectedProduct.productImages?.[0] ||
                        "/placeholder.png"
                      }
                      alt="product"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>

                  {/* Right Side - Details Grid */}
                  <Box flex="1">
                    <Text fontSize="lg" fontWeight="bold" mb={1} noOfLines={2}>
                      {selectedProduct.productName || selectedProduct.name}
                    </Text>
                    
                    <SimpleGrid columns={1} spacing={2} mt={2}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Category</Text>
                        {(() => {
                          const categoryData = selectedProduct.categoryId || selectedProduct.category;
                          const isObject = typeof categoryData === 'object' && categoryData !== null;
                          const catId = isObject ? categoryData._id : categoryData;
                          const catObj = categories.find(c => c._id === catId) || (isObject ? categoryData : null);
                          
                          return (
                            <Flex align="center" gap={2} mt={1}>
                              {catObj?.image && (
                                <Image 
                                  src={catObj.image} 
                                  w="20px" 
                                  h="20px" 
                                  borderRadius="full" 
                                  objectFit="cover"
                                  fallbackSrc="/placeholder.png"
                                />
                              )}
                              <Text fontSize="sm" fontWeight="medium">
                                {catObj?.category || catObj?.name || "N/A"}
                              </Text>
                            </Flex>
                          );
                        })()}
                      </Box>
                      
                      <Box>
                        <Text fontSize="xs" color="gray.500">Status</Text>
                        <Flex gap={2} mt={1}>
                          <Badge
                            colorScheme={
                              selectedProduct.status === "Available" ? "green" : 
                              selectedProduct.status === "Out of Stock" ? "orange" : "red"
                            }
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {selectedProduct.status || "Available"}
                          </Badge>
                          {selectedProduct.isActive !== undefined && (
                            <Badge colorScheme={selectedProduct.isActive ? "teal" : "gray"} fontSize="xs" px={2} py={1}>
                              {selectedProduct.isActive ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Flex>

                {/* Product Specification Grid */}
                <Box mb={4}>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={2}>Specifications</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                      <Text fontSize="xs" color="gray.500">Product Type</Text>
                      <Text fontSize="sm" fontWeight="medium">{selectedProduct.productType || "Hardware"}</Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                      <Text fontSize="xs" color="gray.500">Pricing Model</Text>
                      <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">{selectedProduct.pricingModel || "Fixed"}</Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                      <Text fontSize="xs" color="gray.500">Usage Type</Text>
                      <Text fontSize="sm" fontWeight="medium">{selectedProduct.usageType || "Residential"}</Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                      <Text fontSize="xs" color="gray.500">Installation</Text>
                      <Text fontSize="sm" fontWeight="medium">{selectedProduct.installationDuration || "N/A"}</Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                      <Text fontSize="xs" color="gray.500">Warranty</Text>
                      <Text fontSize="sm" fontWeight="medium">{selectedProduct.warrantyPeriod || "N/A"}</Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                      <Text fontSize="xs" color="gray.500">AMC Available</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedProduct.amcAvailable ? `Yes (₹${selectedProduct.amcPricePerYear}/yr)` : "No"}
                      </Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md" colSpan={2}>
                      <Text fontSize="xs" color="gray.500">Estimated Price Range</Text>
                      <Text fontSize="sm" fontWeight="bold" color={customColor}>
                        ₹{selectedProduct.estimatedPriceFrom || "0"} - ₹{selectedProduct.estimatedPriceTo || "0"}
                      </Text>
                    </Box>
                    <Box bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md" colSpan={2}>
                      <Text fontSize="xs" color="gray.500">Site Inspection Required</Text>
                      <Text fontSize="sm" fontWeight="medium">{selectedProduct.siteInspectionRequired ? "Yes" : "No"}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* What's Included / Not Included */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <Box>
                    <Text fontWeight="bold" color="green.600" fontSize="sm" mb={1}>What's Included</Text>
                    <Box fontSize="xs" pl={2}>
                      {selectedProduct.whatIncluded && selectedProduct.whatIncluded.length > 0 ? (
                        selectedProduct.whatIncluded.map((item, i) => (
                          <Flex key={i} align="center" gap={1} mb={0.5}>
                            <Icon as={IoCheckmarkDoneCircleSharp} color="green.500" />
                            <Text>{item}</Text>
                          </Flex>
                        ))
                      ) : <Text color="gray.400">Not specified</Text>}
                    </Box>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="red.600" fontSize="sm" mb={1}>Not Included</Text>
                    <Box fontSize="xs" pl={2}>
                      {selectedProduct.whatNotIncluded && selectedProduct.whatNotIncluded.length > 0 ? (
                        selectedProduct.whatNotIncluded.map((item, i) => (
                          <Flex key={i} align="center" gap={1} mb={0.5}>
                            <Icon as={FaTimes} color="red.500" />
                            <Text>{item}</Text>
                          </Flex>
                        ))
                      ) : <Text color="gray.400">Not specified</Text>}
                    </Box>
                  </Box>
                </SimpleGrid>

                {/* Compliance Certificates */}
                {selectedProduct.complianceCertificates && selectedProduct.complianceCertificates.length > 0 && (
                  <Box mb={4}>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>Certifications</Text>
                    <Flex wrap="wrap" gap={2}>
                      {selectedProduct.complianceCertificates.map((cert, i) => (
                        <Badge key={i} variant="outline" colorScheme="blue" fontSize="2xs">
                          {cert}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Metadata */}
                <SimpleGrid columns={2} spacing={2} mb={4} borderTop="1px" borderColor="gray.100" pt={2}>
                  <Box>
                    <Text fontSize="2xs" color="gray.400">Created At</Text>
                    <Text fontSize="xs">
                      {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : "N/A"}
                    </Text>
                  </Box>
                  
                {/* Description */}
                <Box mb={4}>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>Description</Text>
                  <Text fontSize="sm" lineHeight="1.4" color="gray.700">
                    {selectedProduct.description || "No description available"}
                  </Text>
                </Box>

                </SimpleGrid>

                {/* Images Grid */}
                {(() => {
                  const allImages = [...(selectedProduct.images || []), ...(selectedProduct.productImages || [])];
                  if (allImages.length === 0) return null;
                  
                  return (
                    <Box>
                      <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={2}>All Images ({allImages.length})</Text>
                      <SimpleGrid columns={4} spacing={2}>
                        {allImages.map((img, index) => (
                          <Box
                            key={img.public_id || index}
                            borderRadius="md"
                            overflow="hidden"
                          >
                            <Image
                              src={img.url || img}
                              alt={`Image ${index + 1}`}
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