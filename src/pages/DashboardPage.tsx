import React, { useEffect, useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Copy, FileText, Download, Calendar, Bolt, CheckCircle, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

interface DashboardPageProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'builder') => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { resumes, fetchResumes, createResume, deleteResume, duplicateResume, loadResume, activeResume } = useResume();
  const { user, isAuthenticated, isGuest } = useAuth();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
  }, [isAuthenticated]);

  const handleCreate = async () => {
    setCreating(true);
    const id = await createResume('My Professional Resume');
    setCreating(false);
    if (id) {
      onNavigate('builder');
    }
  };

  const handleEdit = async (id: string) => {
    await loadResume(id);
    onNavigate('builder');
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-[#0f172a] relative flex flex-col pt-16 select-none text-left">
      {/* Sidebar Panel and Main Content Grid split (desktop styled) */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto flex-1 h-full">
        {/* Decorative Profile card sidebar panel */}
        <aside className="w-full lg:w-72 bg-[#f1f5f9] p-6 space-y-6 lg:border-r border-[#e2e8f0]">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-12 h-12 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center font-bold">
              {isGuest ? 'G' : user?.name[0] || 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{isGuest ? 'Guest Architect' : user?.name}</h3>
              <p className="text-xs text-[#64748b] mt-0.5">{isGuest ? 'Offline Mode' : 'Pro Plan Member'}</p>
            </div>
          </div>
        </aside>

        {/* Dashboard Work Arena */}
        <main className="flex-1 p-6 sm:p-10 space-y-10">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading-lg text-3xl font-extrabold text-[#0f172a] tracking-tight">My Resumes</h1>
              <p className="text-sm text-[#64748b] mt-1 select-none">
                You currently have{' '}
                <span className="font-bold text-[#2563eb]">
                  {isGuest ? '1 guest resume' : `${resumes.length} resume(s)`}
                </span>{' '}
                ready to edit.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1.5 h-11 px-5 shadow-sm active:scale-95 duration-100"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Resume</span>
            </Button>
          </div>

          {/* Grid stack of resumes */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isGuest ? (
              // Offline Guest Resume Card
              <div className="group bg-white rounded-xl border border-[#e2e8f0] shadow-sm select-none p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#f5f3ff] text-[#7c3aed] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {activeResume.meta.templateId.replace('-', ' ')}
                  </div>
                  <CheckCircle className="w-5 h-5 text-[#10b981]" fill="#ecfdf5" />
                </div>
                <h3 className="font-extrabold text-base text-[#0f172a] pr-8 truncate">
                  {activeResume.meta.name || 'Guest Resume'}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-[#64748b] mt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Modified Locally</span>
                </div>

                <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-[#f1f5f9]">
                  <Button
                    variant="primary"
                    onClick={() => onNavigate('builder')}
                    className="flex-1 h-9 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => toast('Export inside editor panel directly!', { icon: '💡' })}
                    className="h-9 px-3 text-[#64748b] bg-[#f1f5f9]"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // User Resumes List
              resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="group bg-white rounded-xl border border-[#e2e8f0] shadow-sm select-none p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#eff6ff] text-[#2563eb] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {resume.templateId ? resume.templateId.replace('-', ' ') : 'Modern sidebar'}
                    </div>
                    {/* Actions menu inline style */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => duplicateResume(resume.id)}
                        title="Duplicate"
                        className="p-1 rounded text-[#64748b] hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        title="Delete"
                        className="p-1 rounded text-[#ef4444] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-[#0f172a] pr-8 truncate">
                    {resume.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-[#64748b] mt-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Edited {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-[#f1f5f9]">
                    <Button
                      variant="primary"
                      onClick={() => handleEdit(resume.id)}
                      className="flex-1 h-9 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(resume.id)}
                      className="h-9 px-3 text-[#64748b] bg-[#f1f5f9]"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            {/* Dash border Empty state Card */}
            <button
              onClick={handleCreate}
              className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#cbd5e1] hover:border-[#2563eb] hover:bg-[#2563eb]/5 rounded-xl cursor-pointer transition-all duration-300 min-h-[174px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] group-hover:text-[#2563eb] group-hover:bg-[#dbeafe] transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <p className="mt-4 font-extrabold text-sm text-[#475569] group-hover:text-[#2563eb] transition-all">
                Create New Resume
              </p>
              <p className="text-xs text-[#94a3b8] mt-1 font-sans select-none">
                Start from a template or import existing details.
              </p>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
