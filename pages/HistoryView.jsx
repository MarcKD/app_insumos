import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowRight, Search } from 'lucide-react';

const HistoryView = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/historial');
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item => {
        const term = searchTerm.toLowerCase();
        const itemDate = new Date(item.fecha).toLocaleString().toLowerCase();

        return (
            item.usuario.toLowerCase().includes(term) ||
            itemDate.includes(term) ||
            item.producto_descripcion.toLowerCase().includes(term) ||
            item.producto_codigo.toLowerCase().includes(term) ||
            item.area.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Cargando historial...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <Clock size={24} className="text-blue-600" />
                    <h2 className="font-semibold text-slate-700 text-lg">
                        Historial de Movimientos
                    </h2>
                </div>
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Filtrar por usuario, fecha, producto, área..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-semibold">Fecha</th>
                                <th className="p-4 font-semibold">Usuario</th>
                                <th className="p-4 font-semibold">Producto</th>
                                <th className="p-4 font-semibold text-center">Cambio</th>
                                <th className="p-4 font-semibold">Área</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                                    <td className="p-4 whitespace-nowrap text-slate-500">
                                        {new Date(item.fecha).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        {item.usuario}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium">{item.producto_descripcion}</div>
                                        <div className="text-xs text-slate-400 font-mono">{item.producto_codigo}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-slate-400">{item.cantidad_anterior}</span>
                                            <ArrowRight size={14} className="text-slate-300" />
                                            <span className={`font-bold ${item.cantidad_nueva > item.cantidad_anterior ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.cantidad_nueva}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500">{item.area}</td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        No se encontraron movimientos con ese criterio.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryView;
