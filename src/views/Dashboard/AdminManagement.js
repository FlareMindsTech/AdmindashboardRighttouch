// AdminManagement.js - RightTouch Admin Technician Management & Verifications
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
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
  Skeleton,
  SkeletonCircle,
  HStack,
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
import {
  AdminStatsCards,
  KYCReviewModal,
  EditKYCModal,
  BankDetailsModal,
  EditBankModal,
  AdminDetailsModal,
  DeleteTechnicianDialog,
} from "components/AdminManagement";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaSearch,
  FaEye,
  FaUserSlash,
  FaUserGraduate,
  FaTrash,
  FaIdCard,
  FaUniversity,
  FaCheckCircle,
  FaTimesCircle,
  FaEllipsisV,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import DataTable from "components/common/DataTable";
import { MdVerified, MdOutlinePending } from "react-icons/md";
import {
  getKYCFullPII,
  clearAuth,
  getAllDistricts,
} from "views/utils/axiosInstance";
import {
  listOrphanedKyc,
  deleteOrphanedKyc,
  cleanupAllOrphanedKyc,
} from "api/adminKyc";
import { useAppDispatch } from "store/hooks";
import {
  fetchTechnicians,
  fetchKYCRecords,
  fetchKYCDetail,
  setTrainingStatus,
  setWorkStatus,
  verifyTechnicianKYC,
  editTechnicianKYC,
  verifyTechnicianBank,
  editTechnicianBank,
  removeTechnician,
  removeKYC,
} from "store/slices/techniciansSlice";
import { useNavigate } from "react-router-dom";

// High-performance index cache for O(1) KYC record lookups
const kycIndexCache = new WeakMap();

const getKycIndex = (kycRecords) => {
  if (!Array.isArray(kycRecords) || kycRecords.length === 0) return null;
  let index = kycIndexCache.get(kycRecords);
  if (index) return index;

  const byId = new Map();
  const byEmail = new Map();
  const byPhone = new Map();

  for (let i = 0; i < kycRecords.length; i++) {
    const k = kycRecords[i];
    if (!k) continue;

    const kTechId = String(
      k.technicianId?._id ||
      k.technicianId ||
      k.technician?._id ||
      k.technician ||
      ""
    );
    if (kTechId) byId.set(kTechId, k);

    const kUserId = String(
      k.userId?._id ||
      k.userId ||
      k.user?._id ||
      k.user ||
      ""
    );
    if (kUserId) byId.set(kUserId, k);

    const kRecId = String(k._id || k.id || "");
    if (kRecId) byId.set(kRecId, k);

    const kEmail = (k.email || k.userId?.email || k.technicianId?.email || "").toLowerCase().trim();
    if (kEmail) byEmail.set(kEmail, k);

    const kPhone = (k.phone || k.mobileNumber || k.mobile || k.personalDetails?.phone || k.technicianId?.mobileNumber || k.userId?.mobileNumber || "").toString().replace(/\D/g, "");
    if (kPhone && kPhone.length >= 8) {
      byPhone.set(kPhone.slice(-10), k);
    }
  }

  index = { byId, byEmail, byPhone };
  kycIndexCache.set(kycRecords, index);
  return index;
};

// Find matching KYC record for a technician safely with O(1) indexed lookup
const findKYCRecord = (admin, kycRecords = []) => {
  if (!admin) return null;
  const index = getKycIndex(kycRecords);
  if (!index) return null;

  const adminId = String(admin._id || admin.id || "");
  if (adminId && index.byId.has(adminId)) return index.byId.get(adminId);

  const adminUserId = String(
    admin.userId?._id ||
    (typeof admin.userId === "string" ? admin.userId : "") ||
    admin.user?._id ||
    (typeof admin.user === "string" ? admin.user : "") ||
    ""
  );
  if (adminUserId && index.byId.has(adminUserId)) return index.byId.get(adminUserId);

  const adminEmail = (admin.email || admin.userId?.email || "").toLowerCase().trim();
  if (adminEmail && index.byEmail.has(adminEmail)) return index.byEmail.get(adminEmail);

  const adminPhone = (admin.mobileNumber || admin.phone || admin.userId?.mobileNumber || admin.userId?.phone || "").toString().replace(/\D/g, "");
  if (adminPhone && adminPhone.length >= 8) {
    const p10 = adminPhone.slice(-10);
    if (index.byPhone.has(p10)) return index.byPhone.get(p10);
  }

  return null;
};

