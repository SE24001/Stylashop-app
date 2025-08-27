import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { urlBase } from "../utils/config";
import { jwtDecode } from "jwt-decode";


const Login = () =>{
   //definimos hooks de estado para las variables que enviaran los 
    const[credentials, setCredentials] = 
    useState({correo: '', password: ''});
    const[password, setPassword] = useState("");
    const[err, setError] = useState(null);

    const {login} = useAuth();
    const navigate = useNavigate();

    //definimos funcion para la autenticacion con el backend
    const sendLogin = async (e) =>{
        e.preventDefault();
        setError("");
        try{
            const response = await axios.post(`${urlBase}auth/login`,credentials);
            if(!response.ok){
                setError("Usuario o contraseña inválida");
            }
            if(response.status === 200){
                const {token} = response.data;
                //decodificamos el token para obtener los datos del usuario
                const decodedToken = jwtDecode(token);
                const {sub : username, role} = decodedToken;
                login(token, (username,role));
                //redireccionamos al panel administrativo de la aplicacion
                navigate("/dashboard");
            }else{
                setError("Error inesperado...");
            }
        }catch(err){
          if(err.response.status === 401){
            setError("Usuario o contraseña inválida");
        }else if(err.response.status === 403){
            setError("Usuario no autorizado");
    }else{
      console.error("error",err);
    }
  }
}
   

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
                  setCredentials ({ ...credentials, username: e.target.value })}
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
                  setCredentials ({ ...credentials, password: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                           shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {err && <p className="text-red-500 text-sm">{err}</p>}

          {/* Botón enviar */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center bg-blue-600 
                  text-white border-transparent border rounded-md text-md shadow-sm 
                  py-2 px-4 font-bold hover:bg-blue-800"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;