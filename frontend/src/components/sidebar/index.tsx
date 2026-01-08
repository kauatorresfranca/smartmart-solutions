import React from 'react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const menus: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Produtos', icon: '📦' },
    { id: 'sales', label: 'Vendas', icon: '💰' },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-slate-800">
        SmartMart
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActivePage(menu.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activePage === menu.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{menu.icon}</span>
            <span className="font-medium">{menu.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.0
      </div>
    </div>
  );
};

export default Sidebar;