// Helper to resolve technician name safely
const getTechnicianName = (tech, kycRecords = []) => {
  if (!tech) return "Unknown";
  const isDeleted = (str) =>
    str && typeof str === "string" && (str.startsWith("deleted_") || str.includes("example.invalid"));

  // 1. Direct name properties
  if (tech.name && typeof tech.name === "string" && tech.name.trim() !== "") {
    if (isDeleted(tech.name)) return "Deleted Technician";
    return tech.name.trim();
  }
  if (tech.fullName && typeof tech.fullName === "string" && tech.fullName.trim() !== "") {
    if (isDeleted(tech.fullName)) return "Deleted Technician";
    return tech.fullName.trim();
  }
  if (tech.technicianName && typeof tech.technicianName === "string" && tech.technicianName.trim() !== "") {
    if (isDeleted(tech.technicianName)) return "Deleted Technician";
    return tech.technicianName.trim();
  }
  if (tech.firstName) {
    const fullName = `${tech.firstName} ${tech.lastName || ""}`.trim();
    if (isDeleted(fullName)) return "Deleted Technician";
    if (fullName) return fullName;
  }
  if (tech.fname) {
    const fullName = `${tech.fname} ${tech.lname || ""}`.trim();
    if (isDeleted(fullName)) return "Deleted Technician";
    if (fullName) return fullName;
  }

  // 2. Profile nested object
  if (tech.profile && typeof tech.profile === "object") {
    if (tech.profile.name && typeof tech.profile.name === "string" && tech.profile.name.trim() !== "") {
      if (isDeleted(tech.profile.name)) return "Deleted Technician";
      return tech.profile.name.trim();
    }
    if (tech.profile.fullName && typeof tech.profile.fullName === "string" && tech.profile.fullName.trim() !== "") {
      if (isDeleted(tech.profile.fullName)) return "Deleted Technician";
      return tech.profile.fullName.trim();
    }
    if (tech.profile.firstName) {
      const fullName = `${tech.profile.firstName} ${tech.profile.lastName || ""}`.trim();
      if (isDeleted(fullName)) return "Deleted Technician";
      if (fullName) return fullName;
    }
    if (tech.profile.fname) {
      const fullName = `${tech.profile.fname} ${tech.profile.lname || ""}`.trim();
      if (isDeleted(fullName)) return "Deleted Technician";
      if (fullName) return fullName;
    }
  }

  // 3. userId or user populated object
  const userObj =
    (tech.userId && typeof tech.userId === "object" ? tech.userId : null) ||
    (tech.user && typeof tech.user === "object" ? tech.user : null);
  if (userObj) {
    if (userObj.name && typeof userObj.name === "string" && userObj.name.trim() !== "") {
      if (isDeleted(userObj.name)) return "Deleted Technician";
      return userObj.name.trim();
    }
    if (userObj.fullName && typeof userObj.fullName === "string" && userObj.fullName.trim() !== "") {
      if (isDeleted(userObj.fullName)) return "Deleted Technician";
      return userObj.fullName.trim();
    }
    if (userObj.firstName) {
      const fullName = `${userObj.firstName} ${userObj.lastName || ""}`.trim();
      if (isDeleted(fullName)) return "Deleted Technician";
      if (fullName) return fullName;
    }
    if (userObj.fname) {
      const fullName = `${userObj.fname} ${userObj.lname || ""}`.trim();
      if (isDeleted(fullName)) return "Deleted Technician";
      if (fullName) return fullName;
    }
    if (userObj.username && typeof userObj.username === "string" && userObj.username.trim() !== "") {
      if (isDeleted(userObj.username)) return "Deleted Technician";
      return userObj.username.trim();
    }
  }

  // 4. Personal details object
  if (tech.personalDetails?.name) return tech.personalDetails.name.trim();
  if (tech.personalDetails?.fullName) return tech.personalDetails.fullName.trim();

  // 5. Direct bank account holder name
  if (tech.accountHolderName && typeof tech.accountHolderName === "string" && tech.accountHolderName.trim() !== "") {
    return tech.accountHolderName.trim();
  }
  if (tech.bankDetails?.accountHolderName && typeof tech.bankDetails.accountHolderName === "string" && tech.bankDetails.accountHolderName.trim() !== "") {
    return tech.bankDetails.accountHolderName.trim();
  }

  // 6. Match against KYC records (e.g. verified Bank Account Holder Name)
  if (Array.isArray(kycRecords) && kycRecords.length > 0) {
    const kycMatch = findKYCRecord(tech, kycRecords);
    if (kycMatch) {
      if (kycMatch.bankDetails?.accountHolderName && typeof kycMatch.bankDetails.accountHolderName === "string" && kycMatch.bankDetails.accountHolderName.trim() !== "") {
        return kycMatch.bankDetails.accountHolderName.trim();
      }
      if (kycMatch.fullName && typeof kycMatch.fullName === "string" && kycMatch.fullName.trim() !== "") {
        return kycMatch.fullName.trim();
      }
      if (kycMatch.name && typeof kycMatch.name === "string" && kycMatch.name.trim() !== "") {
        return kycMatch.name.trim();
      }
      if (kycMatch.personalDetails?.name) return kycMatch.personalDetails.name.trim();
      if (kycMatch.personalDetails?.fullName) return kycMatch.personalDetails.fullName.trim();
      if (kycMatch.aadhaarDetails?.name) return kycMatch.aadhaarDetails.name.trim();
      if (kycMatch.panDetails?.name) return kycMatch.panDetails.name.trim();
      if (kycMatch.technicianId && typeof kycMatch.technicianId === "object") {
        const t = kycMatch.technicianId;
        if (t.name) return t.name;
        if (t.fullName) return t.fullName;
        if (t.fname) return `${t.fname} ${t.lname || ""}`.trim();
      }
      if (kycMatch.userId && typeof kycMatch.userId === "object") {
        const u = kycMatch.userId;
        if (u.name) return u.name;
        if (u.fullName) return u.fullName;
        if (u.fname) return `${u.fname} ${u.lname || ""}`.trim();
      }
    }
  }

  // 7. Email prefix fallback
  const email = tech.email || userObj?.email || tech.profile?.email;
  if (email && typeof email === "string" && email.includes("@")) {
    const prefix = email.split("@")[0];
    if (isDeleted(prefix)) return "Deleted Technician";
    return prefix;
  }

  return "Unknown";
};

