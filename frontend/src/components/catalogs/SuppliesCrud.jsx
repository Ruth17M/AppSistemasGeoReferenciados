import { useEffect, useMemo, useState } from "react";
import CrudSection from "./CrudSection";
import { locationsApi, suppliesApi } from "../../api/services";
import { errorText } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { SUPPLY_PRIORITIES, SUPPLY_UNITS, formatDate } from "../../utils/constants";

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Insumos: cada uno pertenece a un centro de acopio (ObjectId + populate).
export default function SuppliesCrud() {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState({ location: "all", priority: "all" });

  useEffect(() => {
    locationsApi
      .list()
      .then((response) => setLocations(response.data))
      .catch((error) => toast.error(errorText(error)));
  }, [toast]);

  const fields = useMemo(
    () => [
      { name: "name", label: "Insumo", required: true, minLength: 3, maxLength: 80, placeholder: "Ej. Arroz" },
      { name: "quantity", label: "Cantidad", type: "number", required: true, min: 0, step: "any" },
      { name: "unit", label: "Unidad", type: "select", required: true, default: "piezas",
        options: SUPPLY_UNITS.map((unit) => ({ value: unit, label: unit })) },
      { name: "priority", label: "Prioridad", type: "select", required: true, default: "media",
        options: SUPPLY_PRIORITIES.map((priority) => ({ value: priority, label: capitalize(priority) })) },
      { name: "location", label: "Centro de acopio", type: "select", required: true,
        options: locations.map((location) => ({ value: location.id, label: location.name })) },
    ],
    [locations]
  );

  const columns = [
    { label: "Insumo", render: (item) => <strong>{item.name}</strong> },
    { label: "Cantidad", render: (item) => `${item.quantity} ${item.unit}` },
    { label: "Prioridad", render: (item) => <span className={`priority priority-${item.priority}`}>{capitalize(item.priority)}</span> },
    { label: "Centro de acopio", render: (item) => item.location?.name || "—" },
    { label: "Actualizado", render: (item) => formatDate(item.updatedAt) },
  ];

  const listQuery = useMemo(() => ({ ...filter }), [filter]);

  const toolbar = (
    <div className="toolbar">
      <select value={filter.location} onChange={(event) => setFilter({ ...filter, location: event.target.value })}>
        <option value="all">Todos los centros</option>
        {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
      </select>
      <select value={filter.priority} onChange={(event) => setFilter({ ...filter, priority: event.target.value })}>
        <option value="all">Toda prioridad</option>
        {SUPPLY_PRIORITIES.map((priority) => <option key={priority} value={priority}>{capitalize(priority)}</option>)}
      </select>
    </div>
  );

  return (
    <CrudSection
      title="Insumos"
      singular="Insumo"
      api={suppliesApi}
      fields={fields}
      columns={columns}
      listQuery={listQuery}
      toolbar={toolbar}
      toForm={(item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        priority: item.priority,
        location: item.location?.id || "",
      })}
    />
  );
}
