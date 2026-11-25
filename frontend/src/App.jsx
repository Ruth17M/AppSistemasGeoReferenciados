import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import CatalogsPage from "./pages/CatalogsPage";
import SummaryPage from "./pages/SummaryPage";

export default function App() {
  return (
    <Routes>
      {/* Vista 1: inicio de sesión / registro */}
      <Route path="/login" element={<LoginPage />} />

      {/* Vistas internas: solo con sesión iniciada */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Vista 2: mapa + tabla */}
          <Route path="/mapa" element={<MapPage />} />
          {/* Vista 3: catálogos (CRUD de categorías, organizaciones e insumos) */}
          <Route path="/catalogos" element={<CatalogsPage />} />
          {/* Vista 4: resumen por zona y categoría */}
          <Route path="/resumen" element={<SummaryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/mapa" replace />} />
    </Routes>
  );
}