// Helper to resolve technician phone number safely
const getTechnicianPhone = (tech, kycRecords = []) => {
  if (!tech) return "";
  const candidates = [
    tech.mobileNumber,
    tech.phone,
    tech.mobile,
    tech.phoneNumber,
    tech.contactNumber,
    tech.contact,
    tech.userId?.mobileNumber,
    tech.userId?.phone,
    tech.userId?.mobile,
    tech.userId?.phoneNumber,
    tech.userId?.identifier,
    tech.user?.mobileNumber,
    tech.user?.phone,
    tech.user?.mobile,
    tech.user?.phoneNumber,
    tech.profile?.mobileNumber,
    tech.profile?.phone,
    tech.profile?.mobile,
    tech.profile?.phoneNumber,
    tech.personalDetails?.phone,
    tech.personalDetails?.mobileNumber,
    tech.personalDetails?.contactNumber,
  ];

  for (const c of candidates) {
    if (c && typeof c === "string" && c.trim() !== "" && c.trim().toLowerCase() !== "n/a") {
      return c.trim();
    }
    if (typeof c === "number") {
      return String(c);
    }
  }

  // Check KYC records
  if (Array.isArray(kycRecords) && kycRecords.length > 0) {
    const kycMatch = findKYCRecord(tech, kycRecords);
    if (kycMatch) {
      const kycCandidates = [
        kycMatch.mobileNumber,
        kycMatch.phone,
        kycMatch.mobile,
        kycMatch.phoneNumber,
        kycMatch.contactNumber,
        kycMatch.personalDetails?.phone,
        kycMatch.personalDetails?.mobileNumber,
        kycMatch.bankDetails?.registeredMobileNumber,
        kycMatch.bankDetails?.phone,
        kycMatch.technicianId?.mobileNumber,
        kycMatch.technicianId?.phone,
        kycMatch.userId?.mobileNumber,
        kycMatch.userId?.phone,
        kycMatch.userId?.identifier,
      ];
      for (const kc of kycCandidates) {
        if (kc && typeof kc === "string" && kc.trim() !== "" && kc.trim().toLowerCase() !== "n/a") {
          return kc.trim();
        }
        if (typeof kc === "number") {
          return String(kc);
        }
      }
    }
  }

  return "";
};

