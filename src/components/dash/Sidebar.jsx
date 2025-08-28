import { FaHome, FaTachometerAlt, FaRegFilePdf,FaCog, FaUserFriends, FaClipboard, FaList, FaDollarSign, FaShopify, FaCheck, FaChartBar, FaSearch, FaBorderStyle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={`bg-blue-700 text-white w-64 fixed top-16 left-0 h-[calc(100%-4rem)] z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 bg-blue-800 text-center">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-24 h-24 mx-auto mb-2 rounded-full"
        />
        <h2 className="text-xl font-bold">Orders-APP</h2>
      </div>

      {/* Menú */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul>
          <li>
            <Link
              to="/dashboard"
              className="p-4 hover:bg-blue-800 cursor-pointer flex items-center"
              onClick={handleMenuClick}
            >
              <FaHome className="mr-2" />
              Inicio
            </Link>
          </li>
          
          {(user?.role === "ADMIN") && (
            <li>
              <Link
                to="/catalogos"
                className="p-4 hover:bg-blue-800 cursor-pointer flex items-center"
                onClick={handleMenuClick}
              >
                <FaList className="mr-2" />
                Catálogos
              </Link>
            </li>
          )}

          {(user?.role === "ADMIN" || user?.role === "MESERO/A") && (
            <li>
              <Link
                to="/clientes"
                className="p-4 hover:bg-blue-800 cursor-pointer flex items-center"
                onClick={handleMenuClick}
              >
                <FaUserFriends className="mr-2" />
                Clientes
              </Link>
            </li>
          )}

          
          {(user?.role === "ADMIN" || user?.role === "REGISTRO" || user?.role === "COLECTOR") && (
            <li>
              <Link
                to="/ordenes"
                className="p-4 hover:bg-blue-800 cursor-pointer flex items-center"
                onClick={handleMenuClick}
              >
                <FaBorderStyle className="mr-2" />
                Gestión Ordenes
              </Link>
            </li>
          )}

          
          {user?.role === "ADMIN" && (
            <li>
              <Link
                to="/reportes"
                className="p-4 hover:bg-blue-800 cursor-pointer flex items-center"
                onClick={handleMenuClick}
              >
                <FaChartBar className="mr-2" />
                Reportes
              </Link>
            </li>
          )}

          {user?.role === "ADMIN" && (
            <li>
              <Link
                to="/usuarios"
                className="p-4 hover:bg-blue-800 cursor-pointer flex items-center"
                onClick={handleMenuClick}
              >
                <FaUserFriends className="mr-2" />
                Gestión Usuarios
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;