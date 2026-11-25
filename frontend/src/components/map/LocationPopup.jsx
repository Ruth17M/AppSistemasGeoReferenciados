import { useEffect, useRef, useState } from "react";
import { Popup } from "react-leaflet";
import LocationForm from "./LocationForm";
import { formatDate, POPUP_PADDING, statusLabel } from "../../utils/constants";
import Icon from "../Icon";

// Popup de un centro de acopio: ver, editar ahí mismo y eliminar.
export default function LocationPopup({ location, categories, organizations, onUpdate, onDelete }) {
  const [mode, setMode] = useState("view"); // view | edit | confirm
  const [deleting, setDeleting] = useState(false);
  const popupRef = useRef(null);
  const [lng, lat] = location.location.coordinates;

  // Reajusta el tamaño del popup cuando cambia su contenido.
  useEffect(() => {
    popupRef.current?.update();
  }, [mode, location]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(location);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Popup ref={popupRef} minWidth={280} maxWidth={340} {...POPUP_PADDING} eventHandlers={{ remove: () => setMode("view") }}>
      {mode === "edit" ? (
        <>
          <h3 className="popup-title">Editar centro</h3>
          <LocationForm
            initial={{
              name: location.name,
              description: location.description,
              category: location.category?.id,
              organization: location.organization?.id,
              status: location.status,
              latitude: lat,
              longitude: lng,
            }}
            categories={categories}
            organizations={organizations}
            submitLabel="Guardar cambios"
            onCancel={() => setMode("view")}
            onSubmit={async (data) => {
              await onUpdate(location.id, data);
              setMode("view");
            }}
          />
        </>
      ) : (
        <div className="popup-view">
          <span className="chip" style={{ "--chip": location.category?.color }}>
            {location.category?.name || "Sin categoría"}
          </span>
          <h3 className="popup-title">{location.name}</h3>
          <p>{location.description}</p>
          <dl>
            <dt>Estado</dt>
            <dd><span className={`status status-${location.status}`}>{statusLabel(location.status)}</span></dd>
            <dt>Organización</dt>
            <dd>{location.organization?.name || "Sin asignar"}</dd>
            <dt>Coordenadas</dt>
            <dd>{lat.toFixed(5)}, {lng.toFixed(5)}</dd>
            <dt>Registró</dt>
            <dd>{location.createdBy?.name || "—"} · {formatDate(location.createdAt)}</dd>
          </dl>

          {mode === "confirm" ? (
            <div className="confirm-box">
              <span>¿Eliminar este centro y sus insumos?</span>
              <div className="actions">
                <button className="btn btn-ghost" onClick={() => setMode("view")}>No</button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Eliminando…" : "Sí, eliminar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="actions">
              <button className="btn btn-secondary" onClick={() => setMode("edit")}><Icon name="edit" size={15} /> Editar</button>
              <button className="btn btn-danger" onClick={() => setMode("confirm")}><Icon name="trash" size={15} /> Eliminar</button>
            </div>
          )}
        </div>
      )}
    </Popup>
  );
}
