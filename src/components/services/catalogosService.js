
import axios from "axios";
import Swal from "sweetalert2";
import { urlBase } from "../utils/config";

    export const fetchCategorias = async (token) => {
        try{
            const response = await axios.get(`${urlBase}/categorias`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            return( response.data);
        }catch(err){
            Swal.fire('Error',"No se pudo obtener el listado de categrías", 'error');
            return[];
        }
    }
    export const fetchMarcas = async (token) => {
        try{
            const response = await axios.get(`${urlBase}/marcas`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            return( response.data);
        }catch(err){
            Swal.fire('Error',"No se pudo obtener el listado de categrías", 'error');
            return[];
        }
    }