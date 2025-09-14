import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { urlBase } from '../utils/config';
import { fetchMarcas } from '../services/catalogosService';

export default function Marcas() {
    const navigate = useNavigate();
    let emptyMarca = {
        id: null,
        nombre: '',
    };

    // Recuperamos el token del localStorage para hacer las peticiones a la API
    const token = localStorage.getItem('token');

    const [marcas, setMarcas] = useState(null);
    const [dialog, setDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [marca, setMarca] = useState(emptyMarca);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    /* // Función para obtener las marcas desde la API
    const fetchMarcas = async (token) => {
        try {
            const response = await axios.get(`${urlBase}/marcas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching marcas:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar las marcas',
                life: 3000,
            });
            return [];
        }
    }; */

    useEffect(() => {
        const loadMarcas = async () => {
            const data = await fetchMarcas(token);
            setMarcas(data);
        };
        if (token) {
            loadMarcas();
        }
    }, [token]);

    const openNew = () => {
        setMarca(emptyMarca);
        setSubmitted(false);
        setDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDialog(false);
    };

    const hideDeleteDialog = () => {
        setDeleteDialog(false);
    };

    const saveOrUpdate = async () => {
        setSubmitted(true);

        if (marca.nombre.trim()) {
            // Validar que no exista una marca con el mismo nombre (ignorando mayúsculas y espacios)
            const nombreNormalizado = marca.nombre.trim().toLowerCase();
            const existe = marcas && marcas.some(m => m.nombre.trim().toLowerCase() === nombreNormalizado && m.id !== marca.id);
            if (existe) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Duplicado',
                    detail: 'Ya existe una marca con ese nombre.',
                    life: 3000,
                });
                return;
            }

            let _marcas = [...marcas];
            let _marca = { ...marca };

            if (_marca.id != null) {
                // Actualizar una marca
                try {
                    const response = await axios.put(`${urlBase}marcas/${_marca.id}`, _marca, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        const updatedMarca = response.data;

                        const index = _marcas.findIndex((m) => m.id === updatedMarca.id);
                        _marcas[index] = updatedMarca;

                        setMarcas(_marcas);
                        setDialog(false);
                        setMarca(emptyMarca);

                        toast.current.show({
                            severity: 'success',
                            summary: 'Actualizado',
                            detail: 'Marca actualizada correctamente',
                            life: 3000,
                        });
                    }
                } catch (err) {
                    if (err.response) {
                        const { message } = err.response.data;
                        if (err.response.status === 404) {
                            toast.current.show({
                                severity: 'error',
                                summary: 'No encontrado',
                                detail: message,
                                life: 3000,
                            });
                        } else if (err.response.status === 500) {
                            toast.current.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: message,
                                life: 3000,
                            });
                        } else {
                            console.error("Error inesperado:", err);
                            toast.current.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al actualizar la marca',
                                life: 3000,
                            });
                        }
                    }
                }
            } else {
                // Nueva marca
                try {
                    const response = await axios.post(`${urlBase}marcas`, _marca, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.status === 201) {
                        const nuevaMarca = response.data;
                        _marcas.unshift(nuevaMarca);
                        setMarcas(_marcas);
                        setDialog(false);
                        setMarca(emptyMarca);
                        toast.current.show({
                            severity: 'success',
                            summary: 'Registrado',
                            detail: 'Marca creada correctamente',
                            life: 3000,
                        });
                    }
                } catch (err) {
                    if (err.response) {
                        const { message } = err.response.data;
                        if (err.response.status === 500) {
                            toast.current.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: message,
                                life: 3000,
                            });
                        } else {
                            toast.current.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al crear la marca',
                                life: 3000,
                            });
                        }
                    }
                    console.error(err);
                }
            }
        }
    };

    const editMarca = (marc) => {
        setMarca({ ...marc });
        setDialog(true);
    };

    const confirmDeleteMarca = (marc) => {
        setMarca(marc);
        setDeleteDialog(true);
    };

    const deleteMarca = async () => {
        let _marcas = marcas.filter((val) => val.id !== marca.id);
        try {
            const response = await axios.delete(`${urlBase}marcas/${marca.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setMarcas(_marcas);
                setDeleteDialog(false);
                setMarca(emptyMarca);
                toast.current.show({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Marca eliminada correctamente',
                    life: 3000,
                });
            }
        } catch (err) {
            if (err.response) {
                const { message } = err.response.data;
                if (err.response.status === 404) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'No encontrado',
                        detail: message,
                        life: 3000,
                    });
                } else if (err.response.status === 500) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: message,
                        life: 3000,
                    });
                } else {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al eliminar la marca',
                        life: 3000,
                    });
                }
            }
            setDeleteDialog(false);
            setMarca(emptyMarca);
            console.error("Error", err);
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _marca = { ...marca };

        _marca[`${name}`] = val;

        setMarca(_marca);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar a CSV" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editMarca(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteMarca(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-between">
            <h4 className="m-0">Catálogo de Marcas</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

        const marcaDialogFooter = (
                <React.Fragment>
                        <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} className="mr-2" />
                        <Button label={marca.id === null ? 'Guardar' : 'Actualizar'} icon="pi pi-check" onClick={saveOrUpdate} />
                </React.Fragment>
        );

        const deleteMarcaDialogFooter = (
                <React.Fragment>
                        <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDialog} />
                        <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteMarca} />
                </React.Fragment>
        );

            return (
                <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4 md:px-8 lg:px-4">
                    <button
                        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow"
                        onClick={() => navigate(-1)}
                    >
                        <span className="pi pi-arrow-left" />
                        <span>Regresar</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 font-serif">Marcas</h1>
                    <div className="bg-white rounded-xl shadow p-4 sm:p-8 flex flex-col items-center mb-8 w-full">
                        <span className="text-5xl mb-4">🏷️</span>
                        <span className="font-bold text-lg text-gray-700 mb-2">Marcas</span>
                        <span className="text-gray-500 text-center mb-4">Administra las marcas disponibles en tu tienda.</span>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow transition-colors mb-4" onClick={openNew}>Nueva Marca</button>
                    </div>
                    <div className="bg-white rounded-xl shadow p-2 sm:p-6 w-full overflow-x-auto">
                        <DataTable
                            ref={dt}
                            value={marcas}
                            dataKey="id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} marcas"
                            globalFilter={globalFilter}
                            header={header}
                        >
                            <Column field="nombre" header="Marca" sortable style={{ minWidth: '16rem' }}></Column>
                            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                        </DataTable>
                    </div>
                    {/* Crear / Editar Modal */}
                    <Dialog
                        visible={dialog}
                        style={{ width: '28rem' }}
                        header={marca.id ? 'Actualizar Marca' : 'Nueva Marca'}
                        modal
                        className="p-fluid"
                        footer={marcaDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 w-full">
                            <div className="flex flex-col sm:flex-row items-center mb-6 gap-2 sm:gap-6">
                                <span className="text-3xl mr-2">🏷️</span>
                                <span className="font-bold text-lg text-gray-700">{marca.id ? 'Editar Marca' : 'Nueva Marca'}</span>
                            </div>
                            <div className="space-y-4">
                                <div className="field w-full">
                                    <label htmlFor="nombre" className="font-bold">Nombre</label>
                                    <InputText
                                        id="nombre"
                                        value={marca.nombre}
                                        onChange={(e) => onInputChange(e, 'nombre')}
                                        required
                                        autoFocus
                                        className={classNames({ 'p-invalid': submitted && !marca.nombre }) + ' rounded-lg border-gray-300 w-full'}
                                    />
                                    {submitted && !marca.nombre?.trim() && <small className="p-error">El nombre es requerido.</small>}
                                </div>
                            </div>
                        </div>
                    </Dialog>
                    {/* Eliminar Modal */}
                    <Dialog
                        visible={deleteDialog}
                        style={{ width: '24rem' }}
                        header="Confirmación"
                        modal
                        footer={deleteMarcaDialogFooter}
                        onHide={hideDeleteDialog}
                    >
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 flex flex-col items-center w-full">
                            <span className="text-4xl mb-2 text-yellow-500">⚠️</span>
                            <span className="font-bold text-lg text-gray-700 mb-2 text-center">¿Seguro de eliminar la marca <b>{marca.nombre}</b>?</span>
                        </div>
                    </Dialog>
                </div>
            );
}