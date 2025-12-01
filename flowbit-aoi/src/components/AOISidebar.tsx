import React from "react";

type Props = {
  features: GeoJSON.Feature[];
  onZoomTo: (f: GeoJSON.Feature) => void;
  onDelete: (index: number) => void;
  onDeleteAll: () => void;
  onExport: (format: "geojson" | "wkt" | "kml") => void;
  onImport: (file: File | null) => void;
  onRename: (index: number, name: string) => void;
  onToggleTheme: () => void;
};

export default function AOISidebar({
  features,
  onZoomTo,
  onDelete,
  onDeleteAll,
  onExport,
  onImport,
  onRename,
  onToggleTheme,
}: Props) {
  return (
    <nav className="w-full bg-[#f8f9fa] border-b px-4 py-2 flex items-center justify-between gap-6 shadow-sm text-sm select-none">

      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-semibold text-gray-700">AOIs</span>
        <button
          onClick={onToggleTheme}
          className="px-3 py-1 bg-white border rounded hover:bg-[#e9ecef] transition"
        >
          Theme
        </button>
      </div>

      {/* Middle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-600">Export</span>

        <button
          onClick={() => onExport("geojson")}
          className="px-3 py-1 bg-white border rounded hover:bg-[#e9ecef] transition"
        >
          GeoJSON
        </button>
        <button
          onClick={() => onExport("wkt")}
          className="px-3 py-1 bg-white border rounded hover:bg-[#e9ecef] transition"
        >
          WKT
        </button>
        <button
          onClick={() => onExport("kml")}
          className="px-3 py-1 bg-white border rounded hover:bg-[#e9ecef] transition"
        >
          KML
        </button>

        <label className="px-3 py-1 bg-white border rounded hover:bg-[#e9ecef] transition cursor-pointer">
          Import
          <input
            type="file"
            accept=".geojson,.json,.kml"
            onChange={(e) => onImport(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
      </div>

      {/* Right */}
      <div>
        <button
          onClick={onDeleteAll}
          className="px-3 py-1 bg-white border rounded text-red-600 hover:bg-[#e9ecef] transition"
        >
          Delete All
        </button>
      </div>
    </nav>
  );
}
