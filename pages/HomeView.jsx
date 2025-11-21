import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';

const HomeView = ({ inventory, onAddClick, onStockUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Lógica de filtrado local
    const filteredInventory = inventory.filter(item => {
        const term = searchTerm.toLowerCase();
        return (
            item.description.toLowerCase().includes(term) ||
            item.provider.toLowerCase().includes(term) ||
            item.area.toLowerCase().includes(term) ||
            item.code.toLowerCase().includes(term)
        );
    });

    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={onAddClick}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    Nuevo Insumo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-semibold w-16">Img</th>
                                <th className="p-4 font-semibold">Código</th>
                                <th className="p-4 font-semibold">Descripción</th>
                                <th className="p-4 font-semibold">Proveedor</th>
                                <th className="p-4 font-semibold text-center">Stock</th>
                                <th className="p-4 font-semibold text-center text-xs text-slate-400">Rango (Min-Max)</th>
                                <th className="p-4 font-semibold">Área</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                                    <td className="p-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                            <ImageIcon size={20} />
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-slate-500">{item.code}</td>
                                    <td className="p-4 font-medium text-slate-900">{item.description}</td>
                                    <td className="p-4 text-slate-500">{item.provider}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock <= item.min ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {item.stock}
                                            </span>
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => onStockUpdate(item.id, 1)}
                                                    className="text-slate-400 hover:text-blue-600 p-0.5 rounded hover:bg-blue-50 transition-colors"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onStockUpdate(item.id, -1)}
                                                    className="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-xs text-slate-500">{item.min} - {item.max}</td>
                                    <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{item.area}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HomeView;