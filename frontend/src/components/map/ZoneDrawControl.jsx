import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";

/**
 * Agrega la barra de Leaflet-Geoman para dibujar polígonos/rectángulos.
 * Cuando el usuario termina de dibujar, se obtienen los vértices, se quita
 * la capa temporal y se pasan a onDrawn en formato GeoJSON [lng, lat].
 */
export default function ZoneDrawControl({ onDrawn }) {
  const map = useMap();

  useEffect(() => {
    map.pm.setLang("es");
    map.pm.addControls({
      position: "topright",
      drawPolygon: true,
      drawRectangle: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    });
    map.pm.setPathOptions({ color: "#ff7a2f", fillOpacity: 0.18, dashArray: "6 6" });

    const handleCreate = (event) => {
      const latLngs = event.layer.getLatLngs()[0];
      // Leaflet usa [lat, lng]; GeoJSON usa [lng, lat]
      const coordinates = latLngs.map((point) => [
        Number(point.lng.toFixed(6)),
        Number(point.lat.toFixed(6)),
      ]);
      event.layer.remove();
      onDrawn(coordinates);
    };

    map.on("pm:create", handleCreate);
    return () => {
      map.off("pm:create", handleCreate);
      map.pm.removeControls();
    };
  }, [map, onDrawn]);

  return null;
}
