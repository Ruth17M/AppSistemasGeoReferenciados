import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, Tooltip, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import LocationPopup from "./LocationPopup";
import LocationForm from "./LocationForm";
import ZoneDrawControl from "./ZoneDrawControl";
import SatelliteLayers from "./SatelliteLayers";
import { newPointIcon, pinIcon } from "./icons";
import { MAP_CENTER, MAP_ZOOM, POPUP_PADDING } from "../../utils/constants";

// Clic en el mapa = nueva ubicación (excepto cuando se está dibujando una zona).
// Si hay un popup abierto, el primer clic solo lo cierra.
function ClickHandler({ onClick }) {
  const openPopup = useRef(null);
  const map = useMapEvents({
    popupopen(event) {
      openPopup.current = event.popup;
    },
    popupclose(event) {
      if (openPopup.current === event.popup) openPopup.current = null;
    },
    click(event) {
      // Si el clic vino de un botón de un popup que React ya quitó del DOM
      // (p. ej. "Editar" o "Cancelar"), Leaflet lo reporta como clic en el mapa: se ignora.
      const target = event.originalEvent?.target;
      if (target && (!target.isConnected || target.closest(".leaflet-popup"))) return;
      if (map.pm?.globalDrawModeEnabled()) return;
      if (openPopup.current) {
        map.closePopup(openPopup.current);
        return;
      }
      onClick(event.latlng);
    },
  });
  return null;
}

// Mueve el mapa hacia el elemento seleccionado (fila de la tabla o zona).
function FocusController({ focus, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    if (focus.bounds) {
      map.fitBounds(focus.bounds, { padding: [30, 30] });
    } else if (focus.center) {
      map.flyTo(focus.center, Math.max(map.getZoom(), 16), { duration: 0.8 });
      const marker = markerRefs.current[focus.id];
      if (marker) setTimeout(() => marker.openPopup(), 850);
    }
  }, [focus, map, markerRefs]);
  return null;
}

// Marcador temporal con el formulario de registro abierto en su popup.
function NewPointMarker({ point, categories, organizations, onClose, onCreate }) {
  const markerRef = useRef(null);

  // Abre el popup al aparecer y, si el usuario lo cierra, quita el marcador temporal.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.openPopup();
    // Cuando React ya pintó el formulario, el popup recalcula su tamaño y se aleja de los paneles.
    const frame = requestAnimationFrame(() => marker.getPopup()?.update());
    marker.on("popupclose", onClose);
    return () => {
      cancelAnimationFrame(frame);
      marker.off("popupclose", onClose);
    };
  }, [point, onClose]);

  return (
    <Marker position={point} icon={newPointIcon} ref={markerRef}>
      <Popup minWidth={280} maxWidth={340} {...POPUP_PADDING}>
        <h3 className="popup-title">Nuevo centro de acopio</h3>
        <LocationForm
          key={`${point.lat}-${point.lng}`}
          initial={{ latitude: point.lat.toFixed(6), longitude: point.lng.toFixed(6) }}
          categories={categories}
          organizations={organizations}
          submitLabel="Registrar"
          onCancel={onClose}
          onSubmit={async (data) => {
            await onCreate(data);
            onClose();
          }}
        />
      </Popup>
    </Marker>
  );
}

export default function MapView({
  locations,
  zones,
  categories,
  organizations,
  focus,
  markerRefs,
  onCreate,
  onUpdate,
  onDelete,
  onZoneDrawn,
}) {
  const [newPoint, setNewPoint] = useState(null);
  const closeNewPoint = useCallback(() => setNewPoint(null), []);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="map"
      doubleClickZoom={false}
      closePopupOnClick={false}
      zoomControl={false}
    >
      <SatelliteLayers />
      <ZoomControl position="topright" />

      <ClickHandler onClick={setNewPoint} />
      <ZoneDrawControl onDrawn={onZoneDrawn} />
      <FocusController focus={focus} markerRefs={markerRefs} />

      {/* Zonas guardadas (GeoJSON [lng, lat] -> Leaflet [lat, lng]) */}
      {zones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.area.coordinates[0].map(([lng, lat]) => [lat, lng])}
          pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.18, weight: 1.5, dashArray: "6 6" }}
          interactive={false}
        >
          <Tooltip permanent direction="center" className="zone-label">{zone.name}</Tooltip>
        </Polygon>
      ))}

      {/* Centros de acopio */}
      {locations.map((location) => {
        const [lng, lat] = location.location.coordinates;
        return (
          <Marker
            key={location.id}
            position={[lat, lng]}
            icon={pinIcon(location.category?.color, location.status)}
            ref={(ref) => {
              if (ref) markerRefs.current[location.id] = ref;
              else delete markerRefs.current[location.id];
            }}
          >
            <LocationPopup
              location={location}
              categories={categories}
              organizations={organizations}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </Marker>
        );
      })}

      {/* Nueva ubicación en el punto donde se hizo clic */}
      {newPoint && (
        <NewPointMarker
          point={newPoint}
          categories={categories}
          organizations={organizations}
          onClose={closeNewPoint}
          onCreate={onCreate}
        />
      )}
    </MapContainer>
  );
}
