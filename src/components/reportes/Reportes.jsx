import { Link } from "react-router-dom";
import { FaCreditCard } from "react-icons/fa";
import { FaCashRegister } from "react-icons/fa";

const reportes = [
    {
        titulo: 'Reporte de Ingresos',
        icon: <FaCashRegister />,
        ruta: '/reportes/reporte-ingresos',
        color: 'blue-600'
    },
    {
        titulo: 'Métodos de Pago',
        icon: <FaCreditCard />,
        ruta: '/reportes/metodos-pago',
        color: 'green-600'
    }
   
];

const Reportes = () => {
    return (
     <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-500 mb-6">Reportes del Sistema</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportes.map((report, index) =>(
                <Link
                to={report.ruta}
                key={index}
                className={`bg-white border-l-8 border-${report.color} rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 hover:blue-100 flex items-center space-x-4`}
                >
                    <div className={`text-3xl text-${report.color}`}>
                        {report.icon}
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                        {report.titulo}
                    </div>
                </Link>
            ))}
        </div>
     </div>   
    )        
}

export default Reportes;