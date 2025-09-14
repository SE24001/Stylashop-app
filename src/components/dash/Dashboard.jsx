import { FaCube, FaUserFriends, FaBoxOpen, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-8 px-2 md:px-8">
      {/* Barra superior */}
      <div className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between px-8 py-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-sans mb-2">
            StylaShop Admin
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Gestiona tu tienda de moda con estilo, diversidad y elegancia.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-semibold">Bienvenido, Admin</span>
        </div>
      </div>

      {/* Banner de bienvenida */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-400 to-yellow-300 rounded-xl shadow-lg px-8 py-8 flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h2>
          <p className="text-white text-lg">
            Administra productos, clientes y pedidos en un entorno moderno y
            profesional.
          </p>
        </div>
        <div className="hidden md:block">
          <img
            src="/images/logo.jpeg"
            alt="StyleShop"
            className="w-24 h-24 rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Cards de acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
          <div className="bg-blue-100 rounded-full p-4 mb-2">
            <FaCube className="text-4xl text-blue-500" />
          </div>
          <span className="font-bold text-lg mb-1 text-gray-800">Productos</span>
          <p className="text-gray-500 text-center">
            Agrega, edita y organiza tu catálogo de moda.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
          <div className="bg-pink-100 rounded-full p-4 mb-2">
            <FaUserFriends className="text-4xl text-pink-500" />
          </div>
          <span className="font-bold text-lg mb-1 text-gray-800">Clientes</span>
          <p className="text-gray-500 text-center">
            Gestiona la información y preferencias de tus clientes.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
          <div className="bg-yellow-100 rounded-full p-4 mb-2">
            <FaBoxOpen className="text-4xl text-yellow-500" />
          </div>
          <span className="font-bold text-lg mb-1 text-gray-800">Órdenes</span>
          <p className="text-gray-500 text-center">
            Controla pedidos, envíos y el historial de compras.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
          <div className="bg-purple-100 rounded-full p-4 mb-2">
            <FaChartBar className="text-4xl text-purple-500" />
          </div>
          <span className="font-bold text-lg mb-1 text-gray-800">Reportes</span>
          <p className="text-gray-500 text-center">
            Realiza reportes con los datos de los ingresos obtenidos.
          </p>
        </div>
      </div>

      {/* Sección de inspiración visual */}
      <div className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between p-8 mb-8">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 font-sans">
            Moda que inspira
          </h3>
          <p className="text-gray-600 mb-4">
            Descubre tendencias, gestiona tu inventario y haz crecer tu marca con
            una interfaz pensada para el éxito.
          </p>
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors"
            onClick={() => navigate("/catalogos")}
          >
            Explorar Catálogo
          </button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80"
          alt="Moda elegante"
          className="rounded-xl w-40 h-40 object-cover shadow-lg ml-0 md:ml-8 mt-6 md:mt-0"
        />
      </div>
    </div>
  );
}