import L from "leaflet";

const cache = new Map();

// Punto luminoso con el color de la categoría (sin imágenes externas).
export function pinIcon(color = "#64748b", status = "activo") {
  const key = `${color}-${status}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        className: "pin-wrapper",
        html: `<span class="pin pin-${status}" style="--pin:${color}"><i></i></span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -14],
      })
    );
  }
  return cache.get(key);
}

export const newPointIcon = L.divIcon({
  className: "pin-wrapper",
  html: `<span class="pin pin-new"><i></i></span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -14],
});
