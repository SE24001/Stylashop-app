import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import Swal from "sweetalert2";
import { urlBase } from "../utils/config";
import { useAuth } from "../context/AuthContext";
import { getClientes } from "../services/axiosConfig";

export default function ConfirmOrderModal({ visible, onHide, carrito, onConfirm }) {
  const { token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchClientes();
    }
  }, [visible]);

  const fetchClientes = async () => {
    try {
      const data = await getClientes(token);
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      Swal.fire("Error", "No se pudieron cargar los clientes", "error");
    }
  };

  const confirmar = () => {
    if (!clienteSeleccionado) {
      Swal.fire("Atención", "Debe seleccionar un cliente", "warning");
      return;
    }
    onConfirm(clienteSeleccionado);
    onHide();
  };

  return (
    <Dialog
      header="Confirmar Venta"
      visible={visible}
      style={{ width: "30rem" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={onHide}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={confirmar}
          >
            Confirmar
          </button>
        </div>
      }
    >
      <p className="mb-3">Seleccione el cliente para esta venta:</p>
      <Dropdown
        value={clienteSeleccionado}
        onChange={(e) => setClienteSeleccionado(e.value)}
        options={clientes.map((c) => ({ label: c.nombre, value: c.id }))}
        placeholder="Seleccione un cliente"
        className="w-full"
      />
    </Dialog>
  );
}
