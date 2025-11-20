import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import ProductModal from "../components/ProductModal";
import Login from "../pages/Login";
import HomeView from '../pages/HomeView';
import OrderView from '../pages/OrderView';

const App = () => {
  // --- Estado de Autenticación ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // --- Estado de la Navegación ---
  const [activeTab, setActiveTab] = useState('inicio');

  // --- Estado del Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Estado de Datos (Mock Data) ---
  const [inventory, setInventory] = useState([
    { id: 1, code: 'TORN-001', description: 'Tornillo Hexagonal 1/4', provider: 'Ferretería Ind.', stock: 150, min: 50, max: 500, area: 'Taller' },
    { id: 2, code: 'LIMP-055', description: 'Desengrasante Industrial 5L', provider: 'Químicos SA', stock: 10, min: 20, max: 100, area: 'Limpieza' },
    { id: 3, code: 'ELEC-202', description: 'Cable Calibre 12 Rojo', provider: 'Electricidad Global', stock: 45, min: 100, max: 300, area: 'Mantenimiento' },
    { id: 4, code: 'EPP-900', description: 'Guantes de Seguridad', provider: 'Seguridad Total', stock: 12, min: 30, max: 100, area: 'Depósito' },
    { id: 5, code: 'HER-005', description: 'Disco de corte 4.5"', provider: 'Ferretería Ind.', stock: 80, min: 20, max: 100, area: 'Taller' },
  ]);

  // --- Lógica de "A Pedir" (Global para el Badge) ---
  const itemsToOrder = inventory.filter(item => item.stock <= item.min).map(item => ({
    ...item,
    suggestedOrder: item.max - item.stock
  }));

  // --- Manejadores ---
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleAddProduct = (newItemData) => {
    const itemToAdd = {
      id: Date.now(),
      ...newItemData,
      stock: Number(newItemData.stock),
      min: Number(newItemData.min),
      max: Number(newItemData.max)
    };
    setInventory([...inventory, itemToAdd]);
    setIsModalOpen(false);
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
          />
        )}
        
        {activeTab === 'pedir' && (
          <OrderView itemsToOrder={itemsToOrder} />
        )}
        
        {activeTab === 'estadistico' && <div className="p-10 text-center text-slate-500">Próximamente: Gráficos de Consumo</div>}
        {activeTab === 'historial' && <div className="p-10 text-center text-slate-500">Próximamente: Historial de Movimientos</div>}
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