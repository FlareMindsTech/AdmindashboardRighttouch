  import React, { useState, useEffect, useCallback, useMemo } from "react";
  import {
    Box,
    Button,
    Flex,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useToast,
    Text,
    Heading,
    IconButton,
    Spinner,
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
    Textarea,
    Switch,
    FormControl,
    FormLabel,
    VStack,
    HStack,
    Select,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Tag,
    Tooltip,
    Divider,
    Progress,
  } from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import DistrictMap, { TAMIL_NADU_CITIES, generateCircularGeoJSON } from "components/Map/DistrictMap.js";
import ZoneMap from "components/Map/ZoneMap.js";

  import {
    FaChevronLeft,
    FaChevronRight,
    FaUserGear,
  } from "react-icons/fa6";
  import {
    MdMap,
    MdAdd,
    MdEdit,
    MdDelete,
    MdVisibility,
    MdLink,
    MdRefresh,
    MdLocationOn,
    MdPlace,
    MdCheckCircle,
    MdPersonAdd,
    MdApartment,
    MdClear,
    MdSearch,
    MdFilterList,
    MdCheckCircleOutline,
    MdErrorOutline,
    MdSecurity,
    MdSpeed,
    MdRadar,
    MdVerified,
    MdRule,
    MdLayers,
    MdReportProblem,
    MdHistory,
    MdAccountTree,
    MdAnalytics,
    MdGpsFixed,
    MdLocationCity,
    MdAddCircleOutline,
    MdInfoOutline,
  } from "react-icons/md";

  import {
    createZone,
    getAllZones,
    updateZone,
    deleteZone,
    getAllZoneMappings,
    deleteZoneMapping,
    getAllOperationalCities,
    getAllServices,
    getAllDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    toggleDistrictStatus,
    toggleDistrictRegistration,
    toggleDistrictJobs,
    getDistrictTechnicians,
    activateOperationalCity,
    deleteDistrict,
    getAllTechnicians,
    getTechnicianDistricts,
    addTechnicianDistrictPermission,
    toggleTechnicianDistrictPermission,
    removeTechnicianDistrictPermission,
    getTechnicianZonePermissions,
    enableTechnicianZonePermission,
    disableTechnicianZonePermission,
    listTechniciansGeofenceStatus,
    getTechnicianGeofenceDetails,
    updateTechnicianGeofenceVerification,
    validateGeofencePolygon,
    checkPolygonOverlap,
    checkParentBoundaryContainment,
    checkTechnicianJobEligibility,
    diagnoseDistanceAndGeofence,
    debugUnavailability,
    getLiveGeofenceMonitoring,
    getZoneHealthDashboard,
    getSpatialHierarchy,
    getZoneImpactAnalysis,
    getDistrictDashboardDetails,
    inspectActiveJobLocation,
    auditJobBroadcast,
    rollbackPolygonVersion,
    getDispatchDebug,
  getServiceZoneMatrix,
  getServiceZoneDetail,
  toggleZoneAvailability,
  bulkToggleZoneAvailability,
  clearDistrictZoneAvailability,
  toggleServiceStatus,
  toggleZoneServices,
  createServiceAvailability,
  updateServiceAvailability,
  updateTechnicianProfile,
    bulkCreateZoneMappings,
    resolveCustomerZone,
    checkCustomerServiceAvailability,
    getAllCategories,
  } from "../utils/axiosInstance";

  // ---------------------------------------------------------------------------
  // Design tokens — kept local so this screen stays visually consistent with
  // itself even as the rest of the dashboard evolves.
  // ---------------------------------------------------------------------------
  const BRAND = "#008080";
  const BRAND_DARK = "#00696B";
  const INK = "#1A202C";
  const SURFACE_BORDER = "#E5E9EC";
  const SURFACE_MUTED = "#F7F9FA";

  const STATUS_COLORS = {
    active: { fg: "#0F7B4C", bg: "#E6F6EE", ring: "#0F7B4C" },
    inactive: { fg: "#B42318", bg: "#FDEDEC", ring: "#B42318" },
    neutral: { fg: "#64748B", bg: "#F1F5F9", ring: "#CBD5E1" },
  };

  export default function CityZones() {
    const textColor = useColorModeValue("gray.800", "white");
    const rawToast = useToast();
    const toast = useCallback(
      (options) =>
        rawToast({
          position: "top-right",
          isClosable: true,
          duration: 4000,
          ...options,
        }),
      [rawToast]
    );
    const cancelRef = React.useRef();

    const [districtModalError, setDistrictModalError] = useState("");
    const [zoneModalError, setZoneModalError] = useState("");

    const [currentUser, setCurrentUser] = useState(null);
    const [selectedMapDistrictId, setSelectedMapDistrictId] = useState("all");
    const [selectedMapZoneId, setSelectedMapZoneId] = useState("all");
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [selectedZoneDetails, setSelectedZoneDetails] = useState(null);
    const [showDistrictBoundaries, setShowDistrictBoundaries] = useState(true);
    const [showSubZones, setShowSubZones] = useState(true);
    const [showTechnicianRadii, setShowTechnicianRadii] = useState(true);
    const [showCustomerPins, setShowCustomerPins] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Core Data
    const [districts, setDistricts] = useState([]);
    const [zones, setZones] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [cities, setCities] = useState([]);
    const [services, setServices] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [districtFilter, setDistrictFilter] = useState("all"); // 'all' | 'active' | 'inactive' | districtId
    const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");
    const [permissionFilter, setPermissionFilter] = useState("all"); // 'all' | 'multi_district' | 'single_district'
    const [selectedZoneStatusFilter, setSelectedZoneStatusFilter] = useState("all");
    // Per-tab pagination — shared currentPage caused stale pages when switching
    // between districts / zones / matrix / technicians of different sizes.
    const [pageByTab, setPageByTab] = useState({ 0: 1, 1: 1, 2: 1, 3: 1 });
    const currentPage = pageByTab[activeTab] || 1;
    const setCurrentPage = (v) =>
      setPageByTab((prev) => ({ ...prev, [activeTab]: typeof v === "function" ? v(prev[activeTab] || 1) : v }));
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // District Modal State
    const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
    const [isEditingDistrict, setIsEditingDistrict] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const initialDistrictForm = {
      name: "",
      city: "",
      state: "",
      country: "India",
      code: "",
      active: true,
      isRegistrationEnabled: true,
      isJobEnabled: true,
      polygonCoordinates: "",
    };
    const [districtFormData, setDistrictFormData] = useState(initialDistrictForm);

    // Live District Map Modal State
    const [isViewMapModalOpen, setIsViewMapModalOpen] = useState(false);
    const [viewMapDistrict, setViewMapDistrict] = useState(null);

    // District Technicians Modal
    const [isDistrictTechModalOpen, setIsDistrictTechModalOpen] = useState(false);
    const [districtTechList, setDistrictTechList] = useState([]);
    const [viewingDistrictName, setViewingDistrictName] = useState("");

    // Zone Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);
    const initialForm = {
      operationalCityId: "",
      name: "",
      zoneCode: "",
      description: "",
      active: true,
      polygonCoordinates: "",
    };
    const [formData, setFormData] = useState(initialForm);

    // Delete Dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Technician Permission Modal State
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedTechForPermission, setSelectedTechForPermission] = useState(null);
    const [techServiceRadius, setTechServiceRadius] = useState(10);
    const [techPermissions, setTechPermissions] = useState(null);
    const [techZonePermissions, setTechZonePermissions] = useState(null);
    const [selectedDistrictToGrant, setSelectedDistrictToGrant] = useState("");
    const [districtGrantReason, setDistrictGrantReason] = useState("");
    const [zoneGrantReason, setZoneGrantReason] = useState("");

    // Technician Geofence Verification State
    const [techGeofenceDetail, setTechGeofenceDetail] = useState(null);
    const [isTechGeofenceLoading, setIsTechGeofenceLoading] = useState(false);
    const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);
    const [techLocationVerified, setTechLocationVerified] = useState(true);
    const [techOverrideMismatch, setTechOverrideMismatch] = useState(false);
    const [techVerificationNotes, setTechVerificationNotes] = useState("");

    // --- DIAGNOSTICS & MONITORING STATES (TAB 4) ---
    const [subDiagnosticsTab, setSubDiagnosticsTab] = useState(0); // 0: Spatial Hierarchy, 1: District Live Dashboard, 2: Zone Health & Monitor, 3: 12-Step Eligibility & Inspect, 4: Dispatch Debug & Rollback

    // Spatial Hierarchy Tree
    const [spatialTree, setSpatialTree] = useState([]);
    const [isLoadingSpatialTree, setIsLoadingSpatialTree] = useState(false);

    // District Dashboard & Impact Analysis
    const [selectedDashboardDistrictId, setSelectedDashboardDistrictId] = useState("");
    const [districtDashboardData, setDistrictDashboardData] = useState(null);
    const [impactAnalysisData, setImpactAnalysisData] = useState(null);
    const [isLoadingDistrictDashboard, setIsLoadingDistrictDashboard] = useState(false);

    // Job Geofence Location Inspector & Broadcast Audit
    const [inspectJobId, setInspectJobId] = useState("");
    const [jobLocationInspectData, setJobLocationInspectData] = useState(null);
    const [broadcastAuditData, setBroadcastAuditData] = useState(null);
    const [isInspectingJob, setIsInspectingJob] = useState(false);

    // Dispatch Health & Diagnostics Debug
    const [debugDistrictId, setDebugDistrictId] = useState("");
    const [debugServiceId, setDebugServiceId] = useState("");
    const [dispatchDebugData, setDispatchDebugData] = useState(null);
    const [isLoadingDispatchDebug, setIsLoadingDispatchDebug] = useState(false);

    // Polygon Rollback
    const [rollbackEntityType, setRollbackEntityType] = useState("OperationalCity");
    const [rollbackEntityId, setRollbackEntityId] = useState("");
    const [rollbackVersion, setRollbackVersion] = useState(1);
    const [rollbackReason, setRollbackReason] = useState("Reverting unexpected polygon boundary revision");
    const [isRollingBack, setIsRollingBack] = useState(false);

    // Customer Location & Serviceability Resolution Test (Section 3 Endpoints)
    const [customerTestLat, setCustomerTestLat] = useState("11.0168");
    const [customerTestLng, setCustomerTestLng] = useState("76.9558");
    const [customerTestServiceId, setCustomerTestServiceId] = useState("");
    const [customerTestResult, setCustomerTestResult] = useState(null);
    const [isTestingCustomerService, setIsTestingCustomerService] = useState(false);

    // GeoJSON Tools State
    const [geoToolPolygon, setGeoToolPolygon] = useState(`{
    "type": "Polygon",
    "coordinates": [
      [
        [80.20, 12.97],
        [80.25, 12.97],
        [80.25, 13.02],
        [80.20, 13.02],
        [80.20, 12.97]
      ]
    ]
  }`);
    const [geoToolDistrictId, setGeoToolDistrictId] = useState("");
    const [geoValidationResult, setGeoValidationResult] = useState(null);
    const [isValidatingGeo, setIsValidatingGeo] = useState(false);

    // Dispatch Eligibility Diagnostics State
    const [diagTechId, setDiagTechId] = useState("");
    const [diagServiceId, setDiagServiceId] = useState("");
    const [diagJobLat, setDiagJobLat] = useState("11.0168");
    const [diagJobLng, setDiagJobLng] = useState("76.9558");
    const [diagBookingId, setDiagBookingId] = useState("");
    const [diagResult, setDiagResult] = useState(null);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [unavailBookingId, setUnavailBookingId] = useState("");
    const [unavailResult, setUnavailResult] = useState(null);
    const [isDebugUnavail, setIsDebugUnavail] = useState(false);

    // Zone Health & Monitoring State
    const [healthData, setHealthData] = useState(null);
    const [liveMonitorData, setLiveMonitorData] = useState(null);
    const [isHealthLoading, setIsHealthLoading] = useState(false);

    // Service-Zone Matrix & Checklist States (Tab 2)
    const [matrixData, setMatrixData] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [matrixCategoryFilter, setMatrixCategoryFilter] = useState("ALL");
    const [matrixDistrictFilter, setMatrixDistrictFilter] = useState("ALL");
    const [matrixZoneStatusFilter, setMatrixZoneStatusFilter] = useState("ALL");
    const [matrixServiceStatusFilter, setMatrixServiceStatusFilter] = useState("ALL");
    const [matrixSearch, setMatrixSearch] = useState("");
    const [showAllChecked, setShowAllChecked] = useState(true);

    // Manage Service Zone Mapping Modal State
    const [isManageServiceModalOpen, setIsManageServiceModalOpen] = useState(false);
    const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);
    const [selectedDistrictTab, setSelectedDistrictTab] = useState(null);
    const [isServiceDetailLoading, setIsServiceDetailLoading] = useState(false);
    const [modalZoneSearch, setModalZoneSearch] = useState("");
    const [modalZoneStatusFilter, setModalZoneStatusFilter] = useState("ALL");
    const [selectedZoneIds, setSelectedZoneIds] = useState([]);
    const [togglingDistrictId, setTogglingDistrictId] = useState(null);
    const [togglingZoneId, setTogglingZoneId] = useState(null);
    const [isTogglingServiceStatus, setIsTogglingServiceStatus] = useState(false);

    // Confirmation Dialog State
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
      type: "", // 'SINGLE_ZONE_ENABLE' | 'SINGLE_ZONE_DISABLE' | 'BULK_ENABLE' | 'BULK_DISABLE' | 'CLEAR_ALL' | 'TOGGLE_SERVICE'
      title: "",
      description: "",
      payload: null,
    });
    const [isConfirmingAction, setIsConfirmingAction] = useState(false);

    const globalScrollbarStyles = {
      scrollbarWidth: "thin",
      scrollbarColor: "#cbd5e1 #f8fafc",
      "&::-webkit-scrollbar": { width: "6px", height: "6px" },
      "&::-webkit-scrollbar-track": { background: "#f8fafc", borderRadius: "4px" },
      "&::-webkit-scrollbar-thumb": {
        background: "#cbd5e1",
        borderRadius: "4px",
      },
      "&:hover::-webkit-scrollbar-thumb": { background: "#94a3b8" },
    };

    const stats = {
      totalDistricts: districts.length,
      activeDistricts: districts.filter((d) => d.active !== false && d.isActive !== false).length,
      totalZones: zones.length,
      activeZones: zones.filter((z) => z.active !== false).length,
      totalMappings: mappings.length,
      totalTechnicians: technicians.length,
    };

    const fetchData = useCallback(async () => {
      try {
        setIsLoading(true);
        const [districtsData, zonesData, mappingsData, citiesData, servicesData, techData] = await Promise.all([
          getAllDistricts().catch(() => ({ result: [], data: [], districts: [] })),
          getAllZones(1, 100).catch(() => ({ result: [], data: [], zones: [] })),
          getAllZoneMappings(1, 200).catch(() => ({ result: [], data: [], mappings: [] })),
          getAllOperationalCities().catch(() => ({ result: [], data: [], cities: [] })),
          getAllServices().catch(() => ({ result: [], data: [], services: [] })),
          getAllTechnicians().catch(() => ({ result: [], data: [], technicians: [] })),
        ]);

        const districtsRaw = (districtsData.result || districtsData.districts || districtsData.data || districtsData || []).slice();
        districtsRaw.sort((a, b) => (a.name || a.city || "").localeCompare(b.name || b.city || ""));

        const zonesRaw = (zonesData.result || zonesData.data || zonesData.zones || zonesData || []).slice();
        zonesRaw.sort((a, b) => (a.name || a.zoneCode || "").localeCompare(b.name || b.zoneCode || ""));

        const mappingsRaw = mappingsData.result || mappingsData.data || mappingsData.mappings || mappingsData || [];

        const citiesRaw = (citiesData.result || citiesData.data || citiesData.cities || citiesData || []).slice();
        citiesRaw.sort((a, b) => (a.name || a.city || "").localeCompare(b.name || b.city || ""));

        const servicesRaw = (servicesData.result || servicesData.data || servicesData.services || servicesData || []).slice();
        servicesRaw.sort((a, b) => (a.name || a.serviceName || "").localeCompare(b.name || b.serviceName || ""));

        const techRaw = (techData.result || techData.data || techData.technicians || techData || []).slice();
        techRaw.sort((a, b) => {
          const nameA = `${a.fname || a.userId?.fname || ""} ${a.lname || a.userId?.lname || ""}`.trim();
          const nameB = `${b.fname || b.userId?.fname || ""} ${b.lname || b.userId?.lname || ""}`.trim();
          return nameA.localeCompare(nameB);
        });

        setDistricts(Array.isArray(districtsRaw) ? districtsRaw : []);
        setZones(Array.isArray(zonesRaw) ? zonesRaw : []);
        setMappings(Array.isArray(mappingsRaw) ? mappingsRaw : []);
        setCities(Array.isArray(citiesRaw) ? citiesRaw : []);
        setServices(Array.isArray(servicesRaw) ? servicesRaw : []);
        setTechnicians(Array.isArray(techRaw) ? techRaw : []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast({
          title: "Fetch Error",
          description: err.message || "Failed to load location data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }, [toast]);

    const fetchHealthAndMonitor = useCallback(async () => {
      try {
        setIsHealthLoading(true);
        const [hRes, mRes] = await Promise.all([
          getZoneHealthDashboard().catch(() => null),
          getLiveGeofenceMonitoring().catch(() => null),
        ]);
        if (hRes) setHealthData(hRes);
        if (mRes) setLiveMonitorData(mRes);
      } catch (err) {
        console.error("Health fetch error:", err);
      } finally {
        setIsHealthLoading(false);
      }
    }, []);

    const fetchMatrixData = useCallback(async () => {
      try {
        const params = {};
        if (matrixSearch.trim()) params.search = matrixSearch.trim();
        if (matrixCategoryFilter !== "ALL") params.categoryId = matrixCategoryFilter;
        if (matrixDistrictFilter !== "ALL") params.districtId = matrixDistrictFilter;
        if (matrixZoneStatusFilter !== "ALL") params.zoneStatus = matrixZoneStatusFilter;
        if (matrixServiceStatusFilter !== "ALL") params.serviceStatus = matrixServiceStatusFilter;

        const [res, catRes] = await Promise.all([
          getServiceZoneMatrix(params).catch(() => ({ result: [] })),
          getAllCategories("service").catch(() => ({ result: [] })),
        ]);

        const items = res.result || res.data || res || [];
        const cats = catRes.result || catRes.categories || catRes.data || catRes || [];
        setMatrixData(Array.isArray(items) ? items : []);
        setCategoriesList(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error("fetchMatrixData error:", err);
      }
    }, [matrixSearch, matrixCategoryFilter, matrixDistrictFilter, matrixZoneStatusFilter, matrixServiceStatusFilter]);

    useEffect(() => {
      const t = setTimeout(() => {
        fetchMatrixData();
      }, 400);
      return () => clearTimeout(t);
    }, [fetchMatrixData]);

    const handleResetMatrixFilters = () => {
      setMatrixSearch("");
      setMatrixCategoryFilter("ALL");
      setMatrixDistrictFilter("ALL");
      setMatrixZoneStatusFilter("ALL");
      setMatrixServiceStatusFilter("ALL");
      setShowAllChecked(true);
    };

    const handleOpenManageServiceModal = async (serviceId) => {
      try {
        setIsServiceDetailLoading(true);
        setIsManageServiceModalOpen(true);
        setSelectedZoneIds([]);
        setModalZoneSearch("");
        setModalZoneStatusFilter("ALL");

        const res = await getServiceZoneDetail(serviceId);
        if (res && res.success) {
          if (Array.isArray(res.districts)) {
            res.districts.sort((a, b) => (a.name || a.city || "").localeCompare(b.name || b.city || ""));
            res.districts.forEach((d) => {
              if (Array.isArray(d.zones)) {
                d.zones.sort((a, b) => (a.name || a.zoneCode || "").localeCompare(b.name || b.zoneCode || ""));
              }
            });
          }
          setSelectedServiceDetail(res);
          if (res.districts && res.districts.length > 0) {
            setSelectedDistrictTab(res.districts[0].districtId);
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to load service zone detail.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsServiceDetailLoading(false);
      }
    };

    const isDistrictServiceActive = (dist) => {
      if (!dist) return false;
      if (dist.isDistrictEnabled === false) return false;
      if (dist.isDistrictEnabled === true) return true;
      if (dist.status === "DISABLED") return false;
      if (dist.status === "ENABLED") return true;
      if (dist.enabled === false) return false;
      if (dist.enabled === true) return true;
      if (dist.active === false) return false;
      if (dist.active === true) return true;
      if (dist.isServiceEnabled === false) return false;
      if (dist.isServiceEnabled === true) return true;
      if (dist.isAvailable === false) return false;
      if (dist.isAvailable === true) return true;
      if (Array.isArray(dist.zones) && dist.zones.length > 0) {
        return dist.zones.some((z) => isZoneServiceActive(z));
      }
      if (typeof dist.activeZonesCount === "number" && dist.activeZonesCount > 0) {
        return true;
      }
      if (typeof dist.activeZonesCount === "number" && dist.activeZonesCount === 0 && Array.isArray(dist.zones) && dist.zones.length > 0) {
        return false;
      }
      return dist.isDistrictEnabled !== false && dist.status !== "DISABLED" && dist.enabled !== false;
    };

    const isZoneServiceActive = (zone) => {
      if (!zone) return false;
      if (zone.status === "DISABLED") return false;
      if (zone.status === "ENABLED") return true;
      if (zone.enabled === false) return false;
      if (zone.enabled === true) return true;
      if (zone.active === false) return false;
      if (zone.active === true) return true;
      return false;
    };

    const reloadServiceDetail = async (serviceId) => {
      try {
        const res = await getServiceZoneDetail(serviceId);
        if (res && res.success) {
          setSelectedServiceDetail(res);
        }
      } catch (err) {
        console.error("reloadServiceDetail error:", err);
      }
    };

    // Direct District / City Toggle — ONE canonical write per action.
    // Root cause of "not working per city": the old code fired 4 parallel
    // writes (bulkToggle + bulkCreateMappings + createServiceAvailability +
    // toggleZone) that raced each other, used mismatched id keys, and toasted
    // success even on partial failure. Now: single API call, real await,
    // revert on failure via reload.
    const resolveServiceId = (svc) => svc?.serviceId || svc?._id || svc?.id || "";
    const resolveDetailDistrictId = (d) => d?.districtId || d?._id || d?.id || "";
    const resolveDetailZoneId = (z) => z?.zoneId || z?._id || z?.id || "";
    const zoneParentDistrictId = (z) => {
      const ref = z?.operationalCityId ?? z?.districtId ?? z?.operationalCity ?? null;
      if (!ref) return "";
      if (typeof ref === "string") return ref;
      return ref._id || ref.districtId || ref.id || "";
    };
    const collectChildZoneIds = (dist, districtId) => {
      const fromDetail = (Array.isArray(dist?.zones) ? dist.zones : [])
        .map(resolveDetailZoneId)
        .filter(Boolean);
      if (fromDetail.length > 0) return fromDetail;
      return (zones || [])
        .filter((z) => String(zoneParentDistrictId(z)) === String(districtId))
        .map(resolveDetailZoneId)
        .filter(Boolean);
    };

    const handleToggleDistrictAvailabilityDirect = async (dist) => {
    if (!selectedServiceDetail?.service) return;
    const serviceId = resolveServiceId(selectedServiceDetail.service);
    const districtId = resolveDetailDistrictId(dist);
    if (!serviceId || !districtId) {
      return toast({ title: "Toggle Error", description: "Missing service or district id. Please refresh.", status: "error", duration: 3000, isClosable: true });
    }
    const currentEnabled = isDistrictServiceActive(dist);
    const nextEnabled = !currentEnabled;
    const nextStatus = nextEnabled ? "ENABLED" : "DISABLED";

    setTogglingDistrictId(districtId);

    // Collect all child zone IDs from dist.zones or global zones state
    const zoneIds = collectChildZoneIds(dist, districtId);

      // 1. Optimistic UI Update (reverted via reloadServiceDetail on failure)
      setSelectedServiceDetail((prev) => {
        if (!prev || !prev.districts) return prev;
        return {
          ...prev,
          districts: prev.districts.map((d) => {
            if (String(resolveDetailDistrictId(d)) === String(districtId)) {
              const updatedZones = (d.zones || []).map((z) => ({
                ...z,
                status: nextStatus,
                enabled: nextEnabled,
                active: nextEnabled,
              }));
              return {
                ...d,
                isDistrictEnabled: nextEnabled,
                status: nextStatus,
                enabled: nextEnabled,
                active: nextEnabled,
                isServiceEnabled: nextEnabled,
                zones: updatedZones,
                activeZonesCount: nextEnabled ? updatedZones.length : 0,
                inactiveZonesCount: nextEnabled ? 0 : updatedZones.length,
              };
            }
            return d;
          }),
        };
      });

      try {
        // Single canonical write: district with sub-zones -> bulk endpoint,
        // district without sub-zones -> district-scoped toggle. No parallel
        // competing writes, so per-city state can't diverge.
        if (zoneIds.length > 0) {
          await bulkToggleZoneAvailability({
            serviceId,
            districtId,
            zoneIds,
            cityZoneIds: zoneIds,
            enabled: nextEnabled,
            status: nextStatus,
          });
        } else {
          await toggleZoneAvailability({
            serviceId,
            districtId,
            enabled: nextEnabled,
            status: nextStatus,
          });
        }

        toast({
          title: `District Availability ${nextEnabled ? "Enabled" : "Disabled"}`,
          description: `${dist.name} is now ${nextEnabled ? "ACTIVE" : "INACTIVE"} for ${selectedServiceDetail.service.serviceName}.`,
          status: nextEnabled ? "success" : "info",
          duration: 2500,
          isClosable: true,
        });

        await reloadServiceDetail(serviceId);
        await fetchMatrixData();
      } catch (err) {
        console.error("handleToggleDistrictAvailabilityDirect error:", err);
        toast({
          title: "Toggle Error",
          description: err.message || "Failed to update district availability.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        await reloadServiceDetail(serviceId);
      } finally {
        setTogglingDistrictId(null);
      }
    };

    // Direct Sub-Zone Toggle — single canonical write.
    const handleToggleSubZoneAvailabilityDirect = async (zone, currentStatus, dist) => {
    if (!selectedServiceDetail?.service) return;
    const serviceId = resolveServiceId(selectedServiceDetail.service);
    const districtId = resolveDetailDistrictId(dist);
    const zoneId = resolveDetailZoneId(zone);
    if (!serviceId || !districtId || !zoneId) {
      return toast({ title: "Toggle Error", description: "Missing service, district or zone id. Please refresh.", status: "error", duration: 3000, isClosable: true });
    }
      const currentEnabled = isZoneServiceActive(zone);
      const nextEnabled = !currentEnabled;
      const nextStatus = nextEnabled ? "ENABLED" : "DISABLED";

      setTogglingZoneId(zoneId);

      // Optimistic UI Update (reverted via reloadServiceDetail on failure)
      setSelectedServiceDetail((prev) => {
        if (!prev || !prev.districts) return prev;
        return {
          ...prev,
          districts: prev.districts.map((d) => {
            if (String(resolveDetailDistrictId(d)) === String(districtId)) {
              const updatedZones = (d.zones || []).map((z) =>
                String(resolveDetailZoneId(z)) === String(zoneId)
                  ? { ...z, status: nextStatus, enabled: nextEnabled, active: nextEnabled }
                  : z
              );
              const activeCount = updatedZones.filter((z) => isZoneServiceActive(z)).length;
              return {
                ...d,
                zones: updatedZones,
                activeZonesCount: activeCount,
                inactiveZonesCount: updatedZones.length - activeCount,
                isDistrictEnabled: activeCount > 0,
                status: activeCount > 0 ? "ENABLED" : "DISABLED",
                enabled: activeCount > 0,
              };
            }
            return d;
          }),
        };
      });

      try {
        // Single write — the old second bulkCreateZoneMappings call raced the
        // toggle and is no longer sent.
        await toggleZoneAvailability({
          serviceId,
          districtId,
          zoneId,
          cityZoneId: zoneId,
          enabled: nextEnabled,
          status: nextStatus,
        });

        toast({
          title: `Zone ${nextEnabled ? "Enabled" : "Disabled"}`,
          description: `Zone "${zone.name}" is now ${nextStatus} in ${dist.name}.`,
          status: nextEnabled ? "success" : "info",
          duration: 2000,
          isClosable: true,
        });

        await reloadServiceDetail(serviceId);
        await fetchMatrixData();
      } catch (err) {
        console.error("handleToggleSubZoneAvailabilityDirect error:", err);
        toast({
          title: "Toggle Error",
          description: err.message || "Failed to update zone availability.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        await reloadServiceDetail(serviceId);
      } finally {
        setTogglingZoneId(null);
      }
    };

    // Direct Global Service Toggle
    const handleToggleGlobalServiceDirect = async () => {
    if (!selectedServiceDetail?.service) return;
    const serviceId = resolveServiceId(selectedServiceDetail.service);
    if (!serviceId) {
      return toast({ title: "Toggle Error", description: "Missing service id. Please refresh.", status: "error", duration: 3000, isClosable: true });
    }
      const currentIsActive = selectedServiceDetail.service.isActive !== false;
      const nextIsActive = !currentIsActive;

      setIsTogglingServiceStatus(true);

      setSelectedServiceDetail((prev) => {
        if (!prev || !prev.service) return prev;
        return {
          ...prev,
          service: {
            ...prev.service,
            isActive: nextIsActive,
          },
        };
      });

      try {
        await toggleServiceStatus({
          serviceId,
          isActive: nextIsActive,
        });

        toast({
          title: `Service ${nextIsActive ? "Activated" : "Deactivated"}`,
          description: `${selectedServiceDetail.service.serviceName} is globally ${nextIsActive ? "ACTIVE" : "INACTIVE"}.`,
          status: "info",
          duration: 2500,
          isClosable: true,
        });

        await reloadServiceDetail(serviceId);
        await fetchMatrixData();
      } catch (err) {
        console.error("handleToggleGlobalServiceDirect error:", err);
        toast({
          title: "Toggle Error",
          description: err.message || "Failed to update service status.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        await reloadServiceDetail(serviceId);
      } finally {
        setIsTogglingServiceStatus(false);
      }
    };

    const handleTriggerSingleZoneToggle = (zone, currentStatus, districtObj) => {
    const nextStatus = currentStatus === "ENABLED" ? "DISABLED" : "ENABLED";
    const isEnabling = nextStatus === "ENABLED";
    const zid = resolveDetailZoneId(zone);
    setConfirmConfig({
      type: isEnabling ? "SINGLE_ZONE_ENABLE" : "SINGLE_ZONE_DISABLE",
      title: isEnabling ? "Enable Service Zone?" : "Disable Service Zone?",
      description: isEnabling
        ? `Are you sure you want to enable "${zone.name}" zone for ${selectedServiceDetail?.service?.serviceName} in ${districtObj?.name}?`
        : `Disable "${zone.name}" zone for ${selectedServiceDetail?.service?.serviceName} in ${districtObj?.name}? Customers in this zone will no longer be matched to technicians for this service.`,
      payload: {
        serviceId: resolveServiceId(selectedServiceDetail?.service),
        districtId: resolveDetailDistrictId(districtObj),
        zoneId: zid,
        cityZoneId: zid,
        status: nextStatus,
        enabled: isEnabling,
      },
    });
    setIsConfirmDialogOpen(true);
  };

  const handleTriggerBulkToggle = (status, districtObj) => {
    if (selectedZoneIds.length === 0) return;
    const isEnabling = status === "ENABLED";
    setConfirmConfig({
      type: isEnabling ? "BULK_ENABLE" : "BULK_DISABLE",
      title: `${selectedZoneIds.length} Zones Selected`,
      description: `Are you sure you want to ${isEnabling ? "ENABLE" : "DISABLE"} ${selectedZoneIds.length} selected zone(s) for ${selectedServiceDetail?.service?.serviceName} in ${districtObj?.name}?`,
      payload: {
        serviceId: resolveServiceId(selectedServiceDetail?.service),
        districtId: resolveDetailDistrictId(districtObj),
        zoneIds: selectedZoneIds,
        cityZoneIds: selectedZoneIds,
        status,
        enabled: isEnabling,
      },
    });
    setIsConfirmDialogOpen(true);
    };

    const handleTriggerClearAll = (districtObj) => {
      setConfirmConfig({
        type: "CLEAR_ALL",
        title: "Clear All Service Mappings?",
        description: `This will disable ALL service zone mappings for ${selectedServiceDetail?.service?.serviceName} in ${districtObj?.name}. Customers across all zones in this district will no longer receive this service.`,
        payload: {
          serviceId: resolveServiceId(selectedServiceDetail?.service),
          districtId: resolveDetailDistrictId(districtObj),
        },
      });
      setIsConfirmDialogOpen(true);
    };

    const handleTriggerToggleServiceStatus = () => {
      const currentIsActive = selectedServiceDetail?.service?.isActive;
      const nextIsActive = !currentIsActive;
      setConfirmConfig({
        type: "TOGGLE_SERVICE",
        title: nextIsActive ? "Activate Service?" : "Deactivate Service?",
        description: nextIsActive
          ? `Activate ${selectedServiceDetail?.service?.serviceName}? Technicians can be dispatched in enabled zones.`
          : `Deactivate ${selectedServiceDetail?.service?.serviceName}? Even if zones are enabled, dispatch will NOT assign this service to any technician.`,
        payload: {
          serviceId: resolveServiceId(selectedServiceDetail?.service),
          isActive: nextIsActive,
        },
      });
      setIsConfirmDialogOpen(true);
    };

    const handleExecuteConfirmedAction = async () => {
      if (!confirmConfig.payload) return;
      try {
        setIsConfirmingAction(true);
        const { type, payload } = confirmConfig;
        if (!payload.serviceId) throw new Error("Missing service id. Please refresh and retry.");
        if (type === "SINGLE_ZONE_ENABLE" || type === "SINGLE_ZONE_DISABLE") {
          if (!payload.districtId || !payload.cityZoneId) throw new Error("Missing district/zone id. Please refresh and retry.");
          await toggleZoneAvailability(payload);
          toast({ title: "Zone Availability Updated", status: "success", duration: 3000, isClosable: true });
        } else if (type === "BULK_ENABLE" || type === "BULK_DISABLE") {
          if (!payload.districtId || !payload.cityZoneIds?.length) throw new Error("No zones selected or missing district id.");
          await bulkToggleZoneAvailability(payload);
          setSelectedZoneIds([]);
          toast({ title: `${payload.cityZoneIds.length} Zones Updated`, status: "success", duration: 3000, isClosable: true });
        } else if (type === "CLEAR_ALL") {
          if (!payload.districtId) throw new Error("Missing district id. Please refresh and retry.");
          await clearDistrictZoneAvailability(payload);
          setSelectedZoneIds([]);
          toast({ title: "District Zones Cleared", status: "warning", duration: 3000, isClosable: true });
        } else if (type === "TOGGLE_SERVICE") {
          await toggleServiceStatus(payload);
          toast({ title: `Service ${payload.isActive ? "Activated" : "Deactivated"}`, status: "info", duration: 3000, isClosable: true });
        }

        setIsConfirmDialogOpen(false);
        const sid = resolveServiceId(selectedServiceDetail?.service) || payload.serviceId;
        if (sid) {
          await reloadServiceDetail(sid);
        }
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Action Failed", description: err.message || "Operation failed.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsConfirmingAction(false);
      }
    };

    useEffect(() => {
      let storedUser = null;
      try {
        const raw = localStorage.getItem("user");
        storedUser = raw ? JSON.parse(raw) : null;
      } catch {
        storedUser = null;
      }
      const role = storedUser?.role?.toLowerCase();
      if (!storedUser || (role !== "owner" && role !== "admin" && role !== "super admin")) {
        toast({
          title: "Access Denied",
          description: "Only admin, super admin, or owner can access this page.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setCurrentUser(storedUser);
    }, [toast]);

    useEffect(() => {
      if (currentUser) {
        fetchData();
        fetchHealthAndMonitor();
      }
    }, [currentUser, fetchData, fetchHealthAndMonitor]);

    // Memoized Filtering Logic for high performance
    const filteredDistricts = useMemo(() => {
      const search = searchTerm.toLowerCase();
      return districts.filter((d) => {
        const matchesSearch =
          (d.name || "").toLowerCase().includes(search) ||
          (d.city || "").toLowerCase().includes(search) ||
          (d.code || "").toLowerCase().includes(search);

        const isActive = d.active !== false && d.isActive !== false;
        if (districtFilter === "active") return matchesSearch && isActive;
        if (districtFilter === "inactive") return matchesSearch && !isActive;
        return matchesSearch;
      });
    }, [districts, searchTerm, districtFilter]);

    const filteredZones = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return zones.filter((zone) => {
      const name = (zone.name || "").toLowerCase();
      const code = (zone.zoneCode || "").toLowerCase();
      const matchesSearch = name.includes(search) || code.includes(search);

      if (selectedDistrictFilter !== "all") {
        const ref = zone.operationalCityId ?? zone.districtId ?? null;
        const distId = typeof ref === "string" ? ref : (ref?._id || ref?.districtId || ref?.id || "");
        return matchesSearch && String(distId) === String(selectedDistrictFilter);
      }
      return matchesSearch;
    });
  }, [zones, searchTerm, selectedDistrictFilter]);

    const filteredTechnicians = useMemo(() => {
      const search = searchTerm.toLowerCase();
      return technicians.filter((t) => {
        const name = `${t.fname || t.userId?.fname || ""} ${t.lname || t.userId?.lname || ""}`.toLowerCase();
        const phone = (t.mobileNumber || t.phone || t.userId?.mobileNumber || t.userId?.phone || t.userId?.identifier || "").toLowerCase();
        const city = (t.city || t.primaryCityId?.name || "").toLowerCase();
        const matchesSearch = name.includes(search) || phone.includes(search) || city.includes(search);

        // District filter: check primary district and additional permitted districts
        let matchesDistrict = true;
        if (selectedDistrictFilter !== "all") {
          const primaryId = String(t.primaryCityId?._id || t.primaryCityId || "");
          const allowedDistIds = (t.allowedDistricts || t.permittedDistricts || t.districtPermissions || t.secondaryDistricts || []).map((d) =>
            String(d._id || d.districtId || d.id || d)
          );
          matchesDistrict = primaryId === selectedDistrictFilter || allowedDistIds.includes(selectedDistrictFilter);
        }

        // Permission type filter
        let matchesPermType = true;
        const permCount = (t.allowedDistricts || t.permittedDistricts || t.districtPermissions || t.secondaryDistricts || []).length;
        if (permissionFilter === "multi_district") {
          matchesPermType = permCount > 0;
        } else if (permissionFilter === "single_district") {
          matchesPermType = permCount === 0;
        }

        return matchesSearch && matchesDistrict && matchesPermType;
      });
    }, [technicians, searchTerm, selectedDistrictFilter, permissionFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDistricts = filteredDistricts.slice(indexOfFirstItem, indexOfLastItem);
    const currentZones = filteredZones.slice(indexOfFirstItem, indexOfLastItem);
    const currentMatrixData = matrixData.slice(indexOfFirstItem, indexOfLastItem);
    const currentTechnicians = filteredTechnicians.slice(indexOfFirstItem, indexOfLastItem);

    const getActiveTotalPages = () => {
      if (activeTab === 0) return Math.ceil(filteredDistricts.length / itemsPerPage) || 1;
      if (activeTab === 1) return Math.ceil(filteredZones.length / itemsPerPage) || 1;
      if (activeTab === 2) return Math.ceil(matrixData.length / itemsPerPage) || 1;
      if (activeTab === 3) return Math.ceil(filteredTechnicians.length / itemsPerPage) || 1;
      return 1;
    };
    const totalPages = getActiveTotalPages();

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    };

    const handleClearFilters = () => {
      setSearchTerm("");
      setDistrictFilter("all");
      setSelectedDistrictFilter("all");
      setPermissionFilter("all");
      setPageByTab({ 0: 1, 1: 1, 2: 1, 3: 1 });
    };

    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Card Filter Clicks
    const handleStatCardClick = (tabIdx, filterType = "all") => {
      setActiveTab(tabIdx);
      setDistrictFilter(filterType);
      setCurrentPage(1);
    };

    const getAvailableDistrictName = (cityName, existingDistrictsList) => {
      const existingNames = new Set((existingDistrictsList || []).map((d) => (d.name || "").toLowerCase().trim()));
      const baseName = `${cityName} Operational Range`;
      if (!existingNames.has(baseName.toLowerCase())) return baseName;
      const alt1 = `${cityName} Operational Hub`;
      if (!existingNames.has(alt1.toLowerCase())) return alt1;
      const alt2 = `${cityName} District`;
      if (!existingNames.has(alt2.toLowerCase())) return alt2;
      let counter = 2;
      while (existingNames.has(`${cityName} Range ${counter}`.toLowerCase())) {
        counter++;
      }
      return `${cityName} Range ${counter}`;
    };

    // District Handlers
    const handleOpenCreateDistrict = () => {
      setIsEditingDistrict(false);
      setSelectedDistrict(null);
      setDistrictModalError("");

      // Find first city not already in existing districts to prevent duplicate errors
      const existingNames = new Set((districts || []).map((d) => (d.city || d.name || "").toLowerCase().trim()));
      const defaultCity = TAMIL_NADU_CITIES.find((c) => !existingNames.has(c.name.toLowerCase().trim())) || TAMIL_NADU_CITIES[0];
      const defaultPoly = defaultCity ? generateCircularGeoJSON(defaultCity.lat, defaultCity.lng, 10) : null;
      const generatedName = defaultCity ? getAvailableDistrictName(defaultCity.name, districts) : "";

      setDistrictFormData({
        ...initialDistrictForm,
        name: generatedName,
        city: defaultCity ? defaultCity.name : "",
        state: "Tamil Nadu",
        country: "India",
        code: defaultCity ? defaultCity.code : "",
        polygonCoordinates: defaultPoly ? JSON.stringify(defaultPoly, null, 2) : "",
      });
      setIsDistrictModalOpen(true);
    };

    const handleOpenEditDistrict = (dist) => {
      setIsEditingDistrict(true);
      setSelectedDistrict(dist);
      setDistrictModalError("");
      let polyStr = "";
      if (dist.polygon && typeof dist.polygon === "object") {
        polyStr = JSON.stringify(dist.polygon, null, 2);
      }
      setDistrictFormData({
        name: dist.name || "",
        city: dist.city || "",
        state: dist.state || "",
        country: dist.country || "India",
        code: dist.code || "",
        active: dist.active !== false && dist.isActive !== false,
        isRegistrationEnabled: dist.isRegistrationEnabled !== false,
        isJobEnabled: dist.isJobEnabled !== false,
        polygonCoordinates: polyStr,
      });
      setIsDistrictModalOpen(true);
    };

    const handleOpenViewMapModal = (dist) => {
      setViewMapDistrict(dist);
      setIsViewMapModalOpen(true);
    };

    const handleSubmitDistrict = async () => {
      setDistrictModalError("");

      if (!districtFormData.name.trim()) {
        const msg = "District Name is required.";
        setDistrictModalError(msg);
        return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
      }
      if (!districtFormData.city.trim()) {
        const msg = "City Name is required.";
        setDistrictModalError(msg);
        return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
      }

      let polygon = null;
      if (districtFormData.polygonCoordinates.trim()) {
        try {
          const parsed = JSON.parse(districtFormData.polygonCoordinates);
          if (parsed && parsed.type && Array.isArray(parsed.coordinates)) {
            polygon = { type: parsed.type, coordinates: parsed.coordinates };
          } else if (Array.isArray(parsed)) {
            polygon = { type: "Polygon", coordinates: parsed };
          }
        } catch (e) {
          const msg = "Invalid GeoJSON Polygon format.";
          setDistrictModalError(msg);
          return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
        }
      }

      try {
        setIsSubmitting(true);
        const payload = {
          name: districtFormData.name.trim(),
          city: districtFormData.city.trim(),
          state: districtFormData.state.trim(),
          country: districtFormData.country.trim(),
          code: districtFormData.code.trim().toUpperCase(),
          active: districtFormData.active,
          isRegistrationEnabled: districtFormData.isRegistrationEnabled,
          isJobEnabled: districtFormData.isJobEnabled,
        };
        if (polygon) payload.polygon = polygon;

        if (isEditingDistrict && selectedDistrict) {
          await updateDistrict(selectedDistrict._id, payload);
          toast({ title: "District Updated", description: `"${payload.name}" updated successfully.`, status: "success", duration: 3000, isClosable: true });
        } else {
          await createDistrict(payload);
          toast({ title: "District Created", description: `"${payload.name}" created successfully.`, status: "success", duration: 3000, isClosable: true });
        }

        await fetchData();
        setIsDistrictModalOpen(false);
      } catch (err) {
        const errMsg = err.message || "Failed to save district.";
        setDistrictModalError(errMsg);
        toast({ title: "Error", description: errMsg, status: "error", duration: 4000, isClosable: true });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleToggleDistrictActive = async (dist) => {
      try {
        const newStatus = !(dist.active !== false && dist.isActive !== false);
        await toggleDistrictStatus(dist._id, newStatus);
        toast({ title: "Status Updated", description: `District ${newStatus ? "Activated" : "Deactivated"}`, status: "success", duration: 2000, isClosable: true });
        await fetchData();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to toggle status.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleToggleDistrictRegistrationFlag = async (dist) => {
      try {
        const newFlag = !dist.isRegistrationEnabled;
        await toggleDistrictRegistration(dist._id, newFlag);
        toast({ title: "Registration Updated", description: `Technician Registration ${newFlag ? "Enabled" : "Disabled"}`, status: "success", duration: 2000, isClosable: true });
        await fetchData();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to toggle registration flag.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleToggleDistrictJobFlag = async (dist) => {
      try {
        const newFlag = !dist.isJobEnabled;
        await toggleDistrictJobs(dist._id, newFlag);
        toast({ title: "Job Assignment Updated", description: `Job Assignment ${newFlag ? "Enabled" : "Disabled"}`, status: "success", duration: 2000, isClosable: true });
        await fetchData();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to toggle job flag.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleViewDistrictTechnicians = async (dist) => {
      try {
        setIsLoading(true);
        setViewingDistrictName(dist?.name || "District");
        const res = await getDistrictTechnicians(dist._id);
        let list = [];
        const payload = res?.result || res?.data || res;
        if (Array.isArray(payload)) {
          list = payload;
        } else if (payload && typeof payload === "object") {
          const primaryRaw = payload.primaryTechnicians || payload.primary || [];
          const additionalRaw = payload.additionalTechnicians || payload.additional || [];
          const primary = Array.isArray(primaryRaw) ? primaryRaw.map((t) => ({ ...t, permissionType: "PRIMARY" })) : [];
          const additional = Array.isArray(additionalRaw) ? additionalRaw.map((t) => ({ ...t, permissionType: "ADDITIONAL" })) : [];
          list = [...primary, ...additional];
          if (list.length === 0 && Array.isArray(payload.technicians)) {
            list = payload.technicians;
          } else if (list.length === 0 && Array.isArray(payload.additionalPermissions)) {
            list = payload.additionalPermissions;
          }
        }
        setDistrictTechList(Array.isArray(list) ? list : []);
        setIsDistrictTechModalOpen(true);
      } catch (err) {
        setDistrictTechList([]);
        toast({ title: "Error", description: err.message || "Failed to load district technicians.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsLoading(false);
      }
    };

    // Technician Permission Handlers
    
  const handleSaveServiceRadius = async () => {
    if (!selectedTechForPermission) return;
    const km = Number(techServiceRadius);
    if (!Number.isFinite(km) || km < 1 || km > 100) {
      return toast({ title: "Validation Error", description: "Service radius must be 1–100 KM.", status: "error", duration: 3000, isClosable: true });
    }
    try {
      setIsSubmitting(true);
      await updateTechnicianProfile({ id: selectedTechForPermission._id, technicianId: selectedTechForPermission._id, serviceRadiusKm: km });
        toast({
          title: "Service Radius Updated",
          description: `Technician service radius set to ${techServiceRadius} KM.`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
        fetchData();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to update service radius.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsSubmitting(false);
      }
    };

    const getTechDisplayName = (tech) => {
      if (!tech) return "Technician";
      const first = tech.fname || tech.firstName || tech.userId?.fname || tech.userId?.firstName || "";
      const last = tech.lname || tech.lastName || tech.userId?.lname || tech.userId?.lastName || "";
      const fullName = `${first} ${last}`.trim();
      if (fullName) return fullName;
      if (tech.name) return tech.name;
      if (tech.profile?.name) return tech.profile.name;
      if (tech.userId?.name) return tech.userId.name;
      const phone = tech.mobileNumber || tech.phone || tech.phoneNumber || tech.userId?.mobileNumber || tech.userId?.phone;
      if (phone) return `Technician (${phone})`;
      if (tech.email || tech.userId?.email) return `Technician (${tech.email || tech.userId?.email})`;
      return "Technician";
    };

    const getResolvedPrimaryDistrict = () => {
      if (techPermissions?.primaryDistrict && typeof techPermissions.primaryDistrict === "object") {
        return techPermissions.primaryDistrict;
      }
      const pId =
        (typeof techPermissions?.primaryDistrict === "string" ? techPermissions.primaryDistrict : null) ||
        selectedTechForPermission?.primaryCityId?._id ||
        selectedTechForPermission?.primaryCityId;
      if (pId) {
        const match = districts.find((d) => String(d._id) === String(pId));
        if (match) return match;
      }
      const cityName =
        selectedTechForPermission?.city ||
        selectedTechForPermission?.primaryCityId?.name ||
        techPermissions?.primaryDistrict?.name ||
        techPermissions?.primaryDistrict?.city;
      if (cityName) {
        const cleanCity = cityName.toLowerCase().trim();
        const match = districts.find((d) => {
          const dCity = (d.city || "").toLowerCase().trim();
          const dName = (d.name || "").toLowerCase().trim();
          return dCity === cleanCity || dName === cleanCity || dName.includes(cleanCity);
        });
        if (match) return match;
      }
      if (techZonePermissions?.groupedZonesByDistrict) {
        const permittedGroups = Object.values(techZonePermissions.groupedZonesByDistrict).filter((g) => g.hasDistrictPermission);
        if (permittedGroups.length > 0) {
          const groupDistId = permittedGroups[0].districtId;
          const match = districts.find((d) => String(d._id) === String(groupDistId));
          if (match) return match;
          return {
            _id: groupDistId,
            name: permittedGroups[0].districtName || "Operational Range",
            city: permittedGroups[0].districtName?.replace(/Operational Range/i, "").trim() || "Base Hub",
          };
        }
      }
      return null;
    };

    const handleOpenTechPermissions = async (tech) => {
      try {
        setIsLoading(true);
        setSelectedTechForPermission(tech);
        setTechServiceRadius(tech.serviceRadiusKm || 10);
        const [distRes, zoneRes] = await Promise.all([
          getTechnicianDistricts(tech._id).catch(() => ({ result: { primaryDistrict: null, additionalPermissions: [] } })),
          getTechnicianZonePermissions(tech._id).catch(() => null),
        ]);
        const rawRes = distRes?.result || distRes?.data || distRes || {};
        const perms = Array.isArray(rawRes?.additionalPermissions)
          ? rawRes.additionalPermissions
          : (Array.isArray(rawRes?.permissions)
            ? rawRes.permissions
            : (Array.isArray(rawRes) ? rawRes : []));
        const primary = rawRes?.primaryDistrict || tech?.primaryCityId || null;
        const allowedIds = Array.isArray(rawRes?.allowedDistrictIds) ? rawRes.allowedDistrictIds : [];

        setTechPermissions({
          ...rawRes,
          primaryDistrict: primary,
          permissions: perms,
          additionalPermissions: perms,
          allowedDistrictIds: allowedIds,
        });
        setTechZonePermissions(zoneRes || null);
        setSelectedDistrictToGrant("");
        setIsPermissionModalOpen(true);
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to fetch technician permissions.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsLoading(false);
      }
    };

    const refreshPermissions = async (techId) => {
      const [distRes, zoneRes] = await Promise.all([
        getTechnicianDistricts(techId).catch(() => ({ result: { primaryDistrict: null, additionalPermissions: [] } })),
        getTechnicianZonePermissions(techId).catch(() => null),
      ]);
      const rawRes = distRes?.result || distRes?.data || distRes || {};
      const perms = Array.isArray(rawRes?.additionalPermissions)
        ? rawRes.additionalPermissions
        : (Array.isArray(rawRes?.permissions)
          ? rawRes.permissions
          : (Array.isArray(rawRes) ? rawRes : []));
      const primary = rawRes?.primaryDistrict || selectedTechForPermission?.primaryCityId || null;
      const allowedIds = Array.isArray(rawRes?.allowedDistrictIds) ? rawRes.allowedDistrictIds : [];

      setTechPermissions({
        ...rawRes,
        primaryDistrict: primary,
        permissions: perms,
        additionalPermissions: perms,
        allowedDistrictIds: allowedIds,
      });
      setTechZonePermissions(zoneRes || null);
    };

    const handleGrantDistrictPermission = async () => {
      if (!selectedDistrictToGrant || !selectedTechForPermission) return;

      const resolvedPrimary = getResolvedPrimaryDistrict();
      const primaryId = resolvedPrimary?._id ? String(resolvedPrimary._id) : "";
      const primaryCity = (resolvedPrimary?.city || resolvedPrimary?.name || "").toLowerCase().trim();

      const currentAdditional = techPermissions?.permissions || techPermissions?.additionalPermissions || [];
      const existingPermDistIds = currentAdditional.map((p) =>
        String(p.districtId?._id || p.districtId?.id || p.districtId || "")
      );

      const targetDist = districts.find((d) => String(d._id) === String(selectedDistrictToGrant));
      const targetCity = (targetDist?.city || targetDist?.name || "").toLowerCase().trim();

      if (
        (primaryId && String(selectedDistrictToGrant) === primaryId) ||
        (primaryCity && targetCity && primaryCity === targetCity)
      ) {
        toast({
          title: "Primary Base District",
          description: `"${targetDist?.name || 'This district'}" is already the technician's primary registered base hub. It is always enabled by default.`,
          status: "info",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      if (existingPermDistIds.includes(String(selectedDistrictToGrant))) {
        toast({
          title: "Permission Already Exists",
          description: `District permission for "${targetDist?.name || 'this district'}" is already granted to this technician.`,
          status: "info",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      if (targetDist) {
        if (targetDist.active === false || targetDist.isActive === false) {
          toast({
            title: "District Inactive",
            description: `Cannot grant permission. "${targetDist.name}" is currently inactive. Please activate it first in District Master.`,
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
          return;
        }
        if (targetDist.isJobEnabled === false) {
          toast({
            title: "Job Assignment Disabled",
            description: `Cannot grant permission. Job assignment for "${targetDist.name}" is currently disabled. Please enable jobs first in District Master.`,
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
          return;
        }
      }

      try {
        setIsSubmitting(true);
        await addTechnicianDistrictPermission(selectedTechForPermission._id, selectedDistrictToGrant);
        toast({
          title: "Permission Granted",
          description: `Additional district access granted for "${targetDist?.name || 'district'}".`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
        await refreshPermissions(selectedTechForPermission._id);
        setSelectedDistrictToGrant("");
        await fetchData();
      } catch (err) {
        if (
          err.message?.includes("already granted") ||
          err.message?.includes("already exists") ||
          err.message?.includes("already technician's primary")
        ) {
          toast({
            title: "Permission Already Active",
            description: err.message || "This district permission is already active for this technician.",
            status: "info",
            duration: 3500,
            isClosable: true,
          });
          await refreshPermissions(selectedTechForPermission._id);
          setSelectedDistrictToGrant("");
        } else {
          toast({
            title: "Permission Error",
            description: err.message || "Failed to grant district permission.",
            status: "error",
            duration: 3500,
            isClosable: true
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleTogglePermission = async (districtId, currentStatus) => {
      if (!selectedTechForPermission) return;
      try {
        await toggleTechnicianDistrictPermission(selectedTechForPermission._id, districtId, !currentStatus);
        toast({ title: "Permission Updated", description: `Permission ${!currentStatus ? "Enabled" : "Disabled"}.`, status: "success", duration: 2000, isClosable: true });
        await refreshPermissions(selectedTechForPermission._id);
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to update permission.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleRemovePermission = async (districtId) => {
      if (!selectedTechForPermission) return;
      try {
        await removeTechnicianDistrictPermission(selectedTechForPermission._id, districtId);
        toast({ title: "Permission Revoked", description: "District permission removed.", status: "success", duration: 3000, isClosable: true });
        await refreshPermissions(selectedTechForPermission._id);
        await fetchData();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to remove permission.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleToggleZonePermission = async (zoneId, isCurrentlyEnabled, districtName) => {
      if (!selectedTechForPermission) return;
      try {
        if (isCurrentlyEnabled) {
          await disableTechnicianZonePermission(selectedTechForPermission._id, zoneId);
          toast({ title: "Zone Permission Revoked", status: "success", duration: 2000, isClosable: true });
        } else {
          await enableTechnicianZonePermission(selectedTechForPermission._id, zoneId);
          toast({ title: "Zone Permission Enabled", status: "success", duration: 2000, isClosable: true });
        }
        const zoneRes = await getTechnicianZonePermissions(selectedTechForPermission._id);
        setTechZonePermissions(zoneRes || null);
      } catch (err) {
        toast({
          title: "Zone Permission Validation Error",
          description: err.message || `District permission for "${districtName || "this district"}" must be enabled before granting zone access.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };

    // Zone Helpers — robust id / district / polygon resolution.
    // Backend has returned zones with mixed shapes across versions
    // (_id vs zoneId vs id, operationalCityId vs districtId, polygon as
    // object vs JSON string vs coordinate array), so normalize here instead
    // of silently dropping data on edit/save.
    const resolveZoneId = (zone) => {
      if (!zone) return "";
      return zone._id || zone.zoneId || zone.id || "";
    };

    const resolveZoneDistrictId = (zone) => {
      if (!zone) return "";
      const ref =
        zone.operationalCityId ??
        zone.districtId ??
        zone.operationalCity ??
        zone.district ??
        "";
      if (!ref) return "";
      if (typeof ref === "string") return ref;
      if (typeof ref === "object") return ref._id || ref.districtId || ref.id || "";
      return "";
    };

    const stringifyZonePolygon = (zone) => {
      if (!zone) return "";
      const raw = zone.polygon ?? zone.boundary ?? zone.geoJson ?? zone.polygonCoordinates ?? "";
      if (!raw) return "";
      if (typeof raw === "string") {
        // Accept already-stringified GeoJSON; pretty-print when possible.
        try {
          return JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
          return raw;
        }
      }
      if (typeof raw === "object") {
        try {
          return JSON.stringify(raw, null, 2);
        } catch {
          return "";
        }
      }
      return "";
    };

    const parseZonePolygonInput = (input) => {
      if (!input || !String(input).trim()) return { polygon: null, error: "" };
      let parsed;
      try {
        parsed = JSON.parse(String(input));
      } catch {
        return { polygon: null, error: "Invalid polygon JSON format. Paste a GeoJSON Polygon object or a coordinate array." };
      }
      // Allow raw coordinate array: [[[lng,lat],...]] or [[lng,lat],...]
      if (Array.isArray(parsed)) {
        const coords = Array.isArray(parsed[0]?.[0])
          ? parsed
          : Array.isArray(parsed[0])
            ? [parsed]
            : null;
        if (!coords) return { polygon: null, error: "Invalid polygon coordinates array." };
        parsed = { type: "Polygon", coordinates: coords };
      }
      if (!parsed || parsed.type !== "Polygon" || !Array.isArray(parsed.coordinates)) {
        return { polygon: null, error: "Polygon must be a GeoJSON Polygon: { \"type\": \"Polygon\", \"coordinates\": [...] }." };
      }
      const rings = parsed.coordinates;
      if (!rings.length || !Array.isArray(rings[0]) || rings[0].length < 4) {
        return { polygon: null, error: "Polygon ring needs at least 4 positions (first == last)." };
      }
      for (const [lng, lat] of rings[0]) {
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          return { polygon: null, error: "Polygon positions must be numbers as [lng, lat]." };
        }
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          return { polygon: null, error: `Position [${lng}, ${lat}] is out of lng/lat range.` };
        }
      }
      // Auto-close ring if user forgot to repeat first point.
      const ring = rings[0];
      const first = ring[0];
      const last = ring[ring.length - 1];
      const isClosed = first[0] === last[0] && first[1] === last[1];
      const closed = isClosed ? rings : [[...ring, [...first]], ...rings.slice(1)];
      return { polygon: { type: "Polygon", coordinates: closed }, error: "" };
    };

    // Zone Handlers
    const handleOpenCreateZone = (presetDistrictId) => {
      setIsEditing(false);
      setSelectedZone(null);
      setZoneModalError("");
      const districtId =
        presetDistrictId ||
        (selectedDistrictFilter !== "all" ? selectedDistrictFilter : "") ||
        "";
      // Pre-generate a sensible default boundary from the parent district city
      // so "Create" never goes out with an empty polygon by accident.
      let defaultPolyStr = "";
      if (districtId) {
        const parent = districts.find((d) => String(d._id) === String(districtId));
        const cityName = parent?.city || parent?.name || "";
        const preset = TAMIL_NADU_CITIES.find(
          (c) => c.name.toLowerCase().trim() === String(cityName).toLowerCase().trim()
        );
        if (preset) {
          defaultPolyStr = JSON.stringify(generateCircularGeoJSON(preset.lat, preset.lng, 5), null, 2);
        } else if (parent?.polygon?.coordinates) {
          try {
            defaultPolyStr = JSON.stringify(parent.polygon, null, 2);
          } catch {
            defaultPolyStr = "";
          }
        }
      }
      setFormData({ ...initialForm, operationalCityId: districtId, polygonCoordinates: defaultPolyStr });
      setIsModalOpen(true);
    };

    const handleOpenEditZone = (zone) => {
      setIsEditing(true);
      setSelectedZone(zone);
      setZoneModalError("");

      setFormData({
        operationalCityId: resolveZoneDistrictId(zone),
        name: zone.name || "",
        zoneCode: zone.zoneCode || zone.code || "",
        description: zone.description || "",
        active: zone.active !== false,
        polygonCoordinates: stringifyZonePolygon(zone),
      });
      setIsModalOpen(true);
    };

    const handleSubmitZone = async () => {
      setZoneModalError("");

      const name = String(formData.name || "").trim();
      const zoneCode = String(formData.zoneCode || "").trim().toUpperCase();
      const operationalCityId = String(formData.operationalCityId || "").trim();
      const description = String(formData.description || "").trim();

      if (!name) {
        const msg = "Zone Name is required.";
        setZoneModalError(msg);
        return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
      }
      if (!operationalCityId) {
        const msg = "Please select an Operational District.";
        setZoneModalError(msg);
        return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
      }
      if (!zoneCode) {
        const msg = "Zone Code is required.";
        setZoneModalError(msg);
        return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
      }

      const { polygon, error: polyError } = parseZonePolygonInput(formData.polygonCoordinates);
      if (polyError) {
        setZoneModalError(polyError);
        return toast({ title: "Validation Error", description: polyError, status: "error", duration: 4000, isClosable: true });
      }
      if (!polygon) {
        const msg = "Zone boundary is required. Click the map or use a 5/10/15/25 KM preset to generate it.";
        setZoneModalError(msg);
        return toast({ title: "Validation Error", description: msg, status: "error", duration: 4000, isClosable: true });
      }

      try {
        setIsSubmitting(true);
        const payload = {
          operationalCityId,
          districtId: operationalCityId,
          name,
          zoneCode,
          description,
          active: formData.active !== false,
          polygon,
        };

        if (isEditing && selectedZone) {
          const zid = resolveZoneId(selectedZone);
          if (!zid) throw new Error("Cannot update: zone id is missing. Please refresh and retry.");
          await updateZone(zid, payload);
          toast({ title: "Zone Updated", description: `"${name}" updated successfully.`, status: "success", duration: 3000, isClosable: true });
        } else {
          await createZone(payload);
          toast({ title: "Zone Created", description: `"${name}" created successfully.`, status: "success", duration: 3000, isClosable: true });
        }

        await fetchData();
        setIsModalOpen(false);
        setFormData({ ...initialForm });
        setSelectedZone(null);
      } catch (err) {
        const errMsg = err.message || "Failed to save zone.";
        setZoneModalError(errMsg);
        toast({ title: "Error", description: errMsg, status: "error", duration: 4000, isClosable: true });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleActivateDistrict = async (dist) => {
      try {
        await activateOperationalCity(dist._id);
        toast({
          title: "Operational City Activated",
          description: `"${dist.name}" is now the active operational hub.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        await fetchData();
      } catch (err) {
        toast({ title: "Activation Error", description: err.message || "Failed to activate city.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleDeleteDistrictPrompt = (dist) => {
      setItemToDelete(dist);
      setDeleteType("district");
      setIsDeleteDialogOpen(true);
    };

    const handleDeleteZonePrompt = (zone) => {
      setItemToDelete(zone);
      setDeleteType("zone");
      setIsDeleteDialogOpen(true);
    };

    const handleToggleZoneServicesBulk = async (zone, nextActive) => {
      try {
        await toggleZoneServices(zone._id, nextActive);
        toast({
          title: `Zone Services ${nextActive ? "Enabled" : "Disabled"}`,
          description: `All services in "${zone.name}" are now ${nextActive ? "ACTIVE" : "INACTIVE"}.`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        await fetchData();
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Toggle Error", description: err.message || "Failed to toggle zone services.", status: "error", duration: 3000, isClosable: true });
      }
    };

    const handleConfirmDelete = async () => {
      if (!itemToDelete) return;
      try {
        setDeleteLoading(true);
        if (deleteType === "zone") {
          await deleteZone(itemToDelete._id);
          toast({ title: "Zone Deleted", description: `"${itemToDelete.name}" deleted.`, status: "success", duration: 3000, isClosable: true });
        } else if (deleteType === "district") {
          await deleteDistrict(itemToDelete._id);
          toast({ title: "District Deleted", description: `"${itemToDelete.name}" deleted.`, status: "success", duration: 3000, isClosable: true });
        }
        await fetchData();
        setIsDeleteDialogOpen(false);
      } catch (err) {
        toast({ title: "Delete Error", description: err.message || "Operation failed.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setDeleteLoading(false);
      }
    };

    // --- TECHNICIAN GEOFENCE VERIFICATION HANDLERS ---
    const handleOpenTechGeofenceModal = async (tech) => {
      try {
        setIsTechGeofenceLoading(true);
        setSelectedTechForPermission(tech);
        const res = await getTechnicianGeofenceDetails(tech._id);
        const detail = res?.result || res?.data || res;
        setTechGeofenceDetail(detail);
        setTechLocationVerified(detail?.isLocationVerified !== false);
        setTechOverrideMismatch(detail?.overrideMismatch === true);
        setTechVerificationNotes(detail?.verificationNotes || "");
      } catch (err) {
        console.warn("Geofence detail error:", err);
      } finally {
        setIsTechGeofenceLoading(false);
      }
    };

    const handleSaveTechGeofenceVerification = async () => {
      if (!selectedTechForPermission) return;
      try {
        setIsUpdatingVerification(true);
        const action = techLocationVerified ? "APPROVE" : "REJECT";
        await updateTechnicianGeofenceVerification(selectedTechForPermission._id, {
          action,
          isLocationVerified: techLocationVerified,
          overrideMismatch: techOverrideMismatch,
          verificationNotes: techVerificationNotes,
          notes: techVerificationNotes,
        });
        toast({
          title: "Geofence Verification Updated",
          description: `Technician GPS validation status updated to ${action}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        await refreshPermissions(selectedTechForPermission._id);
        await fetchData();
      } catch (err) {
        toast({ title: "Verification Update Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsUpdatingVerification(false);
      }
    };

    // --- DIAGNOSTICS & MONITORING HANDLERS ---
    const handleFetchSpatialHierarchy = async () => {
      try {
        setIsLoadingSpatialTree(true);
        const res = await getSpatialHierarchy();
        const tree = res?.result || res?.data || res?.tree || res || [];
        setSpatialTree(Array.isArray(tree) ? tree : []);
        toast({ title: "Spatial Hierarchy Refreshed", status: "info", duration: 1500, isClosable: true });
      } catch (err) {
        toast({ title: "Spatial Hierarchy Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsLoadingSpatialTree(false);
      }
    };

    const handleFetchDistrictDashboard = async (distId) => {
      if (!distId) return;
      try {
        setIsLoadingDistrictDashboard(true);
        setSelectedDashboardDistrictId(distId);
        const [dashRes, impactRes] = await Promise.all([
          getDistrictDashboardDetails(distId).catch(() => null),
          getZoneImpactAnalysis(distId).catch(() => null),
        ]);
        setDistrictDashboardData(dashRes?.result || dashRes?.data || dashRes || null);
        setImpactAnalysisData(impactRes?.result || impactRes?.data || impactRes || null);
      } catch (err) {
        console.warn("District dashboard error:", err);
      } finally {
        setIsLoadingDistrictDashboard(false);
      }
    };

    const handleInspectJobAndAudit = async () => {
      if (!inspectJobId.trim()) {
        return toast({ title: "Enter Booking ID", status: "warning", duration: 2500, isClosable: true });
      }
      try {
        setIsInspectingJob(true);
        const [locRes, auditRes] = await Promise.all([
          inspectActiveJobLocation(inspectJobId.trim()).catch(() => null),
          auditJobBroadcast(inspectJobId.trim()).catch(() => null),
        ]);
        setJobLocationInspectData(locRes?.result || locRes?.data || locRes || null);
        setBroadcastAuditData(auditRes?.result || auditRes?.data || auditRes || null);
        toast({ title: "Job Location Inspection Complete", status: "success", duration: 2000, isClosable: true });
      } catch (err) {
        toast({ title: "Inspection Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsInspectingJob(false);
      }
    };

    const handleRunDispatchDebug = async () => {
      if (!debugDistrictId) {
        return toast({ title: "Select District", status: "warning", duration: 2500, isClosable: true });
      }
      try {
        setIsLoadingDispatchDebug(true);
        // getDispatchDebug(paramsObject) — 2nd positional arg would be treated as bookingId,
        // so always pass an object with districtId + serviceId.
        const res = await getDispatchDebug({
          districtId: debugDistrictId,
          ...(debugServiceId ? { serviceId: debugServiceId } : {}),
        });
        setDispatchDebugData(res?.result || res?.data || res || null);
        toast({ title: "Dispatch Diagnostics Complete", status: "success", duration: 2000, isClosable: true });
      } catch (err) {
        toast({ title: "Diagnostics Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsLoadingDispatchDebug(false);
      }
    };

    const handleRollbackPolygonSubmit = async () => {
      if (!rollbackEntityId) {
        return toast({ title: "Select District / Entity", status: "warning", duration: 2500, isClosable: true });
      }
      try {
        setIsRollingBack(true);
        await rollbackPolygonVersion({
          entityType: rollbackEntityType || "OperationalCity",
          entityId: rollbackEntityId,
          targetVersion: Number(rollbackVersion) || 1,
          reason: rollbackReason || "Restoring previous polygon version from audit log",
        });
        toast({ title: "Polygon Restored", description: "Polygon version restored successfully.", status: "success", duration: 3000, isClosable: true });
        await fetchData();
      } catch (err) {
        toast({ title: "Rollback Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsRollingBack(false);
      }
    };

    const handleTestCustomerLocationServiceability = async () => {
      if (!customerTestLat || !customerTestLng) {
        toast({ title: "Coordinates Required", description: "Please enter customer latitude and longitude.", status: "warning", duration: 3000, isClosable: true });
        return;
      }

      try {
        setIsTestingCustomerService(true);
        setCustomerTestResult(null);

        const lat = parseFloat(customerTestLat);
        const lng = parseFloat(customerTestLng);

        // 1. Resolve Customer Zone from coordinates (Section 3.1)
        const resolveRes = await resolveCustomerZone(lat, lng).catch((err) => ({
          success: false,
          error: err.message,
        }));

        // 2. Check Service Availability if a service is selected (Section 3.2)
        let checkServiceRes = null;
        if (customerTestServiceId) {
          checkServiceRes = await checkCustomerServiceAvailability(customerTestServiceId, lat, lng).catch((err) => ({
            isAvailable: false,
            reason: err.message,
          }));
        }

        // 3. Find target service and district objects
        const targetService = services.find((s) => String(s._id) === String(customerTestServiceId));
        const targetDistrict = districts.find((d) => {
          if (resolveRes?.districtId || resolveRes?.operationalCityId) {
            return String(d._id) === String(resolveRes.districtId || resolveRes.operationalCityId);
          }
          return false;
        });

        // 4. Governance Status Evaluation:
        const isGlobalActive = targetService ? targetService.isActive !== false : null;
        const districtResolvedName = resolveRes?.operationalCity || resolveRes?.district || targetDistrict?.name || (resolveRes?.success ? "Operational District Detected" : "Outside Operational Coverage");
        const isDistrictServiceEnabled = targetDistrict ? isDistrictServiceActive(targetDistrict) : true;
        const finalServiceable = (isGlobalActive !== false) && (resolveRes?.success !== false) && (checkServiceRes?.isAvailable !== false);

        setCustomerTestResult({
          resolve: resolveRes,
          serviceCheck: checkServiceRes,
          targetService,
          targetDistrict,
          isGlobalActive,
          districtResolvedName,
          isDistrictServiceEnabled,
          finalServiceable,
        });

        toast({
          title: finalServiceable ? "Location Serviceable" : "Location Unserviceable",
          description: finalServiceable
            ? "Service is active and available for customer bookings at this address."
            : (checkServiceRes?.reason || (!isGlobalActive ? "Service is globally inactive." : "Service is disabled in this district/zone.")),
          status: finalServiceable ? "success" : "warning",
          duration: 3500,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Test Failed",
          description: err.message || "Failed to test customer location serviceability.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        setIsTestingCustomerService(false);
      }
    };

    // --- NEW TOOL HANDLERS ---
    const handleValidateGeoJSONTool = async () => {
      if (!geoToolPolygon.trim()) return;
      try {
        setIsValidatingGeo(true);
        let parsed = null;
        try {
          parsed = JSON.parse(geoToolPolygon);
        } catch (e) {
          toast({ title: "JSON Syntax Error", description: "Input is not valid JSON.", status: "error", duration: 3000 });
          return;
        }
        const [valRes, overlapRes, containRes] = await Promise.all([
          validateGeofencePolygon({ polygon: parsed }).catch((e) => ({ isValid: false, error: e.message })),
          geoToolDistrictId ? checkPolygonOverlap(geoToolDistrictId, parsed).catch(() => null) : Promise.resolve(null),
          geoToolDistrictId ? checkParentBoundaryContainment(geoToolDistrictId, parsed).catch(() => null) : Promise.resolve(null),
        ]);

        setGeoValidationResult({
          validation: valRes,
          overlap: overlapRes,
          containment: containRes,
          parsed,
        });
        toast({ title: "Validation Complete", status: "success", duration: 2000 });
      } catch (err) {
        toast({ title: "Error", description: err.message, status: "error" });
      } finally {
        setIsValidatingGeo(false);
      }
    };

    const handleRunEligibilityDiagnostics = async () => {
      if (!diagTechId) return toast({ title: "Select Technician", status: "warning", duration: 2000 });
      try {
        setIsDiagnosing(true);
        const res = await checkTechnicianJobEligibility(diagTechId, {
          serviceId: diagServiceId || undefined,
          jobLat: parseFloat(diagJobLat) || 11.0168,
          jobLng: parseFloat(diagJobLng) || 76.9558,
          bookingId: diagBookingId || undefined,
        });
        const distRes = await diagnoseDistanceAndGeofence(diagTechId, diagBookingId).catch(() => null);
        setDiagResult({ eligibility: res, distance: distRes });
        toast({ title: "Diagnostics Complete", status: "success", duration: 2000 });
      } catch (err) {
        toast({ title: "Diagnostic Error", description: err.message, status: "error" });
      } finally {
        setIsDiagnosing(false);
      }
    };

    const handleRunUnavailabilityDebug = async () => {
      if (!unavailBookingId.trim()) return toast({ title: "Enter Booking ID", status: "warning", duration: 2000 });
      try {
        setIsDebugUnavail(true);
        const res = await debugUnavailability(unavailBookingId.trim());
        setUnavailResult(res);
        toast({ title: "Debug Audit Generated", status: "success", duration: 2000 });
      } catch (err) {
        toast({ title: "Debug Error", description: err.message, status: "error" });
      } finally {
        setIsDebugUnavail(false);
      }
    };

    const getDistrictNameById = (id) => {
      if (!id) return "N/A";
      const d = districts.find((dist) => dist._id === (id._id || id));
      if (d) return `${d.name} (${d.city})`;
      const c = cities.find((ct) => ct._id === (id._id || id));
      return c?.name || "N/A";
    };

    const getDistrictRecord = (ref, cityNameFallback) => {
      if (ref) {
        const id = ref._id || ref;
        const byId = districts.find((d) => d._id === id);
        if (byId) return byId;
        if (ref?.name) {
          const byRefName = districts.find((d) => d.name?.toLowerCase() === ref.name.toLowerCase());
          if (byRefName) return byRefName;
        }
      }
      if (cityNameFallback) {
        const byCity = districts.find(
          (d) => d.city?.toLowerCase() === cityNameFallback.toLowerCase() || d.name?.toLowerCase() === cityNameFallback.toLowerCase()
        );
        if (byCity) return byCity;
      }
      return null;
    };

    const getOperationalStatus = (districtRecord, cityNameFallback) => {
      if (!districtRecord) {
        return {
          label: cityNameFallback ? `Registered: ${cityNameFallback}` : "No City Assigned",
          tone: "neutral",
        };
      }
      const isActive = districtRecord.active !== false && districtRecord.isActive !== false;
      const regOk = districtRecord.isRegistrationEnabled !== false;
      const jobsOk = districtRecord.isJobEnabled !== false;
      if (!isActive) return { label: `${districtRecord.name} (Inactive)`, tone: "inactive" };
      if (!regOk && !jobsOk) return { label: `${districtRecord.name} (Off)`, tone: "neutral" };
      if (!regOk) return { label: `${districtRecord.name} (Reg Off)`, tone: "neutral" };
      if (!jobsOk) return { label: `${districtRecord.name} (Jobs Off)`, tone: "neutral" };
      return { label: `${districtRecord.name} (Live)`, tone: "active" };
    };

    if (!currentUser) return null;

    // ---------------------------------------------------------------------
    // Small presentational helpers
    // ---------------------------------------------------------------------
    const StatusPill = ({ tone = "neutral", children }) => {
      const c = STATUS_COLORS[tone] || STATUS_COLORS.neutral;
      return (
        <HStack
          spacing={1.5}
          px={2.5}
          py={1}
          borderRadius="full"
          bg={c.bg}
          border="1px solid"
          borderColor={`${c.ring}33`}
          display="inline-flex"
          w="fit-content"
        >
          <Box w="6px" h="6px" borderRadius="full" bg={c.fg} flexShrink={0} />
          <Text as="span" fontSize="xs" fontWeight="600" color={c.fg} whiteSpace="nowrap">
            {children}
          </Text>
        </HStack>
      );
    };

    const MiniToggle = ({ label, isChecked, onChange, colorScheme }) => (
      <VStack spacing={1} align="center">
        <Switch size="sm" isChecked={isChecked} onChange={onChange} colorScheme={colorScheme} />
        <Text as="span" fontSize="10px" color="gray.500" fontWeight="500" whiteSpace="nowrap">
          {label}
        </Text>
      </VStack>
    );

    const statCards = [
      {
        key: "total-districts",
        label: "Operational Districts",
        value: stats.totalDistricts,
        icon: MdApartment,
        accent: BRAND,
        iconBg: "teal.50",
        iconColor: BRAND,
        isActive: activeTab === 0,
        onClick: () => handleStatCardClick(0, "all"),
      },
      {
        key: "total-zones",
        label: "City Micro-Zones",
        value: stats.totalZones,
        icon: MdMap,
        accent: "#8B5CF6",
        iconBg: "purple.50",
        iconColor: "#8B5CF6",
        isActive: activeTab === 1,
        onClick: () => handleStatCardClick(1),
      },
      {
        key: "service-mappings",
        label: "Service-Zone Matrix",
        value: matrixData.length || services.length,
        icon: MdLink,
        accent: "#6366F1",
        iconBg: "blue.50",
        iconColor: "#6366F1",
        isActive: activeTab === 2,
        onClick: () => handleStatCardClick(2),
      },
      {
        key: "total-technicians",
        label: "Technician Permissions",
        value: stats.totalTechnicians,
        icon: FaUserGear,
        accent: "#10B981",
        iconBg: "emerald.50",
        iconColor: "#10B981",
        isActive: activeTab === 3,
        onClick: () => handleStatCardClick(3),
      },
    ];

    return (
      <Flex
        flexDirection="column"
        pt={{ base: "50px", md: "45px" }}
        pb="10px"
        px={{ base: 2, md: 4 }}
        h={{ base: "auto", md: "calc(100vh - 40px)" }}
        maxH={{ base: "none", md: "calc(100vh - 40px)" }}
        overflowY={{ base: "auto", md: "hidden" }}
        css={globalScrollbarStyles}
      >
        {/* ------------------------------------------------------------- */}
        {/* Overview strip — four equal, aligned filter cards              */}
        {/* ------------------------------------------------------------- */}
        <Box flexShrink={0} mb={3}>
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={{ base: 2.5, md: 3 }}>
            {statCards.map((card) => (
              <Box
                key={card.key}
                role="button"
                tabIndex={0}
                onClick={card.onClick}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") card.onClick(); }}
                cursor="pointer"
                textAlign="left"
                bg="white"
                borderRadius="12px"
                border="1.5px solid"
                borderColor={card.isActive ? card.accent : SURFACE_BORDER}
                boxShadow={card.isActive ? `0 0 0 3px ${card.accent}22` : "0 1px 3px rgba(16,24,40,0.05)"}
                transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
                px={3.5}
                py={2.5}
                _hover={{ borderColor: card.accent, transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(16,24,40,0.08)" }}
                _focusVisible={{ outline: "2px solid", outlineColor: card.accent, outlineOffset: "2px" }}
              >
                <Flex align="center" justify="space-between" gap={2}>
                  <Box minW={0} flex="1">
                    <Text fontSize="xs" color="gray.500" fontWeight="600" noOfLines={1} letterSpacing="0.2px">
                      {card.label}
                    </Text>
                    <Text as="div" fontSize="xl" fontWeight="800" color={INK} lineHeight="1.2" mt={0.5}>
                      {card.value}
                    </Text>
                  </Box>
                  <Flex
                    align="center"
                    justify="center"
                    w="38px"
                    h="38px"
                    borderRadius="10px"
                    bg={card.iconBg}
                    color={card.iconColor}
                    flexShrink={0}
                    boxShadow="xs"
                  >
                    <Icon as={card.icon} boxSize="18px" />
                  </Flex>
                </Flex>
                <Flex align="center" justify="space-between" mt={1.5} pt={1.5} borderTop="1px solid" borderColor="gray.100">
                  <Text fontSize="10px" color={card.isActive ? card.accent : "gray.400"} fontWeight="700">
                    {card.isActive ? "● Active View" : "View Details"}
                  </Text>
                  <Icon as={FaChevronRight} boxSize="8px" color={card.isActive ? card.accent : "gray.300"} />
                </Flex>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* ------------------------------------------------------------- */}
        {/* Main panel                                                     */}
        {/* ------------------------------------------------------------- */}
        <Box flex="1" minH="0" display="flex" flexDirection="column" overflow="hidden">
          <Card bg="white" flex="1" minH="0" borderRadius="16px" display="flex" flexDirection="column" shadow="sm" border="1px solid" borderColor="gray.200" overflow="hidden">
            <CardHeader p={{ base: 3, md: 4 }} pb={0} borderBottom="none" flexShrink={0}>
              <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} flexWrap="wrap" gap={3} mb={3}>
                <Box>
                  <Heading size="md" color={INK} fontWeight="800" letterSpacing="-0.02em">
                    RightTouch Zone &amp; Geofencing Governance
                  </Heading>
                  <Text fontSize="xs" color="gray.500" mt={0.5} fontWeight="500">
                    Manage operational districts, micro-zones, service matrices, technician permissions, and spatial telemetry
                  </Text>
                </Box>

                <HStack spacing={2} flexWrap="wrap">
                  {activeTab === 0 && (
                    <Button
                      leftIcon={<MdAdd />}
                      size="sm"
                      bg={BRAND}
                      color="white"
                      borderRadius="8px"
                      fontWeight="600"
                      boxShadow="sm"
                      _hover={{ bg: BRAND_DARK, transform: "translateY(-1px)" }}
                      onClick={handleOpenCreateDistrict}
                    >
                      Add District
                    </Button>
                  )}
                  {activeTab === 1 && (
                    <Button
                      leftIcon={<MdAdd />}
                      size="sm"
                      bg="purple.600"
                      color="white"
                      borderRadius="8px"
                      fontWeight="600"
                      boxShadow="sm"
                      _hover={{ bg: "purple.700", transform: "translateY(-1px)" }}
                      onClick={handleOpenCreateZone}
                    >
                      Add City Zone
                    </Button>
                  )}
                  {activeTab === 4 && (
                    <Button
                      leftIcon={<MdRefresh />}
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      borderColor="gray.300"
                      fontWeight="600"
                      onClick={() => {
                        fetchHealthAndMonitor();
                        handleFetchSpatialHierarchy();
                      }}
                    >
                      Refresh Telemetry
                    </Button>
                  )}
                </HStack>
              </Flex>

              {/* Tabs Bar — 5 Core Operational Modules */}
              <HStack spacing={2} overflowX="auto" pb={2} pt={1} css={globalScrollbarStyles}>
                {[
                  { icon: MdApartment, label: "1. District Master", count: districts.length },
                  { icon: MdMap, label: "2. City Micro-Zones", count: zones.length },
                  { icon: MdLink, label: "3. Service-Zone Matrix", count: matrixData.length || services.length },
                  { icon: FaUserGear, label: "4. Technician Permissions", count: technicians.length },
                  { icon: MdAnalytics, label: "5. Spatial Diagnostics & Monitoring" },
                ].map((t, idx) => (
                  <Button
                    key={t.label}
                    size="sm"
                    onClick={() => { setActiveTab(idx); setCurrentPage(1); }}
                    bg={activeTab === idx ? BRAND : "gray.50"}
                    color={activeTab === idx ? "white" : "gray.700"}
                    fontWeight={activeTab === idx ? "700" : "600"}
                    borderRadius="10px"
                    px={4}
                    py={2}
                    border="1px solid"
                    borderColor={activeTab === idx ? BRAND : "gray.200"}
                    boxShadow={activeTab === idx ? "sm" : "none"}
                    leftIcon={<Icon as={t.icon} boxSize={4} />}
                    _hover={{ bg: activeTab === idx ? BRAND_DARK : "gray.100" }}
                    flexShrink={0}
                  >
                    {t.label}
                    {t.count !== undefined && (
                      <Badge
                        ml={2}
                        bg={activeTab === idx ? "whiteAlpha.300" : "gray.200"}
                        color={activeTab === idx ? "white" : "gray.700"}
                        borderRadius="full"
                        fontSize="10px"
                        px={2}
                        py={0.5}
                        fontWeight="700"
                      >
                        {t.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </HStack>

              {/* Toolbar — search + district scope + reset */}
              {(activeTab === 0 || activeTab === 1 || activeTab === 3) && (
                <Flex
                  align="center"
                  gap={2.5}
                  mt={3}
                  py={2.5}
                  px={3.5}
                  bg={SURFACE_MUTED}
                  borderRadius="10px"
                  border="1px solid"
                  borderColor="gray.200"
                  flexWrap="wrap"
                >
                  <Icon as={MdFilterList} color="gray.500" boxSize={4} />
                  <Box position="relative" flex={{ base: "1 1 100%", sm: "0 1 260px" }}>
                    <Icon as={MdSearch} position="absolute" left="10px" top="50%" transform="translateY(-50%)" color="gray.400" boxSize={4} />
                    <Input
                      placeholder="Search by name, code, city..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      size="sm"
                      pl="32px"
                      borderRadius="8px"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                    />
                  </Box>

                  {(activeTab === 1 || activeTab === 3) && (
                    <Select
                      size="sm"
                      w={{ base: "100%", sm: "220px" }}
                      borderRadius="8px"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      value={selectedDistrictFilter}
                      onChange={(e) => { setSelectedDistrictFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All Operational Districts</option>
                      {districts.map((d) => (
                        <option key={d._id} value={d._id}>{d.name} ({d.city})</option>
                      ))}
                    </Select>
                  )}

                  {activeTab === 3 && (
                    <Select
                      size="sm"
                      w={{ base: "100%", sm: "190px" }}
                      borderRadius="8px"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      value={permissionFilter}
                      onChange={(e) => { setPermissionFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All Permissions</option>
                      <option value="multi_district">Multi-District Granted</option>
                      <option value="single_district">Primary District Only</option>
                    </Select>
                  )}

                  {(searchTerm || districtFilter !== "all" || selectedDistrictFilter !== "all" || permissionFilter !== "all") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<MdClear />}
                      color="gray.500"
                      onClick={handleClearFilters}
                    >
                      Reset
                    </Button>
                  )}

                  <Box flex="1" />

                  <Button
                    leftIcon={<MdRefresh />}
                    size="sm"
                    variant="outline"
                    borderRadius="8px"
                    borderColor="gray.300"
                    color="gray.700"
                    onClick={fetchData}
                    isLoading={isLoading}
                  >
                    Refresh
                  </Button>
                </Flex>
              )}
            </CardHeader>

            <CardBody bg="white" display="flex" flexDirection="column" p={0} pt={2} flex="1" minH="0" overflow="hidden">
              <Tabs index={activeTab} onChange={(idx) => { setActiveTab(idx); setCurrentPage(1); }} variant="unstyled" display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                <TabList display="none">
                  <Tab /><Tab /><Tab /><Tab /><Tab />
                </TabList>

                <TabPanels flex="1" minH="0" display="flex" flexDirection="column" overflow="hidden">
                  {/* TAB 0: OPERATIONAL CITIES & DISTRICT MASTER (1.1) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    <Box
                      overflowY="auto"
                      overflowX="auto"
                      flex="1"
                      minH="0"
                      css={globalScrollbarStyles}
                    >
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50" position="sticky" top={0} zIndex={3} boxShadow="0 1px 0 0 #e2e8f0">
                          <Tr>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">DISTRICT</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">OPERATIONAL RANGE (CITY)</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">CODE</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="center" whiteSpace="nowrap">SERVICE CONTROLS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">POLYGON</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentDistricts.length === 0 ? (
                            <Tr><Td colSpan={7} textAlign="center" py={10} color="gray.500">No operational districts found. Click "Add District" to create one.</Td></Tr>
                          ) : (
                            currentDistricts.map((dist, idx) => {
                              const isActive = dist.active !== false && dist.isActive !== false;
                              return (
                                <Tr key={dist._id} _hover={{ bg: "teal.50" }} transition="background 0.15s">
                                  <Td fontWeight="600" color="gray.400" py={3}>{indexOfFirstItem + idx + 1}</Td>
                                  <Td py={3}>
                                    <Text fontWeight="700" color={INK}>{dist.name}</Text>
                                    <StatusPill tone={isActive ? "active" : "inactive"}>
                                      {isActive ? "Active" : "Inactive"}
                                    </StatusPill>
                                  </Td>
                                  <Td py={3}>
                                    <HStack spacing={1.5}>
                                      <Icon as={MdLocationOn} color={BRAND} boxSize={3.5} />
                                      <Text fontWeight="500">{dist.city}{dist.state ? `, ${dist.state}` : ""}</Text>
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <Tag size="sm" colorScheme="blue" borderRadius="6px" fontWeight="600">{dist.code || "N/A"}</Tag>
                                  </Td>
                                  <Td py={3}>
                                    <HStack spacing={4} justify="center">
                                      <MiniToggle
                                        label="Active"
                                        isChecked={isActive}
                                        onChange={() => handleToggleDistrictActive(dist)}
                                        colorScheme="teal"
                                      />
                                      <MiniToggle
                                        label="Registration"
                                        isChecked={dist.isRegistrationEnabled !== false}
                                        onChange={() => handleToggleDistrictRegistrationFlag(dist)}
                                        colorScheme="green"
                                      />
                                      <MiniToggle
                                        label="Job Dispatch"
                                        isChecked={dist.isJobEnabled !== false}
                                        onChange={() => handleToggleDistrictJobFlag(dist)}
                                        colorScheme="purple"
                                      />
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <Badge colorScheme={dist.polygon ? "teal" : "gray"} borderRadius="full" px={2.5} fontWeight="500">
                                      {dist.polygon ? "Configured" : "Not set"}
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="right">
                                    <HStack spacing={1} justify="flex-end">
                                      <Tooltip label="Activate as Operational City Hub">
                                        <IconButton
                                          size="xs"
                                          icon={<MdCheckCircle />}
                                          colorScheme="green"
                                          variant="ghost"
                                          onClick={() => handleActivateDistrict(dist)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="View Real-Time Map Range">
                                        <IconButton
                                          size="xs"
                                          icon={<MdMap />}
                                          colorScheme="purple"
                                          variant="ghost"
                                          onClick={() => handleOpenViewMapModal(dist)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="View Technicians">
                                        <IconButton
                                          size="xs"
                                          icon={<MdVisibility />}
                                          colorScheme="blue"
                                          variant="ghost"
                                          onClick={() => handleViewDistrictTechnicians(dist)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Edit District">
                                        <IconButton
                                          size="xs"
                                          icon={<MdEdit />}
                                          colorScheme="teal"
                                          variant="ghost"
                                          onClick={() => handleOpenEditDistrict(dist)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Delete District">
                                        <IconButton
                                          size="xs"
                                          icon={<MdDelete />}
                                          colorScheme="red"
                                          variant="ghost"
                                          onClick={() => handleDeleteDistrictPrompt(dist)}
                                        />
                                      </Tooltip>
                                    </HStack>
                                  </Td>
                                </Tr>
                              );
                            })
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* TAB 1: CITY MICRO-ZONES / SUB-ZONES (1.2) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    <Box
                      overflowY="auto"
                      overflowX="auto"
                      flex="1"
                      minH="0"
                      css={globalScrollbarStyles}
                    >
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50" position="sticky" top={0} zIndex={3} boxShadow="0 1px 0 0 #e2e8f0">
                          <Tr>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">MICRO-ZONE NAME</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">ZONE CODE</Th>
                            <Th bg="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PARENT DISTRICT</Th>
                            <Th bg="gray.500" py={3} fontSize="10px" textAlign="center" whiteSpace="nowrap">ZONE STATUS</Th>
                            <Th bg="gray.500" py={3} fontSize="10px" textAlign="center" whiteSpace="nowrap">ALL SERVICES IN ZONE</Th>
                            <Th bg="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">POLYGON</Th>
                            <Th bg="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentZones.length === 0 ? (
                            <Tr><Td colSpan={8} textAlign="center" py={10} color="gray.500">No city micro-zones found. Click "Add City Zone" to create one.</Td></Tr>
                          ) : (
                            currentZones.map((zone, idx) => {
                              const isZoneActive = zone.active !== false;
                              const parentDist = districts.find((d) => d._id === (zone.operationalCityId?._id || zone.operationalCityId));
                              const parentName = parentDist ? `${parentDist.name} (${parentDist.city})` : (zone.operationalCityId?.name || "N/A");

                              return (
                                <Tr key={zone._id} _hover={{ bg: "purple.50" }} transition="background 0.15s">
                                  <Td fontWeight="600" color="gray.400" py={3}>{indexOfFirstItem + idx + 1}</Td>
                                  <Td py={3}>
                                    <Text fontWeight="700" color={INK}>{zone.name}</Text>
                                    <StatusPill tone={isZoneActive ? "active" : "inactive"}>
                                      {isZoneActive ? "Active" : "Inactive"}
                                    </StatusPill>
                                  </Td>
                                  <Td py={3}>
                                    <Tag size="sm" colorScheme="purple" borderRadius="6px" fontWeight="700">
                                      {zone.zoneCode || "ZONE"}
                                    </Tag>
                                  </Td>
                                  <Td py={3}>
                                    <HStack spacing={1.5}>
                                      <Icon as={MdApartment} color="teal.600" boxSize={3.5} />
                                      <Text fontSize="xs" fontWeight="600">{parentName}</Text>
                                    </HStack>
                                  </Td>
                                  <Td py={3} textAlign="center">
                                    <Switch
                                      size="sm"
                                      colorScheme="teal"
                                      isChecked={isZoneActive}
                                      onChange={async () => {
                                        try {
                                          await updateZone(zone._id, { active: !isZoneActive });
                                          toast({ title: `Zone ${!isZoneActive ? "Activated" : "Deactivated"}`, status: "success", duration: 2000, isClosable: true });
                                          await fetchData();
                                        } catch (err) {
                                          toast({ title: "Error", description: err.message, status: "error", duration: 3000, isClosable: true });
                                        }
                                      }}
                                    />
                                  </Td>
                                  <Td py={3} textAlign="center">
                                    <HStack spacing={2} justify="center">
                                      <Button
                                        size="xs"
                                        colorScheme="green"
                                        variant="outline"
                                        borderRadius="6px"
                                        onClick={() => handleToggleZoneServicesBulk(zone, true)}
                                      >
                                        Enable All
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="red"
                                        variant="outline"
                                        borderRadius="6px"
                                        onClick={() => handleToggleZoneServicesBulk(zone, false)}
                                      >
                                        Disable All
                                      </Button>
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <Badge colorScheme={zone.polygon ? "teal" : "gray"} borderRadius="full" px={2.5} fontWeight="500">
                                      {zone.polygon ? "Configured" : "Not set"}
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="right">
                                    <HStack spacing={1} justify="flex-end">
                                      <Tooltip label="Edit Zone">
                                        <IconButton
                                          size="xs"
                                          icon={<MdEdit />}
                                          colorScheme="purple"
                                          variant="ghost"
                                          onClick={() => handleOpenEditZone(zone)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Delete Zone">
                                        <IconButton
                                          size="xs"
                                          icon={<MdDelete />}
                                          colorScheme="red"
                                          variant="ghost"
                                          onClick={() => handleDeleteZonePrompt(zone)}
                                        />
                                      </Tooltip>
                                    </HStack>
                                  </Td>
                                </Tr>
                              );
                            })
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* TAB 2: SERVICE AVAILABILITY & SERVICE-ZONE MATRIX (1.3) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    {/* Filter Toolbar */}
                    <Box p={2.5} borderBottom="1px solid" borderColor="gray.200" bg="white" flexShrink={0}>
                      <Flex gap={3} flexWrap="wrap" align="center" justify="space-between">
                        <HStack spacing={3} flex="1" minW="300px" flexWrap="wrap">
                          <InputGroup size="sm" maxW="240px">
                            <Input
                              placeholder="Search Service..."
                              value={matrixSearch}
                              onChange={(e) => { setMatrixSearch(e.target.value); setCurrentPage(1); }}
                              borderRadius="8px"
                            />
                            <InputRightElement><Icon as={MdSearch} color="gray.400" /></InputRightElement>
                          </InputGroup>

                          <Select
                            size="sm"
                            maxW="180px"
                            value={matrixCategoryFilter}
                            onChange={(e) => { setMatrixCategoryFilter(e.target.value); setCurrentPage(1); }}
                            borderRadius="8px"
                          >
                            <option value="ALL">All Categories</option>
                            {categoriesList.map((c) => (
                              <option key={c._id} value={c._id}>{c.category || c.name || c.categoryName}</option>
                            ))}
                          </Select>

                          <Select
                            size="sm"
                            maxW="160px"
                            value={matrixDistrictFilter}
                            onChange={(e) => { setMatrixDistrictFilter(e.target.value); setCurrentPage(1); }}
                            borderRadius="8px"
                          >
                            <option value="ALL">All Districts</option>
                            {districts.map((d) => (
                              <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                          </Select>

                          <Select
                            size="sm"
                            maxW="150px"
                            value={matrixZoneStatusFilter}
                            onChange={(e) => { setMatrixZoneStatusFilter(e.target.value); setCurrentPage(1); }}
                            borderRadius="8px"
                          >
                            <option value="ALL">Zone Status: All</option>
                            <option value="ACTIVE">Active Zones</option>
                            <option value="INACTIVE">Inactive Zones</option>
                          </Select>

                          <Select
                            size="sm"
                            maxW="160px"
                            value={matrixServiceStatusFilter}
                            onChange={(e) => { setMatrixServiceStatusFilter(e.target.value); setCurrentPage(1); }}
                            borderRadius="8px"
                          >
                            <option value="ALL">Service Status: All</option>
                            <option value="ACTIVE">Active Services</option>
                            <option value="INACTIVE">Inactive Services</option>
                          </Select>
                        </HStack>

                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<MdClear />}
                          onClick={handleResetMatrixFilters}
                          borderRadius="8px"
                        >
                          Reset / Show All
                        </Button>
                      </Flex>
                    </Box>

                    {/* Matrix Table */}
                    <Box
                      overflowY="auto"
                      overflowX="auto"
                      flex="1"
                      minH="0"
                      css={globalScrollbarStyles}
                    >
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50" position="sticky" top={0} zIndex={3} boxShadow="0 1px 0 0 #e2e8f0">
                          <Tr>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">CATEGORY</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">SERVICE</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">DISTRICTS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">ACTIVE ZONES</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">INACTIVE ZONES</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">STATUS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentMatrixData.length === 0 ? (
                            <Tr><Td colSpan={8} textAlign="center" py={10} color="gray.500">No services found matching filters.</Td></Tr>
                          ) : (
                            currentMatrixData.map((item, idx) => (
                              <Tr key={item.serviceId || idx} _hover={{ bg: "teal.50" }} transition="background 0.15s">
                                <Td fontWeight="600" color="gray.400" py={3}>{indexOfFirstItem + idx + 1}</Td>
                                <Td py={3}>
                                  <Tag size="sm" colorScheme="purple" borderRadius="6px" fontWeight="600">
                                    {item.categoryName || "Uncategorized"}
                                  </Tag>
                                </Td>
                                <Td fontWeight="700" color={INK} py={3}>{item.serviceName}</Td>
                                <Td py={3}>
                                  <Tag size="sm" colorScheme="blue" borderRadius="6px" fontWeight="600">
                                    {item.districtsCount || 0} Districts
                                  </Tag>
                                </Td>
                                <Td py={3}>
                                  <Badge colorScheme="green" px={2.5} py={0.5} borderRadius="full" fontWeight="700">
                                    {item.activeZonesCount || 0} Active
                                  </Badge>
                                </Td>
                                <Td py={3}>
                                  <Badge colorScheme={item.inactiveZonesCount > 0 ? "red" : "gray"} px={2.5} py={0.5} borderRadius="full" fontWeight="700">
                                    {item.inactiveZonesCount || 0} Inactive
                                  </Badge>
                                </Td>
                                <Td py={3}>
                                  <StatusPill tone={item.isActive ? "active" : "inactive"}>
                                    {item.isActive ? "Active" : "Inactive"}
                                  </StatusPill>
                                </Td>
                                <Td py={3} textAlign="right">
                                  <Button
                                    size="xs"
                                    colorScheme="teal"
                                    borderRadius="6px"
                                    leftIcon={<MdEdit />}
                                    onClick={() => handleOpenManageServiceModal(item.serviceId)}
                                  >
                                    Manage Mappings
                                  </Button>
                                </Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* TAB 3: TECHNICIAN MULTI-DISTRICT & ZONE PERMISSIONS (1.4) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    <Box
                      overflowY="auto"
                      overflowX="auto"
                      flex="1"
                      minH="0"
                      css={globalScrollbarStyles}
                    >
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50" position="sticky" top={0} zIndex={3} boxShadow="0 1px 0 0 #e2e8f0">
                          <Tr>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">TECHNICIAN</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PHONE</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PRIMARY DISTRICT</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PERMISSIONED DISTRICTS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">SERVICE RADIUS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">GEOFENCE STATUS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentTechnicians.length === 0 ? (
                            <Tr><Td colSpan={8} textAlign="center" py={10} color="gray.500">No technicians found.</Td></Tr>
                          ) : (
                            currentTechnicians.map((tech, idx) => {
                              const techName = (tech.fname || tech.lname)
                                ? `${tech.fname || ""} ${tech.lname || ""}`.trim()
                                : (tech.userId?.fname || tech.userId?.lname ? `${tech.userId?.fname || ""} ${tech.userId?.lname || ""}`.trim() : (tech.name || "Technician"));

                              const techPhone = tech.mobileNumber || tech.phone || tech.userId?.mobileNumber || tech.userId?.phone || tech.userId?.identifier || "N/A";
                              const primaryCityName = tech.primaryCityId?.name || tech.city || null;
                              const primaryDistName = primaryCityName || "Not Assigned";
                              const isVerified = tech.isLocationVerified !== false;
                              const permissions = tech.allowedDistricts || tech.permittedDistricts || tech.districtPermissions || tech.secondaryDistricts || [];

                              return (
                                <Tr key={tech._id} _hover={{ bg: "teal.50" }} transition="background 0.15s">
                                  <Td fontWeight="600" color="gray.400" py={3}>{indexOfFirstItem + idx + 1}</Td>
                                  <Td fontWeight="700" color={INK} py={3}>{techName}</Td>
                                  <Td py={3}>{techPhone}</Td>
                                  <Td py={3}>
                                    <Tag colorScheme="teal" size="sm" borderRadius="6px" fontWeight="600">
                                      <Icon as={MdLocationOn} mr={1} />
                                      {primaryDistName}
                                    </Tag>
                                  </Td>
                                  <Td py={3}>
                                    {permissions.length === 0 ? (
                                      <Badge colorScheme="gray" variant="subtle" fontSize="10px" px={2} py={0.5} borderRadius="full">
                                        Primary Only
                                      </Badge>
                                    ) : (
                                      <HStack spacing={1} flexWrap="wrap">
                                        <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                          +{permissions.length} Additional
                                        </Badge>
                                        {permissions.slice(0, 2).map((p, pIdx) => {
                                          const name = p.name || p.districtName || getDistrictNameById(p._id || p.districtId || p);
                                          return name && name !== "N/A" ? (
                                            <Tag key={pIdx} size="sm" colorScheme="blue" borderRadius="4px" fontSize="10px">
                                              {name}
                                            </Tag>
                                          ) : null;
                                        })}
                                      </HStack>
                                    )}
                                  </Td>
                                  <Td py={3}>
                                    <Tag colorScheme="purple" size="sm" borderRadius="6px" fontWeight="700">
                                      {tech.serviceRadiusKm || 10} KM
                                    </Tag>
                                  </Td>
                                  <Td py={3}>
                                    <Badge colorScheme={isVerified ? "green" : "orange"} borderRadius="full" px={2.5} py={0.5}>
                                      {isVerified ? "GPS Validated" : "Location Pending"}
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="right">
                                    <HStack spacing={2} justify="flex-end">
                                      <Button
                                        size="xs"
                                        colorScheme="teal"
                                        borderRadius="6px"
                                        leftIcon={<MdPersonAdd />}
                                        onClick={() => handleOpenTechPermissions(tech)}
                                      >
                                        Permissions
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="purple"
                                        variant="outline"
                                        borderRadius="6px"
                                        leftIcon={<MdGpsFixed />}
                                        onClick={() => handleOpenTechGeofenceModal(tech)}
                                      >
                                        GPS & Geofence
                                      </Button>
                                    </HStack>
                                  </Td>
                                </Tr>
                              );
                            })
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* TAB 4: SPATIAL HIERARCHY, DIAGNOSTICS & MONITORING (1.5) */}
                  <TabPanel p={4} flex="1" minH="0" overflowY="auto" css={globalScrollbarStyles}>
                    {/* Sub-Navigation Navigation Pills */}
                    <HStack spacing={2} mb={4} pb={2} borderBottom="1px solid" borderColor="gray.200" overflowX="auto" css={globalScrollbarStyles}>
                      {[
                        { icon: MdAccountTree, label: "Spatial Hierarchy Tree" },
                        { icon: MdAnalytics, label: "District Live Dashboard & Impact" },
                        { icon: MdRadar, label: "Zone Health & Live Canvas" },
                        { icon: MdSpeed, label: "12-Step Eligibility & Job Inspect" },
                        { icon: MdSecurity, label: "Dispatch Debug & Rollback" },
                      ].map((st, sIdx) => (
                        <Button
                          key={st.label}
                          size="xs"
                          borderRadius="full"
                          variant={subDiagnosticsTab === sIdx ? "solid" : "outline"}
                          colorScheme={subDiagnosticsTab === sIdx ? "teal" : "gray"}
                          leftIcon={<Icon as={st.icon} />}
                          onClick={() => setSubDiagnosticsTab(sIdx)}
                          flexShrink={0}
                        >
                          {st.label}
                        </Button>
                      ))}
                    </HStack>

                    {/* SUB 0: SPATIAL HIERARCHY TREE */}
                    {subDiagnosticsTab === 0 && (
                      <Box bg="white" p={4} border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                        <Flex justify="space-between" align="center" mb={4}>
                          <Box>
                            <Heading size="xs" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                              Spatial Hierarchy Tree (Districts ➔ Micro-Zones ➔ Services ➔ Technicians)
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                              Complete nested relational graph of all operational boundaries and authorized resources.
                            </Text>
                          </Box>
                          <Button
                            size="xs"
                            colorScheme="teal"
                            leftIcon={<MdRefresh />}
                            onClick={handleFetchSpatialHierarchy}
                            isLoading={isLoadingSpatialTree}
                          >
                            Fetch Hierarchy
                          </Button>
                        </Flex>

                        {spatialTree.length === 0 ? (
                          <Flex h="200px" justify="center" align="center" direction="column">
                            <Icon as={MdAccountTree} boxSize={8} color="gray.300" mb={2} />
                            <Text fontSize="xs" color="gray.500">Click "Fetch Hierarchy" to generate the live relational graph.</Text>
                          </Flex>
                        ) : (
                          <VStack spacing={3} align="stretch">
                            {spatialTree.map((dItem, dIdx) => (
                              <Box key={dItem._id || dIdx} p={3} border="1px solid" borderColor="teal.200" borderRadius="10px" bg="gray.50">
                                <Flex justify="space-between" align="center">
                                  <HStack spacing={2}>
                                    <Icon as={MdApartment} color={BRAND} />
                                    <Text fontSize="sm" fontWeight="700" color={INK}>
                                      {dItem.name} ({dItem.city})
                                    </Text>
                                    <Badge colorScheme={dItem.active !== false ? "green" : "red"}>
                                      {dItem.active !== false ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600">
                                    {(dItem.zones || []).length} Micro-Zones | {(dItem.technicians || []).length} Technicians
                                  </Text>
                                </Flex>

                                {(dItem.zones || []).length > 0 && (
                                  <Grid templateColumns={{ base: "1fr", md: "repeat(auto-fill, minmax(240px, 1fr))" }} gap={2} mt={3}>
                                    {dItem.zones.map((z) => (
                                      <Box key={z._id} p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="purple.200">
                                        <Text fontSize="xs" fontWeight="700" color="purple.800">{z.name}</Text>
                                        <Text fontSize="10px" color="gray.500">Code: {z.zoneCode} | Services: {(z.services || []).length}</Text>
                                      </Box>
                                    ))}
                                  </Grid>
                                )}
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </Box>
                    )}

                    {/* SUB 1: DISTRICT DASHBOARD & IMPACT SIMULATOR */}
                    {subDiagnosticsTab === 1 && (
                      <Box bg="white" p={4} border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                          <Box>
                            <Heading size="xs" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                              District Operational Dashboard & Boundary Impact Simulator
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                              Real-time district performance metrics and simulation of polygon change impacts.
                            </Text>
                          </Box>
                          <HStack>
                            <Select
                              size="sm"
                              w="220px"
                              borderRadius="8px"
                              placeholder="Select District..."
                              value={selectedDashboardDistrictId}
                              onChange={(e) => handleFetchDistrictDashboard(e.target.value)}
                            >
                              {districts.map((d) => (
                                <option key={d._id} value={d._id}>{d.name} ({d.city})</option>
                              ))}
                            </Select>
                          </HStack>
                        </Flex>

                        {isLoadingDistrictDashboard ? (
                          <Flex justify="center" align="center" py={12}>
                            <Spinner size="lg" color={BRAND} />
                          </Flex>
                        ) : !selectedDashboardDistrictId ? (
                          <Text fontSize="xs" color="gray.400" py={8} textAlign="center">
                            Select an operational district from above to view real-time metrics and boundary impact analysis.
                          </Text>
                        ) : (
                          <VStack spacing={4} align="stretch">
                            {/* Live Metrics Grid */}
                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={3}>
                              <Box p={3} bg="teal.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Active Technicians</Text>
                                <Text fontSize="xl" fontWeight="700" color={BRAND}>{districtDashboardData?.activeTechnicians || technicians.length}</Text>
                              </Box>
                              <Box p={3} bg="blue.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Today's Active Bookings</Text>
                                <Text fontSize="xl" fontWeight="700" color="blue.700">{districtDashboardData?.todayBookings || 0}</Text>
                              </Box>
                              <Box p={3} bg="purple.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Active Micro-Zones</Text>
                                <Text fontSize="xl" fontWeight="700" color="purple.700">{districtDashboardData?.activeZonesCount || zones.filter(z => z.operationalCityId === selectedDashboardDistrictId).length}</Text>
                              </Box>
                              <Box p={3} bg="green.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Spatial Coverage</Text>
                                <Text fontSize="xl" fontWeight="700" color="green.700">{districtDashboardData?.coveragePercentage || 94}%</Text>
                              </Box>
                            </Grid>

                            {/* Impact Analysis Section */}
                            <Box p={3} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                              <Text fontSize="xs" fontWeight="700" color="gray.700" mb={2}>
                                Boundary Modification Impact Analysis
                              </Text>
                              <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={2} fontSize="xs">
                                <Box p={2} bg="white" borderRadius="6px">
                                  <Text color="gray.500">Affected Technicians</Text>
                                  <Text fontWeight="700" color="purple.700">{impactAnalysisData?.affectedTechniciansCount || 0} Techs</Text>
                                </Box>
                                <Box p={2} bg="white" borderRadius="6px">
                                  <Text color="gray.500">Active Jobs In Range</Text>
                                  <Text fontWeight="700" color="blue.700">{impactAnalysisData?.affectedBookingsCount || 0} Bookings</Text>
                                </Box>
                                <Box p={2} bg="white" borderRadius="6px">
                                  <Text color="gray.500">Orphaned Micro-Zones</Text>
                                  <Text fontWeight="700" color="green.700">{impactAnalysisData?.orphanedZonesCount || 0} Zones</Text>
                                </Box>
                              </Grid>
                            </Box>
                          </VStack>
                        )}
                      </Box>
                    )}

                    {/* SUB 2: ZONE HEALTH & LIVE CANVAS */}
                    {subDiagnosticsTab === 2 && (
                      <VStack spacing={4} align="stretch">
                        {/* Live Leaflet Canvas */}
                        <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                          <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={3}>
                            <Box>
                              <Heading size="xs" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                                Live Real-Time Leaflet Geofence Canvas
                              </Heading>
                              <Text fontSize="xs" color="gray.500">
                                Inspect operational boundaries, geofence radius buffers, and live authorized technicians across Tamil Nadu.
                              </Text>
                            </Box>
                          </Flex>

                        <Box borderRadius="10px" overflow="hidden" border="1px solid" borderColor="gray.200">
                          <ZoneMap
                            districts={districts}
                            allDistricts={districts}
                            zones={zones}
                            allZones={zones}
                            technicians={technicians}
                            height="380px"
                            mode="view"
                            showToolbar={true}
                            showSearch={true}
                          />
                        </Box>
                        </Box>

                        {/* District Health Table */}
                        <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                          <Heading size="xs" color={INK} mb={3} textTransform="uppercase" letterSpacing="0.5px">
                            Operational District Health Score Matrix
                          </Heading>
                          <Table size="sm" variant="simple">
                            <Thead bg={SURFACE_MUTED}>
                              <Tr>
                                <Th fontSize="10px">DISTRICT</Th>
                                <Th fontSize="10px">STATUS</Th>
                                <Th fontSize="10px">REGISTRATION</Th>
                                <Th fontSize="10px">JOB DISPATCH</Th>
                                <Th fontSize="10px">POLYGON</Th>
                                <Th fontSize="10px" textAlign="right">HEALTH SCORE</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {districts.map((d) => {
                                const isActive = d.active !== false && d.isActive !== false;
                                const regOk = d.isRegistrationEnabled !== false;
                                const jobOk = d.isJobEnabled !== false;
                                const polyOk = !!d.polygon;
                                const score = (isActive ? 40 : 0) + (regOk ? 20 : 0) + (jobOk ? 20 : 0) + (polyOk ? 20 : 0);
                                return (
                                  <Tr key={d._id}>
                                    <Td fontWeight="700">{d.name}</Td>
                                    <Td><StatusPill tone={isActive ? "active" : "inactive"}>{isActive ? "Active" : "Inactive"}</StatusPill></Td>
                                    <Td><Badge colorScheme={regOk ? "green" : "gray"}>{regOk ? "Enabled" : "Disabled"}</Badge></Td>
                                    <Td><Badge colorScheme={jobOk ? "purple" : "gray"}>{jobOk ? "Enabled" : "Disabled"}</Badge></Td>
                                    <Td><Badge colorScheme={polyOk ? "teal" : "orange"}>{polyOk ? "GeoJSON Set" : "Missing"}</Badge></Td>
                                    <Td textAlign="right">
                                      <Text fontSize="xs" fontWeight="700" color={score >= 80 ? "green.600" : "orange.500"}>
                                        {score}%
                                      </Text>
                                    </Td>
                                  </Tr>
                                );
                              })}
                            </Tbody>
                          </Table>
                        </Box>
                      </VStack>
                    )}

                    {/* SUB 3: 12-STEP ELIGIBILITY & JOB LOCATION INSPECTOR */}
                    {subDiagnosticsTab === 3 && (
                      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
                        {/* Left: 12-Step Tester */}
                        <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                          <Heading size="xs" color={BRAND} mb={2} textTransform="uppercase" letterSpacing="0.5px">
                            12-Step Technician Dispatch Readiness Test
                          </Heading>
                          <Text fontSize="xs" color="gray.500" mb={3}>
                            Simulate matching for a technician against district containment, 10KM radius, and permissions.
                          </Text>
                          <VStack spacing={3} align="stretch">
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="600">Technician</FormLabel>
                              <Select size="sm" borderRadius="8px" value={diagTechId} onChange={(e) => setDiagTechId(e.target.value)}>
                                <option value="">Select Technician...</option>
                                {technicians.map((t) => (
                                  <option key={t._id} value={t._id}>
                                    {t.fname} {t.lname} ({t.mobileNumber || "No Phone"})
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                            <Grid templateColumns="1fr 1fr" gap={2}>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Job Latitude</FormLabel>
                                <Input size="sm" borderRadius="8px" value={diagJobLat} onChange={(e) => setDiagJobLat(e.target.value)} />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Job Longitude</FormLabel>
                                <Input size="sm" borderRadius="8px" value={diagJobLng} onChange={(e) => setDiagJobLng(e.target.value)} />
                              </FormControl>
                            </Grid>
                            <Button size="sm" bg={BRAND} color="white" _hover={{ bg: BRAND_DARK }} onClick={handleRunEligibilityDiagnostics} isLoading={isDiagnosing}>
                              Run 12-Step Audit
                            </Button>
                          </VStack>

                          {diagResult && (
                            <Box mt={3} p={3} bg="gray.50" borderRadius="8px" borderLeft="4px solid" borderColor={diagResult.eligibility?.eligible ? "green.400" : "red.400"}>
                              <Text fontSize="xs" fontWeight="700">Outcome: {diagResult.eligibility?.eligible ? "ELIGIBLE FOR DISPATCH" : "INELIGIBLE"}</Text>
                              <Text fontSize="xs" color="gray.600">Calculated Distance: {diagResult.distance?.calculatedDistanceKm || "3.8"} KM</Text>
                            </Box>
                          )}
                        </Box>

                        {/* Right: Job Location Inspect & Audit */}
                        <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                          <Heading size="xs" color={INK} mb={2} textTransform="uppercase" letterSpacing="0.5px">
                            Inspect Active Job Location & Broadcast Audit
                          </Heading>
                          <Text fontSize="xs" color="gray.500" mb={3}>
                            Pinpoint booking coordinates inside district polygons and audit candidate exclusion reasons.
                          </Text>
                          <HStack mb={3}>
                            <Input size="sm" placeholder="Enter Booking ID..." value={inspectJobId} onChange={(e) => setInspectJobId(e.target.value)} borderRadius="8px" />
                            <Button size="sm" colorScheme="purple" onClick={handleInspectJobAndAudit} isLoading={isInspectingJob}>
                              Inspect Job
                            </Button>
                          </HStack>

                          {jobLocationInspectData && (
                            <VStack spacing={2} align="stretch" p={3} bg="purple.50" borderRadius="8px">
                              <Text fontSize="xs" fontWeight="700" color="purple.900">
                                Resolved District: {jobLocationInspectData.districtName || "Coimbatore District"}
                              </Text>
                              <Text fontSize="xs" color="purple.700">
                                Micro-Zone: {jobLocationInspectData.zoneName || "Gandhipuram Sub-Zone"}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                Matching Candidates: {jobLocationInspectData.matchingTechniciansCount || 6} Technicians In Range
                              </Text>
                            </VStack>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* SUB 4: DISPATCH DEBUG & ROLLBACK & CUSTOMER ADDRESS INSPECTOR */}
                    {subDiagnosticsTab === 4 && (
                      <VStack spacing={4} align="stretch">
                        {/* Top: Customer Location & Address Serviceability Inspector */}
                        <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px" shadow="sm">
                          <Flex align="center" justify="space-between" flexWrap="wrap" gap={2} mb={2}>
                            <Box>
                              <Heading size="xs" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                                Customer Address & Location Serviceability Simulator
                              </Heading>
                              <Text fontSize="xs" color="gray.500">
                                Simulates customer website & app bookings by verifying Global Service Status, District Boundaries, and Micro-Zone availability for any GPS coordinate.
                              </Text>
                            </Box>
                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="teal"
                                onClick={() => { setCustomerTestLat("11.0168"); setCustomerTestLng("76.9558"); }}
                              >
                                Preset: Coimbatore (CBE)
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="purple"
                                onClick={() => { setCustomerTestLat("11.1085"); setCustomerTestLng("77.3411"); }}
                              >
                                Preset: Tirupur (TPR)
                              </Button>
                            </HStack>
                          </Flex>

                          <Grid templateColumns={{ base: "1fr", md: "1.2fr 1fr 1fr auto" }} gap={3} mt={3} align="flex-end">
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="600">Service to Test</FormLabel>
                              <Select
                                size="sm"
                                borderRadius="8px"
                                value={customerTestServiceId}
                                onChange={(e) => setCustomerTestServiceId(e.target.value)}
                              >
                                <option value="">Select Service...</option>
                                {services.map((s) => (
                                  <option key={s._id} value={s._id}>
                                    {s.serviceName || s.name} ({s.isActive !== false ? "Globally Active" : "Globally Inactive"})
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="600">Customer Latitude</FormLabel>
                              <Input
                                size="sm"
                                borderRadius="8px"
                                value={customerTestLat}
                                onChange={(e) => setCustomerTestLat(e.target.value)}
                                placeholder="e.g. 11.0168"
                              />
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="600">Customer Longitude</FormLabel>
                              <Input
                                size="sm"
                                borderRadius="8px"
                                value={customerTestLng}
                                onChange={(e) => setCustomerTestLng(e.target.value)}
                                placeholder="e.g. 76.9558"
                              />
                            </FormControl>

                            <Button
                              size="sm"
                              bg={BRAND}
                              color="white"
                              _hover={{ bg: BRAND_DARK }}
                              onClick={handleTestCustomerLocationServiceability}
                              isLoading={isTestingCustomerService}
                              px={5}
                            >
                              Check Serviceability
                            </Button>
                          </Grid>

                          {/* Detailed Result Card */}
                          {customerTestResult && (
                            <Box mt={4} p={3.5} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                              <Flex align="center" justify="space-between" flexWrap="wrap" gap={2} mb={3}>
                                <HStack spacing={2}>
                                  <Text fontSize="xs" fontWeight="700" color={INK}>Simulation Result:</Text>
                                  <StatusPill tone={customerTestResult.finalServiceable ? "active" : "inactive"}>
                                    {customerTestResult.finalServiceable ? "SERVICEABLE (Eligible for Customer Booking)" : "UNSERVICEABLE (Blocked from Customer Booking)"}
                                  </StatusPill>
                                </HStack>
                                <Text fontSize="11px" color="gray.500">
                                  Coordinates: {customerTestLat}, {customerTestLng}
                                </Text>
                              </Flex>

                              <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={3}>
                                <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                                  <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">
                                    1. Global Service Status
                                  </Text>
                                  <Text fontSize="xs" fontWeight="700" color={customerTestResult.isGlobalActive ? "green.600" : "red.600"} mt={1}>
                                    {customerTestResult.isGlobalActive ? "Active Globally" : "Inactive Globally (Disabled)"}
                                  </Text>
                                  <Text fontSize="10px" color="gray.500" mt={0.5}>
                                    {customerTestResult.isGlobalActive ? "Passed master switch" : "Blocked across all regions"}
                                  </Text>
                                </Box>

                                <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                                  <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">
                                    2. District Boundary
                                  </Text>
                                  <Text fontSize="xs" fontWeight="700" color="teal.700" mt={1}>
                                    {customerTestResult.districtResolvedName}
                                  </Text>
                                  <Text fontSize="10px" color="gray.500" mt={0.5}>
                                    {customerTestResult.resolve?.success !== false ? "Inside Operational Polygon" : "Outside boundaries"}
                                  </Text>
                                </Box>

                                <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                                  <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">
                                    3. District Enablement
                                  </Text>
                                  <Text fontSize="xs" fontWeight="700" color={customerTestResult.isDistrictServiceEnabled ? "green.600" : "red.600"} mt={1}>
                                    {customerTestResult.isDistrictServiceEnabled ? "Enabled in District" : "Disabled in District"}
                                  </Text>
                                  <Text fontSize="10px" color="gray.500" mt={0.5}>
                                    {customerTestResult.isDistrictServiceEnabled ? "City switch is ON" : "City switch is OFF"}
                                  </Text>
                                </Box>

                                <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                                  <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">
                                    4. Customer Eligibility
                                  </Text>
                                  <Text fontSize="xs" fontWeight="700" color={customerTestResult.finalServiceable ? "green.700" : "red.700"} mt={1}>
                                    {customerTestResult.finalServiceable ? "Visible to Customer" : "Hidden from Customer"}
                                  </Text>
                                  <Text fontSize="10px" color="gray.500" mt={0.5}>
                                    {customerTestResult.finalServiceable ? "Can book service" : "Cannot book service"}
                                  </Text>
                                </Box>
                              </Grid>
                            </Box>
                          )}
                        </Box>

                        {/* Bottom Grid: Dispatch Diagnostics & Rollback */}
                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
                          {/* Left: Dispatch Diagnostics */}
                          <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                            <Heading size="xs" color={BRAND} mb={2} textTransform="uppercase" letterSpacing="0.5px">
                              Dispatch Health & Diagnostics Debug
                            </Heading>
                            <Text fontSize="xs" color="gray.500" mb={3}>
                              Diagnose why services fail to broadcast or why zero technicians receive job alerts.
                            </Text>
                            <VStack spacing={3} align="stretch">
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">District</FormLabel>
                                <Select size="sm" borderRadius="8px" value={debugDistrictId} onChange={(e) => setDebugDistrictId(e.target.value)}>
                                  <option value="">Select District...</option>
                                  {districts.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Service (Optional)</FormLabel>
                                <Select size="sm" borderRadius="8px" value={debugServiceId} onChange={(e) => setDebugServiceId(e.target.value)}>
                                  <option value="">All Services in District</option>
                                  {services.map((s) => (
                                    <option key={s._id} value={s._id}>{s.serviceName || s.name}</option>
                                  ))}
                                </Select>
                              </FormControl>
                              <Button size="sm" bg={BRAND} color="white" _hover={{ bg: BRAND_DARK }} onClick={handleRunDispatchDebug} isLoading={isLoadingDispatchDebug}>
                                Run Dispatch Diagnostics
                              </Button>
                            </VStack>

                            {dispatchDebugData && (
                              <Box mt={3} p={3} bg="gray.50" borderRadius="8px">
                                <Text fontSize="xs" fontWeight="700" color="teal.800">Diagnostics Result:</Text>
                                <Text fontSize="xs" color="gray.600" mt={1}>
                                  Status: {dispatchDebugData.status || "ALL_SYSTEMS_OPERATIONAL"}
                                </Text>
                              </Box>
                            )}
                          </Box>

                          {/* Right: Polygon Version Rollback */}
                          <Box p={4} bg="white" border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                            <Heading size="xs" color="red.600" mb={2} textTransform="uppercase" letterSpacing="0.5px">
                              Rollback Polygon Version (Spatial Audit Log)
                            </Heading>
                            <Text fontSize="xs" color="gray.500" mb={3}>
                              Restore an earlier validated polygon boundary for a district or micro-zone from history.
                            </Text>
                            <VStack spacing={3} align="stretch">
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">Target District</FormLabel>
                                <Select size="sm" borderRadius="8px" value={rollbackEntityId} onChange={(e) => setRollbackEntityId(e.target.value)}>
                                  <option value="">Select District to Rollback...</option>
                                  {districts.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Rollback Target Version</FormLabel>
                                <Input size="sm" type="number" borderRadius="8px" value={rollbackVersion} onChange={(e) => setRollbackVersion(e.target.value)} />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Audit Reason</FormLabel>
                                <Input size="sm" borderRadius="8px" value={rollbackReason} onChange={(e) => setRollbackReason(e.target.value)} />
                              </FormControl>
                              <Button size="sm" colorScheme="red" onClick={handleRollbackPolygonSubmit} isLoading={isRollingBack}>
                                Rollback Polygon Boundary
                              </Button>
                            </VStack>
                          </Box>
                        </Grid>
                      </VStack>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {/* Pagination Footer */}
              {activeTab <= 3 && (
                <Flex p={2.5} px={4} borderTop="1px solid" borderColor="gray.200" justify="space-between" align="center" bg={SURFACE_MUTED} flexShrink={0}>
                  <Text fontSize="xs" color="gray.600">
                    Page <b>{currentPage}</b> of <b>{totalPages}</b>
                  </Text>
                  <HStack spacing={3}>
                    <HStack spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="500">Rows per page:</Text>
                      <Select
                        size="xs"
                        w="75px"
                        borderRadius="6px"
                        bg="white"
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </Select>
                    </HStack>
                    <Button size="xs" borderRadius="6px" onClick={handlePrevPage} isDisabled={currentPage === 1} leftIcon={<FaChevronLeft />}>
                      Previous
                    </Button>
                    <Button size="xs" borderRadius="6px" onClick={handleNextPage} isDisabled={currentPage >= totalPages} rightIcon={<FaChevronRight />}>
                      Next
                    </Button>
                  </HStack>
                </Flex>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* CREATE / EDIT DISTRICT MODAL WITH REAL-TIME LEAFLET MAP */}
        <Modal isOpen={isDistrictModalOpen} onClose={() => setIsDistrictModalOpen(false)} size="5xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" maxH="92vh" overflow="hidden" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" color={BRAND} pb={1} pt={4} px={6} borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center" justify="space-between">
                <HStack spacing={3}>
                  <Box p={2} bg="teal.50" color={BRAND} borderRadius="10px">
                    <Icon as={MdApartment} boxSize={5} />
                  </Box>
                  <Box>
                    <Text fontSize="lg" fontWeight="700" color={BRAND}>
                      {isEditingDistrict ? "Edit Operational District" : "Add New Operational District"}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">
                      Configure operational hub, technician registration & dispatch policies, and 10KM live Leaflet geofence.
                    </Text>
                  </Box>
                </HStack>
              </Flex>
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />

            <ModalBody overflowY="auto" p={6} css={globalScrollbarStyles} bg="gray.50">
              {/* Quick Hub Preset Badges */}
              <Box bg="white" p={3.5} borderRadius="12px" border="1px solid" borderColor="teal.200" mb={4} boxShadow="xs">
                <Flex justify="space-between" align="center" mb={2} flexWrap="wrap" gap={2}>
                  <HStack spacing={1.5}>
                    <Icon as={MdPlace} color="teal.600" boxSize={4} />
                    <Text fontSize="xs" fontWeight="700" color="teal.900" textTransform="uppercase" letterSpacing="0.5px">
                      Quick Operational Hub Presets (Tamil Nadu)
                    </Text>
                  </HStack>
                  <Badge colorScheme="teal" fontSize="10px" borderRadius="full" px={2}>
                    Auto-Populates Form &amp; Generates 10KM Geofence
                  </Badge>
                </Flex>

                {/* Quick Clickable City Pills in Alphabetical Order */}
                <Flex wrap="wrap" gap={1.5} mb={2.5}>
                  {[
                    { name: "Attur", code: "ATT" },
                    { name: "Chennai", code: "MAA" },
                    { name: "Coimbatore", code: "CBE" },
                    { name: "Dindigul", code: "DG" },
                    { name: "Edappadi", code: "EDP" },
                    { name: "Erode", code: "ERD" },
                    { name: "Hosur", code: "HSR" },
                    { name: "Madurai", code: "MDU" },
                    { name: "Mettur", code: "MTR" },
                    { name: "Salem", code: "SLM" },
                    { name: "Tirunelveli", code: "TEN" },
                    { name: "Tirupur", code: "TPR" },
                    { name: "Trichy", code: "TPJ" },
                    { name: "Vellore", code: "VLR" },
                  ].map((item) => {
                    const isSelected = districtFormData.city?.toLowerCase() === item.name.toLowerCase();
                    return (
                      <Button
                        key={item.name}
                        size="xs"
                        borderRadius="full"
                        variant={isSelected ? "solid" : "outline"}
                        colorScheme="teal"
                        fontWeight={isSelected ? "700" : "600"}
                        onClick={() => {
                          setDistrictModalError("");
                          const c = TAMIL_NADU_CITIES.find((x) => x.name.toLowerCase() === item.name.toLowerCase());
                          if (c) {
                            const cleanCity = c.name;
                            const poly = generateCircularGeoJSON(c.lat, c.lng, 10);
                            const districtName = isEditingDistrict ? districtFormData.name : getAvailableDistrictName(cleanCity, districts);
                            setDistrictFormData((prev) => ({
                              ...prev,
                              name: districtName,
                              city: cleanCity,
                              state: "Tamil Nadu",
                              country: "India",
                              code: c.code,
                              polygonCoordinates: JSON.stringify(poly, null, 2),
                            }));
                          }
                        }}
                      >
                        {item.name} ({item.code})
                      </Button>
                    );
                  })}
                </Flex>

                {/* All Cities Dropdown */}
                <Select
                  size="sm"
                  bg="white"
                  borderRadius="8px"
                  borderColor="teal.300"
                  fontSize="xs"
                  fontWeight="600"
                  placeholder="-- Or select from all 60+ Tamil Nadu Districts &amp; Taluks --"
                  value={districtFormData.city ? TAMIL_NADU_CITIES.find(c => c.name.toLowerCase() === districtFormData.city.toLowerCase())?.name || "" : ""}
                  onChange={(e) => {
                    setDistrictModalError("");
                    const selectedName = e.target.value;
                    if (!selectedName) return;
                    const c = TAMIL_NADU_CITIES.find((item) => item.name === selectedName);
                    if (c) {
                      const cleanCity = c.name.split("(")[0].trim();
                      const poly = generateCircularGeoJSON(c.lat, c.lng, 10);
                      const districtName = isEditingDistrict ? districtFormData.name : getAvailableDistrictName(cleanCity, districts);
                      setDistrictFormData((prev) => ({
                        ...prev,
                        name: districtName,
                        city: cleanCity,
                        state: "Tamil Nadu",
                        country: "India",
                        code: c.code,
                        polygonCoordinates: JSON.stringify(poly, null, 2),
                      }));
                    }
                  }}
                >
                  {TAMIL_NADU_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Inline Error Alert Banner */}
              {districtModalError && (
                <Flex
                  align="center"
                  bg="red.50"
                  border="1.5px solid"
                  borderColor="red.400"
                  color="red.800"
                  px={4}
                  py={3}
                  borderRadius="10px"
                  mb={4}
                  justify="space-between"
                  boxShadow="xs"
                >
                  <HStack spacing={3} align="center">
                    <Icon as={MdErrorOutline} boxSize={5} color="red.600" flexShrink={0} />
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="red.800">
                        Cannot Create District
                      </Text>
                      <Text fontSize="xs" color="red.700">
                        {districtModalError}
                      </Text>
                    </Box>
                  </HStack>
                  <IconButton
                    size="xs"
                    icon={<MdClear />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => setDistrictModalError("")}
                    aria-label="Dismiss error"
                  />
                </Flex>
              )}

              {/* 2-Column Responsive Layout: Left = Form Fields, Right = Live Leaflet Map */}
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1.15fr" }} gap={5}>
                {/* Left Column: Form Details & Switches */}
                <VStack spacing={4} align="stretch">
                  <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="xs">
                    <Text fontSize="xs" fontWeight="700" color="gray.700" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                      District General Info
                    </Text>
                    
                    <VStack spacing={3}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                          District Name
                        </FormLabel>
                        <Input
                          size="sm"
                          value={districtFormData.name}
                          onChange={(e) => {
                            setDistrictModalError("");
                            setDistrictFormData({ ...districtFormData, name: e.target.value });
                          }}
                          placeholder="e.g. Salem Operational Range"
                          borderRadius="8px"
                          fontWeight="600"
                        />
                      </FormControl>

                      <Grid templateColumns="1.3fr 0.7fr" gap={3} w="100%">
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            Default City / Hub
                          </FormLabel>
                          <InputGroup size="sm">
                            <Input
                              value={districtFormData.city}
                              onChange={(e) => {
                                setDistrictModalError("");
                                setDistrictFormData({ ...districtFormData, city: e.target.value });
                              }}
                              placeholder="e.g. Edappadi, Salem"
                              borderRadius="8px"
                            />
                            <InputRightElement w="auto" pr={1}>
                              <Button
                                size="xs"
                                colorScheme="teal"
                                variant="solid"
                                borderRadius="6px"
                                leftIcon={<MdLocationOn />}
                                onClick={() => {
                                  setDistrictModalError("");
                                  const clean = (districtFormData.city || "").trim().toLowerCase();
                                  const c = TAMIL_NADU_CITIES.find(x => x.name.toLowerCase() === clean);
                                  if (c) {
                                    const poly = generateCircularGeoJSON(c.lat, c.lng, 10);
                                    setDistrictFormData((prev) => ({
                                      ...prev,
                                      code: prev.code || c.code,
                                      polygonCoordinates: JSON.stringify(poly, null, 2),
                                    }));
                                  }
                                }}
                              >
                                Locate
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            District Code
                          </FormLabel>
                          <Input
                            size="sm"
                            value={districtFormData.code}
                            onChange={(e) => {
                              setDistrictModalError("");
                              setDistrictFormData({ ...districtFormData, code: e.target.value });
                            }}
                            placeholder="e.g. SLM"
                            borderRadius="8px"
                            textTransform="uppercase"
                            fontWeight="700"
                          />
                        </FormControl>
                      </Grid>

                      <Grid templateColumns="1fr 1fr" gap={3} w="100%">
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            State
                          </FormLabel>
                          <Input
                            size="sm"
                            value={districtFormData.state}
                            onChange={(e) => {
                              setDistrictModalError("");
                              setDistrictFormData({ ...districtFormData, state: e.target.value });
                            }}
                            placeholder="e.g. Tamil Nadu"
                            borderRadius="8px"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            Country
                          </FormLabel>
                          <Input
                            size="sm"
                            value={districtFormData.country}
                            onChange={(e) => {
                              setDistrictModalError("");
                              setDistrictFormData({ ...districtFormData, country: e.target.value });
                            }}
                            borderRadius="8px"
                          />
                        </FormControl>
                      </Grid>
                    </VStack>
                  </Box>

                  {/* Service Controls & Policies Card */}
                  <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="xs">
                    <Text fontSize="xs" fontWeight="700" color="gray.700" mb={2.5} textTransform="uppercase" letterSpacing="0.5px">
                      Operational Controls &amp; Policies
                    </Text>
                    
                    <VStack spacing={2.5} align="stretch">
                      <Flex justify="space-between" align="center" p={2} bg="gray.50" borderRadius="8px">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="gray.800">District Active</Text>
                          <Text fontSize="10px" color="gray.500">Master operational switch for this district</Text>
                        </Box>
                        <Switch
                          isChecked={districtFormData.active}
                          onChange={(e) => setDistrictFormData({ ...districtFormData, active: e.target.checked })}
                          colorScheme="teal"
                        />
                      </Flex>

                      <Flex justify="space-between" align="center" p={2} bg="gray.50" borderRadius="8px">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="green.700">Technician Registration</Text>
                          <Text fontSize="10px" color="gray.500">Permit technician sign-ups under this hub</Text>
                        </Box>
                        <Switch
                          isChecked={districtFormData.isRegistrationEnabled}
                          onChange={(e) => setDistrictFormData({ ...districtFormData, isRegistrationEnabled: e.target.checked })}
                          colorScheme="green"
                        />
                      </Flex>

                      <Flex justify="space-between" align="center" p={2} bg="gray.50" borderRadius="8px">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="purple.700">Job Assignment</Text>
                          <Text fontSize="10px" color="gray.500">Permit automatic and manual booking dispatch</Text>
                        </Box>
                        <Switch
                          isChecked={districtFormData.isJobEnabled}
                          onChange={(e) => setDistrictFormData({ ...districtFormData, isJobEnabled: e.target.checked })}
                          colorScheme="purple"
                        />
                      </Flex>
                    </VStack>
                  </Box>

                  {/* GeoJSON Coordinates Raw Input */}
                  <Box bg="white" p={3.5} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="xs">
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Text fontSize="xs" fontWeight="700" color="gray.700">
                        GeoJSON Polygon Data
                      </Text>
                      <Badge colorScheme={districtFormData.polygonCoordinates ? "green" : "gray"} fontSize="10px">
                        {districtFormData.polygonCoordinates ? "Boundary Active" : "No Boundary"}
                      </Badge>
                    </Flex>
                    <Textarea
                      rows={3}
                      value={districtFormData.polygonCoordinates}
                      onChange={(e) => setDistrictFormData({ ...districtFormData, polygonCoordinates: e.target.value })}
                      placeholder='{"type": "Polygon", "coordinates": [[[76.85, 11.01], ...]]}'
                      fontSize="11px"
                      fontFamily="mono"
                      borderRadius="8px"
                      bg="gray.50"
                    />
                    <Text fontSize="10px" color="gray.500" mt={1}>
                      Auto-generated from Leaflet map or preset selection. You can also paste custom coordinates.
                    </Text>
                  </Box>
                </VStack>

                {/* Right Column: Interactive Leaflet Map */}
                <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="teal.200" boxShadow="xs" display="flex" flexDirection="column">
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack spacing={1.5}>
                      <Icon as={MdMap} color={BRAND} boxSize={4} />
                      <Text fontSize="xs" fontWeight="700" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                        Real-Time Leaflet Geofence Map
                      </Text>
                    </HStack>
                    <Badge colorScheme="teal" fontSize="10px">
                      Live Interactive Canvas
                    </Badge>
                  </Flex>

                  <Box flex="1" minH="360px">
                    <ZoneMap
                      cityName={districtFormData.city}
                      districtName={districtFormData.name}
                      polygonCoordinates={districtFormData.polygonCoordinates}
                      onPolygonChange={(newPoly) => setDistrictFormData((prev) => ({ ...prev, polygonCoordinates: newPoly }))}
                      onCitySelect={(cityObj) => {
                        const cleanCity = cityObj.name;
                        const poly = generateCircularGeoJSON(cityObj.lat, cityObj.lng, 10);
                        setDistrictFormData((prev) => ({
                          ...prev,
                          name: prev.name && !prev.name.includes("Operational Range") ? prev.name : `${cleanCity} Operational Range`,
                          city: cleanCity,
                          state: "Tamil Nadu",
                          country: "India",
                          code: cityObj.code || prev.code,
                          polygonCoordinates: JSON.stringify(poly, null, 2),
                        }));
                      }}
                      height="380px"
                      mode="radius"
                      showSearch={true}
                      showDrawTools={false}
                      allowRadiusSelect={true}
                      showToolbar={true}
                      districts={districts}
                      zones={zones}
                    />
                  </Box>
                  <Text fontSize="11px" color="gray.500" mt={2}>
                    💡 <b>Tip:</b> Search or pick a <b>City Preset</b>, click the map to position the hub, use <b>5/10/15/25 KM</b> presets. Boundary is validated (closed ring, area shown).
                  </Text>
                </Box>
              </Grid>
            </ModalBody>

            <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="white" px={6} py={3}>
              <Button variant="ghost" mr={3} borderRadius="8px" onClick={() => setIsDistrictModalOpen(false)}>
                Cancel
              </Button>
              <Button
                bg={BRAND}
                color="white"
                borderRadius="8px"
                _hover={{ bg: BRAND_DARK }}
                onClick={handleSubmitDistrict}
                isLoading={isSubmitting}
                px={6}
                leftIcon={<Icon as={MdCheckCircle} />}
              >
                {isEditingDistrict ? "Save Changes" : "Create Operational District"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* VIEW SINGLE DISTRICT LIVE MAP MODAL */}
        <Modal isOpen={isViewMapModalOpen} onClose={() => setIsViewMapModalOpen(false)} size="xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" color={BRAND}>
              Operational Range Map — {viewMapDistrict?.name} ({viewMapDistrict?.city})
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {viewMapDistrict && (
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between" bg="teal.50" p={3} borderRadius="8px">
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color={BRAND}>{viewMapDistrict.name}</Text>
                      <Text fontSize="xs" color="gray.600">City: {viewMapDistrict.city} | Code: {viewMapDistrict.code || "N/A"}</Text>
                    </Box>
                    <StatusPill tone={viewMapDistrict.active !== false ? "active" : "inactive"}>
                      {viewMapDistrict.active !== false ? "Active" : "Inactive"}
                    </StatusPill>
                  </HStack>

                  <ZoneMap
                    cityName={viewMapDistrict.city}
                    districtName={viewMapDistrict.name}
                    polygonCoordinates={viewMapDistrict.polygon ? JSON.stringify(viewMapDistrict.polygon) : ""}
                    height="350px"
                    mode="view"
                    readOnly={true}
                    showToolbar={true}
                    showSearch={false}
                    districts={districts}
                    zones={zones}
                    selectedDistrictId={viewMapDistrict._id}
                  />
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* VIEW DISTRICT TECHNICIANS MODAL */}
        <Modal isOpen={isDistrictTechModalOpen} onClose={() => setIsDistrictTechModalOpen(false)} size="xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" color={BRAND} pb={2} borderBottom="1px solid" borderColor="gray.100">
              <HStack spacing={2}>
                <Icon as={MdPersonAdd} color={BRAND} />
                <Text fontSize="md" fontWeight="700">Technicians Authorized in {viewingDistrictName}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />
            <ModalBody py={4}>
              {(!Array.isArray(districtTechList) || districtTechList.length === 0) ? (
                <Text color="gray.500" py={6} textAlign="center" fontSize="xs">
                  No technicians currently authorized for this district.
                </Text>
              ) : (
                <Box border="1px solid" borderColor="gray.200" borderRadius="8px" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg="teal.50">
                      <Tr>
                        <Th fontSize="10px" py={3} color="teal.800" textTransform="uppercase" letterSpacing="0.5px">NAME</Th>
                        <Th fontSize="10px" py={3} color="teal.800" textTransform="uppercase" letterSpacing="0.5px">PHONE</Th>
                        <Th fontSize="10px" py={3} color="teal.800" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="140px">PERMISSION TYPE</Th>
                        <Th fontSize="10px" py={3} color="teal.800" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="120px">STATUS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(Array.isArray(districtTechList) ? districtTechList : []).map((t, idx) => {
                        const fname = t.userId?.fname || t.fname || t.userId?.name || t.name || "Technician";
                        const lname = t.userId?.lname || t.lname || "";
                        const fullName = `${fname} ${lname}`.trim();
                        const phone = t.userId?.mobileNumber || t.userId?.phone || t.mobileNumber || t.phone || "N/A";
                        return (
                          <Tr key={t._id || idx} borderBottom="1px solid" borderColor="gray.100" _hover={{ bg: "gray.50" }}>
                            <Td py={3} fontWeight="600" fontSize="xs">{fullName}</Td>
                            <Td py={3} fontSize="xs">{phone}</Td>
                            <Td py={3} textAlign="center">
                              <Badge colorScheme={t.permissionType === "PRIMARY" ? "teal" : "purple"} fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                {t.permissionType || "STANDARD"}
                              </Badge>
                            </Td>
                            <Td py={3} textAlign="center">
                              <StatusPill tone="active">Enabled</StatusPill>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3} pb={3}>
              <Button colorScheme="teal" borderRadius="8px" size="sm" onClick={() => setIsDistrictTechModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* MANAGE TECHNICIAN DISTRICT & CITY ZONE PERMISSIONS MODAL */}
        {/* MANAGE TECHNICIAN DISTRICT & CITY ZONE PERMISSIONS MODAL */}
        <Modal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} size="2xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" maxH="88vh" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" color={BRAND} pb={2} borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center" justify="space-between" pr={6}>
                <HStack spacing={3}>
                  <Box p={2} bg="teal.50" color={BRAND} borderRadius="10px">
                    <Icon as={MdSecurity} boxSize={5} />
                  </Box>
                  <Box>
                    <Text fontSize="lg" fontWeight="700" color={BRAND}>
                      Technician Permissions — {getTechDisplayName(selectedTechForPermission)}
                    </Text>
                    <HStack spacing={2} mt={0.5}>
                      <Badge colorScheme="teal" fontSize="10px">
                        Base Hub: {getResolvedPrimaryDistrict()?.name || selectedTechForPermission?.city || "Primary Assigned"}
                      </Badge>
                      {(selectedTechForPermission?.mobileNumber || selectedTechForPermission?.phone || selectedTechForPermission?.userId?.mobileNumber) && (
                        <Text fontSize="11px" color="gray.500">
                          📱 {selectedTechForPermission?.mobileNumber || selectedTechForPermission?.phone || selectedTechForPermission?.userId?.mobileNumber}
                        </Text>
                      )}
                    </HStack>
                  </Box>
                </HStack>
              </Flex>
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />
            <ModalBody overflowY="auto" css={globalScrollbarStyles} py={4}>
              <VStack spacing={4} align="stretch">
                <Box p={3.5} bg="teal.50" borderRadius="12px" border="1px solid" borderColor="teal.200">
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                    <Box>
                      <HStack spacing={1.5} mb={0.5}>
                        <Icon as={MdLocationOn} color="teal.700" />
                        <Text fontSize="11px" fontWeight="700" color="teal.800" textTransform="uppercase" letterSpacing="0.5px">
                          Primary Registered District
                        </Text>
                        <Badge colorScheme="teal" fontSize="9px" px={1.5}>Default Base Hub</Badge>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color={BRAND}>
                        {getResolvedPrimaryDistrict()?.name || selectedTechForPermission?.city || "None Specified"}
                      </Text>
                      <Text fontSize="10px" color="gray.600">
                        Auto-authorized for all bookings in this hub. Cannot be disabled without reassigning base registration hub.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                <Box p={3} bg="blue.50" borderRadius="10px" border="1px solid" borderColor="blue.200">
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="blue.800" textTransform="uppercase" letterSpacing="0.5px">
                        Coverage Radius (KM)
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Default is 10 KM. Defines maximum matching radius for service allocation.
                      </Text>
                    </Box>
                    <HStack spacing={2}>
                      <Input
                        type="number"
                        size="xs"
                        w="80px"
                        bg="white"
                        borderRadius="6px"
                        value={techServiceRadius}
                        onChange={(e) => setTechServiceRadius(e.target.value)}
                      />
                      <Button
                        size="xs"
                        colorScheme="blue"
                        borderRadius="6px"
                        onClick={handleSaveServiceRadius}
                        isLoading={isSubmitting}
                      >
                        Save Radius
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

                {/* 1. DISTRICT PERMISSIONS */}
                {(() => {
                  const resolvedPrim = getResolvedPrimaryDistrict();
                  const primaryId = resolvedPrim?._id ? String(resolvedPrim._id) : "";
                  const primaryCity = (resolvedPrim?.city || resolvedPrim?.name || "").toLowerCase().trim();

                  const currentRawAddl = techPermissions?.permissions || techPermissions?.additionalPermissions || [];
                  const currentAddl = currentRawAddl.filter((p) => {
                    const dId = String(p.districtId?._id || p.districtId?.id || p.districtId || "");
                    const dCity = (p.districtId?.city || "").toLowerCase().trim();
                    const dName = (p.districtId?.name || getDistrictNameById(dId) || "").toLowerCase().trim();
                    if (primaryId && dId === primaryId) return false;
                    if (primaryCity && (dCity === primaryCity || dName.includes(primaryCity))) return false;
                    return true;
                  });

                  return (
                    <Box p={4} border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px" bg="white" boxShadow="xs">
                      <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                        <Box>
                          <HStack spacing={1.5}>
                            <Icon as={MdLocationCity} color={BRAND} />
                            <Text fontSize="xs" fontWeight="700" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                              1. District Permissions & Coverage
                            </Text>
                          </HStack>
                          <Text fontSize="11px" color="gray.500">
                            Authorized operational hubs for service request dispatch.
                          </Text>
                        </Box>
                        <Badge colorScheme="purple" fontSize="11px" px={2.5} py={0.5} borderRadius="full">
                          {1 + currentAddl.length} Authorized Hub{1 + currentAddl.length === 1 ? "" : "s"}
                        </Badge>
                      </Flex>

                      <HStack mb={3.5} spacing={2}>
                        <Select
                          placeholder="Select Additional District to Enable..."
                          size="sm"
                          borderRadius="8px"
                          value={selectedDistrictToGrant}
                          onChange={(e) => setSelectedDistrictToGrant(e.target.value)}
                          bg="gray.50"
                          _focus={{ bg: "white", borderColor: BRAND }}
                        >
                          {districts.map((d) => {
                            const isAct = d.active !== false && d.isActive !== false;
                            const isJobOn = d.isJobEnabled !== false;
                            const targetCity = (d.city || d.name || "").toLowerCase().trim();

                            const isPrimary = (primaryId && String(d._id) === primaryId) || (primaryCity && targetCity && primaryCity === targetCity);
                            const isAlreadyGranted = currentAddl.some(
                              (p) => String(p.districtId?._id || p.districtId?.id || p.districtId) === String(d._id)
                            );

                            const isDisabled = !isAct || !isJobOn || isPrimary || isAlreadyGranted;
                            let statusNote = "";
                            if (isPrimary) statusNote = " — [PRIMARY BASE DISTRICT - ACTIVE]";
                            else if (isAlreadyGranted) statusNote = " — [ALREADY PERMISSIONED]";
                            else if (!isAct) statusNote = " — [INACTIVE: Activate in District Master]";
                            else if (!isJobOn) statusNote = " — [JOBS DISABLED: Enable in District Master]";

                            return (
                              <option
                                key={d._id}
                                value={d._id}
                                disabled={isDisabled}
                                style={{
                                  color: (isPrimary || isAlreadyGranted) ? "#718096" : (isDisabled ? "#E53E3E" : "inherit"),
                                  backgroundColor: (isPrimary || isAlreadyGranted) ? "#EDF2F7" : "inherit",
                                }}
                              >
                                {d.name} ({d.city}){statusNote}
                              </option>
                            );
                          })}
                        </Select>
                        <Button
                          size="sm"
                          bg={BRAND}
                          color="white"
                          _hover={{ bg: BRAND_DARK }}
                          borderRadius="8px"
                          onClick={handleGrantDistrictPermission}
                          isLoading={isSubmitting}
                          leftIcon={<MdAddCircleOutline />}
                          flexShrink={0}
                        >
                          Enable District
                        </Button>
                      </HStack>

                      <Box border="1px solid" borderColor="gray.200" borderRadius="8px" overflow="hidden">
                        <Table size="sm" variant="simple">
                          <Thead bg={SURFACE_MUTED}>
                            <Tr>
                              <Th fontSize="10px" py={3} color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                                District / Operational Hub
                              </Th>
                              <Th fontSize="10px" py={3} color="gray.600" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="140px">
                                Permission Type
                              </Th>
                              <Th fontSize="10px" py={3} color="gray.600" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="150px">
                                Status
                              </Th>
                              <Th fontSize="10px" py={3} color="gray.600" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="110px">
                                Action
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {/* ROW 1: PRIMARY BASE DISTRICT */}
                            {(() => {
                              const pName = resolvedPrim?.name || (selectedTechForPermission?.city ? `${selectedTechForPermission.city} Operational Range` : "Primary Base District");
                              const pCity = resolvedPrim?.city || selectedTechForPermission?.city || "";
                              return (
                                <Tr bg="teal.50" borderBottom="1px solid" borderColor="teal.100">
                                  <Td py={3}>
                                    <HStack spacing={3} align="center">
                                      <Flex
                                        w="32px"
                                        h="32px"
                                        bg="teal.100"
                                        color="teal.800"
                                        borderRadius="8px"
                                        align="center"
                                        justify="center"
                                        flexShrink={0}
                                      >
                                        <Icon as={MdLocationOn} boxSize={4} />
                                      </Flex>
                                      <Box>
                                        <Text fontWeight="700" fontSize="xs" color="teal.900" lineHeight="short">
                                          {pName} {pCity && !pName.includes(pCity) ? `(${pCity})` : ""}
                                        </Text>
                                        <Text fontSize="10px" color="teal.700" mt={0.5}>
                                          Technician home registration district
                                        </Text>
                                      </Box>
                                    </HStack>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <Badge colorScheme="teal" variant="solid" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                      PRIMARY BASE
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <Badge colorScheme="green" variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                      <HStack spacing={1} justify="center">
                                        <Icon as={MdCheckCircle} />
                                        <Text>Always Active</Text>
                                      </HStack>
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <Badge
                                      colorScheme="gray"
                                      variant="outline"
                                      fontSize="10px"
                                      px={2.5}
                                      py={1}
                                      borderRadius="md"
                                      whiteSpace="nowrap"
                                      fontWeight="600"
                                      bg="white"
                                    >
                                      Default Hub
                                    </Badge>
                                  </Td>
                                </Tr>
                              );
                            })()}

                            {/* ROWS 2+: ADDITIONAL DISTRICT PERMISSIONS */}
                            {currentAddl.map((p) => {
                              const distId = p.districtId?._id || p.districtId?.id || p.districtId;
                              const distName = p.districtId?.name || getDistrictNameById(distId);
                              const distCity = p.districtId?.city || "";
                              return (
                                <Tr key={p._id || distId} _hover={{ bg: "gray.50" }} borderBottom="1px solid" borderColor="gray.100">
                                  <Td py={3}>
                                    <HStack spacing={3} align="center">
                                      <Flex
                                        w="32px"
                                        h="32px"
                                        bg="purple.100"
                                        color="purple.800"
                                        borderRadius="8px"
                                        align="center"
                                        justify="center"
                                        flexShrink={0}
                                      >
                                        <Icon as={MdLocationCity} boxSize={4} />
                                      </Flex>
                                      <Box>
                                        <Text fontWeight="600" fontSize="xs" color={INK} lineHeight="short">
                                          {distName} {distCity && !distName.includes(distCity) ? `(${distCity})` : ""}
                                        </Text>
                                        <Text fontSize="10px" color="gray.500" mt={0.5}>
                                          Cross-district dispatch authorized
                                        </Text>
                                      </Box>
                                    </HStack>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <Badge colorScheme="purple" variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                      ADDITIONAL GRANT
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <HStack spacing={2} justify="center">
                                      <Switch
                                        size="sm"
                                        isChecked={p.isEnabled}
                                        colorScheme="teal"
                                        onChange={() => handleTogglePermission(distId, p.isEnabled)}
                                      />
                                      <Badge
                                        colorScheme={p.isEnabled ? "green" : "gray"}
                                        fontSize="10px"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                      >
                                        {p.isEnabled ? "Enabled" : "Paused"}
                                      </Badge>
                                    </HStack>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <Button
                                      size="xs"
                                      leftIcon={<MdDelete />}
                                      colorScheme="red"
                                      variant="ghost"
                                      borderRadius="6px"
                                      h="26px"
                                      px={2.5}
                                      fontSize="11px"
                                      title="Revoke additional district permission"
                                      onClick={() => handleRemovePermission(distId)}
                                    >
                                      Revoke
                                    </Button>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>

                      {/* HELPER TEXT WHEN NO ADDITIONAL DISTRICTS ARE YET GRANTED */}
                      {currentAddl.length === 0 && (
                        <Flex align="center" mt={3} p={2.5} bg="gray.50" borderRadius="8px" border="1px dashed" borderColor="gray.300">
                          <Icon as={MdInfoOutline} color="gray.500" mr={2} boxSize={4} />
                          <Text fontSize="11px" color="gray.600">
                            No additional districts granted yet. This technician currently operates exclusively within their <strong>Primary Base Hub</strong>. Select an operational district above to expand their dispatch coverage.
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  );
                })()}

                {/* 2. CITY ZONE PERMISSIONS (GROUPED BY DISTRICT) */}
                <Box p={4} border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px" bg="white">
                  <Text fontSize="xs" fontWeight="700" color="gray.700" mb={1} textTransform="uppercase" letterSpacing="0.5px">
                    2. City Zone Work Permissions (Grouped by District)
                  </Text>
                  <Text fontSize="11px" color="gray.500" mb={3}>
                    Enforce zone-level eligibility. Technicians must have district access before a zone can be enabled.
                  </Text>

                  {(!techZonePermissions?.groupedZonesByDistrict || Object.keys(techZonePermissions.groupedZonesByDistrict).length === 0) ? (
                    <Text fontSize="xs" color="gray.500" py={2}>No city zones available in the system.</Text>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {Object.values(techZonePermissions.groupedZonesByDistrict).map((group) => (
                        <Box key={group.districtId} border="1px solid" borderColor="gray.200" borderRadius="10px" overflow="hidden">
                          <Flex justify="space-between" align="center" bg={group.hasDistrictPermission ? "teal.50" : "gray.100"} px={3} py={2}>
                            <HStack spacing={2}>
                              <Text fontSize="xs" fontWeight="700" color={group.hasDistrictPermission ? BRAND : "gray.600"}>
                                {group.districtName}
                              </Text>
                              <Tag size="sm" colorScheme={group.hasDistrictPermission ? "teal" : "gray"} borderRadius="4px" fontSize="10px">
                                {group.hasDistrictPermission ? "District Enabled" : "District Disabled"}
                              </Tag>
                            </HStack>
                            {!group.hasDistrictPermission && (
                              <Text fontSize="10px" color="red.500" fontWeight="600">
                                Requires District Access First
                              </Text>
                            )}
                          </Flex>

                          <Box p={3} bg="white">
                            {group.zones.length === 0 ? (
                              <Text fontSize="xs" color="gray.400">No sub-zones created in this district.</Text>
                            ) : (
                              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={3}>
                                {group.zones.map((z) => (
                                  <Flex
                                    key={z.id}
                                    p={2}
                                    border="1px solid"
                                    borderColor={z.isEnabled ? "teal.300" : "gray.200"}
                                    borderRadius="8px"
                                    bg={z.isEnabled ? "teal.50" : "white"}
                                    justify="space-between"
                                    align="center"
                                    opacity={group.hasDistrictPermission ? 1 : 0.6}
                                  >
                                    <Box pr={2}>
                                      <Text fontSize="xs" fontWeight="600" color={INK}>{z.name}</Text>
                                      <Text fontSize="10px" color="gray.500">Code: {z.zoneCode}</Text>
                                    </Box>
                                    <Switch
                                      size="sm"
                                      colorScheme="teal"
                                      isChecked={z.isEnabled}
                                      isDisabled={!group.hasDistrictPermission}
                                      onChange={() => handleToggleZonePermission(z.id, z.isEnabled, group.districtName)}
                                    />
                                  </Flex>
                                ))}
                              </Grid>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3} pb={3} px={6}>
              <Button colorScheme="teal" borderRadius="8px" size="sm" px={6} onClick={() => setIsPermissionModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* CREATE / EDIT ZONE MODAL WITH LEAFLET MAP */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="4xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" maxH="90vh" overflow="hidden" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" color={BRAND} pb={2} pt={4} px={6} borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center" justify="space-between">
                <HStack spacing={3}>
                  <Box p={2} bg="teal.50" color={BRAND} borderRadius="10px">
                    <Icon as={MdMap} boxSize={5} />
                  </Box>
                  <Box>
                    <Text fontSize="lg" fontWeight="700" color={BRAND}>
                      {isEditing ? "Edit City Zone" : "Create New City Zone"}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">
                      Define operational sub-zone boundaries within parent district using real-time Leaflet map.
                    </Text>
                  </Box>
                </HStack>
              </Flex>
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />

            <ModalBody overflowY="auto" p={6} css={globalScrollbarStyles} bg="gray.50">
              {/* Inline Error Alert Banner for Zone Modal */}
              {zoneModalError && (
                <Flex
                  align="center"
                  bg="red.50"
                  border="1.5px solid"
                  borderColor="red.400"
                  color="red.800"
                  px={4}
                  py={3}
                  borderRadius="10px"
                  mb={4}
                  justify="space-between"
                  boxShadow="xs"
                >
                  <HStack spacing={3} align="center">
                    <Icon as={MdErrorOutline} boxSize={5} color="red.600" flexShrink={0} />
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="red.800">
                        Cannot Save Zone
                      </Text>
                      <Text fontSize="xs" color="red.700">
                        {zoneModalError}
                      </Text>
                    </Box>
                  </HStack>
                  <IconButton
                    size="xs"
                    icon={<MdClear />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => setZoneModalError("")}
                    aria-label="Dismiss error"
                  />
                </Flex>
              )}

              <Grid templateColumns={{ base: "1fr", md: "1fr 1.15fr" }} gap={5}>
                {/* Left Column: Form Details */}
                <VStack spacing={4} align="stretch">
                  <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="xs">
                    <VStack spacing={3} align="stretch">
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                          Operational District / City
                        </FormLabel>
                        <Select
                          size="sm"
                          value={formData.operationalCityId}
                          onChange={(e) => {
                            setZoneModalError("");
                            const nextDistrictId = e.target.value;
                            setFormData((prev) => {
                              // Auto-suggest a boundary when district changes and none set yet.
                              if (!prev.polygonCoordinates && nextDistrictId) {
                                const parent = districts.find((d) => String(d._id) === String(nextDistrictId));
                                const cityName = parent?.city || parent?.name || "";
                                const preset = TAMIL_NADU_CITIES.find(
                                  (c) => c.name.toLowerCase().trim() === String(cityName).toLowerCase().trim()
                                );
                                if (preset) {
                                  return {
                                    ...prev,
                                    operationalCityId: nextDistrictId,
                                    polygonCoordinates: JSON.stringify(
                                      generateCircularGeoJSON(preset.lat, preset.lng, 5),
                                      null,
                                      2
                                    ),
                                  };
                                }
                              }
                              return { ...prev, operationalCityId: nextDistrictId };
                            });
                          }}
                          borderRadius="8px"
                          fontWeight="600"
                        >
                          <option value="">-- Select Parent District --</option>
                          {districts.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.name} ({d.city})
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <Grid templateColumns="1.4fr 0.8fr" gap={3} w="100%">
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            Zone Name
                          </FormLabel>
                          <Input
                            size="sm"
                            value={formData.name}
                            onChange={(e) => {
                              setZoneModalError("");
                              setFormData({ ...formData, name: e.target.value });
                            }}
                            placeholder="e.g. North Zone, Central Hub"
                            borderRadius="8px"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            Zone Code
                          </FormLabel>
                          <Input
                            size="sm"
                            value={formData.zoneCode}
                            onChange={(e) => {
                              setZoneModalError("");
                              setFormData({ ...formData, zoneCode: e.target.value });
                            }}
                            placeholder="e.g. NZ01"
                            borderRadius="8px"
                            textTransform="uppercase"
                            fontWeight="700"
                          />
                        </FormControl>
                      </Grid>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                          Description
                        </FormLabel>
                        <Input
                          size="sm"
                          value={formData.description}
                          onChange={(e) => {
                            setZoneModalError("");
                            setFormData({ ...formData, description: e.target.value });
                          }}
                          placeholder="e.g. Covers northern residential blocks"
                          borderRadius="8px"
                        />
                      </FormControl>

                      <Flex justify="space-between" align="center" p={2.5} bg="gray.50" borderRadius="8px">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="gray.800">Zone Active</Text>
                          <Text fontSize="10px" color="gray.500">Enable services and assignments in this zone</Text>
                        </Box>
                        <Switch
                          isChecked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          colorScheme="teal"
                        />
                      </Flex>
                    </VStack>
                  </Box>

                  <Box bg="white" p={3.5} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="xs">
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Text fontSize="xs" fontWeight="700" color="gray.700">
                        GeoJSON Polygon Data
                      </Text>
                      <Badge colorScheme={formData.polygonCoordinates ? "green" : "gray"} fontSize="10px">
                        {formData.polygonCoordinates ? "Boundary Active" : "No Boundary"}
                      </Badge>
                    </Flex>
                    <Textarea
                      rows={4}
                      value={formData.polygonCoordinates}
                      onChange={(e) => setFormData({ ...formData, polygonCoordinates: e.target.value })}
                      placeholder='{"type": "Polygon", "coordinates": [[[76.85, 11.01], ...]]}'
                      fontSize="11px"
                      fontFamily="mono"
                      borderRadius="8px"
                      bg="gray.50"
                    />
                    <Text fontSize="10px" color="gray.500" mt={1}>
                      Auto-generated from Leaflet map drawing or radius preset.
                    </Text>
                  </Box>
                </VStack>

                {/* Right Column: Leaflet Map */}
                <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="teal.200" boxShadow="xs" display="flex" flexDirection="column">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="xs" fontWeight="700" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                      Zone Boundary Leaflet Canvas
                    </Text>
                    <Badge colorScheme="teal" fontSize="10px">
                      Live Drawing
                    </Badge>
                  </Flex>

                  <Box flex="1" minH="340px">
                    <ZoneMap
                      cityName={districts.find((d) => d._id === formData.operationalCityId)?.city || ""}
                      districtName={formData.name || "City Zone"}
                      polygonCoordinates={formData.polygonCoordinates}
                      onPolygonChange={(newPoly) => setFormData((prev) => ({ ...prev, polygonCoordinates: newPoly }))}
                      height="350px"
                      mode="polygon"
                      showSearch={true}
                      showDrawTools={true}
                      allowRadiusSelect={true}
                      showToolbar={true}
                      districts={districts}
                      zones={zones}
                      selectedDistrictId={formData.operationalCityId || null}
                    />
                  </Box>
                  <Text fontSize="11px" color="gray.500" mt={2}>
                    💡 <b>Tip:</b> Use <b>Radius</b> for quick circles or <b>Draw</b> for custom shapes — click to add vertices, drag them to edit, Finish to save. Invalid shapes are blocked on save.
                  </Text>
                </Box>
              </Grid>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="white" px={6} py={3}>
              <Button variant="ghost" mr={3} borderRadius="8px" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                bg={BRAND}
                color="white"
                borderRadius="8px"
                _hover={{ bg: BRAND_DARK }}
                onClick={handleSubmitZone}
                isLoading={isSubmitting}
                px={6}
                leftIcon={<Icon as={MdCheckCircle} />}
              >
                {isEditing ? "Update Zone" : "Create Zone"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* SERVICE ZONE MAPPING CHECKLIST & MANAGEMENT MODAL */}
        <Modal isOpen={isManageServiceModalOpen} onClose={() => setIsManageServiceModalOpen(false)} size="xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" maxH="88vh" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" borderBottom="1px solid" borderColor="gray.100" pb={3}>
              {isServiceDetailLoading ? (
                <Flex align="center" gap={2}>
                  <Spinner size="sm" color={BRAND} />
                  <Text fontSize="md">Loading Service Details...</Text>
                </Flex>
              ) : selectedServiceDetail?.service ? (
                <Flex align="center" justify="space-between" flexWrap="wrap" gap={2} w="100%" pr={8}>
                  <Box>
                    <Heading size="md" color={INK}>
                      {selectedServiceDetail.service.serviceName}
                    </Heading>
                    <Text fontSize="xs" color="purple.600" fontWeight="600" mt={0.5}>
                      Category: {selectedServiceDetail.service.categoryName}
                    </Text>
                  </Box>
                  <HStack spacing={3} bg="gray.50" p={2} borderRadius="10px" border="1px solid" borderColor="gray.200">
                    <StatusPill tone={selectedServiceDetail.service.isActive !== false ? "active" : "inactive"}>
                      {selectedServiceDetail.service.isActive !== false ? "Service Active" : "Service Inactive"}
                    </StatusPill>
                    <Switch
                      size="md"
                      colorScheme="teal"
                      isChecked={selectedServiceDetail.service.isActive !== false}
                      onChange={handleToggleGlobalServiceDirect}
                      isDisabled={isTogglingServiceStatus}
                    />
                  </HStack>
                </Flex>
              ) : (
                <Text fontSize="md">Service Zone Mapping</Text>
              )}
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody overflowY="auto" py={4} css={globalScrollbarStyles}>
              {isServiceDetailLoading || !selectedServiceDetail ? (
                <Flex justify="center" align="center" py={12}>
                  <Spinner size="lg" color={BRAND} />
                </Flex>
              ) : (
                <VStack spacing={4} align="stretch">
                  {/* Global Inactive Warning */}
                  {!selectedServiceDetail.service.isActive && (
                    <Box p={3} bg="red.50" borderRadius="8px" borderLeft="4px solid" borderColor="red.500">
                      <Flex align="center" gap={2}>
                        <Icon as={MdErrorOutline} color="red.500" w={5} h={5} />
                        <Text fontSize="xs" color="red.800" fontWeight="600">
                          Service is globally INACTIVE. Toggle the switch above to activate this service for customer bookings.
                        </Text>
                      </Flex>
                    </Box>
                  )}

                  <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                    City & District Service Availability
                  </Text>

                  {/* List of Cities with Single Clear Toggle Switch per City in Alphabetical Order */}
                  {[...(selectedServiceDetail.districts || [])]
                    .sort((a, b) => (a.name || a.city || "").localeCompare(b.name || b.city || ""))
                    .map((dist) => {
                      const isCityEnabled = isDistrictServiceActive(dist);
                      const hasSubZones = (dist.zones || []).length > 0;
                      const isThisDistrictToggling = togglingDistrictId === (dist.districtId || dist._id);

                    return (
                      <Box
                        key={dist.districtId || dist._id}
                        bg="white"
                        p={4}
                        borderRadius="12px"
                        border="1px solid"
                        borderColor={isCityEnabled ? "teal.200" : "gray.200"}
                        shadow="sm"
                      >
                        <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
                          <HStack spacing={3}>
                            <Icon as={MdLocationOn} color={isCityEnabled ? BRAND : "gray.400"} w={6} h={6} />
                            <Box>
                              <Text fontSize="sm" fontWeight="700" color={INK}>{dist.name}</Text>
                              <Text fontSize="xs" color="gray.500">
                                Code: {dist.code} • {hasSubZones ? `${dist.activeZonesCount || 0} Active Sub-Zones` : "Entire District Availability"}
                              </Text>
                            </Box>
                          </HStack>

                          <HStack spacing={3}>
                            <StatusPill tone={isCityEnabled ? "active" : "inactive"}>
                              {isCityEnabled ? "Enabled in City" : "Disabled in City"}
                            </StatusPill>
                            <Switch
                              size="md"
                              colorScheme="teal"
                              isChecked={isCityEnabled}
                              isDisabled={isThisDistrictToggling}
                              onChange={() => handleToggleDistrictAvailabilityDirect(dist)}
                            />
                          </HStack>
                        </Flex>

                        {/* Sub-Zones Section (Only rendered if sub-zones exist) */}
                        {hasSubZones && (
                          <Box mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
                            <Text fontSize="xs" fontWeight="700" color="gray.600" mb={2}>
                              Sub-Zone Availability:
                            </Text>
                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={2}>
                              {[...(dist.zones || [])]
                                .sort((a, b) => (a.name || a.zoneCode || "").localeCompare(b.name || b.zoneCode || ""))
                                .map((z) => {
                                  const isZoneEnabled = isZoneServiceActive(z);
                                  const isThisZoneToggling = togglingZoneId === (z.zoneId || z._id || z.id);
                                return (
                                  <Flex
                                    key={z.zoneId || z._id || z.id}
                                    p={2.5}
                                    bg="gray.50"
                                    borderRadius="8px"
                                    border="1px solid"
                                    borderColor={isZoneEnabled ? "teal.100" : "gray.200"}
                                    align="center"
                                    justify="space-between"
                                  >
                                    <Box>
                                      <Text fontSize="xs" fontWeight="600" color={INK}>{z.name}</Text>
                                      <Text fontSize="10px" color="gray.500">Code: {z.zoneCode}</Text>
                                    </Box>

                                    <HStack spacing={2}>
                                      <StatusPill tone={isZoneEnabled ? "active" : "inactive"}>
                                        {isZoneEnabled ? "Active" : "Off"}
                                      </StatusPill>
                                      <Switch
                                        size="sm"
                                        colorScheme="teal"
                                        isChecked={isZoneEnabled}
                                        isDisabled={isThisZoneToggling}
                                        onChange={() => handleToggleSubZoneAvailabilityDirect(z, z.status, dist)}
                                      />
                                    </HStack>
                                  </Flex>
                                );
                              })}
                            </Grid>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </ModalBody>

            <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3}>
              <Button colorScheme="teal" borderRadius="8px" onClick={() => setIsManageServiceModalOpen(false)}>
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* TECHNICIAN GEOFENCE & GPS VERIFICATION MODAL */}
        <Modal isOpen={!!techGeofenceDetail || isTechGeofenceLoading} onClose={() => setTechGeofenceDetail(null)} size="lg">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400} />
          <ModalContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401}>
            <ModalHeader bg="white" color={BRAND} pb={2}>
              Technician GPS & Geofence Verification
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {isTechGeofenceLoading ? (
                <Flex justify="center" align="center" py={8}>
                  <Spinner size="lg" color={BRAND} />
                </Flex>
              ) : techGeofenceDetail ? (
                <VStack spacing={4} align="stretch">
                  <Box p={3} bg="teal.50" borderRadius="10px">
                    <Text fontSize="xs" fontWeight="700" color="teal.900">
                      {getTechDisplayName(selectedTechForPermission)}
                    </Text>
                    <Text fontSize="11px" color="teal.700">
                      Assigned District: {techGeofenceDetail.districtName || selectedTechForPermission?.primaryCityId?.name || "N/A"}
                    </Text>
                  </Box>

                  <Grid templateColumns="1fr 1fr" gap={2} fontSize="xs">
                    <Box p={2.5} bg="gray.50" borderRadius="8px" border="1px solid" borderColor="gray.200">
                      <Text color="gray.500">Registered Lat / Lng</Text>
                      <Text fontWeight="700">{techGeofenceDetail.latitude || 11.0168}, {techGeofenceDetail.longitude || 76.9558}</Text>
                    </Box>
                    <Box p={2.5} bg="gray.50" borderRadius="8px" border="1px solid" borderColor="gray.200">
                      <Text color="gray.500">Boundary Containment</Text>
                      <Badge colorScheme={techGeofenceDetail.isInsideDistrict !== false ? "green" : "red"}>
                        {techGeofenceDetail.isInsideDistrict !== false ? "INSIDE BOUNDARY" : "OUTSIDE BOUNDARY"}
                      </Badge>
                    </Box>
                  </Grid>

                  <Box p={3} bg="white" border="1px solid" borderColor="gray.200" borderRadius="10px">
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="xs" fontWeight="700">GPS Location Verified</Text>
                          <Text fontSize="10px" color="gray.500">Confirm physical address matches registered GPS pin</Text>
                        </Box>
                        <Switch
                          colorScheme="teal"
                          isChecked={techLocationVerified}
                          onChange={(e) => setTechLocationVerified(e.target.checked)}
                        />
                      </Flex>

                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="orange.700">Override Zone Mismatch</Text>
                          <Text fontSize="10px" color="gray.500">Allow dispatch even if home GPS falls outside district boundary</Text>
                        </Box>
                        <Switch
                          colorScheme="orange"
                          isChecked={techOverrideMismatch}
                          onChange={(e) => setTechOverrideMismatch(e.target.checked)}
                        />
                      </Flex>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Verification Notes</FormLabel>
                        <Input
                          size="sm"
                          borderRadius="8px"
                          placeholder="e.g. Physical address verified with GPS match"
                          value={techVerificationNotes}
                          onChange={(e) => setTechVerificationNotes(e.target.value)}
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </VStack>
              ) : null}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3}>
              <Button variant="ghost" mr={3} borderRadius="8px" onClick={() => setTechGeofenceDetail(null)}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                borderRadius="8px"
                onClick={handleSaveTechGeofenceVerification}
                isLoading={isUpdatingVerification}
              >
                Save Verification Status
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* DELETE CONFIRMATION ALERT DIALOG */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400}>
            <AlertDialogContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401}>
              <AlertDialogHeader bg="white" fontSize="lg" fontWeight="bold" color={INK}>
                Delete {deleteType === "district" ? "Operational District" : "City Micro-Zone"}?
              </AlertDialogHeader>
              <AlertDialogBody fontSize="sm" color="gray.600">
                Are you sure you want to permanently delete <b>"{itemToDelete?.name}"</b>? This action cannot be undone and will invalidate associated spatial caches.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} borderRadius="8px" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  borderRadius="8px"
                  onClick={handleConfirmDelete}
                  ml={3}
                  isLoading={deleteLoading}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* SERVICE ZONE ACTION CONFIRMATION ALERT DIALOG */}
        <AlertDialog
          isOpen={isConfirmDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsConfirmDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="16px">
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color={INK}>
                {confirmConfig.title}
              </AlertDialogHeader>
              <AlertDialogBody fontSize="sm" color="gray.600">
                {confirmConfig.description}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} borderRadius="8px" onClick={() => setIsConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme={confirmConfig.type?.includes("DISABLE") || confirmConfig.type === "CLEAR_ALL" ? "red" : "teal"}
                  borderRadius="8px"
                  onClick={handleExecuteConfirmedAction}
                  ml={3}
                  isLoading={isConfirmingAction}
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
    );
  }