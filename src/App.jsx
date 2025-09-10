import { useState } from 'react'

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/context/AuthContext'

//importaciones de componentes
import Login from './components/auth/Login'
import Dashboard from './components/dash/Dashboard';
import Layout from './components/dash/Layout';
import Catalogos from './components/catalogos/Catalogos';
import Categorias from './components/catalogos/Categorias';
import Marcas from './components/catalogos/Marcas';
import Productos from './components/catalogos/Productos';
import Clientes from './components/clientes/Cliente';
import Reportes from './components/reportes/Reportes';
import ReporteIngresos from './components/reportes/ReporteIngresos';

const ProtectedRoute = ({children}) => {
    const {user} = useAuth();
    if(!user){
        return <Navigate to="/login" replace />
    }
    return children;
}

//definición de las rutas en react-router-dom 7
const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    //ruta protegidas 
    {
        //ruta padre que  engloba todo el Dashboard
        path: '/',
        element: (
        <ProtectedRoute>
            <Layout />
        </ProtectedRoute>
        ),
        //las "children" son las rutas que se renderizan dentro del layout
        //dinámica, es decir dentro de <Outlet />
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: 'dashboard',
                element:<Dashboard/>
            },
            {
                path: 'catalogos',
                element:<Catalogos/>
            },
           {
                path: 'categorias',
                element:<Categorias/>
            },
            {
                path: 'marcas',
                element:<Marcas/>
            },
            {
                path: 'productos',
                element:<Productos/>
            },
            {
                path: 'clientes',
                element:<Clientes/>
            },
            {
                path: 'reportes',
                element:<Reportes/>
            },
            {
                path: 'reportes/reporte-ingresos',
                element:<ReporteIngresos/>
            }
        ]
    }
]);

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    )
}

export default App