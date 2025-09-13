import React from "react";

export default function OrderCart({ carrito, onRemove, onAdd, onClear }) {
  const calcularTotal = () =>
    carrito.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0);

  if (carrito.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13l-4-8m4 8v6m0-6h10m0 0v6m0-6l1.5-6.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Venta en Proceso...</h3>
          <p className="text-sm text-gray-500">No hay productos. Añade desde el catálogo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg relative">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Venta en Proceso</h3>
          <button
            onClick={onClear}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <ul className="divide-y divide-gray-100">
          {carrito.map((producto) => (
            <li key={producto.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={producto.imagenUrl 
                      ? `http://localhost:8080/uploads/productos/${producto.imagenUrl.trim()}` 
                      : '/images/placeholder-product.jpg'
                    }
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log(`Error cargando imagen en carrito para ${producto.nombre}:`, producto.imagenUrl);
                      e.target.src = '/images/placeholder-product.jpg';
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {producto.nombre}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ${producto.precioUnitario} c/u
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => onRemove(producto.id)}
                      className="w-8 h-8 rounded-l-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-semibold text-sm bg-white px-2 py-1">
                      {producto.cantidad}
                    </span>
                    <button
                      onClick={() => onAdd(producto)}
                      className="w-8 h-8 rounded-r-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    ${(producto.precioUnitario * producto.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-700">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            ${calcularTotal().toFixed(2)}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          {carrito.reduce((acc, p) => acc + p.cantidad, 0)} productos en total
        </div>
      </div>
    </div>
  );
}
