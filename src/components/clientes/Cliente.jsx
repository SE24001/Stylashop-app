import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import Swal from 'sweetalert2';
import { urlBase } from '../utils/config';

export default function Clientes() {
  const token = localStorage.getItem('token');

  const emptyCliente = {
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    tipoCliente: ''
  };

  const tipoClienteOptions = [
    { label: 'Normal', value: 'Normal' },
    { label: 'Regular', value: 'Regular' },
    { label: 'Premium', value: 'Premium' },
    { label: 'VIP', value: 'VIP' }
  ];

  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(emptyCliente);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  // Obtener clientes
  const fetchClientes = async () => {
    try {
      const { data } = await axios.get(`${urlBase}clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(data);
    } catch (err) {
      Swal.fire('Error', 'No se pudo obtener el listado de clientes', 'error');
    }
  };

  const openNew = () => {
    setCliente(emptyCliente);
    setSubmitted(false);
    setDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setDialog(false);
  };

  const hideDeleteDialog = () => setDeleteDialog(false);

  // Guardar o actualizar
  const saveOrUpdate = async () => {
    setSubmitted(true);

    if (cliente.nombre.trim() && cliente.tipoCliente.trim()) {
      let _clientes = [...clientes];

      if (cliente.id == null) {
        // Crear
        try {
          const { data, status } = await axios.post(`${urlBase}clientes`, cliente, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (status === 201 || status === 200) {
            const { message, cliente: nuevo } = data;
            _clientes.unshift(nuevo ?? data); // por si tu API devuelve directamente el objeto
            setClientes(_clientes);
            toast.current.show({ severity: 'success', summary: 'Registrado', detail: message ?? 'Cliente creado', life: 3000 });
          }
        } catch (err) {
          Swal.fire('Error', 'No se pudo registrar el cliente', 'error');
          return;
        }
      } else {
        // Actualizar
        try {
          const { data, status } = await axios.put(`${urlBase}clientes/${cliente.id}`, cliente, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (status === 200) {
            const actualizado = data.cliente ?? data;
            _clientes = _clientes.map(c => (c.id === actualizado.id ? actualizado : c));
            setClientes(_clientes);
            toast.current.show({ severity: 'success', summary: 'Actualizado', detail: data.message ?? 'Cliente actualizado', life: 3000 });
          }
        } catch (err) {
          Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
          return;
        }
      }

      setDialog(false);
      setCliente(emptyCliente);
    }
  };

  const editCliente = (c) => {
    setCliente({ ...c });
    setDialog(true);
  };

  const confirmDeleteCliente = (c) => {
    setCliente(c);
    setDeleteDialog(true);
  };

  const deleteCliente = async () => {
    let _clientes = clientes.filter((val) => val.id !== cliente.id);
    try {
      const { data, status } = await axios.delete(`${urlBase}clientes/${cliente.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (status === 200) {
        setClientes(_clientes);
        toast.current.show({ severity: 'success', summary: 'Eliminado', detail: data.message ?? 'Cliente eliminado', life: 3000 });
      }
    } catch (err) {
      Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
    }
    setDeleteDialog(false);
    setCliente(emptyCliente);
  };

  const exportCSV = () => dt.current.exportCSV();

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setCliente({ ...cliente, [name]: val });
  };

  // Templates UI
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button label="Nuevo Cliente" icon="pi pi-plus" severity="success" onClick={openNew} />
    </div>
  );

  const rightToolbarTemplate = () => (
    <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editCliente(rowData)} />
      <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteCliente(rowData)} />
    </>
  );

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-between">
      <h4 className="m-0">Gestión de Clientes</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const clienteDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} style={{ marginRight: '0.5rem' }} />
      <Button label={cliente.id === null ? 'Guardar' : 'Actualizar'} icon="pi pi-check" onClick={saveOrUpdate} />
    </>
  );

  const deleteClienteDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDialog} style={{ marginRight: '0.5rem' }} />
      <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteCliente} />
    </>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4 md:px-8 lg:px-4">
      <Toast ref={toast} />
      <h1 className="text-3xl font-bold text-gray-800 mb-8 font-serif">Clientes</h1>
  <div className="bg-white rounded-xl shadow p-4 sm:p-8 flex flex-col items-center mb-8 w-full">
        <span className="text-5xl mb-4">🧑‍🤝‍🧑</span>
        <span className="font-bold text-lg text-gray-700 mb-2">Clientes</span>
        <span className="text-gray-500 text-center mb-4">Administra los clientes registrados en tu tienda.</span>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow transition-colors mb-4" onClick={openNew}>Nuevo Cliente</button>
      </div>
  <div className="bg-white rounded-xl shadow p-2 sm:p-6 w-full overflow-x-auto">
        <DataTable
          ref={dt}
          value={clientes}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
          globalFilter={globalFilter}
          header={header}
        >
          <Column field="nombre" header="Nombre" sortable style={{ minWidth: '12rem' }} />
          <Column field="email" header="Email" style={{ minWidth: '14rem' }} />
          <Column field="telefono" header="Teléfono" style={{ minWidth: '10rem' }} />
          <Column field="tipoCliente" header="Tipo Cliente" style={{ minWidth: '10rem' }} />
          <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '10rem' }} />
        </DataTable>
      </div>
      {/* Crear/Editar Modal */}
      <Dialog
        visible={dialog}
        style={{ width: '30rem' }}
        header={cliente.id ? 'Actualizar Cliente' : 'Nuevo Cliente'}
        modal
        className="p-fluid"
        footer={clienteDialogFooter}
        onHide={hideDialog}
      >
        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 w-full">
          <div className="flex flex-col sm:flex-row items-center mb-6 gap-2 sm:gap-6">
            <span className="text-3xl mr-2">🧑‍🤝‍🧑</span>
            <span className="font-bold text-lg text-gray-700">{cliente.id ? 'Editar Cliente' : 'Nuevo Cliente'}</span>
          </div>
          <div className="space-y-4">
            <div className="field w-full">
              <label htmlFor="nombre" className="font-bold">Nombre</label>
              <InputText
                id="nombre"
                value={cliente.nombre}
                onChange={(e) => onInputChange(e, 'nombre')}
                required
                autoFocus
                className={classNames({ 'p-invalid': submitted && !cliente.nombre }) + ' rounded-lg border-gray-300 w-full'}
              />
              {submitted && !cliente.nombre.trim() && <small className="p-error">El nombre es requerido.</small>}
            </div>
            <div className="field w-full">
              <label htmlFor="email" className="font-bold">Email</label>
              <InputText
                id="email"
                value={cliente.email}
                onChange={(e) => onInputChange(e, 'email')}
                className="rounded-lg border-gray-300 w-full"
              />
            </div>
            <div className="field w-full">
              <label htmlFor="telefono" className="font-bold">Teléfono</label>
              <InputText
                id="telefono"
                value={cliente.telefono}
                onChange={(e) => onInputChange(e, 'telefono')}
                className="rounded-lg border-gray-300 w-full"
              />
            </div>
            <div className="field w-full">
              <label className="font-bold">Tipo Cliente</label>
              <Dropdown
                value={cliente.tipoCliente}
                onChange={(e) => setCliente({ ...cliente, tipoCliente: e.value })}
                options={tipoClienteOptions}
                placeholder="Seleccione un tipo"
                className={classNames('w-full md:w-14rem rounded-lg border-gray-300', { 'p-invalid': submitted && !cliente.tipoCliente })}
              />
              {submitted && !cliente.tipoCliente && <small className="p-error">El tipo de cliente es requerido.</small>}
            </div>
          </div>
        </div>
      </Dialog>
      {/* Eliminar Modal */}
      <Dialog
        visible={deleteDialog}
        style={{ width: '28rem' }}
        header="Confirmación"
        modal
        footer={deleteClienteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 flex flex-col items-center w-full">
          <span className="text-4xl mb-2 text-yellow-500">⚠️</span>
          <span className="font-bold text-lg text-gray-700 mb-2 text-center">¿Seguro de eliminar al cliente <b>{cliente.nombre}</b>?</span>
        </div>
      </Dialog>
    </div>
  );
}