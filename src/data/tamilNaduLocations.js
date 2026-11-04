import DISTRICT_BOUNDARIES from "./tamilNaduDistrictBoundaries.json";
import {
  TAMIL_NADU_DISTRICTS,
  TAMIL_NADU_CITIES,
  TAMIL_NADU_SUBZONES,
  CITY_LOOKUP,
  getCitiesByDistrict,
  getSubzonesByDistrict,
  generateCircularGeoJSON,
  calculatePolygonCentroid,
  isPointInPolygon,
  computePlusCode,
} from "./tamilNaduDistrictsData";

export {
  TAMIL_NADU_CITIES,
  TAMIL_NADU_DISTRICTS,
  TAMIL_NADU_SUBZONES,
  DISTRICT_BOUNDARIES,
  CITY_LOOKUP,
  getCitiesByDistrict,
  getSubzonesByDistrict,
  generateCircularGeoJSON,
  calculatePolygonCentroid,
  isPointInPolygon,
  computePlusCode,
};

/**
 * Returns the official Survey of India boundary GeoJSON (Polygon / MultiPolygon)
 * for any Tamil Nadu district, code, alias, or city/taluk name.
 */
export const getTnDistrictBoundary = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // 1. Direct key match
  if (DISTRICT_BOUNDARIES[raw]) return DISTRICT_BOUNDARIES[raw];

  // 2. Lowercase key match
  const lower = raw.toLowerCase();
  if (DISTRICT_BOUNDARIES[lower]) return DISTRICT_BOUNDARIES[lower];

  // 3. Resolve canonical district through findTnDistrict
  const resolved = findTnDistrict(raw);
  if (resolved?.name) {
    if (DISTRICT_BOUNDARIES[resolved.name]) return DISTRICT_BOUNDARIES[resolved.name];
    const rLower = resolved.name.toLowerCase();
    if (DISTRICT_BOUNDARIES[rLower]) return DISTRICT_BOUNDARIES[rLower];
  }

  // 4. Normalized name
  const norm = normalizeLocationName(raw);
  if (DISTRICT_BOUNDARIES[norm]) return DISTRICT_BOUNDARIES[norm];

  return null;
};

/**
 * Returns the full official Survey of India geocode record
 * including official boundary polygon, center lat/lng, dtcode, bbox, and metadata.
 */
export const getOfficialDistrictGeocode = (value) => {
  const d = findTnDistrict(value);
  if (!d) return null;
  const boundary = getTnDistrictBoundary(d.name);
  return {
    name: d.name,
    code: d.code,
    dtcode: d.dtcode,
    lat: d.lat || d.center?.[0],
    lng: d.lng || d.center?.[1],
    center: d.center || [d.lat, d.lng],
    bbox: d.bbox,
    polygon: boundary,
    shape_area: d.shape_area,
    shape_length: d.shape_length,
  };
};

const DISTRICT_ALIASES = {
  villupuram: "Viluppuram",
  viluppuram: "Viluppuram",
  vizhupuram: "Viluppuram",
  kancheepuram: "Kanchipuram",
  kanchipuram: "Kanchipuram",
  kanniyakumari: "Kanyakumari",
  kanyakumari: "Kanyakumari",
  "the nilgiris": "Nilgiris",
  nilgiri: "Nilgiris",
  nilgiris: "Nilgiris",
  tuticorin: "Thoothukudi",
  thoothukudi: "Thoothukudi",
  tiruchirappalli: "Tiruchirappalli",
  tiruchirapalli: "Tiruchirappalli",
  trichy: "Tiruchirappalli",
  tirupur: "Tiruppur",
  tiruppur: "Tiruppur",
  thiruvallur: "Tiruvallur",
  tiruvallur: "Tiruvallur",
  thiruvannamalai: "Tiruvannamalai",
  tiruvannamalai: "Tiruvannamalai",
  thiruvarur: "Tiruvarur",
  tiruvarur: "Tiruvarur",
  sivagangai: "Sivaganga",
  sivaganga: "Sivaganga",
  virudhunagai: "Virudhunagar",
  virudhunagar: "Virudhunagar",
  chengalpet: "Chengalpattu",
  chengalpattu: "Chengalpattu",
  tirupattur: "Tirupathur",
  tirupathur: "Tirupathur",
  ranipettai: "Ranipet",
  ranipet: "Ranipet",
  mayavaram: "Mayiladuthurai",
  mayiladuthurai: "Mayiladuthurai",
};

