import { Link } from "react-router-dom";
import { MdCategory, MdLocalOffer } from "react-icons/md";
import { IoCube } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

const catalogItems = [
  { id: 1, name: "Categorías", icon: MdCategory, path: "/categorias", color: "bg-blue-500" },
  { id: 2, name: "Marcas",     icon: MdLocalOffer, path: "/marcas",     color: "bg-purple-500" },
  { id: 3, name: "Productos",  icon: IoCube,       path: "/productos",  color: "bg-green-500" },
];

const Catalogos = () => {
  // const { user } = useAuth(); // úsalo si filtrarás por rol/permiso
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500 mb-6">Catálogos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {catalogItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              to={item.path}
              key={item.id}
              className="flex flex-col items-center p-5 bg-white rounded-lg shadow-md
                         hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            >
              <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mb-3`}>
                <Icon size={36} className="text-white" />
              </div>
              <div className="text-lg font-medium text-gray-700">{item.name}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Catalogos;
