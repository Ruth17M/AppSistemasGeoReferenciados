import { TileLayer } from "react-leaflet";

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const ATTRIBUTION = "Imágenes &copy; Esri, Maxar, Earthstar Geographics";

// Fondo satelital + calles y nombres de lugares encima (servicios públicos de Esri).
export default function SatelliteLayers({ labels = true }) {
  return (
    <>
      <TileLayer attribution={ATTRIBUTION} url={`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`} maxZoom={19} />
      {labels && (
        <>
          <TileLayer url={`${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`} opacity={0.55} maxZoom={19} />
          <TileLayer url={`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`} maxZoom={19} />
        </>
      )}
    </>
  );
}