export const normalizeLocationName = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[.,]/g, " ")
    .replace(
      /\b(district|revenue|operational|range|hub|zone|taluk|town|city)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

const canonicalDistrictName = (district) =>
  normalizeLocationName(district?.name || "");

export const findTnDistrict = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const code = raw.toUpperCase();
  const byCode = TAMIL_NADU_DISTRICTS.find((d) => d.code === code);
  if (byCode) return byCode;

  const normalized = normalizeLocationName(raw);
  if (!normalized) return null;

  const exact = TAMIL_NADU_DISTRICTS.find(
    (d) => canonicalDistrictName(d) === normalized
  );
  if (exact) return exact;

  const aliasTarget = DISTRICT_ALIASES[normalized];
  if (aliasTarget) {
    const aliased = TAMIL_NADU_DISTRICTS.find(
      (d) => d.name === aliasTarget
    );
    if (aliased) return aliased;
  }

  const cityExact = TAMIL_NADU_CITIES.find(
    (city) => normalizeLocationName(city.name) === normalized
  );
  if (cityExact) {
    const cityDistrict = TAMIL_NADU_DISTRICTS.find(
      (d) => canonicalDistrictName(d) === normalizeLocationName(cityDistrictSafe(cityExact))
    );
    if (cityDistrict) return cityDistrict;
  }

  const cityContains = TAMIL_NADU_CITIES.find((city) => {
    const cityName = normalizeLocationName(city.name);
    return (
      cityName.length > 3 &&
      (normalized.includes(cityName) || cityName.includes(normalized))
    );
  });
  if (cityContains) {
    const cityDistrict = TAMIL_NADU_DISTRICTS.find(
      (d) => canonicalDistrictName(d) === normalizeLocationName(cityDistrictSafe(cityContains))
    );
    if (cityDistrict) return cityDistrict;
  }

  return (
    TAMIL_NADU_DISTRICTS.find((d) => {
      const districtName = canonicalDistrictName(d);
      return (
        districtName.length > 3 &&
        (normalized.includes(districtName) ||
          districtName.includes(normalized))
      );
    }) || null
  );
};

function cityDistrictSafe(city) {
  return city?.district || "";
}

export const findTnCity = (value, districtName = "") => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const scope = districtName
    ? getDistrictCities(districtName)
    : TAMIL_NADU_CITIES;
  const normalized = normalizeLocationName(raw);
  if (!normalized) return null;

  const exact = scope.find(
    (city) => normalizeLocationName(city.name) === normalized
  );
  if (exact) return exact;

  const byCode = scope.find(
    (city) => String(city.code || "").toUpperCase() === raw.toUpperCase()
  );
  if (byCode) return byCode;

  return (
    scope.find((city) => {
      const cityName = normalizeLocationName(city.name);
      return (
        cityName.length > 2 &&
        (cityName.includes(normalized) || normalized.includes(cityName))
      );
    }) || null
  );
};

