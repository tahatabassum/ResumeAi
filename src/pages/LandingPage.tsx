import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { Sparkles, ArrowRight, CheckCircle, ShieldCheck, Zap, Library, Star, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'builder') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { isAuthenticated, isGuest } = useAuth();
  const { createResume } = useResume();
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  const handleCTA = () => {
    if (isAuthenticated || isGuest) {
      onNavigate('dashboard');
    } else {
      onNavigate('auth');
    }
  };

  const allTemplates = [
    {
      id: 'classic-professional',
      name: 'Classic Professional',
      desc: 'Traditional serif feel with Navy status strip. Best for Finance, Corporate, and Legal roles.',
      color: '#1e3a5f',
      accent: 'Navy • Executive',
    },
    {
      id: 'modern-sidebar',
      name: 'Modern Minimal',
      desc: 'High contrast with beautiful Teal vertical details. Clean, organized layout suitable for startups.',
      color: '#0d9488',
      accent: 'Teal • Engineering',
    },
    {
      id: 'creative-bold',
      name: 'Creative Bold',
      desc: 'A vibrant purple sidebar combined with sunny yellow details, highlighting an dynamic profile.',
      color: '#581c87',
      accent: 'Vibrant • Marketing',
    },
    {
      id: 'tech-dark',
      name: 'Tech Dark',
      desc: 'Sleek terminal dark mode with electric green monospace indicators. Highly customized.',
      color: '#4ade80',
      accent: 'Code • Systems',
    },
    {
      id: 'executive',
      name: 'Executive Bold',
      desc: 'Double lines, strong structural geometry, and gold headers. Designed for leaders.',
      color: '#d97706',
      accent: 'Gold • Leadership',
    },
    {
      id: 'elegant-serif',
      name: 'Elegant Serif',
      desc: 'Balanced typography with deep burgundy lines. Sophisticated classic look for seniors.',
      color: '#7f1d1d',
      accent: 'Burgundy • Academic',
    },
    {
      id: 'startup-fresh',
      name: 'Startup Fresh',
      desc: 'Modern layout with a hot coral top banner and bold grid layouts. High visibility.',
      color: '#f43f5e',
      accent: 'Coral • Product/Sales',
    },
    {
      id: 'academic-formal',
      name: 'Academic Formal',
      desc: 'Formal serif layout with deep green dividers. Built for research and publications.',
      color: '#064e3b',
      accent: 'Forest Green • Scholar',
    },
  ];

  const handleSelectTemplate = async (templateId: string) => {
    if (isAuthenticated || isGuest) {
      await createResume('My Professional Resume', templateId);
      onNavigate('builder');
    } else {
      localStorage.setItem('selected_template_id', templateId);
      onNavigate('auth');
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-[#0f172a] font-body-md relative flex flex-col pt-16 select-none">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 overflow-hidden w-full max-w-7xl mx-auto flex-grow">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#eff6ff] px-4 py-1.5 rounded-full border border-[#dbeafe]">
              <Sparkles className="w-4 h-4 text-[#7c3aed]" />
              <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider">
                AI-Powered Career Architect
              </span>
            </div>

            <h1 className="font-heading-lg text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f172a] leading-tight tracking-tight">
              Build Your Perfect <br />
              <span className="text-[#2563eb]">Resume with AI</span>
            </h1>

            <p className="text-[#64748b] text-base sm:text-lg lg:text-xl max-w-xl font-normal leading-relaxed">
              Stand out to recruiters with data-driven AI optimizations and professional templates designed for modern hiring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                variant="primary"
                onClick={handleCTA}
                className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 text-base font-bold shadow-lg"
              >
                <span>Start Building Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium select-none">
              <CheckCircle className="w-4 h-4 text-[#10b981]" fill="#eff6ff" />
              <span>Full guest mode. No credit card required.</span>
            </p>

            {/* Social Proof */}
            <div className="pt-8 border-t border-[#e2e8f0] flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                ].map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Trusted User"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-xs font-semibold">
                <p className="text-[#0f172a]">Trusted by 10,000+ job seekers</p>
                <div className="flex gap-0.5 text-[#f59e0b] mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5" fill="#f59e0b" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Mockup representation */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-[#7c3aed]/10 blur-[80px] rounded-full" />
            <div className="relative bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500 w-full max-w-[440px] select-none">
              <div className="flex items-center gap-1 border-b border-[#e2e8f0] pb-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="mx-auto text-[10px] text-[#94a3b8] font-mono">app.resumeai.com/editor</span>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-[#f1f5f9] rounded w-2/3" />
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#f1f5f9] rounded" />
                    <div className="h-3 bg-[#f1f5f9] rounded w-5/6" />
                  </div>
                  <div className="w-16 h-16 bg-[#e2e8f0] rounded-lg" />
                </div>
                <div className="h-24 bg-[#eff6ff] border border-[#dbeafe] rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#2563eb]">
                    <span>AI Resume Optimization</span>
                    <span>100% Fully Prepared</span>
                  </div>
                  <div className="w-full bg-[#dbeafe] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2563eb] h-full w-[100%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento style features Grid */}
      <section className="bg-white py-20 px-6 border-y border-[#e2e8f0] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className="font-heading-lg text-3xl font-extrabold tracking-tight">
              Engineered For Your Success
            </h2>
            <p className="text-[#64748b] max-w-xl mx-auto text-base">
              Our intelligent platform combines the latest recruitment technology with powerful generative AI to give you a competitive edge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-[#f5f3ff] rounded-lg flex items-center justify-center text-[#7c3aed] mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#0f172a]">AI Bullet Improver</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">
                Transform passive job responsibility summaries into bullet-proof descriptions using robust, model-generated active verb metrics.
              </p>
            </div>

            <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-[#ecfdf5] rounded-lg flex items-center justify-center text-[#10b981] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#0f172a]">Vector PDF Exports</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">
                Export clean, text-selectable, and editable PDF files that preserve visual template layouts perfectly.
              </p>
            </div>

            <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-[#eff6ff] rounded-lg flex items-center justify-center text-[#2563eb] mb-6">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#0f172a]">HR-Approved Templates</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">
                Access a library of 8 meticulously designed, print-consistent templates guaranteed to look professional to hiring managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Preview section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="mb-12">
          <h2 className="font-heading-lg text-3xl font-extrabold text-[#0f172a] tracking-tight">Choose Your Creative Style</h2>
          <p className="text-[#64748b] mt-2">Start with one of our professional, field-tested configurations.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(showAllTemplates ? allTemplates : allTemplates.slice(0, 4)).map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className="group cursor-pointer bg-white border border-[#e2e8f0] hover:border-[#2563eb] hover:shadow-xl rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col text-left"
            >
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#0f172a]">{tmpl.name}</h4>
                  <p className="text-xs text-[#64748b] mt-2 leading-relaxed">{tmpl.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex justify-between items-center text-xs">
                  <span className="font-semibold" style={{ color: tmpl.color }}>
                    {tmpl.accent}
                  </span>
                  <span className="group-hover:translate-x-1 group-hover:text-[#2563eb] transition-transform font-bold inline-flex items-center gap-1">
                    Select <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Option */}
        <div className="mt-12 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => setShowAllTemplates(!showAllTemplates)}
            className="flex items-center gap-1.5 h-11 px-6 font-bold shadow-sm active:scale-95 duration-100"
          >
            <span>{showAllTemplates ? 'Show Less Styles' : 'View More Creative Styles'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAllTemplates ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-8 text-center text-xs text-[#64748b] w-full select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 ResumeAI. Engineered in standard corporate modernism.</p>
          <div className="flex gap-6 font-semibold">
            <span className="hover:text-[#2563eb] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#2563eb] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#2563eb] cursor-pointer">Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
