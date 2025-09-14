import { FaHome, FaList, FaUserFriends, FaBoxOpen, FaChartBar } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { to: "/dashboard", icon: <FaHome />, label: "Inicio" },
  { to: "/catalogos", icon: <FaList />, label: "Catálogos" },
  { to: "/clientes", icon: <FaUserFriends />, label: "Clientes" },
  { to: "/ventas", icon: <FaBoxOpen />, label: "Ventas" },
  { to: "/reportes", icon: <FaChartBar />, label: "Reportes" },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-white shadow-lg border-r flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-6 flex flex-col items-center">
        <img
          src="/images/logo.jpeg"
          alt="Logo"
          className="w-16 h-16 rounded-full mb-2 shadow"
        />
        <h2 className="text-xl font-bold text-gray-800">StylaShop</h2>
        <span className="text-gray-500 text-sm">Panel de Administración</span>
        {/* Usuario y cerrar sesión solo en móviles/tablets */}
        <div className="flex flex-col items-center mt-4 w-full md:hidden">
          <div className="text-base font-semibold text-black mb-2">
            <b>Usuario:</b> {loading ? "Cargando..." : (user?.username || user?.nombre || 'Sin nombre')}
          </div>
          <button
            onClick={logout}
            className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 text-base font-bold transition-colors w-full"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      {/* Menú de navegación */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center px-4 py-2 my-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 text-gray-700 font-medium ${location.pathname === item.to ? "bg-gray-100" : ""}`}
            onClick={handleMenuClick}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>

  );
}

export default Sidebar;