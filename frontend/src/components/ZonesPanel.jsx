import { useState } from "react";
import Icon from "./Icon";

// Lista de zonas guardadas: ver en mapa, filtrar, renombrar y eliminar.
export default function ZonesPanel({ zones, onFocus, onFilter, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const startEdit = (zone) => {
    setEditingId(zone.id);
    setName(zone.name);
    setConfirmId(null);
  };

  const saveName = async (zone) => {
    if (name.trim().length < 3) return;
    await onRename(zone, name.trim());
    setEditingId(null);
  };

  return (
    <div className="card zones-panel">
      <h2>Zonas</h2>
      <p className="muted small">
        Usa los botones de polígono o rectángulo (arriba a la derecha del mapa) para dibujar una zona.
      </p>
      {zones.length === 0 && <p className="muted">Aún no hay zonas dibujadas.</p>}
      <ul>
        {zones.map((zone) => (
          <li key={zone.id}>
            <span className="zone-color" style={{ background: zone.color }} />
            {editingId === zone.id ? (
              <form
                className="inline-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveName(zone);
                }}
              >
                <input value={name} onChange={(event) => setName(event.target.value)} autoFocus maxLength={80} />
                <button className="btn btn-primary btn-sm">OK</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>✕</button>
              </form>
            ) : (
              <div className="zone-info">
                <strong>{zone.name}</strong>
                <span className="muted small">{zone.locationsCount ?? 0} centro(s) dentro</span>
              </div>
            )}
            {editingId !== zone.id && (
              <div className="zone-actions">
                {confirmId === zone.id ? (
                  <>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(zone)}>Eliminar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>No</button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn" title="Ver en el mapa" onClick={() => onFocus(zone)}><Icon name="focus" size={16} /></button>
                    <button className="icon-btn" title="Filtrar centros de esta zona" onClick={() => onFilter(zone)}><Icon name="filter" size={16} /></button>
                    <button className="icon-btn" title="Renombrar" onClick={() => startEdit(zone)}><Icon name="edit" size={16} /></button>
                    <button className="icon-btn" title="Eliminar" onClick={() => setConfirmId(zone.id)}><Icon name="trash" size={16} /></button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
