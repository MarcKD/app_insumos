import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../src/config';
import { toast } from 'react-hot-toast';
import { PackageSearch, ServerCrash, ShoppingCart, Truck } from 'lucide-react';

const PedidosView = ({ user, onReception }) => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPedidos = async () => {
        if (!user || !user.username) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos?username=${user.username}`);
            if (!response.ok) {
                throw new Error('Error al obtener los pedidos');
            }
            const data = await response.json();
            setPedidos(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, [user]);

    const handleReceiveItem = async (pedidoId) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/pedidos/${pedidoId}/recibir`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: user.username }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'No se pudo procesar la recepción');
                }

                // Update local state to remove the received item
                setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== pedidoId));
                
                // Refresh global inventory
                if (onReception) {
                    onReception();
                }

                resolve('Mercadería recibida y stock actualizado.');

            } catch (error) {
                console.error("Error receiving item:", error);
                reject(error.message);
            }
        });

        toast.promise(promise, {
            loading: 'Procesando recepción...',
            success: (message) => message,
            error: (err) => `Error: ${err}`,
        });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <PackageSearch className="animate-pulse text-slate-400" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 text-red-500 p-8">
                <ServerCrash size={48} />
                <p className="text-lg font-semibold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <ShoppingCart size={32} className="text-slate-700" />
                <h1 className="text-2xl font-bold text-slate-800">Insumos Pedidos</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold">Producto</th>
                            <th className="p-4 font-semibold text-center">Cantidad Pedida</th>
                            <th className="p-4 font-semibold">Área</th>
                            <th className="p-4 font-semibold">Pedido por</th>
                            <th className="p-4 font-semibold">Fecha de Pedido</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pedidos.length > 0 ? (
                            pedidos.map((pedido) => (
                                <tr key={pedido.id} className="hover:bg-slate-50 text-sm text-slate-700">
                                    <td className="p-4">
                                        <p className="font-medium text-slate-900">{pedido.producto_descripcion}</p>
                                        <p className="font-mono text-xs text-slate-500">{pedido.producto_codigo}</p>
                                    </td>
                                    <td className="p-4 font-bold text-center text-blue-600">{pedido.cantidad_pedida}</td>
                                    <td className="p-4">{pedido.area}</td>
                                    <td className="p-4 text-slate-500">{pedido.usuario}</td>
                                    <td className="p-4 text-slate-500">{formatDate(pedido.fecha_pedido)}</td>
                                    <td className="p-4 text-center">
                                       <button 
                                            onClick={() => handleReceiveItem(pedido.id)}
                                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-200 hover:text-green-800 flex items-center gap-2 mx-auto"
                                            title="Registrar recepción de mercadería y reponer stock"
                                        >
                                            <Truck size={14} />
                                            Recibir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <ShoppingCart size={48} />
                                        <p className="text-lg font-medium text-slate-600">No hay pedidos pendientes de recepción</p>
                                        <p>Los insumos marcados como pedidos aparecerán aquí.</p>
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

export default PedidosView;
