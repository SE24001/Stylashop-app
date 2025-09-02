import React, { useState, useEffect, useRef } from 'react';
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

export default function Marcas() {
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

    // Función para obtener las marcas desde la API
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
    };

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
            let _marcas = [...marcas];
            let _marca = { ...marca };

            if (_marca.id != null) {
                // Actualizar una marca
                try {
                    const response = await axios.put(`${urlBase}/marcas/${_marca.id}`, _marca, {
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
                    const response = await axios.post(`${urlBase}/marcas`, _marca, {
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
            const response = await axios.delete(`${urlBase}/marcas/${marca.id}`, {
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
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

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

            <Dialog
                visible={dialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={marca.id === null ? 'Registro de Marca' : 'Actualización'}
                modal
                className="p-fluid"
                footer={marcaDialogFooter}
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="nombre" className="font-bold">
                        Nombre
                    </label>
                    <InputText
                        id="nombre"
                        value={marca.nombre}
                        onChange={(e) => onInputChange(e, 'nombre')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !marca.nombre })}
                    />
                    {submitted && !marca.nombre && <small className="p-error">Nombre es requerido.</small>}
                </div>
            </Dialog>

            <Dialog
                visible={deleteDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmación"
                modal
                footer={deleteMarcaDialogFooter}
                onHide={hideDeleteDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {marca && (
                        <span>
                            ¿Está seguro de eliminar la marca <b>{marca.nombre}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}