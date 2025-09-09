import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { urlBase } from "../utils/config";

const Login = () => {
  // Estado del formulario
  const [credentials, setCredentials] = useState({ username: "", password: "" }); // Cambiado a username
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Autenticación con el backend
  const sendLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, status } = await axios.post(
        `${urlBase}auth/login`,
        credentials
      );

      if (status === 200 && data?.token) {
        // El contexto decodifica el token por dentro
        login(data.token);
        navigate("/dashboard");
      } else {
        setError("Respuesta inesperada del servidor.");
      }
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401) setError("Usuario o contraseña inválidos");
      else if (code === 403) setError("Usuario no autorizado");
      else setError("Error inesperado. Intenta de nuevo.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-700">
            Iniciar Sesión
          </h2>
        </div>

        {/* Formulario de login */}
        <form onSubmit={sendLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                autoComplete="username"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                           shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                           shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botón enviar */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center bg-blue-600 
                  text-white border-transparent border rounded-md text-md shadow-sm 
                  py-2 px-4 font-bold hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
