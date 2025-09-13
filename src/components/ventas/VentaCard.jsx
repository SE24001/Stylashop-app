import React from "react";

export default function VentaCard({ venta, onCobrar, loading }) {
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatHora = (hora) => {
    if (!hora) return 'N/A';
    // Si la hora viene en formato HH:mm:ss, tomar solo HH:mm
    return hora.substring(0, 5);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header de la tarjeta */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold">Venta #{venta.correlativo}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                {venta.estado}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${parseFloat(venta.total).toFixed(2)}</div>
            <div className="text-sm opacity-90">Total</div>
          </div>
        </div>
      </div>

      {/* Información del cliente y fecha */}
      <div className="p-6 border-b border-gray-100 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-lg">
                {venta.clienteDTO?.nombre || 'Cliente no especificado'}
              </div>
              <div className="text-sm text-gray-500">Cliente</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-lg">
                {venta.usuarioDTO?.username || venta.usuarioDTO?.nombre || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Vendedor</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{formatFecha(venta.fecha)}</div>
            <div className="text-sm text-gray-500">Fecha</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{formatHora(venta.hora)}</div>
            <div className="text-sm text-gray-500">Hora</div>
          </div>
        </div>
      </div>

      {/* Detalles de productos */}
      {venta.detallesVenta && venta.detallesVenta.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Productos</h4>
            <span className="text-sm text-gray-500">
              {venta.detallesVenta.length} ítem{venta.detallesVenta.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="space-y-3">
              {venta.detallesVenta.map((detalle, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {detalle.productoDTO?.nombre || 'Producto'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {detalle.cantidad} x ${parseFloat(detalle.precio).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      ${parseFloat(detalle.subtotal || (detalle.precio * detalle.cantidad)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Total y botón de acción */}
      <div className="p-6 bg-gray-50 mt-auto">
        <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-sm">
          <span className="text-lg font-semibold text-gray-800">Total a cobrar:</span>
          <span className="text-2xl font-bold text-green-600">${parseFloat(venta.total).toFixed(2)}</span>
        </div>

        <button
          onClick={() => onCobrar(venta)}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
              </svg>
              <span>Cobrar ${parseFloat(venta.total).toFixed(2)}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
