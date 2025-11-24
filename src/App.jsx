import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import ProductModal from "../components/ProductModal";
import Login from "../pages/Login";
import HomeView from '../pages/HomeView';
import OrderView from '../pages/OrderView';
import HistoryView from '../pages/HistoryView';
import EstadisticoView from '../pages/EstadisticoView';

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

  // --- Estado del Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      // Optionally, set an error state to show in the UI
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setInventory([]); // Clear inventory on logout
    localStorage.removeItem('app_insumos_user');
  };

  const handleAddProduct = async (newItemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItemData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      // Refresh inventory from server to get the latest list
      await fetchInventory();
      setIsModalOpen(false); // Close modal on success

    } catch (error) {
      console.error("Failed to add product:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleStockUpdate = async (id, change) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          change,
          usuario: user.username || user.display_name || 'Usuario',
          area: user.area || 'General'
        }),
      });

      if (response.ok) {
        await fetchInventory(); // Refresh to show new stock
      } else {
        console.error("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // --- Renderizado Condicional ---
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
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
          />
        )}

        {activeTab === 'pedir' && (
          <OrderView itemsToOrder={itemsToOrder} />
        )}

        {activeTab === 'estadistico' && <EstadisticoView />}
        {activeTab === 'historial' && <HistoryView />}
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
      />
    </div>
  );
};

export default App;