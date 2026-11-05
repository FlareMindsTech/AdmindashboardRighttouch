#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import polygonClipping from "polygon-clipping";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(rootDir, "src/data/tamilNaduDistrictsData.js");
const tempFile = path.join(os.tmpdir(), `tamilnadu-geodata-${process.pid}.mjs`);
const districtsGeo = JSON.parse(
  await fs.readFile(path.join(rootDir, "public/tamilnadu_districts.geojson"), "utf8")
);
const boundaries = JSON.parse(
  await fs.readFile(path.join(rootDir, "src/data/tamilNaduDistrictBoundaries.json"), "utf8")
);

const multi = (geometry) =>
  geometry?.type === "Polygon" ? [geometry.coordinates] : geometry?.coordinates || [];
const ringArea = (ring) => {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
};
const area = (geometry) =>
  multi(geometry).reduce((total, part) => total + ringArea(part[0]), 0);
const pointInRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};
const contains = (geometry, point) =>
  geometry?.type === "Polygon"
    ? pointInRing(point, geometry.coordinates[0])
    : multi(geometry).some((part) => pointInRing(point, part[0]));
const bboxOf = (geometry) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const part of multi(geometry)) {
    for (const [x, y] of part[0]) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return [minX, minY, maxX, maxY];
};
const bboxOverlap = (a, b) => !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);

await fs.copyFile(dataFile, tempFile);
try {
  const data = await import(`${pathToFileURL(tempFile).href}?v=${Date.now()}`);
  const canonicalNames = new Set(districtsGeo.features.map((feature) => feature.properties.name));
  const districtGeometries = new Map(
    districtsGeo.features.map((feature) => [feature.properties.name, feature.geometry])
  );
  const ids = data.TAMIL_NADU_SUBZONES.map((subzone) => subzone.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const invalidNames = data.TAMIL_NADU_SUBZONES.filter(
    (subzone) => !canonicalNames.has(subzone.district)
  );
  const outsideCenters = data.TAMIL_NADU_SUBZONES.filter((subzone) => {
    const boundary = boundaries[subzone.district];
    return boundary && !contains(boundary, [subzone.lng, subzone.lat]);
  });
  let crossBorder = 0;
  for (const subzone of data.TAMIL_NADU_SUBZONES) {
    const boundary = districtGeometries.get(subzone.district);
    if (!boundary) continue;
    try {
      const outside = polygonClipping.difference(multi(subzone.geometry), multi(boundary));
      if (outside.length && area({ type: "MultiPolygon", coordinates: outside }) > 1e-9) {
        crossBorder += 1;
      }
    } catch {
      /* ignore invalid preset geometry for reporting */
    }
  }

  const entries = data.TAMIL_NADU_SUBZONES.map((subzone) => ({
    id: subzone.id,
    geometry: subzone.geometry,
    bbox: bboxOf(subzone.geometry),
  }));
  let overlapPairs = 0;
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      if (!bboxOverlap(entries[i].bbox, entries[j].bbox)) continue;
      try {
        const intersection = polygonClipping.intersection(
          multi(entries[i].geometry),
          multi(entries[j].geometry)
        );
        if (
          intersection.length &&
          area({ type: "MultiPolygon", coordinates: intersection }) > 1e-9
        ) {
          overlapPairs += 1;
        }
      } catch {
        /* ignore invalid preset geometry for reporting */
      }
    }
  }

  console.log("Tamil Nadu GeoData validation");
  console.log(`  district features: ${districtsGeo.features.length}`);
  console.log(`  sub-zone presets: ${data.TAMIL_NADU_SUBZONES.length}`);
  console.log(`  duplicate sub-zone ids: ${duplicates.length}`);
  console.log(`  non-canonical district names: ${invalidNames.length}`);
  console.log(`  preset centers outside district: ${outsideCenters.length}`);
  console.log(`  presets crossing district border: ${crossBorder} (informational)`);
  console.log(`  overlapping preset pairs: ${overlapPairs} (informational)`);

  if (
    districtsGeo.features.length !== 38 ||
    duplicates.length ||
    invalidNames.length ||
    outsideCenters.length
  ) {
    process.exitCode = 1;
  }
} finally {
  await fs.rm(tempFile, { force: true });
}
