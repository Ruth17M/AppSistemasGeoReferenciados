import { useSearchParams } from "react-router-dom";
import CategoriesCrud from "../components/catalogs/CategoriesCrud";
import OrganizationsCrud from "../components/catalogs/OrganizationsCrud";
import SuppliesCrud from "../components/catalogs/SuppliesCrud";

const TABS = [
  { id: "categorias", label: "Categorías", component: CategoriesCrud },
  { id: "organizaciones", label: "Organizaciones", component: OrganizationsCrud },
  { id: "insumos", label: "Insumos", component: SuppliesCrud },
];

export default function CatalogsPage() {
  const [params, setParams] = useSearchParams();
  const active = TABS.find((tab) => tab.id === params.get("tab")) || TABS[0];
  const Component = active.component;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Catálogos</h1>
          <p className="muted">Administra las categorías de los centros, las organizaciones responsables y los insumos de cada centro.</p>
        </div>
        <div className="tabs">
          {TABS.map((tab) => (
            <button key={tab.id} className={tab.id === active.id ? "active" : ""} onClick={() => setParams({ tab: tab.id })}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <Component key={active.id} />
    </div>
  );
}