// Helper to resolve technician email safely
const getTechnicianEmail = (tech, kycRecords = []) => {
  if (!tech) return "";
  const candidates = [
    tech.email,
    tech.mail,
    tech.userEmail,
    tech.userId?.email,
    tech.userId?.mail,
    tech.user?.email,
    tech.profile?.email,
    tech.personalDetails?.email,
  ];

  for (const c of candidates) {
    if (c && typeof c === "string" && c.includes("@") && !c.includes("example.invalid")) {
      return c.trim();
    }
  }

  if (Array.isArray(kycRecords) && kycRecords.length > 0) {
    const kycMatch = findKYCRecord(tech, kycRecords);
    if (kycMatch) {
      const kycEmailCandidates = [
        kycMatch.email,
        kycMatch.personalDetails?.email,
        kycMatch.userId?.email,
        kycMatch.technicianId?.email,
      ];
      for (const kc of kycEmailCandidates) {
        if (kc && typeof kc === "string" && kc.includes("@") && !kc.includes("example.invalid")) {
          return kc.trim();
        }
      }
    }
  }

  return "";
};

// Helper to resolve technician address safely
const getTechnicianAddress = (tech, kycRecords = []) => {
  if (!tech) return "N/A";
  const rawAddr =
    tech.address ||
    tech.locality ||
    tech.profile?.address ||
    tech.userId?.address ||
    tech.user?.address ||
    "";

  if (typeof rawAddr === "string" && rawAddr.trim()) return rawAddr.trim();
  if (typeof rawAddr === "object" && rawAddr !== null) {
    const parts = [
      rawAddr.line1 || rawAddr.street || rawAddr.addressLine1 || rawAddr.house,
      rawAddr.line2 || rawAddr.addressLine2 || rawAddr.area,
      rawAddr.city || rawAddr.district,
      rawAddr.pincode || rawAddr.zip || rawAddr.postalCode,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }

  // Check KYC
  if (Array.isArray(kycRecords) && kycRecords.length > 0) {
    const kycMatch = findKYCRecord(tech, kycRecords);
    if (kycMatch?.address) {
      if (typeof kycMatch.address === "string" && kycMatch.address.trim()) return kycMatch.address.trim();
      if (typeof kycMatch.address === "object") {
        const parts = [
          kycMatch.address.line1 || kycMatch.address.street,
          kycMatch.address.city,
          kycMatch.address.pincode,
        ].filter(Boolean);
        if (parts.length > 0) return parts.join(", ");
      }
    }
  }

  return "N/A";
};

// Helper to resolve technician specialization formatted cleanly
const getTechnicianSpecialization = (tech) => {
  if (!tech) return "General";
  const spec = tech.specialization || tech.profile?.specialization || "General";
  if (typeof spec !== "string") return "General";
  const trimmed = spec.trim();
  if (trimmed.toLowerCase() === "ac") return "AC Service";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
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

const getTechnicianImage = (tech, kycRecords = []) => {
  if (!tech) return "";
  const direct =
    tech?.profileImage ||
    tech?.profile?.profileImage ||
    (typeof tech?.userId === "object" ? tech?.userId?.profileImage : "") ||
    "";
  if (direct) return direct;
  if (Array.isArray(kycRecords) && kycRecords.length > 0) {
    const kycMatch = findKYCRecord(tech, kycRecords);
    if (kycMatch?.profileImage) return kycMatch.profileImage;
    if (kycMatch?.documents?.profileUrl) return kycMatch.documents.profileUrl;
  }
  return "";
};

const getImageUrl = (urlData) => {
  if (!urlData) return "";
  const url = Array.isArray(urlData) ? urlData[0] : urlData;
  if (typeof url !== "string") return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${process.env.REACT_APP_API_BASE_URL || "https://righttouchservernew-727889857503.asia-south1.run.app"}/${url}`;
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

function AdminManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const customColor = "#008080";
  const customHoverColor = "#006666";
  const customBorderColor = "gray.200";

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

  // Orphaned KYC maintenance (KYC docs with no linked technician)
  // GET/DELETE /admin/kyc/orphaned/*
  const [orphanedKyc, setOrphanedKyc] = useState([]);
  const [orphanedOpen, setOrphanedOpen] = useState(false);
  const [orphanedLoading, setOrphanedLoading] = useState(false);

  const fetchOrphanedKyc = async () => {
    setOrphanedLoading(true);
    try {
      const { data, error } = await listOrphanedKyc();
      if (error) throw new Error(error);
      const list = data?.result ?? data?.data ?? data ?? [];
      setOrphanedKyc(Array.isArray(list) ? list : list?.records ?? []);
    } catch (e) {
      toast({
        title: "Orphaned KYC Error",
        description: e.message || "Failed to load orphaned KYC records.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setOrphanedLoading(false);
    }
  };

  const handleDeleteOrphanedKyc = async (kycId) => {
    try {
      const { error } = await deleteOrphanedKyc(kycId);
      if (error) throw new Error(error);
      toast({ title: "Orphaned KYC Deleted", status: "success", duration: 2500, isClosable: true });
      fetchOrphanedKyc();
    } catch (e) {
      toast({ title: "Delete Error", description: e.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleCleanupAllOrphanedKyc = async () => {
    try {
      const { error } = await cleanupAllOrphanedKyc();
      if (error) throw new Error(error);
      toast({ title: "Orphaned KYC Cleaned Up", status: "success", duration: 2500, isClosable: true });
      fetchOrphanedKyc();
    } catch (e) {
      toast({ title: "Cleanup Error", description: e.message, status: "error", duration: 3000, isClosable: true });
    }
  };
  const isMountedRef = useRef(true);
  const dispatch = useAppDispatch();

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

  // 2. Fetch Technicians and KYC Data (CRUD page: force fresh reads via
  // shared thunks; parsing/sorting/guards below are unchanged)
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    setTableLoading(true);
    try {
      const [adminsResult, kycResult, distResult] = await Promise.allSettled([
        dispatch(fetchTechnicians({ force: true })).unwrap().then((r) => r.list),
        dispatch(fetchKYCRecords({ force: true })).unwrap().then((r) => r.list),
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
        const sortedAdmins = [...admins].sort(
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

  // Stats calculation - Single O(N) pass with O(1) indexed KYC lookups
  const totalCount = adminData.length;
  const {
    newTechCount,
    newUnverifiedCount,
    activeTechCount,
    kycVerifiedCount,
    kycUnverifiedCount,
    bankVerifiedCount,
    bankUnverifiedCount,
  } = useMemo(() => {
    let newTech = 0;
    let newUnverified = 0;
    let activeTech = 0;
    let kycVerified = 0;
    let kycUnverified = 0;
    let bankVerified = 0;
    let bankUnverified = 0;

    for (let i = 0; i < adminData.length; i++) {
      const a = adminData[i];
      const isNew = isNewTechnician(a, allKycRecords);
      const isKYCVer = isTechnicianKYCVerified(a, allKycRecords);
      const isBankVer = isTechnicianBankVerified(a, allKycRecords);
      const isActive = isActiveTechnician(a, allKycRecords);

      if (isNew) {
        newTech++;
        if (!isKYCVer || !isBankVer) newUnverified++;
      }
      if (isActive) activeTech++;
      if (isKYCVer) kycVerified++; else kycUnverified++;
      if (isBankVer) bankVerified++; else bankUnverified++;
    }

    return {
      newTechCount: newTech,
      newUnverifiedCount: newUnverified,
      activeTechCount: activeTech,
      kycVerifiedCount: kycVerified,
      kycUnverifiedCount: kycUnverified,
      bankVerifiedCount: bankVerified,
      bankUnverifiedCount: bankUnverified,
    };
  }, [adminData, allKycRecords]);

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
        const fullName = getTechnicianName(admin, allKycRecords).toLowerCase();
        const email = (getTechnicianEmail(admin, allKycRecords) || "").toLowerCase();
        const spec = (getTechnicianSpecialization(admin) || "").toLowerCase();
        const city = (admin.city || admin.profile?.city || admin.locality || "").toLowerCase();
        const district = getTechnicianDistrict(admin).toLowerCase();
        const phone = (getTechnicianPhone(admin, allKycRecords) || "").toString().replace(/[\s-]/g, "");
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
      await dispatch(setTrainingStatus({ id: tech._id, completed: nextStatus })).unwrap();
      toast({
        title: nextStatus ? "Training Approved" : "Training Incomplete",
        description: `Technician ${getTechnicianName(tech, allKycRecords)} marked as ${nextStatus ? "Training Completed" : "Training Incomplete"}.`,
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
      await dispatch(setWorkStatus({
        technicianId: tech._id,
        workStatus: workStatus,
        trainingCompleted: tech.trainingCompleted ?? true,
      })).unwrap();
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
      const { detail } = await dispatch(fetchKYCDetail(tech._id)).unwrap();
      setKYCData(detail);
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
      await dispatch(verifyTechnicianKYC({
        technicianId: selectedTechForKYC._id,
        status: status,
        rejectionReason: status === "rejected" ? rejectionInput : null,
      })).unwrap();
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
      await dispatch(editTechnicianKYC({ id: selectedTechForKYC._id, body: kycEditForm })).unwrap();
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
      await dispatch(verifyTechnicianBank({
        technicianId: selectedTechForBank._id,
        verified: verified,
        bankRejectionReason: !verified ? bankRejectionReason : null,
      })).unwrap();
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
      await dispatch(editTechnicianBank({ id: selectedTechForBank._id, body: bankEditForm })).unwrap();
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
      await dispatch(removeTechnician({ id: adminToDelete._id })).unwrap();
      toast({
        title: "Technician Deleted",
        description: `${getTechnicianName(adminToDelete, allKycRecords)} has been removed.`,
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
      <AdminStatsCards
        activeTab={activeTab}
        onCardClick={handleCardClick}
        loading={loading}
        counts={{
          totalCount,
          newTechCount,
          newUnverifiedCount,
          activeTechCount,
          kycVerifiedCount,
          kycUnverifiedCount,
          bankVerifiedCount,
          bankUnverifiedCount,
        }}
        customColor={customColor}
        customBorderColor={customBorderColor}
        textColor={textColor}
      />

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
                    _active={{ bg: "#004d4d", color: "white" }}
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
            <DataTable
              keyExtractor={(tech) => tech._id}
              rows={currentItems}
              isLoading={tableLoading}
              emptyIcon={FaSearch}
              emptyTitle="No technicians match the selected filters"
              emptyDescription="Try clearing the search query or switching to All Technicians."
              emptyAction={
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
              }
              pagination={
                tableLoading || currentItems.length === 0
                  ? undefined
                  : {
                      page: currentPage,
                      totalPages: totalPages || 1,
                      totalRows: filteredData.length,
                      indexOfFirst: indexOfFirstItem,
                      indexOfLast: Math.min(indexOfLastItem, filteredData.length),
                      rowsPerPage: itemsPerPage,
                      onPageChange: setCurrentPage,
                      showRowsPerPage: false,
                      label: "technicians",
                    }
              }
              columns={[
                {
                  key: "technicianProfile",
                  label: "Technician Profile",
                  minWidth: "190px",
                  cell: (tech) => (
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
                        name={getTechnicianName(tech, allKycRecords)}
                        src={getTechnicianImage(tech, allKycRecords)}
                        mr={3}
                        border="1px solid"
                        borderColor={customColor}
                      />
                      <Box maxW="150px">
                        <Text fontWeight="bold" color="gray.800" fontSize="sm" isTruncated title={getTechnicianName(tech, allKycRecords)}>
                          {getTechnicianName(tech, allKycRecords)}
                        </Text>
                        <Flex align="center" gap={1} mt={0.5}>
                          <Text fontSize="xs" color="gray.500" isTruncated maxW="110px">
                            {getTechnicianPhone(tech, allKycRecords) || getTechnicianEmail(tech, allKycRecords) || "No contact"}
                          </Text>
                          {tech.availability?.isOnline && (
                            <Badge colorScheme="green" fontSize="9px" px={1} borderRadius="full" flexShrink={0}>
                              Online
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                  ),
                },
                {
                  key: "skill",
                  label: "Skill / Experience",
                  minWidth: "140px",
                  cell: (tech) => (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.700" isTruncated maxW="140px">
                        {getTechnicianSpecialization(tech)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {tech.experienceYears || tech.profile?.experienceYears || "0"} Years Exp
                      </Text>
                    </Box>
                  ),
                },
                {
                  key: "district",
                  label: "District *",
                  minWidth: "140px",
                  cell: (tech) =>
                    getTechnicianDistrict(tech) ? (
                      <Badge colorScheme="teal" px={2.5} py={1} borderRadius="md" textTransform="capitalize" fontWeight="bold" fontSize="2xs">
                        📍 {getTechnicianDistrict(tech)}
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" px={2} py={0.5} borderRadius="md" variant="solid" fontSize="2xs">
                        ⚠️ District Missing
                      </Badge>
                    ),
                },
                {
                  key: "city",
                  label: "City",
                  minWidth: "100px",
                  cell: (tech) => (
                    <Text fontSize="xs" color="gray.700" fontWeight="medium" textTransform="capitalize">
                      {tech.city || tech.profile?.city || tech.locality || "N/A"}
                    </Text>
                  ),
                },
                {
                  key: "training",
                  label: "Gate 1: Training",
                  align: "center",
                  minWidth: "150px",
                  cell: (tech) => (
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
                  ),
                },
                {
                  key: "kyc",
                  label: "Gate 2: KYC",
                  align: "center",
                  minWidth: "140px",
                  cell: (tech) => {
                    const kycRecord = findKYCRecord(tech, allKycRecords);
                    const isKycVer = isTechnicianKYCVerified(tech, allKycRecords);
                    const kycStatus =
                      kycRecord?.status?.toLowerCase() ||
                      kycRecord?.verificationStatus?.toLowerCase() ||
                      "pending";
                    return (
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
                    );
                  },
                },
                {
                  key: "bank",
                  label: "Gate 3: Bank Payout",
                  align: "center",
                  minWidth: "140px",
                  cell: (tech) => {
                    const kycRecord = findKYCRecord(tech, allKycRecords);
                    const isBankVer = isTechnicianBankVerified(tech, allKycRecords);
                    return (
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
                    );
                  },
                },
                {
                  key: "workStatus",
                  label: "Work Status",
                  align: "center",
                  minWidth: "130px",
                  cell: (tech) => (
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
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  align: "right",
                  minWidth: "170px",
                  thProps: { pr: 6 },
                  cell: (tech) => (
                    <HStack spacing={1.5} justify="flex-end" align="center">
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
                  ),
                },
              ]}
            />
          </CardBody>
        </Card>
      </Box>

      {/* ORPHANED KYC MAINTENANCE (KYC docs with no linked technician) */}
      <Box px={{ base: 2, md: 4 }} pb={4}>
        <Card bg="white" shadow="lg" borderRadius="16px" border="1px solid" borderColor={customBorderColor}>
          <CardHeader p="16px" pb="8px">
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <Box>
                <Heading size="sm" color="gray.800">
                  🧹 Orphaned KYC Records
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Identity documents with no linked technician account.
                </Text>
              </Box>
              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => {
                    setOrphanedOpen((v) => !v);
                    if (!orphanedOpen) fetchOrphanedKyc();
                  }}
                >
                  {orphanedOpen ? "Hide" : "Review Orphans"}
                </Button>
                {orphanedOpen && orphanedKyc.length > 0 && (
                  <Button size="xs" colorScheme="red" variant="outline" onClick={handleCleanupAllOrphanedKyc}>
                    Cleanup All
                  </Button>
                )}
              </HStack>
            </Flex>
          </CardHeader>
          {orphanedOpen && (
            <CardBody pt={0}>
              {orphanedLoading ? (
                <Flex justify="center" py={6}>
                  <Spinner size="md" color={customColor} />
                </Flex>
              ) : orphanedKyc.length === 0 ? (
                <Text fontSize="sm" color="gray.500" py={4} textAlign="center">
                  No orphaned KYC records. Storage is clean.
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>KYC ID</Th>
                        <Th>Name / Identifier</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orphanedKyc.map((k) => (
                        <Tr key={k._id || k.kycId || k.id}>
                          <Td fontSize="xs" fontFamily="mono">{k._id || k.kycId || k.id || "—"}</Td>
                          <Td fontSize="sm">{k.name || k.aadhaarNumber || k.phone || "—"}</Td>
                          <Td fontSize="xs">{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}</Td>
                          <Td>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<FaTrash />}
                              onClick={() => handleDeleteOrphanedKyc(k._id || k.kycId || k.id)}
                            >
                              Delete
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          )}
        </Card>
      </Box>

      {/* KYC IDENTITY REVIEW & EDIT MODAL */}
      <KYCReviewModal
        isOpen={isKYCModalOpen}
        onClose={() => setIsKYCModalOpen(false)}
        selectedTechForKYC={selectedTechForKYC}
        allKycRecords={allKycRecords}
        kycData={kycData}
        kycLoading={kycLoading}
        isUnmaskedPII={isUnmaskedPII}
        onToggleUnmaskedPII={handleToggleUnmaskedPII}
        onOpenEditKYC={handleOpenEditKYC}
        onDeleteKYC={async () => {
          if (window.confirm("Are you sure you want to delete this KYC record?")) {
            await dispatch(removeKYC({ id: selectedTechForKYC._id })).unwrap();
            setIsKYCModalOpen(false);
            await fetchData();
          }
        }}
        showRejectionInput={showRejectionInput}
        setShowRejectionInput={setShowRejectionInput}
        rejectionInput={rejectionInput}
        setRejectionInput={setRejectionInput}
        onVerifyKYCAction={handleVerifyKYCAction}
        isTechnicianKYCVerified={isTechnicianKYCVerified}
        getTechnicianName={getTechnicianName}
        getImageUrl={getImageUrl}
        customColor={customColor}
      />

      {/* EDIT KYC NUMBERS MODAL */}
      <EditKYCModal
        isOpen={isEditKYCOpen}
        onClose={() => setIsEditKYCOpen(false)}
        kycEditForm={kycEditForm}
        setKycEditForm={setKycEditForm}
        onSave={handleSaveKYCEdit}
        isLoading={savingKycEdit}
      />

      {/* BANK & PAYOUT DETAILS MODAL */}
      <BankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        selectedTechForBank={selectedTechForBank}
        allKycRecords={allKycRecords}
        onOpenEditBank={() => setIsEditBankOpen(true)}
        showBankRejection={showBankRejection}
        setShowBankRejection={setShowBankRejection}
        bankRejectionReason={bankRejectionReason}
        setBankRejectionReason={setBankRejectionReason}
        onVerifyBankAction={handleVerifyBankAction}
        loading={loading}
        isTechnicianBankVerified={isTechnicianBankVerified}
        findKYCRecord={findKYCRecord}
        getTechnicianName={getTechnicianName}
      />

      {/* EDIT BANK DETAILS MODAL */}
      <EditBankModal
        isOpen={isEditBankOpen}
        onClose={() => setIsEditBankOpen(false)}
        bankEditForm={bankEditForm}
        setBankEditForm={setBankEditForm}
        onSave={handleSaveBankEdit}
        isLoading={savingBankEdit}
      />

      {/* TECHNICIAN FULL PROFILE DETAILS MODAL */}
      <AdminDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        selectedTechnician={selectedTechnician}
        allKycRecords={allKycRecords}
        onToggleTraining={handleToggleTraining}
        onOpenKYCModal={handleOpenKYCModal}
        onOpenBankModal={handleOpenBankModal}
        loading={loading}
        customColor={customColor}
        getTechnicianName={getTechnicianName}
        getTechnicianImage={getTechnicianImage}
        isTechnicianKYCVerified={isTechnicianKYCVerified}
        isTechnicianBankVerified={isTechnicianBankVerified}
        findKYCRecord={findKYCRecord}
        getTechnicianPhone={getTechnicianPhone}
        getTechnicianEmail={getTechnicianEmail}
        getTechnicianDistrict={getTechnicianDistrict}
        getTechnicianAddress={getTechnicianAddress}
        getTechnicianSpecialization={getTechnicianSpecialization}
      />

      {/* DELETE CONFIRMATION ALERT */}
      <DeleteTechnicianDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        cancelRef={cancelRef}
        adminToDelete={adminToDelete}
        allKycRecords={allKycRecords}
        getTechnicianName={getTechnicianName}
        onConfirmDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Flex>
  );
}

export default AdminManagement;