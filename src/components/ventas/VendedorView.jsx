import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { urlBase } from "../utils/config";
import { useAuth } from "../context/AuthContext";
import { getClientes, createVenta, getProductos } from "../services/axiosConfig";

export default function VendedorView() {
  const { user, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    fetchProductos();
    fetchClientes();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getProductos(token);
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    }
  };

  const fetchClientes = async () => {
    try {
      const data = await getClientes(token);
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      Swal.fire("Error", "No se pudieron cargar los clientes", "error");
    }
  };

  const addToCart = (producto) => {
    const existe = carrito.find((p) => p.id === producto.id);
    if (existe) {
      setCarrito(
        carrito.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCarrito(carrito.filter((p) => p.id !== id));
  };

  const calcularTotal = () =>
    carrito.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0);

  const crearVenta = async () => {
    if (!clienteSeleccionado || carrito.length === 0) {
      Swal.fire("Atención", "Debe seleccionar un cliente y al menos un producto", "warning");
      return;
    }

    const detalles = carrito.map((p) => ({
      productoDTO: { id: p.id },
      cantidad: p.cantidad,
      precio: p.precioUnitario,
      subtotal: p.precioUnitario * p.cantidad,
    }));

    const venta = {
      correlativo: `VENTA-${Date.now()}`, // Genera un correlativo único
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
      estado: "CREADA",
      total: calcularTotal(),
      clienteDTO: { id: parseInt(clienteSeleccionado) },
      usuarioDTO: { id: user.userId },
      detallesVenta: detalles,
    };

    try {
      const data = await createVenta(venta, token);
      Swal.fire("Éxito", "Venta registrada correctamente", "success");
      setCarrito([]);
      setClienteSeleccionado("");
    } catch (error) {
      console.error("Error al crear venta:", error);
      const mensaje = error.response?.data?.message || "No se pudo registrar la venta";
      Swal.fire("Error", mensaje, "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">Vendedor</h2>

      {/* Lista de productos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {productos.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 shadow hover:shadow-md transition"
          >
            {p.imagenUrl && (
              <img 
                src={`http://localhost:8080/uploads/productos/${p.imagenUrl}`} 
                alt={p.nombre}
                className="w-full h-32 object-cover mb-2 rounded"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
            <h3 className="font-bold">{p.nombre}</h3>
            <p className="text-sm text-gray-600 mb-2">{p.descripcion}</p>
            <p className="text-blue-600 font-semibold text-lg">${p.precioUnitario}</p>
            <button
              onClick={() => addToCart(p)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Agregar
            </button>
          </div>
        ))}
      </div>

      {/* Carrito */}
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
                  onClick={() => removeFromCart(p.id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 font-semibold">Total: ${calcularTotal()}</p>
      </div>

      {/* Cliente */}
      <div>
        <label className="font-semibold">Cliente:</label>
        <select
          className="ml-2 border rounded p-1"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botón crear venta */}
      <button
        onClick={crearVenta}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Registrar Venta
      </button>
    </div>
  );
}
