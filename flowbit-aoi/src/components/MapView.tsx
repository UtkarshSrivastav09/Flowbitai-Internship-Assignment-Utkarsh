import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, LayersControl, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet-draw";

const WMS_URL = "https://www.wms.nrw.de/geobasis/wms_nw_dop";

function WmsLayer() {
  const map = useMap();
  useEffect(() => {
    const wms = L.tileLayer.wms(WMS_URL, {
      layers: "dopus_2009_2012_5cm_epsg3857",
      format: "image/png",
      transparent: false,
      attribution: "NRW WMS",
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.removeLayer(wms);
    };
  }, [map]);
  return null;
}

export default function MapView() {
  const center = [51.1657, 10.4515]; // Germany-ish center (change as needed)
  return (
    <div className="h-screen">
      <MapContainer center={center as any} zoom={6} scrollWheelZoom zoomControl={false}>
        <ZoomControl position="topright" />
        <LayersControl position="topright">
          <LayersControl.Overlay name="NRW DOP WMS" checked>
            <TileLayer
              // fallback - this is tileLayer; we use WmsLayer for correct params
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.Overlay>
        </LayersControl>
        <WmsLayer />
      </MapContainer>
    </div>
  );
}
