#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceCandidates = [
  path.join(rootDir, "data/source/tamilnadu_districts.nwic.geojson"),
  path.join(rootDir, "public/tamilnadu_districts.geojson"),
];
const overlayFile = path.join(rootDir, "public/geodata/tamilnadu-districts.overlay.geojson");
const opsOverlayFile = path.join(rootDir, "public/geozone-ops/tamilnadu_districts.geojson");
const boundariesFile = path.join(rootDir, "src/data/tamilNaduDistrictBoundaries.json");
const simplifyAmount = process.env.OVERLAY_SIMPLIFY || "5%";
const maxOverlayBytes = Number(process.env.OVERLAY_MAX_BYTES || 512 * 1024);

const findSource = async () => {
  for (const candidate of sourceCandidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  throw new Error(
    `Missing high-resolution source GeoJSON. Expected one of:\n${sourceCandidates.join("\n")}`
  );
};

const mapshaperBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "mapshaper.cmd" : "mapshaper"
);

const ringIsClosed = (ring) => {
  if (!Array.isArray(ring) || ring.length < 4) return false;
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first?.[0] === last?.[0] && first?.[1] === last?.[1];
};

const orientation = (a, b, c) => {
  const value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (Math.abs(value) < 1e-12) return 0;
  return value > 0 ? 1 : 2;
};

const segmentsIntersect = (a, b, c, d) => {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return o1 !== o2 && o3 !== o4;
};

const ringSelfIntersects = (ring) => {
  const points = ring.slice(0, -1);
  const count = points.length;
  if (count < 4) return false;
  for (let i = 0; i < count; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % count];
    for (let j = i + 1; j < count; j += 1) {
      if (i === j || (i + 1) % count === j || (j + 1) % count === i) continue;
      const c = points[j];
      const d = points[(j + 1) % count];
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }
  return false;
};

const polygonParts = (geometry) => {
  if (geometry?.type === "Polygon") return [geometry.coordinates];
  if (geometry?.type === "MultiPolygon") return geometry.coordinates;
  return [];
};

const assertValidGeometry = (geometry, name) => {
  const parts = polygonParts(geometry);
  if (!parts.length) throw new Error(`${name}: unsupported geometry type ${geometry?.type}`);
  for (const polygon of parts) {
    if (!Array.isArray(polygon) || !polygon.length) throw new Error(`${name}: empty polygon`);
    for (const ring of polygon) {
      if (!ringIsClosed(ring)) throw new Error(`${name}: ring is not closed`);
      if (ringSelfIntersects(ring)) throw new Error(`${name}: ring self-intersects`);
    }
  }
};

const vertexCount = (geometry) =>
  polygonParts(geometry).reduce(
    (total, polygon) => total + polygon.reduce((sum, ring) => sum + ring.length, 0),
    0
  );

const run = async () => {
  const sourceFile = await findSource();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tn-overlay-"));
  const tempOverlay = path.join(tempDir, "overlay.geojson");

  try {
    console.log(`Building simplified map overlay from ${path.relative(rootDir, sourceFile)}`);
    execFileSync(
      mapshaperBin,
      [sourceFile, "-clean", "-simplify", simplifyAmount, "keep-shapes", "-o", tempOverlay, "format=geojson"],
      { stdio: "inherit" }
    );

    const raw = JSON.parse(await fs.readFile(tempOverlay, "utf8"));
    if (!Array.isArray(raw.features) || raw.features.length !== 38) {
      throw new Error(`Expected 38 district features, received ${raw.features?.length || 0}`);
    }

    const features = raw.features.map((feature) => {
      const sourceProps = feature.properties || {};
      const name = sourceProps.name || sourceProps.district;
      if (!name) throw new Error("District feature is missing a name");
      assertValidGeometry(feature.geometry, name);
      const center =
        Array.isArray(sourceProps.center) && sourceProps.center.length === 2
          ? sourceProps.center
          : Number.isFinite(sourceProps.lat) && Number.isFinite(sourceProps.lng)
          ? [sourceProps.lat, sourceProps.lng]
          : null;
      if (!center) throw new Error(`${name}: missing center coordinates`);

      return {
        type: "Feature",
        properties: {
          name,
          district: name,
          code: sourceProps.code || "",
          dtcode: sourceProps.dtcode || "",
          state: sourceProps.state || "TN",
          state_name: sourceProps.state_name || "Tamil Nadu",
          shape_area: sourceProps.shape_area || "",
          shape_length: sourceProps.shape_length || "",
          bbox: Array.isArray(sourceProps.bbox) ? sourceProps.bbox : undefined,
          center,
          lat: center[0],
          lng: center[1],
        },
        geometry: feature.geometry,
      };
    });

    features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    const overlay = { type: "FeatureCollection", features };
    const overlayText = `${JSON.stringify(overlay)}\n`;
    if (Buffer.byteLength(overlayText) > maxOverlayBytes) {
      throw new Error(
        `Overlay is ${(Buffer.byteLength(overlayText) / 1024).toFixed(1)}KB; budget is ${(
          maxOverlayBytes / 1024
        ).toFixed(0)}KB`
      );
    }

    const boundaries = {};
    let totalVertices = 0;
    for (const feature of features) {
      boundaries[feature.properties.name] = feature.geometry;
      totalVertices += vertexCount(feature.geometry);
    }

    await fs.mkdir(path.dirname(overlayFile), { recursive: true });
    await fs.mkdir(path.dirname(opsOverlayFile), { recursive: true });
    await fs.writeFile(overlayFile, overlayText);
    await fs.writeFile(opsOverlayFile, overlayText);
    await fs.writeFile(boundariesFile, `${JSON.stringify(boundaries)}\n`);

    console.log(
      `Wrote ${features.length} districts, ${totalVertices.toLocaleString()} vertices, ` +
        `${(Buffer.byteLength(overlayText) / 1024).toFixed(1)}KB overlay, ` +
        `${(Buffer.byteLength(JSON.stringify(boundaries)) / 1024).toFixed(1)}KB lookup`
    );
    console.log(`  ${path.relative(rootDir, overlayFile)}`);
    console.log(`  ${path.relative(rootDir, opsOverlayFile)}`);
    console.log(`  ${path.relative(rootDir, boundariesFile)}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
