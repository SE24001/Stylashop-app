import { useAuth } from "../context/AuthContext";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-gray-50 text-gray-800 px-2 sm:px-4 md:px-6 py-2 sm:py-4 flex flex-wrap items-center justify-between shadow border-b border-gray-200 gap-2">
      <div className="flex items-center w-full md:w-auto justify-between gap-2">
        <button
          className="mr-2 sm:mr-4 p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          onClick={toggleSidebar}
        >
          &#9776;
        </button>
        <h1 className="text-lg sm:text-2xl font-extrabold font-serif text-gray-700 tracking-wide">
          StylaShop
        </h1>
      </div>
      {/* Solo mostrar usuario y cerrar sesión en desktop */}
      <div className="hidden md:flex flex-col sm:flex-row items-center w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0 gap-2">
        <div className="text-base font-semibold text-black">
          <b>Usuario:</b> {loading ? "Cargando..." : (user?.username || user?.nombre || 'Sin nombre')}
        </div>
        <button
          onClick={logout}
          className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 text-base font-bold transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;