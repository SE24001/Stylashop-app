import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { getVentas, createPago, updateVenta } from "../services/axiosConfig";
import VentaCard from "./VentaCard";

export default function CajeroView() {
  const { user, token } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchVentas(true); // Mostrar loading en la primera carga
    // Probar conexión al backend
    testBackendConnection();
    
    // Configurar actualización automática cada 5 segundos
    const interval = setInterval(() => {
      fetchVentas(false); // No mostrar loading en actualizaciones automáticas
    }, 5000);
    
    setRefreshInterval(interval);
    
    // Escuchar evento de nueva venta creada
    const handleNuevaVenta = () => {
      fetchVentas(false);
    };
    
    window.addEventListener('nuevaVentaCreada', handleNuevaVenta);
    
    // Limpiar interval y event listener al desmontar el componente
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener('nuevaVentaCreada', handleNuevaVenta);
    };
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/pagos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Conexión al backend - Status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Backend responde correctamente. Pagos existentes:", data.length);
      }
    } catch (error) {
      console.error("Error de conexión al backend:", error);
    }
  };

  const fetchVentas = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getVentas(token);
      setVentas(data.filter((v) => v.estado === "CREADA"));
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      // Solo mostrar error si es la primera carga
      if (showLoading) {
        Swal.fire("Error", "No se pudieron cargar las ventas", "error");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const cobrarVenta = async (venta) => {
    // Mostrar modal de método de pago mejorado
    const { value: metodo } = await Swal.fire({
      title: "Método de Pago",
      html: `
        <div class="text-left mb-4">
          <div class="mb-2"><strong>Venta:</strong> ${venta.correlativo}</div>
          <div class="mb-2"><strong>Cliente:</strong> ${venta.clienteDTO?.nombre || 'N/A'}</div>
          <div class="mb-4"><strong>Total:</strong> <span class="text-green-600 font-bold">$${venta.total}</span></div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Seleccione el método de pago:</label>
          <select id="metodoPago" class="w-full p-3 border border-gray-300 rounded-lg">
            <option value="">Seleccionar método</option>
            <option value="EFECTIVO">💵 Efectivo</option>
            <option value="TARJETA">💳 Tarjeta</option>
            <option value="TRANSFERENCIA">🏦 Transferencia</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const metodo = document.getElementById('metodoPago').value;
        if (!metodo) {
          Swal.showValidationMessage('Debe seleccionar un método de pago');
          return false;
        }
        return metodo;
      }
    });

    if (!metodo) return;

    let montoRecibido = venta.total;
    let cambio = 0;

    // Si es efectivo, preguntar cuánto recibió con interfaz mejorada
    if (metodo === "EFECTIVO") {
      const { value: recibido } = await Swal.fire({
        title: "Pago en Efectivo",
        html: `
          <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 mb-2">$${venta.total}</div>
              <div class="text-sm text-blue-800">Total a cobrar</div>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Monto recibido:</label>
            <input id="monto-recibido" type="number" step="0.01" min="${venta.total}" 
                   placeholder="0.00" 
                   class="w-full p-3 text-lg border border-gray-300 rounded-lg text-center">
          </div>
          <div id="cambio-info" class="mt-3 p-3 rounded-lg text-center" style="display: none;"></div>
        `,
        showCancelButton: true,
        confirmButtonText: "Procesar Pago",
        cancelButtonText: "Cancelar",
        didOpen: () => {
          const input = document.getElementById('monto-recibido');
          const cambioDiv = document.getElementById('cambio-info');
          
          input.focus();
          
          input.addEventListener('input', () => {
            const valor = parseFloat(input.value) || 0;
            if (valor >= venta.total) {
              const cambioCalculado = (valor - venta.total).toFixed(2);
              cambioDiv.style.display = 'block';
              cambioDiv.className = 'mt-3 p-3 rounded-lg text-center bg-green-50 border border-green-200';
              cambioDiv.innerHTML = `
                <div class="text-green-800 font-semibold">Cambio a entregar:</div>
                <div class="text-2xl font-bold text-green-600">$${cambioCalculado}</div>
              `;
            } else if (valor > 0) {
              cambioDiv.style.display = 'block';
              cambioDiv.className = 'mt-3 p-3 rounded-lg text-center bg-red-50 border border-red-200';
              cambioDiv.innerHTML = `<div class="text-red-600">Monto insuficiente. Faltan $${(venta.total - valor).toFixed(2)}</div>`;
            } else {
              cambioDiv.style.display = 'none';
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

      // Mostrar confirmación del pago con cambio
      if (cambio > 0) {
        const confirmar = await Swal.fire({
          title: "Confirmar Pago",
          html: `
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Total venta:</strong></div>
                <div class="text-right">$${venta.total}</div>
                <div><strong>Monto recibido:</strong></div>
                <div class="text-right">$${montoRecibido}</div>
                <div class="border-t pt-2 font-bold text-green-600"><strong>Cambio:</strong></div>
                <div class="text-right border-t pt-2 font-bold text-green-600 text-xl">$${cambio}</div>
              </div>
            </div>
          `,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Confirmar Pago",
          cancelButtonText: "Cancelar"
        });

        if (!confirmar.isConfirmed) return;
      }
    }

    setLoading(true);

    // CORRECCIÓN: Asegurar que el método de pago se envíe correctamente
    const pago = {
      fechaPago: new Date().toISOString().split("T")[0],
      ventaDTO: { id: venta.id },
      monto: venta.total,
      metodoPago: metodo // Asegurar que este campo se envíe
    };

    console.log("=== DEBUG PAGO ===");
    console.log("Venta original:", venta);
    console.log("Datos del pago a enviar:", pago);
    console.log("Token:", token ? "presente" : "ausente");
    console.log("================");

    try {
      await createPago(pago, token);
      const ventaActualizada = { 
        ...venta, 
        estado: "PAGADA",
        metodoPago: metodo // También actualizar en la venta si es necesario
      };
      await updateVenta(venta.id, ventaActualizada, token);

      // Mostrar mensaje de éxito mejorado
      let mensajeExito = `
        <div class="text-center">
          <div class="mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              ✅
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Pago Procesado</h3>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600 mb-2">Venta: ${venta.correlativo}</div>
            <div class="text-xl font-bold text-green-600">$${venta.total}</div>
            <div class="text-sm text-gray-600 mt-1">Método: ${metodo}</div>
      `;
      
      if (cambio > 0) {
        mensajeExito += `<div class="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <div class="text-green-800 font-semibold">Cambio entregado: $${cambio}</div>
        </div>`;
      }
      
      mensajeExito += `</div></div>`;

      await Swal.fire({
        title: "",
        html: mensajeExito,
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: "Continuar"
      });
      
      // Actualizar inmediatamente las ventas después del pago
      await fetchVentas(false);
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error response:", error.response);
      
      let mensajeError = "No se pudo registrar el pago";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          mensajeError = error.response.data;
        } else if (error.response.data.message) {
          mensajeError = error.response.data.message;
        } else if (error.response.data.error) {
          mensajeError = error.response.data.error;
        }
      }
      
      Swal.fire({
        title: "Error al procesar el pago",
        html: `
          <div class="text-left">
            <p><strong>Mensaje:</strong> ${mensajeError}</p>
            <p class="text-sm text-gray-600 mt-2"><strong>Status:</strong> ${error.response?.status || 'Unknown'}</p>
            <details class="mt-3">
              <summary class="cursor-pointer text-blue-600">Ver detalles técnicos</summary>
              <pre class="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">${JSON.stringify(pago, null, 2)}</pre>
            </details>
          </div>
        `,
        icon: "error",
        confirmButtonText: "Entendido"
      });
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas = ventas.filter(v =>
    v.correlativo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (v.clienteDTO?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-green-600">Caja - Cobro de Ventas</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-600">Vista Cajero</p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Actualizando automáticamente</span>
                </div>
              </div>
            </div>
            
            {/* Buscador */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por venta o cliente..."
                className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {ventasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay ventas pendientes</h3>
            <p className="text-gray-500">Las ventas creadas aparecerán aquí para ser cobradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ventasFiltradas.map((venta) => (
              <VentaCard
                key={venta.id}
                venta={venta}
                onCobrar={cobrarVenta}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
