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
import { fetchCategorias } from '../services/catalogosService';
import { urlBase } from '../utils/config';
import Swal from 'sweetalert2';
//import 'primeflex/primeflex.css';


export default function Categorias() {
    let emptyCategoria = {
        id: null,
        nombre: '',
    };

    //recuperamos el token del localStorage para hacer las peticiones a la API
    const token = localStorage.getItem('token');

    const [categorias, setCategorias] = useState(null);
    const [dialog, setDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [categoria, setCategoria] = useState(emptyCategoria);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const loadCategorias = async ()=>{
            console.log("Token en frontend:", token);
            const data = await fetchCategorias(token);
            setCategorias(data);
        };
        if(token){
            loadCategorias();
        }
    }, [token]);

   

    const openNew = () => {
        setCategoria(emptyCategoria);
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

    const saveOrUpdate = async() => {
        setSubmitted(true);

        if (categoria.nombre.trim()) {
            let _categorias = [...categorias];
            let _categoria = { ...categoria };

            if (_categoria.id != null) {
               // actualizar una categoria
            try {
                const response = await axios.put(`${urlBase}categorias/${_categoria.id}`, _categoria, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    const { message, categoria: updatedCategoria } = response.data;

                    const index = _categorias.findIndex((c) => c.id === updatedCategoria.id);
                    _categorias[index] = updatedCategoria;

                    setCategorias(_categorias);
                    setDialog(false);
                    setCategoria(emptyCategoria);

                    toast.current.show({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: message,
                        life: 3000,
                    });
                }

            } catch (err) {
                if (err.response) {
                    const { message, error } = err.response.data;
                    if (err.response.status === 404) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'No encontrado',
                            detail: message,
                            life: 3000,
                        });
                    } else if (err.response.status === 409) {
                        toast.current.show({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: message,
                            life: 3000,
                        });
                    } else if (err.response.status === 500) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: error,
                            life: 3000,
                        });
                    } else {
                        console.error("Error inesperado:", err);
                    }
                }
            }     
            } else {
                    //nueva categoria
                    try{
                        const response = await axios.post(`${urlBase}categorias`, _categoria, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if(response.status === 201){
                        const {message, categoria} = response.data;
                        _categorias.unshift(categoria);
                        setCategorias(_categorias);
                        setDialog(false);
                        setCategoria(emptyCategoria);
                        toast.current.show({ severity: 'success', summary: 'Registrado', detail: message, life: 3000 });
                    }
                    
                    }catch(err){
                        const {message} = err.response.data;
                        if(err.response.status === 409){
                            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: message, life: 3000 });
                        }else if(err.response.status === 500){
                            const {error} = err.response.data;
                            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
                            console.error("Error", error);
                        }else{
                            console.error(err);
                        }
                        
                    }
                   
                }
            }
        };

    const editCategoria = (categ) => {
        setCategoria({ ...categ });
        setDialog(true);
    };

    const confirmDeleteCategoria = (categ) => {
        setCategoria(categ);
        setDeleteDialog(true);
    };

    const deleteCategoria= async () => {
        let _categorias = categorias.filter((val) => val.id !== categoria.id);
        try{
            const response = await axios.delete(`${urlBase}categorias/${categoria.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(response.status === 200){
                const {message} = response.data;
                setCategorias(_categorias);
                setDeleteDialog(false);
                setCategoria(emptyCategoria);
                toast.current.show({ severity: 'success', summary: 'Eliminado', detail: message, life: 3000 });
            }
        }catch(err){
            if(err.response.status === 400){
                const {message} = err.response.data;
                setDeleteDialog(false);
                setCategoria(emptyCategoria);
                toast.current.show({ severity: 'error', summary: 'No encontrado', detail: message, life: 3000 });
            }else if(err.response.status === 409 || err.response.status === 500){
                const {message, error} = err.response.data;
                setDeleteDialog(false);
                setCategoria(emptyCategoria);
                toast.current.show({ severity: 'error', summary: 'Advertencia', detail: message, life: 3000 });
            }else{
                console.error("Error",err);
            }
        }
       
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _categoria = { ...categoria };

        _categoria[`${name}`] = val;
+
        setCategoria(_categoria);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar a CSV" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const imageBodyTemplate = (rowData) => {
        return <img src={`https://primefaces.org/cdn/primereact/images/product/${rowData.image}`} alt={rowData.image} className="shadow-2 border-round" style={{ width: '64px' }} />;
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editCategoria(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteCategoria(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-between">
            <h4 className="m-0">Catálogo de Categorías</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

    const categoriaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times"  outlined onClick={hideDialog} className="mr-2" />
            <Button label={categoria.id===null ? 'Guardar' : 'Actualizar'} icon="pi pi-check" onClick={saveOrUpdate} />
        </React.Fragment>
    );

    const deleteCategoriaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDialog} />
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteCategoria} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={categorias}
                        dataKey="id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando del {first} to {last} of {totalRecords} categorias" globalFilter={globalFilter} header={header}>
                    <Column field="nombre" header="Categoria" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={dialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
            header={categoria.id===null ?'Registro de Categoria' : 'Actualizacion'} modal className="p-fluid" footer={categoriaDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombre" className="font-bold">
                        Nombre
                    </label>
                    <InputText id="nombre" value={categoria.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !categoria.nombre })} />
                    {submitted && !categoria.nombre && <small className="p-error">Nombre es requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmacion" modal footer={deleteCategoriaDialogFooter} onHide={hideDeleteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {categoria && (
                        <span>
                            Seguro/a de eliminar la categoria <b>{categoria.nombre}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}