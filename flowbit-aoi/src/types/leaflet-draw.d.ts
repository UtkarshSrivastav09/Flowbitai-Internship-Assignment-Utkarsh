import * as L from "leaflet";

declare module "leaflet" {
  interface Control {
    Draw: any;
  }
}
