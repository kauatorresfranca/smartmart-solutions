import { useState } from 'react';
import Sidebar from "./components/sidebar/index";
import Products from './pages/Products';
import Sales from './pages/Sales';
import Dashboard from './pages/Dashboard';
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar no Desktop / Bottom Bar no Mobile */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      {/* Área Principal - ml-0 no mobile, ml-64 no desktop para compensar a sidebar fixa */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        
        {/* Header - Escondido no mobile para ganhar espaço, visível no desktop */}
        <header className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200 hidden md:block">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>
          <p className="text-slate-500">SmartMart Solutions - Painel de Controle</p>
        </header>       
        
        {/* Conteúdo Dinâmico */}
        <main className=" mx-auto">
          {activePage === 'dashboard' && <Dashboard/>}
          {activePage === 'products' && <Products/>}
          {activePage === 'sales' && <Sales/>}
        </main>
      </div>

      {/* Componente de notificações (Toast) - Aparecerá no canto superior direito */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;