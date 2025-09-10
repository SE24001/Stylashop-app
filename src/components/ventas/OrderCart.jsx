import React from "react";

export default function OrderCart({ carrito, onRemove }) {
  const calcularTotal = () =>
    carrito.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="font-bold mb-2">Carrito</h3>
      {carrito.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <ul>
          {carrito.map((p) => (
            <li key={p.id} className="flex justify-between items-center py-1">
              <span>
                {p.nombre} x {p.cantidad}
              </span>
              <span>${p.precioUnitario * p.cantidad}</span>
              <button
                className="text-red-600 text-sm"
                onClick={() => onRemove(p.id)}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 font-semibold">Total: ${calcularTotal()}</p>
    </div>
  );
}
