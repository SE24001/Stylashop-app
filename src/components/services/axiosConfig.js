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
    // Convertir el DTO del frontend al formato que espera el backend
    const pagoEntity = {
        fechaPago: dto.fechaPago,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        venta: dto.ventaDTO // El backend espera 'venta' no 'ventaDTO'
    };
    const response = await axios.post(`${urlBase}pagos`, pagoEntity, buildHeaders(token));
    return response.data;           
}

//Funcion para actualizar una venta
export const updateVenta = async (id, dto, token) => {
    const response = await axios.put(`${urlBase}ventas/${id}`, dto, buildHeaders(token));
    return response.data;           
}