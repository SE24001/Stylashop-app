import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { getClientes, createVenta, getProductos } from "../services/axiosConfig";
import MenuCard from "./MenuCard";
import OrderCart from "./OrderCart";
import ClienteModal from "./ClienteModal";

export default function VendedorView() {
  const { user, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);

  useEffect(() => {
    fetchProductos();
    fetchClientes();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getProductos(token);
      console.log("Productos cargados:", data);
      
      // Debug: Mostrar información sobre las imágenes
      data.forEach((producto, index) => {
        if (index < 3) { // Solo los primeros 3 para no saturar la consola
          console.log(`Producto ${producto.nombre}:`, {
            id: producto.id,
            imagenUrl: producto.imagenUrl,
            imagenUrlType: typeof producto.imagenUrl,
            imagenUrlLength: producto.imagenUrl ? producto.imagenUrl.length : 0
          });
        }
      });
      
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
    const producto = carrito.find(p => p.id === id);
    if (producto.cantidad > 1) {
      setCarrito(
        carrito.map((p) =>
          p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p
        )
      );
    } else {
      setCarrito(carrito.filter((p) => p.id !== id));
    }
  };

  const clearCart = () => {
    setCarrito([]);
  };

  const calcularTotal = () =>
    carrito.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0);

  const crearVenta = async () => {
    if (!clienteSeleccionado || carrito.length === 0) {
      Swal.fire("Atención", "Debe seleccionar un cliente y al menos un producto", "warning");
      return;
    }

    setLoading(true);

    const detalles = carrito.map((p) => ({
      productoDTO: { id: p.id },
      cantidad: p.cantidad,
      precio: p.precioUnitario,
      subtotal: p.precioUnitario * p.cantidad,
    }));

    const venta = {
      correlativo: `VENTA-${Date.now()}`,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
      estado: "CREADA",
      total: calcularTotal(),
      clienteDTO: { id: parseInt(clienteSeleccionado) },
      usuarioDTO: { id: user.userId },
      detallesVenta: detalles,
    };

    try {
      await createVenta(venta, token);
      
      // Animación de éxito
      await Swal.fire({
        title: "¡Venta Registrada!",
        text: `Venta por $${calcularTotal().toFixed(2)} creada exitosamente`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      // Limpiar formulario
      setCarrito([]);
      setClienteSeleccionado("");
      
      // Emitir evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('nuevaVentaCreada', {
        detail: { venta, timestamp: Date.now() }
      }));
      
    } catch (error) {
      console.error("Error al crear venta:", error);
      const mensaje = error.response?.data?.message || "No se pudo registrar la venta";
      Swal.fire("Error", mensaje, "error");
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getProductoCantidad = (productId) => {
    const item = carrito.find(p => p.id === productId);
    return item ? item.cantidad : 0;
  };

  const handleClienteCreado = (nuevoCliente) => {
    setClientes([...clientes, nuevoCliente]);
    setClienteSeleccionado(nuevoCliente.id.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Gestión de Ventas</h1>
              <p className="text-gray-600 mt-1">Vista Vendedor</p>
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
                placeholder="Buscar productos..."
                className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sección de productos - Área principal */}
          <div className="flex-1 lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Catálogo</h2>
              <p className="text-gray-600 mb-6">Toca para agregar a la venta</p>
              
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {productosFiltrados.map((producto) => (
                    <MenuCard
                      key={producto.id}
                      producto={producto}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                      cantidad={getProductoCantidad(producto.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral - Carrito y cliente */}
          <div className="w-full lg:w-1/3">
            <div className="space-y-6 lg:sticky lg:top-6">
              {/* Carrito */}
              <OrderCart
                carrito={carrito}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onClear={clearCart}
              />

              {/* Panel de Cliente y Confirmación */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Cliente</h3>
                    <button
                      onClick={() => setShowClienteModal(true)}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      + Nuevo
                    </button>
                  </div>
                  
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-4 relative z-10"
                    value={clienteSeleccionado}
                    onChange={(e) => setClienteSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido || ''}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={crearVenta}
                    disabled={loading || carrito.length === 0 || !clienteSeleccionado}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      loading || carrito.length === 0 || !clienteSeleccionado
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      'Confirmar venta'
                    )}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cliente */}
      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onClienteCreado={handleClienteCreado}
      />
    </div>
  );
}
