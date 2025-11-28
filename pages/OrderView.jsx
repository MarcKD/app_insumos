import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, MoreVertical, Eye, Plus, Minus } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../src/config';
import ProductDetailModal from '../components/DetailsModal';

// --- Actions Menu Component ---
const ActionsMenu = ({ item, onMarkAsOrdered, onViewDetails }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleViewDetails = () => {
        onViewDetails(item);
        setIsOpen(false);
    };

    const handleMarkAsOrdered = () => {
        onMarkAsOrdered(item.id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500"
            >
                <MoreVertical size={20} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-slate-100">
                    <button
                        onClick={handleViewDetails}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                        <Eye size={16} /> Ver Detalles
                    </button>
                    <button
                        onClick={handleMarkAsOrdered}
                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                    >
                        <CheckCircle size={16} /> Marcar Pedido
                    </button>
                </div>
            )}
        </div>
    );
};


const OrderView = ({ itemsToOrder, onOrderPlaced, user }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [productForDetail, setProductForDetail] = useState(null);
    const [editableQuantities, setEditableQuantities] = useState({});

    useEffect(() => {
        // Initialize editable quantities when itemsToOrder changes
        const initialQuantities = itemsToOrder.reduce((acc, item) => {
            acc[item.id] = item.suggestedOrder;
            return acc;
        }, {});
        setEditableQuantities(initialQuantities);
        setSelectedItems([]); // Also reset selected items
    }, [itemsToOrder]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(itemsToOrder.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (e, id) => {
        if (e.target.checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleQuantityChange = (itemId, value) => {
        const parsedValue = parseInt(value, 10);
        setEditableQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(1, parsedValue || 1) // Ensure quantity is at least 1
        }));
    };

    const handleIncrement = (itemId) => {
        setEditableQuantities(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const handleDecrement = (itemId) => {
        setEditableQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(1, (prev[itemId] || 0) - 1) // Ensure quantity is at least 1
        }));
    };

    const handleMarkAsOrdered = async (singleItemId = null) => {
        const itemsToProcess = singleItemId ? [singleItemId] : selectedItems;

        if (itemsToProcess.length === 0) {
            return;
        }

        const itemsToOrderDetails = itemsToOrder
            .filter(item => itemsToProcess.includes(item.id))
            .map(item => ({
                id: item.id,
                suggestedOrder: editableQuantities[item.id] || item.suggestedOrder, // Use edited quantity
                area: item.area,
            }));
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: itemsToOrderDetails,
                    usuario: user?.username || 'unknown',
                }),
            });

            if (!response.ok) {
                throw new Error('Error al registrar el pedido');
            }
            
            toast.success(`(${itemsToProcess.length}) item(s) marcados como pedidos.`);

            if (onOrderPlaced) {
                onOrderPlaced(itemsToProcess);
            }
            
            setSelectedItems(selectedItems.filter(id => !itemsToProcess.includes(id)));
            
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al registrar el pedido.');
        }
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        const items = selectedItems.length > 0 
            ? itemsToOrder.filter(i => selectedItems.includes(i.id)) 
            : itemsToOrder;

        // Apply editable quantities to items for PDF generation
        const itemsForPdf = items.map(item => ({
            ...item,
            suggestedOrder: editableQuantities[item.id] || item.suggestedOrder
        }));

        // Título del documento
        doc.setFontSize(18);
        doc.text("Pedido de Insumos", 14, 22);

        // Define las columnas para la tabla
        const tableColumn = ["Código", "Descripción", "Proveedor", "Stock Actual", "Mínimo", "Cantidad a Pedir"];
        
        // Mapea los datos de los items a un formato que jspdf-autotable pueda entender
        const tableRows = itemsForPdf.map(item => [
            item.code,
            item.description,
            item.provider,
            item.stock,
            item.min,
            item.suggestedOrder
        ]);

        // Genera la tabla en el PDF
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] }, // Color verde para la cabecera
        });

        // Guarda el PDF
        doc.save('pedido_insumos.pdf');
    };

    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
             <ProductDetailModal 
                isOpen={!!productForDetail}
                onClose={() => setProductForDetail(null)}
                product={productForDetail}
            />

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Atención Requerida
                    </h2>
                    <p className="text-amber-700 text-sm">
                        Hay {itemsToOrder.length} productos por debajo del stock mínimo.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2">
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed w-full"
                        onClick={() => handleMarkAsOrdered()}
                        disabled={selectedItems.length === 0}
                    >
                        Marcar como Pedido ({selectedItems.length})
                    </button>
                    <button 
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed w-full"
                        onClick={handleGeneratePDF}
                        disabled={itemsToOrder.length === 0}
                    >
                        Generar PDF Pedido
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 font-semibold">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                    onChange={handleSelectAll}
                                    checked={selectedItems.length === itemsToOrder.length && itemsToOrder.length > 0}
                                />
                            </th>
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
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={(e) => handleSelectItem(e, item.id)}
                                        />
                                    </td>
                                    <td className="p-4 font-mono text-slate-500">{item.code}</td>
                                    <td className="p-4 font-medium text-slate-900">{item.description}</td>
                                    <td className="p-4 text-slate-500">{item.provider}</td>
                                    <td className="p-4 text-center font-bold text-red-600">{item.stock}</td>
                                    <td className="p-4 text-center text-slate-500">{item.min}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button
                                                onClick={() => handleDecrement(item.id)}
                                                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editableQuantities[item.id] || ''}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                className="w-16 text-center border rounded-md p-1 text-lg font-bold bg-blue-50 text-blue-700"
                                            />
                                            <button
                                                onClick={() => handleIncrement(item.id)}
                                                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                       <ActionsMenu 
                                            item={item}
                                            onMarkAsOrdered={handleMarkAsOrdered}
                                            onViewDetails={setProductForDetail}
                                       />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-12 text-center">
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