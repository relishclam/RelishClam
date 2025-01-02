import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

function App() {
  const [isAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          <Navbar />
          <main className="container mx-auto py-6">
            <Dashboard />
          </main>
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;