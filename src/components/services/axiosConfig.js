import axios from "axios";
import { urlBase } from "../utils/config";

//Funcion para construir el encabezado de las peticiones
const buildHeaders = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

export const getCategorias = async (token) => {
    const response = await axios.get(`${urlBase}categorias`, buildHeaders(token));
    return response.data;           
}

export const getMarcas = async (token) => {
    const response = await axios.get(`${urlBase}marcas`, buildHeaders(token));
    return response.data;           
}

export const getClientes = async (token) => {
    const response = await axios.get(`${urlBase}clientes`, buildHeaders(token));
    return response.data;           
}

export const getProductos = async (token) => {
    const response = await axios.get(`${urlBase}productos`, buildHeaders(token));
    return response.data;           
}

//Funcion para crear una nueva venta
export const createVenta = async (dto, token) => {
    const response = await axios.post(`${urlBase}ventas`, dto, buildHeaders(token));
    return response.data;           
}

//Funcion para obtener ventas
export const getVentas = async (token) => {
    const response = await axios.get(`${urlBase}ventas`, buildHeaders(token));
    return response.data;           
}

//Funcion para crear un pago
export const createPago = async (dto, token) => {
    // Estructura que coincida con la entidad Pago del backend
    const pagoData = {
        fechaPago: dto.fechaPago,
        monto: dto.monto,
        metodo: dto.metodo,
        venta: { id: dto.ventaDTO.id } // Solo enviamos el ID de la venta
    };
    
    console.log("Datos del pago enviados al backend:", pagoData);
    
    const response = await axios.post(`${urlBase}pagos`, pagoData, buildHeaders(token));
    return response.data;           
}

//Funcion para actualizar una venta
export const updateVenta = async (id, dto, token) => {
    const response = await axios.put(`${urlBase}ventas/${id}`, dto, buildHeaders(token));
    return response.data;           
}

//Funciones para gestión de usuarios
export const getUsuarios = async (token) => {
    const response = await axios.get(`${urlBase}usuarios`, buildHeaders(token));
    return response.data;           
}

export const getRoles = async (token) => {
    const response = await axios.get(`${urlBase}usuarios/roles`, buildHeaders(token));
    return response.data;           
}

export const createUsuario = async (dto, token) => {
    const response = await axios.post(`${urlBase}auth/register`, dto, buildHeaders(token));
    return response.data;           
}

export const updateUsuario = async (id, dto, token) => {
    const response = await axios.put(`${urlBase}usuarios/${id}`, dto, buildHeaders(token));
    return response.data;           
}

export const deleteUsuario = async (id, token) => {
    const response = await axios.delete(`${urlBase}usuarios/${id}`, buildHeaders(token));
    return response.data;           
}