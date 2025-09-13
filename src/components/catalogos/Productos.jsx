import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import axios from 'axios';
import Swal from 'sweetalert2';
import { urlBase, IMAGES_URL } from '../utils/config';
import { fetchCategorias, fetchMarcas } from '../services/catalogosService';

export default function Productos() {
  const token = localStorage.getItem('token');

  const emptyProducto = {
    id: null,
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    imagenUrl: '',
    marcaDTO: null,
    categoriaDTO: null
  };

  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState(emptyProducto);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        if (token) {
          const [cats, mrcs] = await Promise.all([
            fetchCategorias(token),
            fetchMarcas(token)
          ]);
          setCategorias(cats || []);
          setMarcas(mrcs || []);
        }
      } catch {
        // silencio: toasts específicos en fetchProductos
      }
    };
    loadCatalogos();
    fetchProductos();
  }, []);

  // Obtener productos
  const fetchProductos = async () => {
    try {
      const { data } = await axios.get(`${urlBase}productos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(data);
    } catch (err) {
      Swal.fire('Error', 'No se pudo obtener el listado de productos', 'error');
    }
  };

  const formatCurrency = (value) =>
    (value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const openNew = () => {
    setProducto(emptyProducto);
    setPreview(null);
    setSelectedImage(null);
    setSubmitted(false);
    setDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setDialog(false);
  };

  const hideDeleteDialog = () => setDeleteDialog(false);

  // Crear FormData (dto + imagen)
  const createFormData = (p) => {
    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(p)], { type: 'application/json' }));
    if (selectedImage) {
      formData.append('imagen', selectedImage);
    }
    return formData;
  };

  // Guardar o actualizar
  const saveOrUpdate = async () => {
    setSubmitted(true);
    if (!producto.nombre?.trim()) return;
    if (!producto.descripcion?.trim()) return;

    let _productos = [...productos];
    const formData = createFormData(producto);

    if (producto.id == null) {
      // Crear
      try {
        const response = await axios.post(`${urlBase}productos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 201) {
          const { message, producto: nuevo } = response.data;
          _productos.unshift(nuevo);
          setProductos(_productos);
          toast.current.show({ severity: 'success', summary: 'Registrado', detail: message, life: 3000 });
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar el producto', 'error');
        return;
      }
    } else {
      // Actualizar
      try {
        const response = await axios.put(`${urlBase}productos/${producto.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          const { message, producto: actualizado } = response.data;
          _productos = _productos.map((p) => (p.id === actualizado.id ? actualizado : p));
          setProductos(_productos);
          toast.current.show({ severity: 'success', summary: 'Actualizado', detail: message, life: 3000 });
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        return;
      }
    }

    // Reset UI
    setDialog(false);
    setProducto(emptyProducto);
    setPreview(null);
    setSelectedImage(null);
  };

  const editProducto = (p) => {
    setProducto({ ...p });
    setPreview(p.imagenUrl ? `${IMAGES_URL}${p.imagenUrl}` : null);
    setDialog(true);
  };

  const confirmDeleteProducto = (p) => {
    setProducto(p);
    setDeleteDialog(true);
  };

  const deleteProducto = async () => {
    const id = producto.id;
    let _productos = productos.filter((val) => val.id !== id);
    try {
      const response = await axios.delete(`${urlBase}productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        const { message } = response.data;
        setProductos(_productos);
        toast.current.show({ severity: 'success', summary: 'Eliminado', detail: message, life: 3000 });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
    }
    setDeleteDialog(false);
    setProducto(emptyProducto);
  };

  const exportCSV = () => dt.current.exportCSV();

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setProducto({ ...producto, [name]: val });
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    setProducto({ ...producto, [name]: val });
  };

  // Imagen
  const onUpload = (event) => {
    const file = event.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setProducto({ ...producto, imagenUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setProducto({ ...producto, imagenUrl: null });
    setSelectedImage(null);
  };

  // Templates
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button label="Nuevo Producto" icon="pi pi-plus" severity="success" onClick={openNew} />
    </div>
  );

  const rightToolbarTemplate = () => (
    <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
  );

  const imageBodyTemplate = (rowData) =>
    rowData.imagenUrl ? (
      <img
        src={`${IMAGES_URL}${rowData.imagenUrl}`}
        alt={rowData.nombre}
        style={{ width: '64px', borderRadius: '4px' }}
      />
    ) : (
      <span>No Image</span>
    );

  const priceBodyTemplate = (rowData) => formatCurrency(rowData.precioUnitario);

  const actionBodyTemplate = (rowData) => (
    <>
      <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editProducto(rowData)} />
      <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProducto(rowData)} />
    </>
  );

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-between">
      <h4 className="m-0">Gestión de Productos</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." className="pl-8" />
      </span>
    </div>
  );

  const productoDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} style={{ marginRight: '0.5rem' }} />
      <Button label={producto.id === null ? 'Guardar' : 'Actualizar'} icon="pi pi-check" onClick={saveOrUpdate} />
    </>
  );

  const deleteProductoDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDialog} style={{ marginRight: '0.5rem' }} />
      <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteProducto} />
    </>
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="card">
        <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate} />

        <DataTable
          ref={dt}
          value={productos}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
          globalFilter={globalFilter}
          header={header}
        >
          <Column field="nombre" header="Nombre" sortable style={{ minWidth: '16rem' }} />
          <Column field="descripcion" header="Descripción" style={{ minWidth: '16rem' }} />
          <Column field="imagenUrl" header="Imagen" body={imageBodyTemplate} />
          <Column field="precioUnitario" header="Precio" body={priceBodyTemplate} sortable style={{ minWidth: '8rem' }} />
          <Column field="marcaDTO.nombre" header="Marca" sortable style={{ minWidth: '10rem' }} />
          <Column field="categoriaDTO.nombre" header="Categoría" sortable style={{ minWidth: '10rem' }} />
          <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
        </DataTable>
      </div>

      {/* Crear / Editar */}
      <Dialog
        visible={dialog}
        style={{ width: '32rem' }}
        header={producto.id ? 'Actualizar Producto' : 'Nuevo Producto'}
        modal
        className="p-fluid"
        footer={productoDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="nombre" className="font-bold">Nombre</label>
          <InputText
            id="nombre"
            value={producto.nombre}
            onChange={(e) => onInputChange(e, 'nombre')}
            required
            autoFocus
            className={classNames({ 'p-invalid': submitted && !producto.nombre })}
          />
          {submitted && !producto.nombre?.trim() && <small className="p-error">El nombre es requerido.</small>}
        </div>

        <div className="field">
          <label htmlFor="descripcion" className="font-bold">Descripción</label>
          <InputTextarea
            id="descripcion"
            value={producto.descripcion}
            onChange={(e) => onInputChange(e, 'descripcion')}
            rows={3}
            cols={20}
          />
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label className="font-bold">Marca</label>
            <Dropdown
              value={producto.marcaDTO}
              onChange={(e) => setProducto({ ...producto, marcaDTO: e.value })}
              options={marcas}
              optionLabel="nombre"
              placeholder="Seleccione una marca"
              className="w-full md:w-14rem"
            />
          </div>
          <div className="field col">
            <label className="font-bold">Categoría</label>
            <Dropdown
              value={producto.categoriaDTO}
              onChange={(e) => setProducto({ ...producto, categoriaDTO: e.value })}
              options={categorias}
              optionLabel="nombre"
              placeholder="Seleccione una categoría"
              className="w-full md:w-14rem"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="precio" className="font-bold">Precio</label>
          <InputNumber
            id="precio"
            value={producto.precioUnitario}
            onValueChange={(e) => onInputNumberChange(e, 'precioUnitario')}
            mode="currency"
            currency="USD"
            locale="en-US"
          />
        </div>

        <div className="field">
          <label htmlFor="imagen" className="font-bold">Imagen</label>
          {!preview ? (
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={1000000}
              customUpload
              uploadHandler={onUpload}
              chooseLabel="Seleccionar"
            />
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover rounded-lg shadow-md mb-2"
              />
              <Button
                type="button"
                label="Quitar Imagen"
                icon="pi pi-times"
                severity="danger"
                onClick={removeImage}
              />
            </div>
          )}
        </div>
      </Dialog>

      {/* Eliminar */}
      <Dialog
        visible={deleteDialog}
        style={{ width: '32rem' }}
        header="Confirmación"
        modal
        footer={deleteProductoDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {producto && (
            <span>
              ¿Seguro de eliminar el producto <b>{producto.nombre}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
