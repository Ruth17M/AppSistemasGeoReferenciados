import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // En la vista del mapa la barra flota sobre el mapa a pantalla completa.
  const isMap = pathname === "/mapa";

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <div className={`app-shell ${isMap ? "is-map" : ""}`}>
      <header className="topbar">
        <div className="brand glass">
          <img src="/favicon.svg" alt="" width="26" height="26" />
          <span>AcopioMap</span>
        </div>
        <nav className="nav-pill glass">
          <NavLink to="/mapa">Mapa</NavLink>
          <NavLink to="/catalogos">Catálogos</NavLink>
          <NavLink to="/resumen">Resumen</NavLink>
        </nav>
        <div className="nav-user glass">
          <span className="avatar" title={user.email}>{initials(user.name)}</span>
          <span className="nav-user-name">{user.name}</span>
          <button className="icon-btn" onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
            <Icon name="logout" />
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
