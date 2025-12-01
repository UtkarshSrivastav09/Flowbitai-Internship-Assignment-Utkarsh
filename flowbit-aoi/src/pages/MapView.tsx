// src/pages/MapView.tsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import AOISidebar from "../components/AOISidebar";
import {
  computeAreaSqMeters,
  computePerimeterMeters,
  exportGeoJSON,
  exportKML,
  exportWKT,
  parseUploadedGeoJSON,
} from "../utils/geo";
import { saveAs } from "file-saver";

type StoredFeature = GeoJSON.Feature & { id?: string; createdAt?: string };

const STORAGE_KEY = "flowbit_aoi_v1_v2";

export default function MapViewPage() {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  const [features, setFeatures] = useState<StoredFeature[]>([]);
  const [darkTheme, setDarkTheme] = useState(false);

  // utility: persist features array
  function persistFeatures(arr: StoredFeature[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    setFeatures(arr);
  }

  useEffect(() => {
    // create map
    const map = L.map("map", {
      center: [28.6139, 77.2090],
      zoom: 6,
      zoomControl: false,
    });
    mapRef.current = map;

    const light = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
    const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png");

    const baseLayers = {
      Light: light,
      Dark: dark,
    };
    light.addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // FeatureGroup
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    drawnItems.addTo(map);

    // Draw control
    const drawControl = new (L.Control as any).Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: "#2563eb", weight: 3, fillOpacity: 0.15 },
        },
        rectangle: true,
        circle: false,
        polyline: false,
        marker: false,
      },
      edit: { featureGroup: drawnItems },
    });

    let drawingEnabled = false;

    // button to enable draw
    const btn = document.getElementById("start-draw");
    if (btn) {
      btn.addEventListener("click", () => {
        if (!drawingEnabled) {
          map.addControl(drawControl);
          drawingEnabled = true;
        } else {
          // toggle off
          map.removeControl(drawControl);
          drawingEnabled = false;
        }
      });
    }

    // Add geolocation control simple
    const geoButton = document.getElementById("geolocate");
    if (geoButton) {
      geoButton.onclick = () => {
        map.locate({ setView: true, maxZoom: 14 });
      };
    }

    map.on("locationerror", () => {
      console.warn("Location denied or not available.");
    });

    // Handle create
    map.on("draw:created", (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const geojson = layer.toGeoJSON() as GeoJSON.Feature;
      const area = computeAreaSqMeters(geojson);
      const perim = computePerimeterMeters(geojson);
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const createdAt = new Date().toISOString();

      // annotate properties
      (geojson.properties as any) = {
        name: `AOI ${features.length + 1}`,
        area,
        areaDisplay: `${(area / 1000000).toFixed(3)} km²`,
        perimeter: perim,
        id,
        createdAt,
      };

      // save
      const newArr = [...features, geojson as StoredFeature];
      persistFeatures(newArr);
      refreshFeatureLayers(newArr);
    });

    // On edit: update stored features when user saves edits
    map.on("draw:edited", (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        const g = layer.toGeoJSON() as GeoJSON.Feature;
        // find by id in existing features if possible by comparing geometry
        const idx = findFeatureIndexByGeometry(g, features);
        const area = computeAreaSqMeters(g);
        const perim = computePerimeterMeters(g);
        if (idx >= 0) {
          const fcopy = { ...features[idx] };
          fcopy.geometry = g.geometry;
          (fcopy.properties as any).area = area;
          (fcopy.properties as any).perimeter = perim;
          (fcopy.properties as any).areaDisplay = `${(area / 1000000).toFixed(3)} km²`;
          const newArr = [...features];
          newArr[idx] = fcopy;
          persistFeatures(newArr);
        }
      });
      refreshFeatureLayers(features);
    });

    // Load from storage at start
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as StoredFeature[];
        // ensure features restored and added to layer
        persistFeatures(saved);
        refreshFeatureLayers(saved);
      } catch (err) {
        console.error("Failed to parse saved AOIs", err);
      }
    }

    // helper to find index by comparing coordinates string
    function findFeatureIndexByGeometry(g: GeoJSON.Feature, arr: StoredFeature[]) {
      const s = JSON.stringify(g.geometry);
      return arr.findIndex((f) => JSON.stringify(f.geometry) === s);
    }

    // refresh displayed layers to match features[] state
    function refreshFeatureLayers(list: StoredFeature[]) {
      drawnItems.clearLayers();
      list.forEach((f) => {
        const layer = L.geoJSON(f as any, {
          style: () => ({ color: "#2563eb", weight: 3, fillOpacity: 0.12 }),
        });
        layer.eachLayer((l) => drawnItems.addLayer(l));
        // add label/popup with metadata
        const centroid = (L.geoJSON(f as any).getBounds().getCenter() as any);
        const name = (f.properties as any)?.name || "AOI";
        const areaDisplay = (f.properties as any)?.areaDisplay || "";
        const popup = L.popup({ closeButton: false, autoClose: true })
          .setLatLng(centroid)
          .setContent(`<b>${name}</b><br/>${areaDisplay}`);
        drawnItems.addLayer(L.marker(centroid, { opacity: 0 }).bindPopup(popup));
      });
    }

    // Make refreshFeatureLayers available after features set
    (window as any).__refreshFeatureLayers = refreshFeatureLayers;

    // cleanup
    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // top-level actions
  function zoomToFeature(f: GeoJSON.Feature) {
    const map = mapRef.current!;
    if (!map) return;
    const layer = L.geoJSON(f as any);
    map.fitBounds(layer.getBounds(), { padding: [30, 30] });
    // open popup if exists
    // (we recreate popups in refresh)
  }

  function deleteFeature(i: number) {
    const copy = [...features];
    copy.splice(i, 1);
    persistFeatures(copy);
    // refresh layers
    (window as any).__refreshFeatureLayers(copy);
  }

  function deleteAll() {
    persistFeatures([]);
    (window as any).__refreshFeatureLayers([]);
  }

  async function handleExport(format: "geojson" | "wkt" | "kml") {
    if (features.length === 0) {
      alert("No AOIs to export");
      return;
    }
    if (format === "geojson") {
      const txt = exportGeoJSON(features);
      const blob = new Blob([txt], { type: "application/json" });
      saveAs(blob, "aois.geojson");
    } else if (format === "wkt") {
      const txt = exportWKT(features);
      const blob = new Blob([txt], { type: "text/plain" });
      saveAs(blob, "aois.wkt");
    } else {
      const txt = exportKML(features);
      const blob = new Blob([txt], { type: "application/vnd.google-earth.kml+xml" });
      saveAs(blob, "aois.kml");
    }
  }

  function handleImport(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const txt = String(ev.target?.result ?? "");
      // try geojson first
      const imported = parseUploadedGeoJSON(txt);
      if (imported.length > 0) {
        // annotate and append
        const newArr = [
          ...features,
          ...imported.map((f) => {
            (f.properties as any) = {
              ...(f.properties || {}),
              id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
              createdAt: new Date().toISOString(),
              area: computeAreaSqMeters(f),
              areaDisplay: `${(computeAreaSqMeters(f) / 1000000).toFixed(3)} km²`,
            };
            return f;
          }),
        ];
        persistFeatures(newArr);
        (window as any).__refreshFeatureLayers(newArr);
        return;
      }
      // fallback: not valid geojson
      alert("Could not parse file as GeoJSON/KML.");
    };
    reader.readAsText(file);
  }

  function renameFeature(i: number, name: string) {
    const copy = [...features];
    const f = copy[i];
    (f.properties as any).name = name;
    persistFeatures(copy);
    (window as any).__refreshFeatureLayers(copy);
  }

  function toggleTheme() {
    setDarkTheme((d) => !d);
    // swap base layer by toggling tiles - quick approach:
    const map = mapRef.current;
    if (!map) return;
    // trivial toggle by switching tile url layers
    // remove all tileLayers then add chosen one
    map.eachLayer((lyr: any) => {
      // remove tile layers only
      if (lyr && lyr.options && lyr._url) {
        map.removeLayer(lyr);
      }
    });
    const url = darkTheme
      ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
    L.tileLayer(url).addTo(map);
    // refresh features
    (window as any).__refreshFeatureLayers(features);
  }

  // Add UI layout: sidebar + map area + top controls
  return (
    <div className="flex">
      <AOISidebar
        features={features}
        onZoomTo={zoomToFeature}
        onDelete={deleteFeature}
        onDeleteAll={deleteAll}
        onExport={handleExport}
        onImport={handleImport}
        onRename={renameFeature}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 relative">
        {/* Floating controls */}
        <div className="absolute z-50 left-6 top-6 flex flex-col gap-3">
          <div className="bg-white/80 p-3 rounded-lg shadow">
            <div className="flex gap-2">
              <button id="start-draw" className="px-3 py-1 bg-blue-600 text-white rounded">
                Draw AOI
              </button>
              <button
                id="geolocate"
                className="px-3 py-1 bg-gray-700 text-white rounded"
                title="Go to my location"
              >
                My location
              </button>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Click "Draw AOI" then click points on map to create polygon. Use edit control to modify.
            </div>
          </div>
        </div>

        <div id="map" style={{ height: "100vh", width: "100%" }} />
      </div>
    </div>
  );
}
