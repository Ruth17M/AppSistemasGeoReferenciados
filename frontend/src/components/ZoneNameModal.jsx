import { useState } from "react";

const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed", "#0891b2"];

// Ventana para ponerle nombre (y color) a la zona recién dibujada.
export default function ZoneNameModal({ vertices, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), color });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal card form" onSubmit={submit}>
        <h2>Nueva zona</h2>
        <p className="muted small">Polígono con {vertices.length} vértices.</p>
        <label>
          Nombre de la zona
          <input value={name} onChange={(event) => setName(event.target.value)} autoFocus maxLength={80}
            placeholder="Ej. Zona afectada colonia Centro" />
        </label>
        <div>
          <span className="label">Color</span>
          <div className="color-options">
            {COLORS.map((option) => (
              <button
                key={option}
                type="button"
                className={`color-swatch ${color === option ? "selected" : ""}`}
                style={{ background: option }}
                onClick={() => setColor(option)}
                aria-label={option}
              />
            ))}
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Descartar</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Guardando…" : "Guardar zona"}</button>
        </div>
      </form>
    </div>
  );
}
