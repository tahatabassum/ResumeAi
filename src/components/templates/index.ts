import ClassicProfessional from './ClassicProfessional';
import ModernMinimal from './ModernMinimal';
import CreativeBold from './CreativeBold';
import TechDark from './TechDark';
import ExecutiveTemplate from './ExecutiveTemplate';
import ElegantSerif from './ElegantSerif';
import StartupFresh from './StartupFresh';
import AcademicFormal from './AcademicFormal';

export {
  ClassicProfessional,
  ModernMinimal,
  CreativeBold,
  TechDark,
  ExecutiveTemplate,
  ElegantSerif,
  StartupFresh,
  AcademicFormal,
};

export const TEMPLATE_LIST = [
  { id: 'classic-professional', name: 'Classic Professional', component: ClassicProfessional, accent: '#1e3a5f' },
  { id: 'modern-sidebar', name: 'Modern Minimal', component: ModernMinimal, accent: '#0d9488' },
  { id: 'creative-bold', name: 'Creative Bold', component: CreativeBold, accent: '#581c87' },
  { id: 'tech-dark', name: 'Tech Dark', component: TechDark, accent: '#4ade80' },
  { id: 'executive', name: 'Executive Bold', component: ExecutiveTemplate, accent: '#d97706' },
  { id: 'elegant-serif', name: 'Elegant Serif', component: ElegantSerif, accent: '#7f1d1d' },
  { id: 'startup-fresh', name: 'Startup Fresh', component: StartupFresh, accent: '#f43f5e' },
  { id: 'academic-formal', name: 'Academic Formal', component: AcademicFormal, accent: '#064e3b' },
];
