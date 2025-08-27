import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

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

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      const correo =
        decoded.correo || decoded.email || decoded.sub || null;
      const role =
        decoded.role ||
        decoded.roles?.[0] ||
        decoded.authorities?.[0] ||
        null;

      const user = {
        userId: decoded.userId,
        nombre: decoded.nombre,
        correo,
        role,
      };

      localStorage.setItem("token", token);
      setAuthState({ token, user, role });
      setIsAuthenticated(true);
    } catch (err) {
      console.error("error", err);
      throw new Error("Token inválido");
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
        login,
        logout,
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
