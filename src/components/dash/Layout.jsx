import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Manejar el cambio de tamaño de pantalla
  const handleResize = () => {
    setIsSidebarOpen(window.innerWidth >= 1024); // Abierto automáticamente en pantallas grandes
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar fijo */}
      <div className="sticky top-0 z-10">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} // Para cerrar manualmente
        />
        <main className={`flex-1 bg-gray-100 p-4 overflow-y-auto transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0' }`} >
          <Outlet /> {/* renderiza los componentes dinamicamente cargados con react-router */}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;