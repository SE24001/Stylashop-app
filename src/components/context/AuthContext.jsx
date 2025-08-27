import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";


//verificamos si un token JWT no ha expirado
const isTokenExpired = (token) => {
    try{
        const {exp} = jwtDecode(token);
        return Date.now() >= exp * 1000;
    }catch{
        return true;
    }
}

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const initialToken = localStorage.getItem("token");

  const initialState = (() => {
    if (initialToken && !isTokenExpired(initialToken)) {
      try {
        const decoded = jwtDecode(initialToken);
        return {
          token: initialToken,
          user: {
            userId: decoded.userId,
            nombre: decoded.nombre,
            correo: decoded.correo,
            role: decoded.role
          },
          role: decoded?.role || decoded?.authorities?.[0] || null,
        };
      } catch {
        localStorage.removeItem("token");
      }
    }
    return { token: null, user: null, role: null };
  })();

  //definiendo Hooks de estado

  const [authState, setAuthState] = useState(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialState.token);

  const login = (token) => {
        try {
            const decoded = jwtDecode(token);
            const user = {
                userId: decoded.userId,
                nombre: decoded.nombre,
                correo: decoded.correo,
                role: decoded.role
                };
                const role = decoded?.role || decoded?.authorities?.[0] || null;
            localStorage.setItem("token", token);
            setAuthState({ token, user, role });
            setIsAuthenticated(true);
        } catch(err) {
            console.error("error", err);
            throw new Error("Token inválido");
        }
    }
    //función para destruir los datos de session
    const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ token: null, user: null, role: null });
    setIsAuthenticated(false);
    };
    //si el token esta expiraodo, cerramos la sesión
    useEffect(() => {
        if (authState.token && isTokenExpired(authState.token)) {
            logout();
        }
    }, [authState.token]);

    return (
        <AuthContext.Provider 
        value={{
            ...authState,//contiene token, user y role
             isAuthenticated, 
             login, 
             logout
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