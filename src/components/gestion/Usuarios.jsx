import React, { useEffect, useState } from "react";
import { Button } from 'primereact/button';
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { getUsuarios, getRoles, createUsuario, updateUsuario, deleteUsuario } from "../services/axiosConfig";

export default function Usuarios() {
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [estadosUsuarios, setEstadosUsuarios] = useState({}); // Estados locales de usuarios

  // Funciones para manejar estados de usuarios en localStorage
  const cargarEstadosUsuarios = () => {
    const estadosGuardados = localStorage.getItem('estadosUsuarios');
    return estadosGuardados ? JSON.parse(estadosGuardados) : {};
  };

  const guardarEstadoUsuario = (usuarioId, estado) => {
    const estadosActuales = cargarEstadosUsuarios();
    estadosActuales[usuarioId] = estado;
    localStorage.setItem('estadosUsuarios', JSON.stringify(estadosActuales));
    setEstadosUsuarios(estadosActuales);
  };

  const obtenerEstadoUsuario = (usuarioId) => {
    const estados = cargarEstadosUsuarios();
    return estados[usuarioId] !== undefined ? estados[usuarioId] : true; // Por defecto activo
  };
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: { id: "", nombre: "" },
    estado: true // true = Activo, false = Inactivo
  });

  useEffect(() => {
    // Cargar estados de usuarios desde localStorage
    setEstadosUsuarios(cargarEstadosUsuarios());
    
    // Debug: Mostrar información del usuario actual
    console.log("=== DEBUG USUARIO ACTUAL ===");
    console.log("Usuario:", user);
    console.log("Token:", token ? "presente" : "ausente");
    
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      console.log("=== DEBUG CARGA DE DATOS ===");
      console.log("Intentando cargar usuarios...");
      
      const [usuariosData, rolesData] = await Promise.all([
        getUsuarios(token),
        getRoles(token)
      ]);
      
      console.log("Usuarios cargados:", usuariosData);
      console.log("Roles cargados:", rolesData);
      
      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (error) {
      console.error("=== ERROR AL CARGAR DATOS ===");
      console.error("Error completo:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Response headers:", error.response?.headers);
      
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        username: usuario.username,
        password: "", // No mostramos la contraseña actual
        role: { 
          id: usuario.role?.id || "", 
          nombre: usuario.role?.nombre || "" 
        },
        estado: obtenerEstadoUsuario(usuario.id) // Obtener estado desde localStorage
      });
    } else {
      setUsuarioEditando(null);
      setFormData({
        username: "",
        password: "",
        role: { id: "", nombre: "" },
        estado: true
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioEditando(null);
    setFormData({
      username: "",
      password: "",
      role: { id: "", nombre: "" }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "roleId") {
      const roleSeleccionado = roles.find(r => r.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        role: { 
          id: parseInt(value), 
          nombre: roleSeleccionado ? roleSeleccionado.nombre : "" 
        }
      }));
    } else if (name === "estado") {
      setFormData(prev => ({
        ...prev,
        estado: value === "true" // Convertir string a boolean
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const guardarUsuario = async () => {
    if (!formData.username.trim() || (!usuarioEditando && !formData.password.trim()) || !formData.role.id) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    try {
      setLoading(true);
      
      if (usuarioEditando) {
        // Actualizar usuario existente - usar UsuarioController
        const datosUsuario = {
          username: formData.username,
          roleDTO: { id: formData.role.id, nombre: formData.role.nombre }
          // Nota: El estado se maneja solo en frontend por ahora
        };

        // Solo incluir contraseña si se cambió
        if (formData.password.trim()) {
          datosUsuario.password = formData.password;
        }

        await updateUsuario(usuarioEditando.id, datosUsuario, token);
        
        // Guardar el estado en localStorage
        guardarEstadoUsuario(usuarioEditando.id, formData.estado);
        
        Swal.fire("¡Éxito!", "Usuario actualizado correctamente", "success");
      } else {
        // Crear nuevo usuario - usar AuthController 
        const datosUsuario = {
          username: formData.username,
          password: formData.password,
          role: { id: formData.role.id, nombre: formData.role.nombre }
          // Nota: El estado se maneja solo en frontend por ahora
        };

        const nuevoUsuario = await createUsuario(datosUsuario, token);
        
        // Guardar el estado del nuevo usuario en localStorage
        if (nuevoUsuario && nuevoUsuario.id) {
          guardarEstadoUsuario(nuevoUsuario.id, formData.estado);
        }
        
        Swal.fire("¡Éxito!", "Usuario registrado correctamente", "success");
      }

      await cargarDatos();
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      
      let mensaje = "Error al procesar la solicitud";
      if (error.response?.status === 400 && error.response?.data?.message) {
        mensaje = error.response.data.message;
      } else if (error.response?.status === 409) {
        mensaje = "El nombre de usuario ya existe";
      } else if (error.response?.data?.message) {
        mensaje = error.response.data.message;
      }
      
      Swal.fire("Error", mensaje, "error");
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (usuarioId, username) => {
    // Verificar si el usuario intenta eliminarse a sí mismo
    if (user?.id === usuarioId) {
      Swal.fire("Error", "No puedes eliminarte a ti mismo", "error");
      return;
    }

    const resultado = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar al usuario "${username}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (resultado.isConfirmed) {
      try {
        setLoading(true);
        await deleteUsuario(usuarioId, token);
        Swal.fire("¡Eliminado!", "El usuario ha sido eliminado", "success");
        await cargarDatos();
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        const mensaje = error.response?.data?.message || "Error al eliminar el usuario";
        Swal.fire("Error", mensaje, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName?.toUpperCase()) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "CAJERO":
        return "bg-green-100 text-green-800";
      case "VENDEDOR":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {    
    // Excluir el usuario actual de la lista (comparación robusta)
    const isCurrentUser = String(usuario.id) === String(user?.id);
    
    return !isCurrentUser && (
      usuario.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      (usuario.role?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // Verificar si el usuario actual puede editar otro usuario
  const puedeEditar = (usuario) => {
    return user?.id !== usuario.id; // No puede editarse a sí mismo
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Administra usuarios y sus roles en el sistema</p>
            </div>
            
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Buscador */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        {usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">No hay usuarios que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-semibold text-sm">
                              {usuario.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(usuario.role?.nombre)}`}>
                          {usuario.role?.nombre || 'Sin rol'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          obtenerEstadoUsuario(usuario.id) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {obtenerEstadoUsuario(usuario.id) ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <React.Fragment>
                          <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => abrirModal(usuario)} />
                          <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => eliminarUsuario(usuario.id, usuario.username)} />
                        </React.Fragment>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); guardarUsuario(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {usuarioEditando && "(dejar vacío para mantener actual)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required={!usuarioEditando}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    name="roleId"
                    value={formData.role.id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Guardando...' : (usuarioEditando ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
