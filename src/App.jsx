import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import ProductModal from "../components/ProductModal";
import Login from "../pages/Login";
import HomeView from '../pages/HomeView';
import OrderView from '../pages/OrderView';
import HistoryView from '../pages/HistoryView';
import EstadisticoView from '../pages/EstadisticoView';

import { Toaster, toast } from 'react-hot-toast';

import { API_BASE_URL } from './config';

const App = () => {
  // --- Estado de Autenticación ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('app_insumos_user');
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('app_insumos_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- Estado de la Navegación ---
  const [activeTab, setActiveTab] = useState('inicio');
  const [currentPage, setCurrentPage] = useState(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);

  // --- Estado del Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Estado para el producto en edición

  // --- Estado de Datos ---
  const [inventory, setInventory] = useState([]);

  // --- Fetch Inventory ---
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error('No se pudo cargar el inventario.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setHistoryCurrentPage(1);
  }, [activeTab]);

  // --- Lógica de "A Pedir" (Global para el Badge) ---
  const itemsToOrder = inventory.filter(item => item.stock <= item.min).map(item => ({
    ...item,
    suggestedOrder: item.max - item.stock
  }));

  // --- Manejadores ---
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('app_insumos_user', JSON.stringify(userData));
    toast.success(`Bienvenido, ${userData.username}!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setInventory([]); // Clear inventory on logout
    localStorage.removeItem('app_insumos_user');
    toast('Sesión cerrada.', { icon: '👋' });
  };

  const handleModalSubmit = async (productData) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let response;
        if (editingProduct) {
          response = await fetch(`${API_BASE_URL}/api/productos/${editingProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
          if (!response.ok) throw new Error('Failed to update product');
        } else {
          response = await fetch(`${API_BASE_URL}/api/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
          if (!response.ok) throw new Error('Failed to create product');
        }
        await fetchInventory();
        handleCloseModal();
        resolve(editingProduct ? 'Insumo actualizado' : 'Insumo creado');
      } catch (error) {
        console.error("Failed to submit product:", error);
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Guardando...',
      success: (message) => `${message} correctamente!`,
      error: 'Ocurrió un error al guardar.',
    });
  };

  const handleStockUpdate = async (id, change) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change,
          usuario: user.username || user.display_name || 'Usuario',
          area: user.area || 'General'
        }),
      });

      if (response.ok) {
        await fetchInventory();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || 'No se pudo actualizar el stock.'}`);
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error('Error de conexión al actualizar stock.');
    }
  };
  
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // --- Renderizado Condicional ---
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemsToOrderCount={itemsToOrder.length}
        user={user}
        onLogout={handleLogout}
      />

      <main className="pb-20">
        {activeTab === 'inicio' && (
          <HomeView
            inventory={inventory}
            onAddClick={() => setIsModalOpen(true)}
            onStockUpdate={handleStockUpdate}
            onEditClick={handleEditClick}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        {activeTab === 'pedir' && (
          <OrderView itemsToOrder={itemsToOrder} />
        )}

        {activeTab === 'estadistico' && <EstadisticoView />}
        {activeTab === 'historial' && (
          <HistoryView
            currentPage={historyCurrentPage}
            onPageChange={setHistoryCurrentPage}
          />
        )}
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        productToEdit={editingProduct}
      />
    </div>
  );
};

export default App;