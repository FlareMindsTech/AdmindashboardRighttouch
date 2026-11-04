  import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
    SimpleGrid,
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
    Checkbox,
    ButtonGroup,
  } from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import {
  getSkeuomorphicCardStyle,
  getSkeuomorphicIconBoxStyle,
  skeuomorphicIconFilter,
} from "components/common/skeuomorphicStyles";
import { generateCircularGeoJSON } from "components/Map/DistrictMap.js";
import ZoneMap, { ZONE_COLOR_PALETTE } from "components/Map/ZoneMap.js";
import LocationCombobox from "components/common/LocationCombobox";
import DistrictPickerCard, {
  QuickPickChips,
} from "components/common/DistrictPickerCard";
import DistrictGeoJsonBoundaryCard from "components/common/DistrictGeoJsonBoundaryCard";
import TamilNaduDistrictMiniMap from "components/Map/TamilNaduDistrictMiniMap";
import {
  TAMIL_NADU_CITIES,
  TAMIL_NADU_DISTRICTS,
  findConfiguredDistrictForTnName,
  findTnDistrict,
  findTnCity,
  findTnDistrictForRecord,
  getAvailableDistrictName,
  getDistrictCities,
  getDistrictForCity,
  getTnDistrictBoundary,
  calculatePolygonCentroid,
  getSubzonesByDistrict,
  normalizeLocationName,
} from "data/tamilNaduLocations";
import polygonClipping from "polygon-clipping";
import {
  isPolygonDraftDirty,
  confirmIfDirty,
  attachBeforeUnload,
} from "../utils/cityZoneInteraction";

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
    MdPublic,
    MdCheckCircle,
    MdPersonAdd,
    MdApartment,
    MdClear,
    MdSearch,
    MdFilterList,
    MdErrorOutline,
    MdSecurity,
    MdSpeed,
    MdRadar,
    MdVerified,
    MdAccountTree,
    MdAnalytics,
    MdGpsFixed,
    MdLocationCity,
    MdPlace,
    MdAddCircleOutline,
    MdInfoOutline,
    MdOutlineFactCheck,
    MdWarning,
  } from "react-icons/md";

  import {
    createZone,
    getAllZones,
    updateZone,
    deleteZone,
    getAllZoneMappings,
    deleteZoneMapping,
    getAllOperationalCities,
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
  } from "../utils/axiosInstance";
import { useAppDispatch } from "store/hooks";
import { fetchCategories, fetchServices } from "store/slices/referenceSlice";
import { fetchTechnicians as fetchTechniciansShared } from "store/slices/techniciansSlice";

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
    const dispatch = useAppDispatch();
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
    const isMountedRef = useRef(true);
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);
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
    const [districtFilter, setDistrictFilter] = useState("all"); // 'all' (all created districts) | 'active' (enabled) | 'inactive' (disabled)
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
    const [districtTnName, setDistrictTnName] = useState("");
    const [isLocatingHub, setIsLocatingHub] = useState(false);
    const districtHubCities = useMemo(
      () => (districtTnName ? getDistrictCities(districtTnName) : []),
      [districtTnName]
    );
    const districtHubOptions = useMemo(
      () =>
        districtHubCities.map((city) => ({
          value: city.name,
          label: city.name,
          description: city.district,
          badge: city.code,
          keywords: `${city.name} ${city.district} ${city.code}`,
          city,
        })),
      [districtHubCities]
    );
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
    // F-02D: polygon snapshot taken when the district modal opens; closing
    // with a diverged draft requires explicit confirmation. Snapshot resets
    // on confirmed save or explicit discard (modal close).
    const districtFormSnapshot = useRef("");
    const districtModalDirty =
      isDistrictModalOpen &&
      isPolygonDraftDirty(districtFormData.polygonCoordinates || "", districtFormSnapshot.current || "");
    useEffect(() => attachBeforeUnload(districtModalDirty), [districtModalDirty]);

    const resumeOpsFromContext = useCallback(() => {}, []);

    const handleCloseDistrictModal = () => {
      if (!confirmIfDirty(districtModalDirty, "You have unsaved district boundary changes. Close without saving?")) return;
      districtFormSnapshot.current = "";
      setDistrictTnName("");
      setDistrictFormData(initialDistrictForm);
      setDistrictModalError("");
      setIsDistrictModalOpen(false);
      resumeOpsFromContext("district");
    };

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
    const [selectedTnDistrictName, setSelectedTnDistrictName] = useState("");
    const [districtMasterView, setDistrictMasterView] = useState("table");
    const initialForm = {
      operationalCityId: "",
      city: "",
      name: "",
      zoneCode: "",
      description: "",
      active: true,
      polygonCoordinates: "",
    };
    const [formData, setFormData] = useState(initialForm);
    const [zoneCityFilterMode, setZoneCityFilterMode] = useState("district");
    const [zoneSearchFilter, setZoneSearchFilter] = useState("");
    const [isLocatingZoneCity, setIsLocatingZoneCity] = useState(false);
    const zoneCityComboRef = useRef(null);
    const zoneParentDistrict = useMemo(
      () =>
        districts.find(
          (district) =>
            String(district._id) === String(formData.operationalCityId)
        ) || null,
      [districts, formData.operationalCityId]
    );
    const zoneParentTnDistrict = useMemo(
      () => findTnDistrictForRecord(zoneParentDistrict),
      [zoneParentDistrict]
    );
    const zoneDistrictCities = useMemo(
      () =>
        zoneParentDistrict
          ? getDistrictCities(
              zoneParentTnDistrict?.name ||
                zoneParentDistrict.city ||
                zoneParentDistrict.name
            )
          : selectedTnDistrictName
          ? getDistrictCities(selectedTnDistrictName)
          : [],
      [zoneParentDistrict, zoneParentTnDistrict, selectedTnDistrictName]
    );
    const zoneCityOptions = useMemo(
      () => {
        if (zoneCityFilterMode === "district") {
          if (zoneParentDistrict) {
            return zoneDistrictCities;
          }
          if (selectedTnDistrictName) {
            return getDistrictCities(selectedTnDistrictName);
          }
        }
        return TAMIL_NADU_CITIES;
      },
      [zoneCityFilterMode, zoneDistrictCities, zoneParentDistrict, selectedTnDistrictName]
    );
    const isZoneCityScoped =
      zoneCityFilterMode === "district" && Boolean(zoneParentDistrict || selectedTnDistrictName);
    const zoneCityScopeName =
      zoneParentTnDistrict?.name ||
      zoneParentDistrict?.city ||
      zoneParentDistrict?.name ||
      selectedTnDistrictName ||
      "";

    const selectedDistrictSubzones = useMemo(() => {
      const dName =
        selectedTnDistrictName ||
        zoneParentTnDistrict?.name ||
        zoneParentDistrict?.name ||
        zoneParentDistrict?.city ||
        "";
      return dName ? getSubzonesByDistrict(dName) : [];
    }, [selectedTnDistrictName, zoneParentTnDistrict, zoneParentDistrict]);

    const availableDistrictCities = useMemo(() => {
      if (zoneDistrictCities && zoneDistrictCities.length > 0) {
        return zoneDistrictCities;
      }
      if (zoneParentDistrict?.city) {
        return [{ name: zoneParentDistrict.city, code: zoneParentDistrict.code || "HQ" }];
      }
      return (districts || []).map((d) => ({ name: d.city || d.name, code: d.code || "TN" }));
    }, [zoneDistrictCities, zoneParentDistrict, districts]);

    const filteredDistrictSubzones = useMemo(() => {
      let list = selectedDistrictSubzones;
      if (formData.city) {
        const cNorm = formData.city.toLowerCase().split("(")[0].trim();
        const citySpecific = list.filter((sz) => {
          const szName = (sz.name || "").toLowerCase();
          const szDist = (sz.district || "").toLowerCase();
          const szCity = (sz.city || "").toLowerCase();
          return szName.includes(cNorm) || szCity.includes(cNorm) || cNorm.includes(szCity);
        });
        if (citySpecific.length > 0) list = citySpecific;
      }
      if (!zoneSearchFilter) return list;
      const q = zoneSearchFilter.toLowerCase();
      return list.filter(
        (sz) =>
          (sz.name || "").toLowerCase().includes(q) ||
          (sz.district || "").toLowerCase().includes(q) ||
          (sz.type || "").toLowerCase().includes(q)
      );
    }, [selectedDistrictSubzones, formData.city, zoneSearchFilter]);

    const filteredDistrictCities = useMemo(() => {
      if (!zoneSearchFilter) return availableDistrictCities;
      const q = zoneSearchFilter.toLowerCase();
      return availableDistrictCities.filter(
        (c) =>
          (c.name || c || "").toLowerCase().includes(q) ||
          (c.code || "").toLowerCase().includes(q)
      );
    }, [availableDistrictCities, zoneSearchFilter]);

    // F-02D: same polygon-draft guard for the micro-zone modal.
    const zoneFormSnapshot = useRef("");
    const zoneModalDirty =
      isModalOpen &&
      isPolygonDraftDirty(formData.polygonCoordinates || "", zoneFormSnapshot.current || "");
    useEffect(() => attachBeforeUnload(zoneModalDirty), [zoneModalDirty]);
    const handleCloseZoneModal = () => {
      if (!confirmIfDirty(zoneModalDirty, "You have unsaved zone boundary changes. Close without saving?")) return;
      zoneFormSnapshot.current = "";
      setZoneCityFilterMode("district");
      setIsModalOpen(false);
      resumeOpsFromContext("zone");
    };

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
    // F-01A: explicit error states so failed dashboard/impact requests are
    // never rendered as (falsely healthy) empty data.
    const [districtDashboardError, setDistrictDashboardError] = useState(null);
    const [impactAnalysisError, setImpactAnalysisError] = useState(null);
    const [isLoadingDistrictDashboard, setIsLoadingDistrictDashboard] = useState(false);

    // Job Geofence Location Inspector & Broadcast Audit
    const [inspectJobId, setInspectJobId] = useState("");
    const [jobLocationInspectData, setJobLocationInspectData] = useState(null);
    const [broadcastAuditData, setBroadcastAuditData] = useState(null);
    const [isInspectingJob, setIsInspectingJob] = useState(false);

    // Dispatch Health & Diagnostics Debug
    const [debugDistrictId, setDebugDistrictId] = useState("");
    const [debugServiceId, setDebugServiceId] = useState("");
    const [debugTechId, setDebugTechId] = useState("");
    const [dispatchDebugData, setDispatchDebugData] = useState(null);
    const [isLoadingDispatchDebug, setIsLoadingDispatchDebug] = useState(false);

    // Polygon Rollback
    const [rollbackEntityType, setRollbackEntityType] = useState("DISTRICT");
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
    // F-02D: the textarea starts life as a saved baseline; any divergence is
    // an unsaved draft that must survive accidental preset/district-load
    // replacement and page unload until explicitly discarded or replaced.
    const GEO_TOOL_INITIAL_POLYGON = `{
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
  }`;
    const [geoToolPolygon, setGeoToolPolygon] = useState(GEO_TOOL_INITIAL_POLYGON);
    const [geoToolSavedSnapshot, setGeoToolSavedSnapshot] = useState(GEO_TOOL_INITIAL_POLYGON);
    const geoToolDirty = isPolygonDraftDirty(geoToolPolygon, geoToolSavedSnapshot);
    useEffect(() => attachBeforeUnload(geoToolDirty), [geoToolDirty]);
    // Replace the draft only with explicit confirmation when dirty; the
    // snapshot advances only on confirmed replace/discard (never on audit).
    const replaceGeoToolDraft = (next, sourceLabel) => {
      if (!confirmIfDirty(geoToolDirty, `You have unsaved polygon changes. Replace them with ${sourceLabel || "the new polygon"}?`)) return false;
      setGeoToolPolygon(next);
      setGeoToolSavedSnapshot(next);
      setGeoValidationResult(null);
      return true;
    };
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
    // NOTE (F-01D): unavailability debugging is served by the broadcast
    // audit rendered in the job-inspect panel above (debugUnavailability
    // helper delegates to the real broadcast-audit endpoint).

    // Zone Health & Monitoring State
    const [healthData, setHealthData] = useState(null);
    const [liveMonitorData, setLiveMonitorData] = useState(null);
    const [isHealthLoading, setIsHealthLoading] = useState(false);

    // Service-Zone Matrix & Checklist States (Tab 2)
    const [matrixData, setMatrixData] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [matrixCategoryFilter, setMatrixCategoryFilter] = useState("ALL");
    const [matrixDistrictFilter, setMatrixDistrictFilter] = useState("ALL");
    const [matrixZoneFilter, setMatrixZoneFilter] = useState("ALL");
    const [matrixZoneSearch, setMatrixZoneSearch] = useState("");
    const [isTogglingSingleZone, setIsTogglingSingleZone] = useState(false);
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

    // Batch Selection States for Service-Zone Matrix (Tab 2)
    const [selectedMatrixServiceIds, setSelectedMatrixServiceIds] = useState([]);
    const [batchMatrixDistrictId, setBatchMatrixDistrictId] = useState("");
    const [isBatchMatrixLoading, setIsBatchMatrixLoading] = useState(false);

    // Batch Selection States for Technician Permissions (Tab 3)
    const [selectedTechIds, setSelectedTechIds] = useState([]);
    const [batchTechDistrictId, setBatchTechDistrictId] = useState("");
    const [batchTechRadius, setBatchTechRadius] = useState("10");
    const [isBatchTechLoading, setIsBatchTechLoading] = useState(false);

    // Modal Polygon Pre-Save Validation States
    const [modalBoundaryCheckResult, setModalBoundaryCheckResult] = useState(null);
    const [isCheckingModalBoundary, setIsCheckingModalBoundary] = useState(false);

    // Sub-zone search filter inside ManageServiceModal
    const [manageModalSubZoneSearch, setManageModalSubZoneSearch] = useState("");

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

    const modalContentProps = {
      bg: "white",
      borderRadius: "16px",
      maxH: "90vh",
      overflow: "hidden",
      boxShadow: "2xl",
      zIndex: 1401,
    };

    const modalHeaderProps = {
      bg: "white",
      color: BRAND,
      pl: 6,
      pr: 12,
      pt: 4,
      pb: 3,
      borderBottom: "1px solid",
      borderColor: "gray.100",
    };

    const modalBodyProps = {
      bg: "gray.50",
      px: 6,
      py: 4,
      overflowY: "auto",
      css: globalScrollbarStyles,
    };

    const modalFooterProps = {
      bg: "white",
      borderTop: "1px solid",
      borderColor: "gray.100",
      px: 6,
      py: 3,
    };

    const getTechPermissionDistricts = (tech) => {
      const seen = new Set();
      return [...(tech?.enabledDistrictIds || []), ...(tech?.allowedCityIds || [])].filter((d) => {
        const id = String(d?._id || d?.districtId || d?.id || d || "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    };

    const activeServiceCountByZone = useMemo(() => {
      const counts = new Map();
      (mappings || []).forEach((mapping) => {
        if (mapping?.active !== true) return;
        const rawZone = mapping.zoneId ?? mapping.cityZoneId;
        const zoneId = rawZone && typeof rawZone === "object" ? rawZone._id || rawZone.id : rawZone;
        if (!zoneId) return;
        const key = String(zoneId);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      return counts;
    }, [mappings]);

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
          // Shared services cache (TTL); resolves to the raw list so the
          // local parsing/sorting below is unchanged. Fallback preserved.
          dispatch(fetchServices()).unwrap().then((r) => r.list).catch(() => []),
          // Shared technicians cache (TTL). Fallback preserved.
          dispatch(fetchTechniciansShared()).unwrap().then((r) => r.list).catch(() => ({ result: [], data: [], technicians: [] })),
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

        if (!isMountedRef.current) return;
        setDistricts(Array.isArray(districtsRaw) ? districtsRaw : []);
        setZones(Array.isArray(zonesRaw) ? zonesRaw : []);
        setMappings(Array.isArray(mappingsRaw) ? mappingsRaw : []);
        setCities(Array.isArray(citiesRaw) ? citiesRaw : []);
        setServices(Array.isArray(servicesRaw) ? servicesRaw : []);
        setTechnicians(Array.isArray(techRaw) ? techRaw : []);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error("Fetch error:", err);
        toast({
          title: "Fetch Error",
          description: err.message || "Failed to load location data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }, [dispatch, toast]);

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
        if (matrixZoneFilter !== "ALL") params.zoneId = matrixZoneFilter;
        if (matrixZoneStatusFilter !== "ALL") params.zoneStatus = matrixZoneStatusFilter;
        if (matrixServiceStatusFilter !== "ALL") params.serviceStatus = matrixServiceStatusFilter;

        const [res, catRes] = await Promise.all([
          getServiceZoneMatrix(params).catch(() => ({ result: [] })),
          // Shared service-categories cache (TTL); fallback preserved.
          dispatch(fetchCategories({ categoryType: "service" })).unwrap().then((r) => r.list).catch(() => ({ result: [] })),
        ]);

        const items = res.result || res.data || res || [];
        const cats = catRes.result || catRes.categories || catRes.data || catRes || [];
        setMatrixData(Array.isArray(items) ? items : []);
        setCategoriesList(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error("fetchMatrixData error:", err);
      }
    }, [dispatch, matrixSearch, matrixCategoryFilter, matrixDistrictFilter, matrixZoneFilter, matrixZoneStatusFilter, matrixServiceStatusFilter]);

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
      setMatrixZoneFilter("ALL");
      setMatrixZoneSearch("");
      setMatrixZoneStatusFilter("ALL");
      setMatrixServiceStatusFilter("ALL");
      setShowAllChecked(true);
    };

    const isServiceActiveInZone = useCallback((serviceId, zoneId) => {
      if (!serviceId || !zoneId) return false;
      const sIdStr = String(serviceId);
      const zIdStr = String(zoneId);
      const found = (mappings || []).find((m) => {
        const msId = String(m.serviceId?._id || m.serviceId?.id || m.serviceId || "");
        const mzId = String(m.zoneId?._id || m.zoneId?.id || m.zoneId || m.cityZoneId?._id || m.cityZoneId?.id || m.cityZoneId || "");
        return msId === sIdStr && mzId === zIdStr;
      });
      if (!found) return false;
      return found.active === true || found.status === "ENABLED" || found.enabled === true;
    }, [mappings]);

    const handleToggleSingleServiceInSelectedZone = async (serviceId, currentActive, serviceName) => {
      if (matrixDistrictFilter === "ALL" || matrixZoneFilter === "ALL") return;
      const nextActive = !currentActive;
      const nextStatus = nextActive ? "ENABLED" : "DISABLED";
      const targetZone = zones.find((z) => String(z._id || z.zoneId || z.id) === String(matrixZoneFilter));
      const targetDist = districts.find((d) => String(d._id) === String(matrixDistrictFilter));

      // 1. Instant optimistic UI update in mappings state (0ms latency)
      setMappings((prevMappings) => {
        const sIdStr = String(serviceId);
        const zIdStr = String(matrixZoneFilter);
        const existingIdx = (prevMappings || []).findIndex((m) => {
          const msId = String(m.serviceId?._id || m.serviceId?.id || m.serviceId || "");
          const mzId = String(m.zoneId?._id || m.zoneId?.id || m.zoneId || m.cityZoneId?._id || m.cityZoneId?.id || m.cityZoneId || "");
          return msId === sIdStr && mzId === zIdStr;
        });

        if (existingIdx >= 0) {
          const updated = [...prevMappings];
          updated[existingIdx] = {
            ...updated[existingIdx],
            active: nextActive,
            enabled: nextActive,
            status: nextStatus,
          };
          return updated;
        }

        return [
          ...(prevMappings || []),
          {
            serviceId,
            zoneId: matrixZoneFilter,
            cityZoneId: matrixZoneFilter,
            districtId: matrixDistrictFilter,
            active: nextActive,
            enabled: nextActive,
            status: nextStatus,
          },
        ];
      });

      // Optimistically update counts in matrixData
      setMatrixData((prev) =>
        prev.map((m) => {
          if (String(m.serviceId) === String(serviceId)) {
            const currentActiveCount = m.activeZonesCount || 0;
            const newActiveCount = nextActive ? currentActiveCount + 1 : Math.max(0, currentActiveCount - 1);
            return {
              ...m,
              activeZonesCount: newActiveCount,
              inactiveZonesCount: Math.max(0, (m.inactiveZonesCount || 0) + (nextActive ? -1 : 1)),
            };
          }
          return m;
        })
      );

      toast({
        title: `Service ${nextActive ? "Enabled" : "Disabled"} in Zone`,
        description: `"${serviceName}" is now ${nextStatus} in ${targetZone?.name || "Zone"} (${targetDist?.name || "District"}).`,
        status: nextActive ? "success" : "info",
        duration: 1500,
        isClosable: true,
      });

      // 2. Perform background write without freezing UI
      try {
        await toggleZoneAvailability({
          serviceId,
          districtId: matrixDistrictFilter,
          zoneId: matrixZoneFilter,
          cityZoneId: matrixZoneFilter,
          enabled: nextActive,
          status: nextStatus,
        });
      } catch (err) {
        // Revert on error
        setMappings((prevMappings) =>
          (prevMappings || []).map((m) => {
            const msId = String(m.serviceId?._id || m.serviceId?.id || m.serviceId || "");
            const mzId = String(m.zoneId?._id || m.zoneId?.id || m.zoneId || m.cityZoneId?._id || m.cityZoneId?.id || m.cityZoneId || "");
            if (msId === String(serviceId) && mzId === String(matrixZoneFilter)) {
              return { ...m, active: currentActive, enabled: currentActive, status: currentActive ? "ENABLED" : "DISABLED" };
            }
            return m;
          })
        );
        toast({
          title: "Toggle Error",
          description: err.message || "Failed to toggle service in zone.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const handleBulkToggleServicesInSelectedZone = async (enable) => {
      if (matrixDistrictFilter === "ALL" || matrixZoneFilter === "ALL") return;
      const targetServices = currentMatrixData.map((m) => m.serviceId).filter(Boolean);
      if (targetServices.length === 0) return;

      const targetZone = zones.find((z) => String(z._id || z.zoneId || z.id) === String(matrixZoneFilter));
      const targetDist = districts.find((d) => String(d._id) === String(matrixDistrictFilter));
      const nextStatus = enable ? "ENABLED" : "DISABLED";
      const zIdStr = String(matrixZoneFilter);

      // 1. Instant optimistic UI update
      setMappings((prevMappings) => {
        const targetSet = new Set(targetServices.map(String));
        const updated = (prevMappings || []).map((m) => {
          const msId = String(m.serviceId?._id || m.serviceId?.id || m.serviceId || "");
          const mzId = String(m.zoneId?._id || m.zoneId?.id || m.zoneId || m.cityZoneId?._id || m.cityZoneId?.id || m.cityZoneId || "");
          if (mzId === zIdStr && targetSet.has(msId)) {
            return { ...m, active: enable, enabled: enable, status: nextStatus };
          }
          return m;
        });

        const existingSIds = new Set(
          (prevMappings || [])
            .filter((m) => String(m.zoneId?._id || m.zoneId || m.cityZoneId) === zIdStr)
            .map((m) => String(m.serviceId?._id || m.serviceId))
        );
        targetServices.forEach((sId) => {
          if (!existingSIds.has(String(sId))) {
            updated.push({
              serviceId: sId,
              zoneId: matrixZoneFilter,
              cityZoneId: matrixZoneFilter,
              districtId: matrixDistrictFilter,
              active: enable,
              enabled: enable,
              status: nextStatus,
            });
          }
        });
        return updated;
      });

      toast({
        title: `All Services ${enable ? "Enabled" : "Disabled"} in Zone`,
        description: `${targetServices.length} services set to ${nextStatus} in ${targetZone?.name || "Zone"} (${targetDist?.name || "District"}).`,
        status: enable ? "success" : "info",
        duration: 2000,
        isClosable: true,
      });

      // 2. Perform background writes
      try {
        setIsTogglingSingleZone(true);
        await Promise.all(
          targetServices.map((sId) =>
            toggleZoneAvailability({
              serviceId: sId,
              districtId: matrixDistrictFilter,
              zoneId: matrixZoneFilter,
              cityZoneId: matrixZoneFilter,
              enabled: enable,
              status: nextStatus,
            }).catch((e) => console.warn(`Toggle failed for service ${sId}:`, e))
          )
        );
      } catch (err) {
        toast({
          title: "Batch Zone Toggle Error",
          description: err.message || "Failed to update all services in zone.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        await fetchData();
      } finally {
        setIsTogglingSingleZone(false);
      }
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
      // A district with sub-zones is active when at least one sub-zone is
      // active. isDistrictEnabled is the district-default fallback and must
      // not mask zone-level overrides returned by the detail endpoint.
      if (Array.isArray(dist.zones) && dist.zones.length > 0) {
        return dist.zones.some((z) => isZoneServiceActive(z));
      }
      if (dist.isDistrictEnabled === false) return false;
      if (dist.isDistrictEnabled === true) return true;
      if (dist.status === "DISABLED" || dist.status === "INACTIVE") return false;
      if (dist.status === "ENABLED" || dist.status === "ACTIVE") return true;
      if (dist.isServiceEnabled === false) return false;
      if (dist.isServiceEnabled === true) return true;
      if (dist.isAvailable === false) return false;
      if (dist.isAvailable === true) return true;
      if (dist.enabled === false) return false;
      if (dist.enabled === true) return true;
      if (dist.active === false) return false;
      if (dist.active === true) return true;
      if (typeof dist.activeZonesCount === "number") {
        return dist.activeZonesCount > 0;
      }
      return false;
    };

    const isZoneServiceActive = (zone) => {
      if (!zone) return false;
      if (zone.status === "DISABLED" || zone.status === "INACTIVE") return false;
      if (zone.status === "ENABLED" || zone.status === "ACTIVE") return true;
      if (zone.isAvailable === false) return false;
      if (zone.isAvailable === true) return true;
      if (zone.isServiceEnabled === false) return false;
      if (zone.isServiceEnabled === true) return true;
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
                isAvailable: nextEnabled,
                isServiceEnabled: nextEnabled,
              }));
              return {
                ...d,
                isDistrictEnabled: nextEnabled,
                status: nextStatus,
                enabled: nextEnabled,
                active: nextEnabled,
                isAvailable: nextEnabled,
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
                  ? {
                      ...z,
                      status: nextStatus,
                      enabled: nextEnabled,
                      active: nextEnabled,
                      isAvailable: nextEnabled,
                      isServiceEnabled: nextEnabled,
                    }
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
                active: activeCount > 0,
                isAvailable: activeCount > 0,
                isServiceEnabled: activeCount > 0,
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
        description: `This will disable ALL service mappings and zone overrides for ${selectedServiceDetail?.service?.serviceName} in ${districtObj?.name}. Customers across all zones in this district will no longer receive this service. This is not a reset — re-enable zones explicitly afterward.`,
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

    // Unified list of all configured backend operational districts + unconfigured Survey of India revenue districts
    const allMergedDistricts = useMemo(() => {
      // 1. All backend operational districts created in database (guaranteed display)
      const backendDistrictsList = (districts || []).map((d) => {
        const tn = findTnDistrictForRecord(d) || findTnDistrict(d.city) || findTnDistrict(d.name);
        const officialBoundary = (tn && getTnDistrictBoundary(tn.name)) || d.polygon || null;
        const isActive = (d.active !== false && d.isActive !== false && String(d.status || "").toUpperCase() !== "INACTIVE");
        return {
          ...d,
          _id: d._id,
          name: d.name || tn?.name || "Operational District",
          city: d.city || tn?.name || d.name || "",
          code: d.code || tn?.code || "TN",
          state: d.state || "Tamil Nadu",
          country: d.country || "India",
          active: isActive,
          isActive: isActive,
          isRegistrationEnabled: d.isRegistrationEnabled !== false,
          isJobEnabled: d.isJobEnabled !== false,
          isConfigured: true,
          polygon: d.polygon || officialBoundary,
          officialBoundary: d.polygon || officialBoundary,
          tnDistrict: tn,
          displayCode: d.code || tn?.code || tn?.dtcode,
          backendRecord: d,
        };
      });

      // Track which TN districts already exist in the backend list
      const configuredNames = new Set();
      backendDistrictsList.forEach((d) => {
        if (d.tnDistrict?.name) configuredNames.add(d.tnDistrict.name.toLowerCase());
        if (d.name) configuredNames.add(d.name.toLowerCase());
        if (d.city) configuredNames.add(d.city.toLowerCase());
        if (d.name) configuredNames.add(normalizeLocationName(d.name));
        if (d.city) configuredNames.add(normalizeLocationName(d.city));
      });

      // 2. Unconfigured districts from official Survey of India 38 revenue districts
      const unconfiguredList = TAMIL_NADU_DISTRICTS.filter((tnDist) => {
        const lower = tnDist.name.toLowerCase();
        const norm = normalizeLocationName(tnDist.name);
        return !configuredNames.has(lower) && !configuredNames.has(norm);
      }).map((tnDist) => {
        const officialBoundary = getTnDistrictBoundary(tnDist.name);
        return {
          _id: null,
          name: tnDist.name,
          city: tnDist.name,
          state: "Tamil Nadu",
          country: "India",
          code: tnDist.code,
          active: false,
          isActive: false,
          isRegistrationEnabled: false,
          isJobEnabled: false,
          isConfigured: false,
          polygon: officialBoundary,
          officialBoundary: officialBoundary,
          tnDistrict: tnDist,
          displayCode: tnDist.code || tnDist.dtcode,
          backendRecord: null,
        };
      });

      return [...backendDistrictsList, ...unconfiguredList];
    }, [districts]);

    // Only districts that have actually been created in the database
    const createdDistrictsList = useMemo(() => {
      return (districts || []).map((d) => {
        const tn = findTnDistrictForRecord(d) || findTnDistrict(d.city) || findTnDistrict(d.name);
        const officialBoundary = (tn && getTnDistrictBoundary(tn.name)) || d.polygon || null;
        const isActive = (d.active !== false && d.isActive !== false && String(d.status || "").toUpperCase() !== "INACTIVE");
        return {
          ...d,
          _id: d._id,
          name: d.name || tn?.name || "Operational District",
          city: d.city || tn?.name || d.name || "",
          code: d.code || tn?.code || "TN",
          state: d.state || "Tamil Nadu",
          country: d.country || "India",
          active: isActive,
          isActive: isActive,
          isRegistrationEnabled: d.isRegistrationEnabled !== false,
          isJobEnabled: d.isJobEnabled !== false,
          isConfigured: true,
          polygon: d.polygon || officialBoundary,
          officialBoundary: d.polygon || officialBoundary,
          tnDistrict: tn,
          displayCode: d.code || tn?.code || tn?.dtcode,
          backendRecord: d,
        };
      });
    }, [districts]);

    const activeDistrictsCount = useMemo(() => {
      return createdDistrictsList.filter((d) => d.active).length;
    }, [createdDistrictsList]);

    const inactiveDistrictsCount = useMemo(() => {
      return createdDistrictsList.filter((d) => !d.active).length;
    }, [createdDistrictsList]);

    // Memoized Filtering Logic - supports created operational districts & all 38 TN revenue districts
    const filteredDistricts = useMemo(() => {
      const search = searchTerm.toLowerCase();
      const sourceList = districtFilter === "all_tn" ? allMergedDistricts : createdDistrictsList;
      return sourceList.filter((d) => {
        const matchesSearch =
          (d.name || "").toLowerCase().includes(search) ||
          (d.city || "").toLowerCase().includes(search) ||
          (d.code || "").toLowerCase().includes(search) ||
          (d.displayCode || "").toLowerCase().includes(search);

        if (districtFilter === "active") return matchesSearch && d.active;
        if (districtFilter === "inactive") return matchesSearch && !d.active;
        return matchesSearch; // "all" returns created, "all_tn" returns all 38 Survey of India districts
      });
    }, [createdDistrictsList, allMergedDistricts, searchTerm, districtFilter]);

    const filteredZones = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return zones.filter((zone) => {
      const name = (zone.name || "").toLowerCase();
      const code = (zone.zoneCode || "").toLowerCase();
      const city = (zone.city || "").toLowerCase();
      const matchesSearch = name.includes(search) || code.includes(search) || city.includes(search);

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

        // District filter uses explicit permission cache only. Registration
        // primary district is display metadata and must not imply coverage.
        let matchesDistrict = true;
        const allowedDistIds = getTechPermissionDistricts(t).map((d) =>
          String(d?._id || d?.districtId || d?.id || d)
        );
        if (selectedDistrictFilter !== "all") {
          matchesDistrict = allowedDistIds.includes(String(selectedDistrictFilter));
        }

        // Permission type filter
        let matchesPermType = true;
        const permCount = allowedDistIds.length;
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

    const activeTabItemCount =
      activeTab === 0
        ? filteredDistricts.length
        : activeTab === 1
          ? filteredZones.length
          : activeTab === 2
            ? matrixData.length
            : activeTab === 3
              ? filteredTechnicians.length
              : 0;

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    };

    const handleClearFilters = () => {
      setSearchTerm("");
      setDistrictFilter("active");
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

    const handleFilterDistricts = (filterType) => {
      setDistrictFilter(filterType);
      setCurrentPage(1);
    };

    const applyHubCity = (city) => {
      if (!city) return;
      const polygon =
        getTnDistrictBoundary(city.district || city.name) ||
        generateCircularGeoJSON(city.lat, city.lng, 10);
      setDistrictModalError("");
      setDistrictFormData((prev) => ({
        ...prev,
        city: city.name,
        code: prev.code || city.code,
        polygonCoordinates: JSON.stringify(polygon, null, 2),
      }));
    };

    const geocodeHub = async (value) => {
      const query = String(value || "").trim();
      if (!query) return;
      const localCity =
        findTnCity(query, districtTnName) || findTnCity(query);
      if (localCity) {
        applyHubCity(localCity);
        return;
      }

      setIsLocatingHub(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=${encodeURIComponent(
            `${query}, Tamil Nadu, India`
          )}`
        );
        const data = await response.json();
        const result = Array.isArray(data) ? data[0] : null;
        if (!result) {
          toast({
            title: "Location not found",
            description: `Could not locate "${query}" in Tamil Nadu.`,
            status: "warning",
            duration: 3500,
            isClosable: true,
          });
          return;
        }
        const lat = Number(result.lat);
        const lng = Number(result.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const polygon = generateCircularGeoJSON(lat, lng, 10);
        setDistrictModalError("");
        setDistrictFormData((prev) => ({
          ...prev,
          city: query,
          polygonCoordinates: JSON.stringify(polygon, null, 2),
        }));
      } catch (error) {
        toast({
          title: "Location lookup failed",
          description: "OpenStreetMap could not be reached. Try a preset city.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLocatingHub(false);
      }
    };

    const handlePickTnDistrict = (districtName) => {
      if (!districtName) {
        setDistrictTnName("");
        setModalBoundaryCheckResult(null);
        setDistrictFormData((prev) => ({
          ...prev,
          name: "",
          city: "",
          code: "",
          polygonCoordinates: "",
        }));
        return;
      }
      const tnDistrict = findTnDistrict(districtName);
      if (!tnDistrict) return;
      const polygon =
        getTnDistrictBoundary(tnDistrict.name) ||
        generateCircularGeoJSON(tnDistrict.lat, tnDistrict.lng, 10);
      const isSameDistrict =
        isEditingDistrict && districtTnName === tnDistrict.name;
      const otherDistricts =
        isEditingDistrict && selectedDistrict
          ? (districts || []).filter(
              (district) =>
                String(district._id) !== String(selectedDistrict._id)
            )
          : districts;
      setDistrictModalError("");
      setDistrictTnName(tnDistrict.name);
      const pointsCount = polygon?.coordinates?.[0]?.length || 0;
      setModalBoundaryCheckResult({
        isValid: true,
        message: `Official Survey of India GeoCode Boundary loaded for ${tnDistrict.name} (${pointsCount} polygon vertices).`,
      });
      setDistrictFormData((prev) => ({
        ...prev,
        name: isSameDistrict
          ? prev.name
          : getAvailableDistrictName(tnDistrict.name, otherDistricts),
        city: tnDistrict.name,
        state: "Tamil Nadu",
        country: "India",
        code: tnDistrict.code,
        polygonCoordinates: JSON.stringify(polygon, null, 2),
      }));
    };

    // District Handlers
    const handleOpenCreateDistrictModal = (initialTnName = "") => {
      setIsEditingDistrict(false);
      setSelectedDistrict(null);
      setDistrictModalError("");
      setIsLocatingHub(false);

      if (initialTnName) {
        const tnDistrict = findTnDistrict(initialTnName);
        if (tnDistrict) {
          setDistrictTnName(tnDistrict.name);
          const polygon =
            getTnDistrictBoundary(tnDistrict.name) ||
            generateCircularGeoJSON(tnDistrict.lat, tnDistrict.lng, 10);
          const polygonStr = JSON.stringify(polygon, null, 2);
          setDistrictFormData({
            ...initialDistrictForm,
            name: getAvailableDistrictName(tnDistrict.name, districts),
            city: tnDistrict.name,
            state: "Tamil Nadu",
            country: "India",
            code: tnDistrict.code || tnDistrict.name.slice(0, 3).toUpperCase(),
            active: true,
            isRegistrationEnabled: true,
            isJobEnabled: true,
            polygonCoordinates: polygonStr,
          });
          districtFormSnapshot.current = polygonStr;
          setIsDistrictModalOpen(true);
          return;
        }
      }

      // Default when opening modal without pre-selected district:
      // Clean empty state — user can pick from dropdown or click any district on the TN map
      setDistrictTnName("");
      setDistrictFormData({
        ...initialDistrictForm,
        name: "",
        city: "",
        state: "Tamil Nadu",
        country: "India",
        code: "",
        active: true,
        isRegistrationEnabled: true,
        isJobEnabled: true,
        polygonCoordinates: "",
      });
      districtFormSnapshot.current = "";
      setIsDistrictModalOpen(true);
    };

    const handleOpenCreateDistrict = () => {
      handleOpenCreateDistrictModal();
    };


    const handleOpenEditDistrict = (dist) => {
      setIsEditingDistrict(true);
      setSelectedDistrict(dist);
      setDistrictModalError("");
      setIsLocatingHub(false);
      const matchedTnDistrict = findTnDistrictForRecord(dist);
      setDistrictTnName(matchedTnDistrict?.name || "");
      let polyStr = "";
      if (dist.polygon && typeof dist.polygon === "object") {
        polyStr = JSON.stringify(dist.polygon, null, 2);
      }
      setDistrictFormData({
        name: dist.name || "",
        city: dist.city || "",
        state: dist.state || "Tamil Nadu",
        country: dist.country || "India",
        code: dist.code || "",
        active: dist.active !== false && dist.isActive !== false,
        isRegistrationEnabled: dist.isRegistrationEnabled !== false,
        isJobEnabled: dist.isJobEnabled !== false,
        polygonCoordinates: polyStr,
      });
      districtFormSnapshot.current = polyStr;
      setIsDistrictModalOpen(true);
    };

    const handleMiniMapSelectDistrict = (tnName) => {
      if (!tnName) return;
      if (
        districtModalDirty &&
        !confirmIfDirty(
          true,
          "You have unsaved district boundary changes. Switch districts without saving?"
        )
      ) {
        return;
      }
      const record = findConfiguredDistrictForTnName(tnName, districts);
      if (record) {
        handleOpenEditDistrict(record);
        return;
      }

      const tnDistrict = findTnDistrict(tnName);
      if (!tnDistrict) return;
      const polygon =
        getTnDistrictBoundary(tnDistrict.name) ||
        generateCircularGeoJSON(tnDistrict.lat, tnDistrict.lng, 10);
      const polygonStr = JSON.stringify(polygon, null, 2);

      setIsEditingDistrict(false);
      setSelectedDistrict(null);
      setDistrictModalError("");
      setIsLocatingHub(false);
      setDistrictTnName(tnDistrict.name);
      setDistrictFormData({
        ...initialDistrictForm,
        name: getAvailableDistrictName(tnDistrict.name, districts),
        city: tnDistrict.name,
        state: "Tamil Nadu",
        country: "India",
        code: tnDistrict.code,
        polygonCoordinates: polygonStr,
      });
      districtFormSnapshot.current = polygonStr;
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

      // If polygon is missing, auto-fallback to official district boundary or circle
      if (!polygon) {
        const tn = findTnDistrict(districtTnName || districtFormData.city || districtFormData.name);
        const autoBoundary = tn
          ? (getTnDistrictBoundary(tn.name) || generateCircularGeoJSON(tn.lat, tn.lng, 10))
          : null;
        if (autoBoundary) {
          polygon = autoBoundary;
        } else {
          const msg = "District boundary GeoJSON polygon is required. Please select a Tamil Nadu district to auto-load its boundary.";
          setDistrictModalError(msg);
          return toast({ title: "Validation Error", description: msg, status: "error", duration: 3000, isClosable: true });
        }
      }

      try {
        setIsSubmitting(true);
        const payload = {
          name: districtFormData.name.trim(),
          city: districtFormData.city.trim(),
          state: districtFormData.state.trim() || "Tamil Nadu",
          country: districtFormData.country.trim() || "India",
          code: districtFormData.code.trim().toUpperCase() || districtFormData.name.slice(0, 3).toUpperCase(),
          active: districtFormData.active !== false,
          isActive: districtFormData.active !== false,
          status: districtFormData.active !== false ? "ACTIVE" : "INACTIVE",
          isRegistrationEnabled: districtFormData.isRegistrationEnabled !== false,
          isJobEnabled: districtFormData.isJobEnabled !== false,
          polygon,
        };

        let res;
        if (isEditingDistrict && selectedDistrict) {
          res = await updateDistrict(selectedDistrict._id, payload);
        } else {
          res = await createDistrict(payload);
        }

        if (res && res.error) {
          throw new Error(res.error);
        }
        if (res && res.success === false && res.message) {
          throw new Error(res.message);
        }

        toast({
          title: isEditingDistrict ? "District Updated" : "District Created",
          description: `"${payload.name}" ${isEditingDistrict ? "updated" : "created"} successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        await fetchData();
        districtFormSnapshot.current = "";
        setIsDistrictModalOpen(false);
        resumeOpsFromContext("district");
      } catch (err) {
        const errMsg = err.message || "Failed to save district.";
        setDistrictModalError(errMsg);
        toast({ title: "Error", description: errMsg, status: "error", duration: 4000, isClosable: true });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleToggleDistrictActive = async (dist) => {
      const targetDistId = dist._id || dist.backendRecord?._id;
      const isCurrentlyActive = (dist.active !== false && dist.isActive !== false);
      const nextActive = !isCurrentlyActive;

      // 1. Instant optimistic update if already in state
      if (targetDistId) {
        setDistricts((prev) =>
          prev.map((d) => (String(d._id) === String(targetDistId) ? { ...d, active: nextActive, isActive: nextActive } : d))
        );
      }

      try {
        if (targetDistId && isCurrentlyActive) {
          // User requested: disable means created district is deleted from backend database
          setDistricts((prev) => prev.filter((d) => String(d._id) !== String(targetDistId)));
          toast({
            title: "District Disabled & Removed",
            description: `"${dist.name}" disabled and removed from operational records.`,
            status: "info",
            duration: 1500,
            isClosable: true,
          });
          await deleteDistrict(targetDistId);
        } else if (targetDistId && !isCurrentlyActive) {
          await toggleDistrictStatus(targetDistId, true);
          toast({
            title: "District Activated",
            description: `"${dist.name}" operational status set to active.`,
            status: "success",
            duration: 1500,
            isClosable: true,
          });
        } else {
          // District not yet configured in backend database: Auto-create with exact Survey of India boundary GeoJSON
          setIsSubmitting(true);
          const officialBoundary = dist.officialBoundary || dist.polygon || getTnDistrictBoundary(dist.name);
          const payload = {
            name: dist.name,
            city: dist.city || dist.name,
            state: "Tamil Nadu",
            country: "India",
            code: dist.code || dist.tnDistrict?.code || dist.name.slice(0, 3).toUpperCase(),
            active: true,
            isRegistrationEnabled: true,
            isJobEnabled: true,
            polygon: officialBoundary,
          };
          await createDistrict(payload);
          toast({
            title: "District Enabled",
            description: `"${dist.name}" created and enabled as an operational district.`,
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          await fetchData();
        }
      } catch (err) {
        // Revert on error
        await fetchData();
        toast({
          title: "Error",
          description: err.message || "Failed to update district status.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleToggleDistrictRegistrationFlag = async (dist) => {
      const targetDistId = dist._id || dist.backendRecord?._id;
      const newFlag = !dist.isRegistrationEnabled;

      if (targetDistId) {
        // 1. Instant optimistic update
        setDistricts((prev) =>
          prev.map((d) => (String(d._id) === String(targetDistId) ? { ...d, isRegistrationEnabled: newFlag } : d))
        );
        toast({
          title: "Registration Updated",
          description: `Technician Registration ${newFlag ? "Enabled" : "Disabled"} for ${dist.name}`,
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        try {
          await toggleDistrictRegistration(targetDistId, newFlag);
        } catch (err) {
          // Revert on error
          setDistricts((prev) =>
            prev.map((d) => (String(d._id) === String(targetDistId) ? { ...d, isRegistrationEnabled: !newFlag } : d))
          );
          toast({
            title: "Error",
            description: err.message || "Failed to toggle registration flag.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Auto-create with registration flag enabled
        try {
          setIsSubmitting(true);
          const officialBoundary = dist.officialBoundary || dist.polygon || getTnDistrictBoundary(dist.name);
          await createDistrict({
            name: dist.name,
            city: dist.city || dist.name,
            state: "Tamil Nadu",
            country: "India",
            code: dist.code || dist.tnDistrict?.code || dist.name.slice(0, 3).toUpperCase(),
            active: true,
            isRegistrationEnabled: true,
            isJobEnabled: true,
            polygon: officialBoundary,
          });
          toast({
            title: "District Created & Registration Enabled",
            description: `"${dist.name}" activated with Survey of India GeoCode boundary.`,
            status: "success",
            duration: 2500,
            isClosable: true,
          });
          await fetchData();
        } catch (err) {
          toast({
            title: "Error",
            description: err.message || "Failed to toggle registration flag.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    const handleToggleDistrictJobFlag = async (dist) => {
      const targetDistId = dist._id || dist.backendRecord?._id;
      const newFlag = !dist.isJobEnabled;

      if (targetDistId) {
        // 1. Instant optimistic update
        setDistricts((prev) =>
          prev.map((d) => (String(d._id) === String(targetDistId) ? { ...d, isJobEnabled: newFlag } : d))
        );
        toast({
          title: "Job Assignment Updated",
          description: `Job Assignment ${newFlag ? "Enabled" : "Disabled"} for ${dist.name}`,
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        try {
          await toggleDistrictJobs(targetDistId, newFlag);
        } catch (err) {
          // Revert on error
          setDistricts((prev) =>
            prev.map((d) => (String(d._id) === String(targetDistId) ? { ...d, isJobEnabled: !newFlag } : d))
          );
          toast({
            title: "Error",
            description: err.message || "Failed to toggle job flag.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Auto-create with job dispatch enabled
        try {
          setIsSubmitting(true);
          const officialBoundary = dist.officialBoundary || dist.polygon || getTnDistrictBoundary(dist.name);
          await createDistrict({
            name: dist.name,
            city: dist.city || dist.name,
            state: "Tamil Nadu",
            country: "India",
            code: dist.code || dist.tnDistrict?.code || dist.name.slice(0, 3).toUpperCase(),
            active: true,
            isRegistrationEnabled: true,
            isJobEnabled: true,
            polygon: officialBoundary,
          });
          toast({
            title: "District Created & Job Dispatch Enabled",
            description: `"${dist.name}" activated with Survey of India GeoCode boundary.`,
            status: "success",
            duration: 2500,
            isClosable: true,
          });
          await fetchData();
        } catch (err) {
          toast({
            title: "Error",
            description: err.message || "Failed to toggle job flag.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    const handleBulkToggleAllDistricts = async (targetActive = true) => {
      try {
        setIsLoading(true);
        let updatedCount = 0;
        let createdCount = 0;
        for (const dist of allMergedDistricts) {
          const targetDistId = dist._id || dist.backendRecord?._id;
          if (targetDistId) {
            if (dist.active !== targetActive) {
              await toggleDistrictStatus(targetDistId, targetActive);
              updatedCount++;
            }
          } else if (targetActive) {
            const officialBoundary = dist.officialBoundary || dist.polygon || getTnDistrictBoundary(dist.name);
            await createDistrict({
              name: dist.name,
              city: dist.city || dist.name,
              state: "Tamil Nadu",
              country: "India",
              code: dist.code || dist.tnDistrict?.code || dist.name.slice(0, 3).toUpperCase(),
              active: true,
              isRegistrationEnabled: true,
              isJobEnabled: true,
              polygon: officialBoundary,
            });
            createdCount++;
          }
        }
        toast({
          title: "All 38 Districts Ready",
          description: createdCount > 0
            ? `Successfully added ${createdCount} Tamil Nadu revenue districts (${updatedCount} updated) with official Survey of India boundary geocodes.`
            : `All ${updatedCount} operational districts are now ${targetActive ? "ACTIVE" : "INACTIVE"}.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        await fetchData();
      } catch (err) {
        toast({
          title: "District Operation Error",
          description: err.message || "Failed bulk district update.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
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
      const primaryRef =
        techPermissions?.primaryDistrict ||
        selectedTechForPermission?.primaryDistrictId ||
        selectedTechForPermission?.primaryCityId ||
        null;
      const primaryRefId =
        typeof primaryRef === "string" ? primaryRef : primaryRef?._id || primaryRef?.id || null;
      if (primaryRefId) {
        const match = districts.find((d) => String(d._id) === String(primaryRefId));
        if (match) return match;
        if (typeof primaryRef === "object") return primaryRef;
      }
      const cityName =
        selectedTechForPermission?.city ||
        selectedTechForPermission?.primaryDistrictId?.name ||
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
        const primary = rawRes?.primaryDistrict || tech?.primaryDistrictId || tech?.primaryCityId || null;
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
      const primary = rawRes?.primaryDistrict || selectedTechForPermission?.primaryDistrictId || selectedTechForPermission?.primaryCityId || null;
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

    const handleGrantDistrictPermission = async (districtIdOverride) => {
      const districtId = typeof districtIdOverride === "string" ? districtIdOverride : selectedDistrictToGrant;
      if (!districtId || !selectedTechForPermission) return;

      const currentAdditional = techPermissions?.permissions || techPermissions?.additionalPermissions || [];
      const existingPermDistIds = currentAdditional.map((p) =>
        String(p.districtId?._id || p.districtId?.id || p.districtId || "")
      );

      const targetDist = districts.find((d) => String(d._id) === String(districtId));

      if (existingPermDistIds.includes(String(districtId))) {
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
        await addTechnicianDistrictPermission(selectedTechForPermission._id, districtId);
        toast({
          title: "Permission Granted",
          description: `District access granted for "${targetDist?.name || 'district'}".`,
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
          err.message?.includes("already exists")
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
      const nextStatus = !currentStatus;
      const targetIdStr = String(districtId);

      // Instant optimistic UI update (0ms switch response)
      setTechPermissions((prev) => {
        if (!prev) return prev;
        const currentPerms = prev.permissions || prev.additionalPermissions || [];
        const updatedPerms = currentPerms.map((p) => {
          const pId = String(p.districtId?._id || p.districtId?.id || p.districtId || "");
          if (pId === targetIdStr) {
            return { ...p, isEnabled: nextStatus };
          }
          return p;
        });

        let updatedPrimaryPerm = prev.primaryPermission;
        if (updatedPrimaryPerm) {
          const primPId = String(updatedPrimaryPerm.districtId?._id || updatedPrimaryPerm.districtId?.id || updatedPrimaryPerm.districtId || "");
          if (primPId === targetIdStr) {
            updatedPrimaryPerm = { ...updatedPrimaryPerm, isEnabled: nextStatus };
          }
        }

        return {
          ...prev,
          permissions: updatedPerms,
          additionalPermissions: updatedPerms,
          primaryPermission: updatedPrimaryPerm,
        };
      });

      toast({
        title: "Permission Updated",
        description: `Permission ${nextStatus ? "Enabled" : "Disabled"}.`,
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      try {
        await toggleTechnicianDistrictPermission(selectedTechForPermission._id, districtId, nextStatus);
      } catch (err) {
        // Rollback on network error
        await refreshPermissions(selectedTechForPermission._id);
        toast({
          title: "Error",
          description: err.message || "Failed to update permission.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const handleRemovePermission = async (districtId) => {
      if (!selectedTechForPermission) return;
      const targetIdStr = String(districtId);

      // Instant optimistic UI update
      setTechPermissions((prev) => {
        if (!prev) return prev;
        const currentPerms = prev.permissions || prev.additionalPermissions || [];
        const filtered = currentPerms.filter((p) => {
          const pId = String(p.districtId?._id || p.districtId?.id || p.districtId || "");
          return pId !== targetIdStr;
        });
        let updatedPrim = prev.primaryPermission;
        if (updatedPrim) {
          const primPId = String(updatedPrim.districtId?._id || updatedPrim.districtId?.id || updatedPrim.districtId || "");
          if (primPId === targetIdStr) updatedPrim = null;
        }
        return {
          ...prev,
          permissions: filtered,
          additionalPermissions: filtered,
          primaryPermission: updatedPrim,
        };
      });

      toast({
        title: "Permission Revoked",
        description: "District permission removed.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      try {
        await removeTechnicianDistrictPermission(selectedTechForPermission._id, districtId);
        // Refresh silently in background
        refreshPermissions(selectedTechForPermission._id);
      } catch (err) {
        await refreshPermissions(selectedTechForPermission._id);
        toast({
          title: "Error",
          description: err.message || "Failed to remove permission.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
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

    const applyZoneCity = (city) => {
      if (!city) return;
      setZoneModalError("");
      const targetTnDistrict =
        findTnDistrict(city.district) || getDistrictForCity(city.name);
      const matchingDistrict = targetTnDistrict
        ? (districts || []).find(
            (district) =>
              findTnDistrictForRecord(district)?.name === targetTnDistrict.name
          )
        : null;
      if (matchingDistrict) {
        setZoneCityFilterMode("district");
      } else if (targetTnDistrict) {
        toast({
          title: "District not configured",
          description: `${targetTnDistrict.name} is not an operational district yet. Add that district before creating this zone.`,
          status: "warning",
          duration: 4500,
          isClosable: true,
        });
      }
      setFormData((prev) => ({
        ...prev,
        operationalCityId: matchingDistrict?._id || "",
        city: city.name,
        name: city.name,
        zoneCode: city.code || prev.zoneCode,
        polygonCoordinates: JSON.stringify(
          generateCircularGeoJSON(city.lat, city.lng, 5),
          null,
          2
        ),
      }));
    };

    const locateZoneCity = async (value) => {
      const query = String(value || "").trim();
      if (!query) return;
      const localCity = findTnCity(query, zoneParentTnDistrict?.name) || findTnCity(query);
      if (localCity) {
        applyZoneCity(localCity);
        return;
      }

      setIsLocatingZoneCity(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=${encodeURIComponent(
            `${query}, Tamil Nadu, India`
          )}`
        );
        const data = await response.json();
        const result = Array.isArray(data) ? data[0] : null;
        if (!result) {
          toast({
            title: "Location not found",
            description: `Could not locate "${query}" in Tamil Nadu.`,
            status: "warning",
            duration: 3500,
            isClosable: true,
          });
          return;
        }
        const lat = Number(result.lat);
        const lng = Number(result.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setZoneModalError("");
        setFormData((prev) => ({
          ...prev,
          city: query,
          name: prev.name || query,
          polygonCoordinates: JSON.stringify(
            generateCircularGeoJSON(lat, lng, 5),
            null,
            2
          ),
        }));
      } catch (error) {
        toast({
          title: "Location lookup failed",
          description: "OpenStreetMap could not be reached. Try a preset city.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLocatingZoneCity(false);
      }
    };

    // Zone Handlers
    const handleOpenCreateZone = (presetDistrictId) => {
      setIsEditing(false);
      setSelectedZone(null);
      setZoneModalError("");
      const presetId =
        typeof presetDistrictId === "string" ? presetDistrictId : "";

      // Prioritize Tiruppur if created, or active filter
      const tiruppurDist = createdDistrictsList.find((d) =>
        (d.name || d.city || "").toLowerCase().includes("tirup")
      );

      const districtId =
        presetId ||
        (selectedDistrictFilter !== "all" ? selectedDistrictFilter : "") ||
        (tiruppurDist ? String(tiruppurDist._id) : "") ||
        (createdDistrictsList && createdDistrictsList.length > 0 ? String(createdDistrictsList[0]._id) : "") ||
        (districts && districts.length > 0 ? String(districts[0]._id) : "") ||
        "";

      let defaultTown = null;
      let parentCity = "";
      let parentTnName = "";
      if (districtId) {
        const parent =
          createdDistrictsList.find((d) => String(d._id) === String(districtId)) ||
          districts.find((d) => String(d._id) === String(districtId));
        const parentTnDistrict =
          findTnDistrictForRecord(parent) ||
          findTnDistrict(parent?.name) ||
          findTnDistrict(parent?.city);
        parentCity = parent?.city || parent?.name || "";
        parentTnName = parentTnDistrict?.name || parentCity;
        const districtTowns = parent
          ? getDistrictCities(parentTnDistrict?.name || parentCity)
          : [];
        defaultTown =
          districtTowns[0] ||
          findTnCity(parentCity, parentTnDistrict?.name) ||
          (parentCity ? findTnCity(parentCity) : null);
      }

      setSelectedTnDistrictName(parentTnName || "");
      setFormData({
        ...initialForm,
        operationalCityId: districtId,
        city: defaultTown ? defaultTown.name : parentCity,
        name: "", // clean so user can choose area or type
        zoneCode: defaultTown?.code || "",
        polygonCoordinates: "", // Starts clean — click on map or area button creates the circle zone!
      });
      zoneFormSnapshot.current = "";
      setZoneCityFilterMode("district");
      setIsModalOpen(true);
    };

    const makeClippedCircleGeoJson = (lat, lng, radiusKm, targetDistrictName) => {
      const circlePoly = generateCircularGeoJSON(lat, lng, radiusKm || 5);
      const boundary = getTnDistrictBoundary(targetDistrictName);
      if (!boundary || !boundary.coordinates) {
        return JSON.stringify(circlePoly);
      }
      const districtCoords =
        boundary.type === "MultiPolygon" ? boundary.coordinates : [boundary.coordinates];
      try {
        const intersection = polygonClipping.intersection(districtCoords, [circlePoly.coordinates]);
        if (intersection && intersection.length > 0) {
          const clippedGeom =
            intersection.length === 1
              ? { type: "Polygon", coordinates: intersection[0] }
              : { type: "MultiPolygon", coordinates: intersection };
          return JSON.stringify(clippedGeom);
        }
      } catch (err) {
        console.warn("Clipping failed, fallback to circle:", err);
      }
      return JSON.stringify(circlePoly);
    };

    const handleSelectSubzonePreset = (sz) => {
      setZoneModalError("");
      const distName =
        selectedTnDistrictName ||
        zoneParentTnDistrict?.name ||
        zoneParentDistrict?.name ||
        "Tiruppur";
      const clippedGeoJson = makeClippedCircleGeoJson(sz.lat, sz.lng, sz.radius_km || 5, distName);

      setFormData((prev) => ({
        ...prev,
        name: sz.name,
        city: sz.district || distName,
        zoneCode: sz.id || sz.admin_code || sz.name.slice(0, 3).toUpperCase(),
        polygonCoordinates: clippedGeoJson,
      }));

      toast({
        title: `Loaded ${sz.name}`,
        description: `Positioned circle zone at ${sz.name} (${sz.radius_km || 5} km) clipped to ${distName} border.`,
        status: "info",
        duration: 2500,
      });
    };

    const handleOpenEditZone = (zone) => {
      setIsEditing(true);
      setSelectedZone(zone);
      setZoneModalError("");

      const distId = resolveZoneDistrictId(zone);
      const parent = districts.find((d) => String(d._id) === String(distId));
      const parentTn = findTnDistrictForRecord(parent);
      setSelectedTnDistrictName(parentTn?.name || parent?.name || zone.city || "");

      setFormData({
        operationalCityId: distId,
        city: zone.city || parent?.city || "",
        name: zone.name || "",
        zoneCode: zone.zoneCode || zone.code || "",
        description: zone.description || "",
        active: zone.active !== false,
        polygonCoordinates: stringifyZonePolygon(zone),
      });
      zoneFormSnapshot.current = stringifyZonePolygon(zone);
      setZoneCityFilterMode("district");
      setIsModalOpen(true);
    };

    const handleSelectDistrictFromMap = async (distObjOrName) => {
      const distName =
        typeof distObjOrName === "string"
          ? distObjOrName
          : distObjOrName?.name || distObjOrName?.city || "";
      if (!distName) return;

      const tnDist = findTnDistrict(distName);
      const canonicalName = tnDist?.name || distName;
      setSelectedTnDistrictName(canonicalName);
      setZoneCityFilterMode("district");

      // Match with backend operational district
      let matchedBackend = districts.find((d) => {
        const dTn = findTnDistrictForRecord(d);
        return (
          dTn?.name?.toLowerCase() === canonicalName.toLowerCase() ||
          d.name?.toLowerCase() === canonicalName.toLowerCase() ||
          d.city?.toLowerCase() === canonicalName.toLowerCase()
        );
      });

      const officialBoundary =
        (matchedBackend?.polygon?.coordinates ? matchedBackend.polygon : null) ||
        getTnDistrictBoundary(canonicalName) ||
        distObjOrName?.polygon ||
        distObjOrName?.geometry;

      // If matched district is inactive, auto-enable/activate it so zones can be added under it
      if (matchedBackend && (matchedBackend.active === false || matchedBackend.isActive === false)) {
        try {
          await toggleDistrictStatus(matchedBackend._id, true);
          matchedBackend = { ...matchedBackend, active: true, isActive: true };
          setDistricts((prev) =>
            prev.map((d) => (d._id === matchedBackend._id ? { ...d, active: true, isActive: true } : d))
          );
          toast({
            title: `District Enabled: ${canonicalName}`,
            description: `Activated operational district "${canonicalName}". Ready to add micro-zones.`,
            status: "success",
            duration: 3000,
          });
        } catch (err) {
          console.warn("Could not activate existing district:", err);
        }
      } else if (!matchedBackend) {
        // District not yet configured in backend database: Auto-create & enable with exact Survey of India boundary!
        try {
          const payload = {
            name: canonicalName,
            city: canonicalName,
            state: "Tamil Nadu",
            country: "India",
            code: distObjOrName?.code || tnDist?.code || canonicalName.slice(0, 3).toUpperCase(),
            active: true,
            isRegistrationEnabled: true,
            isJobEnabled: true,
            polygon: officialBoundary,
          };
          const createdRes = await createDistrict(payload);
          const createdDist =
            createdRes?.data || createdRes?.district || createdRes?.result || createdRes;
          const newId =
            createdDist?._id || (typeof createdRes === "object" ? createdRes._id : null);
          if (newId) {
            matchedBackend = { ...payload, _id: newId };
            setDistricts((prev) => [
              ...prev.filter((d) => d.name?.toLowerCase() !== canonicalName.toLowerCase()),
              matchedBackend,
            ]);
            toast({
              title: `District Enabled & Configured: ${canonicalName}`,
              description: `Created and enabled operational district "${canonicalName}" with official Survey of India boundary.`,
              status: "success",
              duration: 3500,
            });
          }
        } catch (err) {
          console.warn("Could not auto-create district on map selection:", err);
        }
      }

      const districtTowns = getDistrictCities(canonicalName);
      const defaultTown = districtTowns[0] || findTnCity(canonicalName) || null;

      setFormData((prev) => ({
        ...prev,
        operationalCityId: matchedBackend ? matchedBackend._id : "",
        city: defaultTown ? defaultTown.name : canonicalName,
        name: defaultTown ? `${defaultTown.name} Zone` : `${canonicalName} Zone`,
        zoneCode: defaultTown?.code || tnDist?.code || prev.zoneCode || "",
        polygonCoordinates:
          prev.operationalCityId && matchedBackend && String(prev.operationalCityId) === String(matchedBackend._id)
            ? prev.polygonCoordinates || ""
            : "", // Clean on district switch, preserve if clicking within active district
      }));

      zoneFormSnapshot.current = "";

      if (matchedBackend) {
        toast({
          title: `Selected District: ${canonicalName}`,
          description: `Linked to enabled operational district "${canonicalName}". Loaded official Survey of India boundary.`,
          status: "info",
          duration: 3000,
        });
      }
    };

    const handleSelectCityFromMap = (cityObj) => {
      if (!cityObj?.name) return;
      const townName = cityObj.name;
      setFormData((prev) => ({
        ...prev,
        city: townName,
        name: prev.name && prev.name.includes("Zone") ? `${townName} Zone` : townName,
        zoneCode: cityObj.code || prev.zoneCode,
      }));
    };


    const handleSubmitZone = async (options = {}) => {
      const keepOpen = Boolean(options && options.keepOpen);
      setZoneModalError("");

      const name = String(formData.name || "").trim();
      const city = String(formData.city || "").trim();
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
        const ring = Array.isArray(polygon?.coordinates?.[0]) ? polygon.coordinates[0] : [];
        const centroid = ring.length ? calculatePolygonCentroid(ring.slice(0, -1)) : null;
        const centerLat = centroid && Number.isFinite(centroid[0]) ? centroid[0] : null;
        const centerLng = centroid && Number.isFinite(centroid[1]) ? centroid[1] : null;

        const payload = {
          operationalCityId,
          districtId: operationalCityId,
          city: city || name,
          name,
          zoneCode,
          description,
          active: formData.active !== false,
          polygon,
          coordinates: polygon?.coordinates || [],
          geojson: polygon,
          geocode: {
            type: "Point",
            coordinates: centerLng && centerLat ? [centerLng, centerLat] : [],
            latitude: centerLat,
            longitude: centerLng,
            lat: centerLat,
            lng: centerLng,
          },
          lat: centerLat,
          lng: centerLng,
          latitude: centerLat,
          longitude: centerLng,
          center: centerLat && centerLng ? [centerLat, centerLng] : undefined,
          location: {
            type: "Point",
            coordinates: centerLng && centerLat ? [centerLng, centerLat] : [],
          },
          geometry: polygon,
          officialBoundary: polygon,
        };

        let res;
        if (isEditing && selectedZone) {
          const zid = resolveZoneId(selectedZone);
          if (!zid) throw new Error("Cannot update: zone id is missing. Please refresh and retry.");
          res = await updateZone(zid, payload);
          if (res && res.error) throw new Error(res.error);
          if (res && res.success === false && res.message) throw new Error(res.message);
          toast({ title: "Zone Updated", description: `"${name}" updated successfully.`, status: "success", duration: 3000, isClosable: true });
        } else {
          res = await createZone(payload);
          if (res && res.error) throw new Error(res.error);
          if (res && res.success === false && res.message) throw new Error(res.message);
          const seededCount = res?.result?.seededEnabledServices ?? res?.seededEnabledServices;
          toast({
            title: "Zone Created",
            description: Number.isFinite(seededCount)
              ? `"${name}" created with ${seededCount} active service${seededCount === 1 ? "" : "s"} enabled by default.`
              : `"${name}" created successfully. All active services are enabled by default.`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        }

        await fetchData();
        zoneFormSnapshot.current = "";
        if (keepOpen) {
          setFormData((prev) => ({
            ...initialForm,
            operationalCityId: prev.operationalCityId,
            city: prev.city,
            polygonCoordinates: "",
            name: "",
            zoneCode: "",
          }));
          toast({
            title: `Zone "${name}" Saved Successfully!`,
            description: "Ready to create the next zone. Pick an area or click the map to add another.",
            status: "success",
            duration: 3500,
            isClosable: true,
          });
        } else {
          setIsModalOpen(false);
          setFormData({ ...initialForm });
          setSelectedZone(null);
          resumeOpsFromContext("zone");
        }
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
      const zoneIdStr = String(zone._id || zone.id);
      const nextStatus = nextActive ? "ENABLED" : "DISABLED";

      // 1. Instant optimistic update on mappings (0ms response)
      setMappings((prevMappings) => {
        const next = [...(prevMappings || [])];
        // Update existing mappings for this zone
        let matched = false;
        const updated = next.map((m) => {
          const mZoneId = String(m.zoneId?._id || m.zoneId?.id || m.zoneId || m.cityZoneId?._id || m.cityZoneId?.id || m.cityZoneId || "");
          if (mZoneId === zoneIdStr) {
            matched = true;
            return { ...m, active: nextActive, enabled: nextActive, status: nextStatus };
          }
          return m;
        });

        // If no mappings existed yet for this zone, create optimistic entries for all services
        if (!matched && Array.isArray(services)) {
          services.forEach((s) => {
            updated.push({
              serviceId: s._id || s.id,
              zoneId: zone._id,
              cityZoneId: zone._id,
              active: nextActive,
              enabled: nextActive,
              status: nextStatus,
            });
          });
        }
        return updated;
      });

      // 2. Optimistically update counts in matrixData if available
      setMatrixData((prev) =>
        (prev || []).map((m) => {
          const currentActive = m.activeZonesCount || 0;
          const currentInactive = m.inactiveZonesCount || 0;
          return {
            ...m,
            activeZonesCount: nextActive ? currentActive + 1 : Math.max(0, currentActive - 1),
            inactiveZonesCount: nextActive ? Math.max(0, currentInactive - 1) : currentInactive + 1,
          };
        })
      );

      toast({
        title: `Zone Services ${nextActive ? "Enabled" : "Disabled"}`,
        description: `All services in "${zone.name}" are now ${nextActive ? "ACTIVE" : "INACTIVE"}.`,
        status: nextActive ? "success" : "info",
        duration: 2000,
        isClosable: true,
      });

      try {
        await toggleZoneServices(zone._id, nextActive);
      } catch (err) {
        // Rollback on network failure
        await fetchData();
        await fetchMatrixData();
        toast({
          title: "Toggle Error",
          description: err.message || "Failed to toggle zone services.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
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

    // F-01A: impact analysis uses the exact backend contract
    // ({ type: "district", id }) and surfaces failures explicitly instead of
    // rendering synthetic zero-impact data. Empty impact (backend 200 with
    // zero counts) stays visually distinct from error states.
    const handleFetchDistrictDashboard = async (distId) => {
      if (!distId) return;
      try {
        setIsLoadingDistrictDashboard(true);
        setSelectedDashboardDistrictId(distId);
        setDistrictDashboardError(null);
        setImpactAnalysisError(null);
        const [dashRes, impactRes] = await Promise.all([
          getDistrictDashboardDetails(distId).catch((err) => ({ __error: err.message })),
          getZoneImpactAnalysis({ type: "district", id: distId }).catch((err) => ({ __error: err.message })),
        ]);
        if (dashRes?.__error) {
          setDistrictDashboardData(null);
          setDistrictDashboardError(dashRes.__error);
        } else {
          setDistrictDashboardData(dashRes?.result || dashRes?.data || dashRes || null);
        }
        if (impactRes?.__error) {
          setImpactAnalysisData(null);
          setImpactAnalysisError(impactRes.__error);
        } else {
          setImpactAnalysisData(impactRes?.result || impactRes?.data || impactRes || null);
        }
      } catch (err) {
        console.warn("District dashboard error:", err);
        setDistrictDashboardData(null);
        setDistrictDashboardError(err.message);
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
        // F-01: helpers throw on failure — partial results are kept and
        // reported honestly instead of a blanket success toast.
        const [locRes, auditRes] = await Promise.all([
          inspectActiveJobLocation(inspectJobId.trim()).catch((err) => ({ __error: err.message })),
          auditJobBroadcast(inspectJobId.trim()).catch((err) => ({ __error: err.message })),
        ]);
        setJobLocationInspectData(locRes?.__error ? null : (locRes?.result || locRes?.data || locRes || null));
        setBroadcastAuditData(auditRes?.__error ? null : (auditRes?.result || auditRes?.data || auditRes || null));
        if (locRes?.__error && auditRes?.__error) {
          toast({ title: "Inspection Failed", description: locRes.__error, status: "error", duration: 3000, isClosable: true });
        } else if (locRes?.__error || auditRes?.__error) {
          toast({ title: "Partial Results", description: locRes?.__error || auditRes?.__error, status: "warning", duration: 3000, isClosable: true });
        } else {
          toast({ title: "Job Location Inspection Complete", status: "success", duration: 2000, isClosable: true });
        }
      } catch (err) {
        toast({ title: "Inspection Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsInspectingJob(false);
      }
    };

    // F-01C: the backend requires technicianId and returns {diagnostic}.
    // The technician selection is validated up front; failures surface as
    // errors (helpers throw) — never as fabricated healthy data.
    const handleRunDispatchDebug = async () => {
      if (!debugTechId) {
        return toast({ title: "Select Technician", description: "Dispatch diagnostics require a technician.", status: "warning", duration: 2500, isClosable: true });
      }
      try {
        setIsLoadingDispatchDebug(true);
        setDispatchDebugData(null);
        const res = await getDispatchDebug({
          technicianId: debugTechId,
          ...(debugDistrictId ? { districtId: debugDistrictId } : {}),
          ...(debugServiceId ? { serviceId: debugServiceId } : {}),
        });
        setDispatchDebugData(res?.diagnostic || null);
        toast({ title: "Dispatch Diagnostics Complete", status: "success", duration: 2000, isClosable: true });
      } catch (err) {
        setDispatchDebugData(null);
        toast({ title: "Diagnostics Error", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsLoadingDispatchDebug(false);
      }
    };

    // F-01B: exact backend rollback contract (DISTRICT/CITY_ZONE only),
    // pre-submit validation, and per-status error feedback. State (polygon
    // + version history) refreshes only after a successful response.
    const handleRollbackPolygonSubmit = async () => {
      if (!["DISTRICT", "CITY_ZONE"].includes(rollbackEntityType)) {
        return toast({ title: "Select Entity Type", description: "Rollback supports districts and micro-zones only.", status: "warning", duration: 2500, isClosable: true });
      }
      if (!rollbackEntityId) {
        return toast({ title: "Select District / Entity", status: "warning", duration: 2500, isClosable: true });
      }
      const targetVersion = Number(rollbackVersion);
      if (!Number.isInteger(targetVersion) || targetVersion <= 0) {
        return toast({ title: "Invalid Version", description: "Enter a positive integer source version.", status: "warning", duration: 2500, isClosable: true });
      }
      try {
        setIsRollingBack(true);
        await rollbackPolygonVersion({
          entityType: rollbackEntityType,
          entityId: rollbackEntityId,
          targetVersion,
          reason: rollbackReason || "Restoring previous polygon version from audit log",
        });
        toast({ title: "Polygon Restored", description: "Polygon version restored successfully.", status: "success", duration: 3000, isClosable: true });
        await fetchData();
      } catch (err) {
        const msg = err.message || "";
        const title = /409|changed|conflict/i.test(msg) ? "Rollback Conflict — Refresh & Retry"
          : /404|not found/i.test(msg) ? "Version Not Found"
          : /403|denied|forbidden/i.test(msg) ? "Access Denied"
          : "Rollback Error";
        toast({ title, description: msg, status: "error", duration: 4000, isClosable: true });
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
        // F-01D: real backend validation. Check-level failures are stored
        // as explicit { error } sentinels and rendered as errors — never as
        // clean/healthy defaults.
        const [valRes, overlapRes, containRes] = await Promise.all([
          validateGeofencePolygon({ polygon: parsed, ...(geoToolDistrictId ? { districtId: geoToolDistrictId } : {}) }).catch((e) => ({ isValid: false, error: e.message })),
          geoToolDistrictId ? checkPolygonOverlap(geoToolDistrictId, parsed).catch((e) => ({ error: e.message })) : Promise.resolve(null),
          geoToolDistrictId ? checkParentBoundaryContainment(geoToolDistrictId, parsed).catch((e) => ({ error: e.message })) : Promise.resolve(null),
        ]);

        setGeoValidationResult({
          validation: valRes,
          overlap: overlapRes,
          containment: containRes,
          parsed,
        });
        if (valRes?.isValid === false) {
          toast({ title: "Polygon Invalid", description: valRes.error || "Geometry failed validation.", status: "error", duration: 3500 });
        } else {
          toast({ title: "Validation Complete", status: "success", duration: 2000 });
        }
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
        // Distance context reuses the same coordinates so the panel works
        // with or without a selected booking.
        const distRes = await diagnoseDistanceAndGeofence(diagTechId, {
          bookingId: diagBookingId || undefined,
          latitude: parseFloat(diagJobLat) || undefined,
          longitude: parseFloat(diagJobLng) || undefined,
          serviceId: diagServiceId || undefined,
        }).catch((e) => ({ error: e.message }));
        setDiagResult({ eligibility: res, distance: distRes });
        toast({ title: "Diagnostics Complete", status: "success", duration: 2000 });
      } catch (err) {
        toast({ title: "Diagnostic Error", description: err.message, status: "error" });
      } finally {
        setIsDiagnosing(false);
      }
    };

    // --- BATCH ACTION HANDLERS: SERVICE-ZONE MATRIX ---
    const handleSelectAllMatrix = (e) => {
      if (e.target.checked) {
        const ids = currentMatrixData.map((m) => m.serviceId).filter(Boolean);
        setSelectedMatrixServiceIds(ids);
      } else {
        setSelectedMatrixServiceIds([]);
      }
    };

    const handleToggleMatrixServiceSelection = (id) => {
      setSelectedMatrixServiceIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    };

    const handleBulkToggleServiceStatus = async (targetActive) => {
      if (selectedMatrixServiceIds.length === 0) return;
      try {
        setIsBatchMatrixLoading(true);
        const results = await Promise.allSettled(
          selectedMatrixServiceIds.map((sid) =>
            toggleServiceStatus({ serviceId: sid, isActive: targetActive })
          )
        );
        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const failedCount = results.length - successCount;
        toast({
          title: `Batch Services ${targetActive ? "Activated" : "Deactivated"}`,
          description: failedCount
            ? `Updated ${successCount} service(s); ${failedCount} failed. Check the service list and retry.`
            : `Updated global status for ${successCount} service(s).`,
          status: failedCount ? "warning" : "success",
          duration: 3500,
          isClosable: true,
        });
        setSelectedMatrixServiceIds([]);
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Batch Action Error", description: err.message, status: "error" });
      } finally {
        setIsBatchMatrixLoading(false);
      }
    };

    const handleBulkEnableServicesForDistrict = async (districtId, enabled) => {
      if (!districtId || selectedMatrixServiceIds.length === 0) {
        return toast({ title: "Select a District", description: "Choose a target district to apply availability.", status: "warning" });
      }
      const dist = districts.find((d) => d._id === districtId);
      const distName = dist?.name || "selected district";
      const subZones = zones.filter((z) => (z.operationalCityId?._id || z.operationalCityId) === districtId);
      const zoneIds = subZones.map((z) => z._id);

      try {
        setIsBatchMatrixLoading(true);
        const results = await Promise.allSettled(
          selectedMatrixServiceIds.map((sid) => {
            if (zoneIds.length > 0) {
              return bulkToggleZoneAvailability({
                serviceId: sid,
                districtId,
                zoneIds,
                cityZoneIds: zoneIds,
                enabled,
                status: enabled ? "ENABLED" : "DISABLED",
              });
            }
            return toggleZoneAvailability({
              serviceId: sid,
              districtId,
              enabled,
              status: enabled ? "ENABLED" : "DISABLED",
            });
          })
        );
        const count = results.filter((r) => r.status === "fulfilled").length;
        const failedCount = results.length - count;

        toast({
          title: `District Availability ${enabled ? "Enabled" : "Disabled"}`,
          description: failedCount
            ? `${count} service(s) updated in ${distName}; ${failedCount} failed.`
            : `${count} service(s) set to ${enabled ? "ACTIVE" : "INACTIVE"} in ${distName}.`,
          status: failedCount ? "warning" : "success",
          duration: 3500,
          isClosable: true,
        });
        setSelectedMatrixServiceIds([]);
        setBatchMatrixDistrictId("");
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Batch Action Error", description: err.message, status: "error" });
      } finally {
        setIsBatchMatrixLoading(false);
      }
    };

    // Modal quick actions for single service mapping
    const handleModalEnableAllDistricts = async (targetActive) => {
      if (!selectedServiceDetail?.service || !selectedServiceDetail?.districts) return;
      const sid = resolveServiceId(selectedServiceDetail.service);
      const targetStatus = targetActive ? "ENABLED" : "DISABLED";

      // Optimistic UI update across all districts
      setSelectedServiceDetail((prev) => {
        if (!prev || !prev.districts) return prev;
        return {
          ...prev,
          districts: prev.districts.map((d) => {
            const updatedZones = (d.zones || []).map((z) => ({
              ...z,
              status: targetStatus,
              enabled: targetActive,
              active: targetActive,
              isAvailable: targetActive,
              isServiceEnabled: targetActive,
            }));
            return {
              ...d,
              isDistrictEnabled: targetActive,
              status: targetStatus,
              enabled: targetActive,
              active: targetActive,
              isAvailable: targetActive,
              isServiceEnabled: targetActive,
              zones: updatedZones,
              activeZonesCount: targetActive ? updatedZones.length : 0,
              inactiveZonesCount: targetActive ? 0 : updatedZones.length,
            };
          }),
        };
      });

      try {
        setIsServiceDetailLoading(true);
        const dists = selectedServiceDetail.districts;
        const results = await Promise.allSettled(
          dists.map((dist) => {
            const districtId = resolveDetailDistrictId(dist);
            const zoneIds = collectChildZoneIds(dist, districtId);
            if (zoneIds.length > 0) {
              return bulkToggleZoneAvailability({
                serviceId: sid,
                districtId,
                zoneIds,
                cityZoneIds: zoneIds,
                enabled: targetActive,
                status: targetStatus,
              });
            }
            return toggleZoneAvailability({
              serviceId: sid,
              districtId,
              enabled: targetActive,
              status: targetStatus,
            });
          })
        );
        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const failedCount = results.length - successCount;
        toast({
          title: `All Districts ${targetActive ? "Enabled" : "Disabled"}`,
          description: failedCount
            ? `Updated ${successCount} district(s); ${failedCount} failed. Retry the failed districts.`
            : `Updated availability across all operational hubs.`,
          status: failedCount ? "warning" : "success",
          duration: 3000,
        });
        await reloadServiceDetail(sid);
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Action Failed", description: err.message, status: "error" });
        await reloadServiceDetail(sid);
      } finally {
        setIsServiceDetailLoading(false);
      }
    };

    const handleModalDistrictAllZonesToggle = async (dist, targetActive) => {
      if (!selectedServiceDetail?.service) return;
      const sid = resolveServiceId(selectedServiceDetail.service);
      const districtId = resolveDetailDistrictId(dist);
      const zoneIds = collectChildZoneIds(dist, districtId);
      if (zoneIds.length === 0) return;
      const targetStatus = targetActive ? "ENABLED" : "DISABLED";

      setTogglingDistrictId(districtId);

      // Optimistic UI update for this district's sub-zones
      setSelectedServiceDetail((prev) => {
        if (!prev || !prev.districts) return prev;
        return {
          ...prev,
          districts: prev.districts.map((d) => {
            if (String(resolveDetailDistrictId(d)) === String(districtId)) {
              const updatedZones = (d.zones || []).map((z) => ({
                ...z,
                status: targetStatus,
                enabled: targetActive,
                active: targetActive,
                isAvailable: targetActive,
                isServiceEnabled: targetActive,
              }));
              return {
                ...d,
                zones: updatedZones,
                activeZonesCount: targetActive ? updatedZones.length : 0,
                inactiveZonesCount: targetActive ? 0 : updatedZones.length,
                isDistrictEnabled: targetActive,
                status: targetStatus,
                enabled: targetActive,
                active: targetActive,
                isAvailable: targetActive,
                isServiceEnabled: targetActive,
              };
            }
            return d;
          }),
        };
      });

      try {
        await bulkToggleZoneAvailability({
          serviceId: sid,
          districtId,
          zoneIds,
          cityZoneIds: zoneIds,
          enabled: targetActive,
          status: targetStatus,
        });
        toast({
          title: `Sub-Zones ${targetActive ? "Turned ON" : "Turned OFF"}`,
          description: `All ${zoneIds.length} sub-zones in ${dist.name} set to ${targetActive ? "ACTIVE" : "INACTIVE"}.`,
          status: "success",
          duration: 2500,
        });
        await reloadServiceDetail(sid);
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Toggle Error", description: err.message, status: "error" });
        await reloadServiceDetail(sid);
      } finally {
        setTogglingDistrictId(null);
      }
    };

    const handleModalDistrictClearZones = async (dist) => {
      if (!selectedServiceDetail?.service) return;
      const sid = resolveServiceId(selectedServiceDetail.service);
      const districtId = resolveDetailDistrictId(dist);

      setTogglingDistrictId(districtId);

      // Optimistic UI update clearing this district
      setSelectedServiceDetail((prev) => {
        if (!prev || !prev.districts) return prev;
        return {
          ...prev,
          districts: prev.districts.map((d) => {
            if (String(resolveDetailDistrictId(d)) === String(districtId)) {
              const updatedZones = (d.zones || []).map((z) => ({
                ...z,
                status: "DISABLED",
                enabled: false,
                active: false,
                isAvailable: false,
                isServiceEnabled: false,
              }));
              return {
                ...d,
                zones: updatedZones,
                activeZonesCount: 0,
                inactiveZonesCount: updatedZones.length,
                isDistrictEnabled: false,
                status: "DISABLED",
                enabled: false,
                active: false,
                isAvailable: false,
                isServiceEnabled: false,
              };
            }
            return d;
          }),
        };
      });

      try {
        await clearDistrictZoneAvailability({ serviceId: sid, districtId });
        toast({
          title: "District Services Cleared",
          description: `Disabled all service mappings and overrides for ${dist.name}. Re-enable zones or services explicitly to restore availability.`,
          status: "info",
          duration: 2500,
        });
        await reloadServiceDetail(sid);
        await fetchMatrixData();
      } catch (err) {
        toast({ title: "Clear Error", description: err.message, status: "error" });
        await reloadServiceDetail(sid);
      } finally {
        setTogglingDistrictId(null);
      }
    };

    // --- BATCH ACTION HANDLERS: TECHNICIAN PERMISSIONS ---
    const handleSelectAllTechs = (e) => {
      if (e.target.checked) {
        const ids = currentTechnicians.map((t) => t._id).filter(Boolean);
        setSelectedTechIds(ids);
      } else {
        setSelectedTechIds([]);
      }
    };

    const handleToggleTechSelection = (id) => {
      setSelectedTechIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    };

    const handleBatchGrantDistrictPermission = async () => {
      if (!batchTechDistrictId) {
        return toast({ title: "Select District", description: "Select a secondary district to grant.", status: "warning" });
      }
      if (selectedTechIds.length === 0) return;
      const targetDist = districts.find((d) => d._id === batchTechDistrictId);
      const distName = targetDist?.name || "district";

      try {
        setIsBatchTechLoading(true);
        let grantedCount = 0;
        await Promise.allSettled(
          selectedTechIds.map(async (techId) => {
            await addTechnicianDistrictPermission(techId, batchTechDistrictId);
            grantedCount++;
          })
        );
        toast({
          title: "Permissions Granted",
          description: `Granted ${distName} access to ${grantedCount} technician(s).`,
          status: "success",
          duration: 3500,
          isClosable: true,
        });
        setSelectedTechIds([]);
        setBatchTechDistrictId("");
        await fetchData();
      } catch (err) {
        toast({ title: "Batch Permission Error", description: err.message, status: "error" });
      } finally {
        setIsBatchTechLoading(false);
      }
    };

    const handleBatchUpdateRadius = async () => {
      const km = Number(batchTechRadius);
      if (!Number.isFinite(km) || km < 1 || km > 100) {
        return toast({ title: "Validation Error", description: "Service radius must be 1–100 KM.", status: "error" });
      }
      if (selectedTechIds.length === 0) return;

      try {
        setIsBatchTechLoading(true);
        let count = 0;
        await Promise.allSettled(
          selectedTechIds.map(async (techId) => {
            await updateTechnicianProfile({ id: techId, technicianId: techId, serviceRadiusKm: km });
            count++;
          })
        );
        toast({
          title: "Radius Updated",
          description: `Applied ${km} KM service radius to ${count} technician(s).`,
          status: "success",
          duration: 3500,
          isClosable: true,
        });
        setSelectedTechIds([]);
        await fetchData();
      } catch (err) {
        toast({ title: "Batch Radius Error", description: err.message, status: "error" });
      } finally {
        setIsBatchTechLoading(false);
      }
    };

    const handleBatchVerifyGps = async (action = "APPROVE") => {
      if (selectedTechIds.length === 0) return;
      try {
        setIsBatchTechLoading(true);
        let count = 0;
        await Promise.allSettled(
          selectedTechIds.map(async (techId) => {
            await updateTechnicianGeofenceVerification(techId, {
              action,
              isLocationVerified: action === "APPROVE",
              overrideMismatch: false,
              verificationNotes: `Bulk ${action.toLowerCase()}d by admin`,
              notes: `Bulk ${action.toLowerCase()}d by admin`,
            });
            count++;
          })
        );
        toast({
          title: `GPS Verification ${action === "APPROVE" ? "Approved" : "Rejected"}`,
          description: `Updated status for ${count} technician(s).`,
          status: "success",
          duration: 3500,
          isClosable: true,
        });
        setSelectedTechIds([]);
        await fetchData();
      } catch (err) {
        toast({ title: "Batch Verification Error", description: err.message, status: "error" });
      } finally {
        setIsBatchTechLoading(false);
      }
    };

    // Pre-save instant polygon validator for modals
    const handleValidateModalPolygon = async (polygonRaw, parentDistrictId) => {
      if (!polygonRaw || !polygonRaw.trim()) {
        return toast({ title: "Empty Boundary", description: "Generate or draw a polygon on the map first.", status: "warning" });
      }
      try {
        setIsCheckingModalBoundary(true);
        setModalBoundaryCheckResult(null);
        let parsed = null;
        try {
          parsed = JSON.parse(polygonRaw);
        } catch (e) {
          setModalBoundaryCheckResult({ isValid: false, message: "Invalid JSON format: " + e.message });
          return;
        }

        const [valRes, containRes] = await Promise.all([
          validateGeofencePolygon({ polygon: parsed }).catch((e) => ({ isValid: false, error: e.message })),
          parentDistrictId ? checkParentBoundaryContainment(parentDistrictId, parsed).catch(() => null) : Promise.resolve(null),
        ]);

        const isValid = valRes?.isValid !== false && !valRes?.error;
        const isContained = containRes ? (containRes?.isContained !== false && containRes?.contained !== false) : true;

        setModalBoundaryCheckResult({
          isValid,
          isContained,
          message: !isValid
            ? (valRes?.error || "Polygon coordinates do not form a closed or valid RFC 7946 ring.")
            : (!isContained ? "Warning: Polygon extends outside the selected Parent District boundary." : "Valid Polygon: Ready for operational deployment!"),
          vertexCount: parsed?.coordinates?.[0]?.length || 0,
        });
        toast({
          title: isValid ? (isContained ? "Polygon Validated ✓" : "Boundary Warning") : "Invalid Polygon",
          description: !isValid ? "Fix self-intersections or unclosed ring." : (isContained ? "Polygon passed all spatial integrity tests." : "Boundary extends outside district."),
          status: isValid && isContained ? "success" : "warning",
          duration: 3000,
        });
      } catch (err) {
        setModalBoundaryCheckResult({ isValid: false, message: err.message });
      } finally {
        setIsCheckingModalBoundary(false);
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
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 3, md: 4 }}>
            {statCards.map((card) => {
              const cardStyle = getSkeuomorphicCardStyle(false, card.isActive, card.accent);
              return (
                <Box
                  key={card.key}
                  role="button"
                  tabIndex={0}
                  onClick={card.onClick}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") card.onClick(); }}
                  cursor="pointer"
                  textAlign="left"
                  minH={{ base: "90px", md: "105px" }}
                  h={{ base: "auto", md: "105px" }}
                  borderRadius="10px"
                  transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  px={{ base: 3, md: 4 }}
                  py={{ base: 2.5, md: 3 }}
                  {...cardStyle}
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
                      w="42px"
                      h="42px"
                      flexShrink={0}
                      {...getSkeuomorphicIconBoxStyle(card.accent)}
                    >
                      <Icon as={card.icon} boxSize="20px" color="white" sx={skeuomorphicIconFilter} />
                    </Flex>
                  </Flex>
                  <Flex align="center" justify="space-between" mt={1} pt={1} borderTop="1px solid" borderColor="rgba(226, 232, 240, 0.7)" w="100%">
                    <Text fontSize="10px" color={card.isActive ? card.accent : "gray.400"} fontWeight="700">
                      {card.isActive ? "● Active View" : "View Details"}
                    </Text>
                    <Icon as={FaChevronRight} boxSize="8px" color={card.isActive ? card.accent : "gray.300"} />
                  </Flex>
                </Box>
              );
            })}
          </SimpleGrid>
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
                  {(activeTab === 0 || activeTab === 1) && (
                    <>
                      <Button
                        leftIcon={<MdAdd />}
                        size="sm"
                        variant="brand"
                        borderRadius="8px"
                        fontWeight="600"
                        boxShadow="sm"
                        _hover={{ transform: "translateY(-1px)" }}
                        _active={{ transform: "translateY(0)" }}
                        onClick={() => handleOpenCreateDistrictModal()}
                      >
                        Add District
                      </Button>
                      <Button
                        leftIcon={<MdAdd />}
                        size="sm"
                        bg="purple.600"
                        color="white"
                        borderRadius="8px"
                        fontWeight="600"
                        boxShadow="sm"
                        _hover={{ bg: "purple.700", transform: "translateY(-1px)" }}
                        _active={{ bg: "purple.800", transform: "translateY(0)" }}
                        onClick={() => handleOpenCreateZone()}
                      >
                        Add City Zone
                      </Button>
                    </>
                  )}
                  <Button
                    leftIcon={<MdAdd />}
                    size="sm"
                    variant="solid"
                    bg="teal.600"
                    color="white"
                    _hover={{ bg: "teal.700", transform: "translateY(-1px)" }}
                    _active={{ bg: "teal.800", transform: "translateY(0)" }}
                    borderRadius="8px"
                    fontWeight="600"
                    boxShadow="sm"
                    onClick={() => handleBulkToggleAllDistricts(true)}
                    isLoading={isLoading}
                    title="Initialize and add all 38 official Tamil Nadu revenue districts with Survey of India boundary geocodes"
                  >
                    Add All 38 Districts
                  </Button>
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
                  { icon: MdApartment, label: "1. District Master", count: activeDistrictsCount },
                  { icon: MdMap, label: "2. City Micro-Zones", count: zones.length },
                  { icon: MdLink, label: "3. Zone-Based Services", count: matrixData.length || services.length },
                  { icon: FaUserGear, label: "4. Technician District Permissions", count: technicians.length },
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
                    _active={{ bg: activeTab === idx ? "#004d4d" : "gray.200" }}
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
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                    >
                      <option value="all">All Operational Districts</option>
                      {districts.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.city ? `${d.city} — ${d.name}` : d.name}
                        </option>
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
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                    >
                      <option value="all">All Permissions</option>
                      <option value="multi_district">Has District Coverage</option>
                      <option value="single_district">No District Coverage</option>
                    </Select>
                  )}

                  {activeTab === 0 && (
                    <ButtonGroup size="sm" isAttached variant="outline" ml={{ base: 0, sm: 2 }} flexWrap="wrap">
                      <Button
                        fontSize="xs"
                        variant={districtFilter === "all" ? "brand" : "outline"}
                        onClick={() => handleFilterDistricts("all")}
                      >
                        Operational ({createdDistrictsList.length})
                      </Button>
                      <Button
                        fontSize="xs"
                        variant={districtFilter === "active" ? "brand" : "outline"}
                        colorScheme={districtFilter === "active" ? undefined : "green"}
                        onClick={() => handleFilterDistricts("active")}
                      >
                        Enabled ({activeDistrictsCount})
                      </Button>
                      <Button
                        fontSize="xs"
                        variant={districtFilter === "inactive" ? "brand" : "outline"}
                        colorScheme={districtFilter === "inactive" ? undefined : "red"}
                        onClick={() => handleFilterDistricts("inactive")}
                      >
                        Disabled ({inactiveDistrictsCount})
                      </Button>
                      <Button
                        fontSize="xs"
                        variant={districtFilter === "all_tn" ? "brand" : "outline"}
                        colorScheme={districtFilter === "all_tn" ? undefined : "purple"}
                        onClick={() => handleFilterDistricts("all_tn")}
                      >
                        All 38 TN Districts ({allMergedDistricts.length})
                      </Button>
                    </ButtonGroup>
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
              <Tabs isLazy index={activeTab} onChange={(idx) => { setActiveTab(idx); setCurrentPage(1); }} variant="unstyled" display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                <TabList display="none">
                  <Tab /><Tab /><Tab /><Tab /><Tab />
                </TabList>

                <TabPanels flex="1" minH="0" display="flex" flexDirection="column" overflow="hidden">
                  {/* TAB 0: OPERATIONAL CITIES & DISTRICT MASTER (1.1) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    {currentDistricts.length === 0 ? (
                      <Box
                        flex="1"
                        minH="420px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        p={6}
                      >
                        <Box
                          w="100%"
                          maxW="780px"
                          py={10}
                          px={8}
                          borderRadius="20px"
                          bg="linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)"
                          border="1.5px dashed"
                          borderColor="teal.200"
                          boxShadow="0 4px 20px -2px rgba(13, 148, 136, 0.08)"
                          textAlign="center"
                        >
                          <Flex
                            w="70px"
                            h="70px"
                            borderRadius="full"
                            bg="teal.50"
                            color="teal.600"
                            align="center"
                            justify="center"
                            mx="auto"
                            boxShadow="0 0 24px rgba(13, 148, 136, 0.2)"
                            border="2px solid"
                            borderColor="teal.200"
                          >
                            <Icon as={MdApartment} boxSize={9} />
                          </Flex>

                          <Text fontSize="xl" fontWeight="800" color="gray.800" mt={4}>
                            No Operational Districts Activated Yet
                          </Text>

                          <Text fontSize="sm" color="gray.600" maxW="540px" mx="auto" mt={2} lineHeight="1.6">
                            Choose from Tamil Nadu's 38 official Survey of India revenue districts to enable technician onboarding, service bookings, and automated dispatch.
                          </Text>

                          <Grid
                            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                            gap={3.5}
                            my={6}
                            textAlign="left"
                          >
                            <Box p={3.5} bg="white" borderRadius="12px" border="1px solid" borderColor="teal.100" boxShadow="xs">
                              <HStack spacing={2} mb={1.5}>
                                <Icon as={MdCheckCircle} color="teal.500" boxSize={4} />
                                <Text fontSize="xs" fontWeight="700" color="gray.800">Survey of India GeoJSON</Text>
                              </HStack>
                              <Text fontSize="11px" color="gray.500" lineHeight="1.4">
                                Pre-loaded official boundary coordinates for all 38 TN revenue districts.
                              </Text>
                            </Box>

                            <Box p={3.5} bg="white" borderRadius="12px" border="1px solid" borderColor="teal.100" boxShadow="xs">
                              <HStack spacing={2} mb={1.5}>
                                <Icon as={MdCheckCircle} color="purple.500" boxSize={4} />
                                <Text fontSize="xs" fontWeight="700" color="gray.800">City Micro-Zones</Text>
                              </HStack>
                              <Text fontSize="11px" color="gray.500" lineHeight="1.4">
                                Create sub-zones and villages under parent districts for targeted dispatch.
                              </Text>
                            </Box>

                            <Box p={3.5} bg="white" borderRadius="12px" border="1px solid" borderColor="teal.100" boxShadow="xs">
                              <HStack spacing={2} mb={1.5}>
                                <Icon as={MdCheckCircle} color="blue.500" boxSize={4} />
                                <Text fontSize="xs" fontWeight="700" color="gray.800">1-Click Governance</Text>
                              </HStack>
                              <Text fontSize="11px" color="gray.500" lineHeight="1.4">
                                Control master active state, registration access, and job dispatch flags instantly.
                              </Text>
                            </Box>
                          </Grid>

                          <HStack spacing={3} justify="center">
                            <Button
                              size="md"
                              variant="brand"
                              borderRadius="10px"
                              px={6}
                              py={2.5}
                              fontSize="sm"
                              fontWeight="700"
                              leftIcon={<MdAdd />}
                              onClick={() => handleOpenCreateDistrictModal()}
                              boxShadow="0 4px 14px rgba(0, 128, 128, 0.3)"
                              _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(0, 128, 128, 0.4)" }}
                              _active={{ transform: "translateY(0)" }}
                            >
                              + Add Operational District
                            </Button>
                            <Button
                              size="md"
                              variant="outline"
                              borderRadius="10px"
                              px={5}
                              py={2.5}
                              fontSize="sm"
                              fontWeight="600"
                              leftIcon={<MdPublic />}
                              onClick={() => handleBulkToggleAllDistricts(true)}
                              borderColor="teal.300"
                              color="teal.700"
                              _hover={{ bg: "teal.50", borderColor: "teal.400" }}
                            >
                              + Add All 38 Districts
                            </Button>
                          </HStack>
                        </Box>
                      </Box>
                    ) : (
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
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" whiteSpace="nowrap">#</Th>
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" whiteSpace="nowrap">DISTRICT</Th>
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" whiteSpace="nowrap">OPERATIONAL RANGE (CITY)</Th>
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" whiteSpace="nowrap">CODE</Th>
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" textAlign="center" whiteSpace="nowrap">SERVICE CONTROLS (ENABLE / DISABLE)</Th>
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" whiteSpace="nowrap">GEOCODE (SOI)</Th>
                              <Th bg="gray.50" color="gray.600" py={3.5} fontSize="10px" fontWeight="700" letterSpacing="0.5px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {currentDistricts.map((dist, idx) => {
                              const isActive = dist.active === true;
                              return (
                                <Tr key={dist._id || dist.name} _hover={{ bg: "teal.50" }} transition="background 0.15s">
                                  <Td fontWeight="600" color="gray.400" py={3}>{indexOfFirstItem + idx + 1}</Td>
                                  <Td py={3}>
                                    <HStack spacing={2} align="center">
                                      <Text fontWeight="700" color={INK}>{dist.name}</Text>
                                      {dist.tnDistrict?.dtcode && (
                                        <Badge size="xs" fontSize="9px" colorScheme="blue" variant="subtle" borderRadius="4px">
                                          dtcode: {dist.tnDistrict.dtcode}
                                        </Badge>
                                      )}
                                    </HStack>
                                    <StatusPill tone={isActive ? "active" : "inactive"}>
                                      {isActive ? "Active / Enabled" : "Disabled / Not Active"}
                                    </StatusPill>
                                  </Td>
                                  <Td py={3}>
                                    <HStack spacing={1.5}>
                                      <Icon as={MdLocationOn} color={BRAND} boxSize={3.5} />
                                      <Text fontWeight="500">{dist.city}{dist.state ? `, ${dist.state}` : ""}</Text>
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <Tag size="sm" colorScheme="blue" borderRadius="6px" fontWeight="600">{dist.displayCode || dist.code || "N/A"}</Tag>
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
                                        isChecked={dist.isRegistrationEnabled !== false && isActive}
                                        onChange={() => handleToggleDistrictRegistrationFlag(dist)}
                                        colorScheme="green"
                                      />
                                      <MiniToggle
                                        label="Job Dispatch"
                                        isChecked={dist.isJobEnabled !== false && isActive}
                                        onChange={() => handleToggleDistrictJobFlag(dist)}
                                        colorScheme="purple"
                                      />
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <Tooltip label="Official Survey of India GeoJSON Boundary Loaded">
                                      <Badge colorScheme={dist.polygon || dist.officialBoundary ? "teal" : "gray"} borderRadius="full" px={2.5} fontWeight="600" fontSize="10px">
                                        {dist.polygon || dist.officialBoundary ? "Official SOI GeoJSON" : "No Boundary"}
                                      </Badge>
                                    </Tooltip>
                                  </Td>
                                  <Td py={3} textAlign="right">
                                    <HStack spacing={1.5} justify="flex-end">
                                      <Tooltip label={`Add Micro-Zone to ${dist.name}`}>
                                        <Button
                                          size="xs"
                                          colorScheme="teal"
                                          variant="solid"
                                          borderRadius="6px"
                                          leftIcon={<MdAdd />}
                                          onClick={() => handleOpenCreateZone(dist._id || dist.name)}
                                          fontSize="10px"
                                          fontWeight="700"
                                          px={2.5}
                                          mr={1}
                                        >
                                          + Add Zone
                                        </Button>
                                      </Tooltip>
                                      {dist.isConfigured && (
                                        <Tooltip label="Activate as Operational City Hub">
                                          <IconButton
                                            size="xs"
                                            icon={<MdCheckCircle />}
                                            colorScheme="green"
                                            variant="ghost"
                                            onClick={() => handleActivateDistrict(dist.backendRecord || dist)}
                                          />
                                        </Tooltip>
                                      )}
                                      <Tooltip label="View Real-Time Map Range">
                                        <IconButton
                                          size="xs"
                                          icon={<MdMap />}
                                          colorScheme="purple"
                                          variant="ghost"
                                          onClick={() => handleOpenViewMapModal(dist.backendRecord || dist)}
                                        />
                                      </Tooltip>
                                      {dist.isConfigured ? (
                                        <>
                                          <Tooltip label="View Technicians">
                                            <IconButton
                                              size="xs"
                                              icon={<MdVisibility />}
                                              colorScheme="blue"
                                              variant="ghost"
                                              onClick={() => handleViewDistrictTechnicians(dist.backendRecord || dist)}
                                            />
                                          </Tooltip>
                                          <Tooltip label="Edit District">
                                            <IconButton
                                              size="xs"
                                              icon={<MdEdit />}
                                              colorScheme="teal"
                                              variant="ghost"
                                              onClick={() => handleOpenEditDistrict(dist.backendRecord || dist)}
                                            />
                                          </Tooltip>
                                          <Tooltip label="Delete District">
                                            <IconButton
                                              size="xs"
                                              icon={<MdDelete />}
                                              colorScheme="red"
                                              variant="ghost"
                                              onClick={() => handleDeleteDistrictPrompt(dist.backendRecord || dist)}
                                            />
                                          </Tooltip>
                                        </>
                                      ) : (
                                        <Tooltip label="Configure District Details">
                                          <Button
                                            size="xs"
                                            variant="brand-outline"
                                            borderRadius="6px"
                                            leftIcon={<MdEdit />}
                                            onClick={() => handleOpenCreateDistrictModal(dist.name)}
                                          >
                                            Configure
                                          </Button>
                                        </Tooltip>
                                      )}
                                    </HStack>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </TabPanel>

                  {/* TAB 1: CITY MICRO-ZONES / SUB-ZONES (1.2) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    <Box mx={4} mt={3} mb={1} px={3} py={2} bg="teal.50" border="1px solid" borderColor="teal.200" borderRadius="8px">
                      <HStack spacing={2} align="flex-start">
                        <Icon as={MdInfoOutline} color="teal.600" boxSize={4} mt="1px" />
                        <Text fontSize="11px" color="teal.800">
                          New zones start with <strong>all active services enabled</strong>. Inactive services stay off. Use the service matrix to disable individual services later.
                        </Text>
                      </HStack>
                    </Box>
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
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">CITY / TOWN</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PARENT DISTRICT</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="center" whiteSpace="nowrap">ZONE STATUS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="center" whiteSpace="nowrap">ALL SERVICES IN ZONE</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">POLYGON</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentZones.length === 0 ? (
                            <Tr><Td colSpan={9} textAlign="center" py={10} color="gray.500">No city micro-zones found. Click "Add City Zone" to create one.</Td></Tr>
                          ) : (
                            currentZones.map((zone, idx) => {
                              const isZoneActive = zone.active !== false;
                              const enabledServiceCount = activeServiceCountByZone.get(String(zone._id)) || 0;
                              const parentDistId = resolveZoneDistrictId(zone);
                              const parentDist = districts.find((d) => String(d._id) === String(parentDistId));
                              const parentName = parentDist
                                ? (parentDist.city && parentDist.city !== parentDist.name ? `${parentDist.city} (${parentDist.name})` : parentDist.name)
                                : (zone.operationalCityId?.name || "N/A");
                              const zoneCity =
                                zone.city ||
                                (zone.name ? zone.name.replace(/\s+(Zone|Central Zone|North Zone|South Zone|East Zone|West Zone|Hub|Range)$/i, "").trim() : "") ||
                                parentDist?.city ||
                                "Tamil Nadu";

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
                                      <Icon as={MdLocationCity} color="purple.600" boxSize={3.5} />
                                      <Text fontSize="xs" fontWeight="700" color="gray.800">
                                        {zoneCity}
                                      </Text>
                                      <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="full" px={1.5}>
                                        TN
                                      </Badge>
                                    </HStack>
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
                                        const nextActive = !isZoneActive;
                                        // 1. Instant optimistic UI update (0ms switch response)
                                        setZones((prev) =>
                                          prev.map((z) => (String(z._id) === String(zone._id) ? { ...z, active: nextActive } : z))
                                        );
                                        toast({
                                          title: `Zone ${nextActive ? "Activated" : "Deactivated"}`,
                                          status: "success",
                                          duration: 1500,
                                          isClosable: true,
                                        });
                                        try {
                                          await updateZone(zone._id, { active: nextActive });
                                        } catch (err) {
                                          // Rollback on network error
                                          setZones((prev) =>
                                            prev.map((z) => (String(z._id) === String(zone._id) ? { ...z, active: isZoneActive } : z))
                                          );
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
                                    <Text fontSize="10px" color="gray.500" mt={1}>
                                      {enabledServiceCount} of {services.length} services enabled
                                    </Text>
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

                  {/* TAB 2: ZONE-BASED SERVICES (DISTRICT ➔ ZONE HIERARCHICAL SCREENING) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    {/* Hierarchical Screening: Step 1 District & Step 2 Micro-Zone */}
                    <Box p={3} borderBottom="1px solid" borderColor="gray.200" bg="white" flexShrink={0}>
                      {/* Step 1: District Screening */}
                      <Flex align="center" gap={2} mb={2.5} flexWrap="wrap">
                        <HStack spacing={1.5} mr={2} minW="135px">
                          <Icon as={MdLocationCity} color={BRAND} />
                          <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                            1. Select District:
                          </Text>
                        </HStack>
                        <Button
                          size="xs"
                          borderRadius="full"
                          variant={matrixDistrictFilter === "ALL" ? "solid" : "outline"}
                          colorScheme={matrixDistrictFilter === "ALL" ? "teal" : "gray"}
                          bg={matrixDistrictFilter === "ALL" ? BRAND : "white"}
                          color={matrixDistrictFilter === "ALL" ? "white" : "gray.700"}
                          onClick={() => {
                            setMatrixDistrictFilter("ALL");
                            setMatrixZoneFilter("ALL");
                            setCurrentPage(1);
                          }}
                        >
                          🌐 All Districts ({districts.length})
                        </Button>
                        {districts.map((d) => {
                          const zCount = zones.filter((z) => String(z.operationalCityId || z.districtId) === String(d._id)).length;
                          const isSel = matrixDistrictFilter === String(d._id);
                          return (
                            <Button
                              key={d._id}
                              size="xs"
                              borderRadius="full"
                              variant={isSel ? "solid" : "outline"}
                              colorScheme={isSel ? "teal" : "gray"}
                              bg={isSel ? BRAND : "white"}
                              color={isSel ? "white" : "gray.700"}
                              onClick={() => {
                                setMatrixDistrictFilter(String(d._id));
                                setMatrixZoneFilter("ALL");
                                setCurrentPage(1);
                              }}
                              leftIcon={<Icon as={MdLocationOn} />}
                            >
                              {d.name} ({zCount} Zones)
                            </Button>
                          );
                        })}
                      </Flex>

                      {/* Step 2: Micro-Zone Screening inside Selected District */}
                      {matrixDistrictFilter !== "ALL" && (
                        <Box pt={2.5} pb={1} borderTop="1px dashed" borderColor="gray.200">
                          <Flex align="center" gap={2} flexWrap="wrap">
                            <HStack spacing={1.5} mr={2} minW="135px">
                              <Icon as={MdPlace} color="purple.600" />
                              <Text fontSize="xs" fontWeight="700" color="purple.800" textTransform="uppercase" letterSpacing="0.5px">
                                2. Screen Zone:
                              </Text>
                            </HStack>
                            <Button
                              size="xs"
                              borderRadius="full"
                              variant={matrixZoneFilter === "ALL" ? "solid" : "outline"}
                              colorScheme={matrixZoneFilter === "ALL" ? "purple" : "gray"}
                              bg={matrixZoneFilter === "ALL" ? "purple.600" : "white"}
                              color={matrixZoneFilter === "ALL" ? "white" : "purple.700"}
                              onClick={() => {
                                setMatrixZoneFilter("ALL");
                                setCurrentPage(1);
                              }}
                            >
                              All Zones in {districts.find((d) => String(d._id) === String(matrixDistrictFilter))?.name || "District"}
                            </Button>

                            {zones
                              .filter((z) => String(z.operationalCityId || z.districtId) === String(matrixDistrictFilter))
                              .filter((z) => !matrixZoneSearch.trim() || (z.name || "").toLowerCase().includes(matrixZoneSearch.toLowerCase()))
                              .map((z, zIdx) => {
                                const isZoneSel = matrixZoneFilter === String(z._id || z.zoneId || z.id);
                                return (
                                  <Button
                                    key={z._id || z.zoneId || z.id || zIdx}
                                    size="xs"
                                    borderRadius="full"
                                    variant={isZoneSel ? "solid" : "outline"}
                                    colorScheme={isZoneSel ? "purple" : "gray"}
                                    bg={isZoneSel ? "purple.600" : "white"}
                                    color={isZoneSel ? "white" : "gray.700"}
                                    borderColor={isZoneSel ? "purple.600" : "purple.200"}
                                    onClick={() => {
                                      setMatrixZoneFilter(String(z._id || z.zoneId || z.id));
                                      setCurrentPage(1);
                                    }}
                                  >
                                    📍 {z.name} ({z.zoneCode || "Zone"})
                                  </Button>
                                );
                              })}

                            <InputGroup size="xs" maxW="160px" ml="auto">
                              <Input
                                placeholder="Filter zones..."
                                value={matrixZoneSearch}
                                onChange={(e) => setMatrixZoneSearch(e.target.value)}
                                borderRadius="6px"
                                bg="white"
                              />
                              <InputRightElement><Icon as={MdSearch} color="gray.400" /></InputRightElement>
                            </InputGroup>
                          </Flex>
                        </Box>
                      )}
                    </Box>

                    {/* Filter & Search Toolbar */}
                    <Box p={2.5} borderBottom="1px solid" borderColor="gray.200" bg="gray.50" flexShrink={0}>
                      <Flex gap={3} flexWrap="wrap" align="center" justify="space-between">
                        <HStack spacing={3} flex="1" minW="300px" flexWrap="wrap">
                          <InputGroup size="sm" maxW="240px">
                            <Input
                              placeholder="Search Service..."
                              value={matrixSearch}
                              onChange={(e) => { setMatrixSearch(e.target.value); setCurrentPage(1); }}
                              borderRadius="8px"
                              bg="white"
                            />
                            <InputRightElement><Icon as={MdSearch} color="gray.400" /></InputRightElement>
                          </InputGroup>

                          <Select
                            size="sm"
                            maxW="180px"
                            value={matrixCategoryFilter}
                            onChange={(e) => { setMatrixCategoryFilter(e.target.value); setCurrentPage(1); }}
                            borderRadius="8px"
                            bg="white"
                            border="1px solid"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                          >
                            <option value="ALL">All Categories</option>
                            {categoriesList.map((c) => (
                              <option key={c._id} value={c._id}>{c.category || c.name || c.categoryName}</option>
                            ))}
                          </Select>

                          <Select
                            size="sm"
                            maxW="150px"
                            value={matrixZoneStatusFilter}
                            onChange={(e) => { setMatrixZoneStatusFilter(e.target.value); setCurrentPage(1); }}
                            borderRadius="8px"
                            bg="white"
                            border="1px solid"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
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
                            bg="white"
                            border="1px solid"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
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
                          bg="white"
                        >
                          Reset / Show All
                        </Button>
                      </Flex>
                    </Box>

                    {/* Specific Zone Screening Banner & Direct Actions */}
                    {matrixDistrictFilter !== "ALL" && matrixZoneFilter !== "ALL" && (() => {
                      const activeDistObj = districts.find((d) => String(d._id) === String(matrixDistrictFilter));
                      const activeZoneObj = zones.find((z) => String(z._id || z.zoneId || z.id) === String(matrixZoneFilter));
                      const activeCountInZone = currentMatrixData.filter((item) => isServiceActiveInZone(item.serviceId, matrixZoneFilter)).length;

                      return (
                        <Flex
                          px={4}
                          py={2.5}
                          bg="purple.50"
                          borderBottom="1px solid"
                          borderColor="purple.200"
                          align="center"
                          justify="space-between"
                          flexWrap="wrap"
                          gap={2}
                          flexShrink={0}
                        >
                          <HStack spacing={2.5}>
                            <Badge colorScheme="purple" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                              Zone Screening Active
                            </Badge>
                            <Text fontSize="xs" fontWeight="700" color="purple.900">
                              {activeDistObj?.name || "District"} ➔ {activeZoneObj?.name || "Zone"} ({activeZoneObj?.zoneCode || ""})
                            </Text>
                            <Text fontSize="xs" color="purple.700">
                              • {activeCountInZone} of {currentMatrixData.length} Services Active in this Zone
                            </Text>
                          </HStack>

                          <HStack spacing={2}>
                            <Button
                              size="xs"
                              colorScheme="green"
                              leftIcon={<MdCheckCircle />}
                              onClick={() => handleBulkToggleServicesInSelectedZone(true)}
                              isLoading={isTogglingSingleZone}
                            >
                              Enable All in Zone
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<MdClear />}
                              onClick={() => handleBulkToggleServicesInSelectedZone(false)}
                              isLoading={isTogglingSingleZone}
                            >
                              Disable All in Zone
                            </Button>
                          </HStack>
                        </Flex>
                      );
                    })()}

                    {/* Multi-Service Batch Actions Bar (when not filtering a single zone) */}
                    {!(matrixDistrictFilter !== "ALL" && matrixZoneFilter !== "ALL") && selectedMatrixServiceIds.length > 0 && (
                      <Flex
                        px={3.5}
                        py={2}
                        bg="teal.50"
                        borderBottom="1px solid"
                        borderColor="teal.200"
                        align="center"
                        justify="space-between"
                        flexWrap="wrap"
                        gap={2}
                        flexShrink={0}
                      >
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="teal" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                            {selectedMatrixServiceIds.length} Services Selected
                          </Badge>
                          <Button
                            size="xs"
                            colorScheme="green"
                            leftIcon={<MdCheckCircle />}
                            onClick={() => handleBulkToggleServiceStatus(true)}
                            isLoading={isBatchMatrixLoading}
                          >
                            Activate Globally
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<MdClear />}
                            onClick={() => handleBulkToggleServiceStatus(false)}
                            isLoading={isBatchMatrixLoading}
                          >
                            Deactivate Globally
                          </Button>
                        </HStack>

                        <HStack spacing={2} flexWrap="wrap">
                          <Select
                            size="xs"
                            w="190px"
                            borderRadius="6px"
                            bg="white"
                            placeholder="Select District..."
                            value={batchMatrixDistrictId}
                            onChange={(e) => setBatchMatrixDistrictId(e.target.value)}
                            border="1px solid"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                          >
                            {districts.map((d) => (
                              <option key={d._id} value={d._id}>{d.name} ({d.city})</option>
                            ))}
                          </Select>
                          <Button
                            size="xs"
                            variant="brand"
                            isDisabled={!batchMatrixDistrictId}
                            onClick={() => handleBulkEnableServicesForDistrict(batchMatrixDistrictId, true)}
                            isLoading={isBatchMatrixLoading}
                          >
                            Enable in District
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            isDisabled={!batchMatrixDistrictId}
                            onClick={() => handleBulkEnableServicesForDistrict(batchMatrixDistrictId, false)}
                            isLoading={isBatchMatrixLoading}
                          >
                            Disable in District
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="gray.500"
                            onClick={() => setSelectedMatrixServiceIds([])}
                          >
                            Clear
                          </Button>
                        </HStack>
                      </Flex>
                    )}

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
                          {matrixDistrictFilter !== "ALL" && matrixZoneFilter !== "ALL" ? (
                            <Tr>
                              <Th bg="gray.50" py={3} w="36px" textAlign="center">
                                <Checkbox
                                  colorScheme="teal"
                                  size="sm"
                                  isChecked={
                                    currentMatrixData.length > 0 &&
                                    currentMatrixData.every((m) => selectedMatrixServiceIds.includes(m.serviceId))
                                  }
                                  isIndeterminate={
                                    currentMatrixData.some((m) => selectedMatrixServiceIds.includes(m.serviceId)) &&
                                    !currentMatrixData.every((m) => selectedMatrixServiceIds.includes(m.serviceId))
                                  }
                                  onChange={handleSelectAllMatrix}
                                />
                              </Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">CATEGORY</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">SERVICE</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">DISTRICT</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">SCREENED ZONE</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">AVAILABILITY IN ZONE</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="center" whiteSpace="nowrap">TOGGLE IN ZONE</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                            </Tr>
                          ) : (
                            <Tr>
                              <Th bg="gray.50" py={3} w="36px" textAlign="center">
                                <Checkbox
                                  colorScheme="teal"
                                  size="sm"
                                  isChecked={
                                    currentMatrixData.length > 0 &&
                                    currentMatrixData.every((m) => selectedMatrixServiceIds.includes(m.serviceId))
                                  }
                                  isIndeterminate={
                                    currentMatrixData.some((m) => selectedMatrixServiceIds.includes(m.serviceId)) &&
                                    !currentMatrixData.every((m) => selectedMatrixServiceIds.includes(m.serviceId))
                                  }
                                  onChange={handleSelectAllMatrix}
                                />
                              </Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">CATEGORY</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">SERVICE</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">DISTRICTS</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">ACTIVE ZONES</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">INACTIVE ZONES</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">STATUS</Th>
                              <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                            </Tr>
                          )}
                        </Thead>
                        <Tbody>
                          {currentMatrixData.length === 0 ? (
                            <Tr><Td colSpan={9} textAlign="center" py={10} color="gray.500">No services found matching filters.</Td></Tr>
                          ) : (
                            currentMatrixData.map((item, idx) => {
                              if (matrixDistrictFilter !== "ALL" && matrixZoneFilter !== "ALL") {
                                const isZoneActive = isServiceActiveInZone(item.serviceId, matrixZoneFilter);
                                const currentDist = districts.find((d) => String(d._id) === String(matrixDistrictFilter));
                                const currentZone = zones.find((z) => String(z._id || z.zoneId || z.id) === String(matrixZoneFilter));

                                return (
                                  <Tr key={item.serviceId || idx}>
                                    <Td py={3} textAlign="center">
                                      <Checkbox
                                        colorScheme="teal"
                                        size="sm"
                                        isChecked={selectedMatrixServiceIds.includes(item.serviceId)}
                                        onChange={() => handleToggleMatrixServiceSelection(item.serviceId)}
                                      />
                                    </Td>
                                    <Td fontWeight="600" color="gray.400" py={3}>{indexOfFirstItem + idx + 1}</Td>
                                    <Td py={3}>
                                      <Tag size="sm" colorScheme="purple" borderRadius="6px" fontWeight="600">
                                        {item.categoryName || "Uncategorized"}
                                      </Tag>
                                    </Td>
                                    <Td fontWeight="700" color={INK} py={3}>{item.serviceName}</Td>
                                    <Td py={3}>
                                      <Tag size="sm" colorScheme="blue" borderRadius="6px" fontWeight="600">
                                        {currentDist?.name || "District"}
                                      </Tag>
                                    </Td>
                                    <Td py={3}>
                                      <Tag size="sm" colorScheme="teal" borderRadius="6px" fontWeight="700">
                                        📍 {currentZone?.name || "Zone"}
                                      </Tag>
                                    </Td>
                                    <Td py={3}>
                                      <Badge colorScheme={isZoneActive ? "green" : "gray"} px={2.5} py={0.5} borderRadius="full" fontWeight="700">
                                        {isZoneActive ? "Active in Zone" : "Disabled in Zone"}
                                      </Badge>
                                    </Td>
                                    <Td py={3} textAlign="center">
                                      <Switch
                                        size="sm"
                                        colorScheme="teal"
                                        isChecked={isZoneActive}
                                        isDisabled={isTogglingSingleZone}
                                        onChange={() => handleToggleSingleServiceInSelectedZone(item.serviceId, isZoneActive, item.serviceName)}
                                      />
                                    </Td>
                                    <Td py={3} textAlign="right">
                                      <Button
                                        size="xs"
                                        variant="brand"
                                        borderRadius="6px"
                                        leftIcon={<MdEdit />}
                                        onClick={() => handleOpenManageServiceModal(item.serviceId)}
                                      >
                                        Configure Zones
                                      </Button>
                                    </Td>
                                  </Tr>
                                );
                              }

                              return (
                                <Tr key={item.serviceId || idx}>
                                  <Td py={3} textAlign="center">
                                    <Checkbox
                                      colorScheme="teal"
                                      size="sm"
                                      isChecked={selectedMatrixServiceIds.includes(item.serviceId)}
                                      onChange={() => handleToggleMatrixServiceSelection(item.serviceId)}
                                    />
                                  </Td>
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
                                      variant="brand"
                                      borderRadius="6px"
                                      leftIcon={<MdEdit />}
                                      onClick={() => handleOpenManageServiceModal(item.serviceId)}
                                    >
                                      Manage Mappings
                                    </Button>
                                  </Td>
                                </Tr>
                              );
                            })
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* TAB 3: TECHNICIAN DISTRICT PERMISSIONS (DISTRICT-ONLY COVERAGE) */}
                  <TabPanel p={0} display="flex" flexDirection="column" flex="1" minH="0" overflow="hidden">
                    {/* District Authorization Scope Banner */}
                    <Box px={4} py={2.5} bg="purple.50" borderBottom="1px solid" borderColor="purple.200" flexShrink={0}>
                      <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
                        <HStack spacing={2}>
                          <Icon as={MdLocationCity} color="purple.700" boxSize={4} />
                          <Text fontSize="xs" fontWeight="700" color="purple.900">
                            Technician Dispatch Permissions:
                          </Text>
                          <Text fontSize="xs" color="purple.800">
                            Technicians are authorized exclusively by District coverage and operating radius. Micro-zones do not restrict technician assignments.
                          </Text>
                        </HStack>
                        <Badge colorScheme="purple" fontSize="10px" px={2.5} py={0.5} borderRadius="full" fontWeight="700">
                          District-Level Authorization Only
                        </Badge>
                      </Flex>
                    </Box>

                    {/* Multi-Technician Batch Actions Bar */}
                    {selectedTechIds.length > 0 && (
                      <Flex
                        px={3.5}
                        py={2}
                        bg="purple.50"
                        borderBottom="1px solid"
                        borderColor="purple.200"
                        align="center"
                        justify="space-between"
                        flexWrap="wrap"
                        gap={2}
                        flexShrink={0}
                      >
                        <HStack spacing={2.5} flexWrap="wrap">
                          <Badge colorScheme="purple" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                            {selectedTechIds.length} Technicians Selected
                          </Badge>
                          <Button
                            size="xs"
                            colorScheme="green"
                            leftIcon={<MdVerified />}
                            onClick={() => handleBatchVerifyGps("APPROVE")}
                            isLoading={isBatchTechLoading}
                          >
                            Approve GPS
                          </Button>
                        </HStack>

                        <HStack spacing={2} flexWrap="wrap">
                          <Select
                            size="xs"
                            w="180px"
                            borderRadius="6px"
                            bg="white"
                            placeholder="Grant District Hub..."
                            value={batchTechDistrictId}
                            onChange={(e) => setBatchTechDistrictId(e.target.value)}
                            border="1px solid"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                          >
                            {districts.map((d) => (
                              <option key={d._id} value={d._id}>{d.name} ({d.city})</option>
                            ))}
                          </Select>
                          <Button
                            size="xs"
                            colorScheme="purple"
                            isDisabled={!batchTechDistrictId}
                            onClick={handleBatchGrantDistrictPermission}
                            isLoading={isBatchTechLoading}
                          >
                            Grant Permission
                          </Button>

                          <HStack spacing={1}>
                            <Input
                              size="xs"
                              w="55px"
                              bg="white"
                              borderRadius="6px"
                              placeholder="KM"
                              value={batchTechRadius}
                              onChange={(e) => setBatchTechRadius(e.target.value)}
                            />
                            <Button
                              size="xs"
                              colorScheme="blue"
                              onClick={handleBatchUpdateRadius}
                              isLoading={isBatchTechLoading}
                            >
                              Set Radius
                            </Button>
                          </HStack>

                          <Button
                            size="xs"
                            variant="ghost"
                            color="gray.500"
                            onClick={() => setSelectedTechIds([])}
                          >
                            Clear
                          </Button>
                        </HStack>
                      </Flex>
                    )}

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
                            <Th bg="gray.50" py={3} w="36px" textAlign="center">
                              <Checkbox
                                colorScheme="purple"
                                size="sm"
                                isChecked={
                                  currentTechnicians.length > 0 &&
                                  currentTechnicians.every((t) => selectedTechIds.includes(t._id))
                                }
                                isIndeterminate={
                                  currentTechnicians.some((t) => selectedTechIds.includes(t._id)) &&
                                  !currentTechnicians.every((t) => selectedTechIds.includes(t._id))
                                }
                                onChange={handleSelectAllTechs}
                              />
                            </Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">#</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">TECHNICIAN</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PHONE</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">PRIMARY DISTRICT</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">ASSIGNED DISTRICT COVERAGE</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">SERVICE RADIUS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" whiteSpace="nowrap">GEOFENCE STATUS</Th>
                            <Th bg="gray.50" color="gray.500" py={3} fontSize="10px" textAlign="right" whiteSpace="nowrap">ACTIONS</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentTechnicians.length === 0 ? (
                            <Tr><Td colSpan={9} textAlign="center" py={10} color="gray.500">No technicians found.</Td></Tr>
                          ) : (
                            currentTechnicians.map((tech, idx) => {
                              const techName = (tech.fname || tech.lname)
                                ? `${tech.fname || ""} ${tech.lname || ""}`.trim()
                                : (tech.userId?.fname || tech.userId?.lname ? `${tech.userId?.fname || ""} ${tech.userId?.lname || ""}`.trim() : (tech.name || "Technician"));

                              const techPhone = tech.mobileNumber || tech.phone || tech.userId?.mobileNumber || tech.userId?.phone || tech.userId?.identifier || "N/A";
                              const primaryCityName = tech.primaryDistrictId?.name || tech.primaryCityId?.name || tech.city || null;
                              const primaryDistName = primaryCityName || "Not Assigned";
                              const isVerified = tech.isLocationVerified !== false;
                              const permissions = getTechPermissionDistricts(tech);

                              return (
                                <Tr key={tech._id}>
                                  <Td py={3} textAlign="center">
                                    <Checkbox
                                      colorScheme="purple"
                                      size="sm"
                                      isChecked={selectedTechIds.includes(tech._id)}
                                      onChange={() => handleToggleTechSelection(tech._id)}
                                    />
                                  </Td>
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
                                      <Badge colorScheme="red" variant="subtle" fontSize="10px" px={2} py={0.5} borderRadius="full">
                                        No Coverage
                                      </Badge>
                                    ) : (
                                      <HStack spacing={1} flexWrap="wrap">
                                        <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                          {permissions.length} District{permissions.length === 1 ? "" : "s"}
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
                                        variant="brand"
                                        borderRadius="6px"
                                        leftIcon={<MdPersonAdd />}
                                        onClick={() => handleOpenTechPermissions(tech)}
                                      >
                                        District Permissions
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="purple"
                                        variant="outline"
                                        borderRadius="6px"
                                        leftIcon={<MdGpsFixed />}
                                        onClick={() => handleOpenTechGeofenceModal(tech)}
                                      >
                                        GPS & Radius
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
                        { icon: MdVerified, label: "Spatial Boundary & GeoJSON Validator" },
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
                            variant="brand"
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
                              bg="white"
                              border="1px solid"
                              borderColor="gray.300"
                              _hover={{ borderColor: "gray.400" }}
                              _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
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
                            {/* F-01A: honest failure states — failed dashboard/impact
                                requests render as errors, never as healthy data. */}
                            {districtDashboardError && (
                              <Box p={3} bg="red.50" borderRadius="10px" border="1px solid" borderColor="red.200">
                                <Text fontSize="xs" fontWeight="700" color="red.700">Dashboard unavailable: {districtDashboardError}</Text>
                              </Box>
                            )}
                            {impactAnalysisError && (
                              <Box p={3} bg="red.50" borderRadius="10px" border="1px solid" borderColor="red.200">
                                <Text fontSize="xs" fontWeight="700" color="red.700">Impact analysis unavailable: {impactAnalysisError}</Text>
                              </Box>
                            )}
                            {/* Live Metrics Grid */}
                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={3}>
                              <Box p={3} bg="teal.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Active Technicians</Text>
                                <Text fontSize="xl" fontWeight="700" color={BRAND}>{districtDashboardError ? "—" : (districtDashboardData?.metrics?.techniciansCount ?? technicians.length)}</Text>
                              </Box>
                              <Box p={3} bg="blue.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Today's Active Bookings</Text>
                                <Text fontSize="xl" fontWeight="700" color="blue.700">{districtDashboardError ? "—" : (districtDashboardData?.metrics?.activeJobsCount ?? 0)}</Text>
                              </Box>
                              <Box p={3} bg="purple.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">Active Micro-Zones</Text>
                                <Text fontSize="xl" fontWeight="700" color="purple.700">{districtDashboardError ? "—" : (districtDashboardData?.metrics?.cityZonesCount ?? zones.filter(z => z.operationalCityId === selectedDashboardDistrictId).length)}</Text>
                              </Box>
                              <Box p={3} bg="green.50" borderRadius="10px">
                                <Text fontSize="xs" color="gray.600">District Health</Text>
                                <Text fontSize="xl" fontWeight="700" color="green.700">{districtDashboardError ? "—" : (districtDashboardData?.metrics?.healthStatus === "HEALTHY" ? "Healthy" : (districtDashboardData?.metrics?.healthStatus || "—"))}</Text>
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
                                  <Text fontWeight="700" color="purple.700">{impactAnalysisError ? "—" : `${impactAnalysisData?.impactSummary?.affectedTechnicians ?? 0} Techs`}</Text>
                                </Box>
                                <Box p={2} bg="white" borderRadius="6px">
                                  <Text color="gray.500">Active Jobs In Range</Text>
                                  <Text fontWeight="700" color="blue.700">{impactAnalysisError ? "—" : `${impactAnalysisData?.impactSummary?.activeJobsCount ?? 0} Bookings`}</Text>
                                </Box>
                                <Box p={2} bg="white" borderRadius="6px">
                                  <Text color="gray.500">Affected Services</Text>
                                  <Text fontWeight="700" color="green.700">{impactAnalysisError ? "—" : `${impactAnalysisData?.impactSummary?.affectedServices ?? 0} Services`}</Text>
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
                            districts={createdDistrictsList}
                            allDistricts={createdDistrictsList}
                            zones={zones}
                            allZones={zones}
                            technicians={technicians}
                            height="380px"
                            mode="view"
                            showToolbar={true}
                            showSearch={true}
                            onlyTamilNadu={true}
                            onSelectDistrict={(dist) => {
                              handleSelectDistrictFromMap(dist);
                              const distId = dist?._id;
                              if (distId) {
                                setSelectedDistrictFilter(distId);
                              }
                            }}
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
                              <Select size="sm" borderRadius="8px" value={diagTechId} onChange={(e) => setDiagTechId(e.target.value)}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                              >
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
                            <Button size="sm" variant="brand" onClick={handleRunEligibilityDiagnostics} isLoading={isDiagnosing}>
                              Run 12-Step Audit
                            </Button>
                          </VStack>

                          {diagResult && (
                            <Box mt={3} p={3} bg="gray.50" borderRadius="8px" borderLeft="4px solid" borderColor={diagResult.eligibility?.eligible ? "green.400" : "red.400"}>
                              <Text fontSize="xs" fontWeight="700">Outcome: {diagResult.eligibility?.eligible ? "ELIGIBLE FOR DISPATCH" : "INELIGIBLE"}</Text>
                              <Text fontSize="xs" color="gray.600">Calculated Distance: {diagResult.distance?.error ? `unavailable (${diagResult.distance.error})` : `${diagResult.distance?.calculatedDistanceKm ?? "—"} KM`}</Text>
                              {(diagResult.eligibility?.reasons || []).length > 0 && (
                                <Text fontSize="xs" color="gray.600">Reasons: {diagResult.eligibility.reasons.join(", ")}</Text>
                              )}
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
                                Service: {jobLocationInspectData.serviceName || "—"}
                              </Text>
                              <Text fontSize="xs" color="purple.700">
                                Customer: {jobLocationInspectData.customerName || "—"}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                Location: {jobLocationInspectData.customerLocation ? `${jobLocationInspectData.customerLocation.latitude}, ${jobLocationInspectData.customerLocation.longitude}` : "—"}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                Nearby Technicians: {(jobLocationInspectData.techMarkers || []).length}
                              </Text>
                              {(jobLocationInspectData.techMarkers || []).slice(0, 5).map((t, i) => (
                                <Text key={i} fontSize="xs" color="gray.600">
                                  {t.name || t.technicianId} — {t.distanceKm != null ? `${t.distanceKm} km` : "—"} — {t.eligible ? "eligible" : `ineligible (${(t.reasons || []).join(", ") || "unknown reason"})`}
                                </Text>
                              ))}
                            </VStack>
                          )}
                          {broadcastAuditData && (
                            <VStack spacing={2} align="stretch" p={3} bg="gray.50" borderRadius="8px">
                              <Text fontSize="xs" fontWeight="700" color="gray.800">
                                Broadcast Audit: {(broadcastAuditData.broadcastAudit || []).length} attempt(s) — status: {broadcastAuditData.status || "—"}
                              </Text>
                              {(broadcastAuditData.broadcastAudit || []).length === 0 ? (
                                <Text fontSize="xs" color="gray.500">No dispatch attempts recorded for this booking.</Text>
                              ) : (
                                (broadcastAuditData.broadcastAudit || []).slice(0, 8).map((a, i) => (
                                  <Text key={i} fontSize="xs" color="gray.600">
                                    Attempt {a.attemptNumber ?? i + 1}: {a.status || "—"}{a.releaseReason ? ` (${a.releaseReason})` : ""}
                                  </Text>
                                ))
                              )}
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
                                variant="brand-outline"
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
                                bg="white"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
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
                              variant="brand"
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
                                <FormLabel fontSize="xs" fontWeight="600">Technician</FormLabel>
                                <Select size="sm" borderRadius="8px" value={debugTechId} onChange={(e) => setDebugTechId(e.target.value)}
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  _hover={{ borderColor: "gray.400" }}
                                  _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                                >
                                  <option value="">Select Technician...</option>
                                  {technicians.map((t) => (
                                    <option key={t._id} value={t._id}>
                                      {t.fname} {t.lname} ({t.mobileNumber || "No Phone"})
                                    </option>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">District (Optional)</FormLabel>
                                <Select size="sm" borderRadius="8px" value={debugDistrictId} onChange={(e) => setDebugDistrictId(e.target.value)}
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  _hover={{ borderColor: "gray.400" }}
                                  _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                                >
                                  <option value="">All Districts...</option>
                                  {districts.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Service (Optional)</FormLabel>
                                <Select size="sm" borderRadius="8px" value={debugServiceId} onChange={(e) => setDebugServiceId(e.target.value)}
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  _hover={{ borderColor: "gray.400" }}
                                  _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                                >
                                  <option value="">All Services in District</option>
                                  {services.map((s) => (
                                    <option key={s._id} value={s._id}>{s.serviceName || s.name}</option>
                                  ))}
                                </Select>
                              </FormControl>
                              <Button size="sm" variant="brand" onClick={handleRunDispatchDebug} isLoading={isLoadingDispatchDebug}>
                                Run Dispatch Diagnostics
                              </Button>
                            </VStack>

                            {dispatchDebugData && (
                              <Box mt={3} p={3} bg="gray.50" borderRadius="8px" borderLeft="4px solid" borderColor={dispatchDebugData.eligibility?.eligible ? "green.400" : "red.400"}>
                                <Text fontSize="xs" fontWeight="700" color="teal.800">Diagnostics Result:</Text>
                                <Text fontSize="xs" color="gray.600" mt={1}>
                                  Outcome: {dispatchDebugData.eligibility?.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                                </Text>
                                {(dispatchDebugData.eligibility?.reasons || []).length > 0 && (
                                  <Text fontSize="xs" color="gray.600" mt={1}>
                                    Reasons: {dispatchDebugData.eligibility.reasons.join(", ")}
                                  </Text>
                                )}
                                {dispatchDebugData.technician && (
                                  <Text fontSize="xs" color="gray.600" mt={1}>
                                    Technician: {dispatchDebugData.technician.workStatus || "—"} · {dispatchDebugData.technician.isOnline ? "Online" : "Offline"}
                                  </Text>
                                )}
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
                                <FormLabel fontSize="xs" fontWeight="600">Entity Type</FormLabel>
                                <Select size="sm" borderRadius="8px" value={rollbackEntityType} onChange={(e) => { setRollbackEntityType(e.target.value); setRollbackEntityId(""); }}
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  _hover={{ borderColor: "gray.400" }}
                                  _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                                >
                                  <option value="DISTRICT">District</option>
                                  <option value="CITY_ZONE">Micro-Zone</option>
                                </Select>
                              </FormControl>
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">Target {rollbackEntityType === "CITY_ZONE" ? "Micro-Zone" : "District"}</FormLabel>
                                <Select size="sm" borderRadius="8px" value={rollbackEntityId} onChange={(e) => setRollbackEntityId(e.target.value)}
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  _hover={{ borderColor: "gray.400" }}
                                  _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                                >
                                  <option value="">Select {rollbackEntityType === "CITY_ZONE" ? "Micro-Zone" : "District"} to Rollback...</option>
                                  {(rollbackEntityType === "CITY_ZONE" ? zones : districts).map((d) => (
                                    <option key={d._id} value={d._id}>{d.name || d.zoneCode}</option>
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

                    {/* SUB 5: SPATIAL BOUNDARY & GEOJSON INTEGRITY VALIDATOR */}
                    {subDiagnosticsTab === 5 && (
                      <Box bg="white" p={4} border="1px solid" borderColor={SURFACE_BORDER} borderRadius="12px">
                        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                          <Box>
                            <HStack spacing={2}>
                              <Icon as={MdVerified} color="teal.500" boxSize={5} />
                              <Heading size="xs" color={BRAND} textTransform="uppercase" letterSpacing="0.5px">
                                Spatial Boundary &amp; GeoJSON RFC 7946 Validator
                              </Heading>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Deep spatial verification of coordinates, ring closure, parent district boundary containment, and micro-zone overlap detection.
                            </Text>
                          </Box>

                          <HStack spacing={2} flexWrap="wrap">
                            <Button
                              size="xs"
                              variant="brand-outline"
                              onClick={() => {
                                const c = TAMIL_NADU_CITIES[0];
                                const poly = generateCircularGeoJSON(c.lat, c.lng, 10);
                                replaceGeoToolDraft(JSON.stringify(poly, null, 2), "the Coimbatore preset");
                                const matchingDist = districts.find(d => (d.city || "").toLowerCase() === c.name.toLowerCase());
                                if (matchingDist) setGeoToolDistrictId(matchingDist._id);
                              }}
                            >
                              Preset: Coimbatore 10KM
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="purple"
                              onClick={() => {
                                const c = TAMIL_NADU_CITIES.find(x => x.name === "Chennai") || TAMIL_NADU_CITIES[1];
                                const poly = generateCircularGeoJSON(c.lat, c.lng, 10);
                                replaceGeoToolDraft(JSON.stringify(poly, null, 2), "the Chennai preset");
                                const matchingDist = districts.find(d => (d.city || "").toLowerCase() === c.name.toLowerCase());
                                if (matchingDist) setGeoToolDistrictId(matchingDist._id);
                              }}
                            >
                              Preset: Chennai 10KM
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => {
                                replaceGeoToolDraft("", "an empty canvas");
                              }}
                            >
                              Clear
                            </Button>
                          </HStack>
                        </Flex>

                        <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }} gap={4}>
                          {/* Left: Input Form */}
                          <VStack spacing={3} align="stretch">
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="600" color="gray.700">
                                Parent Operational District (Containment Scope)
                              </FormLabel>
                              <Select
                                size="sm"
                                borderRadius="8px"
                                placeholder="Select District to test containment & overlap..."
                                value={geoToolDistrictId}
                                onChange={(e) => {
                                  setGeoToolDistrictId(e.target.value);
                                  const d = districts.find(x => x._id === e.target.value);
                                  if (d && d.polygon) {
                                    replaceGeoToolDraft(typeof d.polygon === "string" ? d.polygon : JSON.stringify(d.polygon, null, 2), `the ${d.name || "district"} boundary`);
                                  }
                                }}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                              >
                                {districts.map((d) => (
                                  <option key={d._id} value={d._id}>
                                    {d.name} ({d.city}) — {d.polygon ? "Boundary Active" : "No Boundary"}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl isRequired>
                              <Flex justify="space-between" align="center" mb={1}>
                                <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={0}>
                                  GeoJSON Geometry (Polygon / MultiPolygon)
                                </FormLabel>
                                <Badge colorScheme={geoToolPolygon?.trim() ? "teal" : "gray"} fontSize="10px">
                                  {geoToolPolygon?.trim() ? "JSON Ready" : "Empty"}
                                </Badge>
                                {geoToolDirty && (
                                  <Badge colorScheme="orange" fontSize="10px" title="Draft differs from the last loaded baseline">
                                    Unsaved changes
                                  </Badge>
                                )}
                              </Flex>
                              <Textarea
                                rows={10}
                                fontFamily="mono"
                                fontSize="11px"
                                borderRadius="8px"
                                bg="gray.50"
                                value={geoToolPolygon}
                                onChange={(e) => setGeoToolPolygon(e.target.value)}
                                placeholder='{"type": "Polygon", "coordinates": [[[80.20, 12.97], ...]]}'
                              />
                            </FormControl>

                            <Button
                              size="sm"
                              variant="brand"
                              leftIcon={<MdOutlineFactCheck />}
                              onClick={handleValidateGeoJSONTool}
                              isLoading={isValidatingGeo}
                              borderRadius="8px"
                            >
                              Run Comprehensive Boundary Audit
                            </Button>
                          </VStack>

                          {/* Right: Diagnostic Scorecard */}
                          <Box p={4} bg="gray.50" borderRadius="10px" border="1px solid" borderColor="gray.200">
                            <Heading size="xs" color="gray.700" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                              Spatial Verification Results
                            </Heading>

                            {!geoValidationResult ? (
                              <Flex h="220px" justify="center" align="center" direction="column" color="gray.400">
                                <Icon as={MdVerified} boxSize={8} mb={2} />
                                <Text fontSize="xs">Paste GeoJSON and click "Run Audit" to test integrity.</Text>
                              </Flex>
                            ) : (
                              <VStack spacing={3} align="stretch">
                                {/* 1. GeoJSON RFC 7946 Syntax */}
                                <Box p={3} bg="white" borderRadius="8px" border="1px solid" borderColor={geoValidationResult.validation?.isValid !== false ? "green.200" : "red.200"}>
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="xs" fontWeight="700" color="gray.800">
                                      1. GeoJSON Syntax &amp; Ring Closure
                                    </Text>
                                    <Badge colorScheme={geoValidationResult.validation?.isValid !== false ? "green" : "red"}>
                                      {geoValidationResult.validation?.isValid !== false ? "PASS — VALID RFC 7946" : "FAIL — INVALID SYNTAX"}
                                    </Badge>
                                  </Flex>
                                  <Text fontSize="11px" color="gray.600" mt={1}>
                                    {geoValidationResult.validation?.error || "All coordinate arrays form a valid closed polygon ring with correct vertex sequence."}
                                  </Text>
                                </Box>

                                {/* 2. Boundary Containment */}
                                <Box p={3} bg="white" borderRadius="8px" border="1px solid" borderColor={geoValidationResult.containment?.error ? "red.200" : (geoValidationResult.containment ? (geoValidationResult.containment.isContained == null ? "gray.200" : (geoValidationResult.containment.isContained !== false ? "green.200" : "orange.200")) : "gray.200")}>
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="xs" fontWeight="700" color="gray.800">
                                      2. District Boundary Containment
                                    </Text>
                                    <Badge colorScheme={geoValidationResult.containment?.error ? "red" : (!geoToolDistrictId ? "gray" : (geoValidationResult.containment?.isContained == null ? "gray" : (geoValidationResult.containment?.isContained !== false ? "green" : "orange")))}>
                                      {geoValidationResult.containment?.error ? "CHECK FAILED" : (!geoToolDistrictId ? "NO DISTRICT SELECTED" : (geoValidationResult.containment?.isContained == null ? "NOT EVALUATED — FIX GEOMETRY" : (geoValidationResult.containment?.isContained !== false ? "INSIDE BOUNDARY" : "EXTENDS OUTSIDE")))}
                                    </Badge>
                                  </Flex>
                                  <Text fontSize="11px" color="gray.600" mt={1}>
                                    {geoValidationResult.containment?.error || (!geoToolDistrictId ? "Select a parent district above to verify boundary containment." : (geoValidationResult.containment?.message || (geoValidationResult.containment?.isContained == null ? "Containment not evaluated — fix invalid geometry first." : "Polygon completely contained within district limits.")))}
                                  </Text>
                                </Box>

                                {/* 3. Micro-Zone Overlap Conflict */}
                                <Box p={3} bg="white" borderRadius="8px" border="1px solid" borderColor={geoValidationResult.overlap?.error ? "red.200" : (geoValidationResult.overlap ? (geoValidationResult.overlap.hasOverlap == null ? "gray.200" : (geoValidationResult.overlap.hasOverlap ? "red.200" : "green.200")) : "gray.200")}>
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="xs" fontWeight="700" color="gray.800">
                                      3. Sibling Zone Overlap Conflict
                                    </Text>
                                    <Badge colorScheme={geoValidationResult.overlap?.error ? "red" : (!geoToolDistrictId ? "gray" : (geoValidationResult.overlap?.hasOverlap == null ? "gray" : (geoValidationResult.overlap?.hasOverlap ? "red" : "green")))}>
                                      {geoValidationResult.overlap?.error ? "CHECK FAILED" : (!geoToolDistrictId ? "NOT EVALUATED" : (geoValidationResult.overlap?.hasOverlap == null ? "NOT EVALUATED — FIX GEOMETRY" : (geoValidationResult.overlap?.hasOverlap ? "OVERLAP CONFLICT" : "NO OVERLAP DETECTED")))}
                                    </Badge>
                                  </Flex>
                                  <Text fontSize="11px" color="gray.600" mt={1}>
                                    {geoValidationResult.overlap?.error || (!geoToolDistrictId ? "Select a parent district to scan for micro-zone conflicts." : (geoValidationResult.overlap?.message || (geoValidationResult.overlap?.hasOverlap == null ? "Overlap not evaluated — fix invalid geometry first." : "No territorial overlaps detected with neighboring micro-zones.")))}
                                  </Text>
                                </Box>

                                {/* Vertex Count & Geometry Summary */}
                                {geoValidationResult.parsed?.coordinates?.[0] && (
                                  <HStack p={2.5} bg="teal.50" borderRadius="8px" justify="space-between" fontSize="11px">
                                    <Text color="teal.800" fontWeight="600">
                                      Total Vertices: {geoValidationResult.parsed.coordinates[0].length} points
                                    </Text>
                                    <Text color="teal.700">
                                      First Point: [{geoValidationResult.parsed.coordinates[0][0]?.[0]?.toFixed(4)}, {geoValidationResult.parsed.coordinates[0][0]?.[1]?.toFixed(4)}]
                                    </Text>
                                  </HStack>
                                )}
                              </VStack>
                            )}
                          </Box>
                        </Grid>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {/* Pagination Footer */}
              {activeTab <= 3 && activeTabItemCount > 0 && (
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
                        border="1px solid"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
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

        {/* CREATE / EDIT DISTRICT MODAL WITH FULL TAMIL NADU LEAFLET MAP */}
        <Modal isOpen={isDistrictModalOpen} onClose={handleCloseDistrictModal} size="full">
          <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
          <ModalContent
            bg="white"
            borderRadius="16px"
            maxW="96vw"
            h="92vh"
            maxH="92vh"
            m="auto"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.4)"
            zIndex={1401}
          >
            <ModalHeader
              bg="white"
              px={6}
              py={3.5}
              borderBottom="1px solid"
              borderColor="gray.200"
            >
              <Flex align="center" justify="space-between" pr={8}>
                <HStack spacing={3}>
                  <Box p={2.5} bg="teal.500" color="white" borderRadius="10px" boxShadow="0 2px 8px rgba(0, 128, 128, 0.3)">
                    <Icon as={MdApartment} boxSize={5} />
                  </Box>
                  <Box>
                    <HStack spacing={2} align="center">
                      <Text fontSize="md" fontWeight="800" color="gray.800">
                        {isEditingDistrict ? "Edit Operational District" : "Add New Operational District"}
                      </Text>
                      {districtTnName ? (
                        <Badge colorScheme="teal" fontSize="11px" borderRadius="full" px={2.5} py={0.5}>
                          📍 {districtTnName}
                        </Badge>
                      ) : (
                        <Badge colorScheme="cyan" fontSize="10px" borderRadius="full" px={2} py={0.5}>
                          Tamil Nadu Map
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">
                      Click any district on the Tamil Nadu map to auto-fill its official Survey of India boundary geofence and hub city.
                    </Text>
                  </Box>
                </HStack>
              </Flex>
            </ModalHeader>
            <ModalCloseButton top={3.5} right={4} />

            <ModalBody p={4} flex="1" overflow="hidden" display="flex" flexDirection="column">
              {/* Inline Error Alert Banner */}
              {districtModalError && (
                <Flex
                  align="center"
                  bg="red.50"
                  border="1.5px solid"
                  borderColor="red.400"
                  color="red.800"
                  px={4}
                  py={2.5}
                  borderRadius="10px"
                  mb={3}
                  justify="space-between"
                  boxShadow="xs"
                >
                  <HStack spacing={3} align="center">
                    <Icon as={MdErrorOutline} boxSize={5} color="red.600" flexShrink={0} />
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="red.800">
                        Cannot Save District
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

              <Grid
                templateColumns={{ base: "1fr", xl: "360px 1fr" }}
                gap={4}
                alignItems="stretch"
                flex="1"
                h="100%"
                overflow="hidden"
              >
                {/* Left Column: Essential District Details */}
                <VStack
                  spacing={3.5}
                  align="stretch"
                  w={{ base: "100%", xl: "360px" }}
                  h="100%"
                  overflowY="auto"
                  pr={1}
                >
                  <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                    <Flex align="center" gap={2} mb={3.5} pb={2} borderBottom="1px solid" borderColor="gray.100">
                      <Icon as={MdApartment} color={BRAND} boxSize={4} />
                      <Text fontSize="xs" fontWeight="700" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                        District General Info
                      </Text>
                    </Flex>

                    <VStack spacing={3} align="stretch">
                      {/* Select Tamil Nadu District */}
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="700" color="teal.800" mb={1}>
                          Select Tamil Nadu District
                        </FormLabel>
                        <Select
                          size="sm"
                          value={districtTnName}
                          onChange={(e) => handlePickTnDistrict(e.target.value)}
                          borderRadius="8px"
                          fontWeight="700"
                          borderColor="teal.400"
                          bg="teal.50"
                          _focus={{ borderColor: "teal.600", bg: "white" }}
                        >
                          <option value="">-- Choose or click map --</option>
                          {TAMIL_NADU_DISTRICTS.map((d) => (
                            <option key={d.name} value={d.name}>
                              📍 {d.name} ({d.code})
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* District Name */}
                      <FormControl isRequired isInvalid={!districtFormData.name && !!districtModalError}>
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
                          bg="white"
                        />
                      </FormControl>

                      {/* Default City / Hub */}
                      <FormControl isRequired isInvalid={!districtFormData.city && !!districtModalError}>
                        <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                          Default City / Hub
                        </FormLabel>
                        <Input
                          size="sm"
                          value={districtFormData.city}
                          onChange={(e) => {
                            setDistrictModalError("");
                            setDistrictFormData({ ...districtFormData, city: e.target.value });
                          }}
                          placeholder="e.g. Salem"
                          borderRadius="8px"
                          bg="white"
                        />
                      </FormControl>

                      {/* District Code & State */}
                      <Grid templateColumns="1fr 1fr" gap={2.5}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            District Code
                          </FormLabel>
                          <Input
                            size="sm"
                            value={districtFormData.code}
                            onChange={(e) => {
                              setDistrictModalError("");
                              setDistrictFormData({ ...districtFormData, code: e.target.value.toUpperCase() });
                            }}
                            placeholder="e.g. SLM"
                            borderRadius="8px"
                            textTransform="uppercase"
                            fontWeight="700"
                            bg="white"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            State
                          </FormLabel>
                          <Input
                            size="sm"
                            value={districtFormData.state}
                            isReadOnly
                            borderRadius="8px"
                            bg="gray.50"
                          />
                        </FormControl>
                      </Grid>
                    </VStack>
                  </Box>

                  {/* Operational Controls & Policies */}
                  <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                    <Text fontSize="xs" fontWeight="700" color="gray.700" mb={2.5} textTransform="uppercase" letterSpacing="0.5px">
                      Operational Controls
                    </Text>

                    <VStack spacing={2.5} align="stretch">
                      <Flex justify="space-between" align="center" p={2} bg="gray.50" borderRadius="8px">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="gray.800">District Active</Text>
                          <Text fontSize="10px" color="gray.500">Master operational switch</Text>
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
                          <Text fontSize="10px" color="gray.500">Permit tech registrations</Text>
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
                          <Text fontSize="10px" color="gray.500">Enable automatic dispatch</Text>
                        </Box>
                        <Switch
                          isChecked={districtFormData.isJobEnabled}
                          onChange={(e) => setDistrictFormData({ ...districtFormData, isJobEnabled: e.target.checked })}
                          colorScheme="purple"
                        />
                      </Flex>
                    </VStack>
                  </Box>

                  {/* Boundary Status Banner Card */}
                  <Box
                    p={3.5}
                    borderRadius="12px"
                    bg={districtFormData.polygonCoordinates ? "teal.50" : "orange.50"}
                    border="1px solid"
                    borderColor={districtFormData.polygonCoordinates ? "teal.300" : "orange.300"}
                  >
                    <HStack spacing={2.5} align="center" mb={1}>
                      <Icon
                        as={districtFormData.polygonCoordinates ? MdCheckCircle : MdWarning}
                        color={districtFormData.polygonCoordinates ? "teal.600" : "orange.500"}
                        boxSize={4}
                        flexShrink={0}
                      />
                      <Text fontSize="xs" fontWeight="700" color={districtFormData.polygonCoordinates ? "teal.900" : "orange.900"}>
                        {districtFormData.polygonCoordinates ? "Survey of India Boundary Ready" : "Select District on Map"}
                      </Text>
                    </HStack>
                    <Text fontSize="11px" color={districtFormData.polygonCoordinates ? "teal.800" : "orange.800"} lineHeight="1.4">
                      {districtFormData.polygonCoordinates
                        ? `Official Survey of India boundary loaded for ${districtTnName || districtFormData.name}. Coordinates linked to operational district.`
                        : "Click any district on the Tamil Nadu map to auto-fill its official boundary and hub city."}
                    </Text>
                  </Box>
                </VStack>

                {/* Right Column: Full Tamil Nadu Interactive Map */}
                <Box
                  bg="#0b111e"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="rgba(6, 182, 212, 0.3)"
                  boxShadow="md"
                  display="flex"
                  flexDirection="column"
                  minW={0}
                  flex="1"
                  h="100%"
                  overflow="hidden"
                  p={2}
                >
                  {isDistrictModalOpen && (
                    <ZoneMap
                      viewMode="state"
                      districtName={districtTnName || "Tamil Nadu"}
                      selectedDistrictName={districtTnName || ""}
                      polygonCoordinates={districtFormData.polygonCoordinates}
                      height="100%"
                      mode="view"
                      showSearch={true}
                      showDrawTools={false}
                      allowRadiusSelect={false}
                      showToolbar={true}
                      districts={districts}
                      allDistricts={allMergedDistricts}
                      onlyTamilNadu={true}
                      onSelectDistrict={(dist) => {
                        handlePickTnDistrict(dist.name || dist.city);
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </ModalBody>

            <ModalFooter
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              px={6}
              py={3}
              justifyContent="space-between"
            >
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  {districtTnName
                    ? `Selected: 📍 ${districtTnName}`
                    : "Click any district on the Tamil Nadu map"}
                </Text>
                {districtFormData.polygonCoordinates && (
                  <Badge colorScheme="teal" fontSize="10px">
                    Boundary Active
                  </Badge>
                )}
              </HStack>
              <HStack spacing={3}>
                <Button variant="ghost" size="sm" borderRadius="8px" onClick={handleCloseDistrictModal}>
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  borderRadius="8px"
                  onClick={handleSubmitDistrict}
                  isLoading={isSubmitting}
                  px={6}
                  leftIcon={<Icon as={MdCheckCircle} />}
                >
                  {isEditingDistrict ? "Save Changes" : "Create Operational District"}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* VIEW SINGLE DISTRICT LIVE MAP MODAL */}
        <Modal isOpen={isViewMapModalOpen} onClose={() => setIsViewMapModalOpen(false)} size="xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <ModalContent {...modalContentProps}>
            <ModalHeader {...modalHeaderProps}>
              Operational Range Map — {viewMapDistrict?.name} ({viewMapDistrict?.city})
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />
            <ModalBody {...modalBodyProps}>
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
            <ModalFooter {...modalFooterProps} justify="flex-end">
              <Button variant="ghost" size="sm" borderRadius="8px" onClick={() => setIsViewMapModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* VIEW DISTRICT TECHNICIANS MODAL */}
        <Modal isOpen={isDistrictTechModalOpen} onClose={() => setIsDistrictTechModalOpen(false)} size="xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <ModalContent {...modalContentProps}>
            <ModalHeader {...modalHeaderProps}>
              <HStack spacing={2}>
                <Icon as={MdPersonAdd} color={BRAND} />
                <Text fontSize="md" fontWeight="700">Technicians Authorized in {viewingDistrictName}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />
            <ModalBody {...modalBodyProps}>
              {(!Array.isArray(districtTechList) || districtTechList.length === 0) ? (
                <Text color="gray.500" py={6} textAlign="center" fontSize="xs">
                  No technicians currently authorized for this district.
                </Text>
              ) : (
                <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="8px" overflow="hidden">
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
            <ModalFooter {...modalFooterProps}>
              <Button variant="ghost" borderRadius="8px" size="sm" onClick={() => setIsDistrictTechModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* MANAGE TECHNICIAN DISTRICT & CITY ZONE PERMISSIONS MODAL */}
        {/* MANAGE TECHNICIAN DISTRICT & CITY ZONE PERMISSIONS MODAL */}
        <Modal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} size="2xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <ModalContent {...modalContentProps}>
            <ModalHeader {...modalHeaderProps}>
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
                        Registration District: {getResolvedPrimaryDistrict()?.name || selectedTechForPermission?.city || "Not Assigned"}
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
            <ModalBody {...modalBodyProps}>
              <VStack spacing={4} align="stretch">
                <Box p={3.5} bg="teal.50" borderRadius="12px" border="1px solid" borderColor="teal.200">
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                    <Box>
                      <HStack spacing={1.5} mb={0.5}>
                        <Icon as={MdLocationOn} color="teal.700" />
                        <Text fontSize="11px" fontWeight="700" color="teal.800" textTransform="uppercase" letterSpacing="0.5px">
                          Primary Registered District
                        </Text>
                        <Badge colorScheme="gray" fontSize="9px" px={1.5}>Metadata Only</Badge>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color={BRAND}>
                        {getResolvedPrimaryDistrict()?.name || selectedTechForPermission?.city || "None Specified"}
                      </Text>
                      <Text fontSize="10px" color="gray.600">
                        Registration context only. It grants no dispatch coverage until an admin grants district access below.
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
                  const currentRaw = techPermissions?.permissions || techPermissions?.additionalPermissions || [];
                  const getPermDistrictId = (p) =>
                    String(p.districtId?._id || p.districtId?.id || p.districtId || "");
                  const currentAddl = currentRaw.filter((p) => {
                    const dId = getPermDistrictId(p);
                    return dId && (!primaryId || dId !== primaryId);
                  });
                  const primaryPerm =
                    techPermissions?.primaryPermission ||
                    currentRaw.find((p) => primaryId && getPermDistrictId(p) === primaryId) ||
                    null;
                  const primaryEnabled = primaryPerm?.isEnabled === true;
                  const enabledCoverageCount =
                    currentAddl.filter((p) => p.isEnabled === true).length + (primaryEnabled ? 1 : 0);
                  const grantedDistrictIds = new Set([...currentRaw.map(getPermDistrictId)].filter(Boolean));

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
                            Explicit operational districts the technician may receive work in. Registration district is metadata only.
                          </Text>
                        </Box>
                        <Badge colorScheme={enabledCoverageCount > 0 ? "purple" : "red"} fontSize="11px" px={2.5} py={0.5} borderRadius="full">
                          {enabledCoverageCount} Active Coverage
                        </Badge>
                      </Flex>

                      <HStack mb={3.5} spacing={2}>
                        <Select
                          placeholder="Select District to Grant Coverage..."
                          size="sm"
                          borderRadius="8px"
                          value={selectedDistrictToGrant}
                          onChange={(e) => setSelectedDistrictToGrant(e.target.value)}
                          bg="white"
                          _focus={{ bg: "white", borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }}
                          border="1px solid"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                        >
                          {districts.map((d) => {
                            const isAct = d.active !== false && d.isActive !== false;
                            const isJobOn = d.isJobEnabled !== false;
                            const isAlreadyGranted = grantedDistrictIds.has(String(d._id));

                            const isDisabled = !isAct || !isJobOn || isAlreadyGranted;
                            let statusNote = "";
                            if (isAlreadyGranted) statusNote = " — [PERMISSION EXISTS: Enable/Pause Below]";
                            else if (!isAct) statusNote = " — [INACTIVE: Activate in District Master]";
                            else if (!isJobOn) statusNote = " — [JOBS DISABLED: Enable in District Master]";

                            return (
                              <option
                                key={d._id}
                                value={d._id}
                                disabled={isDisabled}
                                style={{
                                  color: isAlreadyGranted ? "#718096" : (isDisabled ? "#E53E3E" : "inherit"),
                                  backgroundColor: isAlreadyGranted ? "#EDF2F7" : "inherit",
                                }}
                              >
                                {d.name} ({d.city}){statusNote}
                              </option>
                            );
                          })}
                        </Select>
                        <Button
                          size="sm"
                          variant="brand"
                          borderRadius="8px"
                          onClick={() => handleGrantDistrictPermission()}
                          isLoading={isSubmitting}
                          leftIcon={<MdAddCircleOutline />}
                          flexShrink={0}
                        >
                          Grant Coverage
                        </Button>
                      </HStack>

                      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="8px" overflow="hidden">
                        <Table size="sm" variant="simple">
                          <Thead bg={SURFACE_MUTED}>
                            <Tr>
                              <Th fontSize="10px" py={3} color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                                District / Operational Hub
                              </Th>
                              <Th fontSize="10px" py={3} color="gray.600" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="140px">
                                Permission Type
                              </Th>
                              <Th fontSize="10px" py={3} color="gray.600" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="180px">
                                Status
                              </Th>
                              <Th fontSize="10px" py={3} color="gray.600" textAlign="center" textTransform="uppercase" letterSpacing="0.5px" w="170px">
                                Action
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {/* PRIMARY DISTRICT ROW */}
                            <Tr bg={primaryEnabled ? "teal.50" : "gray.50"} borderBottom="1px solid" borderColor={primaryEnabled ? "teal.100" : "gray.200"}>
                              <Td py={3}>
                                <HStack spacing={3} align="center">
                                  <Flex
                                    w="32px"
                                    h="32px"
                                    bg={primaryEnabled ? "teal.100" : "gray.200"}
                                    color={primaryEnabled ? "teal.800" : "gray.600"}
                                    borderRadius="8px"
                                    align="center"
                                    justify="center"
                                    flexShrink={0}
                                  >
                                    <Icon as={MdLocationOn} boxSize={4} />
                                  </Flex>
                                  <Box>
                                    <Text fontWeight="700" fontSize="xs" color={primaryEnabled ? "teal.900" : INK} lineHeight="short">
                                      {resolvedPrim?.name || (selectedTechForPermission?.city ? `${selectedTechForPermission.city} Operational Range` : "Primary District Not Assigned")}
                                      {resolvedPrim?.city && !(resolvedPrim?.name || "").includes(resolvedPrim.city) ? ` (${resolvedPrim.city})` : ""}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500" mt={0.5}>
                                      Registration base district — not authorization by itself
                                    </Text>
                                  </Box>
                                </HStack>
                              </Td>
                              <Td py={3} textAlign="center" whiteSpace="nowrap">
                                <Badge colorScheme="teal" variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                  PRIMARY
                                </Badge>
                              </Td>
                              <Td py={3} textAlign="center" whiteSpace="nowrap">
                                {!resolvedPrim ? (
                                  <Badge colorScheme="gray" variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                    No Primary District
                                  </Badge>
                                ) : !primaryPerm ? (
                                  <Badge colorScheme="red" variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                    No Coverage
                                  </Badge>
                                ) : (
                                  <HStack spacing={2} justify="center">
                                    <Switch
                                      size="sm"
                                      isChecked={primaryEnabled}
                                      colorScheme="teal"
                                      onChange={() => handleTogglePermission(primaryId, primaryEnabled)}
                                    />
                                    <Badge colorScheme={primaryEnabled ? "green" : "orange"} fontSize="10px" px={2} py={0.5} borderRadius="full">
                                      {primaryEnabled ? "Enabled" : "Paused"}
                                    </Badge>
                                  </HStack>
                                )}
                              </Td>
                              <Td py={3} textAlign="center" whiteSpace="nowrap">
                                {!resolvedPrim ? (
                                  <Text fontSize="10px" color="gray.400">Assign a primary district first</Text>
                                ) : !primaryPerm ? (
                                  <Button
                                    size="xs"
                                    variant="brand-outline"
                                    borderRadius="6px"
                                    h="26px"
                                    px={2.5}
                                    fontSize="11px"
                                    isLoading={isSubmitting}
                                    onClick={() => handleGrantDistrictPermission(primaryId)}
                                  >
                                    Grant Primary
                                  </Button>
                                ) : (
                                  <Button
                                    size="xs"
                                    leftIcon={<MdDelete />}
                                    colorScheme="red"
                                    variant="ghost"
                                    borderRadius="6px"
                                    h="26px"
                                    px={2.5}
                                    fontSize="11px"
                                    title="Revoke primary district coverage"
                                    onClick={() => handleRemovePermission(primaryId)}
                                  >
                                    Revoke
                                  </Button>
                                )}
                              </Td>
                            </Tr>

                            {/* ADDITIONAL / EXPLICIT DISTRICT ROWS */}
                            {currentAddl.map((p) => {
                              const distId = getPermDistrictId(p);
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
                                          Explicit cross-district dispatch coverage
                                        </Text>
                                      </Box>
                                    </HStack>
                                  </Td>
                                  <Td py={3} textAlign="center" whiteSpace="nowrap">
                                    <Badge colorScheme="purple" variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                                      {p.permissionType || "ADDITIONAL"}
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
                                        colorScheme={p.isEnabled ? "green" : "orange"}
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
                                      title="Revoke district coverage"
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

                      {enabledCoverageCount === 0 && (
                        <Flex align="center" mt={3} p={2.5} bg="red.50" borderRadius="8px" border="1px dashed" borderColor="red.200">
                          <Icon as={MdInfoOutline} color="red.500" mr={2} boxSize={4} />
                          <Text fontSize="11px" color="red.700">
                            No active district coverage. This technician will not receive any jobs, even within their registered primary district, until an admin grants coverage below.
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  );
                })()}

                {/* STRICT DISTRICT-LEVEL TECHNICIAN AUTHORIZATION */}
                <Box p={4} borderRadius="12px" bg="purple.50" border="1px solid" borderColor="purple.200">
                  <Flex align="flex-start" gap={3}>
                    <Icon as={MdVerified} color="purple.600" boxSize={5} mt={0.5} />
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="purple.900" textTransform="uppercase" letterSpacing="0.5px">
                        Strict District-Level Technician Authorization
                      </Text>
                      <Text fontSize="xs" color="purple.800" mt={1} lineHeight="tall">
                        Technicians are granted dispatch permissions solely at the <strong>District level</strong>. Once a district is granted above, this technician is eligible for all customer bookings inside that entire district within their <strong>{techServiceRadius || 10} KM</strong> operating radius. Micro-zones do not restrict technician assignments.
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter {...modalFooterProps}>
              <Button variant="ghost" borderRadius="8px" size="sm" px={6} onClick={() => setIsPermissionModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* CREATE / EDIT ZONE MODAL WITH LEAFLET MAP */}
        <Modal isOpen={isModalOpen} onClose={handleCloseZoneModal} size="full">
          <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
          <ModalContent
            bg="white"
            borderRadius="16px"
            maxW="96vw"
            h="92vh"
            maxH="92vh"
            m="auto"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.4)"
            zIndex={1401}
          >
            <ModalHeader
              bg="white"
              px={6}
              py={3.5}
              borderBottom="1px solid"
              borderColor="gray.200"
            >
              <Flex align="center" justify="space-between" pr={8}>
                <HStack spacing={3}>
                  <Box p={2.5} bg="teal.500" color="white" borderRadius="10px" boxShadow="0 2px 8px rgba(0, 128, 128, 0.3)">
                    <Icon as={MdMap} boxSize={5} />
                  </Box>
                  <Box>
                    <HStack spacing={2} align="center">
                      <Text fontSize="md" fontWeight="800" color="gray.800">
                        {isEditing ? "Edit City Zone" : "Create New City Zone"}
                      </Text>
                      {selectedTnDistrictName ? (
                        <Badge colorScheme="teal" fontSize="11px" borderRadius="full" px={2.5} py={0.5}>
                          📍 {selectedTnDistrictName}
                        </Badge>
                      ) : (
                        <Badge colorScheme="cyan" fontSize="10px" borderRadius="full" px={2} py={0.5}>
                          Tamil Nadu Map
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">
                      Define operational sub-zone boundaries within parent district using real-time Leaflet vector map.
                    </Text>
                  </Box>
                </HStack>
              </Flex>
            </ModalHeader>
            <ModalCloseButton top={3.5} right={4} />

            <ModalBody p={4} flex="1" overflow="hidden" display="flex" flexDirection="column">
              {/* Inline Error Alert Banner for Zone Modal */}
              {zoneModalError && (
                <Flex
                  align="center"
                  bg="red.50"
                  border="1.5px solid"
                  borderColor="red.400"
                  color="red.800"
                  px={4}
                  py={2.5}
                  borderRadius="10px"
                  mb={3}
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

              <Grid
                templateColumns={{ base: "1fr", xl: "360px 1fr" }}
                gap={4}
                alignItems="stretch"
                flex="1"
                h="100%"
                overflow="hidden"
              >
                {/* Left Column: Essential Zone Details Only */}
                <VStack
                  spacing={3.5}
                  align="stretch"
                  w={{ base: "100%", xl: "360px" }}
                  h="100%"
                  overflowY="auto"
                  pr={1}
                >
                  <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="gray.200" boxShadow="sm">
                    <Flex align="center" gap={2} mb={3.5} pb={2} borderBottom="1px solid" borderColor="gray.100">
                      <Icon as={MdApartment} color={BRAND} boxSize={4} />
                      <Text fontSize="xs" fontWeight="700" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                        Zone Information
                      </Text>
                    </Flex>

                    <VStack spacing={3} align="stretch">
                      {/* Parent Operational District */}
                      <FormControl isRequired isInvalid={!formData.operationalCityId && !!zoneModalError}>
                        <FormLabel fontSize="xs" fontWeight="700" color="gray.700" mb={1}>
                          Parent Operational District
                        </FormLabel>
                        <Select
                          size="sm"
                          value={formData.operationalCityId || ""}
                          placeholder="Select created district..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setZoneModalError("");
                            if (!val) {
                              setFormData((p) => ({ ...p, operationalCityId: "", city: "", name: "" }));
                              setSelectedTnDistrictName("");
                              return;
                            }
                            const hit = createdDistrictsList.find((d) => String(d._id) === String(val) || d.name === val);
                            if (hit) {
                              handleSelectDistrictFromMap(hit);
                            } else {
                              setFormData((p) => ({ ...p, operationalCityId: val }));
                              setSelectedTnDistrictName(val);
                            }
                          }}
                          borderRadius="8px"
                          bg="white"
                          borderColor="teal.300"
                          fontWeight="600"
                          color="teal.900"
                        >
                          {createdDistrictsList.map((d) => (
                            <option key={d._id} value={d._id}>
                              📍 {d.name} {d.city && d.city !== d.name ? `(${d.city})` : ""}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Real-Time City & Zone Search */}
                      <Box>
                        <InputGroup size="sm">
                          <Input
                            size="sm"
                            borderRadius="8px"
                            placeholder={`🔍 Search city or zone in ${selectedTnDistrictName || "district"}...`}
                            value={zoneSearchFilter}
                            onChange={(e) => setZoneSearchFilter(e.target.value)}
                            bg="gray.50"
                            borderColor="teal.300"
                            fontSize="xs"
                            fontWeight="500"
                            _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #0d9488" }}
                          />
                          {zoneSearchFilter && (
                            <InputRightElement>
                              <IconButton
                                size="xs"
                                icon={<MdClear />}
                                variant="ghost"
                                onClick={() => setZoneSearchFilter("")}
                                aria-label="Clear search"
                              />
                            </InputRightElement>
                          )}
                        </InputGroup>
                      </Box>

                      {/* Official Zone Areas in District (e.g. Tiruppur) */}
                      {filteredDistrictSubzones.length > 0 && (
                        <Box bg="teal.50" p={3} borderRadius="10px" border="1px solid" borderColor="teal.200">
                          <Flex align="center" justify="space-between" mb={1.5}>
                            <Text fontSize="11px" fontWeight="700" color="teal.900" textTransform="uppercase">
                              ⚡ {selectedTnDistrictName || "District"} Areas ({filteredDistrictSubzones.length})
                            </Text>
                            <Badge colorScheme="teal" fontSize="9px" px={2} py={0.5}>Click to Pick Area</Badge>
                          </Flex>
                          <Text fontSize="10px" color="gray.600" mb={2} lineHeight="1.4">
                            Select an area to auto-center & clip a circle geofence to {selectedTnDistrictName || "district"} border:
                          </Text>
                          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                            {filteredDistrictSubzones.map((sz, szIdx) => {
                              const isCreated = zones.some((z) => {
                                const zName = (z.name || "").toLowerCase();
                                const sName = (sz.name || "").toLowerCase();
                                return zName.includes(sName) || sName.includes(zName);
                              });
                              const isSelected = formData.name === sz.name;
                              const szColor = ZONE_COLOR_PALETTE[szIdx % ZONE_COLOR_PALETTE.length];
                              return (
                                <Button
                                  key={sz.id || sz.name}
                                  size="xs"
                                  variant={isSelected ? "solid" : "outline"}
                                  bg={isSelected ? szColor.border : isCreated ? "green.50" : "white"}
                                  borderColor={isSelected ? szColor.border : isCreated ? "green.300" : "gray.300"}
                                  color={isSelected ? "white" : isCreated ? "green.800" : "gray.800"}
                                  fontSize="10px"
                                  fontWeight="600"
                                  justifyContent="space-between"
                                  px={2}
                                  py={2}
                                  h="auto"
                                  onClick={() => handleSelectSubzonePreset(sz)}
                                  leftIcon={<Box w="8px" h="8px" borderRadius="full" bg={isSelected ? "white" : szColor.border} flexShrink={0} />}
                                >
                                  <Text isTruncated maxW="90px">{sz.name.replace(/ (Zone|Hub|Area|Canals)$/i, "")}</Text>
                                  {isCreated && <Badge colorScheme="green" fontSize="8px" ml={1}>Done</Badge>}
                                </Button>
                              );
                            })}
                          </Grid>
                        </Box>
                      )}

                      {/* City / Taluk Hub Name */}
                      <FormControl isRequired isInvalid={!formData.city && !!zoneModalError}>
                        <FormLabel fontSize="xs" fontWeight="700" color="gray.700" mb={1}>
                          City / Taluk Hub
                        </FormLabel>
                        <Select
                          size="sm"
                          value={formData.city || ""}
                          onChange={(e) => {
                            setZoneModalError("");
                            setFormData((p) => ({ ...p, city: e.target.value }));
                          }}
                          placeholder="Select city / taluk..."
                          borderRadius="8px"
                          bg="white"
                          borderColor="gray.300"
                          fontWeight="600"
                        >
                          {filteredDistrictCities.map((c) => (
                            <option key={c.name || c} value={c.name || c}>
                              📍 {c.name || c} {c.code ? `(${c.code})` : ""}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Micro-Zone Name */}
                      <FormControl isRequired isInvalid={!formData.name && !!zoneModalError}>
                        <FormLabel fontSize="xs" fontWeight="700" color="gray.700" mb={1}>
                          Zone Name
                        </FormLabel>
                        <Input
                          size="sm"
                          value={formData.name || ""}
                          onChange={(e) => {
                            setZoneModalError("");
                            setFormData((p) => ({ ...p, name: e.target.value }));
                          }}
                          placeholder="e.g. North Zone, Central Hub"
                          borderRadius="8px"
                          bg="white"
                        />
                      </FormControl>

                      {/* Zone Code */}
                      <FormControl isRequired isInvalid={!formData.zoneCode && !!zoneModalError}>
                        <FormLabel fontSize="xs" fontWeight="700" color="gray.700" mb={1}>
                          Zone Code
                        </FormLabel>
                        <Input
                          size="sm"
                          value={formData.zoneCode || ""}
                          onChange={(e) => {
                            setZoneModalError("");
                            setFormData((p) => ({ ...p, zoneCode: e.target.value.toUpperCase() }));
                          }}
                          placeholder="e.g. NZ01"
                          borderRadius="8px"
                          bg="white"
                          textTransform="uppercase"
                          fontWeight="700"
                        />
                      </FormControl>

                      {/* Description */}
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                          Description (Optional)
                        </FormLabel>
                        <Input
                          size="sm"
                          value={formData.description || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                          placeholder="e.g. Covers northern residential blocks"
                          borderRadius="8px"
                          bg="white"
                        />
                      </FormControl>

                      {/* Zone Active Switch */}
                      <Flex justify="space-between" align="center" p={2.5} bg="gray.50" borderRadius="8px" border="1px solid" borderColor="gray.200">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="gray.800">Zone Active</Text>
                          <Text fontSize="10px" color="gray.500">Enable services and dispatch in this zone</Text>
                        </Box>
                        <Switch
                          isChecked={formData.active}
                          onChange={(e) => setFormData((p) => ({ ...p, active: e.target.checked }))}
                          colorScheme="teal"
                        />
                      </Flex>
                    </VStack>
                  </Box>

                  {/* Boundary Status Banner Card */}
                  <Box
                    p={3.5}
                    borderRadius="12px"
                    bg={formData.polygonCoordinates ? "teal.50" : "orange.50"}
                    border="1px solid"
                    borderColor={formData.polygonCoordinates ? "teal.300" : "orange.300"}
                  >
                    <HStack spacing={2.5} align="center" mb={1}>
                      <Icon
                        as={formData.polygonCoordinates ? MdCheckCircle : MdWarning}
                        color={formData.polygonCoordinates ? "teal.600" : "orange.500"}
                        boxSize={4}
                        flexShrink={0}
                      />
                      <Text fontSize="xs" fontWeight="700" color={formData.polygonCoordinates ? "teal.900" : "orange.900"}>
                        {formData.polygonCoordinates ? "Boundary Geocode Active" : "Boundary Not Set"}
                      </Text>
                    </HStack>
                    <Text fontSize="11px" color={formData.polygonCoordinates ? "teal.800" : "orange.800"} lineHeight="1.4">
                      {formData.polygonCoordinates
                        ? `Official Survey of India geofence loaded for ${selectedTnDistrictName || formData.city || "selected area"}. Centroid geocode will be dispatched to backend.`
                        : "Click any district directly on the map or use Radius / Draw tools to set the geofence."}
                    </Text>
                  </Box>
                </VStack>

                {/* Right Column: Full-Height Interactive Leaflet Map */}
                <Box
                  bg="#0b111e"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="rgba(6, 182, 212, 0.3)"
                  boxShadow="md"
                  display="flex"
                  flexDirection="column"
                  minW={0}
                  flex="1"
                  h="100%"
                  overflow="hidden"
                  p={2}
                >
                  {isModalOpen && (
                    <ZoneMap
                      viewMode="auto"
                      cityName={formData.city || ""}
                      selectedCityName={formData.city || ""}
                      cityOptions={zoneCityOptions}
                      districtName={selectedTnDistrictName || zoneParentDistrict?.name || formData.name || "Tamil Nadu"}
                      selectedDistrictName={selectedTnDistrictName || zoneParentDistrict?.name || ""}
                      polygonCoordinates={formData.polygonCoordinates}
                      onPolygonChange={(newPoly) => setFormData((prev) => ({ ...prev, polygonCoordinates: newPoly }))}
                      height="100%"
                      mode="radius"
                      radiusKm={5}
                      showSearch={true}
                      showDrawTools={false}
                      showNavControls={false}
                      allowRadiusSelect={true}
                      showToolbar={true}
                      districts={createdDistrictsList}
                      allDistricts={createdDistrictsList}
                      zones={zones}
                      selectedDistrictId={formData.operationalCityId || null}
                      onSelectDistrict={handleSelectDistrictFromMap}
                      onCitySelect={handleSelectCityFromMap}
                      onlyTamilNadu={true}
                    />
                  )}
                </Box>
              </Grid>
            </ModalBody>
            <ModalFooter
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              px={6}
              py={3}
              justifyContent="space-between"
            >
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  {selectedTnDistrictName
                    ? `Selected: 📍 ${selectedTnDistrictName}`
                    : "No district selected — click Tamil Nadu map"}
                </Text>
                {formData.polygonCoordinates && (
                  <Badge colorScheme="teal" fontSize="10px">
                    Geocode Ready
                  </Badge>
                )}
              </HStack>
              <HStack spacing={2.5}>
                <Button variant="ghost" size="sm" borderRadius="8px" onClick={handleCloseZoneModal}>
                  Cancel
                </Button>
                {!isEditing && (
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    size="sm"
                    borderRadius="8px"
                    onClick={() => handleSubmitZone({ keepOpen: true })}
                    isLoading={isSubmitting}
                    leftIcon={<Icon as={MdAdd} />}
                    fontWeight="700"
                  >
                    Save & Create Another
                  </Button>
                )}
                <Button
                  variant="brand"
                  size="sm"
                  borderRadius="8px"
                  onClick={() => handleSubmitZone({ keepOpen: false })}
                  isLoading={isSubmitting}
                  px={5}
                  leftIcon={<Icon as={MdCheckCircle} />}
                >
                  {isEditing ? "Update Zone" : "Save & Close"}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* SERVICE ZONE MAPPING CHECKLIST & MANAGEMENT MODAL */}
        <Modal isOpen={isManageServiceModalOpen} onClose={() => setIsManageServiceModalOpen(false)} size="xl">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <ModalContent {...modalContentProps}>
            <ModalHeader {...modalHeaderProps}>
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
            <ModalCloseButton top={4} right={4} />

            <ModalBody {...modalBodyProps}>
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

                  {/* Quick Batch Actions Toolbar for Service Mapping */}
                  <Flex
                    p={3}
                    bg="teal.50"
                    borderRadius="10px"
                    border="1px solid"
                    borderColor="teal.200"
                    align="center"
                    justify="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <HStack spacing={2}>
                      <Text fontSize="xs" fontWeight="700" color="teal.900">
                        Quick Hub Actions:
                      </Text>
                      <Button
                        size="xs"
                        variant="brand"
                        leftIcon={<MdCheckCircle />}
                        onClick={() => handleModalEnableAllDistricts(true)}
                      >
                        Enable All Districts
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="outline"
                        leftIcon={<MdClear />}
                        onClick={() => handleModalEnableAllDistricts(false)}
                      >
                        Disable All Districts
                      </Button>
                    </HStack>

                    <InputGroup size="xs" maxW="220px">
                      <Input
                        placeholder="Filter sub-zones..."
                        value={manageModalSubZoneSearch}
                        onChange={(e) => setManageModalSubZoneSearch(e.target.value)}
                        borderRadius="6px"
                        bg="white"
                      />
                      <InputRightElement><Icon as={MdSearch} color="gray.400" /></InputRightElement>
                    </InputGroup>
                  </Flex>

                  {/* District Screening Navigation inside Modal */}
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="0.5px" mb={2}>
                      Screen by District:
                    </Text>
                    <HStack spacing={2} overflowX="auto" pb={2} css={globalScrollbarStyles}>
                      <Button
                        size="xs"
                        borderRadius="full"
                        variant={!selectedDistrictTab || selectedDistrictTab === "ALL" ? "solid" : "outline"}
                        colorScheme={!selectedDistrictTab || selectedDistrictTab === "ALL" ? "teal" : "gray"}
                        bg={!selectedDistrictTab || selectedDistrictTab === "ALL" ? BRAND : "white"}
                        color={!selectedDistrictTab || selectedDistrictTab === "ALL" ? "white" : "gray.700"}
                        onClick={() => setSelectedDistrictTab("ALL")}
                      >
                        All Districts ({(selectedServiceDetail.districts || []).length})
                      </Button>
                      {[...(selectedServiceDetail.districts || [])]
                        .sort((a, b) => (a.name || a.city || "").localeCompare(b.name || b.city || ""))
                        .map((d) => {
                          const dId = d.districtId || d._id;
                          const isSel = selectedDistrictTab === dId;
                          const zCount = (d.zones || []).length;
                          return (
                            <Button
                              key={dId}
                              size="xs"
                              borderRadius="full"
                              variant={isSel ? "solid" : "outline"}
                              colorScheme={isSel ? "teal" : "gray"}
                              bg={isSel ? BRAND : "white"}
                              color={isSel ? "white" : "gray.700"}
                              onClick={() => setSelectedDistrictTab(dId)}
                              leftIcon={<Icon as={MdLocationOn} />}
                            >
                              {d.name} ({zCount} zones)
                            </Button>
                          );
                        })}
                    </HStack>
                  </Box>

                  {/* List of Cities with Single Clear Toggle Switch per City in Alphabetical Order */}
                  {[...(selectedServiceDetail.districts || [])]
                    .sort((a, b) => (a.name || a.city || "").localeCompare(b.name || b.city || ""))
                    .filter((dist) => {
                      if (!selectedDistrictTab || selectedDistrictTab === "ALL") return true;
                      return String(dist.districtId || dist._id) === String(selectedDistrictTab);
                    })
                    .map((dist) => {
                      const isCityEnabled = isDistrictServiceActive(dist);
                      const filteredZonesList = (dist.zones || []).filter((z) => {
                        if (!manageModalSubZoneSearch.trim()) return true;
                        const q = manageModalSubZoneSearch.toLowerCase();
                        return (z.name || "").toLowerCase().includes(q) || (z.zoneCode || "").toLowerCase().includes(q);
                      });
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
                              {hasSubZones && typeof dist.isDistrictDefaultEnabled === "boolean" && (
                                <Text
                                  fontSize="10px"
                                  color={dist.isDistrictDefaultEnabled ? "gray.500" : "orange.600"}
                                  fontWeight="600"
                                >
                                  District default: {dist.isDistrictDefaultEnabled ? "On" : "Off"} · sub-zone overrides control the final result
                                </Text>
                              )}
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
                            <Flex justify="space-between" align="center" mb={2} flexWrap="wrap" gap={2}>
                              <Text fontSize="xs" fontWeight="700" color="gray.600">
                                Sub-Zone Availability ({filteredZonesList.length} of {dist.zones.length}):
                              </Text>
                              <HStack spacing={1}>
                                <Button
                                  size="xs"
                                  variant="brand-ghost"
                                  onClick={() => handleModalDistrictAllZonesToggle(dist, true)}
                                  isLoading={isThisDistrictToggling}
                                >
                                  All ON
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleModalDistrictAllZonesToggle(dist, false)}
                                  isLoading={isThisDistrictToggling}
                                >
                                  All OFF
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="gray"
                                  variant="ghost"
                                  onClick={() => handleModalDistrictClearZones(dist)}
                                  isLoading={isThisDistrictToggling}
                                >
                                  Clear
                                </Button>
                              </HStack>
                            </Flex>

                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={2}>
                              {[...filteredZonesList]
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

            <ModalFooter {...modalFooterProps}>
              <Button variant="brand" borderRadius="8px" size="sm" px={6} onClick={() => setIsManageServiceModalOpen(false)}>
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* TECHNICIAN GEOFENCE & GPS VERIFICATION MODAL */}
        <Modal isOpen={!!techGeofenceDetail || isTechGeofenceLoading} onClose={() => setTechGeofenceDetail(null)} size="lg">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <ModalContent {...modalContentProps}>
            <ModalHeader {...modalHeaderProps}>
              Technician GPS & Geofence Verification
            </ModalHeader>
            <ModalCloseButton top={4} right={4} />
            <ModalBody {...modalBodyProps}>
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
                    <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text color="gray.500">Registered Lat / Lng</Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="purple"
                          p={0}
                          h="auto"
                          fontSize="10px"
                          onClick={() => {
                            const prim = getResolvedPrimaryDistrict();
                            const cityName = prim?.city || selectedTechForPermission?.city;
                            if (cityName) {
                              const c = TAMIL_NADU_CITIES.find(x => x.name.toLowerCase() === cityName.toLowerCase());
                              if (c) {
                                setTechGeofenceDetail(prev => ({ ...prev, latitude: c.lat, longitude: c.lng }));
                                toast({ title: "Calibrated", description: `Coordinates calibrated to ${prim?.name || cityName} hub center.`, status: "info", duration: 2500 });
                              }
                            }
                          }}
                        >
                          Calibrate
                        </Button>
                      </Flex>
                      <Text fontWeight="700">{techGeofenceDetail.latitude || 11.0168}, {techGeofenceDetail.longitude || 76.9558}</Text>
                    </Box>
                    <Box p={2.5} bg="white" borderRadius="8px" border="1px solid" borderColor="gray.200">
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
            <ModalFooter {...modalFooterProps} display="flex" justify="space-between">
              <Button
                colorScheme="purple"
                variant="outline"
                size="sm"
                borderRadius="8px"
                leftIcon={<MdSpeed />}
                onClick={() => {
                  const tech = selectedTechForPermission;
                  setDiagTechId(tech._id);
                  setDiagJobLat(String(techGeofenceDetail?.latitude || 11.0168));
                  setDiagJobLng(String(techGeofenceDetail?.longitude || 76.9558));
                  setTechGeofenceDetail(null);
                  setActiveTab(4);
                  setSubDiagnosticsTab(3);
                }}
              >
                Run 12-Step Test
              </Button>

              <HStack spacing={2}>
                <Button variant="ghost" size="sm" borderRadius="8px" onClick={() => setTechGeofenceDetail(null)}>
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  borderRadius="8px"
                  onClick={handleSaveTechGeofenceVerification}
                  isLoading={isUpdatingVerification}
                >
                  Save Verification Status
                </Button>
              </HStack>
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
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color={INK} px={6} pt={5} pb={2}>
                Delete {deleteType === "district" ? "Operational District" : "City Micro-Zone"}?
              </AlertDialogHeader>
              <AlertDialogBody fontSize="sm" color="gray.600" px={6} pb={4}>
                Are you sure you want to permanently delete <b>"{itemToDelete?.name}"</b>? This action cannot be undone and will invalidate associated spatial caches.
              </AlertDialogBody>
              <AlertDialogFooter {...modalFooterProps}>
                <Button ref={cancelRef} variant="ghost" size="sm" borderRadius="8px" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
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
          <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" zIndex={1400}>
            <AlertDialogContent bg="white" borderRadius="16px" boxShadow="2xl" zIndex={1401}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color={INK} px={6} pt={5} pb={2}>
                {confirmConfig.title}
              </AlertDialogHeader>
              <AlertDialogBody fontSize="sm" color="gray.600" px={6} pb={4}>
                {confirmConfig.description}
              </AlertDialogBody>
              <AlertDialogFooter {...modalFooterProps}>
                <Button ref={cancelRef} variant="ghost" size="sm" borderRadius="8px" onClick={() => setIsConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant={confirmConfig.type?.includes("DISABLE") || confirmConfig.type === "CLEAR_ALL" ? "danger" : "brand"}
                  size="sm"
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