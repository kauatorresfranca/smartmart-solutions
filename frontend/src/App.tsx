import { useState } from 'react';
import Sidebar from "./components/sidebar/index";
import Products from './pages/products';
import Sales from './pages/sales';
import Dashboard from './pages/Dashboard';

function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');

  return (
    <div className="flex">
      {/* Sidebar fixa */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      {/* Área Principal com margem à esquerda para não sobrepor */}
      <div className="flex-1 ml-64 min-h-screen bg-gray-100 p-8">
        <header className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-slate-800">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>
          <p className="text-gray-500">SmartMart Solutions - Painel de Controle</p>
        </header>       
        <main>
          {activePage === 'dashboard' && <Dashboard/>}

          {activePage === 'products' && <Products/>}

          {activePage === 'sales' && <Sales/>}
        </main>
      </div>
    </div>
  );
}

export default App;