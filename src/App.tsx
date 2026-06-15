import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BuilderPage from './pages/BuilderPage';
import Navbar from './components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard' | 'builder'>('landing');
  const { isAuthenticated, isGuest } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleNavigate = (page: 'landing' | 'auth' | 'dashboard' | 'builder') => {
    // Basic route auth guards
    if ((page === 'dashboard' || page === 'builder') && !isAuthenticated && !isGuest) {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: '"Inter", sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#1e293b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
            borderRadius: '10px',
          }
        }} 
      />
      
      {/* Universal Sticky Header Navigation */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Pages Router Switcher */}
      <main className="flex-grow">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'auth' && <AuthPage onNavigate={handleNavigate} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'builder' && <BuilderPage onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <AppContent />
      </ResumeProvider>
    </AuthProvider>
  );
}
