import React, { useState } from "react";
import { IMAGES_URL } from "../utils/config";

export default function MenuCard({ producto, onAdd, onRemove, cantidad = 0 }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Construir URL de imagen con validaciones usando IMAGES_URL
  const getImageUrl = () => {
    if (!producto.imagenUrl || imageError) {
      return '/images/placeholder-product.jpg';
    }
    // Limpiar la URL de espacios o caracteres extraños
    const cleanImageUrl = producto.imagenUrl.trim().replace(/^\/+/, "");
    return `${IMAGES_URL}${cleanImageUrl}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
      {/* Imagen del producto */}
      <div className="relative h-40 sm:h-48 bg-gray-100 flex-shrink-0">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={getImageUrl()}
          alt={producto.nombre}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {cantidad > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-sm animate-pulse">
            {cantidad}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-sm sm:text-lg mb-2 line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
          {producto.descripcion}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precioUnitario}
          </span>
        </div>

        {/* Controles de cantidad - siempre en la parte inferior */}
        <div className="mt-auto">
          {cantidad > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onRemove(producto.id)}
                  className="w-8 h-8 rounded-md bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{cantidad}</span>
                <button
                  onClick={() => onAdd(producto)}
                  className="w-8 h-8 rounded-md bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="font-semibold text-gray-700">
                ${(producto.precioUnitario * cantidad).toFixed(2)}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onAdd(producto)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>Añadir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
