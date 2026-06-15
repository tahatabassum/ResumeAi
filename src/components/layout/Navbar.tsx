import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import { Sparkles, LogOut, User as UserIcon, LayoutDashboard, PlusCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

interface NavbarProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'builder') => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, isAuthenticated, logout, continueAsGuest, isGuest } = useAuth();
  const { activeResume } = useResume();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#e2e8f0] shadow-sm select-none">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Brand Logo and Active Editing indicator */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1.5 font-sans text-xl font-extrabold text-[#2563eb] cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-6 h-6 text-[#2563eb]" fill="#2563eb" />
            <span>ResumeAI</span>
          </div>
          {currentPage === 'builder' && activeResume && (
            <>
              <div className="h-6 w-px bg-[#e2e8f0]"></div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider">Editing:</span>
                <span className="text-xs font-semibold text-[#0f172a] truncate max-w-[180px]">
                  {activeResume.meta.name || 'Untitled Resume'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Global Links */}
        <nav className="hidden md:flex items-center gap-8 font-label-md text-label-md text-[#64748b]">
          <button 
            onClick={() => onNavigate('landing')}
            className={`font-semibold cursor-pointer hover:text-[#2563eb] transition-colors ${
              currentPage === 'landing' ? 'text-[#2563eb] font-bold border-b-2 border-[#2563eb] pb-1' : ''
            }`}
          >
            Home
          </button>
          { (isAuthenticated || isGuest) && (
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`font-semibold cursor-pointer hover:text-[#2563eb] transition-colors ${
                currentPage === 'dashboard' ? 'text-[#2563eb] font-bold border-b-2 border-[#2563eb] pb-1' : ''
              }`}
            >
              My Resumes
            </button>
          )}
          <button 
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'auth')}
            className={`font-semibold cursor-pointer hover:text-[#2563eb] transition-colors ${
              currentPage === 'builder' ? 'text-[#2563eb] font-bold border-b-2 border-[#2563eb] pb-1' : ''
            }`}
          >
            Editor
          </button>
        </nav>

        {/* Auth Actions block */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-semibold text-[#0f172a] bg-[#eff6ff] px-2.5 py-1 rounded-full border border-[#dbeafe]">
                {user?.name}
              </span>
              <Button 
                variant="ghost" 
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className="flex items-center gap-1 h-9 px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : isGuest ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#7c3aed] bg-[#f5f3ff] px-2.5 py-1 rounded-full border border-[#ddd6fe]">
                Guest Mode
              </span>
              <Button 
                variant="primary"
                onClick={() => onNavigate('auth')}
                className="h-9 px-4"
              >
                Register
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('auth')}
                className="h-9 px-4"
              >
                Login
              </Button>
              <Button 
                variant="primary" 
                onClick={() => onNavigate('auth')}
                className="h-9 px-4 shadow-sm"
              >
                Get Started Free
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
