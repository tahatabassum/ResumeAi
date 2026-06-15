import React, { createContext, useContext, useState, useEffect } from 'react';
import { ResumeData, ResumeMeta, PersonalInfo, SummaryInfo, WorkExperience, Education, Skill, ProjectEntry, CertificationEntry, LanguageEntry } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface ResumeContextType {
  resumes: any[];
  activeResume: ResumeData;
  setActiveResume: React.Dispatch<React.SetStateAction<ResumeData>>;
  loadingResumes: boolean;
  fetchResumes: () => Promise<void>;
  createResume: (name?: string, templateId?: string) => Promise<string | null>;
  loadResume: (id: string) => Promise<void>;
  saveResume: (resumeToSave?: ResumeData) => Promise<boolean>;
  duplicateResume: (id: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  updateMeta: (updates: Partial<ResumeMeta>) => void;
  updatePersonal: (updates: Partial<PersonalInfo>) => void;
  updateSummary: (updates: Partial<SummaryInfo>) => void;
  addExperience: (exp: Omit<WorkExperience, 'id'>) => void;
  updateExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (edu: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  removeSkill: (id: string) => void;
  addProject: (proj: Omit<ProjectEntry, 'id'>) => void;
  updateProject: (id: string, updates: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;
  addCertification: (cert: Omit<CertificationEntry, 'id'>) => void;
  updateCertification: (id: string, updates: Partial<CertificationEntry>) => void;
  removeCertification: (id: string) => void;
  addLanguage: (lang: Omit<LanguageEntry, 'id'>) => void;
  updateLanguage: (id: string, updates: Partial<LanguageEntry>) => void;
  removeLanguage: (id: string) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  resetActiveResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const initialResumeState: ResumeData = {
  meta: {
    id: null,
    name: 'Untitled Resume',
    templateId: 'modern-sidebar',
    skillDisplayMode: 'bars',
    showPhoto: true,
    accentColor: '#2563eb',
    lastSaved: null,
  },
  personal: {
    fullName: '',
    profession: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photo: null,
  },
  summary: {
    text: '',
    tone: 'professional',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
};

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, isGuest } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeData>(initialResumeState);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false);

  // Load from local storage for Guest mode
  useEffect(() => {
    if (isGuest) {
      const guestResume = localStorage.getItem('resume_guest_active_resume');
      const selectedTemplate = localStorage.getItem('selected_template_id');
      if (selectedTemplate) {
        localStorage.removeItem('selected_template_id');
        if (guestResume) {
          try {
            const parsed = JSON.parse(guestResume);
            parsed.meta.templateId = selectedTemplate;
            setActiveResume(parsed);
          } catch (e) {
            console.error('Failed to parse guest resume:', e);
          }
        } else {
          setActiveResume({
            ...initialResumeState,
            meta: { ...initialResumeState.meta, name: 'Guest Resume', templateId: selectedTemplate },
          });
        }
      } else if (guestResume) {
        try {
          setActiveResume(JSON.parse(guestResume));
        } catch (e) {
          console.error('Failed to load guest resume:', e);
        }
      } else {
        setActiveResume({
          ...initialResumeState,
          meta: { ...initialResumeState.meta, name: 'Guest Resume' },
        });
      }
    }
  }, [isGuest]);

  // Sync Guest resume to local storage
  useEffect(() => {
    if (isGuest && activeResume) {
      localStorage.setItem('resume_guest_active_resume', JSON.stringify(activeResume));
    }
  }, [activeResume, isGuest]);

  // Auto-save logic every 30 seconds for logged-in users
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated && activeResume.meta.id) {
      interval = setInterval(() => {
        saveResume();
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeResume, isAuthenticated]);

  const fetchResumes = async () => {
    if (!isAuthenticated) return;
    setLoadingResumes(true);
    try {
      const res = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const createResume = async (name: string = 'Untitled Resume', templateId?: string): Promise<string | null> => {
    const activeTemplate = templateId || localStorage.getItem('selected_template_id') || 'modern-sidebar';
    localStorage.removeItem('selected_template_id');

    const newResumeData: ResumeData = {
      ...initialResumeState,
      meta: {
        ...initialResumeState.meta,
        name,
        templateId: activeTemplate,
      },
    };

    if (isGuest) {
      const id = 'guest-' + Date.now();
      const updated = {
        ...newResumeData,
        meta: { ...newResumeData.meta, id, name, templateId: activeTemplate },
      };
      setActiveResume(updated);
      toast.success('Offline guest resume created!');
      return id;
    }

    if (!isAuthenticated) return null;

    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, data: newResumeData }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Resume created successfully!');
        fetchResumes();
        // Load the newly created resume
        const createdResume = {
          ...data.resume.data,
          meta: {
            ...data.resume.data.meta,
            id: data.resume.id,
            name: data.resume.name,
          },
        };
        setActiveResume(createdResume);
        return data.resume.id;
      }
    } catch (err) {
      console.error('Error creating resume:', err);
      toast.error('Failed to create resume');
    }
    return null;
  };

  // Auto-create resume if template is selected on login/signup
  useEffect(() => {
    if (isAuthenticated) {
      const selectedTemplate = localStorage.getItem('selected_template_id');
      if (selectedTemplate) {
        createResume('My Professional Resume', selectedTemplate);
      } else {
        fetchResumes();
      }
    }
  }, [isAuthenticated]);

  const loadResume = async (id: string) => {
    if (isGuest && id.startsWith('guest-')) {
      return; // Already loaded via guest storage sync
    }
    if (!isAuthenticated) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const loadedData = data.resume.data;
        // Make sure top-level parameters match details and store server ID
        loadedData.meta.id = data.resume.id;
        loadedData.meta.name = data.resume.name;
        setActiveResume(loadedData);
      }
    } catch (err) {
      console.error('Error loading resume:', err);
    }
  };

  const saveResume = async (resumeToSave?: ResumeData): Promise<boolean> => {
    const target = resumeToSave || activeResume;
    if (isGuest) {
      localStorage.setItem('resume_guest_active_resume', JSON.stringify(target));
      setActiveResume({ ...target, meta: { ...target.meta, lastSaved: new Date().toLocaleTimeString() } });
      return true;
    }

    if (!isAuthenticated || !target.meta.id) return false;

    try {
      const res = await fetch(`/api/resumes/${target.meta.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: target.meta.name,
          data: target,
        }),
      });
      if (res.ok) {
        const savedTime = new Date().toLocaleTimeString();
        setActiveResume(prev => ({
          ...prev,
          meta: { ...prev.meta, lastSaved: savedTime },
        }));
        // Silently update list
        const listRes = await fetch('/api/resumes', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          setResumes(listData.resumes);
        }
        return true;
      }
    } catch (err) {
      console.error('Error autosaving/saving resume:', err);
    }
    return false;
  };

  const duplicateResume = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Resume duplicated!');
        fetchResumes();
      }
    } catch (err) {
      console.error('Failed to duplicate resume:', err);
      toast.error('Failed to duplicate');
    }
  };

  const deleteResume = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Resume deleted');
        fetchResumes();
        if (activeResume.meta.id === id) {
          resetActiveResume();
        }
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
      toast.error('Failed to delete');
    }
  };

  const resetActiveResume = () => {
    setActiveResume(initialResumeState);
  };

  // Editor Actions
  const updateMeta = (updates: Partial<ResumeMeta>) => {
    setActiveResume((prev) => ({
      ...prev,
      meta: { ...prev.meta, ...updates } as ResumeMeta,
    }));
  };

  const updatePersonal = (updates: Partial<PersonalInfo>) => {
    setActiveResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...updates },
    }));
  };

  const updateSummary = (updates: Partial<SummaryInfo>) => {
    setActiveResume((prev) => ({
      ...prev,
      summary: { ...prev.summary, ...updates } as SummaryInfo,
    }));
  };

  const addExperience = (exp: Omit<WorkExperience, 'id'>) => {
    const newExp: WorkExperience = {
      ...exp,
      id: Math.random().toString(36).substr(2, 9),
    };
    setActiveResume((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    setActiveResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setActiveResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const addEducation = (edu: Omit<Education, 'id'>) => {
    const newEdu: Education = {
      ...edu,
      id: Math.random().toString(36).substr(2, 9),
    };
    setActiveResume((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setActiveResume((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setActiveResume((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const addSkill = (skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Math.random().toString(36).substr(2, 9),
    };
    // Don't add duplicate names
    if (activeResume.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
      return;
    }
    setActiveResume((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const removeSkill = (id: string) => {
    setActiveResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item.id !== id),
    }));
  };

  const addProject = (proj: Omit<ProjectEntry, 'id'>) => {
    const newProj: ProjectEntry = {
      ...proj,
      id: Math.random().toString(36).substr(2, 9),
    };
    setActiveResume((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  };

  const updateProject = (id: string, updates: Partial<ProjectEntry>) => {
    setActiveResume((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeProject = (id: string) => {
    setActiveResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  const addCertification = (cert: Omit<CertificationEntry, 'id'>) => {
    const newCert: CertificationEntry = {
      ...cert,
      id: Math.random().toString(36).substr(2, 9),
    };
    setActiveResume((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  };

  const updateCertification = (id: string, updates: Partial<CertificationEntry>) => {
    setActiveResume((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeCertification = (id: string) => {
    setActiveResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id),
    }));
  };

  const addLanguage = (lang: Omit<LanguageEntry, 'id'>) => {
    const newLang: LanguageEntry = {
      ...lang,
      id: Math.random().toString(36).substr(2, 9),
    };
    setActiveResume((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  };

  const updateLanguage = (id: string, updates: Partial<LanguageEntry>) => {
    setActiveResume((prev) => ({
      ...prev,
      languages: prev.languages.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeLanguage = (id: string) => {
    setActiveResume((prev) => ({
      ...prev,
      languages: prev.languages.filter((item) => item.id !== id),
    }));
  };

  const addInterest = (interest: string) => {
    if (activeResume.interests.includes(interest)) return;
    setActiveResume((prev) => ({
      ...prev,
      interests: [...prev.interests, interest],
    }));
  };

  const removeInterest = (interest: string) => {
    setActiveResume((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item !== interest),
    }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        activeResume,
        setActiveResume,
        loadingResumes,
        fetchResumes,
        createResume,
        loadResume,
        saveResume,
        duplicateResume,
        deleteResume,
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
        resetActiveResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume context error');
  }
  return context;
}
