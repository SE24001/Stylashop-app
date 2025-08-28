import { useAuth } from "../context/AuthContext";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-primary text-white px-4 py-3 flex items-center justify-between flex-wrap md:flex-nowrap">
      <div className="flex items-center w-full md:w-auto justify-between">
        <button
          className="mr-4 p-2 text-white bg-secondary rounded hover:bg-secondary-dark"
          onClick={toggleSidebar}
        >
          &#9776;
        </button>
        <h1 className="text-lg font-bold text-center md:text-left">Panel Administrativo - Sistema de Gestión de Restaurantes</h1>
      </div>
      <div className="flex items-center w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0">
        <p className="mr-4 text-sm md:text-base"><b>Usuario:</b> {user?.nombre || 'Usuario'}</p>
        <button
          onClick={logout}
          className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;