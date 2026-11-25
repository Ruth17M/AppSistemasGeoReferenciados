import CrudSection from "./CrudSection";
import { categoriesApi } from "../../api/services";
import { formatDate } from "../../utils/constants";

const fields = [
  { name: "name", label: "Nombre", required: true, minLength: 3, maxLength: 50 },
  { name: "description", label: "Descripción", type: "textarea", maxLength: 200 },
  { name: "color", label: "Color del pin", type: "color", required: true, default: "#ea580c" },
];

const columns = [
  {
    label: "Categoría",
    render: (item) => <span className="chip" style={{ "--chip": item.color }}>{item.name}</span>,
  },
  { label: "Descripción", render: (item) => item.description || "—" },
  { label: "Color", render: (item) => <code>{item.color}</code> },
  { label: "Creada", render: (item) => formatDate(item.createdAt) },
];

export default function CategoriesCrud() {
  return (
    <CrudSection
      title="Categorías"
      singular="Categoría"
      api={categoriesApi}
      fields={fields}
      columns={columns}
      toForm={(item) => ({ name: item.name, description: item.description || "", color: item.color })}
    />
  );
}
