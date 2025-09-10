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
    // Primero preguntar el método de pago
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
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar"
    });

    if (!metodo) return;

    let montoRecibido = venta.total;
    let cambio = 0;

    // Si es efectivo, preguntar cuánto recibió
    if (metodo === "EFECTIVO") {
      const { value: recibido } = await Swal.fire({
        title: "Cobrar Venta",
        html: `
          <div style="margin-bottom: 10px;">
            <strong>Total a pagar: $${venta.total}</strong>
          </div>
          <input id="monto-recibido" type="number" step="0.01" min="${venta.total}" 
                 placeholder="Ingrese el monto recibido" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <div id="cambio-info" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
        `,
        showCancelButton: true,
        confirmButtonText: "Procesar Pago",
        cancelButtonText: "Cancelar",
        didOpen: () => {
          const input = document.getElementById('monto-recibido');
          const cambioDiv = document.getElementById('cambio-info');
          
          input.addEventListener('input', () => {
            const valor = parseFloat(input.value) || 0;
            if (valor >= venta.total) {
              const cambioCalculado = (valor - venta.total).toFixed(2);
              cambioDiv.innerHTML = `<strong>Cambio: $${cambioCalculado}</strong>`;
              cambioDiv.style.color = '#28a745';
            } else {
              cambioDiv.innerHTML = 'El monto debe ser mayor o igual al total';
              cambioDiv.style.color = '#dc3545';
            }
          });
        },
        preConfirm: () => {
          const valor = parseFloat(document.getElementById('monto-recibido').value);
          if (!valor || valor < venta.total) {
            Swal.showValidationMessage(`El monto debe ser al menos $${venta.total}`);
            return false;
          }
          return valor;
        }
      });

      if (!recibido) return;
      
      montoRecibido = parseFloat(recibido);
      cambio = (montoRecibido - venta.total).toFixed(2);

      // Mostrar confirmación del cambio si hay
      if (cambio > 0) {
        const confirmar = await Swal.fire({
          title: "Confirmar Pago",
          html: `
            <div><strong>Total venta:</strong> $${venta.total}</div>
            <div><strong>Monto recibido:</strong> $${montoRecibido}</div>
            <div style="color: #28a745; font-size: 18px; margin-top: 10px;">
              <strong>Cambio: $${cambio}</strong>
            </div>
          `,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar"
        });

        if (!confirmar.isConfirmed) return;
      }
    }

    const pago = {
      fechaPago: new Date().toISOString().split("T")[0],
      ventaDTO: { id: venta.id },
      monto: venta.total, // Solo el valor de la venta, no el recibido
      metodoPago: metodo,
    };

    try {
      await createPago(pago, token);
      const ventaActualizada = { ...venta, estado: "PAGADA" };
      await updateVenta(venta.id, ventaActualizada, token);

      // Mostrar mensaje de éxito con el cambio si aplica
      const mensaje = cambio > 0 
        ? `Venta cobrada correctamente.<br><strong style="color: #28a745;">Cambio: $${cambio}</strong>`
        : "Venta cobrada correctamente";

      Swal.fire({
        title: "Éxito",
        html: mensaje,
        icon: "success"
      });
      
      fetchVentas();
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
