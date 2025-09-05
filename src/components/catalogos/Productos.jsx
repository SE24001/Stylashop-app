import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import Swal from 'sweetalert2';
import { urlBase, IMAGES_URL } from '../utils/config';
import { FileUpload } from 'primereact/fileupload';
import { fetchCategorias, fetchMarcas } from '../services/catalogosService';

export default function Productos() {
    const token = localStorage.getItem('token');
    let emptyProducto = {
        id: null,
        nombre: '',
        descripcion: '',
        precioUnitario: 0,
        imagenUrl: '',
        marca: null,
        categoria: null
    };
    const [productos, setProductos] = useState(null);
    const [dialog, setDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [producto, setProducto] = useState(emptyProducto);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [selectedMarca, setSelectedMarca] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [preview, setPreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            if(token){
                setCategorias(await fetchCategorias(token));
                setMarcas(await fetchMarcas(token));
            }
            fetchProductos();
        };
        loadData();
    }, []);

    const fetchProductos = async () => {
        try{
            const response = await axios.get(`${urlBase}/productos`,{
                headers:{ Authorization: `Bearer ${token}` }
            });
            setProductos(response.data);
        }catch(err){
            Swal.fire('Error', 'No se pudo obtener el listado de productos', 'error');
            return [];
        }
    }

    const formatCurrency = (value) => {
        return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '';
    };

    const openNew = () => {
        setProducto(emptyProducto);
        setSelectedCategoria(null);
        setSelectedMarca(null);
        setPreview(null);
        setSelectedImage(null);
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

    const createFormData = () => {
        let formData = new FormData();
        const dto = {
            ...producto,
            categoria: selectedCategoria || producto.categoria,
            marca: selectedMarca || producto.marca
        };
        formData.append("dto", new Blob([JSON.stringify(dto)], {type:"application/json"}));
        if(selectedImage){
            formData.append("imagen", selectedImage);
        }
        return formData;
    }

    const saveOrUpdate = async () => {
        setSubmitted(true);
        if (producto.nombre.trim() && producto.descripcion.trim()) {
            let _productos = [...(productos || [])];
            const formData = createFormData();
            if (producto.id == null) {
                // Insertar producto
                try{
                    const response = await axios.post(`${urlBase}productos`, formData,{
                        headers:{
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if(response.status === 201){
                        const {message, producto: prod} = response.data;
                        _productos.unshift(prod);
                        toast.current.show({ severity: 'success', summary: 'Registrado', detail: message, life: 3000 });
                    }
                }catch(err){
                    const {message} = err.response?.data || {};
                    if(err.response?.status === 409){
                        toast.current.show({ severity: 'warn', summary: 'Duplicado!', detail: message, life: 3000 });
                        return;
                    }else{
                        toast.current.show({ severity: 'error', summary: 'Error!', detail: message || 'Error del servidor', life: 3000 });
                    }
                }
            } else {
                // Actualizar producto
                try {
                    const response = await axios.put(`${urlBase}productos/${producto.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if(response.status === 202){
                        const { message, producto: updatedProducto } = response.data;
                        const index = _productos.findIndex(p => p.id === updatedProducto.id);
                        _productos[index] = updatedProducto;
                        toast.current.show({ severity: 'success', summary: 'Actualizado', detail: message, life: 3000 });
                    }
                } catch(err) {
                    toast.current.show({ severity: 'error', summary: 'Error!', detail: 'No se pudo actualizar', life: 3000 });
                }
            }
            setProductos(_productos);
            setDialog(false);
            setProducto(emptyProducto);
            setSelectedCategoria(null);
            setSelectedMarca(null);
            setPreview(null);
            setSelectedImage(null);
        }
    };

    const editProducto = (p) => {
        setProducto({ ...p });
        setSelectedCategoria(p.categoria);
        setSelectedMarca(p.marca);
        setPreview(p.imagenUrl ? `${IMAGES_URL}${p.imagenUrl}` : null);
        setDialog(true);
    };

    const confirmDeleteProducto = (p) => {
        setProducto(p);
        setDeleteDialog(true);
    };

    const deleteProducto = async () => {
        let _productos = productos.filter((val) => val.id !== producto.id);
        try {
            const response = await axios.delete(`${urlBase}productos/${producto.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                const { message } = response.data;
                setProductos(_productos);
                setDeleteDialog(false);
                setProducto(emptyProducto);
                toast.current.show({ severity: 'success', summary: 'Eliminado!', detail: message, life: 3000 });
            }
        } catch (err) {
            const { message } = err.response?.data || {};
            toast.current.show({ severity: 'error', summary: 'Error', detail: message || 'No se pudo eliminar', life: 3000 });
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _producto = { ...producto };
        _producto[`${name}`] = val;
        setProducto(_producto);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _producto = { ...producto };
        _producto[`${name}`] = val;
        setProducto(_producto);
    };

    // Imagenes
    const onUpload = (event) =>{
        const file = event.files[0];
        if (file){
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () =>{
                setPreview(reader.result);
                setProducto({...producto, imagenUrl: reader.result});
            };
            reader.readAsDataURL(file);
        }
    }

    const removeImage = () =>{
        setPreview(null);
        setProducto({...producto, imagenUrl: null});
    }

    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button label="Nuevo Producto" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    );

    const rightToolbarTemplate = () => (
        <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
    );

    const imageBodyTemplate = (rowData) => (
        rowData.imagenUrl ? (
            <img src={`${IMAGES_URL}${rowData.imagenUrl}`} alt={rowData.nombre} style={{width:'64px', borderRadius: '4px'}} />
        ) : (
            <span>No Image</span>
        )
    );

    const priceBodyTemplate = (rowData) => formatCurrency(rowData.precioUnitario);

    const actionBodyTemplate = (rowData) => (
        <React.Fragment>
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editProducto(rowData)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProducto(rowData)} />
        </React.Fragment>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-between">
            <h4 className="m-0">Catálogo de Productos</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

    const productoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} style={{ marginRight: '0.5rem' }} />
            <Button label={producto.id === null ? 'Guardar' : 'Actualizar'} icon="pi pi-check" onClick={saveOrUpdate} />
        </React.Fragment>
    );

    const deleteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDialog} style={{ marginRight: '0.5rem' }} />
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteProducto} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={productos} 
                    dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} productos" globalFilter={globalFilter} header={header}>
                    <Column field="nombre" header="Producto" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="descripcion" header="Descripción" style={{ minWidth: '16rem' }}></Column>
                    <Column field="imagenUrl" header="Imagen" body={imageBodyTemplate}></Column>
                    <Column field="precioUnitario" header="Precio" body={priceBodyTemplate} sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="marca.nombre" header="Marca" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="categoria.nombre" header="Categoría" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>
            <Dialog visible={dialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header={producto.id==null ? 'Registro de Producto':'Actualización de Producto'} modal className="p-fluid" footer={productoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombre" className="font-bold">Nombre del producto</label>
                    <InputText id="nombre" value={producto.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !producto.nombre })} />
                    {submitted && !producto.nombre.trim() && <small className="p-error">Nombre es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="descripcion" className="font-bold">Descripción</label>
                    <InputTextarea id="descripcion" value={producto.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required rows={2} cols={20} />
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="categoria" className="font-bold">Categoría</label>
                        <Dropdown value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.value)} options={categorias} optionLabel="nombre" placeholder="Seleccione una categoría" className="w-full md:w-14rem" />
                    </div>
                    <div className="field col">
                        <label htmlFor="marca" className="font-bold">Marca</label>
                        <Dropdown value={selectedMarca} onChange={(e) => setSelectedMarca(e.value)} options={marcas} optionLabel="nombre" placeholder="Seleccione una marca" className="w-full md:w-14rem" />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="precio" className="font-bold">Precio</label>
                        <InputNumber id="precio" value={producto.precioUnitario} onValueChange={(e) => onInputNumberChange(e, 'precioUnitario')} mode="currency" currency="USD" locale="en-US" />
                    </div>
                </div>
                <div className="field col">
                    <label htmlFor="imagen">Imagen</label>
                    {!preview ?(
                        <FileUpload
                            mode="basic"
                            accept="image/*"
                            maxFileSize={1000000}
                            customUpload
                            uploadHandler={onUpload}
                            chooseLabel='Seleccionar'
                        />
                    ) :(
                        <div className="flex flex-col items-center">
                            <img src={preview} alt='preview' className='w-40 h-40 object-cover rounded-lg shadow-md mb-2'/>
                            <Button type= "button" label= "Quitar Imagen" icon= "pi pi-times" severity="danger" onClick={removeImage} />
                        </div>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmación" modal footer={deleteDialogFooter} onHide={hideDeleteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {producto && (
                        <span>
                            ¿Seguro/a de eliminar el producto <b>{producto.nombre}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
