import { useState } from "react";
import { LOCATION_STATUSES } from "../../utils/constants";

// Formulario compartido para crear y editar un centro de acopio dentro del popup.
export default function LocationForm({ initial, categories, organizations, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    description: initial.description || "",
    category: initial.category || "",
    organization: initial.organization || "",
    status: initial.status || "activo",
    latitude: initial.latitude,
    longitude: initial.longitude,
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    const found = [];
    if (form.name.trim().length < 3) found.push("Nombre: mínimo 3 caracteres");
    if (form.description.trim().length < 5) found.push("Descripción: mínimo 5 caracteres");
    if (!form.category) found.push("Selecciona una categoría");
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) found.push("Latitud inválida");
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) found.push("Longitud inválida");
    setErrors(found);
    if (found.length) return;

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        organization: form.organization || null,
        status: form.status,
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      setErrors([error.message, ...(error.details || [])]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form popup-form" onSubmit={submit} noValidate>
      <label>
        Nombre
        <input name="name" value={form.name} onChange={change} maxLength={80} autoFocus />
      </label>
      <label>
        Descripción
        <textarea name="description" value={form.description} onChange={change} rows={2} maxLength={300} />
      </label>
      <div className="row">
        <label>
          Categoría
          <select name="category" value={form.category} onChange={change}>
            <option value="">— Selecciona —</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select name="status" value={form.status} onChange={change}>
            {LOCATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Organización responsable
        <select name="organization" value={form.organization} onChange={change}>
          <option value="">Sin asignar</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </select>
      </label>
      <div className="row">
        <label>
          Latitud
          <input name="latitude" type="number" step="any" value={form.latitude} onChange={change} />
        </label>
        <label>
          Longitud
          <input name="longitude" type="number" step="any" value={form.longitude} onChange={change} />
        </label>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-error">
          {errors.map((message) => <div key={message}>{message}</div>)}
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Guardando…" : submitLabel}</button>
      </div>
    </form>
  );
}
