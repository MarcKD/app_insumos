import React from 'react';
import { Package, LayoutGrid, ShoppingCart, BarChart3, History, LogIn, ClipboardList } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, itemsToOrderCount, user, onLogout }) => {

    const hasAccess = (tabId) => {
        const role = user?.role;
        if (!role) return false;
        if (role === 'SuperAdmin') return true;
        if (role === 'Admin') return ['inicio', 'pedir', 'pedidos'].includes(tabId);
        if (role === 'Usuario') return ['inicio'].includes(tabId);
        return false;
    };

    const NavButton = ({ id, label, icon, count }) => {
        if (!hasAccess(id)) return null;
        return (
            <button
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
            >
                {icon}
                <span className="text-sm font-medium">{label}</span>
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                        {count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Package className="text-blue-400" /> app-insumos
                </h1>

                <nav className="hidden md:flex gap-6">
                    <NavButton id="inicio" label="Inventario" icon={<LayoutGrid size={18} />} />
                    <NavButton id="pedir" label="A Pedir" icon={<ShoppingCart size={18} />} count={itemsToOrderCount} />
                    <NavButton id="pedidos" label="Pedidos" icon={<ClipboardList size={18} />} />
                    <NavButton id="estadistico" label="Estadístico" icon={<BarChart3 size={18} />} />
                    <NavButton id="historial" label="Historial" icon={<History size={18} />} />
                </nav>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 hidden sm:block">
                        Hola, {user?.display_name || user?.username} <span className="opacity-50">({user?.role})</span>
                    </span>
                    <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Cerrar Sesión">
                        <LogIn className="rotate-180" size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <nav className="md:hidden flex justify-around mt-4 border-t border-slate-700 pt-2">
                <NavButton id="inicio" label="Inicio" icon={<LayoutGrid size={18} />} />
                <NavButton id="pedir" label="A Pedir" icon={<ShoppingCart size={18} />} count={itemsToOrderCount} />
                <NavButton id="pedidos" label="Pedidos" icon={<ClipboardList size={18} />} />
                <NavButton id="estadistico" label="Estad." icon={<BarChart3 size={18} />} />
                <NavButton id="historial" label="Hist." icon={<History size={18} />} />
            </nav>
        </div>
    );
};

export default Navbar;