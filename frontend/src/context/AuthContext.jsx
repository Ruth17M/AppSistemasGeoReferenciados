import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/services";
import { tokenStorage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(tokenStorage.get()));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // Al abrir la app, si hay token guardado se valida contra el backend.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    authApi
      .me()
      .then((response) => setUser(response.data))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  // Si cualquier petición responde 401, se cierra la sesión.
  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const saveSession = (response) => {
    tokenStorage.set(response.data.token);
    setUser(response.data.user);
    return response;
  };

  const login = async (credentials) => saveSession(await authApi.login(credentials));
  const register = async (data) => saveSession(await authApi.register(data));

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
