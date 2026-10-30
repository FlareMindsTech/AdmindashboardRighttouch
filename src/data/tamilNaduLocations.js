import {
  TAMIL_NADU_CITIES,
  TAMIL_NADU_DISTRICTS,
} from "components/Map/DistrictMap.js";

export { TAMIL_NADU_CITIES, TAMIL_NADU_DISTRICTS };

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

export const getTnLocationKey = (name, district = "") =>
  `${normalizeLocationName(district)}:${normalizeLocationName(name)}`;
