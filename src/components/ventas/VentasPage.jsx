import React from "react";
import { useAuth } from "../context/AuthContext";
import VendedorView from "./VendedorView";
import CajeroView from "./CajeroView";

const VentasPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-center mt-10">Cargando usuario...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        Gestión de Ventas
      </h1>

      {user.role === "VENDEDOR" && <VendedorView />}
      {user.role === "CAJERO" && <CajeroView />}
      {user.role === "ADMIN" && (
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Vista Vendedor
            </h2>
            <VendedorView />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Vista Cajero
            </h2>
            <CajeroView />
          </section>
        </div>
      )}
    </div>
  );
};

export default VentasPage;

