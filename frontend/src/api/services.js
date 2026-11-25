import { request } from "./client";

// Una función por endpoint del backend.
export const authApi = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  me: () => request("/auth/me"),
};

function crud(path) {
  return {
    list: (query) => request(path, { query }),
    get: (id) => request(`${path}/${id}`),
    create: (data) => request(path, { method: "POST", body: data }),
    update: (id, data) => request(`${path}/${id}`, { method: "PATCH", body: data }),
    remove: (id) => request(`${path}/${id}`, { method: "DELETE" }),
  };
}

export const locationsApi = crud("/locations");
export const zonesApi = crud("/zones");
export const categoriesApi = crud("/categories");
export const organizationsApi = crud("/organizations");
export const suppliesApi = crud("/supplies");
