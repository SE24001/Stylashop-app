import React, { useState } from "react";

const ReporteWrapper = ({ children, onGenerar, mostrarBoton = true }) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerar = async () => {
    setLoading(true);
    try {
      const url = await onGenerar(); // Retorna un blob o una URL
      setPdfUrl(url);
    } catch (e) {
      console.error("Error generando reporte", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded space-y-4">
      <div>{children}</div>
      {mostrarBoton && (
        <button
          onClick={handleGenerar}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Generando..." : "Generar Reporte"}
        </button>
      )}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          title="Vista previa PDF"
          className="w-full h-[600px] border mt-4"
        />
      )}
    </div>
  );
};
export default ReporteWrapper;