export const getDistrictCities = (districtNameOrCity) => {
  const district = findTnDistrict(districtNameOrCity);
  const target = district
    ? canonicalDistrictName(district)
    : normalizeLocationName(districtNameOrCity);
  if (!target) return [];

  const seen = new Set();
  const matches = TAMIL_NADU_CITIES.filter((city) => {
    const cityDistrict = normalizeLocationName(city.district);
    return (
      cityDistrict === target ||
      cityDistrict.includes(target) ||
      target.includes(cityDistrict)
    );
  }).filter((city) => {
    const key = normalizeLocationName(city.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return matches.sort((a, b) => {
    const aHq = normalizeLocationName(a.name) === target ? 0 : 1;
    const bHq = normalizeLocationName(b.name) === target ? 0 : 1;
    if (aHq !== bHq) return aHq - bHq;
    return a.name.localeCompare(b.name);
  });
};

export const getDistrictForCity = (cityName) => {
  const city = findTnCity(cityName);
  if (city) return findTnDistrict(city.district) || findTnDistrict(city.name);
  return findTnDistrict(cityName);
};

export const findTnDistrictForRecord = (record) => {
  if (!record) return null;
  return (
    findTnDistrict(record.city) ||
    findTnDistrict(record.name) ||
    findTnDistrict(record.code) ||
    null
  );
};

export const findConfiguredDistrictForTnName = (tnDistrictName, districts = []) => {
  const target = findTnDistrict(tnDistrictName);
  if (!target) return null;
  return (
    (districts || []).find(
      (record) => findTnDistrictForRecord(record)?.name === target.name
    ) || null
  );
};

export const getAvailableDistrictName = (cityName, existingDistrictsList = []) => {
  const existingNames = new Set(
    (existingDistrictsList || []).map((district) =>
      String(district.name || "").toLowerCase().trim()
    )
  );
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

export const getTnLocationKey = (name, district = "") =>
  `${normalizeLocationName(district)}:${normalizeLocationName(name)}`;

export const getTnDistrict = (value) => findTnDistrict(value);

export const detectParentDistrict = (lat, lon) => {
  const nLat = Number(lat);
  const nLon = Number(lon);
  if (isNaN(nLat) || isNaN(nLon)) return null;

  for (const d of TAMIL_NADU_DISTRICTS) {
    const boundary = DISTRICT_BOUNDARIES[d.name] || DISTRICT_BOUNDARIES[d.name.toLowerCase()];
    if (!boundary) continue;

    if (d.bbox && Array.isArray(d.bbox)) {
      const [minLng, minLat, maxLng, maxLat] = d.bbox;
      if (nLon < minLng - 0.05 || nLon > maxLng + 0.05 || nLat < minLat - 0.05 || nLat > maxLat + 0.05) {
        continue;
      }
    }

    if (boundary.type === "Polygon" && boundary.coordinates?.[0]) {
      if (isPointInPolygon([nLon, nLat], boundary.coordinates[0])) {
        return d;
      }
    } else if (boundary.type === "MultiPolygon" && boundary.coordinates) {
      for (const poly of boundary.coordinates) {
        if (poly?.[0] && isPointInPolygon([nLon, nLat], poly[0])) {
          return d;
        }
      }
    }
  }

  // Fallback to closest centroid
  let best = null;
  let minDist = Infinity;
  for (const d of TAMIL_NADU_DISTRICTS) {
    const cLat = d.center ? d.center[0] : d.lat;
    const cLng = d.center ? d.center[1] : d.lng;
    const dist = Math.hypot(nLat - cLat, nLon - cLng);
    if (dist < minDist) {
      minDist = dist;
      best = d;
    }
  }
  return best;
};

/**
 * Returns a clean, concise, human-readable city/town name without descriptive industrial suffixes
 */
export const formatCleanCityName = (rawName, districtName) => {
  if (!rawName) return "";
  let name = String(rawName).trim();

  const cities = districtName ? getDistrictCities(districtName) : [];
  for (const c of cities) {
    if (!c?.name) continue;
    const cRegex = new RegExp(`^${c.name}\\b`, "i");
    if (cRegex.test(name)) {
      if (/central/i.test(name)) return `${c.name} Central`;
      if (/north/i.test(name)) return `${c.name} North`;
      if (/south/i.test(name)) return `${c.name} South`;
      if (/east/i.test(name)) return `${c.name} East`;
      if (/west/i.test(name)) return `${c.name} West`;
      return c.name;
    }
  }

  name = name
    .replace(/ (Historic Hub|Temple City|Auto Hub|Town Core|Poultry & Powerloom|Agro & Cattle|Temple Zone|Windmill Hub|Canals|Historic Zone|Town Hub|City Central|Town & HQ|Gateway|Core|Foothills|Foothill|Coastal|Industrial|Port|Belt|Cluster|Farming Hub|Farming|Ghats|Western Ghats)$/i, "")
    .replace(/ (Zone|Hub|Area|Town|City|Canal|Belt|Villages|Village)$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return name || rawName;
};
