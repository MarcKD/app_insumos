import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const OrderView = ({ itemsToOrder }) => {
    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Atención Requerida
                    </h2>
                    <p className="text-amber-700 text-sm">
                        Hay {itemsToOrder.length} productos por debajo del stock mínimo.
                    </p>
                </div>
                <div className="hidden md:block">
                    <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 shadow-sm transition-colors">
                        Generar PDF Pedido
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 font-semibold">Código</th>
                            <th className="p-4 font-semibold">Descripción</th>
                            <th className="p-4 font-semibold">Proveedor</th>
                            <th className="p-4 font-semibold text-center text-red-600">Stock Actual</th>
                            <th className="p-4 font-semibold text-center text-xs text-slate-400">Mínimo Requerido</th>
                            <th className="p-4 font-semibold text-center bg-blue-50 text-blue-700">Cantidad a Pedir</th>
                            <th className="p-4 font-semibold text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {itemsToOrder.length > 0 ? (
                            itemsToOrder.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                                    <td className="p-4 font-mono text-slate-500">{item.code}</td>
                                    <td className="p-4 font-medium text-slate-900">{item.description}</td>
                                    <td className="p-4 text-slate-500">{item.provider}</td>
                                    <td className="p-4 text-center font-bold text-red-600">{item.stock}</td>
                                    <td className="p-4 text-center text-slate-500">{item.min}</td>
                                    <td className="p-4 text-center font-bold bg-blue-50 text-blue-700 text-lg">
                                        {item.suggestedOrder}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-full transition-colors" title="Marcar como pedido">
                                            <CheckCircle size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <CheckCircle size={48} className="text-green-400" />
                                        <p className="text-lg font-medium text-slate-600">Todo en orden</p>
                                        <p>No hay productos que necesiten reposición inmediata.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderView;