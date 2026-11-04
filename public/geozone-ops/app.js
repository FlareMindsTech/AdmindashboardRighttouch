/**
 * GeoZone Ops - Tamil Nadu District & City-Village Zone Operations System
 * Includes District Drill-down separation, Live Geo Code banner, and
 * Custom Zone & Village Creation with Automated Spatial Analysis.
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const STORAGE_KEY_DISTRICTS = 'geozone_ops_tn_districts_v3';
  const STORAGE_KEY_SUBZONES = 'geozone_ops_tn_subzones_v3';
  const STORAGE_KEY_CUSTOM_ZONES = 'geozone_ops_custom_subzones_v1';
  const TN_BOUNDS = [[8.0768, 76.2333], [13.5646, 80.3598]];
  const TN_CENTER = [10.82, 78.30];
  const DEFAULT_ZOOM = 7.2;

  // Base Tile Providers (100% Free & Open, Zero API Key Required, Zero Watermarks!)
  const TILE_LAYERS = {
    none: null, // Pure Vector GeoJSON - Shows only the district boundaries and clean dark canvas
    osm: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      fallbackUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: 'abc'
      }
    },
    carto: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd'
      }
    }
  };

  // Tamil Nadu Regional Groupings for batch management
  const TN_REGIONS = {
    'Northern': [
      'Chennai', 'Chengalpattu', 'Kanchipuram', 'Thiruvallur',
      'Ranipet', 'Vellore', 'Tirupathur', 'Tiruvannamalai'
    ],
    'Western': [
      'Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Namakkal',
      'Dharmapuri', 'Krishnagiri', 'The Nilgiris'
    ],
    'Central': [
      'Tiruchirappalli', 'Thanjavur', 'Thiruvarur', 'Nagapattinam',
      'Cuddalore', 'Perambalur', 'Ariyalur', 'Karur', 'Pudukkottai',
      'Kallakurichi', 'Villupuram'
    ],
    'Southern': [
      'Madurai', 'Dindigul', 'Theni', 'Virudhunagar', 'Sivaganga',
      'Ramanathapuram', 'Tuticorin', 'Tirunelveli', 'Tenkasi', 'Kanniyakumari'
    ],
    'Coastal': [
      'Chennai', 'Thiruvallur', 'Chengalpattu', 'Villupuram', 'Cuddalore',
      'Nagapattinam', 'Thiruvarur', 'Thanjavur', 'Pudukkottai',
      'Ramanathapuram', 'Tuticorin', 'Tirunelveli', 'Kanniyakumari'
    ]
  };

  // --- State Variables ---
  let map = null;
  let currentTileLayer = null;
  let districtLayer = null;
  let districtLabelsGroup = null;
  let subzoneLayer = null;
  let clickMarker = null;
  let customZoneTempMarker = null;

  let districtFeatures = [];
  let baseSubzoneFeatures = [];
  let backendZoneFeatures = [];
  let subzoneFeatures = [];
  let customFeatures = [];

  let districtFeatureMap = new Map();
  let subzoneFeatureMap = new Map();
  let backendZoneFeatureMap = new Map();
  let backendDistrictMap = {};
  let hasShownSubzonePreviewNotice = false;

  let districtLayerMap = new Map();
  let subzoneLayerMap = new Map();

  let districtState = {};
  let subzoneState = {};

  // View Mode: 'DISTRICTS' | 'SUBZONES' | 'COMBINED'
  let currentMode = 'DISTRICTS';
  let drilledDistrict = null; // null or string district name
  let isPinDropMode = false;

  let currentOpacity = 0.45;
  let activeRegionFilter = 'ALL';
  let activeParentDistrictFilter = 'ALL';
  let activeStatusFilter = 'ALL'; // 'ALL' | 'ENABLED' | 'DISABLED'
  let searchQuery = '';
  let selectedZoneData = null;

  // --- DOM Elements ---
  const elModeDistricts = document.getElementById('mode-districts');
  const elModeSubzones = document.getElementById('mode-subzones');
  const elModeCombined = document.getElementById('mode-combined');

  const elKpiEnabled = document.getElementById('kpi-enabled-count');
  const elKpiDisabled = document.getElementById('kpi-disabled-count');
  const elKpiCoverage = document.getElementById('kpi-coverage-pct');
  const elKpiStatesCovered = document.getElementById('kpi-states-covered');
  const elKpiProgress = document.getElementById('kpi-progress-bar');
  const elKpiEnabledLabel = document.getElementById('kpi-enabled-label');
  const elKpiDisabledLabel = document.getElementById('kpi-disabled-label');
  const elSidebarTitle = document.getElementById('sidebar-main-title');

  const elSidebar = document.getElementById('zone-sidebar');
  const elBtnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const elBtnCloseSidebar = document.getElementById('btn-close-sidebar');
  const elZonesList = document.getElementById('zones-list-container');
  const elFilteredCountBadge = document.getElementById('filtered-count-badge');
  const elSelectRegion = document.getElementById('select-state-filter');
  const elSelectDistrict = document.getElementById('select-district-filter');
  const elFilterRegionSection = document.getElementById('filter-region-section');
  const elFilterDistrictSection = document.getElementById('filter-parent-district-section');

  const elStateBatchBar = document.getElementById('state-batch-controls');
  const elSelectedStateName = document.getElementById('selected-state-name');
  const elSelectedStateCounts = document.getElementById('selected-state-counts');
  const elBtnStateEnable = document.getElementById('btn-state-enable-all');
  const elBtnStateDisable = document.getElementById('btn-state-disable-all');
  const elBtnStateZoom = document.getElementById('btn-state-zoom');

  const elSidebarSearch = document.getElementById('sidebar-search-input');
  const elMapQuickSearch = document.getElementById('map-quick-search');
  const elQuickSearchResults = document.getElementById('quick-search-results');
  const elBtnClearSearch = document.getElementById('btn-clear-search');

  const elOpacitySlider = document.getElementById('opacity-slider');
  const elOpacityValue = document.getElementById('opacity-value');
  const elBtnResetView = document.getElementById('btn-reset-view');
  const elMapLoader = document.getElementById('map-loader');

  // Floating District Drill-down Banner
  const elDrilldownBanner = document.getElementById('district-drilldown-banner');
  const elBtnExitDrilldown = document.getElementById('btn-exit-drilldown');
  const elDrilldownTitle = document.getElementById('drilldown-district-title');
  const elDdStatTotal = document.getElementById('dd-stat-total');
  const elDdStatActive = document.getElementById('dd-stat-active');
  const elDdStatInactive = document.getElementById('dd-stat-inactive');
  const elBtnDdEnableAll = document.getElementById('btn-dd-enable-all');
  const elBtnDdDisableAll = document.getElementById('btn-dd-disable-all');
  const elBtnDdAddZone = document.getElementById('btn-dd-add-zone');
  const elPinModeBanner = document.getElementById('pin-mode-banner');
  const elBtnCancelPinMode = document.getElementById('btn-cancel-pin-mode');

  // Floating Geo Code Banner
  const elGeocodeBanner = document.getElementById('map-geocode-banner');
  const elGcBannerName = document.getElementById('gc-banner-name');
  const elGcBannerType = document.getElementById('gc-banner-type');
  const elGcBannerStatus = document.getElementById('gc-banner-status');
  const elGcBannerCoords = document.getElementById('gc-banner-coords');
  const elGcBannerPluscode = document.getElementById('gc-banner-pluscode');
  const elGcBannerPincode = document.getElementById('gc-banner-pincode');
  const elGcBannerAdmincode = document.getElementById('gc-banner-admincode');
  const elBtnCopyGeocode = document.getElementById('btn-copy-geocode');
  const elBtnGeocodeToggle = document.getElementById('btn-geocode-toggle');
  const elBtnCloseGeocode = document.getElementById('btn-close-geocode');
  const elBtnViewDistrictGeoJson = document.getElementById('btn-view-district-geojson');

  // Modal: View & Export District GeoJSON Code (Zero API Key)
  const elModalGeoJson = document.getElementById('modal-geojson-viewer');
  const elBtnCloseGeoJsonModal = document.getElementById('btn-close-geojson-modal');
  const elBtnDoneGeoJsonModal = document.getElementById('btn-done-geojson-modal');
  const elGeoJsonTitle = document.getElementById('geojson-modal-title');
  const elGeoJsonMeta = document.getElementById('geojson-modal-meta');
  const elGeoJsonCode = document.getElementById('geojson-modal-code');
  const elBtnCopyModalGeoJson = document.getElementById('btn-copy-modal-geojson');
  const elBtnDownloadModalGeoJson = document.getElementById('btn-download-modal-geojson');
  const elBtnDownloadAllTnGeoJson = document.getElementById('btn-download-all-tn-geojson');
  const elBtnHeaderGeoJson = document.getElementById('btn-header-geojson');

  // Modal: Create New Zone / Village & Spatial Analysis
  const elModalCreateZone = document.getElementById('modal-create-zone');
  const elBtnOpenCreateZone = document.getElementById('btn-open-create-zone');
  const elBtnCloseModal = document.getElementById('btn-close-modal');
  const elBtnCancelCreate = document.getElementById('btn-cancel-create');
  const elBtnTriggerPinMode = document.getElementById('btn-trigger-pin-mode');
  const elNewZoneLat = document.getElementById('new-zone-lat');
  const elNewZoneLon = document.getElementById('new-zone-lon');
  const elAnalysisDistrict = document.getElementById('analysis-district');
  const elAnalysisPluscode = document.getElementById('analysis-pluscode');
  const elAnalysisAdmincode = document.getElementById('analysis-admincode');
  const elAnalysisArea = document.getElementById('analysis-area');
  const elNewZoneName = document.getElementById('new-zone-name');
  const elNewZoneType = document.getElementById('new-zone-type');
  const elNewZonePincode = document.getElementById('new-zone-pincode');
  const elNewZoneRadius = document.getElementById('new-zone-radius');
  const elNewZoneRadiusVal = document.getElementById('new-zone-radius-val');
  const elNewZoneStatus = document.getElementById('new-zone-status');
  const elNewZoneNotes = document.getElementById('new-zone-notes');
  const elBtnSaveNewZone = document.getElementById('btn-save-new-zone');

  // Bulk Actions
  const elBulkMenuBtn = document.getElementById('btn-bulk-menu');
  const elBtnBulkEnableAll = document.getElementById('btn-bulk-enable-all');
  const elBtnBulkDisableAll = document.getElementById('btn-bulk-disable-all');
  const elBtnPresetMetro = document.getElementById('btn-preset-metro');
  const elBtnPresetReset = document.getElementById('btn-preset-reset');
  const elBtnExport = document.getElementById('btn-export-config');
  const elImportFileInput = document.getElementById('import-file-input');

  // Inspector Drawer
  const elDetailDrawer = document.getElementById('zone-detail-drawer');
  const elBtnCloseDetail = document.getElementById('btn-close-detail');
  const elDetailStatusPill = document.getElementById('detail-status-pill');
  const elDetailDistrictName = document.getElementById('detail-district-name');
  const elDetailStateName = document.getElementById('detail-state-name');
  const elDetailServiceSwitch = document.getElementById('detail-service-switch');
  const elDetailCoords = document.getElementById('detail-coords');
  const elDetailPluscode = document.getElementById('detail-pluscode');
  const elDetailDtcode = document.getElementById('detail-dtcode');
  const elDetailPincode = document.getElementById('detail-pincode');
  const elDetailZoneType = document.getElementById('detail-zone-type');
  const elDetailArea = document.getElementById('detail-area');
  const elDetailNotes = document.getElementById('detail-zone-notes');
  const elBtnSaveNotes = document.getElementById('btn-save-notes');
  const elBtnDetailFlyto = document.getElementById('btn-detail-flyto');
  const elBtnDetailDrilldown = document.getElementById('btn-detail-drilldown');
  const elBtnDetailEditAdmin = document.getElementById('btn-detail-edit-admin');
  const elBtnDetailCopyGeocode = document.getElementById('btn-detail-copy-geocode');

  const elToast = document.getElementById('toast');
  const elToastMessage = document.getElementById('toast-message');

  const elTabCountAll = document.getElementById('tab-count-all');
  const elTabCountEnabled = document.getElementById('tab-count-enabled');
  const elTabCountDisabled = document.getElementById('tab-count-disabled');

  // --- Initialization ---
  function init() {
    loadSavedStates();
    initMap();
    initEvents();
    loadAllData();
  }

  // --- Embedded / Backend Bridge Helpers ---
  function isEmbedded() {
    return !!(window.parent && window.parent !== window);
  }

  function postToParent(message) {
    if (!isEmbedded()) return;
    window.parent.postMessage(message, window.location.origin);
  }

  function normalizeDistrictName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/^the\s+/, '')
      .replace(/\b(district|revenue|operational|range|hub|zone)\b/g, ' ')
      .replace(/[^a-z0-9]/g, '');
  }

  function isBackendZone(id) {
    return backendZoneFeatureMap.has(id);
  }

  function rebuildSubzoneFeatures() {
    subzoneFeatures = baseSubzoneFeatures
      .concat(backendZoneFeatures)
      .concat(customFeatures);
    subzoneFeatureMap.clear();
    subzoneFeatures.forEach(f => {
      const id = f.properties.subzone_id || f.id;
      if (id) subzoneFeatureMap.set(id, f);
    });
  }

  function computeGeometryCenter(geometry) {
    if (!geometry) return null;
    let ring = null;
    if (geometry.type === 'Polygon') {
      ring = geometry.coordinates && geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      ring = geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0][0];
    }
    if (!ring || !ring.length) return null;
    const isClosed = ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1];
    const pts = isClosed ? ring.slice(0, -1) : ring;
    if (!pts.length) return null;
    const sum = pts.reduce((acc, pt) => [acc[0] + pt[0], acc[1] + pt[1]], [0, 0]);
    return [sum[1] / pts.length, sum[0] / pts.length];
  }

  function backendZoneToFeature(zone) {
    if (!zone || !zone.polygon) return null;
    const polygon = zone.polygon;
    const center = Array.isArray(zone.center) && zone.center.length === 2
      ? zone.center
      : computeGeometryCenter(polygon);
    if (!center) return null;

    return {
      type: 'Feature',
      id: zone._id || zone.zoneCode || zone.name,
      properties: {
        subzone_id: zone._id || zone.zoneCode || zone.name,
        name: zone.name || 'Unnamed Zone',
        district: zone.tnDistrictName || zone.district || '',
        state: 'Tamil Nadu',
        type: 'Live City Zone',
        pincode: zone.pincode || '',
        latitude: center[0],
        longitude: center[1],
        geocode: {
          lat: center[0],
          lon: center[1],
          formatted: `${center[0].toFixed(4)}° N, ${center[1].toFixed(4)}° E`,
          plus_code: '',
          admin_code: zone.zoneCode || '',
          pincode: zone.pincode || ''
        },
        radius_km: zone.radiusKm || null,
        approx_area_sqkm: zone.approxAreaSqKm ||
          (zone.radiusKm ? Math.PI * zone.radiusKm * zone.radiusKm : null),
        notes: zone.description || '',
        isBackendZone: true,
        backendZoneId: zone._id,
        zoneCode: zone.zoneCode || '',
        active: zone.active !== false
      },
      geometry: polygon
    };
  }

  function applyBackendDistricts(backendDistricts) {
    const list = Array.isArray(backendDistricts) ? backendDistricts : [];
    const byName = new Map();
    list.forEach(record => {
      const key = normalizeDistrictName(record.tnDistrictName || record.city || record.name);
      if (key && !byName.has(key)) byName.set(key, record);
    });

    backendDistrictMap = {};
    districtFeatures.forEach(feature => {
      const name = feature.properties.district || feature.id;
      const record = byName.get(normalizeDistrictName(name)) || null;
      backendDistrictMap[name] = record;
      districtState[name] = record
        ? (record.active !== false && record.isActive !== false)
        : false;
      updateDistrictLayerStyle(name);
    });

    saveStates();
    updateKpis();
    renderSidebarList();
    if (drilledDistrict) updateDrilldownStats();
    if (selectedZoneData && !selectedZoneData.isSubzone) {
      syncDetailDrawer();
      updateGeocodeBanner(selectedZoneData);
    }
  }

  function applyBackendZones(backendZones) {
    const list = Array.isArray(backendZones) ? backendZones : [];
    backendZoneFeatures = list.map(backendZoneToFeature).filter(Boolean);
    backendZoneFeatureMap.clear();
    backendZoneFeatures.forEach(feature => {
      backendZoneFeatureMap.set(feature.properties.subzone_id, feature);
    });

    rebuildSubzoneFeatures();
    renderSubzoneLayers();
    if (currentMode !== 'DISTRICTS' && !map.hasLayer(subzoneLayer)) {
      subzoneLayer.addTo(map);
    }
    updateKpis();
    renderSidebarList();
    if (drilledDistrict) updateDrilldownStats();
    if (selectedZoneData && selectedZoneData.isSubzone && backendZoneFeatureMap.has(selectedZoneData.id)) {
      syncDetailDrawer();
      updateGeocodeBanner(selectedZoneData);
    }
  }

  function focusDistrictByName(districtName) {
    if (!districtName) return;
    const resolved = districtFeatureMap.has(districtName)
      ? districtName
      : districtFeatures.find(f => normalizeDistrictName(f.properties.district) === normalizeDistrictName(districtName))?.properties.district;
    if (!resolved) return;
    drillDownToDistrict(resolved);
    const feature = districtFeatureMap.get(resolved);
    if (feature) handleDistrictClick(feature, null);
  }

  // --- LocalStorage State Persistence ---
  function loadSavedStates() {
    try {
      const dStored = localStorage.getItem(STORAGE_KEY_DISTRICTS);
      if (dStored) districtState = JSON.parse(dStored);
      const sStored = localStorage.getItem(STORAGE_KEY_SUBZONES);
      if (sStored) subzoneState = JSON.parse(sStored);
      if (!isEmbedded()) {
        const cStored = localStorage.getItem(STORAGE_KEY_CUSTOM_ZONES);
        if (cStored) customFeatures = JSON.parse(cStored);
      }
    } catch (e) {
      console.warn('Could not read state from localStorage', e);
    }
  }

  function saveStates() {
    try {
      localStorage.setItem(STORAGE_KEY_DISTRICTS, JSON.stringify(districtState));
      localStorage.setItem(STORAGE_KEY_SUBZONES, JSON.stringify(subzoneState));
      localStorage.setItem(STORAGE_KEY_CUSTOM_ZONES, JSON.stringify(customFeatures));
    } catch (e) {
      console.warn('Could not save state to localStorage', e);
    }
  }

  function isDistrictEnabled(id) {
    if (districtState[id] === undefined) {
      districtState[id] = !isEmbedded();
    }
    return districtState[id];
  }

  function isSubzoneEnabled(id) {
    const backendZone = backendZoneFeatureMap.get(id);
    if (backendZone) {
      return backendZone.properties.active !== false;
    }
    if (subzoneState[id] === undefined) {
      subzoneState[id] = id.endsWith('-01') || id.endsWith('-02') || id.includes('Central') || id.includes('Core');
    }
    return subzoneState[id];
  }

  function setZoneStatus(id, isSubzone, enabled) {
    if (isSubzone) {
      if (isBackendZone(id)) {
        showToast('Live zones are managed from City Micro-Zones.');
        if (selectedZoneData && selectedZoneData.id === id) syncDetailDrawer();
        return;
      }

      subzoneState[id] = enabled;
      updateSubzoneLayerStyle(id);
      if (isEmbedded()) showSubzonePreviewNotice();
    } else {
      const backendRecord = backendDistrictMap[id];

      if (isEmbedded()) {
        if (backendRecord) {
          districtState[id] = enabled;
          updateDistrictLayerStyle(id);
          postToParent({
            type: 'GEOZONE_TOGGLE_STATUS',
            id: id,
            isSubzone: false,
            status: enabled
          });
          showToast(`${id} district ${enabled ? 'enabling' : 'disabling'}...`);
        } else if (enabled) {
          districtState[id] = true;
          updateDistrictLayerStyle(id);
          postToParent({
            type: 'GEOZONE_REQUEST_CREATE_DISTRICT',
            id: id,
            districtName: id,
            status: true
          });
          showToast(`Creating ${id} district in the backend...`);
        } else {
          districtState[id] = false;
          updateDistrictLayerStyle(id);
        }
      } else {
        districtState[id] = enabled;
        updateDistrictLayerStyle(id);
      }
    }

    saveStates();
    updateKpis();
    renderSidebarList();

    if (drilledDistrict) updateDrilldownStats();

    if (selectedZoneData && selectedZoneData.id === id) {
      syncDetailDrawer();
      updateGeocodeBanner(selectedZoneData);
    }
  }

  function showSubzonePreviewNotice() {
    if (hasShownSubzonePreviewNotice) return;
    hasShownSubzonePreviewNotice = true;
    showToast('City/Village toggles are a local preview. Manage live zones in City Micro-Zones.');
  }

  // --- Leaflet Map Setup ---
  function initMap() {
    map = L.map('map', {
      center: TN_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 6,
      maxZoom: 16,
      preferCanvas: true,
      zoomControl: false,
      maxBounds: [[6.5, 73.0], [15.5, 84.0]]
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);
    setBasemap('osm'); // Default to OpenStreetMap

    // Click on map
    map.on('click', handleMapClick);
  }

  function setBasemap(theme) {
    if (currentTileLayer) {
      map.removeLayer(currentTileLayer);
      currentTileLayer = null;
    }
    const layerConfig = TILE_LAYERS[theme] || TILE_LAYERS.osm;
    if (layerConfig) {
      currentTileLayer = L.tileLayer(layerConfig.url, layerConfig.options);
      if (layerConfig.fallbackUrl) {
        currentTileLayer.on('tileerror', function () {
          if (!currentTileLayer._fallbackTriggered && map) {
            currentTileLayer._fallbackTriggered = true;
            try {
              map.removeLayer(currentTileLayer);
            } catch (e) {}
            currentTileLayer = L.tileLayer(layerConfig.fallbackUrl, {
              ...layerConfig.options,
              subdomains: 'abcd'
            }).addTo(map);
          }
        });
      }
      currentTileLayer.addTo(map);
    }

    document.querySelectorAll('.btn-basemap').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layer === theme);
    });
  }

  // --- Load Both Datasets ---
  async function loadAllData() {
    try {
      const [distRes, subRes] = await Promise.all([
        fetch('tamilnadu_districts.geojson'),
        fetch('tamilnadu_subzones.geojson')
      ]);

      if (!distRes.ok || !subRes.ok) {
        throw new Error('Failed to load GeoJSON datasets');
      }

      const distData = await distRes.json();
      const subData = await subRes.json();

      districtFeatures = distData.features || [];
      baseSubzoneFeatures = subData.features || [];
      rebuildSubzoneFeatures();

      districtFeatures.forEach(f => {
        const id = f.properties.district || f.id;
        districtFeatureMap.set(id, f);
      });

      renderDistrictLayers();
      renderSubzoneLayers();
      populateDistrictDropdown();
      applyViewMode(currentMode);
      updateKpis();
      renderSidebarList();

      // Notify the parent only after the GeoJSON layers are ready, otherwise
      // SYNC_DISTRICTS/SYNC_ZONES arrive before districtFeatures exists.
      postToParent({ type: 'GEOZONE_READY' });

      setTimeout(() => {
        elMapLoader.classList.add('hidden');
      }, 300);

    } catch (err) {
      console.error('Error loading data:', err);
      elMapLoader.innerHTML = `
        <div class="loading-text" style="color: #ef4444;">
          <h3>Failed to Load Zone System</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  // --- District Layers Rendering ---
  function renderDistrictLayers() {
    if (districtLayer) map.removeLayer(districtLayer);
    if (districtLabelsGroup) map.removeLayer(districtLabelsGroup);
    districtLabelsGroup = L.layerGroup();

    districtLayer = L.geoJSON({ type: 'FeatureCollection', features: districtFeatures }, {
      style: feat => getDistrictStyle(feat.properties.district || feat.id),
      onEachFeature: (feat, layer) => {
        const id = feat.properties.district || feat.id;
        districtLayerMap.set(id, layer);
        const p = feat.properties;
        const name = p.district || p.name;
        const coords = p.center ? `${p.center[0]}° N, ${p.center[1]}° E` : '--';

        // Add pure vector district name label
        if (p.center && Array.isArray(p.center) && p.center.length === 2) {
          const labelIcon = L.divIcon({
            className: 'district-map-label',
            html: `<span>${escapeHtml(name)}</span>`,
            iconSize: [90, 22],
            iconAnchor: [45, 11]
          });
          const marker = L.marker([p.center[0], p.center[1]], {
            icon: labelIcon,
            interactive: false
          });
          districtLabelsGroup.addLayer(marker);
        }

        layer.bindTooltip(() => {
          const isEn = isDistrictEnabled(id);
          return `
            <div class="tooltip-title">${escapeHtml(name)} District</div>
            <div class="tooltip-sub">Click to drill down into cities & villages</div>
            <div class="tooltip-sub" style="color: #22d3ee; font-family: monospace;">Geo Code: ${coords}</div>
            <div class="tooltip-badge ${isEn ? 'badge-enabled' : 'badge-disabled'}">
              ${isEn ? '✓ Service Enabled' : '✕ Service Disabled'}
            </div>
          `;
        }, { sticky: true, direction: 'top', className: 'custom-zone-tooltip' });

        layer.on({
          mouseover: () => {
            if (currentMode !== 'SUBZONES' && !drilledDistrict) {
              layer.setStyle({ color: '#22d3ee', weight: 3, fillOpacity: 0.65 });
            }
          },
          mouseout: () => {
            if (currentMode !== 'SUBZONES' && !drilledDistrict) {
              layer.setStyle(getDistrictStyle(id));
            }
          },
          click: e => {
            L.DomEvent.stopPropagation(e);
            if (isPinDropMode) {
              handlePinDrop(e.latlng);
              return;
            }
            // Direct Drill-down into clicked district!
            drillDownToDistrict(name);
            handleDistrictClick(feat, e.latlng);
          }
        });
      }
    });

    if (currentMode !== 'SUBZONES' && !drilledDistrict) {
      if (!map.hasLayer(districtLayer)) districtLayer.addTo(map);
      if (!map.hasLayer(districtLabelsGroup)) districtLabelsGroup.addTo(map);
    }
  }

  function getDistrictStyle(id) {
    const isEn = isDistrictEnabled(id);
    const isCombined = currentMode === 'COMBINED';
    const isDrilled = drilledDistrict === id;

    if (drilledDistrict && !isDrilled) {
      // Dim non-drilled districts
      return {
        fillColor: '#0f172a',
        fillOpacity: 0.05,
        color: '#334155',
        weight: 1.0,
        opacity: 0.4
      };
    }

    if (isEn) {
      return {
        fillColor: '#10b981',
        fillOpacity: isDrilled ? 0.08 : (isCombined ? 0.15 : currentOpacity),
        color: isDrilled ? '#06b6d4' : '#059669',
        weight: isDrilled ? 3.0 : (isCombined ? 2.0 : 1.6),
        opacity: 0.95
      };
    } else {
      return {
        fillColor: '#334155',
        fillOpacity: isDrilled ? 0.05 : (isCombined ? 0.08 : currentOpacity * 0.45),
        color: isDrilled ? '#06b6d4' : '#64748b',
        weight: isDrilled ? 2.5 : (isCombined ? 1.8 : 1.2),
        opacity: 0.85
      };
    }
  }

  function updateDistrictLayerStyle(id) {
    const layer = districtLayerMap.get(id);
    if (layer) layer.setStyle(getDistrictStyle(id));
  }

  // --- Subzone (City & Village) Layers Rendering ---
  function renderSubzoneLayers() {
    if (subzoneLayer) map.removeLayer(subzoneLayer);
    subzoneLayerMap.clear();

    subzoneLayer = L.geoJSON({ type: 'FeatureCollection', features: subzoneFeatures }, {
      style: feat => getSubzoneStyle(feat.properties.subzone_id),
      filter: feat => {
        if (!drilledDistrict) return true;
        return normalizeDistrictName(feat.properties.district) === normalizeDistrictName(drilledDistrict);
      },
      onEachFeature: (feat, layer) => {
        const id = feat.properties.subzone_id;
        subzoneLayerMap.set(id, layer);
        const p = feat.properties;

        layer.bindTooltip(() => {
          const isEn = isSubzoneEnabled(id);
          const liveBadge = isBackendZone(id)
            ? '<span class="zone-live-badge">LIVE BACKEND</span>'
            : (isEmbedded() ? '<span class="zone-preview-badge">PREVIEW</span>' : '');
          return `
            <div class="tooltip-title">${escapeHtml(p.name)}</div>
            <div class="tooltip-sub">${escapeHtml(p.district)} &bull; <span class="zone-cat-badge">${p.type}</span> &bull; Pin: ${p.pincode || '--'} ${liveBadge}</div>
            <div class="tooltip-sub" style="color: #22d3ee; font-family: monospace;">Geo: ${p.latitude.toFixed(4)}° N, ${p.longitude.toFixed(4)}° E</div>
            <div class="tooltip-badge ${isEn ? 'badge-enabled' : 'badge-disabled'}">
              ${isEn ? '✓ Service Active' : '✕ Service Inactive'}
            </div>
          `;
        }, { sticky: true, direction: 'top', className: 'custom-zone-tooltip' });

        layer.on({
          mouseover: () => {
            layer.setStyle({ color: '#38bdf8', weight: 3.2, fillOpacity: 0.75 });
          },
          mouseout: () => {
            layer.setStyle(getSubzoneStyle(id));
          },
          click: e => {
            L.DomEvent.stopPropagation(e);
            if (isPinDropMode) {
              handlePinDrop(e.latlng);
              return;
            }
            handleSubzoneClick(feat, e.latlng);
          }
        });
      }
    });
  }

  function getSubzoneStyle(id) {
    const isEn = isSubzoneEnabled(id);
    const isLive = isBackendZone(id);

    if (isLive) {
      return {
        fillColor: isEn ? '#3b82f6' : '#475569',
        fillOpacity: isEn ? currentOpacity * 1.1 : currentOpacity * 0.4,
        color: isEn ? '#2563eb' : '#64748b',
        weight: 2.4,
        opacity: 0.95
      };
    }

    if (isEn) {
      return {
        fillColor: '#06b6d4',
        fillOpacity: currentOpacity * 1.15,
        color: '#0284c7',
        weight: 2.2,
        opacity: 0.95
      };
    } else {
      return {
        fillColor: '#475569',
        fillOpacity: currentOpacity * 0.45,
        color: '#94a3b8',
        weight: 1.5,
        opacity: 0.85
      };
    }
  }

  function updateSubzoneLayerStyle(id) {
    const layer = subzoneLayerMap.get(id);
    if (layer) layer.setStyle(getSubzoneStyle(id));
  }

  // --- District Drill-Down Handler ---
  function drillDownToDistrict(districtName) {
    drilledDistrict = districtName;
    activeParentDistrictFilter = districtName;

    // Show drill-down banner
    elDrilldownBanner.style.display = 'flex';
    elDrilldownTitle.textContent = `${districtName} District`;

    // Switch view to show subzones inside this district
    if (!map.hasLayer(districtLayer)) map.addLayer(districtLayer);
    renderSubzoneLayers();
    if (!map.hasLayer(subzoneLayer)) map.addLayer(subzoneLayer);

    // Zoom map smoothly to this district
    const distLayer = districtLayerMap.get(districtName);
    if (distLayer) {
      try {
        map.fitBounds(distLayer.getBounds(), { padding: [70, 70], maxZoom: 11, duration: 0.8 });
      } catch (e) {
        console.warn(e);
      }
    }

    // Hide district labels during drill-down to avoid overlap
    if (districtLabelsGroup && map.hasLayer(districtLabelsGroup)) {
      map.removeLayer(districtLabelsGroup);
    }

    // Refresh district layer styles to highlight only this district
    districtFeatures.forEach(f => updateDistrictLayerStyle(f.properties.district || f.id));

    // Update dropdown & sidebar
    elSelectDistrict.value = districtName;
    elFilterRegionSection.style.display = 'none';
    elFilterDistrictSection.style.display = 'flex';
    elSidebarTitle.textContent = `${districtName} Cities & Villages`;

    updateDrilldownStats();
    renderSidebarList();
    showToast(`Drilled down into ${districtName} District (Showing all internal cities & villages)`);
  }

  function exitDrilldown() {
    drilledDistrict = null;
    activeParentDistrictFilter = 'ALL';
    elDrilldownBanner.style.display = 'none';

    applyViewMode(currentMode);
    if (districtLabelsGroup && currentMode !== 'SUBZONES' && !map.hasLayer(districtLabelsGroup)) {
      map.addLayer(districtLabelsGroup);
    }
    districtFeatures.forEach(f => updateDistrictLayerStyle(f.properties.district || f.id));
    map.fitBounds(TN_BOUNDS, { padding: [30, 30] });

    renderSidebarList();
    showToast('Returned to All Tamil Nadu view');
  }

  function updateDrilldownStats() {
    if (!drilledDistrict) return;
    const internal = subzoneFeatures.filter(
      f => normalizeDistrictName(f.properties.district) === normalizeDistrictName(drilledDistrict)
    );
    const active = internal.filter(f => isSubzoneEnabled(f.properties.subzone_id)).length;
    const inactive = internal.length - active;

    elDdStatTotal.textContent = `${internal.length} Sub-Zones`;
    elDdStatActive.textContent = `${active} Active`;
    elDdStatInactive.textContent = `${inactive} Inactive`;
  }

  // --- View Mode Switching ---
  function applyViewMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.btn-mode').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'DISTRICTS') {
      if (!map.hasLayer(districtLayer)) map.addLayer(districtLayer);
      if (districtLabelsGroup && !drilledDistrict && !map.hasLayer(districtLabelsGroup)) {
        map.addLayer(districtLabelsGroup);
      }
      if (map.hasLayer(subzoneLayer)) map.removeLayer(subzoneLayer);
      elFilterRegionSection.style.display = 'flex';
      elFilterDistrictSection.style.display = 'none';
      elSidebarTitle.textContent = 'TN Districts (37)';
      elKpiEnabledLabel.textContent = 'Districts Enabled';
      elKpiDisabledLabel.textContent = 'Districts Disabled';
      districtFeatures.forEach(f => updateDistrictLayerStyle(f.properties.district || f.id));
    } else if (mode === 'SUBZONES') {
      if (map.hasLayer(districtLayer)) map.removeLayer(districtLayer);
      if (districtLabelsGroup && map.hasLayer(districtLabelsGroup)) {
        map.removeLayer(districtLabelsGroup);
      }
      renderSubzoneLayers();
      if (!map.hasLayer(subzoneLayer)) map.addLayer(subzoneLayer);
      elFilterRegionSection.style.display = 'none';
      elFilterDistrictSection.style.display = 'flex';
      elSidebarTitle.textContent = 'City & Village Zones';
      elKpiEnabledLabel.textContent = 'Sub-Zones Enabled';
      elKpiDisabledLabel.textContent = 'Sub-Zones Disabled';
      subzoneFeatures.forEach(f => updateSubzoneLayerStyle(f.properties.subzone_id));
    } else if (mode === 'COMBINED') {
      if (!map.hasLayer(districtLayer)) map.addLayer(districtLayer);
      if (districtLabelsGroup && !drilledDistrict && !map.hasLayer(districtLabelsGroup)) {
        map.addLayer(districtLabelsGroup);
      }
      renderSubzoneLayers();
      if (!map.hasLayer(subzoneLayer)) map.addLayer(subzoneLayer);
      elFilterRegionSection.style.display = 'flex';
      elFilterDistrictSection.style.display = 'flex';
      elSidebarTitle.textContent = 'Combined Grid';
      elKpiEnabledLabel.textContent = 'Total Enabled';
      elKpiDisabledLabel.textContent = 'Total Disabled';
      districtFeatures.forEach(f => updateDistrictLayerStyle(f.properties.district || f.id));
      subzoneFeatures.forEach(f => updateSubzoneLayerStyle(f.properties.subzone_id));
    }

    updateKpis();
    renderSidebarList();
  }

  // --- Point In Polygon Spatial Analysis ---
  function pointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      let xi = poly[i][0], yi = poly[i][1];
      let xj = poly[j][0], yj = poly[j][1];
      let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function detectParentDistrict(lat, lon) {
    for (let feat of districtFeatures) {
      const geom = feat.geometry;
      if (!geom) continue;
      if (geom.type === 'Polygon') {
        if (pointInPolygon(lon, lat, geom.coordinates[0])) {
          return feat.properties.district;
        }
      } else if (geom.type === 'MultiPolygon') {
        for (let poly of geom.coordinates) {
          if (pointInPolygon(lon, lat, poly[0])) {
            return feat.properties.district;
          }
        }
      }
    }
    // Fallback: nearest district centroid
    let best = 'Tamil Nadu';
    let minDist = Infinity;
    districtFeatures.forEach(f => {
      const c = f.properties.center;
      if (c) {
        const d = Math.hypot(lat - c[0], lon - c[1]);
        if (d < minDist) {
          minDist = d;
          best = f.properties.district;
        }
      }
    });
    return best;
  }

  // --- Plus Code Calculator ---
  function computePlusCode(lat, lon) {
    const alphabet = '23456789CFGHJMPQRVWX';
    lat = Math.min(90.0, Math.max(-90.0, lat)) + 90.0;
    lon = Math.min(180.0, Math.max(-180.0, lon)) + 180.0;
    const code = [];
    let vLat = lat;
    let vLon = lon;
    const resolutions = [20.0, 1.0, 0.05, 0.0025, 0.000125];
    for (let r of resolutions) {
      const dLat = Math.floor(vLat / r);
      const dLon = Math.floor(vLon / r);
      vLat -= dLat * r;
      vLon -= dLon * r;
      code.push(alphabet[dLat] || '2');
      code.push(alphabet[dLon] || '2');
    }
    const s = code.join('');
    return s.slice(0, 8) + '+' + s.slice(8);
  }

  function generateCirclePolygon(centerLat, centerLon, radiusKm, numPoints = 16) {
    const coords = [];
    const latDegPerKm = 1.0 / 111.0;
    const lonDegPerKm = 1.0 / (111.0 * Math.cos(centerLat * Math.PI / 180.0));
    for (let i = 0; i < numPoints; i++) {
      const angle = 2.0 * Math.PI * i / numPoints;
      const dLat = radiusKm * Math.sin(angle) * latDegPerKm;
      const dLon = radiusKm * Math.cos(angle) * lonDegPerKm;
      coords.push([+(centerLon + dLon).toFixed(5), +(centerLat + dLat).toFixed(5)]);
    }
    coords.push(coords[0]);
    return coords;
  }

  // --- Click Events & Geo Code Display ---
  function handleMapClick(e) {
    if (isPinDropMode) {
      handlePinDrop(e.latlng);
      return;
    }

    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    const plusCode = computePlusCode(lat, lon);

    setMapClickMarker(e.latlng);

    let nearestSubzone = findNearestFeature(lat, lon, subzoneFeatures);
    let nearestDistrict = detectParentDistrict(lat, lon);

    const data = {
      isSubzone: !!nearestSubzone,
      id: nearestSubzone ? nearestSubzone.properties.subzone_id : (nearestDistrict || 'TN-GEO'),
      name: nearestSubzone ? nearestSubzone.properties.name : `${nearestDistrict} Point`,
      type: nearestSubzone ? nearestSubzone.properties.type : 'Point Location',
      district: nearestSubzone ? nearestSubzone.properties.district : nearestDistrict,
      lat: lat,
      lon: lon,
      formattedCoords: `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E`,
      plusCode: plusCode,
      pincode: nearestSubzone ? nearestSubzone.properties.pincode : '600001',
      adminCode: nearestSubzone ? (nearestSubzone.properties.geocode ? nearestSubzone.properties.geocode.admin_code : nearestSubzone.properties.subzone_id) : `TN-MAP-${Math.floor(lat * 100)}`,
      enabled: nearestSubzone ? isSubzoneEnabled(nearestSubzone.properties.subzone_id) : isDistrictEnabled(nearestDistrict)
    };

    selectedZoneData = data;
    updateGeocodeBanner(data);
    openZoneDetail(data);
  }

  function handleSubzoneClick(feat, latlng) {
    const p = feat.properties;
    const lat = p.latitude;
    const lon = p.longitude;
    setMapClickMarker(latlng || [lat, lon]);

    const data = {
      isSubzone: true,
      id: p.subzone_id,
      name: p.name,
      type: p.type,
      district: p.district,
      lat: lat,
      lon: lon,
      formattedCoords: `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E`,
      plusCode: p.geocode ? p.geocode.plus_code : computePlusCode(lat, lon),
      pincode: p.pincode,
      adminCode: p.geocode ? p.geocode.admin_code : p.subzone_id,
      area: `${p.approx_area_sqkm || 25} km²`,
      enabled: isSubzoneEnabled(p.subzone_id)
    };

    selectedZoneData = data;
    updateGeocodeBanner(data);
    openZoneDetail(data);
  }

  function handleDistrictClick(feat, latlng) {
    const p = feat.properties;
    const lat = p.center ? p.center[0] : (latlng ? latlng.lat : TN_CENTER[0]);
    const lon = p.center ? p.center[1] : (latlng ? latlng.lng : TN_CENTER[1]);
    setMapClickMarker(latlng || [lat, lon]);

    const data = {
      isSubzone: false,
      id: p.district || feat.id,
      name: `${p.district} District`,
      type: 'Administrative District',
      district: p.district,
      lat: lat,
      lon: lon,
      formattedCoords: `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E`,
      plusCode: computePlusCode(lat, lon),
      pincode: p.dtcode ? `Code: ${p.dtcode}` : 'TN',
      adminCode: `TN-DT-${p.dtcode || '00'}`,
      area: p.shape_area ? `${(parseFloat(p.shape_area) / 1000000).toFixed(1)} km²` : '--',
      enabled: isDistrictEnabled(p.district || feat.id)
    };

    selectedZoneData = data;
    updateGeocodeBanner(data);
    openZoneDetail(data);
  }

  function findNearestFeature(lat, lon, features) {
    let best = null;
    let minDist = 0.15; // ~15km
    features.forEach(f => {
      const p = f.properties;
      const cLat = p.latitude || (p.center ? p.center[0] : null);
      const cLon = p.longitude || (p.center ? p.center[1] : null);
      if (cLat && cLon) {
        const d = Math.hypot(lat - cLat, lon - cLon);
        if (d < minDist) {
          minDist = d;
          best = f;
        }
      }
    });
    return best;
  }

  function setMapClickMarker(latlng) {
    if (clickMarker) map.removeLayer(clickMarker);
    clickMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'pulse-click-pin',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(map);
  }

  // --- Floating Geo Code Banner Update ---
  function updateGeocodeBanner(data) {
    elGcBannerName.textContent = data.name;
    elGcBannerType.textContent = data.type;
    elGcBannerCoords.textContent = data.formattedCoords;
    elGcBannerPluscode.textContent = data.plusCode;
    elGcBannerPincode.textContent = data.pincode;
    elGcBannerAdmincode.textContent = data.adminCode;

    const isLiveZone = data.isSubzone && isBackendZone(data.id);
    elBtnGeocodeToggle.disabled = isLiveZone;

    const unconfiguredDistrict =
      !data.isSubzone && isEmbedded() && !backendDistrictMap[data.district];

    if (isLiveZone) {
      elGcBannerStatus.className = 'geocode-status-badge badge-enabled';
      elGcBannerStatus.textContent = 'Live Backend Zone';
      elBtnGeocodeToggle.textContent = 'Managed in City Micro-Zones';
    } else if (unconfiguredDistrict) {
      elGcBannerStatus.className = 'geocode-status-badge badge-disabled';
      elGcBannerStatus.textContent = 'Not Configured';
      elBtnGeocodeToggle.textContent = 'Enable District';
    } else if (data.enabled) {
      elGcBannerStatus.className = 'geocode-status-badge badge-enabled';
      elGcBannerStatus.textContent = 'Active Service';
      elBtnGeocodeToggle.textContent = 'Disable Service';
    } else {
      elGcBannerStatus.className = 'geocode-status-badge badge-disabled';
      elGcBannerStatus.textContent = 'Inactive Service';
      elBtnGeocodeToggle.textContent = 'Enable Service';
    }

    elGeocodeBanner.classList.add('show');
  }

  function copyGeoCodeToClipboard(data) {
    const textToCopy = `Geo Code: ${data.formattedCoords} | Plus Code: ${data.plusCode} | Admin Code: ${data.adminCode} | Zone: ${data.name} (${data.type}) | Pincode: ${data.pincode}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`✓ Geo Code copied: ${data.formattedCoords}`);
    }).catch(() => {
      prompt('Copy this Geo Code:', textToCopy);
    });
  }

  // --- District GeoJSON Code Viewer & Exporter (Zero API Key) ---
  let activeModalGeoJsonData = null;

  function openDistrictGeoJsonModal(districtName) {
    let feat = null;
    if (districtName) {
      feat = districtFeatureMap.get(districtName);
    }
    if (!feat && selectedZoneData) {
      feat = districtFeatureMap.get(selectedZoneData.district);
    }
    if (!feat && districtFeatures.length > 0) {
      feat = districtFeatures[0];
    }
    if (!feat) {
      showToast('No district GeoJSON data available');
      return;
    }

    const name = feat.properties.district || feat.properties.name || 'District';
    activeModalGeoJsonData = feat;

    elGeoJsonTitle.textContent = `${name} District GeoJSON Code`;
    elGeoJsonMeta.textContent = `Properties: Code ${feat.properties.dtcode || '--'} | State: ${feat.properties.state_name || 'Tamil Nadu'} | BBox: ${feat.properties.bbox ? feat.properties.bbox.join(', ') : '--'}`;
    elGeoJsonCode.textContent = JSON.stringify(feat, null, 2);

    elModalGeoJson.style.display = 'flex';
  }

  function downloadGeoJsonFile(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }

  // --- New Zone Creation & Automated Spatial Analysis ---
  function openCreateZoneModal(prefillLat = null, prefillLon = null) {
    elModalCreateZone.style.display = 'flex';

    let lat = prefillLat || (drilledDistrict && districtFeatureMap.get(drilledDistrict) ? districtFeatureMap.get(drilledDistrict).properties.center[0] : 11.0168);
    let lon = prefillLon || (drilledDistrict && districtFeatureMap.get(drilledDistrict) ? districtFeatureMap.get(drilledDistrict).properties.center[1] : 76.9558);

    elNewZoneLat.value = lat.toFixed(4);
    elNewZoneLon.value = lon.toFixed(4);

    runSpatialAnalysis(lat, lon);
  }

  function runSpatialAnalysis(lat, lon) {
    const districtName = detectParentDistrict(lat, lon);
    const plusCode = computePlusCode(lat, lon);
    const radKm = parseFloat(elNewZoneRadius.value) || 6.0;
    const approxArea = (Math.PI * radKm * radKm).toFixed(1);
    const nextCustomNum = subzoneFeatures.length + 1;
    const adminCode = `TN-${districtName.slice(0, 3).toUpperCase()}-C${nextCustomNum}`;

    elAnalysisDistrict.textContent = `${districtName} District`;
    elAnalysisPluscode.textContent = plusCode;
    elAnalysisAdmincode.textContent = adminCode;
    elAnalysisArea.textContent = `${approxArea} km² (${radKm} km radius)`;

    return { districtName, plusCode, adminCode, approxArea, radKm };
  }

  function startPinDropMode() {
    isPinDropMode = true;
    elModalCreateZone.style.display = 'none';
    elPinModeBanner.style.display = 'flex';
    map.getContainer().style.cursor = 'crosshair';
    showToast('Click anywhere on the map to pinpoint your new zone location');
  }

  function cancelPinDropMode() {
    isPinDropMode = false;
    elPinModeBanner.style.display = 'none';
    map.getContainer().style.cursor = '';
    if (customZoneTempMarker) {
      map.removeLayer(customZoneTempMarker);
      customZoneTempMarker = null;
    }
  }

  function handlePinDrop(latlng) {
    cancelPinDropMode();
    setMapClickMarker(latlng);
    openCreateZoneModal(latlng.lat, latlng.lng);
  }

  function saveNewZone() {
    const name = elNewZoneName.value.trim();
    if (!name) {
      showToast('Please enter a Zone / Village Name');
      elNewZoneName.focus();
      return;
    }

    const lat = parseFloat(elNewZoneLat.value);
    const lon = parseFloat(elNewZoneLon.value);
    if (isNaN(lat) || isNaN(lon)) {
      showToast('Please provide valid Latitude and Longitude');
      return;
    }

    const analysis = runSpatialAnalysis(lat, lon);
    const zoneType = elNewZoneType.value;
    const pincode = elNewZonePincode.value.trim() || '600001';
    const isEnabled = elNewZoneStatus.checked;
    const notes = elNewZoneNotes.value.trim();

    const poly = generateCirclePolygon(lat, lon, analysis.radKm, 16);

    if (isEmbedded()) {
      postToParent({
        type: 'GEOZONE_REQUEST_CREATE_ZONE',
        payload: {
          name: name,
          district: analysis.districtName,
          city: analysis.districtName,
          lat: lat,
          lon: lon,
          radiusKm: analysis.radKm,
          polygon: { type: 'Polygon', coordinates: [poly] },
          pincode: pincode,
          type: zoneType,
          notes: notes,
          active: isEnabled,
          plusCode: analysis.plusCode,
          adminCode: analysis.adminCode,
          approxArea: analysis.approxArea
        }
      });

      elModalCreateZone.style.display = 'none';
      elNewZoneName.value = '';
      elNewZoneNotes.value = '';
      showToast('Opening City Zone form for final review...');
      return;
    }

    const newFeature = {
      type: 'Feature',
      id: analysis.adminCode,
      properties: {
        subzone_id: analysis.adminCode,
        name: name,
        district: analysis.districtName,
        state: 'Tamil Nadu',
        type: zoneType,
        pincode: pincode,
        latitude: lat,
        longitude: lon,
        geocode: {
          lat: lat,
          lon: lon,
          formatted: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
          plus_code: analysis.plusCode,
          admin_code: analysis.adminCode,
          pincode: pincode
        },
        radius_km: analysis.radKm,
        approx_area_sqkm: parseFloat(analysis.approxArea),
        notes: notes,
        isCustom: true
      },
      geometry: {
        type: 'Polygon',
        coordinates: [poly]
      }
    };

    // Store in lists
    subzoneFeatures.push(newFeature);
    customFeatures.push(newFeature);
    subzoneFeatureMap.set(analysis.adminCode, newFeature);
    subzoneState[analysis.adminCode] = isEnabled;
    saveStates();

    // Re-render subzones layer
    renderSubzoneLayers();
    if (!map.hasLayer(subzoneLayer)) map.addLayer(subzoneLayer);

    // Zoom to new zone
    map.flyTo([lat, lon], 12, { duration: 0.8 });

    // Close modal
    elModalCreateZone.style.display = 'none';
    elNewZoneName.value = '';
    elNewZoneNotes.value = '';

    updateKpis();
    renderSidebarList();
    if (drilledDistrict) updateDrilldownStats();

    showToast(`✓ Custom Zone "${name}" deployed and analyzed in ${analysis.districtName}!`);
  }

  // --- District Dropdown Populator ---
  function populateDistrictDropdown() {
    const districts = districtFeatures.map(f => f.properties.district).sort();
    elSelectDistrict.innerHTML = '<option value="ALL">All 37 Districts</option>';
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = `${d} District`;
      elSelectDistrict.appendChild(opt);
    });
  }

  // --- Sidebar Zone Directory Renderer ---
  function renderSidebarList() {
    let itemsToRender = [];

    if (currentMode === 'DISTRICTS' && !drilledDistrict) {
      const regionSet = activeRegionFilter !== 'ALL' && TN_REGIONS[activeRegionFilter]
        ? new Set(TN_REGIONS[activeRegionFilter].map(n => n.toLowerCase()))
        : null;

      itemsToRender = districtFeatures.filter(f => {
        const name = f.properties.district;
        const isEn = isDistrictEnabled(name);
        if (regionSet && !regionSet.has(name.toLowerCase())) return false;
        if (activeStatusFilter === 'ENABLED' && !isEn) return false;
        if (activeStatusFilter === 'DISABLED' && isEn) return false;
        if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      }).map(f => ({
        isSubzone: false,
        id: f.properties.district,
        name: f.properties.district,
        sub: `Tamil Nadu &bull; Code: ${f.properties.dtcode || '--'} &bull; Click to Drill Down`,
        enabled: isDistrictEnabled(f.properties.district),
        feat: f
      }));

    } else {
      // Subzones (Cities & Villages)
      const targetDist = drilledDistrict || (activeParentDistrictFilter !== 'ALL' ? activeParentDistrictFilter : null);

      itemsToRender = subzoneFeatures.filter(f => {
        const p = f.properties;
        const id = p.subzone_id;
        const isEn = isSubzoneEnabled(id);

        if (
          targetDist &&
          normalizeDistrictName(p.district) !== normalizeDistrictName(targetDist)
        ) {
          return false;
        }
        if (activeStatusFilter === 'ENABLED' && !isEn) return false;
        if (activeStatusFilter === 'DISABLED' && isEn) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match = p.name.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.pincode.includes(q) ||
            p.type.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      }).map(f => {
        const id = f.properties.subzone_id;
        const isLive = isBackendZone(id);
        const badge = isLive
          ? '<span class="zone-live-badge">LIVE</span>'
          : (isEmbedded() ? '<span class="zone-preview-badge">PREVIEW</span>' : '');
        return {
          isSubzone: true,
          id: id,
          name: f.properties.name,
          sub: `${f.properties.district} &bull; <span class="zone-cat-badge">${f.properties.type}</span> &bull; Pin: ${f.properties.pincode || '--'} ${badge}`,
          enabled: isSubzoneEnabled(id),
          isLive: isLive,
          feat: f
        };
      });
    }

    elFilteredCountBadge.textContent = `${itemsToRender.length} Zones`;

    if (itemsToRender.length === 0) {
      elZonesList.innerHTML = `<div class="empty-state"><p>No zones match your filters.</p></div>`;
      return;
    }

    let html = '';
    itemsToRender.forEach(item => {
      const isSelected = selectedZoneData && selectedZoneData.id === item.id;
      html += `
        <div class="zone-item ${item.enabled ? 'enabled' : 'disabled'} ${isSelected ? 'is-selected' : ''}" data-id="${item.id}" data-is-subzone="${item.isSubzone}">
          <div class="zone-item-left">
            <span class="zone-status-indicator"></span>
            <div class="zone-item-info">
              <span class="zone-item-name">${escapeHtml(item.name)}</span>
              <span class="zone-item-sub">${item.sub}</span>
            </div>
          </div>
          <div class="zone-item-actions">
            <label class="switch" title="${item.isLive ? 'Managed in City Micro-Zones' : 'Toggle Service Availability'}">
              <input type="checkbox" class="sidebar-toggle-switch" data-id="${item.id}" data-is-subzone="${item.isSubzone}" ${item.enabled ? 'checked' : ''} ${item.isLive ? 'disabled' : ''}>
              <span class="slider-toggle"></span>
            </label>
          </div>
        </div>
      `;
    });

    elZonesList.innerHTML = html;

    elZonesList.querySelectorAll('.zone-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('.switch')) return;
        const id = el.dataset.id;
        const isSub = el.dataset.isSubzone === 'true';
        if (isSub) {
          const feat = subzoneFeatureMap.get(id);
          if (feat) {
            handleSubzoneClick(feat, [feat.properties.latitude, feat.properties.longitude]);
            map.flyTo([feat.properties.latitude, feat.properties.longitude], 12, { duration: 0.8 });
          }
        } else {
          drillDownToDistrict(id);
        }
      });
    });

    elZonesList.querySelectorAll('.sidebar-toggle-switch').forEach(sw => {
      sw.addEventListener('change', () => {
        const id = sw.dataset.id;
        const isSub = sw.dataset.isSubzone === 'true';
        if (isBackendZone(id)) {
          showToast('Live zones are managed from City Micro-Zones.');
          renderSidebarList();
          return;
        }
        setZoneStatus(id, isSub, sw.checked);
        if (!isSub && isEmbedded()) return;
        if (isSub && isEmbedded()) return;
        showToast(`${id} service ${sw.checked ? 'ENABLED' : 'DISABLED'}`);
      });
    });
  }

  // --- Inspector Drawer Details ---
  function openZoneDetail(data) {
    elDetailDistrictName.textContent = data.name;
    elDetailStateName.textContent = `${data.district}, Tamil Nadu`;
    elDetailCoords.textContent = data.formattedCoords;
    elDetailPluscode.textContent = data.plusCode;
    elDetailDtcode.textContent = data.adminCode;
    elDetailPincode.textContent = data.pincode;
    elDetailZoneType.textContent = data.type;
    elDetailArea.textContent = data.area || '-- km²';

    if (!data.isSubzone) {
      elBtnDetailDrilldown.style.display = 'block';
    } else {
      elBtnDetailDrilldown.style.display = 'none';
    }

    const canEditDistrict = !data.isSubzone && !!backendDistrictMap[data.district];
    if (elBtnDetailEditAdmin) {
      elBtnDetailEditAdmin.style.display = canEditDistrict ? 'block' : 'none';
    }

    const liveZone = data.isSubzone && isBackendZone(data.id);
    elDetailServiceSwitch.disabled = liveZone;
    elBtnGeocodeToggle.disabled = liveZone;

    syncDetailDrawer();
    elDetailDrawer.classList.add('open');
  }

  function syncDetailDrawer() {
    if (!selectedZoneData) return;

    const isSub = selectedZoneData.isSubzone;
    const isLive = isSub && isBackendZone(selectedZoneData.id);
    const isEn = isSub
      ? isSubzoneEnabled(selectedZoneData.id)
      : isDistrictEnabled(selectedZoneData.id);

    elDetailServiceSwitch.checked = isEn;
    elDetailServiceSwitch.disabled = isLive;
    elBtnGeocodeToggle.disabled = isLive;

    if (isLive) {
      elDetailStatusPill.className = 'detail-status-pill status-active';
      elDetailStatusPill.textContent = '● Live Backend Zone';
      return;
    }

    if (!isSub && isEmbedded() && !backendDistrictMap[selectedZoneData.district]) {
      elDetailStatusPill.className = 'detail-status-pill status-inactive';
      elDetailStatusPill.textContent = '○ Not Configured in Backend';
      return;
    }

    if (isSub && isEmbedded()) {
      elDetailStatusPill.className = isEn
        ? 'detail-status-pill status-active'
        : 'detail-status-pill status-inactive';
      elDetailStatusPill.textContent = isEn
        ? '◐ Preview Active'
        : '◐ Preview Inactive';
      return;
    }

    if (isEn) {
      elDetailStatusPill.className = 'detail-status-pill status-active';
      elDetailStatusPill.textContent = '✓ Service Active';
    } else {
      elDetailStatusPill.className = 'detail-status-pill status-inactive';
      elDetailStatusPill.textContent = '✕ Service Disabled';
    }
  }

  // --- KPI Updates ---
  function updateKpis() {
    let enabledCount = 0;
    let totalCount = 0;

    if (currentMode === 'DISTRICTS') {
      totalCount = districtFeatures.length;
      districtFeatures.forEach(f => {
        if (isDistrictEnabled(f.properties.district)) enabledCount++;
      });
    } else if (currentMode === 'SUBZONES') {
      totalCount = subzoneFeatures.length;
      subzoneFeatures.forEach(f => {
        if (isSubzoneEnabled(f.properties.subzone_id)) enabledCount++;
      });
    } else {
      totalCount = districtFeatures.length + subzoneFeatures.length;
      districtFeatures.forEach(f => {
        if (isDistrictEnabled(f.properties.district)) enabledCount++;
      });
      subzoneFeatures.forEach(f => {
        if (isSubzoneEnabled(f.properties.subzone_id)) enabledCount++;
      });
    }

    const disabledCount = totalCount - enabledCount;
    const coveragePct = totalCount > 0 ? ((enabledCount / totalCount) * 100).toFixed(1) : 0;

    elKpiEnabled.textContent = enabledCount;
    elKpiDisabled.textContent = disabledCount;
    elKpiCoverage.textContent = coveragePct + '%';
    elKpiStatesCovered.textContent = `${enabledCount}/${totalCount} Units`;
    elKpiProgress.style.width = coveragePct + '%';

    elTabCountAll.textContent = totalCount;
    elTabCountEnabled.textContent = enabledCount;
    elTabCountDisabled.textContent = disabledCount;
  }

  // --- Quick Map Search ---
  function setupQuickSearch() {
    elMapQuickSearch.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        elQuickSearchResults.style.display = 'none';
        elBtnClearSearch.style.display = 'none';
        return;
      }
      elBtnClearSearch.style.display = 'block';

      const subMatches = subzoneFeatures.filter(f => {
        const p = f.properties;
        return p.name.toLowerCase().includes(q) || p.pincode.includes(q) || p.district.toLowerCase().includes(q);
      }).slice(0, 5);

      const distMatches = districtFeatures.filter(f => {
        return f.properties.district.toLowerCase().includes(q);
      }).slice(0, 3);

      if (subMatches.length === 0 && distMatches.length === 0) {
        elQuickSearchResults.innerHTML = `<div style="padding: 10px; color: var(--text-muted); font-size: 0.78rem; text-align: center;">No matches found</div>`;
      } else {
        let html = '';
        subMatches.forEach(f => {
          const p = f.properties;
          const isEn = isSubzoneEnabled(p.subzone_id);
          html += `
            <div class="quick-result-item" data-id="${p.subzone_id}" data-type="subzone">
              <div class="quick-result-info">
                <span class="quick-result-name">${escapeHtml(p.name)}</span>
                <span class="quick-result-state">${p.district} &bull; ${p.type} &bull; ${p.pincode}</span>
              </div>
              <span class="tooltip-badge ${isEn ? 'badge-enabled' : 'badge-disabled'}">${isEn ? 'Active' : 'Disabled'}</span>
            </div>
          `;
        });

        distMatches.forEach(f => {
          const d = f.properties.district;
          const isEn = isDistrictEnabled(d);
          html += `
            <div class="quick-result-item" data-id="${d}" data-type="district">
              <div class="quick-result-info">
                <span class="quick-result-name">${d} District</span>
                <span class="quick-result-state">Tamil Nadu Administrative District</span>
              </div>
              <span class="tooltip-badge ${isEn ? 'badge-enabled' : 'badge-disabled'}">${isEn ? 'Active' : 'Disabled'}</span>
            </div>
          `;
        });

        elQuickSearchResults.innerHTML = html;

        elQuickSearchResults.querySelectorAll('.quick-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const id = item.dataset.id;
            const type = item.dataset.type;
            if (type === 'subzone') {
              const feat = subzoneFeatureMap.get(id);
              if (feat) {
                handleSubzoneClick(feat);
                map.flyTo([feat.properties.latitude, feat.properties.longitude], 12);
              }
            } else {
              drillDownToDistrict(id);
            }
            elQuickSearchResults.style.display = 'none';
          });
        });
      }

      elQuickSearchResults.style.display = 'flex';
    });

    elBtnClearSearch.addEventListener('click', () => {
      elMapQuickSearch.value = '';
      elQuickSearchResults.style.display = 'none';
      elBtnClearSearch.style.display = 'none';
    });
  }

  // --- Attach UI Handlers ---
  function initEvents() {
    // Mode Switchers
    elModeDistricts.addEventListener('click', () => { if (drilledDistrict) exitDrilldown(); applyViewMode('DISTRICTS'); });
    elModeSubzones.addEventListener('click', () => { applyViewMode('SUBZONES'); });
    elModeCombined.addEventListener('click', () => { applyViewMode('COMBINED'); });

    // Drill-down banner
    elBtnExitDrilldown.addEventListener('click', exitDrilldown);
    elBtnDdAddZone.addEventListener('click', () => openCreateZoneModal());
    elBtnDdEnableAll.addEventListener('click', () => {
      if (!drilledDistrict) return;
      subzoneFeatures
        .filter(
          f =>
            !isBackendZone(f.properties.subzone_id) &&
            normalizeDistrictName(f.properties.district) === normalizeDistrictName(drilledDistrict)
        )
        .forEach(f => {
          subzoneState[f.properties.subzone_id] = true;
          updateSubzoneLayerStyle(f.properties.subzone_id);
        });
      saveStates();
      updateDrilldownStats();
      renderSidebarList();
      if (isEmbedded()) showSubzonePreviewNotice();
      showToast(`All preview sub-zones in ${drilledDistrict} ENABLED`);
    });

    elBtnDdDisableAll.addEventListener('click', () => {
      if (!drilledDistrict) return;
      subzoneFeatures
        .filter(
          f =>
            !isBackendZone(f.properties.subzone_id) &&
            normalizeDistrictName(f.properties.district) === normalizeDistrictName(drilledDistrict)
        )
        .forEach(f => {
          subzoneState[f.properties.subzone_id] = false;
          updateSubzoneLayerStyle(f.properties.subzone_id);
        });
      saveStates();
      updateDrilldownStats();
      renderSidebarList();
      if (isEmbedded()) showSubzonePreviewNotice();
      showToast(`All preview sub-zones in ${drilledDistrict} DISABLED`);
    });

    // Create Zone Modal
    elBtnOpenCreateZone.addEventListener('click', () => openCreateZoneModal());
    elBtnCloseModal.addEventListener('click', () => { elModalCreateZone.style.display = 'none'; });
    elBtnCancelCreate.addEventListener('click', () => { elModalCreateZone.style.display = 'none'; });
    elBtnTriggerPinMode.addEventListener('click', startPinDropMode);
    elBtnCancelPinMode.addEventListener('click', cancelPinDropMode);

    elNewZoneLat.addEventListener('input', () => {
      const lat = parseFloat(elNewZoneLat.value);
      const lon = parseFloat(elNewZoneLon.value);
      if (!isNaN(lat) && !isNaN(lon)) runSpatialAnalysis(lat, lon);
    });

    elNewZoneLon.addEventListener('input', () => {
      const lat = parseFloat(elNewZoneLat.value);
      const lon = parseFloat(elNewZoneLon.value);
      if (!isNaN(lat) && !isNaN(lon)) runSpatialAnalysis(lat, lon);
    });

    elNewZoneRadius.addEventListener('input', e => {
      const rad = parseFloat(e.target.value);
      elNewZoneRadiusVal.textContent = `${rad} km`;
      const lat = parseFloat(elNewZoneLat.value);
      const lon = parseFloat(elNewZoneLon.value);
      if (!isNaN(lat) && !isNaN(lon)) runSpatialAnalysis(lat, lon);
    });

    elBtnSaveNewZone.addEventListener('click', saveNewZone);

    // Sidebar Toggle
    elBtnToggleSidebar.addEventListener('click', () => {
      elSidebar.classList.toggle('collapsed');
      setTimeout(() => map.invalidateSize(), 300);
    });

    elBtnCloseSidebar.addEventListener('click', () => {
      elSidebar.classList.add('collapsed');
      setTimeout(() => map.invalidateSize(), 300);
    });

    // Basemaps
    document.querySelectorAll('.btn-basemap').forEach(btn => {
      btn.addEventListener('click', () => setBasemap(btn.dataset.layer));
    });

    // Opacity
    elOpacitySlider.addEventListener('input', e => {
      currentOpacity = parseInt(e.target.value, 10) / 100;
      elOpacityValue.textContent = `${e.target.value}%`;
      districtFeatures.forEach(f => updateDistrictLayerStyle(f.properties.district || f.id));
      subzoneFeatures.forEach(f => updateSubzoneLayerStyle(f.properties.subzone_id));
    });

    // Reset View
    elBtnResetView.addEventListener('click', () => {
      if (drilledDistrict) exitDrilldown();
      map.fitBounds(TN_BOUNDS, { padding: [30, 30] });
    });

    // Floating Geo Code Banner actions
    elBtnCloseGeocode.addEventListener('click', () => {
      elGeocodeBanner.classList.remove('show');
    });

    elBtnCopyGeocode.addEventListener('click', () => {
      if (selectedZoneData) copyGeoCodeToClipboard(selectedZoneData);
    });

    if (elBtnViewDistrictGeoJson) {
      elBtnViewDistrictGeoJson.addEventListener('click', () => {
        const distName = selectedZoneData ? selectedZoneData.district : null;
        openDistrictGeoJsonModal(distName);
      });
    }

    if (elBtnHeaderGeoJson) {
      elBtnHeaderGeoJson.addEventListener('click', () => {
        const distName = drilledDistrict || (selectedZoneData ? selectedZoneData.district : 'Chennai');
        openDistrictGeoJsonModal(distName);
      });
    }

    // GeoJSON Code Modal Controls
    if (elBtnCloseGeoJsonModal) {
      elBtnCloseGeoJsonModal.addEventListener('click', () => {
        elModalGeoJson.style.display = 'none';
      });
    }

    if (elBtnDoneGeoJsonModal) {
      elBtnDoneGeoJsonModal.addEventListener('click', () => {
        elModalGeoJson.style.display = 'none';
      });
    }

    if (elBtnCopyModalGeoJson) {
      elBtnCopyModalGeoJson.addEventListener('click', () => {
        if (!activeModalGeoJsonData) return;
        navigator.clipboard.writeText(JSON.stringify(activeModalGeoJsonData, null, 2)).then(() => {
          showToast('District GeoJSON code copied to clipboard!');
        }).catch(() => {
          showToast('Failed to copy to clipboard');
        });
      });
    }

    if (elBtnDownloadModalGeoJson) {
      elBtnDownloadModalGeoJson.addEventListener('click', () => {
        if (!activeModalGeoJsonData) return;
        const name = (activeModalGeoJsonData.properties.district || 'district').toLowerCase().replace(/\s+/g, '_');
        downloadGeoJsonFile(activeModalGeoJsonData, `${name}_district.geojson`);
      });
    }

    if (elBtnDownloadAllTnGeoJson) {
      elBtnDownloadAllTnGeoJson.addEventListener('click', () => {
        const fc = {
          type: 'FeatureCollection',
          name: 'Tamil_Nadu_Districts',
          features: districtFeatures
        };
        downloadGeoJsonFile(fc, 'tamilnadu_districts.geojson');
      });
    }

    elBtnDetailCopyGeocode.addEventListener('click', () => {
      if (selectedZoneData) copyGeoCodeToClipboard(selectedZoneData);
    });

    elBtnGeocodeToggle.addEventListener('click', () => {
      if (!selectedZoneData) return;
      const isEn = selectedZoneData.isSubzone
        ? isSubzoneEnabled(selectedZoneData.id)
        : isDistrictEnabled(selectedZoneData.id);
      setZoneStatus(selectedZoneData.id, selectedZoneData.isSubzone, !isEn);
    });

    // Detail Drawer
    elBtnCloseDetail.addEventListener('click', () => {
      elDetailDrawer.classList.remove('open');
    });

    elDetailServiceSwitch.addEventListener('change', e => {
      if (!selectedZoneData) return;
      setZoneStatus(selectedZoneData.id, selectedZoneData.isSubzone, e.target.checked);
    });

    elBtnDetailFlyto.addEventListener('click', () => {
      if (!selectedZoneData) return;
      map.flyTo([selectedZoneData.lat, selectedZoneData.lon], 12, { duration: 0.8 });
    });

    elBtnDetailDrilldown.addEventListener('click', () => {
      if (!selectedZoneData || selectedZoneData.isSubzone) return;
      drillDownToDistrict(selectedZoneData.district);
    });

    // Filters
    elSelectRegion.addEventListener('change', e => {
      activeRegionFilter = e.target.value;
      renderSidebarList();
    });

    elSelectDistrict.addEventListener('change', e => {
      activeParentDistrictFilter = e.target.value;
      if (activeParentDistrictFilter !== 'ALL') {
        drillDownToDistrict(activeParentDistrictFilter);
      } else {
        exitDrilldown();
      }
    });

    // Status Filter Tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeStatusFilter = tab.dataset.status;
        renderSidebarList();
      });
    });

    elSidebarSearch.addEventListener('input', e => {
      searchQuery = e.target.value.trim();
      renderSidebarList();
    });

    setupQuickSearch();

    // Batch Actions Menu
    elBulkMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      elBulkMenuBtn.parentElement.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      elBulkMenuBtn.parentElement.classList.remove('open');
    });

    elBtnBulkEnableAll.addEventListener('click', () => {
      if (currentMode === 'DISTRICTS') {
        if (isEmbedded()) {
          const missing = districtFeatures.filter(
            f => !backendDistrictMap[f.properties.district]
          ).length;
          if (missing > 0) {
            const confirmed = window.confirm(
              `Enable all districts?\n\n${missing} district(s) are not configured yet and will be created in the backend with their official boundaries.`
            );
            if (!confirmed) return;
          }
          postToParent({
            type: 'GEOZONE_BULK_TOGGLE',
            mode: currentMode,
            status: true,
            createMissing: missing > 0
          });
          showToast(
            missing > 0
              ? `Creating ${missing} missing district(s) and enabling the rest...`
              : 'Enabling all configured districts...'
          );
          return;
        }
        districtFeatures.forEach(f => { districtState[f.properties.district] = true; updateDistrictLayerStyle(f.properties.district); });
      } else {
        subzoneFeatures.forEach(f => { subzoneState[f.properties.subzone_id] = true; updateSubzoneLayerStyle(f.properties.subzone_id); });
        if (isEmbedded()) showSubzonePreviewNotice();
      }
      saveStates();
      updateKpis();
      renderSidebarList();
      showToast('All zones enabled in current view');
    });

    elBtnBulkDisableAll.addEventListener('click', () => {
      if (currentMode === 'DISTRICTS') {
        if (isEmbedded()) {
          postToParent({
            type: 'GEOZONE_BULK_TOGGLE',
            mode: currentMode,
            status: false,
            createMissing: false
          });
          showToast('Disabling all configured districts...');
          return;
        }
        districtFeatures.forEach(f => { districtState[f.properties.district] = false; updateDistrictLayerStyle(f.properties.district); });
      } else {
        subzoneFeatures.forEach(f => { subzoneState[f.properties.subzone_id] = false; updateSubzoneLayerStyle(f.properties.subzone_id); });
        if (isEmbedded()) showSubzonePreviewNotice();
      }
      saveStates();
      updateKpis();
      renderSidebarList();
      showToast('All zones disabled in current view');
    });

    elBtnPresetMetro.addEventListener('click', () => {
      subzoneFeatures.forEach(f => {
        const isCore = f.properties.type.includes('City') || f.properties.subzone_id.endsWith('-01');
        subzoneState[f.properties.subzone_id] = isCore;
        updateSubzoneLayerStyle(f.properties.subzone_id);
      });
      saveStates();
      updateKpis();
      renderSidebarList();
      showToast('Top City & Hub zones enabled');
    });

    elBtnPresetReset.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY_DISTRICTS);
      localStorage.removeItem(STORAGE_KEY_SUBZONES);
      localStorage.removeItem(STORAGE_KEY_CUSTOM_ZONES);
      districtState = {};
      subzoneState = {};
      customFeatures = [];
      location.reload();
    });

    // Export & Import
    elBtnExport.addEventListener('click', () => {
      const exportData = {
        version: '3.0',
        exportedAt: new Date().toISOString(),
        state: 'Tamil Nadu',
        districts: districtState,
        subzones: subzoneState,
        customFeatures: customFeatures
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tamilnadu_zones_and_custom_villages_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Zone configurations exported');
    });

    elImportFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const data = JSON.parse(evt.target.result);
          if (data.districts || data.subzones) {
            if (data.districts) districtState = data.districts;
            if (data.subzones) subzoneState = data.subzones;
            if (data.customFeatures) customFeatures = data.customFeatures;
            saveStates();
            location.reload();
          }
        } catch (err) {
          alert('Failed to parse JSON configuration: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Close App button -> notify parent RightTouch Dashboard
    const elBtnCloseApp = document.getElementById('btn-close-app');
    if (elBtnCloseApp) {
      elBtnCloseApp.addEventListener('click', () => {
        postToParent({ type: 'GEOZONE_CLOSE' });
      });
    }

    // Edit district button -> notify parent RightTouch Dashboard
    if (elBtnDetailEditAdmin) {
      elBtnDetailEditAdmin.addEventListener('click', () => {
        if (!selectedZoneData || selectedZoneData.isSubzone) return;
        const record = backendDistrictMap[selectedZoneData.district] || null;
        postToParent({
          type: 'GEOZONE_EDIT_DISTRICT',
          districtName: selectedZoneData.district,
          recordId: record ? (record._id || record.id) : null
        });
      });
    }

    // Drill down button -> notify parent
    if (elBtnDetailDrilldown) {
      elBtnDetailDrilldown.addEventListener('click', () => {
        if (selectedZoneData && !selectedZoneData.isSubzone) {
          postToParent({
            type: 'GEOZONE_DRILLDOWN',
            districtName: selectedZoneData.name
          });
        }
      });
    }

    // Listen for backend data synchronization from parent RightTouch Admin Dashboard
    window.addEventListener('message', (event) => {
      if (!isEmbedded()) return;
      if (event.source !== window.parent) return;
      if (event.origin !== window.location.origin) return;
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'SYNC_DISTRICTS') {
        applyBackendDistricts(event.data.districts);
      } else if (event.data.type === 'SYNC_ZONES') {
        applyBackendZones(event.data.zones);
      } else if (event.data.type === 'GEOZONE_FOCUS_DISTRICT') {
        focusDistrictByName(event.data.districtName);
      }
    });

    // Embedded dashboard labels
    if (isEmbedded()) {
      document.body.classList.add('embedded-mode');
      const backendBadge = document.getElementById('embedded-backend-badge');
      if (backendBadge) backendBadge.style.display = 'inline-flex';
      const subzoneNotice = document.getElementById('embedded-subzone-notice');
      if (subzoneNotice) subzoneNotice.style.display = 'flex';
    }

  }

  // --- Utility ---
  let toastTimer = null;
  function showToast(msg) {
    elToastMessage.textContent = msg;
    elToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elToast.classList.remove('show'), 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
