import { useEffect } from "react";
import { MapContainer, useMap } from "react-leaflet";
import SatelliteLayers from "./SatelliteLayers";
import { MAP_CENTER } from "../../utils/constants";

// Desplaza el mapa muy despacio para dar movimiento al fondo.
function Drift() {
  const map = useMap();
  useEffect(() => {
    const timer = setInterval(() => map.panBy([0.6, 0.25], { animate: false }), 60);
    return () => clearInterval(timer);
  }, [map]);
  return null;
}

// Fondo de la pantalla de acceso: mapa satelital sin interacción.
export default function LoginBackdrop() {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={13}
      className="auth-backdrop"
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      touchZoom={false}
    >
      <SatelliteLayers labels={false} />
      <Drift />
    </MapContainer>
  );
}
