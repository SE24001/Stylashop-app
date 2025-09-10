import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { urlBase } from "../utils/config";
import { useAuth } from "../context/AuthContext";
import { getVentas, createPago, updateVenta } from "../services/axiosConfig";

export default function CajeroView() {
  const { token } = useAuth();
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const data = await getVentas(token);
      setVentas(data.filter((v) => v.estado === "CREADA"));
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      Swal.fire("Error", "No se pudieron cargar las ventas", "error");
    }
  };

  const cobrarVenta = async (venta) => {
    const { value: metodo } = await Swal.fire({
      title: "Método de Pago",
      input: "select",
      inputOptions: {
        EFECTIVO: "Efectivo",
        TARJETA: "Tarjeta",
        TRANSFERENCIA: "Transferencia",
      },
      inputPlaceholder: "Selecciona un método",
      showCancelButton: true,
      confirmButtonText: "Procesar Pago",
      cancelButtonText: "Cancelar"
    });

    if (!metodo) return;

    const pago = {
      fechaPago: new Date().toISOString().split("T")[0],
      ventaDTO: { id: venta.id },
      monto: venta.total,
      metodoPago: metodo,
    };

    try {
      // Crear el pago
      await createPago(pago, token);

      // Actualizar estado de la venta
      const ventaActualizada = { ...venta, estado: "PAGADA" };
      await updateVenta(venta.id, ventaActualizada, token);

      Swal.fire("Éxito", "Venta cobrada correctamente", "success");
      fetchVentas(); // Refrescar la lista
    } catch (error) {
      console.error("Error al procesar pago:", error);
      const mensaje = error.response?.data?.message || "No se pudo registrar el pago";
      Swal.fire("Error", mensaje, "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">Cajero</h2>
      {ventas.length === 0 ? (
        <p>No hay ventas pendientes</p>
      ) : (
        <ul className="space-y-2">
          {ventas.map((v) => (
            <li
              key={v.id}
              className="flex justify-between items-center border rounded p-2 shadow"
            >
              <span>
                Venta #{v.correlativo} - Cliente: {v.clienteDTO?.nombre} - $
                {v.total}
              </span>
              <button
                onClick={() => cobrarVenta(v)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Cobrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
