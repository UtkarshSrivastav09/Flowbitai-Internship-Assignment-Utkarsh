// src/utils/geo.ts
import * as turf from "@turf/turf";
import wellknown from "wellknown";
import tokml from "tokml";

export function computeAreaSqMeters(feature: GeoJSON.Feature): number {
  try {
    const fc = turf.featureCollection([feature]);
    const area = turf.area(fc); // in sq meters
    return area;
  } catch {
    return 0;
  }
}

export function computePerimeterMeters(feature: GeoJSON.Feature): number {
  try {
    const line = turf.polygonToLine(feature as any);
    const length = turf.length(line, { units: "kilometers" });
    return length * 1000;
  } catch {
    return 0;
  }
}

export function exportGeoJSON(features: GeoJSON.Feature[]): string {
  return JSON.stringify({ type: "FeatureCollection", features }, null, 2);
}

export function exportWKT(features: GeoJSON.Feature[]): string {
  // For multi-feature, join WKT with newline
  return features.map((f) => wellknown.stringify(f.geometry as any)).join("\n");
}

export function exportKML(features: GeoJSON.Feature[]): string {
  const fc = { type: "FeatureCollection", features } as any;
  return tokml(fc);
}

export function parseUploadedGeoJSON(content: string): GeoJSON.Feature[] {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "FeatureCollection" && parsed.features) return parsed.features;
    if (Array.isArray(parsed)) return parsed;
    if (parsed.type === "Feature") return [parsed];
  } catch (e) {
    // fallthrough
  }
  return [];
}
