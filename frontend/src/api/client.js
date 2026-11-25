// Cliente HTTP: agrega el token, convierte la respuesta a JSON y
// lanza un Error con el mensaje que manda el backend.
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const TOKEN_KEY = "acopiomap.token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details || [];
  }
}

export async function request(path, { method = "GET", body, query } = {}) {
  const url = new URL(API_URL + path);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      url.searchParams.set(key, value);
    }
  });

  const headers = { "Content-Type": "application/json" };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Sesión expirada o inválida: avisamos a la app para cerrar sesión.
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new ApiError(
      response.status,
      data?.message || `Error ${response.status}`,
      data?.details
    );
  }
  return data;
}

// Convierte un ApiError en un texto legible para mostrar en pantalla.
export function errorText(error) {
  if (error?.details?.length) {
    return `${error.message}: ${error.details.join(" · ")}`;
  }
  return error?.message || "Ocurrió un error inesperado";
}
