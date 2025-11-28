import { API_BASE_URL } from '../src/config';
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { BarChart3, TrendingDown, Search, XCircle, FileDown } from 'lucide-react';
import { useDebounce } from '../src/hooks/useDebounce';

const EstadisticoView = ({ user }) => {
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
                const response = await fetch(`${API_BASE_URL}/api/areas`);
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
        if (!user || !user.username) return;
        setLoading(true);
        const params = new URLSearchParams();
        params.append('username', user.username);
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedArea) params.append('area', selectedArea);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        try {
            const response = await fetch(`${API_BASE_URL}/api/estadisticas/consumo?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, selectedArea, startDate, endDate, user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedArea('');
        setStartDate('');
        setEndDate('');
    };

    const handleExport = () => {
        const dataToExport = stats.map(item => ({
            'Código': item.code,
            'Descripción': item.description,
            'Área': item.area,
            'Stock Actual': item.stock,
            'Consumo Total': item.total_consumo,
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estadisticas");
    
        // Define column widths
        const columnWidths = [
            { wch: 20 }, // Código
            { wch: 40 }, // Descripción
            { wch: 20 }, // Área
            { wch: 15 }, // Stock Actual
            { wch: 20 }, // Consumo Total
        ];
        worksheet['!cols'] = columnWidths;
    
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `estadisticas_consumo_${date}.xlsx`);
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
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                </div>
                <div className="flex flex-wrap items-center justify-end gap-4 mt-4 pt-4 border-t border-slate-100">
                     <button
                        onClick={resetFilters}
                        className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium"
                    >
                        <XCircle size={16} /> Limpiar Filtros
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={stats.length === 0}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-sm disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                        <FileDown size={18} />
                        Exportar
                    </button>
                </div>
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
    );};

export default EstadisticoView;
