export const LOCATION_STATUSES = [
  { value: "activo", label: "Activo" },
  { value: "saturado", label: "Saturado" },
  { value: "cerrado", label: "Cerrado" },
];

export const ORGANIZATION_TYPES = [
  { value: "gobierno", label: "Gobierno" },
  { value: "ong", label: "ONG" },
  { value: "privada", label: "Privada" },
  { value: "voluntarios", label: "Voluntarios" },
  { value: "religiosa", label: "Religiosa" },
];

export const SUPPLY_UNITS = ["piezas", "kg", "litros", "cajas", "paquetes"];
export const SUPPLY_PRIORITIES = ["baja", "media", "alta", "urgente"];

// Centro inicial del mapa (Ciudad de México)
export const MAP_CENTER = [19.4326, -99.1332];
export const MAP_ZOOM = 14;

// Margen para que los popups no queden debajo de los paneles flotantes ([x, y] en px)
export const POPUP_PADDING = { autoPanPaddingTopLeft: [360, 100], autoPanPaddingBottomRight: [70, 290] };

// Cada cuánto se vuelve a consultar la API para mantener la tabla al día (ms)
export const POLL_INTERVAL = 15000;

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}

export function statusLabel(value) {
  return LOCATION_STATUSES.find((status) => status.value === value)?.label || value;
}
