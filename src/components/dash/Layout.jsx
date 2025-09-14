import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const handleResize = () => {
    setIsSidebarOpen(window.innerWidth >= 1024);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Navbar fijo */}
      <div className="sticky top-0 z-10 w-full">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden w-full">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <main className={`flex-1 p-2 sm:p-4 md:p-8 lg:p-10 overflow-y-auto transition-all w-full ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}> 
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;