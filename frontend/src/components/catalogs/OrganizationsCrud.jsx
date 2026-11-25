import CrudSection from "./CrudSection";
import { organizationsApi } from "../../api/services";
import { ORGANIZATION_TYPES } from "../../utils/constants";

const fields = [
  { name: "name", label: "Nombre", required: true, minLength: 3, maxLength: 80 },
  { name: "type", label: "Tipo", type: "select", required: true, options: ORGANIZATION_TYPES },
  { name: "contactName", label: "Persona responsable", required: true, minLength: 3, maxLength: 80 },
  { name: "phone", label: "Teléfono", required: true, maxLength: 20, placeholder: "55 1234 5678" },
  { name: "email", label: "Correo", type: "email", maxLength: 120 },
];

const typeLabel = (value) => ORGANIZATION_TYPES.find((type) => type.value === value)?.label || value;

const columns = [
  { label: "Nombre", render: (item) => <strong>{item.name}</strong> },
  { label: "Tipo", render: (item) => typeLabel(item.type) },
  { label: "Responsable", render: (item) => item.contactName },
  { label: "Teléfono", render: (item) => item.phone },
  { label: "Correo", render: (item) => item.email || "—" },
  { label: "Centros a cargo", render: (item) => item.locationsCount ?? 0 },
];

export default function OrganizationsCrud() {
  return (
    <CrudSection
      title="Organizaciones"
      singular="Organización"
      api={organizationsApi}
      fields={fields}
      columns={columns}
      toForm={(item) => ({
        name: item.name,
        type: item.type,
        contactName: item.contactName,
        phone: item.phone,
        email: item.email || "",
      })}
    />
  );
}
