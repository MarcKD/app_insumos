import React from 'react';
import { X, Package } from 'lucide-react';

const DetailItem = ({ label, value }) => (
    <div className="py-2 px-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-md text-slate-800 font-semibold">{value || '-'}</p>
    </div>
);

const ProductDetailModal = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <div className='flex items-center gap-3'>
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                            <Package size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{product.description}</h2>
                            <p className="text-sm text-slate-500 font-mono">{product.code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailItem label="Proveedor" value={product.provider} />
                    <DetailItem label="Área" value={product.area} />
                    <DetailItem label="Stock Actual" value={product.stock} />
                    <DetailItem label="Stock Mínimo" value={product.min} />
                    <DetailItem label="Stock Máximo" value={product.max} />
                    <DetailItem label="Pedido Sugerido" value={product.suggestedOrder} />
                </div>
                 <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium shadow-sm">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
