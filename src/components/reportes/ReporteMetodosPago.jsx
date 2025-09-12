import React, { useState } from "react";
import axios from "axios";
import ReporteWrapper from "./ReporteWrapper";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { useNavigate } from "react-router-dom";
import { urlBase } from "../utils/config";
import Swal from "sweetalert2";

const ReporteMetodosPago = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFinal, setFechaFinal] = useState(null);
  const [loading, setLoading] = useState(false);

  const verReportePdf = async () => {
    if (!fechaInicio || !fechaFinal) {
      Swal.fire("Precaución", "Por favor, seleccione el rango de fechas.", "warning");
      return;
    }
    if (fechaFinal < fechaInicio) {
      Swal.fire("Precaución", "La fecha final no puede ser anterior a la fecha inicial.", "warning");
      return;
    }

    const inicio = fechaInicio.toISOString().split("T")[0]; // yyyy-MM-dd
    const fin = fechaFinal.toISOString().split("T")[0];     // yyyy-MM-dd

    const endpoint = `${urlBase}reportes/metodos-pago?fechaInicio=${inicio}&fechaFinal=${fin}`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // se abre en una nueva pestaña
      window.open(url, "_blank");

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      Swal.fire("Error al generar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReporteWrapper mostrarBoton={false}>
      <div className="mt-0">
        <Button
          label="Regresar"
          icon="pi pi-arrow-left"
          severity="secondary"
          className="w-full md:w-auto"
          onClick={() => navigate("/reportes")}
        />
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <Card title="Reporte de Métodos de Pago" className="shadow-xl rounded-2xl">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
              <label className="font-semibold text-gray-700">Fecha Inicio</label>
              <Calendar
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.value)}
                showIcon
                dateFormat="yy-mm-dd"
                className="w-full"
                placeholder="Seleccione fecha"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700">Fecha Final</label>
              <Calendar
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.value)}
                showIcon
                dateFormat="yy-mm-dd"
                className="w-full"
                placeholder="Seleccione fecha"
              />
            </div>
          </div>

          {/* Botón generar */}
          <div className="flex flex-wrap gap-3 justify-end p-4">
            <Button
              icon="pi pi-file-pdf"
              severity="danger"
              label="Generar Reporte"
              onClick={verReportePdf}
            />
          </div>
        </Card>

        {/* Dialog cargando */}
        <Dialog visible={loading} closable={false} modal header="Espere un momento">
          <div className="flex align-items-center justify-content-center">
            <ProgressSpinner />
            <span className="ml-3 text-blue-700">Generando Reporte...</span>
          </div>
        </Dialog>
      </div>
    </ReporteWrapper>
  );
};

export default ReporteMetodosPago;