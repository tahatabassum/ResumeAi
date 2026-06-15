import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, UserPlus, LogIn, Award } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

interface AuthPageProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'builder') => void;
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const { login, signup, continueAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (activeTab === 'signup' && !name)) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const getTargetPage = () => {
      return localStorage.getItem('selected_template_id') ? 'builder' : 'dashboard';
    };

    if (activeTab === 'login') {
      const ok = await login(email, password);
      setLoading(false);
      if (ok) {
        toast.success('Welcome back!');
        onNavigate(getTargetPage());
      } else {
        toast.error('Invalid email or password.');
      }
    } else {
      const ok = await signup(name, email, password);
      setLoading(false);
      if (ok) {
        toast.success('Account created successfully!');
        onNavigate(getTargetPage());
      } else {
        toast.error('Email already registered or registration failed.');
      }
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    toast.success('Welcome! Continuing as guest.');
    const target = localStorage.getItem('selected_template_id') ? 'builder' : 'dashboard';
    onNavigate(target);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center py-20 px-4 select-none relative">
      {/* Background radial soft light effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(37,99,235,0.08)_0%,_transparent_50%),radial-gradient(circle_at_80%_70%,_rgba(124,58,237,0.08)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white border border-[#e2e8f0] rounded-2xl shadow-xl overflow-hidden flex min-h-[500px]">
        
        {/* Left Side blurred decorative column (Desktop only) */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-45">
            <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#2563eb] rounded-full blur-[80px]" />
            <div className="absolute bottom-10 right-10 w-44 h-44 bg-[#7c3aed] rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 flex items-center gap-1.5 text-xl font-bold">
            <Sparkles className="w-6 h-6 text-[#2d6ae5]" fill="#2d6ae5" />
            <span>ResumeAI</span>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg space-y-3">
              <div className="flex gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                "ResumeAI completely transformed my portfolio. Within 2 days of optimizing my skills, I landed 3 Fortune-500 developer screening interviews."
              </p>
              <div className="text-xs text-slate-400">
                <span className="font-bold text-white">Alianna Carter</span> • Senior Full-Stack Engineer
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold select-none">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Tested for corporate recruiter standards.</span>
            </div>
          </div>
        </div>

        {/* Right Side Form Column */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#e2e8f0] mb-8 select-none">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-center text-sm font-bold transition-colors ${
                activeTab === 'login'
                  ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-center text-sm font-bold transition-colors ${
                activeTab === 'signup'
                  ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left mb-6">
              <h1 className="text-xl font-bold text-[#0f172a]">
                {activeTab === 'login' ? 'Welcome back' : 'Create an Account'}
              </h1>
              <p className="text-xs text-[#64748b] mt-1 select-none">
                {activeTab === 'login'
                  ? 'Access your AI-powered career architect.'
                  : 'Start building your professional future today.'}
              </p>
            </div>

            {activeTab === 'signup' && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] text-[#64748b] hover:text-[#0f172a]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant={activeTab === 'login' ? 'primary' : 'ai'}
              disabled={loading}
              className="w-full mt-6 flex justify-center items-center gap-2 h-11"
            >
              {loading ? (
                <span>Loading...</span>
              ) : activeTab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </Button>

            {activeTab === 'login' && (
              <div className="space-y-4">
                <div className="relative flex items-center justify-center my-4 select-none">
                  <div className="border-t border-[#e2e8f0] w-full" />
                  <span className="absolute bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                    or
                  </span>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGuest}
                  className="w-full h-11 border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc] bg-transparent"
                >
                  Continue as Guest
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
