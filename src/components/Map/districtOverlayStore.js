const OVERLAY_URL = `${process.env.PUBLIC_URL || ""}/geodata/tamilnadu-districts.overlay.geojson`;

let cachedFeatures = null;
let cachedPromise = null;
let cachedError = null;

export const getDistrictOverlayUrl = () => OVERLAY_URL;

export const getCachedDistrictOverlay = () => cachedFeatures;

export const getDistrictOverlayError = () => cachedError;

export const loadDistrictOverlay = (force = false) => {
  if (force) {
    cachedFeatures = null;
    cachedPromise = null;
    cachedError = null;
  }
  if (cachedFeatures) return Promise.resolve(cachedFeatures);
  if (cachedPromise) return cachedPromise;

  cachedPromise = fetch(OVERLAY_URL, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load district overlay (${response.status})`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !Array.isArray(data.features) || !data.features.length) {
        throw new Error("District overlay is empty");
      }
      cachedFeatures = data.features;
      cachedError = null;
      return cachedFeatures;
    })
    .catch((error) => {
      cachedPromise = null;
      cachedError = error;
      throw error;
    });

  return cachedPromise;
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+district$/, "");

export const findOverlayFeature = (features, name) => {
  const target = normalize(name);
  if (!target || !Array.isArray(features)) return null;
  return (
    features.find((feature) => {
      const props = feature?.properties || {};
      return (
        normalize(props.name) === target ||
        normalize(props.district) === target ||
        normalize(props.code) === target ||
        normalize(props.dtcode) === target
      );
    }) || null
  );
};
