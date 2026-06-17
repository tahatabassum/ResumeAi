import React, { useState, useEffect, useRef } from 'react';
import { useResume, initialResumeState } from '../context/ResumeContext';
import { TEMPLATE_LIST } from '../components/templates';
import SkillAutocomplete from '../components/ui/SkillAutocomplete';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Trash2,
  PlusCircle,
  Eye,
  Edit2,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Briefcase,
  User,
  Heart,
  Globe,
  Settings,
  X,
  RefreshCw,
  FolderDot,
  FileText,
  CheckCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface BuilderPageProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'builder') => void;
}

export default function BuilderPage({ onNavigate }: BuilderPageProps) {
  const {
    activeResume,
    updateMeta,
    updatePersonal,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    updateCertification,
    removeCertification,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addInterest,
    removeInterest,
    saveResume,
  } = useResume();

  // Builder Page display options
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');

  // AI scoring loading states
  const [generatingSummary, setCreatingSummary] = useState(false);
  const [improvingBullets, setImprovingBullets] = useState<string | null>(null);
  const [improvingProject, setImprovingProject] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Resize logic for responsive live preview
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const parentWidth = previewContainerRef.current.clientWidth;
      const padding = window.innerWidth < 640 ? 16 : 32;
      const targetWidth = parentWidth - padding;
      if (targetWidth < 794) {
        setPreviewScale(Math.max(0.35, targetWidth / 794));
      } else {
        setPreviewScale(1);
      }
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }

    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [mobileTab]);


  // Local text state for tech stack inputs (keyed by project id)
  // Allows typing freely without re-splitting on every keystroke
  const [techStackInputs, setTechStackInputs] = useState<Record<string, string>>({});

  // Sync local text state when a project is first seen
  const getTechStackText = (proj: { id: string; techStack?: string[] }) => {
    if (proj.id in techStackInputs) return techStackInputs[proj.id];
    return proj.techStack ? proj.techStack.join(', ') : '';
  };

  const handleTechStackChange = (projId: string, value: string) => {
    setTechStackInputs(prev => ({ ...prev, [projId]: value }));
  };

  const handleTechStackBlur = (projId: string, value: string) => {
    const parsed = value.split(',').map(s => s.trim()).filter(Boolean);
    updateProject(projId, { techStack: parsed });
    // Re-normalize the display text
    setTechStackInputs(prev => ({ ...prev, [projId]: parsed.join(', ') }));
  };

  // Reusable Accordion Toggle
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Convert uploaded image to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updatePersonal({ photo: reader.result as string });
      toast.success('Profile photo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Client-Side PDF Export (Print to PDF Guide Modal)
  const exportPDFRef = useRef<HTMLDivElement>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const handleExportPDF = async () => {
    if (!exportPDFRef.current) return;
    setExportingPdf(true);
    const loadingToast = toast.loading('Preparing document for print...', { style: { borderLeft: '4px solid #2563eb' } });
    
    try {
      // Save current changes first
      await saveResume();
      toast.dismiss(loadingToast);

      // Open the print instructions modal helper
      setShowPrintModal(true);
    } catch (e) {
      console.error('PDF export failed:', e);
      toast.dismiss(loadingToast);
      toast.error('Failed to export PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const triggerSystemPrint = () => {
    setShowPrintModal(false);
    // Dismiss all active toasts immediately to ensure they do not show in the print preview
    toast.dismiss();
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Server-Side DOCX Export
  const handleExportDOCX = async () => {
    setExportingDocx(true);
    const loadingToast = toast.loading('Generating Word document...', { style: { borderLeft: '4px solid #d97706' } });

    try {
      await saveResume();
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeResume),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeResume.personal.fullName || 'Resume'}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.dismiss(loadingToast);
        toast.success('Word document downloaded!');
      } else {
        throw new Error('Export service failure');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error('Failed to export Word file.');
    } finally {
      setExportingDocx(false);
    }
  };

  // AI Summary Generator Call
  const handleAiSummary = async () => {
    setCreatingSummary(true);
    const loadingToast = toast.loading('AI generating summary...', { style: { borderLeft: '4px solid #7c3aed' } });
    
    try {
      const res = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeResume.personal.fullName || 'Professional User',
          profession: activeResume.personal.profession || 'Specialist',
          skills: activeResume.skills.map((s) => s.name),
          experience: activeResume.experience,
          tone: activeResume.summary.tone || 'professional',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateSummary({ text: data.summary });
        toast.dismiss(loadingToast);
        toast.success('Professional Summary created!');
      } else {
        throw new Error('Summary Generation Failed');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error('GenAISummary failed. Verify API Key settings.');
    } finally {
      setCreatingSummary(false);
    }
  };

  // AI Experience Bullets Improver
  const handleAiBullets = async (expId: string) => {
    const exp = activeResume.experience.find((e) => e.id === expId);
    if (!exp || !exp.description) {
      toast.error('Please details raw description text first!');
      return;
    }

    setImprovingBullets(expId);
    const loadingToast = toast.loading('AI polishing experience metrics...', { style: { borderLeft: '4px solid #7c3aed' } });

    try {
      const res = await fetch('/api/ai/improve-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: exp.jobTitle,
          company: exp.company,
          raw_description: exp.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const draftedText = data.bullets.map((b: string) => `• ${b}`).join('\n');
        updateExperience(expId, { description: draftedText });
        toast.dismiss(loadingToast);
        toast.success('Improved bullets applied!');
      } else {
        throw new Error('Bullets Improvement Failed');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error('Failed to improve achievements bullets.');
    } finally {
      setImprovingBullets(null);
    }
  };

  // AI Project Description Improver
  const handleAiProject = async (projId: string) => {
    const proj = activeResume.projects.find((p) => p.id === projId);
    if (!proj || !proj.description) {
      toast.error('Please enter project description first!');
      return;
    }

    setImprovingProject(projId);
    const loadingToast = toast.loading('AI framing project highlights...', { style: { borderLeft: '4px solid #7c3aed' } });

    try {
      const res = await fetch('/api/ai/improve-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: proj.name,
          tech_stack: proj.techStack,
          raw_description: proj.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateProject(projId, { description: data.description });
        toast.dismiss(loadingToast);
        toast.success('AI description matching updated!');
      } else {
        throw new Error('Project optimization failed');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate project improvements.');
    } finally {
      setImprovingProject(null);
    }
  };



  // Quick offline skill proficiency selector helpers
  const [skillInputLevel, setSkillInputLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  // Current selected template component reference
  const currentTemplateObj = TEMPLATE_LIST.find((t) => t.id === activeResume.meta.templateId) || TEMPLATE_LIST[0];
  const ActiveTemplateComponent = currentTemplateObj.component;

  return (
    <div className="bg-[#f8fafc] min-h-screen text-[#0f172a] font-sans flex flex-col pt-16 select-none select-none text-left">
      
      {/* Top Template strip + active resume headers */}
      <header className="bg-white border-b border-[#e2e8f0] pb-2 pt-2 px-6 shadow-sm z-30 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-[#64748b] hover:text-[#0f172a]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <input
                type="text"
                value={activeResume.meta.name}
                onChange={(e) => updateMeta({ name: e.target.value })}
                className="font-bold text-lg select-all bg-transparent border-none focus:ring-0 p-0 text-[#2563eb] max-w-[280px]"
              />
              <span className="text-[10px] text-[#64748b] select-none flex items-center gap-1.5 font-semibold mt-0.5">
                Saved locally {activeResume.meta.lastSaved && `at ${activeResume.meta.lastSaved}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <Button
              variant="ai"
              onClick={handleAiSummary}
              disabled={generatingSummary}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white" fill="white" />
              <span>✨ AI Summary</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportDOCX}
              disabled={exportingDocx}
              className="flex items-center gap-1.5 h-9 px-4 text-xs border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9] bg-transparent"
            >
              <Download className="w-4 h-4" />
              <span>Word Docx</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 h-9 px-4 text-xs shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* 8 Template Horizontal Switcher Row under Geometric Balance */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-2 border-t border-[#f1f5f9] pt-2.5 w-full overflow-hidden">
          <div className="flex items-center gap-2 w-full min-w-0 overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider shrink-0 select-none">
              Design Token Switcher:
            </span>
            <div className="flex items-center gap-2 bg-[#f1f5f9] p-1 rounded-lg overflow-x-auto w-full no-scrollbar">
              {TEMPLATE_LIST.map((tmpl) => {
                const isSelected = activeResume.meta.templateId === tmpl.id;
                
                // Get 3 letter abbreviation
                let abbreviation = "TMP";
                if (tmpl.id === 'classic-professional') abbreviation = 'CLA';
                else if (tmpl.id === 'modern-sidebar') abbreviation = 'MOD';
                else if (tmpl.id === 'creative-bold') abbreviation = 'CRE';
                else if (tmpl.id === 'tech-dark') abbreviation = 'DRK';
                else if (tmpl.id === 'executive') abbreviation = 'EXE';
                else if (tmpl.id === 'elegant-serif') abbreviation = 'SER';
                else if (tmpl.id === 'startup-fresh') abbreviation = 'STU';
                else if (tmpl.id === 'academic-formal') abbreviation = 'ACA';

                // Custom color block styles
                let blockStyle = "bg-white border text-[#2563eb] border-neutral-200";
                if (tmpl.id === 'classic-professional') blockStyle = "bg-[#1e3a5f] text-white";
                else if (tmpl.id === 'creative-bold') blockStyle = "bg-[#581c87] text-white";
                else if (tmpl.id === 'tech-dark') blockStyle = "bg-[#1a1a2e] border border-[#4ade80] text-[#4ade80]";
                else if (tmpl.id === 'executive') blockStyle = "bg-[#d97706] text-white";
                else if (tmpl.id === 'elegant-serif') blockStyle = "bg-[#7f1d1d] text-white";
                else if (tmpl.id === 'startup-fresh') blockStyle = "bg-[#f43f5e] text-white";
                else if (tmpl.id === 'academic-formal') blockStyle = "bg-[#064e3b] text-white";

                return (
                  <button
                    key={tmpl.id}
                    title={tmpl.name}
                    onClick={() => {
                      updateMeta({ templateId: tmpl.id });
                      toast.success(`Active Template: ${tmpl.name}`);
                    }}
                    className={`w-12 h-10 shrink-0 rounded flex items-center justify-center cursor-pointer transition-all relative overflow-hidden select-none hover:scale-105 active:scale-95 ${blockStyle} ${
                      isSelected
                        ? 'ring-2 ring-[#2563eb] ring-offset-1 scale-105 shadow-md font-black opacity-100 z-10'
                        : 'opacity-50 hover:opacity-90 hover:ring-2 hover:ring-[#e2e8f0]'
                    }`}
                  >
                    {tmpl.id === 'modern-sidebar' && (
                      <div className="bg-[#2563eb] w-2 h-full absolute left-0" />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-widest">{abbreviation}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Responsive mobile Tab switches edit/preview */}
      <div className="md:hidden flex bg-white border-b border-[#e2e8f0] sticky top-16 z-30 select-none font-semibold text-xs text-center">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-3 text-center transition-colors border-b-2 ${
            mobileTab === 'edit' ? 'text-[#2563eb] border-[#2563eb] font-bold' : 'text-[#64748b] border-transparent'
          }`}
        >
          Edit Sections
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-center transition-colors border-b-2 ${
            mobileTab === 'preview' ? 'text-[#2563eb] border-[#2563eb] font-bold' : 'text-[#64748b] border-transparent'
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* Main interactive split Arena */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE PANELS (Show on Desktop, or when Mobile Tab === edit) */}
        <section
          className={`w-full md:w-[45%] bg-white border-r border-[#e2e8f0] flex flex-col overflow-y-auto min-h-0 select-none ${
            mobileTab === 'edit' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="p-6 space-y-4 max-w-2xl mx-auto w-full">
            
            {/* Accordion Block 1: Personal info */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('personal')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">1. Personal Information</span>
                </div>
                {expandedSection === 'personal' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>
              
              {expandedSection === 'personal' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  {/* Image base64 circular uploader */}
                  <div className="flex items-center gap-4">
                    <div className="relative group w-16 h-16 rounded-full overflow-hidden border border-[#cbd5e1] bg-[#f8fafc] flex items-center justify-center shrink-0 shadow-inner select-none">
                      {activeResume.personal.photo ? (
                        <img
                          src={activeResume.personal.photo}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-[#94a3b8]" />
                      )}
                      <label className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold cursor-pointer transition-opacity select-none">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0f172a]">Circular Profile Photo</h4>
                      <p className="text-[10px] text-[#64748b] mt-0.5 select-none">Click profile circle to select JPG/PNG, Max 2MB.</p>
                      {activeResume.personal.photo && (
                        <button
                          onClick={() => updatePersonal({ photo: null })}
                          className="text-[10px] text-[#ef4444] font-bold hover:underline mt-1 cursor-pointer block"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={activeResume.personal.fullName}
                      onChange={(e) => updatePersonal({ fullName: e.target.value })}
                    />
                    <Input
                      label="Job Profession / Title"
                      placeholder="e.g. Senior Software Engineer"
                      value={activeResume.personal.profession}
                      onChange={(e) => updatePersonal({ profession: e.target.value })}
                    />
                    <Input
                      label="Email Address"
                      placeholder="john.doe@company.com"
                      value={activeResume.personal.email}
                      onChange={(e) => updatePersonal({ email: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      placeholder="+1 (555) 123-4567"
                      value={activeResume.personal.phone}
                      onChange={(e) => updatePersonal({ phone: e.target.value })}
                    />
                    <Input
                      label="Location (City, Country)"
                      placeholder="San Francisco, CA"
                      value={activeResume.personal.location}
                      onChange={(e) => updatePersonal({ location: e.target.value })}
                    />
                    <Input
                      label="LinkedIn Username"
                      placeholder="john-doe-123"
                      value={activeResume.personal.linkedin}
                      onChange={(e) => updatePersonal({ linkedin: e.target.value })}
                    />
                    <Input
                      label="GitHub Namespace ID"
                      placeholder="johndoe"
                      value={activeResume.personal.github}
                      onChange={(e) => updatePersonal({ github: e.target.value })}
                    />
                    <Input
                      label="Portfolio Website Link"
                      placeholder="https://johndoe.com"
                      value={activeResume.personal.portfolio}
                      onChange={(e) => updatePersonal({ portfolio: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Block 2: Professional Summary */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('summary')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">2. Professional Summary</span>
                </div>
                {expandedSection === 'summary' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'summary' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  <Textarea
                    label="Summary text"
                    placeholder="Describe your corporate narrative highlights here..."
                    rows={4}
                    value={activeResume.summary.text}
                    onChange={(e) => updateSummary({ text: e.target.value })}
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-[#64748b] select-none font-medium">
                      Character check count: {activeResume.summary.text?.length || 0} (Aim for 150-300 characters)
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={activeResume.summary.tone}
                        onChange={(e: any) => updateSummary({ tone: e.target.value })}
                        className="h-8 border border-[#e2e8f0] rounded text-xs select-none pr-7 text-[#475569] py-0 font-medium"
                      >
                        <option value="professional">Professional Tone</option>
                        <option value="friendly">Friendly Tone</option>
                        <option value="confident">Confident Tone</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Block 3: Work Experience list */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('experience')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">3. Work Experience</span>
                </div>
                {expandedSection === 'experience' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'experience' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-6 text-left">
                  {activeResume.experience.map((exp) => (
                    <div key={exp.id} className="relative bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3">
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute right-3 top-3 text-[#cbd5e1] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <Input
                          label="Job Title"
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })}
                        />
                        <Input
                          label="Company Name"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        />
                        <Input
                          label="Location"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-1.5 items-end">
                          <Input
                            label="Start Date"
                            placeholder="Jan 2020"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          />
                          {!exp.current && (
                            <Input
                              label="End Date"
                              placeholder="Dec 2023"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 select-none">
                        <input
                          type="checkbox"
                          id={`current-job-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                          className="rounded text-[#2563eb]"
                        />
                        <label htmlFor={`current-job-${exp.id}`} className="text-xs font-semibold text-[#64748b] select-none">
                          Currently Working Here
                        </label>
                      </div>

                      <Textarea
                        label="Description Bullet Points"
                        placeholder="Polished accomplishments text. AI bullets can suggest layout templates."
                        rows={3}
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ai"
                          onClick={() => handleAiBullets(exp.id)}
                          disabled={improvingBullets === exp.id}
                          className="h-8 px-3 text-[11px] font-bold mt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ AI Improve Bullets</span>
                        </Button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      addExperience({
                        jobTitle: '',
                        company: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        current: false,
                        description: '',
                      })
                    }
                    className="w-full h-11 border-2 border-dashed border-[#e2e8f0] hover:border-[#2563eb] rounded-xl text-xs font-bold text-[#64748b] hover:text-[#2563eb] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Experience Entry</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion Block 4: Education listings */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('education')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">4. Education Credentials</span>
                </div>
                {expandedSection === 'education' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'education' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  {activeResume.education.map((edu) => (
                    <div key={edu.id} className="relative bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute right-3 top-3 text-[#cbd5e1] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <Input
                          label="Degree Name"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                        />
                        <Input
                          label="Institution Name"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        />
                        <Input
                          label="Institution Location"
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                        />
                        <Input
                          label="Academic GPA (Optional)"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                        />
                        <Input
                          label="Enrollment Start Year"
                          value={edu.startYear}
                          onChange={(e) => updateEducation(edu.id, { startYear: e.target.value })}
                        />
                        <Input
                          label="Graduation Year"
                          value={edu.endYear}
                          onChange={(e) => updateEducation(edu.id, { endYear: e.target.value })}
                        />
                      </div>
                      <Textarea
                        label="Collegiate Achievements (Optional)"
                        rows={2}
                        value={edu.achievements}
                        onChange={(e) => updateEducation(edu.id, { achievements: e.target.value })}
                        placeholder="Dean's list honors, top of department matches."
                      />
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      addEducation({
                        degree: '',
                        institution: '',
                        location: '',
                        startYear: '',
                        endYear: '',
                        gpa: '',
                        achievements: '',
                        current: false,
                      })
                    }
                    className="w-full h-11 border-2 border-dashed border-[#e2e8f0] hover:border-[#2563eb] rounded-xl text-xs font-bold text-[#64748b] hover:text-[#2563eb] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Education Entry</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion Block 5: Skills chips autocomplete */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('skills')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">5. Competency Skills</span>
                </div>
                {expandedSection === 'skills' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'skills' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#64748b]">Skill Level For Additions</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSkillInputLevel(lvl)}
                          className={`px-3 py-1 border rounded-full text-xs font-semibold select-none cursor-pointer capitalize ${
                            skillInputLevel === lvl
                              ? 'border-[#2563eb] bg-[#eff6ff] text-[#2563eb]'
                              : 'border-[#cbd5e1] text-[#475569]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SkillAutocomplete
                    onSelectSkill={(skill) => {
                      addSkill({
                        name: skill.name,
                        level: skillInputLevel,
                        category: skill.category,
                      });
                      toast.success(`Skill added: ${skill.name}`);
                    }}
                  />

                  {/* Skills Chip List representation matching guidelines */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeResume.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe] px-3 py-1 rounded-full text-xs font-semibold select-none shrink-0"
                      >
                        <span>{skill.name}</span>
                        <span className="text-[10px] text-[#64748b] bg-white border border-[#e2e8f0] px-1.5 py-0.5 rounded-full capitalize">
                          {skill.level}
                        </span>
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="text-[#64748b] hover:text-[#ef4444] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Skills Level visual display mode selection */}
                  <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between select-none">
                    <span className="text-xs font-bold text-[#475569]">Skills Display Scheme</span>
                    <div className="flex bg-[#f1f5f9] p-1 rounded-lg">
                      {(['bars', 'stars', 'dots'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateMeta({ skillDisplayMode: mode })}
                          className={`px-2.5 py-1 rounded text-xs select-all capitalize font-semibold cursor-pointer ${
                            activeResume.meta.skillDisplayMode === mode ? 'bg-white shadow-sm font-bold text-[#0f172a]' : 'text-[#64748b]'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Block 6: Key Projects */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('projects')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <FolderDot className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">6. Product Builds & Projects</span>
                </div>
                {expandedSection === 'projects' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'projects' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  {activeResume.projects.map((proj) => (
                    <div key={proj.id} className="relative bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3">
                      <button
                        onClick={() => removeProject(proj.id)}
                        className="absolute right-3 top-3 text-[#cbd5e1] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <Input
                          label="Project Name"
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                        />
                        <div className="flex flex-col gap-1 w-full text-left">
                          <label className="text-xs font-semibold text-[#64748b]">Project Type</label>
                          <select
                            value={proj.type}
                            onChange={(e: any) => updateProject(proj.id, { type: e.target.value })}
                            className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-md text-xs font-semibold pr-7 text-[#0f172a]"
                          >
                            <option value="personal">Personal Project</option>
                            <option value="academic">Academic Project</option>
                            <option value="freelance">Freelance Build</option>
                            <option value="open-source">Open Source</option>
                            <option value="hackathon">Hackathon Project</option>
                          </select>
                        </div>
                        <Input
                          label="Live Demo Link (Optional)"
                          placeholder="e.g. https://myproject.com"
                          value={proj.liveUrl || ''}
                          onChange={(e) => updateProject(proj.id, { liveUrl: e.target.value })}
                        />
                        <Input
                          label="Source Code Link (Optional)"
                          placeholder="e.g. https://github.com/user/project"
                          value={proj.sourceUrl || ''}
                          onChange={(e) => updateProject(proj.id, { sourceUrl: e.target.value })}
                        />
                        <div className="col-span-2">
                          <Input
                            label="Tech Stack (comma-separated)"
                            placeholder="e.g. React, TypeScript, Node.js"
                            value={getTechStackText(proj)}
                            onChange={(e) => handleTechStackChange(proj.id, e.target.value)}
                            onBlur={(e) => handleTechStackBlur(proj.id, e.target.value)}
                          />
                        </div>
                      </div>

                      <Textarea
                        label="Project Summary description"
                        placeholder="Polished description."
                        rows={2}
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ai"
                          onClick={() => handleAiProject(proj.id)}
                          disabled={improvingProject === proj.id}
                          className="h-8 px-3 text-[11px] font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ Improve Description</span>
                        </Button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      addProject({
                        name: '',
                        type: 'personal',
                        description: '',
                        techStack: [],
                        liveUrl: '',
                        sourceUrl: '',
                      })
                    }
                    className="w-full h-11 border-2 border-dashed border-[#e2e8f0] hover:border-[#2563eb] rounded-xl text-xs font-bold text-[#64748b] hover:text-[#2563eb] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Project Entry</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion Block 7: Certifications */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('certifications')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">7. Certifications</span>
                </div>
                {expandedSection === 'certifications' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'certifications' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  {activeResume.certifications.map((cert) => (
                    <div key={cert.id} className="relative bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3">
                      <button
                        onClick={() => removeCertification(cert.id)}
                        className="absolute right-3 top-3 text-[#cbd5e1] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <Input
                          label="Certification Name"
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                        />
                        <Input
                          label="Issuing Organization"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                        />
                        <Input
                          label="Date Issued"
                          value={cert.date}
                          onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                        />
                        <Input
                          label="Credential Link"
                          value={cert.url}
                          onChange={(e) => updateCertification(cert.id, { url: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addCertification({ name: '', issuer: '', date: '', url: '' })}
                    className="w-full h-11 border-2 border-dashed border-[#e2e8f0] hover:border-[#2563eb] rounded-xl text-xs font-bold text-[#64748b] hover:text-[#2563eb] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Certification Entry</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion Block 8: Languages */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('languages')}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors font-sans text-left"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#2563eb]" />
                  <span className="font-bold text-sm text-[#0f172a]">8. Languages Spoken</span>
                </div>
                {expandedSection === 'languages' ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                )}
              </button>

              {expandedSection === 'languages' && (
                <div className="p-5 border-t border-[#e2e8f0] space-y-4 text-left">
                  {activeResume.languages.map((lang) => (
                    <div key={lang.id} className="relative bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 gap-3 flex items-center">
                      <button
                        onClick={() => removeLanguage(lang.id)}
                        className="absolute right-3 top-3 text-[#cbd5e1] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-left w-[85%]">
                        <Input
                          label="Language"
                          value={lang.language}
                          onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                        />
                        <div className="flex flex-col gap-1 w-full text-left">
                          <label className="text-xs font-semibold text-[#64748b]">Proficiency</label>
                          <select
                            value={lang.proficiency}
                            onChange={(e: any) => updateLanguage(lang.id, { proficiency: e.target.value })}
                            className="w-full h-10 px-3 bg-white border border-[#e2e8f0] rounded-md text-xs font-semibold pr-7 text-[#0f172a]"
                          >
                            <option value="native">Native / Bilingual</option>
                            <option value="fluent">Professional Fluent</option>
                            <option value="intermediate">Conversational</option>
                            <option value="basic">Elementary / Basic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addLanguage({ language: '', proficiency: 'intermediate' })}
                    className="w-full h-11 border-2 border-dashed border-[#e2e8f0] hover:border-[#2563eb] rounded-xl text-xs font-bold text-[#64748b] hover:text-[#2563eb] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Language Entry</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT PREVIEW PANEL (A4 Paper Resume displaying in real-time) */}
        <section
          ref={previewContainerRef}
          className={`flex-1 bg-slate-100 flex-col items-center p-6 sm:p-10 overflow-y-auto select-none relative ${
            mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Floater live indicator */}
          <div className="sticky top-0 self-start z-10 flex gap-2">
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 text-[10px] font-bold text-[#475569] shadow-sm select-none">
              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping" />
              <span>Interactive Live Preview</span>
            </span>
          </div>

          {/* Centered paper container representing A4 dimensions scaled dynamically without layout box clipping */}
          <div 
            id="resume-preview-wrapper"
            style={{ 
              width: `${794 * previewScale}px`,
              height: `${1123 * previewScale}px` 
            }}
            className="my-6 shadow-2xl bg-white flex flex-col shrink-0 relative overflow-hidden select-none"
          >
            <div 
              id="resume-preview-inner"
              style={{ 
                transform: `scale(${previewScale})`, 
                transformOrigin: 'top left',
                width: '794px',
                height: '1123px',
                position: 'absolute',
                left: 0,
                top: 0,
              }}
              className="flex flex-col"
            >
              <div ref={exportPDFRef} id="resume-print-container" className="flex-1 flex flex-col">
                <ActiveTemplateComponent data={activeResume} />
              </div>
            </div>
          </div>
        </section>
      </div>



      {/* Screen 6: Print / PDF Guide Modal overlay */}
      {showPrintModal && (
        <div id="print-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 select-none text-left transition-all duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#cbd5e1]/45 scale-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <header className="flex justify-between items-center px-6 py-4.5 border-b border-[#e2e8f0] bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                  <Sparkles className="w-5 h-5" fill="#2563eb" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wider font-sans">
                    Export Vector PDF
                  </h2>
                  <p className="text-[10px] font-bold text-[#64748b]">
                    Follow settings to get a high-quality editable resume
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200/60 text-[#64748b] hover:text-[#0f172a] transition-all cursor-pointer"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Content */}
            <div className="p-6 space-y-4 font-sans">
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                To download your resume as a text-selectable, vector PDF that can be edited later, adjust these settings in the browser print window:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center font-bold text-xs text-[#2563eb] shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Set Destination to PDF</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Select <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong> as your destination instead of a physical printer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center font-bold text-xs text-[#2563eb] shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Enable Background Graphics</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Click <strong>"More settings"</strong>, scroll down, and turn <strong>ON</strong> <strong>"Background graphics"</strong> to display all background colors and styling.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center font-bold text-xs text-[#2563eb] shrink-0">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Set Margins to None</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Change Margins to <strong>"None"</strong> or <strong>"Default"</strong> to align the resume page perfectly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="px-6 py-4 border-t border-[#e2e8f0] bg-slate-50/50 flex justify-end gap-3 select-none">
              <Button
                variant="ghost"
                onClick={() => setShowPrintModal(false)}
                className="text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={triggerSystemPrint}
                className="text-xs h-9 px-5.5 cursor-pointer font-bold"
              >
                Open Print Window
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
