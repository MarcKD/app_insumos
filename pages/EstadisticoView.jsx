import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingDown, Search, XCircle } from 'lucide-react';
import { useDebounce } from '../src/hooks/useDebounce';

const EstadisticoView = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [areas, setAreas] = useState([]);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch areas for the filter dropdown
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/areas');
                if (response.ok) {
                    const data = await response.json();
                    setAreas(data);
                }
            } catch (error) {
                console.error("Failed to fetch areas:", error);
            }
        };
        fetchAreas();
    }, []);

    // Fetch stats based on filters
    const fetchStats = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedArea) params.append('area', selectedArea);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        try {
            const response = await fetch(`http://localhost:3001/api/estadisticas/consumo?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, selectedArea, startDate, endDate]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedArea('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            {/* Header and Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 size={24} className="text-blue-600" />
                    Estadísticas de Consumo
                </h2>
                <p className="text-slate-500">Analiza el consumo de insumos por producto, área y rango de fechas.</p>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="relative lg:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por código o descripción..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                >
                    <option value="">Todas las Áreas</option>
                    {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                </select>
                <input
                    type="date"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Fecha de inicio"
                />
                <input
                    type="date"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="Fecha de fin"
                />
                <button
                    onClick={resetFilters}
                    className="lg:col-start-5 text-slate-500 hover:text-red-600 flex items-center justify-center gap-2 text-sm"
                >
                    <XCircle size={16} /> Limpiar Filtros
                </button>
            </div>

            {/* Stats Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-semibold">Código</th>
                                <th className="p-4 font-semibold">Descripción</th>
                                <th className="p-4 font-semibold">Área</th>
                                <th className="p-4 font-semibold text-center">Stock Actual</th>
                                <th className="p-4 font-semibold text-center">Consumo Total (unidades)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">Cargando...</td>
                                </tr>
                            ) : stats.length > 0 ? (
                                stats.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                                        <td className="p-4 font-mono text-slate-500">{item.code}</td>
                                        <td className="p-4 font-medium text-slate-800">{item.description}</td>
                                        <td className="p-4 text-slate-500">{item.area}</td>
                                        <td className="p-4 text-center font-medium text-slate-600">{item.stock}</td>
                                        <td className="p-4 text-center font-bold text-blue-600 flex items-center justify-center gap-1">
                                            <TrendingDown size={14} />
                                            {item.total_consumo}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        No se encontraron datos con los filtros aplicados.
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

export default EstadisticoView;
