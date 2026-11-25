import { useCallback, useEffect, useState } from "react";
import { errorText } from "../../api/client";
import { useToast } from "../../context/ToastContext";

/**
 * Componente reutilizable para un CRUD completo:
 *  - api: { list, create, update, remove }
 *  - fields: campos del formulario [{ name, label, type, options, required, ... }]
 *  - columns: columnas de la tabla [{ label, render(item) }]
 *  - toForm(item): convierte un registro en valores del formulario (para editar)
 */
export default function CrudSection({ title, singular, api, fields, columns, toForm, listQuery, toolbar, onChanged }) {
  const toast = useToast();
  const emptyForm = Object.fromEntries(fields.map((field) => [field.name, field.default ?? ""]));

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.list(listQuery);
      setItems(response.data);
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setLoading(false);
    }
  }, [api, listQuery, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors([]);
  };

  const validate = () => {
    const found = [];
    for (const field of fields) {
      const value = form[field.name];
      if (field.required && (value === "" || value === null || value === undefined)) {
        found.push(`"${field.label}" es obligatorio`);
      } else if (field.minLength && String(value).trim().length < field.minLength) {
        found.push(`"${field.label}" debe tener al menos ${field.minLength} caracteres`);
      } else if (field.type === "number" && value !== "" && (Number(value) < (field.min ?? -Infinity))) {
        found.push(`"${field.label}" debe ser mayor o igual a ${field.min}`);
      }
    }
    return found;
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length) return;

    // Limpia los valores antes de mandarlos al backend
    const payload = {};
    for (const field of fields) {
      let value = form[field.name];
      if (typeof value === "string") value = value.trim();
      if (field.type === "number") value = Number(value);
      if (!field.required && value === "" && !editingId) continue;
      payload[field.name] = value;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.update(editingId, payload);
        toast.success(`${singular} actualizado(a)`);
      } else {
        await api.create(payload);
        toast.success(`${singular} creado(a)`);
      }
      reset();
      await load();
      onChanged?.();
    } catch (error) {
      setErrors([error.message, ...(error.details || [])]);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...emptyForm, ...toForm(item) });
    setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (item) => {
    try {
      await api.remove(item.id);
      toast.success(`${singular} eliminado(a)`);
      if (editingId === item.id) reset();
      setConfirmId(null);
      await load();
      onChanged?.();
    } catch (error) {
      toast.error(errorText(error));
      setConfirmId(null);
    }
  };

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  return (
    <div className="crud">
      <form className="card form crud-form" onSubmit={submit} noValidate>
        <h2>{editingId ? `Editar ${singular.toLowerCase()}` : `Nuevo(a) ${singular.toLowerCase()}`}</h2>
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}{field.required && " *"}
            {field.type === "select" ? (
              <select name={field.name} value={form[field.name]} onChange={change}>
                {!field.required || !field.default ? <option value="">— Selecciona —</option> : null}
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea name={field.name} value={form[field.name]} onChange={change} rows={3} maxLength={field.maxLength} />
            ) : field.type === "color" ? (
              <div className="color-input">
                <input type="color" name={field.name} value={form[field.name] || "#000000"} onChange={change} />
                <code>{form[field.name]}</code>
              </div>
            ) : (
              <input
                name={field.name}
                type={field.type || "text"}
                value={form[field.name]}
                onChange={change}
                maxLength={field.maxLength}
                min={field.min}
                step={field.step}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}

        {errors.length > 0 && (
          <div className="alert alert-error">
            {errors.map((message) => <div key={message}>{message}</div>)}
          </div>
        )}

        <div className="actions">
          {editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancelar</button>}
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear"}
          </button>
        </div>
      </form>

      <div className="card table-card">
        <div className="table-header">
          <h2>{title} <span className="badge">{items.length}</span></h2>
          {toolbar}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => <th key={column.label}>{column.label}</th>)}
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="empty">Sin registros todavía.</td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className={editingId === item.id ? "editing" : ""}>
                  {columns.map((column) => <td key={column.label}>{column.render(item)}</td>)}
                  <td className="right nowrap">
                    {confirmId === item.id ? (
                      <>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(item)}>Confirmar</button>{" "}
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>Editar</button>{" "}
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(item.id)}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
