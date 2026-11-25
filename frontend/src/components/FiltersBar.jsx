import { LOCATION_STATUSES } from "../utils/constants";

// Filtros que se envían al backend como ?search=&category=&status=&zone=
export default function FiltersBar({ filters, onChange, categories, zones, total }) {
  const set = (field) => (event) => onChange({ ...filters, [field]: event.target.value });
  const hasFilters = filters.search || filters.category !== "all" || filters.status !== "all" || filters.zone !== "all";

  return (
    <div className="card filters">
      <h2>Búsqueda y filtros</h2>
      <label>
        Nombre
        <input
          type="search"
          placeholder="Ej. parroquia, escuela…"
          value={filters.search}
          onChange={set("search")}
        />
      </label>
      <label>
        Categoría
        <select value={filters.category} onChange={set("category")}>
          <option value="all">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <label>
        Estado
        <select value={filters.status} onChange={set("status")}>
          <option value="all">Todos</option>
          {LOCATION_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </label>
      <label>
        Dentro de la zona
        <select value={filters.zone} onChange={set("zone")}>
          <option value="all">Cualquier lugar</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>{zone.name}</option>
          ))}
        </select>
      </label>
      <div className="filters-footer">
        <span className="muted">{total} resultado(s)</span>
        {hasFilters && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onChange({ search: "", category: "all", status: "all", zone: "all" })}
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
