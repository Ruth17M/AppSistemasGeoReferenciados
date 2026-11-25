import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { errorText } from "../api/client";
import LoginBackdrop from "../components/map/LoginBackdrop";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validación en el cliente (el backend vuelve a validar todo).
function validate(mode, form) {
  const errors = [];
  if (mode === "register" && form.name.trim().length < 3) {
    errors.push("El nombre debe tener al menos 3 caracteres");
  }
  if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.push("Escribe un correo válido");
  }
  if (mode === "register") {
    if (form.password.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres");
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      errors.push("La contraseña debe incluir letras y números");
    }
    if (form.password !== form.confirm) errors.push("Las contraseñas no coinciden");
  } else if (!form.password) {
    errors.push("Escribe tu contraseña");
  }
  return errors;
}

const EMPTY = { name: "", email: "", password: "", confirm: "" };

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/mapa" replace />;

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const switchMode = (next) => {
    setMode(next);
    setErrors([]);
    setForm({ ...EMPTY, email: form.email });
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(mode, form);
    setErrors(found);
    if (found.length) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email.trim(), password: form.password });
        toast.success("¡Bienvenido de nuevo!");
      } else {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
        toast.success("Cuenta creada correctamente");
      }
      navigate(location.state?.from || "/mapa", { replace: true });
    } catch (error) {
      setErrors([errorText(error)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <LoginBackdrop />
      <div className="auth-veil" />

      <section className="auth-hero">
        <span className="eyebrow">Coordinación de ayuda humanitaria</span>
        <h1>
          Acopio<span>Map</span>
        </h1>
        <p>
          Localiza, registra y coordina los centros de acopio y las zonas afectadas
          durante una emergencia, para que la ayuda llegue a donde más se necesita.
        </p>
        <ul className="auth-points">
          <li><strong>Ubica</strong> cada centro con un clic</li>
          <li><strong>Traza</strong> zonas afectadas</li>
          <li><strong>Filtra</strong> qué se necesita y dónde</li>
        </ul>
      </section>

      <section className="auth-card card">
        <h2 className="auth-title">{mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h2>
        <div className="tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">
            Iniciar sesión
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">
            Crear cuenta
          </button>
        </div>

        <form onSubmit={submit} className="form" noValidate>
          {mode === "register" && (
            <label>
              Nombre completo
              <input name="name" value={form.name} onChange={change} autoComplete="name" />
            </label>
          )}
          <label>
            Correo electrónico
            <input name="email" type="email" value={form.email} onChange={change} autoComplete="email" />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={change}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          {mode === "register" && (
            <label>
              Confirmar contraseña
              <input name="confirm" type="password" value={form.confirm} onChange={change} autoComplete="new-password" />
            </label>
          )}

          {errors.length > 0 && (
            <div className="alert alert-error">
              {errors.map((message) => <div key={message}>{message}</div>)}
            </div>
          )}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Procesando…" : mode === "login" ? "Entrar" : "Registrarme"}
          </button>
          {mode === "register" && (
            <small className="muted">Mínimo 8 caracteres, con letras y números.</small>
          )}
        </form>
      </section>
    </div>
  );
}
