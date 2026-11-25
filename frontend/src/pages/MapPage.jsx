import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import MapView from "../components/map/MapView";
import FiltersBar from "../components/FiltersBar";
import LocationsTable from "../components/LocationsTable";
import ZonesPanel from "../components/ZonesPanel";
import ZoneNameModal from "../components/ZoneNameModal";
import { categoriesApi, locationsApi, organizationsApi, zonesApi } from "../api/services";
import { errorText } from "../api/client";
import { useToast } from "../context/ToastContext";
import useDebounce from "../utils/useDebounce";
import { POLL_INTERVAL } from "../utils/constants";
import Icon from "../components/Icon";

const INITIAL_FILTERS = { search: "", category: "all", status: "all", zone: "all" };

export default function MapPage() {
  const toast = useToast();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [focus, setFocus] = useState(null);
  const [drawnZone, setDrawnZone] = useState(null);
  const [tableOpen, setTableOpen] = useState(true);
  const markerRefs = useRef({});
  const requestId = useRef(0);

  const debouncedSearch = useDebounce(filters.search);
  const query = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  // ----- Carga de datos -----
  const loadLocations = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    try {
      const response = await locationsApi.list(query);
      if (current === requestId.current) {
        setLocations(response.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      if (current === requestId.current) toast.error(errorText(error));
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [query, toast]);

  const loadZones = useCallback(async () => {
    try {
      const response = await zonesApi.list();
      setZones(response.data);
    } catch (error) {
      toast.error(errorText(error));
    }
  }, [toast]);

  useEffect(() => {
    Promise.all([categoriesApi.list(), organizationsApi.list()])
      .then(([categoriesResponse, organizationsResponse]) => {
        setCategories(categoriesResponse.data);
        setOrganizations(organizationsResponse.data);
      })
      .catch((error) => toast.error(errorText(error)));
    loadZones();
  }, [loadZones, toast]);

  // Se vuelve a consultar cada vez que cambian los filtros y además
  // cada POLL_INTERVAL ms para reflejar cambios hechos por otros usuarios.
  useEffect(() => {
    loadLocations();
    const timer = setInterval(loadLocations, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [loadLocations]);

  const refreshAll = () => Promise.all([loadLocations(), loadZones()]);

  // ----- Ubicaciones -----
  const createLocation = async (data) => {
    await locationsApi.create(data);
    toast.success(`"${data.name}" registrado en el mapa`);
    await refreshAll();
  };

  const updateLocation = async (id, data) => {
    await locationsApi.update(id, data);
    toast.success("Cambios guardados");
    await refreshAll();
  };

  const deleteLocation = async (location) => {
    try {
      await locationsApi.remove(location.id);
      toast.success(`"${location.name}" eliminado`);
      await refreshAll();
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  // ----- Zonas -----
  const saveZone = async ({ name, color }) => {
    try {
      await zonesApi.create({ name, color, coordinates: drawnZone });
      toast.success(`Zona "${name}" guardada`);
      setDrawnZone(null);
      await loadZones();
    } catch (error) {
      throw new Error(errorText(error));
    }
  };

  const renameZone = async (zone, name) => {
    try {
      await zonesApi.update(zone.id, { name });
      toast.success("Zona renombrada");
      await loadZones();
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const deleteZone = async (zone) => {
    try {
      await zonesApi.remove(zone.id);
      toast.success(`Zona "${zone.name}" eliminada`);
      if (filters.zone === zone.id) setFilters({ ...filters, zone: "all" });
      await loadZones();
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const focusZone = (zone) => {
    const bounds = L.latLngBounds(zone.area.coordinates[0].map(([lng, lat]) => [lat, lng]));
    setFocus({ bounds });
  };

  const focusLocation = (location) => {
    const [lng, lat] = location.location.coordinates;
    setFocus({ id: location.id, center: [lat, lng] });
  };

  const handleZoneDrawn = useCallback((coordinates) => setDrawnZone(coordinates), []);

  const activeCount = locations.filter((location) => location.status === "activo").length;

  return (
    <div className={`map-page ${tableOpen ? "table-open" : ""}`}>
      {/* El mapa ocupa toda la pantalla; los paneles flotan encima */}
      <MapView
        locations={locations}
        zones={zones}
        categories={categories}
        organizations={organizations}
        focus={focus}
        markerRefs={markerRefs}
        onCreate={createLocation}
        onUpdate={updateLocation}
        onDelete={deleteLocation}
        onZoneDrawn={handleZoneDrawn}
      />

      <div className="map-headline">
        <span className="eyebrow">Red de acopio en tiempo real</span>
        <h1>
          Centros <span className="headline-count">#{String(locations.length).padStart(2, "0")}</span>
        </h1>
        <p>{activeCount} activos · {zones.length} zonas · clic en el mapa para registrar</p>
      </div>

      <aside className="sidebar">
        <FiltersBar
          filters={filters}
          onChange={setFilters}
          categories={categories}
          zones={zones}
          total={locations.length}
        />
        <ZonesPanel
          zones={zones}
          onFocus={focusZone}
          onFilter={(zone) => setFilters({ ...filters, zone: zone.id })}
          onRename={renameZone}
          onDelete={deleteZone}
        />
        <div className="card legend">
          <h2>Simbología</h2>
          {categories.map((category) => (
            <div key={category.id} className="legend-item">
              <span className="pin-mini" style={{ "--pin": category.color }} /> {category.name}
            </div>
          ))}
          <div className="legend-item muted small">Anillo punteado = saturado · atenuado = cerrado</div>
        </div>
      </aside>

      <section className="table-dock">
        <button className="dock-toggle" onClick={() => setTableOpen(!tableOpen)} aria-expanded={tableOpen}>
          <Icon name="layers" />
          <span>{tableOpen ? "Ocultar tabla" : `Ver tabla de centros (${locations.length})`}</span>
          <span className={`dock-chevron ${tableOpen ? "" : "down"}`}><Icon name="chevron" /></span>
        </button>
        {tableOpen && (
          <LocationsTable
            locations={locations}
            loading={loading}
            lastUpdate={lastUpdate}
            onSelect={focusLocation}
          />
        )}
      </section>

      {drawnZone && (
        <ZoneNameModal vertices={drawnZone} onSave={saveZone} onCancel={() => setDrawnZone(null)} />
      )}
    </div>
  );
}
