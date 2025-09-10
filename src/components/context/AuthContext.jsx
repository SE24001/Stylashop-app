import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { urlBase } from "../utils/config";

// Verifica si un token JWT ha expirado
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initialToken = localStorage.getItem("token");

  const initialState = (() => {
    if (initialToken && !isTokenExpired(initialToken)) {
      try {
        const decoded = jwtDecode(initialToken);
        const correo =
          decoded.correo || decoded.email || decoded.sub || null;
        const role =
          decoded.role ||
          decoded.roles?.[0] ||
          decoded.authorities?.[0] ||
          null;

        return {
          token: initialToken,
          user: {
            userId: decoded.userId,
            nombre: decoded.nombre,
            username: decoded.username || decoded.sub,
            correo,
            role,
          },
          role,
        };
      } catch {
        localStorage.removeItem("token");
      }
    }
    return { token: null, user: null, role: null };
  })();

  const [authState, setAuthState] = useState(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialState.token);
  const [loading, setLoading] = useState(false);

  // Función para obtener datos actualizados del usuario
  const fetchUserData = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${urlBase}auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    try {
      const decoded = jwtDecode(token);
      const correo =
        decoded.correo || decoded.email || decoded.sub || null;
      const role =
        decoded.role ||
        decoded.roles?.[0] ||
        decoded.authorities?.[0] ||
        null;

      let user = {
        userId: decoded.userId,
        nombre: decoded.nombre,
        username: decoded.username || decoded.sub,
        correo,
        role,
      };

      // Intentar obtener datos más completos del backend
      const userData = await fetchUserData(token);
      if (userData) {
        user = { ...user, ...userData };
      }

      localStorage.setItem("token", token);
      setAuthState({ token, user, role });
      setIsAuthenticated(true);
    } catch (err) {
      console.error("error", err);
      throw new Error("Token inválido");
    }
  };

  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    if (authState.token && !isTokenExpired(authState.token)) {
      const userData = await fetchUserData(authState.token);
      if (userData) {
        setAuthState(prev => ({
          ...prev,
          user: { ...prev.user, ...userData }
        }));
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ token: null, user: null, role: null });
    setIsAuthenticated(false);
  };

  // Si el token está expirado, cerramos sesión
  useEffect(() => {
    if (authState.token && isTokenExpired(authState.token)) {
      logout();
    }
  }, [authState.token]);

  return (
    <AuthContext.Provider
      value={{
        ...authState, // contiene token, user y role
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
