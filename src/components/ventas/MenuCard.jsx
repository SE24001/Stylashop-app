import React from "react";

export default function MenuCard({ producto, onAdd }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      <h3 className="font-bold">{producto.nombre}</h3>
      <p>{producto.descripcion}</p>
      <p className="text-blue-600 font-semibold">${producto.precioUnitario}</p>
      <button
        onClick={() => onAdd(producto)}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
      >
        Agregar
      </button>
    </div>
  );
}
