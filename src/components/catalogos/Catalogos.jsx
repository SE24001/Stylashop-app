import { useNavigate } from "react-router-dom";

const catalogos = [
  { nombre: "Productos", descripcion: "Gestiona tu catálogo de moda.", ruta: "/productos", color: "bg-blue-50", icon: "👗" },
  { nombre: "Marcas", descripcion: "Administra las marcas disponibles.", ruta: "/marcas", color: "bg-gray-100", icon: "🏷️" },
  { nombre: "Categorías", descripcion: "Organiza las categorías de productos.", ruta: "/categorias", color: "bg-green-50", icon: "📂" },
];

export default function Catalogos() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 font-serif">Catálogos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {catalogos.map((cat) => (
          <button
            key={cat.nombre}
            onClick={() => navigate(cat.ruta)}
            className={`flex flex-col items-center justify-center ${cat.color} rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 py-8 px-4 hover:bg-gray-200`}
          >
            <span className="text-5xl mb-4">{cat.icon}</span>
            <span className="font-bold text-lg text-gray-700 mb-2">{cat.nombre}</span>
            <span className="text-gray-500 text-center">{cat.descripcion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
