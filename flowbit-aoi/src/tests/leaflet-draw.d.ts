// src/types/leaflet-draw.d.ts
import * as L from "leaflet";

declare module "leaflet" {
  namespace Draw {
    interface Event {
      layer: L.Layer;
    }
    interface DrawOptions {
      polygon?: any;
      polyline?: any;
      rectangle?: any;
      circle?: any;
      marker?: any;
    }
  }

  interface Control {
    Draw: any;
  }
}
