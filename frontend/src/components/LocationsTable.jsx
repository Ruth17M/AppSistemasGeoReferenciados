import { formatDate, statusLabel } from "../utils/constants";

// Tabla de ubicaciones registradas (todos los datos excepto el ID).
export default function LocationsTable({ locations, loading, lastUpdate, onSelect }) {
  return (
    <div className="card table-card">
      <div className="table-header">
        <h2>Centros de acopio registrados</h2>
        <span className="muted">
          {loading ? "Actualizando…" : `Actualizado ${lastUpdate ? lastUpdate.toLocaleTimeString("es-MX") : ""}`}
          <span className={`live-dot ${loading ? "busy" : ""}`} />
        </span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Organización</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Registrado por</th>
              <th>Fecha de registro</th>
              <th>Última edición</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 && (
              <tr>
                <td colSpan={10} className="empty">
                  No hay centros que coincidan. Haz clic en el mapa para registrar uno.
                </td>
              </tr>
            )}
            {locations.map((location) => {
              const [lng, lat] = location.location.coordinates;
              return (
                <tr key={location.id} onClick={() => onSelect(location)} title="Ver en el mapa">
                  <td><strong>{location.name}</strong></td>
                  <td className="wrap">{location.description}</td>
                  <td>
                    <span className="chip" style={{ "--chip": location.category?.color }}>
                      {location.category?.name || "—"}
                    </span>
                  </td>
                  <td><span className={`status status-${location.status}`}>{statusLabel(location.status)}</span></td>
                  <td>{location.organization?.name || "Sin asignar"}</td>
                  <td className="num">{lat.toFixed(5)}</td>
                  <td className="num">{lng.toFixed(5)}</td>
                  <td>{location.createdBy?.name || "—"}</td>
                  <td>{formatDate(location.createdAt)}</td>
                  <td>{formatDate(location.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
