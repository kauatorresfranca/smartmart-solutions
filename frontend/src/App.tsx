import { useState } from 'react';
import Sidebar from "./components/sidebar/index";
import Products from './pages/products';

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
          {activePage === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-semibold text-gray-600 text-sm uppercase tracking-wider">Total de Vendas</h2>
                <p className="text-3xl font-bold mt-2 text-slate-900">R$ 0,00</p>
              </div>
              {/* Adicione outros cards aqui */}
            </div>
          )}

          {activePage === 'products' && <Products/>}

          {activePage === 'sales' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Histórico de Vendas</h2>
              <p className="text-gray-600">Listagem de vendas recentes.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;