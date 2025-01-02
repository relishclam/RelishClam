import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProductionStream from './components/production/ProductionStream';
import QualityControlStream from './components/quality/QualityControlStream';
import AdminPanel from './components/admin/AdminPanel';
import { LotProvider } from './components/LotContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation onNavigate={(path) => navigate(path)} />
      <LotProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/production" element={<ProductionStream />} />
          <Route path="/quality" element={<QualityControlStream />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </LotProvider>
    </div>
  );
}

export default App;