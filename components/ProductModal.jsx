import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSubmit }) => {
    const [newItem, setNewItem] = useState({
        code: '',
        description: '',
        provider: '',
        stock: '',
        min: '',
        max: '',
        area: ''
    });
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        if (isOpen) {
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
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newItem);
        // Reset form
        setNewItem({ code: '', description: '', provider: '', stock: '', min: '', max: '', area: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Nuevo Insumo</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                            <input required name="description" value={newItem.description} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                            <input required name="code" value={newItem.code} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                            <input name="provider" value={newItem.provider} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                            <select
                                name="area"
                                value={newItem.area}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Seleccionar Área</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.nombre}>
                                        {area.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
                            <input required type="number" name="stock" value={newItem.stock} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mínimo</label>
                            <input type="number" name="min" value={newItem.min} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Máximo</label>
                            <input type="number" name="max" value={newItem.max} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md flex items-center gap-2"><Save size={18} /> Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;