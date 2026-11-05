#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(rootDir, "src/data/tamilNaduDistrictsData.js");
const outputFiles = [
  path.join(rootDir, "public/tamilnadu_subzones.geojson"),
  path.join(rootDir, "public/geozone-ops/tamilnadu_subzones.geojson"),
];

const tempFile = path.join(os.tmpdir(), `tamilnadu-districts-data-${process.pid}.mjs`);
await fs.copyFile(dataFile, tempFile);

try {
  const data = await import(`${pathToFileURL(tempFile).href}?v=${Date.now()}`);
  const features = data.TAMIL_NADU_SUBZONES.map((subzone) => {
    const lat = Number(subzone.lat);
    const lng = Number(subzone.lng);
    return {
      type: "Feature",
      id: subzone.id,
      properties: {
        subzone_id: subzone.id,
        legacy_subzone_id: subzone.legacyId || undefined,
        name: subzone.name,
        district: subzone.district,
        district_code: subzone.districtCode,
        state: subzone.state || "Tamil Nadu",
        type: subzone.type || "Sub-Zone",
        pincode: subzone.pincode || "",
        latitude: lat,
        longitude: lng,
        geocode: {
          lat,
          lon: lng,
          formatted: `${lat}° N, ${lng}° E`,
          plus_code: subzone.plus_code || "",
          admin_code: subzone.admin_code || "",
          pincode: subzone.pincode || "",
        },
        radius_km: subzone.radius_km,
        approx_area_sqkm: subzone.approx_area_sqkm,
        enabled: true,
      },
      geometry: subzone.geometry,
    };
  });

  const collection = {
    type: "FeatureCollection",
    name: "Tamil_Nadu_Subzones_City_Village",
    features,
  };
  const json = `${JSON.stringify(collection)}\n`;

  for (const outputFile of outputFiles) {
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, json);
    console.log(`wrote ${features.length} sub-zones to ${path.relative(rootDir, outputFile)}`);
  }
} finally {
  await fs.rm(tempFile, { force: true });
}
