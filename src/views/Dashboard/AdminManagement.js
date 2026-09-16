// AdminManagement.js - RightTouch Admin Technician Management & Verifications
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
  Skeleton,
  SkeletonCircle,
  HStack,
  VStack,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaUsers,
  FaEdit,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaEye,
  FaUserSlash,
  FaExclamationTriangle,
  FaUserGraduate,
  FaTrash,
  FaIdCard,
  FaUniversity,
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaEllipsisV,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { MdAdminPanelSettings, MdPerson, MdVerified, MdOutlinePending, MdWarning } from "react-icons/md";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  getAllTechnicians,
  updateAdmin,
  createAdmin,
  deleteTechnician,
  getTechnicianKYC,
  getAllKYCRecords,
  verifyKYC,
  verifyBankDetails,
  adminEditKYCDetails,
  adminEditBankDetails,
  getKYCFullPII,
  deleteKYC,
  updateTrainingStatus,
  updateTechnicianStatus,
  clearAuth,
  getAllDistricts,
} from "views/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

// Helper to resolve technician name safely
const getTechnicianName = (tech) => {
  if (!tech) return "Unknown";
  const isDeleted = (str) =>
    str && typeof str === "string" && (str.startsWith("deleted_") || str.includes("example.invalid"));

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
  if (tech.profile?.name) {
    if (isDeleted(tech.profile.name)) return "Deleted Technician";
    return tech.profile.name;
  }
  if (tech.profile?.firstName) {
    const fullName = `${tech.profile.firstName} ${tech.profile.lastName || ""}`.trim();
    if (isDeleted(fullName)) return "Deleted Technician";
    return fullName;
  }
  if (tech.userId && typeof tech.userId === "object") {
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
  if (tech.email) {
    if (isDeleted(tech.email)) return "Deleted Technician";
    return tech.email.split("@")[0];
  }
  return "Unknown";
};

// Helper to resolve technician district safely
const getTechnicianDistrict = (tech) => {
  if (!tech) return "";
  const d =
    tech.district ||
    tech.profile?.district ||
    tech.address?.district ||
    tech.districtName ||
    tech.district_name ||
    tech.city ||
    tech.profile?.city ||
    tech.locality ||
    "";
  if (typeof d === "string") return d.trim();
  if (d && typeof d === "object") return d.name || d.districtName || "";
  return "";
};

const getTechnicianImage = (tech) => {
  return (
    tech?.profileImage ||
    tech?.profile?.profileImage ||
    (typeof tech?.userId === "object" ? tech?.userId?.profileImage : "") ||
    ""
  );
};

const getImageUrl = (urlData) => {
  if (!urlData) return "";
  const url = Array.isArray(urlData) ? urlData[0] : urlData;
  if (typeof url !== "string") return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${process.env.REACT_APP_API_BASE_URL || "https://righttouchservernew-727889857503.asia-south1.run.app"}/${url}`;
};

// Find matching KYC record for a technician
const findKYCRecord = (admin, kycRecords = []) => {
  if (!admin) return null;
  const adminId = String(admin._id || admin.id || admin.userId || "");
  return (kycRecords || []).find((k) => {
    const techId = String(
      k.technicianId?._id ||
      k.technicianId ||
      k.technician?._id ||
      k.technician ||
      k.user?._id ||
      k.user ||
      k.userId?._id ||
      k.userId ||
      k._id ||
      ""
    );
    if (adminId && techId && techId === adminId) return true;
    if (admin.email && k.email && admin.email.toLowerCase() === k.email.toLowerCase()) return true;
    if (admin.phone && k.phone && admin.phone === k.phone) return true;
    return false;
  });
};

const isTechnicianKYCVerified = (admin, kycRecords = []) => {
  if (!admin) return false;
  const kycMatch = findKYCRecord(admin, kycRecords);
  const status = (
    kycMatch?.status ||
    kycMatch?.verificationStatus ||
    admin?.kycStatus ||
    admin?.kycDetails?.status ||
    admin?.kyc?.status ||
    admin?.kyc?.verificationStatus ||
    ""
  ).toLowerCase();

  return (
    status === "approved" ||
    status === "verified" ||
    admin?.kycVerified === true ||
    admin?.isKycVerified === true ||
    admin?.kyc?.isVerified === true ||
    admin?.kycDetails?.verified === true
  );
};

const isTechnicianBankVerified = (admin, kycRecords = []) => {
  if (!admin) return false;
  const kycMatch = findKYCRecord(admin, kycRecords);
  const bankStatus = (
    kycMatch?.bankDetails?.verificationStatus ||
    kycMatch?.bankDetails?.status ||
    admin?.bankDetails?.verificationStatus ||
    admin?.bankDetails?.status ||
    admin?.bankVerificationStatus ||
    admin?.kyc?.bankDetails?.status ||
    ""
  ).toLowerCase();

  return Boolean(
    kycMatch?.bankDetails?.verified === true ||
    kycMatch?.bankVerified === true ||
    bankStatus === "approved" ||
    bankStatus === "verified" ||
    admin?.bankVerified === true ||
    admin?.isBankVerified === true ||
    admin?.bankDetails?.verified === true ||
    admin?.kyc?.bankDetails?.verified === true
  );
};

const isNewTechnician = (admin, kycRecords = []) => {
  if (!admin) return false;
  const isKycVer = isTechnicianKYCVerified(admin, kycRecords);
  const workStatus = admin.workStatus?.toLowerCase() || admin.status?.toLowerCase();
  // New if workStatus is pending/new or training is not completed or not yet approved
  return (
    workStatus === "pending" ||
    workStatus === "new" ||
    (!admin.trainingCompleted && !isKycVer) ||
    (!isKycVer && workStatus !== "approved" && workStatus !== "active" && workStatus !== "inactive" && workStatus !== "suspended")
  );
};

const isActiveTechnician = (admin, kycRecords = []) => {
  if (!admin) return false;
  const workStatus = admin.workStatus?.toLowerCase() || admin.status?.toLowerCase();
  const isKycVer = isTechnicianKYCVerified(admin, kycRecords);
  if (workStatus === "inactive" || workStatus === "suspended") return false;
  return workStatus === "approved" || workStatus === "active" || (admin.trainingCompleted && isKycVer);
};

// Custom IconBox
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

function AdminManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const customColor = "#008080";
  const customHoverColor = "#006666";
  const customBorderColor = "#F5B700";

  const toast = useToast();
  const navigate = useNavigate();

  // Primary data states
  const [adminData, setAdminData] = useState([]);
  const [allKycRecords, setAllKycRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Active View & Filter states: 'all' | 'NewTechnician' | 'Active' | 'KYCVerification' | 'BankVerification'
  const [activeTab, setActiveTab] = useState("all");
  const [subFilter, setSubFilter] = useState("all"); // dropdown filter within view
  const [districtFilter, setDistrictFilter] = useState("all"); // Mandatory District-wise filter
  const [masterDistricts, setMasterDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View state: 'list' | 'add' | 'edit'
  const [currentView, setCurrentView] = useState("list");
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Modals state
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [kycData, setKYCData] = useState(null);
  const [kycLoading, setKYcLoading] = useState(false);
  const [selectedTechForKYC, setSelectedTechForKYC] = useState(null);
  const [rejectionInput, setRejectionInput] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [isUnmaskedPII, setIsUnmaskedPII] = useState(false);
  const [isEditKYCOpen, setIsEditKYCOpen] = useState(false);
  const [kycEditForm, setKycEditForm] = useState({ aadhaarNumber: "", panNumber: "", drivingLicenseNumber: "" });
  const [savingKycEdit, setSavingKycEdit] = useState(false);

  // Bank Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedTechForBank, setSelectedTechForBank] = useState(null);
  const [bankRejectionReason, setBankRejectionReason] = useState("");
  const [showBankRejection, setShowBankRejection] = useState(false);
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [bankEditForm, setBankEditForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
  });
  const [savingBankEdit, setSavingBankEdit] = useState(false);

  // Technician Details Profile Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Delete Alert
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
    role: "admin",
    status: "Active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Check Owner Authorization
  useEffect(() => {
    const userString = localStorage.getItem("user");
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
      if (isMountedRef.current) {
        setCurrentUser(userData);
      }
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/auth/signin");
    }
  }, [toast, navigate]);

  // 2. Fetch Technicians and KYC Data
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    setTableLoading(true);
    try {
      const [adminsResult, kycResult, distResult] = await Promise.allSettled([
        getAllTechnicians(),
        getAllKYCRecords(),
        getAllDistricts(),
      ]);

      if (!isMountedRef.current) return;

      const adminsResponse = adminsResult.status === "fulfilled" ? adminsResult.value : {};
      const kycResponse = kycResult.status === "fulfilled" ? kycResult.value : {};
      const distResponse = distResult.status === "fulfilled" ? distResult.value : {};

      const admins =
        adminsResponse.result ||
        adminsResponse.data?.admins ||
        adminsResponse.data ||
        adminsResponse?.admins ||
        adminsResponse ||
        [];
      const kycRecords = kycResponse.result || kycResponse.data || kycResponse || [];
      const distList = distResponse.result || distResponse.data || distResponse.districts || (Array.isArray(distResponse) ? distResponse : []);

      if (Array.isArray(distList) && isMountedRef.current) {
        setMasterDistricts(distList);
      }
      if (Array.isArray(kycRecords) && isMountedRef.current) {
        setAllKycRecords(kycRecords);
      }
      if (Array.isArray(admins) && isMountedRef.current) {
        const sortedAdmins = admins.sort(
          (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
        );
        setAdminData(sortedAdmins);
      }
      if (isMountedRef.current) {
        setDataLoaded(true);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Error fetching data:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load technician list.";
      if (
        errorMessage.includes("token not found") ||
        errorMessage.includes("Session expired") ||
        errorMessage.includes("401")
      ) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        clearAuth();
        navigate("/auth/signin");
        return;
      }
      setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setTableLoading(false);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Stats calculation
  const totalCount = adminData.length;
  const newTechCount = useMemo(
    () => adminData.filter((a) => isNewTechnician(a, allKycRecords)).length,
    [adminData, allKycRecords]
  );
  const newUnverifiedCount = useMemo(
    () =>
      adminData.filter(
        (a) =>
          isNewTechnician(a, allKycRecords) &&
          (!isTechnicianKYCVerified(a, allKycRecords) || !isTechnicianBankVerified(a, allKycRecords))
      ).length,
    [adminData, allKycRecords]
  );
  const activeTechCount = useMemo(
    () => adminData.filter((a) => isActiveTechnician(a, allKycRecords)).length,
    [adminData, allKycRecords]
  );
  const kycVerifiedCount = useMemo(
    () => adminData.filter((a) => isTechnicianKYCVerified(a, allKycRecords)).length,
    [adminData, allKycRecords]
  );
  const kycUnverifiedCount = useMemo(
    () => adminData.filter((a) => !isTechnicianKYCVerified(a, allKycRecords)).length,
    [adminData, allKycRecords]
  );
  const bankVerifiedCount = useMemo(
    () => adminData.filter((a) => isTechnicianBankVerified(a, allKycRecords)).length,
    [adminData, allKycRecords]
  );
  const bankUnverifiedCount = useMemo(
    () => adminData.filter((a) => !isTechnicianBankVerified(a, allKycRecords)).length,
    [adminData, allKycRecords]
  );

  // Available Districts computation (Presets + Master API Districts + Technicians' assigned Districts)
  const availableDistricts = useMemo(() => {
    const set = new Set();
    const presets = [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
      "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri",
      "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
      "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
      "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur",
      "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Thiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
    ];
    presets.forEach((d) => set.add(d));

    (masterDistricts || []).forEach((d) => {
      const name = typeof d === "string" ? d : (d.name || d.districtName || d.title);
      if (name && name.trim()) {
        const formatted = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
        set.add(formatted);
      }
    });

    (adminData || []).forEach((tech) => {
      const dist = getTechnicianDistrict(tech);
      if (dist && dist.trim()) {
        const formatted = dist.trim().charAt(0).toUpperCase() + dist.trim().slice(1);
        set.add(formatted);
      }
    });

    return Array.from(set).sort();
  }, [adminData, masterDistricts]);

  // Filtered dataset computation
  const filteredData = useMemo(() => {
    let list = [...adminData];

    // 1. Primary Tab Filter
    switch (activeTab) {
      case "NewTechnician":
        list = list.filter((a) => isNewTechnician(a, allKycRecords));
        break;
      case "Active":
        list = list.filter((a) => isActiveTechnician(a, allKycRecords));
        break;
      case "KYCVerification":
        // In KYC verification view, we focus on all technicians and their KYC
        break;
      case "BankVerification":
        // In Bank verification view, focus on technicians with bank records or needing verification
        break;
      case "all":
      default:
        break;
    }

    // 2. Sub-filter Dropdown
    if (subFilter !== "all") {
      switch (subFilter) {
        case "verified":
          if (activeTab === "KYCVerification") {
            list = list.filter((a) => isTechnicianKYCVerified(a, allKycRecords));
          } else if (activeTab === "BankVerification") {
            list = list.filter((a) => isTechnicianBankVerified(a, allKycRecords));
          } else {
            list = list.filter((a) => isTechnicianKYCVerified(a, allKycRecords));
          }
          break;
        case "unverified":
        case "pending":
          if (activeTab === "KYCVerification") {
            list = list.filter((a) => !isTechnicianKYCVerified(a, allKycRecords));
          } else if (activeTab === "BankVerification") {
            list = list.filter((a) => !isTechnicianBankVerified(a, allKycRecords));
          } else {
            list = list.filter((a) => !isTechnicianKYCVerified(a, allKycRecords));
          }
          break;
        case "trainingCompleted":
          list = list.filter((a) => a.trainingCompleted === true);
          break;
        case "trainingPending":
          list = list.filter((a) => !a.trainingCompleted);
          break;
        case "activeStatus":
          list = list.filter((a) => isActiveTechnician(a, allKycRecords));
          break;
        case "suspendedStatus":
          list = list.filter((a) => a.workStatus === "suspended" || a.status === "Inactive");
          break;
        case "onlineNow":
          list = list.filter((a) => a.availability?.isOnline === true);
          break;
        case "rejected":
          list = list.filter((a) => {
            const kycMatch = findKYCRecord(a, allKycRecords);
            return (
              kycMatch?.status?.toLowerCase() === "rejected" ||
              kycMatch?.verificationStatus?.toLowerCase() === "rejected"
            );
          });
          break;
        default:
          break;
      }
    }

    // 3. Mandatory District-wise Filter
    if (districtFilter !== "all" && districtFilter.trim() !== "") {
      const target = districtFilter.toLowerCase();
      list = list.filter((admin) => {
        const dist = getTechnicianDistrict(admin).toLowerCase();
        return dist.includes(target);
      });
    }

    // 4. Search Filter (Name, Email, Spec, City, District, Phone, Aadhaar, PAN, Bank Account Number, IFSC, UPI)
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase().trim();
      const qClean = q.replace(/[\s-]/g, "");
      list = list.filter((admin) => {
        const fullName = getTechnicianName(admin).toLowerCase();
        const email = (admin.email || "").toLowerCase();
        const spec = (admin.specialization || admin.profile?.specialization || "").toLowerCase();
        const city = (admin.city || admin.profile?.city || admin.locality || "").toLowerCase();
        const district = getTechnicianDistrict(admin).toLowerCase();
        const phone = (admin.mobileNumber || admin.phone || "").toString().replace(/[\s-]/g, "");
        const kycMatch = findKYCRecord(admin, allKycRecords);
        const aadhaar = (kycMatch?.aadhaarNumber || "").toString().replace(/[\s-]/g, "");
        const pan = (kycMatch?.panNumber || "").toLowerCase();
        
        // Comprehensive Bank Account Matching
        const bankDetails = kycMatch?.bankDetails || admin.bankDetails || admin.profile?.bankDetails || admin.bankAccount || {};
        const accNo = (bankDetails.accountNumber || admin.bankAccountNumber || admin.accountNumber || "").toString().replace(/[\s-]/g, "");
        const ifsc = (bankDetails.ifscCode || admin.ifscCode || "").toString().toLowerCase();
        const bankName = (bankDetails.bankName || admin.bankName || "").toString().toLowerCase();
        const accHolder = (bankDetails.accountHolderName || "").toString().toLowerCase();
        const upi = (bankDetails.upiId || admin.upiId || "").toString().toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          spec.includes(q) ||
          city.includes(q) ||
          district.includes(q) ||
          phone.includes(qClean) ||
          aadhaar.includes(qClean) ||
          pan.includes(q) ||
          accNo.includes(qClean) ||
          ifsc.includes(q) ||
          bankName.includes(q) ||
          accHolder.includes(q) ||
          upi.includes(q)
        );
      });
    }

    return list;
  }, [adminData, allKycRecords, activeTab, subFilter, districtFilter, searchTerm]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const handleCardClick = (tab) => {
    setActiveTab(tab);
    setSubFilter("all");
    setCurrentPage(1);
  };

  // Training Status Toggle (Gate 1)
  const handleToggleTraining = async (tech, nextStatus) => {
    try {
      setLoading(true);
      await updateTrainingStatus(tech._id, nextStatus);
      toast({
        title: nextStatus ? "Training Approved" : "Training Incomplete",
        description: `Technician ${getTechnicianName(tech)} marked as ${nextStatus ? "Training Completed" : "Training Incomplete"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
      if (selectedTechnician && selectedTechnician._id === tech._id) {
        setSelectedTechnician((prev) => ({ ...prev, trainingCompleted: nextStatus }));
      }
    } catch (err) {
      toast({
        title: "Training Update Error",
        description: err.message || "Failed to update training status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Work Status Toggle
  const handleUpdateWorkStatus = async (tech, workStatus) => {
    try {
      setLoading(true);
      await updateTechnicianStatus({
        technicianId: tech._id,
        workStatus: workStatus,
        trainingCompleted: tech.trainingCompleted ?? true,
      });
      toast({
        title: "Work Status Updated",
        description: `Technician status set to ${workStatus}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchData();
    } catch (err) {
      toast({
        title: "Status Update Error",
        description: err.message || "Failed to update work status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // KYC Review Modal Handlers
  const handleOpenKYCModal = async (tech) => {
    setSelectedTechForKYC(tech);
    setIsKYCModalOpen(true);
    setKYCData(null);
    setKYcLoading(true);
    setIsUnmaskedPII(false);
    setShowRejectionInput(false);
    setRejectionInput("");
    try {
      const response = await getTechnicianKYC(tech._id);
      const fetched = response?.result ?? response?.data ?? response;
      setKYCData(fetched);
    } catch (e) {
      console.error("KYC fetch error:", e);
      toast({
        title: "Notice",
        description: "No uploaded KYC documents found for this technician.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setKYCData(null);
    } finally {
      setKYcLoading(false);
    }
  };

  const handleToggleUnmaskedPII = async () => {
    if (!selectedTechForKYC) return;
    if (isUnmaskedPII) {
      // Re-fetch masked
      handleOpenKYCModal(selectedTechForKYC);
      return;
    }
    setKYcLoading(true);
    try {
      const response = await getKYCFullPII(selectedTechForKYC._id);
      const fetched = response?.result ?? response?.data ?? response;
      setKYCData(fetched);
      setIsUnmaskedPII(true);
      toast({
        title: "Unmasked PII Loaded",
        description: "Full identity numbers are now visible. Access has been logged.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Audit Error",
        description: e.message || "Failed to retrieve unmasked KYC details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setKYcLoading(false);
    }
  };

  const handleVerifyKYCAction = async (status) => {
    if (!selectedTechForKYC) return;
    if (status === "rejected" && (!rejectionInput || rejectionInput.trim() === "")) {
      return toast({
        title: "Rejection Reason Required",
        description: "Please specify why this KYC identity is being rejected.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setKYcLoading(true);
      await verifyKYC({
        technicianId: selectedTechForKYC._id,
        status: status,
        rejectionReason: status === "rejected" ? rejectionInput : null,
      });
      toast({
        title: status === "approved" ? "KYC Approved" : "KYC Rejected",
        description: `Technician identity verification marked as ${status}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsKYCModalOpen(false);
      await fetchData();
    } catch (e) {
      toast({
        title: "Verification Error",
        description: e.message || "Failed to submit KYC verification.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setKYcLoading(false);
    }
  };

  const handleOpenEditKYC = (kycRecord) => {
    setKycEditForm({
      aadhaarNumber: kycRecord?.aadhaarNumber || "",
      panNumber: kycRecord?.panNumber || "",
      drivingLicenseNumber: kycRecord?.drivingLicenseNumber || "",
    });
    setIsEditKYCOpen(true);
  };

  const handleSaveKYCEdit = async () => {
    if (!selectedTechForKYC) return;
    setSavingKycEdit(true);
    try {
      await adminEditKYCDetails(selectedTechForKYC._id, kycEditForm);
      toast({
        title: "KYC Details Saved",
        description: "Technician identity document numbers updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditKYCOpen(false);
      await handleOpenKYCModal(selectedTechForKYC);
      await fetchData();
    } catch (e) {
      toast({
        title: "Save Error",
        description: e.message || "Failed to update KYC numbers.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingKycEdit(false);
    }
  };

  // Bank Review Modal Handlers
  const handleOpenBankModal = (tech) => {
    setSelectedTechForBank(tech);
    const kycMatch = findKYCRecord(tech, allKycRecords);
    const bankDetails = kycMatch?.bankDetails || {};
    setBankEditForm({
      accountHolderName: bankDetails.accountHolderName || "",
      bankName: bankDetails.bankName || "",
      accountNumber: bankDetails.accountNumber || "",
      ifscCode: bankDetails.ifscCode || "",
      branchName: bankDetails.branchName || "",
      upiId: bankDetails.upiId || "",
    });
    setShowBankRejection(false);
    setBankRejectionReason("");
    setIsBankModalOpen(true);
  };

  const handleVerifyBankAction = async (verified) => {
    if (!selectedTechForBank) return;
    if (!verified && (!bankRejectionReason || bankRejectionReason.trim() === "")) {
      return toast({
        title: "Rejection Reason Required",
        description: "Please specify why the bank account is being rejected.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setLoading(true);
      await verifyBankDetails({
        technicianId: selectedTechForBank._id,
        verified: verified,
        bankRejectionReason: !verified ? bankRejectionReason : null,
      });
      toast({
        title: verified ? "Bank Verified (Payouts Enabled)" : "Bank Rejected",
        description: verified
          ? "Technician bank verified. Payouts and withdrawals are enabled."
          : "Bank verification rejected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsBankModalOpen(false);
      await fetchData();
    } catch (e) {
      toast({
        title: "Bank Verification Error",
        description: e.message || "Failed to update bank verification status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankEdit = async () => {
    if (!selectedTechForBank) return;
    setSavingBankEdit(true);
    try {
      await adminEditBankDetails(selectedTechForBank._id, bankEditForm);
      toast({
        title: "Bank Details Updated",
        description: "Technician payout bank details updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditBankOpen(false);
      await fetchData();
    } catch (e) {
      toast({
        title: "Save Error",
        description: e.message || "Failed to update bank details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingBankEdit(false);
    }
  };

  // Delete Technician
  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTechnician(adminToDelete._id);
      toast({
        title: "Technician Deleted",
        description: `${getTechnicianName(adminToDelete)} has been removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
      await fetchData();
    } catch (e) {
      toast({
        title: "Delete Error",
        description: e.message || "Failed to delete technician.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color={customColor} />
        <Text ml={4} fontWeight="medium">
          Checking permissions...
        </Text>
      </Flex>
    );
  }

  // Get active tab title and helper text
  const getTabHeader = () => {
    switch (activeTab) {
      case "NewTechnician":
        return {
          title: "⏳ New Registered Technicians",
          subtitle: "Technicians awaiting Gate 1 Training verification and initial onboarding approval.",
        };
      case "Active":
        return {
          title: "✅ Active & Approved Technicians",
          subtitle: "Technicians approved and available for customer job dispatch.",
        };
      case "KYCVerification":
        return {
          title: "🪪 Technician KYC Identity Verification",
          subtitle: "Review Aadhaar, PAN, and Driving License identity submissions.",
        };
      case "BankVerification":
        return {
          title: "🏦 Technician Bank & Payout Verification",
          subtitle: "Verify bank accounts and UPI IDs to enable earnings payouts.",
        };
      case "all":
      default:
        return {
          title: "👥 All Technicians Directory",
          subtitle: "Complete management of RightTouch technicians, onboarding gates, and verifications.",
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "80px" }}
      height="100vh"
      overflow="auto"
      css={{
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "24px" },
      }}
    >
      {/* 5 TOP SUMMARY CARDS ONLY */}
      <Box mb="20px" px={{ base: 2, md: 4 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={{ base: 3, md: 4 }}>
          {/* 1. Total Technician */}
          <Card
            minH="100px"
            cursor="pointer"
            onClick={() => handleCardClick("all")}
            border={activeTab === "all" ? "2px solid" : "1px solid"}
            borderColor={activeTab === "all" ? customColor : customBorderColor}
            bg="white"
            borderRadius="14px"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: "translateY(-3px)", shadow: "md", borderColor: customColor }}
          >
            <CardBody p={4}>
              <Flex align="flex-start" justify="space-between">
                <Box flex="1" mr={2}>
                  <Text fontSize="xs" color="gray.600" fontWeight="bold" noOfLines={1}>
                    Total Technician
                  </Text>
                  <Text fontSize="2xl" fontWeight="black" color={textColor} mt={1} lineHeight="1.2">
                    {loading ? <Skeleton height="24px" width="40px" /> : totalCount}
                  </Text>
                  <Box mt={1.5} minH="18px">
                    <Text fontSize="10px" color="gray.400" fontWeight="medium">
                      All Registered
                    </Text>
                  </Box>
                </Box>
                <IconBox h="42px" w="42px" bg={customColor} color="white" flexShrink={0}>
                  <Icon as={FaUsers} boxSize="20px" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* 2. New Technician */}
          <Card
            minH="100px"
            cursor="pointer"
            onClick={() => handleCardClick("NewTechnician")}
            border={activeTab === "NewTechnician" ? "2px solid" : "1px solid"}
            borderColor={activeTab === "NewTechnician" ? customColor : customBorderColor}
            bg="white"
            borderRadius="14px"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: "translateY(-3px)", shadow: "md", borderColor: customColor }}
          >
            <CardBody p={4}>
              <Flex align="flex-start" justify="space-between">
                <Box flex="1" mr={2}>
                  <Text fontSize="xs" color="gray.600" fontWeight="bold" noOfLines={1}>
                    New Technician
                  </Text>
                  <Text fontSize="2xl" fontWeight="black" color="blue.600" mt={1} lineHeight="1.2">
                    {loading ? <Skeleton height="24px" width="40px" /> : newTechCount}
                  </Text>
                  <Box mt={1.5} minH="18px">
                    {!loading && newUnverifiedCount > 0 ? (
                      <Badge
                        colorScheme="red"
                        variant="subtle"
                        fontSize="9px"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {newUnverifiedCount} unverified
                      </Badge>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontWeight="medium">
                        All verified
                      </Text>
                    )}
                  </Box>
                </Box>
                <IconBox h="42px" w="42px" bg="blue.500" color="white" flexShrink={0}>
                  <Icon as={FaUserClock} boxSize="20px" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* 3. Active Technician */}
          <Card
            minH="100px"
            cursor="pointer"
            onClick={() => handleCardClick("Active")}
            border={activeTab === "Active" ? "2px solid" : "1px solid"}
            borderColor={activeTab === "Active" ? customColor : customBorderColor}
            bg="white"
            borderRadius="14px"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: "translateY(-3px)", shadow: "md", borderColor: customColor }}
          >
            <CardBody p={4}>
              <Flex align="flex-start" justify="space-between">
                <Box flex="1" mr={2}>
                  <Text fontSize="xs" color="gray.600" fontWeight="bold" noOfLines={1}>
                    Active Technician
                  </Text>
                  <Text fontSize="2xl" fontWeight="black" color="green.600" mt={1} lineHeight="1.2">
                    {loading ? <Skeleton height="24px" width="40px" /> : activeTechCount}
                  </Text>
                  <Box mt={1.5} minH="18px">
                    <Badge
                      colorScheme="green"
                      variant="subtle"
                      fontSize="9px"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      Active & ready
                    </Badge>
                  </Box>
                </Box>
                <IconBox h="42px" w="42px" bg="green.500" color="white" flexShrink={0}>
                  <Icon as={FaCheckCircle} boxSize="20px" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* 4. KYC Verification */}
          <Card
            minH="100px"
            cursor="pointer"
            onClick={() => handleCardClick("KYCVerification")}
            border={activeTab === "KYCVerification" ? "2px solid" : "1px solid"}
            borderColor={activeTab === "KYCVerification" ? customColor : customBorderColor}
            bg="white"
            borderRadius="14px"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: "translateY(-3px)", shadow: "md", borderColor: customColor }}
          >
            <CardBody p={4}>
              <Flex align="flex-start" justify="space-between">
                <Box flex="1" mr={2}>
                  <Text fontSize="xs" color="gray.600" fontWeight="bold" noOfLines={1}>
                    KYC Verification
                  </Text>
                  <Text fontSize="2xl" fontWeight="black" color="purple.600" mt={1} lineHeight="1.2">
                    {loading ? <Skeleton height="24px" width="40px" /> : kycVerifiedCount}
                  </Text>
                  <Box mt={1.5} minH="18px">
                    {!loading && kycUnverifiedCount > 0 ? (
                      <Badge
                        colorScheme="purple"
                        variant="subtle"
                        fontSize="9px"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {kycUnverifiedCount} unverified
                      </Badge>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontWeight="medium">
                        All verified
                      </Text>
                    )}
                  </Box>
                </Box>
                <IconBox h="42px" w="42px" bg="purple.500" color="white" flexShrink={0}>
                  <Icon as={FaIdCard} boxSize="20px" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>

          {/* 5. Bank Verification */}
          <Card
            minH="100px"
            cursor="pointer"
            onClick={() => handleCardClick("BankVerification")}
            border={activeTab === "BankVerification" ? "2px solid" : "1px solid"}
            borderColor={activeTab === "BankVerification" ? customColor : customBorderColor}
            bg="white"
            borderRadius="14px"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: "translateY(-3px)", shadow: "md", borderColor: customColor }}
          >
            <CardBody p={4}>
              <Flex align="flex-start" justify="space-between">
                <Box flex="1" mr={2}>
                  <Text fontSize="xs" color="gray.600" fontWeight="bold" noOfLines={1}>
                    Bank Verification
                  </Text>
                  <Text fontSize="2xl" fontWeight="black" color="orange.600" mt={1} lineHeight="1.2">
                    {loading ? <Skeleton height="24px" width="40px" /> : bankVerifiedCount}
                  </Text>
                  <Box mt={1.5} minH="18px">
                    {!loading && bankUnverifiedCount > 0 ? (
                      <Badge
                        colorScheme="orange"
                        variant="subtle"
                        fontSize="9px"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {bankUnverifiedCount} unverified
                      </Badge>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontWeight="medium">
                        All verified
                      </Text>
                    )}
                  </Box>
                </Box>
                <IconBox h="42px" w="42px" bg="orange.500" color="white" flexShrink={0}>
                  <Icon as={FaUniversity} boxSize="20px" />
                </IconBox>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* TABLE SECTION CONTAINER */}
      <Box flex="1" px={{ base: 2, md: 4 }} pb={4} display="flex" flexDirection="column">
        <Card
          bg="white"
          shadow="lg"
          borderRadius="16px"
          border="1px solid"
          borderColor={customBorderColor}
          display="flex"
          flexDirection="column"
          flex="1"
          overflow="hidden"
        >
          {/* Header Controls Bar */}
          <CardHeader p="16px" pb="12px" borderBottom="1px solid" borderColor="gray.100">
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "stretch", lg: "center" }}
              gap={3}
            >
              <Box>
                <Heading size="md" color="gray.800">
                  {headerInfo.title}
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {headerInfo.subtitle}
                </Text>
              </Box>

              {/* Controls: Search, Mandatory District Filter, Status Dropdown & Reset */}
              <Flex align="center" gap={3} flexWrap="wrap">
                {/* Search */}
                <InputGroup size="sm" maxW={{ base: "100%", sm: "300px" }}>
                  <Input
                    placeholder="Search name, phone, bank account, IFSC..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    borderRadius="8px"
                    borderColor={`${customColor}40`}
                    _focus={{ borderColor: customColor, boxShadow: `0 0 0 1px ${customColor}` }}
                  />
                  <InputRightElement>
                    {searchTerm ? (
                      <IconButton
                        size="xs"
                        aria-label="Clear search"
                        icon={<FaTimes />}
                        variant="ghost"
                        onClick={() => setSearchTerm("")}
                      />
                    ) : (
                      <Icon as={FaSearch} color="gray.400" />
                    )}
                  </InputRightElement>
                </InputGroup>

                {/* District Filter (Mandatory District-Wise Filter Dropdown) */}
                <Select
                  size="sm"
                  maxW={{ base: "100%", sm: "210px" }}
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  borderRadius="8px"
                  borderColor={districtFilter !== "all" ? customColor : `${customColor}50`}
                  bg={districtFilter !== "all" ? `${customColor}12` : "white"}
                  _focus={{ borderColor: customColor }}
                  fontWeight="bold"
                  color={districtFilter !== "all" ? customColor : "gray.700"}
                >
                  <option value="all">📍 District: All Districts</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      📍 District: {d}
                    </option>
                  ))}
                </Select>

                {/* Dropdown Filter for Verified / Unverified */}
                <Select
                  size="sm"
                  maxW={{ base: "100%", sm: "190px" }}
                  value={subFilter}
                  onChange={(e) => {
                    setSubFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  borderRadius="8px"
                  borderColor={`${customColor}50`}
                  _focus={{ borderColor: customColor }}
                  fontWeight="medium"
                  color="gray.700"
                >
                  <option value="all">Filter: All Statuses</option>
                  <option value="verified">Verified / Approved</option>
                  <option value="unverified">Unverified / Pending</option>
                  {activeTab === "KYCVerification" && <option value="rejected">Rejected KYC</option>}
                  {activeTab === "NewTechnician" && (
                    <>
                      <option value="trainingPending">Training Pending</option>
                      <option value="trainingCompleted">Training Completed</option>
                    </>
                  )}
                  {activeTab === "Active" && (
                    <>
                      <option value="onlineNow">Online Now</option>
                      <option value="suspendedStatus">Suspended</option>
                    </>
                  )}
                </Select>

                {/* Show All / Reset Button */}
                {(activeTab !== "all" || subFilter !== "all" || districtFilter !== "all" || searchTerm !== "") && (
                  <Button
                    size="sm"
                    variant="outline"
                    color={customColor}
                    borderColor={customColor}
                    _hover={{ bg: customColor, color: "white" }}
                    onClick={() => {
                      setActiveTab("all");
                      setSubFilter("all");
                      setDistrictFilter("all");
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </Flex>
            </Flex>
          </CardHeader>

          {/* Table Body */}
          <CardBody p={0} flex="1" display="flex" flexDirection="column" overflow="hidden">
            {tableLoading ? (
              <Box p={6}>
                <Table variant="simple" size="sm">
                  <Thead bg={customColor}>
                    <Tr verticalAlign="middle">
                      <Th color="white" py={3.5} minW="190px" verticalAlign="middle">Technician Profile</Th>
                      <Th color="white" py={3.5} minW="140px" verticalAlign="middle">Skill / Experience</Th>
                      <Th color="white" py={3.5} minW="140px" verticalAlign="middle">District *</Th>
                      <Th color="white" py={3.5} minW="100px" verticalAlign="middle">City</Th>
                      <Th color="white" py={3.5} minW="150px" textAlign="center" verticalAlign="middle">Gate 1: Training</Th>
                      <Th color="white" py={3.5} minW="140px" textAlign="center" verticalAlign="middle">Gate 2: KYC</Th>
                      <Th color="white" py={3.5} minW="140px" textAlign="center" verticalAlign="middle">Gate 3: Bank Payout</Th>
                      <Th color="white" py={3.5} minW="130px" textAlign="center" verticalAlign="middle">Work Status</Th>
                      <Th color="white" py={3.5} minW="160px" textAlign="center" verticalAlign="middle">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Tr key={i} height="60px" verticalAlign="middle">
                        <Td py={3} verticalAlign="middle">
                          <Flex align="center">
                            <SkeletonCircle size="8" mr={3} />
                            <Box>
                              <Skeleton height="14px" width="120px" mb={1} />
                              <Skeleton height="10px" width="80px" />
                            </Box>
                          </Flex>
                        </Td>
                        <Td py={3} verticalAlign="middle"><Skeleton height="14px" width="100px" /></Td>
                        <Td py={3} verticalAlign="middle"><Skeleton height="20px" width="90px" borderRadius="md" /></Td>
                        <Td py={3} verticalAlign="middle"><Skeleton height="14px" width="70px" /></Td>
                        <Td py={3} verticalAlign="middle" textAlign="center"><Flex justify="center"><Skeleton height="24px" width="90px" borderRadius="full" /></Flex></Td>
                        <Td py={3} verticalAlign="middle" textAlign="center"><Flex justify="center"><Skeleton height="24px" width="80px" borderRadius="full" /></Flex></Td>
                        <Td py={3} verticalAlign="middle" textAlign="center"><Flex justify="center"><Skeleton height="24px" width="80px" borderRadius="full" /></Flex></Td>
                        <Td py={3} verticalAlign="middle" textAlign="center"><Flex justify="center"><Skeleton height="24px" width="75px" borderRadius="full" /></Flex></Td>
                        <Td py={3} verticalAlign="middle" textAlign="center"><Flex justify="center"><Skeleton height="28px" width="110px" borderRadius="md" /></Flex></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : currentItems.length > 0 ? (
              <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                <Box
                  flex="1"
                  overflowY="auto"
                  overflowX="auto"
                  css={{
                    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
                    "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "3px" },
                  }}
                >
                  <Table variant="simple" size="sm">
                    <Thead position="sticky" top={0} zIndex={10} bg={customColor}>
                      <Tr verticalAlign="middle">
                        <Th color="white" py={3.5} minW="190px" verticalAlign="middle">Technician Profile</Th>
                        <Th color="white" py={3.5} minW="140px" verticalAlign="middle">Skill / Experience</Th>
                        <Th color="white" py={3.5} minW="140px" verticalAlign="middle">District *</Th>
                        <Th color="white" py={3.5} minW="100px" verticalAlign="middle">City</Th>
                        <Th color="white" py={3.5} minW="150px" textAlign="center" verticalAlign="middle">Gate 1: Training</Th>
                        <Th color="white" py={3.5} minW="140px" textAlign="center" verticalAlign="middle">Gate 2: KYC</Th>
                        <Th color="white" py={3.5} minW="140px" textAlign="center" verticalAlign="middle">Gate 3: Bank Payout</Th>
                        <Th color="white" py={3.5} minW="130px" textAlign="center" verticalAlign="middle">Work Status</Th>
                        <Th color="white" py={3.5} minW="160px" textAlign="center" verticalAlign="middle">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {currentItems.map((tech) => {
                        const isKycVer = isTechnicianKYCVerified(tech, allKycRecords);
                        const isBankVer = isTechnicianBankVerified(tech, allKycRecords);
                        const kycRecord = findKYCRecord(tech, allKycRecords);
                        const kycStatus =
                          kycRecord?.status?.toLowerCase() ||
                          kycRecord?.verificationStatus?.toLowerCase() ||
                          "pending";

                        return (
                          <Tr
                            key={tech._id}
                            _hover={{ bg: `${customColor}08` }}
                            transition="background 0.15s"
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            verticalAlign="middle"
                          >
                            {/* Profile */}
                            <Td py={3} verticalAlign="middle">
                              <Flex
                                align="center"
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedTechnician(tech);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Avatar
                                  size="sm"
                                  name={getTechnicianName(tech)}
                                  src={getTechnicianImage(tech)}
                                  mr={3}
                                  border="1px solid"
                                  borderColor={customColor}
                                />
                                <Box maxW="150px">
                                  <Text fontWeight="bold" color="gray.800" fontSize="sm" isTruncated title={getTechnicianName(tech)}>
                                    {getTechnicianName(tech)}
                                  </Text>
                                  <Flex align="center" gap={1} mt={0.5}>
                                    <Text fontSize="xs" color="gray.500" isTruncated maxW="110px">
                                      {tech.mobileNumber || tech.phone || tech.email || "No contact"}
                                    </Text>
                                    {tech.availability?.isOnline && (
                                      <Badge colorScheme="green" fontSize="9px" px={1} borderRadius="full" flexShrink={0}>
                                        Online
                                      </Badge>
                                    )}
                                  </Flex>
                                </Box>
                              </Flex>
                            </Td>

                            {/* Skill / Exp */}
                            <Td py={3} verticalAlign="middle">
                              <Text fontSize="xs" fontWeight="semibold" color="gray.700" isTruncated maxW="140px">
                                {tech.specialization || tech.profile?.specialization || "General"}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {tech.experienceYears || tech.profile?.experienceYears || "0"} Years Exp
                              </Text>
                            </Td>

                            {/* District (Mandatory) */}
                            <Td py={3} verticalAlign="middle">
                              {getTechnicianDistrict(tech) ? (
                                <Badge colorScheme="teal" px={2.5} py={1} borderRadius="md" textTransform="capitalize" fontWeight="bold" fontSize="2xs">
                                  📍 {getTechnicianDistrict(tech)}
                                </Badge>
                              ) : (
                                <Badge colorScheme="red" px={2} py={0.5} borderRadius="md" variant="solid" fontSize="2xs">
                                  ⚠️ District Missing
                                </Badge>
                              )}
                            </Td>

                            {/* City */}
                            <Td py={3} verticalAlign="middle">
                              <Text fontSize="xs" color="gray.700" fontWeight="medium" textTransform="capitalize">
                                {tech.city || tech.profile?.city || tech.locality || "N/A"}
                              </Text>
                            </Td>

                            {/* Gate 1: Training Status + Fast Action */}
                            <Td py={3} verticalAlign="middle" textAlign="center">
                              <Flex align="center" justify="center" gap={1.5}>
                                <Badge
                                  colorScheme={tech.trainingCompleted ? "green" : "orange"}
                                  borderRadius="full"
                                  px={2.5}
                                  h="26px"
                                  fontSize="2xs"
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={1}
                                >
                                  <Icon as={tech.trainingCompleted ? FaCheckCircle : MdOutlinePending} />
                                  {tech.trainingCompleted ? "Completed" : "Pending"}
                                </Badge>
                                <Tooltip
                                  label={
                                    tech.trainingCompleted
                                      ? "Mark training incomplete"
                                      : "Approve Gate 1 training completion"
                                  }
                                >
                                  <IconButton
                                    size="xs"
                                    h="26px"
                                    w="26px"
                                    aria-label="Toggle training"
                                    icon={<FaUserGraduate />}
                                    colorScheme={tech.trainingCompleted ? "gray" : "teal"}
                                    variant={tech.trainingCompleted ? "ghost" : "solid"}
                                    onClick={() => handleToggleTraining(tech, !tech.trainingCompleted)}
                                  />
                                </Tooltip>
                              </Flex>
                            </Td>

                            {/* Gate 2: KYC */}
                            <Td py={3} verticalAlign="middle" textAlign="center">
                              <Flex justify="center" align="center">
                                <Badge
                                  colorScheme={
                                    isKycVer
                                      ? "green"
                                      : kycStatus === "rejected"
                                      ? "red"
                                      : kycRecord
                                      ? "purple"
                                      : "gray"
                                  }
                                  borderRadius="full"
                                  px={2.5}
                                  h="26px"
                                  fontSize="2xs"
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={1}
                                  cursor="pointer"
                                  onClick={() => handleOpenKYCModal(tech)}
                                >
                                  <Icon
                                    as={
                                      isKycVer
                                        ? MdVerified
                                        : kycStatus === "rejected"
                                        ? FaTimesCircle
                                        : FaIdCard
                                    }
                                  />
                                  {isKycVer
                                    ? "Verified"
                                    : kycStatus === "rejected"
                                    ? "Rejected"
                                    : kycRecord
                                    ? "Under Review"
                                    : "Not Uploaded"}
                                </Badge>
                              </Flex>
                            </Td>

                            {/* Gate 3: Bank Payout */}
                            <Td py={3} verticalAlign="middle" textAlign="center">
                              <Flex justify="center" align="center">
                                <Badge
                                  colorScheme={isBankVer ? "green" : kycRecord?.bankDetails ? "orange" : "gray"}
                                  borderRadius="full"
                                  px={2.5}
                                  h="26px"
                                  fontSize="2xs"
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={1}
                                  cursor="pointer"
                                  onClick={() => handleOpenBankModal(tech)}
                                >
                                  <Icon as={isBankVer ? FaCheckCircle : FaUniversity} />
                                  {isBankVer ? "Verified" : kycRecord?.bankDetails ? "Pending" : "Not Added"}
                                </Badge>
                              </Flex>
                            </Td>

                            {/* Work Status */}
                            <Td py={3} verticalAlign="middle" textAlign="center">
                              <Flex justify="center" align="center">
                                <Badge
                                  colorScheme={
                                    tech.workStatus === "approved" || tech.status === "Active"
                                      ? "green"
                                      : tech.workStatus === "suspended" || tech.status === "Inactive"
                                      ? "red"
                                      : "yellow"
                                  }
                                  borderRadius="full"
                                  px={2.5}
                                  h="26px"
                                  fontSize="2xs"
                                  display="inline-flex"
                                  alignItems="center"
                                  textTransform="capitalize"
                                >
                                  {tech.workStatus || tech.status || "Pending"}
                                </Badge>
                              </Flex>
                            </Td>

                            {/* Actions Column */}
                            <Td py={3} verticalAlign="middle" textAlign="center">
                              <HStack spacing={1.5} justify="center" align="center">
                                {/* View Full Profile */}
                                <Tooltip label="View Full Profile & KYC">
                                  <IconButton
                                    size="xs"
                                    h="28px"
                                    w="28px"
                                    aria-label="View Details"
                                    icon={<FaEye />}
                                    variant="outline"
                                    colorScheme="teal"
                                    onClick={() => {
                                      setSelectedTechnician(tech);
                                      setIsDetailsModalOpen(true);
                                    }}
                                  />
                                </Tooltip>

                                {/* KYC Review Button */}
                                <Tooltip label="Review KYC Documents">
                                  <IconButton
                                    size="xs"
                                    h="28px"
                                    w="28px"
                                    aria-label="Review KYC"
                                    icon={<FaIdCard />}
                                    variant="outline"
                                    colorScheme="purple"
                                    onClick={() => handleOpenKYCModal(tech)}
                                  />
                                </Tooltip>

                                {/* Bank Review Button */}
                                <Tooltip label="Review Bank Payouts">
                                  <IconButton
                                    size="xs"
                                    h="28px"
                                    w="28px"
                                    aria-label="Review Bank"
                                    icon={<FaUniversity />}
                                    variant="outline"
                                    colorScheme="orange"
                                    onClick={() => handleOpenBankModal(tech)}
                                  />
                                </Tooltip>

                                {/* Work Status Menu */}
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    size="xs"
                                    h="28px"
                                    w="28px"
                                    aria-label="More Options"
                                    icon={<FaEllipsisV />}
                                    variant="ghost"
                                  />
                                  <MenuList fontSize="sm">
                                    <MenuItem
                                      icon={<FaCheck color="green" />}
                                      onClick={() => handleUpdateWorkStatus(tech, "approved")}
                                    >
                                      Set Status: Approved
                                    </MenuItem>
                                    <MenuItem
                                      icon={<MdOutlinePending color="orange" />}
                                      onClick={() => handleUpdateWorkStatus(tech, "pending")}
                                    >
                                      Set Status: Pending
                                    </MenuItem>
                                    <MenuItem
                                      icon={<FaUserSlash color="red" />}
                                      onClick={() => handleUpdateWorkStatus(tech, "suspended")}
                                    >
                                      Set Status: Suspended
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem
                                      icon={<FaTrash color="red" />}
                                      color="red.600"
                                      onClick={() => {
                                        setAdminToDelete(tech);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      Delete Technician
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination Footer */}
                <Box p={3} borderTop="1px solid" borderColor="gray.100" bg="gray.50">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.600">
                      Showing {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}{" "}
                      technicians
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        leftIcon={<FaChevronLeft />}
                        isDisabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Text fontSize="xs" fontWeight="bold" color={customColor} px={2}>
                        {currentPage} / {totalPages}
                      </Text>
                      <Button
                        size="xs"
                        rightIcon={<FaChevronRight />}
                        isDisabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
              </Box>
            ) : (
              <Flex height="250px" direction="column" justify="center" align="center" p={6}>
                <Icon as={FaSearch} boxSize="32px" color="gray.300" mb={3} />
                <Text fontSize="md" fontWeight="semibold" color="gray.600">
                  No technicians match the selected filters
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Try clearing the search query or switching to All Technicians.
                </Text>
                <Button
                  size="sm"
                  mt={4}
                  colorScheme="teal"
                  onClick={() => {
                    setActiveTab("all");
                    setSubFilter("all");
                    setSearchTerm("");
                  }}
                >
                  Reset Filters
                </Button>
              </Flex>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* KYC IDENTITY REVIEW & EDIT MODAL */}
      <Modal isOpen={isKYCModalOpen} onClose={() => setIsKYCModalOpen(false)} size="2xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={3}>
            <Flex justify="space-between" align="center" pr={6}>
              <Box>
                <Heading size="sm">Gate 2: KYC Identity Verification</Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Technician: {getTechnicianName(selectedTechForKYC)}
                </Text>
              </Box>
              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={isUnmaskedPII ? <FaLock /> : <FaUnlock />}
                  colorScheme={isUnmaskedPII ? "purple" : "gray"}
                  onClick={handleToggleUnmaskedPII}
                  isLoading={kycLoading}
                >
                  {isUnmaskedPII ? "Mask PII" : "Unmask Full PII (Audited)"}
                </Button>
                {kycData && (
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="teal"
                    leftIcon={<FaEdit />}
                    onClick={() => {
                      const rec = Array.isArray(kycData)
                        ? kycData.find((d) => (d.technicianId?._id || d.technicianId) === selectedTechForKYC?._id) || kycData[0]
                        : kycData;
                      handleOpenEditKYC(rec);
                    }}
                  >
                    Edit Numbers
                  </Button>
                )}
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4}>
            {kycLoading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="lg" color={customColor} />
              </Flex>
            ) : kycData ? (
              (() => {
                let rec = Array.isArray(kycData)
                  ? kycData.find((d) => (d.technicianId?._id || d.technicianId) === selectedTechForKYC?._id) || kycData[0]
                  : kycData;

                if (!rec) {
                  return (
                    <Text textAlign="center" py={8} color="gray.500">
                      No KYC record found for this technician.
                    </Text>
                  );
                }

                const docs = rec.documents || {};
                const verificationStatus =
                  rec.verificationStatus || rec.status || "pending";

                return (
                  <VStack spacing={4} align="stretch">
                    {/* Status Banner */}
                    <Flex
                      p={3}
                      borderRadius="8px"
                      align="center"
                      justify="space-between"
                      bg={
                        verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                          ? "green.50"
                          : verificationStatus === "rejected"
                          ? "red.50"
                          : "yellow.50"
                      }
                      border="1px solid"
                      borderColor={
                        verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                          ? "green.300"
                          : verificationStatus === "rejected"
                          ? "red.200"
                          : "yellow.200"
                      }
                    >
                      <Box>
                        <Flex align="center" gap={2}>
                          <Icon
                            as={
                              verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                                ? FaCheckCircle
                                : verificationStatus === "rejected"
                                ? FaTimesCircle
                                : MdOutlinePending
                            }
                            color={
                              verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                                ? "green.600"
                                : verificationStatus === "rejected"
                                ? "red.600"
                                : "yellow.600"
                            }
                            boxSize="18px"
                          />
                          <Text fontSize="sm" fontWeight="bold" color="gray.800">
                            {verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                              ? "Already Verified (KYC Approved)"
                              : verificationStatus === "rejected"
                              ? "KYC Rejected"
                              : "KYC Pending Verification"}
                          </Text>
                        </Flex>
                        <Badge
                          colorScheme={
                            verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                              ? "green"
                              : verificationStatus === "rejected"
                              ? "red"
                              : "yellow"
                          }
                          fontSize="xs"
                          mt={1}
                        >
                          {verificationStatus === "approved" || isTechnicianKYCVerified(selectedTechForKYC, allKycRecords)
                            ? "ALREADY VERIFIED BY ADMIN"
                            : verificationStatus.toUpperCase()}
                        </Badge>
                      </Box>
                      {rec.verifiedAt && (
                        <Text fontSize="xs" color="gray.600" fontWeight="medium">
                          Verified Date: {new Date(rec.verifiedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </Flex>

                    {rec.rejectionReason && (
                      <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px">
                        <Text fontSize="xs" fontWeight="bold" color="red.700">
                          Rejection Reason:
                        </Text>
                        <Text fontSize="xs" color="red.600" mt={1}>
                          {rec.rejectionReason}
                        </Text>
                      </Box>
                    )}

                    {/* Document Cards Grid */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                      {/* Aadhaar */}
                      <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="10px">
                        <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                          AADHAAR CARD
                        </Text>
                        {docs.aadhaarUrl ? (
                          <Box borderRadius="6px" overflow="hidden" border="1px solid #eee">
                            <img
                              src={getImageUrl(docs.aadhaarUrl)}
                              alt="Aadhaar"
                              style={{ width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" }}
                              onClick={() => window.open(getImageUrl(docs.aadhaarUrl), "_blank")}
                            />
                            <Button
                              size="xs"
                              w="100%"
                              variant="ghost"
                              colorScheme="purple"
                              as="a"
                              href={getImageUrl(docs.aadhaarUrl)}
                              target="_blank"
                            >
                              View Full Size
                            </Button>
                          </Box>
                        ) : (
                          <Flex h="130px" bg="gray.50" align="center" justify="center" border="1px dashed #cbd5e1">
                            <Text fontSize="xs" color="gray.400">Not Uploaded</Text>
                          </Flex>
                        )}
                        <Text fontSize="10px" color="gray.400" mt={2} textTransform="uppercase">
                          Aadhaar Number
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                          {rec.aadhaarNumber || "N/A"}
                        </Text>
                      </Box>

                      {/* PAN Card */}
                      <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="10px">
                        <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                          PAN CARD
                        </Text>
                        {docs.panUrl ? (
                          <Box borderRadius="6px" overflow="hidden" border="1px solid #eee">
                            <img
                              src={getImageUrl(docs.panUrl)}
                              alt="PAN"
                              style={{ width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" }}
                              onClick={() => window.open(getImageUrl(docs.panUrl), "_blank")}
                            />
                            <Button
                              size="xs"
                              w="100%"
                              variant="ghost"
                              colorScheme="purple"
                              as="a"
                              href={getImageUrl(docs.panUrl)}
                              target="_blank"
                            >
                              View Full Size
                            </Button>
                          </Box>
                        ) : (
                          <Flex h="130px" bg="gray.50" align="center" justify="center" border="1px dashed #cbd5e1">
                            <Text fontSize="xs" color="gray.400">Not Uploaded</Text>
                          </Flex>
                        )}
                        <Text fontSize="10px" color="gray.400" mt={2} textTransform="uppercase">
                          PAN Number
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                          {rec.panNumber || "N/A"}
                        </Text>
                      </Box>

                      {/* Driving License */}
                      <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="10px">
                        <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                          DRIVING LICENSE
                        </Text>
                        {docs.dlUrl ? (
                          <Box borderRadius="6px" overflow="hidden" border="1px solid #eee">
                            <img
                              src={getImageUrl(docs.dlUrl)}
                              alt="Driving License"
                              style={{ width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" }}
                              onClick={() => window.open(getImageUrl(docs.dlUrl), "_blank")}
                            />
                            <Button
                              size="xs"
                              w="100%"
                              variant="ghost"
                              colorScheme="purple"
                              as="a"
                              href={getImageUrl(docs.dlUrl)}
                              target="_blank"
                            >
                              View Full Size
                            </Button>
                          </Box>
                        ) : (
                          <Flex h="130px" bg="gray.50" align="center" justify="center" border="1px dashed #cbd5e1">
                            <Text fontSize="xs" color="gray.400">Not Uploaded</Text>
                          </Flex>
                        )}
                        <Text fontSize="10px" color="gray.400" mt={2} textTransform="uppercase">
                          DL Number
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                          {rec.drivingLicenseNumber || "N/A"}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* Rejection input area */}
                    {showRejectionInput && (
                      <Box p={3} border="1px solid" borderColor="red.300" borderRadius="8px" bg="red.50">
                        <Text fontSize="xs" fontWeight="bold" color="red.700" mb={1}>
                          Reason for Rejection (Required):
                        </Text>
                        <Textarea
                          size="sm"
                          bg="white"
                          placeholder="State why document/identity was rejected..."
                          value={rejectionInput}
                          onChange={(e) => setRejectionInput(e.target.value)}
                        />
                      </Box>
                    )}
                  </VStack>
                );
              })()
            ) : (
              <Text textAlign="center" py={10} color="gray.500">
                No KYC record found.
              </Text>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50">
            <Flex w="100%" justify="space-between" align="center">
              {kycData && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this KYC record?")) {
                      await deleteKYC(selectedTechForKYC._id);
                      setIsKYCModalOpen(false);
                      await fetchData();
                    }
                  }}
                >
                  Delete KYC
                </Button>
              )}

              <HStack spacing={2}>
                {!showRejectionInput ? (
                  <>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => setShowRejectionInput(true)}
                    >
                      Reject KYC
                    </Button>
                    {(() => {
                      const alreadyVerified = isTechnicianKYCVerified(selectedTechForKYC, allKycRecords);
                      return (
                        <Button
                          size="sm"
                          colorScheme={alreadyVerified ? "teal" : "green"}
                          leftIcon={<FaCheckCircle />}
                          onClick={() => handleVerifyKYCAction("approved")}
                        >
                          {alreadyVerified ? "Already Verified ✓" : "Approve (Verify Identity)"}
                        </Button>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowRejectionInput(false);
                        setRejectionInput("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleVerifyKYCAction("rejected")}
                    >
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT KYC NUMBERS MODAL */}
      <Modal isOpen={isEditKYCOpen} onClose={() => setIsEditKYCOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="14px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            Edit Technician KYC Numbers
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs">Aadhaar Number (12 digits)</FormLabel>
                <Input
                  size="sm"
                  value={kycEditForm.aadhaarNumber}
                  onChange={(e) => setKycEditForm({ ...kycEditForm, aadhaarNumber: e.target.value })}
                  placeholder="123456789012"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">PAN Card Number</FormLabel>
                <Input
                  size="sm"
                  value={kycEditForm.panNumber}
                  onChange={(e) => setKycEditForm({ ...kycEditForm, panNumber: e.target.value })}
                  placeholder="ABCDE1234F"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Driving License Number</FormLabel>
                <Input
                  size="sm"
                  value={kycEditForm.drivingLicenseNumber}
                  onChange={(e) =>
                    setKycEditForm({ ...kycEditForm, drivingLicenseNumber: e.target.value })
                  }
                  placeholder="TN3720230009999"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50">
            <Button size="sm" mr={2} variant="ghost" onClick={() => setIsEditKYCOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" colorScheme="teal" onClick={handleSaveKYCEdit} isLoading={savingKycEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* BANK & PAYOUT DETAILS MODAL */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            <Flex justify="space-between" align="center" pr={6}>
              <Box>
                <Heading size="sm">Gate 3: Bank & Payout Verification</Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Technician: {getTechnicianName(selectedTechForBank)}
                </Text>
              </Box>
              <Button
                size="xs"
                variant="outline"
                colorScheme="teal"
                leftIcon={<FaEdit />}
                onClick={() => setIsEditBankOpen(true)}
              >
                Edit Bank Details
              </Button>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4}>
            {selectedTechForBank && (
              <VStack spacing={4} align="stretch">
                {/* Bank status banner */}
                {(() => {
                  const isBankVer = isTechnicianBankVerified(selectedTechForBank, allKycRecords);
                  const kycMatch = findKYCRecord(selectedTechForBank, allKycRecords);
                  const bankDetails = kycMatch?.bankDetails;

                  return (
                    <>
                      <Flex
                        p={3}
                        borderRadius="8px"
                        align="center"
                        justify="space-between"
                        bg={isBankVer ? "green.50" : bankDetails ? "orange.50" : "gray.50"}
                        border="1px solid"
                        borderColor={isBankVer ? "green.300" : bankDetails ? "orange.200" : "gray.200"}
                      >
                        <Box>
                          <Flex align="center" gap={2}>
                            <Icon
                              as={isBankVer ? FaCheckCircle : FaUniversity}
                              color={isBankVer ? "green.600" : "orange.500"}
                              boxSize="18px"
                            />
                            <Text fontSize="sm" fontWeight="bold" color="gray.800">
                              {isBankVer
                                ? "Already Verified (Payouts Enabled)"
                                : bankDetails
                                ? "Bank Details Pending Verification"
                                : "No Bank Details Added"}
                            </Text>
                          </Flex>
                          <Badge colorScheme={isBankVer ? "green" : bankDetails ? "orange" : "gray"} mt={1}>
                            {isBankVer ? "ALREADY VERIFIED (PAYOUTS ACTIVE)" : bankDetails ? "PENDING REVIEW" : "NO BANK ADDED"}
                          </Badge>
                        </Box>
                      </Flex>

                      {bankDetails ? (
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} p={3} border="1px solid #eee" borderRadius="10px">
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase">Account Holder</Text>
                            <Text fontSize="sm" fontWeight="bold">{bankDetails.accountHolderName || "N/A"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase">Bank Name</Text>
                            <Text fontSize="sm" fontWeight="bold">{bankDetails.bankName || "N/A"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase">Account Number</Text>
                            <Text fontSize="sm" fontWeight="bold" fontFamily="monospace">{bankDetails.accountNumber || "N/A"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase">IFSC Code</Text>
                            <Text fontSize="sm" fontWeight="bold" fontFamily="monospace">{bankDetails.ifscCode || "N/A"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase">Branch</Text>
                            <Text fontSize="sm">{bankDetails.branchName || "N/A"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase">UPI ID</Text>
                            <Text fontSize="sm" fontWeight="semibold" color="teal.600">{bankDetails.upiId || "N/A"}</Text>
                          </Box>
                        </SimpleGrid>
                      ) : (
                        <Text textAlign="center" py={6} color="gray.400" fontStyle="italic">
                          No bank details submitted yet by this technician.
                        </Text>
                      )}

                      {showBankRejection && (
                        <Box p={3} border="1px solid" borderColor="red.300" borderRadius="8px" bg="red.50">
                          <Text fontSize="xs" fontWeight="bold" color="red.700" mb={1}>
                            Bank Rejection Reason:
                          </Text>
                          <Textarea
                            size="sm"
                            bg="white"
                            placeholder="State reason for bank detail rejection..."
                            value={bankRejectionReason}
                            onChange={(e) => setBankRejectionReason(e.target.value)}
                          />
                        </Box>
                      )}
                    </>
                  );
                })()}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50">
            <HStack spacing={2} justify="flex-end" w="100%">
              {!showBankRejection ? (
                <>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setShowBankRejection(true)}
                  >
                    Reject Bank
                  </Button>
                  {(() => {
                    const isBankVer = isTechnicianBankVerified(selectedTechForBank, allKycRecords);
                    return (
                      <Button
                        size="sm"
                        colorScheme={isBankVer ? "teal" : "green"}
                        leftIcon={<FaCheckCircle />}
                        onClick={() => handleVerifyBankAction(true)}
                        isLoading={loading}
                      >
                        {isBankVer ? "Already Verified ✓" : "Verify Bank (Enable Payouts)"}
                      </Button>
                    );
                  })()}
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setShowBankRejection(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleVerifyBankAction(false)}>
                    Confirm Rejection
                  </Button>
                </>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT BANK DETAILS MODAL */}
      <Modal isOpen={isEditBankOpen} onClose={() => setIsEditBankOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="14px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            Edit Technician Bank & Payout Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Account Holder Name</FormLabel>
                <Input
                  size="sm"
                  value={bankEditForm.accountHolderName}
                  onChange={(e) => setBankEditForm({ ...bankEditForm, accountHolderName: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Bank Name</FormLabel>
                <Input
                  size="sm"
                  value={bankEditForm.bankName}
                  onChange={(e) => setBankEditForm({ ...bankEditForm, bankName: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Account Number</FormLabel>
                <Input
                  size="sm"
                  value={bankEditForm.accountNumber}
                  onChange={(e) => setBankEditForm({ ...bankEditForm, accountNumber: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs">IFSC Code</FormLabel>
                <Input
                  size="sm"
                  value={bankEditForm.ifscCode}
                  onChange={(e) => setBankEditForm({ ...bankEditForm, ifscCode: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Branch Name</FormLabel>
                <Input
                  size="sm"
                  value={bankEditForm.branchName}
                  onChange={(e) => setBankEditForm({ ...bankEditForm, branchName: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">UPI ID</FormLabel>
                <Input
                  size="sm"
                  value={bankEditForm.upiId}
                  onChange={(e) => setBankEditForm({ ...bankEditForm, upiId: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50">
            <Button size="sm" mr={2} variant="ghost" onClick={() => setIsEditBankOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" colorScheme="teal" onClick={handleSaveBankEdit} isLoading={savingBankEdit}>
              Save Bank Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TECHNICIAN FULL PROFILE DETAILS MODAL */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            Technician Complete Profile
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            {selectedTechnician && (
              <VStack spacing={4} align="stretch">
                {/* Header info */}
                <Flex align="center" gap={4} p={3} bg="gray.50" borderRadius="12px">
                  <Avatar
                    size="lg"
                    name={getTechnicianName(selectedTechnician)}
                    src={getTechnicianImage(selectedTechnician)}
                    border="2px solid"
                    borderColor={customColor}
                  />
                  <Box>
                    <Heading size="md">{getTechnicianName(selectedTechnician)}</Heading>
                    <Flex gap={2} mt={1} flexWrap="wrap">
                      <Badge colorScheme={selectedTechnician.workStatus === "approved" ? "green" : "orange"}>
                        Work: {selectedTechnician.workStatus || "pending"}
                      </Badge>
                      <Badge colorScheme={selectedTechnician.trainingCompleted ? "green" : "orange"}>
                        Training: {selectedTechnician.trainingCompleted ? "Completed" : "Pending"}
                      </Badge>
                      <Badge
                        colorScheme={
                          isTechnicianKYCVerified(selectedTechnician, allKycRecords) ? "green" : "purple"
                        }
                      >
                        KYC: {isTechnicianKYCVerified(selectedTechnician, allKycRecords) ? "Verified" : "Pending"}
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>

                {/* Info Cards */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box p={3} border="1px solid #eee" borderRadius="10px">
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                      CONTACT & LOCATION
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>Mobile:</strong> {selectedTechnician.mobileNumber || selectedTechnician.phone || "N/A"}
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>Email:</strong> {selectedTechnician.email || "N/A"}
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>District (Mandatory):</strong>{" "}
                      {getTechnicianDistrict(selectedTechnician) ? (
                        <Badge colorScheme="teal" px={2} py={0.5} borderRadius="md" textTransform="capitalize" fontWeight="bold">
                          📍 {getTechnicianDistrict(selectedTechnician)}
                        </Badge>
                      ) : (
                        <Badge colorScheme="red" px={2} py={0.5} borderRadius="md">
                          ⚠️ District Missing (Mandatory)
                        </Badge>
                      )}
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>City:</strong> {selectedTechnician.city || selectedTechnician.profile?.city || "N/A"}
                    </Text>
                    <Text fontSize="xs">
                      <strong>Address:</strong> {selectedTechnician.address || selectedTechnician.locality || "N/A"}
                    </Text>
                  </Box>

                  <Box p={3} border="1px solid #eee" borderRadius="10px">
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                      PROFESSIONAL STATS
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>Specialization:</strong> {selectedTechnician.specialization || "General"}
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>Experience:</strong> {selectedTechnician.experienceYears || 0} Years
                    </Text>
                    <Text fontSize="xs" mb={1}>
                      <strong>Total Jobs:</strong> {selectedTechnician.totalJobsCompleted || selectedTechnician.jobStats?.completed || 0}
                    </Text>
                    <Text fontSize="xs">
                      <strong>Rating:</strong> {selectedTechnician.rating?.avg?.toFixed(1) || "0.0"} ({selectedTechnician.rating?.count || 0} reviews)
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Bank Details Summary */}
                {(() => {
                  const kycMatch = findKYCRecord(selectedTechnician, allKycRecords);
                  const b = kycMatch?.bankDetails;
                  return (
                    <Box p={3} border="1px solid #eee" borderRadius="10px">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">
                          PAYOUT BANK ACCOUNT
                        </Text>
                        <Badge colorScheme={isTechnicianBankVerified(selectedTechnician, allKycRecords) ? "green" : "orange"}>
                          {isTechnicianBankVerified(selectedTechnician, allKycRecords) ? "Payouts Enabled" : "Pending Verification"}
                        </Badge>
                      </Flex>
                      {b ? (
                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={2} fontSize="xs">
                          <Text><strong>Holder:</strong> {b.accountHolderName || "N/A"}</Text>
                          <Text><strong>Bank:</strong> {b.bankName || "N/A"}</Text>
                          <Text><strong>A/C:</strong> {b.accountNumber || "N/A"}</Text>
                          <Text><strong>IFSC:</strong> {b.ifscCode || "N/A"}</Text>
                          <Text><strong>UPI:</strong> {b.upiId || "N/A"}</Text>
                        </SimpleGrid>
                      ) : (
                        <Text fontSize="xs" color="gray.400" fontStyle="italic">No bank details added</Text>
                      )}
                    </Box>
                  );
                })()}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100">
            {selectedTechnician && (
              <Flex w="100%" justify="space-between" align="center">
                <Button
                  size="sm"
                  colorScheme={selectedTechnician.trainingCompleted ? "orange" : "teal"}
                  leftIcon={<FaUserGraduate />}
                  onClick={() => handleToggleTraining(selectedTechnician, !selectedTechnician.trainingCompleted)}
                  isLoading={loading}
                >
                  {selectedTechnician.trainingCompleted ? "Mark Training Incomplete" : "Approve Gate 1 Training"}
                </Button>

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<FaIdCard />}
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenKYCModal(selectedTechnician);
                    }}
                  >
                    Review KYC
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="orange"
                    leftIcon={<FaUniversity />}
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenBankModal(selectedTechnician);
                    }}
                  >
                    Review Bank
                  </Button>
                </HStack>
              </Flex>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE CONFIRMATION ALERT */}
      <AlertDialog isOpen={isDeleteDialogOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDeleteDialogOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="14px">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Technician
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <strong>{getTechnicianName(adminToDelete)}</strong>? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)} size="sm">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                size="sm"
                isLoading={isDeleting}
              >
                Confirm Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}

export default AdminManagement;