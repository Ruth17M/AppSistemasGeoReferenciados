import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { locationsApi, suppliesApi, zonesApi } from "../api/services";
import { errorText } from "../api/client";
import { useToast } from "../context/ToastContext";
import { LOCATION_STATUSES } from "../utils/constants";

// Vista de resumen: totales por estado, por categoría, por zona e insumos urgentes.
export default function SummaryPage() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([locationsApi.list(), zonesApi.list(), suppliesApi.list({ priority: "urgente" })])
      .then(([locations, zones, urgent]) =>
        setData({ locations: locations.data, zones: zones.data, urgent: urgent.data })
      )
      .catch((error) => toast.error(errorText(error)));
  }, [toast]);

  if (!data) return <div className="page"><p className="muted">Cargando resumen…</p></div>;

  const byCategory = new Map();
  data.locations.forEach((location) => {
    const key = location.category?.name || "Sin categoría";
    const entry = byCategory.get(key) || { name: key, color: location.category?.color, total: 0 };
    entry.total += 1;
    byCategory.set(key, entry);
  });
  const maxCategory = Math.max(1, ...[...byCategory.values()].map((entry) => entry.total));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Resumen</h1>
          <p className="muted">Panorama general de la red de centros de acopio.</p>
        </div>
      </div>

      <div className="stats">
        <div className="card stat">
          <span className="stat-value">{data.locations.length}</span>
          <span className="muted">Centros registrados</span>
        </div>
        {LOCATION_STATUSES.map((status) => (
          <div key={status.value} className="card stat">
            <span className="stat-value">{data.locations.filter((location) => location.status === status.value).length}</span>
            <span className={`status status-${status.value}`}>{status.label}</span>
          </div>
        ))}
        <div className="card stat">
          <span className="stat-value">{data.zones.length}</span>
          <span className="muted">Zonas dibujadas</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Centros por categoría</h2>
          {[...byCategory.values()].map((entry) => (
            <div key={entry.name} className="bar-row">
              <span>{entry.name}</span>
              <div className="bar"><div style={{ width: `${(entry.total / maxCategory) * 100}%`, background: entry.color }} /></div>
              <strong>{entry.total}</strong>
            </div>
          ))}
          {byCategory.size === 0 && <p className="muted">Sin datos.</p>}
        </div>

        <div className="card">
          <h2>Centros dentro de cada zona</h2>
          <table>
            <thead><tr><th>Zona</th><th>Centros</th><th>Dibujada por</th></tr></thead>
            <tbody>
              {data.zones.map((zone) => (
                <tr key={zone.id}>
                  <td><span className="zone-color" style={{ background: zone.color }} /> {zone.name}</td>
                  <td>{zone.locationsCount}</td>
                  <td>{zone.createdBy?.name || "—"}</td>
                </tr>
              ))}
              {data.zones.length === 0 && <tr><td colSpan={3} className="empty">Sin zonas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Insumos con prioridad urgente</h2>
        <table>
          <thead><tr><th>Insumo</th><th>Cantidad</th><th>Centro de acopio</th></tr></thead>
          <tbody>
            {data.urgent.map((supply) => (
              <tr key={supply.id}>
                <td>{supply.name}</td>
                <td>{supply.quantity} {supply.unit}</td>
                <td>{supply.location?.name}</td>
              </tr>
            ))}
            {data.urgent.length === 0 && <tr><td colSpan={3} className="empty">No hay insumos urgentes.</td></tr>}
          </tbody>
        </table>
        <p className="small"><Link to="/catalogos?tab=insumos">Administrar insumos →</Link></p>
      </div>
    </div>
  );
}
